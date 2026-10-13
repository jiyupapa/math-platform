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
    <p class="mb-2 text-sm font-medium text-indigo-600">수포자를 위한 시스템 다이내믹스 · 시리즈 12부 (전략)</p>
    <h1 class="mb-3 text-3xl font-bold">들이고 나면, 시간이 지나며 무슨 일이 벌어질까</h1>
    <p class="mb-4 leading-relaxed text-slate-600">
      AI를 들이면 사용자 수는 어떻게 늘고, 어디서 멈출까요. 신규 가입이 줄기 시작했는데도
      사용자 수가 계속 느는 이유, 손을 쓸수록 오히려 출렁이는 이유는 수학으로 설명됩니다.
      이 과정은 <b>쌓이는 것(저량)</b>과 <b>흐르는 것(유량)</b>, 그리고 <b>돌아오는 고리(피드백 루프)</b>로
      시간에 따른 변화를 직접 시뮬레이션하고, 경사하강·EMA·시그모이드가 사실 같은 수학이라는 것까지 확인합니다.
      마지막에는 가상 회사의 AI 도입을 모형으로 미리 돌려 봅니다.
      핵심 한 줄: <b>"쌓인 것은 흐름으로만 바뀌고, 흐름은 쌓인 것을 보고 정해진다."</b>
    </p>

    <!-- 제작 중 안내 (본 챕터 공개 시 진도 박스로 교체됨) -->
    <div v-if="building" class="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
      <p class="font-medium text-amber-900">🚧 12부는 지금 만드는 중입니다</p>
      <p class="mt-1 text-sm text-amber-700">
        아래 목차는 확정된 로드맵입니다. 챕터가 공개되면 (예정) 표시가 사라지고 바로 학습할 수 있어요.
        변화율 감각은 이 과정 안에서 다시 다루므로 선수 지식은 <b>2부 2장(변화율)·7장(지수·시그모이드)</b>
        정도면 충분합니다(8부 2·4장의 학습률·EMA를 봤다면 5·6장이 더 잘 읽혀요).
      </p>
      <RouterLink
        v-if="sampleReady && !progress.isDone('sample')"
        to="/ch/sample"
        class="mt-4 block rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        🚀 워밍업은 공개됐어요. 욕조 문제 풀어 보기 →
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
          🚀 처음이신가요? 워밍업(들어오는 게 줄었는데 왜 계속 늘까)부터 시작하세요 →
        </RouterLink>
        <p class="mt-2 text-center text-xs text-indigo-600">
          변화율 감각은 이 과정 안에서 다시 다룹니다. 2부 2장(변화율)을 봤다면 준비 완료입니다.
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
