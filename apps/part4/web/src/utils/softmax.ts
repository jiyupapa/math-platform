// 소프트맥스: 실수 점수(logit) 목록을 0~1 사이 확률 목록으로 바꾼다.
// 모든 출력의 합은 항상 1. 점수가 클수록 확률이 크지만, 작은 점수도 0이 되진 않는다.
//
// 큰 점수에서 exp 가 폭발하지 않도록 최댓값을 빼고 계산한다(수치 안정화).
// 빼도 결과 확률은 똑같다: 분자·분모에 같은 상수가 곱해져 약분되기 때문.
export function softmax(logits: number[]): number[] {
  if (logits.length === 0) return []
  const max = Math.max(...logits)
  const exps = logits.map((l) => Math.exp(l - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / sum)
}

/** 확률이 가장 큰 항목의 인덱스 (LLM 이 "탐욕적(greedy)"으로 다음 토큰을 고를 때) */
export function argmax(values: number[]): number {
  let best = 0
  for (let i = 1; i < values.length; i++) if (values[i] > values[best]) best = i
  return best
}
