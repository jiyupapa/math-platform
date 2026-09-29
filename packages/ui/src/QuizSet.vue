<script setup lang="ts">
// 여러 Quiz 를 묶는 문제 세트. 안에 든 Quiz 의 풀이 현황을 자동 집계해
// "n / 전체" 진행률과 완료 축하를 보여준다.
// 모든 문제를 풀면 'completed' 이벤트 발생 (챕터가 진도 처리에 활용).
//
// 사용 예:
//   <QuizSet title="연습 문제" @completed="progress.markDone('ch1')">
//     <Quiz ... /> <Quiz ... /> ...
//   </QuizSet>
import { reactive, computed, provide, watch, inject } from 'vue'
import { quizGroupKey, type QuizGroup } from './quizGroup'
import { storagePrefixKey } from './injection'
import { QUIZ_UID_ALIASES, QUIZSET_TITLE_ALIASES } from './quizAliases'

const props = withDefaults(defineProps<{ title?: string }>(), { title: '연습 문제' })
const emit = defineEmits<{ completed: [] }>()

const registered = reactive(new Set<string>())
const solved = reactive(new Set<string>())

// 풀이 현황을 localStorage 에 저장 — 새로고침·이탈 후에도 푼 문제가 유지된다.
// 키는 세트 제목(챕터마다 고유)이고, 값은 맞힌 문제의 uid(질문 문자열) 배열.
// 접두사(la/diff/stat/tf/it)는 앱이 storagePrefixKey 로 주입 — 부별 진도 격리.
const storagePrefix = inject(storagePrefixKey, 'la')
const storageKey = `${storagePrefix}-quizset-v1:${props.title}`

// 문항 문구·세트 제목을 고친 뒤에도 이미 푼 기록을 이어 읽는다 — 옛 문구 → 새 문구 표는
// quizAliases.ts(scripts/quiz-aliases.mjs 가 생성, 커밋 훅이 확인). 연쇄 변경(A→B→C)도 따라간다.
const resolveUid = (uid: string) => {
  let cur = uid
  for (let hop = 0; hop < 8 && QUIZ_UID_ALIASES[cur]; hop++) cur = QUIZ_UID_ALIASES[cur]
  return cur
}
function legacyKeys(): string[] {
  const olds: string[] = []
  let frontier = [props.title]
  while (frontier.length && olds.length < 8) {
    const next = Object.keys(QUIZSET_TITLE_ALIASES).filter(
      (o) => frontier.includes(QUIZSET_TITLE_ALIASES[o]) && o !== props.title && !olds.includes(o),
    )
    olds.push(...next)
    frontier = next
  }
  return olds.map((t) => `${storagePrefix}-quizset-v1:${t}`)
}
function loadPersisted(): Set<string> {
  const out = new Set<string>()
  for (const key of [storageKey, ...legacyKeys()]) {
    try {
      const raw = localStorage.getItem(key)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      // 손상된 저장값이 세트 집계를 깨뜨리지 않게 형태 검증
      if (Array.isArray(parsed)) for (const s of parsed) if (typeof s === 'string') out.add(resolveUid(s))
    } catch {
      /* 손상된 값·localStorage 사용 불가는 건너뛴다 */
    }
  }
  return out
}
function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...solved]))
  } catch {
    /* localStorage 사용 불가 환경은 무시 */
  }
}
const persisted = loadPersisted()

const group: QuizGroup = {
  register: (id) => {
    registered.add(id)
    if (persisted.has(id)) {
      solved.add(id)
      return true // 자식 Quiz 가 스스로를 정답 상태로 복원
    }
    return false
  },
  report: (id) => {
    solved.add(id)
    persist()
  },
}
provide(quizGroupKey, group)

const total = computed(() => registered.size)
const done = computed(() => solved.size)
const percent = computed(() => (total.value === 0 ? 0 : Math.round((done.value / total.value) * 100)))
const allDone = computed(() => total.value > 0 && done.value === total.value)

watch(allDone, (v) => {
  if (v) emit('completed')
})
</script>

<template>
  <section class="my-8">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-xl font-bold">📝 {{ title }}</h2>
      <span class="text-sm font-medium text-slate-500">{{ done }} / {{ total }} 완료</span>
    </div>

    <!-- 세트 진행률 -->
    <div class="mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        class="h-full rounded-full bg-indigo-500 transition-all"
        :style="{ width: percent + '%' }"
      />
    </div>

    <slot />

    <div
      v-if="allDone"
      class="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">문제 세트 완료. 모든 문제를 풀었습니다.</p>
    </div>
  </section>
</template>
