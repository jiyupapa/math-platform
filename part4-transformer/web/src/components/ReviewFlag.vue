<script setup lang="ts">
// 섹션 제목 옆에 두는 '복습에 추가' 북마크 토글. id 는 앵커 역할도 한다.
import { useReviewStore } from '@/stores/review'

const props = defineProps<{ id: string; chapter: string; label: string }>()
const review = useReviewStore()
</script>

<template>
  <span :id="props.id" class="ml-1 inline-block scroll-mt-24 align-middle">
    <button
      type="button"
      class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors"
      :class="
        review.isFlagged(props.id)
          ? 'border-amber-300 bg-amber-50 text-amber-700'
          : 'border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-600'
      "
      :aria-pressed="review.isFlagged(props.id)"
      @click="review.toggle({ id: props.id, chapter: props.chapter, label: props.label })"
    >
      {{ review.isFlagged(props.id) ? '★ 복습에 추가됨' : '☆ 복습에 추가' }}
    </button>
  </span>
</template>
