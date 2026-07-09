<script setup lang="ts">
// Phase 8 · 다변수 함수와 편미분
import ConceptCard from '@/components/ConceptCard.vue'
import MathBlock from '@/components/MathBlock.vue'
import PartialDerivative from '@/components/PartialDerivative.vue'
import Quiz from '@/components/Quiz.vue'
import StepQuiz from '@/components/StepQuiz.vue'
import QuizSet from '@/components/QuizSet.vue'
import ReviewFlag from '@/components/ReviewFlag.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// f(x,y) = x² + y²  → ∂f/∂x = 2x, ∂f/∂y = 2y
const f = (x: number, y: number) => x * x + y * y
const dfx = (x: number, _y: number) => 2 * x
const dfy = (_x: number, y: number) => 2 * y

function onSetComplete() {
  progress.markDone('ch8')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 8</p>
    <h1 class="mb-4 text-3xl font-bold">다변수 함수와 편미분 🧭</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      지금까지는 입력이 하나(<MathBlock inline expr="x" />)인 함수였죠. 그런데 AI 모델은 입력(가중치)이
      <b>수백만 개</b>입니다. 이렇게 변수가 여러 개인 함수를 미분하려면 <b>편미분</b>이 필요해요.
      핵심은 아주 간단합니다: <b>한 변수만 보고 나머지는 상수로 취급</b>.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>다변수 함수</b> <MathBlock inline expr="f(x,y)" /> 와 그 그래프(곡면)를 이해한다</li>
        <li><b>편미분</b> <MathBlock inline expr="\dfrac{\partial f}{\partial x}" /> = "한 변수만 미분, 나머지는 상수"</li>
        <li>편미분이 <b>단면 곡선의 기울기</b>임을 그림으로 이해한다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 다변수 함수 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 입력이 여러 개인 함수</h2>
    <ReviewFlag id="ch8-s1" chapter="ch8" label="1. 입력이 여러 개인 함수" />
    <p class="leading-relaxed text-slate-700">
      <MathBlock inline expr="f(x,y) = x^2 + y^2" /> 처럼 입력이 둘이면, 출력은 두 값에 함께 달려 있어요.
      입력이 하나면 그래프가 <b>곡선</b>이지만, 입력이 둘이면 그래프는 <b>곡면(surface)</b> — 언덕이나
      골짜기 같은 3D 지형이 됩니다.
    </p>

    <ConceptCard tone="note" title="새 용어 — 다변수 함수 / 곡면">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>다변수 함수</b>: 입력이 2개 이상인 함수. <MathBlock inline expr="f(x,y)" />, <MathBlock inline expr="f(x,y,z)" /> …</li>
        <li>입력 2개의 그래프 = <b>곡면</b>. <MathBlock inline expr="x^2+y^2" /> 은 밥그릇처럼 생긴 골짜기예요.</li>
        <li>AI 연결: 손실 <MathBlock inline expr="L(w_1, w_2, \dots)" /> 은 수많은 가중치의 다변수 함수입니다.</li>
      </ul>
    </ConceptCard>

    <!-- 2. 편미분 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 편미분 — 한 변수만, 나머지는 상수</h2>
    <ReviewFlag id="ch8-s2" chapter="ch8" label="2. 편미분 — 한 변수만" />
    <p class="leading-relaxed text-slate-700">
      <b>편미분</b>은 "관심 있는 한 변수만 미분하고, 나머지는 그냥 <b>숫자(상수)</b>로 본다"는 뜻입니다.
      <MathBlock inline expr="f(x,y)=x^2+y^2" /> 를 예로:
    </p>
    <MathBlock expr="\dfrac{\partial f}{\partial x} = 2x \quad(y\text{ 는 상수}\to y^2\text{ 의 미분 }0)" />
    <MathBlock expr="\dfrac{\partial f}{\partial y} = 2y \quad(x\text{ 는 상수}\to x^2\text{ 의 미분 }0)" />

    <ConceptCard tone="note" title="새 기호 — ∂ (편미분 기호)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><MathBlock inline expr="\partial" /> 는 "라운드 디" 또는 "파셜"이라고 읽어요. 보통 <MathBlock inline expr="d" /> 대신 씁니다(변수가 여럿일 때).</li>
        <li><MathBlock inline expr="\dfrac{\partial f}{\partial x}" /> = "x 에 대한 f 의 편미분" = <b>x 만 변할 때</b> f 의 변화율.</li>
        <li>계산법은 이미 아는 미분 그대로 — 단지 <b>다른 변수는 숫자처럼</b> 취급합니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="f(x,y) = x² + y² 에서 ∂f/∂x 는? (y 는 상수 취급)"
      :choices="['2x', '2y', '2x + 2y', 'x² ']"
      :answer="0"
      :hints="['y² 은 상수라 미분하면 0. x² → 2x.']"
      explanation="∂f/∂x = 2x. y² 은 상수 취급이라 사라집니다."
    />

    <!-- 3. 단면의 기울기 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 편미분 = 단면 곡선의 기울기</h2>
    <ReviewFlag id="ch8-s3" chapter="ch8" label="3. 편미분 = 단면 곡선의 기울기" />
    <p class="leading-relaxed text-slate-700">
      편미분을 그림으로 보면 이렇습니다. 곡면을 <b>한 방향으로 칼로 자르면</b> 단면에 곡선이 생기는데,
      그 <b>단면 곡선의 기울기</b>가 바로 편미분이에요. 아래에서 점 <MathBlock inline expr="(x,y)" /> 를
      움직이며 두 방향의 단면과 기울기를 확인하세요.
    </p>

    <PartialDerivative :f="f" :dfx="dfx" :dfy="dfy" :initial-x="1" :initial-y="1" />

    <ConceptCard tone="tip" title="한 번에 한 방향">
      <MathBlock inline expr="\partial f/\partial x" /> 를 구할 땐 <MathBlock inline expr="y" /> 를 <b>고정</b>(가로 절단선),
      <MathBlock inline expr="\partial f/\partial y" /> 를 구할 땐 <MathBlock inline expr="x" /> 를 고정(세로 절단선).
      다변수라도 <b>결국 한 방향씩</b> 보므로, 우리가 배운 1변수 미분이 그대로 쓰입니다.
    </ConceptCard>

    <StepQuiz
      difficulty="medium"
      question="f(x,y)=x²+y² 의 두 편미분을 점 (3, 2) 에서 구하세요. (∂f/∂x=2x, ∂f/∂y=2y)"
      :steps="[
        { lhs: `\\partial f/\\partial x = 2x = 2\\times 3`, answer: 6 },
        { lhs: `\\partial f/\\partial y = 2y = 2\\times 2`, answer: 4 },
      ]"
      :hints="['x 편미분: y 는 상수 → 2x. y 편미분: x 는 상수 → 2y.', '점 (3,2) 대입.']"
      explanation="∂f/∂x = 6, ∂f/∂y = 4. 각 방향 단면 곡선의 기울기예요."
    />

    <!-- 4. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 편미분 = 가중치 하나가 손실에 주는 영향</h2>
    <ReviewFlag id="ch8-ai" chapter="ch8" label="🤖 편미분 = 가중치별 영향" />
    <p class="leading-relaxed text-slate-700">
      신경망 학습은 "손실 <MathBlock inline expr="L" /> 을 줄이려면 각 가중치 <MathBlock inline expr="w_i" /> 를
      어느 쪽으로 바꿔야 하나?"를 묻습니다. 그 답이 바로 <b>편미분</b> <MathBlock inline expr="\partial L/\partial w_i" /> —
      "<MathBlock inline expr="w_i" /> 하나만 조금 바꿀 때 손실이 얼마나 변하나"예요.
    </p>

    <ConceptCard tone="goal" title="가중치마다 편미분 하나">
      <ul class="list-disc space-y-2 pl-5">
        <li><MathBlock inline expr="\partial L/\partial w_i" /> = 그 가중치의 <b>책임 정도</b>(손실에 대한 민감도).</li>
        <li>다른 가중치는 <b>상수로 두고</b> 하나씩 미분 → 각자의 "고칠 방향"을 얻습니다.</li>
        <li>이 편미분들을 <b>전부 모은 벡터</b>가 다음 챕터의 <b>그래디언트(∇L)</b> 이고, 그걸로 경사하강을 합니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="편미분 ∂L/∂w 는 'w 하나만 조금 바꿀 때 손실 L 이 얼마나 변하는가'를 나타낸다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 각 가중치가 손실에 주는 영향(민감도)이 곧 그 가중치에 대한 편미분이에요."
    />

    <!-- 5. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="다변수 함수와 편미분 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="편미분은 '한 변수만 미분하고 나머지는 상수로 취급'하는 것이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 그게 편미분의 정의예요."
      />
      <Quiz
        difficulty="easy"
        question="f(x,y)=x²+y² 에서 ∂f/∂x 는?"
        :choices="['2x', '2y', 'x²', '2x+2y']"
        :answer="0"
        :hints="['y² 은 상수 → 0. x² → 2x.']"
        explanation="∂f/∂x = 2x."
      />
      <Quiz
        difficulty="easy"
        question="기호 ∂ 는 변수가 여러 개일 때 미분에 쓰는 '편미분 기호'다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. '라운드 디' 또는 '파셜'이라 읽어요."
      />
      <Quiz
        difficulty="easy"
        question="f(x,y)=x²+y² 에서 ∂f/∂y 를 점 (0, 3) 에서 구하면? (=2y)"
        type="numeric"
        :answer="6"
        :hints="['∂f/∂y = 2y, y=3.']"
        explanation="2×3 = 6."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="f(x,y)=x²+y² 의 두 편미분을 점 (5, 1) 에서 구하세요."
        :steps="[
          { lhs: `\\partial f/\\partial x = 2x = 2\\times 5`, answer: 10 },
          { lhs: `\\partial f/\\partial y = 2y = 2\\times 1`, answer: 2 },
        ]"
        :hints="['x 편미분 2x, y 편미분 2y. 점 (5,1).']"
        explanation="∂f/∂x=10, ∂f/∂y=2."
      />
      <Quiz
        difficulty="medium"
        question="f(x,y)=3x + y² 에서 ∂f/∂x 는? (y² 은 상수 취급)"
        type="numeric"
        :answer="3"
        :hints="['3x → 3, y² 은 상수 → 0.']"
        explanation="∂f/∂x = 3. (x 에 대해 y² 은 상수)"
      />
      <Quiz
        difficulty="medium"
        question="f(x,y)=xy 에서 ∂f/∂x 는? (y 를 상수 c 로 보면 (cx)'=c)"
        :choices="['y', 'x', '1', 'xy']"
        :answer="0"
        :hints="['y 를 상수로 보면 f=y·x, x 로 미분하면 y.']"
        explanation="∂f/∂x = y. (y 를 상수 취급하면 (y·x)′ = y)"
      />
      <Quiz
        difficulty="medium"
        question="편미분을 구할 때, 관심 없는 다른 변수들은 '변수'로 함께 미분해야 한다."
        type="truefalse"
        :answer="1"
        :hints="['다른 변수는 상수 취급.']"
        explanation="거짓입니다. 다른 변수는 상수로 취급합니다(함께 미분하지 않음)."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="f(x,y)=x²y 에서 ∂f/∂x 를 점 (2, 3) 에서 구하면? (y 상수 → 2xy)"
        type="numeric"
        :answer="12"
        :hints="['y 를 상수로: (x²y)′ = 2x·y.', '2·2·3.']"
        explanation="∂f/∂x = 2xy = 2·2·3 = 12."
      />
      <Quiz
        difficulty="hard"
        question="f(x,y)=x²y 에서 ∂f/∂y 를 점 (2, 3) 에서 구하면? (x 상수 → x²)"
        type="numeric"
        :answer="4"
        :hints="['x 를 상수로: (x²·y)′ = x².', 'x=2 → 2² = 4.']"
        explanation="∂f/∂y = x² = 2² = 4. (y 계수가 x² 이므로)"
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch08_partial_derivatives.ipynb</code> 에서 SymPy 로 편미분(<code>sp.diff(f, x)</code>)을 구하고,
      x²+y² 곡면을 3D 로 그려 두 방향 단면의 기울기를 확인합니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch8')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 8 완료. 여러 변수도 한 방향씩 미분!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 편미분들을 모은 <b>그래디언트</b>로 골짜기를 내려가는 <b>경사하강법</b>입니다.
      </p>
      <RouterLink
        to="/ch/ch9"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 그래디언트와 경사하강법 →
      </RouterLink>
    </div>
  </article>
</template>
