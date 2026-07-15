// 로그인 시 진도·복습을 Supabase 와 동기화. 비로그인·백엔드 미설정이면 전부 no-op(동작 불변).
// 로컬 우선: 로컬은 항상 즉시 저장되고, 로그인 상태면 원격에도 반영한다. 로그인 순간 합집합 병합.
import { watch } from 'vue'
import { supabase } from './supabase'
import { currentUser } from './auth'

// ── 진도 (part 별 완료 슬러그) ─────────────────────────────
async function pullProgress(part: number): Promise<string[]> {
  if (!supabase || !currentUser.value) return []
  const { data, error } = await supabase.from('progress').select('slug').eq('part', part)
  if (error || !data) return []
  return (data as { slug: string }[]).map((r) => r.slug)
}

export function pushProgressAdd(part: number, slug: string): void {
  if (!supabase || !currentUser.value) return
  // supabase 쿼리 빌더는 지연 실행 — .then() 을 걸어야 실제 요청이 전송된다.
  supabase
    .from('progress')
    .upsert({ user_id: currentUser.value.id, part, slug }, { onConflict: 'user_id,part,slug' })
    .then(
      ({ error }) => {
        if (error) console.warn('[store] progress upsert 실패:', error.message)
      },
      () => {},
    )
}

export function pushProgressRemove(part: number, slug: string): void {
  if (!supabase || !currentUser.value) return
  supabase
    .from('progress')
    .delete()
    .match({ user_id: currentUser.value.id, part, slug })
    .then(() => {}, () => {})
}

/** 스토어가 setup 에서 1회 등록 — 로그인 시 원격 진도를 로컬과 합집합 병합하고 로컬-only 는 원격에 올린다. */
export function registerProgressSync(
  part: number,
  bridge: { get: () => string[]; set: (slugs: string[]) => void },
): void {
  if (!supabase) return
  watch(
    currentUser,
    async (user) => {
      if (!user) return
      const remote = await pullProgress(part)
      const remoteSet = new Set(remote)
      const union = Array.from(new Set([...bridge.get(), ...remote]))
      bridge.set(union)
      for (const slug of union) if (!remoteSet.has(slug)) pushProgressAdd(part, slug)
    },
    { immediate: true },
  )
}

// ── 복습 북마크 (part 별) ──────────────────────────────────
export interface ReviewRow {
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

export function pushReviewAdd(part: number, item: ReviewRow): void {
  if (!supabase || !currentUser.value) return
  supabase
    .from('reviews')
    .upsert(
      { user_id: currentUser.value.id, part, item_id: item.id, chapter: item.chapter, label: item.label },
      { onConflict: 'user_id,part,item_id' },
    )
    .then(
      ({ error }) => {
        if (error) console.warn('[store] review upsert 실패:', error.message)
      },
      () => {},
    )
}

export function pushReviewRemove(part: number, id: string): void {
  if (!supabase || !currentUser.value) return
  supabase
    .from('reviews')
    .delete()
    .match({ user_id: currentUser.value.id, part, item_id: id })
    .then(() => {}, () => {})
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
      const byId = new Map<string, ReviewRow>()
      for (const it of remote) byId.set(it.id, it)
      for (const it of bridge.get()) if (!byId.has(it.id)) byId.set(it.id, it) // 로컬-only 보존
      const merged = Array.from(byId.values())
      bridge.set(merged)
      const remoteSet = new Set(remote.map((r) => r.id))
      for (const it of merged) if (!remoteSet.has(it.id)) pushReviewAdd(part, it)
    },
    { immediate: true },
  )
}
