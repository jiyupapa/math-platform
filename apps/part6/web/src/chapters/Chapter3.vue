<script setup lang="ts">
// 3장 — SFT: 시범 보여주기 (핵심). 조련의 첫 단계가 새 수학이 아니라
// 5부 4장 크로스 엔트로피 + 4부 11장 경사하강의 재사용임을 확인한다.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import SftTrainerLab from '@/components/SftTrainerLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch3')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">3장 · 약 45분 · 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">SFT — 시범 보여주기</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      2장의 결론은 "가중치를 바꿔야 한다"였습니다. 이번 장에서 드디어 바꿉니다.
      그런데 놀랍게도 <b>새 수학이 등장하지 않아요</b> — 채점기는 5부에서,
      갱신 방법은 4부에서 이미 배웠습니다. SFT의 발명은 수식이 아니라 <b>데이터</b>에 있습니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      SFT 를 한 문장으로 말할 수 있게 됩니다 —
      <b>"모범답안에 대한 크로스 엔트로피 최소화. 사전학습과 같은 수학, 다른 데이터."</b>
      그리고 손실 마스킹이 왜 필요한지까지.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 시범이 데이터가 되는 법</h2>
    <ReviewFlag id="ch3-s1" chapter="ch3" label="1. 시범이 데이터가 되는 법" />
    <p class="leading-relaxed text-slate-700">
      SFT 데이터는 사람이 쓴 <b>지시 → 모범답안</b> 쌍이었죠(1장).
      모델에게 먹일 때는 이 쌍을 <b>한 줄의 텍스트로 이어 붙입니다</b>:
    </p>
    <div class="my-3 rounded-lg bg-slate-100 p-3 font-mono text-sm text-slate-700">
      요청: 존댓말로 바꿔줘: 내일 회의 취소해 <span class="text-indigo-600 font-semibold">답변: 내일 회의를 취소해 주시겠어요?</span>
    </div>
    <p class="leading-relaxed text-slate-700">
      이렇게 만들면 그다음은 <b>사전학습과 똑같은 "다음 단어 맞히기" 훈련</b>이 됩니다.
      단, 채점 범위가 다릅니다 — 지시 부분은 채점하지 않고 <b>답변 부분만</b> 채점해요.
      "질문을 잘 외우는 모델"이 아니라 "답변하는 행동"을 배우게 하려는 거죠.
      이 기법의 이름이 <b>손실 마스킹</b>입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 대화 템플릿 / 손실 마스킹">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>대화 템플릿</b> (chat template) — 읽는 법: 챗 템플릿.
          뜻: 지시·답변을 이어 붙일 때 쓰는 <b>고정된 형식</b>(누가 말하는 차례인지 표시하는 특수 표식 포함).
          모델은 이 표식을 보고 "지금은 답변 차례"임을 압니다.
        </li>
        <li>
          <b>손실 마스킹</b> (loss masking) — 읽는 법: 로스 마스킹.
          뜻: 훈련 시 <b>지시 부분의 손실을 0으로 가려서</b> 답변 토큰만 채점하는 기법.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="SFT 훈련에서 손실을 계산(채점)하는 부분은?"
      :choices="['답변(모범답안) 토큰만', '지시 토큰만', '지시와 답변 전부 똑같이', '아무 토큰도 채점하지 않는다']"
      :answer="0"
      :hints="['모델이 배워야 할 행동이 무엇인지 생각해 보세요 — 질문하기? 답변하기?']"
      explanation="손실 마스킹 — 지시는 가리고 답변만 채점합니다. 배워야 할 행동은 '답변'이니까요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 채점기는 이미 배웠다 — 크로스 엔트로피</h2>
    <ReviewFlag id="ch3-s2" chapter="ch3" label="2. 채점기는 이미 배웠다 — 크로스 엔트로피" />
    <p class="leading-relaxed text-slate-700">
      답변 토큰을 채점하는 자는 5부 4장에서 배운 그대로입니다.
      모범답안의 각 토큰이 "정답"이 되고, 모델이 그 정답 토큰에 준 확률이 q 라면:
    </p>
    <MathBlock expr="\text{토큰 하나의 손실} = -\log_2 q(\text{정답 토큰})" />
    <p class="leading-relaxed text-slate-700">
      직관도 그대로예요 — <b>확신하고 맞히면(q≈1) 손실 0, 자신 없던 정답일수록(q≈0) 손실 폭발</b>.
      크게 놀란 만큼 크게 배웁니다. 아래 훈련기에서 직접 확인하세요.
    </p>

    <SftTrainerLab />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="훈련 전 실험에서 손실이 가장 컸던 토큰은 '주시겠어요?'(q=2%)였다. 그 이유는?"
      :choices="['모델이 가장 자신 없어 한 정답이라 −log q 가 폭발해서', '토큰의 글자 수가 가장 길어서', '마스킹이 안 된 유일한 토큰이라서', '무작위로 정해진 것']"
      :answer="0"
      explanation="−log₂(0.02) ≈ 5.6비트. 자신 없던 정답일수록 손실이 크고, 그만큼 크게 배웁니다 — 5부 4장의 성질 그대로."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 반복하면 경사하강 — 그리고 결정적 차이</h2>
    <ReviewFlag id="ch3-s3" chapter="ch3" label="3. 반복하면 경사하강 — 그리고 결정적 차이" />
    <p class="leading-relaxed text-slate-700">
      "한 스텝 훈련" 버튼이 하던 일이 바로 4부 11장의 학습 루프입니다:
      손실을 재고 → 손실이 줄어드는 방향(기울기)을 구해 → 가중치를 조금 밀고 → 반복.
      수만 개의 시범으로 이 루프를 돌리면, "요청에는 답변한다"는 행동이 <b>가중치에 새겨집니다</b>.
    </p>
    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">SFT = 모범답안에 대한 크로스 엔트로피 최소화</p>
      <p class="mt-1 text-sm text-indigo-600">사전학습과 같은 수학, 다른 데이터 — 발명은 수식이 아니라 "무엇을 먹이는가"에 있다.</p>
    </div>
    <p class="leading-relaxed text-slate-700">
      ch2의 퓨샷과 대비하면 차이가 선명합니다. 퓨샷은 문맥으로 분포를 <b>잠깐</b> 밀었고 문맥이
      사라지면 원상복귀였죠. SFT 는 분포 자체(가중치)를 바꿔서, <b>예시 없이도(제로샷)</b>
      행동이 나오고 문맥 창도 통째로 돌려받습니다 — 2장의 한계 ①④가 한 번에 풀려요.
    </p>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 그런데 시범만으로 안 되는 것</h2>
    <ReviewFlag id="ch3-s4" chapter="ch3" label="4. 그런데 시범만으로 안 되는 것" />
    <p class="leading-relaxed text-slate-700">
      SFT 를 마치면 모델은 답변을 합니다(1장 실험의 2단계). 하지만 시범 데이터에는
      구조적인 빈틈이 있어요 — <b>모범답안은 "정답 하나"만 보여줄 뿐,
      "이 답이 저 답보다 얼마나 더 나은가"를 표현할 수 없습니다</b>.
      장황한 답과 간결한 답 중 뭐가 나은지, 정중한 거절과 무성의한 거절의 차이 같은
      <b>정도(취향)의 문제</b>는 시범 형식에 안 담겨요. 게다가 좋은 시범을 사람이 일일이
      쓰는 건 비쌉니다. 그래서 다음 단계가 필요합니다 — <b>두 답변 중 어느 쪽이 나은지만</b>
      고르게 하는 것. 그게 4장의 선호 데이터입니다.
    </p>

    <DetailsCard title="➕ 더 깊이: 진짜 대화 템플릿은 이렇게 생겼어요">
      실제 모델들은 특수 토큰으로 차례를 표시합니다. 예를 들면
      <code>&lt;|user|&gt; 내일 회의 취소해 줘 &lt;|assistant|&gt; 내일 회의를 취소해 드릴게요</code> 같은 식.
      Ollama 로 모델을 받으면 함께 오는 템플릿이 바로 이것이고, 템플릿이 어긋나면 조련된 모델도
      이상하게 답합니다("멈추지 않는" 증상이 다시 나타나기도). 시스템 프롬프트("너는 친절한 비서다")도
      이 템플릿의 한 자리에 끼워 넣는 텍스트일 뿐이에요.
    </DetailsCard>

    <ReviewFlag id="ch3-ai" chapter="ch3" label="🤖 AI 연결 — 회수하는 수학: 5부 4장 · 4부 11장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 5부 4장 · 4부 11장">
      이 장의 전부가 재회였습니다. <b><PartLink :part="5" ch="ch4">5부 4장</PartLink></b>: 크로스 엔트로피 −log q(정답) — SFT 의 채점기.
      <b><PartLink :part="4" ch="ch11">4부 11장</PartLink></b>: 손실 → 기울기 → 가중치 갱신 루프 — SFT 의 엔진.
      ChatGPT 를 만든 첫 조련 단계가, 여러분이 이미 아는 두 조각의 조립이라는 것 —
      이게 이 시리즈가 "아는 수학의 재회"라고 말한 이유입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="SFT — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="SFT 를 가장 정확히 요약한 것은?"
        :choices="['모범답안에 대한 크로스 엔트로피 최소화 — 같은 수학, 다른 데이터', '전혀 새로운 손실함수의 발명', '프롬프트에 예시를 붙이는 기법', '모델 크기를 키우는 기법']"
        :answer="0"
        explanation="이 장의 파란 박스 그대로입니다. 채점기(CE)도 엔진(경사하강)도 기존 그대로 — 새로운 건 지시→모범답안 데이터."
      />
      <Quiz
        difficulty="easy"
        question="SFT 와 사전학습의 손실함수는 같다 (둘 다 다음 단어에 대한 크로스 엔트로피)."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 다른 것은 먹이는 데이터(인터넷 텍스트 vs 지시→모범답안)와 채점 범위(마스킹)뿐이에요."
      />
      <Quiz
        difficulty="easy"
        question="손실 마스킹이 가리는(채점하지 않는) 부분은?"
        :choices="['지시(사용자 입력) 부분', '답변 부분', '문장의 마지막 토큰', '특수 토큰만']"
        :answer="0"
        explanation="지시를 가리고 답변만 채점 — 배워야 할 행동이 답변이기 때문입니다."
      />
      <Quiz
        difficulty="easy"
        question="모델이 정답 토큰에 확률 q≈1 을 줬다면(확신하고 맞힘) 그 토큰의 손실은 거의 얼마일까요?"
        type="numeric"
        :answer="0"
        explanation="−log₂(1) = 0. 확신한 정답은 손실 0 — 이미 아는 것에서는 배울 게 없다는 뜻이기도 해요."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="모범답안 세 토큰에 모델이 준 확률이 각각 1/2, 1/4, 1/8 이었습니다. 토큰별 손실(비트)과 평균 손실을 구하세요."
        :steps="[
          { lhs: '-\\log_2(1/2)', answer: 1 },
          { lhs: '-\\log_2(1/4)', answer: 2 },
          { lhs: '-\\log_2(1/8)', answer: 3 },
          { lhs: '\\text{평균}', answer: 2 },
        ]"
        :hints="['−log₂(1/N) = \'2를 몇 번 곱하면 N이 되나\' — 5부 1장의 감각 그대로.', '(1+2+3) ÷ 3']"
        explanation="1비트, 2비트, 3비트 — 평균 2비트. 자신 없던 토큰(1/8)일수록 손실이 큽니다."
      />
      <Quiz
        difficulty="medium"
        question="SFT 가 ch2 퓨샷의 한계 ①(문맥 창 자리 차지)을 해결하는 이유는?"
        :choices="['행동이 가중치에 새겨져 예시를 매번 보낼 필요가 없어지므로', '문맥 창 자체가 늘어나므로', '예시를 자동으로 압축하므로', '해결하지 못한다']"
        :answer="0"
        explanation="제로샷으로도 행동이 나오니 예시 자리가 통째로 돌아옵니다. 한계 ④(지워지면 끝)도 함께 해결 — 가중치는 문맥과 달리 지워지지 않으니까요."
      />
      <Quiz
        difficulty="medium"
        question="지시 부분을 마스킹하지 않고 전부 채점하면 생길 수 있는 문제는?"
        :choices="['모델이 답변하기보다 사용자 지시문 스타일을 재생성하는 쪽도 함께 배운다', '손실이 항상 0이 된다', '훈련이 아예 불가능해진다', '아무 차이 없다']"
        :answer="0"
        :hints="['채점되는 것 = 배우는 것. 지시가 채점되면 무엇을 배우게 될까요?']"
        explanation="채점되는 토큰이 곧 배우는 대상입니다. 지시까지 채점하면 훈련 신호가 '지시문 쓰기'에 분산돼요 — 그래서 답변에만 신호를 모읍니다."
      />
      <Quiz
        difficulty="medium"
        question="훈련기에서 '한 스텝 훈련'이 하던 일의 정체는?"
        :choices="['손실이 줄어드는 방향으로 가중치를 조금 미는 경사하강 한 걸음', '예시를 문맥에 하나 추가하는 것', '모델의 답변을 사람이 고쳐 쓰는 것', '토큰을 하나 삭제하는 것']"
        :answer="0"
        explanation="4부 11장의 학습 루프 한 바퀴입니다. 손실 → 기울기 → 가중치 갱신 — 반복하면 q 가 오르고 손실이 내려가죠."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="SFT 데이터 형식의 구조적 빈틈 — 그래서 4장(선호 데이터)이 필요해지는 이유는?"
        :choices="['모범답안은 정답 하나만 보여줄 뿐, 답변 간의 우열(정도·취향)을 표현할 수 없어서', 'SFT 는 가중치를 바꾸지 못해서', '모범답안이 항상 틀려서', '크로스 엔트로피가 계산 불가능해서']"
        :answer="0"
        :hints="['장황한 답 vs 간결한 답 — 시범 형식으로 이 차이를 가르칠 수 있나요?']"
        explanation="시범은 '이렇게 해'만 말할 수 있고 '이쪽이 저쪽보다 나아'를 못 말합니다. 그 비교 정보를 담는 형식이 선호 쌍(A/B + 선택) — 4장의 주인공입니다."
      />
      <Quiz
        difficulty="hard"
        question="회사 챗봇을 SFT 로 조련했더니, 훈련에 넣은 유형의 질문엔 완벽한데 처음 보는 유형에서 가끔 이어쓰기 증상이 나옵니다. 가장 그럴듯한 진단은?"
        :choices="['시범 데이터가 그 유형을 덮지 못해 사전학습 분포가 새어 나온 것 — 시범 보강이 필요', '크로스 엔트로피가 잘못된 손실이라서', '마스킹을 해서 생긴 부작용이라서', '문맥 창이 너무 길어서']"
        :answer="0"
        :hints="['1장 노트북에서 배운 적 없는 요청을 넣었을 때 무슨 일이 있었죠?']"
        explanation="SFT 는 시범이 덮은 영역의 분포를 바꿉니다. 덮지 못한 곳에선 원래 분포(이어쓰기)가 새어 나와요 — 데이터 커버리지 문제이지 수학의 문제가 아닙니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch3')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">3장 완료 — 첫 조련을 마쳤어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 4장 — "어느 답이 더 나은가"라는 사람의 취향을 숫자로 바꾸는 보상 모델.
        3부의 조건부 확률과 2부의 시그모이드가 돌아옵니다.
      </p>
      <RouterLink
        to="/ch/ch4"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        4장 — 사람의 취향을 숫자로 →
      </RouterLink>
    </div>
  </article>
</template>
