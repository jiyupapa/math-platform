// 3층 — 추천 이유를 강사 말투로 설명(규칙 기반 템플릿).
// 결정은 recommend.ts(규칙)가 하고, 여기서는 그 결과를 문장으로 풀어줄 뿐이다.
// Ollama 튜터가 켜져 있으면 이 문장을 더 따뜻하게 다시 말해준다(TutorExplain.vue). 꺼져 있으면 이 템플릿이 최종.
import type { Recommendation } from './recommend'

export function explainTemplate(rec: Recommendation): string {
  const g = rec.gates
  const parts: string[] = []

  const skipped: string[] = []
  if (g.vector?.passed) skipped.push('1부 전반(벡터·행렬)')
  if (g.prob?.passed) skipped.push('3부 전반(확률의 언어)')
  if (skipped.length) {
    parts.push(`${skipped.join(' 과 ')} 감각이 이미 있어 접었어요.`)
  } else {
    parts.push('기초 감각부터 차근차근 쌓아 갈게요.')
  }

  if (g.calculus?.passed) {
    parts.push('미분(2부)은 기억을 되살리는 빠른 복습으로 충분합니다.')
  } else {
    parts.push('미분(2부)은 "모델이 학습하는 원리"를 위해 제대로 봅니다.')
  }

  parts.push('그리고 핵심인 트랜스포머(4부)를 제대로 조립합니다.')

  if (!g.log?.passed) {
    parts.push('log 감각은 5부에 들어가기 전에 한 번 짚고 갈게요.')
  }

  const hours = Math.round((rec.activeMinutes / 60) * 10) / 10
  parts.push(`당신에게 맞춘 경로는 ${rec.activeChapters}챕터, 약 ${hours}시간입니다.`)

  return parts.join(' ')
}
