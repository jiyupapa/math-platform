<script setup lang="ts">
// 8장 실험실 — ① 위상선: 순유량 f(S) 그래프에서 평형(f = 0)을 찾고, 출발점을 옮겨 어디로 가는지 본다.
//              로지스틱(0 불안정·K 안정)과 임계 질량(0 안정·A 불안정·K 안정).
//              ② 두 저량의 나선: 모멘텀(위치·속도)이 β 에 따라 곧장 가거나 나선으로 출렁인다(고유값).
// 완전 결정적. sim.ts PHASE·HEAVY, 노트북 ch08_equilibrium.ipynb 와 동일.
import { computed, ref } from 'vue'
import TimePlot from './TimePlot.vue'
import { PHASE, phaseF, phaseRun, heavyBall, heavyEigen } from '@/data/sim'
import { fmt } from '@/data/plot'

// ── ① 위상선 ───────────────────────────────────────────────
const kind = ref<'logistic' | 'allee'>('allee')
const S0 = ref(250)
const f = computed(() => phaseF(kind.value))
const xs = Array.from({ length: 121 }, (_, i) => i * 10)
const curve = computed(() => [{ label: '순유량 f(S)', color: 'var(--c-indigo-600)', points: xs.map((s) => [s, f.value(s)] as [number, number]), width: 2.5 }])
const eqs = computed(() =>
  kind.value === 'logistic'
    ? [
        { s: 0, stable: false },
        { s: PHASE.K, stable: true },
      ]
    : [
        { s: 0, stable: true },
        { s: PHASE.A, stable: false },
        { s: PHASE.K, stable: true },
      ],
)
const phaseSeries = computed(() => [
  ...curve.value,
  ...eqs.value.map((e) => ({
    label: e.stable ? '안정 평형' : '불안정 평형',
    color: e.stable ? 'var(--c-emerald-600)' : 'var(--c-rose-600)',
    points: [[e.s, 0]] as [number, number][],
    dots: true,
    width: 0,
  })),
])
const fMax = computed(() => (kind.value === 'logistic' ? 150 : 260))
const run = computed(() => phaseRun(kind.value, S0.value))
const endS = computed(() => run.value.s[0][run.value.s[0].length - 1])
const timeSeries = computed(() => [
  { label: '사용자 수', color: 'var(--c-emerald-600)', points: run.value.t.map((t, i) => [t, run.value.s[0][i]] as [number, number]), width: 2.5 },
])
const fate = computed(() => {
  const e = endS.value
  if (e < 1) return { tone: 'text-rose-700', text: `처음 ${S0.value}명 → 0명으로 사라집니다.` + (kind.value === 'allee' ? ` 임계 질량(${PHASE.A}명)보다 적게 시작했기 때문이에요.` : '') }
  if (Math.abs(e - PHASE.K) < 1) return { tone: 'text-emerald-700', text: `처음 ${S0.value}명 → ${fmt(PHASE.K)}명(안정 평형)으로 갑니다.` }
  return { tone: 'text-amber-700', text: `처음 ${S0.value}명 → 36개월 뒤 ${fmt(e)}명. 불안정 평형 바로 위·아래에서는 아주 천천히 움직여요.` }
})

// ── ② 나선 ─────────────────────────────────────────────────
const beta = ref(0.9)
const hb = computed(() => heavyBall(beta.value))
const eig = computed(() => heavyEigen(beta.value))
const stepSeries = computed(() => [{ label: '위치 x', color: 'var(--c-violet-600)', values: hb.value.x, dots: true, width: 2 }])
const planeSeries = computed(() => [
  { label: '(위치, 속도)', color: 'var(--c-violet-600)', points: hb.value.x.map((x, i) => [x, hb.value.v[i]] as [number, number]), dots: true, width: 1.5 },
])
const minX = computed(() => Math.min(...hb.value.x))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① · 위상선: 순유량이 0인 곳 찾기</p>
    <p class="mb-2 text-xs text-slate-500">
      가로축은 시간이 아니라 <b>사용자 수 S</b>, 세로축은 그때의 <b>순유량 f(S)</b>입니다. f가 +인 구간에서는 S가 오른쪽(늘어남)으로,
      −인 구간에서는 왼쪽(줄어듦)으로 움직여요. 점은 f = 0인 평형(초록 = 안정, 빨강 = 불안정).
    </p>
    <div class="mb-2 flex flex-wrap gap-1.5">
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="kind === 'logistic' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
        @click="kind = 'logistic'"
      >
        로지스틱 (7장)
      </button>
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="kind === 'allee' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
        @click="kind = 'allee'"
      >
        임계 질량이 있는 도입
      </button>
    </div>
    <div class="grid gap-3 md:grid-cols-2">
      <div class="min-w-0">
        <TimePlot
          :series="phaseSeries"
          :x-max="1200"
          :y-min="-fMax"
          :y-max="fMax"
          :x-ticks="[0, 200, 400, 600, 800, 1000, 1200]"
          :hlines="[{ y: 0, color: 'var(--c-slate-500)' }]"
          :markers="[{ x: S0, label: `출발 ${S0}명`, color: 'var(--c-amber-600)' }]"
          x-label="사용자 수 S(명)"
          y-label="순유량(명/월)"
          :height="220"
          :legend="false"
          aria-label="사용자 수에 따른 순유량 그래프와 평형점"
        />
      </div>
      <div class="min-w-0">
        <TimePlot
          :series="timeSeries"
          :x-max="PHASE.T"
          :y-min="0"
          :y-max="1200"
          :x-ticks="[0, 6, 12, 18, 24, 30, 36]"
          :hlines="eqs.map((e) => ({ y: e.s, color: e.stable ? 'var(--c-emerald-600)' : 'var(--c-rose-600)' }))"
          x-label="개월"
          y-label="사용자 수(명)"
          :height="220"
          :legend="false"
          aria-label="출발점에서 시작한 사용자 수의 시간 그래프"
        />
      </div>
    </div>
    <label class="mt-1 block text-xs text-slate-500">
      출발 사용자 수 S₀ = <b class="text-slate-700">{{ S0 }}명</b>
      <input v-model.number="S0" type="range" min="0" max="1200" step="10" class="mt-1 w-full accent-amber-600" />
    </label>
    <p class="mt-2 rounded-lg bg-slate-50 p-3 text-sm font-medium" :class="fate.tone">{{ fate.text }}</p>

    <!-- ② -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② · 저량이 둘이면: 모멘텀의 나선</p>
    <p class="mb-2 text-xs text-slate-500">
      곡률 2인 골짜기(최저점 0)에서 출발점 8, 학습률 0.05로 모멘텀 경사하강을 합니다. 저량이 둘이에요.
      <b>속도</b> v ← β × v − 학습률 × 기울기, <b>위치</b> x ← x + v. β(베타)는 지난 속도를 얼마나 남길지(8부 4장).
    </p>
    <label class="block text-xs text-slate-500">
      β = <b class="text-slate-700">{{ beta.toFixed(2) }}</b>
      <input v-model.number="beta" type="range" min="0" max="0.95" step="0.05" class="mt-1 w-full accent-violet-600" />
    </label>
    <div class="grid gap-3 md:grid-cols-2">
      <div class="min-w-0">
        <TimePlot
          :series="stepSeries"
          :x-max="60"
          :y-min="-7"
          :y-max="9"
          :x-ticks="[0, 10, 20, 30, 40, 50, 60]"
          :hlines="[{ y: 0, label: '최저점', color: 'var(--c-blue-600)' }]"
          x-label="걸음"
          y-label="위치 x"
          :height="210"
          :legend="false"
          aria-label="걸음에 따른 위치 그래프"
        />
      </div>
      <div class="min-w-0">
        <TimePlot
          :series="planeSeries"
          :x-min="-7"
          :x-max="9"
          :y-min="-2.5"
          :y-max="2"
          :x-ticks="[-6, -3, 0, 3, 6, 9]"
          :hlines="[{ y: 0, color: 'var(--c-slate-400)' }]"
          :markers="[{ x: 0, color: 'var(--c-slate-400)' }]"
          x-label="위치 x"
          y-label="속도 v"
          :height="210"
          :legend="false"
          aria-label="위치와 속도의 위상 평면 그래프"
        />
      </div>
    </div>
    <div class="mt-2 grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-xs text-slate-500">움직임</p>
        <p class="font-bold" :class="eig.complex ? 'text-amber-700' : 'text-emerald-700'">{{ eig.complex ? '나선(출렁임)' : '곧장 다가감' }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-xs text-slate-500">반대편으로 넘어간 최대 거리</p>
        <p class="font-mono font-bold text-violet-700">{{ minX < 0 ? (-minX).toFixed(2) : '0' }}</p>
      </div>
      <div class="col-span-2 rounded-lg bg-slate-50 p-2 sm:col-span-1">
        <p class="text-xs text-slate-500">고유값(선택 상자 참고)</p>
        <p class="font-mono text-sm font-bold text-violet-700">
          <template v-if="eig.complex">{{ eig.re.toFixed(3) }} ± {{ eig.im.toFixed(3) }}i (크기 {{ eig.mod.toFixed(3) }})</template>
          <template v-else>{{ eig.re.toFixed(3) }}, {{ eig.re2.toFixed(3) }}</template>
        </p>
      </div>
    </div>
    <p class="mt-2 text-xs text-slate-600">
      β가 약 0.47을 넘으면 위상 평면의 궤적이 원점(최저점, 속도 0)을 도는 나선이 되고, β가 클수록 반대편으로 더 멀리 넘어갔다 천천히 가라앉습니다.
    </p>
  </div>
</template>
