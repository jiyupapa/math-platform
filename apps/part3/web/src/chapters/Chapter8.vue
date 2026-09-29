<script setup lang="ts">
// Phase 8 · 표본으로 전체 알기 — 추정과 신뢰구간 (여론조사의 ±3%p 읽는 법)
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import CISimulator from '@/components/CISimulator.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch8')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">8장</p>
    <h1 class="mb-4 text-3xl font-bold">표본으로 전체 알기 — 추정과 신뢰구간 📊</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      "지지율 47%, 오차범위 ±3.1%p." 뉴스에서 매일 보는 문장이지만 정확히 읽을 줄 아는 사람은
      드뭅니다. 이번 챕터에서는 6장(정규분포의 95%)과 7장(표준오차)을 조립해서, <b>일부만 조사하고
      전체를 책임감 있게 말하는 법</b>을 배웁니다. 이 챕터가 끝나면 저 문장이 완전히 읽힐 거예요.
    </p>

    <ConceptCard tone="note" title="새 단위: %p (퍼센트포인트)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>읽는 법</b>: "퍼센트포인트" · <b>뜻</b>: 퍼센트(%)끼리 뺀 <b>차이</b>를 나타내는 단위.</li>
        <li>지지율이 45% 에서 47% 가 되면 <b>2%p</b> 오른 것입니다 (47 − 45 = 2).</li>
        <li>"2% 올랐다"와는 다릅니다. 45% 의 2% 는 겨우 0.9%p 거든요. 그래서 %끼리의
          차이를 말할 때는 꼭 <b>%p</b> 를 씁니다. 오차범위 ±3.1%p 도 "지지율에서 3.1 을
          더하고 뺀 범위"라는 뜻이에요.</li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>모집단/표본, 모수/통계량</b>을 구분한다</li>
        <li><b>95% 신뢰구간</b> <MathBlock inline expr="\bar{x} \pm 1.96\cdot\sigma/\sqrt{n}" /> 을 계산하고, 그 <b>정확한 의미</b>를 안다</li>
        <li>여론조사의 <b>오차범위 ±3.1%p</b> 가 어디서 나온 숫자인지 직접 계산한다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 모집단과 표본 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 모집단과 표본: 국 한 숟갈로 간 보기</h2>
    <ReviewFlag id="ch8-s1" chapter="ch8" label="1. 모집단과 표본" />
    <p class="leading-relaxed text-slate-700">
      찌개 간을 볼 때 냄비를 다 마시지 않죠. <b>잘 저은 뒤 한 숟갈</b>이면 충분합니다.
      통계도 똑같아요. 전 국민 5천만 명의 생각(전체)을 알고 싶지만 다 물어볼 수 없으니,
      <b>무작위로 뽑은 1,000명</b>(한 숟갈)으로 전체를 추측합니다. 여기서 용어 네 개만 정리해 둡시다.
    </p>

    <ConceptCard tone="note" title="새 용어 4종: 모집단 · 표본 · 모수 · 통계량">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>모집단(population)</b>: 알고 싶은 <b>전체</b>. 예: 전체 유권자.</li>
        <li><b>표본(sample)</b>: 실제로 조사한 <b>일부</b>. 예: 응답자 1,000명. (무작위로 뽑아야 '잘 저은 국'이 됩니다)</li>
        <li><b>모수(parameter)</b>: 모집단의 참값. 예: 진짜 지지율, 모평균 <MathBlock inline expr="\mu" />. <b>신만 아는 숫자</b>예요.</li>
        <li><b>통계량(statistic)</b>: 표본에서 계산한 값. 예: 표본 지지율, 표본평균 <MathBlock inline expr="\bar{x}" />. 손에 쥔 건 이것뿐.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'응답자 1,000명에게서 계산한 지지율 47%' 는 다음 중 무엇인가요?"
      :choices="['모집단', '모수 (참값)', '통계량 (표본에서 잰 값)', '신뢰구간']"
      :answer="2"
      :hints="['표본에서 「계산해 낸 값」을 부르는 말이에요.']"
      explanation="표본에서 계산한 값이므로 통계량입니다. 진짜 지지율(모수)은 여전히 모르는 상태예요."
    />

    <!-- 2. 점추정의 한계 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. "정확히 47%!" 라고 말할 수 있을까</h2>
    <ReviewFlag id="ch8-s2" chapter="ch8" label="2. 점추정의 한계" />
    <p class="leading-relaxed text-slate-700">
      표본 지지율이 47% 로 나왔으니 "전체 지지율 = 47%" 라고 발표하면 될까요? 7장에서 배웠듯
      <b>표본평균(통계량)은 뽑을 때마다 흔들립니다.</b> 다른 1,000명에게 물었으면 45.8% 나 48.3% 가
      나왔을 거예요. 숫자 하나로 딱 찍는 것(<b>점추정</b>)은 거의 확실히 빗나갑니다.
    </p>
    <p class="leading-relaxed text-slate-700">
      그래서 통계학자는 정직하게 <b>범위로</b> 말합니다: "참값은 대략 <b>이 구간 안</b>에 있을 겁니다.
      이 방법은 100번 중 95번 맞습니다." 이것이 <b>구간추정</b>, 그 구간이 <b>신뢰구간</b>입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 점추정 / 구간추정 / 신뢰구간">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>점추정</b>: 모수를 숫자 하나로 추측. (간단하지만 오차를 말해주지 않음)</li>
        <li><b>구간추정</b>: 모수가 들어있을 법한 <b>범위</b>로 추측.</li>
        <li><b>신뢰구간(confidence interval)</b>: 그 범위. "95% 신뢰구간"처럼 <b>방법의 적중률</b>(신뢰수준)과 함께 말합니다.</li>
      </ul>
    </ConceptCard>

    <!-- 3. 공식 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 95% 신뢰구간: 배운 부품 두 개로 조립</h2>
    <ReviewFlag id="ch8-s3" chapter="ch8" label="3. 95% 신뢰구간 공식" />
    <p class="leading-relaxed text-slate-700">
      공식은 이미 다 배운 부품의 조립입니다. 7장의 중심극한정리에 따르면 표본평균
      <MathBlock inline expr="\bar{x}" /> 는 참값 <MathBlock inline expr="\mu" /> 를 중심으로
      표준오차 <MathBlock inline expr="\sigma/\sqrt{n}" /> 만큼 흔들리는 <b>종 모양</b>이고,
      6장의 정규분포에서 종 모양의 <b>95% 는 중심 ± 약 2σ(정확히 1.96σ)</b> 안에 있었죠. 그러므로:
    </p>
    <MathBlock expr="\text{95\% 신뢰구간} = \bar{x} \; \pm \; 1.96 \times \dfrac{\sigma}{\sqrt{n}}" />

    <ConceptCard tone="tip" title="공식이 아니라 조립품이에요">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>1.96</b> ← 6장: 정규분포에서 가운데 95% 를 담는 폭 (±약 2σ의 정확한 값).</li>
        <li><MathBlock inline expr="\sigma/\sqrt{n}" /> ← 7장: 표본평균의 표준오차.</li>
        <li>둘을 곱한 <MathBlock inline expr="1.96\cdot\sigma/\sqrt{n}" /> 이 뉴스의 <b>"오차범위"</b>입니다.</li>
      </ul>
      <p class="mt-2 text-sm text-slate-500">
        (엄밀히는 모집단의 σ 를 모르므로 표본의 표준편차로 대신하지만, 이 과정에서는 σ 를 아는 경우로
        단순화합니다. n 이 크면 결과가 거의 같아요.)
      </p>
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      예제 하나를 해 봅시다. 어느 학교 학생 100명을 무작위로 재니 평균 키
      <MathBlock inline expr="\bar{x} = 170\,\mathrm{cm}" />, 모집단 표준편차는
      <MathBlock inline expr="\sigma = 8\,\mathrm{cm}" /> 로 알려져 있습니다. 표준오차는
      <MathBlock inline expr="8/\sqrt{100} = 0.8" />, 오차범위는
      <MathBlock inline expr="1.96 \times 0.8 \approx 1.57" />. 따라서 전교생 평균 키의 95% 신뢰구간은
      약 <b>[168.4cm, 171.6cm]</b> 입니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="신뢰구간 공식의 1.96 은 어디서 온 숫자인가요?"
      :choices="[
        '정규분포에서 가운데 95% 가 평균 ±1.96σ 안에 들어있어서',
        '원주율 π 의 근사값이라서',
        '표본 크기가 보통 1.96 배씩 늘어서',
        '통계학자들이 임의로 정한 의미 없는 수라서',
      ]"
      :answer="0"
      :hints="['6장의 68-95-99.7 규칙에서 「±2σ 에 약 95%」였죠. 1.96 은 그 정확한 값.']"
      explanation="6장의 정규분포 성질에서 온 숫자입니다. 90% 를 원하면 1.645, 99% 를 원하면 2.576 을 씁니다."
    />

    <!-- 4. 시뮬레이터 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 구간 100개를 직접 만들어 보기</h2>
    <ReviewFlag id="ch8-s4" chapter="ch8" label="4. 신뢰구간 100개 시뮬레이션" />
    <p class="leading-relaxed text-slate-700">
      "95% 신뢰"가 무슨 뜻인지 눈으로 봅시다. 아래 시뮬레이터는 <b>참값 μ=50 을 아는 신의 시점</b>에서,
      표본조사를 100번 반복해 신뢰구간을 100개 만듭니다. 몇 개가 참값을 놓치는지 세어 보세요.
      95% 수준이면 <b>놓침이 평균 5개꼴</b>이어야 합니다.
    </p>

    <CISimulator />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="95% 신뢰수준으로 신뢰구간을 100번 만들면, 평균적으로 5개 정도는 참값을 놓친다."
      type="truefalse"
      :answer="0"
      :hints="['시뮬레이터의 빨간 막대 수를 세어 보세요.']"
      explanation="참입니다. '95% 신뢰'는 이 방법의 적중률이 95% 라는 뜻이라, 100번 중 5번꼴로는 불운하게 참값을 놓칩니다."
    />

    <!-- 5. 95%의 진짜 뜻 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. "95%" 의 진짜 뜻: 가장 흔한 오해</h2>
    <ReviewFlag id="ch8-s5" chapter="ch8" label="5. 95% 신뢰의 정확한 의미" />

    <ConceptCard tone="warn" title="'이 구간에 참값이 있을 확률 95%' 가 아닙니다">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          구간 [168.4, 171.6] 을 이미 얻은 뒤에는, 참값은 <b>정해진 숫자</b>라서 이 구간에
          있거나(100%) 없거나(0%) 둘 중 하나입니다. 주사위를 이미 던져 컵으로 덮어둔 상황과 같아요.
        </li>
        <li>
          95% 는 <b>구간을 만드는 방법의 성적표</b>입니다: 같은 방법으로 표본을 100번 뽑아 구간을
          100개 만들면 <b>그중 약 95개가 참값을 포함</b>한다. 방금 시뮬레이터에서 본 그대로예요.
        </li>
        <li>우연인 것은 (신이 정해둔) 참값이 아니라 <b>뽑힌 표본과 구간</b> 쪽입니다.</li>
      </ul>
    </ConceptCard>

    <!-- 6. 여론조사 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">6. 여론조사 읽는 법: ±3.1%p 직접 계산</h2>
    <ReviewFlag id="ch8-s6" chapter="ch8" label="6. 여론조사 오차범위 계산" />
    <p class="leading-relaxed text-slate-700">
      지지율 같은 비율 조사에서 비율의 표준오차는 <MathBlock inline expr="\sqrt{p(1-p)/n}" /> 입니다.
      5장에서 <b>성공 횟수의 분산이 <MathBlock inline expr="np(1-p)" /></b> 였죠. 비율은 횟수를
      <MathBlock inline expr="n" /> 으로 나눈 값인데, 값을 n으로 나누면 흩어짐(표준편차)도 n분의 1이
      되므로 그 제곱인 <b>분산은 <MathBlock inline expr="n^2" /> 으로</b> 나뉩니다. 그래서
      <MathBlock inline expr="np(1-p) \div n^2 = p(1-p)/n" /> 이 비율의 분산이
      되고, 그 제곱근이 표준오차예요. 조사기관은 가장 오차가 커지는
      <MathBlock inline expr="p = 0.5" /> 로 놓고 계산합니다. 뉴스 단골 숫자 n=1,000 을 넣어
      직접 구해 보세요:
    </p>

    <StepQuiz
      difficulty="medium"
      question="n=1000 명 여론조사의 95% 오차범위를 단계별로 구하세요. (p=0.5 로 가정)"
      :steps="[
        { lhs: '0.5 \\times 0.5', answer: 0.25, tolerance: 0.0001 },
        { lhs: '0.25 \\div 1000', answer: 0.00025, tolerance: 0.00001 },
        { lhs: '\\sqrt{0.00025}', answer: 0.0158, tolerance: 0.0005 },
        { lhs: '1.96 \\times 0.0158', answer: 0.031, tolerance: 0.002 },
      ]"
      :hints="['순서: p(1−p) → n 으로 나누기 → 제곱근 → 1.96 곱하기.', '√0.00025 ≈ 0.0158 (계산기 없이 어림해도 좋아요).']"
      explanation="±0.031, 즉 ±3.1%p. 뉴스의 '표본 1,000명, 오차범위 ±3.1%p(95% 신뢰수준)'가 정확히 이 계산입니다."
    />

    <p class="leading-relaxed text-slate-700">
      이제 뉴스를 읽어 봅시다. <b>A 후보 47%, B 후보 45%, 오차범위 ±3.1%p</b>. 두 후보의 차이(2%p)가
      오차범위보다 작으니, 참 지지율은 B 가 앞설 가능성도 얼마든지 있습니다. 이럴 때 쓰는 표현이
      <b>"오차범위 내 접전"</b>이에요. 그리고 오차를 절반(±1.55%p)으로 줄이고 싶으면? 7장에서 배웠듯
      <MathBlock inline expr="\sqrt{n}" /> 때문에 표본이 <b>4배(4,000명)</b> 필요합니다.
    </p>

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 "정확도 87.3%" 도 표본으로 잰 추정치</h2>
    <ReviewFlag id="ch8-ai" chapter="ch8" label="🤖 모델 성능 지표의 오차범위" />
    <p class="leading-relaxed text-slate-700">
      AI 모델의 성적표도 사실은 여론조사와 똑같은 구조입니다. "이 모델의 정확도는 87.3%" 라는 말은
      <b>테스트셋(표본)</b>에서 잰 <b>통계량</b>이지, 세상 모든 데이터(모집단)에서의 참 성능(모수)이
      아니에요.
    </p>

    <ConceptCard tone="ai" title="벤치마크 점수를 통계학자의 눈으로">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          테스트셋이 1,000개라면 정확도의 오차범위는 대략 ±2~3%p라서 <b>모델 A 87.3% vs 모델 B 86.9%</b>
          같은 차이는 <b>오차범위 내 접전</b>일 수 있습니다. 소수점 경쟁은 통계적으로 무의미할 수 있어요.
        </li>
        <li>테스트셋이 클수록(√n) 성능 추정이 정밀해집니다. 벤치마크가 수만 문제로 만들어지는 이유.</li>
        <li>
          논문·리더보드에서 성능에 <b>± 오차</b>나 신뢰구간을 붙이는 것이 좋은 관행이고,
          그 차이가 진짜인지 판별하는 정식 도구가 다음 챕터의 <b>가설검정</b>입니다.
        </li>
      </ul>
    </ConceptCard>

    <!-- 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">7. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="추정과 신뢰구간: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="'전체 유권자 중 실제로 조사한 1,000명'을 부르는 말은?"
        :choices="['모집단', '표본', '모수', '신뢰수준']"
        :answer="1"
        explanation="실제로 조사한 일부가 표본(sample)입니다. 알고 싶은 전체가 모집단이에요."
      />
      <Quiz
        difficulty="easy"
        question="표본평균 같은 통계량은 표본을 새로 뽑을 때마다 달라질 수 있다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 이 흔들림(표준오차) 때문에 점추정 대신 구간으로 말하는 거예요."
      />
      <Quiz
        difficulty="easy"
        question="σ=5 인 모집단에서 n=25 일 때 표본평균의 표준오차는?"
        type="numeric"
        :answer="1"
        :hints="['σ ÷ √n = 5 ÷ √25.']"
        explanation="5 ÷ 5 = 1."
      />
      <Quiz
        difficulty="easy"
        question="신뢰수준을 95% 에서 99% 로 올리면 신뢰구간은 어떻게 되나요?"
        :choices="['더 넓어진다', '더 좁아진다', '변하지 않는다', '항상 참값과 일치하게 된다']"
        :answer="0"
        :hints="['더 자주 맞히려면 그물을 어떻게 쳐야 할까요? (z: 1.96 → 2.576)']"
        explanation="적중률을 높이려면 구간을 넓게 쳐야 합니다. 99% 는 z=2.576 으로 더 넓어요. 정밀함과 적중률은 맞바꾸는 관계입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="학생 64명을 재니 평균 키 x̄=170cm, σ=8cm 로 알려져 있습니다. 95% 신뢰구간의 상한(가장 큰 쪽 끝)을 단계별로 구하세요."
        :steps="[
          { lhs: '\\sqrt{64}', answer: 8 },
          { lhs: 'SE = 8 \\div 8', answer: 1 },
          { lhs: '1.96 \\times SE', answer: 1.96, tolerance: 0.001 },
          { lhs: '170 + 1.96', answer: 171.96, tolerance: 0.001 },
        ]"
        :hints="['상한 = x̄ + 1.96 × (σ/√n).', '√64 = 8 이라 표준오차가 딱 1 이에요.']"
        explanation="구간은 [168.04, 171.96]. '전교생 평균 키는 대략 168~172cm, 이 방법은 100번 중 95번 맞는다'고 말할 수 있습니다."
      />
      <Quiz
        difficulty="medium"
        question="'95% 신뢰구간'의 올바른 해석은?"
        :choices="[
          '이미 얻은 이 구간 안에 참값이 있을 확률이 95% 다',
          '같은 방법으로 100번 조사하면 약 95번은 구간이 참값을 포함한다',
          '데이터의 95% 가 이 구간 안에 들어있다',
          '참값이 95% 의 확률로 이리저리 움직인다',
        ]"
        :answer="1"
        :hints="['95% 는 「방법의 성적표」였어요.']"
        explanation="신뢰수준은 구간을 만드는 방법의 장기 적중률입니다. 개별 구간에 대해 확률을 말하는 건 흔한 오해예요."
      />
      <Quiz
        difficulty="medium"
        question="구간 [168.4, 171.6] 을 이미 얻었다면 '참 평균이 이 구간에 있을 확률은 95%' 라고 말하는 것이 정확한 표현이다."
        type="truefalse"
        :answer="1"
        :hints="['참값은 이미 정해진 숫자예요. 우연인 건 구간 쪽.']"
        explanation="거짓입니다. 얻어진 구간과 참값의 관계는 이미 결정돼 있어요(포함이거나 아니거나). 95% 는 방법의 적중률입니다."
      />
      <Quiz
        difficulty="medium"
        question="오차범위를 절반으로 줄이려면 표본 크기를 몇 배로 늘려야 하나요?"
        type="numeric"
        :answer="4"
        :hints="['오차는 1/√n 에 비례해요.']"
        explanation="√n 이 2배가 되어야 하므로 n 은 4배. 1,000명 조사의 ±3.1%p 를 ±1.55%p 로 줄이려면 4,000명이 필요합니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="여론조사(오차범위 ±3.1%p)에서 A 후보 47%, B 후보 45% 가 나왔습니다. 가장 정확한 해석은?"
        :choices="[
          'A 가 앞선다고 단정할 수 있다',
          '차이가 오차범위 안이라 우열을 단정할 수 없다 (접전)',
          'B 가 실제로는 앞서 있다',
          '조사가 잘못되었다',
        ]"
        :answer="1"
        :hints="['차이 2%p 와 오차범위 3.1%p 를 비교해 보세요.']"
        explanation="두 수치의 차이(2%p)가 오차범위(±3.1%p)보다 작으므로 '오차범위 내 접전'입니다. 참값은 B 가 앞설 수도 있어요."
      />
      <Quiz
        difficulty="hard"
        question="n=1000 일 때 오차범위가 ±3.1%p 였다면, n=4000 으로 늘리면 오차범위는 약 ±몇 %p 가 될까요?"
        type="numeric"
        :answer="1.55"
        :tolerance="0.06"
        :hints="['n 이 4배 → 오차는 절반.', '3.1 ÷ 2.']"
        explanation="√4 = 2 배 정밀해지므로 3.1 ÷ 2 ≈ ±1.55%p. 표본을 4배 늘려야 오차가 겨우 절반, 이것이 √n 의 저주입니다."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch08_confidence_interval.ipynb</code> 에서 신뢰구간 100개를 직접 만들어
      참값을 놓친 구간을 세어 보고, scipy 로 z 값(1.96)을 계산하고, n 에 따라 구간 폭이
      좁아지는 그래프와 여론조사 오차범위 계산을 해볼 수 있어요.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch8')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">
        8장 완료. 이제 여론조사와 벤치마크 점수를 통계학자의 눈으로 읽을 수 있습니다.
      </p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 "그 차이, 우연 아니야?"를 판정하는 <b>가설검정과 p값</b>. A/B 테스트의 핵심입니다.
      </p>
      <RouterLink
        to="/ch/ch9"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터: 가설검정과 p값 →
      </RouterLink>
    </div>
  </article>
</template>
