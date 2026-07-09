<script setup lang="ts">
// Phase 3 전용 인터랙티브 시각화 (SVG) — "도함수는 함수다".
// 위 패널: 곡선 f(x) 와 x0 에서의 접선(기울기 값). 아래 패널: 도함수 f'(x) 그래프.
// 슬라이더로 x0 를 움직이면 위 접선이 돌고, 그 '기울기 값'이 아래 그래프의 점 높이로
// 동시에 나타난다 → "각 점의 기울기를 모은 것이 곧 새 함수 f'(x)" 라는 직관.
//
// 사용 예:
//   <DerivativeExplorer :fn="(x)=>x*x" :dfn="(x)=>2*x" label-f="f(x) = x^2" label-df="f'(x) = 2x" />
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    fn: (x: number) => number
    dfn: (x: number) => number
    xmin?: number
    xmax?: number
    ymin?: number
    ymax?: number
    dymin?: number
    dymax?: number
    initial?: number
    labelF?: string
    labelDf?: string
    width?: number
    topH?: number
    botH?: number
  }>(),
  {
    xmin: -3,
    xmax: 3,
    ymin: -1,
    ymax: 9,
    dymin: -7,
    dymax: 7,
    initial: 1,
    labelF: '',
    labelDf: '',
    width: 380,
    topH: 220,
    botH: 170,
  },
)

const x0 = ref(props.initial)
const xstep = computed(() => (props.xmax - props.xmin) / 200)

// x 좌표는 두 패널이 공유
function sx(x: number) {
  return ((x - props.xmin) / (props.xmax - props.xmin)) * props.width
}
// 위 패널(f) / 아래 패널(f') 각각의 y 매핑
function syT(y: number) {
  return props.topH - ((y - props.ymin) / (props.ymax - props.ymin)) * props.topH
}
function syB(y: number) {
  return props.botH - ((y - props.dymin) / (props.dymax - props.dymin)) * props.botH
}

function ticks(lo: number, hi: number) {
  const arr: number[] = []
  for (let t = Math.ceil(lo); t <= Math.floor(hi); t++) arr.push(t)
  return arr
}
const xticks = computed(() => ticks(props.xmin, props.xmax))

// f 곡선 / f' 곡선 점열
const curveF = computed(() => {
  const pts: string[] = []
  const n = 160
  for (let i = 0; i <= n; i++) {
    const x = props.xmin + ((props.xmax - props.xmin) * i) / n
    pts.push(`${sx(x).toFixed(1)},${syT(props.fn(x)).toFixed(1)}`)
  }
  return pts.join(' ')
})
const curveDf = computed(() => {
  const pts: string[] = []
  const n = 160
  for (let i = 0; i <= n; i++) {
    const x = props.xmin + ((props.xmax - props.xmin) * i) / n
    pts.push(`${sx(x).toFixed(1)},${syB(props.dfn(x)).toFixed(1)}`)
  }
  return pts.join(' ')
})

const fx0 = computed(() => props.fn(x0.value))
const slope = computed(() => props.dfn(x0.value))
const tangentY = (x: number) => fx0.value + slope.value * (x - x0.value)
const fmt = (n: number) => Number(n.toFixed(2)).toString()

// 축 위치
const topXAxis = computed(() => syT(0))
const botXAxis = computed(() => syB(0))
const yAxisX = computed(() => sx(0))
const showTopXAxis = computed(() => props.ymin <= 0 && props.ymax >= 0)
const showYAxis = computed(() => props.xmin <= 0 && props.xmax >= 0)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <!-- 위: f(x) 와 접선 -->
    <p class="mb-1 text-center text-sm font-semibold text-slate-600">
      {{ labelF || 'f(x)' }} · x = {{ fmt(x0) }} 에서 접선 기울기 =
      <b class="text-red-600">{{ fmt(slope) }}</b>
    </p>
    <div class="flex justify-center">
      <svg :viewBox="`0 0 ${width} ${topH}`" :width="width" :height="topH"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50">
        <g stroke="#e2e8f0" stroke-width="1">
          <line v-for="t in xticks" :key="'tx' + t" :x1="sx(t)" :y1="0" :x2="sx(t)" :y2="topH" />
        </g>
        <g stroke="#94a3b8" stroke-width="1.3">
          <line v-if="showTopXAxis" :x1="0" :y1="topXAxis" :x2="width" :y2="topXAxis" />
          <line v-if="showYAxis" :x1="yAxisX" :y1="0" :x2="yAxisX" :y2="topH" />
        </g>
        <!-- x0 세로 안내선 (두 패널 연결) -->
        <line :x1="sx(x0)" :y1="0" :x2="sx(x0)" :y2="topH" stroke="#c7d2fe" stroke-width="1.5" stroke-dasharray="4 3" />
        <!-- 접선 -->
        <line :x1="sx(xmin)" :y1="syT(tangentY(xmin))" :x2="sx(xmax)" :y2="syT(tangentY(xmax))"
          stroke="#ef4444" stroke-width="2.5" />
        <!-- 곡선 -->
        <polyline :points="curveF" fill="none" stroke="#6366f1" stroke-width="2.5" />
        <!-- 접점 -->
        <circle :cx="sx(x0)" :cy="syT(fx0)" r="6" fill="#fff" stroke="#6366f1" stroke-width="3" />
      </svg>
    </div>

    <div class="my-1 text-center text-lg text-slate-300">↕ 같은 x, 위 기울기 = 아래 높이</div>

    <!-- 아래: f'(x) 도함수 그래프 -->
    <p class="mb-1 text-center text-sm font-semibold text-slate-600">
      {{ labelDf || "f'(x)" }} · 점 높이 =
      <b class="text-red-600">{{ fmt(slope) }}</b>
    </p>
    <div class="flex justify-center">
      <svg :viewBox="`0 0 ${width} ${botH}`" :width="width" :height="botH"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50">
        <g stroke="#e2e8f0" stroke-width="1">
          <line v-for="t in xticks" :key="'bx' + t" :x1="sx(t)" :y1="0" :x2="sx(t)" :y2="botH" />
        </g>
        <g stroke="#94a3b8" stroke-width="1.3">
          <line :x1="0" :y1="botXAxis" :x2="width" :y2="botXAxis" />
          <line v-if="showYAxis" :x1="yAxisX" :y1="0" :x2="yAxisX" :y2="botH" />
        </g>
        <line :x1="sx(x0)" :y1="0" :x2="sx(x0)" :y2="botH" stroke="#c7d2fe" stroke-width="1.5" stroke-dasharray="4 3" />
        <!-- 도함수 곡선 -->
        <polyline :points="curveDf" fill="none" stroke="#10b981" stroke-width="2.5" />
        <!-- 현재 기울기 높이 표시 -->
        <line :x1="sx(x0)" :y1="botXAxis" :x2="sx(x0)" :y2="syB(slope)" stroke="#ef4444" stroke-width="2" />
        <circle :cx="sx(x0)" :cy="syB(slope)" r="6" fill="#fff" stroke="#10b981" stroke-width="3" />
      </svg>
    </div>

    <!-- 슬라이더 -->
    <div class="mt-4 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-24 shrink-0 text-slate-500">점 x =
          <b class="text-slate-800">{{ fmt(x0) }}</b></span>
        <input v-model.number="x0" type="range" :min="xmin" :max="xmax" :step="xstep" class="flex-1 accent-indigo-500" />
      </label>
    </div>
    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      슬라이더를 움직여 보세요. 위 <b class="text-red-500">접선</b>의 기울기 값이 그대로
      아래 <b class="text-emerald-600">도함수 f'(x)</b> 그래프의 <b>점 높이</b>로 나타납니다.
      "모든 점의 기울기를 모은 것"이 바로 도함수예요.
    </p>
  </div>
</template>
