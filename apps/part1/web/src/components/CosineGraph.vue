<script setup lang="ts">
// 인터랙티브 코사인 그래프 (ch2) — 각도 θ 슬라이더를 움직이면
// (좌) 두 벡터 사이 각도, (우) 코사인 곡선 위 점이 함께 움직인다.
// "각도 → cos값 → 닮은 정도(내적 부호)" 를 한눈에.
import { ref, computed } from 'vue'

const angle = ref(60) // 0~180°

// --- 코사인 곡선 좌표계 ---
const W = 300
const H = 200
const padL = 32
const padR = 12
const padT = 12
const padB = 26
const plotW = W - padL - padR
const plotH = H - padT - padB
const midY = padT + plotH / 2

const xOf = (deg: number) => padL + (deg / 180) * plotW
const yOf = (cosv: number) => midY - cosv * (plotH / 2)

function buildCurve() {
  let d = ''
  for (let a = 0; a <= 180; a += 3) {
    const x = xOf(a)
    const y = yOf(Math.cos((a * Math.PI) / 180))
    d += (a === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' '
  }
  return d
}
const curvePath = buildCurve()

const rad = computed(() => (angle.value * Math.PI) / 180)
const cosVal = computed(() => +Math.cos(rad.value).toFixed(2))
const markX = computed(() => xOf(angle.value))
const markY = computed(() => yOf(Math.cos(rad.value)))

const tone = computed(() =>
  cosVal.value > 0.01
    ? { color: 'var(--c-emerald-500)', label: '같은 쪽 (닮음 · 내적 +)' }
    : cosVal.value < -0.01
      ? { color: 'var(--c-rose-500)', label: '반대 쪽 (내적 −)' }
      : { color: 'var(--c-slate-500)', label: '수직 (내적 0)' },
)

// --- 두 벡터 미니 그림 ---
const VS = 150
const vc = VS / 2
const vr = 55
// a 는 오른쪽으로 고정, b 는 θ 만큼 회전
const bx = computed(() => vc + vr * Math.cos(rad.value))
const by = computed(() => vc - vr * Math.sin(rad.value))
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-1 text-sm font-semibold text-slate-700">📐 코사인 그래프: 각도를 움직여 보세요</p>
    <p class="mb-3 text-sm text-slate-500">
      두 벡터 사이 각도 θ가 커질수록 cos θ 가 1 → 0 → −1 로 줄어요. 그게 곧 "닮은 정도".
    </p>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <!-- 두 벡터 -->
      <svg :width="VS" :height="VS" :viewBox="`0 0 ${VS} ${VS}`" class="mx-auto shrink-0 rounded-lg bg-slate-50">
        <defs>
          <marker id="cg-a" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--c-indigo-500)" />
          </marker>
          <marker id="cg-b" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--c-pink-500)" />
          </marker>
        </defs>
        <!-- a: 오른쪽 고정 -->
        <line :x1="vc" :y1="vc" :x2="vc + vr" :y2="vc" stroke="var(--c-indigo-500)" stroke-width="3" marker-end="url(#cg-a)" />
        <!-- b: θ 회전 -->
        <line :x1="vc" :y1="vc" :x2="bx" :y2="by" stroke="var(--c-pink-500)" stroke-width="3" marker-end="url(#cg-b)" />
        <circle :cx="vc" :cy="vc" r="2.5" fill="var(--c-slate-700)" />
        <text :x="vc + vr + 2" :y="vc + 4" class="fill-indigo-500 text-xs">a</text>
        <text :x="bx" :y="by - 4" class="fill-pink-500 text-xs">b</text>
      </svg>

      <!-- 코사인 곡선 -->
      <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`" class="mx-auto flex-1 rounded-lg bg-slate-50">
        <!-- 기준선 -->
        <line :x1="padL" :y1="yOf(1)" :x2="W - padR" :y2="yOf(1)" stroke="var(--c-slate-200)" stroke-width="1" />
        <line :x1="padL" :y1="midY" :x2="W - padR" :y2="midY" stroke="var(--c-slate-300)" stroke-width="1" />
        <line :x1="padL" :y1="yOf(-1)" :x2="W - padR" :y2="yOf(-1)" stroke="var(--c-slate-200)" stroke-width="1" />
        <!-- y 라벨 -->
        <text :x="padL - 6" :y="yOf(1) + 4" text-anchor="end" class="fill-slate-400 text-xs">1</text>
        <text :x="padL - 6" :y="midY + 4" text-anchor="end" class="fill-slate-400 text-xs">0</text>
        <text :x="padL - 6" :y="yOf(-1) + 4" text-anchor="end" class="fill-slate-400 text-xs">-1</text>
        <!-- x 라벨 -->
        <text :x="xOf(0)" :y="H - 8" text-anchor="middle" class="fill-slate-400 text-xs">0°</text>
        <text :x="xOf(90)" :y="H - 8" text-anchor="middle" class="fill-slate-400 text-xs">90°</text>
        <text :x="xOf(180)" :y="H - 8" text-anchor="middle" class="fill-slate-400 text-xs">180°</text>
        <!-- 곡선 -->
        <path :d="curvePath" fill="none" stroke="var(--c-slate-400)" stroke-width="2" />
        <!-- 현재 점 보조선 -->
        <line :x1="markX" :y1="markY" :x2="markX" :y2="H - padB" :stroke="tone.color" stroke-width="1" stroke-dasharray="4 3" />
        <line :x1="padL" :y1="markY" :x2="markX" :y2="markY" :stroke="tone.color" stroke-width="1" stroke-dasharray="4 3" />
        <circle :cx="markX" :cy="markY" r="5" :fill="tone.color" />
      </svg>
    </div>

    <!-- 컨트롤 + 값 -->
    <div class="mt-3">
      <label class="text-sm">
        <span class="mb-1 block">각도 θ = <b class="text-slate-700">{{ angle }}°</b></span>
        <input v-model.number="angle" type="range" min="0" max="180" step="5" class="w-full" />
      </label>
      <div class="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <span class="rounded px-2 py-1 font-mono" :style="{ backgroundColor: tone.color + '22', color: tone.color }">
          cos {{ angle }}° = {{ cosVal }}
        </span>
        <span class="text-slate-600">→ {{ tone.label }}</span>
      </div>
    </div>

    <p class="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900">
      💡 cos θ 는 <b>방향이 얼마나 같은지</b>를 −1~1 로 알려줘요. 두 벡터가 <b>나란하면 1</b>(가장 닮음),
      <b>직각이면 0</b>, <b>반대면 −1</b>. 그래서 내적
      (<span class="font-mono">‖a‖‖b‖cos θ</span>)이 "닮은 정도"가 되는 거예요.
    </p>
  </div>
</template>
