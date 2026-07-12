<script setup lang="ts">
// ch4 인터랙티브 — ① 결합법칙 사망 사건: (1 + 10⁸) − 10⁸ vs 1 + (10⁸ − 10⁸) — 순서가 답을 가른다
//                 ② 티끌 경주: 1.0 에 10⁻⁸ 을 N번 — 큰 수부터 vs 작은 것끼리 먼저
//                 ③ 뺄셈 재앙 돋보기: 가까운 두 수의 차 — 상대 오차가 폭발하는 순간.
// 오프라인·결정적 — 매 스텝 Math.fround 로 진짜 fp32 연산을 재현. 난수 없음.
import { computed, ref } from 'vue'

const f = Math.fround

// ── ① 결합법칙 사망 사건 ──────────────────────────────────────
const A_STEP = f(1 + 1e8) // 100,000,001 → 눈금 간격 8 → 100,000,000 으로 반올림
const A_RESULT = f(A_STEP - 1e8) // 0
const B_STEP = f(1e8 - 1e8) // 0
const B_RESULT = f(1 + B_STEP) // 1

// ── ② 티끌 경주 ───────────────────────────────────────────────
const N_OPTS = [10_000, 100_000, 1_000_000]
const nIdx = ref(1)
const race = computed(() => {
  const N = N_OPTS[nIdx.value]
  // 큰 수부터: 1.0 에 티끌을 하나씩 — 매번 흡수돼 전멸
  let fwd = f(1)
  for (let i = 0; i < N; i++) fwd = f(fwd + 1e-8)
  // 작은 것끼리 먼저: 티끌들을 모아 몸집을 키운 뒤 큰 수에 합류
  let tiny = f(0)
  for (let i = 0; i < N; i++) tiny = f(tiny + 1e-8)
  const bwd = f(1 + tiny)
  return { N, fwd, bwd, tiny, exact: 1 + N * 1e-8 }
})

// ── ③ 뺄셈 재앙 돋보기 ────────────────────────────────────────
const k = ref(6)
const cancel = computed(() => {
  const d = 10 ** -k.value
  const a = f(1 + d) // 입력부터 반올림 (상대 티끌 ≈ 2⁻²⁴)
  const diff = f(a - 1) // 가까운 두 수의 차
  const rel = (Math.abs(diff - d) / d) * 100
  return { d, a, diff, rel }
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 결합법칙 사망 사건 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 결합법칙 사망 사건: 같은 세 수, 다른 순서, 다른 답</p>
    <p class="mb-3 text-xs text-slate-400">
      1 + 10⁸ − 10⁸ 을 fp32 로 계산합니다 — 학교 수학이라면 순서와 무관하게 1이어야 하죠.
      두 경로의 영수증을 비교해 보세요.
    </p>

    <div class="grid gap-2 sm:grid-cols-2">
      <div class="rounded-lg bg-rose-50 p-3">
        <p class="text-[11px] font-semibold text-rose-500">경로 A — (1 + 10⁸) 먼저</p>
        <p class="mt-1 font-mono text-xs leading-relaxed text-rose-700">
          1 + 100,000,000<br />
          = 100,000,001 <span class="text-rose-400">→ 이 구간 눈금 간격은 8 — 반올림!</span><br />
          → <b>{{ A_STEP.toLocaleString('en-US') }}</b><br />
          − 100,000,000 = <b class="text-lg">{{ A_RESULT }}</b>
        </p>
      </div>
      <div class="rounded-lg bg-emerald-50 p-3">
        <p class="text-[11px] font-semibold text-emerald-600">경로 B — (10⁸ − 10⁸) 먼저</p>
        <p class="mt-1 font-mono text-xs leading-relaxed text-emerald-700">
          100,000,000 − 100,000,000<br />
          = {{ B_STEP }} <span class="text-emerald-500">→ 눈금 위의 수 — 무사통과</span><br />
          <br />
          1 + 0 = <b class="text-lg">{{ B_RESULT }}</b>
        </p>
      </div>
    </div>
    <p class="mt-2 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
      👀 <b>0 vs 1</b> — 계산은 한 번도 틀리지 않았습니다. 다만 경로 A 는 중간 결과(100,000,001)를
      담을 눈금이 없어 <b>거기서</b> 반올림했을 뿐. 부동소수점 세계에서 결합법칙 (a+b)+c = a+(b+c) 은
      성립하지 않습니다 — <b>어디서 반올림하느냐가 순서에 달렸으니까요.</b>
    </p>

    <!-- ② 티끌 경주 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 티끌 경주: 더하는 순서가 티끌의 생사를 가른다</p>
    <p class="mb-3 text-xs text-slate-400">
      1.0 에 티끌(10⁻⁸)을 N번 더합니다 — 1 근처 눈금 간격(1.19×10⁻⁷)보다 작은 티끌이라
      하나씩 더하면 <b>매번 흡수</b>되죠. 순서를 바꾸면?
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="(n, i) in N_OPTS"
        :key="n"
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="i === nIdx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="nIdx = i"
      >
        N = {{ n.toLocaleString('en-US') }}번
      </button>
    </div>

    <div class="mt-3 grid gap-2 sm:grid-cols-3">
      <div class="rounded-lg bg-rose-50 p-3">
        <p class="text-[11px] text-rose-500">🐘 큰 수부터 — 1.0 에 하나씩</p>
        <p class="break-all font-mono text-lg font-bold text-rose-600">{{ race.fwd }}</p>
        <p class="text-[11px] text-rose-400">티끌 {{ race.N.toLocaleString('en-US') }}개 전멸(흡수)</p>
      </div>
      <div class="rounded-lg bg-emerald-50 p-3">
        <p class="text-[11px] text-emerald-600">🐜 작은 것끼리 먼저 모으면</p>
        <p class="break-all font-mono text-lg font-bold text-emerald-700">{{ race.bwd }}</p>
        <p class="text-[11px] text-emerald-500">모은 티끌 {{ race.tiny.toExponential(3) }} 이 살아서 합류</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-[11px] text-slate-400">🏫 참값</p>
        <p class="break-all font-mono text-lg font-bold text-slate-700">{{ race.exact }}</p>
        <p class="text-[11px] text-slate-400">1 + N × 10⁻⁸</p>
      </div>
    </div>
    <p class="mt-2 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      💡 실전 요령이 이 한 줄에서 나옵니다 — <b>작은 것끼리 먼저 더해 몸집을 키운 뒤 큰 수와
      합쳐라.</b> (라이브러리들도 같은 고민을 합니다 — 쌍끼리 짝지어 더하는 pairwise 합산,
      잃어버린 티끌을 장부에 적어 두는 Kahan 합산 — 노트북에서 직접 만들어 봐요.)
    </p>

    <!-- ③ 뺄셈 재앙 돋보기 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ③ — 뺄셈 재앙 돋보기: 가까운 두 수의 차는 위험하다</p>
    <p class="mb-3 text-xs text-slate-400">
      (1 + d) − 1 을 fp32 로 계산합니다. 참값은 당연히 d — 그런데 d 가 작아질수록(두 수가
      가까워질수록) 답의 <b>상대 오차</b>가 어떻게 되는지 보세요.
    </p>

    <label class="block text-xs text-slate-500">
      가까움 정도 d = 10<sup>−{{ k }}</sup>
      <input v-model.number="k" type="range" min="4" max="8" step="1" class="mt-1 w-full accent-indigo-600" />
    </label>

    <div class="mt-2 grid gap-2 sm:grid-cols-3">
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-[11px] text-slate-400">참값 d</p>
        <p class="break-all font-mono text-sm font-bold text-slate-700">{{ cancel.d.toExponential(4) }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-[11px] text-slate-400">fp32 의 (1+d) − 1</p>
        <p class="break-all font-mono text-sm font-bold text-slate-700">{{ cancel.diff === 0 ? '0' : cancel.diff.toExponential(4) }}</p>
      </div>
      <div class="rounded-lg p-3" :class="cancel.rel > 10 ? 'bg-rose-50' : 'bg-emerald-50'">
        <p class="text-[11px]" :class="cancel.rel > 10 ? 'text-rose-500' : 'text-emerald-600'">상대 오차</p>
        <p class="font-mono text-lg font-bold" :class="cancel.rel > 10 ? 'text-rose-600' : 'text-emerald-700'">
          {{ cancel.rel < 0.01 ? cancel.rel.toExponential(1) : cancel.rel.toPrecision(3) }}%
        </p>
      </div>
    </div>

    <p class="mt-2 rounded-lg p-3 text-xs leading-relaxed" :class="cancel.rel > 10 ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-600'">
      {{ cancel.rel >= 99
        ? '💥 전멸 — d 가 눈금 간격 절반보다 작아 (1+d) 가 그냥 1 로 저장됐고, 차이는 0. 정보가 통째로 사라졌습니다.'
        : cancel.rel > 10
          ? '❗ 재앙 구간 — 입력의 티끌(상대 2⁻²⁴)은 그대로인데, 뺄셈으로 몸통(앞자리)이 지워지면서 티끌이 답의 몸통이 됐습니다.'
          : '✅ 아직 안전 — 두 수가 충분히 멀어 유효숫자가 살아남습니다. d 를 더 줄여 보세요.' }}
    </p>
  </div>
</template>
