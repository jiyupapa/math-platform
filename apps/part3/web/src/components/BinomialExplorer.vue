<script setup lang="ts">
// Phase 5 전용 인터랙티브 — 이항분포 탐험기.
// n(시행 횟수)과 p(성공 확률)를 슬라이더로 바꾸면 P(X=k) 막대 분포가 실시간으로 변한다.
// n 을 키우면 종 모양(정규분포)에 가까워지는 것을 눈으로 확인할 수 있다 (6장 예고편).
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    initialN?: number
    initialP?: number
    size?: number
    height?: number
  }>(),
  { initialN: 10, initialP: 0.5, size: 440, height: 230 },
)

const n = ref(props.initialN)
const p = ref(props.initialP)

// P(X=k) 를 점화식으로 계산 — 팩토리얼 없이 안전하게.
// P(0) = (1-p)^n,  P(k+1) = P(k) · (n-k)/(k+1) · p/(1-p)
const pmf = computed(() => {
  const out: number[] = []
  let cur = Math.pow(1 - p.value, n.value)
  out.push(cur)
  for (let k = 0; k < n.value; k++) {
    cur = (cur * (n.value - k) * p.value) / ((k + 1) * (1 - p.value))
    out.push(cur)
  }
  return out
})

const mean = computed(() => n.value * p.value)
const variance = computed(() => n.value * p.value * (1 - p.value))
const mode = computed(() => pmf.value.indexOf(Math.max(...pmf.value)))
const maxP = computed(() => Math.max(...pmf.value))

// 좌표 변환
const pad = 16
const baseY = computed(() => props.height - 26)
const barW = computed(() => (props.size - pad * 2) / (n.value + 1))
const barX = (k: number) => pad + k * barW.value
const barH = (v: number) => (maxP.value === 0 ? 0 : (v / maxP.value) * (props.height - 48))
const meanX = computed(() => pad + (mean.value + 0.5) * barW.value)

// x축 눈금 (0, 최빈값, n — 중복 제거)
const ticks = computed(() => [...new Set([0, mode.value, n.value])].sort((a, b) => a - b))

const fmt = (v: number) => Number(v.toFixed(2)).toString()
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <div class="flex justify-center">
      <svg
        :viewBox="`0 0 ${size} ${height}`"
        :width="size"
        :height="height"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50"
      >
        <!-- 확률 막대 -->
        <g>
          <rect
            v-for="(v, k) in pmf"
            :key="k"
            :x="barX(k) + 1"
            :y="baseY - barH(v)"
            :width="Math.max(barW - 2, 1.5)"
            :height="barH(v)"
            rx="2"
            fill="#6366f1"
            opacity="0.85"
          />
        </g>
        <!-- 기댓값 E[X] = np 점선 -->
        <line
          :x1="meanX"
          :y1="10"
          :x2="meanX"
          :y2="baseY"
          stroke="#ef4444"
          stroke-width="1.5"
          stroke-dasharray="4 3"
        />
        <text :x="Math.min(meanX + 5, size - 84)" y="18" font-size="10" fill="#ef4444">
          E[X] = {{ fmt(mean) }}
        </text>
        <!-- x축 -->
        <line :x1="0" :y1="baseY" :x2="size" :y2="baseY" stroke="#94a3b8" stroke-width="1" />
        <g v-for="k in ticks" :key="'t' + k">
          <text
            :x="barX(k) + barW / 2"
            :y="height - 10"
            font-size="9"
            text-anchor="middle"
            fill="#64748b"
          >
            {{ k }}
          </text>
        </g>
      </svg>
    </div>

    <!-- 슬라이더 -->
    <div class="mt-3 space-y-2 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-36 shrink-0 text-slate-500">
          시행 횟수 n = <b class="text-slate-800">{{ n }}</b>
        </span>
        <input v-model.number="n" type="range" min="1" max="50" step="1" class="flex-1 accent-indigo-500" />
      </label>
      <label class="flex items-center gap-3 text-sm">
        <span class="w-36 shrink-0 text-slate-500">
          성공 확률 p = <b class="text-slate-800">{{ fmt(p) }}</b>
        </span>
        <input v-model.number="p" type="range" min="0.05" max="0.95" step="0.05" class="flex-1 accent-indigo-500" />
      </label>
    </div>

    <!-- 읽기 -->
    <div class="mt-3 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-indigo-50 px-3 py-1.5 text-indigo-700">기댓값 E[X] = np = <b>{{ fmt(mean) }}</b></span>
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">분산 np(1−p) = <b>{{ fmt(variance) }}</b></span>
      <span class="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700">가장 잘 나오는 횟수 k = <b>{{ mode }}</b></span>
    </div>

    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      막대 하나 = "성공이 정확히 k 번일 확률". <b>n 을 크게</b> 밀어보세요 — 막대들이 점점
      좌우대칭 <b>종 모양</b>으로 정돈됩니다(다음 챕터의 정규분포!). p 를 움직이면 산이 좌우로 이동해요.
    </p>
  </div>
</template>
