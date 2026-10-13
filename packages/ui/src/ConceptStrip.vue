<script setup lang="ts">
// 이 장의 개념 연결 — 장 상단 띠 (온톨로지 2단계). 설계: docs/todo_온톨로지_260906.md §5 4번
//   개념 그래프(concept-graph.json)에서 현재 장의 ① 처음 배우는 개념 ② 먼저 알아 둘 선수 개념(다른 장)
//   ③ 이 장이 다시 쓰는 수학 ④ 다음에 다시 만나는 곳 을 뽑아 보여 준다.
//   수기 PartLink 와 달리 정본에서 생성되므로 드리프트가 없다. 챕터 파일 수정 0 —
//   각 부 App.vue 가 <RouterView> 위에 한 번 놓고, 챕터 라우트(/ch/<slug>)에서만 렌더된다.
//   부 번호는 partNumberKey(전 12부 주입), 그래프 URL 은 conceptGraphKey(기본 <base>concept-graph.json).
//   같은 부 링크는 RouterLink(SPA), 다른 부는 조립 배포본 경로(/partN/…) — dev 단독 실행에선 PartLink 처럼 평문.
import { computed, inject, onMounted, shallowRef } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { conceptGraphKey, partNumberKey } from './injection'
import {
  chapterHref,
  chapterLabel,
  conceptsDefinedAt,
  conceptsReusedAt,
  loadConceptGraph,
  type Concept,
  type ConceptGraph,
  type ConceptLocation,
} from './conceptGraph'

// vite/client 타입 의존 없이 안전하게 접근 (PartLink·SearchPalette 와 같은 패턴)
const env = (import.meta as { env?: Record<string, unknown> }).env
const envBase = (env?.BASE_URL as string | undefined) ?? '/'
const isDev = (env?.DEV as boolean | undefined) ?? false

const graphUrl = inject(conceptGraphKey, envBase + 'concept-graph.json')
const part = inject(partNumberKey, 0)
const route = useRoute()
const graph = shallowRef<ConceptGraph | null>(null)
onMounted(async () => {
  graph.value = await loadConceptGraph(graphUrl)
})

// 현재 챕터 슬러그 (챕터 페이지가 아니면 null → 띠 없음)
const slug = computed(() => {
  const m = /^\/ch\/([\w-]+)$/.exec(route.path)
  return m ? m[1] : null
})

const byId = computed(() => new Map((graph.value?.concepts ?? []).map((c) => [c.id, c])))

/** ① 이 장에서 처음 배우는 개념 */
const defined = computed<Concept[]>(() =>
  graph.value && slug.value && part ? conceptsDefinedAt(graph.value, part, slug.value) : [],
)

/** ② 선수 개념 중 이 장 밖에서 배우는 것 (중복 제거) */
const prereqs = computed<Concept[]>(() => {
  if (!slug.value) return []
  const seen = new Set<string>()
  const out: Concept[] = []
  for (const c of defined.value) {
    for (const id of c.prereq) {
      const p = byId.value.get(id)
      if (!p || seen.has(id)) continue
      if (p.definedAt.part === part && p.definedAt.slug === slug.value) continue
      seen.add(id)
      out.push(p)
    }
  }
  return out
})

/** ③ 다른 곳에서 배운 뒤 이 장이 다시 쓰는 개념 */
const reusedHere = computed(() =>
  graph.value && slug.value && part ? conceptsReusedAt(graph.value, part, slug.value) : [],
)

/** ④ 이 장의 개념이 다음에 다시 쓰이는 곳 (최대 5 + 나머지 개수) */
const LATER_MAX = 5
const laterAll = computed<{ concept: Concept; use: ConceptLocation }[]>(() => {
  const out: { concept: Concept; use: ConceptLocation }[] = []
  for (const c of defined.value) {
    for (const u of c.usedAt) {
      if (u.part === part && u.slug === slug.value) continue
      out.push({ concept: c, use: u })
    }
  }
  return out
})
const later = computed(() => laterAll.value.slice(0, LATER_MAX))
const laterMore = computed(() => Math.max(0, laterAll.value.length - LATER_MAX))

const show = computed(
  () => !!slug.value && defined.value.length + prereqs.value.length + reusedHere.value.length > 0,
)

/** 위치 링크 — 같은 부면 SPA 라우팅, 다른 부면 조립 배포본 경로(dev 에선 평문) */
function linkOf(loc: ConceptLocation): { kind: 'router' | 'anchor' | 'text'; to: string } {
  if (loc.part === part) {
    const same = loc.slug === slug.value
    const hash = loc.anchor ? '#' + loc.anchor : ''
    return { kind: 'router', to: same ? route.path + hash : `/ch/${loc.slug}${hash}` }
  }
  return isDev ? { kind: 'text', to: '' } : { kind: 'anchor', to: chapterHref(loc.part, loc.slug, loc.anchor) }
}

/** 다시 쓰는 곳 설명(how)의 짧은 이름 — 정본 형식 "짧은 이름: 설명" → "짧은 이름" (옛 줄표 형식도 받는다) */
const shortHow = (how: string) => how.split(/: |\s+[—–]\s+/)[0]

// 포털 개념 지도 딥링크 (조립 배포본에서 포털은 루트) — 첫 정의 개념을 선택 상태로 연다
const mapHref = computed(() =>
  !isDev && defined.value.length ? `/concepts?c=${encodeURIComponent(defined.value[0].id)}` : null,
)
</script>

<template>
  <nav
    v-if="show"
    aria-label="이 장의 개념 연결"
    data-concept-strip
    class="mx-auto mb-6 max-w-[46rem] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700"
  >
    <!-- ① 처음 배우는 개념 — 같은 장 안의 섹션 앵커로 점프 -->
    <p v-if="defined.length">
      <span class="font-semibold text-slate-800">🔑 이 장에서 처음 배우는 개념</span>
      <span class="text-slate-500">: </span>
      <template v-for="(c, i) in defined" :key="c.id">
        <span v-if="i" class="text-slate-500"> · </span>
        <RouterLink
          v-if="c.definedAt.anchor"
          :to="{ path: route.path, hash: '#' + c.definedAt.anchor }"
          class="font-medium text-indigo-600 underline decoration-dotted underline-offset-2"
          :title="c.note"
          >{{ c.label }}</RouterLink
        >
        <span v-else class="font-medium text-slate-800" :title="c.note">{{ c.label }}</span>
      </template>
    </p>

    <!-- ② 먼저 알아 두면 — 선수 개념과 그 정의처 -->
    <p v-if="prereqs.length">
      <span class="font-semibold text-slate-800">먼저 알아 두면</span>
      <span class="text-slate-500">: </span>
      <template v-for="(c, i) in prereqs" :key="c.id">
        <span v-if="i" class="text-slate-500"> · </span>
        <span :title="c.note">{{ c.label }}</span>
        <span class="text-slate-500">(</span>
        <RouterLink
          v-if="linkOf(c.definedAt).kind === 'router'"
          :to="linkOf(c.definedAt).to"
          class="font-medium text-indigo-600 underline decoration-dotted underline-offset-2"
          >{{ chapterLabel(c.definedAt.part, c.definedAt.slug) }}</RouterLink
        >
        <a
          v-else-if="linkOf(c.definedAt).kind === 'anchor'"
          :href="linkOf(c.definedAt).to"
          target="_blank"
          rel="noopener"
          class="font-medium text-indigo-600 underline decoration-dotted underline-offset-2"
          >{{ chapterLabel(c.definedAt.part, c.definedAt.slug) }}</a
        >
        <span v-else class="text-slate-600">{{ chapterLabel(c.definedAt.part, c.definedAt.slug) }}</span>
        <span class="text-slate-500">)</span>
      </template>
    </p>

    <!-- ③ 이 장이 다시 쓰는 수학 — 정의처 링크 + 어떻게 -->
    <p v-if="reusedHere.length">
      <span class="font-semibold text-slate-800">이 장이 다시 쓰는 수학</span>
      <span class="text-slate-500">: </span>
      <template v-for="(r, i) in reusedHere" :key="r.concept.id">
        <span v-if="i" class="text-slate-500"> · </span>
        <span :title="r.use.how ?? r.concept.note">{{ r.concept.label }}</span>
        <span class="text-slate-500">(</span>
        <RouterLink
          v-if="linkOf(r.concept.definedAt).kind === 'router'"
          :to="linkOf(r.concept.definedAt).to"
          class="font-medium text-indigo-600 underline decoration-dotted underline-offset-2"
          >{{ chapterLabel(r.concept.definedAt.part, r.concept.definedAt.slug) }}</RouterLink
        >
        <a
          v-else-if="linkOf(r.concept.definedAt).kind === 'anchor'"
          :href="linkOf(r.concept.definedAt).to"
          target="_blank"
          rel="noopener"
          class="font-medium text-indigo-600 underline decoration-dotted underline-offset-2"
          >{{ chapterLabel(r.concept.definedAt.part, r.concept.definedAt.slug) }}</a
        >
        <span v-else class="text-slate-600">{{ chapterLabel(r.concept.definedAt.part, r.concept.definedAt.slug) }}</span>
        <span class="text-slate-500">)</span>
      </template>
    </p>

    <!-- ④ 다음에 다시 만나는 곳 -->
    <p v-if="later.length">
      <span class="font-semibold text-slate-800">다음에 다시 만나는 곳</span>
      <span class="text-slate-500">: </span>
      <template v-for="(l, i) in later" :key="l.concept.id + l.use.part + l.use.slug">
        <span v-if="i" class="text-slate-500"> · </span>
        <RouterLink
          v-if="linkOf(l.use).kind === 'router'"
          :to="linkOf(l.use).to"
          class="font-medium text-indigo-600 underline decoration-dotted underline-offset-2"
          >{{ chapterLabel(l.use.part, l.use.slug) }}</RouterLink
        >
        <a
          v-else-if="linkOf(l.use).kind === 'anchor'"
          :href="linkOf(l.use).to"
          target="_blank"
          rel="noopener"
          class="font-medium text-indigo-600 underline decoration-dotted underline-offset-2"
          >{{ chapterLabel(l.use.part, l.use.slug) }}</a
        >
        <span v-else class="text-slate-600">{{ chapterLabel(l.use.part, l.use.slug) }}</span>
        <!-- how 는 첫 구절만(전체는 title) — 띠가 세 줄을 넘지 않게. 앞의 공백은 템플릿 공백 압축을 피해 &nbsp; -->
        <span v-if="l.use.how" class="text-slate-600" :title="l.use.how">&nbsp;({{ shortHow(l.use.how) }})</span>
      </template>
      <span v-if="laterMore" class="text-slate-600">&nbsp;외 {{ laterMore }}곳</span>
    </p>

    <p v-if="mapHref" class="mt-1 text-xs">
      <a :href="mapHref" target="_blank" rel="noopener" class="text-indigo-600 hover:underline"
        >🧠 시리즈 개념 지도에서 보기 →</a
      >
    </p>
  </nav>
</template>
