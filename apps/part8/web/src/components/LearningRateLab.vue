<script setup lang="ts">
// ch2 인터랙티브 — ① 수축 인자 기계: 곡률 c 와 보폭 lr 로 운명이 결정되는 공식 |1−lr·c| 체험
//                 ② lr 스위프: 곡률이 숨겨진 골짜기에서 로그 스케일 탐색으로 좋은 보폭 찾기.
// 오프라인·결정적 — 이차 골짜기 L = (c/2)(w−t)², 갱신 (w−t) ← (1−lr·c)(w−t). 난수 없음.
import { computed, ref } from 'vue'

// ── ① 수축 인자 기계 ──────────────────────────────────────────
const c1 = ref(2.0) // 곡률 (ch0 의 골짜기 = 2)
const lr1 = ref(0.3)
const factor = computed(() => Math.abs(1 - lr1.value * c1.value))
const boundary = computed(() => 2 / c1.value)
const oneShot = computed(() => 1 / c1.value)
const verdict1 = computed(() => {
  const f = factor.value
  if (f < 0.02) return { label: '🎯 한 방 도착권: 수축 인자 ≈ 0', tone: 'text-emerald-700' }
  if (f < 0.6) return { label: '🏃 빠른 수렴: 스텝마다 오차가 확확 준다', tone: 'text-emerald-700' }
  if (f < 1 - 1e-9) return { label: '🐢 수렴은 하지만 느림: 오차가 조금씩만 준다', tone: 'text-sky-700' }
  if (Math.abs(f - 1) < 1e-9) return { label: '♾️ 경계: 같은 오차로 영원히 진동', tone: 'text-amber-700' }
  return { label: '💥 폭발: 스텝마다 오차가 커진다', tone: 'text-rose-700' }
})
// 12스텝 손실 스파크라인 (출발 오차 8, 손실 = (c/2)·오차²)
const spark = computed(() => {
  const pts: number[] = []
  let err = 8
  for (let i = 0; i <= 12; i++) {
    pts.push((c1.value / 2) * err * err)
    err *= 1 - lr1.value * c1.value
  }
  const max = Math.max(...pts.map((v) => Math.min(v, 300)), 1)
  return pts.map((v, i) => `${12 + i * 21},${64 - (Math.min(v, 300) / max) * 56}`).join(' ')
})

// ── ② lr 스위프 (곡률 비공개 골짜기) ───────────────────────────
const HIDDEN_C = 0.8 // 경계 2.5, 최적 1.25
const SWEEP = [0.01, 0.03, 0.1, 0.3, 1.0, 3.0]
const tried = ref<Record<number, { loss: number; fate: string; tone: string }>>({})
const revealed = ref(false)

function trySweep(lr: number) {
  let err = 8
  for (let i = 0; i < 10; i++) err *= 1 - lr * HIDDEN_C
  const loss = (HIDDEN_C / 2) * err * err
  const startLoss = (HIDDEN_C / 2) * 64
  const fate =
    loss > startLoss + 1e-9
      ? { fate: '💥 폭발', tone: 'text-rose-700' }
      : loss < 0.01
        ? { fate: '✅ 수렴', tone: 'text-emerald-700' }
        : loss < startLoss * 0.5
          ? { fate: '🏃 내려가는 중', tone: 'text-sky-700' }
          : { fate: '🐢 거의 제자리', tone: 'text-amber-700' }
  tried.value = { ...tried.value, [lr]: { loss, ...fate } }
}
const triedCount = computed(() => Object.keys(tried.value).length)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 수축 인자 기계 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① · 수축 인자 기계: 운명은 곱셈 하나로 결정된다</p>
    <p class="mb-3 text-xs text-slate-500">
      이차 골짜기에서 한 스텝마다 오차(목표까지의 거리)에는 <b>1 − 보폭×곡률</b>이 곱해집니다.
      두 다이얼을 돌려 이 배율의 절대값을 지켜보세요.
    </p>

    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block text-xs text-slate-500">
        골짜기의 곡률 c = <b class="text-slate-700">{{ c1.toFixed(1) }}</b> (클수록 좁고 가파름)
        <input v-model.number="c1" type="range" min="0.5" max="4" step="0.1" class="mt-1 w-full accent-amber-600" />
      </label>
      <label class="block text-xs text-slate-500">
        보폭(학습률) lr = <b class="text-slate-700">{{ lr1.toFixed(2) }}</b>
        <input v-model.number="lr1" type="range" min="0.05" max="2.5" step="0.01" class="mt-1 w-full accent-indigo-600" />
      </label>
    </div>

    <div class="mt-3 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-xs text-slate-500">수축 인자 |1 − lr·c|</p>
        <p class="font-mono text-xl font-bold" :class="factor < 1 ? 'text-emerald-700' : 'text-rose-700'">{{ factor.toFixed(2) }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-xs text-slate-500">발산 경계 2/c</p>
        <p class="font-mono text-xl font-bold text-amber-700">{{ boundary.toFixed(2) }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-xs text-slate-500">한 방 도착 1/c</p>
        <p class="font-mono text-xl font-bold text-indigo-600">{{ oneShot.toFixed(2) }}</p>
      </div>
    </div>

    <!-- 12스텝 손실 스파크라인 -->
    <div class="mt-2 rounded-lg bg-slate-50 p-2">
      <p class="mb-1 text-xs text-slate-500">12스텝 손실 곡선 (300에서 절단)</p>
      <svg viewBox="0 0 270 68" class="h-16 w-full">
        <polyline :points="spark" fill="none" :stroke="factor < 1 ? 'var(--c-emerald-600)' : 'var(--c-rose-600)'" stroke-width="2" />
      </svg>
    </div>
    <p class="mt-2 rounded-lg bg-slate-50 p-3 text-sm font-medium" :class="verdict1.tone">{{ verdict1.label }}</p>

    <p class="mt-3 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      💡 곡률을 <b>2.0</b>에 두면 경계가 정확히 <b>1.00</b>. 워밍업의 그 미스터리가 풀립니다
      (그 골짜기의 곡률이 2였던 거예요). 그리고 곡률을 올려 보세요. <b>경계가 내려옵니다</b>:
      가파른 골짜기일수록 허용되는 보폭이 작다는 것, 이게 이 장의 심장입니다.
    </p>

    <!-- ② lr 스위프 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② · 실전 상황: 곡률을 모르는 골짜기에서 보폭 고르기</p>
    <p class="mb-3 text-xs text-slate-500">
      이번 골짜기의 곡률은 <b>비공개</b>입니다(실전이 늘 그렇듯). 후보 보폭들을 10스텝씩 시험해
      좋은 보폭을 찾아보세요. 후보가 로그 스케일(×3씩)인 것에 주목.
    </p>

    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="lr in SWEEP"
        :key="lr"
        type="button"
        class="rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition"
        :class="tried[lr] ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-500'"
        :disabled="!!tried[lr]"
        @click="trySweep(lr)"
      >
        lr {{ lr }}
      </button>
    </div>

    <div v-if="triedCount > 0" class="space-y-1">
      <div v-for="lr in SWEEP.filter((l) => tried[l])" :key="lr" class="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs">
        <span class="w-16 shrink-0 font-mono font-semibold text-slate-600">lr {{ lr }}</span>
        <span class="w-32 shrink-0 font-mono text-slate-500">손실 {{ tried[lr].loss > 9999 ? '∞급' : tried[lr].loss.toFixed(3) }}</span>
        <span class="min-w-0 flex-1 font-medium" :class="tried[lr].tone">{{ tried[lr].fate }}</span>
      </div>
    </div>

    <button
      v-if="triedCount >= 4 && !revealed"
      type="button"
      class="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-400"
      @click="revealed = true"
    >
      🔍 지형 공개: 곡률은 얼마였나
    </button>
    <p v-if="revealed" class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-800">
      ✅ 곡률 c = <b>0.8</b>. 그래서 경계는 2/0.8 = <b>2.5</b>(3.0이 폭발한 이유),
      한 방 도착은 1/0.8 = <b>1.25</b>(1.0이 가장 좋았던 이유)였습니다.
      실전에서도 이렇게 <b>로그 스케일로 훑어 자릿수부터 찾는 것</b>(lr 스위프)이 표준 요령이에요.
      0.01과 0.03의 차이보다 0.01과 1.0의 차이가 운명을 가르니까요.
    </p>
  </div>
</template>
