<script setup lang="ts">
// Phase 9 전용 인터랙티브 — 경사하강 '공 굴리기'.
// 손실 곡선 f(w) 위의 공이 매 걸음 w ← w − η·f'(w) 로 골짜기(최소)로 내려간다.
// 학습률 η 를 바꾸면 수렴(작게)·한 방에 도착(0.5)·진동·발산(크게)을 눈으로 볼 수 있다.
import { ref, computed, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    f?: (w: number) => number
    df?: (w: number) => number
    wmin?: number
    wmax?: number
    ymin?: number
    ymax?: number
    start?: number
    size?: number
    height?: number
  }>(),
  {
    f: (w: number) => (w - 1) * (w - 1),
    df: (w: number) => 2 * (w - 1),
    wmin: -2.5,
    wmax: 4.5,
    ymin: -1,
    ymax: 13,
    start: 4,
    size: 400,
    height: 260,
  },
)

const w = ref(props.start)
const eta = ref(0.1)
const steps = ref(0)
const path = ref<number[]>([props.start])
const running = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const grad = computed(() => props.df(w.value))
const fw = computed(() => props.f(w.value))
const diverged = computed(() => !Number.isFinite(w.value) || Math.abs(w.value) > 40)
const converged = computed(() => Math.abs(grad.value) < 0.01)

// 좌표 변환
const sx = (x: number) => ((x - props.wmin) / (props.wmax - props.wmin)) * props.size
const sy = (v: number) => props.height - ((v - props.ymin) / (props.ymax - props.ymin)) * props.height

const curve = computed(() => {
  const pts: string[] = []
  const n = 160
  for (let i = 0; i <= n; i++) {
    const x = props.wmin + ((props.wmax - props.wmin) * i) / n
    pts.push(`${sx(x).toFixed(1)},${sy(props.f(x)).toFixed(1)}`)
  }
  return pts.join(' ')
})

function ticks() {
  const arr: number[] = []
  for (let t = Math.ceil(props.wmin); t <= Math.floor(props.wmax); t++) arr.push(t)
  return arr
}

function step() {
  if (diverged.value) {
    stop()
    return
  }
  w.value = w.value - eta.value * props.df(w.value)
  steps.value++
  path.value.push(w.value)
  if (converged.value || diverged.value || steps.value > 80) stop()
}

function start() {
  if (running.value) return
  running.value = true
  timer = setInterval(step, 350)
}
function stop() {
  running.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
function reset() {
  stop()
  w.value = props.start
  steps.value = 0
  path.value = [props.start]
}

onUnmounted(stop)

const fmt = (n: number) => (Number.isFinite(n) ? Number(n.toFixed(3)).toString() : '∞')
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <div class="flex justify-center">
      <svg :viewBox="`0 0 ${size} ${height}`" :width="size" :height="height"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50">
        <!-- 격자 -->
        <g stroke="var(--c-slate-200)" stroke-width="1">
          <line v-for="t in ticks()" :key="'g' + t" :x1="sx(t)" :y1="0" :x2="sx(t)" :y2="height" />
        </g>
        <line :x1="0" :y1="sy(0)" :x2="size" :y2="sy(0)" stroke="var(--c-slate-400)" stroke-width="1.2" />

        <!-- 손실 곡선 -->
        <polyline :points="curve" fill="none" stroke="var(--c-indigo-500)" stroke-width="2.5" />

        <!-- 지나온 자취 -->
        <g>
          <circle v-for="(pw, i) in path" :key="i" :cx="sx(pw)" :cy="sy(f(pw))" r="3"
            fill="var(--c-indigo-200)" :opacity="0.4 + 0.6 * (i / Math.max(1, path.length - 1))" />
        </g>

        <!-- 현재 공 -->
        <circle :cx="sx(w)" :cy="sy(fw)" r="8" fill="var(--c-red-500)" stroke="var(--c-white)" stroke-width="2" />
        <!-- 이동 방향 화살표 (−grad) -->
        <line v-if="!converged && !diverged"
          :x1="sx(w)" :y1="sy(fw) + 16" :x2="sx(w) - Math.sign(grad) * 22" :y2="sy(fw) + 16"
          stroke="var(--c-red-500)" stroke-width="2" marker-end="url(#gd-arrow)" />
        <defs>
          <marker id="gd-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--c-red-500)" />
          </marker>
        </defs>
      </svg>
    </div>

    <!-- 학습률 -->
    <div class="mt-3 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-28 shrink-0 text-slate-500">학습률 η =
          <b class="text-slate-800">{{ fmt(eta) }}</b></span>
        <input v-model.number="eta" type="range" min="0.05" max="1.1" step="0.05" class="flex-1 accent-indigo-500" />
      </label>
    </div>

    <!-- 버튼 -->
    <div class="mt-3 flex flex-wrap gap-2">
      <button type="button" class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
        :disabled="running || converged || diverged" @click="step">한 걸음</button>
      <button v-if="!running" type="button" class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40"
        :disabled="converged || diverged" @click="start">▶ 자동 재생</button>
      <button v-else type="button" class="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-medium text-rose-800 hover:bg-rose-200" @click="stop">■ 멈춤</button>
      <button type="button" class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200" @click="reset">↺ 리셋</button>
    </div>

    <!-- 읽기 -->
    <div class="mt-3 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">걸음 = <b>{{ steps }}</b></span>
      <span class="rounded-lg bg-indigo-50 px-3 py-1.5 text-indigo-700">w = <b>{{ fmt(w) }}</b></span>
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">손실 f(w) = <b>{{ fmt(fw) }}</b></span>
      <span class="rounded-lg bg-rose-50 px-3 py-1.5 text-rose-700">기울기 f′(w) = <b>{{ fmt(grad) }}</b></span>
    </div>
    <p v-if="converged" class="mt-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
      ✅ 골짜기 바닥에 거의 도착! 기울기가 0 에 가까워 더 움직이지 않습니다.
    </p>
    <p v-else-if="diverged" class="mt-2 rounded-lg bg-rose-50 px-3 py-1.5 text-sm text-rose-700">
      ⚠️ 발산! 학습률 η 가 너무 커서 최소값을 지나쳐 튕겨 나갔어요. η 를 줄여보세요.
    </p>
    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      매 걸음: <b>w ← w − η·f′(w)</b>. 기울기의 <b>반대 방향</b>으로 η 만큼 이동해요.
      η 를 <b>작게</b> 하면 느리지만 안정적, <b>0.5</b> 면 한 방에, <b>크게(1 이상)</b> 하면 진동하거나 발산합니다.
    </p>
  </div>
</template>
