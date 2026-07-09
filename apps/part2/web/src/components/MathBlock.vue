<script setup lang="ts">
// KaTeX 수식 렌더. inline(문장 속) / block(가운데 정렬 독립 줄) 두 가지 모드.
// 사용 예: <MathBlock expr="a^2 + b^2" />  또는  <MathBlock inline expr="x^2" />  (주제 중립 예시 — 시리즈 공용 파일)
import { computed } from 'vue'
import katex from 'katex'

const props = withDefaults(defineProps<{ expr: string; inline?: boolean }>(), {
  inline: false,
})

const html = computed(() => {
  try {
    return katex.renderToString(props.expr, {
      displayMode: !props.inline,
      throwOnError: false,
      output: 'html',
    })
  } catch {
    // 폴백도 v-html 로 들어가므로 반드시 이스케이프 (방어적 — expr 은 저작 콘텐츠지만)
    return props.expr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }
})
</script>

<template>
  <span v-if="inline" v-html="html" />
  <div v-else class="my-4 overflow-x-auto text-center" v-html="html" />
</template>
