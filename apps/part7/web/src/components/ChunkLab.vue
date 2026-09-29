<script setup lang="ts">
// ch7 인터랙티브 — ① 청킹 크기 트레이드오프: 통문서(희석) vs 조항별(적절) vs 문장별(문맥 찢김)
//                 ② recall@k 채점판: 평가 세트 5문항으로 k에 따른 재현율 변화.
// 오프라인·결정적 (점수·순위는 미리 준비된 toy 값).
import { computed, ref } from 'vue'

// ── ① 청킹 크기 비교 ──────────────────────────────────────────
const QUESTION = '결혼 축하금은 얼마인가요?'
interface Chunk {
  text: string
  score: number
  best?: boolean
  warn?: boolean
}
const MODES: { key: string; label: string; note: string; tone: 'bad' | 'good' | 'warn'; chunks: Chunk[] }[] = [
  {
    key: 'whole',
    label: '통문서 (1조각)',
    tone: 'bad',
    note:
      '문서 전체가 한 벡터로 뭉개져, 결혼·장례·출산·절차가 평균된 방향이라 어떤 질문과도 뜨뜻미지근합니다(점수 희석). 게다가 검색되면 문서 전체가 프롬프트에 들어가 토큰도 낭비돼요.',
    chunks: [
      {
        text: '경조사 지원 규정 (전체): 결혼 축하금 50만 원(근속 1년 이상), 장례 지원 100만 원과 상조 서비스, 출산 축하금 30만 원, 신청은 인사 포털에서 증빙 첨부, 지급은 급여일 합산…',
        score: 0.44,
        best: true,
      },
    ],
  },
  {
    key: 'clause',
    label: '조항별 (4조각)',
    tone: 'good',
    note:
      '결혼 조항 조각이 0.84로 뚜렷한 1등이에요. 질문에 딱 맞는 크기의 조각이 뽑히고, 조건("근속 1년 이상")까지 한 조각에 붙어 있어 답변이 완전합니다.',
    chunks: [
      { text: '제1조(결혼) 결혼 축하금 50만 원을 지급한다. 단, 근속 1년 이상인 직원에 한한다.', score: 0.84, best: true },
      { text: '제2조(장례) 장례 지원금 100만 원과 상조 서비스를 지원한다.', score: 0.18 },
      { text: '제3조(출산) 출산 축하금 30만 원을 지급한다.', score: 0.27 },
      { text: '제4조(절차) 지원금 신청은 인사 포털에서 증빙을 첨부해 접수한다.', score: 0.22 },
    ],
  },
  {
    key: 'sentence',
    label: '문장별 (6조각)',
    tone: 'warn',
    note:
      '1등 조각(0.87)만 보면 "50만 원"이라 답하겠지만, "단, 근속 1년 이상" 조건이 다른 조각으로 찢어졌습니다(0.31이라 top에 못 듦). 너무 잘게 자르면 문맥이 끊겨 반쪽짜리 답이 나올 수 있어요.',
    chunks: [
      { text: '결혼 축하금 50만 원을 지급한다.', score: 0.87, best: true },
      { text: '단, 근속 1년 이상인 직원에 한한다.', score: 0.31, warn: true },
      { text: '장례 지원금 100만 원과 상조 서비스를 지원한다.', score: 0.17 },
      { text: '출산 축하금 30만 원을 지급한다.', score: 0.26 },
      { text: '지원금 신청은 인사 포털에서 증빙을 첨부해 접수한다.', score: 0.21 },
      { text: '지급은 익월 급여일에 합산한다.', score: 0.12 },
    ],
  },
]
const modeIdx = ref(0)
const mode = computed(() => MODES[modeIdx.value])

// ── ② recall@k 채점판 ─────────────────────────────────────────
// 평가 세트 5문항 — 각 질문에서 정답 문서가 검색 순위 몇 위였는지 (미리 준비된 결과)
const EVALSET = [
  { q: '결혼 축하금은 얼마인가요?', rank: 1 },
  { q: '법인카드 정산 마감일은?', rank: 3 },
  { q: '연차는 어디서 신청하나요?', rank: 2 },
  { q: '경조 휴가는 며칠인가요?', rank: 6 },
  { q: 'VPN 접속 방법 알려줘', rank: 1 },
]
const K_CHOICES = [1, 3, 5]
const kIdx = ref(0)
const k = computed(() => K_CHOICES[kIdx.value])
const hits = computed(() => EVALSET.filter((e) => e.rank <= k.value).length)
const recall = computed(() => hits.value / EVALSET.length)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 청킹 크기 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① · 같은 문서, 세 가지 칼질: 조각 크기가 검색을 바꾼다</p>
    <p class="mb-3 text-xs text-slate-500">
      경조사 지원 규정 한 문서를 세 가지 크기로 잘라 임베딩했습니다. 질문은 같아요.
      <b>"{{ QUESTION }}"</b>
    </p>

    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="(m, i) in MODES"
        :key="m.key"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="modeIdx === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="modeIdx = i"
      >
        🔪 {{ m.label }}
      </button>
    </div>

    <div class="space-y-1.5">
      <div
        v-for="(c, i) in mode.chunks"
        :key="i"
        class="rounded-lg border p-2.5"
        :class="c.best ? 'border-amber-300 bg-amber-50' : c.warn ? 'border-rose-200 bg-rose-50/50' : 'border-slate-100'"
      >
        <div class="flex items-center gap-2">
          <span v-if="c.best" class="shrink-0 rounded-full bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-white">1등</span>
          <span v-else-if="c.warn" class="shrink-0 rounded-full bg-rose-400 px-1.5 py-0.5 text-xs font-bold text-white">⚠ 조건</span>
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div class="h-full rounded-full" :class="c.best ? 'bg-amber-400' : c.warn ? 'bg-rose-300' : 'bg-slate-300'" :style="{ width: c.score * 100 + '%' }" />
          </div>
          <span class="w-10 shrink-0 text-right font-mono text-xs text-slate-500">{{ c.score.toFixed(2) }}</span>
        </div>
        <p class="mt-1.5 text-xs leading-relaxed text-slate-600">{{ c.text }}</p>
      </div>
    </div>

    <p
      class="mt-3 rounded-lg p-3 text-sm"
      :class="mode.tone === 'good' ? 'bg-emerald-50 text-emerald-800' : mode.tone === 'warn' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'"
    >
      {{ mode.tone === 'good' ? '✅' : '⚠️' }} {{ mode.note }}
    </p>

    <!-- ② recall@k -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② · 검색 성적표: recall@k</p>
    <p class="mb-3 text-xs text-slate-500">
      평가 세트: (질문, 정답 문서) 5쌍. 각 질문을 검색했을 때 <b>정답 문서가 몇 위</b>였는지 기록해 뒀습니다.
      k(꺼내는 개수)를 바꿔 보세요.
    </p>

    <div class="mb-3 flex flex-wrap items-center gap-2">
      <button
        v-for="(kc, i) in K_CHOICES"
        :key="kc"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-bold transition"
        :class="kIdx === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="kIdx = i"
      >
        top-{{ kc }}
      </button>
      <span class="text-xs text-slate-500">= 상위 {{ k }}개를 꺼내 프롬프트에 넣는다</span>
    </div>

    <div class="space-y-1">
      <div
        v-for="e in EVALSET"
        :key="e.q"
        class="flex items-center gap-2 rounded-lg p-1.5 text-sm"
        :class="e.rank <= k ? 'bg-emerald-50' : 'bg-rose-50'"
      >
        <span class="w-6 shrink-0 text-center">{{ e.rank <= k ? '✓' : '✗' }}</span>
        <span class="min-w-0 flex-1 truncate text-xs text-slate-600">{{ e.q }}</span>
        <span class="shrink-0 font-mono text-xs" :class="e.rank <= k ? 'text-emerald-700' : 'text-rose-700'">정답이 {{ e.rank }}위</span>
      </div>
    </div>

    <div class="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div class="text-center">
        <p class="text-xs text-slate-500">recall@{{ k }}</p>
        <p class="font-mono text-2xl font-bold" :class="recall >= 0.8 ? 'text-emerald-700' : 'text-rose-700'">{{ Math.round(recall * 100) }}%</p>
      </div>
      <p class="flex-1 text-xs leading-relaxed text-slate-500">
        <template v-if="k === 1">
          1개만 꺼내면 5문항 중 {{ hits }}개만 찾아요. 아깝게 2·3위인 정답들이 다 새 나갑니다.
        </template>
        <template v-else-if="k === 3">
          3개를 꺼내니 {{ Math.round(recall * 100) }}%로 껑충 뛰었어요. 대신 프롬프트가 3배로 길어졌죠(토큰 비용).
          여전히 실패하는 "경조 휴가" 문항(6위)은 k로는 못 구합니다. 청킹이나 임베딩을 고쳐야 할 신호.
        </template>
        <template v-else>
          5개를 꺼내도 {{ Math.round(recall * 100) }}%예요. k를 늘리는 데엔 한계가 있고 비용만 늘어요.
          남은 실패는 검색 앞단(청킹·임베딩)의 몫입니다.
        </template>
      </p>
    </div>
  </div>
</template>
