<script setup lang="ts">
// Phase 1 전용 인터랙티브 시각화 (SVG).
// 기울기 a 와 y절편 b 슬라이더로 직선 y = a·x + b 를 직접 조종한다.
// '가로 1칸을 갈 때 세로로 a 칸 오르내린다'는 기울기(rise/run)를 삼각형으로 보여준다.
//
// 사용 예:
//   <LineExplorer :init-a="1" :init-b="1" />
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    xmin?: number
    xmax?: number
    ymin?: number
    ymax?: number
    initA?: number
    initB?: number
    width?: number
    height?: number
  }>(),
  {
    xmin: -5,
    xmax: 5,
    ymin: -5,
    ymax: 5,
    initA: 1,
    initB: 1,
    width: 440,
    height: 340,
  },
)

// 기울기 a, y절편 b (슬라이더로 제어)
const a = ref(props.initA)
const b = ref(props.initB)

// 수학 좌표 → 화면(px) 좌표
function sx(x: number) {
  return ((x - props.xmin) / (props.xmax - props.xmin)) * props.width
}
function sy(y: number) {
  return props.height - ((y - props.ymin) / (props.ymax - props.ymin)) * props.height
}

const line = (x: number) => a.value * x + b.value

// 정수 눈금
function ticks(lo: number, hi: number) {
  const arr: number[] = []
  for (let t = Math.ceil(lo); t <= Math.floor(hi); t++) arr.push(t)
  return arr
}
const xticks = computed(() => ticks(props.xmin, props.xmax))
const yticks = computed(() => ticks(props.ymin, props.ymax))

// rise/run 삼각형: (0, b) 에서 (1, a+b) 로. 가로 1칸, 세로 a칸.
const p0 = computed(() => ({ x: 0, y: b.value }))
const p1 = computed(() => ({ x: 1, y: a.value + b.value }))

const fmt = (n: number) => (Number.isFinite(n) ? Number(n.toFixed(2)).toString() : '—')

// 사람이 읽는 직선 식 (부호 처리)
const equation = computed(() => {
  const av = fmt(a.value)
  const bv = Math.abs(b.value)
  const sign = b.value >= 0 ? '+' : '−'
  return `y = ${av}·x ${sign} ${fmt(bv)}`
})

const xAxisY = computed(() => sy(0))
const yAxisX = computed(() => sx(0))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-2 text-center text-sm font-semibold text-slate-600">
      {{ equation }}
    </p>

    <div class="flex justify-center">
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        :width="width"
        :height="height"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50"
      >
        <!-- 격자 -->
        <g stroke="var(--c-slate-200)" stroke-width="1">
          <line v-for="t in xticks" :key="'gx' + t" :x1="sx(t)" :y1="0" :x2="sx(t)" :y2="height" />
          <line v-for="t in yticks" :key="'gy' + t" :x1="0" :y1="sy(t)" :x2="width" :y2="sy(t)" />
        </g>

        <!-- 축 -->
        <g stroke="var(--c-slate-400)" stroke-width="1.5">
          <line :x1="0" :y1="xAxisY" :x2="width" :y2="xAxisY" />
          <line :x1="yAxisX" :y1="0" :x2="yAxisX" :y2="height" />
        </g>
        <!-- 눈금 숫자 -->
        <g fill="var(--c-slate-400)" font-size="10" text-anchor="middle">
          <text v-for="t in xticks.filter((n) => n !== 0)" :key="'lx' + t"
            :x="sx(t)" :y="xAxisY + 12">{{ t }}</text>
        </g>

        <!-- rise/run 삼각형 -->
        <!-- 가로(run) -->
        <line :x1="sx(p0.x)" :y1="sy(p0.y)" :x2="sx(p1.x)" :y2="sy(p0.y)"
          stroke="var(--c-amber-500)" stroke-width="2" stroke-dasharray="4 3" />
        <!-- 세로(rise) -->
        <line :x1="sx(p1.x)" :y1="sy(p0.y)" :x2="sx(p1.x)" :y2="sy(p1.y)"
          stroke="var(--c-emerald-500)" stroke-width="2" stroke-dasharray="4 3" />
        <text :x="(sx(p0.x) + sx(p1.x)) / 2" :y="sy(p0.y) + 14" fill="var(--c-amber-600)" font-size="11" text-anchor="middle">가로 +1</text>
        <text :x="sx(p1.x) + 6" :y="(sy(p0.y) + sy(p1.y)) / 2" fill="var(--c-emerald-600)" font-size="11">세로 {{ fmt(a) }}</text>

        <!-- 직선 -->
        <line :x1="sx(xmin)" :y1="sy(line(xmin))" :x2="sx(xmax)" :y2="sy(line(xmax))"
          stroke="var(--c-indigo-500)" stroke-width="2.5" />

        <!-- y절편 점 -->
        <circle :cx="sx(0)" :cy="sy(b)" r="5" fill="var(--c-white)" stroke="var(--c-indigo-500)" stroke-width="3" />
        <text :x="sx(0) + 8" :y="sy(b) - 8" fill="var(--c-indigo-500)" font-size="11" font-weight="bold">
          y절편 (0, {{ fmt(b) }})
        </text>
      </svg>
    </div>

    <!-- 슬라이더 -->
    <div class="mt-4 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-32 shrink-0 text-slate-500">기울기 a =
          <b class="text-slate-800">{{ fmt(a) }}</b></span>
        <input v-model.number="a" type="range" min="-3" max="3" step="0.25" class="flex-1 accent-indigo-500" />
      </label>
      <label class="mt-2 flex items-center gap-3 text-sm">
        <span class="w-32 shrink-0 text-slate-500">y절편 b =
          <b class="text-slate-800">{{ fmt(b) }}</b></span>
        <input v-model.number="b" type="range" min="-4" max="4" step="0.5" class="flex-1 accent-indigo-500" />
      </label>
    </div>

    <!-- 읽기 -->
    <div class="mt-3 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700">🟡 가로 변화 = <b>+1</b></span>
      <span class="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700">🟢 세로 변화 = <b>{{ fmt(a) }}</b></span>
      <span class="rounded-lg bg-indigo-50 px-3 py-1.5 text-indigo-700">
        기울기 = 세로 ÷ 가로 = <b>{{ fmt(a) }}</b>
      </span>
    </div>
    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      기울기 <b>a</b> 를 키우면 직선이 <b>가팔라지고</b>, 음수면 <b>내리막</b>이 됩니다.
      y절편 <b>b</b> 는 직선을 <b>위아래로</b> 통째로 옮깁니다. 기울기는 어디서나 똑같죠 —
      직선의 특징입니다. (곡선은 점마다 달라져요. 그게 다음 챕터의 주제!)
    </p>
  </div>
</template>
