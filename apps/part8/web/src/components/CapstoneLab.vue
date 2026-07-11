<script setup lang="ts">
// ch11 캡스톤 — ① 미니 조련 튜너: 다이얼 3종(보폭·일정표·목줄) 12조합 그리드, 미션 eval ≤ 0.15.
//   합격 조합은 단 하나(lr 적당 + 워밍업·코사인 + weight decay) = 실전 기본값 — 각 실패가 앞 장의 교훈.
// ② 설정 파일 완독기: 진짜 파인튜닝 config 12줄을 한 줄씩 클릭해 완독 — 졸업장.
// 무대는 7~8장 그대로(시드 101/102), 기울기 노이즈 시드 42 공통. 오프라인·결정적.
import { computed, ref, watch } from 'vue'

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function gaussian(rand: () => number) {
  let s = 0
  for (let i = 0; i < 12; i++) s += rand()
  return s - 6
}
function chebRow(x: number): number[] {
  const T = [1, x]
  for (let k = 2; k <= 9; k++) T.push(2 * x * T[k - 1]! - T[k - 2]!)
  return T
}
function makeData(n: number, seed: number) {
  const rand = mulberry32(seed)
  const xs: number[] = []
  const ys: number[] = []
  for (let i = 0; i < n; i++) {
    let x = -1 + (2 * i) / (n - 1) + (rand() * 0.08 - 0.04)
    x = Math.max(-1, Math.min(1, x))
    xs.push(x)
    ys.push(Math.sin(2.5 * x) + 0.25 * gaussian(rand))
  }
  return { xs, ys }
}
const TRAIN = makeData(10, 101)
const VAL = makeData(30, 102)
const Ft = TRAIN.xs.map(chebRow)
const Fv = VAL.xs.map(chebRow)

// ── ① 미니 조련 튜너 ────────────────────────────────
const LRS = [0.0003, 0.05, 2.0]
const LR_LABELS = ['0.0003 (잔걸음)', '0.05 (성큼)', '2.0 (거인 걸음)']
const SCHED_LABELS = ['고정', '워밍업 + 코사인']
const LAM_LABELS = ['없음', 'λ = 0.03']
const lrIdx = ref(1)
const schedIdx = ref(0)
const lamIdx = ref(0)
const ran = ref(false)
const tried = ref<Set<string>>(new Set())
watch([lrIdx, schedIdx, lamIdx, ran], () => {
  if (ran.value) tried.value = new Set([...tried.value, `${lrIdx.value}-${schedIdx.value}-${lamIdx.value}`])
})

const STEPS = 3000
function trainRun(lr0: number, cosine: boolean, lam: number) {
  const rand = mulberry32(42) // 노이즈 시드 공통 — 조합 간 공정 비교
  const w = new Array<number>(10).fill(0)
  const trs: number[] = []
  const vas: number[] = []
  let tailSum = 0
  for (let t = 0; t < STEPS; t++) {
    let lr = lr0
    if (cosine) lr = lr0 * Math.min(1, (t + 1) / 100) * 0.5 * (1 + Math.cos((Math.PI * t) / STEPS))
    const g = new Array<number>(10).fill(0)
    let loss = 0
    for (let i = 0; i < Ft.length; i++) {
      const r = Ft[i]!.reduce((s, f, k) => s + f * w[k]!, 0) - TRAIN.ys[i]!
      loss += r * r
      for (let k = 0; k < 10; k++) g[k]! += (2 * r * Ft[i]![k]!) / Ft.length
    }
    for (let k = 0; k < 10; k++) w[k]! -= lr * (g[k]! + 2 * lam * w[k]! + 0.3 * gaussian(rand))
    if (!Number.isFinite(w[0]!)) return { diverged: true as const, trs, vas, tail: Infinity }
    if (t % 20 === 0) {
      trs.push(loss / Ft.length)
      vas.push(Fv.reduce((s, f, i) => s + (f.reduce((a, t2, k) => a + t2 * w[k]!, 0) - VAL.ys[i]!) ** 2, 0) / Fv.length)
    }
    if (t >= STEPS - 100)
      tailSum += Fv.reduce((s, f, i) => s + (f.reduce((a, t2, k) => a + t2 * w[k]!, 0) - VAL.ys[i]!) ** 2, 0) / Fv.length
  }
  return { diverged: false as const, trs, vas, tail: tailSum / 100 }
}
const result = computed(() => {
  if (!ran.value) return null
  return trainRun(LRS[lrIdx.value]!, schedIdx.value === 1, lamIdx.value === 1 ? 0.03 : 0)
})
const passed = computed(() => result.value !== null && !result.value.diverged && result.value.tail <= 0.15)
const verdict = computed(() => {
  const r = result.value
  if (!r) return ''
  if (r.diverged)
    return '💥 발산(NaN) — 거인 걸음 2.0은 이 지형의 경계(2장 2/c) 밖입니다. 일정표를 바꿔도, 목줄을 채워도 못 구해요 — 보폭 자릿수부터 고치세요.'
  if (lrIdx.value === 0)
    return `❌ 미도달(${r.tail.toFixed(3)}) — 잔걸음은 3,000스텝에도 아직 내려가는 중입니다(2장 소심이)${schedIdx.value === 1 ? '. 코사인 감쇠가 작은 보폭을 더 깎아 오히려 느려졌어요' : ''}. 보폭 자릿수를 올리세요.`
  if (schedIdx.value === 0 && lamIdx.value === 0)
    return `❌ ${r.tail.toFixed(3)} — 두 병이 겹쳤습니다: 큰 고정 보폭의 서성임(6장) + 목줄 없는 암기의 벌어짐(7장). 검증 곡선이 최저를 찍고 되오르는 모양을 보세요.`
  if (schedIdx.value === 0)
    return `❌ ${r.tail.toFixed(3)} — 아깝습니다! 목줄이 암기는 막았지만, 고정 보폭이라 바닥 근처에서 서성이다 끝났어요(6장). 후반 잔걸음(감쇠)이 필요합니다.`
  if (lamIdx.value === 0)
    return `❌ ${r.tail.toFixed(3)} — 감쇠가 보폭을 얼리기 전에 이미 암기가 진행됐습니다(7장 벌어짐). 코사인만으로는 부족 — 목줄(8장)을 채우세요.`
  return `✅ 합격! ${r.tail.toFixed(3)} — 적당한 보폭(2장) + 워밍업·코사인(6장) + 목줄(8장). 실전 기본값 조합이 왜 기본값인지의 증명입니다: 각 다이얼이 서로 다른 실패를 하나씩 막았어요.`
})
// 손실 곡선 (linear y, 0~1.2 클램프)
const cy = (l: number) => 102 - (Math.min(l, 1.2) / 1.2) * 92
const linePath = (ls: number[]) => ls.map((l, i) => `${(15 + (i / 149) * 275).toFixed(1)},${cy(l).toFixed(1)}`).join(' ')

// ── ② 설정 파일 완독기 ──────────────────────────────
interface Line {
  key: string
  val: string
  ch: string
  text: string
}
const CONFIG: Line[] = [
  { key: 'model', val: 'llama-3-8b', ch: '6부', text: '조련 대상(6부). 8B = 파라미터 80억 개 — 우리가 여행한 손실 지형의 차원 수(1·10장)이기도 합니다.' },
  { key: 'dataset', val: 'company_qa_1200', ch: '6부 3장', text: 'SFT 시범 데이터 1,200쌍(6부 3장). 용량(80억 다이얼) 대비 데이터가 적으니 과적합(7장)을 처음부터 경계해야 합니다.' },
  { key: 'num_epochs', val: '3', ch: '3·7장', text: '전체 데이터를 3바퀴(3장 에포크). 소량 데이터 × 여러 에포크 = 같은 문제를 반복해 본 학생 — eval이 벌어지면 제일 먼저 줄일 다이얼(7장).' },
  { key: 'batch_size', val: '16', ch: '3장', text: '나침반을 16개 표본 평균으로 — 흔들림은 σ/√16 = σ/4(3장). 실전 상한은 GPU 메모리. 키우면 lr도 함께(linear scaling).' },
  { key: 'learning_rate', val: '2e-5', ch: '2장', text: '보폭(2장). 수십억 차원 지형은 어느 방향인가의 곡률이 크기 마련이라 발산 경계 2/c가 예민 — 그래서 이렇게 작습니다. 튜너에서 봤듯 자릿수가 틀리면 나머지 다이얼로 못 구해요.' },
  { key: 'lr_scheduler', val: 'cosine', ch: '6장', text: '여행 일정표(6장) — 중반 절반, 끝 0. 후반 잔걸음이 서성임 반경(∝ √보폭)을 죽여 바닥에 정확히 앉힙니다.' },
  { key: 'warmup_steps', val: '100', ch: '5·6장', text: '출발 잔걸음 100스텝(6장) — Adam의 자(v̂) 예열(5장) + 낯선 초기 지형(2장) 보호. 초반 한정 스파이크(9장)의 처방이기도.' },
  { key: 'optimizer', val: 'adamw', ch: '4·5·8장', text: 'Adam(5장) = 모멘텀(4장 방향 EMA, β₁) + RMS(크기 EMA, β₂)로 축마다 다른 보폭 — 뒤의 W는 분리(decoupled)된 weight decay(8장).' },
  { key: 'weight_decay', val: '0.01', ch: '8장', text: '원점 목줄(8장) — 암기에 필요한 큰 계수에 벌점 λ‖w‖². 매 스텝 (1−2·lr·λ)를 곱하는 감쇠. 6부 6장 KL 목줄의 형제.' },
  { key: 'max_grad_norm', val: '1.0', ch: '9장', text: '그래디언트 클리핑(9장) — 기울기 노름이 1.0을 넘으면 방향은 그대로, 크기만 절단. 이상치 배치가 만드는 스파이크·발산의 보험.' },
  { key: 'eval_steps', val: '50', ch: '7·9장', text: '50스텝마다 봉인된 시험(검증, 7장)을 치러 훈련 일지에 eval_loss를 찍습니다 — 9장에서 배운 그 곡선. 이것이 없으면 암기가 보이지 않아요.' },
  { key: 'early_stopping_patience', val: '3', ch: '7·8장', text: '조기 종료(8장) — 검증이 3회 연속 나빠지면 하차하고 최저점 모델 채택. 벌어짐(7장)의 자동 처방.' },
]
const readSet = ref<Set<number>>(new Set())
const openIdx = ref<number | null>(null)
function openLine(i: number) {
  openIdx.value = openIdx.value === i ? null : i
  readSet.value = new Set([...readSet.value, i])
}
const allRead = computed(() => readSet.value.size === CONFIG.length)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 미니 조련 튜너 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 미니 조련 튜너: 미션, eval을 0.15 이하로 정착시켜라</p>
    <p class="mb-3 text-xs text-slate-400">
      7~8장의 그 무대(점 10개 · 차수 9 · 노이즈 낀 기울기 · 3,000스텝)입니다. 다이얼 3종 ×
      12조합 중 <b>미션에 성공하는 조합</b>을 찾아 보세요 — 실패에도 전부 진단이 붙습니다.
    </p>

    <div class="space-y-2 text-xs">
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="w-24 shrink-0 text-slate-400">보폭 lr</span>
        <button v-for="(l, i) in LR_LABELS" :key="l" type="button" class="rounded-lg px-2.5 py-1 font-semibold transition" :class="lrIdx === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'" @click="lrIdx = i">{{ l }}</button>
      </div>
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="w-24 shrink-0 text-slate-400">일정표</span>
        <button v-for="(l, i) in SCHED_LABELS" :key="l" type="button" class="rounded-lg px-2.5 py-1 font-semibold transition" :class="schedIdx === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'" @click="schedIdx = i">{{ l }}</button>
      </div>
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="w-24 shrink-0 text-slate-400">목줄 (decay)</span>
        <button v-for="(l, i) in LAM_LABELS" :key="l" type="button" class="rounded-lg px-2.5 py-1 font-semibold transition" :class="lamIdx === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'" @click="lamIdx = i">{{ l }}</button>
      </div>
    </div>

    <button
      v-if="!ran"
      type="button"
      class="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
      @click="ran = true"
    >
      🏋️ 훈련 실행 (3,000스텝)
    </button>

    <template v-if="result">
      <div v-if="result.diverged" class="mt-3 rounded-lg bg-rose-50 p-5 text-center">
        <p class="text-2xl">💥</p>
        <p class="mt-1 font-mono text-sm font-bold text-rose-600">loss = NaN</p>
      </div>
      <svg v-else viewBox="0 0 300 112" class="mt-3 w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
        <line x1="15" :y1="cy(0.15)" x2="290" :y2="cy(0.15)" stroke="#059669" stroke-width="0.8" stroke-dasharray="3 3" />
        <text x="288" :y="cy(0.15) - 3" text-anchor="end" font-size="7" fill="#059669">미션 기준 0.15</text>
        <polyline :points="linePath(result.trs)" fill="none" stroke="#4f46e5" stroke-width="1" opacity="0.45" />
        <polyline :points="linePath(result.vas)" fill="none" stroke="#e11d48" stroke-width="1.5" />
        <text x="18" y="12" font-size="7" fill="#94a3b8">보라 = 훈련 · 빨강 = 검증 (선형, 1.2 절단)</text>
      </svg>

      <div class="mt-2 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
        <div class="text-center">
          <p class="text-[11px] text-slate-400">최종 검증 (마지막 100스텝 평균)</p>
          <p class="font-mono text-lg font-bold" :class="passed ? 'text-emerald-600' : 'text-rose-600'">{{ result.diverged ? 'NaN' : result.tail.toFixed(3) }}</p>
        </div>
        <div class="text-center">
          <p class="text-[11px] text-slate-400">미션</p>
          <p class="text-lg font-bold" :class="passed ? 'text-emerald-600' : 'text-rose-600'">{{ passed ? '✅ 성공' : '❌ 실패' }}</p>
        </div>
        <div class="text-center">
          <p class="text-[11px] text-slate-400">시도한 조합</p>
          <p class="font-mono text-lg font-bold text-indigo-600">{{ tried.size }} / 12</p>
        </div>
      </div>

      <p class="mt-3 rounded-lg p-3 text-sm leading-relaxed" :class="passed ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'">
        {{ verdict }}
      </p>
    </template>

    <!-- ② 설정 파일 완독기 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 설정 파일 완독기: 졸업 시험</p>
    <p class="mb-3 text-xs text-slate-400">
      실전 파인튜닝 설정 파일입니다. <b>모든 줄을 클릭해</b> 그 줄의 수학을 확인하세요 —
      완독 <b class="text-indigo-600">{{ readSet.size }} / {{ CONFIG.length }}</b>
    </p>

    <div class="overflow-hidden rounded-lg bg-slate-900 py-2 font-mono text-xs">
      <template v-for="(line, i) in CONFIG" :key="line.key">
        <button
          type="button"
          class="config-line block w-full px-4 py-1 text-left transition hover:bg-slate-700/60"
          :class="openIdx === i ? 'bg-slate-700/80' : ''"
          @click="openLine(i)"
        >
          <span class="text-sky-300">{{ line.key }}</span><span class="text-slate-500">:</span>
          <span class="text-amber-200"> {{ line.val }}</span>
          <span v-if="readSet.has(i)" class="float-right text-emerald-400">✓ {{ line.ch }}</span>
          <span v-else class="float-right text-slate-600">?</span>
        </button>
        <p v-if="openIdx === i" class="border-l-2 border-indigo-400 bg-slate-800 px-4 py-2 font-sans text-[11px] leading-relaxed text-slate-200">
          {{ line.text }}
        </p>
      </template>
    </div>

    <div v-if="allRead" class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
      <p class="text-2xl">🎓</p>
      <p class="mt-1 font-semibold text-emerald-800">완독 — 설정 파일에 모르는 줄이 없습니다!</p>
      <p class="mt-1 text-xs leading-relaxed text-emerald-700">
        워밍업의 질문 "수학은 같은데 왜 운명이 갈리나"에 이제 답할 수 있어요 —
        운명은 다이얼이 정하고, 다이얼의 수학을 당신이 읽게 됐으니까요.
      </p>
    </div>
  </div>
</template>
