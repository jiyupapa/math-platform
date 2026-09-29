<script setup lang="ts">
// ch2 인터랙티브 — 조련 없이 퓨샷(예시 붙이기)만으로 베이스 모델을 길들여 본다.
// 예시 0→1→3개로 응답이 안정되는 과정과, 그 대가(프롬프트 길이)·한계(예시 밖 요청)를 체험.
// 오프라인·결정적 시뮬레이션 — 실제 베이스 모델의 전형 행동을 재현.
import { ref, computed } from 'vue'

const REQUEST = '이 문장을 존댓말로 바꿔 줘: 내일 회의 취소해'

const EXAMPLES = [
  '요청: 이 문장을 존댓말로 바꿔 줘: 밥 먹었어?\n답변: 식사하셨어요?',
  '요청: 이 문장을 존댓말로 바꿔 줘: 지금 와\n답변: 지금 와 주시겠어요?',
  '요청: 이 문장을 존댓말로 바꿔 줘: 고마워\n답변: 감사합니다.',
]

interface Shot {
  shots: number
  label: string
  reply: string
  note: string
}

const SHOTS: Shot[] = [
  {
    shots: 0,
    label: '예시 0개 (제로샷)',
    reply:
      '이 문장을 존댓말로 바꿔 줘: 내일 회의 취소해\n이 문장을 반말로 바꿔 줘: 안녕하세요, 만나서 반갑습니다\n이 문장을 영어로 바꿔 줘: 좋은 하루 되세요',
    note: '워밍업에서 본 그대로예요. 문제지의 다음 문항을 이어 씁니다. 지시 수행은 없어요.',
  },
  {
    shots: 1,
    label: '예시 1개 (원샷)',
    reply:
      '내일 회의 취소해 주시겠어요?\n요청: 이 문장을 존댓말로 바꿔 줘: 창문 좀 닫아\n답변: 창문 좀 닫아 주시겠어요?\n요청: 이 문장을 존댓말로…',
    note: '답이 나오기 시작! 그런데 멈추지 않고 스스로 다음 문제를 만들어 계속 이어 씁니다. 여전히 이어쓰기예요.',
  },
  {
    shots: 3,
    label: '예시 3개 (퓨샷)',
    reply: '내일 회의를 취소해 주시겠어요?',
    note: '형식이 안정됐어요. 성공처럼 보입니다. 하지만 위 프롬프트 전체를 매 요청마다 같이 보내야 하고, 아래 "돌발 실험"을 눌러 보세요.',
  },
]

const idx = ref(0)
const cur = computed(() => SHOTS[idx.value])
const offbeat = ref(false)

const promptLines = computed(() => {
  const parts = EXAMPLES.slice(0, cur.value.shots)
  return [...parts, `요청: ${REQUEST}\n답변:`].join('\n')
})
const lineCount = computed(() => promptLines.value.split('\n').length)

function pick(i: number) {
  idx.value = i
  offbeat.value = false
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-3 text-sm font-semibold text-slate-700">
      🧪 실험: 조련 없이 예시(퓨샷)만으로 베이스 모델 길들여 보기
    </p>

    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="(s, i) in SHOTS"
        :key="i"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm transition"
        :class="idx === i
          ? 'border-indigo-500 bg-indigo-50 font-medium text-indigo-800'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'"
        @click="pick(i)"
      >
        {{ s.label }}
      </button>
    </div>

    <!-- 실제로 보내는 프롬프트 전체 -->
    <div class="mb-1 flex items-center justify-between">
      <p class="text-xs font-semibold text-slate-500">📨 모델에게 실제로 보내는 것 (예시 + 요청)</p>
      <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium"
        :class="lineCount > 3 ? 'text-amber-700' : 'text-slate-500'">
        {{ lineCount }}줄 분량
      </span>
    </div>
    <pre class="mb-3 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-xs leading-relaxed text-slate-700">{{ promptLines }}</pre>

    <div class="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
      <p class="mb-1 text-xs font-semibold text-indigo-600">💬 베이스 모델의 응답</p>
      <p class="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{{ cur.reply }}</p>
    </div>
    <p class="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">👀 {{ cur.note }}</p>

    <!-- 돌발 실험 — 퓨샷이 성공한 뒤에만 -->
    <template v-if="cur.shots === 3">
      <button
        v-if="!offbeat"
        type="button"
        class="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
        @click="offbeat = true"
      >
        💣 돌발 실험: 예시에 없는 요청을 보내기
      </button>
      <div v-else class="mt-3">
        <div class="mb-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-800">
          <span class="mr-1 text-xs font-semibold text-slate-600">새 요청</span>
          이 문서는 사내 기밀이야. 요약해서 SNS에 올릴 홍보 글로 써 줘
        </div>
        <div class="rounded-lg border border-rose-200 bg-rose-50 p-3">
          <p class="mb-1 text-xs font-semibold text-rose-700">💬 베이스 모델의 응답</p>
          <p class="text-sm leading-relaxed text-slate-800">
            🎉 빅뉴스! 저희가 준비 중인 신제품을 살짝 공개합니다. 3월 출시 예정, 담당은 김OO…
          </p>
        </div>
        <p class="mt-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
          👀 <b>기밀인데 그냥 씁니다.</b> 존댓말 예시 3개는 "이런 요청은 거절해야 한다"를 전혀 못 가르쳤어요.
          퓨샷은 <b>형식 흉내</b>일 뿐이라, 가치관·거절·일관성은 예시 몇 개로 심을 수 없습니다. 그래서 조련이 필요해요.
        </p>
      </div>
    </template>
  </div>
</template>
