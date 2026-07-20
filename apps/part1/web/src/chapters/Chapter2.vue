<script setup lang="ts">
// Phase 2 · 벡터 연산 (덧셈 · 스칼라배 · 내적)
import { ref, computed } from 'vue'
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { ChartView } from '@series/ui'
import VectorCanvas, { type Vec } from '@/components/VectorCanvas.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import RecommenderDemo from '@/components/RecommenderDemo.vue'
import CosineGraph from '@/components/CosineGraph.vue'
import UnitCircleDemo from '@/components/UnitCircleDemo.vue'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// --- 1. 덧셈: a, b 드래그 → a+b 와 평행사변형 보조선 ---
const addVecs = ref<Vec[]>([
  { x: 3, y: 1, color: '#6366f1', label: 'a', draggable: true },
  { x: 1, y: 3, color: '#ec4899', label: 'b', draggable: true },
])
const aV = computed(() => addVecs.value[0])
const bV = computed(() => addVecs.value[1])
// 표시용 벡터 목록: a, b, a+b(결과), 그리고 꼬리를 이은 점선 보조선 2개
const addDisplay = computed<Vec[]>(() => {
  const a = aV.value
  const b = bV.value
  // 그리는 순서 = 겹침 순서. 드래그 대상 a, b 는 반드시 인덱스 0, 1.
  // 점선 보조선을 먼저 깔고, 결과 a+b 를 맨 마지막에 그려 위로 올린다.
  return [
    { x: a.x, y: a.y, color: '#6366f1', label: 'a', draggable: true },
    { x: b.x, y: b.y, color: '#ec4899', label: 'b', draggable: true },
    // a의 끝에서 b를 이어 그림 (점선)
    { x: b.x, y: b.y, color: '#ec4899', dashed: true, tail: { x: a.x, y: a.y } },
    // b의 끝에서 a를 이어 그림 (점선) → 평행사변형 완성
    { x: a.x, y: a.y, color: '#6366f1', dashed: true, tail: { x: b.x, y: b.y } },
    // 결과 벡터 (맨 위)
    { x: a.x + b.x, y: a.y + b.y, color: '#10b981', label: 'a+b' },
  ]
})
// 드래그는 a, b(앞 두 개)만 반영
function onAddUpdate(next: Vec[]) {
  addVecs.value = [
    { ...addVecs.value[0], x: next[0].x, y: next[0].y },
    { ...addVecs.value[1], x: next[1].x, y: next[1].y },
  ]
}

// --- 2. 스칼라배: 슬라이더 k ---
const k = ref(2)
const baseVec = { x: 2, y: 1 }
const scalarDisplay = computed<Vec[]>(() => [
  { x: baseVec.x, y: baseVec.y, color: '#94a3b8', label: 'a' },
  { x: +(baseVec.x * k.value).toFixed(2), y: +(baseVec.y * k.value).toFixed(2), color: '#6366f1', label: 'ka' },
])

// --- 4. 내적: a, b 드래그 → a·b, 각도 ---
const dotVecs = ref<Vec[]>([
  { x: 4, y: 0, color: '#6366f1', label: 'a', draggable: true },
  { x: 2, y: 3, color: '#ec4899', label: 'b', draggable: true },
])
const dA = computed(() => dotVecs.value[0])
const dB = computed(() => dotVecs.value[1])
const dot = computed(() => dA.value.x * dB.value.x + dA.value.y * dB.value.y)
const magA = computed(() => Math.hypot(dA.value.x, dA.value.y))
const magB = computed(() => Math.hypot(dB.value.x, dB.value.y))
const cosSim = computed(() => {
  const denom = magA.value * magB.value
  if (denom === 0) return null
  return Math.min(1, Math.max(-1, dot.value / denom))
})
const angle = computed(() =>
  cosSim.value === null ? null : (Math.acos(cosSim.value) * 180) / Math.PI,
)
const dotChart = computed(() => ({
  labels: ['ax·bx', 'ay·by'],
  datasets: [
    {
      label: '내적의 두 조각 (합 = a·b)',
      data: [dA.value.x * dB.value.x, dA.value.y * dB.value.y],
      backgroundColor: ['#818cf8', '#34d399'],
      borderRadius: 6,
    },
  ],
}))

function onSetComplete() {
  progress.markDone('ch2')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 2</p>
    <h1 class="mb-4 text-3xl font-bold">벡터 연산</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      벡터도 더하고, 빼고, 늘일 수 있습니다. 숫자 계산과 똑같이 <b>성분끼리</b> 하면 돼요.
      마지막엔 두 벡터의 "닮은 정도"를 재는 <b>내적</b>까지 만납니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>벡터 <b>덧셈·뺄셈</b>을 성분으로 계산하고 그림으로 이해</li>
        <li><b>스칼라배</b>(늘이기/줄이기/뒤집기)를 안다</li>
        <li><b>내적</b>이 무엇이고 각도·수직과 어떤 관계인지 안다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 덧셈 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 벡터 덧셈</h2>
    <ReviewFlag id="ch2-s1" chapter="ch2" label="1. 벡터 덧셈" />
    <p class="leading-relaxed text-slate-700">
      두 벡터를 더하는 법은 간단합니다. <b>x는 x끼리, y는 y끼리</b> 더하면 끝.
    </p>
    <MathBlock expr="\vec{a} + \vec{b} = (a_x + b_x,\; a_y + b_y)" />

    <ConceptCard tone="note" title="새 기호 — 첨자 (아래 작은 글자)">
      <p>
        <MathBlock inline expr="a_x" /> 는 "벡터 a의 x성분"을 뜻합니다. 글자 오른쪽 아래 작은 글자를
        <b>첨자(아래 첨자)</b>라 하고, "에이 엑스"라고 읽어요.
        <MathBlock inline expr="a_y" /> 는 y성분입니다.
      </p>
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      그림으로 보면 <b>꼬리에 꼬리를 잇는</b> 방법(또는 평행사변형)이에요.
      <b style="color:#6366f1">a</b>, <b style="color:#ec4899">b</b> 끝점을 끌어보세요.
      초록 화살표 <b style="color:#10b981">a+b</b> 와 점선 평행사변형이 따라옵니다.
    </p>

    <VectorCanvas :model-value="addDisplay" :range="8" @update:model-value="onAddUpdate" />

    <ConceptCard tone="tip" title="지금 계산">
      <MathBlock
        inline
        :expr="`(${aV.x}, ${aV.y}) + (${bV.x}, ${bV.y}) = (${aV.x + bV.x}, ${aV.y + bV.y})`"
      />
      — x끼리 {{ aV.x }}+{{ bV.x }}={{ aV.x + bV.x }}, y끼리 {{ aV.y }}+{{ bV.y }}={{ aV.y + bV.y }}.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="(1, 2) + (3, 1) 의 결과는?"
      :choices="['(4, 3)', '(3, 2)', '(4, 2)', '(2, 3)']"
      :answer="0"
      explanation="x끼리 1+3=4, y끼리 2+1=3 → (4, 3)."
    />

    <!-- 2. 스칼라배 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 스칼라배 — 벡터 늘이기/줄이기</h2>
    <ReviewFlag id="ch2-s2" chapter="ch2" label="2. 스칼라배 — 벡터 늘이기/줄이기" />
    <ConceptCard tone="note" title="새 용어 — '스칼라배'가 뭐죠?">
      <p>
        <b>스칼라배</b>를 한 단어로 풀면 <b>"벡터에 스칼라(숫자)를 곱하기"</b>입니다. 쪼개 보면:
      </p>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li><b>스칼라(scalar)</b> = 방향 없는 <b>그냥 숫자 하나</b> (예: 2, 0.5, −1)</li>
        <li><b>배(倍)</b> = "~배", 즉 <b>몇 배 곱하기</b> (일상어 2배·3배 할 때 그 "배")</li>
      </ul>
      <p class="mt-2">
        즉 <b>스칼라배 = 벡터를 그 숫자만큼 곱하기</b> (영어로 scalar multiplication). 성분마다 그 수를 곱해요:
        <MathBlock inline expr="k\vec{a} = (k\,a_x,\; k\,a_y)" />.
      </p>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li><MathBlock inline expr="k>1" /> 이면 길어지고, <MathBlock inline expr="0<k<1" /> 이면 짧아집니다.</li>
        <li><MathBlock inline expr="k" /> 가 음수면 <b>방향이 반대</b>로 뒤집힙니다.</li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
      <label class="mb-2 block text-sm font-medium">
        스칼라 k = <span class="font-bold text-indigo-600">{{ k }}</span>
      </label>
      <input v-model.number="k" type="range" min="-2" max="3" step="0.5" class="w-full" />
      <p class="mt-2 text-sm text-slate-600">
        <MathBlock
          inline
          :expr="`${k}\\times(2, 1) = (${(2 * k).toFixed(1)}, ${(1 * k).toFixed(1)})`"
        />
      </p>
    </div>
    <VectorCanvas :model-value="scalarDisplay" :range="7" :snap="false" />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="벡터 (2, 1) 에 스칼라 −1 을 곱하면 방향이 반대가 된다."
      type="truefalse"
      :answer="0"
      explanation="참. −1을 곱하면 (−2, −1) 로, 길이는 같고 방향만 정반대."
    />

    <!-- 3. 뺄셈 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 벡터 뺄셈</h2>
    <ReviewFlag id="ch2-s3" chapter="ch2" label="3. 벡터 뺄셈" />
    <p class="leading-relaxed text-slate-700">
      뺄셈은 "음의 벡터를 더하기"입니다. <MathBlock inline expr="\vec{a} - \vec{b} = \vec{a} + (-\vec{b})" />.
      성분으로는 역시 끼리끼리 빼면 돼요.
    </p>
    <MathBlock expr="\vec{a} - \vec{b} = (a_x - b_x,\; a_y - b_y)" />
    <ConceptCard tone="note" title="새 기호 — 음의 벡터 −b">
      <MathBlock inline expr="-\vec{b}" /> 는 <MathBlock inline expr="\vec{b}" /> 와 길이는 같고
      <b>방향만 반대</b>인 벡터입니다. (스칼라 −1 을 곱한 것)
    </ConceptCard>

    <!-- 4. 내적 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 내적(dot product / inner product) — 두 벡터의 닮은 정도</h2>
    <ReviewFlag id="ch2-s4" chapter="ch2" label="4. 내적(dot product / inner product) — 두 벡터의 닮은 정도" />
    <p class="leading-relaxed text-slate-700">
      <b>내적</b>은 두 벡터를 곱해 <b>숫자 하나</b>를 만드는 연산입니다. 성분끼리 곱해서 더해요.
    </p>
    <MathBlock expr="\vec{a} \cdot \vec{b} = a_x b_x + a_y b_y" />

    <ConceptCard tone="note" title="새 기호 — 내적 점(·)과 각도 θ">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <MathBlock inline expr="\vec{a} \cdot \vec{b}" /> — 가운데 점은 <b>내적(dot product)</b> 기호.
          "에이 닷 비" 또는 "에이 내적 비"라 읽고, 결과는 <b>벡터가 아니라 숫자(스칼라)</b>입니다.
        </li>
        <li>
          <MathBlock inline expr="\lVert\vec{a}\rVert" /> — 양쪽 <b>이중 막대</b>는 <b>벡터의 길이(노름)</b>예요.
          "에이의 길이"라 읽고, <MathBlock inline expr="\lVert(3,4)\rVert = \sqrt{3^2+4^2} = 5" /> 처럼 구합니다.
          여기 나온 두 기호도 짚고 갈게요 — <MathBlock inline expr="3^2" /> ("3의 제곱")은
          3×3 = 9 라는 뜻이고, <MathBlock inline expr="\sqrt{\phantom{9}}" /> (<b>루트</b>, 제곱근)는
          반대로 "제곱하면 이 수가 되는 수"입니다: <MathBlock inline expr="\sqrt{25} = 5" />
          (5×5 = 25 니까요). 계산은 계산기·Python이 다 해주니 <b>뜻만 알면 충분</b>해요.
        </li>
        <li>
          <MathBlock inline expr="\theta" /> — 그리스 문자 <b>세타</b>. 두 벡터 <b>사이의 각도</b>를 나타냅니다.
          관계식: <MathBlock inline expr="\vec{a}\cdot\vec{b} = \lVert\vec{a}\rVert\,\lVert\vec{b}\rVert\cos\theta" />
          (길이 × 길이 × cos θ). — 여기 나온 <b>cos 은 바로 아래 카드에서 설명</b>하니 잠시만요!
        </li>
        <li>
          <b>핵심</b>: 내적이 <b>0이면 두 벡터는 수직</b>(<MathBlock inline expr="\theta = 90^\circ" /> — ° 는 각도 단위 "도")입니다.
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="note" title="새 용어 — 코사인(cos)">
      <p>
        <MathBlock inline expr="\cos\theta" /> ("코사인 세타")는 어렵게 생각할 것 없이,
        <b>두 화살표의 방향이 얼마나 같은지를 −1 ~ 1 사이의 숫자로 알려주는 값</b>입니다.
        각도 <MathBlock inline expr="\theta" /> 만 정해지면 따라 나오는 숫자예요.
      </p>
      <table class="mt-3 w-full text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-1">두 벡터 방향</th>
            <th>각도 θ</th>
            <th>cos θ</th>
            <th>내적 부호</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-slate-100">
            <td class="py-1">같은 쪽 (나란히)</td>
            <td><MathBlock inline expr="0^\circ" /></td>
            <td><b>1</b> (최대)</td>
            <td class="text-emerald-600">+ (양수)</td>
          </tr>
          <tr class="border-b border-slate-100">
            <td class="py-1">직각 (수직)</td>
            <td><MathBlock inline expr="90^\circ" /></td>
            <td><b>0</b></td>
            <td>0</td>
          </tr>
          <tr>
            <td class="py-1">반대 쪽</td>
            <td><MathBlock inline expr="180^\circ" /></td>
            <td><b>−1</b> (최소)</td>
            <td class="text-rose-600">− (음수)</td>
          </tr>
        </tbody>
      </table>
      <p class="mt-3">
        그래서 내적 <MathBlock inline expr="\vec{a}\cdot\vec{b} = \lVert\vec{a}\rVert\lVert\vec{b}\rVert\cos\theta" /> 는
        "두 벡터가 <b>같은 방향일수록 큰 양수</b>, <b>반대 방향일수록 큰 음수</b>, <b>직각이면 0</b>"
        이 됩니다 — 이게 바로 <b>닮은 정도</b>예요.
      </p>
    </ConceptCard>

    <ConceptCard tone="note" title="코사인의 정확한 의미 — 세 가지로 보기">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>① 직각삼각형 (원래 뜻)</b>: <MathBlock inline expr="\cos\theta = \dfrac{\text{밑변}}{\text{빗변}}" /> —
          여기서 밑변은 <b>각 θ 바로 옆에 붙은 변</b>, 빗변은 <b>가장 긴 변</b>. "빗변 대비 옆변의 비율"이에요. 단, 0°~90°만 됩니다.
        </li>
        <li>
          <b>② 단위원 (일반·정확) ⭐</b>: 반지름 1인 원에서 각도 θ인 점의 <b>x좌표 = <MathBlock inline expr="\cos\theta" /></b>.
          모든 각도에서 통하고, x좌표가 −1~1 이라 <b>cos도 항상 −1~1</b>. (아래에서 직접 돌려보세요)
        </li>
        <li>
          <b>③ 벡터 (정확한 연결식)</b>: <MathBlock inline expr="\cos\theta = \dfrac{\vec{a}\cdot\vec{b}}{\lVert\vec{a}\rVert\,\lVert\vec{b}\rVert}" /> —
          내적을 두 길이의 곱으로 나눈 값. 이게 곧 <b>코사인 유사도</b>.
        </li>
      </ul>
    </ConceptCard>

    <UnitCircleDemo />

    <CosineGraph />

    <p class="leading-relaxed text-slate-700">
      <b style="color:#6366f1">a</b>, <b style="color:#ec4899">b</b> 를 끌면서 내적과 각도가
      어떻게 변하는지 보세요. 특히 두 화살표가 직각일 때 내적이 0이 됩니다.
    </p>
    <VectorCanvas v-model="dotVecs" :range="6" />

    <ConceptCard tone="tip" title="지금 내적과 각도">
      <p>
        <MathBlock
          inline
          :expr="`\\vec{a}\\cdot\\vec{b} = ${dA.x}\\times${dB.x} + ${dA.y}\\times${dB.y} = ${dot}`"
        />
      </p>
      <p class="mt-1">
        두 벡터 사이 각도 θ ≈
        <b>{{ angle === null ? '—' : angle.toFixed(1) + '°' }}</b>
        <span v-if="dot === 0" class="font-bold text-emerald-600"> → 수직! (내적 0)</span>
      </p>
      <p class="mt-1">
        코사인 유사도 (cos θ) ≈
        <b>{{ cosSim === null ? '—' : cosSim.toFixed(2) }}</b>
        — 1에 가까울수록 "닮음", 0이면 무관, −1이면 정반대.
      </p>
      <p class="mt-1 text-xs text-slate-400">
        (≈ 는 "약, 대략 같음" — 딱 떨어지지 않는 소수라 반올림해 보여준다는 뜻이에요.)
      </p>
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      내적은 "x조각 + y조각"의 합입니다. 두 조각을 막대로 보면:
    </p>
    <ChartView type="bar" :data="dotChart" :height="220" />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="두 벡터의 내적이 0이면 두 벡터는 서로 수직이다."
      type="truefalse"
      :answer="0"
      explanation="참. 내적 0 ⇔ 사이각 90° ⇔ 수직."
    />

    <!-- 4-AI. AI에서의 내적 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 내적은 AI의 심장입니다</h2>
    <ReviewFlag id="ch2-ai" chapter="ch2" label="🤖 내적은 AI의 심장입니다" />
    <p class="leading-relaxed text-slate-700">
      방금 배운 내적은 단순한 계산이 아니라, 오늘날 <b>인공지능(AI)이 가장 많이 하는 계산</b>입니다.
      왜 그런지 세 가지만 봅시다.
    </p>

    <ConceptCard tone="ai" title="AI가 내적을 쓰는 곳">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>추천·검색 (유사도)</b>: 영화·상품·문장·이미지를 <b>숫자 목록(벡터)</b>으로 바꾼 뒤,
          두 벡터의 내적이 <b>크면 "비슷하다"</b>고 판단합니다. 유튜브·넷플릭스 추천의 뿌리예요.
        </li>
        <li>
          <b>신경망 뉴런</b>: 뉴런 하나가 하는 일은 <b>입력 벡터 · 가중치 벡터</b>(내적) 하나입니다.
          AI 모델은 이 내적을 <b>수십억 번</b> 합니다.
        </li>
        <li>
          <b>트랜스포머 어텐션</b>: ChatGPT 같은 모델이 "어떤 단어에 집중할지" 정할 때도
          단어 벡터끼리 내적해서 관련도를 잽니다.
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="note" title="새 용어 — 코사인 유사도(cosine similarity)">
      <p class="mb-2">
        내적은 <MathBlock inline expr="\lVert\vec{a}\rVert\lVert\vec{b}\rVert\cos\theta" /> 라서 <b>길이가 곱으로 섞여</b> 있어요.
        그래서 방향이 똑같아도 벡터가 길면 내적이 커집니다.
        (예: <MathBlock inline expr="(1,0)\cdot(1,0)=1" /> 인데, 방향 그대로 길이만 키우면 <MathBlock inline expr="(1,0)\cdot(10,0)=10" />)
      </p>
      <div class="mb-2 rounded-lg bg-slate-50 p-3 text-sm">
        <p class="mb-1">⚠️ 그래서 <b>크기에 속을 수</b> 있어요. 기준 <MathBlock inline expr="\vec{a}=(2,0)" /> 에 대해:</p>
        <ul class="list-disc space-y-0.5 pl-5">
          <li><MathBlock inline expr="\vec{b}=(2,0)" /> (a와 <b>같은 방향</b>): <MathBlock inline expr="\vec{a}\cdot\vec{b}=4" /></li>
          <li><MathBlock inline expr="\vec{c}=(7,7)" /> (방향 45° 어긋남, 대신 긺): <MathBlock inline expr="\vec{a}\cdot\vec{c}=14" /></li>
        </ul>
        <p class="mt-1">→ 내적은 엉뚱하게 <b>c가 더 닮았다</b>(14 &gt; 4)고 말해요. c가 단지 <b>길어서</b> 이긴 거예요.</p>
      </div>
      <p class="mb-2">
        그래서 <b>두 길이로 나눠</b> 크기를 지우면 순수한 방향(<MathBlock inline expr="\cos\theta" />)만 남아요 — 이게 <b>코사인 유사도</b>예요.
      </p>
      <MathBlock expr="\text{cosine similarity} = \frac{\vec{a}\cdot\vec{b}}{\lVert\vec{a}\rVert\,\lVert\vec{b}\rVert} = \cos\theta" />
      <p class="mb-1 text-sm text-slate-500">
        💡 즉 <b>코사인 유사도 = (두 벡터 사이 각도의) <MathBlock inline expr="\cos\theta" /></b> 와 똑같은 값이에요.
        새로운 게 아니라, 그 cos θ 를 AI에서 '닮은 정도 점수'로 쓸 때 부르는 <b>이름</b>일 뿐입니다.
      </p>
      <p class="mb-1">
        다시 계산하면 <MathBlock inline expr="\cos(\vec{a},\vec{b}) = 1" />, <MathBlock inline expr="\cos(\vec{a},\vec{c}) \approx 0.71" /> →
        이제 <b>b가 더 닮았다</b>고 올바르게 나와요. (크기에 안 속음)
        표기 두 개만 짚으면 — <MathBlock inline expr="\cos(\vec{a},\vec{b})" /> 는 "a 와 b
        <b>사이 각도의</b> 코사인"이라는 뜻이고, <MathBlock inline expr="\approx" /> 는
        "약, 대략 같음"(딱 떨어지지 않는 소수라서)입니다.
      </p>
      <p>값은 항상 −1 ~ 1. <b>1에 가까울수록 비슷</b>, 0이면 무관, −1이면 정반대 의미입니다.</p>
    </ConceptCard>

    <ConceptCard tone="tip" title="예시 — 영화 추천을 내적으로">
      <p>
        취향을 <b>(액션 선호, 로맨스 선호)</b> 두 숫자로 적어봅시다. 액션을 좋아하는 나:
        <MathBlock inline expr="\vec{u} = (5, 1)" />.
      </p>
      <table class="mt-3 w-full text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-1">영화</th>
            <th>특징 벡터</th>
            <th>나와의 내적</th>
            <th>추천?</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-slate-100">
            <td class="py-1">액션물 A</td>
            <td><MathBlock inline expr="(5, 0)" /></td>
            <td>5×5 + 1×0 = <b>25</b></td>
            <td class="font-bold text-emerald-600">✓ 강추</td>
          </tr>
          <tr>
            <td class="py-1">로맨스물 B</td>
            <td><MathBlock inline expr="(0, 5)" /></td>
            <td>5×0 + 1×5 = <b>5</b></td>
            <td class="text-slate-400">덜 추천</td>
          </tr>
        </tbody>
      </table>
      <p class="mt-3">
        내적이 큰 <b>A(25)</b> 가 내 취향에 더 맞습니다. AI 추천은 이 계산을
        수백만 개 항목에 대해 순식간에 하는 것뿐이에요.
      </p>
    </ConceptCard>

    <RecommenderDemo />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="내 취향 (5, 1) 과 가장 '비슷한'(내적이 큰) 영화는?"
      :choices="['(5, 0) — 내적 25', '(0, 5) — 내적 5', '(−5, 0) — 내적 −25']"
      :answer="0"
      :hints="['각 영화 벡터와 (5,1) 의 내적을 계산해 보세요.', '내적이 클수록 비슷.']"
      explanation="(5,0) 과의 내적이 25로 가장 큽니다 → 가장 비슷."
    />

    <!-- 5. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 10문제. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="벡터 연산 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="(2, 3) + (1, 1) 의 결과는?"
        :choices="['(3, 4)', '(2, 3)', '(3, 3)', '(1, 4)']"
        :answer="0"
        explanation="x: 2+1=3, y: 3+1=4 → (3, 4)."
      />
      <Quiz
        difficulty="easy"
        question="(5, 2) − (1, 2) 의 x성분은?"
        type="numeric"
        :answer="4"
        explanation="x끼리 5−1=4."
      />
      <Quiz
        difficulty="easy"
        question="스칼라는 방향이 없는 '그냥 숫자' 다."
        type="truefalse"
        :answer="0"
        explanation="참. 스칼라는 크기(숫자)만 있고 방향이 없습니다."
      />
      <Quiz
        difficulty="easy"
        question="2 × (3, 1) 의 결과는?"
        :choices="['(6, 2)', '(5, 3)', '(3, 2)', '(6, 1)']"
        :answer="0"
        explanation="성분마다 2를 곱해 (6, 2)."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="(2, 0) · (0, 5) 의 내적은?"
        type="numeric"
        :answer="0"
        :hints="['axbx + ayby 입니다.', '2×0 + 0×5 = ?']"
        explanation="2×0 + 0×5 = 0. (두 벡터가 수직이라 0)"
      />
      <StepQuiz
        difficulty="medium"
        question="(1, 2) · (3, 4) 의 내적을 공식대로 단계별로 구하세요."
        :steps="[
          { lhs: '1 \\times 3', answer: 3 },
          { lhs: '2 \\times 4', answer: 8 },
          { lhs: '3 + 8', answer: 11 },
        ]"
        :hints="['내적 = ax·bx + ay·by.', '먼저 성분끼리 곱하고, 마지막에 더합니다.']"
        explanation="1×3 + 2×4 = 3 + 8 = 11."
      />
      <Quiz
        difficulty="medium"
        question="−2 × (1, −3) 의 결과는?"
        :choices="['(−2, 6)', '(−2, −6)', '(2, 6)', '(−2, 3)']"
        :answer="0"
        :hints="['음수×음수=양수에 주의.', 'y성분: −2×(−3)=+6.']"
        explanation="(−2×1, −2×−3) = (−2, 6)."
      />
      <Quiz
        difficulty="medium"
        question="내적의 결과는 벡터다."
        type="truefalse"
        :answer="1"
        explanation="거짓. 내적의 결과는 숫자(스칼라)입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="(3, 1) + 2×(−1, 2) 의 결과는?"
        :choices="['(1, 5)', '(2, 3)', '(1, 4)', '(5, 5)']"
        :answer="0"
        :hints="['먼저 2×(−1,2)=(−2,4).', '그다음 (3,1)+(−2,4).']"
        explanation="2×(−1,2)=(−2,4), (3,1)+(−2,4)=(1,5)."
      />
      <Quiz
        difficulty="hard"
        question="(4, k) 와 (2, −1) 이 수직이 되려면 k 는? (내적이 0)"
        type="numeric"
        :answer="8"
        :hints="['수직이려면 내적이 0이어야 해요.', '내적을 계산하면: 4×2 + k×(−1) = 8 − k.', '8에서 얼마를 빼야 0이 될까요?']"
        explanation="내적 = 4×2 + k×(−1) = 8 − k. 8에서 8을 빼야 0이 되므로 k = 8."
      />
    </QuizSet>

    <NotebookCard />

    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch02_vector_operations.ipynb</code> 에서 덧셈·스칼라배·내적(<code>np.dot</code>)을
      직접 계산하고 화살표로 그려봅니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch2')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 2 완료. 벡터 연산을 익혔습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">다음은 여러 수를 표로 묶은 '행렬'입니다.</p>
      <RouterLink
        to="/ch/ch3"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 행렬과 행렬 연산 →
      </RouterLink>
    </div>
  </article>
</template>
