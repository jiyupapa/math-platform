<script setup lang="ts">
// 자동채점 퀴즈. 세 가지 유형 지원:
//   - mc        : 객관식 (보기 중 하나)
//   - truefalse : 참/거짓 (O / X)
//   - numeric   : 숫자 입력
// 공통: 단계별 힌트, 채점 후 해설, 정답 시 'solved' 이벤트.
// QuizSet 안에 넣으면 풀이 현황이 자동 집계된다(provide/inject).
// 난이도 배지(difficulty)는 선택.
//
// 사용 예:
//   <Quiz question="..." :choices="['A','B']" :answer="1" :hints="['...']" explanation="..." />
//   <Quiz question="..." type="truefalse" :answer="0" explanation="..." />   // 0 = 참(O), 1 = 거짓(X)
//   <Quiz question="..." type="numeric" :answer="5" :tolerance="0.01" explanation="..." />
import { ref, computed, onMounted, inject } from 'vue'
import type { QuizGroup } from './quizGroup'
import { quizGroupKey } from './quizGroup'
import NoteMarker from './NoteMarker.vue'
import { anchorChapter, anchorLabelOf } from './anchor'

type QuizType = 'mc' | 'truefalse' | 'numeric'
type Difficulty = 'easy' | 'medium' | 'hard'

const props = withDefaults(
  defineProps<{
    question: string
    type?: QuizType
    choices?: string[]
    /** mc: 정답 보기 index / truefalse: 0=참(O) 1=거짓(X) / numeric: 정답 숫자 */
    answer: number
    /** numeric 허용 오차 */
    tolerance?: number
    hints?: string[]
    explanation?: string
    difficulty?: Difficulty
    /** 협업 주석 앵커(P0, 선택) — {chapter}-quiz-{slug}. 붙이면 문제 머리에 💬 마커 */
    anchorId?: string
  }>(),
  { type: 'mc', tolerance: 1e-9, hints: () => [] },
)

const emit = defineEmits<{ solved: [] }>()

// 참/거짓은 내부적으로 객관식처럼 다룬다: 0 = 참(O), 1 = 거짓(X)
const tfChoices = ['참 (O)', '거짓 (X)']
const effectiveChoices = computed(() => (props.type === 'truefalse' ? tfChoices : props.choices ?? []))
const isChoice = computed(() => props.type === 'mc' || props.type === 'truefalse')

const selected = ref<number | null>(null)
// type="number" input 의 v-model 은 Vue 가 number 로 캐스팅하므로 문자열/숫자 모두 가능 (빈칸일 때만 '')
const numInput = ref<number | string>('')
const result = ref<'none' | 'correct' | 'wrong'>('none')
const revealedHints = ref(0)
// 오답 횟수 — 2번 이상 틀리면 "해설 보기" 출구를 연다 (막힌 학습자를 위한 마지막 출구)
const wrongCount = ref(0)
const explanationShown = ref(false)

const canSubmit = computed(() =>
  isChoice.value ? selected.value !== null : String(numInput.value).trim() !== '',
)

// QuizSet 연동: 등록 후 정답 시 보고. 지난 방문에 맞힌 문제면 정답 상태로 복원.
const group = inject<QuizGroup | null>(quizGroupKey, null)
const uid = props.question
onMounted(() => {
  if (group?.register(uid)) {
    result.value = 'correct'
    if (isChoice.value) selected.value = props.answer
    else numInput.value = props.answer
  }
})

function check() {
  let ok = false
  if (isChoice.value) {
    ok = selected.value === props.answer
  } else {
    const val = Number(numInput.value)
    ok = !Number.isNaN(val) && Math.abs(val - props.answer) <= props.tolerance
  }
  result.value = ok ? 'correct' : 'wrong'
  if (ok) {
    emit('solved')
    group?.report(uid)
  } else {
    wrongCount.value++
  }
}

function showHint() {
  if (props.hints && revealedHints.value < props.hints.length) revealedHints.value++
}

// 오답 배너가 뜬 상태에서 답을 바꾸면 배너를 지운다 (이전 선택에 대한 판정이 남지 않게)
function pick(i: number) {
  selected.value = i
  if (result.value === 'wrong') result.value = 'none'
}
function onNumInput() {
  if (result.value === 'wrong') result.value = 'none'
}

function reset() {
  selected.value = null
  numInput.value = ''
  result.value = 'none'
}

const diffBadge: Record<Difficulty, { label: string; cls: string }> = {
  easy: { label: '쉬움', cls: 'bg-emerald-100 text-emerald-700' },
  medium: { label: '보통', cls: 'bg-amber-100 text-amber-700' },
  hard: { label: '어려움', cls: 'bg-rose-100 text-rose-700' },
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <div class="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-600">
      <span>✏️ 문제</span>
      <span
        v-if="difficulty"
        class="rounded-full px-2 py-0.5 text-[11px] font-medium"
        :class="diffBadge[difficulty].cls"
      >
        {{ diffBadge[difficulty].label }}
      </span>
      <NoteMarker
        v-if="anchorId"
        :item-id="anchorId"
        :chapter="anchorChapter(anchorId)"
        :label="anchorLabelOf(question)"
      />
    </div>
    <p class="mb-4 font-medium leading-relaxed">{{ question }}</p>

    <!-- 객관식 / 참거짓 -->
    <div v-if="type === 'truefalse'" class="flex gap-3">
      <button
        v-for="(c, i) in effectiveChoices"
        :key="i"
        type="button"
        class="flex-1 rounded-lg border px-4 py-3 text-center text-sm font-semibold transition-colors"
        :class="
          selected === i
            ? 'border-indigo-400 bg-indigo-50 text-indigo-800'
            : 'border-slate-200 hover:bg-slate-50'
        "
        :disabled="result === 'correct'"
        @click="pick(i)"
      >
        {{ c }}
      </button>
    </div>

    <div v-else-if="type === 'mc'" class="space-y-2">
      <button
        v-for="(c, i) in effectiveChoices"
        :key="i"
        type="button"
        class="block w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors"
        :class="
          selected === i
            ? 'border-indigo-400 bg-indigo-50 text-indigo-800'
            : 'border-slate-200 hover:bg-slate-50'
        "
        :disabled="result === 'correct'"
        @click="pick(i)"
      >
        <span class="mr-2 font-bold">{{ String.fromCharCode(65 + i) }}.</span>{{ c }}
      </button>
    </div>

    <!-- 숫자 입력 -->
    <div v-else>
      <input
        v-model="numInput"
        type="number"
        inputmode="decimal"
        step="any"
        placeholder="정답을 숫자로 입력"
        class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
        :disabled="result === 'correct'"
        @input="onNumInput"
        @keyup.enter="canSubmit && check()"
      />
    </div>

    <!-- 힌트 -->
    <div v-if="revealedHints > 0" class="mt-4 space-y-2">
      <div
        v-for="(h, i) in hints.slice(0, revealedHints)"
        :key="i"
        class="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800"
      >
        💡 힌트 {{ i + 1 }}: {{ h }}
      </div>
    </div>

    <!-- 결과 -->
    <div
      v-if="result === 'correct'"
      class="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      ✅ 정답
      <p v-if="explanation" class="mt-1 leading-relaxed text-emerald-900/80">{{ explanation }}</p>
    </div>
    <div
      v-else-if="result === 'wrong'"
      class="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      ❌ 오답입니다. 다시 풀어 보세요. <span v-if="hints.length > 0">(힌트를 참고하세요.)</span>
    </div>

    <!-- 2번 이상 틀리면 해설을 열어볼 수 있다 — 읽고 나서 다시 풀면 정답 처리 -->
    <div
      v-if="explanationShown && result !== 'correct' && explanation"
      class="mt-3 rounded-lg bg-sky-50 px-4 py-3 text-sm text-sky-800"
    >
      📖 해설: {{ explanation }}
      <p class="mt-1 text-xs text-sky-600">해설을 읽었다면 다시 풀어서 정답을 맞혀 보세요 — 그래야 완료로 기록돼요.</p>
    </div>

    <!-- 버튼 -->
    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-if="result !== 'correct'"
        type="button"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!canSubmit"
        @click="check"
      >
        채점하기
      </button>
      <button
        v-if="hints.length > 0 && revealedHints < hints.length && result !== 'correct'"
        type="button"
        class="rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-200"
        @click="showHint"
      >
        힌트 보기 ({{ revealedHints }}/{{ hints.length }})
      </button>
      <button
        v-if="result === 'wrong'"
        type="button"
        class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
        @click="reset"
      >
        다시 풀기
      </button>
      <button
        v-if="wrongCount >= 2 && !explanationShown && explanation && result !== 'correct'"
        type="button"
        class="rounded-lg bg-sky-100 px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-200"
        @click="explanationShown = true"
      >
        📖 막혔어요 — 해설 보기
      </button>
    </div>
  </div>
</template>
