<script setup lang="ts">
// 주석에서 넘어온 질문의 AI 답 아래 '메모에 저장' 제안 — 각 부 TutorChat 이 입력창 위에 둔다(useNoteAsk 와 짝).
// 사용자가 누를 때만 그 메모에 저장한다(로컬 모델 답은 틀릴 수 있는데 공유 층이라 동료에게도 보이므로).
import type { NoteAskOffer } from './noteAsk'

defineProps<{ offer: NoteAskOffer | null; busy: boolean }>()
defineEmits<{ save: [] }>()
</script>

<template>
  <div
    v-if="offer && !busy"
    class="mb-2 flex items-center justify-between gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-xs"
  >
    <span class="text-indigo-700">
      {{ offer.saved ? '메모에 저장했어요 — 동료도 볼 수 있어요.' : '이 답변을 메모에 남길까요?' }}
    </span>
    <button
      v-if="!offer.saved"
      type="button"
      class="flex-none rounded-md bg-indigo-600 px-2 py-1 font-medium text-white hover:bg-indigo-500"
      @click="$emit('save')"
    >
      메모에 저장
    </button>
  </div>
</template>
