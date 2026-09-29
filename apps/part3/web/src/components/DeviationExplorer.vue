<script setup lang="ts">
// 2장 전용 인터랙티브 — 편차·분산·표준편차 탐색기.
// 각 데이터 점을 한 줄씩 배치하고, 평균(세로선)에서 점까지의 '편차 막대'를 그린다.
// 점을 끌면 평균·편차 합(항상 0)·분산·표준편차가 실시간으로 갱신된다.
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    initial?: number[]
    min?: number
    max?: number
  }>(),
  {
    initial: () => [30, 40, 50, 60, 70],
    min: 0,
    max: 100,
  },
)

const W = 440
const PAD = 24
const ROW_H = 26
const TOP = 18

const points = ref<number[]>([...props.initial])
const dragIdx = ref<number | null>(null)
const svgEl = ref<SVGSVGElement | null>(null)

const H = computed(() => TOP + points.value.length * ROW_H + 34)

const sx = (v: number) => PAD + ((v - props.min) / (props.max - props.min)) * (W - PAD * 2)
const rowY = (i: number) => TOP + i * ROW_H + ROW_H / 2

const mean = computed(() => points.value.reduce((a, b) => a + b, 0) / points.value.length)
const devs = computed(() => points.value.map((v) => v - mean.value))
const devSum = computed(() => devs.value.reduce((a, b) => a + b, 0))
const variance = computed(
  () => devs.value.reduce((a, d) => a + d * d, 0) / points.value.length,
)
const std = computed(() => Math.sqrt(variance.value))

function valueFromEvent(e: PointerEvent): number {
  const svg = svgEl.value
  if (!svg) return props.min
  const rect = svg.getBoundingClientRect()
  const px = ((e.clientX - rect.left) / rect.width) * W
  const v = props.min + ((px - PAD) / (W - PAD * 2)) * (props.max - props.min)
  return Math.round(Math.min(props.max, Math.max(props.min, v)))
}

function onDown(i: number) {
  dragIdx.value = i
}
function onMove(e: PointerEvent) {
  if (dragIdx.value === null) return
  points.value[dragIdx.value] = valueFromEvent(e)
}
function onUp() {
  dragIdx.value = null
}
function reset() {
  points.value = [...props.initial]
}

const fmt = (n: number) => Number(n.toFixed(2)).toString()
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <div class="flex justify-center">
      <svg
        ref="svgEl"
        :viewBox="`0 0 ${W} ${H}`"
        :width="W"
        :height="H"
        class="max-w-full touch-none rounded-lg border border-slate-100 bg-slate-50"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointerleave="onUp"
      >
        <!-- 평균 세로선 -->
        <line
          :x1="sx(mean)"
          :y1="6"
          :x2="sx(mean)"
          :y2="H - 28"
          stroke="var(--c-red-500)"
          stroke-width="2"
          stroke-dasharray="6 4"
        />
        <text :x="sx(mean)" :y="H - 14" text-anchor="middle" fill="var(--c-red-500)" class="text-xs font-bold">
          평균 {{ fmt(mean) }}
        </text>

        <!-- 데이터 행: 편차 막대 + 드래그 점 -->
        <g v-for="(v, i) in points" :key="i">
          <rect
            :x="Math.min(sx(v), sx(mean))"
            :y="rowY(i) - 5"
            :width="Math.abs(sx(v) - sx(mean))"
            :height="10"
            :fill="v >= mean ? 'var(--c-emerald-400)' : 'var(--c-rose-400)'"
            opacity="0.55"
            rx="3"
          />
          <circle
            :cx="sx(v)"
            :cy="rowY(i)"
            r="8"
            fill="var(--c-indigo-500)"
            stroke="var(--c-white)"
            stroke-width="2"
            class="cursor-grab"
            @pointerdown="onDown(i)"
          />
          <text
            :x="sx(v) + (v >= mean ? 12 : -12)"
            :y="rowY(i) + 3"
            :text-anchor="v >= mean ? 'start' : 'end'"
            fill="var(--c-slate-600)"
            class="text-xs"
          >
            {{ v }} (편차 {{ fmt(v - mean) }})
          </text>
        </g>
      </svg>
    </div>

    <!-- 상태 칩 -->
    <div class="mt-3 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">
        편차 합 = <b>{{ fmt(Math.abs(devSum) < 1e-9 ? 0 : devSum) }}</b> (항상 0!)
      </span>
      <span class="rounded-lg bg-indigo-50 px-3 py-1.5 text-indigo-700">분산 = <b>{{ fmt(variance) }}</b></span>
      <span class="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700">표준편차 σ = <b>{{ fmt(std) }}</b></span>
    </div>

    <div class="mt-3">
      <button
        type="button"
        class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
        @click="reset"
      >
        ↺ 리셋
      </button>
    </div>

    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      점을 좌우로 끌어 보세요. <b class="text-emerald-700">초록 막대</b>는 평균보다 큰 편차(+),
      <b class="text-rose-700">분홍 막대</b>는 작은 편차(−)입니다. +와 −가 정확히 상쇄돼 편차 합은
      늘 0입니다. 그래서 <b>제곱</b>해서 평균 낸 것이 분산, 그 제곱근이 표준편차 σ 입니다.
      점들을 평균에서 멀리 흩어 놓을수록 σ 가 커지는 걸 확인하세요.
    </p>
  </div>
</template>
