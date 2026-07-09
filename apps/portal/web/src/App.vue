<script setup lang="ts">
// 모노레포 트라이얼 포털 — 공용 패키지 @series/ui 를 소비해 구조·Tailwind·KaTeX 를 검증한다.
import { ConceptCard, MathBlock } from '@series/ui'
</script>

<template>
  <main class="mx-auto max-w-2xl p-8">
    <h1 class="mb-2 text-2xl font-bold text-indigo-700">수포자 사관학교 — 포털</h1>
    <p class="mb-6 text-slate-600">
      모노레포 트라이얼: 이 포털은 <code>@series/ui</code> 공용 패키지를 소비합니다.
    </p>

    <ConceptCard tone="goal" title="구조 검증">
      <p>
        이 카드(<strong>ConceptCard</strong>)는 <code>packages/ui</code> 에서 왔습니다.
        배경·테두리 색이 보이면 Tailwind <code>@source</code> 스캔이 정상 작동한 것입니다.
      </p>
    </ConceptCard>

    <ConceptCard tone="ai" title="AI 연결 카드 톤">
      <p>같은 패키지의 <code>tone="ai"</code> 변형입니다.</p>
    </ConceptCard>

    <p class="mt-6 mb-2 text-slate-600">
      아래 수식(<strong>MathBlock</strong>, KaTeX)도 패키지에서 렌더됩니다:
    </p>
    <MathBlock expr="e^{i\pi} + 1 = 0" />
  </main>
</template>
