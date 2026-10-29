// 12부 시뮬레이션 엔진 — 모든 실험실이 같은 계산법(오일러법, 5장)으로 미래를 계산한다.
// 완전 결정적(난수 없음). 노트북(chNN_*.ipynb)이 같은 식·같은 시간 간격으로 다시 계산해
// assert 로 수치를 고정한다 — 여기 숫자를 바꾸면 노트북과 본문도 함께 고칠 것.

/** 계산 결과: t[i] 시각의 상태 s[k][i] (k = 상태변수 번호) */
export interface Run {
  t: number[]
  s: number[][]
}

/**
 * 오일러법: 저량(t+DT) = 저량(t) + 순유량(t) × DT.
 * deriv 는 지금 상태에서 각 저량의 순유량(변화율)을 돌려준다.
 * every 걸음마다 한 번 기록한다(그래프 점 수 조절).
 */
export function simulate(
  deriv: (s: number[], t: number) => number[],
  s0: number[],
  opts: { dt: number; tEnd: number; every?: number },
): Run {
  const { dt, tEnd } = opts
  const every = opts.every ?? 1
  const steps = Math.round(tEnd / dt)
  let s = [...s0]
  const out: Run = { t: [0], s: s0.map((v) => [v]) }
  for (let i = 1; i <= steps; i++) {
    const t = (i - 1) * dt
    const d = deriv(s, t)
    s = s.map((v, k) => v + d[k] * dt)
    if (i % every === 0) {
      out.t.push(i * dt)
      s.forEach((v, k) => out.s[k].push(v))
    }
  }
  return out
}

/** 값 배열에서 최댓값과 그 위치(시각) */
export function peakOf(t: number[], v: number[]): { t: number; v: number; i: number } {
  let i = 0
  for (let k = 1; k < v.length; k++) if (v[k] > v[i]) i = k
  return { t: t[i], v: v[i], i }
}

/** v 가 처음으로 target 이상이 되는 시각(선형 보간). 못 닿으면 NaN */
export function firstCross(t: number[], v: number[], target: number): number {
  for (let k = 1; k < v.length; k++) {
    if (v[k - 1] < target && v[k] >= target) {
      const f = (target - v[k - 1]) / (v[k] - v[k - 1])
      return t[k - 1] + f * (t[k] - t[k - 1])
    }
  }
  return v.length && v[0] >= target ? t[0] : NaN
}

// ── 워밍업: 가상 회사의 사내 AI 도구, 월별 신규 가입(유입)과 이탈(유출) ──────────────
// 사용자 수(저량)는 8월에 600명으로 정점 — 신규 가입의 정점(5월 160명)보다 석 달 늦다.
export const WARM_IN = [20, 60, 100, 140, 160, 150, 120, 90, 60, 40, 30, 20]
export const WARM_OUT = [0, 5, 10, 20, 30, 45, 60, 70, 75, 75, 70, 65]
export function warmStock(inflow = WARM_IN, outflow = WARM_OUT, s0 = 0): number[] {
  const out: number[] = []
  let s = s0
  inflow.forEach((v, i) => {
    s += v - outflow[i]
    out.push(s)
  })
  return out
}

// ── 1장: 네 부품 — 같은 저량, 다른 구조, 다른 시간의 모양 ───────────────────────────
// 사용자 수 S(저량), 보이는 사용자 수 P(지연된 정보). 신규 가입(유입)을 정하는 고리를 켜고 끈다.
//   강화 루프만:   가입 = r·S                     (지수 성장)
//   균형 루프만:   가입 = (K − P) / τ             (목표 추구)
//   둘 다:         가입 = r·S·(1 − P/K)           (S자 성장)
//   지연:          P 가 S 를 D 개월 늦게 따라감    (dP/dt = (S − P)/D, 1차 지연 — 6장)
// 노트북 ch01_bigpicture.ipynb 와 같은 값: 균형+지연 최고 1,180명(9.2개월), 셋 다 최고 1,228명(14.4개월).
export const BEHAVIOR = { S0: 50, r: 0.35, K: 1000, tau: 4, D: 3, T: 36, dt: 1 / 16 }
export function behaviorRun(opt: { R: boolean; B: boolean; delay: boolean }, over: Partial<typeof BEHAVIOR> = {}): Run {
  const { S0, r, K, tau, D, T, dt } = { ...BEHAVIOR, ...over }
  return simulate(
    ([S, P]) => {
      const seen = opt.delay ? P : S
      const inflow = opt.R ? r * S * (opt.B ? 1 - seen / K : 1) : opt.B ? (K - seen) / tau : 0
      const dP = opt.delay ? (S - P) / D : 0
      return [inflow, dP]
    },
    [S0, S0],
    { dt, tEnd: T },
  )
}

// ── 2장: 저량 = 순유량이 쌓인 것(면적) ─────────────────────────────────────────────
// 월별 순유량 막대 12개와 처음 저량 100. 같은 면적(합 390)이면 모양이 달라도 끝값은 같다(rise·fall).
export const STOCK0 = 100
export const NET_PRESETS: Record<string, { label: string; values: number[] }> = {
  const: { label: '일정한 유입(+20)', values: Array(12).fill(20) },
  rise: { label: '늘어나는 유입', values: Array.from({ length: 12 }, (_, i) => 5 * (i + 1)) },
  fall: { label: '줄어드는 유입', values: Array.from({ length: 12 }, (_, i) => 60 - 5 * i) },
  updown: { label: '오르내림', values: [40, 40, 20, 10, -10, -30, -40, -30, -10, 10, 30, 40] },
}
/** 처음 저량 + 순유량 누적 — [시작, 1월 말, …, 12월 말] (13개) */
export function accumulate(net: number[], s0 = STOCK0): number[] {
  const out = [s0]
  for (const v of net) out.push(out[out.length - 1] + v)
  return out
}

// ── 6장: 지연 — 샤워기(물질 지연)와 EMA(1차 정보 지연) ─────────────────────────────
// 손잡이가 정하는 온도 V, 머리에서 느끼는 온도 H(t) = V(t − D) (배관을 지나는 D초).
// 사람은 느끼는 온도를 보고 손잡이를 돌린다: dV/dt = (목표 − H)/τ. 손잡이 범위는 찬물 10°C ~ 뜨거운 물 60°C.
// 기본값 D = 2초, τ = 2초 → 목표 38°C 인데 최고 47.05°C(6.0초). D/τ ≥ 약 1.6 이면 출렁임이 커져 끝에서 끝으로.
export const SHOWER = { G: 38, V0: 20, T: 60, dt: 0.01, lo: 10, hi: 60 }
export function showerRun(D: number, tau: number): { t: number[]; H: number[] } {
  const { G, V0, T, dt, lo, hi } = SHOWER
  const n = Math.round(T / dt)
  const lag = Math.round(D / dt)
  const buf = new Array(lag + 1).fill(V0)
  let idx = 0
  let V = V0
  const t: number[] = []
  const H: number[] = []
  for (let k = 0; k <= n; k++) {
    const h = lag > 0 ? buf[idx] : V
    if (k % 10 === 0) {
      t.push(k * dt)
      H.push(h)
    }
    V = Math.min(hi, Math.max(lo, V + ((G - h) / tau) * dt))
    if (lag > 0) {
      buf[idx] = V
      idx = (idx + 1) % (lag + 1)
    }
  }
  return { t, H }
}
/** 샤워기 최고 온도(0.01초 간격 전부에서) — 그래프 점(0.1초)과 별개로 정확히 */
export function showerPeak(D: number, tau: number): { v: number; t: number } {
  const { G, V0, T, dt, lo, hi } = SHOWER
  const n = Math.round(T / dt)
  const lag = Math.round(D / dt)
  const buf = new Array(lag + 1).fill(V0)
  let idx = 0
  let V = V0
  let best = { v: -Infinity, t: 0 }
  for (let k = 0; k <= n; k++) {
    const h = lag > 0 ? buf[idx] : V
    if (h > best.v + 1e-12) best = { v: h, t: k * dt }
    V = Math.min(hi, Math.max(lo, V + ((G - h) / tau) * dt))
    if (lag > 0) {
      buf[idx] = V
      idx = (idx + 1) % (lag + 1)
    }
  }
  return best
}

// EMA(지수이동평균) = 1차 정보 지연: m ← β·m + (1 − β)·g.  평균 지연 ≈ 1/(1 − β) 걸음.
// 입력 g: 20번째 걸음부터 0 → 1 로 바뀌고, ±0.3 지그재그 흔들림이 섞인 '기울기' 신호(결정적).
export const EMA_N = 100
export function emaInput(noise = true, step = true): number[] {
  return Array.from({ length: EMA_N }, (_, k) => (step && k >= 20 ? 1 : 0) + (noise ? 0.3 * (k % 2 === 0 ? 1 : -1) : 0))
}
export function emaRun(beta: number, input: number[]): number[] {
  let m = 0
  return input.map((g) => (m = beta * m + (1 - beta) * g))
}

// ── 8장: 평형과 안정성 ────────────────────────────────────────────────────────────
// 위상선: 순유량 f(S) 가 0인 곳이 평형. 근처에서 f 의 기울기가 음수면 안정, 양수면 불안정.
//   로지스틱:  f = r·S·(1 − S/K)              → 0(불안정)·K(안정)
//   임계 질량: f = r·S·(S/A − 1)·(1 − S/K)    → 0(안정)·A(불안정, 문턱)·K(안정)
// r = 0.5, A = 200, K = 1000. 처음 150명이면 0으로 사라지고 250명이면 1,000명까지(노트북 ch08_equilibrium).
export const PHASE = { r: 0.5, A: 200, K: 1000, T: 36, dt: 1 / 16 }
export function phaseF(kind: 'logistic' | 'allee'): (S: number) => number {
  const { r, A, K } = PHASE
  return kind === 'logistic' ? (S) => r * S * (1 - S / K) : (S) => r * S * (S / A - 1) * (1 - S / K)
}
export function phaseRun(kind: 'logistic' | 'allee', S0: number): Run {
  const f = phaseF(kind)
  return simulate(([S]) => [f(S)], [S0], { dt: PHASE.dt, tEnd: PHASE.T })
}

// 두 저량(위치 x·속도 v)의 모멘텀 경사하강: v ← β·v − ηλ·x,  x ← x + v  (곡률 λ = 2, η = 0.05 → ηλ = 0.1)
// 반복 행렬 [[1 − ηλ, β], [−ηλ, β]] 의 고유값이 복소수면(β > (1 − √ηλ)² ≈ 0.468) 나선으로 출렁인다.
export const HEAVY = { a: 0.1, x0: 8, steps: 60 }
export function heavyBall(beta: number): { x: number[]; v: number[] } {
  let x = HEAVY.x0
  let v = 0
  const xs = [x]
  const vs = [v]
  for (let k = 0; k < HEAVY.steps; k++) {
    v = beta * v - HEAVY.a * x
    x = x + v
    xs.push(x)
    vs.push(v)
  }
  return { x: xs, v: vs }
}
/** 반복 행렬의 고유값(실수부, 허수부). 허수부가 0이 아니면 나선. */
export function heavyEigen(beta: number): { re: number; im: number; mod: number; complex: boolean; re2: number } {
  const tr = 1 - HEAVY.a + beta
  const det = beta
  const disc = tr * tr - 4 * det
  if (disc < 0) {
    const re = tr / 2
    const im = Math.sqrt(-disc) / 2
    return { re, im, mod: Math.sqrt(det), complex: true, re2: re }
  }
  const s = Math.sqrt(disc)
  return { re: (tr + s) / 2, im: 0, mod: (tr + s) / 2, complex: false, re2: (tr - s) / 2 }
}

// ── 9장: 같은 인과지도(강화 + 균형 + 지연), 다른 행동 ─────────────────────────────────
// 1장 모형에서 지연 D 만 바꾼다(r = 0.35, K = 1,000, 48개월): D = 0.5 매끄러운 S자(최고 1,000명),
// D = 3 넘쳤다 출렁(최고 1,228명), D = 8 크게 출렁(최고 2,030명). 노트북 ch09_cld.ipynb 와 동일.
export const SAME_CLD = [
  { key: 'short', label: '지연 0.5개월', D: 0.5 },
  { key: 'mid', label: '지연 3개월', D: 3 },
  { key: 'long', label: '지연 8개월', D: 8 },
] as const
export function sameCldRun(D: number): Run {
  return behaviorRun({ R: true, B: true, delay: true }, { D, T: 48 })
}

// ── 10장: 시스템 원형 — 판박이 구조 여섯 개의 작은 모형 ─────────────────────────────────
// 모두 오일러법 DT = 1/16개월, 결정적. 노트북 ch10_archetypes.ipynb 와 같은 식·같은 수치.
export interface ArchRun {
  label: string
  t: number[]
  y: number[]
}
function archSim(deriv: (s: number[], t: number) => number[], s0: number[], T: number, clamp0 = false): Run {
  const dt = 1 / 16
  const steps = Math.round(T / dt)
  let s = [...s0]
  const out: Run = { t: [0], s: s0.map((v) => [v]) }
  for (let i = 1; i <= steps; i++) {
    const d = deriv(s, (i - 1) * dt)
    s = s.map((v, k) => v + d[k] * dt)
    if (clamp0) s = s.map((v) => Math.max(0, v))
    out.t.push(i * dt)
    s.forEach((v, k) => out.s[k].push(v))
  }
  return out
}

/** ① 성장의 한계: 로지스틱. 기본 / 성장 엔진 강화(r ×2) / 한계 넓히기(K 1,500) */
export function archLimits(): ArchRun[] {
  const run = (r: number, K: number) => archSim(([S]) => [r * S * (1 - S / K)], [10], 36)
  return [
    { label: '기본 (r 0.5, 한계 1,000)', ...pick(run(0.5, 1000), 0) },
    { label: '성장 엔진 강화 (r 1.0)', ...pick(run(1.0, 1000), 0) },
    { label: '한계 넓히기 (한계 1,500)', ...pick(run(0.5, 1500), 0) },
  ]
}
/** ② 문제 전가: 증상 S, 역량 C. 빠른 처방은 증상을 빨리 줄이지만 역량을 깎는다.
 *  dS/dt = 20(1 − C) − (빠른·0.5 + 1/6)·S,  dC/dt = 근본·0.15(1 − C) − 빠른·0.05·C,  S₀ = 30, C₀ = 0.5 */
export function archBurden(): ArchRun[] {
  const run = (uq: number, uf: number) =>
    archSim(([S, C]) => [20 * (1 - C) - (uq * 0.5 + 1 / 6) * S, uf * 0.15 * (1 - C) - uq * 0.05 * C], [30, 0.5], 36)
  return [
    { label: '빠른 처방만', ...pick(run(1, 0), 0) },
    { label: '근본 처방만', ...pick(run(0, 1), 0) },
    { label: '둘 다', ...pick(run(1, 1), 0) },
  ]
}
/** ③ 실패하는 처방: dP/dt = 10 − P/4 − 처방 + 1.3 × (6개월 전 처방), 처방 = 0.5·P. P₀ = 40 */
export function archFixes(): ArchRun[] {
  const run = (k: number) => {
    const dt = 1 / 16
    const lag = Math.round(6 / dt)
    const hist: number[] = []
    let P = 40
    const t = [0]
    const y = [P]
    for (let i = 0; i < Math.round(48 / dt); i++) {
      const fix = k * P
      const past = i >= lag ? hist[i - lag] : 0
      hist.push(fix)
      P += (10 - P / 4 - fix + 1.3 * past) * dt
      t.push((i + 1) * dt)
      y.push(P)
    }
    return { t, y }
  }
  return [
    { label: '처방 안 함', ...run(0) },
    { label: '빠른 처방 (부작용 6개월 뒤)', ...run(0.5) },
  ]
}
/** ④ 목표 침식: dP/dt = 0.2(G − P) − 0.02·P,  dG/dt = 침식 ? −(G − P)/6 : 0.  P₀ = 80, G₀ = 95 */
export function archGoals(): ArchRun[] {
  const run = (erode: boolean) => archSim(([P, G]) => [0.2 * (G - P) - 0.02 * P, erode ? -(G - P) / 6 : 0], [80, 95], 48)
  const fixed = run(false)
  const eroded = run(true)
  return [
    { label: '품질 (목표 고정)', ...pick(fixed, 0) },
    { label: '품질 (목표 침식)', ...pick(eroded, 0) },
    { label: '목표 (침식될 때)', ...pick(eroded, 1) },
  ]
}
/** ⑤ 공유지의 비극: 공용 자원 R(재생 0.3·R(1 − R/100)), 두 팀 사용 욕구 A·B 가 매달 8%씩 커짐.
 *  실제 사용 = (A + B)·R/(R + 5). 규칙: 팀마다 3.75 상한(지속 가능한 총량 7.5). R₀ = 80, A₀ = B₀ = 2. 그래프는 실제 사용량 */
export function archCommons(): ArchRun[] {
  const run = (rule: boolean) => {
    const r = archSim(
      ([R, A, B]) => {
        const H = ((A + B) * R) / (R + 5)
        const dA = rule && A >= 3.75 ? 0 : 0.08 * A
        const dB = rule && B >= 3.75 ? 0 : 0.08 * B
        return [0.3 * R * (1 - R / 100) - H, dA, dB]
      },
      [80, 2, 2],
      48,
      true,
    )
    return {
      t: r.t,
      y: r.t.map((_, i) => ((r.s[1][i] + r.s[2][i]) * r.s[0][i]) / (r.s[0][i] + 5)),
      R: r.s[0],
    }
  }
  const free = run(false)
  const ruled = run(true)
  return [
    { label: '실제 사용량 (각자 늘림)', t: free.t, y: free.y },
    { label: '실제 사용량 (총량 규칙)', t: ruled.t, y: ruled.y },
  ]
}
/** ⑥ 부익부: 예산 100을 성과² 비율로 나눔, 성과는 받은 예산을 3개월에 걸쳐 따라감. 52:48 출발.
 *  하한 30% 보장 시 70:30 에서 멈춤. 그래프는 B 팀 성과 */
export function archSuccess(): ArchRun[] {
  const run = (floor: boolean) =>
    archSim(
      ([A, B]) => {
        let sa = (A * A) / (A * A + B * B)
        if (floor) sa = Math.min(Math.max(sa, 0.3), 0.7)
        return [(100 * sa - A) / 3, (100 * (1 - sa) - B) / 3]
      },
      [52, 48],
      36,
    )
  const pure = run(false)
  const floored = run(true)
  return [
    { label: 'A 팀 (성과대로 몰아주기)', ...pick(pure, 0) },
    { label: 'B 팀 (성과대로 몰아주기)', ...pick(pure, 1) },
    { label: 'B 팀 (최소 30% 보장)', ...pick(floored, 1) },
  ]
}
function pick(r: Run, k: number): { t: number[]; y: number[] } {
  return { t: r.t, y: r.s[k] }
}

// ── 11장: AI가 만드는 고리 ──────────────────────────────────────────────────────────
// ① 모델 붕괴(장난감): 다음 세대는 이전 모델이 ±2σ 안쪽만 뽑아 준(꼬리를 자른) 데이터로 배운다.
//    절단 정규분포의 분산 비율 c ≈ 0.7737(폭 × 0.880). 실제 데이터를 α 만큼 섞으면 v(g+1) = α + (1 − α)·c·v(g).
//    α = 0: 10세대 뒤 폭 0.277 · α = 10%: 0.574 에서 멈춤 · α = 30%: 0.809. (해석적, 난수 없음)
const PHI = (x: number) => Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI)
function erf(x: number): number {
  // Abramowitz–Stegun 7.1.26 보다 정밀한 급수(작은 |x|)·연분수 대신 충분히 정확한 근사: 최대 오차 ~1e-7
  const t = 1 / (1 + 0.5 * Math.abs(x))
  const y =
    1 -
    t *
      Math.exp(
        -x * x -
          1.26551223 +
          t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
      )
  return x >= 0 ? y : -y
}
const BIG_PHI = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2))
/** ±a·σ 절단 정규분포의 분산 비율 (a = 2 → 0.7737) */
export const TRUNC_VAR = 1 - (2 * 2 * PHI(2)) / (BIG_PHI(2) - BIG_PHI(-2))
export function collapseSigmas(alpha: number, gens: number): number[] {
  const out = [1]
  let v = 1
  for (let g = 0; g < gens; g++) {
    v = alpha + (1 - alpha) * TRUNC_VAR * v
    out.push(Math.sqrt(v))
  }
  return out
}

// ② 보상 해킹(장난감): 최적화 강도 e 가 '보상 − β·e²/2'(KL 목줄)를 키우는 쪽으로 걷는다: e ← e + 0.1·(1 − β·e).
//    보상 모델 점수(대리 지표) = e, 진짜 품질 = e − 0.1·e² (e = 5 에서 최고 2.5).
//    β = 0.05: 57걸음에 품질 2.5 로 정점, 300걸음에 −8.64 · β = 0.2: 2.5 에서 안정 · β = 1: 0.9 (너무 조심).
export function rewardRun(beta: number, steps = 300): { e: number[]; proxy: number[]; truth: number[] } {
  const e: number[] = []
  let x = 0
  for (let k = 0; k <= steps; k++) {
    e.push(x)
    x = x + 0.1 * (1 - beta * x)
  }
  return { e, proxy: e.map((v) => v), truth: e.map((v) => v - 0.1 * v * v) }
}
/** 폭이 σ 인 정규분포가 '원래(폭 1) 꼬리 |x| > 2' 를 만들어 내는 비율 — 원래 대비 몇 %가 남았나 */
export function tailShare(sigma: number): number {
  const orig = 2 * (1 - BIG_PHI(2))
  const now = 2 * (1 - BIG_PHI(2 / sigma))
  return now / orig
}

// ── 12장 캡스톤: 사내 AI 도입 모형 (Bass 확산 + 이탈) ─────────────────────────────────
// 직원 M = 300명(우리 회사 규모). 저량: 잠재 사용자 P, 사용자 A (P + A = M). 처음 A = 0.
// 비율로 움직이는 모형이라 시점·비율은 M 과 무관하고 인원만 M 에 비례한다.
//   도입(유량) = (p + q·A/M)·P   — p 혁신계수(홍보·교육), q 모방계수(입소문)
//   이탈(유량) = A / L            — L 평균 사용 기간(개월), 이탈한 사람은 다시 잠재 사용자로. L = 0 이면 이탈 없음
// 오일러법 DT = 1/64개월(이론값과 소수 첫째 자리까지 맞도록 잘게), 36개월. 노트북 ch12_capstone.ipynb 와 동일.
// 기본(p 0.01, q 0.4, 이탈 없음): 50% 도달 9.1개월, 도입 속도 정점 9.0개월(월 31.5명). 이탈 10개월이면 평형 75.8%.
export const ADOPT = { M: 300, T: 36, dt: 1 / 64 }
export interface AdoptResult {
  t: number[]
  A: number[]
  adopt: number[]
  churn: number[]
  t50: number
  peakT: number
  peakRate: number
  A36: number
  eq: number // 평형 활성 비율(0~1). 이탈 없으면 1
}
export function adoptionRun(p: number, q: number, L: number): AdoptResult {
  const { M, T, dt } = ADOPT
  let P = M
  let A = 0
  const t: number[] = [0]
  const As: number[] = [0]
  const ad: number[] = [p * M]
  const ch: number[] = [0]
  let prevA = 0
  let t50 = NaN
  let peakT = 0
  let peakRate = p * M
  const steps = Math.round(T / dt)
  for (let i = 1; i <= steps; i++) {
    const a = (p + (q * A) / M) * P
    const c = L > 0 ? A / L : 0
    P += (c - a) * dt
    A += (a - c) * dt
    const now = i * dt
    const rate = (p + (q * A) / M) * P
    if (rate > peakRate + 1e-12) {
      peakRate = rate
      peakT = now
    }
    if (isNaN(t50) && prevA < M / 2 && A >= M / 2) t50 = now - dt + ((M / 2 - prevA) / (A - prevA)) * dt
    prevA = A
    if (i % 4 === 0) {
      t.push(now)
      As.push(A)
      ad.push(rate)
      ch.push(L > 0 ? A / L : 0)
    }
  }
  let eq = 1
  if (L > 0 && q > 0) {
    const b = q - p - 1 / L
    eq = (b + Math.sqrt(b * b + 4 * q * p)) / (2 * q)
  }
  return { t, A: As, adopt: ad, churn: ch, t50, peakT, peakRate, A36: A, eq }
}
export const ADOPT_SCENARIOS = [
  { key: 'base', label: '기본', p: 0.01, q: 0.4, L: 0 },
  { key: 'promo', label: '홍보 집중', p: 0.03, q: 0.4, L: 0 },
  { key: 'wom', label: '입소문 집중', p: 0.01, q: 0.6, L: 0 },
  { key: 'churn', label: '현실: 이탈 있음(10개월)', p: 0.01, q: 0.4, L: 10 },
  { key: 'retain', label: '이탈 방지(20개월)', p: 0.01, q: 0.4, L: 20 },
  { key: 'promoChurn', label: '홍보 집중 + 이탈', p: 0.03, q: 0.4, L: 10 },
  { key: 'womChurn', label: '입소문 집중 + 이탈', p: 0.01, q: 0.6, L: 10 },
] as const
