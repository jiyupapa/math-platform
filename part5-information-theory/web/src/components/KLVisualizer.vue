<script setup lang="ts">
// KL 비대칭 저울 — 두 분포 p(에메랄드)와 q(보라)를 한 차트에서 모두 드래그하면
// D(p‖q) 와 D(q‖p) 가 나란한 두 게이지로 계산된다. 두 값이 다른 것(비대칭),
// 그리고 한쪽에 "구멍"(확률 0)이 있으면 방향에 따라 ∞ 가 되는 것을 체감시킨다.
import { ref, computed } from 'vue'

const CATS = ['A', 'B', 'C', 'D']

// 두 분포의 원시 가중치(0~1). 확률은 각각 정규화.
const wP = ref<number[]>([0.7, 0.5, 0.3, 0.3])
const wQ = ref<number[]>([0.3, 0.3, 0.5, 0.7])

function normalize(w: number[]): number[] {
  const t = w.reduce((s, v) => s + v, 0)
  return t < 1e-9 ? w.map(() => 1 / w.length) : w.map((v) => v / t)
}
const p = computed(() => normalize(wP.value))
const q = computed(() => normalize(wQ.value))

// D(a‖b) = Σ a·log₂(a/b). a>0 인 칸에 b=0 이면 ∞ (지도에 없는 곳).
function kl(a: number[], b: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] <= 0) continue
    if (b[i] <= 0) return Infinity
    s += a[i] * Math.log2(a[i] / b[i])
  }
  return Math.max(s, 0) // 부동소수점 미세 음수 방지
}
const dPQ = computed(() => kl(p.value, q.value))
const dQP = computed(() => kl(q.value, p.value))
const same = computed(
  () => Number.isFinite(dPQ.value) && Number.isFinite(dQP.value) && dPQ.value < 0.003 && dQP.value < 0.003,
)

const GAUGE_MAX = 2
function ratio(d: number): number {
  return Number.isFinite(d) ? Math.min(d / GAUGE_MAX, 1) : 1
}
function fmt(d: number): string {
  return Number.isFinite(d) ? d.toFixed(3) + ' 비트' : '∞ 💥'
}

// ── SVG: 카테고리마다 p·q 막대 나란히, 둘 다 드래그 ──────────
const W = 360
const HEIGHT = 200
const PAD_X = 14
const BASE_Y = 170
const PLOT_H = 140
const groupW = (W - 2 * PAD_X) / CATS.length

const svgEl = ref<SVGSVGElement | null>(null)
let dragging: 'p' | 'q' | null = null

function setFromEvent(e: PointerEvent, lock?: 'p' | 'q') {
  const svg = svgEl.value
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * W
  const y = ((e.clientY - rect.top) / rect.height) * HEIGHT
  const idx = Math.max(0, Math.min(CATS.length - 1, Math.floor((x - PAD_X) / groupW)))
  const inGroup = (x - PAD_X - idx * groupW) / groupW // 0~1, 왼쪽 절반 = p, 오른쪽 절반 = q
  const side: 'p' | 'q' = lock ?? (inGroup < 0.5 ? 'p' : 'q')
  const h = Math.max(0, Math.min(1, (BASE_Y - y) / PLOT_H))
  if (side === 'p') wP.value = wP.value.map((w, i) => (i === idx ? h : w))
  else wQ.value = wQ.value.map((w, i) => (i === idx ? h : w))
  dragging = side
}
function onDown(e: PointerEvent) {
  ;(e.currentTarget as SVGElement).setPointerCapture(e.pointerId)
  setFromEvent(e)
}
function onMove(e: PointerEvent) {
  if (dragging) setFromEvent(e, dragging) // 드래그 시작한 쪽만 계속 조절 (실수로 넘어가는 것 방지)
}
function onUp() {
  dragging = null
}

function pX(i: number): number {
  return PAD_X + i * groupW + groupW * 0.12
}
function qX(i: number): number {
  return PAD_X + i * groupW + groupW * 0.52
}
function subW(): number {
  return groupW * 0.36
}

const presets = [
  { label: '🎯 똑같이 (D = 0)', p: [0.5, 0.5, 0.5, 0.5], q: [0.5, 0.5, 0.5, 0.5] },
  { label: '🌗 살짝 다르게', p: [0.6, 0.5, 0.4, 0.3], q: [0.3, 0.4, 0.5, 0.6] },
  { label: '💥 q 에 구멍 (비대칭 극단)', p: [0.5, 0.5, 0.5, 0.5], q: [0.7, 0.7, 0.7, 0] },
  { label: '🗻 p 몰빵 vs q 균등', p: [0.9, 0.05, 0.05, 0.05], q: [0.5, 0.5, 0.5, 0.5] },
]
function applyPreset(pr: { p: number[]; q: number[] }) {
  wP.value = [...pr.p]
  wQ.value = [...pr.q]
}
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-3 text-sm font-semibold text-slate-700">
      ⚖️ KL 비대칭 저울 — 두 분포를 모두 드래그할 수 있어요 (왼쪽 막대 = p, 오른쪽 = q)
    </p>

    <!-- 프리셋 -->
    <div class="mb-2 flex flex-wrap gap-1.5">
      <button
        v-for="pr in presets"
        :key="pr.label"
        class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
        @click="applyPreset(pr)"
      >
        {{ pr.label }}
      </button>
    </div>

    <!-- 두 분포 막대 -->
    <svg
      ref="svgEl"
      :viewBox="`0 0 ${W} ${HEIGHT}`"
      class="w-full max-w-lg cursor-ns-resize select-none"
      style="touch-action: none"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
    >
      <line :x1="PAD_X" :y1="BASE_Y" :x2="W - PAD_X" :y2="BASE_Y" stroke="#cbd5e1" stroke-width="1.5" />
      <g v-for="(cat, i) in CATS" :key="cat">
        <!-- p (에메랄드) -->
        <rect :x="pX(i)" :y="BASE_Y - PLOT_H" :width="subW()" :height="PLOT_H" fill="#f8fafc" rx="4" />
        <rect
          :x="pX(i)"
          :y="BASE_Y - p[i] * PLOT_H"
          :width="subW()"
          :height="Math.max(p[i] * PLOT_H, 2)"
          fill="#10b981"
          rx="4"
        />
        <text
          :x="pX(i) + subW() / 2"
          :y="BASE_Y - p[i] * PLOT_H - 5"
          text-anchor="middle"
          font-size="10"
          font-weight="bold"
          fill="#059669"
        >
          {{ (p[i] * 100).toFixed(0) }}%
        </text>
        <!-- q (보라) -->
        <rect :x="qX(i)" :y="BASE_Y - PLOT_H" :width="subW()" :height="PLOT_H" fill="#f8fafc" rx="4" />
        <rect
          :x="qX(i)"
          :y="BASE_Y - q[i] * PLOT_H"
          :width="subW()"
          :height="Math.max(q[i] * PLOT_H, 2)"
          fill="#6366f1"
          rx="4"
        />
        <text
          :x="qX(i) + subW() / 2"
          :y="BASE_Y - q[i] * PLOT_H - 5"
          text-anchor="middle"
          font-size="10"
          font-weight="bold"
          fill="#4f46e5"
        >
          {{ (q[i] * 100).toFixed(0) }}%
        </text>
        <text :x="PAD_X + i * groupW + groupW / 2" :y="BASE_Y + 16" text-anchor="middle" font-size="12" fill="#64748b">
          {{ cat }}
        </text>
      </g>
      <!-- 범례 -->
      <rect :x="W - 120" y="4" width="10" height="10" fill="#10b981" rx="2" />
      <text :x="W - 106" y="13" font-size="10" fill="#059669">분포 p</text>
      <rect :x="W - 120" y="20" width="10" height="10" fill="#6366f1" rx="2" />
      <text :x="W - 106" y="29" font-size="10" fill="#4f46e5">분포 q</text>
    </svg>

    <!-- 두 방향 KL 게이지 나란히 -->
    <div class="mt-3 space-y-2">
      <div class="flex items-center gap-3">
        <span class="w-24 shrink-0 text-right text-sm font-medium text-slate-600">D(p‖q)</span>
        <div class="h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full transition-all duration-150"
            :class="Number.isFinite(dPQ) ? 'bg-emerald-500' : 'animate-pulse bg-rose-500'"
            :style="{ width: ratio(dPQ) * 100 + '%' }"
          />
        </div>
        <span class="w-24 shrink-0 text-sm font-bold tabular-nums" :class="Number.isFinite(dPQ) ? 'text-emerald-700' : 'text-rose-600'">
          {{ fmt(dPQ) }}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <span class="w-24 shrink-0 text-right text-sm font-medium text-slate-600">D(q‖p)</span>
        <div class="h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full transition-all duration-150"
            :class="Number.isFinite(dQP) ? 'bg-indigo-500' : 'animate-pulse bg-rose-500'"
            :style="{ width: ratio(dQP) * 100 + '%' }"
          />
        </div>
        <span class="w-24 shrink-0 text-sm font-bold tabular-nums" :class="Number.isFinite(dQP) ? 'text-indigo-700' : 'text-rose-600'">
          {{ fmt(dQP) }}
        </span>
      </div>
    </div>

    <p class="mt-2 text-xs" :class="same ? 'font-semibold text-emerald-600' : 'text-slate-400'">
      <template v-if="same">
        🎉 p = q — 두 방향 모두 0. 완벽히 같은 분포만 KL 을 0으로 만듭니다.
      </template>
      <template v-else-if="!Number.isFinite(dPQ) && Number.isFinite(dQP)">
        비대칭의 극단! p 가 가능하다는 일(D 칸)을 q 가 불가능 취급 → D(p‖q) = ∞.
        반대 방향은 멀쩡한 유한값 — 방향이 이렇게 중요합니다.
      </template>
      <template v-else>
        두 게이지의 길이가 다르죠? D(p‖q) ≠ D(q‖p) — KL 은 "거리"처럼 쓰이지만
        대칭이 아니라서 진짜 거리는 아닙니다.
      </template>
    </p>
  </div>
</template>
