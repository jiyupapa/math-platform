<script setup lang="ts">
// Phase 0 샘플 챕터 — 5종 공통 컴포넌트를 모두 사용해 "한 챕터의 완성형"을 보여준다.
// 실제 Phase 1~8 챕터도 이 구조를 그대로 따른다.
import { ref, computed } from 'vue'
import ConceptCard from '@/components/ConceptCard.vue'
import MathBlock from '@/components/MathBlock.vue'
import ChartView from '@/components/ChartView.vue'
import VectorCanvas, { type Vec } from '@/components/VectorCanvas.vue'
import Quiz from '@/components/Quiz.vue'
import StepQuiz from '@/components/StepQuiz.vue'
import QuizSet from '@/components/QuizSet.vue'
import NotebookCard from '@/components/NotebookCard.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 드래그 가능한 벡터 하나
const vecs = ref<Vec[]>([{ x: 3, y: 2, color: '#6366f1', label: 'a', draggable: true }])
const v = computed(() => vecs.value[0])
const length = computed(() => Math.sqrt(v.value.x ** 2 + v.value.y ** 2))

// 막대 차트: 벡터 성분 시각화 (드래그하면 실시간 갱신)
const chartData = computed(() => ({
  labels: ['x 성분', 'y 성분'],
  datasets: [
    {
      label: '벡터 a 의 성분',
      data: [v.value.x, v.value.y],
      backgroundColor: ['#818cf8', '#34d399'],
      borderRadius: 6,
    },
  ],
}))

function onSetComplete() {
  progress.markDone('sample')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">워밍업 · 5분 몸풀기</p>
    <h1 class="mb-4 text-3xl font-bold">벡터 맛보기</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      본격적인 학습 전 몸풀기입니다. 앞으로 모든 챕터가 이 페이지처럼 진행돼요 —
      설명 카드를 읽고, 그림을 직접 만져 보고, 문제를 풀면 진도가 채워집니다.
      막히면 <b>힌트</b>가 있고, 두 번 틀리면 <b>해설</b>도 열 수 있으니 부담 없이 시작하세요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      벡터가 그저 <b>"방향과 크기를 가진 화살표"</b>라는 걸 손으로 만져보며 이해합니다.
      공식은 맨 마지막에 다룹니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 벡터는 화살표예요</h2>
    <p class="leading-relaxed text-slate-700">
      벡터는 원점 <MathBlock inline expr="(0,0)" /> 에서 어떤 점까지 그은 화살표입니다.
      아래 그림에서 <b style="color: #6366f1">파란 점</b>을 마우스로 끌어보세요. 화살표가 따라옵니다.
    </p>

    <VectorCanvas v-model="vecs" :range="5" />

    <ConceptCard tone="note" title="새 기호: 글자 위의 화살표">
      <p>
        <MathBlock inline expr="\vec{a}" /> 처럼 <b>글자 위에 작은 화살표</b>를 그리면
        "이건 그냥 숫자가 아니라 <b>벡터</b>다"라는 표시입니다.
      </p>
      <ul class="mt-2 list-disc pl-5 text-sm">
        <li><b>이름</b>: 벡터 기호</li>
        <li><b>읽는 법</b>: "벡터 에이" (<MathBlock inline expr="\vec{a}" />)</li>
        <li><b>뜻</b>: 방향과 크기를 함께 가진 양 (= 화살표)</li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="tip" title="지금 보이는 벡터">
      현재 벡터 <MathBlock inline expr="\vec{a}" /> 는
      <b>({{ v.x }}, {{ v.y }})</b> 이고, 길이(크기)는
      <b>{{ length.toFixed(2) }}</b> 입니다. 점을 옮기면 숫자도 같이 바뀌어요.
    </ConceptCard>

    <!-- 본문 중간 미니체크 (문제 세트와 별개, 진도에 미포함) -->
    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="벡터는 '방향'과 '크기'를 함께 가진 양이다."
      type="truefalse"
      :answer="0"
      explanation="맞아요. 그래서 화살표로 그립니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 성분을 막대로 보면</h2>
    <p class="leading-relaxed text-slate-700">
      벡터의 <MathBlock inline expr="x" />, <MathBlock inline expr="y" /> 값을 막대 높이로 나타낸 것입니다.
      위에서 점을 끌면 이 막대도 실시간으로 바뀝니다.
    </p>

    <ChartView type="bar" :data="chartData" :height="240" />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="벡터 (2, 0) 을 막대로 그리면 어느 쪽이 더 높을까요?"
      :choices="['x 성분 막대', 'y 성분 막대', '둘이 똑같다']"
      :answer="0"
      explanation="x 성분은 2, y 성분은 0이므로 x 막대가 더 높습니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 드디어 공식</h2>
    <p class="leading-relaxed text-slate-700">
      벡터의 길이는 <b>피타고라스 정리</b>로 구합니다. 직각삼각형에서
      <b>빗변² = 가로² + 세로²</b> 였죠 — 벡터의 길이가 바로 그 빗변이에요.
    </p>
    <MathBlock expr="\lVert \vec{a} \rVert = \sqrt{x^2 + y^2}" />
    <p class="mt-1 text-sm text-slate-500">
      <b>제곱(²)</b> = 같은 수를 두 번 곱하기 (예: <MathBlock inline expr="3^2 = 3\times3 = 9" />).
    </p>

    <ConceptCard tone="note" title="새 기호 풀이 — 처음 보는 기호 두 개">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <MathBlock inline expr="\lVert \vec{a} \rVert" /> &nbsp;
          <b>이름</b>: 노름(norm) 기호 · <b>읽는 법</b>: "벡터 에이의 노름" 또는 "에이의 길이" ·
          <b>뜻</b>: 벡터의 <b>길이(크기)</b>. 양쪽 <b>이중 막대</b>로 감쌉니다.
          (절댓값 <MathBlock inline expr="|x|" /> — 부호 떼고 크기만, 예: |−3|=3 — 과 비슷한데, 막대가 <b>두 줄</b>이면 "벡터의 길이"라는 뜻)
        </li>
        <li>
          <MathBlock inline expr="\sqrt{\;}" /> &nbsp;
          <b>이름</b>: 제곱근(루트) 기호 · <b>읽는 법</b>: "루트" ·
          <b>뜻</b>: 제곱하면 안의 숫자가 되는 값.
          예: <MathBlock inline expr="\sqrt{9}=3" /> (3을 제곱하면 9이므로).
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="warn" title="자주 하는 실수">
      길이는 항상 <b>0 이상</b>입니다. 제곱을 하므로 음수가 나올 수 없어요.
      좌표가 음수여도 길이는 양수입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      세 가지 유형(객관식 · 참/거짓 · 숫자입력)을 난이도 순으로 풀어보세요.
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="벡터 맛보기 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="벡터는 방향과 크기를 함께 가진 양이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 그래서 화살표로 표현하죠."
      />
      <Quiz
        difficulty="easy"
        question="다음 중 '벡터'를 가장 잘 설명한 것은?"
        :choices="['크기만 가진 값', '방향과 크기를 함께 가진 값', '항상 양수인 숫자', '두 점 사이의 거리']"
        :answer="1"
        :hints="['화살표를 떠올려 보세요.']"
        explanation="벡터는 방향과 크기를 함께 가진 양입니다."
      />
      <Quiz
        difficulty="easy"
        question="벡터 (3, 0) 의 길이는 얼마일까요?"
        type="numeric"
        :answer="3"
        explanation="y가 0이므로 길이는 x값 그대로 3입니다. √(3²+0²)=3."
      />
      <Quiz
        difficulty="easy"
        question="원점은 좌표 (0, 0) 이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 원점은 x도 0, y도 0인 점입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="벡터 (3, 4) 의 길이를 공식 ‖v‖=√(x²+y²) 대로 단계별로 구하세요."
        :steps="[
          { lhs: '3^2', answer: 9 },
          { lhs: '4^2', answer: 16 },
          { lhs: '9 + 16', answer: 25 },
          { lhs: '\\sqrt{25}', answer: 5 },
        ]"
        :hints="['먼저 각 성분을 제곱.', '두 제곱을 더한 뒤 마지막에 루트.']"
        explanation="√(9+16)=√25=5. 유명한 3-4-5 직각삼각형!"
      />
      <Quiz
        difficulty="medium"
        question="벡터의 길이는 음수가 될 수 있다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 제곱근 결과라 항상 0 이상이에요."
      />
      <Quiz
        difficulty="medium"
        question="벡터 (6, 8) 의 길이는?"
        type="numeric"
        :answer="10"
        :tolerance="0.01"
        :hints="['6²=36, 8²=64.', '36+64=100, √100 은?']"
        explanation="√(36+64)=√100=10. (3-4-5의 두 배인 6-8-10)"
      />
      <Quiz
        difficulty="medium"
        question="벡터 (0, -5) 의 길이는?"
        type="numeric"
        :answer="5"
        :hints="['좌표가 음수여도 길이는 양수.', '(-5)²=25.']"
        explanation="√(0+25)=5. 방향만 아래쪽일 뿐 길이는 5."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="길이가 정확히 5인 벡터는 다음 중?"
        :choices="['(1, 2)', '(3, 4)', '(2, 2)', '(5, 5)']"
        :answer="1"
        :hints="['각 보기의 √(x²+y²) 를 계산해 보세요.']"
        explanation="(3,4) → √25 = 5. 나머지는 5가 아닙니다."
      />
      <Quiz
        difficulty="hard"
        question="벡터 (5, 12) 의 길이는?"
        type="numeric"
        :answer="13"
        :tolerance="0.01"
        :hints="['5²=25, 12²=144.', '25+144=169, √169 은?']"
        explanation="√169 = 13. (5-12-13 직각삼각형)"
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('sample')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">워밍업 완료 — 준비 끝!</p>
      <p class="mt-1 text-sm text-emerald-700">
        본 학습도 정확히 이렇게 진행됩니다. 이제 1챕터(좌표와 벡터)부터 시작하세요.
      </p>
      <RouterLink
        to="/ch/ch1"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        1챕터 시작 — 좌표와 벡터 →
      </RouterLink>
    </div>
  </article>
</template>
