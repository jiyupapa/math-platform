<script setup lang="ts">
// Phase 3 전용 인터랙티브 — 주사위 2개 합 시뮬레이터.
// 굴린 결과를 합(2~12)별로 쌓아 상대도수 막대를 그리고, 이론 확률(경우의 수÷36)을
// 빨간 점선 눈금으로 겹쳐 보여준다. 많이 굴릴수록 막대가 삼각형 모양(이론값)에 붙는다.
import { ref, computed } from 'vue'

const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
// 합 s(2~12)가 나오는 경우의 수: 1,2,3,4,5,6,5,4,3,2,1 (합 7이 최다)
const WAYS = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]

// 그림 크기 (SVG 좌표계)
const W = 452
const H = 230
const PAD_T = 12
const PAD_B = 26
const BAR_W = 30
const GAP = 10
const X0 = 12

const counts = ref<number[]>(Array(11).fill(0))
const total = ref(0)
const lastPair = ref<[number, number] | null>(null)

function roll(n: number) {
  const c = [...counts.value]
  let pair: [number, number] = [1, 1]
  for (let i = 0; i < n; i++) {
    const a = 1 + Math.floor(Math.random() * 6)
    const b = 1 + Math.floor(Math.random() * 6)
    c[a + b - 2]++
    pair = [a, b]
  }
  counts.value = c
  total.value += n
  lastPair.value = pair
}

function reset() {
  counts.value = Array(11).fill(0)
  total.value = 0
  lastPair.value = null
}

const observed = computed(() =>
  counts.value.map((c) => (total.value === 0 ? 0 : c / total.value)),
)
const yMax = computed(() => Math.max(0.22, ...observed.value) * 1.12)

const barX = (i: number) => X0 + i * (BAR_W + GAP)
const barH = (p: number) => (p / yMax.value) * (H - PAD_T - PAD_B)
const barY = (p: number) => H - PAD_B - barH(p)

const bestSum = computed(() => {
  if (total.value === 0) return null
  let best = 0
  counts.value.forEach((c, i) => {
    if (c > counts.value[best]) best = i
  })
  return best + 2
})

const fmtPct = (p: number) => (p * 100).toFixed(1) + '%'
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <!-- 버튼 -->
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        @click="roll(1)"
      >
        🎲 1번 굴리기
      </button>
      <button
        type="button"
        class="rounded-lg bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
        @click="roll(100)"
      >
        100번
      </button>
      <button
        type="button"
        class="rounded-lg bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
        @click="roll(1000)"
      >
        1000번
      </button>
      <button
        type="button"
        class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
        @click="reset"
      >
        ↺ 리셋
      </button>
    </div>

    <!-- 현재 상태 칩 -->
    <div class="mb-3 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">
        굴린 횟수 = <b>{{ total }}</b>
      </span>
      <span v-if="lastPair" class="rounded-lg bg-indigo-50 px-3 py-1.5 text-indigo-700">
        마지막 눈 = <span class="text-2xl leading-none align-middle">{{ FACES[lastPair[0] - 1] }}{{ FACES[lastPair[1] - 1] }}</span>
        (합 <b>{{ lastPair[0] + lastPair[1] }}</b>)
      </span>
      <span v-if="bestSum !== null" class="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700">
        지금까지 최다 합 = <b>{{ bestSum }}</b>
      </span>
    </div>

    <!-- 합 분포 막대 -->
    <div class="flex justify-center">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        :width="W"
        :height="H"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50"
      >
        <!-- 바닥선 -->
        <line :x1="0" :y1="H - PAD_B" :x2="W" :y2="H - PAD_B" stroke="#94a3b8" stroke-width="1.2" />

        <g v-for="(w, i) in WAYS" :key="i">
          <!-- 관측 상대도수 막대 -->
          <rect
            :x="barX(i)"
            :y="barY(observed[i])"
            :width="BAR_W"
            :height="barH(observed[i])"
            fill="#6366f1"
            opacity="0.85"
            rx="2"
          />
          <!-- 이론 확률 눈금 (경우의 수 ÷ 36) -->
          <line
            :x1="barX(i) - 3"
            :y1="barY(w / 36)"
            :x2="barX(i) + BAR_W + 3"
            :y2="barY(w / 36)"
            stroke="#f43f5e"
            stroke-width="2"
            stroke-dasharray="4 3"
          />
          <!-- 합 라벨 -->
          <text
            :x="barX(i) + BAR_W / 2"
            :y="H - 8"
            text-anchor="middle"
            font-size="12"
            fill="#64748b"
          >
            {{ i + 2 }}
          </text>
          <!-- 관측 % (막대 위) -->
          <text
            v-if="total > 0 && observed[i] > 0"
            :x="barX(i) + BAR_W / 2"
            :y="Math.max(barY(observed[i]) - 4, 10)"
            text-anchor="middle"
            font-size="9"
            fill="#475569"
          >
            {{ fmtPct(observed[i]) }}
          </text>
        </g>
      </svg>
    </div>

    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      가로축 = 두 주사위의 <b>합</b>, 막대 = 실제로 나온 <b>비율</b>,
      <span class="font-semibold text-rose-500">빨간 점선</span> = 이론 확률(경우의 수 ÷ 36).
      조금 굴리면 들쭉날쭉하지만, 1000번씩 굴려 보면 막대가 점선의 <b>삼각형 모양</b>에 착 붙습니다.
    </p>
  </div>
</template>
