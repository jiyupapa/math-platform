<script setup lang="ts">
// Phase 6 · 행렬식과 역행렬
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import DeterminantDemo from '@/components/DeterminantDemo.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch6')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 6</p>
    <h1 class="mb-4 text-3xl font-bold">행렬식과 역행렬</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      앞 챕터에서 행렬은 <b>공간을 바꾸는 변환</b>이었죠. 이번엔 그 변환이 <b>넓이를 얼마나 바꾸는지(행렬식)</b>,
      그리고 <b>되돌릴 수 있는지(역행렬)</b>를 배웁니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>행렬식(det)</b> = 변환의 <b>넓이 배율</b>임을 알고, 2×2 계산법을 익힌다</li>
        <li><b>det = 0</b> 이면 공간이 납작해져 <b>되돌릴 수 없음</b>을 안다</li>
        <li><b>역행렬</b> = 변환을 <b>되돌리는</b> 행렬임을 안다</li>
        <li>역행렬로 <b>연립방정식 <MathBlock inline expr="A\vec{x}=\vec{b}" /></b> 을 푼다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 행렬식 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 행렬식 = 넓이 배율</h2>
    <ReviewFlag id="ch6-s1" chapter="ch6" label="1. 행렬식 = 넓이 배율" />
    <p class="leading-relaxed text-slate-700">
      변환이 <b>넓이를 몇 배로 바꾸는지</b> 나타내는 숫자가 <b>행렬식</b>이에요. 단위 정사각형(넓이 1)이
      변환 후 만드는 평행사변형의 넓이가 곧 <b>행렬식의 크기</b>(부호를 뗀 값)입니다.
    </p>

    <ConceptCard tone="note" title="새 용어·기호 — 행렬식 (det)">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>행렬식(determinant)</b>: 변환의 <b>넓이 배율</b>. 기호로 <MathBlock inline expr="\det(A)" /> 또는
          <MathBlock inline expr="|A|" /> 라 쓰고 "행렬식 에이" 또는 "데트 에이"라고 읽어요.
        </li>
        <li>
          <b>2×2 계산법</b>:
          <MathBlock inline expr="\det\begin{bmatrix} a & b \\ c & d \end{bmatrix} = ad - bc" />
          (<b>왼쪽 위×오른쪽 아래</b> 빼기 <b>오른쪽 위×왼쪽 아래</b>)
        </li>
      </ul>
    </ConceptCard>

    <DeterminantDemo />

    <ConceptCard tone="tip" title="계산 예시">
      <MathBlock expr="\det\begin{bmatrix} 2 & 0 \\ 0 & 3 \end{bmatrix} = 2\times3 - 0\times0 = 6" />
      <p class="text-sm text-slate-600">가로 2배, 세로 3배 → 넓이 6배. 직관과 딱 맞죠.</p>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="행렬 [[2,0],[0,5]] 의 행렬식은? (넓이 배율)"
      type="numeric"
      :answer="10"
      :hints="['ad − bc = 2×5 − 0×0.']"
      explanation="2×5 − 0×0 = 10. 넓이가 10배가 됩니다."
    />

    <!-- 2. det의 부호와 0 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 행렬식의 부호와 0</h2>
    <ReviewFlag id="ch6-s2" chapter="ch6" label="2. 행렬식의 부호와 0" />
    <ConceptCard tone="note" title="det 값이 말해주는 것">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>|det| = 넓이 배율</b> (2면 2배, 0.5면 절반). 여기서 막대 | | 는 <b>절댓값</b>(부호 떼기) —
          행렬식 표기 <MathBlock inline expr="|A|" /> 와 모양은 같지만 다른 뜻이에요.
          행렬식 <b>값 자체는 음수일 수 있고</b>, 넓이 배율은 부호를 뗀 크기만 봅니다.
        </li>
        <li><b>부호</b>: 양수면 그대로, <b>음수면 뒤집힘</b>(거울 반사처럼 방향이 뒤집힘).</li>
        <li>
          <b>det = 0</b>: 평행사변형이 <b>납작하게 찌부러져</b> 직선·점이 됨 → <b>넓이 0</b>.
          한 차원이 뭉개져서 <b>되돌릴 수 없어요</b>(역행렬 없음).
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="행렬식이 0 이면 그 변환은?"
      :choices="['되돌릴 수 없다 (역행렬 없음)', '넓이가 2배가 된다', '항상 회전이다']"
      :answer="0"
      :hints="['det=0 = 공간이 납작해짐 = 정보가 뭉개짐.']"
      explanation="det=0 이면 공간이 한 차원 뭉개져 되돌릴 수 없습니다 → 역행렬 없음."
    />

    <!-- 3. 역행렬 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 역행렬 = 되돌리는 변환</h2>
    <ReviewFlag id="ch6-s3" chapter="ch6" label="3. 역행렬 = 되돌리는 변환" />
    <p class="leading-relaxed text-slate-700">
      어떤 변환 <MathBlock inline expr="A" /> 로 공간을 바꿨다면, 그걸 <b>원래대로 되돌리는</b> 변환이
      <b>역행렬 <MathBlock inline expr="A^{-1}" /></b> 이에요. (숫자의 "나누기"에 해당)
    </p>

    <ConceptCard tone="note" title="새 용어·기호 — 항등행렬 I, 역행렬 A⁻¹">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>항등행렬 <MathBlock inline expr="I" /></b> (identity): 아무것도 안 바꾸는 행렬.
          <MathBlock inline expr="\begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix}" /> — 숫자의 <b>1</b> 같은 존재.
        </li>
        <li>
          <b>역행렬 <MathBlock inline expr="A^{-1}" /></b> ("에이 인버스"): <MathBlock inline expr="A" /> 를
          <b>되돌리는</b> 행렬. 곱하면 항등행렬: <MathBlock inline expr="A^{-1}A = I" />.
          (숫자로 치면 <MathBlock inline expr="\tfrac{1}{3}\times 3 = 1" /> 과 같은 원리)
        </li>
        <li>
          <b>2×2 역행렬 공식</b>:
          <MathBlock inline expr="A^{-1} = \dfrac{1}{ad-bc}\begin{bmatrix} d & -b \\ -c & a \end{bmatrix}" />.
          앞의 <MathBlock inline expr="\tfrac{1}{ad-bc}" /> 의 분모가 <b>행렬식</b>이라, <b>det=0이면 나눌 수 없어 역행렬도 없어요.</b>
          <span class="text-slate-500">(대괄호 안 숫자 배치는 외울 필요 없어요 — 여기서 기억할 건
          <b>분모가 행렬식</b>이라는 사실 하나!)</span>
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="tip" title="계산 예시 — 대각행렬은 쉬워요">
      <p class="mb-1">
        대각선만 있는 행렬은 역행렬도 <b>대각 성분의 역수</b>:
      </p>
      <MathBlock expr="\begin{bmatrix} 2 & 0 \\ 0 & 5 \end{bmatrix}^{-1} = \begin{bmatrix} \tfrac{1}{2} & 0 \\ 0 & \tfrac{1}{5} \end{bmatrix} = \begin{bmatrix} 0.5 & 0 \\ 0 & 0.2 \end{bmatrix}" />
      <p class="text-sm text-slate-600">2배로 늘린 걸 되돌리려면 ½배(절반)로 줄이면 되니까요.</p>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="역행렬 A⁻¹ 가 존재하려면?"
      :choices="['행렬식이 0이 아니어야 한다', '행렬식이 0이어야 한다', '행렬이 클수록 좋다']"
      :answer="0"
      :hints="['역행렬 공식의 분모가 행렬식이에요.']"
      explanation="det ≠ 0 이어야 역행렬이 존재합니다 (det=0이면 나눌 수 없음)."
    />

    <!-- 4. 연립방정식 풀기 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 역행렬로 연립방정식 풀기</h2>
    <ReviewFlag id="ch6-s4" chapter="ch6" label="4. 역행렬로 연립방정식 풀기" />
    <p class="leading-relaxed text-slate-700">
      ch4의 <MathBlock inline expr="A\vec{x} = \vec{b}" /> 기억나죠? 양변 앞에 <MathBlock inline expr="A^{-1}" /> 을
      곱하면 <MathBlock inline expr="A" /> 가 사라지고(<MathBlock inline expr="A^{-1}A = I" />) <b>해가 한 방에</b> 나와요.
    </p>
    <MathBlock expr="A\vec{x} = \vec{b} \;\Rightarrow\; A^{-1}A\,\vec{x} = A^{-1}\vec{b} \;\Rightarrow\; \vec{x} = A^{-1}\vec{b}" />
    <p class="leading-relaxed text-slate-700">
      숫자의 <MathBlock inline expr="3x = 6 \Rightarrow x = \tfrac{1}{3}\times 6 = 2" /> 와 똑같은 흐름이에요 —
      "나누기" 대신 "역행렬 곱하기"를 하는 거죠.
    </p>

    <!-- 5. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 AI에서 행렬식·역행렬</h2>
    <ReviewFlag id="ch6-ai" chapter="ch6" label="🤖 AI에서 행렬식·역행렬" />
    <ConceptCard tone="ai" title="AI에서 쓰이는 곳">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>선형회귀</b>: 데이터에 가장 잘 맞는 모델 파라미터를 <MathBlock inline expr="\vec{x} = A^{-1}\vec{b}" /> 꼴로
          구합니다 — 역행렬이 직접 등장.
          <span class="text-slate-500">(이 풀이 식을 '정규방정식'이라 불러요 — 10장에서 제대로 다룹니다)</span>
        </li>
        <li>
          <b>가역성 판단</b>: 행렬식이 0이거나 0에 가까우면 "<b>정보가 겹쳐 되돌릴 수 없다</b>"는 신호 →
          데이터 특징이 중복됐다는 뜻(다중공선성).
        </li>
        <li>
          <b>현실 팁</b>: 실제 AI는 행렬이 거대해 역행렬을 직접 구하면 느리고 불안정해서,
          ch4의 <b>가우스 소거(와 개량판)</b>로 푸는 경우가 많아요. 역행렬은 "개념"으로 중요!
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="Ax=b 는 양변에 A의 역행렬을 곱해 x = A⁻¹b 로 풀 수 있다."
      type="truefalse"
      :answer="0"
      explanation="참. A⁻¹A = I 라서 A가 사라지고 x만 남습니다."
    />

    <!-- 6. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="행렬식·역행렬 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="행렬식은 변환이 넓이를 몇 배로 바꾸는지 나타낸다."
        type="truefalse"
        :answer="0"
        explanation="참. |det| 가 넓이 배율입니다."
      />
      <Quiz
        difficulty="easy"
        question="행렬 [[3,0],[0,4]] 의 행렬식은?"
        type="numeric"
        :answer="12"
        :hints="['ad − bc = 3×4 − 0×0.']"
        explanation="3×4 − 0×0 = 12."
      />
      <Quiz
        difficulty="easy"
        question="항등행렬 I 를 다른 행렬에 곱하면 그 행렬은 변하지 않는다."
        type="truefalse"
        :answer="0"
        explanation="참. I 는 숫자의 1 같은 존재예요."
      />
      <Quiz
        difficulty="easy"
        question="det = 0 인 변환은 되돌릴 수 있다."
        type="truefalse"
        :answer="1"
        :hints="['det=0 = 납작해짐 = 정보 손실.']"
        explanation="거짓. det=0 이면 공간이 뭉개져 되돌릴 수 없어요(역행렬 없음)."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="행렬 [[3,2],[1,4]] 의 행렬식을 단계별로 구하세요. (ad − bc)"
        :steps="[
          { lhs: '3 \\times 4', answer: 12 },
          { lhs: '2 \\times 1', answer: 2 },
          { lhs: '12 - 2', answer: 10 },
        ]"
        :hints="['ad = 3×4, bc = 2×1, 그다음 빼기.']"
        explanation="3×4 − 2×1 = 12 − 2 = 10."
      />
      <Quiz
        difficulty="medium"
        question="행렬 [[1,2],[3,4]] 의 행렬식은?"
        type="numeric"
        :answer="-2"
        :hints="['ad − bc = 1×4 − 2×3.', '4 − 6 = ?']"
        explanation="1×4 − 2×3 = 4 − 6 = −2."
      />
      <Quiz
        difficulty="medium"
        question="역행렬이 존재하기 위한 조건은?"
        :choices="['행렬식 ≠ 0', '행렬식 = 0', '성분이 모두 양수']"
        :answer="0"
        explanation="역행렬 공식의 분모가 행렬식이라, det ≠ 0 이어야 합니다."
      />
      <Quiz
        difficulty="medium"
        question="[[2,4],[1,2]] 는 역행렬이 있다."
        type="truefalse"
        :answer="1"
        :hints="['먼저 행렬식을 구해보세요: 2×2 − 4×1.']"
        explanation="거짓. det = 2×2 − 4×1 = 0 이라 역행렬이 없습니다."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="대각행렬 [[2,0],[0,5]] 의 역행렬(대각 성분)을 구하세요. (대각 성분의 역수)"
        :steps="[
          { lhs: '1 \\div 2', answer: 0.5 },
          { lhs: '1 \\div 5', answer: 0.2 },
        ]"
        :hints="['대각행렬의 역행렬 = 각 대각 성분의 역수.']"
        explanation="역행렬은 [[1/2, 0],[0, 1/5]] = [[0.5, 0],[0, 0.2]]."
      />
      <StepQuiz
        difficulty="hard"
        question="A=[[2,0],[0,5]], b=(6,10) 일 때 연립방정식 Ax=b 의 해를 x = A⁻¹b 로 구하세요. (바로 위에서 구한 역행렬 [[0.5,0],[0,0.2]] 를 b 에 곱하면 됩니다)"
        :steps="[
          { lhs: '0.5 \\times 6', answer: 3 },
          { lhs: '0.2 \\times 10', answer: 2 },
        ]"
        :hints="[
          '역행렬 [[0.5,0],[0,0.2]] 와 벡터 (6,10) 의 행렬×벡터예요. 첫째 행: 0.5×6 + 0×10.',
          '둘째 행: 0×6 + 0.2×10.',
        ]"
        explanation="x = A⁻¹b = (3, 2). 검산: A를 적용하면 (2×3, 5×2) = (6, 10) = b ✓ — 역행렬로 연립방정식을 푼 거예요!"
      />
    </QuizSet>

    <NotebookCard />

    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch06_determinant_inverse.ipynb</code> 에서 <code>np.linalg.det</code> 로 행렬식을,
      <code>np.linalg.inv</code> 로 역행렬을 구하고 <MathBlock inline expr="A^{-1}A = I" /> 를 확인합니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch6')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 6 완료. 넓이 배율과 되돌리기를 익혔습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">다음은 변환에도 방향이 안 바뀌는 특별한 축 — 고유값과 고유벡터입니다.</p>
      <RouterLink
        to="/ch/ch7"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 고유값과 고유벡터 →
      </RouterLink>
    </div>
  </article>
</template>
