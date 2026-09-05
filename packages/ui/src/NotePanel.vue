<script setup lang="ts">
// 한 항목(섹션 등)의 협업 주석 패널 — 동료 메모·질문 스레드 + 작성 폼 + 'AI에게 묻기'.
// 자체 완결 scoped 스타일(AuthPanel 방식) — Tailwind @source 의존 없음.
// 설계: docs/todo_협업주석_260716.md · 읽기=로그인 전원(공유), 쓰기=본인.
import { computed, ref } from 'vue'
import {
  currentUser,
  isAdmin,
  useChapterAnnotations,
  type Annotation,
  type AnnotationKind,
} from '@series/store'
import { dispatchNoteAsk } from './noteAsk'

const props = defineProps<{ part: number; chapter: string; itemId: string; label: string }>()
defineEmits<{ close: [] }>()

const store = useChapterAnnotations(props.part, props.chapter)
const list = computed(() => store.itemsFor(props.itemId))

// 본인 글 판별 — 내 화면에서만 계산된다(user_id 는 불투명 UUID 라 남의 신원은 알 수 없다).
const isMine = (a: Annotation) => !!currentUser.value && a.user_id === currentUser.value.id

const body = ref('')
const kind = ref<AnnotationKind>('note')
const busy = ref(false)
const editingId = ref<string | null>(null)
const editBody = ref('')

async function submit() {
  const text = body.value.trim()
  if (!text || busy.value) return
  busy.value = true
  const created = await store.add(props.itemId, kind.value, text)
  busy.value = false
  if (!created) return
  body.value = ''
  // 질문은 쓰자마자 AI 에게 넘겨준다 — 사람 답변(P3)을 기다리지 않고 바로 답을 받게.
  if (created.kind === 'question') askAi(created.id, created.body)
}

function askAi(annotationId: string, question: string) {
  dispatchNoteAsk({ annotationId, question, context: props.label })
}

function startEdit(id: string, current: string) {
  editingId.value = id
  editBody.value = current
}
async function saveEdit(id: string) {
  const text = editBody.value.trim()
  if (!text) return
  busy.value = true
  const ok = await store.edit(id, text)
  busy.value = false
  if (ok) editingId.value = null
}
async function remove(id: string) {
  if (!confirm('이 메모를 지울까요?')) return
  busy.value = true
  await store.remove(id)
  busy.value = false
}

// ── P3: 강사 답변(관리자) + 해결 처리 ──
const answeringId = ref<string | null>(null)
const answerBody = ref('')

function startAnswer(id: string) {
  answeringId.value = id
  answerBody.value = ''
}
async function submitAnswer(id: string) {
  const text = answerBody.value.trim()
  if (!text || busy.value) return
  busy.value = true
  const created = await store.addAnswer(id, text)
  busy.value = false
  if (created) {
    answeringId.value = null
    answerBody.value = ''
  }
}
async function removeAnswer(id: string) {
  if (!confirm('이 답변을 지울까요?')) return
  busy.value = true
  await store.removeAnswer(id)
  busy.value = false
}
async function toggleResolved(a: Annotation) {
  if (busy.value) return
  busy.value = true
  await store.setResolved(a.id, !a.resolved)
  busy.value = false
}

// '2026-07-16T…' → '7/16 14:03'
function when(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`
}
</script>

<template>
  <div class="np" @click.stop>
    <div class="np-head">
      <p class="np-title">💬 {{ props.label }}</p>
      <button class="np-x" type="button" aria-label="닫기" @click="$emit('close')">✕</button>
    </div>

    <!-- 비로그인: 공유 층이라 열람·작성 모두 로그인 필요 -->
    <p v-if="!currentUser" class="np-empty">
      로그인하면 이 부분에 <b>메모</b>를 남기고 <b>질문</b>할 수 있어요.<br />
      동료가 남긴 메모도 함께 보여요 — 모두 <b>익명</b>이에요.
    </p>

    <template v-else>
      <p v-if="store.loading.value && list.length === 0" class="np-empty">불러오는 중…</p>
      <p v-else-if="list.length === 0" class="np-empty">아직 메모가 없어요. 첫 메모를 남겨보세요.</p>

      <ul v-else class="np-list">
        <li v-for="a in list" :key="a.id" class="np-item">
          <!-- 작성자는 표시하지 않는다(익명). '내 글' 은 본인 화면에서만 계산돼 남에겐 안 보인다. -->
          <div class="np-meta">
            <span class="np-kind" :class="a.kind">{{ a.kind === 'question' ? '질문' : '메모' }}</span>
            <span v-if="isMine(a)" class="np-mine">내 글</span>
            <span class="np-time">{{ when(a.created_at) }}</span>
            <span v-if="a.kind === 'question' && a.resolved" class="np-done">해결됨</span>
          </div>

          <template v-if="editingId === a.id">
            <textarea v-model="editBody" class="np-ta" rows="3" maxlength="2000"></textarea>
            <div class="np-row">
              <button class="np-go" type="button" :disabled="busy" @click="saveEdit(a.id)">저장</button>
              <button class="np-link" type="button" @click="editingId = null">취소</button>
            </div>
          </template>
          <p v-else class="np-body">{{ a.body }}</p>

          <div v-if="a.ai_answer" class="np-ai">
            <span class="np-ai-tag">🤖 AI 답변</span>
            <p class="np-ai-body">{{ a.ai_answer }}</p>
          </div>

          <!-- 사람(강사) 답변 — 익명 원칙: 이름 없이 "강사" 배지만 (작성 권한이 관리자뿐) -->
          <div v-for="ans in store.answersFor(a.id)" :key="ans.id" class="np-ha">
            <div class="np-ha-head">
              <span class="np-ha-tag">🎓 강사 답변</span>
              <span class="np-time">{{ when(ans.created_at) }}</span>
              <button
                v-if="currentUser && ans.user_id === currentUser.id"
                class="np-link np-del"
                type="button"
                @click="removeAnswer(ans.id)"
              >
                삭제
              </button>
            </div>
            <p class="np-ha-body">{{ ans.body }}</p>
          </div>

          <!-- 강사 답변 작성 폼 (관리자 전용) -->
          <div v-if="answeringId === a.id" class="np-ha-form">
            <textarea
              v-model="answerBody"
              class="np-ta"
              rows="3"
              maxlength="4000"
              placeholder="강사 답변 — 질문자와 동료 모두에게 보여요"
            ></textarea>
            <div class="np-row">
              <button class="np-go" type="button" :disabled="busy || !answerBody.trim()" @click="submitAnswer(a.id)">
                {{ busy ? '저장 중…' : '답변 저장' }}
              </button>
              <button class="np-link" type="button" @click="answeringId = null">취소</button>
            </div>
          </div>

          <div v-if="editingId !== a.id" class="np-row">
            <button
              v-if="a.kind === 'question'"
              class="np-link"
              type="button"
              @click="askAi(a.id, a.body)"
            >
              🤖 AI에게 묻기
            </button>
            <template v-if="isAdmin && a.kind === 'question'">
              <button v-if="answeringId !== a.id" class="np-link" type="button" @click="startAnswer(a.id)">
                🎓 답변 달기
              </button>
              <button class="np-link" type="button" @click="toggleResolved(a)">
                {{ a.resolved ? '해결 취소' : '해결됨 표시' }}
              </button>
            </template>
            <button v-if="isMine(a)" class="np-link" type="button" @click="startEdit(a.id, a.body)">수정</button>
            <!-- 삭제 = 본인 또는 관리자(모더레이션 — 서버 RLS del_admin 이 진짜 경계) -->
            <button v-if="isMine(a) || isAdmin" class="np-link np-del" type="button" @click="remove(a.id)">삭제</button>
          </div>
        </li>
      </ul>

      <!-- 작성 -->
      <div class="np-form">
        <div class="np-tabs">
          <button type="button" :class="{ on: kind === 'note' }" @click="kind = 'note'">메모</button>
          <button type="button" :class="{ on: kind === 'question' }" @click="kind = 'question'">
            질문
          </button>
        </div>
        <textarea
          v-model="body"
          class="np-ta"
          rows="3"
          maxlength="2000"
          :placeholder="
            kind === 'question'
              ? '이 부분에서 막힌 점을 물어보세요 — AI가 바로 답해요'
              : '이 부분에 남길 메모 (익명으로 동료에게도 보여요)'
          "
        ></textarea>
        <p v-if="store.error.value" class="np-err">{{ store.error.value }}</p>
        <button class="np-go" type="button" :disabled="busy || !body.trim()" @click="submit">
          {{ busy ? '저장 중…' : kind === 'question' ? '질문하고 AI에게 묻기' : '메모 남기기' }}
        </button>
        <p class="np-note">익명으로 남습니다 — 이름은 표시되지 않아요.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.np {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 50;
  width: min(360px, calc(100vw - 2rem));
  max-height: 70vh;
  overflow-y: auto;
  padding: 12px;
  background: var(--c-white);
  border: 1px solid var(--c-slate-200);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  text-align: left;
  font-size: 13px;
  color: var(--c-slate-700);
  cursor: default;
}
.np-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.np-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-slate-900);
  line-height: 1.4;
}
.np-x {
  flex: none;
  border: none;
  background: none;
  color: var(--c-slate-500);
  cursor: pointer;
  font-size: 13px;
}
.np-x:hover {
  color: var(--c-slate-600);
}
.np-empty {
  margin: 0;
  padding: 10px 2px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--c-slate-500);
}
.np-list {
  margin: 0 0 10px;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.np-item {
  padding: 8px 10px;
  background: var(--c-slate-50);
  border: 1px solid var(--c-grid);
  border-radius: 10px;
}
.np-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 11px;
  color: var(--c-slate-500);
}
.np-kind {
  padding: 1px 6px;
  border-radius: 999px;
  font-weight: 600;
  background: var(--c-indigo-50);
  color: var(--c-indigo-600);
}
.np-kind.question {
  background: var(--c-amber-100);
  color: var(--c-amber-700);
}
.np-mine {
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--c-slate-100);
  color: var(--c-slate-500);
  font-weight: 600;
}
.np-done {
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--c-green-100);
  color: var(--c-green-700);
  font-weight: 600;
}
.np-body {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  color: var(--c-slate-700);
}
.np-ai {
  margin-top: 6px;
  padding: 6px 8px;
  background: var(--c-white);
  border: 1px dashed var(--c-indigo-200);
  border-radius: 8px;
}
.np-ai-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-indigo-600);
}
.np-ai-body {
  margin: 2px 0 0;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  color: var(--c-slate-600);
}
.np-ha {
  margin-top: 6px;
  padding: 6px 8px;
  background: var(--c-emerald-50);
  border: 1px solid var(--c-emerald-200);
  border-radius: 8px;
}
.np-ha-head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.np-ha-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-emerald-700);
}
.np-ha-body {
  margin: 2px 0 0;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  color: var(--c-slate-700);
}
.np-ha-form {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.np-row {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.np-link {
  padding: 0;
  border: none;
  background: none;
  font-size: 11px;
  /* 본문 링크 텍스트는 indigo-600(라이트 6.3:1) — indigo-500 은 4.47:1 로 AA 미달 */
  color: var(--c-indigo-600);
  cursor: pointer;
}
.np-link:hover {
  text-decoration: underline;
}
.np-del {
  color: var(--c-slate-500);
}
.np-del:hover {
  color: var(--c-red-600);
}
.np-form {
  border-top: 1px solid var(--c-slate-100);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.np-tabs {
  display: flex;
  gap: 4px;
}
.np-tabs button {
  flex: 1;
  padding: 5px;
  font-size: 12px;
  border: 1px solid var(--c-slate-200);
  border-radius: 8px;
  background: var(--c-slate-50);
  color: var(--c-slate-500);
  cursor: pointer;
}
.np-tabs button.on {
  background: var(--c-indigo-50);
  border-color: var(--c-indigo-200);
  color: var(--c-indigo-600);
  font-weight: 600;
}
.np-ta {
  width: 100%;
  padding: 8px 10px;
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  color: var(--c-slate-700);
  border: 1px solid var(--c-slate-200);
  border-radius: 8px;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
}
.np-ta:focus {
  border-color: var(--c-indigo-300);
}
.np-err {
  margin: 0;
  font-size: 11px;
  color: var(--c-red-600);
}
.np-go {
  padding: 7px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-white);
  background: var(--c-indigo-600);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.np-go:disabled {
  opacity: 0.5;
  cursor: default;
}
.np-note {
  margin: 0;
  font-size: 10px;
  color: var(--c-slate-500);
  text-align: center;
}
</style>
