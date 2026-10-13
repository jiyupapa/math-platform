<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { chapters } from '@/data/chapters'
import { useReviewStore } from '@/stores/review'

const review = useReviewStore()

// 챕터 순서대로 그룹핑 (표시된 항목이 있는 챕터만)
const grouped = computed(() =>
  chapters
    .map((c) => ({ chapter: c, items: review.items.filter((i) => i.chapter === c.slug) }))
    .filter((g) => g.items.length > 0),
)
</script>

<template>
  <div>
    <h1 class="mb-2 text-3xl font-bold">복습 목록</h1>
    <p class="mb-6 leading-relaxed text-slate-600">
      학습 중 '복습에 추가'로 표시한 섹션만 모았습니다. 항목을 누르면 그 섹션으로 바로 이동합니다.
    </p>

    <div
      v-if="review.count === 0"
      class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500"
    >
      아직 복습으로 표시한 항목이 없습니다.<br />
      각 섹션 제목 옆의 <b class="text-slate-600">☆ 복습에 추가</b> 를 눌러 표시해 두세요.
    </div>

    <div v-else class="space-y-6">
      <section v-for="g in grouped" :key="g.chapter.slug">
        <h2 class="mb-2 text-sm font-semibold text-indigo-600">{{ g.chapter.title }}</h2>
        <ul class="space-y-2">
          <li
            v-for="it in g.items"
            :key="it.id"
            class="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
          >
            <RouterLink
              :to="`/ch/${it.chapter}#${it.id}`"
              class="min-w-0 flex-1 text-sm font-medium text-slate-700 hover:text-indigo-700"
            >
              {{ it.label }}
            </RouterLink>
            <button
              type="button"
              class="shrink-0 text-xs text-slate-500 underline hover:text-rose-700"
              @click="review.remove(it.id)"
            >
              제거
            </button>
          </li>
        </ul>
      </section>

      <button
        type="button"
        class="text-sm text-slate-500 underline hover:text-rose-700"
        @click="review.clear()"
      >
        전체 비우기
      </button>
    </div>
  </div>
</template>
