<script setup lang="ts">
// 2장 실험실 — "종이 갈아끼우기": 세 곡선(일차·멱·지수)을 세 종이(선형·반로그·로그-로그)에
// 그려 보며 "어떤 곡선이 어느 종이에서 직선이 되는가"를 발견한다. + 멱법칙 기울기 b 다이얼.
// 완전 결정적(난수 없음) — 노트북(ch02_loglog.ipynb)과 같은 곡선·같은 수치.
import { ref, computed } from 'vue'

type CurveId = 'linear' | 'power' | 'exp'
type PaperId = 'linlin' | 'semilog' | 'loglog'

const CURVES: { id: CurveId; label: string; formula: string; fn: (x: number) => number }[] = [
  { id: 'linear', label: '일차', formula: 'y = 10x', fn: (x) => 10 * x },
  { id: 'power', label: '거듭제곱', formula: 'y = x^1.5', fn: (x) => x ** 1.5 },
  { id: 'exp', label: '지수', formula: 'y = 2^(x/10)', fn: (x) => 2 ** (x / 10) },
]
const PAPERS: { id: PaperId; label: string; desc: string }[] = [
  { id: 'linlin', label: '보통 종이', desc: 'x·y 모두 균등 눈금' },
  { id: 'semilog', label: '반로그 종이', desc: 'y만 10배 눈금' },
  { id: 'loglog', label: '로그-로그 종이', desc: 'x·y 모두 10배 눈금' },
]
// 어떤 곡선이 어느 종이에서 직선이 되나 (분석적 사실)
const STRAIGHT: Record<CurveId, PaperId> = { linear: 'linlin', power: 'loglog', exp: 'semilog' }

const curve = ref<CurveId>('power')
const paper = ref<PaperId>('linlin')

// 그리기 영역 — x ∈ [1, 100], y ∈ [1, 1100] (세 곡선 모두 이 창에 들어온다)
const W = 340
const H = 210
const PAD = { l: 40, r: 10, t: 10, b: 24 }
const XMAX = 100
const YMAX = 1100

function xPos(x: number, p: PaperId): number {
  const t = p === 'linlin' || p === 'semilog' ? (x - 1) / (XMAX - 1) : Math.log10(x) / Math.log10(XMAX)
  return PAD.l + t * (W - PAD.l - PAD.r)
}
function yPos(y: number, p: PaperId): number {
  const t = p === 'linlin' ? y / YMAX : Math.log10(Math.max(y, 1)) / Math.log10(YMAX)
  return H - PAD.b - t * (H - PAD.b - PAD.t)
}

const points = computed(() => {
  const fn = CURVES.find((c) => c.id === curve.value)!.fn
  const pts: string[] = []
  for (let i = 0; i <= 80; i++) {
    const x = 10 ** ((i / 80) * 2) // 1 → 100 (로그 간격 샘플 — 모든 종이에서 매끈)
    pts.push(`${xPos(x, paper.value).toFixed(1)},${yPos(fn(x), paper.value).toFixed(1)}`)
  }
  return pts.join(' ')
})

const isStraight = computed(() => STRAIGHT[curve.value] === paper.value)
const xTicks = computed(() =>
  paper.value === 'loglog' ? [1, 10, 100] : [1, 25, 50, 75, 100],
)
const yTicks = computed(() =>
  paper.value === 'linlin' ? [0, 250, 500, 750, 1000] : [1, 10, 100, 1000],
)

// ── ② 기울기 다이얼 — y = x^b 를 로그-로그 종이에 ───────────────────────────
const b = ref(0.5)
const factor10 = computed(() => 10 ** b.value) // x 10배 → y 몇 배
// 로그-로그 고정 창: log10 x ∈ [0,3], log10 y ∈ [-3,6]
function slopeLine(): { x1: number; y1: number; x2: number; y2: number } {
  const gx = (lx: number) => PAD.l + (lx / 3) * (W - PAD.l - PAD.r)
  const gy = (ly: number) => H - PAD.b - ((ly + 3) / 9) * (H - PAD.b - PAD.t)
  return { x1: gx(0), y1: gy(0), x2: gx(3), y2: gy(3 * b.value) }
}
const slopePts = computed(() => {
  const { x1, y1, x2, y2 } = slopeLine()
  return { x1, y1, x2, y2 }
})
const fmtFactor = computed(() => {
  const f = factor10.value
  if (f >= 1) return `${f >= 10 ? f.toFixed(0) : f.toFixed(2)}배`
  return `${f.toFixed(2)}배 (= ${(100 - f * 100).toFixed(0)}% 감소)`
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 종이 갈아끼우기 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 종이 갈아끼우기 — 곡선과 종이를 바꿔 가며 "직선이 되는 짝"을 찾아보세요</p>
    <div class="mb-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-slate-400">곡선:</span>
        <button
          v-for="c in CURVES"
          :key="c.id"
          type="button"
          class="rounded-lg border px-2.5 py-1 transition-colors"
          :class="curve === c.id ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
          @click="curve = c.id"
        >
          {{ c.label }} <span class="font-mono text-xs">{{ c.formula }}</span>
        </button>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-slate-400">종이:</span>
        <button
          v-for="p in PAPERS"
          :key="p.id"
          type="button"
          class="rounded-lg border px-2.5 py-1 transition-colors"
          :class="paper === p.id ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
          @click="paper = p.id"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-start gap-4">
      <svg :viewBox="`0 0 ${W} ${H}`" class="h-52 w-full max-w-sm rounded-lg bg-slate-50 ring-1 ring-slate-200">
        <!-- 격자 -->
        <line
          v-for="t in xTicks"
          :key="'x' + t"
          :x1="xPos(Math.max(t, 1), paper)"
          :x2="xPos(Math.max(t, 1), paper)"
          :y1="PAD.t"
          :y2="H - PAD.b"
          stroke="#e2e8f0"
          stroke-width="1"
        />
        <line
          v-for="t in yTicks"
          :key="'y' + t"
          :x1="PAD.l"
          :x2="W - PAD.r"
          :y1="yPos(Math.max(t, paper === 'linlin' ? 0 : 1), paper)"
          :y2="yPos(Math.max(t, paper === 'linlin' ? 0 : 1), paper)"
          stroke="#e2e8f0"
          stroke-width="1"
        />
        <!-- 눈금 라벨 -->
        <text
          v-for="t in xTicks"
          :key="'xl' + t"
          :x="xPos(Math.max(t, 1), paper)"
          :y="H - 8"
          text-anchor="middle"
          class="fill-slate-400"
          font-size="9"
        >{{ t }}</text>
        <text
          v-for="t in yTicks"
          :key="'yl' + t"
          :x="PAD.l - 5"
          :y="yPos(Math.max(t, paper === 'linlin' ? 0 : 1), paper) + 3"
          text-anchor="end"
          class="fill-slate-400"
          font-size="9"
        >{{ t }}</text>
        <!-- 곡선 -->
        <polyline :points="points" fill="none" :stroke="isStraight ? '#059669' : '#6366f1'" stroke-width="2.5" />
      </svg>

      <div class="min-w-48 flex-1 space-y-2">
        <p
          class="rounded-md px-3 py-2 text-sm font-medium"
          :class="isStraight ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'"
        >
          <template v-if="isStraight">📏 직선! — 이 곡선의 "맞는 종이"를 찾았습니다.</template>
          <template v-else>휘어 있네요 — 다른 종이로 갈아끼워 보세요.</template>
        </p>
        <ul class="space-y-1 text-xs leading-relaxed text-slate-500">
          <li>보통 종이에서 직선 = <b>일차</b>(같은 간격만큼 더해짐)</li>
          <li>반로그(y만 로그)에서 직선 = <b>지수</b>(같은 간격마다 같은 배수)</li>
          <li>로그-로그(둘 다 로그)에서 직선 = <b>거듭제곱(멱법칙)</b> — 스케일링 법칙의 종이!</li>
        </ul>
      </div>
    </div>

    <!-- ② 기울기 다이얼 -->
    <p class="mt-5 mb-1 text-sm font-semibold text-slate-500">② 기울기 b 다이얼 — 로그-로그 직선의 기울기가 말하는 것 (y = xᵇ)</p>
    <div class="flex flex-wrap items-start gap-4 rounded-lg bg-slate-50 p-4">
      <svg :viewBox="`0 0 ${W} ${H}`" class="h-52 w-full max-w-sm rounded-lg bg-white ring-1 ring-slate-200">
        <line v-for="i in 4" :key="'gx' + i" :x1="PAD.l + ((i - 1) / 3) * (W - PAD.l - PAD.r)" :x2="PAD.l + ((i - 1) / 3) * (W - PAD.l - PAD.r)" :y1="PAD.t" :y2="H - PAD.b" stroke="#e2e8f0" />
        <line v-for="i in 10" :key="'gy' + i" :x1="PAD.l" :x2="W - PAD.r" :y1="H - PAD.b - ((i - 1) / 9) * (H - PAD.b - PAD.t)" :y2="H - PAD.b - ((i - 1) / 9) * (H - PAD.b - PAD.t)" stroke="#f1f5f9" />
        <text v-for="(lx, i) in [1, 10, 100, 1000]" :key="'glx' + i" :x="PAD.l + (i / 3) * (W - PAD.l - PAD.r)" :y="H - 8" text-anchor="middle" class="fill-slate-400" font-size="9">{{ lx }}</text>
        <!-- y=1 기준선 -->
        <line :x1="PAD.l" :x2="W - PAD.r" :y1="H - PAD.b - (3 / 9) * (H - PAD.b - PAD.t)" :y2="H - PAD.b - (3 / 9) * (H - PAD.b - PAD.t)" stroke="#cbd5e1" stroke-dasharray="4 3" />
        <line :x1="slopePts.x1" :y1="slopePts.y1" :x2="slopePts.x2" :y2="slopePts.y2" stroke="#6366f1" stroke-width="2.5" />
      </svg>
      <div class="min-w-48 flex-1">
        <div class="mb-1 flex items-baseline justify-between text-sm">
          <span class="font-semibold text-slate-700">기울기 b</span>
          <span class="font-mono font-bold text-indigo-700">{{ b.toFixed(2) }}</span>
        </div>
        <input v-model.number="b" type="range" min="-1" max="2" step="0.05" class="w-full accent-indigo-600" />
        <p class="mt-3 rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
          x를 <b>10배</b> 키우면 y는 <b>10ᵇ = {{ fmtFactor }}</b>
        </p>
        <p class="mt-2 text-xs leading-relaxed text-slate-500">
          b &gt; 1 가속 성장 · 0 &lt; b &lt; 1 성장하되 <b>수확 체감</b> · b &lt; 0 감소.
          3장에서 잴 손실 곡선의 기울기는 <b>작은 음수</b>(대략 −0.05 ~ −0.1)입니다 —
          "10배 부어야 조금 내려간다"의 수학.
        </p>
      </div>
    </div>
  </div>
</template>
