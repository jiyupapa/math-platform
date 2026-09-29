<script setup lang="ts">
// Phase 8 · 응용 (PCA) + 마무리
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import PCADemo from '@/components/PCADemo.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch8')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">8장 · 응용과 마무리</p>
    <h1 class="mb-4 text-3xl font-bold">응용 — PCA로 데이터 요약하기</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      지금까지 배운 벡터·행렬·고유벡터가 한데 모이는 챕터입니다. <b>PCA</b>는 복잡한 데이터에서
      <b>가장 중요한 방향</b>만 뽑아 <b>차원을 줄이는</b> 대표적 AI 기법이에요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>PCA</b>가 데이터의 <b>주성분(가장 넓게 퍼진 방향)</b>을 찾는 일임을 안다</li>
        <li>주성분 = <b>공분산행렬의 고유벡터</b>(ch7)임을 안다</li>
        <li><b>차원축소</b>(2D→1D)가 무엇이고 왜 유용한지 안다</li>
        <li>전체 과정이 <b>어떻게 AI로 이어지는지</b> 정리한다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 데이터 구름 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 데이터 구름과 '가장 중요한 방향'</h2>
    <ReviewFlag id="ch8-s1" chapter="ch8" label="1. 데이터 구름과 '가장 중요한 방향'" />
    <p class="leading-relaxed text-slate-700">
      데이터를 점으로 찍으면 보통 <b>한쪽으로 길쭉한 구름</b>이 돼요. 그 <b>길쭉한 방향</b>이 데이터를
      가장 잘 설명하는 방향(주성분)입니다. 아래에서 직접 보세요.
    </p>

    <PCADemo />

    <ConceptCard tone="note" title="새 용어: PCA · 주성분 · 공분산">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>PCA(주성분 분석, Principal Component Analysis)</b>: 데이터가 가장 넓게 퍼진 방향들을 찾아
          <b>중요한 축만 남기는</b> 방법.
        </li>
        <li>
          <b>주성분(principal component)</b>: 그 방향들. <b>PC1</b>이 가장 중요(정보 최다), PC2가 그다음.
        </li>
        <li>
          <b>공분산(covariance)</b>: 두 특징이 <b>함께 변하는 정도</b>. 한쪽이 커질 때 다른 쪽도 커지면 양수, 반대로 움직이면 음수예요.
          <span class="text-slate-500">(예: 회원 데이터에서 키가 큰 사람일수록 몸무게도 크다면, 키·몸무게의 공분산은 양수)</span>
          이 값들을 모은 게 <b>공분산행렬</b>이고,
          그 <b>고유벡터가 주성분</b>, <b>고유값이 그 방향의 퍼진 정도(정보량)</b>예요.
          <span class="text-slate-500">("퍼진 정도"의 통계 정식 이름이 <b>분산(variance)</b>이에요.
          그래서 실무·라이브러리에서는 "정보 비율"을 <b>설명된 분산 비율(explained variance ratio)</b>이라
          부릅니다. 이 이름으로 검색하면 같은 개념이 나와요.)</span>
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="PCA의 주성분(가장 중요한 축)은 공분산행렬의 고유벡터로 찾는다."
      type="truefalse"
      :answer="0"
      explanation="참. 고유값이 큰 고유벡터일수록 데이터가 많이 퍼진(정보가 많은) 방향입니다."
    />

    <!-- 2. 차원축소 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 차원축소: 덜 중요한 축 버리기</h2>
    <ReviewFlag id="ch8-s2" chapter="ch8" label="2. 차원축소: 덜 중요한 축 버리기" />
    <p class="leading-relaxed text-slate-700">
      주성분을 알면, <b>덜 중요한 축(작은 고유값)</b>을 버리고 <b>중요한 축만</b> 남길 수 있어요.
      위 데모에서 "PC1으로 투영"을 켜면 2D 점들이 직선 하나(1D)로 모이죠. 그게 <b>차원축소</b>입니다.
      (<b>투영</b> = 점을 축 위로 <b>그림자처럼 내려찍는 것</b>. 자세한 수학은 심화 ch10의 주제라, 여기선 이 그림이면 충분해요.)
    </p>
    <ConceptCard tone="tip" title="정보는 얼마나 남을까?">
      <p class="mb-2">
        고유값이 <MathBlock inline expr="\lambda_1, \lambda_2" /> (아래 첨자 1·2는 "첫째·둘째"
        순번이고, <MathBlock inline expr="\lambda_1" /> 이 큰 쪽) 이면, PC1이 담은 정보 비율은
        <MathBlock inline expr="\dfrac{\lambda_1}{\lambda_1 + \lambda_2}" /> 예요.
      </p>
      <p class="text-sm text-slate-600">
        예: <MathBlock inline expr="\lambda_1 = 9,\ \lambda_2 = 1" /> 이면 PC1 하나로 <b>90%</b> 정보 유지.
        2D를 1D로 줄여도 거의 안 잃는 거죠. 그래서 <b>적은 손실로 데이터를 압축</b>할 수 있어요.
      </p>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="차원축소는 덜 중요한 축을 버려, 적은 정보 손실로 데이터를 간단하게 만드는 것이다."
      type="truefalse"
      :answer="0"
      explanation="참. 가장 중요한 축(주성분)은 지키고 나머지를 줄입니다."
    />

    <!-- 3. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 PCA가 AI에서 쓰이는 곳</h2>
    <ReviewFlag id="ch8-ai" chapter="ch8" label="🤖 PCA가 AI에서 쓰이는 곳" />
    <ConceptCard tone="ai" title="실제 활용">
      <ul class="list-disc space-y-2 pl-5">
        <li><b>데이터 압축·시각화</b>: 수백 차원 데이터를 2~3차원으로 줄여 그래프로 보거나 용량을 줄여요.</li>
        <li><b>노이즈 제거</b>: 작은 고유값(잡음에 가까운 축)을 버려 데이터를 깨끗하게.</li>
        <li><b>얼굴인식(eigenfaces)</b>: 얼굴 사진들의 주성분을 뽑아 적은 숫자로 얼굴을 표현·인식.</li>
        <li><b>특징 추출</b>: 머신러닝 전처리로 중요한 특징만 남겨 학습을 빠르고 안정적으로.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="고차원 데이터를 PCA로 줄이는 주된 이유는 '중요한 정보는 지키며 차원(용량·계산)을 줄이기' 위해서다."
      type="truefalse"
      :answer="0"
      explanation="참. 핵심 정보를 유지하면서 데이터를 간단·가볍게 만드는 게 목적입니다."
    />

    <!-- 4. 전체 마무리 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">전체 정리: 선형대수에서 AI까지</h2>
    <ReviewFlag id="ch8-summary" chapter="ch8" label="전체 정리: 선형대수에서 AI까지" />
    <ConceptCard tone="note" title="지금까지의 여정 (1~8)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>1 벡터</b>: 데이터를 숫자로 표현 (AI 입력의 기본 단위)</li>
        <li><b>2 내적</b>: 닮은 정도·유사도 (추천·검색·어텐션)</li>
        <li><b>3 행렬·행렬곱</b>: 데이터×가중치 (신경망 층)</li>
        <li><b>4 연립방정식</b>: 최적값 찾기 (선형회귀)</li>
        <li><b>5 선형변환</b>: 공간을 바꾸기 (신경망이 데이터를 변형)</li>
        <li><b>6 행렬식·역행렬</b>: 되돌리기·가역성</li>
        <li><b>7 고유값·고유벡터</b>: 변환의 핵심 축</li>
        <li><b>8 PCA</b>: 고유벡터로 데이터 요약·차원축소</li>
      </ul>
      <p class="mt-2">
        이 도구들이 모여 <b>신경망·추천·차원축소</b> 같은 AI를 이룹니다. 홈 화면의
        <b>신경망 지도</b>가 이제 거의 다 켜졌을 거예요.
      </p>
    </ConceptCard>

    <ConceptCard tone="tip" title="다음 단계: AI 심화 (9~12)">
      <b>핵심 토대(1~8)는 여기서 완성</b>입니다. 축하해요! 이어지는 <b>심화 챕터 4개</b>까지
      마치면 완주(진도 100%)예요: <b>기저·차원·계수(rank)</b>, <b>직교성과 투영</b>,
      <b>특이값분해(SVD)</b>, <b>그래디언트와 행렬미분</b>. 지금까지와 같은 방식(직관 먼저,
      계산은 배운 것만)으로 이어지고, SVD와 그래디언트는 추천시스템·딥러닝 학습의 실전 핵심입니다.
    </ConceptCard>

    <!-- 5. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="PCA·응용: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="PCA는 데이터를 가장 잘 설명하는 방향(주성분)을 찾는다."
        type="truefalse"
        :answer="0"
        :hints="['P = Principal(가장 중요한). 데이터 구름의 길쭉한 방향 찾기.']"
        explanation="참. 가장 넓게 퍼진 방향부터 차례로 찾습니다."
      />
      <Quiz
        difficulty="easy"
        question="주성분(가장 중요한 축)은 무엇으로 찾을까요?"
        :choices="['공분산행렬의 고유벡터', '행렬식', '역행렬']"
        :answer="0"
        :hints="['ch7 복습: 변환에도 안 꺾이는 그 축이요.']"
        explanation="공분산행렬의 고유벡터가 주성분, 고유값이 그 방향의 정보량입니다."
      />
      <Quiz
        difficulty="easy"
        question="고유값이 큰 축일수록 데이터가 많이 퍼진(정보가 많은) 방향이다."
        type="truefalse"
        :answer="0"
        :hints="['고유값 = 그 방향의 퍼진 정도(정보량)라고 했어요.']"
        explanation="참. 고유값 = 그 방향으로 데이터가 퍼진 정도."
      />
      <Quiz
        difficulty="easy"
        question="차원축소란 무엇일까요?"
        :choices="['덜 중요한 축을 버려 데이터를 간단하게', '데이터를 2배로 늘리기', '행렬을 뒤집기']"
        :answer="0"
        :hints="['축소 = 줄이기. 무엇을 버려서 줄였었죠?']"
        explanation="중요한 축은 지키고 덜 중요한 축을 줄이는 것입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="2D 데이터에서 첫 번째 주성분(PC1)은?"
        :choices="['데이터가 가장 넓게 퍼진 방향', '항상 x축과 같음', '가장 좁은 방향']"
        :answer="0"
        :hints="['데모의 길쭉한 데이터 구름에서 긴 쪽 방향이 PC1이었죠.']"
        explanation="PC1은 분산(퍼짐)이 가장 큰 방향입니다."
      />
      <Quiz
        difficulty="medium"
        question="PCA로 2D를 1D로 줄이면 정보가 일부 손실되지만, 가장 중요한 방향은 유지된다."
        type="truefalse"
        :answer="0"
        :hints="['남기는 건 PC1(정보 최다), 버리는 건 PC2.']"
        explanation="참. PC1을 남기므로 핵심 정보는 보존됩니다."
      />
      <Quiz
        difficulty="medium"
        question="고유값이 λ1=9, λ2=1 일 때 PC1이 담은 정보 비율은 몇 %일까요?"
        type="numeric"
        :answer="90"
        :hints="['λ1 ÷ (λ1+λ2) × 100.', '9 ÷ 10 × 100.']"
        explanation="9 ÷ (9+1) × 100 = 90%."
      />
      <Quiz
        difficulty="medium"
        question="PCA는 ch7의 고유값·고유벡터를 데이터(공분산행렬)에 적용한 것이다."
        type="truefalse"
        :answer="0"
        :hints="['주성분 = 공분산행렬의 고유벡터. 2번 문제에서 확인했죠.']"
        explanation="참. PCA의 수학적 핵심이 바로 고유분해입니다."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="고유값 λ1=8, λ2=2 일 때 PC1이 담은 정보 비율(%)을 단계별로 구하세요."
        :steps="[
          { lhs: '8 + 2', answer: 10 },
          { lhs: '8 \\div 10 \\times 100', answer: 80 },
        ]"
        :hints="['먼저 두 고유값의 합, 그다음 λ1 비율 × 100.']"
        explanation="8 ÷ (8+2) × 100 = 80%. PC1 하나로 80% 정보 유지."
      />
      <StepQuiz
        difficulty="hard"
        question="3차원 데이터의 고유값이 λ1=6, λ2=3, λ3=1 일 때, PC1·PC2 두 축만 남기면 정보 비율(%)은? (남긴 고유값의 합 ÷ 전체 합 × 100)"
        :steps="[
          { lhs: '6 + 3', answer: 9 },
          { lhs: '6 + 3 + 1', answer: 10 },
          { lhs: '9 \\div 10 \\times 100', answer: 90 },
        ]"
        :hints="[
          '분자 = 남긴 축들의 고유값 합 (6+3).',
          '분모 = 전체 고유값 합 (6+3+1).',
          '(분자 ÷ 분모) × 100 이 %.',
        ]"
        explanation="(6+3) ÷ (6+3+1) × 100 = 90%. 축 3개를 2개로 줄여도 정보의 90%가 남아요. '수백 차원 → 2~3차원'이 통하는 이유입니다."
      />
    </QuizSet>

    <NotebookCard />

    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch08_pca.ipynb</code> 에서 데이터의 공분산행렬을 만들고 <code>np.linalg.eig</code> 로
      주성분을 구한 뒤, PC1으로 투영해 차원을 줄여봅니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch8')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">8장 완료! 핵심 과정(1~8)을 마쳤습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        수포자에서 시작해 선형대수로 AI의 토대를 갖췄습니다. 더 깊이 가려면 심화(9~12)로 이어가세요.
      </p>
      <RouterLink
        to="/ch/ch9"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        심화 시작: 기저·차원·rank →
      </RouterLink>
    </div>
  </article>
</template>
