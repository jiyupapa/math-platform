<script setup lang="ts">
// Phase 2 · 변화율과 극한 (평균변화율 → 순간변화율)
import { computed } from 'vue'
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import TangentExplorer from '@/components/TangentExplorer.vue'
import LimitZoom from '@/components/LimitZoom.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

const a = 1
const f = (x: number) => x * x
const df = (x: number) => 2 * x

// 극한 표: (f(1+h) - f(1)) / h = 2 + h → h 를 0 으로 보내면 2
const rate = (h: number) => (f(a + h) - f(a)) / h
const hMags = [1, 0.5, 0.1, 0.01, 0.001]
const limitRows = computed(() =>
  hMags.map((m) => ({
    m,
    right: rate(m), // h = +m (오른쪽에서 접근)
    left: rate(-m), // h = -m (왼쪽에서 접근)
  })),
)
const fmt = (n: number) => Number(n.toFixed(4)).toString()

function onSetComplete() {
  progress.markDone('ch2')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 2</p>
    <h1 class="mb-4 text-3xl font-bold">변화율과 극한 🎯</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      직선의 기울기는 어디서나 같았죠(Phase 1). 그런데 <b>곡선</b>은 위치마다 가팔라지는 정도가
      다릅니다. "바로 이 순간, 이 점에서 얼마나 빨리 변하나?"를 재려면 <b>극한(limit)</b>이라는
      새 도구가 필요합니다. 이번 챕터가 미분의 진짜 출발점이에요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>평균변화율</b>(구간의 기울기)과 <b>순간변화율</b>(한 점의 기울기)을 구분한다</li>
        <li><b>극한</b> <MathBlock inline expr="\lim_{h\to 0}" /> 이 "한없이 가까이 갈 때 다가가는 값"임을 이해한다</li>
        <li>간격 <MathBlock inline expr="h" /> 를 0 으로 보내면 <b>평균변화율 → 순간변화율</b>이 됨을 숫자·그림으로 확인한다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 평균변화율 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 평균변화율 — 구간의 기울기</h2>
    <ReviewFlag id="ch2-s1" chapter="ch2" label="1. 평균변화율 — 구간의 기울기" />
    <p class="leading-relaxed text-slate-700">
      두 점 사이의 <b>평균변화율</b>은 그 두 점을 잇는 직선(<b>할선</b>)의 기울기입니다.
      Phase 1 의 "세로 변화 ÷ 가로 변화"와 똑같아요. 예를 들어 <MathBlock inline expr="f(x)=x^2" /> 에서
      <MathBlock inline expr="x=1" /> 부터 <MathBlock inline expr="x=3" /> 까지 (여기서
      <MathBlock inline expr="f(3)=3^2=9" />, <MathBlock inline expr="f(1)=1^2=1" />):
    </p>
    <MathBlock expr="\dfrac{f(3) - f(1)}{3 - 1} = \dfrac{9 - 1}{2} = 4" />

    <ConceptCard tone="note" title="새 용어 — 평균변화율 / 차분몫">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <b>평균변화율(average rate of change)</b>: 구간 전체에서 "평균적으로" 얼마나 변했나.
          곧 두 점을 잇는 <b>할선의 기울기</b>입니다.
        </li>
        <li>
          간격을 <MathBlock inline expr="h" /> 로 쓰면 <MathBlock inline expr="x" /> 부터
          <MathBlock inline expr="x+h" /> 까지의 평균변화율은
          <MathBlock inline expr="\dfrac{f(x+h)-f(x)}{h}" /> — 이 식을 <b>차분몫</b>이라고 부릅니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="f(x)=x² 에서 x=1 부터 x=2 까지의 평균변화율은? (f(2)=4, f(1)=1)"
      type="numeric"
      :answer="3"
      :hints="['(f(2) − f(1)) ÷ (2 − 1).', '(4 − 1) ÷ 1.']"
      explanation="(4 − 1) ÷ (2 − 1) = 3. 이 구간의 할선 기울기는 3 입니다."
    />

    <!-- 2. 순간변화율의 딜레마 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. "한 점의 기울기"라는 문제</h2>
    <ReviewFlag id="ch2-s2" chapter="ch2" label="2. 한 점의 기울기라는 문제" />
    <p class="leading-relaxed text-slate-700">
      그런데 "<b>딱 한 점</b>에서의 기울기"를 구하려 하면 곤란해집니다. 두 점이 같은 점이 되면
      가로 변화 <MathBlock inline expr="\Delta x" /> 도, 세로 변화 <MathBlock inline expr="\Delta y" /> 도 모두 0 —
      <MathBlock inline expr="\tfrac{0}{0}" /> 은 계산할 수 없죠.
    </p>

    <ConceptCard tone="warn" title="0 ÷ 0 은 정의되지 않는다">
      한 점에 두 점을 그냥 겹치면 <MathBlock inline expr="\dfrac{0}{0}" /> 이 되어 답이 없습니다.
      그래서 "겹치기" 대신 <b>"한없이 가까이 보내기"</b>라는 우회로가 필요해요. 그게 극한입니다.
    </ConceptCard>

    <ConceptCard tone="note" title="새 용어 — 순간변화율 / 접선">
      <b>순간변화율(instantaneous rate of change)</b>: 바로 그 <b>한 점</b>에서의 변화율.
      기하학적으로는 그 점 <b>접선</b>(곡선에 그 점에서 살짝 닿기만 하는 직선 — 할선의 두 점을 한없이
      가까이 붙였을 때의 극한이에요)<b>의 기울기</b>이고, 이것이 곧 <b>미분값</b>입니다.
    </ConceptCard>

    <!-- 3. 극한 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 극한 — 한없이 가까이 가면?</h2>
    <ReviewFlag id="ch2-s3" chapter="ch2" label="3. 극한 — 한없이 가까이 가면?" />
    <p class="leading-relaxed text-slate-700">
      직접 0 을 넣는 대신, 간격 <MathBlock inline expr="h" /> 를 <b>점점 0 에 가깝게</b> 하면서
      평균변화율이 어떤 값에 <b>다가가는지</b> 봅니다. <MathBlock inline expr="f(x)=x^2" /> 의
      <MathBlock inline expr="x=1" /> 에서 차분몫을 정리하면 신기하게도 딱 떨어져요:
    </p>
    <MathBlock expr="\dfrac{f(1+h)-f(1)}{h} = \dfrac{(1+h)^2 - 1}{h}" />
    <p class="leading-relaxed text-slate-700">
      여기서 <MathBlock inline expr="(1+h)^2" /> 은 <MathBlock inline expr="(1+h)\times(1+h)" /> 를 펼친 것.
      펼치기는 중학교의 <b>분배법칙</b> 그대로예요 — 앞 괄호의 각 항(1과 h)을 뒤 괄호의 각 항에 곱해 전부 더합니다:
    </p>
    <MathBlock expr="(1+h)(1+h) = 1\cdot 1 + 1\cdot h + h\cdot 1 + h\cdot h = 1 + 2h + h^2" />
    <p class="leading-relaxed text-slate-700">
      가운데 <MathBlock inline expr="1\cdot h" /> 와 <MathBlock inline expr="h\cdot 1" /> 은 같은 값이라 합치면
      <MathBlock inline expr="2h" /> — 그래서 <MathBlock inline expr="(1+h)^2 = 1 + 2h + h^2" /> 입니다.
      이걸 넣고 <MathBlock inline expr="-1" /> 로 지우면
      <MathBlock inline expr="1" /> 끼리 사라지고, 남은 항을 <MathBlock inline expr="h" /> 로 나눌 수 있어요:
    </p>
    <MathBlock expr="= \dfrac{1 + 2h + h^2 - 1}{h} = \dfrac{2h + h^2}{h} = 2 + h" />

    <p class="leading-relaxed text-slate-700">
      즉 평균변화율이 <MathBlock inline expr="2 + h" /> 예요. <MathBlock inline expr="h" /> 를 양쪽에서
      0 으로 보내면 표처럼 <b>2</b> 에 수렴합니다.
    </p>

    <!-- 극한 표 -->
    <div class="my-5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
      <table class="w-full text-center text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500">
            <th class="py-2 font-medium">간격 크기 |h|</th>
            <th class="py-2 font-medium text-amber-600">왼쪽에서 (h &lt; 0)</th>
            <th class="py-2 font-medium text-emerald-600">오른쪽에서 (h &gt; 0)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in limitRows" :key="row.m" class="border-b border-slate-100">
            <td class="py-1.5 text-slate-500">{{ row.m }}</td>
            <td class="py-1.5 font-mono text-amber-700">{{ fmt(row.left) }}</td>
            <td class="py-1.5 font-mono text-emerald-700">{{ fmt(row.right) }}</td>
          </tr>
          <tr class="font-bold text-indigo-700">
            <td class="py-2">h → 0</td>
            <td class="py-2" colspan="2">양쪽 모두 → 2 로 수렴</td>
          </tr>
        </tbody>
      </table>
    </div>

    <MathBlock expr="\lim_{h \to 0} \dfrac{f(1+h)-f(1)}{h} = \lim_{h \to 0} (2 + h) = 2" />

    <ConceptCard tone="note" title="새 기호 — 극한 lim 과 수렴">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <MathBlock inline expr="\lim_{h\to 0} (\cdots)" /> &nbsp; <b>읽는 법</b>: "리미트 에이치가 0 으로" ·
          <b>뜻</b>: <MathBlock inline expr="h" /> 를 0 에 <b>한없이 가깝게</b> 했을 때 식이 <b>다가가는 값</b>.
          (0 을 실제로 대입하는 게 아니라 "가까이 갈 때의 목적지")
        </li>
        <li>
          <b>수렴(converge)</b>: 어떤 값에 점점 가까워져 그 값으로 정해지는 것.
          위 표에서 양쪽 모두 <b>2</b> 로 수렴하죠.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="위 식처럼 평균변화율이 (2 + h) 일 때, h 를 0 으로 보낸 극한값은?"
      type="numeric"
      :answer="2"
      :hints="['h 가 0 에 가까워지면 2 + h 는?', '2 + (아주 작은 수) → 2.']"
      explanation="lim(2 + h) = 2. 이게 x=1 에서의 순간변화율입니다."
    />

    <!-- 4. 할선이 접선으로 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 할선이 접선으로 (직접 움직여 보기)</h2>
    <ReviewFlag id="ch2-s4" chapter="ch2" label="4. 할선이 접선으로" />
    <p class="leading-relaxed text-slate-700">
      아래에서 간격 <MathBlock inline expr="h" /> 슬라이더를 줄여보세요. <b>노란 할선</b>(평균변화율)이
      <b>빨간 접선</b>(순간변화율)에 점점 붙습니다. 노란 값 <MathBlock inline expr="2 + h" /> 가
      빨간 값 <b>2</b> 로 다가가는 걸 눈으로 확인하세요.
    </p>

    <TangentExplorer
      :fn="f"
      :dfn="df"
      :xmin="-3"
      :xmax="3"
      :ymin="-1"
      :ymax="9"
      :initial="1"
      label="f(x) = x²  ·  x=1 에서 (접선=빨강, 할선=노랑)"
      show-secant
    />

    <StepQuiz
      difficulty="medium"
      question="f(x)=x² 에서 x=1, 간격 h=0.1 일 때의 평균변화율을 단계별로 구하세요."
      :steps="[
        { lhs: 'f(1) = 1^2', answer: 1 },
        { lhs: 'f(1.1) = 1.1^2', answer: 1.21, tolerance: 0.0001 },
        { lhs: 'f(1.1) - f(1)', answer: 0.21, tolerance: 0.0001 },
        { lhs: '0.21 \\div 0.1', answer: 2.1, tolerance: 0.001 },
      ]"
      :hints="['먼저 두 함숫값 f(1), f(1.1) 을 구하세요.', '평균변화율 = (세로 변화) ÷ (가로 변화 h).']"
      explanation="2.1 = 2 + 0.1 이죠? h 를 더 줄이면 2 에 더 가까워집니다 — 극한은 2."
    />

    <!-- 5. 극한 줌인 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 확대하면 곡선도 직선이다</h2>
    <ReviewFlag id="ch2-s5" chapter="ch2" label="5. 확대하면 곡선도 직선이다" />
    <p class="leading-relaxed text-slate-700">
      순간변화율이 왜 "접선의 기울기"인지 또 다른 각도로 봅시다. 한 점 주위를 <b>점점 확대</b>하면
      곡선이 <b>거의 직선</b>처럼 보입니다(국소 선형성). 그 직선이 바로 접선이에요.
    </p>

    <LimitZoom :fn="f" :dfn="df" :a="1" label="f(x) = x²" />

    <p class="mt-2 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="곡선의 한 점을 아주 크게 확대하면 그 부분은 거의 직선처럼 보인다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 이 '국소 선형성' 때문에 한 점의 기울기를 접선으로 정의할 수 있어요."
    />

    <!-- 6. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 순간변화율이 AI가 쓰는 '기울기'</h2>
    <ReviewFlag id="ch2-ai" chapter="ch2" label="🤖 순간변화율이 AI가 쓰는 기울기" />
    <p class="leading-relaxed text-slate-700">
      AI가 학습할 때 필요한 건 손실곡선의 "<b>지금 이 점</b>에서 얼마나 가파른가", 즉
      <b>순간변화율</b>입니다. 구간 평균이 아니라 <b>바로 그 지점</b>의 기울기라야 "다음 한 걸음을
      어느 방향으로 얼마나" 정할 수 있거든요.
    </p>

    <ConceptCard tone="ai" title="극한 → 미분 → 경사하강">
      <ul class="list-disc space-y-2 pl-5">
        <li><b>극한</b>으로 "한 점의 기울기"를 정의하고 → 이것이 <b>미분(순간변화율)</b>.</li>
        <li>손실곡선 위 현재 지점의 미분값(기울기)이 <b>내려갈 방향</b>을 알려줍니다.</li>
        <li>그 방향으로 조금씩 이동 = <b>경사하강법</b>(Phase 9). 미분이 그 나침반이에요.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="경사하강법은 손실곡선의 '한 점에서의 순간 기울기(미분값)'를 이용한다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 구간 평균이 아니라 지금 그 지점의 순간변화율이 필요해요."
    />

    <!-- 7. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">6. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="변화율과 극한 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="평균변화율은 두 점을 잇는 '할선'의 기울기와 같다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 구간의 평균변화율 = 그 두 점을 잇는 할선의 기울기."
      />
      <Quiz
        difficulty="easy"
        question="f(x)=x² 에서 x=1 부터 x=3 까지의 평균변화율은? (f(3)=9, f(1)=1)"
        type="numeric"
        :answer="4"
        :hints="['(9 − 1) ÷ (3 − 1).']"
        explanation="(9 − 1) ÷ (3 − 1) = 8 ÷ 2 = 4."
      />
      <Quiz
        difficulty="easy"
        question="lim (h→0) 의 뜻으로 가장 알맞은 것은?"
        :choices="[
          'h 에 정확히 0 을 대입한 값',
          'h 를 0 에 한없이 가깝게 보냈을 때 다가가는 값',
          'h 가 가장 커질 때의 값',
          'h 를 1 로 두었을 때의 값',
        ]"
        :answer="1"
        :hints="['극한은 「대입」이 아니라 「가까이 갈 때의 목적지」.']"
        explanation="극한은 h 를 0 에 한없이 가깝게 할 때 식이 다가가는 값입니다."
      />
      <Quiz
        difficulty="easy"
        question="순간변화율은 그 점에서의 접선의 기울기와 같다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 순간변화율 = 접선 기울기 = 미분값."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="f(x)=x² 에서 x=2, 간격 h=0.1 일 때의 평균변화율을 단계별로 구하세요."
        :steps="[
          { lhs: 'f(2) = 2^2', answer: 4 },
          { lhs: 'f(2.1) = 2.1^2', answer: 4.41, tolerance: 0.0001 },
          { lhs: 'f(2.1) - f(2)', answer: 0.41, tolerance: 0.0001 },
          { lhs: '0.41 \\div 0.1', answer: 4.1, tolerance: 0.001 },
        ]"
        :hints="['평균변화율 = (f(2.1) − f(2)) ÷ 0.1.']"
        explanation="4.1 = 4 + 0.1. h 를 줄이면 4 (= x=2 의 순간변화율)에 가까워집니다."
      />
      <Quiz
        difficulty="medium"
        question="평균변화율이 (2 + h) 로 정리됐다. lim (h→0)(2 + h) 의 값은?"
        type="numeric"
        :answer="2"
        :hints="['아주 작은 h 를 더하면 2 에 거의 같아집니다.']"
        explanation="lim(2 + h) = 2. x=1 에서 x² 의 순간변화율입니다."
      />
      <Quiz
        difficulty="medium"
        question="h 를 점점 0 에 가깝게 하면 평균변화율(할선 기울기)은 무엇에 다가가나요?"
        :choices="['0 에 다가간다', '순간변화율(접선 기울기)에 다가간다', '무한대로 커진다', '변하지 않는다']"
        :answer="1"
        :hints="['할선이 접선에 붙는 그림을 떠올리세요.']"
        explanation="평균변화율 → 순간변화율(그 점 접선의 기울기)로 수렴합니다."
      />
      <Quiz
        difficulty="medium"
        question="f(x)=x² 에서 x=2 부터 x=2.01 까지의 평균변화율은? (f(2.01)=4.0401)"
        type="numeric"
        :answer="4.01"
        :tolerance="0.001"
        :hints="['(4.0401 − 4) ÷ 0.01.', '0.0401 ÷ 0.01.']"
        explanation="0.0401 ÷ 0.01 = 4.01. x=2 의 순간변화율 4 에 아주 가깝죠."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="f(x)=x² 의 x=3 에서의 순간변화율, 즉 lim(h→0) (f(3+h)−f(3))/h 의 값은?"
        type="numeric"
        :answer="6"
        :hints="['(3+h)² − 9 = 6h + h². 이걸 h 로 나누면 6 + h.', 'h→0 이면 6 + h → ?']"
        explanation="(6h + h²)/h = 6 + h → 6. (= 2×3, 즉 f'(3))"
      />
      <Quiz
        difficulty="hard"
        question="한 점에서 Δx=0 을 그냥 대입하면 0/0 이라 기울기를 못 구한다. 그래서 극한을 쓴다."
        type="truefalse"
        :answer="0"
        :hints="['두 점을 겹치면 분모·분자 모두 0.']"
        explanation="참입니다. 0/0 을 피하려고 '겹치기' 대신 '한없이 가까이 보내는' 극한을 씁니다."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch02_limits.ipynb</code> 에서 h 를 줄여가며 평균변화율이 수렴하는 표를 직접 찍어보고,
      SymPy 의 <code>sp.limit(...)</code> 로 극한값을 기호로 계산해 검산할 수 있어요.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch2')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 2 완료. 극한으로 '순간의 기울기'를 잡았습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 이 극한을 공식으로 굳힌 <b>미분계수와 도함수의 정의</b>입니다.
      </p>
      <RouterLink
        to="/ch/ch3"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 미분계수와 도함수의 정의 →
      </RouterLink>
    </div>
  </article>
</template>
