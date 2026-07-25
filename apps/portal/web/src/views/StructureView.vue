<script setup lang="ts">
// 학습 구조도 — 피봇 보드 (행 = 학습 국면 위→아래, 열 = 트랙 왼→오, 노드 = 경로 단계).
// 상태는 실데이터에서: 진도(2층 useProgress) + 진단(recommend 규칙 엔진).
// 노드 클릭 → 하단 상세 패널, URL ?node= 동기화 (공유 가능한 딥링크).
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { pathSteps, totalChapters, totalHours } from '../data/curriculum'
import { loadDiagnosis, confidenceAvg } from '../data/useDiagnosis'
import { recommend } from '../data/recommend'
import { readStepProgress, type PartProgress } from '../data/useProgress'
import { columns, lanes, nodes, edges, type BoardNode } from '../data/structure'

const route = useRoute()
const router = useRouter()

// ── 데이터 결합 ──────────────────────────────────────────────────────────────
const stepByOrder = new Map(pathSteps.map((s) => [s.order, s]))
const stepProg = new Map<number, PartProgress>(
  pathSteps.map((s) => [s.order, readStepProgress(s.segments)]),
)
const diagnosis = loadDiagnosis()
const rec = diagnosis ? recommend(diagnosis.answers, confidenceAvg(diagnosis.confidence)) : null
const recOf = (order: number) => rec?.plan[order - 1] ?? null

const optionalChapters = pathSteps
  .filter((s) => s.optional)
  .reduce((n, s) => n + s.chapterCount, 0)
const optionalTracks = pathSteps.filter((s) => s.optional).length

// ── 노드 상태 (참조 구조도의 완료/현재/대기 문법) ────────────────────────────
type Tone = 'done' | 'current' | 'active' | 'review' | 'known' | 'wait' | 'optional'

const coreDone = computed(() =>
  nodes
    .filter((n) => n.lane === 'core' && n.stepOrder)
    .every((n) => (stepProg.get(n.stepOrder!)?.percent ?? 0) === 100),
)

// 다음 목적지 — 활성(필수/빠른복습, 진단 전엔 전부) 필수 단계 중 미완료 첫 단계
const currentOrder = computed(() => {
  for (const s of pathSteps) {
    if (s.optional || s.comingSoon) continue
    const status = recOf(s.order)?.status ?? null
    if (status !== null && status !== '필수' && status !== '빠른복습') continue
    if ((stepProg.get(s.order)?.percent ?? 0) < 100) return s.order
  }
  return null
})

interface NodeState {
  tone: Tone
  badge: string
}

function stateOf(n: BoardNode): NodeState {
  if (n.id === 'diagnose') {
    if (diagnosis) return { tone: 'done', badge: '진단 완료' }
    return { tone: 'current', badge: '여기서 시작' }
  }
  if (n.id === 'finish') {
    return coreDone.value ? { tone: 'done', badge: '완주 🎉' } : { tone: 'wait', badge: '대기' }
  }
  const order = n.stepOrder!
  const p = stepProg.get(order)
  const status = recOf(order)?.status ?? null
  if ((p?.percent ?? 0) === 100) return { tone: 'done', badge: '완료' }
  if (status === '건너뛰기') return { tone: 'known', badge: '이미 앎 ✓' }
  if (diagnosis && order === currentOrder.value) return { tone: 'current', badge: '다음 목적지' }
  if ((p?.completed ?? 0) > 0) return { tone: 'active', badge: `진행 중 ${p!.completed}/${p!.total}` }
  if (status === '빠른복습') return { tone: 'review', badge: '빠른 복습' }
  if (stepByOrder.get(order)?.optional) return { tone: 'optional', badge: '선택' }
  return { tone: 'wait', badge: '대기' }
}

const toneStyle: Record<Tone, { card: string; badge: string; title: string }> = {
  done: { card: 'border-slate-200 bg-slate-100', badge: 'bg-slate-200 text-slate-600', title: 'text-slate-600' },
  current: { card: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100', badge: 'bg-emerald-700 text-white', title: 'text-emerald-900' },
  active: { card: 'border-indigo-400 bg-white', badge: 'bg-indigo-100 text-indigo-700', title: 'text-slate-900' },
  review: { card: 'border-sky-400 bg-sky-50', badge: 'bg-sky-100 text-sky-700', title: 'text-slate-900' },
  known: { card: 'border-dashed border-slate-300 bg-slate-50', badge: 'bg-slate-100 text-slate-600', title: 'text-slate-500 line-through' },
  wait: { card: 'border-slate-200 bg-white', badge: 'bg-slate-100 text-slate-600', title: 'text-slate-800' },
  optional: { card: 'border-dashed border-slate-300 bg-white', badge: 'bg-slate-100 text-slate-600', title: 'text-slate-700' },
}

// 노드 카드 표시용 파생값
const nodeView = computed(() =>
  nodes.map((n) => {
    const step = n.stepOrder ? stepByOrder.get(n.stepOrder) : undefined
    const p = n.stepOrder ? stepProg.get(n.stepOrder) : undefined
    const st = stateOf(n)
    return {
      node: n,
      label: n.stepOrder ? `S${n.stepOrder}` : n.id === 'diagnose' ? 'D' : 'F',
      title: step ? step.title : n.title!,
      meta: step ? `${step.scope} · ${step.chapterCount}챕터 · ~${hours(step.minutes)}h` : n.sub!,
      state: st,
      style: toneStyle[st.tone],
      progress: p && p.completed > 0 ? p : null,
    }
  }),
)
const viewOf = (id: string) => nodeView.value.find((v) => v.node.id === id)!

// ── 보기 모드 (전체 구조도 / 핵심 흐름) ──────────────────────────────────────
const mode = ref<'full' | 'core'>('full')
const visibleLanes = computed(() => lanes.filter((l) => mode.value === 'full' || !l.optional))
// 그리드 열 = 레인 축(핵심 흐름 모드에선 core 하나). minmax(0,..) + 카드 flex-1 로 창 폭에 맞춰 줄어들어
// 가로 스크롤이 생기지 않는다. core 레인은 1.5fr 로 넓게 잡아 병렬 토대(S1·S2)가 나란히 들어간다.
const gridCols = computed(
  () =>
    `108px ${visibleLanes.value
      .map((l) => (l.id === 'core' ? 'minmax(0, 1.5fr)' : 'minmax(0, 1fr)'))
      .join(' ')}`,
)
const hiddenNodeIds = computed(() => {
  const shown = new Set(visibleLanes.value.map((l) => l.id))
  return new Set(nodes.filter((n) => !shown.has(n.lane)).map((n) => n.id))
})
const cellNodes = (laneId: string, colId: string) =>
  nodes.filter((n) => n.lane === laneId && n.col === colId)

// ── 연결선 (SVG 오버레이 — 노드 실측 좌표) ───────────────────────────────────
const boardEl = ref<HTMLElement | null>(null)
const nodeEls: Record<string, HTMLElement> = {}
function setNodeEl(id: string, el: unknown) {
  if (el instanceof HTMLElement) nodeEls[id] = el
  else delete nodeEls[id]
}
const svgSize = ref({ w: 0, h: 0 })
const paths = ref<{ d: string; kind: 'flow' | 'entry'; from: string; to: string }[]>([])

function measure() {
  const board = boardEl.value
  if (!board) return
  const base = board.getBoundingClientRect()
  const pos: Record<string, { t: number; b: number; cx: number }> = {}
  for (const [id, el] of Object.entries(nodeEls)) {
    if (hiddenNodeIds.value.has(id)) continue
    const r = el.getBoundingClientRect()
    pos[id] = { t: r.top - base.top, b: r.bottom - base.top, cx: r.left - base.left + r.width / 2 }
  }
  svgSize.value = { w: board.scrollWidth, h: board.scrollHeight }
  // 국면이 세로축 — 흐름은 위→아래. 출발 노드 아래에서 행 사이 여백(my)까지 내려가
  // 도착 열(cx)로 가로 이동한 뒤 도착 노드 위로 진입. entry(선택 분기)는 색·점선으로만 구분한다.
  paths.value = edges
    .filter((e) => pos[e.from] && pos[e.to])
    .map((e) => {
      const a = pos[e.from]
      const b = pos[e.to]
      const my = a.b + (b.t - a.b) / 2
      return { d: `M ${a.cx} ${a.b} L ${a.cx} ${my} L ${b.cx} ${my} L ${b.cx} ${b.t - 3}`, kind: e.kind, from: e.from, to: e.to }
    })
}

async function remeasure() {
  await nextTick()
  measure()
}
onMounted(() => {
  void remeasure()
  window.addEventListener('resize', measure)
})
onUnmounted(() => window.removeEventListener('resize', measure))
watch(mode, () => void remeasure())

// ── 선택 + URL 동기화 (?node=step3) ──────────────────────────────────────────
const selected = ref<string | null>(null)
// 선택 노드에 연결된 간선을 강조(인디고) + 나머지는 흐리게. active 를 뒤로 정렬해 SVG 상 위에 그린다.
const renderPaths = computed(() => {
  const sel = selected.value
  return paths.value
    .map((p) => {
      const on = !!sel && (p.from === sel || p.to === sel)
      return { ...p, active: on, dim: !!sel && !on }
    })
    .sort((a, b) => Number(a.active) - Number(b.active))
})
onMounted(() => {
  const q = route.query.node
  if (typeof q === 'string' && nodes.some((n) => n.id === q)) selected.value = q
})
watch(selected, (id) => {
  // URL 동기화만 — 상세 패널로 스크롤 포커스는 옮기지 않는다(선택 시 지도에서 시선 유지).
  void router.replace({ query: id ? { node: id } : {} })
})
const detail = computed(() => {
  if (!selected.value) return null
  const v = viewOf(selected.value)
  const step = v.node.stepOrder ? stepByOrder.get(v.node.stepOrder) : undefined
  return {
    ...v,
    step,
    href: step ? `/part${step.part}/` : null,
    note: v.node.stepOrder ? recOf(v.node.stepOrder)?.note : undefined,
  }
})

const hoursOf = (m: number) => Math.round((m / 60) * 10) / 10
function hours(m: number) {
  return hoursOf(m)
}

const legend: { tone: Tone; label: string }[] = [
  { tone: 'done', label: '완료' },
  { tone: 'current', label: '다음 목적지' },
  { tone: 'active', label: '진행 중' },
  { tone: 'review', label: '빠른 복습(진단)' },
  { tone: 'known', label: '이미 앎(진단)' },
  { tone: 'wait', label: '대기' },
  { tone: 'optional', label: '선택 분기' },
]
</script>

<template>
  <main class="mx-auto max-w-7xl px-5 py-8">
    <!-- 머리말 + 통계 스트립 -->
    <div class="mb-1 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">학습 구조도</h1>
        <p class="mt-1 text-sm text-slate-500">
          세로는 학습 국면(위→아래), 가로는 트랙 — 필수 경로는 실선, 선택 분기는 점선으로 진입합니다.
          노드를 누르면 아래에 상세가 열립니다.
        </p>
      </div>
      <div class="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 text-sm">
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 font-medium"
          :class="mode === 'core' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'"
          @click="mode = 'core'"
        >
          핵심 흐름
        </button>
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 font-medium"
          :class="mode === 'full' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'"
          @click="mode = 'full'"
        >
          전체 구조도
        </button>
      </div>
    </div>

    <div class="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
      <span><b class="text-slate-900">{{ nodes.length }}</b> 단계 노드</span>
      <span><b class="text-slate-900">{{ columns.length }}</b> 학습 국면</span>
      <span>필수 <b class="text-slate-900">{{ totalChapters }}</b>챕터 ≈ <b class="text-slate-900">{{ totalHours }}</b>시간</span>
      <span>선택 분기 {{ optionalTracks }}트랙 <b class="text-slate-900">{{ optionalChapters }}</b>챕터</span>
      <span v-if="rec" class="font-medium text-indigo-700">
        당신의 경로: {{ rec.activeChapters }}챕터 · 약 {{ hoursOf(rec.activeMinutes) }}시간
      </span>
      <RouterLink v-else to="/diagnose" class="font-medium text-indigo-600 hover:underline">
        진단하면 이 지도가 당신의 경로로 다시 칠해집니다 →
      </RouterLink>
    </div>

    <!-- 범례 -->
    <div class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
      <span v-for="l in legend" :key="l.tone" class="inline-flex items-center gap-1.5">
        <span class="inline-block h-3 w-3 rounded border" :class="toneStyle[l.tone].card" />
        {{ l.label }}
      </span>
      <span class="inline-flex items-center gap-1.5">
        <svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" stroke="#94a3b8" stroke-width="1.5" /></svg>
        필수 흐름
      </span>
      <span class="inline-flex items-center gap-1.5">
        <svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" stroke="#14b8a6" stroke-width="1.5" stroke-dasharray="4 3" /></svg>
        선택 진입
      </span>
    </div>

    <!-- 보드 -->
    <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div ref="boardEl" class="relative p-4">
        <svg
          class="pointer-events-none absolute left-0 top-0"
          :width="svgSize.w"
          :height="svgSize.h"
          aria-hidden="true"
        >
          <defs>
            <marker id="arrow-flow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0.8 L7.2,4 L0,7.2 Z" fill="#94a3b8" />
            </marker>
            <marker id="arrow-entry" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0.8 L7.2,4 L0,7.2 Z" fill="#14b8a6" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0.8 L7.2,4 L0,7.2 Z" fill="#6366f1" />
            </marker>
          </defs>
          <path
            v-for="p in renderPaths"
            :key="p.from + '-' + p.to"
            :d="p.d"
            fill="none"
            :stroke="p.active ? '#6366f1' : p.kind === 'flow' ? '#94a3b8' : '#14b8a6'"
            :stroke-width="p.active ? 2.5 : 1.5"
            :stroke-dasharray="p.kind === 'entry' ? '5 4' : undefined"
            :marker-end="`url(#arrow-${p.active ? 'active' : p.kind})`"
            :opacity="p.dim ? 0.25 : p.kind === 'entry' && !p.active ? 0.85 : 1"
          />
        </svg>

        <div class="grid gap-0" :style="{ gridTemplateColumns: gridCols }">
          <!-- 헤더 행: 모서리 + 레인(열) 헤더 -->
          <div class="border-b border-slate-200 pb-2 text-[11px] font-medium text-slate-500">
            국면 ↓ · 레인 →
          </div>
          <div
            v-for="lane in visibleLanes"
            :key="lane.id"
            class="border-b border-l border-slate-100 px-2 pb-2"
          >
            <p class="text-center text-sm font-bold text-slate-800">{{ lane.title }}</p>
          </div>

          <!-- 국면(행) — 왼쪽 라벨 + 레인별 셀 -->
          <template v-for="c in columns" :key="c.id">
            <div class="flex flex-col border-b border-slate-100 pt-3 pr-2">
              <p class="text-sm font-bold text-slate-700">{{ c.title }}</p>
              <p class="text-[11px] leading-tight text-slate-500">{{ c.sub }}</p>
            </div>
            <div
              v-for="lane in visibleLanes"
              :key="c.id + lane.id"
              class="flex min-h-[120px] flex-wrap content-start justify-center gap-2 border-b border-l border-slate-100 p-2"
            >
              <button
                v-for="n in cellNodes(lane.id, c.id)"
                :key="n.id"
                :ref="(el) => setNodeEl(n.id, el)"
                type="button"
                class="min-w-0 max-w-[132px] flex-1 rounded-lg border px-2 py-1.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                :class="[viewOf(n.id).style.card, selected === n.id ? 'outline outline-2 outline-indigo-500' : '']"
                @click="selected = selected === n.id ? null : n.id"
              >
                <div class="flex items-center justify-between gap-1">
                  <span class="font-mono text-[10px] font-bold text-slate-500">{{ viewOf(n.id).label }}</span>
                  <span class="rounded px-1.5 py-0.5 text-[10px] font-semibold" :class="viewOf(n.id).style.badge">
                    {{ viewOf(n.id).state.badge }}
                  </span>
                </div>
                <p class="mt-0.5 text-[13px] font-bold leading-tight" :class="viewOf(n.id).style.title">
                  {{ viewOf(n.id).title }}
                </p>
                <p class="mt-0.5 truncate text-[11px] text-slate-500">{{ viewOf(n.id).meta }}</p>
                <div v-if="viewOf(n.id).progress" class="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    class="h-full rounded-full bg-indigo-500"
                    :style="{ width: viewOf(n.id).progress!.percent + '%' }"
                  />
                </div>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 상세 패널 -->
    <section v-if="detail" class="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="mb-1 flex items-center gap-2">
            <span class="rounded px-1.5 py-0.5 text-[11px] font-semibold" :class="detail.style.badge">
              {{ detail.state.badge }}
            </span>
            <span v-if="detail.step" class="text-xs text-slate-500">
              {{ detail.step.role }} · {{ detail.step.scope }}
            </span>
          </div>
          <h2 class="text-lg font-bold text-slate-900">{{ detail.title }}</h2>
          <p class="mt-1 text-sm text-slate-600">
            {{ detail.step ? detail.step.gain : detail.node.sub }}
          </p>
        </div>
        <div class="text-right">
          <a
            v-if="detail.href"
            :href="detail.href"
            class="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            이 단계 학습하러 가기 →
          </a>
          <RouterLink
            v-else-if="detail.node.id === 'diagnose'"
            to="/diagnose"
            class="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            진단하러 가기 →
          </RouterLink>
        </div>
      </div>

      <div v-if="detail.step" class="mt-3 grid gap-3 sm:grid-cols-3">
        <div class="rounded-xl bg-slate-50 p-3">
          <p class="text-xs text-slate-500">분량</p>
          <p class="mt-0.5 text-sm font-semibold text-slate-800">
            {{ detail.step.chapterCount }}챕터 · 약 {{ hoursOf(detail.step.minutes) }}시간
          </p>
        </div>
        <div class="rounded-xl bg-slate-50 p-3">
          <p class="text-xs text-slate-500">진도</p>
          <p class="mt-0.5 text-sm font-semibold text-slate-800">
            {{ detail.progress ? `${detail.progress.completed}/${detail.progress.total} (${detail.progress.percent}%)` : '아직 시작 전' }}
          </p>
        </div>
        <div class="rounded-xl bg-slate-50 p-3">
          <p class="text-xs text-slate-500">진입 조건</p>
          <p class="mt-0.5 text-sm font-semibold text-slate-800">
            {{ detail.node.prereqText ?? '필수 경로 — 앞 단계 순서대로' }}
          </p>
        </div>
      </div>
      <p v-if="detail.note" class="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
        💡 {{ detail.note }}
      </p>
    </section>
    <p v-else class="mt-4 text-center text-sm text-slate-500">
      노드를 누르면 단계 상세(분량 · 진도 · 진입 조건)가 여기 열립니다.
    </p>
  </main>
</template>
