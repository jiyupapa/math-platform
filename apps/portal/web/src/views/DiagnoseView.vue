<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="mx-auto max-w-2xl px-5 py-12">
    <h1 class="mb-3 text-2xl font-bold text-slate-900">경로 진단</h1>
    <p class="mb-2 text-slate-600">
      곧 여기서 <strong>4개 관문</strong>(벡터·행렬곱 · 확률 기초 · 미분 · log 감각) 문항으로
      당신의 출발점을 5분 안에 진단합니다.
    </p>
    <p class="mb-8 text-slate-600">
      진단이 끝나면 <strong>학습 경로 지도</strong>에서 이미 아는 단계는 접히고,
      당신에게 필요한 경로만 남습니다. — “AI 강사가 당신만의 커리큘럼을 짜는” 순간.
    </p>
    <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
      🚧 이 화면(진단 문항 + 규칙 엔진)은 다음 단계에서 구현됩니다. 지금은 안내 스텁입니다.
    </div>
    <RouterLink to="/" class="mt-8 inline-block text-sm font-medium text-indigo-600 hover:underline">
      ← 경로 지도로 돌아가기
    </RouterLink>
  </main>
</template>
