<script setup lang="ts">
// Phase 3 · 미분계수와 도함수의 정의
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import DerivativeExplorer from '@/components/DerivativeExplorer.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

const f = (x: number) => x * x
const df = (x: number) => 2 * x

function onSetComplete() {
  progress.markDone('ch3')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 3</p>
    <h1 class="mb-4 text-3xl font-bold">미분계수와 도함수의 정의 ✏️</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      Phase 2 에서 극한으로 잡은 "한 점의 기울기"에 드디어 <b>이름과 공식</b>을 붙입니다.
      한 점에서의 값은 <b>미분계수</b>, 모든 점의 기울기를 모은 함수는 <b>도함수</b>예요.
      이 둘의 차이를 확실히 구분하는 게 이번 챕터의 핵심입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>미분계수</b> <MathBlock inline expr="f'(a)" /> 의 정의(극한식)를 읽는다</li>
        <li><b>도함수</b> <MathBlock inline expr="f'(x)" /> 가 "기울기를 알려주는 함수"임을 안다</li>
        <li>정의로부터 <MathBlock inline expr="x^2" /> 의 도함수가 <MathBlock inline expr="2x" /> 임을 유도한다</li>
        <li>표기법 <MathBlock inline expr="f'(x)" />, <MathBlock inline expr="\dfrac{dy}{dx}" /> 를 읽는다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 미분계수 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 미분계수 — 한 점에서의 기울기(값)</h2>
    <ReviewFlag id="ch3-s1" chapter="ch3" label="1. 미분계수 — 한 점에서의 기울기" />
    <p class="leading-relaxed text-slate-700">
      점 <MathBlock inline expr="x=a" /> 에서의 순간변화율(접선 기울기)을 <b>미분계수</b>라 하고
      <MathBlock inline expr="f'(a)" /> 로 씁니다. Phase 2 의 극한에 이름을 붙인 것뿐이에요.
    </p>
    <MathBlock expr="f'(a) = \lim_{h \to 0} \dfrac{f(a+h) - f(a)}{h}" />

    <ConceptCard tone="note" title="새 용어 — 미분계수 f'(a)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>읽는 법</b>: "에프 프라임 에이"</li>
        <li><b>뜻</b>: <MathBlock inline expr="x=a" /> 라는 <b>딱 한 점</b>에서의 접선 기울기 — <b>숫자 하나</b>입니다.</li>
        <li>예: <MathBlock inline expr="f(x)=x^2" /> 이면 <MathBlock inline expr="f'(1)=2" />, <MathBlock inline expr="f'(3)=6" />.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="f(x)=x² 에서 x=1 의 미분계수 f'(1) 은? (접선 기울기)"
      type="numeric"
      :answer="2"
      :hints="['Phase 2 에서 x=1 의 순간변화율을 구했었죠.', 'x² 의 x=1 접선 기울기 = 2.']"
      explanation="f'(1) = 2. 정의의 극한값이자 x=1 접선의 기울기입니다."
    />

    <!-- 2. 도함수 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 도함수 — 기울기를 알려주는 '함수'</h2>
    <ReviewFlag id="ch3-s2" chapter="ch3" label="2. 도함수 — 기울기를 알려주는 함수" />
    <p class="leading-relaxed text-slate-700">
      미분계수는 점마다 하나씩 정해집니다. 그럼 이 값들을 <MathBlock inline expr="x" /> 에 대한
      <b>함수</b>로 묶을 수 있겠죠? 그게 <b>도함수</b> <MathBlock inline expr="f'(x)" /> 입니다.
      아래에서 위 곡선의 점을 움직여 보세요 — 접선 기울기(빨강)가 그대로 아래 <b>도함수 그래프</b>의
      점 높이로 나타납니다.
    </p>
    <MathBlock expr="f'(x) = \lim_{h \to 0} \dfrac{f(x+h) - f(x)}{h}" />

    <DerivativeExplorer
      :fn="f"
      :dfn="df"
      :xmin="-3"
      :xmax="3"
      :ymin="-1"
      :ymax="9"
      :dymin="-7"
      :dymax="7"
      :initial="1"
      label-f="f(x) = x²"
      label-df="f'(x) = 2x"
    />

    <ConceptCard tone="note" title="새 용어 — 도함수 / 미분하다">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <b>도함수(derivative)</b> <MathBlock inline expr="f'(x)" />: 각 <MathBlock inline expr="x" /> 에서의
          기울기를 돌려주는 <b>함수</b>. (미분계수는 여기에 특정 값을 넣은 <b>숫자</b>)
        </li>
        <li>
          <b>미분하다(differentiate)</b>: 함수로부터 그 도함수를 구하는 행위.
          "<MathBlock inline expr="x^2" /> 을 미분하면 <MathBlock inline expr="2x" />" 처럼요.
        </li>
        <li>
          관계: <b>도함수에 <MathBlock inline expr="x=a" /> 를 대입 = 미분계수 <MathBlock inline expr="f'(a)" /></b>.
          예: <MathBlock inline expr="f'(x)=2x" /> 에 <MathBlock inline expr="x=3" /> → <MathBlock inline expr="f'(3)=6" />.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="도함수 f'(x) 는 '숫자 하나'가 아니라 'x 에 따라 값이 정해지는 함수'다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 미분계수는 숫자(한 점), 도함수는 함수(모든 점)예요."
    />

    <!-- 3. 정의로 유도 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 정의로부터 (x²)' = 2x 유도</h2>
    <ReviewFlag id="ch3-s3" chapter="ch3" label="3. 정의로부터 (x²)'=2x 유도" />
    <p class="leading-relaxed text-slate-700">
      공식을 외우기 전에, <b>정의(극한)</b> 로 직접 한 번 유도해 봅시다. Phase 2 에서 한 계산과 똑같아요.
    </p>
    <MathBlock expr="f'(x) = \lim_{h \to 0} \dfrac{(x+h)^2 - x^2}{h}" />
    <p class="leading-relaxed text-slate-700">
      <MathBlock inline expr="(x+h)^2" /> 을 Phase 2 처럼 분배법칙(앞 괄호의 각 항을 뒤 괄호의 각 항에
      곱해 전부 더하기)으로 펼치면 <MathBlock inline expr="(x+h)(x+h) = x\cdot x + x\cdot h + h\cdot x + h\cdot h" /> —
      같은 항을 합쳐 <MathBlock inline expr="x^2 + 2xh + h^2" /> 이에요. <MathBlock inline expr="x^2" /> 끼리
      지워지고, 남은 <MathBlock inline expr="2xh + h^2" /> 의 각 항을 <MathBlock inline expr="h" /> 로 나누면:
    </p>
    <MathBlock expr="= \lim_{h \to 0} \dfrac{x^2 + 2xh + h^2 - x^2}{h} = \lim_{h \to 0} \dfrac{2xh + h^2}{h}" />
    <MathBlock expr="= \lim_{h \to 0} (2x + h) = 2x" />

    <ConceptCard tone="tip" title="핵심 흐름">
      전개 → <MathBlock inline expr="x^2" /> 소거 → <MathBlock inline expr="h" /> 로 약분 →
      <MathBlock inline expr="h \to 0" /> 대입. 이 4단계가 "정의로 미분하기"의 전형입니다.
      (다음 챕터부터는 이걸 매번 안 하도록 <b>공식</b>을 배웁니다!)
    </ConceptCard>

    <!-- 4. 표기법 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 표기법 — 같은 뜻, 다른 옷</h2>
    <ReviewFlag id="ch3-s4" chapter="ch3" label="4. 표기법 — 같은 뜻 다른 옷" />
    <p class="leading-relaxed text-slate-700">
      도함수(미분)를 나타내는 기호는 여러 가지인데, <b>전부 같은 뜻</b>입니다. 상황에 따라 골라 쓸 뿐이에요.
    </p>

    <ConceptCard tone="note" title="새 기호 — 미분 표기 3종">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <MathBlock inline expr="f'(x)" /> — "에프 프라임 엑스" (라그랑주 표기). 가장 간단.
        </li>
        <li>
          <MathBlock inline expr="\dfrac{dy}{dx}" /> — "디와이 디엑스" (라이프니츠 표기).
          <MathBlock inline expr="y=f(x)" /> 일 때 "<MathBlock inline expr="x" /> 가 변할 때 <MathBlock inline expr="y" /> 가
          변하는 순간 비율" = 기울기. (분수처럼 생겼지만 하나의 덩어리 기호)
        </li>
        <li>
          <MathBlock inline expr="\dfrac{d}{dx}f(x)" /> — "디 디엑스 에프엑스".
          "<MathBlock inline expr="f(x)" /> 를 <MathBlock inline expr="x" /> 로 미분하라"는 <b>명령</b> 형태.
        </li>
      </ul>
      <p class="mt-2 text-sm">
        예: <MathBlock inline expr="\dfrac{d}{dx}x^2 = 2x" />, 즉 <MathBlock inline expr="\dfrac{dy}{dx}=2x" /> (단 <MathBlock inline expr="y=x^2" />).
      </p>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="다음 중 '도함수(미분)'를 나타내는 표기가 아닌 것은?"
      :choices="[`f'(x)`, `dy/dx`, `d/dx · f(x)`, `f(x)²`]"
      :answer="3"
      :hints="['셋은 미분 표기, 하나는 그냥 함수의 제곱입니다.']"
      explanation="f(x)² 은 함숫값을 제곱한 것일 뿐, 미분과 무관합니다. 나머지 셋은 모두 도함수 표기예요."
    />

    <!-- 5. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 도함수가 있으면 '어느 점이든' 기울기를 즉시 안다</h2>
    <ReviewFlag id="ch3-ai" chapter="ch3" label="🤖 도함수가 있으면 어느 점이든 기울기를 즉시" />
    <p class="leading-relaxed text-slate-700">
      경사하강법은 매 걸음마다 "<b>지금 이 지점</b>의 기울기"가 필요합니다. 매번 극한을 다시
      계산하면 너무 느리죠. 하지만 <b>도함수 공식</b>을 한 번 구해두면, 어떤 지점 <MathBlock inline expr="x" /> 든
      <b>대입 한 번</b>으로 기울기가 나옵니다.
    </p>

    <ConceptCard tone="ai" title="도함수 = 재사용 가능한 '기울기 공식'">
      <ul class="list-disc space-y-2 pl-5">
        <li>미분계수(한 점)를 매번 극한으로 구하면 느리고 반복적.</li>
        <li><b>도함수 <MathBlock inline expr="f'(x)" /></b> 를 한 번 구해두면 임의의 <MathBlock inline expr="x" /> 에 대입만 하면 됨.</li>
        <li>딥러닝 프레임워크의 <b>자동미분(autograd)</b> 이 바로 이 도함수를 자동으로 만들어, 수백만 지점의 기울기를 순식간에 계산합니다. (Phase 9~10)</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="도함수 f'(x)=2x 를 구해두면, 미분계수 f'(a) 는 극한을 다시 계산할 필요 없이 x=a 대입만으로 얻는다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 그래서 '공식(도함수)'을 만들어 두는 게 강력해요."
    />

    <!-- 6. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="미분계수와 도함수 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="미분계수 f'(a) 는 x=a 에서의 접선 기울기다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 미분계수 = 그 점의 순간변화율 = 접선 기울기."
      />
      <Quiz
        difficulty="easy"
        question="f(x)=x² 의 도함수가 f'(x)=2x 일 때, f'(4) 는?"
        type="numeric"
        :answer="8"
        :hints="['도함수에 x=4 를 대입.', '2×4.']"
        explanation="f'(4) = 2×4 = 8."
      />
      <Quiz
        difficulty="easy"
        question="도함수 f'(x) 를 가장 잘 설명한 것은?"
        :choices="[
          '한 점에서의 기울기 값(숫자) 하나',
          '모든 x 에서의 접선 기울기를 알려주는 함수',
          '함수의 최댓값',
          'x 축과 만나는 점',
        ]"
        :answer="1"
        :hints="['「함수」인지 「숫자」인지 구분하세요.']"
        explanation="도함수는 각 x 의 기울기를 돌려주는 함수입니다. (미분계수가 그 함수의 한 값)"
      />
      <Quiz
        difficulty="easy"
        question="f'(x)=2x 일 때, x=0 에서의 미분계수 f'(0) 은?"
        type="numeric"
        :answer="0"
        explanation="2×0 = 0. x² 의 맨 아래 꼭짓점이라 접선이 수평(기울기 0)."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="도함수 f'(x)=2x 에 값을 대입해 여러 점의 미분계수를 구하세요."
        :steps="[
          { lhs: `f'(0) = 2\\times 0`, answer: 0 },
          { lhs: `f'(1) = 2\\times 1`, answer: 2 },
          { lhs: `f'(3) = 2\\times 3`, answer: 6 },
          { lhs: `f'(10) = 2\\times 10`, answer: 20 },
        ]"
        :hints="['도함수에 x 값을 그대로 넣으면 그 점의 미분계수(기울기).']"
        explanation="도함수 하나로 모든 점의 기울기를 대입만으로 얻습니다."
      />
      <Quiz
        difficulty="medium"
        question="정의 lim(h→0) (f(2+h)−f(2))/h 로 구한 f(x)=x² 의 미분계수 f'(2) 는?"
        type="numeric"
        :answer="4"
        :hints="['(2+h)² − 4 = 4h + h². h 로 나누면 4 + h.', 'h→0 이면 4 + h → ?']"
        explanation="(4h + h²)/h = 4 + h → 4. (= 2×2)"
      />
      <Quiz
        difficulty="medium"
        question="다음 중 '도함수(미분)'를 나타내는 표기가 아닌 것은?"
        :choices="[`f'(x)`, `dy/dx`, `d/dx · f(x)`, `f(x)+2`]"
        :answer="3"
        :hints="['셋은 미분 표기, 하나는 그냥 함수에 2 를 더한 것.']"
        explanation="f(x)+2 는 미분과 무관합니다. 나머지 셋은 모두 도함수 표기예요."
      />
      <Quiz
        difficulty="medium"
        question="도함수에 특정 x 값을 대입하면 그 점의 미분계수가 나온다."
        type="truefalse"
        :answer="0"
        :hints="['f’(x)=2x 에 x=5 를 넣으면?']"
        explanation="참입니다. 예: f'(x)=2x 에 x=5 → f'(5)=10."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="f(x)=x² 에서 미분계수가 10 이 되는 점 x 는? (f'(x)=2x)"
        type="numeric"
        :answer="5"
        :hints="['2x = 10 을 푸세요.', '양변을 2 로 나눕니다.']"
        explanation="2x = 10 → x = 5. 기울기(미분계수)로부터 위치를 거꾸로 찾은 거예요."
      />
      <Quiz
        difficulty="hard"
        question="미분계수와 도함수의 관계로 옳은 것은?"
        :choices="[
          '둘은 완전히 같은 말이다',
          '도함수는 함수, 미분계수는 도함수에 한 점을 넣은 값(숫자)이다',
          '미분계수가 함수, 도함수가 숫자다',
          '둘 다 항상 상수다',
        ]"
        :answer="1"
        :hints="['「함수」와 「그 함수의 한 값」의 관계.']"
        explanation="도함수 f'(x) 는 함수, 미분계수 f'(a) 는 거기에 x=a 를 넣은 숫자입니다."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch03_derivative_definition.ipynb</code> 에서 정의(극한)로 도함수를 유도하고,
      SymPy 의 <code>sp.diff</code> 로 <MathBlock inline expr="f'(x)" /> 를 구한 뒤 특정 점에 대입해
      미분계수까지 한 번에 확인합니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch3')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">Phase 3 완료. 미분계수와 도함수를 구분했습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 매번 극한을 쓰지 않고 빠르게 미분하는 <b>기본 공식(멱법칙 등)</b>입니다.
      </p>
      <RouterLink
        to="/ch/ch4"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 기본 미분 공식 →
      </RouterLink>
    </div>
  </article>
</template>
