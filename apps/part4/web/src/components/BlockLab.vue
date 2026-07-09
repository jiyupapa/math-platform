<script setup lang="ts">
// 인터랙티브 트랜스포머 블록 실험실.
// 블록을 여러 층 쌓을 때, 잔차연결/층정규화가 있고 없고에 따라 '신호 크기'가 어떻게 되는지 본다.
//   - 둘 다 없음      → 신호가 점점 사라짐(기울기 소실)
//   - 잔차만          → 값이 폭발
//   - 층정규화 있음   → 안정적으로 유지 → 깊게 쌓을 수 있음
import { ref, computed } from 'vue'
import ChartView from './ChartView.vue'

const layers = ref(8)
const residual = ref(true)
const norm = ref(true)

const SUB = 0.5 // 서브층(어텐션/FFN)이 신호를 줄이는 정도(수축) — 예시

// 층을 지날 때마다의 신호 크기 계산
const magnitudes = computed(() => {
  const out: number[] = [1] // 시작 크기 1
  let m = 1
  for (let i = 0; i < layers.value; i++) {
    const sub = SUB * m // 서브층 출력 크기
    m = residual.value ? m + sub : sub // 잔차연결: 입력을 다시 더함
    if (norm.value) m = 1 // 층정규화: 크기를 일정하게 리셋
    out.push(m)
  }
  return out
})

const finalMag = computed(() => magnitudes.value[magnitudes.value.length - 1])

const verdict = computed(() => {
  if (norm.value) return { text: '안정적으로 유지 — 깊게 쌓을 수 있어요 👍', cls: 'bg-emerald-50 text-emerald-800' }
  if (residual.value) return { text: '값이 폭발합니다 💥 (너무 커짐)', cls: 'bg-rose-50 text-rose-700' }
  return { text: '신호가 점점 사라집니다 🫥 (약해져 학습 불가)', cls: 'bg-amber-50 text-amber-800' }
})

const chartData = computed(() => ({
  labels: magnitudes.value.map((_, i) => `${i}층`),
  datasets: [
    {
      label: '신호 크기',
      data: magnitudes.value.map((m) => Math.min(m, 100)),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      pointRadius: 3,
      tension: 0.2,
      fill: true,
    },
  ],
}))
const chartOptions = { scales: { y: { beginAtZero: true } } }
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- 컨트롤 -->
    <div class="mb-3 flex flex-wrap items-center gap-4">
      <label class="flex items-center gap-2 text-sm">
        <span class="font-medium text-slate-600">쌓는 층 수</span>
        <input type="range" min="1" max="16" step="1" v-model.number="layers" class="h-2 w-32 cursor-pointer accent-indigo-500" />
        <span class="w-6 font-mono text-sm tabular-nums">{{ layers }}</span>
      </label>
      <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" v-model="residual" class="h-4 w-4 accent-indigo-500" />
        잔차연결
      </label>
      <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" v-model="norm" class="h-4 w-4 accent-indigo-500" />
        층정규화
      </label>
    </div>

    <ChartView type="line" :data="chartData" :options="chartOptions" :height="220" />

    <div class="mt-3 rounded-lg px-4 py-3 text-sm" :class="verdict.cls">
      {{ layers }}개 층을 지난 뒤 신호 크기 =
      <b class="font-mono">{{ finalMag > 99 ? '100+' : finalMag.toFixed(2) }}</b> · {{ verdict.text }}
    </div>
    <p class="mt-2 text-xs text-slate-400">
      💡 잔차연결만 켜면 폭발, 둘 다 끄면 소멸, <b>층정규화까지 켜면 안정</b> — 그래서 딥한 트랜스포머가 학습됩니다.
    </p>
  </div>
</template>
