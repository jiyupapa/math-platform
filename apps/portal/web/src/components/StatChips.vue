<script setup lang="ts">
// 스탯 칩 — 소개용 "숫자 한 장" (실측값, data/stats.ts).
import { stats } from '../data/stats'
</script>

<template>
  <section aria-label="플랫폼 요약 통계" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <div
      v-for="s in stats"
      :key="s.label"
      class="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200"
    >
      <p class="text-2xl font-bold text-indigo-600">{{ s.value }}</p>
      <p class="mt-0.5 text-sm font-semibold text-slate-800">{{ s.label }}</p>
      <p class="mt-1 text-xs leading-tight text-slate-500">{{ s.sub }}</p>
    </div>
  </section>
</template>
