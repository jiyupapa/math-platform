<script setup lang="ts">
// 3장 실험실 — 미니 LM 데이터 스케일링: 신의 시점(진짜 전이표를 아는) 8단어 마르코프 언어에
// D 토큰을 먹여 바이그램을 학습시키고, 진짜 분포 대비 손실 L(D)를 실측한다.
// 총 손실은 바닥(H)에 붙으며 휘고, 초과 손실(L−H)은 로그-로그에서 직선(기울기 ≈ −1.06).
// 완전 결정적(mulberry32 seed 42) — 노트북(ch03_powerlaw.ipynb)과 전 자릿수 일치.
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

const V = 8
// 단어: 고양이 · 는 · 밥을 · 물을 · 먹는다 · 마신다 · 잔다 · . (인덱스 0~7)
// 진짜 전이표 (행 = 현재 단어 → 열 = 다음 단어 확률)
const P = [
  [0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0.5, 0.3, 0, 0, 0.2, 0],
  [0, 0, 0, 0, 0.9, 0.1, 0, 0],
  [0, 0, 0, 0, 0.1, 0.9, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0],
]

function stationary(): number[] {
  let pi = new Array(V).fill(1 / V)
  for (let it = 0; it < 500; it++) {
    const next = new Array(V).fill(0)
    for (let i = 0; i < V; i++) for (let j = 0; j < V; j++) next[j] += pi[i] * P[i][j]
    pi = next
  }
  return pi
}
const PI = stationary()
const H = (() => {
  let h = 0
  for (let i = 0; i < V; i++)
    for (let j = 0; j < V; j++) if (P[i][j] > 0) h += PI[i] * P[i][j] * -Math.log(P[i][j])
  return h
})()

function corpus(n: number, seed: number): number[] {
  const rand = mulberry32(seed)
  const out = new Array<number>(n)
  let s = 7
  for (let k = 0; k < n; k++) {
    const r = rand()
    let acc = 0
    let j = 0
    for (; j < V; j++) {
      acc += P[s][j]
      if (r < acc) break
    }
    if (j >= V) j = V - 1
    out[k] = j
    s = j
  }
  return out
}

const ALPHA = 0.1
function lossAfter(d: number, tokens: number[]): number {
  const counts = Array.from({ length: V }, () => new Array(V).fill(0))
  let s = 7
  for (let k = 0; k < d; k++) {
    counts[s][tokens[k]]++
    s = tokens[k]
  }
  let L = 0
  for (let i = 0; i < V; i++) {
    const rowSum = counts[i].reduce((a: number, b: number) => a + b, 0)
    for (let j = 0; j < V; j++) {
      if (P[i][j] === 0) continue
      const phat = (counts[i][j] + ALPHA) / (rowSum + ALPHA * V)
      L += PI[i] * P[i][j] * -Math.log(phat)
    }
  }
  return L
}

const DS = [100, 300, 1000, 3000, 10000, 30000, 100000]
const TOKENS = corpus(100000, 42)
const ROWS = DS.map((d) => {
  const L = lossAfter(d, TOKENS)
  return { d, L, ex: L - H }
})

function fitLog(rows: { d: number; ex: number }[]) {
  const xs = rows.map((r) => Math.log10(r.d))
  const ys = rows.map((r) => Math.log10(r.ex))
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my)
    sxx += (xs[i] - mx) ** 2
    syy += (ys[i] - my) ** 2
  }
  return { b: sxy / sxx, a: my - (sxy / sxx) * mx, r2: (sxy * sxy) / (sxx * syy) }
}
const FIT_ALL = fitLog(ROWS)
const FIT_HEAD = fitLog(ROWS.slice(0, 5))
const PRED_EX = 10 ** (FIT_HEAD.a + FIT_HEAD.b * 5)
const PRED_L = H + PRED_EX
const REAL_L = ROWS[6].L

// ── 상태 ─────────────────────────────────────────────────────────────────────
const sel = ref(2) // D=1000
const mode = ref<'total' | 'excess'>('total')
const predict = ref(false)
function togglePredict() {
  predict.value = !predict.value
  if (predict.value) mode.value = 'excess'
}

// ── SVG 좌표 ─────────────────────────────────────────────────────────────────
const W = 360
const HH = 230
const PAD = { l: 46, r: 12, t: 12, b: 26 }
const gx = (d: number) => PAD.l + ((Math.log10(d) - 2) / 3) * (W - PAD.l - PAD.r)
// total: L ∈ [0.26, 0.36] 선형 / excess: log10 ∈ [-4.6, -0.9]
function gy(row: { L: number; ex: number }): number {
  const t =
    mode.value === 'total'
      ? (row.L - 0.26) / (0.36 - 0.26)
      : (Math.log10(row.ex) - -4.6) / (-0.9 - -4.6)
  return HH - PAD.b - t * (HH - PAD.b - PAD.t)
}
const floorY = computed(() =>
  mode.value === 'total' ? HH - PAD.b - ((H - 0.26) / 0.1) * (HH - PAD.b - PAD.t) : null,
)
const fitLinePts = computed(() => {
  if (mode.value !== 'excess') return null
  const f = predict.value ? FIT_HEAD : FIT_ALL
  const y = (lx: number) => {
    const ly = f.a + f.b * lx
    return HH - PAD.b - ((ly - -4.6) / 3.7) * (HH - PAD.b - PAD.t)
  }
  return { x1: gx(100), y1: y(2), x2: gx(100000), y2: y(5) }
})
const fmt = (v: number, digits = 4) => v.toFixed(digits)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 고양이 세계 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 실험용 미니 언어 — "고양이 세계" (신의 시점: 진짜 규칙을 알고 있음)</p>
    <div class="mb-2 flex flex-wrap items-center gap-2 text-sm">
      <span class="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
        고양이→는 · 는→(밥을 50% | 물을 30% | 잔다 20%) · 밥을→(먹는다 90% | 마신다 10%) · 물을→(마신다 90% | 먹는다 10%) · 동사→. · .→고양이
      </span>
      <span class="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-800">
        바닥(진짜 불확실성) H = {{ fmt(H) }} nat — 완벽히 배워도 여기까지
      </span>
    </div>

    <!-- ② 데이터 스윕 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">② 데이터 D를 늘려 먹이며 손실 실측 — 그리고 종이를 바꿔 보세요</p>
    <div class="mb-2 flex flex-wrap items-center gap-1.5">
      <button
        v-for="(r, i) in ROWS"
        :key="r.d"
        type="button"
        class="rounded-lg border px-2 py-1 font-mono text-xs transition-colors"
        :class="sel === i ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="sel = i"
      >
        {{ r.d.toLocaleString() }}
      </button>
      <div class="ml-auto flex gap-1 rounded-lg border border-slate-200 p-0.5 text-xs">
        <button
          type="button"
          class="rounded-md px-2 py-1"
          :class="mode === 'total' ? 'bg-slate-800 font-semibold text-white' : 'text-slate-500'"
          @click="mode = 'total'; predict = false"
        >
          총 손실
        </button>
        <button
          type="button"
          class="rounded-md px-2 py-1"
          :class="mode === 'excess' ? 'bg-slate-800 font-semibold text-white' : 'text-slate-500'"
          @click="mode = 'excess'"
        >
          초과 손실 (바닥 뺌)
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-start gap-4">
      <svg :viewBox="`0 0 ${W} ${HH}`" class="h-56 w-full max-w-md rounded-lg bg-slate-50 ring-1 ring-slate-200">
        <!-- 격자 (x: 10^2~10^5) -->
        <line v-for="e in 4" :key="'x' + e" :x1="gx(10 ** (e + 1))" :x2="gx(10 ** (e + 1))" :y1="PAD.t" :y2="HH - PAD.b" stroke="#e2e8f0" />
        <text v-for="e in 4" :key="'xl' + e" :x="gx(10 ** (e + 1))" :y="HH - 10" text-anchor="middle" class="fill-slate-400" font-size="9">
          {{ (10 ** (e + 1)).toLocaleString() }}
        </text>
        <!-- 바닥선 (총 손실 모드) -->
        <template v-if="floorY !== null">
          <line :x1="PAD.l" :x2="W - PAD.r" :y1="floorY" :y2="floorY" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="5 4" />
          <text :x="W - PAD.r - 2" :y="floorY - 4" text-anchor="end" class="fill-amber-600" font-size="9">바닥 H = {{ fmt(H, 3) }}</text>
        </template>
        <!-- 적합 직선 (초과 모드) -->
        <line
          v-if="fitLinePts"
          :x1="fitLinePts.x1"
          :y1="fitLinePts.y1"
          :x2="fitLinePts.x2"
          :y2="fitLinePts.y2"
          :stroke="predict ? '#e11d48' : '#10b981'"
          stroke-width="1.5"
          :stroke-dasharray="predict ? '6 4' : undefined"
        />
        <!-- 점들 -->
        <g v-for="(r, i) in ROWS" :key="r.d">
          <circle
            v-if="!predict || i < 5 || mode !== 'excess'"
            :cx="gx(r.d)"
            :cy="gy(r)"
            :r="sel === i ? 6 : 4"
            :fill="sel === i ? '#4f46e5' : '#818cf8'"
          />
          <!-- 예측 모드: 마지막 두 점은 '정답 공개'로 표시 -->
          <circle v-else :cx="gx(r.d)" :cy="gy(r)" r="4" fill="none" stroke="#e11d48" stroke-width="1.5" />
        </g>
      </svg>

      <div class="min-w-52 flex-1 space-y-2 text-sm">
        <div class="rounded-lg bg-slate-50 p-3">
          <p class="text-xs text-slate-400">D = {{ ROWS[sel].d.toLocaleString() }} 토큰으로 배운 뒤</p>
          <p class="mt-0.5 font-mono font-bold text-slate-800">손실 L = {{ fmt(ROWS[sel].L) }} nat</p>
          <p class="font-mono text-xs text-slate-500">초과 손실 L − H = {{ ROWS[sel].ex.toExponential(2) }}</p>
        </div>
        <p v-if="mode === 'total'" class="rounded-md bg-slate-100 px-3 py-2 text-xs leading-relaxed text-slate-600">
          로그 x축인데도 곡선이 <b>휘면서 주황 점선(바닥)에 달라붙습니다</b> — 아무리 먹여도
          H 아래로는 못 내려가요. "초과 손실" 버튼으로 바닥을 빼 보세요.
        </p>
        <p v-else-if="!predict" class="rounded-md bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-800">
          📏 <b>직선!</b> 바닥을 빼니 로그-로그에서 펴졌습니다 — 기울기
          <b>{{ FIT_ALL.b.toFixed(2) }}</b> (R² = {{ FIT_ALL.r2.toFixed(3) }}).
          데이터 10배마다 남은 배울 것이 약 1/10로 — 이것이 <b>스케일링 법칙</b>입니다.
        </p>
        <p v-else class="rounded-md bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-800">
          🔮 <b>앞 5점(싼 실험)만으로</b> 그은 빨간 점선을 D=100,000까지 연장 —
          예측 손실 <b>{{ fmt(PRED_L) }}</b> vs 실측 <b>{{ fmt(REAL_L) }}</b>
          (오차 {{ ((Math.abs(PRED_L - REAL_L) / REAL_L) * 100).toFixed(3) }}%).
          작은 실험이 10배 큰 훈련을 맞혔습니다.
        </p>
        <button
          type="button"
          class="w-full rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
          :class="predict ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-indigo-600 text-white hover:bg-indigo-500'"
          @click="togglePredict"
        >
          {{ predict ? '예측 게임 끄기' : '🔮 예측 게임 — 앞 5점만으로 큰 훈련 맞히기' }}
        </button>
      </div>
    </div>
  </div>
</template>
