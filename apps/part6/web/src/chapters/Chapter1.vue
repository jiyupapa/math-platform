<script setup lang="ts">
// 1장 — 큰 그림: 사전학습에서 비서까지. 6부 전체의 지도를 그리는 챕터.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import PipelineExplorer from '@/components/PipelineExplorer.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch1')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">1장 · 약 35분</p>
    <h1 class="mb-4 text-3xl font-bold">큰 그림 — 사전학습에서 비서까지</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업에서 "조련 전 모델은 이어쓰기 기계"라는 문제를 봤죠.
      이번 장은 그 해답의 <b>전체 지도</b>를 그립니다. 새 수식은 없어요.
      앞으로 9개 장에서 한 칸씩 열어 볼 지도를 먼저 손에 쥐는 게 목표입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      조련 파이프라인 3단계(<b>사전학습 → SFT → 선호 학습</b>)를 지도로 갖습니다.
      각 단계가 <b>무엇을 먹고</b>(데이터), <b>무엇을 바꾸는지</b>(행동), 그리고
      이 과정의 어느 장에서 배우는지까지.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 비유 하나: 요리사 키우기</h2>
    <ReviewFlag id="ch1-s1" chapter="ch1" label="1. 비유 하나: 요리사 키우기" />
    <p class="leading-relaxed text-slate-700">
      식당에서 일할 요리사를 키운다고 해 봅시다. 순서는 이렇습니다.
    </p>
    <ul class="mt-2 list-disc space-y-1 pl-6 leading-relaxed text-slate-700">
      <li><b>① 세상 모든 요리책을 통째로 읽힌다</b>: 지식은 어마어마해지는데, 아직 주문을 받아 본 적이 없어요.</li>
      <li><b>② 선배가 옆에서 시범을 보인다</b>: "주문이 들어오면 <i>이렇게</i> 요리해서 내는 거야." 모범 사례를 따라 하게 합니다.</li>
      <li><b>③ 손님 반응으로 다듬는다</b>: 두 접시 중 손님이 더 좋아한 쪽의 방향으로 조금씩 고쳐 갑니다.</li>
    </ul>
    <p class="mt-2 leading-relaxed text-slate-700">
      LLM 조련이 정확히 이 3단계입니다. ① 이 <b>사전학습</b>, ② 가 <b>SFT</b>, ③ 이 <b>선호 학습</b>.
      아래 실험에서 같은 요청 하나를 들고 세 단계를 직접 통과해 보세요.
    </p>

    <PipelineExplorer />

    <ConceptCard tone="tip" title="핵심 관찰: 단계마다 '먹는 데이터'가 다르다">
      1단계는 <b>그냥 글</b>(라벨 없음)을 어마어마하게 먹고, 2단계는 <b>사람이 쓴 모범 답안</b>을,
      3단계는 <b>사람의 선택</b>(A/B 중 어느 쪽이 나은가)을 먹습니다.
      뒤로 갈수록 데이터 양은 확 줄지만 <b>사람 손은 더 많이</b> 들어가요.
      조련이란 결국 <b>사람의 기준을 모델에 옮겨 넣는 일</b>이기 때문입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="SFT 단계가 먹는 데이터로 알맞은 것은?"
      :choices="['사람이 작성한 지시 → 모범 답안 쌍', '라벨 없는 인터넷 텍스트', '답변 A/B에 대한 사람의 선택', 'GPU 사용 로그']"
      :answer="0"
      :hints="['요리사 비유에서 ② 선배의 시범에 해당해요.']"
      explanation="SFT = 모범 답안을 보고 따라 하기. 라벨 없는 텍스트는 사전학습, A/B 선택은 선호 학습의 데이터입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 세 단계에 이름표 달기</h2>
    <ReviewFlag id="ch1-s2" chapter="ch1" label="2. 세 단계에 이름표 달기" />

    <ConceptCard tone="note" title="새 용어: 파이프라인의 세 단계">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>사전학습</b> (pretraining). 읽는 법: 프리트레이닝.
          뜻: 인터넷 텍스트로 <b>다음 단어 예측</b>을 시키는 첫 단계. 지식·말솜씨가 생기지만 행동은 이어쓰기.
          규모: 수조 개 토큰, 수개월, 파이프라인 비용의 대부분.
        </li>
        <li>
          <b>SFT</b> (Supervised Fine-Tuning). 읽는 법: 에스에프티, 지도 미세조정.
          뜻: 사람이 쓴 <b>지시→모범 답안</b> 쌍으로 "요청에는 답변한다"는 행동을 가르치는 단계.
          규모: 수만~수십만 쌍.
        </li>
        <li>
          <b>선호 학습</b> (preference learning). 뜻: 답변 두 개 중 <b>사람이 더 좋아한 쪽</b>의 방향으로 다듬는 단계(RLHF·DPO 가 여기 속함).
          간결함·정확함·안전함이 여기서 생깁니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-4 leading-relaxed text-slate-700">
      한 줄로 정리하면 이렇게 됩니다:
    </p>
    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">지식은 사전학습이, 행동은 SFT가, 취향은 선호 학습이 만든다</p>
      <p class="mt-1 text-sm text-indigo-600">그래서 조련(SFT+선호 학습)은 지식을 거의 안 바꾸고 행동 방식을 바꿉니다. ch0의 관찰 그대로.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="조련(SFT + 선호 학습)을 마친 모델은 사전학습 때보다 세상 지식이 훨씬 많아진다."
      type="truefalse"
      :answer="1"
      explanation="거짓입니다. 지식은 대부분 사전학습에서 옵니다. 조련이 바꾸는 건 그 지식을 꺼내 쓰는 행동 방식(답변·간결·안전)이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 이 지도에서 6부가 가는 길</h2>
    <ReviewFlag id="ch1-s3" chapter="ch1" label="3. 이 지도에서 6부가 가는 길" />
    <p class="leading-relaxed text-slate-700">
      이제 남은 9개 장이 이 지도의 어디에 있는지 표시해 둡시다.
      길을 잃을 때마다 여기로 돌아오면 됩니다.
    </p>
    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[28rem] text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3">지도 위치</th>
            <th class="py-2 pr-3">장</th>
            <th class="py-2">배우는 것</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">출발점</td><td class="py-2 pr-3"><b>2장</b></td><td class="py-2">이어쓰기 기계의 한계: 왜 프롬프트만으론 안 되나</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">2단계 SFT</td><td class="py-2 pr-3"><b>3장</b></td><td class="py-2">시범 보여주기: 알고 보면 같은 크로스 엔트로피</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3" rowspan="3">3단계 선호 학습</td><td class="py-2 pr-3"><b>4장</b></td><td class="py-2">사람의 취향을 숫자로: 보상 모델</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3"><b>5~6장</b></td><td class="py-2">보상으로 배우기 → RLHF 와 KL 목줄</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3"><b>7장</b></td><td class="py-2">DPO: 보상 모델 없이 가는 지름길</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">도구</td><td class="py-2 pr-3"><b>8장</b></td><td class="py-2">LoRA: 어느 단계든 살짝만(싸게) 조련</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">검수</td><td class="py-2 pr-3"><b>9장</b></td><td class="py-2">조련 성적표: 평가와 부작용</td></tr>
          <tr><td class="py-2 pr-3">완성</td><td class="py-2 pr-3"><b>10장</b></td><td class="py-2">🎯 캡스톤: 파이프라인 전체 조립</td></tr>
        </tbody>
      </table>
    </div>

    <DetailsCard title="➕ 더 깊이: 실무 용어 정리 · '파인튜닝'과 모델 이름표">
      실무에서 <b>파인튜닝</b>(fine-tuning)이라는 말은 SFT 만 가리키기도 하고, 조련 전체(SFT+선호 학습)를
      뭉뚱그리기도 합니다. 또 이 전체 과정을 <b>정렬</b>(alignment, 모델을 사람의 의도에 맞춘다는 뜻)이라고도 불러요.
      모델 이름 끝의 꼬리표로 단계를 읽을 수 있습니다:
      <code>-base</code> = 사전학습만 / <code>-instruct</code>·<code>-chat</code> = 조련 완료.
      Ollama 에서 받는 모델들이 대부분 instruct 계열인 이유이기도 합니다.
    </DetailsCard>

    <ReviewFlag id="ch1-ai" chapter="ch1" label="🤖 AI 연결 · 다시 쓰는 수학: 이 장은 지도, 수학은 다음 장부터" />
    <ConceptCard tone="ai" title="🤖 AI 연결 · 다시 쓰는 수학: 이 장은 지도, 수학은 다음 장부터">
      1단계 사전학습의 수학은 이미 배웠습니다. <b><PartLink :part="4" ch="ch11">4부 11장</PartLink></b>(손실과 경사하강)과
      <b><PartLink :part="5" ch="ch6">5부 6장</PartLink></b>(학습 = 분포 흉내내기)이 바로 그 수학이에요. 6부의 새 내용은 2·3단계입니다:
      SFT 에서 5부의 크로스 엔트로피가(3장), 선호 학습에서 3부의 확률과 5부의 KL 이(4~7장) 되돌아옵니다.
      지도를 쥐었으니, 다음 장부터 한 칸씩 엽니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="큰 그림: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="조련 파이프라인의 순서로 올바른 것은?"
        :choices="['사전학습 → SFT → 선호 학습', 'SFT → 사전학습 → 선호 학습', '선호 학습 → SFT → 사전학습', '순서는 상관없다']"
        :answer="0"
        explanation="지식(사전학습) → 행동(SFT) → 취향(선호 학습) 순서입니다. 요리책 통독 → 선배 시범 → 손님 반응."
      />
      <Quiz
        difficulty="easy"
        question="파이프라인에서 데이터 양이 압도적으로 많은 단계는 사전학습이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 사전학습은 수조 개 토큰이라, SFT·선호 학습의 수만~수십만 쌍과 자릿수가 다릅니다."
      />
      <Quiz
        difficulty="easy"
        question="요리사 비유에서 '손님이 더 좋아한 접시 방향으로 다듬기'에 해당하는 단계는?"
        :choices="['선호 학습', '사전학습', 'SFT', '토큰화']"
        :answer="0"
        explanation="A/B 중 더 나은 쪽으로 다듬기 = 선호 학습(RLHF·DPO)입니다."
      />
      <Quiz
        difficulty="easy"
        question="조련 파이프라인은 모두 몇 단계일까요?"
        type="numeric"
        :answer="3"
        explanation="사전학습 → SFT → 선호 학습, 3단계입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="'지식은 ___이, 행동은 ___가, 취향은 ___이 만든다.' 빈칸에 차례로 들어갈 말은?"
        :choices="['사전학습 / SFT / 선호 학습', 'SFT / 사전학습 / 선호 학습', '선호 학습 / SFT / 사전학습', '사전학습 / 선호 학습 / SFT']"
        :answer="0"
        :hints="['이 장의 파란 박스 한 줄이에요.']"
        explanation="지식=사전학습, 행동=SFT, 취향=선호 학습. 이 한 줄이 6부 전체의 지도입니다."
      />
      <Quiz
        difficulty="medium"
        question="SFT 를 마친 모델(선호 학습 전)에 대한 설명으로 가장 알맞은 것은?"
        :choices="['답변은 하지만 아직 다듬어지지 않았다 (장황함 등)', '여전히 답변하지 않고 이어 쓴다', '이미 완벽한 비서다', '지식이 사라진 상태다']"
        :answer="0"
        :hints="['실험에서 2단계 모델의 응답을 떠올려 보세요.']"
        explanation="SFT 후에는 '요청에 답변한다'는 행동은 생기지만, 간결함·취향은 아직이에요. 그걸 다듬는 게 3단계입니다."
      />
      <Quiz
        difficulty="medium"
        question="뒤 단계로 갈수록(사전학습 → SFT → 선호 학습) 데이터의 특징 변화로 알맞은 것은?"
        :choices="['양은 줄고, 사람 손이 더 많이 들어간다', '양도 늘고 사람 손도 늘어난다', '양은 늘고 사람 손은 줄어든다', '아무 변화 없다']"
        :answer="0"
        explanation="수조 토큰(라벨 없음) → 사람이 쓴 모범답안 → 사람의 선택. 조련 = 사람의 기준을 옮겨 넣는 일이라 뒤로 갈수록 사람 개입이 진해집니다."
      />
      <Quiz
        difficulty="medium"
        question="모델 이름이 'somemodel-7b-base' 라면 이 모델의 상태는?"
        :choices="['사전학습만 마침: 이어쓰기 기계', '조련까지 완료: 비서', 'SFT만 마침', '아직 아무 학습도 안 함']"
        :answer="0"
        :hints="['더 깊이 카드의 모델 이름표 읽는 법을 떠올려 보세요.']"
        explanation="-base = 사전학습만. 조련이 끝난 모델은 보통 -instruct 나 -chat 꼬리표가 붙습니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="사내 문서 말투로 답하는 챗봇을 만들려 합니다. 회사에는 '질문 → 모범 답변' 예시 3천 개가 있어요. 이 데이터가 바로 쓰이는 단계는?"
        :choices="['SFT: 지시·모범답안 쌍이 정확히 이 형식', '사전학습: 텍스트는 전부 사전학습용', '선호 학습: 사람이 만든 데이터니까', '어디에도 못 쓴다']"
        :answer="0"
        :hints="['데이터의 형식(지시→답안 쌍)이 어느 단계의 밥인지 보세요.']"
        explanation="지시→모범답안 쌍은 SFT의 데이터 형식 그대로입니다. 선호 학습에 쓰려면 답변 A/B + 선택 형태로 바꿔야 해요."
      />
      <Quiz
        difficulty="hard"
        question="'조련을 오래 할수록 모델이 아는 사실이 늘어난다'는 주장이 이 장의 지도와 어긋나는 이유는?"
        :choices="['지식은 주로 사전학습에서 오고, 조련은 행동·취향을 바꾸기 때문', '조련은 데이터를 전혀 쓰지 않기 때문', '지식은 선호 학습에서만 생기기 때문', '어긋나지 않는다. 맞는 주장이다']"
        :answer="0"
        :hints="['파란 박스: 지식·행동·취향의 담당이 각각 달랐죠.']"
        explanation="조련(SFT+선호 학습)의 데이터는 양이 적고 목적도 행동 교정입니다. 새 지식 주입이 목적이면 사전학습(또는 추가 사전학습) 쪽 일이에요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch1')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">1장 완료! 지도를 손에 넣었어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 2장, 조련 없이 프롬프트만으로 버텨 보고, 그 한계를 정확히 확인합니다.
        "왜 조련이 필요한가"에 스스로 답할 수 있게 돼요.
      </p>
      <RouterLink
        to="/ch/ch2"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        2장: 이어쓰기 기계의 한계 →
      </RouterLink>
    </div>
  </article>
</template>
