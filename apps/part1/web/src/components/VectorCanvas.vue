<script setup lang="ts">
// 인터랙티브 벡터 캔버스 (SVG).
// 좌표평면 + 격자 위에 벡터(원점에서 뻗는 화살표)를 그리고, 끝점을 드래그할 수 있다.
// 수학 좌표계(위로 +y)를 화면 좌표계(아래로 +y)로 변환해서 그린다.
//
// 사용 예:
//   const vecs = ref<Vec[]>([{ x: 2, y: 1, color: '#6366f1', label: 'a', draggable: true }])
//   <VectorCanvas v-model="vecs" :range="5" />
import { ref, computed } from 'vue'

export interface Vec {
  /** 벡터의 성분 (x, y) — tail 기준 상대 변위 */
  x: number
  y: number
  color?: string
  label?: string
  draggable?: boolean
  /** 화살표 시작점 (기본 원점). 평행사변형법에서 꼬리를 이어 그릴 때 사용 */
  tail?: { x: number; y: number }
  /** 점선으로 그리기 (보조선) */
  dashed?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: Vec[]
    /** 좌표축이 -range ~ +range 까지 표시됨 */
    range?: number
    /** SVG 한 변 픽셀 크기 */
    size?: number
    /** 드래그 시 정수로 스냅 */
    snap?: boolean
    /** 원점에서 뻗는 화살표 표시 여부 (false 면 점만 → 좌표 학습용) */
    showArrows?: boolean
  }>(),
  { range: 5, size: 360, snap: true, showArrows: true },
)

const emit = defineEmits<{ 'update:modelValue': [Vec[]] }>()

const svgRef = ref<SVGSVGElement | null>(null)
const dragging = ref<number | null>(null)

// 수학 좌표 -> 화면(px) 좌표
const scale = computed(() => props.size / (props.range * 2))
const origin = computed(() => props.size / 2)
function toScreenX(x: number) {
  return origin.value + x * scale.value
}
function toScreenY(y: number) {
  return origin.value - y * scale.value
}

// 화살표 시작점(꼬리)과 끝점(팁)의 수학 좌표
function tailOf(v: Vec) {
  return v.tail ?? { x: 0, y: 0 }
}
function tipOf(v: Vec) {
  const t = tailOf(v)
  return { x: t.x + v.x, y: t.y + v.y }
}

// 격자선 좌표 목록
const ticks = computed(() => {
  const arr: number[] = []
  for (let i = -props.range; i <= props.range; i++) arr.push(i)
  return arr
})

// 화면(px) -> 수학 좌표
function toMath(clientX: number, clientY: number): { x: number; y: number } {
  const svg = svgRef.value!
  const rect = svg.getBoundingClientRect()
  const px = ((clientX - rect.left) / rect.width) * props.size
  const py = ((clientY - rect.top) / rect.height) * props.size
  let mx = (px - origin.value) / scale.value
  let my = (origin.value - py) / scale.value
  if (props.snap) {
    mx = Math.round(mx)
    my = Math.round(my)
  }
  const clamp = (v: number) => Math.max(-props.range, Math.min(props.range, v))
  return { x: clamp(mx), y: clamp(my) }
}

function startDrag(i: number, e: PointerEvent) {
  if (!props.modelValue[i].draggable) return
  dragging.value = i
  ;(e.target as Element).setPointerCapture(e.pointerId)
}

function onMove(e: PointerEvent) {
  if (dragging.value === null) return
  const i = dragging.value
  const tip = toMath(e.clientX, e.clientY)
  // 드래그한 위치는 화살표 끝(팁). 성분 = 팁 − 꼬리.
  const tail = props.modelValue[i].tail ?? { x: 0, y: 0 }
  const next = props.modelValue.map((v, idx) =>
    idx === i ? { ...v, x: tip.x - tail.x, y: tip.y - tail.y } : v,
  )
  emit('update:modelValue', next)
}

function endDrag() {
  dragging.value = null
}
</script>

<template>
  <div class="my-5 flex justify-center">
    <svg
      ref="svgRef"
      :viewBox="`0 0 ${size} ${size}`"
      :width="size"
      :height="size"
      class="max-w-full touch-none rounded-xl border border-slate-200 bg-white"
      @pointermove="onMove"
      @pointerup="endDrag"
      @pointerleave="endDrag"
    >
      <!-- 격자 -->
      <g stroke="#eef2f7" stroke-width="1">
        <line v-for="t in ticks" :key="'v' + t" :x1="toScreenX(t)" :y1="0" :x2="toScreenX(t)" :y2="size" />
        <line v-for="t in ticks" :key="'h' + t" :x1="0" :y1="toScreenY(t)" :x2="size" :y2="toScreenY(t)" />
      </g>

      <!-- 축 -->
      <g stroke="#94a3b8" stroke-width="1.5">
        <line :x1="0" :y1="toScreenY(0)" :x2="size" :y2="toScreenY(0)" />
        <line :x1="toScreenX(0)" :y1="0" :x2="toScreenX(0)" :y2="size" />
      </g>
      <!-- 눈금 숫자 (0 제외, 양 끝 제외) -->
      <g fill="#94a3b8" font-size="10" text-anchor="middle">
        <text v-for="t in ticks.filter((n) => n !== 0 && Math.abs(n) !== range)" :key="'tx' + t"
          :x="toScreenX(t)" :y="toScreenY(0) + 14">{{ t }}</text>
        <text v-for="t in ticks.filter((n) => n !== 0 && Math.abs(n) !== range)" :key="'ty' + t"
          :x="toScreenX(0) - 10" :y="toScreenY(t) + 4">{{ t }}</text>
      </g>

      <!-- 화살표 머리 정의 -->
      <defs>
        <marker
          v-for="(v, i) in modelValue"
          :id="`arrow-${i}`"
          :key="`m-${i}`"
          markerWidth="10"
          markerHeight="10"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L7,3 L0,6 Z" :fill="v.color || '#6366f1'" />
        </marker>
      </defs>

      <!-- 벡터들 -->
      <g v-for="(v, i) in modelValue" :key="i">
        <line
          v-if="showArrows"
          :x1="toScreenX(tailOf(v).x)"
          :y1="toScreenY(tailOf(v).y)"
          :x2="toScreenX(tipOf(v).x)"
          :y2="toScreenY(tipOf(v).y)"
          :stroke="v.color || '#6366f1'"
          :stroke-width="v.dashed ? 2 : 3"
          :stroke-dasharray="v.dashed ? '6 5' : undefined"
          :opacity="v.dashed ? 0.45 : 1"
          :marker-end="v.dashed ? undefined : `url(#arrow-${i})`"
        />
        <!-- 점선 보조선은 핸들·라벨 없이 선만 그린다 (끝점 겹침 방지) -->
        <template v-if="!v.dashed">
          <!-- 드래그 핸들 (팁 위치) -->
          <circle
            :cx="toScreenX(tipOf(v).x)"
            :cy="toScreenY(tipOf(v).y)"
            :r="v.draggable ? 9 : 4"
            :fill="v.draggable ? '#fff' : v.color || '#6366f1'"
            :stroke="v.color || '#6366f1'"
            stroke-width="2.5"
            :class="v.draggable ? 'cursor-grab' : ''"
            @pointerdown="startDrag(i, $event)"
          />
          <text
            :x="toScreenX(tipOf(v).x) + 10"
            :y="toScreenY(tipOf(v).y) - 8"
            :fill="v.color || '#6366f1'"
            font-size="13"
            font-weight="bold"
          >
            {{ v.label ? v.label + ' ' : '' }}({{ v.x }}, {{ v.y }})
          </text>
        </template>
      </g>
    </svg>
  </div>
</template>
