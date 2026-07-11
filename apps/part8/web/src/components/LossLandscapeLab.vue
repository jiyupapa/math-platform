<script setup lang="ts">
// ch1 인터랙티브 — ① 안개 낀 산 탐험: 2D 손실 지형에서 출발점 따라 갈리는 하산의 운명
//                   (안개 토글 = 여행자의 시점 vs 신의 시점)
//                 ② 안개의 이유: 지형 전체를 그리는 비용의 조합 폭발 계산기.
// 오프라인·결정적 — 지형은 해석적 함수, 난수 없음. 노트북과 같은 지형.
import { computed, ref } from 'vue'

// ── 지형: 전역 골짜기(7,4 깊음) + 국소최소(2.5,7 얕음) + 완만한 그릇 ──
function lossAt(x: number, y: number) {
  const r1 = (x - 7) ** 2 + (y - 4) ** 2
  const r2 = (x - 2.5) ** 2 + (y - 7) ** 2
  return 3 - 2.5 * Math.exp(-r1 / 3) - 1.2 * Math.exp(-r2 / 2) + 0.02 * ((x - 5) ** 2 + (y - 5) ** 2)
}
function gradAt(x: number, y: number) {
  const r1 = (x - 7) ** 2 + (y - 4) ** 2
  const r2 = (x - 2.5) ** 2 + (y - 7) ** 2
  const e1 = Math.exp(-r1 / 3)
  const e2 = Math.exp(-r2 / 2)
  return {
    gx: (5 / 3) * (x - 7) * e1 + 1.2 * (x - 2.5) * e2 + 0.04 * (x - 5),
    gy: (5 / 3) * (y - 4) * e1 + 1.2 * (y - 7) * e2 + 0.04 * (y - 5),
  }
}
const LR = 0.8

// 히트맵 (44×40 셀, 정적 — 신의 시점)
const CELL = 8
const CELLS = (() => {
  const out: { x: number; y: number; fill: string }[] = []
  for (let i = 0; i < 44; i++) {
    for (let j = 0; j < 40; j++) {
      const x = (i + 0.5) * 0.25
      const y = (j + 0.5) * 0.25
      const t = Math.min(1, Math.max(0, (lossAt(x, y) - 0.55) / 3.6))
      out.push({ x: i * CELL, y: (39 - j) * CELL, fill: `hsl(${150 - 115 * t} ${55 - 25 * t}% ${38 + 50 * t}%)` })
    }
  }
  return out
})()
const px = (x: number) => (x / 0.25) * CELL
const py = (y: number) => ((10 - y) / 0.25) * CELL // 화면 y 는 아래로 증가 — 반전

interface Start {
  key: string
  label: string
  x: number
  y: number
}
const STARTS: Start[] = [
  { key: 'plateau', label: '🏜️ 북동쪽 평원에서', x: 10.3, y: 8.8 },
  { key: 'ridge', label: '⛰️ 서쪽 능선에서', x: 1.5, y: 8.2 },
  { key: 'south', label: '🌄 남쪽 기슭에서', x: 6.2, y: 1.5 },
]
const startIdx = ref(2)
const trail = ref<{ x: number; y: number }[]>([{ x: STARTS[2].x, y: STARTS[2].y }])
const fog = ref(true)

function pickStart(i: number) {
  startIdx.value = i
  trail.value = [{ x: STARTS[i].x, y: STARTS[i].y }]
}
function walk(n: number) {
  for (let k = 0; k < n; k++) {
    const cur = trail.value[trail.value.length - 1]
    const { gx, gy } = gradAt(cur.x, cur.y)
    trail.value = [...trail.value, { x: cur.x - LR * gx, y: cur.y - LR * gy }]
  }
}
const pos = computed(() => trail.value[trail.value.length - 1])
const curLoss = computed(() => lossAt(pos.value.x, pos.value.y))
const curGrad = computed(() => {
  const { gx, gy } = gradAt(pos.value.x, pos.value.y)
  return { gx, gy, mag: Math.hypot(gx, gy) }
})
const verdict = computed(() => {
  const d7 = Math.hypot(pos.value.x - 6.95, pos.value.y - 4.02)
  const d2 = Math.hypot(pos.value.x - 2.58, pos.value.y - 6.93)
  if (d7 < 0.6) return { label: '🏁 가장 깊은 골짜기 도착! (손실 0.60 — 전역최소)', tone: 'text-emerald-600' }
  if (d2 < 0.6 && curGrad.value.mag < 0.15)
    return { label: '⚠️ 국소최소에 정착 — 발밑이 평평해 여기가 바닥인 줄 알지만, 더 깊은 곳이 있다!', tone: 'text-rose-600' }
  if (curGrad.value.mag < 0.35 && curLoss.value > 3) return { label: '🐌 평원 — 발밑 경사가 거의 없어 걸음이 짧다', tone: 'text-amber-600' }
  return { label: '🥾 하산 중…', tone: 'text-slate-600' }
})

// ── ② 조합 폭발 계산기 ─────────────────────────────────────────
const W_OPTS = [
  { w: 2, label: '가중치 2개 (오늘의 toy)', total: '10² = 100번', note: '즉시 끝. 그래서 오늘은 신의 시점(지도 전체)을 보여드릴 수 있었어요.', dead: false },
  { w: 10, label: '가중치 10개', total: '10¹⁰ = 100억 번', note: '벌써 하루 종일 계산할 양 — 겨우 가중치 10개인데요.', dead: true },
  { w: 1e9, label: '가중치 10억 개 (실제 LLM급)', total: '10^(10억) 번', note: '1 뒤에 0이 10억 개 — 우주의 원자 수(약 10⁸⁰)와는 비교조차 불가능합니다. 지형 전체를 그리는 일은 영원히 없어요.', dead: true },
]
const wIdx = ref(0)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 안개 낀 산 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 안개 낀 산: 출발점이 운명을 가른다</p>
    <p class="mb-3 text-xs text-slate-400">
      가중치 2개짜리 toy 모델의 손실 지형입니다(진할수록 낮은 손실). 여행자(🥾)는 <b>발밑 경사(화살표)만</b>
      보며 걷습니다 — 안개를 걷어 신의 시점과 비교해 보세요.
    </p>

    <div class="mb-2 flex flex-wrap gap-2">
      <button
        v-for="(s, i) in STARTS"
        :key="s.key"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
        :class="startIdx === i ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
        @click="pickStart(i)"
      >
        {{ s.label }}
      </button>
    </div>

    <svg viewBox="0 0 352 320" class="w-full rounded-lg ring-1 ring-slate-200" :class="fog ? 'bg-slate-300' : 'bg-slate-50'">
      <!-- 신의 시점 (안개 걷힘) -->
      <template v-if="!fog">
        <rect v-for="(c, i) in CELLS" :key="i" :x="c.x" :y="c.y" :width="CELL" :height="CELL" :fill="c.fill" />
        <text :x="px(6.95)" :y="py(4.02) + 4" text-anchor="middle" font-size="12">🚩</text>
        <text :x="px(2.58)" :y="py(6.93) + 4" text-anchor="middle" font-size="11">🕳️</text>
      </template>
      <!-- 자취 -->
      <circle
        v-for="(p, k) in trail"
        :key="'t' + k"
        :cx="px(p.x)"
        :cy="py(p.y)"
        r="2.5"
        :fill="fog ? '#f8fafc' : '#312e81'"
        :opacity="0.25 + (0.6 * k) / Math.max(1, trail.length - 1)"
      />
      <!-- 발밑 경사 화살표 (내리막 방향) -->
      <line
        :x1="px(pos.x)"
        :y1="py(pos.y)"
        :x2="px(pos.x) - curGrad.gx * 55"
        :y2="py(pos.y) + curGrad.gy * 55"
        stroke="#e11d48"
        stroke-width="2.5"
      />
      <text :x="px(pos.x)" :y="py(pos.y) - 8" text-anchor="middle" font-size="14">🥾</text>
    </svg>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500" @click="walk(1)">
        한 걸음
      </button>
      <button type="button" class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500" @click="walk(10)">
        10걸음
      </button>
      <button type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-200" @click="pickStart(startIdx)">
        처음부터
      </button>
      <button
        type="button"
        class="ml-auto rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="fog ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'"
        @click="fog = !fog"
      >
        {{ fog ? '☀️ 안개 걷기 (신의 시점)' : '🌫️ 안개 끼기 (여행자의 시점)' }}
      </button>
    </div>

    <div class="mt-2 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-[11px] text-slate-400">걸음 수</p>
        <p class="font-mono text-sm font-bold text-slate-700">{{ trail.length - 1 }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-[11px] text-slate-400">현재 손실 (고도)</p>
        <p class="font-mono text-sm font-bold text-slate-700">{{ curLoss.toFixed(2) }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-[11px] text-slate-400">발밑 경사 |∇L|</p>
        <p class="font-mono text-sm font-bold text-slate-700">{{ curGrad.mag.toFixed(3) }}</p>
      </div>
    </div>
    <p class="mt-2 rounded-lg bg-slate-50 p-3 text-sm font-medium" :class="verdict.tone">{{ verdict.label }}</p>

    <p class="mt-3 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      💡 세 출발점을 모두 시험해 보세요 — 남쪽 기슭은 몇 걸음 만에 🚩 전역최소, 서쪽 능선은 🕳️
      <b>국소최소에 정착</b>(발밑 경사가 0이라 자기가 바닥인 줄 압니다), 북동쪽 평원은 발밑이
      거의 평평해 <b>하염없이 기어갑니다</b>. 그리고 안개를 껴 보면 — 여행자는 이 모든 걸
      <b>모른 채</b> 발밑만 보고 걷고 있었다는 게 보여요.
    </p>

    <!-- ② 조합 폭발 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 안개의 이유: 지도 전체를 그리는 비용</p>
    <p class="mb-3 text-xs text-slate-400">
      "안개를 걷으면 되잖아?" — 가중치마다 딱 10가지 값만 훑어서 지도 전체를 그려 봅시다. 손실 계산이 몇 번 필요할까요?
    </p>

    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="(o, i) in W_OPTS"
        :key="o.label"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="wIdx === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
        @click="wIdx = i"
      >
        {{ o.label }}
      </button>
    </div>

    <div class="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div class="text-center">
        <p class="text-[11px] text-slate-400">필요한 손실 계산</p>
        <p class="font-mono text-lg font-bold" :class="W_OPTS[wIdx].dead ? 'text-rose-600' : 'text-emerald-600'">{{ W_OPTS[wIdx].total }}</p>
      </div>
      <p class="flex-1 text-xs leading-relaxed text-slate-600">{{ W_OPTS[wIdx].note }}</p>
    </div>

    <p class="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 반면 <b>발밑 기울기 한 번</b>은 역전파(2부 10장) 한 번 — 순전파의 2~3배 비용이면 수십억
      가중치 전부의 경사가 나옵니다. 그래서 훈련은 언제나 <b>안개 속의 하산</b>일 수밖에 없고,
      이 과정의 다이얼들은 전부 "<b>안개 속에서 잘 걷는 기술</b>"입니다.
    </p>
  </div>
</template>
