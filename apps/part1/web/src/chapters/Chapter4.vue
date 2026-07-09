<script setup lang="ts">
// Phase 4 · 연립방정식과 가우스 소거법
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import LinearSystem2D from '@/components/LinearSystem2D.vue'
import Quiz from '@/components/Quiz.vue'
import StepQuiz from '@/components/StepQuiz.vue'
import QuizSet from '@/components/QuizSet.vue'
import NotebookCard from '@/components/NotebookCard.vue'
import ReviewFlag from '@/components/ReviewFlag.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch4')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 4</p>
    <h1 class="mb-4 text-3xl font-bold">연립방정식과 가우스 소거법</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      여러 조건을 <b>동시에</b> 만족하는 값을 찾는 게 연립방정식입니다. 그림으로는
      <b>직선들이 만나는 점</b>을 찾는 일이고, AI에서는 <b>최적의 값을 찾는</b> 계산의 토대예요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>연립방정식의 해 = <b>직선들의 교점</b>임을 안다</li>
        <li>연립방정식을 <b>행렬(첨가행렬)</b>로 표현한다 <span class="text-sm text-slate-400">(첨가행렬이 뭔지는 아래 2번에서 설명)</span></li>
        <li><b>가우스 소거법</b>으로 단계별로 푼다</li>
        <li>해가 <b>1개 / 없음 / 무수히 많음</b> 세 경우를 안다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 연립방정식이란 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 연립방정식 = 직선들의 교점</h2>
    <ReviewFlag id="ch4-s1" chapter="ch4" label="1. 연립방정식 = 직선들의 교점" />
    <ConceptCard tone="note" title="새 용어 — 방정식 · 연립방정식 · 해">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>방정식(equation)</b>: 아직 모르는 값(<b>미지수</b>, 보통 x, y)이 들어간 등식.
          그 미지수가 <b>어떤 값일 때 등호가 성립하는지</b>를 묻는 식입니다.
          예: <MathBlock inline expr="x + y = 3" /> 은 "x와 y를 더해 3이 되게 하는 값"을 찾는 식.
        </li>
        <li><b>미지수(unknown)</b>: 값을 아직 모르는, 우리가 구하려는 글자 (여기선 x, y).</li>
        <li><b>연립방정식</b>: 두 개 이상의 방정식을 <b>한 묶음</b>으로 함께 푸는 것.</li>
        <li><b>해(solution)</b>: 묶음 안의 <b>모든</b> 식을 동시에 만족하는 값.</li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="tip" title="왜 '식 하나 = 직선 하나', '해 = 교점'일까?">
      <p class="mb-2">
        <b>① 식 하나를 만족하는 점은 무수히 많다.</b>
        예를 들어 <MathBlock inline expr="x + y = 3" /> 을 만족하는 (x, y)는 하나가 아니에요:
      </p>
      <div class="mb-2 overflow-x-auto">
        <table class="text-sm">
          <thead>
            <tr class="text-slate-500">
              <th class="px-3 py-1 text-left">x</th>
              <th class="px-3 py-1 text-left">y</th>
              <th class="px-3 py-1 text-left">x + y</th>
            </tr>
          </thead>
          <tbody class="font-mono">
            <tr><td class="px-3 py-0.5">0</td><td class="px-3 py-0.5">3</td><td class="px-3 py-0.5">3 ✓</td></tr>
            <tr><td class="px-3 py-0.5">1</td><td class="px-3 py-0.5">2</td><td class="px-3 py-0.5">3 ✓</td></tr>
            <tr><td class="px-3 py-0.5">2</td><td class="px-3 py-0.5">1</td><td class="px-3 py-0.5">3 ✓</td></tr>
            <tr><td class="px-3 py-0.5">3</td><td class="px-3 py-0.5">0</td><td class="px-3 py-0.5">3 ✓</td></tr>
          </tbody>
        </table>
      </div>
      <p class="mb-2">
        이 점들 (0,3), (1,2), (2,1), (3,0) … 을 좌표평면에 찍으면 <b>일렬로 늘어서 직선이 됩니다.</b>
        즉 <b>직선 = "그 식을 만족하는 모든 점의 모임"</b>. 식 하나는 답 후보가 직선만큼 많아요.
      </p>
      <p class="mb-2">
        <b>② 두 식을 동시에 만족 = 두 직선이 겹치는 점.</b>
        해는 직선 ① 위에도 있고 <b>동시에</b> 직선 ② 위에도 있어야 하니, 둘이 만나는 <b>교점</b> 하나로 좁혀집니다.
      </p>
      <p class="text-sm text-slate-500">
        💡 비유: 식 하나 = "조건 하나". 조건 하나면 후보가 직선만큼 많지만,
        조건 두 개를 <b>동시에</b> 걸면 후보가 딱 한 점으로 좁혀져요.
      </p>
    </ConceptCard>

    <MathBlock expr="\begin{cases} x + y = 3 \\ x - y = 1 \end{cases}" />
    <p class="leading-relaxed text-slate-700">
      위 두 식을 직선으로 그리면 한 점에서 만나고, 그 점 <MathBlock inline expr="(2, 1)" /> 이 해입니다.
      아래에서 두 직선을 움직이며 <b>교점이 해</b>라는 걸 느껴보세요. 버튼으로 세 가지 경우도 봅니다.
    </p>

    <LinearSystem2D />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="미지수가 2개인 연립방정식의 해는 '두 직선이 만나는 점'이다."
      type="truefalse"
      :answer="0"
      explanation="참. 각 식이 직선이고, 둘을 동시에 만족하는 곳이 교점입니다."
    />

    <!-- 2. 행렬로 표현 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 연립방정식을 행렬로</h2>
    <ReviewFlag id="ch4-s2" chapter="ch4" label="2. 연립방정식을 행렬로" />
    <p class="leading-relaxed text-slate-700">
      앞 챕터에서 배운 행렬로 연립방정식을 깔끔하게 쓸 수 있어요.
      <b>계수</b>만 모으면 <MathBlock inline expr="A\vec{x} = \vec{b}" /> 한 줄이 됩니다.
    </p>

    <ConceptCard tone="goal" title="왜 굳이 행렬로 바꿀까?">
      <p class="mb-2">한마디로 <b>"크고 많아져도 똑같은 방법으로, 기계가 풀 수 있게"</b> 하려는 거예요.</p>
      <ul class="list-disc space-y-1 pl-5">
        <li><b>① 간결함</b>: 미지수가 수천~수백만 개면 글자로 못 적어요. 숫자만 표로 모으면 깔끔.</li>
        <li><b>② 기계적 풀이</b>: 글자를 떼고 숫자만 다루면 <b>컴퓨터가 규칙대로 자동</b>으로 풉니다.</li>
        <li><b>③ 한 형태로 통일</b>: 미지수가 2개든 100만 개든 전부 <MathBlock inline expr="A\vec{x}=\vec{b}" /> 한 줄 → 푸는 방법도 하나.</li>
        <li><b>④ 도구 재사용</b>: 행렬곱·역행렬·행렬식을 그대로 활용. 예) <MathBlock inline expr="\vec{x} = A^{-1}\vec{b}" /> 로 한 방에. (위첨자 −1이 붙은 <MathBlock inline expr="A^{-1}" /> 는 "에이 인버스" — A를 <b>되돌리는 행렬</b>인데, 다음 챕터에서 제대로 배워요.)</li>
      </ul>
      <p class="mt-2 text-sm">
        🤖 <b>그리고 이게 AI의 핵심 이유</b> — 실제 AI는 파라미터가 수백만~수십억 개라, 행렬·벡터로 묶어야
        <b>GPU가 한꺼번에 병렬로</b> 계산할 수 있어요. "연립방정식을 행렬로"가 곧 AI 계산의 토대입니다.
      </p>
    </ConceptCard>

    <details class="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <summary class="cursor-pointer font-medium text-slate-700">▸ 더 자세히 — 왜 이게 그렇게 중요할까? (AI의 언어가 된 이유)</summary>
      <div class="mt-3 space-y-4 text-sm leading-relaxed text-slate-700">
        <div>
          <p class="font-semibold text-slate-800">① 글자 반복을 빼서 깔끔하게</p>
          <p>
            연립방정식을 글로 쓰면 줄마다 <b>x, y 같은 글자랑 +, = 기호를 똑같이 반복</b>해야 해요.
            사실 줄마다 다른 건 <b>숫자뿐</b>이라, 그 숫자만 표로 모은 게 행렬이에요.
          </p>
          <p class="mt-1 text-slate-500">
            🪣 비유: 반 출석부. "철수 3일, 영희 5일 왔다"를 문장으로 안 쓰고 <b>표 칸에 3, 5만</b> 적죠.
            학생이 1000명이어도 칸만 늘리면 돼요. AI는 미지수가 수백만 개라 글로는 절대 못 적고, <b>표라야</b> 가능해요.
          </p>
        </div>
        <div>
          <p class="font-semibold text-slate-800">② 컴퓨터가 알아서 풀 수 있다</p>
          <p>
            컴퓨터는 'x가 무슨 뜻'인지 생각 못 해요. 대신 <b>"표 둘째 줄에서 첫째 줄을 빼라"</b> 같은
            단순 숫자 규칙은 아주 빠르고 정확하게 해요. 행렬로 바꾸면 푸는 과정이
            <b>'글자 고민'에서 '숫자 옮기기'</b>로 바뀌어서, 컴퓨터가 같은 절차를 반복해 자동으로 풀어요.
          </p>
          <p class="mt-1 text-slate-500">
            실제로 파이썬에선 표 A와 b만 건네면 답이 나와요 (<code>np.linalg.solve(A, b)</code>).
          </p>
        </div>
        <div>
          <p class="font-semibold text-slate-800">③ 크기가 달라도 모양이 똑같다</p>
          <p>
            식이 2개든 100만 개든, 행렬로 쓰면 전부 <MathBlock inline expr="A\vec{x}=\vec{b}" /> <b>한 줄로 똑같이</b> 생겼어요.
            모양이 같으니 <b>푸는 방법도 딱 하나만</b> 익히면 끝. 개수마다 새로 배울 필요가 없어요.
          </p>
          <p class="mt-1 text-slate-500">
            📦 비유: 택배 상자. 안에 옷이 들었든 그릇이 들었든, <b>상자 규격만 같으면</b> 같은 트럭·기계가 똑같이 나르죠.
          </p>
        </div>
        <div>
          <p class="font-semibold text-slate-800">④ 편리한 도구를 그대로 쓴다</p>
          <p>
            한번 행렬로 만들면 <b>행렬 전용 도구</b>들을 그대로 붙여 쓸 수 있어요.
            숫자에서 <b>"3 × ? = 6 이면 6 ÷ 3 = 2"</b> 로 한 번에 풀듯, 행렬에도 '나누기' 같은 도구(<b>역행렬</b>)가 있어서
            답을 단번에 구해요. (다음 챕터에서 배워요)
          </p>
        </div>
        <div>
          <p class="font-semibold text-slate-800">🤖 그래서 AI랑 무슨 상관?</p>
          <ul class="mt-1 list-disc space-y-1 pl-5">
            <li>AI가 하는 계산을 들여다보면 대부분이 이 <b>'표(행렬) 곱하기'</b>예요. 정보가 AI 안을 한 단계 지날 때마다 행렬 계산이 한 번씩 일어나요.</li>
            <li>그래픽카드(GPU)는 이 표 계산을 <b>한꺼번에 수천 개 동시에</b> 하도록 만든 부품이에요. 그래서 데이터를 표로 묶어야 빨라요 — 하나씩 줄 세워 계산하면 너무 느리거든요.</li>
            <li>AI가 <b>"학습한다"</b>는 것도 결국, 데이터에 가장 잘 맞는 숫자들을 찾는 <b>거대한 연립방정식 풀기</b>예요.</li>
          </ul>
        </div>
      </div>
    </details>

    <ConceptCard tone="tip" title="왜 '계수'만 모을까?">
      <p class="mb-2">두 식을 나란히 보면, <b>글자 x, y는 자리만 차지하며 똑같이 반복</b>돼요. 식마다 다른 <b>진짜 정보는 숫자뿐</b>입니다:</p>
      <ul class="mb-2 list-disc space-y-1 pl-5 text-sm">
        <li><b>미지수 앞 숫자(계수)</b> = 식의 구조 → 행렬 <MathBlock inline expr="A" /> 로</li>
        <li>
          <b>x, y</b> = 자리(슬롯), 구할 값 → 둘을 세로로 쌓아 해 벡터
          <MathBlock inline expr="\vec{x} = \begin{bmatrix} x \\ y \end{bmatrix}" /> 로 묶음.
          <span class="text-slate-500">(낱개 글자 <MathBlock inline expr="x" /> 와 벡터 <MathBlock inline expr="\vec{x}" /> 는 이름만 같고 다른 것 — <MathBlock inline expr="\vec{x}" /> 는 x, y를 담은 상자!)</span>
        </li>
        <li><b>등호 오른쪽 숫자(상수)</b> = 목표값 → 벡터 <MathBlock inline expr="\vec{b}" /> 로</li>
      </ul>
      <p class="text-sm text-slate-500">
        💡 글자를 떼고 <b>숫자만</b> 다루면, 뒤에 나올 <b>행 연산을 기계적으로</b> 할 수 있어요(3번에서 바로 써먹습니다). 그래서 계수만 모읍니다.
      </p>
    </ConceptCard>
    <MathBlock
      expr="\begin{cases} x + y = 3 \\ x - y = 1 \end{cases} \;\Longleftrightarrow\; \begin{bmatrix} 1 & 1 \\ 1 & -1 \end{bmatrix}\begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} 3 \\ 1 \end{bmatrix}"
    />
    <p class="text-sm text-slate-500">
      (가운데 화살표 <MathBlock inline expr="\Longleftrightarrow" /> 는 "서로 같은 표현"이라는
      기호예요 — 같은 문제를 왼쪽·오른쪽 두 방식으로 쓴 것.)
    </p>

    <ConceptCard tone="tip" title="왜 이게 같은 식일까? — 행렬×벡터를 펼쳐보자">
      <p class="mb-2">
        앞 챕터에서 <b>행렬×벡터</b>는 "각 행과 벡터를 짝지어 곱하고 더한다"였죠. 왼쪽을 실제로 곱해봅시다:
      </p>
      <MathBlock expr="\begin{bmatrix} 1 & 1 \\ 1 & -1 \end{bmatrix}\begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} 1\cdot x + 1\cdot y \\ 1\cdot x + (-1)\cdot y \end{bmatrix} = \begin{bmatrix} x + y \\ x - y \end{bmatrix}" />
      <ul class="mb-2 list-disc space-y-1 pl-5 text-sm">
        <li><b>첫째 행</b> [1 &nbsp;1] 과 [x &nbsp;y] → <MathBlock inline expr="x + y" /></li>
        <li><b>둘째 행</b> [1 &nbsp;−1] 과 [x &nbsp;y] → <MathBlock inline expr="x - y" /></li>
      </ul>
      <p class="mb-2">이제 오른쪽 <MathBlock inline expr="\begin{bmatrix} 3 \\ 1 \end{bmatrix}" /> 과 같다고 놓으면, <b>위 칸끼리, 아래 칸끼리</b> 각각 같아야 하므로:</p>
      <MathBlock expr="\begin{bmatrix} x + y \\ x - y \end{bmatrix} = \begin{bmatrix} 3 \\ 1 \end{bmatrix} \;\Rightarrow\; \begin{cases} x + y = 3 \\ x - y = 1 \end{cases}" />
      <p class="font-semibold text-emerald-700">원래 두 식이 그대로 복원! <MathBlock inline expr="A\vec{x}=\vec{b}" /> 는 두 식을 한 덩어리로 접어 쓴 것뿐이에요.</p>
    </ConceptCard>

    <ConceptCard tone="note" title="새 용어 — 계수, 첨가행렬">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>계수(coefficient)</b>: 미지수 앞에 곱해진 숫자 (x+y의 계수는 1, 1).</li>
        <li>
          <b>계수행렬 <MathBlock inline expr="A" /></b>: 계수만 모은 행렬.
          <b>해 벡터 <MathBlock inline expr="\vec{x}" /></b>: 미지수 (x, y).
          <b>상수 벡터 <MathBlock inline expr="\vec{b}" /></b>: 등호 오른쪽 숫자.
        </li>
        <li>
          <b>첨가행렬(augmented matrix)</b>: 계수행렬 A 와 상수 벡터 b 를 <b>세로줄(|)로 붙여 쓴 표</b>.
          <MathBlock inline expr="\left[\begin{array}{cc|c} 1 & 1 & 3 \\ 1 & -1 & 1 \end{array}\right]" />
          — 세로줄 왼쪽이 계수, 오른쪽이 상수. ('첨가'는 b를 <b>덧붙였다</b>는 뜻.)
        </li>
        <li>
          <b>왜 이렇게 쓰나?</b> x, y 글자는 자리만 정해지면 매번 쓸 필요가 없어요.
          그래서 <b>숫자만 표로 모아</b> 두면, 다음 단계의 계산(행 연산)을 글자 없이
          <b>숫자만 기계적으로</b> 처리할 수 있습니다. 컴퓨터가 푸는 방식도 바로 이거예요.
        </li>
      </ul>
    </ConceptCard>

    <!-- 3. 가우스 소거법 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 가우스 소거법 — 두 식을 빼서 글자 하나 없애기</h2>
    <ReviewFlag id="ch4-s3" chapter="ch4" label="3. 가우스 소거법" />
    <p class="leading-relaxed text-slate-700">
      한마디로 <b>두 식을 빼서 글자(미지수) 하나를 없애고, 하나씩 푸는</b> 방법이에요. 딱 3단계입니다.
    </p>

    <ConceptCard tone="tip" title="핵심 3단계">
      <MathBlock expr="\begin{cases} x + y = 3 \\ x - y = 1 \end{cases}" />
      <ol class="list-decimal space-y-2 pl-5">
        <li>
          <b>두 식을 뺀다</b> (아래 − 위) → 똑같던 x가 사라지고 y만 남아요:
          <MathBlock inline expr="-2y = -2" />
        </li>
        <li><b>남은 글자 y를 구한다</b>: <MathBlock inline expr="-2y = -2 \Rightarrow y = 1" /></li>
        <li>
          <b>도로 넣어 나머지를 구한다</b>: 위 식에 y=1 대입 →
          <MathBlock inline expr="x + 1 = 3 \Rightarrow x = 2" />
        </li>
      </ol>
      <p class="mt-2 font-semibold text-emerald-700">해: x = 2, y = 1 ✓</p>
    </ConceptCard>

    <!-- 접이식 상세 -->
    <details class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <summary class="cursor-pointer font-medium text-slate-700">▸ 더 자세히 — 두 식을 빼면 왜 x가 사라질까?</summary>
      <div class="mt-3">
        <p class="mb-1 text-sm">아래 식에서 위 식을 <b>같은 자리(칸)끼리</b> 빼봅니다 (x는 x끼리, y는 y끼리, 숫자는 숫자끼리):</p>
        <div class="mb-2 overflow-x-auto">
          <table class="text-sm">
            <thead>
              <tr class="text-slate-500">
                <th class="px-3 py-1 text-left">자리</th>
                <th class="px-3 py-1 text-left">아래 식</th>
                <th class="px-3 py-1 text-left">− 위 식</th>
                <th class="px-3 py-1 text-left">결과</th>
              </tr>
            </thead>
            <tbody class="font-mono">
              <tr><td class="px-3 py-0.5">x</td><td class="px-3 py-0.5">x</td><td class="px-3 py-0.5">− x</td><td class="px-3 py-0.5 font-semibold text-rose-600">x − x = 0 (사라짐!)</td></tr>
              <tr><td class="px-3 py-0.5">y</td><td class="px-3 py-0.5">− y</td><td class="px-3 py-0.5">− y</td><td class="px-3 py-0.5">−y − y = −2y</td></tr>
              <tr><td class="px-3 py-0.5">우변</td><td class="px-3 py-0.5">1</td><td class="px-3 py-0.5">− 3</td><td class="px-3 py-0.5">1 − 3 = −2</td></tr>
            </tbody>
          </table>
        </div>
        <p class="mb-2 text-sm">
          두 식 다 x 계수가 1이라 빼면 <MathBlock inline expr="x - x = 0" /> → x가 없어지고 <MathBlock inline expr="-2y = -2" /> 만 남아요.
        </p>
        <p class="mb-1 text-sm">첨가행렬(숫자만)로 보면 똑같은 일입니다:</p>
        <MathBlock expr="\left[\begin{array}{cc|c} 1 & 1 & 3 \\ 1 & -1 & 1 \end{array}\right] \;\xrightarrow{\;R2 - R1\;}\; \left[\begin{array}{cc|c} 1 & 1 & 3 \\ 0 & -2 & -2 \end{array}\right]" />
        <p class="text-sm text-slate-500">화살표 위 <b>R2 − R1</b> 은 "2행에서 1행을 뺀다"는 뜻이에요(R는 행 Row 의 약자). 둘째 행 첫 칸이 <b>0</b> 이 된 것 = 식에서 x가 사라진 것.</p>
      </div>
    </details>

    <details class="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <summary class="cursor-pointer font-medium text-slate-700">▸ 더 자세히 — 왜 빼도 답이 안 변할까? (저울)</summary>
      <div class="mt-3">
        <p class="text-sm text-slate-600">
          위 식이 <MathBlock inline expr="x+y = 3" /> 이라 했으니 <MathBlock inline expr="x+y" /> 와 <MathBlock inline expr="3" /> 은 같은 값이에요.
          그래서 왼쪽에서 <MathBlock inline expr="x+y" />, 오른쪽에서 <MathBlock inline expr="3" /> 을 빼는 건 <b>양쪽에서 똑같은 양을 덜어내는 것</b> →
          <b>저울이 그대로 균형</b>을 유지하듯 등호도 그대로 성립합니다. 그래서 답이 안 변해요.
        </p>
      </div>
    </details>

    <details class="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <summary class="cursor-pointer font-medium text-slate-700">▸ 용어 정리 — 행 연산 · 전진소거 · 후진대입</summary>
      <div class="mt-3 text-sm">
        <p class="mb-3"><b>행 연산</b>(해를 안 바꾸는 3가지): ① 두 행 순서 바꾸기 ② 한 행에 0 아닌 수 곱하기 ③ 한 행에 다른 행의 몇 배 더하기/빼기(← 소거의 핵심).</p>

        <p class="mb-2">
          🧭 <b>이름부터 풀어보면</b> — 가우스 소거법은 <b>방향이 정반대인 두 단계</b>로 되어 있어요.
          이름이 곧 그 <b>진행 방향</b>이에요.
        </p>
        <div class="mb-3 grid gap-2 sm:grid-cols-2">
          <div class="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
            <div class="font-semibold text-indigo-700">전진소거 ↓ (위 → 아래)</div>
            <p class="mt-1 text-slate-600">
              <b>전진</b> = 앞(아래)으로 나아가며, <b>소거</b> = 글자를 <b>지운다</b>.<br />
              위 식을 이용해 <b>아래 식의 글자를 하나씩 없애</b> 왼쪽 아래를 0으로.
            </p>
          </div>
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div class="font-semibold text-emerald-700">후진대입 ↑ (아래 → 위)</div>
            <p class="mt-1 text-slate-600">
              <b>후진</b> = 뒤(위)로 거슬러, <b>대입</b> = 구한 값을 <b>도로 넣는다</b>.<br />
              맨 아래에서 구한 값을 <b>위 식에 넣어</b> 나머지를 차례로.
            </p>
          </div>
        </div>

        <p class="mb-1 text-slate-600"><b>① 전진소거 ↓</b> — 아래 행에서 위 행을 빼 x를 지웁니다(왼쪽 아래가 0 = <b>계단</b>):</p>
        <MathBlock expr="\left[\begin{array}{cc|c} 1 & 1 & 3 \\ 1 & -1 & 1 \end{array}\right] \;\xrightarrow{\;R2 - R1\;}\; \left[\begin{array}{cc|c} 1 & 1 & 3 \\ 0 & -2 & -2 \end{array}\right]" />
        <p class="mb-3 text-slate-500">
          왼쪽 아래 칸이 <b>0</b> 이 되며 <b>위는 글자 2개 · 아래는 글자 1개(y만)</b> 인 <b>계단 모양</b>이 됐어요.
          이렇게 <b>맨 아래 식에 글자가 하나만</b> 남으면 곧장 풀 수 있죠.
        </p>

        <div class="mb-3 rounded-lg border border-slate-200 bg-white p-3">
          <p class="mb-2">
            🪜 <b>그런데 "계단"이 뭐가 계단이지?</b> — 식이 2개면 0이 하나뿐이라 잘 안 보여요.
            <b>식 3개</b>로 보면 확실합니다. 각 줄에서 <b>0이 아닌 숫자가 처음 나오는 칸</b>(아래 초록)을 보세요:
          </p>
          <div class="overflow-x-auto">
            <table class="border-collapse text-center font-mono text-sm">
              <tbody>
                <tr>
                  <td class="border border-slate-200 bg-emerald-100 px-3 py-1.5 font-bold text-emerald-700">1</td>
                  <td class="border border-slate-200 px-3 py-1.5">2</td>
                  <td class="border border-slate-200 px-3 py-1.5">1</td>
                  <td class="border-l-2 border-slate-400 px-3 py-1.5">6</td>
                </tr>
                <tr>
                  <td class="border border-slate-200 bg-slate-100 px-3 py-1.5 text-slate-400">0</td>
                  <td class="border border-slate-200 bg-emerald-100 px-3 py-1.5 font-bold text-emerald-700">3</td>
                  <td class="border border-slate-200 px-3 py-1.5">1</td>
                  <td class="border-l-2 border-slate-400 px-3 py-1.5">5</td>
                </tr>
                <tr>
                  <td class="border border-slate-200 bg-slate-100 px-3 py-1.5 text-slate-400">0</td>
                  <td class="border border-slate-200 bg-slate-100 px-3 py-1.5 text-slate-400">0</td>
                  <td class="border border-slate-200 bg-emerald-100 px-3 py-1.5 font-bold text-emerald-700">2</td>
                  <td class="border-l-2 border-slate-400 px-3 py-1.5">4</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-2 text-slate-600">
            시작 칸이 <b>1번 → 2번 → 3번</b> 으로 한 줄 내려갈 때마다 <b>오른쪽으로 한 칸씩 밀려요</b>(↘).
            그래서 <b>왼쪽 아래 0들(회색)과 숫자의 경계선이 내려가는 계단</b>처럼 생겼습니다.
          </p>
          <p class="mt-1 text-slate-500">
            우리 2개짜리 <MathBlock inline expr="\begin{bmatrix} 1 & 1 \\ 0 & -2 \end{bmatrix}" /> 는 이 계단의 <b>가장 작은 형태(딱 한 칸)</b> 예요 — 왼쪽 아래 0 하나가 첫 계단.
          </p>
        </div>

        <p class="mb-1 text-slate-600"><b>② 후진대입 ↑</b> — 글자 1개인 맨 아래 식부터 풀고, 그 값을 위로 올려 넣습니다:</p>
        <div class="mb-2 rounded-lg bg-white p-3">
          <p class="mb-1">아래 식 (글자 1개): <MathBlock inline expr="-2y = -2 \;\Rightarrow\; y = 1" /></p>
          <p>위 식에 <MathBlock inline expr="y=1" /> 을 <b>도로 넣기</b>: <MathBlock inline expr="x + 1 = 3 \;\Rightarrow\; x = 2" /></p>
        </div>
        <p class="text-slate-500">
          정리하면 <b>전진소거(↓)로 계단을 만들고</b>, <b>후진대입(↑)으로 거꾸로 채워</b> 해 <MathBlock inline expr="(2,\,1)" /> 을 얻습니다.
          앞의 <b>핵심 3단계</b>에서 1단계가 ↓ 전진소거, 2·3단계가 ↑ 후진대입이에요.
        </p>
      </div>
    </details>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="한 행에 다른 행의 몇 배를 더하거나 빼도 연립방정식의 해는 변하지 않는다."
      type="truefalse"
      :answer="0"
      explanation="참. 이것이 가우스 소거법이 작동하는 이유입니다."
    />

    <!-- 4. 해의 종류 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 해는 세 종류</h2>
    <ReviewFlag id="ch4-s4" chapter="ch4" label="4. 해는 세 종류" />
    <p class="mb-3 leading-relaxed text-slate-700">
      연립방정식이 항상 "딱 한 답"인 건 아니에요. 두 직선의 <b>관계</b>에 따라 답의 개수가 셋 중 하나로 갈립니다.
      아래에서 계속 나오는 <b>기울기</b>는 "직선이 얼마나 가파른가" — <b>오른쪽으로 1칸 갈 때
      위아래로 몇 칸 움직이는지</b>를 뜻해요. 기울기가 같은 두 직선은 평행합니다(나란히 감).
    </p>

    <ConceptCard tone="tip" title="① 유일한 해 — 두 직선이 한 점에서 만남 (교차)">
      <p class="mb-2">기울기가 <b>서로 달라서</b> 딱 한 군데서 만나요. 가장 흔한 경우.</p>
      <MathBlock expr="\begin{cases} x + y = 3 \\ x - y = 1 \end{cases} \;\Rightarrow\; \text{해 } (2,\, 1) \text{ 하나}" />
      <p class="text-sm text-slate-500">풀어보면: 계단이 깔끔히 완성되어 x, y 값이 <b>각각 하나로</b> 정해집니다.</p>
    </ConceptCard>

    <ConceptCard tone="warn" title="② 해 없음 — 평행한 두 직선 (안 만남)">
      <p class="mb-2">기울기는 같은데 <b>위치가 달라</b> 영원히 안 만나요. 두 조건이 <b>서로 모순</b>.</p>
      <MathBlock expr="\begin{cases} x + y = 2 \\ x + y = 5 \end{cases}" />
      <p class="mb-2 text-sm">같은 <MathBlock inline expr="x+y" /> 가 2이면서 동시에 5일 수는 없죠. 그래서 답이 <b>없음</b>.</p>
      <p class="text-sm text-slate-500">
        풀어보면 신호: 소거하다 <MathBlock inline expr="0 = 3" /> 처럼 <b>"0 = (0이 아닌 수)"</b> 라는 <b>거짓 식</b>이 튀어나옵니다 → 해 없음.
      </p>
    </ConceptCard>

    <ConceptCard tone="note" title="③ 무수히 많은 해 — 사실 같은 직선 (일치)">
      <p class="mb-2">두 식이 <b>실은 똑같은 직선</b>이에요(한 식이 다른 식의 배수). 직선 위 <b>모든 점</b>이 답.</p>
      <MathBlock expr="\begin{cases} x + y = 2 \\ 2x + 2y = 4 \end{cases} \quad(\text{둘째 = 첫째} \times 2)" />
      <p class="text-sm text-slate-500">
        풀어보면 신호: 소거하다 <MathBlock inline expr="0 = 0" /> 처럼 <b>항상 참인 식</b>이 되어 한 식이 사라집니다 → 답이 무수히 많음.
      </p>
    </ConceptCard>

    <ConceptCard tone="tip" title="한눈에 비교">
      <div class="overflow-x-auto">
        <table class="text-sm">
          <thead>
            <tr class="text-slate-500">
              <th class="px-3 py-1 text-left">경우</th>
              <th class="px-3 py-1 text-left">두 직선</th>
              <th class="px-3 py-1 text-left">답</th>
              <th class="px-3 py-1 text-left">풀 때 나오는 신호</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="px-3 py-1">유일한 해</td><td class="px-3 py-1">교차 (기울기 다름)</td><td class="px-3 py-1">1개</td><td class="px-3 py-1">계단 완성</td></tr>
            <tr><td class="px-3 py-1">해 없음</td><td class="px-3 py-1">평행 (안 만남)</td><td class="px-3 py-1">0개</td><td class="px-3 py-1">0 = (0 아닌 수)</td></tr>
            <tr><td class="px-3 py-1">무수히 많음</td><td class="px-3 py-1">일치 (겹침)</td><td class="px-3 py-1">∞ (무한대)</td><td class="px-3 py-1">0 = 0</td></tr>
          </tbody>
        </table>
      </div>
      <p class="mt-2 text-sm">1절의 인터랙티브(두 직선 그래프)로 돌아가, 세 버튼으로 각 경우를 직접 움직여 확인해 보세요.</p>
    </ConceptCard>

    <!-- 5. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 AI는 거대한 Ax=b 를 푼다</h2>
    <ReviewFlag id="ch4-ai" chapter="ch4" label="🤖 AI는 거대한 Ax=b 를 푼다" />
    <ConceptCard tone="goal" title="AI에서 연립방정식이 쓰이는 곳">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>선형회귀</b>: 데이터에 가장 잘 맞는 직선/평면을 찾는 일은
          <MathBlock inline expr="A\vec{x} = \vec{b}" /> 형태를 푸는 것입니다
          <span class="text-slate-500">(이 식의 이름이 '정규방정식' — 아래 '더 자세히'에서 쉽게 풀어요)</span>.
          <MathBlock inline expr="\vec{x}" /> 가 바로 <b>찾고 싶은 모델 파라미터</b>예요.
        </li>
        <li>
          <b>현실의 크기</b>: 미지수가 2개가 아니라 <b>수천~수백만 개</b>. 그래서 컴퓨터가
          가우스 소거법(과 그 개량판)으로 푼다.
        </li>
        <li>
          <b>해가 없을 때</b>: 데이터가 딱 안 맞으면 정확한 해 대신 <b>가장 가까운 답</b>(최소제곱)을
          찾습니다 — 이것도 결국 <MathBlock inline expr="A\vec{x}=\vec{b}" /> 풀이의 응용.
        </li>
      </ul>
    </ConceptCard>

    <details class="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <summary class="cursor-pointer font-medium text-slate-700">▸ 더 자세히 — 쉽게 풀어보기 (선형회귀·최소제곱이 뭐죠?)</summary>
      <div class="mt-3 space-y-4 text-sm leading-relaxed text-slate-700">
        <div>
          <p class="font-semibold text-slate-800">선형회귀 = 흩어진 점들 사이로 '가장 잘 맞는 직선' 긋기</p>
          <p>
            예를 들어 <b>공부 시간(가로 x)</b> 과 <b>시험 점수(세로 y)</b> 를 점으로 찍었다고 해봐요.
            점들이 우상향으로 흩어져 있겠죠. 이 점들의 <b>경향을 가장 잘 나타내는 직선 한 줄</b>을 긋는 게 선형회귀예요.
          </p>
          <p class="mt-1 text-slate-500">
            🎯 이 직선이 있으면 <b>예측</b>이 돼요. "5시간 공부하면 몇 점쯤?" → 직선에서 x=5 일 때의 높이를 읽으면 끝.
          </p>
        </div>
        <div>
          <p class="font-semibold text-slate-800">그 직선을 정하는 숫자 = 모델 파라미터</p>
          <p>
            직선은 <b>기울기</b> 와 <b>높이(절편)</b>, 이 <b>두 숫자</b>로 정해져요. 바로 이 숫자들이 <b>파라미터</b>예요.
            "가장 잘 맞는 직선을 찾는다" = "가장 잘 맞는 기울기·절편 숫자를 찾는다" = <b>연립방정식을 푼다</b>(<MathBlock inline expr="A\vec{x}=\vec{b}" />).
            AI가 <b>"학습한다"</b>는 말이 바로 이 숫자 찾기예요.
          </p>
          <p class="mt-1 text-slate-500">
            '정규방정식'은 그 가장 잘 맞는 숫자를 구하는 식인데, 이름만 무섭지 <b>결국 모양이 <MathBlock inline expr="A\vec{x}=\vec{b}" /></b> 인 연립방정식이에요.
          </p>
        </div>
        <div>
          <p class="font-semibold text-slate-800">현실은 직선 하나가 아니다</p>
          <p>
            방금은 숫자가 2개(기울기·절편)뿐이었지만, 진짜 AI는 찾을 숫자가 <b>수천~수백만 개</b>예요.
            손으로는 불가능하니, 컴퓨터가 <b>가우스 소거법(과 개량판)</b> 으로 한꺼번에 풉니다.
          </p>
        </div>
        <div>
          <p class="font-semibold text-slate-800">해가 없을 때 = '최소제곱' (가장 가까운 답)</p>
          <p>
            실제 점들은 보통 <b>한 직선 위에 정확히 놓이지 않아요</b>(조금씩 들쭉날쭉). 그러면 <b>모든 점을 정확히 지나는 직선은 없음</b> = 해가 없는 셈이에요.
            그래서 "정확히 맞는 답" 대신 <b>점들에서 벗어난 정도가 가장 작은</b>(= 전체적으로 제일 가까운) 직선을 찾아요. 이게 <b>최소제곱</b>이에요.
          </p>
          <p class="mt-1 text-slate-500">
            '제곱'이 붙은 건 벗어난 거리를 제곱해서 더해 비교하기 때문 — 부호 상관없이 '얼마나 멀었나'만 보려는 거예요. 이것도 결국 <MathBlock inline expr="A\vec{x}=\vec{b}" /> 풀이의 응용입니다.
          </p>
        </div>
      </div>
    </details>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="선형회귀에서 '가장 잘 맞는 직선'을 찾는 것은 Ax=b 형태를 푸는 일과 관련 있다."
      type="truefalse"
      :answer="0"
      explanation="참. 회귀의 정규방정식이 바로 Ax=b 형태입니다."
    />

    <!-- 6. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="연립방정식 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="연립방정식의 '해'는 모든 식을 동시에 만족하는 값이다."
        type="truefalse"
        :answer="0"
        :hints="['연립(聯立) = 여러 식이 함께 서 있다 — 핵심 단어는 \'동시에\'.']"
        explanation="참. 일부만 만족하면 해가 아닙니다."
      />
      <Quiz
        difficulty="easy"
        question="x + y = 3, x − y = 1 의 해는 (2, 1) 이다. x 값은?"
        type="numeric"
        :answer="2"
        :hints="['해가 (2, 1) 로 이미 주어져 있어요 — 순서쌍의 첫 번째가 x.']"
        explanation="두 식을 더하면 2x=4 → x=2, y=1."
      />
      <Quiz
        difficulty="easy"
        question="두 직선이 평행하면 (만나지 않으면) 해는?"
        :choices="['유일한 해', '해 없음', '무수히 많은 해']"
        :answer="1"
        :hints="['해 = 두 직선이 만나는 점이었어요. 평행선은 만나는 점이 몇 개일까요?']"
        explanation="평행 = 안 만남 = 해 없음."
      />
      <Quiz
        difficulty="easy"
        question="x + y = 5 에서 x의 계수는 1이다."
        type="truefalse"
        :answer="0"
        :hints="['x = 1x — 1은 생략하고 쓰는 약속이에요.']"
        explanation="참. 쓰여있지 않아도 1x 이므로 계수 1."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="x + y = 3, x − y = 1 을 풀어보세요. (두 식을 더해 x부터)"
        :steps="[
          { lhs: '\\text{두 식을 더하면 } 2x =', answer: 4 },
          { lhs: 'x = 4 \\div 2 =', answer: 2 },
          { lhs: '\\text{첫 식에 대입: } y = 3 - x =', answer: 1 },
        ]"
        :hints="['x − y 와 x + y 를 더하면 y가 사라집니다.']"
        explanation="2x=4 → x=2 → y=3−2=1. 해 (2,1)."
      />
      <Quiz
        difficulty="medium"
        question="두 식이 사실 똑같은 직선이면 해는?"
        :choices="['유일한 해', '해 없음', '무수히 많은 해']"
        :answer="2"
        :hints="['두 직선이 완전히 겹쳐 있어요 — 겹친 위의 점은 전부 두 식을 만족하죠.']"
        explanation="완전히 겹치므로 직선 위 모든 점이 해 → 무수히 많음."
      />
      <Quiz
        difficulty="medium"
        question="첨가행렬에서 세로줄(|) 오른쪽에 오는 것은 '상수(등호 오른쪽 숫자)'다."
        type="truefalse"
        :answer="0"
        :hints="['세로줄이 원래 식의 등호(=) 자리였어요.']"
        explanation="참. 왼쪽은 계수, 오른쪽은 상수."
      />
      <Quiz
        difficulty="medium"
        question="행 연산 중 '해를 바꾸지 않는' 것이 아닌 것은?"
        :choices="['두 행 순서 바꾸기', '한 행에 0을 곱하기', '한 행에 다른 행의 2배 더하기']"
        :answer="1"
        :hints="['0을 곱하면 그 식이 사라져 정보가 없어집니다.']"
        explanation="0을 곱하면 안 됩니다(0이 아닌 수만 가능). 나머지 둘은 해 보존."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="2x + y = 5, x = 1 일 때 후진대입(x 값을 도로 넣기)으로 y를 구하세요."
        :steps="[
          { lhs: '\\text{x=1 대입: } 2 \\times 1 =', answer: 2 },
          { lhs: 'y = 5 - 2 =', answer: 3 },
        ]"
        :hints="['x를 먼저 대입한 뒤 y만 남깁니다.']"
        explanation="2(1)+y=5 → y=3."
      />
      <StepQuiz
        difficulty="hard"
        question="x + 2y = 8, 3y = 9 (이미 소거된 형태)를 후진대입으로 푸세요."
        :steps="[
          { lhs: '\\text{아래 식: } y = 9 \\div 3 =', answer: 3 },
          { lhs: '\\text{위 식: } x = 8 - 2 \\times 3 =', answer: 2 },
        ]"
        :hints="['아래 식에서 y부터 구하고 위 식에 대입.']"
        explanation="y=3, x=8−6=2. 해 (2,3)."
      />
    </QuizSet>

    <NotebookCard />

    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch04_linear_systems.ipynb</code> 에서 <code>np.linalg.solve</code> 로 연립방정식을 풀고,
      두 직선의 교점을 그려봅니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch4')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 4 완료. 연립방정식을 풀 수 있습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">다음은 행렬을 '공간을 바꾸는 함수'로 보는 선형변환입니다.</p>
      <RouterLink
        to="/ch/ch5"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 선형변환 →
      </RouterLink>
    </div>
  </article>
</template>
