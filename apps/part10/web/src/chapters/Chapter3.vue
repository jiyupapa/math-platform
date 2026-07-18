<script setup lang="ts">
// 3장 — 손실의 직선: 미니 LM 실측으로 스케일링 법칙(L = E + c/Dᵇ)을 직접 목격한다.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ScalingCurveLab from '@/components/ScalingCurveLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch3')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 3 · 성장의 법칙</p>
    <h1 class="mb-4 text-3xl font-bold">손실의 직선 — 스케일링 법칙</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      도구는 준비됐습니다 — 로그-로그 종이(2장)와 기울기 읽는 법. 이제 진짜 질문에 답할
      차례입니다: <b>데이터를 늘려 먹이면 손실이 얼마나 내려가나?</b> 진짜 LLM 대신,
      워밍업처럼 <b>신의 시점이 허락된 미니 언어 모델</b>로 직접 실측해 봅니다 —
      규칙(진짜 분포)을 우리가 알고 있으니 "완벽히 배우면 어디까지 가는지"까지 보입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      미니 LM에 데이터를 10배씩 늘려 먹이며 손실 L(D)를 실측하고, <b>스케일링 법칙의 꼴 —
      바닥 + 멱법칙</b> — 을 발견합니다. 그리고 이 법칙의 존재 이유를 체험합니다:
      <b>싼 실험 5개로 10배 큰 훈련의 손실을 예측</b>하기.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 실험 — 먹인 만큼 내려가나</h2>
    <ReviewFlag id="ch3-s1" chapter="ch3" label="1. 실험 — 먹인 만큼 내려가나" />
    <p class="leading-relaxed text-slate-700">
      실험 설계는 단순합니다. 8단어짜리 "고양이 세계" 언어에서 문장을 뽑아(시드 고정),
      미니 LM(바이그램 — 앞 단어를 보고 다음 단어 확률을 세는 학습기)에게 <b>D = 100부터
      100,000토큰까지</b> 늘려 가며 먹입니다. 각 단계에서 손실(교차 엔트로피 — 4부 11장에서
      본 그 훈련 손실)을 재고, 로그-로그 종이에 찍어 봅니다. 과연 직선일까요?
    </p>

    <ScalingCurveLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 손실 = 바닥 + 멱법칙">
      총 손실은 로그 축에서도 <b>휘면서 주황 점선에 달라붙었습니다</b> — 그 선의 정체는
      바닥 H = 0.269, 이 언어가 원래 품은 불확실성("는" 다음은 50:30:20으로 진짜 갈림)이라
      <b>아무리 배워도 없앨 수 없는 몫</b>입니다. 그런데 바닥을 빼고 남은 <b>초과 손실</b>은
      로그-로그에서 <b>기울기 −1.06, R² 0.998의 직선</b> — 데이터 10배마다 "남은 배울 것"이
      약 1/10로 줄었어요. 휘어 보이던 학습 곡선의 정체가 <b>바닥 + 멱법칙</b>이었던 겁니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="총 손실 곡선이 로그-로그 종이에서도 직선이 아니라 휘어 보인 이유는?"
      :choices="['줄일 수 없는 바닥(H)이 있어 곡선이 바닥에 달라붙기 때문 — 바닥을 빼면 직선이 된다', '데이터가 부족해서', '로그-로그 종이가 잘못돼서', '미니 LM이 고장 나서']"
      :answer="0"
      :hints="['랩에서 총 손실 ↔ 초과 손실 버튼을 번갈아 눌러 보세요.']"
      explanation="멱법칙으로 줄어드는 건 '남은 배울 것'(초과 손실)입니다. 총 손실 = 바닥 + 초과라서, 바닥 근처에선 아무리 먹여도 그래프가 평평해지죠 — 빼고 나면 깨끗한 직선."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 법칙의 꼴 — 한 줄로 쓰기</h2>
    <ReviewFlag id="ch3-s2" chapter="ch3" label="2. 법칙의 꼴 — 한 줄로 쓰기" />
    <p class="leading-relaxed text-slate-700">
      방금 목격한 것을 식 하나로 적으면 이렇습니다 (b &gt; 0, 우리 실험에선 b ≈ 1.06):
    </p>

    <MathBlock expr="L(D) \;=\; \underbrace{E}_{\text{바닥}} \;+\; \underbrace{c \cdot D^{-b}}_{\text{멱법칙으로 줄어드는 몫}}" />

    <p class="leading-relaxed text-slate-700">
      이것이 <b>스케일링 법칙</b>의 데이터 축 단면입니다. 로그-로그 직선의 기울기가 −b,
      절편이 log c(2장 그대로)이고, E가 주황 점선. 그리고 놀라운 건 — 진짜 LLM의 손실도
      N(몸집) 축, D(데이터) 축 각각에서 정확히 이 꼴을 따른다는 것. 그게 4장(황금비)의
      출발 재료가 됩니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 스케일링 법칙 / 줄일 수 없는 손실 E / 수확 체감">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>스케일링 법칙</b> (scaling law) — 읽는 법: 스케일링 로.
          뜻: 재료(N·D·C)와 손실을 잇는 <b>멱법칙</b> — "재료 10배당 초과 손실이 10ᵇ분의 1".
          로그-로그 종이 위의 직선으로 나타나며, 그래서 <b>외삽(예측)이 가능</b>합니다.
        </li>
        <li>
          <b>줄일 수 없는 손실 E</b> (irreducible loss) — 읽는 법: 이. 비유: <b>바닥</b>.
          뜻: 데이터가 무한이어도 남는 손실 — 언어 자체가 품은 진짜 불확실성입니다.
          정체는 <b>5부 3장의 엔트로피</b>: 우리 실험에선 H = 0.269 nat (퍼플렉시티로 e^0.269 ≈ 1.31).
        </li>
        <li>
          <b>수확 체감</b> (diminishing returns) — 읽는 법: 수확 체감.
          뜻: 같은 "10배"를 부어도 내려가는 절대량은 갈수록 작아지는 것 — 초과 손실이
          0.08 → 0.009 → 0.0008로 줄던 계단을 보세요. 법칙은 일정(10배당 1/10)한데
          <b>남은 것 자체가 줄어서</b> 생기는 현상입니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="우리 실험(기울기 ≈ −1)에서 데이터를 10배 늘리면 '초과 손실'(남은 배울 것)은 대략?"
      :choices="['약 1/10로 줄어든다', '절반이 된다', '변하지 않는다', '10배 커진다']"
      :answer="0"
      :hints="['로그-로그 기울기 −1의 뜻 — 2장의 10ᵇ배 규칙.']"
      explanation="기울기 −1이니 10배당 10⁻¹ = 1/10. 표에서도 9.3×10⁻³(D=1,000) → 7.7×10⁻⁴(D=10,000)으로 약 1/12이 됐죠 — 측정이라 약간의 출렁임은 있습니다(워밍업의 교훈!)."
    />

    <DetailsCard title="➕ 더 깊이: 우리 기울기는 −1인데, 진짜 LLM은 왜 −0.1 근처일까">
      우리 미니 LM은 <b>표를 세기만 하면 되는</b> 학습기라 데이터가 늘면 아주 빨리 배웁니다
      (통계학이 보장하는 속도 ≈ 1/D, 즉 기울기 −1). 진짜 언어는 어휘가 수만, 문맥이 길고,
      희귀한 패턴이 끝없이 이어지는 <b>긴 꼬리</b>(2장 Zipf!)라 신경망의 초과 손실 기울기는
      훨씬 완만합니다 — 공개된 측정들은 대략 <b>−0.05 ~ −0.3 수준</b>. 그래서 "10배를 부어야
      겨우 몇 십 %"라는 냉정한 산수가 나오고, 1장의 예산 곱셈과 합치면 <b>프런티어 훈련이
      왜 그렇게 비싼지</b>가 설명됩니다. 참고로 <b>9부 10장</b>의 양자화 무릎 곡선을 읽던
      감각(로그 축에서 완만/급락 읽기)이 여기서도 그대로 쓰였어요. 기울기 값 자체는 시스템마다
      다릅니다 — 공통인 것은 <b>"멱법칙 꼴"</b>이라는 사실.
    </DetailsCard>

    <ReviewFlag id="ch3-ai" chapter="ch3" label="🤖 AI 연결 — 프런티어 훈련은 '예측 게임'을 실전으로 한다" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 프런티어 훈련은 '예측 게임'을 실전으로 한다">
      랩의 예측 게임 — 싼 실험 5개로 직선을 긋고 10배 큰 훈련의 손실을 오차 0.01% 미만으로
      맞힌 것 — 이 바로 실제 프런티어 훈련의 표준 관행입니다. 수천억 원짜리 훈련을 지르기
      전에, 수천 배 작은 모델들로 스케일링 직선을 재고 <b>최종 손실을 미리 예측</b>해 설계를
      확정하죠(GPT-4 기술 보고서도 이 예측 그래프를 공개했습니다). 여러분이 재던 손실은
      <b><PartLink :part="4" ch="ch11">4부 11장</PartLink></b>의 훈련 손실 그것이고, 바닥을
      퍼플렉시티로 읽는 법은 <b><PartLink :part="5" ch="ch7">5부 7장</PartLink></b>에서 배운
      대로입니다(우리 언어의 바닥 PPL ≈ 1.31 — 완벽히 배워도 "는" 다음 갈래가 남아서).
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="손실의 직선 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="실험에서 데이터 D를 늘렸을 때 손실 L의 변화는?"
        :choices="['꾸준히 내려가지만 바닥(H = 0.269)에 가까워질수록 느려졌다', '데이터와 무관하게 일정했다', '데이터를 늘릴수록 올라갔다', '0까지 내려갔다']"
        :answer="0"
        explanation="0.349(D=100) → 0.278(D=1,000) → 0.2687(D=100,000) — 내려가되 바닥에 붙으며 평평해집니다. 바닥 아래로는 어떤 학습도 못 내려가요."
      />
      <Quiz
        difficulty="easy"
        question="'초과 손실'(excess loss)이란?"
        :choices="['총 손실에서 바닥(줄일 수 없는 손실 E)을 뺀 것 — 아직 남은 배울 것', '손실이 너무 커서 넘친 것', '시험 점수의 오차범위', '바닥 그 자체']"
        :answer="0"
        explanation="L − E — '남은 배울 것'입니다. 멱법칙(로그-로그 직선)을 따르는 건 총 손실이 아니라 이 초과 손실이에요."
      />
      <Quiz
        difficulty="easy"
        question="데이터를 무한히 먹이면 손실을 0으로 만들 수 있다."
        type="truefalse"
        :answer="1"
        explanation="거짓 — 바닥 E가 남습니다. '는' 다음이 50:30:20으로 진짜 갈리는 한, 완벽한 모델도 그 불확실성만큼은 틀릴 수밖에 없어요(언어 자체의 엔트로피)."
      />
      <Quiz
        difficulty="easy"
        question="초과 손실이 로그-로그 종이에서 직선이 된 것은 초과 손실이 어떤 꼴이라는 뜻인가?"
        :choices="['멱법칙 (c·D⁻ᵇ)', '지수법칙', '일차함수', '아무 법칙도 아님']"
        :answer="0"
        explanation="2장의 판별법 그대로 — 로그-로그 직선 = 멱법칙. 기울기 −1.06, R² 0.998로 아주 깨끗했죠."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="스케일링 법칙 L(D) = E + c·D⁻ᵇ 에서 세 기호의 짝으로 옳은 것은?"
        :choices="['E = 바닥(줄일 수 없는 손실), c·D⁻ᵇ = 멱법칙으로 줄어드는 몫, b = 로그-로그 직선 기울기의 크기', 'E = 데이터 수, c = 바닥, b = 손실', 'E = 손실, c = 기울기, b = 바닥', '세 기호 모두 같은 뜻']"
        :answer="0"
        explanation="바닥 + 멱법칙 — 이 두 부품이 휘어 보이는 학습 곡선의 전부입니다. 진짜 LLM의 법칙도 N축·D축 각각 이 꼴이에요(4장 재료)."
      />
      <Quiz
        difficulty="medium"
        question="예측 게임에서 앞 5점(D=100~10,000)만으로 D=100,000의 손실을 맞힐 수 있었던 근거는?"
        :choices="['초과 손실이 멱법칙(직선)이라 자를 대고 연장(외삽)할 수 있어서', '우연히 맞은 것이다', 'D=100,000을 미리 훔쳐봤기 때문', '손실이 항상 일정해서']"
        :answer="0"
        explanation="법칙이 직선이면 바깥으로 연장해도 직선입니다 — 예측 0.2688 vs 실측 0.2687. '작은 실험으로 큰 훈련을 설계한다'가 스케일링 법칙의 존재 이유예요."
      />
      <Quiz
        difficulty="medium"
        question="우리 실험의 바닥 H = 0.269 nat를 5부 7장의 언어로 바꾸면? (e^0.269 ≈ 1.31)"
        :choices="['완벽히 배워도 퍼플렉시티 약 1.31 — 다음 단어 후보가 평균 1.31개꼴로 남는다', '퍼플렉시티 0 — 완전한 확신', '퍼플렉시티 8 — 여덟 단어 전부 헷갈림', '퍼플렉시티와 무관하다']"
        :answer="0"
        :hints="['퍼플렉시티 = e^손실 — 5부 7장의 갈래 수 해석.']"
        explanation="PPL = e^H ≈ 1.31. '는' 다음의 진짜 갈림(50:30:20)이 남아서 1.0(완전 확신)이 될 수 없어요 — 바닥의 정체가 언어의 엔트로피라는 뜻입니다."
      />
      <Quiz
        difficulty="medium"
        question="D=1,000에서 초과 손실이 9.3×10⁻³이었다. 기울기 −1 법칙대로면 D=10,000에선 대략?"
        type="numeric"
        :answer="0.00093"
        :tolerance="0.0002"
        :hints="['10배당 1/10 — 지수에서 1을 빼면 됩니다. 소수로 쓰면 0.00093.']"
        explanation="9.3×10⁻⁴ = 0.00093. 실측은 7.7×10⁻⁴로 약간 더 내려갔죠 — 법칙은 추세이고 개별 측정엔 출렁임이 있습니다(워밍업의 교훈이 여기서도)."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="진짜 LLM의 데이터 기울기가 우리 toy(−1)보다 훨씬 완만한 −0.1이라고 하자. 초과 손실을 절반으로 줄이려면 데이터는 대략 몇 배 필요한가? (참고: 10^0.3 ≈ 2)"
        :choices="['약 1,000배 — 10^(0.1×3) = 2가 되려면 10배를 세 번', '약 2배', '약 10배', '약 30배']"
        :answer="0"
        :hints="['10배당 10^0.1 ≈ 1.26배씩 줄어듭니다 — 절반(2배 감소)까지 몇 칸?']"
        explanation="10배당 ×10⁻⁰·¹(=1/1.26). 절반이 되려면 0.1×k=0.3, k=3칸 — 즉 10³=1,000배. 완만한 기울기의 냉정함이자, 프런티어 훈련이 데이터를 조 단위로 삼키는 이유입니다."
      />
      <Quiz
        difficulty="hard"
        question="어떤 팀이 '손실이 더 안 내려간다, 학습이 고장났다'고 판단했다. 이 장의 관점에서 먼저 확인할 것은?"
        :choices="['바닥(E)에 도달해 가는 정상적인 수확 체감인지 — 초과 손실(L−E 추정)을 로그-로그로 다시 그려 직선인지 본다', '데이터를 무조건 2배 늘린다', '손실 그래프를 선형 축으로만 본다', '모델을 즉시 폐기한다']"
        :answer="0"
        :hints="['총 손실의 평평함은 고장이 아니라 바닥의 신호일 수 있죠.']"
        explanation="총 손실의 정체는 '바닥 + 멱법칙'입니다 — 평평해 보여도 초과 손실이 여전히 직선 위라면 법칙대로 가고 있는 것. 8부 9장의 훈련 일지 판독에 이 장의 눈이 더해지는 순간입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch3')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">3장 완료 — 스케일링 법칙을 직접 측정했습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 4장 — 몸집과 밥의 황금비(Chinchilla). N축과 D축의 법칙을 합치고 예산
        C = 6·N·D를 고정하면, "크게 잠깐 vs 작게 오래"의 최적점이 계산으로 나옵니다.
      </p>
      <RouterLink
        to="/ch/ch4"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        4장 — 몸집과 밥의 황금비 →
      </RouterLink>
    </div>
  </article>
</template>
