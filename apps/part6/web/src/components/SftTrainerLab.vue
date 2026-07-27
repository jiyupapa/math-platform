<script setup lang="ts">
// ch3 인터랙티브 — 미니 SFT 훈련기. 모범답안의 각 토큰을 크로스 엔트로피(−log₂ q)로 채점하고,
// "한 스텝 훈련"마다 q(정답 토큰 확률)가 올라 손실이 내려가는 과정을 본다.
// 지시 부분은 손실 마스킹(채점 제외). 오프라인·결정적 시뮬레이션.
import { ref, computed } from 'vue'

interface Tok {
  text: string
  /** true = 지시 부분(손실 마스킹 — 채점 안 함) */
  masked?: boolean
  /** 답변 토큰의 초기 q(모델이 이 정답 토큰에 준 확률) */
  q0?: number
}

const TOKENS: Tok[] = [
  { text: '요청:', masked: true },
  { text: '존댓말로', masked: true },
  { text: '바꿔줘:', masked: true },
  { text: '내일', masked: true },
  { text: '회의', masked: true },
  { text: '취소해', masked: true },
  { text: '답변:', masked: true },
  { text: '내일', q0: 0.06 },
  { text: '회의를', q0: 0.1 },
  { text: '취소해', q0: 0.15 },
  { text: '주시겠어요?', q0: 0.02 },
]

const answerIdx = TOKENS.map((t, i) => (t.masked ? -1 : i)).filter((i) => i >= 0)
const qs = ref<number[]>(TOKENS.map((t) => t.q0 ?? 1))
const steps = ref(0)

const loss = (q: number) => -Math.log2(q)
const avgLoss = computed(
  () => answerIdx.reduce((s, i) => s + loss(qs.value[i]), 0) / answerIdx.length,
)
const done = computed(() => avgLoss.value < 0.4)

function trainStep() {
  // 경사하강 한 걸음의 흉내 — 정답 토큰의 확률을 손실이 줄어드는 방향으로 민다
  qs.value = qs.value.map((q, i) => (TOKENS[i].masked ? q : q + (1 - q) * 0.45))
  steps.value++
}
function reset() {
  qs.value = TOKENS.map((t) => t.q0 ?? 1)
  steps.value = 0
}

function lossClass(l: number): string {
  if (l > 2.5) return 'bg-rose-500'
  if (l > 1) return 'bg-amber-500'
  return 'bg-emerald-500'
}
const barWidth = (l: number) => `${Math.min(l, 5) / 5 * 100}%`
const fmt = (n: number) => (Math.round(n * 10) / 10).toFixed(1)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험: 미니 SFT 훈련기 — 시범 1개를 가중치에 새겨 보기</p>
    <p class="mb-3 text-xs text-slate-500">
      토큰마다 손실 = −log₂ q(정답 토큰) · 회색 토큰 = 지시 부분(손실 마스킹 — 채점 안 함)
    </p>

    <!-- 토큰별 채점판 -->
    <div class="mb-3 flex flex-wrap items-end gap-2">
      <div v-for="(t, i) in TOKENS" :key="i" class="min-w-14 text-center">
        <span
          class="block rounded-lg px-2 py-1 text-sm"
          :class="t.masked ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 font-medium text-indigo-900'"
        >{{ t.text }}</span>
        <template v-if="!t.masked">
          <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div class="h-full rounded-full transition-all" :class="lossClass(loss(qs[i]))" :style="{ width: barWidth(loss(qs[i])) }" />
          </div>
          <span class="mt-0.5 block text-xs text-slate-500">q={{ fmt(qs[i] * 100) }}% · 손실 {{ fmt(loss(qs[i])) }}</span>
        </template>
        <span v-else class="mt-0.5 block text-xs text-slate-500">채점 안 함</span>
      </div>
    </div>

    <!-- 평균 손실 + 훈련 -->
    <div class="mb-3 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div>
        <p class="text-xs font-semibold text-slate-500">평균 손실 (답변 토큰만)</p>
        <p class="text-2xl font-bold" :class="done ? 'text-emerald-700' : 'text-slate-800'">{{ fmt(avgLoss) }} <span class="text-sm font-normal text-slate-500">비트</span></p>
      </div>
      <div class="text-sm text-slate-500">훈련 스텝: <b class="text-slate-700">{{ steps }}</b></div>
      <div class="ml-auto flex gap-2">
        <button
          type="button"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40"
          :disabled="done"
          @click="trainStep"
        >
          한 스텝 훈련 ⚙️
        </button>
        <button
          v-if="steps > 0"
          type="button"
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
          @click="reset"
        >
          처음부터
        </button>
      </div>
    </div>

    <p v-if="steps === 0" class="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
      👀 훈련 전: 모델은 이 모범답안에 확신이 없어요 — 특히 '주시겠어요?'(q=2%)의 손실이 5.6비트로 폭발.
      <b>자신 없던 정답일수록 크게 배웁니다</b>(5부 4장에서 본 −log 의 성질).
    </p>
    <p v-else-if="!done" class="rounded-lg bg-sky-50 p-3 text-sm text-sky-800">
      👀 스텝마다 q(정답 확률)가 오르고 손실이 내려갑니다 — 손실이 기울기를 낳고, 기울기가 가중치를 미는
      경사하강(4부 11장)의 한 걸음 한 걸음이에요.
    </p>
    <p v-else class="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
      ✅ <b>훈련 완료 — 이 답변이 가중치에 새겨졌어요.</b> 이제 예시(퓨샷)를 붙이지 않아도,
      문맥이 사라져도 이 행동이 나옵니다. 이게 ch2의 "분포 잠깐 밀기"와 결정적으로 다른 점입니다.
    </p>
  </div>
</template>
