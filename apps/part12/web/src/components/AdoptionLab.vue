<script setup lang="ts">
// 12장 캡스톤 실험실 — 사내 AI 도입 모형(Bass 확산 + 이탈). 가상의 회사, 직원 3,000명.
// 다이얼 셋(홍보·교육 p, 입소문 q, 평균 사용 기간 L)과 시각 막대로 저량-유량도·그래프·지표·시나리오 표를 함께 본다.
// 모형은 sim.ts adoptionRun(오일러법 DT = 1/64, 노트북 ch12_capstone.ipynb 와 동일).
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import TimePlot from './TimePlot.vue'
import SfdDiagram from './SfdDiagram.vue'
import { ADOPT, ADOPT_SCENARIOS, adoptionRun } from '@/data/sim'
import { fmt, type SfdStock, type SfdFlow, type SfdAux, type SfdLink } from '@/data/plot'

const M = ADOPT.M
const p = ref(0.01)
const q = ref(0.4)
const Lopts = [0, 24, 20, 12, 10, 6] // 0 = 이탈 없음
const L = ref(0)
const tNow = ref(12)
const active = ref<string>('base')

function load(key: string) {
  const s = ADOPT_SCENARIOS.find((x) => x.key === key)
  if (!s) return
  p.value = s.p
  q.value = s.q
  L.value = s.L
  active.value = key
}
function touched() {
  active.value = ''
}

const res = computed(() => adoptionRun(p.value, q.value, L.value))
const idxNow = computed(() => Math.min(res.value.t.length - 1, Math.round(tNow.value * 16)))
const Anow = computed(() => res.value.A[idxNow.value])
const adoptNow = computed(() => res.value.adopt[idxNow.value])
const churnNow = computed(() => res.value.churn[idxNow.value])

const userSeries = computed(() => [
  { label: '사용자 수', color: 'var(--c-emerald-600)', points: res.value.t.map((t, i) => [t, res.value.A[i]] as [number, number]), width: 3 },
])
const flowSeries = computed(() => {
  const s = [{ label: '도입(명/월)', color: 'var(--c-indigo-600)', points: res.value.t.map((t, i) => [t, res.value.adopt[i]] as [number, number]), width: 2.5 }]
  if (L.value > 0) s.push({ label: '이탈(명/월)', color: 'var(--c-rose-600)', points: res.value.t.map((t, i) => [t, res.value.churn[i]] as [number, number]), width: 2 })
  return s
})
const userMarkers = computed(() => {
  const m: { x: number; label?: string; color?: string }[] = []
  if (!isNaN(res.value.t50)) m.push({ x: res.value.t50, label: `50% 도달 ${res.value.t50.toFixed(1)}개월`, color: 'var(--c-amber-600)' })
  m.push({ x: tNow.value, color: 'var(--c-slate-500)' })
  return m
})
const flowMarkers = computed(() => [
  { x: res.value.peakT, label: `도입 정점 ${res.value.peakT.toFixed(1)}개월`, color: 'var(--c-indigo-600)' },
  { x: tNow.value, color: 'var(--c-slate-500)' },
])

const rows = computed(() => [
  ...ADOPT_SCENARIOS.map((s) => ({ ...s, r: adoptionRun(s.p, s.q, s.L), current: false })),
  { key: 'now', label: '지금 다이얼', p: p.value, q: q.value, L: L.value, r: res.value, current: true },
])
const base = adoptionRun(0.01, 0.4, 0)

// 저량-유량도 배치 — 넓은 화면은 가로 440, 휴대폰(화면 폭 480px 이하)은 같은 구조를 가로 320으로 좁혀
// 그림이 덜 줄어들게 한다(440을 300px 폭에 넣으면 글자가 8px대로 작아진다).
const narrow = ref(false)
let mq: MediaQueryList | null = null
const onMq = () => {
  narrow.value = !!mq?.matches
}
onMounted(() => {
  mq = window.matchMedia('(max-width: 480px)')
  onMq()
  mq.addEventListener('change', onMq)
})
onBeforeUnmount(() => mq?.removeEventListener('change', onMq))

interface SfdLayout {
  width: number
  height: number
  stocks: SfdStock[]
  flows: SfdFlow[]
  aux: SfdAux[]
  links: SfdLink[]
}
const sfd = computed<SfdLayout>(() => {
  const P = { id: 'P', label: '잠재 사용자', value: `${fmt(M - Anow.value)}명`, level: (M - Anow.value) / M }
  const A = { id: 'A', label: '사용자', value: `${fmt(Anow.value)}명`, level: Anow.value / M }
  const inRate = `${fmt(adoptNow.value)}명/월`
  const outRate = L.value > 0 ? `${fmt(churnNow.value)}명/월` : '없음'
  const life = L.value > 0 ? `${L.value}개월` : '∞'
  if (!narrow.value) {
    return {
      width: 440,
      height: 250,
      stocks: [
        { ...P, x: 85, y: 95, w: 128, h: 58 },
        { ...A, x: 355, y: 95, w: 128, h: 58 },
      ],
      flows: [
        { id: 'in', label: '도입', path: [[150, 95], [290, 95]], rate: inRate },
        { id: 'out', label: '이탈', path: [[355, 125], [355, 182], [85, 182], [85, 125]], valve: [220, 182], rate: outRate },
      ],
      aux: [
        { id: 'p', label: '홍보·교육 p', x: 160, y: 30, value: p.value.toFixed(3) },
        { id: 'q', label: '입소문 q', x: 280, y: 30, value: q.value.toFixed(2) },
        { id: 'L', label: '사용 기간 L', x: 400, y: 222, value: life },
      ],
      links: [
        { from: [166, 38], to: [214, 79], bend: 0.1 },
        { from: [274, 38], to: [226, 79], bend: -0.1 },
        { from: [312, 66], to: [232, 84], bend: -0.35, sign: '+' },
        { from: [394, 214], to: [234, 186], bend: 0.15 },
      ],
    }
  }
  return {
    width: 320,
    height: 250,
    stocks: [
      { ...P, x: 62, y: 95, w: 104, h: 58 },
      { ...A, x: 258, y: 95, w: 104, h: 58 },
    ],
    flows: [
      { id: 'in', label: '도입', path: [[115, 95], [205, 95]], rate: inRate },
      { id: 'out', label: '이탈', path: [[258, 125], [258, 182], [62, 182], [62, 125]], valve: [160, 182], rate: outRate },
    ],
    aux: [
      { id: 'p', label: '홍보·교육 p', x: 112, y: 30, value: p.value.toFixed(3) },
      { id: 'q', label: '입소문 q', x: 208, y: 30, value: q.value.toFixed(2) },
      { id: 'L', label: '사용 기간 L', x: 276, y: 222, value: life },
    ],
    links: [
      { from: [118, 38], to: [154, 79], bend: 0.1 },
      { from: [202, 38], to: [166, 79], bend: -0.1 },
      { from: [228, 66], to: [172, 84], bend: -0.35, sign: '+' },
      { from: [270, 214], to: [174, 186], bend: 0.15 },
    ],
  }
})
const summary = computed(() => {
  const r = res.value
  const parts: string[] = []
  if (isNaN(r.t50)) parts.push('3년 안에 직원의 절반을 넘기지 못합니다.')
  else {
    const d = base.t50 - r.t50
    parts.push(`직원의 절반(1,500명)에 ${r.t50.toFixed(1)}개월에 닿습니다` + (Math.abs(d) >= 0.05 ? `(기본보다 ${Math.abs(d).toFixed(1)}개월 ${d > 0 ? '빠름' : '느림'}).` : '(기본과 같음).'))
  }
  parts.push(`도입 속도는 ${r.peakT.toFixed(1)}개월에 월 ${fmt(r.peakRate)}명으로 가장 빠르고,`)
  parts.push(
    L.value > 0
      ? `이탈이 있어 결국 직원의 ${(r.eq * 100).toFixed(1)}%(${fmt(r.eq * M)}명)에서 평형을 이룹니다.`
      : `이탈이 없어 결국 전원(${fmt(M)}명)이 씁니다.`,
  )
  return parts.join(' ')
})
</script>

<template>
  <div class="my-5 rounded-xl border-2 border-indigo-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-700">🎯 캡스톤 실험 · 가상의 회사(직원 3,000명)에 사내 AI 도구를 들인다면</p>
    <p class="mb-3 text-xs text-slate-500">
      처음엔 아무도 쓰지 않습니다. 홍보·교육(p)이 첫 사용자를 만들고, 쓰는 동료가 많을수록 입소문(q)이 커지며, 쓰던 사람은 평균 L개월 뒤
      그만두고 다시 잠재 사용자가 됩니다. 시나리오를 고르거나 다이얼을 직접 돌려 보세요.
    </p>

    <div class="mb-3 flex flex-wrap gap-1.5">
      <button
        v-for="s in ADOPT_SCENARIOS"
        :key="s.key"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="active === s.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
        @click="load(s.key)"
      >
        {{ s.label }}
      </button>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <label class="block text-xs text-slate-500">
        홍보·교육 강도 p = <b class="text-slate-700">{{ p.toFixed(3) }}</b>
        <input v-model.number="p" type="range" min="0.005" max="0.05" step="0.005" class="mt-1 w-full accent-indigo-600" @input="touched" />
      </label>
      <label class="block text-xs text-slate-500">
        입소문 q = <b class="text-slate-700">{{ q.toFixed(2) }}</b>
        <input v-model.number="q" type="range" min="0" max="0.8" step="0.05" class="mt-1 w-full accent-emerald-600" @input="touched" />
      </label>
      <label class="block text-xs text-slate-500">
        평균 사용 기간 L
        <select v-model.number="L" class="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700" @change="touched">
          <option v-for="o in Lopts" :key="o" :value="o">{{ o === 0 ? '이탈 없음' : `${o}개월` }}</option>
        </select>
      </label>
    </div>

    <div class="mt-3 rounded-lg bg-slate-50 p-2">
      <SfdDiagram
        :width="sfd.width"
        :height="sfd.height"
        :stocks="sfd.stocks"
        :flows="sfd.flows"
        :aux="sfd.aux"
        :links="sfd.links"
        aria-label="잠재 사용자에서 사용자로 가는 도입 유량과 사용자에서 잠재 사용자로 돌아가는 이탈 유량의 저량-유량도"
      />
      <label class="mt-1 block px-1 text-xs text-slate-500">
        시각 = <b class="text-slate-700">{{ tNow }}개월</b> (저량-유량도의 숫자가 이 시각의 값)
        <input v-model.number="tNow" type="range" min="0" max="36" step="1" class="mt-1 w-full accent-slate-600" />
      </label>
    </div>

    <div class="mt-3 grid gap-3 md:grid-cols-2">
      <div class="min-w-0">
        <TimePlot
          :series="userSeries"
          :x-max="36"
          :y-min="0"
          :y-max="3300"
          :x-ticks="[0, 6, 12, 18, 24, 30, 36]"
          :hlines="[{ y: M, label: '전체 직원 3,000명', color: 'var(--c-blue-600)' }, { y: M / 2, label: '절반', color: 'var(--c-amber-600)' }]"
          :markers="userMarkers"
          x-label="개월"
          y-label="사용자 수(명)"
          :height="220"
          :legend="false"
          aria-label="사용자 수 그래프"
        />
      </div>
      <div class="min-w-0">
        <TimePlot
          :series="flowSeries"
          :x-max="36"
          :y-min="0"
          :y-max="Math.max(350, Math.ceil((res.peakRate * 1.15) / 50) * 50)"
          :x-ticks="[0, 6, 12, 18, 24, 30, 36]"
          :markers="flowMarkers"
          x-label="개월"
          y-label="명/월"
          :height="220"
          :legend="L > 0"
          aria-label="도입과 이탈 유량 그래프"
        />
      </div>
    </div>

    <div class="mt-2 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
      <div class="rounded-lg bg-amber-50 p-2">
        <p class="text-xs text-amber-800">절반(1,500명) 도달</p>
        <p class="font-mono text-lg font-bold text-amber-700">{{ isNaN(res.t50) ? '3년 안 못 함' : `${res.t50.toFixed(1)}개월` }}</p>
      </div>
      <div class="rounded-lg bg-indigo-50 p-2">
        <p class="text-xs text-indigo-800">도입 속도 정점</p>
        <p class="font-mono text-lg font-bold text-indigo-700">{{ res.peakT.toFixed(1) }}개월</p>
      </div>
      <div class="rounded-lg bg-emerald-50 p-2">
        <p class="text-xs text-emerald-800">36개월 뒤 사용자</p>
        <p class="font-mono text-lg font-bold text-emerald-700">{{ fmt(res.A36) }}명</p>
      </div>
      <div class="rounded-lg bg-rose-50 p-2">
        <p class="text-xs text-rose-800">평형 활성 비율</p>
        <p class="font-mono text-lg font-bold text-rose-700">{{ (res.eq * 100).toFixed(1) }}%</p>
      </div>
    </div>
    <p class="mt-2 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">📋 {{ summary }}</p>

    <p class="mt-4 mb-1 text-sm font-semibold text-slate-700">📊 시나리오 비교표</p>
    <div class="overflow-x-auto">
      <table class="w-full min-w-[36rem] text-left text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs text-slate-500">
            <th class="py-1.5 pr-2 font-medium">시나리오</th>
            <th class="py-1.5 pr-2 font-medium">p</th>
            <th class="py-1.5 pr-2 font-medium">q</th>
            <th class="py-1.5 pr-2 font-medium">이탈</th>
            <th class="py-1.5 pr-2 font-medium">절반 도달</th>
            <th class="py-1.5 pr-2 font-medium">도입 정점</th>
            <th class="py-1.5 pr-2 font-medium">36개월 사용자</th>
            <th class="py-1.5 font-medium">평형</th>
          </tr>
        </thead>
        <tbody class="font-mono text-slate-700">
          <tr v-for="row in rows" :key="row.key" class="border-b border-slate-100" :class="row.current ? 'bg-indigo-50 font-semibold' : ''">
            <td class="py-1.5 pr-2 font-sans">{{ row.label }}</td>
            <td class="py-1.5 pr-2">{{ row.p.toFixed(3) }}</td>
            <td class="py-1.5 pr-2">{{ row.q.toFixed(2) }}</td>
            <td class="py-1.5 pr-2 font-sans">{{ row.L > 0 ? `${row.L}개월` : '없음' }}</td>
            <td class="py-1.5 pr-2">{{ isNaN(row.r.t50) ? '—' : row.r.t50.toFixed(1) }}</td>
            <td class="py-1.5 pr-2">{{ row.r.peakT.toFixed(1) }}</td>
            <td class="py-1.5 pr-2">{{ fmt(row.r.A36) }}</td>
            <td class="py-1.5">{{ (row.r.eq * 100).toFixed(1) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
