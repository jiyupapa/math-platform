<script setup lang="ts">
// ch6 인터랙티브 — ① softmax 응급실: 순진한 계산 vs max 빼기 — 로짓이 커져도 확률은 그대로
//                 ② 문장 확률 계산기: 확률을 그대로 곱하기 vs log 로 더하기 — 언더플로 낭떠러지.
// 오프라인·결정적 — Math.fround 로 fp32 재현. 난수 없음.
import { computed, ref } from 'vue'

const f = Math.fround

// ── ① softmax 응급실 ──────────────────────────────────────────
// 로짓 세 개: [x, x−2, x−5] — x 를 키워도 "차이"는 그대로 → 확률도 그대로여야 한다
const xBase = ref(10)
const logits = computed(() => [xBase.value, xBase.value - 2, xBase.value - 5])

function naiveSoftmax(z: number[]): number[] {
  const e = z.map((v) => f(Math.exp(v)))          // exp 를 그대로 — 폭발 위험!
  const s = f(e.reduce((a, b) => f(a + b), 0))
  return e.map((v) => f(v / s))
}
function stableSoftmax(z: number[]): number[] {
  const m = Math.max(...z)
  const e = z.map((v) => f(Math.exp(v - m)))      // max 빼기 — 최대 로짓이 0 이 된다
  const s = f(e.reduce((a, b) => f(a + b), 0))
  return e.map((v) => f(v / s))
}
const er = computed(() => {
  const naive = naiveSoftmax(logits.value)
  const stable = stableSoftmax(logits.value)
  const dead = naive.some((p) => Number.isNaN(p))
  return { naive, stable, dead }
})
const fmtP = (p: number) => (Number.isNaN(p) ? 'NaN' : (p * 100).toFixed(1) + '%')

// ── ② 문장 확률 계산기 ────────────────────────────────────────
const P_OPTS = [0.5, 0.1, 0.01]
const pIdx = ref(1)
const nTok = ref(30)
const sentence = computed(() => {
  const p = P_OPTS[pIdx.value]
  let naive = f(1)
  for (let i = 0; i < nTok.value; i++) naive = f(naive * f(p)) // fp32 로 그대로 곱하기
  const log10p = nTok.value * Math.log10(p)                     // log 세계: 곱 → 합
  return { p, naive, log10p, dead: naive === 0 }
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① softmax 응급실 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — softmax 응급실: 같은 확률, 죽는 계산과 사는 계산</p>
    <p class="mb-3 text-xs text-slate-500">
      로짓 세 개 [x, x−2, x−5] — x 를 키워도 <b>차이는 그대로</b>니 확률도 그대로여야 합니다.
      순진한 softmax(exp 그대로)와 max 빼기 softmax 를 나란히 보세요.
    </p>

    <label class="block text-xs text-slate-500">
      로짓 크기 x = <b class="text-slate-700">{{ xBase }}</b> → 로짓 = [{{ logits.join(', ') }}]
      <input v-model.number="xBase" type="range" min="0" max="120" step="1" class="mt-1 w-full accent-indigo-600" />
    </label>

    <div class="mt-2 grid gap-2 sm:grid-cols-2">
      <div class="rounded-lg p-3" :class="er.dead ? 'bg-rose-50' : 'bg-slate-50'">
        <p class="text-xs font-semibold" :class="er.dead ? 'text-rose-700' : 'text-slate-500'">순진한 softmax — exp(z) 그대로</p>
        <p class="mt-1 font-mono text-sm font-bold" :class="er.dead ? 'text-rose-700' : 'text-slate-700'">
          [{{ er.naive.map(fmtP).join(', ') }}]
        </p>
        <p class="mt-1 text-xs" :class="er.dead ? 'text-rose-700' : 'text-emerald-700'">
          {{ er.dead ? '💀 붕괴 — exp 가 inf 로 폭발, inf/inf = NaN (5장의 변이!)' : '✅ 아직 생존 — x ≈ 89 부터 지켜보세요' }}
        </p>
      </div>
      <div class="rounded-lg bg-emerald-50 p-3">
        <p class="text-xs font-semibold text-emerald-700">max 빼기 softmax — exp(z − max)</p>
        <p class="mt-1 font-mono text-sm font-bold text-emerald-700">
          [{{ er.stable.map(fmtP).join(', ') }}]
        </p>
        <p class="mt-1 text-xs text-emerald-700">✅ 항상 생존 — 최대 로짓이 0 이라 exp ≤ 1, 폭발 불가</p>
      </div>
    </div>

    <p class="mt-2 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      👀 x 를 아무리 움직여도 확률이 <b>[87.6%, 11.9%, 0.6%]</b> 로 똑같죠 — softmax 는 로짓의
      <b>차이만 봅니다</b>(이동 불변성). max 빼기는 그 성질을 이용해 "같은 답을 계산하는,
      터지지 않는 경로"로 갈아타는 것 — 답을 바꾸는 근사가 아니라 <b>공짜 안전장치</b>예요.
    </p>

    <!-- ② 문장 확률 계산기 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 문장 확률 계산기: 곱하기파 vs log 파</p>
    <p class="mb-3 text-xs text-slate-500">
      토큰마다 확률 p 인 문장 n 토큰의 확률 = pⁿ. 그대로 곱하는 쪽과 log 로 더하는 쪽을
      비교하세요 — 5장 언더플로의 실전 현장입니다.
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="(p, i) in P_OPTS"
        :key="p"
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="i === pIdx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="pIdx = i"
      >
        토큰 확률 p = {{ p }}
      </button>
    </div>
    <label class="mt-2 block text-xs text-slate-500">
      문장 길이 n = <b class="text-slate-700">{{ nTok }}</b> 토큰
      <input v-model.number="nTok" type="range" min="1" max="300" step="1" class="mt-1 w-full accent-indigo-600" />
    </label>

    <div class="mt-2 grid gap-2 sm:grid-cols-2">
      <div class="rounded-lg p-3" :class="sentence.dead ? 'bg-rose-50' : 'bg-slate-50'">
        <p class="text-xs" :class="sentence.dead ? 'text-rose-700' : 'text-slate-500'">🐘 곱하기파 — fp32 로 p × p × …</p>
        <p class="break-all font-mono text-lg font-bold" :class="sentence.dead ? 'text-rose-700' : 'text-slate-700'">
          {{ sentence.dead ? '0 (💀 언더플로)' : sentence.naive.toExponential(3) }}
        </p>
        <p v-if="sentence.dead" class="text-xs text-rose-700">확률이 0 — "불가능한 문장"이라는 뜻이 아니라 칸이 못 담는 것!</p>
      </div>
      <div class="rounded-lg bg-emerald-50 p-3">
        <p class="text-xs text-emerald-700">🐜 log 파 — log p 를 n번 더하기</p>
        <p class="break-all font-mono text-lg font-bold text-emerald-700">
          log₁₀(확률) = {{ sentence.log10p.toFixed(1) }}
        </p>
        <p class="text-xs text-emerald-700">= 10^{{ sentence.log10p.toFixed(1) }} — 얼마든지 작아도 표현 가능</p>
      </div>
    </div>

    <p class="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 p = 0.1 이면 겨우 <b>46토큰</b>(한두 문장!)에서 곱하기파가 전사합니다 — p = 0.5 로도
      150토큰(5장 ÷2 여행의 그 걸음 수!). 그래서 LLM 은 훈련·평가 내내 확률이 아니라
      <b>log 확률</b>로 일합니다 — 5부 4장의 −log 채점이 애초에 log 세계였던 것도 우연이 아니죠.
    </p>
  </div>
</template>
