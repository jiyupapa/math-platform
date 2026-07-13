<script setup lang="ts">
// 11장 실험실 — 에이전트 성적표의 두 얼굴: (1) pass@k 계산기(비편향 vs 소박한 공식),
// (2) 성적표 오차범위(과업 수가 적으면 ±가 커서 비교 불가). 완전 해석적·결정적(난수 없음).
// 수치는 노트북(ch11_scorecard.ipynb)의 math.comb 계산과 일치(assert).
import { ref, computed } from 'vue'

// ── 조합 (정수 유지 — n≤50·k≤10 범위에서 안전 정수) ──
function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  k = Math.min(k, n - k)
  let r = 1
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1)
  return Math.round(r)
}
// 비편향 pass@k = 1 − C(n−c, k) / C(n, k)
function passk(n: number, c: number, k: number): number {
  if (n - c < k) return 1
  return 1 - comb(n - c, k) / comb(n, k)
}
// 소박한(편향) 공식 = 1 − (1 − c/n)^k
function naive(n: number, c: number, k: number): number {
  return 1 - Math.pow(1 - c / n, k)
}

// ── 패널 1: pass@k 계산기 ──
const n = ref(10)
const c = ref(4)
const k = ref(5)
// c 는 n 을 넘을 수 없게 클램프
const cClamped = computed(() => Math.min(c.value, n.value))
const kClamped = computed(() => Math.min(k.value, n.value))
const pkUnbiased = computed(() => passk(n.value, cClamped.value, kClamped.value))
const pkNaive = computed(() => naive(n.value, cClamped.value, kClamped.value))
const gap = computed(() => Math.abs(pkUnbiased.value - pkNaive.value) * 100)
const pass1 = computed(() => cClamped.value / n.value)
const pct = (x: number) => (x * 100).toFixed(1)

// k 곡선 (현재 n·c 기준, k=1..min(n,10))
const curve = computed(() => {
  const kmax = Math.min(n.value, 10)
  const rows = []
  for (let kk = 1; kk <= kmax; kk++) {
    rows.push({ k: kk, unb: passk(n.value, cClamped.value, kk), nv: naive(n.value, cClamped.value, kk) })
  }
  return rows
})

// ── 패널 2: 성적표 오차범위 ──
const NS = [20, 50, 200, 1000]
const nTask = ref(20)
const rate = ref(90) // 발표된 성공률 %
const moe = computed(() => 98 / Math.sqrt(nTask.value)) // 냅킨 공식 (10부 6장)
const lo = computed(() => rate.value - moe.value)
const hi = computed(() => rate.value + moe.value)
// 비교 상대(경쟁 에이전트) 고정 70% — 구간이 겹치면 우열 단정 불가
const RIVAL = 70
const overlapsRival = computed(() => lo.value <= RIVAL)
const clampPct = (x: number) => Math.max(0, Math.min(100, x))
</script>

<template>
  <div class="my-5 space-y-5">
    <!-- ══ 패널 1: pass@k 계산기 ══ -->
    <div class="rounded-xl border border-slate-200 bg-white p-5">
      <p class="mb-3 text-sm font-semibold text-slate-500">
        ① pass@k 계산기 — n개 시도 중 c개 성공을 관측했을 때, k번 안에 한 번 맞힐 확률
      </p>

      <div class="grid gap-3 sm:grid-cols-3">
        <label class="text-sm">
          <span class="text-slate-600">시도 수 n = <b class="font-mono text-indigo-700">{{ n }}</b></span>
          <input v-model.number="n" type="range" min="5" max="50" step="1" class="mt-1 w-full accent-indigo-600" />
        </label>
        <label class="text-sm">
          <span class="text-slate-600">성공 수 c = <b class="font-mono text-indigo-700">{{ cClamped }}</b></span>
          <input v-model.number="c" type="range" min="0" :max="n" step="1" class="mt-1 w-full accent-indigo-600" />
        </label>
        <label class="text-sm">
          <span class="text-slate-600">뽑는 수 k = <b class="font-mono text-indigo-700">{{ kClamped }}</b></span>
          <input v-model.number="k" type="range" min="1" :max="Math.min(n, 10)" step="1" class="mt-1 w-full accent-indigo-600" />
        </label>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg bg-indigo-50 p-3">
          <p class="text-xs font-medium text-indigo-500">비편향 pass@{{ kClamped }}</p>
          <p class="font-mono text-2xl font-bold text-indigo-700">{{ pct(pkUnbiased) }}%</p>
          <p class="mt-1 text-[11px] text-indigo-400">= 1 − C({{ n - cClamped }},{{ kClamped }}) / C({{ n }},{{ kClamped }})</p>
        </div>
        <div class="rounded-lg bg-slate-100 p-3">
          <p class="text-xs font-medium text-slate-500">소박한 공식 1 − (1 − c/n)<sup>k</sup></p>
          <p class="font-mono text-2xl font-bold text-slate-600">{{ pct(pkNaive) }}%</p>
          <p class="mt-1 text-[11px] text-slate-400">pass@1 = c/n = {{ pct(pass1) }}% 을 그대로 거듭제곱</p>
        </div>
      </div>

      <p
        class="mt-3 rounded-md px-3 py-2 text-sm"
        :class="gap >= 3 ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-500'"
      >
        <template v-if="gap >= 3">
          두 값이 <b>{{ gap.toFixed(1) }}%p</b> 벌어졌습니다 — 표본 n이 작고 k가 n에 가까울수록
          소박한 공식은 빗나갑니다. 성적표엔 <b>비편향 추정</b>을 써야 해요.
        </template>
        <template v-else>
          지금은 두 값이 가깝네요({{ gap.toFixed(1) }}%p 차이) — n을 줄이거나 k를 키워 보세요.
        </template>
      </p>

      <!-- k 곡선 -->
      <div class="mt-4">
        <p class="mb-1 text-xs font-semibold text-slate-500">k를 늘리면 (현재 n={{ n }}, c={{ cClamped }})</p>
        <div class="space-y-1">
          <div v-for="row in curve" :key="row.k" class="flex items-center gap-2 text-[11px]">
            <span class="w-10 shrink-0 text-right font-mono text-slate-400">k={{ row.k }}</span>
            <div class="relative h-4 flex-1 overflow-hidden rounded bg-slate-100">
              <div class="absolute top-0 h-full rounded bg-slate-300" :style="{ width: row.nv * 100 + '%' }" />
              <div class="absolute top-0 h-full rounded bg-indigo-400/70" :style="{ width: row.unb * 100 + '%' }" />
            </div>
            <span class="w-24 shrink-0 font-mono text-slate-500">{{ pct(row.unb) }}% <span class="text-slate-300">/ {{ pct(row.nv) }}%</span></span>
          </div>
        </div>
        <p class="mt-1 text-[11px] text-slate-400"><span class="text-indigo-500">■</span> 비편향 &nbsp; <span class="text-slate-400">■</span> 소박한 공식</p>
      </div>
    </div>

    <!-- ══ 패널 2: 성적표 오차범위 ══ -->
    <div class="rounded-xl border border-slate-200 bg-white p-5">
      <p class="mb-3 text-sm font-semibold text-slate-500">
        ② 성적표의 ± — 과업 몇 개로 잰 점수인가 (10부 6장 냅킨 공식 98/√n)
      </p>

      <div class="mb-3 flex flex-wrap items-center gap-1.5">
        <span class="text-sm text-slate-600">과업 수:</span>
        <button
          v-for="v in NS"
          :key="v"
          type="button"
          class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
          :class="nTask === v ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
          @click="nTask = v"
        >
          {{ v.toLocaleString() }}건
        </button>
      </div>

      <label class="mb-3 block text-sm">
        <span class="text-slate-600">발표된 성공률 = <b class="font-mono text-indigo-700">{{ rate }}%</b></span>
        <input v-model.number="rate" type="range" min="50" max="99" step="1" class="mt-1 w-full accent-indigo-600" />
      </label>

      <!-- ± 밴드 시각화 -->
      <div class="relative h-14 rounded-lg bg-slate-50 ring-1 ring-slate-200">
        <!-- 라이벌 70% 기준선 -->
        <div class="absolute top-0 h-full border-l-2 border-dashed border-slate-400" :style="{ left: RIVAL + '%' }">
          <span class="absolute -top-5 -translate-x-1/2 text-[11px] text-slate-500">경쟁 {{ RIVAL }}%</span>
        </div>
        <!-- ± 밴드 -->
        <div
          class="absolute top-1/2 h-6 -translate-y-1/2 rounded bg-amber-300/40 ring-1 ring-amber-400/60"
          :style="{ left: clampPct(lo) + '%', width: clampPct(hi) - clampPct(lo) + '%' }"
        />
        <!-- 점 추정값 -->
        <div class="absolute top-1/2 h-6 w-0.5 -translate-y-1/2 bg-indigo-600" :style="{ left: clampPct(rate) + '%' }" />
      </div>
      <p class="mt-2 text-sm text-slate-700">
        {{ nTask.toLocaleString() }}건 · {{ rate }}% → 오차범위 <b>±{{ moe.toFixed(1) }}%p</b>,
        구간 <b class="font-mono">[{{ lo.toFixed(1) }}, {{ hi.toFixed(1) }}]</b>
      </p>
      <p
        class="mt-2 rounded-md px-3 py-2 text-sm font-medium"
        :class="overlapsRival ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'"
      >
        <template v-if="overlapsRival">
          🚫 구간이 경쟁 {{ RIVAL }}%를 <b>덮습니다</b> — 이 과업 수로는 {{ rate }}%짜리와
          {{ RIVAL }}%짜리를 구별할 수 없어요. 데모의 성공률만으론 우열 단정 불가.
        </template>
        <template v-else>
          ✅ 구간이 경쟁 {{ RIVAL }}%보다 위 — 이 정도 과업 수면 우연으로 보기 어렵습니다.
          (정식 판정은 10부 7장 쌍대 비교)
        </template>
      </p>
    </div>
  </div>
</template>
