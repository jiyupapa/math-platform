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

const styles: Record<Tone, { box: string; icon: string }> = {
  note: { box: 'border-slate-200 bg-white', icon: '📘' },
  tip: { box: 'border-emerald-200 bg-emerald-50', icon: '💡' },
  warn: { box: 'border-amber-200 bg-amber-50', icon: '⚠️' },
  goal: { box: 'border-indigo-200 bg-indigo-50', icon: '🎯' },
  ai: { box: 'border-violet-200 bg-violet-50', icon: '🤖' },
}

const style = styles[props.tone]
</script>

<template>
  <div class="my-5 rounded-xl border p-5" :class="style.box">
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
