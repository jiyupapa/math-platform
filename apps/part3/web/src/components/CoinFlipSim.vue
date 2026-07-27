<script setup lang="ts">
// 워밍업 전용 인터랙티브 — 동전 던지기 시뮬레이터.
// 던진 횟수가 늘어날수록 '앞면 비율'이 0.5 로 다가가는 것(큰 수의 법칙 맛보기)을
// 추이 그래프로 눈에 보여준다.
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 한 번에 던질 수 있는 최대 누적 횟수 (그 이상은 버튼 비활성) */
    maxTotal?: number
    width?: number
    height?: number
  }>(),
  { maxTotal: 20000, width: 440, height: 200 },
)

const heads = ref(0)
const total = ref(0)
/** 매 던지기 직후의 누적 앞면 비율 (그래프용) */
const history = ref<number[]>([])
/** 최근 던진 결과 20개 (앞=true) */
const recent = ref<boolean[]>([])

const ratio = computed(() => (total.value === 0 ? 0 : heads.value / total.value))
const full = computed(() => total.value >= props.maxTotal)

function flip(n: number) {
  const room = Math.min(n, props.maxTotal - total.value)
  for (let i = 0; i < room; i++) {
    const h = Math.random() < 0.5
    if (h) heads.value++
    total.value++
    history.value.push(heads.value / total.value)
    recent.value.push(h)
  }
  if (recent.value.length > 20) recent.value = recent.value.slice(-20)
}

function reset() {
  heads.value = 0
  total.value = 0
  history.value = []
  recent.value = []
}

// 그래프 좌표 변환 (x = 던진 순서, y = 비율 0~1)
const PAD = 26
const sx = (i: number) =>
  PAD + (history.value.length <= 1 ? 0 : (i / (history.value.length - 1)) * (props.width - PAD - 8))
const sy = (r: number) => 8 + (1 - r) * (props.height - 16 - 14)

const line = computed(() =>
  history.value.map((r, i) => `${sx(i).toFixed(1)},${sy(r).toFixed(1)}`).join(' '),
)

const fmt = (n: number) => Number(n.toFixed(3)).toString()
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <!-- 버튼 -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="n in [1, 10, 100, 1000]"
        :key="n"
        type="button"
        class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="full"
        @click="flip(n)"
      >
        {{ n }}번 던지기
      </button>
      <button
        type="button"
        class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
        @click="reset"
      >
        ↺ 리셋
      </button>
    </div>

    <!-- 누적 현황 칩 -->
    <div class="mt-3 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">
        던진 횟수 = <b>{{ total }}</b>
      </span>
      <span class="rounded-lg bg-indigo-50 px-3 py-1.5 text-indigo-700">
        앞면 = <b>{{ heads }}</b>
      </span>
      <span class="rounded-lg bg-rose-50 px-3 py-1.5 text-rose-700">
        앞면 비율 = <b>{{ total === 0 ? '—' : fmt(ratio) }}</b>
      </span>
    </div>

    <!-- 최근 결과 -->
    <div v-if="recent.length" class="mt-3 flex flex-wrap items-center gap-1">
      <span class="mr-1 text-xs text-slate-500">최근 결과:</span>
      <span
        v-for="(h, i) in recent"
        :key="i"
        class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
        :class="h ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'"
      >
        {{ h ? '앞' : '뒤' }}
      </span>
    </div>

    <!-- 비율 추이 그래프 -->
    <div class="mt-3 flex justify-center">
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        :width="width"
        :height="height"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50"
      >
        <!-- y 눈금 (0, 0.5, 1) -->
        <g class="text-xs" fill="var(--c-slate-400)">
          <text :x="4" :y="sy(1) + 3">1.0</text>
          <text :x="4" :y="sy(0.5) + 3">0.5</text>
          <text :x="4" :y="sy(0) + 3">0.0</text>
        </g>
        <line :x1="PAD" :y1="sy(1)" :x2="width - 8" :y2="sy(1)" stroke="var(--c-slate-200)" />
        <line :x1="PAD" :y1="sy(0)" :x2="width - 8" :y2="sy(0)" stroke="var(--c-slate-200)" />
        <!-- 0.5 기준선 -->
        <line
          :x1="PAD"
          :y1="sy(0.5)"
          :x2="width - 8"
          :y2="sy(0.5)"
          stroke="var(--c-amber-500)"
          stroke-width="1.5"
          stroke-dasharray="5 4"
        />
        <!-- 비율 추이 -->
        <polyline v-if="history.length > 1" :points="line" fill="none" stroke="var(--c-indigo-500)" stroke-width="2" />
        <circle
          v-if="history.length"
          :cx="sx(history.length - 1)"
          :cy="sy(history[history.length - 1])"
          r="4"
          fill="var(--c-indigo-500)"
        />
        <text v-if="!history.length" :x="width / 2" :y="height / 2" text-anchor="middle" fill="var(--c-slate-400)" class="text-xs">
          버튼을 눌러 동전을 던져 보세요
        </text>
        <text :x="width / 2" :y="height - 4" text-anchor="middle" fill="var(--c-slate-400)" class="text-xs">
          던진 횟수 →
        </text>
      </svg>
    </div>

    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      파란 선 = 지금까지의 <b>앞면 비율</b>, 주황 점선 = 이론값 <b>0.5</b>.
      처음엔 크게 출렁이지만 던질수록 0.5 근처에서 잠잠해집니다 — 7장에서 배울 <b>큰 수의 법칙</b>이에요.
    </p>
  </div>
</template>
