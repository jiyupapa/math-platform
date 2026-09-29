<script setup lang="ts">
// 5장 실험실 — 같은 문제를 여러 표에게 풀게 해 다수결의 힘(이항 합)과 그 전제(p>50%·독립)를
// 직접 확인한다. 난수 없는 완전 해석적 계산기 — 이항 다수결 공식과 상관 모형(ρ로 복사)만 쓴다.
// 수치는 노트북(ch05_vote.ipynb)의 assert 와 일치: maj(0.7,5)=0.83692, maj(0.4,5)=0.31744 등.
import { ref, computed } from 'vue'

const KS = [1, 3, 5, 9, 15]

const p = ref(0.7) // 한 표(개별)의 정답률
const k = ref(5) // 투표자 수 (동수가 없게 홀수만)
const rho = ref(0) // 상관 — 확률 ρ로 전원이 한 표를 복사

function comb(n: number, r: number): number {
  let out = 1
  for (let i = 0; i < r; i++) out = (out * (n - i)) / (i + 1)
  return out
}
/** 과반 이상이 정답일 확률 — 이항 합 */
function majority(pv: number, kv: number): number {
  const m = Math.floor(kv / 2) + 1
  let s = 0
  for (let i = m; i <= kv; i++) s += comb(kv, i) * Math.pow(pv, i) * Math.pow(1 - pv, kv - i)
  return s
}

const indep = computed(() => majority(p.value, k.value))
// 상관 모형: 확률 ρ로 전원이 같은 답을 복사(그 답의 정답률 = p), 1−ρ로 독립 투표
const withCorr = computed(() => rho.value * p.value + (1 - rho.value) * indep.value)
const gain = computed(() => (withCorr.value - p.value) * 100)

const showCurve = ref(false)
const curveRows = computed(() => KS.map((kv) => ({ kv, pct: majority(p.value, kv) * 100 })))

const pct = (v: number) => (v * 100).toFixed(1)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 한 표의 정답률 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 한 표의 정답률: 풀이 하나가 정답을 맞힐 확률</p>
    <div class="mb-4 flex items-center gap-3">
      <input v-model.number="p" type="range" min="0.3" max="0.95" step="0.05" class="flex-1 accent-indigo-600" />
      <span class="w-14 shrink-0 text-right font-mono text-sm font-bold" :class="p < 0.5 ? 'text-rose-700' : 'text-slate-800'">{{ Math.round(p * 100) }}%</span>
    </div>

    <!-- ② 투표자 수 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">② 투표자 수: 같은 문제를 몇 번 풀게 할까 (동수가 없게 홀수만)</p>
    <div class="mb-3 flex flex-wrap items-center gap-1.5">
      <button
        v-for="v in KS"
        :key="v"
        type="button"
        class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
        :class="k === v ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="k = v"
      >
        {{ v }}표
      </button>
    </div>

    <div class="space-y-3 rounded-lg bg-slate-50 p-4">
      <div v-for="(row, i) in [
        { label: '한 표', v: p * 100, color: 'bg-slate-400' },
        { label: '다수결', v: withCorr * 100, color: withCorr >= p ? 'bg-indigo-500' : 'bg-rose-500' },
      ]" :key="i" class="flex items-center gap-3">
        <span class="w-14 shrink-0 text-sm font-semibold text-slate-600">{{ row.label }}</span>
        <div class="relative h-7 flex-1 overflow-hidden rounded-md bg-white ring-1 ring-slate-200">
          <div class="h-full rounded-md transition-all duration-300" :class="row.color" :style="{ width: row.v + '%' }" />
          <div class="absolute top-0 h-full border-l-2 border-dashed border-slate-500" style="left: 50%" />
        </div>
        <span class="w-16 shrink-0 text-right font-mono text-sm font-bold text-slate-800">{{ row.v.toFixed(1) }}%</span>
      </div>
      <p class="text-xs text-slate-500">점선 = 50% (다수결이 도움이 되는지의 분수령)</p>

      <p
        class="rounded-md px-3 py-2 text-sm font-medium"
        :class="p < 0.5 ? 'bg-rose-50 text-rose-800' : gain > 0.05 ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'"
      >
        <template v-if="p < 0.5">
          ⚠️ 역전: 한 표가 50% 미만이면 다수결은 <b>틀린 답으로 수렴</b>합니다
          ({{ Math.round(p * 100) }}% → {{ pct(withCorr) }}%). 못하는 일꾼을 모아 봐야 더 못해져요.
        </template>
        <template v-else-if="gain > 0.05">
          ✅ {{ Math.round(p * 100) }}%짜리 한 표가 {{ k }}표 다수결로 <b>{{ pct(withCorr) }}%</b>가 됐습니다
          (+{{ gain.toFixed(1) }}%p).
        </template>
        <template v-else>🤝 표가 1개거나 상관이 커서 다수결의 이득이 거의 없습니다.</template>
      </p>
    </div>

    <!-- ③ 상관 다이얼 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">③ 표끼리 닮은 정도(상관): 확률 ρ로 전원이 한 표를 그대로 복사한다면</p>
    <div class="rounded-lg bg-slate-50 p-4">
      <div class="flex items-center gap-3">
        <span class="text-xs text-slate-500">독립</span>
        <input v-model.number="rho" type="range" min="0" max="1" step="0.1" class="flex-1 accent-rose-500" />
        <span class="text-xs text-slate-500">완전 복사</span>
        <span class="w-12 shrink-0 text-right font-mono text-sm font-bold text-slate-800">ρ={{ rho.toFixed(1) }}</span>
      </div>
      <p class="mt-2 text-sm" :class="rho > 0 ? 'text-rose-700' : 'text-slate-500'">
        <template v-if="rho === 0">지금은 모든 표가 독립이라 이항 다수결의 이론값 그대로입니다.</template>
        <template v-else>
          독립이라면 <b>{{ pct(indep) }}%</b>였을 다수결이, 표끼리 닮으면(ρ={{ rho.toFixed(1) }})
          <b>{{ pct(withCorr) }}%</b>로 깎입니다. ρ=1이면 회의는 그냥 <b>한 표</b>({{ Math.round(p * 100) }}%)와 같아요.
        </template>
      </p>
    </div>

    <!-- ④ 곡선 보기 -->
    <label class="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input v-model="showCurve" type="checkbox" class="h-4 w-4 accent-indigo-600" />
      <span><b>표 수별 이론값 보기</b>: 독립 가정(ρ=0)에서 다수결 정답률이 어떻게 크는지</span>
    </label>
    <div v-if="showCurve" class="mt-2 space-y-1.5 rounded-md bg-amber-50 px-3 py-2">
      <div v-for="row in curveRows" :key="row.kv" class="flex items-center gap-2 text-sm text-amber-900">
        <span class="w-12 shrink-0 text-right font-mono">{{ row.kv }}표</span>
        <div class="h-3.5 flex-1 overflow-hidden rounded bg-white/70">
          <div class="h-full rounded" :class="p < 0.5 ? 'bg-rose-400' : 'bg-amber-400'" :style="{ width: row.pct + '%' }" />
        </div>
        <span class="w-14 shrink-0 font-mono text-xs">{{ row.pct.toFixed(1) }}%</span>
      </div>
      <p class="pt-1 text-xs text-amber-800">
        <template v-if="p >= 0.5">표가 늘수록 좋아지지만 <b>수확은 체감</b>합니다. 그리고 표 하나하나가 전부 비용(토큰)이에요.</template>
        <template v-else>50% 미만에선 표가 늘수록 <b>나빠집니다</b>. 다수결의 전제 조건을 확인하세요.</template>
      </p>
    </div>
  </div>
</template>
