// 로그인 시 진도·복습을 Supabase 와 동기화 + 집계/kv 조회. 비로그인·미설정이면 no-op(동작 불변).
// supabase 클라이언트는 getSupabase()로 lazy-load(비로그인은 supabase-js 안 받음).
import { watch } from 'vue'
import { getSupabase, isBackendEnabled } from './supabase'
import { currentUser } from './auth'

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
  if (!isBackendEnabled()) return
  // 로그인 시: 원격 ∪ 로컬 → 로컬, 로컬-only → 원격
  watch(
    currentUser,
    async (user) => {
      if (!user) return
      const remote = await pullProgress(part)
      const remoteSet = new Set(remote)
      const local = bridge.get()
      bridge.set(Array.from(new Set([...local, ...remote])))
      for (const s of local) if (!remoteSet.has(s)) void upsertProgress(part, s)
    },
    { immediate: true },
  )
  // 로그인 상태에서 로컬 변경 → 원격 반영(추가·삭제 diff)
  watch(
    () => bridge.get().slice(),
    (now, before) => {
      if (!currentUser.value) return
      const b = new Set(before)
      const n = new Set(now)
      for (const s of now) if (!b.has(s)) void upsertProgress(part, s)
      for (const s of before) if (!n.has(s)) void deleteProgress(part, s)
    },
  )
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
  if (!isBackendEnabled()) return
  watch(
    currentUser,
    async (user) => {
      if (!user) return
      const remote = await pullReviews(part)
      const byId = new Map<string, ReviewRow>(remote.map((r) => [r.id, r]))
      const local = bridge.get()
      for (const it of local) if (!byId.has(it.id)) byId.set(it.id, it)
      bridge.set(Array.from(byId.values()))
      const remoteIds = new Set(remote.map((r) => r.id))
      for (const it of local) if (!remoteIds.has(it.id)) void upsertReview(part, it)
    },
    { immediate: true },
  )
  watch(
    () => bridge.get().slice(),
    (now, before) => {
      if (!currentUser.value) return
      const bIds = new Set(before.map((i) => i.id))
      const nIds = new Set(now.map((i) => i.id))
      for (const it of now) if (!bIds.has(it.id)) void upsertReview(part, it)
      for (const it of before) if (!nIds.has(it.id)) void deleteReview(part, it.id)
    },
  )
}
