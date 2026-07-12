// 포털 스탯 — 소개용 "숫자 한 장". 전부 실측/검증값 (2026-07-12, 9부 완결 반영).
//   96   = 학습 챕터 수: part1~9 의 Chapter*.vue (12+10+10+12+10+10+10+11+11, 샘플 제외)
//   1,300+= 자동채점 문항: <Quiz> 1,241 + <StepQuiz> 120 = 1,361 (샘플 포함 전수 — 보수적으로 1,300+)
//   107  = 실습 노트북(ipynb) 전수 (6부 11 + 7부 11 + 8부 12 + 9부 12 포함)
//   ₩0   = 로컬 Ollama 튜터 (API 비용·인터넷·계정 불필요, 오프라인 동작)
export interface Stat {
  value: string
  label: string
  sub: string
}

export const stats: Stat[] = [
  { value: '96', label: '학습 챕터', sub: '9부작 완결 · 선형대수→LLM 조련→수치 계산' },
  { value: '1,300+', label: '자동채점 문항', sub: '즉시 채점 + 단계별 해설' },
  { value: '107', label: '실습 노트북', sub: '웹 챕터 ↔ Jupyter 1:1' },
  { value: '₩0', label: '운영비', sub: '로컬 AI 튜터 · 오프라인' },
]
