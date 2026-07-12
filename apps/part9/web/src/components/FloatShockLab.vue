<script setup lang="ts">
// ch0 인터랙티브 — ① 계산기 대결: 학교 산수 vs 이 브라우저(같은 계산, 다른 답)
//                 ② 1 삼키기: 큰 수 구간에서 +1이 눈금 사이로 사라지는 경계를 직접 찾기.
// 오프라인·결정적 — 브라우저의 숫자(fp64) 그 자체가 실험 재료. 난수 없음.
import { computed, ref } from 'vue'

// ── ① 계산기 대결 ─────────────────────────────────────────────
interface Duel {
  label: string
  /** 학교 산수의 답 (십진 문자열) */
  school: string
  /** 컴퓨터에게 실제로 시키는 계산 */
  compute: () => number
  /** 돋보기에 보여줄 재료 값들 */
  operands: number[]
}
const DUELS: Duel[] = [
  { label: '0.1 + 0.2', school: '0.3', compute: () => 0.1 + 0.2, operands: [0.1, 0.2] },
  { label: '0.3 − 0.2', school: '0.1', compute: () => 0.3 - 0.2, operands: [0.3, 0.2] },
  { label: '0.1 × 3', school: '0.3', compute: () => 0.1 * 3, operands: [0.1, 3] },
  {
    label: '0.1을 열 번 더하기', school: '1',
    compute: () => { let s = 0; for (let i = 0; i < 10; i++) s += 0.1; return s },
    operands: [0.1],
  },
  { label: '0.5 + 0.25', school: '0.75', compute: () => 0.5 + 0.25, operands: [0.5, 0.25] },
]
const duelIdx = ref(0)
const zoom = ref(false)
const duel = computed(() => {
  const d = DUELS[duelIdx.value]
  const value = d.compute()
  return { ...d, value, text: String(value), match: value === Number(d.school) }
})
// 저장값 돋보기 — 소수 20자리까지 펼쳐 "재료부터 이미 어긋나 있었다"를 보여준다
const fix20 = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(20))

// ── ② 1 삼키기 ────────────────────────────────────────────────
const exp2 = ref(12)
const swallow = computed(() => {
  const big = 10 ** exp2.value
  const diff = big + 1 - big // fp64 그대로 계산
  return {
    big: big.toLocaleString('en-US'),
    diff,
    ok: diff === 1,
  }
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 계산기 대결 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 계산기 대결: 학교 산수 vs 이 브라우저</p>
    <p class="mb-3 text-xs text-slate-400">
      아래 계산을 <b>지금 이 브라우저</b>가 직접 합니다(미리 적어 둔 답이 아닙니다).
      학교에서 배운 답과 비교해 보세요.
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="(d, i) in DUELS"
        :key="d.label"
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="i === duelIdx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="duelIdx = i"
      >
        {{ d.label }}
      </button>
    </div>

    <div class="mt-3 grid gap-2 sm:grid-cols-2">
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-[11px] text-slate-400">🏫 학교 산수의 답</p>
        <p class="font-mono text-lg font-bold text-slate-700">{{ duel.school }}</p>
      </div>
      <div class="rounded-lg p-3" :class="duel.match ? 'bg-emerald-50' : 'bg-rose-50'">
        <p class="text-[11px]" :class="duel.match ? 'text-emerald-500' : 'text-rose-400'">💻 이 브라우저의 답</p>
        <p class="break-all font-mono text-lg font-bold" :class="duel.match ? 'text-emerald-700' : 'text-rose-600'">
          {{ duel.text }}
        </p>
      </div>
    </div>

    <p class="mt-2 text-sm font-medium" :class="duel.match ? 'text-emerald-600' : 'text-rose-600'">
      {{ duel.match ? '✅ 일치 — 이 수들은 컴퓨터의 눈금 위에 정확히 있습니다' : '❗ 불일치 — 답이 미세하게 어긋났습니다' }}
    </p>

    <button
      type="button"
      class="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-200"
      @click="zoom = !zoom"
    >
      🔍 저장값 돋보기 {{ zoom ? '닫기' : '— 재료 숫자들의 진짜 저장값 보기' }}
    </button>
    <div v-if="zoom" class="mt-2 space-y-1 rounded-lg bg-slate-50 p-3">
      <p v-for="x in duel.operands" :key="x" class="break-all font-mono text-xs text-slate-600">
        {{ x }} 의 실제 저장값 ≈ <b>{{ fix20(x) }}</b>
      </p>
      <p class="break-all font-mono text-xs text-slate-600">
        계산 결과의 실제 저장값 ≈ <b>{{ fix20(duel.value) }}</b>
      </p>
      <p class="pt-1 text-xs leading-relaxed text-slate-500">
        👀 계산이 틀린 게 아니라 <b>재료부터 이미 미세하게 어긋나</b> 있었죠 — 0.1을 정확히 담을
        눈금이 없어서, 가장 가까운 눈금에 반올림해 담았기 때문입니다. (0.5나 0.25처럼
        눈금 위에 정확히 있는 수는 어긋나지 않아요.)
      </p>
    </div>

    <!-- ② 1 삼키기 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 1 삼키기: 큰 수는 1을 더해도 그대로?</p>
    <p class="mb-3 text-xs text-slate-400">
      10의 거듭제곱에 1을 더했다가 도로 빼 봅니다 — 학교 산수라면 답은 언제나 1이어야 하죠.
      수를 키워 가며 <b>1이 사라지는 경계</b>를 찾아보세요.
    </p>

    <label class="block text-xs text-slate-500">
      큰 수 = 10<sup>{{ exp2 }}</sup>
      <input v-model.number="exp2" type="range" min="10" max="17" step="1" class="mt-1 w-full accent-indigo-600" />
    </label>

    <div class="mt-2 rounded-lg bg-slate-50 p-3">
      <p class="break-all font-mono text-xs text-slate-500">{{ swallow.big }} + 1 − {{ swallow.big }}</p>
      <div class="mt-1 flex items-center gap-3">
        <p class="font-mono text-2xl font-bold" :class="swallow.ok ? 'text-emerald-600' : 'text-rose-600'">
          = {{ swallow.diff }}
        </p>
        <p class="flex-1 text-sm font-medium" :class="swallow.ok ? 'text-emerald-600' : 'text-rose-600'">
          {{ swallow.ok ? '✅ 정상 — 아직 눈금 간격이 1보다 촘촘합니다' : '❗ 1이 삼켜졌다 — 더했는데 아무 일도 일어나지 않음' }}
        </p>
      </div>
    </div>

    <p v-if="!swallow.ok" class="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 이 구간에서 컴퓨터가 가진 <b>이웃 눈금 사이 간격은 2</b>입니다. "+1"의 결과(…0001)는 어느
      눈금 위에도 없어서 <b>가장 가까운 눈금 — 제자리 — 로 반올림</b>되죠. 작은 수 쪽은 눈금이
      촘촘하고 큰 수 쪽은 성긴 이 자의 정체(그리고 경계가 왜 약 9천조, 2⁵³ 인지)는
      3장(고무줄 자)에서 해부합니다.
    </p>
    <p v-else class="mt-3 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      슬라이더를 오른쪽으로 — 10<sup>16</sup> 부근에서 무슨 일이 생기는지 보세요.
    </p>
  </div>
</template>
