<script setup lang="ts">
// Phase 10 전용 인터랙티브 — 계산그래프 역전파.
// 예시: L = (x·y + z)²  를 노드로 쪼갠다.
//   p = x·y (곱셈),  q = p + z (덧셈),  L = q² (제곱)
// 순전파로 값을 구하고, '역전파 한 단계' 버튼으로 출력쪽(L)부터 기울기를 뒤로 흘려보낸다.
//   - 제곱 노드: 국소미분 2q
//   - 덧셈 노드: 기울기를 그대로 복사(양쪽에 같은 값)
//   - 곱셈 노드: 상대편 값을 곱해 갈라짐 (∂L/∂x = 상류·y, ∂L/∂y = 상류·x)
import { ref, computed } from 'vue'

const x = ref(2)
const y = ref(3)
const z = ref(1)

// 순전파
const p = computed(() => x.value * y.value)
const q = computed(() => p.value + z.value)
const L = computed(() => q.value * q.value)

// 역전파 (상류 기울기 × 국소 미분)
const gL = 1
const gq = computed(() => 2 * q.value) // L=q² → ∂L/∂q = 2q
const gp = computed(() => gq.value) // 덧셈: 그대로 복사
const gz = computed(() => gq.value) // 덧셈: 그대로 복사
const gx = computed(() => gp.value * y.value) // 곱셈: 상대편 y
const gy = computed(() => gp.value * x.value) // 곱셈: 상대편 x

// 역전파 단계 (0=순전파만, 1=L, 2=q, 3=p·z, 4=x·y)
const step = ref(0)
const maxStep = 4
function back() {
  if (step.value < maxStep) step.value++
}
function resetFwd() {
  step.value = 0
}

const fmt = (n: number) => Number(n.toFixed(2)).toString()

// 노드 정의 (cx,cy = 박스 중심)
const nodes = computed(() => [
  { id: 'x', cx: 62, cy: 38, label: 'x', val: x.value, grad: gx.value, gvis: step.value >= 4 },
  { id: 'y', cx: 62, cy: 115, label: 'y', val: y.value, grad: gy.value, gvis: step.value >= 4 },
  { id: 'z', cx: 62, cy: 192, label: 'z', val: z.value, grad: gz.value, gvis: step.value >= 3 },
  { id: 'mul', cx: 198, cy: 76, label: '× → p', val: p.value, grad: gp.value, gvis: step.value >= 3 },
  { id: 'add', cx: 318, cy: 138, label: '+ → q', val: q.value, grad: gq.value, gvis: step.value >= 2 },
  { id: 'sq', cx: 433, cy: 138, label: '( )² → L', val: L.value, grad: gL, gvis: step.value >= 1 },
])
const edges = [
  { x1: 62, y1: 38, x2: 198, y2: 76 },
  { x1: 62, y1: 115, x2: 198, y2: 76 },
  { x1: 198, y1: 76, x2: 318, y2: 138 },
  { x1: 62, y1: 192, x2: 318, y2: 138 },
  { x1: 318, y1: 138, x2: 433, y2: 138 },
]
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-2 text-center text-sm font-semibold text-slate-600">
      계산그래프: L = (x·y + z)² · 순전파 값(검정) → 역전파 기울기(빨강)
    </p>
    <div class="flex justify-center">
      <svg viewBox="0 0 500 230" width="500" height="230" class="max-w-full rounded-lg border border-slate-100 bg-slate-50">
        <defs>
          <marker id="bp-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill="var(--c-slate-300)" />
          </marker>
        </defs>
        <!-- 엣지 (순전파 방향) -->
        <line v-for="(e, i) in edges" :key="'e' + i" :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2"
          stroke="var(--c-slate-300)" stroke-width="2" marker-end="url(#bp-arrow)" />
        <!-- 출력 L 화살표 -->
        <line x1="433" y1="138" x2="480" y2="138" stroke="var(--c-slate-300)" stroke-width="2" marker-end="url(#bp-arrow)" />

        <!-- 노드 -->
        <g v-for="n in nodes" :key="n.id">
          <rect :x="n.cx - 33" :y="n.cy - 18" width="66" height="36" rx="8"
            :fill="n.gvis ? 'var(--c-red-50)' : 'var(--c-white)'" :stroke="n.gvis ? 'var(--c-red-500)' : 'var(--c-slate-400)'" stroke-width="1.5" />
          <text :x="n.cx" :y="n.cy - 3" text-anchor="middle" font-size="11" fill="var(--c-slate-600)">{{ n.label }}</text>
          <text :x="n.cx" :y="n.cy + 12" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--c-slate-900)">{{ fmt(n.val) }}</text>
          <!-- 기울기 (역전파로 드러날 때) -->
          <text v-if="n.gvis" :x="n.cx" :y="n.cy + 30" text-anchor="middle" font-size="11" font-weight="bold" fill="var(--c-red-500)">
            ∂L/∂ = {{ fmt(n.grad) }}
          </text>
        </g>
      </svg>
    </div>

    <!-- 입력 슬라이더 -->
    <div class="mt-3 grid grid-cols-1 gap-2 px-1 sm:grid-cols-3">
      <label class="flex items-center gap-2 text-sm">
        <span class="w-12 shrink-0 text-slate-500">x = <b class="text-slate-800">{{ fmt(x) }}</b></span>
        <input v-model.number="x" type="range" min="-3" max="4" step="1" class="flex-1 accent-indigo-500" @input="resetFwd" />
      </label>
      <label class="flex items-center gap-2 text-sm">
        <span class="w-12 shrink-0 text-slate-500">y = <b class="text-slate-800">{{ fmt(y) }}</b></span>
        <input v-model.number="y" type="range" min="-3" max="4" step="1" class="flex-1 accent-indigo-500" @input="resetFwd" />
      </label>
      <label class="flex items-center gap-2 text-sm">
        <span class="w-12 shrink-0 text-slate-500">z = <b class="text-slate-800">{{ fmt(z) }}</b></span>
        <input v-model.number="z" type="range" min="-3" max="4" step="1" class="flex-1 accent-indigo-500" @input="resetFwd" />
      </label>
    </div>

    <!-- 역전파 버튼 -->
    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" class="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-40"
        :disabled="step >= maxStep" @click="back">← 역전파 한 단계 ({{ step }}/{{ maxStep }})</button>
      <button type="button" class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200" @click="resetFwd">순전파로 리셋</button>
    </div>

    <!-- 단계 설명 -->
    <div class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-600">
      <p v-if="step === 0">먼저 <b>순전파</b>: 입력에서 오른쪽으로 값을 계산했어요 (L = {{ fmt(L) }}). 이제 '역전파 한 단계'를 눌러보세요.</p>
      <p v-else-if="step === 1">🟥 출력에서 시작: <b>∂L/∂L = 1</b>. 여기서 뒤로 흘려보냅니다.</p>
      <p v-else-if="step === 2"><b>제곱 노드</b> 통과: L=q² 의 국소미분 2q 를 곱해 <b>∂L/∂q = 2q = {{ fmt(gq) }}</b>.</p>
      <p v-else-if="step === 3"><b>덧셈 노드</b> 통과: 기울기를 <b>그대로 복사</b> → ∂L/∂p = ∂L/∂z = {{ fmt(gq) }}. (합의 미분)</p>
      <p v-else><b>곱셈 노드</b> 통과: <b>상대편 값</b>을 곱해 갈라짐 → ∂L/∂x = 상류·y = {{ fmt(gx) }}, ∂L/∂y = 상류·x = {{ fmt(gy) }}. (곱의 법칙) ✅ 모든 입력의 기울기 완성!</p>
    </div>
    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      역전파 = <b>출력쪽 기울기(상류) × 각 노드의 국소미분</b> 을 뒤로 이어붙이는 것.
      덧셈은 복사, 곱셈은 상대편 값 곱하기. 전부 앞에서 배운 연쇄·합·곱 법칙이에요.
      <b>한 번의 역전파로 모든 입력(가중치)의 기울기</b>가 한꺼번에 나옵니다.
    </p>
  </div>
</template>
