<script setup lang="ts">
// Phase 0 샘플 챕터 — 공통 컴포넌트를 모두 사용해 "한 챕터의 완성형"을 보여준다.
// 실제 Phase 1~10 챕터도 이 구조를 그대로 따른다.
// 주제: 소프트맥스(softmax) — 트랜스포머가 점수를 확률로 바꾸는 바로 그 장치.
import { ref, computed } from 'vue'
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { ChartView } from '@series/ui'
import SoftmaxLab, { type Token } from '@/components/SoftmaxLab.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { softmax, argmax } from '@/utils/softmax'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// "오늘 날씨가 정말 ___" 다음에 올 단어 후보 4개와 각자의 점수(logit).
const tokens = ref<Token[]>([
  { label: '좋다', logit: 3 },
  { label: '춥다', logit: 1.5 },
  { label: '덥다', logit: 1 },
  { label: '사과', logit: -2 },
])

const probs = computed(() => softmax(tokens.value.map((t) => t.logit)))
const winner = computed(() => argmax(probs.value))

// 지수 단계(e^z) 막대 차트 — 정규화 직전의 중간값을 실시간으로 보여준다.
const expChartData = computed(() => ({
  labels: tokens.value.map((t) => t.label),
  datasets: [
    {
      label: 'e^(점수) — 정규화 전 지수값',
      data: tokens.value.map((t) => Math.exp(t.logit)),
      backgroundColor: ['#818cf8', '#34d399', '#fbbf24', '#f472b6'],
      borderRadius: 6,
    },
  ],
}))

function onSetComplete() {
  progress.markDone('sample')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 0 · 샘플 챕터</p>
    <h1 class="mb-4 text-3xl font-bold">소프트맥스 맛보기 — 점수를 확률로</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      이 페이지는 학습 프로그램의 "한 챕터"가 어떻게 생겼는지 보여주는 견본입니다.
      설명 카드, 수식, 차트, 실시간 조작 실험, 자동채점 문제가 모두 들어 있습니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      트랜스포머가 다음 단어를 고를 때, 단어마다 매긴 <b>점수</b>를 <b>확률</b>로 바꾸는
      <b>소프트맥스(softmax)</b>를 손으로 만져보며 이해합니다. 공식은 맨 마지막에 다룹니다.
    </ConceptCard>

    <!-- ===== 1. 직관 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      1. LLM은 "점수"를 "확률"로 바꾼다
      <ReviewFlag id="sample-s1" chapter="sample" label="1. 점수를 확률로" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      "오늘 날씨가 정말 ___" 다음에 올 단어를 LLM이 고른다고 해봅시다. 모델은 후보 단어마다
      <b>"얼마나 어울리는지" 점수</b>를 매깁니다. 이 점수는 <b>음수도, 큰 양수도</b> 될 수 있어서
      그대로는 "확률"이라 부르기 어렵습니다. 소프트맥스는 이 점수들을
      <b>0~1 사이로, 모두 더하면 1(=100%)</b>이 되도록 부드럽게 바꿔줍니다.
    </p>
    <p class="mt-2 leading-relaxed text-slate-700">
      이렇게 만들어진 확률 묶음을 <b>확률 분포(distribution)</b>라고 불러요 —
      <b>각 후보의 확률을 모아놓은 것</b>이고, <b>다 더하면 1</b>이 되는 게 특징입니다.
      (앞으로 자주 나올 말이니 기억해 두세요.)
    </p>
    <p class="mt-2 leading-relaxed text-slate-700">
      아래 <b>슬라이더를 움직여</b> 점수를 바꿔 보세요. 확률 막대와 "LLM이 고를 단어"가 실시간으로 바뀝니다.
    </p>

    <SoftmaxLab v-model="tokens" />

    <ConceptCard tone="note" title="새 용어: 로짓(logit)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>이름</b>: 로짓 (logit)</li>
        <li><b>읽는 법</b>: "로짓"</li>
        <li><b>뜻</b>: 소프트맥스에 넣기 <b>전의 날것 점수</b>. 크기 제한도 없고, 음수도 됩니다.
          (한국어로는 "점수"라고 부를게요.)</li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="tip" title="지금 보이는 상태">
      현재 가장 점수가 높은 단어는 <b>"{{ tokens[winner].label }}"</b> 이고,
      그 확률은 <b>{{ (probs[winner] * 100).toFixed(1) }}%</b> 입니다.
      슬라이더로 다른 단어 점수를 더 올리면 그 단어가 1등이 됩니다.
    </ConceptCard>

    <!-- 본문 중간 미니체크 (진도 미포함) -->
    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="후보 단어의 점수(로짓)는 음수가 될 수도 있다."
      type="truefalse"
      :answer="0"
      explanation="맞아요. 점수는 크기 제한이 없어 음수도 됩니다. 소프트맥스가 그런 점수까지 0~1 확률로 바꿔줍니다."
    />

    <!-- 심화 곁가지 (본류를 다 본 뒤, 궁금한 사람만) -->
    <DetailsCard title="➕ 더 깊이 알아보기 — 로짓의 정체">
      <p class="mb-2">
        <b>① 로짓은 혼자선 의미가 약합니다.</b> 점수 <MathBlock inline expr="3" /> 이 높은지 낮은지는
        <b>다른 단어들의 점수와 비교</b>해야만 알 수 있어요. 그래서 모든 점수에 같은 수를 더해도 확률이
        안 변하는 겁니다 — 중요한 건 <b>절대값이 아니라 차이</b>.
      </p>

      <p class="mb-1 mt-3 font-semibold text-slate-800">② 왜 이름이 "로짓(logit)"일까?</p>
      <p class="mb-2">
        원래 뜻은 <b>로그 오즈(log-odds)</b> — 확률을 거꾸로 펼쳐 놓은 값입니다.
      </p>
      <ul class="mb-2 list-disc space-y-1 pl-5 text-sm">
        <li>
          <b>오즈(odds)</b> = 일어날 확률 <MathBlock inline expr="\div" /> 안 일어날 확률.
          예: 이길 확률 75% → <MathBlock inline expr="0.75 / 0.25 = 3" /> ("3대 1").
        </li>
        <li>거기에 <b>로그(log)</b>를 씌운 게 로짓입니다.</li>
      </ul>

      <div class="mb-2 rounded-lg bg-white px-4 py-3 text-sm">
        <p class="mb-1 font-semibold text-slate-800">잠깐 — 로그(log)가 뭐죠?</p>
        <p>
          <b>로그는 지수(거듭제곱)의 반대</b>예요. 지수 <MathBlock inline expr="e^{x}" /> 가
          "<MathBlock inline expr="e" />(≈2.72)를 <MathBlock inline expr="x" />번 곱하기"라면,
          로그는 거꾸로 <b>"<MathBlock inline expr="e" /> 를 몇 제곱해야 이 수가 되지?"</b> 를 알아냅니다.
          (예: <MathBlock inline expr="\ln(1)=0" />, <MathBlock inline expr="\ln(2.72)\approx 1" />,
          <MathBlock inline expr="\ln(7.39)\approx 2" />.) 여기 로그는 밑이
          <MathBlock inline expr="e" /> 인 <b>자연로그 <MathBlock inline expr="\ln" /></b> 입니다 —
          소프트맥스가 <MathBlock inline expr="e" /> 를 쓰니 짝을 맞춘 거예요.
        </p>
      </div>

      <p class="mb-2">
        오즈는 항상 <b>0보다 큰 값</b>이라 그대로는 음수가 못 됩니다. 그런데 로그를 씌우면
        <b>−무한대 ~ +무한대</b>로 쫙 펼쳐져요. 그래서 로짓이 음수도 되는 겁니다 —
        <b>반반(50%)이면 0, 유리하면 +, 불리하면 −.</b>
      </p>
      <div class="mb-2 overflow-x-auto">
        <table class="w-full text-center text-sm">
          <thead>
            <tr class="border-b border-slate-300 text-slate-500">
              <th class="px-2 py-1 font-medium">이길 확률</th>
              <th class="px-2 py-1 font-medium">오즈 (확률÷반대확률)</th>
              <th class="px-2 py-1 font-medium">로짓 = ln(오즈)</th>
            </tr>
          </thead>
          <tbody class="font-mono tabular-nums">
            <tr class="border-b border-slate-100"><td class="py-1">75%</td><td>3</td><td class="font-bold text-indigo-600">+1.10</td></tr>
            <tr class="border-b border-slate-100 bg-slate-50"><td class="py-1">50%</td><td>1</td><td class="font-bold text-slate-700">0</td></tr>
            <tr><td class="py-1">25%</td><td>0.33</td><td class="font-bold text-rose-500">−1.10</td></tr>
          </tbody>
        </table>
      </div>
      <p class="mb-2 text-sm text-slate-500">
        0을 중심으로 위아래 대칭이죠. 확률이 높을수록 로짓은 커지고, 낮을수록 작아집니다.
      </p>

      <p class="mb-2">
        그래서 <b>로짓과 확률은 동전의 양면</b>이에요. 로그로 펼쳐 놓은 값을
        <b>지수 <MathBlock inline expr="e^{z}" /> 로 되돌려</b> 다시 0~1 확률로 누르는 것 —
        그게 바로 소프트맥스가 하는 일입니다. (로그와 지수는 서로를 푸는 짝이라,
        공식에 <MathBlock inline expr="e" /> 가 등장하는 이유이기도 해요.)
      </p>

      <p class="mb-1 mt-3 font-semibold text-slate-800">③ 진짜 LLM에선 로짓이 몇 개나 나올까?</p>
      <p class="mb-2">
        샘플에선 후보가 4개라 로짓도 4개지만, 진짜 LLM은 <b>단어 사전 전체</b>(예: 5만 개 단어)에 대해
        점수를 하나씩 뽑습니다. 즉 <b>로짓은 단어 사전 크기만큼</b>(약 5만 개) 나오고, 이를 소프트맥스에
        통과시켜 "다음 단어가 각 단어일 확률" 5만 개를 얻습니다. (Phase 9 출력층에서 자세히)
      </p>

      <div class="mt-3 rounded-lg bg-white px-4 py-3 text-sm text-slate-600">
        🎯 <b>한 컷 비유</b>: 로짓은 <b>시험 원점수</b>, 확률은 <b>반에서 차지하는 몫(%)</b>.
        원점수 80점이 잘한 건지는 반 평균과 비교해야 알 수 있죠 — 소프트맥스가 그 비교·환산을 해줍니다.
      </div>
    </DetailsCard>

    <!-- ===== 2. 왜 지수를 쓸까 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      2. 왜 지수(e)를 한 번 거칠까?
      <ReviewFlag id="sample-s2" chapter="sample" label="2. 왜 지수를 쓸까" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      "점수를 다 더한 값으로 나누면 되지 않나?" 싶지만, 점수에는 <b>음수</b>가 있어서
      그냥 나누면 음수 확률이 생깁니다(확률은 음수가 될 수 없죠). 그래서 소프트맥스는 먼저
      모든 점수를 <b>지수 함수에 통과</b>시킵니다. 지수를 거치면 어떤 수든 <b>항상 양수</b>가 되고,
      <b>점수 차이가 클수록 확률 차이도 도드라지게</b> 벌어집니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="점수에 음수가 섞여 있어도 소프트맥스 확률은 음수가 되지 않는다. 그 비결은?"
      :choices="[
        '음수를 그냥 0으로 바꿔서',
        '지수 함수(e^x)를 거치면 항상 양수가 되기 때문에',
        '제일 작은 값을 빼서',
        '확률은 원래 음수가 될 수 있어서',
      ]"
      :answer="1"
      :hints="['e^x 는 x가 음수여도 결과가 0보다 큽니다.']"
      explanation="지수 함수는 입력이 음수든 양수든 결과가 항상 0보다 큽니다. 그래서 음수 확률이 안 나옵니다."
    />

    <!-- ===== 3. 공식 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      3. 드디어 공식
      <ReviewFlag id="sample-s3" chapter="sample" label="3. 소프트맥스 공식" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      후보가 여러 개일 때, <MathBlock inline expr="i" /> 번째 단어의 확률은 이렇게 구합니다.
    </p>
    <MathBlock expr="\text{softmax}(z_i) = \dfrac{e^{z_i}}{\sum_{j} e^{z_j}}" />
    <p class="mt-1 text-sm text-slate-500">
      한 줄로 읽으면: <b>"내 점수의 지수"</b>를 <b>"모두의 점수의 지수를 더한 값"</b>으로 나눈다.
    </p>

    <ConceptCard tone="note" title="새 기호 풀이 — 처음 보는 기호 네 개">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <MathBlock inline expr="z_i" /> &nbsp;
          <b>이름</b>: 제트 아이 · <b>읽는 법</b>: "지(z) 아이(i)" ·
          <b>뜻</b>: <MathBlock inline expr="i" /> 번째 단어의 <b>점수(로짓)</b>.
          아래 첨자 <MathBlock inline expr="i" /> 는 "몇 번째인지" 번호표입니다.
        </li>
        <li>
          <MathBlock inline expr="e" /> &nbsp;
          <b>이름</b>: 자연상수(오일러 수) · <b>읽는 법</b>: "이" ·
          <b>뜻</b>: <b>약 2.718</b> 인 고정된 숫자. 원주율 <MathBlock inline expr="\pi \approx 3.14" /> 처럼
          그냥 정해진 상수예요.
        </li>
        <li>
          <MathBlock inline expr="e^{z_i}" /> &nbsp;
          <b>이름</b>: 지수 함수 · <b>읽는 법</b>: "이의 지(z)아이 제곱" ·
          <b>뜻</b>: 2.718을 점수만큼 거듭제곱. 점수가 크면 폭발적으로 커지고, <b>항상 양수</b>입니다.
          (예: <MathBlock inline expr="e^{0}=1" />, <MathBlock inline expr="e^{1}\approx 2.72" />)
        </li>
        <li>
          <MathBlock inline expr="\sum_{j} e^{z_j}" /> &nbsp;
          <b>이름</b>: 시그마(합) 기호 · <b>읽는 법</b>: "시그마 제이(j), 이의 지(z)제이 제곱의 합" ·
          <b>뜻</b>: <MathBlock inline expr="\textstyle\sum" /> 는 <b>"전부 더해라"</b>는 명령.
          여기선 <b>모든 단어</b>의 지수값을 더한 것 — 즉 분모는 "전체 합"입니다.
          <br /><b>왜 분자는 <MathBlock inline expr="i" />, 분모는 <MathBlock inline expr="j" />?</b>
          — <MathBlock inline expr="j" /> 도 <MathBlock inline expr="i" /> 와 똑같은 "몇 번째" 번호표인데,
          분모는 <b>나 하나</b>가 아니라 <b>모두</b>를 훑어 더해야 해서 글자만 다르게 빌려 쓴 거예요.
        </li>
      </ul>
      <p class="mt-2 text-sm">
        분수로 나누는 이 마지막 단계를 <b>정규화(normalization)</b>라고 합니다:
        각자를 전체 합으로 나눠 <b>합이 1이 되게</b> 맞추는 것.
      </p>
    </ConceptCard>

    <p class="mt-4 leading-relaxed text-slate-700">
      아래는 위 실험의 <b>지수 단계</b> <MathBlock inline expr="e^{z_i}" /> 값을 막대로 그린 것입니다
      (정규화 <b>직전</b>). 1번 실험의 슬라이더를 움직이면 이 막대도 같이 바뀝니다.
      이 막대들을 전부 더한 값이 공식의 <b>분모</b>이고, 각 막대를 그 합으로 나누면 확률이 됩니다.
    </p>
    <ChartView type="bar" :data="expChartData" :height="240" />

    <ConceptCard tone="warn" title="자주 하는 실수">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>모든 점수에 <b>같은 수</b>를 더하거나 빼도 <b>확률은 그대로</b>입니다(분자·분모에서 약분됨).
          점수의 <b>절대값</b>이 아니라 <b>차이</b>가 확률을 결정해요.</li>
        <li>확률이 가장 큰 단어가 "정답"은 아닙니다 — 그냥 <b>가장 그럴듯한 후보</b>일 뿐.</li>
      </ul>
    </ConceptCard>

    <!-- ===== 4. AI 연결 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      4. 🤖 트랜스포머 어디에 쓰일까
      <ReviewFlag id="sample-s4" chapter="sample" label="4. AI 연결" />
    </h2>
    <ConceptCard tone="ai" title="소프트맥스가 트랜스포머에서 일하는 두 곳">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>출력층 (다음 단어 예측)</b>: 모델이 수만 개 단어 각각에 점수를 매기면,
          소프트맥스가 이를 <b>확률 분포</b>로 바꿉니다. 그중에서 다음 단어를 고르죠.
          (Phase 9·10에서 자세히)
        </li>
        <li>
          <b>어텐션 (attention)</b>: 한 단어가 다른 단어들을 "얼마나 참고할지" 가중치를 정할 때도
          소프트맥스로 <b>합이 1인 집중도</b>를 만듭니다. (Phase 5·6에서 자세히)
        </li>
      </ul>
      <p class="mt-2 text-sm text-violet-900/80">
        즉, 소프트맥스는 트랜스포머의 <b>중간(어텐션)과 출구(다음 단어)</b> 양쪽에서 똑같이 쓰입니다.
        샘플 챕터 하나로 벌써 트랜스포머의 핵심 장치를 만진 셈이에요.
      </p>
    </ConceptCard>

    <!-- ===== 5. 문제 세트 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      세 가지 유형(객관식 · 참/거짓 · 숫자입력)을 난이도 순으로 풀어보세요.
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 막히면 힌트를 누르세요.
    </p>

    <QuizSet title="소프트맥스 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="소프트맥스의 출력(확률)들을 모두 더하면 1(=100%)이 된다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 소프트맥스는 합이 1인 '확률 분포'를 만듭니다."
      />
      <Quiz
        difficulty="easy"
        question="소프트맥스는 무엇을 무엇으로 바꾸는 장치인가요?"
        :choices="[
          '확률을 점수로',
          '점수(로짓)를 확률로',
          '단어를 숫자로',
          '문장을 토큰으로',
        ]"
        :answer="1"
        explanation="소프트맥스는 제한 없는 점수(로짓)를 0~1 사이 확률로 바꿉니다."
      />
      <Quiz
        difficulty="easy"
        question="다른 조건이 같다면, 점수가 가장 큰 단어가 확률도 가장 크다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 소프트맥스는 순서를 뒤집지 않아요 — 큰 점수 → 큰 확률."
      />
      <Quiz
        difficulty="easy"
        question="각 값을 '전체 합'으로 나눠 모두 더하면 1이 되게 맞추는 과정을 무엇이라 하나요?"
        :choices="['지수화', '정규화', '토큰화', '임베딩']"
        :answer="1"
        :hints="['합이 1이 되도록 비율을 맞추는 단계입니다.']"
        explanation="정규화(normalization). 소프트맥스의 마지막 나눗셈 단계가 바로 이것."
      />

      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="지수값(e^점수)이 [2, 2] 인 두 단어가 있습니다. 첫 단어의 확률은? (소수로)"
        type="numeric"
        :answer="0.5"
        :tolerance="0.01"
        :hints="['둘이 똑같으니 반반.', '2 / (2+2) 를 계산하세요.']"
        explanation="2 / (2+2) = 2/4 = 0.5. 점수가 같으면 확률도 똑같이 나뉩니다."
      />
      <StepQuiz
        difficulty="medium"
        question="세 단어의 지수값(e^점수)이 이미 [6, 3, 1] 로 주어졌습니다. 소프트맥스 확률을 단계별로 구하세요."
        :steps="[
          { lhs: '6 + 3 + 1', answer: 10 },
          { lhs: '6 \\div 10', answer: 0.6, tolerance: 0.001 },
          { lhs: '3 \\div 10', answer: 0.3, tolerance: 0.001 },
          { lhs: '1 \\div 10', answer: 0.1, tolerance: 0.001 },
        ]"
        :hints="['먼저 분모(전체 합)부터.', '그 다음 각자를 합으로 나누면 확률.']"
        explanation="합 10으로 각자를 나누면 [0.6, 0.3, 0.1]. 다 더하면 1이죠."
      />
      <Quiz
        difficulty="medium"
        question="모든 단어의 점수에 똑같이 +5를 더하면 확률 분포는 크게 달라진다."
        type="truefalse"
        :answer="1"
        :hints="['분자와 분모에 같은 배수가 곱해져 약분됩니다.']"
        explanation="거짓입니다. 같은 수를 모두에 더하면 확률은 변하지 않아요. 중요한 건 점수의 '차이'."
      />
      <Quiz
        difficulty="medium"
        question="점수가 [10, 0, 0] 처럼 한 단어만 압도적으로 크면 확률 분포는?"
        :choices="[
          '셋이 거의 똑같이 1/3씩',
          '거의 첫 단어 하나에 몰린다',
          '모두 0이 된다',
          '음수가 생긴다',
        ]"
        :answer="1"
        :hints="['지수는 큰 점수를 폭발적으로 키웁니다.']"
        explanation="e^10 이 나머지를 압도해서 확률이 거의 첫 단어에 쏠립니다."
      />

      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="지수값(e^점수)이 [8, 2] 인 두 단어에서, 두 번째 단어의 확률은? (소수로)"
        type="numeric"
        :answer="0.2"
        :tolerance="0.01"
        :hints="['분모는 8+2=10.', '2 / 10 을 계산.']"
        explanation="2 / (8+2) = 2/10 = 0.2. 첫 단어는 0.8."
      />
      <Quiz
        difficulty="hard"
        question="트랜스포머에서 소프트맥스가 실제로 쓰이는 곳으로 가장 옳은 것은?"
        :choices="[
          '다음 단어 예측(출력층) 한 곳뿐',
          '어텐션 가중치 한 곳뿐',
          '다음 단어 예측 + 어텐션 가중치 양쪽',
          '트랜스포머에는 쓰이지 않는다',
        ]"
        :answer="2"
        :hints="['이 챕터 4번 「AI 연결」을 떠올려 보세요.']"
        explanation="소프트맥스는 출력층(다음 단어)과 어텐션(집중도) 양쪽에서 모두 쓰입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('sample')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">샘플 챕터 완료</p>
      <p class="mt-1 text-sm text-emerald-700">
        왼쪽 진도 표시줄이 채워졌습니다. 실제 챕터도 이렇게 진행됩니다.
        대응 노트북 <code>notebooks/ch00_sample.ipynb</code> 에서 같은 계산을 손으로 해보세요.
      </p>
    </div>
  </article>
</template>
