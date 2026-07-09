// 포털 스탯 — 소개·심사용 "숫자 한 장". 전부 실측/검증값 (2026-07-09).
//   54  = 학습 챕터 수: part1~5 의 Chapter*.vue (12+10+10+12+10, 샘플 제외)
//   700+= 자동채점 문항: <Quiz> 693 + <StepQuiz> 97 = 790 (보수적으로 700+)
//   61  = 실습 노트북(ipynb) 전수 — docs/TESTING.md 검증치와 일치
//   ₩0  = 로컬 Ollama 튜터 (API 비용·인터넷·계정 불필요, 오프라인 동작)
export interface Stat {
  value: string
  label: string
  sub: string
}

export const stats: Stat[] = [
  { value: '54', label: '학습 챕터', sub: '5부작 · 선형대수→정보이론' },
  { value: '700+', label: '자동채점 문항', sub: '즉시 채점 + 단계별 해설' },
  { value: '61', label: '실습 노트북', sub: '웹 챕터 ↔ Jupyter 1:1' },
  { value: '₩0', label: '운영비', sub: '로컬 AI 튜터 · 오프라인' },
]
