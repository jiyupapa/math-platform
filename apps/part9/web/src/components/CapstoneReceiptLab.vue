<script setup lang="ts">
// ch11 캡스톤 인터랙티브 — ① 모델 영수증 완독기: 워밍업의 질문 "7B는 왜 4GB인가"를
//                            배운 장 번호 배지와 함께 한 줄씩 정산
//                          ② 메모리 정산기: 가중치 + KV 캐시(문맥!) + 고정 몫 → 내 RAM 판정.
// 오프라인·결정적 — 1장 공식·9장 실효 비트·KV 어림 공식. 난수 없음.
import { computed, ref } from 'vue'

// ── 모델 사양 (1장 공식: V·d + L·12d²) ─────────────────────────
interface Spec {
  name: string
  V: number
  d: number
  L: number
}
const SPECS: Spec[] = [
  { name: '1B급', V: 32000, d: 2048, L: 16 },
  { name: '7B급', V: 32000, d: 4096, L: 32 },
  { name: '13B급', V: 32000, d: 5120, L: 40 },
]
const paramsOf = (s: Spec) => s.V * s.d + s.L * 12 * s.d ** 2

// ── 태그 (9·10장: 실효 비트 + 교육용 열화) ─────────────────────
interface Tag {
  name: string
  bits: number
  quality: string
}
const TAGS: Tag[] = [
  { name: 'F16', bits: 16, quality: '기준 (원본급)' },
  { name: 'Q8_0', bits: 8.5, quality: '+0.0% (무손실급)' },
  { name: 'Q4_K_M', bits: 4.85, quality: '+1.2% (무릎 위 — 국민 태그)' },
  { name: 'Q2_K', bits: 2.6, quality: '+28% (낭떠러지 아래)' },
]

const specIdx = ref(1)
const tagIdx = ref(2)
const spec = computed(() => SPECS[specIdx.value])
const tag = computed(() => TAGS[tagIdx.value])
const nParams = computed(() => paramsOf(spec.value))
const weightsGB = computed(() => (nParams.value * tag.value.bits) / 8 / 1e9)
const fmtB = (n: number) => (n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : `${(n / 1e6).toFixed(0)}M`)

// ── ② 메모리 정산기 — KV 캐시(필수 소주제) ─────────────────────
// KV 어림 공식: 토큰당 = 2(K·V) × 층수 L × 차원 d × 2바이트(fp16) — GQA 는 더 깊이에서
const CTX_OPTS = [512, 1024, 2048, 4096, 8192, 16384, 32768]
const ctxIdx = ref(3)
const ctx = computed(() => CTX_OPTS[ctxIdx.value])
const kvPerTokenB = computed(() => 2 * spec.value.L * spec.value.d * 2)
const kvGB = computed(() => (kvPerTokenB.value * ctx.value) / 1e9)
const FIXED_GB = 1.5 // OS·실행기 고정 몫 (어림)
const totalGB = computed(() => weightsGB.value + kvGB.value + FIXED_GB)

const RAMS = [8, 16, 32]
const ram = ref(8)
const verdict = computed(() => {
  const t = totalGB.value
  if (t > ram.value) return { label: '❌ 불가 — RAM 초과', tone: 'text-rose-700', bar: 'bg-rose-400' }
  if (t > ram.value * 0.85) return { label: '⚠️ 아슬 — 다른 앱을 닫아야 할 수도', tone: 'text-amber-700', bar: 'bg-amber-400' }
  return { label: '✅ 여유 — 쾌적하게 돕니다', tone: 'text-emerald-700', bar: 'bg-emerald-400' }
})
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 모델 영수증 완독기 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 모델 영수증 완독기: 워밍업의 질문에 스스로 답한다</p>
    <p class="mb-3 text-xs text-slate-500">
      모델과 태그를 고르면 영수증이 한 줄씩 계산됩니다 — 각 줄 옆의 배지는 그 계산을 배운 장.
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="(s, i) in SPECS"
        :key="s.name"
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="i === specIdx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="specIdx = i"
      >
        {{ s.name }}
      </button>
      <span class="mx-1 self-center text-slate-500">×</span>
      <button
        v-for="(t, i) in TAGS"
        :key="t.name"
        type="button"
        class="rounded-lg px-3 py-2 font-mono text-xs font-semibold transition"
        :class="i === tagIdx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="tagIdx = i"
      >
        {{ t.name }}
      </button>
    </div>

    <p class="mt-3 break-all rounded-lg bg-slate-900 p-3 font-mono text-sm text-slate-100">
      my-model-{{ spec.name.replace('급', '') }}.<b class="text-amber-300">{{ tag.name }}</b>.gguf
    </p>

    <div class="mt-2 space-y-1 font-mono text-xs">
      <div class="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2">
        <span class="w-16 shrink-0 font-sans font-semibold text-slate-500">파라미터</span>
        <span class="min-w-0 flex-1 text-slate-700">V·d + L·12d² = {{ spec.V.toLocaleString('en-US') }}×{{ spec.d.toLocaleString('en-US') }} + {{ spec.L }}×12×{{ spec.d.toLocaleString('en-US') }}² = <b>{{ fmtB(nParams) }}</b></span>
        <span class="shrink-0 rounded bg-indigo-100 px-1.5 py-0.5 font-sans text-xs font-bold text-indigo-700">1장</span>
      </div>
      <div class="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2">
        <span class="w-16 shrink-0 font-sans font-semibold text-slate-500">칸</span>
        <span class="min-w-0 flex-1 text-slate-700">{{ tag.name }} → 실효 <b>{{ tag.bits }}비트</b>/파라미터 (정수 눈금 + 축척·믹스)</span>
        <span class="shrink-0 rounded bg-indigo-100 px-1.5 py-0.5 font-sans text-xs font-bold text-indigo-700">3·8·9장</span>
      </div>
      <div class="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2">
        <span class="w-16 shrink-0 font-sans font-semibold text-slate-500">가중치</span>
        <span class="min-w-0 flex-1 text-slate-700">{{ fmtB(nParams) }} × {{ tag.bits }}bit ÷ 8 = <b class="text-indigo-700">{{ weightsGB.toFixed(1) }} GB</b></span>
        <span class="shrink-0 rounded bg-indigo-100 px-1.5 py-0.5 font-sans text-xs font-bold text-indigo-700">1·9장</span>
      </div>
      <div class="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2">
        <span class="w-16 shrink-0 font-sans font-semibold text-slate-500">품질</span>
        <span class="min-w-0 flex-1 text-slate-700">퍼플렉시티 열화 {{ tag.quality }}</span>
        <span class="shrink-0 rounded bg-indigo-100 px-1.5 py-0.5 font-sans text-xs font-bold text-indigo-700">10장</span>
      </div>
    </div>

    <p v-if="spec.name === '7B급' && tag.name === 'Q4_K_M'" class="mt-2 rounded-lg bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
      🎓 <b>워밍업의 질문, 완독 완료</b> — "7B(개수, 1장 공식) × 4.85비트(칸, 3~9장의 전부)
      ÷ 8 = 4.0GB(파일)". 이 한 줄을 스스로 계산한 것이 9부의 졸업입니다.
    </p>

    <!-- ② 메모리 정산기 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 메모리 정산기: 파일이 들어간다 ≠ 돌아간다</p>
    <p class="mb-3 text-xs text-slate-500">
      실행에는 가중치 외에 <b>문맥이 길수록 자라는 KV 캐시</b>(대화의 기억 장부)와 OS·실행기
      몫이 필요합니다 — 어림 공식: KV/토큰 = 2 × L × d × 2바이트(fp16).
    </p>

    <label class="block text-xs text-slate-500">
      문맥 길이 = <b class="text-slate-700">{{ ctx.toLocaleString('en-US') }}</b> 토큰
      <input v-model.number="ctxIdx" type="range" min="0" :max="CTX_OPTS.length - 1" step="1" class="mt-1 w-full accent-indigo-600" />
    </label>
    <div class="mt-2 flex flex-wrap gap-2">
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

    <div class="mt-3 space-y-1 font-mono text-xs">
      <div class="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
        <span class="w-40 shrink-0 font-sans text-slate-500">가중치 ({{ tag.name }})</span>
        <span class="flex-1 text-slate-700"><b>{{ weightsGB.toFixed(1) }} GB</b></span>
      </div>
      <div class="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
        <span class="w-40 shrink-0 font-sans text-slate-500">KV 캐시 ({{ ctx.toLocaleString('en-US') }}토큰)</span>
        <span class="flex-1 text-slate-700">{{ (kvPerTokenB / 1e6).toFixed(2) }}MB/토큰 × {{ ctx.toLocaleString('en-US') }} = <b>{{ kvGB.toFixed(1) }} GB</b></span>
      </div>
      <div class="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
        <span class="w-40 shrink-0 font-sans text-slate-500">OS·실행기 고정 몫</span>
        <span class="flex-1 text-slate-700"><b>{{ FIXED_GB.toFixed(1) }} GB</b> (어림)</span>
      </div>
      <div class="flex items-center gap-2 rounded-lg bg-indigo-50 p-2">
        <span class="w-40 shrink-0 font-sans font-semibold text-indigo-700">총 필요</span>
        <span class="flex-1 font-bold text-indigo-700">{{ totalGB.toFixed(1) }} GB / RAM {{ ram }}GB</span>
      </div>
    </div>

    <div class="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
      <div class="h-full rounded-full transition-all" :class="verdict.bar" :style="{ width: Math.min(100, (totalGB / ram) * 100) + '%' }" />
    </div>
    <p class="mt-1 text-sm font-medium" :class="verdict.tone">{{ verdict.label }}</p>

    <p class="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 7B·Q4_K_M 을 두고 문맥만 4K → 32K 로 늘려 보세요 — <b>가중치는 그대로인데 KV 가
      2.1GB → 17.2GB</b>로 자라 8GB PC 는 물론 16GB 도 넘어섭니다. "파일이 들어간다"와
      "돌아간다"가 다른 이유, 그리고 긴 문맥이 비싼 이유가 이 장부 하나에 있어요.
      (최근 모델은 GQA 로 KV 를 4~8분의 1로 줄입니다 — 더 깊이 카드.)
    </p>
  </div>
</template>
