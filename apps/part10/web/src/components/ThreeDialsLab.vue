<script setup lang="ts">
// 1장 실험실 — 훈련의 3재료 다이얼: 파라미터 N · 데이터 D 를 고르면 컴퓨트 C ≈ 6·N·D 가
// 자동으로 계산되고, "A100 GPU 로 며칠짜리 훈련인가"로 환산된다. 완전 결정적(난수 없음) —
// 노트북(ch01_bigpicture.ipynb)과 같은 공식·같은 상수를 쓴다.
import { ref, computed } from 'vue'

// A100 bf16 최대 312 TFLOPS × 실효 가동률 50% 어림 (근거는 본문 더 깊이 카드)
const EFF_FLOPS = 312e12 * 0.5

// 슬라이더는 로그 눈금(2장 예고) — 균등 칸이면 큰 값 쪽이 다 뭉개진다
const N_STEPS = [125e6, 350e6, 760e6, 1.5e9, 3e9, 7e9, 13e9, 34e9, 70e9]
const D_STEPS = [1e9, 10e9, 50e9, 100e9, 300e9, 1e12, 2e12]

const nIdx = ref(5) // 7B
const dIdx = ref(5) // 1T

const N = computed(() => N_STEPS[nIdx.value])
const D = computed(() => D_STEPS[dIdx.value])
const C = computed(() => 6 * N.value * D.value)
const gpuDays = computed(() => C.value / EFF_FLOPS / 86400)

const PRESETS = [
  { label: 'GPT-2급', n: 3, d: 1, desc: '1.5B · 10B 토큰' },
  { label: '7B급', n: 5, d: 5, desc: '7B · 1T 토큰' },
  { label: '70B급', n: 8, d: 6, desc: '70B · 2T 토큰' },
]
function preset(p: (typeof PRESETS)[number]) {
  nIdx.value = p.n
  dIdx.value = p.d
}

// 표기 도우미
function big(v: number): string {
  if (v >= 1e12) return `${trim(v / 1e12)}조`
  if (v >= 1e8) return `${trim(v / 1e8)}억`
  return v.toLocaleString()
}
function param(v: number): string {
  return v >= 1e9 ? `${trim(v / 1e9)}B` : `${trim(v / 1e6)}M`
}
function tokens(v: number): string {
  return v >= 1e12 ? `${trim(v / 1e12)}T` : `${trim(v / 1e9)}B`
}
function sci(v: number): string {
  const e = Math.floor(Math.log10(v))
  return `${(v / 10 ** e).toFixed(1)} × 10^${e}`
}
const trim = (v: number) => (Number.isInteger(+v.toFixed(1)) ? String(Math.round(v)) : v.toFixed(1))
function days(v: number): string {
  if (v >= 365.25) return `${(v / 365.25).toFixed(1)}년`
  if (v >= 1) return `${v.toFixed(1)}일`
  if (v * 24 >= 1) return `${(v * 24).toFixed(1)}시간`
  return `${Math.round(v * 1440)}분`
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-500">① 재료 고르기: 프리셋을 누르거나 다이얼을 직접 돌려 보세요</p>
    <div class="mb-3 flex flex-wrap gap-1.5">
      <button
        v-for="p in PRESETS"
        :key="p.label"
        type="button"
        class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
        :class="nIdx === p.n && dIdx === p.d ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="preset(p)"
      >
        <!-- 선택 시 배경이 bg-indigo-50 으로 바뀌므로 slate-500 은 4.26:1 로 미달 — 600 을 쓴다 -->
        {{ p.label }} <span class="text-xs text-slate-600">({{ p.desc }})</span>
      </button>
    </div>

    <div class="space-y-3 rounded-lg bg-slate-50 p-4">
      <div>
        <div class="mb-1 flex items-baseline justify-between text-sm">
          <span class="font-semibold text-indigo-800">파라미터 N <span class="font-normal text-slate-500">(모델의 몸집)</span></span>
          <span class="font-mono font-bold text-slate-800">{{ param(N) }} <span class="text-xs font-normal text-slate-500">= {{ big(N) }} 개</span></span>
        </div>
        <input v-model.number="nIdx" type="range" :min="0" :max="N_STEPS.length - 1" step="1" class="w-full accent-indigo-600" />
      </div>
      <div>
        <div class="mb-1 flex items-baseline justify-between text-sm">
          <span class="font-semibold text-emerald-800">데이터 D <span class="font-normal text-slate-500">(먹인 토큰 수)</span></span>
          <span class="font-mono font-bold text-slate-800">{{ tokens(D) }} <span class="text-xs font-normal text-slate-500">= {{ big(D) }} 토큰</span></span>
        </div>
        <input v-model.number="dIdx" type="range" :min="0" :max="D_STEPS.length - 1" step="1" class="w-full accent-emerald-600" />
      </div>
      <p class="text-xs text-slate-500">다이얼 눈금이 10배씩 뛰는 것에 주목하세요. 이 "곱의 세계"가 2장의 주인공입니다.</p>
    </div>

    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">② 훈련 예산 계산서: 컴퓨트 C ≈ 6 × N × D</p>
    <div class="rounded-lg bg-slate-50 p-4">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm text-slate-700">
        <span>C ≈ 6 ×</span>
        <span class="rounded bg-indigo-100 px-1.5 py-0.5 font-bold text-indigo-800">{{ param(N) }}</span>
        <span>×</span>
        <span class="rounded bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-800">{{ tokens(D) }}</span>
        <span>=</span>
        <span class="rounded bg-amber-100 px-2 py-0.5 text-base font-bold text-amber-900">{{ sci(C) }} FLOPs</span>
      </div>
      <div class="mt-3 grid gap-2 sm:grid-cols-3">
        <div class="rounded-lg bg-white p-3 ring-1 ring-slate-200">
          <p class="text-xs text-slate-500">A100 GPU 1장으로</p>
          <p class="mt-0.5 font-bold text-slate-800">{{ days(gpuDays) }}</p>
        </div>
        <div class="rounded-lg bg-white p-3 ring-1 ring-slate-200">
          <p class="text-xs text-slate-500">100장으로</p>
          <p class="mt-0.5 font-bold text-slate-800">{{ days(gpuDays / 100) }}</p>
        </div>
        <div class="rounded-lg bg-white p-3 ring-1 ring-slate-200">
          <p class="text-xs text-slate-500">1,000장으로</p>
          <p class="mt-0.5 font-bold text-slate-800">{{ days(gpuDays / 1000) }}</p>
        </div>
      </div>
      <p class="mt-2 text-sm text-slate-600">
        <template v-if="gpuDays >= 3652">
          🏭 GPU 1장으론 10년 이상. <b>이래서 대형 모델 훈련은 수천 장짜리 공장 일</b>입니다.
        </template>
        <template v-else-if="gpuDays >= 365">
          🏢 1장으론 1년 이상. 수백 장을 묶어야 현실적인 기간이 됩니다.
        </template>
        <template v-else-if="gpuDays >= 30">
          🖥️ 1장으로 몇 달. 연구실 규모의 훈련입니다.
        </template>
        <template v-else>💻 1장으로 며칠. 개인·소규모로도 닿는 규모네요.</template>
      </p>
    </div>

    <p class="mt-3 rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
      💡 N을 한 칸(≈2배) 올리고 D도 한 칸 올려 보세요. C는 <b>곱</b>이라 둘 다 2배면 <b>4배</b>가 됩니다.
      같은 예산 C로 "크게 잠깐 vs 작게 오래" 중 뭐가 나은가? 그 답(황금비)이 4장입니다.
    </p>
  </div>
</template>
