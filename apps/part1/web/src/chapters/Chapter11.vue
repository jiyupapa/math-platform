<script setup lang="ts">
// Phase 11 · 특이값분해(SVD) — ML에서 가장 중요한 분해
import { ref, computed } from 'vue'
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch11')
}

// ── 단위원 → 타원 데모: 슬라이더로 행렬을 바꾸면 타원과 특이값이 실시간 갱신
const a = ref(1.5)
const b = ref(0.5)
const c = ref(0)
const d = ref(1)

// 2x2 SVD 를 직접 계산: AᵀA 의 고유값의 제곱근이 특이값, 고유벡터가 V
const svd = computed(() => {
  const e = a.value * a.value + c.value * c.value
  const f = a.value * b.value + c.value * d.value
  const g = b.value * b.value + d.value * d.value
  const disc = Math.sqrt((e - g) * (e - g) + 4 * f * f)
  const s1 = Math.sqrt(Math.max(0, (e + g + disc) / 2))
  const s2 = Math.sqrt(Math.max(0, (e + g - disc) / 2))
  // λ1 에 대응하는 AᵀA 의 고유벡터 v1 (f=0 이면 축 방향이 그대로 답)
  let v1: [number, number]
  if (Math.abs(f) > 1e-12) {
    const len = Math.hypot(f, (e + g + disc) / 2 - e)
    v1 = [f / len, ((e + g + disc) / 2 - e) / len]
  } else {
    v1 = e >= g ? [1, 0] : [0, 1]
  }
  const v2: [number, number] = [-v1[1], v1[0]]
  // 타원의 두 축 = A·v1 (길이 σ1), A·v2 (길이 σ2)
  const axis1: [number, number] = [a.value * v1[0] + b.value * v1[1], c.value * v1[0] + d.value * v1[1]]
  const axis2: [number, number] = [a.value * v2[0] + b.value * v2[1], c.value * v2[0] + d.value * v2[1]]
  return { s1, s2, axis1, axis2 }
})
const detA = computed(() => a.value * d.value - b.value * c.value)

// SVG 좌표 변환 (수학 → 화면)
const SIZE = 360
const RANGE = 3.5
const scale = SIZE / (RANGE * 2)
function X(x: number) {
  return SIZE / 2 + x * scale
}
function Y(y: number) {
  return SIZE / 2 - y * scale
}
// 단위원 위 점들을 행렬로 보낸 결과 (타원)
const ellipsePoints = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= 72; i++) {
    const t = (i / 72) * Math.PI * 2
    const ux = Math.cos(t)
    const uy = Math.sin(t)
    pts.push(`${X(a.value * ux + b.value * uy)},${Y(c.value * ux + d.value * uy)}`)
  }
  return pts.join(' ')
})
function fmt(n: number) {
  return Math.round(n * 100) / 100
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">11장 · AI 심화 확장 🌟</p>
    <h1 class="mb-4 text-3xl font-bold">특이값분해(SVD) — ML에서 가장 중요한 분해</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      지금까지 배운 도구가 전부 모이는 챕터입니다. SVD 는 <b>S</b>ingular <b>V</b>alue
      <b>D</b>ecomposition 의 약자로, 우리말로는 <b>특이값분해</b>("특이값으로 분해하기")예요.
      이 도구는 <b>어떤 행렬이든</b>(정사각형이 아니어도, 어떤 데이터든)
      <b>회전·확대·회전</b>이라는 세 조각으로
      분해해서 <b>중요한 정보 순서로 줄 세워</b> 줍니다. 추천 시스템·이미지 압축·차원축소가
      전부 이 하나에서 나와요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>모든 행렬은 단위원을 <b>타원</b>으로 보낸다. <b>특이값 = 타원의 반지름</b>임을 안다</li>
        <li><b>A = UΣVᵀ</b> (회전·확대·회전) 분해의 뜻을 안다</li>
        <li>고유값(ch7)과의 차이: SVD 는 <b>아무 행렬에나</b> 된다는 걸 안다</li>
        <li><b>저랭크 근사</b>: 중요한 축 k 개로 행렬을 압축하는 원리를 안다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 왜 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 넷플릭스 문제: 거대한 표의 빈칸 채우기</h2>
    <ReviewFlag id="ch11-s1" chapter="ch11" label="1. 넷플릭스 문제" />
    <p class="leading-relaxed text-slate-700">
      사용자 1억 명 × 영화 1만 편의 평점 표를 상상해 보세요. 거의 다 <b>빈칸</b>입니다
      (아무도 영화를 1만 편씩 보진 않으니까). 그런데 ch9에서 봤듯 이런 표는 사실
      <b>"취향 축" 몇 개짜리 낮은 rank</b> 예요. 추천시스템 실무에서는 이 숨은 축을
      <b>잠재 요인(latent factor, 레이턴트 팩터)</b>이라 부릅니다. 그 취향 축(잠재 요인)을
      <b>자동으로, 중요한 순서대로</b> 찾아주는 도구가 SVD 입니다. 축을 찾으면 빈칸도
      예측할 수 있죠. 그게 추천이에요.
    </p>

    <!-- 2. 원 → 타원 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 모든 행렬은 원을 타원으로 보낸다</h2>
    <ReviewFlag id="ch11-s2" chapter="ch11" label="2. 원을 타원으로" />
    <p class="leading-relaxed text-slate-700">
      ch5에서 행렬은 "공간을 변형하는 함수"였죠. <b>단위원</b>(반지름 1인 원) 위의 점들을 행렬에
      넣으면 신기하게도 결과는 <b>항상 타원</b>입니다. 아무리 비틀어도 타원을 벗어나지 않아요.
      그 타원의 <b>가장 긴 반지름과 가장 짧은 반지름</b>, 그러니까 "이 행렬이 공간을
      <b>가장 많이 늘리는 방향의 배율과 가장 적게 늘리는 방향의 배율</b>",
      이 두 숫자가 <b>특이값</b>입니다.
      <span class="text-slate-500">(두 번째 배율이 1보다 작으면 그 방향은 줄어드는 거고요)</span>
    </p>

    <ConceptCard tone="note" title="새 용어: 특이값">
      <p>
        <b>특이값(singular value, 싱귤러 밸류)</b>: 기호는 <MathBlock inline expr="\sigma_1, \sigma_2, \dots" />
        (시그마). 행렬이 단위원을 타원으로 보낼 때 <b>타원의 반지름들</b> = 각 방향의 <b>확대 배율</b>.
        항상 <b>0 이상</b>이고, 큰 것부터 <MathBlock inline expr="\sigma_1 \ge \sigma_2 \ge \cdots \ge 0" />
        순서로 적는 게 약속이에요(≥ 는 "크거나 같다"). "중요한 순서로 줄 세우기"가 여기서 나옵니다.
      </p>
    </ConceptCard>

    <p class="mt-4 leading-relaxed text-slate-700">
      슬라이더로 행렬을 바꿔 보세요. 회색 점선이 단위원, 파란 곡선이 변환 결과(타원),
      초록·주황 선이 타원의 두 축(길이 = <MathBlock inline expr="\sigma_1, \sigma_2" />)입니다.
    </p>
    <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
      <svg :viewBox="`0 0 ${SIZE} ${SIZE}`" class="mx-auto block w-full max-w-[360px]">
        <!-- 좌표축 -->
        <line :x1="0" :y1="Y(0)" :x2="SIZE" :y2="Y(0)" stroke="var(--c-slate-200)" />
        <line :x1="X(0)" :y1="0" :x2="X(0)" :y2="SIZE" stroke="var(--c-slate-200)" />
        <!-- 단위원 (변환 전) -->
        <circle :cx="X(0)" :cy="Y(0)" :r="scale" fill="none" stroke="var(--c-slate-400)" stroke-dasharray="5 4" />
        <!-- 변환 결과 타원 -->
        <polygon :points="ellipsePoints" fill="rgba(99,102,241,0.08)" stroke="var(--c-indigo-500)" stroke-width="2" />
        <!-- 타원의 두 축 (σ1, σ2) -->
        <line :x1="X(0)" :y1="Y(0)" :x2="X(svd.axis1[0])" :y2="Y(svd.axis1[1])" stroke="var(--c-emerald-500)" stroke-width="3" />
        <line :x1="X(0)" :y1="Y(0)" :x2="X(svd.axis2[0])" :y2="Y(svd.axis2[1])" stroke="var(--c-amber-500)" stroke-width="3" />
        <circle :cx="X(svd.axis1[0])" :cy="Y(svd.axis1[1])" r="4" fill="var(--c-emerald-500)" />
        <circle :cx="X(svd.axis2[0])" :cy="Y(svd.axis2[1])" r="4" fill="var(--c-amber-500)" />
      </svg>
      <div class="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <label class="flex items-center gap-2">
          <span class="w-14 shrink-0 font-mono">a={{ a.toFixed(2) }}</span>
          <input v-model.number="a" type="range" min="-2" max="2" step="0.25" class="flex-1" />
        </label>
        <label class="flex items-center gap-2">
          <span class="w-14 shrink-0 font-mono">b={{ b.toFixed(2) }}</span>
          <input v-model.number="b" type="range" min="-2" max="2" step="0.25" class="flex-1" />
        </label>
        <label class="flex items-center gap-2">
          <span class="w-14 shrink-0 font-mono">c={{ c.toFixed(2) }}</span>
          <input v-model.number="c" type="range" min="-2" max="2" step="0.25" class="flex-1" />
        </label>
        <label class="flex items-center gap-2">
          <span class="w-14 shrink-0 font-mono">d={{ d.toFixed(2) }}</span>
          <input v-model.number="d" type="range" min="-2" max="2" step="0.25" class="flex-1" />
        </label>
      </div>
      <div class="mt-3 rounded-lg bg-slate-50 p-3 text-sm font-mono text-slate-700">
        <p>
          <span class="text-emerald-700">σ1 = {{ fmt(svd.s1) }}</span> ·
          <span class="text-amber-700">σ2 = {{ fmt(svd.s2) }}</span>
          &nbsp;|&nbsp; σ1×σ2 = {{ fmt(svd.s1 * svd.s2) }} = |det| = {{ fmt(Math.abs(detA)) }}
        </p>
        <p v-if="svd.s2 < 0.05" class="mt-1 text-amber-700">
          ⚠️ σ2 ≈ 0: 타원이 납작해져 직선이 됐어요. 이 행렬은 rank 1 (ch9의 '종속'!)
        </p>
      </div>
    </div>
    <ConceptCard tone="tip" title="ch6·ch9 와 연결">
      특이값을 <b>전부 곱하면 |행렬식|</b>. 넓이 배율(ch6)이 축별 배율의 곱이라는 뜻이에요.
      그리고 <b>0이 아닌 특이값의 개수가 곧 rank</b>(ch9)예요. σ2 가 0이 되는 순간 타원이
      직선으로 납작해지는 걸 위 데모에서 직접 확인해 보세요 (예: c, d 를 a, b 의 배수로).
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="특이값은 행렬이 단위원을 타원으로 보낼 때, 타원의 반지름(각 방향의 확대 배율)이다."
      type="truefalse"
      :answer="0"
      explanation="참. σ1 = 최대 확대 배율, σ2 = 그다음 배율. 항상 0 이상, 큰 순서로 적습니다."
    />

    <!-- 3. 분해식 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. A = UΣVᵀ: 회전 · 확대 · 회전</h2>
    <ReviewFlag id="ch11-s3" chapter="ch11" label="3. A = UΣVᵀ" />
    <p class="leading-relaxed text-slate-700">
      "원이 항상 타원이 된다"는 사실을 식으로 쓴 게 SVD 입니다. 어떤 행렬 A 든 딱 세 조각으로
      쪼개져요:
    </p>
    <MathBlock expr="A = U\,\Sigma\,V^{\mathsf T}" />
    <ConceptCard tone="note" title="세 조각의 정체 (오른쪽부터 읽어요)">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <MathBlock inline expr="V^{\mathsf T}" /> (브이 전치): 첫 번째 <b>회전</b>.
          V 의 열들은 서로 수직이고 길이가 1인, ch10에서 배운 <b>정규직교기저</b>예요.
          입력을 "타원이 되기 좋은 각도"로 돌려놓습니다.
        </li>
        <li>
          <MathBlock inline expr="\Sigma" /> (대문자 시그마, 대각행렬): <b>축 방향 확대</b>.
          대각선에 특이값 <MathBlock inline expr="\sigma_1 \ge \sigma_2 \ge \cdots" /> 가
          큰 순서로 들어있고 나머지는 전부 0. 여기서만 모양이 변해요.
          (같은 글자의 대소문자예요. 소문자 <MathBlock inline expr="\sigma" /> 는 숫자 하나,
          대문자 <MathBlock inline expr="\Sigma" /> 는 그 숫자들을 담은 행렬.)
        </li>
        <li>
          <MathBlock inline expr="U" /> (유): 마지막 <b>회전</b>. 늘려 놓은 결과를 최종 방향으로
          돌립니다. U 의 열들도 정규직교.
        </li>
      </ul>
      <p class="mt-2 text-sm text-slate-600">
        즉 <b>아무리 복잡한 변환도 = 돌리고 → 축 따라 늘리고 → 다시 돌리기</b>.
        복잡함은 전부 회전에 몰아넣고, "얼마나 중요한가"는 Σ 안의 숫자 몇 개로 정리되는 거예요.
      </p>
    </ConceptCard>

    <ConceptCard tone="warn" title="고유값(ch7)과 뭐가 다른가요?">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          ch7의 고유값·고유벡터로 행렬을 쪼개는 것을 <b>고유분해(eigendecomposition)</b>라
          불러요(이름만 알면 충분). 고유분해는 <b>정사각행렬</b>, 그중에서도 조건이 맞는 경우에만
          가능해요.
        </li>
        <li>
          <b>SVD 는 아무 행렬에나</b> 됩니다. 100만×1만 데이터 행렬도 OK. 그래서 데이터를 다루는
          ML 에선 SVD 가 주인공이에요.
        </li>
        <li>
          연결고리: <MathBlock inline expr="A^{\mathsf T}A" /> 의 <b>고유값의 제곱근이 특이값</b>,
          고유벡터가 V. ch8 PCA(공분산행렬의 고유분해)를 데이터 행렬에서 바로 하는 게 SVD 라서,
          <b>PCA 는 사실상 SVD 로 계산</b>합니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="SVD 의 세 조각 U, Σ, Vᵀ 는 각각 어떤 변환일까요?"
      :choices="['회전 · 축 방향 확대 · 회전', '평행이동 · 확대 · 평행이동', '덧셈 · 곱셈 · 덧셈']"
      :answer="0"
      :hints="['모양이 변하는(늘어나는) 조각은 가운데 Σ 하나뿐이에요.']"
      explanation="Vᵀ(회전) → Σ(축 방향 확대) → U(회전). 어떤 행렬이든 이 순서로 분해됩니다."
    />

    <!-- 4. 저랭크 근사 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 저랭크 근사: 중요한 축만 남기고 버리기</h2>
    <ReviewFlag id="ch11-s4" chapter="ch11" label="4. 저랭크 근사" />
    <p class="leading-relaxed text-slate-700">
      SVD 의 진짜 위력은 여기입니다. 분해식을 풀어 쓰면 A 는 <b>rank 1 조각들의 합</b>이 돼요:
    </p>
    <MathBlock expr="A = \sigma_1 \vec{u}_1 \vec{v}_1^{\mathsf T} + \sigma_2 \vec{u}_2 \vec{v}_2^{\mathsf T} + \cdots \quad (\sigma_1 \ge \sigma_2 \ge \cdots)" />
    <ConceptCard tone="note" title="잠깐: 벡터 × 벡터가 행렬이 된다고?">
      <p class="mb-2">
        <MathBlock inline expr="\vec{u}\vec{v}^{\mathsf T}" /> ("유, 브이 전치")는 <b>세로 벡터 ×
        가로 벡터</b>의 곱이에요. ch3의 곱셈 규칙 그대로, (2×1)·(1×2) → <b>2×2 행렬</b>이
        나옵니다. 처음 보는 조합이니 숫자로 한 번만 확인해 봐요:
      </p>
      <MathBlock expr="\begin{bmatrix} 2 \\ 1 \end{bmatrix}\begin{bmatrix} 3 & 4 \end{bmatrix} = \begin{bmatrix} 2 \times 3 & 2 \times 4 \\ 1 \times 3 & 1 \times 4 \end{bmatrix} = \begin{bmatrix} 6 & 8 \\ 3 & 4 \end{bmatrix}" />
      <p class="mt-2 text-sm text-slate-600">
        결과의 모든 열이 (2,1)의 배수인 게 보이나요? 그래서
        <MathBlock inline expr="\vec{u}\vec{v}^{\mathsf T}" /> 는 항상 <b>rank 1</b>(ch9!). 이것이
        위 식을 "rank 1 조각들의 합"이라 부르는 이유입니다.
      </p>
    </ConceptCard>
    <p class="leading-relaxed text-slate-700">
      각 조각의 중요도가 <MathBlock inline expr="\sigma" /> 크기 순서로 <b>이미 정렬</b>되어
      있으니 <b>앞에서 k 개만 남기고 나머지를 버리면</b> A 와 가장 가까운 rank k 행렬이 됩니다
      (이게 <b>최선</b>의 근사라는 게 수학적으로 증명돼 있어요). ch8 PCA 의 "덜 중요한 축
      버리기"의 일반판이죠.
    </p>
    <ConceptCard tone="tip" title="숫자로 보는 압축 효과">
      <p class="mb-2">
        100×100 이미지(숫자 <b>10,000개</b>)를 rank 5 로 근사하면, 조각 하나당
        <MathBlock inline expr="\sigma" /> 1개 + <MathBlock inline expr="\vec{u}" /> 100개 +
        <MathBlock inline expr="\vec{v}" /> 100개 = 201개, 5조각이면 <b>1,005개</b>.
        <b>10분의 1 크기</b>로 줄었는데 눈으로는 비슷해 보여요 (노트북에서 직접 확인!).
      </p>
      <p class="text-sm text-slate-600">
        덤: 작은 σ 조각은 대개 <b>잡음</b>이라, 버리면 오히려 데이터가 깨끗해집니다(노이즈 제거).
      </p>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="특이값이 σ = (10, 5, 0.1) 인 행렬에서 0.1 조각을 버리고 근사하면 rank 는 몇이 될까요?"
      type="numeric"
      :answer="2"
      :hints="['남은 조각(0이 아닌 특이값)의 개수 = rank.']"
      explanation="σ1=10, σ2=5 두 조각만 남으므로 rank 2. 0.1은 정보가 거의 없어 버려도 티가 안 나요."
    />

    <!-- 5. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 SVD 가 AI에서 쓰이는 곳</h2>
    <ReviewFlag id="ch11-ai" chapter="ch11" label="🤖 AI에서 쓰이는 곳" />
    <ConceptCard tone="ai" title="실제 활용: 'ML에서 가장 중요한 분해'인 이유">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>추천 시스템</b>: 평점 행렬을 SVD 로 저랭크 분해하면 <MathBlock inline expr="\vec{u}" />
          = 사용자의 취향 좌표, <MathBlock inline expr="\vec{v}" /> = 영화의 성격 좌표
          (둘 다 1절의 <b>잠재 요인(latent factor)</b> 벡터).
          두 좌표의 내적(ch2!)으로 <b>안 본 영화의 평점을 예측</b>합니다. 넷플릭스 100만 달러
          대회(2006~2009)의 우승 재료가 바로 이 계열이었어요.
        </li>
        <li>
          <b>이미지 압축·노이즈 제거</b>: 큰 σ = 큰 구조, 작은 σ = 잔 디테일과 잡음.
          앞 조각만 남기면 압축, 잡음 조각을 버리면 복원.
        </li>
        <li>
          <b>차원축소 = PCA 의 실제 계산법</b>: 라이브러리의 PCA 는 내부에서 대부분 SVD 를 돌립니다.
          수치적으로 더 안정적이거든요(ch10 QR 과 같은 이유).
        </li>
        <li>
          <b>임베딩의 원조(LSA)</b>: 단어×문서 행렬을 SVD 로 저랭크 분해해 "의미 축"을 뽑던
          잠재의미분석이 워드 임베딩의 조상입니다. ch9의 <b>LoRA</b> 도 "변화는 저랭크면 충분"이라는
          같은 통찰이었죠.
        </li>
      </ul>
    </ConceptCard>

    <!-- 6. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="SVD: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="SVD 는 정사각형이 아닌 행렬에도 쓸 수 있다."
        type="truefalse"
        :answer="0"
        explanation="참. 아무 모양의 행렬이든 분해됩니다. 고유분해와의 결정적 차이예요."
      />
      <Quiz
        difficulty="easy"
        question="Σ(시그마) 행렬 안에 들어있는 것은?"
        :choices="['특이값들(대각선에 큰 순서로)', '회전 각도들', '행렬 원소의 평균값']"
        :answer="0"
        explanation="Σ 는 대각행렬이고, 대각선에 σ1 ≥ σ2 ≥ … 가 큰 순서로 들어있습니다."
      />
      <Quiz
        difficulty="easy"
        question="특이값은 음수가 될 수 있다."
        type="truefalse"
        :answer="1"
        explanation="거짓. 특이값은 '확대 배율'이라 항상 0 이상입니다. (고유값은 음수 가능, 이게 차이점!)"
      />
      <Quiz
        difficulty="easy"
        question="단위원을 어떤 2×2 행렬로 변환하면 결과는 항상?"
        :choices="['타원 (납작해지면 직선)', '정사각형', '더 큰 원만 가능']"
        :answer="0"
        explanation="항상 타원입니다. 그 타원의 반지름들이 특이값이에요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="0이 아닌 특이값의 개수는 그 행렬의 rank(ch9)와 같다."
        type="truefalse"
        :answer="0"
        :hints="['σ2 = 0 이 되는 순간 타원이 직선으로 납작해졌죠. 그때 rank 는?']"
        explanation="참. 특이값이 0이 되는 만큼 차원이 납작해집니다. rank = 0 아닌 σ 의 개수."
      />
      <Quiz
        difficulty="medium"
        question="SVD 에서 U 와 V 의 열벡터들의 성질은? (ch10 복습)"
        :choices="['서로 수직이고 길이가 1 (정규직교)', '모두 평행하다', '전부 음수다']"
        :answer="0"
        explanation="U, V 는 정규직교 열들로 이루어진 회전(직교행렬)입니다. 모양 변화는 Σ 만 담당해요."
      />
      <Quiz
        difficulty="medium"
        question="σ1 = 4, σ2 = 0.5 인 2×2 행렬의 |행렬식| 은? (ch6 연결)"
        type="numeric"
        :answer="2"
        :hints="['|det| = 특이값들의 곱 = 넓이 배율.']"
        explanation="|det| = σ1 × σ2 = 4 × 0.5 = 2. 넓이 배율은 축별 배율의 곱입니다."
      />
      <Quiz
        difficulty="medium"
        question="PCA(ch8)와 SVD 의 관계로 맞는 것은?"
        :choices="['PCA 는 실제로 대부분 SVD 로 계산된다 (수치적으로 안정적)', '둘은 전혀 무관하다', 'PCA 가 SVD 보다 더 일반적인 분해다']"
        :answer="0"
        :hints="['AᵀA 의 고유값의 제곱근 = 특이값.']"
        explanation="공분산행렬의 고유분해(PCA)는 데이터 행렬의 SVD 와 같은 계산이라 라이브러리도 SVD 를 씁니다."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="대각행렬 A = [[3,0],[0,2]] 의 특이값과 |행렬식| 을 구하세요. (대각행렬의 특이값 = 대각 원소의 절댓값)"
        :steps="[
          { lhs: '\\sigma_1', answer: 3 },
          { lhs: '\\sigma_2', answer: 2 },
          { lhs: '|\\det| = \\sigma_1 \\times \\sigma_2', answer: 6 },
        ]"
        :hints="['이 행렬은 x 방향 3배, y 방향 2배로 늘리기만 해요. 회전이 필요 없죠.', '큰 것이 σ1 입니다.']"
        explanation="σ1=3, σ2=2, |det|=6. 대각행렬은 이미 '확대만 하는' 꼴이라 Σ 그 자체입니다."
      />
      <Quiz
        difficulty="hard"
        question="100×100 이미지(숫자 10,000개)를 rank 5 로 SVD 근사하면 저장할 숫자는 몇 개일까요? (조각당 σ 1개 + u 100개 + v 100개)"
        type="numeric"
        :answer="1005"
        :hints="['조각 하나 = 1 + 100 + 100 = 201개.', '201 × 5 = ?']"
        explanation="5 × (1+100+100) = 1,005개로 원본의 약 1/10. 이게 SVD 압축의 힘입니다."
      />
    </QuizSet>

    <NotebookCard />

    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch11_svd.ipynb</code> 에서 <code>np.linalg.svd</code> 로 분해를 확인하고,
      100×100 이미지를 rank 1 / 5 / 20 으로 복원해 압축 효과를 눈으로 봅니다. 특이값 크기
      분포(누적 정보 비율, '에너지'라고도 불러요)도 그려봐요.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch11')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">11장 완료! ML에서 가장 중요한 분해를 손에 넣었습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        마지막은 그래디언트(ch12). AI 가 실제로 '학습'하는 원리로 여정을 마무리합니다.
      </p>
      <RouterLink
        to="/ch/ch12"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        마지막 챕터: 그래디언트와 경사하강 →
      </RouterLink>
    </div>
  </article>
</template>
