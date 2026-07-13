// 포털 스탯 — 소개용 "숫자 한 장". 전부 실측/검증값 (2026-07-13, 11부 완결 반영).
//   118  = 학습 챕터 수: part1~11 의 Chapter*.vue (12+10+10+12+10+10+10+11+11+10+12, 샘플 제외)
//   1,600+= 자동채점 문항: <Quiz> 1,533 + <StepQuiz> 137 = 1,670 (샘플 포함 전수 — 보수적으로 1,600+)
//   131  = 실습 노트북(ipynb) 전수 (10부 11 + 11부 13 포함)
//   ₩0   = 로컬 Ollama 튜터 (API 비용·인터넷·계정 불필요, 오프라인 동작)
export interface Stat {
  value: string
  label: string
  sub: string
}

export const stats: Stat[] = [
  { value: '118', label: '학습 챕터', sub: '11부작 완결 · 선형대수→평가 통계→에이전트' },
  { value: '1,600+', label: '자동채점 문항', sub: '즉시 채점 + 단계별 해설' },
  { value: '131', label: '실습 노트북', sub: '웹 챕터 ↔ Jupyter 1:1' },
  { value: '₩0', label: '운영비', sub: '로컬 AI 튜터 · 오프라인' },
]
