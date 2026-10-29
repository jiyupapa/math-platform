<script setup lang="ts">
// 12부 공용 — 인과지도(CLD, causal loop diagram) 그리기.
// 변수(글자)·화살표(+/−)·지연 표시(∥)·루프 표시(R/B)를 좌표대로 그린다. 계산은 하지 않는다.
// 색은 토큰만: + 남색, − 장미색, 정해지지 않음(?) 호박색, R 루프 장미색, B 루프 파랑.
import { computed, useId } from 'vue'
import type { CldNode, CldLink, CldLoop } from '@/data/plot'

const props = withDefaults(
  defineProps<{
    nodes: CldNode[]
    links: CldLink[]
    loops?: CldLoop[]
    width?: number
    height?: number
    ariaLabel?: string
  }>(),
  { loops: () => [], width: 440, height: 260 },
)

const uid = useId()
const arrowId = `cld-a-${uid}`
const arrowHiId = `cld-h-${uid}`

// 글자 폭 추정 — 한글 14px, 나머지 8px (14px 글꼴 기준)
function textW(s: string): number {
  let w = 0
  for (const ch of s) w += /[ㄱ-힝]/.test(ch) ? 14 : 8
  return w
}
const boxes = computed(() => {
  const m = new Map<string, { x: number; y: number; hw: number; hh: number; node: CldNode }>()
  for (const n of props.nodes) m.set(n.id, { x: n.x, y: n.y, hw: textW(n.label) / 2 + 8, hh: 14, node: n })
  return m
})

// 상자 중심에서 방향 (ux,uy) 로 나가는 반직선이 상자 테두리를 만나는 거리
function exitT(hw: number, hh: number, ux: number, uy: number): number {
  const tx = Math.abs(ux) < 1e-9 ? Infinity : hw / Math.abs(ux)
  const ty = Math.abs(uy) < 1e-9 ? Infinity : hh / Math.abs(uy)
  return Math.min(tx, ty) + 4
}

interface Geo {
  d: string
  sign: { x: number; y: number }
  delay?: string
  link: CldLink
  /** 곡선 위 점(약 4px 간격) — 루프 이름이 선과 겹치는지 셀 때 쓴다 */
  pts: { x: number; y: number }[]
}

const geos = computed<Geo[]>(() =>
  props.links.flatMap((link) => {
    const a = boxes.value.get(link.from)
    const b = boxes.value.get(link.to)
    if (!a || !b) return []
    const dx = b.x - a.x
    const dy = b.y - a.y
    const dist = Math.hypot(dx, dy) || 1
    const nx = -dy / dist
    const ny = dx / dist
    const bend = link.bend ?? 0
    const cx = (a.x + b.x) / 2 + nx * bend * dist
    const cy = (a.y + b.y) / 2 + ny * bend * dist
    // 시작·끝 = 상자 테두리
    let ux = cx - a.x
    let uy = cy - a.y
    let ul = Math.hypot(ux, uy) || 1
    const ta = exitT(a.hw, a.hh, ux / ul, uy / ul)
    const sx = a.x + (ux / ul) * ta
    const sy = a.y + (uy / ul) * ta
    ux = cx - b.x
    uy = cy - b.y
    ul = Math.hypot(ux, uy) || 1
    const tb = exitT(b.hw, b.hh, ux / ul, uy / ul) + 3
    const ex = b.x + (ux / ul) * tb
    const ey = b.y + (uy / ul) * tb
    const at = (t: number) => ({
      x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * ex,
      y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ey,
    })
    const tan = (t: number) => {
      const tx = 2 * (1 - t) * (cx - sx) + 2 * t * (ex - cx)
      const ty = 2 * (1 - t) * (cy - sy) + 2 * t * (ey - cy)
      const l = Math.hypot(tx, ty) || 1
      return { x: tx / l, y: ty / l }
    }
    // 부호는 끝 가까이(t = 0.78), 휘어진 바깥쪽에. 변수 상자에 닿으면 곡선을 따라 조금씩 옮긴다.
    const side = bend >= 0 ? 1 : -1
    const signAt = (t: number, off: number) => {
      const p = at(t)
      const tg = tan(t)
      return { x: p.x - tg.y * off * side, y: p.y + tg.x * off * side }
    }
    const hitsBox = (s: { x: number; y: number }) =>
      [...boxes.value.values()].some((b) => Math.abs(s.x - b.x) < b.hw + 9 && Math.abs(s.y - b.y) < b.hh + 9)
    let sign = signAt(0.78, 12)
    for (const [t, off] of [[0.78, 12], [0.72, 12], [0.66, 12], [0.84, 12], [0.6, 12], [0.78, 16]]) {
      const s = signAt(t, off)
      if (!hitsBox(s)) {
        sign = s
        break
      }
    }
    let delay: string | undefined
    if (link.delay) {
      const pm = at(0.5)
      const tm = tan(0.5)
      const px = -tm.y
      const py = tm.x
      delay = [-3, 3]
        .map((o) => {
          const bx = pm.x + tm.x * o
          const by = pm.y + tm.y * o
          return `M${bx - px * 7},${by - py * 7}L${bx + px * 7},${by + py * 7}`
        })
        .join('')
    }
    const n = Math.max(8, Math.ceil((Math.hypot(cx - sx, cy - sy) + Math.hypot(ex - cx, ey - cy)) / 4))
    const pts = Array.from({ length: n + 1 }, (_, i) => at(i / n))
    return [{ d: `M${sx},${sy}Q${cx},${cy} ${ex},${ey}`, sign, delay, link, pts }]
  }),
)

const signColor = (s: CldLink['sign']) =>
  s === '+' ? 'var(--c-indigo-600)' : s === '−' ? 'var(--c-rose-600)' : 'var(--c-amber-600)'
const loopColor = (t: CldLoop['type']) => (t === 'R' ? 'var(--c-rose-600)' : 'var(--c-blue-600)')
// 루프 기호: 열린 원호 + 화살촉
function loopArc(l: CldLoop): string {
  const r = 15
  const a0 = (-70 * Math.PI) / 180
  const a1 = (220 * Math.PI) / 180
  const x0 = l.x + r * Math.cos(a0)
  const y0 = l.y + r * Math.sin(a0)
  const x1 = l.x + r * Math.cos(a1)
  const y1 = l.y + r * Math.sin(a1)
  return `M${x0},${y0}A${r},${r} 0 1 1 ${x1},${y1}`
}
function loopHead(l: CldLoop): string {
  const r = 15
  const a = (-70 * Math.PI) / 180
  const x = l.x + r * Math.cos(a)
  const y = l.y + r * Math.sin(a)
  return `M${x - 6},${y - 3}L${x},${y}L${x - 2},${y + 6}`
}

// 루프 이름 자리 — 기호 아래 가운데가 기본. 변수 상자·부호·다른 루프와 겹치거나 화살표가 지나가면
// 아래·위에서 옆으로 비켜 선 자리, 오른쪽·왼쪽 중 덜 겹치는 곳으로 옮긴다. 글자 폭은 12.5px 기준 추정(한글 12.5, 나머지 7).
function labelW(s: string): number {
  let w = 0
  for (const ch of s) w += /[ㄱ-힝]/.test(ch) ? 12.5 : 7
  return w
}
const loopLabels = computed(() => {
  const placed: { x0: number; y0: number; x1: number; y1: number }[] = []
  return props.loops.map((l) => {
    if (!l.label) return null
    const w = labelW(l.label)
    const cands: { x: number; y: number; anchor: 'start' | 'middle' | 'end'; x0: number; pref: number }[] = []
    for (const [dy, base] of [[33, 0], [-22, 3]]) {
      for (const k of [0, -0.25, 0.25, -0.5, 0.5]) {
        cands.push({ x: l.x + k * w, y: l.y + dy, anchor: 'middle', x0: l.x + k * w - w / 2, pref: base + Math.abs(k) * 4 })
      }
    }
    cands.push({ x: l.x + 21, y: l.y + 5, anchor: 'start', x0: l.x + 21, pref: 4 })
    cands.push({ x: l.x - 21, y: l.y + 5, anchor: 'end', x0: l.x - 21 - w, pref: 5 })
    const near = (r: { x0: number; y0: number; x1: number; y1: number }, x: number, y: number) =>
      Math.hypot(Math.max(r.x0, Math.min(x, r.x1)) - x, Math.max(r.y0, Math.min(y, r.y1)) - y)
    let best = cands[0]
    let bestScore = Infinity
    for (const c of cands) {
      const r = { x0: c.x0 - 2, x1: c.x0 + w + 2, y0: c.y - 12, y1: c.y + 4 }
      let score = c.pref
      if (r.x0 < 0 || r.x1 > props.width || r.y0 < 0 || r.y1 > props.height) score += 1000
      for (const b of boxes.value.values()) {
        if (!(r.x1 < b.x - b.hw || r.x0 > b.x + b.hw || r.y1 < b.y - b.hh || r.y0 > b.y + b.hh)) score += 100
      }
      for (const g of geos.value) {
        if (near(r, g.sign.x, g.sign.y) < 9) score += 100
        // 선이 글자에 닿기만 해도 센다(3px 여유) — 선을 따라 붙은 이름은 화살표 이름처럼 읽힌다
        for (const p of g.pts) if (p.x > r.x0 - 3 && p.x < r.x1 + 3 && p.y > r.y0 - 3 && p.y < r.y1 + 3) score += 1
      }
      for (const o of props.loops) if (o !== l && near(r, o.x, o.y) < 18) score += 100
      for (const q of placed) if (!(r.x1 < q.x0 || r.x0 > q.x1 || r.y1 < q.y0 || r.y0 > q.y1)) score += 100
      if (score < bestScore) {
        bestScore = score
        best = c
      }
    }
    placed.push({ x0: best.x0, x1: best.x0 + w, y0: best.y - 12, y1: best.y + 4 })
    return { x: best.x, y: best.y, anchor: best.anchor, text: l.label, color: loopColor(l.type) }
  })
})
</script>

<template>
  <div class="overflow-x-auto">
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    class="mx-auto h-auto w-full"
    :style="{ minWidth: Math.min(width * 0.8, 300) + 'px', maxWidth: width * 1.25 + 'px' }"
    role="img"
    :aria-label="ariaLabel ?? '인과지도'"
  >
    <defs>
      <marker :id="arrowId" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,0L10,5L0,10z" fill="var(--c-slate-500)" />
      </marker>
      <marker :id="arrowHiId" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,0L10,5L0,10z" fill="var(--c-indigo-600)" />
      </marker>
    </defs>

    <!-- 그림 읽기 단계의 '이번에 새로 그린 것'(mark) — 맨 아래에 호박색 바탕을 깔아 둘러 보이게 -->
    <g>
      <template v-for="(g, i) in geos" :key="'m' + i">
        <path v-if="g.link.mark" :d="g.d" fill="none" stroke="var(--c-amber-200)" stroke-width="10" stroke-linecap="round" />
        <circle v-if="g.link.mark" :cx="g.sign.x" :cy="g.sign.y" r="13" fill="var(--c-amber-200)" />
      </template>
      <template v-for="n in nodes" :key="'mn' + n.id">
        <rect
          v-if="n.mark"
          :x="n.x - (boxes.get(n.id)?.hw ?? 30) - 6"
          :y="n.y - 20"
          :width="((boxes.get(n.id)?.hw ?? 30) + 6) * 2"
          height="40"
          rx="9"
          fill="var(--c-amber-200)"
        />
      </template>
      <template v-for="(l, i) in loops" :key="'ml' + i">
        <circle v-if="l.mark" :cx="l.x" :cy="l.y" r="24" fill="var(--c-amber-200)" />
      </template>
    </g>

    <!-- 화살표 -->
    <g fill="none">
      <template v-for="(g, i) in geos" :key="'l' + i">
        <path
          :d="g.d"
          :stroke="g.link.hi ? 'var(--c-indigo-600)' : 'var(--c-slate-500)'"
          :stroke-width="g.link.hi ? 2.6 : 1.6"
          :marker-end="`url(#${g.link.hi ? arrowHiId : arrowId})`"
        />
        <path v-if="g.delay" :d="g.delay" stroke="var(--c-slate-600)" stroke-width="2" />
      </template>
    </g>

    <!-- 부호 -->
    <g v-for="(g, i) in geos" :key="'s' + i">
      <circle :cx="g.sign.x" :cy="g.sign.y" r="8.5" fill="var(--c-white)" />
      <text
        :x="g.sign.x"
        :y="g.sign.y + 5"
        text-anchor="middle"
        font-size="16"
        font-weight="700"
        :fill="signColor(g.link.sign)"
      >{{ g.link.sign }}</text>
    </g>

    <!-- 변수 -->
    <g v-for="n in nodes" :key="n.id">
      <rect
        :x="n.x - (boxes.get(n.id)?.hw ?? 30)"
        :y="n.y - 14"
        :width="(boxes.get(n.id)?.hw ?? 30) * 2"
        height="28"
        rx="4"
        fill="var(--c-white)"
        :stroke="n.stock ? 'var(--c-slate-600)' : 'none'"
        :stroke-width="n.stock ? 1.6 : 0"
      />
      <text :x="n.x" :y="n.y + 5" text-anchor="middle" font-size="14" font-weight="600" fill="var(--c-slate-800)">{{ n.label }}</text>
    </g>

    <!-- 루프 표시 -->
    <g v-for="(l, i) in loops" :key="'p' + i">
      <path :d="loopArc(l)" fill="none" :stroke="loopColor(l.type)" stroke-width="2" />
      <path :d="loopHead(l)" fill="none" :stroke="loopColor(l.type)" stroke-width="2" stroke-linejoin="round" />
      <text :x="l.x" :y="l.y + 5.5" text-anchor="middle" font-size="15" font-weight="800" :fill="loopColor(l.type)">{{ l.type }}</text>
    </g>
    <!-- 루프 이름 — 카드 바탕색 테두리를 둘러 화살표가 지나가도 글자가 읽힌다 -->
    <template v-for="(t, i) in loopLabels" :key="'pl' + i">
      <text
        v-if="t"
        :x="t.x"
        :y="t.y"
        :text-anchor="t.anchor"
        font-size="12.5"
        font-weight="600"
        :fill="t.color"
        stroke="var(--c-white)"
        stroke-width="4"
        stroke-linejoin="round"
        paint-order="stroke"
      >{{ t.text }}</text>
    </template>
  </svg>
  </div>
</template>
