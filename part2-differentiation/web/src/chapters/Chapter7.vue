<script setup lang="ts">
// Phase 7 · 지수·로그·시그모이드 미분 (활성화 함수)
import ConceptCard from '@/components/ConceptCard.vue'
import MathBlock from '@/components/MathBlock.vue'
import DerivativeExplorer from '@/components/DerivativeExplorer.vue'
import SigmoidExplorer from '@/components/SigmoidExplorer.vue'
import Quiz from '@/components/Quiz.vue'
import StepQuiz from '@/components/StepQuiz.vue'
import QuizSet from '@/components/QuizSet.vue'
import ReviewFlag from '@/components/ReviewFlag.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// e^x 는 자기 자신이 도함수 → f 와 f' 가 같은 곡선
const expf = (x: number) => Math.exp(x)

function onSetComplete() {
  progress.markDone('ch7')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 7</p>
    <h1 class="mb-4 text-3xl font-bold">지수·로그·시그모이드 미분 📶</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      이제 AI에 직접 쓰이는 함수들을 미분합니다. 미분해도 자기 자신인 신기한 <MathBlock inline expr="e^x" />,
      그 짝인 자연로그 <MathBlock inline expr="\ln x" />, 그리고 뉴런의 스위치 역할을 하는
      <b>시그모이드</b>까지. 시그모이드 미분은 딥러닝에서 매일 계산되는 식이에요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><MathBlock inline expr="(e^x)' = e^x" /> — 미분해도 자기 자신인 성질을 이해한다</li>
        <li><MathBlock inline expr="(\ln x)' = \dfrac{1}{x}" /> 를 안다</li>
        <li>시그모이드 <MathBlock inline expr="\sigma'(x) = \sigma(x)\,(1-\sigma(x))" /> 와 <b>기울기 소실</b>을 이해한다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 지수함수 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 지수함수 eˣ — 미분해도 자기 자신</h2>
    <ReviewFlag id="ch7-s1" chapter="ch7" label="1. 지수함수 eˣ" />
    <p class="leading-relaxed text-slate-700">
      <MathBlock inline expr="e" /> 는 <b>자연상수</b>(약 2.718)라는 특별한 숫자예요.
      지금까지(4장)의 <MathBlock inline expr="x^n" /> 은 <b>밑</b>이 변수였지만, <MathBlock inline expr="e^x" /> 는
      반대로 <b>지수 자리에 <MathBlock inline expr="x" /></b> 가 올라간 새 형태 — <MathBlock inline expr="e" /> 를 밑으로 하는
      <b>지수함수</b>입니다. 그런데 이 <MathBlock inline expr="e^x" /> 는 <b>미분해도 똑같이 <MathBlock inline expr="e^x" /></b> 가 됩니다.
    </p>
    <MathBlock expr="(e^x)' = e^x" />
    <p class="leading-relaxed text-slate-700">
      아래에서 확인하세요 — <MathBlock inline expr="e^x" /> 는 위 곡선의 <b>접선 기울기</b>가 아래
      도함수 그래프에서 <b>똑같은 곡선</b>으로 나타납니다. (즉 어느 점에서든 기울기 = 그 점의 높이!)
    </p>

    <DerivativeExplorer
      :fn="expf"
      :dfn="expf"
      :xmin="-2"
      :xmax="2"
      :ymin="-0.5"
      :ymax="8"
      :dymin="-0.5"
      :dymax="8"
      :initial="0"
      label-f="f(x) = eˣ"
      label-df="f'(x) = eˣ (자기 자신!)"
    />

    <ConceptCard tone="note" title="새 기호 — e 와 지수함수 eˣ">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>자연상수 <MathBlock inline expr="e" /></b> ≈ 2.718. 원주율 <MathBlock inline expr="\pi" /> 처럼 수학에 자연히 등장하는 상수.</li>
        <li><MathBlock inline expr="e^x" /> 는 <code>exp(x)</code> 로도 씁니다. 항상 <b>양수</b>이고 <b>계속 증가</b>해요.</li>
        <li>핵심 성질: <MathBlock inline expr="(e^x)' = e^x" /> — <b>기울기 = 함숫값</b>. 이 성질 때문에 계산이 아주 편해집니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="지수함수 eˣ 는 미분해도 자기 자신 eˣ 이다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. (eˣ)' = eˣ — 미분의 세계에서 아주 특별한 함수예요."
    />

    <!-- 2. 로그 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 자연로그 ln x</h2>
    <ReviewFlag id="ch7-s2" chapter="ch7" label="2. 자연로그 ln x" />
    <p class="leading-relaxed text-slate-700">
      <b>자연로그</b> <MathBlock inline expr="\ln x" /> 는 <MathBlock inline expr="e^x" /> 의 <b>역함수</b>
      (밑이 <MathBlock inline expr="e" /> 인 로그)입니다. 미분은 아주 깔끔해요:
    </p>
    <MathBlock expr="(\ln x)' = \dfrac{1}{x} \qquad (x > 0)" />
    <p class="leading-relaxed text-slate-700">
      기울기가 <MathBlock inline expr="1/x" /> 라는 건, <MathBlock inline expr="x" /> 가 <b>커질수록 기울기가 작아져</b>
      곡선이 점점 완만해진다는 뜻이에요 (<MathBlock inline expr="x=2" /> 에서 <MathBlock inline expr="1/2" />,
      <MathBlock inline expr="x=4" /> 에서 <MathBlock inline expr="1/4" /> …).
    </p>

    <ConceptCard tone="note" title="새 기호 — 자연로그 ln">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><MathBlock inline expr="\ln x" /> = "엘엔 엑스". <MathBlock inline expr="e^{(\ln x)} = x" /> 가 되는 값(지수를 거꾸로 찾기).</li>
        <li>미분: <MathBlock inline expr="(\ln x)' = 1/x" />. 예: <MathBlock inline expr="x=2" /> 에서 기울기 <MathBlock inline expr="1/2" />.</li>
        <li><MathBlock inline expr="x>0" /> 에서만 정의됩니다(0 이하의 로그는 없음).</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="(ln x)' 을 x=4 에서 계산하면? (= 1/x)"
      type="numeric"
      :answer="0.25"
      :tolerance="0.001"
      :hints="['(ln x)′ = 1/x.', '1/4.']"
      explanation="(ln x)' = 1/x, x=4 이면 1/4 = 0.25."
    />

    <!-- 3. 시그모이드 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 시그모이드 σ — 뉴런의 스위치</h2>
    <ReviewFlag id="ch7-s3" chapter="ch7" label="3. 시그모이드 σ" />
    <p class="leading-relaxed text-slate-700">
      <b>시그모이드</b> <MathBlock inline expr="\sigma" />(그리스문자 "시그마") <MathBlock inline expr="\sigma(x)=\dfrac{1}{1+e^{-x}}" /> 는
      어떤 실수든 <b>0 과 1 사이</b>로 눌러주는 S자 함수예요. 여기서 <MathBlock inline expr="e^{-x}" /> 는
      <MathBlock inline expr="e^x" /> 의 <b>역수</b>(<MathBlock inline expr="1/e^x" />)라서 <MathBlock inline expr="x" /> 가 커질수록 0 에 가까워져요.
      "얼마나 켜졌나(활성화)"를 0~1 로 표현해서 <b>활성화 함수</b>로 씁니다. 미분이 아주 예뻐요:
    </p>
    <MathBlock expr="\sigma'(x) = \sigma(x)\,\big(1 - \sigma(x)\big)" />
    <p class="leading-relaxed text-slate-700">
      아래에서 슬라이더를 움직이며 <MathBlock inline expr="\sigma" /> 와 <MathBlock inline expr="\sigma'" /> 를 보세요.
    </p>

    <SigmoidExplorer />

    <ConceptCard tone="note" title="새 용어 — 시그모이드 / 활성화 함수">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>시그모이드 <MathBlock inline expr="\sigma" /></b>: 출력이 항상 0~1. 큰 양수 → 1, 큰 음수 → 0, 0 → 0.5.</li>
        <li><b>활성화 함수</b>: 뉴런의 출력을 "얼마나 켜졌는지"로 바꿔주는 함수.</li>
        <li>
          미분 <MathBlock inline expr="\sigma'=\sigma(1-\sigma)" /> 는 <b>자기 값으로 자기 기울기를 표현</b> —
          이미 계산한 <MathBlock inline expr="\sigma" /> 를 재활용하니 역전파가 빠릅니다.
        </li>
      </ul>
    </ConceptCard>

    <StepQuiz
      difficulty="medium"
      question="시그모이드의 미분값 σ'(0) 을 단계별로 구하세요. (σ(0)=1/(1+e⁰), e⁰=1)"
      :steps="[
        { lhs: `\\sigma(0) = \\dfrac{1}{1+1}`, answer: 0.5, tolerance: 0.001 },
        { lhs: `1 - \\sigma(0)`, answer: 0.5, tolerance: 0.001 },
        { lhs: `\\sigma'(0) = \\sigma(1-\\sigma) = 0.5\\times 0.5`, answer: 0.25, tolerance: 0.001 },
      ]"
      :hints="['e⁰ = 1 이므로 σ(0) = 1/2.', 'σ′ = σ(1−σ).']"
      explanation="σ(0)=0.5, σ'(0)=0.5×0.5=0.25 — 시그모이드 기울기의 최댓값입니다."
    />

    <!-- 4. 연쇄법칙 결합 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 연쇄법칙과 함께 (eˣ 응용)</h2>
    <ReviewFlag id="ch7-s4" chapter="ch7" label="4. 연쇄법칙과 함께" />
    <p class="leading-relaxed text-slate-700">
      지수·로그도 <b>합성</b>되면 Phase 6 의 연쇄법칙을 씁니다. 예를 들어 <MathBlock inline expr="e^{2x}" /> 는
      속함수 <MathBlock inline expr="2x" />, 겉함수 <MathBlock inline expr="e^u" />:
    </p>
    <MathBlock expr="(e^{2x})' = e^{2x}\cdot(2x)' = 2\,e^{2x}" />

    <ConceptCard tone="tip" title="속미분 잊지 않기">
      <MathBlock inline expr="e^{2x}" /> 를 그냥 <MathBlock inline expr="e^{2x}" /> 로 두면 <b>속미분 ×2 를 빠뜨린</b> 거예요.
      겉미분(<MathBlock inline expr="e^{2x}" />) × 속미분(<MathBlock inline expr="2" />) = <MathBlock inline expr="2e^{2x}" />.
      마찬가지로 시그모이드에 들어가는 <MathBlock inline expr="\sigma(wx+b)" /> 도 연쇄법칙으로 <MathBlock inline expr="w" /> 가 곱해집니다.
    </ConceptCard>

    <!-- 5. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 활성화 함수의 미분이 학습을 좌우한다</h2>
    <ReviewFlag id="ch7-ai" chapter="ch7" label="🤖 활성화 함수의 미분" />
    <p class="leading-relaxed text-slate-700">
      역전파는 각 층의 국소 미분을 곱해 전파한다고 했죠(Phase 6). 그 국소 미분 중 하나가 바로
      <b>활성화 함수의 미분</b>입니다. 시그모이드의 <MathBlock inline expr="\sigma'=\sigma(1-\sigma)" /> 가
      곳곳에서 곱해져요.
    </p>

    <ConceptCard tone="goal" title="시그모이드 미분과 기울기 소실">
      <ul class="list-disc space-y-2 pl-5">
        <li><MathBlock inline expr="\sigma'" /> 의 최댓값은 <b>0.25</b>(x=0), 양 끝에서는 거의 <b>0</b>.</li>
        <li>층이 깊으면 0.25 이하의 값이 <b>계속 곱해져</b> 기울기가 급격히 작아짐 → <b>기울기 소실</b>.</li>
        <li>그래서 깊은 신경망은 시그모이드 대신 <b>ReLU</b> 같은 함수를 활성화로 많이 씁니다. (미분값이 0 또는 1 로 단순)</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="시그모이드 미분 σ'(x) 의 최댓값은 0.25 이고, 양 끝으로 갈수록 0 에 가까워진다(기울기 소실)."
      type="truefalse"
      :answer="0"
      explanation="참입니다. x=0 에서 0.25 로 최대, 멀어지면 0 에 수렴 → 기울기 소실의 원인."
    />

    <!-- 6. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="지수·로그·시그모이드 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="(eˣ)' = eˣ 이다. (지수함수는 미분해도 자기 자신)"
        type="truefalse"
        :answer="0"
        explanation="참입니다. eˣ 의 특별한 성질이에요."
      />
      <Quiz
        difficulty="easy"
        question="자연로그의 미분 (ln x)' 은?"
        :choices="['1/x', 'ln x', 'x', 'eˣ']"
        :answer="0"
        :hints="['아주 간단한 형태입니다.']"
        explanation="(ln x)' = 1/x."
      />
      <Quiz
        difficulty="easy"
        question="시그모이드 σ(0) 의 값은? (σ(0)=1/(1+e⁰), e⁰=1)"
        type="numeric"
        :answer="0.5"
        :tolerance="0.001"
        :hints="['e⁰ = 1 이므로 1/(1+1).']"
        explanation="σ(0) = 1/2 = 0.5."
      />
      <Quiz
        difficulty="easy"
        question="시그모이드 σ(x) 의 출력은 항상 0 과 1 사이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 큰 음수 → 0, 큰 양수 → 1 에 가까워지는 S자 함수."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="σ'(0) 을 단계별로 구하세요. (σ(0)=0.5)"
        :steps="[
          { lhs: `\\sigma(0)`, answer: 0.5, tolerance: 0.001 },
          { lhs: `1 - \\sigma(0)`, answer: 0.5, tolerance: 0.001 },
          { lhs: `\\sigma'(0)=\\sigma(1-\\sigma)=0.5\\times0.5`, answer: 0.25, tolerance: 0.001 },
        ]"
        :hints="['σ′ = σ(1−σ).']"
        explanation="0.5 × 0.5 = 0.25 (기울기 최댓값)."
      />
      <Quiz
        difficulty="medium"
        question="시그모이드 미분 σ'(x) 를 σ 로 나타내면?"
        :choices="['σ²', 'σ(1 − σ)', '1 − σ', 'σ + 1']"
        :answer="1"
        :hints="['이미 구한 σ 값을 재활용하는 형태.']"
        explanation="σ'(x) = σ(x)(1 − σ(x))."
      />
      <Quiz
        difficulty="medium"
        question="(ln x)' 을 x=2 에서 계산하면?"
        type="numeric"
        :answer="0.5"
        :tolerance="0.001"
        :hints="['1/x 에 x=2.']"
        explanation="1/2 = 0.5."
      />
      <Quiz
        difficulty="medium"
        question="(eˣ)' = eˣ 은 항상 양수이므로 eˣ 는 어디서나 증가한다(기울기 > 0)."
        type="truefalse"
        :answer="0"
        :hints="['eˣ 값 자체가 항상 양수.']"
        explanation="참입니다. 기울기 = eˣ > 0 이라 항상 증가."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="연쇄법칙으로 (e^{3x})' 을 x=0 에서 구하세요. (겉 eᵘ, 속 3x)"
        :steps="[
          { lhs: `\\text{겉미분 } e^{3x}\\text{ 의 } x=0 \\text{ 값 } (e^0)`, answer: 1 },
          { lhs: `\\text{속미분 } (3x)'`, answer: 3 },
          { lhs: `\\text{곱 } 1\\times 3`, answer: 3 },
        ]"
        :hints="['(e^{3x})′ = e^{3x}·3. x=0: e⁰=1.', '1 × 3.']"
        explanation="(e^{3x})' = 3e^{3x}, x=0 → 3·1 = 3."
      />
      <Quiz
        difficulty="hard"
        question="(e^{2x})' 을 x=0 에서 계산하면? (= 2e^{2x})"
        type="numeric"
        :answer="2"
        :hints="['(e^{2x})′ = 2e^{2x}. x=0: e⁰=1.']"
        explanation="2·e⁰ = 2·1 = 2. (속미분 2 를 곱하는 것 잊지 않기)"
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch07_exp_log_sigmoid.ipynb</code> 에서 SymPy 로 eˣ·ln x·시그모이드를 미분하고,
      σ' = σ(1−σ) 성질과 기울기 소실(양 끝에서 σ'→0)을 그래프로 확인합니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch7')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 7 완료. AI 활성화 함수를 미분했습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 변수가 여러 개인 함수의 미분 — <b>편미분</b>입니다. (가중치별 기울기!)
      </p>
      <RouterLink
        to="/ch/ch8"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 다변수 함수와 편미분 →
      </RouterLink>
    </div>
  </article>
</template>
