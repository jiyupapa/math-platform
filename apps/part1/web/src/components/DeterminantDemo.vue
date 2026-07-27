<script setup lang="ts">
// 행렬식 시각화 (ch6) — 2×2 행렬로 단위 정사각형(넓이 1)을 변형하면
// 평행사변형 넓이 = |det| 임을 보여주고, det = ad − bc 계산을 실시간 표시.
import { ref, computed } from 'vue'

const a = ref(2)
const b = ref(1)
const c = ref(0)
const d = ref(2)

const VS = 280
const cx = VS / 2
const range = 4
const scale = VS / (2 * range)

function toScreen(x: number, y: number) {
  return { X: cx + x * scale, Y: cx - y * scale }
}
function apply(x: number, y: number) {
  return { x: a.value * x + b.value * y, y: c.value * x + d.value * y }
}

const det = computed(() => +(a.value * d.value - b.value * c.value).toFixed(2))
const area = computed(() => Math.abs(det.value))

// 변환된 단위 정사각형 → 평행사변형
const para = computed(() =>
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
// 원래 단위 정사각형(회색)
const unit = computed(() =>
  ([
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ] as const)
    .map(([x, y]) => {
      const s = toScreen(x, y)
      return `${s.X},${s.Y}`
    })
    .join(' '),
)

const origin = toScreen(0, 0)
const iHat = computed(() => toScreen(a.value, c.value))
const jHat = computed(() => toScreen(b.value, d.value))

const fill = computed(() =>
  det.value === 0 ? 'var(--c-rose-500)' : det.value < 0 ? 'var(--c-amber-500)' : 'var(--c-indigo-500)',
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
    <p class="mb-3 text-sm text-slate-600">
      단위 정사각형(넓이 1)이 변환되면서 만드는 <b>평행사변형의 넓이 = |det|</b>예요. 슬라이더로 확인해 보세요.
    </p>

    <div class="flex flex-col gap-4 lg:flex-row">
      <svg :width="VS" :height="VS" :viewBox="`0 0 ${VS} ${VS}`" class="mx-auto shrink-0 rounded-lg bg-slate-50">
        <defs>
          <marker id="det-i" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--c-emerald-500)" />
          </marker>
          <marker id="det-j" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--c-pink-500)" />
          </marker>
        </defs>
        <!-- 축 -->
        <line x1="0" :y1="cx" :x2="VS" :y2="cx" stroke="var(--c-slate-200)" stroke-width="1" />
        <line :x1="cx" y1="0" :x2="cx" :y2="VS" stroke="var(--c-slate-200)" stroke-width="1" />
        <!-- 원래 단위 정사각형 -->
        <polygon :points="unit" fill="var(--c-slate-300)" fill-opacity="0.3" stroke="var(--c-slate-300)" stroke-width="1" />
        <!-- 변환된 평행사변형 -->
        <polygon :points="para" :fill="fill" fill-opacity="0.2" :stroke="fill" stroke-width="2" />
        <!-- 기저벡터 -->
        <line :x1="origin.X" :y1="origin.Y" :x2="iHat.X" :y2="iHat.Y" stroke="var(--c-emerald-500)" stroke-width="2.5" marker-end="url(#det-i)" />
        <line :x1="origin.X" :y1="origin.Y" :x2="jHat.X" :y2="jHat.Y" stroke="var(--c-pink-500)" stroke-width="2.5" marker-end="url(#det-j)" />
        <circle :cx="origin.X" :cy="origin.Y" r="3" fill="var(--c-slate-700)" />
      </svg>

      <div class="flex-1">
        <div class="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <label class="flex items-center gap-2"><span class="w-5 font-mono">a</span>
            <input v-model.number="a" type="range" min="-3" max="3" step="1" class="flex-1" /><span class="w-6 text-right font-mono">{{ a }}</span></label>
          <label class="flex items-center gap-2"><span class="w-5 font-mono">b</span>
            <input v-model.number="b" type="range" min="-3" max="3" step="1" class="flex-1" /><span class="w-6 text-right font-mono">{{ b }}</span></label>
          <label class="flex items-center gap-2"><span class="w-5 font-mono">c</span>
            <input v-model.number="c" type="range" min="-3" max="3" step="1" class="flex-1" /><span class="w-6 text-right font-mono">{{ c }}</span></label>
          <label class="flex items-center gap-2"><span class="w-5 font-mono">d</span>
            <input v-model.number="d" type="range" min="-3" max="3" step="1" class="flex-1" /><span class="w-6 text-right font-mono">{{ d }}</span></label>
        </div>

        <!-- det 계산 -->
        <div class="rounded-lg bg-slate-50 p-3 text-sm">
          <p class="font-mono">
            det = a·d − b·c = {{ a }}×{{ d }} − {{ b }}×{{ c }} = <b :style="{ color: fill }">{{ det }}</b>
          </p>
          <p class="mt-1">
            평행사변형 넓이 = |det| = <b>{{ area }}</b>
            <span v-if="det === 0" class="font-bold text-rose-700"> · 납작! (되돌릴 수 없음)</span>
            <span v-else-if="det < 0" class="text-amber-700"> · 뒤집힘</span>
          </p>
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100" @click="preset(1, 0, 0, 1)">항등 (det=1)</button>
          <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100" @click="preset(2, 0, 0, 2)">2배 (det=4)</button>
          <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100" @click="preset(1, 0, 0, -1)">반사 (det=−1)</button>
          <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100" @click="preset(2, 1, 2, 1)">납작 (det=0)</button>
        </div>
      </div>
    </div>
  </div>
</template>
