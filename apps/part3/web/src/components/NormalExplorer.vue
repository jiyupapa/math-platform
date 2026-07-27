<script setup lang="ts">
// Phase 6 전용 인터랙티브 — 정규분포 탐험기.
// μ(중심)·σ(폭) 슬라이더로 종 모양이 어떻게 변하는지 보고,
// 구간 [a, b] 를 골라 "확률 = 곡선 아래 넓이"를 실시간 %로 확인한다.
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    size?: number
    height?: number
  }>(),
  { size: 460, height: 240 },
)

const mu = ref(0)
const sigma = ref(1)
const a = ref(-1)
const b = ref(1)

// 그림의 x 범위(고정)와 y 최대치 (σ=0.5 일 때 봉우리 ≈ 0.80)
const XMIN = -8
const XMAX = 8
const YMAX = 0.85

// 오차함수 erf 근사 (Abramowitz–Stegun 7.1.26) → 표준정규 누적확률 Φ
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * ax)
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-ax * ax)
  return sign * y
}
const phi = (z: number) => 0.5 * (1 + erf(z / Math.SQRT2))

const pdf = (x: number) =>
  Math.exp(-0.5 * ((x - mu.value) / sigma.value) ** 2) / (sigma.value * Math.sqrt(2 * Math.PI))

// a > b 로 엇갈려도 안전하게
const lo = computed(() => Math.min(a.value, b.value))
const hi = computed(() => Math.max(a.value, b.value))
const area = computed(
  () => phi((hi.value - mu.value) / sigma.value) - phi((lo.value - mu.value) / sigma.value),
)

// 좌표 변환
const sx = (x: number) => ((x - XMIN) / (XMAX - XMIN)) * props.size
const sy = (y: number) => props.height - 22 - (y / YMAX) * (props.height - 40)

const N_SAMPLES = 240
const curve = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= N_SAMPLES; i++) {
    const x = XMIN + ((XMAX - XMIN) * i) / N_SAMPLES
    pts.push(`${sx(x).toFixed(1)},${sy(pdf(x)).toFixed(1)}`)
  }
  return pts.join(' ')
})

// [lo, hi] 색칠 영역 (곡선 위쪽 경로 + 바닥으로 닫기)
const region = computed(() => {
  const pts: string[] = []
  const steps = 80
  for (let i = 0; i <= steps; i++) {
    const x = lo.value + ((hi.value - lo.value) * i) / steps
    pts.push(`${sx(x).toFixed(1)},${sy(pdf(x)).toFixed(1)}`)
  }
  pts.push(`${sx(hi.value).toFixed(1)},${sy(0).toFixed(1)}`)
  pts.push(`${sx(lo.value).toFixed(1)},${sy(0).toFixed(1)}`)
  return pts.join(' ')
})

// μ±kσ 보조선 (화면 밖이면 숨김)
const sigmaLines = computed(() =>
  [-2, -1, 1, 2]
    .map((k) => ({ k, x: mu.value + k * sigma.value }))
    .filter((l) => l.x > XMIN && l.x < XMAX),
)

const clampX = (x: number) => Math.max(XMIN, Math.min(XMAX, x))
function preset(k: number) {
  a.value = Number(clampX(mu.value - k * sigma.value).toFixed(1))
  b.value = Number(clampX(mu.value + k * sigma.value).toFixed(1))
}

const fmt = (v: number) => Number(v.toFixed(1)).toString()
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <div class="flex justify-center">
      <svg
        :viewBox="`0 0 ${size} ${height}`"
        :width="size"
        :height="height"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50"
      >
        <!-- μ±kσ 보조선 -->
        <g>
          <line
            v-for="l in sigmaLines"
            :key="l.k"
            :x1="sx(l.x)"
            :y1="14"
            :x2="sx(l.x)"
            :y2="sy(0)"
            stroke="var(--c-slate-300)"
            stroke-width="1"
            stroke-dasharray="3 3"
          />
          <text
            v-for="l in sigmaLines"
            :key="'lb' + l.k"
            :x="sx(l.x)"
            y="12"
            font-size="9"
            text-anchor="middle"
            fill="var(--c-slate-400)"
          >
            {{ l.k > 0 ? `μ+${l.k}σ` : `μ−${-l.k}σ` }}
          </text>
        </g>
        <!-- 중심 μ -->
        <line :x1="sx(mu)" :y1="14" :x2="sx(mu)" :y2="sy(0)" stroke="var(--c-slate-400)" stroke-width="1.2" />
        <!-- 구간 넓이 -->
        <polygon :points="region" fill="var(--c-indigo-500)" opacity="0.28" />
        <!-- 밀도곡선 -->
        <polyline :points="curve" fill="none" stroke="var(--c-indigo-500)" stroke-width="2.5" />
        <!-- x축 -->
        <line :x1="0" :y1="sy(0)" :x2="size" :y2="sy(0)" stroke="var(--c-slate-400)" stroke-width="1" />
        <!-- 구간 경계 -->
        <line :x1="sx(lo)" :y1="sy(0)" :x2="sx(lo)" :y2="sy(0) + 6" stroke="var(--c-indigo-600)" stroke-width="2" />
        <line :x1="sx(hi)" :y1="sy(0)" :x2="sx(hi)" :y2="sy(0) + 6" stroke="var(--c-indigo-600)" stroke-width="2" />
        <text :x="sx(lo)" :y="height - 4" font-size="10" text-anchor="middle" fill="var(--c-indigo-600)">a = {{ fmt(lo) }}</text>
        <text :x="sx(hi)" :y="height - 4" font-size="10" text-anchor="middle" fill="var(--c-indigo-600)">b = {{ fmt(hi) }}</text>
      </svg>
    </div>

    <!-- 슬라이더 -->
    <div class="mt-3 space-y-2 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-36 shrink-0 text-slate-500">중심 μ = <b class="text-slate-800">{{ fmt(mu) }}</b></span>
        <input v-model.number="mu" type="range" min="-5" max="5" step="0.1" class="flex-1 accent-indigo-500" />
      </label>
      <label class="flex items-center gap-3 text-sm">
        <span class="w-36 shrink-0 text-slate-500">폭 σ = <b class="text-slate-800">{{ fmt(sigma) }}</b></span>
        <input v-model.number="sigma" type="range" min="0.5" max="3" step="0.1" class="flex-1 accent-indigo-500" />
      </label>
      <label class="flex items-center gap-3 text-sm">
        <span class="w-36 shrink-0 text-slate-500">구간 시작 a = <b class="text-slate-800">{{ fmt(a) }}</b></span>
        <input v-model.number="a" type="range" :min="XMIN" :max="XMAX" step="0.1" class="flex-1 accent-indigo-500" />
      </label>
      <label class="flex items-center gap-3 text-sm">
        <span class="w-36 shrink-0 text-slate-500">구간 끝 b = <b class="text-slate-800">{{ fmt(b) }}</b></span>
        <input v-model.number="b" type="range" :min="XMIN" :max="XMAX" step="0.1" class="flex-1 accent-indigo-500" />
      </label>
    </div>

    <!-- 프리셋 + 읽기 -->
    <div class="mt-3 flex flex-wrap items-center gap-2 text-sm">
      <button
        type="button"
        class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
        @click="preset(1)"
      >
        구간을 μ±1σ 로
      </button>
      <button
        type="button"
        class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
        @click="preset(2)"
      >
        μ±2σ 로
      </button>
      <button
        type="button"
        class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
        @click="preset(3)"
      >
        μ±3σ 로
      </button>
      <span class="rounded-lg bg-indigo-50 px-3 py-1.5 font-semibold text-indigo-700">
        색칠한 넓이 = P(a ≤ X ≤ b) = <b>{{ (area * 100).toFixed(1) }}%</b>
      </span>
    </div>

    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      <b>μ</b> 를 움직이면 종이 통째로 이동하고, <b>σ</b> 를 키우면 낮고 넓게 퍼집니다
      (전체 넓이는 항상 1이라 높이가 낮아져요). 프리셋 버튼으로 <b>68 → 95 → 99.7%</b> 를 확인해 보세요.
    </p>
  </div>
</template>
