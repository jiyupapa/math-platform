<script setup lang="ts">
// ch1 인터랙티브 — ① 부품별 저울: 미니 GPT 의 파라미터를 부품(임베딩·어텐션·FFN)별로 세기
//                 ② 몸무게 계산기: 파라미터 수 × 칸 크기(fp32/fp16/int8/int4) = 파일 크기 + RAM 판정.
// 오프라인·결정적 — 공식 계산만. 난수 없음.
// 몸무게 공식(근사, bias·LayerNorm 등 티끌 생략): 총 = V·d + L·(4d² + 8d²)
//   임베딩 V·d, 블록당 어텐션(Q·K·V·O) 4d², FFN(넓혔다 좁히기 d→4d→d) 8d².
import { computed, ref } from 'vue'

// ── ① 부품별 저울 ─────────────────────────────────────────────
const D_OPTIONS = [64, 128, 256, 512, 768, 1024, 2048, 4096]
const dIdx = ref(0)
const layers = ref(4)
const vocabK = ref(1) // 어휘 수 (천 단위)

interface Preset {
  key: string
  label: string
  dIdx: number
  layers: number
  vocabK: number
}
const PRESETS: Preset[] = [
  { key: 'mini', label: '미니 (우리 실습용)', dIdx: 0, layers: 4, vocabK: 1 },
  { key: 'gpt2', label: 'GPT-2 소형', dIdx: 4, layers: 12, vocabK: 50 },
  { key: 'seven', label: '7B급', dIdx: 7, layers: 32, vocabK: 32 },
]
const activePreset = ref('mini')
function applyPreset(p: Preset) {
  activePreset.value = p.key
  dIdx.value = p.dIdx
  layers.value = p.layers
  vocabK.value = p.vocabK
}

const d = computed(() => D_OPTIONS[dIdx.value])
// GPT-2 소형만 실제 어휘 수(50,257)로 — 유명한 공개 값 124M 과의 대조를 위해
const vocab = computed(() => (activePreset.value === 'gpt2' && vocabK.value === 50 ? 50257 : vocabK.value * 1000))

const parts = computed(() => {
  const emb = vocab.value * d.value
  const attn = layers.value * 4 * d.value ** 2
  const ffn = layers.value * 8 * d.value ** 2
  return { emb, attn, ffn, total: emb + attn + ffn }
})

function fmtCount(n: number): string {
  const unit = n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n.toLocaleString('en-US')
  if (n >= 1e8) return `${unit} (${(n / 1e8).toFixed(1)}억 개)`
  if (n >= 1e6) return `${unit} (${Math.round(n / 1e4).toLocaleString('en-US')}만 개)`
  return `${unit} 개`
}
const pct = (n: number) => Math.max(0.5, (n / parts.value.total) * 100)

// ── ② 몸무게 계산기 ──────────────────────────────────────────
interface Box {
  key: string
  label: string
  bytes: number
  note: string
}
const BOXES: Box[] = [
  { key: 'fp32', label: 'fp32 (4바이트)', bytes: 4, note: '학습용 기본 칸 — 3장의 주인공' },
  { key: 'fp16', label: 'fp16 (2바이트)', bytes: 2, note: '반쪽 자 — 7장' },
  { key: 'int8', label: 'int8 (1바이트)', bytes: 1, note: '정수 칸 양자화 — 8장' },
  { key: 'int4', label: 'int4 (0.5바이트)', bytes: 0.5, note: 'Ollama 태그 q4 의 그 4 — 9장' },
]
const boxKey = ref('fp16')
const box = computed(() => BOXES.find((b) => b.key === boxKey.value)!)
const fileGB = computed(() => (parts.value.total * box.value.bytes) / 1e9)

const RAMS = [8, 16, 32]
function ramVerdict(ram: number): { label: string; tone: string } {
  const gb = fileGB.value
  if (gb > ram) return { label: '❌ 불가', tone: 'text-rose-700' }
  if (gb > ram * 0.75) return { label: '⚠️ 아슬', tone: 'text-amber-700' }
  return { label: '✅ 여유', tone: 'text-emerald-700' }
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 부품별 저울 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 부품별 저울: 모델의 숫자는 어디에 몇 개 있나</p>
    <p class="mb-3 text-xs text-slate-500">
      4부에서 조립한 부품 그대로입니다 — 임베딩 표(V×d) + 블록마다 어텐션(4d²)·FFN(8d²).
      다이얼을 돌려 숫자가 어디서 불어나는지 보세요.
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="p in PRESETS"
        :key="p.key"
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="activePreset === p.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="applyPreset(p)"
      >
        {{ p.label }}
      </button>
    </div>

    <div class="mt-3 grid gap-3 sm:grid-cols-3">
      <label class="block text-xs text-slate-500">
        차원 d = <b class="text-slate-700">{{ d.toLocaleString('en-US') }}</b>
        <input v-model.number="dIdx" type="range" min="0" :max="D_OPTIONS.length - 1" step="1" class="mt-1 w-full accent-indigo-600" @input="activePreset = ''" />
      </label>
      <label class="block text-xs text-slate-500">
        블록(층) 수 L = <b class="text-slate-700">{{ layers }}</b>
        <input v-model.number="layers" type="range" min="1" max="48" step="1" class="mt-1 w-full accent-indigo-600" @input="activePreset = ''" />
      </label>
      <label class="block text-xs text-slate-500">
        어휘 수 V ≈ <b class="text-slate-700">{{ vocab.toLocaleString('en-US') }}</b>
        <input v-model.number="vocabK" type="range" min="1" max="50" step="1" class="mt-1 w-full accent-indigo-600" @input="activePreset = ''" />
      </label>
    </div>

    <div class="mt-3 space-y-1">
      <div class="flex items-center gap-2 text-xs">
        <span class="w-32 shrink-0 text-slate-500">임베딩 표 V·d</span>
        <div class="h-4 flex-1 overflow-hidden rounded bg-slate-100">
          <div class="h-full rounded bg-sky-400" :style="{ width: pct(parts.emb) + '%' }" />
        </div>
        <span class="w-40 shrink-0 text-right font-mono text-slate-600">{{ fmtCount(parts.emb) }}</span>
      </div>
      <div class="flex items-center gap-2 text-xs">
        <span class="w-32 shrink-0 text-slate-500">어텐션 L·4d²</span>
        <div class="h-4 flex-1 overflow-hidden rounded bg-slate-100">
          <div class="h-full rounded bg-indigo-400" :style="{ width: pct(parts.attn) + '%' }" />
        </div>
        <span class="w-40 shrink-0 text-right font-mono text-slate-600">{{ fmtCount(parts.attn) }}</span>
      </div>
      <div class="flex items-center gap-2 text-xs">
        <span class="w-32 shrink-0 text-slate-500">FFN L·8d²</span>
        <div class="h-4 flex-1 overflow-hidden rounded bg-slate-100">
          <div class="h-full rounded bg-violet-400" :style="{ width: pct(parts.ffn) + '%' }" />
        </div>
        <span class="w-40 shrink-0 text-right font-mono text-slate-600">{{ fmtCount(parts.ffn) }}</span>
      </div>
    </div>

    <div class="mt-3 rounded-lg bg-slate-50 p-3">
      <p class="text-xs text-slate-500">총 파라미터 (근사 공식 V·d + L·12d²)</p>
      <p class="font-mono text-xl font-bold text-slate-700">{{ fmtCount(parts.total) }}</p>
    </div>

    <p v-if="activePreset === 'gpt2'" class="mt-3 rounded-lg bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
      ✅ 검산 성공 — 실제 GPT-2 소형의 공개 값은 <b>124M</b>입니다. 우리의 세 줄짜리 근사 공식이
      오차 1% 미만으로 맞혔어요(생략한 bias·LayerNorm 이 그 티끌). "B·M 숫자"는 신비한 스펙이
      아니라 <b>부품별 곱셈 몇 번</b>이라는 뜻입니다.
    </p>
    <p v-if="activePreset === 'seven'" class="mt-3 rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
      👀 총 ≈ <b>6.57B</b> — 시중 "7B 모델"의 정체가 이 근사 공식 안에 있습니다.
      그리고 막대를 보세요: 임베딩 표(V·d)는 조연이고, 몸무게의 몸통은 <b>블록의 d² 행렬들</b>이에요
      (d 를 두 배로 하면 블록은 네 배가 됩니다).
    </p>

    <!-- ② 몸무게 계산기 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 몸무게 계산기: 파일 크기 = 개수 × 칸 크기</p>
    <p class="mb-3 text-xs text-slate-500">
      위에서 센 파라미터를 그대로 가져와, 숫자 하나를 담는 <b>칸의 크기</b>만 바꿔 봅니다.
      워밍업에서 본 그 칸입니다 — 몇 바이트짜리 칸에 담을까?
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="b in BOXES"
        :key="b.key"
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="boxKey === b.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="boxKey = b.key"
      >
        {{ b.label }}
      </button>
    </div>
    <p class="mt-1 text-xs text-slate-500">{{ box.note }}</p>

    <div class="mt-2 rounded-lg bg-slate-50 p-3">
      <p class="break-all font-mono text-xs text-slate-500">
        {{ parts.total.toLocaleString('en-US') }} 개 × {{ box.bytes }} 바이트
      </p>
      <p class="font-mono text-2xl font-bold text-slate-700">≈ {{ fileGB < 0.1 ? fileGB.toFixed(3) : fileGB.toFixed(1) }} GB</p>
      <p class="mt-1 text-xs text-slate-500">(십진 GB = 10억 바이트 기준 — 파일 관리자의 GiB 표기와 약 7% 다른 이유는 아래 "더 깊이")</p>
    </div>

    <div class="mt-2 grid gap-2 sm:grid-cols-3">
      <div v-for="ram in RAMS" :key="ram" class="rounded-lg border border-slate-100 bg-white p-2 text-center">
        <p class="text-xs text-slate-500">RAM {{ ram }}GB PC</p>
        <p class="text-sm font-semibold" :class="ramVerdict(ram).tone">{{ ramVerdict(ram).label }}</p>
      </div>
    </div>
    <p class="mt-1 text-xs text-slate-500">
      ※ 가중치만의 판정입니다 — 실제로는 OS·브라우저·문맥(KV 캐시) 몫이 더 필요해요(11장 캡스톤에서 정산).
    </p>

    <p v-if="activePreset === 'seven' && boxKey === 'int4'" class="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
      💡 이것이 <b>Ollama 태그 q4 의 정체</b>입니다 — 7B급을 4비트(0.5바이트) 칸에 담으면
      ≈ 3.3GB, 8GB 노트북에도 들어가죠. (실제 파일이 이 계산보다 조금 큰 4GB 안팎인 이유 —
      숫자 외에 축척 스티커 등이 함께 담기기 때문 — 는 9장에서 정산합니다.)
    </p>
  </div>
</template>
