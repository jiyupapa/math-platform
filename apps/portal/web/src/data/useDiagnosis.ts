// 진단 결과 저장/조회 — 포털 접두사 hub-* 사용(각 부 la-/tf- 와 구분).
// 이 값은 ③ 학습 전후 자가진단의 "학습 전" 측정값으로도 재사용된다.
const KEY = 'hub-diagnosis-v1'

export interface Diagnosis {
  /** questionId → 선택한 choice 인덱스 */
  answers: Record<string, number>
  /** confidenceItemId → 1~5 */
  confidence: Record<string, number>
  savedAt: number
}

export function loadDiagnosis(): Diagnosis | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Diagnosis) : null
  } catch {
    return null
  }
}

export function saveDiagnosis(d: Diagnosis): void {
  localStorage.setItem(KEY, JSON.stringify(d))
}

export function clearDiagnosis(): void {
  localStorage.removeItem(KEY)
}

/** 자기보고 평균(1~5). 응답이 없으면 중립값 3. */
export function confidenceAvg(confidence: Record<string, number>): number {
  const vals = Object.values(confidence)
  if (!vals.length) return 3
  return vals.reduce((a, b) => a + b, 0) / vals.length
}
