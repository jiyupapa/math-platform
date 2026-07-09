<script setup lang="ts">
// Phase 7 전용 인터랙티브 — 시그모이드와 그 미분.
// 위: σ(x)=1/(1+e^-x) 의 S자 곡선. 아래: 도함수 σ'(x)=σ(1-σ) 의 종 모양.
// 슬라이더로 x 를 움직이며 σ, 1-σ, 그 곱을 확인하고, 양 끝에서 기울기가 0 에 가까워지는
// '기울기 소실'을 눈으로 본다.
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{ width?: number; topH?: number; botH?: number }>(), {
  width: 380,
  topH: 150,
  botH: 140,
})

const x0 = ref(0)
const XMIN = -6
const XMAX = 6

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))
const dsigmoid = (x: number) => sigmoid(x) * (1 - sigmoid(x))

const s = computed(() => sigmoid(x0.value))
const ds = computed(() => dsigmoid(x0.value))

function sx(x: number) {
  return ((x - XMIN) / (XMAX - XMIN)) * props.width
}
// 위 패널: y ∈ [-0.08, 1.08]
function syTop(y: number) {
  return props.topH - ((y + 0.08) / 1.16) * props.topH
}
// 아래 패널: y ∈ [-0.02, 0.30]
function syBot(y: number) {
  return props.botH - ((y + 0.02) / 0.32) * props.botH
}

function poly(sy: (y: number) => number, fn: (x: number) => number) {
  const pts: string[] = []
  const n = 160
  for (let i = 0; i <= n; i++) {
    const x = XMIN + ((XMAX - XMIN) * i) / n
    pts.push(`${sx(x).toFixed(1)},${sy(fn(x)).toFixed(1)}`)
  }
  return pts.join(' ')
}
const sCurve = computed(() => poly(syTop, sigmoid))
const dCurve = computed(() => poly(syBot, dsigmoid))

const fmt = (n: number) => Number(n.toFixed(3)).toString()
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <!-- 위: σ(x) -->
    <p class="mb-1 text-center text-sm font-semibold text-slate-600">
      σ(x) = 1 / (1 + e<sup>−x</sup>) · 현재 σ({{ fmt(x0) }}) = <b class="text-indigo-600">{{ fmt(s) }}</b>
    </p>
    <div class="flex justify-center">
      <svg :viewBox="`0 0 ${width} ${topH}`" :width="width" :height="topH"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50">
        <!-- 0, 0.5, 1 안내선 -->
        <g stroke="#e2e8f0" stroke-width="1">
          <line :x1="0" :y1="syTop(0)" :x2="width" :y2="syTop(0)" />
          <line :x1="0" :y1="syTop(1)" :x2="width" :y2="syTop(1)" />
        </g>
        <line :x1="0" :y1="syTop(0.5)" :x2="width" :y2="syTop(0.5)" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3 3" />
        <line :x1="sx(0)" :y1="0" :x2="sx(0)" :y2="topH" stroke="#e2e8f0" stroke-width="1" />
        <line :x1="sx(x0)" :y1="0" :x2="sx(x0)" :y2="topH" stroke="#c7d2fe" stroke-width="1.5" stroke-dasharray="4 3" />
        <polyline :points="sCurve" fill="none" stroke="#6366f1" stroke-width="2.5" />
        <circle :cx="sx(x0)" :cy="syTop(s)" r="5.5" fill="#fff" stroke="#6366f1" stroke-width="3" />
      </svg>
    </div>

    <div class="my-1 text-center text-xs text-slate-400">↕ 기울기 = 아래 종 모양의 높이</div>

    <!-- 아래: σ'(x) -->
    <p class="mb-1 text-center text-sm font-semibold text-slate-600">
      σ′(x) = σ(1−σ) · 현재 σ′({{ fmt(x0) }}) = <b class="text-rose-600">{{ fmt(ds) }}</b>
    </p>
    <div class="flex justify-center">
      <svg :viewBox="`0 0 ${width} ${botH}`" :width="width" :height="botH"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50">
        <g stroke="#e2e8f0" stroke-width="1">
          <line :x1="0" :y1="syBot(0)" :x2="width" :y2="syBot(0)" />
        </g>
        <!-- 최댓값 0.25 안내선 -->
        <line :x1="0" :y1="syBot(0.25)" :x2="width" :y2="syBot(0.25)" stroke="#fca5a5" stroke-width="1" stroke-dasharray="3 3" />
        <text :x="width - 4" :y="syBot(0.25) - 3" text-anchor="end" font-size="9" fill="#ef4444">최대 0.25</text>
        <line :x1="sx(x0)" :y1="0" :x2="sx(x0)" :y2="botH" stroke="#c7d2fe" stroke-width="1.5" stroke-dasharray="4 3" />
        <polyline :points="dCurve" fill="none" stroke="#ef4444" stroke-width="2.5" />
        <circle :cx="sx(x0)" :cy="syBot(ds)" r="5.5" fill="#fff" stroke="#ef4444" stroke-width="3" />
      </svg>
    </div>

    <!-- 슬라이더 -->
    <div class="mt-4 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-24 shrink-0 text-slate-500">입력 x =
          <b class="text-slate-800">{{ fmt(x0) }}</b></span>
        <input v-model.number="x0" type="range" :min="XMIN" :max="XMAX" step="0.1" class="flex-1 accent-indigo-500" />
      </label>
    </div>

    <!-- 읽기 -->
    <div class="mt-3 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-indigo-50 px-3 py-1.5 text-indigo-700">σ = <b>{{ fmt(s) }}</b></span>
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">1 − σ = <b>{{ fmt(1 - s) }}</b></span>
      <span class="rounded-lg bg-rose-50 px-3 py-1.5 text-rose-700">σ′ = σ(1−σ) = <b>{{ fmt(ds) }}</b></span>
    </div>
    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      기울기 <b>σ′</b> 는 <b>x=0 에서 최대(0.25)</b> 이고, 양 끝(아주 큰/작은 x)으로 갈수록
      <b>0 에 가까워집니다</b>. 이렇게 기울기가 작아지면 학습 신호가 약해지는데, 이것이 딥러닝의
      <b>기울기 소실(vanishing gradient)</b> 문제예요.
    </p>
  </div>
</template>
