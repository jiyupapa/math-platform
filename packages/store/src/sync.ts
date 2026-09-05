// 로그인 시 진도·복습을 Supabase 와 동기화 + 집계/kv 조회. 비로그인·미설정이면 no-op(동작 불변).
// supabase 클라이언트는 getSupabase()로 lazy-load(비로그인은 supabase-js 안 받음).
import { nextTick, watch } from 'vue'
import { getSupabase, isBackendEnabled } from './supabase'
import { currentUser } from './auth'
import { mergeSets } from './syncMerge'

// ── 도입 대시보드 집계 (P3) — security definer RPC(익명 집계만) ──
export interface AdoptionStats {
  total_users: number
  total_completions: number
  per_part: { part: number; users: number; completions: number }[]
  per_chapter: { part: number; slug: string; users: number }[]
}
export async function fetchAdoptionStats(): Promise<AdoptionStats | null> {
  const sb = await getSupabase()
  if (!sb || !currentUser.value) return null
  const { data, error } = await sb.rpc('adoption_stats')
  if (error || !data) return null
  return data as AdoptionStats
}

// 개인 2층 — 로그인한 나 자신의 전체 진도(전 부). RLS 로 본인 행만 반환된다.
export async function fetchMyProgress(): Promise<{ part: number; slug: string }[]> {
  const sb = await getSupabase()
  if (!sb || !currentUser.value) return []
  const { data, error } = await sb.from('progress').select('part, slug')
  if (error || !data) return []
  return data as { part: number; slug: string }[]
}

// ── kv (진단결과 등 조회 불필요 blob) — 통째로 저장/복원 ──
export async function kvGet<T = unknown>(key: string): Promise<T | null> {
  const sb = await getSupabase()
  if (!sb || !currentUser.value) return null
  const { data, error } = await sb.from('kv').select('value').eq('key', key).maybeSingle()
  if (error || !data) return null
  return (data as { value: T }).value
}
export async function kvSet(key: string, value: unknown): Promise<void> {
  const sb = await getSupabase()
  if (!sb || !currentUser.value) return
  const { error } = await sb
    .from('kv')
    .upsert({ user_id: currentUser.value.id, key, value }, { onConflict: 'user_id,key' })
  if (error) console.warn('[store] kv upsert:', error.message)
}

// ── 동기화 기준선(baseline) — 이 기기가 직전에 서버와 맞춘 상태 ────────────────
// 3-way 병합의 base. 사용자 id 와 함께 저장해, 같은 계정 재로그인(오프라인 변경 판정)과
// 다른 계정 로그인(공용 PC — 남의 로컬을 물려받지 않게)을 구분한다. sync 계층만의 부기라
// 앱의 진도 키(la-progress-v1 등)와 별개 네임스페이스(series-sync-*)를 쓴다.
interface Baseline {
  user: string
  ids: string[]
}
const baselineKey = (tag: string, part: number) => `series-sync-${tag}-${part}-v1`
function readBaseline(tag: string, part: number): Baseline | null {
  try {
    const raw = localStorage.getItem(baselineKey(tag, part))
    if (!raw) return null
    const p: unknown = JSON.parse(raw)
    if (p && typeof p === 'object' && typeof (p as Baseline).user === 'string' && Array.isArray((p as Baseline).ids)) {
      return { user: (p as Baseline).user, ids: (p as Baseline).ids.filter((s): s is string => typeof s === 'string') }
    }
  } catch {
    /* localStorage 불가·손상 무시 */
  }
  return null
}
function writeBaseline(tag: string, part: number, user: string, ids: string[]): void {
  try {
    localStorage.setItem(baselineKey(tag, part), JSON.stringify({ user, ids }))
  } catch {
    /* 무시 */
  }
}

// ── 공용 동기화 코어 — 진도(문자열 키)·복습(객체) 양쪽이 쓴다 ──────────────────
// idOf 로 항목의 키를 뽑아 3-way 병합하고, 최종 상태를 로컬·원격에 반영한다.
interface SyncSpec<T> {
  part: number
  tag: string
  bridge: { get: () => T[]; set: (items: T[]) => void }
  idOf: (item: T) => string
  pull: () => Promise<T[]>
  upsert: (item: T) => Promise<void>
  remove: (id: string) => Promise<void>
}
function registerSetSync<T>(spec: SyncSpec<T>): void {
  if (!isBackendEnabled()) return
  const { part, tag, bridge, idOf, pull, upsert, remove } = spec
  // 병합이 스스로 부르는 bridge.set 을 아래 로컬-변경 watch 가 다시 원격에 밀어내지 않도록 막는 플래그.
  let applying = false

  watch(
    currentUser,
    async (user) => {
      if (!user) return // 로그아웃: 원격 무건드림(아래 watch 는 user 없음이라 skip) · 로컬은 오프라인 열람용으로 유지
      const bl = readBaseline(tag, part)
      const differentUser = bl !== null && bl.user !== user.id // 공용 PC: 다른 계정 → 남의 로컬 폐기
      const sameUser = bl !== null && bl.user === user.id
      const remote = await pull()
      const remoteMap = new Map(remote.map((it) => [idOf(it), it]))
      const localItems = differentUser ? [] : bridge.get() // 첫 로그인(bl 없음)이면 익명 로컬을 마이그레이션
      const localMap = new Map(localItems.map((it) => [idOf(it), it]))
      const base = sameUser ? new Set(bl!.ids) : new Set<string>()
      const { keep, pushUp, pullDelete } = mergeSets(base, new Set(localMap.keys()), new Set(remoteMap.keys()))
      // 최종 아이템: 원격 값 우선(라벨 최신), 없으면 로컬 값. keep 은 둘 중 하나엔 반드시 있다.
      const finalItems = [...keep].map((id) => remoteMap.get(id) ?? localMap.get(id)!)

      applying = true
      bridge.set(finalItems)
      writeBaseline(tag, part, user.id, [...keep])
      await nextTick() // 위 set 이 부른 로컬-변경 watch 가 (applying=true 라) 지나가길 기다린 뒤 해제
      applying = false

      for (const id of pushUp) {
        const it = localMap.get(id)
        if (it) void upsert(it)
      }
      for (const id of pullDelete) void remove(id)
    },
    { immediate: true },
  )

  // 로그인 상태에서 로컬 변경 → 원격 반영 + 기준선 갱신(다음 로그인의 base 가 정확해지도록).
  watch(
    () => bridge.get().slice(),
    (now, before) => {
      if (!currentUser.value || applying) return
      const uid = currentUser.value.id
      const bl = readBaseline(tag, part)
      const ids = new Set(bl && bl.user === uid ? bl.ids : [])
      const nowMap = new Map(now.map((it) => [idOf(it), it]))
      const beforeIds = new Set(before.map(idOf))
      for (const [id, it] of nowMap) if (!beforeIds.has(id)) { void upsert(it); ids.add(id) }
      for (const it of before) {
        const id = idOf(it)
        if (!nowMap.has(id)) { void remove(id); ids.delete(id) }
      }
      writeBaseline(tag, part, uid, [...ids])
    },
  )
}

// ── 진도 (part 별 완료 슬러그) ─────────────────────────────
async function pullProgress(part: number): Promise<string[]> {
  const sb = await getSupabase()
  if (!sb || !currentUser.value) return []
  const { data, error } = await sb.from('progress').select('slug').eq('part', part)
  if (error || !data) return []
  return (data as { slug: string }[]).map((r) => r.slug)
}
async function upsertProgress(part: number, slug: string): Promise<void> {
  const sb = await getSupabase()
  if (!sb || !currentUser.value) return
  const { error } = await sb
    .from('progress')
    .upsert({ user_id: currentUser.value.id, part, slug }, { onConflict: 'user_id,part,slug' })
  if (error) console.warn('[store] progress upsert:', error.message)
}
async function deleteProgress(part: number, slug: string): Promise<void> {
  const sb = await getSupabase()
  if (!sb || !currentUser.value) return
  await sb.from('progress').delete().match({ user_id: currentUser.value.id, part, slug })
}

export function registerProgressSync(
  part: number,
  bridge: { get: () => string[]; set: (slugs: string[]) => void },
): void {
  registerSetSync<string>({
    part,
    tag: 'progress',
    bridge,
    idOf: (s) => s,
    pull: () => pullProgress(part),
    upsert: (s) => upsertProgress(part, s),
    remove: (s) => deleteProgress(part, s),
  })
}

// ── 복습 북마크 (part 별) ──────────────────────────────────
interface ReviewRow {
  id: string
  chapter: string
  label: string
}
async function pullReviews(part: number): Promise<ReviewRow[]> {
  const sb = await getSupabase()
  if (!sb || !currentUser.value) return []
  const { data, error } = await sb.from('reviews').select('item_id, chapter, label').eq('part', part)
  if (error || !data) return []
  return (data as { item_id: string; chapter: string; label: string }[]).map((r) => ({
    id: r.item_id,
    chapter: r.chapter,
    label: r.label,
  }))
}
async function upsertReview(part: number, item: ReviewRow): Promise<void> {
  const sb = await getSupabase()
  if (!sb || !currentUser.value) return
  const { error } = await sb
    .from('reviews')
    .upsert(
      { user_id: currentUser.value.id, part, item_id: item.id, chapter: item.chapter, label: item.label },
      { onConflict: 'user_id,part,item_id' },
    )
  if (error) console.warn('[store] review upsert:', error.message)
}
async function deleteReview(part: number, id: string): Promise<void> {
  const sb = await getSupabase()
  if (!sb || !currentUser.value) return
  await sb.from('reviews').delete().match({ user_id: currentUser.value.id, part, item_id: id })
}

export function registerReviewSync(
  part: number,
  bridge: { get: () => ReviewRow[]; set: (items: ReviewRow[]) => void },
): void {
  registerSetSync<ReviewRow>({
    part,
    tag: 'review',
    bridge,
    idOf: (r) => r.id,
    pull: () => pullReviews(part),
    upsert: (r) => upsertReview(part, r),
    remove: (id) => deleteReview(part, id),
  })
}
