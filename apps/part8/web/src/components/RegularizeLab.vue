<script setup lang="ts">
// ch8 인터랙티브 — ① 원점 목줄: 7장의 암기 곡선(차수 9)에 weight decay(λ)를 채워 본다.
//                 ② 목줄 경주: GD 훈련 곡선에서 목줄이 갈라짐 자체를 지우는 것을 본다.
// 7장과 같은 데이터(시드 101/102) — 이야기가 이어진다. 오프라인·결정적.
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
const TRUE_RULE = (x: number) => Math.sin(2.5 * x)

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
    ys.push(TRUE_RULE(x) + 0.25 * gaussian(rand))
  }
  return { xs, ys }
}
const TRAIN = makeData(10, 101)
const VAL = makeData(30, 102)

// ── ① 원점 목줄 — 릿지(거듭제곱 기저, 닫힌 형태) ──────────────
// 벌점 붙은 최소제곱: (FᵀF/n + λI)w = Fᵀy/n — 부분 피벗 가우스 소거
const powRow = (x: number) => Array.from({ length: 10 }, (_, k) => x ** k)
function solveRidge(xs: number[], ys: number[], lam: number): number[] {
  const m = 10
  const n = xs.length
  const A = Array.from({ length: m }, () => new Array<number>(m).fill(0))
  const b = new Array<number>(m).fill(0)
  for (let i = 0; i < n; i++) {
    const f = powRow(xs[i]!)
    for (let r = 0; r < m; r++) {
      b[r]! += (f[r]! * ys[i]!) / n
      for (let c = 0; c < m; c++) A[r]![c]! += (f[r]! * f[c]!) / n
    }
  }
  for (let r = 0; r < m; r++) A[r]![r]! += lam
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
const predict = (w: number[], x: number) => powRow(x).reduce((s, f, k) => s + f * w[k]!, 0)
const mse = (w: number[], d: Dataset) => d.xs.reduce((s, x, i) => s + (predict(w, x) - d.ys[i]!) ** 2, 0) / d.xs.length

const LAMBDAS = [0, 1e-4, 1e-3, 1e-2, 0.1, 1, 10]
const LABELS = ['0 (목줄 없음)', '0.0001', '0.001', '0.01', '0.1', '1', '10']
const li = ref(0)
const ridge = computed(() => {
  const w = solveRidge(TRAIN.xs, TRAIN.ys, LAMBDAS[li.value]!)
  const norm = Math.sqrt(w.reduce((s, v) => s + v * v, 0))
  return { w, trainErr: mse(w, TRAIN), valErr: mse(w, VAL), norm }
})
const verdict = computed(() => {
  const { norm, valErr } = ridge.value
  if (li.value === 0)
    return { tone: 'text-rose-600', text: `목줄 없음 — 7장의 그 암기 곡선입니다. 계수가 ${norm.toFixed(0)}까지 폭주하며 훈련 오차 0, 검증 ${valErr.toFixed(2)} 폭발.` }
  if (li.value >= 5)
    return { tone: 'text-sky-700', text: '너무 짧은 목줄 — 곡선이 짓눌려 규칙(굽이)까지 못 배웁니다(과소적합). 훈련·검증 둘 다 나쁨.' }
  return { tone: 'text-emerald-700', text: `목줄이 계수를 ${norm.toFixed(1)}로 묶자 요동이 사라졌어요 — 노이즈는 못 외우고 규칙만 남았습니다(검증 ${valErr.toFixed(3)}).` }
})

// SVG (7장과 같은 좌표계: x∈[-1,1], y 클램프 ±2)
const px = (x: number) => 15 + ((x + 1) / 2) * 270
const py = (y: number) => 75 - Math.max(-2, Math.min(2, y)) * 35
const curvePath = (f: (x: number) => number) =>
  Array.from({ length: 121 }, (_, i) => {
    const x = -1 + i / 60
    return `${px(x).toFixed(1)},${py(f(x)).toFixed(1)}`
  }).join(' ')
const fittedPath = computed(() => curvePath((x) => predict(ridge.value.w, x)))
const truePath = curvePath(TRUE_RULE)

// ── ② 목줄 경주 — GD(체비쇼프 기저) λ=0 vs λ=0.03 ────────────
const STEPS = 3000
function chebRow(x: number): number[] {
  const T = [1, x]
  for (let k = 2; k <= 9; k++) T.push(2 * x * T[k - 1]! - T[k - 2]!)
  return T
}
function gdRun(lam: number) {
  const Ft = TRAIN.xs.map((x) => chebRow(x))
  const Fv = VAL.xs.map((x) => chebRow(x))
  const w = new Array<number>(10).fill(0)
  const trs: number[] = []
  const vas: number[] = []
  for (let t = 0; t < STEPS; t++) {
    const g = new Array<number>(10).fill(0)
    let loss = 0
    for (let i = 0; i < Ft.length; i++) {
      const r = Ft[i]!.reduce((s, f, k) => s + f * w[k]!, 0) - TRAIN.ys[i]!
      loss += r * r
      for (let k = 0; k < 10; k++) g[k]! += (2 * r * Ft[i]![k]!) / Ft.length
    }
    for (let k = 0; k < 10; k++) w[k]! -= 0.05 * (g[k]! + 2 * lam * w[k]!)
    trs.push(loss / Ft.length)
    vas.push(Fv.reduce((s, f, i) => s + (f.reduce((a, t2, k) => a + t2 * w[k]!, 0) - VAL.ys[i]!) ** 2, 0) / Fv.length)
  }
  let best = 0
  for (let t = 1; t < STEPS; t++) if (vas[t]! < vas[best]!) best = t
  return { trs, vas, best }
}
const raced = ref(false)
const race = computed(() => {
  if (!raced.value) return null
  return { free: gdRun(0), leashed: gdRun(0.03) }
})
const cx = (t: number) => 15 + (t / (STEPS - 1)) * 275
const cy = (l: number) => 102 - (Math.min(l, 1.2) / 1.2) * 92
const lossLine = (ls: number[]) =>
  ls.filter((_, t) => t % 10 === 0).map((l, i) => `${cx(i * 10).toFixed(1)},${cy(l).toFixed(1)}`).join(' ')
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 원점 목줄 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 원점 목줄: 7장의 암기 곡선에 weight decay 채우기</p>
    <p class="mb-3 text-xs text-slate-400">
      7장의 그 점 10개, 그 차수 9 그대로 — 이번엔 손실에 <b>λ×(계수 크기)²</b> 벌점을 더합니다.
      목줄의 세기 λ를 돌려 보세요.
    </p>

    <label class="block text-xs text-slate-500">
      목줄의 세기 λ = <b class="text-slate-700">{{ LABELS[li] }}</b>
      <input v-model.number="li" type="range" min="0" max="6" step="1" class="mt-1 w-full accent-indigo-600" />
    </label>

    <svg viewBox="0 0 300 150" class="mt-2 w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <polyline :points="truePath" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 3" />
      <polyline :points="fittedPath" fill="none" stroke="#e11d48" stroke-width="1.8" opacity="0.9" />
      <circle v-for="(x, i) in TRAIN.xs" :key="i" :cx="px(x)" :cy="py(TRAIN.ys[i]!)" r="3" fill="#4f46e5" />
      <text x="18" y="12" font-size="8" fill="#94a3b8">- - 숨은 규칙</text>
      <text x="18" y="22" font-size="8" fill="#e11d48">— 목줄 λ = {{ LABELS[li] }}</text>
    </svg>

    <div class="mt-2 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div class="text-center">
        <p class="text-[11px] text-slate-400">훈련 오차</p>
        <p class="font-mono text-lg font-bold text-slate-700">{{ ridge.trainErr.toFixed(4) }}</p>
      </div>
      <div class="text-center">
        <p class="text-[11px] text-slate-400">검증 오차</p>
        <p class="font-mono text-lg font-bold" :class="ridge.valErr > 0.3 ? 'text-rose-600' : 'text-emerald-600'">{{ ridge.valErr.toFixed(4) }}</p>
      </div>
      <div class="text-center">
        <p class="text-[11px] text-slate-400">계수 크기 ‖w‖ (1부 노름)</p>
        <p class="font-mono text-lg font-bold" :class="ridge.norm > 10 ? 'text-rose-600' : 'text-indigo-600'">{{ ridge.norm > 100 ? ridge.norm.toFixed(0) : ridge.norm.toFixed(2) }}</p>
      </div>
      <p class="min-w-0 flex-1 text-xs leading-relaxed" :class="verdict.tone"><b>{{ verdict.text }}</b></p>
    </div>

    <!-- ② 목줄 경주 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 목줄 경주: 갈라짐이 사라진다</p>
    <p class="mb-3 text-xs text-slate-400">
      7장 실험 ②의 그 훈련(차수 9 × 3,000스텝)을 두 번 돌립니다 — 목줄 없이(λ=0) vs 목줄 채우고(λ=0.03).
      조기 종료 없이 <b>끝까지 완주</b>했을 때 검증 손실이 어떻게 되는지 보세요.
    </p>

    <button
      v-if="!raced"
      type="button"
      class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
      @click="raced = true"
    >
      🐕 목줄 경주 (3,000스텝 × 2)
    </button>

    <template v-if="race">
      <svg viewBox="0 0 300 112" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
        <polyline :points="lossLine(race.free.trs)" fill="none" stroke="#4f46e5" stroke-width="1" opacity="0.45" />
        <polyline :points="lossLine(race.free.vas)" fill="none" stroke="#e11d48" stroke-width="1.5" />
        <polyline :points="lossLine(race.leashed.vas)" fill="none" stroke="#059669" stroke-width="1.8" />
        <text x="284" y="14" text-anchor="end" font-size="8" fill="#4f46e5">— 훈련 손실 (λ=0)</text>
        <text x="284" y="24" text-anchor="end" font-size="8" fill="#e11d48">— 검증, 목줄 없음</text>
        <text x="284" y="34" text-anchor="end" font-size="8" fill="#059669">— 검증, 목줄 λ=0.03</text>
      </svg>

      <div class="mt-2 flex flex-wrap gap-3 rounded-lg bg-slate-50 p-3 text-center">
        <div>
          <p class="text-[11px] text-slate-400">목줄 없음 — 마지막 검증</p>
          <p class="font-mono text-lg font-bold text-rose-600">{{ race.free.vas[STEPS - 1]!.toFixed(3) }} <span class="text-[11px] font-normal text-slate-400">(최저 {{ race.free.vas[race.free.best]!.toFixed(3) }}의 {{ (race.free.vas[STEPS - 1]! / race.free.vas[race.free.best]!).toFixed(1) }}배)</span></p>
        </div>
        <div>
          <p class="text-[11px] text-slate-400">목줄 λ=0.03 — 마지막 검증</p>
          <p class="font-mono text-lg font-bold text-emerald-600">{{ race.leashed.vas[STEPS - 1]!.toFixed(3) }} <span class="text-[11px] font-normal text-slate-400">(갈라짐 없음)</span></p>
        </div>
        <div>
          <p class="text-[11px] text-slate-400">목줄 값 — 마지막 훈련 오차</p>
          <p class="font-mono text-lg font-bold text-slate-600">{{ race.free.trs[STEPS - 1]!.toFixed(3) }} → {{ race.leashed.trs[STEPS - 1]!.toFixed(3) }}</p>
        </div>
      </div>

      <p class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-800">
        ✅ 목줄 없는 훈련은 검증이 최저를 찍고 <b>{{ (race.free.vas[STEPS - 1]! / race.free.vas[race.free.best]!).toFixed(1) }}배로 되올랐지만</b>,
        목줄을 채우자 3,000스텝을 <b>완주하고도 검증이 최저 수준</b>에 머뭅니다 — 노이즈 암기에 필요한
        큰 계수를 벌점이 계속 깎아내, <b>갈라짐 자체가 생기지 않아요</b>. 훈련 오차는 조금
        손해지만(목줄 값), 검증에서 남는 장사입니다. 멈출 타이밍(조기 종료)을 몰라도 안전해지는 것 —
        이것이 정규화가 "안전장치"인 이유.
      </p>
    </template>
  </div>
</template>
