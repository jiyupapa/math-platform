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
  /** 대응하는 노트북 파일명 (notebooks/) — 없으면 생략 */
  notebook?: string
  /** 아직 콘텐츠가 없는 예정 챕터면 true */
  comingSoon?: boolean
  /** 예상 학습 소요시간 (분) — 목차에 배지로 표시, 포털 경로 요약 합산에 사용 */
  minutes?: number
}

// 🎯 궁극 목표: "LLM의 트랜스포머를 이해한다" — ch10(전체 조립)에서 도달.
//    모든 챕터는 그 개념이 트랜스포머/LLM 안에서 어디에 쓰이는지 연결을 포함한다.
export const chapters: ChapterMeta[] = [
  {
    slug: 'sample',
    phase: 0,
    title: '샘플 챕터 — 소프트맥스 맛보기',
    summary: 'Phase 0 패턴 검증용. 모든 공통 컴포넌트를 한 화면에서 보여줍니다.',
    notebook: 'ch00_sample.ipynb',
    minutes: 10,
  },
  { slug: 'ch1', phase: 1, title: '트랜스포머 큰 그림', summary: 'LLM은 "다음 단어 맞히기" 게임이다', notebook: 'ch01_big_picture.ipynb', minutes: 30 },
  { slug: 'ch2', phase: 2, title: '토큰화 — 글을 조각으로', summary: '문장을 토큰으로 쪼개 숫자 ID로', notebook: 'ch02_tokenization.ipynb', minutes: 35 },
  { slug: 'ch3', phase: 3, title: '임베딩 — 단어를 벡터로', summary: '의미를 좌표(숫자 벡터)로 바꾸기', notebook: 'ch03_embedding.ipynb', minutes: 45 },
  { slug: 'ch4', phase: 4, title: '위치 인코딩', summary: '순서 정보를 더해주기', notebook: 'ch04_positional.ipynb', minutes: 35 },
  { slug: 'ch5', phase: 5, title: '어텐션의 직관', summary: '"어디에 집중할까"를 배우다', notebook: 'ch05_attention_intuition.ipynb', minutes: 40 },
  { slug: 'ch6', phase: 6, title: 'Q·K·V와 셀프 어텐션 (핵심)', summary: '질문·열쇠·값으로 관계 계산', notebook: 'ch06_qkv_attention.ipynb', minutes: 50 },
  { slug: 'ch7', phase: 7, title: '멀티헤드 어텐션', summary: '여러 관점으로 동시에 보기', notebook: 'ch07_multihead.ipynb', minutes: 40 },
  { slug: 'ch8', phase: 8, title: '트랜스포머 블록', summary: '잔차연결·층정규화·피드포워드', notebook: 'ch08_transformer_block.ipynb', minutes: 45 },
  { slug: 'ch9', phase: 9, title: '출력층 — 다음 단어 예측', summary: 'logits를 소프트맥스로 확률화', notebook: 'ch09_output_layer.ipynb', minutes: 40 },
  { slug: 'ch10', phase: 10, title: '🎯 전체 조립 — GPT가 글을 쓰는 법', summary: '모든 조각을 이어 문장 생성', notebook: 'ch10_full_assembly.ipynb', minutes: 50 },
  // --- 심화 확장 ---
  { slug: 'ch11', phase: 11, title: '학습 — 손실과 경사하강', summary: '트랜스포머는 어떻게 똑똑해지나', notebook: 'ch11_training.ipynb', minutes: 45 },
  { slug: 'ch12', phase: 12, title: '샘플링 — temperature·top-k·top-p', summary: '다음 단어를 고르는 다양한 방법', notebook: 'ch12_sampling.ipynb', minutes: 40 },
]

export const availableChapters = chapters.filter((c) => !c.comingSoon)
