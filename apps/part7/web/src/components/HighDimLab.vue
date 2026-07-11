<script setup lang="ts">
// ch4 인터랙티브 — ① 차원을 올리며 무작위 쌍의 코사인 분포 관찰(0 주위로 집중)
//                 ② 신호 vs 바닥: 무작위 문서를 아무리 늘려도 학습된 관련 문서를 못 넘는다.
// 오프라인·결정적 — 시드 고정 PRNG(mulberry32)라 항상 같은 숫자가 나온다.
import { computed, ref } from 'vue'

// 시드 고정 PRNG — 결정적
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
// 표준정규 근사 (균등 12개 합 − 6)
function gaussian(rand: () => number) {
  let s = 0
  for (let i = 0; i < 12; i++) s += rand()
  return s - 6
}
function randUnit(d: number, rand: () => number) {
  const v = Array.from({ length: d }, () => gaussian(rand))
  const n = Math.hypot(...v)
  return v.map((x) => x / n)
}
const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0)

// ── ① 차원별 무작위 코사인 분포 ──
const DIMS = [2, 8, 32, 128, 512]
const dimIdx = ref(0)
const PAIRS = 300
const cache = new Map<number, { hist: number[]; std: number; maxAbs: number }>()
function statsFor(d: number) {
  if (cache.has(d)) return cache.get(d)!
  const rand = mulberry32(1000 + d) // 차원마다 고정 시드 — 조작 순서와 무관하게 동일
  const cosines: number[] = []
  for (let i = 0; i < PAIRS; i++) cosines.push(dot(randUnit(d, rand), randUnit(d, rand)))
  const bins = 21
  const hist = Array(bins).fill(0)
  for (const c of cosines) hist[Math.min(bins - 1, Math.floor(((c + 1) / 2) * bins))]++
  const std = Math.sqrt(cosines.reduce((s, c) => s + c * c, 0) / cosines.length)
  const maxAbs = Math.max(...cosines.map(Math.abs))
  const r = { hist, std, maxAbs }
  cache.set(d, r)
  return r
}
const dim = computed(() => DIMS[dimIdx.value])
const st = computed(() => statsFor(dim.value))
const histMax = computed(() => Math.max(...st.value.hist))

// ── ② 신호 vs 바닥 (d = 256 고정) ──
const D2 = 256
const rand2 = mulberry32(7777)
const anchor = randUnit(D2, rand2) // 질문 벡터
// 관련 문서: 질문 + 잡음 → 정규화 (cos ≈ 0.67 부근이 되도록 설계)
const related = (() => {
  const noise = randUnit(D2, rand2)
  const v = anchor.map((x, i) => x + 1.1 * noise[i])
  const n = Math.hypot(...v)
  return v.map((x) => x / n)
})()
const relatedCos = dot(anchor, related)
const poolSize = ref(200)
const poolMax = ref(
  (() => {
    let m = 0
    for (let i = 0; i < 200; i++) m = Math.max(m, Math.abs(dot(anchor, randUnit(D2, rand2))))
    return m
  })(),
)
function addRandom() {
  let m = poolMax.value
  for (let i = 0; i < 1000; i++) m = Math.max(m, Math.abs(dot(anchor, randUnit(D2, rand2))))
  poolMax.value = m
  poolSize.value += 1000
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 차원별 분포 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 무작위 두 벡터의 각도: 차원을 올려 보세요</p>
    <p class="mb-3 text-xs text-slate-400">
      각 차원에서 무작위 벡터 300쌍을 뽑아 코사인 유사도의 분포를 그렸습니다 (시드 고정 — 항상 같은 결과).
    </p>

    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="(d, i) in DIMS"
        :key="d"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-bold transition"
        :class="dimIdx === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
        @click="dimIdx = i"
      >
        {{ d }}차원
      </button>
    </div>

    <!-- 히스토그램 -->
    <div class="rounded-lg bg-slate-50 p-3">
      <div class="flex h-28 items-end gap-[2px]">
        <div
          v-for="(h, i) in st.hist"
          :key="i"
          class="flex-1 rounded-t bg-indigo-400"
          :style="{ height: (h / histMax) * 100 + '%', opacity: h ? 1 : 0.15 }"
        />
      </div>
      <div class="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>−1 (반대)</span><span>0 (직교)</span><span>+1 (같은 방향)</span>
      </div>
    </div>

    <div class="mt-2 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-[11px] text-slate-400">표준편차 σ</p>
        <p class="font-mono text-sm font-bold text-slate-700">{{ st.std.toFixed(3) }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-[11px] text-slate-400">이론값 1/√d</p>
        <p class="font-mono text-sm font-bold text-indigo-600">{{ (1 / Math.sqrt(dim)).toFixed(3) }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-[11px] text-slate-400">|cos| 최대 (300쌍)</p>
        <p class="font-mono text-sm font-bold text-slate-700">{{ st.maxAbs.toFixed(2) }}</p>
      </div>
    </div>

    <p class="mt-3 rounded-lg p-3 text-sm" :class="dim >= 128 ? 'bg-indigo-50 text-indigo-800' : 'bg-slate-50 text-slate-600'">
      <template v-if="dim === 2">
        2차원에선 코사인이 −1부터 1까지 <b>골고루</b> 나옵니다 — 아무 각도나 나와요. 이게 우리의 직관이죠.
      </template>
      <template v-else-if="dim < 128">
        분포가 0 주위로 <b>모이기 시작</b>합니다. σ가 이론값 1/√d를 따라 줄어드는 걸 확인하세요.
      </template>
      <template v-else>
        {{ dim }}차원 — 거의 모든 쌍이 <b>cos ≈ 0(직교)</b>입니다. 무작위로는 300쌍을 뽑아도
        |cos|가 {{ st.maxAbs.toFixed(2) }}를 못 넘어요. <b>고차원에서 "우연히 비슷하기"는 거의 불가능합니다.</b>
      </template>
    </p>

    <!-- ② 신호 vs 바닥 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 신호 vs 바닥: 그런데도 검색이 되는 이유 (256차원)</p>
    <p class="mb-3 text-xs text-slate-400">
      질문 벡터 하나를 고정하고, <b>학습으로 관련지어진 문서 1개</b>와 <b>무작위 문서 무더기</b>의 점수를 비교합니다.
    </p>

    <div class="space-y-2">
      <div class="flex items-center gap-2 text-sm">
        <span class="w-40 shrink-0 text-xs font-semibold text-emerald-700">관련 문서 (학습된 신호)</span>
        <div class="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div class="h-full rounded-full bg-emerald-500" :style="{ width: relatedCos * 100 + '%' }" />
        </div>
        <span class="w-12 shrink-0 text-right font-mono text-xs font-bold text-emerald-700">{{ relatedCos.toFixed(2) }}</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="w-40 shrink-0 text-xs font-semibold text-slate-500">무작위 {{ poolSize.toLocaleString() }}개 중 최고</span>
        <div class="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div class="h-full rounded-full bg-slate-400" :style="{ width: poolMax * 100 + '%' }" />
        </div>
        <span class="w-12 shrink-0 text-right font-mono text-xs font-bold text-slate-500">{{ poolMax.toFixed(2) }}</span>
      </div>
    </div>

    <div class="mt-3 flex items-center gap-2">
      <button
        type="button"
        class="rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-600"
        @click="addRandom"
      >
        🎲 무작위 문서 1,000개 더 던지기
      </button>
      <span class="text-[11px] text-slate-400">아무리 던져도 바닥(0 근처)에서 못 벗어납니다</span>
    </div>

    <p class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
      ✅ 무작위 문서는 수천 개를 던져도 <b>{{ poolMax.toFixed(2) }}</b> 언저리가 한계 —
      1/√256 ≈ 0.06의 몇 배 수준이죠. 반면 학습으로 관련지어진 문서는 <b>{{ relatedCos.toFixed(2) }}</b>로
      바닥에서 <b>확실하게 솟아</b> 있습니다. 임베딩 검색이 고차원에서 작동하는 이유:
      <b>임베딩은 무작위가 아니라, 관련된 것들이 정렬되도록 학습된 벡터</b>이기 때문입니다(학습법은 9장).
    </p>
  </div>
</template>
