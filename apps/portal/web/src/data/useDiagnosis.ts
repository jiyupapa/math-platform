// 진단 결과 저장/조회 — 포털 접두사 hub-* 사용(각 부 la-/tf- 와 구분).
// - hub-diagnosis-v1 : 최신 진단(경로 추천에 사용).
// - hub-baseline-v1  : 최초 진단('학습 전' 기준선). 재진단해도 유지 → 향상도(전↔후) 비교의 앵커.
// - hub-diagnosis-owner-v1 : 위 두 값의 주인 계정 id(로그인 상태에서 저장·동기화했을 때만). 공용 PC 에서
//   앞사람 진단이 다른 계정으로 올라가지 않게 한다. 판정 규칙은 diagnosisSync.ts.
// 키 이름은 DB kv 의 key 이기도 하다 — 바꾸면 다른 기기에서 진단을 못 찾는다.
import { currentUser, kvDelete, kvRead, kvSet } from '@series/store'
import { ANSWER_FORMAT, LEGACY_ANSWER_SWAPS } from './diagnostic'
import { mayAdoptLocal, pickDiagnosis, type Keep } from './diagnosisSync'

const KEY = 'hub-diagnosis-v1'
const BASELINE_KEY = 'hub-baseline-v1'
const OWNER_KEY = 'hub-diagnosis-owner-v1'

export interface Diagnosis {
  /** questionId → 선택한 choice 인덱스 */
  answers: Record<string, number>
  /** confidenceItemId → 1~5 */
  confidence: Record<string, number>
  savedAt: number
  /** 보기 번호 체계(diagnostic.ts ANSWER_FORMAT). 없으면 2026-09-29 이전 배치. */
  format?: number
}

/** 옛 보기 배치로 저장된 답을 지금 배치의 번호로 옮긴다(로컬·DB 어느 쪽에서 왔든 읽을 때 한 번). */
export function normalizeDiagnosis(d: Diagnosis): Diagnosis {
  if (d.format === ANSWER_FORMAT) return d
  const answers: Record<string, number> = {}
  for (const [id, i] of Object.entries(d.answers ?? {})) {
    const s = LEGACY_ANSWER_SWAPS[id]
    answers[id] = s ? (i === s[0] ? s[1] : i === s[1] ? s[0] : i) : i
  }
  return { ...d, answers, format: ANSWER_FORMAT }
}

function parse(raw: string | null): Diagnosis | null {
  if (!raw) return null
  try {
    const d = JSON.parse(raw) as Diagnosis
    return d && typeof d === 'object' && d.answers && typeof d.answers === 'object' ? d : null
  } catch {
    return null
  }
}

function read(key: string): Diagnosis | null {
  try {
    const d = parse(localStorage.getItem(key))
    return d ? normalizeDiagnosis(d) : null
  } catch {
    return null
  }
}

function write(key: string, d: Diagnosis | null): void {
  try {
    if (d) localStorage.setItem(key, JSON.stringify(d))
    else localStorage.removeItem(key)
  } catch {
    /* localStorage 사용 불가 환경 무시 */
  }
}

function readOwner(): string | null {
  try {
    return localStorage.getItem(OWNER_KEY)
  } catch {
    return null
  }
}

function writeOwner(id: string | null): void {
  try {
    if (id) localStorage.setItem(OWNER_KEY, id)
    else localStorage.removeItem(OWNER_KEY)
  } catch {
    /* 무시 */
  }
}

export function loadDiagnosis(): Diagnosis | null {
  return read(KEY)
}

/** 최초 진단(학습 전 기준선). 없으면 null. */
export function loadBaseline(): Diagnosis | null {
  return read(BASELINE_KEY)
}

export function saveDiagnosis(d: Diagnosis): void {
  const uid = currentUser.value?.id ?? null
  // 이 브라우저에 남은 게 다른 계정(또는 로그아웃 뒤의 앞사람) 것이면, 새 진단과 섞이지 않게 먼저 비운다.
  const owner = readOwner()
  if (owner !== null && owner !== uid) {
    write(KEY, null)
    write(BASELINE_KEY, null)
  }
  const rec: Diagnosis = { ...d, format: ANSWER_FORMAT }
  write(KEY, rec)
  // 최초 1회만 기준선으로 별도 보관 (이후 재진단해도 덮어쓰지 않음)
  if (!read(BASELINE_KEY)) write(BASELINE_KEY, rec)
  writeOwner(uid)
  if (uid) void syncDiagnosisWithDB(uid) // 로그인 상태면 DB(kv)와 맞춤 — 다른 기기에서 맞춤 경로 복원
}

/** 최신 진단만 지운다(기준선은 유지 → '학습 전' 앵커 보존). 로그인 상태면 DB 의 최신 진단도 지운다. */
export function clearDiagnosis(): void {
  write(KEY, null)
  if (currentUser.value) void kvDelete(KEY) // 안 지우면 새로고침 때 DB 에서 되살아난다
}

async function syncKey(key: string, keep: Keep): Promise<void> {
  const remote = await kvRead<Diagnosis>(key)
  if (remote === null) return // 조회 실패 — '없음'으로 읽으면 로컬로 서버를 덮는다. 이번엔 건너뜀.
  const local = parse(localStorage.getItem(key))
  const chosen = pickDiagnosis(local, remote.value, keep)
  if (!chosen) return
  if (chosen !== local) write(key, chosen)
  if (chosen !== remote.value) await kvSet(key, chosen)
}

/**
 * 로그인한 계정의 진단을 로컬 ↔ DB 로 맞춘다(로그인 직후 하이드레이션, 로그인 상태의 저장 직후).
 * 최신 진단은 새것을, 학습 전 기준선은 옛것(최초)을 남긴다. 다른 계정의 로컬 진단은 올리지 않고 버린다.
 */
export async function syncDiagnosisWithDB(uid: string): Promise<void> {
  try {
    if (!mayAdoptLocal(readOwner(), uid)) {
      write(KEY, null)
      write(BASELINE_KEY, null)
    }
    writeOwner(uid)
    await syncKey(KEY, 'newer')
    await syncKey(BASELINE_KEY, 'older')
  } catch {
    /* localStorage 불가 등 — 동기화만 건너뜀(로컬 동작은 그대로) */
  }
}

/** 자기보고 평균(1~5). 응답이 없으면 중립값 3. */
export function confidenceAvg(confidence: Record<string, number>): number {
  const vals = Object.values(confidence)
  if (!vals.length) return 3
  return vals.reduce((a, b) => a + b, 0) / vals.length
}
