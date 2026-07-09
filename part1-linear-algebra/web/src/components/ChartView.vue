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

const mergedOptions = computed<ChartOptions<any>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  ...props.options,
}))

const chartComponent = computed(() => {
  if (props.type === 'line') return Line
  if (props.type === 'scatter') return Scatter
  return Bar
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <div :style="{ height: height + 'px' }">
      <component :is="chartComponent" :data="data" :options="mergedOptions" />
    </div>
  </div>
</template>
