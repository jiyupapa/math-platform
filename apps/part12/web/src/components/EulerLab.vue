<script setup lang="ts">
// 5장 실험실 — 오일러법: 저량(다음) = 저량(지금) + 순유량 × DT.
// 균형 루프 dS/dt = −S/τ (τ = 4개월, 처음 격차 100)를 간격 DT 로 계산해 정확한 답과 겹쳐 본다.
// 한 걸음마다 × (1 − DT/τ): DT < τ 매끄럽게, τ < DT < 2τ 출렁이며 수렴, DT = 2τ 영원히 출렁, DT > 2τ 발산.
// 같은 식을 경사하강으로 읽으면 학습률 η = DT, 곡률 λ = 1/τ. 노트북 ch05_euler.ipynb 와 동일.
import { computed, ref } from 'vue'
import TimePlot from './TimePlot.vue'

const TAU = 4
const S0 = 100
const T_END = 40
const DTS = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const idx = ref(2) // DT = 2
const dt = computed(() => DTS[idx.value])
const ratio = computed(() => dt.value / TAU)
const factor = computed(() => 1 - ratio.value)

const euler = computed(() => {
  const pts: [number, number][] = [[0, S0]]
  let s = S0
  for (let t = dt.value; t <= T_END + 1e-9; t += dt.value) {
    s = s + (-s / TAU) * dt.value
    pts.push([t, s])
  }
  return pts
})
const exact = Array.from({ length: 161 }, (_, i) => [i * 0.25, S0 * Math.exp(-(i * 0.25) / TAU)] as [number, number])

const series = computed(() => [
  { label: '정확한 답 100·e^(−t/τ)', color: 'var(--c-slate-500)', points: exact, dashed: true, width: 2 },
  { label: `오일러법 (DT = ${dt.value}개월)`, color: 'var(--c-indigo-600)', points: euler.value, dots: true, width: 2.5 },
])

const verdict = computed(() => {
  const r = ratio.value
  if (r < 1 - 1e-9) return { tone: 'text-emerald-700', text: `매끄럽게 줄어듭니다. 한 걸음마다 × ${factor.value.toFixed(3)} (정확한 답보다 조금 빨리 줄어요).` }
  if (Math.abs(r - 1) < 1e-9) return { tone: 'text-emerald-700', text: '한 걸음에 격차가 0이 됩니다(× 0). 정확한 답과는 다르지만 목표에는 닿아요.' }
  if (r < 2 - 1e-9) return { tone: 'text-amber-700', text: `가짜 출렁임: 한 걸음마다 × ${factor.value.toFixed(2)}, 부호가 번갈아 바뀌지만 줄어들긴 합니다. 진짜 시스템은 출렁이지 않아요.` }
  if (Math.abs(r - 2) < 1e-9) return { tone: 'text-rose-700', text: '경계: 한 걸음마다 × (−1), 같은 크기로 영원히 출렁입니다.' }
  return { tone: 'text-rose-700', text: `발산: 한 걸음마다 × ${factor.value.toFixed(2)}, 출렁이며 점점 커집니다. 계산이 터졌어요.` }
})

// 오차 표: t = 8(= 2τ)에서 DT 를 반씩 줄이면
const EXACT8 = S0 * Math.exp(-8 / TAU)
const errRows = [2, 1, 0.5, 0.25, 0.125].map((d) => {
  const v = S0 * Math.pow(1 - d / TAU, 8 / d)
  return { d, v, err: Math.abs(v - EXACT8) }
})
// 같은 식, 다른 이름: 곡률 2인 골짜기의 학습률
const LAMBDA = 2
const etaEq = computed(() => ratio.value / LAMBDA)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① · 시간 간격 DT를 바꿔 같은 미래를 계산해 보세요</p>
    <p class="mb-3 text-xs text-slate-500">
      균형 루프 하나: 격차가 100에서 시작해 "격차의 변화율 = −격차 ÷ τ", τ = {{ TAU }}개월. 정확한 답(점선)은 매끄럽게 0으로 갑니다.
      컴퓨터는 이걸 "지금 격차 + 지금 변화율 × DT"를 반복해서 계산해요.
    </p>
    <label class="block text-xs text-slate-500">
      시간 간격 DT = <b class="text-slate-700">{{ dt }}개월</b> (DT/τ = <b class="text-slate-700">{{ ratio.toFixed(2) }}</b>)
      <input v-model.number="idx" type="range" min="0" :max="DTS.length - 1" step="1" class="mt-1 w-full accent-indigo-600" />
    </label>
    <!-- 눈금 글자: 슬라이더 칸(0~10번)의 실제 위치에 맞춘다 — τ = 4는 4번 칸, 2τ = 8은 8번 칸 -->
    <div class="relative mt-1 h-4 text-[11px] text-slate-500">
      <span class="absolute left-0">DT 작게</span>
      <span class="absolute -translate-x-1/2" style="left: 40%">τ = 4</span>
      <span class="absolute -translate-x-1/2" style="left: 80%">2τ = 8</span>
      <span class="absolute right-0">크게</span>
    </div>
    <TimePlot
      :series="series"
      :x-max="T_END"
      :y-min="-250"
      :y-max="250"
      :x-ticks="[0, 8, 16, 24, 32, 40]"
      :y-ticks="[-200, -100, 0, 100, 200]"
      :hlines="[{ y: 0, color: 'var(--c-slate-400)' }]"
      x-label="개월"
      y-label="격차"
      :height="240"
      aria-label="오일러법 계산과 정확한 답 비교 그래프"
    />
    <p class="mt-2 rounded-lg bg-slate-50 p-3 text-sm font-medium" :class="verdict.tone">{{ verdict.text }}</p>
    <p class="mt-2 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      💡 같은 식, 다른 이름: 이 계산은 곡률 λ = 2인 골짜기에서 <b>학습률 η = {{ etaEq.toFixed(2) }}</b>로 경사하강하는 것과
      똑같습니다(DT/τ = 학습률 × 곡률 = {{ ratio.toFixed(2) }}). 8부 2장에서 학습률 1.0을 넘기면 폭발하던 그 경계가 여기선 DT = 2τ예요.
    </p>

    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② · DT를 반으로 줄이면 오차는?</p>
    <p class="mb-2 text-xs text-slate-500">t = 8개월(= 2τ)에서 정확한 답은 {{ EXACT8.toFixed(2) }}입니다.</p>
    <div class="overflow-x-auto">
      <table class="w-full min-w-[22rem] text-left text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500">
            <th class="py-1.5 pr-3 font-medium">DT</th>
            <th class="py-1.5 pr-3 font-medium">걸음 수</th>
            <th class="py-1.5 pr-3 font-medium">오일러법 값</th>
            <th class="py-1.5 font-medium">오차</th>
          </tr>
        </thead>
        <tbody class="font-mono text-slate-700">
          <tr v-for="r in errRows" :key="r.d" class="border-b border-slate-100">
            <td class="py-1.5 pr-3">{{ r.d }}개월</td>
            <td class="py-1.5 pr-3">{{ 8 / r.d }}</td>
            <td class="py-1.5 pr-3">{{ r.v.toFixed(2) }}</td>
            <td class="py-1.5 font-bold text-rose-700">{{ r.err.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-2 text-xs text-slate-600">
      DT를 반으로 줄일 때마다 오차도 대략 반으로 줄어듭니다. 대신 걸음 수(계산량)는 두 배가 돼요.
    </p>
  </div>
</template>
