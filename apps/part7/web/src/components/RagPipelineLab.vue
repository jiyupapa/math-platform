<script setup lang="ts">
// ch1 인터랙티브 — ① 키워드 vs 의미 검색 랭킹 비교(강점 지형)
//                 ② RAG 파이프라인 5단계 통과("검색이 프롬프트가 되기까지").
// 오프라인·결정적 — 점수는 미리 준비된 toy 값(재는 법 자체는 2장부터).
import { computed, ref } from 'vue'

// ── ① 검색 방식 비교 ──────────────────────────────────────────
const DOCS = [
  { id: 'A', title: '연차 신청 안내', text: '인사 포털에서 결재선 지정 후 제출' },
  { id: 'B', title: 'VPN 오류 코드 403', text: '사내망 인증서 갱신 필요' },
  { id: 'C', title: '법인카드 정산 안내', text: '매월 5일까지 경비 시스템에 등록' },
  { id: 'D', title: '회의실 예약 방법', text: '그룹웨어 캘린더에서 예약' },
  { id: 'E', title: '프린터 오류 해결', text: '용지 걸림 확인 후 재시도' },
]
interface SearchCase {
  text: string
  tag: string
  keyword: Record<string, number> // 겹치는 단어 수
  semantic: Record<string, number> // 의미 유사도 (0~1, toy)
  kwNote: string
  semNote: string
  kwGood: boolean
  semGood: boolean
}
const CASES: SearchCase[] = [
  {
    text: '쉬는 날 미리 쓰려면 어디에 얘기해야 하나요?',
    tag: '표현이 완전히 다른 질문',
    keyword: { A: 0, B: 0, C: 0, D: 0, E: 0 },
    semantic: { A: 0.86, B: 0.12, C: 0.31, D: 0.27, E: 0.15 },
    kwNote:
      '겹치는 단어가 하나도 없어 전부 0점 동점 — 정답(연차 안내)이 버젓이 있는데도 키워드 검색은 못 찾습니다. 워밍업 실험 ①의 맹점 그대로죠.',
    semNote:
      '"쉬는 날을 미리 쓴다"는 뜻이 연차 문서와 가깝다고 계산돼 A가 1등 — 뜻을 좌표로 바꿔 가까움을 재는 의미 검색의 힘입니다.',
    kwGood: false,
    semGood: true,
  },
  {
    text: 'VPN 403 이라고 떠요',
    tag: '정확한 용어·코드가 든 질문',
    keyword: { A: 0, B: 2, C: 0, D: 0, E: 0 },
    semantic: { A: 0.08, B: 0.74, C: 0.11, D: 0.09, E: 0.62 },
    kwNote:
      '"VPN"과 "403"이 정확히 꽂혀 B가 압도적 1등 — 고유명사·코드·정확한 용어에는 키워드 검색이 빠르고 확실합니다.',
    semNote:
      'B가 1등이긴 한데 E(프린터 오류)가 바짝 따라붙습니다 — "오류 상황"이라는 뜻이 비슷해서요. 정밀 타격은 키워드가 낫습니다. 그래서 실무는 둘을 함께 씁니다(하이브리드).',
    kwGood: true,
    semGood: false,
  },
]
const qIdx = ref(0)
const method = ref<'keyword' | 'semantic'>('keyword')
const ranked = computed(() => {
  const c = CASES[qIdx.value]
  const score = method.value === 'keyword' ? c.keyword : c.semantic
  const max = Math.max(...Object.values(score), 0.001)
  return [...DOCS]
    .sort((a, b) => score[b.id] - score[a.id])
    .map((d) => ({ ...d, score: score[d.id], pct: (score[d.id] / max) * 100 }))
})
const note = computed(() => {
  const c = CASES[qIdx.value]
  return method.value === 'keyword'
    ? { text: c.kwNote, good: c.kwGood }
    : { text: c.semNote, good: c.semGood }
})

// ── ② RAG 파이프라인 통과 ─────────────────────────────────────
const STEPS = [
  {
    name: '질문',
    badge: '사용자',
    desc: '직원이 챗봇에게 묻습니다. LLM 훈련 데이터에 우리 회사 경비 규정은 없어요 — 이대로면 모르거나 지어냅니다.',
    artifact: '"법인카드 언제까지 정산해야 하나요?"',
  },
  {
    name: '임베딩',
    badge: '2·4·9장',
    desc: '질문의 뜻을 좌표(벡터)로 바꿉니다 — 워밍업에서 여러분이 손으로 한 그 일을 모델이 합니다.',
    artifact: '질문 → [0.72, −0.41, 0.13, 0.55]  (toy 4차원 — 실제는 수백 차원)',
  },
  {
    name: '검색',
    badge: '6·7장',
    desc: '의미 지도에 미리 올려 둔 사내 문서들 중 질문과 가까운 것을 찾습니다. 가까움을 재는 자는 2장, 수만 개 중에서 빨리 찾는 법은 6장.',
    artifact: '1등: 법인카드 정산 안내 (유사도 0.88)\n2등: 연차 신청 안내 (유사도 0.24)\n→ 1등 문서만 채택',
  },
  {
    name: '프롬프트 조립',
    badge: '8장',
    desc: '찾은 문서를 질문 앞에 붙여 LLM에게 건넵니다 — 문맥 창에 지식이 실리는 순간(6부 2장의 그 관찰).',
    artifact:
      '아래 사내 문서를 참고해 답하세요.\n[문서] 법인카드 정산 안내 — 매월 5일까지 경비 시스템에 등록\n[질문] 법인카드 언제까지 정산해야 하나요?',
  },
  {
    name: '생성',
    badge: 'LLM (4·6부)',
    desc: '문서를 건네받은 LLM이 답을 씁니다. 어떤 문서를 건넸는지 아니까 출처도 달 수 있어요.',
    artifact: '"법인카드는 매월 5일까지 경비 시스템에 등록하시면 됩니다.\n(출처: 법인카드 정산 안내)"',
  },
]
const stepIdx = ref(0)
const doneAll = computed(() => stepIdx.value === STEPS.length - 1)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 검색 방식 비교 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 같은 질문, 두 검색기: 키워드 vs 의미</p>
    <p class="mb-3 text-xs text-slate-400">
      사내 문서 5건이 검색 대상입니다. 질문과 검색 방식을 바꿔 가며 순위가 어떻게 달라지는지 보세요.
    </p>

    <div class="mb-2 flex flex-wrap gap-2">
      <button
        v-for="(c, i) in CASES"
        :key="i"
        type="button"
        class="rounded-lg border px-3 py-2 text-left text-xs leading-snug transition"
        :class="qIdx === i ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
        @click="qIdx = i"
      >
        <span class="block font-semibold">{{ c.text }}</span>
        <span class="block" :class="qIdx === i ? 'text-indigo-400' : 'text-slate-400'">{{ c.tag }}</span>
      </button>
    </div>
    <div class="mb-3 flex gap-2">
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="method === 'keyword' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
        @click="method = 'keyword'"
      >
        🔤 키워드 검색 (겹치는 단어 수)
      </button>
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="method === 'semantic' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
        @click="method = 'semantic'"
      >
        🗺️ 의미 검색 (지도에서 가까움)
      </button>
    </div>

    <div class="space-y-1.5">
      <div
        v-for="(d, i) in ranked"
        :key="d.id"
        class="flex items-center gap-2 rounded-lg p-1.5 text-sm"
        :class="i === 0 && d.score > 0 ? 'bg-amber-50' : ''"
      >
        <span class="w-8 shrink-0 text-center text-xs font-bold" :class="i === 0 && d.score > 0 ? 'text-amber-600' : 'text-slate-400'">
          {{ i === 0 && d.score > 0 ? '1등' : d.score > 0 ? i + 1 + '위' : '—' }}
        </span>
        <span class="w-36 shrink-0 truncate text-xs text-slate-600">{{ d.title }}</span>
        <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full transition-all"
            :class="method === 'keyword' ? 'bg-slate-500' : 'bg-indigo-500'"
            :style="{ width: d.pct + '%' }"
          />
        </div>
        <span class="w-12 shrink-0 text-right text-xs text-slate-500">
          {{ method === 'keyword' ? d.score + '개' : d.score.toFixed(2) }}
        </span>
      </div>
    </div>

    <p class="mt-3 rounded-lg p-3 text-sm" :class="note.good ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'">
      {{ note.good ? '✅' : '⚠️' }} {{ note.text }}
    </p>

    <!-- ② RAG 파이프라인 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — RAG 파이프라인: 검색이 프롬프트가 되기까지</p>
    <p class="mb-3 text-xs text-slate-400">"다음 단계"를 눌러 질문 하나가 답이 되는 5단계를 통과해 보세요.</p>

    <div class="mb-3 flex flex-wrap gap-1.5">
      <span
        v-for="(s, i) in STEPS"
        :key="s.name"
        class="rounded-full px-2.5 py-1 text-[11px] font-semibold transition"
        :class="i === stepIdx ? 'bg-indigo-600 text-white' : i < stepIdx ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'"
      >
        {{ i + 1 }}. {{ s.name }}
      </span>
    </div>

    <div class="rounded-lg bg-slate-50 p-4">
      <p class="mb-1 text-sm font-semibold text-slate-700">
        {{ stepIdx + 1 }}단계 — {{ STEPS[stepIdx].name }}
        <span class="ml-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-400 ring-1 ring-slate-200">{{ STEPS[stepIdx].badge }}</span>
      </p>
      <p class="mb-3 text-sm leading-relaxed text-slate-600">{{ STEPS[stepIdx].desc }}</p>
      <pre class="overflow-x-auto rounded-lg bg-white p-3 text-xs leading-relaxed whitespace-pre-wrap text-slate-700 ring-1 ring-slate-200">{{ STEPS[stepIdx].artifact }}</pre>
    </div>

    <div class="mt-3 flex items-center gap-2">
      <button
        v-if="!doneAll"
        type="button"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        @click="stepIdx++"
      >
        다음 단계 →
      </button>
      <button
        v-if="stepIdx > 0"
        type="button"
        class="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-200"
        @click="stepIdx = 0"
      >
        처음부터
      </button>
    </div>

    <p v-if="doneAll" class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
      ✅ 모델은 그대로인데 회사 지식이 답에 들어왔습니다 — <b>재훈련(조련) 없이, 검색으로.</b>
      경비 규정이 바뀌면? 문서만 고치면 다음 질문부터 바로 새 답이 나옵니다. 이게 RAG의 전부예요.
    </p>
  </div>
</template>
