<script setup lang="ts">
// 학습 전↔후 향상도 — 최초 진단(기준선) 대비 최신 진단을 비교한다.
import { computed } from 'vue'
import type { DiagMetrics } from '../data/metrics'

const props = defineProps<{ before: DiagMetrics; after: DiagMetrics }>()

interface Row {
  label: string
  before: number
  after: number
  max: number
  /** 표시용 값 포맷 */
  fmt: (n: number) => string
}

const rows = computed<Row[]>(() => [
  { label: '정답', before: props.before.correct, after: props.after.correct, max: props.after.total, fmt: (n) => `${n}/${props.after.total}` },
  { label: '통과한 관문', before: props.before.gatesPassed, after: props.after.gatesPassed, max: 4, fmt: (n) => `${n}/4` },
  { label: '자신감', before: props.before.confidence, after: props.after.confidence, max: 5, fmt: (n) => `${Math.round(n * 10) / 10}/5` },
])

const pct = (v: number, max: number) => (max === 0 ? 0 : Math.round((v / max) * 100))
const delta = (r: Row) => Math.round((r.after - r.before) * 10) / 10
</script>

<template>
  <div class="rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200">
    <p class="mb-1 text-sm font-semibold text-slate-800">학습 전 → 후 향상도</p>
    <p class="mb-4 text-xs text-slate-400">최초 진단 대비 지금의 진단 결과입니다.</p>

    <div class="space-y-4">
      <div v-for="r in rows" :key="r.label">
        <div class="mb-1 flex items-center justify-between text-sm">
          <span class="font-medium text-slate-700">{{ r.label }}</span>
          <span class="flex items-center gap-2">
            <span class="text-slate-400">{{ r.fmt(r.before) }} → </span>
            <span class="font-semibold text-slate-900">{{ r.fmt(r.after) }}</span>
            <span
              v-if="delta(r) !== 0"
              class="rounded px-1.5 py-0.5 text-xs font-bold"
              :class="delta(r) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
            >{{ delta(r) > 0 ? '+' : '' }}{{ delta(r) }}</span>
          </span>
        </div>
        <!-- 전(회색) → 후(초록) 막대 -->
        <div class="space-y-1">
          <div class="h-2 overflow-hidden rounded-full bg-slate-100">
            <div class="h-full rounded-full bg-slate-300" :style="{ width: pct(r.before, r.max) + '%' }" />
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-slate-100">
            <div class="h-full rounded-full bg-emerald-500 transition-all" :style="{ width: pct(r.after, r.max) + '%' }" />
          </div>
        </div>
      </div>
    </div>
    <p class="mt-3 text-xs text-slate-400">위 막대 = 학습 전(회색) · 아래 막대 = 지금(초록)</p>
  </div>
</template>
