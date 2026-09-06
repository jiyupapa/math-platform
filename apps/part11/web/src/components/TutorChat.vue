<script setup lang="ts">
// AI 튜터 챗봇 — 로컬 Ollama LLM 사용 (API 키·비용·인터넷 불필요, 오프라인 시연 가능).
// 현재 보고 있는 챕터의 맥락을 시스템 프롬프트에 주입해, 본문과 일치하는 답을 하도록 유도한다.
import { inject, ref, computed, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { chapters } from '@/data/chapters'
import { contextFor, curriculumIndex } from '@/data/tutorContext'
import { DEFAULT_MODEL, conceptGrounding, listModels, streamChat, type ChatMessage } from '@series/tutor'
import { partNumberKey } from '@series/ui'

interface UiMessage {
  role: 'user' | 'assistant'
  content: string
}

const route = useRoute()
const open = ref(false)
const input = ref('')
const busy = ref(false)
/** null = 아직 확인 안 함, false = 서버 없음 */
const serverOk = ref<boolean | null>(null)
const models = ref<string[]>([])
const model = ref(DEFAULT_MODEL)
const messages = ref<UiMessage[]>([])
const listEl = ref<HTMLElement | null>(null)
let aborter: AbortController | null = null

// 현재 챕터 슬러그 (챕터 페이지가 아니면 null → 전체 과정 소개 맥락)
const slug = computed(() => {
  const m = /^\/ch\/([\w-]+)$/.exec(route.path)
  return m ? m[1] : null
})
const chapterTitle = computed(
  () => chapters.find((c) => c.slug === slug.value)?.title ?? '전체 과정',
)

async function checkServer() {
  const found = await listModels()
  serverOk.value = found !== null
  if (found) {
    models.value = found
    if (!found.includes(model.value)) model.value = found[0] ?? DEFAULT_MODEL
  }
}

async function toggle() {
  open.value = !open.value
  if (open.value && serverOk.value === null) await checkServer()
}

// 주제 이탈 시 모델이 출력하는 신호. UI 가 감지해 안내 문구로 교체한다.
const OFFTOPIC = '[OFFTOPIC]'

// 시리즈 개념 그래프(빌드 산출물 concept-graph.json — npm run ontology:graph). 질문에 나온 개념의 카드를
// 시스템 프롬프트에 덧붙여, 다른 부에서 배우는 개념도 'N부 M장'으로 안내하게 한다. 없으면 접지 없이 동작.
const CONCEPT_GRAPH_URL = import.meta.env.BASE_URL + 'concept-graph.json'
// 이 부 번호(main.ts 가 주입) — 카드에 '이 과정 안 / 현재 과정 밖' 을 표시해 다른 부 개념을 지어내지 않게 한다
const CURRENT_PART = inject(partNumberKey, 0)

// 로컬 모델이 규칙을 어기고 답변 '끝'이나 중간에 [OFFTOPIC] 을 섞어 내보낼 때가 있다.
// 신호는 화면에 그대로 노출되면 안 되므로 위치와 상관없이 항상 걷어낸다.
// - 완성된 [OFFTOPIC] 은 제거. 끝에 걸친 부분 마커(예: '[OFFT')는 스트리밍 중 깜빡임을 막으려 잠시 감춘다.
function stripOfftopic(raw: string): { text: string; seen: boolean } {
  const seen = raw.includes(OFFTOPIC)
  let text = raw.split(OFFTOPIC).join('')
  for (let k = OFFTOPIC.length - 1; k > 0; k--) {
    if (text.endsWith(OFFTOPIC.slice(0, k))) {
      text = text.slice(0, -k)
      break
    }
  }
  return { text: text.trimStart(), seen }
}

function systemPrompt(): string {
  return (
    `너는 '수포자를 위한 에이전트와 추론의 수학' 학습 웹앱의 AI 튜터다. ` +
    `학습자는 중학교 수학까지만 기억하는 성인이며 수학에 공포가 있다.\n` +
    `규칙: (1) 반드시 한국어 존댓말. (2) 새 용어·기호는 즉시 풀어서 설명. ` +
    `(3) 수식보다 비유·직관 먼저, LaTeX 대신 쉬운 일반 텍스트로. (4) 5문장 이내로 짧게. ` +
    `(5) 아래 챕터 맥락과 네 지식이 다르면 챕터 맥락을 우선. (6) 모르면 모른다고 말하기. ` +
    `(7) 학습자를 절대 무시하지 않고 격려하기.\n` +
    `(8) 어떤 개념을 어디서 배우는지 물으면 아래 전체 목차와 [개념 카드]에서 찾아 반드시 'N부 M장' 형태로 ` +
    `안내하기(이 과정 안이면 'N장'). 목차에도 개념 카드에도 없는 주제는 이 시리즈에 없다고 솔직히 말하기.\n` +
    `가장 중요한 규칙: 너는 오직 수학·AI(에이전트·과업 사슬·확률의 곱·재시도·Best-of-N·기하분포·이항분포·다수결 self-consistency·검증자 verifier·베이즈·조건부 확률·추론 시점 컴퓨트 test-time compute·탐색 트리·빔 서치·멀티에이전트·컨텍스트 윈도·pass@k·궤적 평가·관련 수학·이 앱의 학습 내용·수학 학습 고민)와 ` +
    `간단한 인사에만 답한다. 연예·게임·요리·주식·코딩 대행·글쓰기 대행 등 학습과 무관한 ` +
    `요청이면 다른 말 없이 정확히 ${OFFTOPIC} 이라고만 출력하라.\n` +
    `${curriculumIndex}\n` +
    `현재 학습자가 보고 있는 챕터 맥락:\n${contextFor(slug.value)}`
  )
}

async function scrollToBottom() {
  await nextTick()
  listEl.value?.scrollTo({ top: listEl.value.scrollHeight })
}

async function send() {
  const q = input.value.trim()
  if (!q || busy.value || serverOk.value !== true) return
  input.value = ''
  messages.value.push({ role: 'user', content: q })
  messages.value.push({ role: 'assistant', content: '' })
  busy.value = true
  await scrollToBottom()

  // 최근 3왕복만 유지해 경량 모델의 컨텍스트를 아낀다
  const history: ChatMessage[] = messages.value
    .slice(0, -1)
    .slice(-7)
    .map((m) => ({ role: m.role, content: m.content }))
  // 질문에 나온 개념의 카드(다른 부 위치 포함) — 그래프를 못 읽으면 '' (접지 없이 진행)
  const grounding = await conceptGrounding(CONCEPT_GRAPH_URL, q, { currentPart: CURRENT_PART })
  const payload: ChatMessage[] = [{ role: 'system', content: systemPrompt() + grounding }, ...history]

  aborter = new AbortController()
  const last = messages.value[messages.value.length - 1]
  try {
    // 주제 이탈 신호([OFFTOPIC])는 위치와 상관없이 걷어내고, 신호만 오고 실제 내용이
    // 없을 때만 안내 문구로 교체한다. 답변에 신호가 섞여 나와도 화면엔 걷어낸 텍스트만 표시.
    let raw = ''
    let offtopic = false
    for await (const delta of streamChat(model.value, payload, aborter.signal)) {
      raw += delta
      const { text, seen } = stripOfftopic(raw)
      // 순수 주제이탈: [OFFTOPIC] 신호만 오고 실제 내용이 없으면 안내 문구로 교체
      if (seen && text.trim() === '') {
        offtopic = true
        break
      }
      last.content = text
      await scrollToBottom()
    }
    if (offtopic) {
      aborter.abort()
      last.content =
        `저는 수학·AI 공부를 돕는 튜터라 그 주제는 도와드릴 수 없어요 😊\n` +
        `대신 지금 보고 계신 「${chapterTitle.value}」 내용은 무엇이든 물어보세요!`
    } else {
      last.content = stripOfftopic(raw).text || '(답변을 생성하지 못했어요 — 다시 시도해 보세요.)'
    }
  } catch (e) {
    if ((e as Error).name !== 'AbortError') {
      last.content += '\n\n(⚠️ 연결이 끊겼어요. Ollama 가 실행 중인지 확인해 주세요.)'
      serverOk.value = null
    }
  } finally {
    busy.value = false
    aborter = null
    await scrollToBottom()
  }
}

function stop() {
  aborter?.abort()
}

function clearChat() {
  if (!busy.value) messages.value = []
}

onUnmounted(() => aborter?.abort())

const suggestions = [
  '방금 나온 개념을 더 쉬운 비유로 설명해 주세요',
  '90%짜리 AI가 왜 10단계 일은 35%만 성공해요?',
  '검수자를 붙이면 얼마나 믿을 수 있게 돼요?',
  'pass@k가 몇 장에 나오는지 까먹었어요',
]
function ask(s: string) {
  input.value = s
  send()
}

// 모델이 규칙을 어기고 $...$ LaTeX 나 굵게(**) 마크다운을 섞을 때가 있어 표시할 때 걷어낸다
function fmt(text: string): string {
  return text.replace(/\$([^$\n]+)\$/g, '$1').replace(/\*\*([^*\n]+)\*\*/g, '$1')
}

// 답변 속 "N장" 을 해당 챕터로 이동하는 링크로 바꾸기 위한 분해
interface Segment {
  text: string
  link?: string
}
function segments(text: string): Segment[] {
  const out: Segment[] = []
  let idx = 0
  for (const m of text.matchAll(/(\d{1,2})장/g)) {
    const n = Number(m[1])
    if (n < 1 || n > 12 || m.index === undefined) continue
    if (m.index > idx) out.push({ text: text.slice(idx, m.index) })
    out.push({ text: m[0], link: `/ch/ch${n}` })
    idx = m.index + m[0].length
  }
  if (idx < text.length) out.push({ text: text.slice(idx) })
  return out
}
</script>

<template>
  <!-- 플로팅 버튼 -->
  <button
    class="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-2xl text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-500"
    :aria-label="open ? 'AI 튜터 닫기' : 'AI 튜터 열기'"
    @click="toggle"
  >
    {{ open ? '✕' : '🤖' }}
  </button>

  <!-- 챗 패널 -->
  <div
    v-if="open"
    class="fixed bottom-24 right-5 z-40 flex max-h-[70vh] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
  >
    <!-- 헤더 -->
    <div class="border-b border-slate-100 bg-indigo-50 px-4 py-3">
      <div class="flex items-center justify-between gap-2">
        <p class="font-semibold text-indigo-900">🤖 AI 튜터</p>
        <select
          v-if="models.length > 0"
          v-model="model"
          class="max-w-[10rem] rounded-md border border-indigo-200 bg-white px-1.5 py-0.5 text-xs text-slate-600"
          title="모델 선택"
        >
          <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
      <p class="mt-0.5 text-xs text-indigo-600">지금 보는 내용: {{ chapterTitle }}</p>
    </div>

    <!-- Ollama 미실행 안내 -->
    <div v-if="serverOk === false" class="space-y-2 p-4 text-sm text-slate-600">
      <p class="font-medium text-slate-800">로컬 AI(Ollama)에 연결할 수 없어요.</p>
      <ol class="list-decimal space-y-1 pl-5">
        <li>Ollama 앱을 실행하세요 (또는 터미널에서 <code class="rounded bg-slate-100 px-1">ollama serve</code>)</li>
        <li>모델이 없다면: <code class="rounded bg-slate-100 px-1">ollama pull gemma4:e2b</code></li>
      </ol>
      <button
        class="mt-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        @click="checkServer"
      >
        다시 연결
      </button>
    </div>

    <template v-else>
      <!-- 메시지 목록 -->
      <div ref="listEl" class="flex-1 space-y-3 overflow-y-auto p-4">
        <div v-if="messages.length === 0" class="space-y-2">
          <p class="text-sm text-slate-500">
            공부하다 막히면 무엇이든 물어보세요. 지금 보고 있는 챕터를 알고 답해 드려요.
          </p>
          <button
            v-for="s in suggestions"
            :key="s"
            class="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"
            @click="ask(s)"
          >
            💬 {{ s }}
          </button>
        </div>
        <div
          v-for="(m, i) in messages"
          :key="i"
          class="max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed"
          :class="
            m.role === 'user'
              ? 'ml-auto bg-indigo-600 text-white'
              : 'mr-auto bg-slate-100 text-slate-800'
          "
        >
          <template v-if="m.role === 'assistant'">
            <template v-for="(seg, j) in segments(fmt(m.content))" :key="j">
              <RouterLink
                v-if="seg.link"
                :to="seg.link"
                class="font-semibold text-indigo-600 underline decoration-dotted underline-offset-2 hover:text-indigo-600"
              >{{ seg.text }}</RouterLink>
              <template v-else>{{ seg.text }}</template>
            </template>
          </template>
          <template v-else>{{ m.content }}</template><span v-if="busy && i === messages.length - 1" class="animate-pulse">▍</span>
        </div>
      </div>

      <!-- 입력 -->
      <div class="border-t border-slate-100 p-3">
        <div class="flex gap-2">
          <input
            v-model="input"
            type="text"
            placeholder="질문을 입력하세요…"
            class="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            :disabled="busy || serverOk !== true"
            @keyup.enter="send"
          />
          <button
            v-if="busy"
            class="rounded-lg bg-rose-100 px-3 py-2 text-sm font-medium text-rose-800 hover:bg-rose-200"
            @click="stop"
          >
            중지
          </button>
          <button
            v-else
            class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
            :disabled="!input.trim() || serverOk !== true"
            @click="send"
          >
            전송
          </button>
        </div>
        <div class="mt-1.5 flex items-center justify-between text-xs text-slate-500">
          <span>로컬 AI 답변 — 가끔 틀릴 수 있어요. 본문 설명이 우선!</span>
          <button v-if="messages.length" class="hover:text-slate-600" @click="clearChat">지우기</button>
        </div>
      </div>
    </template>
  </div>
</template>
