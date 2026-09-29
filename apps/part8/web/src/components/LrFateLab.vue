<script setup lang="ts">
// ch0 인터랙티브 — ① 세 개의 운명: 같은 지형·같은 출발, 보폭(학습률)만 다른 세 러너
//                 ② 경계 탐색기: 보폭 슬라이더로 도착·기어가기·진동·폭발의 경계를 직접 찾기.
// 오프라인·결정적 — 손실 L(w) = (w-3)², 갱신 w ← w − lr·2(w-3). 난수 없음.
import { computed, ref } from 'vue'

const TARGET = 3
const START = -5
const loss = (w: number) => (w - TARGET) ** 2
const step = (w: number, lr: number) => w - lr * 2 * (w - TARGET)

// ── ① 세 개의 운명 ─────────────────────────────────────────────
interface Runner {
  name: string
  lr: number
  color: string
  emoji: string
}
const RUNNERS: Runner[] = [
  { name: '소심이', lr: 0.02, color: 'var(--c-sky-500)', emoji: '🐢' },
  { name: '적당이', lr: 0.3, color: 'var(--c-emerald-600)', emoji: '🏃' },
  { name: '무모이', lr: 1.05, color: 'var(--c-rose-600)', emoji: '💥' },
]
const positions = ref(RUNNERS.map(() => [START]))
const steps = ref(0)

function run(n: number) {
  for (let k = 0; k < n; k++) {
    positions.value = positions.value.map((hist, i) => {
      const w = hist[hist.length - 1]
      if (Math.abs(w - TARGET) > 40) return hist // 폭발 확정 — 더 계산 안 함
      return [...hist, step(w, RUNNERS[i].lr)]
    })
    steps.value++
  }
}
function reset() {
  positions.value = RUNNERS.map(() => [START])
  steps.value = 0
}
type Fate = { label: string; tone: string }
function fateOf(w: number, lr: number): Fate {
  const L = loss(w)
  if (L > loss(START) + 1e-9) return { label: '💥 폭발 (출발점보다 높이!)', tone: 'text-rose-700' }
  if (L < 0.01) return { label: '✅ 도착', tone: 'text-emerald-700' }
  if (lr < 0.1) return { label: '🐢 기어가는 중…', tone: 'text-sky-700' }
  return { label: '🏃 내려가는 중', tone: 'text-emerald-700' }
}
const rows = computed(() =>
  RUNNERS.map((r, i) => {
    const hist = positions.value[i]
    const w = hist[hist.length - 1]
    return { ...r, w, loss: loss(w), fate: fateOf(w, r.lr) }
  }),
)

// SVG 변환 — 포물선 지형 (w ∈ [-9, 15], L ∈ [0, 144])
const px = (w: number) => 20 + ((Math.min(15, Math.max(-9, w)) + 9) * 280) / 24
const py = (L: number) => 180 - (Math.min(144, L) / 144) * 150
const PARABOLA = Array.from({ length: 49 }, (_, i) => {
  const w = -9 + (i * 24) / 48
  return `${px(w)},${py(loss(w))}`
}).join(' ')

// ── ② 경계 탐색기 ──────────────────────────────────────────────
const lr2 = ref(0.5)
const result2 = computed(() => {
  let w = START
  for (let i = 0; i < 20; i++) w = step(w, lr2.value)
  const L = loss(w)
  let verdict: Fate
  if (L > loss(START) + 1e-9) verdict = { label: '💥 폭발: 스텝마다 더 높이 튕겨 나갑니다', tone: 'text-rose-700' }
  else if (Math.abs(L - loss(START)) < 1e-9) verdict = { label: '♾️ 무한 진동: 같은 높이의 반대편으로 영원히', tone: 'text-amber-700' }
  else if (L < 0.01) verdict = { label: '✅ 도착: 골짜기 바닥', tone: 'text-emerald-700' }
  else verdict = { label: '🐢 아직 가는 중: 20스텝으로는 부족', tone: 'text-sky-700' }
  return { w, loss: L, verdict }
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 세 개의 운명 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① · 세 개의 운명: 같은 산, 같은 출발점, 다른 보폭</p>
    <p class="mb-3 text-xs text-slate-500">
      셋 다 같은 손실 골짜기(L = (w−3)²)를 w = −5에서 출발합니다. 다른 것은 <b>보폭(학습률)</b> 하나뿐입니다.
      스텝을 진행시켜 보세요.
    </p>

    <svg viewBox="0 0 320 200" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <polyline :points="PARABOLA" fill="none" stroke="var(--c-slate-300)" stroke-width="2" />
      <!-- 목표 깃발 -->
      <text :x="px(TARGET)" :y="py(0) + 14" text-anchor="middle" font-size="12">🚩</text>
      <!-- 러너 자취 + 현재 위치 -->
      <template v-for="(r, i) in RUNNERS" :key="r.name">
        <circle
          v-for="(w, k) in positions[i]"
          :key="k"
          :cx="px(w)"
          :cy="py(loss(w))"
          r="2"
          :fill="r.color"
          :opacity="0.15 + (0.5 * k) / Math.max(1, positions[i].length - 1)"
        />
        <text
          :x="px(positions[i][positions[i].length - 1])"
          :y="py(loss(positions[i][positions[i].length - 1])) - 6"
          text-anchor="middle"
          font-size="13"
        >{{ r.emoji }}</text>
      </template>
    </svg>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500" @click="run(1)">
        1스텝
      </button>
      <button type="button" class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500" @click="run(5)">
        5스텝
      </button>
      <button type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200" @click="reset()">
        처음부터
      </button>
      <span class="text-xs text-slate-500">스텝 {{ steps }}</span>
    </div>

    <div class="mt-2 space-y-1">
      <div v-for="r in rows" :key="r.name" class="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs">
        <span class="w-24 shrink-0 font-semibold" :style="{ color: r.color }">{{ r.emoji }} {{ r.name }} (lr {{ r.lr }})</span>
        <span class="w-24 shrink-0 font-mono text-slate-500">w = {{ r.w.toFixed(2) }}</span>
        <span class="w-28 shrink-0 font-mono text-slate-500">손실 {{ r.loss > 9999 ? '∞급' : r.loss.toFixed(2) }}</span>
        <span class="min-w-0 flex-1 font-medium" :class="r.fate.tone">{{ r.fate.label }}</span>
      </div>
    </div>

    <p v-if="steps >= 10" class="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">
      👀 수학(기울기 계산)은 셋 다 완벽히 같았습니다. 운명을 가른 건 <b>보폭 하나</b>예요.
      소심이는 언젠가 도착하지만 너무 느리고, 무모이는 골짜기를 <b>건너뛰어 반대편 더 높은 곳</b>에
      착지하기를 반복합니다(폭발). 이 다이얼의 이름이 <b>학습률</b>입니다.
    </p>

    <!-- ② 경계 탐색기 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② · 경계 탐색기: 폭발은 정확히 어디서 시작될까</p>
    <p class="mb-3 text-xs text-slate-500">
      보폭을 직접 정하고 20스텝을 달리게 해 보세요. <b>도착↔폭발의 경계</b>가 어딘가에 있습니다. 찾아보세요.
    </p>

    <label class="block text-xs text-slate-500">
      보폭(학습률) = <b class="text-slate-700">{{ lr2.toFixed(2) }}</b>
      <input v-model.number="lr2" type="range" min="0.01" max="1.2" step="0.01" class="mt-1 w-full accent-indigo-600" />
    </label>

    <div class="mt-2 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div class="text-center">
        <p class="text-xs text-slate-500">20스텝 후 손실</p>
        <p class="font-mono text-lg font-bold text-slate-700">{{ result2.loss > 9999 ? '∞급' : result2.loss.toFixed(3) }}</p>
      </div>
      <p class="flex-1 text-sm font-medium" :class="result2.verdict.tone">{{ result2.verdict.label }}</p>
    </div>

    <p class="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 경계를 찾으셨나요? 이 골짜기에서는 <b>정확히 1.00</b>입니다. 그보다 작으면 언젠가 도착,
      정확히 1.00이면 같은 높이를 영원히 왕복, 넘으면 폭발. 왜 하필 1.00인지, 골짜기의 <b>가파름</b>과
      경계의 관계는 2장(보폭의 과학)에서 계산으로 밝혀냅니다.
    </p>
  </div>
</template>
