<script setup lang="ts">
// Phase 10 · 상관관계와 회귀 — 머신러닝의 시작 (시리즈 종착점)
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { ChartView } from '@series/ui'
import RegressionExplorer from '@/components/RegressionExplorer.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 학생 8명: 하루 공부 시간(시간) vs 시험 점수 — RegressionExplorer 기본 데이터와 동일
const hours = [1, 2, 3, 4, 5, 6, 7, 8]
const scores = [32, 44, 49, 55, 65, 62, 78, 83]

const scatterData = {
  datasets: [
    {
      label: '학생 8명 (공부 시간, 점수)',
      data: hours.map((h, i) => ({ x: h, y: scores[i] })),
      backgroundColor: '#6366f1',
      pointRadius: 6,
    },
  ],
}
const scatterOptions = {
  scales: {
    x: { min: 0, max: 10, title: { display: true, text: '하루 공부 시간 (시간)' } },
    y: { min: 0, max: 100, title: { display: true, text: '시험 점수' } },
  },
}

function onSetComplete() {
  progress.markDone('ch10')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 10 · 최종 챕터</p>
    <h1 class="mb-4 text-3xl font-bold">상관관계와 회귀 — 머신러닝의 시작 📈</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      드디어 마지막 챕터입니다. 지금까지는 변수 <b>하나</b>(점수, 키, 구매율)를 다뤘다면,
      이제 <b>두 변수의 관계</b>를 봅니다 — "공부 시간이 늘면 점수도 오를까?"
      관계를 찾으면 <b>예측</b>이 가능해지고, 데이터로 예측 규칙을 찾는 것이 바로
      <b>머신러닝</b>입니다. 3부작 전체가 이 지점에서 만나요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>산점도</b>와 <b>상관계수 r</b> 로 두 변수 관계의 방향·강도를 읽는다</li>
        <li>"<b>상관 ≠ 인과</b>"의 함정을 확실히 피한다</li>
        <li><b>최소제곱법</b>으로 회귀 직선 <MathBlock inline expr="\hat{y} = ax + b" /> 를 직접 구한다</li>
        <li>회귀가 곧 <b>모델·손실·학습</b>을 갖춘 가장 작은 머신러닝임을 이해한다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 산점도 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 산점도 — 두 변수를 한 화면에</h2>
    <ReviewFlag id="ch10-s1" chapter="ch10" label="1. 산점도" />
    <p class="leading-relaxed text-slate-700">
      학생 8명의 <b>하루 공부 시간</b>과 <b>시험 점수</b>를 조사했습니다. 두 변수의 관계를
      보려면 한 학생을 <b>점 하나</b>(가로 = 공부 시간, 세로 = 점수)로 찍으면 됩니다.
      이런 그림이 <b>산점도</b>예요.
    </p>

    <ChartView type="scatter" :data="scatterData" :options="scatterOptions" />

    <ConceptCard tone="note" title="새 용어 — 산점도 (scatter plot)">
      두 변수를 각각 가로축·세로축에 놓고 데이터 하나를 점 하나로 찍은 그림.
      점들이 <b>오른쪽 위로 향하면</b> "같이 커지는" 관계, <b>오른쪽 아래로 향하면</b> "하나가 크면
      다른 쪽이 작은" 관계, <b>구름처럼 흩어져 있으면</b> 뚜렷한 직선 관계가 없는 것입니다.
      위 그림은 뚜렷한 오르막 — 공부 시간과 점수가 같이 움직이네요.
    </ConceptCard>

    <!-- 2. 상관계수 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 상관계수 r — 관계의 방향과 강도를 숫자 하나로</h2>
    <ReviewFlag id="ch10-s2" chapter="ch10" label="2. 상관계수 r" />
    <p class="leading-relaxed text-slate-700">
      "얼마나 뚜렷한 오르막인가"를 숫자로 나타낸 것이 <b>상관계수</b>입니다.
      항상 <b>−1 과 +1 사이</b>의 값이고, 위 데이터의 상관계수는 약 <b>0.98</b> —
      아주 강한 오르막 관계입니다.
    </p>
    <ConceptCard tone="note" title="새 기호 — 상관계수 r">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>기호</b>: <MathBlock inline expr="r" /> · <b>읽는 법</b>: "알" · <b>범위</b>: −1 ≤ r ≤ +1.</li>
        <li><b>부호 = 방향</b>: r &gt; 0 오르막(같이 증가), r &lt; 0 내리막(반대로 움직임).
          통계 정식 이름으로는 오르막 = <b>양의 상관(positive correlation)</b>,
          내리막 = <b>음의 상관(negative correlation)</b> — 교재·기사·논문에는 이 이름으로 나와요.</li>
        <li><b>크기 = 강도</b>: |r| 이 1 에 가까울수록 점들이 직선에 딱 붙음. r = +1 은 완벽한
          오르막 직선, r = −1 은 완벽한 내리막 직선, r ≈ 0 은 직선 관계 없음.</li>
        <li>대략의 감: |r| ≥ 0.7 강함 · 0.3~0.7 중간 · ≤ 0.3 약함 (분야마다 기준은 달라요).</li>
      </ul>
    </ConceptCard>
    <ConceptCard tone="warn" title="r 은 '직선' 관계만 잡아낸다">
      완벽한 U자 곡선 관계(예: 스트레스와 성과)는 관계가 분명히 있는데도 r ≈ 0 이 나올 수
      있습니다. r 이 0 이라는 건 "직선 관계가 없다"는 뜻이지 "아무 관계가 없다"가 아니에요.
      그래서 숫자만 보지 말고 <b>산점도를 항상 같이</b> 봐야 합니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="r = −0.9 인 관계와 r = +0.2 인 관계 중, 더 강한 직선 관계는?"
      :choices="['r = −0.9 (부호는 방향일 뿐, 크기가 강도)', 'r = +0.2 (양수라서)', '둘 다 같다', '비교할 수 없다']"
      :answer="0"
      :hints="['강도는 부호가 아니라 절댓값 |r| 로 봅니다.']"
      explanation="|−0.9| = 0.9 > 0.2 이므로 r = −0.9 쪽이 훨씬 강한 내리막(음의 상관) 직선 관계입니다. 부호는 방향, 절댓값은 강도!"
    />

    <!-- 3. 상관 ≠ 인과 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 상관 ≠ 인과 — 통계 최대의 함정</h2>
    <ReviewFlag id="ch10-s3" chapter="ch10" label="3. 상관은 인과가 아니다" />
    <p class="leading-relaxed text-slate-700">
      여름 데이터를 모으면 <b>아이스크림 판매량</b>과 <b>익사 사고 수</b>는 상관이 아주
      높게 나옵니다. 그럼 아이스크림이 익사를 일으킬까요? 당연히 아니죠 — 둘 다
      <b>더운 날씨</b>라는 제3의 변수가 끌어올린 것뿐입니다.
    </p>
    <ConceptCard tone="warn" title="상관관계는 인과관계가 아니다">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>r 이 높다 = "같이 움직인다"까지만. <b>누가 원인인지는 알려주지 않습니다.</b></li>
        <li>흔한 범인은 <b>숨은 변수</b>(더운 날씨처럼 둘 다에 영향을 주는 제3의 변수)와 <b>우연</b>.</li>
        <li>인과를 확인하는 표준 도구가 9장의 <b>무작위 실험(A/B 테스트)</b>입니다 — 무작위로
          나누면 숨은 변수의 영향이 두 그룹에 골고루 퍼지거든요.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="두 변수의 상관계수가 0.95 로 매우 높다면, 한쪽이 다른 쪽의 원인이라고 결론 내릴 수 있다."
      type="truefalse"
      :answer="1"
      :hints="['아이스크림과 익사 사고를 떠올려 보세요.']"
      explanation="거짓입니다. 상관은 '같이 움직임'만 말해줍니다. 숨은 변수나 우연일 수 있어 인과는 별도 실험(무작위 배정)으로 확인해야 해요."
    />

    <!-- 4. 회귀 직선 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 회귀 — 데이터에 가장 잘 맞는 직선</h2>
    <ReviewFlag id="ch10-s4" chapter="ch10" label="4. 회귀 직선과 잔차" />
    <p class="leading-relaxed text-slate-700">
      관계가 직선에 가깝다면, 그 직선을 실제로 그어서 <b>예측</b>에 쓸 수 있습니다.
      "공부를 5.5시간 하면 몇 점쯤 나올까?" — 직선 위의 값을 읽으면 되죠.
      이 직선을 <b>회귀 직선</b>이라 부릅니다.
    </p>
    <MathBlock expr="\hat{y} = ax + b" />
    <ConceptCard tone="note" title="새 기호 — ŷ (예측값), 잔차">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <MathBlock inline expr="\hat{y}" /> &nbsp;<b>읽는 법</b>: "와이 햇(y-hat)" ·
          <b>뜻</b>: 직선이 내놓는 <b>예측값</b>. 모자(^)는 "실제가 아니라 추정·예측"이라는 표시예요.
          <MathBlock inline expr="a" /> 는 기울기(1시간 더 공부하면 몇 점 오르나),
          <MathBlock inline expr="b" /> 는 절편(공부 0시간일 때의 예측 점수).
        </li>
        <li>
          <b>잔차(residual)</b> = 실제 값 − 예측값 = <MathBlock inline expr="y - \hat{y}" /> —
          직선이 그 점에서 <b>얼마나 빗나갔나</b>. 점이 직선 위에 있으면 잔차 0.
        </li>
      </ul>
    </ConceptCard>
    <p class="leading-relaxed text-slate-700">
      그런데 "가장 잘 맞는 직선"이 뭘까요? 빗나간 정도(잔차)들이 전체적으로 가장 작은 직선이겠죠.
      잔차는 양수·음수가 섞이니 — 2장에서 분산 만들 때 했던 것처럼! — <b>제곱해서</b> 더합니다.
    </p>
    <MathBlock expr="\text{SSE} = \sum (y - \hat{y})^2 \;\; (\text{잔차 제곱의 합, 작을수록 좋음})" />
    <ConceptCard tone="note" title="새 용어 — 최소제곱법 (least squares)">
      잔차 제곱의 합(SSE)이 <b>최소</b>가 되는 기울기 <MathBlock inline expr="a" /> 와 절편
      <MathBlock inline expr="b" /> 를 고르는 방법. "빗나감의 제곱을 가장 작게" —
      이름 그대로 <b>최소 + 제곱</b>입니다. 통계학과 머신러닝이 공유하는 가장 오래된 학습 원리예요.
    </ConceptCard>

    <!-- 5. 인터랙티브 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 직선을 맞춰보기</h2>
    <ReviewFlag id="ch10-s5" chapter="ch10" label="5. 회귀 직선 탐험기" />
    <p class="leading-relaxed text-slate-700">
      아래에서 기울기·절편 슬라이더로 직선을 움직여 <b>SSE 를 최대한 줄여보세요</b>
      (빨간 점선이 잔차입니다). 한계까지 줄였다 싶으면 <b>최적 직선 찾기</b>를 눌러
      최소제곱법의 답과 비교해 보세요. 점을 끌어 이상치를 만들면 직선이 어떻게
      끌려가는지도 관찰해 보세요 — 1장에서 본 "평균은 이상치에 끌려간다"의 직선 버전입니다.
    </p>

    <RegressionExplorer />

    <!-- 6. 손계산 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">6. 최소제곱법 손계산 — 공식은 딱 두 줄</h2>
    <ReviewFlag id="ch10-s6" chapter="ch10" label="6. 최소제곱법 손계산" />
    <p class="leading-relaxed text-slate-700">
      최소제곱법의 답은 공식으로 바로 구할 수 있습니다 (유도에는 2부의 미분이 쓰여요 —
      "SSE 를 a, b 로 미분해서 0 이 되는 지점"이 최소니까요):
    </p>
    <MathBlock expr="a = \dfrac{\sum (x - \bar{x})(y - \bar{y})}{\sum (x - \bar{x})^2}, \qquad b = \bar{y} - a\,\bar{x}" />
    <p class="leading-relaxed text-slate-700">
      읽는 법: 분자는 "x 편차 × y 편차"의 합(둘이 같이 움직이는 정도), 분모는 "x 편차 제곱"의
      합(x 가 퍼진 정도). 2장의 편차가 여기서 다시 일합니다. 아주 작은 데이터
      <b>(1, 1), (2, 3), (3, 5)</b> 로 직접 해봅시다.
    </p>

    <StepQuiz
      difficulty="medium"
      question="점 (1,1), (2,3), (3,5) 에 대한 최소제곱 직선 ŷ = ax + b 를 단계별로 구하고, x=4 의 예측값까지 계산하세요."
      :steps="[
        { lhs: '\\bar{x} = (1+2+3) \\div 3', answer: 2 },
        { lhs: '\\bar{y} = (1+3+5) \\div 3', answer: 3 },
        { lhs: '\\text{분자} = (-1)(-2) + (0)(0) + (1)(2)', answer: 4 },
        { lhs: '\\text{분모} = (-1)^2 + 0^2 + 1^2', answer: 2 },
        { lhs: 'a = 4 \\div 2', answer: 2 },
        { lhs: 'b = 3 - 2 \\times 2', answer: -1 },
        { lhs: '\\hat{y}(4) = 2 \\times 4 - 1', answer: 7 },
      ]"
      :hints="[
        '평균부터: x̄ = 2, ȳ = 3. 그다음 각 점의 편차 (x−x̄), (y−ȳ)를 구해 짝지어 곱합니다.',
        '편차 짝: x 편차 = −1, 0, 1 / y 편차 = −2, 0, 2.',
        'b 는 직선이 평균점 (x̄, ȳ) 을 지나도록 정해집니다: b = ȳ − a·x̄.',
      ]"
      explanation="ŷ = 2x − 1. 이 데이터는 마침 완벽한 직선 위에 있어서(r = 1) 잔차가 전부 0 이지만, 현실 데이터는 위 탐험기처럼 흩어져 있어 SSE > 0 입니다. 그리고 방금 여러분은 첫 머신러닝 모델을 '손으로 학습'시켰습니다!"
    />

    <!-- 7. 이것이 머신러닝 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">7. 이것이 머신러닝입니다</h2>
    <ReviewFlag id="ch10-s7" chapter="ch10" label="7. 회귀 = 가장 작은 머신러닝" />
    <p class="leading-relaxed text-slate-700">
      방금 한 일을 다시 보세요. ① 예측 규칙의 <b>모양</b>을 정했고(직선 <MathBlock inline expr="\hat{y}=ax+b" />),
      ② 빗나감을 재는 <b>점수</b>를 정했고(SSE), ③ 그 점수가 최소가 되도록 <b>데이터로부터</b>
      <MathBlock inline expr="a, b" /> 를 정했습니다. 이 세 단계가 그대로 머신러닝의 정의예요:
    </p>
    <div class="my-4 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
      <table class="w-full text-center text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500">
            <th class="py-2 font-medium">회귀에서</th>
            <th class="py-2 font-medium">머신러닝 용어로</th>
            <th class="py-2 font-medium">신경망에서는</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-slate-100">
            <td class="py-1.5">직선 ŷ = ax + b</td>
            <td class="py-1.5 font-semibold text-indigo-700">모델 (model)</td>
            <td class="py-1.5">뉴런 하나 (가중치 a, 편향 b)</td>
          </tr>
          <tr class="border-b border-slate-100">
            <td class="py-1.5">잔차 제곱합 SSE</td>
            <td class="py-1.5 font-semibold text-indigo-700">손실 함수 (loss)</td>
            <td class="py-1.5">MSE(평균제곱오차)·크로스 엔트로피(5부에서 정식으로)</td>
          </tr>
          <tr>
            <td class="py-1.5">SSE 최소인 a, b 찾기</td>
            <td class="py-1.5 font-semibold text-indigo-700">학습 (training)</td>
            <td class="py-1.5">경사하강법 (2부!)</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="leading-relaxed text-slate-700">
      회귀는 공식 한 방으로 답이 나왔지만, 모델이 복잡해지면(신경망) 공식이 없어서
      <b>2부에서 배운 경사하강법</b>으로 손실 골짜기를 한 걸음씩 내려갑니다. 그리고 변수가
      공부 시간 하나가 아니라 수천 개가 되면, 그 계산을 깔끔하게 묶는 도구가
      <b>1부에서 배운 행렬</b>이에요.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="선형회귀는 모델(직선) · 손실(잔차 제곱합) · 학습(손실 최소화)을 모두 갖춘, 가장 작은 머신러닝이라 할 수 있다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 규모만 다를 뿐, 거대 신경망도 '모델을 정하고 → 손실을 정하고 → 데이터로 손실을 최소화'하는 같은 구조입니다."
    />

    <!-- 8. AI 연결 + 대단원 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 3부작 대단원 — AI 기반지식 완성</h2>
    <ReviewFlag id="ch10-ai" chapter="ch10" label="🤖 3부작 대단원" />
    <p class="leading-relaxed text-slate-700">
      선형회귀에서 출발하면 현대 AI 까지 한 줄로 이어집니다. 뉴런 하나(= 회귀)를
      수백만 개 쌓으면 신경망, 손실을 낮추는 도구가 경사하강법·역전파(기울기를 출력에서
      입력 쪽으로 전달해 구하는 계산법 — 둘 다 2부에서 정식으로), 그 출력을
      확률분포로 만들어 다음 단어를 고르면 언어모델이죠. 여러분은 이제 그 전체 그림의
      <b>세 기둥을 모두</b> 가졌습니다.
    </p>
    <ConceptCard tone="ai" title="수포자 3부작이 만나는 지점">
      <ul class="list-disc space-y-2 pl-5">
        <li><b>1부 선형대수 — 데이터의 구조</b>: 데이터·가중치를 벡터와 행렬로 표현하고, 층과 층의
          계산은 행렬곱으로.</li>
        <li><b>2부 미분 — 학습의 원리</b>: 손실을 가장 빨리 줄이는 방향(그래디언트)을 찾아
          경사하강법·역전파로 파라미터를 갱신.</li>
        <li><b>3부 확률과 통계 — 데이터와 불확실성</b>: 모델의 출력은 확률분포(소프트맥스),
          학습 데이터는 표본(미니배치·LLN·CLT), 평가는 추정과 검정(신뢰구간·A/B 테스트),
          그리고 가장 작은 모델이 회귀.</li>
        <li>이 셋을 합치면: <b>AI = 행렬로 표현된 거대한 함수를, 확률로 정의된 손실이 작아지도록,
          미분으로 데이터에 맞춰가는 것.</b> 🎉</li>
      </ul>
    </ConceptCard>

    <!-- 9. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">8. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 3부작 완주!</b>
    </p>

    <QuizSet title="상관관계와 회귀 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="상관계수 r 은 항상 −1 이상 +1 이하의 값이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. r 은 −1(완벽한 내리막 직선)부터 +1(완벽한 오르막 직선) 사이의 값만 가집니다."
      />
      <Quiz
        difficulty="easy"
        question="r = −0.95 인 두 변수의 산점도는 어떤 모양에 가장 가까운가?"
        :choices="['뚜렷한 오르막 직선', '뚜렷한 내리막 직선', '아무 관계 없는 구름', '완벽한 U자 곡선']"
        :answer="1"
        :hints="['부호는 방향(−는 내리막), 절댓값은 강도.']"
        explanation="r 이 −1 에 가까우므로 강한 내리막 — 한쪽이 커질수록 다른 쪽이 작아지는 뚜렷한 직선 경향입니다."
      />
      <Quiz
        difficulty="easy"
        question="잔차(residual)란?"
        :choices="['실제 값 − 예측값', '예측값 − 평균', 'x 의 변화량', '직선의 기울기']"
        :answer="0"
        explanation="잔차 = 실제 값 − 예측값(ŷ). 직선이 그 점에서 얼마나 빗나갔는지를 나타냅니다."
      />
      <Quiz
        difficulty="easy"
        question="아이스크림 판매량과 익사 사고 수의 상관이 높으므로, 아이스크림 판매가 익사의 원인이다."
        type="truefalse"
        :answer="1"
        :hints="['둘 다를 끌어올리는 제3의 변수(숨은 변수)가 있지 않았나요?']"
        explanation="거짓입니다. 더운 날씨라는 숨은 변수가 둘 다 끌어올린 것 — 상관은 인과가 아닙니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="회귀 직선이 ŷ = 2x − 1 일 때, x = 4 에서의 예측값은?"
        type="numeric"
        :answer="7"
        :hints="['x 자리에 4 를 넣으면 2×4 − 1.']"
        explanation="ŷ = 2×4 − 1 = 7. 회귀 직선은 이렇게 새로운 x 에 대한 예측을 내놓는 기계입니다."
      />
      <StepQuiz
        difficulty="medium"
        question="점 (0,1), (2,3), (4,8) 의 최소제곱 직선을 구하는 첫 단계들입니다. 차례로 계산하세요."
        :steps="[
          { lhs: '\\bar{x} = (0+2+4) \\div 3', answer: 2 },
          { lhs: '\\bar{y} = (1+3+8) \\div 3', answer: 4 },
          { lhs: '\\text{분자} = (-2)(-3) + (0)(-1) + (2)(4)', answer: 14 },
          { lhs: '\\text{분모} = (-2)^2 + 0^2 + 2^2', answer: 8 },
          { lhs: 'a = 14 \\div 8', answer: 1.75, tolerance: 0.001 },
          { lhs: 'b = 4 - 1.75 \\times 2', answer: 0.5, tolerance: 0.001 },
        ]"
        :hints="[
          '먼저 평균: x̄ = 2, ȳ = 4. 그다음 각 점의 편차를 구합니다.',
          'x 편차 = −2, 0, 2 / y 편차 = −3, −1, 4. 분자는 짝지어 곱해 더하기.',
        ]"
        explanation="ŷ = 1.75x + 0.5. 이번 데이터는 직선 위에 있지 않아서 잔차가 0 이 아닙니다 — 최소제곱법은 그 잔차 제곱합을 최소로 만든 것뿐이에요."
      />
      <Quiz
        difficulty="medium"
        question="최소제곱법이 '최소화'하는 것은?"
        :choices="['잔차의 합', '잔차 절댓값의 최댓값', '잔차 제곱의 합', '데이터의 개수']"
        :answer="2"
        :hints="['이름에 답이 있어요 — 최소 + 제곱.', '잔차의 「합」은 양수·음수가 상쇄돼 기준이 못 됩니다(2장의 편차 합 = 0 과 같은 이유).']"
        explanation="잔차 제곱의 합(SSE)입니다. 그냥 합은 +와 −가 상쇄되기 때문에, 2장의 분산과 똑같은 이유로 제곱해서 더합니다."
      />
      <Quiz
        difficulty="medium"
        question="완벽한 U자 모양의 곡선 관계라도 상관계수 r 은 0 에 가까울 수 있다."
        type="truefalse"
        :answer="0"
        :hints="['r 은 「직선」 경향만 잽니다.']"
        explanation="참입니다. 오르막 절반과 내리막 절반이 상쇄돼 r ≈ 0 이 될 수 있어요. 그래서 산점도를 꼭 같이 봐야 합니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="선형회귀를 '머신러닝'이라고 부를 수 있는 가장 정확한 이유는?"
        :choices="[
          '컴퓨터가 계산해 주기 때문',
          '데이터로부터 손실(잔차 제곱합)을 최소화하는 파라미터 a, b 를 찾아내기 때문',
          '인공신경망을 사용하기 때문',
          '결과가 항상 정확하기 때문',
        ]"
        :answer="1"
        :hints="['머신러닝의 정의 = 모델 + 손실 + (데이터로) 손실 최소화.']"
        explanation="핵심은 '데이터로부터 손실을 최소화하도록 파라미터를 정한다'는 구조입니다. 신경망도 규모만 다를 뿐 같은 구조예요."
      />
      <Quiz
        difficulty="hard"
        question="모델 ŷ = 2x − 1 로 x = 5 인 학생의 점수를 9점으로 예측했는데 실제 점수는 12점이었다. 이 점의 잔차는? (실제 − 예측)"
        type="numeric"
        :answer="3"
        :hints="['잔차 = 실제 값 − 예측값 = 12 − 9.']"
        explanation="잔차 = 12 − 9 = +3. 모델이 3점 낮게 예측했다는 뜻입니다. 이런 잔차 제곱들의 합이 손실이고, 학습은 이를 줄이는 일이에요."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch10_correlation_regression.ipynb</code> 에서 <code>np.corrcoef</code> 로 상관계수를,
      손계산과 <code>np.polyfit</code> 으로 회귀 직선을 구해 검산합니다. 마지막에는 같은 문제를
      <b>경사하강법</b>(2부!)으로도 풀어 손실이 줄어드는 과정을 직접 봅니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch10')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-3xl">🎓</div>
      <p class="text-lg font-bold text-emerald-800">3부작 완주를 축하합니다!</p>
      <p class="mt-2 leading-relaxed text-sm text-emerald-700">
        <b>1부 선형대수</b>(데이터의 구조) · <b>2부 미분</b>(학습의 원리) ·
        <b>3부 확률과 통계</b>(데이터와 불확실성)를 모두 마쳤습니다.<br />
        이제 여러분은 "AI = 행렬로 표현된 거대한 함수를, 확률로 정의된 손실이 작아지도록,
        미분으로 데이터에 맞춰가는 것"이라는 문장을 <b>전부 이해하는 사람</b>입니다.
        수포자는 여기서 졸업이에요. 🎉
      </p>
      <RouterLink
        to="/"
        class="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        ← 전체 목차로
      </RouterLink>
    </div>
  </article>
</template>
