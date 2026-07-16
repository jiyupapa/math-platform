// 로그인 시 진도·복습을 Supabase 와 동기화. 비로그인·백엔드 미설정이면 전부 no-op(동작 불변).
// 스토어는 register*Sync(part, bridge) 한 줄만 호출하면 된다 — 개별 mutation(markDone 등)은
// 안 건드리고, 배열 변화를 watch 로 감지해 원격에 반영한다(로컬 우선).
// ⚠️ supabase 쿼리 빌더는 지연 실행 — .then() 을 걸어야 실제 요청이 전송된다.
import { watch } from 'vue'
import { supabase } from './supabase'
import { currentUser } from './auth'

// ── 도입 대시보드 집계 (P3) — security definer RPC(익명 집계만) ──
export interface AdoptionStats {
  total_users: number
  total_completions: number
  per_part: { part: number; users: number; completions: number }[]
  per_chapter: { part: number; slug: string; users: number }[]
}
export async function fetchAdoptionStats(): Promise<AdoptionStats | null> {
  if (!supabase || !currentUser.value) return null
  const { data, error } = await supabase.rpc('adoption_stats')
  if (error || !data) return null
  return data as AdoptionStats
}

// ── 진도 (part 별 완료 슬러그) ─────────────────────────────
async function pullProgress(part: number): Promise<string[]> {
  if (!supabase || !currentUser.value) return []
  const { data, error } = await supabase.from('progress').select('slug').eq('part', part)
  if (error || !data) return []
  return (data as { slug: string }[]).map((r) => r.slug)
}
function upsertProgress(part: number, slug: string): void {
  if (!supabase || !currentUser.value) return
  supabase
    .from('progress')
    .upsert({ user_id: currentUser.value.id, part, slug }, { onConflict: 'user_id,part,slug' })
    .then(({ error }) => {
      if (error) console.warn('[store] progress upsert:', error.message)
    }, () => {})
}
function deleteProgress(part: number, slug: string): void {
  if (!supabase || !currentUser.value) return
  supabase.from('progress').delete().match({ user_id: currentUser.value.id, part, slug }).then(() => {}, () => {})
}

export function registerProgressSync(
  part: number,
  bridge: { get: () => string[]; set: (slugs: string[]) => void },
): void {
  if (!supabase) return
  // 로그인 시: 원격 ∪ 로컬 → 로컬, 로컬-only → 원격
  watch(
    currentUser,
    async (user) => {
      if (!user) return
      const remote = await pullProgress(part)
      const remoteSet = new Set(remote)
      const local = bridge.get()
      bridge.set(Array.from(new Set([...local, ...remote])))
      for (const s of local) if (!remoteSet.has(s)) upsertProgress(part, s)
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
      for (const s of now) if (!b.has(s)) upsertProgress(part, s)
      for (const s of before) if (!n.has(s)) deleteProgress(part, s)
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
  if (!supabase || !currentUser.value) return []
  const { data, error } = await supabase
    .from('reviews')
    .select('item_id, chapter, label')
    .eq('part', part)
  if (error || !data) return []
  return (data as { item_id: string; chapter: string; label: string }[]).map((r) => ({
    id: r.item_id,
    chapter: r.chapter,
    label: r.label,
  }))
}
function upsertReview(part: number, item: ReviewRow): void {
  if (!supabase || !currentUser.value) return
  supabase
    .from('reviews')
    .upsert(
      { user_id: currentUser.value.id, part, item_id: item.id, chapter: item.chapter, label: item.label },
      { onConflict: 'user_id,part,item_id' },
    )
    .then(({ error }) => {
      if (error) console.warn('[store] review upsert:', error.message)
    }, () => {})
}
function deleteReview(part: number, id: string): void {
  if (!supabase || !currentUser.value) return
  supabase.from('reviews').delete().match({ user_id: currentUser.value.id, part, item_id: id }).then(() => {}, () => {})
}

export function registerReviewSync(
  part: number,
  bridge: { get: () => ReviewRow[]; set: (items: ReviewRow[]) => void },
): void {
  if (!supabase) return
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
      for (const it of local) if (!remoteIds.has(it.id)) upsertReview(part, it)
    },
    { immediate: true },
  )
  watch(
    () => bridge.get().slice(),
    (now, before) => {
      if (!currentUser.value) return
      const bIds = new Set(before.map((i) => i.id))
      const nIds = new Set(now.map((i) => i.id))
      for (const it of now) if (!bIds.has(it.id)) upsertReview(part, it)
      for (const it of before) if (!nIds.has(it.id)) deleteReview(part, it.id)
    },
  )
}
