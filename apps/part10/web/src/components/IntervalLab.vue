<script setup lang="ts">
// 6장 실험실 — 시험의 오차범위(신뢰구간):
//   ① 계산기: p̂·n → ± = 1.96·√(p̂(1−p̂)/n), 여론조사(n=1,000·±3.1%p) 짝 확인
//   ② 참값 담기: 신의 시점(참 실력 70%)에서 시험 100회 — 95% 구간이 참값을 몇 번 놓치나
//   ③ 리더보드에 밴드 씌우기: 같은 n으로 4개 모델의 구간 겹침 판정
// 완전 결정적(mulberry32, 시드 600+회차) — 노트북(ch06_interval.ipynb)과 동일 수치.
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

const half = (p: number, n: number) => 1.96 * Math.sqrt((p * (1 - p)) / n)

// ── ① 계산기 ─────────────────────────────────────────────────────────────────
const NS = [50, 100, 250, 1000, 5000, 10000]
const n = ref(1000)
const phatPct = ref(50)
const phat = computed(() => phatPct.value / 100)
const hw = computed(() => half(phat.value, n.value) * 100)
const isPollTwin = computed(() => n.value === 1000 && phatPct.value === 50)

// ── ② 참값 담기 (참 실력 70%, 100회) ────────────────────────────────────────
const P_TRUE = 0.7
const simN = ref<100 | 1000>(100)
interface Trial {
  lo: number
  hi: number
  miss: boolean
}
const trials = computed<Trial[]>(() => {
  const out: Trial[] = []
  for (let r = 1; r <= 100; r++) {
    const rand = mulberry32(600 + r)
    let c = 0
    for (let i = 0; i < simN.value; i++) if (rand() < P_TRUE) c++
    const ph = c / simN.value
    const h = half(ph, simN.value)
    out.push({ lo: ph - h, hi: ph + h, miss: P_TRUE < ph - h || P_TRUE > ph + h })
  }
  return out
})
const missCount = computed(() => trials.value.filter((t) => t.miss).length)

// SVG (참값 담기) — y: 정답률 50~90%
const W = 560
const H = 180
const PADL = 34
const ty = (v: number) => H - 18 - ((v - 0.5) / 0.4) * (H - 30)
const tx = (i: number) => PADL + (i / 99) * (W - PADL - 8)

// ── ③ 리더보드 밴드 (①의 n 공유) ────────────────────────────────────────────
const LB = [
  { name: '아라-2', s: 0.724 },
  { name: '바다-3', s: 0.718 },
  { name: '사라-1', s: 0.69 },
  { name: '다라-7', s: 0.652 },
]
const lbRows = computed(() =>
  LB.map((m) => ({ ...m, h: half(m.s, n.value) })),
)
const lbVerdict = computed(() => {
  const r = lbRows.value
  const sep = (i: number) => r[i].s - r[i].h > r[i + 1].s + r[i + 1].h
  if (!sep(0) && !sep(1) && !sep(2)) return '이 문항 수로는 어느 순위도 확정할 수 없습니다 — 전부 소음 범위 안.'
  if (!sep(0) && sep(1) && sep(2)) return '3·4위는 갈렸지만 0.6점 차 1·2위는 여전히 겹칩니다 — 10,000문항으로도!'
  return '구간이 갈린 쌍만 순위를 말할 수 있습니다 — 겹친 쌍은 판정 보류(정식 도구는 7장).'
})
const lx = (v: number) => 90 + ((v - 0.6) / 0.16) * 380
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 계산기 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 오차범위 계산기 — ± = 1.96 × √( p̂(1−p̂) / n )</p>
    <div class="mb-2 flex flex-wrap items-center gap-1.5">
      <span class="text-xs text-slate-400">문항 수 n:</span>
      <button
        v-for="v in NS"
        :key="v"
        type="button"
        class="rounded-lg border px-2 py-1 font-mono text-xs transition-colors"
        :class="n === v ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="n = v"
      >
        {{ v.toLocaleString() }}
      </button>
      <span class="ml-3 text-xs text-slate-400">점수 p̂:</span>
      <input v-model.number="phatPct" type="range" min="50" max="95" step="1" class="w-36 accent-indigo-600" />
      <span class="font-mono text-sm font-bold text-slate-700">{{ phatPct }}%</span>
    </div>
    <div class="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div class="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
        <span class="font-mono text-lg font-bold text-indigo-700">{{ phatPct }} ± {{ hw.toFixed(1) }}%p</span>
        <span class="ml-2 text-xs text-slate-400">→ [{{ (phatPct - hw).toFixed(1) }}, {{ (phatPct + hw).toFixed(1) }}]</span>
      </div>
      <span v-if="isPollTwin" class="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
        📺 여론조사의 그 문장 — "n=1,004명, 95% 신뢰수준, ±3.1%p"와 같은 공식!
      </span>
      <span v-else class="text-xs text-slate-400">어림: ± ≈ 98/√n %p (p̂=50% 기준) = {{ (98 / Math.sqrt(n)).toFixed(1) }}%p</span>
    </div>

    <!-- ② 참값 담기 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">② "95%"의 진짜 뜻 — 참 실력 70%(신의 시점)로 시험 100회, 구간이 참값을 담나</p>
    <div class="mb-2 flex items-center gap-1.5 text-xs">
      <span class="text-slate-400">시험 문항 수:</span>
      <button
        v-for="v in [100, 1000] as const"
        :key="v"
        type="button"
        class="rounded-lg border px-2 py-1 font-mono transition-colors"
        :class="simN === v ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="simN = v"
      >
        {{ v }}
      </button>
    </div>
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-200">
      <line :x1="PADL" :x2="W - 8" :y1="ty(P_TRUE)" :y2="ty(P_TRUE)" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="5 4" />
      <text :x="PADL - 3" :y="ty(P_TRUE) + 3" text-anchor="end" class="fill-amber-600" font-size="9">참값 70</text>
      <text :x="PADL - 3" :y="ty(0.9) + 3" text-anchor="end" class="fill-slate-400" font-size="8">90</text>
      <text :x="PADL - 3" :y="ty(0.5) + 3" text-anchor="end" class="fill-slate-400" font-size="8">50</text>
      <g v-for="(t, i) in trials" :key="i">
        <line
          :x1="tx(i)"
          :x2="tx(i)"
          :y1="ty(Math.min(t.hi, 0.9))"
          :y2="ty(Math.max(t.lo, 0.5))"
          :stroke="t.miss ? '#e11d48' : '#a5b4fc'"
          :stroke-width="t.miss ? 2.5 : 1.5"
        />
      </g>
    </svg>
    <p class="mt-2 rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
      100번 중 참값을 놓친 구간(빨강) = <b>{{ missCount }}회</b> — 이론값은 약 5회.
      "95% 신뢰"란 <b>이 절차의 명중률</b>이지, 특정 구간 하나가 맞을 확률이 아닙니다.
      (100문항 2회, 1,000문항 7회 — 놓침 횟수 자체도 표본이라 출렁여요. 워밍업의 교훈!)
    </p>

    <!-- ③ 리더보드 밴드 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">③ 리더보드에 밴드 씌우기 — 위 ①의 문항 수(n = {{ n.toLocaleString() }})가 그대로 적용됩니다</p>
    <svg viewBox="0 0 560 130" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-200">
      <g v-for="(m, i) in lbRows" :key="m.name">
        <text x="8" :y="20 + i * 28" class="fill-slate-600" font-size="11" font-weight="bold">{{ m.name }}</text>
        <text x="58" :y="20 + i * 28" class="fill-slate-400" font-size="10">{{ (m.s * 100).toFixed(1) }}</text>
        <line :x1="lx(Math.max(m.s - m.h, 0.6))" :x2="lx(Math.min(m.s + m.h, 0.76))" :y1="16 + i * 28" :y2="16 + i * 28" stroke="#818cf8" stroke-width="7" stroke-linecap="round" opacity="0.5" />
        <circle :cx="lx(m.s)" :cy="16 + i * 28" r="4" fill="#4f46e5" />
      </g>
      <text x="480" y="122" class="fill-slate-400" font-size="9">60 ~ 76점 구간</text>
    </svg>
    <p class="mt-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{{ lbVerdict }}</p>
  </div>
</template>
