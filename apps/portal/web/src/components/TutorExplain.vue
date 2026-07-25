<script setup lang="ts">
// 3층 LLM — 로컬 Ollama 튜터가 추천을 강사 말투로 다시 설명(선택).
// Ollama 미실행 시 조용히 폴백(위 템플릿 설명으로 갈음). 결정은 규칙 엔진이 하므로 LLM 은 '설명만'.
import { ref } from 'vue'
import { DEFAULT_MODEL, listModels, streamChat, type ChatMessage } from '@series/tutor'

const props = defineProps<{ summary: string }>()

type State = 'idle' | 'checking' | 'streaming' | 'done' | 'offline' | 'error'
const state = ref<State>('idle')
const output = ref('')

async function ask() {
  state.value = 'checking'
  output.value = ''
  const models = await listModels()
  if (!models || models.length === 0) {
    state.value = 'offline'
    return
  }
  const model = models.includes(DEFAULT_MODEL) ? DEFAULT_MODEL : models[0]
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        '너는 수학을 포기했던 성인을 가르치는 따뜻한 AI 강사다. 아래는 규칙으로 정해진 학습 경로 추천이다. ' +
        '이 내용을 바꾸지 말고, 2~3문장으로 격려하듯 자연스럽게 풀어 설명해라. 이모지·과장 금지.',
    },
    { role: 'user', content: props.summary },
  ]
  try {
    state.value = 'streaming'
    for await (const delta of streamChat(model, messages)) output.value += delta
    state.value = 'done'
  } catch {
    state.value = 'error'
  }
}
</script>

<template>
  <div class="mt-3">
    <button
      v-if="state === 'idle' || state === 'offline' || state === 'error'"
      type="button"
      class="text-sm font-medium text-indigo-600 hover:underline"
      @click="ask"
    >
      🤖 AI 강사에게 더 듣기
    </button>
    <span v-else-if="state === 'checking'" class="text-sm text-slate-500">튜터를 부르는 중…</span>

    <p v-if="output" class="mt-2 rounded-lg bg-indigo-50 p-3 text-sm text-slate-700">{{ output }}</p>

    <p v-if="state === 'offline'" class="mt-2 text-xs text-slate-500">
      로컬 튜터(Ollama)가 꺼져 있어요 — 위 안내로 갈음합니다. (켜면 더 자세히 설명해드려요)
    </p>
    <p v-else-if="state === 'error'" class="mt-2 text-xs text-slate-500">
      튜터 응답에 문제가 있었어요. 위 안내를 참고하세요.
    </p>
  </div>
</template>
