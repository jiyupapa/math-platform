<script setup lang="ts">
// ch7 인터랙티브 — ① 재단사의 유혹: 차수(다이얼 수)를 올리면 훈련 오차는 0으로, 검증 오차는 U자.
//                 ② 벌어짐 감시자: 차수 9를 GD로 훈련 — 검증 손실이 돌아서는 순간(과적합 시작).
// 오프라인·결정적 — 시드 고정 PRNG(mulberry32). 노트북과 같은 실험(시드는 별도 튜닝).
import { computed, ref } from 'vue'

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function gaussian(rand: () => number) {
  let s = 0
  for (let i = 0; i < 12; i++) s += rand()
  return s - 6
}

// 숨은 진짜 규칙: 완만한 S자 곡선. 관측 = 규칙 + 노이즈(σ 0.25)
const TRUE_RULE = (x: number) => Math.sin(2.5 * x)
const SIGMA = 0.25

interface Dataset {
  xs: number[]
  ys: number[]
}
function makeData(n: number, seed: number): Dataset {
  const rand = mulberry32(seed)
  const xs: number[] = []
  const ys: number[] = []
  for (let i = 0; i < n; i++) {
    let x = -1 + (2 * i) / (n - 1) + (rand() * 0.08 - 0.04)
    x = Math.max(-1, Math.min(1, x))
    xs.push(x)
    ys.push(TRUE_RULE(x) + SIGMA * gaussian(rand))
  }
  return { xs, ys }
}
const TRAIN10 = makeData(10, 101)
const TRAIN40 = makeData(40, 103)
const VAL = makeData(30, 102)

// 체비쇼프 기저(수치 안정) 최소제곱 — 정규방정식 + 부분 피벗 가우스 소거
function chebRow(x: number, deg: number): number[] {
  const T = [1, x]
  for (let k = 2; k <= deg; k++) T.push(2 * x * T[k - 1]! - T[k - 2]!)
  return T.slice(0, deg + 1)
}
function lstsq(xs: number[], ys: number[], deg: number): number[] {
  const m = deg + 1
  const A = Array.from({ length: m }, () => new Array<number>(m).fill(0))
  const b = new Array<number>(m).fill(0)
  for (let i = 0; i < xs.length; i++) {
    const f = chebRow(xs[i]!, deg)
    for (let r = 0; r < m; r++) {
      b[r]! += f[r]! * ys[i]!
      for (let c = 0; c < m; c++) A[r]![c]! += f[r]! * f[c]!
    }
  }
  for (let col = 0; col < m; col++) {
    let piv = col
    for (let r = col + 1; r < m; r++) if (Math.abs(A[r]![col]!) > Math.abs(A[piv]![col]!)) piv = r
    ;[A[col], A[piv]] = [A[piv]!, A[col]!]
    ;[b[col], b[piv]] = [b[piv]!, b[col]!]
    for (let r = 0; r < m; r++) {
      if (r === col || A[col]![col] === 0) continue
      const f = A[r]![col]! / A[col]![col]!
      for (let c = col; c < m; c++) A[r]![c]! -= f * A[col]![c]!
      b[r]! -= f * b[col]!
    }
  }
  return b.map((v, i) => v / A[i]![i]!)
}
const predict = (w: number[], x: number) => chebRow(x, w.length - 1).reduce((s, t, i) => s + t * w[i]!, 0)
const mse = (w: number[], d: Dataset) => d.xs.reduce((s, x, i) => s + (predict(w, x) - d.ys[i]!) ** 2, 0) / d.xs.length

// ── ① 재단사의 유혹 ────────────────────────────────
const deg = ref(1)
const n40 = ref(false)
const showVal = ref(false)

const fit = computed(() => {
  const train = n40.value ? TRAIN40 : TRAIN10
  const w = lstsq(train.xs, train.ys, deg.value)
  return { w, train, trainErr: mse(w, train), valErr: mse(w, VAL) }
})
const verdict = computed(() => {
  const { trainErr, valErr } = fit.value
  if (n40.value && deg.value >= 8)
    return { tone: 'text-emerald-700', text: `같은 차수 ${deg.value}인데 — 점이 40개면 다이얼 ${deg.value + 1}개로 다 못 외워요. 암기가 막히니 규칙을 배울 수밖에(검증 ${valErr.toFixed(3)}).` }
  if (deg.value <= 1)
    return { tone: 'text-sky-700', text: '과소적합 — 굽이(규칙)를 담기엔 다이얼이 부족해요. 훈련·검증 둘 다 나쁩니다.' }
  if (deg.value >= 8 && !n40.value)
    return { tone: 'text-rose-600', text: `과적합 — 훈련 오차 ${trainErr.toFixed(4)}: 점 10개를 다이얼 ${deg.value + 1}개로 통째로 외웠어요. 검증(처음 보는 문제)은 ${valErr.toFixed(2)}로 폭발.` }
  return { tone: 'text-emerald-700', text: '적당한 용량 — 검증 오차가 가장 낮은 동네입니다. 규칙은 담기고 노이즈는 못 외우는 크기.' }
})

// SVG 좌표 (x∈[-1,1] → 15..285, y∈[-2,2] → 145..5, 클램프)
const px = (x: number) => 15 + ((x + 1) / 2) * 270
const py = (y: number) => 75 - Math.max(-2, Math.min(2, y)) * 35
const curvePath = (f: (x: number) => number) =>
  Array.from({ length: 121 }, (_, i) => {
    const x = -1 + i / 60
    return `${px(x).toFixed(1)},${py(f(x)).toFixed(1)}`
  }).join(' ')
const fittedPath = computed(() => curvePath((x) => predict(fit.value.w, x)))
const truePath = curvePath(TRUE_RULE)

// ── ② 벌어짐 감시자 ────────────────────────────────
const STEPS = 3000
const trained = ref(false)
const run = computed(() => {
  if (!trained.value) return null
  const Ft = TRAIN10.xs.map((x) => chebRow(x, 9))
  const Fv = VAL.xs.map((x) => chebRow(x, 9))
  const w = new Array<number>(10).fill(0)
  const trs: number[] = []
  const vas: number[] = []
  for (let t = 0; t < STEPS; t++) {
    const g = new Array<number>(10).fill(0)
    let loss = 0
    for (let i = 0; i < Ft.length; i++) {
      const r = Ft[i]!.reduce((s, f, k) => s + f * w[k]!, 0) - TRAIN10.ys[i]!
      loss += r * r
      for (let k = 0; k < 10; k++) g[k]! += (2 * r * Ft[i]![k]!) / Ft.length
    }
    for (let k = 0; k < 10; k++) w[k]! -= 0.05 * g[k]!
    trs.push(loss / Ft.length)
    vas.push(Fv.reduce((s, f, i) => s + (f.reduce((a, t2, k) => a + t2 * w[k]!, 0) - VAL.ys[i]!) ** 2, 0) / Fv.length)
  }
  let best = 0
  for (let t = 1; t < STEPS; t++) if (vas[t]! < vas[best]!) best = t
  return { trs, vas, best }
})
// 훈련 곡선 SVG (y: 0~1.2 클램프, x: 스텝 선형)
const cx = (t: number) => 15 + (t / (STEPS - 1)) * 275
const cy = (l: number) => 102 - (Math.min(l, 1.2) / 1.2) * 92
const lossLine = (ls: number[]) =>
  ls.filter((_, t) => t % 10 === 0).map((l, i) => `${cx(i * 10).toFixed(1)},${cy(l).toFixed(1)}`).join(' ')
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 재단사의 유혹 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 재단사의 유혹: 다이얼을 늘리면 성적이 오를까?</p>
    <p class="mb-3 text-xs text-slate-400">
      숨은 규칙(회색 점선)에서 노이즈 낀 점들이 관측됐어요. 차수 = 곡선의 다이얼(계수) 수 − 1.
      차수를 올려 <b>훈련 점(●)에 곡선을 맞춰</b> 보세요 — 검증 점수는 봉인된 30개 점으로 따로 매깁니다.
    </p>

    <div class="mb-2 flex flex-wrap items-center gap-4">
      <label class="grow text-xs text-slate-500">
        곡선의 차수 = <b class="text-slate-700">{{ deg }}</b> (다이얼 {{ deg + 1 }}개)
        <input v-model.number="deg" type="range" min="0" max="9" step="1" class="mt-1 w-full accent-indigo-600" />
      </label>
      <div class="flex items-center gap-2 text-xs">
        <span class="text-slate-400">훈련 점:</span>
        <button
          type="button"
          class="rounded-lg px-2.5 py-1 font-semibold transition"
          :class="!n40 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
          @click="n40 = false"
        >10개</button>
        <button
          type="button"
          class="rounded-lg px-2.5 py-1 font-semibold transition"
          :class="n40 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
          @click="n40 = true"
        >40개 (4배)</button>
      </div>
    </div>

    <svg viewBox="0 0 300 150" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <polyline :points="truePath" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 3" />
      <polyline :points="fittedPath" fill="none" stroke="#e11d48" stroke-width="1.8" opacity="0.9" />
      <template v-if="showVal">
        <circle v-for="(x, i) in VAL.xs" :key="'v' + i" :cx="px(x)" :cy="py(VAL.ys[i]!)" r="2.4" fill="none" stroke="#f59e0b" stroke-width="1.2" />
      </template>
      <circle v-for="(x, i) in fit.train.xs" :key="i" :cx="px(x)" :cy="py(fit.train.ys[i]!)" r="3" fill="#4f46e5" />
      <text x="18" y="12" font-size="8" fill="#94a3b8">- - 숨은 규칙</text>
      <text x="18" y="22" font-size="8" fill="#e11d48">— 맞춘 곡선 (차수 {{ deg }})</text>
    </svg>
    <label class="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
      <input v-model="showVal" type="checkbox" class="accent-amber-500" /> 봉인된 시험 문제(검증 30점, ○) 보기
    </label>

    <div class="mt-2 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div class="text-center">
        <p class="text-[11px] text-slate-400">훈련 오차 (연습 점수)</p>
        <p class="font-mono text-lg font-bold" :class="fit.trainErr < 0.001 ? 'text-rose-600' : 'text-slate-700'">{{ fit.trainErr.toFixed(4) }}</p>
      </div>
      <div class="text-center">
        <p class="text-[11px] text-slate-400">검증 오차 (진짜 시험)</p>
        <p class="font-mono text-lg font-bold" :class="fit.valErr > 0.3 ? 'text-rose-600' : 'text-emerald-600'">{{ fit.valErr.toFixed(4) }}</p>
      </div>
      <p class="min-w-0 flex-1 text-xs leading-relaxed" :class="verdict.tone"><b>{{ verdict.text }}</b></p>
    </div>

    <!-- ② 벌어짐 감시자 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 벌어짐 감시자: 훈련 일지에 과적합이 남기는 무늬</p>
    <p class="mb-3 text-xs text-slate-400">
      실전에선 차수 슬라이더가 아니라 <b>훈련 스텝</b>이 흐릅니다. 아까 그 점 10개에 차수 9(암기 가능 용량)를
      경사하강으로 3,000스텝 — 두 손실을 함께 기록해 보세요.
    </p>

    <button
      v-if="!trained"
      type="button"
      class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
      @click="trained = true"
    >
      🏋️ 훈련 시작 (차수 9 × 3,000스텝)
    </button>

    <template v-if="run">
      <svg viewBox="0 0 300 112" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
        <line :x1="cx(run.best)" y1="6" :x2="cx(run.best)" y2="104" stroke="#059669" stroke-width="1" stroke-dasharray="3 3" />
        <polyline :points="lossLine(run.trs)" fill="none" stroke="#4f46e5" stroke-width="1.5" />
        <polyline :points="lossLine(run.vas)" fill="none" stroke="#e11d48" stroke-width="1.5" />
        <text :x="Math.min(cx(run.best) + 3, 210)" y="14" font-size="8" fill="#059669">검증 최저 (스텝 {{ run.best }}) — 멈출 자리</text>
        <text x="284" y="96" text-anchor="end" font-size="8" fill="#4f46e5">— 훈련 손실</text>
        <text x="284" y="86" text-anchor="end" font-size="8" fill="#e11d48">— 검증 손실</text>
      </svg>

      <div class="mt-2 flex flex-wrap gap-3 rounded-lg bg-slate-50 p-3 text-center">
        <div>
          <p class="text-[11px] text-slate-400">검증 최저</p>
          <p class="font-mono text-lg font-bold text-emerald-600">{{ run.vas[run.best]!.toFixed(3) }} <span class="text-[11px] font-normal text-slate-400">@ 스텝 {{ run.best }}</span></p>
        </div>
        <div>
          <p class="text-[11px] text-slate-400">마지막 검증</p>
          <p class="font-mono text-lg font-bold text-rose-600">{{ run.vas[STEPS - 1]!.toFixed(3) }} <span class="text-[11px] font-normal text-slate-400">(최저의 {{ (run.vas[STEPS - 1]! / run.vas[run.best]!).toFixed(1) }}배)</span></p>
        </div>
        <div>
          <p class="text-[11px] text-slate-400">마지막 훈련</p>
          <p class="font-mono text-lg font-bold text-indigo-600">{{ run.trs[STEPS - 1]!.toFixed(3) }}</p>
        </div>
      </div>

      <p class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-800">
        ✅ 경사하강은 <b>큰 패턴(굽이)을 먼저 배우고, 노이즈 암기는 나중에</b> 합니다. 그래서 검증 손실은
        내려가다가 스텝 {{ run.best }}에서 돌아서요 — 그 뒤로 훈련 손실은 계속 내려갔지만(암기 진행)
        검증은 {{ (run.vas[STEPS - 1]! / run.vas[run.best]!).toFixed(1) }}배 나빠졌습니다.
        <b>두 곡선이 벌어지는 순간이 과적합의 시작</b> — 훈련 일지에서 이 무늬를 보면 멈추는 것이
        답입니다(조기 종료, 8장).
      </p>
    </template>
  </div>
</template>
