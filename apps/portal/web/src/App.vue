<script setup lang="ts">
// 통합 포털(part0) — 진단·경로 추천 허브. @series/ui 공용 패키지를 소비.
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div class="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
        <RouterLink to="/" class="font-bold text-indigo-700">수포자 사관학교</RouterLink>
        <RouterLink to="/diagnose" class="text-sm font-medium text-indigo-600 hover:underline">
          경로 진단
        </RouterLink>
      </div>
    </header>
    <RouterView />
  </div>
</template>
