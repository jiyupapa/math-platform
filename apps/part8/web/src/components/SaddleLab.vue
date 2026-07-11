<script setup lang="ts">
// ch10 인터랙티브 — ① 말안장 위의 여행자: 완벽한 GD는 능선 정중앙에서 영원히 갇히고,
//                    SGD의 노이즈는 능선 방향으로 밀어내 탈출한다(3장 순기능 재회).
//                 ② 동전 세기: 방향 W개가 전부 위로 굽을 확률 (1/2)^W — 고차원 임계점은 거의 다 안장점.
// 지형: L(a,b) = b²/2 + (1−a²)²/4 — 안장점 (0,0) 높이 0.25, 골짜기 (±1,0) 높이 0. 시드 고정·결정적.
import { computed, ref } from 'vue'

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function gaussian(rand: () => number) {
  let s = 0
  for (let i = 0; i < 12; i++) s += rand()
  return s - 6
}

// ── ① 말안장 위의 여행자 ──────────────────────────────
const L = (a: number, b: number) => (b * b) / 2 + (1 - a * a) ** 2 / 4

function runTraveler(sgd: boolean, seed: number) {
  const rand = mulberry32(seed)
  let a = 0
  let b = 3
  const losses: number[] = []
  const traj: [number, number][] = [[a, b]]
  for (let t = 0; t < 150; t++) {
    let ga = a * a * a - a // 능선 방향: 원점 근처 곡률 −1 (내리막이 숨어 있다)
    let gb = b //             골짜기 방향: 곡률 +1
    if (sgd) {
      ga += 0.08 * gaussian(rand)
      gb += 0.08 * gaussian(rand)
    }
    a -= 0.15 * ga
    b -= 0.15 * gb
    losses.push(L(a, b))
    traj.push([a, b])
  }
  return { losses, traj }
}
const raced = ref(false)
const race = computed(() => {
  if (!raced.value) return null
  const gd = runTraveler(false, 0)
  const sgd = runTraveler(true, 1001)
  const escape = sgd.losses.findIndex((l) => l < 0.1)
  return { gd, sgd, escape }
})

// 히트맵 (48×26 셀) — 밝음 = 낮음(골짜기), 어두움 = 높음
const px = (a: number) => 10 + ((a + 1.6) / 3.2) * 280
const py = (b: number) => 5 + ((3.3 - b) / 6.6) * 140
const cells = (() => {
  const out: { x: number; y: number; o: number }[] = []
  for (let i = 0; i < 48; i++) {
    for (let j = 0; j < 26; j++) {
      const a = -1.6 + (i + 0.5) * (3.2 / 48)
      const b = 3.3 - (j + 0.5) * (6.6 / 26)
      out.push({ x: 10 + i * (280 / 48), y: 5 + j * (140 / 26), o: 0.06 + 0.7 * Math.min(L(a, b), 2) / 2 })
    }
  }
  return out
})()
const trajPath = (traj: [number, number][]) => traj.map(([a, b]) => `${px(a).toFixed(1)},${py(b).toFixed(1)}`).join(' ')
// 손실 곡선 (log y)
const logY = (l: number) => 102 - ((Math.log10(Math.max(l, 1e-3)) + 3) / 4) * 92
const lossPath = (ls: number[]) => ls.map((l, t) => `${(15 + (t / 149) * 275).toFixed(1)},${logY(l).toFixed(1)}`).join(' ')

// ── ② 동전 세기 ────────────────────────────────────────
const W = ref(2)
const signs = computed(() => {
  const rand = mulberry32(777 + W.value)
  return Array.from({ length: W.value }, () => rand() < 0.5)
})
const denom = computed(() => (2 ** W.value).toLocaleString())
const drawn = ref(false)
const drawCount = computed(() => {
  if (!drawn.value) return null
  const rand = mulberry32(503)
  let allPlus = 0
  for (let i = 0; i < 100; i++) {
    let plus = 0
    for (let k = 0; k < W.value; k++) if (rand() < 0.5) plus++
    if (plus === W.value) allPlus++
  }
  return allPlus
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 말안장 위의 여행자 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 말안장 위의 여행자: 완벽한 나침반의 저주</p>
    <p class="mb-3 text-xs text-slate-400">
      가운데 ✕가 안장점(높이 0.25) — 세로로는 골짜기 바닥이지만 <b>가로로는 능선 꼭대기</b>입니다.
      진짜 바닥(★, 높이 0)은 양옆에. 위쪽 기슭에서 두 여행자를 출발시켜 보세요.
    </p>

    <button
      v-if="!raced"
      type="button"
      class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
      @click="raced = true"
    >
      🏁 경주 시작 — GD vs SGD (150스텝)
    </button>

    <template v-if="race">
      <svg viewBox="0 0 300 150" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
        <rect v-for="(c, i) in cells" :key="i" :x="c.x" :y="c.y" :width="280 / 48 + 0.3" :height="140 / 26 + 0.3" fill="#6366f1" :opacity="c.o" />
        <polyline :points="trajPath(race.gd.traj)" fill="none" stroke="#e11d48" stroke-width="1.8" />
        <polyline :points="trajPath(race.sgd.traj)" fill="none" stroke="#34d399" stroke-width="1.5" />
        <text :x="px(0)" :y="py(0) + 2.5" text-anchor="middle" font-size="9" fill="#fff" font-weight="bold">✕</text>
        <text :x="px(1)" :y="py(0) + 2.5" text-anchor="middle" font-size="9" fill="#fbbf24">★</text>
        <text :x="px(-1)" :y="py(0) + 2.5" text-anchor="middle" font-size="9" fill="#fbbf24">★</text>
        <text :x="px(0) + 5" :y="py(0) - 5" font-size="7" fill="#fff">안장점 (높이 0.25)</text>
        <text :x="px(1)" :y="py(0) + 12" text-anchor="middle" font-size="7" fill="#b45309">골짜기 (0)</text>
        <text x="14" y="13" font-size="7" fill="#e11d48">— GD (완벽한 나침반)</text>
        <text x="14" y="22" font-size="7" fill="#059669">— SGD (흔들리는 나침반)</text>
      </svg>

      <p class="mt-2 mb-1 text-[11px] font-semibold text-slate-400">손실 곡선 (log)</p>
      <svg viewBox="0 0 300 112" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
        <line x1="15" :y1="logY(0.25)" x2="290" :y2="logY(0.25)" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="3 3" />
        <text x="288" :y="logY(0.25) - 3" text-anchor="end" font-size="7" fill="#94a3b8">안장 높이 0.25</text>
        <polyline :points="lossPath(race.gd.losses)" fill="none" stroke="#e11d48" stroke-width="1.5" />
        <polyline :points="lossPath(race.sgd.losses)" fill="none" stroke="#059669" stroke-width="1.5" />
      </svg>

      <div class="mt-2 flex flex-wrap gap-3 rounded-lg bg-slate-50 p-3 text-center">
        <div>
          <p class="text-[11px] text-slate-400">GD — 150스텝째 손실</p>
          <p class="font-mono text-lg font-bold text-rose-600">{{ race.gd.losses[149]!.toFixed(3) }} <span class="text-[11px] font-normal text-slate-400">(안장 높이 그대로)</span></p>
        </div>
        <div>
          <p class="text-[11px] text-slate-400">SGD — 탈출 스텝</p>
          <p class="font-mono text-lg font-bold text-emerald-600">{{ race.escape }}</p>
        </div>
        <div>
          <p class="text-[11px] text-slate-400">SGD — 최종 손실</p>
          <p class="font-mono text-lg font-bold text-emerald-600">{{ race.sgd.losses[149]!.toFixed(4) }}</p>
        </div>
      </div>

      <p class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-800">
        ✅ 완벽한 나침반(GD)은 능선 <b>정중앙</b>을 걸어 내려와 안장점에서 멈췄습니다 — 발밑 기울기가
        정확히 0이라, 옆에 내리막이 있어도 <b>영원히 모릅니다</b>. 흔들리는 나침반(SGD)은 노이즈가
        능선 옆으로 밀어내 준 덕에 스텝 {{ race.escape }}에 탈출해 진짜 바닥까지 —
        <b>3장 노이즈의 순기능, 두 번째 재회</b>입니다. 그리고 GD의 손실 곡선을 보세요:
        내려오다 평평… 9장에서 본 <b>평원 무늬의 정체 하나가 바로 안장점 통과</b>예요.
      </p>
    </template>

    <!-- ② 동전 세기 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 동전 세기: 고차원 임계점은 왜 거의 다 안장점인가</p>
    <p class="mb-3 text-xs text-slate-400">
      임계점(기울기 0)이 <b>국소최소가 되려면 모든 방향이 위로(+) 굽어야</b> 합니다. 방향별 곡률
      부호를 반반 동전이라 치고 — 방향 수 W를 올려 보세요.
    </p>

    <label class="block text-xs text-slate-500">
      방향(차원) 수 W = <b class="text-slate-700">{{ W }}</b> <span class="text-slate-400">(실제 LLM은 수십억)</span>
      <input v-model.number="W" type="range" min="1" max="30" step="1" class="mt-1 w-full accent-indigo-600" />
    </label>

    <div class="mt-2 flex flex-wrap items-center gap-1">
      <span class="mr-1 text-[11px] text-slate-400">임계점 하나를 뽑아 봤습니다:</span>
      <span
        v-for="(s, i) in signs"
        :key="i"
        class="inline-flex h-5 w-5 items-center justify-center rounded font-mono text-[11px] font-bold"
        :class="s ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'"
      >{{ s ? '+' : '−' }}</span>
      <span class="ml-2 text-xs font-semibold" :class="signs.every((s) => s) ? 'text-emerald-700' : 'text-rose-600'">
        {{ signs.every((s) => s) ? '전부 + — 국소최소!' : '− 가 섞임 — 안장점 (탈출구 있음)' }}
      </span>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div class="text-center">
        <p class="text-[11px] text-slate-400">모든 방향이 + 일 확률</p>
        <p class="font-mono text-base font-bold text-indigo-600">(1/2)<sup>{{ W }}</sup> = 1/{{ denom }}</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
        @click="drawn = true"
      >
        🎲 임계점 100개 뽑기
      </button>
      <p v-if="drawCount !== null" class="min-w-0 flex-1 text-xs leading-relaxed text-slate-600">
        100개 중 <b class="text-emerald-700">국소최소 {{ drawCount }}개</b> /
        <b class="text-rose-600">안장점 {{ 100 - drawCount }}개</b>
        <template v-if="W >= 15"> — W가 조금만 커져도 국소최소는 <b>씨가 마릅니다</b>. 수십억 차원의 임계점은 사실상 전부 안장점.</template>
        <template v-else-if="W <= 3"> — W가 작을 땐 국소최소도 꽤 나옵니다(이론 {{ (100 / 2 ** W).toFixed(0) }}개). W를 올려 보세요.</template>
      </p>
    </div>
  </div>
</template>
