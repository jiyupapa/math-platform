<script setup lang="ts">
// Phase 6 전용 인터랙티브 — 갈톤 보드(Galton board).
// 공이 핀에 부딪힐 때마다 왼쪽/오른쪽으로 반반 확률로 튀며 떨어진다.
// 공을 많이 떨어뜨리면 바닥 칸에 종 모양(정규분포 비슷한 이항분포)이 쌓인다.
import { ref, computed, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 핀 줄 수 (바닥 칸 = rows + 1) */
    rows?: number
    size?: number
  }>(),
  { rows: 10, size: 440 },
)

const bins = ref<number[]>(Array(props.rows + 1).fill(0))
const total = computed(() => bins.value.reduce((s, v) => s + v, 0))

// 천천히 떨어지는 애니메이션 공 (한 번에 하나)
const ball = ref<{ row: number; pos: number } | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

// 레이아웃
const pinTop = 26
const rowGap = 16
const spacing = computed(() => (props.size - 70) / props.rows)
const pinsBottom = computed(() => pinTop + props.rows * rowGap)
const binAreaH = 84
const H = computed(() => pinsBottom.value + binAreaH + 20)

const pinX = (r: number, i: number) => props.size / 2 + (i - r / 2) * spacing.value
const pinY = (r: number) => pinTop + r * rowGap

const maxBin = computed(() => Math.max(...bins.value, 1))
const binW = computed(() => spacing.value - 3)
const binH = (c: number) => (c / maxBin.value) * (binAreaH - 16)

function stopAnim() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  ball.value = null
}

/** 공 1개 — 핀을 한 줄씩 통과하는 애니메이션 */
function dropOne() {
  if (ball.value) return
  ball.value = { row: 0, pos: 0 }
  timer = setInterval(() => {
    const cur = ball.value
    if (!cur) return
    if (cur.row >= props.rows) {
      bins.value[cur.pos]++
      stopAnim()
      return
    }
    // 핀에 부딪혀 왼쪽(그대로) 또는 오른쪽(+1)으로 반반 확률
    ball.value = { row: cur.row + 1, pos: cur.pos + (Math.random() < 0.5 ? 0 : 1) }
  }, 110)
}

/** 공 100개 — 즉시 결과 누적 */
function dropMany() {
  for (let i = 0; i < 100; i++) {
    let pos = 0
    for (let r = 0; r < props.rows; r++) if (Math.random() >= 0.5) pos++
    bins.value[pos]++
  }
}

function reset() {
  stopAnim()
  bins.value = Array(props.rows + 1).fill(0)
}

onUnmounted(stopAnim)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <div class="flex justify-center">
      <svg
        :viewBox="`0 0 ${size} ${H}`"
        :width="size"
        :height="H"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50"
      >
        <!-- 핀 (r번째 줄에 r+1개) -->
        <g fill="#94a3b8">
          <template v-for="r in rows" :key="'r' + r">
            <circle
              v-for="i in r"
              :key="'p' + r + '-' + i"
              :cx="pinX(r - 1, i - 1)"
              :cy="pinY(r - 1)"
              r="2.5"
            />
          </template>
        </g>

        <!-- 떨어지는 공 -->
        <circle
          v-if="ball"
          :cx="pinX(ball.row, ball.pos)"
          :cy="pinY(ball.row) - 7"
          r="6"
          fill="#ef4444"
          stroke="#fff"
          stroke-width="1.5"
        />

        <!-- 바닥 칸 막대 -->
        <g>
          <rect
            v-for="(c, i) in bins"
            :key="'b' + i"
            :x="pinX(rows, i) - binW / 2"
            :y="pinsBottom + (binAreaH - 12) - binH(c)"
            :width="binW"
            :height="binH(c)"
            rx="2"
            fill="#34d399"
          />
          <text
            v-for="(c, i) in bins"
            :key="'c' + i"
            :x="pinX(rows, i)"
            :y="pinsBottom + binAreaH + 2"
            font-size="8.5"
            text-anchor="middle"
            fill="#64748b"
          >
            {{ c > 0 ? c : '' }}
          </text>
        </g>
        <!-- 바닥선 -->
        <line
          :x1="10"
          :y1="pinsBottom + binAreaH - 12"
          :x2="size - 10"
          :y2="pinsBottom + binAreaH - 12"
          stroke="#94a3b8"
          stroke-width="1"
        />
      </svg>
    </div>

    <!-- 버튼 -->
    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
        :disabled="!!ball"
        @click="dropOne"
      >
        ● 공 1개 (천천히)
      </button>
      <button
        type="button"
        class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
        @click="dropMany"
      >
        ⇊ 공 100개 (한 번에)
      </button>
      <button
        type="button"
        class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
        @click="reset"
      >
        ↺ 리셋
      </button>
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
        떨어진 공 = <b>{{ total }}</b>
      </span>
    </div>

    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      공은 핀마다 <b>왼쪽/오른쪽 반반</b> 확률로 튑니다. "오른쪽으로 튄 횟수"는 이항분포
      <b>B({{ rows }}, 0.5)</b> — 공을 수백 개 떨어뜨리면 가운데가 높은 <b>종 모양</b>이 쌓여요.
      작은 우연이 많이 겹치면 정규분포가 나타난다는 신호입니다(7장 중심극한정리의 복선).
    </p>
  </div>
</template>
