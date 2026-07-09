// AI 튜터에게 주입할 챕터별 맥락. 학습자가 보고 있는 챕터의 핵심 내용·용어·함정을
// 시스템 프롬프트에 넣어, 경량 로컬 모델도 본문과 일치하는 답을 하도록 돕는다.
// 데이터는 tutorContext.json 이 단일 소스. 새 챕터를 추가하면 JSON 에 맥락을 추가할 것.
import shared from './tutorContext.json'

export const tutorContext: Record<string, string> = shared.contexts

/** 튜터가 "그 내용은 N장에 있어요"라고 안내할 수 있도록 주입하는 전체 목차 인덱스. */
export const curriculumIndex: string = shared.curriculumIndex

/** 슬러그에 맞는 맥락. 없으면 전체 과정 소개를 돌려준다. */
export function contextFor(slug: string | null): string {
  if (slug && tutorContext[slug]) return tutorContext[slug]
  return shared.fallback
}
