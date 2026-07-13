<script setup lang="ts">
// 🎯 캡스톤 실험실 — "이 에이전트, 도입해도 되나": 가상 제품 '일손 2' 도입 제안서를 검산대 4곳에서 감정.
// 새 개념 없음 — 1~11장의 도구 총조립. 전 수치 사전 검증(결정적, 난수 없음):
//   ① 0.98^12=78.5%(4/8/12/20단계=92.3/85.1/78.5/66.8) ② 98/√20≈±21.9%p([68.1,100+]), 200건 ±6.9
//   ③ pass@5=97% → pass@1=1−0.03^(1/5)≈50.4% ④ 베이즈 s=0.9·t=0.8: p=80/35/5% → 94.7/70.8/19.1%
import { ref, computed } from 'vue'

const revealed = ref<Record<string, boolean>>({ s1: false, s2: false, s3: false, s4: false })
const allDone = computed(() => Object.values(revealed.value).every(Boolean))
function reveal(id: 's1' | 's2' | 's3' | 's4') {
  revealed.value[id] = true
}

// ① 사슬 검산 — 단계 수 다이얼
const STEP_OPTS = [4, 8, 12, 20]
const steps = ref(12)
const chainPct = computed(() => Math.pow(0.98, steps.value) * 100)

// ② 성적표 ± — 과업 수 다이얼 (냅킨 공식 98/√n, 최악값 기준)
const N_OPTS = [20, 50, 200, 1000]
const nTasks = ref(20)
const margin = computed(() => 98 / Math.sqrt(nTasks.value))
const lo = computed(() => 90 - margin.value)
const hi = computed(() => Math.min(90 + margin.value, 100))
const hiOverflow = computed(() => 90 + margin.value > 100)

// ③ pass@k 역산 — pass@5 슬라이더 → pass@1
const pass5 = ref(97)
const pass1 = computed(() => (1 - Math.pow(1 - pass5.value / 100, 1 / 5)) * 100)

// ④ 검수의 실체 — 기저율 프리셋 → 베이즈 사후확률 (검수자 민감도 0.9·특이도 0.8)
const BASE_PRESETS = [
  { key: 'easy', label: '쉬운 업무', p: 0.8 },
  { key: 'mid', label: '보통 업무', p: 0.35 },
  { key: 'hard', label: '어려운 업무', p: 0.05 },
]
const baseKey = ref('mid')
const baseP = computed(() => BASE_PRESETS.find((b) => b.key === baseKey.value)!.p)
const posterior = computed(() => {
  const p = baseP.value
  return (p * 0.9) / (p * 0.9 + (1 - p) * 0.2) * 100
})

const fmt1 = (v: number) => v.toFixed(1)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- 제안서 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">📄 감정 대상 — 가상 도입 제안서 (오늘 회의 안건으로 올라온 그것)</p>
    <div class="mb-4 rounded-xl bg-slate-900 p-4 text-sm leading-relaxed text-slate-200">
      <p class="mb-1 text-base font-bold text-white">누리웍스 사무 에이전트 ‘일손 2’ — 전사 도입 제안</p>
      <p>
        일손 2는 자료 조사부터 보고서 작성까지 사무 업무를 스스로 처리하는 AI 일꾼입니다.
        각 단계 정확도 <b class="text-amber-300">98%</b> — <b class="text-amber-300">어떤 업무든 믿고 맡기세요.</b>
        <span class="text-indigo-300">[주장 ①]</span>
      </p>
      <p class="mt-1.5">
        도입 데모에서 대표 업무 <b class="text-amber-300">20건 중 18건</b>을 성공적으로 완수했습니다
        (<b class="text-amber-300">성공률 90%</b>). <span class="text-indigo-300">[주장 ②]</span>
        업계 표준 지표로도 <b class="text-amber-300">pass@5 = 97%</b>의 검증된 성능을 보입니다.
        <span class="text-indigo-300">[주장 ③]</span>
      </p>
      <p class="mt-1.5">
        게다가 <b class="text-amber-300">자체 검수 AI</b>가 모든 결과물을 이중 확인하여,
        <b class="text-amber-300">통과한 작업만 제출</b>합니다 — 믿고 맡기셔도 됩니다.
        <span class="text-indigo-300">[주장 ④]</span>
      </p>
    </div>

    <p class="mb-2 text-sm font-semibold text-slate-500">🔍 검산대 4곳 — 버튼을 눌러 하나씩 감정하세요 (다이얼을 직접 돌려 보세요)</p>
    <div class="space-y-3">
      <!-- 검산대 ① -->
      <div class="rounded-lg border border-slate-200 p-3.5">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-bold text-slate-700">검산대 ① “각 단계 98%” — 업무 성공률로 환산하면 (워밍업·2장)</p>
          <button v-if="!revealed.s1" type="button" class="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500" @click="reveal('s1')">검산하기</button>
          <span v-else class="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">⚠ 조건부 — 과장</span>
        </div>
        <div v-if="revealed.s1" class="mt-2 space-y-2 text-sm text-slate-600">
          <p>사내 대표 업무는 여러 단계입니다. 걸음 98%를 <b>단계 수</b>만큼 곱해 보세요:</p>
          <div class="flex flex-wrap items-center gap-1.5">
            <button v-for="v in STEP_OPTS" :key="v" type="button" class="rounded-lg border px-2.5 py-1 text-sm transition-colors" :class="steps === v ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'" @click="steps = v">{{ v }}단계</button>
            <span class="ml-2 font-mono text-sm font-bold" :class="chainPct < 80 ? 'text-rose-700' : 'text-slate-800'">0.98^{{ steps }} = {{ fmt1(chainPct) }}%</span>
          </div>
          <p>사내 대표 업무 평균 <b>12단계</b>면 <b class="font-mono text-rose-700">78.5%</b> — 5건 중 1건 이상은 실패입니다. “어떤 업무든”이라는 말은 단계 수를 감춘 <b>과장</b>이에요.</p>
        </div>
      </div>

      <!-- 검산대 ② -->
      <div class="rounded-lg border border-slate-200 p-3.5">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-bold text-slate-700">검산대 ② “20건 90%” — 오차범위 안인가 (11장)</p>
          <button v-if="!revealed.s2" type="button" class="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500" @click="reveal('s2')">검산하기</button>
          <span v-else class="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">⚠ 표본 부족 — 보류</span>
        </div>
        <div v-if="revealed.s2" class="mt-2 space-y-2 text-sm text-slate-600">
          <p>데모 <b>과업 수</b>를 바꿔 가며 성적표의 ± 폭을 봅시다 (냅킨 공식 98/√n):</p>
          <div class="flex flex-wrap items-center gap-1.5">
            <button v-for="v in N_OPTS" :key="v" type="button" class="rounded-lg border px-2.5 py-1 text-sm transition-colors" :class="nTasks === v ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'" @click="nTasks = v">{{ v.toLocaleString() }}건</button>
            <span class="ml-2 font-mono text-sm font-bold text-slate-800">±{{ fmt1(margin) }}%p</span>
          </div>
          <p>
            90% ± {{ fmt1(margin) }}%p → 구간 <b class="font-mono" :class="lo < 75 ? 'text-amber-700' : 'text-slate-800'">[{{ fmt1(lo) }}, {{ fmt1(hi) }}<template v-if="hiOverflow">+</template>]</b>.
            <template v-if="nTasks <= 50"> 이 구간은 <b class="text-amber-700">70%짜리 에이전트와도 겹칩니다</b> — 20건 데모로는 성능을 단정할 수 없어요.</template>
            <template v-else> 표본이 커야 ± 가 좁아집니다 — 도입 판단엔 최소 <b>200건</b>(±6.9%p)은 필요합니다.</template>
          </p>
        </div>
      </div>

      <!-- 검산대 ③ -->
      <div class="rounded-lg border border-slate-200 p-3.5">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-bold text-slate-700">검산대 ③ “pass@5 = 97%” — 한 번에 맞을 확률은? (4·11장)</p>
          <button v-if="!revealed.s3" type="button" class="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500" @click="reveal('s3')">검산하기</button>
          <span v-else class="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">⚠ 전제 미충족 — 보류</span>
        </div>
        <div v-if="revealed.s3" class="mt-2 space-y-2 text-sm text-slate-600">
          <p>pass@5는 “5번 시도해 한 번이라도 성공”입니다. <b>pass@1</b>(한 번에 맞을 확률)로 역산해 보세요:</p>
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-500">pass@5</span>
            <input v-model.number="pass5" type="range" min="80" max="99" step="1" class="flex-1 accent-indigo-600" />
            <span class="w-14 shrink-0 text-right font-mono text-sm">{{ pass5 }}%</span>
          </div>
          <p>→ pass@1 = 1 − (1 − {{ (pass5 / 100).toFixed(2) }})^(1/5) = <b class="font-mono text-amber-700">{{ fmt1(pass1) }}%</b></p>
          <p>광고의 97%는 다섯 번 굴린 결과 — 한 번에 맞을 확률은 <b>절반뿐</b>(50.4%)입니다. 게다가 5번 중 옳은 것을 <b>골라내려면</b> 성공을 판별할 수단(테스트·정답 대조)이 우리에게 있어야 하고, 비용도 <b>5배</b>(7장)예요.</p>
        </div>
      </div>

      <!-- 검산대 ④ -->
      <div class="rounded-lg border border-slate-200 p-3.5">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-bold text-slate-700">검산대 ④ “자체 검수로 이중 확인” — 얼마나 믿을 수 있나 (6·9장)</p>
          <button v-if="!revealed.s4" type="button" class="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500" @click="reveal('s4')">검산하기</button>
          <span v-else class="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">⚠ 조건부 — 난이도 의존</span>
        </div>
        <div v-if="revealed.s4" class="mt-2 space-y-2 text-sm text-slate-600">
          <p>“통과했다”는 도장의 신뢰도는 <b>업무 난이도(기저율)</b>에 달렸습니다 (검수자 민감도 0.9·특이도 0.8):</p>
          <div class="flex flex-wrap items-center gap-1.5">
            <button v-for="b in BASE_PRESETS" :key="b.key" type="button" class="rounded-lg border px-2.5 py-1 text-sm transition-colors" :class="baseKey === b.key ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'" @click="baseKey = b.key">{{ b.label }} (p={{ Math.round(b.p * 100) }}%)</button>
            <span class="ml-2 font-mono text-sm font-bold" :class="posterior < 50 ? 'text-rose-700' : 'text-slate-800'">통과 시 정답 {{ fmt1(posterior) }}%</span>
          </div>
          <p>
            <template v-if="baseKey === 'hard'">어려운 업무(p=5%)는 검수를 통과해도 <b class="text-rose-700">19.1%</b>만 정답 — <b>기저율의 역설</b>(6장)입니다. “통과했으니 안심”이 가장 위험한 순간이에요.</template>
            <template v-else-if="baseKey === 'easy'">쉬운 업무(p=80%)면 통과 시 94.7%로 믿을 만합니다 — 하지만 애초에 쉬운 일이었죠.</template>
            <template v-else>보통 업무(p=35%)는 통과해도 70.8% — 검수가 신뢰도를 올리지만 완벽과는 거리가 멉니다.</template>
          </p>
          <p class="text-xs text-slate-500">게다가 검수 AI가 작성 AI와 <b>같은 모델</b>이면 자기 검수의 상관(9장)으로 이보다 더 나쁩니다 — 제안서엔 검수자의 독립성 언급이 없어요.</p>
        </div>
      </div>
    </div>

    <!-- 최종 판정서 -->
    <div v-if="allDone" class="mt-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/60 p-4">
      <p class="mb-2 text-sm font-bold text-indigo-900">📋 최종 판정서 — ‘일손 2’ 도입 제안 감정 결과</p>
      <table class="w-full text-xs">
        <tbody class="divide-y divide-indigo-100">
          <tr><td class="py-1.5 pr-2 font-medium text-slate-700">① 각 단계 98% (“어떤 업무든”)</td><td class="py-1.5 font-bold text-amber-700">12단계면 78.5% — 단계 수 감춘 과장</td></tr>
          <tr><td class="py-1.5 pr-2 font-medium text-slate-700">② 20건 90% 데모</td><td class="py-1.5 font-bold text-amber-700">±21.9%p — 표본 부족, 보류</td></tr>
          <tr><td class="py-1.5 pr-2 font-medium text-slate-700">③ pass@5 97%</td><td class="py-1.5 font-bold text-amber-700">pass@1 50.4% + 검수·비용 전제, 보류</td></tr>
          <tr><td class="py-1.5 pr-2 font-medium text-slate-700">④ 자체 검수 이중 확인</td><td class="py-1.5 font-bold text-amber-700">난이도별 조건부 + 독립성 미확인</td></tr>
        </tbody>
      </table>
      <p class="mt-2 rounded-md bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 ring-1 ring-indigo-100">
        <b>도입 판단:</b> “어떤 업무든 믿고 맡기세요”는 현재 자료로 성립하지 않음 — 수치 조작은
        없었지만 단계 수·표본·pass@k·검수 전제를 감춘 <b>과장</b>. <b>조건부 파일럿 제안</b>:
        성공을 판별할 수 있는(테스트 가능한) 업무부터 <b>200건 시범</b> + <b>독립 검수 설계</b> +
        <b>단계별 성공률 로깅</b>(2장 병목 계측). 🎓 이 판정서를 스스로 쓸 수 있다면 — 11부 졸업입니다.
      </p>
    </div>
    <p v-else class="mt-3 text-center text-xs text-slate-400">검산대 4곳을 모두 감정하면 최종 판정서가 열립니다.</p>
  </div>
</template>
