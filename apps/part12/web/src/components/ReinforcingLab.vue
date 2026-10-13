<script setup lang="ts">
// 3장 실험실 — 강화 루프(입소문): 가입 = 성장률 × 사용자 수 → 매달 같은 배수로 커지는 지수 성장.
// 같은 첫 달 증가량의 선형 성장과 비교하고, 로그 눈금에서 직선이 되는 것을 본다.
// 월 단위 복리(S(n+1) = S(n)·(1 + r)) — 완전 결정적. 노트북 ch03_reinforcing.ipynb 와 동일.
import { computed, ref } from 'vue'
import TimePlot from './TimePlot.vue'
import CldDiagram from './CldDiagram.vue'
import { fmt } from '@/data/plot'

const S0 = 100
const MONTHS = 36
const rPct = ref(10)
const showLinear = ref(true)
const logY = ref(false)

const r = computed(() => rPct.value / 100)
const expo = computed(() => Array.from({ length: MONTHS + 1 }, (_, n) => S0 * Math.pow(1 + r.value, n)))
const linear = computed(() => Array.from({ length: MONTHS + 1 }, (_, n) => S0 + S0 * r.value * n))
const doubling = computed(() => Math.log(2) / Math.log(1 + r.value))
const rule70 = computed(() => 70 / rPct.value)
const at24 = computed(() => ({ e: expo.value[24], l: linear.value[24] }))

const series = computed(() => {
  const s = [{ label: `지수 성장(매달 ×${(1 + r.value).toFixed(2)})`, color: 'var(--c-rose-600)', values: expo.value, width: 3 }]
  if (showLinear.value) s.push({ label: `선형 성장(매달 +${fmt(S0 * r.value)}명)`, color: 'var(--c-slate-500)', values: linear.value, width: 2 })
  return s
})
const yMax = computed(() => (logY.value ? undefined : 2000))
// 두 배 지점 표시(처음 세 번)
const markers = computed(() =>
  [1, 2, 3]
    .map((k) => ({ x: k * doubling.value, label: k === 1 ? `×2 (${doubling.value.toFixed(1)}개월)` : `×${2 ** k}` }))
    .filter((m) => m.x <= MONTHS)
    .map((m) => ({ ...m, color: 'var(--c-rose-500)' })),
)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 · 눈덩이를 굴려 보세요: 가입 = 성장률 × 사용자 수</p>
    <p class="mb-3 text-xs text-slate-500">
      사용자 100명에서 시작해, 매달 지금 사용자의 일정 비율만큼 새 사용자가 들어옵니다(입소문). 3년(36개월)을 봅니다.
    </p>
    <div class="grid items-center gap-3 md:grid-cols-[2fr_3fr]">
      <div class="min-w-0 rounded-lg bg-slate-50 p-2">
        <CldDiagram
          :nodes="[
            { id: 'u', label: '사용자 수', x: 140, y: 146, stock: true },
            { id: 'g', label: '입소문 가입', x: 140, y: 34 },
          ]"
          :links="[
            { from: 'u', to: 'g', sign: '+', bend: -0.55 },
            { from: 'g', to: 'u', sign: '+', bend: -0.55 },
          ]"
          :loops="[{ x: 140, y: 90, type: 'R', label: '입소문' }]"
          :width="280"
          :height="180"
          aria-label="사용자 수가 입소문 가입을 늘리고 입소문 가입이 사용자 수를 늘리는 강화 루프"
        />
      </div>
      <div class="min-w-0 space-y-3">
        <label class="block text-xs text-slate-500">
          월 성장률 r = <b class="text-slate-700">{{ rPct }}%</b> (지금 사용자 100명당 매달 {{ rPct }}명을 데려옴)
          <input v-model.number="rPct" type="range" min="1" max="30" step="1" class="mt-1 w-full accent-rose-600" />
        </label>
        <div class="flex flex-wrap gap-3 text-sm text-slate-700">
          <label class="flex cursor-pointer items-center gap-1.5"><input v-model="showLinear" type="checkbox" class="h-4 w-4 accent-indigo-600" /> 선형 성장과 비교</label>
          <label class="flex cursor-pointer items-center gap-1.5"><input v-model="logY" type="checkbox" class="h-4 w-4 accent-indigo-600" /> 로그 눈금(세로축)</label>
        </div>
        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="rounded-lg bg-rose-50 p-2">
            <p class="text-xs text-rose-800">두 배 시간(정확)</p>
            <p class="font-mono text-lg font-bold text-rose-700">{{ doubling.toFixed(2) }}개월</p>
          </div>
          <div class="rounded-lg bg-amber-50 p-2">
            <p class="text-xs text-amber-800">70의 법칙: 70 ÷ {{ rPct }}</p>
            <p class="font-mono text-lg font-bold text-amber-700">{{ rule70.toFixed(1) }}개월</p>
          </div>
        </div>
      </div>
    </div>

    <TimePlot
      :series="series"
      :x-max="MONTHS"
      :y-min="logY ? 10 : 0"
      :y-max="yMax"
      :log-y="logY"
      :x-ticks="[0, 6, 12, 18, 24, 30, 36]"
      :markers="markers"
      x-label="개월"
      y-label="명"
      :height="240"
      aria-label="지수 성장과 선형 성장 비교 그래프"
    />
    <p class="mt-2 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
      24개월 뒤: 지수 성장 <b class="text-rose-700">{{ fmt(at24.e) }}명</b>
      <template v-if="showLinear">, 선형 성장 <b class="text-slate-800">{{ fmt(at24.l) }}명</b></template>.
      <template v-if="logY"> 로그 눈금에서는 지수 성장이 <b>직선</b>입니다. 같은 배수(×{{ (1 + r).toFixed(2) }})가 같은 간격으로 보이니까요.</template>
      <template v-else> 처음 몇 달은 두 곡선이 거의 붙어 있다가, 어느 순간부터 지수 쪽이 그래프를 뚫고 나갑니다.</template>
    </p>
  </div>
</template>
