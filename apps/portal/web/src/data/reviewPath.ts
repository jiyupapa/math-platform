// 복습 경로 (온톨로지 3단계) — 복습 표시(ReviewFlag 북마크) → 개념 → 선수 개념까지, 먼 것부터.
//   북마크 {id:'ch6-s2', chapter:'ch6'} 는 섹션 앵커라 그래프의 정의처·회수처 앵커와 바로 맞는다(같은 id 체계).
//   앵커가 안 맞으면 그 장에서 처음 배우는 개념으로 묶고, 그것도 없으면 '개념 없음'으로 센다.
//   선수 닫힘은 깊이 우선 후위 — 검사기가 순환을 막으므로 종료가 보장되고, 같은 입력이면 같은 순서(결정적).
//   진도는 정의처 장 완료 여부(2층 useProgress) — 조립 배포본(같은 origin)에서만 각 부 값이 보인다.
import { conceptsAtAnchor, locKey, type Concept, type ConceptGraph } from '@series/ui'
import { PART_META, readCompletedSlugs, readReviewBookmarks, type ReviewBookmark } from './useProgress'

export interface ReviewPathStep {
  concept: Concept
  /** 복습 표시가 직접 가리키는 개념 */
  flagged: boolean
  /** 배우는 장을 이미 완료 */
  mastered: boolean
}

export interface ReviewPath {
  bookmarkCount: number
  /** 북마크가 가리키는 개념(북마크 순, 중복 제거) */
  flagged: Concept[]
  /** 선수 닫힘 포함, 먼 선수부터 */
  steps: ReviewPathStep[]
  /** 개념으로 못 묶은 북마크 수 */
  unmatched: number
}

export function buildReviewPath(
  graph: ConceptGraph,
  bookmarks: { part: number; items: ReviewBookmark[] }[],
  completed: Set<string>,
): ReviewPath {
  const flagged: Concept[] = []
  const flaggedIds = new Set<string>()
  let bookmarkCount = 0
  let unmatched = 0
  for (const { part, items } of bookmarks) {
    for (const b of items) {
      bookmarkCount++
      const hits = conceptsAtAnchor(graph, part, b.chapter, b.id)
      if (!hits.length) {
        unmatched++
        continue
      }
      for (const c of hits) {
        if (flaggedIds.has(c.id)) continue
        flaggedIds.add(c.id)
        flagged.push(c)
      }
    }
  }

  const byId = new Map(graph.concepts.map((c) => [c.id, c]))
  const seen = new Set<string>()
  const order: Concept[] = []
  const visit = (c: Concept) => {
    if (seen.has(c.id)) return
    seen.add(c.id)
    for (const p of c.prereq) {
      const pc = byId.get(p)
      if (pc) visit(pc)
    }
    order.push(c)
  }
  for (const c of flagged) visit(c)

  const mastered = (c: Concept) => completed.has(locKey(c.definedAt.part, c.definedAt.slug))
  return {
    bookmarkCount,
    flagged,
    steps: order.map((c) => ({ concept: c, flagged: flaggedIds.has(c.id), mastered: mastered(c) })),
    unmatched,
  }
}

/** 각 부 localStorage(복습 북마크·진도)에서 읽어 경로를 만든다. */
export function readReviewPath(graph: ConceptGraph): ReviewPath {
  const bookmarks = PART_META.map((m) => ({ part: m.part, items: readReviewBookmarks(m) })).filter(
    (b) => b.items.length > 0,
  )
  const completed = new Set<string>()
  for (const m of PART_META) for (const s of readCompletedSlugs(m)) completed.add(locKey(m.part, s))
  return buildReviewPath(graph, bookmarks, completed)
}
