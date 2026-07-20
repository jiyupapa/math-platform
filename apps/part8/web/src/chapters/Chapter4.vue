<script setup lang="ts">
// 4장 — 관성으로 달리기: 모멘텀. 지그재그 문제 → 속도 누적(EMA), 상쇄와 증폭.
// 회수하는 수학: 1부 2장 벡터 합(상쇄·누적의 정체). Adam(5장)의 첫 번째 부품.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import MomentumLab from '@/components/MomentumLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch4')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">4장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">관성으로 달리기 — 모멘텀</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      2장 끝에서 만난 딜레마 — 벽 방향이 가파른 골짜기에서는 보폭이 벽 기준으로 묶여,
      정작 가야 할 전진 방향으로는 하세월이었죠. 게다가 걸음마다 벽 사이를 <b>지그재그로
      튕기는</b> 낭비까지. 이번 장의 처방은 물리에서 빌려 옵니다 — 가벼운 구슬처럼 발밑
      기울기에 즉각 반응하지 말고, <b>무거운 공처럼 속도를 기억</b>하며 구르는 것.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지를 가져갑니다 — ① 지그재그 문제의 정체(축별 곡률 차 + 단일 보폭),
      ② 모멘텀의 동작 원리: <b>지그재그는 상쇄, 전진은 1/(1−β)배 누적</b>,
      ③ 그 밑의 기계 — <b>지수이동평균(EMA)</b>: Adam(5장)까지 쭉 쓰일 부품입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 처방 — 속도를 기억하는 걸음</h2>
    <ReviewFlag id="ch4-s1" chapter="ch4" label="1. 처방 — 속도를 기억하는 걸음" />
    <p class="leading-relaxed text-slate-700">
      지금까지의 걸음은 <b>기억이 없었습니다</b> — 매 스텝 발밑 기울기만 보고 방향을 정했죠.
      모멘텀은 딱 한 줄을 바꿉니다: 위치를 기울기로 직접 옮기는 대신, <b>속도 v</b>를 두고
      기울기를 속도에 쌓은 뒤 속도로 움직입니다.
    </p>
    <MathBlock expr="v \leftarrow \beta\, v + \nabla L, \qquad w \leftarrow w - lr \cdot v" />
    <p class="leading-relaxed text-slate-700">
      읽는 법: "새 속도 = 옛 속도의 β배 + 이번 기울기, 그리고 속도만큼 이동" — 여기서
      <MathBlock inline expr="\nabla L" /> 의 <b>∇</b>는 "<b>나블라</b>"라고 읽는 <b>기울기 벡터</b> 기호입니다(2부 9장).
      β(베타)는 <b>기억 다이얼</b>이에요 — 0이면 기억 없음(= 그냥 GD), 0.9면 옛 속도의 90%를
      유지합니다. 이 한 줄이 좁은 골짜기에서 무엇을 바꾸는지, 경주로 확인해 보세요.
    </p>

    <MomentumLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 상쇄와 증폭은 벡터 덧셈이다">
      실험 ②가 원리의 전부입니다. 속도는 과거 기울기들의 <b>합</b>(가중치 β^k로 잊혀 가는) —
      즉 1부 2장의 <b>화살표 덧셈</b>이에요. 벽에 튕기는 성분은 <b>반대 방향 화살표가 교대로</b>
      와서 지워지고, 골짜기를 따라가는 성분은 <b>같은 방향 화살표가 계속</b> 와서
      1/(1−β)배까지 쌓입니다. β = 0.9면 전진은 최대 10배 — 그래서 실험 ①에서 🟠가
      같은 보폭으로 훌쩍 앞서갔던 겁니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="좁고 긴 골짜기에서 GD가 지그재그로 튕기는 근본 이유는?"
      :choices="['벽 방향 곡률이 커서 그 방향 걸음이 과하게 튀는데, 보폭은 하나뿐이라 조절할 수 없어서', '기울기 계산이 틀려서', '데이터에 노이즈가 많아서', '컴퓨터가 대각선 이동을 못 해서']"
      :answer="0"
      :hints="['2장의 축별 곡률 딜레마 — 벽 방향 c는 크고 전진 방향 c는 작았죠.']"
      explanation="가파른 벽 방향에서는 같은 보폭이 진동을 만들고, 완만한 전진 방향에서는 너무 짧습니다 — 단일 보폭의 한계가 지그재그로 나타나는 거예요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 밑의 기계 — 지수이동평균(EMA)</h2>
    <ReviewFlag id="ch4-s2" chapter="ch4" label="2. 밑의 기계 — 지수이동평균(EMA)" />
    <p class="leading-relaxed text-slate-700">
      기울기 ∇L 을 <b>g</b> 로 줄여 쓰기로 하고, v ← β·v + g 를 풀어 쓰면 v = g<sub>지금</sub> + β·g<sub>1걸음 전</sub> + β²·g<sub>2걸음 전</sub> + … —
      <b>최근 것은 크게, 옛것은 지수적으로 잊는 평균</b>입니다. 이런 평균의 이름이
      <b>지수이동평균</b>(EMA)이고, β가 잊는 속도를 정해요. 유효 기억 길이는 대략
      <b>1/(1−β)걸음</b>: β = 0.9면 최근 10걸음쯤, 0.99면 100걸음쯤을 기억하는 셈입니다.
      이 기계는 여기서 끝나지 않아요 — 다음 장 Adam은 EMA를 <b>두 개</b> 돌립니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 모멘텀 / 지수이동평균 / 오버슈트">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>모멘텀</b> (momentum) — 읽는 법: 모멘텀, 뜻: 관성.
          속도를 기억해 걷는 경사하강 — 설정 파일의 <code>momentum: 0.9</code>,
          그리고 Adam 의 <code>β₁</code>이 바로 이 다이얼입니다.
        </li>
        <li>
          <b>지수이동평균</b> (EMA, exponential moving average) — 읽는 법: 이엠에이.
          뜻: 최근 값은 크게, 과거는 β^k 로 잊는 평균 — v ← β·v + 새 값.
          유효 기억 ≈ 1/(1−β)걸음. 훈련 통계·모델 가중치 평균 등 실무 도처에서 재등장합니다.
        </li>
        <li>
          <b>오버슈트</b> (overshoot) — 읽는 법: 오버슈트.
          뜻: 관성이 커서 목표(골짜기 바닥)를 <b>지나쳐 되돌아오기를 반복</b>하는 것 —
          β 과대의 대표 증상(실험 ①의 β = 0.99).
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">관성은 지그재그를 지우고 전진을 쌓는다 — 속도 = 기울기의 지수이동평균 (기억 1/(1−β)걸음)</p>
      <p class="mt-1 text-sm text-indigo-600">상쇄와 증폭의 정체는 화살표 덧셈(1부 2장)입니다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="EMA 속에서 지그재그(교대 부호) 성분이 사라지는 이유는?"
      :choices="['+1과 −1이 번갈아 더해져 서로 상쇄되기 때문', 'EMA가 음수를 무시하기 때문', '지그재그는 기울기가 아니기 때문', '사라지지 않는다']"
      :answer="0"
      explanation="반대 방향 화살표의 덧셈은 소거 — 반면 같은 방향 화살표는 1/(1−β)배까지 쌓입니다. 필터와 부스터가 같은 기계에서 나와요."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="β가 클수록 속도는 더 먼 과거의 기울기까지 기억한다."
      type="truefalse"
      :answer="0"
      explanation="참입니다 — 유효 기억 ≈ 1/(1−β)걸음. 0.9는 10걸음, 0.99는 100걸음. 길수록 강력하지만 오버슈트(진자)의 위험도 커져요."
    />

    <DetailsCard title="➕ 더 깊이: 무거운 공, 노이즈 필터, 그리고 β = 0.9라는 관례">
      물리 비유에는 정식 이름이 있습니다 — 모멘텀 방법의 별명이 <b>heavy ball</b>(무거운 공)이고,
      한 발 앞을 내다보고 브레이크를 미리 밟는 개량형 <b>Nesterov 모멘텀</b>도 설정에서 종종
      보입니다(이름만 알아 두세요). 보너스 효과 하나 — 3장의 <b>미니배치 노이즈도 EMA 가
      평균 내며 줄여 줍니다</b>: 지그재그 상쇄와 정확히 같은 원리로, 흔들리는 나침반의 떨림이
      속도에서는 매끈해져요. 기본값 β = 0.9(기억 10걸음)는 "노이즈·지그재그는 지우면서
      지형 변화에는 따라갈 수 있는" 절충으로 굳어진 관례입니다 — 진자가 되기 시작하면
      (loss 가 규칙적으로 출렁) β 과대를 의심하세요.
    </DetailsCard>

    <ReviewFlag id="ch4-ai" chapter="ch4" label="🤖 AI 연결 — 회수하는 수학: 1부 2장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 1부 2장">
      상쇄와 증폭의 정체는 <b><PartLink :part="1" ch="ch2">1부 2장</PartLink></b>의 벡터 덧셈입니다 —
      반대 화살표는 지워지고 같은 화살표는 쌓인다는, 시리즈 첫 장들의 그 연산이 훈련 가속의
      심장이 됐어요. 실무에서 이 다이얼은 대부분 <b>Adam 의 β₁ = 0.9</b>라는 모습으로 만나게
      됩니다 — 파인튜닝 설정에서 따로 안 보인다면 Adam 안에 이미 들어 있는 거예요.
      그런데 모멘텀도 못 푸는 문제가 남아 있습니다 — 진동은 지웠지만 <b>보폭 자체는 여전히
      모든 축에 하나</b>라는 것. 축마다 다른 보폭, 다음 장 Adam 입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="모멘텀 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="모멘텀의 갱신 규칙으로 옳은 것은?"
        :choices="['속도 ← β×속도 + 기울기, 위치 ← 위치 − 보폭×속도', '위치 ← 위치 + 기울기', '속도 ← 기울기 ÷ β', '위치 ← 위치 − 곡률×보폭']"
        :answer="0"
        explanation="기울기를 위치에 바로 쓰지 않고 속도에 쌓았다가 속도로 움직입니다 — 기억이 생기는 한 줄의 변화예요."
      />
      <Quiz
        difficulty="easy"
        question="EMA(지수이동평균)의 성격으로 옳은 것은?"
        :choices="['최근 값은 크게, 과거 값은 지수적으로 잊는 평균', '모든 과거를 똑같은 무게로 평균', '가장 큰 값 하나만 기억', '미래 값을 예측하는 평균']"
        :answer="0"
        explanation="v = g지금 + β·g₁ + β²·g₂ + … — β^k 로 바래 가는 기억입니다."
      />
      <Quiz
        difficulty="easy"
        question="β = 0.9일 때 일관된 기울기가 쌓여 도달하는 최대 증폭 배율은? (1/(1−β))"
        type="numeric"
        :answer="10"
        explanation="1/(1−0.9) = 10배 — 전진 방향이 10배 부스터를 받는 셈입니다."
      />
      <Quiz
        difficulty="easy"
        question="β = 0으로 두면 모멘텀은 보통의 경사하강(GD)과 같아진다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 기억이 0이면 속도 = 이번 기울기 — GD 그 자체죠. 실험 ①에서 슬라이더를 0에 놓고 확인해 보세요."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="β = 0.95인 모멘텀의 유효 기억 길이(걸음)와 최대 증폭 배율을 구하세요. (둘 다 1/(1−β))"
        :steps="[
          { lhs: '1 - \\beta', answer: 0.05 },
          { lhs: '1 \\div 0.05', answer: 20 },
        ]"
        :hints="['1 − 0.95', '유효 기억 ≈ 증폭 배율 ≈ 1/(1−β)']"
        explanation="기억 약 20걸음, 증폭 최대 20배 — 0.9(10걸음)보다 강력하지만 그만큼 진자 위험도 커집니다."
      />
      <Quiz
        difficulty="medium"
        question="모멘텀이 지그재그를 없애면서 동시에 전진을 빠르게 하는 것이 가능한 이유는?"
        :choices="['진동 성분은 부호가 교대라 상쇄되고, 전진 성분은 부호가 일정해 누적되기 때문 — 같은 EMA의 두 얼굴', '두 개의 서로 다른 보폭을 쓰기 때문', '기울기를 두 번 계산하기 때문', '우연히 그렇게 보일 뿐이다']"
        :answer="0"
        explanation="필터(상쇄)와 부스터(누적)가 별개 장치가 아니라 화살표 덧셈 하나에서 나옵니다 — 이 장의 핵심 관찰이에요."
      />
      <Quiz
        difficulty="medium"
        question="모멘텀이 3장의 미니배치 노이즈에도 도움이 되는 이유는?"
        :choices="['EMA가 여러 스텝의 기울기를 평균 내므로 흔들림도 상쇄되어 매끈해진다', '노이즈를 감지해 배치를 자동으로 키우기 때문', '도움이 되지 않는다', '노이즈를 증폭시켜 탈출을 돕기 때문']"
        :answer="0"
        :hints="['지그재그 상쇄와 노이즈 상쇄 — 같은 원리입니다.']"
        explanation="교대 부호가 지워지는 그 기계가 무작위 떨림도 평균 내 줍니다 — 모멘텀은 가속기이자 노이즈 필터예요."
      />
      <Quiz
        difficulty="medium"
        question="β를 0.99로 올렸더니 손실이 규칙적으로 출렁이며 좀처럼 안 내려갑니다. 진단은?"
        :choices="['기억 100걸음짜리 관성이 과해 바닥을 지나치는 오버슈트(진자) — β를 낮춘다', '데이터가 부족하다', '기울기 부호가 반대로 계산되고 있다', 'GPU 메모리 부족']"
        :answer="0"
        explanation="실험 ①의 β = 0.99 그대로 — 무거운 공이 골짜기 양쪽을 왕복하는 진자가 된 상태입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="모멘텀으로 지그재그를 지웠는데도 '축마다 곡률이 다른 문제'가 완전히 해결되지 않는 이유는?"
        :choices="['상쇄·누적은 방향 성분의 시간 평균일 뿐, 보폭 자체는 여전히 모든 축에 하나라서 축별 스케일 차이는 남는다', '모멘텀이 곡률을 크게 만들기 때문', 'EMA가 전진 방향만 기억하기 때문', '해결된다 — 남는 문제가 없다']"
        :answer="0"
        :hints="['모멘텀의 갱신식에서 lr 은 몇 개죠?']"
        explanation="관성은 진동을 다듬지만 c=100 축과 c=0.1 축이 같은 lr을 쓰는 구조는 그대로입니다 — 축마다 보폭을 다르게 주는 것이 5장 Adam의 일이에요."
      />
      <Quiz
        difficulty="hard"
        question="설정 파일에 momentum 항목이 안 보이는 Adam 기반 파인튜닝에서, 모멘텀 다이얼은 어디에 있나?"
        :choices="['Adam의 β₁(기본 0.9)이 그것 — 속도 EMA의 기억 다이얼로 내장되어 있다', 'Adam에는 모멘텀이 없다', 'batch_size가 모멘텀을 겸한다', 'lr이 모멘텀을 겸한다']"
        :answer="0"
        explanation="Adam = 모멘텀(β₁) + 축별 보폭(β₂의 RMS) — 다음 장에서 두 부품을 조립합니다. 오늘 배운 것이 그 첫 부품이에요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch4')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">4장 완료 — 관성을 손에 넣었어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 5장 — 두 번째 핵심. 진동은 지웠지만 보폭은 아직 하나입니다.
        축마다 다른 보폭을 자동으로 맞춰 주는 기계, 현대 훈련의 기본기 Adam을 조립합니다.
      </p>
      <RouterLink
        to="/ch/ch5"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        5장 — 축마다 다른 보폭, Adam →
      </RouterLink>
    </div>
  </article>
</template>
