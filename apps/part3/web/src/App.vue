<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import TutorChat from '@/components/TutorChat.vue'
import { SearchPalette } from '@series/ui'
import { ref } from 'vue'

const sidebarOpen = ref(false)
function openSearch() {
  window.dispatchEvent(new Event('open-search'))
}
</script>

<template>
  <div class="flex h-full bg-slate-50 text-slate-800">
    <!-- 사이드바 -->
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- 본문 -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden"
      >
        <button
          class="rounded-md p-2 hover:bg-slate-100"
          aria-label="메뉴 열기"
          @click="sidebarOpen = true"
        >
          ☰
        </button>
        <span class="font-semibold">수포자를 위한 확률과 통계</span>
        <button
          type="button"
          class="ml-auto rounded-md p-2 hover:bg-slate-100"
          aria-label="통합검색 (Ctrl+K)"
          @click="openSearch"
        >
          🔎
        </button>
      </header>

      <main class="mx-auto w-full max-w-5xl flex-1 px-5 py-8 lg:px-12 xl:px-16">
        <RouterView v-slot="{ Component }">
          <component :is="Component" />
        </RouterView>
      </main>
    </div>

    <!-- AI 튜터 (로컬 Ollama) — 모든 페이지에서 플로팅 -->
    <TutorChat />

    <!-- 통합검색 팔레트 (⌘K / Ctrl+K · 상단 🔎) -->
    <SearchPalette />
  </div>
</template>
