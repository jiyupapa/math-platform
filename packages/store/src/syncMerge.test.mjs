// syncMerge 순수 함수 단위 테스트 — 실행: node packages/store/src/syncMerge.test.mjs
// (Node 23.6+ 는 .ts 타입 스트리핑 기본 지원 → 소스 .ts 를 그대로 import.)
import assert from 'node:assert/strict'
import { mergeSets } from './syncMerge.ts'

const S = (...xs) => new Set(xs)
let n = 0
function t(name, base, local, remote, expKeep, expPush, expDel) {
  const r = mergeSets(S(...base), S(...local), S(...remote))
  assert.deepEqual([...r.keep].sort(), [...expKeep].sort(), `${name}: keep`)
  assert.deepEqual([...r.pushUp].sort(), [...expPush].sort(), `${name}: pushUp`)
  assert.deepEqual([...r.pullDelete].sort(), [...expDel].sort(), `${name}: pullDelete`)
  n++
}

// 첫 로그인 익명 마이그레이션: base 없음, 로컬 진도를 원격으로 올린다.
t('익명 마이그레이션', [], ['a', 'b'], [], ['a', 'b'], ['a', 'b'], [])

// 새 기기 첫 하이드레이션: 로컬 비었고 원격을 받아온다.
t('새 기기 하이드레이션', [], [], ['a', 'b'], ['a', 'b'], [], [])

// 부활 버그 회귀: 다른 기기에서 a 삭제(원격 비고 base 엔 a). 로컬 a 는 사라져야 하고 되살리지 않는다.
t('원격 삭제 반영', ['a'], ['a'], [], [], [], [])

// 오프라인 삭제 전파: 로그아웃 상태로 a 지움(로컬 비고 base 엔 a). 로그인 시 원격에서도 삭제.
t('오프라인 삭제 전파', ['a'], [], ['a'], [], [], ['a'])

// 오프라인 추가: 로컬에 b 추가(base·원격엔 없음). 원격으로 올린다.
t('오프라인 추가', ['a'], ['a', 'b'], ['a'], ['a', 'b'], ['b'], [])

// 타 기기 추가 수신: 원격에 b 생김(base·로컬엔 없음). 로컬로 받는다.
t('타 기기 추가 수신', ['a'], ['a'], ['a', 'b'], ['a', 'b'], [], [])

// 동시 추가(양쪽 같은 키): 멱등, 유지.
t('동시 추가', [], ['a'], ['a'], ['a'], [], [])

// 양쪽 삭제: base 에만 있고 둘 다 없음 → 사라짐.
t('양쪽 삭제', ['a'], [], [], [], [], [])

// 삭제 vs 유지 충돌: 로컬에서 a 삭제, 원격은 그대로 → 삭제가 이겨 원격에서도 뺀다.
t('삭제 우선', ['a', 'b'], ['b'], ['a', 'b'], ['b'], [], ['a'])

console.log(`✓ syncMerge 단위 테스트 ${n}건 전부 통과`)
