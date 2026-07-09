<script setup lang="ts">
// Phase 10 · 직교성과 투영 — "가장 가까운 답"을 찾는 원리 (최소제곱)
import { ref, computed } from 'vue'
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import VectorCanvas, { type Vec } from '@/components/VectorCanvas.vue'
import Quiz from '@/components/Quiz.vue'
import StepQuiz from '@/components/StepQuiz.vue'
import QuizSet from '@/components/QuizSet.vue'
import NotebookCard from '@/components/NotebookCard.vue'
import ReviewFlag from '@/components/ReviewFlag.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch10')
}

// ── 투영 데모: a, b 를 드래그하면 그림자 p 와 잔차가 실시간 갱신
const projBase = ref<Vec[]>([
  { x: 2, y: 4, color: '#6366f1', label: 'a', draggable: true },
  { x: 4, y: 1, color: '#f59e0b', label: 'b', draggable: true },
])
const projInfo = computed(() => {
  const a = projBase.value[0]
  const b = projBase.value[1]
  const bb = b.x * b.x + b.y * b.y
  const ab = a.x * b.x + a.y * b.y
  const c = bb === 0 ? 0 : ab / bb
  const p = { x: c * b.x, y: c * b.y }
  const r = { x: a.x - p.x, y: a.y - p.y }
  return { ab, bb, c, p, r, rDotB: r.x * b.x + r.y * b.y }
})
const projVecs = computed<Vec[]>({
  get: () => {
    const { p, r } = projInfo.value
    return [
      projBase.value[0],
      projBase.value[1],
      { x: p.x, y: p.y, color: '#10b981', label: 'p' },
      { x: r.x, y: r.y, tail: { x: p.x, y: p.y }, color: '#94a3b8', label: '잔차', dashed: true },
    ]
  },
  // 드래그로 바뀌는 건 a, b 뿐 — p 와 잔차는 항상 계산해서 그린다
  set: (arr) => {
    projBase.value = [arr[0], arr[1]]
  },
})
function fmt(n: number) {
  return Math.round(n * 100) / 100
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 10 · AI 심화 확장</p>
    <h1 class="mb-4 text-3xl font-bold">직교성과 투영 — '가장 가까운 답'을 찾는 법</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      현실 데이터에는 <b>완벽하게 맞는 답이 없는 경우</b>가 대부분입니다. 그때 AI 가 하는 일은
      "정답"이 아니라 <b>가장 가까운 답</b>을 찾는 것 — 그 원리가 바로 <b>수직(직교)과
      그림자(투영)</b>예요. 선형회귀가 여기서 나옵니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>직교</b> = 수직 = <b>내적이 0</b> (ch2 복습)임을 안다</li>
        <li><b>투영</b> — 벡터를 다른 방향에 드리운 "그림자"를 계산한다</li>
        <li>잔차가 <b>수직</b>이라서 투영이 <b>가장 가까운 점</b>임을 이해한다</li>
        <li><b>최소제곱</b> — 해가 없는 문제에서 최선의 답을 찾는 원리를 안다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 왜 필요한가 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 정답이 없을 때 — AI 가 매일 겪는 상황</h2>
    <ReviewFlag id="ch10-s1" chapter="ch10" label="1. 정답이 없을 때" />
    <p class="leading-relaxed text-slate-700">
      공부 시간과 시험 점수 데이터 100개를 모아 "직선 하나"로 요약한다고 해봅시다.
      100개 점을 <b>전부 지나는 직선은 존재하지 않아요</b>. ch4 식으로 말하면 —
      식(데이터)이 미지수(기울기·절편)보다 많아서 <b>해가 없는 연립방정식</b>입니다.
      그래도 우리는 <b>가장 덜 틀리는 직선</b>을 원하죠. 이 "가장 덜 틀리는"을 수학으로 만드는
      재료가 직교와 투영입니다.
    </p>

    <!-- 2. 직교 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 직교 — 수직을 내적으로 말하기</h2>
    <ReviewFlag id="ch10-s2" chapter="ch10" label="2. 직교 = 내적 0" />
    <p class="leading-relaxed text-slate-700">
      ch2에서 내적은 "두 벡터의 닮은 정도"였죠. 닮은 정도가 <b>딱 0</b> — 서로 아무 관련이 없는
      방향 — 이 되는 순간이 <b>수직</b>입니다.
    </p>
    <MathBlock expr="\vec{u} \perp \vec{v} \iff \vec{u} \cdot \vec{v} = 0" />
    <ConceptCard tone="note" title="새 용어 — 직교">
      <p>
        <b>직교(orthogonal, 오소고널)</b>: 두 벡터가 <b>수직</b>이라는 뜻. 판별법은 딱 하나 —
        <b>내적이 0인가</b>. 기호 <MathBlock inline expr="\perp" /> 는 "수직"이라 읽고,
        <MathBlock inline expr="\iff" /> 는 "…와 …는 같은 말"(동치)이라는 뜻이에요.
      </p>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="u=(2,1), v=(-1,2) 의 내적을 계산하세요. (직교인지 확인해 보세요)"
      type="numeric"
      :answer="0"
      :hints="['내적 = 2×(-1) + 1×2.', '-2 + 2 = ?']"
      explanation="2×(-1) + 1×2 = 0. 내적이 0이므로 두 벡터는 직교(수직)입니다."
    />

    <!-- 3. 투영 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 투영 — 벡터의 그림자 계산하기</h2>
    <ReviewFlag id="ch10-s3" chapter="ch10" label="3. 투영" />
    <p class="leading-relaxed text-slate-700">
      해가 머리 위에 있을 때 막대기(<b>a</b>)가 바닥(<b>b</b> 방향)에 드리우는 <b>그림자</b> —
      그게 투영입니다. 공식은 내적 두 번이면 끝나요:
    </p>
    <MathBlock expr="\vec{p} = \operatorname{proj}_{\vec{b}}(\vec{a}) = \underbrace{\frac{\vec{a}\cdot\vec{b}}{\vec{b}\cdot\vec{b}}}_{c\;(\text{몇 배 지점인가})} \; \vec{b}" />
    <ConceptCard tone="note" title="새 용어 — 투영 · 잔차">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>투영(projection, 프로젝션)</b>: 벡터 a 를 b 방향에 드리운 그림자
          <MathBlock inline expr="\vec{p}" />. 위 공식의 <MathBlock inline expr="\operatorname{proj}_{\vec{b}}(\vec{a})" />
          는 "<b>b 위로의 a 의 투영</b>"이라 읽어요 (아래 첨자가 바닥, 괄호 안이 그림자 주인).
          분수 <MathBlock inline expr="c = \frac{\vec{a}\cdot\vec{b}}{\vec{b}\cdot\vec{b}}" />
          는 "그림자가 b 의 <b>몇 배 지점</b>에 떨어지나"를 뜻해요.
        </li>
        <li>
          <b>잔차(residual, 레지듀얼)</b>: 그림자로 설명 못 한 나머지
          <MathBlock inline expr="\vec{a} - \vec{p}" />. "남은 오차"라는 뜻이고, 항상 b 와
          <b>수직</b>입니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-4 leading-relaxed text-slate-700">
      아래에서 <b>a 와 b 를 드래그</b>해 보세요. 초록 <b>p</b> 가 그림자, 회색 점선이 잔차입니다.
      잔차와 b 의 내적이 <b>항상 0</b>(수직)인 것에 주목!
    </p>
    <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
      <VectorCanvas v-model="projVecs" :range="6" :snap="true" />
      <div class="mt-3 space-y-1 rounded-lg bg-slate-50 p-3 text-sm font-mono text-slate-700">
        <p>c = (a·b)/(b·b) = {{ fmt(projInfo.ab) }}/{{ fmt(projInfo.bb) }} = {{ fmt(projInfo.c) }}</p>
        <p class="text-emerald-700">그림자 p = c·b = ({{ fmt(projInfo.p.x) }}, {{ fmt(projInfo.p.y) }})</p>
        <p>잔차 · b = {{ fmt(projInfo.rDotB) }} ← 항상 0 (수직!)</p>
      </div>
    </div>

    <ConceptCard tone="tip" title="왜 그림자가 '가장 가까운 점'일까?">
      b 방향 직선 위의 수많은 점 중에서 <b>a 와의 거리가 최소</b>인 점이 바로 그림자 p 예요.
      직선 밖의 점에서 직선까지 최단 경로는 <b>수직으로 내려가는 길</b>이니까요(발과 그림자 사이가
      가장 짧죠). "잔차 ⊥ b" 가 곧 "p 는 최선"이라는 증명서인 셈입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="잔차(원래 벡터 − 그림자)는 투영한 방향 b 와 항상 수직이다."
      type="truefalse"
      :answer="0"
      explanation="참. 수직이 아니라면 그림자를 조금 옮겨 거리를 더 줄일 수 있어요 — 즉 수직일 때가 최선입니다."
    />

    <!-- 4. 정규직교기저 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 정규직교기저 — 가장 일하기 좋은 축</h2>
    <ReviewFlag id="ch10-s4" chapter="ch10" label="4. 정규직교기저" />
    <p class="leading-relaxed text-slate-700">
      ch9의 기저 중에서도 <b>서로 수직 + 길이 1</b> 인 기저가 최고급입니다.
      x축·y축(표준기저)이 바로 그 예죠.
    </p>
    <ConceptCard tone="note" title="새 용어 — 정규직교기저 · 그람-슈미트">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>정규직교기저(orthonormal basis, 오소노멀 베이시스)</b>: 기저 벡터들이
          ① 서로 직교하고(orthogonal) ② 길이가 1(normal, 정규화됨)인 기저.
          이러면 어떤 벡터의 좌표를 <b>내적 한 번씩으로</b> 바로 읽을 수 있어요
          (좌표 = 각 축에 드리운 그림자 길이).
        </li>
        <li>
          <b>그람-슈미트(Gram-Schmidt, 그람 슈미트)</b>: 아무 기저나 받아서 정규직교기저로
          바꿔주는 절차. 방법이 바로 방금 배운 것 — <b>앞 벡터들에 대한 그림자(투영)를 빼서</b>
          수직 성분만 남기기를 반복합니다. 이름만 기억해 두면 충분해요.
        </li>
      </ul>
    </ConceptCard>

    <!-- 5. 최소제곱 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 최소제곱 — 해가 없는 문제의 최선의 답</h2>
    <ReviewFlag id="ch10-s5" chapter="ch10" label="5. 최소제곱" />
    <p class="leading-relaxed text-slate-700">
      1절의 "해가 없는 연립방정식 <MathBlock inline expr="A\vec{x} = \vec{b}" />"로 돌아갑시다.
      해가 없다는 건 — <b>b 가 A 의 열벡터들의 span(ch9!) 밖에 있다</b>는 뜻이에요.
      <span class="text-slate-500">(왜냐면 <MathBlock inline expr="A\vec{x}" /> 는 A 의 열벡터들을
      x 의 성분만큼 섞은 <b>선형결합</b>이라서, Ax 로 만들 수 있는 결과 전부가 곧 열들의
      span 이거든요.)</span>
      span 밖이라 정확히 도달할 수 없으니, <b>span 안에서 b 와 가장 가까운 점</b>을 목표로
      바꿉니다. 가장 가까운 점 = <b>b 의 그림자(투영)</b>!
    </p>
    <MathBlock expr="A\vec{x} = \vec{b}\ \text{(불가능)} \;\longrightarrow\; A\hat{x} = \vec{p} = \operatorname{proj}_{\text{span}(A)}(\vec{b})\ \text{(가능한 것 중 최선)}" />
    <ConceptCard tone="note" title="새 용어 — 최소제곱">
      <p>
        <b>최소제곱(least squares — 영어 그대로 "가장 작은(least) 제곱들(squares)")</b>: 오차(잔차)의 <b>제곱합이 최소</b>가 되는
        답 <MathBlock inline expr="\hat{x}" /> ("엑스 햇"이라 읽고, 추정값이라는 뜻)을 찾는 방법.
        "제곱합 최소" 지점이 정확히 <b>투영 지점</b>이라, 결국 이 챕터의 그림자 계산과 같은
        문제입니다. 달라진 건 그림자를 받는 바닥뿐 — 직선(벡터 하나)이 아니라
        <b>span 이라는 평평한 바닥</b>에 그림자를 드리운다고 상상하면 돼요.
      </p>
    </ConceptCard>
    <ConceptCard tone="tip" title="이름만 알아두기 — 정규방정식">
      <p>"잔차가 span 과 수직" 조건을 행렬 식으로 정리하면 이렇게 생긴 식이 나옵니다:</p>
      <MathBlock expr="A^{\mathsf T}A\hat{x} = A^{\mathsf T}\vec{b}" />
      <p class="mt-2">
        이름은 <b>정규방정식(normal equation, 노멀 이퀘이션)</b> — 컴퓨터가 최소제곱을 풀 때
        실제로 푸는 식이에요. <MathBlock inline expr="A^{\mathsf T}" /> ("에이 전치")는 ch3에서
        배운 <b>행과 열 맞바꾸기</b>입니다. <b>이 식이 왜 이렇게 생겼는지 유도는 이 과정
        밖이니 안심하세요</b> — "그림자 조건을 식으로 쓴 것"이라는 정체와 이름만 알면 지금은
        충분합니다.
      </p>
    </ConceptCard>
    <ConceptCard tone="tip" title="선형회귀가 바로 이것">
      점 100개에 직선 <MathBlock inline expr="y = ax + b" /> 를 맞추는 <b>선형회귀</b> =
      "100개 식, 미지수 2개"인 <MathBlock inline expr="A\vec{x}=\vec{b}" /> 의 최소제곱 풀이.
      우리가 매일 보는 "추세선"의 정체가 <b>투영</b>이었던 겁니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="데이터가 많아 Ax = b 의 해가 없을 때, 최소제곱이 하는 일은?"
      :choices="['b 를 A 열들의 span 에 투영해, 가능한 것 중 가장 가까운 답을 찾는다', '해가 생길 때까지 데이터를 지운다', 'A 의 역행렬을 곱해 정확한 해를 구한다']"
      :answer="0"
      :hints="['정확히 도달 못 하면? — 그림자(가장 가까운 점)로 목표를 바꿉니다.']"
      explanation="span 밖의 b 대신 그 그림자 p 를 목표로 바꿔 풉니다. 오차 제곱합이 최소가 되는 답이에요."
    />

    <!-- 6. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 직교·투영이 AI에서 쓰이는 곳</h2>
    <ReviewFlag id="ch10-ai" chapter="ch10" label="🤖 AI에서 쓰이는 곳" />
    <ConceptCard tone="goal" title="실제 활용">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>선형회귀 — 지도학습의 원형</b>: "데이터에 가장 덜 틀리는 모델 맞추기"의 가장 단순한
          형태가 최소제곱 = 투영. 신경망 학습(ch12 예고)도 "오차를 줄이는 방향 찾기"라는 같은
          철학의 확장이에요.
        </li>
        <li>
          <b>PCA 의 축은 직교(ch8 복습)</b>: 주성분들이 서로 수직이라 각 축이 담는 정보가
          <b>겹치지 않아요</b>. "중복 없는 요약"이 가능한 이유가 직교성입니다.
        </li>
        <li>
          <b>임베딩에서 특정 방향 지우기</b>: 단어 임베딩에서 예컨대 성별 방향 벡터에 대한
          <b>투영을 빼면</b>(잔차만 남기면) 그 성분이 제거됩니다 — 편향(bias) 완화 기법의 원리.
          "원치 않는 정보 = 그 방향 그림자"를 빼는 거예요.
        </li>
        <li>
          <b>그람-슈미트/QR — 계산의 안정장치</b>: 컴퓨터가 최소제곱·행렬 분해를 풀 때 축을
          정규직교로 만들어 두면 오차가 쌓이지 않아요. 수치 라이브러리 내부의 단골 재료입니다.
          <span class="text-slate-500">(QR = 그람-슈미트 과정을 행렬 분해 꼴로 쓴 것 —
          이름만 알아두면 충분해요)</span>
        </li>
      </ul>
    </ConceptCard>

    <!-- 7. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">6. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="직교·투영 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="두 벡터가 직교(수직)하면 내적은 0이다."
        type="truefalse"
        :answer="0"
        explanation="참. '내적 = 0'이 직교의 판별법 그 자체입니다."
      />
      <Quiz
        difficulty="easy"
        question="투영(projection)을 가장 잘 설명한 것은?"
        :choices="['한 벡터가 다른 방향에 드리운 그림자', '벡터의 길이를 2배로 늘리기', '벡터를 90도 회전하기']"
        :answer="0"
        explanation="투영 = 그림자. 공식은 (a·b)/(b·b) 배 지점에 떨어집니다."
      />
      <Quiz
        difficulty="easy"
        question="u=(3,0), v=(0,5) 의 내적은?"
        type="numeric"
        :answer="0"
        :hints="['3×0 + 0×5.']"
        explanation="3×0 + 0×5 = 0 → 직교. x축과 y축 방향이니 당연히 수직이죠."
      />
      <Quiz
        difficulty="easy"
        question="정규직교기저는 서로 수직이면서 길이가 모두 1인 기저다."
        type="truefalse"
        :answer="0"
        explanation="참. 직교(orthogonal) + 정규화(normal, 길이 1) = 정규직교(orthonormal)."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="a=(4,2) 를 b=(1,0) 방향에 투영한 그림자 p 의 x 성분은?"
        type="numeric"
        :answer="4"
        :hints="['c = (a·b)/(b·b) 부터: a·b = 4, b·b = 1.', 'p = c·b = 4·(1,0).']"
        explanation="c = 4/1 = 4, p = 4·(1,0) = (4,0). x축 방향 그림자는 x 성분 그대로예요."
      />
      <Quiz
        difficulty="medium"
        question="잔차(a − p)는 투영 방향 b 와 항상 수직이다."
        type="truefalse"
        :answer="0"
        explanation="참. 수직이 아니면 그림자를 옮겨 더 가까워질 수 있으므로, 최선인 지점에선 반드시 수직입니다."
      />
      <Quiz
        difficulty="medium"
        question="a=(2,3) 을 b=(1,0) 에 투영하면 p=(2,0). 잔차 a − p 의 y 성분은?"
        type="numeric"
        :answer="3"
        :hints="['잔차 = (2,3) − (2,0).']"
        explanation="잔차 = (0,3), y 성분은 3. 이 잔차는 b=(1,0) 과 내적 0 — 수직입니다."
      />
      <Quiz
        difficulty="medium"
        question="최소제곱(least squares)이라는 이름의 뜻은?"
        :choices="['오차(잔차)들의 제곱합이 가장 작아지는 답을 고른다', '가장 작은 정사각형 행렬을 쓴다', '미지수 개수를 최소로 줄인다']"
        :answer="0"
        :hints="['least = 최소, squares = 제곱들.']"
        explanation="잔차 제곱합을 최소화한다는 뜻. 그 최소 지점이 정확히 투영 지점입니다."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="a=(6,4) 를 b=(2,0) 에 투영한 그림자 p 의 x 성분을 단계별로 구하세요."
        :steps="[
          { lhs: '\\vec{a}\\cdot\\vec{b} = 6 \\times 2 + 4 \\times 0', answer: 12 },
          { lhs: '\\vec{b}\\cdot\\vec{b} = 2 \\times 2 + 0 \\times 0', answer: 4 },
          { lhs: 'c = 12 \\div 4', answer: 3 },
          { lhs: 'p_x = 3 \\times 2', answer: 6 },
        ]"
        :hints="['내적 두 개를 먼저 구하고 나누면 배율 c, 거기에 b 를 곱하면 그림자.', 'c = 3 — b 의 3배 지점에 그림자가 떨어져요.']"
        explanation="p = 3·(2,0) = (6,0). a=(6,4) 의 x축 그림자가 (6,0)인 것과 일치하죠."
      />
      <Quiz
        difficulty="hard"
        question="선형회귀가 '가장 좋은 직선'을 찾는 수학적 원리는?"
        :choices="['목표 벡터를 데이터 행렬 열들의 span 에 투영한다 (오차 제곱합 최소)', '행렬식이 최대가 되는 직선을 고른다', '고유값이 가장 큰 방향을 고른다']"
        :answer="0"
        :hints="['해가 없는 Ax=b 를 어떻게 풀었었죠?', '고유값이 큰 방향은 PCA(ch8) 이야기예요.']"
        explanation="추세선 = 최소제곱 = 투영. b 를 열공간에 투영한 그림자를 목표로 바꿔 푸는 것입니다."
      />
    </QuizSet>

    <NotebookCard />

    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch10_projection.ipynb</code> 에서 투영 공식을 직접 구현해 잔차가 수직임을
      확인하고, <code>np.linalg.lstsq</code> 로 점 구름에 추세선(선형회귀)을 맞춰봅니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch10')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 10 완료 — '가장 가까운 답'의 원리를 얻었습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 특이값분해 SVD(ch11) — ML에서 가장 중요한 분해가 기다립니다.
      </p>
      <RouterLink
        to="/ch/ch11"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 특이값분해 (SVD) →
      </RouterLink>
    </div>
  </article>
</template>
