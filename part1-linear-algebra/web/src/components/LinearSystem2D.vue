<script setup lang="ts">
// 두 직선을 슬라이더로 움직이며 "교점 = 연립방정식의 해"를 보는 인터랙티브.
// 직선은 기울기-절편 형태 y = m x + k 로 다룬다(수포자에게 가장 직관적).
// 해의 종류: 교차(유일해) / 평행(해 없음) / 일치(무수히 많은 해).
import { ref, computed } from 'vue'

const size = 360
const R = 6
const scale = size / (R * 2)
const origin = size / 2
const toX = (x: number) => origin + x * scale
const toY = (y: number) => origin - y * scale

// 직선 1, 직선 2 (y = m x + k)
// 초기값 = 본문의 연립방정식 x + y = 3, x - y = 1 (해 (2, 1))
//   x + y = 3 → y = -x + 3 (m1=-1, k1=3)
//   x - y = 1 → y =  x - 1 (m2= 1, k2=-1)
const m1 = ref(-1)
const k1 = ref(3)
const m2 = ref(1)
const k2 = ref(-1)

const ticks = Array.from({ length: 2 * R + 1 }, (_, i) => i - R)

// 화면 안에서의 직선 양 끝점 (x = -R, x = R)
function endpoints(m: number, k: number) {
  return { x1: toX(-R), y1: toY(m * -R + k), x2: toX(R), y2: toY(m * R + k) }
}
const line1 = computed(() => endpoints(m1.value, k1.value))
const line2 = computed(() => endpoints(m2.value, k2.value))

const kind = computed<'unique' | 'none' | 'infinite'>(() => {
  if (m1.value !== m2.value) return 'unique'
  return k1.value === k2.value ? 'infinite' : 'none'
})

const solution = computed(() => {
  if (kind.value !== 'unique') return null
  const x = (k2.value - k1.value) / (m1.value - m2.value)
  const y = m1.value * x + k1.value
  return { x, y }
})

function preset(kind: 'unique' | 'none' | 'infinite') {
  if (kind === 'unique') {
    // 본문의 x + y = 3, x - y = 1 (해 (2, 1))
    m1.value = -1
    k1.value = 3
    m2.value = 1
    k2.value = -1
  } else if (kind === 'none') {
    m1.value = 1
    k1.value = 2
    m2.value = 1 // 같은 기울기, 다른 절편 → 평행
    k2.value = -2
  } else {
    m1.value = 1
    k1.value = 2
    m2.value = 1 // 같은 기울기, 같은 절편 → 일치
    k2.value = 2
  }
}

const kindLabel = computed(() => {
  if (kind.value === 'unique') return { text: '교차 → 유일한 해 1개', cls: 'text-emerald-700' }
  if (kind.value === 'none') return { text: '평행 → 해 없음', cls: 'text-rose-600' }
  return { text: '완전히 겹침 → 무수히 많은 해', cls: 'text-amber-600' }
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <div class="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
      <svg
        :viewBox="`0 0 ${size} ${size}`"
        :width="size"
        :height="size"
        class="max-w-full shrink-0 rounded-lg border border-slate-200"
      >
        <!-- 격자 -->
        <g stroke="#eef2f7" stroke-width="1">
          <line v-for="t in ticks" :key="'v' + t" :x1="toX(t)" y1="0" :x2="toX(t)" :y2="size" />
          <line v-for="t in ticks" :key="'h' + t" x1="0" :y1="toY(t)" :x2="size" :y2="toY(t)" />
        </g>
        <!-- 축 -->
        <g stroke="#94a3b8" stroke-width="1.5">
          <line x1="0" :y1="toY(0)" :x2="size" :y2="toY(0)" />
          <line :x1="toX(0)" y1="0" :x2="toX(0)" :y2="size" />
        </g>
        <!-- 직선 1 -->
        <line :x1="line1.x1" :y1="line1.y1" :x2="line1.x2" :y2="line1.y2" stroke="#6366f1" stroke-width="3" />
        <!-- 직선 2 -->
        <line :x1="line2.x1" :y1="line2.y1" :x2="line2.x2" :y2="line2.y2" stroke="#ec4899" stroke-width="3" />
        <!-- 교점 -->
        <circle
          v-if="solution"
          :cx="toX(solution.x)"
          :cy="toY(solution.y)"
          r="7"
          fill="#10b981"
          stroke="#fff"
          stroke-width="2.5"
        />
      </svg>

      <div class="w-full space-y-3 text-sm">
        <div>
          <div class="mb-1 font-semibold text-indigo-600">직선 1: y = {{ m1 }}x + {{ k1 }}</div>
          <label class="flex items-center gap-2">기울기 <input v-model.number="m1" type="range" min="-3" max="3" step="0.5" class="flex-1" /></label>
          <label class="flex items-center gap-2">절편 <input v-model.number="k1" type="range" min="-4" max="4" step="1" class="flex-1" /></label>
        </div>
        <div>
          <div class="mb-1 font-semibold text-pink-600">직선 2: y = {{ m2 }}x + {{ k2 }}</div>
          <label class="flex items-center gap-2">기울기 <input v-model.number="m2" type="range" min="-3" max="3" step="0.5" class="flex-1" /></label>
          <label class="flex items-center gap-2">절편 <input v-model.number="k2" type="range" min="-4" max="4" step="1" class="flex-1" /></label>
        </div>

        <div class="rounded-lg bg-slate-50 px-3 py-2">
          <div class="font-bold" :class="kindLabel.cls">{{ kindLabel.text }}</div>
          <div v-if="solution" class="mt-1 text-slate-600">
            교점(해): x = {{ solution.x.toFixed(2) }}, y = {{ solution.y.toFixed(2) }}
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <button class="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200" @click="preset('unique')">유일해 예시</button>
          <button class="rounded-md bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200" @click="preset('none')">해 없음(평행)</button>
          <button class="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200" @click="preset('infinite')">무수히 많은 해</button>
        </div>
      </div>
    </div>
  </div>
</template>
