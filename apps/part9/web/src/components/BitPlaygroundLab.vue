<script setup lang="ts">
// ch2 인터랙티브 — ① 스위치 놀이터: 비트 8개를 직접 켜고 끄며 수 만들기 (부호 없음 ↔ int8 모드)
//                 ② 천장 계산기: 비트 수 n → 셀 수 있는 가짓수 2ⁿ 과 최대값.
// 오프라인·결정적 — 정수 계산만. 난수 없음.
import { computed, ref } from 'vue'

// ── ① 스위치 놀이터 ────────────────────────────────────────────
const PLACE = [128, 64, 32, 16, 8, 4, 2, 1] // index 0 = 맨 앞(MSB)
const bits = ref<boolean[]>(Array(8).fill(false))
const signed = ref(false) // int8(2의 보수) 모드 — 맨 앞 자리값만 −128 로 바뀐다

const placeOf = (i: number) => (signed.value && i === 0 ? -128 : PLACE[i])
const value = computed(() => bits.value.reduce((s, b, i) => s + (b ? placeOf(i) : 0), 0))
const unsignedValue = computed(() => bits.value.reduce((s, b, i) => s + (b ? PLACE[i] : 0), 0))
const bitString = computed(() => bits.value.map((b) => (b ? '1' : '0')).join(''))
const terms = computed(() => bits.value.flatMap((b, i) => (b ? [String(placeOf(i))] : [])))

function toggle(i: number) {
  bits.value = bits.value.map((b, k) => (k === i ? !b : b))
}
function setAll(on: boolean) {
  bits.value = Array(8).fill(on)
}

// 도전 과제 — 목표 수를 스위치로 만들기
interface Challenge {
  label: string
  target: number
  needSigned?: boolean
}
const CHALLENGES: Challenge[] = [
  { label: '42 만들기', target: 42 },
  { label: '100 만들기', target: 100 },
  { label: '255 만들기', target: 255 },
  { label: '−1 만들기 (int8)', target: -1, needSigned: true },
]
const challenge = ref<Challenge | null>(null)
function pick(c: Challenge) {
  challenge.value = c
  if (c.needSigned) signed.value = true
  else signed.value = false
  setAll(false)
}
const solved = computed(() => challenge.value !== null && value.value === challenge.value.target)

// ── ② 천장 계산기 ──────────────────────────────────────────────
const nBits = ref(8)
const combos = computed(() => 2 ** nBits.value)
const ANALOGY: Record<number, string> = {
  1: '스위치 하나(예/아니오)',
  4: '16진수 한 글자',
  8: '한 바이트, 색상 채널 하나(0~255), int8 눈금 개수',
  10: '약 천 가지, 우리 미니 모델의 어휘 수',
  15: '32,768가지, 어휘 32,000개 토큰 번호가 들어가는 크기',
  16: '65,536가지, 유니코드 기본 평면',
  24: '약 1,678만, 모니터의 트루컬러',
  32: '약 43억, IPv4 인터넷 주소 전체',
}
const analogy = computed(() => ANALOGY[nBits.value] ?? '')
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 스위치 놀이터 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① · 스위치 놀이터: 스위치 8개로 수를 만든다</p>
    <p class="mb-3 text-xs text-slate-500">
      스위치(비트)를 눌러 켜고 꺼 보세요. 켜진 스위치의 <b>자리값</b>을 더한 것이 그 수입니다.
      자리값은 오른쪽부터 1, 2, 4, 8, … 두 배씩.
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="c in CHALLENGES"
        :key="c.label"
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="challenge?.label === c.label ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="pick(c)"
      >
        🎯 {{ c.label }}
      </button>
      <button type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200" @click="setAll(false); challenge = null">
        모두 끄기
      </button>
      <button type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200" @click="setAll(true); challenge = null">
        모두 켜기
      </button>
    </div>

    <div class="mt-3 grid grid-cols-8 gap-1 sm:gap-2">
      <button
        v-for="(b, i) in bits"
        :key="i"
        type="button"
        class="rounded-lg border p-1.5 text-center transition sm:p-2"
        :class="b ? 'border-indigo-300 bg-indigo-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'"
        @click="toggle(i)"
      >
        <span class="block text-xs opacity-70" :class="signed && i === 0 ? 'font-bold' : ''">{{ signed && i === 0 ? '-128' : PLACE[i] }}</span>
        <span class="block font-mono text-lg font-bold">{{ b ? 1 : 0 }}</span>
      </button>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div>
        <p class="text-xs text-slate-500">이진수</p>
        <p class="font-mono text-sm font-bold text-slate-600">{{ bitString }}</p>
      </div>
      <div class="flex-1">
        <p class="text-xs text-slate-500">{{ signed ? 'int8 로 읽으면' : '부호 없음(0~255)으로 읽으면' }}</p>
        <p class="font-mono text-2xl font-bold text-slate-700">
          = {{ value }}
          <span v-if="terms.length" class="ml-1 text-xs font-normal text-slate-500">({{ terms.join(' + ') }})</span>
        </p>
      </div>
      <p v-if="solved" class="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">✅ 성공!</p>
    </div>

    <label class="mt-3 flex cursor-pointer items-center gap-2 text-xs text-slate-600">
      <input v-model="signed" type="checkbox" class="accent-indigo-600" />
      <span>
        <b>int8(2의 보수) 모드</b>: 맨 앞 스위치의 자리값만 <b>−128</b> 로 바꿔 읽는다.
        스위치도, 비트도 그대로이고 <b>읽는 약속</b>만 다릅니다.
      </span>
    </label>
    <p v-if="signed" class="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 지금 이 비트를 부호 없음으로 읽으면 <b>{{ unsignedValue }}</b>, int8 로 읽으면
      <b>{{ value }}</b>. 같은 스위치의 두 얼굴입니다. 모두 켜면(11111111) −128 + 127 = <b>−1</b>,
      맨 앞만 켜면 <b>−128</b>, 맨 앞만 끄면 <b>127</b>. 그래서 int8 의 범위가 −128~127이에요.
    </p>

    <!-- ② 천장 계산기 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② · 천장 계산기: 스위치 n개면 몇 가지를 셀까</p>
    <p class="mb-3 text-xs text-slate-500">
      스위치 하나가 2가지 → 하나 더할 때마다 <b>× 2</b>. 5부의 스무고개로 치면
      "질문 n개로 구분할 수 있는 가짓수"와 정확히 같은 수입니다.
    </p>

    <label class="block text-xs text-slate-500">
      비트 수 n = <b class="text-slate-700">{{ nBits }}</b>
      <input v-model.number="nBits" type="range" min="1" max="32" step="1" class="mt-1 w-full accent-indigo-600" />
    </label>

    <div class="mt-2 rounded-lg bg-slate-50 p-3">
      <p class="break-all font-mono text-xs text-slate-500">2 × 2 × … × 2 (n번)</p>
      <p class="font-mono text-2xl font-bold text-slate-700">2<sup>{{ nBits }}</sup> = {{ combos.toLocaleString('en-US') }} 가지</p>
      <p class="mt-1 text-xs text-slate-500">
        부호 없는 정수라면 0 ~ <b>{{ (combos - 1).toLocaleString('en-US') }}</b> 까지.
        <span v-if="analogy" class="text-indigo-600"> 예: {{ analogy }}</span>
      </p>
    </div>

    <p class="mt-3 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      👀 이 "천장"이 9부 내내 따라다닙니다. int8 양자화(8장)는 가중치 하나를
      <b>8비트 = 256눈금</b>에 담는 기술이고, 워밍업의 1 삼키기도 결국 53비트짜리
      정밀도 천장 이야기였어요(3장에서 해부).
    </p>
  </div>
</template>
