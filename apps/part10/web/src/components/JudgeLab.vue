<script setup lang="ts">
// 9장 실험실 — AI 채점관(LLM 심판) 편향 3종 주입·측정:
//   신의 시점: 대결 200판, 품질 차 g=U(−1,1)+0.1 → 진짜 A 승률 54.5%(109/200), 길이 차 d=U(−1,1)
//   심판 점수 s = g + βpos·(A가 첫번째? +1:−1)·0.3 + βlen·d·0.2 + βself·(−0.15, 심판=B의 형제)
//   채점 방식: 단일(A 먼저 고정) vs 교차(순서 뒤집어 두 번 — 불일치는 판정 불가 0.5 처리)
// 완전 결정적(mulberry32 시드 900) — 노트북(ch09_judge.ipynb)과 동일 수치.
import { ref, computed } from 'vue'

function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const N = 200
const G: number[] = []
const D: number[] = []
{
  const rand = mulberry32(900)
  for (let i = 0; i < N; i++) {
    G.push(rand() * 2 - 1 + 0.1)
    D.push(rand() * 2 - 1)
  }
}
const TRUE_WINS = G.filter((g) => g > 0).length // 109
const B_POS = 0.3
const B_LEN = 0.2
const B_SELF = 0.15

const pos = ref(true)
const len = ref(true)
const self = ref(true)
const mode = ref<'single' | 'crossed'>('single')

function verdicts(aFirst: boolean): boolean[] {
  const out: boolean[] = []
  for (let i = 0; i < N; i++) {
    const s =
      G[i] +
      (pos.value ? B_POS * (aFirst ? 1 : -1) : 0) +
      (len.value ? B_LEN * D[i] : 0) +
      (self.value ? -B_SELF : 0)
    out.push(s > 0)
  }
  return out
}

const result = computed(() => {
  if (mode.value === 'single') {
    const v = verdicts(true)
    const wins = v.filter(Boolean).length
    let agree = 0
    for (let i = 0; i < N; i++) if (v[i] === G[i] > 0) agree++
    return { rate: (wins / N) * 100, undecided: 0, agree: (agree / N) * 100 }
  }
  const v1 = verdicts(true)
  const v2 = verdicts(false)
  let wins = 0
  let undecided = 0
  let agree = 0
  for (let i = 0; i < N; i++) {
    const truth = G[i] > 0
    if (v1[i] === v2[i]) {
      if (v1[i]) wins++
      if (v1[i] === truth) agree++
    } else {
      undecided++
      agree += 0.5
    }
  }
  return { rate: ((wins + undecided * 0.5) / N) * 100, undecided, agree: (agree / N) * 100 }
})

const distortion = computed(() => result.value.rate - (TRUE_WINS / N) * 100)
const bar = (v: number) => `${v}%`
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 편향 주입 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">
      ① AI 심판에게 편향 심기 — 신의 시점: 진짜 A 승률 {{ ((TRUE_WINS / N) * 100).toFixed(1) }}% ({{ TRUE_WINS }}/200판)
    </p>
    <div class="mb-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
      <label class="flex cursor-pointer items-center gap-1.5">
        <input v-model="pos" type="checkbox" class="h-4 w-4 accent-rose-500" />
        <span><b>위치 편향</b> — 먼저 보인 답 선호 (+0.3)</span>
      </label>
      <label class="flex cursor-pointer items-center gap-1.5">
        <input v-model="len" type="checkbox" class="h-4 w-4 accent-amber-500" />
        <span><b>길이 편향</b> — 긴 답 선호 (+0.2×길이차)</span>
      </label>
      <label class="flex cursor-pointer items-center gap-1.5">
        <input v-model="self" type="checkbox" class="h-4 w-4 accent-violet-500" />
        <span><b>자기 선호</b> — 심판이 B의 형제 모델 (B에 +0.15)</span>
      </label>
    </div>

    <!-- ② 채점 방식 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">② 채점 방식</p>
    <div class="mb-3 flex gap-1.5">
      <button
        type="button"
        class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
        :class="mode === 'single' ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="mode = 'single'"
      >
        단일 채점 (A를 항상 먼저 보여줌)
      </button>
      <button
        type="button"
        class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
        :class="mode === 'crossed' ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="mode = 'crossed'"
      >
        교차 채점 (순서 뒤집어 두 번)
      </button>
    </div>

    <!-- 결과 -->
    <div class="space-y-2 rounded-lg bg-slate-50 p-4">
      <div class="flex items-center gap-3">
        <span class="w-40 shrink-0 text-xs font-medium text-slate-500">진짜 승률 (신의 시점)</span>
        <div class="relative h-6 flex-1 overflow-hidden rounded-md bg-white ring-1 ring-slate-200">
          <div class="h-full rounded-md bg-emerald-400" :style="{ width: bar((TRUE_WINS / N) * 100) }" />
          <div class="absolute top-0 h-full border-l-2 border-dashed border-slate-500" style="left: 50%" />
        </div>
        <span class="w-14 shrink-0 text-right font-mono text-sm font-bold text-slate-800">{{ ((TRUE_WINS / N) * 100).toFixed(1) }}%</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="w-40 shrink-0 text-xs font-medium text-slate-500">AI 심판의 판정</span>
        <div class="relative h-6 flex-1 overflow-hidden rounded-md bg-white ring-1 ring-slate-200">
          <div class="h-full rounded-md bg-rose-400 transition-all duration-300" :style="{ width: bar(result.rate) }" />
          <div class="absolute top-0 h-full border-l-2 border-dashed border-slate-500" style="left: 50%" />
          <div class="absolute top-0 h-full border-l-2 border-emerald-600" :style="{ left: bar((TRUE_WINS / N) * 100) }" />
        </div>
        <span class="w-14 shrink-0 text-right font-mono text-sm font-bold text-slate-800">{{ result.rate.toFixed(1) }}%</span>
      </div>
      <div class="flex flex-wrap gap-2 text-xs">
        <span class="rounded-md px-2 py-1 font-semibold" :class="Math.abs(distortion) < 1.5 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'">
          왜곡 {{ distortion >= 0 ? '+' : '' }}{{ distortion.toFixed(1) }}%p
        </span>
        <span class="rounded-md bg-slate-200 px-2 py-1 text-slate-600">사람(정답)과 일치율 {{ result.agree.toFixed(1) }}%</span>
        <span v-if="mode === 'crossed'" class="rounded-md bg-amber-100 px-2 py-1 text-amber-800">
          판정 불가 {{ result.undecided }}판 — 순서를 바꾸니 판정이 뒤집힌 판 ({{ ((result.undecided / N) * 100).toFixed(0) }}%)
        </span>
      </div>
      <p class="rounded-md bg-white px-3 py-2 text-xs leading-relaxed text-slate-500 ring-1 ring-slate-100">
        <template v-if="mode === 'single' && pos">
          위치 편향이 판을 흔들고 있습니다 — "교차 채점"으로 바꿔 위치를 지워 보세요.
        </template>
        <template v-else-if="mode === 'crossed' && self">
          위치는 지웠지만 아직 진짜와 어긋납니다 — <b>자기 선호는 순서 뒤집기로 못 지웁니다</b>.
          자기 선호를 꺼 보세요(= 이해관계 없는 심판으로 교체).
        </template>
        <template v-else-if="mode === 'crossed' && !self && Math.abs(distortion) < 2.5">
          진짜 승률에 근접했습니다 — 위치는 교차로, 자기 선호는 심판 교체로. 남은 길이 편향은
          채점 기준(루브릭)으로 다스립니다.
        </template>
        <template v-else-if="!pos && len && !self && mode === 'single'">
          집계 승률은 진짜와 같아 보이죠? 그런데 일치율이 95% — <b>개별 판정 10판이 조용히
          뒤집혔습니다</b>. 집계가 맞다고 채점이 옳은 게 아닙니다.
        </template>
        <template v-else>편향 토글과 채점 방식을 바꿔 가며 왜곡·일치율의 변화를 관찰해 보세요.</template>
      </p>
    </div>
  </div>
</template>
