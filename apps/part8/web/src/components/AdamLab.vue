<script setup lang="ts">
// ch5 인터랙티브 — ① 두 지형 3파전: 지형이 100배 가파라져도 Adam은 같은 설정으로 생존
//                 ② 스케일 지우개: RMS(g²의 EMA)로 나누면 어떤 크기의 기울기도 ±1로 표준화.
// 오프라인·결정적 — 난수 없음. 노트북과 같은 지형·설정.
import { computed, ref } from 'vue'

// ── ① 두 지형 3파전 ────────────────────────────────────────────
const TERRAINS = [
  { key: 'A', label: '지형 A — 온화한 골짜기 (벽 곡률 8)', cy: 8 },
  { key: 'B', label: '지형 B — 극단 골짜기 (벽 곡률 800, 100배!)', cy: 800 },
]
const CXT = 0.1
const tIdx = ref(0)
interface Racer {
  x: number
  y: number
  mx: number
  my: number
  vx: number
  vy: number
  t: number
  dead: boolean
}
const mkRacer = (): Racer => ({ x: -9, y: 1.5, mx: 0, my: 0, vx: 0, vy: 0, t: 0, dead: false })
const racers = ref<{ gd: Racer; mom: Racer; adam: Racer }>({ gd: mkRacer(), mom: mkRacer(), adam: mkRacer() })
const steps = ref(0)

const lossOf = (r: Racer, cy: number) => 0.5 * CXT * r.x * r.x + 0.5 * cy * r.y * r.y

function stepAll(n: number) {
  const cy = TERRAINS[tIdx.value].cy
  for (let k = 0; k < n; k++) {
    const { gd, mom, adam } = racers.value
    // GD (lr 0.2)
    if (!gd.dead) {
      gd.x -= 0.2 * CXT * gd.x
      gd.y -= 0.2 * cy * gd.y
      if (Math.abs(gd.y) > 1e6) gd.dead = true
    }
    // 모멘텀 (lr 0.2, β 0.9)
    if (!mom.dead) {
      mom.mx = 0.9 * mom.mx + CXT * mom.x
      mom.my = 0.9 * mom.my + cy * mom.y
      mom.x -= 0.2 * mom.mx
      mom.y -= 0.2 * mom.my
      if (Math.abs(mom.y) > 1e6) mom.dead = true
    }
    // Adam (lr 0.3, β₁ 0.9, β₂ 0.999, ε 1e-8)
    if (!adam.dead) {
      adam.t++
      const gx = CXT * adam.x
      const gy = cy * adam.y
      adam.mx = 0.9 * adam.mx + 0.1 * gx
      adam.my = 0.9 * adam.my + 0.1 * gy
      adam.vx = 0.999 * adam.vx + 0.001 * gx * gx
      adam.vy = 0.999 * adam.vy + 0.001 * gy * gy
      const bc1 = 1 - 0.9 ** adam.t
      const bc2 = 1 - 0.999 ** adam.t
      adam.x -= (0.3 * (adam.mx / bc1)) / (Math.sqrt(adam.vx / bc2) + 1e-8)
      adam.y -= (0.3 * (adam.my / bc1)) / (Math.sqrt(adam.vy / bc2) + 1e-8)
    }
    racers.value = { ...racers.value }
    steps.value++
  }
}
function resetRace() {
  racers.value = { gd: mkRacer(), mom: mkRacer(), adam: mkRacer() }
  steps.value = 0
}
function pickTerrain(i: number) {
  tIdx.value = i
  resetRace()
}
const rows = computed(() => {
  const cy = TERRAINS[tIdx.value].cy
  const { gd, mom, adam } = racers.value
  const fmt = (r: Racer) => (r.dead ? '💥 폭발' : lossOf(r, cy) > 9999 ? '∞급' : lossOf(r, cy).toFixed(4))
  return [
    { name: '🔵 GD (lr 0.2)', val: fmt(gd), dead: gd.dead },
    { name: '🟢 모멘텀 (lr 0.2, β 0.9)', val: fmt(mom), dead: mom.dead },
    { name: '🟠 Adam (lr 0.3 — 두 지형 동일 설정)', val: fmt(adam), dead: adam.dead },
  ]
})
// Adam 축별 유효 보폭
const effSteps = computed(() => {
  const a = racers.value.adam
  if (a.t === 0) return null
  const bc2 = 1 - 0.999 ** a.t
  return {
    x: 0.3 / (Math.sqrt(a.vx / bc2) + 1e-8),
    y: 0.3 / (Math.sqrt(a.vy / bc2) + 1e-8),
  }
})

// ── ② 스케일 지우개 ────────────────────────────────────────────
const amp2 = ref(0.05) // 축2 기울기 진폭 (축1은 5로 고정)
function rmsNormalized(A: number, n = 60) {
  let v = 0
  let out = 0
  for (let k = 0; k < n; k++) {
    const g = A * (k % 2 === 0 ? 1 : 0.8) // 크기 A 근처에서 살짝 변하는 일정 부호 흐름
    v = 0.999 * v + 0.001 * g * g
    const vh = v / (1 - 0.999 ** (k + 1))
    out = g / (Math.sqrt(vh) + 1e-8)
  }
  return out
}
const norm1 = computed(() => rmsNormalized(5))
const norm2 = computed(() => rmsNormalized(amp2.value))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 두 지형 3파전 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 두 지형 3파전: 지형이 100배 가파라지면</p>
    <p class="mb-3 text-xs text-slate-500">
      세 여행자의 설정은 <b>지형이 바뀌어도 그대로</b>입니다. 지형 A에서 먼저 경주하고,
      지형 B(벽 곡률 100배)로 바꿔 다시 경주해 보세요.
    </p>

    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="(t, i) in TERRAINS"
        :key="t.key"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
        :class="tIdx === i ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
        @click="pickTerrain(i)"
      >
        {{ t.label }}
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button type="button" class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500" @click="stepAll(20)">
        20스텝
      </button>
      <button type="button" class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500" @click="stepAll(60)">
        60스텝
      </button>
      <button type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200" @click="resetRace()">
        처음부터
      </button>
      <span class="text-xs text-slate-500">스텝 {{ steps }}</span>
    </div>

    <div class="mt-2 space-y-1">
      <div v-for="r in rows" :key="r.name" class="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs">
        <span class="w-56 shrink-0 font-semibold text-slate-600">{{ r.name }}</span>
        <span class="min-w-0 flex-1 font-mono font-bold" :class="r.dead ? 'text-rose-700' : 'text-slate-700'">손실 {{ r.val }}</span>
      </div>
    </div>

    <div v-if="effSteps" class="mt-2 grid grid-cols-2 gap-2 text-center">
      <div class="rounded-lg bg-amber-50 p-2">
        <p class="text-xs text-amber-700">Adam의 유효 보폭 — 완만한 x축</p>
        <p class="font-mono text-sm font-bold text-amber-700">{{ effSteps.x.toFixed(3) }}</p>
      </div>
      <div class="rounded-lg bg-amber-50 p-2">
        <p class="text-xs text-amber-700">Adam의 유효 보폭 — 가파른 y축</p>
        <p class="font-mono text-sm font-bold text-amber-700">{{ effSteps.y.toFixed(4) }}</p>
      </div>
    </div>

    <p v-if="tIdx === 1 && steps >= 60 && !racers.adam.dead" class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-800">
      ✅ 지형이 100배 가파라지자 🔵 GD 와 🟢 모멘텀은 <b>같은 설정 그대로 폭발</b>했습니다
      (경계 2/c 가 100분의 1로 내려왔으니까요 — 2장). 🟠 Adam 만 살아남았죠 — 축마다 기울기의
      <b>평소 크기로 나눠서 걷기 때문에</b>, 지형의 스케일이 변해도 걸음은 lr 근처로 일정합니다.
      위의 유효 보폭을 보세요: 가파른 y축은 자동으로 미세 보폭, 완만한 x축은 성큼성큼.
    </p>
    <p v-else-if="tIdx === 0 && steps >= 60" class="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
      지형 A에서는 셋 다 무난합니다 (모멘텀·Adam 우세). 이제 <b>지형 B</b>로 바꿔 같은 설정으로 다시 경주해 보세요 — 반전이 있습니다.
    </p>

    <!-- ② 스케일 지우개 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 스케일 지우개: √(g²의 평균)으로 나누면</p>
    <p class="mb-3 text-xs text-slate-500">
      축1의 기울기는 크기 5로 고정, 축2의 크기는 슬라이더로 — RMS(g²의 EMA의 제곱근)로 나눈
      뒤의 값을 비교하세요.
    </p>

    <label class="block text-xs text-slate-500">
      축2의 기울기 크기 = <b class="text-slate-700">{{ amp2.toFixed(2) }}</b> (축1은 5.0 고정 — 최대 500배 차이)
      <input v-model.number="amp2" type="range" min="0.01" max="10" step="0.01" class="mt-1 w-full accent-indigo-600" />
    </label>

    <div class="mt-3 grid grid-cols-2 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-xs text-slate-500">축1 — 나누기 후 (원래 크기 5)</p>
        <p class="font-mono text-xl font-bold text-emerald-700">{{ norm1.toFixed(2) }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-xs text-slate-500">축2 — 나누기 후 (원래 크기 {{ amp2.toFixed(2) }})</p>
        <p class="font-mono text-xl font-bold text-emerald-700">{{ norm2.toFixed(2) }}</p>
      </div>
    </div>

    <p class="mt-3 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      💡 슬라이더를 어디에 놓아도 나누기 후에는 <b>둘 다 1 근처</b> — 크기가 지워지고 남는 건
      사실상 <b>방향(부호)</b>뿐입니다. 각 축이 자기 자(평소 크기)로 정규화되는 것 — 이것이
      "축마다 다른 보폭"의 정체이고, 7부 2장의 정규화(길이로 나누기)와 같은 사상이
      축 단위로 적용된 셈이에요.
    </p>
  </div>
</template>
