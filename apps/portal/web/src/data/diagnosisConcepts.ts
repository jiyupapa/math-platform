// 진단 → 개념 단위 결과 (온톨로지 3단계).
// 판정(관문 통과·경로 접기)은 recommend.ts 의 규칙 그대로다. 여기서는 문항의 concepts 태그로
// "맞힌 개념 / 헷갈린 개념" 을 파생한다 — 홈의 칩, 개념 지도의 표시(⚠ ring), 설명 문장에 쓴다.
// 저장 형식 변경 없음: 답(answers)에서 매번 계산한다(결정적 — 같은 답이면 같은 결과).
import { questions } from './diagnostic'

export interface ConceptResults {
  /** 그 개념을 재는 문항을 전부 맞힘 */
  correct: string[]
  /** 그 개념을 재는 문항 중 하나라도 틀림 — 같은 개념이 여러 문항에 걸리면(지수와 로그) 이쪽 */
  missed: string[]
}

export function conceptResults(answers: Record<string, number>): ConceptResults {
  const correct = new Set<string>()
  const missed = new Set<string>()
  for (const q of questions) {
    const ok = answers[q.id] === q.answer
    for (const id of q.concepts) (ok ? correct : missed).add(id)
  }
  for (const id of missed) correct.delete(id)
  return { correct: [...correct], missed: [...missed] }
}
