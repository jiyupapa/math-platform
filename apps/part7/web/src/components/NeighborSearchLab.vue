<script setup lang="ts">
// ch6 인터랙티브 — ① 전수조사의 비용: 문서 수에 따른 응답 시간 체감
//                 ② 구역 나누기(IVF식 ANN) 시뮬레이션: 빨라지는 대신 경계에서 놓친다 → 구역 수로 회복.
// 오프라인·결정적 (점 배치는 시드 고정 PRNG + 함정 점 수동 배치).
import { computed, ref } from 'vue'

// ── ① 전수조사의 비용 ──────────────────────────────────────────
// 가정: 512차원 내적을 초당 500만 번 (보통 노트북 수준)
const RATE = 5_000_000
const SIZES = [
  { n: 1_000, label: '사내 FAQ 1천 건' },
  { n: 100_000, label: '전사 문서 10만 건' },
  { n: 10_000_000, label: '그룹사 통합 1천만 건' },
  { n: 1_000_000_000, label: '웹 스케일 10억 건' },
]
const sizeIdx = ref(0)
const cost = computed(() => {
  const n = SIZES[sizeIdx.value].n
  const sec = n / RATE
  return {
    n,
    perQuery: sec < 1 ? `${(sec * 1000).toFixed(sec < 0.001 ? 1 : 0)}ms` : `${sec.toFixed(0)}초`,
    perDay: ((sec * 10_000) / 3600).toFixed(1), // 하루 질문 1만 건 → 시간
    dead: sec > 1,
  }
})

// ── ② 구역 나누기 시뮬레이션 ────────────────────────────────────
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
const CENTERS = [
  { x: 2.5, y: 3.0, color: 'var(--c-indigo-500)' },
  { x: 7.5, y: 3.0, color: 'var(--c-amber-600)' },
  { x: 5.0, y: 8.0, color: 'var(--c-emerald-600)' },
]
const POINTS = (() => {
  const rand = mulberry32(606)
  const pts: { x: number; y: number; c: number }[] = []
  CENTERS.forEach((c, ci) => {
    for (let i = 0; i < 18; i++) {
      const x = Math.min(9.6, Math.max(0.4, c.x + gaussian(rand) * 0.8))
      const y = Math.min(9.6, Math.max(0.4, c.y + gaussian(rand) * 0.8))
      pts.push({ x, y, c: ci })
    }
  })
  pts.push({ x: 4.2, y: 4.5, c: 0 }) // 함정 점: 1구역 소속이지만 경계 질문의 진짜 1등
  return pts
})()

const QUERIES = [
  { key: 'safe', label: '한가운데 질문', x: 2.6, y: 3.2 },
  { key: 'edge', label: '경계의 질문', x: 4.7, y: 5.2 },
]
const qIdx = ref(0)
const mode = ref<'full' | 'probe1' | 'probe2'>('full')
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)

const result = computed(() => {
  const q = QUERIES[qIdx.value]
  const trueBest = POINTS.reduce((m, p, i) => (dist(q, p) < dist(q, POINTS[m]) ? i : m), 0)
  if (mode.value === 'full') {
    return { searched: POINTS.map((_, i) => i), found: trueBest, trueBest, comparisons: POINTS.length, hit: true }
  }
  const nprobe = mode.value === 'probe1' ? 1 : 2
  const order = CENTERS.map((c, i) => ({ i, d: dist(q, c) })).sort((a, b) => a.d - b.d)
  const zones = order.slice(0, nprobe).map((z) => z.i)
  const searched = POINTS.map((_, i) => i).filter((i) => zones.includes(POINTS[i].c))
  const found = searched.reduce((m, i) => (dist(q, POINTS[i]) < dist(q, POINTS[m]) ? i : m), searched[0])
  return { searched, found, trueBest, comparisons: CENTERS.length + searched.length, hit: found === trueBest }
})

// SVG 변환 (0~10 → px)
const px = (v: number) => 20 + v * 26
const py = (v: number) => 275 - v * 25
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 전수조사의 비용 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 전수조사(kNN)의 청구서</p>
    <p class="mb-3 text-xs text-slate-500">
      가장 정직한 검색: 질문과 <b>모든 문서</b>의 유사도를 재서 1등을 뽑기. 문서가 늘면 무슨 일이 생길까요?
      (가정: 512차원 내적 초당 500만 번)
    </p>

    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="(s, i) in SIZES"
        :key="s.n"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="sizeIdx === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="sizeIdx = i"
      >
        {{ s.label }}
      </button>
    </div>

    <div class="grid grid-cols-3 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-xs text-slate-500">유사도 계산 횟수/질문</p>
        <p class="font-mono text-sm font-bold text-slate-700">{{ cost.n.toLocaleString() }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-xs text-slate-500">응답 시간/질문</p>
        <p class="font-mono text-sm font-bold" :class="cost.dead ? 'text-rose-700' : 'text-emerald-700'">{{ cost.perQuery }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-xs text-slate-500">하루 1만 질문 처리</p>
        <p class="font-mono text-sm font-bold" :class="cost.dead ? 'text-rose-700' : 'text-slate-700'">{{ cost.perDay }}시간</p>
      </div>
    </div>

    <p class="mt-3 rounded-lg p-3 text-sm" :class="cost.dead ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-800'">
      <template v-if="!cost.dead">
        ✅ 이 규모에서 전수조사는 <b>충분히 빠릅니다</b> — 사내 문서 수준이면 정직한 kNN이 최선일 때가 많아요.
      </template>
      <template v-else>
        ⚠️ 질문 하나에 <b>{{ cost.perQuery }}</b> — 챗봇으로는 죽은 제품입니다. 문서 수에 정비례하는
        비용(선형)이 문제예요. <b>미리 정리해 두고 일부만 보는</b> 방법이 필요합니다 → 실험 ②.
      </template>
    </p>

    <!-- ② 구역 나누기 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 구역 나누기: 빨라지는 대신 무엇을 잃나</p>
    <p class="mb-3 text-xs text-slate-500">
      문서들을 미리 구역(클러스터)으로 정리해 두고, 질문이 떨어진 구역만 조사합니다.
      질문과 탐색 범위를 바꿔 보세요 — <b>× 표시</b>는 구역의 중심입니다.
    </p>

    <div class="mb-2 flex flex-wrap gap-2">
      <button
        v-for="(q, i) in QUERIES"
        :key="q.key"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
        :class="qIdx === i ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
        @click="qIdx = i"
      >
        ⭐ {{ q.label }}
      </button>
      <span class="mx-1 hidden text-slate-500 sm:inline">|</span>
      <button
        v-for="m in [
          { key: 'full', label: '전수조사' },
          { key: 'probe1', label: '구역 1개만' },
          { key: 'probe2', label: '구역 2개' },
        ]"
        :key="m.key"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="mode === m.key ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="mode = m.key as 'full' | 'probe1' | 'probe2'"
      >
        {{ m.label }}
      </button>
    </div>

    <svg viewBox="0 0 300 290" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <!-- 문서 점 -->
      <circle
        v-for="(p, i) in POINTS"
        :key="i"
        :cx="px(p.x)"
        :cy="py(p.y)"
        r="3"
        :fill="CENTERS[p.c].color"
        :opacity="result.searched.includes(i) ? 0.9 : 0.18"
      />
      <!-- 구역 중심 -->
      <text v-for="(c, i) in CENTERS" :key="'c' + i" :x="px(c.x)" :y="py(c.y) + 4" text-anchor="middle" font-size="13" font-weight="bold" :fill="c.color">×</text>
      <!-- 진짜 1등 (놓쳤을 때만 빨간 링) -->
      <circle v-if="!result.hit" :cx="px(POINTS[result.trueBest].x)" :cy="py(POINTS[result.trueBest].y)" r="8" fill="none" stroke="var(--c-rose-600)" stroke-width="2" stroke-dasharray="3 2" />
      <!-- 찾은 문서 -->
      <circle :cx="px(POINTS[result.found].x)" :cy="py(POINTS[result.found].y)" r="7" fill="none" :stroke="result.hit ? 'var(--c-emerald-600)' : 'var(--c-amber-600)'" stroke-width="2.5" />
      <!-- 질문 -->
      <text :x="px(QUERIES[qIdx].x)" :y="py(QUERIES[qIdx].y) + 5" text-anchor="middle" font-size="15">⭐</text>
    </svg>

    <div class="mt-2 grid grid-cols-2 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-xs text-slate-500">비교 횟수</p>
        <p class="font-mono text-sm font-bold text-slate-700">{{ result.comparisons }} / {{ POINTS.length }}</p>
      </div>
      <div class="rounded-lg p-2" :class="result.hit ? 'bg-emerald-50' : 'bg-rose-50'">
        <p class="text-xs" :class="result.hit ? 'text-emerald-700' : 'text-rose-700'">진짜 1등을 찾았나?</p>
        <p class="text-sm font-bold" :class="result.hit ? 'text-emerald-700' : 'text-rose-700'">{{ result.hit ? '✓ 찾음' : '✗ 놓침!' }}</p>
      </div>
    </div>

    <p class="mt-3 rounded-lg p-3 text-sm" :class="result.hit ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'">
      <template v-if="mode === 'full'">
        ✅ 전수조사는 항상 진짜 1등을 찾습니다 — 대신 {{ POINTS.length }}번 전부 비교했죠.
      </template>
      <template v-else-if="result.hit">
        ✅ 구역 탐색으로 비교를 {{ result.comparisons }}번으로 줄이고도 진짜 1등을 찾았습니다.
        실전에선 수백만 개 중 <b>수천 개만</b> 비교하는 규모로 커져요.
      </template>
      <template v-else>
        ⚠️ 놓쳤습니다! 질문이 구역 <b>경계</b>에 있어서, 진짜 1등(빨간 점선 링)은 <b>조사하지 않은 옆
        구역</b> 소속이었어요. 이것이 근사(approximate)의 대가 — <b>"구역 2개"로 늘려 보세요.</b>
      </template>
    </p>
  </div>
</template>
