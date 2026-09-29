<script setup lang="ts">
// 인터랙티브 Q·K·V 실험실 (셀프 어텐션 핵심).
// 각 단어는 Key(열쇠)와 Value(값) 벡터를 가진다. 내가 던지는 Query(질문) 벡터와
// 각 Key 의 '내적'이 점수가 되고 → 소프트맥스 → 그 집중도로 Value 들을 가중합 = 출력.
// Query 를 슬라이더로 움직이거나 각 단어의 기본 Query 를 불러와 점수 변화를 본다.
import { ref, computed } from 'vue'
import { softmax, argmax } from '@/utils/softmax'

const WORDS = ['강아지', '공', '물었다']
// 각 단어가 '광고하는' Key 벡터
const KEY: [number, number][] = [
  [1.4, 0.3],
  [0.3, 1.4],
  [0.4, 0.4],
]
// 각 단어가 '전달하는' Value 벡터
const VAL: [number, number][] = [
  [1.0, 0.0],
  [0.0, 1.0],
  [0.5, 0.5],
]
// 단어별 기본 Query (이 단어의 눈으로 볼 때)
const QDEF: [number, number][] = [
  [1.4, 0.2], // 강아지
  [0.2, 1.4], // 공
  [1.0, 1.0], // 물었다: 주어·목적어를 찾음
]

const q = ref<[number, number]>([...QDEF[2]]) // 기본: 물었다의 질문

const dot = (a: [number, number], b: [number, number]) => a[0] * b[0] + a[1] * b[1]

const scores = computed(() => KEY.map((k) => dot(q.value, k)))
const weights = computed(() => softmax(scores.value))
const top = computed(() => argmax(weights.value))
const output = computed<[number, number]>(() => {
  const o: [number, number] = [0, 0]
  weights.value.forEach((w, i) => {
    o[0] += w * VAL[i][0]
    o[1] += w * VAL[i][1]
  })
  return o
})

function loadQuery(i: number) {
  q.value = [...QDEF[i]]
}
function setQ(axis: 0 | 1, v: number) {
  const next: [number, number] = [...q.value]
  next[axis] = v
  q.value = next
}
const fmt = (v: [number, number]) => `(${v[0].toFixed(1)}, ${v[1].toFixed(1)})`
const pct = (w: number) => (w * 100).toFixed(0)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- Query 설정 -->
    <p class="mb-2 text-sm font-semibold text-slate-500">① Query(질문) 벡터: "내가 찾는 것"</p>
    <div class="mb-2 flex flex-wrap gap-2">
      <span class="text-xs text-slate-500 self-center">이 단어의 질문 불러오기:</span>
      <button
        v-for="(w, i) in WORDS"
        :key="w"
        type="button"
        class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
        @click="loadQuery(i)"
      >
        {{ w }}
      </button>
    </div>
    <div class="flex flex-wrap gap-4">
      <label class="flex items-center gap-2 text-sm">
        <span class="font-mono text-slate-500">Q.x</span>
        <input type="range" min="-1" max="2" step="0.1" :value="q[0]" class="h-2 w-28 cursor-pointer accent-indigo-500" @input="setQ(0, Number(($event.target as HTMLInputElement).value))" />
        <span class="w-8 font-mono text-sm tabular-nums">{{ q[0].toFixed(1) }}</span>
      </label>
      <label class="flex items-center gap-2 text-sm">
        <span class="font-mono text-slate-500">Q.y</span>
        <input type="range" min="-1" max="2" step="0.1" :value="q[1]" class="h-2 w-28 cursor-pointer accent-indigo-500" @input="setQ(1, Number(($event.target as HTMLInputElement).value))" />
        <span class="w-8 font-mono text-sm tabular-nums">{{ q[1].toFixed(1) }}</span>
      </label>
    </div>

    <!-- 점수 표 -->
    <p class="mt-4 mb-2 text-sm font-semibold text-slate-500">② 점수 = Query · Key (내적) → 소프트맥스 → 집중도</p>
    <div class="overflow-x-auto">
      <table class="w-full min-w-[460px] text-center text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs text-slate-500">
            <th class="px-2 py-1.5 font-medium">단어</th>
            <th class="px-2 py-1.5 font-medium">Key(열쇠)</th>
            <th class="px-2 py-1.5 font-medium">점수 = Q·K</th>
            <th class="px-2 py-1.5 font-medium">집중도</th>
            <th class="px-2 py-1.5 font-medium">Value(값)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(w, i) in WORDS" :key="w" class="border-b border-slate-100" :class="i === top ? 'bg-indigo-50/50' : ''">
            <td class="px-2 py-1.5 font-semibold text-slate-700">{{ w }}</td>
            <td class="px-2 py-1.5 font-mono text-slate-600">{{ fmt(KEY[i]) }}</td>
            <td class="px-2 py-1.5 font-mono text-slate-700">{{ scores[i].toFixed(2) }}</td>
            <td class="px-2 py-1.5">
              <div class="flex items-center gap-2">
                <div class="h-3 flex-1 overflow-hidden rounded bg-slate-100">
                  <div class="h-full rounded bg-indigo-400" :style="{ width: Math.max(weights[i] * 100, 2) + '%', opacity: i === top ? 1 : 0.55 }" />
                </div>
                <span class="w-9 text-right font-mono text-xs tabular-nums text-slate-600">{{ pct(weights[i]) }}%</span>
              </div>
            </td>
            <td class="px-2 py-1.5 font-mono text-slate-600">{{ fmt(VAL[i]) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 출력 -->
    <div class="mt-4 rounded-lg bg-violet-50 px-4 py-3 text-sm text-violet-900">
      🔑 지금 Query 는 <b>"{{ WORDS[top] }}"</b>의 Key 와 가장 잘 맞습니다
      <span class="text-violet-600">(집중도 {{ pct(weights[top]) }}%)</span>.
      <div class="mt-1 text-violet-700">
        출력 = 집중도로 Value 가중합 =
        <span class="font-mono">({{ output[0].toFixed(2) }}, {{ output[1].toFixed(2) }})</span>.
        이게 이 자리의 <b>새 문맥 벡터</b>가 됩니다.
      </div>
    </div>
  </div>
</template>
