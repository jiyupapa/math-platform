<script setup lang="ts">
// Phase 0 워밍업 챕터 — 9부 전체가 풀 문제("숫자를 담는 칸은 유한하다")를 몸으로 먼저 느낀다.
// 실제 Phase 1~11 챕터도 이 구조를 그대로 따른다.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import FloatShockLab from '@/components/FloatShockLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('sample')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">워밍업 · 10분 몸풀기</p>
    <h1 class="mb-4 text-3xl font-bold">0.1 + 0.2는 0.3이 아니다</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      본격적인 학습 전 몸풀기입니다. 앞으로 모든 챕터가 이 페이지처럼 진행돼요 —
      설명 카드를 읽고, 실험을 직접 만져 보고, 문제를 풀면 진도가 채워집니다.
      막히면 <b>힌트</b>가 있고, 두 번 틀리면 <b>해설</b>도 열 수 있으니 부담 없이 시작하세요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      실험 두 개로 9부 전체의 출발 질문을 얻습니다 —
      <b>"컴퓨터는 무한한 실수를 유한한 칸에 담는다 — 그 칸이 AI의 품질과 몸무게를 정한다."</b>
      학교 산수와 컴퓨터 산수가 갈라지는 순간을 직접 목격합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대 — 계산기를 의심해 본 적 있나요</h2>
    <ReviewFlag id="sample-s1" chapter="sample" label="1. 무대 — 계산기를 의심해 본 적 있나요" />
    <p class="leading-relaxed text-slate-700">
      수포자에게도 계산기만큼은 믿음의 영역이죠 — <b>숫자를 넣으면 정확한 답이 나온다.</b>
      그런데 시리즈 내내 다뤄 온 AI 의 숫자들(임베딩·가중치·확률)을 계산하는 기계가,
      사실은 초등학교 산수부터 미세하게 다른 답을 내고 있다면요?
      지금 이 화면의 브라우저로 직접 확인해 봅시다.
    </p>

    <FloatShockLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 컴퓨터가 틀린 게 아니라, 칸이 유한하다">
      컴퓨터는 계산을 잘못한 적이 없습니다. 문제는 저장 — 컴퓨터의 숫자 칸은 <b>눈금이 새겨진
      자</b>와 같아서, 눈금 위에 없는 수(0.1)는 <b>가장 가까운 눈금에 반올림해</b> 담깁니다.
      실험 ①의 티끌 오차는 그 반올림의 흔적이고(0.5·0.25처럼 눈금 위의 수는 멀쩡했죠),
      실험 ②의 "1 삼키기"는 <b>큰 수 구간일수록 눈금 간격이 벌어진다</b>는 힌트입니다 —
      간격이 2인 구간에서 +1은 제자리로 반올림되니까요. 참고로 이 "삼키기"에는 공식 이름이
      있어요 — <b>흡수(absorption)</b>. 4장에서 제대로 해부합니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="0.1 + 0.2가 정확히 0.3이 되지 않는 근본 이유는?"
      :choices="['0.1과 0.2를 정확히 담을 눈금이 없어 가장 가까운 눈금에 반올림해 저장했기 때문', '컴퓨터가 고장 나서 — 다른 컴퓨터에서는 정확히 0.3이 나온다', '더하기 연산 자체에 버그가 있어서', '0.1이 무리수라서']"
      :answer="0"
      :hints="['실험 ①의 🔍 돋보기에서 0.1의 실제 저장값이 어땠는지 보세요.']"
      explanation="재료(0.1, 0.2)부터 이미 가장 가까운 눈금으로 반올림돼 있었습니다 — 그 티끌이 더해져 답에 드러난 것뿐, 계산도 컴퓨터도 멀쩡해요. 어느 컴퓨터에서 해도 똑같이 나오는 결정적 현상입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="sample-s2" chapter="sample" label="2. 오늘의 발견에 이름표 달기" />
    <p class="leading-relaxed text-slate-700">
      방금 목격한 현상들에는 전부 공식 이름이 있습니다. 9부 내내 쓸 첫 이름표 세 개만
      먼저 달아 두죠 — 자세한 해부는 각 장에서 합니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 비트 / 부동소수점 / 반올림 오차">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>비트</b> (bit) — 읽는 법: 비트.
          뜻: 컴퓨터 정보의 최소 칸 — 0 아니면 1 하나를 담는 스위치. 모든 숫자 칸은
          비트 몇 개를 묶어 만듭니다(2장에서 이 칸으로 수를 세는 법부터 시작).
        </li>
        <li>
          <b>부동소수점</b> (floating point) — 읽는 법: 부동소수점(뜰 부, 움직일 동 — "소수점이
          떠다닌다"). 뜻: 컴퓨터가 실수를 담는 표준 방식 — 이 과정의 비유로는 <b>고무줄 자</b>
          (0 근처는 눈금이 촘촘하고 큰 수 쪽은 성긴 자)입니다. 실험 ②의 정체이며 3장의 주인공.
        </li>
        <li>
          <b>반올림 오차</b> (rounding error) — 읽는 법: 반올림 오차.
          뜻: 눈금 위에 없는 수를 <b>가장 가까운 눈금으로</b> 옮겨 담을 때 생기는 티끌 —
          실험 ①의 정체. 티끌이지만 수십억 번 쌓이면 문제가 됩니다(4장).
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="실험 ②에서 10¹⁶ + 1 − 10¹⁶ 이 0이 된 이유는?"
      :choices="['그 구간은 눈금 간격이 1보다 넓어서, +1의 결과가 가장 가까운 눈금(제자리)으로 반올림됐기 때문', '컴퓨터가 큰 수의 덧셈을 지원하지 않아서', '1이 어떤 수에 더해져도 무시되는 특별한 수라서', '메모리가 가득 차서']"
      :answer="0"
      :hints="['작은 수 쪽 눈금은 촘촘하고 큰 수 쪽은 성긴 자 — 고무줄 자를 떠올려 보세요.']"
      explanation="10¹⁶ 부근의 눈금 간격은 2입니다. +1의 결과는 어느 눈금에도 없어서 제자리로 반올림되죠. 1이 특별해서가 아니라 그 구간의 눈금이 성겨서예요 — 작은 수 구간에서는 1이 멀쩡히 더해집니다."
    />

    <DetailsCard title="➕ 더 깊이: 그런데 왜 화면엔 늘 0.1로 보였을까">
      0.1의 실제 저장값은 0.10000000000000000555… 인데 화면엔 늘 "0.1"로 떠서 아무도 눈치채지
      못합니다 — 표시할 때는 <b>같은 눈금으로 되돌아올 수 있는 가장 짧은 표기</b>로 반올림해
      보여주기 때문이에요(0.1 + 0.2처럼 티끌이 이웃 눈금으로 번져야 비로소 들통). 그래서
      돈 계산처럼 티끌이 치명적인 곳은 처음부터 이 칸을 피합니다 — 은행은 금액을
      <b>정수(원·센트 단위)</b>로 세거나 십진 전용 방식을 쓰죠. 그리고 이 과정의 종착지 미리보기:
      Ollama 모델 태그의 <code>q4_K_M</code> 은 "숫자 하나를 <b>4비트 칸</b>에 담았다"는
      뜻입니다 — 칸을 줄일수록 오차는 커지고 파일은 가벼워지는 거래, 그 수학이 8~11장입니다.
    </DetailsCard>

    <ReviewFlag id="sample-ai" chapter="sample" label="🤖 AI 연결 — 시리즈의 모든 숫자가 이 칸에 산다" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 시리즈의 모든 숫자가 이 칸에 산다">
      <b><PartLink :part="4" ch="ch10">4부 10장</PartLink></b>에서 조립한 GPT 의 실체는 결국
      수십억 개의 숫자였죠 — 그 숫자 <b>하나하나가 오늘 본 유한한 칸</b>에 담겨 있습니다.
      칸을 몇 비트로 하느냐가 모델 파일의 크기(7B 모델이 4GB 가 되는 이유)와 답변 품질을
      가르고, 훈련 중의 티끌 오차·오버플로는 손실 스파이크 같은 실제 사고로 이어져요.
      그 칸을 고르는 기술 — fp32·fp16·int4 — 이 9부 전체의 이야기입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="0.1 + 0.2는 0.3이 아니다 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="실험 ①에서 이 브라우저가 계산한 0.1 + 0.2의 값은?"
        :choices="['0.30000000000000004', '정확히 0.3', '0.29999999999999', '에러가 났다']"
        :answer="0"
        explanation="가장 유명한 부동소수점 티끌 — 어느 컴퓨터·어느 언어에서 해도 똑같이 나오는 결정적 현상입니다."
      />
      <Quiz
        difficulty="easy"
        question="0.1 + 0.2 ≠ 0.3 현상은 컴퓨터 고장이라서, 컴퓨터를 바꾸면 해결된다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 고장이 아니라 저장 방식(유한한 칸 + 반올림)의 필연이라, 어떤 컴퓨터로 바꿔도 똑같이 나와요."
      />
      <Quiz
        difficulty="easy"
        question="컴퓨터가 눈금 위에 없는 수(예: 0.1)를 저장하는 방법은?"
        :choices="['가장 가까운 눈금으로 반올림해 담는다', '정확히 그대로 담는다', '저장을 거부하고 에러를 낸다', '0으로 바꿔 담는다']"
        :answer="0"
        explanation="자에 없는 눈금은 만들어낼 수 없으니, 가장 가까운 눈금에 담고 티끌 오차를 감수합니다 — 그 티끌의 이름이 반올림 오차예요."
      />
      <Quiz
        difficulty="easy"
        question="실험 ②에서 컴퓨터가 계산한 10¹⁶ + 1 − 10¹⁶ 의 값은?"
        type="numeric"
        :answer="0"
        explanation="그 구간의 눈금 간격은 2 — +1이 가장 가까운 눈금(제자리)으로 반올림돼 0이 됩니다. 1 삼키기!"
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="0.1이 컴퓨터 칸에 정확히 담기지 않는 이유로 가장 정확한 것은?"
        :choices="['컴퓨터의 눈금은 2진(비트) 기반인데 0.1은 2진으로 무한 반복 소수라 어느 눈금에도 정확히 안 떨어져서', '0.1이 무리수여서', '메모리가 부족해 뒷자리가 잘려나가서', '소수점은 원래 컴퓨터가 다룰 수 없어서']"
        :answer="0"
        :hints="['1/3을 십진 소수로 쓰면 0.333… 끝이 없죠 — 0.1을 2진으로 쓰면 같은 일이 벌어집니다.']"
        explanation="십진의 1/3 = 0.333… 처럼, 0.1은 2진법에서 0.000110011… 무한 반복입니다. 유한한 비트로는 어딘가에서 끊고 반올림할 수밖에 없어요. (0.1은 분수 1/10, 엄연한 유리수 — 무리수 아님!)"
      />
      <Quiz
        difficulty="medium"
        question="다음 중 컴퓨터의 2진 눈금 위에 정확히 있어서 오차 없이 저장되는 수는?"
        :choices="['0.25 (= 1/4)', '0.1 (= 1/10)', '0.3 (= 3/10)', '0.2 (= 1/5)']"
        :answer="0"
        :hints="['2를 몇 번 나눠서 만들 수 있는 수인지 보세요 — 1/2, 1/4, 1/8…']"
        explanation="0.25 = 1/2² 이라 2진 눈금(1/2, 1/4, 1/8…의 조합) 위에 정확히 있습니다. 실험 ①의 0.5 + 0.25가 멀쩡했던 이유죠. 분모에 5가 들어가는 0.1·0.2·0.3은 전부 무한 반복이 됩니다."
      />
      <Quiz
        difficulty="medium"
        question="실험 ②의 '1 삼키기'가 10¹⁶ 부근에서 시작된 것에서 알 수 있는 컴퓨터 자의 성질은?"
        :choices="['눈금 간격이 수의 크기에 따라 달라진다 — 작은 수 쪽은 촘촘하고 큰 수 쪽은 성기다', '눈금 간격은 어디서나 똑같다', '큰 수는 아예 저장할 수 없다', '눈금은 십진법으로 새겨져 있다']"
        :answer="0"
        :hints="['같은 +1인데 작은 수에서는 멀쩡했고 큰 수에서는 삼켜졌죠.']"
        explanation="간격이 일정한 보통 자가 아니라 크기에 비례해 눈금이 벌어지는 고무줄 자입니다 — 그래서 이름이 부동(떠다니는)소수점이에요. 구조는 3장에서 해부합니다."
      />
      <Quiz
        difficulty="medium"
        question="0.1의 저장값이 0.100000000000000005… 로 어긋나 있는데도 화면엔 '0.1'로 보이는 이유는?"
        :choices="['표시할 때는 같은 눈금으로 되돌아오는 가장 짧은 표기로 반올림해 보여주기 때문', '화면에 보일 때만 저장값이 정확해지기 때문', '모니터가 뒷자리를 표시하지 못하기 때문', '운영체제가 오차를 자동으로 고쳐 주기 때문']"
        :answer="0"
        explanation="저장은 어긋난 채, 표시만 짧게 반올림합니다 — 그래서 평소엔 들통나지 않다가 0.1 + 0.2처럼 티끌이 번지는 순간 꼬리가 드러나요. 돋보기(toFixed)로 강제로 길게 펼치면 언제든 볼 수 있습니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="은행 시스템이 잔고를 계산할 때 오늘 실험의 소수 칸을 그대로 쓰지 않는 이유와 대처로 가장 알맞은 것은?"
        :choices="['잔돈 계산마다 티끌 오차가 끼어 쌓일 수 있으므로, 금액을 정수(원·센트 단위)나 십진 전용 방식으로 센다', '은행 컴퓨터는 특수 하드웨어라 오차가 원래 없다', '오차가 나면 고객에게 유리한 쪽으로 반올림하면 된다', '금액이 큰 수라서 오차가 저절로 사라진다']"
        :answer="0"
        :hints="['0.1을 열 번 더한 실험의 결과가 정확히 1이었나요?']"
        explanation="0.1 열 번이 1이 안 되는 칸에 돈을 맡길 수는 없죠. 그래서 금액은 1원·1센트를 눈금 1로 두는 정수로 세는 게 정석입니다 — 정수는 1 삼키기 경계(약 9천조) 안에서는 눈금 위에 정확히 있으니까요."
      />
      <Quiz
        difficulty="hard"
        question="오늘 실험과 '7B 모델 파일이 4GB가 되는 것'의 공통 주제로 가장 알맞은 것은?"
        :choices="['둘 다 숫자 하나를 몇 비트 칸에 담느냐의 문제 — 칸이 유한해서 오차가 생기고, 칸을 줄이면 파일이 가벼워진다', '둘은 아무 관련이 없다', '인터넷 전송 속도의 문제다', '모델이 숫자를 저장하지 않는다는 뜻이다']"
        :answer="0"
        :hints="['q4_K_M 의 4가 무엇의 개수였는지 — 더 깊이 카드를 보세요.']"
        explanation="모델 = 수십억 개의 숫자이고, 숫자 하나의 칸 크기 × 개수 = 파일 크기입니다. 칸을 32비트에서 4비트로 줄이면 파일은 1/8이 되지만 오늘 본 반올림 오차가 커지죠 — 그 거래의 수학이 9부 후반(8~11장)입니다."
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
        본 학습도 정확히 이렇게 진행됩니다. 다음은 1장 — 숫자의 몸무게,
        "모델 = 수십억 개의 숫자"에서 출발해 파일 크기를 계산하는 지도를 폅니다.
      </p>
      <RouterLink
        to="/ch/ch1"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        1장 — 숫자의 몸무게 →
      </RouterLink>
    </div>
  </article>
</template>
