<script setup lang="ts">
// 통합 포털(part0) — 진단·경로 추천 허브. @series/ui 공용 패키지를 소비.
import { RouterView, RouterLink } from 'vue-router'
import { SearchPalette } from '@series/ui'
import { AuthPanel, currentUser } from '@series/store'

function openSearch() {
  window.dispatchEvent(new Event('open-search'))
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div class="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
        <RouterLink to="/" class="font-bold text-indigo-700">수포자 사관학교</RouterLink>
        <nav class="flex items-center gap-4">
          <button
            type="button"
            class="text-sm font-medium text-slate-600 hover:text-indigo-600 hover:underline"
            @click="openSearch"
          >
            🔎 검색
          </button>
          <RouterLink to="/map" class="text-sm font-medium text-slate-600 hover:text-indigo-600 hover:underline">
            학습 구조도
          </RouterLink>
          <RouterLink to="/diagnose" class="text-sm font-medium text-indigo-600 hover:underline">
            경로 진단
          </RouterLink>
          <RouterLink
            v-if="currentUser"
            to="/adoption"
            class="text-sm font-medium text-slate-600 hover:text-indigo-600 hover:underline"
          >
            도입 현황
          </RouterLink>
          <AuthPanel align="right" />
        </nav>
      </div>
    </header>
    <RouterView />

    <!-- 통합검색 팔레트 (⌘K / Ctrl+K · 상단 🔎 검색) -->
    <SearchPalette />
  </div>
</template>
