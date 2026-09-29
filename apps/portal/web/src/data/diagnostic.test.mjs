// 입장 진단 회귀 테스트 — 실행: node apps/portal/web/src/data/diagnostic.test.mjs  (CI 에서도 돈다)
// (Node 23.6+ 는 .ts 타입 스트리핑 기본 지원 → 소스 .ts 를 그대로 import. diagnostic.ts 의 import 는 type 뿐이라 지워진다.)
// 지키는 것(2026-09-28 점검 #3·#5):
//   ① "늘 같은 번호" 전략으로는 어느 관문도 통과하지 못한다(정답 위치 분산).
//   ② 보기 순서를 바꾸면 옛 번호 → 새 번호 표도 함께 고친다(저장된 진단·기준선이 엉뚱하게 채점되지 않게).
//   ③ 진단 동기화 판정: 최신 진단은 새것, 기준선은 옛것, 다른 계정의 로컬 진단은 넘겨받지 않는다.
import assert from 'node:assert/strict'
import { questions, ANSWER_FORMAT, LEGACY_ANSWER_SWAPS } from './diagnostic.ts'
import { pickDiagnosis, mayAdoptLocal } from './diagnosisSync.ts'

const PASS_RATIO = 0.6 // recommend.ts 와 같은 값 — 바꾸면 여기도
let n = 0
const t = (name, fn) => {
  try {
    fn()
  } catch (e) {
    e.message = `${name}: ${e.message}`
    throw e
  }
  n++
}

// ① 정답 위치
t('관문마다 세 문항의 정답 위치가 서로 다르다', () => {
  const byGate = {}
  for (const q of questions) (byGate[q.gate] ??= []).push(q.answer)
  for (const [g, a] of Object.entries(byGate)) assert.equal(new Set(a).size, a.length, `${g}: ${a}`)
})
t('늘 같은 번호만 고르면 어느 관문도 통과 못 한다', () => {
  const gates = [...new Set(questions.map((q) => q.gate))]
  for (let p = 0; p < 4; p++) {
    for (const g of gates) {
      const qs = questions.filter((q) => q.gate === g)
      const ratio = qs.filter((q) => q.answer === p).length / qs.length
      assert.ok(ratio < PASS_RATIO, `늘 ${p + 1}번 → ${g} ${ratio}`)
    }
  }
})
t('정답 번호가 보기 범위 안에 있다', () => {
  for (const q of questions) assert.ok(q.answer >= 0 && q.answer < q.choices.length, q.id)
})

// ② 옛 번호 → 새 번호 표 (format 없음 = 2026-09-29 이전 배치)
const OLD_ANSWERS = { v1: 1, v2: 1, v3: 2, p1: 2, p2: 1, p3: 1, c1: 1, c2: 1, c3: 2, l1: 2, l2: 1, l3: 1 }
const remap = (id, i) => {
  const s = LEGACY_ANSWER_SWAPS[id]
  return s ? (i === s[0] ? s[1] : i === s[1] ? s[0] : i) : i
}
t('옛 배치의 정답 번호를 표로 옮기면 지금 정답이다', () => {
  for (const q of questions) assert.equal(remap(q.id, OLD_ANSWERS[q.id]), q.answer, q.id)
})
t('표는 실제 문항만, 서로 다른 두 보기의 맞바꿈만 담는다', () => {
  const ids = new Set(questions.map((q) => q.id))
  for (const [id, [a, b]] of Object.entries(LEGACY_ANSWER_SWAPS)) {
    assert.ok(ids.has(id), id)
    assert.ok(a !== b && a >= 0 && b >= 0 && a < 4 && b < 4, id)
  }
})
t('형식 번호가 올라가 있다(옛 저장값과 구분)', () => assert.ok(ANSWER_FORMAT >= 2))

// ③ 동기화 판정
const A = { savedAt: 100 }
const B = { savedAt: 200 }
t('최신 진단은 새것', () => {
  assert.equal(pickDiagnosis(A, B, 'newer'), B)
  assert.equal(pickDiagnosis(B, A, 'newer'), B)
})
t('기준선은 옛것(최초)', () => {
  assert.equal(pickDiagnosis(B, A, 'older'), A)
  assert.equal(pickDiagnosis(A, B, 'older'), A)
})
t('한쪽만 있으면 그것, 둘 다 없으면 null, 같은 시각이면 로컬', () => {
  assert.equal(pickDiagnosis(null, A, 'newer'), A)
  assert.equal(pickDiagnosis(A, null, 'older'), A)
  assert.equal(pickDiagnosis(null, null, 'newer'), null)
  const L = { savedAt: 5 }
  assert.equal(pickDiagnosis(L, { savedAt: 5 }, 'newer'), L)
})
t('로컬 진단을 넘겨받는 조건', () => {
  assert.equal(mayAdoptLocal(null, 'u1'), true) // 비로그인 진단 → 첫 로그인 마이그레이션
  assert.equal(mayAdoptLocal('u1', 'u1'), true)
  assert.equal(mayAdoptLocal('u0', 'u1'), false) // 공용 PC 앞사람
})

console.log(`✓ 입장 진단 회귀 테스트 ${n}건 전부 통과`)
