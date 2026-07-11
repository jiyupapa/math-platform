<script setup lang="ts">
// ch5 인터랙티브 — ① PCA 축 고르기: 축 각도를 돌려 투영 분산이 최대가 되는 방향 찾기
//                 ② 지도의 거짓말: 2D 지도 거리와 실제(고차원) 거리의 순위 역전 체험.
// 오프라인·결정적 (점 구름은 시드 고정 PRNG).
import { computed, ref } from 'vue'

// ── ① PCA 축 고르기 ────────────────────────────────────────────
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
// 주축 30° 방향으로 길게 퍼진 점 구름 (시드 고정)
const TRUE_DEG = 30
const POINTS = (() => {
  const rand = mulberry32(2026)
  const rad = (TRUE_DEG * Math.PI) / 180
  const u = { x: Math.cos(rad), y: Math.sin(rad) }
  const w = { x: -Math.sin(rad), y: Math.cos(rad) }
  return Array.from({ length: 30 }, () => {
    const a = gaussian(rand) * 2.0 // 주축 방향 퍼짐
    const b = gaussian(rand) * 0.55 // 수직 방향 퍼짐
    return { x: a * u.x + b * w.x, y: a * u.y + b * w.y }
  })
})()

const angle = ref(90) // 축 각도 (도)
function varianceAt(deg: number) {
  const rad = (deg * Math.PI) / 180
  const u = { x: Math.cos(rad), y: Math.sin(rad) }
  const s = POINTS.map((p) => p.x * u.x + p.y * u.y)
  const m = s.reduce((a, b) => a + b, 0) / s.length
  return s.reduce((a, b) => a + (b - m) * (b - m), 0) / s.length
}
const projVar = computed(() => varianceAt(angle.value))
const bestDeg = (() => {
  let best = 0
  for (let d = 0; d < 180; d++) if (varianceAt(d) > varianceAt(best)) best = d
  return best
})()
const maxVar = varianceAt(bestDeg)
const isBest = computed(() => Math.abs(angle.value - bestDeg) <= 2)

// SVG (중심 150, 90 / 1단위 = 18px)
const C = { x: 150, y: 90 }
const sx = (p: { x: number; y: number }) => C.x + p.x * 18
const sy = (p: { x: number; y: number }) => C.y - p.y * 18
const axisEnd = computed(() => {
  const rad = (angle.value * Math.PI) / 180
  return { x: Math.cos(rad) * 7, y: Math.sin(rad) * 7 }
})
// 1D 투영 좌표 (아래 스트립용)
const projected = computed(() => {
  const rad = (angle.value * Math.PI) / 180
  const u = { x: Math.cos(rad), y: Math.sin(rad) }
  return POINTS.map((p) => p.x * u.x + p.y * u.y)
})

// ── ② 지도의 거짓말 ────────────────────────────────────────────
// 미리 준비된 "t-SNE풍 2D 지도" — 실제(고차원) 거리는 별도 표에 (순위 역전 설계)
const DOCS5 = [
  { id: 'A', name: '인사 규정 문서들', x: 60, y: 120 },
  { id: 'B', name: '경비 규정 문서들', x: 150, y: 100 },
  { id: 'C', name: '보안 규정 문서들', x: 240, y: 120 },
]
const PAIR_DATA: Record<string, { map: number; real: number; note: string; twist: boolean }> = {
  'A-B': { map: 3.0, real: 0.9, note: '지도에서도 가깝고 실제로도 가깝습니다 — 이웃 관계는 대체로 믿을 만해요.', twist: false },
  'B-C': { map: 3.0, real: 0.7, note: '이 쌍도 지도와 실제가 대체로 일치합니다.', twist: false },
  'A-C': {
    map: 6.0,
    real: 0.75,
    note: '반전! 지도에선 제일 멀어 보이지만, 실제 고차원 거리는 0.75로 A-B(0.90)보다 오히려 가깝습니다 — 클러스터 사이 거리는 지도의 거짓말일 수 있어요.',
    twist: true,
  },
}
const pickedPair = ref<string | null>(null)
const pair = computed(() => (pickedPair.value ? { key: pickedPair.value, ...PAIR_DATA[pickedPair.value] } : null))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① PCA 축 고르기 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — PCA 되어 보기: 그림자가 가장 넓게 지는 축 찾기</p>
    <p class="mb-3 text-xs text-slate-400">
      2차원 점 구름을 1차원(축 하나)으로 요약한다면 — 어느 방향의 축이 정보를 제일 덜 잃을까요?
      축을 돌리며 <b>투영(그림자)의 퍼짐</b>을 관찰하세요.
    </p>

    <svg viewBox="0 0 300 180" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <!-- 축 -->
      <line :x1="sx({ x: -axisEnd.x, y: -axisEnd.y })" :y1="sy({ x: -axisEnd.x, y: -axisEnd.y })" :x2="sx(axisEnd)" :y2="sy(axisEnd)" :stroke="isBest ? '#059669' : '#4f46e5'" stroke-width="2" />
      <!-- 점 + 투영선 -->
      <template v-for="(p, i) in POINTS" :key="i">
        <line
          :x1="sx(p)"
          :y1="sy(p)"
          :x2="sx({ x: projected[i] * Math.cos((angle * Math.PI) / 180), y: projected[i] * Math.sin((angle * Math.PI) / 180) })"
          :y2="sy({ x: projected[i] * Math.cos((angle * Math.PI) / 180), y: projected[i] * Math.sin((angle * Math.PI) / 180) })"
          stroke="#cbd5e1"
          stroke-width="0.7"
        />
        <circle :cx="sx(p)" :cy="sy(p)" r="2.5" fill="#64748b" />
        <circle
          :cx="sx({ x: projected[i] * Math.cos((angle * Math.PI) / 180), y: projected[i] * Math.sin((angle * Math.PI) / 180) })"
          :cy="sy({ x: projected[i] * Math.cos((angle * Math.PI) / 180), y: projected[i] * Math.sin((angle * Math.PI) / 180) })"
          r="2"
          :fill="isBest ? '#059669' : '#818cf8'"
        />
      </template>
    </svg>

    <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
      <label class="flex-1 text-xs text-slate-500">
        축 각도 = <b class="text-slate-700">{{ angle }}°</b>
        <input v-model.number="angle" type="range" min="0" max="179" step="1" class="mt-1 w-full accent-indigo-600" />
      </label>
      <div class="w-40 shrink-0 rounded-lg bg-slate-50 p-2 text-center">
        <p class="text-[11px] text-slate-400">그림자의 퍼짐 (분산)</p>
        <p class="font-mono text-lg font-bold" :class="isBest ? 'text-emerald-600' : 'text-slate-700'">{{ projVar.toFixed(2) }}</p>
        <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div class="h-full rounded-full" :class="isBest ? 'bg-emerald-500' : 'bg-indigo-400'" :style="{ width: (projVar / maxVar) * 100 + '%' }" />
        </div>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-600"
        @click="angle = bestDeg"
      >
        PCA의 답 보기
      </button>
    </div>

    <p v-if="isBest" class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
      ✅ 약 {{ bestDeg }}° — 점 구름이 가장 길게 늘어선 방향입니다. <b>PCA(주성분 분석)가 하는 일이
      정확히 이것</b>이에요: 분산(퍼짐)이 최대인 방향을 1축으로, 그다음 방향을 2축으로…
      수백 차원 임베딩을 2D로 그릴 때 "제일 덜 잃는 두 축"을 고르는 원리입니다(1부 8장 재회).
    </p>

    <!-- ② 지도의 거짓말 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 지도의 거짓말: 2D 거리 vs 실제 거리</p>
    <p class="mb-3 text-xs text-slate-400">
      수백 차원의 사내 문서 임베딩을 t-SNE풍 2D 지도로 그렸습니다(미리 준비됨). 클러스터 쌍을 눌러
      <b>지도상 거리</b>와 <b>실제(고차원) 거리</b>를 비교해 보세요.
    </p>

    <svg viewBox="0 0 300 170" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <template v-for="d in DOCS5" :key="d.id">
        <circle v-for="k in 6" :key="k" :cx="d.x + [8, -6, 2, 12, -10, 0][k - 1]" :cy="d.y + [-8, 6, 12, 2, -2, -12][k - 1]" r="3.5" :fill="d.id === 'A' ? '#6366f1' : d.id === 'B' ? '#d97706' : '#059669'" opacity="0.75" />
        <text :x="d.x" :y="d.y + 30" text-anchor="middle" font-size="11" font-weight="bold" fill="#475569">{{ d.id }} · {{ d.name }}</text>
      </template>
    </svg>

    <div class="mt-3 flex flex-wrap gap-2">
      <button
        v-for="key in ['A-B', 'B-C', 'A-C']"
        :key="key"
        type="button"
        class="rounded-lg border px-3 py-2 text-xs font-bold transition"
        :class="pickedPair === key ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
        @click="pickedPair = key"
      >
        {{ key }} 비교
      </button>
    </div>

    <div v-if="pair" class="mt-3 space-y-2">
      <div class="flex items-center gap-2 text-sm">
        <span class="w-32 shrink-0 text-xs font-semibold text-slate-500">지도상 거리</span>
        <div class="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div class="h-full rounded-full bg-slate-400" :style="{ width: (pair.map / 6) * 100 + '%' }" />
        </div>
        <span class="w-10 shrink-0 text-right font-mono text-xs text-slate-500">{{ pair.map.toFixed(1) }}</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="w-32 shrink-0 text-xs font-semibold" :class="pair.twist ? 'text-rose-600' : 'text-indigo-600'">실제(고차원) 거리</span>
        <div class="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div class="h-full rounded-full" :class="pair.twist ? 'bg-rose-500' : 'bg-indigo-500'" :style="{ width: (pair.real / 0.9) * 100 + '%' }" />
        </div>
        <span class="w-10 shrink-0 text-right font-mono text-xs" :class="pair.twist ? 'text-rose-600' : 'text-indigo-600'">{{ pair.real.toFixed(2) }}</span>
      </div>
      <p class="rounded-lg p-3 text-sm" :class="pair.twist ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-600'">
        {{ pair.twist ? '⚠️' : '✅' }} {{ pair.note }}
      </p>
    </div>
  </div>
</template>
