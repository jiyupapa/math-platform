// 챕터 메타데이터 — 사이드바 목차와 라우터가 공유하는 단일 소스(single source of truth).
// 새 챕터를 추가하려면 여기서 comingSoon 을 제거하고 src/chapters/ 에 대응하는 .vue 를 만든 뒤
// router/index.ts 의 동적 import 에 연결한다. (구성안: 루트 README "6부 챕터 구성안" 표)

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

// 🎯 궁극 목표: "다음 단어 예측 기계(베이스 모델)가 어떻게 지시를 따르는 비서(ChatGPT)가
//    되는지"를 이해한다 — ch10(캡스톤: 조련 파이프라인 전체 조립)에서 도달.
//    각 챕터는 1~5부에서 배운 수학을 어디서 회수하는지 연결을 포함한다.
export const chapters: ChapterMeta[] = [
  {
    slug: 'sample',
    phase: 0,
    title: '워밍업 — 같은 모델, 다른 대답',
    summary: '베이스 모델 vs 챗 모델의 응답을 나란히 비교하는 맛보기',
    minutes: 10,
    comingSoon: true,
  },
  { slug: 'ch1', phase: 1, title: '큰 그림 — 사전학습에서 비서까지', summary: '사전학습 → SFT → 선호 학습, 3단 파이프라인 지도', minutes: 35, comingSoon: true },
  { slug: 'ch2', phase: 2, title: '이어쓰기 기계의 한계', summary: '베이스 모델이 지시를 못 따르는 이유, 프롬프트 흉내의 한계', minutes: 35, comingSoon: true },
  { slug: 'ch3', phase: 3, title: 'SFT — 시범 보여주기 (핵심)', summary: '지시-응답 데이터로 미세조정 — 결국 같은 크로스 엔트로피 학습', minutes: 45, comingSoon: true },
  { slug: 'ch4', phase: 4, title: '사람의 취향을 숫자로 — 선호 데이터와 보상 모델 (핵심)', summary: 'A/B 선호 쌍, Bradley-Terry 직관, 보상 모델 학습', minutes: 45, comingSoon: true },
  { slug: 'ch5', phase: 5, title: '보상으로 배우기 — 강화학습 최소 직관', summary: '행동·보상·정책 — 보상을 높이는 방향으로의 경사 이동', minutes: 40, comingSoon: true },
  { slug: 'ch6', phase: 6, title: 'RLHF (핵심) — KL 목줄', summary: '보상 최대화 + KL 페널티 — 원본에서 멀어지지 않게 묶는 이유', minutes: 45, comingSoon: true },
  { slug: 'ch7', phase: 7, title: 'DPO — 보상 모델 없이 조련하기', summary: '선호 쌍에서 바로 배우는 지름길, RLHF 와의 득실 비교', minutes: 40, comingSoon: true },
  { slug: 'ch8', phase: 8, title: 'LoRA — 살짝만 조련하기', summary: '거대 행렬을 얼리고 저차원 행렬 두 장만 학습하는 직관', minutes: 40, comingSoon: true },
  { slug: 'ch9', phase: 9, title: '조련 성적표 — 평가와 부작용', summary: '벤치마크, LLM 심판, 과잉 조련(아첨·망각)의 징후', minutes: 35, comingSoon: true },
  { slug: 'ch10', phase: 10, title: '🎯 캡스톤 — 나만의 챗봇 조련', summary: '미니 파이프라인 전체 조립: SFT → 보상 → DPO 시뮬레이션', minutes: 50, comingSoon: true },
]

export const availableChapters = chapters.filter((c) => !c.comingSoon)

// 학습 진도 산정 대상 — 데모용 샘플(phase 0)은 제외한 실제 학습 챕터만
export const progressChapters = availableChapters.filter((c) => c.phase >= 1)
