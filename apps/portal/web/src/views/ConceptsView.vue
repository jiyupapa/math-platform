<script setup lang="ts">
// 개념 지도 — 시리즈 온톨로지(concept-graph.json)의 개념을 부별 행으로 펼치고, 선택한 개념의
// 선수 사슬(인디고 실선, 추이적)과 이 개념을 쓰는 다음 개념(틸 점선, 직접)을 그린다.
// 진도(2층 useProgress)를 겹쳐 "아는 개념(정의처 장 완료)" 과 "지금 배울 수 있는 개념(선수 전부 앎)" 을 표시한다.
// 설계: docs/todo_온톨로지_260906.md §5 5번. StructureView 와 같은 SVG 오버레이·?c= 딥링크 문법.
// ⚠️ 진도는 localStorage 라 조립 배포본(같은 origin)에서만 각 부 값이 보인다 — StructureView 와 같은 제약.
import { ref, shallowRef, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  loadConceptGraph,
  chapterLabel,
  chapterTitle,
  chapterHref,
  dependentsOf,
  prereqClosure,
  locKey,
  type Concept,
  type ConceptGraph,
} from '@series/ui'
import { PART_META, readCompletedSlugs } from '../data/useProgress'
import { PART_STYLE, PARTS } from '../data/partStyle'
import { loadDiagnosis } from '../data/useDiagnosis'
import { conceptResults } from '../data/diagnosisConcepts'

const route = useRoute()
const router = useRouter()

// 진단에서 헷갈린 개념(3단계) — 문항의 concepts 태그에서 파생. 지도에 ⚠ 표시.
const diagnosis = loadDiagnosis()
const missedIds = new Set<string>(diagnosis ? conceptResults(diagnosis.answers).missed : [])

// ── 데이터 ──────────────────────────────────────────────────────────────────
const graph = shallowRef<ConceptGraph | null>(null)
const loadError = ref(false)
const concepts = computed(() => graph.value?.concepts ?? [])
const byId = computed(() => new Map(concepts.value.map((c) => [c.id, c])))
const edgeCount = computed(() => concepts.value.reduce((n, c) => n + c.prereq.length, 0))
const reuseCount = computed(() => concepts.value.reduce((n, c) => n + c.usedAt.length, 0))
const metaphorCount = computed(() => concepts.value.reduce((n, c) => n + c.metaphors.length, 0))

const KIND_LABEL: Record<Concept['kind'], string> = { math: '수학', ai: 'AI', tool: '도구', metric: '지표' }

// ── 진도 겹치기 ─────────────────────────────────────────────────────────────
const completed = new Set<string>()
for (const meta of PART_META) for (const s of readCompletedSlugs(meta)) completed.add(locKey(meta.part, s))
const hasProgress = completed.size > 0
const isMastered = (c: Concept) => completed.has(locKey(c.definedAt.part, c.definedAt.slug))
const isReady = (c: Concept) =>
  hasProgress &&
  !isMastered(c) &&
  c.prereq.every((id) => {
    const p = byId.value.get(id)
    return !p || isMastered(p)
  })
const masteredCount = computed(() => concepts.value.filter(isMastered).length)
const readyCount = computed(() => concepts.value.filter(isReady).length)

// ── 행(부) × 노드 — 정의처 장 순서 ─────────────────────────────────────────
const chapterOrder = (slug: string) => (slug === 'sample' ? 0 : Number(slug.replace(/^ch/, '')) || 99)
const rowsOf = (part: number) =>
  concepts.value
    .filter((c) => c.definedAt.part === part)
    .sort((a, b) => chapterOrder(a.definedAt.slug) - chapterOrder(b.definedAt.slug))

// ── 찾기(일치하지 않는 노드는 흐리게) ───────────────────────────────────────
const q = ref('')
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '')
function matchesQ(c: Concept): boolean {
  const n = norm(q.value)
  if (!n) return true
  return [c.label, ...c.aliases, ...c.metaphors.map((m) => m.term)].some((x) => norm(x).includes(n))
}
const matchCount = computed(() => concepts.value.filter(matchesQ).length)

// ── 선택 + 관계 ─────────────────────────────────────────────────────────────
const selected = ref<string | null>(null)
const selectedConcept = computed(() => (selected.value ? (byId.value.get(selected.value) ?? null) : null))
const chain = computed(() => {
  const g = graph.value
  const c = selectedConcept.value
  return g && c ? prereqClosure(g, c.id) : []
})
const chainIds = computed(() => new Set(chain.value.map((c) => c.id)))
const dependents = computed(() => {
  const g = graph.value
  const c = selectedConcept.value
  return g && c ? dependentsOf(g, c.id) : []
})
const dependentIds = computed(() => new Set(dependents.value.map((c) => c.id)))
const directPrereqs = computed(() =>
  (selectedConcept.value?.prereq ?? []).map((id) => byId.value.get(id)).filter((c): c is Concept => !!c),
)

function select(id: string) {
  selected.value = selected.value === id ? null : id
}

// 노드 모양: 부 색(연한 칠) → 앎(부 색으로 꽉 채움+✓) → 지금 배울 수 있음(ring) → 선택/사슬/다음(outline) → 무관·불일치(흐림)
// 세 상태는 "칠 없음 / ring / 꽉 찬 칠"로 갈린다 — 같은 색의 진하기 차이만으로는 앎과 배울 수 있음이 구별되지 않았다.
function nodeClass(c: Concept): string {
  const st = PART_STYLE[c.definedAt.part]
  const cls = [isMastered(c) ? st.done : st.node]
  // ring 색은 하나만 — 진단에서 헷갈린 개념(amber)이 "지금 배울 수 있음"(부 색)보다 우선.
  // 6부는 부 색도 amber 라 ring 만으로는 둘이 같아 보인다 → 헷갈린 개념은 ⚠ 접두(아래 템플릿)가 뜻을 나른다.
  if (missedIds.has(c.id)) cls.push('ring-2', 'ring-amber-600')
  else if (isReady(c)) cls.push('ring-2', st.ring)
  // outline 은 2px 띄운다 — 꽉 채운 '앎' 노드(4부 indigo·7부 teal)와 같은 색이라 붙여 그리면 안 보인다
  const sel = selected.value
  if (sel === c.id) cls.push('outline outline-2 outline-offset-2 outline-indigo-600')
  else if (sel && chainIds.value.has(c.id)) cls.push('outline outline-2 outline-offset-2 outline-indigo-400')
  else if (sel && dependentIds.value.has(c.id)) cls.push('outline outline-2 outline-offset-2 outline-teal-500')
  const related = !sel || sel === c.id || chainIds.value.has(c.id) || dependentIds.value.has(c.id)
  if (!matchesQ(c) || !related) cls.push('opacity-35')
  return cls.join(' ')
}

// ── 연결선 (SVG 오버레이 — 노드 실측 좌표, StructureView 와 같은 방식) ──────
const boardEl = ref<HTMLElement | null>(null)
const nodeEls: Record<string, HTMLElement> = {}
function setNodeEl(id: string, el: unknown) {
  if (el instanceof HTMLElement) nodeEls[id] = el
  else delete nodeEls[id]
}
interface Pos {
  t: number
  b: number
  cx: number
  cy: number
}
const pos = shallowRef<Record<string, Pos>>({})
const svgSize = ref({ w: 0, h: 0 })
function measure() {
  const board = boardEl.value
  if (!board) return
  const base = board.getBoundingClientRect()
  const p: Record<string, Pos> = {}
  for (const [id, el] of Object.entries(nodeEls)) {
    const r = el.getBoundingClientRect()
    p[id] = { t: r.top - base.top, b: r.bottom - base.top, cx: r.left - base.left + r.width / 2, cy: r.top - base.top + r.height / 2 }
  }
  pos.value = p
  svgSize.value = { w: board.scrollWidth, h: board.scrollHeight }
}
async function remeasure() {
  await nextTick()
  measure()
}
function curve(a: Pos, b: Pos): string {
  if (Math.abs(a.cy - b.cy) < 8) {
    // 같은 행 — 위로 살짝 볼록한 호. 3차 베지어의 꼭대기는 제어점 높이의 3/4 지점이므로
    // 맨 윗줄(1부)에서는 보드 위 여백(pt-7) 안에 들어오도록 높이를 깎는다 — 안 깎으면 호가 보드 위 경계에 잘린다.
    const headroom = (Math.min(a.t, b.t) - 4) / 0.75
    const lift = Math.max(6, Math.min(40, 14 + Math.abs(a.cx - b.cx) / 8, headroom))
    return `M ${a.cx} ${a.t} C ${a.cx} ${a.t - lift}, ${b.cx} ${b.t - lift}, ${b.cx} ${b.t}`
  }
  const down = a.cy < b.cy
  const y1 = down ? a.b : a.t
  const y2 = down ? b.t : b.b
  const my = (y1 + y2) / 2
  return `M ${a.cx} ${y1} C ${a.cx} ${my}, ${b.cx} ${my}, ${b.cx} ${y2}`
}
const paths = computed(() => {
  const sel = selectedConcept.value
  const P = pos.value
  if (!sel) return []
  const out: { d: string; kind: 'pre' | 'dep'; key: string }[] = []
  // 선수 사슬 — 사슬 안 모든 개념의 prereq 간선(추이적). 화살표는 선수 → 개념 방향.
  for (const c of [sel, ...chain.value]) {
    for (const pid of c.prereq) {
      const a = P[pid]
      const b = P[c.id]
      if (a && b) out.push({ d: curve(a, b), kind: 'pre', key: `${pid}>${c.id}` })
    }
  }
  // 이 개념을 쓰는 다음 개념(직접)
  for (const d of dependents.value) {
    const a = P[sel.id]
    const b = P[d.id]
    if (a && b) out.push({ d: curve(a, b), kind: 'dep', key: `${sel.id}>${d.id}` })
  }
  return out
})

onMounted(async () => {
  const g = await loadConceptGraph(import.meta.env.BASE_URL + 'concept-graph.json')
  if (g) graph.value = g
  else loadError.value = true
  const c = route.query.c
  if (typeof c === 'string' && g?.concepts.some((x) => x.id === c)) selected.value = c
  await remeasure()
  window.addEventListener('resize', measure)
})
onUnmounted(() => window.removeEventListener('resize', measure))
watch(selected, (id) => {
  // URL 동기화만 — 지도에서 시선이 안 튀게 스크롤은 옮기지 않는다 (StructureView 와 동일)
  void router.replace({ query: id ? { c: id } : {} })
  void remeasure()
})

const outsideTerm = (c: Concept) =>
  /[A-Za-z]/.test(c.label) ? '' : (c.aliases.find((a) => /^[A-Za-z][A-Za-z0-9 .@\-/']*$/.test(a)) ?? '')
</script>

<template>
  <main class="mx-auto max-w-7xl px-5 py-8">
    <div class="mb-1 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">개념 지도</h1>
        <p class="mt-1 text-sm text-slate-500">
          시리즈의 개념을 부별로 펼쳤습니다. 개념을 누르면 <b class="text-indigo-700">먼저 알아야 하는 개념</b>과
          <b class="text-teal-700">그 개념을 쓰는 다음 개념</b>이 이어지고, 아래에 배우는 곳·다시 쓰이는 곳이 열립니다.
          단계 순서는 <RouterLink to="/map" class="text-indigo-600 hover:underline">학습 구조도</RouterLink>에서 볼 수 있습니다.
        </p>
      </div>
      <label class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
        <span class="text-slate-500" aria-hidden="true">🔎</span>
        <input
          v-model="q"
          type="search"
          placeholder="개념 · 다른 이름 · 비유 (예: 목줄, KL, 보폭)"
          class="w-56 bg-transparent text-slate-800 placeholder:text-slate-500 focus:outline-none"
          aria-label="개념 찾기"
        />
        <span v-if="q" class="text-xs text-slate-500">{{ matchCount }}개</span>
      </label>
    </div>

    <div v-if="graph" class="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
      <span><b class="text-slate-900">{{ concepts.length }}</b> 개념</span>
      <span>선수 관계 <b class="text-slate-900">{{ edgeCount }}</b></span>
      <span>다시 쓰이는 곳 <b class="text-slate-900">{{ reuseCount }}</b></span>
      <span>비유 <b class="text-slate-900">{{ metaphorCount }}</b></span>
      <span v-if="hasProgress" class="font-medium text-indigo-700">
        아는 개념 {{ masteredCount }} · 지금 배울 수 있는 개념 {{ readyCount }}
      </span>
      <span v-else class="text-slate-500">각 부의 장을 완료하면 아는 개념이 여기 칠해집니다.</span>
      <span v-if="missedIds.size" class="font-medium text-amber-700">진단에서 헷갈린 개념 {{ missedIds.size }}</span>
    </div>

    <!-- 범례 -->
    <div v-if="graph" class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
      <span class="inline-flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded border border-sky-200 bg-sky-50" />부 색(처음 배우는 부)</span>
      <span class="inline-flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded border border-sky-700 bg-sky-700" />✓ 아는 개념 (배우는 장을 마침)</span>
      <span class="inline-flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded border border-sky-200 bg-sky-50 ring-2 ring-sky-600" />지금 배울 수 있음 (먼저 알아야 할 개념을 모두 앎)</span>
      <span v-if="missedIds.size" class="inline-flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded border border-sky-200 bg-sky-50 ring-2 ring-amber-600" />⚠ 진단에서 헷갈린 개념</span>
      <span class="inline-flex items-center gap-1.5">
        <svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" stroke="var(--c-indigo-500)" stroke-width="1.5" /></svg>
        먼저 알아야 하는 개념
      </span>
      <span class="inline-flex items-center gap-1.5">
        <svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" stroke="var(--c-teal-500)" stroke-width="1.5" stroke-dasharray="4 3" /></svg>
        이 개념을 쓰는 다음 개념
      </span>
    </div>

    <p v-if="loadError" class="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
      개념 그래프를 불러오지 못했어요. <code>npm run ontology:graph</code> 로 <code>concept-graph.json</code> 을 생성한 뒤 다시 열어 주세요.
    </p>

    <!-- 보드 -->
    <div v-else class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <!-- pt-7: 맨 윗줄 노드끼리 잇는 호가 위로 볼록(최대 30px)하므로 그만큼 여백 — 줄이면 curve() 가 호를 납작하게 깎는다 -->
      <div ref="boardEl" class="relative px-4 pb-4 pt-7">
        <svg
          class="pointer-events-none absolute top-0 left-0"
          :width="svgSize.w"
          :height="svgSize.h"
          aria-hidden="true"
        >
          <defs>
            <marker id="c-arrow-pre" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0.8 L7.2,4 L0,7.2 Z" fill="var(--c-indigo-500)" />
            </marker>
            <marker id="c-arrow-dep" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0.8 L7.2,4 L0,7.2 Z" fill="var(--c-teal-500)" />
            </marker>
          </defs>
          <path
            v-for="p in paths"
            :key="p.key"
            :d="p.d"
            fill="none"
            :stroke="p.kind === 'pre' ? 'var(--c-indigo-500)' : 'var(--c-teal-500)'"
            :stroke-width="p.kind === 'pre' ? 2 : 1.5"
            :stroke-dasharray="p.kind === 'dep' ? '5 4' : undefined"
            :marker-end="`url(#c-arrow-${p.kind})`"
            opacity="0.9"
          />
        </svg>

        <div v-if="!graph" class="py-10 text-center text-sm text-slate-500">개념 그래프를 불러오는 중…</div>
        <div v-else class="grid gap-y-1" style="grid-template-columns: 128px minmax(0, 1fr)">
          <template v-for="p in PARTS" :key="p">
            <div class="border-t border-slate-100 pt-2.5 pr-2">
              <span class="inline-block rounded px-1.5 py-0.5 text-xs font-bold" :class="PART_STYLE[p].chip">{{ p }}부</span>
              <p class="mt-0.5 text-xs leading-tight text-slate-600">{{ PART_STYLE[p].name }}</p>
            </div>
            <div class="flex flex-wrap content-start gap-1.5 border-t border-slate-100 py-2">
              <button
                v-for="c in rowsOf(p)"
                :key="c.id"
                :ref="(el) => setNodeEl(c.id, el)"
                type="button"
                data-concept-node
                class="rounded-lg border px-2.5 py-1 text-left text-[13px] font-medium leading-tight shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                :class="nodeClass(c)"
                :title="`${c.note} (${chapterLabel(c.definedAt.part, c.definedAt.slug)})`"
                :aria-pressed="selected === c.id"
                @click="select(c.id)"
              >
                <span v-if="missedIds.has(c.id)" aria-hidden="true">⚠ </span><span v-if="isMastered(c)" aria-hidden="true">✓ </span>{{ c.label }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 상세 패널 -->
    <section v-if="selectedConcept && graph" class="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="mb-1 flex flex-wrap items-center gap-2 text-xs">
            <span class="rounded px-1.5 py-0.5 font-semibold" :class="PART_STYLE[selectedConcept.definedAt.part].chip">
              {{ selectedConcept.definedAt.part }}부 {{ PART_STYLE[selectedConcept.definedAt.part].name }}
            </span>
            <span class="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">{{ KIND_LABEL[selectedConcept.kind] }}</span>
            <span v-if="isMastered(selectedConcept)" class="rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700">✓ 아는 개념</span>
            <span v-else-if="isReady(selectedConcept)" class="rounded bg-indigo-50 px-1.5 py-0.5 font-semibold text-indigo-700">지금 배울 수 있어요</span>
            <span v-if="missedIds.has(selectedConcept.id)" class="rounded bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-700">진단에서 헷갈린 개념 · 다시 볼 것</span>
          </div>
          <h2 class="text-lg font-bold text-slate-900">{{ selectedConcept.label }}</h2>
          <p v-if="selectedConcept.aliases.length" class="mt-0.5 text-xs text-slate-500">{{ selectedConcept.aliases.join(' · ') }}</p>
          <p class="mt-1 text-sm text-slate-700">{{ selectedConcept.note }}</p>
          <p v-if="selectedConcept.metaphors.length || outsideTerm(selectedConcept)" class="mt-1 text-sm text-slate-600">
            <template v-if="selectedConcept.metaphors.length">
              이 시리즈에서는
              <template v-for="(m, i) in selectedConcept.metaphors" :key="m.term + m.part">
                <span v-if="i"> · </span>
                <b class="text-slate-800">‘{{ m.term }}’</b>({{ m.part }}부<template v-if="m.note">, {{ m.note }}</template>)
              </template>
            </template>
            <template v-if="selectedConcept.metaphors.length && outsideTerm(selectedConcept)"> · </template>
            <template v-if="outsideTerm(selectedConcept)">밖에서는 <b class="text-slate-800">{{ outsideTerm(selectedConcept) }}</b></template>
          </p>
        </div>
        <div class="text-right">
          <a
            :href="chapterHref(selectedConcept.definedAt.part, selectedConcept.definedAt.slug, selectedConcept.definedAt.anchor)"
            class="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            배우는 곳: {{ chapterLabel(selectedConcept.definedAt.part, selectedConcept.definedAt.slug) }} →
          </a>
          <p class="mt-1 max-w-[16rem] truncate text-xs text-slate-500">
            {{ chapterTitle(graph, selectedConcept.definedAt.part, selectedConcept.definedAt.slug) }}
          </p>
        </div>
      </div>

      <div class="mt-3 grid gap-3 md:grid-cols-3">
        <div class="rounded-xl bg-slate-50 p-3">
          <p class="text-xs font-semibold text-slate-600">먼저 알아야 {{ directPrereqs.length ? `(${directPrereqs.length})` : '' }}</p>
          <p v-if="!directPrereqs.length" class="mt-1 text-sm text-slate-600">없음 (출발점 개념)</p>
          <ul v-else class="mt-1 space-y-0.5 text-sm">
            <li v-for="p in directPrereqs" :key="p.id">
              <button type="button" class="text-left text-indigo-700 hover:underline" @click="select(p.id)">
                <span v-if="isMastered(p)" aria-hidden="true">✓ </span>{{ p.label }}
              </button>
              <span class="text-xs text-slate-600">&nbsp;{{ chapterLabel(p.definedAt.part, p.definedAt.slug) }}</span>
            </li>
          </ul>
          <p v-if="chain.length > directPrereqs.length" class="mt-2 text-xs text-slate-600">
            출발점까지 거슬러 올라가면 {{ chain.length }}개, 먼 것부터:
            <template v-for="(c, i) in chain" :key="c.id"><span v-if="i"> → </span><button type="button" class="text-indigo-700 hover:underline" @click="select(c.id)">{{ c.label }}</button></template>
          </p>
        </div>
        <div class="rounded-xl bg-slate-50 p-3">
          <p class="text-xs font-semibold text-slate-600">이 개념을 쓰는 다음 개념 {{ dependents.length ? `(${dependents.length})` : '' }}</p>
          <p v-if="!dependents.length" class="mt-1 text-sm text-slate-600">없음 (이 갈래의 끝)</p>
          <ul v-else class="mt-1 space-y-0.5 text-sm">
            <li v-for="d in dependents" :key="d.id">
              <button type="button" class="text-left text-teal-700 hover:underline" @click="select(d.id)">
                <span v-if="isMastered(d)" aria-hidden="true">✓ </span>{{ d.label }}
              </button>
              <span class="text-xs text-slate-600">&nbsp;{{ chapterLabel(d.definedAt.part, d.definedAt.slug) }}</span>
            </li>
          </ul>
        </div>
        <div class="rounded-xl bg-slate-50 p-3">
          <p class="text-xs font-semibold text-slate-600">다시 쓰이는 곳 {{ selectedConcept.usedAt.length ? `(${selectedConcept.usedAt.length})` : '' }}</p>
          <p v-if="!selectedConcept.usedAt.length" class="mt-1 text-sm text-slate-600">아직 다른 장에서 다시 쓰이지 않아요</p>
          <ul v-else class="mt-1 space-y-0.5 text-sm">
            <li v-for="u in selectedConcept.usedAt" :key="u.part + u.slug">
              <a :href="chapterHref(u.part, u.slug, u.anchor)" class="font-medium text-indigo-700 hover:underline">{{ chapterLabel(u.part, u.slug) }}</a>
              <span v-if="u.how" class="text-slate-700"> ({{ u.how }})</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
    <p v-else-if="graph" class="mt-4 text-center text-sm text-slate-500">
      개념을 누르면 배우는 곳 · 먼저 알아야 하는 개념 · 다시 쓰이는 곳이 여기 열립니다. 주소의 <code>?c=</code> 로 공유할 수 있어요.
    </p>
  </main>
</template>
