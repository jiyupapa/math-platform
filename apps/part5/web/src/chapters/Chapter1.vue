<script setup lang="ts">
// Phase 1 · 놀람의 크기 — 정보를 숫자로 재다
// 표준 구성: 개념 설명 + 새 기호 설명 + 인터랙티브 시각화 + 차트 + 미니체크 + 10문제 세트 + 노트북 안내
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { ChartView } from '@series/ui'
import SurpriseMeter from '@/components/SurpriseMeter.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 후보 수 vs 필요한 질문 수 — "천 개여도 10번"의 log 곡선 체감
const questionChart = {
  labels: ['2', '4', '8', '16', '32', '64', '128', '256', '512', '1024'],
  datasets: [
    {
      label: '필요한 반반 질문 수 (= 비트)',
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      borderColor: '#6366f1',
      backgroundColor: '#6366f1',
      tension: 0.2,
    },
  ],
}
const questionOptions = {
  scales: {
    x: { title: { display: true, text: '후보 수' } },
    y: { title: { display: true, text: '질문 수' }, ticks: { stepSize: 1 } },
  },
}

function onSetComplete() {
  progress.markDone('ch1')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 1</p>
    <h1 class="mb-4 text-3xl font-bold">놀람의 크기 — 정보를 숫자로 재다</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업에서 "정보 = 줄어드는 불확실성"이라는 문장을 얻었죠. 이번 챕터에서는 거기에
      <b>눈금</b>을 붙입니다 — 소식 하나가 주는 정보를 <b>몇 비트</b>라고 숫자로 재는 법.
      이 숫자 하나가 이후 모든 챕터(엔트로피·크로스 엔트로피·퍼플렉시티)의 벽돌이 됩니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>정보의 단위 <b>비트(bit)</b> = 반반 질문 하나의 답</li>
        <li><b>log₂</b> 를 "2를 몇 번 곱하나" 게임으로 되찾는다</li>
        <li>놀람 공식 <MathBlock inline expr="I = \log_2 \frac{1}{p}" /> 를 읽고 계산한다</li>
        <li>희귀한 단어일수록 AI 손실에 크게 기여하는 이유를 안다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 놀람의 직관 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 어떤 소식이 "정보가 많은" 소식인가</h2>
    <ReviewFlag id="ch1-s1" chapter="ch1" label="1. 어떤 소식이 정보가 많은가" />
    <p class="leading-relaxed text-slate-700">
      두 소식을 비교해 봅시다. <b>"오늘 아침 해가 동쪽에서 떴대!"</b> — 아무도 놀라지 않아요.
      <b>"옆집 사람이 로또 1등에 당첨됐대!"</b> — 온 동네가 뒤집힙니다.
      차이는 딱 하나, <b>확률</b>입니다. 확실한 일(확률 1)은 들어도 아는 게 안 늘고,
      희귀한 일일수록 듣는 순간 크게 놀라죠. 그래서 이렇게 정하면 자연스럽습니다:
    </p>
    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">소식의 정보량 = 그 소식이 주는 놀람의 크기</p>
      <p class="mt-1 text-sm text-indigo-600">확률이 낮을수록 놀람이 크고, 확률 1이면 놀람 0.</p>
    </div>

    <ConceptCard tone="note" title="새 용어 — 놀람 (surprise · 자기정보량)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>이름</b>: 놀람 — 교과서 용어로는 자기정보량(self-information)</li>
        <li><b>기호</b>: <MathBlock inline expr="I" /> ("아이" — Information 의 첫 글자)</li>
        <li><b>뜻</b>: 사건 하나가 실제로 일어났을 때 얻는 정보의 양. 확률이 낮을수록 큽니다</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'내일 해가 뜬다'는 소식은 '옆집이 로또 1등 당첨'이라는 소식보다 정보량이 크다."
      type="truefalse"
      :answer="1"
      explanation="거짓. 확률이 1에 가까운 소식은 들어도 놀랍지 않으니 정보량이 거의 0이에요. 희귀한 소식일수록 정보량이 큽니다."
    />

    <!-- 2. 비트 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 비트 — 정보를 재는 자</h2>
    <ReviewFlag id="ch1-s2" chapter="ch1" label="2. 비트 — 정보를 재는 자" />
    <p class="leading-relaxed text-slate-700">
      놀람을 <b>무엇으로</b> 잴까요? 워밍업의 스무고개가 이미 답을 줬습니다 —
      <b>반반 질문 몇 번 어치인가</b>로 재면 됩니다.
      후보 64개짜리 문제는 반반 질문 6번이면 풀렸죠. 그래서 "정답이 무엇인지 알려주는 소식"의
      정보량을 <b>6비트</b>라고 부릅니다.
    </p>

    <ConceptCard tone="note" title="새 용어 — 비트 (bit)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>이름</b>: 비트 (bit, binary digit 의 줄임)</li>
        <li><b>읽는 법</b>: "비트" — 6 bit 는 "육 비트"</li>
        <li>
          <b>뜻</b>: 정보의 기본 단위. <b>1비트 = 반반 질문 하나의 답</b>
          (= 후보를 절반으로 줄이는 정보량. 예/아니오 하나, 동전 앞뒤 하나)
        </li>
        <li>
          컴퓨터 용량의 비트(0과 1 한 자리)와 같은 뿌리예요 — 0/1 한 자리가 담을 수 있는
          정보가 정확히 반반 질문 하나의 답이거든요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-4 leading-relaxed text-slate-700">
      후보 수가 늘면 질문 수(비트)는 어떻게 늘까요? 아래 그래프를 보세요 —
      후보가 <b>두 배</b>가 될 때마다 질문은 <b>딱 한 번</b>만 늘어납니다.
      후보 1024개도 질문 10번이면 끝. 이 "천천히 늘어나는 곡선"이 이번 챕터의 주인공입니다.
    </p>

    <ChartView type="line" :data="questionChart" :options="questionOptions" :height="260" />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="2를 몇 번 곱하면 32가 될까요? (= 후보 32개에 필요한 반반 질문 수)"
      type="numeric"
      :answer="5"
      :hints="['2 → 4 → 8 → 16 → 32, 화살표를 세어 보세요.']"
      explanation="2×2×2×2×2 = 32, 5번입니다. 그래서 후보 32개 = 5비트."
    />

    <!-- 3. log₂ 재도입 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. log₂ — "2를 몇 번 곱하나" 게임</h2>
    <ReviewFlag id="ch1-s3" chapter="ch1" label="3. log₂ — 2를 몇 번 곱하나" />
    <p class="leading-relaxed text-slate-700">
      방금 계속 하던 놀이 — "2를 몇 번 곱하면 N이 되나?" — 에는 수학 이름이 있습니다.
      바로 <b>로그</b>예요. 2부(미분) 7장에서 만났던 그 log 맞습니다.
      무서운 기호가 아니라, 방금 여러분이 암산으로 하던 게임에 붙은 이름일 뿐이에요.
    </p>

    <ConceptCard tone="note" title="새 기호 — log₂ (로그)">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <MathBlock inline expr="\log_2 N" /> &nbsp;
          <b>이름</b>: 밑이 2인 로그 · <b>읽는 법</b>: "로그 투 엔" ·
          <b>뜻</b>: <b>2를 몇 번 곱하면 N이 되는가</b>
        </li>
        <li>
          예: <MathBlock inline expr="\log_2 8 = 3" /> (2×2×2 = 8),
          <MathBlock inline expr="\log_2 64 = 6" />,
          <MathBlock inline expr="\log_2 2 = 1" />,
          <MathBlock inline expr="\log_2 1 = 0" /> (한 번도 안 곱해도 1)
        </li>
        <li><b>핵심 성질</b>: N이 <b>두 배</b>가 되면 log₂N 은 <b>+1</b>. (질문 한 번 추가!)</li>
      </ul>
    </ConceptCard>

    <DetailsCard title="➕ 더 깊이: log₂ 6 처럼 딱 안 떨어지면 어쩌죠?">
      "2를 몇 번 곱하면 6?" — 2번(4)과 3번(8) 사이라서 정수로 안 떨어집니다.
      답은 <MathBlock inline expr="\log_2 6 \approx 2.58" /> 처럼 <b>소수</b>가 되는데,
      전혀 문제없어요. "질문 2.58번"이 이상하게 들리겠지만, 여러 문제를 풀 때의
      <b>평균 질문 수</b>로는 완벽하게 말이 됩니다(3장 엔트로피에서 확인해요).
      계산은 계산기나 파이썬 <code class="rounded bg-slate-100 px-1 text-[13px]">np.log2(6)</code> 에 맡기면 됩니다 —
      손으로 구할 일은 없어요.
    </DetailsCard>

    <!-- 4. 놀람 공식 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 드디어 공식 — 놀람 I = log₂(1/p)</h2>
    <ReviewFlag id="ch1-s4" chapter="ch1" label="4. 놀람 공식 I = log₂(1/p)" />
    <p class="leading-relaxed text-slate-700">
      이제 조각을 맞춥시다. 후보 64개 중 하나를 찍는 문제에서, 각 후보의 확률은
      <MathBlock inline expr="p = \tfrac{1}{64}" /> 입니다. 필요한 질문 수는
      <MathBlock inline expr="\log_2 64" /> — 그런데 <MathBlock inline expr="64 = \tfrac{1}{p}" /> 이죠.
      그래서 놀람은 확률만 알면 바로 계산됩니다:
    </p>
    <MathBlock expr="I = \log_2 \frac{1}{p}" />
    <p class="mt-1 text-sm text-slate-500">
      읽는 법: "아이 는 로그 투, 일 나누기 피" — <b>확률의 역수에 log₂ 를 씌운 것</b>.
      확률 p 가 작을수록 1/p 가 커지고, 놀람도 커집니다.
    </p>

    <p class="mt-4 leading-relaxed text-slate-700">
      아래 게이지로 직접 확인해 보세요. 슬라이더를 오른쪽 끝(확률 100%)으로 밀면 놀람이
      <b>0으로 죽고</b>, 왼쪽으로 갈수록 <b>절벽처럼 치솟습니다</b>. 로또 버튼도 눌러 보세요.
    </p>

    <SurpriseMeter />

    <ConceptCard tone="tip" title="공식이 통과해야 할 상식 3가지 — 전부 통과!">
      <ul class="list-disc space-y-1 pl-5">
        <li>확실한 일은 안 놀랍다: <MathBlock inline expr="p=1 \Rightarrow I = \log_2 1 = 0" /> ✓</li>
        <li>희귀할수록 크게 놀란다: p 가 작아질수록 I 가 커짐 ✓</li>
        <li>동전 앞면(p = 1/2)은 딱 반반 질문 하나: <MathBlock inline expr="I = \log_2 2 = 1" /> 비트 ✓</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="확률 1/8 인 사건이 일어났을 때의 놀람은 몇 비트일까요?"
      type="numeric"
      :answer="3"
      :hints="['I = log₂(1/p) = log₂ 8.', '2를 몇 번 곱하면 8이 되나요?']"
      explanation="1/p = 8 이고 2×2×2 = 8 이므로 log₂8 = 3비트입니다."
    />

    <!-- 5. 가산성 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 놀람은 더해진다 — log 를 쓰는 진짜 이유</h2>
    <ReviewFlag id="ch1-s5" chapter="ch1" label="5. 놀람은 더해진다" />
    <p class="leading-relaxed text-slate-700">
      동전을 두 번 던져 <b>둘 다 앞면</b>이 나왔다고 해요. 확률은
      <MathBlock inline expr="\tfrac{1}{2} \times \tfrac{1}{2} = \tfrac{1}{4}" /> (3부에서 배운 독립 사건의 곱셈),
      놀람은 <MathBlock inline expr="\log_2 4 = 2" /> 비트.
      그런데 이건 정확히 <b>앞면 하나의 놀람(1비트) + 앞면 하나의 놀람(1비트)</b>입니다.
    </p>
    <div class="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
      <MathBlock expr="\text{확률은 곱해지고}\quad p_1 \times p_2 \qquad \text{놀람은 더해진다}\quad I_1 + I_2" />
    </div>
    <p class="leading-relaxed text-slate-700">
      <b>곱셈을 덧셈으로 바꿔 주는 것</b> — 이게 log 의 초능력이고, 놀람을 하필 log 로 재는
      진짜 이유입니다. 덕분에 문장 전체의 놀람은 "단어 하나하나의 놀람의 합"으로 계산할 수 있어요.
      (7장 퍼플렉시티에서 이 성질을 그대로 씁니다.)
    </p>

    <DetailsCard title="➕ 더 깊이: 비트 말고 다른 단위도 있나요? (−log p 표기)">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <MathBlock inline expr="\log_2 \frac{1}{p} = -\log_2 p" /> — 교과서·논문에서는
          마이너스를 앞에 붙인 <b>−log₂ p</b> 표기를 더 자주 씁니다. 1/p 에 로그를 씌운 것과
          완전히 같은 값이에요 (로그의 나눗셈 규칙).
        </li>
        <li>
          밑을 2 대신 자연상수 e 로 하면(<MathBlock inline expr="\ln" />, 2부 7장) 단위가
          비트 대신 <b>내트(nat)</b>가 됩니다. 1 nat ≈ 1.44 bit — 자의 눈금이 cm냐 inch냐 차이일 뿐,
          정보의 크기 자체는 같아요. 딥러닝 코드는 주로 ln(nat)을 씁니다.
        </li>
      </ul>
    </DetailsCard>

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 희귀 토큰일수록 크게 혼나는 이유</h2>
    <ReviewFlag id="ch1-ai" chapter="ch1" label="🤖 희귀 토큰일수록 크게 혼나는 이유" />
    <p class="leading-relaxed text-slate-700">
      LLM 은 다음 단어(토큰)마다 확률을 매깁니다. 학습할 때는 <b>정답 토큰에 모델이 줬던 확률 q</b> 를
      꺼내서 채점하는데, 그 채점 공식이 바로 방금 배운 놀람이에요.
    </p>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 손실 = 모델의 놀람">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          정답 토큰에 대한 손실 = <MathBlock inline expr="-\log q(\text{정답})" /> =
          <b>모델이 정답을 보고 느낀 놀람</b>. 자신 있게 맞히면(q ≈ 1) 손실 ≈ 0,
          "설마 이 단어라고?"(q ≈ 0.001) 하면 손실이 폭발합니다.
        </li>
        <li>
          그래서 <b>희귀한 정답 토큰</b>(모델이 낮은 확률을 준 토큰)일수록 손실 기여가 크고,
          모델은 그 부분을 집중적으로 고치게 됩니다 — 크게 놀란 만큼 크게 배우는 구조.
        </li>
        <li>
          이 −log q 를 문장 전체에 대해 평균 낸 것이 <b>크로스 엔트로피 손실</b>(4장),
          2^(그 값)이 <b>퍼플렉시티</b>(7장)예요. 이번 챕터의 공식 하나로 두 챕터를 예약해 둔 셈!
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="모델이 정답 토큰에 확률 0.9를 준 경우와 0.001을 준 경우, 손실(놀람)이 더 큰 쪽은?"
      :choices="['0.001을 준 경우', '0.9를 준 경우', '둘 다 같다', '확률과 손실은 무관하다']"
      :answer="0"
      explanation="손실 = −log q 이므로 q 가 작을수록(더 놀랄수록) 큽니다. q=0.9 는 거의 0, q=0.001 은 약 10비트."
    />

    <!-- 연습 문제 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">6. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="놀람의 크기 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="확률이 낮은 사건일수록 일어났을 때의 놀람(정보량)이 크다."
        type="truefalse"
        :answer="0"
        explanation="참. 놀람 I = log₂(1/p) 는 p 가 작을수록 커집니다."
      />
      <Quiz
        difficulty="easy"
        question="1비트를 가장 잘 설명한 것은?"
        :choices="['반반 질문 하나의 답이 주는 정보량', '글자 한 개의 크기', '확률 그 자체', '항상 숫자 1을 뜻함']"
        :answer="0"
        :hints="['후보를 절반으로 줄이는 정보가 1비트예요.']"
        explanation="1비트 = 예/아니오 반반 질문 하나의 답 = 후보를 절반으로 줄이는 정보량입니다."
      />
      <Quiz
        difficulty="easy"
        question="log₂ 8 은 얼마일까요?"
        type="numeric"
        :answer="3"
        explanation="2×2×2 = 8, 즉 2를 3번 곱하면 8이므로 3입니다."
      />
      <Quiz
        difficulty="easy"
        question="반드시 일어나는 사건(확률 1)의 놀람은 0이다."
        type="truefalse"
        :answer="0"
        explanation="참. log₂(1/1) = log₂1 = 0 — 이미 아는 일은 들어도 정보가 안 늘어요."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="확률 p = 1/16 인 사건의 놀람을 공식 I = log₂(1/p) 대로 단계별로 구하세요. (답은 비트)"
        :steps="[
          { lhs: '1/p', answer: 16 },
          { lhs: '\\log_2 16', answer: 4 },
        ]"
        :hints="['먼저 확률의 역수 1/p 를 구하세요.', '2를 몇 번 곱하면 16이 되나요?']"
        explanation="1/(1/16) = 16 이고, 2⁴ = 16 이므로 놀람은 4비트입니다."
      />
      <Quiz
        difficulty="medium"
        question="후보 1024개 중 하나가 정답일 때, 정답을 알려주는 소식의 정보량은 몇 비트일까요?"
        type="numeric"
        :answer="10"
        :hints="['워밍업에서 계산했어요 — 1024 = 2 를 몇 번 곱한 수?']"
        explanation="1024 = 2¹⁰ 이므로 log₂1024 = 10비트입니다."
      />
      <Quiz
        difficulty="medium"
        question="독립인 두 사건이 연달아 일어났을 때, 전체 놀람은 각 놀람을 어떻게 한 것일까요?"
        :choices="['더한 것', '곱한 것', '평균 낸 것', '큰 쪽만 남긴 것']"
        :answer="0"
        :hints="['확률은 곱해지고, log 는 곱셈을 무엇으로 바꿔 주나요?']"
        explanation="확률은 곱해지지만 log 가 곱셈을 덧셈으로 바꿔 줘서, 놀람은 더해집니다."
      />
      <Quiz
        difficulty="medium"
        question="동전 앞면(p = 1/2)의 놀람과 주사위 6(p = 1/6)의 놀람 중 어느 쪽이 클까요?"
        :choices="['주사위 6', '동전 앞면', '둘이 같다', '비교할 수 없다']"
        :answer="0"
        explanation="더 희귀한 쪽이 더 놀랍습니다. 동전은 1비트, 주사위는 log₂6 ≈ 2.58비트."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="동전을 10번 던져 전부 앞면이 나왔습니다(확률 1/1024). 이 사건의 놀람은 몇 비트일까요?"
        type="numeric"
        :answer="10"
        :hints="['앞면 하나의 놀람은 1비트, 독립 사건의 놀람은 더해져요.', '1비트 × 10번.']"
        explanation="1비트짜리 놀람이 10번 더해져 10비트. log₂1024 = 10 으로 직접 계산해도 같습니다."
      />
      <StepQuiz
        difficulty="hard"
        question="확률 1/4 인 사건 A 와 확률 1/8 인 사건 B 가 독립으로 함께 일어났습니다. 전체 놀람을 두 방법이 일치하는지 단계별로 확인하세요."
        :steps="[
          { lhs: 'I_A = \\log_2 4', answer: 2 },
          { lhs: 'I_B = \\log_2 8', answer: 3 },
          { lhs: '1/(p_A \\times p_B)', answer: 32 },
          { lhs: '\\log_2 32', answer: 5 },
        ]"
        :hints="['각 사건의 놀람부터: log₂4 와 log₂8.', '함께 일어날 확률은 (1/4)×(1/8) = 1/32.', '2 + 3 과 log₂32 가 같은지 확인!']"
        explanation="I_A + I_B = 2 + 3 = 5 이고, 결합 확률 1/32 의 놀람도 log₂32 = 5. 확률의 곱셈이 놀람의 덧셈이 되는 걸 확인했어요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch1')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 1 완료. 정보에 눈금을 붙였습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 이 눈금의 첫 활용 — 자주 나오는 것에 짧은 코드를 주는 <b>압축</b>입니다.
      </p>
      <RouterLink
        to="/ch/ch2"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 아껴 쓰는 비트 →
      </RouterLink>
    </div>
  </article>
</template>
