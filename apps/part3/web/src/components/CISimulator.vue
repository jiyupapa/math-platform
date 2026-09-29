<script setup lang="ts">
// Phase 8 전용 인터랙티브 — 신뢰구간 100개 시뮬레이터.
// 참값 μ=50, σ=10 인 모집단에서 크기 n 표본을 100번 뽑아 신뢰구간을 100개 만들고,
// 그중 몇 개가 참값을 포함하는지(≈ 신뢰수준) 눈으로 확인한다.
import { ref, computed, watch } from 'vue'

const props = withDefaults(defineProps<{ width?: number }>(), { width: 460 })

const MU = 50
const SIGMA = 10

const n = ref(25)
const levelIdx = ref(1)
const levels = [
  { label: '90%', z: 1.645 },
  { label: '95%', z: 1.96 },
  { label: '99%', z: 2.576 },
]

interface CI {
  lo: number
  hi: number
  mean: number
  hit: boolean
}
const intervals = ref<CI[]>([])

// 표준정규 난수 (Box-Muller 변환)
function gauss(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function makeIntervals() {
  const z = levels[levelIdx.value].z
  const se = SIGMA / Math.sqrt(n.value)
  const arr: CI[] = []
  for (let i = 0; i < 100; i++) {
    let s = 0
    for (let j = 0; j < n.value; j++) s += MU + SIGMA * gauss()
    const m = s / n.value
    const lo = m - z * se
    const hi = m + z * se
    arr.push({ lo, hi, mean: m, hit: lo <= MU && MU <= hi })
  }
  intervals.value = arr
}

// n 이나 신뢰수준을 바꾸면 바로 새 실험 100번
watch([n, levelIdx], makeIntervals)
makeIntervals()

const hits = computed(() => intervals.value.filter((c) => c.hit).length)
const halfWidth = computed(() => levels[levelIdx.value].z * (SIGMA / Math.sqrt(n.value)))

// ── 그리기: 가로축은 μ±12 로 고정 ──
const XMIN = MU - 12
const XMAX = MU + 12
const ROW = 3.2
const TOP = 14
const H = TOP + 100 * ROW + 8
const sx = (x: number) =>
  ((Math.min(Math.max(x, XMIN), XMAX) - XMIN) / (XMAX - XMIN)) * props.width

const fmt = (v: number) => Number(v.toFixed(2)).toString()
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <!-- 조절 -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex gap-1">
        <button
          v-for="(lv, i) in levels"
          :key="lv.label"
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
          :class="
            levelIdx === i
              ? 'border-indigo-400 bg-indigo-50 text-indigo-800'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          "
          @click="levelIdx = i"
        >
          신뢰수준 {{ lv.label }}
        </button>
      </div>
      <button type="button"
        class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        @click="makeIntervals">🎲 구간 100개 다시 만들기</button>
    </div>
    <div class="mt-2 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-36 shrink-0 text-slate-500">표본 크기 n = <b class="text-slate-800">{{ n }}</b></span>
        <input v-model.number="n" type="range" min="10" max="200" step="5" class="flex-1 accent-indigo-500" />
      </label>
    </div>

    <!-- 구간 100개 -->
    <div class="mt-3 flex justify-center">
      <svg :viewBox="`0 0 ${width} ${H}`" :width="width" :height="H"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50">
        <!-- 참값 세로선 -->
        <line :x1="sx(MU)" :y1="0" :x2="sx(MU)" :y2="H" stroke="var(--c-indigo-600)" stroke-width="1.5"
          stroke-dasharray="5 4" />
        <text :x="sx(MU) + 4" y="11" fill="var(--c-indigo-600)" font-size="11">참값 μ = 50</text>
        <!-- 신뢰구간들 -->
        <g v-for="(ci, i) in intervals" :key="i">
          <line :x1="sx(ci.lo)" :y1="TOP + i * ROW" :x2="sx(ci.hi)" :y2="TOP + i * ROW"
            :stroke="ci.hit ? 'var(--c-slate-400)' : 'var(--c-rose-600)'" :stroke-width="ci.hit ? 1.2 : 2" />
          <circle :cx="sx(ci.mean)" :cy="TOP + i * ROW" r="1.4"
            :fill="ci.hit ? 'var(--c-slate-500)' : 'var(--c-rose-600)'" />
        </g>
      </svg>
    </div>

    <!-- 읽기 -->
    <div class="mt-3 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700">
        참값 포함 = <b>{{ hits }}</b> / 100
      </span>
      <span class="rounded-lg bg-rose-50 px-3 py-1.5 text-rose-700">
        놓침 = <b>{{ 100 - hits }}</b>개
      </span>
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">
        구간 폭 = ±<b>{{ fmt(halfWidth) }}</b>
      </span>
    </div>

    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      가로 막대 하나 = "표본을 뽑아 만든 신뢰구간" 한 번의 실험. <b class="text-rose-700">빨간 막대</b>는
      참값을 놓친 불운한 구간이에요. 신뢰수준 95% 면 놓침이 평균 5개꼴이고, 그게 "95% 신뢰"의 뜻입니다.
      n 을 키우면 구간이 짧아지고(더 정밀), 신뢰수준을 높이면 구간이 길어지는 것도 확인해 보세요.
    </p>
  </div>
</template>
