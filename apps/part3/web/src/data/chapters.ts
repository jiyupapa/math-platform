// 챕터 메타데이터 — 사이드바 목차와 라우터가 공유하는 단일 소스(single source of truth).
// 새 챕터를 추가하려면 여기에 항목을 넣고 src/chapters/ 에 대응하는 .vue 를 만든 뒤
// router/index.ts 의 동적 import 에 연결한다.

export interface ChapterMeta {
  /** URL 슬러그 (라우트 path 에 사용) */
  slug: string
  /** Phase 번호 (0 = 기반/샘플) */
  phase: number
  /** 사이드바에 표시될 제목 */
  title: string
  /** 한 줄 소개 */
  summary: string
  /** 아직 콘텐츠가 없는 예정 챕터면 true */
  comingSoon?: boolean
  /** 심화 트랙이면 true — AI(트랜스포머) 이해에 필수는 아닌 교양·심화. 목차에 배지로 표시 */
  advanced?: boolean
  /** 예상 학습 소요시간 (분) — 목차에 배지로 표시, 포털 경로 요약 합산에 사용 */
  minutes?: number
}

// 모든 챕터는 최종 종착점인 'AI 는 확률로 예측하고 데이터로 배운다'를 향해 배열되어 있다.
export const chapters: ChapterMeta[] = [
  {
    slug: 'sample',
    phase: 0,
    title: '워밍업 — 동전 던지기 맛보기',
    summary: '처음이라면 여기부터! 5분 만에 이 앱의 학습 방식을 체험해 보세요.',
    minutes: 5,
  },
  { slug: 'ch1', phase: 1, title: '데이터를 한눈에 — 평균·중앙값·최빈값', summary: '대푯값으로 데이터 요약하기', minutes: 30 },
  { slug: 'ch2', phase: 2, title: '흩어짐 재기 — 분산과 표준편차', summary: '평균에서 얼마나 퍼져 있나', minutes: 35 },
  { slug: 'ch3', phase: 3, title: '확률의 기초', summary: '경우의 수에서 확률의 법칙까지', minutes: 40 },
  { slug: 'ch4', phase: 4, title: '조건부 확률과 베이즈 정리 (핵심)', summary: '정보가 확률을 바꾸는 원리와 스팸 필터', minutes: 50 },
  { slug: 'ch5', phase: 5, title: '확률변수와 확률분포', summary: '베르누이·이항분포와 기댓값', minutes: 45 },
  { slug: 'ch6', phase: 6, title: '정규분포 (핵심)', summary: '세상에서 가장 유명한 종 모양 곡선', minutes: 40 },
  { slug: 'ch7', phase: 7, title: '큰 수의 법칙과 중심극한정리 (핵심)', summary: '왜 표본으로 전체를 알 수 있나', minutes: 40 },
  // --- 심화 트랙 (트랜스포머 이해에 필수는 아님 — 4부까지 마친 뒤 돌아와도 좋다) ---
  { slug: 'ch8', phase: 8, title: '표본으로 전체 알기 — 추정과 신뢰구간', summary: '여론조사의 ±3%p 읽는 법', advanced: true, minutes: 40 },
  { slug: 'ch9', phase: 9, title: '가설검정과 p값', summary: 'A/B 테스트, 우연인가 진짜인가', advanced: true, minutes: 40 },
  { slug: 'ch10', phase: 10, title: '상관관계와 회귀 — 머신러닝의 시작', summary: '데이터에서 직선 찾기, 첫 ML 모델', advanced: true, minutes: 45 },
]

export const availableChapters = chapters.filter((c) => !c.comingSoon)

// 학습 진도 산정 대상 — 데모용 샘플(phase 0)은 제외한 실제 학습 챕터만 (포털 진도 지도와 같은 기준)
export const progressChapters = availableChapters.filter((c) => c.phase >= 1)
