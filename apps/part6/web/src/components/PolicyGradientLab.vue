<script setup lang="ts">
// ch5 인터랙티브 — 미니 정책 훈련기. 정답 없이 "시도 → 보상 → 확률 갱신" 루프로
// 정책(답변 스타일의 확률분포)이 좋은 쪽으로 이동하는 것을 체험한다.
// 갱신 규칙: 시도한 답변의 가중치 × e^(lr·보상) — 잘한 행동은 더 자주, 못한 행동은 덜 자주.
// 오프라인·결정적(무작위 샘플링 대신 사용자가 '이번에 생성된 답'을 직접 고른다).
import { ref, computed } from 'vue'

interface Action {
  key: string
  text: string
  style: string
  reward: number
}

const ACTIONS: Action[] = [
  { key: 'A', text: '천만에요! 도움이 필요하면 언제든 말씀하세요.', style: '간결·정중', reward: 3 },
  { key: 'B', text: '감사 인사를 주시다니 저야말로 영광입니다. 인사라는 것은 인간 관계에서…(세 문단)', style: '장황', reward: 1 },
  { key: 'C', text: 'ㅇㅇ', style: '무성의', reward: -2 },
]

const LR = 0.35
const weights = ref<number[]>(ACTIONS.map(() => 1))
const tries = ref(0)
const lastLog = ref('')

const probs = computed(() => {
  const sum = weights.value.reduce((a, b) => a + b, 0)
  return weights.value.map((w) => w / sum)
})
const expectedReward = computed(() =>
  probs.value.reduce((s, p, i) => s + p * ACTIONS[i].reward, 0),
)
const pct = (p: number) => Math.round(p * 100)
const fmt = (n: number) => (Math.round(n * 100) / 100).toFixed(2)

function experience(i: number) {
  const a = ACTIONS[i]
  weights.value = weights.value.map((w, j) => (j === i ? w * Math.exp(LR * a.reward) : w))
  tries.value++
  const dir = a.reward > 0 ? `확률 ↑ (보상 +${a.reward})` : `확률 ↓ (보상 ${a.reward})`
  lastLog.value = `시도 ${tries.value}: 모델이 ${a.key}(${a.style})를 생성 → 보상 점수 ${a.reward > 0 ? '+' : ''}${a.reward} → ${a.key}의 ${dir}`
}
function reset() {
  weights.value = ACTIONS.map(() => 1)
  tries.value = 0
  lastLog.value = ''
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험: 미니 정책 훈련기: 정답 없이 점수만으로 배우기</p>
    <p class="mb-3 text-xs text-slate-500">
      요청: "고마워!" · 답변 카드를 누르면 "이번에 모델이 그 답을 생성했다"고 치고, 보상에 따라 정책(확률)이 갱신됩니다.
    </p>

    <div class="space-y-2">
      <button
        v-for="(a, i) in ACTIONS"
        :key="a.key"
        type="button"
        class="block w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-indigo-300"
        @click="experience(i)"
      >
        <div class="mb-1 flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-slate-500">{{ a.key }} · {{ a.style }}</span>
          <span class="flex items-center gap-2">
            <span class="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">보상 점수 {{ a.reward > 0 ? '+' : '' }}{{ a.reward }}</span>
            <span class="text-sm font-bold text-indigo-700">π = {{ pct(probs[i]) }}%</span>
          </span>
        </div>
        <p class="mb-1.5 text-sm leading-relaxed text-slate-700">{{ a.text }}</p>
        <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div class="h-full rounded-full bg-indigo-500 transition-all" :style="{ width: pct(probs[i]) + '%' }" />
        </div>
      </button>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div>
        <p class="text-xs font-semibold text-slate-500">기대 보상 E[r] = Σ π·r</p>
        <p class="text-2xl font-bold" :class="expectedReward > 2 ? 'text-emerald-700' : 'text-slate-800'">{{ fmt(expectedReward) }}</p>
      </div>
      <div class="text-sm text-slate-500">시도: <b class="text-slate-700">{{ tries }}</b>회</div>
      <button
        v-if="tries > 0"
        type="button"
        class="ml-auto rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
        @click="reset"
      >
        처음부터
      </button>
    </div>

    <p v-if="lastLog" class="mt-2 rounded-lg bg-sky-50 p-3 text-sm text-sky-800">⚙️ {{ lastLog }}</p>
    <p v-if="tries === 0" class="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
      👀 지금 정책은 세 답변을 <b>같은 확률(33%)</b>로 냅니다. 아직 아무 경험이 없으니까요.
      C(무성의)를 눌러 보세요. <b>나쁜 경험도 배움이 됩니다</b>. C의 확률이 내려가며 E[r]이 올라요.
    </p>
    <p v-else-if="expectedReward > 2.5" class="mt-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
      ✅ <b>정책이 좋은 답 쪽으로 수렴했어요.</b> 아무도 "정답은 A야"라고 말해 준 적이 없습니다.
      점수의 방향만 따라왔을 뿐. 이게 강화학습입니다.
    </p>
  </div>
</template>
