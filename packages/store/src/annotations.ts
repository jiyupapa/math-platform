// 항목별 협업 주석(메모·질문) — 공유 층. 읽기=로그인 전원, 쓰기/수정/삭제=본인.
// **익명** — 작성자 이름을 아예 저장하지 않는다(수포자가 눈치 안 보고 묻게 하려는 것).
// 화면에서 가리기만 하면 read_all 이라 동료가 API 로 이름을 읽는다 → DB 컬럼 자체가 없다.
// user_id 는 남지만 불투명 UUID 라 동료는 사람과 못 잇는다(본인 글 판별·RLS 에 필요).
// 설계: docs/todo_협업주석_260716.md §10 · DB: supabase/schema.sql §5
import { computed, effectScope, ref, watch, type Ref } from 'vue'
import { getSupabase } from './supabase'
import { currentUser } from './auth'

// ── 관리자(강사) 판별 — P3 ────────────────────────────────
// env VITE_ADMIN_EMAILS(콤마 구분)는 **UI 표시용**(답변 폼·큐 메뉴를 그릴지)이다.
// 진짜 경계는 서버의 public.admins 테이블 + RLS — 두 목록을 같게 유지할 것(schema.sql §6).
const env = (import.meta as { env?: Record<string, unknown> }).env ?? {}
const ADMIN_EMAILS = ((env.VITE_ADMIN_EMAILS as string | undefined) ?? '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

export const isAdmin = computed(() => {
  const email = currentUser.value?.email?.toLowerCase()
  return !!email && ADMIN_EMAILS.includes(email)
})

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

// 사람(강사) 답변 — P3. 익명 원칙 유지: 이름 없음, 작성자는 관리자뿐이라 화면엔 "강사" 배지만.
export interface AnnotationAnswer {
  id: string
  annotation_id: string
  /** 불투명 UUID — 화면에 표시하지 않는다. 본인 답변 삭제 버튼 노출에만 쓴다. */
  user_id: string
  body: string
  created_at: string
}

const COLS =
  'id, user_id, part, chapter, item_id, kind, body, ai_answer, resolved, created_at, updated_at'
const ANSWER_COLS = 'id, annotation_id, user_id, body, created_at'

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
  // ── P3: 사람(강사) 답변 + 해결 처리 ──
  answersFor: (annotationId: string) => AnnotationAnswer[]
  addAnswer: (annotationId: string, body: string) => Promise<AnnotationAnswer | null>
  removeAnswer: (id: string) => Promise<boolean>
  setResolved: (annotationId: string, val: boolean) => Promise<boolean>
}

// 챕터당 1회만 조회하고 그 챕터의 모든 마커·패널이 공유한다(섹션 수만큼 쿼리 나가는 것 방지).
const cache = new Map<string, { api: ChapterAnnotations; items: Ref<Annotation[]> }>()

async function fetchAnswersFor(annotationIds: string[]): Promise<AnnotationAnswer[]> {
  if (annotationIds.length === 0) return []
  const sb = await getSupabase()
  if (!sb) return []
  const { data, error } = await sb
    .from('annotation_answers')
    .select(ANSWER_COLS)
    .in('annotation_id', annotationIds)
    .order('created_at', { ascending: true })
  if (error || !data) return []
  return data as AnnotationAnswer[]
}

// 컴포넌트 스코프 밖(detached)에서 watch 를 걸어야 한다 —
// 캐시는 앱 수명 내내 살아있는데 watch 가 첫 사용 컴포넌트와 함께 죽으면 로그인 후 갱신이 끊긴다.
const scope = effectScope(true)

export function useChapterAnnotations(part: number, chapter: string): ChapterAnnotations {
  const key = `${part}:${chapter}`
  const hit = cache.get(key)
  if (hit) return hit.api

  const items = ref<Annotation[]>([])
  const answers = ref<AnnotationAnswer[]>([])
  const loading = ref(false)
  const error = ref('')

  async function reload(): Promise<void> {
    // 로그인 검사가 getSupabase() 보다 **먼저** 와야 한다 — 비로그인 방문자가 챕터를 열었을 때
    // supabase-js 청크를 받게 하지 않기 위해(lazy-load 정책, sync.ts 와 같은 순서).
    // 읽기도 RLS 가 authenticated 만 허용하므로 비로그인은 조회 자체가 무의미하다.
    if (!currentUser.value) {
      items.value = []
      answers.value = []
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
    // 강사 답변은 질문에만 달리므로 질문 id 로만 조회
    answers.value = await fetchAnswersFor(
      items.value.filter((a) => a.kind === 'question').map((a) => a.id),
    )
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

  // ── P3: 사람(강사) 답변 + 해결 처리 ──
  async function addAnswer(annotationId: string, body: string): Promise<AnnotationAnswer | null> {
    const sb = await getSupabase()
    if (!sb || !currentUser.value) return null
    error.value = ''
    const { data, error: e } = await sb
      .from('annotation_answers')
      .insert({ annotation_id: annotationId, user_id: currentUser.value.id, body })
      .select(ANSWER_COLS)
      .single()
    if (e || !data) {
      // RLS write_admin 거부(관리자 아님) 포함 — env 로만 관리자인 척해도 여기서 막힌다
      error.value = e?.message ?? '답변을 저장하지 못했어요'
      return null
    }
    answers.value = [...answers.value, data as AnnotationAnswer]
    return data as AnnotationAnswer
  }

  async function removeAnswer(id: string): Promise<boolean> {
    const sb = await getSupabase()
    if (!sb || !currentUser.value) return false
    const { error: e } = await sb.from('annotation_answers').delete().eq('id', id)
    if (e) {
      error.value = e.message
      return false
    }
    answers.value = answers.value.filter((a) => a.id !== id)
    return true
  }

  async function setResolved(annotationId: string, val: boolean): Promise<boolean> {
    const ok = await setQuestionResolved(annotationId, val)
    if (!ok) error.value = '해결 처리에 실패했어요 (관리자만 가능)'
    else items.value = items.value.map((a) => (a.id === annotationId ? { ...a, resolved: val } : a))
    return ok
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
    answersFor: (annotationId) => answers.value.filter((a) => a.annotation_id === annotationId),
    addAnswer,
    removeAnswer,
    setResolved,
  }
  cache.set(key, { api, items })

  // 로그인/로그아웃 시 재조회(로그아웃이면 비운다). 백엔드 미설정이면 reload 가 즉시 no-op.
  scope.run(() => watch(currentUser, () => void reload(), { immediate: true }))

  return api
}

// 해결 토글 — resolved 칼럼만 바꾸는 security definer RPC(관리자 검사 내장, schema.sql §6).
// 챕터 패널과 포털 큐 양쪽에서 쓰므로 독립 함수. 열려 있는 챕터 캐시에도 반영한다.
export async function setQuestionResolved(id: string, val: boolean): Promise<boolean> {
  if (!currentUser.value) return false
  const sb = await getSupabase()
  if (!sb) return false
  const { error } = await sb.rpc('set_resolved', { aid: id, val })
  if (error) return false
  for (const { items } of cache.values()) {
    if (items.value.some((a) => a.id === id)) {
      items.value = items.value.map((a) => (a.id === id ? { ...a, resolved: val } : a))
    }
  }
  return true
}

// 미해결 질문 큐 — 관리자 뷰(포털)용. 전 부를 한 번에 본다(read_all 이라 조회 가능).
// annotations_queue_idx (kind, resolved) where kind='question' 인덱스가 받쳐준다.
export async function fetchOpenQuestions(): Promise<Annotation[]> {
  if (!currentUser.value) return []
  const sb = await getSupabase()
  if (!sb) return []
  const { data, error } = await sb
    .from('annotations')
    .select(COLS)
    .eq('kind', 'question')
    .eq('resolved', false)
    .order('created_at', { ascending: true })
  if (error || !data) return []
  return data as Annotation[]
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
