<script setup lang="ts">
// Phase 9 — 출력층. 마지막 문맥 벡터 → 단어별 점수(logits) → 소프트맥스 → 다음 단어 확률.
import { ConceptCard } from '@series/ui'
import { PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import OutputLab from '@/components/OutputLab.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { RouterLink } from 'vue-router'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch9')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 9 · 출력층</p>
    <h1 class="mb-4 text-3xl font-bold">출력층 — 벡터를 다음 단어 확률로</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      블록들을 다 통과하면, 마지막 자리에는 <b>문맥이 잔뜩 담긴 벡터</b> 하나가 남습니다.
      이 벡터를 <b>사전 전체 단어의 점수</b>로 바꾸고 <b>소프트맥스</b>로 확률을 내면 — 드디어
      <b>다음 단어</b>가 정해집니다. 샘플 챕터에서 만졌던 그 소프트맥스가 여기서 일해요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      마지막 벡터가 어떻게 <b>어휘 전체의 점수(logits) → 확률</b>로 바뀌어 다음 단어가 뽑히는지,
      벡터를 직접 움직이며 이해합니다. (샘플 챕터 소프트맥스와 하나로 이어집니다)
    </ConceptCard>

    <!-- ===== 1. 벡터 → 단어별 점수 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      1. 한 벡터에서 모든 단어의 점수가 나온다
      <ReviewFlag id="ch9-s1" chapter="ch9" label="1. 벡터 → logits" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      <b>출력층(LM head)</b>은 마지막 문맥 벡터를 <b>사전에 있는 모든 단어</b>와 견주어, 단어마다
      <b>점수(logit)</b>를 하나씩 매깁니다. 벡터가 어떤 단어의 방향과 <b>잘 맞을수록</b> 그 단어 점수가
      높아져요(내적!). 아래에서 벡터를 움직여 보세요.
    </p>

    <OutputLab />

    <ConceptCard tone="note" title="용어 다시 보기: 로짓(logit)과 어휘">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>출력층(output layer / LM head)</b> — 문맥 벡터를 <b>어휘 크기만큼의 점수</b>로 바꾸는 마지막 층.
          (LM head = Language Model head, "언어모델의 머리"라는 뜻)</li>
        <li><b>logit(로짓)</b> — 소프트맥스 전의 <b>날것 점수</b>(샘플 챕터에서 배운 그것!). 단어마다 하나씩.</li>
        <li>사전이 <b>5만 단어</b>면, 출력층은 벡터 하나에서 <b>5만 개의 점수</b>를 뽑습니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="출력층은 마지막 벡터 하나에서 사전에 있는 '모든 단어'의 점수를 만든다."
      type="truefalse"
      :answer="0"
      explanation="맞아요. 벡터 1개 → 어휘 크기(예: 5만)만큼의 점수(logits)."
    />

    <!-- ===== 2. logits → softmax → 확률 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      2. 점수 → 소프트맥스 → 확률 → 다음 단어
      <ReviewFlag id="ch9-s2" chapter="ch9" label="2. softmax로 확률" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      단어별 점수(logits)를 그대로 쓰지 않고, <b>소프트맥스</b>로 <b>합이 1인 확률 분포</b>로 바꿉니다.
      이게 바로 샘플 챕터의 공식이에요 — 똑같습니다.
    </p>
    <MathBlock expr="P(\text{단어}_i) = \text{softmax}(z_i) = \dfrac{e^{z_i}}{\sum_j e^{z_j}}" />
    <p class="mt-1 text-sm text-slate-500">
      <MathBlock inline expr="z_i" /> = <MathBlock inline expr="i" />번째 단어의 점수(logit).
      기억나죠? — <MathBlock inline expr="e^{\;}" /> 는 <b>지수</b>(2.718을 거듭제곱, 항상 양수),
      <MathBlock inline expr="\textstyle\sum_j" /> 는 <b>시그마</b>("모든 단어를 더하기"). 샘플 챕터의 그 공식 그대로입니다.
      이제 이 확률에서 다음 단어를 고르면 됩니다(고르는 방법은 Phase 12).
    </p>

    <ConceptCard tone="tip" title="한 바퀴가 완성됐어요">
      토큰화(ch2) → 임베딩(ch3) → 위치(ch4) → 어텐션·블록(ch5~8) → <b>출력층(ch9)</b>.
      드디어 <b>입력 글 → 다음 단어 확률</b>까지 한 바퀴가 이어졌습니다. 이걸 반복하는 게 ch1의
      <RouterLink to="/ch/ch1" class="text-indigo-600 underline">자기회귀 생성</RouterLink>이에요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="단어별 점수(logits)를 다음 단어 '확률'로 바꾸는 장치는?"
      :choices="['소프트맥스', '토큰화', '위치 인코딩', '잔차연결']"
      :answer="0"
      :hints="['샘플 챕터에서 배운 그것.']"
      explanation="소프트맥스입니다. 점수를 합 1의 확률 분포로 바꿔 다음 단어를 고릅니다."
    />

    <DetailsCard title="➕ 더 깊이 알아보기 — 입력 임베딩과 출력층이 사실 '한 몸'일 수 있다">
      <p class="mb-2">
        출력층은 "문맥 벡터 · 단어 벡터"로 점수를 냅니다. 그런데 이 <b>단어 벡터</b>는
        <b>입력 임베딩</b>(ch3)과 <b>같은 것을 재사용</b>하는 경우가 많아요. 이를
        <b>가중치 묶기(weight tying)</b>라고 합니다.
      </p>
      <ul class="mb-2 list-disc space-y-1 pl-5 text-sm">
        <li><b>파라미터 절약</b>: 큰 임베딩 행렬(어휘×차원)을 두 번 안 만들고 한 번만.</li>
        <li><b>성능</b>: "단어를 벡터로 넣는 규칙"과 "벡터를 단어로 읽는 규칙"이 <b>일관</b>돼 학습에 유리.</li>
      </ul>
      <div class="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">
        🎯 즉 <b>입구(임베딩)와 출구(출력층)</b>가 같은 사전을 공유하는 셈 — 들어갈 때와 나올 때 같은 지도.
      </div>
    </DetailsCard>

    <!-- ===== 3. AI 연결 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      3. 🤖 여기가 매 스텝의 '결승선'
      <ReviewFlag id="ch9-s3" chapter="ch9" label="3. AI 연결" />
    </h2>
    <ConceptCard tone="ai" title="출력층 → 다음 단어 → 다시 입력으로">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          출력층의 확률 분포에서 다음 단어를 하나 고르면, 그 단어를 문장에 붙이고
          <b>처음부터 다시</b> 돌립니다(ch1 자기회귀). 출력층은 <b>매 스텝의 결승선</b>이에요.
        </li>
        <li>
          "가장 확률 높은 단어"만 고르면 뻔해지고, <b>확률에 따라 살짝 무작위</b>로 고르면 다양해집니다.
          이 <b>고르는 방법</b>이 Phase 12(샘플링·temperature)입니다.
        </li>
        <li>
          정리하면 <b>입력 → (토큰화·임베딩·위치·블록) → 출력층 → 확률 → 단어 → 반복</b>.
          이 전체를 다음 챕터(ch10)에서 <b>한 흐름</b>으로 잇습니다.
        </li>
      </ul>
      <p class="mt-2 text-sm text-violet-900/80">
        회수하는 수학 — 출력층이 내놓는 <b>확률분포</b>의 문법은
        <b><PartLink :part="3" ch="ch5">3부 5장</PartLink></b>에서 쌓은 그 기초입니다.
      </p>
      <p class="mt-2 text-sm text-violet-900/80">
        🎉 다음 챕터가 이 과정의 <b>전체 조립</b> — 이 학습의 <b>궁극 목표</b>입니다!
      </p>
    </ConceptCard>

    <!-- ===== 문제 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700"><b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.</p>

    <QuizSet title="출력층 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="출력층은 마지막 문맥 벡터를 '사전 전체 단어의 점수(logits)'로 바꾼다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 벡터 하나 → 어휘 크기만큼의 점수."
      />
      <Quiz
        difficulty="easy"
        question="단어별 점수(logits)를 다음 단어 확률로 바꾸는 것은?"
        :choices="['소프트맥스', '토큰화', '어텐션', '잔차연결']"
        :answer="0"
        explanation="소프트맥스. 샘플 챕터에서 배운 바로 그 장치입니다."
      />
      <Quiz
        difficulty="easy"
        question="출력층에서 나오는 점수(logit)는 샘플 챕터에서 배운 '로짓'과 같은 개념이다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 소프트맥스 전의 날것 점수 = 로짓. 출력층이 단어마다 하나씩 냅니다."
      />
      <Quiz
        difficulty="easy"
        question="출력층이 낸 다음 단어 확률들을 모두 더하면?"
        :choices="['1 (=100%)', '0', '단어 수만큼', '항상 2']"
        :answer="0"
        explanation="1입니다. 소프트맥스가 만든 확률 분포이니까요."
      />

      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="문맥 벡터 (1, 2) 와 어떤 단어의 출력 벡터 (2, 1) 의 내적으로 그 단어의 점수(logit)를 단계별로 구하세요."
        :steps="[
          { lhs: '1 \\times 2', answer: 2 },
          { lhs: '2 \\times 1', answer: 2 },
          { lhs: '2 + 2', answer: 4 },
        ]"
        :hints="['성분끼리 곱한 뒤 더합니다(내적).']"
        explanation="1·2 + 2·1 = 4. 벡터가 그 단어 방향과 잘 맞을수록 점수가 큽니다."
      />
      <Quiz
        difficulty="medium"
        question="사전에 단어가 5만 개라면, 출력층이 벡터 하나에서 만드는 점수(logit)는 몇 개일까요?"
        :choices="['1개', '2개', '5만 개', '무한개']"
        :answer="2"
        :hints="['단어마다 점수 하나씩.']"
        explanation="어휘 크기만큼 — 5만 개. 그 5만 개를 소프트맥스해 확률로 만듭니다."
      />
      <Quiz
        difficulty="medium"
        question="문맥 벡터가 어떤 단어의 출력 벡터와 방향이 잘 맞으면, 그 단어의 점수는?"
        :choices="['높아진다', '낮아진다', '항상 0', '음수로 고정']"
        :answer="0"
        :hints="['내적이 크다 = 잘 맞는다.']"
        explanation="내적이 커져 점수가 높아지고, 소프트맥스 후 확률도 커집니다."
      />
      <Quiz
        difficulty="medium"
        question="출력층 다음에 하는 일로 옳은 것은?"
        :choices="[
          '확률에서 다음 단어를 골라 문장에 붙이고, 처음부터 다시 예측한다',
          '문장을 지운다',
          '토큰화를 다시 한다',
          '아무것도 안 한다',
        ]"
        :answer="0"
        explanation="고른 단어를 붙이고 다시 예측 — ch1의 자기회귀 생성입니다."
      />

      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="입력 임베딩과 출력층이 같은 가중치를 공유하는 것(weight tying)의 이점으로 옳은 것은?"
        :choices="[
          '파라미터를 절약하고, 넣는 규칙과 읽는 규칙이 일관돼 학습에 유리',
          '토큰이 늘어난다',
          '확률의 합이 2가 된다',
          '속도가 느려진다',
        ]"
        :answer="0"
        :hints="['입구와 출구가 같은 사전을 공유.']"
        explanation="큰 임베딩 행렬을 한 번만 두어 파라미터를 아끼고, 입출력 규칙이 일관돼 성능에도 유리합니다."
      />
      <Quiz
        difficulty="hard"
        question="출력층 + 소프트맥스는 ch1의 무엇과 직접 연결되나요?"
        :choices="[
          '매 스텝 다음 단어를 확률로 고르는 자기회귀 생성',
          '토큰화',
          '위치 인코딩',
          '멀티헤드 분할',
        ]"
        :answer="0"
        explanation="출력층이 낸 확률로 다음 단어를 고르고 반복 — 그게 자기회귀 생성입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch9')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 9 완료 — 벡터가 다음 단어가 됐습니다</p>
      <p class="mt-1 text-sm text-emerald-700">
        입력부터 다음 단어까지 조각이 전부 모였어요. 다음 챕터(ch10)에서 이 모두를 <b>한 흐름</b>으로 잇습니다
        — <b>이 학습의 궁극 목표</b>! 노트북 <code>notebooks/ch09_output_layer.ipynb</code> 도 함께!
      </p>
    </div>
  </article>
</template>
