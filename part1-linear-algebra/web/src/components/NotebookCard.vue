<script setup lang="ts">
// 각 챕터에 대응하는 Python 노트북 안내 카드.
// 현재 챕터를 route 로 찾아 chapters.ts 의 notebook 필드를 자동으로 읽어 표시한다.
// (항상 보이는 카드 — 퀴즈 완료 여부와 무관. 노트북은 선택 학습, 웹만으로도 완주 가능)
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { chapters } from '@/data/chapters'
import ConceptCard from './ConceptCard.vue'

const route = useRoute()
const notebook = computed(() => {
  const m = /^\/ch\/([\w-]+)$/.exec(route.path)
  const slug = m ? m[1] : null
  return chapters.find((c) => c.slug === slug)?.notebook ?? null
})
</script>

<template>
  <ConceptCard v-if="notebook" tone="tip" title="🐍 Python 노트북으로도 해보기">
    이 챕터의 짝 노트북
    <code class="rounded bg-slate-100 px-1 text-[13px]">notebooks/{{ notebook }}</code>
    에서 웹과 <b>같은 예제를 직접 코드로</b> 계산해 봅니다. 노트북 맨 위 <b>🤖 AI 튜터 셀</b>을 실행하면
    웹과 같은 챗봇에게 물어볼 수도 있어요.
    <span class="text-slate-400">(선택 — 웹만으로도 학습을 완료할 수 있어요)</span>
  </ConceptCard>
</template>
