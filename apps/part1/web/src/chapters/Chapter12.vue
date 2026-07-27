<script setup lang="ts">
// Phase 12 · 그래디언트와 행렬미분 — AI '학습'의 심장 (마지막 챕터)
import { ref, computed, onUnmounted } from 'vue'
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
  progress.markDone('ch12')
}

// ── 경사하강 데모: 손실 곡선 위에서 공이 기울기 반대 방향으로 굴러 내려간다
// 골짜기가 두 개인 곡선 — 시작점에 따라 다른 골짜기(지역 최소값)에 도착한다
function lossF(w: number) {
  return ((w * w - 4) * (w * w - 4)) / 8 + 0.3 * w + 1
}
function lossGrad(w: number) {
  return (w * (w * w - 4)) / 2 + 0.3
}

const w = ref(3.2)
const lr = ref(0.1)
const steps = ref(0)
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const diverged = computed(() => !Number.isFinite(w.value) || Math.abs(w.value) > 6)
const converged = computed(() => !diverged.value && Math.abs(lossGrad(w.value)) < 0.005)

function stepOnce() {
  if (diverged.value || converged.value) {
    stopPlay()
    return
  }
  w.value -= lr.value * lossGrad(w.value)
  steps.value++
}
function stopPlay() {
  playing.value = false
  if (timer !== undefined) {
    clearInterval(timer)
    timer = undefined
  }
}
function togglePlay() {
  if (playing.value) {
    stopPlay()
  } else {
    playing.value = true
    timer = setInterval(stepOnce, 250)
  }
}
function resetTo(start: number) {
  stopPlay()
  w.value = start
  steps.value = 0
}
onUnmounted(stopPlay)

// SVG 좌표 변환
const W = 360
const H = 240
function X(x: number) {
  return ((x + 3.6) / 7.2) * W
}
function Y(y: number) {
  return H - 14 - (y / 10) * (H - 28)
}
const curvePoints = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= 120; i++) {
    const x = -3.6 + (i / 120) * 7.2
    pts.push(`${X(x)},${Y(lossF(x))}`)
  }
  return pts.join(' ')
})
const ballX = computed(() => X(Math.max(-3.6, Math.min(3.6, w.value))))
const ballY = computed(() => Y(lossF(Math.max(-3.6, Math.min(3.6, w.value)))))
// 공 옆에 "가야 할 방향" 화살표 (기울기 반대 방향)
const arrowDx = computed(() => (lossGrad(w.value) > 0 ? -28 : 28))
function fmt(n: number) {
  return Math.round(n * 1000) / 1000
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 12 · AI 심화 확장 — 마지막 챕터</p>
    <h1 class="mb-4 text-3xl font-bold">그래디언트와 경사하강 — AI 가 '배우는' 원리</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      드디어 마지막 조각입니다. 지금까지 신경망이 데이터를 <b>어떻게 처리하는지</b>(벡터·행렬곱·변환)를
      배웠다면, 이 챕터는 신경망이 <b>어떻게 좋아지는지</b> — 즉 <b>학습</b> 그 자체를 다룹니다.
      핵심은 단 한 줄: <b>"틀린 정도가 줄어드는 방향으로 조금씩 움직여라."</b>
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>손실함수</b> — '틀린 정도'를 숫자 하나로 만드는 법을 안다</li>
        <li><b>기울기</b> — 지금 위치에서 어느 쪽이 내리막인지 아는 법을 안다</li>
        <li><b>경사하강법</b> — 공을 굴려 손실의 골짜기를 찾는다 (직접 굴려보기!)</li>
        <li><b>그래디언트·역전파</b> — 변수 수억 개짜리 진짜 AI 학습으로 확장한다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 손실 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 손실 — '틀린 정도'를 숫자 하나로</h2>
    <ReviewFlag id="ch12-s1" chapter="ch12" label="1. 손실함수" />
    <p class="leading-relaxed text-slate-700">
      모델을 좋게 만들려면 먼저 <b>"얼마나 나쁜가"를 잴 수 있어야</b> 합니다.
      예측과 정답의 차이를 (보통 제곱해서 — ch10 최소제곱과 같은 이유로) 전부 더한 것,
      그게 손실이에요. 모델의 가중치 <MathBlock inline expr="w" /> 를 바꾸면 손실도 바뀌니까,
      <b>손실은 가중치의 함수</b> <MathBlock inline expr="L(w)" /> 입니다.
    </p>
    <ConceptCard tone="note" title="새 용어 — 손실함수">
      <p>
        <b>손실함수(loss function, 로스 펑션)</b>: 기호 <MathBlock inline expr="L(w)" />
        ("엘 더블유" — 가중치 w 일 때의 손실). 모델이 얼마나 틀렸는지를 <b>숫자 하나</b>로 나타낸
        함수. 학습의 목표는 이 숫자를 <b>가장 작게</b> 만드는 w 를 찾는 것 — 즉
        <b>손실 그래프에서 가장 낮은 골짜기 찾기</b>예요.
      </p>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="손실함수는 모델이 얼마나 틀렸는지를 숫자 하나로 나타내며, 학습의 목표는 이를 최소화하는 것이다."
      type="truefalse"
      :answer="0"
      explanation="참. '나쁨을 잴 수 있으면 줄일 수도 있다' — 학습의 출발점입니다."
    />

    <!-- 2. 기울기 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 기울기 — 어느 쪽이 내리막인가</h2>
    <ReviewFlag id="ch12-s2" chapter="ch12" label="2. 기울기" />
    <p class="leading-relaxed text-slate-700">
      안개 낀 산에서 골짜기로 내려가야 한다면? 멀리는 안 보여도 <b>발밑의 경사</b>는 느낄 수 있죠.
      수학에서 그 발밑 경사가 <b>기울기</b>입니다: "w 를 <b>아주 조금</b> 늘렸을 때 손실이
      얼마나 변하는가"의 비율이에요.
    </p>
    <ConceptCard tone="note" title="새 용어 — 기울기 (그리고 미분 살짝)">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>기울기(slope)</b>: 기호 <MathBlock inline expr="L'(w)" /> ("엘 프라임" — L 의 기울기).
          <b>양수면 오르막</b>(w 를 키우면 손실 증가), <b>음수면 내리막</b>, <b>0이면 평지</b>
          (골짜기 바닥 후보!).
        </li>
        <li>
          <b>미분(derivative, 데리버티브)</b>: 이 기울기를 정확히 계산하는 도구. 이 시리즈
          <b>2부(미적분)의 주인공</b>이라 여기선 "기울기를 구해주는 기계" 정도로만 알면 충분해요.
          필요한 기울기 공식은 문제에서 항상 알려드립니다.
        </li>
      </ul>
    </ConceptCard>

    <!-- 3. 경사하강 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 경사하강법 — 공 굴리기</h2>
    <ReviewFlag id="ch12-s3" chapter="ch12" label="3. 경사하강법" />
    <p class="leading-relaxed text-slate-700">
      전략은 단순합니다. <b>기울기의 반대 방향으로 한 걸음씩</b>:
    </p>
    <MathBlock expr="w_{\text{새}} = w_{\text{지금}} - \eta \cdot L'(w_{\text{지금}})" />
    <ConceptCard tone="note" title="새 용어 — 경사하강법 · 학습률">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>경사하강법(gradient descent, 그래디언트 디센트)</b>: 위 식을 반복해서 골짜기로
          내려가는 방법. 오르막(기울기 양수)이면 왼쪽으로, 내리막(음수)이면 오른쪽으로 —
          빼기 부호 하나가 방향을 자동으로 맞춰줘요.
        </li>
        <li>
          <b>학습률(learning rate)</b>: 기호 <MathBlock inline expr="\eta" /> (에타).
          <b>한 걸음의 크기</b>. 너무 작으면 하세월, 너무 크면 골짜기를 <b>뛰어넘어 발산</b>합니다.
          AI 학습에서 가장 자주 만지는 다이얼이에요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-4 leading-relaxed text-slate-700">
      직접 굴려보세요. 골짜기가 <b>두 개</b>인 손실 곡선입니다 — 시작점과 학습률에 따라
      결과가 어떻게 달라지는지 실험해 보세요.
    </p>
    <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
      <svg :viewBox="`0 0 ${W} ${H}`" class="mx-auto block w-full max-w-[420px]">
        <polyline :points="curvePoints" fill="none" stroke="var(--c-indigo-500)" stroke-width="2.5" />
        <!-- 가야 할 방향 화살표 -->
        <line
          v-if="!converged && !diverged"
          :x1="ballX" :y1="ballY - 16" :x2="ballX + arrowDx" :y2="ballY - 16"
          stroke="var(--c-amber-500)" stroke-width="2.5"
        />
        <circle
          v-if="!converged && !diverged"
          :cx="ballX + arrowDx" :cy="ballY - 16" r="3.5" fill="var(--c-amber-500)"
        />
        <!-- 공 -->
        <circle :cx="ballX" :cy="ballY" r="9" :fill="diverged ? 'var(--c-red-500)' : converged ? 'var(--c-emerald-500)' : 'var(--c-rose-500)'" stroke="var(--c-white)" stroke-width="2" />
      </svg>
      <div class="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <button class="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-500" @click="stepOnce">
          한 걸음 ▸
        </button>
        <button class="rounded-lg bg-slate-700 px-3 py-1.5 font-medium text-white hover:bg-slate-600" @click="togglePlay">
          {{ playing ? '정지 ⏸' : '자동 재생 ▶' }}
        </button>
        <button class="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100" @click="resetTo(3.2)">
          오른쪽에서 시작
        </button>
        <button class="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100" @click="resetTo(-0.6)">
          가운데서 시작
        </button>
      </div>
      <label class="mt-3 flex items-center gap-3 text-sm">
        <span class="w-32 shrink-0 font-mono">학습률 η = {{ lr.toFixed(2) }}</span>
        <input v-model.number="lr" type="range" min="0.02" max="0.8" step="0.02" class="flex-1" />
      </label>
      <div class="mt-3 rounded-lg bg-slate-50 p-3 text-sm font-mono text-slate-700">
        <p>걸음 {{ steps }} · w = {{ fmt(w) }} · 손실 L(w) = {{ diverged ? '💥' : fmt(lossF(w)) }} · 기울기 = {{ diverged ? '💥' : fmt(lossGrad(w)) }}</p>
        <p v-if="converged" class="mt-1 font-sans font-medium text-emerald-700">
          ✅ 수렴! 기울기 ≈ 0 — 골짜기 바닥에 도착했어요.
        </p>
        <p v-else-if="diverged" class="mt-1 font-sans font-medium text-red-600">
          💥 발산! 학습률이 너무 커서 골짜기를 뛰어넘었어요. η 를 줄이고 리셋해 보세요.
        </p>
      </div>
    </div>
    <ConceptCard tone="warn" title="실험에서 봤어야 할 두 가지">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <b>지역 최소값(local minimum)</b>: 오른쪽에서 시작하면 오른쪽 골짜기(더 얕음)에,
          가운데서 시작하면 왼쪽 골짜기(더 깊음)에 도착해요. 경사하강은 <b>발밑만 보고</b>
          내려가므로 도착한 골짜기가 <b>최선이라는 보장은 없습니다</b> — 실제 AI 학습의 유명한 고민거리.
        </li>
        <li>
          <b>학습률의 균형</b>: η = 0.02 로는 수십 걸음, η = 0.7 이상이면 발산.
          "적당히 크게, 발산 직전보다 작게"가 실전 감각이에요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="w = 5, 기울기 = 2, 학습률 η = 0.5 일 때 경사하강 한 걸음 후의 새 w 는?"
      type="numeric"
      :answer="4"
      :hints="['새 w = w − η × 기울기.', '5 − 0.5 × 2.']"
      explanation="5 − 0.5×2 = 4. 기울기가 양수(오르막)라 w 가 줄어드는(왼쪽) 방향으로 움직였어요."
    />

    <!-- 4. 그래디언트 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 그래디언트 — 기울기가 벡터가 되다</h2>
    <ReviewFlag id="ch12-s4" chapter="ch12" label="4. 그래디언트" />
    <p class="leading-relaxed text-slate-700">
      실제 신경망의 가중치는 1개가 아니라 <b>수억 개</b>입니다. 그럼 기울기도 "w₁ 방향 기울기,
      w₂ 방향 기울기, …" 수억 개가 생기죠. 이걸 한 줄로 묶으면 — 우리가 1챕터부터 쓰던
      <b>벡터</b>가 됩니다!
    </p>
    <MathBlock expr="\nabla L = \begin{bmatrix} w_1 \text{ 방향 기울기} \\ w_2 \text{ 방향 기울기} \\ \vdots \end{bmatrix}" />
    <ConceptCard tone="note" title="새 용어 — 그래디언트">
      <p class="mb-2">
        <b>그래디언트(gradient, 그래디언트)</b>: 기호 <MathBlock inline expr="\nabla L" />
        ("나블라 엘" — <MathBlock inline expr="\nabla" /> 는 나블라라고 읽어요).
        각 가중치 방향의 기울기를 <b>모아 놓은 벡터</b>. 이 벡터는 항상
        <b>손실이 가장 가파르게 증가하는 방향</b>을 가리킵니다 — 그래서 학습은 정확히
        <b>그 반대</b>로 갑니다:
      </p>
      <MathBlock expr="\vec{w}_{\text{새}} = \vec{w}_{\text{지금}} - \eta \, \nabla L" />
      <p class="mt-2 text-sm text-slate-600">
        아까의 공 굴리기 식과 <b>똑같은 모양</b> — 숫자가 벡터로 바뀌었을 뿐이에요.
        가중치 수억 개짜리 GPT 의 학습 한 걸음도 결국 이 한 줄입니다.
      </p>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="그래디언트 ∇L 이 가리키는 방향은?"
      :choices="['손실이 가장 가파르게 증가하는 방향 — 그래서 반대로 간다', '손실이 가장 빨리 줄어드는 방향 — 그대로 따라간다', '항상 원점 방향']"
      :answer="0"
      :hints="['경사하강 식에 빼기(−)가 붙어 있는 이유를 생각해 보세요.']"
      explanation="∇L 은 가장 가파른 오르막을 가리켜요. 빼기 부호로 그 반대(가장 빠른 내리막)로 움직입니다."
    />

    <!-- 5. 연쇄법칙과 역전파 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 역전파 — 층층이 쌓인 신경망의 기울기</h2>
    <ReviewFlag id="ch12-s5" chapter="ch12" label="5. 역전파" />
    <p class="leading-relaxed text-slate-700">
      신경망은 ch3에서 봤듯 <b>행렬곱(층)을 여러 겹</b> 쌓은 함수입니다. 그럼 맨 앞 층의
      가중치가 최종 손실에 주는 영향(기울기)은 어떻게 구할까요? 답: <b>거쳐 온 층들의 기울기를
      전부 곱하면</b> 됩니다.
    </p>
    <ConceptCard tone="note" title="새 용어 — 연쇄법칙 · 역전파">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>연쇄법칙(chain rule, 체인 룰)</b>: 함수를 거쳐 거쳐 가면 기울기는 <b>각 구간 기울기의
          곱</b>이라는 규칙. 환율 같아요 — 원→달러 2배, 달러→유로 3배면 원→유로는 6배.
          (정확한 문법은 2부 미적분에서!)
        </li>
        <li>
          <b>역전파(backpropagation, 백프로퍼게이션)</b>: 이 곱셈을 <b>출력 쪽(뒤)에서부터
          입력 쪽(앞)으로</b> 진행하면 모든 층의 그래디언트를 한 번의 왕복으로 다 구할 수 있어요.
          각 층에서 곱해지는 것이 <b>행렬</b>(전문용어로 야코비안 Jacobian — 이름만 스쳐 가면
          충분해요)이라 — 역전파의 실체는
          <b>행렬곱의 연쇄</b>(ch3)입니다. 딥러닝 프레임워크가 자동으로 해 주는 게 바로 이것.
        </li>
      </ul>
    </ConceptCard>

    <!-- 6. 총정리 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 대장정의 끝 — AI 학습 한 사이클에 전부 들어있다</h2>
    <ReviewFlag id="ch12-ai" chapter="ch12" label="🤖 AI 학습 한 사이클 총정리" />
    <ConceptCard tone="ai" title="신경망 학습 1회전 = 이 시리즈 전체">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>① 입력</b>: 데이터를 벡터로 (ch1) — 임베딩·유사도는 내적 (ch2)</li>
        <li><b>② 순전파</b>(forward — 입력에서 출력 방향으로 계산이 흘러가는 것): 층마다 행렬곱으로 변환 (ch3 · ch5)</li>
        <li><b>③ 손실 계산</b>: 예측 − 정답, 제곱합 — 최소제곱의 마음 (ch4 · ch10)</li>
        <li><b>④ 역전파</b>: 연쇄법칙 = 행렬곱의 연쇄로 <MathBlock inline expr="\nabla L" /> 계산 (ch12)</li>
        <li><b>⑤ 갱신</b>: <MathBlock inline expr="\vec{w} \leftarrow \vec{w} - \eta \nabla L" /> (ch12) — ← 는 <b>대입 화살표</b>(왼쪽 값을 오른쪽 계산 결과로 새로 바꿔 넣기). 그리고 ①로 반복</li>
        <li>
          <b>그 사이사이</b>: 데이터 요약·압축엔 고유값·PCA·SVD (ch7·8·11), 정보량 진단엔
          rank (ch9), 되돌리기·해석엔 행렬식·역행렬 (ch6)
        </li>
      </ul>
      <p class="mt-2">
        ChatGPT 도, 유튜브 추천도, 이 다섯 단계의 반복입니다. <b>여러분은 이제 그 전부의
        수학을 압니다.</b>
      </p>
    </ConceptCard>
    <ConceptCard tone="tip" title="다음 여정 — 시리즈 2부·3부">
      경사하강에서 "기울기를 구해주는 기계(미분)"는 블랙박스로 남겨뒀죠.
      그 상자를 여는 것이 <b>2부 미적분</b>입니다 (변화율 → 미분 → 연쇄법칙 제대로).
      그리고 "AI 는 왜 확신하지 못하는가"는 <b>3부 확률통계</b>에서 —
      1부에서 만든 벡터·행렬 위에서 계속됩니다.
    </ConceptCard>

    <!-- 7. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">6. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제. <b>모두 맞히면 마지막 챕터 완료!</b>
    </p>

    <QuizSet title="그래디언트·경사하강 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="손실함수 L(w) 는 모델이 얼마나 틀렸는지를 숫자 하나로 나타낸다."
        type="truefalse"
        :answer="0"
        explanation="참. 이 숫자를 최소화하는 것이 학습의 목표입니다."
      />
      <Quiz
        difficulty="easy"
        question="경사하강법이 하는 일을 가장 잘 설명한 것은?"
        :choices="['기울기의 반대 방향으로 조금씩 이동해 손실을 줄인다', '기울기 방향으로 올라가 손실을 키운다', '매번 무작위 위치로 점프한다']"
        :answer="0"
        explanation="내리막(기울기 반대) 방향으로 학습률만큼씩 이동 — w ← w − ηL'(w)."
      />
      <Quiz
        difficulty="easy"
        question="학습률 η(에타)가 뜻하는 것은?"
        :choices="['한 걸음의 크기', '데이터의 개수', '신경망 층의 개수']"
        :answer="0"
        explanation="한 걸음의 크기입니다. 너무 작으면 느리고, 너무 크면 발산해요."
      />
      <Quiz
        difficulty="easy"
        question="그래디언트 ∇L 은 각 가중치 방향의 기울기를 모아 놓은 벡터다."
        type="truefalse"
        :answer="0"
        explanation="참. 가중치가 수억 개면 수억 차원 벡터 — 그래서 선형대수가 필요했던 거예요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="w = 10, 기울기 = 4, η = 0.25 일 때 한 걸음 후의 새 w 는?"
        type="numeric"
        :answer="9"
        :hints="['w − η × 기울기 = 10 − 0.25 × 4.']"
        explanation="10 − 0.25×4 = 9."
      />
      <Quiz
        difficulty="medium"
        question="학습률이 너무 크면 손실이 오히려 커지며 발산할 수 있다."
        type="truefalse"
        :answer="0"
        :hints="['데모에서 η = 0.8 로 실험해 보셨나요?']"
        explanation="참. 골짜기를 뛰어넘어 반대편 더 높은 곳에 착지하기를 반복하면 발산합니다."
      />
      <Quiz
        difficulty="medium"
        question="기울기가 음수인 지점에서 경사하강 한 걸음을 밟으면 w 는 어떻게 될까요?"
        :choices="['커진다 (음수를 빼니까 더하기가 된다)', '작아진다', '변하지 않는다']"
        :answer="0"
        :hints="['w ← w − η × (음수) = w + η × (양수).']"
        explanation="빼기 × 음수 = 더하기. 내리막이 오른쪽에 있으니 오른쪽(w 증가)으로 가는 게 맞죠 — 부호가 방향을 자동으로 맞춰줍니다."
      />
      <Quiz
        difficulty="medium"
        question="경사하강법이 도착한 골짜기에 대해 맞는 설명은?"
        :choices="['지역 최소값일 수 있다 — 전체 최선이라는 보장은 없다', '항상 전체에서 가장 깊은 골짜기다', '골짜기에는 절대 도착할 수 없다']"
        :answer="0"
        :hints="['데모에서 시작점에 따라 도착지가 달랐죠.']"
        explanation="발밑 경사만 보고 내려가므로, 시작점에 따라 얕은 골짜기(지역 최소값)에 갇힐 수 있습니다."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="w₀ = 8, 기울기 공식 L'(w) = 2(w − 4), η = 0.25 로 경사하강 두 걸음을 밟으세요."
        :steps="[
          { lhs: 'L\'(8) = 2 \\times (8 - 4)', answer: 8 },
          { lhs: 'w_1 = 8 - 0.25 \\times 8', answer: 6 },
          { lhs: 'L\'(6) = 2 \\times (6 - 4)', answer: 4 },
          { lhs: 'w_2 = 6 - 0.25 \\times 4', answer: 5 },
        ]"
        :hints="['걸음마다 [기울기 계산 → 갱신]을 반복합니다. 0.25×8 = 2, 0.25×4 = 1.', '골짜기 바닥(w=4)에 가까워질수록 기울기가 작아져 걸음도 짧아져요.']"
        explanation="8 → 6 → 5 — 바닥(w=4)에 다가갈수록 기울기가 줄어 자동으로 속도가 느려집니다. 경사하강의 우아한 성질이에요."
      />
      <Quiz
        difficulty="hard"
        question="역전파(backpropagation)를 가장 잘 설명한 것은?"
        :choices="['연쇄법칙(기울기의 곱)을 출력에서 입력 방향으로 진행해 모든 층의 그래디언트를 효율적으로 계산한다', '데이터를 네트워크 뒤쪽으로 다시 흘려보내 저장한다', '가중치를 무작위로 예전 값으로 되돌린다']"
        :answer="0"
        :hints="['핵심 단어: 연쇄법칙, 뒤에서부터, 그래디언트.']"
        explanation="층마다 기울기(야코비안 행렬)를 뒤에서부터 곱해 가면 한 번의 왕복으로 전 층의 ∇L 이 나옵니다 — 실체는 행렬곱의 연쇄(ch3)."
      />
    </QuizSet>

    <NotebookCard />

    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch12_gradient.ipynb</code> 에서 경사하강을 <b>직접 구현</b>해 공이 내려간
      자취를 그리고, 학습률 크기별(느림/적당/발산) 비교와 수치미분으로 기울기 검산까지 해봅니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch12')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">🎓</div>
      <p class="font-semibold text-emerald-800">
        Phase 12 완료 — 1부 선형대수 전 과정(12챕터)을 마쳤습니다!
      </p>
      <p class="mt-1 text-sm text-emerald-700">
        수포자에서 시작해 벡터부터 역전파까지 — AI 의 수학적 뼈대를 전부 통과했습니다.
        다음 여정은 시리즈 2부 미적분에서 계속됩니다.
      </p>
      <RouterLink
        to="/review"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        복습 목록으로 마무리 →
      </RouterLink>
    </div>
  </article>
</template>
