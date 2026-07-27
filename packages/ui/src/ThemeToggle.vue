<script setup lang="ts">
// 테마 전환 — 시스템 → 라이트 → 다크 순환.
// 다크 모드는 OS 설정을 따르는 게 기본이지만, 밤에 공부하려고 앱만 어둡게 하고 싶은 경우가 있어
// 사용자가 덮어쓸 수 있게 둔다(선택은 localStorage 에 남는다).
import { computed } from 'vue'
import { themeMode, setTheme, type ThemeMode } from './theme'

const ORDER: ThemeMode[] = ['system', 'light', 'dark']
const LABEL: Record<ThemeMode, { icon: string; text: string }> = {
  system: { icon: '🖥️', text: '시스템 설정' },
  light: { icon: '☀️', text: '밝게' },
  dark: { icon: '🌙', text: '어둡게' },
}

const current = computed(() => LABEL[themeMode.value])
const next = computed(() => LABEL[ORDER[(ORDER.indexOf(themeMode.value) + 1) % ORDER.length]])

function cycle() {
  setTheme(ORDER[(ORDER.indexOf(themeMode.value) + 1) % ORDER.length])
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
    :title="`화면 테마: ${current.text} — 누르면 ${next.text}`"
    :aria-label="`화면 테마 ${current.text}. 누르면 ${next.text}로 바뀝니다`"
    @click="cycle"
  >
    <span aria-hidden="true">{{ current.icon }}</span>
    <span>{{ current.text }}</span>
  </button>
</template>
