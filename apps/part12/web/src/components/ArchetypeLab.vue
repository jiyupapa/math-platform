<script setup lang="ts">
// 10장 실험실 — 시스템 원형 여섯 개. 원형마다 인과지도 + 작은 시뮬레이션(정책 비교) + 어디를 건드릴지.
// 모형은 sim.ts archLimits·archBurden·archFixes·archGoals·archCommons·archSuccess(노트북 ch10_archetypes.ipynb 와 동일).
import { computed, ref } from 'vue'
import TimePlot from './TimePlot.vue'
import CldDiagram from './CldDiagram.vue'
import { archLimits, archBurden, archFixes, archGoals, archCommons, archSuccess, type ArchRun } from '@/data/sim'
import type { CldLink, CldLoop, CldNode } from '@/data/plot'

interface Arch {
  key: string
  name: string
  en: string
  story: string
  nodes: CldNode[]
  links: CldLink[]
  loops: CldLoop[]
  runs: ArchRun[]
  T: number
  yMin: number
  yMax: number
  yLabel: string
  shape: string
  lever: string
}

const COLORS = ['var(--c-indigo-600)', 'var(--c-rose-600)', 'var(--c-emerald-600)']

const ARCHES: Arch[] = [
  {
    key: 'limits',
    name: '성장의 한계',
    en: 'Limits to Growth',
    story: '사내 AI 도구가 입소문으로 잘 퍼지다가 어느 순간 멈췄다. 홍보를 두 배로 늘려도 같은 높이에서 멈춘다.',
    nodes: [
      { id: 'u', label: '사용자 수', x: 130, y: 182, stock: true },
      { id: 'g', label: '신규 가입', x: 130, y: 36 },
      { id: 'room', label: '남은 여지', x: 272, y: 109 },
    ],
    links: [
      { from: 'g', to: 'u', sign: '+' },
      { from: 'u', to: 'g', sign: '+', bend: -0.75 },
      { from: 'u', to: 'room', sign: '−', bend: 0.12 },
      { from: 'room', to: 'g', sign: '+', bend: 0.12 },
    ],
    loops: [
      { x: 104, y: 109, type: 'R', label: '성장 엔진' },
      { x: 184, y: 109, type: 'B', label: '한계' },
    ],
    runs: archLimits(),
    T: 36,
    yMin: 0,
    yMax: 1650,
    yLabel: '사용자 수(명)',
    shape: '성장 엔진을 두 배로 세게 돌려도 같은 천장(1,000명)에 더 빨리 닿을 뿐입니다. 천장 자체를 올려야(1,500명) 결과가 달라져요.',
    lever: '성장 엔진(강화 루프)을 더 밀지 말고, 한계를 만드는 균형 루프를 찾아 미리 넓히세요. 사용자 한계라면 대상 부서 확대, 서버 한계라면 증설처럼요.',
  },
  {
    key: 'burden',
    name: '문제 전가',
    en: 'Shifting the Burden',
    story: '보고서 품질 문제를 AI가 대신 써 주는 것으로 빠르게 덮는다. 직원들이 직접 다듬는 연습을 안 하게 되면서 역량이 줄고, 문제는 다시 늘어난다.',
    nodes: [
      { id: 's', label: '증상', x: 50, y: 118 },
      { id: 'q', label: '빠른 처방', x: 200, y: 34 },
      { id: 'f', label: '근본 처방', x: 200, y: 200 },
      { id: 'c', label: '역량', x: 335, y: 118, stock: true },
    ],
    links: [
      { from: 's', to: 'q', sign: '+', bend: 0.3 },
      { from: 'q', to: 's', sign: '−', bend: 0.3 },
      { from: 's', to: 'f', sign: '+', bend: -0.12 },
      { from: 'f', to: 'c', sign: '+', delay: true, bend: -0.12 },
      { from: 'c', to: 's', sign: '−' },
      { from: 'q', to: 'c', sign: '−', bend: -0.12 },
    ],
    loops: [
      { x: 118, y: 62, type: 'B', label: '' },
      { x: 196, y: 152, type: 'B', label: '근본 해결' },
      { x: 258, y: 92, type: 'R', label: '의존' },
    ],
    runs: archBurden(),
    T: 36,
    yMin: 0,
    yMax: 45,
    yLabel: '증상(문제 건수)',
    shape: '빠른 처방만 쓰면 석 달 만에 30 → 18로 좋아 보이다가 역량이 무너지며 27까지 되돌아갑니다. 근본 처방만 쓰면 처음엔 37까지 나빠 보이지만 3년 뒤 1.3. 둘을 함께 쓰면 7.5에서 안정돼요.',
    lever: '빠른 처방은 근본 처방의 시간을 버는 데만 쓰고, 그동안 역량(근본 처방의 저량)이 줄지 않는지 따로 측정하세요.',
  },
  {
    key: 'fixes',
    name: '실패하는 처방',
    en: 'Fixes that Fail',
    story: '쌓이는 버그를 검토 없이 AI 생성 코드로 급히 메운다. 몇 달 뒤 그 코드가 새 버그를 만들어 처음보다 더 많아진다.',
    nodes: [
      { id: 'p', label: '문제', x: 70, y: 110, stock: true },
      { id: 'x', label: '처방', x: 230, y: 40 },
      { id: 'side', label: '부작용', x: 230, y: 182 },
    ],
    links: [
      { from: 'p', to: 'x', sign: '+', bend: 0.25 },
      { from: 'x', to: 'p', sign: '−', bend: 0.25 },
      { from: 'x', to: 'side', sign: '+', delay: true, bend: -0.3 },
      { from: 'side', to: 'p', sign: '+', bend: -0.1 },
    ],
    loops: [
      { x: 150, y: 76, type: 'B', label: '증상 완화' },
      { x: 220, y: 116, type: 'R', label: '부작용' },
    ],
    runs: archFixes(),
    T: 48,
    yMin: 0,
    yMax: 80,
    yLabel: '문제(건)',
    shape: '처방하면 6개월 만에 40 → 13.6건으로 줄지만, 6개월 뒤부터 부작용이 돌아와 2년이면 45건, 4년이면 65건으로 처방하지 않았을 때(40건)보다 나빠집니다.',
    lever: '처방의 지연된 결과까지 계산에 넣으세요(5·6장). 부작용이 늦게 오는 처방일수록 효과를 길게 지켜본 뒤에 늘립니다.',
  },
  {
    key: 'goals',
    name: '목표 침식',
    en: 'Eroding Goals',
    story: 'AI 답변 정확도 목표가 95%였는데, 못 맞추는 달이 이어지자 90%, 85%로 조금씩 내렸다. 그때마다 품질도 따라 내려갔다.',
    nodes: [
      { id: 'perf', label: '품질', x: 60, y: 182, stock: true },
      { id: 'gap', label: '격차', x: 190, y: 110 },
      { id: 'eff', label: '개선 노력', x: 60, y: 38 },
      { id: 'goal', label: '목표', x: 320, y: 38, stock: true },
      { id: 'low', label: '목표 낮추기', x: 310, y: 182 },
    ],
    links: [
      { from: 'perf', to: 'gap', sign: '−' },
      { from: 'gap', to: 'eff', sign: '+' },
      { from: 'eff', to: 'perf', sign: '+' },
      { from: 'goal', to: 'gap', sign: '+' },
      { from: 'gap', to: 'low', sign: '+' },
      { from: 'low', to: 'goal', sign: '−' },
    ],
    loops: [
      { x: 102, y: 110, type: 'B', label: '노력' },
      { x: 272, y: 110, type: 'B', label: '목표 하향' },
    ],
    runs: archGoals(),
    T: 48,
    yMin: 40,
    yMax: 100,
    yLabel: '품질·목표(%)',
    shape: '목표를 지키면 품질은 86%에서 안정됩니다. 목표를 격차 쪽으로 내리기 시작하면 목표와 품질이 함께 미끄러져 4년 뒤 56%예요.',
    lever: '목표를 바깥 기준(고객 요구, 외부 벤치마크)에 묶어 두고, 목표를 바꿀 때는 따로 결정하는 절차를 거치게 하세요.',
  },
  {
    key: 'commons',
    name: '공유지의 비극',
    en: 'Tragedy of the Commons',
    story: '두 팀이 공용 GPU 크레딧을 함께 쓴다. 각자 자기 일만 보고 사용을 매달 늘리다 크레딧 풀이 바닥나 둘 다 쓸 수 없게 됐다.',
    nodes: [
      { id: 'ua', label: 'A팀 사용', x: 70, y: 40 },
      { id: 'ga', label: 'A팀 이익', x: 70, y: 182 },
      { id: 'r', label: '공용 자원', x: 195, y: 110, stock: true },
      { id: 'ub', label: 'B팀 사용', x: 320, y: 40 },
      { id: 'gb', label: 'B팀 이익', x: 320, y: 182 },
    ],
    links: [
      { from: 'ua', to: 'ga', sign: '+', bend: 0.3 },
      { from: 'ga', to: 'ua', sign: '+', bend: 0.3 },
      { from: 'ub', to: 'gb', sign: '+', bend: -0.3 },
      { from: 'gb', to: 'ub', sign: '+', bend: -0.3 },
      { from: 'ua', to: 'r', sign: '−' },
      { from: 'ub', to: 'r', sign: '−' },
      { from: 'r', to: 'ga', sign: '+' },
      { from: 'r', to: 'gb', sign: '+' },
    ],
    loops: [
      { x: 40, y: 110, type: 'R', label: '' },
      { x: 350, y: 110, type: 'R', label: '' },
      { x: 128, y: 120, type: 'B', label: '고갈' },
    ],
    runs: archCommons(),
    T: 48,
    yMin: 0,
    yMax: 17,
    yLabel: '실제 사용량',
    shape: '각자 늘리면 사용량이 한때 15.7까지 치솟지만 자원이 2년 안에 바닥나 둘 다 0이 됩니다. 총량을 지속 가능한 수준(7.5)으로 묶으면 약 7을 4년 내내 씁니다.',
    lever: '공용 자원의 상태를 모두에게 보이게 하고(정보 지연 줄이기), 총량 규칙이나 팀별 할당으로 개인의 강화 루프에 공동의 균형 루프를 붙이세요.',
  },
  {
    key: 'success',
    name: '부익부',
    en: 'Success to the Successful',
    story: 'AI 시범 사업에서 첫 분기 성과가 조금 나았던 팀에 예산을 더 줬다. 예산이 성과를 만들고 성과가 다시 예산을 불러, 다른 팀은 시작도 못 하고 밀려났다.',
    nodes: [
      { id: 'pa', label: 'A 성과', x: 60, y: 40 },
      { id: 'ra', label: 'A 예산', x: 60, y: 182, stock: true },
      { id: 'sh', label: 'A로 몰아주기', x: 190, y: 110 },
      { id: 'rb', label: 'B 예산', x: 320, y: 182, stock: true },
      { id: 'pb', label: 'B 성과', x: 320, y: 40 },
    ],
    links: [
      { from: 'pa', to: 'sh', sign: '+' },
      { from: 'sh', to: 'ra', sign: '+' },
      { from: 'ra', to: 'pa', sign: '+' },
      { from: 'sh', to: 'rb', sign: '−' },
      { from: 'rb', to: 'pb', sign: '+' },
      { from: 'pb', to: 'sh', sign: '−' },
    ],
    loops: [
      { x: 102, y: 110, type: 'R', label: 'A 성공' },
      { x: 278, y: 110, type: 'R', label: 'B 몰락' },
    ],
    runs: archSuccess(),
    T: 36,
    yMin: 0,
    yMax: 100,
    yLabel: '성과',
    shape: '52 대 48의 작은 차이가 1년 만에 90 대 10, 3년 뒤 100 대 0이 됩니다. 팀마다 최소 30%를 보장하면 70 대 30에서 멈춰 B 팀도 살아남아요.',
    lever: '배분이 과거 성과만 따라가지 않게 기본 몫을 보장하거나, 성과를 같은 출발선에서 다시 재는 장치를 두세요.',
  },
]

const sel = ref(0)
const arch = computed(() => ARCHES[sel.value])
const series = computed(() =>
  arch.value.runs.map((r, i) => ({
    label: r.label,
    color: COLORS[i % COLORS.length],
    points: r.t.filter((_, k) => k % 4 === 0).map((t, k) => [t, r.y[k * 4]] as [number, number]),
    width: 2.5,
    dashed: arch.value.key === 'goals' && i === 2,
  })),
)
const xTicks = computed(() => (arch.value.T === 48 ? [0, 12, 24, 36, 48] : [0, 6, 12, 18, 24, 30, 36]))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-2 text-sm font-semibold text-slate-700">🧪 실험 · 시스템 원형 갤러리: 하나씩 골라 구조·행동·처방을 보세요</p>
    <div class="mb-3 flex flex-wrap gap-1.5">
      <button
        v-for="(a, i) in ARCHES"
        :key="a.key"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="sel === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
        @click="sel = i"
      >
        {{ a.name }}
      </button>
    </div>

    <p class="text-base font-bold text-slate-800">
      {{ arch.name }} <span class="text-sm font-medium text-slate-500">({{ arch.en }})</span>
    </p>
    <p class="mb-2 text-sm leading-relaxed text-slate-600">📖 {{ arch.story }}</p>
    <div class="grid items-center gap-3 md:grid-cols-2">
      <div class="min-w-0 rounded-lg bg-slate-50 p-2">
        <CldDiagram :nodes="arch.nodes" :links="arch.links" :loops="arch.loops" :width="380" :height="220" :aria-label="`${arch.name}의 인과지도`" />
      </div>
      <div class="min-w-0">
        <TimePlot
          :series="series"
          :x-max="arch.T"
          :y-min="arch.yMin"
          :y-max="arch.yMax"
          :x-ticks="xTicks"
          x-label="개월"
          :y-label="arch.yLabel"
          :height="230"
          :aria-label="`${arch.name} 시뮬레이션`"
        />
      </div>
    </div>
    <div class="mt-3 grid gap-2 sm:grid-cols-2">
      <p class="rounded-lg bg-amber-50 p-3 text-sm leading-relaxed text-amber-900"><b>무슨 일이 벌어지나</b> · {{ arch.shape }}</p>
      <p class="rounded-lg bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-900"><b>어디를 건드리나</b> · {{ arch.lever }}</p>
    </div>
  </div>
</template>
