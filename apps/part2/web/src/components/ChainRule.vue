<script setup lang="ts">
// Phase 6 전용 인터랙티브 — 연쇄법칙을 '기계 사슬'로 이해한다.
//   x  --[속함수 g]-->  u = g(x)  --[겉함수 f]-->  y = f(u)
// 각 화살표에 국소 변화율(du/dx = g'(x), dy/du = f'(u))이 붙고, 전체 변화율 dy/dx 는
// 그 둘의 '곱'이다: dy/dx = f'(u)·g'(x). x 를 Δ 만큼 살짝 밀어(nudge) 변화가 사슬을 타고
// 증폭되는 것도 보여준다. (역전파에서 기울기가 층층이 곱해지는 것과 같은 그림)
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    inner: (x: number) => number
    dInner: (x: number) => number
    outer: (u: number) => number
    dOuter: (u: number) => number
    innerLabel?: string
    outerLabel?: string
    xmin?: number
    xmax?: number
    initialX?: number
  }>(),
  { innerLabel: 'g(x)', outerLabel: 'f(u)', xmin: -1, xmax: 3, initialX: 1 },
)

const x0 = ref(props.initialX)
const dx = ref(0.3)

const u = computed(() => props.inner(x0.value))
const y = computed(() => props.outer(u.value))
const gp = computed(() => props.dInner(x0.value)) // du/dx = g'(x)
const fp = computed(() => props.dOuter(u.value)) // dy/du = f'(u)
const total = computed(() => fp.value * gp.value) // dy/dx

// nudge: x 를 Δ 만큼
const u2 = computed(() => props.inner(x0.value + dx.value))
const y2 = computed(() => props.outer(u2.value))
const dU = computed(() => u2.value - u.value)
const dY = computed(() => y2.value - y.value)
const approx = computed(() => dY.value / dx.value)

const fmt = (n: number) => Number(n.toFixed(2)).toString()
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <!-- 기계 사슬 -->
    <div class="flex flex-wrap items-center justify-center gap-2 text-center">
      <div class="rounded-lg bg-slate-100 px-3 py-2">
        <div class="text-xs text-slate-600">입력</div>
        <div class="font-mono text-lg font-bold text-slate-800">x = {{ fmt(x0) }}</div>
      </div>

      <div class="flex flex-col items-center">
        <div class="text-xs font-medium text-emerald-700">×{{ fmt(gp) }} (속미분 g′)</div>
        <div class="text-2xl leading-none text-slate-500">→</div>
      </div>

      <div class="rounded-lg bg-emerald-50 px-3 py-2">
        <div class="text-xs text-emerald-700">{{ innerLabel }}</div>
        <div class="font-mono text-lg font-bold text-emerald-700">u = {{ fmt(u) }}</div>
      </div>

      <div class="flex flex-col items-center">
        <div class="text-xs font-medium text-rose-700">×{{ fmt(fp) }} (겉미분 f′)</div>
        <div class="text-2xl leading-none text-slate-500">→</div>
      </div>

      <div class="rounded-lg bg-rose-50 px-3 py-2">
        <div class="text-xs text-rose-700">{{ outerLabel }}</div>
        <div class="font-mono text-lg font-bold text-rose-700">y = {{ fmt(y) }}</div>
      </div>
    </div>

    <!-- 전체 변화율 = 곱 -->
    <div class="my-3 rounded-lg bg-slate-800 py-2.5 text-center text-white">
      <span class="text-sm">dy/dx = f′(u) × g′(x) = </span>
      <b class="text-rose-300">{{ fmt(fp) }}</b>
      <span class="text-sm"> × </span>
      <b class="text-emerald-300">{{ fmt(gp) }}</b>
      <span class="text-sm"> = </span>
      <b class="text-lg">{{ fmt(total) }}</b>
    </div>

    <!-- 슬라이더 -->
    <div class="px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-24 shrink-0 text-slate-500">입력 x =
          <b class="text-slate-800">{{ fmt(x0) }}</b></span>
        <input v-model.number="x0" type="range" :min="xmin" :max="xmax" step="0.05" class="flex-1 accent-indigo-500" />
      </label>
      <label class="mt-2 flex items-center gap-3 text-sm">
        <span class="w-24 shrink-0 text-slate-500">밀기 Δ =
          <b class="text-slate-800">{{ fmt(dx) }}</b></span>
        <input v-model.number="dx" type="range" min="0.05" max="1" step="0.05" class="flex-1 accent-rose-500" />
      </label>
    </div>

    <!-- nudge 읽기 -->
    <div class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-600">
      x 를 <b>Δ = {{ fmt(dx) }}</b> 만큼 밀면:
      Δx = {{ fmt(dx) }}
      <span class="text-emerald-700">→ Δu = {{ fmt(dU) }}</span>
      <span class="text-rose-700">→ Δy = {{ fmt(dY) }}</span>.
      실제 <b>Δy/Δx ≈ {{ fmt(approx) }}</b>. Δ 를 줄이면 위 <b>dy/dx = {{ fmt(total) }}</b> 로 수렴합니다.
    </div>
    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      변화가 사슬을 타고 흐를 때, 각 단계의 <b>변화율이 곱해집니다</b>.
      "u 가 x 보다 {{ fmt(gp) }}배 빠르고, y 가 u 보다 {{ fmt(fp) }}배 빠르면,
      y 는 x 보다 {{ fmt(gp) }}×{{ fmt(fp) }} = {{ fmt(total) }}배 빠르다." 이게 연쇄법칙이에요.
    </p>
  </div>
</template>
