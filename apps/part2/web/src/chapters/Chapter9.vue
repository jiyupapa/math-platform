<script setup lang="ts">
// Phase 9 · 그래디언트와 경사하강법
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import GradientDescent from '@/components/GradientDescent.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch9')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 9</p>
    <h1 class="mb-4 text-3xl font-bold">그래디언트와 경사하강법 ⛷️</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      드디어 <b>AI가 학습하는 원리</b> 그 자체입니다. 편미분들을 모은 <b>그래디언트</b>가 "가장 가파른
      방향"을 알려주면, 그 <b>반대 방향</b>으로 조금씩 내려가며 손실을 줄입니다. 이 반복이
      <b>경사하강법</b> — 모든 딥러닝 학습의 심장이에요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>그래디언트</b> <MathBlock inline expr="\nabla f" /> = 편미분을 모은 벡터, 가장 가파른 <b>오르막</b> 방향</li>
        <li><b>경사하강법</b> <MathBlock inline expr="w \leftarrow w - \eta\,\nabla L" /> 로 손실을 줄인다</li>
        <li><b>학습률</b> <MathBlock inline expr="\eta" /> 의 크기가 수렴·진동·발산을 가른다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 그래디언트 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 그래디언트 — 가장 가파른 방향</h2>
    <ReviewFlag id="ch9-s1" chapter="ch9" label="1. 그래디언트 — 가장 가파른 방향" />
    <p class="leading-relaxed text-slate-700">
      Phase 8 의 편미분들을 <b>하나로 묶은 것</b>이 <b>그래디언트</b>입니다. 여기서 "묶는다"는 건
      숫자들을 순서대로 늘어놓은 목록, 즉 <b>벡터</b>로 만든다는 뜻이에요. <MathBlock inline expr="f(x,y)" /> 라면:
    </p>
    <MathBlock expr="\nabla f = \left(\dfrac{\partial f}{\partial x},\ \dfrac{\partial f}{\partial y}\right)" />
    <p class="leading-relaxed text-slate-700">
      각 성분이 그 방향(x 방향·y 방향)으로 얼마나 가파른지를 담고 있어서, 둘을 합친 이 벡터는 함수가
      <b>가장 빠르게 커지는(오르막) 방향</b>을 가리킵니다. 우리는 손실을 <b>줄이고</b>
      싶으니까, <b>정반대 방향</b>(가장 빠른 내리막)으로 가면 되죠.
    </p>

    <ConceptCard tone="note" title="새 기호 — ∇ (나블라)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><MathBlock inline expr="\nabla" /> 는 "나블라" 또는 "그래드"라고 읽어요. 뒤에 함수를 붙여 <MathBlock inline expr="\nabla f" /> (그래디언트).</li>
        <li>내용물은 <b>편미분들의 목록</b>: 변수마다 하나씩. 변수가 하나면 그냥 도함수 <MathBlock inline expr="f'(w)" /> 예요.</li>
        <li>방향: <b>가장 가파른 오르막</b>. 그래서 내려가려면 <MathBlock inline expr="-\nabla f" /> 방향.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="손실을 줄이려면 그래디언트가 가리키는 방향의 '반대쪽'으로 이동해야 한다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 그래디언트는 오르막 방향이라, 내려가려면 −∇ 방향으로 갑니다."
    />

    <!-- 2. 경사하강법 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 경사하강법 — 골짜기로 굴러 내려가기</h2>
    <ReviewFlag id="ch9-s2" chapter="ch9" label="2. 경사하강법" />
    <MathBlock expr="w \leftarrow w - \eta\,\nabla L" />
    <p class="leading-relaxed text-slate-700">
      여기서 <MathBlock inline expr="\leftarrow" /> 는 <b>등호(=)가 아니라</b> "왼쪽 값을 오른쪽 계산 결과로
      <b>새로 바꿔 넣는다</b>"는 뜻이에요(코딩의 대입과 같아요). 즉 "현재 위치에서 기울기의 반대 방향으로
      <MathBlock inline expr="\eta" /> 만큼 이동"을 <b>반복</b>합니다.
      아래에서 <b>공</b>을 굴려보세요. <b>학습률 <MathBlock inline expr="\eta" /></b> 를 바꾸면 어떻게 되는지 실험해 보세요.
    </p>

    <GradientDescent />

    <ConceptCard tone="note" title="새 용어 — 경사하강법 / 학습률 η">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>경사하강법(gradient descent)</b>: 기울기 반대 방향으로 조금씩 이동하며 최소값을 찾는 방법.</li>
        <li><b>학습률 <MathBlock inline expr="\eta" /></b>(에타): 한 걸음의 <b>크기</b>. 얼마나 성큼 이동할지 정합니다.</li>
        <li>갱신식 <MathBlock inline expr="w \leftarrow w - \eta\,f'(w)" /> — 기울기가 크면 많이, 작으면(바닥 근처) 조금 움직여요.</li>
      </ul>
    </ConceptCard>

    <StepQuiz
      difficulty="medium"
      question="손실 f(w)=w² (f'(w)=2w), 학습률 η=0.1, 시작 w=5. 경사하강 두 걸음을 계산하세요."
      :steps="[
        { lhs: `\\text{1걸음 기울기 } f'(5)=2\\times 5`, answer: 10 },
        { lhs: `w \\leftarrow 5 - 0.1\\times 10`, answer: 4 },
        { lhs: `\\text{2걸음 기울기 } f'(4)=2\\times 4`, answer: 8 },
        { lhs: `w \\leftarrow 4 - 0.1\\times 8`, answer: 3.2, tolerance: 0.001 },
      ]"
      :hints="['갱신식 w ← w − η·f′(w).', '기울기 = 2w. 매 걸음 다시 계산.']"
      explanation="5 → 4 → 3.2 … 최소값 0 을 향해 내려갑니다."
    />

    <!-- 3. 학습률 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 학습률이 전부를 가른다</h2>
    <ReviewFlag id="ch9-s3" chapter="ch9" label="3. 학습률이 전부를 가른다" />
    <p class="leading-relaxed text-slate-700">
      위 공 굴리기에서 봤듯, <MathBlock inline expr="\eta" /> 를 잘못 정하면 학습이 망가집니다.
    </p>

    <ConceptCard tone="warn" title="학습률의 세 얼굴">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>너무 작으면</b>: 아주 느리게 내려가 시간이 오래 걸립니다.</li>
        <li><b>적당하면</b>: 부드럽게 골짜기 바닥으로 수렴.</li>
        <li><b>너무 크면</b>: 최소값을 지나쳐 튕기며 <b>진동</b>하거나 <b>발산</b>(점점 커짐)합니다.</li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="note" title="새 용어 — 수렴·발산 / 지역 최소값">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>수렴</b>: 한 값(최소)으로 점점 다가감. <b>발산</b>: 값이 점점 커져 멀어짐.</li>
        <li>
          <b>지역 최소값(local minimum)</b>: 주변에선 가장 낮지만 <b>전체에서 가장 낮진 않은</b> 골짜기.
          경사하강은 가까운 골짜기에 멈출 수 있어, 시작 위치·학습률이 결과에 영향을 줍니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="학습률 η 가 너무 크면 어떤 일이 일어날 수 있나요?"
      :choices="[
        '항상 더 빨리, 더 정확히 수렴한다',
        '최소값을 지나쳐 진동하거나 발산할 수 있다',
        '아무 변화가 없다',
        '기울기가 0 이 된다',
      ]"
      :answer="1"
      :hints="['공이 골짜기를 지나쳐 반대편으로 튕기는 그림.']"
      explanation="η 가 너무 크면 최소값을 건너뛰어 진동/발산합니다. 적당한 크기가 중요해요."
    />

    <!-- 4. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 이것이 바로 'AI가 배우는 법'</h2>
    <ReviewFlag id="ch9-ai" chapter="ch9" label="🤖 이것이 AI가 배우는 법" />
    <p class="leading-relaxed text-slate-700">
      딥러닝 학습은 방금 배운 경사하강을 <b>수백만 개 가중치</b>에 대해 <b>수천~수백만 번</b> 반복하는
      것입니다. 단지 <MathBlock inline expr="w" /> 가 하나가 아니라 거대한 벡터일 뿐, 원리는 똑같아요.
    </p>

    <ConceptCard tone="ai" title="학습 루프 = 경사하강의 반복">
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>예측</b>하고 <b>손실 <MathBlock inline expr="L" /></b> 을 계산 (얼마나 틀렸나).</li>
        <li><b>그래디언트 <MathBlock inline expr="\nabla L" /></b> 계산 — 각 가중치의 편미분. (다음 챕터의 <b>역전파</b>가 이걸 효율적으로!)</li>
        <li><b>갱신</b> <MathBlock inline expr="w \leftarrow w - \eta\,\nabla L" /> — 모든 가중치를 조금씩 개선.</li>
        <li>1~3 을 <b>반복</b> → 손실이 줄며 모델이 똑똑해짐.</li>
      </ol>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="딥러닝 학습은 '손실 계산 → 그래디언트 계산 → 가중치 갱신'을 반복하는 경사하강이다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 규모가 클 뿐, 원리는 이번 챕터의 경사하강 그대로예요."
    />

    <!-- 5. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="그래디언트와 경사하강법 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="그래디언트 ∇f 는 편미분들을 모은 벡터다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 변수마다 편미분 하나씩 모은 것이 그래디언트."
      />
      <Quiz
        difficulty="easy"
        question="경사하강법의 갱신식으로 올바른 것은?"
        :choices="[
          'w ← w − η·∇L',
          'w ← w + η·∇L',
          'w ← η·∇L',
          'w ← w − ∇L / η',
        ]"
        :answer="0"
        :hints="['기울기의 반대 방향(−)으로 η 만큼.']"
        explanation="w ← w − η·∇L. 기울기 반대 방향으로 학습률만큼 이동."
      />
      <Quiz
        difficulty="easy"
        question="f(w)=w² (f'(w)=2w), η=0.1, w=5. 한 걸음 뒤 w 는?"
        type="numeric"
        :answer="4"
        :hints="['w − η·2w = 5 − 0.1×10.']"
        explanation="5 − 0.1×10 = 4."
      />
      <Quiz
        difficulty="easy"
        question="학습률 η 는 '한 걸음의 크기'를 정한다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. η 가 크면 성큼, 작으면 조금씩 이동."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="f(w)=w², η=0.1, 시작 w=3. 경사하강 두 걸음을 계산하세요."
        :steps="[
          { lhs: `f'(3)=2\\times 3`, answer: 6 },
          { lhs: `w \\leftarrow 3 - 0.1\\times 6`, answer: 2.4, tolerance: 0.001 },
          { lhs: `f'(2.4)=2\\times 2.4`, answer: 4.8, tolerance: 0.001 },
          { lhs: `w \\leftarrow 2.4 - 0.1\\times 4.8`, answer: 1.92, tolerance: 0.001 },
        ]"
        :hints="['w ← w − η·2w.', '매 걸음 기울기를 다시 계산.']"
        explanation="3 → 2.4 → 1.92 … 최소값 0 으로 수렴."
      />
      <Quiz
        difficulty="medium"
        question="학습률 η 가 너무 크면 생길 수 있는 일은?"
        :choices="[
          '최소값을 지나쳐 진동하거나 발산',
          '항상 더 정확해짐',
          '기울기가 사라짐',
          '변수가 늘어남',
        ]"
        :answer="0"
        explanation="너무 큰 η 는 최소값을 건너뛰어 진동/발산을 일으킵니다."
      />
      <Quiz
        difficulty="medium"
        question="f(w)=(w−2)² (f'(w)=2(w−2)), η=0.5, w=6. 한 걸음 뒤 w 는?"
        type="numeric"
        :answer="2"
        :hints="['기울기 = 2(6−2)=8.', 'w = 6 − 0.5×8.']"
        explanation="6 − 0.5×8 = 2. (η=0.5 라 한 걸음에 최소값 도착!)"
      />
      <Quiz
        difficulty="medium"
        question="학습률이 너무 작으면 수렴이 아주 느려진다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 걸음이 작아 최소값까지 오래 걸립니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="f(w)=w², η=0.1, w=5 에서 '두 걸음' 뒤 w 는?"
        type="numeric"
        :answer="3.2"
        :tolerance="0.001"
        :hints="['1걸음: 5→4. 2걸음: 4 − 0.1×8.']"
        explanation="5 → 4 → 3.2."
      />
      <Quiz
        difficulty="hard"
        question="경사하강이 도착한 골짜기가 '전체에서 가장 낮은 곳'이 아닐 수 있다. 이런 지점을 무엇이라 하나?"
        :choices="['전역 최소값', '지역 최소값(local minimum)', '최대값', '변곡점']"
        :answer="1"
        :hints="['주변에선 최저지만 전체 최저는 아닌 골짜기.']"
        explanation="지역 최소값입니다. 시작 위치·학습률에 따라 여기 갇힐 수 있어요."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch09_gradient_descent.ipynb</code> 에서 경사하강 루프를 직접 코딩해
      w 가 최소값으로 수렴하는 과정을 찍어보고, 학습률을 바꿔 진동·발산도 재현합니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch9')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">Phase 9 완료 — AI 학습의 심장, 경사하강을 잡았습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        마지막 챕터: 그래디언트를 효율적으로 구하는 방법 — <b>역전파</b>로 모든 걸 잇습니다.
      </p>
      <RouterLink
        to="/ch/ch10"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        마지막 챕터 — 역전파 직관 →
      </RouterLink>
    </div>
  </article>
</template>
