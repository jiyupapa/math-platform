<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { chapters } from '@/data/chapters'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()
</script>

<template>
  <div>
    <p class="mb-2 text-sm font-medium text-indigo-600">수포자를 위한 정보이론 — 시리즈 5부</p>
    <h1 class="mb-3 text-3xl font-bold">AI 는 사실 "불확실성을 줄이는 기계"입니다</h1>
    <p class="mb-4 leading-relaxed text-slate-600">
      ChatGPT 의 손실함수(크로스 엔트로피), 성적표(퍼플렉시티), 창의성 다이얼(temperature),
      정렬 페널티(KL)… 전부 <b>정보이론</b> 하나에서 나옵니다.
      이 사이트는 공식부터 외우지 않습니다. <b>스무고개 게임</b>에서 출발해
      "정보 = 줄어드는 불확실성"을 손으로 만져 보며,
      <b>"AI 가 배운다는 게 정확히 뭘 하는 건지"</b> 한 줄로 말할 수 있게 됩니다.
    </p>

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
      <!-- 처음 방문자를 위한 시작 안내 -->
      <template v-if="progress.completedCount === 0 && !progress.isDone('sample')">
        <RouterLink
          to="/ch/sample"
          class="mt-4 block rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          🚀 처음이신가요? 스무고개 워밍업부터 시작하세요 →
        </RouterLink>
        <p class="mt-2 text-center text-xs text-indigo-600">
          수학 지식이 전혀 없어도 됩니다. 순서대로 하나씩, 막히면 힌트와 해설이 있어요.
        </p>
      </template>
    </div>

    <h2 class="mb-4 text-lg font-semibold">목차</h2>
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
              <span v-else-if="ch.minutes" class="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">약 {{ ch.minutes }}분</span>
            </span>
            <span class="block text-sm text-slate-500">{{ ch.summary }}</span>
          </span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
