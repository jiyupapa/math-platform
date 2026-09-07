<script setup lang="ts">
// 포털(시리즈 홈)로 돌아가는 링크 — 각 부 사이드바 상단에 둔다.
// 조립 배포본에서 포털은 / 이고 각 부는 /partN/ 이다(PartLink·ConceptStrip 과 같은 규약). 단독 dev 서버(base=/)에는
// 포털이 없어 / 가 자기 홈이 되므로, base 가 /partN/ 꼴일 때만 그린다.
// vite/client 타입 의존 없이 안전하게 접근 (PartLink·ConceptStrip 과 같은 패턴)
const base = ((import.meta as { env?: Record<string, unknown> }).env?.BASE_URL as string | undefined) ?? '/'
const show = /^\/part\d+\/?$/.test(base)
</script>

<template>
  <div v-if="show" class="mb-2">
    <a
      href="/"
      data-portal-link
      class="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:underline"
    >
      <span aria-hidden="true">←</span> 시리즈 홈 · 수포자 사관학교
    </a>
  </div>
</template>
