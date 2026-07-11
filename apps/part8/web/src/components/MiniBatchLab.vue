<script setup lang="ts">
// ch3 인터랙티브 — ① 나침반의 흔들림: 배치 크기별 기울기 추정치의 산포(σ/√B) 시각화
//                 ② 노이즈의 순기능: 이중 골짜기에서 GD(갇힘) vs SGD(탈출) 경주.
// 오프라인·결정적 — 시드 고정 PRNG(mulberry32). 노트북과 같은 이중 골짜기.
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

// ── ① 나침반의 흔들림 ──────────────────────────────────────────
// 진짜 기울기 방향(전체 데이터 평균) = (1, 0.35). 데이터 하나하나는 여기에 노이즈(σ=0.9)가 낀 화살표.
const TRUE_G = { x: 1, y: 0.35 }
const SIGMA = 0.9
const B_OPTS = [1, 4, 16, 64, 256]
const bIdx = ref(0)
const arrowsFor = (B: number) => {
  const rand = mulberry32(500 + B) // 배치 크기마다 고정 시드 — 조작 순서 무관
  const arrows: { x: number; y: number }[] = []
  for (let k = 0; k < 12; k++) {
    let sx = 0
    let sy = 0
    for (let i = 0; i < B; i++) {
      sx += TRUE_G.x + SIGMA * gaussian(rand)
      sy += TRUE_G.y + SIGMA * gaussian(rand)
    }
    arrows.push({ x: sx / B, y: sy / B })
  }
  return arrows
}
const cache = new Map<number, { arrows: { x: number; y: number }[]; spread: number }>()
function statsFor(B: number) {
  if (cache.has(B)) return cache.get(B)!
  const arrows = arrowsFor(B)
  const mx = arrows.reduce((s, a) => s + a.x, 0) / arrows.length
  const my = arrows.reduce((s, a) => s + a.y, 0) / arrows.length
  const spread = Math.sqrt(arrows.reduce((s, a) => s + (a.x - mx) ** 2 + (a.y - my) ** 2, 0) / arrows.length)
  const r = { arrows, spread }
  cache.set(B, r)
  return r
}
const B = computed(() => B_OPTS[bIdx.value])
const st = computed(() => statsFor(B.value))
const theory = computed(() => (SIGMA * Math.SQRT2) / Math.sqrt(B.value)) // 2D라 σ√2/√B

// 나침반 SVG (중심 110,80)
const CC = { x: 110, y: 80 }
const scaleArrow = 52

// ── ② GD vs SGD 경주 (이중 골짜기) ─────────────────────────────
const L2 = (w: number) => (w * w - 4) ** 2 / 16 + 0.4 * w
const g2 = (w: number) => (w * (w * w - 4)) / 4 + 0.4
const LR = 0.15
const NOISE = 2.5
const SEED = 13

const gdTrail = ref<number[]>([2.8])
const sgdTrail = ref<number[]>([2.8])
let sgdRand = mulberry32(SEED)

function race(n: number) {
  for (let k = 0; k < n; k++) {
    const wg = gdTrail.value[gdTrail.value.length - 1]
    gdTrail.value = [...gdTrail.value, wg - LR * g2(wg)]
    const ws = sgdTrail.value[sgdTrail.value.length - 1]
    sgdTrail.value = [...sgdTrail.value, ws - LR * (g2(ws) + NOISE * gaussian(sgdRand))]
  }
}
function resetRace() {
  gdTrail.value = [2.8]
  sgdTrail.value = [2.8]
  sgdRand = mulberry32(SEED)
}
const raceSteps = computed(() => gdTrail.value.length - 1)
const gdW = computed(() => gdTrail.value[gdTrail.value.length - 1])
const sgdW = computed(() => sgdTrail.value[sgdTrail.value.length - 1])
const raceDone = computed(() => raceSteps.value >= 150)

// 곡선 SVG (w ∈ [-3.4, 3.4], L ∈ [-1, 2.2])
const wx = (w: number) => 160 + w * 45
const wy = (l: number) => 150 - ((l + 1) / 3.2) * 130
const CURVE = Array.from({ length: 69 }, (_, i) => {
  const w = -3.4 + (i * 6.8) / 68
  return `${wx(w)},${wy(L2(w))}`
}).join(' ')
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 나침반의 흔들림 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 나침반의 흔들림: 몇 개를 물어보고 방향을 정할까</p>
    <p class="mb-3 text-xs text-slate-400">
      진짜 기울기(빨간 화살표)는 전체 데이터 256개의 평균입니다. 미니배치 B개만 뽑아 평균 낸
      "추정 나침반" 12개를 회색으로 겹쳐 그렸어요 — 배치 크기를 바꿔 보세요.
    </p>

    <div class="mb-2 flex flex-wrap gap-2">
      <button
        v-for="(b, i) in B_OPTS"
        :key="b"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-bold transition"
        :class="bIdx === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
        @click="bIdx = i"
      >
        B = {{ b }}{{ b === 256 ? ' (전체)' : '' }}
      </button>
    </div>

    <svg viewBox="0 0 220 160" class="w-full max-w-md rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <defs>
        <marker id="arr-g" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
          <path d="M0,0 L5,3 L0,6 z" fill="#94a3b8" />
        </marker>
        <marker id="arr-t" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0 L6,3.5 L0,7 z" fill="#e11d48" />
        </marker>
      </defs>
      <line
        v-for="(a, k) in st.arrows"
        :key="k"
        :x1="CC.x"
        :y1="CC.y"
        :x2="CC.x + a.x * scaleArrow"
        :y2="CC.y - a.y * scaleArrow"
        stroke="#94a3b8"
        stroke-width="1.5"
        opacity="0.65"
        marker-end="url(#arr-g)"
      />
      <line :x1="CC.x" :y1="CC.y" :x2="CC.x + TRUE_G.x * scaleArrow" :y2="CC.y - TRUE_G.y * scaleArrow" stroke="#e11d48" stroke-width="3" marker-end="url(#arr-t)" />
    </svg>

    <div class="mt-2 grid grid-cols-2 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-[11px] text-slate-400">추정 나침반의 산포 (실측)</p>
        <p class="font-mono text-sm font-bold text-slate-700">{{ st.spread.toFixed(3) }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-[11px] text-slate-400">이론값 ∝ σ/√B</p>
        <p class="font-mono text-sm font-bold text-indigo-600">{{ theory.toFixed(3) }}</p>
      </div>
    </div>

    <p class="mt-3 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      💡 B를 4배 키울 때마다 산포가 <b>절반</b>으로 줍니다(√4 = 2) — 3부 7장의 그 1/√n이
      네 번째로 등장했어요. 그리고 수확 체감도 그대로: 1→4는 극적이지만 64→256은 밋밋하죠.
      <b>정확도는 √B로만 늘는데 계산 비용은 B에 정비례</b> — 이 불균형이 미니배치가 존재하는 이유입니다.
    </p>

    <!-- ② GD vs SGD 경주 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 노이즈의 순기능: 완벽한 나침반이 함정에 빠진다</p>
    <p class="mb-3 text-xs text-slate-400">
      오른쪽의 <b>얕은 웅덩이</b> 위에서 두 여행자가 출발합니다 — 🔵 정확한 나침반(GD) vs
      🟠 흔들리는 나침반(SGD, 미니배치 노이즈). 왼쪽에 더 깊은 골짜기가 있어요.
    </p>

    <svg viewBox="0 0 320 165" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <polyline :points="CURVE" fill="none" stroke="#cbd5e1" stroke-width="2" />
      <text :x="wx(-2.19)" :y="wy(L2(-2.19)) + 14" text-anchor="middle" font-size="11">🚩</text>
      <!-- 자취 -->
      <circle v-for="(w, k) in sgdTrail.filter((_, i) => i % 3 === 0)" :key="'s' + k" :cx="wx(w)" :cy="wy(L2(w))" r="1.8" fill="#f59e0b" opacity="0.35" />
      <text :x="wx(gdW)" :y="wy(L2(gdW)) - 6" text-anchor="middle" font-size="13">🔵</text>
      <text :x="wx(sgdW)" :y="wy(L2(sgdW)) - 18" text-anchor="middle" font-size="13">🟠</text>
    </svg>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500" @click="race(10)">
        10스텝
      </button>
      <button type="button" class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500" @click="race(50)">
        50스텝
      </button>
      <button type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-200" @click="resetRace()">
        처음부터
      </button>
      <span class="text-[11px] text-slate-400">스텝 {{ raceSteps }}</span>
    </div>

    <div class="mt-2 grid grid-cols-2 gap-2">
      <div class="rounded-lg bg-slate-50 p-2 text-center">
        <p class="text-[11px] text-slate-400">🔵 정확한 나침반 (GD)</p>
        <p class="font-mono text-sm font-bold text-slate-700">L = {{ L2(gdW).toFixed(2) }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2 text-center">
        <p class="text-[11px] text-slate-400">🟠 흔들리는 나침반 (SGD)</p>
        <p class="font-mono text-sm font-bold text-slate-700">L = {{ L2(sgdW).toFixed(2) }}</p>
      </div>
    </div>

    <p v-if="raceDone && sgdW < -1.5" class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-800">
      ✅ 반전 — 🔵 완벽한 나침반은 얕은 웅덩이(L ≈ 0.76)에 <b>영원히 갇혔고</b>, 🟠 흔들리는
      나침반은 그 흔들림 덕에 언덕을 넘어 <b>더 깊은 골짜기(L ≈ −0.8)</b>에 도착했습니다.
      노이즈는 공짜 담금질 — 얕은 함정을 못 본 척 지나가게 해 줍니다. (같은 시드라 몇 번을
      다시 돌려도 같은 결과예요.)
    </p>
    <p v-else-if="raceSteps > 0" class="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
      경주 중… 150스텝까지 진행해 보세요. 🔵는 일찍 자리를 잡고, 🟠는 계속 들썩입니다 — 그 들썩임이 무엇을 가능하게 하는지.
    </p>
  </div>
</template>
