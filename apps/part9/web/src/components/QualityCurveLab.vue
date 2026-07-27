<script setup lang="ts">
// ch10 인터랙티브 — ① 무릎 곡선: 미니 언어모델의 로짓을 b비트로 양자화하며 퍼플렉시티 열화 측정
//                    (열화 = KL(p_fp‖p_q) ≥ 0 — fp 모델 분포 기준이라 음수 열화가 없다, 5부 회수)
//                  ② 성적표 읽기 + RAM 추천 게임: 실전 태그 표에서 내 PC 의 최선 고르기.
// 오프라인·결정적 — bigram 카운트 기반, 난수 없음. 노트북과 동일 수치(assert 교차 검증).
import { computed, ref } from 'vue'

// ── 미니 bigram 언어모델 (웹·노트북 공통 코퍼스) ────────────────
const CORPUS = 'the cat sat on the mat and the rat ate the hat then the cat ran to the man '
const CHARS = [...new Set(CORPUS)].sort()
const V = CHARS.length // 12
const IDX = new Map(CHARS.map((c, i) => [c, i]))

const counts: number[][] = Array.from({ length: V }, () => Array(V).fill(0))
for (let i = 0; i + 1 < CORPUS.length; i++) counts[IDX.get(CORPUS[i])!][IDX.get(CORPUS[i + 1])!]++
const logits = counts.map((row) => row.map((c) => Math.log(c + 0.5)))
const freqRaw = counts.map((row) => row.reduce((a, b) => a + b, 0))
const freqSum = freqRaw.reduce((a, b) => a + b, 0)
const freq = freqRaw.map((f) => f / freqSum)

function softmaxRow(row: number[]): number[] {
  const m = Math.max(...row) // 6장의 max 빼기 — 여기서도 현역
  const e = row.map((v) => Math.exp(v - m))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / s)
}
const P_FP = logits.map(softmaxRow)

function quantLogits(bits: number): number[][] {
  if (bits >= 16) return logits
  const levels = 2 ** (bits - 1) - 1
  return logits.map((row) => {
    const s = Math.max(...row.map(Math.abs)) / levels
    return row.map((v) => Math.round(v / s) * s)
  })
}
/** fp 모델 분포를 기준 진실로 둔 가중 크로스 엔트로피 → PPL (열화 = KL ≥ 0) */
function pplOf(bits: number): number {
  const Pq = quantLogits(bits).map(softmaxRow)
  let H = 0
  for (let i = 0; i < V; i++)
    for (let j = 0; j < V; j++) H += -freq[i] * P_FP[i][j] * Math.log2(Pq[i][j])
  return 2 ** H
}

const LEVELS = [16, 8, 6, 4, 3, 2]
const CURVE = LEVELS.map((b) => ({ bits: b, ppl: pplOf(b) }))
const FP_PPL = CURVE[0].ppl
const degrade = (p: number) => ((p / FP_PPL - 1) * 100)

// ── ① 무릎 곡선 + 분포 돋보기 ─────────────────────────────────
const levelIdx = ref(3) // 기본 int4
const sel = computed(() => CURVE[levelIdx.value])
const CTX_OPTS = ['t', 'a', ' ']
const ctx = ref('t')
const zoom = computed(() => {
  const i = IDX.get(ctx.value)!
  const q = softmaxRow(quantLogits(sel.value.bits)[i])
  return CHARS.map((c, j) => ({ c: c === ' ' ? '␣' : c, fp: P_FP[i][j], q: q[j] }))
})
// SVG 곡선 좌표 (x = 레벨 인덱스 균등, y = 열화 0~9%)
const cx = (k: number) => 30 + (k * 260) / (LEVELS.length - 1)
const cy = (p: number) => 96 - Math.min(9, degrade(p)) * 10
const POLY = CURVE.map((pt, k) => `${cx(k)},${cy(pt.ppl)}`).join(' ')

// ── ② 성적표 + RAM 추천 게임 ──────────────────────────────────
// llama.cpp 커뮤니티 실측 경향을 단순화한 교육용 수치 (7B급)
const REPORT = [
  { tag: 'F16', gb: 13.1, ppl: 5.8 },
  { tag: 'Q8_0', gb: 7.0, ppl: 5.8 },
  { tag: 'Q6_K', gb: 5.4, ppl: 5.81 },
  { tag: 'Q4_K_M', gb: 4.0, ppl: 5.87 },
  { tag: 'Q3_K_M', gb: 3.2, ppl: 6.1 },
  { tag: 'Q2_K', gb: 2.1, ppl: 7.4 },
]
const RAMS = [8, 16, 32]
const ram = ref(8)
const game = computed(() => {
  const limit = ram.value - 4 // 어림 규칙: OS·문맥(KV) 몫으로 4GB 남기기 (정밀 정산은 11장)
  const fits = REPORT.filter((r) => r.gb <= limit)
  const best = fits.reduce((a, b) => (b.ppl < a.ppl ? b : a), fits[0])
  return { limit, best }
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 무릎 곡선 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 무릎 곡선: 우리 미니 모델의 성적표</p>
    <p class="mb-3 text-xs text-slate-500">
      bigram 미니 언어모델(어휘 12자)의 로짓을 b비트로 양자화하고, 원본(fp) 분포를 기준으로
      퍼플렉시티를 잽니다 — 열화의 정체는 5부의 KL(초과 비트)이라 0 아래로 내려갈 수 없어요.
    </p>

    <svg viewBox="0 0 320 120" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <line x1="30" y1="96" x2="290" y2="96" stroke="var(--c-slate-300)" stroke-width="1" />
      <polyline :points="POLY" fill="none" stroke="var(--c-indigo-500)" stroke-width="2" />
      <template v-for="(pt, k) in CURVE" :key="pt.bits">
        <circle :cx="cx(k)" :cy="cy(pt.ppl)" :r="k === levelIdx ? 5 : 3" :fill="k === levelIdx ? 'var(--c-orange-500)' : 'var(--c-indigo-500)'" class="cursor-pointer" @click="levelIdx = k" />
        <text :x="cx(k)" y="112" text-anchor="middle" font-size="9" fill="var(--c-slate-500)">{{ pt.bits === 16 ? 'F16' : pt.bits + 'bit' }}</text>
        <text :x="cx(k)" :y="cy(pt.ppl) - 8" text-anchor="middle" font-size="8" :fill="degrade(pt.ppl) > 2 ? 'var(--c-rose-600)' : 'var(--c-slate-500)'">+{{ degrade(pt.ppl).toFixed(1) }}%</text>
      </template>
    </svg>

    <div class="mt-2 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div class="flex gap-1">
        <button
          v-for="(pt, k) in CURVE"
          :key="pt.bits"
          type="button"
          class="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition"
          :class="k === levelIdx ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'"
          @click="levelIdx = k"
        >
          {{ pt.bits === 16 ? 'F16' : 'int' + pt.bits }}
        </button>
      </div>
      <div>
        <p class="text-xs text-slate-500">퍼플렉시티 (평균 몇 갈래 고민)</p>
        <p class="font-mono text-lg font-bold text-slate-700">{{ sel.ppl.toFixed(3) }} <span class="text-xs font-normal" :class="degrade(sel.ppl) > 2 ? 'text-rose-700' : 'text-emerald-700'">(+{{ degrade(sel.ppl).toFixed(1) }}%)</span></p>
      </div>
    </div>

    <p class="mt-2 mb-1 text-xs font-semibold text-slate-500">🔍 분포 돋보기 — 문맥 "{{ ctx === ' ' ? '␣(공백)' : ctx }}" 다음 글자의 확률분포 (fp vs int{{ sel.bits === 16 ? '없음' : sel.bits }})</p>
    <div class="flex gap-2">
      <button
        v-for="c in CTX_OPTS"
        :key="c"
        type="button"
        class="rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition"
        :class="ctx === c ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="ctx = c"
      >
        {{ c === ' ' ? '␣' : c }}
      </button>
    </div>
    <div class="mt-2 grid grid-cols-12 items-end gap-1" style="height: 72px">
      <div v-for="z in zoom" :key="z.c" class="flex h-full flex-col items-center justify-end gap-0.5">
        <div class="flex w-full flex-1 items-end justify-center gap-0.5">
          <div class="w-1.5 rounded-t bg-indigo-400" :style="{ height: z.fp * 100 + '%' }" />
          <div class="w-1.5 rounded-t bg-orange-400" :style="{ height: z.q * 100 + '%' }" />
        </div>
        <span class="font-mono text-xs text-slate-500">{{ z.c }}</span>
      </div>
    </div>
    <p class="text-xs text-slate-500">■ 파랑 = fp 원본 · ■ 주황 = 양자화 — int2 로 내려 보세요, 분포가 뭉개집니다.</p>

    <p class="mt-2 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      👀 무릎이 보이나요 — <b>8~4비트는 거의 공짜(+0.2% 이하), 3비트부터 오르막, 2비트에서
      +8% 폭등.</b> 국민 태그가 q4 인 이유가 이 무릎 위에 앉아 있습니다. 그리고 열화가 절대
      음수가 안 되는 이유: 이 측정의 정체가 <b>KL 발산(초과 비트, 5부)</b>이기 때문이에요.
    </p>

    <!-- ② 성적표 + RAM 게임 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 성적표 읽기: 내 RAM 의 최선은?</p>
    <p class="mb-3 text-xs text-slate-500">
      실전 스타일 성적표(7B급, llama.cpp 커뮤니티 실측 경향을 단순화한 교육용 수치)입니다.
      RAM 을 고르면 어림 규칙(파일 + 4GB 여유 ≤ RAM)으로 최선의 태그를 추천합니다.
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="r in RAMS"
        :key="r"
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="ram === r ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="ram = r"
      >
        RAM {{ r }}GB
      </button>
    </div>

    <div class="mt-2 overflow-x-auto">
      <table class="w-full text-right font-mono text-xs text-slate-600">
        <thead>
          <tr class="text-slate-500">
            <th class="p-1.5 text-left font-normal">태그</th>
            <th class="p-1.5 font-normal">크기</th>
            <th class="p-1.5 font-normal">PPL</th>
            <th class="p-1.5 font-normal">열화</th>
            <th class="p-1.5 font-normal">판정</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in REPORT" :key="r.tag" class="border-t border-slate-100" :class="r.tag === game.best?.tag ? 'bg-emerald-50 font-bold' : ''">
            <td class="p-1.5 text-left">{{ r.tag }}{{ r.tag === game.best?.tag ? ' 🏆' : '' }}</td>
            <td class="p-1.5">{{ r.gb.toFixed(1) }}GB</td>
            <td class="p-1.5">{{ r.ppl.toFixed(2) }}</td>
            <td class="p-1.5" :class="r.ppl / 5.8 > 1.02 ? 'text-rose-700' : 'text-emerald-700'">+{{ ((r.ppl / 5.8 - 1) * 100).toFixed(1) }}%</td>
            <td class="p-1.5">{{ r.gb <= game.limit ? '✅ 들어감' : '❌ 초과' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-2 rounded-lg bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
      🏆 RAM {{ ram }}GB → 한도 {{ game.limit }}GB(여유 4GB 제외) → 추천 <b>{{ game.best?.tag }}</b>
      ({{ game.best?.gb.toFixed(1) }}GB, PPL {{ game.best?.ppl.toFixed(2) }}) — 들어가는 것 중
      성적이 가장 좋은 태그. 파일이 RAM 에 "딱 맞으면" 안 되는 이유(문맥·OS 몫)와 정밀 정산은
      11장 캡스톤에서.
    </p>
  </div>
</template>
