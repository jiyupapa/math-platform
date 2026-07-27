<script setup lang="ts">
// 설명 카드. 종류(tone)에 따라 색상이 달라진다.
// 사용 예: <ConceptCard tone="tip" title="핵심"> ... </ConceptCard>
//
// anchorId(선택) = 협업 주석 앵커(P0 임의 항목). 콘텐츠가 명시적 ID 를 넘기면
// 제목 옆에 💬 NoteMarker 가 붙는다 (partNumberKey 주입 + 로그인 시에만 렌더).
// 네이밍 정본 {chapter}-{type}-{slug} — 규칙·금지사항은 anchor.ts 참조.
// 사용 예: <ConceptCard tone="ai" title="…" anchor-id="ch6-concept-qkv">
import NoteMarker from './NoteMarker.vue'
import { anchorChapter } from './anchor'

type Tone = 'note' | 'tip' | 'warn' | 'goal' | 'ai'

const props = withDefaults(
  defineProps<{ tone?: Tone; title?: string; anchorId?: string; anchorLabel?: string }>(),
  { tone: 'note' },
)

// 테두리 색은 왼쪽 막대에만 보인다(border-l-4) — 200 은 막대로선 흐려 400 계열을 쓴다.
// note 는 흰 배경을 유지한다 — 페이지 배경이 slate-50 이라 slate-50 카드는 사라진다.
const styles: Record<Tone, { box: string; icon: string }> = {
  note: { box: 'border-slate-300 bg-white', icon: '📘' },
  tip: { box: 'border-emerald-400 bg-emerald-50', icon: '💡' },
  warn: { box: 'border-amber-400 bg-amber-50', icon: '⚠️' },
  goal: { box: 'border-indigo-400 bg-indigo-50', icon: '🎯' },
  ai: { box: 'border-violet-400 bg-violet-50', icon: '🤖' },
}

const style = styles[props.tone]
</script>

<template>
  <!-- 형태로 역할을 가른다: 설명 카드(읽는 것) = 왼쪽 막대 + 옅은 배경, 전체 테두리 없음.
       문제/노트북 카드(하는 것) = 사방 테두리 상자(Quiz·StepQuiz·QuizSet·NotebookCard).
       이전엔 둘 다 `rounded-xl border p-5` 라 색조만 다른 같은 상자가 20개씩 이어졌다. -->
  <div class="my-5 rounded-r-xl border-l-4 py-4 pr-5 pl-5" :class="style.box">
    <h3 v-if="title || anchorId" class="mb-2 flex items-center gap-2 font-semibold">
      <span v-if="title">{{ style.icon }}</span>
      <span v-if="title">{{ title }}</span>
      <NoteMarker
        v-if="anchorId"
        :item-id="anchorId"
        :chapter="anchorChapter(anchorId)"
        :label="anchorLabel ?? title ?? anchorId"
      />
    </h3>
    <div class="leading-relaxed text-slate-700">
      <slot />
    </div>
  </div>
</template>
