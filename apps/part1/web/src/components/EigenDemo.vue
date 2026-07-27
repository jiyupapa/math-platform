<script setup lang="ts">
// 고유벡터 시각화 (ch7) — 입력 벡터 v 를 돌리면서 변환된 Av 를 같이 그린다.
// v 와 Av 가 '같은 직선'에 놓이는 방향 = 고유벡터, 그때의 배율 = 고유값 λ.
import { ref, computed } from 'vue'

const angle = ref(20) // 입력 벡터 방향(도)
const a = ref(2)
const b = ref(1)
const c = ref(1)
const d = ref(2)

const VS = 300
const cc = VS / 2
const range = 3.5
const scale = VS / (2 * range)

function toScreen(x: number, y: number) {
  return { X: cc + x * scale, Y: cc - y * scale }
}

const rad = computed(() => (angle.value * Math.PI) / 180)
const v = computed(() => ({ x: Math.cos(rad.value), y: Math.sin(rad.value) }))
const Av = computed(() => ({
  x: a.value * v.value.x + b.value * v.value.y,
  y: c.value * v.value.x + d.value * v.value.y,
}))

const cross = computed(() => v.value.x * Av.value.y - v.value.y * Av.value.x)
const dotvAv = computed(() => v.value.x * Av.value.x + v.value.y * Av.value.y)
const magAv = computed(() => Math.hypot(Av.value.x, Av.value.y))
const aligned = computed(() => magAv.value > 1e-9 && Math.abs(cross.value) / magAv.value < 0.06)
const lambda = computed(() => +dotvAv.value.toFixed(2)) // |v|=1 이라 v·Av = λ
const between = computed(() => {
  const deg = (Math.atan2(Math.abs(cross.value), dotvAv.value) * 180) / Math.PI
  return +deg.toFixed(0)
})

const oS = toScreen(0, 0)
const vS = computed(() => toScreen(v.value.x, v.value.y))
const avS = computed(() => toScreen(Av.value.x, Av.value.y))

function preset(na: number, nb: number, nc: number, nd: number) {
  a.value = na
  b.value = nb
  c.value = nc
  d.value = nd
}
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-3 text-sm text-slate-600">
      파란 화살표 <b>v</b> 를 돌리면 변환된 <b style="color: var(--c-amber-700)">Av</b> 가 따라 움직여요.
      둘이 <b>같은 직선에 놓이는 방향</b>이 바로 <b>고유벡터</b>입니다. 찾아보세요.
    </p>

    <div class="flex flex-col gap-4 lg:flex-row">
      <svg :width="VS" :height="VS" :viewBox="`0 0 ${VS} ${VS}`" class="mx-auto shrink-0 rounded-lg bg-slate-50">
        <defs>
          <marker id="eig-v" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" :fill="aligned ? 'var(--c-emerald-500)' : 'var(--c-indigo-500)'" />
          </marker>
          <marker id="eig-av" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" :fill="aligned ? 'var(--c-emerald-500)' : 'var(--c-amber-500)'" />
          </marker>
        </defs>
        <line x1="0" :y1="cc" :x2="VS" :y2="cc" stroke="var(--c-slate-200)" stroke-width="1" />
        <line :x1="cc" y1="0" :x2="cc" :y2="VS" stroke="var(--c-slate-200)" stroke-width="1" />
        <!-- 고유벡터일 때 직선 강조 -->
        <line
          v-if="aligned"
          :x1="cc - v.x * 200"
          :y1="cc + v.y * 200"
          :x2="cc + v.x * 200"
          :y2="cc - v.y * 200"
          stroke="var(--c-emerald-500)"
          stroke-width="1"
          stroke-dasharray="5 4"
        />
        <!-- Av -->
        <line :x1="oS.X" :y1="oS.Y" :x2="avS.X" :y2="avS.Y" :stroke="aligned ? 'var(--c-emerald-500)' : 'var(--c-amber-500)'" stroke-width="3" marker-end="url(#eig-av)" />
        <!-- v -->
        <line :x1="oS.X" :y1="oS.Y" :x2="vS.X" :y2="vS.Y" :stroke="aligned ? 'var(--c-emerald-500)' : 'var(--c-indigo-500)'" stroke-width="3" marker-end="url(#eig-v)" />
        <circle :cx="oS.X" :cy="oS.Y" r="3" fill="var(--c-slate-700)" />
      </svg>

      <div class="flex-1">
        <label class="text-sm">
          <span class="mb-1 block">v 방향 = <b>{{ angle }}°</b></span>
          <input v-model.number="angle" type="range" min="0" max="360" step="1" class="w-full" />
        </label>

        <p class="mt-2 font-mono text-sm text-slate-700">행렬 A = [[{{ a }}, {{ b }}], [{{ c }}, {{ d }}]]</p>

        <div class="my-3">
          <span
            class="inline-block rounded-lg px-3 py-1.5 text-sm font-medium"
            :class="aligned ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
          >
            <template v-if="aligned">✓ 고유벡터! 고유값 λ ≈ {{ lambda }}</template>
            <template v-else>v와 Av 사이 각도 ≈ {{ between }}° (0°/180°에 맞춰보세요)</template>
          </span>
        </div>

        <div class="flex flex-wrap gap-2">
          <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100" @click="preset(2, 1, 1, 2)">대칭 (λ=3, 1)</button>
          <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100" @click="preset(2, 0, 0, 3)">대각 (λ=2, 3)</button>
          <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100" @click="preset(1, 1, 0, 1)">전단 (λ=1 하나뿐)</button>
        </div>
        <p class="mt-2 text-xs text-slate-500">
          힌트: 대칭 행렬은 45°·135° 근처, 대각 행렬은 0°·90° 근처에서 찾을 수 있어요.
        </p>
      </div>
    </div>
  </div>
</template>
