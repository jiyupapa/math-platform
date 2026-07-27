<script setup lang="ts">
import { chapters, availableChapters, progressChapters } from '@/data/chapters'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()
// 본 챕터(1장~)가 공개되면 제작 중 안내를 진도 박스로 자연 교체
const building = progressChapters.length === 0
// 워밍업(샘플)이 공개됐으면 제작 중 안내에 CTA 를 단다
const sampleReady = availableChapters.some((c) => c.slug === 'sample')
</script>

<template>
  <div>
    <p class="mb-2 text-sm font-medium text-indigo-600">수포자를 위한 최적화 — 시리즈 8부 (이론 심화)</p>
    <h1 class="mb-3 text-3xl font-bold">모델은 어떻게 "잘" 배우게 되는 걸까</h1>
    <p class="mb-4 leading-relaxed text-slate-600">
      2부에서 경사하강의 원리를 배웠지만, 실제 학습의 성패는 그 위의 <b>다이얼들</b>이 가릅니다 —
      학습률, 배치 크기, 모멘텀, Adam, 스케줄, 정규화. 이 과정은 손실 지형 위의 여행이라는
      그림 하나로 그 다이얼 전부를 꿰고, <b>파인튜닝 설정 파일 완독</b>까지 갑니다.
      핵심 한 줄: <b>"보폭·관성·일정표가 도착지를 정한다."</b>
    </p>

    <!-- 제작 중 안내 (본 챕터 공개 시 진도 박스로 교체됨) -->
    <div v-if="building" class="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
      <p class="font-medium text-amber-900">🚧 8부는 지금 만드는 중입니다</p>
      <p class="mt-1 text-sm text-amber-700">
        아래 목차는 확정된 로드맵입니다. 챕터가 공개되면 (예정) 표시가 사라지고 바로 학습할 수 있어요.
        선수 지식은 <b>2부(미분 — 특히 9장 경사하강)</b>이고, 6부(조련)를 봤다면 동기가 확실해집니다.
      </p>
      <RouterLink
        v-if="sampleReady && !progress.isDone('sample')"
        to="/ch/sample"
        class="mt-4 block rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        🚀 워밍업은 공개됐어요 — 같은 모델, 세 개의 운명 체험하기 →
      </RouterLink>
    </div>
    <div v-else class="mb-8 rounded-xl border border-indigo-100 bg-indigo-50 p-5">
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
      <template v-if="progress.completedCount === 0 && sampleReady && !progress.isDone('sample')">
        <RouterLink
          to="/ch/sample"
          class="mt-4 block rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          🚀 처음이신가요? 워밍업(같은 모델, 세 개의 운명)부터 시작하세요 →
        </RouterLink>
        <p class="mt-2 text-center text-xs text-indigo-600">
          2부(미분·경사하강)를 마쳤다면 준비 완료 — 6부를 봤다면 더 재미있게 읽힙니다.
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
