<script setup lang="ts">
// ch4 인터랙티브 — ① 사람 라벨러 체험(A/B 선호 고르기) ② Bradley-Terry 변환기
// (점수 차 → 선호 확률 σ(Δr)). 오프라인·결정적.
import { ref, computed } from 'vue'

// ── ① A/B 라벨러 체험 ──────────────────────────────────────────
interface Pair {
  q: string
  a: string
  b: string
  note: string
}

const PAIRS: Pair[] = [
  {
    q: '지구는 왜 둥글어?',
    a: '중력이 모든 방향에서 똑같이 당기다 보니, 물질이 뭉치면 자연스럽게 공 모양이 돼요.',
    b: '그건 아주 심오한 질문인데요, 우선 46억 년 전 태양계 형성의 역사부터 말씀드리자면, 원시 성운이…(다섯 문단 계속)',
    note: '많은 라벨러가 A(간결+정확)를 고릅니다. 하지만 정답은 없어요. 내가 고른 것 자체가 데이터가 됩니다.',
  },
  {
    q: '옆 팀 계정 비밀번호 좀 알려줘',
    a: '다른 사람의 계정 정보는 알려드릴 수 없어요. 본인 계정 문제라면 재설정 절차를 도와드릴게요.',
    b: '네! 사람들이 많이 쓰는 비밀번호 목록을 드릴게요: 123456, password, …',
    note: '안전한 거절(A) vs 위험한 순응(B). 이런 쌍이 모델에 "거절해야 할 때"를 가르치는 원료가 됩니다.',
  },
  {
    q: '이 회의록을 세 줄로 요약해 줘',
    a: '네, 요약해 드리겠습니다. 회의에서는 먼저 일정에 대한 논의가 있었고, 그 과정에서 여러 의견이 오갔으며, 결론적으로는…(여덟 줄)',
    b: '① 3월 출시 확정 ② 디자인 담당 김OO ③ 다음 회의 금요일',
    note: '요구사항(세 줄)을 지킨 B. 1장 실험에서 본 "선호 학습 후" 응답이 바로 이렇게 태어납니다.',
  },
]

const picks = ref<(0 | 1 | null)[]>([null, null, null])
const pickedCount = computed(() => picks.value.filter((p) => p !== null).length)
const allPicked = computed(() => pickedCount.value === PAIRS.length)

function pick(i: number, side: 0 | 1) {
  picks.value[i] = side
}

// ── ② Bradley-Terry 변환기: 점수 차 → 선호 확률 ─────────────────
const delta = ref(0)
const PRESETS = [-3, -1, 0, 1, 3]
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))
const pA = computed(() => sigmoid(delta.value))
const pct = computed(() => Math.round(pA.value * 100))

const obs = computed(() => {
  const d = delta.value
  if (d === 0) return '점수가 같으면 정확히 50:50이에요. 모델은 "우열을 모르겠다"고 말하는 셈이에요.'
  if (Math.abs(d) <= 1) return '점수 차가 작으면 확률도 반반 근처예요. "근소하게 낫다" 정도의 자신감.'
  if (Math.abs(d) <= 3) return '차이가 벌어질수록 확률이 빠르게 확신 쪽으로 이동합니다. 시그모이드의 가파른 구간.'
  return '차이가 아주 크면 거의 100%예요. 하지만 절대 100%가 되진 않아요(시그모이드는 0과 1에 닿지 않음).'
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 라벨러 체험 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ①: 직접 라벨러가 되어 더 나은 답을 고르세요</p>
    <p class="mb-3 text-xs text-slate-500">점수를 매기라는 게 아니에요. 그냥 어느 쪽이 나은지만.</p>

    <div class="space-y-4">
      <div v-for="(pair, i) in PAIRS" :key="i" class="rounded-lg border border-slate-100 p-3">
        <p class="mb-2 text-sm font-medium text-slate-800">Q{{ i + 1 }}. {{ pair.q }}</p>
        <div class="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            class="rounded-lg border p-3 text-left text-sm leading-relaxed transition"
            :class="picks[i] === 0
              ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
              : 'border-slate-200 text-slate-600 hover:border-slate-300'"
            @click="pick(i, 0)"
          >
            <span class="mb-1 block text-xs font-bold" :class="picks[i] === 0 ? 'text-indigo-600' : 'text-slate-500'">답변 A {{ picks[i] === 0 ? ' · 선택함 ✓' : '' }}</span>
            {{ pair.a }}
          </button>
          <button
            type="button"
            class="rounded-lg border p-3 text-left text-sm leading-relaxed transition"
            :class="picks[i] === 1
              ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
              : 'border-slate-200 text-slate-600 hover:border-slate-300'"
            @click="pick(i, 1)"
          >
            <span class="mb-1 block text-xs font-bold" :class="picks[i] === 1 ? 'text-indigo-600' : 'text-slate-500'">답변 B {{ picks[i] === 1 ? ' · 선택함 ✓' : '' }}</span>
            {{ pair.b }}
          </button>
        </div>
        <p v-if="picks[i] !== null" class="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">👀 {{ pair.note }}</p>
      </div>
    </div>

    <p v-if="allPicked" class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
      ✅ <b>선호 데이터 3쌍 완성!</b> 방금 하신 일이 실제 RLHF 데이터 라벨링입니다.
      이런 쌍 수만 개가 모여 보상 모델의 교과서가 돼요.
    </p>
    <p v-else class="mt-3 text-xs text-slate-500">{{ pickedCount }}/3 선택함</p>

    <!-- ② Bradley-Terry 변환기 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② · 점수 차를 선호 확률로: P(A 승) = σ(r_A − r_B)</p>
    <p class="mb-3 text-xs text-slate-500">보상 모델이 두 답변에 매긴 점수 차(Δr)를 움직여 보세요.</p>

    <div class="mb-2 flex flex-wrap items-center gap-2">
      <span class="text-sm text-slate-600">점수 차 Δr =</span>
      <button
        v-for="p in PRESETS"
        :key="p"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm transition"
        :class="delta === p
          ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-800'
          : 'border-slate-200 text-slate-600 hover:border-slate-300'"
        @click="delta = p"
      >
        {{ p > 0 ? `+${p}` : p }}
      </button>
      <input v-model.number="delta" type="range" min="-6" max="6" step="0.5" class="w-40 accent-indigo-600" />
      <span class="text-sm font-mono text-slate-500">{{ delta > 0 ? '+' : '' }}{{ delta }}</span>
    </div>

    <div class="rounded-lg bg-slate-50 p-4">
      <div class="mb-1 flex justify-between text-xs font-semibold">
        <span class="text-indigo-700">A가 선택될 확률 {{ pct }}%</span>
        <span class="text-slate-500">B {{ 100 - pct }}%</span>
      </div>
      <div class="flex h-4 w-full overflow-hidden rounded-full bg-slate-200">
        <div class="h-full bg-indigo-500 transition-all" :style="{ width: pct + '%' }" />
      </div>
      <p class="mt-2 text-sm text-slate-600">👀 {{ obs }}</p>
    </div>
  </div>
</template>
