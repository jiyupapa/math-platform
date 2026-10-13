<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { AuthPanel } from '@series/store'
import { ThemeToggle, PortalLink } from '@series/ui'
import { chapters } from '@/data/chapters'
import { useProgressStore } from '@/stores/progress'
import { useReviewStore } from '@/stores/review'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const progress = useProgressStore()
const review = useReviewStore()
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
    <!-- 부 고유색 띠 — 12개 부를 오갈 때 위치를 색으로 먼저 알린다 -->
    <div class="h-1 shrink-0 bg-pink-600" aria-hidden="true" />
    <div class="border-b border-slate-200 px-5 py-5">
      <!-- 포털(시리즈 홈)로 — 조립 배포본에서만 렌더(단독 dev 서버에는 포털이 없다). packages/ui PortalLink -->
      <PortalLink />
      <RouterLink to="/" class="block" @click="emit('close')">
        <h1 class="text-lg font-bold leading-tight text-pink-900">수포자를 위한<br />스케일링 법칙과 평가의 통계</h1>
      </RouterLink>
      <!-- 부 번호 = 부 고유색(위치) / 역할 칩 = 포털 학습지도와 같은 역할색(같은 언어).
           둘 다 700 계열 — 흰 글씨·흰 배경 모두에서 대비 4.5:1 을 넘긴다. -->
      <p class="mt-2 flex flex-wrap items-center gap-1.5">
        <span class="rounded bg-pink-700 px-1.5 py-0.5 text-xs font-bold text-white">10부</span>
        <span class="rounded bg-rose-100 px-1.5 py-0.5 text-xs font-medium text-rose-700">평가</span>
      </p>
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
        active-class="!border-pink-200 !bg-pink-50 !text-pink-700"
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

      <!-- 화면 테마 — 밤에 공부하는 경우가 있어 OS 설정과 별개로 덮어쓸 수 있게 둔다 -->
      <div class="mt-4">
        <ThemeToggle />
      </div>

      <!-- 로그인 — 진도 크로스기기 저장 (백엔드 미설정 시 표시 안 됨) -->
      <div class="mt-4">
        <AuthPanel />
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-4">
      <ul class="space-y-1">
        <li v-for="ch in chapters" :key="ch.slug">
          <RouterLink
            :to="ch.slug === 'sample' ? '/ch/sample' : `/ch/${ch.slug}`"
            class="block rounded-lg px-3 py-2.5 text-sm transition-colors"
            :class="[
              ch.comingSoon ? 'text-slate-600' : 'text-slate-700 hover:bg-slate-100',
            ]"
            active-class="!bg-pink-50 !text-pink-700 font-medium"
            @click="emit('close')"
          >
            <div class="flex items-center gap-2">
              <span
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold"
                :class="
                  progress.isDone(ch.slug)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-600'
                "
              >
                {{ progress.isDone(ch.slug) ? '✓' : ch.phase }}
              </span>
              <span class="min-w-0 flex-1">
                {{ ch.title }}
                <span v-if="ch.comingSoon" class="text-xs">(예정)</span>
              </span>
            </div>
          </RouterLink>
        </li>
      </ul>
    </nav>

  </aside>
</template>
