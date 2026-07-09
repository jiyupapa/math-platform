<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { chapters } from '@/data/chapters'
import { useProgressStore } from '@/stores/progress'
import TransformerMap from '@/components/TransformerMap.vue'

const progress = useProgressStore()
</script>

<template>
  <div>
    <p class="mb-2 text-sm font-medium text-indigo-600">수포자를 위한 트랜스포머</p>
    <h1 class="mb-3 text-3xl font-bold">ChatGPT는 사실 "다음 단어 맞히기"입니다</h1>
    <p class="mb-6 leading-relaxed text-slate-600">
      거대한 인공지능처럼 보이는 <b>LLM</b>(대형 언어 모델)의 정체는, 글을 보고
      <b>다음에 올 단어를 확률로 고르는 기계</b>예요. 그 안에서 돌아가는 핵심 부품이
      <b>트랜스포머(Transformer)</b>입니다. 이 사이트는 공식부터 외우지 않습니다.
      슬라이더를 직접 움직이고, 막대가 실시간으로 바뀌는 걸 보며
      <b>"트랜스포머가 어떻게 돌아가는지"</b>를 그림으로 이해합니다.
    </p>

    <!-- 왜 배우는지: 트랜스포머 지도 -->
    <div class="mb-8">
      <TransformerMap />
    </div>

    <!-- 학습 방법 안내 -->
    <div class="mb-8 rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-sm leading-relaxed text-emerald-900">
      <p class="mb-1 font-semibold">📚 두 가지로 배웁니다</p>
      <p>
        <b>① 웹</b>에서 슬라이더·드래그로 감을 잡고, 챕터마다 있는 <b>② Python 노트북</b>
        (<code class="rounded bg-white/70 px-1">notebooks/</code>)에서 같은 예제를 직접 계산해 굳혀요.
        각 챕터 끝에 짝 노트북 안내가 있습니다. 막히면 <b>우하단 🤖 AI 튜터</b>에게 물어보세요
        <span class="text-emerald-700">(노트북·튜터는 선택 — 웹만으로도 완주 가능)</span>.
      </p>
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
            </span>
            <span class="block text-sm text-slate-500">{{ ch.summary }}</span>
          </span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
