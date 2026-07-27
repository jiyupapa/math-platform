<script setup lang="ts">
// ch8 인터랙티브 — ① 눈금 갈아타기 기계: 실수 가중치 8개를 b비트 정수 자 + 축척으로 (수직선 시각화)
//                 ② 다음 토큰 대결: 박빙 로짓(마진 0.005)이 몇 비트까지 버티나 — int8·4 유지, int3 역전.
// 오프라인·결정적 — 고정 toy 벡터(노트북과 동일, assert 로 교차 검증됨). 난수 없음.
import { computed, ref } from 'vue'

// ── 공통: 대칭 양자화 ─────────────────────────────────────────
function quantizeRow(row: number[], bits: number) {
  const levels = 2 ** (bits - 1) - 1 // int8 → 127, int4 → 7, int2 → 1
  const s = Math.max(...row.map(Math.abs)) / levels
  const q = row.map((w) => Math.round(w / s))
  const deq = q.map((v) => v * s)
  return { s, q, deq }
}

// ── ① 눈금 갈아타기 기계 ──────────────────────────────────────
const W0 = [0.11, -0.08, 0.05, 0.02, -0.03, 0.07, -0.11, 0.01]
const bits1 = ref(8)
const machine = computed(() => {
  const { s, q, deq } = quantizeRow(W0, bits1.value)
  const rows = W0.map((w, i) => ({ w, q: q[i], deq: deq[i], err: Math.abs(deq[i] - w) }))
  return { s, rows, maxErr: Math.max(...rows.map((r) => r.err)), levels: 2 ** (bits1.value - 1) - 1 }
})
// 수직선 좌표 (−0.12 ~ +0.12)
const px = (v: number) => 20 + ((v + 0.12) / 0.24) * 280
const tickMarks = computed(() => {
  const out: number[] = []
  for (let k = -machine.value.levels; k <= machine.value.levels; k++) {
    const v = k * machine.value.s
    if (Math.abs(v) <= 0.121) out.push(v)
  }
  return out
})

// ── ② 다음 토큰 대결 ──────────────────────────────────────────
// 고정 미니 출력층: 어휘 4개 × 차원 8. fp 로짓 = [0.295, 0.290, −0.275, 0.049] — 1·2등 마진 0.005!
const VOCAB = ['고양이', '강아지', '토끼', '거북이']
const W = [
  [0.11, -0.08, 0.05, 0.02, -0.03, 0.07, -0.11, 0.01],
  [0.08, -0.03, 0.09, 0.0, 0.01, 0.06, 0.07, 0.09],
  [-0.02, 0.1, -0.07, 0.01, 0.06, -0.05, 0.02, -0.04],
  [-0.1, 0.03, 0.08, -0.06, 0.04, 0.01, -0.03, 0.09],
]
const X = [0.8, -0.5, 1.2, 0.3, -0.9, 0.6, -0.2, 1.0]
const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0)
const fpLogits = W.map((r) => dot(r, X))
const fpRank = fpLogits.indexOf(Math.max(...fpLogits))

const BIT_OPTS = [8, 4, 3, 2]
const bits2 = ref(8)
const duel = computed(() => {
  const qLogits = W.map((r) => dot(quantizeRow(r, bits2.value).deq, X))
  const qRank = qLogits.indexOf(Math.max(...qLogits))
  const maxErr = Math.max(...qLogits.map((v, i) => Math.abs(v - fpLogits[i])))
  return { qLogits, qRank, same: qRank === fpRank, maxErr, mem: (32 / bits2.value).toFixed(0) }
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 눈금 갈아타기 기계 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 눈금 갈아타기 기계: 실수 자 → 정수 자 + 축척 스티커</p>
    <p class="mb-3 text-xs text-slate-500">
      toy 가중치 8개를 b비트 정수 자로 옮깁니다 — 축척 s = max|w| ÷ 눈금 수, 저장은 정수
      q = round(w/s), 복원은 q×s. 비트를 줄이며 점들이 눈금에 강제로 붙는 걸 보세요.
    </p>

    <label class="block text-xs text-slate-500">
      비트 수 b = <b class="text-slate-700">{{ bits1 }}</b> → 한쪽 눈금 {{ machine.levels.toLocaleString('en-US') }}개 · 축척 s = {{ machine.s.toExponential(3) }}
      <input v-model.number="bits1" type="range" min="2" max="8" step="1" class="mt-1 w-full accent-indigo-600" />
    </label>

    <svg viewBox="0 0 320 90" class="mt-2 w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <line :x1="px(-0.12)" y1="45" :x2="px(0.12)" y2="45" stroke="var(--c-slate-300)" stroke-width="1.5" />
      <line v-for="t in tickMarks" :key="t" :x1="px(t)" y1="40" :x2="px(t)" y2="50" stroke="var(--c-slate-400)" stroke-width="1" />
      <template v-for="(r, i) in machine.rows" :key="i">
        <line :x1="px(r.w)" y1="25" :x2="px(r.deq)" y2="45" stroke="var(--c-rose-300)" stroke-width="1" />
        <circle :cx="px(r.w)" cy="25" r="3.5" fill="var(--c-indigo-500)" />
        <circle :cx="px(r.deq)" cy="45" r="3.5" fill="var(--c-orange-500)" />
      </template>
      <text :x="px(-0.115)" y="15" font-size="9" fill="var(--c-indigo-500)">● 원래 값(실수)</text>
      <text :x="px(-0.115)" y="70" font-size="9" fill="var(--c-orange-500)">● 복원 값(눈금 위)</text>
      <text :x="px(0)" y="82" text-anchor="middle" font-size="9" fill="var(--c-slate-400)">0</text>
    </svg>

    <div class="mt-2 overflow-x-auto">
      <table class="w-full text-right font-mono text-xs text-slate-600">
        <thead>
          <tr class="text-slate-500">
            <th class="p-1 text-left font-normal">원래 w</th>
            <th class="p-1 font-normal">정수 q</th>
            <th class="p-1 font-normal">복원 q×s</th>
            <th class="p-1 font-normal">오차</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in machine.rows" :key="i" class="border-t border-slate-100">
            <td class="p-1 text-left">{{ r.w }}</td>
            <td class="p-1 font-bold text-indigo-600">{{ r.q }}</td>
            <td class="p-1">{{ r.deq.toFixed(5) }}</td>
            <td class="p-1" :class="r.err > machine.s ? 'text-rose-700' : 'text-slate-500'">{{ r.err.toExponential(1) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-2 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      👀 저장되는 건 <b>1바이트짜리 정수 q 와, 행 전체가 공유하는 축척 s 하나</b>뿐입니다.
      오차는 언제나 <b>눈금 간격의 절반(s/2 = {{ (machine.s / 2).toExponential(1) }}) 이하</b> —
      워밍업부터 본 "가장 가까운 눈금으로"가 여기서도 법칙이에요. 비트를 줄이면 눈금이
      성겨지고(b−1 제곱으로 절반씩), 오차 한도가 그만큼 커집니다.
    </p>

    <!-- ② 다음 토큰 대결 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 다음 토큰 대결: 박빙의 순위는 몇 비트까지 버틸까</p>
    <p class="mb-3 text-xs text-slate-500">
      미니 출력층(어휘 4개 × 차원 8)의 로짓 — fp 로는 <b>고양이 0.295 vs 강아지 0.290</b>,
      마진 겨우 0.005 인 박빙 승부입니다. 가중치를 양자화해도 1등이 지켜질까요?
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="b in BIT_OPTS"
        :key="b"
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="bits2 === b ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="bits2 = b"
      >
        int{{ b }}
      </button>
      <span class="self-center rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">가중치 메모리 fp32 대비 1/{{ duel.mem }}</span>
    </div>

    <div class="mt-2 space-y-1">
      <div v-for="(name, i) in VOCAB" :key="name" class="flex items-center gap-2 rounded-lg p-2 text-xs" :class="i === duel.qRank ? 'bg-emerald-50' : 'bg-slate-50'">
        <span class="w-14 shrink-0 font-semibold text-slate-600">{{ name }}</span>
        <span class="w-24 shrink-0 font-mono text-slate-500">fp {{ fpLogits[i].toFixed(3) }}{{ i === fpRank ? ' 👑' : '' }}</span>
        <span class="w-28 shrink-0 font-mono" :class="i === duel.qRank ? 'font-bold text-emerald-700' : 'text-slate-500'">int{{ bits2 }} {{ duel.qLogits[i].toFixed(3) }}{{ i === duel.qRank ? ' 👑' : '' }}</span>
        <div class="h-3 min-w-0 flex-1 overflow-hidden rounded bg-white">
          <div class="h-full rounded" :class="i === duel.qRank ? 'bg-emerald-400' : 'bg-slate-300'" :style="{ width: Math.max(2, (duel.qLogits[i] + 0.3) / 0.7 * 100) + '%' }" />
        </div>
      </div>
    </div>

    <p class="mt-2 text-sm font-medium" :class="duel.same ? 'text-emerald-700' : 'text-rose-700'">
      {{ duel.same ? `✅ 순위 유지 — 1등은 여전히 ${VOCAB[fpRank]} (로짓 오차 최대 ${duel.maxErr.toFixed(4)} — 마진 0.005 안쪽)` : `❗ 순위 역전 — 1등이 ${VOCAB[duel.qRank]} 로 바뀌었다! (로짓 오차 ${duel.maxErr.toFixed(3)} ≫ 마진 0.005)` }}
    </p>

    <p class="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 <b>int8(오차 0.001)·int4(0.004)는 박빙 승부도 지켰고, int3(0.03)부터 뒤집혔습니다</b> —
      결정(argmax)은 로짓 오차가 마진보다 작은 한 무사하다는 것, 그리고 실전의 마진은 대부분
      이보다 훨씬 크다는 것(확신에 찬 예측일수록 둔감). 개별 가중치 오차가 내적에서 ±로
      상쇄되는 것(4장의 √n!)도 한몫합니다 — 차원이 8이 아니라 4,096이면 상쇄는 더 유리해져요.
    </p>
  </div>
</template>
