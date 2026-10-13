<script setup lang="ts">
// 2장 실험실 — ① 순유량 막대를 끌어 그리면 저량이 쌓인다(면적 = 저량의 변화).
//              ② 저량·유량 가려내기(단위·사진 테스트).
// 완전 결정적. 프리셋과 수치는 sim.ts NET_PRESETS·accumulate, 노트북 ch02_stockflow.ipynb 와 동일.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import TimePlot from './TimePlot.vue'
import { NET_PRESETS, STOCK0, accumulate } from '@/data/sim'
import { fmt } from '@/data/plot'

// ── ① 막대 그리기 ────────────────────────────────────────────
const preset = ref<string>('fall')
const net = ref<number[]>([...NET_PRESETS.fall.values])
function choose(key: string) {
  preset.value = key
  net.value = [...NET_PRESETS[key].values]
}
const stock = computed(() => accumulate(net.value))
const area = computed(() => net.value.reduce((a, b) => a + b, 0))
const peakMonth = computed(() => {
  const s = stock.value
  let i = 0
  for (let k = 1; k < s.length; k++) if (s[k] > s[i]) i = k
  return i
})
const minStock = computed(() => Math.min(...stock.value))

// 막대 편집기 — 폭은 화면에 맞춰 실제 픽셀로(휴대폰에서도 글자 크기 유지), 높이 200, 가운데 0선
const wrap = ref<HTMLElement | null>(null)
const BW = ref(600)
let ro: ResizeObserver | null = null
onMounted(() => {
  const set = () => {
    const w = wrap.value?.clientWidth ?? 600
    if (w > 0) BW.value = Math.max(260, Math.min(920, Math.round(w)))
  }
  set()
  if (wrap.value) {
    ro = new ResizeObserver(set)
    ro.observe(wrap.value)
  }
})
onBeforeUnmount(() => ro?.disconnect())
const BH = 200
const PAD = { l: 40, r: 10, t: 12, b: 26 }
const VMAX = 60
const barW = computed(() => (BW.value - PAD.l - PAD.r) / 12)
const barX = (i: number) => PAD.l + i * barW.value
const yOf = (v: number) => PAD.t + ((VMAX - v) / (2 * VMAX)) * (BH - PAD.t - PAD.b)
const svgEl = ref<SVGSVGElement | null>(null)
const dragging = ref(false)
function setFromPointer(e: PointerEvent) {
  const svg = svgEl.value
  if (!svg) return
  const ctm = svg.getScreenCTM()
  if (!ctm) return
  const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
  const i = Math.floor((pt.x - PAD.l) / barW.value)
  if (i < 0 || i > 11) return
  const v = VMAX - ((pt.y - PAD.t) / (BH - PAD.t - PAD.b)) * 2 * VMAX
  const snapped = Math.max(-VMAX, Math.min(VMAX, Math.round(v / 5) * 5))
  if (net.value[i] !== snapped) {
    const copy = [...net.value]
    copy[i] = snapped
    net.value = copy
    preset.value = 'custom'
  }
}
function down(e: PointerEvent) {
  dragging.value = true
  ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
  setFromPointer(e)
}
function move(e: PointerEvent) {
  if (dragging.value) setFromPointer(e)
}
function up() {
  dragging.value = false
}

const stockSeries = computed(() => [
  { label: '저량', color: 'var(--c-emerald-600)', values: stock.value, x0: 0, dots: true, width: 3 },
])

// ── ② 저량·유량 가려내기 ─────────────────────────────────────
const CARDS = [
  { name: '사내 AI 도구 사용자 수', unit: '명', kind: 'stock' },
  { name: '신규 가입', unit: '명/월', kind: 'flow' },
  { name: 'GPU 대기열 길이', unit: '건', kind: 'stock' },
  { name: '초당 요청 수', unit: '건/초', kind: 'flow' },
  { name: '모델 가중치의 값', unit: '(숫자)', kind: 'stock' },
  { name: '한 걸음의 가중치 업데이트', unit: '(숫자)/걸음', kind: 'flow' },
  { name: '지금까지 학습한 토큰 수', unit: '토큰', kind: 'stock' },
  { name: '학습 처리량', unit: '토큰/초', kind: 'flow' },
] as const
const answers = ref<Record<number, 'stock' | 'flow'>>({})
const solved = computed(() => Object.keys(answers.value).length)
const correct = computed(() => CARDS.filter((c, i) => answers.value[i] === c.kind).length)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① · 순유량 막대를 그리면 저량이 쌓인다</p>
    <p class="mb-2 text-xs text-slate-500">
      막대 한 칸 = 한 달의 순유량(유입 − 유출, 명/월). 처음 저량은 {{ STOCK0 }}명. 보기를 고르거나
      <b>막대를 직접 끌어</b> 바꿔 보세요(위로 +, 아래로 −).
    </p>
    <div class="mb-2 flex flex-wrap gap-1.5">
      <button
        v-for="(p, key) in NET_PRESETS"
        :key="key"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="preset === key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
        @click="choose(String(key))"
      >
        {{ p.label }}
      </button>
      <span v-if="preset === 'custom'" class="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800">직접 그린 막대</span>
    </div>

    <div ref="wrap">
    <svg
      ref="svgEl"
      :viewBox="`0 0 ${BW} ${BH}`"
      :width="BW"
      :height="BH"
      class="block h-auto max-w-full touch-none select-none"
      role="img"
      aria-label="월별 순유량 막대 편집기: 막대를 위아래로 끌어 값을 바꾼다"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="up"
    >
      <line v-for="v in [-60, -30, 30, 60]" :key="'g' + v" :x1="PAD.l" :x2="BW - PAD.r" :y1="yOf(v)" :y2="yOf(v)" stroke="var(--c-grid)" />
      <text v-for="v in [-60, -30, 0, 30, 60]" :key="'t' + v" :x="PAD.l - 6" :y="yOf(v) + 4" text-anchor="end" font-size="12" fill="var(--c-slate-500)">{{ v > 0 ? '+' + v : v }}</text>
      <rect
        v-for="(v, i) in net"
        :key="'b' + i"
        :x="barX(i) + 3"
        :y="v >= 0 ? yOf(v) : yOf(0)"
        :width="barW - 6"
        :height="Math.max(1.5, Math.abs(yOf(v) - yOf(0)))"
        :fill="v >= 0 ? 'var(--c-emerald-500)' : 'var(--c-rose-500)'"
        :opacity="0.8"
        rx="2"
      />
      <line :x1="PAD.l" :x2="BW - PAD.r" :y1="yOf(0)" :y2="yOf(0)" stroke="var(--c-slate-500)" stroke-width="1.5" />
      <text v-for="i in 12" :key="'m' + i" :x="barX(i - 1) + barW / 2" :y="BH - 8" text-anchor="middle" font-size="12" fill="var(--c-slate-500)">{{ BW < 480 ? i : i + '월' }}</text>
    </svg>
    </div>

    <p class="mt-1 mb-1 text-xs font-semibold text-slate-500">그 막대가 쌓은 저량(월말)</p>
    <TimePlot
      :series="stockSeries"
      :x-max="12"
      :y-min="Math.min(0, minStock)"
      :y-max="Math.max(300, Math.ceil((Math.max(...stock) * 1.15) / 100) * 100)"
      :x-ticks="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
      :markers="peakMonth > 0 && peakMonth < 12 ? [{ x: peakMonth, label: `정점 ${peakMonth}월 말`, color: 'var(--c-emerald-600)' }] : []"
      x-label="월"
      y-label="명"
      :height="200"
      :legend="false"
      aria-label="월말 저량 그래프"
    />
    <div class="mt-2 grid gap-2 sm:grid-cols-3">
      <div class="rounded-lg bg-slate-50 p-2 text-center">
        <p class="text-xs text-slate-500">막대 면적의 합(+ 위, − 아래)</p>
        <p class="font-mono text-lg font-bold" :class="area >= 0 ? 'text-emerald-700' : 'text-rose-700'">{{ area > 0 ? '+' : '' }}{{ fmt(area) }}명</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2 text-center">
        <p class="text-xs text-slate-500">마지막 저량 − 처음 저량</p>
        <p class="font-mono text-lg font-bold text-indigo-700">{{ fmt(stock[12]) }} − {{ STOCK0 }} = {{ fmt(stock[12] - STOCK0) }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2 text-center">
        <p class="text-xs text-slate-500">12월 말 저량</p>
        <p class="font-mono text-lg font-bold text-emerald-700">{{ fmt(stock[12]) }}명</p>
      </div>
    </div>
    <p v-if="minStock < 0" class="mt-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
      ⚠️ 저량이 0 아래({{ fmt(minStock) }}명)로 내려갔어요. 수학으로는 가능하지만 현실의 욕조는 빈 뒤로 물이 더 빠지지 않습니다.
      실제 모형에서는 유출이 남은 저량보다 클 수 없게 만들어요(예: 이탈 = 사용자 수 × 이탈 비율).
    </p>
    <p v-else class="mt-2 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      💡 '늘어나는 유입'과 '줄어드는 유입'을 번갈아 눌러 보세요. 막대 면적의 합은 둘 다 +390명이라 12월 말 저량은 똑같이
      490명인데, 가는 길(곡선의 휘는 방향)이 다릅니다. 매달의 막대 높이는 그달 저량 곡선의 <b>기울기</b>이고,
      막대들의 <b>면적 합</b>이 저량의 변화예요. '오르내림'에서는 막대가 +에서 −로 바뀌는 4월 말에 저량이 정점입니다.
    </p>

    <!-- ② -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② · 저량일까, 유량일까</p>
    <p class="mb-2 text-xs text-slate-500">
      두 가지 시험으로 가려냅니다. <b>사진 시험</b>: 시간을 멈추고 사진을 찍으면 보이는가(저량), 흐려지는가(유량).
      <b>단위 시험</b>: 단위에 '/시간'이 붙으면 유량.
    </p>
    <div class="grid gap-2 sm:grid-cols-2">
      <div v-for="(c, i) in CARDS" :key="c.name" class="flex items-center gap-2 rounded-lg border border-slate-200 p-2">
        <span class="min-w-0 flex-1 text-sm text-slate-700">
          {{ c.name }}
          <span class="block text-xs text-slate-500">단위: {{ c.unit }}</span>
        </span>
        <button
          v-for="k in ['stock', 'flow'] as const"
          :key="k"
          type="button"
          class="rounded-md px-2.5 py-1 text-xs font-semibold transition"
          :class="
            answers[i] === k
              ? k === c.kind
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          "
          @click="answers = { ...answers, [i]: k }"
        >
          {{ k === 'stock' ? '저량' : '유량' }}
        </button>
      </div>
    </div>
    <p v-if="solved === CARDS.length" class="mt-2 rounded-lg p-3 text-sm" :class="correct === CARDS.length ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'">
      {{ correct }}/{{ CARDS.length }} 정답.
      <template v-if="correct === CARDS.length">모델 가중치와 학습한 토큰 수도 저량이라는 것까지 맞혔어요. 가중치는 업데이트(유량)가 쌓인 결과입니다.</template>
      <template v-else>빨간 칸을 다시 보세요. 단위에 '/월', '/초', '/걸음'이 붙으면 유량이에요.</template>
    </p>
  </div>
</template>
