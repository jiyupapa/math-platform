<script setup lang="ts">
// 놀람 게이지 — 확률 슬라이더를 움직이면 놀람 I = log₂(1/p) 가 실시간으로 변한다.
// p→1 이면 0으로 죽고, p→0 이면 폭발하는 걸 게이지와 곡선 위의 점으로 체감시킨다.
import { ref, computed } from 'vue'

// 슬라이더는 1% ~ 100%. 더 희귀한 사건(로또 등)은 프리셋 버튼으로만 간다.
const percent = ref(50) // p × 100
const p = computed(() => percent.value / 100)

// 게이지 눈금: 슬라이더 최소 1% → 약 6.6비트가 최대. 여유 있게 7비트 스케일.
const GAUGE_MAX = 7

// 프리셋 — 슬라이더 범위 밖의 극단(로또)도 체험시킨다
interface Preset {
  label: string
  p: number
  desc: string
}
const presets: Preset[] = [
  { label: '☀️ 내일 해가 뜬다', p: 1, desc: 'p = 1' },
  { label: '🪙 동전 앞면', p: 1 / 2, desc: 'p = 1/2' },
  { label: '🎲 주사위 6', p: 1 / 6, desc: 'p = 1/6' },
  { label: '🃏 카드 한 장이 ♠A', p: 1 / 52, desc: 'p = 1/52' },
  { label: '🎰 로또 1등', p: 1 / 8145060, desc: 'p = 1/8145060' },
]
const active = ref<Preset | null>(null)

function applyPreset(pr: Preset) {
  active.value = pr
  // 슬라이더 범위 안이면 슬라이더도 따라 움직인다 (범위 밖이면 최소에 붙임)
  percent.value = Math.max(1, Math.min(100, pr.p * 100))
}
function onSlide() {
  active.value = null
}

// 실제 표시용 확률·놀람 — 프리셋(로또처럼 슬라이더 밖)이 선택돼 있으면 그 값을 우선
const showP = computed(() => (active.value ? active.value.p : p.value))
const showBits = computed(() => Math.log2(1 / showP.value))
const overflow = computed(() => showBits.value > GAUGE_MAX)
const showRatio = computed(() => (overflow.value ? 1 : Math.min(showBits.value / GAUGE_MAX, 1)))

const pText = computed(() => {
  const v = showP.value
  if (v >= 0.01) return `${(v * 100).toFixed(0)}%`
  return `1/${Math.round(1 / v).toLocaleString()}`
})

// I = log₂(1/p) 곡선 (SVG) — x: p (0.01~1), y: 놀람 (0~7비트)
const W = 320
const H = 150
const PAD = 8
function xOf(prob: number): number {
  return PAD + ((prob - 0.01) / 0.99) * (W - 2 * PAD)
}
function yOf(b: number): number {
  return H - PAD - (Math.min(b, GAUGE_MAX) / GAUGE_MAX) * (H - 2 * PAD)
}
const curvePath = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= 120; i++) {
    const prob = 0.01 + (0.99 * i) / 120
    pts.push(`${i === 0 ? 'M' : 'L'}${xOf(prob).toFixed(1)},${yOf(Math.log2(1 / prob)).toFixed(1)}`)
  }
  return pts.join(' ')
})
// 곡선 위 현재 점 — 슬라이더 범위 밖 프리셋은 왼쪽 끝에 붙는다
const dotX = computed(() => xOf(Math.max(0.01, Math.min(1, showP.value))))
const dotY = computed(() => yOf(showBits.value))
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-3 text-sm font-semibold text-slate-700">😲 놀람 게이지 — 확률을 움직여 보세요</p>

    <!-- 프리셋 -->
    <div class="mb-3 flex flex-wrap gap-1.5">
      <button
        v-for="pr in presets"
        :key="pr.label"
        class="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="
          active?.label === pr.label
            ? 'border-indigo-400 bg-indigo-100 text-indigo-800'
            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
        "
        :title="pr.desc"
        @click="applyPreset(pr)"
      >
        {{ pr.label }}
      </button>
    </div>

    <!-- 확률 슬라이더 -->
    <div class="flex items-center gap-3">
      <span class="w-24 shrink-0 text-right text-sm text-slate-600">
        확률 <b class="tabular-nums text-slate-800">{{ pText }}</b>
      </span>
      <input
        v-model.number="percent"
        type="range"
        min="1"
        max="100"
        step="1"
        class="flex-1 accent-indigo-600"
        aria-label="사건의 확률 (%)"
        @input="onSlide"
      />
    </div>

    <!-- 놀람 게이지 -->
    <div class="mt-3 flex items-center gap-3">
      <span class="w-24 shrink-0 text-right text-sm text-slate-600">놀람</span>
      <div class="relative h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          class="h-full rounded-full transition-all duration-200"
          :class="overflow ? 'animate-pulse bg-rose-500' : 'bg-indigo-500'"
          :style="{ width: showRatio * 100 + '%' }"
        />
      </div>
      <span class="w-28 shrink-0 text-sm font-bold tabular-nums" :class="overflow ? 'text-rose-700' : 'text-indigo-700'">
        {{ showBits.toFixed(2) }} 비트{{ overflow ? ' 💥' : '' }}
      </span>
    </div>
    <p class="mt-1 text-xs text-slate-500" style="padding-left: 6.75rem">
      = 반반 질문 약 {{ Math.ceil(showBits) }}번 어치의 정보
      <template v-if="showP === 1">— 이미 아는 일이라 정보가 0!</template>
    </p>

    <!-- I(p) 곡선 -->
    <div class="mt-4 flex flex-col items-center">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full max-w-md">
        <!-- 축 -->
        <line :x1="PAD" :y1="H - PAD" :x2="W - PAD" :y2="H - PAD" stroke="var(--c-slate-300)" stroke-width="1" />
        <line :x1="PAD" :y1="PAD" :x2="PAD" :y2="H - PAD" stroke="var(--c-slate-300)" stroke-width="1" />
        <!-- 곡선 -->
        <path :d="curvePath" fill="none" stroke="var(--c-indigo-500)" stroke-width="2.5" />
        <!-- 현재 점 -->
        <circle :cx="dotX" :cy="dotY" r="6" fill="var(--c-indigo-600)" stroke="var(--c-white)" stroke-width="2" />
        <!-- 라벨 -->
        <text :x="W - PAD" :y="H - PAD - 4" text-anchor="end" font-size="10" fill="var(--c-slate-400)">확률 p →</text>
        <text :x="PAD + 4" :y="PAD + 10" font-size="10" fill="var(--c-slate-400)">↑ 놀람 (비트)</text>
      </svg>
      <p class="mt-1 text-xs text-slate-500">
        오른쪽 끝(p = 1)에서 0으로 죽고, 왼쪽(p → 0)으로 갈수록 절벽처럼 치솟아요.
      </p>
    </div>
  </div>
</template>
