<script setup lang="ts">
// Phase 0 샘플 챕터 — 공통 컴포넌트 + 미분 전용 시각화(TangentExplorer)를 모두 사용해
// "한 챕터의 완성형"을 보여준다. 실제 Phase 1~10 챕터도 이 구조를 그대로 따른다.
import { computed } from 'vue'
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { ChartView } from '@series/ui'
import TangentExplorer from '@/components/TangentExplorer.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 샘플로 다루는 함수: f(x) = x^2, 그 도함수 f'(x) = 2x
const f = (x: number) => x * x
const df = (x: number) => 2 * x

// 차트: x 마다 접선 기울기(=2x)가 어떻게 변하는지 (도함수도 하나의 함수다!)
const slopeChart = computed(() => {
  const xs = [-3, -2, -1, 0, 1, 2, 3]
  return {
    labels: xs.map((x) => `x=${x}`),
    datasets: [
      {
        label: "접선 기울기 f'(x) = 2x",
        data: xs.map((x) => df(x)),
        borderColor: '#ef4444',
        backgroundColor: '#ef4444',
        tension: 0,
      },
    ],
  }
})

function onSetComplete() {
  progress.markDone('sample')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 0 · 샘플 챕터</p>
    <h1 class="mb-4 text-3xl font-bold">접선 맛보기 📈</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      이 페이지는 학습 프로그램의 "한 챕터"가 어떻게 생겼는지 보여주는 견본입니다.
      설명 카드, 수식, 차트, 드래그(슬라이더) 시각화, 자동채점 문제가 모두 들어 있습니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      미분의 정체가 사실은 <b>"곡선에 닿는 직선(접선)의 기울기"</b>라는 걸
      슬라이더를 직접 움직이며 눈으로 이해합니다. 어려운 공식은 맨 마지막에 나옵니다. 겁먹지 마세요!
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 먼저, '기울기'가 뭐였죠?</h2>
    <p class="leading-relaxed text-slate-700">
      직선의 <b>기울기</b>는 "옆으로 간 만큼(가로 변화) 대비 위로 간 정도(세로 변화)"입니다.
      가파를수록 기울기가 큽니다.
    </p>
    <MathBlock expr="\text{기울기} = \dfrac{\text{세로 변화}}{\text{가로 변화}} = \dfrac{\Delta y}{\Delta x}" />

    <ConceptCard tone="note" title="새 기호: Δ (델타)">
      <p>
        <MathBlock inline expr="\Delta" /> 는 그리스 문자 <b>델타</b>이고, "변화량(얼마나 달라졌나)"을 뜻합니다.
      </p>
      <ul class="mt-2 list-disc pl-5 text-sm">
        <li><MathBlock inline expr="\Delta x" /> — "델타 엑스", x가 변한 양 (가로 변화)</li>
        <li><MathBlock inline expr="\Delta y" /> — "델타 와이", y가 변한 양 (세로 변화)</li>
      </ul>
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 곡선의 기울기는 점마다 다르다</h2>
    <p class="leading-relaxed text-slate-700">
      직선은 어디서나 기울기가 같지만, <b>곡선</b>은 위치마다 가파른 정도가 다릅니다.
      그래서 곡선에서는 <b>"그 점에 살짝 닿는 직선"</b>, 즉 <b>접선</b>의 기울기로 "그 지점의 기울기"를 정합니다.
      아래 곡선은 <MathBlock inline expr="f(x)=x^2" /> (<MathBlock inline expr="x" /> 를 두 번 곱한 것 — 예:
      <MathBlock inline expr="3^2 = 3\times 3 = 9" />)이에요. 빨간 점을 슬라이더로 움직여 보세요. 빨간 접선과 그 기울기 값이 실시간으로 바뀝니다.
    </p>

    <TangentExplorer
      :fn="f"
      :dfn="df"
      :xmin="-3"
      :xmax="3"
      :ymin="-1"
      :ymax="9"
      :initial="1"
      label="f(x) = x²  (접선 = 빨강, 할선 = 노랑)"
      show-secant
    />

    <ConceptCard tone="note" title="새 기호: f'(x) (에프 프라임 엑스)">
      <p>
        <MathBlock inline expr="f'(x)" /> 는 함수 <MathBlock inline expr="f" /> 의 <b>도함수</b>입니다.
        뜻은 <b>"x 지점에서의 접선의 기울기"</b>. 작은 따옴표 <MathBlock inline expr="'" /> 를 "프라임"이라고 읽습니다.
      </p>
      <ul class="mt-2 list-disc pl-5 text-sm">
        <li><b>읽는 법</b>: "에프 프라임 엑스"</li>
        <li><b>뜻</b>: x 가 아주 조금 변할 때 f 가 변하는 비율 = 그 점의 접선 기울기</li>
        <li><b>같은 뜻 다른 표기</b>: <MathBlock inline expr="\dfrac{dy}{dx}" /> (디와이 디엑스) 도 똑같이 "기울기"를 뜻합니다.</li>
      </ul>
    </ConceptCard>

    <!-- 본문 중간 미니체크 (문제 세트와 별개, 진도에 미포함) -->
    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="곡선은 위치(점)마다 접선의 기울기가 다를 수 있다."
      type="truefalse"
      :answer="0"
      explanation="맞아요. 그래서 '그 점에서의 기울기'를 접선으로 정의합니다. (0번 '참'이 정답)"
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 할선이 접선으로 — 평균에서 순간으로</h2>
    <p class="leading-relaxed text-slate-700">
      두 점을 잇는 직선을 <b>할선</b>이라 하고, 그 기울기는 두 점 사이의 <b>평균변화율</b>입니다.
      위 그림에서 간격 <MathBlock inline expr="h" /> 를 점점 줄이면 노란 할선이 빨간 접선에 딱 붙습니다.
      이렇게 <b>"두 점을 무한히 가깝게"</b> 했을 때의 기울기가 바로 그 점의 <b>순간변화율</b> =
      <MathBlock inline expr="f'(x)" /> 입니다.
    </p>

    <ConceptCard tone="tip" title="한 줄 요약">
      평균변화율(할선) 의 간격을 0 으로 보내면 → 순간변화율(접선) = 미분.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 도함수도 '함수'다</h2>
    <p class="leading-relaxed text-slate-700">
      슬라이더를 움직이며 눈치챘을 수도 있어요: <MathBlock inline expr="f(x)=x^2" /> 의 접선 기울기는
      항상 <b>x 의 2배</b>, 즉 <MathBlock inline expr="f'(x) = 2x" /> 입니다.
      이 "기울기 값"들을 모으면 그 자체로 또 하나의 함수가 됩니다.
    </p>

    <ChartView type="line" :data="slopeChart" :height="240" />

    <ConceptCard tone="warn" title="자주 하는 실수">
      <MathBlock inline expr="f'(x)" /> 는 "기울기"이지 "함숫값"이 아닙니다.
      <MathBlock inline expr="f(2)=4" /> (높이) 이지만 <MathBlock inline expr="f'(2)=4" /> (기울기) 라서
      숫자가 우연히 같을 수도, 다를 수도 있어요. 둘은 의미가 전혀 다릅니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="f(x)=x² 의 도함수가 f'(x)=2x 일 때, x=3 에서의 접선 기울기는?"
      type="numeric"
      :answer="6"
      :hints="['f\'(x)=2x 에 x=3 을 넣으세요.']"
      explanation="2 × 3 = 6. x=3 에서 곡선은 기울기 6 으로 가파릅니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">5. 드디어 공식 (정의)</h2>
    <p class="leading-relaxed text-slate-700">
      위에서 그림으로 본 "간격을 0 으로 보낸 할선의 기울기"를 식으로 쓰면 이렇습니다.
    </p>
    <MathBlock expr="f'(x) = \lim_{h \to 0} \dfrac{f(x+h) - f(x)}{h}" />

    <ConceptCard tone="note" title="새 기호 풀이 — 처음 보는 기호 두 개">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <MathBlock inline expr="\lim" /> &nbsp;
          <b>이름</b>: 극한(limit) 기호 · <b>읽는 법</b>: "리미트" ·
          <b>뜻</b>: 어떤 값에 <b>한없이 가까이 갈 때</b> 다가가는 값.
        </li>
        <li>
          <MathBlock inline expr="h \to 0" /> &nbsp;
          <b>읽는 법</b>: "에이치가 0 으로" ·
          <b>뜻</b>: 간격 <MathBlock inline expr="h" /> 를 0 에 한없이 가깝게 줄인다는 뜻
          (위 그림의 노란 슬라이더를 0 쪽으로 미는 것과 똑같습니다).
        </li>
      </ul>
      <p class="mt-2 text-sm">
        즉 <MathBlock inline expr="\dfrac{f(x+h)-f(x)}{h}" /> 는 <b>할선의 기울기(평균변화율)</b>,
        여기에 <MathBlock inline expr="\lim_{h\to 0}" /> 를 씌운 것이 <b>접선의 기울기(순간변화율)</b>입니다.
      </p>
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">6. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      세 가지 유형(객관식 · 참/거짓 · 숫자입력)과 단계별 계산을 난이도 순으로 풀어보세요.
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="접선 맛보기 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="접선은 곡선의 한 점에 살짝 닿는 직선이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 그 접선의 기울기가 바로 그 점에서의 미분값이에요."
      />
      <Quiz
        difficulty="easy"
        question="직선의 '기울기'를 가장 잘 설명한 것은?"
        :choices="['세로 변화 ÷ 가로 변화', '가로 변화 ÷ 세로 변화', '세로 변화 × 가로 변화', '두 점 사이의 거리']"
        :answer="0"
        :hints="['rise / run 을 떠올리세요.']"
        explanation="기울기 = Δy / Δx = 세로 변화 ÷ 가로 변화 입니다."
      />
      <Quiz
        difficulty="easy"
        question="f(x)=x² 일 때 f(3) (함숫값) 은 얼마인가요?"
        type="numeric"
        :answer="9"
        explanation="3² = 9. 이건 '높이(함숫값)'이고, '기울기'와는 다릅니다."
      />
      <Quiz
        difficulty="easy"
        question="곡선에서는 점마다 접선의 기울기가 다를 수 있다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 그래서 위치별로 f'(x) 값이 달라집니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="f(x)=x² 에서 x=1 과 x=3 을 잇는 할선의 기울기(평균변화율)를 단계별로 구하세요."
        :steps="[
          { lhs: 'f(1) = 1^2', answer: 1 },
          { lhs: 'f(3) = 3^2', answer: 9 },
          { lhs: '\\text{세로 변화} = f(3) - f(1)', answer: 8 },
          { lhs: '\\text{가로 변화} = 3 - 1', answer: 2 },
          { lhs: '\\text{기울기} = 8 \\div 2', answer: 4 },
        ]"
        :hints="['먼저 두 점의 함숫값 f(1), f(3) 을 구하세요.', '기울기 = 세로 변화 ÷ 가로 변화.']"
        explanation="(9 - 1) ÷ (3 - 1) = 8 ÷ 2 = 4. 이 구간의 평균 기울기는 4 입니다."
      />
      <Quiz
        difficulty="medium"
        question="f'(x)=2x 일 때, x=5 에서의 접선 기울기는?"
        type="numeric"
        :answer="10"
        :hints="['2 × 5.']"
        explanation="2 × 5 = 10."
      />
      <Quiz
        difficulty="medium"
        question="f(x)=x² 의 x=0 에서 접선 기울기는? (그래프의 맨 아래 꼭짓점)"
        :choices="['0', '1', '2', '알 수 없다']"
        :answer="0"
        :hints="['f\'(0)=2×0.', '맨 밑 꼭짓점에서 접선은 수평입니다.']"
        explanation="2 × 0 = 0. 꼭짓점에서는 접선이 평평(기울기 0)합니다."
      />
      <Quiz
        difficulty="medium"
        question="f(x)=x² 에서 x=2 부터 x=4 까지의 평균변화율은? (f(4)=16, f(2)=4)"
        type="numeric"
        :answer="6"
        :hints="['(16 - 4) ÷ (4 - 2).']"
        explanation="(16 - 4) ÷ (4 - 2) = 12 ÷ 2 = 6."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="f(x)=x² 의 x=-2 에서 접선 기울기는?"
        :choices="['-4', '4', '-2', '2']"
        :answer="0"
        :hints="['f\'(x)=2x 에 음수도 그대로 대입.', '2 × (-2).']"
        explanation="2 × (-2) = -4. 왼쪽 가지에서는 기울기가 음수(내리막)입니다."
      />
      <Quiz
        difficulty="hard"
        question="f'(x)=2x 일 때, 접선 기울기가 8 이 되는 x 값은?"
        type="numeric"
        :answer="4"
        :hints="['2x = 8 을 푸세요.', '양변을 2로 나눕니다.']"
        explanation="2x = 8 → x = 4. 기울기를 거꾸로 추적하면 위치를 찾을 수 있어요."
      />
    </QuizSet>

    <div
      v-if="progress.isDone('sample')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-2xl">🎉</div>
      <p class="font-semibold text-emerald-800">샘플 챕터 완료!</p>
      <p class="mt-1 text-sm text-emerald-700">
        왼쪽 진도 표시줄이 채워졌습니다. 실제 챕터(Phase 1~10)도 이렇게 진행됩니다.
      </p>
    </div>
  </article>
</template>
