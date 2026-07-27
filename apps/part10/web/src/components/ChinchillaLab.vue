<script setup lang="ts">
// 4장 실험실 — 예산 배분: C = 6·N·D 를 고정하고 N(몸집)↔D(밥) 배분을 돌리면
// 손실 L(N,D) = E + A/√N + B/√D 의 U자 곡선에 최저점(황금비 D ≈ 20N)이 나타난다.
// 상수는 친칠라의 관측(70B·1.4T 최적, 파라미터당 ~20토큰, 예산 100배→각 10배)을
// 재현하도록 고른 단순화 모형(α=β=0.5, B/A=√20) — 완전 결정적, 노트북과 동일 수식.
import { ref, computed } from 'vue'

const E = 1.69
const A = 32000
const B = A * Math.sqrt(20)

const lossOf = (n: number, d: number) => E + A / Math.sqrt(n) + B / Math.sqrt(d)
function optimum(c: number) {
  const K = c / 6
  const n = (A / B) * Math.sqrt(K)
  return { n, d: K / n }
}

const BUDGETS = [
  { label: '10²¹', c: 1e21 },
  { label: '10²²', c: 1e22 },
  { label: '10²³', c: 1e23 },
  { label: '친칠라급 5.9×10²³', c: 5.88e23 },
  { label: '10²⁵', c: 1e25 },
]
const budget = ref(5.88e23)
// 배분 다이얼 — 최적점 기준 ±2자리(로그) 범위에서 N 선택
const offset = ref(0) // log10(N) − log10(N*)

const opt = computed(() => optimum(budget.value))
const N = computed(() => opt.value.n * 10 ** offset.value)
const D = computed(() => budget.value / 6 / N.value)
const ratio = computed(() => D.value / N.value)
const L = computed(() => lossOf(N.value, D.value))
const Lstar = computed(() => lossOf(opt.value.n, opt.value.d))
const atOptimum = computed(() => Math.abs(offset.value) < 0.03)

const CASES = [
  { label: '겅호 스타일 — 280B 크게', c: 5.88e23, n: 280e9 },
  { label: '친칠라 스타일 — 70B 알맞게', c: 5.88e23, n: 70e9 },
]
function applyCase(cs: (typeof CASES)[number]) {
  budget.value = cs.c
  offset.value = Math.log10(cs.n / optimum(cs.c).n)
}
function setBudget(c: number) {
  budget.value = c
  offset.value = 0
}

// ── U자 곡선 SVG ─────────────────────────────────────────────────────────────
const W = 360
const H = 220
const PAD = { l: 44, r: 12, t: 12, b: 26 }
const curve = computed(() => {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i <= 80; i++) {
    const off = -2 + (i / 80) * 4
    const n = opt.value.n * 10 ** off
    pts.push({ x: off, y: lossOf(n, budget.value / 6 / n) })
  }
  return pts
})
const yMax = computed(() => Math.max(...curve.value.map((p) => p.y)))
const yMin = computed(() => Lstar.value - (yMax.value - Lstar.value) * 0.06)
const gx = (off: number) => PAD.l + ((off + 2) / 4) * (W - PAD.l - PAD.r)
const gy = (y: number) =>
  H - PAD.b - ((y - yMin.value) / (yMax.value - yMin.value)) * (H - PAD.b - PAD.t)
const path = computed(() => curve.value.map((p, i) => `${i ? 'L' : 'M'}${gx(p.x).toFixed(1)},${gy(p.y).toFixed(1)}`).join(' '))

const fmtN = (v: number) => (v >= 1e12 ? `${(v / 1e12).toFixed(1)}T` : v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : `${(v / 1e6).toFixed(0)}M`)
const fmtD = (v: number) => (v >= 1e12 ? `${(v / 1e12).toFixed(2)}T` : `${(v / 1e9).toFixed(0)}B`)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 예산 고정 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 훈련 예산 C 를 고정하세요 (1장의 C = 6·N·D)</p>
    <div class="mb-3 flex flex-wrap gap-1.5">
      <button
        v-for="b in BUDGETS"
        :key="b.c"
        type="button"
        class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
        :class="budget === b.c ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="setBudget(b.c)"
      >
        {{ b.label }}
      </button>
    </div>

    <!-- ② 배분 다이얼 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">② 같은 예산, 배분만 바꾸기 — 몸집 N을 키우면 밥 D가 줄어듭니다</p>
    <div class="flex flex-wrap items-start gap-4">
      <svg :viewBox="`0 0 ${W} ${H}`" class="h-56 w-full max-w-md rounded-lg bg-slate-50 ring-1 ring-slate-200">
        <line v-for="i in 5" :key="'g' + i" :x1="gx(i - 3)" :x2="gx(i - 3)" :y1="PAD.t" :y2="H - PAD.b" stroke="var(--c-slate-200)" />
        <text :x="gx(-2)" :y="H - 10" text-anchor="middle" class="fill-slate-400" font-size="9">N*÷100</text>
        <text :x="gx(0)" :y="H - 10" text-anchor="middle" class="fill-slate-400" font-size="9">N*</text>
        <text :x="gx(2)" :y="H - 10" text-anchor="middle" class="fill-slate-400" font-size="9">N*×100</text>
        <!-- U자 곡선 -->
        <path :d="path" fill="none" stroke="var(--c-indigo-500)" stroke-width="2.5" />
        <!-- 최저점 -->
        <circle :cx="gx(0)" :cy="gy(Lstar)" r="5" fill="var(--c-emerald-500)" />
        <text :x="gx(0)" :y="gy(Lstar) - 9" text-anchor="middle" class="fill-emerald-600" font-size="9" font-weight="bold">최적</text>
        <!-- 현재 배분 -->
        <circle :cx="gx(offset)" :cy="gy(L)" r="6" fill="var(--c-indigo-600)" stroke="var(--c-white)" stroke-width="1.5" />
        <!-- 좌우 안내 -->
        <text :x="gx(-1.7)" :y="PAD.t + 12" class="fill-slate-400" font-size="9">← 몸집 부족 (밥만 많음)</text>
        <text :x="gx(0.35)" :y="PAD.t + 12" class="fill-slate-400" font-size="9">과체격 — 밥 부족 →</text>
      </svg>

      <div class="min-w-52 flex-1 space-y-2">
        <input v-model.number="offset" type="range" min="-2" max="2" step="0.01" class="w-full accent-indigo-600" />
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="rounded-lg bg-indigo-50 p-2.5">
            <p class="text-xs text-indigo-600">몸집 N</p>
            <p class="font-mono font-bold text-indigo-800">{{ fmtN(N) }}</p>
          </div>
          <div class="rounded-lg bg-emerald-50 p-2.5">
            <p class="text-xs text-emerald-700">밥 D</p>
            <p class="font-mono font-bold text-emerald-800">{{ fmtD(D) }} 토큰</p>
          </div>
          <div class="rounded-lg bg-slate-50 p-2.5">
            <p class="text-xs text-slate-500">토큰/파라미터</p>
            <p class="font-mono font-bold" :class="Math.abs(ratio - 20) / 20 < 0.15 ? 'text-emerald-700' : 'text-slate-800'">
              {{ ratio >= 100 ? ratio.toFixed(0) : ratio.toFixed(1) }} : 1
            </p>
          </div>
          <div class="rounded-lg bg-slate-50 p-2.5">
            <p class="text-xs text-slate-500">손실 L</p>
            <p class="font-mono font-bold text-slate-800">{{ L.toFixed(3) }}</p>
          </div>
        </div>
        <p
          class="rounded-md px-3 py-2 text-sm font-medium"
          :class="atOptimum ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'"
        >
          <template v-if="atOptimum">
            🏆 <b>황금비!</b> D ≈ 20·N — 몸집 배고픔(A/√N)과 데이터 배고픔(B/√D)이 정확히
            같아지는 지점입니다. 이 예산의 최저 손실 {{ Lstar.toFixed(3) }}.
          </template>
          <template v-else>
            최적 대비 <b>+{{ (L - Lstar).toFixed(3) }}</b> 손해 — 같은 돈으로 더 잘할 수
            있습니다 (최적: N* = {{ fmtN(opt.n) }}, D* = {{ fmtD(opt.d) }}).
          </template>
        </p>
      </div>
    </div>

    <!-- ③ 역사의 두 배분 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">③ 같은 예산(5.9×10²³), 역사의 두 배분 — 눌러서 비교해 보세요</p>
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="cs in CASES"
        :key="cs.label"
        type="button"
        class="rounded-lg border px-2.5 py-1.5 text-sm transition-colors"
        :class="budget === cs.c && Math.abs(N - cs.n) / cs.n < 0.02 ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="applyCase(cs)"
      >
        {{ cs.label }}
      </button>
      <p class="w-full text-xs text-slate-500">
        280B 배분은 토큰 350B(비율 1.25 — 과체격)로 손실 1.992, 70B 배분은 1.4T(비율 20)로
        1.932 — <b>4배 작은 모델이 같은 예산으로 이깁니다.</b>
      </p>
    </div>
  </div>
</template>
