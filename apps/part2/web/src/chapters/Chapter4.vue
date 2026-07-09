<script setup lang="ts">
// Phase 4 · 기본 미분 공식 (멱법칙·상수·상수배·합차)
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import PowerRule from '@/components/PowerRule.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch4')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 4</p>
    <h1 class="mb-4 text-3xl font-bold">기본 미분 공식 ⚡</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      지금까지는 미분할 때마다 극한을 직접 계산했죠. 매번 그러면 너무 느려요.
      이번 챕터에서 <b>패턴을 공식으로</b> 만들어, <MathBlock inline expr="x^2 \to 2x" /> 같은 미분을
      <b>암산</b> 수준으로 빠르게 해냅니다. 미분의 "구구단"이라고 생각하세요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>멱법칙</b> <MathBlock inline expr="(x^n)' = n\,x^{n-1}" /> 로 거듭제곱을 즉시 미분한다</li>
        <li><b>상수의 미분은 0</b>, <b>상수배</b>는 그대로 앞으로 뺀다</li>
        <li><b>합·차</b>는 항마다 따로 미분해 더한다 → 다항식을 통째로 미분한다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 멱법칙 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 멱법칙 — 미분의 핵심 공식</h2>
    <ReviewFlag id="ch4-s1" chapter="ch4" label="1. 멱법칙" />
    <p class="leading-relaxed text-slate-700">
      가장 많이 쓰는 공식입니다. <MathBlock inline expr="x" /> 의 거듭제곱은 이렇게 미분해요:
    </p>
    <MathBlock expr="(x^n)' = n\,x^{n-1}" />
    <p class="leading-relaxed text-slate-700">
      먼저 표기부터: 식 뒤에 붙는 작은 <b>프라임 기호</b> <MathBlock inline expr="(\ \cdot\ )'" /> 는 "<b>이 식을 미분하라</b>"는 뜻이에요
      (예: <MathBlock inline expr="(x^2)'" /> = <MathBlock inline expr="x^2" /> 을 미분한 결과). 그리고
      <MathBlock inline expr="x^n" /> 은 <MathBlock inline expr="x" /> 를 <MathBlock inline expr="n" /> 번 곱한 것(거듭제곱),
      <MathBlock inline expr="x^{n-1}" /> 은 그 지수를 1 줄인 거예요.
      아래에서 지수 <MathBlock inline expr="n" /> 을 바꿔보며 결과가 어떻게 나오는지 확인하세요.
    </p>

    <PowerRule :max-n="5" />

    <ConceptCard tone="note" title="새 용어 — 멱법칙(power rule)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>멱(冪)</b> = 거듭제곱. 멱법칙 = "거듭제곱을 미분하는 규칙".</li>
        <li>방법: <b>지수를 앞으로 내려 계수(항 앞에 곱해진 수)로</b> 쓰고, <b>지수는 1 줄인다</b>.</li>
        <li>
          예: <MathBlock inline expr="(x^2)'=2x" />, <MathBlock inline expr="(x^3)'=3x^2" />,
          <MathBlock inline expr="(x^5)'=5x^4" />.
        </li>
        <li>
          특수한 경우: <MathBlock inline expr="(x)'=(x^1)'=1" /> (기울기 1 인 직선),
          <MathBlock inline expr="x^0 = 1" /> 은 상수라 미분하면 0.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="x³ 을 미분하면 3x² 이다. 이때 x² 앞에 붙는 계수는?"
      type="numeric"
      :answer="3"
      :hints="['멱법칙: 지수 3 이 앞으로 내려옵니다.']"
      explanation="(x³)' = 3x². 지수 3 이 내려와 계수가 되고, 지수는 2 로 줄었어요."
    />

    <!-- 2. 상수 규칙 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 상수의 미분은 0</h2>
    <ReviewFlag id="ch4-s2" chapter="ch4" label="2. 상수의 미분은 0" />
    <p class="leading-relaxed text-slate-700">
      <MathBlock inline expr="5" /> 나 <MathBlock inline expr="-2" /> 처럼 <MathBlock inline expr="x" /> 가 없는
      <b>상수</b>는 미분하면 항상 <b>0</b> 입니다.
    </p>
    <MathBlock expr="(c)' = 0 \qquad (c\text{ 는 상수})" />

    <ConceptCard tone="note" title="왜 0 일까? — 수평선은 기울기가 0">
      상수함수 <MathBlock inline expr="y=5" /> 의 그래프는 <b>납작한 수평선</b>입니다.
      수평선은 어디서나 <b>기울기가 0</b> 이죠. 그래서 상수의 미분은 0 이에요.
      (<MathBlock inline expr="x" /> 가 변해도 값이 안 변하니 "변화율 0")
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="상수 7 의 미분 (7)' 의 값은?"
      :choices="['7', '1', '0', '알 수 없다']"
      :answer="2"
      :hints="['수평선의 기울기를 떠올리세요.']"
      explanation="상수의 미분은 항상 0 입니다. (7)' = 0."
    />

    <!-- 3. 상수배 규칙 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 상수배 — 계수는 그대로 앞으로</h2>
    <ReviewFlag id="ch4-s3" chapter="ch4" label="3. 상수배 규칙" />
    <p class="leading-relaxed text-slate-700">
      함수 앞에 곱해진 <b>상수(계수)</b>는 미분할 때 <b>그대로 앞에 남습니다</b>.
    </p>
    <MathBlock expr="(c\cdot f(x))' = c\cdot f'(x)" />

    <ConceptCard tone="note" title="새 용어 — 계수 / 상수배 규칙">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>계수(coefficient)</b>: 항 앞에 곱해진 수. <MathBlock inline expr="3x^2" /> 에서 3.</li>
        <li>
          계수는 미분에 관여하지 않고 그대로 따라옵니다:
          <MathBlock inline expr="(3x^2)' = 3\cdot(x^2)' = 3\cdot 2x = 6x" />.
        </li>
        <li>예: <MathBlock inline expr="(5x^4)' = 5\cdot 4x^3 = 20x^3" />.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="(3x²)' 을 x=1 에서 계산하면? (먼저 미분하면 6x)"
      type="numeric"
      :answer="6"
      :hints="['(3x²)′ = 3·2x = 6x.', 'x=1 을 대입.']"
      explanation="(3x²)' = 6x, x=1 이면 6."
    />

    <!-- 4. 합·차 규칙 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 합·차 — 항마다 따로 미분</h2>
    <ReviewFlag id="ch4-s4" chapter="ch4" label="4. 합·차 규칙" />
    <p class="leading-relaxed text-slate-700">
      여러 항이 더해지거나 빼진 식은 <b>각 항을 따로따로 미분해서 다시 더하면</b> 됩니다.
      이 규칙 덕분에 다항식을 통째로 미분할 수 있어요.
    </p>
    <MathBlock expr="(f \pm g)' = f' \pm g'" />

    <p class="leading-relaxed text-slate-700">
      멱법칙·상수·상수배·합차를 모두 합치면, 예를 들어:
    </p>
    <MathBlock expr="(x^3 + 2x^2 + 5x + 7)' = 3x^2 + 4x + 5" />

    <ConceptCard tone="tip" title="다항식 미분 순서">
      항을 하나씩 보며: <b>거듭제곱은 멱법칙, 계수는 그대로, 상수는 0.</b>
      <MathBlock inline expr="x^3\to 3x^2" />, <MathBlock inline expr="2x^2\to 4x" />,
      <MathBlock inline expr="5x\to 5" />, <MathBlock inline expr="7\to 0" />.
      마지막에 다 더하면 끝!
    </ConceptCard>

    <StepQuiz
      difficulty="medium"
      question="f(x) = x² + 3x + 5 를 미분한 뒤, x=1 에서의 값 f'(1) 을 단계별로 구하세요."
      :steps="[
        { lhs: `(x^2)' \\text{ 의 계수}`, answer: 2 },
        { lhs: `(3x)' `, answer: 3 },
        { lhs: `(5)' `, answer: 0 },
        { lhs: `f'(1) = 2\\times 1 + 3`, answer: 5 },
      ]"
      :hints="['x² → 2x, 3x → 3, 5 → 0.', 'f’(x)=2x+3. 여기에 x=1 대입.']"
      explanation="f'(x) = 2x + 3, f'(1) = 2·1 + 3 = 5."
    />

    <!-- 5. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 '합의 미분 = 미분의 합'이 역전파의 뼈대</h2>
    <ReviewFlag id="ch4-ai" chapter="ch4" label="🤖 합의 미분 = 미분의 합" />
    <p class="leading-relaxed text-slate-700">
      신경망의 손실은 수많은 항의 <b>합</b>으로 이뤄집니다(예: 여러 데이터의 오차 합).
      "합을 미분하면 각 미분의 합"이라는 이 단순한 규칙 덕분에, 각 부분의 기울기를 따로 구해
      <b>더하기만</b> 하면 전체 기울기가 됩니다.
    </p>

    <ConceptCard tone="goal" title="합 규칙이 계산을 쪼갤 수 있게 해준다">
      <ul class="list-disc space-y-2 pl-5">
        <li><b>합의 미분 = 미분의 합</b> — 큰 문제를 작은 항들로 나눠 각각 미분.</li>
        <li>역전파에서 여러 갈래로 흘러온 기울기를 <b>더해서</b> 합치는 것이 바로 이 규칙.</li>
        <li>멱법칙 같은 기본 공식은 프레임워크가 각 연산마다 내장해 두고 자동으로 적용합니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="여러 항의 합으로 된 함수는, 각 항을 따로 미분한 뒤 더하면 전체 도함수가 된다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. (f ± g)' = f' ± g' — 합의 미분은 미분의 합."
    />

    <!-- 6. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="기본 미분 공식 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="멱법칙은 '지수가 앞으로 내려와 계수가 되고, 지수는 1 줄어든다'는 규칙이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. (xⁿ)' = n·xⁿ⁻¹."
      />
      <Quiz
        difficulty="easy"
        question="(x⁵)' = 5x⁴ 이다. x⁴ 앞의 계수는?"
        type="numeric"
        :answer="5"
        :hints="['지수 5 가 앞으로 내려옵니다.']"
        explanation="(x⁵)' = 5x⁴. 계수는 5."
      />
      <Quiz
        difficulty="easy"
        question="상수 −2 의 미분 (−2)' 의 값은?"
        :choices="['−2', '2', '0', '1']"
        :answer="2"
        :hints="['상수는 수평선, 기울기 0.']"
        explanation="상수의 미분은 0."
      />
      <Quiz
        difficulty="easy"
        question="(x)' 즉 x 의 미분값은? (x = x¹)"
        type="numeric"
        :answer="1"
        :hints="['멱법칙에서 n=1: 1·x⁰ = 1.']"
        explanation="(x)' = 1. 기울기 1 인 직선이니까요."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="f(x)=x³ 을 멱법칙으로 미분한 뒤 f'(2) 를 단계별로 구하세요."
        :steps="[
          { lhs: `\\text{앞으로 내려오는 계수}`, answer: 3 },
          { lhs: `\\text{새 지수 } 3 - 1`, answer: 2 },
          { lhs: `f'(2) = 3\\times 2^2`, answer: 12 },
        ]"
        :hints="['(x³)′ = 3x².', 'f’(2) = 3 × 2² = 3 × 4.']"
        explanation="(x³)' = 3x², f'(2) = 3×4 = 12."
      />
      <Quiz
        difficulty="medium"
        question="(x² + 3x)' 을 바르게 미분한 것은?"
        :choices="['2x + 3', 'x + 3', '2x', '2x + 3x']"
        :answer="0"
        :hints="['항마다 따로: (x²)′=2x, (3x)′=3.']"
        explanation="(x²+3x)' = 2x + 3."
      />
      <Quiz
        difficulty="medium"
        question="f(x)=x² + 5 일 때 f'(3) 의 값은?"
        type="numeric"
        :answer="6"
        :hints="['상수 5 는 미분하면 0.', 'f’(x)=2x, x=3.']"
        explanation="f'(x) = 2x (상수 5 는 0), f'(3) = 6."
      />
      <Quiz
        difficulty="medium"
        question="(5x⁴)' 을 바르게 미분한 것은?"
        :choices="['20x³', '5x³', '4x³', '20x⁴']"
        :answer="0"
        :hints="['상수배: 5 는 그대로. (x⁴)′ = 4x³.']"
        explanation="(5x⁴)' = 5·4x³ = 20x³."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="f(x)=x³ + 2x² + 5x + 7 일 때 f'(1) 의 값은?"
        type="numeric"
        :answer="12"
        :hints="['f’(x) = 3x² + 4x + 5.', 'x=1: 3 + 4 + 5.']"
        explanation="f'(x) = 3x² + 4x + 5, f'(1) = 3 + 4 + 5 = 12."
      />
      <Quiz
        difficulty="hard"
        question="(x⁴ − 2x)' 을 바르게 미분한 것은?"
        :choices="['4x³ − 2', '4x³ − 2x', '4x³', 'x³ − 2']"
        :answer="0"
        :hints="['(x⁴)′ = 4x³, (2x)′ = 2. 차는 따로 미분.']"
        explanation="(x⁴ − 2x)' = 4x³ − 2."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch04_power_rule.ipynb</code> 에서 SymPy 로 여러 거듭제곱·다항식을 미분해보고,
      손으로 멱법칙을 적용한 결과와 같은지 검산합니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch4')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 4 완료. 이제 다항식은 암산으로 미분!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 곱해지거나 나눠진 함수를 미분하는 <b>곱·몫의 법칙</b>입니다.
      </p>
      <RouterLink
        to="/ch/ch5"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 곱과 몫의 법칙 →
      </RouterLink>
    </div>
  </article>
</template>
