<script setup lang="ts">
// 4장 실험실 — 균형 루프 두 얼굴: ① 온도 조절기(연속): 데우는 속도 = (목표 − 지금)/τ → 지수 감쇠, τ 뒤 63%.
// ② 경사하강(걸음): θ ← θ − η·λ·(θ − θ*) → 매 걸음 격차 × (1 − ηλ). 같은 균형 루프 구조.
// 완전 결정적. 노트북 ch04_balancing.ipynb 와 동일(12°C → 22°C, τ = 10분이면 10분 뒤 18.3°C).
import { computed, ref } from 'vue'
import TimePlot from './TimePlot.vue'
import CldDiagram from './CldDiagram.vue'

const tab = ref<'thermo' | 'gd'>('thermo')

// ── ① 온도 조절기 ─────────────────────────────────────────────
const T0 = 12
const goal = ref(22)
const tau = ref(10)
const temp = (t: number) => goal.value - (goal.value - T0) * Math.exp(-t / tau.value)
const tempSeries = computed(() => [
  {
    label: '실내 온도',
    color: 'var(--c-rose-600)',
    points: Array.from({ length: 121 }, (_, i) => [i * 0.5, temp(i * 0.5)] as [number, number]),
    width: 3,
  },
])
const tempMarkers = computed(() =>
  [1, 2, 3]
    .map((k) => ({ x: k * tau.value, label: `${k}τ: ${[63, 86, 95][k - 1]}%`, color: 'var(--c-blue-600)' }))
    .filter((m) => m.x <= 60),
)

// ── ② 경사하강 ───────────────────────────────────────────────
const LAMBDA = 2 // 곡률 (8부 2장 워밍업의 골짜기)
const TARGET = 3 // 최저점 θ*
const THETA0 = -5 // 출발 (격차 8)
const eta = ref(0.1)
const factor = computed(() => 1 - eta.value * LAMBDA)
const steps = computed(() => Array.from({ length: 16 }, (_, k) => TARGET + (THETA0 - TARGET) * Math.pow(factor.value, k)))
const halfSteps = computed(() => Math.log(0.5) / Math.log(factor.value))
const gdSeries = computed(() => [
  { label: '가중치 θ', color: 'var(--c-indigo-600)', values: steps.value, dots: true, width: 2.5 },
])
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 · 같은 고리, 두 얼굴</p>
    <div class="mb-3 flex flex-wrap gap-1.5">
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 text-sm font-semibold transition"
        :class="tab === 'thermo' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
        @click="tab = 'thermo'"
      >
        🌡️ 온도 조절기
      </button>
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 text-sm font-semibold transition"
        :class="tab === 'gd' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
        @click="tab = 'gd'"
      >
        📉 경사하강
      </button>
    </div>

    <!-- ① 온도 조절기 -->
    <template v-if="tab === 'thermo'">
      <p class="mb-2 text-xs text-slate-500">
        12°C인 회의실을 데웁니다. 난방기는 <b>목표와의 차이에 비례해</b> 데워요: 데우는 속도 = (목표 − 지금 온도) ÷ τ.
      </p>
      <div class="grid items-center gap-3 md:grid-cols-[2fr_3fr]">
        <div class="min-w-0 rounded-lg bg-slate-50 p-2">
          <CldDiagram
            :nodes="[
              { id: 'T', label: '실내 온도', x: 70, y: 150, stock: true },
              { id: 'gap', label: '목표와의 격차', x: 220, y: 150 },
              { id: 'heat', label: '데우는 속도', x: 145, y: 36 },
            ]"
            :links="[
              { from: 'T', to: 'gap', sign: '−', bend: 0.0 },
              { from: 'gap', to: 'heat', sign: '+', bend: 0.25 },
              { from: 'heat', to: 'T', sign: '+', bend: 0.25 },
            ]"
            :loops="[{ x: 145, y: 96, type: 'B', label: '온도 맞추기' }]"
            :width="300"
            :height="185"
            aria-label="실내 온도가 오르면 격차가 줄고, 격차가 줄면 데우는 속도가 줄어드는 균형 루프"
          />
        </div>
        <div class="min-w-0 space-y-2">
          <label class="block text-xs text-slate-500">
            목표 온도 = <b class="text-slate-700">{{ goal }}°C</b>
            <input v-model.number="goal" type="range" min="18" max="26" step="1" class="mt-1 w-full accent-rose-600" />
          </label>
          <label class="block text-xs text-slate-500">
            조정 시간 τ(타우) = <b class="text-slate-700">{{ tau }}분</b> (클수록 느긋하게 데움)
            <input v-model.number="tau" type="range" min="2" max="30" step="1" class="mt-1 w-full accent-blue-600" />
          </label>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="rounded-lg bg-slate-50 p-2">
              <p class="text-xs text-slate-500">τ = {{ tau }}분 뒤</p>
              <p class="font-mono font-bold text-rose-700">{{ temp(tau).toFixed(1) }}°C</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-2">
              <p class="text-xs text-slate-500">2τ 뒤</p>
              <p class="font-mono font-bold text-rose-700">{{ temp(2 * tau).toFixed(1) }}°C</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-2">
              <p class="text-xs text-slate-500">3τ 뒤</p>
              <p class="font-mono font-bold text-rose-700">{{ temp(3 * tau).toFixed(1) }}°C</p>
            </div>
          </div>
        </div>
      </div>
      <TimePlot
        :series="tempSeries"
        :x-max="60"
        :y-min="10"
        :y-max="28"
        :x-ticks="[0, 10, 20, 30, 40, 50, 60]"
        :hlines="[{ y: goal, label: `목표 ${goal}°C`, color: 'var(--c-blue-600)' }]"
        :markers="tempMarkers"
        x-label="분"
        y-label="°C"
        :height="220"
        :legend="false"
        aria-label="실내 온도가 목표로 다가가는 그래프"
      />
      <p class="mt-2 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
        τ분마다 <b>남은 격차의 같은 비율</b>이 메워집니다. τ 뒤 처음 격차의 <b>63%</b>, 2τ 뒤 86%, 3τ 뒤 95%.
        목표에 가까울수록 격차가 작아 데우는 속도도 줄어서, 목표에 점점 느리게 다가가요(지수 감쇠).
      </p>
    </template>

    <!-- ② 경사하강 -->
    <template v-else>
      <p class="mb-2 text-xs text-slate-500">
        손실 곡선 L(θ) = (λ/2)(θ − θ*)² 위에서 경사하강을 합니다. 곡률 λ = {{ LAMBDA }}, 최저점 θ* = {{ TARGET }}, 출발 θ = {{ THETA0 }}(격차 8).
        한 걸음: θ ← θ − 학습률 × 기울기, 기울기 = λ(θ − θ*).
      </p>
      <div class="grid items-center gap-3 md:grid-cols-[2fr_3fr]">
        <div class="min-w-0 rounded-lg bg-slate-50 p-2">
          <CldDiagram
            :nodes="[
              { id: 'w', label: '가중치 θ', x: 70, y: 150, stock: true },
              { id: 'gap', label: '최저점과의 격차', x: 222, y: 150 },
              { id: 'step', label: '한 걸음의 크기', x: 145, y: 36 },
            ]"
            :links="[
              { from: 'w', to: 'gap', sign: '−', bend: 0.0 },
              { from: 'gap', to: 'step', sign: '+', bend: 0.25 },
              { from: 'step', to: 'w', sign: '+', bend: 0.25 },
            ]"
            :loops="[{ x: 145, y: 96, type: 'B', label: '손실 줄이기' }]"
            :width="300"
            :height="185"
            aria-label="가중치가 최저점에 다가가면 격차가 줄고 걸음이 작아지는 균형 루프"
          />
        </div>
        <div class="min-w-0 space-y-2">
          <label class="block text-xs text-slate-500">
            학습률 η(에타) = <b class="text-slate-700">{{ eta.toFixed(2) }}</b> (0.5보다 크게는 5장에서)
            <input v-model.number="eta" type="range" min="0.02" max="0.48" step="0.02" class="mt-1 w-full accent-indigo-600" />
          </label>
          <div class="grid grid-cols-2 gap-2 text-center">
            <div class="rounded-lg bg-slate-50 p-2">
              <p class="text-xs text-slate-500">매 걸음 격차 × (1 − ηλ)</p>
              <p class="font-mono text-lg font-bold text-indigo-700">× {{ factor.toFixed(2) }}</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-2">
              <p class="text-xs text-slate-500">격차가 반이 되는 걸음</p>
              <p class="font-mono text-lg font-bold text-indigo-700">{{ halfSteps.toFixed(1) }}걸음</p>
            </div>
          </div>
        </div>
      </div>
      <TimePlot
        :series="gdSeries"
        :x-max="15"
        :y-min="-6"
        :y-max="5"
        :x-ticks="[0, 3, 6, 9, 12, 15]"
        :hlines="[{ y: TARGET, label: '최저점 θ* = 3', color: 'var(--c-blue-600)' }]"
        x-label="걸음"
        y-label="θ"
        :height="220"
        :legend="false"
        aria-label="가중치가 걸음마다 최저점으로 다가가는 그래프"
      />
      <p class="mt-2 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
        경사하강도 <b>격차의 같은 비율</b>을 매 걸음 메웁니다. 그 비율이 학습률 × 곡률(ηλ = {{ (eta * LAMBDA).toFixed(2) }})이에요.
        온도 조절기의 1/τ 자리에 ηλ가 들어간 것뿐, 인과지도도 곡선 모양도 같습니다.
      </p>
    </template>
  </div>
</template>
