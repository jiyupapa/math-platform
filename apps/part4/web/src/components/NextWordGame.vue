<script setup lang="ts">
// 인터랙티브 "다음 단어 맞히기" 게임.
// 아주 작은 목업 모델(단어 → 다음 후보 표)로, LLM의 자기회귀(autoregressive) 생성을 체험한다.
// 후보 단어를 클릭하면 문장 끝에 붙고, 그 단어를 기준으로 다음 후보가 갱신된다 → 한 단어씩 문장이 자란다.
// 확률은 Phase 0의 softmax 유틸을 그대로 재사용.
//
// v-model 로 현재 문장(단어 배열)을 주고받는다 → 챕터가 "지금까지 만든 문장"을 함께 읽어 쓸 수 있다.
import { computed } from 'vue'
import { softmax, argmax } from '@/utils/softmax'

interface Cand {
  w: string
  l: number
}

const SEED = '나는'
const END = '.'

// 목업 "언어 모델": 마지막 단어 → 다음 후보 단어와 점수(logit).
// 표에 없는 단어(먹었다·갔다 등 문장을 끝맺는 말)는 자동으로 마침표(.)만 후보로 내놓는다.
const MODEL: Record<string, Cand[]> = {
  '나는': [
    { w: '밥을', l: 3.0 },
    { w: '커피를', l: 2.0 },
    { w: '학교에', l: 1.5 },
    { w: '영화를', l: 0.5 },
  ],
  '밥을': [
    { w: '먹었다', l: 3.5 },
    { w: '남겼다', l: 0.5 },
  ],
  '커피를': [
    { w: '마셨다', l: 3.5 },
    { w: '쏟았다', l: 0.3 },
  ],
  '학교에': [
    { w: '갔다', l: 3.5 },
    { w: '늦었다', l: 1.0 },
  ],
  '영화를': [
    { w: '봤다', l: 3.5 },
    { w: '예매했다', l: 1.0 },
  ],
}

const sentence = defineModel<string[]>({ default: () => [SEED] })

const lastWord = computed(() => sentence.value[sentence.value.length - 1])
const done = computed(() => lastWord.value === END)

const candidates = computed<Cand[]>(() => {
  if (done.value) return []
  return MODEL[lastWord.value] ?? [{ w: END, l: 5 }]
})

const probs = computed(() => softmax(candidates.value.map((c) => c.l)))
const best = computed(() => (candidates.value.length ? argmax(probs.value) : -1))

// 문장 렌더: 단어는 공백으로 잇되, 마침표는 공백 없이 붙인다.
const text = computed(() => {
  let s = ''
  sentence.value.forEach((w, i) => {
    if (w === END) s += '.'
    else s += (i === 0 ? '' : ' ') + w
  })
  return s
})

function pick(i: number) {
  if (done.value) return
  sentence.value = [...sentence.value, candidates.value[i].w]
}

function greedy() {
  if (done.value || best.value < 0) return
  pick(best.value)
}

function reset() {
  sentence.value = [SEED]
}

function label(w: string) {
  return w === END ? '. (문장 끝)' : w
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- 현재까지 만든 문장 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">지금까지 만든 문장</p>
    <div class="mb-4 rounded-lg bg-slate-50 px-4 py-3 text-lg font-medium text-slate-800">
      {{ text }}<span v-if="!done" class="ml-0.5 animate-pulse text-indigo-400">▌</span>
    </div>

    <!-- 후보 단어 (확률과 함께) -->
    <template v-if="!done">
      <p class="mb-2 text-sm font-semibold text-slate-500">
        다음에 올 단어 후보 — 아무거나 눌러 이어보세요
      </p>
      <div class="space-y-2">
        <button
          v-for="(c, i) in candidates"
          :key="c.w"
          type="button"
          class="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors"
          :class="i === best ? 'border-indigo-300 bg-indigo-50/60 hover:bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'"
          @click="pick(i)"
        >
          <span class="w-24 shrink-0 text-sm font-medium" :class="i === best ? 'text-indigo-700' : 'text-slate-700'">
            {{ label(c.w) }}
          </span>
          <span class="h-4 flex-1 overflow-hidden rounded bg-slate-100">
            <span
              class="block h-full rounded bg-indigo-400 transition-all"
              :style="{ width: Math.max(probs[i] * 100, 2) + '%', opacity: i === best ? 1 : 0.5 }"
            />
          </span>
          <span class="w-10 shrink-0 text-right font-mono text-sm tabular-nums text-slate-500">
            {{ (probs[i] * 100).toFixed(0) }}%
          </span>
        </button>
      </div>
    </template>

    <!-- 완성 -->
    <div v-else class="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      ✅ 문장 완성! LLM도 이렇게 <b>마침표(문장 끝 신호)</b>가 나올 때까지 한 단어씩 이어붙입니다.
    </div>

    <!-- 조작 버튼 -->
    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-if="!done"
        type="button"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        @click="greedy"
      >
        🎯 가장 확률 높은 단어로 (자동 1칸)
      </button>
      <button
        type="button"
        class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
        @click="reset"
      >
        ↺ 처음부터
      </button>
    </div>
  </div>
</template>
