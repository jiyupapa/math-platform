<script setup lang="ts">
// ch7 인터랙티브 — ① 세 자 대조기: 같은 수를 fp32/fp16/bf16 에 담아 저장값·오차·생사 비교
//                 ② 누적 실험: 저장도 누적도 fp16 vs "저장은 fp16, 누적은 fp32" (혼합 정밀도의 심장)
//                 ③ loss scaling 구급차: 작은 gradient 를 살리는 확대→저장→복원.
// 오프라인·결정적 — fp16/bf16 을 비트 수준으로 재현(RNE 반올림). 노트북 np.float16 과 대조 검증됨.
import { computed, ref } from 'vue'

const dv4 = new DataView(new ArrayBuffer(4))
const f = Math.fround

/** fp32 로 먼저 담근 뒤 fp16 으로 반올림(RNE)한 값 */
function toF16(x: number): number {
  if (Number.isNaN(x)) return NaN
  dv4.setFloat32(0, x)
  const b = dv4.getUint32(0)
  const sign = b >>> 31 ? -1 : 1
  const exp = (b >>> 23) & 0xff
  const frac = b & 0x7fffff
  if (exp === 0xff) return frac ? NaN : sign * Infinity
  const e16 = exp - 112 // = exp − 127 + 15
  if (e16 >= 31) return sign * Infinity // 자의 끝(65,504) 너머
  if (e16 <= 0) {
    if (e16 < -10) return sign * 0 // 너무 작아 0 으로
    const m = frac | 0x800000 // 숨은 1 복원
    const shift = 14 - e16
    let half = m >>> shift
    const round = (m >>> (shift - 1)) & 1
    const sticky = (m & ((1 << (shift - 1)) - 1)) !== 0
    if (round && (sticky || (half & 1))) half++
    return sign * half * 2 ** -24 // 비정규 (half 가 1024 면 자연히 최소 정규)
  }
  let half = frac >>> 13
  let he = e16
  const round = (frac >>> 12) & 1
  const sticky = (frac & 0xfff) !== 0
  if (round && (sticky || (half & 1))) {
    half++
    if (half === 1024) {
      half = 0
      he++
    }
  }
  if (he >= 31) return sign * Infinity
  return sign * (1 + half / 1024) * 2 ** (he - 15)
}

/** bf16 = fp32 의 위쪽 16비트만 남기고 아래 16비트를 RNE 반올림 */
function toBf16(x: number): number {
  if (!Number.isFinite(x)) return x
  dv4.setFloat32(0, x)
  let u = dv4.getUint32(0)
  const lsb = (u >>> 16) & 1
  u = (u + 0x7fff + lsb) >>> 0
  dv4.setUint32(0, u & 0xffff0000)
  return dv4.getFloat32(0)
}

// ── ① 세 자 대조기 ────────────────────────────────────────────
const PRESETS = ['0.1', '3.14159', '70000', '0.00000002']
const inputText = ref('0.1')
const x = computed(() => Number(inputText.value))

interface RulerRow {
  name: string
  bits: string
  value: number
}
const rows = computed<RulerRow[]>(() => [
  { name: 'fp32 (지수 8 + 가수 23)', bits: '4바이트', value: f(x.value) },
  { name: 'fp16 (지수 5 + 가수 10)', bits: '2바이트', value: toF16(x.value) },
  { name: 'bf16 (지수 8 + 가수 7)', bits: '2바이트', value: toBf16(x.value) },
])
function verdict(v: number): { label: string; tone: string } {
  if (Number.isNaN(v)) return { label: 'NaN', tone: 'text-rose-700' }
  if (!Number.isFinite(v)) return { label: '💥 inf — 자의 끝 너머(오버플로)', tone: 'text-rose-700' }
  if (v === 0 && x.value !== 0) return { label: '🕳️ 0 — 사라짐(언더플로 소실)', tone: 'text-rose-700' }
  const rel = Math.abs((v - x.value) / x.value)
  if (rel === 0) return { label: '✅ 오차 없음', tone: 'text-emerald-700' }
  return { label: `상대 오차 ≈ ${(rel * 100).toExponential(1)}%`, tone: rel > 1e-3 ? 'text-amber-700' : 'text-emerald-700' }
}

// ── ② 누적 실험 — 혼합 정밀도의 심장 ──────────────────────────
const nAdd = ref(3000)
const TINY = 0.0001
const accum = computed(() => {
  // 순수 fp16: 저장도 누적도 반쪽 자 — 1 근처 눈금(≈0.001)의 절반보다 작아 매번 흡수
  let pure = toF16(1)
  for (let i = 0; i < nAdd.value; i++) pure = toF16(pure + toF16(TINY))
  // 혼합: 더할 값은 fp16 에 저장돼 있지만, 누적기는 fp32
  let mixed = f(1)
  const stored = toF16(TINY)
  for (let i = 0; i < nAdd.value; i++) mixed = f(mixed + stored)
  return { pure, mixed, exact: 1 + nAdd.value * TINY }
})

// ── ③ loss scaling 구급차 ─────────────────────────────────────
const kGrad = ref(8) // gradient = 10^-k
const SCALES = [1, 1024, 65536]
const scaleIdx = ref(0)
const rescue = computed(() => {
  const g = 10 ** -kGrad.value
  const S = SCALES[scaleIdx.value]
  const scaled = g * S // 확대는 fp32 세계에서
  const storedF16 = toF16(scaled) // fp16 칸에 저장 (backward 가 사는 곳)
  const restored = storedF16 / S // 옵티마이저 직전 복원 (fp32 세계)
  let state: { label: string; tone: string }
  if (!Number.isFinite(storedF16)) state = { label: '💥 스케일 과대 — 위로 터짐(오버플로)! S 를 줄이세요', tone: 'text-rose-700' }
  else if (storedF16 === 0) state = { label: '🕳️ 소실 — fp16 이 담기엔 너무 작음. S 를 키우세요', tone: 'text-rose-700' }
  else {
    const rel = Math.abs((restored - g) / g) * 100
    state = { label: `✅ 생존 — 복원 오차 ${rel < 0.001 ? '≈0' : rel.toPrecision(2)}%`, tone: 'text-emerald-700' }
  }
  return { g, S, scaled, storedF16, restored, state }
})
const fmtE = (v: number) => (!Number.isFinite(v) ? 'inf' : v === 0 ? '0' : v.toExponential(3))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 세 자 대조기 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 세 자 대조기: 16비트를 나누는 두 철학</p>
    <p class="mb-3 text-xs text-slate-500">
      같은 수를 세 자에 담아 봅니다 — fp16 은 눈금(가수 10비트)을, bf16 은 자 길이(지수
      8비트 = fp32 와 동일)를 택했습니다. 프리셋을 눌러 각 자의 강점·약점을 찾아보세요.
    </p>

    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="p in PRESETS"
        :key="p"
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="inputText === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="inputText = p"
      >
        {{ p }}
      </button>
      <input
        v-model="inputText"
        type="text"
        inputmode="decimal"
        class="w-32 rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-indigo-400 focus:outline-none"
        placeholder="직접 입력"
      />
    </div>

    <div class="mt-3 space-y-1">
      <div v-for="r in rows" :key="r.name" class="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs sm:flex-nowrap">
        <span class="w-44 shrink-0 font-semibold text-slate-600">{{ r.name }}</span>
        <span class="w-16 shrink-0 text-slate-500">{{ r.bits }}</span>
        <span class="min-w-0 flex-1 break-all font-mono text-slate-700">{{ String(r.value) }}</span>
        <span class="shrink-0 font-medium" :class="verdict(r.value).tone">{{ verdict(r.value).label }}</span>
      </div>
    </div>

    <p v-if="inputText === '70000'" class="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 fp16 의 자는 <b>65,504</b>에서 끝납니다 — 70,000은 벌써 inf! bf16 은 fp32 와 같은 자
      (3.4×10³⁸)라 여유만만이죠. 대신 0.1 프리셋에서 봤듯 bf16 의 눈금은 fp16 보다도 성깁니다.
    </p>
    <p v-if="inputText === '0.00000002'" class="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 2×10⁻⁸ — 작은 gradient 가 흔히 갖는 크기입니다. fp16 에선 <b>0 으로 소실</b>(자의 아래끝
      너머), bf16 은 멀쩡. fp16 시대에 loss scaling(실험 ③)이 발명된 이유가 이 줄에 있어요.
    </p>

    <!-- ② 누적 실험 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 누적 실험: "저장은 반쪽, 누적은 fp32"의 이유</p>
    <p class="mb-3 text-xs text-slate-500">
      1.0 에 0.0001 을 N번 더합니다 — fp16 의 1 근처 눈금 간격은 <b>≈0.001</b>이라, 4장의 흡수가
      이번엔 일상적인 크기에서 벌어져요.
    </p>

    <label class="block text-xs text-slate-500">
      더하는 횟수 N = <b class="text-slate-700">{{ nAdd.toLocaleString('en-US') }}</b>
      <input v-model.number="nAdd" type="range" min="100" max="5000" step="100" class="mt-1 w-full accent-indigo-600" />
    </label>

    <div class="mt-2 grid gap-2 sm:grid-cols-3">
      <div class="rounded-lg bg-rose-50 p-3">
        <p class="text-xs text-rose-700">순수 fp16 — 누적기도 반쪽 자</p>
        <p class="break-all font-mono text-lg font-bold text-rose-700">{{ accum.pure }}</p>
        <p class="text-xs text-rose-700">0.0001 이 눈금 절반(0.00049)보다 작아 매번 흡수</p>
      </div>
      <div class="rounded-lg bg-emerald-50 p-3">
        <p class="text-xs text-emerald-700">혼합 — 저장 fp16, 누적기 fp32</p>
        <p class="break-all font-mono text-lg font-bold text-emerald-700">{{ accum.mixed.toFixed(4) }}</p>
        <p class="text-xs text-emerald-700">같은 fp16 값을 더했는데 살아남는다</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-xs text-slate-500">🏫 참값</p>
        <p class="break-all font-mono text-lg font-bold text-slate-700">{{ accum.exact.toFixed(4) }}</p>
        <p class="text-xs text-slate-500">1 + N × 0.0001</p>
      </div>
    </div>

    <p class="mt-2 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      👀 <b>혼합 정밀도의 심장이 이것입니다</b> — 무겁고 많은 것(가중치·활성값의 저장, 곱셈)은
      반쪽 자로, <b>티끌이 쌓이는 곳(누적기·옵티마이저·master weights)은 fp32 로.</b>
      GPU 텐서 코어도 fp16 곱셈의 결과를 <b>내부에선 fp32 로 누적</b>합니다.
    </p>

    <!-- ③ loss scaling 구급차 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ③ — loss scaling 구급차: 작은 gradient 살리기</p>
    <p class="mb-3 text-xs text-slate-500">
      fp16 의 아래끝(≈6×10⁻⁸) 근처의 gradient 는 그냥 저장하면 0 — <b>확대(×S) → fp16 저장 →
      복원(÷S)</b> 3단계로 구출합니다. 스케일 S 를 골라 보세요.
    </p>

    <label class="block text-xs text-slate-500">
      gradient 크기 = 10<sup>−{{ kGrad }}</sup>
      <input v-model.number="kGrad" type="range" min="0" max="9" step="1" class="mt-1 w-full accent-indigo-600" />
    </label>
    <div class="mt-2 flex flex-wrap gap-2">
      <button
        v-for="(s, i) in SCALES"
        :key="s"
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="i === scaleIdx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="scaleIdx = i"
      >
        S = {{ s.toLocaleString('en-US') }}
      </button>
    </div>

    <div class="mt-2 rounded-lg bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-600">
      gradient {{ fmtE(rescue.g) }}
      → ×{{ rescue.S.toLocaleString('en-US') }} = {{ fmtE(rescue.scaled) }}
      → fp16 저장: <b>{{ fmtE(rescue.storedF16) }}</b>
      → ÷{{ rescue.S.toLocaleString('en-US') }} 복원: <b>{{ fmtE(rescue.restored) }}</b>
    </div>
    <p class="mt-2 text-sm font-medium" :class="rescue.state.tone">{{ rescue.state.label }}</p>

    <p class="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 S 도 다이얼입니다 — 너무 작으면 소실이 그대로, 너무 크면 큰 gradient 가 <b>위로
      터집니다</b>(gradient 10⁰ × 65,536 을 시도해 보세요). 그래서 실전 구현은 inf 가 뜨면
      S 를 반으로 줄이고, 한동안 무사하면 다시 키우는 <b>동적(dynamic) loss scaling</b> 을 씁니다.
    </p>
  </div>
</template>
