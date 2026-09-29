<script setup lang="ts">
// 인터랙티브 전체 파이프라인 스텝퍼.
// "오늘 날씨가 정말" 이 토큰화 → 임베딩 → 위치 → 어텐션·블록 → 출력층 을 거쳐
// 다음 단어가 나오기까지를 '다음 단계' 버튼으로 하나씩 흘려본다. (ch2~9의 요약 조립)
import { ref, computed } from 'vue'
import { softmax, argmax } from '@/utils/softmax'

const INPUT = '오늘 날씨가 정말'
const tokens = ['오늘', '날씨가', '정말']
const ids = [1003, 1004, 1021]
const emb: [number, number][] = [
  [0.5, 0.8],
  [0.9, 0.4],
  [0.7, 0.2],
]
const pos: [number, number][] = [
  [0.0, 0.1],
  [0.5, 0.6],
  [1.0, 0.2],
]
const finalVecs = emb.map((e, i) => [e[0] + pos[i][0], e[1] + pos[i][1]] as [number, number])
// 어텐션·블록을 다 통과한 마지막 자리('정말')의 문맥 벡터 (ch9와 같은 값 → '좋다'로 이어짐)
const context: [number, number] = [1.0, 0.2]

// 출력층 사전 (ch9와 동일)
const VOCAB: { w: string; vec: [number, number] }[] = [
  { w: '좋다', vec: [1.0, 0.3] },
  { w: '춥다', vec: [0.3, 1.0] },
  { w: '덥다', vec: [-0.3, 1.0] },
  { w: '흐리다', vec: [-1.0, 0.3] },
  { w: '사과', vec: [0.2, -1.0] },
  { w: '달린다', vec: [-0.6, -0.8] },
]
const logits = VOCAB.map((v) => context[0] * v.vec[0] + context[1] * v.vec[1])
const probs = softmax(logits)
const nextWord = VOCAB[argmax(probs)].w

const STAGES = [
  { title: '토큰화', chapter: 'ch2' },
  { title: '임베딩', chapter: 'ch3' },
  { title: '위치 인코딩', chapter: 'ch4' },
  { title: '어텐션 · 블록 (×N)', chapter: 'ch6' },
  { title: '출력층 (logits → 확률)', chapter: 'ch9' },
  { title: '다음 단어', chapter: 'ch1' },
]

const step = ref(0)
const done = computed(() => step.value >= STAGES.length)
const fmt = (v: [number, number]) => `(${v[0].toFixed(1)}, ${v[1].toFixed(1)})`
const pct = (p: number) => (p * 100).toFixed(0)

function next() {
  if (step.value < STAGES.length) step.value++
}
function reset() {
  step.value = 0
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- 입력 -->
    <div class="mb-3 rounded-lg bg-slate-50 px-4 py-3">
      <span class="text-xs text-slate-500">입력 글</span>
      <div class="text-lg font-medium text-slate-800">"{{ INPUT }} ___"</div>
    </div>

    <!-- 진행 점 -->
    <div class="mb-4 flex flex-wrap gap-1.5">
      <span
        v-for="(_, i) in STAGES"
        :key="i"
        class="h-1.5 flex-1 rounded-full transition-colors"
        :class="step > i ? 'bg-indigo-500' : 'bg-slate-200'"
      />
    </div>

    <!-- 단계 카드들 -->
    <div class="space-y-2">
      <!-- 1. 토큰화 -->
      <div v-if="step >= 1" class="rounded-lg border border-slate-200 p-3">
        <p class="mb-1.5 text-sm font-semibold text-indigo-600">① 토큰화 <span class="text-xs font-normal text-slate-500">(ch2)</span></p>
        <div class="flex flex-wrap gap-2">
          <span v-for="(t, i) in tokens" :key="t" class="rounded bg-slate-100 px-2 py-1 text-sm">
            {{ t }} <span class="font-mono text-xs text-slate-600">#{{ ids[i] }}</span>
          </span>
        </div>
      </div>

      <!-- 2. 임베딩 -->
      <div v-if="step >= 2" class="rounded-lg border border-slate-200 p-3">
        <p class="mb-1.5 text-sm font-semibold text-indigo-600">② 임베딩 <span class="text-xs font-normal text-slate-500">(ch3)</span></p>
        <div class="flex flex-wrap gap-3 text-sm">
          <span v-for="(t, i) in tokens" :key="t"><b>{{ t }}</b> → <span class="font-mono text-slate-600">{{ fmt(emb[i]) }}</span></span>
        </div>
      </div>

      <!-- 3. 위치 -->
      <div v-if="step >= 3" class="rounded-lg border border-slate-200 p-3">
        <p class="mb-1.5 text-sm font-semibold text-indigo-600">③ 위치 인코딩 <span class="text-xs font-normal text-slate-500">(ch4)</span></p>
        <div class="flex flex-wrap gap-3 text-sm">
          <span v-for="(t, i) in tokens" :key="t"><b>{{ t }}</b> → <span class="font-mono text-slate-600">{{ fmt(finalVecs[i]) }}</span></span>
        </div>
        <p class="mt-1 text-xs text-slate-500">임베딩 + 위치 벡터 = 뜻과 순서가 모두 담긴 벡터</p>
      </div>

      <!-- 4. 어텐션·블록 -->
      <div v-if="step >= 4" class="rounded-lg border border-slate-200 p-3">
        <p class="mb-1.5 text-sm font-semibold text-indigo-600">④ 어텐션 · 블록 ×N <span class="text-xs font-normal text-slate-500">(ch5~8)</span></p>
        <p class="text-sm text-slate-600">
          단어들이 서로 참고(어텐션)하고 블록을 여러 번 통과 → 마지막 자리 <b>"정말"</b>의 문맥 벡터:
          <span class="font-mono text-slate-700">{{ fmt(context) }}</span>
        </p>
      </div>

      <!-- 5. 출력층 -->
      <div v-if="step >= 5" class="rounded-lg border border-slate-200 p-3">
        <p class="mb-1.5 text-sm font-semibold text-indigo-600">⑤ 출력층 → 확률 <span class="text-xs font-normal text-slate-500">(ch9)</span></p>
        <div class="space-y-1">
          <div v-for="(v, i) in VOCAB" :key="v.w" class="flex items-center gap-2">
            <span class="w-12 shrink-0 text-right text-xs" :class="probs[i] === Math.max(...probs) ? 'font-bold' : 'text-slate-500'">{{ v.w }}</span>
            <div class="h-3 flex-1 overflow-hidden rounded bg-slate-100">
              <div class="h-full rounded bg-indigo-400" :style="{ width: Math.max(probs[i] * 100, 2) + '%' }" />
            </div>
            <span class="w-9 shrink-0 text-right font-mono text-xs text-slate-500">{{ pct(probs[i]) }}%</span>
          </div>
        </div>
      </div>

      <!-- 6. 다음 단어 -->
      <div v-if="step >= 6" class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
        <p class="text-sm font-semibold text-emerald-800">
          🎯 다음 단어 = "<b>{{ nextWord }}</b>" → "오늘 날씨가 정말 <b>{{ nextWord }}</b>"
        </p>
        <p class="mt-1 text-xs text-emerald-700">이 단어를 붙이고 다시 처음부터, 그게 자기회귀 생성(아래)!</p>
      </div>
    </div>

    <!-- 버튼 -->
    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-if="!done"
        type="button"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        @click="next"
      >
        다음 단계 → <span class="opacity-70">({{ step }}/{{ STAGES.length }})</span>
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
