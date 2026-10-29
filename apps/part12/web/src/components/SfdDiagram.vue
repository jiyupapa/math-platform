<script setup lang="ts">
// 12부 공용 — 저량-유량도(SFD, stock and flow diagram) 그리기.
// 저량 = 상자(물 높이 칠하기 가능), 유량 = 두 줄 파이프 + 밸브(나비 모양), 구름 = 시스템 밖,
// 보조변수 = 작은 원, 정보 화살표 = 가는 곡선. 좌표는 부모가 정한다(그리기만 한다).
// 유량·보조변수 글자와 부호는 카드 바탕색 테두리(paint-order: stroke)를 둘러, 정보 화살표가 지나가도 읽힌다.
import { computed, useId } from 'vue'
import type { SfdStock, SfdFlow, SfdAux, SfdLink } from '@/data/plot'

const props = withDefaults(
  defineProps<{
    stocks?: SfdStock[]
    flows?: SfdFlow[]
    aux?: SfdAux[]
    links?: SfdLink[]
    width?: number
    height?: number
    ariaLabel?: string
  }>(),
  { stocks: () => [], flows: () => [], aux: () => [], links: () => [], width: 440, height: 200 },
)

const linkArrow = `sfd-l-${useId()}`

function valveOf(f: SfdFlow): { x: number; y: number; angle: number } {
  const pts = f.path
  if (f.valve) {
    // 밸브가 놓인 구간의 방향
    let angle = 0
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i]
      const [x2, y2] = pts[i + 1]
      const onX = Math.min(x1, x2) - 1 <= f.valve[0] && f.valve[0] <= Math.max(x1, x2) + 1
      const onY = Math.min(y1, y2) - 1 <= f.valve[1] && f.valve[1] <= Math.max(y1, y2) + 1
      if (onX && onY) angle = Math.atan2(y2 - y1, x2 - x1)
    }
    return { x: f.valve[0], y: f.valve[1], angle }
  }
  // 가장 긴 구간의 가운데
  let best = 0
  let bi = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
    if (l > best) {
      best = l
      bi = i
    }
  }
  const [x1, y1] = pts[bi]
  const [x2, y2] = pts[bi + 1]
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2, angle: Math.atan2(y2 - y1, x2 - x1) }
}

const flowGeo = computed(() =>
  props.flows.map((f) => {
    const d = f.path.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join('')
    const n = f.path.length
    const [ex, ey] = f.path[n - 1]
    const [px, py] = f.path[n - 2]
    const a = Math.atan2(ey - py, ex - px)
    // 끝 화살촉(채운 삼각형)
    const head = `M${ex},${ey}L${ex - 12 * Math.cos(a) + 8 * Math.sin(a)},${ey - 12 * Math.sin(a) - 8 * Math.cos(a)}L${ex - 12 * Math.cos(a) - 8 * Math.sin(a)},${ey - 12 * Math.sin(a) + 8 * Math.cos(a)}Z`
    const v = valveOf(f)
    return { f, d, head, v, start: f.path[0], end: f.path[n - 1] }
  }),
)

function linkPath(l: SfdLink): string {
  const [x1, y1] = l.from
  const [x2, y2] = l.to
  const dist = Math.hypot(x2 - x1, y2 - y1) || 1
  const b = l.bend ?? 0.2
  const cx = (x1 + x2) / 2 + (-(y2 - y1) / dist) * b * dist
  const cy = (y1 + y2) / 2 + ((x2 - x1) / dist) * b * dist
  return `M${x1},${y1}Q${cx},${cy} ${x2},${y2}`
}
function linkSign(l: SfdLink): { x: number; y: number } {
  const [x1, y1] = l.from
  const [x2, y2] = l.to
  const dist = Math.hypot(x2 - x1, y2 - y1) || 1
  const b = l.bend ?? 0.2
  const cx = (x1 + x2) / 2 + (-(y2 - y1) / dist) * b * dist
  const cy = (y1 + y2) / 2 + ((x2 - x1) / dist) * b * dist
  const t = 0.8
  return {
    x: (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2,
    y: (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2 - 9,
  }
}
</script>

<template>
  <div class="overflow-x-auto">
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    class="mx-auto h-auto w-full"
    :style="{ minWidth: Math.min(width * 0.8, 300) + 'px', maxWidth: width * 1.25 + 'px' }"
    role="img"
    :aria-label="ariaLabel ?? '저량-유량도'"
  >
    <defs>
      <marker :id="linkArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0,0L10,5L0,10z" fill="var(--c-slate-400)" />
      </marker>
    </defs>

    <!-- 그림 읽기 단계의 '이번에 새로 그린 것'(mark) — 맨 아래에 호박색 바탕을 깔아 둘러 보이게 -->
    <g>
      <template v-for="(l, i) in links" :key="'mk' + i">
        <path v-if="l.mark" :d="linkPath(l)" fill="none" stroke="var(--c-amber-200)" stroke-width="9" stroke-linecap="round" />
      </template>
      <template v-for="g in flowGeo" :key="'mf' + g.f.id">
        <path v-if="g.f.mark === true" :d="g.d" fill="none" stroke="var(--c-amber-200)" stroke-width="24" stroke-linejoin="round" stroke-linecap="round" />
        <circle v-if="g.f.mark === 'valve'" :cx="g.v.x" :cy="g.v.y - 5" r="21" fill="var(--c-amber-200)" />
        <template v-if="g.f.mark === 'cloud'">
          <circle v-if="g.f.fromCloud" :cx="g.start[0] + 1" :cy="g.start[1] + 1" r="22" fill="var(--c-amber-200)" />
          <circle v-if="g.f.toCloud" :cx="g.end[0] + 1" :cy="g.end[1] + 1" r="22" fill="var(--c-amber-200)" />
        </template>
      </template>
      <template v-for="s in stocks" :key="'ms' + s.id">
        <rect
          v-if="s.mark"
          :x="s.x - (s.w ?? 120) / 2 - 7"
          :y="s.y - (s.h ?? 56) / 2 - 7"
          :width="(s.w ?? 120) + 14"
          :height="(s.h ?? 56) + 14"
          rx="10"
          fill="var(--c-amber-200)"
        />
      </template>
      <template v-for="a in aux" :key="'ma' + a.id">
        <circle v-if="a.mark" :cx="a.x" :cy="a.y" r="13" fill="var(--c-amber-200)" />
      </template>
    </g>

    <!-- 정보 화살표 (가는 선) -->
    <g v-for="(l, i) in links" :key="'k' + i">
      <path :d="linkPath(l)" fill="none" stroke="var(--c-slate-400)" stroke-width="1.4" :marker-end="`url(#${linkArrow})`" />
      <text
        v-if="l.sign"
        :x="linkSign(l).x"
        :y="linkSign(l).y"
        text-anchor="middle"
        font-size="13"
        font-weight="700"
        :fill="l.sign === '+' ? 'var(--c-indigo-600)' : 'var(--c-rose-600)'"
        stroke="var(--c-white)" stroke-width="3.5" stroke-linejoin="round" paint-order="stroke"
      >{{ l.sign }}</text>
    </g>

    <!-- 유량: 두 줄 파이프 + 화살촉 -->
    <g v-for="g in flowGeo" :key="'f' + g.f.id">
      <path :d="g.d" fill="none" stroke="var(--c-slate-500)" stroke-width="10" stroke-linejoin="round" />
      <path :d="g.d" fill="none" stroke="var(--c-white)" stroke-width="5" stroke-linejoin="round" />
      <path :d="g.head" fill="var(--c-slate-500)" />
    </g>

    <!-- 구름(시스템 밖) -->
    <g v-for="g in flowGeo" :key="'c' + g.f.id">
      <g v-if="g.f.fromCloud" :transform="`translate(${g.start[0]},${g.start[1]})`">
        <circle cx="-7" cy="2" r="9" fill="var(--c-white)" stroke="var(--c-slate-400)" />
        <circle cx="5" cy="-4" r="10" fill="var(--c-white)" stroke="var(--c-slate-400)" />
        <circle cx="8" cy="6" r="8" fill="var(--c-white)" stroke="var(--c-slate-400)" />
        <ellipse cx="2" cy="2" rx="10" ry="7" fill="var(--c-white)" />
      </g>
      <g v-if="g.f.toCloud" :transform="`translate(${g.end[0]},${g.end[1]})`">
        <circle cx="-7" cy="2" r="9" fill="var(--c-white)" stroke="var(--c-slate-400)" />
        <circle cx="5" cy="-4" r="10" fill="var(--c-white)" stroke="var(--c-slate-400)" />
        <circle cx="8" cy="6" r="8" fill="var(--c-white)" stroke="var(--c-slate-400)" />
        <ellipse cx="2" cy="2" rx="10" ry="7" fill="var(--c-white)" />
      </g>
    </g>

    <!-- 밸브 + 이름 -->
    <g v-for="g in flowGeo" :key="'v' + g.f.id">
      <g :transform="`translate(${g.v.x},${g.v.y}) rotate(${(g.v.angle * 180) / Math.PI})`">
        <path d="M-10,-9L-10,9L0,0ZM10,-9L10,9L0,0Z" fill="var(--c-white)" stroke="var(--c-slate-600)" stroke-width="1.5" stroke-linejoin="round" />
      </g>
      <line :x1="g.v.x" :y1="g.v.y" :x2="g.v.x" :y2="g.v.y - 13" stroke="var(--c-slate-600)" stroke-width="1.5" />
      <circle :cx="g.v.x" :cy="g.v.y - 15" r="3" fill="var(--c-white)" stroke="var(--c-slate-600)" stroke-width="1.5" />
      <text
        :x="g.v.x"
        :y="g.f.labelAbove ? g.v.y - 24 : g.v.y + 25"
        text-anchor="middle"
        font-size="12.5"
        font-weight="600"
        fill="var(--c-slate-700)"
        stroke="var(--c-white)" stroke-width="3.5" stroke-linejoin="round" paint-order="stroke"
      >{{ g.f.label }}</text>
      <text
        v-if="g.f.rate"
        :x="g.v.x"
        :y="g.f.labelAbove ? g.v.y - 38 : g.v.y + 40"
        text-anchor="middle"
        font-size="12"
        fill="var(--c-indigo-600)"
        font-weight="600"
        stroke="var(--c-white)" stroke-width="3.5" stroke-linejoin="round" paint-order="stroke"
      >{{ g.f.rate }}</text>
    </g>

    <!-- 저량(상자) -->
    <g v-for="s in stocks" :key="'s' + s.id">
      <rect
        :x="s.x - (s.w ?? 120) / 2"
        :y="s.y - (s.h ?? 56) / 2"
        :width="s.w ?? 120"
        :height="s.h ?? 56"
        rx="4"
        fill="var(--c-white)"
      />
      <rect
        v-if="s.level !== undefined"
        :x="s.x - (s.w ?? 120) / 2"
        :y="s.y + (s.h ?? 56) / 2 - (s.h ?? 56) * Math.max(0, Math.min(1, s.level))"
        :width="s.w ?? 120"
        :height="(s.h ?? 56) * Math.max(0, Math.min(1, s.level))"
        fill="var(--c-sky-500)"
        opacity="0.28"
      />
      <rect
        :x="s.x - (s.w ?? 120) / 2"
        :y="s.y - (s.h ?? 56) / 2"
        :width="s.w ?? 120"
        :height="s.h ?? 56"
        rx="4"
        fill="none"
        stroke="var(--c-slate-700)"
        stroke-width="1.8"
      />
      <text :x="s.x" :y="s.value ? s.y - 3 : s.y + 5" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--c-slate-800)">{{ s.label }}</text>
      <text v-if="s.value" :x="s.x" :y="s.y + 16" text-anchor="middle" font-size="12.5" font-weight="600" fill="var(--c-indigo-600)">{{ s.value }}</text>
    </g>

    <!-- 보조변수·상수 -->
    <g v-for="a in aux" :key="'a' + a.id">
      <circle :cx="a.x" :cy="a.y" r="5.5" fill="var(--c-white)" stroke="var(--c-slate-500)" stroke-width="1.5" />
      <text :x="a.x" :y="a.y - 10" text-anchor="middle" font-size="12" font-weight="600" fill="var(--c-slate-700)" stroke="var(--c-white)" stroke-width="3.5" stroke-linejoin="round" paint-order="stroke">{{ a.label }}</text>
      <text v-if="a.value" :x="a.x" :y="a.y + 19" text-anchor="middle" font-size="12" fill="var(--c-indigo-600)" stroke="var(--c-white)" stroke-width="3.5" stroke-linejoin="round" paint-order="stroke">{{ a.value }}</text>
    </g>
  </svg>
  </div>
</template>
