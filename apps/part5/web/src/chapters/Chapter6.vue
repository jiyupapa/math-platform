<script setup lang="ts">
// Phase 6 · AI 학습의 정체 — 흉내내기의 수학 (훈련 = KL 최소화 = CE 최소화)
// 표준 구성: 개념 설명 + 인터랙티브 시각화 + 미니체크 + 10문제 세트 + 노트북 안내
import ConceptCard from '@/components/ConceptCard.vue'
import DetailsCard from '@/components/DetailsCard.vue'
import MathBlock from '@/components/MathBlock.vue'
import MimicTrainer from '@/components/MimicTrainer.vue'
import Quiz from '@/components/Quiz.vue'
import StepQuiz from '@/components/StepQuiz.vue'
import QuizSet from '@/components/QuizSet.vue'
import NotebookCard from '@/components/NotebookCard.vue'
import ReviewFlag from '@/components/ReviewFlag.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch6')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 6</p>
    <h1 class="mb-4 text-3xl font-bold">AI 학습의 정체 — 흉내내기의 수학</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      재료가 전부 모였습니다. 엔트로피(3장), 틀린 지도의 요금(4장), 바가지 초과분(5장) —
      이 셋을 합치면 "AI 가 배운다"는 말을 드디어 <b>수학 한 줄</b>로 쓸 수 있어요.
      이번 챕터는 새 공식이 없습니다. 아는 것들이 맞물리는 소리를 듣는 챕터예요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>"AI 가 배운다"의 한 줄 정의 — <b>훈련 = 데이터 분포와 모델 분포의 KL 최소화</b></li>
        <li>그것이 곧 <b>크로스 엔트로피 최소화</b>인 이유(5장 열쇠 회수)를 안다</li>
        <li>훈련 손실이 <b>0이 아니라 바닥(데이터의 엔트로피)에서 멈추는</b> 이유를 안다</li>
        <li>"압축 = 지능" 담론(2장)을 완성한다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 세상과 흉내쟁이 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 등장인물 둘 — 세상의 분포와 흉내쟁이</h2>
    <ReviewFlag id="ch6-s1" chapter="ch6" label="1. 데이터 분포와 모델 분포" />
    <p class="leading-relaxed text-slate-700">
      "언어"라는 세상에는 진짜 분포가 있습니다 — "나는 아침에" 다음에 어떤 단어가
      얼마나 자주 오는지, 인류가 쓴 모든 텍스트가 만드는 통계죠. 이걸
      <MathBlock inline expr="p_{\text{data}}" /> (데이터 분포)라고 부릅니다.
      훈련 데이터는 이 분포에서 뽑힌 <b>샘플</b>들이고요(3부의 표본).
    </p>
    <p class="mt-3 leading-relaxed text-slate-700">
      맞은편에 흉내쟁이가 있습니다 — 모델
      <MathBlock inline expr="q_\theta" />. 세타(θ)는 모델의 손잡이(가중치)들이고,
      손잡이를 돌리면 모델이 내놓는 분포가 바뀝니다. 1부에서 "학습 = 좋은 W 찾기"라고
      했던 그 W 가 θ 예요. 문제는 하나: <b>손잡이를 어느 쪽으로 돌려야 "좋은" 건가?</b>
    </p>

    <!-- 2. 한 줄 정의 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 한 줄 정의 — 배운다 = 흉내낸다 = KL 을 줄인다</h2>
    <ReviewFlag id="ch6-s2" chapter="ch6" label="2. 훈련 = KL 최소화 = CE 최소화" />
    <p class="leading-relaxed text-slate-700">
      5장의 자로 재면 답이 나옵니다. "모델이 세상을 잘 흉내낸다" = "두 분포가 가깝다" =
      "KL 이 작다". 그래서:
    </p>
    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <MathBlock expr="\text{AI 학습} \;=\; D(p_{\text{data}} \,\|\, q_\theta) \text{ 를 최소화하는 } \theta \text{ 찾기}" />
      <p class="mt-2 text-sm text-indigo-600">
        "AI 가 배운다" = 세상 분포 흉내내기 — 이 과정 전체의 종착지 문장입니다.
      </p>
    </div>
    <p class="leading-relaxed text-slate-700">
      그런데 5장에서 열쇠를 하나 챙겨 뒀죠 —
      <MathBlock inline expr="H(p, q_\theta) = H(p) + D(p \| q_\theta)" /> 인데
      <MathBlock inline expr="H(p)" /> 는 θ 와 무관한 상수. 그래서 <b>KL 을 줄이는 것과
      크로스 엔트로피를 줄이는 것은 완전히 같은 문제</b>입니다. 실무에서 손실함수로
      크로스 엔트로피를 쓰는 이유가 이거예요 — H(p) 는 알 필요도 없고, q 만 좋아지면 되니까.
    </p>

    <ConceptCard tone="tip" title="그런데 p_data 를 모르는데 어떻게 계산하죠?">
      좋은 질문! 세상의 분포표는 아무도 못 봅니다. 하지만 <b>샘플은 잔뜩</b> 있죠(훈련 데이터).
      크로스 엔트로피 <MathBlock inline expr="\textstyle\sum p \cdot \log_2 \frac{1}{q}" /> 는
      "p 로 가중한 평균"이니, p 에서 뽑힌 샘플들에 대한 <b>−log q 의 그냥 평균</b>으로
      대신할 수 있어요(3부: 기대값 ≈ 표본 평균). 그게 바로 4장에서 본
      "토큰마다 −log q(정답) 재서 평균" — <b>훈련 데이터가 분포표를 대신</b>합니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="크로스 엔트로피 최소화와 KL 최소화가 같은 문제인 이유는?"
      :choices="['둘의 차이가 θ 와 무관한 상수 H(p) 하나뿐이라서', '두 식이 글자까지 똑같아서', 'KL 이 항상 0이라서', '우연의 일치']"
      :answer="0"
      explanation="H(p,q) = H(p) + D(p‖q) — 바닥 H(p)는 모델이 어쩔 수 없는 상수라, q 를 움직이는 관점에서는 같은 산의 같은 내리막입니다."
    />

    <!-- 3. 훈련소 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 훈련소 — 흉내내기를 직접 지켜보기</h2>
    <ReviewFlag id="ch6-s3" chapter="ch6" label="3. 흉내내기 훈련소 (인터랙티브)" />
    <p class="leading-relaxed text-slate-700">
      말로만 하지 말고 직접 굴려 봅시다. 아래 미니 모델은 로짓(소프트맥스에 들어가는 점수,
      4부 0장)을 손잡이로 갖고 있고, <b>학습 버튼 = 2부에서 배운 경사하강 한 걸음</b>입니다.
      크로스 엔트로피의 기울기가 마침 <MathBlock inline expr="q - p" /> 라서, 한 걸음마다
      로짓이 <b>모자란 단어 쪽으로</b> 이동해요. 엉터리 모델로 리셋한 뒤 자동 학습을 눌러 보세요.
    </p>

    <MimicTrainer />

    <ConceptCard tone="tip" title="관찰 포인트 3가지">
      <ul class="list-disc space-y-1 pl-5">
        <li>보라 막대(모델)가 회색 막대(세상)를 <b>점점 닮아간다</b> — KL 최소화의 모습</li>
        <li>손실 곡선이 내려가다 <b>바닥 선(H(p) = 1.75비트)에서 평평해진다</b> — 0이 아니라!</li>
        <li>초과분 D(p‖q) 만 0으로 죽는다 — <b>배움이 줄이는 건 바가지뿐</b>, 세상의 불확실성은 못 줄인다</li>
      </ul>
    </ConceptCard>

    <!-- 4. 바닥의 의미 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 손실이 0이 안 되는 이유 — 바닥의 정체</h2>
    <ReviewFlag id="ch6-s4" chapter="ch6" label="4. 남는 바닥 = 데이터의 엔트로피" />
    <p class="leading-relaxed text-slate-700">
      완벽하게 배운 모델(q = p)의 훈련 손실은 얼마일까요? KL 은 0이지만 손실(크로스 엔트로피)은
      <MathBlock inline expr="H(p_{\text{data}})" /> — <b>세상 자체의 엔트로피</b>가 남습니다.
      "나는 아침에" 다음이 밥일지 빵일지는 <b>신도 확신할 수 없는</b> 진짜 불확실성이니까요.
    </p>
    <div class="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
      <MathBlock expr="\underbrace{\text{훈련 손실}}_{H(p,q_\theta)} = \underbrace{\text{세상의 불확실성}}_{H(p)\text{ — 못 줄임}} + \underbrace{\text{내 모델의 모자람}}_{D(p\|q_\theta)\text{ — 배움이 줄이는 것}}" />
    </div>
    <p class="leading-relaxed text-slate-700">
      그래서 훈련 로그의 loss 곡선이 내려가다 평평해지는 건 (데이터가 충분하다면) 고장이 아니라
      <b>물리 법칙</b>입니다. 아무리 큰 모델·많은 GPU 로도 언어 자체의 엔트로피 아래로는
      못 내려가요. 스케일링 법칙 논문들의 "줄일 수 없는 손실(irreducible loss)" 항이 바로 이 바닥입니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="세상 분포가 p = (1/2, 1/4, 1/8, 1/8) 일 때, 완벽하게 배운 모델(q = p)의 훈련 손실은 몇 비트일까요?"
      type="numeric"
      :answer="1.75"
      :tolerance="0.001"
      :hints="['KL 은 0이 됐고, 남는 것은 바닥.', 'H(p) 는 3장에서 계산했던 그 값.']"
      explanation="H(p) = 1.75비트. 완벽한 모델의 손실 = 세상 자체의 엔트로피 — 0이 아닙니다!"
    />

    <!-- 5. 압축 = 지능 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. "압축 = 지능" 담론의 완성</h2>
    <ReviewFlag id="ch6-s5" chapter="ch6" label="5. 압축 = 지능 담론 완성" />
    <p class="leading-relaxed text-slate-700">
      2장에서 예고한 담론을 이제 완성할 수 있습니다. 2장: 좋은 압축 = 분포에 잘 맞춘 코드.
      4장: 코드의 평균 길이 = H(p, q). 6장: 학습 = H(p, q) 최소화. 붙여 읽으면 —
    </p>
    <div class="my-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
      <p class="font-bold text-emerald-900">모델을 훈련하는 것 = 세상에서 가장 좋은 압축기를 만드는 것</p>
      <p class="mt-1 text-sm text-emerald-700">
        loss 가 3.2비트인 LLM = 텍스트를 토큰당 평균 3.2비트로 압축할 수 있는 압축기.
        "LLM 은 인터넷의 압축 파일"이라는 말이 은유가 아니라 수식인 이유.
      </p>
    </div>

    <DetailsCard title="➕ 더 깊이: 교과서의 '최대우도'와 같은 말인가요?">
      <p>
        네, 정확히 같은 문제입니다. 통계 교과서는 "데이터가 나올 확률(우도,
        <MathBlock inline expr="q(x_1) \times q(x_2) \times \cdots" />)을 <b>최대화</b>하라"고
        하는데(최대우도 추정, MLE), 여기에 log 를 씌우면 — 1장에서 배운 "곱을 합으로" —
        <MathBlock inline expr="\textstyle\sum \log q(x_i)" /> 최대화 = <b>−log q 평균의 최소화</b> =
        우리의 크로스 엔트로피 최소화가 됩니다. 같은 산을 통계학자는 "우도를 올린다"로,
        정보이론가는 "초과 비트를 내린다"로 부를 뿐이에요.
      </p>
    </DetailsCard>

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 이제 훈련 로그가 읽힌다</h2>
    <ReviewFlag id="ch6-ai" chapter="ch6" label="🤖 사전학습 loss 곡선 읽기" />
    <p class="leading-relaxed text-slate-700">
      GPT 를 만드는 회사들의 그래프 — 가로축 학습량, 세로축 loss, 미끄럼틀처럼 내려가는 곡선 —
      을 이제 정보이론의 눈으로 읽을 수 있습니다.
    </p>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 사전학습이라는 거대한 흉내내기">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>사전학습(pretraining) = 이 챕터 그 자체</b>: 인터넷 텍스트(p_data 의 샘플)로
          다음 토큰의 −log q 를 평균해(4장) θ 를 경사하강(2부)으로 조금씩 —
          훈련소에서 본 것의 조 단위 확장판입니다.
        </li>
        <li>
          <b>loss 곡선의 해부</b>: 내려가는 부분 = D(p‖q) 가 줄어드는 소리.
          평평해지는 바닥 = 언어의 엔트로피 + 모델 크기의 한계.
          모델을 키우면 바닥이 조금 더 내려가는 것이 <b>스케일링 법칙</b>의 풍경이에요.
        </li>
        <li>
          <b>한 줄 요약의 계보</b>: 워밍업 "AI = 불확실성을 줄이는 기계" →
          6장 "학습 = 세상 분포 흉내내기(KL 최소화)". 다음 장에서는 이렇게 배운 모델의
          <b>성적표(퍼플렉시티)</b>를 읽습니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="사전학습 loss 곡선이 내려가다 평평해지는 것에 대한 옳은 해석은?"
      :choices="['D(p‖q) 가 줄어들다가, 줄일 수 없는 바닥(데이터 엔트로피 등)에 다가간 것', '모델이 고장난 것', '데이터가 전부 삭제된 것', 'GPU 가 느려진 것']"
      :answer="0"
      explanation="내려가는 건 초과분(KL)이 줄어드는 소리, 평평한 건 줄일 수 없는 바닥 — 훈련소에서 직접 본 그 곡선입니다."
    />

    <!-- 연습 문제 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">6. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="AI 학습의 정체 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="'AI 가 배운다'의 한 줄 정의는 '데이터 분포와 모델 분포의 KL 발산을 최소화하는 것'이다."
        type="truefalse"
        :answer="0"
        explanation="참. 학습 = 세상 분포 흉내내기 = D(p_data‖q_θ) 최소화 — 이 과정의 종착지 문장입니다."
      />
      <Quiz
        difficulty="easy"
        question="모델이 훈련 중 실제로 보는 것은 무엇일까요?"
        :choices="['세상 분포에서 뽑힌 샘플(훈련 데이터)들', '세상 분포표 p_data 전체', '미래의 데이터', '자기 자신의 가중치뿐']"
        :answer="0"
        explanation="분포표는 아무도 못 봅니다 — 샘플에 대한 −log q 의 평균이 크로스 엔트로피를 대신하죠(기대값 ≈ 표본 평균)."
      />
      <Quiz
        difficulty="easy"
        question="완벽하게 배운 모델(q = p)의 훈련 손실은 0이 된다."
        type="truefalse"
        :answer="1"
        explanation="거짓. KL 은 0이 되지만 손실 = H(p) + 0 — 세상 자체의 엔트로피가 남습니다."
      />
      <Quiz
        difficulty="easy"
        question="훈련 손실을 분해하면 '세상의 불확실성 + 내 모델의 모자람'이다. 배움이 줄일 수 있는 쪽은?"
        :choices="['내 모델의 모자람 D(p‖q)', '세상의 불확실성 H(p)', '둘 다', '둘 다 아님']"
        :answer="0"
        explanation="H(p) 는 신도 못 줄이는 상수, 배움이 깎는 건 초과분(KL)뿐입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="세상 p = (1/2, 1/4, 1/8, 1/8) 을 완벽히 배운 모델의 손실을 분해해 보세요."
        :steps="[
          { lhs: 'D(p\\|q) \\;(q = p)', answer: 0 },
          { lhs: 'H(p)', answer: 1.75 },
          { lhs: '\\text{훈련 손실} = H(p) + D', answer: 1.75 },
        ]"
        :hints="['완벽히 배웠으니 초과분은?', '바닥은 3장에서 계산한 그 값.']"
        explanation="손실 = 1.75 + 0 = 1.75비트. 이 아래로는 어떤 모델도 못 갑니다."
      />
      <Quiz
        difficulty="medium"
        question="어떤 모델의 초과분이 D(p‖q) = 0.25비트이고 세상의 엔트로피가 H(p) = 1.75비트라면, 훈련 손실(크로스 엔트로피)은 몇 비트일까요?"
        type="numeric"
        :answer="2"
        :tolerance="0.001"
        :hints="['손실 = 바닥 + 초과분.']"
        explanation="1.75 + 0.25 = 2비트 — 4장의 균등 지도가 정확히 이 상태였죠."
      />
      <Quiz
        difficulty="medium"
        question="손실함수로 KL 대신 크로스 엔트로피를 써도 되는 이유는?"
        :choices="['H(p) 가 θ 와 무관한 상수라 두 최소화 문제가 동일해서', '크로스 엔트로피가 항상 더 작아서', 'KL 은 계산이 불가능해서', '관례일 뿐 이유는 없음']"
        :answer="0"
        explanation="같은 산의 같은 내리막 — 게다가 CE 는 샘플 평균으로 바로 계산되니 실무에서 더 편합니다."
      />
      <Quiz
        difficulty="medium"
        question="훈련이 잘 끝난 LLM 의 loss 가 토큰당 3.2비트라면, 이 모델은 텍스트를 토큰당 평균 약 3.2비트로 압축하는 압축기로 쓸 수 있다."
        type="truefalse"
        :answer="0"
        :hints="['크로스 엔트로피 = 그 지도(모델)로 부호화한 평균 비용(2·4장).']"
        explanation="참. 손실 = 부호화 비용이라 '모델 = 압축기'는 은유가 아니라 수식입니다."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="문장 4개 토큰에서 모델이 정답에 준 확률이 (1/2, 1/4, 1/2, 1/4) 였습니다. 이 문장의 훈련 손실(평균 −log₂ q)을 구하세요."
        :steps="[
          { lhs: '-\\log_2 \\tfrac{1}{2}', answer: 1 },
          { lhs: '-\\log_2 \\tfrac{1}{4}', answer: 2 },
          { lhs: '\\text{네 손실의 합 } 1+2+1+2', answer: 6 },
          { lhs: '\\text{평균 } 6 \\div 4', answer: 1.5 },
        ]"
        :hints="['토큰별 손실 = 놀람 = log₂(1/q).', '평균 = 합 ÷ 토큰 수.']"
        explanation="토큰별 1, 2, 1, 2비트 — 평균 1.5비트. 훈련 로그의 loss 한 점이 이렇게 만들어집니다."
      />
      <Quiz
        difficulty="hard"
        question="무한히 큰 모델과 무한한 데이터로 학습해도 언어모델의 loss 가 어떤 값 아래로는 내려가지 않습니다. 그 이유는?"
        :choices="['언어 자체의 엔트로피(진짜 불확실성)가 바닥으로 남아서', '경사하강이 게을러서', 'GPU 메모리가 부족해서', '토큰 수가 유한해서']"
        :answer="0"
        :hints="['훈련 손실 = H(p) + D(p‖q) 에서 D 만 0으로 갈 수 있어요.']"
        explanation="다음 단어가 정말로 여러 가능성인 문장이 존재하는 한, H(p_data) 는 남습니다 — 스케일링 법칙의 irreducible loss."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch6')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 6 완료. "AI 가 배운다"를 한 줄로 정의했습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        손실 트랙(4~6장) 완주! 다음은 LLM 트랙 — 이렇게 배운 모델의 성적표, <b>퍼플렉시티</b>입니다.
      </p>
      <RouterLink
        to="/ch/ch7"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 퍼플렉시티 →
      </RouterLink>
    </div>
  </article>
</template>
