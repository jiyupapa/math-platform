<script setup lang="ts">
// 9장 실험실 — 같은 10단계 일을 네 가지 팀 구성으로 맡겨 보는 완전 해석적 비교기.
// 난수 없음(결정적): 모든 수치는 공식 계산 — 혼자 p^10, 분업 p^10·q^h, 검토+재작성(베이즈).
// 기본값 검증치: A 34.9% / B(q=0.95) 31.5% / C(q=0.99) 34.2% / D(s=0.9,t=0.8) 48.8%·신뢰도 70.7%
import { ref, computed } from 'vue'

const P_STEP = 0.9 // 걸음 정확도(워밍업·2장과 동일)
const N = 10 // 단계 수
const SOLO = Math.pow(P_STEP, N) // 0.34868

const q = ref(0.95) // 전달 정확도
const s = ref(0.9) // 검토자 민감도 (맞는 결과를 통과시킬 확률)
const t = ref(0.8) // 검토자 특이도 (틀린 결과를 걸러낼 확률)
const boost = ref(false) // 분업 → 컨텍스트 분리로 걸음 정확도 0.90 → 0.92 시나리오

const divide = computed(() => {
  const step = boost.value ? 0.92 : P_STEP
  return Math.pow(step, N) * q.value * q.value
})
const divideRef99 = computed(() => {
  const step = boost.value ? 0.92 : P_STEP
  return Math.pow(step, N) * 0.99 * 0.99
})
// D — 작성 1 + 검토 1, 거부되면 재작성 1회(최대 2회 작성, 통과분만 제출)
const reject1 = computed(() => SOLO * (1 - s.value) + (1 - SOLO) * t.value)
const review = computed(() => SOLO * s.value * (1 + reject1.value))
// 제출물 신뢰도 — 통과한 결과가 정답일 확률(6장 베이즈)
const precision = computed(
  () => (SOLO * s.value) / (SOLO * s.value + (1 - SOLO) * (1 - t.value)),
)

const cards = computed(() => [
  { key: 'A', name: '혼자 10단계', desc: '한 명이 처음부터 끝까지', value: SOLO, note: '0.9¹⁰, 워밍업의 그 수' },
  { key: 'B', name: '2명 분업 + 전달 2회', desc: `5단계씩 나눠 맡고 주고받기 (q=${q.value.toFixed(2)})`, value: divide.value, note: boost.value ? '0.92¹⁰ × q² (걸음이 좋아진 분업)' : '0.9¹⁰ × q² (전달도 걸음이다)' },
  { key: 'C', name: '분업 + 정성 들인 전달', desc: '전달 정확도 99%로 고정한 비교 기준', value: divideRef99.value, note: boost.value ? '0.92¹⁰ × 0.99²' : '0.9¹⁰ × 0.99² (그래도 혼자보다 낮다)' },
  { key: 'D', name: '작성 1 + 검토 1', desc: `검토 통과만 제출, 거부 시 재작성 1회 (s=${s.value.toFixed(2)}, t=${t.value.toFixed(2)})`, value: review.value, note: '구조가 만든 역전' },
])
const best = computed(() => cards.value.reduce((a, b) => (b.value > a.value ? b : a)).key)

const pct = (v: number) => (v * 100).toFixed(1)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-500">① 같은 일(걸음 정확도 90% · 10단계), 네 가지 팀 구성</p>
    <div class="mb-4 grid gap-2 sm:grid-cols-2">
      <div
        v-for="c in cards"
        :key="c.key"
        class="rounded-lg border p-3"
        :class="best === c.key ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300' : 'border-slate-200 bg-slate-50'"
      >
        <div class="flex items-baseline justify-between gap-2">
          <p class="text-sm font-semibold text-slate-700">{{ c.key }}. {{ c.name }}</p>
          <p class="font-mono text-lg font-bold" :class="best === c.key ? 'text-emerald-700' : 'text-slate-800'">{{ pct(c.value) }}%</p>
        </div>
        <p class="text-xs text-slate-500">{{ c.desc }}</p>
        <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
          <div class="h-full rounded-full" :class="best === c.key ? 'bg-emerald-400' : 'bg-indigo-300'" :style="{ width: pct(c.value) + '%' }" />
        </div>
        <p class="mt-1 text-xs text-slate-500">{{ c.note }}</p>
        <p v-if="c.key === 'D'" class="mt-1 text-xs font-medium text-indigo-600">
          제출물 신뢰도(통과분이 정답일 확률) {{ pct(precision) }}% (6장 베이즈)
        </p>
      </div>
    </div>

    <p class="mb-1 text-sm font-semibold text-slate-500">② 다이얼: 전달과 검토의 품질</p>
    <div class="space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
      <label class="flex items-center gap-3">
        <span class="w-44 shrink-0 text-slate-600">전달 정확도 q = {{ q.toFixed(2) }}</span>
        <input v-model.number="q" type="range" min="0.9" max="1" step="0.01" class="flex-1 accent-indigo-600" />
      </label>
      <label class="flex items-center gap-3">
        <span class="w-44 shrink-0 text-slate-600">검토자 민감도 s = {{ s.toFixed(2) }}</span>
        <input v-model.number="s" type="range" min="0.7" max="1" step="0.01" class="flex-1 accent-indigo-600" />
      </label>
      <label class="flex items-center gap-3">
        <span class="w-44 shrink-0 text-slate-600">검토자 특이도 t = {{ t.toFixed(2) }}</span>
        <input v-model.number="t" type="range" min="0.5" max="1" step="0.01" class="flex-1 accent-indigo-600" />
      </label>
      <p class="text-xs text-slate-500">
        민감도 = 맞는 결과를 통과시킬 확률 · 특이도 = 틀린 결과를 걸러낼 확률 (6장의 그 다이얼).
      </p>
    </div>

    <p
      class="mt-3 rounded-md px-3 py-2 text-sm font-medium"
      :class="best === 'D' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'"
    >
      <template v-if="best === 'D'">
        지금 1등은 <b>D(작성+검토)</b>. 머릿수를 늘린 B·C가 아니라 <b>구조를 바꾼 팀</b>이 이깁니다.
        전달(q)이 1이 아닌 한, 분업은 확률로는 혼자를 넘지 못해요(q² &lt; 1).
      </template>
      <template v-else>
        분업이 앞섰네요. 걸음 정확도가 올라간 효과입니다. 같은 걸음이라면 분업은 전달의 곱만큼 항상 손해예요.
      </template>
    </p>

    <label class="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input v-model="boost" type="checkbox" class="h-4 w-4 accent-indigo-600" />
      <span><b>분업의 숨은 이득 켜기</b>: 각자 맡은 몫이 작아져(서류 더미 축소, 10장) 걸음 정확도가 90 → 92%로 오른다면?</span>
    </label>
    <p v-if="boost" class="mt-2 rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
      걸음이 92%로 오르면 분업(전달 99%)이 <b>{{ pct(0.92 ** 10 * 0.99 ** 2) }}%</b>로 혼자(34.9%)를 드디어 넘습니다.
      분업의 진짜 이득은 전달이 아니라 <b>걸음 자체를 좋게 만드는 것</b>(작은 컨텍스트·전문화)과 <b>병렬 시간</b>이에요.
    </p>
  </div>
</template>
