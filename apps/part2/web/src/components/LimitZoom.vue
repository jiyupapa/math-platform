<script setup lang="ts">
// Phase 2 전용 인터랙티브 시각화 (SVG) — "극한 줌인".
// 한 점 주위를 점점 확대하면 곡선이 '직선(접선)'과 구분되지 않게 되는 것(국소 선형성)을
// 눈으로 보여준다. 이것이 "순간변화율 = 그 점 접선의 기울기"인 이유의 직관.
//
// 사용 예:
//   <LimitZoom :fn="(x)=>x*x" :dfn="(x)=>2*x" :a="1" label="f(x) = x^2" />
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    fn: (x: number) => number
    dfn: (x: number) => number
    /** 확대의 중심이 되는 점 x=a */
    a?: number
    label?: string
    /** 확대 배율 1 일 때 보이는 창의 반폭 */
    baseHalf?: number
    maxZoom?: number
    size?: number
  }>(),
  { a: 1, label: '', baseHalf: 2.5, maxZoom: 80, size: 340 },
)

const zoom = ref(1)

const fa = computed(() => props.fn(props.a))
const slope = computed(() => props.dfn(props.a))
const halfSpan = computed(() => props.baseHalf / zoom.value)

// 창: [a-halfSpan, a+halfSpan] × [fa-halfSpan, fa+halfSpan] (정사각 = 기울기 왜곡 없음)
const xlo = computed(() => props.a - halfSpan.value)
const ylo = computed(() => fa.value - halfSpan.value)
function sx(x: number) {
  return ((x - xlo.value) / (2 * halfSpan.value)) * props.size
}
function sy(y: number) {
  return props.size - ((y - ylo.value) / (2 * halfSpan.value)) * props.size
}

const curvePoints = computed(() => {
  const pts: string[] = []
  const n = 160
  for (let i = 0; i <= n; i++) {
    const x = xlo.value + (2 * halfSpan.value * i) / n
    pts.push(`${sx(x).toFixed(1)},${sy(props.fn(x)).toFixed(1)}`)
  }
  return pts.join(' ')
})

const tangentY = (x: number) => fa.value + slope.value * (x - props.a)

const fmt = (n: number, d = 2) => (Number.isFinite(n) ? Number(n.toFixed(d)).toString() : '—')
// 창 폭이 작아질수록 소수 자리를 늘려 보여준다
const windowWidth = computed(() => 2 * halfSpan.value)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <p v-if="label" class="mb-2 text-center text-sm font-semibold text-slate-600">
      {{ label }} · 점 x = {{ fmt(a) }} 주위 확대
    </p>

    <div class="flex justify-center">
      <svg
        :viewBox="`0 0 ${size} ${size}`"
        :width="size"
        :height="size"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50"
      >
        <!-- 점을 지나는 옅은 십자 보조선 (기준용) -->
        <g stroke="var(--c-slate-200)" stroke-width="1">
          <line :x1="0" :y1="sy(fa)" :x2="size" :y2="sy(fa)" />
          <line :x1="sx(a)" :y1="0" :x2="sx(a)" :y2="size" />
        </g>

        <!-- 접선 (빨강) -->
        <line
          :x1="sx(xlo)" :y1="sy(tangentY(xlo))"
          :x2="sx(a + halfSpan)" :y2="sy(tangentY(a + halfSpan))"
          stroke="var(--c-red-500)" stroke-width="2.5"
        />
        <!-- 함수 곡선 (파랑) -->
        <polyline :points="curvePoints" fill="none" stroke="var(--c-indigo-500)" stroke-width="2.5" />

        <!-- 확대 중심 점 -->
        <circle :cx="sx(a)" :cy="sy(fa)" r="6" fill="var(--c-white)" stroke="var(--c-indigo-500)" stroke-width="3" />
      </svg>
    </div>

    <!-- 확대 슬라이더 -->
    <div class="mt-4 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-32 shrink-0 text-slate-500">확대 배율 =
          <b class="text-slate-800">×{{ fmt(zoom, 0) }}</b></span>
        <input v-model.number="zoom" type="range" min="1" :max="maxZoom" step="1" class="flex-1 accent-indigo-500" />
      </label>
    </div>

    <!-- 읽기 -->
    <div class="mt-3 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">
        보이는 구간 폭 = <b>{{ fmt(windowWidth, 4) }}</b>
      </span>
      <span class="rounded-lg bg-red-50 px-3 py-1.5 text-red-700">
        🔴 접선 기울기 = <b>{{ fmt(slope) }}</b>
      </span>
    </div>
    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      배율을 키워보세요. 확대할수록 <b class="text-indigo-600">파란 곡선</b>이
      <b class="text-red-600">빨간 접선</b>과 겹쳐 구분이 안 됩니다. 아주 가까이서 보면 곡선도
      "거의 직선"이죠. 그 직선의 기울기가 바로 그 점의 <b>순간변화율</b>입니다.
    </p>
  </div>
</template>
