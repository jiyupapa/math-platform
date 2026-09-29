<script setup lang="ts">
// ch4 인터랙티브 — ① 지그재그 vs 관성: 좁고 긴 타원 골짜기에서 GD와 모멘텀의 경주 (β 조절)
//                 ② EMA 기계: 지그재그 입력은 상쇄되고 일관된 입력은 1/(1−β)배로 쌓인다.
// 오프라인·결정적 — 노이즈 없음. 노트북과 같은 타원 골짜기.
import { computed, ref } from 'vue'

// ── 타원 골짜기: 전진 방향 완만(cx=0.1), 벽 방향 가파름(cy=8) ──
const CX = 0.1
const CY = 8.0
const L = (x: number, y: number) => 0.5 * CX * x * x + 0.5 * CY * y * y
const LR = 0.2
const START = { x: -9, y: 1.5 }

const beta = ref(0.9)
const gdTrail = ref<{ x: number; y: number }[]>([{ ...START }])
const momTrail = ref<{ x: number; y: number }[]>([{ ...START }])
let vx = 0
let vy = 0

function race(n: number) {
  for (let k = 0; k < n; k++) {
    const g = gdTrail.value[gdTrail.value.length - 1]
    gdTrail.value = [...gdTrail.value, { x: g.x - LR * CX * g.x, y: g.y - LR * CY * g.y }]
    const m = momTrail.value[momTrail.value.length - 1]
    vx = beta.value * vx + CX * m.x
    vy = beta.value * vy + CY * m.y
    momTrail.value = [...momTrail.value, { x: m.x - LR * vx, y: m.y - LR * vy }]
  }
}
function resetRace() {
  gdTrail.value = [{ ...START }]
  momTrail.value = [{ ...START }]
  vx = 0
  vy = 0
}
const steps = computed(() => gdTrail.value.length - 1)
const gdPos = computed(() => gdTrail.value[gdTrail.value.length - 1])
const momPos = computed(() => momTrail.value[momTrail.value.length - 1])
const gdLoss = computed(() => L(gdPos.value.x, gdPos.value.y))
const momLoss = computed(() => L(momPos.value.x, momPos.value.y))

// SVG 변환 (x ∈ [-10.5, 6], y ∈ [-2, 2])
const px = (x: number) => 20 + (x + 10.5) * 16
const py = (y: number) => 60 - y * 28
const LEVELS = [0.5, 2, 6, 12]

// ── ② EMA 기계 ────────────────────────────────────────────────
const beta2 = ref(0.9)
function emaAfter(signal: (k: number) => number, b: number, n = 40) {
  let v = 0
  for (let k = 0; k < n; k++) v = b * v + signal(k)
  return v
}
const vZig = computed(() => Math.abs(emaAfter((k) => (k % 2 === 0 ? 1 : -1), beta2.value)))
const vConst = computed(() => emaAfter(() => 1, beta2.value))
const amp = computed(() => 1 / (1 - beta2.value))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 지그재그 vs 관성 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① · 좁고 긴 골짜기: 지그재그 vs 관성</p>
    <p class="mb-3 text-xs text-slate-500">
      벽 방향(세로)은 가파르고(c=8) 전진 방향(가로)은 완만한(c=0.1) 골짜기, 곧 2장의 축별 곡률
      딜레마 그 지형입니다. 🔵 GD 와 🟠 모멘텀이 같은 보폭(lr 0.2)으로 경주합니다.
    </p>

    <svg viewBox="0 0 300 120" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <ellipse
        v-for="lv in LEVELS"
        :key="lv"
        :cx="px(0)"
        :cy="py(0)"
        :rx="Math.sqrt((2 * lv) / CX) * 16"
        :ry="Math.sqrt((2 * lv) / CY) * 28"
        fill="none"
        stroke="var(--c-slate-300)"
        stroke-width="1"
      />
      <text :x="px(0)" :y="py(0) + 4" text-anchor="middle" font-size="11">🚩</text>
      <polyline :points="gdTrail.map((p) => `${px(p.x)},${py(p.y)}`).join(' ')" fill="none" stroke="var(--c-sky-500)" stroke-width="1.5" opacity="0.8" />
      <polyline :points="momTrail.map((p) => `${px(p.x)},${py(p.y)}`).join(' ')" fill="none" stroke="var(--c-amber-500)" stroke-width="1.5" opacity="0.8" />
      <text :x="px(gdPos.x)" :y="py(gdPos.y) - 5" text-anchor="middle" font-size="12">🔵</text>
      <text :x="px(momPos.x)" :y="py(momPos.y) + 14" text-anchor="middle" font-size="12">🟠</text>
    </svg>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500" @click="race(10)">
        10스텝
      </button>
      <button type="button" class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500" @click="race(30)">
        30스텝
      </button>
      <button type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200" @click="resetRace()">
        처음부터
      </button>
      <span class="text-xs text-slate-500">스텝 {{ steps }}</span>
      <label class="ml-auto flex items-center gap-2 text-xs text-slate-500">
        🟠 관성 β = <b class="text-slate-700">{{ beta.toFixed(2) }}</b>
        <input v-model.number="beta" type="range" min="0" max="0.99" step="0.01" class="w-28 accent-amber-600" @input="resetRace()" />
      </label>
    </div>

    <div class="mt-2 grid grid-cols-2 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-xs text-slate-500">🔵 GD (관성 없음)</p>
        <p class="font-mono text-sm font-bold text-slate-700">L = {{ gdLoss.toFixed(3) }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-xs text-slate-500">🟠 모멘텀 (β = {{ beta.toFixed(2) }})</p>
        <p class="font-mono text-sm font-bold text-slate-700">L = {{ momLoss.toFixed(3) }}</p>
      </div>
    </div>

    <p v-if="steps >= 60 && beta >= 0.85 && beta <= 0.95 && momLoss < gdLoss / 5" class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-800">
      ✅ 🔵는 벽 사이를 <b>잘게 튕기며</b> 전진이 굼뜨지만(60스텝에도 L ≈ {{ gdLoss.toFixed(2) }}),
      🟠는 벽 방향 진동이 <b>상쇄</b>되고 전진 방향 속도가 <b>누적</b>되어 훌쩍 앞서갑니다
      (L ≈ {{ momLoss.toFixed(3) }}). 같은 보폭, 같은 기울기에 더한 것은 <b>기억(관성)</b>뿐이에요.
    </p>
    <p v-else-if="steps >= 30 && beta > 0.97" class="mt-3 rounded-lg bg-rose-50 p-3 text-sm leading-relaxed text-rose-700">
      ⚠️ β = {{ beta.toFixed(2) }}: 기억이 너무 길어(약 {{ Math.round(1 / (1 - beta)) }}걸음)
      골짜기 바닥을 <b>지나쳐 되돌아오기</b>를 반복합니다(오버슈트). 관성도 과하면 진자가 돼요.
    </p>
    <p v-else-if="steps > 0" class="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
      경주 중… 60스텝까지 진행하고, β를 0 → 0.9 → 0.99로 바꿔 가며(β를 바꾸면 자동 리셋) 비교해 보세요.
    </p>

    <!-- ② EMA 기계 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② · 관성의 정체: 상쇄와 증폭의 기계 (EMA)</p>
    <p class="mb-3 text-xs text-slate-500">
      속도 v ← β·v + 기울기. 두 종류의 기울기 흐름을 넣어 40스텝 뒤의 속도를 비교합니다.
    </p>

    <label class="block text-xs text-slate-500">
      기억 다이얼 β = <b class="text-slate-700">{{ beta2.toFixed(2) }}</b> (유효 기억 ≈ {{ Math.round(amp) }}걸음)
      <input v-model.number="beta2" type="range" min="0" max="0.95" step="0.01" class="mt-1 w-full accent-indigo-600" />
    </label>

    <div class="mt-3 space-y-2">
      <div class="flex items-center gap-2 text-sm">
        <span class="w-44 shrink-0 text-xs font-semibold text-rose-700">↔️ 지그재그 입력 (+1, −1, +1…)</span>
        <div class="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div class="h-full rounded-full bg-rose-400" :style="{ width: Math.min(100, (vZig / 20) * 100) + '%' }" />
        </div>
        <span class="w-14 shrink-0 text-right font-mono text-xs text-rose-700">|v| = {{ vZig.toFixed(2) }}</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="w-44 shrink-0 text-xs font-semibold text-emerald-700">➡️ 일관된 입력 (+1, +1, +1…)</span>
        <div class="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div class="h-full rounded-full bg-emerald-500" :style="{ width: Math.min(100, (vConst / 20) * 100) + '%' }" />
        </div>
        <span class="w-14 shrink-0 text-right font-mono text-xs text-emerald-700">v = {{ vConst.toFixed(2) }}</span>
      </div>
    </div>

    <p class="mt-3 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      💡 같은 크기의 입력인데, 지그재그(벽에 튕기는 성분)는 부호가 교대라 <b>서로 지워지고</b>,
      일관된 방향(골짜기를 따라가는 성분)은 <b>1/(1−β) ≈ {{ amp.toFixed(0) }}배</b>까지 쌓입니다.
      모멘텀 = <b>지그재그 필터 + 전진 부스터</b>. β를 키우면 두 효과 모두 강해지지만,
      실험 ①에서 봤듯 기억이 너무 길면 진자가 됩니다.
    </p>
  </div>
</template>
