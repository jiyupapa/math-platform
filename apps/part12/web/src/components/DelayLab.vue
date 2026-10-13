<script setup lang="ts">
// 6장 실험실 — ① 샤워기: 배관 지연 D 와 손잡이 조정 시간 τ. 균형 루프 + 지연 = 과잉 교정과 출렁임.
//              기본 D = 2초, τ = 2초 → 목표 38°C 인데 최고 47.05°C. (sim.ts showerRun·showerPeak)
//              ② EMA = 1차 정보 지연: β 가 클수록 흔들림은 줄고 늦게 따라온다(평균 지연 ≈ 1/(1 − β) 걸음).
// 완전 결정적. 노트북 ch06_delay.ipynb 와 동일.
import { computed, ref } from 'vue'
import TimePlot from './TimePlot.vue'
import CldDiagram from './CldDiagram.vue'
import { SHOWER, showerRun, showerPeak, emaInput, emaRun, EMA_N } from '@/data/sim'

// ── ① 샤워기 ───────────────────────────────────────────────
const D = ref(2)
const tau = ref(2)
const run = computed(() => showerRun(D.value, tau.value))
const peak = computed(() => showerPeak(D.value, tau.value))
const ratio = computed(() => D.value / tau.value)
const lateAmp = computed(() => {
  const H = run.value.H
  const tail = H.slice(H.length - 100) // 마지막 10초
  return Math.max(...tail.map((h) => Math.abs(h - SHOWER.G)))
})
const verdict = computed(() => {
  if (peak.value.v <= SHOWER.G + 0.01)
    return { tone: 'text-emerald-700', text: '넘치지 않고 목표에 다가갑니다. 지연이 조정 시간에 비해 짧아서 늦게 와도 문제가 없어요.' }
  if (lateAmp.value < 1)
    return {
      tone: 'text-amber-700',
      text: `과잉 교정: 목표 38°C를 넘어 최고 ${peak.value.v.toFixed(1)}°C까지 갔다가, 출렁이며 가라앉습니다.`,
    }
  if (peak.value.v < SHOWER.hi - 0.01)
    return {
      tone: 'text-rose-700',
      text: `최고 ${peak.value.v.toFixed(1)}°C. 60초가 지나도 출렁임이 ±${lateAmp.value.toFixed(1)}°C나 남아 아주 느리게 가라앉아요.`,
    }
  return {
    tone: 'text-rose-700',
    text: '출렁임이 점점 커져 손잡이를 끝(60°C)에서 끝(10°C)으로 돌리게 됩니다. 지연이 조정 시간보다 너무 길어요.',
  }
})
const showerSeries = computed(() => [
  { label: '머리에서 느끼는 온도', color: 'var(--c-rose-600)', points: run.value.t.map((t, i) => [t, run.value.H[i]] as [number, number]), width: 2.5 },
])

// ── ② EMA ───────────────────────────────────────────────────
const beta = ref(0.9)
const input = emaInput()
const ema = computed(() => emaRun(beta.value, input))
const lag = computed(() => 1 / (1 - beta.value))
// 흔들림만 따로: 방향 바뀜 없이 지그재그(±0.3, 폭 0.6)만 넣었을 때 EMA 에 남는 폭(마지막 20걸음)
const wiggle = computed(() => {
  const tail = emaRun(beta.value, emaInput(true, false)).slice(EMA_N - 20)
  return Math.max(...tail) - Math.min(...tail)
})
const emaSeries = computed(() => [
  { label: '그때그때의 기울기(입력)', color: 'var(--c-slate-400)', values: input, width: 1.5 },
  { label: `EMA (β = ${beta.value.toFixed(2)})`, color: 'var(--c-violet-600)', values: ema.value, width: 3 },
])
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① · 낯선 호텔 샤워기, 38°C 맞추기</p>
    <p class="mb-3 text-xs text-slate-500">
      처음 물은 20°C. 손잡이를 돌리면 온도가 바뀌지만, 물이 배관을 지나 머리에 닿기까지 <b>D초</b>가 걸립니다.
      사람은 머리에서 느끼는 온도를 보고 "목표와의 차이 ÷ τ" 속도로 손잡이를 돌려요(τ가 작을수록 조급하게).
    </p>
    <div class="grid items-center gap-3 md:grid-cols-[2fr_3fr]">
      <div class="min-w-0 rounded-lg bg-slate-50 p-2">
        <CldDiagram
          :nodes="[
            { id: 'V', label: '손잡이 온도', x: 80, y: 160, stock: true },
            { id: 'H', label: '느끼는 온도', x: 240, y: 160 },
            { id: 'gap', label: '목표와의 격차', x: 240, y: 40 },
            { id: 'turn', label: '손잡이 돌리기', x: 80, y: 40 },
          ]"
          :links="[
            { from: 'V', to: 'H', sign: '+', delay: true },
            { from: 'H', to: 'gap', sign: '−' },
            { from: 'gap', to: 'turn', sign: '+' },
            { from: 'turn', to: 'V', sign: '+' },
          ]"
          :loops="[{ x: 160, y: 92, type: 'B', label: '온도 맞추기' }]"
          :width="320"
          :height="200"
          aria-label="손잡이 온도가 지연을 거쳐 느끼는 온도가 되고, 격차를 보고 손잡이를 돌리는 균형 루프"
        />
      </div>
      <div class="min-w-0 space-y-2">
        <label class="block text-xs text-slate-500">
          배관 지연 D = <b class="text-slate-700">{{ D }}초</b>
          <input v-model.number="D" type="range" min="0" max="4" step="0.5" class="mt-1 w-full accent-amber-600" />
        </label>
        <label class="block text-xs text-slate-500">
          조정 시간 τ = <b class="text-slate-700">{{ tau }}초</b> (작을수록 조급하게 돌림)
          <input v-model.number="tau" type="range" min="1" max="6" step="0.5" class="mt-1 w-full accent-blue-600" />
        </label>
        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="rounded-lg bg-slate-50 p-2">
            <p class="text-xs text-slate-500">D ÷ τ</p>
            <p class="font-mono text-lg font-bold text-amber-700">{{ ratio.toFixed(2) }}</p>
          </div>
          <div class="rounded-lg bg-slate-50 p-2">
            <p class="text-xs text-slate-500">최고 온도</p>
            <p class="font-mono text-lg font-bold text-rose-700">{{ peak.v.toFixed(1) }}°C</p>
          </div>
        </div>
      </div>
    </div>
    <TimePlot
      :series="showerSeries"
      :x-max="60"
      :y-min="0"
      :y-max="65"
      :x-ticks="[0, 10, 20, 30, 40, 50, 60]"
      :hlines="[{ y: SHOWER.G, label: '목표 38°C', color: 'var(--c-blue-600)' }]"
      x-label="초"
      y-label="°C"
      :height="220"
      :legend="false"
      aria-label="머리에서 느끼는 샤워 온도 그래프"
    />
    <p class="mt-2 rounded-lg bg-slate-50 p-3 text-sm font-medium" :class="verdict.tone">{{ verdict.text }}</p>

    <!-- ② -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② · EMA: 늦게 보는 대신 덜 흔들리는 눈</p>
    <p class="mb-2 text-xs text-slate-500">
      학습 중 매 걸음의 기울기를 흉내 낸 신호입니다. 20번째 걸음에 방향이 0에서 1로 바뀌고, 매 걸음 ±0.3씩 지그재그로 흔들려요.
      EMA는 "보이는 값 ← β × 보이는 값 + (1 − β) × 새 값"으로 따라갑니다.
    </p>
    <label class="block text-xs text-slate-500">
      β(베타) = <b class="text-slate-700">{{ beta.toFixed(2) }}</b> → 평균 지연 약 <b class="text-slate-700">{{ lag.toFixed(0) }}걸음</b>
      <input v-model.number="beta" type="range" min="0.5" max="0.99" step="0.01" class="mt-1 w-full accent-violet-600" />
    </label>
    <TimePlot
      :series="emaSeries"
      :x-max="EMA_N - 1"
      :y-min="-0.5"
      :y-max="1.5"
      :x-ticks="[0, 20, 40, 60, 80, 99]"
      :markers="[{ x: 20, label: '방향 바뀜', color: 'var(--c-slate-500)' }, { x: Math.min(EMA_N - 1, 20 + lag), label: '+ 평균 지연', color: 'var(--c-violet-600)' }]"
      x-label="걸음"
      :height="220"
      aria-label="흔들리는 입력과 EMA 그래프"
    />
    <div class="mt-2 grid grid-cols-2 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-xs text-slate-500">지그재그 폭 0.6이 EMA를 지나 남은 폭</p>
        <p class="font-mono text-lg font-bold text-violet-700">{{ wiggle.toFixed(3) }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-xs text-slate-500">방향이 바뀌고 10걸음 뒤 따라온 정도</p>
        <p class="font-mono text-lg font-bold text-violet-700">{{ (emaRun(beta, emaInput(false))[29] * 100).toFixed(0) }}%</p>
      </div>
    </div>
    <p class="mt-2 text-xs text-slate-600">
      β를 올리면 흔들림은 줄지만 새 방향을 늦게 알아챕니다. 덜 흔들리는 눈과 빨리 알아채는 눈은 맞바꿔야 해요.
    </p>
  </div>
</template>
