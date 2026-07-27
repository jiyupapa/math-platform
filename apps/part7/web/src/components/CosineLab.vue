<script setup lang="ts">
// ch2 인터랙티브 — ① 길이 오염: 같은 문서 3배 늘리기가 거리 순위를 망치는 현장
//                 ② 각도 놀이터: 사잇각·길이 슬라이더로 코사인의 성질 체득.
// 오프라인·결정적.
import { computed, ref } from 'vue'

// ── ① 길이 오염 ────────────────────────────────────────────────
// 단어 빈도 벡터 (x = "연차" 계열 단어 수, y = "신청" 계열 단어 수)
const Q = { x: 1, y: 1, label: '질문 "연차 신청 어떻게 하나요?"' }
const VDOCS = [
  { id: 'A', x: 2, y: 2, name: '연차 신청 안내 (짧은 판)', topic: true },
  { id: 'B', x: 6, y: 6, name: '연차 신청 안내 (자세한 판 — A의 3배 분량)', topic: true },
  { id: 'C', x: 0, y: 3, name: '각종 신청 양식 모음 (연차 아님)', topic: false },
]
const dot = (a: { x: number; y: number }, b: { x: number; y: number }) => a.x * b.x + a.y * b.y
const norm = (a: { x: number; y: number }) => Math.hypot(a.x, a.y)
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)
const cos = (a: { x: number; y: number }, b: { x: number; y: number }) => dot(a, b) / (norm(a) * norm(b))

const metric = ref<'dist' | 'cos'>('dist')
const rankedDocs = computed(() => {
  const rows = VDOCS.map((d) => ({
    ...d,
    value: metric.value === 'dist' ? dist(Q, d) : cos(Q, d),
  }))
  rows.sort((a, b) => (metric.value === 'dist' ? a.value - b.value : b.value - a.value))
  return rows
})

// SVG 좌표 변환 (원점 좌하단, 1단위 = 23px)
const O = { x: 30, y: 185 }
const px = (v: { x: number; y: number }) => ({ x: O.x + v.x * 23, y: O.y - v.y * 23 })

// ── ② 각도 놀이터 ──────────────────────────────────────────────
const theta = ref(45) // a·b 사잇각 (도)
const lenB = ref(1.5) // |b| (|a| = 1 고정)
const cosVal = computed(() => Math.cos((theta.value * Math.PI) / 180))
const dotVal = computed(() => lenB.value * cosVal.value) // |a|=1 이므로 내적 = |b|·cosθ
const cosTone = computed(() =>
  cosVal.value > 0.5 ? 'text-emerald-700' : cosVal.value >= 0 ? 'text-amber-700' : 'text-rose-700',
)
// a 는 45° 고정, b 는 45°+θ 방향 (화면 y 는 아래로 증가하므로 부호 반전)
const C2 = { x: 110, y: 116 }
const aTip = computed(() => ({
  x: C2.x + 50 * Math.cos(Math.PI / 4),
  y: C2.y - 50 * Math.sin(Math.PI / 4),
}))
const bTip = computed(() => {
  const ang = (Math.PI / 4) + (theta.value * Math.PI) / 180
  const r = 26 * lenB.value + 24 // 길이 1 → 반지름 50 (안내원과 일치)
  return { x: C2.x + r * Math.cos(ang), y: C2.y - r * Math.sin(ang) }
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 길이 오염 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 길이 오염: 자세히 쓴 죄</p>
    <p class="mb-3 text-xs text-slate-500">
      문서 B는 A와 <b>내용이 같고 3배 자세할 뿐</b>입니다(단어 빈도가 3배). 두 가지 자로 순위를 재 보세요.
    </p>

    <div class="flex flex-col gap-4 sm:flex-row">
      <svg viewBox="0 0 260 210" class="w-full max-w-[17rem] shrink-0 rounded-lg bg-slate-50 ring-1 ring-slate-100">
        <defs>
          <marker id="arr-i" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <path d="M0,0 L6,3.5 L0,7 z" fill="var(--c-indigo-600)" />
          </marker>
          <marker id="arr-e" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <path d="M0,0 L6,3.5 L0,7 z" fill="var(--c-emerald-600)" />
          </marker>
          <marker id="arr-r" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <path d="M0,0 L6,3.5 L0,7 z" fill="var(--c-rose-600)" />
          </marker>
        </defs>
        <!-- 축 -->
        <line :x1="O.x" :y1="O.y" x2="250" :y2="O.y" stroke="var(--c-slate-300)" stroke-width="1" />
        <line :x1="O.x" :y1="O.y" :x2="O.x" y2="15" stroke="var(--c-slate-300)" stroke-width="1" />
        <text x="188" :y="O.y + 14" font-size="9" fill="var(--c-slate-400)">"연차" 단어 수 →</text>
        <text :x="O.x - 24" y="12" font-size="9" fill="var(--c-slate-400)">"신청"↑</text>
        <!-- 벡터 (긴 것부터 그려 겹침 처리) -->
        <line :x1="O.x" :y1="O.y" :x2="px(VDOCS[1]).x" :y2="px(VDOCS[1]).y" stroke="var(--c-emerald-600)" stroke-width="2" stroke-dasharray="4 2" marker-end="url(#arr-e)" />
        <line :x1="O.x" :y1="O.y" :x2="px(VDOCS[0]).x" :y2="px(VDOCS[0]).y" stroke="var(--c-emerald-600)" stroke-width="2" marker-end="url(#arr-e)" />
        <line :x1="O.x" :y1="O.y" :x2="px(VDOCS[2]).x" :y2="px(VDOCS[2]).y" stroke="var(--c-rose-600)" stroke-width="2" marker-end="url(#arr-r)" />
        <line :x1="O.x" :y1="O.y" :x2="px(Q).x" :y2="px(Q).y" stroke="var(--c-indigo-600)" stroke-width="3" marker-end="url(#arr-i)" />
        <text :x="px(Q).x + 6" :y="px(Q).y + 12" font-size="10" font-weight="bold" fill="var(--c-indigo-600)">질문</text>
        <text :x="px(VDOCS[0]).x + 7" :y="px(VDOCS[0]).y + 4" font-size="10" font-weight="bold" fill="var(--c-emerald-600)">A</text>
        <text :x="px(VDOCS[1]).x + 7" :y="px(VDOCS[1]).y + 4" font-size="10" font-weight="bold" fill="var(--c-emerald-600)">B</text>
        <text :x="px(VDOCS[2]).x - 12" :y="px(VDOCS[2]).y + 2" font-size="10" font-weight="bold" fill="var(--c-rose-600)">C</text>
      </svg>

      <div class="min-w-0 flex-1">
        <div class="mb-2 flex gap-2">
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
            :class="metric === 'dist' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="metric = 'dist'"
          >
            📏 거리로 재기 (짧을수록 가까움)
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
            :class="metric === 'cos' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="metric = 'cos'"
          >
            📐 코사인으로 재기 (1에 가까울수록 비슷)
          </button>
        </div>

        <div class="space-y-1.5">
          <div
            v-for="(d, i) in rankedDocs"
            :key="d.id"
            class="flex items-center gap-2 rounded-lg p-1.5 text-sm"
            :class="i === 0 || (metric === 'cos' && d.value > 0.99) ? 'bg-amber-50' : ''"
          >
            <span class="w-8 shrink-0 text-center text-xs font-bold text-slate-500">{{ i + 1 }}위</span>
            <span class="w-6 shrink-0 text-xs font-bold" :class="d.topic ? 'text-emerald-700' : 'text-rose-700'">{{ d.id }}</span>
            <span class="min-w-0 flex-1 truncate text-xs text-slate-600">{{ d.name }}</span>
            <span class="w-14 shrink-0 text-right font-mono text-xs text-slate-500">{{ d.value.toFixed(2) }}</span>
          </div>
        </div>

        <p v-if="metric === 'dist'" class="mt-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          ⚠️ B는 A와 <b>내용이 같은데</b> 자세히 썼다는 이유만으로 딴 주제인 C보다도 뒤(꼴찌)입니다 —
          벡터가 같은 방향으로 <b>길어졌을 뿐</b>인데, 거리는 그걸 "멀다"로 채점해요. 이게 <b>길이 오염</b>입니다.
        </p>
        <p v-else class="mt-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          ✅ B가 A와 <b>동점 1.00으로 복귀</b>했습니다. 코사인은 화살표의 <b>방향(주제 비율)</b>만 보고
          길이는 완전히 무시하거든요 — 그림에서 질문·A·B가 같은 방향인 걸 확인하세요.
        </p>
      </div>
    </div>

    <!-- ② 각도 놀이터 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 각도 놀이터: 코사인의 눈금 익히기</p>
    <p class="mb-3 text-xs text-slate-500">
      사잇각과 <b>b</b>의 길이를 바꿔 보세요 — 코사인이 무엇에 반응하고 무엇을 무시하는지 드러납니다.
    </p>

    <div class="flex flex-col gap-4 sm:flex-row">
      <svg viewBox="0 0 220 220" class="w-full max-w-[15rem] shrink-0 rounded-lg bg-slate-50 ring-1 ring-slate-100">
        <circle :cx="C2.x" :cy="C2.y" r="50" fill="none" stroke="var(--c-slate-200)" stroke-dasharray="3 3" />
        <line :x1="C2.x" :y1="C2.y" :x2="aTip.x" :y2="aTip.y" stroke="var(--c-indigo-600)" stroke-width="3" marker-end="url(#arr-i)" />
        <line :x1="C2.x" :y1="C2.y" :x2="bTip.x" :y2="bTip.y" stroke="var(--c-emerald-600)" stroke-width="3" marker-end="url(#arr-e)" />
        <text :x="aTip.x + 5" :y="aTip.y - 4" font-size="11" font-weight="bold" fill="var(--c-indigo-600)">a</text>
        <text :x="bTip.x + 5" :y="bTip.y - 4" font-size="11" font-weight="bold" fill="var(--c-emerald-600)">b</text>
      </svg>

      <div class="min-w-0 flex-1 space-y-3">
        <label class="block text-xs text-slate-500">
          사잇각 θ = <b class="text-slate-700">{{ theta }}°</b>
          <input v-model.number="theta" type="range" min="0" max="180" step="1" class="mt-1 w-full accent-indigo-600" />
        </label>
        <label class="block text-xs text-slate-500">
          b의 길이 = <b class="text-slate-700">{{ lenB.toFixed(1) }}</b> (a의 길이는 1로 고정)
          <input v-model.number="lenB" type="range" min="0.5" max="3" step="0.1" class="mt-1 w-full accent-emerald-600" />
        </label>
        <div class="flex gap-2">
          <button type="button" class="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200" @click="theta = 0">0° 같은 방향</button>
          <button type="button" class="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200" @click="theta = 90">90° 직교</button>
          <button type="button" class="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200" @click="theta = 180">180° 반대</button>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="rounded-lg bg-slate-50 p-3 text-center">
            <p class="text-xs text-slate-500">코사인 유사도 cos θ</p>
            <p class="text-xl font-bold" :class="cosTone">{{ cosVal.toFixed(2) }}</p>
            <p class="text-xs text-slate-500">길이를 바꿔도 그대로!</p>
          </div>
          <div class="rounded-lg bg-slate-50 p-3 text-center">
            <p class="text-xs text-slate-500">내적 a·b = |b|·cos θ</p>
            <p class="text-xl font-bold text-slate-600">{{ dotVal.toFixed(2) }}</p>
            <p class="text-xs text-slate-500">길이에 따라 변함</p>
          </div>
        </div>

        <p class="rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
          눈금 세 개만 기억하세요 — <b>0°(같은 방향) = 1</b> · <b>90°(직교) = 0, 무관</b> ·
          <b>180°(반대) = −1</b>. 그리고 b를 아무리 늘려도 cos θ가 꿈쩍 않는 것,
          그게 실험 ①에서 B를 구해 준 성질입니다.
        </p>
      </div>
    </div>
  </div>
</template>
