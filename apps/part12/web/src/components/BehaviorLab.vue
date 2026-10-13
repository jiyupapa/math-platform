<script setup lang="ts">
// 1장 실험실 — 부품을 켜고 끄면 같은 저량(사용자 수)이 다른 시간의 모양을 그린다.
// "구조가 행동을 만든다". 모형은 sim.ts behaviorRun(완전 결정적, 오일러법 DT = 1/16개월).
// 노트북 ch01_bigpicture.ipynb 와 같은 값.
import { computed, ref } from 'vue'
import TimePlot from './TimePlot.vue'
import CldDiagram from './CldDiagram.vue'
import { BEHAVIOR, behaviorRun, peakOf } from '@/data/sim'
import { fmt, type CldLink, type CldLoop, type CldNode } from '@/data/plot'

const R = ref(true)
const B = ref(false)
const delay = ref(false)

const run = computed(() => behaviorRun({ R: R.value, B: B.value, delay: delay.value }))
const S = computed(() => run.value.s[0])
const at = (month: number) => S.value[Math.round(month / BEHAVIOR.dt)]
const peak = computed(() => peakOf(run.value.t, S.value))

type Shape = 'none' | 'exp' | 'goal' | 's' | 'osc' | 'sosc'
const shape = computed<Shape>(() => {
  if (!R.value && !B.value) return 'none'
  if (R.value && !B.value) return 'exp'
  if (!R.value) return delay.value ? 'osc' : 'goal'
  return delay.value ? 'sosc' : 's'
})

const verdict = computed(() => {
  const p = `약 ${fmt(peak.value.v)}명(약 ${Math.round(peak.value.t)}개월)`
  switch (shape.value) {
    case 'none':
      return { name: '변화 없음', tone: 'text-slate-700', desc: '가입을 정하는 고리가 없으면 아무도 들어오지 않아 사용자 수는 50명 그대로입니다.' }
    case 'exp':
      return {
        name: '지수 성장',
        tone: 'text-rose-700',
        desc:
          `사용자가 많을수록 가입도 많아 점점 빨라집니다. 12개월 ${fmt(at(12))}명, 36개월이면 약 ${fmt(Math.round(at(36) / 10000))}만 명으로 그래프를 뚫고 나가요.` +
          (delay.value ? ' (지연은 균형 루프가 있어야 효과가 있어요. 늦게 볼 "한계"가 없으니까요.)' : ''),
      }
    case 'goal':
      return { name: '목표 추구', tone: 'text-blue-700', desc: '남은 여지가 클수록 빨리, 작을수록 천천히 채웁니다. 1,000명에 점점 느리게 다가가요.' }
    case 's':
      return {
        name: 'S자 성장',
        tone: 'text-emerald-700',
        desc: '처음엔 입소문(강화 루프)이 이겨 지수처럼 빨라지다가, 한계에 가까워지면 균형 루프가 이겨 완만해집니다.',
      }
    case 'osc':
      return {
        name: '출렁이며 목표 추구',
        tone: 'text-amber-700',
        desc: `사용자 수를 3개월 늦게 보니 목표를 넘긴 뒤에도 한동안 계속 받아들입니다. 최고 ${p}까지 넘쳤다가 되돌아와요.`,
      }
    default:
      return {
        name: '넘쳤다 출렁이는 S자',
        tone: 'text-amber-700',
        desc: `S자로 오르다 한계를 넘어 최고 ${p}까지 넘친 뒤 1,000명 근처로 돌아옵니다.`,
      }
  }
})

const SHAPES: { key: Shape[]; name: string; structure: string }[] = [
  { key: ['exp'], name: '지수 성장', structure: '강화 루프가 지배' },
  { key: ['goal'], name: '목표 추구', structure: '균형 루프가 지배' },
  { key: ['s'], name: 'S자 성장', structure: '강화 → 균형으로 지배가 넘어감' },
  { key: ['osc', 'sosc'], name: '출렁임', structure: '균형 루프 + 지연' },
]

// 인과지도 — 켠 부품만 그린다
const nodes = computed<CldNode[]>(() => {
  const n: CldNode[] = [
    { id: 'gain', label: '신규 가입', x: 200, y: 36 },
    { id: 'users', label: '사용자 수', x: 200, y: 200, stock: true },
  ]
  if (B.value) n.push({ id: 'room', label: '남은 여지', x: 352, y: 118 })
  return n
})
const links = computed<CldLink[]>(() => {
  const l: CldLink[] = [{ from: 'gain', to: 'users', sign: '+' }]
  if (R.value) l.push({ from: 'users', to: 'gain', sign: '+', bend: -0.6 })
  if (B.value) {
    l.push({ from: 'users', to: 'room', sign: '−', bend: 0.15, delay: delay.value })
    l.push({ from: 'room', to: 'gain', sign: '+', bend: 0.15 })
  }
  return l
})
const loops = computed<CldLoop[]>(() => {
  const p: CldLoop[] = []
  if (R.value) p.push({ x: 174, y: 112, type: 'R', label: '입소문' })
  if (B.value) p.push({ x: 262, y: 112, type: 'B', label: R.value ? '한계' : '목표' })
  return p
})

const series = computed(() => [
  { label: '사용자 수(저량)', color: 'var(--c-emerald-600)', points: run.value.t.map((t, i) => [t, S.value[i]] as [number, number]), width: 3 },
])
const hlines = computed(() => (B.value ? [{ y: 1000, label: '한계·목표 1,000명', color: 'var(--c-blue-600)' }] : []))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 · 부품을 켜고 꺼 보세요: 같은 사용자 수, 다른 시간의 모양</p>
    <p class="mb-3 text-xs text-slate-500">
      처음 사용자 50명에서 3년(36개월)을 계산합니다. 신규 가입(유입)을 무엇이 정하는지, 고리를 골라 끼워 보세요.
    </p>
    <div class="grid gap-2 sm:grid-cols-3">
      <button
        type="button"
        class="rounded-lg border px-3 py-2 text-left text-sm transition"
        :class="R ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
        :aria-pressed="R"
        @click="R = !R"
      >
        <b>{{ R ? '✅' : '⬜' }} 강화 루프</b>
        <span class="block text-xs">입소문: 사용자가 많을수록 가입이 많다</span>
      </button>
      <button
        type="button"
        class="rounded-lg border px-3 py-2 text-left text-sm transition"
        :class="B ? 'border-blue-300 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
        :aria-pressed="B"
        @click="B = !B"
      >
        <b>{{ B ? '✅' : '⬜' }} 균형 루프</b>
        <span class="block text-xs">한계: 1,000명에 가까울수록 가입이 준다</span>
      </button>
      <button
        type="button"
        class="rounded-lg border px-3 py-2 text-left text-sm transition"
        :class="delay ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
        :aria-pressed="delay"
        @click="delay = !delay"
      >
        <b>{{ delay ? '✅' : '⬜' }} 지연</b>
        <span class="block text-xs">사용자 수가 3개월 늦게 보인다</span>
      </button>
    </div>

    <div class="mt-3 grid items-center gap-3 md:grid-cols-[2fr_3fr]">
      <div class="min-w-0 rounded-lg bg-slate-50 p-2">
        <p class="mb-1 text-xs font-semibold text-slate-500">지금 끼운 구조(인과지도)</p>
        <CldDiagram :nodes="nodes" :links="links" :loops="loops" :width="440" :height="236" aria-label="사용자 수와 신규 가입의 인과지도" />
      </div>
      <div class="min-w-0">
        <p class="mb-1 text-xs font-semibold text-slate-500">그 구조가 만든 시간의 모양</p>
        <TimePlot
          :series="series"
          :x-max="36"
          :y-min="0"
          :y-max="1600"
          :x-ticks="[0, 6, 12, 18, 24, 30, 36]"
          :hlines="hlines"
          x-label="개월"
          y-label="명"
          :height="230"
          :legend="false"
          aria-label="36개월 동안의 사용자 수"
        />
      </div>
    </div>

    <p class="mt-2 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed">
      <b :class="verdict.tone">{{ verdict.name }}</b>
      <span class="text-slate-700"> · {{ verdict.desc }}</span>
    </p>

    <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <div
        v-for="s in SHAPES"
        :key="s.name"
        class="rounded-lg border p-2 text-center text-xs"
        :class="s.key.includes(shape) ? 'border-indigo-300 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-500'"
      >
        <b class="block text-sm">{{ s.name }}</b>
        {{ s.structure }}
      </div>
    </div>
  </div>
</template>
