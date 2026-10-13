// 부 고유색 — README 부록·각 부 헤더 띠와 같은 색. 개념 지도(ConceptsView)·비유어 사전(GlossaryView)이 공유.
// Tailwind 가 소스에서 클래스를 찾도록 문자열을 그대로 둔다(동적 조합 금지).
export interface PartStyle {
  name: string
  /** 부 번호 칩 */
  chip: string
  /** 개념 노드 기본 */
  node: string
  /** 아는 개념(정의처 장 완료) — 부 색 700 으로 꽉 채움(+✓). 연한 칠·진한 테두리는 '지금 배울 수 있음' ring 과 구별이 안 됐다 */
  done: string
  /** 지금 배울 수 있음 ring 색 — 600(400·500 은 sky·cyan·amber·teal·orange 에서 흰 보드 대비 3:1 미달, 다크에선 400 으로 반전) */
  ring: string
}

export const PART_STYLE: Record<number, PartStyle> = {
  1: { name: '선형대수학', chip: 'bg-sky-100 text-sky-800', node: 'border-sky-200 bg-sky-50 text-sky-900', done: 'border-sky-700 bg-sky-700 text-white', ring: 'ring-sky-600' },
  2: { name: '미분', chip: 'bg-blue-100 text-blue-800', node: 'border-blue-200 bg-blue-50 text-blue-900', done: 'border-blue-700 bg-blue-700 text-white', ring: 'ring-blue-600' },
  3: { name: '확률과 통계', chip: 'bg-cyan-100 text-cyan-800', node: 'border-cyan-200 bg-cyan-50 text-cyan-900', done: 'border-cyan-700 bg-cyan-700 text-white', ring: 'ring-cyan-600' },
  4: { name: '트랜스포머', chip: 'bg-indigo-100 text-indigo-800', node: 'border-indigo-200 bg-indigo-50 text-indigo-900', done: 'border-indigo-700 bg-indigo-700 text-white', ring: 'ring-indigo-600' },
  5: { name: '정보이론', chip: 'bg-violet-100 text-violet-800', node: 'border-violet-200 bg-violet-50 text-violet-900', done: 'border-violet-700 bg-violet-700 text-white', ring: 'ring-violet-600' },
  6: { name: 'LLM 조련', chip: 'bg-amber-100 text-amber-800', node: 'border-amber-200 bg-amber-50 text-amber-900', done: 'border-amber-700 bg-amber-700 text-white', ring: 'ring-amber-600' },
  7: { name: '임베딩 기하학', chip: 'bg-teal-100 text-teal-800', node: 'border-teal-200 bg-teal-50 text-teal-900', done: 'border-teal-700 bg-teal-700 text-white', ring: 'ring-teal-600' },
  8: { name: '최적화', chip: 'bg-purple-100 text-purple-800', node: 'border-purple-200 bg-purple-50 text-purple-900', done: 'border-purple-700 bg-purple-700 text-white', ring: 'ring-purple-600' },
  9: { name: '수치 계산', chip: 'bg-orange-100 text-orange-800', node: 'border-orange-200 bg-orange-50 text-orange-900', done: 'border-orange-700 bg-orange-700 text-white', ring: 'ring-orange-600' },
  10: { name: '스케일링과 평가', chip: 'bg-pink-100 text-pink-800', node: 'border-pink-200 bg-pink-50 text-pink-900', done: 'border-pink-700 bg-pink-700 text-white', ring: 'ring-pink-600' },
  11: { name: '에이전트와 추론', chip: 'bg-fuchsia-100 text-fuchsia-800', node: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900', done: 'border-fuchsia-700 bg-fuchsia-700 text-white', ring: 'ring-fuchsia-600' },
  12: { name: '시스템 다이내믹스', chip: 'bg-green-100 text-green-800', node: 'border-green-200 bg-green-50 text-green-900', done: 'border-green-700 bg-green-700 text-white', ring: 'ring-green-600' },
}

export const PARTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
