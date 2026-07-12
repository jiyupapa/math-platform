// 포털 스탯 — 소개용 "숫자 한 장". 전부 실측/검증값 (2026-07-12, 8부 완결 반영).
//   85   = 학습 챕터 수: part1~8 의 Chapter*.vue (12+10+10+12+10+10+10+11, 샘플 제외)
//   1,000+= 자동채점 문항: <Quiz> 1,099 + <StepQuiz> 119 = 1,218 (샘플 포함 전수 — 보수적으로 1,000+)
//   95   = 실습 노트북(ipynb) 전수 (6부 11개 + 7부 11개 + 8부 12개 포함)
//   ₩0   = 로컬 Ollama 튜터 (API 비용·인터넷·계정 불필요, 오프라인 동작)
export interface Stat {
  value: string
  label: string
  sub: string
}

export const stats: Stat[] = [
  { value: '85', label: '학습 챕터', sub: '8부 완결·9부 제작 중 · 선형대수→LLM 조련→최적화' },
  { value: '1,000+', label: '자동채점 문항', sub: '즉시 채점 + 단계별 해설' },
  { value: '95', label: '실습 노트북', sub: '웹 챕터 ↔ Jupyter 1:1' },
  { value: '₩0', label: '운영비', sub: '로컬 AI 튜터 · 오프라인' },
]
