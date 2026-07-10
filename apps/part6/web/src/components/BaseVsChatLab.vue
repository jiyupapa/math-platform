<script setup lang="ts">
// ch0 인터랙티브 — 같은 프롬프트를 '베이스 모델'과 '챗 모델'에게 보내 응답을 나란히 비교.
// 실제 LLM 호출 없이 미리 준비한 대표 응답을 보여주는 시뮬레이션 (오프라인·결정적 — 시연 안전).
// 응답 예시는 실제 베이스 모델의 전형적 행동(문서 이어쓰기·시험지 이어쓰기·에세이화)을 재현한 것.
import { ref } from 'vue'

interface Example {
  label: string
  prompt: string
  base: string
  chat: string
  observe: string
}

const examples: Example[] = [
  {
    label: '① 계산 부탁',
    prompt: '2 더하기 2는',
    base: '2 더하기 2는 4라는 것을 모르는 사람은 없다. 하지만 우리나라 수학 교육의 현실을 들여다보면, 단순 연산은 잘하지만 개념을 묻는 순간 무너지는 학생이 많다. 전문가들은 그 원인으로…',
    chat: '4입니다.',
    observe: '베이스 모델은 답을 "아는데도" 답하지 않아요 — 이 문장으로 시작하는 그럴듯한 글(칼럼)을 이어 쓸 뿐입니다.',
  },
  {
    label: '② 지시하기',
    prompt: '아래 문장을 영어로 번역해 줘: 오늘 날씨가 참 좋다',
    base: '아래 문장을 영어로 번역해 줘: 오늘 날씨가 참 좋다\n아래 문장을 일본어로 번역해 줘: 내일 비가 온다고 한다\n아래 문장을 중국어로 번역해 줘: 주말에 등산을 갈 예정이다',
    chat: 'The weather is really nice today.',
    observe: '지시를 "따르는" 대신, 이런 지시문이 쭉 나열된 문제지를 본 적이 있어서 다음 문제를 이어 씁니다. 번역은 끝내 안 해요.',
  },
  {
    label: '③ 질문하기',
    prompt: '서울에서 꼭 가봐야 할 곳은 어디야?',
    base: '서울에서 꼭 가봐야 할 곳은 어디야? 라고 물으신다면 저는 할 말이 많죠ㅋㅋ 지난 주말에 다녀온 후기 올립니다~ 1편은 성수동 카페 투어였구요, 이번엔 드디어…',
    chat: '처음 방문이시라면 이 세 곳을 추천해요.\n1. 경복궁 — 한국의 대표 고궁\n2. 북촌 한옥마을 — 전통 가옥 산책\n3. N서울타워 — 도시 전경',
    observe: '질문에 답하는 대신, 이 질문으로 시작하는 블로그 글을 흉내 냅니다. 인터넷에서 본 "다음에 올 법한 글자"를 이어갈 뿐이에요.',
  },
]

const selected = ref<number | null>(null)
const revealed = ref(false)

function pick(i: number) {
  selected.value = i
  revealed.value = false
}
function send() {
  if (selected.value !== null) revealed.value = true
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-3 text-sm font-semibold text-slate-700">
      🧪 실험: 같은 프롬프트, 두 모델 — 무엇이 다른지 직접 확인하세요
    </p>

    <!-- 프롬프트 선택 -->
    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="(ex, i) in examples"
        :key="i"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm transition"
        :class="selected === i
          ? 'border-indigo-500 bg-indigo-50 font-medium text-indigo-800'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'"
        @click="pick(i)"
      >
        {{ ex.label }}
      </button>
    </div>

    <template v-if="selected !== null">
      <div class="mb-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-800">
        <span class="mr-1 text-xs font-semibold text-slate-500">프롬프트</span>
        {{ examples[selected].prompt }}
      </div>

      <button
        v-if="!revealed"
        type="button"
        class="mb-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        @click="send"
      >
        두 모델에게 보내기 ▶
      </button>

      <div v-else>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p class="mb-1 text-xs font-bold text-amber-700">🦁 베이스 모델 (조련 전)</p>
            <p class="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{{ examples[selected].base }}</p>
            <p class="mt-2 text-[11px] text-amber-600">…그럴듯한 글을 계속 이어 씁니다 (끝나지 않음)</p>
          </div>
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p class="mb-1 text-xs font-bold text-emerald-700">🐕 챗 모델 (조련 후)</p>
            <p class="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{{ examples[selected].chat }}</p>
            <p class="mt-2 text-[11px] text-emerald-600">지시를 이해하고, 답하고, 멈춥니다</p>
          </div>
        </div>
        <p class="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">
          👀 <b>관찰:</b> {{ examples[selected].observe }}
        </p>
      </div>
    </template>
    <p v-else class="text-sm text-slate-400">위에서 프롬프트를 하나 골라 보세요.</p>
  </div>
</template>
