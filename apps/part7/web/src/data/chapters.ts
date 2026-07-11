// 챕터 메타데이터 — 사이드바 목차와 라우터가 공유하는 단일 소스(single source of truth).
// 새 챕터를 추가하려면 여기서 comingSoon 을 제거하고 src/chapters/ 에 대응하는 .vue 를 만든 뒤
// router/index.ts 의 동적 import 에 연결한다. (구성안: 루트 README "7부 챕터 구성안" 표)

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

// 🎯 궁극 목표: "AI가 회사 문서를 아는 것처럼 답하는" 기능 — RAG(검색 증강 생성)·의미 검색·
//    벡터 DB — 의 수학을 이해하고 직접 조립한다. ch10(캡스톤: 사내 FAQ 검색봇)에서 도달.
//    핵심 한 줄: "의미는 위치다 — 가까움을 계산하는 법."
export const chapters: ChapterMeta[] = [
  {
    slug: 'sample',
    phase: 0,
    title: '워밍업 — 비슷한 문장 찾기',
    summary: '사람은 어떻게 "비슷하다"를 아나 — 의미를 지도 위 위치로 보는 첫 경험',
    minutes: 10,
    notebook: 'ch00_sample.ipynb',
  },
  { slug: 'ch1', phase: 1, title: '큰 그림 — 검색의 진화와 RAG', summary: '키워드 검색의 한계 → 의미 검색 → RAG 파이프라인 지도', minutes: 35, comingSoon: true },
  { slug: 'ch2', phase: 2, title: '가까움의 수학 — 코사인 유사도 (핵심)', summary: '유클리드 거리 vs 각도 — 길이가 점수를 오염시키는 문제와 정규화', minutes: 45, comingSoon: true },
  { slug: 'ch3', phase: 3, title: '임베딩 공간 탐험', summary: '의미의 방향과 벡터 연산(왕−남자+여자), 의미 클러스터', minutes: 40, comingSoon: true },
  { slug: 'ch4', phase: 4, title: '고차원의 저주 (핵심)', summary: '차원이 높으면 아무 벡터나 거의 직교 — 그런데도 임베딩이 작동하는 이유', minutes: 45, comingSoon: true },
  { slug: 'ch5', phase: 5, title: '지도 그리기 — 차원 축소', summary: 'PCA 재회 + t-SNE·UMAP 감각 — 2D 지도는 왜곡을 동반한다', minutes: 40, comingSoon: true },
  { slug: 'ch6', phase: 6, title: '이웃 찾기 — kNN에서 벡터 DB까지', summary: '전수조사의 비용 → 근사 최근접 이웃(ANN), 벡터 DB의 정체', minutes: 40, comingSoon: true },
  { slug: 'ch7', phase: 7, title: '청킹과 검색 품질', summary: '문서 쪼개기 트레이드오프, top-k·임계값, recall@k 채점', minutes: 40, comingSoon: true },
  { slug: 'ch8', phase: 8, title: 'RAG 조립 (핵심) — 검색이 프롬프트가 되기까지', summary: '파이프라인 전체 + 실패 모드, RAG vs 파인튜닝 선택 기준', minutes: 45, comingSoon: true },
  { slug: 'ch9', phase: 9, title: '임베딩은 어떻게 배우나 — 대조 학습', summary: '"짝은 가깝게, 남은 멀게" — 그리고 또 −log 손실', minutes: 40, comingSoon: true },
  { slug: 'ch10', phase: 10, title: '🎯 캡스톤 — 사내 FAQ 검색봇', summary: '미니 RAG 전체 조립: 임베딩 → 코사인 → top-k → 답변', minutes: 50, comingSoon: true },
]

export const availableChapters = chapters.filter((c) => !c.comingSoon)

// 학습 진도 산정 대상 — 데모용 샘플(phase 0)은 제외한 실제 학습 챕터만
export const progressChapters = availableChapters.filter((c) => c.phase >= 1)
