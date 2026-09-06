// 개념 그래프(concept-graph.json) 읽기 — UI 쪽 단일 위치. 설계: docs/todo_온톨로지_260906.md §4·§5
//   정본은 scripts/ontology/concepts.json, 산출물은 각 앱 public/concept-graph.json (npm run ontology:graph).
//   ConceptStrip(각 부 장 상단 띠)·포털 개념 지도(ConceptsView)가 이 로더와 조회 헬퍼를 쓴다.
//   (튜터 접지는 @series/tutor 의 concepts.ts — 같은 산출물을 읽지만 패키지 의존을 늘리지 않으려 따로 둔다.)

export interface ConceptLocation {
  part: number
  slug: string
  anchor?: string
  how?: string
}

export interface ConceptMetaphor {
  term: string
  part: number
  note?: string
}

export interface Concept {
  id: string
  label: string
  aliases: string[]
  kind: 'math' | 'ai' | 'tool' | 'metric'
  note: string
  definedAt: ConceptLocation
  usedAt: ConceptLocation[]
  prereq: string[]
  related: string[]
  metaphors: ConceptMetaphor[]
}

export interface ConceptGraph {
  version: number
  source?: string
  parts: Record<string, string>
  chapters: Record<string, { title: string; advanced: boolean }>
  concepts: Concept[]
}

const cache = new Map<string, Promise<ConceptGraph | null>>()

/** 그래프를 1회만 fetch 해 캐시한다. 실패하면 null — 소비처는 조용히 아무것도 그리지 않는다. */
export function loadConceptGraph(url: string): Promise<ConceptGraph | null> {
  let p = cache.get(url)
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
        if (!res.ok) return null
        const data = (await res.json()) as ConceptGraph
        return Array.isArray(data.concepts) ? data : null
      } catch {
        return null
      }
    })()
    cache.set(url, p)
  }
  return p
}

export const locKey = (part: number, slug: string) => `${part}:${slug}`

/** "5부 5장" · "7부 워밍업" */
export function chapterLabel(part: number, slug: string): string {
  return `${part}부 ${slug === 'sample' ? '워밍업' : slug.replace(/^ch/, '') + '장'}`
}

/** 장 제목(그래프 조회표) — 없으면 빈 문자열 */
export function chapterTitle(graph: ConceptGraph, part: number, slug: string): string {
  return graph.chapters[`p${part}-${slug}`]?.title ?? ''
}

/** 조립 배포본 기준 딥링크 — 포털=/ · 각 부=/partN/ (PartLink·SearchPalette 와 같은 규약) */
export function chapterHref(part: number, slug: string, anchor?: string): string {
  return `/part${part}/ch/${slug}${anchor ? '#' + anchor : ''}`
}

/** 이 장에서 처음 배우는 개념 (정본 순서 유지) */
export function conceptsDefinedAt(graph: ConceptGraph, part: number, slug: string): Concept[] {
  return graph.concepts.filter((c) => c.definedAt.part === part && c.definedAt.slug === slug)
}

/** 다른 곳에서 배운 뒤 이 장이 다시 쓰는 개념 — 회수 위치(how 포함)와 함께 */
export function conceptsReusedAt(
  graph: ConceptGraph,
  part: number,
  slug: string,
): { concept: Concept; use: ConceptLocation }[] {
  const out: { concept: Concept; use: ConceptLocation }[] = []
  for (const c of graph.concepts) {
    if (c.definedAt.part === part && c.definedAt.slug === slug) continue
    const use = c.usedAt.find((u) => u.part === part && u.slug === slug)
    if (use) out.push({ concept: c, use })
  }
  return out
}

/** 주석·복습 북마크의 앵커(부·장·항목 id) → 개념. 앵커 일치(정의처·회수처)가 우선, 없으면 그 장에서 처음 배우는
 *  개념(장 단위). 3단계 소비처(복습 경로 · 질문 집계 · 질문 큐)가 같은 규칙으로 묶도록 한 곳에 둔다. */
export function conceptsAtAnchor(graph: ConceptGraph, part: number, chapter: string, itemId?: string): Concept[] {
  if (itemId) {
    const hit = graph.concepts.filter(
      (c) =>
        (c.definedAt.part === part && c.definedAt.slug === chapter && c.definedAt.anchor === itemId) ||
        c.usedAt.some((u) => u.part === part && u.slug === chapter && u.anchor === itemId),
    )
    if (hit.length) return hit
  }
  return conceptsDefinedAt(graph, part, chapter)
}

/** 이 개념을 선수로 요구하는 개념들(직접) */
export function dependentsOf(graph: ConceptGraph, id: string): Concept[] {
  return graph.concepts.filter((c) => c.prereq.includes(id))
}

/** 선수 개념의 닫힘(추이적) — 자기 자신 제외, 먼 선수부터(깊이 우선 후위). 검사기가 순환을 막으므로 종료가 보장된다. */
export function prereqClosure(graph: ConceptGraph, id: string): Concept[] {
  const byId = new Map(graph.concepts.map((c) => [c.id, c]))
  const seen = new Set<string>()
  const out: Concept[] = []
  const visit = (cid: string) => {
    for (const p of byId.get(cid)?.prereq ?? []) {
      if (seen.has(p)) continue
      seen.add(p)
      visit(p)
      const pc = byId.get(p)
      if (pc) out.push(pc)
    }
  }
  visit(id)
  return out
}
