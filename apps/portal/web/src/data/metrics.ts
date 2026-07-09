// 진단 1회의 요약 지표 — 향상도(전↔후) 비교에 쓴다.
import { questions } from './diagnostic'
import { scoreGates } from './recommend'
import { confidenceAvg, type Diagnosis } from './useDiagnosis'

export interface DiagMetrics {
  /** 맞힌 문항 수 */
  correct: number
  /** 전체 문항 수 */
  total: number
  /** 통과한 관문 수 (0~4) */
  gatesPassed: number
  /** 자신감 평균 (1~5) */
  confidence: number
}

export function diagnosisMetrics(d: Diagnosis): DiagMetrics {
  let correct = 0
  for (const q of questions) if (d.answers[q.id] === q.answer) correct++
  const gates = scoreGates(d.answers)
  const gatesPassed = Object.values(gates).filter((g) => g.passed).length
  return { correct, total: questions.length, gatesPassed, confidence: confidenceAvg(d.confidence) }
}
