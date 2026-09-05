// 3-way 집합 병합 — 순수 함수(DB·Vue 의존 없음, node 로 단독 테스트 가능: syncMerge.test.mjs).
//
// 왜 필요한가: 예전 로그인 병합은 "원격 ∪ 로컬 → 로컬, 로컬-only → 원격"(합집합)이었다.
//   이러면 한 기기에서 지운 항목이 다른 기기의 낡은 로컬에 남아 있다가 다음 로그인 때
//   원격으로 되살아난다(부활 버그). 삭제가 영영 안 먹는다.
//
// 고치는 법: base(이 기기가 **직전에 서버와 맞춘 상태**)를 기준선으로 둔다. 그래야
//   "로컬에 없음"이 "여기서 지웠다"(base 엔 있음)인지 "아직 못 받았다"(base 에도 없음)인지
//   구분된다. 표준 3-way 병합이다.

export interface SetMerge {
  /** 최종 상태 — 로컬과 원격이 똑같이 이 집합이 되어야 한다. */
  keep: Set<string>
  /** 원격에 아직 없어 upsert 해야 하는 키(= 로컬에서 새로 추가된 것). */
  pushUp: string[]
  /** 원격에 남아 있으나 최종에서 빠진 키(= 삭제를 원격에 전파). */
  pullDelete: string[]
}

/**
 * @param base   직전 동기화 확정 상태(기준선). 첫 로그인·다른 계정이면 빈 집합.
 * @param local  현재 로컬 집합.
 * @param remote 현재 서버 집합.
 *
 * 판정: base 기준으로 한쪽에서 삭제됐으면(그쪽에 없고 base 엔 있음) 삭제가 이긴다.
 *   그 외에는 어느 쪽이든 존재하면 유지(추가는 합집합). 동일 항목 동시 추가는 멱등이라 무해.
 */
export function mergeSets(base: Set<string>, local: Set<string>, remote: Set<string>): SetMerge {
  const keep = new Set<string>()
  for (const x of new Set([...base, ...local, ...remote])) {
    const deletedLocally = base.has(x) && !local.has(x)
    const deletedRemotely = base.has(x) && !remote.has(x)
    if (!deletedLocally && !deletedRemotely && (local.has(x) || remote.has(x))) keep.add(x)
  }
  const pushUp = [...keep].filter((x) => !remote.has(x))
  const pullDelete = [...remote].filter((x) => !keep.has(x))
  return { keep, pushUp, pullDelete }
}
