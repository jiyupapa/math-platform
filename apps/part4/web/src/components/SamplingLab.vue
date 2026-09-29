<script setup lang="ts">
// 인터랙티브 샘플링 실험실.
// 고정된 다음 단어 점수(logits)에 temperature 와 top-k 를 걸어, 확률 분포가 어떻게 바뀌고
// 실제로 어떤 단어가 뽑히는지 본다. (temperature ↓ = 뾰족/안전, ↑ = 평평/다양)
import { ref, computed } from 'vue'
import { softmax } from '@/utils/softmax'

const VOCAB = ['좋다', '춥다', '덥다', '흐리다', '사과', '달린다']
const BASE = [3.0, 1.5, 1.0, 0.2, -0.5, -1.0] // 기본 점수(logits)

const temp = ref(1.0)
const mode = ref<'topk' | 'topp'>('topk') // 후보 자르는 방식
const topk = ref(6) // 상위 몇 개만 후보로 (6 = 전부)
const topp = ref(1.0) // 누적 확률이 이 값이 될 때까지만 후보로

// temperature 적용 → 소프트맥스
const probsFull = computed(() => softmax(BASE.map((l) => l / temp.value)))

// 후보 남기기: top-k(상위 k개) 또는 top-p(누적 확률 p까지)
const kept = computed(() => {
  const order = probsFull.value.map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p)
  if (mode.value === 'topk') {
    return new Set(order.slice(0, topk.value).map((o) => o.i))
  }
  const keep = new Set<number>()
  let cum = 0
  for (const o of order) {
    keep.add(o.i)
    cum += o.p
    if (cum >= topp.value) break // 누적이 p를 넘으면 멈춤
  }
  return keep
})
const keptCount = computed(() => kept.value.size)
const probs = computed(() => {
  const masked = probsFull.value.map((p, i) => (kept.value.has(i) ? p : 0))
  const sum = masked.reduce((a, b) => a + b, 0)
  return masked.map((p) => (sum > 0 ? p / sum : 0))
})

// 뽑기 (확률에 따라 무작위)
const picks = ref<string[]>([])
function draw() {
  const r = Math.random()
  let acc = 0
  for (let i = 0; i < VOCAB.length; i++) {
    acc += probs.value[i]
    if (r <= acc) {
      picks.value = [VOCAB[i], ...picks.value].slice(0, 14)
      return
    }
  }
}
function clearPicks() {
  picks.value = []
}

const palette = ['var(--c-indigo-500)', 'var(--c-emerald-500)', 'var(--c-amber-500)', 'var(--c-pink-500)', 'var(--c-cyan-500)', 'var(--c-violet-500)']
const pct = (p: number) => (p * 100).toFixed(0)
const flavor = computed(() =>
  temp.value <= 0.5
    ? '뾰족함: 거의 항상 1등만 (안전하지만 뻔함)'
    : temp.value >= 1.5
      ? '평평함: 이것저것 다양하게 (창의적이지만 위험)'
      : '보통: 적당히 다양',
)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- 컨트롤 -->
    <div class="mb-4 flex flex-wrap gap-x-6 gap-y-3">
      <label class="flex items-center gap-2 text-sm">
        <span class="font-medium text-slate-600">temperature</span>
        <input type="range" min="0.2" max="2" step="0.1" v-model.number="temp" class="h-2 w-40 cursor-pointer accent-indigo-500" />
        <span class="w-8 font-mono text-sm tabular-nums">{{ temp.toFixed(1) }}</span>
      </label>
      <div class="flex items-center gap-2 text-sm">
        <span class="font-medium text-slate-600">자르기</span>
        <button type="button" class="rounded-md border px-2 py-0.5 text-xs" :class="mode === 'topk' ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'" @click="mode = 'topk'">top-k</button>
        <button type="button" class="rounded-md border px-2 py-0.5 text-xs" :class="mode === 'topp' ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'" @click="mode = 'topp'">top-p</button>
      </div>
      <label v-if="mode === 'topk'" class="flex items-center gap-2 text-sm">
        <span class="font-medium text-slate-600">k</span>
        <input type="range" min="1" max="6" step="1" v-model.number="topk" class="h-2 w-28 cursor-pointer accent-indigo-500" />
        <span class="w-6 font-mono text-sm tabular-nums">{{ topk }}</span>
      </label>
      <label v-else class="flex items-center gap-2 text-sm">
        <span class="font-medium text-slate-600">p</span>
        <input type="range" min="0.1" max="1" step="0.05" v-model.number="topp" class="h-2 w-28 cursor-pointer accent-indigo-500" />
        <span class="w-16 font-mono text-sm tabular-nums">{{ topp.toFixed(2) }} → {{ keptCount }}개</span>
      </label>
    </div>
    <p class="mb-3 text-xs text-slate-500">
      temperature {{ temp.toFixed(1) }} → {{ flavor }}
      <span v-if="mode === 'topp'"> · top-p는 <b>누적 확률 {{ (topp * 100).toFixed(0) }}%</b>까지만 후보로 (지금 {{ keptCount }}개)</span>
    </p>

    <!-- 분포 -->
    <div class="space-y-1.5">
      <div v-for="(w, i) in VOCAB" :key="w" class="flex items-center gap-3" :class="!kept.has(i) ? 'opacity-35' : ''">
        <span class="w-14 shrink-0 text-right text-sm font-medium" :style="{ color: palette[i % palette.length] }">{{ w }}</span>
        <div class="h-5 flex-1 overflow-hidden rounded bg-slate-100">
          <div class="h-full rounded transition-all duration-200" :style="{ width: Math.max(probs[i] * 100, 0.5) + '%', backgroundColor: palette[i % palette.length] }" />
        </div>
        <span class="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-slate-500">{{ pct(probs[i]) }}%</span>
        <span class="w-12 shrink-0 text-xs text-slate-500">{{ kept.has(i) ? '' : '잘림' }}</span>
      </div>
    </div>

    <!-- 뽑기 -->
    <div class="mt-4 flex flex-wrap items-center gap-2">
      <button type="button" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700" @click="draw">🎲 다음 단어 뽑기</button>
      <button type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200" @click="clearPicks">지우기</button>
      <span class="text-xs text-slate-500">여러 번 눌러 보세요. temperature가 높을수록 뽑히는 단어가 다양해집니다.</span>
    </div>
    <div v-if="picks.length" class="mt-3 flex flex-wrap gap-1.5">
      <span v-for="(w, i) in picks" :key="i" class="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{{ w }}</span>
    </div>
  </div>
</template>
