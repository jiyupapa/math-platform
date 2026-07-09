<script setup lang="ts">
// 1장 전용 인터랙티브 — 수직선 위 점을 드래그하면 평균·중앙값이 실시간으로 움직인다.
// 점 하나를 극단으로 끌면 평균(빨강)은 크게 끌려가지만 중앙값(파랑)은 버티는 것을 보여준다.
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    initial?: number[]
    min?: number
    max?: number
  }>(),
  {
    initial: () => [20, 30, 40, 45, 50, 60, 70],
    min: 0,
    max: 100,
  },
)

const W = 440
const H = 150
const PAD = 24
const AXIS_Y = 84

const points = ref<number[]>([...props.initial])
const dragIdx = ref<number | null>(null)
const svgEl = ref<SVGSVGElement | null>(null)

const sx = (v: number) => PAD + ((v - props.min) / (props.max - props.min)) * (W - PAD * 2)

const mean = computed(() => points.value.reduce((a, b) => a + b, 0) / points.value.length)
const median = computed(() => {
  const s = [...points.value].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 === 1 ? s[m] : (s[m - 1] + s[m]) / 2
})

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

function makeOutlier() {
  const i = points.value.indexOf(Math.max(...points.value))
  points.value[i] = 95
}
function reset() {
  points.value = [...props.initial]
}

function ticks() {
  const arr: number[] = []
  for (let t = props.min; t <= props.max; t += 10) arr.push(t)
  return arr
}

const fmt = (n: number) => Number(n.toFixed(1)).toString()
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
        <!-- 수직선(축) + 눈금 -->
        <line :x1="PAD" :y1="AXIS_Y" :x2="W - PAD" :y2="AXIS_Y" stroke="#94a3b8" stroke-width="1.5" />
        <g v-for="t in ticks()" :key="t">
          <line :x1="sx(t)" :y1="AXIS_Y - 4" :x2="sx(t)" :y2="AXIS_Y + 4" stroke="#cbd5e1" />
          <text :x="sx(t)" :y="AXIS_Y + 18" text-anchor="middle" fill="#94a3b8" class="text-[9px]">
            {{ t }}
          </text>
        </g>

        <!-- 평균 마커 (빨강, 아래 삼각형 = 시소의 받침점) -->
        <polygon
          :points="`${sx(mean)},${AXIS_Y + 24} ${sx(mean) - 7},${AXIS_Y + 38} ${sx(mean) + 7},${AXIS_Y + 38}`"
          fill="#ef4444"
        />
        <text :x="sx(mean)" :y="AXIS_Y + 52" text-anchor="middle" fill="#ef4444" class="text-[10px] font-bold">
          평균 {{ fmt(mean) }}
        </text>

        <!-- 중앙값 마커 (파랑, 위 삼각형) -->
        <polygon
          :points="`${sx(median)},${AXIS_Y - 26} ${sx(median) - 7},${AXIS_Y - 40} ${sx(median) + 7},${AXIS_Y - 40}`"
          fill="#3b82f6"
        />
        <text :x="sx(median)" :y="AXIS_Y - 46" text-anchor="middle" fill="#3b82f6" class="text-[10px] font-bold">
          중앙값 {{ fmt(median) }}
        </text>

        <!-- 데이터 점 (드래그 가능) -->
        <circle
          v-for="(v, i) in points"
          :key="i"
          :cx="sx(v)"
          :cy="AXIS_Y"
          r="8"
          fill="#6366f1"
          stroke="#fff"
          stroke-width="2"
          class="cursor-grab"
          :class="dragIdx === i ? 'opacity-80' : ''"
          @pointerdown="onDown(i)"
        />
      </svg>
    </div>

    <!-- 값 칩 -->
    <div class="mt-3 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">
        데이터 = <b>[{{ [...points].sort((a, b) => a - b).join(', ') }}]</b>
      </span>
      <span class="rounded-lg bg-rose-50 px-3 py-1.5 text-rose-700">평균 = <b>{{ fmt(mean) }}</b></span>
      <span class="rounded-lg bg-blue-50 px-3 py-1.5 text-blue-700">중앙값 = <b>{{ fmt(median) }}</b></span>
    </div>

    <!-- 버튼 -->
    <div class="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-200"
        @click="makeOutlier"
      >
        ⚡ 이상치 만들기 (가장 큰 점을 95로)
      </button>
      <button
        type="button"
        class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
        @click="reset"
      >
        ↺ 리셋
      </button>
    </div>

    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      보라 점을 좌우로 끌어 보세요. <b class="text-rose-600">평균(빨간 받침점)</b>은 모든 점의
      무게중심이라 극단값에 끌려가지만, <b class="text-blue-600">중앙값(파란 삼각형)</b>은
      "가운데 순번"만 보므로 거의 움직이지 않습니다.
    </p>
  </div>
</template>
