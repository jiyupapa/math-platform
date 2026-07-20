<script setup lang="ts">
// Phase 6 · 정규분포 (연속분포 · 확률=넓이 · 68-95-99.7 · 표준화)
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import NormalExplorer from '@/components/NormalExplorer.vue'
import GaltonBoard from '@/components/GaltonBoard.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch6')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 6</p>
    <h1 class="mb-4 text-3xl font-bold">정규분포 🔔</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      5장 마지막에 이항분포의 막대들이 점점 <b>종 모양</b>으로 정돈되는 걸 봤죠. 그 곡선의 정체가
      바로 <b>정규분포</b> — 키, 시험 점수, 측정 오차, 그리고 AI 의 노이즈까지, 세상 곳곳에서
      나타나는 통계학에서 가장 유명한 분포입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>연속 확률변수에서는 <b>확률 = 곡선 아래 넓이</b>임을 이해한다</li>
        <li>정규분포 <MathBlock inline expr="N(\mu, \sigma^2)" /> 에서 <b>μ(중심)·σ(폭)</b>의 역할을 눈으로 확인한다</li>
        <li><b>68-95-99.7 규칙</b>과 <b>표준화 z 점수</b>로 실제 문제("상위 몇 %?")를 푼다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 연속 확률변수 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 연속 확률변수 — "정확히 그 값"의 확률은 0</h2>
    <ReviewFlag id="ch6-s1" chapter="ch6" label="1. 연속 확률변수 — 정확히 그 값의 확률은 0" />
    <p class="leading-relaxed text-slate-700">
      주사위 눈이나 앞면 수는 1, 2, 3… 처럼 <b>뚝뚝 끊어진 값</b>이었어요. 그런데 <b>키</b>는
      170cm 와 171cm 사이에 170.5, 170.53, 170.5312… 값이 <b>이어져</b> 있습니다. 이런 확률변수를
      <b>연속 확률변수</b>라고 해요.
    </p>

    <ConceptCard tone="warn" title="함정 주의 — 한 점의 확률은 0">
      "키가 <b>정확히</b> 170.000000…cm 일 확률"은 0 입니다. 소수점 아래로 무한히 정확하게 딱
      맞을 수는 없으니까요. 그래서 연속 확률변수는 <b>구간</b>으로 말합니다 —
      "169cm 와 171cm <b>사이</b>일 확률은 15%" 처럼요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="연속 확률변수에서는 '정확히 한 값'이 나올 확률이 0 이라서, 확률을 구간으로 말한다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 연속인 값은 무한히 잘게 이어져 있어 한 점의 확률은 0 — 그래서 '구간의 확률'로만 말할 수 있어요."
    />

    <!-- 2. 확률 = 넓이 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 확률 = 곡선 아래 넓이</h2>
    <ReviewFlag id="ch6-s2" chapter="ch6" label="2. 확률 = 곡선 아래 넓이" />
    <p class="leading-relaxed text-slate-700">
      그럼 구간의 확률은 어떻게 나타낼까요? 값 위에 <b>밀도곡선</b>을 그려두고, <b>구간 위 곡선
      아래의 넓이</b>를 확률로 읽습니다. 곡선이 높은 곳 = 그 근처 값이 잘 나오는 곳이에요.
    </p>
    <MathBlock expr="P(a \le X \le b) = (a \text{ 부터 } b \text{ 까지 곡선 아래 넓이})" />

    <ConceptCard tone="note" title="새 개념 — 넓이로 확률 재기 (적분 직관)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <b>밀도곡선(확률밀도)</b>: 연속 확률변수의 "확률 지형도". 곡선 전체 아래 넓이는
          반드시 <b>1</b>(= 확률 전부)입니다.
        </li>
        <li>
          수학책에서 이 넓이를 <MathBlock inline expr="\int" /> 기호로 씁니다.
          <b>읽는 법</b>: "인테그랄(적분)" · <b>뜻</b>: <b>잘게 쪼개서 다 더한 것</b> = 넓이.
          기다란 S 모양은 Sum(합)의 S 예요.
        </li>
        <li>
          안심하세요 — 이 과정에서 적분 <b>계산 기법은 전혀 필요 없습니다</b>. "적분 = 곡선 아래
          넓이 = 확률"이라는 직관이면 AI 논문의 적분 기호도 읽을 수 있어요.
        </li>
      </ul>
    </ConceptCard>

    <!-- 3. 정규분포 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 정규분포 — 종 모양의 왕</h2>
    <ReviewFlag id="ch6-s3" chapter="ch6" label="3. 정규분포 — 종 모양의 왕" />
    <p class="leading-relaxed text-slate-700">
      밀도곡선 중 가장 유명한 것이 <b>정규분포</b>입니다. 좌우대칭 종(bell) 모양이고, 딱 두 숫자로
      완전히 결정돼요 — 어디가 중심인지(<MathBlock inline expr="\mu" />), 얼마나 퍼졌는지(<MathBlock inline expr="\sigma" />).
    </p>

    <ConceptCard tone="note" title="새 기호 — N(μ, σ²)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <MathBlock inline expr="N(\mu, \sigma^2)" /> &nbsp;<b>읽는 법</b>: "평균 뮤, 분산 시그마제곱인
          정규분포(Normal distribution)".
        </li>
        <li><MathBlock inline expr="\mu" />(뮤) = 종의 <b>중심</b>(봉우리 위치) — 평균이자 중앙값.</li>
        <li>
          <MathBlock inline expr="\sigma" />(시그마) = 종의 <b>폭</b> — 2장에서 배운 표준편차 그대로예요.
          σ 가 크면 낮고 넓게, 작으면 높고 좁게.
        </li>
        <li>
          괄호 둘째 자리에는 σ 가 아니라 <b>σ² (분산)</b>을 쓰는 관례입니다 — 그래서 표준편차가
          5 인 키 분포를 <MathBlock inline expr="N(170, 5^2)" /> 처럼 <b>제곱 꼴로</b> 적어요.
        </li>
        <li>예: 성인 키 ≈ <MathBlock inline expr="N(170, 5^2)" />, 시험 점수, 측정 오차, 공장 부품의 치수….</li>
      </ul>
    </ConceptCard>

    <!-- 4. 인터랙티브 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 정규분포 탐험기 (직접 움직여 보기)</h2>
    <ReviewFlag id="ch6-s4" chapter="ch6" label="4. 정규분포 탐험기" />
    <p class="leading-relaxed text-slate-700">
      <b>μ 를 밀면</b> 종이 통째로 이동하고, <b>σ 를 키우면</b> 낮고 넓게 퍼집니다(전체 넓이는
      항상 1!). 구간 <MathBlock inline expr="[a, b]" /> 슬라이더로 색칠된 넓이 = 확률이 어떻게
      변하는지 보세요.
    </p>

    <NormalExplorer />

    <p class="mt-2 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="σ(표준편차)를 키우면 정규분포 곡선은 어떻게 변할까요?"
      :choices="[
        '높고 좁아진다',
        '낮고 넓게 퍼진다',
        '오른쪽으로 이동한다',
        '변하지 않는다',
      ]"
      :answer="1"
      :hints="['σ 는 흩어짐(폭)입니다. 전체 넓이는 항상 1 로 고정이에요.']"
      explanation="σ 가 크면 데이터가 넓게 흩어지므로 곡선은 낮고 넓게 퍼집니다. 넓이 합이 1 로 고정이라 넓어지면 낮아져요."
    />

    <!-- 5. 68-95-99.7 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 68-95-99.7 규칙 — 정규분포의 줄자</h2>
    <ReviewFlag id="ch6-s5" chapter="ch6" label="5. 68-95-99.7 규칙" />
    <p class="leading-relaxed text-slate-700">
      모든 정규분포는 모양이 같아서, <b>σ 를 줄자 삼아</b> 넓이를 잴 수 있습니다. 위 탐험기의
      프리셋 버튼(μ±1σ, μ±2σ, μ±3σ)으로 직접 확인해 보세요:
    </p>
    <MathBlock expr="\mu \pm 1\sigma \approx 68\%, \qquad \mu \pm 2\sigma \approx 95\%, \qquad \mu \pm 3\sigma \approx 99.7\%" />
    <p class="leading-relaxed text-slate-700">
      키가 <MathBlock inline expr="N(170, 5^2)" /> 이라면 — 68%의 사람이 165~175cm,
      95%가 160~180cm, 거의 전부(99.7%)가 155~185cm 안에 있다는 뜻입니다. 숫자 세 개로
      분포 전체의 감이 잡히죠.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="시험 점수가 N(100, 10²) 를 따를 때, 80점~120점 사이에 드는 비율은 약 몇 %? (숫자만)"
      type="numeric"
      :answer="95"
      :hints="['80 = 100 − 2×10, 120 = 100 + 2×10 — 즉 μ±2σ 구간입니다.', '68-95-99.7 중 ±2σ 는?']"
      explanation="80~120점은 μ±2σ 구간이므로 약 95% 입니다."
    />

    <!-- 6. 표준화 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">6. 표준화 — 모든 정규분포를 하나로</h2>
    <ReviewFlag id="ch6-s6" chapter="ch6" label="6. 표준화 — 모든 정규분포를 하나로" />
    <p class="leading-relaxed text-slate-700">
      2장에서 배운 <b>z 점수</b>가 여기서 다시 등장합니다. 값에서 평균을 빼고 σ 로 나누면
      "평균에서 <b>표준편차 몇 개</b>만큼 떨어졌나"가 되죠:
    </p>
    <MathBlock expr="z = \frac{x - \mu}{\sigma}" />

    <ConceptCard tone="note" title="새 용어 — 표준정규분포">
      <b>표준정규분포(standard normal)</b>: 평균 0, 표준편차 1 로 표준화한 정규분포
      <MathBlock inline expr="N(0, 1)" />. <b>어떤</b> 정규분포든 z 점수로 바꾸면 전부 이 하나가
      됩니다 — 그래서 표(또는 함수) 하나로 모든 정규분포의 넓이를 구할 수 있어요.
      68-95-99.7 규칙도 z 로 말하면 "|z| ≤ 1, 2, 3" 입니다. 막대 두 개는 <b>절댓값</b> 기호(읽기:
      "z의 절댓값") — 부호(±)를 떼고 <b>크기만</b> 남긴다는 뜻이에요(예: |−2| = 2). 그러니
      "|z| ≤ 2" 는 "평균에서 어느 쪽으로든 2σ 이내"가 됩니다.
    </ConceptCard>

    <StepQuiz
      difficulty="medium"
      question="키가 N(170, 5²) 를 따를 때, 180cm 는 상위 약 몇 %에서 시작될까요? 단계별로 구하세요."
      :steps="[
        { lhs: 'x - \\mu = 180 - 170', answer: 10 },
        { lhs: 'z = 10 \\div 5', answer: 2 },
        { lhs: '\\text{바깥 비율} = 100 - 95', answer: 5 },
        { lhs: '\\text{상위}(\\%) = 5 \\div 2', answer: 2.5 },
      ]"
      :hints="[
        '먼저 z 점수를 구하세요: (값 − 평균) ÷ σ.',
        'z = 2 는 μ±2σ 의 경계 — 안쪽이 95%.',
        '바깥 5% 는 왼쪽 끝과 오른쪽 끝에 반씩 나뉩니다.',
      ]"
      explanation="z = 2 이므로 μ±2σ 바깥 5% 중 오른쪽 절반, 즉 상위 약 2.5% 입니다. z 점수 하나로 '상위 몇 %'가 바로 나와요."
    />

    <!-- 7. 갈톤 보드 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">7. 갈톤 보드 — 우연이 쌓이면 종 모양</h2>
    <ReviewFlag id="ch6-s7" chapter="ch6" label="7. 갈톤 보드 — 우연이 쌓이면 종 모양" />
    <p class="leading-relaxed text-slate-700">
      왜 세상 곳곳이 정규분포일까요? 힌트가 되는 장치가 <b>갈톤 보드</b>입니다. 공이 핀에 부딪힐
      때마다 왼쪽/오른쪽으로 반반 확률로 튀는데 — 이런 <b>작은 우연이 여러 번 쌓인 결과</b>는
      가운데가 두터운 종 모양이 됩니다. 공을 직접 떨어뜨려 보세요.
    </p>

    <GaltonBoard :rows="10" />

    <p class="leading-relaxed text-slate-700">
      키도 마찬가지예요 — 수많은 유전자와 환경 요인이라는 작은 우연들이 더해진 결과라서 종 모양이
      됩니다. "우연들의 합은 정규분포"라는 이 놀라운 사실의 정식 이름이 <b>중심극한정리</b>,
      바로 다음 챕터의 주인공입니다.
    </p>

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 AI 는 정규분포에서 태어난다</h2>
    <ReviewFlag id="ch6-ai" chapter="ch6" label="🤖 AI 는 정규분포에서 태어난다" />
    <p class="leading-relaxed text-slate-700">
      농담이 아니라 문자 그대로입니다. 신경망을 학습시키기 전, 수백만 개의 가중치에 넣는 첫 값은
      <b>정규분포에서 뽑은 난수</b>예요. 그림 그리는 AI(디퓨전 모델)는 한술 더 떠서,
      <b>정규분포 노이즈</b>로 가득한 화면에서 시작해 조금씩 그림을 만들어냅니다.
    </p>

    <ConceptCard tone="ai" title="정규분포 → AI 의 세 장면">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>가중치 초기화</b>: 학습 시작값 = <MathBlock inline expr="N(0, \sigma^2)" /> 난수.
          σ 를 잘못 잡으면 학습이 터지거나 멈춰서, 초기화 공식들이 σ 조절법 그 자체예요.
        </li>
        <li><b>디퓨전 모델</b>: 순수 정규분포 노이즈에서 시작해 노이즈를 걷어내며 이미지를 생성.</li>
        <li>
          <b>오차 모델링</b>: 예측과 실제의 차이(오차)를 정규분포로 가정하는 것이 통계·ML 의 표준 —
          작은 요인들이 겹친 오차는 종 모양이 되기 때문(갈톤 보드!).
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="신경망 가중치의 초기값은 보통 정규분포에서 뽑은 난수로 채운다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 평균 0 정규분포 난수로 시작하고, σ 를 layer 크기에 맞게 조절하는 것이 표준 초기화 방법이에요."
    />

    <!-- 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">8. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="정규분포 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="정규분포 밀도곡선 아래의 전체 넓이는 1 이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 넓이 = 확률이므로 전체 넓이는 항상 1(=100%)이에요."
      />
      <Quiz
        difficulty="easy"
        question="정규분포에서 μ(뮤)의 역할은?"
        :choices="[
          '종의 중심(봉우리) 위치를 정한다',
          '종의 폭을 정한다',
          '곡선 아래 전체 넓이를 정한다',
          '꼬리의 개수를 정한다',
        ]"
        :answer="0"
        :hints="['μ 는 평균 — 탐험기에서 μ 를 밀면 무엇이 변했나요?']"
        explanation="μ 는 중심 위치입니다. 폭은 σ 가 정하고, 전체 넓이는 항상 1 로 고정이에요."
      />
      <Quiz
        difficulty="easy"
        question="정규분포에서 μ±1σ 구간에 드는 비율은 약 몇 %? (숫자만)"
        type="numeric"
        :answer="68"
        :hints="['68-95-99.7 규칙의 첫 번째 숫자.']"
        explanation="약 68%입니다. ±2σ 는 95%, ±3σ 는 99.7%."
      />
      <Quiz
        difficulty="easy"
        question="σ 가 클수록 데이터가 평균 근처에 더 몰려 있다."
        type="truefalse"
        :answer="1"
        :hints="['σ 는 흩어짐의 크기입니다.']"
        explanation="거짓입니다. σ 가 클수록 넓게 흩어지고, 곡선은 낮고 넓어져요. 몰려 있는 건 σ 가 작을 때입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="수학 점수가 N(60, 10²) 를 따릅니다. 내 점수 70점의 z 점수를 단계별로 구하세요."
        :steps="[
          { lhs: 'x - \\mu = 70 - 60', answer: 10 },
          { lhs: 'z = 10 \\div 10', answer: 1 },
        ]"
        :hints="['z = (값 − 평균) ÷ 표준편차.']"
        explanation="z = 1, 즉 평균보다 표준편차 1개만큼 위입니다. 68% 규칙으로 상위 약 16% 위치예요."
      />
      <Quiz
        difficulty="medium"
        question="어떤 정규분포든 z = (x−μ)/σ 로 바꾸면 표준정규분포 N(0,1) 이 된다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 그래서 표(함수) 하나로 모든 정규분포의 넓이를 계산할 수 있어요 — 표준화의 힘입니다."
      />
      <Quiz
        difficulty="medium"
        question="키가 N(170, 5²) 일 때, 95%의 사람이 들어가는 구간은?"
        :choices="['165 ~ 175cm', '160 ~ 180cm', '155 ~ 185cm', '150 ~ 190cm']"
        :answer="1"
        :hints="['95% 는 μ±2σ.', '170 ± 2×5.']"
        explanation="μ±2σ = 170 ± 10 = 160~180cm 입니다."
      />
      <Quiz
        difficulty="medium"
        question="정규분포 N(50, 5²) 에서 μ+3σ 값은?"
        type="numeric"
        :answer="65"
        :hints="['50 + 3×5.']"
        explanation="50 + 15 = 65. 이보다 큰 값은 전체의 약 0.15%뿐(99.7% 규칙의 오른쪽 바깥)입니다."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="공장 부품 길이가 N(100, 2²) mm 를 따릅니다. 96mm~104mm 를 합격으로 할 때 합격률(%)을 단계별로 구하세요."
        :steps="[
          { lhs: 'z_{\\text{아래}} = (96 - 100) \\div 2', answer: -2 },
          { lhs: 'z_{\\text{위}} = (104 - 100) \\div 2', answer: 2 },
          { lhs: '\\text{합격률}(\\%)', answer: 95 },
        ]"
        :hints="['두 경계를 z 점수로 바꿔보세요.', 'z = −2 부터 +2 까지는 μ±2σ 구간입니다.']"
        explanation="합격 구간이 정확히 μ±2σ 이므로 합격률은 약 95%. 불량률은 약 5%라는 뜻이죠."
      />
      <Quiz
        difficulty="hard"
        question="IQ 가 N(100, 15²) 를 따를 때, 상위 약 16%가 시작되는 점수는?"
        type="numeric"
        :answer="115"
        :hints="[
          '68% 규칙: μ±1σ 안이 68% → 바깥 32%가 양쪽에 반씩.',
          '오른쪽 바깥 16%의 경계는 μ+1σ.',
        ]"
        explanation="μ+1σ = 100+15 = 115. ±1σ 안 68%, 바깥 32%의 오른쪽 절반이 16%이기 때문입니다."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch06_normal_distribution.ipynb</code> 에서 <code>scipy.stats.norm</code> 으로
      68-95-99.7 을 검증하고, 정규 난수 1만 개의 히스토그램이 밀도곡선에 붙는 것과
      갈톤 보드 시뮬레이션을 직접 그려봅니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch6')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">
        Phase 6 완료. 종 모양의 정체와 σ 줄자 사용법을 익혔습니다.
      </p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 "왜 어디서나 종 모양인가"의 답 — <b>큰 수의 법칙과 중심극한정리</b>입니다.
      </p>
      <RouterLink
        to="/ch/ch7"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 큰 수의 법칙과 중심극한정리 (핵심) →
      </RouterLink>
    </div>
  </article>
</template>
