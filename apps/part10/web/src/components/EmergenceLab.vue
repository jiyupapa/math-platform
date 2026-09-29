<script setup lang="ts">
// 5장 실험실 — 창발 논쟁 재현: 밑바탕 실력(자리당 정답률 p)은 매끈한 멱법칙으로 좋아지는데
// (신의 시점 — 우리가 정한 규칙), "안경"(지표)에 따라 곡선이 계단/완만/직선으로 달리 보인다.
//   err(N) = 0.85 · (N/10⁷)^(−0.3)  (3장의 그 직선),  p = 1 − err
//   지표 ①: 8자리 전부 정답 = p⁸ (계단 — 창발처럼 보임) ② 자리당 정답률 = p (완만)
//   지표 ③: 초과 오차 err 의 로그-로그 (직선 — 밑바탕의 정체)
// 완전 결정적(난수 없음) — 노트북(ch05_emergence.ipynb)과 동일 수치.
import { ref, computed } from 'vue'

const K = 8 // 답의 자릿수 (8자리 덧셈)
const errOf = (n: number) => 0.85 * (n / 1e7) ** -0.3
const pOf = (n: number) => 1 - errOf(n)

const NS = [1e7, 1e8, 1e9, 1e10, 1e11, 1e12]
const sel = ref(2) // 10^9
const N = computed(() => NS[sel.value])
const p = computed(() => pOf(N.value))
const exact = computed(() => p.value ** K)

type Metric = 'exact' | 'perdigit' | 'excess'
const metric = ref<Metric>('exact')
const METRICS: { id: Metric; label: string }[] = [
  { id: 'exact', label: '① 전부 정답 (exact match)' },
  { id: 'perdigit', label: '② 자리당 정답률' },
  { id: 'excess', label: '③ 초과 오차 (로그-로그)' },
]

// ── 그래프 ──────────────────────────────────────────────────────────────────
const W = 360
const H = 220
const PAD = { l: 46, r: 12, t: 12, b: 26 }
const gx = (n: number) => PAD.l + ((Math.log10(n) - 7) / 5) * (W - PAD.l - PAD.r)
function gy(n: number): number {
  let t: number
  if (metric.value === 'exact') t = pOf(n) ** K
  else if (metric.value === 'perdigit') t = pOf(n)
  else t = (Math.log10(errOf(n)) - -1.7) / (0 - -1.7) // log10(err) ∈ [-1.7, ~-0.07]
  return H - PAD.b - t * (H - PAD.b - PAD.t)
}
const path = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= 100; i++) {
    const n = 10 ** (7 + (i / 100) * 5)
    pts.push(`${i ? 'L' : 'M'}${gx(n).toFixed(1)},${gy(n).toFixed(1)}`)
  }
  return pts.join(' ')
})
const yLabels = computed(() =>
  metric.value === 'excess'
    ? [{ v: '0.85', t: 0.97 }, { v: '0.27', t: 0.67 }, { v: '0.085', t: 0.38 }, { v: '0.027', t: 0.08 }]
    : [{ v: '100%', t: 1 }, { v: '50%', t: 0.5 }, { v: '0%', t: 0 }],
)
const yPos = (t: number) => H - PAD.b - t * (H - PAD.b - PAD.t)

const verdict = computed(() => {
  if (metric.value === 'exact')
    return { cls: 'bg-rose-50 text-rose-800', text: '계단처럼 보입니다. 10⁹까지 15%도 안 되다가 10¹⁰에서 40%로 "능력이 갑자기 튀어나온" 것 같죠. 그런데 안경을 바꿔 보세요.' }
  if (metric.value === 'perdigit')
    return { cls: 'bg-emerald-50 text-emerald-800', text: '완만합니다. 같은 모델, 같은 개선인데 자리당 정답률로 보면 15% → 97%로 꾸준히 좋아지고 있었어요. 계단은 어디로 갔을까요?' }
  return { cls: 'bg-indigo-50 text-indigo-800', text: '직선입니다. 밑바탕(자리당 오차)은 3장의 스케일링 법칙 그대로 매끈한 멱법칙(기울기 −0.3)이었습니다. 계단을 만든 건 모델이 아니라 지표(p⁸)였어요.' }
})

const fmtN = (n: number) => (n >= 1e12 ? '1T' : n >= 1e9 ? `${n / 1e9}B` : `${n / 1e6}M`)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 과제와 밑바탕 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 과제: 8자리 덧셈: 밑바탕 실력은 매끈하게 좋아진다 (신의 시점 규칙)</p>
    <div class="mb-2 flex flex-wrap items-center gap-1.5">
      <span class="text-xs text-slate-500">모델 크기 N:</span>
      <button
        v-for="(n, i) in NS"
        :key="n"
        type="button"
        class="rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors"
        :class="sel === i ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="sel = i"
      >
        {{ fmtN(n) }}
      </button>
    </div>
    <div class="mb-1 flex flex-wrap gap-2 text-sm">
      <div class="rounded-lg bg-emerald-50 px-3 py-1.5">
        자리당 정답률 p = <b class="font-mono">{{ (p * 100).toFixed(1) }}%</b>
      </div>
      <div class="rounded-lg bg-rose-50 px-3 py-1.5">
        8자리 전부 정답 p⁸ = <b class="font-mono">{{ (exact * 100).toFixed(1) }}%</b>
      </div>
    </div>
    <!-- 자릿수 시각화 -->
    <div class="mb-3 flex items-center gap-1">
      <span class="mr-1 text-xs text-slate-500">답안지:</span>
      <span
        v-for="i in K"
        :key="i"
        class="flex h-7 w-7 items-center justify-center rounded font-mono text-xs font-bold text-white"
        :style="{ backgroundColor: `rgba(16,185,129,${0.15 + p * 0.85})` }"
        :title="`자리 ${i}: 맞힐 확률 ${(p * 100).toFixed(0)}%`"
      >{{ i <= Math.round(p * K) ? '✓' : '?' }}</span>
      <span class="ml-2 text-xs text-slate-500">8자리가 <b>전부</b> 맞아야 "정답"인 게 함정</span>
    </div>

    <!-- ② 안경 갈아 끼우기 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">② 같은 모델, 세 개의 안경: 지표를 바꿔 보세요</p>
    <div class="mb-2 flex flex-wrap gap-1.5">
      <button
        v-for="m in METRICS"
        :key="m.id"
        type="button"
        class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
        :class="metric === m.id ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="metric = m.id"
      >
        {{ m.label }}
      </button>
    </div>

    <div class="flex flex-wrap items-start gap-4">
      <svg :viewBox="`0 0 ${W} ${H}`" class="h-56 w-full max-w-md rounded-lg bg-slate-50 ring-1 ring-slate-200">
        <line v-for="e in 6" :key="'x' + e" :x1="gx(10 ** (e + 6))" :x2="gx(10 ** (e + 6))" :y1="PAD.t" :y2="H - PAD.b" stroke="var(--c-slate-200)" />
        <text v-for="e in 6" :key="'xl' + e" :x="gx(10 ** (e + 6))" :y="H - 10" text-anchor="middle" class="fill-slate-400" font-size="9">
          {{ fmtN(10 ** (e + 6)) }}
        </text>
        <text v-for="(l, i) in yLabels" :key="'yl' + i" :x="PAD.l - 5" :y="yPos(l.t) + 3" text-anchor="end" class="fill-slate-400" font-size="9">{{ l.v }}</text>
        <path :d="path" fill="none" :stroke="metric === 'exact' ? 'var(--c-rose-600)' : metric === 'perdigit' ? 'var(--c-emerald-500)' : 'var(--c-indigo-500)'" stroke-width="2.5" />
        <circle :cx="gx(N)" :cy="gy(N)" r="6" fill="var(--c-slate-900)" stroke="var(--c-white)" stroke-width="1.5" />
      </svg>
      <div class="min-w-52 flex-1 space-y-2">
        <p class="rounded-md px-3 py-2 text-sm leading-relaxed" :class="verdict.cls">{{ verdict.text }}</p>
        <p class="rounded-md bg-slate-100 px-3 py-2 text-xs leading-relaxed text-slate-600">
          판정 습관: <b>"능력이 갑자기 생겼다"는 그래프를 보면</b> ① y축 지표가 전부-정답형인지
          확인하고 ② 자리당(부분 점수) 지표와 ③ 로그-로그 오차로 다시 그려 봅니다.
          셋 다 꺾여 있어야 진짜 급변입니다.
        </p>
      </div>
    </div>
  </div>
</template>
