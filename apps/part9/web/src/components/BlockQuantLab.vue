<script setup lang="ts">
// ch9 인터랙티브 — ① 아웃라이어 전쟁: 통짜 축척 vs 블록(32개)별 축척 — 피해 국한을 목격
//                 ② GGUF 태그 해독기: Q4_K_M 문패 분해 + 실효 비트로 파일 영수증 계산.
// 오프라인·결정적 — mulberry32 시드 고정. 노트북과 동일 로직(assert 교차 검증).
import { computed, ref } from 'vue'

// 시드 고정 의사난수 (시리즈 표준 mulberry32)
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
// 종모양 가중치 128개 (합-of-4 근사 정규, σ ≈ 0.029)
const rand = mulberry32(9)
const BASE_W = Array.from({ length: 128 }, () => (rand() + rand() + rand() + rand() - 2) * 0.05)

// ── ① 아웃라이어 전쟁 ─────────────────────────────────────────
const LEVELS4 = 7 // int4 대칭: ±7
const outlier = ref(0.3)

function quantErr(w: number[], blockSize: number): number[] {
  // blockSize 단위로 축척을 따로 두고 int4 양자화 → 복원 오차 배열
  const errs: number[] = []
  for (let b = 0; b < w.length; b += blockSize) {
    const block = w.slice(b, b + blockSize)
    const s = Math.max(...block.map(Math.abs)) / LEVELS4
    for (const v of block) errs.push(Math.abs(Math.round(v / s) * s - v))
  }
  return errs
}

const war = computed(() => {
  const w = [...BASE_W]
  w[0] = outlier.value === 0 ? w[0] : outlier.value // 첫 값에 아웃라이어 침입
  const mono = quantErr(w, 128) // 통짜 — 축척 하나
  const block = quantErr(w, 32) // 블록 32개씩 4개 — 축척 4개
  // 아웃라이어 본인(0번)을 뺀 "무고한 127명"의 평균 오차
  const meanRest = (e: number[]) => e.slice(1).reduce((a, b) => a + b, 0) / (e.length - 1)
  const mMono = meanRest(mono)
  const mBlock = meanRest(block)
  // 블록별 평균 오차 (시각화용)
  const perBlock = [0, 1, 2, 3].map((k) => {
    const seg = block.slice(k * 32 + (k === 0 ? 1 : 0), (k + 1) * 32)
    return seg.reduce((a, b) => a + b, 0) / seg.length
  })
  return { mMono, mBlock, ratio: mMono / mBlock, perBlock }
})

// ── ② GGUF 태그 해독기 ────────────────────────────────────────
const N_PARAMS = 6.57e9 // 1장의 7B급
interface Tag {
  name: string
  bits: number
  parts: { token: string; meaning: string }[]
  note: string
}
const TAGS: Tag[] = [
  {
    name: 'F16', bits: 16,
    parts: [{ token: 'F16', meaning: '양자화 없음 — 반쪽 자(fp16, 7장) 그대로' }],
    note: '원본급 품질 — 하지만 7B 가 13GB, 노트북 RAM 이 버겁다',
  },
  {
    name: 'Q8_0', bits: 8.5,
    parts: [
      { token: 'Q8', meaning: '8비트 정수 양자화 (8장의 int8)' },
      { token: '_0', meaning: '구식(0세대) 단순 블록 — 블록 32개마다 fp16 축척 한 겹' },
    ],
    note: '품질 손실 거의 없음 — 실효 8.5비트/파라미터',
  },
  {
    name: 'Q4_K_M', bits: 4.85,
    parts: [
      { token: 'Q4', meaning: '4비트 정수 양자화 — 한쪽 눈금 7개!' },
      { token: 'K', meaning: 'K-quants — 블록 + 상위블록의 2단 축척 체계(축척의 축척)' },
      { token: 'M', meaning: 'Medium 믹스 — 중요 텐서는 6비트로 상향 (S/M/L 중 균형형)' },
    ],
    note: 'Ollama 국민 태그 — 크기·품질 균형의 기본값. 실효 약 4.85비트',
  },
  {
    name: 'Q4_0', bits: 4.5,
    parts: [
      { token: 'Q4', meaning: '4비트 정수 양자화' },
      { token: '_0', meaning: '구식 단순 블록 — K 없이 축척 한 겹, 믹스 없음' },
    ],
    note: '같은 4비트여도 K_M 보다 품질이 낮다 — 세대 차이',
  },
  {
    name: 'Q2_K', bits: 2.6,
    parts: [
      { token: 'Q2', meaning: '2~3비트 초압축 — 눈금이 한 자릿수' },
      { token: 'K', meaning: 'K-quants 2단 축척으로 그나마 버티기' },
    ],
    note: '품질 손실이 뚜렷 — 얼마나 잃는지는 10장(퍼플렉시티)에서 측정',
  },
]
const tagIdx = ref(2)
const tag = computed(() => TAGS[tagIdx.value])
const fileGB = computed(() => (N_PARAMS * tag.value.bits) / 8 / 1e9)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 아웃라이어 전쟁 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 아웃라이어 전쟁: 통짜 축척 vs 분단별 채점</p>
    <p class="mb-3 text-xs text-slate-400">
      종모양 가중치 128개를 int4(눈금 ±7)로 담습니다 — 첫 번째 값에 아웃라이어를 침입시키며
      두 방식을 비교하세요: 축척 하나(통짜) vs 32개마다 하나(블록).
    </p>

    <label class="block text-xs text-slate-500">
      아웃라이어 크기 = <b class="text-slate-700">{{ outlier.toFixed(2) }}</b> (원래 max ≈ 0.09)
      <input v-model.number="outlier" type="range" min="0" max="0.5" step="0.05" class="mt-1 w-full accent-indigo-600" />
    </label>

    <div class="mt-2 grid gap-2 sm:grid-cols-2">
      <div class="rounded-lg p-3" :class="war.ratio > 2 ? 'bg-rose-50' : 'bg-slate-50'">
        <p class="text-[11px]" :class="war.ratio > 2 ? 'text-rose-500' : 'text-slate-400'">🏫 통짜 — 128개가 축척 하나를 공유</p>
        <p class="font-mono text-lg font-bold" :class="war.ratio > 2 ? 'text-rose-600' : 'text-slate-700'">평균 오차 {{ war.mMono.toExponential(2) }}</p>
        <p class="text-[11px] text-slate-400">아웃라이어가 전원의 눈금을 성기게 만든다</p>
      </div>
      <div class="rounded-lg bg-emerald-50 p-3">
        <p class="text-[11px] text-emerald-600">🧱 블록 — 32개마다 축척 하나 (4블록)</p>
        <p class="font-mono text-lg font-bold text-emerald-700">평균 오차 {{ war.mBlock.toExponential(2) }}</p>
        <p class="text-[11px] text-emerald-500">피해가 아웃라이어의 블록 안에 국한</p>
      </div>
    </div>

    <div class="mt-2 flex items-center gap-2">
      <span class="text-[11px] text-slate-400">블록별 피해 상황:</span>
      <div
        v-for="(e, i) in war.perBlock"
        :key="i"
        class="flex-1 rounded-lg p-2 text-center text-[11px] font-semibold"
        :class="e > war.perBlock[3] * 2 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
      >
        블록 {{ i + 1 }}{{ i === 0 && outlier > 0 ? ' 🦹' : '' }}
      </div>
    </div>

    <p class="mt-2 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      👀 아웃라이어 0.5 에서 통짜의 무고한 127명 오차는 블록 방식의 <b>{{ war.ratio.toFixed(1) }}배</b>.
      반 전체가 전교 1등 때문에 커브를 망치는 대신 <b>분단별로 채점</b>하는 것 — 이 한 수가
      눈금 15개짜리 int4 를 실용으로 만들었습니다. 값은 3부 5장의 "분포의 꼬리"가 실존하기에
      꼭 필요한 보험이에요.
    </p>

    <!-- ② GGUF 태그 해독기 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — GGUF 태그 해독기: 문패를 한 조각씩 읽는다</p>
    <p class="mb-3 text-xs text-slate-400">
      Ollama 모델 목록에서 보던 그 태그들입니다 — 골라서 문패를 분해하고, 실효 비트로
      7B급(6.57B, 1장)의 파일 영수증을 계산해 보세요.
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="(tg, i) in TAGS"
        :key="tg.name"
        type="button"
        class="rounded-lg px-3 py-2 font-mono text-xs font-semibold transition"
        :class="i === tagIdx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="tagIdx = i"
      >
        {{ tg.name }}
      </button>
    </div>

    <p class="mt-3 break-all rounded-lg bg-slate-900 p-3 font-mono text-sm text-slate-100">
      llama-7b.<b class="text-amber-300">{{ tag.name }}</b>.gguf
    </p>

    <div class="mt-2 space-y-1">
      <div v-for="p in tag.parts" :key="p.token" class="flex items-start gap-2 rounded-lg bg-slate-50 p-2 text-xs">
        <span class="w-14 shrink-0 rounded bg-indigo-100 px-1.5 py-0.5 text-center font-mono font-bold text-indigo-700">{{ p.token }}</span>
        <span class="min-w-0 leading-relaxed text-slate-600">{{ p.meaning }}</span>
      </div>
    </div>

    <div class="mt-2 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div>
        <p class="text-[11px] text-slate-400">실효 비트/파라미터</p>
        <p class="font-mono text-lg font-bold text-slate-700">{{ tag.bits }}</p>
      </div>
      <div>
        <p class="text-[11px] text-slate-400">7B급 파일 크기 ≈ 6.57B × {{ tag.bits }}bit</p>
        <p class="font-mono text-lg font-bold text-indigo-700">{{ fileGB.toFixed(1) }} GB</p>
      </div>
      <p class="min-w-0 flex-1 text-xs leading-relaxed text-slate-500">{{ tag.note }}</p>
    </div>

    <p v-if="tag.name === 'Q4_K_M'" class="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 1장의 수수께끼 해결 — "int4 계산은 3.3GB 인데 실제 파일은 4GB 안팎"이었죠.
      정체는 <b>실효 비트 ≈ 4.85</b>: 순수 4비트(3.3GB) + 블록 축척들(+0.5비트) +
      중요 텐서 6비트 상향(M 믹스) + 메타데이터·어휘. 영수증이 완성됐습니다.
    </p>
  </div>
</template>
