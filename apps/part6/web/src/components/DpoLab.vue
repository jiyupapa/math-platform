<script setup lang="ts">
// ch7 인터랙티브 — 미니 DPO 훈련기. 선호 쌍 하나로 "숨은 점수" 격차를 벌리는 과정을 본다.
// 숨은 점수 r̂ = log(π/π_ref) — 원본보다 자주 내면 +, 덜 내면 −.
// 손실 = −log σ(마진). RL 루프도 보상 모델도 없이 선호가 새겨진다. 오프라인·결정적.
import { ref, computed } from 'vue'

// 세 버킷: 선택된 답(W) · 탈락한 답(L) · 그 외 모든 답(기타)
const NAMES = ['W 간결한 답 (사람이 선택 ✓)', 'L 장황한 답 (탈락)', '기타 답변들']
const PI_REF = [0.3, 0.3, 0.4] // 참조 모델(SFT)의 분포 — 훈련 내내 고정

const z = ref<number[]>([0, 0, 0]) // 정책의 로짓 (초기 = 참조와 동일 분포가 되도록 0)
const steps = ref(0)

const pi = computed(() => {
  // softmax(z) 를 참조 분포에 곱해 시작점을 π_ref 로 맞춘다
  const w = z.value.map((v, i) => PI_REF[i] * Math.exp(v))
  const s = w.reduce((a, b) => a + b, 0)
  return w.map((x) => x / s)
})

const hidden = computed(() => pi.value.map((p, i) => Math.log(p / PI_REF[i]))) // 숨은 점수
const margin = computed(() => hidden.value[0] - hidden.value[1])
const pHuman = computed(() => 1 / (1 + Math.exp(-margin.value))) // σ(마진)
const loss = computed(() => -Math.log2(pHuman.value))
const done = computed(() => pHuman.value >= 0.9)

function trainStep() {
  // DPO 한 걸음: 선택(W)의 로짓 ↑, 탈락(L)의 로짓 ↓ — 격차가 클수록(σ 높을수록) 걸음은 작아진다
  const g = 1 - pHuman.value
  z.value = [z.value[0] + 0.9 * g, z.value[1] - 0.9 * g, z.value[2]]
  steps.value++
}
function reset() {
  z.value = [0, 0, 0]
  steps.value = 0
}

const pct = (p: number) => Math.round(p * 100)
const fmt = (n: number) => (n >= 0 ? '+' : '') + (Math.round(n * 100) / 100).toFixed(2)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험: 미니 DPO 훈련기 — 심판 없이 선호 쌍 하나 새기기</p>
    <p class="mb-3 text-xs text-slate-400">
      숨은 점수 r̂ = log(π ÷ π_ref) — "원본보다 얼마나 자주 내는가". 참조(π_ref)는 회색으로 고정.
    </p>

    <div class="space-y-2">
      <div v-for="(name, i) in NAMES" :key="i" class="rounded-lg border p-3" :class="i === 0 ? 'border-emerald-200' : i === 1 ? 'border-rose-200' : 'border-slate-100'">
        <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
          <span class="text-sm font-medium text-slate-800">{{ name }}</span>
          <span v-if="i < 2" class="rounded px-1.5 py-0.5 text-[11px] font-bold" :class="hidden[i] > 0.01 ? 'bg-emerald-100 text-emerald-700' : hidden[i] < -0.01 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'">
            숨은 점수 {{ fmt(hidden[i]) }}
          </span>
        </div>
        <div class="flex items-center gap-2 text-[11px] text-slate-400">
          <span class="w-14 shrink-0">π_ref {{ pct(PI_REF[i]) }}%</span>
          <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div class="h-full rounded-full bg-slate-300" :style="{ width: pct(PI_REF[i]) + '%' }" />
          </div>
        </div>
        <div class="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
          <span class="w-14 shrink-0 font-semibold text-indigo-600">π {{ pct(pi[i]) }}%</span>
          <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div class="h-full rounded-full transition-all" :class="i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-rose-400' : 'bg-slate-400'" :style="{ width: pct(pi[i]) + '%' }" />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div>
        <p class="text-[11px] font-semibold text-slate-400">마진 (r̂_W − r̂_L)</p>
        <p class="text-xl font-bold text-slate-800">{{ fmt(margin) }}</p>
      </div>
      <div>
        <p class="text-[11px] font-semibold text-slate-400">P(사람 취향 적중) = σ(마진)</p>
        <p class="text-xl font-bold" :class="done ? 'text-emerald-600' : 'text-slate-800'">{{ pct(pHuman) }}%</p>
      </div>
      <div>
        <p class="text-[11px] font-semibold text-slate-400">손실 −log P</p>
        <p class="text-xl font-bold text-slate-800">{{ (Math.round(loss * 100) / 100).toFixed(2) }}</p>
      </div>
      <div class="ml-auto flex gap-2">
        <button
          type="button"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40"
          :disabled="done"
          @click="trainStep"
        >
          한 스텝 훈련 ⚙️
        </button>
        <button v-if="steps > 0" type="button" class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50" @click="reset">
          처음부터
        </button>
      </div>
    </div>

    <p v-if="steps === 0" class="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
      👀 시작점: 정책 = 참조 모델(숨은 점수 0/0, 마진 0, σ(0)=50%). 아직 아무 선호도 새겨지지 않았어요.
      "한 스텝 훈련"을 눌러 보세요 — <b>답변을 생성하지도, 채점하지도 않고</b> 확률만 움직입니다.
    </p>
    <p v-else-if="!done" class="mt-2 rounded-lg bg-sky-50 p-3 text-sm text-sky-800">
      ⚙️ W는 원본보다 자주(숨은 점수 +), L은 덜 자주(−) — 격차(마진)가 벌어지며 손실이 내려갑니다.
      기타 답변들은 거의 건드리지 않는 것도 보세요(원본다움 보존).
    </p>
    <p v-else class="mt-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
      ✅ <b>선호가 새겨졌어요 — RL 루프도, 보상 모델도 없이.</b> 쓴 것은 선호 쌍 하나와
      참조 모델(기준점)뿐. 이게 DPO입니다.
    </p>
  </div>
</template>
