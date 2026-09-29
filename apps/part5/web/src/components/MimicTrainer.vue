<script setup lang="ts">
// 흉내내기 훈련소 — "학습 = KL 최소화"를 진짜 경사하강으로 보여준다.
// 모델 분포 q = softmax(z) 이고, 크로스 엔트로피 손실의 로짓 z 에 대한 기울기가
// 정확히 (q − p) 라서, 한 걸음 = z ← z + lr·(p − q). 누를 때마다 q 가 p 를 닮아가고
// 손실 곡선이 바닥 H(p) 를 향해 내려간다 (0이 아니라 바닥에서 멈추는 게 포인트).
import { ref, computed, onUnmounted } from 'vue'

const TOKENS = ['밥', '빵', '국수', '커피']
// 세상(데이터)의 다음 단어 분포 — "나는 아침에 ___ 을 먹었다"
const P = [0.5, 0.25, 0.125, 0.125]
const H_P = P.reduce((s, p) => s + p * Math.log2(1 / p), 0) // = 1.75 (바닥)

const LR = 0.7
const logits = ref<number[]>([0, 0, 0, 0])
const steps = ref(0)
const history = ref<number[]>([])

function softmax(z: number[]): number[] {
  const m = Math.max(...z)
  const e = z.map((v) => Math.exp(v - m))
  const t = e.reduce((s, v) => s + v, 0)
  return e.map((v) => v / t)
}
const q = computed(() => softmax(logits.value))
const loss = computed(() => P.reduce((s, p, i) => s + p * Math.log2(1 / q.value[i]), 0))
const excess = computed(() => loss.value - H_P) // = D(p‖q)
const converged = computed(() => excess.value < 0.001)

function step() {
  // 진짜 경사하강: ∂H(p, softmax(z))/∂z = q − p → z 를 반대 방향으로
  const cur = q.value
  logits.value = logits.value.map((z, i) => z + LR * (P[i] - cur[i]))
  steps.value++
  history.value.push(loss.value)
  if (history.value.length > 60) history.value.shift()
}

let timer: ReturnType<typeof setInterval> | null = null
const running = ref(false)
function toggleRun() {
  if (running.value) {
    if (timer) clearInterval(timer)
    timer = null
    running.value = false
  } else {
    running.value = true
    timer = setInterval(() => {
      step()
      if (converged.value && timer) {
        clearInterval(timer)
        timer = null
        running.value = false
      }
    }, 120)
  }
}
function reset() {
  if (timer) clearInterval(timer)
  timer = null
  running.value = false
  // 무작위 초기화 — 엉터리 지도에서 출발해야 배우는 맛이 난다
  logits.value = logits.value.map(() => (Math.random() - 0.5) * 5)
  steps.value = 0
  history.value = []
}
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// ── 분포 막대 (p 회색 vs q 보라, 표시 전용) ──────────
const W = 340
const HEIGHT = 170
const PAD_X = 14
const BASE_Y = 140
const PLOT_H = 115
const groupW = (W - 2 * PAD_X) / TOKENS.length

// ── 손실 곡선 (최근 60걸음) ──────────
const CW = 340
const CH = 120
const CPAD = 10
const LOSS_MAX = 4
function curvePath(): string {
  const h = history.value
  if (h.length < 2) return ''
  return h
    .map((v, i) => {
      const x = curveX(i, h.length)
      const y = CH - CPAD - (Math.min(v, LOSS_MAX) / LOSS_MAX) * (CH - 2 * CPAD)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}
function curveX(i: number, n: number): number {
  return CPAD + (i / Math.max(n - 1, 1)) * (CW - 2 * CPAD)
}
const floorY = CH - CPAD - (H_P / LOSS_MAX) * (CH - 2 * CPAD)
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-1 text-sm font-semibold text-slate-700">
      🏋️ 흉내내기 훈련소: "나는 아침에 ___" 다음 단어를 배우는 미니 모델
    </p>
    <p class="mb-3 text-xs text-slate-500">
      학습 버튼 = 진짜 경사하강 한 걸음 (로짓에 기울기 q−p 의 반대 방향을 더함)
    </p>

    <!-- 컨트롤 -->
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <button
        class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        :disabled="running"
        @click="step"
      >
        한 걸음 학습
      </button>
      <button
        class="rounded-lg px-3 py-1.5 text-sm font-medium"
        :class="running ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-emerald-600 text-white hover:bg-emerald-500'"
        @click="toggleRun"
      >
        {{ running ? '⏸ 멈추기' : '▶ 자동 학습' }}
      </button>
      <button
        class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
        @click="reset"
      >
        🎲 엉터리 모델로 리셋
      </button>
      <span class="ml-auto text-xs tabular-nums text-slate-500">걸음 수: {{ steps }}</span>
    </div>

    <!-- 분포 비교 -->
    <svg :viewBox="`0 0 ${W} ${HEIGHT}`" class="w-full max-w-lg select-none">
      <line :x1="PAD_X" :y1="BASE_Y" :x2="W - PAD_X" :y2="BASE_Y" stroke="var(--c-slate-300)" stroke-width="1.5" />
      <g v-for="(tok, i) in TOKENS" :key="tok">
        <rect
          :x="PAD_X + i * groupW + groupW * 0.12"
          :y="BASE_Y - P[i] * PLOT_H"
          :width="groupW * 0.36"
          :height="P[i] * PLOT_H"
          fill="var(--c-slate-300)"
          rx="4"
        />
        <rect
          :x="PAD_X + i * groupW + groupW * 0.52"
          :y="BASE_Y - q[i] * PLOT_H"
          :width="groupW * 0.36"
          :height="Math.max(q[i] * PLOT_H, 2)"
          :fill="converged ? 'var(--c-emerald-500)' : 'var(--c-indigo-500)'"
          rx="4"
          style="transition: y 0.1s, height 0.1s"
        />
        <text
          :x="PAD_X + i * groupW + groupW * 0.7"
          :y="BASE_Y - q[i] * PLOT_H - 5"
          text-anchor="middle"
          font-size="10"
          font-weight="bold"
          :fill="converged ? 'var(--c-emerald-600)' : 'var(--c-indigo-600)'"
        >
          {{ (q[i] * 100).toFixed(0) }}%
        </text>
        <text :x="PAD_X + i * groupW + groupW / 2" :y="BASE_Y + 15" text-anchor="middle" font-size="11" fill="var(--c-slate-500)">
          {{ tok }}
        </text>
      </g>
      <rect :x="W - 150" y="2" width="10" height="10" fill="var(--c-slate-300)" rx="2" />
      <text :x="W - 136" y="11" font-size="10" fill="var(--c-slate-400)">데이터 분포 p</text>
      <rect :x="W - 150" y="17" width="10" height="10" :fill="converged ? 'var(--c-emerald-500)' : 'var(--c-indigo-500)'" rx="2" />
      <text :x="W - 136" y="26" font-size="10" fill="var(--c-indigo-600)">모델 분포 q</text>
    </svg>

    <!-- 손실 판 -->
    <div class="mt-2 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-lg bg-indigo-50 p-2">
        <p class="text-lg font-bold tabular-nums text-indigo-700">{{ loss.toFixed(3) }}</p>
        <p class="text-xs text-indigo-600">훈련 손실 H(p,q)</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-lg font-bold tabular-nums text-slate-600">{{ H_P }}</p>
        <p class="text-xs text-slate-500">바닥 H(p): 세상의 엔트로피</p>
      </div>
      <div class="rounded-lg p-2" :class="converged ? 'bg-emerald-50' : 'bg-amber-50'">
        <p class="text-lg font-bold tabular-nums" :class="converged ? 'text-emerald-700' : 'text-amber-700'">
          {{ excess.toFixed(3) }}
        </p>
        <p class="text-xs" :class="converged ? 'text-emerald-700' : 'text-amber-700'">
          초과분 D(p‖q): 배움이 줄이는 것
        </p>
      </div>
    </div>

    <!-- 손실 곡선 -->
    <svg v-if="history.length >= 2" :viewBox="`0 0 ${CW} ${CH}`" class="mt-2 w-full max-w-lg">
      <line :x1="CPAD" :y1="floorY" :x2="CW - CPAD" :y2="floorY" stroke="var(--c-slate-400)" stroke-width="1" stroke-dasharray="4 3" />
      <text :x="CW - CPAD" :y="floorY - 4" text-anchor="end" font-size="9" fill="var(--c-slate-400)">
        바닥 H(p) = {{ H_P }}비트 (이 아래로는 못 간다)
      </text>
      <path :d="curvePath()" fill="none" stroke="var(--c-indigo-500)" stroke-width="2" />
    </svg>

    <p v-if="converged" class="mt-2 text-xs font-semibold text-emerald-700">
      🎉 학습 완료! 모델이 세상을 똑같이 믿게 됐고(q = p), 손실은 0이 아니라 바닥 H(p)에서 멈췄습니다.
      남은 1.75비트는 모델 탓이 아니라 세상 자체의 불확실성이에요.
    </p>
  </div>
</template>
