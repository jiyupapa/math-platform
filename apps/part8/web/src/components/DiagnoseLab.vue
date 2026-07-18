<script setup lang="ts">
// ch9 인터랙티브 — ① 증상 도감: 4대 증상(스파이크·평원·계단·벌어짐) 재현 + 처방 토글.
//                 ② 판독 훈련소: 6라운드 훈련 일지 진단 연습 (정답 순서: 평원·스파이크·벌어짐·계단·스파이크·벌어짐).
// 전부 앞 장들의 실제 시뮬(이차 골짜기 SGD·체비쇼프 GD) — 시드 고정, 오프라인·결정적.
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

// ── 증상 시뮬레이터 (2~8장의 무대 재사용) ──────────────────────
// 스파이크: 이차 골짜기 SGD + 드문 이상치 배치(노이즈 ×30). clip = |g| ≤ 3 (그래디언트 클리핑)
function spikeSim(seed: number, outs: number[], clip: boolean): number[] {
  const rand = mulberry32(seed)
  let w = 6
  const losses: number[] = []
  for (let t = 0; t < 160; t++) {
    let noise = 0.3 * gaussian(rand)
    if (outs.includes(t)) noise *= 30
    let g = 2 * w + noise
    if (clip) g = Math.sign(g) * Math.min(Math.abs(g), 3)
    w -= 0.15 * g
    losses.push(w * w)
  }
  return losses
}
// 평원: 굶주린 보폭 (2장 소심이)
function plateauSim(seed: number, lr: number): number[] {
  const rand = mulberry32(seed)
  let w = 8
  const losses: number[] = []
  for (let t = 0; t < 160; t++) {
    w -= lr * (2 * w + 0.1 * gaussian(rand))
    losses.push(w * w)
  }
  return losses
}
// 계단: 스텝 감쇠 일정표의 지문 (6장 — 서성임 반경 ∝ 보폭)
const stairLr = (t: number) => (t < 55 ? 0.3 : t < 105 ? 0.09 : 0.027)
function stairSim(seed: number): number[] {
  const rand = mulberry32(seed)
  let w = 8
  const losses: number[] = []
  for (let t = 0; t < 160; t++) {
    w -= stairLr(t) * (2 * w + 1.2 * gaussian(rand))
    losses.push(w * w)
  }
  return losses
}
// 벌어짐: 7~8장의 체비쇼프 GD (train/val, ±weight decay)
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
function divergeSim(st: number, sv: number, lam: number) {
  const tr = makeData(10, st)
  const va = makeData(30, sv)
  const Ft = tr.xs.map(chebRow)
  const Fv = va.xs.map(chebRow)
  const w = new Array<number>(10).fill(0)
  const trs: number[] = []
  const vas: number[] = []
  for (let t = 0; t < 3000; t++) {
    const g = new Array<number>(10).fill(0)
    let loss = 0
    for (let i = 0; i < Ft.length; i++) {
      const r = Ft[i]!.reduce((s, f, k) => s + f * w[k]!, 0) - tr.ys[i]!
      loss += r * r
      for (let k = 0; k < 10; k++) g[k]! += (2 * r * Ft[i]![k]!) / Ft.length
    }
    for (let k = 0; k < 10; k++) w[k]! -= 0.05 * (g[k]! + 2 * lam * w[k]!)
    if (t % 20 === 0) {
      trs.push(loss / Ft.length)
      vas.push(Fv.reduce((s, f, i) => s + (f.reduce((a, t2, k) => a + t2 * w[k]!, 0) - va.ys[i]!) ** 2, 0) / Fv.length)
    }
  }
  return { trs, vas }
}

// ── SVG 렌더 (탭마다 로그/선형 선택) ──────────────────────────
interface Curve {
  pts: number[]
  color: string
  width?: number
  opacity?: number
}
function path(pts: number[], yOf: (l: number) => number): string {
  return pts.map((l, i) => `${(15 + (i / (pts.length - 1)) * 275).toFixed(1)},${yOf(l).toFixed(1)}`).join(' ')
}
const logY = (lo: number, hi: number) => (l: number) => {
  const v = Math.log10(Math.max(l, lo))
  return 102 - ((v - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * 92
}
const linY = (hi: number) => (l: number) => 102 - (Math.min(l, hi) / hi) * 92

// ── ① 증상 도감 ────────────────────────────────────────────────
const TABS = ['⚡ 스파이크', '🏜️ 평원', '🪜 계단', '↔️ 벌어짐'] as const
const tab = ref(0)
const fix = ref(false)
watch(tab, () => {
  fix.value = false
})
const FIX_LABELS = ['✂️ 처방 적용 — 클리핑 |g| ≤ 3', '💊 처방 적용 — 보폭 ×100', '🔍 원인 보기 — lr 일정표 겹치기', '🦮 처방 적용 — weight decay λ=0.03']

const spikeNo = spikeSim(901, [55, 120], false)
const spikeYes = spikeSim(901, [55, 120], true)
const platFlat = plateauSim(910, 0.0006)
const platFix = plateauSim(910, 0.06)
const stairL = stairSim(937)
const divFree = divergeSim(101, 102, 0)
const divLeash = divergeSim(101, 102, 0.03)

const spikeCut = (Math.max(...spikeNo.slice(50)) / Math.max(...spikeYes.slice(50))).toFixed(0)
const divRatio = (divFree.vas[divFree.vas.length - 1]! / Math.min(...divFree.vas)).toFixed(1)

const gallery = computed(() => {
  if (tab.value === 0) {
    const y = logY(1e-3, 10)
    const curves: Curve[] = [{ pts: spikeNo, color: '#e11d48' }]
    if (fix.value) curves.push({ pts: spikeYes, color: '#059669', width: 1.8 })
    return {
      y, curves, yLabel: '손실 (log)',
      cause: '원인: 드문 이상치 배치 — 순간 기울기가 폭주해 보폭 × 기울기가 골짜기를 건너뜀(2장 경계 초과). 초반에만 몰리면 워밍업 부족(6장).',
      verdict: fix.value
        ? `클리핑이 이상치 걸음의 크기를 잘라 스파이크가 ${spikeCut}분의 1로 — 방향은 그대로, 크기만 제한(초록). 설정: max_grad_norm.`
        : '봉우리가 두 번 솟았죠 — 회복은 했지만 위험 신호입니다. 처방을 적용해 보세요.',
    }
  }
  if (tab.value === 1) {
    const y = logY(1e-4, 100)
    const curves: Curve[] = [{ pts: platFlat, color: '#e11d48' }]
    if (fix.value) curves.push({ pts: platFix, color: '#059669', width: 1.8 })
    return {
      y, curves, yLabel: '손실 (log)',
      cause: '원인 후보 둘: ① 보폭 과소(2장 소심이 — 기울기는 멀쩡한데 걸음이 티끌) ② 진짜 지형 평원(1장 — 기울기 자체가 0 근처, 10장에서 재회). 구분법: 개입해 보기.',
      verdict: fix.value
        ? `보폭 ×100에 즉시 반응 — 범인은 보폭 과소였습니다(초록: ${platFix[159]!.toFixed(4)}까지 하강). 반응이 없었다면 지형 평원 쪽.`
        : `160스텝 동안 ${platFlat[0]!.toFixed(0)} → ${platFlat[159]!.toFixed(0)} — 거의 제자리. 처방(개입 실험)을 적용해 보세요.`,
    }
  }
  if (tab.value === 2) {
    const y = logY(1e-4, 100)
    const curves: Curve[] = [{ pts: stairL, color: '#4f46e5' }]
    if (fix.value) curves.push({ pts: Array.from({ length: 160 }, (_, t) => stairLr(t)), color: '#0ea5e9', width: 1.2 })
    return {
      y, curves, yLabel: '손실 (log)',
      cause: '이건 병이 아닙니다 — 스텝 감쇠 일정표(6장)의 지문이에요. 서성임 반경 ∝ 보폭이라, lr이 뚝 떨어질 때마다 손실도 한 단 내려앉습니다.',
      verdict: fix.value
        ? '하늘색 = lr 일정표(0.3 → 0.09 → 0.027). 손실의 계단과 정확히 같은 시점 — 무늬의 주인은 일정표였습니다.'
        : '일정한 간격으로 뚝, 뚝 — 원인 보기를 눌러 일정표와 겹쳐 보세요.',
    }
  }
  const y = linY(1.2)
  const curves: Curve[] = [
    { pts: divFree.trs, color: '#4f46e5', width: 1, opacity: 0.45 },
    { pts: divFree.vas, color: '#e11d48' },
  ]
  if (fix.value) curves.push({ pts: divLeash.vas, color: '#059669', width: 1.8 })
  return {
    y, curves, yLabel: '손실 (선형) — 훈련(보라)·검증(빨강)',
    cause: `원인: 과적합 시작(7장) — 훈련은 계속 내려가는데 검증이 돌아서서 ${divRatio}배 되오름. 규칙 학습이 끝나고 암기가 시작된 순간.`,
    verdict: fix.value
      ? '목줄(8장)을 채우자 검증(초록)이 끝까지 최저 수준 — 벌어짐 자체가 사라졌습니다. 조기 종료·데이터 늘리기도 같은 병의 처방.'
      : '두 곡선이 벌어지는 지점이 보이죠 — 처방을 적용해 보세요.',
  }
})

// ── ② 판독 훈련소 ──────────────────────────────────────────────
// 정답 순서(결정적): 평원 → 스파이크 → 벌어짐 → 계단 → 스파이크 → 벌어짐
interface Round {
  kind: number // TABS 인덱스
  train: number[]
  val: number[]
  log: boolean
  note: string
}
function withVal(train: number[], seed: number): { train: number[]; val: number[] } {
  const rand = mulberry32(seed)
  return { train, val: train.map((l) => l * (1.06 + 0.12 * rand())) }
}
const div1 = divergeSim(55, 56, 0)
const div2 = divergeSim(301, 302, 0)
const ROUNDS: Round[] = [
  { kind: 1, ...withVal(plateauSim(911, 0.0006), 71), log: true, note: '높은 손실에서 거의 제자리 — 보폭 과소 또는 지형 평원. 개입(lr↑)으로 구분.' },
  { kind: 0, ...withVal(spikeSim(902, [80], false), 72), log: true, note: '스텝 80의 고립된 봉우리 — 이상치 배치·순간 경계 초과. 클리핑이 보험.' },
  { kind: 3, train: div1.trs, val: div1.vas, log: false, note: '훈련↓ 검증↑ — 과적합 시작. 조기 종료·weight decay·데이터 늘리기.' },
  { kind: 2, ...withVal(stairSim(941), 73), log: true, note: '일정 간격의 계단 — 스텝 감쇠 일정표의 지문. 병이 아니라 정상 무늬.' },
  { kind: 0, ...withVal(spikeSim(903, [40, 115], false), 74), log: true, note: '두 번의 봉우리, 회복은 함 — 반복되면 lr↓ 또는 max_grad_norm 설정.' },
  { kind: 3, train: div2.trs, val: div2.vas, log: false, note: '중반부터 벌어짐 — eval_loss가 돌아서는 순간이 멈출 자리였습니다.' },
]
const round = ref(0)
const answered = ref<number | null>(null)
const score = ref(0)
const done = ref(false)
const cur = computed(() => ROUNDS[Math.min(round.value, ROUNDS.length - 1)]!)
const curY = computed(() => (cur.value.log ? logY(1e-4, 100) : linY(1.2)))
function answer(k: number) {
  if (answered.value !== null) return
  answered.value = k
  if (k === cur.value.kind) score.value++
}
function next() {
  if (round.value >= ROUNDS.length - 1) {
    done.value = true
    return
  }
  round.value++
  answered.value = null
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 증상 도감 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 증상 도감: 4대 무늬와 처방</p>
    <p class="mb-3 text-xs text-slate-400">
      전부 앞 장들의 무대에서 실제로 돌린 훈련입니다. 증상을 하나씩 보고 <b>처방을 적용</b>해 보세요.
    </p>

    <div class="mb-2 flex flex-wrap gap-1.5">
      <button
        v-for="(t, i) in TABS"
        :key="t"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="tab === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
        @click="tab = i"
      >{{ t }}</button>
    </div>

    <svg viewBox="0 0 300 112" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <polyline
        v-for="(c, i) in gallery.curves"
        :key="i"
        :points="path(c.pts, gallery.y)"
        fill="none"
        :stroke="c.color"
        :stroke-width="c.width ?? 1.5"
        :opacity="c.opacity ?? 0.9"
      />
      <text x="18" y="12" font-size="7" fill="#94a3b8">{{ gallery.yLabel }}</text>
    </svg>

    <p class="mt-2 text-xs leading-relaxed text-slate-600">{{ gallery.cause }}</p>

    <button
      type="button"
      class="mt-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
      :class="fix ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'"
      @click="fix = !fix"
    >{{ FIX_LABELS[tab] }}</button>

    <p class="mt-2 rounded-lg p-3 text-xs leading-relaxed" :class="fix ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-500'">
      {{ fix ? '✅ ' : '' }}{{ gallery.verdict }}
    </p>

    <!-- ② 판독 훈련소 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 판독 훈련소: 일지 6장, 당신의 진단은?</p>
    <p class="mb-3 text-xs text-slate-400">
      새 훈련 일지 6장(전부 실제 시뮬, <span class="text-indigo-500">보라 = 훈련</span> ·
      <span class="text-rose-500">빨강 = 검증</span>)을 진단하세요.
    </p>

    <template v-if="!done">
      <p class="mb-1 text-xs font-semibold text-slate-500">일지 {{ round + 1 }} / {{ ROUNDS.length }} <span class="ml-2 font-normal text-slate-400">맞힌 수: {{ score }}</span></p>
      <svg viewBox="0 0 300 112" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
        <polyline :points="path(cur.train, curY)" fill="none" stroke="#4f46e5" stroke-width="1.2" opacity="0.6" />
        <polyline :points="path(cur.val, curY)" fill="none" stroke="#e11d48" stroke-width="1.5" />
        <text x="18" y="12" font-size="7" fill="#94a3b8">{{ cur.log ? '손실 (log)' : '손실 (선형)' }}</text>
      </svg>

      <div class="mt-2 flex flex-wrap gap-1.5">
        <button
          v-for="(t, i) in TABS"
          :key="t"
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60"
          :class="
            answered === null ? 'bg-slate-100 text-slate-600 hover:bg-indigo-100'
            : i === cur.kind ? 'bg-emerald-600 text-white'
            : i === answered ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'
          "
          :disabled="answered !== null"
          @click="answer(i)"
        >{{ t }}</button>
      </div>

      <div v-if="answered !== null" class="mt-2 rounded-lg p-3 text-xs leading-relaxed" :class="answered === cur.kind ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'">
        {{ answered === cur.kind ? '✅ 정답! ' : `❌ 정답은 ${TABS[cur.kind]} — ` }}{{ cur.note }}
        <button type="button" class="ml-2 rounded-md bg-white/70 px-2 py-0.5 font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-white" @click="next">
          {{ round >= ROUNDS.length - 1 ? '결과 보기' : '다음 일지 →' }}
        </button>
      </div>
    </template>

    <div v-else class="rounded-lg bg-indigo-50 p-4 text-sm leading-relaxed text-indigo-900">
      🩺 판독 결과: <b>{{ score }} / {{ ROUNDS.length }}</b> —
      <template v-if="score >= 5">곡선만 보고 다이얼을 지목할 수 있게 됐습니다. 실전 일지 앞에서도 같은 순서로: 모양 → 시점 → 용의자 → 개입.</template>
      <template v-else>도감(실험 ①)을 다시 훑고 재도전해 보세요 — 무늬와 시점이 힌트의 전부입니다.</template>
      <button type="button" class="ml-2 rounded-md bg-white/70 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-white" @click="round = 0; answered = null; score = 0; done = false">다시 풀기</button>
    </div>
  </div>
</template>
