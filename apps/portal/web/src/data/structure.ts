// 학습 구조도(스윔레인 보드) 배치 데이터 — /map (StructureView) 전용.
// 참조 형식: 열(게이트) = 학습 국면, 행(레인) = 트랙, 셀 = 단계 노드, 실선 = 필수 흐름,
// 점선 = 선택 분기 진입. 노드 = curriculum.ts pathSteps(11단계) + 특수 노드(진단·완주).
// 진입 조건 정본: 루트 README "추천 학습 경로" — 7부는 1단계 직후, 8·9부는 4단계(2부) 이후.

export interface BoardColumn {
  id: string
  title: string
  sub: string
}

export interface BoardLane {
  id: 'core' | 'deep' | 'prac'
  title: string
  /** 선택 트랙 레인 — "핵심 흐름" 모드에서 숨김 */
  optional?: boolean
}

export interface BoardNode {
  id: string
  col: string
  lane: BoardLane['id']
  /** pathSteps.order 연결 — 없으면 특수 노드(진단/완주) */
  stepOrder?: number
  /** 특수 노드용 제목/부제 */
  title?: string
  sub?: string
  /** 상세 패널에 보여줄 진입(선수) 조건 */
  prereqText?: string
}

export interface BoardEdge {
  from: string
  to: string
  /** flow = 필수 흐름(실선) · entry = 선택 분기 진입(점선) */
  kind: 'flow' | 'entry'
}

export const columns: BoardColumn[] = [
  { id: 'c0', title: '진단', sub: '출발점 측정' },
  { id: 'c1', title: '토대 I', sub: '벡터 · 확률' },
  { id: 'c2', title: '조립 I', sub: 'LLM 추론' },
  { id: 'c3', title: '토대 II', sub: '미분' },
  { id: 'c4', title: '조립 II', sub: '학습 원리' },
  { id: 'c5', title: '본체', sub: '정보이론' },
  { id: 'c6', title: '조련', sub: '사후 학습' },
  { id: 'c7', title: '확장 · 완주', sub: '선택 분기' },
]

export const lanes: BoardLane[] = [
  { id: 'core', title: '필수 경로' },
  { id: 'deep', title: '선택 · 심화', optional: true },
  { id: 'prac', title: '선택 · 실용', optional: true },
]

export const nodes: BoardNode[] = [
  { id: 'diagnose', col: 'c0', lane: 'core', title: '경로 진단', sub: '12문항 · 5분 — 아는 만큼 경로가 짧아진다' },
  { id: 'step1', col: 'c1', lane: 'core', stepOrder: 1 },
  { id: 'step2', col: 'c1', lane: 'core', stepOrder: 2 },
  { id: 'step3', col: 'c2', lane: 'core', stepOrder: 3 },
  { id: 'step4', col: 'c3', lane: 'core', stepOrder: 4 },
  { id: 'step5', col: 'c4', lane: 'core', stepOrder: 5 },
  { id: 'step6', col: 'c5', lane: 'core', stepOrder: 6 },
  { id: 'step7', col: 'c6', lane: 'core', stepOrder: 7 },
  { id: 'finish', col: 'c7', lane: 'core', title: '🎓 핵심 경로 완주', sub: 'ChatGPT의 원리를 아는 사람' },
  { id: 'step8', col: 'c7', lane: 'deep', stepOrder: 8, prereqText: '1단계(1부 전반) + 2단계(3부 전반)를 마치면 언제든' },
  { id: 'step10', col: 'c7', lane: 'deep', stepOrder: 10, prereqText: '4단계(2부 미분) 직후 언제든 — 6부를 봤다면 더 잘 읽힘' },
  { id: 'step9', col: 'c7', lane: 'prac', stepOrder: 9, prereqText: '1단계(1부 전반)만 마치면 언제든 — 진입 장벽 최저' },
  { id: 'step11', col: 'c7', lane: 'prac', stepOrder: 11, prereqText: '4단계(2부) 이후 권장(핵심은 2부 7장 log 감각) — 6부 뒤 재방문하면 완성' },
]

export const edges: BoardEdge[] = [
  { from: 'diagnose', to: 'step1', kind: 'flow' },
  { from: 'diagnose', to: 'step2', kind: 'flow' },
  { from: 'step1', to: 'step3', kind: 'flow' },
  { from: 'step2', to: 'step3', kind: 'flow' },
  { from: 'step3', to: 'step4', kind: 'flow' },
  { from: 'step4', to: 'step5', kind: 'flow' },
  { from: 'step5', to: 'step6', kind: 'flow' },
  { from: 'step6', to: 'step7', kind: 'flow' },
  { from: 'step7', to: 'finish', kind: 'flow' },
  { from: 'step1', to: 'step9', kind: 'entry' },
  // S8 진입은 S1+S2 둘 다 필요하지만, 같은 지점으로 들어가는 점선 두 가닥이 겹치면
  // 실선처럼 보여 한 가닥(더 늦은 선수인 S2)만 그린다 — 두 조건은 prereqText 에 명시.
  { from: 'step2', to: 'step8', kind: 'entry' },
  { from: 'step4', to: 'step10', kind: 'entry' },
  { from: 'step4', to: 'step11', kind: 'entry' },
]
