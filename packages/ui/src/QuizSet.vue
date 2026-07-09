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

const props = withDefaults(defineProps<{ title?: string }>(), { title: '연습 문제' })
const emit = defineEmits<{ completed: [] }>()

const registered = reactive(new Set<string>())
const solved = reactive(new Set<string>())

// 풀이 현황을 localStorage 에 저장 — 새로고침·이탈 후에도 푼 문제가 유지된다.
// 키는 세트 제목(챕터마다 고유)이고, 값은 맞힌 문제의 uid(질문 문자열) 배열.
// 접두사(la/diff/stat/tf/it)는 앱이 storagePrefixKey 로 주입 — 부별 진도 격리.
const storagePrefix = inject(storagePrefixKey, 'la')
const storageKey = `${storagePrefix}-quizset-v1:${props.title}`
function loadPersisted(): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    // 손상된 저장값이 세트 집계를 깨뜨리지 않게 형태 검증
    return new Set(
      Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [],
    )
  } catch {
    return new Set()
  }
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
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">문제 세트 완료. 모든 문제를 풀었습니다.</p>
    </div>
  </section>
</template>
