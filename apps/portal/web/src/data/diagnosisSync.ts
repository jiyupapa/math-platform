// 진단 결과(로컬 ↔ DB kv) 동기화의 판정 규칙 — 순수 함수(Vue·Supabase 의존 없음, node 로 단독 검사 가능).
// 실제 읽기·쓰기는 useDiagnosis.ts 가 한다.
//
// 왜 필요한가(2026-09-28 점검 #3): 예전엔 "로컬에 있으면 DB 에 올리고, 없으면 DB 에서 받는다"뿐이라
//   ① '전체 경로 보기'로 지운 진단이 새로고침하면 DB 에서 되살아났고(지우기가 로컬만),
//   ② 낡은 진단이 남은 기기로 로그인하면 다른 기기의 최신 진단과 '학습 전' 기준선을 덮었고(savedAt 무시),
//   ③ 공용 PC 에서 앞사람(다른 계정)의 진단이 새로 로그인한 계정으로 올라갔다(주인 구분 없음).

export type Keep = 'newer' | 'older'

interface Stamped {
  savedAt?: number
}

/**
 * 로컬·원격 중 남길 값. 최신 진단은 'newer', 학습 전 기준선(최초 진단)은 'older'.
 * 한쪽만 있으면 그것, 둘 다 없으면 null. 시각이 같거나 모르면 로컬(이 기기에서 방금 한 것)을 남긴다.
 */
export function pickDiagnosis<T extends Stamped>(local: T | null, remote: T | null, keep: Keep): T | null {
  if (!local) return remote
  if (!remote) return local
  const l = local.savedAt ?? 0
  const r = remote.savedAt ?? 0
  if (l === r) return local
  return (keep === 'newer') === l > r ? local : remote
}

/**
 * 로그인한 계정(user)이 이 브라우저의 로컬 진단을 넘겨받아도 되는가.
 * owner = 로컬 진단을 마지막으로 저장·동기화한 계정 id(비로그인 상태에서 저장했으면 null).
 * - 같은 계정 → 넘겨받음. 주인 없음(비로그인 진단) → 첫 로그인 마이그레이션으로 넘겨받음(진도 동기화와 같은 정책).
 * - 다른 계정 → 공용 PC 의 앞사람 것이므로 버린다(올리지 않는다).
 */
export function mayAdoptLocal(owner: string | null, user: string): boolean {
  return owner === null || owner === user
}
