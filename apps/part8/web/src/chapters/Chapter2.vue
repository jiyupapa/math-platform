<script setup lang="ts">
// 2장 — 보폭의 과학: 학습률 (핵심). 발산 경계 2/c 의 수학과 lr 고르기 실전 감각.
// 회수하는 수학: 2부 9장 경사하강 · 2부 3장 미분계수(기울기의 변화율 = 곡률 감각).
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import LearningRateLab from '@/components/LearningRateLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch2')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">2장 · 약 45분 · ⭐ 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">보폭의 과학 — 학습률</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업에서 도착과 폭발의 경계가 <b>정확히 1.00</b>이라는 걸 발견했죠 — 왜 하필 1일까요?
      이번 장에서 그 답을 계산으로 꺼냅니다. 필요한 건 곱셈 하나뿐이에요. 그리고 그 곱셈이
      알려 주는 실전 감각 — <b>가파른 골짜기일수록 보폭 허용치가 작다</b>, 그리고
      <b>곡률을 모르는 실전에서 보폭을 고르는 법</b>까지.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지를 가져갑니다 — ① 한 스텝의 정체: 오차에 <b>수축 인자 |1 − lr×c|</b> 가 곱해진다,
      ② 그로부터 나오는 두 공식: <b>발산 경계 lr = 2/c</b>, <b>한 방 도착 lr = 1/c</b>,
      ③ 곡률이 비공개인 실전에서의 요령: <b>로그 스케일 lr 스위프</b>.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 골짜기의 성격 — 곡률</h2>
    <p class="leading-relaxed text-slate-700">
      먼저 골짜기에 성격을 부여합시다. 같은 깊이라도 <b>좁고 가파른</b> 골짜기와 <b>넓고 완만한</b>
      골짜기가 있죠 — 이 차이를 재는 숫자가 <b>곡률</b>(기울기가 얼마나 빨리 변하는가,
      2부 3장에서 "기울기의 기울기" 감각으로 스친 그것)입니다. 이차 골짜기
      L = (c/2)(w − t)² 에서 c가 바로 곡률이에요. 기울기는 c·(w − t) — <b>목표에서 먼 만큼,
      그리고 가파른 만큼 큽니다.</b> 이제 경사하강 한 스텝을 대수로 정리하면:
    </p>
    <MathBlock expr="w_{new} - t \;=\; (1 - lr \cdot c)\,(w_{old} - t)" />
    <p class="leading-relaxed text-slate-700">
      읽는 법: "새 오차 = (1 − 보폭×곡률) × 지금 오차". 한 스텝마다 오차에
      <b>같은 배율이 곱해질 뿐</b>입니다 — 그 배율의 절대값을 <b>수축 인자</b>라 부르기로 하죠.
      그럼 모든 운명이 이 한 숫자로 정리됩니다. 직접 돌려 보세요.
    </p>

    <LearningRateLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 운명표, 그리고 미스터리의 해답">
      수축 인자 |1 − lr·c| 가 <b>0이면 한 방 도착</b>(lr = 1/c), <b>1보다 작으면 수렴</b>(작을수록
      빠름), <b>정확히 1이면 영원한 진동</b>, <b>1보다 크면 폭발</b>. 경계 조건 |1 − lr·c| = 1 을
      풀면 <b>lr = 2/c</b> — 워밍업 골짜기는 L = (w−3)² 이라 c = 2, 그래서 경계가 2/2 =
      <b>정확히 1.00</b>이었던 겁니다. 그리고 공식이 주는 실전 직관: <b>c가 클수록(가파를수록)
      경계 2/c 는 내려온다</b> — 가파른 지형일수록 보폭을 조심해야 하는 이유가 곱셈 하나에서 나와요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="워밍업 골짜기 L = (w−3)²의 발산 경계가 정확히 1.00이었던 이유는?"
      :choices="['곡률이 c = 2라서 경계 공식 2/c = 1.00', '컴퓨터가 1 근처에서 반올림해서', '우연의 일치', '모든 골짜기의 경계는 항상 1이다']"
      :answer="0"
      :hints="['L = (c/2)(w−t)² 꼴로 맞춰 보면 (w−3)² = (2/2)(w−3)² — c는?']"
      explanation="(w−3)² 은 c = 2인 이차 골짜기 — 2/c = 1.00. 골짜기가 달라지면 경계도 달라집니다(실험 ①에서 곡률을 돌려 확인한 그대로)."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 속도의 과학 — 왜 lr = 1/c 가 특별한가</h2>
    <p class="leading-relaxed text-slate-700">
      수축 인자는 폭발만 가르는 게 아니라 <b>속도</b>도 가릅니다. 인자가 0.9면 오차가 10%씩,
      0.5면 절반씩 줄어요 — 스무 스텝이면 0.9²⁰ ≈ 12% 남는 것과 0.5²⁰ ≈ 백만분의 일의 차이입니다.
      가장 빠른 건 인자가 <b>0</b>이 되는 lr = 1/c — 기울기가 가리키는 방향으로 <b>정확히 골짜기
      바닥까지의 거리만큼</b> 딛는 보폭이죠. 소심이가 느렸던 건 인자가 0.96이었기 때문이고
      (스텝마다 4%씩만 전진), 실무에서 "lr을 좀 키워 보라"는 조언의 수학적 실체가 이것입니다 —
      물론 <b>2/c 를 넘지 않는 선에서.</b>
    </p>

    <ConceptCard tone="note" title="새 용어: 곡률 / 수축 인자 / lr 스위프">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>곡률</b> (curvature) — 읽는 법: 커버처.
          뜻: 기울기가 변하는 빠르기 — 골짜기가 <b>좁고 가파른 정도</b>. 이차 골짜기
          L = (c/2)(w−t)² 의 c. 클수록 발산 경계(2/c)가 내려옵니다.
        </li>
        <li>
          <b>수축 인자</b> — 읽는 법: 수축 인자 (이 과정의 표현).
          뜻: 한 스텝마다 오차에 곱해지는 배율 |1 − lr·c|. 논문·실무에서는 이 크기로 정하는
          <b>수렴률</b>(convergence rate)을 이야기합니다 — 0이면 한 방, 1이 경계.
        </li>
        <li>
          <b>lr 스위프</b> (learning rate sweep) — 읽는 법: 엘알 스위프.
          뜻: 후보 학습률을 <b>로그 스케일</b>(×3, ×10씩)로 훑어 자릿수부터 찾는 실전 탐색법.
          도구로 자동화한 것을 lr finder 라고도 부릅니다.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">한 스텝은 오차 × |1 − 보폭×곡률| — 경계는 2/c, 명중은 1/c, 가파를수록 조심</p>
      <p class="mt-1 text-sm text-indigo-600">보폭의 모든 이야기가 이 곱셈 하나에서 나옵니다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="수축 인자가 0.5인 설정과 0.9인 설정 — 20스텝 뒤 남은 오차의 차이는?"
      :choices="['0.5는 백만분의 일 수준까지 주는 반면 0.9는 아직 12%쯤 남는다 — 어마어마한 차이', '두 배 정도 차이', '전혀 차이 없다', '0.9 쪽이 더 빨리 준다']"
      :answer="0"
      explanation="0.5²⁰ ≈ 10⁻⁶ vs 0.9²⁰ ≈ 0.12 — 매 스텝의 작은 배율 차이가 거듭제곱으로 벌어집니다. 수렴 속도가 곧 훈련 비용(시간·전기·돈)이에요."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="골짜기가 가파를수록(곡률이 클수록) 안전한 학습률의 상한은 작아진다."
      type="truefalse"
      :answer="0"
      explanation="참입니다 — 경계가 2/c 니까요. 실전 LLM의 lr이 2e-5처럼 작은 것도 그 지형의 어떤 방향들이 매우 가파르기 때문입니다."
    />

    <DetailsCard title="➕ 더 깊이: 실전 지형에서는 c 를 모른다 — 그래서 생기는 세 갈래">
      실제 손실 지형은 이차식이 아니고 곡률을 알려 주지도 않습니다 — 다만 <b>어느 지점 근처에서든
      국소적으로는 이차 골짜기와 비슷</b>해서(2부에서 스친 "확대하면 단순해진다"는 감각) 오늘의
      공식이 국소 가이드로 작동해요. 모르는 c에 대한 실전 대응이 세 갈래로 갈라집니다:
      ① <b>실험으로 찾는다</b> — 오늘의 lr 스위프(자동화판 lr finder). ② 더 심각한 문제:
      곡률이 <b>방향마다 다릅니다</b> — 어떤 축은 c = 100, 어떤 축은 c = 0.1. 단일 보폭은 가장
      가파른 방향의 2/c 에 묶여 완만한 방향에선 하세월이 되죠 — 이 딜레마의 해법이 <b>5장
      Adam</b>(축마다 다른 보폭). ③ 게다가 곡률은 <b>훈련 중에 변합니다</b> — 그래서 보폭도
      여행 단계마다 바꾸는 <b>6장 스케줄</b>(워밍업·감쇠)이 필요해져요.
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 2부 9장 · 2부 3장">
      한 스텝의 공식은 <b><PartLink :part="2" ch="ch9">2부 9장</PartLink></b>의 경사하강 그대로이고,
      오늘 새로 잰 것은 <b><PartLink :part="2" ch="ch3">2부 3장</PartLink></b>의 감각 — 기울기(미분계수)가
      또 얼마나 빨리 변하는가, 즉 <b>곡률</b>이었습니다. 실제 GPT 훈련에서도 학습률이 임계선을
      넘으면 손실이 튀는 <b>loss spike</b>가 관측되고, 그때 엔지니어가 하는 일이 정확히 오늘의
      진단입니다 — "어느 방향의 곡률이 커져서 지금 lr 이 2/c 를 넘었구나." 다음 질문은 나침반
      쪽입니다 — 기울기 자체가 <b>흔들리는 추정치</b>라면? 3장(미니배치 SGD)에서.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 계산 문제는 <b>경계 2/c · 명중 1/c</b> 두 공식이면 충분해요.
    </p>

    <QuizSet title="보폭의 과학 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="이차 골짜기에서 경사하강 한 스텝이 오차에 하는 일은?"
        :choices="['(1 − 보폭×곡률)을 곱한다', '보폭을 더한다', '곡률을 뺀다', '오차를 제곱한다']"
        :answer="0"
        explanation="새 오차 = (1 − lr·c) × 지금 오차 — 이 배율 하나에 속도·경계·폭발이 전부 들어 있습니다."
      />
      <Quiz
        difficulty="easy"
        question="발산 경계 공식은?"
        :choices="['lr = 2/c (곡률분의 2)', 'lr = c/2', 'lr = c²', 'lr = 항상 1']"
        :answer="0"
        explanation="|1 − lr·c| = 1 을 풀면 lr = 2/c — 곡률이 클수록(가파를수록) 경계가 내려옵니다."
      />
      <Quiz
        difficulty="easy"
        question="곡률 c = 2인 골짜기(워밍업의 그 골짜기)의 발산 경계 학습률은?"
        type="numeric"
        :answer="1"
        explanation="2/c = 2/2 = 1.00 — 워밍업 실험 ②에서 발견한 그 경계의 정체입니다."
      />
      <Quiz
        difficulty="easy"
        question="수축 인자가 정확히 0이 되는 학습률(lr = 1/c)에서는 한 스텝 만에 골짜기 바닥에 도착한다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 새 오차 = 0 × 지금 오차 = 0 — 기울기 방향으로 바닥까지의 거리를 정확히 딛는 보폭이에요(이차 골짜기 한정)."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="곡률 c = 4인 좁고 가파른 골짜기입니다. 발산 경계와 한 방 도착 학습률을 구하세요."
        :steps="[
          { lhs: '\\text{발산 경계 } 2/c', answer: 0.5 },
          { lhs: '\\text{한 방 도착 } 1/c', answer: 0.25 },
        ]"
        :hints="['2 ÷ 4', '1 ÷ 4']"
        explanation="경계 0.5, 명중 0.25 — c = 2일 때(1.0, 0.5)보다 전부 절반입니다. 가파를수록 모든 게 조심스러워져요."
      />
      <Quiz
        difficulty="medium"
        question="lr 스위프에서 후보를 0.01 → 0.03 → 0.1 → 0.3 처럼 로그 스케일로 잡는 이유는?"
        :choices="['학습률의 좋고 나쁨은 자릿수 단위로 갈리므로 자릿수부터 좁히는 것이 효율적이라서', '컴퓨터가 3의 배수를 좋아해서', '균등 간격은 계산이 불가능해서', '관례일 뿐 이유는 없다']"
        :answer="0"
        :hints="['0.01과 0.03의 차이 vs 0.01과 1.0의 차이 — 어느 쪽이 운명을 갈랐죠?']"
        explanation="0.01→0.02의 미세 조정보다 0.01→0.1→1.0의 자릿수가 수렴/폭발을 가릅니다. 자릿수를 먼저, 미세 조정은 그다음 — 실전 표준 요령이에요."
      />
      <Quiz
        difficulty="medium"
        question="실험 ②에서 lr = 3.0이 폭발한 이유를 공개된 지형(c = 0.8)으로 설명하면?"
        :choices="['경계 2/0.8 = 2.5를 넘었기 때문 (수축 인자 |1 − 3.0×0.8| = 1.4 > 1)', '10스텝이 너무 적었기 때문', '출발점이 나빴기 때문', '3.0은 소수가 아니라서']"
        :answer="0"
        explanation="1.4가 곱해질 때마다 오차가 40%씩 커집니다 — 10스텝이면 약 29배. 경계 공식이 실험 결과를 정확히 예언했죠."
      />
      <Quiz
        difficulty="medium"
        question="'훈련이 느려서 lr을 키우고 싶다'는 상황에서 이 장이 주는 안전 수칙은?"
        :choices="['키우되 발산 경계(2/c)를 넘지 않아야 한다 — 폭발 조짐(손실 상승)이 보이면 그 직전이 상한 근처', '무조건 10배씩 키우면 된다', 'lr은 절대 바꾸면 안 된다', '느린 것은 항상 데이터 문제다']"
        :answer="0"
        explanation="속도는 인자를 0에 가깝게(lr→1/c), 안전은 2/c 미만 — 두 공식 사이의 줄타기가 lr 튜닝의 본질입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="어떤 지형의 곡률이 방향 A에서는 100, 방향 B에서는 0.1입니다. 단일 학습률이 겪는 딜레마는?"
        :choices="['A가 폭발하지 않으려면 lr < 0.02 — 그 보폭으로 B에서는 하세월 (수축 인자 0.998)', '두 방향 모두 최적으로 만들 수 있다', 'B가 먼저 폭발한다', '곡률이 다르면 훈련이 불가능하다']"
        :answer="0"
        :hints="['안전은 가장 가파른 방향이 정한다 — 2/100. 그 lr로 B의 수축 인자는?']"
        explanation="lr ≤ 2/100 = 0.02에 묶이면 B의 인자는 1 − 0.02×0.1 = 0.998 — 스텝마다 0.2%씩만 전진합니다. 이 딜레마의 해법(축마다 다른 보폭)이 5장 Adam이에요."
      />
      <Quiz
        difficulty="hard"
        question="훈련 초반에 폭발해서 lr을 10분의 1로 낮췄더니 이제 손실이 거의 안 떨어집니다. 이 장의 공식으로 세울 수 있는 가장 합리적인 다음 수는?"
        :choices="['둘 사이를 로그 스케일로 더 훑어 경계 바로 아래의 lr을 찾는다 (+초반만 조심하는 워밍업은 6장)', 'lr을 다시 원래대로 올린다 — 폭발은 운이었다', '0에 가깝게 더 낮춘다', '훈련을 포기한다']"
        :answer="0"
        :hints="['폭발 lr과 정체 lr 사이 어딘가에 좋은 자릿수가 있습니다.']"
        explanation="10배는 큰 걸음이라 그 사이(예: ×3 지점)에 좋은 값이 있기 쉽습니다. 그리고 '초반만 유독 가파른' 지형이라면 lr 자체보다 워밍업 스케줄(6장)이 정답일 수 있어요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch2')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">2장 완료 — 보폭의 수학을 손에 넣었어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 3장 — 지금까지 나침반(기울기)이 정확하다고 가정했는데, 실전의 나침반은
        데이터 일부로만 계산한 <b>흔들리는 추정치</b>입니다. 미니배치 SGD, 그리고 또 만나는 1/√n.
      </p>
      <RouterLink
        to="/ch/ch3"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        3장 — 흔들리는 나침반, 미니배치 SGD →
      </RouterLink>
    </div>
  </article>
</template>
