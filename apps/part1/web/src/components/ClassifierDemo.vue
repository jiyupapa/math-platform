<script setup lang="ts">
// 체험 AI 데모 (ch5) — 회전(선형변환) 슬라이더로 데이터를 돌려서
// 세로 직선 하나로 두 그룹이 깔끔히 나뉘게 만든다. = 신경망 층이 하는 일.
import { ref, computed } from 'vue'

const angleDeg = ref(0)

interface Pt {
  x: number
  y: number
  cls: 'A' | 'B'
}
// 두 그룹은 대각선(x+y) 방향으로 나뉘어 있다 → 세로선(x) 하나로는 0°에서 잘 안 나뉜다.
const points: Pt[] = [
  { x: 2, y: 1, cls: 'A' },
  { x: -1, y: 3, cls: 'A' },
  { x: 1, y: 2, cls: 'A' },
  { x: 3, y: 0, cls: 'A' },
  { x: 0, y: 2, cls: 'A' },
  { x: -2, y: 4, cls: 'A' },
  { x: 2, y: 2, cls: 'A' },
  { x: 1, y: 3, cls: 'A' },
  { x: -2, y: -1, cls: 'B' },
  { x: 1, y: -3, cls: 'B' },
  { x: -1, y: -2, cls: 'B' },
  { x: -3, y: 0, cls: 'B' },
  { x: 0, y: -2, cls: 'B' },
  { x: 2, y: -4, cls: 'B' },
  { x: -2, y: -2, cls: 'B' },
  { x: -1, y: -3, cls: 'B' },
]

const size = 300
const range = 6
const scale = size / (2 * range)
const rad = computed(() => (angleDeg.value * Math.PI) / 180)

function toScreen(x: number, y: number) {
  return { X: size / 2 + x * scale, Y: size / 2 - y * scale }
}

const plotted = computed(() => {
  const c = Math.cos(rad.value)
  const s = Math.sin(rad.value)
  return points.map((p) => {
    const nx = c * p.x - s * p.y // 회전된 x좌표
    const ny = s * p.x + c * p.y
    const scr = toScreen(nx, ny)
    const pred = nx > 0 ? 'A' : 'B' // 세로선(x=0) 기준 분류
    return { ...p, X: scr.X, Y: scr.Y, correct: pred === p.cls }
  })
})

const accuracy = computed(() =>
  Math.round((plotted.value.filter((p) => p.correct).length / points.length) * 100),
)
const r2 = (n: number) => +n.toFixed(2)
const matrix = computed(() => {
  const c = r2(Math.cos(rad.value))
  const s = r2(Math.sin(rad.value))
  return { c, s, ns: r2(-Math.sin(rad.value)) }
})

const lineX = size / 2 // 세로 결정선 (x=0)
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-1 text-sm font-semibold text-slate-700">🤖 미니 분류 AI: 데이터를 돌려 두 그룹을 나눠 보세요</p>
    <p class="mb-3 text-sm text-slate-500">
      세로 점선이 "분류 기준선"이에요(오른쪽=🔵A, 왼쪽=🟠B). 처음엔 섞여서 틀려요.
      <b>회전 슬라이더</b>로 데이터를 돌려 두 색이 좌우로 갈리게 만들어 보세요.
    </p>

    <div class="flex flex-col gap-4 lg:flex-row">
      <svg
        :width="size"
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
        class="mx-auto shrink-0 rounded-lg bg-slate-50"
      >
        <!-- 결정선 (세로) -->
        <line :x1="lineX" y1="0" :x2="lineX" :y2="size" stroke="var(--c-slate-400)" stroke-width="1.5" stroke-dasharray="5 4" />
        <!-- 축 -->
        <line x1="0" :y1="size / 2" :x2="size" :y2="size / 2" stroke="var(--c-slate-200)" stroke-width="1" />
        <!-- 점들 -->
        <g v-for="(p, i) in plotted" :key="i">
          <circle
            :cx="p.X"
            :cy="p.Y"
            r="7"
            :fill="p.cls === 'A' ? 'var(--c-indigo-500)' : 'var(--c-amber-500)'"
            :opacity="p.correct ? 1 : 0.35"
          />
          <circle
            v-if="!p.correct"
            :cx="p.X"
            :cy="p.Y"
            r="10"
            fill="none"
            stroke="var(--c-red-500)"
            stroke-width="2"
          />
        </g>
      </svg>

      <div class="flex-1">
        <label class="text-sm">
          <span class="mb-1 block">🔄 회전 각도: <b class="text-indigo-600">{{ angleDeg }}°</b></span>
          <input v-model.number="angleDeg" type="range" min="-90" max="90" step="5" class="w-full" />
        </label>

        <div class="my-3">
          <span
            class="inline-block rounded-lg px-3 py-1.5 text-sm font-bold"
            :class="accuracy === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
          >
            정확도: {{ accuracy }}%
            <span v-if="accuracy === 100"> · 분류 성공</span>
          </span>
        </div>

        <p class="text-sm text-slate-500">
          이 회전은 사실 <b>회전 행렬</b> 하나예요:
        </p>
        <p class="mt-1 font-mono text-sm text-slate-700">
          [[{{ matrix.c }}, {{ matrix.ns }}], [{{ matrix.s }}, {{ matrix.c }}]]
        </p>
        <p class="mt-1 text-xs text-slate-500">힌트: −45° 근처에서 딱 나뉘어요.</p>
      </div>
    </div>

    <!-- 정체 폭로 -->
    <div class="mt-4 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900">
      💡 <b>방금 한 게 선형변환이에요.</b> 뒤섞여 안 나뉘던 데이터도 <b>회전(행렬 곱)</b> 한 번으로
      직선 하나에 딱 나뉘었죠. <b>신경망의 한 층(Wx)</b> 이 바로 이렇게 데이터를 "잘 나뉘는 모양"으로
      바꿔서 분류를 쉽게 만듭니다.
    </div>
  </div>
</template>
