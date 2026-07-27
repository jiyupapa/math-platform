<script setup lang="ts">
// 워밍업 실험실 — 같은 "진짜 실력"의 두 모델을 문항 수가 다른 벤치마크로 채점해 보며
// "점수는 측정이다"를 목격한다. 완전 결정적: mulberry32(시드 = n*100 + 회차) —
// 노트북(ch00_sample.ipynb)의 Python 포트와 비트 단위로 같은 난수열을 쓴다.
import { ref, computed } from 'vue'

// 신의 시점 — 진짜 실력 (현실에선 아무도 모르는 값)
const PA = 0.72
const PB = 0.7
const NS = [25, 50, 100, 250, 1000, 5000]
const ROUNDS = 20

function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** n문항 시험 1회 — [A 점수, B 점수] (0~100, 결정적) */
function scores(n: number, round: number): [number, number] {
  const rand = mulberry32(n * 100 + round)
  let a = 0
  for (let i = 0; i < n; i++) if (rand() < PA) a++
  let b = 0
  for (let i = 0; i < n; i++) if (rand() < PB) b++
  return [(a / n) * 100, (b / n) * 100]
}

const n = ref(50)
const round = ref(1)

const current = computed(() => scores(n.value, round.value))
const verdict = computed(() => {
  const [a, b] = current.value
  if (b > a) return 'flip'
  if (b === a) return 'tie'
  return 'normal'
})

// 이 문항 수로 20번 다시 채점한 요약 (결정적 — 항상 같은 표)
const summary = computed(() => {
  const marks: ('A' | 'B' | 'T')[] = []
  for (let r = 1; r <= ROUNDS; r++) {
    const [a, b] = scores(n.value, r)
    marks.push(b > a ? 'B' : b === a ? 'T' : 'A')
  }
  return { marks, flips: marks.filter((m) => m === 'B').length, ties: marks.filter((m) => m === 'T').length }
})

// ±오차범위 미리보기 (정확한 유도는 6장 — 여기선 "여론조사의 그 ±"로만)
const showBand = ref(false)
const band = (p100: number) => 1.96 * Math.sqrt(((p100 / 100) * (1 - p100 / 100)) / n.value) * 100
const bandsOverlap = computed(() => {
  const [a, b] = current.value
  return a - band(a) <= b + band(b) && b - band(b) <= a + band(a)
})

function reroll() {
  round.value = (round.value % ROUNDS) + 1
}
function setN(v: number) {
  n.value = v
  round.value = 1
}
const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 신의 시점 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 진짜 실력 (신의 시점 — 현실에선 아무도 모르는 값)</p>
    <div class="mb-4 flex flex-wrap gap-3 text-sm">
      <div class="rounded-lg bg-indigo-50 px-3 py-1.5 font-medium text-indigo-800">모델 A — 진짜 실력 72%</div>
      <div class="rounded-lg bg-rose-50 px-3 py-1.5 font-medium text-rose-800">모델 B — 진짜 실력 70%</div>
      <div class="self-center text-xs text-slate-500">→ A가 2%p 더 잘함 (이걸 시험으로 알아내야 함)</div>
    </div>

    <!-- ② 시험 치기 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">② 벤치마크 시험 치기 — 문항 수를 고르고, 다시 채점해 보세요</p>
    <div class="mb-2 flex flex-wrap items-center gap-1.5">
      <button
        v-for="v in NS"
        :key="v"
        type="button"
        class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
        :class="n === v ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="setN(v)"
      >
        {{ v.toLocaleString() }}문항
      </button>
      <button
        type="button"
        class="ml-auto rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
        @click="reroll"
      >
        🎲 다시 채점 ({{ round }}/{{ ROUNDS }}회차)
      </button>
    </div>

    <div class="space-y-3 rounded-lg bg-slate-50 p-4">
      <div v-for="(label, i) in ['모델 A', '모델 B']" :key="label" class="flex items-center gap-3">
        <span class="w-16 shrink-0 text-sm font-semibold" :class="i === 0 ? 'text-indigo-700' : 'text-rose-700'">{{ label }}</span>
        <div class="relative h-7 flex-1 overflow-hidden rounded-md bg-white ring-1 ring-slate-200">
          <!-- 점수 막대 -->
          <div
            class="h-full rounded-md transition-all duration-300"
            :class="i === 0 ? 'bg-indigo-400' : 'bg-rose-400'"
            :style="{ width: current[i] + '%' }"
          />
          <!-- ±오차범위 밴드 -->
          <div
            v-if="showBand"
            class="absolute top-0 h-full border-x-2 bg-amber-300/30"
            :class="i === 0 ? 'border-indigo-600/60' : 'border-rose-600/60'"
            :style="{ left: Math.max(current[i] - band(current[i]), 0) + '%', width: Math.min(band(current[i]) * 2, 100) + '%' }"
          />
          <!-- 진짜 실력 마커 -->
          <div class="absolute top-0 h-full border-l-2 border-dashed border-slate-500" :style="{ left: (i === 0 ? 72 : 70) + '%' }" />
        </div>
        <span class="w-16 shrink-0 text-right font-mono text-sm font-bold text-slate-800">{{ fmt(current[i]) }}점</span>
      </div>
      <p class="text-xs text-slate-500">점선 = 진짜 실력(72 / 70). 막대 = 이번 시험 점수.</p>

      <p
        class="rounded-md px-3 py-2 text-sm font-medium"
        :class="verdict === 'flip' ? 'bg-rose-50 text-rose-800' : verdict === 'tie' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-800'"
      >
        <template v-if="verdict === 'flip'">😱 역전 — 이번 시험에선 B가 이겼습니다. 진짜 실력은 A가 높은데도요!</template>
        <template v-else-if="verdict === 'tie'">🤝 동점 — 이 시험으로는 우열을 가릴 수 없네요.</template>
        <template v-else>✅ 이번 시험은 진짜 실력 순서대로 나왔습니다 — 하지만 아래 20회 요약을 보세요.</template>
      </p>
    </div>

    <!-- ③ 20회 요약 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">③ 같은 시험을 20번 다시 내면 — 누가 이기나</p>
    <div class="rounded-lg bg-slate-50 p-4">
      <div class="mb-2 flex flex-wrap gap-1">
        <span
          v-for="(m, i) in summary.marks"
          :key="i"
          class="flex h-6 w-6 items-center justify-center rounded text-xs font-bold"
          :class="m === 'B' ? 'bg-rose-400 text-white' : m === 'T' ? 'bg-slate-300 text-slate-600' : 'bg-indigo-400 text-white'"
          :title="`${i + 1}회차`"
        >{{ m === 'T' ? '=' : m }}</span>
      </div>
      <p class="text-sm text-slate-700">
        <b>{{ n.toLocaleString() }}문항</b> 시험 20번 중 — 실력이 낮은
        <b class="text-rose-700">B가 이긴 시험 {{ summary.flips }}번</b><template v-if="summary.ties"> · 동점 {{ summary.ties }}번</template>.
        <template v-if="summary.flips >= 6">순위가 거의 동전 던지기입니다.</template>
        <template v-else-if="summary.flips >= 1">아직 가끔 뒤집힙니다.</template>
        <template v-else>이제 순위가 안정적이네요 — 문항 수의 힘.</template>
      </p>
    </div>

    <!-- ④ 오차범위 미리보기 -->
    <label class="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input v-model="showBand" type="checkbox" class="h-4 w-4 accent-indigo-600" />
      <span><b>±오차범위 밴드 보기</b> — 여론조사의 그 "±3.1%p"와 같은 것 (정확한 공식은 6장에서)</span>
    </label>
    <p v-if="showBand" class="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
      <template v-if="bandsOverlap">
        두 밴드가 <b>겹칩니다</b> — 이번 점수 차이는 오차범위 안, 즉 <b>소음일 수 있어요</b>.
        문항 수를 늘려 밴드가 좁아지는 걸 확인해 보세요.
      </template>
      <template v-else>
        두 밴드가 <b>겹치지 않네요</b> — 이 정도면 점수 차이를 우연으로 보기 어렵습니다. (판정의 정식 도구는 7장)
      </template>
    </p>
  </div>
</template>
