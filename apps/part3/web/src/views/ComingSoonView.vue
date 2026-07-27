<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { chapters } from '@/data/chapters'

const route = useRoute()
const chapter = computed(() => chapters.find((c) => c.slug === route.params.slug))
</script>

<template>
  <div class="py-10 text-center">
    <div class="mb-4 text-5xl">🚧</div>
    <h1 class="mb-2 text-2xl font-bold">
      {{ chapter ? chapter.title : '준비 중인 챕터' }}
    </h1>
    <p class="mb-6 text-slate-500">
      {{ chapter ? `Phase ${chapter.phase} · ${chapter.summary}` : '곧 만나요!' }}
    </p>
    <p class="mb-8 text-sm text-slate-500">
      이 챕터는 아직 준비 중입니다. Phase 0(기반 구축)에서는
      <RouterLink to="/ch/sample" class="text-indigo-600 underline">샘플 챕터</RouterLink>
      로 전체 학습 패턴을 먼저 확인해 보세요.
    </p>
    <RouterLink
      to="/"
      class="inline-block rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
    >
      ← 목차로 돌아가기
    </RouterLink>
  </div>
</template>
