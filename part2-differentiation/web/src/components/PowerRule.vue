<script setup lang="ts">
// Phase 4 전용 인터랙티브 — 멱법칙 (x^n)' = n·x^(n-1).
// 지수 n 슬라이더를 움직이면, 미분 결과 수식이 즉시 바뀌고 "지수가 앞으로 내려와 계수가 되고
// 지수는 1 줄어든다"는 패턴을 강조해서 보여준다. 아래 작은 그래프로 x^n 의 모양 변화도 확인.
import { ref, computed } from 'vue'
import MathBlock from './MathBlock.vue'

const props = withDefaults(defineProps<{ maxN?: number; size?: number }>(), {
  maxN: 5,
  size: 300,
})

const n = ref(2)

// x^n 미분 결과 수식 문자열 (KaTeX)
const leftExpr = computed(() => `\\dfrac{d}{dx}\\, x^{${n.value}}`)
const rightExpr = computed(() => {
  const coef = n.value
  const ex = n.value - 1
  if (ex === 0) return `${coef}` // x^1 -> 1, 그 외 계수만
  if (ex === 1) return `${coef}x`
  return `${coef}x^{${ex}}`
})

// 작은 그래프: f(x) = x^n
const half = 1.5
const fn = (x: number) => Math.pow(x, n.value)
const ymax = computed(() => Math.max(Math.pow(half, n.value), 2))

function sx(x: number) {
  return ((x + half) / (2 * half)) * props.size
}
function sy(y: number) {
  return props.size / 2 - (y / ymax.value) * (props.size / 2)
}
const curve = computed(() => {
  const pts: string[] = []
  const N = 120
  for (let i = 0; i <= N; i++) {
    const x = -half + (2 * half * i) / N
    pts.push(`${sx(x).toFixed(1)},${sy(fn(x)).toFixed(1)}`)
  }
  return pts.join(' ')
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <!-- 지수 슬라이더 -->
    <div class="px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-28 shrink-0 text-slate-500">지수 n =
          <b class="text-slate-800">{{ n }}</b></span>
        <input v-model.number="n" type="range" min="1" :max="maxN" step="1" class="flex-1 accent-indigo-500" />
      </label>
    </div>

    <!-- 미분 결과 수식 -->
    <div class="my-3 rounded-lg bg-indigo-50 py-3 text-center">
      <MathBlock :expr="`${leftExpr} = ${rightExpr}`" />
    </div>

    <!-- 패턴 설명 -->
    <p class="px-1 text-sm leading-relaxed text-slate-600">
      지수 <b class="text-rose-600">{{ n }}</b> 이 앞으로 <b>내려와 계수</b>가 되고,
      지수는 <b class="text-emerald-600">{{ n }} − 1 = {{ n - 1 }}</b> 로 줄어듭니다.
      <span v-if="n === 1">(n=1 이면 x¹ 의 미분은 상수 1)</span>
    </p>

    <!-- 작은 그래프: x^n 의 모양 -->
    <div class="mt-3 flex justify-center">
      <svg
        :viewBox="`0 0 ${size} ${size}`"
        :width="size"
        :height="size"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50"
      >
        <g stroke="#94a3b8" stroke-width="1.2">
          <line :x1="0" :y1="size / 2" :x2="size" :y2="size / 2" />
          <line :x1="sx(0)" :y1="0" :x2="sx(0)" :y2="size" />
        </g>
        <polyline :points="curve" fill="none" stroke="#6366f1" stroke-width="2.5" />
      </svg>
    </div>
    <p class="mt-1 text-center text-xs text-slate-400">f(x) = x<sup>{{ n }}</sup> 의 모양</p>
  </div>
</template>
