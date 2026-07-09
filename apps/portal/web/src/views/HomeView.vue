<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { pathSteps, totalChapters, totalHours, type StepRole } from '../data/curriculum'

// 역할별 색 (토대/조립/본체/조련/심화)
const roleStyle: Record<StepRole, { tag: string; dot: string; ring: string }> = {
  토대: { tag: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500', ring: 'ring-sky-200' },
  조립: { tag: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-200' },
  본체: { tag: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500', ring: 'ring-violet-200' },
  조련: { tag: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-200' },
  심화: { tag: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', ring: 'ring-slate-200' },
}

// 각 단계에 링크(다른 부 앱은 같은 origin 하위 경로 /partN/)를 붙인다. 예정(6부)은 링크 없음.
const steps = pathSteps.map((s) => ({
  ...s,
  href: s.comingSoon ? null : `/part${s.part}/`,
}))

const hours = (m: number) => Math.round((m / 60) * 10) / 10
</script>

<template>
  <main class="mx-auto max-w-3xl px-5 py-10">
    <!-- Hero -->
    <section class="mb-10 text-center">
      <p class="mb-2 text-sm font-semibold tracking-wide text-indigo-600">수포자 사관학교</p>
      <h1 class="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">
        수학을 포기했어도, <span class="text-indigo-600">AI의 원리</span>까지 간다
      </h1>
      <p class="mx-auto mb-6 max-w-xl text-slate-600">
        1→2→3→4→5 순서로 가지 않습니다. 트랜스포머(4부)를 가장 빨리 만나도록 짠
        <strong>비선형 학습 경로</strong>를 따라, 필요한 것만 배웁니다.
      </p>
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
    </section>

    <!-- Path map -->
    <section>
      <h2 class="mb-5 text-lg font-bold text-slate-800">학습 경로 지도</h2>
      <ol class="relative space-y-3 border-l-2 border-slate-200 pl-6">
        <li v-for="step in steps" :key="step.order" class="relative">
          <span
            class="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white"
            :class="roleStyle[step.role].dot"
          >
            <span class="text-[10px] font-bold text-white">{{ step.order }}</span>
          </span>
          <component
            :is="step.href ? 'a' : 'div'"
            :href="step.href ?? undefined"
            class="block rounded-xl bg-white p-4 shadow-sm ring-1 transition"
            :class="[roleStyle[step.role].ring, step.href ? 'hover:shadow-md hover:ring-2' : 'opacity-80']"
          >
            <div class="mb-1 flex flex-wrap items-center gap-2">
              <span class="rounded px-2 py-0.5 text-xs font-semibold" :class="roleStyle[step.role].tag">{{ step.role }}</span>
              <span v-if="step.part === 4" class="rounded bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">🎯 정점</span>
              <span v-if="step.comingSoon" class="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500">예정</span>
              <span v-if="step.optional" class="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">선택</span>
            </div>
            <h3 class="font-semibold text-slate-900">{{ step.title }}</h3>
            <p class="mt-0.5 text-sm text-slate-600">{{ step.gain }}</p>
            <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
              <span>{{ step.scope }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ step.chapterCount }}챕터</span>
              <span aria-hidden="true">·</span>
              <span>~{{ hours(step.minutes) }}시간<template v-if="step.estimate"> (추정)</template></span>
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
