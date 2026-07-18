<script setup lang="ts">
// Phase 0 워밍업 챕터 — 6부 전체가 풀 문제("이어쓰기 기계 → 비서")를 몸으로 먼저 느낀다.
// 실제 Phase 1~10 챕터도 이 구조를 그대로 따른다.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import BaseVsChatLab from '@/components/BaseVsChatLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('sample')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">워밍업 · 10분 몸풀기</p>
    <h1 class="mb-4 text-3xl font-bold">같은 모델, 다른 대답</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      본격적인 학습 전 몸풀기입니다. 앞으로 모든 챕터가 이 페이지처럼 진행돼요 —
      설명 카드를 읽고, 실험을 직접 만져 보고, 문제를 풀면 진도가 채워집니다.
      막히면 <b>힌트</b>가 있고, 두 번 틀리면 <b>해설</b>도 열 수 있으니 부담 없이 시작하세요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      실험 하나로 6부 전체가 풀 문제를 얻습니다 —
      <b>"조련 전 모델은 비서가 아니라 이어쓰기 기계다."</b>
      같은 두뇌인데 왜 하나는 글을 이어 쓰고, 하나는 공손히 대답하는지, 그 차이를 눈으로 확인합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 일단 실험부터 — 두 모델에게 같은 말 걸기</h2>
    <ReviewFlag id="sample-s1" chapter="sample" label="1. 일단 실험부터 — 두 모델에게 같은 말 걸기" />
    <p class="leading-relaxed text-slate-700">
      여기 모델이 두 개 있습니다. 하나는 <b>베이스 모델</b>(인터넷 텍스트로 다음 단어 예측만 배운 상태),
      하나는 <b>챗 모델</b>(그 위에 조련을 마친 상태 — 여러분이 아는 ChatGPT가 이쪽).
      같은 프롬프트를 보내고 응답을 비교해 보세요.
    </p>

    <BaseVsChatLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 베이스 모델은 '틀리는' 게 아니에요">
      베이스 모델의 응답을 다시 보세요. 이상하지만 <b>말은 됩니다</b>.
      인터넷 어딘가에 있을 법한 글이에요. 베이스 모델은 질문에 답하도록 만들어진 게 아니라
      <b>"이 글 다음에 올 법한 글자"를 예측</b>하도록 만들어졌기 때문입니다 — 4부에서 조립한 바로 그 기계죠.
      문제는 능력이 아니라 <b>행동 방식</b>입니다.
    </ConceptCard>

    <!-- 본문 중간 미니체크 (문제 세트와 별개, 진도에 미포함) -->
    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="베이스 모델이 '2 더하기 2는' 에 4라고 답하지 않은 것은, 4를 계산할 능력이 없기 때문이다."
      type="truefalse"
      :answer="1"
      explanation="거짓입니다. 응답 첫 줄에서 이미 '4라는 것을 모르는 사람은 없다'고 써요 — 알지만, 답하는 대신 그 문장으로 시작하는 그럴듯한 글을 이어 쓰는 것뿐입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 같은 두뇌, 다른 훈련</h2>
    <ReviewFlag id="sample-s2" chapter="sample" label="2. 같은 두뇌, 다른 훈련" />
    <p class="leading-relaxed text-slate-700">
      놀라운 사실: 두 모델의 <b>내부 구조는 같습니다</b>. 토큰화 → 임베딩 → 어텐션 → 다음 단어 확률 —
      4부에서 조립한 트랜스포머 그대로예요. 다른 것은 딱 하나, <b>훈련의 마지막 단계</b>입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 베이스 모델 / 챗 모델">
      <ul class="list-disc pl-5 text-sm leading-relaxed">
        <li>
          <b>베이스 모델</b> (base model) — 읽는 법: 베이스 모델.
          뜻: 인터넷 텍스트로 <b>다음 단어 예측만</b> 배운 원석 상태의 모델. 이어쓰기 기계.
        </li>
        <li class="mt-1">
          <b>챗 모델</b> (chat / instruct model) — 읽는 법: 챗 모델, 인스트럭트 모델.
          뜻: 베이스 모델에 <b>조련(지시 따르기 훈련)</b>을 더한 모델. 질문에 답하고, 지시를 따르고, 멈춥니다.
        </li>
        <li class="mt-1">
          <b>조련</b> — 이 과정에서 쓰는 <b>비유어</b>입니다(동물을 길들이듯 행동을 다듬는다는 뜻에서).
          실무·논문에서는 <b>사후 학습</b>(post-training, 포스트트레이닝), <b>미세조정</b>(fine-tuning, 파인튜닝),
          <b>정렬</b>(alignment, 얼라인먼트)이라고 부릅니다. 이 과정 내내 "조련"이라 부르되,
          밖에서 말할 땐 이 세 이름을 쓰세요 — 10장에 치환표가 있습니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-4 leading-relaxed text-slate-700">
      그 "마지막 단계"에 이름을 붙이면 이 과정의 지도가 됩니다.
      크게 세 단계 — 이 과정에서 하나씩 열어 볼 거예요:
    </p>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5">
      <p class="mb-3 text-center text-lg font-bold text-indigo-900">조련 = 이어쓰기 기계를 비서로 만드는 훈련</p>
      <ol class="mx-auto max-w-md space-y-1 text-sm text-indigo-800">
        <li><b>1단계 사전학습</b> — 다음 단어 예측 (이미 끝난 상태 — 4부에서 배움)</li>
        <li><b>2단계 SFT</b> — 모범 답안을 보여주며 "이렇게 대답해" (3장)</li>
        <li><b>3단계 선호 학습</b> — 두 답변 중 사람이 고른 쪽으로 (RLHF·DPO, 4~7장)</li>
      </ol>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="베이스 모델과 챗 모델의 차이로 가장 알맞은 것은?"
      :choices="['내부 구조는 같고, 마지막 훈련이 다르다', '챗 모델은 완전히 다른 구조의 두뇌를 쓴다', '베이스 모델이 더 많은 것을 알고 있다', '챗 모델은 인터넷 없이 만들어진다']"
      :answer="0"
      :hints="['실험에서 두 모델의 능력 차이가 아니라 행동 차이를 봤어요.']"
      explanation="구조(트랜스포머)는 같습니다. 차이는 훈련의 마지막 단계 — 조련을 받았느냐입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 왜 이 과정이 '피날레'인가</h2>
    <ReviewFlag id="sample-s3" chapter="sample" label="3. 왜 이 과정이 '피날레'인가" />
    <p class="leading-relaxed text-slate-700">
      조련의 각 단계를 열어 보면, 1~5부에서 배운 수학이 <b>전부 되돌아옵니다</b>.
      SFT의 손실은 5부의 크로스 엔트로피 그대로고(3장), 사람의 취향을 숫자로 바꾸는 보상 모델에는
      3부의 확률과 2부의 시그모이드가(4장), "원본에서 너무 멀어지지 마"라는 목줄에는
      5부의 KL 발산이(6장), 거대 모델을 살짝만 고치는 LoRA에는 1부의 저차원 행렬이(8장) 쓰여요.
      새 수학은 거의 없습니다 — <b>아는 수학의 재회</b>입니다.
    </p>

    <DetailsCard title="➕ 더 깊이: 조련 없이 프롬프트만으로 안 되나요?">
      어느 정도 됩니다 — 베이스 모델에게 "질문: … 답변: …" 예시를 몇 개 붙여 주면(퓨샷 프롬프트)
      이어쓰기 본능을 이용해 답변 흉내를 내게 할 수 있어요. 하지만 예시가 프롬프트 자리를 차지하고,
      말투가 쉽게 무너지고, "해로운 요청 거절" 같은 건 가르칠 수 없습니다.
      그 한계를 정확히 보는 게 2장 — 그래서 조련이 필요해집니다.
    </DetailsCard>

    <ReviewFlag id="sample-ai" chapter="sample" label="🤖 AI 연결 — 회수하는 수학: 4부 전체" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 4부 전체">
      이 챕터의 실험은 <PartLink :part="4">4부</PartLink>의 결론 위에 서 있습니다. 4부에서 우리는
      <b>"LLM = 다음 단어를 확률로 고르는 기계"</b>를 직접 조립했죠.
      베이스 모델이 바로 그 기계의 순수한 모습입니다. 6부의 질문은 하나예요 —
      <b>"그 기계를 어떻게 비서로 만드는가?"</b> 이 질문의 답이 곧 GPT가 ChatGPT가 된 과정입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="같은 모델, 다른 대답 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="조련 전 베이스 모델의 본업을 가장 잘 설명한 것은?"
        :choices="['이 글 다음에 올 법한 글자를 이어 쓴다', '질문에 공손히 답한다', '틀린 정보를 걸러낸다', '사람의 지시를 거절한다']"
        :answer="0"
        explanation="베이스 모델 = 이어쓰기 기계. 4부에서 조립한 '다음 단어 예측'이 전부입니다."
      />
      <Quiz
        difficulty="easy"
        question="베이스 모델과 챗 모델은 내부 구조(트랜스포머)가 같다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 두뇌는 같고, 마지막 훈련(조련)이 다릅니다."
      />
      <Quiz
        difficulty="easy"
        question="'조련'이 하는 일을 한 줄로 고르면?"
        :choices="['이어쓰기 기계를 비서로 만든다', '모델의 크기를 키운다', '인터넷 지식을 더 넣는다', '수학 계산을 더 정확하게 한다']"
        :answer="0"
        :hints="['이 챕터의 파란 박스 한 줄을 떠올려 보세요.']"
        explanation="조련 = 이어쓰기 기계를 비서로 만드는 훈련. 지식보다 행동 방식을 바꿉니다."
      />
      <Quiz
        difficulty="easy"
        question="조련 파이프라인 3단계 중 SFT(시범 보여주기)는 몇 번째 단계일까요?"
        type="numeric"
        :answer="2"
        explanation="1단계 사전학습 → 2단계 SFT → 3단계 선호 학습(RLHF·DPO). SFT는 2단계입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="베이스 모델에게 '번역해 줘'라고 지시했더니 번역 대신 비슷한 지시문들을 쭉 이어 썼습니다. 왜일까요?"
        :choices="['그런 지시문이 나열된 문서를 본 적이 있어, 다음 항목을 이어 쓰는 것', '한국어를 이해하지 못해서', '번역 기능이 꺼져 있어서', '지시가 너무 어려워서']"
        :answer="0"
        :hints="['베이스 모델의 본업은 지시 수행이 아니라 이어쓰기예요.']"
        explanation="시험지·문제집처럼 지시문이 나열된 텍스트를 학습했기 때문에, '다음에 올 법한 것' = 다음 지시문이라고 예측한 겁니다."
      />
      <Quiz
        difficulty="medium"
        question="베이스 모델이 질문에 안 답하는 것은 능력(지식) 부족이 주된 원인이다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 문제는 능력이 아니라 행동 방식 — 답을 알아도 '답변'이라는 행동을 배운 적이 없는 것뿐입니다."
      />
      <Quiz
        difficulty="medium"
        question="조련 파이프라인에서 '두 답변 중 사람이 더 좋아한 쪽으로 배우는' 단계는?"
        :choices="['3단계 선호 학습 (RLHF·DPO)', '1단계 사전학습', '2단계 SFT', '조련 어디에도 없다']"
        :answer="0"
        explanation="선호 학습(RLHF·DPO)이 사람의 취향을 반영하는 3단계입니다. 4~7장에서 자세히 다뤄요."
      />
      <Quiz
        difficulty="medium"
        question="다음 중 6부에서 '되돌아오는' 수학의 짝이 잘못된 것은?"
        :choices="['LoRA — 3부의 p값', 'SFT — 5부의 크로스 엔트로피', 'KL 목줄 — 5부의 KL 발산', '보상 모델 — 2부의 시그모이드']"
        :answer="0"
        :hints="['LoRA는 거대 행렬을 저차원으로 근사하는 기술이에요 — 어느 부의 수학일까요?']"
        explanation="LoRA가 회수하는 건 1부의 저차원 행렬(rank·SVD 감각)입니다. 나머지 짝은 모두 맞아요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="퓨샷 프롬프트(예시 몇 개 붙이기)로 베이스 모델에게 답변을 흉내 내게 할 수 있는 이유는?"
        :choices="['이어쓰기 본능 때문 — 예시 패턴의 다음 항목을 이어 쓰는 것', '예시를 보면 모델의 구조가 바뀌어서', '예시가 모델을 재훈련시켜서', '우연일 뿐 원리는 없다']"
        :answer="0"
        :hints="['프롬프트는 모델의 가중치를 전혀 바꾸지 못해요.']"
        explanation="'질문-답변, 질문-답변, 질문-' 까지 보여주면 다음에 올 법한 것 = 답변. 이어쓰기 본능을 역이용하는 거죠. 단, 한계가 뚜렷합니다(2장)."
      />
      <Quiz
        difficulty="hard"
        question="조련을 마친 챗 모델에 대한 설명으로 가장 정확한 것은?"
        :choices="['두뇌는 그대로, 행동 방식이 바뀐 것 — 다음 단어 예측 기계라는 본질은 유지된다', '다음 단어 예측을 완전히 버리고 새 원리로 동작한다', '인터넷 지식이 두 배로 늘어난다', '더 이상 확률로 단어를 고르지 않는다']"
        :answer="0"
        :hints="['4부의 결론(LLM = 다음 단어를 확률로 고르는 기계)은 조련 후에도 유효할까요?']"
        explanation="조련 후에도 여전히 다음 단어를 확률로 고르는 기계입니다. 다만 '어떤 다음 단어를 고르는 게 좋은가'가 비서답게 바뀐 것 — 그 바꾸는 방법이 6부 전체 내용입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('sample')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">워밍업 완료 — 준비 끝!</p>
      <p class="mt-1 text-sm text-emerald-700">
        본 학습도 정확히 이렇게 진행됩니다. 다음은 1장 — 사전학습에서 비서까지,
        조련 파이프라인의 전체 지도를 펼칩니다.
      </p>
      <RouterLink
        to="/ch/ch1"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        1장 — 큰 그림 →
      </RouterLink>
    </div>
  </article>
</template>
