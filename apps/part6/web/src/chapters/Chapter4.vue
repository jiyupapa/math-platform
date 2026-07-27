<script setup lang="ts">
// 4장 — 사람의 취향을 숫자로: 선호 데이터와 보상 모델 (핵심).
// 회수하는 수학: 3부 4장(조건부 확률) · 2부 7장(시그모이드) · −log 손실의 재등장.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import RewardLab from '@/components/RewardLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch4')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">4장 · 약 45분 · 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">사람의 취향을 숫자로 — 선호 데이터와 보상 모델</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      3장의 마지막 질문 — 시범으로는 "어느 답이 <b>더</b> 나은가"를 못 가르친다 —
      을 이번 장에서 풉니다. 계획은 대담해요: <b>사람의 취향 자체를 숫자로 바꾸는 것</b>.
      재료는 이미 있습니다. 3부의 조건부 확률과 2부의 시그모이드.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      선호 데이터(A/B + 선택)에서 <b>보상 모델</b>(답변 → 점수)을 얻는 길을 이해합니다.
      핵심 다리는 Bradley-Terry — <b>"점수 차이를 시그모이드에 넣으면 선호 확률이 된다"</b>.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 왜 점수 대신 비교인가</h2>
    <ReviewFlag id="ch4-s1" chapter="ch4" label="1. 왜 점수 대신 비교인가" />
    <p class="leading-relaxed text-slate-700">
      가장 단순한 방법은 사람에게 답변마다 점수를 매기게 하는 겁니다 — "이 답변은 10점 만점에 몇 점?"
      그런데 이게 잘 안 돼요. 같은 답변에 어떤 사람은 6점, 어떤 사람은 9점을 주고,
      같은 사람도 아침저녁으로 다릅니다. 절대 점수는 <b>기준이 들쭉날쭉</b>해요.
      반면 <b>"둘 중 어느 쪽이 나아요?"</b>는 누구나 쉽고 일관되게 답합니다.
      그래서 데이터를 비교(선호 쌍)로 모으고, 점수는 <b>모델이 비교로부터 역산</b>하게 합니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="선호 데이터를 절대 점수가 아닌 A/B 비교로 모으는 주된 이유는?"
      :choices="['비교가 절대 점수보다 사람들 사이에서 쉽고 일관적이라서', '비교가 저장 용량을 덜 차지해서', '점수는 수학적으로 다룰 수 없어서', 'A/B 테스트가 유행이라서']"
      :answer="0"
      :hints="['같은 답변에 6점 주는 사람과 9점 주는 사람 — 뭐가 문제였죠?']"
      explanation="절대 점수는 사람마다·때마다 기준이 흔들립니다. '어느 쪽이 나은가'는 훨씬 안정적 — 그래서 점수는 모델이 비교에서 역산합니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 직접 해보기 — 라벨러 체험과 보상 모델</h2>
    <ReviewFlag id="ch4-s2" chapter="ch4" label="2. 직접 해보기 — 라벨러 체험과 보상 모델" />
    <p class="leading-relaxed text-slate-700">
      아래 실험 ①에서 직접 라벨러가 되어 보세요. 그렇게 모인 선호 쌍으로 훈련하는 것이
      <b>보상 모델</b>입니다 — 답변을 넣으면 점수 r 하나를 뱉는 모델이에요.
    </p>

    <ConceptCard tone="note" title="새 용어: 선호 쌍 / 보상 모델">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>선호 쌍</b> (preference pair) — 읽는 법: 선호 쌍.
          뜻: (질문, 답변 A, 답변 B, <b>사람이 고른 쪽</b>)으로 이루어진 데이터 한 건.
        </li>
        <li>
          <b>보상 모델</b> (reward model, RM) — 읽는 법: 리워드 모델.
          뜻: 답변을 넣으면 <b>점수 r(보상)</b> 하나를 내는 모델. 보통 조련하던 LLM 에서
          마지막 층만 바꿔 만듭니다(다음 단어 분포 대신 숫자 하나) — 언어 이해를 물려받으려고요.
        </li>
      </ul>
    </ConceptCard>

    <RewardLab />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 점수 차 → 선호 확률: Bradley-Terry</h2>
    <ReviewFlag id="ch4-s3" chapter="ch4" label="3. 점수 차 → 선호 확률: Bradley-Terry" />
    <p class="leading-relaxed text-slate-700">
      실험 ②에서 만진 것이 <b>Bradley-Terry 모델</b>입니다. 보상 모델이 두 답변에 준 점수가
      r<sub>A</sub>, r<sub>B</sub> 라면, 사람이 A 를 고를 확률을 이렇게 모델링해요:
    </p>
    <MathBlock expr="P(\text{A 승}) = \sigma(r_A - r_B) = \frac{1}{1 + e^{-(r_A - r_B)}}" />
    <p class="leading-relaxed text-slate-700">
      σ 는 2부 7장의 <b>시그모이드</b> 그대로입니다 — 아무 실수나 받아 0~1 사이의 확률로
      바꿔 주는 S자 곡선. 점수 차가 0이면 50:50, 차이가 벌어질수록 확신이 커지되
      절대 100%엔 닿지 않죠. 실험 ②의 게이지가 그 곡선이었어요.
      "확률로 대답하는 조건부 모델" — 3부 4장의 감각 그대로입니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="보상 모델이 두 답변에 준 점수가 같다면(r_A = r_B), Bradley-Terry 가 예측하는 'A가 선택될 확률'은 몇 %일까요?"
      type="numeric"
      :answer="50"
      :hints="['σ(0) 의 값 — 시그모이드 곡선의 정중앙이에요.']"
      explanation="Δr = 0 이면 σ(0) = 0.5, 즉 50%. 점수가 같으면 우열을 모른다는 뜻입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 학습 — 또 −log 가 나온다</h2>
    <ReviewFlag id="ch4-s4" chapter="ch4" label="4. 학습 — 또 −log 가 나온다" />
    <p class="leading-relaxed text-slate-700">
      이제 훈련입니다. 사람이 A 를 골랐다면, 모델은 P(A 승)이 컸어야 해요.
      그래서 손실은:
    </p>
    <MathBlock expr="\text{손실} = -\log \sigma(r_{\text{선택}} - r_{\text{탈락}})" />
    <p class="leading-relaxed text-slate-700">
      어디서 많이 본 모양이죠? <b>−log(정답에 준 확률)</b> — 3장 SFT 손실과 똑같은
      크로스 엔트로피 패턴입니다. 이번엔 "정답"이 토큰이 아니라 <b>"사람의 선택"</b>일 뿐.
      P(선택받은 쪽)이 낮을수록(모델이 사람과 반대로 생각할수록) 손실이 폭발하고,
      경사하강이 r<sub>선택</sub>은 올리고 r<sub>탈락</sub>은 내립니다.
      비교 수만 건을 통과하면 — <b>사람의 취향이 점수 함수 하나로 압축</b>돼요.
    </p>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">비교(A/B)를 먹이면, 점수(r)가 태어난다</p>
      <p class="mt-1 text-sm text-indigo-600">사람은 비교만 하고, 숫자는 모델이 역산한다 — 취향의 디지털화.</p>
    </div>

    <h2 class="mt-8 mb-2 text-xl font-bold">5. 숫자가 된 취향, 다음은?</h2>
    <ReviewFlag id="ch4-s5" chapter="ch4" label="5. 숫자가 된 취향, 다음은?" />
    <p class="leading-relaxed text-slate-700">
      이제 어떤 답변이든 점수를 매길 수 있는 <b>자동 심판</b>이 생겼습니다.
      다음 단계는 자연스럽죠 — 조련 중인 모델이 답변을 만들 때마다 이 심판에게 점수를 받고,
      <b>점수가 높아지는 방향으로 배우는 것</b>. 그게 5장(강화학습)과 6장(RLHF)입니다.
      단, 미리 경고 하나: 보상 모델도 결국 <b>모델</b>이라 틀릴 수 있고, 심지어
      "심판을 속이는 법"을 학습당할 수도 있어요 — 그 이야기가 6장의 KL 목줄로 이어집니다.
    </p>

    <DetailsCard title="➕ 더 깊이: 체스 레이팅과 같은 수학이에요">
      Bradley-Terry 는 체스의 <b>Elo 레이팅</b>과 사실상 같은 원리입니다. 체스 선수의 실력을
      직접 점수로 매길 수 없으니 <b>대국 결과(누가 이겼나)</b>만 쌓아서 점수를 역산하고,
      두 선수의 점수 차로 승률을 예측하죠. 답변 = 선수, 사람의 선택 = 대국 결과, r = 레이팅.
      챗봇 순위 사이트(LMSYS Chatbot Arena)가 모델들을 Elo 로 줄 세우는 것도 같은 이유입니다 —
      "어느 답이 나은가"라는 비교 데이터에서 실력 점수를 뽑는 문제니까요.
    </DetailsCard>

    <ReviewFlag id="ch4-ai" chapter="ch4" label="🤖 AI 연결 — 회수하는 수학: 3부 4장 · 2부 7장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 3부 4장 · 2부 7장">
      <b><PartLink :part="2" ch="ch7">2부 7장</PartLink></b>: 시그모이드 σ — 점수 차를 확률로 바꾸는 변환기로 재등장.
      <b><PartLink :part="3" ch="ch4">3부 4장</PartLink></b>: 조건부 확률 — "점수가 이럴 때 A 가 선택될 확률"이라는 모델링 자체.
      그리고 <b><PartLink :part="5" ch="ch4">5부 4장</PartLink>의 −log</b> 가 손실로 세 번째 등장(사전학습·SFT에 이어).
      수식이 다 아는 얼굴이라는 것 — 그게 이 장이 "핵심"인데도 무섭지 않은 이유입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">6. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="선호 데이터와 보상 모델 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="선호 쌍 한 건에 들어 있는 것은?"
        :choices="['질문, 답변 A/B, 사람이 고른 쪽', '질문과 정답 점수', '답변 하나와 별점', '모델의 가중치']"
        :answer="0"
        explanation="(질문, A, B, 선택) — 점수는 없습니다. 점수는 모델이 이 비교들에서 역산해요."
      />
      <Quiz
        difficulty="easy"
        question="보상 모델(RM)이 하는 일은?"
        :choices="['답변을 넣으면 점수 r 하나를 낸다', '다음 단어를 예측한다', '답변을 사람 대신 작성한다', '데이터를 압축한다']"
        :answer="0"
        explanation="답변 → 점수. 조련하던 LLM에서 마지막 층만 바꿔 만들어 언어 이해를 물려받습니다."
      />
      <Quiz
        difficulty="easy"
        question="Bradley-Terry 에서 점수 차를 확률로 바꾸는 함수는 2부 7장에서 배운 시그모이드다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. P(A 승) = σ(r_A − r_B) — S자 곡선이 점수 차를 0~1 확률로 바꿔 줍니다."
      />
      <Quiz
        difficulty="easy"
        question="점수 차가 아주 커지면(r_A ≫ r_B) P(A 승)은 어떻게 될까요?"
        :choices="['100%에 다가가지만 절대 닿지는 않는다', '정확히 100%가 된다', '50%로 돌아온다', '0%가 된다']"
        :answer="0"
        explanation="시그모이드는 0과 1에 점근할 뿐 닿지 않아요 — 아무리 확실해 보여도 확률은 겸손하게 남겨 둡니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="보상 모델의 손실 −log σ(r_선택 − r_탈락) 이 '아는 얼굴'인 이유는?"
        :choices="['−log(정답에 준 확률) — SFT·사전학습과 같은 크로스 엔트로피 패턴이라서', '2부의 미분 공식이라서', '엔트로피의 정의라서', 'KL 발산의 정의라서']"
        :answer="0"
        :hints="['3장 SFT의 손실이 −log q(정답 토큰)이었죠. 이번 정답은 무엇일까요?']"
        explanation="정답이 토큰에서 '사람의 선택'으로 바뀌었을 뿐, −log(정답 확률) 구조는 동일합니다. 세 번째 재등장이에요."
      />
      <Quiz
        difficulty="medium"
        question="사람이 A를 골랐는데 모델은 P(A 승) = 0.1 로 예측했다(반대로 생각). 이때 학습에서 일어나는 일은?"
        :choices="['손실이 커서 r_A는 크게 오르고 r_B는 크게 내려간다', '손실이 0이라 아무 일도 없다', 'r_A와 r_B가 함께 오른다', '데이터가 버려진다']"
        :answer="0"
        :hints="['−log(0.1)은 −log(0.9)보다 훨씬 크죠 — 크게 놀란 만큼?']"
        explanation="−log(0.1) ≈ 3.3비트로 손실 폭발 — 사람과 반대로 생각한 만큼 크게 교정됩니다. SFT의 '자신 없던 정답' 원리 그대로."
      />
      <Quiz
        difficulty="medium"
        question="보상 모델을 밑바닥부터 새로 만들지 않고 조련하던 LLM에서 마지막 층만 바꿔 만드는 이유는?"
        :choices="['답변의 품질을 판단하려면 언어 이해가 필요한데, 그걸 물려받을 수 있어서', '마지막 층이 가장 크기 때문에', '법적으로 새 모델을 만들 수 없어서', 'GPU 메모리가 부족해서']"
        :answer="0"
        explanation="좋은 답변인지 판단하는 것도 결국 언어 이해 문제입니다. 사전학습이 쌓은 이해를 재활용하는 게 훨씬 효율적이에요."
      />
      <Quiz
        difficulty="medium"
        question="Bradley-Terry 와 같은 원리로 동작하는 것은?"
        :choices="['체스의 Elo 레이팅 (대국 결과에서 실력 점수를 역산)', '주사위의 기대값', '허프만 압축', '경사하강법의 학습률']"
        :answer="0"
        explanation="승부(비교) 결과만으로 점수를 역산하고, 점수 차로 승률을 예측 — Elo와 수학적으로 같은 가족입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="라벨러 100명 중 60명이 A, 40명이 B를 골랐습니다. 잘 훈련된 보상 모델의 바람직한 상태는?"
        :choices="['P(A 승) ≈ 0.6 이 되도록 r_A 가 r_B 보다 조금만 높다', 'P(A 승) = 1 이 되도록 r_A 가 압도적으로 높다', 'r_A = r_B (다수결이 아니므로)', 'B가 선택된 데이터는 버린다']"
        :answer="0"
        :hints="['사람들의 선호 자체가 60:40으로 갈렸어요 — 모델이 그보다 확신하면 과잉일까요?']"
        explanation="선호가 갈리는 답변 쌍이라면 확률도 그만큼만 기울어야 합니다. σ(Δr)=0.6 이 되는 작은 점수 차 — 취향의 불확실성까지 숫자에 담기는 거예요."
      />
      <Quiz
        difficulty="hard"
        question="'보상 모델이 생겼으니 이제 사람 없이 완벽히 객관적인 채점이 가능하다'는 주장의 허점은?"
        :choices="['보상 모델은 라벨러들의 선호를 압축한 것일 뿐 — 그들의 편향과 한계도 함께 배운다', '보상 모델은 점수를 낼 수 없다', '시그모이드는 확률이 아니다', '허점이 없다 — 옳은 주장이다']"
        :answer="0"
        :hints="['보상 모델의 교과서는 무엇이었죠? 누가 만든 데이터였나요?']"
        explanation="RM은 사람 선호의 근사입니다. 라벨러가 장황한 답을 선호했다면 모델도 장황함에 점수를 줘요. 이 불완전한 심판을 어떻게 다루는지가 6장(KL 목줄)과 9장(부작용)의 주제입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch4')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">4장 완료 — 취향이 숫자가 됐어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 5장 — 이 점수를 보상 삼아 배우는 법, 강화학습의 최소 직관.
        행동·보상·정책이라는 세 단어면 충분합니다.
      </p>
      <RouterLink
        to="/ch/ch5"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        5장 — 보상으로 배우기 →
      </RouterLink>
    </div>
  </article>
</template>
