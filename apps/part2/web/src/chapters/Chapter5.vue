<script setup lang="ts">
// Phase 5 · 곱과 몫의 법칙
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import ProductRuleArea from '@/components/ProductRuleArea.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// ProductRuleArea 용: u(x)=x, v(x)=x+1
const uf = (x: number) => x
const vf = (x: number) => x + 1
const duf = (_x: number) => 1
const dvf = (_x: number) => 1

function onSetComplete() {
  progress.markDone('ch5')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 5</p>
    <h1 class="mb-4 text-3xl font-bold">곱과 몫의 법칙 ✖️➗</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      멱법칙·합차로 다항식은 척척 미분했죠. 그런데 <b>두 함수가 곱해지거나 나눠진</b> 식은
      "각각 미분해서 곱하면" 되지 않습니다. 왜 안 되는지 보고, 올바른 규칙 두 가지를 배웁니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>(fg)' ≠ f'g'</b> 임을 이해하고 <b>곱의 법칙</b> <MathBlock inline expr="(fg)'=f'g+fg'" /> 을 쓴다</li>
        <li>곱의 법칙을 <b>직사각형 넓이</b>로 직관적으로 이해한다</li>
        <li><b>몫의 법칙</b> <MathBlock inline expr="\left(\dfrac{f}{g}\right)'=\dfrac{f'g-fg'}{g^2}" /> 을 쓴다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 곱의 함정 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. "각각 미분해서 곱하기"는 틀렸다</h2>
    <ReviewFlag id="ch5-s1" chapter="ch5" label="1. 곱의 함정" />
    <p class="leading-relaxed text-slate-700">
      자연스러운 오해부터 짚어봅시다. <MathBlock inline expr="x \cdot x" /> 를 생각하면,
      "각각 미분해 곱하면" <MathBlock inline expr="1 \cdot 1 = 1" /> 이 되어야 할 텐데 —
      실제로 <MathBlock inline expr="x\cdot x = x^2" /> 이고 그 미분은 <MathBlock inline expr="2x" /> 입니다.
    </p>

    <ConceptCard tone="warn" title="곱의 미분은 미분끼리 곱이 아니다">
      <MathBlock inline expr="(f\cdot g)' \ne f'\cdot g'" /> &nbsp; 입니다.
      <MathBlock inline expr="(x\cdot x)' = 2x" /> 인데 <MathBlock inline expr="1\cdot 1 = 1" /> 이라 서로 다르죠.
      곱에는 별도의 규칙이 필요합니다.
    </ConceptCard>

    <!-- 2. 곱의 법칙 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 곱의 법칙</h2>
    <ReviewFlag id="ch5-s2" chapter="ch5" label="2. 곱의 법칙" />
    <MathBlock expr="(f\cdot g)' = f'\,g + f\,g'" />
    <p class="leading-relaxed text-slate-700">
      "<b>앞을 미분한 것 × 뒤 그대로</b> 더하기 <b>앞 그대로 × 뒤를 미분한 것</b>" 입니다.
      아래 넓이 그림으로 왜 두 항이 더해지는지 눈으로 보세요.
    </p>

    <ProductRuleArea :uf="uf" :vf="vf" :duf="duf" :dvf="dvf" label-u="u=x" label-v="v=x+1" />

    <ConceptCard tone="note" title="넓이로 보는 곱의 법칙">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><MathBlock inline expr="u,\ v" /> 는 곱해지는 두 함수를 부르는 다른 이름이에요 (= 위의 <MathBlock inline expr="f,\ g" />).</li>
        <li>두 변이 <MathBlock inline expr="u,\ v" /> 인 직사각형의 넓이 = <MathBlock inline expr="u\cdot v" />.</li>
        <li>
          <MathBlock inline expr="x" /> 를 조금 늘리면 넓이가 <b>오른쪽 띠</b>(<MathBlock inline expr="\Delta u\cdot v" />)와
          <b>위 띠</b>(<MathBlock inline expr="u\cdot \Delta v" />)만큼 늘어납니다.
        </li>
        <li>
          모서리(<MathBlock inline expr="\Delta u\cdot\Delta v" />)는 <MathBlock inline expr="\Delta" /> 가 작아지면
          <b>무시할 만큼 작아져</b> 사라집니다 → 남는 게 <MathBlock inline expr="f'g + fg'" />.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-2 leading-relaxed text-slate-700">
      예: <MathBlock inline expr="\big(x\,(x+1)\big)' = (1)(x+1) + (x)(1) = 2x+1" />.
    </p>

    <StepQuiz
      difficulty="medium"
      question="곱의 법칙으로 (x·(x+1))' 을 x=2 에서 구하세요. (u=x, v=x+1, u'=1, v'=1)"
      :steps="[
        { lhs: `u'\\,v = 1\\times(2+1)`, answer: 3 },
        { lhs: `u\\,v' = 2\\times 1`, answer: 2 },
        { lhs: `(uv)' = u'v + uv'`, answer: 5 },
      ]"
      :hints="['u′v = 1·(x+1), uv′ = x·1 을 x=2 에서.', '두 항을 더합니다.']"
      explanation="(x(x+1))' = (x+1) + x = 2x+1, x=2 이면 5."
    />

    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="곱의 법칙 (fg)' 의 올바른 형태는?"
      :choices="[`f'g'`, `f'g + fg'`, `f'g - fg'`, `(f+g)'`]"
      :answer="1"
      :hints="['앞미분×뒤 + 앞×뒤미분.']"
      explanation="(fg)' = f'g + fg' 입니다."
    />

    <!-- 3. 몫의 법칙 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 몫의 법칙</h2>
    <ReviewFlag id="ch5-s3" chapter="ch5" label="3. 몫의 법칙" />
    <p class="leading-relaxed text-slate-700">
      나눗셈(분수) 꼴은 이렇게 미분합니다. 왜 이런 모양이냐면 —
      <MathBlock inline expr="\tfrac{f}{g} = f \times \tfrac{1}{g}" /> 로 바꿔 놓고 방금 배운
      <b>곱의 법칙</b>을 적용하면 이 공식이 저절로 나옵니다(1/g 의 미분이 −g′/g² 이라 부호와
      분모 제곱이 생겨요). 유도를 다 따라갈 필요는 없고, <b>순서와 부호, 분모의 제곱</b>에 주의하세요.
    </p>
    <MathBlock expr="\left(\dfrac{f}{g}\right)' = \dfrac{f'\,g - f\,g'}{g^2}" />

    <ConceptCard tone="note" title="새 규칙 — 몫의 법칙 (외우는 요령)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>분자</b>: (아래 그대로 × 위 미분) 이 아니라 <b>위미분×아래 − 위×아래미분</b> = <MathBlock inline expr="f'g - fg'" />. <b>빼는 순서 중요!</b></li>
        <li><b>분모</b>: 아래 함수의 <b>제곱</b> <MathBlock inline expr="g^2" />.</li>
        <li>
          예: <MathBlock inline expr="\left(\dfrac{x}{x+1}\right)' = \dfrac{(1)(x+1)-(x)(1)}{(x+1)^2} = \dfrac{1}{(x+1)^2}" />.
        </li>
      </ul>
    </ConceptCard>

    <StepQuiz
      difficulty="hard"
      question="몫의 법칙으로 (x / (x+1))' 을 x=1 에서 구하세요. (f=x, g=x+1)"
      :steps="[
        { lhs: `f'\\,g = 1\\times(1+1)`, answer: 2 },
        { lhs: `f\\,g' = 1\\times 1`, answer: 1 },
        { lhs: `\\text{분자} = f'g - fg'`, answer: 1 },
        { lhs: `\\text{분모} = (1+1)^2`, answer: 4 },
        { lhs: `\\text{값} = 1 \\div 4`, answer: 0.25, tolerance: 0.001 },
      ]"
      :hints="['분자 = f′g − fg′ (빼는 순서 주의).', '분모 = g² = (x+1)².']"
      explanation="((x+1) − x)/(x+1)² = 1/4 = 0.25 (x=1)."
    />

    <!-- 4. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 곱셈 노드에서 기울기가 갈라진다</h2>
    <ReviewFlag id="ch5-ai" chapter="ch5" label="🤖 곱셈 노드에서 기울기가 갈라진다" />
    <p class="leading-relaxed text-slate-700">
      신경망 계산에는 두 값을 <b>곱하는 연산</b>이 곳곳에 있습니다(가중치 × 입력 등).
      역전파에서 곱셈 노드를 지날 때 기울기가 어떻게 나뉘는지가 바로 <b>곱의 법칙</b>의 모습이에요.
    </p>

    <ConceptCard tone="ai" title="곱셈 노드 = 곱의 법칙">
      <ul class="list-disc space-y-2 pl-5">
        <li><MathBlock inline expr="p = u\cdot v" /> 에서 <MathBlock inline expr="u" /> 쪽 기울기는 <MathBlock inline expr="v" /> 배, <MathBlock inline expr="v" /> 쪽 기울기는 <MathBlock inline expr="u" /> 배로 갈라집니다. (= <MathBlock inline expr="f'g+fg'" /> 의 두 항)</li>
        <li>"상대편 값을 곱해서 뒤로 보낸다"는 역전파의 곱셈 규칙이 곧 곱의 법칙입니다.</li>
        <li>몫(나눗셈) 연산도 마찬가지로 몫의 법칙대로 기울기가 흘러갑니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="(fg)' 를 구할 때는 f'g 와 fg' 두 항을 모두 더해야 한다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 한 항만 쓰면 틀려요. (fg)' = f'g + fg'."
    />

    <!-- 5. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="곱과 몫의 법칙 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="(fg)' = f'g' 이다. (곱의 미분은 미분끼리 곱하면 된다)"
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 올바른 곱의 법칙은 (fg)' = f'g + fg'."
      />
      <Quiz
        difficulty="easy"
        question="곱의 법칙 (fg)' 의 올바른 형태는?"
        :choices="[`f'g + fg'`, `f'g'`, `f'g − fg'`, `f' + g'`]"
        :answer="0"
        explanation="(fg)' = f'g + fg'."
      />
      <Quiz
        difficulty="easy"
        question="곱의 법칙으로 (x·x)' 를 x=3 에서 구하면? (= (x²)' = 2x)"
        type="numeric"
        :answer="6"
        :hints="['(x·x)′ = 1·x + x·1 = 2x.', 'x=3.']"
        explanation="1·x + x·1 = 2x, x=3 이면 6."
      />
      <Quiz
        difficulty="easy"
        question="몫의 법칙에서 분모는 아래 함수 g 의 '제곱' g² 이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. (f/g)' = (f'g − fg') / g²."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="곱의 법칙으로 (x·(x+1))' 을 x=3 에서 구하세요. (u=x, v=x+1)"
        :steps="[
          { lhs: `u'v = 1\\times(3+1)`, answer: 4 },
          { lhs: `uv' = 3\\times 1`, answer: 3 },
          { lhs: `(uv)' = u'v + uv'`, answer: 7 },
        ]"
        :hints="['u′v = 1·(x+1), uv′ = x·1 을 x=3 에서.']"
        explanation="(x(x+1))' = 2x+1, x=3 이면 7."
      />
      <Quiz
        difficulty="medium"
        question="(x²·x³)' 을 바르게 미분한 것은? (곱의 법칙 또는 x²·x³=x⁵)"
        :choices="['5x⁴', '6x⁴', 'x⁴', '6x⁵']"
        :answer="0"
        :hints="['(x²)′x³ + x²(x³)′ = 2x·x³ + x²·3x².']"
        explanation="같은 문자의 거듭제곱을 곱하면 지수를 더해요 (x·x³=x⁴, x²·x³=x⁵). 그래서 2x·x³ + x²·3x² = 2x⁴+3x⁴ = 5x⁴. (x²·x³=x⁵ 이므로 (x⁵)′=5x⁴ 와 같음)"
      />
      <Quiz
        difficulty="medium"
        question="몫의 법칙으로 (x / (x+1))' 을 x=1 에서 구하면? (= 1/(x+1)²)"
        type="numeric"
        :answer="0.25"
        :tolerance="0.001"
        :hints="['분자 = (1)(x+1) − (x)(1) = 1.', '분모 = (x+1)² = 4.']"
        explanation="1 / (1+1)² = 1/4 = 0.25."
      />
      <Quiz
        difficulty="medium"
        question="(fg)' 를 구할 때 f 만 미분하고 g 는 미분하지 않아도 된다."
        type="truefalse"
        :answer="1"
        :hints="['f′g 와 fg′ 두 항이 모두 필요.']"
        explanation="거짓입니다. 두 항 f'g + fg' 를 모두 더해야 합니다."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="몫의 법칙으로 (x / (x+2))' 을 x=0 에서 구하세요. (f=x, g=x+2)"
        :steps="[
          { lhs: `f'g = 1\\times(0+2)`, answer: 2 },
          { lhs: `fg' = 0\\times 1`, answer: 0 },
          { lhs: `\\text{분자} = f'g - fg'`, answer: 2 },
          { lhs: `\\text{분모} = (0+2)^2`, answer: 4 },
          { lhs: `\\text{값} = 2 \\div 4`, answer: 0.5, tolerance: 0.001 },
        ]"
        :hints="['분자 = f′g − fg′, 분모 = g².']"
        explanation="(2 − 0)/(2)² = 2/4 = 0.5 (x=0)."
      />
      <Quiz
        difficulty="hard"
        question="곱의 법칙으로 (x²·(x+1))' 을 x=1 에서 구하면?"
        type="numeric"
        :answer="5"
        :hints="['u=x²(u′=2x), v=x+1(v′=1).', '2x(x+1) + x²·1 = 3x²+2x, x=1.']"
        explanation="2·1·(1+1) + 1²·1 = 4 + 1 = 5. (도함수 3x²+2x, x=1 → 5)"
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch05_product_quotient.ipynb</code> 에서 SymPy 로 곱·몫을 미분하고,
      곱의 법칙·몫의 법칙을 손으로 적용한 결과와 같은지 검산합니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch5')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">Phase 5 완료. 곱·몫도 미분할 수 있습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 미분의 <b>가장 중요한 도구</b>이자 역전파의 심장 — <b>연쇄법칙</b>입니다.
      </p>
      <RouterLink
        to="/ch/ch6"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 연쇄법칙 (핵심) →
      </RouterLink>
    </div>
  </article>
</template>
