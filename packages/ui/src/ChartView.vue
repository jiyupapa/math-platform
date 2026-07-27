<script setup lang="ts">
// vue-chartjs 래퍼. 정적 그래프(막대/선/산점도)를 선언적으로 표시한다.
// 필요한 Chart.js 모듈만 등록해 번들을 가볍게 유지한다.
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { Bar, Line, Scatter } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { cssVar, themeVersion } from './theme'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
)

const props = withDefaults(
  defineProps<{
    type?: 'bar' | 'line' | 'scatter'
    data: ChartData<any>
    options?: ChartOptions<any>
    height?: number
  }>(),
  { type: 'bar', height: 280 },
)

// 색 토큰(var(--c-*)) 해석 — Chart.js 는 <canvas> 에 그리는데 canvas 는 CSS 변수를 못 읽는다.
// SVG 데모는 stroke="var(--c-slate-200)" 를 그대로 쓸 수 있지만 여기선 실제 색으로 풀어서 넘겨야 한다.
// 덕분에 챕터는 SVG 든 차트든 같은 토큰 이름을 쓸 수 있다(tokens.css 참조).
function resolveTokens<T>(value: T): T {
  if (typeof value === 'string') {
    if (!value.startsWith('var(')) return value
    const name = value.slice(4, -1).split(',')[0].trim()
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    return (resolved || value) as T
  }
  if (Array.isArray(value)) return value.map(resolveTokens) as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = resolveTokens(v)
    return out as T
  }
  return value
}

// 뒤쪽(사용자 옵션)이 이긴다. 객체만 재귀 병합하고 배열·원시값은 통째로 덮어쓴다.
function deepMerge(base: any, over: any): any {
  if (!over || typeof over !== 'object' || Array.isArray(over)) return over ?? base
  const out: Record<string, unknown> = { ...base }
  for (const [k, v] of Object.entries(over)) {
    const b = (base ?? {})[k]
    out[k] = b && typeof b === 'object' && !Array.isArray(b) ? deepMerge(b, v) : v
  }
  return out
}

// Chart.js 는 자체 기본색을 쓴다(눈금·범례 #666, 격자 rgba(0,0,0,.1)) — 다크에서 #666 은
// 카드 배경 대비 2.6:1 로 못 읽는다. 팔레트 토큰에서 기본값을 만들어 깔아준다(사용자 옵션이 우선).
function themeDefaults() {
  const ink = cssVar('--color-slate-500')
  const grid = cssVar('--color-slate-200')
  const axis = { ticks: { color: ink }, grid: { color: grid }, border: { color: grid } }
  return {
    responsive: true,
    maintainAspectRatio: false,
    color: ink,
    scales: { x: axis, y: axis },
    plugins: { legend: { labels: { color: ink } }, title: { color: ink } },
  }
}

// themeVersion 을 읽어 두면 테마가 바뀔 때 computed 가 무효화돼 차트가 새 색으로 다시 그려진다.
// (CSS 변수는 canvas 에 자동으로 반영되지 않는다.)
const resolvedData = computed<ChartData<any>>(() => {
  void themeVersion.value
  return resolveTokens(props.data)
})

const mergedOptions = computed<ChartOptions<any>>(() => {
  void themeVersion.value
  return resolveTokens(deepMerge(themeDefaults(), props.options))
})

const chartComponent = computed(() => {
  if (props.type === 'line') return Line
  if (props.type === 'scatter') return Scatter
  return Bar
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <div :style="{ height: height + 'px' }">
      <component :is="chartComponent" :data="resolvedData" :options="mergedOptions" />
    </div>
  </div>
</template>
