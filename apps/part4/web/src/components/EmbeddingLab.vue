<script setup lang="ts">
// 인터랙티브 임베딩 지도 (SVG).
// 단어들이 2D 평면에 점으로 찍혀 있고, 뜻이 비슷한 무리끼리 가까이 모여 있다.
// 두 단어를 클릭하면 그 사이에 선이 그어지고 '거리'가 표시된다 → 가까울수록 뜻이 비슷.
import { ref, computed } from 'vue'
import { EMBEDDINGS, GROUPS, GROUP_COLOR, lookup, distance } from '@/utils/embeddings'

const SIZE = 360
const RANGE = 4
const scale = SIZE / (RANGE * 2)
const origin = SIZE / 2
const toX = (x: number) => origin + x * scale
const toY = (y: number) => origin - y * scale

// 선택된 단어(최대 2개)
const selected = ref<string[]>(['고양이', '강아지'])

function clickWord(w: string) {
  const i = selected.value.indexOf(w)
  if (i >= 0) {
    selected.value = selected.value.filter((x) => x !== w)
  } else {
    const next = [...selected.value, w]
    if (next.length > 2) next.shift()
    selected.value = next
  }
}

const pair = computed(() => {
  if (selected.value.length !== 2) return null
  const a = lookup(selected.value[0])!
  const b = lookup(selected.value[1])!
  return { a, b, d: distance(a.vec, b.vec), same: a.group === b.group }
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-500">
      단어 지도 — 점을 <b>두 개</b> 눌러 거리를 재보세요
    </p>
    <p class="mb-3 text-xs text-slate-400">
      가까이 모인 단어일수록 뜻이 비슷합니다. (뜻이 비슷 → 좌표가 가까움)
    </p>

    <div class="flex justify-center">
      <svg :viewBox="`0 0 ${SIZE} ${SIZE}`" :width="SIZE" :height="SIZE" class="max-w-full rounded-xl border border-slate-100 bg-slate-50/40">
        <!-- 축 -->
        <line :x1="0" :y1="toY(0)" :x2="SIZE" :y2="toY(0)" stroke="#e2e8f0" stroke-width="1" />
        <line :x1="toX(0)" :y1="0" :x2="toX(0)" :y2="SIZE" stroke="#e2e8f0" stroke-width="1" />

        <!-- 선택된 두 단어를 잇는 선 -->
        <line
          v-if="pair"
          :x1="toX(pair.a.vec[0])"
          :y1="toY(pair.a.vec[1])"
          :x2="toX(pair.b.vec[0])"
          :y2="toY(pair.b.vec[1])"
          :stroke="pair.same ? '#10b981' : '#f43f5e'"
          stroke-width="2"
          stroke-dasharray="5 4"
        />

        <!-- 단어 점 -->
        <g v-for="w in EMBEDDINGS" :key="w.word" class="cursor-pointer" @click="clickWord(w.word)">
          <circle
            :cx="toX(w.vec[0])"
            :cy="toY(w.vec[1])"
            :r="selected.includes(w.word) ? 9 : 6"
            :fill="GROUP_COLOR[w.group]"
            :stroke="selected.includes(w.word) ? '#1e293b' : '#fff'"
            :stroke-width="selected.includes(w.word) ? 2.5 : 1.5"
          />
          <text
            :x="toX(w.vec[0])"
            :y="toY(w.vec[1]) - 12"
            text-anchor="middle"
            font-size="12"
            :font-weight="selected.includes(w.word) ? 700 : 500"
            fill="#334155"
          >
            {{ w.word }}
          </text>
        </g>
      </svg>
    </div>

    <!-- 범례 -->
    <div class="mt-3 flex flex-wrap justify-center gap-3">
      <span v-for="g in GROUPS" :key="g" class="flex items-center gap-1.5 text-xs text-slate-600">
        <span class="inline-block h-3 w-3 rounded-full" :style="{ backgroundColor: GROUP_COLOR[g] }" />
        {{ g }}
      </span>
    </div>

    <!-- 거리 결과 -->
    <div
      v-if="pair"
      class="mt-4 rounded-lg px-4 py-3 text-sm"
      :class="pair.same ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'"
    >
      <b>{{ selected[0] }}</b> ↔ <b>{{ selected[1] }}</b> 거리 =
      <b class="font-mono">{{ pair.d.toFixed(2) }}</b>
      <span v-if="pair.same"> — 같은 무리라 <b>가깝습니다</b> (뜻이 비슷). 👍</span>
      <span v-else> — 다른 무리라 <b>멉니다</b> (뜻이 다름).</span>
    </div>
    <div v-else class="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
      점을 두 개 선택하면 거리가 표시됩니다. (하나 더 누르면 가장 오래된 선택이 풀립니다.)
    </div>
  </div>
</template>
