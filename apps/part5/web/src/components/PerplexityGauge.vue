<script setup lang="ts">
// 퍼플렉시티 채점기 — 문장의 토큰마다 "모델이 정답에 준 확률 q"를 슬라이더로 조절하면
// 토큰별 손실 −log₂q 막대와 평균, 그리고 PPL = 2^평균 ("평균 몇 갈래에서 고민하나")이
// 실시간으로 계산된다. 어려운 토큰 하나가 성적을 지배하는 것을 체감시킨다.
import { ref, computed } from 'vue'

interface Sentence {
  label: string
  tokens: string[]
  q: number[]
}
const SENTENCES: Sentence[] = [
  {
    label: '😌 뻔한 문장',
    tokens: ['대한민국', '의', '수도', '는', '서울', '이다'],
    q: [0.3, 0.9, 0.7, 0.9, 0.95, 0.9],
  },
  {
    label: '🙂 보통 문장',
    tokens: ['나는', '아침', '에', '국밥', '을', '먹었다'],
    q: [0.2, 0.3, 0.9, 0.02, 0.9, 0.6],
  },
  {
    label: '🤯 황당 문장',
    tokens: ['나는', '아침', '에', '양자', '컴퓨터', '를', '삶았다'],
    q: [0.2, 0.3, 0.9, 0.005, 0.4, 0.85, 0.003],
  },
]

const current = ref(1)
const qs = ref<number[]>([...SENTENCES[1].q])

function pick(i: number) {
  current.value = i
  qs.value = [...SENTENCES[i].q]
}

const tokens = computed(() => SENTENCES[current.value].tokens)
const losses = computed(() => qs.value.map((q) => Math.log2(1 / q)))
const avg = computed(() => losses.value.reduce((s, v) => s + v, 0) / losses.value.length)
const ppl = computed(() => Math.pow(2, avg.value))

const LOSS_MAX = 9 // 손실 막대 스케일 (q=0.002 ≈ 9비트)
function barWidth(l: number): number {
  return Math.min(l / LOSS_MAX, 1) * 100
}
function barColor(l: number): string {
  if (l > 5) return 'var(--c-red-500)'
  if (l > 2.5) return 'var(--c-orange-500)'
  return 'var(--c-indigo-500)'
}
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-3 text-sm font-semibold text-slate-700">
      📊 퍼플렉시티 채점기 — 토큰별 확률 q 를 움직여 성적이 어떻게 변하는지 보세요
    </p>

    <!-- 예문 선택 -->
    <div class="mb-3 flex flex-wrap gap-1.5">
      <button
        v-for="(s, i) in SENTENCES"
        :key="s.label"
        class="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="
          current === i
            ? 'border-indigo-400 bg-indigo-100 text-indigo-800'
            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
        "
        @click="pick(i)"
      >
        {{ s.label }}
      </button>
    </div>

    <!-- 토큰별: 토큰 + q 슬라이더 + 손실 막대 -->
    <div class="space-y-1.5">
      <div
        v-for="(tok, i) in tokens"
        :key="current + '-' + i"
        class="flex items-center gap-2 text-sm"
      >
        <span class="w-20 shrink-0 truncate rounded bg-slate-100 px-1.5 py-0.5 text-center text-xs font-medium text-slate-700">
          {{ tok }}
        </span>
        <input
          v-model.number="qs[i]"
          type="range"
          min="0.002"
          max="1"
          step="0.002"
          class="w-28 shrink-0 accent-indigo-600"
          :aria-label="`${tok} 의 정답 확률`"
        />
        <span class="w-14 shrink-0 text-right text-xs tabular-nums text-slate-500">
          q={{ qs[i] >= 0.1 ? qs[i].toFixed(2) : qs[i].toFixed(3) }}
        </span>
        <div class="h-4 min-w-0 flex-1 overflow-hidden rounded bg-slate-100">
          <div
            class="h-full rounded transition-all duration-100"
            :style="{ width: barWidth(losses[i]) + '%', background: barColor(losses[i]) }"
          />
        </div>
        <span class="w-16 shrink-0 text-right text-xs tabular-nums text-slate-600">
          {{ losses[i].toFixed(2) }}비트
        </span>
      </div>
    </div>

    <!-- 성적표 -->
    <div class="mt-4 grid grid-cols-2 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-xl font-bold tabular-nums text-slate-700">{{ avg.toFixed(3) }} 비트</p>
        <p class="text-xs text-slate-500">평균 손실 (크로스 엔트로피)</p>
      </div>
      <div class="rounded-lg bg-indigo-50 p-3">
        <p class="text-xl font-bold tabular-nums text-indigo-700">PPL {{ ppl < 10 ? ppl.toFixed(2) : ppl.toFixed(1) }}</p>
        <p class="text-xs text-indigo-600">퍼플렉시티 = 2^평균</p>
      </div>
    </div>
    <p class="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-center text-sm text-amber-800">
      이 모델은 매 토큰을 <b>평균 {{ ppl < 10 ? ppl.toFixed(1) : Math.round(ppl) }}갈래</b>의 균등한 후보에서
      고민하는 것과 같은 수준입니다
    </p>
    <p class="mt-1.5 text-xs text-slate-500">
      💡 실험: 어려운 토큰(국밥·삶았다) 하나의 q 를 조금만 올려도 PPL 이 확 내려가요 —
      성적은 어려운 토큰이 지배합니다.
    </p>
  </div>
</template>
