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
}

export const chapters: ChapterMeta[] = [
  {
    slug: 'sample',
    phase: 0,
    title: '워밍업 — 스무고개, 질문 하나의 가치',
    summary: '정보 = 줄어드는 불확실성. 좋은 질문 하나가 후보를 절반으로 줄이는 걸 게임으로 체험해요.',
    minutes: 10,
    notebook: 'ch00_sample.ipynb',
  },
  { slug: 'ch1', phase: 1, title: '놀람의 크기 — 정보를 숫자로 재다', summary: '놀람 I = log₂(1/p), 비트 — log 를 게임으로 재도입', minutes: 35, notebook: 'ch01_surprise.ipynb' },
  { slug: 'ch2', phase: 2, title: '아껴 쓰는 비트 — 압축의 원리', summary: '자주 나오면 짧게(허프만 직관), 압축의 한계', minutes: 35, notebook: 'ch02_compression.ipynb' },
  { slug: 'ch3', phase: 3, title: '엔트로피 (핵심)', summary: '평균 놀람 H — 모델 예측의 "자신 없음"을 재는 자', minutes: 45, notebook: 'ch03_entropy.ipynb' },
  { slug: 'ch4', phase: 4, title: '크로스 엔트로피 (핵심)', summary: '틀린 지도로 세상을 부호화한 비용 — LLM 손실함수의 정체', minutes: 45, notebook: 'ch04_cross_entropy.ipynb' },
  { slug: 'ch5', phase: 5, title: 'KL 발산 (핵심)', summary: '초과 비트 D(p‖q) 와 비대칭성 — RLHF 페널티·증류', minutes: 40, notebook: 'ch05_kl_divergence.ipynb' },
  { slug: 'ch6', phase: 6, title: 'AI 학습의 정체 — 흉내내기의 수학', summary: '훈련 = 데이터 분포와 모델 분포의 KL 최소화', minutes: 35, notebook: 'ch06_learning_as_kl.ipynb' },
  { slug: 'ch7', phase: 7, title: '퍼플렉시티 — LLM 의 성적표', summary: '2^(크로스 엔트로피) = 평균 몇 갈래에서 고민하나', minutes: 35, notebook: 'ch07_perplexity.ipynb' },
  { slug: 'ch8', phase: 8, title: 'temperature — 창의성 다이얼의 정체', summary: '소프트맥스 온도 = 분포의 엔트로피 조절기', minutes: 35, notebook: 'ch08_temperature.ipynb' },
  { slug: 'ch9', phase: 9, title: '문맥의 가치 — 조건부 엔트로피·상호정보량', summary: '알면 줄어드는 불확실성 — 어텐션 직관 보강', minutes: 45, notebook: 'ch09_conditional_mutual.ipynb' },
  { slug: 'ch10', phase: 10, title: '🎓 캡스톤 — 손실함수를 갈아 끼우다', summary: 'MSE → 크로스 엔트로피 교체 + 문자 언어모델 퍼플렉시티 (시리즈 대단원)', minutes: 45, notebook: 'ch10_capstone.ipynb' },
]

export const availableChapters = chapters.filter((c) => !c.comingSoon)

// 학습 진도 산정 대상 — 데모용 샘플(phase 0)은 제외한 실제 학습 챕터만
export const progressChapters = availableChapters.filter((c) => c.phase >= 1)
