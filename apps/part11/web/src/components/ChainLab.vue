<script setup lang="ts">
// 워밍업 실험실 — 걸음 정확도를 미리 정해둔 AI 일꾼에게 단계 수가 다른 심부름을 맡겨 보며
// "일의 성공률은 걸음의 곱"을 목격한다. 완전 결정적: mulberry32(시드 = p%×100000 + 단계수×100 + 회차) —
// 노트북(ch00_sample.ipynb)의 Python 포트와 비트 단위로 같은 난수열을 쓴다.
import { ref, computed } from 'vue'

// 신의 시점 — 한 걸음을 맞힐 확률 (현실에선 아무도 정확히 모르는 값)
const PS = [80, 90, 95, 99]
const STEPS = [1, 3, 5, 10, 20]
const ROUNDS = 20

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

/** 심부름 1회 — 처음 실패한 단계 번호(1부터), 끝까지 성공하면 0 (결정적) */
function runTask(pPct: number, n: number, round: number): number {
  const rand = mulberry32(pPct * 100000 + n * 100 + round)
  for (let i = 1; i <= n; i++) if (rand() >= pPct / 100) return i
  return 0
}

const pPct = ref(90)
const n = ref(10)
const round = ref(3) // 3회차가 기본 — 사슬이 끊기는 순간부터 보여준다

const failedAt = computed(() => runTask(pPct.value, n.value, round.value))

/** 단계별 상태: ok / fail / skip */
const stepMarks = computed(() => {
  const f = failedAt.value
  return Array.from({ length: n.value }, (_, i) => {
    const step = i + 1
    if (f === 0 || step < f) return 'ok'
    if (step === f) return 'fail'
    return 'skip'
  })
})

// 이 설정으로 20번 다시 맡긴 요약 (결정적 — 항상 같은 표)
const summary = computed(() => {
  const marks: boolean[] = []
  for (let r = 1; r <= ROUNDS; r++) marks.push(runTask(pPct.value, n.value, r) === 0)
  return { marks, wins: marks.filter(Boolean).length }
})

const theory = computed(() => Math.pow(pPct.value / 100, n.value) * 100)
// 성공률이 절반 아래로 떨어지는 단계 수
const halfSteps = computed(() => Math.ceil(Math.log(0.5) / Math.log(pPct.value / 100)))

const showTheory = ref(false)
const theoryRows = computed(() =>
  STEPS.map((s) => ({ s, pct: Math.pow(pPct.value / 100, s) * 100 })),
)

function retry() {
  round.value = (round.value % ROUNDS) + 1
}
function setN(v: number) {
  n.value = v
  round.value = 3
}
function setP(v: number) {
  pPct.value = v
  round.value = 3
}
const fmt = (v: number) => (v >= 10 ? v.toFixed(1) : v.toFixed(1))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 신의 시점 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 걸음 정확도 (신의 시점 — 한 단계를 맞힐 확률을 미리 정해 둡니다)</p>
    <div class="mb-4 flex flex-wrap items-center gap-1.5">
      <button
        v-for="v in PS"
        :key="v"
        type="button"
        class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
        :class="pPct === v ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="setP(v)"
      >
        {{ v }}%
      </button>
      <span class="ml-2 text-xs text-slate-500">한 단계씩만 보면 꽤 믿음직한 일꾼입니다</span>
    </div>

    <!-- ② 일 맡기기 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">② 심부름 맡기기 — 몇 단계짜리 일인지 고르고, 다시 맡겨 보세요</p>
    <div class="mb-2 flex flex-wrap items-center gap-1.5">
      <button
        v-for="v in STEPS"
        :key="v"
        type="button"
        class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
        :class="n === v ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="setN(v)"
      >
        {{ v }}단계
      </button>
      <button
        type="button"
        class="ml-auto rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
        @click="retry"
      >
        🎲 다시 맡기기 ({{ round }}/{{ ROUNDS }}회차)
      </button>
    </div>

    <div class="space-y-3 rounded-lg bg-slate-50 p-4">
      <div class="flex flex-wrap gap-1">
        <span
          v-for="(m, i) in stepMarks"
          :key="i"
          class="flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold"
          :class="m === 'ok' ? 'bg-emerald-400 text-white' : m === 'fail' ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'"
          :title="`${i + 1}단계`"
        >{{ m === 'ok' ? '✓' : m === 'fail' ? '✗' : i + 1 }}</span>
      </div>
      <p
        class="rounded-md px-3 py-2 text-sm font-medium"
        :class="failedAt === 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'"
      >
        <template v-if="failedAt === 0">🎉 이번엔 끝까지 해냈습니다 — 하지만 아래 20회 요약을 보세요.</template>
        <template v-else>😱 {{ failedAt }}단계에서 미끄러졌습니다 — 앞의 {{ failedAt - 1 }}걸음이 전부 물거품이 됐어요.</template>
      </p>
      <p class="text-xs text-slate-500">한 단계라도 틀리면 일 전체가 실패로 칩니다 — 잘못된 표가 들어간 보고서처럼요.</p>
    </div>

    <!-- ③ 20회 요약 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">③ 같은 일을 20번 맡기면 — 몇 번이나 해내나</p>
    <div class="rounded-lg bg-slate-50 p-4">
      <div class="mb-2 flex flex-wrap gap-1">
        <span
          v-for="(ok, i) in summary.marks"
          :key="i"
          class="flex h-6 w-6 items-center justify-center rounded text-xs font-bold"
          :class="ok ? 'bg-emerald-400 text-white' : 'bg-rose-400 text-white'"
          :title="`${i + 1}회차`"
        >{{ ok ? 'O' : '✗' }}</span>
      </div>
      <p class="text-sm text-slate-700">
        걸음 정확도 <b>{{ pPct }}%</b> · <b>{{ n }}단계</b> 일을 20번 —
        성공 <b class="text-emerald-700">{{ summary.wins }}번</b> (이론값 {{ fmt(theory) }}%).
        <template v-if="theory < 40">걸음은 믿음직한데 일은 복불복이네요.</template>
        <template v-else-if="theory < 75">아직 안심하긴 이릅니다.</template>
        <template v-else>이 정도면 제법 맡길 만하네요.</template>
      </p>
    </div>

    <!-- ④ 이론 곡선 -->
    <label class="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input v-model="showTheory" type="checkbox" class="h-4 w-4 accent-indigo-600" />
      <span><b>이론 성공률 보기</b> — 걸음 정확도를 단계 수만큼 곱하면 (정확한 수학은 2장에서)</span>
    </label>
    <div v-if="showTheory" class="mt-2 space-y-1.5 rounded-md bg-amber-50 px-3 py-2">
      <div v-for="row in theoryRows" :key="row.s" class="flex items-center gap-2 text-sm text-amber-900">
        <span class="w-14 shrink-0 text-right font-mono">{{ row.s }}단계</span>
        <div class="h-3.5 flex-1 overflow-hidden rounded bg-white/70">
          <div class="h-full rounded bg-amber-400" :style="{ width: row.pct + '%' }" />
        </div>
        <span class="w-14 shrink-0 font-mono text-xs">{{ fmt(row.pct) }}%</span>
      </div>
      <p class="pt-1 text-xs text-amber-800">
        {{ pPct }}%짜리 걸음은 <b>{{ halfSteps }}단계</b>부터 성공률이 절반 아래로 떨어집니다 —
        일이 길수록 곱이 무섭게 깎여요.
      </p>
    </div>
  </div>
</template>
