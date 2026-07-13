<script setup lang="ts">
// 3장 실험실 — 라우터가 매긴 "계산 도구 신뢰도 점수"에 임계값을 대 보며
// 놓침(필요한데 안 씀)과 헛발(불필요한데 씀)의 저울질을 목격한다.
// 완전 결정적: 질문 20개·점수 전부 하드코딩 — 노트북(ch03_tools.ipynb)과 동일 데이터.
import { ref, computed } from 'vue'

type Kind = 'calc' | 'search' | 'plain'
interface Item {
  t: string
  k: Kind
  s: number
}

// 가상 질문 20개 — 계산 필요 8 / 검색 필요 6 / 그냥 답 6 (점수는 라우터의 확신)
const ITEMS: Item[] = [
  { t: '1,247 × 38은 얼마지?', k: 'calc', s: 0.97 },
  { t: '월 매출 3.2억이 12% 성장하면 내년은?', k: 'calc', s: 0.92 },
  { t: '회의실 대여료 시간당 45,000원, 6.5시간이면?', k: 'calc', s: 0.88 },
  { t: '환율 1,383원일 때 2,900달러는 원화로?', k: 'calc', s: 0.83 },
  { t: '작년 1,240에서 올해 1,517 — 몇 % 늘었는지 계산해 줘', k: 'calc', s: 0.74 },
  { t: '세 분기 성장률 4%, 7%, 5.5%의 평균 구해줘', k: 'calc', s: 0.61 },
  { t: '이 숫자들 합계가 맞는지 봐줘', k: 'calc', s: 0.48 },
  { t: '인원 23명이 3개 조로 나뉘면 조당 몇 명꼴?', k: 'calc', s: 0.42 },
  { t: '다음 주 서울 날씨 어때?', k: 'search', s: 0.03 },
  { t: '경쟁사 신제품 출시일이 언제였지?', k: 'search', s: 0.06 },
  { t: '최신 환율이 얼마야?', k: 'search', s: 0.55 },
  { t: '우리 회사 연차 규정 알려줘', k: 'search', s: 0.09 },
  { t: '그 보고서 원본 링크 찾아줘', k: 'search', s: 0.05 },
  { t: '업계 평균 이직률 통계 찾아봐', k: 'search', s: 0.52 },
  { t: '회의 내용 요약 좀 해줘', k: 'plain', s: 0.04 },
  { t: '이 문장 더 정중하게 다듬어줘', k: 'plain', s: 0.02 },
  { t: '보고서 제목 아이디어 3개만', k: 'plain', s: 0.07 },
  { t: '숫자 감각이라는 표현이 무슨 뜻이야?', k: 'plain', s: 0.31 },
  { t: '발표 순서 추천해줘', k: 'plain', s: 0.08 },
  { t: '퍼센트포인트가 뭐야?', k: 'plain', s: 0.38 },
]

const KIND_LABEL: Record<Kind, string> = { calc: '계산', search: '검색', plain: '일반' }

const threshold = ref(0.5)

type Status = 'tp' | 'fn' | 'fp' | 'tn'
function statusOf(it: Item, t: number): Status {
  const need = it.k === 'calc'
  const call = it.s >= t
  if (need && call) return 'tp'
  if (need && !call) return 'fn'
  if (!need && call) return 'fp'
  return 'tn'
}

const rows = computed(() => ITEMS.map((it) => ({ ...it, st: statusOf(it, threshold.value) })))
const agg = computed(() => {
  const c = { tp: 0, fn: 0, fp: 0, tn: 0 }
  for (const r of rows.value) c[r.st]++
  return { ...c, ok: c.tp + c.tn }
})

// 점수 구간별 실제 계산 문제 비율 (교정 미리보기)
const showCal = ref(false)
const BINS: [number, number][] = [
  [0, 0.2],
  [0.2, 0.4],
  [0.4, 0.6],
  [0.6, 0.8],
  [0.8, 1.01],
]
const calRows = computed(() =>
  BINS.map(([lo, hi]) => {
    const items = ITEMS.filter((q) => q.s >= lo && q.s < hi)
    const pos = items.filter((q) => q.k === 'calc').length
    return { label: `${lo.toFixed(1)}~${Math.min(hi, 1).toFixed(1)}`, pos, n: items.length }
  }),
)

const STATUS_TEXT: Record<Status, string> = {
  tp: '호출 ✓',
  tn: '패스 ✓',
  fn: '놓침',
  fp: '헛발',
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 임계값 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">
      ① 임계값 다이얼 — 신뢰도 점수가 이 값 이상이면 계산 도구를 호출합니다
    </p>
    <div class="mb-1 flex items-center gap-3">
      <input v-model.number="threshold" type="range" min="0" max="1" step="0.01" class="flex-1 accent-indigo-600" />
      <span class="w-14 shrink-0 text-right font-mono text-sm font-bold text-indigo-700">{{ threshold.toFixed(2) }}</span>
    </div>
    <div class="mb-4 flex flex-wrap gap-1.5 text-xs">
      <button
        v-for="v in [0.4, 0.5, 0.58]"
        :key="v"
        type="button"
        class="rounded-lg border border-slate-200 px-2 py-0.5 text-slate-600 hover:bg-slate-50"
        @click="threshold = v"
      >
        {{ v.toFixed(2) }} 로
      </button>
      <span class="self-center text-slate-400">— 세 지점을 오가며 오류의 종류를 비교해 보세요</span>
    </div>

    <!-- ② 질문 20개 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">② 오늘 들어온 질문 20개 — 라우터의 확신 점수와 판정</p>
    <div class="max-h-72 space-y-1 overflow-y-auto rounded-lg bg-slate-50 p-3">
      <div
        v-for="(r, i) in rows"
        :key="i"
        class="flex items-center gap-2 rounded-md px-2 py-1 text-xs"
        :class="r.st === 'fn' ? 'bg-rose-50' : r.st === 'fp' ? 'bg-amber-50' : 'bg-white'"
      >
        <span
          class="w-9 shrink-0 rounded px-1 py-0.5 text-center font-semibold"
          :class="r.k === 'calc' ? 'bg-indigo-100 text-indigo-700' : r.k === 'search' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'"
        >{{ KIND_LABEL[r.k] }}</span>
        <span class="min-w-0 flex-1 truncate text-slate-700" :title="r.t">{{ r.t }}</span>
        <div class="h-2 w-20 shrink-0 overflow-hidden rounded bg-slate-200">
          <div class="h-full rounded" :class="r.s >= threshold ? 'bg-indigo-400' : 'bg-slate-400'" :style="{ width: r.s * 100 + '%' }" />
        </div>
        <span class="w-9 shrink-0 text-right font-mono text-slate-500">{{ r.s.toFixed(2) }}</span>
        <span
          class="w-12 shrink-0 text-right font-semibold"
          :class="r.st === 'fn' ? 'text-rose-600' : r.st === 'fp' ? 'text-amber-600' : 'text-emerald-600'"
        >{{ STATUS_TEXT[r.st] }}</span>
      </div>
    </div>

    <!-- ③ 집계 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">③ 집계 — 미니 혼동 행렬</p>
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="overflow-hidden rounded-lg ring-1 ring-slate-200">
        <table class="w-full text-center text-sm">
          <thead>
            <tr class="bg-slate-100 text-xs text-slate-500">
              <th class="px-2 py-1.5 font-medium"></th>
              <th class="px-2 py-1.5 font-medium">도구 호출</th>
              <th class="px-2 py-1.5 font-medium">패스</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t border-slate-100">
              <td class="bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-500">계산 필요 (8)</td>
              <td class="px-2 py-1.5 font-bold text-emerald-700">{{ agg.tp }}</td>
              <td class="px-2 py-1.5 font-bold text-rose-600">{{ agg.fn }} 놓침</td>
            </tr>
            <tr class="border-t border-slate-100">
              <td class="bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-500">불필요 (12)</td>
              <td class="px-2 py-1.5 font-bold text-amber-600">{{ agg.fp }} 헛발</td>
              <td class="px-2 py-1.5 font-bold text-emerald-700">{{ agg.tn }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex flex-col justify-center rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        <p>
          20개 중 올바른 판정 <b class="text-emerald-700">{{ agg.ok }}개</b> —
          놓침 <b class="text-rose-600">{{ agg.fn }}</b> · 헛발 <b class="text-amber-600">{{ agg.fp }}</b>
        </p>
        <p class="mt-1 text-xs text-slate-500">
          <template v-if="agg.fn === 0 && agg.fp === 0">완벽 — 하지만 이 데이터에선 불가능할 텐데요…?</template>
          <template v-else-if="agg.fn === 0">놓침 0 — 대신 헛발을 감수한 설정입니다.</template>
          <template v-else-if="agg.fp === 0">헛발 0 — 대신 놓침을 감수한 설정입니다.</template>
          <template v-else>두 오류가 공존 — 임계값을 움직여 저울질해 보세요.</template>
        </p>
      </div>
    </div>

    <!-- ④ 교정 미리보기 -->
    <label class="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input v-model="showCal" type="checkbox" class="h-4 w-4 accent-indigo-600" />
      <span><b>점수 구간별 실제 비율 보기</b> — 점수를 확률처럼 읽어도 될까 (교정 미리보기)</span>
    </label>
    <div v-if="showCal" class="mt-2 space-y-1.5 rounded-md bg-amber-50 px-3 py-2">
      <div v-for="row in calRows" :key="row.label" class="flex items-center gap-2 text-sm text-amber-900">
        <span class="w-20 shrink-0 text-right font-mono text-xs">{{ row.label }}</span>
        <div class="h-3.5 flex-1 overflow-hidden rounded bg-white/70">
          <div class="h-full rounded bg-amber-400" :style="{ width: (row.n ? (row.pos / row.n) * 100 : 0) + '%' }" />
        </div>
        <span class="w-24 shrink-0 font-mono text-xs">{{ row.pos }}/{{ row.n }}{{ row.n ? ` (${Math.round((row.pos / row.n) * 100)}%)` : '' }}</span>
      </div>
      <p class="pt-1 text-xs text-amber-800">
        점수 0.4~0.6 구간의 질문은 실제로 <b>절반(2/4)</b>만 계산 문제 — 점수가 "실제로 맞을
        확률"과 얼추 맞아떨어질 때 <b>교정이 잘 됐다</b>고 합니다(본문 3절).
      </p>
    </div>
  </div>
</template>
