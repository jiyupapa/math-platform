<script setup lang="ts">
// Phase 10 · 미분의 응용 — 역전파 직관 (마지막 챕터)
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import Backprop from '@/components/Backprop.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch10')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 10 · 마지막</p>
    <h1 class="mb-4 text-3xl font-bold">미분의 응용 — 역전파 직관 🎓</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      드디어 마지막입니다. <b>역전파(backpropagation)</b>는 지금까지 배운 미분을 <b>전부</b> 엮어,
      신경망의 모든 가중치 기울기를 <b>한 번에 효율적으로</b> 구하는 방법이에요. 연쇄법칙·합·곱 규칙·
      편미분·그래디언트가 여기서 하나로 만납니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>계산그래프</b>로 복잡한 식을 작은 노드로 쪼갠다</li>
        <li><b>순전파</b>(값 계산) → <b>역전파</b>(기울기 전파)의 흐름을 이해한다</li>
        <li>역전파가 <b>연쇄법칙의 반복</b>이며, 한 번에 모든 기울기를 준다는 걸 안다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 계산그래프 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 계산그래프 — 큰 계산을 작은 노드로</h2>
    <ReviewFlag id="ch10-s1" chapter="ch10" label="1. 계산그래프" />
    <p class="leading-relaxed text-slate-700">
      복잡한 식도 <b>덧셈·곱셈·제곱</b> 같은 <b>작은 연산 노드</b>들의 연결로 쪼갤 수 있어요.
      예를 들어 <MathBlock inline expr="L = (x\,y + z)^2" /> 는 이렇게 세 노드로:
    </p>
    <MathBlock expr="p = x\cdot y,\qquad q = p + z,\qquad L = q^2" />

    <ConceptCard tone="note" title="새 용어 — 계산그래프 / 국소 미분">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>계산그래프(computational graph)</b>: 계산을 노드(연산)와 화살표(값의 흐름)로 나타낸 그림.</li>
        <li><b>국소 미분(local derivative)</b>: 각 노드가 자기 입력에 대해 갖는 간단한 미분. (제곱→2q, 덧셈→1, 곱셈→상대편 값)</li>
        <li>신경망도 결국 이런 노드가 아주 많이 이어진 <b>거대한 계산그래프</b>예요.</li>
      </ul>
    </ConceptCard>

    <!-- 2. 순전파 & 역전파 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 순전파 → 역전파</h2>
    <ReviewFlag id="ch10-s2" chapter="ch10" label="2. 순전파 → 역전파" />
    <p class="leading-relaxed text-slate-700">
      먼저 왼쪽에서 오른쪽으로 값을 계산(<b>순전파</b>)하고, 그다음 오른쪽 출력에서 시작해
      기울기를 <b>뒤로</b> 흘려보냅니다(<b>역전파</b>). 아래에서 입력을 정하고 "역전파 한 단계"를
      눌러가며 기울기가 뒤로 흐르는 걸 보세요.
    </p>

    <Backprop />

    <ConceptCard tone="note" title="새 용어 — 순전파 / 역전파 / 상류 기울기">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>순전파(forward)</b>: 입력 → 출력으로 값을 계산.</li>
        <li><b>역전파(backward)</b>: 출력의 기울기에서 시작해 입력 쪽으로 전파. 맨 처음 값은 <MathBlock inline expr="\partial L/\partial L = 1" /> — 출력 <MathBlock inline expr="L" /> 을 <b>자기 자신으로 미분</b>하면 1이라 여기서 출발해요.</li>
        <li>
          <b>상류 기울기</b> × <b>국소 미분</b> = 그 노드를 지난 기울기. 이걸 이어붙이는 게 곧
          <b>연쇄법칙</b>(Phase 6)이에요. 덧셈 노드는 <b>복사</b>, 곱셈 노드는 <b>상대편 값 곱하기</b>.
        </li>
      </ul>
    </ConceptCard>

    <StepQuiz
      difficulty="medium"
      question="계산그래프 p=x·y, q=p+z, L=q² 에서 x=2, y=3, z=1 일 때 순전파와 역전파를 단계별로 구하세요."
      :steps="[
        { lhs: `p = x\\cdot y = 2\\times 3`, answer: 6 },
        { lhs: `q = p + z = 6 + 1`, answer: 7 },
        { lhs: `L = q^2 = 7^2`, answer: 49 },
        { lhs: `\\partial L/\\partial q = 2q = 2\\times 7`, answer: 14 },
        { lhs: `\\partial L/\\partial x = (\\partial L/\\partial q)\\cdot y = 14\\times 3`, answer: 42 },
      ]"
      :hints="['순전파: p→q→L 순서로 값 계산.', '역전파: ∂L/∂q=2q, 곱셈 노드에서 ∂L/∂x = 상류 × y.']"
      explanation="순전파 6→7→49, 역전파 ∂L/∂q=14 → ∂L/∂x=14×3=42. 덧셈은 복사, 곱셈은 상대편(y) 곱."
    />

    <!-- 3. 왜 효율적 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 왜 '한 번에'가 중요한가</h2>
    <ReviewFlag id="ch10-s3" chapter="ch10" label="3. 왜 한 번에가 중요한가" />
    <p class="leading-relaxed text-slate-700">
      가중치가 수백만 개라면, 각 편미분을 따로따로 구하는 건 엄청나게 비쌉니다. 역전파의 마법은
      <b>딱 한 번의 뒤로 훑기</b>로 <b>모든 가중치의 기울기</b>를 동시에 얻는다는 거예요.
    </p>

    <ConceptCard tone="goal" title="역전파 = 그래디언트를 싸게 구하는 법">
      <ul class="list-disc space-y-2 pl-5">
        <li>순전파 1번 + 역전파 1번 = <b>전체 그래디언트 <MathBlock inline expr="\nabla L" /></b> 완성.</li>
        <li>이 <MathBlock inline expr="\nabla L" /> 을 Phase 9 의 경사하강 <MathBlock inline expr="w \leftarrow w - \eta\nabla L" /> 에 넣어 가중치를 갱신.</li>
        <li>딥러닝 학습 = (순전파 → 역전파 → 갱신) 을 수없이 반복. 그게 전부예요!</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="역전파는 '한 번의 뒤로 훑기'로 모든 입력(가중치)의 기울기를 한꺼번에 구한다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 그래서 수백만 가중치도 효율적으로 학습할 수 있어요."
    />

    <!-- 4. 전체 그림 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 지금까지 배운 미분이 전부 여기 모인다</h2>
    <ReviewFlag id="ch10-ai" chapter="ch10" label="🤖 전체 그림 총정리" />
    <p class="leading-relaxed text-slate-700">
      축하합니다 — 이제 "AI가 어떻게 배우는가"의 수학을 <b>처음부터 끝까지</b> 꿰뚫었습니다.
      우리가 걸어온 길을 되짚어 볼게요:
    </p>

    <ConceptCard tone="tip" title="한 장으로 보는 여정">
      <ol class="list-decimal space-y-1 pl-5 text-sm">
        <li><b>극한</b>으로 순간변화율을 정의하고(2~3장),</li>
        <li><b>공식·연쇄·곱몫</b>으로 어떤 함수든 미분하고(4~6장),</li>
        <li><b>지수·시그모이드</b> 같은 활성화 함수를 미분하고(7장),</li>
        <li><b>편미분·그래디언트</b>로 여러 가중치의 기울기를 구하고(8~9장),</li>
        <li><b>역전파</b>로 그 기울기를 효율적으로 계산해 <b>경사하강</b>으로 학습한다(9~10장).</li>
      </ol>
      <p class="mt-2">이 모든 게 결국 <b>"기울기를 구해 조금씩 내려간다"</b>는 하나의 이야기였어요.</p>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="역전파로 구한 그래디언트 ∇L 은 다음 단계에서 무엇에 쓰이나?"
      :choices="[
        '경사하강법 w ← w − η∇L 으로 가중치를 갱신',
        '손실을 더 크게 만드는 데',
        '입력 데이터를 지우는 데',
        '아무 데도 쓰지 않는다',
      ]"
      :answer="0"
      explanation="역전파로 ∇L 을 구하고, 경사하강으로 가중치를 갱신 — 이 반복이 학습입니다."
    />

    <!-- 5. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료 — 그리고 완주!</b>
    </p>

    <QuizSet title="역전파 직관 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="계산그래프는 복잡한 계산을 덧셈·곱셈 같은 작은 노드로 쪼갠 것이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 각 노드는 간단한 국소 미분을 가져요."
      />
      <Quiz
        difficulty="easy"
        question="역전파는 어느 방향으로 진행되나?"
        :choices="['출력에서 입력 쪽으로(뒤로)', '입력에서 출력 쪽으로(앞으로)', '위에서 아래로', '무작위로']"
        :answer="0"
        :hints="['출력의 기울기 1 에서 시작합니다.']"
        explanation="역전파는 출력 → 입력 방향(뒤로)으로 기울기를 전파합니다."
      />
      <Quiz
        difficulty="easy"
        question="역전파는 연쇄법칙을 계산그래프에 반복 적용하는 것이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 상류 기울기 × 국소 미분을 이어붙이는 것이 연쇄법칙이에요."
      />
      <Quiz
        difficulty="easy"
        question="덧셈 노드 q = p + z 에서 ∂q/∂p 의 값은?"
        type="numeric"
        :answer="1"
        :hints="['(p+z) 를 p 로 미분하면?']"
        explanation="∂q/∂p = 1. 그래서 덧셈 노드는 기울기를 그대로 복사합니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="p=x·y, q=p+z, L=q² (x=2, y=3, z=1). 순전파와 ∂L/∂q 를 구하세요."
        :steps="[
          { lhs: `p = 2\\times 3`, answer: 6 },
          { lhs: `q = 6 + 1`, answer: 7 },
          { lhs: `L = 7^2`, answer: 49 },
          { lhs: `\\partial L/\\partial q = 2\\times 7`, answer: 14 },
        ]"
        :hints="['순전파 p→q→L, 그다음 ∂L/∂q = 2q.']"
        explanation="6 → 7 → 49, ∂L/∂q = 14."
      />
      <Quiz
        difficulty="medium"
        question="곱셈 노드 p = x·y 를 역전파할 때, x 로 가는 기울기는 (상류 기울기) × (무엇)?"
        :choices="['상대편 값 y', '자기 값 x', '1', '0']"
        :answer="0"
        :hints="['곱의 법칙: 상대편 값이 곱해집니다.']"
        explanation="∂L/∂x = 상류 × y. 곱셈 노드는 상대편 값을 곱해요."
      />
      <Quiz
        difficulty="medium"
        question="L = q² 에서 상류 기울기가 1 일 때, q=5 이면 ∂L/∂q 는?"
        type="numeric"
        :answer="10"
        :hints="['∂L/∂q = 2q, q=5.']"
        explanation="2×5 = 10."
      />
      <Quiz
        difficulty="medium"
        question="역전파 한 번이면 모든 가중치의 편미분(그래디언트)을 한꺼번에 얻을 수 있다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 이 효율성 덕분에 대규모 신경망 학습이 가능해요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="p=x·y, q=p+z, L=q² (x=1, y=4, z=2). ∂L/∂x 의 값은?"
        type="numeric"
        :answer="48"
        :hints="['q = 1·4+2 = 6. ∂L/∂q = 2q = 12.', '∂L/∂x = 12 × y = 12 × 4.']"
        explanation="q=6, ∂L/∂q=12, ∂L/∂x = 12×4 = 48."
      />
      <Quiz
        difficulty="hard"
        question="역전파로 구한 ∇L 을 이용하는 다음 단계는?"
        :choices="[
          '경사하강 w ← w − η∇L 로 가중치 갱신',
          '순전파를 건너뛴다',
          '학습률을 0 으로 만든다',
          '그래프를 삭제한다',
        ]"
        :answer="0"
        explanation="∇L 로 경사하강하여 가중치를 갱신 — 이 반복이 딥러닝 학습입니다."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch10_backprop.ipynb</code> 에서 계산그래프의 순전파·역전파를 직접 코딩하고,
      SymPy 로 구한 정답 미분과 같은지 검산합니다. (미니 autograd!)
    </ConceptCard>

    <div
      v-if="progress.isDone('ch10')"
      class="mt-8 rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-center"
    >
      <div class="mb-1 text-3xl">🎓🎉</div>
      <p class="text-lg font-bold text-emerald-800">전 과정 완주! 축하합니다!</p>
      <p class="mt-2 text-sm leading-relaxed text-emerald-700">
        접선의 기울기에서 시작해 역전파까지 — 이제 <b>AI가 학습하는 원리</b>를 미분으로 이해하는
        기반을 완성했습니다. 수포자는 이제 안녕! 🙌
      </p>
      <RouterLink
        to="/"
        class="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        목차로 돌아가기 →
      </RouterLink>
    </div>
  </article>
</template>
