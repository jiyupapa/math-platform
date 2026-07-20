<script setup lang="ts">
// Phase 2 · 흩어짐 재기 — 분산과 표준편차
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { ChartView } from '@series/ui'
import DeviationExplorer from '@/components/DeviationExplorer.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 두 반 점수 — 평균은 똑같이 70, 흩어짐은 전혀 다름
const classChart = {
  labels: ['학생1', '학생2', '학생3', '학생4', '학생5'],
  datasets: [
    { label: 'A반 (다닥다닥)', data: [68, 69, 70, 71, 72], backgroundColor: '#818cf8' },
    { label: 'B반 (들쭉날쭉)', data: [40, 55, 70, 85, 100], backgroundColor: '#fbbf24' },
  ],
}

function onSetComplete() {
  progress.markDone('ch2')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 2</p>
    <h1 class="mb-4 text-3xl font-bold">흩어짐 재기 — 분산과 표준편차 📏</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1장에서 데이터의 "가운데"를 잡았습니다. 그런데 가운데가 같아도 데이터의 <b>모양</b>은
      전혀 다를 수 있어요. 이번 챕터는 "평균에서 <b>얼마나 퍼져 있나</b>"를 숫자 하나로 재는
      도구 — <b>분산</b>과 <b>표준편차</b> — 를 만듭니다. 이 도구는 6장(정규분포)부터
      끝까지 계속 쓰이는 통계의 기둥이에요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>평균이 같아도 <b>흩어짐이 다르면 전혀 다른 데이터</b>임을 눈으로 확인한다</li>
        <li>편차 → (합이 0이라 실패) → 제곱 → <b>분산</b> → 루트 → <b>표준편차</b>의 흐름을 이해한다</li>
        <li><b>z점수</b>로 단위가 다른 값들을 공평하게 비교한다 (6장 표준정규분포의 복선)</li>
      </ul>
    </ConceptCard>

    <!-- 1. 평균이 같아도 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 평균이 같으면 같은 데이터일까?</h2>
    <ReviewFlag id="ch2-s1" chapter="ch2" label="1. 평균이 같으면 같은 데이터일까?" />
    <p class="leading-relaxed text-slate-700">
      두 반의 시험 점수입니다. A반은 [68, 69, 70, 71, 72], B반은 [40, 55, 70, 85, 100].
      <b>평균은 둘 다 정확히 70점</b>이에요. 하지만 그래프를 보면 완전히 다른 반이죠 —
      A반은 모두 비슷비슷, B반은 최상위권부터 최하위권까지 들쭉날쭉합니다.
    </p>

    <ChartView type="bar" :data="classChart" />

    <p class="leading-relaxed text-slate-700">
      "평균 70점"만으로는 이 차이를 전혀 표현할 수 없습니다. <b>흩어진 정도를 재는 새 숫자</b>가
      필요해요.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="평균이 같으면 두 데이터의 흩어진 모양도 같다."
      type="truefalse"
      :answer="1"
      :hints="['위의 A반과 B반을 보세요. 평균은 둘 다 70점이었죠.']"
      explanation="거짓입니다. 평균은 '가운데'만 알려줄 뿐, 퍼진 정도는 전혀 알려주지 않아요."
    />

    <!-- 2. 편차 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 편차 — 평균에서 얼마나 떨어졌나</h2>
    <ReviewFlag id="ch2-s2" chapter="ch2" label="2. 편차 — 평균에서 얼마나 떨어졌나" />
    <p class="leading-relaxed text-slate-700">
      흩어짐을 재는 첫 재료는 <b>각 값이 평균에서 얼마나 떨어져 있는지</b>입니다.
      B반(평균 70)의 편차를 구해 보면: 40−70=<b>−30</b>, 55−70=<b>−15</b>, 70−70=<b>0</b>,
      85−70=<b>+15</b>, 100−70=<b>+30</b>.
    </p>

    <ConceptCard tone="note" title="새 용어 — 편차">
      <b>편차(deviation)</b> = 값 − 평균. 부호가 방향을 알려줍니다 —
      <b>+</b>는 평균보다 위, <b>−</b>는 평균보다 아래. 숫자의 크기가 떨어진 거리예요.
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      그럼 "편차들의 평균"을 내면 흩어짐이 될까요? 직접 더해 봅시다:
    </p>
    <MathBlock expr="(-30) + (-15) + 0 + 15 + 30 = 0" />

    <ConceptCard tone="warn" title="함정 — 편차의 합은 언제나 0">
      +편차와 −편차가 정확히 상쇄되어, <b>어떤 데이터든 편차의 합(그리고 평균)은 항상 0</b>입니다.
      평균이 애초에 "무게중심"이었으니 당연한 결과죠. 흩어짐을 재려면 <b>부호를 없애야</b> 합니다 —
      수학이 고른 방법은 <b>제곱</b>이에요.
    </ConceptCard>

    <!-- 3. 분산 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 제곱해서 평균 내기 — 분산</h2>
    <ReviewFlag id="ch2-s3" chapter="ch2" label="3. 제곱해서 평균 내기 — 분산" />
    <p class="leading-relaxed text-slate-700">
      편차를 <b>제곱</b>하면 −30 도 +30 도 똑같이 900 이 됩니다(부호 소멸!).
      제곱한 편차들의 <b>평균</b>이 바로 <b>분산</b>이에요. B반으로 계산하면:
    </p>
    <MathBlock expr="\text{분산} = \dfrac{(-30)^2 + (-15)^2 + 0^2 + 15^2 + 30^2}{5} = \dfrac{900 + 225 + 0 + 225 + 900}{5} = \dfrac{2250}{5} = 450" />
    <p class="leading-relaxed text-slate-700">
      같은 방법으로 A반은 편차가 [−2, −1, 0, 1, 2] 이니 분산 = (4+1+0+1+4) ÷ 5 = <b>2</b>.
      450 대 2 — 흩어짐의 차이가 드디어 숫자로 잡혔습니다!
    </p>

    <ConceptCard tone="note" title="새 기호 — 분산 공식 읽기">
      <MathBlock expr="\sigma^2 = \dfrac{1}{n}\sum_{i=1}^{n}(x_i - \bar{x})^2" />
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><MathBlock inline expr="\sigma^2" /> — "시그마 제곱". <b>분산(variance)</b>의 기호입니다.</li>
        <li><MathBlock inline expr="(x_i - \bar{x})" /> — <MathBlock inline expr="i" />번째 값의 <b>편차</b> (값 − 평균).</li>
        <li><MathBlock inline expr="(\cdots)^2" /> — 편차를 <b>제곱</b>해 부호를 없앰.</li>
        <li><MathBlock inline expr="\frac{1}{n}\sum" /> — 전부 더해 <MathBlock inline expr="n" />으로 나눔 = <b>평균</b>.</li>
        <li>말로 풀면: <b>"편차 제곱의 평균"</b>. 그게 전부예요.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="A반 점수 [68,69,70,71,72] (평균 70)의 분산은? (편차: −2,−1,0,1,2)"
      type="numeric"
      :answer="2"
      :hints="['편차 제곱: 4, 1, 0, 1, 4.', '(4+1+0+1+4) ÷ 5 = ?']"
      explanation="편차 제곱합 10 ÷ 5 = 2 입니다. B반(450)과 비교하면 흩어짐 차이가 실감 나죠."
    />

    <!-- 4. 표준편차 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 단위 되돌리기 — 표준편차</h2>
    <ReviewFlag id="ch2-s4" chapter="ch2" label="4. 단위 되돌리기 — 표준편차" />
    <p class="leading-relaxed text-slate-700">
      분산 450 에는 어색한 점이 하나 있어요. 편차를 제곱했기 때문에 단위도 제곱 —
      점수 데이터라면 <b>"점²"</b>이라는 이상한 단위가 됩니다. 그래서 마지막에
      <b>제곱근(√, 루트)</b>을 씌워 원래 단위로 되돌린 것이 <b>표준편차</b>입니다:
    </p>
    <MathBlock expr="\sigma = \sqrt{\text{분산}} \qquad \text{B반: } \sigma = \sqrt{450} \approx 21.2\text{점}, \quad \text{A반: } \sigma = \sqrt{2} \approx 1.4\text{점}" />

    <ConceptCard tone="note" title="새 기호 — σ (표준편차)">
      <MathBlock inline expr="\sigma" /> &nbsp;<b>읽는 법</b>: "시그마" (소문자 — 대문자
      <MathBlock inline expr="\Sigma" /> 는 "다 더하라"였고, 소문자는 표준편차입니다) ·
      <b>뜻</b>: <b>표준편차(standard deviation)</b> = √분산. 해석은 간단해요 —
      <b>"이 데이터는 평균에서 대략 σ 만큼 떨어져 있다"</b>. B반은 "평균 70점, 대략 ±21점씩
      흩어짐", A반은 "평균 70점, 대략 ±1.4점 안에 옹기종기".
    </ConceptCard>

    <!-- 5. 인터랙티브 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 움직여 보기</h2>
    <ReviewFlag id="ch2-s5" chapter="ch2" label="5. 직접 움직여 보기 — 편차와 σ" />
    <p class="leading-relaxed text-slate-700">
      점을 끌어서 흩어 보세요. 편차 막대(초록 = +, 분홍 = −)가 길어질수록 분산·표준편차가
      커집니다. 몇 가지 실험을 해보세요: ① 모든 점을 한곳에 모으면 σ 는? ② 편차 합은
      아무리 움직여도 왜 0 일까요?
    </p>

    <DeviationExplorer />

    <StepQuiz
      difficulty="medium"
      question="데이터 [2, 4, 4, 4, 6] 의 표준편차를 단계별로 구하세요."
      :steps="[
        { lhs: '\\text{평균} = (2+4+4+4+6) \\div 5', answer: 4 },
        { lhs: '\\text{편차 제곱합} = (-2)^2 + 0^2 + 0^2 + 0^2 + 2^2', answer: 8 },
        { lhs: '\\text{분산} = 8 \\div 5', answer: 1.6, tolerance: 0.001 },
        { lhs: '\\sigma = \\sqrt{1.6} \\;\\text{(소수 둘째 자리 반올림)}', answer: 1.26, tolerance: 0.01 },
      ]"
      :hints="['평균부터: 합 20 ÷ 5.', '편차는 각 값 − 평균(4). 제곱해서 더하세요.', '√1.6 ≈ 1.264…']"
      explanation="평균 4, 분산 1.6, 표준편차 √1.6 ≈ 1.26. 계산 순서(평균→편차→제곱→평균→루트)가 곧 공식입니다."
    />

    <!-- 6. z점수 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">6. z점수 — 다른 시험끼리 공평하게 비교하기</h2>
    <ReviewFlag id="ch2-s6" chapter="ch2" label="6. z점수 — 공평한 비교" />
    <p class="leading-relaxed text-slate-700">
      수학 시험에서 70점(반 평균 60, σ 10), 영어 시험에서 80점(반 평균 75, σ 5)을 받았어요.
      점수만 보면 영어를 더 잘 본 것 같지만... 공평한 비교는 <b>"평균에서 표준편차 몇 개만큼
      위인가"</b>로 해야 합니다:
    </p>
    <MathBlock expr="z_{\text{수학}} = \dfrac{70 - 60}{10} = 1 \qquad z_{\text{영어}} = \dfrac{80 - 75}{5} = 1" />
    <p class="leading-relaxed text-slate-700">
      둘 다 z = 1, 즉 <b>"평균보다 표준편차 1개만큼 위"</b>로 완전히 같은 성취였네요!
    </p>

    <ConceptCard tone="note" title="새 용어 — z점수 (표준화)">
      <MathBlock expr="z = \dfrac{x - \bar{x}}{\sigma}" />
      <b>z점수(z-score)</b>: 값에서 평균을 빼고 표준편차로 나눈 것. "평균에서 σ 몇 개만큼
      떨어졌나"를 나타내는 <b>단위 없는 숫자</b>라, 점수·키·몸무게처럼 단위와 스케일이 다른
      값들끼리도 비교할 수 있어요. 이렇게 바꾸는 과정을 <b>표준화(standardization)</b>라고
      합니다 — 6장 정규분포에서 주인공으로 다시 만나요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="국어 90점, 반 평균 80점, 표준편차 5점. z점수는?"
      type="numeric"
      :answer="2"
      :hints="['z = (값 − 평균) ÷ σ.', '(90 − 80) ÷ 5 = ?']"
      explanation="(90 − 80) ÷ 5 = 2. 평균보다 표준편차 2개만큼 위 — 꽤 상위권이라는 뜻입니다."
    />

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 표준화가 AI 학습을 안정시킨다</h2>
    <ReviewFlag id="ch2-ai" chapter="ch2" label="🤖 표준화가 AI 학습을 안정시킨다" />
    <p class="leading-relaxed text-slate-700">
      AI 모델에 들어가는 입력 데이터는 스케일이 제각각입니다 — 키는 150~190(cm), 연봉은
      30,000,000~100,000,000(원). 이대로 학습시키면 연봉처럼 <b>숫자가 큰 특성이 계산을
      독점</b>해서 학습이 뒤뚱거려요. 그래서 실무에서는 모든 특성을 <b>z점수로 표준화</b>해
      "평균 0, 표준편차 1" 로 맞춘 뒤 학습시킵니다. 이걸 <b>특성 스케일링(feature scaling)</b>
      이라고 해요.
    </p>

    <ConceptCard tone="ai" title="분산·표준편차 → AI">
      <ul class="list-disc space-y-2 pl-5">
        <li><b>표준화(z점수)</b>는 데이터 전처리의 기본기 — 2부에서 다루는 경사하강법이
          울퉁불퉁하지 않은 매끈한 골짜기를 내려가게 도와줍니다.</li>
        <li><b>분산 = 불확실성의 언어</b>. 모델 예측이 얼마나 오락가락하는지, 데이터가 얼마나
          퍼져 있는지를 말할 때 항상 분산·표준편차로 표현해요 (7~8장에서 계속).</li>
      </ul>
    </ConceptCard>

    <!-- 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">7. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="분산과 표준편차 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="편차는 '값 − 평균'이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 부호(+/−)가 평균 기준 위인지 아래인지, 크기가 거리를 알려줘요."
      />
      <Quiz
        difficulty="easy"
        question="어떤 데이터든 편차를 전부 더하면 항상 0 이다."
        type="truefalse"
        :answer="0"
        :hints="['평균은 「무게중심」이었죠. +와 −가 정확히 상쇄됩니다.']"
        explanation="참입니다. 그래서 편차를 그냥 더하는 대신 '제곱해서' 더하는 것이 분산이에요."
      />
      <Quiz
        difficulty="easy"
        question="[5, 5, 5, 5] 의 분산은?"
        type="numeric"
        :answer="0"
        :hints="['모든 값이 평균(5)과 같으면 편차는 전부 0.']"
        explanation="흩어짐이 전혀 없으니 분산 = 0. 분산이 0인 데이터는 모든 값이 똑같은 데이터뿐입니다."
      />
      <Quiz
        difficulty="easy"
        question="분산의 단위가 어색한 문제(점² 등)를 해결하려고 분산에 √ 를 씌운 것은?"
        :choices="['평균', '표준편차', '중앙값', '편차']"
        :answer="1"
        explanation="표준편차 σ = √분산. 원래 단위로 돌아와 '평균에서 대략 ±σ' 로 읽을 수 있게 됩니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="데이터 [1, 3, 5, 7] 의 분산을 단계별로 구하세요."
        :steps="[
          { lhs: '\\text{평균} = (1+3+5+7) \\div 4', answer: 4 },
          { lhs: '\\text{편차 제곱합} = (-3)^2 + (-1)^2 + 1^2 + 3^2', answer: 20 },
          { lhs: '\\text{분산} = 20 \\div 4', answer: 5 },
        ]"
        :hints="['평균 = 16 ÷ 4.', '편차는 −3, −1, 1, 3 입니다.']"
        explanation="분산 = 5. 표준편차는 √5 ≈ 2.24 가 되겠죠."
      />
      <Quiz
        difficulty="medium"
        question="분산이 5 인 데이터의 표준편차는? (√5, 소수 둘째 자리 반올림)"
        type="numeric"
        :answer="2.24"
        :tolerance="0.01"
        :hints="['√4 = 2, √9 = 3 이니 √5 는 2와 3 사이.', '2.236… 을 반올림하세요.']"
        explanation="σ = √5 ≈ 2.24 입니다."
      />
      <Quiz
        difficulty="medium"
        question="A반 σ = 1.4점, B반 σ = 21.2점 (평균은 둘 다 70점). 옳은 해석은?"
        :choices="[
          'A반 점수가 더 들쭉날쭉하다',
          'B반 점수가 더 들쭉날쭉하다',
          '두 반의 점수 분포가 같다',
          'B반의 평균이 더 높다',
        ]"
        :answer="1"
        :hints="['σ 가 클수록 평균에서 멀리 퍼져 있다는 뜻.']"
        explanation="σ 가 큰 B반이 훨씬 들쭉날쭉합니다. 평균이 같아도 σ 가 다르면 전혀 다른 반이에요."
      />
      <Quiz
        difficulty="medium"
        question="몸무게 평균 60kg, 표준편차 5kg 인 집단에서 70kg 의 z점수는?"
        type="numeric"
        :answer="2"
        :hints="['z = (값 − 평균) ÷ σ.', '(70 − 60) ÷ 5.']"
        explanation="(70 − 60) ÷ 5 = 2. 평균보다 σ 2개만큼 위입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="z점수가 알려주는 것으로 가장 알맞은 것은?"
        :choices="[
          '평균에서 표준편차 몇 개만큼 떨어졌나',
          '데이터의 총합',
          '가장 자주 나오는 값',
          '데이터의 개수',
        ]"
        :answer="0"
        :hints="['z = (x − 평균) ÷ σ 의 뜻을 말로 풀어 보세요.']"
        explanation="z점수 = 평균 기준 σ 단위 거리. 단위가 사라져서 서로 다른 시험·단위끼리 비교할 수 있어요."
      />
      <StepQuiz
        difficulty="hard"
        question="수학 85점(평균 70, σ 10), 영어 78점(평균 70, σ 4). 어느 쪽이 상대적으로 더 잘 본 걸까요? z점수로 비교하세요."
        :steps="[
          { lhs: 'z_{\\text{수학}} = (85 - 70) \\div 10', answer: 1.5, tolerance: 0.001 },
          { lhs: 'z_{\\text{영어}} = (78 - 70) \\div 4', answer: 2 },
        ]"
        :hints="['각각 z = (점수 − 평균) ÷ σ 를 계산하세요.', '점수 자체는 수학(85)이 높지만…']"
        explanation="수학 z = 1.5, 영어 z = 2. 점수는 낮아도 영어(z=2)가 상대적으로 훨씬 잘 본 시험입니다 — 이게 표준화의 힘!"
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch02_variance_std.ipynb</code> 에서 편차 합이 정말 0 이 되는지 확인하고,
      분산·표준편차를 손으로 계산한 값과 <code>np.var</code>, <code>np.std</code> 결과를
      비교합니다. z점수로 두 과목 성적도 직접 비교해요. (선택 사항)
    </ConceptCard>

    <div
      v-if="progress.isDone('ch2')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 2 완료. 이제 데이터의 '가운데'와 '퍼짐'을 모두 잴 수 있습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 무대를 옮겨 <b>확률의 기초</b> — 불확실한 세계를 숫자로 다루는 법을 배웁니다.
      </p>
      <RouterLink
        to="/ch/ch3"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 확률의 기초 →
      </RouterLink>
    </div>
  </article>
</template>
