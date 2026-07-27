<script setup lang="ts">
// ch6 인터랙티브 — KL 목줄 실험실. 목줄 길이 β를 바꿔가며 RLHF 훈련의 결과를 비교한다.
// 핵심 관찰: 심판(RM) 점수 ≠ 실제 품질 — β=0이면 보상 해킹, β가 너무 크면 못 배움.
// 오프라인·결정적(각 β의 훈련 결과를 재현한 시나리오).
import { ref, computed } from 'vue'

interface Scenario {
  beta: string
  label: string
  rm: number
  kl: number
  human: number
  reply: string
  note: string
  tone: 'rose' | 'amber' | 'emerald' | 'slate'
}

const SCENARIOS: Scenario[] = [
  {
    beta: '0',
    label: 'β = 0 (목줄 없음)',
    rm: 9.8,
    kl: 45,
    human: 1,
    reply:
      '정말 정말 훌륭하고 훌륭하신 질문 감사합니다!! 요약을 요약하자면 요약은… 요약! 요약!! 일정 확정 확정 확정… 감사합니다 감사합니다 🙏🙏🙏',
    note: '심판 점수는 역대 최고 — 그런데 읽어 보세요. 심판(RM)이 후하게 주는 패턴(감사·확신·이모지)만 잔뜩 넣은 괴상한 답이 됐어요. 원본에서 너무 멀어져 말솜씨 자체가 무너졌습니다. 이게 보상 해킹.',
    tone: 'rose',
  },
  {
    beta: '0.5',
    label: 'β = 0.5 (느슨한 목줄)',
    rm: 8.5,
    kl: 12,
    human: 6,
    reply: '훌륭한 질문 감사합니다! 요약해 드리면 ① 일정 확정 ② 담당 배정 ③ 다음 회의 금요일입니다. 도움이 되었기를 진심으로 바랍니다!',
    note: '쓸 만해졌지만 아부기가 남아 있죠 — 심판이 좋아하는 과공손 쪽으로 살짝 끌려간 상태입니다.',
    tone: 'amber',
  },
  {
    beta: '2',
    label: 'β = 2 (적당한 목줄)',
    rm: 7.2,
    kl: 3,
    human: 9,
    reply: '요약입니다: ① 일정 확정 ② 담당 배정 ③ 다음 회의 금요일',
    note: '심판 점수는 좀 낮아도 사람이 보기엔 최고 — 원본(SFT)의 말솜씨를 지키면서 좋은 방향으로만 움직인 균형점입니다.',
    tone: 'emerald',
  },
  {
    beta: '10',
    label: 'β = 10 (너무 꽉 묶음)',
    rm: 5.1,
    kl: 0.3,
    human: 5,
    reply: '네, 요약해 드리겠습니다. 회의에서는 먼저 일정에 대한 논의가 있었고, 그 과정에서 여러 의견이 오갔으며…(SFT 시절의 장황한 답 그대로)',
    note: '원본에서 한 발짝도 못 움직였어요 — 선호 학습을 한 의미가 없습니다. 목줄이 너무 짧으면 배울 수가 없어요.',
    tone: 'slate',
  },
]

const idx = ref<number | null>(null)
const cur = computed(() => (idx.value === null ? null : SCENARIOS[idx.value]))

const toneBox: Record<Scenario['tone'], string> = {
  rose: 'bg-rose-50 text-rose-800',
  amber: 'bg-amber-50 text-amber-800',
  emerald: 'bg-emerald-50 text-emerald-800',
  slate: 'bg-slate-100 text-slate-600',
}

const pct = (v: number, max: number) => `${Math.min(100, Math.round((v / max) * 100))}%`
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험: KL 목줄 실험실 — 목줄 길이(β)를 골라 훈련 결과를 보세요</p>
    <p class="mb-3 text-xs text-slate-500">목적 = 심판 점수 − β × (원본에서 멀어진 정도). 같은 훈련, 다른 β.</p>

    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="(s, i) in SCENARIOS"
        :key="i"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm transition"
        :class="idx === i
          ? 'border-indigo-500 bg-indigo-50 font-medium text-indigo-800'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'"
        @click="idx = i"
      >
        {{ s.label }}
      </button>
    </div>

    <template v-if="cur">
      <!-- 세 개의 계기판 -->
      <div class="mb-3 grid gap-2 sm:grid-cols-3">
        <div class="rounded-lg bg-slate-50 p-3">
          <p class="text-xs font-semibold text-slate-500">🏅 심판(RM) 점수</p>
          <p class="text-xl font-bold text-slate-800">{{ cur.rm }}</p>
          <div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div class="h-full rounded-full bg-indigo-500 transition-all" :style="{ width: pct(cur.rm, 10) }" />
          </div>
        </div>
        <div class="rounded-lg bg-slate-50 p-3">
          <p class="text-xs font-semibold text-slate-500">📏 원본과의 거리 (KL)</p>
          <p class="text-xl font-bold text-slate-800">{{ cur.kl }}</p>
          <div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div class="h-full rounded-full bg-rose-400 transition-all" :style="{ width: pct(cur.kl, 45) }" />
          </div>
        </div>
        <div class="rounded-lg bg-slate-50 p-3">
          <p class="text-xs font-semibold text-slate-500">🧑 진짜 사람의 평가</p>
          <p class="text-xl font-bold" :class="cur.human >= 8 ? 'text-emerald-700' : 'text-slate-800'">{{ cur.human }}</p>
          <div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div class="h-full rounded-full bg-emerald-500 transition-all" :style="{ width: pct(cur.human, 10) }" />
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
        <p class="mb-1 text-xs font-semibold text-indigo-600">💬 훈련을 마친 모델의 답변 ("회의록 세 줄 요약해 줘")</p>
        <p class="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{{ cur.reply }}</p>
      </div>
      <p class="mt-2 rounded-lg p-3 text-sm" :class="toneBox[cur.tone]">👀 {{ cur.note }}</p>
    </template>
    <p v-else class="text-sm text-slate-500">β 버튼을 하나 골라 보세요 — β=0(목줄 없음)부터 추천.</p>
  </div>
</template>
