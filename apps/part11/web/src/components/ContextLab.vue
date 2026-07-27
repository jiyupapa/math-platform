<script setup lang="ts">
// 10장 실험실 — 컨텍스트 예산(책상 위 서류 더미) 냅색 게임: 예산 8,000토큰 안에서 무엇을 올려둘까.
// 완전 해석적·결정적(난수 없음). 기여 점수는 교육용 toy 모형이며, 최적 조합·예산 스윕 값은
// 노트북(ch10_context.ipynb)의 전수 탐색과 일치한다(assert). 시작 상태는 "다 끌고 다니는 습관"(9,600토큰 과적재).
import { ref, computed } from 'vue'

const BUDGET = 8000

const MANDATORY = [
  { name: '시스템 규칙', tokens: 600, score: 15 },
  { name: '과업 설명', tokens: 400, score: 18 },
]

type TrajMode = 'full' | 'summary' | 'none'
const TRAJ: Record<TrajMode, { label: string; tokens: number; score: number }> = {
  full: { label: '원본 (3,600tk · +20)', tokens: 3600, score: 20 },
  summary: { label: '요약 (900tk · +14)', tokens: 900, score: 14 },
  none: { label: '제외', tokens: 0, score: 0 },
}

interface OptItem {
  key: string
  name: string
  tokens: number
  score: number
}
const OPTS: OptItem[] = [
  { key: 'A', name: '관련 문서 A (핵심 사양서)', tokens: 1500, score: 16 },
  { key: 'B', name: '관련 문서 B (참고 지침)', tokens: 1500, score: 9 },
  { key: 'C', name: '관련 문서 C (관련성 낮음)', tokens: 1500, score: 4 },
  { key: 'E1', name: '모범 예시 1개', tokens: 1200, score: 11 },
  { key: 'E2', name: '예시 2개째 (수확 체감)', tokens: 1200, score: 5 },
  { key: 'JUNK', name: '잡동사니 — 지난 잡담 로그', tokens: 800, score: -3 },
]

const trajMode = ref<TrajMode>('full')
const on = ref<Record<string, boolean>>({ A: true, B: true, C: false, E1: true, E2: false, JUNK: true })

const tokens = computed(
  () =>
    1000 +
    TRAJ[trajMode.value].tokens +
    OPTS.reduce((s, o) => s + (on.value[o.key] ? o.tokens : 0), 0),
)
const score = computed(
  () =>
    33 +
    TRAJ[trajMode.value].score +
    OPTS.reduce((s, o) => s + (on.value[o.key] ? o.score : 0), 0),
)
const over = computed(() => tokens.value > BUDGET)
const isOptimal = computed(
  () =>
    !over.value &&
    trajMode.value === 'summary' &&
    on.value.A && on.value.B && !on.value.C && on.value.E1 && on.value.E2 && !on.value.JUNK,
)

const density = (o: { tokens: number; score: number }) => (o.score / o.tokens) * 1000

function setOptimal() {
  trajMode.value = 'summary'
  on.value = { A: true, B: true, C: false, E1: true, E2: true, JUNK: false }
}
function resetStart() {
  trajMode.value = 'full'
  on.value = { A: true, B: true, C: false, E1: true, E2: false, JUNK: true }
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 예산 게이지 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 책상 크기 — 컨텍스트 예산 8,000토큰</p>
    <div class="mb-1 h-4 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
      <div
        class="h-full rounded-full transition-all"
        :class="over ? 'bg-rose-500' : 'bg-indigo-500'"
        :style="{ width: Math.min((tokens / BUDGET) * 100, 100) + '%' }"
      />
    </div>
    <p class="mb-4 text-sm" :class="over ? 'font-semibold text-rose-700' : 'text-slate-500'">
      {{ tokens.toLocaleString() }} / {{ BUDGET.toLocaleString() }} 토큰
      <template v-if="over"> — 예산 초과! 책상이 넘칩니다. 무언가를 내려놓으세요.</template>
    </p>

    <!-- ② 항목 고르기 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">② 책상 위에 올릴 것 고르기 (배지 = 기여 밀도, 점/1k토큰)</p>
    <div class="space-y-1.5 rounded-lg bg-slate-50 p-3 text-sm">
      <div v-for="m in MANDATORY" :key="m.name" class="flex items-center gap-2 text-slate-500">
        <input type="checkbox" checked disabled class="h-4 w-4 accent-slate-400" />
        <span class="flex-1">{{ m.name }} <span class="text-xs text-slate-500">(필수)</span></span>
        <span class="font-mono text-xs">{{ m.tokens.toLocaleString() }}tk · +{{ m.score }}</span>
      </div>

      <div class="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-2">
        <span class="text-slate-700">이전 궤적(지금까지의 작업 기록)</span>
        <span class="rounded-full bg-amber-100 px-1.5 text-xs font-semibold text-amber-700">밀도 {{ density(TRAJ.full).toFixed(1) }} / 요약 시 {{ density(TRAJ.summary).toFixed(1) }}</span>
        <div class="ml-auto flex gap-1">
          <button
            v-for="(v, k) in TRAJ"
            :key="k"
            type="button"
            class="rounded-lg border px-2 py-0.5 text-xs transition-colors"
            :class="trajMode === k ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-white'"
            @click="trajMode = k as TrajMode"
          >
            {{ v.label }}
          </button>
        </div>
      </div>

      <div v-for="o in OPTS" :key="o.key" class="flex items-center gap-2">
        <input v-model="on[o.key]" type="checkbox" class="h-4 w-4 accent-indigo-600" />
        <span class="flex-1" :class="o.score < 0 ? 'text-rose-700' : 'text-slate-700'">{{ o.name }}</span>
        <span
          class="rounded-full px-1.5 text-xs font-semibold"
          :class="o.score < 0 ? 'bg-rose-100 text-rose-700' : density(o) >= 9 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
        >밀도 {{ density(o).toFixed(1) }}</span>
        <span class="w-28 shrink-0 text-right font-mono text-xs text-slate-500">{{ o.tokens.toLocaleString() }}tk · {{ o.score > 0 ? '+' : '' }}{{ o.score }}</span>
      </div>
    </div>

    <!-- ③ 점수판 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">③ 과업 성공 점수 (교육용 toy 모형 — 실전은 빼 보고 재는 실측)</p>
    <p
      class="rounded-md px-3 py-2 text-sm font-medium"
      :class="over ? 'bg-rose-50 text-rose-800' : isOptimal ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'"
    >
      <template v-if="over">🚫 예산 초과 — 점수 무효. 모델에 넣을 수 없는 구성입니다.</template>
      <template v-else-if="isOptimal">🏆 {{ score }}점 — 8,000토큰 예산의 최적 조합! 원본 궤적(+20)을 버리고 요약(+14)을 고른 게 열쇠였어요.</template>
      <template v-else>현재 {{ score }}점 — 더 올릴 수 있을까요? (힌트: 밀도 배지)</template>
    </p>

    <!-- ④ 버튼 -->
    <div class="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
        @click="setOptimal"
      >
        🏆 최적 조합 보기 (전수 탐색 결과)
      </button>
      <button
        type="button"
        class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        @click="resetStart"
      >
        ↺ 처음처럼 (다 끌고 다니는 습관)
      </button>
    </div>
    <p class="mt-2 text-xs text-slate-500">
      밀도 높은 것부터 담는 감각이 대체로 통하지만, 칸이 딱 안 맞을 땐 최적과 어긋날 수 있어요
      (이런 문제의 정식 이름: 배낭 문제 knapsack — 여기선 전수 탐색으로 확정).
    </p>
  </div>
</template>
