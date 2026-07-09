<script setup lang="ts">
// 인터랙티브 경사하강 실험실.
// 손실 곡선 f(w) = (w-2)^2 위에서 '공'(현재 가중치 w)이 기울기 반대 방향으로 한 걸음씩 내려간다.
// 학습률(step 크기)을 조절하며, 너무 크면 발산하는 것도 본다.
import { ref, computed, onUnmounted } from 'vue'

const W = 420
const H = 240
const wMin = -1
const wMax = 5
const fMax = 9 // f(-1)=9, f(5)=9

const f = (w: number) => (w - 2) * (w - 2) // 손실
const grad = (w: number) => 2 * (w - 2) // 기울기 f'(w)

const w = ref(4.5) // 시작 가중치
const lr = ref(0.1) // 학습률
const steps = ref(0)
const diverged = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const toX = (val: number) => ((val - wMin) / (wMax - wMin)) * W
const toY = (loss: number) => H - (Math.min(loss, fMax) / fMax) * (H - 20) - 8

// 곡선 경로
const curvePath = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= 60; i++) {
    const wv = wMin + ((wMax - wMin) * i) / 60
    pts.push(`${toX(wv).toFixed(1)},${toY(f(wv)).toFixed(1)}`)
  }
  return 'M' + pts.join(' L')
})

const ballX = computed(() => toX(w.value))
const ballY = computed(() => toY(f(w.value)))

function step() {
  if (diverged.value) return
  const g = grad(w.value)
  w.value = w.value - lr.value * g
  steps.value++
  if (Math.abs(w.value) > 8 || f(w.value) > fMax * 3) diverged.value = true
}

function auto() {
  if (timer) return
  let n = 0
  timer = setInterval(() => {
    step()
    n++
    if (n >= 20 || diverged.value || Math.abs(grad(w.value)) < 0.02) stop()
  }, 150)
}
function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
function reset() {
  stop()
  w.value = 4.5
  steps.value = 0
  diverged.value = false
}
onUnmounted(stop)

const lossNow = computed(() => f(w.value))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-500">
      손실 곡선 위의 공을 굴려 <b>가장 낮은 골짜기</b>(손실 최소)로 내려보내세요
    </p>
    <p class="mb-3 text-xs text-slate-400">
      가로 = 가중치 값, 세로 = 손실(틀린 정도). 공은 현재 가중치, <b class="text-amber-600">주황 선</b>은 그 자리의
      <b>기울기</b>(경사)예요. 공은 이 기울기의 <b>반대쪽(내리막)</b>으로 굴러갑니다.
    </p>

    <div class="flex justify-center">
      <svg :viewBox="`0 0 ${W} ${H}`" :width="W" :height="H" class="max-w-full rounded-xl border border-slate-100 bg-slate-50/40">
        <!-- 최소 지점 표시 -->
        <line :x1="toX(2)" :y1="0" :x2="toX(2)" :y2="H" stroke="#e2e8f0" stroke-dasharray="4 3" />
        <text :x="toX(2)" :y="14" text-anchor="middle" font-size="10" fill="#94a3b8">최소(골짜기)</text>
        <!-- 손실 곡선 -->
        <path :d="curvePath" fill="none" stroke="#c7d2fe" stroke-width="3" />
        <!-- 접선(기울기): 공 위치에서 곡선이 기울어진 방향 -->
        <line
          v-if="!diverged"
          :x1="toX(w - 0.8)" :y1="toY(f(w) - grad(w) * 0.8)"
          :x2="toX(w + 0.8)" :y2="toY(f(w) + grad(w) * 0.8)"
          stroke="#f59e0b" stroke-width="2.5"
        />
        <text v-if="!diverged" :x="ballX + 14" :y="ballY - 12" font-size="10" fill="#d97706">기울기(경사)</text>
        <!-- 공 -->
        <circle :cx="ballX" :cy="ballY" r="9" :fill="diverged ? '#f43f5e' : '#6366f1'" stroke="#fff" stroke-width="2.5" />
      </svg>
    </div>

    <!-- 상태 -->
    <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
      <span>가중치 <b class="font-mono">{{ w.toFixed(2) }}</b></span>
      <span>손실 <b class="font-mono" :class="lossNow < 0.1 ? 'text-emerald-600' : 'text-slate-700'">{{ lossNow.toFixed(2) }}</b></span>
      <span class="text-slate-400">걸음 {{ steps }}</span>
      <span v-if="diverged" class="font-medium text-rose-600">💥 발산! 학습률이 너무 큽니다</span>
      <span v-else-if="lossNow < 0.05" class="font-medium text-emerald-600">🎯 골짜기 도착!</span>
    </div>

    <!-- 학습률 -->
    <label class="mt-3 flex items-center gap-2 text-sm">
      <span class="font-medium text-slate-600">학습률(걸음 크기)</span>
      <input type="range" min="0.05" max="1.1" step="0.05" v-model.number="lr" class="h-2 w-40 cursor-pointer accent-indigo-500" />
      <span class="w-10 font-mono text-sm tabular-nums">{{ lr.toFixed(2) }}</span>
    </label>
    <p v-if="lr > 1" class="mt-1 text-xs text-rose-500">⚠️ 학습률 &gt; 1: 골짜기를 지나쳐 튕겨 나갑니다(발산). 줄여 보세요.</p>

    <!-- 버튼 -->
    <div class="mt-3 flex flex-wrap gap-2">
      <button type="button" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700" @click="step">한 걸음</button>
      <button type="button" class="rounded-lg bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200" @click="auto">자동으로 굴리기 ▶</button>
      <button type="button" class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200" @click="reset">↺ 처음부터</button>
    </div>
  </div>
</template>
