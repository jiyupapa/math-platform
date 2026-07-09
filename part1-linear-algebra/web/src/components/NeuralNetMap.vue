<script setup lang="ts">
// "AI 부품 지도" — 신경망 그림 위에 각 챕터가 어느 부품인지 매핑하고,
// 완료한 챕터에 해당하는 부품에 불이 켜진다(색칠). 수포자가 "왜 배우는지"의 큰 그림을 잡게 한다.
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()
const on = (slug: string) => progress.isDone(slug)

interface Edge {
  x1: number
  y1: number
  x2: number
  y2: number
}

const IX = 80
const HX = 250
const OX = 420
const inputY = [70, 125, 180]
const hiddenY = [50, 100, 150, 200]
const outputY = [100, 150]

const inEdges = computed<Edge[]>(() => {
  const e: Edge[] = []
  for (const a of inputY) for (const b of hiddenY) e.push({ x1: IX, y1: a, x2: HX, y2: b })
  return e
})
const outEdges = computed<Edge[]>(() => {
  const e: Edge[] = []
  for (const a of hiddenY) for (const b of outputY) e.push({ x1: HX, y1: a, x2: OX, y2: b })
  return e
})

// AI 부품 ↔ 챕터 매핑 (지도 범례 겸 바로가기)
const parts = [
  { slug: 'ch1', part: '입력 = 벡터', desc: '데이터를 숫자로' },
  { slug: 'ch2', part: '뉴런 = 내적', desc: '유사도 · 어텐션' },
  { slug: 'ch3', part: '층 = 행렬곱', desc: '데이터 × 가중치' },
  { slug: 'ch5', part: '변환 = 선형변환', desc: '공간을 바꾸기' },
  { slug: 'ch4', part: '학습 = 연립방정식', desc: '최적값 찾기' },
  { slug: 'ch7', part: '축 = 고유값', desc: 'PCA · 차원축소' },
]
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5">
    <h2 class="text-lg font-bold">이 과정을 완료하면 — AI(신경망)의 구조를 이해하게 됩니다</h2>
    <p class="mb-3 mt-1 text-sm text-slate-600">
      아래가 AI의 뼈대인 <b>신경망</b>이에요. 그 부품 하나하나가 전부 <b>선형대수</b>입니다.
      챕터를 완료할 때마다 해당 부품이 <span class="font-semibold text-emerald-600">활성화됩니다</span>.
    </p>

    <!-- 신경망 그림 -->
    <svg viewBox="0 0 500 250" class="w-full" role="img" aria-label="신경망 지도">
      <!-- 층 제목 -->
      <text :x="IX" y="20" text-anchor="middle" class="fill-slate-400 text-[11px]">입력층</text>
      <text :x="HX" y="20" text-anchor="middle" class="fill-slate-400 text-[11px]">은닉층</text>
      <text :x="OX" y="20" text-anchor="middle" class="fill-slate-400 text-[11px]">출력층</text>

      <!-- 연결선: 입력→은닉 (ch2 내적), 은닉→출력 (ch5 변환) -->
      <line
        v-for="(e, i) in inEdges"
        :key="'i' + i"
        :x1="e.x1"
        :y1="e.y1"
        :x2="e.x2"
        :y2="e.y2"
        :stroke="on('ch2') ? '#a5b4fc' : '#e2e8f0'"
        stroke-width="1"
      />
      <line
        v-for="(e, i) in outEdges"
        :key="'o' + i"
        :x1="e.x1"
        :y1="e.y1"
        :x2="e.x2"
        :y2="e.y2"
        :stroke="on('ch5') ? '#a5b4fc' : '#e2e8f0'"
        stroke-width="1"
      />

      <!-- 노드: 입력(ch1), 은닉(ch3), 출력(ch4) -->
      <circle
        v-for="(y, i) in inputY"
        :key="'in' + i"
        :cx="IX"
        :cy="y"
        r="13"
        :fill="on('ch1') ? '#10b981' : '#cbd5e1'"
      />
      <circle
        v-for="(y, i) in hiddenY"
        :key="'hd' + i"
        :cx="HX"
        :cy="y"
        r="13"
        :fill="on('ch3') ? '#6366f1' : '#cbd5e1'"
      />
      <circle
        v-for="(y, i) in outputY"
        :key="'ot' + i"
        :cx="OX"
        :cy="y"
        r="13"
        :fill="on('ch4') ? '#10b981' : '#cbd5e1'"
      />
    </svg>

    <!-- 부품 ↔ 챕터 지도 (클릭하면 이동) -->
    <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <RouterLink
        v-for="p in parts"
        :key="p.slug"
        :to="`/ch/${p.slug}`"
        class="flex items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors"
        :class="
          on(p.slug)
            ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
            : 'border-slate-200 bg-white hover:bg-slate-50'
        "
      >
        <span
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
          :class="on(p.slug) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'"
        >
          {{ on(p.slug) ? '✓' : '○' }}
        </span>
        <span class="min-w-0">
          <span class="block font-medium leading-tight">{{ p.part }}</span>
          <span class="block text-xs text-slate-500">{{ p.desc }}</span>
        </span>
      </RouterLink>
    </div>

    <p class="mt-3 text-xs text-slate-400">
      여기에 ch6 역행렬 · ch8 PCA, 그리고 심화(ch9~12 SVD · 그래디언트)까지 더하면 AI 한 대가 완성됩니다.
    </p>
  </div>
</template>
