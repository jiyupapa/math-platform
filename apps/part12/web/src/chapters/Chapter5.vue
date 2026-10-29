<script setup lang="ts">
// 5장 — 시간을 잘게 썰기: 오일러법과 시간 간격 (핵심). 시뮬레이터가 미래를 계산하는 법,
// DT 가 크면 가짜 출렁임·발산(DT < 2τ), DT 를 반으로 → 오차도 반(1차 정확도).
// 경사하강 = 경사 흐름의 오일러법, 학습률 = DT. 다시 쓰는 수학: 8부 2장, 2부 9장, 9부 4장.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import EulerLab from '@/components/EulerLab.vue'
import SfdDiagram from '@/components/SfdDiagram.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch5')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">5장 · 약 45분 · ⭐ 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">시간을 잘게 썰기 — 오일러법과 시간 간격</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1~4장의 곡선은 모두 컴퓨터가 계산했습니다. 어떻게 했을까요? 답은 2장의 "한 칸씩 쌓기"를 아주 잘게 반복하는 것뿐이에요.
      이 장에서는 그 계산법(오일러법)을 직접 돌려 보고, 칸의 폭을 잘못 잡으면 진짜 시스템에는 없는 출렁임과 폭발이
      생긴다는 것을 봅니다. 그리고 놀랍게도 이것이 8부에서 배운 <b>학습률</b> 이야기와 같은 식이라는 것까지요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"저량(다음) = 저량(지금) + 순유량 × DT."</b> 시간 상수 τ인 균형 루프를 이렇게 계산하면 DT &lt; τ일 때 매끄럽게,
      τ &lt; DT &lt; 2τ일 때 출렁이며, DT &gt; 2τ일 때 발산합니다. 경사하강의 학습률이 바로 이 DT라서, 8부의
      "학습률 × 곡률 &lt; 2"가 같은 조건이라는 것을 확인합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 컴퓨터는 미래를 어떻게 계산하나</h2>
    <ReviewFlag id="ch5-s1" chapter="ch5" label="1. 무대: 컴퓨터는 미래를 어떻게 계산하나" />
    <p class="leading-relaxed text-slate-700">
      컴퓨터는 곡선을 한 번에 알지 못합니다. 아는 것은 "지금 저량"과 "지금 저량일 때의 변화율(순유량)"뿐이에요.
      그래서 이렇게 걷습니다. <b>앞으로 DT 동안은 지금 속도 그대로 간다고 치고 한 칸 나아간다. 도착하면 거기서 속도를 다시 잰다.</b>
      2장에서 한 달씩 막대를 쌓던 것과 똑같고, 칸의 폭 DT만 자유롭게 고를 수 있어요.
    </p>
    <MathBlock expr="S(t + \Delta t) = S(t) + \Delta t \times \underbrace{f\big(S(t)\big)}_{\text{지금의 순유량}}" />
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      <b>Δt</b>(델타 티)는 시간 간격, 시스템 다이내믹스 도구들은 <b>DT</b>라고 씁니다. <b>f(S)</b>는 "저량이 S일 때의 순유량"을
      알려 주는 규칙(1~4장의 고리들)이에요. 이 한 줄을 반복하는 방법을 18세기 수학자 오일러의 이름을 따 <b>오일러법</b>이라고 부릅니다.
    </p>

    <EulerLab />

    <ConceptCard tone="tip" title="핵심 관찰: 간격이 시간 상수를 넘으면 가짜 출렁임, 두 배를 넘으면 폭발">
      격차 계산은 한 걸음마다 <b>× (1 − DT/τ)</b>입니다. DT가 τ보다 작으면 이 배수가 0과 1 사이라 매끄럽게 줄어요.
      DT가 τ와 2τ 사이면 배수가 음수(예: DT = 6이면 × (−0.5))라서 부호가 번갈아 바뀌는 <b>가짜 출렁임</b>이 생깁니다.
      진짜 시스템은 출렁이지 않는데 계산이 출렁이는 거예요. DT가 2τ를 넘으면 배수의 크기가 1보다 커져 <b>발산</b>합니다.
      그리고 실험 ②처럼 DT를 반으로 줄이면 오차도 대략 반이 됩니다(7.28 → 3.52 → 1.73 → …).
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="시간 상수 τ = 4개월인 균형 루프를 DT = 6개월로 계산하면?"
      :choices="['부호가 번갈아 바뀌는 가짜 출렁임이 생기지만 줄어들긴 한다', '매끄럽게 줄어든다', '같은 크기로 영원히 출렁인다', '점점 커지며 발산한다']"
      :answer="0"
      :hints="['DT/τ = 1.5. 한 걸음마다 × (1 − 1.5) = ?']"
      explanation="× (−0.5)라서 100 → −50 → 25 → −12.5 … 부호가 바뀌며 줄어듭니다. 진짜 격차는 음수가 된 적이 없으니 계산이 만든 가짜 출렁임이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 그림에서 식으로: 저량-유량도가 계산 규칙이 된다</h2>
    <ReviewFlag id="ch5-sfd" chapter="ch5" label="2. 그림에서 식으로: 저량-유량도가 계산 규칙이 된다" />
    <p class="leading-relaxed text-slate-700">
      오일러법 한 줄의 <b>f(S)</b>, 곧 '저량이 S일 때의 순유량'은 어디서 올까요? 저량-유량도에서 그대로 읽어 냅니다.
      그림을 식으로 옮기는 규칙은 세 가지예요.
    </p>
    <ol class="mt-2 list-decimal space-y-1.5 pl-5 leading-relaxed text-slate-700">
      <li><b>상자마다 식이 하나</b>: 상자가 변하는 속도 = 들어오는 파이프 − 나가는 파이프(1장 2절의 셋째 약속).</li>
      <li><b>밸브마다 식이 하나</b>: 그 밸브로 들어오는 가는 화살표의 출발점들이 식의 재료다. 화살표가 오지 않는 값은 그 식에 들어가지 않는다.</li>
      <li><b>작은 원은 숫자 하나</b>(또는 다른 값으로 만든 식).</li>
    </ol>
    <p class="mt-3 leading-relaxed text-slate-700">4장의 회의실 그림을 이 규칙대로 옮겨 봅시다.</p>
    <div class="my-4 rounded-xl border border-slate-200 bg-white p-3">
      <SfdDiagram
        :width="360"
        :height="172"
        :stocks="[{ id: 'T', label: '실내 온도', x: 250, y: 118, w: 104, h: 50, value: '12°C', level: 0.3 }]"
        :flows="[{ id: 'h', label: '데우는 속도', path: [[30, 118], [197, 118]], fromCloud: true, rate: '(목표 − 온도) ÷ τ' }]"
        :aux="[
          { id: 'goal', label: '목표 온도 22°C', x: 50, y: 40 },
          { id: 'tau', label: 'τ (조정 시간)', x: 150, y: 40 },
        ]"
        :links="[
          { from: [55, 46], to: [106, 100], bend: -0.12, sign: '+' },
          { from: [146, 46], to: [118, 100], bend: 0.12, sign: '−' },
          { from: [224, 92], to: [121, 101], bend: 0.35, sign: '−' },
        ]"
        aria-label="실내 온도 상자에 데우는 속도 파이프가 붙고, 목표 온도·조정 시간 τ·실내 온도가 가는 화살표로 데우는 속도를 정하는 저량-유량도"
      />
    </div>
    <div class="my-4 overflow-x-auto">
      <table class="w-full break-keep text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3 font-medium">그림의 부분</th>
            <th class="py-2 font-medium">식</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">상자 '실내 온도'(들어오는 파이프 하나)</td><td class="py-2">d온도/dt = 데우는 속도</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">밸브 '데우는 속도'(목표 온도·τ·실내 온도에서 화살표)</td><td class="py-2">데우는 속도 = (목표 − 온도) ÷ τ</td></tr>
          <tr><td class="py-2 pr-3">작은 원 '목표 온도'·'τ'</td><td class="py-2">22°C, 10분(4장 실험의 처음 값)</td></tr>
        </tbody>
      </table>
    </div>
    <p class="leading-relaxed text-slate-700">
      둘을 합치면 d온도/dt = (목표 − 온도) ÷ τ입니다. 남은 격차 G = 목표 − 온도로 바꿔 쓰면 dG/dt = −G/τ, 위 실험에서 계산한 식 그대로예요.
      한 가지 주의할 점이 있습니다. 화살표는 <b>무엇을 재료로 쓰는지</b>만 알려 줘요. 그 재료를 어떻게 섞는지(빼고 나눌지, 곱할지)는
      모형을 만드는 사람이 정해 밸브에 적어 두는 것이고, Vensim·Stella 같은 도구에서도 밸브를 누르면 식을 적는 칸이 나옵니다.
      상자와 밸브의 식이 갖춰지면 도구는 상자마다 <b>다음 값 = 지금 값 + DT × (들어오는 파이프 − 나가는 파이프)</b>를 반복해요.
      이 장의 오일러법이 바로 그 계산입니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="상자 하나에 들어오는 파이프 두 개(20명/월, 15명/월)와 나가는 파이프 하나(10명/월)가 붙어 있다. 이 상자가 지금 변하는 속도는? (명/월, 정수)"
      type="numeric"
      :answer="25"
      :hints="['들어오는 파이프는 더하고, 나가는 파이프는 뺍니다.']"
      explanation="20 + 15 − 10 = 25명/월. 상자마다 '들어오는 파이프의 합 − 나가는 파이프의 합'이 그 상자의 변화 속도(순유량)이고, 오일러법은 여기에 DT를 곱해 다음 값을 구합니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="ch5-s2" chapter="ch5" label="3. 오늘의 발견에 이름표 달기" />
    <p class="leading-relaxed text-slate-700">격차 계산 한 걸음을 식으로 쓰면 안정 조건이 바로 보입니다.</p>
    <MathBlock expr="S_{k+1} = S_k + \Delta t \times \left(-\frac{S_k}{\tau}\right) = \left(1 - \frac{\Delta t}{\tau}\right) S_k \qquad \left|1 - \frac{\Delta t}{\tau}\right| < 1 \iff 0 < \Delta t < 2\tau" />
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      <b>Sₖ</b>(에스 케이)는 k번째 걸음의 값, 세로 막대 |…|는 절댓값(부호를 떼고 크기만), <b>⟺</b>는 "서로 같은 말"이라는 뜻입니다.
      한 걸음 배수의 크기가 1보다 작아야 줄어들고, 그 조건이 DT &lt; 2τ예요.
    </p>

    <ConceptCard tone="note" title="새 용어: 미분방정식 / 오일러법 / 시간 간격(DT) / 수치 불안정 / 1차 정확도">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li><b>미분방정식</b> (differential equation). 뜻: 저량의 변화율을 저량으로 적은 식. 예: dS/dt = −S/τ. 시스템 다이내믹스 모형은 미분방정식 묶음이고, 저량-유량도는 이 식 묶음을 그림으로 그린 것입니다.</li>
        <li><b>오일러법</b> (Euler's method). 뜻: 지금의 변화율로 DT만큼 나아가기를 반복해 미분방정식을 푸는 가장 단순한 방법. 비유로는 <b>시간을 잘게 썰기</b>.</li>
        <li><b>시간 간격</b> (time step, DT, Δt). 뜻: 한 걸음의 시간 폭. 작을수록 정확하지만 계산이 많아집니다.</li>
        <li><b>수치 불안정</b> (numerical instability). 뜻: 진짜 시스템은 멀쩡한데 계산 방법 때문에 출렁이거나 발산하는 것. 오일러법에서는 DT &gt; 2τ일 때.</li>
        <li><b>1차 정확도</b> (first-order accuracy). 뜻: DT를 반으로 줄이면 오차도 반으로 줄어드는 성질. 오일러법이 그렇습니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습: 손으로 오일러법</p>
    <StepQuiz
      difficulty="medium"
      question="dS/dt = −S/4, 처음 S = 100, DT = 2로 두 걸음 계산하세요. (변화율 = −S/4)"
      :steps="[
        { lhs: 'S_1 = 100 + 2 \\times (-100/4) = ?', answer: 50 },
        { lhs: 'S_2 = 50 + 2 \\times (-50/4) = ?', answer: 25 },
      ]"
      explanation="100 → 50 → 25. 한 걸음마다 × (1 − 2/4) = × 0.5입니다. 정확한 답 100·e^(−t/4)는 t = 4에서 36.8인데 오일러법은 25라서, DT = 2는 꽤 거칠어요. DT를 줄이면 36.8에 다가갑니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 학습률은 시간 간격이다</h2>
    <ReviewFlag id="ch5-s3" chapter="ch5" label="4. 학습률은 시간 간격이다" />
    <p class="leading-relaxed text-slate-700">
      4장에서 경사하강이 균형 루프라는 것을 봤습니다. 한 걸음 더 들어가 봅시다. 가중치가 매 순간 기울기의 반대 방향으로
      미끄러져 내려가는 매끄러운 움직임을 상상하면, 이 움직임을 미분방정식으로 쓸 수 있습니다. 이 미끄러짐을 <b>경사 흐름</b>(gradient flow)이라고 해요.
    </p>
    <MathBlock expr="\frac{d\theta}{dt} = -\nabla L(\theta) \quad\xrightarrow{\ \text{오일러법, }\Delta t = \eta\ }\quad \theta_{k+1} = \theta_k - \eta\, \nabla L(\theta_k)" />
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      <b>∇L</b>(나블라 엘)은 2부 9장의 기울기(그래디언트)입니다. 왼쪽 미분방정식을 시간 간격 η로 오일러법 계산하면 오른쪽, 곧 경사하강이
      그대로 나와요. <b>학습률 η가 DT</b>이고, 곡률 λ인 골짜기에서는 시간 상수가 τ = 1/λ입니다. 그래서 안정 조건 DT &lt; 2τ는
      <b>η × λ &lt; 2</b>, 8부 2장에서 실험으로 찾은 발산 경계와 똑같습니다.
    </p>

    <DetailsCard title="➕ 더 깊이: 오일러법보다 똑똑한 방법들 (RK4)">
      오일러법은 칸의 <b>시작점</b> 기울기만 보고 나아가서, 곡선이 휘는 동안 계속 바깥으로 벗어납니다. 칸 안에서 기울기를
      여러 번 재서 평균을 내면 훨씬 정확해지는데, 가장 널리 쓰는 것이 <b>룽게-쿠타 4차</b>(RK4)예요. 한 칸에서 기울기를
      네 번 재고, DT를 반으로 줄이면 오차가 1/16로 줄어듭니다(4차 정확도). τ = 4인 격차를 DT = 1로 8개월 계산하면 오일러법은
      오차 3.52, RK4는 약 0.001이에요(노트북에서 확인). Vensim·Stella 같은 도구에도 오일러법과 RK4를 고르는 메뉴가 있습니다.
      다만 이 과정의 실험들은 결과를 노트북과 한 자리까지 맞추려고 단순한 오일러법을 아주 작은 DT(1/16)로 씁니다.
    </DetailsCard>

    <ReviewFlag id="ch5-ai" chapter="ch5" label="🤖 AI 연결: 학습률은 시간 간격, 발산 경계는 같은 식" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 학습률은 시간 간격, 발산 경계는 같은 식">
      <b><PartLink :part="8" ch="ch2">8부 2장</PartLink></b>에서 곡률 2인 골짜기의 학습률을 1.0보다 크게 잡자 손실이 폭발했습니다.
      오늘 실험의 DT를 2τ보다 크게 잡자 계산이 발산한 것과 <b>똑같은</b> 현상이에요. 경사하강은
      <b><PartLink :part="2" ch="ch9">2부 9장</PartLink></b>의 그래디언트가 만드는 미끄러짐(경사 흐름)을 오일러법으로 계산한 것이고,
      학습률은 시간 간격, 곡률은 1/시간 상수이기 때문입니다. 학습률이 조금만 커도 손실 곡선이 지그재그로 흔들리는 것(8부 9장)은
      오늘 본 '가짜 출렁임'이고요. 한 가지 구별: 여기서 말하는 오차는 칸을 썰어 생기는 <b>절단 오차</b>(truncation error)로,
      <b><PartLink :part="9" ch="ch4">9부 4장</PartLink></b>의 반올림 오차(숫자를 담는 자의 눈금 때문에 생기는 오차)와는 다른 종류예요.
      앞으로 12부의 모든 실험은 이 오일러법으로 미래를 계산합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="오일러법과 시간 간격: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="오일러법의 한 걸음은?"
        :choices="['저량(다음) = 저량(지금) + 지금의 순유량 × DT', '저량(다음) = 저량(지금) × DT', '저량(다음) = 순유량 ÷ DT', '저량(다음) = 저량(지금)의 제곱']"
        :answer="0"
        explanation="앞으로 DT 동안 지금 속도 그대로 간다고 치고 한 칸 나아갑니다. 2장의 '한 달씩 쌓기'를 칸의 폭만 자유롭게 바꾼 것이에요."
      />
      <Quiz
        difficulty="easy"
        question="DT를 작게 할수록 정확한 답에 가까워지지만 계산할 걸음 수는 늘어난다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 오일러법은 DT를 반으로 줄이면 오차도 대략 반이 되고, 걸음 수는 두 배가 돼요. 정확도와 계산량을 맞바꾸는 셈입니다."
      />
      <Quiz
        difficulty="easy"
        question="시간 상수 τ = 4인 균형 루프를 DT = 2(DT/τ = 0.5)로 계산하면?"
        :choices="['매끄럽게 줄어든다(한 걸음마다 × 0.5)', '출렁인다', '발산한다', '변하지 않는다']"
        :answer="0"
        explanation="× (1 − 0.5) = × 0.5라서 부호가 바뀌지 않고 줄어듭니다. 정확한 답보다는 조금 빨리 줄어요."
      />
      <Quiz
        difficulty="easy"
        question="dS/dt = −S/4, 처음 S = 100, DT = 2로 한 걸음 계산하면? (정수)"
        type="numeric"
        :answer="50"
        :hints="['100 + 2 × (−100/4)']"
        explanation="100 + 2 × (−25) = 50. 한 걸음마다 × (1 − 2/4) = × 0.5예요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="DT가 τ보다 크고 2τ보다 작으면?"
        :choices="['부호가 번갈아 바뀌는 가짜 출렁임, 하지만 줄어든다', '매끄럽게 줄어든다', '같은 크기로 영원히 출렁인다', '발산한다']"
        :answer="0"
        explanation="한 걸음 배수 1 − DT/τ가 −1과 0 사이라서 부호는 바뀌지만 크기는 줄어듭니다. 진짜 시스템에는 없는 계산의 출렁임이에요."
      />
      <Quiz
        difficulty="medium"
        question="DT가 2τ보다 크면?"
        :choices="['한 걸음 배수의 크기가 1보다 커져 출렁이며 발산한다', '더 정확해진다', '매끄럽게 줄어든다', '한 걸음에 0이 된다']"
        :answer="0"
        explanation="예를 들어 DT = 9, τ = 4면 × (−1.25)라서 100 → −125 → 156 → … 점점 커집니다. 수치 불안정이에요."
      />
      <Quiz
        difficulty="medium"
        question="오일러법에서 DT를 반으로 줄이면 오차는 대략?"
        :choices="['반으로 줄어든다(1차 정확도)', '4분의 1로 줄어든다', '그대로다', '두 배가 된다']"
        :answer="0"
        explanation="실험 ②의 표처럼 7.28 → 3.52 → 1.73 → 0.85 … 대략 반씩 줄어듭니다. RK4라면 1/16씩 줄어요."
      />
      <Quiz
        difficulty="medium"
        question="곡률 2인 골짜기에서 학습률 0.8로 경사하강하면 어떻게 되나?"
        :choices="['출렁이며 수렴한다(학습률 × 곡률 = 1.6)', '매끄럽게 수렴한다', '영원히 같은 크기로 출렁인다', '발산한다']"
        :answer="0"
        :hints="['학습률 × 곡률 = DT/τ 입니다.']"
        explanation="0.8 × 2 = 1.6이라 DT/τ가 1과 2 사이, 가짜 출렁임 구간입니다. 손실이 지그재그로 흔들리며 내려가요. 학습률이 1.0을 넘으면(× 2 > 2) 발산합니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="8부 2장의 발산 경계 '학습률 × 곡률 < 2'와 오일러법의 안정 조건 'DT < 2τ'가 같은 이유는?"
        :choices="['경사하강이 경사 흐름(미분방정식)을 오일러법으로 계산한 것이고, 학습률 = DT, 곡률 = 1/τ이기 때문', '우연히 숫자가 같을 뿐이다', '둘 다 2부 7장의 로그 때문이다', '컴퓨터의 반올림 오차 때문이다']"
        :answer="0"
        explanation="dθ/dt = −∇L(θ)를 간격 η로 오일러법 계산하면 경사하강이 됩니다. 곡률 λ인 골짜기의 시간 상수는 1/λ이니, DT < 2τ는 η < 2/λ, 곧 ηλ < 2예요."
      />
      <Quiz
        difficulty="hard"
        question="시뮬레이션 결과가 출렁인다. 진짜 시스템의 출렁임인지 계산 탓인지 가리는 가장 좋은 방법은?"
        :choices="['DT를 반으로 줄여 다시 계산해 본다. 출렁임이 사라지거나 크게 바뀌면 계산 탓이다', '그래프 색을 바꿔 본다', '시뮬레이션 기간을 늘린다', '처음 값을 0으로 바꾼다']"
        :answer="0"
        explanation="시스템 다이내믹스 실무의 기본 점검입니다. DT를 반으로 줄여도 결과가 거의 같으면 믿을 만하고, 크게 바뀌면 DT가 너무 컸던 거예요. 진짜 출렁임(6장의 지연)은 DT를 줄여도 남습니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch5')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">5장 완료! 미래를 계산하는 법을 손에 넣었습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        오일러법 = 시간을 잘게 썰어 쌓기, DT &lt; 2τ, 그리고 학습률 = DT. 다음은 6장입니다.
        이번엔 계산이 아니라 시스템 자체가 출렁이는 이유, 지연을 봅니다.
      </p>
      <RouterLink
        to="/ch/ch6"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        6장: 늦게 오는 소식 →
      </RouterLink>
    </div>
  </article>
</template>
