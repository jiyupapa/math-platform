<script setup lang="ts">
// 9장 실험실 — ① 극성 정하기: 사내 AI 튜터 도입의 인과지도에서 화살표 7개의 +/− 를 정하고 루프를 판정한다.
//              ② 같은 그림, 다른 행동: 같은 인과지도(강화 + 균형 + 지연)가 지연 길이에 따라 S자·출렁임·큰 출렁임.
// 완전 결정적. 루프 판정 = 루프 안 − 개수의 홀짝. ② 는 sim.ts sameCldRun(노트북 ch09_cld.ipynb 와 동일).
import { computed, ref } from 'vue'
import CldDiagram from './CldDiagram.vue'
import TimePlot from './TimePlot.vue'
import { SAME_CLD, sameCldRun, peakOf } from '@/data/sim'
import { fmt, type CldLink } from '@/data/plot'

type Sign = '+' | '−' | '?'
const NODES = [
  { id: 'users', label: '사용자 수', x: 200, y: 255, stock: true },
  { id: 'share', label: '성공 사례 공유', x: 72, y: 148 },
  { id: 'gain', label: '신규 가입', x: 200, y: 40 },
  { id: 'load', label: '서버 부하', x: 352, y: 255 },
  { id: 'lag', label: '응답 지연', x: 412, y: 150 },
  { id: 'sat', label: '만족도', x: 352, y: 40 },
]
const LINKS: { from: string; to: string; answer: Sign; text: string; bend?: number }[] = [
  { from: 'users', to: 'share', answer: '+', text: '사용자가 많을수록 성공 사례 공유가', bend: -0.15 },
  { from: 'share', to: 'gain', answer: '+', text: '성공 사례가 많이 공유될수록 신규 가입이', bend: -0.15 },
  { from: 'gain', to: 'users', answer: '+', text: '신규 가입이 많을수록 사용자 수가(원래보다)' },
  { from: 'users', to: 'load', answer: '+', text: '사용자가 많을수록 서버 부하가' },
  { from: 'load', to: 'lag', answer: '+', text: '서버 부하가 클수록 응답 지연이', bend: 0.1 },
  { from: 'lag', to: 'sat', answer: '−', text: '응답 지연이 길수록 만족도가', bend: 0.1 },
  { from: 'sat', to: 'gain', answer: '+', text: '만족도가 높을수록 신규 가입이' },
]
const label = (id: string) => NODES.find((n) => n.id === id)?.label ?? id
const signs = ref<Sign[]>(LINKS.map(() => '?'))
const checked = ref(false)
function cycle(i: number) {
  const order: Sign[] = ['?', '+', '−']
  const copy = [...signs.value]
  copy[i] = order[(order.indexOf(copy[i]) + 1) % 3]
  signs.value = copy
  checked.value = false
}
const links = computed<CldLink[]>(() => LINKS.map((l, i) => ({ from: l.from, to: l.to, sign: signs.value[i], bend: l.bend })))

// 루프: 입소문(0,1,2) · 속도 저하(3,4,5,6,2)
const LOOPS = [
  { name: '입소문 고리', idx: [0, 1, 2] },
  { name: '속도 저하 고리', idx: [3, 4, 5, 6, 2] },
]
function judge(idx: number[], s: Sign[]): 'R' | 'B' | '?' {
  if (idx.some((i) => s[i] === '?')) return '?'
  return idx.filter((i) => s[i] === '−').length % 2 === 0 ? 'R' : 'B'
}
const mine = computed(() => LOOPS.map((l) => judge(l.idx, signs.value)))
const truth = LOOPS.map((l) => judge(l.idx, LINKS.map((k) => k.answer)))
const allSet = computed(() => signs.value.every((s) => s !== '?'))
const nCorrect = computed(() => LINKS.filter((l, i) => signs.value[i] === l.answer).length)
const loopMarks = computed(() => [
  { x: 152, y: 148, type: (mine.value[0] === '?' ? truth[0] : mine.value[0]) as 'R' | 'B', label: '입소문' },
  { x: 290, y: 148, type: (mine.value[1] === '?' ? truth[1] : mine.value[1]) as 'R' | 'B', label: '속도 저하' },
])

// ── ② 같은 그림, 다른 행동 ─────────────────────────────────
const COLORS = ['var(--c-emerald-600)', 'var(--c-amber-600)', 'var(--c-rose-600)']
const runs = SAME_CLD.map((c) => ({ ...c, run: sameCldRun(c.D) }))
const sameSeries = runs.map((c, i) => ({
  label: `${c.label}: 최고 ${fmt(peakOf(c.run.t, c.run.s[0]).v)}명`,
  color: COLORS[i],
  points: c.run.t.map((t, k) => [t, c.run.s[0][k]] as [number, number]),
  width: 2.5,
}))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① · 화살표마다 +/−를 정하고 루프를 판정하세요</p>
    <p class="mb-2 text-xs text-slate-500">
      사내 AI 튜터 도입의 인과지도입니다. 아래 문장마다 버튼을 눌러 <b>+</b>(같은 방향: 원인이 늘면 결과가 원래보다 커짐) 또는
      <b>−</b>(반대 방향: 원인이 늘면 결과가 원래보다 작아짐)를 고르세요. 다른 조건은 그대로라고 생각합니다.
    </p>
    <div class="rounded-lg bg-slate-50 p-2">
      <CldDiagram :nodes="NODES" :links="links" :loops="allSet ? loopMarks : []" :width="470" :height="290" aria-label="사내 AI 튜터 도입의 인과지도" />
    </div>
    <div class="mt-3 space-y-1.5">
      <div v-for="(l, i) in LINKS" :key="i" class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5">
        <span class="min-w-0 flex-1 text-sm text-slate-700">
          <span class="text-xs font-semibold text-slate-500">{{ label(l.from) }} → {{ label(l.to) }}</span>
          <span class="block">{{ l.text }} …</span>
        </span>
        <button
          type="button"
          class="w-11 shrink-0 rounded-md py-1 text-lg font-bold transition"
          :class="
            checked
              ? signs[i] === l.answer
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
              : signs[i] === '+'
                ? 'bg-indigo-100 text-indigo-700'
                : signs[i] === '−'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 text-slate-500'
          "
          :aria-label="`${label(l.from)} → ${label(l.to)} 화살표의 부호: ${signs[i]}`"
          @click="cycle(i)"
        >
          {{ signs[i] }}
        </button>
      </div>
    </div>
    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-semibold transition"
        :class="allSet ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'cursor-not-allowed bg-slate-200 text-slate-500'"
        :disabled="!allSet"
        @click="checked = true"
      >
        판정하기
      </button>
      <span v-if="!allSet" class="text-xs text-slate-500">일곱 개를 모두 정하면 루프 판정이 나옵니다.</span>
    </div>
    <div v-if="allSet" class="mt-3 grid gap-2 sm:grid-cols-2">
      <div v-for="(l, k) in LOOPS" :key="l.name" class="rounded-lg bg-slate-50 p-3 text-sm">
        <b class="text-slate-800">{{ l.name }}</b>: − 화살표 {{ l.idx.filter((i) => signs[i] === '−').length }}개 →
        <b :class="mine[k] === 'R' ? 'text-rose-700' : 'text-blue-700'">{{ mine[k] === 'R' ? '강화 루프(R)' : '균형 루프(B)' }}</b>
        <template v-if="checked">
          <span v-if="mine[k] === truth[k]" class="ml-1 text-emerald-700">✓</span>
          <span v-else class="ml-1 text-rose-700">✗ (정답: {{ truth[k] === 'R' ? '강화' : '균형' }})</span>
        </template>
      </div>
    </div>
    <p v-if="checked" class="mt-2 rounded-lg p-3 text-sm" :class="nCorrect === LINKS.length ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'">
      화살표 {{ nCorrect }}/{{ LINKS.length }} 정답.
      <template v-if="nCorrect === LINKS.length">입소문은 − 가 없어 강화 루프, 속도 저하는 − 가 하나(응답 지연 → 만족도)라 균형 루프입니다.</template>
      <template v-else>빨간 칸을 다시 보세요. 응답이 느려질수록 만족도는 어떻게 될까요? 화살표 하나만 틀려도 루프 종류가 뒤집힐 수 있어요.</template>
    </p>

    <!-- ② -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② · 같은 그림, 다른 행동</p>
    <p class="mb-2 text-xs text-slate-500">
      세 곡선은 <b>똑같은 인과지도</b>(입소문 강화 루프 + 한계 균형 루프 + 사용자 수가 늦게 보이는 지연)에서 나왔습니다.
      다른 것은 지연의 길이라는 <b>숫자 하나</b>뿐이에요(1장 모형, 성장률 0.35, 한계 1,000명, 48개월).
    </p>
    <TimePlot
      :series="sameSeries"
      :x-max="48"
      :y-min="0"
      :y-max="2200"
      :x-ticks="[0, 12, 24, 36, 48]"
      :hlines="[{ y: 1000, label: '한계 1,000명', color: 'var(--c-blue-600)' }]"
      x-label="개월"
      y-label="사용자 수(명)"
      :height="230"
      aria-label="같은 인과지도에서 지연 길이만 다른 세 시뮬레이션"
    />
    <p class="mt-2 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      💡 인과지도만 보고는 이 세 운명 중 무엇이 올지 알 수 없습니다. 고리의 모양은 같고, 숫자(지연의 길이·성장률)가 행동을 가르기 때문이에요.
      그래서 시스템 다이내믹스는 그림에서 멈추지 않고 저량-유량도로 옮겨 계산까지 합니다.
    </p>
  </div>
</template>
