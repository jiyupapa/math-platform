<script setup lang="ts">
// 인터랙티브 어텐션 실험실 (직관용).
// 한 단어(질문 단어)가 문장 속 다른 단어들을 '얼마나 참고할지' 점수를 조절하면,
// 소프트맥스가 그 점수를 합 1인 '집중도(가중치)'로 바꾸고, 문맥을 '가중 평균'으로 섞는다.
// Q·K·V 의 상세 계산은 ch6. 여기선 "가중 평균"의 직관에 집중.
import { ref, computed, watch } from 'vue'
import { softmax, argmax } from '@/utils/softmax'

const WORDS = ['강아지가', '공을', '물었다']
// 각 단어의 아주 단순한 2D 의미 벡터 (문맥 혼합 결과를 보여주기 위함)
const VEC: [number, number][] = [
  [1.0, 0.0], // 강아지가
  [0.0, 1.0], // 공을
  [0.8, 0.8], // 물었다
]
// 질문 단어별 기본 관련성 점수 (합리적인 초기값)
const DEFAULTS: number[][] = [
  [2.5, 0.5, 1.0], // '강아지가' 기준
  [0.5, 2.5, 1.0], // '공을' 기준
  [2.2, 2.0, 0.5], // '물었다' 기준 (주어·목적어를 많이 참고)
]

const queryIdx = ref(2) // 기본: '물었다'
const scores = ref<number[]>([...DEFAULTS[2]])

watch(queryIdx, (q) => {
  scores.value = [...DEFAULTS[q]]
})

const weights = computed(() => softmax(scores.value))
const top = computed(() => argmax(weights.value))
const context = computed<[number, number]>(() => {
  const c: [number, number] = [0, 0]
  weights.value.forEach((w, i) => {
    c[0] += w * VEC[i][0]
    c[1] += w * VEC[i][1]
  })
  return c
})

function setScore(i: number, v: number) {
  scores.value = scores.value.map((s, idx) => (idx === i ? v : s))
}
const pct = (w: number) => (w * 100).toFixed(0)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- 질문 단어 선택 -->
    <p class="mb-2 text-sm font-semibold text-slate-500">① 어느 단어의 눈으로 볼까요? (질문 단어)</p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="(w, i) in WORDS"
        :key="w"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
        :class="queryIdx === i ? 'border-indigo-400 bg-indigo-50 text-indigo-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="queryIdx = i"
      >
        {{ w }}
      </button>
    </div>
    <p class="mt-1.5 text-xs text-slate-500">
      <b>"{{ WORDS[queryIdx] }}"</b>가 문장 속 각 단어를 <b>얼마나 참고할지</b> 점수를 정합니다.
    </p>

    <!-- 관련성 점수 슬라이더 -->
    <p class="mt-4 mb-2 text-sm font-semibold text-slate-500">② 관련성 점수 (드래그)</p>
    <div class="space-y-2">
      <div v-for="(w, i) in WORDS" :key="w" class="flex items-center gap-3">
        <span class="w-20 shrink-0 text-right text-sm font-medium text-slate-700">{{ w }}</span>
        <input
          type="range"
          min="-2"
          max="5"
          step="0.5"
          :value="scores[i]"
          class="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-500"
          @input="setScore(i, Number(($event.target as HTMLInputElement).value))"
        />
        <span class="w-10 shrink-0 text-right font-mono text-sm tabular-nums text-slate-500">{{ scores[i].toFixed(1) }}</span>
      </div>
    </div>

    <div class="my-3 text-center text-sm font-semibold text-indigo-600">↓ 소프트맥스 ↓</div>

    <!-- 집중도(가중치) -->
    <p class="mb-2 text-sm font-semibold text-slate-500">③ 집중도 (합 100%)</p>
    <div class="space-y-2">
      <div v-for="(w, i) in WORDS" :key="w" class="flex items-center gap-3">
        <span class="w-20 shrink-0 text-right text-sm" :class="i === top ? 'font-bold text-slate-800' : 'text-slate-500'">{{ w }}</span>
        <div class="h-5 flex-1 overflow-hidden rounded bg-slate-100">
          <div
            class="h-full rounded bg-indigo-400 transition-all"
            :style="{ width: Math.max(weights[i] * 100, 2) + '%', opacity: i === top ? 1 : 0.55 }"
          />
        </div>
        <span class="w-10 shrink-0 text-right font-mono text-sm tabular-nums text-slate-500">{{ pct(weights[i]) }}%</span>
      </div>
    </div>

    <!-- 결과 -->
    <div class="mt-4 rounded-lg bg-violet-50 px-4 py-3 text-sm text-violet-900">
      👀 <b>"{{ WORDS[queryIdx] }}"</b>는 지금 <b>"{{ WORDS[top] }}"</b>에 가장 집중
      <span class="text-violet-600">({{ pct(weights[top]) }}%)</span>합니다.
      <div class="mt-1 text-violet-700">
        섞인 문맥 벡터(가중 평균) =
        <span class="font-mono">({{ context[0].toFixed(2) }}, {{ context[1].toFixed(2) }})</span>
        — 집중도가 큰 단어 쪽으로 결과가 끌려갑니다.
      </div>
    </div>
  </div>
</template>
