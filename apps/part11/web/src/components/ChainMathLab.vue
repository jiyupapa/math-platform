<script setup lang="ts">
// 2장 실험실 — 단계마다 정확도가 다른 5단계 업무 사슬의 전체 성공률(곱)을 조작하며
// "병목이 전체를 지배한다"를 목격한다. 완전 결정적(난수 없음 — 순수 곱셈).
// 기본값: 0.99 × 0.95 × 0.90 × 0.99 × 0.70 = 0.58659 ≈ 58.7% (노트북 ch02_chain.ipynb 와 동일)
import { ref, computed } from 'vue'

const NAMES = ['자료 검색', '수치 추출', '표 만들기', '요약', '형식 맞추기']
const DEFAULTS = [0.99, 0.95, 0.9, 0.99, 0.7]

const ps = ref([...DEFAULTS])
const lastExp = ref<'none' | 'bottleneck' | 'good'>('none')

const total = computed(() => ps.value.reduce((a, b) => a * b, 1))
const bottleneckIdx = computed(() => ps.value.indexOf(Math.min(...ps.value)))

// 로그 보기 — 각 단계의 −log₁₀ p (감쇠 기여). 합 = 전체의 −log₁₀ P
const showLog = ref(false)
const logRows = computed(() =>
  ps.value.map((p, i) => ({ name: NAMES[i], p, nlog: -Math.log10(p) })),
)
const nlogSum = computed(() => -Math.log10(total.value))

function experiment(kind: 'bottleneck' | 'good') {
  ps.value = [...DEFAULTS]
  if (kind === 'bottleneck') ps.value[4] = 0.9 // 병목(0.70)만 0.90 으로
  else ps.value[0] = 0.999 // 이미 좋은 단계(0.99)를 0.999 로
  lastExp.value = kind
}
function reset() {
  ps.value = [...DEFAULTS]
  lastExp.value = 'none'
}
const pct = (v: number) => (v * 100).toFixed(1)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 사슬 조작 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 가상 업무 "주간 보고서" — 다섯 단계의 정확도를 직접 움직여 보세요</p>
    <div class="space-y-2 rounded-lg bg-slate-50 p-4">
      <div v-for="(name, i) in NAMES" :key="name" class="flex items-center gap-3">
        <span
          class="w-24 shrink-0 text-sm"
          :class="i === bottleneckIdx ? 'font-bold text-rose-700' : 'font-medium text-slate-700'"
        >
          {{ name }}
          <span v-if="i === bottleneckIdx" class="block text-[10px] font-semibold text-rose-500">🔗 병목</span>
        </span>
        <input
          v-model.number="ps[i]"
          type="range"
          min="0.5"
          max="1"
          step="0.01"
          class="flex-1 accent-indigo-600"
        />
        <span
          class="w-14 shrink-0 text-right font-mono text-sm font-bold"
          :class="i === bottleneckIdx ? 'text-rose-700' : 'text-slate-800'"
        >{{ pct(ps[i]) }}%</span>
      </div>
    </div>

    <!-- ② 전체 성공률 -->
    <div class="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-indigo-50 px-4 py-3">
      <span class="text-sm font-semibold text-indigo-900">일 전체의 성공률 = 다섯 확률의 곱</span>
      <div class="h-4 min-w-32 flex-1 overflow-hidden rounded-full bg-white">
        <div class="h-full rounded-full bg-indigo-500 transition-all duration-300" :style="{ width: total * 100 + '%' }" />
      </div>
      <span class="font-mono text-lg font-bold text-indigo-800">{{ pct(total) }}%</span>
    </div>
    <p class="mt-1 text-xs text-slate-400">
      기본값 기준 0.99 × 0.95 × 0.90 × 0.99 × 0.70 = 58.7% — 네 단계가 우등생이어도 한 단계가 전체를 끌어내립니다.
    </p>

    <!-- ③ 개선 실험 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">② 같은 노력, 다른 효과 — 어느 단계를 개선할까</p>
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-800 hover:bg-rose-100"
        @click="experiment('bottleneck')"
      >
        🔗 병목만 개선 (0.70 → 0.90)
      </button>
      <button
        type="button"
        class="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        @click="experiment('good')"
      >
        ✨ 이미 좋은 단계 개선 (0.99 → 0.999)
      </button>
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
        @click="reset"
      >
        ↺ 원래대로
      </button>
    </div>
    <p
      v-if="lastExp !== 'none'"
      class="mt-2 rounded-md px-3 py-2 text-sm font-medium"
      :class="lastExp === 'bottleneck' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'"
    >
      <template v-if="lastExp === 'bottleneck'">
        58.7% → <b>{{ pct(total) }}%</b> (+16.7%p) — 병목 하나를 고쳤을 뿐인데 성공률이 껑충 뛰었습니다.
      </template>
      <template v-else>
        58.7% → <b>{{ pct(total) }}%</b> (+0.5%p) — 이미 좋은 단계를 더 갈고닦아도 전체는 거의 그대로예요.
      </template>
    </p>

    <!-- ④ 로그 보기 -->
    <label class="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input v-model="showLog" type="checkbox" class="h-4 w-4 accent-indigo-600" />
      <span><b>로그로 보기</b> — 곱의 세계를 합의 세계로 (막대 = 각 단계의 −log₁₀, 클수록 감쇠 기여가 큼)</span>
    </label>
    <div v-if="showLog" class="mt-2 space-y-1.5 rounded-md bg-amber-50 px-3 py-2">
      <div v-for="row in logRows" :key="row.name" class="flex items-center gap-2 text-sm text-amber-900">
        <span class="w-24 shrink-0 text-right text-xs">{{ row.name }}</span>
        <div class="h-3.5 flex-1 overflow-hidden rounded bg-white/70">
          <div class="h-full rounded bg-amber-500" :style="{ width: Math.min((row.nlog / 0.31) * 100, 100) + '%' }" />
        </div>
        <span class="w-16 shrink-0 font-mono text-xs">{{ row.nlog.toFixed(4) }}</span>
      </div>
      <p class="pt-1 text-xs text-amber-800">
        막대의 합 = {{ nlogSum.toFixed(4) }} = 전체의 −log₁₀ — 곱셈이 <b>덧셈</b>이 되어
        "누가 성공률을 갉아먹는지"를 한눈에 비교할 수 있어요. 가장 긴 막대가 병목입니다.
      </p>
    </div>
  </div>
</template>
