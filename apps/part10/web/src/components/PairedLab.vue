<script setup lang="ts">
// 7장 실험실 — 같은 시험지 맞대결(쌍대 비교):
//   신의 시점 문항 구조: 둘 다 맞음 66% / A만 6% / B만 4% / 둘 다 틀림 24% → A 72%, B 70%
//   (워밍업의 그 두 모델). 8,000문항짜리 "성장하는 시험"(시드 777)의 앞 n문항으로
//   ① 따로 보기(두 비율 z) vs ② 쌍대 보기(불일치 문항 부호 검정 z=(x−y)/√(x+y))를 대결시킨다.
// 완전 결정적 — 노트북(ch07_abtest.ipynb)과 동일 난수열·동일 정규 CDF 근사(A&S 7.1.26).
import { ref, computed } from 'vue'

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

function phi(z: number): number {
  const x = Math.abs(z) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * x)
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t) *
      Math.exp(-x * x)
  return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y)
}
const pTwo = (z: number) => 2 * (1 - phi(Math.abs(z)))

// 성장하는 시험 — 문항 유형 스트림 (0 둘다맞음 / 1 A만 / 2 B만 / 3 둘다틀림)
const N_MAX = 8000
const CAT: number[] = (() => {
  const rand = mulberry32(777)
  const out: number[] = []
  for (let i = 0; i < N_MAX; i++) {
    const u = rand()
    out.push(u < 0.66 ? 0 : u < 0.72 ? 1 : u < 0.76 ? 2 : 3)
  }
  return out
})()

const NS = [250, 500, 1000, 2000, 4000, 8000]
const n = ref(1000)

const S = computed(() => {
  let both = 0
  let x = 0
  let y = 0
  for (let i = 0; i < n.value; i++) {
    if (CAT[i] === 0) both++
    else if (CAT[i] === 1) x++
    else if (CAT[i] === 2) y++
  }
  const none = n.value - both - x - y
  const a = (both + x) / n.value
  const b = (both + y) / n.value
  const seU = Math.sqrt((a * (1 - a)) / n.value + (b * (1 - b)) / n.value)
  const zU = (a - b) / seU
  const m = x + y
  const zP = m > 0 ? (x - y) / Math.sqrt(m) : 0
  return { both, x, y, none, a: a * 100, b: b * 100, zU, pU: pTwo(zU), zP, pP: pTwo(zP), m }
})

function verdict(p: number): { label: string; cls: string } {
  if (p < 0.01) return { label: `p = ${p < 0.0001 ? '< 0.0001' : p.toFixed(4)} — 강한 증거`, cls: 'bg-emerald-100 text-emerald-800' }
  if (p < 0.05) return { label: `p = ${p.toFixed(3)} — 유의 (α=0.05)`, cls: 'bg-emerald-50 text-emerald-700' }
  return { label: `p = ${p.toFixed(3)} — 판정 불가`, cls: 'bg-slate-100 text-slate-600' }
}
const pct = (v: number) => ((v / n.value) * 100).toFixed(1)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 같은 시험지 맞대결 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">
      ① 같은 시험지로 맞대결 — 문항 수를 고르세요 (진짜 실력: A 72% &gt; B 70%, 신의 시점)
    </p>
    <div class="mb-2 flex flex-wrap gap-1.5">
      <button
        v-for="v in NS"
        :key="v"
        type="button"
        class="rounded-lg border px-2 py-1 font-mono text-xs transition-colors"
        :class="n === v ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="n = v"
      >
        {{ v.toLocaleString() }}
      </button>
    </div>

    <!-- 문항 4분류 -->
    <div class="mb-1 flex h-8 w-full overflow-hidden rounded-lg text-xs font-semibold text-white">
      <div class="flex items-center justify-center bg-slate-400" :style="{ width: pct(S.both) + '%' }" :title="`둘 다 맞음 ${S.both}`">둘 다 ✓ {{ S.both }}</div>
      <div class="flex items-center justify-center bg-indigo-500" :style="{ width: pct(S.x) + '%' }" :title="`A만 맞음 ${S.x}`">A만 {{ S.x }}</div>
      <div class="flex items-center justify-center bg-rose-500" :style="{ width: pct(S.y) + '%' }" :title="`B만 맞음 ${S.y}`">B만 {{ S.y }}</div>
      <div class="flex items-center justify-center bg-slate-200 text-slate-600" :style="{ width: pct(S.none) + '%' }" :title="`둘 다 틀림 ${S.none}`">둘 다 ✗ {{ S.none }}</div>
    </div>
    <p class="mb-3 text-xs text-slate-500">
      회색 칸(둘 다 맞음/틀림)은 우열 정보가 <b>0</b> — 증거는 색깔 칸(<b>불일치 {{ S.m }}문항</b>)에만 있습니다.
    </p>

    <!-- ② 판정 대결 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">② 같은 데이터, 두 가지 채점 — 판정이 갈립니다</p>
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="rounded-lg bg-slate-50 p-3.5">
        <p class="text-sm font-bold text-slate-700">방식 1 — 따로 보기 (점수만 비교)</p>
        <p class="mt-1 font-mono text-sm text-slate-600">A {{ S.a.toFixed(1) }}점 vs B {{ S.b.toFixed(1) }}점 · z = {{ S.zU.toFixed(2) }}</p>
        <p class="mt-2 rounded-md px-2.5 py-1.5 text-sm font-medium" :class="verdict(S.pU).cls">{{ verdict(S.pU).label }}</p>
        <p class="mt-1.5 text-xs leading-relaxed text-slate-600">
          6장의 방식 — 각 점수의 출렁임(문항 난이도 운)이 통째로 소음에 들어갑니다.
        </p>
      </div>
      <div class="rounded-lg bg-indigo-50/60 p-3.5 ring-1 ring-indigo-100">
        <p class="text-sm font-bold text-indigo-800">방식 2 — 쌍대 보기 (불일치만 세기)</p>
        <p class="mt-1 font-mono text-sm text-slate-700">
          A만 {{ S.x }} vs B만 {{ S.y }} · z = (x−y)/√(x+y) = {{ S.zP.toFixed(2) }}
        </p>
        <p class="mt-2 rounded-md px-2.5 py-1.5 text-sm font-medium" :class="verdict(S.pP).cls">{{ verdict(S.pP).label }}</p>
        <p class="mt-1.5 text-xs leading-relaxed text-slate-600">
          "실력이 같다면 불일치는 50:50 동전" — 거기서 얼마나 쏠렸는지만 봅니다.
        </p>
      </div>
    </div>
    <p
      v-if="S.pP < 0.05 && S.pU >= 0.05"
      class="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800"
    >
      ⚡ 지금이 그 순간입니다 — <b>같은 시험 결과</b>인데 따로 보기는 "판정 불가", 쌍대 보기는
      "유의". 문항 난이도라는 공통 소음을 소거한 차이예요.
    </p>
    <p v-else-if="S.m > 0 && S.x === S.y" class="mt-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">
      🪙 이 구간은 불일치가 정확히 {{ S.x }} : {{ S.y }} 동점 — 증거가 전혀 없습니다.
      표본이 작으면 이런 판도 나와요(그래서 문항 수!).
    </p>

    <!-- ③ 필요 표본 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">③ 2%p 차이를 가리는 데 필요한 문항 수 (이론값, z=1.96 기준)</p>
    <div class="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm">
      <div class="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">따로 보기: <b class="font-mono">≈ 3,953문항</b></div>
      <div class="rounded-lg bg-white px-3 py-2 ring-1 ring-indigo-200">쌍대 보기: <b class="font-mono text-indigo-700">≈ 957문항</b></div>
      <span class="font-semibold text-emerald-700">→ 4.1배 절약</span>
      <span class="text-xs text-slate-500">(절약 배율은 두 모델이 비슷할수록 — 불일치가 적을수록 — 커집니다)</span>
    </div>
  </div>
</template>
