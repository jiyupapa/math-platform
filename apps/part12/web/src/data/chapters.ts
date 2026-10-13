// 챕터 메타데이터 — 사이드바 목차와 라우터가 공유하는 단일 소스(single source of truth).
// 새 챕터를 추가하려면 여기서 comingSoon 을 제거하고 src/chapters/ 에 대응하는 .vue 를 만든 뒤
// router/index.ts 의 동적 import 에 연결한다. (구성안: 루트 README "12부 챕터 구성" 표)

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

// 🎯 궁극 목표: "들이고 나면 시간이 지나며 무슨 일이 벌어지나"를 저량·유량·피드백 루프로 직접
//    시뮬레이션하는 눈. 쌓이는 것(저량)과 흐르는 것(유량), 돌아오는 고리(강화·균형 루프)와 지연이
//    시간의 모양(지수 성장·목표 추구·S자·출렁임)을 만든다는 것을 조작하며 익히고, 경사하강·EMA·
//    시그모이드가 같은 수학이라는 것까지 확인한다. ch12(캡스톤: 사내 AI 도입 모형)에서 도달.
//    시리즈에 없던 적분·미분방정식·시간에 따른 변화의 자리 — 전략 트랙.
//    핵심 한 줄: "쌓인 것은 흐름으로만 바뀌고, 흐름은 쌓인 것을 보고 정해진다."
//    분량 방침: 줄이지 않는다 — 자세한 설명을 위한 확장 환영.
export const chapters: ChapterMeta[] = [
  {
    slug: 'sample',
    phase: 0,
    title: '워밍업 — 들어오는 게 줄었는데 왜 계속 늘까',
    summary: '신규 가입이 정점을 지났는데 사용자 수는 왜 계속 늘까, 욕조 문제로 누적 감각 깨우기',
    minutes: 25,
    notebook: 'ch00_sample.ipynb',
  },
  { slug: 'ch1', phase: 1, title: '큰 그림 — 시간의 모양을 만드는 네 부품', summary: '저량·유량·피드백 루프·지연 네 부품과 행동 패턴 네 가지, 12부 안내도', minutes: 30, notebook: 'ch01_bigpicture.ipynb' },
  { slug: 'ch2', phase: 2, title: '욕조의 수학 — 저량과 유량 (핵심)', summary: '저량은 순유량의 누적(면적), 단위로 구별하기, 미분을 거꾸로 읽는 적분 감각', minutes: 40, notebook: 'ch02_stockflow.ipynb' },
  { slug: 'ch3', phase: 3, title: '눈덩이 — 강화 루프와 지수 성장', summary: '커질수록 더 빨리 커지는 고리, 복리와 두 배 시간(70의 법칙), 로그 눈금의 직선', minutes: 35, notebook: 'ch03_reinforcing.ipynb' },
  { slug: 'ch4', phase: 4, title: '온도 조절기 — 균형 루프와 목표 추구', summary: '격차를 메우는 고리, 조정 시간과 시간 상수, 경사하강이 바로 이 고리', minutes: 35, notebook: 'ch04_balancing.ipynb' },
  { slug: 'ch5', phase: 5, title: '시간을 잘게 썰기 — 오일러법과 시간 간격 (핵심)', summary: '시뮬레이터가 미래를 계산하는 법, 간격이 크면 가짜 출렁임과 발산, 학습률 = 시간 간격', minutes: 45, notebook: 'ch05_euler.ipynb' },
  { slug: 'ch6', phase: 6, title: '늦게 오는 소식 — 지연과 출렁임 (핵심)', summary: '샤워기 온도 맞추기, 지연이 만드는 과잉 교정과 출렁임, EMA = 1차 지연', minutes: 45, notebook: 'ch06_delay.ipynb' },
  { slug: 'ch7', phase: 7, title: '커지다 멈추는 성장 — S자 곡선과 지배 루프', summary: '강화와 균형이 만나면 S자, 수용 한계와 지배 루프의 전환, 로지스틱 = 시그모이드', minutes: 40, notebook: 'ch07_scurve.ipynb' },
  { slug: 'ch8', phase: 8, title: '공은 어디서 멈출까 — 평형과 안정성', summary: '유입과 유출이 같아지는 평형, 안정과 불안정, 저량 두 개가 만드는 나선', minutes: 40, notebook: 'ch08_equilibrium.ipynb' },
  { slug: 'ch9', phase: 9, title: '그림만 보면 틀린다 — 인과지도의 규칙과 함정', summary: '화살표 극성과 루프 판별, 저량 누락과 같은 그림·다른 행동의 함정', minutes: 40, notebook: 'ch09_cld.ipynb' },
  { slug: 'ch10', phase: 10, title: '되풀이되는 이야기 — 시스템 원형', summary: '성장의 한계·문제 전가·실패하는 처방 같은 판박이 구조와 어디를 건드릴지', minutes: 40, notebook: 'ch10_archetypes.ipynb' },
  { slug: 'ch11', phase: 11, title: 'AI가 만드는 고리 — 모델 붕괴·보상 해킹·플라이휠', summary: '합성 데이터로 다시 배우면 꼬리가 사라진다, 측정치를 쫓는 고리, 플라이휠의 한계', minutes: 40, notebook: 'ch11_ailoops.ipynb' },
  { slug: 'ch12', phase: 12, title: '🎯 캡스톤 — 사내 AI 도입, 모형으로 미리 돌려 보기', summary: '가상 회사의 AI 도입을 Bass 모형으로 돌려 보고 홍보·입소문·이탈 방지 다이얼로 전략 판정서 쓰기', minutes: 45, notebook: 'ch12_capstone.ipynb' },
]

export const availableChapters = chapters.filter((c) => !c.comingSoon)

// 학습 진도 산정 대상 — 데모용 샘플(phase 0)은 제외한 실제 학습 챕터만
export const progressChapters = availableChapters.filter((c) => c.phase >= 1)
