<script setup lang="ts">
// 접었다 펴는 "더 깊이 알아보기" 보조 카드.
// 기본 흐름은 가볍게 유지하고, 궁금한 학습자만 펼쳐 보도록 native <details> 사용(접근성·JS 불필요).
// 사용 예: <DetailsCard title="➕ 더 깊이 알아보기"> ... </DetailsCard>
withDefaults(defineProps<{ title?: string; open?: boolean }>(), {
  title: '➕ 더 깊이 알아보기',
  open: false,
})
</script>

<template>
  <details class="group my-5 rounded-xl border border-slate-200 bg-slate-50/60 p-0" :open="open">
    <summary
      class="flex cursor-pointer list-none items-center gap-2 rounded-xl px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
    >
      <span class="text-slate-400 transition-transform group-open:rotate-90">▸</span>
      <span>{{ title }}</span>
      <span class="ml-auto text-xs font-normal text-slate-400">(선택 — 궁금하면 펼치기)</span>
    </summary>
    <div class="border-t border-slate-200 px-5 py-4 leading-relaxed text-slate-700">
      <slot />
    </div>
  </details>
</template>
