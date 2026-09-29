<script setup lang="ts">
// 7장 실험실 — 같은 토큰 예산을 "길게 하나" vs "짧게 여럿 + 다수결"에 배분해 보며
// 추론 시점 컴퓨트의 배분 감각을 얻는다. 완전 해석적·결정적(난수 없음) — 교육용 toy 모형:
//   쉬운 문제 a(L) = 0.95 − 0.45·e^(−L/500), 어려운 문제 a(L) = 0.9 − 0.7·e^(−L/4000)
// 노트북(ch07_thinking.ipynb)과 동일 수식·수치.
import { ref, computed } from 'vue'

const BUDGETS = [1000, 2000, 4000, 8000, 16000, 32000, 64000]
const WON_PER_TOKEN = 0.002 // 가상 단가 — 비용 감각용

const acc = (mode: 'easy' | 'hard', L: number) =>
  mode === 'easy' ? 0.95 - 0.45 * Math.exp(-L / 500) : 0.9 - 0.7 * Math.exp(-L / 4000)

function comb(n: number, k: number): number {
  let r = 1
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1)
  return r
}
/** k표(홀수) 다수결 정답률 — 5장의 이항 합 그대로 */
function maj(p: number, k: number): number {
  let s = 0
  for (let i = Math.ceil(k / 2); i <= k; i++) s += comb(k, i) * Math.pow(p, i) * Math.pow(1 - p, k - i)
  return s
}

const mode = ref<'easy' | 'hard'>('hard')
const budget = ref(8000)

interface Strat {
  key: string
  label: string
  n: number
  acc: number
  p: number
}
const strats = computed<Strat[]>(() => {
  const B = budget.value
  const rows = [
    { key: 'long', label: '① 길게 하나: 풀이 1개에 전부', n: 1 },
    { key: 'maj3', label: '② 셋이 투표: 풀이 3개 다수결', n: 3 },
    { key: 'maj9', label: '③ 아홉이 투표: 풀이 9개 다수결', n: 9 },
  ]
  return rows.map((r) => {
    const p = acc(mode.value, B / r.n)
    return { ...r, p, acc: r.n === 1 ? p : maj(p, r.n) }
  })
})
const winner = computed(() => strats.value.reduce((a, b) => (b.acc > a.acc ? b : a)))
const cost = computed(() => (budget.value * WON_PER_TOKEN).toLocaleString())

const showTable = ref(false)
const tableRows = computed(() =>
  BUDGETS.map((B) => {
    const cells = [1, 3, 9].map((n) => {
      const p = acc(mode.value, B / n)
      return n === 1 ? p : maj(p, n)
    })
    const best = Math.max(...cells)
    return { B, cells, best }
  }),
)
const pct = (v: number) => (v * 100).toFixed(1)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 문제 난이도 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 문제 난이도: 생각이 빨리 익는 문제인가, 오래 걸리는 문제인가</p>
    <div class="mb-4 flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
        :class="mode === 'easy' ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="mode = 'easy'"
      >
        쉬운 문제 (짧은 생각에 포화)
      </button>
      <button
        type="button"
        class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
        :class="mode === 'hard' ? 'border-rose-500 bg-rose-50 font-semibold text-rose-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="mode = 'hard'"
      >
        어려운 문제 (긴 생각이 필수)
      </button>
    </div>

    <!-- ② 예산 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">② 토큰 예산: 이 문제 하나에 얼마나 쓸까 (전략과 무관하게 같은 돈)</p>
    <div class="mb-2 flex flex-wrap items-center gap-1.5">
      <button
        v-for="B in BUDGETS"
        :key="B"
        type="button"
        class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
        :class="budget === B ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="budget = B"
      >
        {{ (B / 1000) }}k
      </button>
      <span class="ml-auto text-xs text-slate-500">이 예산의 값: 약 ₩{{ cost }}/문제 (가상 단가 ₩0.002/토큰)</span>
    </div>

    <!-- ③ 전략 비교 -->
    <div class="space-y-3 rounded-lg bg-slate-50 p-4">
      <div v-for="s in strats" :key="s.key" class="flex items-center gap-3">
        <span class="w-56 shrink-0 text-sm" :class="s.key === winner.key ? 'font-bold text-slate-800' : 'text-slate-600'">
          {{ s.label }}
          <span v-if="s.key === winner.key" class="ml-1 rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-700">승</span>
        </span>
        <div class="relative h-6 flex-1 overflow-hidden rounded-md bg-white ring-1 ring-slate-200">
          <div
            class="h-full rounded-md transition-all duration-300"
            :class="s.key === winner.key ? 'bg-emerald-400' : 'bg-indigo-300'"
            :style="{ width: s.acc * 100 + '%' }"
          />
        </div>
        <span class="w-16 shrink-0 text-right font-mono text-sm font-bold text-slate-800">{{ pct(s.acc) }}%</span>
      </div>
      <p class="text-xs text-slate-500">
        투표 전략의 풀이 하나당 길이 = 예산 ÷ 표 수라서 표가 많을수록 풀이 하나는 짧아집니다(정확도
        {{ pct(strats[1].p) }}% / {{ pct(strats[2].p) }}%).
      </p>
      <p
        v-if="strats[2].p < 0.5"
        class="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800"
      >
        ⚠️ 아홉으로 쪼개면 풀이 하나의 정답률이 {{ pct(strats[2].p) }}%로 과반 미만입니다.
        5장의 경고 그대로, 이 다수결은 <b>틀린 답으로 수렴</b>해요.
      </p>
    </div>

    <!-- ④ 예산 스윕 표 -->
    <label class="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input v-model="showTable" type="checkbox" class="h-4 w-4 accent-indigo-600" />
      <span><b>예산별 승자 한눈에 보기</b>: 어디서 전략이 뒤집히나</span>
    </label>
    <div v-if="showTable" class="mt-2 overflow-x-auto rounded-md bg-amber-50 px-3 py-2">
      <table class="w-full text-sm text-amber-900">
        <thead>
          <tr class="text-left text-xs text-amber-700">
            <th class="py-1 pr-2">예산</th>
            <th class="py-1 pr-2">① 길게 하나</th>
            <th class="py-1 pr-2">② 셋이 투표</th>
            <th class="py-1">③ 아홉이 투표</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableRows" :key="row.B" class="border-t border-amber-200/60">
            <td class="py-1 pr-2 font-mono">{{ row.B / 1000 }}k</td>
            <td v-for="(c, i) in row.cells" :key="i" class="py-1 pr-2 font-mono" :class="c === row.best ? 'font-bold underline' : ''">
              {{ pct(c) }}%
            </td>
          </tr>
        </tbody>
      </table>
      <p class="pt-1 text-xs text-amber-800">
        밑줄 = 그 예산의 승자. 쉬운 문제는 일찍부터 “나눠 투표”가, 어려운 문제는 한참 동안
        “길게 하나”가 이기다가 예산이 커지면 뒤집힙니다.
      </p>
    </div>
  </div>
</template>
