<script setup lang="ts">
// 코드 공방 — 글자 빈도를 슬라이더로 조절하면 허프만 코드와 평균 비트가 실시간으로 바뀐다.
// "자주 나오면 짧게"가 실제로 얼마나 아끼는지, 균등 분포에서는 왜 못 아끼는지 체감시킨다.
// 각 글자의 놀람 log₂(1/p) 열을 나란히 두어 "코드 길이 ≈ 놀람"(3장 복선)을 보여준다.
import { ref, computed } from 'vue'

const LETTERS = ['A', 'B', 'C', 'D']
const COLORS = ['var(--c-indigo-500)', 'var(--c-emerald-500)', 'var(--c-amber-500)', 'var(--c-pink-500)']

// 빈도 가중치 (1~32). 기본값은 절약이 잘 보이는 치우친 분포.
const weights = ref<number[]>([16, 8, 4, 4])

const total = computed(() => weights.value.reduce((s, w) => s + w, 0))
const probs = computed(() => weights.value.map((w) => w / total.value))

// 허프만 코드 — 가장 가벼운 두 묶음을 반복해서 합치며, 합쳐질 때마다 소속 글자 코드 앞에 0/1을 붙인다.
const codes = computed<string[]>(() => {
  const result = LETTERS.map(() => '')
  let nodes = weights.value.map((w, i) => ({ w, idxs: [i] }))
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.w - b.w)
    const a = nodes.shift()!
    const b = nodes.shift()!
    for (const i of a.idxs) result[i] = '0' + result[i]
    for (const i of b.idxs) result[i] = '1' + result[i]
    nodes.push({ w: a.w + b.w, idxs: [...a.idxs, ...b.idxs] })
  }
  return result
})

// 평균 코드 길이 = Σ p × (코드 길이). 고정 길이(2비트)와 비교한다.
const FIXED = 2
const avgBits = computed(() =>
  probs.value.reduce((s, p, i) => s + p * codes.value[i].length, 0),
)
const savingPct = computed(() => ((FIXED - avgBits.value) / FIXED) * 100)

const presets = [
  { label: '⚖️ 균등 (25%씩)', w: [8, 8, 8, 8] },
  { label: '📊 살짝 치우침', w: [16, 8, 4, 4] },
  { label: '🗻 극단 (A 천하)', w: [29, 1, 1, 1] },
]
function applyPreset(w: number[]) {
  weights.value = [...w]
}

function surprise(p: number): number {
  return Math.log2(1 / p)
}
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-3 text-sm font-semibold text-slate-700">
      🔧 코드 공방 — 글자 빈도를 조절해 보세요
    </p>

    <!-- 프리셋 -->
    <div class="mb-3 flex flex-wrap gap-1.5">
      <button
        v-for="pr in presets"
        :key="pr.label"
        class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
        @click="applyPreset(pr.w)"
      >
        {{ pr.label }}
      </button>
    </div>

    <!-- 글자별: 슬라이더 + 확률 + 코드 + 놀람 -->
    <div class="overflow-x-auto">
      <table class="w-full min-w-[30rem] text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-xs text-slate-500">
            <th class="py-1.5 pr-2 font-medium">글자</th>
            <th class="py-1.5 pr-2 font-medium">빈도</th>
            <th class="w-16 py-1.5 pr-2 font-medium">확률</th>
            <th class="w-20 py-1.5 pr-2 font-medium">코드</th>
            <th class="w-14 py-1.5 pr-2 font-medium">길이</th>
            <th class="w-24 py-1.5 font-medium">놀람 log₂(1/p)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(letter, i) in LETTERS" :key="letter" class="border-b border-slate-100">
            <td class="py-2 pr-2">
              <span
                class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                :style="{ background: COLORS[i] }"
              >
                {{ letter }}
              </span>
            </td>
            <td class="py-2 pr-2">
              <input
                v-model.number="weights[i]"
                type="range"
                min="1"
                max="32"
                step="1"
                class="w-full"
                :style="{ accentColor: COLORS[i] }"
                :aria-label="`${letter} 빈도`"
              />
            </td>
            <td class="py-2 pr-2 tabular-nums text-slate-700">{{ (probs[i] * 100).toFixed(0) }}%</td>
            <td class="py-2 pr-2">
              <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] tracking-wider">{{ codes[i] }}</code>
            </td>
            <td class="py-2 pr-2 tabular-nums text-slate-700">{{ codes[i].length }}비트</td>
            <td class="py-2 tabular-nums text-slate-500">{{ surprise(probs[i]).toFixed(2) }}비트</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 요약: 고정 vs 가변 -->
    <div class="mt-3 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-2.5">
        <p class="text-lg font-bold text-slate-700">{{ FIXED.toFixed(2) }}</p>
        <p class="text-xs text-slate-500">고정 코드 (글자당 비트)</p>
      </div>
      <div class="rounded-lg bg-indigo-50 p-2.5">
        <p class="text-lg font-bold text-indigo-700">{{ avgBits.toFixed(2) }}</p>
        <p class="text-xs text-indigo-600">내가 만든 코드 (평균 비트)</p>
      </div>
      <div class="rounded-lg p-2.5" :class="savingPct > 0.5 ? 'bg-emerald-50' : 'bg-amber-50'">
        <p class="text-lg font-bold" :class="savingPct > 0.5 ? 'text-emerald-700' : 'text-amber-700'">
          {{ savingPct.toFixed(0) }}%
        </p>
        <p class="text-xs" :class="savingPct > 0.5 ? 'text-emerald-700' : 'text-amber-700'">절약</p>
      </div>
    </div>

    <p class="mt-2 text-xs text-slate-500">
      1000글자짜리 메시지라면: 고정 {{ (FIXED * 1000).toLocaleString() }}비트 →
      내 코드 <b class="text-slate-600">{{ Math.round(avgBits * 1000).toLocaleString() }}비트</b>.
      균등(25%씩)으로 맞추면 절약이 0이 되는 것도 확인해 보세요.
      코드 길이가 각 글자의 <b>놀람</b>과 닮아 가는 것, 보이나요? (3장의 복선입니다)
    </p>
  </div>
</template>
