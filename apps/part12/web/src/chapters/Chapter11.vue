<script setup lang="ts">
// 11장 — AI가 만드는 고리: 모델 붕괴(합성 데이터 재학습 = 꼬리가 사라지는 강화 루프, 실제 데이터 = 균형 루프),
// 보상 해킹(대리 지표를 쫓는 고리, KL 목줄 = 균형 루프), 데이터 플라이휠(강화 + 수확 체감·포화).
// 다시 쓰는 수학: 6부 5~6장(보상 해킹·KL 목줄), 6부 9장(아첨), 4부 12장(top-p), 3부 6장(정규분포).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import AiLoopsLab from '@/components/AiLoopsLab.vue'
import DiagramLegend from '@/components/DiagramLegend.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch11')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">11장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">AI가 만드는 고리 — 모델 붕괴·보상 해킹·플라이휠</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      지금까지의 고리는 사람과 조직이 만들었습니다. 이 장의 고리는 AI 모델이 만듭니다. 모델이 쓴 글로 다음 모델을 가르치는 고리,
      사람 취향을 흉내 낸 점수를 쫓는 고리, 사용자와 데이터와 품질이 서로를 키우는 고리. 셋 다 실무와 연구에서 실제로 문제가 되는
      구조이고, 저량·유량·피드백 루프로 읽으면 무엇이 위험하고 무엇이 브레이크인지 또렷해집니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"AI의 고리마다 무엇이 키우거나 깎고, 무엇이 붙잡는지 찾는다."</b> 모델 붕괴에서는 실제 데이터가, 보상 해킹에서는 KL 목줄이,
      플라이휠에서는 한계를 인정하는 계획이 브레이크(균형 루프)라는 것을 수치로 확인합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 세 개의 고리</h2>
    <ReviewFlag id="ch11-s1" chapter="ch11" label="1. 무대: 세 개의 고리" />
    <p class="leading-relaxed text-slate-700">
      첫째, 인터넷에 AI가 쓴 글이 늘면 다음 모델은 그 글로도 배웁니다. 모델은 흔한 표현을 주로 내놓으니(4부 12장의 top-p처럼 드문 쪽을
      잘라 내니) 세대를 거듭할수록 드문 사례가 사라지죠. 둘째, 6부의 조련(사후 학습)에서 모델은 보상 모델의 점수를 올리도록 학습하는데, 점수는 진짜
      품질의 흉내일 뿐이라 너무 세게 쫓으면 점수만 높은 답이 나옵니다. 셋째, 사용자·데이터·품질의 플라이휠은 3·7장에서 본 대로
      강화 루프지만 영원히 돌지는 않아요. 세 탭을 차례로 돌려 보세요.
    </p>
    <DetailsCard title="🔍 그림 기호 다시 보기">
      <p class="text-sm">
        기호를 처음부터 차근차근 보려면 <RouterLink to="/ch/ch1#ch1-sfd" class="font-semibold text-indigo-700 underline">1장 2절(저량-유량도)</RouterLink>과
        <RouterLink to="/ch/ch1#ch1-cld" class="font-semibold text-indigo-700 underline">3절(인과지도)</RouterLink>로 돌아가세요.
      </p>
      <p class="mt-3 text-sm font-semibold text-slate-700">인과지도</p>
      <DiagramLegend kind="cld" />
    </DetailsCard>

    <AiLoopsLab />

    <ConceptCard tone="tip" title="핵심 관찰: 결과를 정하는 것은 브레이크(균형 루프)의 설계">
      꼬리를 자른 합성 데이터만으로 배우면 분포의 폭이 세대마다 0.880배가 되어 <b>10세대 뒤 0.277</b>, 원래의 드문 사례는 거의 남지 않습니다.
      실제 데이터를 10% 섞으면 폭이 <b>0.574</b>, 30%면 <b>0.809</b>에서 멈춰요. 보상 해킹에서는 KL 목줄 β = 0.05면 진짜 품질이
      <b>57걸음에 2.5로 정점</b>을 찍고 300걸음에 −8.64까지 떨어지지만, β = 0.2면 최고치 2.5에서 안정됩니다. 너무 세게 묶으면(β = 1)
      0.9에서 멈추고요. 플라이휠은 12개월 뒤 계획 약 40,343명 대 실제 약 8,030명. 세 고리 모두 키우거나 깎는 힘의 크기보다
      <b>그 힘을 붙잡는 브레이크의 설계</b>가 결과를 정합니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="꼬리를 자른 합성 데이터만으로 세대를 거듭할 때, 실제 데이터를 매 세대 30% 섞으면 분포의 폭은?"
      :choices="['약 0.809에서 멈춘다', '계속 줄어 0이 된다', '1로 돌아간다', '오히려 커진다']"
      :answer="0"
      :hints="['실험 ①에서 섞는 비율을 30%로 놓고 세대를 늘려 보세요.']"
      explanation="실제 데이터가 매번 폭 1짜리 분포를 다시 넣어 주는 균형 루프 역할을 해서, 줄어드는 힘과 채우는 힘이 같아지는 0.809에서 평형이 됩니다(8장의 평형)."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="ch11-s2" chapter="ch11" label="2. 오늘의 발견에 이름표 달기" />
    <p class="leading-relaxed text-slate-700">모델 붕괴 장난감의 한 세대를 식으로 쓰면 이렇습니다(분산 v는 폭의 제곱).</p>
    <MathBlock expr="v_{g+1} = \alpha \cdot 1 + (1 - \alpha)\, c\, v_g, \qquad c \approx 0.774 \;(\text{폭} \times 0.880), \qquad v^* = \frac{\alpha}{1 - (1 - \alpha)c}" />
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      <b>α</b>(알파)는 섞는 실제 데이터의 비율, <b>c</b>는 ±2σ 바깥을 잘라 낸 정규분포(3부 6장)가 남기는 분산의 비율, <b>v*</b>는 더 이상 변하지
      않는 평형 분산입니다. α = 0이면 v*가 0, 곧 다양성이 끝까지 줄어들어요. 4장의 "목표가 0인 균형 루프"와 같은 모양이고,
      실제 데이터가 그 목표를 0에서 끌어올리는 셈입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 모델 붕괴 / 합성 데이터 / 대리 지표·보상 해킹 / 데이터 플라이휠">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li><b>모델 붕괴</b> (model collapse). 뜻: 모델이 만든 데이터로 다음 모델을 거듭 학습하면 분포의 꼬리(드문 사례)부터 사라지고 다양성이 줄어드는 현상(Shumailov 외, Nature 2024).</li>
        <li><b>합성 데이터</b> (synthetic data). 뜻: 사람이 아니라 모델이 만들어 낸 학습 데이터. 잘 쓰면 유용하지만 실제 데이터 없이 되먹이면 붕괴의 원인이 됩니다.</li>
        <li><b>대리 지표</b> (proxy)와 <b>보상 해킹</b> (reward hacking). 뜻: 진짜 목표 대신 재기 쉬운 지표(보상 모델 점수)를 쫓다가, 지표만 높고 진짜 품질은 나쁜 답을 찾아내는 것(6부 5장). 굿하트의 법칙의 AI판이에요.</li>
        <li><b>데이터 플라이휠</b> (data flywheel). 뜻: 사용자 → 데이터 → 품질 → 사용자로 도는 강화 루프. 수확 체감과 시장 포화라는 균형 루프를 함께 봐야 합니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습: 세대마다 × 0.880</p>
    <StepQuiz
      difficulty="medium"
      question="꼬리를 자른 합성 데이터만으로 학습하면 폭이 세대마다 0.880배가 된다. 처음 폭 1에서 2세대, 5세대 뒤 폭을 구하세요."
      :steps="[
        { lhs: '0.880^2 = ?', answer: 0.774, tolerance: 0.002 },
        { lhs: '0.880^5 = ?', answer: 0.528, tolerance: 0.002 },
      ]"
      explanation="0.774, 0.528. 반올림하지 않은 배수(0.8796)로 계산하면 10세대에 0.277, 20세대에 0.077까지 줄어듭니다. 같은 비율로 줄어드는 지수 감쇠, 곧 4장의 '목표가 0인 균형 루프'와 같은 모양이에요. 실제 데이터를 섞으면 그 목표가 0에서 v*로 올라가 다양성이 바닥나지 않습니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 보상 해킹을 고리로 읽기</h2>
    <ReviewFlag id="ch11-s3" chapter="ch11" label="3. 보상 해킹을 고리로 읽기" />
    <p class="leading-relaxed text-slate-700">
      보상 최적화는 보상 점수가 오르는 쪽으로 계속 걷는 고리입니다. 문제는 그 고리가 쫓는 <b>목표가 진짜 품질이 아니라 점수</b>라는 것이에요.
      점수와 품질이 함께 오르는 동안은 좋지만, 둘이 갈라지는 지점을 넘어서도 고리는 점수만 보고 계속 밀어붙입니다. KL 목줄은
      원본 모델에서 멀어질수록 벌점을 주는 <b>두 번째 균형 루프</b>예요. 실험의 최적화는 매 걸음 e ← e + 0.1 × (1 − β·e)로 움직여 결국 e = 1/β에 멈추니,
      목줄이 곧 "어디까지만 밀어붙일지"를 정하는 목표가 됩니다(4장). 목줄을 고르는 일이 6부 6장에서 β 다이얼을 고르던 일 그대로입니다.
    </p>

    <DetailsCard title="➕ 더 깊이: 장난감 모형과 실제 연구의 차이">
      두 실험 모두 결과를 노트북과 한 자리까지 맞추려고 단순하게 만든 <b>장난감 모형</b>입니다. 실제 모델 붕괴 연구(Shumailov 외, 2024)에서는
      유한한 표본으로 분포를 다시 추정하는 통계적 오차와 모델이 분포를 완벽히 담지 못하는 근사 오차가 쌓이며 꼬리부터 사라지는데, 여기서는 이 과정을
      "±2σ 바깥을 만들지 않는다"는 한 가지 규칙으로 줄였어요. 그래서 0.880 같은 숫자 자체보다 <b>되먹임이 다양성을 깎고, 실제 데이터가 그 감소를
      붙잡는다</b>는 구조를 기억하면 됩니다. 보상 해킹도 실제로는 보상 모델 점수(대리 지표)를 오래 최적화할수록 진짜 선호 점수가 오르다 떨어지는
      현상이 보고됐지만(보상 모델 과최적화), 품질 = e − 0.1e² 같은 식은 그 모양을 흉내 낸 것입니다.
    </DetailsCard>

    <ReviewFlag id="ch11-ai" chapter="ch11" label="🤖 AI 연결: 목줄·실제 데이터·한계라는 브레이크" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 목줄·실제 데이터·한계라는 브레이크">
      <b><PartLink :part="6" ch="ch5">6부 5장</PartLink></b>에서 처음 만난 보상 해킹, <b><PartLink :part="6" ch="ch6">6부 6장</PartLink></b>의 KL 목줄이
      오늘 본 두 번째 균형 루프입니다. <b><PartLink :part="6" ch="ch9">6부 9장</PartLink></b>의 아첨(sycophancy)도 같은 구조예요. 사람 평가자의
      '좋아요'라는 대리 지표를 쫓는 고리가 진짜 정확성에서 벗어나는 거죠. 모델 붕괴의 꼬리 자르기는
      <b><PartLink :part="4" ch="ch12">4부 12장</PartLink></b>의 top-p 샘플링이 드문 토큰을 잘라 내는 것과 닮았고, 분포의 폭은
      <b><PartLink :part="3" ch="ch6">3부 6장</PartLink></b>의 정규분포 표준편차입니다. 사내 도입으로 옮기면 이렇습니다. AI가 쓴 문서로 사내
      지식베이스를 채우고 그걸로 다시 AI를 돌리면 다양성이 줄 수 있으니 사람이 쓴 원본을 계속 섞고, 만족도 점수만 보며 튜닝하지 말고 실제 업무
      결과로 검증하며, 도입 계획에는 한계(남은 부서, 예산)를 함께 그리는 것. 다음 캡스톤에서 이 모든 것을 하나의 도입 모형으로 돌려 봅니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="AI가 만드는 고리: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="모델 붕괴를 고리로 설명한 것은?"
        :choices="['모델이 만든 데이터로 다음 모델을 거듭 학습하며 드문 사례(꼬리)가 사라지고 다양성이 줄어드는 고리', '모델이 커질수록 똑똑해지는 고리', '사용자가 많을수록 서버가 느려지는 고리', '학습률이 너무 커서 발산하는 현상']"
        :answer="0"
        explanation="다양성이 줄어든 모델이 만든 데이터는 다양성이 더 적고, 그걸로 배운 다음 모델은 또 줄어듭니다. 실제 데이터가 이 고리를 붙잡는 브레이크예요."
      />
      <Quiz
        difficulty="easy"
        question="실제 데이터를 매 세대 일정 비율 섞으면, 분포의 폭은 줄다가 어느 수준에서 멈춘다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 줄어드는 힘과 실제 데이터가 채우는 힘이 같아지는 평형(10%면 0.574, 30%면 0.809)에서 멈춥니다."
      />
      <Quiz
        difficulty="easy"
        question="굿하트의 법칙은?"
        :choices="['지표가 목표가 되면 좋은 지표이길 멈춘다', '두 배 시간은 70 ÷ 성장률이다', '저량은 유량으로만 바뀐다', '루프 안 − 가 홀수면 균형 루프다']"
        :answer="0"
        explanation="재기 쉬운 지표를 목표로 삼아 최적화하면 지표만 높고 진짜 목표는 놓친 결과가 나옵니다. 보상 해킹이 AI판 굿하트의 법칙이에요."
      />
      <Quiz
        difficulty="easy"
        question="RLHF의 KL 목줄이 이 장에서 하는 역할은?"
        :choices="['원본에서 멀어질수록 벌점을 주어 보상만 쫓는 폭주를 붙잡는 균형 루프', '보상을 두 배로 키우는 강화 루프', '학습률을 줄이는 장치', '데이터를 늘리는 장치']"
        :answer="0"
        explanation="점수를 쫓는 고리에 '너무 멀리 가지 마라'는 두 번째 균형 루프를 붙인 것입니다. 6부 6장의 β 다이얼이 그 세기예요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="꼬리를 자른 합성 데이터만으로 10세대를 거치면 분포의 폭은 약 얼마인가? (소수 둘째 자리)"
        type="numeric"
        :answer="0.28"
        :tolerance="0.01"
        :hints="['0.880을 열 번 곱하세요.']"
        explanation="0.880¹⁰ ≈ 0.28(반올림하지 않은 배수 0.8796으로 계산하면 0.277). 폭이 4분의 1 남짓으로 줄어 원래의 드문 사례는 거의 나오지 않습니다."
      />
      <Quiz
        difficulty="medium"
        question="실제 데이터를 30% 섞을 때 폭이 멈추는 값은 약 얼마인가? (소수 둘째 자리)"
        type="numeric"
        :answer="0.81"
        :tolerance="0.01"
        :hints="['v* = α ÷ (1 − (1 − α)c), c ≈ 0.774, 폭 = √v*']"
        explanation="v* = 0.3 ÷ (1 − 0.7 × 0.774) ≈ 0.654, 폭 = √0.654 ≈ 0.81. 섞는 비율이 클수록 원래 폭(1)에 가까운 곳에서 멈춥니다."
      />
      <Quiz
        difficulty="medium"
        question="보상 해킹 실험(β = 0.05)에서 보상 점수는 끝까지 오르는데 진짜 품질이 떨어지는 이유는?"
        :choices="['점수(대리 지표)와 진짜 품질이 갈라지는 지점을 넘어서도 최적화가 점수만 보고 계속 밀기 때문', '학습률이 너무 작아서', '데이터가 부족해서', '진짜 품질이 측정 오류라서']"
        :answer="0"
        explanation="최적화 고리가 쫓는 목표가 진짜 품질이 아니라 점수이기 때문입니다. 57걸음 무렵 품질이 정점(2.5)을 찍은 뒤로는 점수가 오를수록 품질이 떨어져요."
      />
      <Quiz
        difficulty="medium"
        question="KL 목줄 β를 너무 크게(β = 1) 하면?"
        :choices="['너무 조심스러워 진짜 품질도 0.9에서 멈춘다(최고 2.5)', '보상 해킹이 더 심해진다', '품질이 무한히 오른다', '아무 차이가 없다']"
        :answer="0"
        explanation="최적화가 e = 1/β = 1에서 멈춰 품질이 0.9에 그칩니다. 목줄은 짧아도 길어도 문제라서 알맞은 세기를 골라야 해요(β = 0.2면 2.5)."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="챗봇의 아첨(sycophancy)을 이 장의 고리로 설명하면?"
        :choices="['사람 평가자의 좋아요라는 대리 지표를 쫓는 고리가 진짜 정확성에서 벗어난 것', '모델 붕괴의 한 종류', '데이터 플라이휠의 강화 루프', '학습률이 커서 생긴 가짜 출렁임']"
        :answer="0"
        explanation="듣기 좋은 답이 좋아요를 더 받으면, 좋아요를 쫓는 사후 학습이 맞는 답보다 듣기 좋은 답을 키웁니다. 보상 해킹과 같은 구조라 처방도 같아요. 대리 지표만 보지 말고 진짜 목표로 따로 검증하고, 목줄을 둡니다."
      />
      <Quiz
        difficulty="hard"
        question="사내 AI 서비스의 데이터 플라이휠 투자 계획을 세울 때 가장 알맞은 것은?"
        :choices="['강화 루프와 함께 품질의 수확 체감·남은 사용자 같은 균형 루프를 그려 S자로 예측한다', '첫 석 달의 성장률로 지수 곡선을 그린다', '사용자 수는 늘 일정하다고 본다', '데이터는 많을수록 품질이 비례해 오른다고 본다']"
        :answer="0"
        explanation="강화 루프만 그리면 12개월 뒤 40,343명처럼 시장(1만 명)을 넘는 계획이 나옵니다. 균형 루프를 함께 그리면 약 8,030명에서 꺾이는 실제에 가까운 계획이 돼요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch11')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">11장 완료! AI의 고리에서 브레이크를 찾는 눈이 생겼습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        실제 데이터, KL 목줄, 한계를 인정하는 계획. 이제 캡스톤입니다.
        가상 회사의 AI 도입을 처음부터 모형으로 돌려 보고 전략 판정서를 씁니다.
      </p>
      <RouterLink
        to="/ch/ch12"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        12장: 캡스톤 →
      </RouterLink>
    </div>
  </article>
</template>
