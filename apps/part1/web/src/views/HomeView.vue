<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { chapters } from '@/data/chapters'
import { useProgressStore } from '@/stores/progress'
import NeuralNetMap from '@/components/NeuralNetMap.vue'

const progress = useProgressStore()
</script>

<template>
  <div>
    <p class="mb-2 text-sm font-medium text-indigo-600">수포자를 위한 선형대수</p>
    <h1 class="mb-3 text-3xl font-bold">유튜브 추천도, ChatGPT도 사실 선형대수입니다</h1>
    <p class="mb-4 leading-relaxed text-slate-600">
      유튜브·넷플릭스 추천, ChatGPT, 얼굴인식… 매일 쓰는 <b>AI의 정체는 벡터와 행렬 몇 개</b>예요.
      이 사이트는 공식부터 외우지 않습니다. 화살표를 직접 끌어보고, 격자가 휘는 걸 눈으로 보며
      <b>"AI가 어떻게 돌아가는지"</b>를 그림으로 이해합니다.
    </p>

    <!-- 왜 배우는지: 신경망 지도 -->
    <div class="mb-8">
      <NeuralNetMap />
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
      <!-- 처음 방문자를 위한 시작 안내 -->
      <template v-if="progress.completedCount === 0 && !progress.isDone('sample')">
        <RouterLink
          to="/ch/sample"
          class="mt-4 block rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          🚀 처음이신가요? 5분 워밍업부터 시작하세요 →
        </RouterLink>
        <p class="mt-2 text-center text-xs text-indigo-600">
          수학 지식이 전혀 없어도 됩니다. 순서대로 하나씩, 막히면 힌트와 해설이 있어요.
        </p>
      </template>
    </div>

    <h2 class="mb-2 text-lg font-semibold">목차</h2>
    <p class="mb-4 text-sm text-slate-500">
      <span class="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">심화</span>
      배지가 붙은 챕터는 AI(트랜스포머) 이해에 필수는 아니에요. 워밍업~6장을 먼저 완주하고, 나중에 돌아와도 좋습니다.
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
