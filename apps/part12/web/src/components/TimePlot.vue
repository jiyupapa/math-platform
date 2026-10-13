<script setup lang="ts">
// 12부 공용 — 시간에 따른 값(저량·유량)을 그리는 SVG 선 그래프.
// 그리기만 한다(값은 부모가 sim.ts 로 계산). 색은 토큰(var(--c-*))만 써서 다크 모드에서 함께 뒤집힌다.
// 폭은 화면에 맞춰 실제 픽셀로 다시 그린다(ResizeObserver) — 휴대폰에서도 글자가 12px 그대로 읽힌다.
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { niceTicks, fmtTick, type PlotSeries, type PlotMarker, type PlotHLine } from '@/data/plot'

const props = withDefaults(
  defineProps<{
    series: PlotSeries[]
    xMin?: number
    xMax: number
    yMin?: number
    yMax?: number
    xLabel?: string
    /** 세로축 단위 — 왼쪽 위에 가로로 쓴다 */
    yLabel?: string
    xTicks?: number[]
    yTicks?: number[]
    markers?: PlotMarker[]
    hlines?: PlotHLine[]
    /** 로그 눈금(밑 10). 0 이하 값은 그리지 않는다 */
    logY?: boolean
    /** 높이(px) */
    height?: number
    legend?: boolean
    ariaLabel?: string
  }>(),
  { xMin: 0, height: 220, legend: true, markers: () => [], hlines: () => [] },
)

const wrap = ref<HTMLElement | null>(null)
const W = ref(600)
let ro: ResizeObserver | null = null
onMounted(() => {
  if (!wrap.value) return
  const set = () => {
    const w = wrap.value?.clientWidth ?? 600
    if (w > 0) W.value = Math.max(260, Math.min(920, Math.round(w)))
  }
  set()
  ro = new ResizeObserver(set)
  ro.observe(wrap.value)
})
onBeforeUnmount(() => ro?.disconnect())

const clipId = `tp-${useId()}`

// 글자 폭 추정(11.5px) — 표시선 이름이 서로 겹치지 않게 줄을 나눌 때 쓴다
function textW(s: string): number {
  let w = 0
  for (const ch of s) w += /[ㄱ-힝]/.test(ch) ? 11.5 : 6.6
  return w
}

function pointsOf(s: PlotSeries): [number, number][] {
  if (s.points) return s.points
  const x0 = s.x0 ?? 0
  const dx = s.dx ?? 1
  return (s.values ?? []).map((v, i) => [x0 + i * dx, v])
}

const yRange = computed(() => {
  let lo = props.yMin
  let hi = props.yMax
  if (lo === undefined || hi === undefined) {
    const ys = props.series.flatMap((s) => pointsOf(s).map((p) => p[1])).filter((v) => isFinite(v) && (!props.logY || v > 0))
    const dataLo = ys.length ? Math.min(...ys) : 0
    const dataHi = ys.length ? Math.max(...ys) : 1
    if (props.logY) {
      lo = lo ?? Math.pow(10, Math.floor(Math.log10(dataLo)))
      hi = hi ?? Math.pow(10, Math.ceil(Math.log10(dataHi)))
    } else {
      const pad = (dataHi - dataLo || 1) * 0.06
      lo = lo ?? Math.min(0, dataLo - pad)
      hi = hi ?? dataHi + pad
    }
  }
  if (hi <= lo) hi = lo + 1
  return { lo, hi }
})

const ML = 46
const MR = 20
const MB = props.xLabel ? 36 : 22

const sx = (x: number) => ML + ((x - props.xMin) / (props.xMax - props.xMin)) * (W.value - ML - MR)

// 위쪽 여백의 글자 줄: 단위(yLabel)와 표시선 이름. 겹치면 왼쪽으로 붙이거나 다음 줄로.
const topLabels = computed(() => {
  const placed: { x: number; y: number; anchor: 'start' | 'end'; text: string; color: string; row: number; x0: number; x1: number }[] = []
  const occupied: { row: number; x0: number; x1: number }[] = []
  if (props.yLabel) occupied.push({ row: 0, x0: 0, x1: 8 + textW(props.yLabel) })
  for (const m of props.markers) {
    if (!m.label) continue
    const w = textW(m.label)
    const mx = sx(m.x)
    const tries: { row: number; anchor: 'start' | 'end' }[] = [
      { row: 0, anchor: 'start' },
      { row: 0, anchor: 'end' },
      { row: 1, anchor: 'start' },
      { row: 1, anchor: 'end' },
    ]
    let chosen = tries[2]
    for (const t of tries) {
      const x0 = t.anchor === 'start' ? mx + 3 : mx - 3 - w
      const x1 = t.anchor === 'start' ? mx + 3 + w : mx - 3
      if (x0 < 2 || x1 > W.value - 2) continue
      if (occupied.some((o) => o.row === t.row && !(x1 < o.x0 - 6 || x0 > o.x1 + 6))) continue
      chosen = t
      break
    }
    const x0 = chosen.anchor === 'start' ? mx + 3 : mx - 3 - w
    occupied.push({ row: chosen.row, x0, x1: x0 + w })
    placed.push({
      x: chosen.anchor === 'start' ? mx + 3 : mx - 3,
      y: 13 + chosen.row * 14,
      anchor: chosen.anchor,
      text: m.label,
      color: m.color ?? 'var(--c-slate-600)',
      row: chosen.row,
      x0,
      x1: x0 + w,
    })
  }
  const rows = placed.some((p) => p.row === 1) ? 2 : placed.length || props.yLabel ? 1 : 0
  return { placed, rows }
})
const MT = computed(() => (topLabels.value.rows === 0 ? 10 : topLabels.value.rows === 1 ? 24 : 38))
const plotW = computed(() => W.value - ML - MR)
const plotH = computed(() => props.height - MT.value - MB)

function sy(y: number): number {
  const { lo, hi } = yRange.value
  if (props.logY) {
    const v = Math.log10(Math.max(y, 1e-12))
    return MT.value + (1 - (v - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * plotH.value
  }
  return MT.value + (1 - (y - lo) / (hi - lo)) * plotH.value
}

const xTickVals = computed(() => {
  if (props.xTicks) {
    // 좁은 화면에선 눈금을 솎는다(글자가 겹치지 않게)
    const room = plotW.value / 26
    if (props.xTicks.length <= room) return props.xTicks
    const step = Math.ceil(props.xTicks.length / room)
    return props.xTicks.filter((_, i) => i % step === 0)
  }
  return niceTicks(props.xMin, props.xMax, Math.max(3, Math.min(8, Math.floor(plotW.value / 70))))
})
const yTickVals = computed(() => {
  if (props.yTicks) return props.yTicks
  const { lo, hi } = yRange.value
  if (props.logY) {
    const out: number[] = []
    for (let e = Math.ceil(Math.log10(lo) - 1e-9); e <= Math.floor(Math.log10(hi) + 1e-9); e++) out.push(Math.pow(10, e))
    return out
  }
  return niceTicks(lo, hi, props.height < 180 ? 3 : 5)
})

function pathOf(s: PlotSeries): string {
  const pts = pointsOf(s).filter(([x, y]) => isFinite(x) && isFinite(y) && (!props.logY || y > 0))
  if (!pts.length) return ''
  if (s.step) {
    const dx = s.dx ?? 1
    let d = ''
    for (const [x, y] of pts) d += `${d ? 'L' : 'M'}${sx(x - dx)},${sy(y)}L${sx(x)},${sy(y)}`
    return d
  }
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(2)},${sy(y).toFixed(2)}`).join('')
}

function areaOf(s: PlotSeries): string {
  const line = pathOf(s)
  if (!line) return ''
  const pts = pointsOf(s).filter(([x, y]) => isFinite(x) && isFinite(y))
  const base = sy(props.logY ? yRange.value.lo : Math.max(yRange.value.lo, 0))
  const first = s.step ? pts[0][0] - (s.dx ?? 1) : pts[0][0]
  const last = pts[pts.length - 1][0]
  return `${line}L${sx(last)},${base}L${sx(first)},${base}Z`
}

// 가로 표시선 이름 자리 — 선 바로 위 오른쪽 끝이 기본. 그 자리로 곡선이 지나가면 선을 따라 왼쪽으로,
// 그래도 안 되면 선 아래로 훑어 곡선이 덜 지나가는 곳을 고른다(곡선은 4px 간격 점으로 센다).
const hlineLabels = computed(() => {
  const labeled = props.hlines.filter((h) => h.label)
  if (!labeled.length) return []
  // [x, y, 여유] — 여유 = 선 굵기의 절반 + 점(dots) 반지름
  const pts: [number, number, number][] = []
  for (const s of props.series) {
    const pad = (s.width ?? 2.2) / 2 + (s.dots ? 3.2 : 0) + 1
    const ps = pointsOf(s)
      .filter(([x, y]) => isFinite(x) && isFinite(y) && (!props.logY || y > 0))
      .map(([x, y]) => [sx(x), sy(y)] as [number, number])
    ps.forEach(([x0, y0], i) => {
      pts.push([x0, y0, pad])
      const nxt = ps[i + 1]
      if (!nxt) return
      const n = Math.min(60, Math.floor(Math.hypot(nxt[0] - x0, nxt[1] - y0) / 4))
      for (let k = 1; k < n; k++) pts.push([x0 + ((nxt[0] - x0) * k) / n, y0 + ((nxt[1] - y0) * k) / n, pad])
    })
  }
  const left = ML + 4
  const right = W.value - MR - 4
  return labeled.map((h) => {
    const text = h.label as string
    const w = textW(text)
    const y = sy(h.y)
    // 오른쪽 끝에서 왼쪽으로 24px 간격, 선 위(−5)와 아래(+14). 왼쪽·아래로 갈수록 조금씩 불리하게
    const cands: { x: number; y: number; x0: number; pref: number }[] = []
    const span = Math.max(0, right - left - w)
    const steps = Math.max(1, Math.floor(span / 24))
    for (const [dy, base] of [[-5, 0], [14, 1.5]]) {
      for (let i = 0; i <= steps; i++) {
        const x0 = right - w - (span * i) / steps
        cands.push({ x: x0, y: y + dy, x0, pref: base + (right - w - x0) / 200 })
      }
    }
    let best = cands[0]
    let bestScore = Infinity
    for (const c of cands) {
      const r = { x0: c.x0 - 2, x1: c.x0 + w + 2, y0: c.y - 11, y1: c.y + 3 }
      let score = c.pref
      if (r.y0 < MT.value - 4 || r.y1 > props.height - MB) score += 1000
      for (const [px, py, pad] of pts) {
        if (px > r.x0 - pad && px < r.x1 + pad && py > r.y0 - pad && py < r.y1 + pad) score += 1
      }
      if (score < bestScore) {
        bestScore = score
        best = c
      }
    }
    return { x: best.x, y: best.y, text, color: h.color ?? 'var(--c-slate-500)' }
  })
})

function dotsOf(s: PlotSeries): [number, number][] {
  return pointsOf(s)
    .filter(([x, y]) => isFinite(y) && x >= props.xMin && x <= props.xMax && y >= yRange.value.lo && y <= yRange.value.hi)
    .map(([x, y]) => [sx(x), sy(y)])
}
</script>

<template>
  <figure ref="wrap" class="my-2">
    <svg
      :viewBox="`0 0 ${W} ${height}`"
      :width="W"
      :height="height"
      class="block h-auto max-w-full"
      role="img"
      :aria-label="ariaLabel ?? series.map((s) => s.label).join(', ')"
    >
      <defs>
        <clipPath :id="clipId">
          <rect :x="ML" :y="MT - 2" :width="plotW" :height="plotH + 4" />
        </clipPath>
      </defs>
      <!-- 격자·눈금 -->
      <g>
        <line
          v-for="t in yTickVals"
          :key="'gy' + t"
          :x1="ML"
          :x2="W - MR"
          :y1="sy(t)"
          :y2="sy(t)"
          stroke="var(--c-grid)"
        />
        <text
          v-for="t in yTickVals"
          :key="'ty' + t"
          :x="ML - 6"
          :y="sy(t) + 4"
          text-anchor="end"
          font-size="12"
          fill="var(--c-slate-500)"
        >{{ fmtTick(t) }}</text>
        <text
          v-for="t in xTickVals"
          :key="'tx' + t"
          :x="sx(t)"
          :y="height - MB + 16"
          text-anchor="middle"
          font-size="12"
          fill="var(--c-slate-500)"
        >{{ fmtTick(t) }}</text>
        <line :x1="ML" :x2="W - MR" :y1="height - MB" :y2="height - MB" stroke="var(--c-slate-300)" />
        <line :x1="ML" :x2="ML" :y1="MT" :y2="height - MB" stroke="var(--c-slate-300)" />
        <text v-if="xLabel" :x="ML + plotW / 2" :y="height - 5" text-anchor="middle" font-size="12" fill="var(--c-slate-600)">{{ xLabel }}</text>
        <text v-if="yLabel" x="4" y="13" font-size="11.5" font-weight="600" fill="var(--c-slate-600)">{{ yLabel }}</text>
      </g>

      <!-- 선·면적 -->
      <g :clip-path="`url(#${clipId})`">
        <line
          v-for="(h, i) in hlines"
          :key="'h' + i"
          :x1="ML"
          :x2="W - MR"
          :y1="sy(h.y)"
          :y2="sy(h.y)"
          :stroke="h.color ?? 'var(--c-slate-400)'"
          stroke-dasharray="5 4"
        />
        <line
          v-for="(m, i) in markers"
          :key="'m' + i"
          :x1="sx(m.x)"
          :x2="sx(m.x)"
          :y1="MT"
          :y2="height - MB"
          :stroke="m.color ?? 'var(--c-slate-400)'"
          stroke-dasharray="3 3"
        />
        <template v-for="(s, i) in series" :key="'s' + i">
          <path v-if="s.area" :d="areaOf(s)" :fill="s.color" opacity="0.14" />
          <path
            :d="pathOf(s)"
            fill="none"
            :stroke="s.color"
            :stroke-width="s.width ?? 2.2"
            :stroke-dasharray="s.dashed ? '6 4' : undefined"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
          <template v-if="s.dots">
            <circle v-for="([cx, cy], j) in dotsOf(s)" :key="j" :cx="cx" :cy="cy" r="3.2" :fill="s.color" stroke="var(--c-white)" stroke-width="1" />
          </template>
        </template>
      </g>
      <!-- 가로 표시선 이름: 곡선이 덜 지나가는 자리에, 카드 바탕색 테두리를 둘러 선 위에서도 읽히게 -->
      <text
        v-for="(t, i) in hlineLabels"
        :key="'hl' + i"
        :x="t.x"
        :y="t.y"
        font-size="11.5"
        :fill="t.color"
        stroke="var(--c-white)"
        stroke-width="3"
        stroke-linejoin="round"
        paint-order="stroke"
      >{{ t.text }}</text>
      <!-- 세로 표시선 이름: 위쪽 여백(겹치면 왼쪽으로·다음 줄로) -->
      <text
        v-for="(p, i) in topLabels.placed"
        :key="'ml' + i"
        :x="p.x"
        :y="p.y"
        :text-anchor="p.anchor"
        font-size="11.5"
        font-weight="600"
        :fill="p.color"
      >{{ p.text }}</text>
    </svg>
    <figcaption v-if="legend && series.length > 1" class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
      <span v-for="(s, i) in series" :key="'lg' + i" class="inline-flex items-center gap-1.5">
        <svg width="22" height="8" aria-hidden="true">
          <line x1="1" x2="21" y1="4" y2="4" :stroke="s.color" stroke-width="2.5" :stroke-dasharray="s.dashed ? '5 3' : undefined" />
        </svg>
        {{ s.label }}
      </span>
    </figcaption>
  </figure>
</template>
