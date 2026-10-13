<script setup lang="ts">
// 7장 실험실 — 로지스틱(S자) 성장: 가입 = r·S·(1 − S/K). 강화 루프(입소문)와 균형 루프(남은 여지)가 만난다.
// 정확한 답 S(t) = K / (1 + (K − S₀)/S₀ · e^(−rt)) = K·σ(r(t − t*)) 로 그린다(시그모이드, 2부 7장).
// 변곡점 t* = ln((K − S₀)/S₀)/r 에서 사용자 = K/2, 가입 속도 최대 = rK/4. 노트북 ch07_scurve.ipynb 와 동일.
import { computed, ref } from 'vue'
import TimePlot from './TimePlot.vue'
import CldDiagram from './CldDiagram.vue'
import { fmt } from '@/data/plot'

const S0 = 10
const T = 36
const r = ref(0.5)
const K = ref(1000)
const showExp = ref(false)

const tStar = computed(() => Math.log((K.value - S0) / S0) / r.value)
const S = (t: number) => K.value / (1 + ((K.value - S0) / S0) * Math.exp(-r.value * t))
const inflow = (t: number) => r.value * S(t) * (1 - S(t) / K.value)
const ts = Array.from({ length: 145 }, (_, i) => i * 0.25)

const stockSeries = computed(() => {
  const s: { label: string; color: string; points: [number, number][]; width?: number; dashed?: boolean }[] = [
    { label: '사용자 수', color: 'var(--c-emerald-600)', points: ts.map((t) => [t, S(t)] as [number, number]), width: 3 },
  ]
  if (showExp.value)
    s.push({ label: '처음 기세대로 지수 성장한다면', color: 'var(--c-rose-500)', points: ts.map((t) => [t, S0 * Math.exp(r.value * t)] as [number, number]), dashed: true, width: 2 })
  return s
})
const flowSeries = computed(() => [
  { label: '가입 속도(유입)', color: 'var(--c-indigo-600)', points: ts.map((t) => [t, inflow(t)] as [number, number]), width: 2.5 },
])
const maxInflow = computed(() => (r.value * K.value) / 4)
const markers = computed(() => (tStar.value <= T ? [{ x: tStar.value, label: `변곡점 ${tStar.value.toFixed(1)}개월`, color: 'var(--c-amber-600)' }] : []))
const now = ref(4)
const dominant = computed(() => (now.value < tStar.value ? 'R' : 'B'))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 · 직원 수가 정해진 회사에서 입소문이 퍼질 때</p>
    <p class="mb-3 text-xs text-slate-500">
      처음 사용자 10명. 가입 = r × 사용자 수 × (1 − 사용자 수 ÷ K). 사용자가 많을수록 입소문이 많고(강화),
      아직 안 쓰는 직원이 적을수록 데려올 사람이 적어요(균형). K는 데려올 수 있는 최대 인원(수용 한계)입니다.
    </p>
    <div class="grid items-center gap-3 md:grid-cols-[2fr_3fr]">
      <div class="min-w-0 rounded-lg bg-slate-50 p-2">
        <CldDiagram
          :nodes="[
            { id: 'u', label: '사용자 수', x: 150, y: 170, stock: true },
            { id: 'g', label: '신규 가입', x: 150, y: 36 },
            { id: 'room', label: '남은 여지', x: 270, y: 103 },
          ]"
          :links="[
            { from: 'g', to: 'u', sign: '+', hi: dominant === 'R' },
            { from: 'u', to: 'g', sign: '+', bend: -0.75, hi: dominant === 'R' },
            { from: 'u', to: 'room', sign: '−', bend: 0.12, hi: dominant === 'B' },
            { from: 'room', to: 'g', sign: '+', bend: 0.12, hi: dominant === 'B' },
          ]"
          :loops="[
            { x: 125, y: 103, type: 'R', label: '입소문' },
            { x: 198, y: 103, type: 'B', label: '포화' },
          ]"
          :width="320"
          :height="205"
          aria-label="사용자 수가 신규 가입을 늘리는 강화 루프와 남은 여지를 줄여 가입을 줄이는 균형 루프"
        />
        <label class="mt-1 block px-1 text-xs text-slate-500">
          지금 {{ now }}개월 — 굵은 화살표가 이기는 고리:
          <b :class="dominant === 'R' ? 'text-rose-700' : 'text-blue-700'">{{ dominant === 'R' ? '강화 루프(입소문)' : '균형 루프(포화)' }}</b>
          <input v-model.number="now" type="range" min="0" max="36" step="1" class="mt-1 w-full accent-amber-600" />
        </label>
      </div>
      <div class="min-w-0 space-y-2">
        <label class="block text-xs text-slate-500">
          성장률 r = <b class="text-slate-700">{{ r.toFixed(2) }}/월</b>
          <input v-model.number="r" type="range" min="0.2" max="1" step="0.05" class="mt-1 w-full accent-rose-600" />
        </label>
        <label class="block text-xs text-slate-500">
          수용 한계 K = <b class="text-slate-700">{{ fmt(K) }}명</b>
          <input v-model.number="K" type="range" min="500" max="2000" step="100" class="mt-1 w-full accent-blue-600" />
        </label>
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="rounded-lg bg-amber-50 p-2">
            <p class="text-xs text-amber-800">변곡점</p>
            <p class="font-mono font-bold text-amber-700">{{ tStar.toFixed(1) }}개월</p>
          </div>
          <div class="rounded-lg bg-amber-50 p-2">
            <p class="text-xs text-amber-800">그때 사용자</p>
            <p class="font-mono font-bold text-amber-700">{{ fmt(K / 2) }}명</p>
          </div>
          <div class="rounded-lg bg-indigo-50 p-2">
            <p class="text-xs text-indigo-800">최대 가입 속도</p>
            <p class="font-mono font-bold text-indigo-700">{{ fmt(maxInflow) }}명/월</p>
          </div>
        </div>
        <label class="flex cursor-pointer items-center gap-1.5 text-sm text-slate-700">
          <input v-model="showExp" type="checkbox" class="h-4 w-4 accent-rose-600" /> 처음 기세대로 지수 성장한다면? (비교)
        </label>
      </div>
    </div>
    <TimePlot
      :series="stockSeries"
      :x-max="T"
      :y-min="0"
      :y-max="Math.max(1100, K * 1.1)"
      :x-ticks="[0, 6, 12, 18, 24, 30, 36]"
      :markers="[...markers, { x: now, color: 'var(--c-slate-500)' }]"
      :hlines="[{ y: K, label: `수용 한계 K = ${fmt(K)}명`, color: 'var(--c-blue-600)' }]"
      x-label="개월"
      y-label="사용자 수(명)"
      :height="220"
      :legend="showExp"
      aria-label="S자로 늘어나는 사용자 수 그래프"
    />
    <TimePlot
      :series="flowSeries"
      :x-max="T"
      :y-min="0"
      :y-max="Math.max(150, maxInflow * 1.15)"
      :x-ticks="[0, 6, 12, 18, 24, 30, 36]"
      :markers="[...markers, { x: now, color: 'var(--c-slate-500)' }]"
      x-label="개월"
      y-label="가입 속도(명/월)"
      :height="170"
      :legend="false"
      aria-label="종 모양의 가입 속도 그래프"
    />
    <p class="mt-2 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
      가입 속도(아래)는 변곡점에서 정점을 찍고 줄어들지만, 사용자 수(위)는 그 뒤로도 계속 늘어 K에 다가갑니다.
      <b>변곡점 전에는 강화 루프가, 뒤에는 균형 루프가 이깁니다.</b> 지금 시각 막대를 옮겨 인과지도의 굵은 고리가 바뀌는 순간을 보세요.
    </p>
  </div>
</template>
