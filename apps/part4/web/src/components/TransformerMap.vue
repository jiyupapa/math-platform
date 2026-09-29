<script setup lang="ts">
// 홈 화면용 "트랜스포머 한눈에 보기" 지도.
// LLM 이 글을 받아 다음 단어를 내놓기까지의 흐름을 단계 칩으로 보여주고,
// 각 단계가 어느 챕터인지 연결한다. (콘텐츠가 아니라 길잡이 그림)
interface Stage {
  label: string
  sub: string
  phase: number
  goal?: boolean
}

const stages: Stage[] = [
  { label: '입력 글', sub: '"오늘 날씨가"', phase: 1 },
  { label: '토큰화', sub: '조각으로 쪼개기', phase: 2 },
  { label: '임베딩', sub: '의미 벡터로', phase: 3 },
  { label: '위치 인코딩', sub: '순서 더하기', phase: 4 },
  { label: '어텐션', sub: '서로 참고하기', phase: 6 },
  { label: '피드포워드', sub: '한번 더 생각', phase: 8 },
  { label: '출력층', sub: '소프트맥스 → 확률', phase: 9 },
  { label: '다음 단어', sub: '"좋다" 🎯', phase: 10, goal: true },
]
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-indigo-600">트랜스포머 한눈에 보기</p>
    <p class="mb-4 text-sm text-slate-500">
      LLM 이 글을 읽고 <b>다음 단어</b>를 내놓기까지의 흐름입니다. 이 조각들을 하나씩 익혀 갑니다.
    </p>
    <div class="flex flex-wrap items-stretch gap-2">
      <template v-for="(s, i) in stages" :key="s.label">
        <div
          class="flex min-w-[92px] flex-1 flex-col rounded-xl border px-3 py-2.5 text-center"
          :class="
            s.goal
              ? 'border-indigo-300 bg-indigo-50'
              : 'border-slate-200 bg-slate-50'
          "
        >
          <span class="text-xs font-bold text-slate-600">Phase {{ s.phase }}</span>
          <span class="text-sm font-semibold" :class="s.goal ? 'text-indigo-700' : 'text-slate-700'">
            {{ s.label }}
          </span>
          <span class="mt-0.5 text-xs text-slate-600">{{ s.sub }}</span>
        </div>
        <div
          v-if="i < stages.length - 1"
          class="flex items-center text-lg text-slate-500"
          aria-hidden="true"
        >
          ›
        </div>
      </template>
    </div>
    <p class="mt-4 text-xs text-slate-500">
      💡 워밍업의 <b>소프트맥스</b>는 맨 끝 "출력층"에서 점수를 확률로 바꾸는 바로 그 장치입니다.
    </p>
  </div>
</template>
