<script setup lang="ts">
// 크로스 엔트로피 실험실 — 세상의 분포 p 는 고정, 내 지도(예측) q 를 드래그로 바꾸면
// 비용 H(p,q) = Σ p·log₂(1/q) 가 실시간으로 변한다. q = p 일 때 최소(= H(p))가 되고,
// 일어날 수 있는 일에 q = 0 을 주면 비용이 무한대로 터지는 것까지 체감시킨다.
import { ref, computed } from 'vue'

const OUTCOMES = ['☀️ 맑음', '☁️ 흐림', '🌧️ 비', '❄️ 눈']
// 세상의 진짜 분포 (고정)
const P = [0.5, 0.25, 0.125, 0.125]
const H_P = P.reduce((s, p) => s + p * Math.log2(1 / p), 0) // = 1.75

// 내 지도 q — 원시 가중치(0~1)를 드래그로 조절, 확률은 정규화
const weights = ref<number[]>([0.25, 0.25, 0.25, 0.25])
const total = computed(() => weights.value.reduce((s, w) => s + w, 0))
const q = computed(() =>
  total.value < 1e-9 ? [0.25, 0.25, 0.25, 0.25] : weights.value.map((w) => w / total.value),
)

// H(p,q) = Σ p·log₂(1/q). 일어날 수 있는 일(p>0)에 q=0 을 주면 무한대.
const cost = computed(() => {
  let s = 0
  for (let i = 0; i < P.length; i++) {
    if (P[i] <= 0) continue
    if (q.value[i] <= 0) return Infinity
    s += P[i] * Math.log2(1 / q.value[i])
  }
  return s
})
const excess = computed(() => cost.value - H_P)
const GAUGE_MAX = 4
const gaugeRatio = computed(() =>
  Number.isFinite(cost.value) ? Math.min(cost.value / GAUGE_MAX, 1) : 1,
)
const atMin = computed(() => Number.isFinite(cost.value) && excess.value < 0.005)

// ── SVG: p(고정, 회색)와 q(드래그, 보라)를 나란히 ──────────────
const W = 360
const HEIGHT = 200
const PAD_X = 14
const BASE_Y = 170
const PLOT_H = 140
const groupW = (W - 2 * PAD_X) / OUTCOMES.length

const svgEl = ref<SVGSVGElement | null>(null)
let dragging = false

function setFromEvent(e: PointerEvent) {
  const svg = svgEl.value
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * W
  const y = ((e.clientY - rect.top) / rect.height) * HEIGHT
  const idx = Math.max(0, Math.min(OUTCOMES.length - 1, Math.floor((x - PAD_X) / groupW)))
  const h = Math.max(0, Math.min(1, (BASE_Y - y) / PLOT_H))
  weights.value = weights.value.map((w, i) => (i === idx ? h : w))
}
function onDown(e: PointerEvent) {
  dragging = true
  ;(e.currentTarget as SVGElement).setPointerCapture(e.pointerId)
  setFromEvent(e)
}
function onMove(e: PointerEvent) {
  if (dragging) setFromEvent(e)
}
function onUp() {
  dragging = false
}

// 그룹 안에서 왼쪽 = p(고정), 오른쪽 = q(드래그)
function pX(i: number): number {
  return PAD_X + i * groupW + groupW * 0.12
}
function qX(i: number): number {
  return PAD_X + i * groupW + groupW * 0.52
}
function subW(): number {
  return groupW * 0.36
}
// p 막대는 확률을 그대로 높이로 (0.5 → 절반 높이), q 막대는 정규화 확률
function pY(i: number): number {
  return BASE_Y - P[i] * PLOT_H
}
function qY(i: number): number {
  return BASE_Y - q.value[i] * PLOT_H
}

const presets = [
  { label: '🎯 지도를 세상에 맞추기 (q = p)', w: [...P] },
  { label: '⚖️ 균등 지도', w: [0.25, 0.25, 0.25, 0.25] },
  { label: '🙃 거꾸로 지도', w: [0.125, 0.125, 0.25, 0.5] },
  { label: '💥 눈이 없는 지도 (q=0 실험)', w: [0.5, 0.3, 0.2, 0] },
]
function applyPreset(w: number[]) {
  weights.value = [...w]
}
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-3 text-sm font-semibold text-slate-700">
      🗺️ 크로스 엔트로피 실험실 — 보라 막대(내 지도 q)를 드래그해 회색(세상 p)에 맞춰 보세요
    </p>

    <!-- 프리셋 -->
    <div class="mb-2 flex flex-wrap gap-1.5">
      <button
        v-for="pr in presets"
        :key="pr.label"
        class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
        @click="applyPreset(pr.w)"
      >
        {{ pr.label }}
      </button>
    </div>

    <!-- p(고정) vs q(드래그) 막대 -->
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
      <line :x1="PAD_X" :y1="BASE_Y" :x2="W - PAD_X" :y2="BASE_Y" stroke="var(--c-slate-300)" stroke-width="1.5" />
      <g v-for="(name, i) in OUTCOMES" :key="name">
        <!-- 세상 p (고정, 회색) -->
        <rect :x="pX(i)" :y="pY(i)" :width="subW()" :height="P[i] * PLOT_H" fill="var(--c-slate-300)" rx="4" />
        <text :x="pX(i) + subW() / 2" :y="pY(i) - 5" text-anchor="middle" font-size="10" fill="var(--c-slate-400)">
          {{ (P[i] * 100).toFixed(1) }}%
        </text>
        <!-- 내 지도 q (드래그, 보라) -->
        <rect :x="qX(i)" :y="BASE_Y - PLOT_H" :width="subW()" :height="PLOT_H" fill="var(--c-slate-50)" rx="4" />
        <rect
          :x="qX(i)"
          :y="qY(i)"
          :width="subW()"
          :height="Math.max(q[i] * PLOT_H, 2)"
          fill="var(--c-indigo-500)"
          rx="4"
        />
        <text
          :x="qX(i) + subW() / 2"
          :y="qY(i) - 5"
          text-anchor="middle"
          font-size="10"
          font-weight="bold"
          fill="var(--c-indigo-600)"
        >
          {{ (q[i] * 100).toFixed(1) }}%
        </text>
        <!-- 라벨 -->
        <text :x="PAD_X + i * groupW + groupW / 2" :y="BASE_Y + 16" text-anchor="middle" font-size="11" fill="var(--c-slate-500)">
          {{ name }}
        </text>
      </g>
      <!-- 범례 -->
      <rect :x="W - 130" y="4" width="10" height="10" fill="var(--c-slate-300)" rx="2" />
      <text :x="W - 116" y="13" font-size="10" fill="var(--c-slate-400)">세상 p (고정)</text>
      <rect :x="W - 130" y="20" width="10" height="10" fill="var(--c-indigo-500)" rx="2" />
      <text :x="W - 116" y="29" font-size="10" fill="var(--c-indigo-600)">내 지도 q (드래그)</text>
    </svg>

    <!-- 비용 게이지 -->
    <div class="mt-3 flex items-center gap-3">
      <span class="w-28 shrink-0 text-right text-sm text-slate-600">비용 H(p,q)</span>
      <div class="relative h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          class="h-full rounded-full transition-all duration-150"
          :class="Number.isFinite(cost) ? (atMin ? 'bg-emerald-500' : 'bg-indigo-500') : 'animate-pulse bg-rose-500'"
          :style="{ width: gaugeRatio * 100 + '%' }"
        />
        <!-- 바닥 H(p) 눈금 -->
        <div
          class="absolute inset-y-0 w-0.5 bg-slate-500"
          :style="{ left: (H_P / GAUGE_MAX) * 100 + '%' }"
          title="바닥 = H(p) = 1.75비트"
        />
      </div>
      <span
        class="w-28 shrink-0 text-sm font-bold tabular-nums"
        :class="Number.isFinite(cost) ? (atMin ? 'text-emerald-700' : 'text-indigo-700') : 'text-rose-700'"
      >
        {{ Number.isFinite(cost) ? cost.toFixed(3) + ' 비트' : '∞ 💥' }}
      </span>
    </div>
    <p class="mt-1 text-xs" :class="atMin ? 'font-semibold text-emerald-700' : 'text-slate-500'" style="padding-left: 7.75rem">
      <template v-if="!Number.isFinite(cost)">
        일어날 수 있는 일(눈 12.5%)에 확률 0을 준 지도 — 그 날이 오면 부호화 불가, 비용 무한대!
      </template>
      <template v-else-if="atMin">
        🎉 최소 도달! q = p 일 때 비용 = H(p) = 1.75비트 — 이보다 싼 지도는 없습니다.
      </template>
      <template v-else>
        세로 눈금 = 바닥 H(p) = 1.75비트 · 초과분
        <b class="text-slate-600">+{{ excess.toFixed(3) }}비트</b> (이 초과분이 5장의 주인공)
      </template>
    </p>

    <!-- 항별 기여 표 -->
    <div class="mt-3 overflow-x-auto">
      <table class="w-full min-w-[26rem] text-center text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs text-slate-500">
            <th class="py-1.5 font-medium">경우</th>
            <th class="py-1.5 font-medium">실제 빈도 p</th>
            <th class="py-1.5 font-medium">지도의 코드 길이 log₂(1/q)</th>
            <th class="py-1.5 font-medium">기여 p × 길이</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(name, i) in OUTCOMES" :key="name" class="border-b border-slate-100">
            <td class="py-1.5">{{ name }}</td>
            <td class="py-1.5 tabular-nums text-slate-500">{{ P[i].toFixed(3) }}</td>
            <td class="py-1.5 tabular-nums text-slate-700">
              {{ q[i] > 0 ? Math.log2(1 / q[i]).toFixed(2) + '비트' : '∞' }}
            </td>
            <td class="py-1.5 tabular-nums font-medium text-slate-700">
              {{ q[i] > 0 ? (P[i] * Math.log2(1 / q[i])).toFixed(3) : '∞ 💥' }}
            </td>
          </tr>
          <tr>
            <td colspan="3" class="py-1.5 pr-2 text-right text-xs font-semibold text-slate-500">
              기여의 합 = H(p,q)
            </td>
            <td class="py-1.5 tabular-nums font-bold text-indigo-700">
              {{ Number.isFinite(cost) ? cost.toFixed(3) + '비트' : '∞ 💥' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
