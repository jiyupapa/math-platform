// 챕터 메타데이터 — 사이드바 목차와 라우터가 공유하는 단일 소스(single source of truth).
// 새 챕터를 추가하려면 여기서 comingSoon 을 제거하고 src/chapters/ 에 대응하는 .vue 를 만든 뒤
// router/index.ts 의 동적 import 에 연결한다. (구성안: 루트 README "11부 챕터 구성" 표)

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

// 🎯 궁극 목표: "AI에게 다단계 업무를 맡기면 어디까지 믿을 수 있나"를 확률의 산수로 계산하는
//    눈 — 한 걸음의 정확도(확률)가 일의 성공률(곱)이 되고, 다시 뽑기·다수결·검수(베이즈)가
//    그 곱을 되살리는 과정을 직접 조작한다. ch12(캡스톤: 이 에이전트, 도입해도 되나)에서 도달.
//    3부 4장(조건부 확률·베이즈)의 정면 회수처이자 10부(평가 통계)의 속편 — 실용·전략 트랙.
//    핵심 한 줄: "일의 성공률은 걸음의 곱이고, 되살리는 길은 다시 뽑기·다수결·검수다."
//    분량 방침: 줄이지 않는다 — 자세한 설명을 위한 확장 환영.
export const chapters: ChapterMeta[] = [
  {
    slug: 'sample',
    phase: 0,
    title: '워밍업 — 한 번은 맞히는데 열 번은 못 맞힌다',
    summary: '정확도 90% AI에게 10단계 일을 맡기면 성공률 35% — 사슬 붕괴를 직접 목격',
    minutes: 25,
    notebook: 'ch00_sample.ipynb',
  },
  { slug: 'ch1', phase: 1, title: '큰 그림 — 챗봇에서 에이전트로', summary: '한 턴 응답 vs 다단계 과업: 상태·행동·도구·루프, 11부 여정표', minutes: 30, notebook: 'ch01_bigpicture.ipynb' },
  { slug: 'ch2', phase: 2, title: '징검다리 — 사슬의 수학 (핵심)', summary: '일의 성공률 = 걸음의 곱 — 병목 단계 찾기, 로그로 곱을 합으로 펴기', minutes: 40, notebook: 'ch02_chain.ipynb' },
  { slug: 'ch3', phase: 3, title: '도구를 드는 손 — 도구 호출', summary: '언제 검색·계산기를 쓰나 = 분류 확률 — 호출 신뢰도와 임계값의 저울질', minutes: 35, notebook: 'ch03_tools.ipynb' },
  { slug: 'ch4', phase: 4, title: '다시 뽑기 — 재시도와 Best-of-N', summary: '성공까지 몇 번 뽑아야 하나(기하분포), N번 중 한 번이라도 = 1−(1−p)^N, 뽑기 비용', minutes: 40, notebook: 'ch04_retry.ipynb' },
  { slug: 'ch5', phase: 5, title: '다수결 회의 — self-consistency', summary: '여러 답을 뽑아 투표 — 이항 다수결의 힘과 상관된 오류의 함정', minutes: 35, notebook: 'ch05_vote.ipynb' },
  { slug: 'ch6', phase: 6, title: '검수자 — verifier와 베이즈 (핵심)', summary: '검수 통과한 답이 진짜 맞을 확률 — 민감도·특이도·기저율의 역설, 3부 4장의 실전 복귀', minutes: 45, notebook: 'ch06_verifier.ipynb' },
  { slug: 'ch7', phase: 7, title: '생각의 길이 — 추론 시점 컴퓨트', summary: '더 오래(직렬) vs 더 많이(병렬) — 추론 스케일링 곡선과 토큰 비용의 저울', minutes: 40, notebook: 'ch07_thinking.ipynb' },
  { slug: 'ch8', phase: 8, title: '갈림길 지도 — 탐색과 계획', summary: '트리·분기 계수·지수 폭발 — 탐욕 vs 빔 vs 되추적, 미리 가보는 값어치', minutes: 40, notebook: 'ch08_search.ipynb' },
  { slug: 'ch9', phase: 9, title: '여럿이 하기 — 멀티에이전트 협업', summary: '분업 = 사슬의 병렬화, 합의의 함정 = 상관된 오류 — 검토자 분리의 수학', minutes: 35, notebook: 'ch09_team.ipynb' },
  { slug: 'ch10', phase: 10, title: '기억의 경제학 — 컨텍스트 예산', summary: '책상 위 서류 더미 — 무엇을 넣고 뺄까, 요약 = 압축과 정보 손실', minutes: 35, notebook: 'ch10_context.ipynb' },
  { slug: 'ch11', phase: 11, title: '에이전트의 성적표', summary: 'pass@k 공식과 궤적 평가 — 오차범위·다중 비교가 에이전트 무대로 재등판', minutes: 40, notebook: 'ch11_scorecard.ipynb' },
  { slug: 'ch12', phase: 12, title: '🎯 캡스톤 — 이 에이전트, 도입해도 되나', summary: '가상 에이전트 제품 자료 감정: 사슬 검산 + pass@k 해석 + 비용 계산 → 도입 판정서', minutes: 45, notebook: 'ch12_capstone.ipynb' },
]

export const availableChapters = chapters.filter((c) => !c.comingSoon)

// 학습 진도 산정 대상 — 데모용 샘플(phase 0)은 제외한 실제 학습 챕터만
export const progressChapters = availableChapters.filter((c) => c.phase >= 1)
