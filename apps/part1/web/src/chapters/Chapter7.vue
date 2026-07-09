<script setup lang="ts">
// Phase 7 · 고유값과 고유벡터
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import EigenDemo from '@/components/EigenDemo.vue'
import Quiz from '@/components/Quiz.vue'
import StepQuiz from '@/components/StepQuiz.vue'
import QuizSet from '@/components/QuizSet.vue'
import NotebookCard from '@/components/NotebookCard.vue'
import ReviewFlag from '@/components/ReviewFlag.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch7')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 7</p>
    <h1 class="mb-4 text-3xl font-bold">고유값과 고유벡터</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      변환을 하면 대부분의 벡터는 방향이 바뀝니다. 그런데 <b>방향이 바뀌지 않고 크기만 변하는</b>
      특별한 벡터가 있어요. 그게 <b>고유벡터</b>, 그 크기 변화 배율이 <b>고유값</b>입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>고유벡터</b> = 변환해도 <b>방향이 그대로</b>인 벡터임을 안다</li>
        <li><b>고유값 λ</b> = 그 방향으로 늘어나는(줄어드는) <b>배율</b>임을 안다</li>
        <li>관계식 <MathBlock inline expr="A\vec{v} = \lambda\vec{v}" /> 의 뜻을 안다</li>
        <li>AI의 <b>PCA·차원축소</b> 가 왜 고유벡터인지 감을 잡는다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 직관 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 방향이 안 바뀌는 특별한 벡터</h2>
    <ReviewFlag id="ch7-s1" chapter="ch7" label="1. 방향이 안 바뀌는 특별한 벡터" />
    <p class="leading-relaxed text-slate-700">
      어떤 변환을 걸면 화살표들이 이리저리 방향을 틀어요. 그런데 <b>몇몇 방향</b>은 변환해도
      <b>같은 직선 위에 그대로</b> 머뭅니다(길이만 늘거나 줄어듦). 그 방향이 고유벡터예요.
      아래 데모의 벡터 v (우리가 돌려볼 화살표의 이름)를 돌리며 직접 찾아보세요.
    </p>

    <EigenDemo />

    <ConceptCard tone="note" title="새 용어·기호 — 고유벡터, 고유값 λ">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>고유벡터(eigenvector)</b>: 변환 후에도 <b>방향이 바뀌지 않는</b> 벡터(같은 직선에 머묾).
          'eigen-'은 독일어로 "고유의·자기만의"라는 뜻이에요.
        </li>
        <li>
          <b>고유값(eigenvalue) <MathBlock inline expr="\lambda" /></b>: 그리스 문자 <b>람다</b>.
          고유벡터가 <b>몇 배로</b> 늘어나는지(줄어드는지)를 나타내는 숫자.
          λ=2면 2배, λ=1이면 그대로, λ가 음수면 방향이 뒤집혀요.
          (뒤집혀도 <b>같은 직선 위</b>니까 고유벡터 맞습니다 — "방향 유지"는 "같은 직선에 머묾"이라는 뜻으로 써요.)
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="고유벡터는 변환을 해도 방향이 바뀌지 않고 크기(길이)만 변한다."
      type="truefalse"
      :answer="0"
      explanation="참. 방향 유지 + 크기만 λ배 변하는 게 고유벡터입니다. (λ가 음수라 뒤집혀도 같은 직선 위에 있으면 '방향 유지'로 봐요)"
    />

    <!-- 2. 식 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 식으로 — Av = λv</h2>
    <ReviewFlag id="ch7-s2" chapter="ch7" label="2. 식으로 — Av = λv" />
    <p class="leading-relaxed text-slate-700">
      "변환 <MathBlock inline expr="A" /> 를 걸어도(<MathBlock inline expr="A\vec{v}" />) 방향은 그대로고 길이만 λ배"
      라는 말을 식으로 쓰면 이렇게 돼요:
    </p>
    <MathBlock expr="A\vec{v} = \lambda\vec{v}" />
    <ConceptCard tone="tip" title="읽는 법 — 양쪽이 같은 벡터">
      <p class="mb-2">
        <b>왼쪽</b> <MathBlock inline expr="A\vec{v}" /> = "v를 변환한 결과".
        <b>오른쪽</b> <MathBlock inline expr="\lambda\vec{v}" /> = "v를 그냥 λ배 한 것".
        둘이 같다 = <b>변환이 그 방향에선 'λ배 늘이기'와 똑같다</b>는 뜻이에요.
      </p>
      <p class="text-sm text-slate-500">
        예: <MathBlock inline expr="A = \begin{bmatrix} 2 & 0 \\ 0 & 3 \end{bmatrix}" />,
        <MathBlock inline expr="\vec{v} = (0, 1)" /> 이면
        <MathBlock inline expr="A\vec{v} = (0, 3) = 3\,(0,1)" /> → 고유값 λ=3.
      </p>
    </ConceptCard>

    <details class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <summary class="cursor-pointer font-medium text-slate-700">▸ 더 자세히 — 고유값은 어떻게 구할까? (선택)</summary>
      <div class="mt-3 space-y-2 text-sm text-slate-700">
        <p>
          <MathBlock inline expr="A\vec{v} = \lambda\vec{v}" /> 를 옮기면
          <MathBlock inline expr="(A - \lambda I)\vec{v} = \vec{0}" />
          (<MathBlock inline expr="\vec{0}" /> 은 모든 성분이 0인 <b>영벡터</b>) 이고, 이게 0이 아닌 v를 가지려면
          <b>그 행렬이 납작해야</b>(되돌릴 수 없어야) 해요 → <b>행렬식 = 0</b> (ch6!).
          <span class="text-slate-500">왜냐면 되돌릴 수 있는 변환에서는 결과가 영벡터가 되는 입력이 영벡터뿐이라,
          0이 아닌 v가 영벡터로 가려면 공간이 뭉개져 있어야(det=0) 하거든요.</span>
        </p>
        <MathBlock expr="\det(A - \lambda I) = 0" />
        <p>
          예) <MathBlock inline expr="A = \begin{bmatrix} 2 & 1 \\ 1 & 2 \end{bmatrix}" /> 이면
          <MathBlock inline expr="\det(A - \lambda I) = (2-\lambda)(2-\lambda) - 1 \times 1" /> 이라
          <MathBlock inline expr="(2-\lambda)^2 - 1 = 0" />. 차근차근 풀면 —
          <MathBlock inline expr="(2-\lambda)^2 = 1" /> → 제곱해서 1이 되는 수는 1과 −1이므로
          <MathBlock inline expr="2-\lambda = 1" /> 또는 <MathBlock inline expr="2-\lambda = -1" />
          → <MathBlock inline expr="\lambda = 1,\ 3" />.
        </p>
      </div>
    </details>

    <p class="mt-4 leading-relaxed text-slate-700">
      위 계산법은 몰라도 됩니다. 다만 <b>모양이 좋은 행렬은 계산 없이 고유값을 그냥 읽을 수
      있다</b>는 것 하나는 기억해 두세요 — 문제에도 자주 나옵니다:
    </p>
    <ConceptCard tone="note" title="꼭 기억 — 대각·삼각 행렬은 대각 성분이 곧 고유값">
      <p class="mb-2">
        <b>대각행렬</b>(ch6에서 본, 대각선 밖이 전부 0)과 <b>삼각행렬</b>(대각선 <b>아래쪽 또는
        위쪽</b>이 전부 0 — 숫자가 삼각형 모양으로 남음)은 <b>대각선의 숫자가 그대로 고유값</b>이에요.
      </p>
      <MathBlock expr="\begin{bmatrix} 5 & 0 \\ 0 & 9 \end{bmatrix} \Rightarrow \lambda = 5,\ 9 \qquad \begin{bmatrix} 4 & 2 \\ 0 & 7 \end{bmatrix} \Rightarrow \lambda = 4,\ 7" />
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="대각행렬 [[5,0],[0,9]] 의 고유값은 대각 성분인 5와 9이다."
      type="truefalse"
      :answer="0"
      explanation="참. 대각·삼각 행렬은 대각 성분이 그대로 고유값입니다."
    />

    <!-- 3. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 고유벡터가 AI에서 중요한 이유</h2>
    <ReviewFlag id="ch7-ai" chapter="ch7" label="🤖 고유벡터가 AI에서 중요한 이유" />
    <ConceptCard tone="goal" title="AI에서 쓰이는 곳">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>PCA(주성분 분석)·차원축소</b>: 데이터가 <b>가장 넓게 퍼진 방향</b>을 찾는 게 핵심인데,
          그 방향이 바로 <b>공분산행렬의 고유벡터</b>예요. 고유값이 클수록 "그 방향에 정보가 많다"는 뜻.
          <span class="text-slate-500">(공분산행렬 = 데이터가 어느 방향으로 얼마나 퍼졌는지를 담은 행렬 —
          다음 챕터에서 직접 만들어 봅니다. 지금은 "그런 행렬이 있다"만 알아두면 충분해요)</span>
        </li>
        <li>
          <b>중요도 순위(PageRank)</b>: 구글이 웹페이지 중요도를 매긴 원리도 거대한 행렬의 고유벡터예요.
        </li>
        <li>
          <b>안정성·반복</b>: 같은 변환을 여러 번 반복하면 결과가 <b>가장 큰 고유값의 고유벡터 방향</b>으로
          쏠립니다 — 추천·검색의 반복 계산에서 자주 나타나요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="PCA에서 '데이터가 가장 넓게 퍼진 방향'은 공분산행렬의 고유벡터로 찾는다."
      type="truefalse"
      :answer="0"
      explanation="참. 고유값이 큰 고유벡터일수록 데이터가 많이 퍼진(정보가 많은) 방향입니다."
    />

    <!-- 4. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="고유값·고유벡터 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="고유벡터는 변환 후에도 방향이 그대로다 (크기만 변함)."
        type="truefalse"
        :answer="0"
        :hints="['\'변환에도 안 꺾이는 축\' — 이 챕터의 부제 그 자체예요.']"
        explanation="참. 방향 유지가 고유벡터의 정의예요."
      />
      <Quiz
        difficulty="easy"
        question="고유값 λ = 2 라는 것은 그 방향으로 무슨 일이 일어난다는 뜻일까요?"
        :choices="['그 방향으로 2배 늘어난다', '90도 회전한다', '넓이가 2가 된다']"
        :answer="0"
        :hints="['λ 는 그 방향의 \'배율\'이었어요.']"
        explanation="λ는 그 고유벡터 방향의 '배율'이라, 2면 2배로 늘어납니다."
      />
      <Quiz
        difficulty="easy"
        question="Av = λv 에서 λ(고유값)는 숫자(스칼라)다."
        type="truefalse"
        :answer="0"
        :hints="['λv 는 벡터 v 를 λ배 \'늘리기\' — 스칼라배(ch2)였죠.']"
        explanation="참. λ는 배율을 나타내는 하나의 숫자입니다."
      />
      <Quiz
        difficulty="easy"
        question="대각행렬 [[5,0],[0,9]] 의 (작은) 고유값은?"
        type="numeric"
        :answer="5"
        :hints="['대각행렬은 대각 성분이 곧 고유값.']"
        explanation="고유값은 5와 9. 작은 값은 5."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="v=(1,1) 이 A=[[2,1],[1,2]] 의 고유벡터인지 Av 를 계산해 확인하세요."
        :steps="[
          { lhs: '2 \\times 1 + 1 \\times 1', answer: 3 },
          { lhs: '1 \\times 1 + 2 \\times 1', answer: 3 },
        ]"
        :hints="['Av 의 두 성분을 각각 구하세요.']"
        explanation="Av = (3, 3) = 3·(1,1). 방향 그대로 → 고유벡터, λ=3."
      />
      <Quiz
        difficulty="medium"
        question="A=[[2,0],[0,3]], v=(0,1) 일 때 Av=(0,3)=λ·v 의 λ는?"
        type="numeric"
        :answer="3"
        :hints="['(0,3) = ? × (0,1).']"
        explanation="(0,3) = 3·(0,1) → λ=3."
      />
      <Quiz
        difficulty="medium"
        question="고유벡터를 그 행렬로 변환하면?"
        :choices="['같은 직선 위에 머문다 (방향 유지)', '항상 수직으로 꺾인다', '원점에서 멀어져 사라진다']"
        :answer="0"
        :hints="['고유벡터의 정의를 떠올려 보세요 — 변환해도 방향이?']"
        explanation="고유벡터는 변환 후에도 같은 직선 위(방향 유지)에 있습니다."
      />
      <Quiz
        difficulty="medium"
        question="[[3,0],[0,3]] = 3I 는 모든 방향이 고유벡터다 (모든 벡터가 3배)."
        type="truefalse"
        :answer="0"
        :hints="['I(항등행렬)는 아무것도 안 바꿔요. 3I 는 모든 벡터를 어떻게 만들까요?']"
        explanation="참. 3I 는 모든 벡터를 3배로 늘리므로 모든 방향이 고유벡터(λ=3)."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="v=(1,−1) 이 A=[[2,1],[1,2]] 의 고유벡터인지 Av 를 계산하세요."
        :steps="[
          { lhs: '2 \\times 1 + 1 \\times (-1)', answer: 1 },
          { lhs: '1 \\times 1 + 2 \\times (-1)', answer: -1 },
        ]"
        :hints="['Av = (?, ?) 가 (1,−1) 의 몇 배인지 보세요.']"
        explanation="Av = (1, −1) = 1·(1,−1) → 고유벡터, λ=1."
      />
      <StepQuiz
        difficulty="hard"
        question="삼각행렬 [[4,2],[0,7]] 의 고유값을 쓰세요. (대각 성분)"
        :steps="[
          { lhs: '\\text{작은 고유값}', answer: 4 },
          { lhs: '\\text{큰 고유값}', answer: 7 },
        ]"
        :hints="['삼각·대각 행렬은 대각 성분이 그대로 고유값.']"
        explanation="위·아래 삼각행렬은 대각 성분이 고유값 → 4와 7."
      />
    </QuizSet>

    <NotebookCard />

    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch07_eigen.ipynb</code> 에서 <code>np.linalg.eig</code> 로 고유값·고유벡터를 구하고,
      <MathBlock inline expr="A\vec{v} = \lambda\vec{v}" /> 가 정말 성립하는지 확인합니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch7')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 7 완료. 변환에도 안 꺾이는 축을 찾을 수 있습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">다음은 이 고유벡터로 데이터를 요약하는 PCA — 마지막 응용 챕터입니다.</p>
      <RouterLink
        to="/ch/ch8"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 응용 (PCA) →
      </RouterLink>
    </div>
  </article>
</template>
