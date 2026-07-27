<script setup lang="ts">
// Phase 8 전용 인터랙티브 — 편미분을 '단면의 기울기'로 이해한다.
// 위: f(x,y) 를 색(히트맵)으로 그리고, 점 (x0,y0) 를 지나는 두 절단선을 표시.
//  - 가로선(y=y0 고정): x 방향 단면 → 그 단면 곡선의 기울기 = ∂f/∂x
//  - 세로선(x=x0 고정): y 방향 단면 → 그 단면 곡선의 기울기 = ∂f/∂y
// 아래: 두 단면 곡선과 각각의 접선(현재 점에서). 슬라이더로 x0, y0 를 움직인다.
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    f: (x: number, y: number) => number
    dfx: (x: number, y: number) => number
    dfy: (x: number, y: number) => number
    xmin?: number
    xmax?: number
    ymin?: number
    ymax?: number
    initialX?: number
    initialY?: number
    heat?: number // 히트맵 한 변 셀 개수
  }>(),
  { xmin: -3, xmax: 3, ymin: -3, ymax: 3, initialX: 1, initialY: 1, heat: 24 },
)

const x0 = ref(props.initialX)
const y0 = ref(props.initialY)

const H = 220 // 히트맵 픽셀
const CW = 220 // 단면 그래프 너비
const CH = 160 // 단면 그래프 높이

// 히트맵 셀 + 전역 값 범위
const cells = computed(() => {
  const n = props.heat
  const out: { x: number; y: number; w: number; h: number; v: number }[] = []
  let vmin = Infinity
  let vmax = -Infinity
  const cw = H / n
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const mx = props.xmin + ((props.xmax - props.xmin) * (i + 0.5)) / n
      const my = props.ymin + ((props.ymax - props.ymin) * (j + 0.5)) / n
      const v = props.f(mx, my)
      vmin = Math.min(vmin, v)
      vmax = Math.max(vmax, v)
      out.push({ x: i * cw, y: H - (j + 1) * cw, w: cw + 0.5, h: cw + 0.5, v })
    }
  }
  return { list: out, vmin, vmax }
})
function heatColor(v: number) {
  const { vmin, vmax } = cells.value
  const t = vmax > vmin ? (v - vmin) / (vmax - vmin) : 0
  const light = 94 - 52 * t // 값 클수록 진한 파랑
  return `hsl(226 70% ${light}%)`
}

// 히트맵 좌표
const sxH = (x: number) => ((x - props.xmin) / (props.xmax - props.xmin)) * H
const syH = (y: number) => H - ((y - props.ymin) / (props.ymax - props.ymin)) * H

// 단면 그래프 값축(공통, 전역 범위)
const vmin = computed(() => cells.value.vmin)
const vmax = computed(() => cells.value.vmax)
const syV = (v: number) =>
  CH - ((v - vmin.value) / (vmax.value - vmin.value || 1)) * CH

// x 방향 단면: g(x) = f(x, y0)
const sxL = (x: number) => ((x - props.xmin) / (props.xmax - props.xmin)) * CW
const gCurve = computed(() => {
  const pts: string[] = []
  const n = 120
  for (let i = 0; i <= n; i++) {
    const x = props.xmin + ((props.xmax - props.xmin) * i) / n
    pts.push(`${sxL(x).toFixed(1)},${syV(props.f(x, y0.value)).toFixed(1)}`)
  }
  return pts.join(' ')
})
const gx0 = computed(() => props.f(x0.value, y0.value))
const dfxVal = computed(() => props.dfx(x0.value, y0.value))
const gTan = (x: number) => gx0.value + dfxVal.value * (x - x0.value)

// y 방향 단면: h(y) = f(x0, y)
const sxR = (y: number) => ((y - props.ymin) / (props.ymax - props.ymin)) * CW
const hCurve = computed(() => {
  const pts: string[] = []
  const n = 120
  for (let i = 0; i <= n; i++) {
    const y = props.ymin + ((props.ymax - props.ymin) * i) / n
    pts.push(`${sxR(y).toFixed(1)},${syV(props.f(x0.value, y)).toFixed(1)}`)
  }
  return pts.join(' ')
})
const hy0 = computed(() => props.f(x0.value, y0.value))
const dfyVal = computed(() => props.dfy(x0.value, y0.value))
const hTan = (y: number) => hy0.value + dfyVal.value * (y - y0.value)

const fmt = (n: number) => Number(n.toFixed(2)).toString()
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <!-- 히트맵 -->
    <p class="mb-1 text-center text-sm font-semibold text-slate-600">
      f(x, y) 색지도 · 점 ({{ fmt(x0) }}, {{ fmt(y0) }}) 에서 f = <b class="text-indigo-600">{{ fmt(gx0) }}</b>
    </p>
    <div class="flex justify-center">
      <svg :viewBox="`0 0 ${H} ${H}`" :width="H" :height="H" class="max-w-full rounded-lg border border-slate-100">
        <rect v-for="(c, i) in cells.list" :key="i" :x="c.x" :y="c.y" :width="c.w" :height="c.h" :fill="heatColor(c.v)" />
        <!-- 절단선 -->
        <line :x1="0" :y1="syH(y0)" :x2="H" :y2="syH(y0)" stroke="var(--c-amber-500)" stroke-width="2" stroke-dasharray="5 3" />
        <line :x1="sxH(x0)" :y1="0" :x2="sxH(x0)" :y2="H" stroke="var(--c-emerald-500)" stroke-width="2" stroke-dasharray="5 3" />
        <circle :cx="sxH(x0)" :cy="syH(y0)" r="5" fill="var(--c-white)" stroke="var(--c-slate-900)" stroke-width="2.5" />
        <text :x="6" :y="syH(y0) - 4" font-size="10" fill="var(--c-amber-600)">y=y0 (x방향 단면)</text>
        <text :x="sxH(x0) + 4" :y="14" font-size="10" fill="var(--c-emerald-600)">x=x0 (y방향)</text>
      </svg>
    </div>

    <!-- 두 단면 곡선 -->
    <div class="mt-3 flex flex-wrap justify-center gap-3">
      <div>
        <p class="mb-1 text-center text-xs font-medium text-amber-700">
          x 방향 단면 g(x)=f(x, {{ fmt(y0) }}) · 기울기 ∂f/∂x = <b>{{ fmt(dfxVal) }}</b>
        </p>
        <svg :viewBox="`0 0 ${CW} ${CH}`" :width="CW" :height="CH" class="rounded-lg border border-slate-100 bg-slate-50">
          <line :x1="sxL(x0)" :y1="0" :x2="sxL(x0)" :y2="CH" stroke="var(--c-amber-200)" stroke-width="1.5" />
          <line :x1="sxL(xmin)" :y1="syV(gTan(xmin))" :x2="sxL(xmax)" :y2="syV(gTan(xmax))" stroke="var(--c-red-500)" stroke-width="2" />
          <polyline :points="gCurve" fill="none" stroke="var(--c-amber-500)" stroke-width="2.5" />
          <circle :cx="sxL(x0)" :cy="syV(gx0)" r="5" fill="var(--c-white)" stroke="var(--c-amber-500)" stroke-width="3" />
        </svg>
      </div>
      <div>
        <p class="mb-1 text-center text-xs font-medium text-emerald-700">
          y 방향 단면 h(y)=f({{ fmt(x0) }}, y) · 기울기 ∂f/∂y = <b>{{ fmt(dfyVal) }}</b>
        </p>
        <svg :viewBox="`0 0 ${CW} ${CH}`" :width="CW" :height="CH" class="rounded-lg border border-slate-100 bg-slate-50">
          <line :x1="sxR(y0)" :y1="0" :x2="sxR(y0)" :y2="CH" stroke="var(--c-emerald-200)" stroke-width="1.5" />
          <line :x1="sxR(ymin)" :y1="syV(hTan(ymin))" :x2="sxR(ymax)" :y2="syV(hTan(ymax))" stroke="var(--c-red-500)" stroke-width="2" />
          <polyline :points="hCurve" fill="none" stroke="var(--c-emerald-500)" stroke-width="2.5" />
          <circle :cx="sxR(y0)" :cy="syV(hy0)" r="5" fill="var(--c-white)" stroke="var(--c-emerald-500)" stroke-width="3" />
        </svg>
      </div>
    </div>

    <!-- 슬라이더 -->
    <div class="mt-4 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-20 shrink-0 text-slate-500">x = <b class="text-slate-800">{{ fmt(x0) }}</b></span>
        <input v-model.number="x0" type="range" :min="xmin" :max="xmax" step="0.1" class="flex-1 accent-emerald-500" />
      </label>
      <label class="mt-2 flex items-center gap-3 text-sm">
        <span class="w-20 shrink-0 text-slate-500">y = <b class="text-slate-800">{{ fmt(y0) }}</b></span>
        <input v-model.number="y0" type="range" :min="ymin" :max="ymax" step="0.1" class="flex-1 accent-amber-500" />
      </label>
    </div>

    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      <b class="text-amber-700">∂f/∂x</b> 는 <b>y 를 상수로 고정</b>하고 x 방향으로 자른 단면 곡선의 기울기,
      <b class="text-emerald-700">∂f/∂y</b> 는 <b>x 를 고정</b>하고 y 방향으로 자른 단면의 기울기입니다.
      한 번에 한 방향만 봅니다.
    </p>
  </div>
</template>
