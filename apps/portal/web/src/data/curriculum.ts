// 시리즈 8단계 비선형 학습 경로 — 포털이 소유하는 "경로 지도"의 단일 소스.
// 루트 README 의 추천 경로(1→2→3→4→5 순서가 아님)를 구조화한 것.
// 진단 결과에 따라 각 단계를 '이미 앎/보류/빠른복습'으로 접는 개인화(recommend.ts, 다음 단계)의 대상이 된다.
//
// 챕터 수·소요시간:
//   전 6부 chapters.ts 의 minutes 실값 합 (6부는 2026-07-11 전 챕터 공개 완료).
//   포털은 별도 앱이라 각 부 chapters.ts 를 직접 import 하지 않고 여기서 관리한다(향후 공용 패키지화 가능).
//   ⚠️ 각 부 minutes 를 바꾸면 여기 합계도 갱신할 것.

export type PartId = 1 | 2 | 3 | 4 | 5 | 6 | 7

/** 역할 묶음 — 토대(1·2·3) → 조립(4) → 본체(5) → 조련(6), 실용(7)·심화는 선택 분기 */
export type StepRole = '토대' | '조립' | '본체' | '조련' | '심화' | '실용'

/** 진단 관문 — 통과 시 해당 단계를 접거나 복습 모드로 (recommend.ts 가 사용) */
export type GateId = 'vector' | 'prob' | 'calculus' | 'log'

export interface PathStep {
  /** 경로상 순번 (1~8) */
  order: number
  /** 링크 대상 앱(/part{part}/). 6부는 아직 앱이 없다(comingSoon) */
  part: PartId
  /** 지도에 뜨는 제목 */
  title: string
  /** 다루는 범위 설명 (예: 'ch1~6') */
  scope: string
  /** 이 단계의 챕터 수 */
  chapterCount: number
  /** 예상 소요시간(분) */
  minutes: number
  /** minutes 가 추정치면 true */
  estimate?: boolean
  /** 역할 묶음 */
  role: StepRole
  /** 한 줄 가치 설명 */
  gain: string
  /** 이 단계를 접을 수 있는 진단 관문 (없으면 항상 필수) */
  gate?: GateId
  /** 통과해도 건너뛰지 않고 '빠른 복습'만 하는 단계면 true (예: 2부 미분) */
  compressOnly?: boolean
  /** 선택(심화) 단계면 true */
  optional?: boolean
  /** 아직 콘텐츠 없음(예정) */
  comingSoon?: boolean
}

export const pathSteps: PathStep[] = [
  {
    order: 1, part: 1, title: '1부 전반 — 벡터·행렬', scope: 'ch1~6',
    chapterCount: 6, minutes: 260, role: '토대', gate: 'vector',
    gain: '단어가 벡터가 되고, 행렬곱이 변환이다',
  },
  {
    order: 2, part: 3, title: '3부 전반 — 확률의 언어', scope: 'ch1~7',
    chapterCount: 7, minutes: 280, role: '토대', gate: 'prob',
    gain: 'LLM = 다음 단어를 확률로 고르는 기계',
  },
  {
    order: 3, part: 4, title: '4부 추론편 — LLM이 글을 쓰는 법', scope: 'ch1~10, 12',
    chapterCount: 11, minutes: 450, role: '조립',
    gain: '시리즈의 보상 지점 — 어텐션·확률이 실제로 쓰인다',
  },
  {
    order: 4, part: 2, title: '2부 전체 — 미분', scope: 'ch1~10',
    chapterCount: 10, minutes: 400, role: '토대', gate: 'calculus', compressOnly: true,
    gain: '모델이 학습하는 원리 — 경사하강·역전파',
  },
  {
    order: 5, part: 4, title: '4부 학습편 — 손실과 경사하강', scope: 'ch11',
    chapterCount: 1, minutes: 45, role: '조립',
    gain: '2부 미분이 트랜스포머 학습에 그대로 꽂힌다',
  },
  {
    order: 6, part: 5, title: '5부 전체 — 정보이론', scope: 'ch1~10',
    chapterCount: 10, minutes: 395, role: '본체', gate: 'log',
    gain: '손실함수·퍼플렉시티·temperature의 본체',
  },
  {
    order: 7, part: 6, title: '6부 전체 — LLM 조련', scope: 'ch1~10',
    chapterCount: 10, minutes: 410, role: '조련',
    gain: 'GPT가 ChatGPT가 되기까지 — SFT·RLHF·DPO',
  },
  {
    order: 8, part: 1, title: '(선택) 후반 심화 — 1부·3부', scope: '1부 ch7~12 · 3부 ch8~10',
    chapterCount: 9, minutes: 375, role: '심화', optional: true,
    gain: '고유값·SVD·PCA·검정·회귀 — 교양·심화',
  },
  {
    order: 9, part: 7, title: '(선택·실용) 7부 — 임베딩 기하학', scope: 'ch1~10 · 제작 중(1~9장 공개)',
    chapterCount: 10, minutes: 420, estimate: true, role: '실용', optional: true,
    gain: 'RAG의 수학 — 1부 전반만 마치면 언제든 진입 가능',
  },
]

// 핵심 경로 요약 — 예정(6부)·선택(심화) 제외한 실제 학습 대상.
const coreSteps = pathSteps.filter((s) => !s.optional && !s.comingSoon)
export const totalChapters = coreSteps.reduce((n, s) => n + s.chapterCount, 0)
export const totalMinutes = coreSteps.reduce((n, s) => n + s.minutes, 0)
export const totalHours = Math.round(totalMinutes / 60)
