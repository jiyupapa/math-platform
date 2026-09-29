// 2층 — 포털이 각 부의 학습 데이터를 읽는다.
// 각 부의 localStorage 키 (접두사: la/diff/stat/tf/it/tame/emb/opt/num/scale/agent):
//   {prefix}-progress-v1 : 완료 챕터 슬러그 배열
//   {prefix}-review-v1   : 복습 북마크 배열 [{id, chapter, label}]
// ⚠️ localStorage 는 origin 단위라, 이 읽기는 11개 부 + 포털이 "같은 origin 하위 경로"로
//    배포됐을 때만 실제로 동작한다(npm run deploy:build → deploy:serve). dev 단독 실행 시엔 빈 값.

import { ref, watch } from 'vue'
import { currentUser, fetchMyProgress } from '@series/store'
import { syncDiagnosisWithDB } from './useDiagnosis'

const range = (from: number, to: number): string[] =>
  Array.from({ length: to - from + 1 }, (_, i) => `ch${from + i}`)

export interface PartMeta {
  part: number
  prefix: string
  /** 카드 문구용 이름 */
  label: string
  /** 필수 트랙 챕터 슬러그 */
  essential: string[]
  /** 심화 트랙 챕터 슬러그 (없으면 빈 배열) */
  advanced: string[]
}

// 각 부 chapters.ts 의 advanced 플래그와 일치해야 한다 (part1 ch7~12 · part3 ch8~10 심화).
export const PART_META: PartMeta[] = [
  { part: 1, prefix: 'la', label: '1부 선형대수', essential: range(1, 6), advanced: range(7, 12) },
  { part: 2, prefix: 'diff', label: '2부 미분', essential: range(1, 10), advanced: [] },
  { part: 3, prefix: 'stat', label: '3부 확률통계', essential: range(1, 7), advanced: range(8, 10) },
  { part: 4, prefix: 'tf', label: '4부 트랜스포머', essential: range(1, 12), advanced: [] },
  { part: 5, prefix: 'it', label: '5부 정보이론', essential: range(1, 10), advanced: [] },
  { part: 6, prefix: 'tame', label: '6부 LLM 조련', essential: range(1, 10), advanced: [] },
  { part: 7, prefix: 'emb', label: '7부 임베딩 기하학', essential: range(1, 10), advanced: [] },
  { part: 8, prefix: 'opt', label: '8부 최적화', essential: range(1, 11), advanced: [] },
  { part: 9, prefix: 'num', label: '9부 수치 계산', essential: range(1, 11), advanced: [] },
  { part: 10, prefix: 'scale', label: '10부 스케일링·평가', essential: range(1, 10), advanced: [] },
  { part: 11, prefix: 'agent', label: '11부 에이전트·추론', essential: range(1, 12), advanced: [] },
]

export interface PartProgress {
  part: number
  completed: number
  total: number
  percent: number
}

function readStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : []
  } catch {
    return []
  }
}

/** 해당 부의 완료 슬러그 집합 (실재 챕터와 교집합 — 옛 슬러그·샘플은 무시). */
export function readCompletedSlugs(meta: PartMeta): Set<string> {
  const known = new Set([...meta.essential, ...meta.advanced])
  return new Set(readStringArray(`${meta.prefix}-progress-v1`).filter((s) => known.has(s)))
}

/** part 번호 → 진도. */
export function readAllProgress(): Record<number, PartProgress> {
  const out: Record<number, PartProgress> = {}
  for (const m of PART_META) {
    const total = m.essential.length + m.advanced.length
    const completed = readCompletedSlugs(m).size
    out[m.part] = {
      part: m.part,
      completed,
      total,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    }
  }
  return out
}

/** 한 단계가 실제로 다루는 (부, 슬러그)만의 진도 — 부를 쪼갠 단계(4부 추론/학습편)·여러 부에
 *  걸친 심화 단계(1부·3부 후반)를 실제 완료 챕터로 정확히 계산한다. */
export function readStepProgress(segments: { part: number; slugs: string[] }[]): PartProgress {
  let completed = 0
  let total = 0
  for (const seg of segments) {
    total += seg.slugs.length
    const meta = PART_META.find((m) => m.part === seg.part)
    if (!meta) continue
    const done = readCompletedSlugs(meta)
    completed += seg.slugs.filter((s) => done.has(s)).length
  }
  return {
    part: segments[0]?.part ?? 0,
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  }
}

export interface ReviewBookmark {
  id: string
  chapter: string
  label: string
}

/** 해당 부의 복습 북마크 목록 ({prefix}-review-v1). 손상값은 걸러낸다. */
export function readReviewBookmarks(meta: PartMeta): ReviewBookmark[] {
  try {
    const raw = localStorage.getItem(`${meta.prefix}-review-v1`)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i): i is ReviewBookmark =>
        !!i &&
        typeof i === 'object' &&
        typeof (i as ReviewBookmark).id === 'string' &&
        typeof (i as ReviewBookmark).chapter === 'string' &&
        typeof (i as ReviewBookmark).label === 'string',
    )
  } catch {
    return []
  }
}

// ── 개인 2층 DB 하이드레이션 ─────────────────────────────────────────────────
// 로그인 시 내 진도(전 부)를 Supabase 에서 읽어 각 부 localStorage 키를 채운다(합집합, 무손실).
// 그러면 새 기기·첫 로그인에서도 포털 지도/홈이 내 크로스기기 진도를 각 부 방문 없이 바로 보여준다.
// 백엔드 미설정·비로그인이면 no-op → 지금까지처럼 localStorage 만.
// progressVersion 을 올려 App.vue 의 <RouterView :key> 가 뷰를 리마운트 → 재계산하게 한다.
export const progressVersion = ref(0)

async function hydrateFromDB(): Promise<void> {
  const rows = await fetchMyProgress()
  const byPart = new Map<number, string[]>()
  for (const r of rows) {
    const arr = byPart.get(r.part) ?? []
    arr.push(r.slug)
    byPart.set(r.part, arr)
  }
  for (const meta of PART_META) {
    const dbSlugs = byPart.get(meta.part)
    if (!dbSlugs || !dbSlugs.length) continue
    const merged = Array.from(new Set([...readStringArray(`${meta.prefix}-progress-v1`), ...dbSlugs]))
    try {
      localStorage.setItem(`${meta.prefix}-progress-v1`, JSON.stringify(merged))
    } catch {
      /* localStorage 불가 무시 */
    }
  }
  // 진단결과(kv) — 최신 진단은 새것·기준선은 옛것을 남기고, 다른 계정의 로컬 진단은 올리지 않는다(useDiagnosis.ts).
  const uid = currentUser.value?.id
  if (uid) await syncDiagnosisWithDB(uid)
  progressVersion.value++
}

let hydrationStarted = false
/** App.vue 에서 1회 호출 — 로그인 시 DB→localStorage 하이드레이션을 구독한다. */
export function startPortalHydration(): void {
  if (hydrationStarted) return
  hydrationStarted = true
  watch(currentUser, (u) => { if (u) void hydrateFromDB() }, { immediate: true })
}
