// 항목별 협업 주석(메모·질문) — 공유 층. 읽기=로그인 전원, 쓰기/수정/삭제=본인.
// **익명** — 작성자 이름을 아예 저장하지 않는다(수포자가 눈치 안 보고 묻게 하려는 것).
// 화면에서 가리기만 하면 read_all 이라 동료가 API 로 이름을 읽는다 → DB 컬럼 자체가 없다.
// user_id 는 남지만 불투명 UUID 라 동료는 사람과 못 잇는다(본인 글 판별·RLS 에 필요).
// 설계: docs/todo_협업주석_260716.md §10 · DB: supabase/schema.sql §5
import { effectScope, ref, watch, type Ref } from 'vue'
import { getSupabase } from './supabase'
import { currentUser } from './auth'

export type AnnotationKind = 'note' | 'question'

export interface Annotation {
  id: string
  /** 불투명 UUID — 화면에 절대 표시하지 않는다. 본인 글 판별(수정/삭제 노출)에만 쓴다. */
  user_id: string
  part: number
  chapter: string
  item_id: string
  kind: AnnotationKind
  body: string
  ai_answer: string | null
  resolved: boolean
  created_at: string
  updated_at: string
}

const COLS =
  'id, user_id, part, chapter, item_id, kind, body, ai_answer, resolved, created_at, updated_at'

export interface ChapterAnnotations {
  /** 이 챕터의 모든 주석 (작성순) */
  items: Ref<Annotation[]>
  loading: Ref<boolean>
  error: Ref<string>
  reload: () => Promise<void>
  itemsFor: (itemId: string) => Annotation[]
  countFor: (itemId: string) => number
  add: (itemId: string, kind: AnnotationKind, body: string) => Promise<Annotation | null>
  edit: (id: string, body: string) => Promise<boolean>
  remove: (id: string) => Promise<boolean>
}

// 챕터당 1회만 조회하고 그 챕터의 모든 마커·패널이 공유한다(섹션 수만큼 쿼리 나가는 것 방지).
const cache = new Map<string, { api: ChapterAnnotations; items: Ref<Annotation[]> }>()

// 컴포넌트 스코프 밖(detached)에서 watch 를 걸어야 한다 —
// 캐시는 앱 수명 내내 살아있는데 watch 가 첫 사용 컴포넌트와 함께 죽으면 로그인 후 갱신이 끊긴다.
const scope = effectScope(true)

export function useChapterAnnotations(part: number, chapter: string): ChapterAnnotations {
  const key = `${part}:${chapter}`
  const hit = cache.get(key)
  if (hit) return hit.api

  const items = ref<Annotation[]>([])
  const loading = ref(false)
  const error = ref('')

  async function reload(): Promise<void> {
    // 로그인 검사가 getSupabase() 보다 **먼저** 와야 한다 — 비로그인 방문자가 챕터를 열었을 때
    // supabase-js 청크를 받게 하지 않기 위해(lazy-load 정책, sync.ts 와 같은 순서).
    // 읽기도 RLS 가 authenticated 만 허용하므로 비로그인은 조회 자체가 무의미하다.
    if (!currentUser.value) {
      items.value = []
      return
    }
    const sb = await getSupabase()
    if (!sb) return
    loading.value = true
    error.value = ''
    const { data, error: e } = await sb
      .from('annotations')
      .select(COLS)
      .eq('part', part)
      .eq('chapter', chapter)
      .order('created_at', { ascending: true })
    loading.value = false
    if (e) {
      error.value = e.message
      return
    }
    items.value = (data ?? []) as Annotation[]
  }

  async function add(itemId: string, kind: AnnotationKind, body: string): Promise<Annotation | null> {
    const sb = await getSupabase()
    if (!sb || !currentUser.value) return null
    error.value = ''
    const { data, error: e } = await sb
      .from('annotations')
      .insert({ user_id: currentUser.value.id, part, chapter, item_id: itemId, kind, body })
      .select(COLS)
      .single()
    if (e || !data) {
      error.value = e?.message ?? '저장하지 못했어요'
      return null
    }
    items.value = [...items.value, data as Annotation]
    return data as Annotation
  }

  async function edit(id: string, body: string): Promise<boolean> {
    const sb = await getSupabase()
    if (!sb || !currentUser.value) return false
    error.value = ''
    const { data, error: e } = await sb
      .from('annotations')
      .update({ body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(COLS)
      .single()
    if (e || !data) {
      error.value = e?.message ?? '수정하지 못했어요'
      return false
    }
    items.value = items.value.map((a) => (a.id === id ? (data as Annotation) : a))
    return true
  }

  async function remove(id: string): Promise<boolean> {
    const sb = await getSupabase()
    if (!sb || !currentUser.value) return false
    error.value = ''
    const { error: e } = await sb.from('annotations').delete().eq('id', id)
    if (e) {
      error.value = e.message
      return false
    }
    items.value = items.value.filter((a) => a.id !== id)
    return true
  }

  const api: ChapterAnnotations = {
    items,
    loading,
    error,
    reload,
    itemsFor: (itemId) => items.value.filter((a) => a.item_id === itemId),
    countFor: (itemId) => items.value.reduce((n, a) => (a.item_id === itemId ? n + 1 : n), 0),
    add,
    edit,
    remove,
  }
  cache.set(key, { api, items })

  // 로그인/로그아웃 시 재조회(로그아웃이면 비운다). 백엔드 미설정이면 reload 가 즉시 no-op.
  scope.run(() => watch(currentUser, () => void reload(), { immediate: true }))

  return api
}

// AI 답변 저장 — 패널이 아닌 곳(TutorChat)에서 불릴 수 있어 독립 함수로 둔다.
// 열려 있는 캐시에도 즉시 반영해 패널이 다시 열릴 때 답이 보이게 한다.
export async function saveAiAnswer(id: string, answer: string): Promise<boolean> {
  const sb = await getSupabase()
  if (!sb || !currentUser.value) return false
  const { data, error } = await sb
    .from('annotations')
    .update({ ai_answer: answer, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(COLS)
    .single()
  if (error || !data) return false
  for (const { items } of cache.values()) {
    if (items.value.some((a) => a.id === id)) {
      items.value = items.value.map((a) => (a.id === id ? (data as Annotation) : a))
    }
  }
  return true
}
