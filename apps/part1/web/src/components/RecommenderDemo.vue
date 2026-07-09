<script setup lang="ts">
// 체험 AI 데모 (ch2) — 취향 슬라이더를 움직이면 추천 순위가 실시간으로 바뀐다.
// 정체: 취향 벡터와 영화 벡터의 '내적' 이 클수록 위로.
import { ref, computed } from 'vue'

const action = ref(5)
const romance = ref(1)

interface Movie {
  name: string
  emoji: string
  a: number
  r: number
}
const movies: Movie[] = [
  { name: '액션 블록버스터', emoji: '🔫', a: 5, r: 1 },
  { name: '로맨스 드라마', emoji: '💕', a: 1, r: 5 },
  { name: '액션 로맨스', emoji: '🎬', a: 4, r: 4 },
  { name: '코미디', emoji: '😂', a: 2, r: 2 },
  { name: '느와르 액션', emoji: '🕶️', a: 5, r: 2 },
]

const ranked = computed(() =>
  movies
    .map((m) => ({ ...m, score: action.value * m.a + romance.value * m.r }))
    .sort((x, y) => y.score - x.score),
)
const maxScore = computed(() => Math.max(1, ...ranked.value.map((m) => m.score)))
const top = computed(() => ranked.value[0])
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-3 text-sm font-semibold text-slate-700">추천 시스템 체험 — 취향을 조절하면 순위가 바뀝니다</p>

    <!-- 취향 슬라이더 -->
    <div class="mb-4 grid gap-3 sm:grid-cols-2">
      <label class="text-sm">
        <span class="mb-1 block">🔫 액션 선호: <b class="text-indigo-600">{{ action }}</b></span>
        <input v-model.number="action" type="range" min="0" max="5" step="1" class="w-full" />
      </label>
      <label class="text-sm">
        <span class="mb-1 block">💕 로맨스 선호: <b class="text-pink-600">{{ romance }}</b></span>
        <input v-model.number="romance" type="range" min="0" max="5" step="1" class="w-full" />
      </label>
    </div>

    <!-- 추천 순위 -->
    <ul class="space-y-2">
      <li
        v-for="(m, i) in ranked"
        :key="m.name"
        class="flex items-center gap-3 rounded-lg border p-2"
        :class="i === 0 ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100'"
      >
        <span class="w-6 text-center text-lg">{{ m.emoji }}</span>
        <span class="w-28 shrink-0 text-sm">
          {{ m.name }}
          <span v-if="i === 0" class="ml-1 text-xs font-bold text-emerald-600">추천</span>
        </span>
        <span class="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
          <span
            class="block h-full rounded-full transition-all"
            :class="i === 0 ? 'bg-emerald-500' : 'bg-indigo-300'"
            :style="{ width: (m.score / maxScore) * 100 + '%' }"
          />
        </span>
        <span class="w-8 text-right font-mono text-sm">{{ m.score }}</span>
      </li>
    </ul>

    <!-- 정체 폭로 -->
    <div class="mt-4 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900">
      💡 <b>방금 한 게 '내적'이에요.</b> 1등 <b>{{ top.emoji }} {{ top.name }}</b> 의 점수는 취향
      <b>({{ action }}, {{ romance }})</b> 과 영화 <b>({{ top.a }}, {{ top.r }})</b> 의 내적:
      <span class="font-mono">
        {{ action }}×{{ top.a }} + {{ romance }}×{{ top.r }} = {{ top.score }}
      </span>
      — 내적이 클수록 "취향과 닮음" → 위로 추천. AI 추천은 이걸 수백만 항목에 순식간에 할 뿐이에요.
    </div>
  </div>
</template>
