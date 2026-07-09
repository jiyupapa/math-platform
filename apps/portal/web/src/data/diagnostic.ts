// 입장 진단(배치 테스트) 문항 — 관문 4개 × 3문항(총 12), 수포자 눈높이, 5분 이내.
// 채점은 관문 단위: 정답률 ≥ 0.6 이면 그 관문 '통과'(recommend.ts). 통과 시 해당 학습 단계를 접거나 복습 모드로.
// 정답 위치는 관문마다 흩어 둔다(항상 첫 보기가 정답이면 안 됨).
import type { GateId } from './curriculum'

export interface DiagQuestion {
  id: string
  gate: GateId
  prompt: string
  choices: string[]
  /** 정답 choice 인덱스 */
  answer: number
}

export interface ConfidenceItem {
  id: string
  prompt: string
}

export const questions: DiagQuestion[] = [
  // 관문 1 — 벡터·행렬곱 (1부 전반)
  { id: 'v1', gate: 'vector', prompt: '벡터 (3, 4) 의 길이(크기)는?', choices: ['7', '5', '25', '12'], answer: 1 },
  { id: 'v2', gate: 'vector', prompt: '두 벡터 (1, 0) 과 (0, 1) 의 내적(dot product)은?', choices: ['1', '0', '2', '−1'], answer: 1 },
  { id: 'v3', gate: 'vector', prompt: '행렬을 벡터에 곱하는 것은 기하적으로 무엇에 가장 가깝나?', choices: ['두 벡터를 더한다', '벡터의 길이만 잰다', '공간(벡터)을 회전·확대 등으로 변환한다', '아무 의미 없다'], answer: 2 },

  // 관문 2 — 확률 기초 (3부 전반)
  { id: 'p1', gate: 'prob', prompt: '공정한 주사위를 한 번 굴릴 때 짝수가 나올 확률은?', choices: ['1/3', '1/6', '1/2', '2/3'], answer: 2 },
  { id: 'p2', gate: 'prob', prompt: '조건부 확률 P(A | B) 가 뜻하는 것은?', choices: ['A 와 B 가 동시에 안 일어날 확률', 'B 가 일어났다고 알 때 A 가 일어날 확률', 'A 가 B 보다 클 확률', 'A 와 B 는 무관하다는 뜻'], answer: 1 },
  { id: 'p3', gate: 'prob', prompt: 'LLM 이 "다음 단어"를 정하는 방식에 가장 가까운 것은?', choices: ['사전에서 아무 단어나 무작위로 뽑는다', '후보 단어들의 확률분포에서 고른다', '항상 같은 단어를 되풀이한다', '사람이 매번 직접 정해준다'], answer: 1 },

  // 관문 3 — 미분 (2부)
  { id: 'c1', gate: 'calculus', prompt: '미분(도함수)이 재는 것은?', choices: ['넓이의 총합', '그 지점에서의 순간 변화율(기울기)', '평균값', '최댓값의 개수'], answer: 1 },
  { id: 'c2', gate: 'calculus', prompt: 'f(x) = x² 의 도함수 f′(x) 는?', choices: ['x', '2x', 'x² / 2', '2'], answer: 1 },
  { id: 'c3', gate: 'calculus', prompt: '연쇄법칙(chain rule)은 주로 무엇을 미분할 때 쓰나?', choices: ['두 수의 덧셈', '상수', '함수 안에 함수가 든 합성함수', '넓이'], answer: 2 },

  // 관문 4 — log 감각 (5부 최대 장벽, 2부 7장)
  { id: 'l1', gate: 'log', prompt: 'log₂(8) 의 값은?', choices: ['8', '2', '3', '4'], answer: 2 },
  { id: 'l2', gate: 'log', prompt: 'log 를 직관적으로 보면 무엇을 재는 도구에 가깝나?', choices: ['두 수의 차이', '"몇 자리 수인가 / 몇 배 규모인가"(곱셈을 덧셈으로)', '원의 넓이', '확률의 합'], answer: 1 },
  { id: 'l3', gate: 'log', prompt: '확률 p 가 작을수록 놀람(정보량) log(1/p) 는?', choices: ['작아진다', '커진다', '변하지 않는다', '항상 0 이다'], answer: 1 },
]

export const confidenceItems: ConfidenceItem[] = [
  { id: 'overall', prompt: '수학 전반에 얼마나 자신이 있나요?' },
  { id: 'symbols', prompt: '수식·기호(∑, log, 벡터 표기 등)를 보면 얼마나 편한가요?' },
]
