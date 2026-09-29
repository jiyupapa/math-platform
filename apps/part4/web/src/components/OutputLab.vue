<script setup lang="ts">
// 인터랙티브 출력층 실험실.
// 블록을 다 통과한 '마지막 문맥 벡터'를 슬라이더로 움직이면, 사전 속 각 단어와의 내적으로
// 점수(logit)가 나오고 → 소프트맥스 → 확률 → 다음 단어가 정해진다. (워밍업 소프트맥스와 직결)
import { ref, computed } from 'vue'
import { softmax, argmax } from '@/utils/softmax'

// 작은 사전: "오늘 날씨가 정말 ___" 후보들 + 각 단어의 출력 벡터(방향)
const VOCAB: { w: string; vec: [number, number] }[] = [
  { w: '좋다', vec: [1.0, 0.3] },
  { w: '춥다', vec: [0.3, 1.0] },
  { w: '덥다', vec: [-0.3, 1.0] },
  { w: '흐리다', vec: [-1.0, 0.3] },
  { w: '사과', vec: [0.2, -1.0] },
  { w: '달린다', vec: [-0.6, -0.8] },
]

const ctx = ref<[number, number]>([1.0, 0.2]) // 마지막 문맥 벡터

const dot = (a: [number, number], b: [number, number]) => a[0] * b[0] + a[1] * b[1]
const logits = computed(() => VOCAB.map((v) => dot(ctx.value, v.vec)))
const probs = computed(() => softmax(logits.value))
const top = computed(() => argmax(probs.value))

function setCtx(axis: 0 | 1, val: number) {
  const next: [number, number] = [...ctx.value]
  next[axis] = val
  ctx.value = next
}
const palette = ['var(--c-indigo-500)', 'var(--c-emerald-500)', 'var(--c-amber-500)', 'var(--c-pink-500)', 'var(--c-cyan-500)', 'var(--c-violet-500)']
const pct = (p: number) => (p * 100).toFixed(1)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- 문맥 벡터 -->
    <p class="mb-2 text-sm font-semibold text-slate-500">① 마지막 문맥 벡터 (블록들을 다 통과한 결과)</p>
    <div class="flex flex-wrap gap-4">
      <label class="flex items-center gap-2 text-sm">
        <span class="font-mono text-slate-500">벡터.x</span>
        <input type="range" min="-1.5" max="1.5" step="0.1" :value="ctx[0]" class="h-2 w-32 cursor-pointer accent-indigo-500" @input="setCtx(0, Number(($event.target as HTMLInputElement).value))" />
        <span class="w-8 font-mono text-sm tabular-nums">{{ ctx[0].toFixed(1) }}</span>
      </label>
      <label class="flex items-center gap-2 text-sm">
        <span class="font-mono text-slate-500">벡터.y</span>
        <input type="range" min="-1.5" max="1.5" step="0.1" :value="ctx[1]" class="h-2 w-32 cursor-pointer accent-indigo-500" @input="setCtx(1, Number(($event.target as HTMLInputElement).value))" />
        <span class="w-8 font-mono text-sm tabular-nums">{{ ctx[1].toFixed(1) }}</span>
      </label>
    </div>

    <!-- 단어별 점수 → 확률 -->
    <p class="mt-4 mb-2 text-sm font-semibold text-slate-500">② 단어마다 점수(logit) = 벡터·단어 → 소프트맥스 → 확률</p>
    <div class="overflow-x-auto">
      <table class="w-full min-w-[420px] text-center text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs text-slate-500">
            <th class="px-2 py-1.5 font-medium">단어</th>
            <th class="px-2 py-1.5 font-medium">점수(logit)</th>
            <th class="px-2 py-1.5 font-medium">확률</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(v, i) in VOCAB" :key="v.w" class="border-b border-slate-100" :class="i === top ? 'bg-indigo-50/50' : ''">
            <td class="px-2 py-1.5 font-semibold" :style="{ color: palette[i % palette.length] }">{{ v.w }}</td>
            <td class="px-2 py-1.5 font-mono text-slate-600">{{ logits[i].toFixed(2) }}</td>
            <td class="px-2 py-1.5">
              <div class="flex items-center gap-2">
                <div class="h-4 flex-1 overflow-hidden rounded bg-slate-100">
                  <div class="h-full rounded" :style="{ width: Math.max(probs[i] * 100, 2) + '%', backgroundColor: palette[i % palette.length], opacity: i === top ? 1 : 0.5 }" />
                </div>
                <span class="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-slate-600">{{ pct(probs[i]) }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 예측 -->
    <div class="mt-4 rounded-lg bg-violet-50 px-4 py-3 text-sm text-violet-900">
      🎯 "오늘 날씨가 정말 <b class="text-violet-700">{{ VOCAB[top].w }}</b>"
      <span class="text-violet-600">(확률 {{ pct(probs[top]) }}%)</span>.
      문맥 벡터가 가리키는 방향의 단어가 다음 단어로 뽑힙니다.
    </div>
  </div>
</template>
