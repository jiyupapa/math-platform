<script setup lang="ts">
// 테마 전환 — 시스템 → 라이트 → 다크 순환.
// 다크 모드는 OS 설정을 따르는 게 기본이지만, 밤에 공부하려고 앱만 어둡게 하고 싶은 경우가 있어
// 사용자가 덮어쓸 수 있게 둔다(선택은 localStorage 에 남는다).
//
// 버튼 너비는 상태와 무관하게 고정한다 — 라벨 길이가 상태마다 다르면(예전 '시스템 설정' 109px ↔ '밝게' 68px)
// 헤더 nav 가 접힘 경계 근처에서 한 줄↔두 줄로 튀어, 누른 자리에서 버튼이 사라진 것처럼 보였다.
// 세 라벨을 같은 grid 칸에 겹쳐 놓고 현재 것만 보이게 해서 가장 긴 라벨의 너비를 항상 차지한다.
import { computed } from 'vue'
import { themeMode, setTheme, type ThemeMode } from './theme'

const ORDER: ThemeMode[] = ['system', 'light', 'dark']
const LABEL: Record<ThemeMode, { icon: string; text: string; hint: string }> = {
  system: { icon: '🖥️', text: '시스템', hint: 'OS 설정을 따름' },
  light: { icon: '☀️', text: '밝게', hint: '항상 라이트' },
  dark: { icon: '🌙', text: '어둡게', hint: '항상 다크' },
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
    :title="`화면 테마: ${current.text} (${current.hint}) — 누르면 ${next.text}`"
    :aria-label="`화면 테마 ${current.text}. 누르면 ${next.text}로 바뀝니다`"
    @click="cycle"
  >
    <span aria-hidden="true">{{ current.icon }}</span>
    <span class="grid text-left" aria-hidden="true">
      <span
        v-for="m in ORDER"
        :key="m"
        class="col-start-1 row-start-1 whitespace-nowrap"
        :class="{ invisible: m !== themeMode }"
      >{{ LABEL[m].text }}</span>
    </span>
  </button>
</template>
