// 진단 결과 → 개인화 학습 경로 (규칙 엔진).
// 원칙: 결정은 규칙 기반(같은 입력 → 항상 같은 경로, 시연 중 돌발 없음). 설명(LLM)은 3층에서 별도.
import { pathSteps, type GateId, type PathStep } from './curriculum'
import { questions } from './diagnostic'

export type StepStatus = '필수' | '건너뛰기' | '빠른복습' | '예정' | '선택'

export interface GateScore {
  correct: number
  total: number
  passed: boolean
}

export interface StepPlan {
  step: PathStep
  status: StepStatus
  note?: string
}

export interface Recommendation {
  plan: StepPlan[]
  activeChapters: number
  activeMinutes: number
  skippedSteps: number
  gates: Record<GateId, GateScore>
}

/** 관문 통과 기준 정답률 */
const PASS_RATIO = 0.6
/** 자신감 평균이 이 값 이하이면 '건너뛰기'를 '빠른복습'으로 완화 */
const LOW_CONFIDENCE = 2.5
/** 빠른복습 단계의 시간 계수 */
const REVIEW_TIME_FACTOR = 0.4

export function scoreGates(answers: Record<string, number>): Record<GateId, GateScore> {
  const gates = {} as Record<GateId, GateScore>
  for (const q of questions) {
    const g = (gates[q.gate] ??= { correct: 0, total: 0, passed: false })
    g.total++
    if (answers[q.id] === q.answer) g.correct++
  }
  for (const id of Object.keys(gates) as GateId[]) {
    gates[id].passed = gates[id].correct / gates[id].total >= PASS_RATIO
  }
  return gates
}

// confidenceAvg: 1~5 (자기보고 평균). 낮으면 지식이 있어도 건너뛰지 않고 '빠른복습' 권장.
export function recommend(answers: Record<string, number>, confidenceAvg: number): Recommendation {
  const gates = scoreGates(answers)
  const lowConfidence = confidenceAvg <= LOW_CONFIDENCE
  let activeChapters = 0
  let activeMinutes = 0
  let skippedSteps = 0

  const plan: StepPlan[] = pathSteps.map((step) => {
    let status: StepStatus = '필수'
    let note: string | undefined

    if (step.comingSoon) {
      status = '예정'
    } else if (step.optional) {
      status = '선택'
    } else if (step.gate) {
      const passed = gates[step.gate]?.passed ?? false
      if (step.gate === 'log') {
        // log 관문은 5부(본체)를 건너뛰지 않는다 — 실패 시 복습 안내만.
        status = '필수'
        if (!passed) note = 'log 감각부터 짚고 가면 수월해요 (2부 7장 / 5부 도입).'
      } else if (passed) {
        status = step.compressOnly || lowConfidence ? '빠른복습' : '건너뛰기'
      }
    }

    if (status === '건너뛰기') skippedSteps++
    if (status === '필수' || status === '빠른복습') {
      activeChapters += step.chapterCount
      activeMinutes += status === '빠른복습' ? Math.round(step.minutes * REVIEW_TIME_FACTOR) : step.minutes
    }

    return { step, status, note }
  })

  return { plan, activeChapters, activeMinutes, skippedSteps, gates }
}
