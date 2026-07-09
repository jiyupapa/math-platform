<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { pathSteps, totalChapters, totalHours, type StepRole } from '../data/curriculum'
import { loadDiagnosis, clearDiagnosis, confidenceAvg } from '../data/useDiagnosis'
import { recommend, type StepStatus } from '../data/recommend'

// 역할별 색 (토대/조립/본체/조련/심화)
const roleStyle: Record<StepRole, { tag: string; dot: string; ring: string }> = {
  토대: { tag: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500', ring: 'ring-sky-200' },
  조립: { tag: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-200' },
  본체: { tag: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500', ring: 'ring-violet-200' },
  조련: { tag: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-200' },
  심화: { tag: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', ring: 'ring-slate-200' },
}

// 진단 상태별 배지/스타일
const statusStyle: Record<StepStatus, { label: string; badge: string; dim: boolean; strike: boolean }> = {
  필수: { label: '필수', badge: 'bg-indigo-100 text-indigo-700', dim: false, strike: false },
  건너뛰기: { label: '이미 앎 ✓', badge: 'bg-slate-100 text-slate-400', dim: true, strike: true },
  빠른복습: { label: '빠른 복습', badge: 'bg-sky-100 text-sky-700', dim: false, strike: false },
  예정: { label: '예정', badge: 'bg-slate-200 text-slate-500', dim: true, strike: false },
  선택: { label: '선택', badge: 'bg-slate-100 text-slate-500', dim: true, strike: false },
}

const diagnosis = ref(loadDiagnosis())
const rec = computed(() => {
  const d = diagnosis.value
  return d ? recommend(d.answers, confidenceAvg(d.confidence)) : null
})

// pathSteps 와 rec.plan 은 같은 배열을 map 한 것이라 인덱스가 1:1 대응한다.
const rows = computed(() =>
  pathSteps.map((step, i) => ({
    step,
    href: step.comingSoon ? null : `/part${step.part}/`,
    status: rec.value ? rec.value.plan[i].status : null,
    note: rec.value ? rec.value.plan[i].note : undefined,
  })),
)

const hours = (m: number) => Math.round((m / 60) * 10) / 10

function reset() {
  clearDiagnosis()
  diagnosis.value = null
}
</script>

<template>
  <main class="mx-auto max-w-3xl px-5 py-10">
    <!-- Hero -->
    <section class="mb-8 text-center">
      <p class="mb-2 text-sm font-semibold tracking-wide text-indigo-600">수포자 사관학교</p>
      <h1 class="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">
        수학을 포기했어도, <span class="text-indigo-600">AI의 원리</span>까지 간다
      </h1>
      <p class="mx-auto mb-6 max-w-xl text-slate-600">
        1→2→3→4→5 순서로 가지 않습니다. 트랜스포머(4부)를 가장 빨리 만나도록 짠
        <strong>비선형 학습 경로</strong>를 따라, 필요한 것만 배웁니다.
      </p>

      <!-- 진단 전: 전체 요약 + CTA -->
      <template v-if="!rec">
        <div class="mb-6 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
          <span class="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">핵심 경로 {{ totalChapters }}챕터</span>
          <span class="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">예상 {{ totalHours }}시간</span>
          <span class="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">로컬 AI 튜터 · 비용 ₩0</span>
        </div>
        <RouterLink
          to="/diagnose"
          class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          내게 맞는 경로 찾기 →
        </RouterLink>
        <p class="mt-2 text-xs text-slate-400">5분 진단 후, 아래 지도에서 당신에게 필요한 단계만 남습니다.</p>
      </template>

      <!-- 진단 후: 개인화 요약 -->
      <template v-else>
        <div class="mx-auto mb-4 max-w-lg rounded-2xl bg-indigo-600 p-5 text-white shadow-sm">
          <p class="text-sm font-medium text-indigo-100">AI 강사가 당신에게 맞춘 경로</p>
          <p class="mt-1 text-2xl font-bold">
            {{ rec.activeChapters }}챕터 · 예상 {{ hours(rec.activeMinutes) }}시간
          </p>
          <p class="mt-1 text-sm text-indigo-100">
            전체 핵심 {{ totalChapters }}챕터({{ totalHours }}시간) 중
            <template v-if="rec.skippedSteps"> {{ rec.skippedSteps }}개 단계를 이미 아는 것으로 접었어요.</template>
            <template v-else> 아래 지도대로 차근차근 가면 됩니다.</template>
          </p>
        </div>
        <div class="flex items-center justify-center gap-3 text-sm">
          <RouterLink to="/diagnose" class="font-medium text-indigo-600 hover:underline">다시 진단하기</RouterLink>
          <span class="text-slate-300">·</span>
          <button type="button" class="font-medium text-slate-500 hover:underline" @click="reset">전체 경로 보기</button>
        </div>
      </template>
    </section>

    <!-- Path map -->
    <section>
      <h2 class="mb-5 text-lg font-bold text-slate-800">학습 경로 지도</h2>
      <ol class="relative space-y-3 border-l-2 border-slate-200 pl-6">
        <li v-for="row in rows" :key="row.step.order" class="relative">
          <span
            class="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white"
            :class="roleStyle[row.step.role].dot"
          >
            <span class="text-[10px] font-bold text-white">{{ row.step.order }}</span>
          </span>
          <component
            :is="row.href ? 'a' : 'div'"
            :href="row.href ?? undefined"
            class="block rounded-xl bg-white p-4 shadow-sm ring-1 transition"
            :class="[
              roleStyle[row.step.role].ring,
              row.href ? 'hover:shadow-md hover:ring-2' : '',
              row.status && statusStyle[row.status].dim ? 'opacity-60' : '',
            ]"
          >
            <div class="mb-1 flex flex-wrap items-center gap-2">
              <span class="rounded px-2 py-0.5 text-xs font-semibold" :class="roleStyle[row.step.role].tag">{{ row.step.role }}</span>
              <span
                v-if="row.status"
                class="rounded px-2 py-0.5 text-xs font-semibold"
                :class="statusStyle[row.status].badge"
              >{{ statusStyle[row.status].label }}</span>
              <span v-if="row.step.part === 4 && !row.status" class="rounded bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">🎯 정점</span>
            </div>
            <h3 class="font-semibold text-slate-900" :class="{ 'line-through': row.status && statusStyle[row.status].strike }">
              {{ row.step.title }}
            </h3>
            <p class="mt-0.5 text-sm text-slate-600">{{ row.step.gain }}</p>
            <p v-if="row.note" class="mt-1 text-xs font-medium text-amber-600">💡 {{ row.note }}</p>
            <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
              <span>{{ row.step.scope }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ row.step.chapterCount }}챕터</span>
              <span aria-hidden="true">·</span>
              <span>~{{ hours(row.step.minutes) }}시간<template v-if="row.step.estimate"> (추정)</template></span>
            </div>
          </component>
        </li>
      </ol>
      <p class="mt-6 text-center text-xs text-slate-400">
        각 카드를 누르면 해당 부의 학습 앱으로 이동합니다. (6부는 준비 중)
      </p>
    </section>
  </main>
</template>
