<script setup lang="ts">
// ch3 인터랙티브 — ① fp32 해부기: 십진수 → 부호·지수·가수 비트와 실제 저장값·오차
//                 ② 눈금 간격 관찰기: 크기별 이웃 눈금 간격(fp32 vs fp64), 정수 천장 비교.
// 오프라인·결정적 — DataView 비트 조작으로 진짜 fp32 를 재현(Math.fround). 난수 없음.
import { computed, ref } from 'vue'

const dv = new DataView(new ArrayBuffer(8))

/** x 를 fp32 로 반올림해 담았을 때의 (부호, 지수 raw, 가수, 비트열) */
function anatomize(x: number) {
  dv.setFloat32(0, x)
  const u = dv.getUint32(0)
  const s = u >>> 31
  const e = (u >>> 23) & 0xff
  const m = u & 0x7fffff
  const b = u.toString(2).padStart(32, '0')
  return { s, e, m, sBits: b.slice(0, 1), eBits: b.slice(1, 9), mBits: b.slice(9) }
}

/** x 위치에서 fp32 이웃 눈금까지의 간격 */
function spacing32(x: number): number {
  dv.setFloat32(0, x)
  const f = dv.getFloat32(0)
  dv.setUint32(0, dv.getUint32(0) + 1)
  return dv.getFloat32(0) - f
}

/** x 위치에서 fp64 이웃 눈금까지의 간격 (워밍업에서 놀던 그 자) */
function spacing64(x: number): number {
  dv.setFloat64(0, x)
  const f = dv.getFloat64(0)
  dv.setBigUint64(0, dv.getBigUint64(0) + 1n)
  return dv.getFloat64(0) - f
}

// ── ① fp32 해부기 ─────────────────────────────────────────────
const PRESETS = ['0.1', '0.5', '3.14159', '-2.5', '12345678.9']
const inputText = ref('0.1')
const x = computed(() => Number(inputText.value))
const valid = computed(() => Number.isFinite(x.value) && x.value !== 0 && Number.isFinite(Math.fround(x.value)))

const anat = computed(() => anatomize(x.value))
const stored = computed(() => Math.fround(x.value))
const storedStr = computed(() => String(stored.value)) // fp32 값은 fp64 로 정확히 표현되므로 그대로 노출
const err = computed(() => Math.abs(x.value - stored.value))
const expVal = computed(() => anat.value.e - 127) // bias 127 을 뺀 진짜 지수
const fraction = computed(() => 1 + anat.value.m / 2 ** 23) // 숨은 1 포함한 1.xxx

// ── ② 눈금 간격 관찰기 ────────────────────────────────────────
const k = ref(0)
const probe = computed(() => {
  const v = 10 ** k.value
  const g32 = spacing32(v)
  const g64 = spacing64(v)
  return {
    v,
    g32,
    g64,
    swallow32: g32 > 1,
    swallow64: g64 > 1,
  }
})
const fmtGap = (g: number) => (g >= 1 ? g.toLocaleString('en-US') : g.toExponential(3))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① fp32 해부기 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — fp32 해부기: 스위치 32개를 세 부품으로 읽는다</p>
    <p class="mb-3 text-xs text-slate-500">
      숫자를 넣으면 <b>진짜 fp32 칸</b>에 담아(반올림) 부품별 비트를 펼쳐 보여줍니다 —
      부호 1개 · 지수 8개 · 가수 23개.
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

    <template v-if="valid">
      <div class="mt-3 grid gap-2 sm:grid-cols-3">
        <div class="rounded-lg bg-rose-50 p-3">
          <p class="text-xs font-semibold text-rose-700">부호 (1비트)</p>
          <p class="break-all font-mono text-sm font-bold text-rose-700">{{ anat.sBits }}</p>
          <p class="mt-1 text-xs text-rose-700">{{ anat.s === 0 ? '+ (양수)' : '− (음수)' }}</p>
        </div>
        <div class="rounded-lg bg-amber-50 p-3">
          <p class="text-xs font-semibold text-amber-700">지수 (8비트) — 자의 위치</p>
          <p class="break-all font-mono text-sm font-bold text-amber-700">{{ anat.eBits }}</p>
          <p class="mt-1 text-xs text-amber-700">= {{ anat.e }} − 127 = <b>{{ expVal }}</b> → ×2<sup>{{ expVal }}</sup></p>
        </div>
        <div class="rounded-lg bg-indigo-50 p-3">
          <p class="text-xs font-semibold text-indigo-600">가수 (23비트) — 눈금 위 좌표</p>
          <p class="break-all font-mono text-xs font-bold leading-relaxed text-indigo-700">{{ anat.mBits }}</p>
          <p class="mt-1 text-xs text-indigo-700">숨은 1을 붙여 "1.○○○" 로 읽으면 <b>{{ fraction.toPrecision(9) }}</b></p>
        </div>
      </div>

      <div class="mt-2 rounded-lg bg-slate-50 p-3">
        <p class="break-all font-mono text-xs text-slate-500">
          ({{ anat.s === 0 ? '+' : '−' }}1) × {{ fraction.toPrecision(9) }} × 2<sup>{{ expVal }}</sup>
        </p>
        <p class="break-all font-mono text-lg font-bold text-slate-700">= {{ storedStr }}</p>
        <p class="mt-1 text-xs" :class="err === 0 ? 'text-emerald-700' : 'text-rose-700'">
          {{ err === 0 ? '✅ 오차 없음 — 이 수는 fp32 눈금 위에 정확히 있습니다' : `❗ 입력과의 어긋남 ≈ ${err.toExponential(2)} — 가장 가까운 눈금으로 반올림된 티끌` }}
        </p>
      </div>
    </template>
    <p v-else class="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
      {{ x === 0 ? '0 은 특별 칸(지수 비트 전부 0)에 삽니다 — 예외 칸들은 5장에서 만나요.' : '유한한 십진수를 입력해 주세요 (fp32 범위 ±3.4×10³⁸ 안).' }}
    </p>

    <p v-if="valid && inputText === '0.1'" class="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 워밍업 미스터리 해결 — 0.1은 2진으로 0.0001100110011… <b>무한 반복</b>이라, 가수 23비트에서
      끊고 반올림합니다. 그래서 저장값이 0.100000001490…, 그 티끌이 0.1 + 0.2 사건의 진범이었어요.
    </p>
    <p v-if="valid && inputText === '12345678.9'" class="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 소수점이 통째로 증발했습니다 — 이 크기 구간의 fp32 눈금 간격은 1이라 ".9"를 담을 눈금이
      없어요. 아래 실험 ②에서 이 간격이 어떻게 자라는지 보세요.
    </p>

    <!-- ② 눈금 간격 관찰기 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 눈금 간격 관찰기: 고무줄이 늘어나는 속도</p>
    <p class="mb-3 text-xs text-slate-500">
      수의 크기를 옮겨 가며 <b>이웃 눈금까지의 간격</b>을 잽니다 — 같은 위치에서
      fp32(오늘의 자)와 fp64(워밍업에서 놀던 브라우저 기본 자)를 나란히.
    </p>

    <label class="block text-xs text-slate-500">
      수의 크기 = 10<sup>{{ k }}</sup> = {{ probe.v.toLocaleString('en-US') }}
      <input v-model.number="k" type="range" min="-2" max="9" step="1" class="mt-1 w-full accent-indigo-600" />
    </label>

    <div class="mt-2 grid gap-2 sm:grid-cols-2">
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-xs text-slate-500">fp32 눈금 간격 (32비트 칸)</p>
        <p class="font-mono text-lg font-bold" :class="probe.swallow32 ? 'text-rose-700' : 'text-slate-700'">{{ fmtGap(probe.g32) }}</p>
        <p class="text-xs" :class="probe.swallow32 ? 'text-rose-700' : 'text-emerald-700'">
          {{ probe.swallow32 ? '❗ 간격이 1보다 넓다 — +1이 삼켜질 수 있음' : '✅ +1은 아직 살아남는다' }}
        </p>
      </div>
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="text-xs text-slate-500">fp64 눈금 간격 (64비트 칸 — 워밍업의 자)</p>
        <p class="font-mono text-lg font-bold" :class="probe.swallow64 ? 'text-rose-700' : 'text-slate-700'">{{ fmtGap(probe.g64) }}</p>
        <p class="text-xs" :class="probe.swallow64 ? 'text-rose-700' : 'text-emerald-700'">
          {{ probe.swallow64 ? '❗ 간격이 1보다 넓다' : '✅ 이 구간에선 훨씬 촘촘하다' }}
        </p>
      </div>
    </div>

    <p class="mt-3 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      👀 두 자 모두 <b>크기에 비례해 간격이 벌어지는 고무줄 자</b>입니다 — 다른 건 밀도뿐.
      "+1 삼키기"의 경계(정수 천장)는 가수 비트 수가 정합니다:
      fp32 는 <b>2²⁴ = 16,777,216</b>(가수 23 + 숨은 1), fp64 는 <b>2⁵³ ≈ 9천조</b> —
      워밍업에서 찾은 그 경계의 정체가 바로 이거였어요.
    </p>
  </div>
</template>
