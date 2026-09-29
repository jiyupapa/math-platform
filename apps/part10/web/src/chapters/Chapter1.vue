<script setup lang="ts">
// 1장 — 큰 그림: 훈련의 3재료(N·D·C) 지도와 10부 여정표.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ThreeDialsLab from '@/components/ThreeDialsLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch1')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">1장 · 큰 그림</p>
    <h1 class="mb-4 text-3xl font-bold">키우면 좋아진다, 그런데 얼마나?</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업에서 "점수를 믿는 법"의 문제를 만났다면, 이번엔 반대쪽 질문에서 출발합니다.
      모델을 <b>키우면</b> 좋아진다는데, 대체 <b>얼마나</b>? 그 답을 재려면 먼저
      "키운다"가 정확히 무엇인지부터 갈라야 합니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      훈련의 3재료(<b>파라미터 N · 데이터 D · 컴퓨트 C</b>)를 구분하고,
      셋을 묶는 어림식 <b>C ≈ 6·N·D</b> 로 "훈련 예산 계산서"를 읽을 수 있게 됩니다.
      10부 전체의 좌표축을 세우는 지도 챕터입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: "더 큰 모델"이라는 말의 세 가지 뜻</h2>
    <ReviewFlag id="ch1-s1" chapter="ch1" label="1. 무대: 「더 큰 모델」이라는 말의 세 가지 뜻" />
    <p class="leading-relaxed text-slate-700">
      신모델 발표 기사엔 늘 이런 문장이 있습니다. <i>"파라미터 70B, 학습 토큰 2조 개,
      GPU 수천 장으로 훈련"</i>. 숫자가 셋이나 나오죠. 사실 "모델을 키운다"는 말에는
      서로 다른 세 재료가 섞여 있습니다: <b>몸집</b>(파라미터 수 N), <b>먹인 양</b>(데이터
      토큰 수 D), 그리고 둘을 곱해서 정해지는 <b>훈련의 총 연산량</b>(컴퓨트 C).
      다이얼을 직접 돌려 보며 감을 잡아 봅시다.
    </p>

    <ThreeDialsLab />

    <ConceptCard tone="tip" title="핵심 관찰: 컴퓨트는 곱이라서 무섭게 자란다">
      7B 모델에 1조 토큰이면 C ≈ 6×7B×1T = <b>4.2×10²² FLOPs</b>. A100 GPU 한 장으로
      <b>약 8.5년</b>, 1,000장을 묶어야 사흘입니다. N과 D를 <b>각각 2배</b>로 올리면 C는
      <b>4배</b>(곱셈!). 대형 모델 훈련이 "GPU 공장"의 일이 되는 이유이자,
      재료를 <b>어떻게 배분하느냐</b>가 진짜 전략 문제가 되는 이유입니다. 같은 예산 C로
      "크게 잠깐"과 "작게 오래" 중 뭐가 나은가(4장의 황금비).
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="C ≈ 6·N·D 에서, N(파라미터)과 D(토큰)를 각각 2배로 늘리면 컴퓨트 C는?"
      :choices="['4배 (곱이라서 2×2)', '2배', '6배', '변하지 않는다']"
      :answer="0"
      :hints="['C는 N과 D의 곱입니다. 랩에서 두 다이얼을 한 칸씩 올려 보세요.']"
      explanation="C = 6·(2N)·(2D) = 4·(6·N·D). 재료가 곱으로 묶여 있어 둘 다 키우면 예산이 제곱으로 뜁니다. 이 '곱의 세계'를 다루는 도구(로그)가 다음 장 주인공이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 이름표 달기: N · D · C</h2>
    <ReviewFlag id="ch1-s2" chapter="ch1" label="2. 이름표 달기: N · D · C" />

    <ConceptCard tone="note" title="새 용어: 파라미터 N / 데이터 D / 컴퓨트 C">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>파라미터 수 N</b> (number of parameters). 읽는 법: 엔.
          뜻: 모델 행렬들에 든 <b>숫자(가중치)의 개수</b>, 곧 모델의 몸집. 7B의 B는
          billion(십억)로, 9부 1장에서 공식(V·d + 12·L·d²)으로 직접 세어 본 그 값입니다.
        </li>
        <li>
          <b>데이터 D</b> (training tokens). 읽는 법: 디.
          뜻: 훈련에서 모델에게 먹인 <b>토큰 수</b>. 4부 2장에서 배운 그 토큰(글 조각)입니다.
          "책 몇 권 읽었나"에 해당하는 재료.
        </li>
        <li>
          <b>컴퓨트 C</b> (compute). 비유: <b>훈련 예산</b>.
          뜻: 훈련에 든 <b>총 연산 횟수</b>. 단위는 FLOPs(플롭스, 곱셈·덧셈 같은 부동소수점
          연산 1회가 1 FLOP). 어림식 <b>C ≈ 6·N·D</b>는 "파라미터 하나가 토큰 하나를
          지나가는 데 약 6번의 연산"(왜 6인지는 아래 더 깊이).
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="신모델 스펙 '파라미터 70B · 학습 토큰 2T'에서, 70B와 2T는 각각 어느 재료인가?"
      :choices="['70B = N(몸집), 2T = D(먹인 토큰)', '70B = D, 2T = N', '둘 다 C(컴퓨트)', '70B = 파일 크기, 2T = 속도']"
      :answer="0"
      explanation="70B는 가중치 개수(N), 2T는 훈련 토큰 수(D)입니다. 이 둘을 곱하면(×6) 훈련 예산 C가 나오죠. 랩의 70B급 프리셋이 정확히 이 스펙입니다."
    />

    <DetailsCard title="➕ 더 깊이: 왜 하필 6·N·D 인가 (그리고 GPU-일 환산의 가정)">
      토큰 하나가 모델을 통과할 때, 파라미터 하나마다 <b>순전파에서 약 2회</b>(곱하기 1 +
      더하기 1), 학습이면 <b>역전파에서 약 4회</b>, 합쳐 <b>약 6회</b>의 연산이 듭니다.
      그래서 훈련 전체는 6 × (파라미터 수) × (토큰 수). 어디까지나 <b>어림</b>이라 어텐션
      계산·최적화기 비용 등은 뭉갠 값이지만, 규모 감각에는 충분히 정확합니다(정밀한 유도는
      4장에서 황금비와 함께). GPU-일 환산의 가정: A100 한 장의 bf16 최대 성능 312 TFLOPS
      중 <b>실효 가동률 50%</b>. 실제 훈련에선 데이터 대기·통신 때문에 최대 성능을 다
      못 쓰기 때문입니다. 계산: 4.2×10²² ÷ (1.56×10¹⁴/초) ≈ 2.7×10⁸초 ≈ 3,116일 ≈ 8.5년.
    </DetailsCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 10부 여정표: 성장의 법칙, 그리고 시험의 통계</h2>
    <ReviewFlag id="ch1-s3" chapter="ch1" label="3. 10부 여정표: 성장의 법칙, 그리고 시험의 통계" />
    <p class="leading-relaxed text-slate-700">
      좌표축이 생겼으니 지도를 폅니다. 10부는 두 막으로 갑니다.
      <b>1막(2~5장), 성장의 법칙</b>: 재료를 늘리면 성능이 <b>얼마나</b> 좋아지는지
      로그-로그 종이(2장) 위에서 직선(3장)으로 읽고, 예산을 N과 D에 <b>어떻게 나눌지</b>
      황금비(4장)를 찾고, "능력이 갑자기 튀었다"는 창발 소동(5장)을 검증합니다.
      <b>2막(6~9장), 시험의 통계</b>: 워밍업에서 만난 소음을 계산하고(6장 오차범위),
      차이를 판정하고(7장), 시험 자체의 함정(8장 오염, 9장 AI 채점관)을 다룹니다.
      마지막 <b>10장 캡스톤</b>에서 가상의 신모델 발표를 통째로 팩트체크하며 졸업합니다.
    </p>

    <ReviewFlag id="ch1-ai" chapter="ch1" label="🤖 AI 연결: 발표 스펙이 문장으로 읽히기 시작한다" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 발표 스펙이 문장으로 읽히기 시작한다">
      이제 "파라미터 70B, 토큰 2조, GPU 수천 장"이 각각 N·D·C로 보이실 겁니다.
      셋 중 하나만 나와도 나머지가 어림되죠(C≈6ND). N을 세는 공식은
      <b><PartLink :part="9" ch="ch1">9부 1장(숫자의 몸무게)</PartLink></b>에서 이미
      만들었고, 훈련이 실제로 어떻게 돌아가는지의 지도는
      <b><PartLink :part="8" ch="ch1">8부 1장(손실 지형)</PartLink></b>이 담당입니다.
      10부의 남은 질문은 하나, <b>재료를 부으면 성능이 얼마나 나오는가.</b> 그 법칙이
      다음 장부터입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="큰 그림: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="훈련의 3재료가 아닌 것은?"
        :choices="['벤치마크 점수', '파라미터 N', '데이터(토큰) D', '컴퓨트 C']"
        :answer="0"
        explanation="점수는 재료가 아니라 결과(측정)입니다. 재료 셋(N·D·C)을 넣어 훈련하고, 결과를 벤치마크로 재는 구도예요."
      />
      <Quiz
        difficulty="easy"
        question="'7B 모델'의 7B가 뜻하는 것은?"
        :choices="['파라미터(가중치 숫자)가 약 70억 개', '파일 크기가 7GB', '훈련에 7억 원이 들었다', '토큰을 70억 개 먹였다']"
        :answer="0"
        explanation="B = billion(십억)이고, 모델 행렬들에 든 숫자의 개수가 N입니다. 파일 크기는 N에 '숫자 하나의 칸 크기'를 곱해야 나오죠(9부 1장)."
      />
      <Quiz
        difficulty="easy"
        question="데이터 D의 단위인 '토큰'은 4부 2장에서 배운 '글 조각'과 같은 것이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 문장을 조각(토큰)으로 쪼개 숫자 ID로 바꾸던 그 토큰. '2T 토큰 학습'은 그 조각을 2조 개 먹였다는 뜻이에요."
      />
      <Quiz
        difficulty="easy"
        question="컴퓨트 C의 단위 FLOPs가 세는 것은?"
        :choices="['곱셈·덧셈 같은 부동소수점 연산의 횟수', '전기 요금', 'GPU의 개수', '모델의 답변 개수']"
        :answer="0"
        explanation="FLOP = 부동소수점 연산 1회(9부에서 다룬 그 부동소수점!). 훈련 전체에 든 연산 총량이 C라서 '훈련 예산'이라는 비유를 씁니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="7B 모델(N = 7×10⁹)에 1T 토큰(D = 10¹²)을 먹인 훈련 예산 C ≈ 6·N·D 를 단계별로 계산해 보세요. (C = 4.2×10²² 꼴로)"
        :steps="[
          { lhs: '6 \\times 7 = ?', answer: 42 },
          { lhs: '10^9 \\times 10^{12} = 10^{?}', answer: 21 },
          { lhs: 'C = 4.2 \\times 10^{?} \\text{ FLOPs}', answer: 22 },
        ]"
        explanation="앞자리끼리(6×7=42), 지수끼리(9+12=21)로 42×10²¹ = 4.2×10²². 랩의 7B급 프리셋이 보여준 그 값입니다. 지수 덧셈이 낯설면 2부 7장이 복습처예요."
      />
      <Quiz
        difficulty="medium"
        question="같은 예산 C를 쓰는 두 훈련 계획(㉮ N을 2배·D는 절반 / ㉯ N은 절반·D를 2배)에 대해 옳은 설명은?"
        :choices="['둘 다 C ≈ 6·N·D 가 같다. 어느 쪽이 더 똑똑한 모델이 되는지가 바로 4장(황금비)의 질문', '㉮가 항상 예산을 더 쓴다', '㉯가 항상 예산을 더 쓴다', '예산이 같으면 결과도 반드시 같다']"
        :answer="0"
        :hints="['2배 × ½배 = 1배, 곱은 그대로입니다.']"
        explanation="곱이 같으니 예산은 동일합니다. 그런데 결과(손실)는 배분에 따라 달라져요. '크게 잠깐 vs 작게 오래'의 최적점을 찾는 게 Chinchilla(4장)입니다."
      />
      <Quiz
        difficulty="medium"
        question="랩에서 7B급(7B·1T)을 A100 1장으로 훈련하면 걸리는 시간의 규모는?"
        :choices="['약 8.5년 (그래서 수백~수천 장을 묶는다)', '약 8.5시간', '약 8.5일', '약 8.5분']"
        :answer="0"
        explanation="4.2×10²² FLOPs ÷ (A100 실효 1.56×10¹⁴/초) ≈ 3,116일 ≈ 8.5년. 1,000장이면 사흘. 대형 훈련이 'GPU 공장'인 이유입니다."
      />
      <Quiz
        difficulty="medium"
        question="C ≈ 6·N·D 의 '6'은 무엇인가?"
        :choices="['토큰 하나×파라미터 하나당 연산 어림: 순전파 약 2회 + 역전파 약 4회', '하루 6시간 훈련한다는 뜻', 'GPU 6장을 쓴다는 뜻', '수학 상수 e를 반올림한 것']"
        :answer="0"
        explanation="파라미터 하나가 토큰 하나를 처리할 때 순전파 ~2회(곱+합), 역전파 ~4회, 합쳐 약 6회라는 어림입니다. 정밀한 유도는 4장에서."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="어느 회사가 '우리는 데이터를 안 늘리고 모델만 10배 키웠다'고 발표했다. C ≈ 6·N·D 관점에서 옳은 추론은?"
        :choices="['훈련 예산 C도 약 10배. 그런데 그 예산으로 D를 늘리는 게 나았을지는 별개 문제(4장)', '예산 C는 그대로다', '예산 C는 100배가 된다', 'D를 안 늘렸으니 훈련이 공짜다']"
        :answer="0"
        :hints="['C는 N에 비례합니다. D가 고정이면 N의 배수가 그대로 C의 배수.']"
        explanation="D 고정·N 10배 → C 10배. 그리고 이렇게 몸집만 키운 모델이 '덜 먹인 과체격'이 되기 쉽다는 것, 그게 Chinchilla가 밝힌 이야기입니다(4장)."
      />
      <Quiz
        difficulty="hard"
        question="10부 여정표에서 1막(성장의 법칙)과 2막(시험의 통계)이 둘 다 필요한 이유로 가장 알맞은 것은?"
        :choices="['키우면 얼마나 좋아지나(예측)와 그 좋아짐이 점수에서 진짜로 보이나(판정)는 다른 질문이라서. 예측은 법칙, 판정은 통계가 담당', '1막이 어려우면 2막으로 건너뛰라고', '두 막은 사실 같은 내용의 반복이라서', '통계는 장식이고 법칙만 있으면 충분해서']"
        :answer="0"
        :hints="['워밍업의 교훈: 좋아졌어도 점수는 소음에 묻힐 수 있죠.']"
        explanation="법칙(2~5장)은 성장을 예측하게 해 주고, 통계(6~9장)는 관측된 점수 차이가 소음인지 진짜인지 가려 줍니다. 캡스톤(10장)의 팩트체크는 이 둘을 함께 씁니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch1')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">1장 완료! 좌표축이 생겼습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 2장, 곱의 세계입니다. N·D·C처럼 10배씩 뛰는 수들을 다루는 도구,
        로그 눈금과 멱법칙(y = a·xᵇ)을 폅니다. "로그-로그 종이 위에서 직선"이 무슨 뜻인지도 알게 됩니다.
      </p>
      <RouterLink
        to="/ch/ch2"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        2장: 곱의 세계 →
      </RouterLink>
    </div>
  </article>
</template>
