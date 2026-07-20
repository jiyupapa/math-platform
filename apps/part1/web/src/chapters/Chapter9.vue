<script setup lang="ts">
// Phase 9 · 기저·차원·계수(rank) — "벡터들이 진짜 몇 차원어치 정보인가"
import { ref, computed } from 'vue'
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import VectorCanvas, { type Vec } from '@/components/VectorCanvas.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch9')
}

// ── 데모 A: 선형결합 — u, v 를 드래그하고 c1, c2 슬라이더로 w = c1·u + c2·v 를 만든다
const comboBase = ref<Vec[]>([
  { x: 2, y: 1, color: '#6366f1', label: 'u', draggable: true },
  { x: -1, y: 2, color: '#f59e0b', label: 'v', draggable: true },
])
const c1 = ref(1.5)
const c2 = ref(1)
const comboVecs = computed<Vec[]>({
  get: () => {
    const u = comboBase.value[0]
    const v = comboBase.value[1]
    return [
      u,
      v,
      {
        x: c1.value * u.x + c2.value * v.x,
        y: c1.value * u.y + c2.value * v.y,
        color: '#10b981',
        label: 'w',
        dashed: true,
      },
    ]
  },
  // 드래그로 바뀌는 건 u, v 뿐 — w 는 항상 계산해서 그린다
  set: (arr) => {
    comboBase.value = [arr[0], arr[1]]
  },
})
const comboW = computed(() => {
  const w = comboVecs.value[2]
  return { x: Math.round(w.x * 10) / 10, y: Math.round(w.y * 10) / 10 }
})

// ── 데모 B: 독립/종속 판별 — u, v 를 드래그하면 실시간으로 판정
const indepVecs = ref<Vec[]>([
  { x: 2, y: 1, color: '#6366f1', label: 'u', draggable: true },
  { x: 4, y: 2, color: '#ef4444', label: 'v', draggable: true },
])
const indepDet = computed(() => {
  const u = indepVecs.value[0]
  const v = indepVecs.value[1]
  return u.x * v.y - u.y * v.x
})
const isIndep = computed(() => Math.abs(indepDet.value) > 1e-9)
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 9 · AI 심화 확장</p>
    <h1 class="mb-4 text-3xl font-bold">기저·차원·계수(rank) — 진짜 정보는 몇 차원인가</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      표에 열이 100개 있다고 정보도 100가지일까요? 아닙니다 — <b>서로 겹치는(중복된) 열</b>이 있으면
      진짜 정보는 그보다 적어요. 이 챕터는 "벡터들이 <b>실제로 몇 차원어치 정보</b>를 갖고 있나"를
      재는 도구, <b>rank</b>까지 갑니다. 차원축소(ch8)와 SVD(ch11)의 밑바탕이에요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>선형결합</b>으로 벡터를 "섞어서" 새 벡터를 만들 수 있다</li>
        <li><b>생성(span)</b> — 주어진 벡터들로 "갈 수 있는 모든 곳"을 안다</li>
        <li><b>선형독립/종속</b> — 벡터가 새 정보인지 재탕인지 판별한다</li>
        <li><b>기저·차원·rank</b> — "진짜 정보의 차원"을 셀 수 있다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 왜 필요한가 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 열이 3개인데 정보는 2개? — 중복이라는 문제</h2>
    <ReviewFlag id="ch9-s1" chapter="ch9" label="1. 열이 3개인데 정보는 2개?" />
    <p class="leading-relaxed text-slate-700">
      회원 데이터에 <b>키(cm)</b>, <b>키(inch)</b>, <b>몸무게</b> 세 열이 있다고 해봅시다.
      키(inch)는 키(cm)에 <b>0.394를 곱한 것뿐</b>이라 새 정보가 하나도 없어요.
      겉보기엔 3열이지만 <b>진짜 정보는 2가지</b>죠. AI는 데이터를 벡터·행렬로 다루니까,
      "어느 열이 재탕인지"를 수학으로 판별할 수 있어야 합니다. 그 도구가 이 챕터의 주인공들이에요.
    </p>

    <!-- 2. 선형결합 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 선형결합 — 벡터를 '섞는' 유일한 방법</h2>
    <ReviewFlag id="ch9-s2" chapter="ch9" label="2. 선형결합" />
    <p class="leading-relaxed text-slate-700">
      ch2에서 배운 벡터 연산은 딱 두 가지였죠 — <b>더하기</b>와 <b>숫자 곱하기(스칼라배)</b>.
      이 둘을 조합하면 벡터를 "섞을" 수 있습니다:
    </p>
    <MathBlock expr="\vec{w} = c_1\,\vec{u} + c_2\,\vec{v}" />

    <ConceptCard tone="note" title="새 용어 — 선형결합">
      <p>
        <b>선형결합(linear combination, 리니어 컴비네이션)</b>: 벡터들에 각각 숫자(<MathBlock
          inline
          expr="c_1, c_2"
        />)를 곱해 더한 것. "늘리고 + 합치기"만 쓴 조합이라 <b>선형</b>결합이라 불러요.
        여기서 <MathBlock inline expr="c_1, c_2" /> 는 <b>계수(coefficient, 코이피션트)</b> —
        각 벡터를 "얼마나 쓸지" 정하는 숫자입니다.
      </p>
    </ConceptCard>

    <p class="mt-4 leading-relaxed text-slate-700">
      아래에서 <b>u, v 를 드래그</b>하고 <b>슬라이더로 계수를 조절</b>해 보세요.
      초록 점선 <b>w</b> 가 그 선형결합입니다.
    </p>

    <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
      <VectorCanvas v-model="comboVecs" :range="6" :snap="true" />
      <div class="mt-3 space-y-2 text-sm">
        <label class="flex items-center gap-3">
          <span class="w-24 shrink-0 font-mono">c1 = {{ c1.toFixed(1) }}</span>
          <input v-model.number="c1" type="range" min="-3" max="3" step="0.5" class="flex-1" />
        </label>
        <label class="flex items-center gap-3">
          <span class="w-24 shrink-0 font-mono">c2 = {{ c2.toFixed(1) }}</span>
          <input v-model.number="c2" type="range" min="-3" max="3" step="0.5" class="flex-1" />
        </label>
        <p class="font-mono text-emerald-700">w = c1·u + c2·v = ({{ comboW.x }}, {{ comboW.y }})</p>
      </div>
    </div>

    <!-- 3. 생성 (span) -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 생성(span) — 갈 수 있는 모든 곳</h2>
    <ReviewFlag id="ch9-s3" chapter="ch9" label="3. 생성(span)" />
    <p class="leading-relaxed text-slate-700">
      위 데모에서 계수를 이리저리 바꾸면 <b>w 가 평면 곳곳을 돌아다니죠</b>.
      "계수를 모든 값으로 바꿔가며 만들 수 있는 <b>w 전부</b>"를 그 벡터들의 <b>생성</b>이라 합니다.
    </p>
    <ConceptCard tone="note" title="새 용어 — 생성(span)">
      <p class="mb-2">
        <b>생성(span, 스팬)</b>: 주어진 벡터들의 <b>선형결합으로 만들 수 있는 모든 벡터의 집합</b>.
        "이 재료들로 갈 수 있는 모든 곳"이라고 읽으면 돼요.
      </p>
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>u, v 가 <b>서로 다른 방향</b>이면 → span 은 <b>평면 전체</b> (어디든 갈 수 있음)</li>
        <li>u, v 가 <b>평행</b>(한쪽이 다른 쪽의 배수)이면 → span 은 <b>직선 하나</b> (그 위에 갇힘)</li>
      </ul>
    </ConceptCard>
    <ConceptCard tone="tip" title="직접 실험해 보세요">
      위 데모에서 <b>v 를 드래그해 u 와 평행하게</b>(예: u=(2,1), v=(4,2)) 만들어 보세요.
      계수를 아무리 바꿔도 <b>w 가 한 직선 위에서만</b> 움직입니다 — 재료가 사실상 하나뿐인 거예요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="span(생성)이란 주어진 벡터들의 선형결합으로 만들 수 있는 모든 벡터의 집합이다."
      type="truefalse"
      :answer="0"
      explanation="참. '그 재료들로 갈 수 있는 모든 곳'이 span 입니다."
    />

    <!-- 4. 선형독립/종속 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 선형독립 vs 선형종속 — 새 정보인가, 재탕인가</h2>
    <ReviewFlag id="ch9-s4" chapter="ch9" label="4. 선형독립 vs 선형종속" />
    <p class="leading-relaxed text-slate-700">
      방금 실험이 핵심입니다. 벡터 여러 개가 있을 때 —
      <b>어느 하나가 나머지의 선형결합으로 만들어지면</b>(= 재탕이면) 그 묶음은 <b>종속</b>,
      <b>모두가 각자 새 방향을 보태면 독립</b>이에요.
    </p>
    <ConceptCard tone="note" title="새 용어 — 선형독립 · 선형종속">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>선형독립(linearly independent, 리니얼리 인디펜던트)</b>: 어떤 벡터도 나머지의
          선형결합으로 못 만든다 — <b>전부 새 정보</b>.
        </li>
        <li>
          <b>선형종속(linearly dependent, 리니얼리 디펜던트)</b>: 적어도 하나는 나머지로 만들 수
          있다 — <b>중복(재탕)이 있다</b>. 벡터 2개라면 "평행하다"와 같은 말이에요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-4 leading-relaxed text-slate-700">
      2차원에서 벡터 2개는 <b>ch6에서 배운 행렬식</b>으로 바로 판별됩니다. 두 벡터를 열로 세운
      행렬의 행렬식이 <b>0이면 종속, 0이 아니면 독립</b>이에요 (행렬식 = 두 벡터가 만드는
      평행사변형의 넓이 — 평행하면 납작해져서 넓이 0!).
    </p>
    <MathBlock expr="\det = u_x v_y - u_y v_x \quad (0 \text{ 이면 종속, } 0 \text{ 이 아니면 독립})" />

    <p class="mt-4 leading-relaxed text-slate-700">
      아래에서 <b>u, v 를 드래그</b>하면 실시간으로 판정해 줍니다. 평행하게도, 어긋나게도 만들어 보세요.
    </p>
    <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
      <VectorCanvas v-model="indepVecs" :range="6" :snap="true" />
      <div
        class="mt-3 rounded-lg p-3 text-sm font-medium"
        :class="isIndep ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'"
      >
        <p class="font-mono">det = u_x·v_y − u_y·v_x = {{ indepDet }}</p>
        <p class="mt-1">
          {{
            isIndep
              ? '✅ 선형독립 — 두 벡터가 평면 전체를 생성합니다 (2차원어치 정보)'
              : '⚠️ 선형종속 — 평행! span 이 직선 하나에 갇힙니다 (1차원어치 정보)'
          }}
        </p>
      </div>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="u=(1,2), v=(2,4) 두 벡터는 독립일까요, 종속일까요?"
      :choices="['종속 — v 가 u 의 2배(평행)라 새 정보가 없다', '독립 — 방향이 다르다', '벡터만 보고는 알 수 없다']"
      :answer="0"
      :hints="['v 의 각 성분을 u 와 비교해 보세요. 몇 배인가요?', 'det = 1×4 − 2×2 를 계산해 보세요.']"
      explanation="v = 2u 이므로 종속입니다. det = 1×4 − 2×2 = 0 으로도 확인돼요."
    />

    <!-- 5. 기저와 차원 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 기저와 차원 — 공간을 만드는 최소 재료</h2>
    <ReviewFlag id="ch9-s5" chapter="ch9" label="5. 기저와 차원" />
    <p class="leading-relaxed text-slate-700">
      평면 전체를 생성하면서(span), 군더더기 없이 <b>전부 독립</b>인 벡터 묶음 —
      그게 그 공간의 <b>기저</b>입니다. "이 공간을 만드는 <b>최소한의 재료 세트</b>"예요.
    </p>
    <ConceptCard tone="note" title="새 용어 — 기저 · 차원">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>기저(basis, 베이시스)</b>: ① 공간 전체를 생성하고 ② 서로 선형독립인 벡터 묶음.
          평면(2D)의 가장 유명한 기저는 <b>표준기저</b>
          <MathBlock inline expr="\vec{e}_1 = \begin{pmatrix} 1 \\ 0 \end{pmatrix},\ \vec{e}_2 = \begin{pmatrix} 0 \\ 1 \end{pmatrix}" />
          — 바로 x축·y축 방향이에요.
          <span class="text-slate-500">(ch5에서 만난 î "이 햇", ĵ "제이 햇"와 <b>같은 벡터</b>예요 —
          기저 이야기를 할 때는 e₁, e₂ 라는 이름을 즐겨 씁니다)</span>
        </li>
        <li>
          <b>차원(dimension, 디멘션)</b>: <b>기저 벡터의 개수</b>. 평면은 기저가 2개라 2차원,
          공간은 3개라 3차원. 어떤 기저를 골라도 개수는 항상 같아서 "차원"이 잘 정의됩니다.
        </li>
      </ul>
    </ConceptCard>
    <ConceptCard tone="tip" title="개수가 정해져 있다는 게 핵심">
      2차원 평면에서는 <b>독립인 벡터를 3개 이상 고를 수 없어요</b>. 셋째 벡터는 반드시 앞 둘의
      선형결합(재탕)이 됩니다. 즉 "차원 = 그 공간이 담을 수 있는 <b>독립 정보의 최대 개수</b>".
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="3차원 공간의 기저를 이루는 벡터는 몇 개일까요?"
      type="numeric"
      :answer="3"
      :hints="['차원 = 기저 벡터의 개수입니다.']"
      explanation="3차원 공간의 기저는 독립인 벡터 3개. 차원의 정의 그 자체입니다."
    />

    <!-- 6. rank -->
    <h2 class="mt-8 mb-2 text-xl font-bold">6. 계수(rank) — 행렬이 담은 '진짜 정보량'</h2>
    <ReviewFlag id="ch9-s6" chapter="ch9" label="6. 계수(rank)" />
    <p class="leading-relaxed text-slate-700">
      이제 도구가 다 모였습니다. 행렬을 <b>열벡터들의 묶음</b>으로 보세요. 그 열들 중
      <b>선형독립인 것이 몇 개인가</b> — 그게 <b>rank</b>입니다.
    </p>
    <ConceptCard tone="note" title="새 용어 — 계수(rank)">
      <p class="mb-2">
        <b>계수(rank, 랭크)</b>: 행렬에서 <b>선형독립인 열(또는 행)의 개수</b> =
        열벡터들이 생성하는 공간의 차원 = <b>행렬이 담은 진짜 정보의 차원</b>.
        (신기하게도 열로 세나 행으로 세나 항상 같습니다.)
      </p>
      <p class="text-sm text-slate-600">
        ※ 선형결합의 숫자 <MathBlock inline expr="c_1, c_2" /> 도 한국어로 '계수(coefficient)'라
        불러요. 같은 한국어지만 <b>전혀 다른 개념</b>이니, 이 챕터의 rank 는 그냥 <b>랭크</b>라고
        읽는 걸 추천합니다.
      </p>
    </ConceptCard>

    <p class="mt-4 leading-relaxed text-slate-700">예를 들어 이 행렬의 rank 는:</p>
    <MathBlock expr="A = \begin{bmatrix} 1 & 2 \\ 2 & 4 \end{bmatrix} \quad\Rightarrow\quad \text{rank}(A) = 1" />
    <p class="leading-relaxed text-slate-700">
      둘째 열 <MathBlock inline expr="\begin{pmatrix} 2 \\ 4 \end{pmatrix}" /> 이 첫째 열의
      2배(재탕)라서, 독립인 열은 <b>1개뿐</b>. 2×2 행렬이지만 정보는 <b>1차원어치</b>입니다.
      맨 앞의 키(cm)/키(inch) 데이터가 정확히 이 상황이었죠.
    </p>

    <ConceptCard tone="tip" title="앞 챕터들과 연결 — rank 로 다시 보기">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <b>ch6 행렬식·역행렬</b>: 2×2 행렬에서 <b>det ≠ 0 ⟺ rank = 2 ⟺ 역행렬 존재</b>.
          (처음 보는 기호 <MathBlock inline expr="\iff" /> 는 "서로 같은 말"이라는 뜻 — 하나가
          참이면 나머지도 전부 참이에요.) "행렬식이 0" = "열이 중복돼 정보가 부족" 이었던 거예요.
        </li>
        <li>
          <b>ch4 연립방정식</b>: 계수행렬의 rank 가 꽉 차 있으면(=미지수 개수) 해가 <b>딱 하나</b>.
          rank 가 모자라면 해가 무한히 많거나 없음 — 식이 사실상 중복이었기 때문.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="열이 '키(cm) · 키(inch) · 몸무게'인 데이터 행렬 — 진짜 정보의 차원(rank)은 몇일까요?"
      type="numeric"
      :answer="2"
      :hints="['키(inch)는 키(cm)의 배수(×0.394)라 새 정보가 아니에요.', '독립인 열만 세어 보세요: 키 하나 + 몸무게 하나.']"
      explanation="키(inch)는 키(cm)의 스칼라배라 종속. 독립인 열은 키·몸무게 2개 → rank 2."
    />

    <!-- 7. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 기저·차원·rank 가 AI에서 쓰이는 곳</h2>
    <ReviewFlag id="ch9-ai" chapter="ch9" label="🤖 AI에서 쓰이는 곳" />
    <ConceptCard tone="ai" title="실제 활용">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>특징 중복 진단(다중공선성)</b>: 데이터 행렬의 rank 가 열 개수보다 작으면 중복 특징이
          있다는 뜻 — 그대로 학습하면 모델이 불안정해져서, 중복 열을 찾아 정리합니다.
        </li>
        <li>
          <b>임베딩의 '실질 차원'</b>: 단어·이미지 임베딩이 768차원이어도 실제 데이터가 쓰는 건
          훨씬 낮은 차원인 경우가 많아요. ch8 PCA가 "중요한 축만 남기기"였다면, 그 축의 개수를
          세는 언어가 바로 차원·rank 입니다.
        </li>
        <li>
          <b>LoRA — 저랭크로 싸게 파인튜닝</b>: 파인튜닝(fine-tuning)은 <b>이미 학습된 모델을
          내 용도에 맞게 조금만 더 학습시키는 것</b>(미세조정)이에요. 거대 모델의 가중치 행렬(수억 개
          숫자)을 통째로 다시 학습하는 대신, <b>변화량을 rank 가 아주 낮은 행렬</b>로 표현해 조금만
          학습하는 기법(Low-Rank Adaptation). "변화의 진짜 정보는 저차원"이라는 통찰을 그대로 쓴 거예요.
        </li>
        <li>
          <b>저랭크 근사 → ch11 SVD 예고</b>: 추천 시스템의 거대한 평점 행렬도 실제로는
          "취향 축 몇 개"짜리 낮은 rank 로 잘 근사됩니다. 이 숨은 축들의 실무 이름이
          <b>잠재 요인(latent factor)</b> — 이걸 자동으로 찾아 주는 도구가 SVD 예요(ch11).
        </li>
      </ul>
    </ConceptCard>

    <!-- 8. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">7. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="기저·차원·rank — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="선형결합이란 벡터들에 숫자를 곱해(스칼라배) 더한 것이다."
        type="truefalse"
        :answer="0"
        explanation="참. '늘리고 + 합치기'만 쓴 조합이 선형결합입니다."
      />
      <Quiz
        difficulty="easy"
        question="두 벡터가 '선형독립'이라는 말의 뜻으로 가장 알맞은 것은?"
        :choices="['어느 쪽도 다른 쪽의 배수가 아니다 — 각자 새 방향(정보)을 보탠다', '두 벡터의 길이가 같다', '두 벡터가 모두 원점에서 시작한다']"
        :answer="0"
        explanation="독립 = 서로를 선형결합으로 못 만든다. 벡터 2개면 '평행하지 않다'와 같은 말입니다."
      />
      <Quiz
        difficulty="easy"
        question="평행한 두 벡터(한쪽이 다른 쪽의 배수)의 span 은 직선 하나다."
        type="truefalse"
        :answer="0"
        explanation="참. 재료가 사실상 한 방향뿐이라 그 직선을 벗어날 수 없어요."
      />
      <Quiz
        difficulty="easy"
        question="2차원 평면의 기저가 되려면 무엇이 필요할까요?"
        :choices="['선형독립인 벡터 2개', '아무 벡터나 3개', '길이가 1인 벡터 1개']"
        :answer="0"
        explanation="기저 = 공간을 생성하는 독립 벡터 묶음. 평면은 독립 벡터 2개가 필요하고 또 충분합니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="열벡터가 u=(1,2), v=(2,4) 인 2×2 행렬의 rank 는?"
        type="numeric"
        :answer="1"
        :hints="['v 와 u 의 관계부터 보세요 — v 는 u 의 몇 배?', '독립인 열의 개수가 rank 입니다.']"
        explanation="v = 2u (종속) 이므로 독립인 열은 1개 → rank 1."
      />
      <Quiz
        difficulty="medium"
        question="2차원 평면에서는 어떤 벡터 3개를 골라도 반드시 선형종속이다."
        type="truefalse"
        :answer="0"
        :hints="['평면의 차원(=독립 벡터의 최대 개수)은 몇이었나요?']"
        explanation="참. 2차원의 독립 벡터는 최대 2개 — 셋째는 반드시 앞 둘의 선형결합이 됩니다."
      />
      <Quiz
        difficulty="medium"
        question="3×3 행렬에서 셋째 열이 '첫째 열 + 둘째 열'과 같다면 rank 는? (첫째·둘째 열은 독립)"
        type="numeric"
        :answer="2"
        :hints="['셋째 열은 앞 두 열의 선형결합 — 새 정보인가요?']"
        explanation="셋째 열은 재탕이므로 독립인 열은 2개 → rank 2."
      />
      <Quiz
        difficulty="medium"
        question="2×2 행렬에서 '행렬식 ≠ 0' 과 같은 뜻인 것은?"
        :choices="['rank = 2 (열들이 독립, 역행렬 존재)', 'rank = 0', '모든 원소가 0이 아니다']"
        :answer="0"
        :hints="['ch6: 행렬식 0 = 평행사변형이 납작 = 열이 평행.']"
        explanation="det ≠ 0 ⟺ 두 열이 독립 ⟺ rank 2 ⟺ 역행렬 존재. 전부 같은 상황의 다른 표현이에요."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="u=(2,1), v=(4,2) 가 독립인지 행렬식으로 판별하세요. det = u_x·v_y − u_y·v_x 를 단계별로 계산합니다."
        :steps="[
          { lhs: 'u_x \\times v_y = 2 \\times 2', answer: 4 },
          { lhs: 'u_y \\times v_x = 1 \\times 4', answer: 4 },
          { lhs: '\\det = 4 - 4', answer: 0 },
        ]"
        :hints="['각 곱을 먼저 구하고 마지막에 뺍니다.', 'det 가 0이면 종속!']"
        explanation="det = 0 → 종속 (v = 2u). 두 벡터의 정보는 1차원어치, rank 1 입니다."
      />
      <Quiz
        difficulty="hard"
        question="거대 AI 모델을 통째로 재학습하지 않고, 가중치의 변화량을 아주 낮은 rank 의 행렬로 표현해 값싸게 파인튜닝하는 기법(LoRA)의 핵심 아이디어는?"
        :choices="['변화의 진짜 정보는 저차원 — 낮은 rank 로 충분히 표현된다', '행렬식이 클수록 학습이 빠르다', '역행렬을 미리 계산해 둔다']"
        :answer="0"
        :hints="['LoRA 의 R 은 Rank 의 R — 이 챕터의 주제 그 자체입니다.']"
        explanation="Low-Rank Adaptation: 거대한 가중치 변화 행렬을 rank 가 낮은 두 행렬의 곱으로 근사해, 학습할 숫자를 크게 줄입니다."
      />
    </QuizSet>

    <NotebookCard />

    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch09_basis_rank.ipynb</code> 에서 <code>np.linalg.matrix_rank</code> 로
      rank 를 재고, 독립/종속인 벡터들의 span 을 그림으로 확인합니다. 키(cm)/키(inch) 같은
      중복 열 데이터의 rank 도 직접 재봐요.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch9')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 9 완료 — '진짜 정보량'을 재는 눈이 생겼습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 직교성과 투영(ch10) — "가장 가까운 답"을 찾는 최소제곱의 원리로 이어집니다.
      </p>
      <RouterLink
        to="/ch/ch10"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 직교성과 투영 →
      </RouterLink>
    </div>
  </article>
</template>
