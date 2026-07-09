<script setup lang="ts">
// Phase 5 · 확률변수와 확률분포 (베르누이·이항분포·기댓값)
import ConceptCard from '@/components/ConceptCard.vue'
import MathBlock from '@/components/MathBlock.vue'
import ChartView from '@/components/ChartView.vue'
import BinomialExplorer from '@/components/BinomialExplorer.vue'
import Quiz from '@/components/Quiz.vue'
import StepQuiz from '@/components/StepQuiz.vue'
import QuizSet from '@/components/QuizSet.vue'
import ReviewFlag from '@/components/ReviewFlag.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 동전 2개 — 앞면 수 X 의 분포 (막대 차트)
const coinDist = {
  labels: ['X = 0 (모두 뒷면)', 'X = 1 (하나만 앞면)', 'X = 2 (모두 앞면)'],
  datasets: [
    {
      label: 'P(X=k)',
      data: [0.25, 0.5, 0.25],
      backgroundColor: ['#c7d2fe', '#6366f1', '#c7d2fe'],
    },
  ],
}
const coinDistOptions = {
  plugins: { legend: { display: false } },
  scales: { y: { min: 0, max: 0.6 } },
}

function onSetComplete() {
  progress.markDone('ch5')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 5</p>
    <h1 class="mb-4 text-3xl font-bold">확률변수와 확률분포 🎲</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      지금까지는 "앞면이 나온다", "양성이 나온다" 같은 <b>사건</b>의 확률을 다뤘어요. 이번엔 결과에
      <b>숫자</b>를 붙입니다. 숫자가 되는 순간 평균을 내고, 그래프를 그리고, 계산할 수 있게 되거든요.
      1장의 평균과 3장의 확률이 여기서 처음 만납니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>확률변수</b>(결과에 붙인 숫자)와 <b>확률분포</b>(값마다 확률)를 이해한다</li>
        <li><b>기댓값</b> <MathBlock inline expr="E[X]" /> 이 "확률로 가중평균한 값"임을 계산으로 확인한다</li>
        <li><b>이항분포</b> <MathBlock inline expr="B(n, p)" /> 로 "n 번 중 성공 몇 번?"에 답한다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 확률변수 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 확률변수 — 결과에 숫자 붙이기</h2>
    <ReviewFlag id="ch5-s1" chapter="ch5" label="1. 확률변수 — 결과에 숫자 붙이기" />
    <p class="leading-relaxed text-slate-700">
      동전을 던지면 결과는 "앞" 또는 "뒤" — 글자죠. 여기에 <b>앞면 = 1, 뒷면 = 0</b> 이라고 숫자를
      붙여봅시다. 주사위 2개라면 "3과 4가 나옴" 대신 <b>합 = 7</b> 이라는 숫자로 요약할 수 있고요.
      이렇게 <b>시행의 결과마다 숫자를 하나씩 붙인 것</b>이 확률변수입니다.
    </p>

    <ConceptCard tone="note" title="새 용어 — 확률변수 X">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <b>확률변수(random variable)</b>: 시행 결과마다 숫자를 붙인 것. 보통 대문자
          <MathBlock inline expr="X" /> 로 씁니다.
        </li>
        <li>
          보통 변수와 다른 점: 값이 <b>우연에 달려 있다</b>는 것. 시행을 해보기 전에는 어떤 값이 될지
          모르고, 대신 <b>각 값이 나올 확률</b>은 알 수 있어요.
        </li>
        <li>예: X = 동전의 앞면 수, X = 주사위 2개의 합, X = 오늘 매장의 방문자 수.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="확률변수의 값은 시행을 해보기 전에는 정해져 있지 않다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 값은 우연에 달려 있고, 대신 각 값이 나올 확률을 알 수 있어요. 그래서 이름이 '확률'변수입니다."
    />

    <!-- 2. 확률분포 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 확률분포 — 값마다 확률을 정리한 표</h2>
    <ReviewFlag id="ch5-s2" chapter="ch5" label="2. 확률분포 — 값마다 확률을 정리한 표" />
    <p class="leading-relaxed text-slate-700">
      동전 2개를 던져 <b>앞면 수 X</b> 를 세봅시다. 나올 수 있는 결과는 (뒤뒤)(뒤앞)(앞뒤)(앞앞)
      네 가지로 모두 같은 확률 <MathBlock inline expr="\tfrac{1}{4}" /> 이에요. X 값으로 묶으면:
    </p>

    <div class="my-5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
      <table class="w-full text-center text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500">
            <th class="py-2 font-medium">X (앞면 수)</th>
            <th class="py-2 font-medium">0</th>
            <th class="py-2 font-medium">1</th>
            <th class="py-2 font-medium">2</th>
            <th class="py-2 font-medium text-indigo-600">합계</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="py-1.5 text-slate-500">해당 결과</td>
            <td class="py-1.5">뒤뒤</td>
            <td class="py-1.5">뒤앞, 앞뒤</td>
            <td class="py-1.5">앞앞</td>
            <td class="py-1.5">—</td>
          </tr>
          <tr class="font-mono text-indigo-700">
            <td class="py-1.5 font-sans text-slate-500">P(X=k)</td>
            <td class="py-1.5">1/4</td>
            <td class="py-1.5">2/4</td>
            <td class="py-1.5">1/4</td>
            <td class="py-1.5 font-bold">1</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ChartView type="bar" :data="coinDist" :options="coinDistOptions" :height="220" />

    <ConceptCard tone="note" title="새 용어 — 확률분포">
      <b>확률분포(probability distribution)</b>: 확률변수가 가질 수 있는 <b>각 값에 확률을 짝지어
      정리한 것</b>(표 또는 그래프). 확률을 전부 더하면 반드시 <b>1</b> 이 됩니다.
      3장에서 본 주사위 2개의 합이 7 근처에 몰리던 삼각형 모양 — 그게 바로 "합"이라는 확률변수의
      확률분포였어요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="동전 2개를 던져 앞면 수를 X 라 할 때, P(X=1) 은? (소수로 입력)"
      type="numeric"
      :answer="0.5"
      :hints="['네 결과 (뒤뒤)(뒤앞)(앞뒤)(앞앞) 중 앞면이 딱 1개인 것은 몇 가지?', '2가지 ÷ 4가지.']"
      explanation="앞면이 하나인 결과는 (뒤앞)(앞뒤) 두 가지이므로 2/4 = 0.5 입니다."
    />

    <!-- 3. 기댓값 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 기댓값 — 확률로 가중평균한 값</h2>
    <ReviewFlag id="ch5-s3" chapter="ch5" label="3. 기댓값 — 확률로 가중평균한 값" />
    <p class="leading-relaxed text-slate-700">
      "주사위를 던지면 <b>평균적으로</b> 얼마가 나올까?" 1장에서 평균은 데이터를 다 더해 개수로
      나눴죠. 아직 던지지 않은 주사위에는 데이터가 없는 대신 <b>확률</b>이 있습니다. 그래서
      <b>각 값 × 그 값의 확률</b>을 전부 더해요:
    </p>
    <MathBlock expr="E[X] = \sum x \cdot p(x)" />
    <MathBlock
      expr="E[X] = 1\cdot\tfrac{1}{6} + 2\cdot\tfrac{1}{6} + 3\cdot\tfrac{1}{6} + 4\cdot\tfrac{1}{6} + 5\cdot\tfrac{1}{6} + 6\cdot\tfrac{1}{6} = \tfrac{21}{6} = 3.5"
    />

    <ConceptCard tone="note" title="새 기호 — 기댓값 E[X]">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <MathBlock inline expr="E[X]" /> &nbsp;<b>읽는 법</b>: "엑스의 기댓값(expected value)" ·
          <b>뜻</b>: 확률변수 X 를 <b>아주 오래 반복했을 때의 평균</b>.
        </li>
        <li>
          <MathBlock inline expr="\sum" />(시그마)는 "전부 더하라"는 기호. 즉 <b>값 × 확률을 모든 값에
          대해 더한 것</b> — 확률을 가중치로 쓴 <b>가중평균</b>입니다.
        </li>
        <li>
          1장의 평균과 한 몸: 데이터가 이미 있으면 <b>평균</b>, 확률분포로 미리 계산하면
          <b>기댓값</b>. 주사위를 백만 번 던진 평균은 3.5 에 딱 붙습니다.
        </li>
      </ul>
    </ConceptCard>

    <!-- 4. 복권 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 복권은 왜 팔수록 남는 장사일까?</h2>
    <ReviewFlag id="ch5-s4" chapter="ch5" label="4. 복권은 왜 팔수록 남는 장사일까?" />
    <p class="leading-relaxed text-slate-700">
      기댓값의 위력은 <b>돈 계산</b>에서 바로 드러납니다. 1000원짜리 복권이 있다고 해봐요.
      1등 10만 원(확률 0.001), 2등 1만 원(확률 0.01), 나머지는 꽝. 이 복권 한 장의
      <b>기대 상금</b>을 직접 구해봅시다.
    </p>

    <StepQuiz
      difficulty="medium"
      question="1000원짜리 복권: 1등 10만 원(확률 0.001), 2등 1만 원(확률 0.01), 나머지는 꽝(0원). 기대 상금 E[X] 를 단계별로 구하세요. (단위: 원)"
      :steps="[
        { lhs: '100000 \\times 0.001', answer: 100 },
        { lhs: '10000 \\times 0.01', answer: 100 },
        { lhs: 'E[X] = 100 + 100 + 0', answer: 200 },
      ]"
      :hints="['각 상금에 그 상금이 나올 확률을 곱하세요.', '기댓값 = (값 × 확률)을 전부 더한 것. 꽝은 0원이라 더해도 0.']"
      explanation="기대 상금은 200원 — 복권 가격 1000원의 5분의 1입니다. 사는 사람은 평균적으로 장당 800원씩 잃고, 파는 쪽은 그만큼 법니다. 카지노·보험·뽑기가 모두 이 원리로 설계돼요."
    />

    <ConceptCard tone="warn" title="함정 주의 — 기댓값은 '한 번의 결과'가 아니다">
      복권 한 장을 사면 결과는 10만 원, 1만 원, 0원 중 하나일 뿐, <b>200원이 나오는 일은 없습니다</b>.
      기댓값은 "<b>아주 많이 반복했을 때</b>의 평균"이에요. 한두 번의 운과 헷갈리지 마세요.
    </ConceptCard>

    <!-- 5. 분산 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 분포의 흩어짐도 기댓값으로</h2>
    <ReviewFlag id="ch5-s5" chapter="ch5" label="5. 분포의 흩어짐도 기댓값으로" />
    <p class="leading-relaxed text-slate-700">
      2장에서 분산 = "편차 제곱의 평균"이었죠. 확률분포에서도 똑같습니다 — 평균 자리에 기댓값을
      쓰면 끝이에요. 기댓값을 <MathBlock inline expr="\mu" /> (그리스 문자, "뮤"라고 읽어요 —
      평균을 나타내는 단골 기호로 6장에서 다시 만납니다) 라 할 때:
    </p>
    <MathBlock expr="\text{Var}(X) = E\big[(X - \mu)^2\big]" />
    <p class="leading-relaxed text-slate-700">
      "평균에서 떨어진 거리(제곱)의 기댓값". 2장의 분산과 완전히 같은 아이디어라 새로 외울 건
      없습니다. 표준편차도 똑같이 <MathBlock inline expr="\sigma = \sqrt{\text{Var}(X)}" /> 예요.
    </p>

    <!-- 6. 베르누이와 이항분포 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">6. 베르누이 시행과 이항분포</h2>
    <ReviewFlag id="ch5-s6" chapter="ch5" label="6. 베르누이 시행과 이항분포" />
    <p class="leading-relaxed text-slate-700">
      세상에서 가장 많이 등장하는 확률변수는 의외로 단순한 것에서 나옵니다 — <b>성공 아니면 실패,
      딱 두 가지뿐인 시행</b>이에요. 동전(앞/뒤), 광고(클릭/무시), 검사(양성/음성) 전부 이 모양이죠.
    </p>

    <ConceptCard tone="note" title="새 용어 — 베르누이 시행">
      <b>베르누이 시행(Bernoulli trial)</b>: 결과가 <b>성공/실패 둘뿐</b>인 시행 1번. 성공 확률을
      <MathBlock inline expr="p" /> 로 씁니다. 성공 = 1, 실패 = 0 으로 숫자를 붙이면 가장 단순한
      확률변수가 돼요 (기댓값은 <MathBlock inline expr="E[X] = 1\cdot p + 0\cdot(1-p) = p" />).
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      이 시행을 <b>n 번 반복</b>해서 <b>성공 횟수</b>를 세면? 그것이 <b>이항분포</b>입니다.
      "동전 10번 중 앞면 몇 번?", "광고 100명 노출 중 클릭 몇 번?" — 전부 이항분포가 답해요.
      공식을 보기 전에 재료 하나만 챙깁시다: <b>조합</b>.
    </p>

    <ConceptCard tone="note" title="새 기호 — 조합 C(n, k)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <MathBlock inline expr="\binom{n}{k}" /> &nbsp;<b>읽는 법</b>: "엔 초이스 케이(n choose k)" ·
          <b>뜻</b>: n 번 중 성공할 <b>k 번의 자리를 고르는 가짓수</b>.
        </li>
        <li>
          작은 예로 감 잡기: 3번 중 앞면이 2번인 경우 = {1·2번째, 1·3번째, 2·3번째} 의 <b>3가지</b>.
          즉 <MathBlock inline expr="\binom{3}{2} = 3" />.
        </li>
        <li>
          표기가 두 가지예요: 세로로 쌓아 쓴 <MathBlock inline expr="\binom{n}{k}" /> 와
          한 줄로 쓴 <b>C(n, k)</b> 는 <b>완전히 같은 뜻</b>입니다. 이 앱의 문제에서는
          입력하기 쉬운 C(n, k) 쪽으로 씁니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      이제 이항분포 공식입니다. "성공이 정확히 k 번"이려면 성공 자리 고르기
      <MathBlock inline expr="\binom{n}{k}" /> 가지 × 각 배치의 확률(성공 k 번
      <MathBlock inline expr="p^k" />, 실패 n−k 번 <MathBlock inline expr="(1-p)^{n-k}" />):
    </p>
    <MathBlock expr="P(X = k) = \binom{n}{k}\, p^k (1-p)^{n-k}" />
    <p class="leading-relaxed text-slate-700">
      예: 동전 3번 중 앞면이 정확히 2번 나올 확률은
      <MathBlock inline expr="\binom{3}{2}\left(\tfrac{1}{2}\right)^2\left(\tfrac{1}{2}\right)^1 = 3 \times \tfrac{1}{8} = \tfrac{3}{8}" /> 입니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="4번 중 성공할 2번의 자리를 고르는 가짓수, C(4, 2) 는?"
      type="numeric"
      :answer="6"
      :hints="['직접 나열해 보세요: 12, 13, 14, 23, 24, 34.', '4개 중 2개를 고르는 짝의 개수입니다.']"
      explanation="{1·2}{1·3}{1·4}{2·3}{2·4}{3·4} — 6가지입니다."
    />

    <!-- 7. 인터랙티브 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">7. 이항분포 탐험기 (직접 움직여 보기)</h2>
    <ReviewFlag id="ch5-s7" chapter="ch5" label="7. 이항분포 탐험기" />
    <p class="leading-relaxed text-slate-700">
      아래에서 <b>n 슬라이더를 천천히 오른쪽으로</b> 밀어보세요. 들쭉날쭉하던 막대들이 점점
      좌우대칭 <b>종 모양</b>으로 정돈됩니다 — 다음 챕터 주인공(정규분포)의 예고편이에요.
      p 를 움직이면 산봉우리가 <MathBlock inline expr="E[X] = np" /> 를 따라 이동합니다.
    </p>

    <BinomialExplorer :initial-n="10" :initial-p="0.5" />

    <p class="leading-relaxed text-slate-700">
      이항분포의 기댓값과 분산은 외우기 쉽습니다. "한 번에 평균 p 씩, n 번이면":
    </p>
    <MathBlock expr="E[X] = np, \qquad \text{Var}(X) = np(1-p)" />
    <p class="leading-relaxed text-slate-700">
      예: 동전 100번이면 앞면은 평균 <MathBlock inline expr="100 \times 0.5 = 50" /> 번,
      분산은 <MathBlock inline expr="100 \times 0.5 \times 0.5 = 25" /> (표준편차 5). "50번 ± 5번쯤"
      이라는 감각이 생기죠.
    </p>

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 분류 AI 의 출력이 바로 확률분포</h2>
    <ReviewFlag id="ch5-ai" chapter="ch5" label="🤖 분류 AI 의 출력이 바로 확률분포" />
    <p class="leading-relaxed text-slate-700">
      사진을 보고 동물을 맞히는 AI 의 출력을 열어보면 "고양이"라는 답 하나가 아니라
      <b>고양이 70%, 개 25%, 새 5%</b> — 값마다 확률이 붙어 있고 합치면 1. 정확히 이 챕터의
      <b>확률분포</b>입니다(3장의 소프트맥스가 이 모양을 만들어 줘요).
    </p>

    <ConceptCard tone="goal" title="확률분포 → AI 학습의 언어">
      <ul class="list-disc space-y-2 pl-5">
        <li><b>분류 모델의 출력</b> = 클래스들 위의 확률분포. "정답일 확률"로 말하는 것이 AI 의 기본 화법.</li>
        <li>
          <b>학습의 목표도 기댓값</b>: 데이터가 우연히 뽑히니 손실(틀린 정도)도 확률변수 —
          AI 는 <b>손실의 기댓값(기대 손실)</b>을 최소화하도록 학습합니다(2부의 경사하강법이 그 도구).
        </li>
        <li><b>클릭률 예측·추천</b>도 베르누이(클릭/무시)의 p 를 추정하는 문제예요.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="분류 AI 의 출력(고양이 70%, 개 25%, 새 5%)은 모두 더하면 1 이 되는 확률분포다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 소프트맥스가 점수를 '합계 1인 확률분포'로 바꿔주기 때문에, AI 의 답은 항상 이 챕터에서 배운 확률분포의 모양이에요."
    />

    <!-- 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">8. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="확률변수와 확률분포 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="확률분포에서 모든 값의 확률을 더하면 1 이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 무엇이든 하나는 반드시 일어나므로 확률의 합은 1이에요."
      />
      <Quiz
        difficulty="easy"
        question="동전 1개를 던져 앞면이면 X=1, 뒷면이면 X=0. 기댓값 E[X] 는? (소수로)"
        type="numeric"
        :answer="0.5"
        :hints="['E[X] = 1×P(앞) + 0×P(뒤).', '1×0.5 + 0×0.5.']"
        explanation="E[X] = 1×0.5 + 0×0.5 = 0.5. 베르누이 확률변수의 기댓값은 항상 성공 확률 p 입니다."
      />
      <Quiz
        difficulty="easy"
        question="기댓값 E[X] 의 뜻으로 가장 알맞은 것은?"
        :choices="[
          '가장 자주 나오는 값',
          '아주 오래 반복했을 때의 평균',
          '나올 수 있는 값 중 최댓값',
          '크기순으로 가운데 값',
        ]"
        :answer="1"
        :hints="['기댓값은 값 × 확률을 전부 더한 가중평균입니다.']"
        explanation="기댓값 = 확률로 가중평균한 값 = 시행을 아주 많이 반복했을 때의 평균입니다."
      />
      <Quiz
        difficulty="easy"
        question="베르누이 시행은 결과가 성공/실패 둘뿐인 시행이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 동전, 클릭 여부, 합격 여부처럼 결과가 두 가지뿐인 시행 1번이 베르누이 시행이에요."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="주사위 1개의 기댓값을 단계별로 구하세요."
        :steps="[
          { lhs: '1+2+3+4+5+6', answer: 21 },
          { lhs: '21 \\div 6', answer: 3.5 },
        ]"
        :hints="['각 눈의 확률이 모두 1/6 로 같아서, (값의 합) × 1/6 로 계산할 수 있어요.']"
        explanation="E[X] = 21/6 = 3.5. 주사위에 3.5 라는 눈은 없지만, 오래 굴린 평균은 3.5 에 다가갑니다."
      />
      <Quiz
        difficulty="medium"
        question="동전 4번 중 앞면이 정확히 2번 나올 확률은? (C(4,2)=6, 소수로)"
        type="numeric"
        :answer="0.375"
        :tolerance="0.001"
        :hints="['P(X=2) = C(4,2) × (1/2)² × (1/2)².', '6 × 1/16.']"
        explanation="6 × (1/2)⁴ = 6/16 = 0.375 입니다."
      />
      <Quiz
        difficulty="medium"
        question="이항분포 B(n, 0.5) 에서 n 을 점점 키우면 분포 모양은?"
        :choices="[
          '한쪽으로 점점 쏠린다',
          '좌우대칭 종 모양에 가까워진다',
          '점점 평평해져 모든 값이 같은 확률이 된다',
          '모양이 불규칙하게 요동친다',
        ]"
        :answer="1"
        :hints="['탐험기에서 n 슬라이더를 밀었을 때를 떠올리세요.']"
        explanation="n 이 커질수록 종 모양(정규분포)에 가까워집니다 — 6장에서 이 곡선의 정체를 배워요."
      />
      <Quiz
        difficulty="medium"
        question="광고를 100명에게 보여주고 클릭 확률이 0.3 이라면, 기대 클릭 수 E[X] 는?"
        type="numeric"
        :answer="30"
        :hints="['이항분포의 기댓값은 E[X] = np.', '100 × 0.3.']"
        explanation="E[X] = np = 100 × 0.3 = 30번. '한 번에 평균 0.3번씩, 100번이면 30번'이라는 직관 그대로예요."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="게임 뽑기 1회: 희귀 아이템(가치 10000원)이 나올 확률 0.05, 일반 아이템(가치 500원)이 나올 확률 0.95. 아이템 가치의 기댓값을 단계별로 구하세요. (단위: 원)"
        :steps="[
          { lhs: '10000 \\times 0.05', answer: 500 },
          { lhs: '500 \\times 0.95', answer: 475 },
          { lhs: 'E[X] = 500 + 475', answer: 975 },
        ]"
        :hints="['각 가치 × 그 확률을 먼저 계산하세요.', '두 결과를 더하면 기댓값입니다.']"
        explanation="기대 가치는 975원. 뽑기 가격이 1000원이라면 평균적으로 뽑을수록 손해라는 뜻이죠 — 복권과 같은 구조입니다."
      />
      <Quiz
        difficulty="hard"
        question="이항분포 B(100, 0.3) 의 분산 Var(X) 는?"
        type="numeric"
        :answer="21"
        :hints="['Var(X) = np(1−p).', '100 × 0.3 × 0.7.']"
        explanation="Var(X) = 100 × 0.3 × 0.7 = 21 (표준편차 ≈ 4.6). 기대 클릭 30번 ± 4.6번쯤이라는 감각입니다."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch05_random_variables.ipynb</code> 에서 주사위 기댓값 3.5 를 백만 번
      시뮬레이션으로 확인하고, <code>scipy.stats.binom</code> 으로 이항분포를 그려 n 이 커질 때
      종 모양이 되는 걸 직접 봅니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch5')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">
        Phase 5 완료. 결과에 숫자를 붙이고 기댓값으로 미래의 평균까지 계산했습니다.
      </p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 이항분포가 다가가던 그 종 모양의 정체 — <b>정규분포</b>입니다.
      </p>
      <RouterLink
        to="/ch/ch6"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 정규분포 (핵심) →
      </RouterLink>
    </div>
  </article>
</template>
