<script setup lang="ts">
// 6장 — 시험의 오차범위 (핵심): 3부 8장 신뢰구간의 회수처. 필수 소주제 ③.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import IntervalLab from '@/components/IntervalLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch6')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">6장 · 시험의 통계 (핵심)</p>
    <h1 class="mb-4 text-3xl font-bold">시험의 오차범위</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      2막의 시작입니다. 워밍업에서 ±밴드를 <b>눈</b>으로 봤다면, 이제 <b>공식</b>으로
      계산합니다. 목표는 선거철 뉴스의 이 문장을 제대로 읽는 것입니다. <i>"전국 성인 1,004명 조사,
      95% 신뢰수준에 표본오차 ±3.1%포인트."</i> 이 문장의 수학이 <b>벤치마크 점수의
      오차범위와 정확히 같기</b> 때문입니다. 그리고 3부에서 "심화"로 미뤄뒀던
      신뢰구간을 드디어 실전에 쓰는 장이기도 합니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      정확도의 95% 신뢰구간 <b>p̂ ± 1.96·√(p̂(1−p̂)/n)</b> 을 계산하고, "95%"의 진짜 뜻
      (<b>절차의 명중률</b>)을 실험으로 확인하며, 리더보드 점수에 밴드를 씌우는 습관을
      가져갑니다. (공식은 미리 보기예요. 1절에서 부품 두 개로 분해해 조립합니다)
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 공식: 여론조사와 벤치마크는 같은 수학</h2>
    <ReviewFlag id="ch6-s1" chapter="ch6" label="1. 공식: 여론조사와 벤치마크는 같은 수학" />
    <p class="leading-relaxed text-slate-700">
      왜 같을까요? 유권자 전부에게 물을 수 없어 1,004명을 <b>표본</b>으로 뽑듯, 낼 수 있는
      모든 문제를 다 낼 수 없어 n문항을 냅니다. 표본 정답률 p̂(피-햇, 모자 ^ 는 "표본에서
      <b>추정한</b> 값"이라는 통계 관례)의 출렁임 폭(<b>표준오차</b>)은
      √(p̂(1−p̂)/n)으로, 3부 7장의 큰 수의 법칙이 말한 그 √n 속도입니다. 여기에 "출렁임의
      95%가 담기는 범위 = ±1.96 × 출렁임 폭"(3부 6장 정규분포의 95% 규칙)을 얹으면:
    </p>

    <MathBlock expr="\hat{p} \;\pm\; \underbrace{1.96}_{95\%\text{ 규칙}} \times \underbrace{\sqrt{\tfrac{\hat{p}(1-\hat{p})}{n}}}_{\text{표준오차}}" />

    <p class="leading-relaxed text-slate-700">
      3부 8장을 보셨다면 "그때 그 신뢰구간"이고, 처음이어도 괜찮습니다. 부품 두 개
      (√n 출렁임 + 95% 규칙)의 조립이라는 것만 잡으면 돼요. 검산: n=1,000, p̂=50%면
      1.96×√(0.25/1000) = 1.96×0.0158 = <b>±3.1%p</b>, 여론조사 문장 그대로죠.
      이제 직접 돌려 봅시다.
    </p>

    <IntervalLab />

    <ConceptCard tone="tip" title="핵심 관찰: 95%는 '절차의 명중률'이다">
      실험 ②가 이 장에서 가장 중요한 그림입니다. 참 실력 70%(신의 시점)로 시험을 100번
      치고 매번 95% 구간을 만들면 <b>약 95번은 참값을 담고 약 5번은 놓칩니다</b>
      (우리 실험: 100문항 2회, 1,000문항 7회 놓침. 놓침 횟수도 표본이라 5회 근처에서
      출렁이죠). 즉 "95% 신뢰"는 <b>구간 만들기 절차의 장기 명중률</b>이지, 지금 손에 든
      구간 하나가 맞을 확률 95%라는 뜻이 아닙니다. 그리고 ③: 밴드를 씌우는 순간 리더보드가
      달리 보입니다. <b>0.6점 차 1·2위는 10,000문항으로도 갈리지 않았어요.</b>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'95% 신뢰구간'에서 95%의 가장 정확한 뜻은?"
      :choices="['이 절차로 구간을 반복해 만들면 장기적으로 약 95%가 참값을 담는다. 절차의 명중률', '지금 이 구간 안에 참값이 있을 확률이 정확히 95%다', '점수가 95점 이상이라는 뜻', '문항의 95%를 맞혔다는 뜻']"
      :answer="0"
      :hints="['실험 ②에서 100번 반복했을 때 무슨 일이 있었나요?']"
      explanation="100번 중 ~95번 담는 절차의 성질입니다. 미묘해 보이지만 실무에서 중요한 구분이에요. 개별 구간은 담았거나 못 담았거나 둘 중 하나이고, 우리는 어느 쪽인지 모릅니다(신의 시점이 없으니까요)."
    />

    <ConceptCard tone="note" title="새 용어: 신뢰구간 / 표준오차 / 신뢰수준">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>신뢰구간</b> (confidence interval). 뜻: 워밍업부터 쓰던
          "오차범위"의 정식 이름. 측정값 ± 폭으로 참값의 후보 범위를 제시하는 방식입니다.
          3부 8장의 그 개념이 벤치마크에 상륙한 것.
        </li>
        <li>
          <b>표준오차</b> (standard error). 뜻: 표본 점수의
          <b>출렁임 한 단위</b>: √(p̂(1−p̂)/n). 분모의 √n 덕분에 문항 4배 = 폭 절반이라는
          워밍업의 관찰이 여기서 나옵니다.
        </li>
        <li>
          <b>신뢰수준</b> (confidence level). 뜻: 절차의 목표 명중률.
          95%가 표준이고 짝꿍 계수가 1.96입니다(99%면 2.58, 폭이 넓어지는 대신 덜 놓침).
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <StepQuiz
      question="10,000문항 벤치마크(p̂ = 50%)의 오차범위를 냅킨 공식 ± ≈ 98/√n (%p)으로 어림해 보세요."
      :steps="[
        { lhs: '\\sqrt{10000} = ?', answer: 100 },
        { lhs: '98 / 100 = ?', answer: 0.98 },
        { lhs: '\\approx \\pm ?\\,\\%p\\ (\\text{반올림})', answer: 1 },
      ]"
      explanation="±1%p. 만 문항짜리 시험이라야 1점 단위를 겨우 믿을 수 있다는 뜻입니다. 냅킨 공식 98/√n은 1.96×50/√n을 줄인 것(p̂=50% 최악 기준)이에요."
    />

    <DetailsCard title="➕ 더 깊이: 냅킨 공식, 폭이 좁아지는 조건, 근사의 한계">
      <b>냅킨 공식</b>: ± ≈ <b>98/√n</b> %p (p̂=50% 기준 최악값): 50문항 ±13.9, 100문항
      ±9.8, 1,000문항 ±3.1, 10,000문항 ±1.0. 회의 중 암산용으로 이만한 게 없습니다.
      둘째, 폭은 p̂에도 달려 있습니다. p̂(1−p̂)는 50%에서 최대라, 점수가 90%처럼 극단으로
      가면 폭이 <b>좁아집니다</b>(90%·n=1,000이면 ±1.9). 셋째, 이 공식은 정규 근사라
      <b>n이 작거나 p̂이 0/100%에 바짝 붙으면 부정확</b>해요. 그런 경우(만점 근처의 코딩
      벤치마크 등)는 다른 구간(정확 이항·윌슨)을 쓰는데, "근사가 깨지는 구역이 있다"는
      감각만 가져가면 충분합니다.
    </DetailsCard>

    <ReviewFlag id="ch6-ai" chapter="ch6" label="🤖 AI 연결: 리더보드를 볼 때 자동으로 해야 할 나눗셈" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 리더보드를 볼 때 자동으로 해야 할 나눗셈">
      이제 벤치마크 점수를 보면 두 숫자를 찾게 될 겁니다. 점수, 그리고 <b>문항 수</b>.
      실제로 널리 쓰이는 벤치마크 중엔 문항이 200개가 안 되는 것도 있고(±8%p라 한 자리
      점수 차는 전부 소음!), 만 문항이 넘어야 ±1%p 급이 됩니다. 실험 ③처럼 밴드를
      씌우는 순간 "순위표"의 절반은 판정 보류가 되죠. 이 공식의 뿌리는
      <b><PartLink :part="3" ch="ch8">3부 8장</PartLink></b>(추정과 신뢰구간, 드디어 실전에!)이고, 평가 전체의 틀은 <b><PartLink :part="6" ch="ch9">6부 9장</PartLink></b>의
      심화판입니다. 남은 질문 하나, 겹친 두 모델, 그럼 <b>어떻게 가려요?</b> 그게 다음 장,
      짝지은 비교와 p값입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="시험의 오차범위: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="신뢰구간 공식 p̂ ± 1.96·√(p̂(1−p̂)/n) 에서 문항 수 n이 커지면 구간 폭은?"
        :choices="['좁아진다. n이 분모(√ 안)에 있으니까', '넓어진다', '변하지 않는다', 'n과 무관하다']"
        :answer="0"
        explanation="√n 분의 1로 좁아집니다. 문항 4배에 폭 절반(워밍업의 그 관찰이 공식이 된 것)."
      />
      <Quiz
        difficulty="easy"
        question="여론조사 문구 '1,004명, 95% 신뢰수준, ±3.1%p'와 벤치마크 오차범위의 관계는?"
        :choices="['같은 공식이다. 표본(사람/문항)으로 전체를 추정할 때의 ±', '전혀 다른 수학이다', '여론조사에만 통계가 쓰인다', '벤치마크는 오차가 없다']"
        :answer="0"
        explanation="1.96×√(0.5×0.5/1000) ≈ 3.1%p. 계산기로 확인했던 그대로입니다. 국자(표본)의 수학은 어디서나 같아요."
      />
      <Quiz
        difficulty="easy"
        question="'오차범위'의 정식 통계 용어는 신뢰구간(confidence interval)이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 워밍업부터 쓰던 비유에 이 장에서 실무 용어를 붙였습니다(3부 8장의 그 개념)."
      />
      <Quiz
        difficulty="easy"
        question="100문항 벤치마크(p̂=50%)의 오차범위는 약 얼마인가? (냅킨 공식 98/√n)"
        :choices="['약 ±9.8%p', '약 ±1%p', '약 ±0.1%p', '약 ±50%p']"
        :answer="0"
        explanation="98/√100 = 98/10 = 9.8. 100문항 시험에서 5점 차이는 흔한 소음이라는 뜻입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="실험 ②에서 놓침 횟수가 100문항 2회, 1,000문항 7회로 서로 달랐다. 올바른 해석은?"
        :choices="['둘 다 이론값 ~5회 근처의 정상 출렁임. 놓침 횟수 자체도 100회짜리 표본이다', '1,000문항 시험이 더 부정확하다는 증거', '시뮬레이션 버그', '신뢰구간이 틀렸다는 증거']"
        :answer="0"
        :hints="['워밍업 어려움 문제(20회 요약도 표본)와 같은 구조입니다.']"
        explanation="5% 명중 실패율의 100회 실험은 평균 5회, ±4회쯤 출렁이는 게 정상입니다. 측정의 측정에도 오차범위가 있어요."
      />
      <Quiz
        difficulty="medium"
        question="p̂ = 70%, n = 1,000인 벤치마크 점수의 오차범위는? (√(0.7×0.3/1000) ≈ 0.0145)"
        type="numeric"
        :answer="2.8"
        :tolerance="0.2"
        :hints="['1.96 × 0.0145 × 100 (%p로).']"
        explanation="1.96×0.0145 ≈ 0.028 → ±2.8%p. p̂이 50%에서 멀어서 최악값(±3.1)보다 약간 좁습니다."
      />
      <Quiz
        difficulty="medium"
        question="실험 ③에서 0.6점 차이인 1·2위(아라-2 72.4 vs 바다-3 71.8)는 10,000문항에서도 구간이 겹쳤다. 올바른 결론은?"
        :choices="['이 벤치마크만으로 1·2위를 확정할 수 없다. 차이가 진짜인지의 정식 판정은 다음 장(7장) 도구로', '아라-2가 확실히 더 강하다', '바다-3이 사실 더 강하다', '두 모델의 실력이 같다는 증명이다']"
        :answer="0"
        explanation="겹침 = 단정 금지(같음의 증명도 아님). 워밍업의 교훈이 공식으로 돌아온 거예요. 그리고 겹침 판정은 보수적이라, 제대로 가리려면 두 표본 비교 검정(7장)이 필요합니다."
      />
      <Quiz
        difficulty="medium"
        question="같은 n=1,000에서 p̂=90%인 모델의 오차범위가 p̂=50%인 모델보다 좁은 이유는?"
        :choices="['p̂(1−p̂)이 50%에서 최대이고 극단으로 갈수록 작아지므로', '높은 점수는 항상 정확해서', '채점이 관대해서', '우연이다']"
        :answer="0"
        explanation="0.9×0.1=0.09 < 0.5×0.5=0.25라서 출렁임의 재료 자체가 줄어듭니다(±1.9 vs ±3.1). 거의 다 맞히는 시험은 결과가 덜 흔들려요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="오차범위를 ±0.5%p까지 좁히려면(p̂=50% 기준) 문항이 약 몇 개 필요한가?"
        :choices="['약 38,000개: (98/0.5)² ≈ 38,416', '약 1,000개', '약 5,000개', '약 380개']"
        :answer="0"
        :hints="['냅킨 공식을 뒤집으면 n = (98/±폭)².']"
        explanation="98/√n = 0.5 → n = 196² = 38,416. 폭을 절반으로 줄일 때마다 문항이 4배. 정밀한 벤치마크가 비싼 이유이고, 0.5점 차이를 논하려면 이 정도 규모가 필요하다는 뜻입니다."
      />
      <Quiz
        difficulty="hard"
        question="문항 164개짜리 벤치마크에서 두 모델이 82.3% vs 78.7%(3.6%p 차)를 받았다. 이 장의 눈으로 가장 올바른 판단은?"
        :choices="['오차범위가 각각 ±6~7%p 수준이라 3.6%p 차이는 구간이 크게 겹친다. 이것만으로 우열 단정 금지', '3.6%p면 충분히 큰 차이니 확정', '점수가 80% 근처라 오차가 없다', '문항 수는 판단과 무관하다']"
        :answer="0"
        :hints="['98/√164 ≈ 7.7 (p̂=50% 기준), 80% 근처면 ±6.1 정도.']"
        explanation="p̂≈0.8, n=164 → ±1.96√(0.8×0.2/164) ≈ ±6.1%p. 실제로 이렇게 작은(수백 문항 미만) 벤치마크가 널리 쓰입니다. 점수 옆에서 문항 수부터 찾는 습관이 이 장의 선물이에요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch6')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">6장 완료! 3부 8장을 드디어 실전에 썼습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음 7장 주제는 '차이가 진짜일까'입니다. 겹친 두 모델을 가리는 정식 도구:
        같은 문항으로 짝지은 비교(paired)가 문항 수를 아껴 주는 이유, 그리고 p값(3부 9장)을 실전에 다시 쓰는 법입니다.
      </p>
      <RouterLink
        to="/ch/ch7"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        7장: 차이가 진짜일까 →
      </RouterLink>
    </div>
  </article>
</template>
