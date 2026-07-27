<script setup lang="ts">
// ch10 캡스톤 — 사내 FAQ 검색봇 전체 조립: 임베딩 → 코사인 → top-k → 그라운딩 답변.
// 실험① 시운전(질문 프리셋 → 전 단계 투명 공개), 실험② 자동 성적표(recall + 정직성).
// 오프라인·결정적 (toy 10차원 주제 축 임베딩, 질문은 프리셋 — 자유 입력은 임베딩 모델이 필요).
import { computed, ref } from 'vue'

// ── 인덱싱 파이프라인 (미리 해 둔 준비 — 7·6장) ────────────────
// 주제 축 10개: 결혼 장례 카드 연차 재택 보안 동호회 교육 절차 행사
const DIM = 10
function embed(w: Record<number, number>) {
  const v = Array(DIM).fill(0)
  for (const [k, val] of Object.entries(w)) v[+k] = val
  const n = Math.hypot(...v)
  return v.map((x) => x / n) // 정규화 — 코사인 = 내적 (2장)
}
const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0)

interface Doc {
  id: number
  title: string
  text: string
  vec: number[]
}
const DB: Doc[] = [
  { id: 1, title: '경조사 규정 > 제1조(결혼)', text: '결혼 축하금 50만 원을 지급한다. 단, 근속 1년 이상.', vec: embed({ 0: 1, 8: 0.1 }) },
  { id: 2, title: '경조사 규정 > 제2조(장례)', text: '장례 지원금 100만 원과 상조 서비스를 지원한다.', vec: embed({ 1: 1 }) },
  { id: 3, title: '경비 규정 > 제3조(법인카드)', text: '법인카드 사용분은 매월 5일까지 경비 시스템에 등록한다.', vec: embed({ 2: 1, 8: 0.2 }) },
  { id: 4, title: '인사 규정 > 제7조(연차)', text: '연차·반차는 인사 포털에서 결재선을 지정해 신청한다.', vec: embed({ 3: 1, 8: 0.3 }) },
  { id: 5, title: '인사 규정 > 제9조(재택근무)', text: '재택근무는 주 2회까지, 팀장 사전 승인으로 운영한다.', vec: embed({ 4: 1, 3: 0.15, 8: 0.2 }) },
  { id: 6, title: '보안 규정 > 제4조(VPN)', text: 'VPN 오류 코드 403은 사내망 인증서 갱신으로 해결한다.', vec: embed({ 5: 1 }) },
  { id: 7, title: '복지 규정 > 제5조(동호회)', text: '동호회는 분기별 20만 원의 활동비를 지원한다.', vec: embed({ 6: 1 }) },
  { id: 8, title: '교육 규정 > 제2조(외부 교육)', text: '외부 교육은 연 100만 원 한도, 사전 승인 후 수강한다.', vec: embed({ 7: 1, 8: 0.2 }) },
]

// ── 질문 프리셋 (toy 임베딩 좌표 포함) ─────────────────────────
interface Query {
  text: string
  vec: number[]
  expect: number | null // 정답 문서 id (부재 질문은 null)
  badge?: string
}
const QUERIES: Query[] = [
  { text: '결혼 축하금은 얼마인가요?', vec: embed({ 0: 0.95, 8: 0.15 }), expect: 1 },
  { text: '쉬는 날 미리 쓰려면 어디서 해요?', vec: embed({ 3: 0.85, 8: 0.3 }), expect: 4, badge: '문서와 겹치는 단어 0개 — 워밍업의 그 질문' },
  { text: '법인카드 정산 마감이 언제죠?', vec: embed({ 2: 0.9, 8: 0.25 }), expect: 3 },
  { text: '재택은 일주일에 며칠까지 되나요?', vec: embed({ 4: 0.9, 3: 0.1 }), expect: 5 },
  { text: '외부 강의 수강하면 지원 되나요?', vec: embed({ 7: 0.88, 8: 0.2 }), expect: 8 },
  { text: '올해 겨울 워크숍은 언제인가요?', vec: embed({ 9: 1, 8: 0.15 }), expect: null, badge: '문서에 없는 질문 — 정직성 테스트' },
]

const FLOOR = 0.5
const K = 3

function runBot(q: Query) {
  const ranked = DB.map((d) => ({ doc: d, score: dot(q.vec, d.vec) })).sort((a, b) => b.score - a.score)
  const top = ranked.slice(0, K)
  const grounded = top[0].score >= FLOOR
  const answer = grounded
    ? `${top[0].doc.text} (출처: ${top[0].doc.title})`
    : '문서에서 찾지 못했습니다. 담당 부서에 문의해 주세요.'
  return { top, grounded, answer }
}

const qIdx = ref<number | null>(null)
const result = computed(() => (qIdx.value === null ? null : runBot(QUERIES[qIdx.value])))
const query = computed(() => (qIdx.value === null ? null : QUERIES[qIdx.value]))

const promptText = computed(() => {
  if (!result.value || !result.value.grounded || !query.value) return ''
  return (
    '아래 사내 문서에 근거해서만 답하세요. 없으면 "문서에서 찾지 못했습니다"라고 답하세요. 출처를 표기하세요.\n' +
    result.value.top.map((t, i) => `[문서${i + 1}] ${t.doc.title} — ${t.doc.text}`).join('\n') +
    `\n[질문] ${query.value.text}`
  )
})

// ── 실험② 자동 성적표 ─────────────────────────────────────────
const graded = ref(false)
const scorecard = computed(() => {
  const evalSet = QUERIES.filter((q) => q.expect !== null)
  const rows = evalSet.map((q) => {
    const { top } = runBot(q)
    const rank = top.findIndex((t) => t.doc.id === q.expect) + 1 // 0이면 top-3 밖
    return { q: q.text, rank: rank === 0 ? '4+' : rank, hit1: rank === 1, hit3: rank >= 1 && rank <= 3 }
  })
  const honest = runBot(QUERIES[5])
  return {
    rows,
    r1: rows.filter((r) => r.hit1).length / rows.length,
    r3: rows.filter((r) => r.hit3).length / rows.length,
    honest: !honest.grounded,
  }
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 시운전 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 시운전: 질문을 고르면 봇이 전 과정을 공개하며 답합니다</p>
    <p class="mb-3 text-xs text-slate-500">
      사내 FAQ 조각 {{ DB.length }}건이 인덱싱되어 있습니다(조항 청킹 + 제목 붙이기 + 정규화 임베딩 완료).
      질문은 프리셋 — 자유 입력엔 진짜 임베딩 모델이 필요해요(노트북에서).
    </p>

    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="(q, i) in QUERIES"
        :key="i"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
        :class="qIdx === i ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
        @click="qIdx = i"
      >
        {{ q.text }}
      </button>
    </div>

    <div v-if="result && query" class="space-y-3">
      <p v-if="query.badge" class="rounded-lg bg-amber-50 p-2.5 text-xs font-medium text-amber-800">🏷️ {{ query.badge }}</p>

      <!-- 단계 1: 임베딩 -->
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="mb-1 text-xs font-bold text-slate-500">① 질문 임베딩 (워밍업·9장) — 뜻을 좌표로, 정규화 완료</p>
        <p class="font-mono text-xs text-slate-600">[{{ query.vec.map((v) => v.toFixed(2)).join(', ') }}]</p>
      </div>

      <!-- 단계 2: 검색 -->
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="mb-2 text-xs font-bold text-slate-500">② 검색 — 코사인(=내적, 2장) top-{{ K }} (6장: 8건이라 전수조사면 충분)</p>
        <div v-for="(t, i) in result.top" :key="t.doc.id" class="mb-1 flex items-center gap-2 text-xs">
          <span class="w-7 shrink-0 font-bold" :class="i === 0 ? 'text-amber-700' : 'text-slate-500'">{{ i + 1 }}위</span>
          <span class="w-44 shrink-0 truncate text-slate-600">{{ t.doc.title }}</span>
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div class="h-full rounded-full" :class="t.score >= FLOOR ? 'bg-indigo-500' : 'bg-slate-300'" :style="{ width: Math.max(0, t.score) * 100 + '%' }" />
          </div>
          <span class="w-10 shrink-0 text-right font-mono text-slate-600">{{ t.score.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 단계 3: 그라운딩 프롬프트 (부재 시 대신 바닥 안내) -->
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="mb-1 text-xs font-bold text-slate-500">③ 그라운딩 프롬프트 조립 (8장)</p>
        <pre v-if="result.grounded" class="max-h-36 overflow-auto rounded-lg bg-white p-2.5 text-xs leading-relaxed whitespace-pre-wrap text-slate-600 ring-1 ring-slate-200">{{ promptText }}</pre>
        <p v-else class="text-xs text-rose-700">
          1위 점수({{ result.top[0].score.toFixed(2) }})가 바닥(4장의 그 바닥) 수준 — 재료가 없으므로 조립을 건너뛰고 정직하게 답합니다.
        </p>
      </div>

      <!-- 단계 4: 답변 -->
      <div class="rounded-lg p-3" :class="result.grounded ? 'bg-emerald-50' : 'bg-amber-50'">
        <p class="mb-1 text-xs font-bold" :class="result.grounded ? 'text-emerald-700' : 'text-amber-700'">④ 답변 (생성은 6부의 조련된 LLM — 여기선 1위 조각 기반 흉내)</p>
        <p class="text-sm font-medium" :class="result.grounded ? 'text-emerald-800' : 'text-amber-800'">🤖 {{ result.answer }}</p>
      </div>
    </div>
    <p v-else class="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">👆 질문을 골라 봇을 돌려 보세요</p>

    <!-- ② 성적표 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 만들었으면 채점한다 (7장의 정신)</p>
    <p class="mb-3 text-xs text-slate-500">평가 세트(정답 문서가 있는 질문 5개 + 부재 질문 1개)로 봇을 자동 채점합니다.</p>

    <button
      v-if="!graded"
      type="button"
      class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
      @click="graded = true"
    >
      📋 자동 채점 실행
    </button>

    <div v-else>
      <div class="space-y-1">
        <div v-for="r in scorecard.rows" :key="r.q" class="flex items-center gap-2 rounded-lg p-1.5 text-xs" :class="r.hit1 ? 'bg-emerald-50' : 'bg-amber-50'">
          <span class="w-6 shrink-0 text-center">{{ r.hit1 ? '✓' : '△' }}</span>
          <span class="min-w-0 flex-1 truncate text-slate-600">{{ r.q }}</span>
          <span class="shrink-0 font-mono text-slate-500">정답이 {{ r.rank }}위</span>
        </div>
        <div class="flex items-center gap-2 rounded-lg p-1.5 text-xs" :class="scorecard.honest ? 'bg-emerald-50' : 'bg-rose-50'">
          <span class="w-6 shrink-0 text-center">{{ scorecard.honest ? '✓' : '✗' }}</span>
          <span class="min-w-0 flex-1 truncate text-slate-600">부재 질문(겨울 워크숍)에 지어내지 않고 모른다고 답했나</span>
          <span class="shrink-0 font-mono text-slate-500">{{ scorecard.honest ? '정직' : '환각!' }}</span>
        </div>
      </div>
      <div class="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
        <div class="text-center">
          <p class="text-xs text-slate-500">recall@1</p>
          <p class="font-mono text-xl font-bold text-emerald-700">{{ Math.round(scorecard.r1 * 100) }}%</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-slate-500">recall@3</p>
          <p class="font-mono text-xl font-bold text-emerald-700">{{ Math.round(scorecard.r3 * 100) }}%</p>
        </div>
        <p class="flex-1 text-xs leading-relaxed text-slate-500">
          toy 지도라 만점에 가깝습니다 — 실전에서는 이 성적표를 <b>수십~수백 문항</b>(7장)으로 만들고,
          점수가 떨어지는 문항을 따라 청킹·임베딩·k를 다듬는 <b>반복</b>이 곧 RAG 개발입니다.
        </p>
      </div>
    </div>
  </div>
</template>
