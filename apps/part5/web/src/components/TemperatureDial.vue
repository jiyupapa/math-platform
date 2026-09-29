<script setup lang="ts">
// 온도 다이얼 — 모델의 로짓(점수)은 고정한 채 temperature 슬라이더만 돌리면
// 분포 q = softmax(z/T) 와 엔트로피 H 가 함께 변한다. T→0 몰빵(H→0),
// T→∞ 균등(H→log₂n). 🎲 샘플링 버튼으로 생성 다양성까지 체감시킨다.
import { ref, computed } from 'vue'

// "오늘 날씨가 참 ___" 다음 토큰의 로짓 (모델의 원점수 — 고정!)
const TOKENS = ['좋다', '맑다', '춥다', '이상하다', '감자같다']
const LOGITS = [3.0, 2.2, 1.5, 0.3, -1.5]
const H_MAX = Math.log2(TOKENS.length) // log₂5 ≈ 2.32

const T = ref(1.0)

const q = computed(() => {
  const scaled = LOGITS.map((z) => z / T.value)
  const m = Math.max(...scaled)
  const e = scaled.map((v) => Math.exp(v - m))
  const t = e.reduce((s, v) => s + v, 0)
  return e.map((v) => v / t)
})
const H = computed(() =>
  q.value.reduce((s, p) => (p > 0 ? s + p * Math.log2(1 / p) : s), 0),
)
const branches = computed(() => Math.pow(2, H.value)) // 실질 갈래 수 (7장)

const presets = [
  { label: '🧊 T = 0.1 (거의 확정)', t: 0.1 },
  { label: 'T = 1 (원본)', t: 1 },
  { label: 'T = 2', t: 2 },
  { label: '🔥 T = 4 (거의 균등)', t: 4 },
]

// 🎲 현재 분포로 10개 샘플링 — 생성 다양성 체감
const samples = ref<string[]>([])
function draw() {
  const out: string[] = []
  for (let k = 0; k < 10; k++) {
    let r = Math.random()
    let idx = 0
    for (let i = 0; i < q.value.length; i++) {
      r -= q.value[i]
      if (r <= 0) {
        idx = i
        break
      }
    }
    out.push(TOKENS[idx])
  }
  samples.value = out
}

const COLORS = ['var(--c-indigo-500)', 'var(--c-indigo-400)', 'var(--c-indigo-300)', 'var(--c-indigo-200)', 'var(--c-indigo-100)']
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-1 text-sm font-semibold text-slate-700">
      🌡️ 온도 다이얼: "오늘 날씨가 참 ___" 의 다음 토큰
    </p>
    <p class="mb-3 text-xs text-slate-500">
      모델의 점수(로짓)는 고정입니다. 다이얼은 확률의 배분만 바꿔요.
    </p>

    <!-- T 슬라이더 -->
    <div class="mb-1 flex items-center gap-3">
      <span class="w-28 shrink-0 text-right text-sm text-slate-600">
        temperature <b class="tabular-nums text-slate-800">{{ T.toFixed(2) }}</b>
      </span>
      <input
        v-model.number="T"
        type="range"
        min="0.05"
        max="4"
        step="0.05"
        class="flex-1 accent-indigo-600"
        aria-label="temperature"
      />
    </div>
    <div class="mb-3 flex flex-wrap gap-1.5 pl-[7.75rem]">
      <button
        v-for="pr in presets"
        :key="pr.label"
        class="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
        @click="T = pr.t"
      >
        {{ pr.label }}
      </button>
    </div>

    <!-- 분포 막대 -->
    <div class="space-y-1.5">
      <div v-for="(tok, i) in TOKENS" :key="tok" class="flex items-center gap-2 text-sm">
        <span class="w-20 shrink-0 truncate rounded bg-slate-100 px-1.5 py-0.5 text-center text-xs font-medium text-slate-700">
          {{ tok }}
        </span>
        <span class="w-14 shrink-0 text-right text-xs tabular-nums text-slate-500">
          로짓 {{ LOGITS[i].toFixed(1) }}
        </span>
        <div class="h-4 min-w-0 flex-1 overflow-hidden rounded bg-slate-100">
          <div
            class="h-full rounded transition-all duration-100"
            :style="{ width: q[i] * 100 + '%', background: COLORS[i] }"
          />
        </div>
        <span class="w-14 shrink-0 text-right text-xs tabular-nums text-slate-600">
          {{ (q[i] * 100).toFixed(1) }}%
        </span>
      </div>
    </div>

    <!-- 엔트로피 게이지 -->
    <div class="mt-3 flex items-center gap-3">
      <span class="w-28 shrink-0 text-right text-sm text-slate-600">엔트로피 H</span>
      <div class="h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          class="h-full rounded-full bg-gradient-to-r from-sky-400 to-rose-500 transition-all duration-100"
          :style="{ width: (H / H_MAX) * 100 + '%' }"
        />
      </div>
      <span class="w-36 shrink-0 text-sm font-bold tabular-nums text-indigo-700">
        {{ H.toFixed(3) }}비트 ≈ {{ branches.toFixed(2) }}갈래
      </span>
    </div>
    <p class="mt-1 text-xs text-slate-500" style="padding-left: 7.75rem">
      최대 = log₂5 ≈ {{ H_MAX.toFixed(2) }}비트 (T→∞ 균등) · T→0 이면 0비트(몰빵)
    </p>

    <!-- 샘플링 -->
    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button
        class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        @click="draw"
      >
        🎲 이 분포로 10번 생성해 보기
      </button>
      <div v-if="samples.length" class="flex min-w-0 flex-wrap gap-1">
        <span
          v-for="(s, i) in samples"
          :key="i"
          class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
        >
          {{ s }}
        </span>
      </div>
    </div>
    <p v-if="samples.length" class="mt-1.5 text-xs text-slate-500">
      🧊 낮은 T 에서는 같은 단어만, 🔥 높은 T 에서는 "감자같다"까지 나와요.
      다이얼을 바꿔 다시 뽑아 보세요.
    </p>
  </div>
</template>
