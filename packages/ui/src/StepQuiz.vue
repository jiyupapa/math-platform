<script setup lang="ts">
// 단계별 계산 퀴즈. 공식의 중간 단계를 하나씩 직접 입력하게 한다.
// 각 단계는 "왼쪽 수식(lhs) = [입력칸]" 형태. 채점하면 단계마다 ✓/✗ 표시,
// 모든 단계가 맞아야 정답 처리(QuizSet 에 보고).
//
// 사용 예:
//   <StepQuiz
//     question="벡터 (3,4) 의 길이는?"
//     :steps="[
//       { lhs: '3^2', answer: 9 },
//       { lhs: '4^2', answer: 16 },
//       { lhs: '9 + 16', answer: 25 },
//       { lhs: '\\sqrt{25}', answer: 5 },
//     ]"
//     explanation="..." difficulty="medium" />
import { ref, computed, onMounted, inject } from 'vue'
import { MathBlock } from '@series/ui'
import { quizGroupKey, type QuizGroup } from './quizGroup'
import NoteMarker from './NoteMarker.vue'
import { anchorChapter, anchorLabelOf } from './anchor'

interface Step {
  /** 등호 왼쪽에 보일 KaTeX 수식 */
  lhs: string
  answer: number
  tolerance?: number
}
type Difficulty = 'easy' | 'medium' | 'hard'

const props = withDefaults(
  defineProps<{
    question: string
    steps: Step[]
    explanation?: string
    hints?: string[]
    difficulty?: Difficulty
    /** 협업 주석 앵커(P0, 선택) — {chapter}-quiz-{slug}. 붙이면 문제 머리에 💬 마커 */
    anchorId?: string
  }>(),
  { hints: () => [] },
)

const emit = defineEmits<{ solved: [] }>()

const inputs = ref<(number | string)[]>(props.steps.map(() => ''))
const marks = ref<('none' | 'ok' | 'no')[]>(props.steps.map(() => 'none'))
const solved = ref(false)
const revealedHints = ref(0)
// 오답 채점 횟수 — 2번 이상 틀리면 "해설 보기" 출구를 연다
const wrongCount = ref(0)
const explanationShown = ref(false)

const canSubmit = computed(() => inputs.value.every((v) => String(v).trim() !== ''))

// QuizSet 연동. 지난 방문에 맞힌 문제면 정답 상태(입력·체크 포함)로 복원.
const group = inject<QuizGroup | null>(quizGroupKey, null)
const uid = props.question
onMounted(() => {
  if (group?.register(uid)) {
    solved.value = true
    inputs.value = props.steps.map((s) => s.answer)
    marks.value = props.steps.map(() => 'ok')
  }
})

function check() {
  let allOk = true
  marks.value = props.steps.map((s, i) => {
    const val = Number(inputs.value[i])
    const ok = !Number.isNaN(val) && Math.abs(val - s.answer) <= (s.tolerance ?? 1e-9)
    if (!ok) allOk = false
    return ok ? 'ok' : 'no'
  })
  if (allOk && !solved.value) {
    solved.value = true
    emit('solved')
    group?.report(uid)
  } else if (!allOk) {
    wrongCount.value++
  }
}

function showHint() {
  if (revealedHints.value < props.hints.length) revealedHints.value++
}

function reset() {
  inputs.value = props.steps.map(() => '')
  marks.value = props.steps.map(() => 'none')
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
      <span>단계별 계산</span>
      <span
        v-if="difficulty"
        class="rounded-full px-2 py-0.5 text-xs font-medium"
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

    <!-- 단계 입력 -->
    <div class="space-y-2">
      <div
        v-for="(s, i) in steps"
        :key="i"
        class="flex flex-wrap items-center gap-2 rounded-lg px-2 py-1.5"
        :class="
          marks[i] === 'ok' ? 'bg-emerald-50' : marks[i] === 'no' ? 'bg-rose-50' : ''
        "
      >
        <span class="w-5 text-right text-xs text-slate-500">{{ i + 1 }}.</span>
        <MathBlock inline :expr="s.lhs" />
        <span class="font-bold text-slate-500">=</span>
        <input
          v-model="inputs[i]"
          type="number"
          inputmode="decimal"
          step="any"
          class="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-indigo-400 focus:outline-none"
          :disabled="solved"
          @keyup.enter="canSubmit && check()"
        />
        <span v-if="marks[i] === 'ok'" class="text-emerald-700">✓</span>
        <span v-else-if="marks[i] === 'no'" class="text-rose-700">✗ 다시</span>
      </div>
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
      v-if="solved"
      class="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      ✅ 모든 단계 정답
      <p v-if="explanation" class="mt-1 leading-relaxed text-emerald-900/80">{{ explanation }}</p>
    </div>

    <!-- 2번 이상 틀리면 해설을 열어볼 수 있다 -->
    <div
      v-if="explanationShown && !solved && explanation"
      class="mt-3 rounded-lg bg-sky-50 px-4 py-3 text-sm text-sky-800"
    >
      📖 해설: {{ explanation }}
      <p class="mt-1 text-xs text-sky-700">해설을 읽었다면 다시 계산해서 정답을 맞혀 보세요 — 그래야 완료로 기록돼요.</p>
    </div>

    <!-- 버튼 -->
    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-if="!solved"
        type="button"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!canSubmit"
        @click="check"
      >
        채점하기
      </button>
      <button
        v-if="hints.length > 0 && revealedHints < hints.length && !solved"
        type="button"
        class="rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-200"
        @click="showHint"
      >
        힌트 보기 ({{ revealedHints }}/{{ hints.length }})
      </button>
      <button
        v-if="marks.includes('no') && !solved"
        type="button"
        class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
        @click="reset"
      >
        지우고 다시
      </button>
      <button
        v-if="wrongCount >= 2 && !explanationShown && explanation && !solved"
        type="button"
        class="rounded-lg bg-sky-100 px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-200"
        @click="explanationShown = true"
      >
        📖 막혔어요 — 해설 보기
      </button>
    </div>
  </div>
</template>
