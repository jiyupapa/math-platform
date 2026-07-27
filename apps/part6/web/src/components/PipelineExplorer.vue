<script setup lang="ts">
// ch1 인터랙티브 — 조련 파이프라인 3단계를 한 단계씩 진행하며,
// 같은 프롬프트에 대한 모델의 응답이 어떻게 진화하는지 본다. (오프라인·결정적 시뮬레이션)
import { ref } from 'vue'

interface Stage {
  name: string
  badge: string
  food: string
  learn: string
  where: string
  reply: string
  note: string
}

const PROMPT = '이 회의록을 세 줄로 요약해 줘: (3월 출시 일정 확정, 디자인 담당 김OO 배정, 다음 회의는 금요일)'

const stages: Stage[] = [
  {
    name: '1단계 — 사전학습만 마친 상태 (베이스 모델)',
    badge: '사전학습',
    food: '인터넷 텍스트 수조 개 토큰 — 라벨 없음, 그냥 글',
    learn: '다음 단어 예측 → 세상 지식과 말솜씨가 생김',
    where: '4부에서 이미 배움 (다음 단어 예측 기계)',
    reply:
      '이 회의록을 세 줄로 요약해 줘: … 라는 업무 요청 메일을 받았을 때 신입사원이 저지르기 쉬운 실수 3가지. 첫째, 요약과 발췌를 혼동하는 것이다. 둘째…',
    note: '아는 건 많은데, 요청을 "수행"하지 않아요 — ch0에서 본 이어쓰기 그대로.',
  },
  {
    name: '2단계 — SFT 를 마친 상태',
    badge: 'SFT',
    food: '지시 → 모범 답안 쌍 수만~수십만 개 (사람이 직접 작성)',
    learn: '"요청에는 답변으로 반응한다"는 행동 양식',
    where: '3장에서 배움',
    reply:
      '네, 요약해 드리겠습니다. 회의록의 내용을 살펴보면 먼저 3월 출시 일정이 확정되었다는 점이 있고, 그다음으로 디자인 담당자로 김OO 님이 배정되었으며, 마지막으로 다음 회의 일정은 금요일로 정해졌습니다. 추가로 궁금하신 점이 있다면…',
    note: '드디어 답변을 해요! 하지만 장황하죠 — "세 줄로"라는 요구가 잘 안 지켜집니다.',
  },
  {
    name: '3단계 — 선호 학습까지 마친 상태 (챗 모델)',
    badge: '선호 학습',
    food: '같은 질문에 대한 답변 A/B + 사람이 고른 쪽',
    learn: '"더 좋은 답변"의 방향 — 간결·정확·안전',
    where: '4~7장에서 배움 (보상 모델 → RLHF·DPO)',
    reply: '요약입니다:\n① 3월 출시 일정 확정\n② 디자인 담당 김OO 배정\n③ 다음 회의는 금요일',
    note: '요구(세 줄)를 정확히 지키는 간결한 답 — 사람들이 "이쪽이 낫다"고 고른 방향으로 다듬어진 결과예요.',
  },
]

const step = ref(0)

function next() {
  if (step.value < stages.length - 1) step.value++
}
function reset() {
  step.value = 0
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-3 text-sm font-semibold text-slate-700">
      🧪 실험: 같은 요청 하나로 조련 3단계를 통과해 보기
    </p>

    <div class="mb-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-800">
      <span class="mr-1 text-xs font-semibold text-slate-600">요청</span>
      {{ PROMPT }}
    </div>

    <!-- 단계 표시기 -->
    <div class="mb-4 flex items-center gap-1">
      <template v-for="(s, i) in stages" :key="i">
        <span
          class="rounded-full px-3 py-1 text-xs font-semibold transition"
          :class="i <= step ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'"
        >{{ s.badge }}</span>
        <span v-if="i < stages.length - 1" class="text-slate-500">→</span>
      </template>
    </div>

    <!-- 현재 단계 -->
    <p class="mb-2 text-sm font-bold text-slate-800">{{ stages[step].name }}</p>
    <div class="mb-3 grid gap-2 text-sm sm:grid-cols-3">
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-xs font-semibold text-slate-500">🍚 이 단계가 먹는 데이터</p>
        <p class="mt-0.5 text-slate-700">{{ stages[step].food }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-xs font-semibold text-slate-500">🧠 여기서 배우는 것</p>
        <p class="mt-0.5 text-slate-700">{{ stages[step].learn }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-xs font-semibold text-slate-500">📍 이 과정에서 배우는 곳</p>
        <p class="mt-0.5 text-slate-700">{{ stages[step].where }}</p>
      </div>
    </div>

    <div class="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
      <p class="mb-1 text-xs font-semibold text-indigo-600">💬 지금 이 모델의 응답</p>
      <p class="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{{ stages[step].reply }}</p>
    </div>
    <p class="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">👀 {{ stages[step].note }}</p>

    <div class="mt-3 flex gap-2">
      <button
        v-if="step < stages.length - 1"
        type="button"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        @click="next"
      >
        조련 계속하기 ▶ ({{ stages[step + 1].badge }})
      </button>
      <span v-else class="rounded-lg bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
        ✓ 조련 완료 — 비서가 됐어요
      </span>
      <button
        v-if="step > 0"
        type="button"
        class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
        @click="reset"
      >
        처음부터
      </button>
    </div>
  </div>
</template>
