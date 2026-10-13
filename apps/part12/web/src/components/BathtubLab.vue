<script setup lang="ts">
// 워밍업 실험실 — 욕조 문제. 월별 신규 가입(유입)과 이탈(유출) 그래프만 보고
// 사용자 수(저량)가 가장 많은 달을 먼저 맞힌 뒤, 저량 곡선과 욕조 그림으로 확인한다.
// 완전 결정적: 사용자 수 = 누적(가입 − 이탈). 8월 600명이 정점(노트북 ch00_sample.ipynb 와 동일).
import { computed, ref } from 'vue'
import TimePlot from './TimePlot.vue'
import { WARM_IN, WARM_OUT, warmStock } from '@/data/sim'

const MONTHS = WARM_IN.map((_, i) => i + 1)
const stock = warmStock()
const PEAK_MONTH = stock.indexOf(Math.max(...stock)) + 1 // 8

const guess = ref<number | null>(null)
const revealed = computed(() => guess.value !== null)
const month = ref(5)

const flowSeries = computed(() => [
  { label: '신규 가입(유입)', color: 'var(--c-indigo-500)', values: WARM_IN, x0: 1, dots: true },
  { label: '이탈(유출)', color: 'var(--c-rose-500)', values: WARM_OUT, x0: 1, dots: true },
])
const stockSeries = computed(() => [
  { label: '사용자 수(저량)', color: 'var(--c-emerald-600)', values: [0, ...stock], x0: 0, dots: true, width: 3 },
])

// 욕조 그림 — 고른 달의 끝 시점
const sNow = computed(() => (month.value === 0 ? 0 : stock[month.value - 1]))
const inNow = computed(() => (month.value === 0 ? 0 : WARM_IN[month.value - 1]))
const outNow = computed(() => (month.value === 0 ? 0 : WARM_OUT[month.value - 1]))
const level = computed(() => sNow.value / 700)
const trend = computed(() => {
  const net = inNow.value - outNow.value
  if (month.value === 0) return { text: '아직 아무도 없어요. 수도꼭지를 열면 시작입니다.', tone: 'text-slate-600' }
  if (net > 0) return { text: `유입 ${inNow.value} > 유출 ${outNow.value}: 물이 ${net}만큼 차오르는 중`, tone: 'text-emerald-700' }
  if (net < 0) return { text: `유입 ${inNow.value} < 유출 ${outNow.value}: 물이 ${-net}만큼 빠지는 중`, tone: 'text-rose-700' }
  return { text: '유입 = 유출: 물 높이가 멈춘 순간', tone: 'text-amber-700' }
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 예측 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① · 그래프 두 줄만 보고 맞혀 보세요</p>
    <p class="mb-2 text-xs text-slate-500">
      가상 회사의 사내 AI 도구, 첫 1년의 월별 신규 가입자와 이탈자입니다(처음 사용자는 0명).
      <b>사용자 수가 가장 많았던 달</b>은 언제일까요?
    </p>
    <TimePlot
      :series="flowSeries"
      :x-min="0.5"
      :x-max="12.5"
      :y-min="0"
      :y-max="180"
      :x-ticks="MONTHS"
      x-label="월"
      y-label="명/월"
      :height="210"
      aria-label="월별 신규 가입과 이탈 그래프"
    />
    <div class="mt-2 flex flex-wrap gap-1.5">
      <button
        v-for="m in MONTHS"
        :key="m"
        type="button"
        class="min-w-11 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition"
        :class="
          guess === m
            ? m === PEAK_MONTH
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
            : revealed && m === PEAK_MONTH
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        "
        @click="guess = m"
      >
        {{ m }}월
      </button>
    </div>

    <!-- ② 공개 -->
    <template v-if="revealed">
      <p
        class="mt-3 rounded-lg p-3 text-sm leading-relaxed"
        :class="guess === PEAK_MONTH ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'"
      >
        <template v-if="guess === PEAK_MONTH">✅ 정답, <b>8월</b>입니다. 가입이 5월에 꺾였는데도 석 달을 더 늘었어요.</template>
        <template v-else-if="guess === 5">
          🤔 많은 사람이 이렇게 답합니다. 가입이 가장 많은 5월이 정점일 것 같죠. 정답은 <b>8월</b>입니다.
          5월 뒤로 가입은 줄었지만 8월까지는 여전히 이탈보다 많아서, 사용자는 계속 늘었어요.
        </template>
        <template v-else>
          정답은 <b>8월</b>입니다. 8월까지는 가입이 이탈보다 많고(90 &gt; 70), 9월부터 처음으로 적어집니다(60 &lt; 75).
        </template>
      </p>
      <p class="mt-4 mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② · 사용자 수(저량) 곡선 공개</p>
      <TimePlot
        :series="stockSeries"
        :x-min="0"
        :x-max="12.5"
        :y-min="0"
        :y-max="700"
        :x-ticks="[0, ...MONTHS]"
        :markers="[
          { x: 5, label: '가입 정점(5월)', color: 'var(--c-indigo-500)' },
          { x: 8, label: '사용자 정점(8월, 600명)', color: 'var(--c-emerald-600)' },
        ]"
        x-label="월"
        y-label="명"
        :height="210"
        aria-label="월말 사용자 수 그래프"
      />

      <!-- ③ 욕조 -->
      <p class="mt-4 mb-1 text-sm font-semibold text-slate-700">🛁 실험 ③ · 욕조로 보기: 달을 옮겨 보세요</p>
      <label class="block text-xs text-slate-500">
        {{ month === 0 ? '시작 전' : `${month}월 말` }}
        <input v-model.number="month" type="range" min="0" max="12" step="1" class="mt-1 w-full accent-indigo-600" />
      </label>
      <div class="mt-2 grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <svg viewBox="0 0 320 200" class="mx-auto h-auto w-full max-w-sm" role="img" aria-label="욕조 그림: 수도꼭지, 물 높이, 배수구">
          <!-- 수도꼭지와 물줄기(굵기 = 유입) -->
          <path d="M40,20 h60 v14 h-14" fill="none" stroke="var(--c-slate-500)" stroke-width="8" stroke-linejoin="round" />
          <rect
            :x="86 - (inNow / 160) * 7"
            y="40"
            :width="Math.max(0.5, (inNow / 160) * 14)"
            :height="Math.max(0, 150 - 130 * level)"
            fill="var(--c-sky-500)"
            opacity="0.75"
          />
          <!-- 욕조 -->
          <path d="M60,60 v100 q0,30 30,30 h140 q30,0 30,-30 v-100" fill="none" stroke="var(--c-slate-600)" stroke-width="3" />
          <clipPath id="tub-clip">
            <path d="M60,60 v100 q0,30 30,30 h140 q30,0 30,-30 v-100 z" />
          </clipPath>
          <rect x="60" :y="190 - 130 * level" width="200" :height="130 * level" fill="var(--c-sky-500)" opacity="0.35" clip-path="url(#tub-clip)" />
          <!-- 배수구와 물줄기(굵기 = 유출) -->
          <rect x="226" y="190" width="10" height="6" fill="var(--c-slate-600)" />
          <rect :x="231 - (outNow / 160) * 7" y="196" :width="Math.max(0.5, (outNow / 160) * 14)" height="4" fill="var(--c-sky-500)" opacity="0.75" />
          <text x="160" :y="Math.min(180, 186 - 130 * level)" text-anchor="middle" font-size="14" font-weight="700" fill="var(--c-slate-800)">
            {{ sNow }}명
          </text>
        </svg>
        <div class="space-y-1.5 text-sm">
          <p><span class="inline-block w-28 text-slate-500">유입(신규 가입)</span><b class="font-mono text-indigo-700">{{ inNow }}명/월</b></p>
          <p><span class="inline-block w-28 text-slate-500">유출(이탈)</span><b class="font-mono text-rose-700">{{ outNow }}명/월</b></p>
          <p><span class="inline-block w-28 text-slate-500">저량(사용자 수)</span><b class="font-mono text-emerald-700">{{ sNow }}명</b></p>
        </div>
      </div>
      <p class="mt-2 rounded-lg bg-slate-50 p-3 text-sm font-medium" :class="trend.tone">{{ trend.text }}</p>
    </template>
    <p v-else class="mt-3 text-xs text-slate-500">달을 하나 고르면 사용자 수 곡선과 욕조 그림이 열립니다.</p>
  </div>
</template>
