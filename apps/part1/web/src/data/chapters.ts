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
  /** 예상 학습 소요시간 (분) — 목차에 배지로 표시 */
  minutes?: number
  /** 대응하는 노트북 파일명 (notebooks/) — 없으면 생략 */
  notebook?: string
  /** 심화 트랙이면 true — AI(트랜스포머) 이해에 필수는 아닌 교양·심화. 목차에 배지로 표시 */
  advanced?: boolean
}

export const chapters: ChapterMeta[] = [
  {
    slug: 'sample',
    phase: 0,
    title: '워밍업 — 벡터 맛보기',
    summary: '5분 몸풀기. 설명 카드·그래프·문제 풀이가 어떻게 진행되는지 가볍게 체험해요.',
    minutes: 5,
    notebook: 'ch00_sample.ipynb',
  },
  { slug: 'ch1', phase: 1, title: '좌표와 벡터란 무엇인가', summary: '평면 위의 화살표로 시작하기', minutes: 30, notebook: 'ch01_coordinates_vectors.ipynb' },
  { slug: 'ch2', phase: 2, title: '벡터 연산', summary: '덧셈·스칼라배·내적', minutes: 50, notebook: 'ch02_vector_operations.ipynb' },
  { slug: 'ch3', phase: 3, title: '행렬과 행렬 연산', summary: '숫자 표로 보는 행렬', minutes: 40, notebook: 'ch03_matrices.ipynb' },
  { slug: 'ch4', phase: 4, title: '연립방정식과 가우스 소거법', summary: '직선의 교점 찾기', minutes: 60, notebook: 'ch04_linear_systems.ipynb' },
  { slug: 'ch5', phase: 5, title: '선형변환 (핵심)', summary: '공간을 변형하는 함수', minutes: 45, notebook: 'ch05_linear_transformations.ipynb' },
  { slug: 'ch6', phase: 6, title: '행렬식과 역행렬', summary: '넓이 배율과 가역성', minutes: 35, notebook: 'ch06_determinant_inverse.ipynb' },
  // --- 심화 트랙 (트랜스포머 이해에 필수는 아님 — 4부까지 마친 뒤 돌아와도 좋다) ---
  { slug: 'ch7', phase: 7, title: '고유값과 고유벡터', summary: '변환에도 안 꺾이는 축', minutes: 40, notebook: 'ch07_eigen.ipynb', advanced: true },
  { slug: 'ch8', phase: 8, title: '응용 (PCA 등)', summary: '데이터 구름에서 주성분 찾기', minutes: 35, notebook: 'ch08_pca.ipynb', advanced: true },
  { slug: 'ch9', phase: 9, title: '기저·차원·계수(rank)', summary: '벡터가 진짜 몇 차원어치 정보인가', minutes: 45, notebook: 'ch09_basis_rank.ipynb', advanced: true },
  { slug: 'ch10', phase: 10, title: '직교성과 투영', summary: '가장 가까운 답 = 투영 (최소제곱의 원리)', minutes: 40, notebook: 'ch10_projection.ipynb', advanced: true },
  { slug: 'ch11', phase: 11, title: '특이값분해 (SVD)', summary: '추천과 차원 축소에 쓰는 ML의 핵심 분해', minutes: 45, notebook: 'ch11_svd.ipynb', advanced: true },
  { slug: 'ch12', phase: 12, title: '그래디언트와 행렬미분', summary: 'AI가 배우는 원리, 경사하강과 역전파', minutes: 45, notebook: 'ch12_gradient.ipynb', advanced: true },
]

export const availableChapters = chapters.filter((c) => !c.comingSoon)

// 학습 진도 산정 대상 — 데모용 샘플(phase 0)은 제외한 실제 학습 챕터만
export const progressChapters = availableChapters.filter((c) => c.phase >= 1)
