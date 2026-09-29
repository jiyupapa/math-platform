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
  /** 예상 학습 소요시간 (분) — 목차에 배지로 표시, 포털 경로 요약 합산에 사용 */
  minutes?: number
}

// 모든 챕터는 최종 종착점인 '경사하강법·역전파'를 향해 배열되어 있다.
export const chapters: ChapterMeta[] = [
  {
    slug: 'sample',
    phase: 0,
    title: '워밍업 — 접선 맛보기',
    summary: '5분 몸풀기. 접선을 직접 움직여 보며 설명 카드·차트·문제 풀이가 어떻게 진행되는지 가볍게 체험해요.',
    minutes: 5,
  },
  { slug: 'ch1', phase: 1, title: '함수와 그래프, 기울기 직관', summary: '곡선의 가파른 정도 읽기', minutes: 35 },
  { slug: 'ch2', phase: 2, title: '변화율과 극한', summary: '평균에서 순간으로', minutes: 40 },
  { slug: 'ch3', phase: 3, title: '미분계수와 도함수의 정의', summary: '접선의 기울기', minutes: 45 },
  { slug: 'ch4', phase: 4, title: '기본 미분 공식', summary: '거듭제곱·상수·합차 공식', minutes: 35 },
  { slug: 'ch5', phase: 5, title: '곱과 몫의 법칙', summary: '복합식 미분', minutes: 35 },
  { slug: 'ch6', phase: 6, title: '연쇄법칙 (핵심)', summary: '합성함수 미분, 역전파의 핵심', minutes: 45 },
  { slug: 'ch7', phase: 7, title: '지수·로그·시그모이드 미분', summary: '활성화 함수의 미분', minutes: 40 },
  { slug: 'ch8', phase: 8, title: '다변수 함수와 편미분', summary: '가중치별 기울기', minutes: 40 },
  { slug: 'ch9', phase: 9, title: '그래디언트와 경사하강법', summary: '모델 학습의 원리', minutes: 45 },
  { slug: 'ch10', phase: 10, title: '미분의 응용 — 역전파 직관', summary: '계산그래프와 손실 최소화', minutes: 40 },
]

export const availableChapters = chapters.filter((c) => !c.comingSoon)

// 학습 진도 산정 대상 — 데모용 샘플(phase 0)은 제외한 실제 학습 챕터만 (포털 진도 지도와 같은 기준)
export const progressChapters = availableChapters.filter((c) => c.phase >= 1)
