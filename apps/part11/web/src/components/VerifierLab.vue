<script setup lang="ts">
// 6장 실험실 — 검수자(verifier)를 통과한 답이 진짜 맞을 확률(베이즈 사후확률)을
// 기저율·민감도·특이도 다이얼로 직접 조작한다. 완전 해석적(난수 없음) —
// 그리드는 답안 100개를 반올림 정수로 배치한 시각화이고, 게이지·수치는 정확값을 쓴다.
import { ref, computed } from 'vue'

const p = ref(0.35) // 기저율 — 답이 애초에 맞을 확률 (워밍업의 그 35%)
const s = ref(0.9) // 민감도 — 맞는 답을 통과시킬 확률
const t = ref(0.8) // 특이도 — 틀린 답을 걸러낼 확률
const doublePass = ref(false) // 독립 검수 2회 통과

const posterior = (prior: number) =>
  (prior * s.value) / (prior * s.value + (1 - prior) * (1 - t.value))
const post1 = computed(() => posterior(p.value))
const post2 = computed(() => posterior(post1.value))
const shown = computed(() => (doublePass.value ? post2.value : post1.value))

// 답안 100개 그리드 (시각화용 — 칸 수는 반올림 정수)
const counts = computed(() => {
  const correct = Math.round(p.value * 100)
  const cp = Math.round(correct * s.value) // 정답인데 통과
  const wrong = 100 - correct
  const wp = Math.round(wrong * (1 - t.value)) // 오답인데 통과(새는 오답)
  return { correct, cp, cr: correct - cp, wrong, wp, wr: wrong - wp }
})
const cells = computed(() => {
  const { cp, cr, wp, wr } = counts.value
  return [
    ...Array(cp).fill('cp'),
    ...Array(cr).fill('cr'),
    ...Array(wp).fill('wp'),
    ...Array(wr).fill('wr'),
  ] as ('cp' | 'cr' | 'wp' | 'wr')[]
})
const passCells = computed(() => cells.value.filter((c) => c === 'cp' || c === 'wp'))

const CELL_CLASS: Record<string, string> = {
  cp: 'bg-emerald-400', // 정답 · 통과
  cr: 'bg-amber-300', // 정답인데 거부 (아깝게 걸러짐)
  wp: 'bg-rose-500', // 오답인데 통과 (위험!)
  wr: 'bg-slate-200', // 오답 · 거부
}

function preset(kind: 'warmup' | 'hard') {
  p.value = kind === 'warmup' ? 0.35 : 0.05
  s.value = 0.9
  t.value = 0.8
  doublePass.value = false
}
const pct = (v: number) => (v * 100).toFixed(1)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 다이얼 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 세 개의 다이얼: 바탕과 검수자의 실력</p>
    <div class="mb-3 space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
      <label class="flex items-center gap-3">
        <span class="w-44 shrink-0 text-slate-700"><b>기저율</b> (답이 애초에 맞을 확률)</span>
        <input v-model.number="p" type="range" min="0.05" max="0.9" step="0.05" class="flex-1 accent-indigo-600" />
        <span class="w-14 shrink-0 text-right font-mono font-bold text-indigo-700">{{ Math.round(p * 100) }}%</span>
      </label>
      <label class="flex items-center gap-3">
        <span class="w-44 shrink-0 text-slate-700"><b>민감도</b> (맞는 답을 통과시킴)</span>
        <input v-model.number="s" type="range" min="0.5" max="0.99" step="0.01" class="flex-1 accent-emerald-600" />
        <span class="w-14 shrink-0 text-right font-mono font-bold text-emerald-700">{{ Math.round(s * 100) }}%</span>
      </label>
      <label class="flex items-center gap-3">
        <span class="w-44 shrink-0 text-slate-700"><b>특이도</b> (틀린 답을 걸러냄)</span>
        <input v-model.number="t" type="range" min="0.5" max="0.99" step="0.01" class="flex-1 accent-rose-600" />
        <span class="w-14 shrink-0 text-right font-mono font-bold text-rose-700">{{ Math.round(t * 100) }}%</span>
      </label>
      <div class="flex flex-wrap gap-1.5 pt-1">
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-white"
          @click="preset('warmup')"
        >
          프리셋: 워밍업 일꾼 (기저율 35%)
        </button>
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-white"
          @click="preset('hard')"
        >
          프리셋: 어려운 과업 (기저율 5%)
        </button>
      </div>
    </div>

    <!-- ② 답안 100개 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">② 답안 100개를 검수대에 올리면</p>
    <div class="rounded-lg bg-slate-50 p-4">
      <div class="mb-2 grid grid-cols-20 gap-0.5" style="grid-template-columns: repeat(20, minmax(0, 1fr))">
        <span v-for="(c, i) in cells" :key="i" class="aspect-square rounded-[3px]" :class="CELL_CLASS[c]" />
      </div>
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        <span><i class="mr-1 inline-block h-3 w-3 rounded-[3px] bg-emerald-400 align-[-1px]" />정답·통과 {{ counts.cp }}</span>
        <span><i class="mr-1 inline-block h-3 w-3 rounded-[3px] bg-amber-300 align-[-1px]" />정답인데 거부 {{ counts.cr }}</span>
        <span><i class="mr-1 inline-block h-3 w-3 rounded-[3px] bg-rose-500 align-[-1px]" />오답인데 통과 {{ counts.wp }}</span>
        <span><i class="mr-1 inline-block h-3 w-3 rounded-[3px] bg-slate-200 align-[-1px]" />오답·거부 {{ counts.wr }}</span>
      </div>
    </div>

    <!-- ③ 통과 더미만 모아 보기 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">③ 검수 통과 더미만 모아 보면: 여기서 정답 비율이 사후확률</p>
    <div class="rounded-lg bg-slate-50 p-4">
      <div class="mb-2 flex flex-wrap gap-0.5">
        <span v-for="(c, i) in passCells" :key="i" class="h-4 w-4 rounded-[3px]" :class="CELL_CLASS[c]" />
        <span v-if="!passCells.length" class="text-xs text-slate-500">통과한 답안이 없습니다</span>
      </div>
      <div class="mb-1 flex items-center gap-3">
        <div class="relative h-5 flex-1 overflow-hidden rounded-md bg-white ring-1 ring-slate-200">
          <div class="h-full rounded-md bg-indigo-500 transition-all duration-300" :style="{ width: pct(shown) + '%' }" />
        </div>
        <span class="w-24 shrink-0 text-right font-mono text-lg font-bold text-indigo-700">{{ pct(shown) }}%</span>
      </div>
      <p class="text-sm text-slate-700">
        검수 <b>{{ doublePass ? '2회' : '1회' }}</b> 통과한 답이 진짜 맞을 확률은
        검수 전 {{ Math.round(p * 100) }}%에서
        <b class="text-indigo-700">{{ pct(shown) }}%</b>로.
      </p>
      <p
        v-if="shown < 0.5"
        class="mt-2 rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800"
      >
        ⚠️ 기저율의 역설: 검수를 통과했는데도 절반이 못 됩니다. 오답이 워낙 많아
        “새는 오답”({{ counts.wp }}개)이 “통과한 정답”({{ counts.cp }}개)에 비해 무시할 수 없어요.
        바탕(기저율)이 나쁘면 좋은 검수자도 확신을 못 줍니다.
      </p>
    </div>

    <!-- ④ 반복 검수 -->
    <label class="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input v-model="doublePass" type="checkbox" class="h-4 w-4 accent-indigo-600" />
      <span><b>독립 검수 2회 통과 보기</b>: 첫 검수의 사후확률이 두 번째 검수의 기저율이 됩니다 (베이즈 갱신의 연쇄)</span>
    </label>
    <p v-if="doublePass" class="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
      {{ Math.round(p * 100) }}% → 1회 통과 {{ pct(post1) }}% → 2회 통과 <b>{{ pct(post2) }}%</b>.
      단, <b>서로 독립인</b> 검수자여야 합니다. 같은 검수자에게 두 번 물으면 같은 맹점이 두 번 통과돼요.
    </p>
  </div>
</template>
