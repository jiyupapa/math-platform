<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { questions, confidenceItems } from '../data/diagnostic'
import { saveDiagnosis } from '../data/useDiagnosis'

const router = useRouter()
const answers = reactive<Record<string, number>>({})
const confidence = reactive<Record<string, number>>({})

const answeredCount = computed(() => questions.filter((q) => answers[q.id] !== undefined).length)
const allAnswered = computed(() => answeredCount.value === questions.length)

const confLabels = ['전혀', '조금', '보통', '꽤', '매우']

function submit() {
  if (!allAnswered.value) return
  saveDiagnosis({ answers: { ...answers }, confidence: { ...confidence }, savedAt: Date.now() })
  router.push('/')
}
</script>

<template>
  <main class="mx-auto max-w-2xl px-5 py-10">
    <h1 class="mb-1 text-2xl font-bold text-slate-900">경로 진단</h1>
    <p class="mb-6 text-slate-600">
      아래 문항으로 당신의 출발점을 가늠합니다. 모르면 편하게 찍어도 돼요 — 이건 시험이 아니라
      <strong>당신에게 맞는 경로를 짜기 위한 것</strong>입니다.
    </p>

    <!-- 진행 표시 -->
    <div class="sticky top-0 z-10 -mx-5 mb-6 border-b border-slate-200 bg-slate-50/90 px-5 py-2 backdrop-blur">
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-500">답변 {{ answeredCount }} / {{ questions.length }}</span>
        <div class="h-1.5 w-40 overflow-hidden rounded-full bg-slate-200">
          <div class="h-full rounded-full bg-indigo-500 transition-all" :style="{ width: (answeredCount / questions.length) * 100 + '%' }" />
        </div>
      </div>
    </div>

    <!-- 문항 -->
    <ol class="space-y-6">
      <li v-for="(q, i) in questions" :key="q.id" class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <p class="mb-3 font-medium text-slate-900">
          <span class="mr-1 text-slate-400">{{ i + 1 }}.</span> {{ q.prompt }}
        </p>
        <div class="grid gap-2">
          <button
            v-for="(choice, ci) in q.choices"
            :key="ci"
            type="button"
            class="rounded-lg border px-3 py-2 text-left text-sm transition"
            :class="answers[q.id] === ci
              ? 'border-indigo-500 bg-indigo-50 font-medium text-indigo-800'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'"
            @click="answers[q.id] = ci"
          >
            {{ choice }}
          </button>
        </div>
      </li>
    </ol>

    <!-- 자기보고(자신감) -->
    <section class="mt-8">
      <h2 class="mb-1 text-lg font-bold text-slate-800">마지막으로, 스스로 느끼기에…</h2>
      <p class="mb-4 text-sm text-slate-500">정답이 없는 문항이에요. 자신감이 낮으면 "이미 아는" 부분도 빠른 복습으로 안내합니다.</p>
      <div class="space-y-4">
        <div v-for="item in confidenceItems" :key="item.id" class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p class="mb-3 font-medium text-slate-900">{{ item.prompt }}</p>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              class="rounded-lg border px-1 py-2 text-center text-xs transition"
              :class="confidence[item.id] === n
                ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-800'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'"
              @click="confidence[item.id] = n"
            >
              <span class="block text-sm font-bold">{{ n }}</span>
              <span class="block">{{ confLabels[n - 1] }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 제출 -->
    <div class="mt-8 flex items-center gap-3">
      <button
        type="button"
        :disabled="!allAnswered"
        class="rounded-xl px-6 py-3 font-semibold text-white shadow-sm transition"
        :class="allAnswered ? 'bg-indigo-600 hover:bg-indigo-700' : 'cursor-not-allowed bg-slate-300'"
        @click="submit"
      >
        결과 보기 — 내 경로 짜기 →
      </button>
      <span v-if="!allAnswered" class="text-sm text-slate-400">모든 문항에 답하면 활성화돼요</span>
    </div>
  </main>
</template>
