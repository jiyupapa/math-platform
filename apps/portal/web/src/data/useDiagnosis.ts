// 진단 결과 저장/조회 — 포털 접두사 hub-* 사용(각 부 la-/tf- 와 구분).
// - hub-diagnosis-v1 : 최신 진단(경로 추천에 사용).
// - hub-baseline-v1  : 최초 진단('학습 전' 기준선). 재진단해도 유지 → 향상도(전↔후) 비교의 앵커.
const KEY = 'hub-diagnosis-v1'
const BASELINE_KEY = 'hub-baseline-v1'

export interface Diagnosis {
  /** questionId → 선택한 choice 인덱스 */
  answers: Record<string, number>
  /** confidenceItemId → 1~5 */
  confidence: Record<string, number>
  savedAt: number
}

function read(key: string): Diagnosis | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Diagnosis) : null
  } catch {
    return null
  }
}

export function loadDiagnosis(): Diagnosis | null {
  return read(KEY)
}

/** 최초 진단(학습 전 기준선). 없으면 null. */
export function loadBaseline(): Diagnosis | null {
  return read(BASELINE_KEY)
}

export function saveDiagnosis(d: Diagnosis): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(d))
    // 최초 1회만 기준선으로 별도 보관 (이후 재진단해도 덮어쓰지 않음)
    if (!localStorage.getItem(BASELINE_KEY)) localStorage.setItem(BASELINE_KEY, JSON.stringify(d))
  } catch {
    /* localStorage 사용 불가 환경 무시 */
  }
}

/** 최신 진단만 지운다(기준선은 유지 → '학습 전' 앵커 보존). */
export function clearDiagnosis(): void {
  localStorage.removeItem(KEY)
}

/** 자기보고 평균(1~5). 응답이 없으면 중립값 3. */
export function confidenceAvg(confidence: Record<string, number>): number {
  const vals = Object.values(confidence)
  if (!vals.length) return 3
  return vals.reduce((a, b) => a + b, 0) / vals.length
}
