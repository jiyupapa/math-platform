<script setup lang="ts">
// ch10 인터랙티브 — 나만의 챗봇 조련 시뮬레이션. 파이프라인을 한 단계씩 직접 진행하고,
// ③에서 사용자가 고른 선호가 ④의 최종 챗봇을 결정한다(취향이 다르면 챗봇도 다르다).
// 오프라인·결정적.
import { ref, computed } from 'vue'

const PROMPT = '다음 주 회식 공지 문구 써 줘'

const CANDIDATES = [
  {
    key: 'A',
    style: '간결형',
    text: '📢 회식 공지: 다음 주 목요일 18:30, 회사 앞 한식당. 참석 여부는 수요일까지 회신 주세요.',
  },
  {
    key: 'B',
    style: '따뜻한 상세형',
    text: '안녕하세요 여러분 😊 다음 주 목요일 저녁 6시 반, 회사 앞 한식당에서 회식을 하려 합니다. 한 주의 피로를 함께 풀어요! 참석 여부는 수요일까지 알려주시면 예약에 반영하겠습니다.',
  },
]

// 단계: 0 베이스 → 1 SFT → 2 선호 수집(선택 대기) → 3 DPO 완료
const step = ref(0)
const picked = ref<number | null>(null)

const STAGE_INFO = [
  {
    badge: '사전학습',
    title: '① 베이스 모델: 이어쓰기 기계',
    math: '다음 단어 예측 (4부 · ch0~2)',
    reply: '다음 주 회식 공지 문구 써 줘 라는 요청을 받았을 때 총무 담당자가 흔히 하는 실수 5가지. 첫째, 날짜를 빠뜨리는 것이다. 둘째…',
    note: '요청을 수행하지 않고 그럴듯한 글을 이어 씁니다. 여기가 출발점.',
  },
  {
    badge: 'SFT',
    title: '② SFT: 시범으로 행동 가르치기',
    math: '크로스 엔트로피 −log q + 손실 마스킹 (ch3 · 5부 4장)',
    reply: '네, 회식 공지 문구를 작성해 드리겠습니다. 회식이라는 것은 조직 구성원 간의 친목을 도모하는 자리인 만큼, 먼저 일시를 안내드리자면 다음 주 목요일이며, 장소는 회사 앞 한식당으로…',
    note: '드디어 답변을 합니다! 하지만 아직 다듬어지지 않았어요(장황). 취향은 다음 단계가 담당.',
  },
] as const

function toSft() {
  step.value = 1
}
function toPreference() {
  step.value = 2
}
function pick(i: number) {
  picked.value = i
  step.value = 3
}
function reset() {
  step.value = 0
  picked.value = null
}

const finalAnswer = computed(() => (picked.value === null ? '' : CANDIDATES[picked.value].text))
const finalStyle = computed(() => (picked.value === null ? '' : CANDIDATES[picked.value].style))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 졸업 실험: 나만의 챗봇 조련: 파이프라인을 직접 끝까지</p>
    <p class="mb-3 text-xs text-slate-500">요청: "{{ PROMPT }}" · ③에서 내가 고른 선호가 최종 챗봇을 결정합니다.</p>

    <!-- 진행 표시 -->
    <div class="mb-4 flex flex-wrap items-center gap-1 text-xs">
      <template v-for="(label, i) in ['사전학습', 'SFT', '선호 수집', 'DPO']" :key="i">
        <span
          class="rounded-full px-3 py-1 font-semibold transition"
          :class="step >= i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'"
        >{{ label }}</span>
        <span v-if="i < 3" class="text-slate-500">→</span>
      </template>
    </div>

    <!-- 단계 0·1: 베이스 / SFT -->
    <template v-if="step <= 1">
      <p class="mb-1 text-sm font-bold text-slate-800">{{ STAGE_INFO[step].title }}</p>
      <p class="mb-2 text-xs text-slate-500">🔧 사용한 수학: {{ STAGE_INFO[step].math }}</p>
      <div class="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
        <p class="mb-1 text-xs font-semibold text-indigo-600">💬 지금 모델의 응답</p>
        <p class="text-sm leading-relaxed text-slate-800">{{ STAGE_INFO[step].reply }}</p>
      </div>
      <p class="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">👀 {{ STAGE_INFO[step].note }}</p>
      <button
        type="button"
        class="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        @click="step === 0 ? toSft() : toPreference()"
      >
        {{ step === 0 ? '② SFT 시작: 시범 데이터 투입 ▶' : '③ 선호 수집으로 ▶' }}
      </button>
    </template>

    <!-- 단계 2: 선호 수집 — 사용자가 라벨러 -->
    <template v-else-if="step === 2">
      <p class="mb-1 text-sm font-bold text-slate-800">③ 선호 수집: 이번엔 직접 라벨러가 되어 봅니다</p>
      <p class="mb-2 text-xs text-slate-500">🔧 사용한 수학: 선호 쌍 → Bradley-Terry σ(r_A − r_B) (ch4 · 3부 4장 · 2부 7장)</p>
      <p class="mb-2 text-sm text-slate-600">SFT 모델이 만든 두 후보입니다. <b>어느 쪽이 더 마음에 드나요?</b> (정답 없음, 진심으로 고르세요)</p>
      <div class="grid gap-2 sm:grid-cols-2">
        <button
          v-for="(c, i) in CANDIDATES"
          :key="c.key"
          type="button"
          class="rounded-lg border border-slate-200 p-3 text-left text-sm leading-relaxed text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50/40"
          @click="pick(i)"
        >
          <span class="mb-1 block text-xs font-bold text-slate-600">후보 {{ c.key }} · {{ c.style }}</span>
          {{ c.text }}
        </button>
      </div>
    </template>

    <!-- 단계 3: DPO 완료 -->
    <template v-else>
      <p class="mb-1 text-sm font-bold text-slate-800">④ DPO: 내 선호를 가중치에 새기기</p>
      <p class="mb-2 text-xs text-slate-500">🔧 사용한 수학: −log σ(숨은 점수 마진) + KL 목줄 내장 (ch6~7 · 5부 5장)</p>
      <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <p class="mb-1 text-xs font-semibold text-emerald-700">💬 조련 완료: 내 챗봇의 응답 ({{ finalStyle }})</p>
        <p class="text-sm leading-relaxed text-slate-800">{{ finalAnswer }}</p>
      </div>
      <p class="mt-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
        🎓 <b>완성! 내 취향이 이 챗봇을 만들었습니다.</b>
        옆자리 동료가 다른 후보를 골랐다면 다른 챗봇이 태어났겠죠. 조련의 마지막 단계가
        "정답"이 아니라 <b>"누구의 선호인가"</b>인 이유입니다. 세상의 챗봇들이 서로 다른 성격을 갖는 이유이기도 하고요.
      </p>
      <button
        type="button"
        class="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
        @click="reset"
      >
        처음부터 (다른 취향으로 조련해 보기)
      </button>
    </template>
  </div>
</template>
