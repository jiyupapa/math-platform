<script setup lang="ts">
// Phase 1 · 함수와 그래프, 기울기 직관
// 표준 구성: 개념 설명 + 새 기호 설명 + 인터랙티브 시각화 + 차트 + 미니체크 + 10문제 세트 + 노트북 안내
import { ref, computed } from 'vue'
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { ChartView } from '@series/ui'
import LineExplorer from '@/components/LineExplorer.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 함수 기계 인라인 데모: f(x) = 2x + 1
const machineX = ref(2)
const f = (x: number) => 2 * x + 1
const machineOut = computed(() => f(machineX.value))

// 그래프용 데이터: f(x) = 2x + 1
const graphXs = [-3, -2, -1, 0, 1, 2, 3]
const graphData = computed(() => ({
  labels: graphXs.map((x) => `${x}`),
  datasets: [
    {
      label: 'f(x) = 2x + 1',
      data: graphXs.map((x) => f(x)),
      borderColor: '#6366f1',
      backgroundColor: '#6366f1',
      tension: 0,
      pointRadius: 5,
    },
  ],
}))
const graphOptions = {
  scales: { y: { title: { display: true, text: 'f(x)' } }, x: { title: { display: true, text: 'x' } } },
  plugins: { legend: { position: 'bottom' as const } },
}

function onSetComplete() {
  progress.markDone('ch1')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 1</p>
    <h1 class="mb-4 text-3xl font-bold">함수와 그래프, 기울기 직관 📐</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      미분은 결국 <b>"기울기"</b> 이야기입니다. 그 기울기를 이해하려면 먼저 <b>함수</b>가 뭔지,
      함수를 <b>그래프</b>로 어떻게 보는지, 그리고 직선의 <b>기울기</b>가 무슨 뜻인지부터
      손으로 만져봐야 합니다. 이번 챕터에서 그 바닥을 탄탄히 다집니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>함수 <MathBlock inline expr="f(x)" /> 가 <b>"입력을 넣으면 출력이 나오는 기계"</b>임을 안다</li>
        <li>함수의 <b>그래프</b>가 점 <MathBlock inline expr="(x,\ f(x))" /> 들의 모음임을 안다</li>
        <li>일차함수 <MathBlock inline expr="y = ax + b" /> 의 <b>기울기</b>와 <b>y절편</b>을 읽는다</li>
        <li>기울기가 <b>변화율(가로 1칸당 세로 변화)</b> 임을 몸으로 느낀다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 함수 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 함수는 '입력 → 출력' 기계</h2>
    <ReviewFlag id="ch1-s1" chapter="ch1" label="1. 함수는 입력→출력 기계" />
    <p class="leading-relaxed text-slate-700">
      함수는 어렵게 생각할 것 없습니다. <b>숫자 하나를 넣으면(입력), 규칙에 따라 숫자 하나가 나오는(출력)
      기계</b>일 뿐입니다. 예를 들어 "2배 하고 1 더하기" 라는 기계는 3을 넣으면 7이 나옵니다.
      아래에서 입력 <MathBlock inline expr="x" /> 를 슬라이더로 바꿔보세요.
    </p>

    <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
      <div class="flex items-center justify-center gap-3 text-center">
        <div class="rounded-lg bg-slate-100 px-4 py-3">
          <div class="text-xs text-slate-500">입력 x</div>
          <div class="text-2xl font-bold text-slate-800">{{ machineX }}</div>
        </div>
        <div class="text-2xl text-slate-400">→</div>
        <div class="rounded-lg bg-indigo-100 px-4 py-3">
          <div class="text-xs text-indigo-500">기계: 2배 하고 +1</div>
          <div class="text-sm font-mono text-indigo-700">f(x) = 2x + 1</div>
        </div>
        <div class="text-2xl text-slate-400">→</div>
        <div class="rounded-lg bg-emerald-100 px-4 py-3">
          <div class="text-xs text-emerald-600">출력 f(x)</div>
          <div class="text-2xl font-bold text-emerald-700">{{ machineOut }}</div>
        </div>
      </div>
      <label class="mt-4 flex items-center gap-3 text-sm">
        <span class="w-24 shrink-0 text-slate-500">입력 x = <b class="text-slate-800">{{ machineX }}</b></span>
        <input v-model.number="machineX" type="range" min="-5" max="5" step="1" class="flex-1 accent-indigo-500" />
      </label>
    </div>

    <ConceptCard tone="note" title="새 기호 — f(x) (에프 엑스)">
      <p>
        <MathBlock inline expr="f(x)" /> 는 <b>"입력 x 를 함수 f 에 넣었을 때 나오는 출력"</b>을 뜻합니다.
        f 는 함수(function)의 f 이고, 괄호 안 <MathBlock inline expr="x" /> 가 입력이에요.
      </p>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li><b>읽는 법</b>: "에프 엑스"</li>
        <li><MathBlock inline expr="f(3)" /> 는 "x 자리에 3 을 넣은 결과" → <MathBlock inline expr="2 \times 3 + 1 = 7" /></li>
        <li>이름표만 다를 뿐 <MathBlock inline expr="y = 2x+1" /> 과 <MathBlock inline expr="f(x)=2x+1" /> 은 같은 말이에요.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="f(x)=2x+1 에 x=0 을 넣으면 f(0)=1 이다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 2×0+1 = 1. 입력이 0이어도 규칙은 그대로 적용됩니다."
    />

    <!-- 2. 그래프 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 그래프 — 함수를 그림으로 보기</h2>
    <ReviewFlag id="ch1-s2" chapter="ch1" label="2. 그래프 — 함수를 그림으로 보기" />
    <p class="leading-relaxed text-slate-700">
      함수의 <b>그래프</b>는 입력마다 나온 결과를 좌표평면에 점으로 찍어 이은 것입니다.
      즉 <b>점 <MathBlock inline expr="(x,\ f(x))" /> 들의 모음</b>이에요.
      <MathBlock inline expr="f(x)=2x+1" /> 은 아래처럼 <b>곧은 직선</b>이 됩니다.
    </p>

    <ChartView type="line" :data="graphData" :options="graphOptions" :height="300" />

    <ConceptCard tone="note" title="새 용어 — 그래프 / 좌표평면">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>좌표평면</b>: 가로축(x)과 세로축(y)이 직각으로 만난 평면. 위치를 <MathBlock inline expr="(x, y)" /> 로 표시해요.</li>
        <li><b>그래프</b>: 함수가 만드는 점들을 이은 선. <MathBlock inline expr="x" /> 를 정하면 높이 <MathBlock inline expr="f(x)" /> 가 정해지죠.</li>
        <li>일차함수(직선)의 그래프는 항상 <b>곧은 직선</b>. 그래서 "일차"라고 불러요.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="f(x)=2x+1 의 그래프는 어떤 모양일까요?"
      :choices="['곧은 직선', '휘어진 곡선(포물선)', '동그란 원', '점 하나']"
      :answer="0"
      :hints="['위 차트를 보세요. 점들이 일직선으로 이어집니다.']"
      explanation="일차함수라서 그래프는 곧은 직선입니다."
    />

    <!-- 3. 일차함수와 기울기 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 일차함수와 기울기</h2>
    <ReviewFlag id="ch1-s3" chapter="ch1" label="3. 일차함수와 기울기" />
    <p class="leading-relaxed text-slate-700">
      직선을 나타내는 식 <MathBlock inline expr="y = ax + b" /> 에서 <MathBlock inline expr="a" /> 는
      <b>기울기</b>(얼마나 가파른가), <MathBlock inline expr="b" /> 는 <b>y절편</b>(직선이 세로축과 만나는 높이)입니다.
      아래 슬라이더로 <MathBlock inline expr="a" /> 와 <MathBlock inline expr="b" /> 를 바꿔보며 직선이 어떻게 변하는지 보세요.
    </p>

    <LineExplorer :init-a="1" :init-b="1" />

    <ConceptCard tone="note" title="새 용어 — 일차함수 y = ax + b">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>기울기 <MathBlock inline expr="a" /></b>: 가로로 1칸 갈 때 세로로 <MathBlock inline expr="a" /> 칸 오르내림.
          클수록 가파르고, <b>음수면 내리막</b>입니다.
        </li>
        <li>
          <b>y절편 <MathBlock inline expr="b" /></b>: <MathBlock inline expr="x=0" /> 일 때의 높이. 직선이 <b>세로축과 만나는 점</b>이에요.
        </li>
        <li>
          <b>왜 중요할까?</b> 미분은 "곡선의 이 지점에서의 기울기"를 구하는 일인데,
          그 기울기가 바로 여기서 배우는 직선 기울기 <MathBlock inline expr="a" /> 와 같은 개념입니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="일차함수 y = 2x + 1 의 기울기는 얼마일까요?"
      type="numeric"
      :answer="2"
      :hints="['y = ax + b 에서 x 앞의 수가 기울기 a 입니다.']"
      explanation="x 앞의 계수 2 가 기울기입니다. (b=1 은 y절편)"
    />

    <!-- 4. 기울기 = 변화율 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 기울기 = 변화율 (가로 1칸당 세로 변화)</h2>
    <ReviewFlag id="ch1-s4" chapter="ch1" label="4. 기울기 = 변화율" />
    <p class="leading-relaxed text-slate-700">
      기울기는 <b>"세로가 변한 양 ÷ 가로가 변한 양"</b> 으로 구합니다. 이걸 <b>변화율</b>이라고 해요.
      두 점만 알면 계산할 수 있습니다.
    </p>
    <MathBlock expr="\text{기울기} = \dfrac{\Delta y}{\Delta x} = \dfrac{\text{세로 변화}}{\text{가로 변화}}" />

    <ConceptCard tone="note" title="기호 복습 — Δ (델타)">
      <MathBlock inline expr="\Delta" /> 는 "변화량". <MathBlock inline expr="\Delta y" /> 는 세로가 변한 양,
      <MathBlock inline expr="\Delta x" /> 는 가로가 변한 양입니다. 둘을 나누면 "가로 1칸당 세로 변화" = 기울기가 나와요.
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      아래 문제로 직접 계산해 봅시다. 두 점 <MathBlock inline expr="(0, 1)" /> 과
      <MathBlock inline expr="(2, 5)" /> 를 지나는 직선의 기울기를 <b>단계별로</b> 구해보세요.
    </p>

    <StepQuiz
      difficulty="medium"
      question="두 점 (0, 1) 과 (2, 5) 를 지나는 직선의 기울기를 단계별로 구하세요."
      :steps="[
        { lhs: '\\text{세로 변화} = 5 - 1', answer: 4 },
        { lhs: '\\text{가로 변화} = 2 - 0', answer: 2 },
        { lhs: '\\text{기울기} = 4 \\div 2', answer: 2 },
      ]"
      :hints="['세로 변화 = 두 점의 y 차이.', '가로 변화 = 두 점의 x 차이.', '기울기 = 세로 변화 ÷ 가로 변화.']"
      explanation="(5 − 1) ÷ (2 − 0) = 4 ÷ 2 = 2. 이 직선은 가로 1칸당 세로로 2칸 오릅니다."
    />

    <!-- 5. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 기울기가 AI 학습의 나침반</h2>
    <ReviewFlag id="ch1-ai" chapter="ch1" label="🤖 기울기가 AI 학습의 나침반" />
    <p class="leading-relaxed text-slate-700">
      방금 배운 "기울기"가 사실 <b>AI가 학습하는 방식의 핵심</b>이에요. AI 모델은 얼마나 틀렸는지를
      <b>손실(loss)</b> 이라는 숫자로 재고, 그 손실을 <b>곡선</b>으로 그립니다. 목표는 이 곡선의
      <b>가장 낮은 골짜기</b>로 내려가는 것 — 그때 오차가 가장 작으니까요.
    </p>

    <ConceptCard tone="goal" title="경사하강법 미리보기 — 기울기를 보고 내려간다">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>손실곡선(loss curve)</b>: 가로축은 모델의 설정값, 세로축은 오차(손실). 골짜기가 정답에 가까운 곳.
        </li>
        <li>
          <b>기울기 = 내려갈 방향</b>: 지금 서 있는 지점의 기울기가 양수면 왼쪽으로,
          음수면 오른쪽으로 한 걸음. 이렇게 <b>기울기의 반대 방향</b>으로 조금씩 내려가는 게
          <b>경사하강법(gradient descent)</b> 입니다. (Phase 9 에서 본격적으로!)
        </li>
        <li>
          <b>그래서 미분이 필요하다</b>: "지금 지점의 기울기"를 구하는 도구가 바로 미분이에요.
          직선의 기울기(이번 챕터) → 곡선의 순간 기울기(다음 챕터부터)로 확장됩니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="경사하강법은 손실곡선의 '기울기'를 보고 내려갈 방향을 정한다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 기울기(미분값)가 방향을 알려주는 나침반 역할을 해요."
    />

    <!-- 6. 연습 문제 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="함수와 기울기 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="함수 f(x) 는 x 를 넣으면 정해진 값 하나가 나오는 규칙이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 입력 하나에 출력 하나 — 그게 함수예요."
      />
      <Quiz
        difficulty="easy"
        question="f(x) = 2x + 1 일 때 f(3) 은 얼마인가요?"
        type="numeric"
        :answer="7"
        :hints="['x 자리에 3 을 넣으세요.', '2×3 + 1.']"
        explanation="2×3 + 1 = 7."
      />
      <Quiz
        difficulty="easy"
        question="일차함수 y = ax + b 에서 'a' 가 뜻하는 것은?"
        :choices="['기울기', 'y절편', 'x좌표', '원점']"
        :answer="0"
        explanation="x 앞의 a 가 기울기(가파른 정도)입니다."
      />
      <Quiz
        difficulty="easy"
        question="직선 y = 3x − 2 의 y절편은 얼마인가요?"
        type="numeric"
        :answer="-2"
        :hints="['y = ax + b 에서 b 가 y절편.', 'x=0 을 넣어보세요.']"
        explanation="b = −2. x=0 이면 y = −2 이므로 세로축과 (0, −2) 에서 만납니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="두 점 (1, 2) 와 (3, 8) 을 지나는 직선의 기울기를 단계별로 구하세요."
        :steps="[
          { lhs: '\\text{세로 변화} = 8 - 2', answer: 6 },
          { lhs: '\\text{가로 변화} = 3 - 1', answer: 2 },
          { lhs: '\\text{기울기} = 6 \\div 2', answer: 3 },
        ]"
        :hints="['세로 변화 = y 값들의 차이.', '기울기 = 세로 변화 ÷ 가로 변화.']"
        explanation="(8 − 2) ÷ (3 − 1) = 6 ÷ 2 = 3."
      />
      <Quiz
        difficulty="medium"
        question="기울기가 5 인 직선에서 x 가 1 늘어나면 y 는 얼마나 늘어날까요?"
        type="numeric"
        :answer="5"
        :hints="['기울기 = 가로 1칸당 세로 변화.']"
        explanation="기울기 5 는 '가로 1칸당 세로 5칸'이라는 뜻이므로 y 는 5 증가합니다."
      />
      <Quiz
        difficulty="medium"
        question="기울기가 음수인 직선의 모양은?"
        :choices="['오른쪽으로 갈수록 올라간다', '오른쪽으로 갈수록 내려간다', '완전히 수평이다', '완전히 수직이다']"
        :answer="1"
        :hints="['음수 기울기 = 세로가 줄어든다.']"
        explanation="기울기가 음수면 오른쪽으로 갈수록 내려가는 내리막입니다."
      />
      <Quiz
        difficulty="medium"
        question="일차함수(직선)는 어느 지점에서 재든 기울기가 항상 같다."
        type="truefalse"
        :answer="0"
        :hints="['직선은 어디서나 가파른 정도가 똑같습니다.']"
        explanation="참입니다. 그래서 직선은 '기울기 하나'로 설명돼요. 곡선은 점마다 달라 미분이 필요하죠."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="두 점 (2, 3) 과 (5, 3) 을 지나는 직선의 기울기는?"
        type="numeric"
        :answer="0"
        :hints="['세로 변화 = 3 − 3 = 0.', '세로가 안 변하면 기울기는?']"
        explanation="세로 변화가 0 이므로 기울기 = 0 ÷ 3 = 0. 완전히 수평인 직선입니다."
      />
      <Quiz
        difficulty="hard"
        question="y = ax + b 에서 b 만 바꾸면 직선은 어떻게 될까요?"
        :choices="['기울기가 바뀐다', '기울기는 그대로, 위아래로 평행이동한다', '직선이 회전한다', '아무 변화 없다']"
        :answer="1"
        :hints="['b 는 y절편(높이)만 바꿉니다.', '위 LineExplorer 에서 b 슬라이더를 움직여 보세요.']"
        explanation="b 는 y절편이라 직선을 위아래로 평행이동시키고, 기울기 a 는 그대로입니다."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      같은 내용을 <code>notebooks/ch01_functions_slope.ipynb</code> 에서 NumPy·Matplotlib·SymPy로
      직접 그려보고 계산할 수 있어요. 특히 SymPy로 일차함수를 미분하면 기울기 <MathBlock inline expr="a" /> 가
      그대로 나온다는 걸 확인해 보세요 — 다음 챕터의 예고편입니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch1')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 1 완료. 기울기의 감각을 잡았습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 "직선의 기울기"를 "곡선의 순간 기울기"로 넓히는 열쇠 — 변화율과 극한입니다.
      </p>
      <RouterLink
        to="/ch/ch2"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 변화율과 극한 →
      </RouterLink>
    </div>
  </article>
</template>
