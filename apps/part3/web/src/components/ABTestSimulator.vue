<script setup lang="ts">
// Phase 9 전용 인터랙티브 — A/B 테스트 시뮬레이터.
// "두 버전에 차이가 없다"(귀무가설 H₀)고 가정하고 실험을 수천 번 반복하면
// 우연만으로 생기는 차이의 분포가 쌓인다. 내가 관측한 차이가 그 분포에서
// 얼마나 극단적인지(= p값)를 눈으로 확인한다.
import { ref, computed, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 시뮬레이션 반복 횟수 */
    trials?: number
    size?: number
    height?: number
  }>(),
  { trials: 2000, size: 440, height: 220 },
)

const rateA = ref(10) // A 전환율 (%)
const rateB = ref(12) // B 전환율 (%)
const n = ref(1000) // 그룹당 표본 수
const diffs = ref<number[]>([]) // H₀ 아래에서 시뮬레이션된 차이 (%p)
const ran = ref(false)

// 설정을 바꾸면 이전 실험 결과는 무효 — 다시 돌리게 한다
watch([rateA, rateB, n], () => {
  ran.value = false
  diffs.value = []
})

const obsDiff = computed(() => rateB.value - rateA.value) // 관측 차이 (%p)

// 표준정규 난수 (Box-Muller). 이항분포 표본 대신 정규 근사로 가볍게 시뮬레이션.
function gauss(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// H₀(차이 없음) 아래에서 "그룹 B 비율 − 그룹 A 비율" 차이의 표준편차
const nullSe = computed(() => {
  const p = (rateA.value + rateB.value) / 200 // 합동 비율 (0~1)
  return Math.sqrt((2 * p * (1 - p)) / n.value)
})

function simulate() {
  const se = nullSe.value
  const arr: number[] = []
  for (let i = 0; i < props.trials; i++) arr.push(gauss() * se * 100) // %p 단위
  diffs.value = arr
  ran.value = true
}

const pValue = computed(() => {
  if (!ran.value || diffs.value.length === 0) return null
  const t = Math.abs(obsDiff.value)
  const cnt = diffs.value.filter((d) => Math.abs(d) >= t).length
  return cnt / diffs.value.length
})

const significant = computed(() => pValue.value !== null && pValue.value < 0.05)

// ── 히스토그램 → SVG ──────────────────────────────────────────
const BINS = 31
const range = computed(() => {
  // 분포(±4σ)와 관측 차이가 둘 다 화면에 들어오게
  const r = Math.max(4 * nullSe.value * 100, Math.abs(obsDiff.value) * 1.25, 1)
  return r
})
const bars = computed(() => {
  if (!ran.value) return []
  const r = range.value
  const counts = new Array<number>(BINS).fill(0)
  for (const d of diffs.value) {
    let idx = Math.floor(((d + r) / (2 * r)) * BINS)
    if (idx < 0) idx = 0
    if (idx >= BINS) idx = BINS - 1
    counts[idx]++
  }
  const maxC = Math.max(...counts, 1)
  const w = props.size / BINS
  return counts.map((c, i) => {
    const h = (c / maxC) * (props.height - 30)
    const center = -r + ((i + 0.5) / BINS) * 2 * r // 이 막대의 중심값 (%p)
    return {
      x: i * w + 1,
      y: props.height - 20 - h,
      w: w - 2,
      h,
      extreme: Math.abs(center) >= Math.abs(obsDiff.value), // 관측 차이보다 극단적?
    }
  })
})
const sx = (v: number) => ((v + range.value) / (2 * range.value)) * props.size

const fmt = (x: number, d = 1) => Number(x.toFixed(d)).toString()
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <!-- 조절판 -->
    <div class="space-y-2 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-44 shrink-0 text-slate-500">
          A 전환율 = <b class="text-slate-800">{{ fmt(rateA) }}%</b>
        </span>
        <input v-model.number="rateA" type="range" min="5" max="20" step="0.5" class="flex-1 accent-indigo-500" />
      </label>
      <label class="flex items-center gap-3 text-sm">
        <span class="w-44 shrink-0 text-slate-500">
          B 전환율 = <b class="text-slate-800">{{ fmt(rateB) }}%</b>
        </span>
        <input v-model.number="rateB" type="range" min="5" max="20" step="0.5" class="flex-1 accent-indigo-500" />
      </label>
      <label class="flex items-center gap-3 text-sm">
        <span class="w-44 shrink-0 text-slate-500">
          그룹당 표본 n = <b class="text-slate-800">{{ n.toLocaleString() }}</b>명
        </span>
        <input v-model.number="n" type="range" min="100" max="5000" step="100" class="flex-1 accent-indigo-500" />
      </label>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        @click="simulate"
      >
        🎲 "차이 없음" 세상에서 실험 {{ props.trials.toLocaleString() }}번 돌리기
      </button>
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
        관측 차이 = <b>{{ obsDiff >= 0 ? '+' : '' }}{{ fmt(obsDiff) }}%p</b>
      </span>
      <template v-if="pValue !== null">
        <span class="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700">
          p값 ≈ <b>{{ fmt(pValue, 3) }}</b>
        </span>
        <span
          class="rounded-lg px-3 py-1.5 text-sm font-semibold"
          :class="significant ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
        >
          {{ significant ? '✅ 유의한 차이 (p < 0.05)' : '🤔 증거 부족 (p ≥ 0.05)' }}
        </span>
      </template>
    </div>

    <!-- 히스토그램 -->
    <div class="mt-3 flex justify-center">
      <svg
        :viewBox="`0 0 ${size} ${height}`"
        :width="size"
        :height="height"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50"
      >
        <template v-if="ran">
          <!-- 우연만으로 생긴 차이의 분포 -->
          <rect
            v-for="(bar, i) in bars"
            :key="i"
            :x="bar.x"
            :y="bar.y"
            :width="bar.w"
            :height="bar.h"
            :fill="bar.extreme ? 'var(--c-rose-300)' : 'var(--c-indigo-300)'"
          />
          <!-- 기준선 0 -->
          <line :x1="sx(0)" :y1="10" :x2="sx(0)" :y2="height - 20" stroke="var(--c-slate-400)" stroke-width="1" stroke-dasharray="3 3" />
          <!-- 관측 차이 -->
          <line :x1="sx(obsDiff)" :y1="4" :x2="sx(obsDiff)" :y2="height - 20" stroke="var(--c-rose-600)" stroke-width="2.5" />
          <text :x="sx(obsDiff)" y="14" text-anchor="middle" font-size="11" fill="var(--c-rose-600)" font-weight="bold">
            관측 {{ obsDiff >= 0 ? '+' : '' }}{{ fmt(obsDiff) }}%p
          </text>
          <!-- 축 라벨 -->
          <text :x="sx(-range)" :y="height - 6" text-anchor="start" font-size="10" fill="var(--c-slate-400)">−{{ fmt(range) }}%p</text>
          <text :x="sx(0)" :y="height - 6" text-anchor="middle" font-size="10" fill="var(--c-slate-400)">0</text>
          <text :x="sx(range)" :y="height - 6" text-anchor="end" font-size="10" fill="var(--c-slate-400)">+{{ fmt(range) }}%p</text>
        </template>
        <text v-else :x="size / 2" :y="height / 2" text-anchor="middle" font-size="13" fill="var(--c-slate-400)">
          버튼을 눌러 "차이가 없다면 어떤 차이까지 우연으로 나오는지" 확인해 보세요
        </text>
      </svg>
    </div>

    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      파란 막대 = <b>차이가 전혀 없는 세상</b>에서 우연만으로 생긴 "B − A" 차이들.
      빨간 선(관측 차이)보다 극단적인 영역(분홍)의 비율이 <b>p값</b>이에요.
      전환율은 그대로 두고 <b>표본 n 만 키워서</b> 다시 돌려보세요 — 같은 차이도 p값이 훅 작아집니다.
    </p>
  </div>
</template>
