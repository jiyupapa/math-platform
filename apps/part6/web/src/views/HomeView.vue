<script setup lang="ts">
import { chapters, availableChapters } from '@/data/chapters'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()
// 콘텐츠가 하나라도 공개되면 제작 중 안내를 진도 박스로 자연 교체
const building = availableChapters.length === 0
</script>

<template>
  <div>
    <p class="mb-2 text-sm font-medium text-indigo-600">수포자를 위한 LLM 조련 — 시리즈 6부 (피날레)</p>
    <h1 class="mb-3 text-3xl font-bold">GPT는 어떻게 ChatGPT가 되었나</h1>
    <p class="mb-4 leading-relaxed text-slate-600">
      5부까지 배웠다면 "다음 단어 예측 기계"는 이해한 것입니다. 그런데 그 기계가 왜 질문에
      <b>공손히 대답하는 비서</b>가 될까요? 이 과정은 그 마지막 퍼즐 —
      <b>SFT → 보상 모델 → RLHF·DPO</b> 조련 파이프라인 — 을 맞춥니다.
      여기서 1부의 저차원 행렬(LoRA), 3부의 확률(보상 모델), 5부의 KL 발산(목줄)이 전부 되돌아옵니다.
    </p>

    <!-- 제작 중 안내 (첫 챕터 공개 시 진도 박스로 교체됨) -->
    <div v-if="building" class="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
      <p class="font-medium text-amber-900">🚧 6부는 지금 만드는 중입니다</p>
      <p class="mt-1 text-sm text-amber-700">
        아래 목차는 확정된 로드맵입니다. 챕터가 공개되면 (예정) 표시가 사라지고 바로 학습할 수 있어요.
        1~5부를 먼저 마치고 오면 모든 챕터가 "아는 수학의 재회"로 읽힙니다.
      </p>
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
              <span v-if="ch.comingSoon" class="text-xs text-slate-400">(예정)</span>
              <span v-else-if="ch.minutes" class="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-normal text-slate-500">약 {{ ch.minutes }}분</span>
            </span>
            <span class="block text-sm text-slate-500">{{ ch.summary }}</span>
          </span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
