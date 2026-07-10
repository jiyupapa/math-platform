<script setup lang="ts">
// ch8 인터랙티브 — ① rank 미니 실험(표의 진짜 정보량) ② LoRA 파라미터 계산기.
// 오프라인·결정적.
import { ref, computed } from 'vue'

// ── ① rank 직관: 숫자 16개짜리 표, 정보는 몇 개? ──────────────────
const BASE_ROW = [2, 1, 3, 5]
const MULTIPLIERS = [1, 2, 10, -3]
const TABLE = MULTIPLIERS.map((m) => BASE_ROW.map((v) => v * m))
const revealed = ref(false)

// ── ② LoRA 파라미터 계산기 ──────────────────────────────────────
const D_OPTIONS = [1024, 4096]
const d = ref(4096)
const R_PRESETS = [1, 8, 64]
const r = ref(8)

const fullParams = computed(() => d.value * d.value)
const loraParams = computed(() => 2 * d.value * r.value)
const ratio = computed(() => Math.round(fullParams.value / loraParams.value))
const fmtNum = (n: number) =>
  n >= 1_000_000 ? `${(Math.round(n / 100_000) / 10).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 100) / 10}K` : `${n}`

const obs = computed(() => {
  if (r.value <= 2)
    return 'r 이 아주 작으면 극단적으로 가볍지만, 배울 수 있는 변화의 "방향 수"도 그만큼 적어요 — 복잡한 조련에는 용량이 모자랄 수 있습니다.'
  if (r.value <= 16)
    return '실무에서 가장 흔한 구간(r 4~16). 조련이 만드는 변화 대부분을 담으면서도 수백 배 가볍습니다.'
  return 'r 을 키우면 용량은 늘지만 절약 배율이 줄어요 — 전체 파인튜닝에 다가가는 중. 필요한 만큼만 쓰는 게 요령.'
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① rank 미니 실험 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 이 표(행렬)의 진짜 정보량은 몇 개일까요?</p>
    <p class="mb-3 text-xs text-slate-400">숫자 16개짜리 표입니다. 행들을 가만히 비교해 보세요.</p>

    <div class="mb-3 inline-block overflow-hidden rounded-lg border border-slate-200">
      <table class="text-center font-mono text-sm">
        <tbody>
          <tr v-for="(row, i) in TABLE" :key="i" :class="revealed ? (i === 0 ? 'bg-indigo-50' : 'bg-amber-50/60') : ''">
            <td v-for="(v, j) in row" :key="j" class="border border-slate-100 px-4 py-1.5 text-slate-700">{{ v }}</td>
            <td v-if="revealed" class="border-0 pl-3 text-left text-xs font-sans" :class="i === 0 ? 'text-indigo-600 font-semibold' : 'text-amber-600'">
              {{ i === 0 ? '기준 행' : `= 기준 행 × ${MULTIPLIERS[i]}` }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div>
      <button
        v-if="!revealed"
        type="button"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        @click="revealed = true"
      >
        비밀 공개 🔍
      </button>
      <p v-else class="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
        👀 모든 행이 <b>기준 행 하나의 배수</b>였어요! 숫자는 16개지만 진짜 정보는
        기준 행 4개 + 배수 4개 = <b>8개뿐</b>. 이런 표의 <b>rank(진짜 정보의 방향 수)는 1</b>입니다.
        표가 아무리 커도 rank 가 낮으면 — <b>얇은 두 조각(열 하나 × 행 하나)의 곱</b>으로
        통째로 복원할 수 있어요. 이게 LoRA 의 심장입니다.
      </p>
    </div>

    <!-- ② LoRA 파라미터 계산기 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — LoRA 파라미터 계산기: 얼마나 가벼워지나</p>
    <p class="mb-3 text-xs text-slate-400">거대 행렬 W(d×d)는 얼리고 🧊, 변화분 ΔW = B(d×r)·A(r×d)만 학습합니다.</p>

    <div class="mb-3 flex flex-wrap items-center gap-2 text-sm">
      <span class="text-slate-600">행렬 크기 d =</span>
      <button
        v-for="opt in D_OPTIONS"
        :key="opt"
        type="button"
        class="rounded-lg border px-3 py-1.5 transition"
        :class="d === opt ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
        @click="d = opt"
      >
        {{ opt.toLocaleString() }}
      </button>
      <span class="ml-3 text-slate-600">rank r =</span>
      <button
        v-for="p in R_PRESETS"
        :key="p"
        type="button"
        class="rounded-lg border px-3 py-1.5 transition"
        :class="r === p ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
        @click="r = p"
      >
        {{ p }}
      </button>
      <input v-model.number="r" type="range" min="1" max="64" step="1" class="w-36 accent-indigo-600" />
      <span class="font-mono text-slate-500">{{ r }}</span>
    </div>

    <!-- 시각화: 얼린 W + 얇은 B·A -->
    <div class="mb-3 flex items-end gap-3">
      <div class="flex flex-col items-center">
        <div class="flex h-28 w-28 items-center justify-center rounded-lg border-2 border-sky-200 bg-sky-50 text-3xl">🧊</div>
        <span class="mt-1 text-[11px] text-slate-500">W (얼림 — 학습 안 함)</span>
      </div>
      <span class="pb-10 text-lg text-slate-400">+</span>
      <div class="flex items-end gap-1">
        <div class="flex flex-col items-center">
          <div class="w-4 rounded bg-indigo-500 transition-all" :style="{ height: `${112}px` }" />
          <span class="mt-1 text-[11px] text-slate-500">B</span>
        </div>
        <span class="pb-10 text-slate-400">·</span>
        <div class="flex flex-col items-center">
          <div class="h-4 rounded bg-indigo-500 transition-all" :style="{ width: `${112}px` }" />
          <span class="mt-1 text-[11px] text-slate-500">A</span>
        </div>
      </div>
    </div>

    <div class="grid gap-2 sm:grid-cols-3">
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-[11px] font-semibold text-slate-400">전체 파인튜닝 (W 전부)</p>
        <p class="text-xl font-bold text-slate-800">{{ fmtNum(fullParams) }}<span class="text-xs font-normal text-slate-400"> 개</span></p>
      </div>
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-[11px] font-semibold text-slate-400">LoRA (B + A 만)</p>
        <p class="text-xl font-bold text-indigo-700">{{ fmtNum(loraParams) }}<span class="text-xs font-normal text-slate-400"> 개</span></p>
      </div>
      <div class="rounded-lg bg-emerald-50 p-3">
        <p class="text-[11px] font-semibold text-emerald-500">절약 배율</p>
        <p class="text-xl font-bold text-emerald-600">×{{ ratio.toLocaleString() }}</p>
      </div>
    </div>
    <p class="mt-2 rounded-lg bg-sky-50 p-3 text-sm text-sky-800">👀 {{ obs }}</p>
  </div>
</template>
