// 포털 스탯 — 소개·심사용 "숫자 한 장". 전부 실측/검증값 (2026-07-11, 6부 완결 반영).
//   64  = 학습 챕터 수: part1~6 의 Chapter*.vue (12+10+10+12+10+10, 샘플 제외)
//   900+= 자동채점 문항: <Quiz> 818 + <StepQuiz> 103 = 921 (보수적으로 900+)
//   72  = 실습 노트북(ipynb) 전수 (6부 11개 포함)
//   ₩0  = 로컬 Ollama 튜터 (API 비용·인터넷·계정 불필요, 오프라인 동작)
export interface Stat {
  value: string
  label: string
  sub: string
}

export const stats: Stat[] = [
  { value: '64', label: '학습 챕터', sub: '6부작 · 선형대수→LLM 조련' },
  { value: '900+', label: '자동채점 문항', sub: '즉시 채점 + 단계별 해설' },
  { value: '72', label: '실습 노트북', sub: '웹 챕터 ↔ Jupyter 1:1' },
  { value: '₩0', label: '운영비', sub: '로컬 AI 튜터 · 오프라인' },
]
