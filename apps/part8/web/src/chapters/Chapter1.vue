<script setup lang="ts">
// 1장 — 큰 그림: 안개 낀 산과 여행자. 8부 전체의 지도를 그리는 챕터.
// 회수하는 수학: 2부 8장(편미분 — 가중치별 기울기) · 4부 11장(트랜스포머의 손실).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import LossLandscapeLab from '@/components/LossLandscapeLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch1')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">1장 · 약 35분</p>
    <h1 class="mb-4 text-3xl font-bold">큰 그림 — 안개 낀 산과 여행자</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업의 골짜기는 1차원이었죠. 진짜 모델의 무대는 <b>가중치 수십억 개가 만드는 지형</b>이고,
      훈련이란 그 위를 걷는 여행입니다. 이번 장은 새 수식 없이 그 무대의 <b>전체 지도</b>를
      그립니다 — 지형에는 무엇이 있고, 여행자는 무엇이 보이며(스포일러: 거의 안 보입니다),
      앞으로 배울 다이얼들이 이 그림 어디에 붙는지까지.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지를 가져갑니다 — ① <b>손실 지형</b>이라는 그림(가중치 값 조합마다 손실이라는 고도),
      ② 여행자의 조건: <b>안개</b>(전체 지도는 못 보고 발밑 경사만 안다) — 그 이유(조합 폭발)까지,
      ③ 지형의 지물들(골짜기·국소최소·평원)과 <b>8부 여정표</b>.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대 — 손실 지형</h2>
    <ReviewFlag id="ch1-s1" chapter="ch1" label="1. 무대 — 손실 지형" />
    <p class="leading-relaxed text-slate-700">
      모델의 가중치 값들을 하나 정하면, 훈련 데이터 전체에 대한 손실이 하나 정해집니다.
      즉 손실은 <b>모든 가중치의 함수</b>예요:
    </p>
    <MathBlock expr="L(w_1,\; w_2,\; \dots,\; w_{\text{수십억}})" />
    <p class="leading-relaxed text-slate-700">
      가중치가 2개면 이 함수는 <b>지도 위의 고도</b>처럼 그릴 수 있습니다 — 그 그림의 이름이
      <b>손실 지형</b>입니다. 훈련은 이 지형에서 가장 낮은 곳을 찾아 내려가는 여행이고,
      2부 8장에서 배운 편미분이 <b>발밑의 방향별 경사</b>, 그 모음(그래디언트)이 "어느 쪽이
      가장 가파른 내리막인가"를 알려 주죠. 아래에서 직접 여행해 보세요 — 특히
      <b>안개 버튼</b>을 꼭 눌러 보시길.
    </p>

    <LossLandscapeLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 여행자는 지도를 본 적이 없다">
      실험 ①에서 여러분은 신의 시점(지도 전체)을 봤지만, 여행자는 <b>발밑 경사 하나</b>만 보고
      걸었습니다. 그리고 실험 ②가 그 이유를 말해 줬죠 — 지형 전체를 그리는 비용은 가중치 수에
      따라 <b>조합 폭발</b>하지만(10^가중치 수), 발밑 기울기는 역전파 한 번이면 됩니다.
      국소최소에 갇힌 여행자가 답답해 보였다면 기억하세요 — <b>그는 더 깊은 곳이 있다는 사실
      자체를 알 수 없습니다.</b> 훈련의 모든 어려움과 모든 다이얼이 이 조건에서 나옵니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'안개 낀 산'이라는 비유에서 안개가 뜻하는 것은?"
      :choices="['여행자(훈련 알고리즘)는 지형 전체를 못 보고 현재 위치의 기울기만 안다', '훈련 데이터에 노이즈가 많다', 'GPU가 뜨거워서 김이 난다', '손실 값이 부정확하게 계산된다']"
      :answer="0"
      :hints="['안개 버튼을 눌렀을 때 여행자에게 보이던 것은 무엇뿐이었죠?']"
      explanation="지형 전체 계산은 조합 폭발로 불가능 — 훈련은 발밑 경사(그래디언트)만 보며 걷는 국소적 여행입니다. 그래서 출발점·보폭·관성 같은 다이얼이 운명을 가르죠."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 지형의 지물들</h2>
    <ReviewFlag id="ch1-s2" chapter="ch1" label="2. 지형의 지물들" />
    <p class="leading-relaxed text-slate-700">
      실험에서 만난 지물들에 이름표를 달아 둡시다. 여행자를 괴롭히는 것은 대부분 이 셋입니다 —
      <b>더 깊은 곳이 있는데 발밑이 평평해 멈추는 웅덩이</b>(국소최소), <b>발밑이 거의 평평해
      하염없이 기어가게 되는 벌판</b>(평원), 그리고 워밍업에서 본 <b>너무 가파른 사면</b>
      (보폭을 잘못 잡으면 폭발하는 곳). 지형에는 안장점이라는 더 미묘한 지물도 있는데 —
      말안장처럼 한 방향으론 골짜기, 다른 방향으론 능선인 지점 — 고차원에서 이게 왜
      국소최소보다 흔한 주인공인지는 10장에서 다룹니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 손실 지형 / 전역·국소최소 / 평원">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>손실 지형</b> (loss landscape) — 읽는 법: 로스 랜드스케이프.
          뜻: 가중치 값 조합을 위치로, 손실을 <b>고도</b>로 본 지형. 훈련 = 이 지형의 하산.
        </li>
        <li>
          <b>전역최소 / 국소최소</b> (global / local minimum) — 읽는 법: 글로벌/로컬 미니멈.
          뜻: 지형 전체에서 가장 낮은 곳 / <b>주변보다만</b> 낮아 발밑 경사가 0이 되는 웅덩이 —
          여행자는 그 차이를 현장에서 구분할 수 없습니다.
        </li>
        <li>
          <b>평원</b> (plateau) — 읽는 법: 플래토.
          뜻: 경사가 거의 0인 넓은 지역. 방향은 있는데 <b>걸음이 짧아져</b> 훈련이 하염없이
          느려집니다 — 손실 곡선이 옆으로 기는 구간의 흔한 범인(9장에서 판독).
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">훈련은 안개 낀 산의 하산이다 — 전체 지도는 아무도 못 보고, 발밑 기울기만 보며 걷는다</p>
      <p class="mt-1 text-sm text-indigo-600">8부의 모든 다이얼은 "안개 속에서 잘 걷는 기술"입니다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="국소최소에 도착한 여행자(훈련 알고리즘)의 상태로 정확한 것은?"
      :choices="['발밑 경사가 0이라 더 깊은 곳의 존재를 알 방법이 없어 그 자리에 멈춘다', '더 깊은 곳을 알지만 힘이 없어 못 간다', '자동으로 전역최소로 순간이동한다', '손실이 무한대로 치솟는다']"
      :answer="0"
      explanation="서쪽 능선 출발의 운명 — 기울기 0은 '주변보다 낮다'일 뿐 '가장 낮다'가 아닌데, 안개 속 여행자에겐 둘이 똑같이 보입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 여정표 — 다이얼들이 이 그림 어디에 붙는가</h2>
    <ReviewFlag id="ch1-s3" chapter="ch1" label="3. 여정표 — 다이얼들이 이 그림 어디에 붙는가" />
    <p class="leading-relaxed text-slate-700">
      이제 8부의 남은 장들을 이 그림 위에 배치할 수 있습니다. 길을 잃을 때마다 여기로 돌아오세요.
    </p>
    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[28rem] text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3">여행의 고민</th>
            <th class="py-2 pr-3">다이얼 / 기술</th>
            <th class="py-2">장</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">한 걸음을 얼마나 크게?</td><td class="py-2 pr-3">학습률</td><td class="py-2"><b>2장 (핵심)</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">나침반(기울기)을 얼마나 정확히 잴까?</td><td class="py-2 pr-3">미니배치 SGD·배치 크기</td><td class="py-2"><b>3장</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">지그재그 골짜기를 빠르게</td><td class="py-2 pr-3">모멘텀(관성)</td><td class="py-2"><b>4장</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">축마다 가파름이 다르면?</td><td class="py-2 pr-3">Adam(적응적 보폭)</td><td class="py-2"><b>5장 (핵심)</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">여행 단계마다 보폭을 다르게</td><td class="py-2 pr-3">학습률 스케줄</td><td class="py-2"><b>6장</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">깊이 내려갔는데… 좋은 도착지인가?</td><td class="py-2 pr-3">과적합과 일반화</td><td class="py-2"><b>7장 (핵심)</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">이상한 곳으로 못 가게 묶기</td><td class="py-2 pr-3">정규화(weight decay 등)</td><td class="py-2"><b>8장</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">여행 일지(손실 곡선) 읽는 법</td><td class="py-2 pr-3">훈련 진단</td><td class="py-2"><b>9장</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">지형 자체의 함정들</td><td class="py-2 pr-3">안장점·평원의 기하</td><td class="py-2"><b>10장</b></td></tr>
          <tr><td class="py-2 pr-3">전부 조립</td><td class="py-2 pr-3">🎯 파인튜닝 설정 완독</td><td class="py-2"><b>11장</b></td></tr>
        </tbody>
      </table>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="가중치가 10개뿐인 모델이라도 손실 지형 전체를 (축마다 10칸 격자로) 계산해 그리는 것은 사실상 불가능하다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 10^10 = 100억 번의 손실 계산 — 겨우 10개인데도요. 수십억 개면 우주적 숫자가 됩니다. 그래서 안개는 걷히지 않아요."
    />

    <DetailsCard title="➕ 더 깊이: 그런데 지형 그림은 어떻게 그린 걸까?">
      "아무도 전체 지도를 못 본다"면서 연구 논문에는 손실 지형 그림이 자주 나옵니다 — 비결은
      7부 5장에서 배운 것과 같은 <b>요약</b>입니다. 수십억 차원 중 <b>딱 2개 방향만 골라</b>
      그 평면 위의 손실만 계산해 그리는 것(2D 슬라이스)이죠. 훈련이 끝난 뒤 근처만 잘라 보는
      관찰용이라, 여행 중의 안개를 걷어 주지는 못합니다. 오늘의 toy 지형(가중치 2개)이
      바로 그런 슬라이스의 축소판이었어요 — 10장에서 이 기법으로 진짜 지형의 함정들을 구경합니다.
    </DetailsCard>

    <ReviewFlag id="ch1-ai" chapter="ch1" label="🤖 AI 연결 — 회수하는 수학: 2부 8장 · 4부 11장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 2부 8장 · 4부 11장">
      이 지형의 재료는 전부 배운 것입니다 — 고도의 정체는
      <b><PartLink :part="4" ch="ch11">4부 11장</PartLink></b>에서 본 트랜스포머의 손실(크로스
      엔트로피)이고, 발밑 경사의 정체는 <b><PartLink :part="2" ch="ch8">2부 8장</PartLink></b>의
      편미분(가중치별 기울기)을 전부 모은 그래디언트입니다. GPT 훈련이란 정확히 이 지형 —
      수십억 차원, 안개 자욱 — 에서 몇 달짜리 하산을 하는 일이고, 그 여행의 성패가
      다음 장부터 배울 다이얼들에 달려 있어요. 첫 다이얼은 워밍업에서 예고한 그것 —
      <b>보폭의 과학</b>입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="안개 낀 산과 여행자 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="손실 지형(loss landscape)이란?"
        :choices="['가중치 값 조합을 위치로, 손실을 고도로 본 지형 — 훈련은 그 하산', '훈련 데이터를 지도에 표시한 것', 'GPU 온도의 분포도', '모델의 출력 확률 그래프']"
        :answer="0"
        explanation="L(w₁, w₂, …) — 가중치들의 함수인 손실을 지형으로 본 그림이 8부 전체의 무대입니다."
      />
      <Quiz
        difficulty="easy"
        question="안개 속 여행자(훈련 알고리즘)가 유일하게 아는 정보는?"
        :choices="['현재 위치의 기울기(발밑 경사)', '지형 전체의 모양', '전역최소의 위치', '다른 여행자들의 경로']"
        :answer="0"
        explanation="역전파가 싸게 알려 주는 발밑 경사 하나 — 그것만으로 수십억 차원을 걸어야 합니다."
      />
      <Quiz
        difficulty="easy"
        question="국소최소는 지형 전체에서 가장 낮은 지점이다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 주변보다만 낮은 웅덩이 — 가장 낮은 곳은 전역최소이고, 안개 속 여행자는 둘을 구분할 수 없어요."
      />
      <Quiz
        difficulty="easy"
        question="가중치가 2개인 모델의 손실 지형은 몇 차원 공간 위의 고도로 그릴 수 있나요?"
        type="numeric"
        :answer="2"
        explanation="가중치 2개 = 2차원 지도 위의 고도 — 그래서 오늘 화면에 그릴 수 있었습니다. 실제는 수십억 차원이라 그릴 수 없어요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="평원(plateau)에서 훈련이 느려지는 이유는?"
        :choices="['기울기가 거의 0이라 걸음(= 보폭 × 기울기)이 짧아져서', '기울기가 너무 커서 폭발하므로', '데이터가 부족해져서', '컴퓨터가 쉬는 구간이라서']"
        :answer="0"
        :hints="['한 걸음의 크기는 보폭 × 무엇이었죠?']"
        explanation="걸음 크기 = 학습률 × 기울기 — 기울기가 0.01이면 보폭이 커도 제자리걸음입니다. 북동쪽 평원 출발의 운명이었죠."
      />
      <Quiz
        difficulty="medium"
        question="'좁고 긴 골짜기에서 여행자가 양쪽 벽을 지그재그로 튕기며 느리게 전진한다' — 이 고민을 다루는 다이얼과 장은?"
        :choices="['모멘텀(관성) — 4장', '청킹 — 7부 7장', '학습률 스케줄 — 6장', '정규화 — 8장']"
        :answer="0"
        :hints="['여정표에서 \'지그재그\'를 찾아보세요.']"
        explanation="지그재그 문제의 처방이 관성(모멘텀)입니다 — 진동 성분은 상쇄되고 전진 성분만 쌓이죠. 4장에서 직접 굴려 봅니다."
      />
      <Quiz
        difficulty="medium"
        question="지형 전체를 계산해 그릴 수 없는 근본 이유는?"
        :choices="['확인할 가중치 조합의 수가 가중치 개수에 대해 지수적으로 폭발해서 (10^가중치 수)', '손실 함수가 비밀이라서', '컴퓨터가 나눗셈을 못 해서', '지형이 매일 바뀌어서']"
        :answer="0"
        explanation="축마다 10칸만 훑어도 10^W — W=10에 벌써 100억입니다. 반면 발밑 기울기는 역전파 한 번(순전파의 2~3배 비용)이면 전부 나와요."
      />
      <Quiz
        difficulty="medium"
        question="같은 지형·같은 다이얼인데 출발점만 달랐던 세 여행의 결과로 옳은 것은?"
        :choices="['남쪽 기슭은 전역최소, 서쪽 능선은 국소최소, 북동쪽 평원은 하염없는 기어가기 — 출발점도 운명을 가른다', '셋 다 같은 곳에 도착했다', '셋 다 폭발했다', '출발점은 결과와 무관하다']"
        :answer="0"
        explanation="실험 ①의 관찰 그대로 — 실전에서 가중치 초기화가 중요한 이유이고, 3장의 노이즈가 뜻밖의 도움이 되는 배경이기도 합니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="훈련 중 손실이 며칠째 거의 안 떨어집니다. 이 장의 그림으로 세울 수 있는 가설로 가장 알맞은 짝은?"
        :choices="['평원에 있거나(기울기 미미) 보폭이 너무 작다 — 곡선과 설정을 함께 봐야 구분된다(9장)', '반드시 국소최소이므로 훈련을 중단해야 한다', '데이터가 전부 소진된 것이다', '손실이 안 떨어지면 항상 성공 신호다']"
        :answer="0"
        :hints="['걸음 크기 = 보폭 × 기울기 — 어느 쪽이 작아도 제자리걸음.']"
        explanation="같은 증상(정체)의 범인이 지형(평원)일 수도, 다이얼(학습률 과소)일 수도 있습니다 — 성급히 단정하지 않고 곡선을 판독하는 법이 9장이에요."
      />
      <Quiz
        difficulty="hard"
        question="'안개를 걷을 수 없다면 좋은 하산은 불가능한 것 아닌가?'라는 물음에 대한 이 과정의 대답은?"
        :choices="['발밑 정보만으로도 잘 걷는 기술들(보폭·관성·적응·일정표·안전장치)이 있고, 그것이 8부의 내용이다', '맞다 — 훈련은 순전히 운이다', '안개는 GPU를 늘리면 걷힌다', '지형을 미리 다 계산해 두면 된다']"
        :answer="0"
        explanation="안개는 조건이지 사형선고가 아닙니다 — 실제로 수십억 차원의 GPT가 훈련되고 있으니까요. 그 기술들의 목록이 방금 본 여정표입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch1')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">1장 완료 — 지도를 손에 넣었어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 2장 — 첫 핵심 챕터입니다. 워밍업에서 발견한 그 경계(1.00)가 왜 하필 1인지,
        보폭과 지형의 가파름 사이의 정확한 관계를 계산으로 밝혀냅니다.
      </p>
      <RouterLink
        to="/ch/ch2"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        2장 — 보폭의 과학, 학습률 →
      </RouterLink>
    </div>
  </article>
</template>
