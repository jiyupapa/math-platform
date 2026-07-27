<script setup lang="ts">
// Phase 4 전용 인터랙티브 — 베이즈 정리 자연 빈도 그리드.
// 1000명을 작은 사각형으로 그려, 유병률·민감도·위양성률 슬라이더에 따라
// 진양성/위음성/위양성/진음성이 몇 명씩인지 색으로 보여주고
// "검사 양성인 사람 중 실제 병자 비율"(사후확률)을 실시간 계산한다.
import { ref, computed } from 'vue'

const TOTAL = 1000
const COLS = 40
const CELL = 10
const GAP = 1

const prevalence = ref(1) // 유병률 %
const sensitivity = ref(90) // 민감도 % (병자 중 양성)
const falseRate = ref(9) // 위양성률 % (건강한 사람 중 양성)

const sick = computed(() => Math.round((TOTAL * prevalence.value) / 100))
const truePos = computed(() => Math.round((sick.value * sensitivity.value) / 100))
const falseNeg = computed(() => sick.value - truePos.value)
const healthy = computed(() => TOTAL - sick.value)
const falsePos = computed(() => Math.round((healthy.value * falseRate.value) / 100))
const trueNeg = computed(() => healthy.value - falsePos.value)
const positives = computed(() => truePos.value + falsePos.value)
const posterior = computed(() =>
  positives.value === 0 ? 0 : truePos.value / positives.value,
)

const COLOR = {
  tp: 'var(--c-red-600)', // 진양성: 병 있음 + 검사 양성
  fn: 'var(--c-rose-300)', // 위음성: 병 있음 + 검사 음성
  fp: 'var(--c-blue-600)', // 위양성: 병 없음 + 검사 양성
  tn: 'var(--c-slate-200)', // 진음성: 병 없음 + 검사 음성
}

// 셀 색 배열: 진양성 → 위음성 → 위양성 → 진음성 순서로 채운다
const cellColors = computed(() => {
  const arr: string[] = []
  const push = (n: number, color: string) => {
    for (let i = 0; i < n; i++) arr.push(color)
  }
  push(truePos.value, COLOR.tp)
  push(falseNeg.value, COLOR.fn)
  push(falsePos.value, COLOR.fp)
  push(trueNeg.value, COLOR.tn)
  return arr
})

const gridW = COLS * (CELL + GAP) + GAP
const gridH = (TOTAL / COLS) * (CELL + GAP) + GAP
const cellX = (i: number) => GAP + (i % COLS) * (CELL + GAP)
const cellY = (i: number) => GAP + Math.floor(i / COLS) * (CELL + GAP)

const fmt = (n: number) => Number(n.toFixed(1)).toString()
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <!-- 슬라이더 -->
    <div class="space-y-2 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-44 shrink-0 text-slate-500">
          유병률 = <b class="text-slate-800">{{ fmt(prevalence) }}%</b>
        </span>
        <input v-model.number="prevalence" type="range" min="0.1" max="10" step="0.1" class="flex-1 accent-indigo-500" />
      </label>
      <label class="flex items-center gap-3 text-sm">
        <span class="w-44 shrink-0 text-slate-500">
          민감도(병자를 양성 판정) = <b class="text-slate-800">{{ sensitivity }}%</b>
        </span>
        <input v-model.number="sensitivity" type="range" min="50" max="99" step="1" class="flex-1 accent-indigo-500" />
      </label>
      <label class="flex items-center gap-3 text-sm">
        <span class="w-44 shrink-0 text-slate-500">
          위양성률(건강해도 양성) = <b class="text-slate-800">{{ falseRate }}%</b>
        </span>
        <input v-model.number="falseRate" type="range" min="1" max="20" step="1" class="flex-1 accent-indigo-500" />
      </label>
    </div>

    <!-- 범례 -->
    <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-slate-600">
      <span class="flex items-center gap-1.5">
        <span class="inline-block h-3 w-3 rounded-sm" :style="{ background: COLOR.tp }" />
        진양성(병O·양성) <b>{{ truePos }}</b>명
      </span>
      <span class="flex items-center gap-1.5">
        <span class="inline-block h-3 w-3 rounded-sm" :style="{ background: COLOR.fn }" />
        위음성(병O·음성) <b>{{ falseNeg }}</b>명
      </span>
      <span class="flex items-center gap-1.5">
        <span class="inline-block h-3 w-3 rounded-sm" :style="{ background: COLOR.fp }" />
        위양성(병X·양성) <b>{{ falsePos }}</b>명
      </span>
      <span class="flex items-center gap-1.5">
        <span class="inline-block h-3 w-3 rounded-sm border border-slate-300" :style="{ background: COLOR.tn }" />
        진음성(병X·음성) <b>{{ trueNeg }}</b>명
      </span>
    </div>

    <!-- 1000명 그리드 -->
    <div class="mt-3 flex justify-center">
      <svg
        :viewBox="`0 0 ${gridW} ${gridH}`"
        :width="gridW"
        :height="gridH"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50"
      >
        <rect
          v-for="(c, i) in cellColors"
          :key="i"
          :x="cellX(i)"
          :y="cellY(i)"
          :width="CELL"
          :height="CELL"
          :fill="c"
          rx="1.5"
        />
      </svg>
    </div>

    <!-- 사후확률 -->
    <div class="mt-4 rounded-lg bg-indigo-50 p-4 text-center">
      <p class="text-sm text-indigo-900">검사가 <b>양성</b>인 사람 중 <b>실제로 병이 있는</b> 비율 (사후확률)</p>
      <p class="mt-1 text-3xl font-bold text-indigo-700">{{ (posterior * 100).toFixed(1) }}%</p>
      <p class="mt-1 text-xs text-indigo-600">
        = 진양성 {{ truePos }}명 ÷ 양성 전체 ({{ truePos }} + {{ falsePos }}) = {{ positives }}명
      </p>
    </div>

    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      유병률을 낮출수록 <span class="font-semibold text-blue-600">파란 칸(위양성)</span>이
      <span class="font-semibold text-red-600">빨간 칸(진양성)</span>을 압도해서, 검사가 양성이어도
      실제 병일 확률이 낮아집니다. 유병률·민감도·위양성률을 움직이며 사후확률이 어떻게 변하는지 확인해 보세요.
    </p>
  </div>
</template>
