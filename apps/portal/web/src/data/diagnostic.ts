// 입장 진단(배치 테스트) 문항 — 관문 4개 × 3문항(총 12), 수포자 눈높이, 5분 이내.
// 채점은 관문 단위: 정답률 ≥ 0.6 이면 그 관문 '통과'(recommend.ts). 통과 시 해당 학습 단계를 접거나 복습 모드로.
// 정답 위치(2026-09-29 재배치): 관문 안의 세 문항은 서로 다른 위치, 전체로는 네 위치에 3개씩.
//   그래서 "늘 같은 번호를 고르는" 전략은 관문마다 1/3(< 0.6)만 맞혀 어느 관문도 통과하지 못한다.
//   예전 배치는 두 번째 보기가 12개 중 8개라, 두 번째만 고르면 4관문 전부 통과(1부·3부 전반 건너뛰기)였다.
// ⚠ 저장되는 답은 보기 "번호"다(useDiagnosis.ts). 보기 순서를 바꾸면 ANSWER_FORMAT 을 올리고
//   LEGACY_ANSWER_SWAPS 처럼 옛 번호 → 새 번호 표를 남길 것 — 안 그러면 이미 저장된 진단·학습 전 기준선이 엉뚱하게 채점된다.
// concepts — 이 문항이 재는 개념(온톨로지 id, scripts/ontology/concepts.json). 관문 판정은 gate 로 그대로이고,
//   개념 단위 결과("다시 볼 개념")·개념 지도 표시·설명 문장에만 쓴다(diagnosisConcepts.ts). 저장 형식 변경 없음.
import type { GateId } from './curriculum'

export interface DiagQuestion {
  id: string
  gate: GateId
  prompt: string
  choices: string[]
  /** 정답 choice 인덱스 */
  answer: number
  /** 이 문항이 재는 개념 id (온톨로지 정본) */
  concepts: string[]
}

export interface ConfidenceItem {
  id: string
  prompt: string
}

export const questions: DiagQuestion[] = [
  // 관문 1 — 벡터·행렬곱 (1부 전반)
  { id: 'v1', gate: 'vector', prompt: '벡터 (3, 4) 의 길이(크기)는?', choices: ['5', '7', '25', '12'], answer: 0, concepts: ['vector-length'] },
  { id: 'v2', gate: 'vector', prompt: '두 벡터 (1, 0) 과 (0, 1) 의 내적(dot product)은?', choices: ['1', '−1', '2', '0'], answer: 3, concepts: ['dot-product'] },
  { id: 'v3', gate: 'vector', prompt: '행렬을 벡터에 곱하는 것은 기하적으로 무엇에 가장 가깝나?', choices: ['두 벡터를 더한다', '벡터의 길이만 잰다', '공간(벡터)을 회전·확대 등으로 변환한다', '아무 의미 없다'], answer: 2, concepts: ['linear-transformation', 'matrix-multiplication'] },

  // 관문 2 — 확률 기초 (3부 전반)
  { id: 'p1', gate: 'prob', prompt: '공정한 주사위를 한 번 굴릴 때 짝수가 나올 확률은?', choices: ['1/3', '1/6', '2/3', '1/2'], answer: 3, concepts: ['probability'] },
  { id: 'p2', gate: 'prob', prompt: '조건부 확률 P(A | B) 가 뜻하는 것은?', choices: ['B 가 일어났다고 알 때 A 가 일어날 확률', 'A 와 B 가 동시에 안 일어날 확률', 'A 가 B 보다 클 확률', 'A 와 B 는 무관하다는 뜻'], answer: 0, concepts: ['conditional-probability'] },
  { id: 'p3', gate: 'prob', prompt: 'LLM 이 "다음 단어"를 정하는 방식에 가장 가까운 것은?', choices: ['사전에서 아무 단어나 무작위로 뽑는다', '후보 단어들의 확률분포에서 고른다', '항상 같은 단어를 되풀이한다', '사람이 매번 직접 정해준다'], answer: 1, concepts: ['next-token-prediction', 'probability-distribution'] },

  // 관문 3 — 미분 (2부)
  { id: 'c1', gate: 'calculus', prompt: '미분(도함수)이 재는 것은?', choices: ['넓이의 총합', '평균값', '그 지점에서의 순간 변화율(기울기)', '최댓값의 개수'], answer: 2, concepts: ['derivative'] },
  { id: 'c2', gate: 'calculus', prompt: 'f(x) = x² 의 도함수 f′(x) 는?', choices: ['x', '2', 'x² / 2', '2x'], answer: 3, concepts: ['differentiation-rules'] },
  { id: 'c3', gate: 'calculus', prompt: '연쇄법칙(chain rule)은 주로 무엇을 미분할 때 쓰나?', choices: ['두 수의 덧셈', '함수 안에 함수가 든 합성함수', '상수', '넓이'], answer: 1, concepts: ['chain-rule'] },

  // 관문 4 — log 감각 (5부 최대 장벽, 2부 7장)
  { id: 'l1', gate: 'log', prompt: 'log₂(8) 의 값은?', choices: ['8', '3', '2', '4'], answer: 1, concepts: ['exp-log'] },
  { id: 'l2', gate: 'log', prompt: 'log 를 직관적으로 보면 무엇을 재는 도구에 가깝나?', choices: ['두 수의 차이', '원의 넓이', '"몇 자리 수인가 / 몇 배 규모인가"(곱셈을 덧셈으로)', '확률의 합'], answer: 2, concepts: ['exp-log'] },
  { id: 'l3', gate: 'log', prompt: '확률 p 가 작을수록 놀람(정보량) log(1/p) 는?', choices: ['커진다', '작아진다', '변하지 않는다', '항상 0 이다'], answer: 0, concepts: ['information-surprise'] },
]

/** 저장된 답의 보기 번호 체계. 보기 순서를 바꿀 때마다 올린다(useDiagnosis.ts 가 옛 형식을 읽을 때 옮긴다). */
export const ANSWER_FORMAT = 2

/** format 없음(= 1, 2026-09-29 이전) → 2: 문항마다 두 보기의 자리를 맞바꿨다. 맞바꿈이라 옛→새, 새→옛이 같은 표. */
export const LEGACY_ANSWER_SWAPS: Record<string, [number, number]> = {
  v1: [0, 1], v2: [1, 3], p1: [2, 3], p2: [0, 1], c1: [1, 2], c2: [1, 3], c3: [1, 2], l1: [1, 2], l2: [1, 2], l3: [0, 1],
}

export const confidenceItems: ConfidenceItem[] = [
  { id: 'overall', prompt: '수학 전반에 얼마나 자신이 있나요?' },
  { id: 'symbols', prompt: '수식·기호(∑, log, 벡터 표기 등)를 보면 얼마나 편한가요?' },
]
