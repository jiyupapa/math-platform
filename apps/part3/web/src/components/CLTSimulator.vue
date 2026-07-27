<script setup lang="ts">
// Phase 7 전용 인터랙티브 — 중심극한정리(CLT) 시뮬레이터.
// 모집단 분포(주사위·오른쪽 꼬리·이봉)에서 크기 n 표본을 여러 번 뽑아
// '표본평균'의 히스토그램을 쌓으면 — 원래 모양과 상관없이 — 종 모양이 되는 것을 보여준다.
import { ref, computed, watch } from 'vue'

const props = withDefaults(defineProps<{ width?: number; height?: number }>(), {
  width: 460,
  height: 190,
})

// 표준정규 난수 (Box-Muller 변환)
function gauss(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

interface PopDef {
  key: string
  label: string
  mean: number
  sigma: number
  xmin: number
  xmax: number
  sample: () => number
  density: (x: number) => number
}

// 모집단 3종 — 일부러 서로 전혀 다른 모양으로 골랐다
const pops: PopDef[] = [
  {
    key: 'dice',
    label: '🎲 주사위 (평평함)',
    mean: 3.5,
    sigma: Math.sqrt(35 / 12), // ≈ 1.708
    xmin: 0.5,
    xmax: 6.5,
    sample: () => Math.floor(Math.random() * 6) + 1,
    density: () => 1,
  },
  {
    key: 'skew',
    label: '↘ 오른쪽 꼬리 (치우침)',
    mean: 2,
    sigma: 2,
    xmin: 0,
    xmax: 10,
    sample: () => Math.min(-2 * Math.log(1 - Math.random()), 10),
    density: (x) => Math.exp(-x / 2),
  },
  {
    key: 'bimodal',
    label: '⛰ 봉우리 둘',
    mean: 5,
    sigma: Math.sqrt(9.64), // ≈ 3.105
    xmin: 0,
    xmax: 10,
    sample: () => (Math.random() < 0.5 ? 2 : 8) + gauss() * 0.8,
    density: (x) => Math.exp(-((x - 2) * (x - 2)) / 1.28) + Math.exp(-((x - 8) * (x - 8)) / 1.28),
  },
]

const popIdx = ref(0)
const n = ref(5)
const means = ref<number[]>([])

const pop = computed(() => pops[popIdx.value])

// 모집단이나 n 이 바뀌면 지금까지 모은 표본평균은 다른 실험의 결과이므로 비운다
watch([popIdx, n], () => {
  means.value = []
})

function drawSamples(k: number) {
  const p = pop.value
  const arr = means.value.slice()
  for (let i = 0; i < k; i++) {
    let s = 0
    for (let j = 0; j < n.value; j++) s += p.sample()
    arr.push(s / n.value)
  }
  means.value = arr
}

function reset() {
  means.value = []
}

// ── 통계 칩 ──
const count = computed(() => means.value.length)
const meanOfMeans = computed(() => {
  if (count.value === 0) return NaN
  return means.value.reduce((a, b) => a + b, 0) / count.value
})
const sdOfMeans = computed(() => {
  if (count.value < 2) return NaN
  const m = meanOfMeans.value
  const v = means.value.reduce((a, b) => a + (b - m) * (b - m), 0) / count.value
  return Math.sqrt(v)
})
const theorySE = computed(() => pop.value.sigma / Math.sqrt(n.value))

// ── 그리기 ──
const popH = 60 // 모집단 미니 그래프 높이
const sx = (x: number) => ((x - pop.value.xmin) / (pop.value.xmax - pop.value.xmin)) * props.width

// 모집단 모양 (막대 30개, 최고 높이 기준 정규화)
const popBars = computed(() => {
  const bins = 30
  const p = pop.value
  const w = (p.xmax - p.xmin) / bins
  const vals: number[] = []
  for (let i = 0; i < bins; i++) vals.push(p.density(p.xmin + (i + 0.5) * w))
  const max = Math.max(...vals)
  return vals.map((v, i) => ({
    x: (i / bins) * props.width + 0.5,
    w: props.width / bins - 1,
    h: (v / max) * (popH - 10),
  }))
})

// 표본평균 히스토그램 (가장 높은 막대 기준 정규화)
const BINS = 40
const histBars = computed(() => {
  const p = pop.value
  const counts = new Array(BINS).fill(0) as number[]
  const w = (p.xmax - p.xmin) / BINS
  for (const m of means.value) {
    let idx = Math.floor((m - p.xmin) / w)
    if (idx < 0) idx = 0
    if (idx >= BINS) idx = BINS - 1
    counts[idx]++
  }
  const max = Math.max(1, ...counts)
  return counts.map((c, i) => ({
    x: (i / BINS) * props.width + 0.5,
    w: props.width / BINS - 1,
    h: (c / max) * (props.height - 16),
  }))
})

// 이론 정규곡선 N(μ, SE²) — 표본평균이 30개 이상 쌓이면 모양 비교용으로 표시
const normalCurve = computed(() => {
  if (count.value < 30) return ''
  const p = pop.value
  const se = theorySE.value
  const pts: string[] = []
  const steps = 120
  for (let i = 0; i <= steps; i++) {
    const x = p.xmin + ((p.xmax - p.xmin) * i) / steps
    const y = Math.exp(-((x - p.mean) * (x - p.mean)) / (2 * se * se)) // 최고 1 정규화
    pts.push(`${sx(x).toFixed(1)},${(props.height - y * (props.height - 16)).toFixed(1)}`)
  }
  return pts.join(' ')
})

const fmt = (v: number) => (Number.isFinite(v) ? Number(v.toFixed(3)).toString() : '—')
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <!-- 모집단 선택 -->
    <div class="mb-2 flex flex-wrap gap-2">
      <button
        v-for="(p, i) in pops"
        :key="p.key"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
        :class="
          popIdx === i
            ? 'border-indigo-400 bg-indigo-50 text-indigo-800'
            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
        "
        @click="popIdx = i"
      >
        {{ p.label }}
      </button>
    </div>

    <!-- 모집단 모양 -->
    <p class="mb-1 text-xs font-semibold text-slate-500">① 모집단(원래 데이터)의 모양</p>
    <div class="flex justify-center">
      <svg :viewBox="`0 0 ${width} ${popH}`" :width="width" :height="popH"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50">
        <rect v-for="(b, i) in popBars" :key="i" :x="b.x" :y="popH - b.h" :width="b.w" :height="b.h"
          fill="var(--c-slate-400)" />
      </svg>
    </div>

    <!-- 표본 크기 -->
    <div class="mt-3 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-36 shrink-0 text-slate-500">표본 크기 n = <b class="text-slate-800">{{ n }}</b></span>
        <input v-model.number="n" type="range" min="1" max="50" step="1" class="flex-1 accent-indigo-500" />
      </label>
    </div>

    <!-- 버튼 -->
    <div class="mt-2 flex flex-wrap gap-2">
      <button type="button"
        class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        @click="drawSamples(100)">표본 100개 뽑기</button>
      <button type="button"
        class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
        @click="drawSamples(1000)">표본 1000개 뽑기</button>
      <button type="button"
        class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
        @click="reset">↺ 리셋</button>
    </div>

    <!-- 표본평균 히스토그램 -->
    <p class="mt-3 mb-1 text-xs font-semibold text-slate-500">
      ② 표본평균 x̄ 들의 히스토그램 (크기 n 표본을 한 번 뽑을 때마다 평균 1개가 쌓여요)
    </p>
    <div class="flex justify-center">
      <svg :viewBox="`0 0 ${width} ${height}`" :width="width" :height="height"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50">
        <rect v-for="(b, i) in histBars" :key="i" :x="b.x" :y="height - b.h" :width="b.w" :height="b.h"
          fill="var(--c-indigo-500)" opacity="0.85" />
        <!-- 모평균 위치 -->
        <line :x1="sx(pop.mean)" :y1="0" :x2="sx(pop.mean)" :y2="height"
          stroke="var(--c-emerald-600)" stroke-width="1.5" stroke-dasharray="5 4" />
        <!-- 이론 정규곡선 -->
        <polyline v-if="normalCurve" :points="normalCurve" fill="none" stroke="var(--c-rose-500)"
          stroke-width="2" stroke-dasharray="6 4" opacity="0.9" />
        <text v-if="count === 0" :x="width / 2" :y="height / 2" text-anchor="middle"
          fill="var(--c-slate-400)" font-size="13">버튼을 눌러 표본을 뽑아 보세요</text>
      </svg>
    </div>

    <!-- 읽기 -->
    <div class="mt-3 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">뽑은 표본 = <b>{{ count }}</b>개</span>
      <span class="rounded-lg bg-indigo-50 px-3 py-1.5 text-indigo-700">표본평균들의 평균 = <b>{{ fmt(meanOfMeans) }}</b>
        <span class="text-indigo-600">(모평균 {{ fmt(pop.mean) }})</span></span>
      <span class="rounded-lg bg-rose-50 px-3 py-1.5 text-rose-700">표본평균들의 표준편차 = <b>{{ fmt(sdOfMeans) }}</b>
        <span class="text-rose-700">(이론 σ/√n = {{ fmt(theorySE) }})</span></span>
    </div>

    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      점선 초록 = 모평균 위치, 점선 빨강 = 이론 정규곡선.
      <b>n = 1</b> 이면 히스토그램이 모집단 모양을 그대로 닮지만, <b>n 을 키우면</b> 어떤 모집단이든
      종 모양으로 모이고 폭도 <b>σ/√n</b> 으로 좁아집니다 — 이것이 중심극한정리예요.
    </p>
  </div>
</template>
