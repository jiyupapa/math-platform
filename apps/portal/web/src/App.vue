<script setup lang="ts">
// 통합 포털(part0) — 진단·경로 추천 허브. @series/ui 공용 패키지를 소비.
import { RouterView, RouterLink } from 'vue-router'
import { SearchPalette, ThemeToggle } from '@series/ui'
import { AuthPanel, currentUser, isAdmin } from '@series/store'
import { startPortalHydration, progressVersion } from './data/useProgress'

// 개인 2층 — 로그인 시 내 진도를 DB 에서 읽어 지도/홈이 즉시 반영되게 한다.
startPortalHydration()

function openSearch() {
  window.dispatchEvent(new Event('open-search'))
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white/80 backdrop-blur">
      <!-- 모바일: 한 줄에 469px 가 필요해 로고·메뉴가 단어 중간에서 잘렸다(수포자 사관/학교, 학습 구/조도).
           바깥은 flex-wrap 으로 메뉴를 통째로 다음 줄에 내리고, 각 항목은 whitespace-nowrap 으로
           절대 쪼개지지 않게 한다. 로그인·관리자면 항목이 6개까지 늘어나므로 nav 자체도 wrap. -->
      <div class="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3">
        <!-- inline-flex — 인라인 <a> 는 min-height 가 안 먹어 터치 타깃 규칙(base.css)이 무력해진다 -->
        <RouterLink to="/" class="inline-flex items-center py-1 font-bold whitespace-nowrap text-indigo-700">수포자 사관학교</RouterLink>
        <nav class="flex flex-wrap items-center gap-x-4 gap-y-1">
          <button
            type="button"
            class="inline-flex items-center py-1.5 text-sm font-medium whitespace-nowrap text-slate-600 hover:text-indigo-600 hover:underline"
            @click="openSearch"
          >
            🔎 검색
          </button>
          <RouterLink to="/map" class="inline-flex items-center py-1.5 text-sm font-medium whitespace-nowrap text-slate-600 hover:text-indigo-600 hover:underline">
            학습 구조도
          </RouterLink>
          <RouterLink to="/concepts" class="inline-flex items-center py-1.5 text-sm font-medium whitespace-nowrap text-slate-600 hover:text-indigo-600 hover:underline">
            개념 지도
          </RouterLink>
          <RouterLink to="/glossary" class="inline-flex items-center py-1.5 text-sm font-medium whitespace-nowrap text-slate-600 hover:text-indigo-600 hover:underline">
            용어 대조표
          </RouterLink>
          <RouterLink to="/diagnose" class="inline-flex items-center py-1.5 text-sm font-medium whitespace-nowrap text-indigo-600 hover:underline">
            출발점 진단
          </RouterLink>
          <RouterLink
            v-if="currentUser"
            to="/adoption"
            class="inline-flex items-center py-1.5 text-sm font-medium whitespace-nowrap text-slate-600 hover:text-indigo-600 hover:underline"
          >
            도입 현황
          </RouterLink>
          <RouterLink
            v-if="isAdmin"
            to="/qna"
            class="inline-flex items-center py-1.5 text-sm font-medium whitespace-nowrap text-slate-600 hover:text-indigo-600 hover:underline"
          >
            🎓 답변 대기 질문
          </RouterLink>
          <ThemeToggle />
          <AuthPanel align="right" />
        </nav>
      </div>
    </header>
    <!-- 로그인 후 DB 하이드레이션이 끝나면 progressVersion 이 올라 뷰가 리마운트(진도 재계산)된다 -->
    <RouterView :key="progressVersion" />

    <!-- 사이트 푸터 — main 밖에 둬야 contentinfo 랜드마크가 생긴다(main/section 안이면 generic).
         전 페이지 공통으로 참인 문장만 둔다(페이지별 안내는 각 뷰에). -->
    <footer class="mx-auto max-w-3xl break-keep px-5 pb-10 text-center text-xs text-slate-500">
      각 부에서 공부한 진도가 이 지도에 함께 표시돼요.
    </footer>

    <!-- 통합검색 팔레트 (⌘K / Ctrl+K · 상단 🔎 검색) -->
    <SearchPalette />
  </div>
</template>
