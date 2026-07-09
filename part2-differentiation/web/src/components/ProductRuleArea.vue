<script setup lang="ts">
// Phase 5 전용 인터랙티브 — 곱의 법칙을 '직사각형 넓이'로 이해한다.
// 두 변 u(x), v(x) 인 직사각형의 넓이 = u·v. x 를 Δ 만큼 늘리면 넓이가 늘어나는데,
// 그 증가분이 [오른쪽 띠 Δu·v] + [위 띠 u·Δv] + [작은 모서리 Δu·Δv] 로 쪼개진다.
// Δ 를 줄이면 모서리는 사라지고 → (u·v)' = u'·v + u·v' (곱의 법칙)이 남는다.
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    uf: (x: number) => number
    vf: (x: number) => number
    duf: (x: number) => number
    dvf: (x: number) => number
    xmin?: number
    xmax?: number
    initialX?: number
    initialDx?: number
    labelU?: string
    labelV?: string
    size?: number
  }>(),
  {
    xmin: 0.3,
    xmax: 2.2,
    initialX: 1,
    initialDx: 0.5,
    labelU: 'u',
    labelV: 'v',
    size: 320,
  },
)

const x0 = ref(props.initialX)
const dx = ref(props.initialDx)

const u = computed(() => props.uf(x0.value))
const v = computed(() => props.vf(x0.value))
const u2 = computed(() => props.uf(x0.value + dx.value))
const v2 = computed(() => props.vf(x0.value + dx.value))
const du = computed(() => u2.value - u.value)
const dv = computed(() => v2.value - v.value)

// 고정 스케일 (슬라이드해도 프레임 안에서 자라도록)
const pad = 36
const maxSide = computed(() => Math.max(props.uf(props.xmax), props.vf(props.xmax)) * 1.2)
const scale = computed(() => (props.size - pad * 2) / maxSide.value)
const ox = pad
const oy = computed(() => props.size - pad) // 좌하단 원점

function px(val: number) {
  return val * scale.value
}

const fmt = (n: number) => Number(n.toFixed(2)).toString()

// 넓이 조각
const areaBase = computed(() => u.value * v.value)
const stripRight = computed(() => du.value * v.value) // Δu·v
const stripTop = computed(() => u.value * dv.value) // u·Δv
const corner = computed(() => du.value * dv.value) // Δu·Δv

// 변화율 근사 vs 곱의 법칙 정확값
const approxRate = computed(() => (stripRight.value + stripTop.value + corner.value) / dx.value)
const exactRate = computed(() => props.duf(x0.value) * v.value + u.value * props.dvf(x0.value))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <div class="flex justify-center">
      <svg :viewBox="`0 0 ${size} ${size}`" :width="size" :height="size"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50">
        <!-- 위 띠 u·Δv (amber) -->
        <rect :x="ox" :y="oy - px(v2)" :width="px(u)" :height="px(dv)" fill="#fcd34d" opacity="0.85" />
        <!-- 오른쪽 띠 Δu·v (green) -->
        <rect :x="ox + px(u)" :y="oy - px(v)" :width="px(du)" :height="px(v)" fill="#6ee7b7" opacity="0.9" />
        <!-- 모서리 Δu·Δv (red) -->
        <rect :x="ox + px(u)" :y="oy - px(v2)" :width="px(du)" :height="px(dv)" fill="#fca5a5" />
        <!-- 기본 넓이 u·v (blue) -->
        <rect :x="ox" :y="oy - px(v)" :width="px(u)" :height="px(v)" fill="#a5b4fc" opacity="0.9" />

        <!-- 테두리 -->
        <rect :x="ox" :y="oy - px(v2)" :width="px(u2)" :height="px(v2)" fill="none" stroke="#64748b" stroke-width="1.5" />

        <!-- 축 라벨 -->
        <text :x="ox + px(u) / 2" :y="oy + 16" text-anchor="middle" font-size="12" fill="#4f46e5">{{ labelU }} = {{ fmt(u) }}</text>
        <text :x="ox - 8" :y="oy - px(v) / 2" text-anchor="end" font-size="12" fill="#4f46e5">{{ labelV }} = {{ fmt(v) }}</text>
      </svg>
    </div>

    <!-- 슬라이더 -->
    <div class="mt-4 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-24 shrink-0 text-slate-500">위치 x =
          <b class="text-slate-800">{{ fmt(x0) }}</b></span>
        <input v-model.number="x0" type="range" :min="xmin" :max="xmax" step="0.05" class="flex-1 accent-indigo-500" />
      </label>
      <label class="mt-2 flex items-center gap-3 text-sm">
        <span class="w-24 shrink-0 text-slate-500">증가분 Δ =
          <b class="text-slate-800">{{ fmt(dx) }}</b></span>
        <input v-model.number="dx" type="range" min="0.05" max="0.8" step="0.05" class="flex-1 accent-rose-500" />
      </label>
    </div>

    <!-- 넓이 조각 읽기 -->
    <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
      <span class="rounded-lg bg-indigo-50 px-3 py-1.5 text-indigo-700">🟦 기본 넓이 u·v = <b>{{ fmt(areaBase) }}</b></span>
      <span class="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700">🟩 오른쪽 띠 Δu·v = <b>{{ fmt(stripRight) }}</b></span>
      <span class="rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700">🟨 위 띠 u·Δv = <b>{{ fmt(stripTop) }}</b></span>
      <span class="rounded-lg bg-rose-50 px-3 py-1.5 text-rose-700">🟥 모서리 Δu·Δv = <b>{{ fmt(corner) }}</b></span>
    </div>
    <div class="mt-2 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">넓이 변화 ÷ Δ ≈ <b>{{ fmt(approxRate) }}</b></span>
      <span class="rounded-lg bg-slate-800 px-3 py-1.5 text-white">곱의 법칙 u'v + uv' = <b>{{ fmt(exactRate) }}</b></span>
    </div>
    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      증가분 <b class="text-rose-600">Δ</b> 를 줄여보세요. <b class="text-rose-500">빨간 모서리</b>(Δu·Δv)가
      급격히 작아져 무시할 수 있게 되고, 남는 두 띠 <b>Δu·v + u·Δv</b> 가 넓이 변화의 전부가 됩니다.
      이걸 Δ 로 나누면 <b>u'v + u v'</b> — 곱의 법칙이에요.
    </p>
  </div>
</template>
