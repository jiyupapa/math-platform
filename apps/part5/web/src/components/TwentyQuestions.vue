<script setup lang="ts">
// 업다운 게임 — "질문 하나가 후보를 얼마나 줄이는가"를 손으로 체감하는 인터랙티브.
// 1~64 중 숨은 숫자를 UP/DOWN 답변만으로 찾는다. 질문마다 남은 후보 칸이 실시간으로
// 줄어들어, 가운데(반반) 질문이 후보를 절반씩 소거함 = log₂ 의 정체를 눈으로 본다.
import { ref, computed } from 'vue'

const N = 64 // 후보 수 — 2^6 이라 반반 전략이면 정확히 6번에 끝난다
const BEST = Math.log2(N) // = 6

interface Turn {
  guess: number
  result: 'up' | 'down' | 'hit'
  before: number // 질문 전 남은 후보 수
  after: number // 질문 후 남은 후보 수
}

const secret = ref(pick())
const lo = ref(1)
const hi = ref(N)
const turns = ref<Turn[]>([])
const done = ref(false)
const guessInput = ref<number | null>(null)

function pick(): number {
  return 1 + Math.floor(Math.random() * N)
}

const remaining = computed(() => hi.value - lo.value + 1)
const mid = computed(() => Math.floor((lo.value + hi.value) / 2))
// 남은 후보로 최악의 경우 몇 번 더 필요한가 = "절반으로 몇 번 더 접나"
const foldsLeft = computed(() => (done.value ? 0 : Math.ceil(Math.log2(remaining.value))))

// 마지막 질문의 답이 'hit' 였는지 (후보 1개 자동 확정과 구분해 완료 문구를 다르게 표시)
const hitDirectly = ref(false)

function ask(g: number) {
  if (done.value || g < 1 || g > N) return
  const before = remaining.value
  let result: Turn['result']
  if (g === secret.value) {
    result = 'hit'
    done.value = true
    hitDirectly.value = true
    lo.value = g
    hi.value = g
  } else if (g < secret.value) {
    result = 'up'
    lo.value = Math.max(lo.value, g + 1)
  } else {
    result = 'down'
    hi.value = Math.min(hi.value, g - 1)
  }
  turns.value.push({ guess: g, result, before, after: remaining.value })
  // 후보가 1개 남으면 물어볼 필요가 없다 — 이미 정답을 안다 (그래서 64개는 최대 6번)
  if (!done.value && remaining.value === 1) done.value = true
  guessInput.value = null
}

function askInput() {
  if (guessInput.value !== null) ask(Math.round(guessInput.value))
}

function reset() {
  secret.value = pick()
  lo.value = 1
  hi.value = N
  turns.value = []
  done.value = false
  hitDirectly.value = false
  guessInput.value = null
}

// 칸의 상태: 소거됨 / 아직 후보 / 정답(공개 후)
function cellClass(n: number): string {
  if (done.value && n === secret.value) return 'bg-emerald-500 text-white'
  if (n < lo.value || n > hi.value) return 'bg-slate-100 text-slate-300'
  return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-300 cursor-pointer'
}

const resultLabel: Record<Turn['result'], string> = {
  up: 'UP ↑ (더 커요)',
  down: 'DOWN ↓ (더 작아요)',
  hit: '🎉 정답!',
}
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm font-semibold text-slate-700">
        🎯 1~{{ N }} 사이의 숨은 숫자를 찾아라
      </p>
      <button
        class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
        @click="reset"
      >
        ↻ 새 게임
      </button>
    </div>

    <!-- 후보 격자: 질문마다 소거된 칸이 회색으로 꺼진다 -->
    <div class="grid grid-cols-8 gap-1 sm:grid-cols-16">
      <button
        v-for="n in N"
        :key="n"
        class="flex aspect-square items-center justify-center rounded text-xs font-medium transition-colors sm:text-xs"
        :class="cellClass(n)"
        :disabled="done || n < lo || n > hi"
        :title="`${n} 물어보기`"
        @click="ask(n)"
      >
        {{ n }}
      </button>
    </div>
    <p class="mt-1.5 text-xs text-slate-500">칸을 직접 눌러 물어봐도 돼요.</p>

    <!-- 현황판 -->
    <div class="mt-3 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-lg font-bold text-slate-800">{{ turns.length }}</p>
        <p class="text-xs text-slate-500">질문 수</p>
      </div>
      <div class="rounded-lg bg-indigo-50 p-2">
        <p class="text-lg font-bold text-indigo-700">{{ remaining }}</p>
        <p class="text-xs text-indigo-600">남은 후보</p>
      </div>
      <div class="rounded-lg bg-amber-50 p-2">
        <p class="text-lg font-bold text-amber-700">{{ foldsLeft }}</p>
        <p class="text-xs text-amber-700">반으로 접기, 앞으로 최대 몇 번?</p>
      </div>
    </div>

    <!-- 질문 입력 -->
    <div v-if="!done" class="mt-3 flex flex-wrap items-center gap-2">
      <input
        v-model.number="guessInput"
        type="number"
        :min="1"
        :max="N"
        placeholder="숫자"
        class="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
        @keyup.enter="askInput"
      />
      <button
        class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
        :disabled="guessInput === null"
        @click="askInput"
      >
        물어보기
      </button>
      <button
        class="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
        :title="`남은 후보의 한가운데 = ${mid}`"
        @click="ask(mid)"
      >
        💡 반반 전략: 가운데({{ mid }}) 물어보기
      </button>
    </div>

    <!-- 완료 배너 -->
    <div v-else class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
      <p class="font-semibold text-emerald-800">
        <template v-if="hitDirectly">🎉 {{ secret }} 을(를) 질문 {{ turns.length }}번 만에 찾았어요!</template>
        <template v-else>🎉 질문 {{ turns.length }}번 만에 후보가 1개! 물어볼 것도 없이 정답은 {{ secret }}!</template>
      </p>
      <p class="mt-1 text-emerald-700">
        반반 전략이면 <b>어떤 숫자든 최대 {{ BEST }}번</b>이면 충분해요.
        {{ N }} → 32 → 16 → 8 → 4 → 2 → 1, 절반으로 {{ BEST }}번 접으면 끝.
        이 "{{ BEST }}"이 바로 이 게임에 숨어 있는 정보량({{ BEST }}비트)입니다. 1장에서 자세히!
      </p>
    </div>

    <!-- 질문 기록: 질문마다 후보가 어떻게 줄었나 -->
    <div v-if="turns.length" class="mt-3">
      <p class="mb-1 text-xs font-semibold text-slate-500">질문 기록: 후보가 얼마나 줄었나</p>
      <ul class="space-y-1">
        <li
          v-for="(t, i) in turns"
          :key="i"
          class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600"
        >
          <span class="w-4 shrink-0 text-right font-semibold text-slate-500">{{ i + 1 }}.</span>
          <span class="w-14 shrink-0">"{{ t.guess }}?"</span>
          <span
            class="w-28 shrink-0 font-medium"
            :class="t.result === 'hit' ? 'text-emerald-700' : 'text-slate-700'"
          >
            {{ resultLabel[t.result] }}
          </span>
          <span class="shrink-0 tabular-nums">후보 {{ t.before }} → {{ t.after }}</span>
          <!-- 후보 감소를 막대 길이로 -->
          <span class="h-2 rounded-full bg-indigo-400" :style="{ width: (t.after / N) * 140 + 'px' }" />
          <span
            v-if="t.result !== 'hit'"
            class="shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium"
            :class="
              t.after <= Math.ceil(t.before / 2)
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            "
          >
            {{ t.after <= Math.ceil(t.before / 2) ? '절반 이하로 줄임 👍' : '절반도 못 줄임' }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
