<script setup lang="ts">
// 섹션 제목 옆에 두는 '복습에 추가' 북마크 토글. id 는 앵커 역할도 한다.
// 복습 저장은 앱이 reviewApiKey 로 주입한 구현(자기 review 스토어)에 위임한다.
//
// 협업 주석 마커(NoteMarker)도 여기서 함께 얹는다 — 이 컴포넌트가 이미 섹션마다 놓여 있고
// 주석에 필요한 앵커(id·chapter·label)를 그대로 갖고 있어, 콘텐츠 수정 없이 전 섹션에 붙는다.
// 마커는 partNumberKey 를 주입한 부에서만 렌더된다(설계: docs/todo_협업주석_260716.md).
import { inject } from 'vue'
import { reviewApiKey } from './injection'
import NoteMarker from './NoteMarker.vue'

const props = defineProps<{ id: string; chapter: string; label: string }>()
const review = inject(reviewApiKey, { isFlagged: () => false, toggle: () => {} })
</script>

<template>
  <span :id="props.id" class="ml-1 inline-block scroll-mt-24 align-middle">
    <button
      type="button"
      class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors"
      :class="
        review.isFlagged(props.id)
          ? 'border-amber-300 bg-amber-50 text-amber-700'
          : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
      "
      :aria-pressed="review.isFlagged(props.id)"
      @click="review.toggle({ id: props.id, chapter: props.chapter, label: props.label })"
    >
      {{ review.isFlagged(props.id) ? '★ 복습에 추가됨' : '☆ 복습에 추가' }}
    </button>
    <NoteMarker :item-id="props.id" :chapter="props.chapter" :label="props.label" />
  </span>
</template>
