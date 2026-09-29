// 챕터 메타데이터 — 사이드바 목차와 라우터가 공유하는 단일 소스(single source of truth).
// 새 챕터를 추가하려면 여기서 comingSoon 을 제거하고 src/chapters/ 에 대응하는 .vue 를 만든 뒤
// router/index.ts 의 동적 import 에 연결한다. (구성안: 루트 README "10부 챕터 구성" 표)

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

// 🎯 궁극 목표: "신모델이 벤치마크에서 2점 앞섰다"는 뉴스·리더보드·모델 카드를 숫자로 판별하는
//    눈 — 키우면 왜/얼마나 좋아지는지(멱법칙·Chinchilla)와 그 점수 차이가 진짜인지(오차범위·검정)를
//    스스로 계산한다. ch10(캡스톤: AI 뉴스 팩트체크 — 스케일링 주장 검산 + 유의성 판정)에서 도달.
//    시리즈에서 유일하게 회수되지 않던 3부 8~10장(추정·검정·상관) 심화 트랙의 회수처이자
//    6부 9장(조련 성적표)의 정식 심화판 — 평가·전략 트랙.
//    핵심 한 줄: "성장은 로그-로그 위의 직선이고, 점수 차이는 오차범위 안에선 소음이다."
//    분량 방침: 줄이지 않는다 — 자세한 설명을 위한 확장 환영.
export const chapters: ChapterMeta[] = [
  {
    slug: 'sample',
    phase: 0,
    title: '워밍업 — 2점 차이의 진실',
    summary: '문항 수를 바꾸면 두 모델의 벤치마크 순위가 뒤집힌다, "점수는 측정이다"를 직접 확인',
    minutes: 25,
    notebook: 'ch00_sample.ipynb',
  },
  { slug: 'ch1', phase: 1, title: '큰 그림 — 키우면 좋아진다, 그런데 얼마나?', summary: '훈련의 3재료(파라미터 N·데이터 D·컴퓨트 C) 지도, 성장의 법칙과 시험의 통계로 보는 10부 안내도', minutes: 30, notebook: 'ch01_bigpicture.ipynb' },
  { slug: 'ch2', phase: 2, title: '곱의 세계 — 로그 눈금과 멱법칙 (핵심)', summary: '10배씩 뛰는 축에서 직선이 되는 y = a·xᵇ, 로그-로그 종이와 기울기가 말하는 것', minutes: 40, notebook: 'ch02_loglog.ipynb' },
  { slug: 'ch3', phase: 3, title: '손실의 직선 — 스케일링 법칙', summary: '미니 LM으로 데이터·크기를 늘리며 손실 실측 → 로그-로그 직선과 수확 체감', minutes: 40, notebook: 'ch03_powerlaw.ipynb' },
  { slug: 'ch4', phase: 4, title: '몸집과 밥의 황금비 — Chinchilla (핵심)', summary: '예산 C ≈ 6ND를 고정하면 N↔D 배분 곡선에 최저점이 생긴다, 과체격 모델 이야기', minutes: 45, notebook: 'ch04_chinchilla.ipynb' },
  { slug: 'ch5', phase: 5, title: '창발일까 착시일까', summary: '능력이 계단처럼 튀는 사례, 지표를 바꾸면 완만해지는 "창발 논쟁"을 직접 재현', minutes: 35, notebook: 'ch05_emergence.ipynb' },
  { slug: 'ch6', phase: 6, title: '시험의 오차범위 (핵심)', summary: '벤치마크도 표본이다, 정확도의 신뢰구간(여론조사 ±3.1%p의 그 수학)과 문항 수에 따른 ±폭', minutes: 45, notebook: 'ch06_interval.ipynb' },
  { slug: 'ch7', phase: 7, title: '차이가 진짜일까 — 두 모델 비교', summary: '2점 차이가 유의한지 가리기, 같은 문항으로 짝지은 비교(paired)로 문항 수를 아끼는 이유와 p값 다시 쓰기', minutes: 45, notebook: 'ch07_abtest.ipynb' },
  { slug: 'ch8', phase: 8, title: '기출 유출 — 오염과 벤치마크의 수명', summary: '오염(contamination), 훈련 데이터에 시험 문제가 섞이면 생기는 일과 점수 급등의 의심 목록', minutes: 35, notebook: 'ch08_contamination.ipynb' },
  { slug: 'ch9', phase: 9, title: 'AI 채점관의 성적표 — LLM 심판', summary: 'LLM-as-judge의 위치·길이·자기 선호 편향 실측, 심판 간 일치도와 사람 채점과의 상관', minutes: 40, notebook: 'ch09_judge.ipynb' },
  { slug: 'ch10', phase: 10, title: '🎯 캡스톤 — AI 뉴스 팩트체크', summary: '가상 신모델 발표를 읽고 스케일링 주장 검산(6ND), 점수 차 유의성 판정, 도입 결론까지', minutes: 45, notebook: 'ch10_capstone.ipynb' },
]

export const availableChapters = chapters.filter((c) => !c.comingSoon)

// 학습 진도 산정 대상 — 데모용 샘플(phase 0)은 제외한 실제 학습 챕터만
export const progressChapters = availableChapters.filter((c) => c.phase >= 1)
