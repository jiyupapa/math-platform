<script setup lang="ts">
// 설명 카드. 종류(tone)에 따라 색상이 달라진다.
// 사용 예: <ConceptCard tone="tip" title="핵심"> ... </ConceptCard>
type Tone = 'note' | 'tip' | 'warn' | 'goal' | 'ai'

const props = withDefaults(defineProps<{ tone?: Tone; title?: string }>(), {
  tone: 'note',
})

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
    <h3 v-if="title" class="mb-2 flex items-center gap-2 font-semibold">
      <span>{{ style.icon }}</span>
      <span>{{ title }}</span>
    </h3>
    <div class="leading-relaxed text-slate-700">
      <slot />
    </div>
  </div>
</template>
