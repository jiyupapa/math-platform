<script setup lang="ts">
// 선형변환 시각화 — 2×2 행렬 [[a,b],[c,d]] 로 격자 전체를 실시간 변형한다.
// 행렬의 열 = 기저벡터가 가는 곳: î(1,0)→(a,c), ĵ(0,1)→(b,d).
import { ref, computed } from 'vue'

const size = 360
const range = 5
const scale = size / (2 * range)

// 행렬 성분 (열이 기저벡터의 도착지)
const a = ref(1)
const b = ref(0)
const c = ref(0)
const d = ref(1)

function toScreen(x: number, y: number) {
  return { X: size / 2 + x * scale, Y: size / 2 - y * scale }
}
function apply(x: number, y: number) {
  return { x: a.value * x + b.value * y, y: c.value * x + d.value * y }
}

interface Seg {
  x1: number
  y1: number
  x2: number
  y2: number
}

// 변환 전 기준 격자 (옅게)
const staticLines = computed<Seg[]>(() => {
  const out: Seg[] = []
  for (let i = -range; i <= range; i++) {
    const v1 = toScreen(i, -range)
    const v2 = toScreen(i, range)
    out.push({ x1: v1.X, y1: v1.Y, x2: v2.X, y2: v2.Y })
    const h1 = toScreen(-range, i)
    const h2 = toScreen(range, i)
    out.push({ x1: h1.X, y1: h1.Y, x2: h2.X, y2: h2.Y })
  }
  return out
})

// 변환 후 격자
const movedLines = computed<Seg[]>(() => {
  const out: Seg[] = []
  for (let i = -range; i <= range; i++) {
    const p1 = apply(i, -range)
    const p2 = apply(i, range)
    const s1 = toScreen(p1.x, p1.y)
    const s2 = toScreen(p2.x, p2.y)
    out.push({ x1: s1.X, y1: s1.Y, x2: s2.X, y2: s2.Y })
    const q1 = apply(-range, i)
    const q2 = apply(range, i)
    const t1 = toScreen(q1.x, q1.y)
    const t2 = toScreen(q2.x, q2.y)
    out.push({ x1: t1.X, y1: t1.Y, x2: t2.X, y2: t2.Y })
  }
  return out
})

const origin = toScreen(0, 0)
const iHat = computed(() => toScreen(a.value, c.value))
const jHat = computed(() => toScreen(b.value, d.value))
const det = computed(() => +(a.value * d.value - b.value * c.value).toFixed(2))

// 단위 정사각형 → 평행사변형 (넓이 = |det|)
const square = computed(() =>
  ([
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ] as const)
    .map(([x, y]) => {
      const p = apply(x, y)
      const s = toScreen(p.x, p.y)
      return `${s.X},${s.Y}`
    })
    .join(' '),
)

function preset(na: number, nb: number, nc: number, nd: number) {
  a.value = na
  b.value = nb
  c.value = nc
  d.value = nd
}
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <div class="flex flex-col gap-4 lg:flex-row">
      <!-- 그림 -->
      <svg
        :width="size"
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
        class="mx-auto shrink-0 rounded-lg bg-slate-50"
      >
        <defs>
          <clipPath id="gt-clip"><rect x="0" y="0" :width="size" :height="size" /></clipPath>
          <marker id="gt-ihat" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill="var(--c-emerald-500)" />
          </marker>
          <marker id="gt-jhat" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill="var(--c-pink-500)" />
          </marker>
        </defs>

        <g :clip-path="`url(#gt-clip)`">
          <!-- 변환 전 기준 격자 -->
          <line
            v-for="(l, i) in staticLines"
            :key="'s' + i"
            :x1="l.x1"
            :y1="l.y1"
            :x2="l.x2"
            :y2="l.y2"
            stroke="var(--c-slate-200)"
            stroke-width="1"
          />
          <!-- 변환된 평행사변형 (단위 정사각형의 상) -->
          <polygon :points="square" fill="var(--c-indigo-500)" fill-opacity="0.12" stroke="none" />
          <!-- 변환된 격자 -->
          <line
            v-for="(l, i) in movedLines"
            :key="'m' + i"
            :x1="l.x1"
            :y1="l.y1"
            :x2="l.x2"
            :y2="l.y2"
            stroke="var(--c-indigo-300)"
            stroke-width="1.5"
          />
          <!-- 기저벡터 î, ĵ -->
          <line
            :x1="origin.X"
            :y1="origin.Y"
            :x2="iHat.X"
            :y2="iHat.Y"
            stroke="var(--c-emerald-500)"
            stroke-width="3"
            marker-end="url(#gt-ihat)"
          />
          <line
            :x1="origin.X"
            :y1="origin.Y"
            :x2="jHat.X"
            :y2="jHat.Y"
            stroke="var(--c-pink-500)"
            stroke-width="3"
            marker-end="url(#gt-jhat)"
          />
          <circle :cx="origin.X" :cy="origin.Y" r="3" fill="var(--c-slate-700)" />
        </g>
      </svg>

      <!-- 컨트롤 -->
      <div class="flex-1">
        <p class="mb-2 text-sm text-slate-500">
          행렬 슬라이더를 움직여 격자가 어떻게 휘는지 보세요. 초록 화살표 = î(가로 기저), 분홍 = ĵ(세로 기저).
        </p>

        <div class="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <label class="flex items-center gap-2">
            <span class="w-6 font-mono text-emerald-700">a</span>
            <input v-model.number="a" type="range" min="-2" max="2" step="0.25" class="flex-1" />
            <span class="w-10 text-right font-mono">{{ a }}</span>
          </label>
          <label class="flex items-center gap-2">
            <span class="w-6 font-mono text-pink-700">b</span>
            <input v-model.number="b" type="range" min="-2" max="2" step="0.25" class="flex-1" />
            <span class="w-10 text-right font-mono">{{ b }}</span>
          </label>
          <label class="flex items-center gap-2">
            <span class="w-6 font-mono text-emerald-700">c</span>
            <input v-model.number="c" type="range" min="-2" max="2" step="0.25" class="flex-1" />
            <span class="w-10 text-right font-mono">{{ c }}</span>
          </label>
          <label class="flex items-center gap-2">
            <span class="w-6 font-mono text-pink-700">d</span>
            <input v-model.number="d" type="range" min="-2" max="2" step="0.25" class="flex-1" />
            <span class="w-10 text-right font-mono">{{ d }}</span>
          </label>
        </div>

        <!-- 현재 행렬 + det -->
        <div class="mb-3 flex items-center gap-3 text-sm">
          <span class="font-mono text-slate-700">
            [[{{ a }}, {{ b }}], [{{ c }}, {{ d }}]]
          </span>
          <span
            class="rounded px-2 py-0.5 text-xs"
            :class="det === 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'"
          >
            넓이 배율(det) = {{ det }}<span v-if="det === 0"> · 납작해짐!</span><span v-else-if="det < 0"> · 뒤집힘</span>
          </span>
        </div>

        <!-- 프리셋 -->
        <div class="flex flex-wrap gap-2">
          <button
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100"
            @click="preset(1, 0, 0, 1)"
          >
            항등 (그대로)
          </button>
          <button
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100"
            @click="preset(2, 0, 0, 2)"
          >
            2배 확대
          </button>
          <button
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100"
            @click="preset(0, -1, 1, 0)"
          >
            90° 회전
          </button>
          <button
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100"
            @click="preset(1, 1, 0, 1)"
          >
            전단 (밀기)
          </button>
          <button
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100"
            @click="preset(-1, 0, 0, 1)"
          >
            좌우 반사
          </button>
          <button
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100"
            @click="preset(1, 0, 0, 0)"
          >
            납작 (det=0)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
