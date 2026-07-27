<script setup lang="ts">
// 4장 실험실 — "실패하면 다시"의 수학. 완전 결정적(난수 없음 — 공식 그 자체를 조작한다):
// 한 번 성공률 p 와 시도 횟수 N 을 돌리며 ① 1−(1−p)^N ② 기대 시도 횟수 1/p ③ 뽑기 비용을 본다.
// 노트북(ch04_retry.ipynb)과 같은 수치.
import { ref, computed } from 'vue'

const NS = [1, 2, 3, 5, 10, 20]
const TOKENS_PER_TRY = 1000 // 시도 1번 ≈ 토큰 1,000개로 가정 (비용 감각용)

const pPct = ref(35) // 워밍업의 10단계 일 성공률(0.9¹⁰ ≈ 35%)에서 출발
const n = ref(5)

const p = computed(() => pPct.value / 100)
const atLeastOnce = (N: number) => 1 - Math.pow(1 - p.value, N)
const success = computed(() => atLeastOnce(n.value) * 100)
const expectedTries = computed(() => 1 / p.value)

// 목표 성공률을 넘는 데 필요한 N = ⌈log(1−목표)/log(1−p)⌉
const neededN = (target: number) => Math.ceil(Math.log(1 - target) / Math.log(1 - p.value))
const targets = computed(() =>
  [0.5, 0.9, 0.99].map((t) => ({ pct: t * 100, N: neededN(t), cost: neededN(t) * TOKENS_PER_TRY })),
)

// 수확 체감 곡선 (N = 1..20)
const curve = computed(() =>
  Array.from({ length: 20 }, (_, i) => ({ N: i + 1, pct: atLeastOnce(i + 1) * 100 })),
)
const fmt = (v: number) => v.toFixed(1)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 다이얼 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 한 번 시켰을 때의 성공률 p — 워밍업의 35%짜리 일부터</p>
    <div class="mb-3 flex items-center gap-3">
      <input v-model.number="pPct" type="range" min="5" max="95" step="5" class="flex-1 accent-indigo-600" />
      <span class="w-14 shrink-0 text-right font-mono text-sm font-bold text-indigo-700">{{ pPct }}%</span>
    </div>

    <p class="mb-1 text-sm font-semibold text-slate-500">② 몇 번까지 다시 시켜 볼까 — N 을 고르세요</p>
    <div class="mb-3 flex flex-wrap items-center gap-1.5">
      <button
        v-for="v in NS"
        :key="v"
        type="button"
        class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
        :class="n === v ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="n = v"
      >
        {{ v }}번
      </button>
    </div>

    <!-- ② 결과 게이지 -->
    <div class="space-y-3 rounded-lg bg-slate-50 p-4">
      <div class="flex items-center gap-3">
        <span class="w-40 shrink-0 text-sm font-semibold text-slate-600">N번 중 한 번이라도 성공</span>
        <div class="relative h-7 flex-1 overflow-hidden rounded-md bg-white ring-1 ring-slate-200">
          <div class="h-full rounded-md bg-indigo-400 transition-all duration-300" :style="{ width: success + '%' }" />
        </div>
        <span class="w-16 shrink-0 text-right font-mono text-sm font-bold text-slate-800">{{ fmt(success) }}%</span>
      </div>
      <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-700">
        <span>🎲 첫 성공까지 평균 <b>{{ expectedTries.toFixed(1) }}회</b> (= 1/p)</span>
        <span>💰 N번 뽑기 비용 ≈ <b>{{ (n * TOKENS_PER_TRY).toLocaleString() }}토큰</b></span>
      </div>
      <p class="text-xs text-slate-500">
        한 번의 성공률 {{ pPct }}%를 N={{ n }}번 다시 뽑으면 1 − (1 − {{ (p).toFixed(2) }})<sup>{{ n }}</sup> = {{ fmt(success) }}%.
      </p>
    </div>

    <!-- ③ 수확 체감 곡선 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">③ N 을 늘리면 — 가파르게 오르다 평평해진다 (수확 체감)</p>
    <div class="rounded-lg bg-slate-50 p-4">
      <div class="flex h-28 items-end gap-[3px]">
        <div
          v-for="pt in curve"
          :key="pt.N"
          class="flex-1 rounded-t transition-all duration-300"
          :class="pt.N === n ? 'bg-indigo-600' : 'bg-indigo-300'"
          :style="{ height: pt.pct + '%' }"
          :title="`N=${pt.N}: ${fmt(pt.pct)}%`"
        />
      </div>
      <div class="mt-1 flex justify-between text-xs text-slate-500"><span>N=1</span><span>N=10</span><span>N=20</span></div>
      <p class="mt-2 text-sm text-slate-700">
        처음 몇 번이 이득의 대부분을 가져갑니다 — 뒤로 갈수록 한 번 더 뽑는 값어치가 줄어요.
      </p>
    </div>

    <!-- ④ 목표별 필요 N -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">④ 목표 성공률을 넘으려면 몇 번 필요한가</p>
    <div class="grid grid-cols-3 gap-2">
      <div v-for="t in targets" :key="t.pct" class="rounded-lg bg-amber-50 px-3 py-2 text-center">
        <p class="text-xs font-medium text-amber-700">{{ t.pct }}% 넘기기</p>
        <p class="font-mono text-lg font-bold text-amber-900">N = {{ t.N }}</p>
        <p class="text-xs text-amber-700">≈ {{ t.cost.toLocaleString() }}토큰</p>
      </div>
    </div>
    <p class="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
      ⚠️ 대전제 — 이 마법은 <b>성공을 알아볼 수 있을 때만</b> 작동합니다. N개 중 어느 게 성공인지
      판별할 수 없다면 다시 뽑기는 무용지물 — 판별의 수학은 6장(검수자)에서.
    </p>
  </div>
</template>
