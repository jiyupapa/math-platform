<script setup lang="ts">
// 비유어 사전 — 시리즈가 쓰는 비유어(정본 concepts.json 의 metaphors)를 부별로 모아
// "이 과정의 비유 → 실무 용어 → 배우는 곳" 으로 보여 준다. 6부 10장·7부 10장·9부 11장에 흩어진
// 캡스톤 치환표의 통합판 — 정본에서 생성하므로 콘텐츠 수정 없이 항상 최신이다.
// 설계: docs/todo_온톨로지_260906.md §5 9번(4단계). 비유어 앵커링 규칙(루트 CLAUDE.md 철학 2)의 데이터판.
import { ref, shallowRef, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { loadConceptGraph, chapterLabel, chapterHref, type Concept, type ConceptGraph } from '@series/ui'
import { PART_STYLE, PARTS } from '../data/partStyle'

const graph = shallowRef<ConceptGraph | null>(null)
const loadError = ref(false)
onMounted(async () => {
  const g = await loadConceptGraph(import.meta.env.BASE_URL + 'concept-graph.json')
  if (g) graph.value = g
  else loadError.value = true
})

interface Row {
  term: string
  part: number
  note?: string
  concept: Concept
  /** 문서·논문 검색 열쇠말 — 첫 영문 별칭 */
  outside: string
}

const outsideTerm = (c: Concept) =>
  /[A-Za-z]/.test(c.label) ? c.label : (c.aliases.find((a) => /^[A-Za-z][A-Za-z0-9 .@\-/']*$/.test(a)) ?? '')

const rows = computed<Row[]>(() => {
  const out: Row[] = []
  for (const c of graph.value?.concepts ?? []) {
    for (const m of c.metaphors) out.push({ term: m.term, part: m.part, note: m.note, concept: c, outside: outsideTerm(c) })
  }
  return out.sort((a, b) => a.part - b.part || a.term.localeCompare(b.term, 'ko'))
})

// 찾기 — 비유어·실무어·별칭 어디에 걸려도
const q = ref('')
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '')
const matches = (r: Row) => {
  const n = norm(q.value)
  if (!n) return true
  return [r.term, r.concept.label, r.outside, ...r.concept.aliases, r.note ?? ''].some((x) => norm(x).includes(n))
}
const visible = computed(() => rows.value.filter(matches))
const byPart = computed(() =>
  PARTS.map((p) => ({ part: p, rows: visible.value.filter((r) => r.part === p) })).filter((g) => g.rows.length > 0),
)
const conceptCount = computed(() => new Set(rows.value.map((r) => r.concept.id)).size)
const partCount = computed(() => new Set(rows.value.map((r) => r.part)).size)
</script>

<template>
  <main class="mx-auto max-w-4xl px-5 py-8">
    <div class="mb-1 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">용어 대조표</h1>
        <p class="mt-1 break-keep text-sm text-slate-500">
          이 시리즈의 비유는 학습을 돕는 발판이고, 동료·문서·논문 앞에서는 실무 용어로 바꿔 말합니다.
          각 부 캡스톤에 흩어져 있던 용어 대조표를 한 곳에 모았어요. 실무 용어를 누르면
          <RouterLink to="/concepts" class="text-indigo-600 hover:underline">개념 지도</RouterLink>에서 그 개념이 열립니다.
        </p>
      </div>
      <label class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
        <span class="text-slate-500" aria-hidden="true">🔎</span>
        <input
          v-model="q"
          type="search"
          placeholder="비유 · 실무 용어 (예: 목줄, 보폭, KL)"
          class="w-56 bg-transparent text-slate-800 placeholder:text-slate-500 focus:outline-none"
          aria-label="비유 찾기"
        />
        <span v-if="q" class="text-xs text-slate-500">{{ visible.length }}개</span>
      </label>
    </div>

    <div v-if="graph" class="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
      <span>비유 <b class="text-slate-900">{{ rows.length }}</b></span>
      <span>실무 개념 <b class="text-slate-900">{{ conceptCount }}</b></span>
      <span><b class="text-slate-900">{{ partCount }}</b>개 부</span>
      <span class="text-slate-500">"이름 + 읽는 법 + 뜻"은 각 장의 새 용어 카드에 있고, 여기는 짝만 모은 표입니다.</span>
    </div>

    <p v-if="loadError" class="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
      개념 그래프를 불러오지 못했어요. <code>npm run ontology:graph</code> 로 <code>concept-graph.json</code> 을 생성한 뒤 다시 열어 주세요.
    </p>
    <p v-else-if="!graph" class="py-10 text-center text-sm text-slate-500">개념 그래프를 불러오는 중…</p>
    <p v-else-if="!byPart.length" class="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
      ‘{{ q }}’ 에 맞는 비유가 없어요.
    </p>

    <section v-for="g in byPart" :key="g.part" class="mb-6">
      <h2 class="mb-2 flex items-center gap-2 text-base font-bold text-slate-800">
        <span class="rounded px-1.5 py-0.5 text-xs font-bold" :class="PART_STYLE[g.part].chip">{{ g.part }}부</span>
        {{ PART_STYLE[g.part].name }}
        <span class="text-xs font-normal text-slate-500">{{ g.rows.length }}개</span>
      </h2>
      <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table class="w-full min-w-[36rem] text-sm">
          <thead class="bg-slate-50 text-xs text-slate-600">
            <tr>
              <th class="px-3 py-2 text-left font-semibold">이 과정의 비유</th>
              <th class="px-3 py-2 text-left font-semibold">실무 용어</th>
              <th class="px-3 py-2 text-left font-semibold">뜻</th>
              <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">배우는 곳</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in g.rows" :key="r.term + r.concept.id" data-glossary-row class="border-t border-slate-100 align-top">
              <td class="px-3 py-2 font-medium text-slate-800">
                ‘{{ r.term }}’
                <span v-if="r.note" class="block text-xs font-normal text-slate-600">{{ r.note }}</span>
              </td>
              <td class="px-3 py-2">
                <RouterLink :to="{ path: '/concepts', query: { c: r.concept.id } }" class="font-semibold text-indigo-700 hover:underline">
                  {{ r.concept.label }}
                </RouterLink>
                <span v-if="r.outside && r.outside !== r.concept.label" class="block text-xs text-slate-600">{{ r.outside }}</span>
              </td>
              <td class="px-3 py-2 break-keep text-slate-700">{{ r.concept.note }}</td>
              <td class="px-3 py-2 whitespace-nowrap">
                <a :href="chapterHref(r.concept.definedAt.part, r.concept.definedAt.slug, r.concept.definedAt.anchor)" class="text-indigo-600 hover:underline">
                  {{ chapterLabel(r.concept.definedAt.part, r.concept.definedAt.slug) }}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p v-if="graph" class="mt-2 break-keep text-center text-xs text-slate-500">
      이 표는 기준 파일 <code>scripts/ontology/concepts.json</code> 의 <code>metaphors</code> 에서 자동으로 만들어져 늘 최신이에요.
      실무 용어로 옮기기 어려운 비유는 일부러 싣지 않았어요.
    </p>
  </main>
</template>
