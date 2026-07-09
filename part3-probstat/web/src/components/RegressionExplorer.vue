<script setup lang="ts">
// Phase 10 전용 인터랙티브 — 회귀 직선 탐험기.
// 산점도 위에서 직접 직선(기울기 a·절편 b)을 맞추며 잔차(빨간 세로선)와
// 잔차 제곱합(SSE)을 실시간으로 본다. "최적 직선 찾기"를 누르면
// 최소제곱법이 찾은 직선과 내 직선의 SSE 를 비교할 수 있다.
// 점은 드래그로 옮기고, 빈 곳을 누르면 점이 추가된다.
import { ref, computed } from 'vue'

interface Pt {
  x: number
  y: number
}

const props = withDefaults(
  defineProps<{
    /** 초기 데이터 (x: 0~10, y: 0~100) */
    initialPoints?: Pt[]
    size?: number
    height?: number
  }>(),
  {
    initialPoints: () => [
      { x: 1, y: 32 },
      { x: 2, y: 44 },
      { x: 3, y: 49 },
      { x: 4, y: 55 },
      { x: 5, y: 65 },
      { x: 6, y: 62 },
      { x: 7, y: 78 },
      { x: 8, y: 83 },
    ],
    size: 440,
    height: 300,
  },
)

const XMAX = 10
const YMAX = 100
const PAD = 26

const points = ref<Pt[]>(props.initialPoints.map((p) => ({ ...p })))
const a = ref(4) // 내 직선의 기울기
const b = ref(40) // 내 직선의 절편
const showBest = ref(false)
const dragIdx = ref<number | null>(null)
const svgEl = ref<SVGSVGElement | null>(null)

// ── 통계량 (평균·상관계수·최소제곱 해) ──────────────────────────
const stats = computed(() => {
  const pts = points.value
  const nn = pts.length
  const mx = pts.reduce((s, p) => s + p.x, 0) / nn
  const my = pts.reduce((s, p) => s + p.y, 0) / nn
  let sxx = 0
  let syy = 0
  let sxy = 0
  for (const p of pts) {
    sxx += (p.x - mx) ** 2
    syy += (p.y - my) ** 2
    sxy += (p.x - mx) * (p.y - my)
  }
  const bestA = sxx === 0 ? 0 : sxy / sxx
  const bestB = my - bestA * mx
  const r = sxx === 0 || syy === 0 ? 0 : sxy / Math.sqrt(sxx * syy)
  return { bestA, bestB, r }
})

function sse(aa: number, bb: number): number {
  return points.value.reduce((s, p) => s + (p.y - (aa * p.x + bb)) ** 2, 0)
}
const mySSE = computed(() => sse(a.value, b.value))
const bestSSE = computed(() => sse(stats.value.bestA, stats.value.bestB))

// ── 좌표 변환 ──────────────────────────────────────────────────
const sx = (x: number) => PAD + (x / XMAX) * (props.size - 2 * PAD)
const sy = (y: number) => props.height - PAD - (y / YMAX) * (props.height - 2 * PAD)

// 화면 좌표 → 데이터 좌표 (드래그·점 추가용)
function toData(e: PointerEvent): Pt {
  const el = svgEl.value
  if (!el) return { x: 0, y: 0 }
  const rect = el.getBoundingClientRect()
  const px = ((e.clientX - rect.left) / rect.width) * props.size
  const py = ((e.clientY - rect.top) / rect.height) * props.height
  const x = ((px - PAD) / (props.size - 2 * PAD)) * XMAX
  const y = ((props.height - PAD - py) / (props.height - 2 * PAD)) * YMAX
  return {
    x: Math.round(Math.min(XMAX, Math.max(0, x)) * 10) / 10,
    y: Math.round(Math.min(YMAX, Math.max(0, y))),
  }
}

function startDrag(i: number) {
  dragIdx.value = i
}
function onMove(e: PointerEvent) {
  if (dragIdx.value === null) return
  points.value[dragIdx.value] = toData(e)
}
function endDrag() {
  dragIdx.value = null
}
function addPoint(e: PointerEvent) {
  if (dragIdx.value !== null) return
  if (points.value.length >= 15) return
  points.value.push(toData(e))
}
function reset() {
  points.value = props.initialPoints.map((p) => ({ ...p }))
  a.value = 4
  b.value = 40
  showBest.value = false
}

const fmt = (v: number, d = 1) => Number(v.toFixed(d)).toString()
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <div class="flex justify-center">
      <svg
        ref="svgEl"
        :viewBox="`0 0 ${size} ${height}`"
        :width="size"
        :height="height"
        class="max-w-full touch-none rounded-lg border border-slate-100 bg-slate-50"
        @pointermove="onMove"
        @pointerup="endDrag"
        @pointerleave="endDrag"
      >
        <!-- 클릭으로 점 추가하는 배경 -->
        <rect :x="0" :y="0" :width="size" :height="height" fill="transparent" @pointerdown="addPoint" />

        <!-- 격자 -->
        <g stroke="#e2e8f0" stroke-width="1">
          <line v-for="t in 5" :key="'gx' + t" :x1="sx(t * 2)" :y1="PAD" :x2="sx(t * 2)" :y2="height - PAD" />
          <line v-for="t in 4" :key="'gy' + t" :x1="PAD" :y1="sy(t * 25)" :x2="size - PAD" :y2="sy(t * 25)" />
        </g>
        <!-- 축 -->
        <line :x1="PAD" :y1="height - PAD" :x2="size - PAD" :y2="height - PAD" stroke="#94a3b8" stroke-width="1.2" />
        <line :x1="PAD" :y1="PAD" :x2="PAD" :y2="height - PAD" stroke="#94a3b8" stroke-width="1.2" />
        <text :x="size - PAD" :y="height - 8" text-anchor="end" font-size="10" fill="#94a3b8">공부 시간(시간) →</text>
        <text :x="8" :y="PAD - 8" font-size="10" fill="#94a3b8">점수</text>

        <!-- 잔차 (내 직선 기준) -->
        <g v-for="(p, i) in points" :key="'r' + i">
          <line
            :x1="sx(p.x)"
            :y1="sy(p.y)"
            :x2="sx(p.x)"
            :y2="sy(Math.min(YMAX, Math.max(0, a * p.x + b)))"
            stroke="#fb7185"
            stroke-width="1.5"
            stroke-dasharray="3 2"
          />
        </g>

        <!-- 내 직선 (파랑) -->
        <line :x1="sx(0)" :y1="sy(b)" :x2="sx(XMAX)" :y2="sy(a * XMAX + b)" stroke="#6366f1" stroke-width="2.5" />
        <!-- 최소제곱 직선 (초록) -->
        <line
          v-if="showBest"
          :x1="sx(0)"
          :y1="sy(stats.bestB)"
          :x2="sx(XMAX)"
          :y2="sy(stats.bestA * XMAX + stats.bestB)"
          stroke="#10b981"
          stroke-width="2.5"
          stroke-dasharray="7 4"
        />

        <!-- 데이터 점 (드래그 가능) -->
        <circle
          v-for="(p, i) in points"
          :key="'p' + i"
          :cx="sx(p.x)"
          :cy="sy(p.y)"
          r="7"
          fill="#4f46e5"
          stroke="#fff"
          stroke-width="2"
          class="cursor-grab"
          @pointerdown.stop="startDrag(i)"
        />
      </svg>
    </div>

    <!-- 내 직선 조절 -->
    <div class="mt-3 space-y-2 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-40 shrink-0 text-slate-500">
          기울기 a = <b class="text-slate-800">{{ fmt(a) }}</b>
        </span>
        <input v-model.number="a" type="range" min="-5" max="15" step="0.1" class="flex-1 accent-indigo-500" />
      </label>
      <label class="flex items-center gap-3 text-sm">
        <span class="w-40 shrink-0 text-slate-500">
          절편 b = <b class="text-slate-800">{{ fmt(b) }}</b>
        </span>
        <input v-model.number="b" type="range" min="0" max="80" step="1" class="flex-1 accent-indigo-500" />
      </label>
    </div>

    <!-- 버튼 -->
    <div class="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 text-sm font-medium"
        :class="showBest ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-emerald-600 text-white hover:bg-emerald-500'"
        @click="showBest = !showBest"
      >
        {{ showBest ? '최적 직선 숨기기' : '🏆 최적 직선 찾기 (최소제곱법)' }}
      </button>
      <button
        type="button"
        class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
        @click="reset"
      >
        ↺ 리셋
      </button>
    </div>

    <!-- 읽기 -->
    <div class="mt-3 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">
        상관계수 r = <b>{{ fmt(stats.r, 2) }}</b>
      </span>
      <span class="rounded-lg bg-indigo-50 px-3 py-1.5 text-indigo-700">
        내 직선 SSE = <b>{{ Math.round(mySSE).toLocaleString() }}</b>
      </span>
      <template v-if="showBest">
        <span class="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700">
          최적 SSE = <b>{{ Math.round(bestSSE).toLocaleString() }}</b>
        </span>
        <span class="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700">
          최적 직선: ŷ = <b>{{ fmt(stats.bestA, 2) }}</b>x + <b>{{ fmt(stats.bestB, 1) }}</b>
        </span>
      </template>
    </div>

    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      빨간 점선 = <b>잔차</b>(실제 − 내 직선의 예측). SSE = 잔차 제곱의 합 — 슬라이더로 SSE 를
      최대한 줄여본 뒤 <b>최적 직선</b>과 비교해 보세요. 점을 끌어 옮기거나 빈 곳을 눌러
      점을 추가하면(최대 15개) 직선과 r 이 실시간으로 다시 계산됩니다.
    </p>
  </div>
</template>
