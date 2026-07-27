<script setup lang="ts">
// Phase 3 · 행렬과 행렬 연산
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import MatrixMultiply from '@/components/MatrixMultiply.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 행렬곱 데모용 행렬
const matA = [
  [1, 2],
  [3, 4],
]
const matB = [
  [5, 6],
  [7, 8],
]
// 행렬 × 벡터 데모 (가중치 × 입력)
const weight = [
  [2, 0],
  [1, 3],
]
const inputVec = [[1], [2]]

// 작은 "이미지=숫자 행렬" 히트맵 (0=검정 ~ 9=흰색 느낌)
const imageMatrix = [
  [0, 0, 7, 0, 0],
  [0, 7, 9, 0, 0],
  [0, 0, 9, 0, 0],
  [0, 0, 9, 0, 0],
  [0, 7, 9, 7, 0],
]
function gray(v: number) {
  const c = Math.round((v / 9) * 255)
  return `rgb(${c},${c},${c})`
}

function onSetComplete() {
  progress.markDone('ch3')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 3</p>
    <h1 class="mb-4 text-3xl font-bold">행렬과 행렬 연산</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      벡터가 숫자 한 줄이라면, <b>행렬</b>은 숫자를 <b>표(격자)</b>로 묶은 것입니다.
      AI에서 데이터·가중치·이미지가 전부 행렬이라, 여기서부터가 진짜 시작이에요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>행렬의 <b>행·열·크기</b>를 읽는다</li>
        <li>행렬 <b>덧셈·스칼라배·곱셈</b>을 한다 (특히 곱셈!)</li>
        <li>행렬이 AI에서 <b>데이터·가중치·신경망 층</b>으로 쓰임을 안다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 행렬이란 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 행렬이란?</h2>
    <ReviewFlag id="ch3-s1" chapter="ch3" label="1. 행렬이란?" />
    <p class="leading-relaxed text-slate-700">행렬은 숫자를 직사각형 표로 늘어놓고 대괄호로 감싼 것입니다.</p>
    <MathBlock expr="A = \begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix}" />

    <ConceptCard tone="note" title="새 용어 — 행, 열, 크기, 성분">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>행(row)</b>: <b>가로</b> 줄. 위 행렬은 2개 행.</li>
        <li><b>열(column)</b>: <b>세로</b> 줄. 위 행렬은 3개 열. (헷갈리면 "행=가로, 열=세로" 외우기)</li>
        <li>
          <b>크기</b>: "행×열"로 말합니다. 위는 <b>2×3 행렬</b> ("이 바이 삼"). <b>항상 행을 먼저!</b>
        </li>
        <li>
          <b>성분(원소)</b>: 칸 하나의 숫자. <MathBlock inline expr="a_{ij}" /> ("에이 아이제이"로 읽음)는
          <b>i행 j열</b>의 수예요. (글자 아래 작은 숫자 두 개 = <b>이중 첨자</b>, 앞이 행·뒤가 열)
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="3개 행, 2개 열을 가진 행렬의 크기는?"
      :choices="['2×3', '3×2', '3×3', '2×2']"
      :answer="1"
      :hints="['행을 먼저 씁니다.']"
      explanation="행 3, 열 2 → 3×2 행렬."
    />

    <!-- 2. 덧셈/스칼라배 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 덧셈과 스칼라배 — 성분끼리</h2>
    <ReviewFlag id="ch3-s2" chapter="ch3" label="2. 덧셈과 스칼라배 — 성분끼리" />
    <p class="leading-relaxed text-slate-700">
      행렬 덧셈과 스칼라배는 쉽습니다. 벡터처럼 <b>같은 자리끼리</b> 계산해요.
      (단, 덧셈은 <b>크기가 같아야</b> 가능)
    </p>
    <MathBlock
      expr="\begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix} + \begin{bmatrix} 5 & 6 \\ 7 & 8 \end{bmatrix} = \begin{bmatrix} 6 & 8 \\ 10 & 12 \end{bmatrix}"
    />
    <MathBlock expr="2\begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix} = \begin{bmatrix} 2 & 4 \\ 6 & 8 \end{bmatrix}" />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="크기가 다른 두 행렬(2×2 와 2×3)은 더할 수 없다."
      type="truefalse"
      :answer="0"
      explanation="참. 덧셈은 같은 자리끼리 하므로 크기가 같아야 합니다."
    />

    <!-- 3. 행렬 곱셈 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 행렬 곱셈 — 행 × 열</h2>
    <ReviewFlag id="ch3-s3" chapter="ch3" label="3. 행렬 곱셈 — 행 × 열" />
    <p class="leading-relaxed text-slate-700">
      행렬 곱셈은 살짝 독특합니다. 결과의 한 칸은
      <b>왼쪽 행렬의 한 "행"</b> 과 <b>오른쪽 행렬의 한 "열"</b> 을 <b>내적</b>한 값이에요.
      (<b>내적</b> = 앞 챕터에서 배운 "성분끼리 곱해서 모두 더하기" — 행과 열을 각각 벡터로 보는 거예요.)
    </p>

    <ConceptCard tone="warn" title="새 규칙 — 곱셈은 차원이 맞아야!">
      <p class="mb-2 text-sm text-slate-500">
        먼저: <MathBlock inline expr="(m\times n)" /> 의 <b>×는 곱셈이 아니라 "m행 n열"</b>이라는 <b>크기 표기</b>예요 (2×3 = 2행 3열, 6이 아님).
      </p>
      <p>
        <MathBlock inline expr="(m\times n)" /> 행렬과 <MathBlock inline expr="(n\times p)" /> 행렬만
        곱할 수 있습니다. <b>앞의 열 수 = 뒤의 행 수</b> 여야 해요. 결과는
        <MathBlock inline expr="(m\times p)" /> 가 됩니다.
      </p>
      <MathBlock expr="(m\times \underline{n}) \cdot (\underline{n}\times p) = (m\times p)" />
      <p class="mt-2 text-sm">
        예: <MathBlock inline expr="(3\times \underline{4}) \cdot (\underline{4}\times 2) = (3\times 2)" /> — 가운데 4가 같아서 곱할 수 있어요.
      </p>
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      아래에서 <b style="color: var(--c-emerald-700)">결과 행렬 C의 칸</b>을 눌러보세요. 그 칸이
      <b style="color:var(--c-indigo-600)">A의 행</b>과 <b style="color: var(--c-pink-700)">B의 열</b>을 어떻게 내적하는지 보여줍니다.
    </p>
    <MatrixMultiply :a="matA" :b="matB" />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="결과 행렬의 (1행, 1열) 값은? A의 1행 (1, 2) 와 B의 1열 (5, 7) 의 내적."
      type="numeric"
      :answer="19"
      :hints="['1×5 + 2×7 입니다.', '5 + 14 = ?']"
      explanation="1×5 + 2×7 = 5 + 14 = 19."
    />

    <!-- 4. 행렬 × 벡터 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 행렬 × 벡터 (가장 중요)</h2>
    <ReviewFlag id="ch3-s4" chapter="ch3" label="4. 행렬 × 벡터 (가장 중요)" />
    <p class="leading-relaxed text-slate-700">
      벡터는 <b>열이 1개인 행렬</b>(ch1에서 본, 세로로 쓴 <b>열벡터</b>)로 볼 수 있어요. 그래서 <b>행렬 × 벡터</b> 도 같은 규칙입니다.
      이게 AI 신경망의 기본 동작이라 특히 중요합니다.
    </p>

    <ConceptCard tone="note" title="새 용어 — 입력(x)과 가중치(W)">
      <p>아래 그림에 나오는 두 AI 용어를 먼저 짚고 갑시다.</p>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li>
          <b>입력 <MathBlock inline expr="\vec{x}" /> (input)</b>: AI에 <b>들어가는 데이터</b>를 숫자로
          적은 벡터. 예: 어떤 사람의 (키, 몸무게) = <MathBlock inline expr="(1, 2)" />.
        </li>
        <li>
          <b>가중치 <MathBlock inline expr="W" /> (weight)</b>: 각 입력을 <b>얼마나 중요하게 볼지</b> 정하는
          숫자들의 행렬. 가중치가 크면 그 입력을 많이 반영하고, 0이면 무시합니다.
          이 값을 AI가 <b>학습으로 스스로 찾아냅니다</b> (사람이 일일이 정하지 않음).
        </li>
        <li>
          <b><MathBlock inline expr="W\vec{x}" /></b>: 입력을 가중치로 섞어 <b>새로운 값(벡터)</b>을
          만드는 것 — 바로 아래 계산입니다.
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="tip" title="'AI가 가중치를 학습한다'는 게 무슨 뜻?">
      <p>
        가중치는 처음엔 <b>아무 값(랜덤)</b>으로 시작합니다. 그다음 AI는 이 과정을 <b>수없이 반복</b>해요:
      </p>
      <ol class="mt-2 list-decimal space-y-1 pl-5 text-sm">
        <li>지금 가중치로 답을 <b>예측</b>한다 (<MathBlock inline expr="W\vec{x}" /> 계산)</li>
        <li>예측을 <b>정답과 비교</b>해 얼마나 틀렸는지(오차) 잰다</li>
        <li>오차가 줄어들도록 가중치를 <b>아주 조금 수정</b>한다</li>
        <li>1번으로 돌아가 다시 반복 (수백만 번)</li>
      </ol>
      <p class="mt-2">
        <b>요리 비유</b>: 처음엔 소금을 대충 넣고 → 맛보고(예측) → 너무 짜면 다음엔 조금 덜 넣고 →
        반복하다 보면 딱 맞는 양(좋은 가중치)을 찾는 것과 같아요. 이렇게 데이터로 가중치를 맞춰가는 게
        바로 <b>'학습(training)'</b>입니다. 우리는 그 결과인 <b>행렬 곱셈</b>을 지금 배우는 거예요.
      </p>
    </ConceptCard>

    <MatrixMultiply :a="weight" :b="inputVec" label-a="W (가중치)" label-b="x (입력)" label-c="결과" />

    <ConceptCard tone="warn" title="복습 — 이 식의 ×도 곱셈이 아니에요!">
      <p>
        1절에서 본 "크기 표기" 약속 그대로예요 —
        <MathBlock inline expr="(2\times 2)\cdot(2\times 1) = (2\times 1)" /> 는 숫자 계산이 아니라
        <b>행렬의 "크기(모양)"가 어떻게 변하는지</b>를 나타낸 식입니다.
      </p>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li><MathBlock inline expr="(2\times 2)" /> 안의 <b>×는 "행 × 열"</b>을 잇는 표기 (2×2=4 가 아니라 "2행 2열", 읽기: "투 바이 투")</li>
        <li>가운데 <MathBlock inline expr="\cdot" /> 가 진짜 <b>행렬 곱하기</b> 기호</li>
        <li><MathBlock inline expr="(2\times 1)" /> = 2행 1열 = 세로로 선 벡터(열벡터)</li>
      </ul>
      <p class="mt-2">
        즉 <b>"2행2열 행렬 × 2행1열 벡터 → 2행1열 벡터"</b>. 가운데 숫자가 맞아떨어지고
        (2×<u>2</u>, <u>2</u>×1), 결과 크기는 바깥 숫자(<b>2</b>×<b>1</b>)가 됩니다.
      </p>
    </ConceptCard>

    <ConceptCard tone="tip" title="결과는 다시 벡터">
      행렬에 벡터를 곱하면 <b>새로운 벡터</b>가 나옵니다.
      "행렬 = 벡터를 다른 벡터로 바꾸는 기계"인 셈이죠. (뒤의 '선형변환' 챕터의 핵심 아이디어)
    </ConceptCard>

    <!-- 5. 전치 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 전치 — 행과 열 맞바꾸기</h2>
    <ReviewFlag id="ch3-s5" chapter="ch3" label="5. 전치 — 행과 열 맞바꾸기" />
    <p class="leading-relaxed text-slate-700">
      행렬을 다루다 보면 <b>표를 눕히듯 행과 열을 통째로 맞바꾸고 싶을 때</b>가 자주 있어요.
      그 연산에 이름과 기호가 있습니다 (가운데 화살표 <MathBlock inline expr="\Rightarrow" /> 는
      "이렇게 바뀐다"는 뜻):
    </p>
    <MathBlock expr="A = \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix} \quad\Rightarrow\quad A^{\mathsf T} = \begin{bmatrix} 1 & 3 \\ 2 & 4 \end{bmatrix}" />
    <ConceptCard tone="note" title="새 용어 — 전치">
      <p>
        <b>전치(transpose, 트랜스포즈)</b>: 기호는 오른쪽 위의 작은 T —
        <MathBlock inline expr="A^{\mathsf T}" /> 라 쓰고 <b>"에이 전치"</b>라 읽어요.
        <b>1행이 1열이 되고, 2행이 2열이 되는</b> 뒤집기입니다 (대각선을 축으로 접는 느낌).
        계산할 것은 없고 <b>자리만 바뀌는</b> 연산이라, 지금은 "이런 표기가 있다"만 기억하면
        충분해요 — 심화 챕터(10·11)에서 다시 만납니다.
      </p>
    </ConceptCard>

    <!-- 6. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 행렬은 AI의 데이터 그 자체</h2>
    <ReviewFlag id="ch3-ai" chapter="ch3" label="🤖 행렬은 AI의 데이터 그 자체" />
    <ConceptCard tone="ai" title="AI에서 행렬이 쓰이는 곳">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>데이터셋</b> = 행렬. 한 <b>행</b>이 샘플 하나(예: 사람 1명),
          한 <b>열</b>이 특징 하나(키, 몸무게…). 1000명×5특징 = 1000×5 행렬.
        </li>
        <li>
          <b>이미지</b> = 숫자 행렬. 각 칸이 픽셀 밝기입니다. (아래 그림 참고)
        </li>
        <li>
          <b>신경망 한 층</b> = <MathBlock inline expr="W\vec{x} + \vec{b}" />.
          가중치 행렬 <MathBlock inline expr="W" /> 를 입력 벡터에 곱하는 것 — 방금 한 그 계산이에요!
          끝의 <MathBlock inline expr="+\vec{b}" /> 는 <b>편향(bias, 바이어스)</b> — 결과를 살짝
          밀어주는 <b>보정값 벡터</b>인데, 지금은 "덤으로 더해주는 값" 정도로만 알면 충분해요.
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="note" title="헷갈리지 말기 — 데이터 행렬 vs 가중치 행렬">
      <p class="mb-2">
        위 셋 다 '행렬'이지만 <b>역할이 달라요</b>. 같은 숫자 표라도 하나는 '담기는 것', 하나는 '처리하는 것'입니다.
      </p>
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <b>데이터 행렬</b> (데이터셋·이미지): 정보를 <b>담는 그릇</b>. 행=샘플, 열=특징. (요리로 치면 <b>재료</b>)
        </li>
        <li>
          <b>가중치 행렬 <MathBlock inline expr="W" /></b> (신경망 층): 데이터를 <b>변환하는 도구</b>.
          데이터가 아니라 처리기이고, 그 값을 AI가 <b>학습으로 찾아냅니다</b>. (요리로 치면 <b>레시피</b>)
        </li>
      </ul>
      <p class="mt-2 text-sm text-slate-500">
        💡 둘 다 행렬이라 <b>행렬곱</b>이 통하고, 신경망 계산은 "데이터 × 가중치"로 <b>둘이 만나는</b> 일이에요.
        (뒤의 '선형변환' 챕터에서 W가 하는 일을 더 봅니다)
      </p>
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      예: 손글씨 숫자 "1" 비슷한 5×5 흑백 이미지. 사람 눈엔 그림이지만 컴퓨터엔 <b>숫자 행렬</b>입니다.
    </p>
    <div class="my-4 flex flex-wrap items-center justify-center gap-6">
      <table class="border-collapse">
        <tbody>
          <!-- 셀 배경은 gray() 가 런타임에 만드는 회색조라 다크 모드에서도 뒤집히지 않는다(데이터 색).
               그래서 글자색도 테마를 따라가면 안 된다 — 뒤집히지 않는 고정 토큰을 쓴다. -->
          <tr v-for="(row, i) in imageMatrix" :key="i">
            <td
              v-for="(val, j) in row"
              :key="j"
              class="h-9 w-9 border border-slate-100 text-center text-xs"
              :style="{ background: gray(val), color: val > 5 ? 'var(--c-on-light)' : 'var(--c-on-dark)' }"
            >
              {{ val }}
            </td>
          </tr>
        </tbody>
      </table>
      <div class="text-sm text-slate-500">
        ← 같은 데이터를<br />숫자(행렬)로 보면 이렇습니다.<br />
        밝을수록 큰 값(9), 어두울수록 0.
      </div>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="신경망의 한 층이 하는 핵심 계산은 '가중치 행렬 × 입력 벡터' 다."
      type="truefalse"
      :answer="0"
      explanation="참. Wx + b 형태로, 행렬×벡터가 핵심입니다."
    />

    <!-- 5. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">6. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 10문제. <b>모두 맞히면 챕터 완료!</b>
    </p>
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      ✍️ 표기 안내: 문제에서 행렬을 한 줄로 <b>[[1,2],[3,4]]</b> 처럼 적어요 —
      안쪽 대괄호 하나가 <b>한 행</b>입니다 ([1,2]가 1행, [3,4]가 2행).
    </p>

    <QuizSet title="행렬과 행렬 연산 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="2행 4열 행렬의 크기는?"
        :choices="['4×2', '2×4', '2×2', '4×4']"
        :answer="1"
        explanation="행 먼저 → 2×4."
      />
      <Quiz
        difficulty="easy"
        question="행렬에서 '행(row)'은 가로 줄이다."
        type="truefalse"
        :answer="0"
        explanation="참. 행=가로, 열=세로."
      />
      <Quiz
        difficulty="easy"
        question="[[1,2],[3,4]] + [[1,1],[1,1]] 의 (1행,1열) 값은?"
        type="numeric"
        :answer="2"
        explanation="같은 자리끼리: 1+1=2."
      />
      <Quiz
        difficulty="easy"
        question="성분 a₂₁ 은 '2행 1열'의 수다."
        type="truefalse"
        :answer="0"
        explanation="참. 이중 첨자는 앞이 행, 뒤가 열."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="3 × [[1,2],[0,4]] 의 (2행,2열) 값은?"
        type="numeric"
        :answer="12"
        :hints="['스칼라배는 모든 칸에 곱.', '3×4=?']"
        explanation="3×4 = 12."
      />
      <Quiz
        difficulty="medium"
        question="(2×3) 행렬과 (3×2) 행렬은 곱할 수 있다."
        type="truefalse"
        :answer="0"
        :hints="['앞의 열 수 = 뒤의 행 수 인지 보세요.']"
        explanation="참. 앞의 열 3 = 뒤의 행 3 이라 곱 가능, 결과는 2×2."
      />
      <Quiz
        difficulty="medium"
        question="A의 1행 (2, 3) 과 B의 1열 (4, 5) 의 내적(=결과 1행1열)은?"
        type="numeric"
        :answer="23"
        :hints="['2×4 + 3×5.', '8 + 15 = ?']"
        explanation="2×4 + 3×5 = 8 + 15 = 23."
      />
      <Quiz
        difficulty="medium"
        question="(2×2) 행렬과 (2×1) 벡터를 곱하면 결과의 크기는?"
        :choices="['2×1', '1×2', '2×2', '1×1']"
        :answer="0"
        :hints="['(m×n)(n×p)=(m×p).']"
        explanation="(2×2)(2×1) = 2×1. 결과는 벡터."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="[[1,2],[3,4]] × [[5,6],[7,8]] 의 (2행,1열) 값을 단계별로 구하세요. (A의 2행 · B의 1열)"
        :steps="[
          { lhs: '3 \\times 5', answer: 15 },
          { lhs: '4 \\times 7', answer: 28 },
          { lhs: '15 + 28', answer: 43 },
        ]"
        :hints="['결과(2,1) = A의 2행 (3,4) 과 B의 1열 (5,7) 의 내적.']"
        explanation="3×5 + 4×7 = 15 + 28 = 43."
      />
      <StepQuiz
        difficulty="hard"
        question="가중치 W=[[2,0],[1,3]] 에 입력 x=(1,2) 를 곱한 결과 벡터를 성분별로 구하세요."
        :steps="[
          { lhs: '\\text{1번째 성분: } 2 \\times 1 + 0 \\times 2', answer: 2 },
          { lhs: '\\text{2번째 성분: } 1 \\times 1 + 3 \\times 2', answer: 7 },
        ]"
        :hints="['각 성분 = W의 그 행 · x.', '1행 (2,0)·(1,2), 2행 (1,3)·(1,2).']"
        explanation="1번째 2×1+0×2=2, 2번째 1×1+3×2=7 → 결과 (2, 7)."
      />
    </QuizSet>

    <NotebookCard />

    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch03_matrices.ipynb</code> 에서 <code>np.array</code> 로 행렬을 만들고
      <code>@</code>(행렬곱)·이미지=행렬을 직접 확인합니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch3')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">Phase 3 완료. 행렬을 다룰 수 있습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">다음은 행렬로 연립방정식을 푸는 법입니다.</p>
      <RouterLink
        to="/ch/ch4"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 연립방정식과 가우스 소거법 →
      </RouterLink>
    </div>
  </article>
</template>
