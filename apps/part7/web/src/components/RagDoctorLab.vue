<script setup lang="ts">
// ch8 인터랙티브 — ① 갈림길 게임: 요구사항을 조련(6부)/RAG(7부)로 배치 (규칙 8 — 두 길의 구도)
//                 ② RAG 진료실: 실패 사례의 증상·로그를 보고 범인(실패 모드)을 진단.
// 오프라인·결정적.
import { computed, ref } from 'vue'

// ── ① 갈림길 게임 ──────────────────────────────────────────────
interface Req {
  text: string
  answer: 'rag' | 'tame'
  why: string
}
const REQS: Req[] = [
  { text: '매주 바뀌는 출장비 규정을 정확히 답하게', answer: 'rag', why: '자주 갱신되는 지식 — 문서만 고치면 즉시 반영되는 RAG의 홈그라운드입니다.' },
  { text: '답변을 우리 회사 공문 말투로 쓰게', answer: 'tame', why: '말투·형식은 행동 양식 — 가중치에 새기는 조련(SFT, 6부 3장)의 영역입니다.' },
  { text: '모든 답변에 근거 문서 링크를 달게', answer: 'rag', why: '출처 표시는 어떤 문서를 건넸는지 아는 RAG만 할 수 있습니다.' },
  { text: '상담 응대 순서(사과→해결→안내)가 몸에 배게', answer: 'tame', why: '일관된 행동 패턴은 시범을 보여 새기는 조련의 일 — 문서를 건넨다고 생기지 않아요.' },
  { text: '어제 올라온 회의록 내용을 답하게', answer: 'rag', why: '최신 문서 지식 — 재훈련 없이 인덱싱만 하면 되는 RAG입니다.' },
  { text: '보안 규정 위반 요청은 정중히 거절하게', answer: 'tame', why: '해야/하지 말아야 할 행동의 경계 — 정렬(alignment)이라 불리는 조련의 영역입니다(6부).' },
]
const picks = ref<(null | 'rag' | 'tame')[]>(REQS.map(() => null))
const doneCount = computed(() => picks.value.filter((p) => p !== null).length)
const correctCount = computed(() => picks.value.filter((p, i) => p === REQS[i].answer).length)

// ── ② RAG 진료실 ──────────────────────────────────────────────
type Culprit = 'retrieval' | 'chunk' | 'generation' | 'missing'
const CULPRITS: { key: Culprit; label: string }[] = [
  { key: 'retrieval', label: '검색 실패 — 정답 조각이 top-k에 없음' },
  { key: 'chunk', label: '조각 찢김 — 조건·문맥이 딴 조각에' },
  { key: 'generation', label: '생성 실패 — 조각이 왔는데 LLM이 무시' },
  { key: 'missing', label: '문서 부재 — 애초에 지식이 없음' },
]
interface Case {
  title: string
  q: string
  a: string
  log: string
  logTone: 'bad' | 'good' | 'partial'
  culprit: Culprit
  rx: string
}
const CASES: Case[] = [
  {
    title: '사례 1 — 자신만만한 오답',
    q: '경조 휴가는 며칠인가요?',
    a: '경조 휴가는 5일입니다. (실제 규정: 3일)',
    log: '검색된 조각: ① 연차 신청 안내 (0.41) ② 회의실 예약 방법 (0.28) ③ 출산 축하금 (0.24) — 경조 휴가 조각 없음',
    logTone: 'bad',
    culprit: 'retrieval',
    rx: '정답 조각이 아예 안 왔습니다 — 검색 실패. LLM은 재료가 없자 그럴듯하게 지어냈어요(환각). 처방: recall@k 측정 → 청킹·임베딩 개선, 그리고 "문서에 없으면 모른다고 답해" 지시 추가.',
  },
  {
    title: '사례 2 — 반쪽짜리 답',
    q: '결혼 축하금을 받으려면 어떻게 하나요?',
    a: '결혼 축하금 50만 원을 받을 수 있습니다. (근속 1년 조건 누락)',
    log: '검색된 조각: ① "결혼 축하금 50만 원을 지급한다." (0.87) — 단, "근속 1년 이상" 조건 문장은 딴 조각(0.31, top-k 밖)',
    logTone: 'partial',
    culprit: 'chunk',
    rx: '조각은 왔는데 조건이 찢어져 있었습니다(7장의 그 사고). 처방: 문장 단위 → 조항 단위 청킹 + 겹침(overlap), 조각에 상위 제목 붙이기.',
  },
  {
    title: '사례 3 — 재료를 무시하는 요리사',
    q: '법인카드 정산 마감일은 언제인가요?',
    a: '일반적으로 회사마다 다르지만 보통 월말인 경우가 많습니다.',
    log: '검색된 조각: ① "법인카드 정산 — 매월 5일까지 경비 시스템에 등록" (0.88, 1등) — 정답 조각이 제대로 도착!',
    logTone: 'good',
    culprit: 'generation',
    rx: '재료는 완벽하게 왔는데 LLM이 문맥을 무시하고 일반론을 폈습니다 — 생성 실패. 처방: 프롬프트 지시 강화("아래 문서에 근거해서만 답하라"), 조각 포맷 정리 — 그라운딩의 문제입니다.',
  },
  {
    title: '사례 4 — 없는 것을 묻다',
    q: '올해 겨울 워크숍은 언제인가요?',
    a: '12월 둘째 주로 예정되어 있습니다. (그런 문서 없음)',
    log: '검색된 조각: ① 작년 봄 워크숍 후기 (0.31) ② 동호회 지원 안내 (0.22) — 전부 낮은 점수의 무관 문서',
    logTone: 'bad',
    culprit: 'missing',
    rx: '애초에 답이 될 문서가 없습니다 — 지식 부재인데 LLM이 지어냈어요. 처방: "모르면 모른다고 답해" 지시(그라운딩) + 문서 등록 프로세스 마련. 검색 개선으로는 못 고칩니다.',
  },
]
const caseIdx = ref(0)
const diagnosis = ref<Culprit | null>(null)
const curCase = computed(() => CASES[caseIdx.value])
function pickCase(i: number) {
  caseIdx.value = i
  diagnosis.value = null
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 갈림길 게임 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 갈림길 게임: 이 요구는 조련인가, RAG인가</p>
    <p class="mb-3 text-xs text-slate-400">
      사내 챗봇 요구사항 6개입니다. 각각 어느 길로 풀어야 할까요? — 🐎 조련(가중치, 6부) / 🗺️ RAG(문맥, 7부)
    </p>

    <div class="space-y-2">
      <div v-for="(r, i) in REQS" :key="i" class="rounded-lg border border-slate-100 p-2.5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="min-w-0 flex-1 text-sm text-slate-700">{{ r.text }}</span>
          <div class="flex shrink-0 gap-1.5">
            <button
              type="button"
              class="rounded-lg px-2.5 py-1 text-xs font-semibold transition"
              :class="picks[i] === 'tame' ? (r.answer === 'tame' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
              :disabled="picks[i] !== null"
              @click="picks[i] = 'tame'"
            >
              🐎 조련
            </button>
            <button
              type="button"
              class="rounded-lg px-2.5 py-1 text-xs font-semibold transition"
              :class="picks[i] === 'rag' ? (r.answer === 'rag' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
              :disabled="picks[i] !== null"
              @click="picks[i] = 'rag'"
            >
              🗺️ RAG
            </button>
          </div>
        </div>
        <p v-if="picks[i] !== null" class="mt-1.5 rounded-lg p-2 text-xs leading-relaxed" :class="picks[i] === REQS[i].answer ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'">
          {{ picks[i] === REQS[i].answer ? '✅ 정답!' : `❌ 정답은 ${REQS[i].answer === 'rag' ? 'RAG' : '조련'}` }} — {{ r.why }}
        </p>
      </div>
    </div>

    <p v-if="doneCount === REQS.length" class="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">
      🏁 {{ correctCount }} / {{ REQS.length }} — 정리하면: <b>바뀌는 지식·출처가 필요한 사실은 RAG</b>,
      <b>말투·형식·행동의 경계는 조련</b>. 둘 다 필요하면 병행합니다(지식은 RAG로 건네고, 태도는 조련으로 새기고).
    </p>

    <!-- ② RAG 진료실 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — RAG 진료실: 틀린 답의 범인을 찾아라</p>
    <p class="mb-3 text-xs text-slate-400">
      실제 프로젝트에서 만나는 실패 사례 4건 — <b>검색 로그</b>가 결정적 증거입니다. 증상을 읽고 범인을 지목하세요.
    </p>

    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="(c, i) in CASES"
        :key="c.title"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
        :class="caseIdx === i ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
        @click="pickCase(i)"
      >
        {{ c.title.split(' — ')[0] }}
      </button>
    </div>

    <div class="rounded-lg bg-slate-50 p-4">
      <p class="mb-2 text-sm font-semibold text-slate-700">{{ curCase.title }}</p>
      <div class="space-y-1.5 text-sm">
        <p class="text-slate-600">🙋 질문: {{ curCase.q }}</p>
        <p class="text-slate-600">🤖 답변: <span class="text-rose-600">{{ curCase.a }}</span></p>
        <p class="rounded-lg bg-white p-2.5 text-xs leading-relaxed ring-1 ring-slate-200" :class="curCase.logTone === 'good' ? 'text-emerald-700' : 'text-slate-500'">
          📋 {{ curCase.log }}
        </p>
      </div>
    </div>

    <p class="mt-3 mb-1.5 text-xs font-semibold text-slate-500">🔍 범인은?</p>
    <div class="grid gap-1.5 sm:grid-cols-2">
      <button
        v-for="c in CULPRITS"
        :key="c.key"
        type="button"
        class="rounded-lg border p-2.5 text-left text-xs font-medium transition"
        :class="
          diagnosis === null
            ? 'border-slate-200 text-slate-600 hover:border-slate-300'
            : c.key === curCase.culprit
              ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
              : diagnosis === c.key
                ? 'border-rose-400 bg-rose-50 text-rose-700'
                : 'border-slate-100 text-slate-400'
        "
        :disabled="diagnosis !== null"
        @click="diagnosis = c.key"
      >
        {{ c.label }}
      </button>
    </div>

    <p v-if="diagnosis !== null" class="mt-3 rounded-lg p-3 text-sm leading-relaxed" :class="diagnosis === curCase.culprit ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'">
      {{ diagnosis === curCase.culprit ? '✅ 정확한 진단!' : '🤔 아쉽지만 —' }} {{ curCase.rx }}
    </p>
  </div>
</template>
