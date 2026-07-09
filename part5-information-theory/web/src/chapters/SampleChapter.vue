<script setup lang="ts">
// Phase 0 샘플 챕터 — 공통 컴포넌트를 모두 사용해 "한 챕터의 완성형"을 보여준다.
// 실제 Phase 1~10 챕터도 이 구조를 그대로 따른다.
import ConceptCard from '@/components/ConceptCard.vue'
import DetailsCard from '@/components/DetailsCard.vue'
import MathBlock from '@/components/MathBlock.vue'
import ChartView from '@/components/ChartView.vue'
import TwentyQuestions from '@/components/TwentyQuestions.vue'
import Quiz from '@/components/Quiz.vue'
import StepQuiz from '@/components/StepQuiz.vue'
import QuizSet from '@/components/QuizSet.vue'
import NotebookCard from '@/components/NotebookCard.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 찍기 vs 반반 — 질문 횟수에 따른 남은 후보 수 비교 (64개 후보, 운 나쁜 경우)
const strategyChart = {
  labels: ['0', '1', '2', '3', '4', '5', '6'],
  datasets: [
    {
      label: '반반 질문 (가운데 묻기)',
      data: [64, 32, 16, 8, 4, 2, 1],
      borderColor: '#6366f1',
      backgroundColor: '#6366f1',
      tension: 0.2,
    },
    {
      label: '하나씩 찍기 (운 나쁘면)',
      data: [64, 63, 62, 61, 60, 59, 58],
      borderColor: '#f59e0b',
      backgroundColor: '#f59e0b',
      tension: 0.2,
    },
  ],
}

function onSetComplete() {
  progress.markDone('sample')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">워밍업 · 10분 몸풀기</p>
    <h1 class="mb-4 text-3xl font-bold">스무고개 — 질문 하나의 가치</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      본격적인 학습 전 몸풀기입니다. 앞으로 모든 챕터가 이 페이지처럼 진행돼요 —
      설명 카드를 읽고, 게임과 그래프를 직접 만져 보고, 문제를 풀면 진도가 채워집니다.
      막히면 <b>힌트</b>가 있고, 두 번 틀리면 <b>해설</b>도 열 수 있으니 부담 없이 시작하세요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      수식 없이 게임 하나로 이 과정 전체의 핵심 문장을 얻습니다 —
      <b>"정보란 줄어드는 불확실성이다."</b>
      그리고 좋은 질문 하나가 <b>후보를 절반으로</b> 줄인다는 걸 몸으로 체감합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 일단 게임부터 — 업다운 스무고개</h2>
    <p class="leading-relaxed text-slate-700">
      제가 1~64 중에 숫자 하나를 숨겼습니다. 여러분이 숫자를 물으면
      저는 <b>UP(더 커요) / DOWN(더 작아요) / 정답</b> 셋 중 하나로만 답해요.
      몇 번 만에 찾을 수 있을까요? 일단 마음대로 물어보세요.
    </p>

    <TwentyQuestions />

    <ConceptCard tone="tip" title="핵심 관찰 — 질문마다 '남은 후보' 칸을 보세요">
      어떤 질문은 후보를 <b>절반으로 싹둑</b> 자르고(가운데 묻기),
      어떤 질문은 <b>거의 못 줄입니다</b>(구석 찍기).
      질문의 가치 = <b>그 질문이 후보를 얼마나 줄이는가</b>. 이게 이 과정 전체의 출발점이에요.
    </ConceptCard>

    <!-- 본문 중간 미니체크 (문제 세트와 별개, 진도에 미포함) -->
    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="질문 한 번에 남은 후보가 64개에서 32개가 됐다면, 그 질문은 후보를 반반으로 가르는 질문이었다."
      type="truefalse"
      :answer="0"
      explanation="맞아요. 64의 절반이 32 — 어느 쪽 답이 나와도 후보가 절반만 남는 질문이었다는 뜻입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 찍기 vs 반반 — 전략을 그래프로 비교</h2>
    <p class="leading-relaxed text-slate-700">
      "정답이 7인가요?"처럼 <b>하나씩 찍으면</b> 틀릴 때마다 후보가 딱 1개씩만 줄어요.
      운이 나쁘면 63번을 물어야 합니다. 반면 <b>가운데를 묻는 반반 질문</b>은
      어떤 답이 나와도 후보가 절반으로 줄어서, 최대 6번이면 끝나요.
    </p>

    <ChartView type="line" :data="strategyChart" :height="260" />
    <p class="mt-1 text-sm text-slate-500">
      가로축: 질문 횟수 · 세로축: 남은 후보 수. 반반 전략(보라)은 6번 만에 1개로 —
      찍기(주황)는 6번을 써도 58개가 남습니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 불확실성">
      <p>
        <b>불확실성</b> = "아직 후보가 몇 개나 남았나"의 느낌을 말합니다.
        후보 64개면 불확실성이 크고, 후보 1개면 불확실성이 0이에요.
      </p>
      <ul class="mt-2 list-disc pl-5 text-sm">
        <li><b>이름</b>: 불확실성 (uncertainty)</li>
        <li><b>읽는 법</b>: 불확실성 — 기호는 아직 없어요, 3장에서 H 로 만납니다</li>
        <li><b>뜻</b>: 정답이 무엇인지 모르는 정도. 남은 후보가 많을수록 큽니다</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="후보가 32개 남았을 때, 다음 중 가장 좋은 질문은?"
      :choices="['남은 후보의 가운데 값보다 큰가요?', '정답이 1인가요?', '정답이 32인가요?', '아무 질문이나 가치는 같다']"
      :answer="0"
      :hints="['어떤 답이 나와도 후보가 많이 줄어드는 질문이 좋은 질문이에요.']"
      explanation="가운데로 가르면 UP이든 DOWN이든 후보가 16개로 줄어요. 하나를 콕 집는 질문은 맞으면 대박이지만, 틀리면 31개가 그대로 남습니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 정보 = 줄어드는 불확실성</h2>
    <p class="leading-relaxed text-slate-700">
      방금 게임에서 UP/DOWN 답변 하나를 들을 때마다 후보가 줄었죠.
      그 <b>"줄어든 만큼"이 바로 그 답변이 준 정보</b>입니다.
      그래서 이 과정 전체를 지탱하는 한 줄 정의가 나옵니다:
    </p>
    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">정보 = 줄어드는 불확실성</p>
      <p class="mt-1 text-sm text-indigo-600">많이 줄일수록 많은 정보. 하나도 못 줄이면 정보 0.</p>
    </div>
    <p class="leading-relaxed text-slate-700">
      그리고 "후보 64개를 1개로 만들려면 반반 질문이 몇 번 필요한가?"에는 규칙이 있어요.
      <b>절반으로 접는 횟수</b>를 세면 됩니다:
      후보 2개 → 1번, 4개 → 2번, 8개 → 3번, 16개 → 4번, 32개 → 5번, 64개 → 6번.
      64 는 2를 6번 곱한 수(<MathBlock inline expr="2^6 = 64" />)라서 6번이면 충분한 거예요.
    </p>

    <DetailsCard title="➕ 더 깊이: 왜 하필 '절반'이 최선인가요?">
      한쪽으로 치우친 질문(예: 후보 64개 중 10개만 남기는 질문)은 맞으면 크게 줄지만,
      틀리면 54개가 남아요. 상대(정답)가 어디에 숨었는지 모르니 <b>최악의 경우</b>를 기준으로 보면,
      치우친 질문의 최악(54개)이 반반 질문의 최악(32개)보다 나쁩니다.
      어떤 답이 나와도 손해 보지 않는 질문 = 정확히 반으로 가르는 질문.
      "몇 번 접나"에는 사실 이름이 있는데(로그, log₂), 1장에서 게임으로 다시 만나요 — 지금은 예고만!
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — AI 는 불확실성을 줄이는 기계">
      ChatGPT 가 다음 단어를 고르는 일은 <b>후보 수만 개짜리 스무고개</b>입니다.
      "나는 아침에 ___" 다음에 올 단어의 후보는 원래 수만 개지만, 앞 문맥이
      UP/DOWN 답변처럼 후보를 확 줄여 줘요. AI 가 "배운다"는 것도, "잘한다"는 것도
      전부 <b>불확실성을 얼마나 줄이는가</b>로 측정합니다 — 이 자(측정 도구)를 만드는 게 이 과정이에요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      세 가지 유형(객관식 · 참/거짓 · 숫자입력)을 난이도 순으로 풀어보세요.
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="스무고개 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="좋은 반반 질문 하나는 남은 후보를 절반으로 줄인다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 어떤 답(UP/DOWN)이 나와도 절반만 남는 게 반반 질문의 힘이에요."
      />
      <Quiz
        difficulty="easy"
        question="다음 중 '정보'를 가장 잘 설명한 것은?"
        :choices="['불확실성을 줄여 주는 것', '무조건 길고 자세한 말', '컴퓨터에 저장된 파일', '숫자가 큰 데이터']"
        :answer="0"
        :hints="['게임에서 UP/DOWN 답변이 무엇을 줄여 줬는지 떠올려 보세요.']"
        explanation="정보 = 줄어드는 불확실성. 후보를 줄여 주지 못하는 말은 아무리 길어도 정보가 0입니다."
      />
      <Quiz
        difficulty="easy"
        question="후보 8개에서 반반 질문을 1번 하면 후보는 몇 개 남을까요?"
        type="numeric"
        :answer="4"
        explanation="8의 절반 = 4개. 반반 질문은 어떤 답이 나와도 절반만 남깁니다."
      />
      <Quiz
        difficulty="easy"
        question="'하나씩 찍기'는 운이 나쁘면 반반 전략보다 훨씬 많은 질문이 필요하다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 후보 64개면 찍기는 최악 63번, 반반은 최대 6번이에요."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="후보 16개를 반반 질문으로 1개까지 줄이는 과정을 단계별로 채우세요. (마지막 = 필요한 질문 횟수)"
        :steps="[
          { lhs: '16 \\div 2', answer: 8 },
          { lhs: '8 \\div 2', answer: 4 },
          { lhs: '4 \\div 2', answer: 2 },
          { lhs: '2 \\div 2', answer: 1 },
          { lhs: '\\text{질문 횟수}', answer: 4 },
        ]"
        :hints="['질문 1번 = 절반으로 접기 1번.', '16 → 8 → 4 → 2 → 1, 화살표 개수를 세어 보세요.']"
        explanation="절반으로 4번 접으면 16이 1이 됩니다. 16 = 2×2×2×2 (2⁴) 이기 때문이에요."
      />
      <Quiz
        difficulty="medium"
        question="후보 64개에서 반반 전략으로 정답을 확정하려면 최대 몇 번의 질문이 필요할까요?"
        type="numeric"
        :answer="6"
        :hints="['64 → 32 → 16 → … → 1, 절반으로 몇 번 접어야 하나요?']"
        explanation="64 → 32 → 16 → 8 → 4 → 2 → 1, 총 6번. 64 = 2⁶ 이라서 6번입니다."
      />
      <Quiz
        difficulty="medium"
        question="후보 100개에서 '정답이 1인가요?'라고 물었는데 '아니요'라는 답을 들었다면, 남는 후보는 몇 개일까요?"
        type="numeric"
        :answer="99"
        :hints="['찍기 질문은 틀리면 딱 1개만 소거됩니다.']"
        explanation="1 하나만 지워지고 99개가 그대로 남아요. 이 답변이 준 정보가 아주 적었다는 뜻입니다."
      />
      <Quiz
        difficulty="medium"
        question="반반 질문을 했는데 남은 후보 수가 오히려 늘어나는 경우도 있다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 질문의 답을 들으면 후보는 절대 늘지 않아요 — 잘 줄거나(좋은 질문), 조금 줄거나(나쁜 질문)입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="후보가 128개라면 반반 전략으로 최대 몇 번 만에 정답을 확정할 수 있을까요?"
        type="numeric"
        :answer="7"
        :hints="['128 은 64의 두 배 — 접기가 한 번 더 필요해요.', '128 → 64 → 32 → … → 1']"
        explanation="128 = 2⁷ 이므로 7번. 후보가 두 배가 되어도 질문은 딱 한 번만 더 필요합니다 — 이 신기한 성질이 1장의 주인공(log)이에요."
      />
      <Quiz
        difficulty="hard"
        question="후보 20개. 질문 A는 '10 이하인가요?', 질문 B는 '정답이 7인가요?'. 최악의 경우를 대비한다면 어느 질문이 좋을까요?"
        :choices="['A — 최악이라도 10개만 남는다', 'B — 맞으면 한 번에 끝나니까', '둘 다 똑같다', '후보가 20개면 어떤 질문도 소용없다']"
        :answer="0"
        :hints="['각 질문의 최악의 경우에 남는 후보 수를 비교해 보세요.']"
        explanation="A는 어떤 답이 나와도 10개만 남습니다. B는 맞으면 1개(대박)지만 틀리면 19개 — 최악 기준으로는 A가 압도적으로 좋아요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('sample')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">워밍업 완료 — 준비 끝!</p>
      <p class="mt-1 text-sm text-emerald-700">
        본 학습도 정확히 이렇게 진행됩니다. 다음은 1장 — "절반으로 몇 번 접나"에
        이름(log₂)과 단위(비트)를 붙입니다.
      </p>
      <RouterLink
        to="/ch/ch1"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        1장 — 놀람의 크기 →
      </RouterLink>
    </div>
  </article>
</template>
