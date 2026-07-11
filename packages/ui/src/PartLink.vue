<script setup lang="ts">
// 부 간 참조 링크 — "5부 6장" 같은 회수 참조를 해당 부의 챕터로 연결한다.
// 조립 배포본(같은 origin 하위 경로 /partN/)에서만 실제 링크로 동작하고,
// dev 단독 실행에서는 다른 부가 별도 포트라 연결이 깨지므로 일반 텍스트로 렌더한다.
// 새 탭으로 연다 — 읽던 챕터의 위치·풀던 문제를 잃지 않게.
// 사용: <PartLink :part="5" ch="ch6">5부 6장</PartLink> · ch 생략 시 그 부의 홈.
import { computed } from 'vue'

const props = defineProps<{
  /** 대상 부 번호 (1~6) */
  part: number | string
  /** 대상 챕터 슬러그 (예: 'ch6'). 생략하면 그 부의 홈 */
  ch?: string
}>()

// vite/client 타입 의존 없이 안전하게 접근 (@series/tutor 와 같은 패턴)
const isDev: boolean =
  ((import.meta as { env?: Record<string, unknown> }).env?.DEV as boolean | undefined) ?? false

const href = computed(() => `/part${props.part}/${props.ch ? `ch/${props.ch}` : ''}`)
</script>

<template>
  <a
    v-if="!isDev"
    :href="href"
    target="_blank"
    rel="noopener"
    class="font-medium text-indigo-600 underline decoration-dotted underline-offset-2 hover:text-indigo-500"
  ><slot /></a>
  <span v-else :title="`조립 배포본에서 ${href} 로 연결됩니다 (dev 단독 실행에서는 비활성)`"><slot /></span>
</template>
