<script setup lang="ts">
// ch5 인터랙티브 — ① 2배 여행: ×2/÷2 를 반복해 자의 양쪽 끝(inf·0)에 도달
//                 ② exp 폭발 시계: exp(x) 가 fp32/fp64 에서 각각 언제 터지나
//                 ③ NaN 공장: 계산 불능 사례들과 NaN 의 전염성.
// 오프라인·결정적 — Math.fround 로 fp32 재현. 난수 없음.
import { computed, ref } from 'vue'

const f = Math.fround

// ── ① 2배 여행 ────────────────────────────────────────────────
const dir = ref<'up' | 'down'>('up')
const cur = ref(f(1))
const steps = ref(0)

function resetJourney(newDir?: 'up' | 'down') {
  if (newDir) dir.value = newDir
  cur.value = f(1)
  steps.value = 0
}
function stepOnce(): boolean {
  if (!Number.isFinite(cur.value) || cur.value === 0) return false
  cur.value = dir.value === 'up' ? f(cur.value * 2) : f(cur.value / 2)
  steps.value++
  return true
}
function run(n: number) {
  for (let i = 0; i < n; i++) if (!stepOnce()) break
}
function toEnd() {
  for (let i = 0; i < 200; i++) if (!stepOnce()) break
}

const MIN_NORMAL = 2 ** -126
const journey = computed(() => {
  const v = cur.value
  if (!Number.isFinite(v))
    return { label: `💥 오버플로 — ${steps.value}번 만에 자의 끝 너머, inf 로 포화`, tone: 'text-rose-600' }
  if (v === 0)
    return { label: `🕳️ 언더플로 — ${steps.value}번 만에 눈금 사이로 소멸, 0`, tone: 'text-rose-600' }
  if (v < MIN_NORMAL)
    return { label: '⚠️ 비정규 구간 — 숨은 1을 포기하고 낭떠러지 대신 경사로로 버티는 중', tone: 'text-amber-600' }
  return { label: '✅ 정상 구간 — 아직 자 위에 있습니다', tone: 'text-emerald-600' }
})
const fmtV = (v: number) =>
  !Number.isFinite(v) ? 'inf' : v === 0 ? '0' : v >= 1e5 || v < 1e-4 ? v.toExponential(3) : String(v)

// ── ② exp 폭발 시계 ───────────────────────────────────────────
const xExp = ref(20)
const expProbe = computed(() => {
  const e32 = f(Math.exp(xExp.value))
  const e64 = Math.exp(xExp.value)
  return {
    e32,
    e64,
    boom32: !Number.isFinite(e32),
    boom64: !Number.isFinite(e64),
  }
})

// ── ③ NaN 공장 ────────────────────────────────────────────────
const CASES = [
  { label: '0 ÷ 0', hint: '없는 것을 없는 것으로 나누면?', value: 0 / 0 },
  { label: '∞ − ∞', hint: '끝없이 큰 것끼리의 차이는?', value: Infinity - Infinity },
  { label: '√(−1)', hint: '실수 세계엔 없는 답', value: Math.sqrt(-1) },
  { label: '∞ ÷ ∞', hint: '무한을 무한으로 나누면?', value: Infinity / Infinity },
]
const revealed = ref<boolean[]>(CASES.map(() => false))
const infectedSum = [3, 5, Number.NaN].reduce((a, b) => a + b, 0)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 2배 여행 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 2배 여행: 자의 끝은 생각보다 가깝다</p>
    <p class="mb-3 text-xs text-slate-400">
      1에서 출발해 fp32 로 ×2(또는 ÷2)를 반복합니다 — 몇 걸음 만에 자의 끝에 닿는지 세어 보세요.
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="dir === 'up' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="resetJourney('up')"
      >
        🚀 ×2 여행 (위로)
      </button>
      <button
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="dir === 'down' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="resetJourney('down')"
      >
        🕳️ ÷2 여행 (아래로)
      </button>
      <button type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-200" @click="run(1)">1스텝</button>
      <button type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-200" @click="run(10)">10스텝</button>
      <button type="button" class="rounded-lg bg-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-200" @click="toEnd()">끝까지 →</button>
      <button type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-200" @click="resetJourney()">처음부터</button>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div>
        <p class="text-[11px] text-slate-400">스텝</p>
        <p class="font-mono text-lg font-bold text-slate-700">{{ steps }}</p>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-[11px] text-slate-400">현재 값 (fp32)</p>
        <p class="break-all font-mono text-lg font-bold text-slate-700">{{ fmtV(cur) }}</p>
      </div>
      <p class="w-full text-sm font-medium sm:w-auto" :class="journey.tone">{{ journey.label }}</p>
    </div>

    <p class="mt-2 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      👀 위로는 <b>128번</b>(2¹²⁸ 이 최대값 3.4×10³⁸ 을 넘는 순간 — 지수 8비트의 천장),
      아래로는 정규 구간 끝(2⁻¹²⁶, 126번)을 지나 비정규 경사로의 마지막 눈금(2⁻¹⁴⁹, 149번)까지
      버틴 뒤 <b>150번째</b>에 0.
      자의 끝을 넘으면 컴퓨터는 에러 대신 <b>inf 라는 포화 표식</b>을 남기고 계속 달립니다 —
      그게 더 무서운 점이에요(사고가 조용히 전파되니까).
    </p>

    <!-- ② exp 폭발 시계 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — exp 폭발 시계: 지수함수는 자의 끝을 향해 달린다</p>
    <p class="mb-3 text-xs text-slate-400">
      2부 7장의 그 지수함수 — exp(x)는 x 가 조금만 커져도 폭발적으로 자랍니다.
      fp32 와 fp64 가 각각 몇에서 터지는지 다이얼을 돌려 보세요.
    </p>

    <label class="block text-xs text-slate-500">
      x = <b class="text-slate-700">{{ xExp }}</b>
      <input v-model.number="xExp" type="range" min="0" max="120" step="1" class="mt-1 w-full accent-indigo-600" />
    </label>

    <div class="mt-2 grid gap-2 sm:grid-cols-2">
      <div class="rounded-lg p-3" :class="expProbe.boom32 ? 'bg-rose-50' : 'bg-slate-50'">
        <p class="text-[11px]" :class="expProbe.boom32 ? 'text-rose-500' : 'text-slate-400'">fp32 의 exp(x)</p>
        <p class="break-all font-mono text-lg font-bold" :class="expProbe.boom32 ? 'text-rose-600' : 'text-slate-700'">
          {{ expProbe.boom32 ? '💥 inf (오버플로!)' : expProbe.e32.toExponential(3) }}
        </p>
        <p class="text-[11px] text-slate-400">한계 ≈ 3.4×10³⁸ → x ≈ 88.7 에서 폭발</p>
      </div>
      <div class="rounded-lg p-3" :class="expProbe.boom64 ? 'bg-rose-50' : 'bg-slate-50'">
        <p class="text-[11px]" :class="expProbe.boom64 ? 'text-rose-500' : 'text-slate-400'">fp64 의 exp(x)</p>
        <p class="break-all font-mono text-lg font-bold" :class="expProbe.boom64 ? 'text-rose-600' : 'text-slate-700'">
          {{ expProbe.boom64 ? '💥 inf' : expProbe.e64.toExponential(3) }}
        </p>
        <p class="text-[11px] text-slate-400">한계 ≈ 1.8×10³⁰⁸ → x ≈ 709.8 에서 폭발</p>
      </div>
    </div>

    <p v-if="expProbe.boom32" class="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 겨우 <b>x = 89</b> — 어텐션 점수나 로짓이 이 정도로 커지는 건 훈련이 조금만 불안해도
      일어나는 일입니다. softmax 의 exp 를 그대로 계산하면 여기서 즉사 — 구급대(max 빼기)는
      다음 장(log-sum-exp)에서 만나요.
    </p>

    <!-- ③ NaN 공장 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ③ — NaN 공장: 답이 없는 계산의 표식</p>
    <p class="mb-3 text-xs text-slate-400">
      자의 끝(inf·0)끼리 만나면 "답이 없는" 계산이 생깁니다 — 각 카드를 눌러 결과를 확인하세요.
    </p>

    <div class="grid gap-2 sm:grid-cols-4">
      <button
        v-for="(c, i) in CASES"
        :key="c.label"
        type="button"
        class="rounded-lg border p-3 text-center transition"
        :class="revealed[i] ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'"
        @click="revealed[i] = true"
      >
        <p class="font-mono text-sm font-bold text-slate-700">{{ c.label }}</p>
        <p v-if="revealed[i]" class="mt-1 font-mono text-lg font-bold text-rose-600">= {{ c.value }}</p>
        <p v-else class="mt-1 text-[11px] text-slate-400">{{ c.hint }}</p>
      </button>
    </div>

    <div class="mt-3 rounded-lg bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-600">
      3 + 5 + NaN = <b class="text-rose-600">{{ infectedSum }}</b>
      <span class="text-slate-400"> ← 하나만 끼어도 장부 전체가 오염(전염성)</span><br />
      NaN === NaN → <b class="text-rose-600">{{ (Number.NaN === Number.NaN).toString() }}</b>
      <span class="text-slate-400"> ← 자기 자신과도 같지 않은 유일한 값 (검사는 isNaN 으로)</span>
    </div>

    <p class="mt-2 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      👀 훈련 로그의 <b>loss: nan</b> 이 바로 이 전염의 결과입니다 — 수십억 곱셈 중 단 한 곳에서
      inf/0÷0 이 태어나면, 몇 스텝 안에 모델의 모든 숫자가 NaN 으로 물듭니다. 8부 9장에서 본
      스파이크 → NaN 붕괴의 하드웨어 층이 여기예요.
    </p>
  </div>
</template>
