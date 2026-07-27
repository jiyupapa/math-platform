<script setup lang="ts">
// 미분 전용 인터랙티브 시각화 (SVG).
// 함수 곡선 위의 점을 슬라이더로 움직이면, 그 점에서의 '접선'과 '기울기(=미분계수)'가
// 실시간으로 바뀐다. showSecant 를 켜면 두 번째 점까지의 '할선'과 '평균변화율'도 보여
// h 를 줄일수록 할선이 접선에 다가가는 것(평균변화율 → 순간변화율)을 눈으로 확인할 수 있다.
//
// 사용 예:
//   <TangentExplorer :fn="(x)=>x*x" :dfn="(x)=>2*x"
//     :xmin="-3" :xmax="3" :ymin="-1" :ymax="9" :initial="1"
//     label="f(x) = x^2" show-secant />
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 그릴 함수 f(x) */
    fn: (x: number) => number
    /** f 의 도함수 f'(x). 접선 기울기를 정확히 그리는 데 쓴다. */
    dfn: (x: number) => number
    xmin?: number
    xmax?: number
    ymin?: number
    ymax?: number
    /** 처음 점이 놓일 x 좌표 */
    initial?: number
    /** 위에 표시할 함수 이름 (평문, 예: 'f(x) = x^2') */
    label?: string
    /** 할선(평균변화율) 데모 표시 여부 */
    showSecant?: boolean
    /** SVG 픽셀 크기 */
    width?: number
    height?: number
  }>(),
  {
    xmin: -3,
    xmax: 3,
    ymin: -1,
    ymax: 9,
    initial: 1,
    label: '',
    showSecant: false,
    width: 440,
    height: 340,
  },
)

// 점의 x 좌표 (슬라이더로 제어)
const x0 = ref(props.initial)
// 할선용 간격 h
const h = ref(1.5)

const xstep = computed(() => (props.xmax - props.xmin) / 200)

// 수학 좌표 → 화면(px) 좌표
function sx(x: number) {
  return ((x - props.xmin) / (props.xmax - props.xmin)) * props.width
}
function sy(y: number) {
  return props.height - ((y - props.ymin) / (props.ymax - props.ymin)) * props.height
}

// 곡선을 잘게 샘플링한 polyline 점 문자열
const curvePoints = computed(() => {
  const pts: string[] = []
  const n = 200
  for (let i = 0; i <= n; i++) {
    const x = props.xmin + ((props.xmax - props.xmin) * i) / n
    pts.push(`${sx(x).toFixed(1)},${sy(props.fn(x)).toFixed(1)}`)
  }
  return pts.join(' ')
})

// 정수 눈금 목록
function ticks(lo: number, hi: number) {
  const arr: number[] = []
  for (let t = Math.ceil(lo); t <= Math.floor(hi); t++) arr.push(t)
  return arr
}
const xticks = computed(() => ticks(props.xmin, props.xmax))
const yticks = computed(() => ticks(props.ymin, props.ymax))

// 접선: 기울기 m, 직선 y = f(x0) + m (x - x0)
const fx0 = computed(() => props.fn(x0.value))
const slope = computed(() => props.dfn(x0.value))
function tangentY(x: number) {
  return fx0.value + slope.value * (x - x0.value)
}

// 할선: 두 번째 점 (x0+h, f(x0+h)), 평균변화율
const x1 = computed(() => x0.value + h.value)
const fx1 = computed(() => props.fn(x1.value))
const secSlope = computed(() => (fx1.value - fx0.value) / (x1.value - x0.value))
function secantY(x: number) {
  return fx0.value + secSlope.value * (x - x0.value)
}

const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : '—')

// 축 위치 (0 이 화면 안에 있을 때만 그림)
const xAxisY = computed(() => sy(0))
const yAxisX = computed(() => sx(0))
const showXAxis = computed(() => props.ymin <= 0 && props.ymax >= 0)
const showYAxis = computed(() => props.xmin <= 0 && props.xmax >= 0)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <p v-if="label" class="mb-2 text-center text-sm font-semibold text-slate-600">
      {{ label }}
    </p>

    <div class="flex justify-center">
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        :width="width"
        :height="height"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50"
      >
        <!-- 격자 -->
        <g stroke="var(--c-slate-200)" stroke-width="1">
          <line v-for="t in xticks" :key="'gx' + t" :x1="sx(t)" :y1="0" :x2="sx(t)" :y2="height" />
          <line v-for="t in yticks" :key="'gy' + t" :x1="0" :y1="sy(t)" :x2="width" :y2="sy(t)" />
        </g>

        <!-- 축 -->
        <g stroke="var(--c-slate-400)" stroke-width="1.5">
          <line v-if="showXAxis" :x1="0" :y1="xAxisY" :x2="width" :y2="xAxisY" />
          <line v-if="showYAxis" :x1="yAxisX" :y1="0" :x2="yAxisX" :y2="height" />
        </g>
        <!-- 눈금 숫자 -->
        <g fill="var(--c-slate-400)" font-size="10" text-anchor="middle">
          <text v-for="t in xticks.filter((n) => n !== 0)" :key="'lx' + t"
            :x="sx(t)" :y="(showXAxis ? xAxisY : height) - 4">{{ t }}</text>
        </g>

        <!-- 함수 곡선 -->
        <polyline :points="curvePoints" fill="none" stroke="var(--c-indigo-500)" stroke-width="2.5" />

        <!-- 할선 (평균변화율) -->
        <template v-if="showSecant">
          <line
            :x1="sx(xmin)" :y1="sy(secantY(xmin))"
            :x2="sx(xmax)" :y2="sy(secantY(xmax))"
            stroke="var(--c-amber-500)" stroke-width="2" stroke-dasharray="6 4"
          />
          <!-- 두 번째 점 -->
          <circle :cx="sx(x1)" :cy="sy(fx1)" r="5" fill="var(--c-amber-500)" />
          <!-- 직각 보조선 (rise / run) -->
          <line :x1="sx(x0)" :y1="sy(fx0)" :x2="sx(x1)" :y2="sy(fx0)" stroke="var(--c-amber-500)" stroke-width="1" stroke-dasharray="3 3" opacity="0.7" />
          <line :x1="sx(x1)" :y1="sy(fx0)" :x2="sx(x1)" :y2="sy(fx1)" stroke="var(--c-amber-500)" stroke-width="1" stroke-dasharray="3 3" opacity="0.7" />
        </template>

        <!-- 접선 (순간변화율) -->
        <line
          :x1="sx(xmin)" :y1="sy(tangentY(xmin))"
          :x2="sx(xmax)" :y2="sy(tangentY(xmax))"
          stroke="var(--c-red-500)" stroke-width="2.5"
        />

        <!-- 접점 -->
        <circle :cx="sx(x0)" :cy="sy(fx0)" r="6" fill="var(--c-white)" stroke="var(--c-red-500)" stroke-width="3" />
        <text :x="sx(x0) + 10" :y="sy(fx0) - 10" fill="var(--c-red-500)" font-size="12" font-weight="bold">
          ({{ fmt(x0) }}, {{ fmt(fx0) }})
        </text>
      </svg>
    </div>

    <!-- 점 위치 슬라이더 -->
    <div class="mt-4 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-28 shrink-0 text-slate-500">점 위치 x =
          <b class="text-slate-800">{{ fmt(x0) }}</b></span>
        <input
          v-model.number="x0"
          type="range"
          :min="xmin"
          :max="xmax"
          :step="xstep"
          class="flex-1 accent-red-500"
        />
      </label>

      <label v-if="showSecant" class="mt-2 flex items-center gap-3 text-sm">
        <span class="w-28 shrink-0 text-slate-500">간격 h =
          <b class="text-slate-800">{{ fmt(h) }}</b></span>
        <input
          v-model.number="h"
          type="range"
          min="0.05"
          max="2.5"
          step="0.05"
          class="flex-1 accent-amber-500"
        />
      </label>
    </div>

    <!-- 수치 읽기 -->
    <div class="mt-3 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-red-50 px-3 py-1.5 text-red-700">
        🔴 접선 기울기 (순간변화율) =
        <b>{{ fmt(slope) }}</b>
      </span>
      <span v-if="showSecant" class="rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700">
        🟡 할선 기울기 (평균변화율) =
        <b>{{ fmt(secSlope) }}</b>
      </span>
    </div>
    <p v-if="showSecant" class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      간격 <b>h</b> 를 점점 줄여보세요. 노란 할선(평균변화율)이 빨간 접선(순간변화율)에
      점점 가까워집니다 — 이게 바로 "극한으로 미분을 정의한다"의 그림입니다.
    </p>
  </div>
</template>
