<script setup lang="ts">
// 인터랙티브 소프트맥스 실험실.
// 후보 단어(토큰)마다 "점수(logit)" 슬라이더를 조작하면, 소프트맥스가
// 그 점수들을 실시간으로 "확률"로 바꿔 막대로 보여준다. 합은 항상 100%.
// 맨 아래엔 지금 LLM 이라면 고를 단어(확률 최댓값)를 표시한다.
//
// v-model 로 토큰 배열을 주고받는다 → 챕터가 현재 점수/확률을 함께 읽어 쓸 수 있다.
//   const tokens = ref<Token[]>([{ label: '사과', logit: 2 }, ...])
//   <SoftmaxLab v-model="tokens" />
import { computed } from 'vue'
import { softmax, argmax } from '@/utils/softmax'

export interface Token {
  label: string
  logit: number
}

const props = withDefaults(
  defineProps<{
    modelValue: Token[]
    /** 슬라이더 최소/최대 점수 */
    min?: number
    max?: number
  }>(),
  { min: -6, max: 10 },
)

const emit = defineEmits<{ 'update:modelValue': [Token[]] }>()

const probs = computed(() => softmax(props.modelValue.map((t) => t.logit)))
const winner = computed(() => argmax(probs.value))

// 막대 색 팔레트 (토큰별 고정색)
const palette = ['var(--c-indigo-500)', 'var(--c-emerald-500)', 'var(--c-amber-500)', 'var(--c-pink-500)', 'var(--c-cyan-500)', 'var(--c-violet-500)']

function setLogit(i: number, value: number) {
  const next = props.modelValue.map((t, idx) => (idx === i ? { ...t, logit: value } : t))
  emit('update:modelValue', next)
}

function pct(p: number) {
  return (p * 100).toFixed(1)
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- 입력: 점수 슬라이더 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 점수(logit): 슬라이더를 움직여 보세요</p>
    <p class="mb-4 text-xs text-slate-500">
      각 후보 단어에 매겨진 "어울리는 정도" 점수입니다. 크게/작게 바꾸면 아래 확률이 즉시 변합니다.
    </p>
    <div class="space-y-3">
      <div v-for="(t, i) in modelValue" :key="i" class="flex items-center gap-3">
        <span class="w-20 shrink-0 text-right text-sm font-medium" :style="{ color: palette[i % palette.length] }">
          {{ t.label }}
        </span>
        <input
          type="range"
          :min="min"
          :max="max"
          step="0.5"
          :value="t.logit"
          class="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-500"
          @input="setLogit(i, Number(($event.target as HTMLInputElement).value))"
        />
        <span class="w-12 shrink-0 text-right font-mono text-sm tabular-nums text-slate-600">
          {{ t.logit.toFixed(1) }}
        </span>
      </div>
    </div>

    <div class="my-4 text-center text-sm font-semibold text-indigo-600">↓ 소프트맥스 ↓</div>

    <!-- 출력: 확률 막대 -->
    <p class="mb-3 text-sm font-semibold text-slate-500">② 확률: 합은 항상 100%</p>
    <div class="space-y-2">
      <div v-for="(t, i) in modelValue" :key="i" class="flex items-center gap-3">
        <span class="w-20 shrink-0 text-right text-sm" :class="i === winner ? 'font-bold text-slate-800' : 'text-slate-500'">
          {{ t.label }}
        </span>
        <div class="h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
          <div
            class="flex h-full items-center justify-end rounded-md pr-2 text-xs font-semibold text-white transition-all duration-200"
            :style="{
              width: Math.max(probs[i] * 100, 3) + '%',
              backgroundColor: palette[i % palette.length],
              opacity: i === winner ? 1 : 0.55,
            }"
          >
            <span v-if="probs[i] > 0.06">{{ pct(probs[i]) }}%</span>
          </div>
        </div>
        <span class="w-12 shrink-0 text-right font-mono text-sm tabular-nums text-slate-600">
          {{ pct(probs[i]) }}%
        </span>
      </div>
    </div>

    <!-- LLM 연결: 지금 고를 단어 -->
    <div class="mt-5 rounded-lg bg-violet-50 px-4 py-3 text-sm text-violet-900">
      🤖 지금 LLM 이 (가장 확률 높은 단어로) 고른다면 →
      <b class="text-violet-700">"{{ modelValue[winner]?.label }}"</b>
      <span class="text-violet-600"> (확률 {{ pct(probs[winner]) }}%)</span>
    </div>
  </div>
</template>
