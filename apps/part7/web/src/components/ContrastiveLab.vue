<script setup lang="ts">
// ch9 인터랙티브 — ① 대조 학습 시뮬: "짝은 끌고 남은 밀며" 지도가 스스로 정리되는 과정
//                 ② −log 손실 재회: 정답·오답 유사도 차이(마진)와 손실의 관계.
// 오프라인·결정적 (초기 배치 고정, 갱신 규칙 결정적).
import { computed, ref } from 'vue'

// ── ① 대조 학습 시뮬 ──────────────────────────────────────────
// 쌍 3개: (질문 Qi, 정답 문서 Di) — 처음엔 짝이 멀리 흩어져 있다
const INIT = [
  { id: 'Q1', pair: 1, x: 2.0, y: 7.5, isQ: true, color: '#6366f1' },
  { id: 'D1', pair: 1, x: 8.0, y: 2.0, isQ: false, color: '#6366f1' },
  { id: 'Q2', pair: 2, x: 7.5, y: 7.5, isQ: true, color: '#d97706' },
  { id: 'D2', pair: 2, x: 1.8, y: 2.2, isQ: false, color: '#d97706' },
  { id: 'Q3', pair: 3, x: 5.0, y: 8.2, isQ: true, color: '#059669' },
  { id: 'D3', pair: 3, x: 5.0, y: 1.2, isQ: false, color: '#059669' },
]
const points = ref(INIT.map((p) => ({ ...p })))
const steps = ref(0)

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)

function trainStep() {
  const cur = points.value
  const next = cur.map((p) => ({ ...p }))
  for (let i = 0; i < cur.length; i++) {
    const p = cur[i]
    let fx = 0
    let fy = 0
    for (let j = 0; j < cur.length; j++) {
      if (i === j) continue
      const o = cur[j]
      const d = Math.max(dist(p, o), 0.3)
      if (o.pair === p.pair) {
        // 짝은 끌어당긴다 (양성 쌍)
        fx += (o.x - p.x) * 0.22
        fy += (o.y - p.y) * 0.22
      } else {
        // 남은 밀어낸다 (음성 쌍) — 가까울수록 세게
        fx += ((p.x - o.x) / (d * d)) * 0.5
        fy += ((p.y - o.y) / (d * d)) * 0.5
      }
    }
    next[i].x = Math.min(9.5, Math.max(0.5, p.x + fx))
    next[i].y = Math.min(9.5, Math.max(0.5, p.y + fy))
  }
  points.value = next
  steps.value++
}
function trainN(n: number) {
  for (let i = 0; i < n; i++) trainStep()
}
function resetMap() {
  points.value = INIT.map((p) => ({ ...p }))
  steps.value = 0
}

const metrics = computed(() => {
  const ps = points.value
  const qs = ps.filter((p) => p.isQ)
  const ds = ps.filter((p) => !p.isQ)
  let pairSum = 0
  let losses = 0
  for (const q of qs) {
    const dPair = dist(q, ds.find((d) => d.pair === q.pair)!)
    pairSum += dPair
    // 소프트맥스 P(정답 문서) — 거리가 가까울수록 점수 큼
    const exps = ds.map((d) => Math.exp(-dist(q, d)))
    const p = Math.exp(-dPair) / exps.reduce((a, b) => a + b, 0)
    losses += -Math.log2(p)
  }
  const nonDists: number[] = []
  for (const q of qs) for (const d of ds) if (d.pair !== q.pair) nonDists.push(dist(q, d))
  return {
    pairAvg: pairSum / qs.length,
    nonAvg: nonDists.reduce((a, b) => a + b, 0) / nonDists.length,
    loss: losses / qs.length,
  }
})
const organized = computed(() => metrics.value.pairAvg < 1.2 && metrics.value.nonAvg > 3.5)

const px = (v: number) => 20 + v * 26
const py = (v: number) => 265 - v * 25

// ── ② −log 손실 재회 ──────────────────────────────────────────
const sPos = ref(0.6) // 정답 문서와의 유사도
const sNeg = ref(0.4) // 오답 문서들(3개)의 유사도
const TAU = 0.1
const prob = computed(() => {
  const ePos = Math.exp(sPos.value / TAU)
  const eNeg = Math.exp(sNeg.value / TAU)
  return ePos / (ePos + 3 * eNeg)
})
const loss2 = computed(() => -Math.log2(prob.value))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 대조 학습 시뮬 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 지도가 스스로 정리된다: 짝은 끌고, 남은 밀고</p>
    <p class="mb-3 text-xs text-slate-400">
      (질문, 정답 문서) 쌍 3개가 뒤죽박죽 흩어져 있습니다. 같은 색이 짝이에요 (⭐ = 질문, ● = 문서).
      학습 스텝을 눌러 보세요.
    </p>

    <svg viewBox="0 0 300 280" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <!-- 짝 연결선 -->
      <line
        v-for="n in 3"
        :key="'l' + n"
        :x1="px(points.find((p) => p.pair === n && p.isQ)!.x)"
        :y1="py(points.find((p) => p.pair === n && p.isQ)!.y)"
        :x2="px(points.find((p) => p.pair === n && !p.isQ)!.x)"
        :y2="py(points.find((p) => p.pair === n && !p.isQ)!.y)"
        :stroke="points.find((p) => p.pair === n)!.color"
        stroke-width="1"
        stroke-dasharray="3 3"
        opacity="0.5"
      />
      <template v-for="p in points" :key="p.id">
        <text v-if="p.isQ" :x="px(p.x)" :y="py(p.y) + 5" text-anchor="middle" font-size="14">⭐</text>
        <circle v-else :cx="px(p.x)" :cy="py(p.y)" r="6" :fill="p.color" />
        <text :x="px(p.x)" :y="py(p.y) - 10" text-anchor="middle" font-size="9" font-weight="bold" :fill="p.color">{{ p.id }}</text>
      </template>
    </svg>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500" @click="trainStep()">
        학습 1스텝
      </button>
      <button type="button" class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500" @click="trainN(10)">
        학습 10스텝
      </button>
      <button type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-200" @click="resetMap()">
        처음부터
      </button>
      <span class="text-[11px] text-slate-400">스텝 {{ steps }}</span>
    </div>

    <div class="mt-2 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-[11px] text-slate-400">짝 평균 거리</p>
        <p class="font-mono text-sm font-bold text-emerald-600">{{ metrics.pairAvg.toFixed(2) }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-[11px] text-slate-400">남 평균 거리</p>
        <p class="font-mono text-sm font-bold text-rose-600">{{ metrics.nonAvg.toFixed(2) }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-[11px] text-slate-400">손실 (비트)</p>
        <p class="font-mono text-sm font-bold text-slate-700">{{ metrics.loss.toFixed(2) }}</p>
      </div>
    </div>

    <p v-if="organized" class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
      ✅ 지도가 정리됐습니다 — 짝은 붙고({{ metrics.pairAvg.toFixed(1) }}), 남은 떨어지고({{ metrics.nonAvg.toFixed(1) }}),
      손실은 바닥으로. 아무도 좌표를 손으로 정해 주지 않았어요 — <b>"짝은 끌고 남은 민다"는 규칙만
      반복했을 뿐인데 클러스터가 생겼습니다.</b> 3장에서 본 그 구조의 탄생 현장입니다.
    </p>
    <p v-else-if="steps > 0" class="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
      학습 중… 같은 색끼리 가까워지고 다른 색끼리 멀어지는 것을 지켜보세요. (손실도 함께 떨어집니다)
    </p>

    <!-- ② −log 손실 재회 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 손실의 얼굴: 정답과 오답의 차이가 전부다</p>
    <p class="mb-3 text-xs text-slate-400">
      질문 하나, 후보 문서 4개(정답 1 + 오답 3). 유사도 두 개를 움직여 "정답을 고를 확률"과 손실을 보세요.
    </p>

    <div class="space-y-3">
      <label class="block text-xs text-slate-500">
        정답 문서와의 유사도 s₊ = <b class="text-emerald-600">{{ sPos.toFixed(2) }}</b>
        <input v-model.number="sPos" type="range" min="0" max="1" step="0.05" class="mt-1 w-full accent-emerald-600" />
      </label>
      <label class="block text-xs text-slate-500">
        오답 문서들(3개)의 유사도 s₋ = <b class="text-rose-600">{{ sNeg.toFixed(2) }}</b>
        <input v-model.number="sNeg" type="range" min="0" max="1" step="0.05" class="mt-1 w-full accent-rose-600" />
      </label>
    </div>

    <div class="mt-3 grid grid-cols-2 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-[11px] text-slate-400">P(정답을 1등으로 고름)</p>
        <p class="font-mono text-xl font-bold" :class="prob > 0.7 ? 'text-emerald-600' : prob > 0.3 ? 'text-amber-600' : 'text-rose-600'">
          {{ (prob * 100).toFixed(0) }}%
        </p>
      </div>
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-[11px] text-slate-400">손실 = −log₂ P (비트)</p>
        <p class="font-mono text-xl font-bold text-slate-700">{{ loss2.toFixed(2) }}</p>
        <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div class="h-full rounded-full bg-indigo-500" :style="{ width: Math.min(100, loss2 * 16) + '%' }" />
        </div>
      </div>
    </div>

    <p class="mt-3 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      💡 s₊ = s₋로 맞춰 보세요 — 모델이 정답·오답을 <b>전혀 구분 못 하면</b> P = 1/4(4지선다 찍기),
      손실은 정확히 <b>2비트</b>가 됩니다. 차이(마진)를 벌릴수록 손실이 뚝 — 절대값이 아니라
      <b>정답과 오답의 간격</b>이 전부라는 것, 그리고 이 −log 얼굴… 5부 4장(크로스 엔트로피)과
      6부 4장(보상 모델)에서 만난 <b>그 함수 가족</b>입니다.
    </p>
  </div>
</template>
