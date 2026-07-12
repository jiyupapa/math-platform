<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { chapters, availableChapters } from '@/data/chapters'
import { useProgressStore } from '@/stores/progress'
import { useReviewStore } from '@/stores/review'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const progress = useProgressStore()
const review = useReviewStore()

// 콘텐츠가 공개된 최신 Phase (챕터 추가 시 자동 갱신). 아직 없으면 null → 제작 중 표기.
const latestPhase = computed(() =>
  availableChapters.length ? Math.max(...availableChapters.map((c) => c.phase)) : null,
)
</script>

<template>
  <!-- 모바일 오버레이 -->
  <div
    v-if="open"
    class="fixed inset-0 z-20 bg-black/30 lg:hidden"
    @click="emit('close')"
  />

  <aside
    class="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="border-b border-slate-200 px-5 py-5">
      <RouterLink to="/" class="block" @click="emit('close')">
        <h1 class="text-lg font-bold leading-tight">수포자를 위한<br />스케일링 법칙과 평가의 통계</h1>
      </RouterLink>
      <!-- 진도 표시 (본 챕터가 하나라도 공개된 뒤에만) -->
      <div v-if="progress.totalCount > 0" class="mt-4">
        <div class="mb-1 flex justify-between text-xs text-slate-500">
          <span>학습 진도</span>
          <span>{{ progress.completedCount }}/{{ progress.totalCount }}</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            class="h-full rounded-full bg-emerald-500 transition-all"
            :style="{ width: progress.percent + '%' }"
          />
        </div>
      </div>
      <!-- 복습 목록 -->
      <RouterLink
        to="/review"
        class="mt-4 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
        active-class="!border-indigo-200 !bg-indigo-50 !text-indigo-700"
        @click="emit('close')"
      >
        <span>복습 목록</span>
        <span
          v-if="review.count > 0"
          class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
        >
          {{ review.count }}
        </span>
      </RouterLink>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-4">
      <ul class="space-y-1">
        <li v-for="ch in chapters" :key="ch.slug">
          <RouterLink
            :to="ch.slug === 'sample' ? '/ch/sample' : `/ch/${ch.slug}`"
            class="block rounded-lg px-3 py-2.5 text-sm transition-colors"
            :class="[
              ch.comingSoon ? 'text-slate-400' : 'text-slate-700 hover:bg-slate-100',
            ]"
            active-class="!bg-indigo-50 !text-indigo-700 font-medium"
            @click="emit('close')"
          >
            <div class="flex items-center gap-2">
              <span
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold"
                :class="
                  progress.isDone(ch.slug)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                "
              >
                {{ progress.isDone(ch.slug) ? '✓' : ch.phase }}
              </span>
              <span class="min-w-0 flex-1">
                {{ ch.title }}
                <span v-if="ch.comingSoon" class="text-[10px]">(예정)</span>
              </span>
            </div>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="border-t border-slate-200 px-5 py-3 text-[11px] text-slate-400">
      {{ latestPhase === null ? '🚧 콘텐츠 제작 중 — 로드맵 공개' : `현재 Phase ${latestPhase}까지 공개` }}
    </div>
  </aside>
</template>
