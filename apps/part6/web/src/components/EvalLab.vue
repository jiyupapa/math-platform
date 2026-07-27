<script setup lang="ts">
// ch9 인터랙티브 — ① 성적표 읽기(문항 수와 오차범위 — 3부 8~9장 회수)
//                 ② 부작용 진단소(아첨·망각·거절 과잉). 오프라인·결정적.
import { ref, computed } from 'vue'

// ── ① 성적표 읽기: 두 모델의 벤치마크 점수와 오차범위 ──────────────
const A = 0.72 // 모델 A 점수
const B = 0.66 // 모델 B 점수
const N_PRESETS = [100, 400, 2000]
const n = ref(100)

// 95% 오차범위 ≈ ±1.96·√(p(1−p)/n)
const ci = (p: number) => 1.96 * Math.sqrt((p * (1 - p)) / n.value)
const ciA = computed(() => ci(A))
const ciB = computed(() => ci(B))
const separated = computed(() => A - ciA.value > B + ciB.value)

// 60%~80% 눈금을 0~100% 폭으로 사상
const SCALE_MIN = 0.58
const SCALE_MAX = 0.82
const toPct = (v: number) => `${((v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100}%`
const pp = (v: number) => (v * 100).toFixed(1)

const obs = computed(() => {
  if (n.value <= 100)
    return '오차범위가 커서 두 구간이 크게 겹칩니다 — 6%p 차이인데도 "우연히 이렇게 나왔을 수 있다"를 배제할 수 없어요. 이 성적표로는 승자를 말할 수 없습니다.'
  if (!separated.value)
    return '아직 살짝 겹칩니다 — 차이가 진짜일 가능성이 커졌지만 확신은 이르죠. 문항을 더 늘려 봅시다.'
  return '구간이 분리됐습니다 — 이제 "A가 낫다"고 말해도 됩니다. 같은 6%p 차이가 문항 수 덕분에 증거가 된 거예요.'
})

// ── ② 부작용 진단소 ──────────────────────────────────────────────
interface Symptom {
  name: string
  icon: string
  dialog: { who: string; text: string }[]
  diagnosis: string
  cause: string
  remedy: string
}

const SYMPTOMS: Symptom[] = [
  {
    name: '아첨',
    icon: '🙇',
    dialog: [
      { who: '사용자', text: '1 더하기 1은 3이잖아, 그렇지?' },
      { who: '모델', text: '정확합니다! 통찰력이 대단하시네요. 1 더하기 1은 3입니다.' },
    ],
    diagnosis: '아첨 (sycophancy) — 사용자가 틀려도 맞장구',
    cause: '라벨러들이 "동의받는 느낌"의 답을 자주 선택 → 보상 모델이 동조에 후한 점수(4장의 근사 구멍) → 조련이 그 방향으로 과최적화(6장).',
    remedy: '선호 데이터에 "정중한 교정" 사례 보강 + 아첨 전용 평가셋으로 감시.',
  },
  {
    name: '망각',
    icon: '🫥',
    dialog: [
      { who: '사용자', text: '(회사 규정 챗봇으로 조련한 뒤) 파이썬으로 리스트 정렬하는 법 알려줘.' },
      { who: '모델', text: '해당 내용은 취업규칙 제12조를 참고하시기 바랍니다.' },
    ],
    diagnosis: '망각 (catastrophic forgetting) — 조련이 원래 능력을 지움',
    cause: '좁은 데이터로 과한 조련 → 가중치가 원본 분포에서 멀리 이동 → 사전학습이 쌓은 일반 능력 훼손(6장 β=0의 완만한 버전).',
    remedy: 'KL 목줄(6장)·LoRA(8장 — 원본 무손상)·일반 능력 평가셋 병행 감시.',
  },
  {
    name: '거절 과잉',
    icon: '🙅',
    dialog: [
      { who: '사용자', text: '부엌칼로 양파 써는 요령 좀 알려줘.' },
      { who: '모델', text: '칼에 관한 내용은 위험할 수 있어 도와드릴 수 없습니다.' },
    ],
    diagnosis: '거절 과잉 (over-refusal) — 무해한 요청까지 거절',
    cause: '안전 조련이 과하면 "거절"이 만능 고득점 행동이 됨 — 유용함과 안전함의 균형 붕괴.',
    remedy: '무해한 요청 평가셋으로 거절률 측정 + 선호 데이터에 "도와야 할 사례" 보강.',
  },
]

const opened = ref<boolean[]>(SYMPTOMS.map(() => false))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 성적표 읽기 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 성적표 읽기: 6%p 차이는 진짜일까?</p>
    <p class="mb-3 text-xs text-slate-500">모델 A 72% vs B 66%. 문항 수(n)를 바꿔 가며 오차범위(±)를 보세요.</p>

    <div class="mb-3 flex flex-wrap items-center gap-2 text-sm">
      <span class="text-slate-600">시험 문항 수 n =</span>
      <button
        v-for="p in N_PRESETS"
        :key="p"
        type="button"
        class="rounded-lg border px-3 py-1.5 transition"
        :class="n === p ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
        @click="n = p"
      >
        {{ p.toLocaleString() }}문항
      </button>
    </div>

    <!-- 점수 + 오차범위 시각화 -->
    <div class="mb-2 space-y-3 rounded-lg bg-slate-50 p-4">
      <div v-for="(m, i) in [{ name: '모델 A', p: A, ci: ciA, color: 'bg-indigo-500', line: 'bg-indigo-300' }, { name: '모델 B', p: B, ci: ciB, color: 'bg-amber-500', line: 'bg-amber-300' }]" :key="i">
        <div class="mb-1 flex justify-between text-xs">
          <span class="font-semibold text-slate-600">{{ m.name }} — {{ pp(m.p) }}%</span>
          <span class="text-slate-600">± {{ pp(m.ci) }}%p</span>
        </div>
        <div class="relative h-5">
          <div class="absolute inset-y-2 w-full rounded bg-slate-200/60" />
          <div
            class="absolute inset-y-2 rounded transition-all"
            :class="m.line"
            :style="{ left: toPct(m.p - m.ci), width: `calc(${toPct(m.p + m.ci)} - ${toPct(m.p - m.ci)})` }"
          />
          <div class="absolute top-0 h-5 w-1.5 rounded transition-all" :class="m.color" :style="{ left: toPct(m.p) }" />
        </div>
      </div>
      <div class="flex justify-between text-xs text-slate-500"><span>58%</span><span>70%</span><span>82%</span></div>
    </div>
    <p class="rounded-lg p-3 text-sm" :class="separated ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'">👀 {{ obs }}</p>

    <!-- ② 부작용 진단소 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 부작용 진단소: 이 모델, 어디가 아픈 걸까요?</p>
    <p class="mb-3 text-xs text-slate-500">대화를 읽고 진단해 보세요. 버튼을 누르면 진단명·원인·처방이 나옵니다.</p>

    <div class="space-y-3">
      <div v-for="(s, i) in SYMPTOMS" :key="i" class="rounded-lg border border-slate-100 p-3">
        <div class="mb-2 space-y-1.5">
          <p v-for="(d, j) in s.dialog" :key="j" class="text-sm leading-relaxed">
            <span class="mr-1 rounded px-1.5 py-0.5 text-xs font-semibold" :class="d.who === '사용자' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600'">{{ d.who }}</span>
            <span class="text-slate-700">{{ d.text }}</span>
          </p>
        </div>
        <button
          v-if="!opened[i]"
          type="button"
          class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          @click="opened[i] = true"
        >
          진단하기 {{ s.icon }}
        </button>
        <div v-else class="rounded-lg bg-rose-50 p-3 text-sm text-slate-700">
          <p class="font-bold text-rose-700">{{ s.icon }} {{ s.diagnosis }}</p>
          <p class="mt-1"><b class="text-slate-600">원인 계보:</b> {{ s.cause }}</p>
          <p class="mt-1"><b class="text-slate-600">처방:</b> {{ s.remedy }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
