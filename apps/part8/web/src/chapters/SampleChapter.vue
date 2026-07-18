<script setup lang="ts">
// Phase 0 워밍업 챕터 — 8부 전체가 풀 문제("학습의 성패를 가르는 다이얼")를 몸으로 먼저 느낀다.
// 실제 Phase 1~11 챕터도 이 구조를 그대로 따른다.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import LrFateLab from '@/components/LrFateLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('sample')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">워밍업 · 10분 몸풀기</p>
    <h1 class="mb-4 text-3xl font-bold">같은 모델, 세 개의 운명</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      본격적인 학습 전 몸풀기입니다. 앞으로 모든 챕터가 이 페이지처럼 진행돼요 —
      설명 카드를 읽고, 실험을 직접 만져 보고, 문제를 풀면 진도가 채워집니다.
      막히면 <b>힌트</b>가 있고, 두 번 틀리면 <b>해설</b>도 열 수 있으니 부담 없이 시작하세요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      실험 두 개로 8부 전체의 출발 질문을 얻습니다 —
      <b>"수학(기울기)이 완벽히 같아도, 다이얼 하나가 학습의 운명을 가른다."</b>
      그 첫 번째 다이얼(학습률)의 세 가지 운명 — 기어가기·도착·폭발 — 을 직접 목격합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대 — 2부에서 배운 그 골짜기</h2>
    <ReviewFlag id="sample-s1" chapter="sample" label="1. 무대 — 2부에서 배운 그 골짜기" />
    <p class="leading-relaxed text-slate-700">
      2부 9장에서 배운 학습의 원리를 한 줄로 되살리면 — <b>손실이라는 골짜기에서, 기울기의
      반대 방향으로 한 걸음씩 내려간다</b>(경사하강)였죠. 공식도 한 줄이었습니다:
      <b>새 위치 = 지금 위치 − 보폭 × 기울기</b>. 그런데 그때 슬쩍 지나간 것이 하나 있어요 —
      <b>"보폭"은 대체 누가, 얼마로 정하나?</b> 오늘은 그 보폭 하나만 바꿔서,
      완전히 같은 문제를 세 번 풀어 봅니다.
    </p>

    <LrFateLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 수학은 같았다, 다이얼이 갈랐다">
      세 러너의 기울기 계산은 한 치도 다르지 않았습니다. 그런데 소심이(0.02)는 <b>맞는 방향으로
      기어가느라</b> 하세월이고, 무모이(1.05)는 골짜기를 <b>건너뛰어 반대편 더 높은 곳</b>에
      착지하기를 반복하며 폭발했죠. 게다가 실험 ②에서 봤듯 도착과 폭발 사이에는
      <b>날카로운 경계</b>(이 골짜기에선 정확히 1.00)가 있습니다 — 감이 아니라 계산할 수 있는
      경계라는 것, 그게 이 과정이 다룰 이야기입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="보폭(학습률)이 너무 클 때 손실이 오히려 커지며 폭발하는 이유는?"
      :choices="['골짜기 바닥을 건너뛰어 반대편의 더 높은 곳에 착지하기를 반복해서', '컴퓨터가 큰 숫자를 계산하지 못해서', '기울기의 방향이 반대로 계산돼서', '폭발은 운이 나쁠 때만 생기는 무작위 현상이라서']"
      :answer="0"
      :hints="['실험 ①에서 무모이(💥)의 자취가 골짜기 양쪽을 어떻게 오갔는지 보세요.']"
      explanation="방향은 항상 옳지만 걸음이 골짜기 폭보다 크면 반대편 더 높은 곳에 착지합니다 — 스텝마다 더 높이, 그래서 폭발. 무작위가 아니라 완전히 결정적인 현상이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 다이얼에 이름표 달기</h2>
    <ReviewFlag id="sample-s2" chapter="sample" label="2. 다이얼에 이름표 달기" />
    <p class="leading-relaxed text-slate-700">
      방금 돌린 다이얼이 이 과정 전체의 첫 주인공입니다. 그리고 이런 다이얼들을 부르는
      총칭이 따로 있어요 — 모델이 <b>스스로 배우는 값</b>(가중치)과 달리, <b>사람이 훈련 전에
      정해 주는 값</b>이라는 뜻의 이름입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 학습률 / 하이퍼파라미터 / 발산">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>학습률</b> (learning rate, 약자 <b>lr</b>) — 읽는 법: 러닝 레이트.
          뜻: 경사하강 한 걸음의 <b>보폭</b>. 이 과정의 비유 "보폭"의 실무 이름이며,
          파인튜닝 설정 파일의 <code>lr</code>·<code>learning_rate</code>가 바로 이것입니다.
        </li>
        <li>
          <b>하이퍼파라미터</b> (hyperparameter) — 읽는 법: 하이퍼파라미터.
          뜻: 모델이 배우는 값(파라미터·가중치)이 아니라 <b>사람이 훈련 전에 정하는 다이얼</b>의
          총칭 — 학습률·배치 크기·스케줄·정규화 강도 등. 8부는 이 다이얼들의 과목입니다.
        </li>
        <li>
          <b>발산</b> (divergence) — 읽는 법: 다이버전스.
          뜻: 손실이 줄지 않고 <b>커지기만 하며 폭발</b>하는 것 — 무모이의 운명.
          훈련 로그에서 loss가 NaN·∞로 치솟는 그 사고의 이름입니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="다음 중 하이퍼파라미터(사람이 정하는 다이얼)에 해당하는 것은?"
      :choices="['학습률(보폭)', '모델의 가중치', '훈련 데이터에 들어 있는 문장', '기울기 값']"
      :answer="0"
      explanation="가중치는 모델이 배우는 값, 기울기는 계산되는 값, 데이터는 재료 — 사람이 훈련 전에 돌려 두는 다이얼은 학습률입니다. 8부에서 이런 다이얼을 하나씩 정복해요."
    />

    <DetailsCard title="➕ 더 깊이: 실전 설정 파일 미리보기 — 이 과정의 종착지">
      실제 파인튜닝 설정 파일(6부에서 본 조련의 실행 명세)에는 이런 줄들이 있습니다 —
      <code>learning_rate: 2e-5</code>, <code>warmup_steps: 100</code>, <code>batch_size: 32</code>,
      <code>weight_decay: 0.01</code>. 오늘 기준으로 읽을 수 있는 건 첫 줄의 절반뿐이죠
      ("아, 보폭이구나 — 그런데 왜 0.00002처럼 작지?"). 실제 모델은 파라미터가 수십억 개인
      고차원 골짜기라 경계가 훨씬 예민하기 때문인데 — 이 과정을 마치면(11장 캡스톤)
      저 파일의 <b>모든 줄이 읽히고</b>, 손실 곡선을 보고 어느 줄을 고칠지 판단하게 됩니다.
    </DetailsCard>

    <ReviewFlag id="sample-ai" chapter="sample" label="🤖 AI 연결 — 회수하는 수학: 2부 9장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 2부 9장">
      오늘의 무대는 <b><PartLink :part="2" ch="ch9">2부 9장</PartLink></b>의 경사하강 그대로입니다 —
      "새 위치 = 지금 위치 − 보폭 × 기울기"라는 한 줄 공식에서, 2부가 <b>기울기</b>를 맡았다면
      8부는 <b>보폭과 그 친구들</b>을 맡아요. GPT를 훈련시키는 코드의 심장에도 정확히 이 공식이
      돌고 있고, 그 곁의 다이얼 값 하나에 수억 원짜리 훈련이 성공하기도 폭발하기도 합니다 —
      다음 장에서 이 골짜기를 <b>수십억 차원의 안개 낀 산</b>으로 확장한 전체 지도를 폅니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="같은 모델, 세 개의 운명 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="학습률(learning rate)을 이 과정의 비유로 옮기면?"
        :choices="['경사하강 한 걸음의 보폭', '골짜기의 깊이', '산의 높이', '러너의 체력']"
        :answer="0"
        explanation="새 위치 = 지금 위치 − 보폭 × 기울기 — 그 보폭이 학습률(lr)입니다."
      />
      <Quiz
        difficulty="easy"
        question="실험 ①에서 세 러너의 기울기 계산은 서로 달랐다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 수학(기울기)은 셋 다 완벽히 같았고, 보폭(학습률)만 달랐어요 — 그런데 운명이 갈렸죠."
      />
      <Quiz
        difficulty="easy"
        question="학습률이 너무 작을 때의 증상은?"
        :choices="['방향은 맞지만 너무 느리게 기어간다', '즉시 폭발한다', '거꾸로 올라간다', '아무 문제 없다 — 작을수록 좋다']"
        :answer="0"
        explanation="소심이(0.02)의 운명 — 언젠가는 도착하지만 하세월입니다. 실전에서는 시간·비용이 곧 돈이라 이것도 실패예요."
      />
      <Quiz
        difficulty="easy"
        question="실험 ②의 골짜기 L = (w−3)²에서 도착과 폭발을 가르는 보폭의 경계는? (소수로)"
        type="numeric"
        :answer="1"
        explanation="정확히 1.00 — 그보다 작으면 언젠가 도착, 정확히 1.00이면 무한 진동, 넘으면 폭발입니다. 왜 1인지는 2장에서 계산해요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="하이퍼파라미터와 파라미터(가중치)의 구분으로 옳은 것은?"
        :choices="['하이퍼파라미터 = 사람이 훈련 전에 정하는 다이얼, 파라미터 = 모델이 학습으로 배우는 값', '하이퍼파라미터 = 모델이 배우는 값, 파라미터 = 사람이 정하는 값', '둘은 같은 말이다', '하이퍼파라미터는 하드웨어 사양을 뜻한다']"
        :answer="0"
        :hints="['학습률은 훈련 중에 저절로 배워지나요?']"
        explanation="가중치는 경사하강이 스스로 찾아가지만, 학습률·배치 크기 같은 다이얼은 사람이 밖에서 정합니다 — 그 다이얼의 과목이 8부예요."
      />
      <Quiz
        difficulty="medium"
        question="보폭 1.00에서 러너가 영원히 같은 높이를 왕복(무한 진동)한 이유는?"
        :choices="['걸음이 정확히 골짜기 반대편 같은 높이 지점에 착지해서 — 커지지도 작아지지도 않는 경계', '컴퓨터의 반올림 오류 때문에', '기울기가 0이 되어서', '운이 나빠서 — 다시 하면 도착한다']"
        :answer="0"
        explanation="w−3의 부호만 바뀌고 크기가 그대로인 지점 — 폭발(커짐)과 수렴(작아짐)의 정확한 경계면입니다. 결정적 현상이라 몇 번을 다시 해도 똑같아요."
      />
      <Quiz
        difficulty="medium"
        question="발산(divergence)의 훈련 로그상 증상으로 알맞은 것은?"
        :choices="['손실(loss)이 줄지 않고 치솟다가 NaN·∞가 된다', '손실이 천천히 준다', '손실이 0에 정확히 도달한다', '로그가 아무것도 출력되지 않는다']"
        :answer="0"
        explanation="무모이의 운명이 실전 로그에 찍히는 모습 — 학습률 과대가 1순위 용의자입니다(진단법은 9장 훈련 일지 판독)."
      />
      <Quiz
        difficulty="medium"
        question="실전 파인튜닝 설정의 학습률이 2e-5(0.00002)처럼 극단적으로 작은 이유로 가장 알맞은 것은?"
        :choices="['수십억 차원의 골짜기는 폭발 경계가 훨씬 예민해서 — 안전한 보폭이 그만큼 작다', '큰 숫자를 쓰면 저작권 문제가 생겨서', '작을수록 무조건 결과가 좋아서', '관례일 뿐 아무 이유 없다']"
        :answer="0"
        :hints="['더 깊이 카드 — toy 골짜기와 실제 모델의 차이.']"
        explanation="오늘의 1차원 골짜기는 경계가 1.00이었지만, 거대 모델의 지형은 훨씬 가파르고 예민합니다. 다만 \'작을수록 좋다\'도 아니에요 — 소심이의 운명이 있으니까(적정선 찾기가 2장)."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="동료가 '학습이 폭발했어. 운이 나빴나 봐, 같은 설정으로 다시 돌려 볼게'라고 합니다. 오늘 실험 기준으로 가장 정확한 조언은?"
        :choices="['폭발은 보폭 과대의 결정적 현상 — 같은 설정이면 또 폭발하니 학습률부터 낮춰라', '맞다, 세 번쯤 다시 돌리면 될 것이다', '데이터를 바꾸면 해결된다', 'GPU를 더 좋은 것으로 바꿔라']"
        :answer="0"
        :hints="['실험 ②에서 같은 보폭으로 다시 달리면 결과가 달라졌나요?']"
        explanation="무모이는 몇 번을 다시 뛰어도 폭발합니다 — 경계 밖 보폭은 운이 아니라 수학이니까요. (실전엔 무작위 요소가 약간 있지만, 경계를 한참 넘은 보폭의 답은 언제나 같습니다.)"
      />
      <Quiz
        difficulty="hard"
        question="'가장 빨리 도착하는 보폭'에 대한 추론으로 오늘 실험과 맞는 것은?"
        :choices="['너무 작아도 너무 커도 느리거나 실패한다 — 경계 안쪽 어딘가에 최적의 보폭이 있다', '클수록 항상 빠르다', '작을수록 항상 빠르다', '보폭은 속도와 무관하다']"
        :answer="0"
        :hints="['소심이(0.02)와 적당이(0.3) 중 누가 먼저 도착했죠? 그리고 1.05는?']"
        explanation="0.02는 하세월, 1.05는 폭발, 0.3은 몇 스텝 만에 도착 — 속도와 안전 사이의 최적점이 존재합니다. 그 지점을 계산으로 찾는 것이 2장(보폭의 과학)이에요."
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
        본 학습도 정확히 이렇게 진행됩니다. 다음은 1장 — 안개 낀 산과 여행자,
        오늘의 1차원 골짜기를 수십억 차원의 손실 지형으로 확장한 전체 지도를 폅니다.
      </p>
      <RouterLink
        to="/ch/ch1"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        1장 — 안개 낀 산과 여행자 →
      </RouterLink>
    </div>
  </article>
</template>
