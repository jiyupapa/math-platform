<script setup lang="ts">
// 인터랙티브 단위원 (ch2) — 각도 θ 를 돌리면 단위원 위 점의 x좌표 = cos θ 임을 보여준다.
// cos 가 왜 −1~1 인지(원의 x좌표라서)를 눈으로 확인.
import { ref, computed } from 'vue'

const angle = ref(50) // 0~360°

const VS = 260
const c = VS / 2
const R = 95

const rad = computed(() => (angle.value * Math.PI) / 180)
const cosv = computed(() => Math.cos(rad.value))
const sinv = computed(() => Math.sin(rad.value))
const Px = computed(() => c + R * cosv.value)
const Py = computed(() => c - R * sinv.value)
const cosLabel = computed(() => +cosv.value.toFixed(2))

const tone = computed(() =>
  cosLabel.value > 0.01 ? 'var(--c-emerald-500)' : cosLabel.value < -0.01 ? 'var(--c-rose-500)' : 'var(--c-slate-500)',
)

// 각도 호(arc) — 0에서 θ까지 작은 반지름으로 샘플
const arcPath = computed(() => {
  const ar = 26
  let d = ''
  const step = angle.value >= 0 ? 4 : -4
  for (let a = 0; Math.abs(a) <= Math.abs(angle.value); a += step) {
    const r = (a * Math.PI) / 180
    const x = c + ar * Math.cos(r)
    const y = c - ar * Math.sin(r)
    d += (d === '' ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' '
  }
  return d
})

function preset(v: number) {
  angle.value = v
}
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-1 text-sm font-semibold text-slate-700">⭕ 단위원: 점의 x좌표가 곧 cos θ</p>
    <p class="mb-3 text-sm text-slate-500">
      반지름 1인 원에서 각도 θ만큼 돈 점의 <b>가로 위치(x좌표)가 cos θ</b>예요. 돌려보세요.
    </p>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <svg :width="VS" :height="VS" :viewBox="`0 0 ${VS} ${VS}`" class="mx-auto shrink-0 rounded-lg bg-slate-50">
        <!-- 축 -->
        <line x1="10" :y1="c" :x2="VS - 10" :y2="c" stroke="var(--c-slate-300)" stroke-width="1" />
        <line :x1="c" y1="10" :x2="c" :y2="VS - 10" stroke="var(--c-slate-300)" stroke-width="1" />
        <!-- 단위원 -->
        <circle :cx="c" :cy="c" :r="R" fill="none" stroke="var(--c-slate-400)" stroke-width="1.5" />
        <!-- 각도 호 -->
        <path :d="arcPath" fill="none" stroke="var(--c-amber-500)" stroke-width="2" />
        <!-- sin (세로 보조선, 옅게) -->
        <line :x1="Px" :y1="c" :x2="Px" :y2="Py" stroke="var(--c-slate-300)" stroke-width="2" stroke-dasharray="4 3" />
        <!-- cos (가로 굵은 선, 강조) -->
        <line :x1="c" :y1="c" :x2="Px" :y2="c" :stroke="tone" stroke-width="4" />
        <!-- 반지름 -->
        <line :x1="c" :y1="c" :x2="Px" :y2="Py" stroke="var(--c-indigo-500)" stroke-width="2.5" />
        <!-- 점 -->
        <circle :cx="Px" :cy="Py" r="6" fill="var(--c-indigo-500)" />
        <circle :cx="c" :cy="c" r="2.5" fill="var(--c-slate-700)" />
        <!-- 라벨 -->
        <text :x="Px" :y="Py - 10" text-anchor="middle" class="fill-indigo-600 text-xs">점</text>
        <text :x="(c + Px) / 2" :y="c - 6" text-anchor="middle" :fill="tone" class="text-xs">cos θ</text>
        <!-- x축 눈금 -1, 1 -->
        <text :x="c - R" :y="c + 14" text-anchor="middle" class="fill-slate-400 text-xs">-1</text>
        <text :x="c + R" :y="c + 14" text-anchor="middle" class="fill-slate-400 text-xs">1</text>
      </svg>

      <div class="flex-1">
        <label class="text-sm">
          <span class="mb-1 block">각도 θ = <b class="text-slate-700">{{ angle }}°</b></span>
          <input v-model.number="angle" type="range" min="0" max="360" step="5" class="w-full" />
        </label>

        <div class="my-3 flex flex-wrap items-center gap-2 text-sm">
          <span class="rounded px-2 py-1 font-mono" :style="{ backgroundColor: tone + '22', color: tone }">
            cos {{ angle }}° = {{ cosLabel }}
          </span>
          <span class="text-slate-500">= 점의 x좌표</span>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="v in [0, 90, 180, 270]"
            :key="v"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100"
            @click="preset(v)"
          >
            {{ v }}°
          </button>
        </div>

        <p class="mt-3 text-xs text-slate-500">
          x좌표는 원 안에서 −1~1 사이라, <b>cos 도 항상 −1~1</b>이에요.
        </p>
      </div>
    </div>
  </div>
</template>
