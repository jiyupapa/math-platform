<script setup lang="ts">
// 7장 — 과적합: 통째로 외운 학생 (세 번째 핵심). 훈련↓검증↑ 벌어짐 — 일반화 = 표본 밖 성능.
// 다시 쓰는 수학: 3부 5·7장(표본 — 훈련 데이터는 세상의 일부) · 6부 9장(조련 성적표 held-out 평가).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import OverfitLab from '@/components/OverfitLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch7')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">7장 · 약 45분 · ★ 세 번째 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">과적합 — 통째로 외운 학생</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      2~6장의 다이얼은 전부 "얼마나 빨리, 얼마나 깊이 내려가나"였습니다. 이번 질문은 방향이 달라요.
      <b>깊이 내려간 그 바닥, 정말 좋은 곳일까?</b> 기출문제를 통째로 외운 학생을 떠올려 보세요.
      연습 시험은 만점인데, 처음 보는 문제 앞에서 무너집니다. 모델도 정확히 같은 방식으로 무너져요.
      그리고 그 순간은 훈련 일지에 <b>선명한 무늬</b>를 남깁니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지를 가져갑니다. ① 오차는 두 개다: 훈련 오차(연습 점수)와 검증 오차(처음 보는 문제),
      <b>성적은 시험장 밖에서 매겨진다(일반화)</b>, ② 암기의 조건: <b>다이얼(용량) 대 데이터의
      힘겨루기</b>, 곧 다이얼이 데이터보다 많으면 통째로 외울 수 있다, ③ 훈련 일지의 <b>벌어짐 무늬</b>로
      과적합이 시작되는 순간을 곡선에서 읽는다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 시험은 두 번 본다: 훈련 오차와 검증 오차</h2>
    <ReviewFlag id="ch7-s1" chapter="ch7" label="1. 시험은 두 번 본다: 훈련 오차와 검증 오차" />
    <p class="leading-relaxed text-slate-700">
      3부에서 배운 사실 하나가 여기서 결정적입니다. <b>훈련 데이터는 세상의 전부가 아니라 표본</b>이에요.
      표본을 잘 맞히는 것과 세상을 잘 맞히는 것은 다른 능력입니다. 그래서 데이터 일부를 <b>봉인해 두고
      훈련에 쓰지 않습니다</b>. 이 봉인된 몫(검증 데이터)이 "처음 보는 문제" 역할을 해요.
      점수도 둘로 갈립니다:
    </p>
    <MathBlock expr="\text{일반화 갭} \;=\; L_{\text{검증}} - L_{\text{훈련}} \qquad (\text{크면 클수록 암기가 많다는 신호})" />
    <p class="mt-2 leading-relaxed text-slate-700">
      직접 확인해 보죠. 숨은 규칙에서 나온 노이즈 낀 점 10개에 곡선을 맞추는 <b>재단사</b>가 됩니다.
      곡선의 차수(다이얼 수)를 올릴수록 훈련 점수는 오릅니다. 검증 점수도 그럴까요?
    </p>

    <OverfitLab />

    <ConceptCard tone="tip" title="핵심 관찰: 훈련 오차 0의 정체">
      차수 9에서 훈련 오차가 <b>정확히 0</b>이 됐죠. 실력이 아니라 <b>산수</b>입니다. 다이얼(계수)
      10개면 어떤 10개 점도 전부 통과하는 곡선을 만들 수 있어요. 그 곡선이 외운 건 규칙이 아니라
      <b>그날의 노이즈까지</b>입니다. 그래서 검증(처음 보는 문제)에서 폭발해요. 검증 오차의 모양은
      <b>U자</b>: 다이얼이 너무 적으면 규칙을 못 담고(과소적합), 너무 많으면 노이즈까지 외웁니다(과적합).
      그리고 <b>데이터 4배 토글</b>을 켜자 같은 차수 9가 40개 점 앞에선 얌전해졌죠. 다이얼 10개로 40개 점을
      다 못 외우니, <b>암기가 막히면 규칙을 배울 수밖에</b> 없습니다. 과적합은 용량 대 데이터의
      힘겨루기예요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="훈련 오차는 거의 0인데 검증 오차가 폭발했다면, 모델의 상태는?"
      :choices="['과적합: 규칙이 아니라 훈련 데이터(노이즈까지)를 통째로 외웠다', '과소적합: 다이얼이 부족하다', '완벽한 모델: 훈련을 다 맞혔으니까', '데이터가 잘못됐다']"
      :answer="0"
      :hints="['기출문제 만점, 처음 보는 문제 낙제. 그 학생의 공부법은?']"
      explanation="훈련 점수와 검증 점수의 큰 갭 = 암기의 크기. 훈련 오차 0은 자랑이 아니라 경고일 수 있습니다."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="같은 차수 9(다이얼 10개)가 점 40개 앞에서는 과적합하지 못한 이유는?"
      :choices="['다이얼 10개로 40개 점을 전부 통과시킬 수 없어, 오차를 줄이려면 공통 규칙을 배울 수밖에 없으므로', '점이 많으면 노이즈가 사라지므로', '차수 9는 원래 안전한 크기라서', '검증 데이터가 쉬워졌으므로']"
      :answer="0"
      :hints="['미지수 10개, 방정식 40개. 전부 만족시킬 수 있나요?']"
      explanation="암기 용량(다이얼 수)보다 데이터가 많으면 암기 전략 자체가 불가능해집니다. 데이터를 늘리는 것이 가장 정직한 과적합 처방인 이유."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 벌어짐: 훈련 일지에 남는 무늬</h2>
    <ReviewFlag id="ch7-s2" chapter="ch7" label="2. 벌어짐: 훈련 일지에 남는 무늬" />
    <p class="leading-relaxed text-slate-700">
      실전에서는 차수 슬라이더를 돌리는 게 아니라 <b>훈련 스텝이 흐릅니다</b>. 용량이 큰 모델 하나를
      두고 시간이 갈수록 어떻게 되는지가 진짜 질문이에요. 다행히 경사하강에는 성격이 있습니다:
      <b>큰 패턴을 먼저 배우고, 노이즈 암기는 나중에</b> 해요. 그래서 훈련이 흐르는 동안 검증 손실은
      "규칙을 배우는 초반"엔 내려가고, "암기가 시작되는 순간"부터 올라갑니다. 실험 ②의 두 곡선이
      <b>벌어지는 지점</b>이 바로 그 순간입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 과적합 / 과소적합 / 일반화 / 검증 데이터">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>과적합</b> (overfitting). 읽는 법: 오버피팅.
          뜻: 훈련 데이터(노이즈까지)를 통째로 외워 <b>처음 보는 데이터에서 나빠지는</b> 상태.
          이 과정의 비유 "통째로 외운 학생"의 실무 이름.
        </li>
        <li>
          <b>과소적합</b> (underfitting). 읽는 법: 언더피팅.
          뜻: 용량이 부족해 <b>규칙조차 못 담은</b> 상태. 훈련·검증 둘 다 나쁨. U자의 반대쪽 끝.
        </li>
        <li>
          <b>일반화</b> (generalization). 읽는 법: 제너럴라이제이션.
          뜻: <b>처음 보는(표본 밖) 데이터에서의 성능</b>. 머신러닝이 진짜로 원하는 단 하나의 점수.
        </li>
        <li>
          <b>검증 데이터</b> (validation set). 읽는 법: 밸리데이션 셋.
          뜻: 훈련에 쓰지 않고 봉인해 둔 "처음 보는 문제". 설정 파일의 <code>eval_dataset</code>,
          훈련 일지의 <code>eval_loss</code>가 이것. 비유로는 <b>모의고사</b>.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">점수는 처음 보는 문제에서 매겨진다. 훈련 오차는 실력이 아니라 암기까지 섞인 점수다</p>
      <p class="mt-1 text-sm text-indigo-600">훈련↓ 검증↑, 두 곡선이 벌어지는 순간이 과적합의 시작입니다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="훈련 손실이 계속 내려가는 중에도 모델은 나빠지고 있을 수 있다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 실험 ②에서 검증 최저 이후가 정확히 그 구간. 훈련 손실 하강은 학습과 암기를 구분하지 못하므로, 나빠짐은 검증 곡선만이 알려 줍니다."
    />

    <DetailsCard title="➕ 더 깊이: 3분할, LLM이 과적합 얘기를 덜 하는 이유, 이중 하강">
      실무는 데이터를 셋으로 나눕니다. <b>훈련/검증/테스트</b>. 검증(모의고사)으로 다이얼을 고르다
      보면 <b>모의고사에도 서서히 과적합</b>하기 때문에(수십 번 보다 보면 모의고사 유형을 외움),
      최종 발표용 점수는 한 번도 안 본 <b>테스트(수능 당일)</b>로 매겨요. 그런데 LLM 사전학습
      논문들은 과적합 걱정을 의외로 덜 합니다: 데이터(수조 토큰)가 파라미터보다 훨씬 많고 보통
      <b>1에포크 미만</b>이라 같은 문제를 두 번 보지 않거든요. 거꾸로 <b>파인튜닝은 소량 데이터 ×
      여러 에포크</b>라 과적합이 일상입니다. 8부가 6부의 실전 짝꿍인 이유. 이름만 알아 둘 것:
      <b>이중 하강</b>(double descent): 용량을 극단까지 키우면 검증 오차가 다시 내려가는 현상도
      관측됩니다(현대 딥러닝의 미스터리). U자가 이야기의 끝이 아니라는 것만 기억해 두세요.
    </DetailsCard>

    <ReviewFlag id="ch7-ai" chapter="ch7" label="🤖 AI 연결 · 다시 쓰는 수학: 6부 9장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 · 다시 쓰는 수학: 6부 9장">
      <b><PartLink :part="6" ch="ch9">6부 9장</PartLink></b>의 조련 성적표에서 "훈련에 안 쓴 데이터로
      평가한다"는 원칙을 봤었죠. 그 held-out 평가가 바로 오늘의 검증입니다. 실전 장면: SFT 데이터
      1,000개를 10에포크 돌리면 <code>train_loss</code>는 곱게 내려가는데 <code>eval_loss</code>가
      중간부터 올라갑니다. 모델이 응답 스타일을 배우다가 <b>예문 자체를 암기</b>하기 시작한 거예요.
      처방은 이 장에서 이미 두 개 배웠습니다(멈추기, 데이터 늘리기). 다음 장은 세 번째인
      <b>암기를 어렵게 만드는 안전장치</b>(weight decay·드롭아웃·조기 종료)입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="과적합: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="과적합(overfitting)이란?"
        :choices="['훈련 데이터는 잘 맞히지만 처음 보는 데이터에서 성능이 나빠지는 상태', '훈련이 너무 빨리 끝나는 것', '모델이 너무 작아서 규칙을 못 담는 것', 'GPU 메모리가 넘치는 것']"
        :answer="0"
        explanation="통째로 외운 학생이에요. 연습 만점, 처음 보는 문제 낙제. 노이즈까지 외운 대가입니다."
      />
      <Quiz
        difficulty="easy"
        question="일반화(generalization)란?"
        :choices="['처음 보는(훈련에 없던) 데이터에서의 성능', '모델을 여러 용도로 쓰는 것', '수식을 일반형으로 정리하는 것', '훈련 데이터를 늘리는 것']"
        :answer="0"
        explanation="머신러닝이 원하는 단 하나의 점수예요. 훈련 점수는 이것의 대리물일 뿐이고, 암기가 섞이면 대리물 자격을 잃습니다."
      />
      <Quiz
        difficulty="easy"
        question="검증 데이터(validation set)를 훈련에 쓰지 않고 봉인해 두는 이유는?"
        :choices="['처음 보는 문제 역할을 시켜 암기가 아닌 실력(일반화)을 재기 위해', '데이터를 아끼기 위해', '훈련 속도를 높이기 위해', '노이즈를 제거하기 위해']"
        :answer="0"
        explanation="훈련에 쓴 데이터로 재면 암기도 만점으로 보입니다. 봉인이 풀리는 순간 시험이 아니게 돼요."
      />
      <Quiz
        difficulty="easy"
        question="훈련 오차가 0이어도 나쁜 모델일 수 있다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 실험 ①의 차수 9가 그 증거. 다이얼이 점보다 많으면 어떤 데이터든(노이즈까지) 완벽 암기가 가능하므로, 훈련 오차 0은 실력의 증거가 못 됩니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="모델 A: 훈련 오차 0.5, 검증 오차 0.6. 모델 B: 훈련 오차 0.1, 검증 오차 0.9. 각각의 일반화 갭(검증 − 훈련)을 구하세요."
        :steps="[
          { lhs: '갭 A', answer: 0.1 },
          { lhs: '갭 B', answer: 0.8 },
        ]"
        :hints="['갭 = 검증 오차 − 훈련 오차.', 'B는 훈련은 훨씬 잘 맞히지만 갭이 8배예요. 어느 쪽이 암기를 많이 했을까요?']"
        explanation="갭 A = 0.1, 갭 B = 0.8. 뽑아야 할 모델은 검증이 낮은 A입니다. B의 화려한 훈련 점수는 암기(0.8만큼)로 만든 것이에요."
      />
      <Quiz
        difficulty="medium"
        question="실험 ①에서 차수 9가 점 10개의 훈련 오차를 정확히 0으로 만들 수 있었던 이유는?"
        :choices="['다이얼(계수)이 10개라 10개 점을 전부 통과하는 곡선이 항상 존재하므로', '차수 9가 숨은 규칙과 우연히 일치해서', '노이즈가 없는 데이터라서', '검증 데이터를 몰래 봤기 때문']"
        :answer="0"
        explanation="미지수 10개 ≥ 조건 10개. 실력이 아니라 산수입니다. 용량 ≥ 데이터면 완벽 암기가 언제나 가능해요."
      />
      <Quiz
        difficulty="medium"
        question="검증 오차를 차수(용량)에 대해 그리면 U자가 됩니다. U자의 왼쪽 끝과 오른쪽 끝의 이름은?"
        :choices="['왼쪽 = 과소적합(규칙도 못 담음), 오른쪽 = 과적합(노이즈까지 외움)', '왼쪽 = 과적합, 오른쪽 = 과소적합', '양쪽 다 과적합', '양쪽 다 정상: U자는 우연']"
        :answer="0"
        explanation="다이얼이 너무 적으면 훈련·검증 둘 다 나쁘고(과소), 너무 많으면 훈련만 좋아집니다(과). 최적은 그 사이 어딘가."
      />
      <Quiz
        difficulty="medium"
        question="실험 ②에서 훈련 초반엔 검증 손실도 함께 내려간 이유는?"
        :choices="['경사하강이 큰 패턴(규칙)을 먼저 배우기 때문(노이즈 암기는 그보다 나중에 시작된다)', '초반엔 노이즈가 없기 때문', '검증 데이터가 훈련에 섞여 있었기 때문', '우연이다']"
        :answer="0"
        explanation="규칙을 배우는 동안은 훈련·검증이 함께 좋아집니다. 벌어짐은 배울 규칙이 소진되고 암기가 시작되는 신호예요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="검증 손실 최저점을 지나서도 훈련을 계속하면 어떻게 되고, 무엇을 해야 하나?"
        :choices="['훈련 손실은 계속 내려가지만 검증은 나빠진다. 최저점 근처에서 멈추는 것이 낫다(조기 종료)', '충분히 오래 돌리면 검증도 다시 내려오므로 계속 돌린다', '학습률을 올려서 빨리 끝낸다', '훈련 손실이 0이 될 때까지 돌리는 것이 항상 정답이다']"
        :answer="0"
        :hints="['실험 ②의 초록 점선, 멈출 자리.']"
        explanation="최저점 이후는 암기만 느는 구간입니다. 검증 최저에서 멈추는 조기 종료는 8장 안전장치의 하나이고, 벌어짐 무늬는 9장 훈련 일지 판독의 단골입니다."
      />
      <Quiz
        difficulty="hard"
        question="SFT 데이터 1,000개로 10에포크를 돌렸더니 train_loss는 곱게 내려가는데 eval_loss가 3에포크부터 올라갑니다. 진단과 처방은?"
        :choices="['과적합: 예문 암기가 시작됐다. 에포크를 줄이거나(조기 종료) 데이터를 늘린다', '과소적합: 에포크를 더 늘린다', '학습률이 너무 작다. lr을 올린다', '정상: eval_loss는 원래 올라간다']"
        :answer="0"
        :hints="['소량 데이터 × 여러 에포크 = 같은 문제를 열 번 본 학생.']"
        explanation="파인튜닝의 단골 사고입니다. 같은 예문을 반복해서 보면 스타일 학습이 암기로 넘어가요. 멈추기·데이터 늘리기, 그리고 다음 장의 안전장치(정규화)가 처방전입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch7')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">7장 완료! 이제 훈련 점수에 속지 않습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        멈추기·데이터 늘리기까지 배웠으니, 남은 처방은 하나, 암기를 어렵게 만드는
        안전장치들(weight decay·드롭아웃·조기 종료)입니다. 6부의 KL 목줄과 형제인 이야기예요.
      </p>
      <RouterLink
        to="/ch/ch8"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        8장: 안전장치들, 정규화 →
      </RouterLink>
    </div>
  </article>
</template>
