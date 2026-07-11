// 챕터 메타데이터 — 사이드바 목차와 라우터가 공유하는 단일 소스(single source of truth).
// 새 챕터를 추가하려면 여기서 comingSoon 을 제거하고 src/chapters/ 에 대응하는 .vue 를 만든 뒤
// router/index.ts 의 동적 import 에 연결한다. (구성안: 루트 README "8부 챕터 구성안" 표)

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
  /** 대응하는 노트북 파일명 (notebooks/) — 없으면 생략 */
  notebook?: string
}

// 🎯 궁극 목표: 2부 9장이 "경사하강이 뭔가"에서 멈춘 이야기의 실전층 — 실제 학습을 지배하는
//    다이얼들(학습률·미니배치·모멘텀·Adam·스케줄·정규화)의 수학을 직접 조작하며 이해한다.
//    ch11(캡스톤: 파인튜닝 설정 파일 완독)에서 도달. 6부(조련)의 실전 짝꿍.
//    핵심 한 줄: "학습은 안개 낀 산을 내려가는 여행이다 — 보폭·관성·일정표가 도착지를 정한다."
//    분량 방침: 줄이지 않는다 — 자세한 설명을 위한 확장 환영 (2026-07-11 지침).
export const chapters: ChapterMeta[] = [
  {
    slug: 'sample',
    phase: 0,
    title: '워밍업 — 같은 모델, 세 개의 운명',
    summary: '학습률 하나로 갈리는 성공·기어가기·폭발 — "수학 바깥의 다이얼"을 목격',
    minutes: 10,
    notebook: 'ch00_sample.ipynb',
  },
  { slug: 'ch1', phase: 1, title: '큰 그림 — 안개 낀 산과 여행자', summary: '손실 지형(loss landscape) 지도: 골짜기·평원·절벽, 훈련 = 지형 위의 여행', minutes: 35, comingSoon: true },
  { slug: 'ch2', phase: 2, title: '보폭의 과학 — 학습률 (핵심)', summary: '작으면 기어가고 크면 폭발 — 발산 경계의 수학과 lr 고르기 실전 감각', minutes: 45, comingSoon: true },
  { slug: 'ch3', phase: 3, title: '흔들리는 나침반 — 미니배치 SGD', summary: '기울기는 표본 추정치 — 배치 크기와 노이즈(또 1/√B), 노이즈의 순기능', minutes: 40, comingSoon: true },
  { slug: 'ch4', phase: 4, title: '관성으로 달리기 — 모멘텀', summary: '좁은 골짜기의 지그재그 문제 → 속도 누적, 지수이동평균(EMA)', minutes: 40, comingSoon: true },
  { slug: 'ch5', phase: 5, title: '축마다 다른 보폭 — Adam (핵심)', summary: '타원 골짜기(축별 스케일 불균형) → 적응적 보폭 — β₁·β₂·ε의 정체', minutes: 45, comingSoon: true },
  { slug: 'ch6', phase: 6, title: '여행 일정표 — 학습률 스케줄', summary: '워밍업·코사인 감쇠·스텝 감쇠 — 왜 초반은 조심스럽게, 후반은 미세하게', minutes: 40, comingSoon: true },
  { slug: 'ch7', phase: 7, title: '과적합 — 통째로 외운 학생 (핵심)', summary: '훈련 손실↓ 검증 손실↑ 갈라짐 — 일반화 = 표본 밖 성능', minutes: 45, comingSoon: true },
  { slug: 'ch8', phase: 8, title: '안전장치들 — 정규화', summary: 'weight decay(원점 목줄)·드롭아웃·조기 종료 — KL 목줄(6부)의 형제들', minutes: 40, comingSoon: true },
  { slug: 'ch9', phase: 9, title: '훈련 일지 판독법 — 손실 곡선 읽기', summary: '곡선의 4대 증상(스파이크·평원·계단·벌어짐) 진단과 처방, gradient clipping', minutes: 40, comingSoon: true },
  { slug: 'ch10', phase: 10, title: '지형의 함정들 — 안장점과 평원', summary: '고차원에선 국소최소보다 안장점 — 그런데도 SGD가 통하는 이유', minutes: 40, comingSoon: true },
  { slug: 'ch11', phase: 11, title: '🎯 캡스톤 — 파인튜닝 설정 완독', summary: '미니 훈련 튜너(다이얼 전 조합 실험) + 실제 config 한 줄씩 완독 → 졸업', minutes: 50, comingSoon: true },
]

export const availableChapters = chapters.filter((c) => !c.comingSoon)

// 학습 진도 산정 대상 — 데모용 샘플(phase 0)은 제외한 실제 학습 챕터만
export const progressChapters = availableChapters.filter((c) => c.phase >= 1)
