<script setup lang="ts">
// 11장 실험실 — AI가 만드는 고리 세 가지.
// ① 모델 붕괴(장난감): 꼬리를 자른 합성 데이터로 세대를 거듭하면 폭이 × 0.880씩 줄고, 실제 데이터를 섞으면 멈춘다.
// ② 보상 해킹(장난감): 보상 모델 점수(대리 지표)를 쫓는 최적화 + KL 목줄 β. 품질은 정점을 찍고 떨어질 수 있다.
// ③ 데이터 플라이휠: 강화 루프만 그린 계획(지수) vs 한계를 넣은 실제(S자).
// 완전 결정적. sim.ts collapseSigmas·rewardRun·tailShare, 노트북 ch11_ailoops.ipynb 와 동일.
import { computed, ref } from 'vue'
import TimePlot from './TimePlot.vue'
import CldDiagram from './CldDiagram.vue'
import { collapseSigmas, rewardRun, tailShare, TRUNC_VAR } from '@/data/sim'
import { fmt } from '@/data/plot'

const tab = ref<'collapse' | 'reward' | 'flywheel'>('collapse')

// ── ① 모델 붕괴 ─────────────────────────────────────────────
const gen = ref(10)
const alphaPct = ref(0)
const sigmas = computed(() => collapseSigmas(alphaPct.value / 100, 20))
const sigNow = computed(() => sigmas.value[gen.value])
const limit = computed(() => {
  const a = alphaPct.value / 100
  return a === 0 ? 0 : Math.sqrt(a / (1 - (1 - a) * TRUNC_VAR))
})
const pdf = (x: number, s: number) => Math.exp(-(x * x) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI))
const xs = Array.from({ length: 161 }, (_, i) => -4 + i * 0.05)
const distSeries = computed(() => [
  { label: '0세대(실제 데이터)', color: 'var(--c-slate-400)', points: xs.map((x) => [x, pdf(x, 1)] as [number, number]), dashed: true, width: 2 },
  { label: `${gen.value}세대 모델`, color: 'var(--c-violet-600)', points: xs.map((x) => [x, pdf(x, sigNow.value)] as [number, number]), width: 2.5, area: true },
])
const sigmaSeries = computed(() => [
  { label: '폭(표준편차)', color: 'var(--c-violet-600)', values: sigmas.value, dots: true, width: 2 },
])

// ── ② 보상 해킹 ─────────────────────────────────────────────
const beta = ref(0.05)
const rr = computed(() => rewardRun(beta.value))
const rewardSeries = computed(() => [
  { label: '보상 모델 점수(대리 지표)', color: 'var(--c-amber-600)', values: rr.value.proxy, dashed: true, width: 2 },
  { label: '진짜 품질', color: 'var(--c-emerald-600)', values: rr.value.truth, width: 2.8 },
])
const peak = computed(() => {
  const t = rr.value.truth
  let i = 0
  for (let k = 1; k < t.length; k++) if (t[k] > t[i] + 1e-12) i = k
  return { i, v: t[i] }
})
const finalT = computed(() => rr.value.truth[rr.value.truth.length - 1])
const rewardVerdict = computed(() => {
  if (peak.value.i < 300 && finalT.value < peak.value.v - 0.05)
    return { tone: 'text-rose-700', text: `보상 해킹: 점수는 끝까지 오르는데 진짜 품질은 ${peak.value.i}걸음에 ${peak.value.v.toFixed(2)}로 정점을 찍고 300걸음에 ${finalT.value.toFixed(2)}까지 떨어집니다.` }
  if (finalT.value > 2.45) return { tone: 'text-emerald-700', text: `목줄이 알맞아요. 진짜 품질이 최고치(2.5) 근처 ${finalT.value.toFixed(2)}에서 안정됩니다.` }
  return { tone: 'text-amber-700', text: `목줄이 너무 짧아요. 안전하지만 진짜 품질도 ${finalT.value.toFixed(2)}에서 멈춥니다(최고 2.5).` }
})

// ── ③ 플라이휠 ─────────────────────────────────────────────
const U0 = 100
const M = 10000
const R = 0.5
const ts = Array.from({ length: 97 }, (_, i) => i * 0.25)
const flySeries = [
  { label: '강화 루프만 그린 계획', color: 'var(--c-rose-500)', points: ts.map((t) => [t, U0 * Math.exp(R * t)] as [number, number]), dashed: true, width: 2 },
  { label: '한계를 넣은 실제(S자)', color: 'var(--c-emerald-600)', points: ts.map((t) => [t, M / (1 + ((M - U0) / U0) * Math.exp(-R * t))] as [number, number]), width: 2.8 },
]
const planAt12 = U0 * Math.exp(R * 12)
const realAt12 = M / (1 + ((M - U0) / U0) * Math.exp(-R * 12))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-2 text-sm font-semibold text-slate-700">🧪 실험 · AI가 만드는 고리 세 가지</p>
    <div class="mb-3 flex flex-wrap gap-1.5">
      <button
        v-for="t in [
          { k: 'collapse', n: '① 모델 붕괴' },
          { k: 'reward', n: '② 보상 해킹' },
          { k: 'flywheel', n: '③ 데이터 플라이휠' },
        ] as const"
        :key="t.k"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="tab === t.k ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
        @click="tab = t.k"
      >
        {{ t.n }}
      </button>
    </div>

    <!-- ① -->
    <template v-if="tab === 'collapse'">
      <p class="mb-2 text-xs text-slate-500">
        0세대는 실제 데이터(폭 1인 정규분포). 다음 세대 모델은 이전 모델이 만든 글로 배우는데, 이전 모델은 흔한 쪽을 주로 뽑아
        <b>±2σ 바깥의 드문 사례를 만들지 않습니다</b>(꼬리 자르기). 실제 데이터를 섞는 비율도 정해 보세요.
      </p>
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="block text-xs text-slate-500">
          세대 = <b class="text-slate-700">{{ gen }}</b>
          <input v-model.number="gen" type="range" min="0" max="20" step="1" class="mt-1 w-full accent-violet-600" />
        </label>
        <label class="block text-xs text-slate-500">
          매 세대 섞는 실제 데이터 = <b class="text-slate-700">{{ alphaPct }}%</b>
          <input v-model.number="alphaPct" type="range" min="0" max="50" step="5" class="mt-1 w-full accent-emerald-600" />
        </label>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <div class="min-w-0">
          <TimePlot
            :series="distSeries"
            :x-min="-4"
            :x-max="4"
            :y-min="0"
            :y-max="1.6"
            :x-ticks="[-4, -2, 0, 2, 4]"
            x-label="값(표준화)"
            y-label="빈도"
            :height="210"
            aria-label="실제 분포와 현재 세대 분포"
          />
        </div>
        <div class="min-w-0">
          <TimePlot
            :series="sigmaSeries"
            :x-max="20"
            :y-min="0"
            :y-max="1.05"
            :x-ticks="[0, 5, 10, 15, 20]"
            :hlines="limit > 0 ? [{ y: limit, label: `멈추는 폭 ${limit.toFixed(3)}`, color: 'var(--c-emerald-600)' }] : []"
            :markers="[{ x: gen, color: 'var(--c-violet-600)' }]"
            x-label="세대"
            y-label="폭"
            :height="210"
            :legend="false"
            aria-label="세대별 분포의 폭"
          />
        </div>
      </div>
      <div class="mt-2 grid grid-cols-2 gap-2 text-center">
        <div class="rounded-lg bg-violet-50 p-2">
          <p class="text-xs text-violet-800">{{ gen }}세대의 폭(처음 1)</p>
          <p class="font-mono text-lg font-bold text-violet-700">{{ sigNow.toFixed(3) }}</p>
        </div>
        <div class="rounded-lg bg-violet-50 p-2">
          <p class="text-xs text-violet-800">드문 사례(원래 꼬리)가 남은 정도</p>
          <p class="font-mono text-lg font-bold text-violet-700">{{ (tailShare(sigNow) * 100).toFixed(tailShare(sigNow) < 0.01 ? 3 : 1) }}%</p>
        </div>
      </div>
    </template>

    <!-- ② -->
    <template v-else-if="tab === 'reward'">
      <p class="mb-2 text-xs text-slate-500">
        최적화는 보상 모델 점수(사람 취향을 흉내 낸 <b>대리 지표</b>)를 올리는 쪽으로 걷습니다. 점수는 셀수록 오르지만 진짜 품질은
        어느 선을 넘으면 오히려 떨어져요(점수 = e, 품질 = e − 0.1e²). β는 원본에서 멀어질수록 깎는 KL 목줄의 세기(6부 6장)입니다.
      </p>
      <label class="block text-xs text-slate-500">
        KL 목줄 β = <b class="text-slate-700">{{ beta.toFixed(2) }}</b> (0이면 목줄 없음)
        <input v-model.number="beta" type="range" min="0" max="1" step="0.05" class="mt-1 w-full accent-amber-600" />
      </label>
      <TimePlot
        :series="rewardSeries"
        :x-max="300"
        :y-min="-10"
        :y-max="20"
        :x-ticks="[0, 50, 100, 150, 200, 250, 300]"
        :hlines="[{ y: 2.5, label: '진짜 품질의 최고치 2.5', color: 'var(--c-emerald-600)' }]"
        :markers="peak.i < 300 ? [{ x: peak.i, label: `품질 정점 ${peak.i}걸음`, color: 'var(--c-rose-600)' }] : []"
        x-label="학습 걸음"
        :height="230"
        aria-label="보상 점수와 진짜 품질의 학습 곡선"
      />
      <p class="mt-2 rounded-lg bg-slate-50 p-3 text-sm font-medium" :class="rewardVerdict.tone">{{ rewardVerdict.text }}</p>
    </template>

    <!-- ③ -->
    <template v-else>
      <p class="mb-2 text-xs text-slate-500">
        사용자가 늘면 데이터가 늘고, 모델이 좋아지고, 사용자가 또 느는 강화 루프. 그런데 데이터가 늘어도 품질은 갈수록 덜 오르고(수확 체감),
        시장(쓸 수 있는 사람)은 정해져 있습니다(포화). 처음 100명, 성장률 월 0.5, 시장 1만 명.
      </p>
      <div class="grid items-center gap-3 md:grid-cols-[2fr_3fr]">
        <div class="min-w-0 rounded-lg bg-slate-50 p-2">
          <CldDiagram
            :nodes="[
              { id: 'u', label: '사용자 수', x: 90, y: 170, stock: true },
              { id: 'd', label: '데이터', x: 90, y: 40, stock: true },
              { id: 'q', label: '모델 품질', x: 240, y: 40 },
              { id: 'm', label: '남은 시장', x: 272, y: 170 },
            ]"
            :links="[
              { from: 'u', to: 'd', sign: '+' },
              { from: 'd', to: 'q', sign: '+' },
              { from: 'q', to: 'u', sign: '+' },
              { from: 'u', to: 'm', sign: '−', bend: -0.25 },
              { from: 'm', to: 'u', sign: '+', bend: -0.25 },
            ]"
            :loops="[
              { x: 132, y: 84, type: 'R', label: '플라이휠' },
              { x: 181, y: 170, type: 'B', label: '' },
            ]"
            :width="330"
            :height="215"
            aria-label="사용자 수, 데이터, 모델 품질의 강화 루프와 남은 시장의 균형 루프"
          />
        </div>
        <div class="min-w-0">
          <TimePlot
            :series="flySeries"
            :x-max="24"
            :y-min="0"
            :y-max="14000"
            :x-ticks="[0, 6, 12, 18, 24]"
            :hlines="[{ y: M, label: '시장 1만 명', color: 'var(--c-blue-600)' }]"
            x-label="개월"
            y-label="사용자 수(명)"
            :height="220"
            aria-label="강화 루프만 그린 계획과 한계를 넣은 실제"
          />
        </div>
      </div>
      <p class="mt-2 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
        12개월 뒤 계획은 약 <b class="text-rose-700">{{ fmt(planAt12) }}명</b>, 실제는 약 <b class="text-emerald-700">{{ fmt(realAt12) }}명</b>.
        투자 계획을 강화 루프만으로 그리면 한계에 가까워질수록 크게 빗나갑니다. 7장의 S자가 플라이휠에도 그대로 나타나요.
      </p>
    </template>
  </div>
</template>
