<script setup lang="ts">
// 항목 옆 협업 주석 마커 — 개수 배지 + 클릭 시 NotePanel 토글.
// **partNumberKey 를 주입한 부에서만 렌더된다** — 미주입 부에선 아무것도 안 그린다(현재 전 12부 주입).
// 지금은 ReviewFlag 가 섹션마다 이 마커를 얹어 준다(섹션 앵커 chN-sM 재사용, 콘텐츠 수정 0).
// 임의 항목(개념카드·문제)으로 넓힐 땐 이 컴포넌트를 그 자리에 직접 두면 된다(설계노트 §6 2차).
import { computed, inject, onUnmounted, ref, watch } from 'vue'
import { currentUser, isBackendEnabled, useChapterAnnotations } from '@series/store'
import { partNumberKey } from './injection'
import NotePanel from './NotePanel.vue'

const props = defineProps<{ itemId: string; chapter: string; label: string }>()

const part = inject(partNumberKey, null)
// 백엔드 미설정(env 없음)이거나 이 부가 미주입이면 기능 자체가 없다.
const available = isBackendEnabled() && part !== null

// **로그인해야 보인다** — 주석은 '즉시 체험(무로그인)'과 분리된 옵트인 소셜 층이라,
// 비로그인 방문자의 화면은 이 기능 도입 전과 완전히 같아야 한다(설계노트 §3).
const enabled = computed(() => available && !!currentUser.value)

const store = available ? useChapterAnnotations(part as number, props.chapter) : null
const count = computed(() => store?.countFor(props.itemId) ?? 0)

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}
// 열려 있을 때만 바깥 클릭·ESC 를 듣는다(섹션마다 마커가 있어 상시 구독은 낭비).
watch(open, (v) => {
  if (v) {
    window.addEventListener('click', onDocClick)
    window.addEventListener('keydown', onEsc)
  } else {
    window.removeEventListener('click', onDocClick)
    window.removeEventListener('keydown', onEsc)
  }
})
onUnmounted(() => {
  window.removeEventListener('click', onDocClick)
  window.removeEventListener('keydown', onEsc)
})
</script>

<template>
  <span v-if="enabled" ref="root" class="nm">
    <button
      type="button"
      class="nm-btn"
      :class="{ 'nm-has': count > 0, 'nm-on': open }"
      :aria-expanded="open"
      :title="count > 0 ? `메모·질문 ${count}개` : '이 부분에 메모·질문 남기기'"
      @click.stop="open = !open"
    >
      💬<span v-if="count > 0" class="nm-badge">{{ count }}</span>
    </button>
    <NotePanel
      v-if="open"
      :part="(part as number)"
      :chapter="props.chapter"
      :item-id="props.itemId"
      :label="props.label"
      @close="open = false"
    />
  </span>
</template>

<style scoped>
.nm {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  margin-left: 4px;
}
.nm-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  font-size: 11px;
  line-height: 1.4;
  border: 1px solid var(--c-slate-200);
  border-radius: 6px;
  background: none;
  color: var(--c-slate-500);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.nm-btn:hover,
.nm-btn.nm-on {
  border-color: var(--c-indigo-200);
  color: var(--c-indigo-600);
}
.nm-btn.nm-has {
  border-color: var(--c-indigo-200);
  background: var(--c-indigo-50);
  color: var(--c-indigo-600);
}
.nm-badge {
  font-size: 10px;
  font-weight: 700;
}
</style>
