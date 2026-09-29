<script setup lang="ts">
// Phase 1 · 좌표와 벡터란 무엇인가
// 표준 구성: 개념 설명 + 새 기호 설명 + 인터랙티브 시각화 + 차트 + 미니체크 + 10문제 세트 + 노트북 안내
import { ref, computed } from 'vue'
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { ChartView } from '@series/ui'
import VectorCanvas, { type Vec } from '@/components/VectorCanvas.vue'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 점 좌표 읽기용 (화살표 없이 점만)
const point = ref<Vec[]>([{ x: 3, y: 2, color: 'var(--c-indigo-500)', label: 'P', draggable: true }])
const p = computed(() => point.value[0])

// 점에서 벡터로 (화살표 표시)
const vec = ref<Vec[]>([{ x: 4, y: 3, color: 'var(--c-indigo-500)', label: 'a', draggable: true }])
const a = computed(() => vec.value[0])

// 사분면 산점도 (고정 점 4개)
const quadrantChart = {
  datasets: [
    { label: '1사분면 (+, +)', data: [{ x: 3, y: 2 }], backgroundColor: 'var(--c-indigo-500)', pointRadius: 8 },
    { label: '2사분면 (−, +)', data: [{ x: -3, y: 2 }], backgroundColor: 'var(--c-pink-500)', pointRadius: 8 },
    { label: '3사분면 (−, −)', data: [{ x: -3, y: -2 }], backgroundColor: 'var(--c-amber-500)', pointRadius: 8 },
    { label: '4사분면 (+, −)', data: [{ x: 3, y: -2 }], backgroundColor: 'var(--c-emerald-500)', pointRadius: 8 },
  ],
}
const quadrantOptions = {
  scales: {
    x: { min: -5, max: 5, ticks: { stepSize: 1 } },
    y: { min: -5, max: 5, ticks: { stepSize: 1 } },
  },
  plugins: { legend: { position: 'bottom' as const } },
}

function onSetComplete() {
  progress.markDone('ch1')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">1장</p>
    <h1 class="mb-4 text-3xl font-bold">좌표와 벡터란 무엇인가</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      선형대수학의 모든 그림은 <b>좌표평면</b> 위에서 시작합니다. 이번 챕터에서는 점이 어디에 있는지
      숫자로 말하는 법을 배우고, 그 점을 <b>벡터</b>(화살표)로 바라보는 시각을 얻습니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>좌표평면의 <b>x축·y축·원점</b>을 안다</li>
        <li>점의 위치를 <b>순서쌍 (x, y)</b> 로 읽고 쓴다</li>
        <li>점을 <b>벡터(화살표)</b> 로 바라보고 성분을 안다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 좌표평면 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 좌표평면이란?</h2>
    <ReviewFlag id="ch1-s1" chapter="ch1" label="1. 좌표평면이란?" />
    <p class="leading-relaxed text-slate-700">
      종이 위에 가로선 하나, 세로선 하나를 직각으로 그으면 <b>좌표평면</b>이 됩니다.
      이 두 선을 기준으로 "어디에 있는지"를 숫자 두 개로 정확히 말할 수 있습니다.
    </p>

    <!-- anchor-id = 협업 주석 임의 항목 앵커(P0) — 네이밍 정본 {chapter}-{type}-{slug} -->
    <ConceptCard tone="note" title="새 용어: 축과 원점" anchor-id="ch1-concept-axes">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>x축 (가로축)</b>: 좌우 방향 기준선. 오른쪽이 +, 왼쪽이 −</li>
        <li><b>y축 (세로축)</b>: 위아래 방향 기준선. 위가 +, 아래가 −</li>
        <li>
          <b>원점(原點)</b>: 두 축이 만나는 점. 기호 <MathBlock inline expr="O" /> 로 쓰고
          좌표는 <MathBlock inline expr="(0, 0)" /> 입니다. ("오"라고 읽어요)
        </li>
      </ul>
    </ConceptCard>

    <!-- 2. 점의 좌표 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 점의 좌표 읽기</h2>
    <ReviewFlag id="ch1-s2" chapter="ch1" label="2. 점의 좌표 읽기" />
    <p class="leading-relaxed text-slate-700">
      점의 위치는 <b>순서쌍</b> 으로 나타냅니다. 아래 <b style="color: var(--c-indigo-600)">파란 점</b>을 끌어보세요.
      가로로 얼마(x), 세로로 얼마(y) 떨어졌는지가 곧 좌표입니다.
    </p>

    <ConceptCard tone="note" title="새 기호: 순서쌍 (x, y)">
      <p>
        <MathBlock inline expr="(x, y)" /> 처럼 괄호 안에 숫자 두 개를 쉼표로 나열한 것을
        <b>순서쌍</b>이라 합니다.
      </p>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li><b>읽는 법</b>: "x, y" 또는 "엑스 콤마 와이"</li>
        <li><b>앞 숫자</b> = x좌표(가로), <b>뒤 숫자</b> = y좌표(세로)</li>
        <li>
          <b>순서가 중요!</b> <MathBlock inline expr="(3, 2)" /> 와 <MathBlock inline expr="(2, 3)" /> 은
          서로 다른 점입니다.
        </li>
      </ul>
    </ConceptCard>

    <VectorCanvas v-model="point" :range="5" :show-arrows="false" />

    <ConceptCard tone="tip" title="지금 점의 좌표">
      현재 점 <b>P</b> 는 <b>({{ p.x }}, {{ p.y }})</b>입니다.
      원점에서 가로로 <b>{{ p.x }}</b>, 세로로 <b>{{ p.y }}</b> 만큼 떨어져 있습니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="순서쌍 (2, 3) 과 (3, 2) 는 같은 점을 나타낸다."
      type="truefalse"
      :answer="1"
      anchor-id="ch1-quiz-ordered-pair"
      explanation="거짓입니다. 순서가 다르면 다른 점이에요. (2,3)은 가로 2, 세로 3 / (3,2)는 가로 3, 세로 2."
    />

    <!-- 3. 사분면 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 사분면: 평면의 네 구역</h2>
    <ReviewFlag id="ch1-s3" chapter="ch1" label="3. 사분면: 평면의 네 구역" />
    <p class="leading-relaxed text-slate-700">
      x축과 y축은 평면을 네 칸으로 나눕니다. 이 네 칸을 <b>사분면</b>이라 하고,
      오른쪽 위부터 시계 반대 방향으로 1, 2, 3, 4사분면이라 부릅니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 사분면(四分面)">
      각 사분면은 x, y의 부호로 구분됩니다.
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li><b>1사분면</b>: (+, +) 오른쪽 위</li>
        <li><b>2사분면</b>: (−, +) 왼쪽 위</li>
        <li><b>3사분면</b>: (−, −) 왼쪽 아래</li>
        <li><b>4사분면</b>: (+, −) 오른쪽 아래</li>
      </ul>
    </ConceptCard>

    <ChartView type="scatter" :data="quadrantChart" :options="quadrantOptions" :height="320" />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="점 (−4, 1) 은 몇 사분면에 있을까요?"
      :choices="['1사분면', '2사분면', '3사분면', '4사분면']"
      :answer="1"
      :hints="['x가 음수(−), y가 양수(+) 입니다.', '(−, +) 는 왼쪽 위.']"
      explanation="x<0, y>0 이므로 왼쪽 위, 즉 2사분면입니다."
    />

    <!-- 4. 점에서 벡터로 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 점에서 벡터로</h2>
    <ReviewFlag id="ch1-s4" chapter="ch1" label="4. 점에서 벡터로" />
    <p class="leading-relaxed text-slate-700">
      이제 핵심입니다. 원점에서 어떤 점까지 <b>화살표</b>를 그으면, 그 화살표가 바로 <b>벡터</b>입니다.
      점이 "어디에 있나"라면, 벡터는 "원점에서 그쪽으로 얼마만큼 가라"는 <b>이동 지시</b>예요.
      아래 화살표 끝을 끌어보세요.
    </p>

    <VectorCanvas v-model="vec" :range="5" />

    <ConceptCard tone="note" title="새 기호: 벡터 표기와 성분">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <MathBlock inline expr="\vec{a}" />: 글자 위 화살표는 "이건 벡터"라는 표시 (읽기: "벡터 에이")
        </li>
        <li>
          벡터는 성분으로 이렇게도 씁니다:
          <MathBlock inline expr="\vec{a} = (4, 3)" /> 또는 세로로
          <MathBlock inline expr="\vec{a} = \begin{pmatrix} 4 \\ 3 \end{pmatrix}" />.
          가로로 쓰면 <b>(4, 3)</b>, 세로로 위아래 쌓으면 <b>열벡터</b>라 불러요.
          <b>둘은 똑같은 벡터</b>고 쓰는 방향만 다를 뿐이에요. (뒤 챕터에선 세로 형태도 자주 써요)
        </li>
        <li>
          <b>성분(component)</b>: 가로로 가는 양(x성분)과 세로로 가는 양(y성분).
          지금 <MathBlock inline expr="\vec{a}" /> 의 성분은 x={{ a.x }}, y={{ a.y }} 입니다.
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="tip" title="점과 벡터의 관계">
      점 <MathBlock inline expr="P(4, 3)" /> 와 벡터 <MathBlock inline expr="\vec{a}=(4,3)" /> 는
      숫자가 똑같습니다. <b>점은 위치, 벡터는 원점에서 그 점으로 가는 화살표</b>로, 보는 관점만 다를 뿐이에요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="원점에서 점 (4, 3) 으로 가려면 가로로 4, 세로로 3 만큼 가야 한다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 그게 바로 벡터 (4, 3) 의 성분이에요."
    />

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 벡터는 AI가 세상을 읽는 단위</h2>
    <ReviewFlag id="ch1-ai" chapter="ch1" label="🤖 벡터는 AI가 세상을 읽는 단위" />
    <p class="leading-relaxed text-slate-700">
      방금 배운 "숫자 목록 = 벡터"가 사실 <b>AI의 출발점</b>이에요. AI는 글·이미지·사람 무엇이든
      먼저 <b>숫자 벡터</b>로 바꾼 뒤에야 계산할 수 있거든요.
    </p>

    <ConceptCard tone="ai" title="AI는 모든 것을 벡터로 바꾼다">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>데이터 → 숫자 목록(벡터)</b>: 이미지는 <b>픽셀 밝기 벡터</b>, 단어는 <b>임베딩 벡터</b>,
          사용자는 <b>취향 벡터</b>로 바꿉니다. (ch2 영화 추천의 (액션, 로맨스) 같은 식)
        </li>
        <li>
          <b>점 하나 = 데이터 하나</b>: 좌표평면의 점을 다뤘듯, AI는 데이터 하나를
          <b>공간 속의 점(벡터)</b> 하나로 봅니다. 단, 축이 2개가 아니라 <b>수백~수천 개</b>예요.
        </li>
        <li>
          <b>비슷하면 가깝다</b>: 닮은 데이터는 그 공간에서 <b>가까운 벡터</b>가 됩니다.
          "얼마나 가까운가/닮았나"를 재는 게 바로 <b>다음 챕터의 내적</b>이에요.
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="note" title="새 용어: 특징 벡터 · 임베딩">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <b>특징 벡터(feature vector)</b>: 한 대상의 성질들을 숫자로 나열한 벡터.
          예) 집을 <MathBlock inline expr="(\text{면적},\ \text{방 수},\ \text{거리})" /> 로.
        </li>
        <li>
          <b>임베딩(embedding)</b>: 단어·이미지처럼 숫자가 아닌 것을 <b>의미가 담긴 벡터</b>로
          바꾼 결과. "비슷한 뜻 = 가까운 벡터"가 되도록 AI가 만들어요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="AI는 이미지·단어 같은 데이터를 먼저 '숫자 벡터'로 바꾼 뒤 계산한다."
      type="truefalse"
      :answer="0"
      explanation="참. 무엇이든 벡터로 바꿔야 더하고 비교하는 계산을 할 수 있어요."
    />

    <!-- 5. 연습 문제 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="좌표와 벡터: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="원점의 좌표는 (0, 0) 이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 두 축이 만나는 점이라 x도 0, y도 0."
      />
      <Quiz
        difficulty="easy"
        question="순서쌍 (5, 2) 에서 x좌표는 얼마일까요?"
        type="numeric"
        :answer="5"
        explanation="앞 숫자가 x좌표이므로 5입니다."
      />
      <Quiz
        difficulty="easy"
        question="점 (3, 4) 는 몇 사분면에 있을까요?"
        :choices="['1사분면', '2사분면', '3사분면', '4사분면']"
        :answer="0"
        explanation="x>0, y>0 이므로 오른쪽 위, 1사분면."
      />
      <Quiz
        difficulty="easy"
        question="순서쌍 (1, 6) 에서 y좌표는 얼마일까요?"
        type="numeric"
        :answer="6"
        explanation="뒤 숫자가 y좌표이므로 6입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="점 (−2, −5) 는 몇 사분면에 있을까요?"
        :choices="['1사분면', '2사분면', '3사분면', '4사분면']"
        :answer="2"
        :hints="['x도 음수, y도 음수 (−, −).', '(−, −) 는 왼쪽 아래.']"
        explanation="x<0, y<0 이므로 왼쪽 아래, 3사분면."
      />
      <Quiz
        difficulty="medium"
        question="(2, 3) 과 (3, 2) 는 같은 점이다."
        type="truefalse"
        :answer="1"
        explanation="거짓. 순서가 다르면 다른 점입니다."
      />
      <Quiz
        difficulty="medium"
        question="벡터 (4, 3) 은 원점에서 가로로 얼마만큼 가라는 뜻일까요?"
        type="numeric"
        :answer="4"
        :hints="['x성분이 가로 이동량입니다.']"
        explanation="x성분이 4이므로 가로로 4."
      />
      <Quiz
        difficulty="medium"
        question="x축 위에 있는 점은 y좌표가 항상 0이다."
        type="truefalse"
        :answer="0"
        :hints="['x축은 y=0 인 가로선입니다.']"
        explanation="참입니다. x축 위의 점은 위아래로 안 움직였으니 y=0."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="다음 중 4사분면 (+, −) 에 있는 점은?"
        :choices="['(−1, 3)', '(2, −4)', '(−2, −1)', '(3, 5)']"
        :answer="1"
        :hints="['4사분면은 x>0, y<0.']"
        explanation="(2, −4) 만 x>0, y<0 입니다."
      />
      <Quiz
        difficulty="hard"
        question="점 P가 y축 위에 있고 원점에서 위로 7만큼 떨어져 있다면, P의 x좌표는?"
        type="numeric"
        :answer="0"
        :hints="['y축 위의 점은 좌우로 안 움직였습니다.', 'y축은 x=0 인 세로선.']"
        explanation="y축 위의 점은 x좌표가 0입니다. (P는 (0, 7))"
      />
    </QuizSet>

    <NotebookCard />

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      같은 내용을 <code>notebooks/ch01_coordinates_vectors.ipynb</code> 에서 NumPy·Matplotlib로
      직접 그려보고 계산할 수 있어요. 웹에서 잡은 감을 코드로 굳혀보세요.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch1')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">1장 완료. 좌표와 벡터의 기초를 다졌습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">다음은 벡터끼리 더하고 빼는 연산입니다.</p>
      <RouterLink
        to="/ch/ch2"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터: 벡터 연산 →
      </RouterLink>
    </div>
  </article>
</template>
