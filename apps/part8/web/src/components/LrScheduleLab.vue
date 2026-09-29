<script setup lang="ts">
// ch6 인터랙티브 — ① 일정표 경주: 고정 큰 보폭 vs 고정 작은 보폭 vs 코사인 감쇠 (노이즈 지형)
//                 ② 서성임 확대경: 바닥 근처에서 보폭이 정착 반경을 결정한다.
// 오프라인·결정적 — 시드 고정 PRNG(mulberry32). 노트북과 같은 설정.
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

const C = 2.0
const SIGMA = 1.5
const T = 120

// ── ① 일정표 경주 ─────────────────────────────────────────────
interface Sched {
  name: string
  color: string
  lr: (t: number) => number
}
const SCHEDS: Sched[] = [
  { name: '고정 0.3 (내내 성큼)', color: 'var(--c-rose-600)', lr: () => 0.3 },
  { name: '고정 0.02 (내내 잔걸음)', color: 'var(--c-sky-500)', lr: () => 0.02 },
  { name: '코사인 0.3→0 (성큼→잔걸음)', color: 'var(--c-emerald-600)', lr: (t) => 0.3 * 0.5 * (1 + Math.cos((Math.PI * t) / T)) },
]
const raced = ref(false)
const results = computed(() => {
  if (!raced.value) return null
  return SCHEDS.map((s) => {
    const rand = mulberry32(606) // 셋 다 같은 노이즈 시퀀스 — 공정한 경주
    let w = 8
    const losses: number[] = []
    for (let t = 0; t < T; t++) {
      w -= s.lr(t) * (C * w + SIGMA * gaussian(rand))
      losses.push(0.5 * C * w * w)
    }
    const tail = losses.slice(-20).reduce((a, b) => a + b, 0) / 20
    return { ...s, losses, early: losses[29], tail }
  })
})
// 손실 곡선 SVG (0~12 클램프)
const lossPath = (losses: number[]) =>
  losses.map((l, t) => `${15 + t * 2.3},${95 - (Math.min(l, 12) / 12) * 85}`).join(' ')
const lrPath = (s: Sched) =>
  Array.from({ length: T }, (_, t) => `${15 + t * 2.3},${40 - (s.lr(t) / 0.32) * 32}`).join(' ')

// ── ② 서성임 확대경 ────────────────────────────────────────────
const lr2 = ref(0.3)
const wander = computed(() => {
  const rand = mulberry32(707)
  let w = 0
  const ws: number[] = []
  for (let t = 0; t < 300; t++) {
    w -= lr2.value * (C * w + SIGMA * gaussian(rand))
    if (t >= 100) ws.push(w)
  }
  const mean = ws.reduce((a, b) => a + b, 0) / ws.length
  const std = Math.sqrt(ws.reduce((a, b) => a + (b - mean) ** 2, 0) / ws.length)
  return { ws: ws.slice(-80), std }
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 일정표 경주 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① · 일정표 경주: 같은 지형, 같은 노이즈, 다른 일정</p>
    <p class="mb-3 text-xs text-slate-500">
      흔들리는 나침반(3장)의 골짜기를 120스텝 걷습니다. 셋은 <b>완전히 같은 노이즈</b>를 겪어요.
      다른 것은 보폭의 일정표뿐.
    </p>

    <button
      v-if="!raced"
      type="button"
      class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
      @click="raced = true"
    >
      🏁 경주 시작 (120스텝)
    </button>

    <template v-if="results">
      <p class="mb-1 text-xs font-semibold text-slate-500">보폭의 일정표 (lr 곡선)</p>
      <svg viewBox="0 0 300 46" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
        <polyline v-for="s in SCHEDS" :key="s.name" :points="lrPath(s)" fill="none" :stroke="s.color" stroke-width="1.5" opacity="0.9" />
      </svg>
      <p class="mt-2 mb-1 text-xs font-semibold text-slate-500">손실 곡선 (12에서 절단)</p>
      <svg viewBox="0 0 300 100" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
        <polyline v-for="r in results" :key="r.name" :points="lossPath(r.losses)" fill="none" :stroke="r.color" stroke-width="1.5" opacity="0.9" />
      </svg>

      <div class="mt-2 space-y-1">
        <div v-for="r in results" :key="r.name" class="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs">
          <span class="w-52 shrink-0 font-semibold" :style="{ color: r.color }">{{ r.name }}</span>
          <span class="w-28 shrink-0 font-mono text-slate-500">30스텝: {{ r.early.toFixed(2) }}</span>
          <span class="min-w-0 flex-1 font-mono font-bold text-slate-700">마지막 평균: {{ r.tail.toFixed(3) }}</span>
        </div>
      </div>

      <p class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-800">
        ✅ <b class="text-rose-700">고정 0.3</b>은 빨리 내려가지만 바닥 근처에서 <b>서성이느라 정착을
        못 하고</b>(마지막 {{ results[0].tail.toFixed(2) }}), <b class="text-sky-700">고정 0.02</b>는
        안전하지만 하세월(30스텝에 아직 {{ results[1].early.toFixed(1) }}).
        <b class="text-emerald-700">코사인</b>은 초반엔 0.3처럼 성큼, 후반엔 잔걸음으로
        <b>가장 깊이 정착</b>({{ results[2].tail.toFixed(3) }}, 고정 0.3의 {{ Math.round(results[0].tail / results[2].tail) }}분의 1).
        보폭 하나로는 못 얻는 것을 <b>일정표</b>가 얻어 줍니다.
      </p>
    </template>

    <!-- ② 서성임 확대경 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② · 서성임 확대경: 왜 후반엔 보폭을 줄여야 하나</p>
    <p class="mb-3 text-xs text-slate-500">
      이미 골짜기 바닥(w = 0)에 도착한 상태에서 노이즈 낀 걸음을 계속 걷습니다. 보폭을 바꿔 보세요.
    </p>

    <label class="block text-xs text-slate-500">
      보폭 lr = <b class="text-slate-700">{{ lr2.toFixed(2) }}</b>
      <input v-model.number="lr2" type="range" min="0.02" max="0.4" step="0.01" class="mt-1 w-full accent-indigo-600" />
    </label>

    <svg viewBox="0 0 300 70" class="mt-2 w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <line x1="10" y1="35" x2="290" y2="35" stroke="var(--c-emerald-600)" stroke-width="1" stroke-dasharray="3 3" />
      <text x="288" y="32" text-anchor="end" font-size="8" fill="var(--c-emerald-600)">바닥 (w = 0)</text>
      <polyline
        :points="wander.ws.map((w, i) => `${12 + i * 3.5},${35 - Math.max(-1.4, Math.min(1.4, w)) * 22}`).join(' ')"
        fill="none"
        stroke="var(--c-indigo-500)"
        stroke-width="1.5"
      />
    </svg>

    <div class="mt-2 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div class="text-center">
        <p class="text-xs text-slate-500">서성임 반경 (w의 표준편차)</p>
        <p class="font-mono text-xl font-bold" :class="wander.std > 0.25 ? 'text-rose-700' : 'text-emerald-700'">{{ wander.std.toFixed(3) }}</p>
      </div>
      <p class="flex-1 text-xs leading-relaxed text-slate-600">
        바닥에 도착해도 노이즈 × 보폭만큼 계속 <b>밀려납니다</b>. 보폭을 줄이면 반경이 줄어요
        (√보폭에 비례). 고정 큰 보폭이 끝까지 정착 못 하던 이유이자, <b>감쇠가 존재하는 이유</b>입니다.
      </p>
    </div>
  </div>
</template>
