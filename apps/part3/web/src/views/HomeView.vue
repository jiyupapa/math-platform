<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { chapters } from '@/data/chapters'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()
</script>

<template>
  <div>
    <p class="mb-2 text-sm font-medium text-indigo-600">수포자 환영합니다 👋</p>
    <h1 class="mb-3 text-3xl font-bold">확률과 통계, 그림으로 시작하기</h1>
    <p class="mb-8 leading-relaxed text-slate-600">
      공식부터 외우지 않습니다. 동전을 직접 던져보고, 데이터가 종 모양으로 쌓이는 걸 눈으로 보고,
      바로 문제를 풀며 "감"을 잡습니다. 막히면 힌트가, 풀고 나면 해설이 기다립니다.
      최종 목표는 이 확률·통계 지식으로 <b>AI가 세상을 다루는 방식(확률로 예측하고, 데이터로 배우는 원리)</b>을 이해하는 것입니다.
    </p>

    <div class="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900">
      🧭 <b>처음이신가요?</b> 목차 맨 위의
      <RouterLink to="/ch/sample" class="font-semibold text-emerald-700 underline underline-offset-2"
        >샘플 챕터 — 동전 던지기 맛보기</RouterLink
      >부터 시작하세요. 5분 만에 이 앱의 학습 방식(설명 카드 → 직접 조작 → 문제 풀이)을 체험할 수 있어요.
      그다음 1장부터 순서대로 진행하면 됩니다.
    </div>

    <div class="mb-8 rounded-xl border border-indigo-100 bg-indigo-50 p-5">
      <div class="mb-1 flex items-center justify-between text-sm">
        <span class="font-medium text-indigo-900">나의 진도</span>
        <span class="text-indigo-700">{{ progress.percent }}%</span>
      </div>
      <div class="h-2.5 w-full overflow-hidden rounded-full bg-white">
        <div
          class="h-full rounded-full bg-indigo-500 transition-all"
          :style="{ width: progress.percent + '%' }"
        />
      </div>
    </div>

    <h2 class="mb-2 text-lg font-semibold">목차</h2>
    <p class="mb-4 text-sm text-slate-500">
      <span class="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">심화</span>
      배지가 붙은 챕터는 AI(트랜스포머) 이해에 필수는 아니에요. 샘플~7장을 먼저 완주하고, 나중에 돌아와도 좋습니다.
    </p>
    <ul class="space-y-2">
      <li v-for="ch in chapters" :key="ch.slug">
        <RouterLink
          :to="ch.slug === 'sample' ? '/ch/sample' : `/ch/${ch.slug}`"
          class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
        >
          <span
            class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
            :class="
              progress.isDone(ch.slug)
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-600'
            "
          >
            {{ progress.isDone(ch.slug) ? '✓' : ch.phase }}
          </span>
          <span class="min-w-0">
            <span class="font-medium">
              {{ ch.title }}
              <span v-if="ch.comingSoon" class="text-xs text-slate-500">(예정)</span>
              <template v-else>
                <span v-if="ch.advanced" class="ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-normal text-violet-700">심화</span>
                <span v-if="ch.minutes" class="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">약 {{ ch.minutes }}분</span>
              </template>
            </span>
            <span class="block text-sm text-slate-500">{{ ch.summary }}</span>
          </span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
