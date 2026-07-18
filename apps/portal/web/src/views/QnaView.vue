<script setup lang="ts">
// 미해결 질문 큐 (협업 주석 P3) — 관리자(강사) 전용.
// 전 부의 kind=question · resolved=false 를 모아, 해당 챕터 항목으로 보내 답하게 한다.
// 익명 층이라 작성자는 표시하지 않는다(위치·본문·시각만). 답변 작성은 챕터의 💬 패널에서.
import { ref, onMounted, watch } from 'vue'
import {
  currentUser,
  isBackendEnabled,
  isAdmin,
  fetchOpenQuestions,
  setQuestionResolved,
  type Annotation,
} from '@series/store'
import { PART_META } from '../data/useProgress'

const loading = ref(true)
const questions = ref<Annotation[]>([])
const busyId = ref<string | null>(null)

async function load() {
  loading.value = true
  questions.value = currentUser.value && isAdmin.value ? await fetchOpenQuestions() : []
  loading.value = false
}
onMounted(load)
watch(currentUser, () => void load())

const partLabel = (p: number) => PART_META.find((m) => m.part === p)?.label ?? `${p}부`
// 조립 배포본 기준 딥링크(포털=/ · 각 부=/partN/). 앵커 id 로 섹션까지 점프.
// dev 단독 실행(포트 분리)에서는 열리지 않는다 — PartLink 와 같은 제약.
const linkFor = (q: Annotation) => `/part${q.part}/ch/${q.chapter}#${q.item_id}`
const when = (iso: string) => {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 답 없이도 닫을 수 있게(중복 질문·본문에 이미 설명된 경우) 큐에서 바로 해결 처리
async function resolve(q: Annotation) {
  if (busyId.value) return
  busyId.value = q.id
  const ok = await setQuestionResolved(q.id, true)
  busyId.value = null
  if (ok) questions.value = questions.value.filter((x) => x.id !== q.id)
}
</script>

<template>
  <section class="mx-auto max-w-3xl px-5 py-10">
    <h1 class="text-2xl font-bold text-slate-900">🎓 미해결 질문 큐</h1>
    <p class="mt-1 text-sm text-slate-500">
      학습자들이 챕터에 남긴 질문 중 아직 해결되지 않은 것들입니다. 질문을 열어 답변을 달면
      학습자 화면의 💬 패널에 <b>강사 답변</b>으로 표시됩니다. (질문은 익명입니다.)
    </p>

    <p v-if="!isBackendEnabled()" class="mt-8 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      백엔드(Supabase)가 설정되지 않았습니다.
    </p>
    <p v-else-if="!currentUser" class="mt-8 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      로그인이 필요합니다 — 우측 상단 "진도 지키기".
    </p>
    <p v-else-if="!isAdmin" class="mt-8 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      관리자(강사) 전용 화면입니다.
    </p>
    <p v-else-if="loading" class="mt-8 text-center text-sm text-slate-400">불러오는 중…</p>
    <p v-else-if="questions.length === 0" class="mt-8 rounded-lg bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-700">
      🎉 미해결 질문이 없습니다 — 전부 답했어요!
    </p>

    <ul v-else class="mt-6 space-y-3">
      <li v-for="q in questions" :key="q.id" class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span class="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">질문</span>
          <span class="font-medium text-slate-600">{{ partLabel(q.part) }} · {{ q.chapter }} · {{ q.item_id }}</span>
          <span>{{ when(q.created_at) }}</span>
          <span v-if="q.ai_answer" class="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-600">🤖 AI 답변 있음</span>
        </div>
        <p class="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{{ q.body }}</p>
        <div class="mt-3 flex items-center gap-3">
          <a
            :href="linkFor(q)"
            class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            챕터에서 답변하기 →
          </a>
          <button
            type="button"
            class="text-xs text-slate-400 hover:text-emerald-600 hover:underline"
            :disabled="busyId === q.id"
            @click="resolve(q)"
          >
            {{ busyId === q.id ? '처리 중…' : '답 없이 해결 처리' }}
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>
