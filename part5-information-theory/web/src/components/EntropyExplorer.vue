<script setup lang="ts">
// 엔트로피 탐험대 — 분포 막대를 드래그하면 H = Σ p·log₂(1/p) 가 실시간으로 바뀐다.
// 균등 분포에서 최대(log₂4 = 2비트), 한 글자 몰빵에서 0이 되는 걸 손으로 체감시킨다.
// 막대 높이는 조절한 원시 가중치이고, 확률은 정규화된 값(% 라벨)이다.
import { ref, computed } from 'vue'

const LETTERS = ['A', 'B', 'C', 'D']
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899']

// 막대의 원시 높이(0~1). 확률은 이걸 정규화해서 얻는다.
const weights = ref<number[]>([0.6, 0.6, 0.6, 0.6])

const total = computed(() => weights.value.reduce((s, w) => s + w, 0))
// 전부 0으로 내려 버리면 분포가 정의 안 되므로 균등으로 간주
const probs = computed(() =>
  total.value < 1e-9 ? [0.25, 0.25, 0.25, 0.25] : weights.value.map((w) => w / total.value),
)

// H = Σ p·log₂(1/p). p = 0 항은 0·log0 = 0 관례로 건너뛴다.
const H = computed(() =>
  probs.value.reduce((s, p) => (p > 0 ? s + p * Math.log2(1 / p) : s), 0),
)
const H_MAX = Math.log2(LETTERS.length) // = 2

// ── SVG 드래그 ──────────────────────────────────────────────
const W = 340
const HEIGHT = 190
const PAD_X = 16
const BASE_Y = 165 // 막대 바닥
const PLOT_H = 140 // 막대 최대 높이
const colW = (W - 2 * PAD_X) / LETTERS.length

const svgEl = ref<SVGSVGElement | null>(null)
let dragging = false

function setFromEvent(e: PointerEvent) {
  const svg = svgEl.value
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * W
  const y = ((e.clientY - rect.top) / rect.height) * HEIGHT
  const idx = Math.max(0, Math.min(LETTERS.length - 1, Math.floor((x - PAD_X) / colW)))
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

function barX(i: number): number {
  return PAD_X + i * colW + colW * 0.15
}
function barW(): number {
  return colW * 0.7
}
function barY(i: number): number {
  return BASE_Y - weights.value[i] * PLOT_H
}
function barH(i: number): number {
  return weights.value[i] * PLOT_H
}

const presets = [
  { label: '⚖️ 균등', w: [0.6, 0.6, 0.6, 0.6] },
  { label: '🗻 A 몰빵', w: [0.9, 0, 0, 0] },
  { label: '🌓 두 글자 반반', w: [0.7, 0.7, 0, 0] },
  { label: '📊 치우침', w: [0.8, 0.4, 0.2, 0.2] },
]
function applyPreset(w: number[]) {
  weights.value = [...w]
}

function surprise(p: number): number {
  return Math.log2(1 / p)
}
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-3 text-sm font-semibold text-slate-700">
      🧭 엔트로피 탐험대 — 막대를 위아래로 드래그해 보세요
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

    <!-- 드래그 가능한 분포 막대 -->
    <svg
      ref="svgEl"
      :viewBox="`0 0 ${W} ${HEIGHT}`"
      class="w-full max-w-md cursor-ns-resize select-none"
      style="touch-action: none"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
    >
      <!-- 바닥선 -->
      <line :x1="PAD_X" :y1="BASE_Y" :x2="W - PAD_X" :y2="BASE_Y" stroke="#cbd5e1" stroke-width="1.5" />
      <g v-for="(letter, i) in LETTERS" :key="letter">
        <!-- 드래그 영역 표시(연한 기둥) -->
        <rect :x="barX(i)" :y="BASE_Y - PLOT_H" :width="barW()" :height="PLOT_H" fill="#f8fafc" rx="6" />
        <!-- 실제 막대 -->
        <rect :x="barX(i)" :y="barY(i)" :width="barW()" :height="Math.max(barH(i), 2)" :fill="COLORS[i]" rx="6" />
        <!-- 확률 라벨 -->
        <text
          :x="barX(i) + barW() / 2"
          :y="barY(i) - 6"
          text-anchor="middle"
          font-size="11"
          font-weight="bold"
          :fill="COLORS[i]"
        >
          {{ (probs[i] * 100).toFixed(0) }}%
        </text>
        <!-- 글자 라벨 -->
        <text :x="barX(i) + barW() / 2" :y="BASE_Y + 16" text-anchor="middle" font-size="12" fill="#64748b">
          {{ letter }}
        </text>
      </g>
    </svg>
    <p class="mt-0.5 text-xs text-slate-400">
      막대 높이는 상대적 빈도 — 확률(%)은 네 막대의 비율로 자동 계산됩니다.
    </p>

    <!-- H 게이지 -->
    <div class="mt-3 flex items-center gap-3">
      <span class="w-28 shrink-0 text-right text-sm text-slate-600">엔트로피 H</span>
      <div class="relative h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          class="h-full rounded-full bg-indigo-500 transition-all duration-150"
          :style="{ width: (H / H_MAX) * 100 + '%' }"
        />
        <!-- 최대 눈금 -->
        <div class="absolute inset-y-0 right-0 w-0.5 bg-indigo-300" />
      </div>
      <span class="w-24 shrink-0 text-sm font-bold tabular-nums text-indigo-700">
        {{ H.toFixed(3) }} 비트
      </span>
    </div>
    <p class="mt-1 text-xs text-slate-400" style="padding-left: 7.75rem">
      최대 = log₂4 = {{ H_MAX }}비트 (정확히 균등일 때) · 한 글자 몰빵이면 0비트
    </p>

    <!-- 항별 기여 표: H = Σ p·log₂(1/p) 를 눈으로 -->
    <div class="mt-3 overflow-x-auto">
      <table class="w-full min-w-[24rem] text-center text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs text-slate-400">
            <th class="py-1.5 font-medium">글자</th>
            <th class="py-1.5 font-medium">확률 p</th>
            <th class="py-1.5 font-medium">놀람 log₂(1/p)</th>
            <th class="py-1.5 font-medium">기여 p × 놀람</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(letter, i) in LETTERS" :key="letter" class="border-b border-slate-100">
            <td class="py-1.5">
              <span
                class="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white"
                :style="{ background: COLORS[i] }"
              >{{ letter }}</span>
            </td>
            <td class="py-1.5 tabular-nums text-slate-700">{{ probs[i].toFixed(2) }}</td>
            <td class="py-1.5 tabular-nums text-slate-500">
              {{ probs[i] > 0 ? surprise(probs[i]).toFixed(2) + '비트' : '∞' }}
            </td>
            <td class="py-1.5 tabular-nums font-medium text-slate-700">
              {{ probs[i] > 0 ? (probs[i] * surprise(probs[i])).toFixed(3) : '0 (관례)' }}
            </td>
          </tr>
          <tr>
            <td colspan="3" class="py-1.5 pr-2 text-right text-xs font-semibold text-slate-500">
              기여의 합 = H
            </td>
            <td class="py-1.5 tabular-nums font-bold text-indigo-700">{{ H.toFixed(3) }}비트</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
