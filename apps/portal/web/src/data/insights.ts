// 2층 고도화 — 각 부의 학습 데이터에서 "지금 할 일" 인사이트를 뽑는 규칙.
//   복습 먼저: 복습 북마크(ReviewFlag)가 남아 있으면 진행보다 복습을 권한다.
//   심화 해금: 필수 트랙을 완주한 부에 심화 챕터가 남아 있으면 해금을 제안한다.
// (전략 문서의 "QuizSet 점수 낮음" 신호는 저장 형식상 측정 불가 — QuizSet 은 맞힌 문제만
//  기록하고 틀린 시도는 남기지 않는다. 데이터가 지원하는 위 두 신호만 쓴다.)
import { PART_META, readCompletedSlugs, readReviewBookmarks } from './useProgress'

export interface ReviewInsight {
  type: 'review'
  part: number
  partLabel: string
  count: number
  /** 미리보기용 북마크 이름 (최대 2개) */
  preview: string[]
  href: string
}

export interface UnlockInsight {
  type: 'unlock'
  part: number
  partLabel: string
  /** 남은 심화 챕터 수 */
  remaining: number
  href: string
}

export type Insight = ReviewInsight | UnlockInsight

export function readInsights(): Insight[] {
  const reviews: ReviewInsight[] = []
  const unlocks: UnlockInsight[] = []

  for (const meta of PART_META) {
    const bookmarks = readReviewBookmarks(meta)
    if (bookmarks.length > 0) {
      reviews.push({
        type: 'review',
        part: meta.part,
        partLabel: meta.label,
        count: bookmarks.length,
        preview: bookmarks.slice(0, 2).map((b) => b.label),
        href: `/part${meta.part}/review`,
      })
    }

    if (meta.advanced.length > 0) {
      const done = readCompletedSlugs(meta)
      const essentialDone = meta.essential.every((s) => done.has(s))
      const advancedLeft = meta.advanced.filter((s) => !done.has(s)).length
      if (essentialDone && advancedLeft > 0) {
        unlocks.push({
          type: 'unlock',
          part: meta.part,
          partLabel: meta.label,
          remaining: advancedLeft,
          href: `/part${meta.part}/`,
        })
      }
    }
  }

  // 복습이 진행보다 먼저 — 복습 카드를 앞에 둔다.
  return [...reviews, ...unlocks]
}
