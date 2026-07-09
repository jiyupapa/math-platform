<script setup lang="ts">
// Phase 1 · 데이터를 한눈에 — 평균·중앙값·최빈값
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import MeanMedianExplorer from '@/components/MeanMedianExplorer.vue'
import HistogramBuilder from '@/components/HistogramBuilder.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch1')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 1</p>
    <h1 class="mb-4 text-3xl font-bold">데이터를 한눈에 — 평균·중앙값·최빈값 📊</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      통계의 첫걸음은 거창한 공식이 아니라 <b>"숫자 무더기를 한눈에 보이게 요약하기"</b>입니다.
      시험 점수 40개, 연봉 100개를 다 읽을 수는 없으니까요. 이번 챕터에서는 데이터를
      숫자 하나로 대표하는 세 가지 방법과, 그중 <b>평균이 우리를 속이는 순간</b>을 배웁니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>평균 · 중앙값 · 최빈값</b>이 각각 무엇이고 언제 쓰는지 구분한다</li>
        <li><b>이상치</b>가 평균을 끌고 가는 것을 직접 움직여 확인한다 ("평균 연봉"의 함정)</li>
        <li><b>히스토그램</b>으로 데이터의 "모양"을 보고, 모양과 대푯값의 관계를 읽는다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 대푯값 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 대푯값 — 숫자 무더기의 대표 선수</h2>
    <ReviewFlag id="ch1-s1" chapter="ch1" label="1. 대푯값 — 숫자 무더기의 대표 선수" />
    <p class="leading-relaxed text-slate-700">
      친구가 "너희 반 시험 어땠어?"라고 물으면 40명의 점수를 다 불러주진 않죠.
      "평균 72점 정도?" 한마디로 요약합니다. 이렇게 <b>데이터 전체를 대표하는 숫자 하나</b>를
      <b>대푯값</b>이라고 해요. 대표 선수를 뽑는 방법이 하나가 아니라 <b>세 가지</b>라는 게
      이번 챕터의 핵심입니다.
    </p>

    <ConceptCard tone="note" title="새 용어 — 대푯값">
      <b>대푯값(representative value)</b>: 데이터 전체를 하나의 숫자로 요약한 값.
      대표적으로 <b>평균 · 중앙값 · 최빈값</b> 세 가지가 있고, 데이터 성격에 따라
      어울리는 대표가 달라집니다.
    </ConceptCard>

    <!-- 2. 평균 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 평균 — 다 더해서 나누기</h2>
    <ReviewFlag id="ch1-s2" chapter="ch1" label="2. 평균 — 다 더해서 나누기" />
    <p class="leading-relaxed text-slate-700">
      가장 익숙한 대푯값입니다. <b>전부 더한 다음 개수로 나눈다</b> — 이게 전부예요.
      예를 들어 다섯 명의 점수가 4, 7, 7, 9, 13 이라면:
    </p>
    <MathBlock expr="\text{평균} = \dfrac{4 + 7 + 7 + 9 + 13}{5} = \dfrac{40}{5} = 8" />

    <ConceptCard tone="note" title="새 기호 — x̄ 와 Σ">
      <ul class="list-disc space-y-2 pl-5 text-sm">
        <li>
          <MathBlock inline expr="\bar{x}" /> &nbsp;<b>읽는 법</b>: "엑스 바" ·
          <b>뜻</b>: 데이터 <MathBlock inline expr="x" /> 들의 <b>평균</b>. 글자 위의 가로줄(bar)이
          "평평하게 고르게 폈다"는 이미지예요.
        </li>
        <li>
          <MathBlock inline expr="\sum" /> &nbsp;<b>읽는 법</b>: "시그마(Sigma)" ·
          <b>뜻</b>: "<b>다 더하라</b>"는 명령. <MathBlock inline expr="\sum_{i=1}^{n} x_i" /> 는
          "1번째부터 <MathBlock inline expr="n" />번째 데이터까지 전부 더하라"입니다.
          그래서 평균 공식은 <MathBlock inline expr="\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i" /> —
          말로 풀면 그냥 "다 더해서 <MathBlock inline expr="n" /> 으로 나눠라"예요.
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="tip" title="평균의 이미지 — 시소의 받침점">
      수직선 위에 데이터를 같은 무게의 구슬로 올려놓으면, <b>평균은 시소가 수평이 되는
      받침점(무게중심)</b>입니다. 그래서 아주 무거운 구슬(극단값) 하나가 멀리 놓이면
      받침점이 그쪽으로 훅 끌려가요 — 잠시 뒤에 눈으로 확인합니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="3, 5, 10 의 평균은?"
      type="numeric"
      :answer="6"
      :hints="['먼저 다 더하세요: 3 + 5 + 10 = 18.', '18 을 개수 3 으로 나누면?']"
      explanation="(3 + 5 + 10) ÷ 3 = 18 ÷ 3 = 6 입니다."
    />

    <!-- 3. 중앙값 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 중앙값 — 줄 세워서 한가운데</h2>
    <ReviewFlag id="ch1-s3" chapter="ch1" label="3. 중앙값 — 줄 세워서 한가운데" />
    <p class="leading-relaxed text-slate-700">
      <b>중앙값</b>은 데이터를 <b>작은 것부터 큰 것까지 줄 세운 뒤 딱 가운데 서 있는 값</b>입니다.
      [4, 7, <b>7</b>, 9, 13] 처럼 5개면 3번째 값인 <b>7</b>이 중앙값. 값의 크기가 아니라
      <b>순번</b>만 보기 때문에, 양 끝의 값이 아무리 커지거나 작아져도 흔들리지 않아요.
    </p>

    <ConceptCard tone="note" title="새 용어 — 중앙값 (짝수 개일 때 주의)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>중앙값(median)</b>: 크기순으로 정렬했을 때 한가운데 값.</li>
        <li>
          데이터가 <b>짝수 개</b>면 한가운데가 두 개죠 — 그 <b>둘의 평균</b>을 씁니다.
          예: [2, 4, 6, 10] → 가운데 두 값 4와 6 의 평균 = <b>5</b>.
        </li>
        <li>계산 전에 <b>반드시 정렬</b>부터! [7, 1, 5] 의 중앙값은 1이 아니라, 정렬한 [1, 5, 7] 의 가운데인 5 입니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="1, 3, 5, 9 의 중앙값은?"
      type="numeric"
      :answer="4"
      :hints="['개수가 4개(짝수)입니다. 가운데 두 값은?', '3 과 5 의 평균 = ?']"
      explanation="짝수 개이므로 가운데 두 값 3, 5 의 평균인 4 가 중앙값입니다."
    />

    <!-- 4. 최빈값 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 최빈값 — 가장 자주 나오는 값</h2>
    <ReviewFlag id="ch1-s4" chapter="ch1" label="4. 최빈값 — 가장 자주 나오는 값" />
    <p class="leading-relaxed text-slate-700">
      <b>최빈값</b>은 말 그대로 <b>가장 빈번하게 등장하는 값</b>입니다. [4, <b>7, 7</b>, 9, 13] 에서는
      7 이 두 번 나오니 최빈값은 7. 신발 가게 사장님에게 가장 중요한 건 평균 사이즈(265.3mm 같은,
      아무도 안 신는 값)가 아니라 <b>가장 많이 팔리는 사이즈</b>죠 — 그게 최빈값입니다.
      숫자가 아닌 데이터(가장 흔한 혈액형, 가장 많이 팔린 색상)에도 쓸 수 있는 유일한 대푯값이에요.
    </p>

    <!-- 5. 인터랙티브 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 움직여 보기 — 평균은 끌려가고 중앙값은 버틴다</h2>
    <ReviewFlag id="ch1-s5" chapter="ch1" label="5. 직접 움직여 보기 — 평균 vs 중앙값" />
    <p class="leading-relaxed text-slate-700">
      아래 수직선의 보라 점(데이터)을 끌어 보세요. 특히 <b>⚡ 이상치 만들기</b> 버튼을 눌러
      점 하나를 95 로 보냈을 때 — <b class="text-rose-600">빨간 받침점(평균)</b>과
      <b class="text-blue-600">파란 삼각형(중앙값)</b> 중 누가 크게 움직이나요?
    </p>

    <MeanMedianExplorer />

    <ConceptCard tone="note" title="새 용어 — 이상치">
      <b>이상치(outlier)</b>: 나머지 값들과 동떨어진 극단적인 값. 입력 실수일 수도, 진짜 특이한
      사례(회장님 연봉)일 수도 있어요. 평균은 이상치에 <b>크게 끌려가고</b>, 중앙값은
      <b>거의 영향받지 않습니다</b> — 이런 성질을 "중앙값은 <b>강건(robust)</b>하다"고 말해요.
    </ConceptCard>

    <!-- 6. 평균의 함정 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">6. "평균 연봉 6.3억"의 함정</h2>
    <ReviewFlag id="ch1-s6" chapter="ch1" label="6. 평균 연봉의 함정" />
    <p class="leading-relaxed text-slate-700">
      직원 4명과 회장님이 있는 회사의 연봉(만원)이 [3000, 3500, 4000, 4500, 300000] 이라고 해봅시다.
      회장님 연봉은 30억이에요. 평균을 내 볼까요?
    </p>
    <MathBlock expr="\text{평균} = \dfrac{3000 + 3500 + 4000 + 4500 + 300000}{5} = \dfrac{315000}{5} = 63000\text{만원} = 6.3\text{억}" />
    <p class="leading-relaxed text-slate-700">
      "우리 회사 평균 연봉은 6.3억입니다!" — 거짓말은 아니지만 <b>아무도 6.3억을 받지 않죠</b>.
      중앙값은 정렬해서 가운데인 <b>4000만원</b> — 이쪽이 "보통 직원"의 현실에 훨씬 가깝습니다.
    </p>

    <ConceptCard tone="warn" title="함정 — 평균만 보면 속는다">
      연봉·집값·유튜브 조회수처럼 <b>한쪽으로 극단값이 있는 데이터</b>에서 평균은 소수의 거대한
      값에 끌려 올라갑니다. 뉴스의 "평균 ○○"이 내 체감과 다르다면 <b>중앙값</b>을 찾아보세요.
      통계가 거짓말을 한 게 아니라, <b>대표 선수를 잘못 뽑은 것</b>뿐입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="연봉처럼 극단값이 섞인 데이터에서 '보통 사람'을 대표하기에 가장 알맞은 값은?"
      :choices="['평균', '중앙값', '최댓값', '합계']"
      :answer="1"
      :hints="['이상치에 끌려가지 않고 버티는 대푯값이 무엇이었죠?']"
      explanation="중앙값입니다. 순번만 보므로 극단값이 있어도 거의 움직이지 않아요."
    />

    <!-- 7. 히스토그램 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">7. 히스토그램 — 데이터의 "모양" 보기</h2>
    <ReviewFlag id="ch1-s7" chapter="ch1" label="7. 히스토그램 — 데이터의 모양 보기" />
    <p class="leading-relaxed text-slate-700">
      대푯값이 데이터를 숫자 하나로 줄인다면, <b>히스토그램</b>은 데이터 전체의 <b>모양</b>을
      보여줍니다. 값들을 구간별로 묶어 "각 구간에 몇 개 들어 있나"를 막대로 세운 그림이에요.
      아래에서 <b>계급 폭 슬라이더</b>를 움직여 보세요.
    </p>

    <ConceptCard tone="note" title="새 용어 — 히스토그램과 계급">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>계급(bin)</b>: 데이터를 묶는 구간. 예: 키 160~165cm, 165~170cm, …</li>
        <li><b>도수(frequency)</b>: 각 계급에 들어 있는 데이터의 개수.</li>
        <li><b>히스토그램(histogram)</b>: 계급을 가로축, 도수를 막대 높이로 그린 그림. 데이터의
          <b>분포</b>(어떤 값 근처에 얼마나 모여 있는지를 나타내는 전체적인 '모양')가 한눈에
          보입니다 — 가운데가 볼록한지, 한쪽으로 치우쳤는지.</li>
      </ul>
    </ConceptCard>

    <HistogramBuilder />

    <ConceptCard tone="tip" title="모양과 대푯값의 관계">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>좌우 대칭</b>인 분포(키 등) → 평균 ≈ 중앙값 (위 그래프에서 빨강·파랑 선이 거의 겹치죠).</li>
        <li><b>오른쪽 꼬리가 긴</b> 분포(연봉·집값) → 꼬리의 큰 값들이 평균을 끌어올려 <b>평균 &gt; 중앙값</b>.</li>
        <li>반대로 <b>왼쪽 꼬리가 길면</b> 평균 &lt; 중앙값. 평균과 중앙값의 <b>차이</b>가 분포의 치우침을 알려주는 힌트!</li>
      </ul>
    </ConceptCard>

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 데이터 요약은 모든 머신러닝의 첫 단계</h2>
    <ReviewFlag id="ch1-ai" chapter="ch1" label="🤖 데이터 요약은 ML 의 첫 단계" />
    <p class="leading-relaxed text-slate-700">
      AI 개발자가 데이터를 받으면 제일 먼저 하는 일이 바로 오늘 배운 것들입니다 —
      평균·중앙값을 찍어 보고, 히스토그램으로 분포 모양을 보고, 이상치를 찾아내는 것.
      이 과정을 <b>탐색적 데이터 분석(EDA)</b>이라고 불러요. 데이터의 생김새를 모르고
      모델부터 만드는 건, 재료를 안 보고 요리하는 것과 같거든요.
    </p>

    <ConceptCard tone="goal" title="평균 = 가장 단순한 예측 모델 (베이스라인)">
      <ul class="list-disc space-y-2 pl-5">
        <li>내일 방문자 수를 예측해야 한다면? 가장 단순한 모델은 <b>"무조건 지금까지의 평균"</b>이라고
          답하는 것 — 이걸 <b>베이스라인(baseline)</b>이라고 합니다.</li>
        <li>어떤 화려한 AI 모델도 <b>이 평균 예측보다 나아야</b> 존재 가치가 있어요.
          "모델 성능이 베이스라인을 이겼나?"가 ML 의 국룰 질문입니다.</li>
        <li>10장에서 만들 첫 머신러닝 모델(회귀)도 결국 "평균보다 얼마나 더 잘 맞히나"의 게임이에요.</li>
      </ul>
    </ConceptCard>

    <!-- 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">8. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="평균·중앙값·최빈값 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="2, 4, 9 의 평균은?"
        type="numeric"
        :answer="5"
        :hints="['(2 + 4 + 9) ÷ 3.']"
        explanation="합 15 를 개수 3 으로 나누면 5 입니다."
      />
      <Quiz
        difficulty="easy"
        question="중앙값은 데이터를 크기순으로 정렬했을 때 한가운데에 오는 값이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 값의 크기가 아니라 '가운데 순번'을 보는 대푯값이에요."
      />
      <Quiz
        difficulty="easy"
        question="데이터에서 가장 자주 나오는 값을 부르는 이름은?"
        :choices="['평균', '중앙값', '최빈값', '이상치']"
        :answer="2"
        :hints="['가장 「빈」번한 값.']"
        explanation="최빈값(mode)입니다. 신발 가게의 '제일 잘 나가는 사이즈'죠."
      />
      <Quiz
        difficulty="easy"
        question="7, 1, 5 의 중앙값은?"
        type="numeric"
        :answer="5"
        :hints="['먼저 크기순으로 정렬하세요: 1, 5, 7.', '정렬한 뒤 가운데 값은?']"
        explanation="정렬하면 [1, 5, 7] — 가운데 값은 5 입니다. 정렬을 잊지 마세요!"
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="4, 7, 7, 9, 13 의 평균을 단계별로 구하세요."
        :steps="[
          { lhs: '4 + 7 + 7 + 9 + 13', answer: 40 },
          { lhs: '\\text{데이터 개수}', answer: 5 },
          { lhs: '\\text{평균} = 40 \\div 5', answer: 8 },
        ]"
        :hints="['먼저 전부 더하세요.', '평균 = 합 ÷ 개수.']"
        explanation="합 40 ÷ 개수 5 = 평균 8. 참고로 이 데이터의 중앙값과 최빈값은 둘 다 7 이에요."
      />
      <Quiz
        difficulty="medium"
        question="4, 7, 7, 9, 13 의 최빈값은?"
        type="numeric"
        :answer="7"
        :hints="['두 번 나오는 값이 있어요.']"
        explanation="7 이 두 번 등장하므로 최빈값은 7 입니다."
      />
      <Quiz
        difficulty="medium"
        question="2, 4, 6, 10 의 중앙값은?"
        type="numeric"
        :answer="5"
        :hints="['개수가 짝수(4개)입니다. 가운데 두 값은 4 와 6.', '가운데 두 값의 평균을 구하세요.']"
        explanation="짝수 개이므로 가운데 두 값 4, 6 의 평균 = 5 입니다."
      />
      <Quiz
        difficulty="medium"
        question="어느 회사 연봉 데이터에 회장님의 수십억 연봉이 섞여 있다. 옳은 설명은?"
        :choices="[
          '평균이 중앙값보다 훨씬 커진다',
          '중앙값이 평균보다 훨씬 커진다',
          '평균과 중앙값이 똑같아진다',
          '최빈값이 수십억이 된다',
        ]"
        :answer="0"
        :hints="['평균은 극단값에 끌려가고, 중앙값은 버팁니다.']"
        explanation="극단적으로 큰 값은 평균을 끌어올리지만 중앙값은 거의 그대로 — 그래서 평균 ≫ 중앙값이 됩니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="오른쪽으로 꼬리가 긴 분포(연봉, 집값 등)에서 보통 성립하는 것은?"
        :choices="['평균 > 중앙값', '평균 < 중앙값', '평균 = 중앙값', '중앙값이 항상 0']"
        :answer="0"
        :hints="['꼬리쪽의 큰 값들이 평균을 어느 방향으로 끌고 갈까요?']"
        explanation="오른쪽 꼬리의 큰 값들이 평균을 끌어올려 평균 > 중앙값이 됩니다. 평균과 중앙값의 차이로 분포의 치우침을 짐작할 수 있어요."
      />
      <StepQuiz
        difficulty="hard"
        question="다섯 명의 평균 점수가 8점이었는데, 8점인 한 명이 전학을 갔습니다. 남은 네 명의 합과 평균을 구하세요."
        :steps="[
          { lhs: '\\text{다섯 명의 총합} = 8 \\times 5', answer: 40 },
          { lhs: '\\text{남은 네 명의 합} = 40 - 8', answer: 32 },
          { lhs: '\\text{남은 평균} = 32 \\div 4', answer: 8 },
        ]"
        :hints="['평균 × 개수 = 총합. 여기서 출발하세요.', '평균과 똑같은 값이 빠지면 평균은 어떻게 될까요?']"
        explanation="평균과 같은 8점이 빠지면 평균은 그대로 8! '평균 × 개수 = 총합' 관계는 아주 자주 쓰입니다."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch01_mean_median.ipynb</code> 에서 평균·중앙값·최빈값을 직접 계산해 보고
      <code>np.mean</code>, <code>np.median</code> 과 비교합니다. 이상치를 넣었다 뺐다 하며
      평균이 얼마나 출렁이는지도 실험해요. (선택 사항)
    </ConceptCard>

    <div
      v-if="progress.isDone('ch1')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 1 완료. 데이터의 "대표"를 뽑을 수 있게 됐습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        그런데 평균이 같아도 데이터 모양이 전혀 다를 수 있어요. 다음은 <b>흩어짐 재기 — 분산과 표준편차</b>입니다.
      </p>
      <RouterLink
        to="/ch/ch2"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 흩어짐 재기 →
      </RouterLink>
    </div>
  </article>
</template>
