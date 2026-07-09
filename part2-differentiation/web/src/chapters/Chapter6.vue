<script setup lang="ts">
// Phase 6 · 연쇄법칙 (핵심 — 역전파의 심장)
import ConceptCard from '@/components/ConceptCard.vue'
import MathBlock from '@/components/MathBlock.vue'
import ChainRule from '@/components/ChainRule.vue'
import Quiz from '@/components/Quiz.vue'
import StepQuiz from '@/components/StepQuiz.vue'
import QuizSet from '@/components/QuizSet.vue'
import ReviewFlag from '@/components/ReviewFlag.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// ChainRule 용: 속함수 g(x)=2x+1, 겉함수 f(u)=u²  → y=(2x+1)²
const g = (x: number) => 2 * x + 1
const dg = (_x: number) => 2
const f = (u: number) => u * u
const df = (u: number) => 2 * u

function onSetComplete() {
  progress.markDone('ch6')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 6 · 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">연쇄법칙 🔗</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      이 챕터가 전체 커리큘럼의 <b>심장</b>입니다. 연쇄법칙은 "함수 안의 함수"를 미분하는 방법이자,
      나중에 배울 <b>역전파(backpropagation)</b> 그 자체예요. 한 번 확실히 잡아두면 AI 학습 원리가
      한눈에 들어옵니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>합성함수</b> <MathBlock inline expr="f(g(x))" /> 에서 겉함수·속함수를 구분한다</li>
        <li><b>연쇄법칙</b> <MathBlock inline expr="(f(g(x)))' = f'(g(x))\cdot g'(x)" /> = 겉미분 × 속미분</li>
        <li>변화율이 <b>사슬을 따라 곱해진다</b>는 직관(<MathBlock inline expr="\frac{dy}{dx}=\frac{dy}{du}\cdot\frac{du}{dx}" />)을 얻는다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 합성함수 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 합성함수 — 함수 안의 함수</h2>
    <ReviewFlag id="ch6-s1" chapter="ch6" label="1. 합성함수 — 함수 안의 함수" />
    <p class="leading-relaxed text-slate-700">
      <MathBlock inline expr="(2x+1)^2" /> 같은 식은 <b>두 단계</b>로 이뤄져 있어요:
      먼저 <MathBlock inline expr="2x+1" /> 을 계산하고(속), 그 결과를 <b>제곱</b>합니다(겉).
      이렇게 함수를 <b>겹쳐 넣은</b> 것이 합성함수입니다.
    </p>

    <ConceptCard tone="note" title="새 용어 — 합성함수 / 겉함수·속함수">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>합성함수</b> <MathBlock inline expr="f(g(x))" />: <MathBlock inline expr="g" /> 의 결과를 다시 <MathBlock inline expr="f" /> 에 넣은 함수.</li>
        <li><b>속함수</b> <MathBlock inline expr="g(x)" /> (안쪽, 먼저 계산), <b>겉함수</b> <MathBlock inline expr="f(u)" /> (바깥, 나중 계산).</li>
        <li>
          예: <MathBlock inline expr="(2x+1)^2" /> → 속함수 <MathBlock inline expr="u=2x+1" />, 겉함수 <MathBlock inline expr="u^2" />.
          중간값 <MathBlock inline expr="u" /> 를 <b>중간변수</b>라 합니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="(2x+1)² 에서 '겉함수'와 '속함수'를 바르게 짝지은 것은?"
      :choices="[
        '겉: 제곱( u² ), 속: 2x+1',
        '겉: 2x+1, 속: 제곱( u² )',
        '겉: 2x, 속: +1',
        '겉함수·속함수 구분이 없다',
      ]"
      :answer="0"
      :hints="['나중에 하는 계산이 겉, 먼저 하는 계산이 속.']"
      explanation="먼저 2x+1(속)을 구하고 그걸 제곱(겉)하므로, 겉=u², 속=2x+1."
    />

    <!-- 2. 연쇄법칙 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 연쇄법칙 — 겉미분 × 속미분</h2>
    <ReviewFlag id="ch6-s2" chapter="ch6" label="2. 연쇄법칙 — 겉미분 × 속미분" />
    <MathBlock expr="\big(f(g(x))\big)' = f'(g(x))\cdot g'(x)" />
    <p class="leading-relaxed text-slate-700">
      "<b>겉함수를 미분(속은 그대로 둔 채) × 속함수를 미분</b>"입니다.
      아래 사슬에서 입력 <MathBlock inline expr="x" /> 를 움직여, 각 단계의 변화율이 어떻게 곱해지는지 보세요.
    </p>

    <ChainRule
      :inner="g"
      :d-inner="dg"
      :outer="f"
      :d-outer="df"
      inner-label="g(x) = 2x+1"
      outer-label="f(u) = u²"
      :xmin="-1"
      :xmax="3"
      :initial-x="1"
    />

    <ConceptCard tone="note" title="연쇄법칙 적용 순서">
      <MathBlock inline expr="y=(2x+1)^2" /> 를 미분하면:
      <ol class="mt-2 list-decimal space-y-1 pl-5 text-sm">
        <li>겉함수 미분(속 그대로): <MathBlock inline expr="2\cdot(2x+1)" /></li>
        <li>속함수 미분: <MathBlock inline expr="(2x+1)' = 2" /></li>
        <li>둘을 곱한다: <MathBlock inline expr="2(2x+1)\cdot 2 = 4(2x+1)" /></li>
      </ol>
    </ConceptCard>

    <StepQuiz
      difficulty="medium"
      question="연쇄법칙으로 y=(2x+1)² 의 도함수를 x=1 에서 구하세요. (속 g=2x+1, 겉 f=u²)"
      :steps="[
        { lhs: `\\text{속미분 } g'(1) = 2`, answer: 2 },
        { lhs: `u = g(1) = 2(1)+1`, answer: 3 },
        { lhs: `\\text{겉미분 } f'(u) = 2u = 2\\times 3`, answer: 6 },
        { lhs: `\\text{곱 } f'(u)\\cdot g'(x) = 6\\times 2`, answer: 12 },
      ]"
      :hints="['속미분 g′=2. u=g(1)=3.', '겉미분 f′(u)=2u. 마지막에 두 미분을 곱.']"
      explanation="f'(u)·g'(x) = 6·2 = 12. (도함수 4(2x+1), x=1 → 12)"
    />

    <!-- 3. 라이프니츠 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 변화율이 곱해진다 (라이프니츠 형)</h2>
    <ReviewFlag id="ch6-s3" chapter="ch6" label="3. 변화율이 곱해진다" />
    <p class="leading-relaxed text-slate-700">
      중간변수 <MathBlock inline expr="u" /> 를 쓰면 연쇄법칙이 아주 자연스러워요:
    </p>
    <MathBlock expr="\dfrac{dy}{dx} = \dfrac{dy}{du}\cdot\dfrac{du}{dx}" />

    <ConceptCard tone="tip" title="톱니바퀴 직관">
      <MathBlock inline expr="u" /> 가 <MathBlock inline expr="x" /> 보다 <b>3배</b> 빨리 변하고,
      <MathBlock inline expr="y" /> 가 <MathBlock inline expr="u" /> 보다 <b>2배</b> 빨리 변하면,
      <MathBlock inline expr="y" /> 는 <MathBlock inline expr="x" /> 보다 <b>3×2 = 6배</b> 빨리 변합니다.
      변화율(속도)이 <b>사슬을 따라 곱해지는 것</b> — 그게 연쇄법칙의 전부예요.
      (분수처럼 <MathBlock inline expr="du" /> 가 "약분"되는 것처럼 외우면 편해요)
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="dy/du = 2 이고 du/dx = 3 이면, 연쇄법칙에 의해 dy/dx 는?"
      type="numeric"
      :answer="6"
      :hints="['dy/dx = dy/du × du/dx.', '2 × 3.']"
      explanation="dy/dx = 2 × 3 = 6. 변화율이 곱해집니다."
    />

    <!-- 4. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 연쇄법칙 = 역전파(backpropagation)</h2>
    <ReviewFlag id="ch6-ai" chapter="ch6" label="🤖 연쇄법칙 = 역전파" />
    <p class="leading-relaxed text-slate-700">
      신경망은 <b>수많은 함수가 층층이 합성된</b> 거대한 합성함수입니다.
      입력 → 층1 → 층2 → … → 출력 → 손실. 이 긴 사슬에서 "손실이 각 가중치에 얼마나 민감한가"를
      구하려면, <b>각 층의 국소 미분을 곱해서</b> 출력 쪽에서 입력 쪽으로 거슬러 전파하면 됩니다.
      이게 바로 <b>역전파</b>이고, 그 수학적 정체가 <b>연쇄법칙</b>이에요.
    </p>

    <ConceptCard tone="goal" title="역전파는 연쇄법칙의 반복 적용">
      <ul class="list-disc space-y-2 pl-5">
        <li>출력의 기울기에서 시작해 <b>층마다 국소 미분을 곱하며</b> 입력 쪽으로 전파.</li>
        <li>각 곱셈이 곧 <MathBlock inline expr="\frac{dy}{du}\cdot\frac{du}{dx}" /> — 사슬을 거슬러 올라가는 연쇄법칙.</li>
        <li>그래서 이번 챕터를 이해하면 "AI가 어떻게 배우는가"의 핵심을 이미 아는 셈입니다. (Phase 10 에서 계산그래프로 다시!)</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="역전파는 각 층의 국소 미분(기울기)을 '곱하면서' 출력에서 입력 쪽으로 전파하는, 연쇄법칙의 반복 적용이다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 역전파의 수학적 뼈대가 바로 연쇄법칙이에요."
    />

    <!-- 5. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="연쇄법칙 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="합성함수는 '함수 안에 또 함수가 들어 있는' 형태다. 예: f(g(x))."
        type="truefalse"
        :answer="0"
        explanation="참입니다. g 의 결과를 다시 f 에 넣은 것이 합성함수."
      />
      <Quiz
        difficulty="easy"
        question="연쇄법칙의 올바른 형태는?"
        :choices="[
          `f'(g(x)) · g'(x)`,
          `f'(x) · g'(x)`,
          `f'(g(x)) + g'(x)`,
          `f(g'(x))`,
        ]"
        :answer="0"
        :hints="['겉미분(속 그대로) × 속미분.']"
        explanation="(f(g(x)))' = f'(g(x))·g'(x)."
      />
      <Quiz
        difficulty="easy"
        question="dy/du = 5, du/dx = 2 일 때 dy/dx 는? (연쇄법칙)"
        type="numeric"
        :answer="10"
        :hints="['변화율은 곱해진다: 5 × 2.']"
        explanation="dy/dx = dy/du × du/dx = 5 × 2 = 10."
      />
      <Quiz
        difficulty="easy"
        question="연쇄법칙은 '겉미분 더하기 속미분'이다."
        type="truefalse"
        :answer="1"
        :hints="['더하기가 아니라 곱하기.']"
        explanation="거짓입니다. 겉미분 × 속미분(곱)입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="연쇄법칙으로 y=(2x+1)² 을 x=0 에서 미분하세요. (속 g=2x+1, 겉 f=u²)"
        :steps="[
          { lhs: `\\text{속미분 } g'(0)`, answer: 2 },
          { lhs: `u = g(0) = 2(0)+1`, answer: 1 },
          { lhs: `\\text{겉미분 } f'(u)=2u=2\\times 1`, answer: 2 },
          { lhs: `\\text{곱 } 2\\times 2`, answer: 4 },
        ]"
        :hints="['g′=2 (상수). u=g(0)=1.', 'f′(u)=2u, 마지막에 곱.']"
        explanation="f'(1)·g'(0) = 2·2 = 4. (도함수 4(2x+1), x=0 → 4)"
      />
      <Quiz
        difficulty="medium"
        question="y=(2x+1)² 의 도함수는 4(2x+1) 이다. x=2 에서의 값은?"
        type="numeric"
        :answer="20"
        :hints="['4(2·2+1) = 4·5.']"
        explanation="4(2·2+1) = 4·5 = 20."
      />
      <Quiz
        difficulty="medium"
        question="y=(x²+1)³ 의 도함수로 올바른 것은? (겉 u³, 속 x²+1)"
        :choices="[
          `3(x²+1)² · 2x`,
          `3(x²+1)²`,
          `(x²+1)² · 2x`,
          `3x²`,
        ]"
        :answer="0"
        :hints="['겉미분 3u² (속 그대로) × 속미분 2x.']"
        explanation="3(x²+1)²·2x = 6x(x²+1)². 겉미분 × 속미분."
      />
      <Quiz
        difficulty="medium"
        question="합성함수를 미분할 때 속함수의 미분(속미분)을 곱하는 것을 빠뜨리면 틀린 답이 된다."
        type="truefalse"
        :answer="0"
        :hints="['(2x+1)² 에서 ×2 를 빠뜨리면?']"
        explanation="참입니다. 속미분을 곱해야 완성돼요. 이게 연쇄법칙의 핵심 포인트."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="연쇄법칙으로 y=(x²+1)³ 을 x=1 에서 미분하세요. (속 g=x²+1, 겉 f=u³)"
        :steps="[
          { lhs: `\\text{속미분 } g'(1)=2x=2\\times 1`, answer: 2 },
          { lhs: `u = g(1) = 1^2+1`, answer: 2 },
          { lhs: `\\text{겉미분 } f'(u)=3u^2=3\\times 4`, answer: 12 },
          { lhs: `\\text{곱 } 12\\times 2`, answer: 24 },
        ]"
        :hints="['g′=2x → x=1 이면 2. u=g(1)=2.', 'f′(u)=3u², u=2 → 12. 마지막에 곱.']"
        explanation="f'(2)·g'(1) = 12·2 = 24. (도함수 6x(x²+1)², x=1 → 24)"
      />
      <Quiz
        difficulty="hard"
        question="어떤 사슬에서 du/dx = 0.5, dy/du = 4 이다. dy/dx 는?"
        type="numeric"
        :answer="2"
        :hints="['0.5 × 4.']"
        explanation="dy/dx = 4 × 0.5 = 2. (속도가 곱해짐)"
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch06_chain_rule.ipynb</code> 에서 SymPy 로 합성함수를 미분해 연쇄법칙 결과와 맞춰보고,
      국소 미분의 곱이 전체 미분과 같음을 수치로 확인합니다. (역전파의 축소판!)
    </ConceptCard>

    <div
      v-if="progress.isDone('ch6')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 6 완료 — 역전파의 심장을 잡았습니다! 🔗</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 AI 활성화 함수의 미분 — <b>지수·로그·시그모이드</b>입니다.
      </p>
      <RouterLink
        to="/ch/ch7"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 지수·로그·시그모이드 미분 →
      </RouterLink>
    </div>
  </article>
</template>
