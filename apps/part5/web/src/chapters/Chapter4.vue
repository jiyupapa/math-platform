<script setup lang="ts">
// Phase 4 · 크로스 엔트로피 (★ 핵심) — 틀린 지도로 세상을 부호화한 비용
// 표준 구성: 개념 설명 + 새 기호 설명 + 인터랙티브 시각화 + 차트 + 미니체크 + 10문제 세트 + 노트북 안내
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { ChartView } from '@series/ui'
import CrossEntropyLab from '@/components/CrossEntropyLab.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 정답 확률 q 에 대한 손실 비교: 크로스 엔트로피(−log₂q) vs MSE((1−q)²)
const qs = Array.from({ length: 20 }, (_, i) => 0.05 + (i * 0.95) / 19)
const lossChart = {
  labels: qs.map((v) => v.toFixed(2)),
  datasets: [
    {
      label: '크로스 엔트로피 −log₂ q (비트)',
      data: qs.map((v) => Math.log2(1 / v)),
      borderColor: '#6366f1',
      backgroundColor: '#6366f1',
      tension: 0.3,
    },
    {
      label: 'MSE (1 − q)²',
      data: qs.map((v) => (1 - v) ** 2),
      borderColor: '#f59e0b',
      backgroundColor: '#f59e0b',
      tension: 0.3,
    },
  ],
}
const lossOptions = {
  scales: {
    x: { title: { display: true, text: '모델이 정답에 준 확률 q' } },
    y: { title: { display: true, text: '손실' } },
  },
}

function onSetComplete() {
  progress.markDone('ch4')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 4 · ★ 핵심 챕터</p>
    <h1 class="mb-4 text-3xl font-bold">크로스 엔트로피 — 틀린 지도의 비용</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      3장의 엔트로피 H(p) 는 <b>세상 그 자체</b>의 불확실성이었습니다. 그런데 우리(그리고 AI)는
      세상의 진짜 분포 p 를 모른 채, 자기 나름의 <b>지도 q</b> 를 들고 다니죠.
      틀린 지도를 들고 다니면 얼마나 손해일까요? 그 손해를 재는 자가 오늘의 주인공 —
      그리고 <b>분류기와 LLM 의 손실함수의 정체</b>입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><MathBlock inline expr="H(p,q) = \sum p \cdot \log_2 \frac{1}{q}" /> 를 <b>"틀린 지도 요금"</b>으로 읽는다</li>
        <li>지도를 직접 주무르며 <b>q = p 에서 최소(= H(p))</b>임을 확인한다</li>
        <li>정답이 원핫이면 <b>H(p,q) = −log q(정답)</b> — 1장의 놀람과 재회</li>
        <li>1부 캡스톤의 <b>MSE 가 사실 우회였던 이유</b>를 안다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 지도 비유 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 세상은 p 로 돌아가는데, 요금은 q 로 낸다</h2>
    <ReviewFlag id="ch4-s1" chapter="ch4" label="1. 틀린 지도 요금 — 정의" />
    <p class="leading-relaxed text-slate-700">
      2장을 떠올려 보세요. 최적 코드는 분포에 맞춘 지도였습니다 —
      확률 q 라고 <b>믿는</b> 사건에 <MathBlock inline expr="\log_2 \tfrac{1}{q}" /> 비트짜리 코드를 주죠.
      그런데 내 믿음 q 가 틀렸고, 세상은 사실 p 로 돌아간다면?
      <b>코드 길이는 내 지도 q 가 정하지만, 각 사건이 얼마나 자주 터지는지는 세상 p 가 정합니다.</b>
      그래서 내가 실제로 내는 평균 요금은:
    </p>
    <MathBlock expr="H(p, q) = \sum_{x} \underbrace{p(x)}_{\text{실제 빈도}} \cdot \underbrace{\log_2 \frac{1}{q(x)}}_{\text{내 지도의 코드 길이}}" />

    <ConceptCard tone="note" title="새 기호 — H(p, q) 크로스 엔트로피">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>이름</b>: 크로스(교차) 엔트로피 · <b>읽는 법</b>: "에이치 피 큐" ·
          <b>뜻</b>: 진짜 분포가 p 인 세상을, q 에 맞춘 코드(지도)로 부호화할 때의 평균 비용(비트)
        </li>
        <li>
          "크로스(교차)"인 이유: 한 항 안에서 <b>빈도는 p 에서, 코드 길이는 q 에서</b> —
          두 분포가 교차해서 곱해지니까요
        </li>
        <li>
          <b>순서 주의!</b> 앞자리 p = 세상(빈도 담당), 뒷자리 q = 내 지도(길이 담당).
          H(p,q) 와 H(q,p) 는 <b>다른 값</b>입니다 (5장에서 이 비대칭이 중요해져요)
        </li>
      </ul>
    </ConceptCard>

    <!-- 2. 지도 3종 계산 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 지도 세 장의 요금표</h2>
    <ReviewFlag id="ch4-s2" chapter="ch4" label="2. 지도 3종 요금 계산" />
    <p class="leading-relaxed text-slate-700">
      3장의 날씨 세상 — 맑음 1/2 · 흐림 1/4 · 비 1/8 · 눈 1/8 (H(p) = 1.75비트) — 에서
      지도 세 장의 요금을 계산해 봅시다.
    </p>
    <div class="my-4 space-y-3">
      <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p class="text-sm font-bold text-emerald-900">🎯 지도 A: 세상과 똑같은 지도 (q = p)</p>
        <p class="mt-1 text-sm text-emerald-800">
          코드 길이 1, 2, 3, 3비트 → 요금 = ½×1 + ¼×2 + ⅛×3 + ⅛×3 = <b>1.75비트 = H(p)</b>.
          2장의 최적 코드 그대로 — 이보다 쌀 수 없는 바닥.
        </p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm font-bold text-slate-800">⚖️ 지도 B: 균등하다고 믿는 지도 (q = ¼ 씩)</p>
        <p class="mt-1 text-sm text-slate-700">
          모든 코드가 log₂4 = 2비트 → 요금 = (½+¼+⅛+⅛)×2 = <b>2비트</b>.
          치우침을 못 써먹어서 0.25비트 손해.
        </p>
      </div>
      <div class="rounded-xl border border-rose-200 bg-rose-50 p-4">
        <p class="text-sm font-bold text-rose-900">🙃 지도 C: 거꾸로 된 지도 (q = ⅛, ⅛, ¼, ½)</p>
        <p class="mt-1 text-sm text-rose-800">
          제일 흔한 맑음에 제일 긴 3비트 코드를 준 최악의 배치 →
          요금 = ½×3 + ¼×3 + ⅛×2 + ⅛×1 = <b>2.625비트</b>. 지도가 틀릴수록 요금 폭탄.
        </p>
      </div>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="위 날씨 세상에서 '균등 지도'(모든 코드 2비트)의 요금 H(p,q)는 몇 비트일까요?"
      type="numeric"
      :answer="2"
      :hints="['모든 경우의 코드 길이가 2비트로 같아요.', '확률의 합은 1 — 1 × 2비트.']"
      explanation="어떤 날씨든 2비트를 내니 평균도 2비트. 바닥(1.75)보다 0.25비트 비쌉니다."
    />

    <!-- 3. Lab -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 실험실 — 지도를 세상에 맞춰 보세요</h2>
    <ReviewFlag id="ch4-s3" chapter="ch4" label="3. 크로스 엔트로피 실험실" />
    <p class="leading-relaxed text-slate-700">
      직접 해 봅시다. 회색 막대(세상 p)는 고정, <b>보라 막대(내 지도 q)를 드래그</b>해서
      요금 H(p,q) 를 최대한 낮춰 보세요. 언제 최소가 되나요?
      그리고 "눈이 없는 지도" 버튼도 꼭 눌러 보세요 — 무시무시한 일이 벌어집니다.
    </p>

    <CrossEntropyLab />

    <ConceptCard tone="tip" title="실험에서 확인한 두 가지 법칙">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <MathBlock inline expr="H(p,q) \ge H(p)" /> — 어떤 지도도 바닥보다 쌀 수 없고,
          <b>등호는 오직 q = p 일 때</b>. "비용을 낮추려면 세상을 똑같이 믿어라" —
          이 한 줄이 6장에서 <b>"AI 학습"의 정의</b>가 됩니다.
        </li>
        <li>
          일어날 수 있는 일에 <b>q = 0 을 주면 비용 무한대</b> — 그래서 LLM 은 어떤 토큰에도
          확률 0을 주지 않아요(소프트맥스가 항상 양수를 내놓는 이유이기도!)
        </li>
      </ul>
    </ConceptCard>

    <!-- 4. 원핫 = -log q -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 정답이 하나뿐이면 — 공식이 반토막 난다</h2>
    <ReviewFlag id="ch4-s4" chapter="ch4" label="4. 원핫이면 −log q(정답)" />
    <p class="leading-relaxed text-slate-700">
      분류 문제와 LLM 학습에서는 세상 p 가 특별합니다 — <b>정답이 하나로 정해져</b> 있죠.
      "이 사진은 고양이다", "다음 토큰은 '서울'이다". 이런 p 를 <b>원핫(one-hot)</b> 분포라
      부릅니다: 정답 칸만 1, 나머지 전부 0.
    </p>
    <MathBlock expr="H(p, q) = 1 \cdot \log_2 \frac{1}{q(\text{정답})} + 0 + 0 + \cdots = -\log_2\, q(\text{정답})" />
    <p class="mt-1 leading-relaxed text-slate-700">
      합이 통째로 사라지고 <b>정답 항 하나만</b> 남습니다. 그런데 이 −log q(정답), 어디서 봤죠?
      <b>1장의 놀람</b>입니다! "모델이 정답을 보고 느낀 놀람이 곧 손실"이라던 1장의 AI 카드가
      사실 크로스 엔트로피의 원핫 특수판이었던 거예요.
    </p>

    <ConceptCard tone="note" title="새 용어 — 원핫 (one-hot)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>이름</b>: 원핫 인코딩/분포 · <b>읽는 법</b>: "원핫" (hot 한 칸만 켜짐)</li>
        <li><b>뜻</b>: 한 칸만 1이고 나머지는 0인 확률 분포 — "정답은 이것 하나"라는 확신의 극단</li>
        <li>예: 4지선다 정답이 3번이면 p = (0, 0, 1, 0)</li>
        <li>3장에서 <b>"몰빵"</b>이라 부르던 그 분포가 바로 이거예요 — 몰빵 = 원핫(H = 0)</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="정답이 원핫일 때, 모델이 정답에 확률 1/4 을 줬다면 크로스 엔트로피 손실은 몇 비트일까요?"
      type="numeric"
      :answer="2"
      :hints="['원핫이면 H(p,q) = −log₂ q(정답) = log₂(1/q).', 'log₂4 는?']"
      explanation="log₂(1/(1/4)) = log₂4 = 2비트. 정답에 준 확률의 놀람이 곧 손실입니다."
    />

    <!-- 5. MSE 비교 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. MSE 와의 대결 — 1부의 복선을 회수하다</h2>
    <ReviewFlag id="ch4-s5" chapter="ch4" label="5. 크로스 엔트로피 vs MSE" />
    <p class="leading-relaxed text-slate-700">
      1부 캡스톤의 미니 신경망은 손실로 <b>MSE</b> (오차 제곱 평균, <MathBlock inline expr="(\hat{y}-y)^2" />) 를
      썼습니다. 사실 그건 <b>log 를 피하려던 우회</b>였어요 — 이제 log 가 무섭지 않으니
      두 손실을 정면 비교할 수 있습니다. 정답에 준 확률 q 에 따른 손실 곡선:
    </p>

    <ChartView type="line" :data="lossChart" :options="lossOptions" :height="280" />

    <ConceptCard tone="tip" title="곡선이 말해주는 것 — 왜 분류엔 크로스 엔트로피인가">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>자신 있는 오답을 벌하는 강도</b>: 정답에 q = 0.01 을 준 "확신에 찬 오답"에
          MSE 는 기껏 (1−0.01)² ≈ 0.98 — 미지근합니다. 크로스 엔트로피는 log₂100 ≈ 6.6비트,
          q 가 0에 가까울수록 <b>무한대로 폭발</b> — 확률을 다루는 문제에 맞는 눈금이죠.
        </li>
        <li>
          <b>기울기의 생사</b>: 잠깐 복습 — <b>시그모이드 σ</b> 는 아무 숫자나 0~1 사이로
          눌러 확률처럼 만들어 주는 S자 함수였습니다(1부 캡스톤).
          1부에서 그 기울기 σ′ 을 "받아 적은 선물"로 배웠죠.
          MSE 를 쓰면 이 σ′ 이 곱해지는데, 양 끝(확신 구간)에서 σ′ ≈ 0 이라 <b>크게 틀렸는데도
          기울기가 죽어</b> 학습이 멈춥니다. 크로스 엔트로피를 쓰면 σ′ 이 <b>정확히 소거</b>되어
          출력층 기울기가 (ŷ − y) 로 단순해지고, 틀린 만큼 그대로 배워요.
        </li>
        <li>
          이 "σ′ 소거의 마법"은 <b>10장 캡스톤</b>에서 1부의 신경망을 가져와 직접 확인합니다 —
          시리즈 전체의 대단원!
        </li>
      </ul>
    </ConceptCard>

    <DetailsCard title="➕ 더 깊이: 회귀에는 왜 여전히 MSE 를 쓰나요?">
      집값·온도처럼 <b>연속된 숫자</b>를 맞히는 회귀에서는 MSE 가 자연스러운 선택입니다 —
      사실 "정답이 예측 근처에 정규분포로 흩어져 있다"고 믿을 때의 크로스 엔트로피가
      정확히 MSE 꼴이 돼요(로그를 씌우면 제곱이 나오는 정규분포의 성질, 3부 8장).
      즉 <b>MSE 도 크로스 엔트로피의 특수판</b> — 문제의 확률 모형이 다를 뿐입니다.
      이 유도는 과정 밖이지만, "손실함수는 전부 한 가족"이라는 큰 그림만 기억하세요.
    </DetailsCard>

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 LLM 손실함수의 정체 — 이제 읽을 수 있다</h2>
    <ReviewFlag id="ch4-ai" chapter="ch4" label="🤖 LLM 손실함수의 정체" />
    <p class="leading-relaxed text-slate-700">
      이제 딥러닝 문서 어디에나 나오는 "cross-entropy loss"가 무엇인지 정확히 말할 수 있습니다.
    </p>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 분류기와 LLM 의 채점표">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>분류기</b>: 정답 클래스(원핫 p)에 모델이 준 확률 q 로 채점 —
          손실 = −log q(정답 클래스). 고양이 사진에 "고양이 70%"라고 답하면 손실 0.51비트.
        </li>
        <li>
          <b>LLM</b>: 문장의 <b>모든 토큰 위치마다</b> "다음 토큰 맞히기" 분류 문제를 풀립니다.
          위치마다 −log q(정답 토큰)를 재서 <b>평균</b>낸 것이 학습 손실 —
          훈련 로그의 loss 곡선이 바로 이 값(단위만 nat)입니다.
        </li>
        <li>
          1장에서 본 대로 <b>희귀하게 예측한 정답일수록 손실 기여가 크고</b>,
          이 평균에 2^ 를 씌우면 7장의 <b>퍼플렉시티</b>가 됩니다.
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="warn" title="미리 긋는 경계선 — 크로스 엔트로피 vs KL (5장 예고)">
      다음 장에서 KL 발산이 나오면 헷갈리기 쉬우니 지금 한 줄로 구분해 둡니다:
      <b>H(p,q) 는 지도 요금 전체</b>(바닥 H(p) 포함),
      <b>KL 은 그중 바가지 초과분만</b> (H(p,q) − H(p)).
      실험실 게이지에서 본 "세로 눈금 위로 튀어나온 부분"이 바로 KL 입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="LLM 의 학습 손실(크로스 엔트로피)을 가장 정확히 설명한 것은?"
      :choices="['각 위치에서 정답 토큰에 준 확률의 −log 를 평균한 것', '모델 출력 분포의 엔트로피', '정답과 예측의 차이를 제곱한 것', '토큰 개수를 센 것']"
      :answer="0"
      explanation="위치마다 −log q(정답 토큰) — 원핫 크로스 엔트로피 — 를 재서 평균합니다. MSE(제곱)는 1부의 우회였죠."
    />

    <!-- 연습 문제 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">6. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="크로스 엔트로피 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="크로스 엔트로피 H(p,q)는 '진짜 분포 p 인 세상을, 내 예측 q 에 맞춘 코드로 부호화한 평균 비용'이다."
        type="truefalse"
        :answer="0"
        explanation="참. 빈도는 세상 p 가, 코드 길이는 내 지도 q 가 정합니다."
      />
      <Quiz
        difficulty="easy"
        question="H(p,q) 가 최소가 되는 것은 언제일까요?"
        :choices="['내 지도가 세상과 같을 때 (q = p)', '내 지도가 균등할 때', '내 지도가 몰빵일 때', '언제나 같다']"
        :answer="0"
        explanation="q = p 일 때 최소이고, 그 최소값이 바로 H(p)입니다. 이 사실이 6장 'AI 학습의 정체'의 토대예요."
      />
      <Quiz
        difficulty="easy"
        question="정답이 원핫(정답 칸만 1)이면 크로스 엔트로피는 −log q(정답) 하나로 줄어든다."
        type="truefalse"
        :answer="0"
        explanation="참. 확률 0인 항들이 전부 사라지고 정답 항만 남습니다 — 1장의 놀람과 같은 식."
      />
      <Quiz
        difficulty="easy"
        question="모델이 정답에 확률 1/2 을 줬다면 원핫 크로스 엔트로피 손실은 몇 비트일까요?"
        type="numeric"
        :answer="1"
        explanation="−log₂(1/2) = 1비트."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="날씨 세상 p = (1/2, 1/4, 1/8, 1/8) 에서 균등 지도 q = (1/4 씩) 의 요금을 단계별로 구하세요."
        :steps="[
          { lhs: '\\text{모든 코드 길이 } \\log_2 4', answer: 2 },
          { lhs: '\\text{확률의 총합}', answer: 1 },
          { lhs: 'H(p,q) = 1 \\times 2', answer: 2 },
        ]"
        :hints="['균등 지도는 모든 경우에 같은 길이를 줘요.', '길이가 다 같으면 평균은 그냥 그 길이.']"
        explanation="모든 경우가 2비트이니 평균도 2비트. 바닥 H(p)=1.75보다 0.25비트 비쌉니다."
      />
      <Quiz
        difficulty="medium"
        question="위 문제에서 균등 지도의 요금(2비트)이 바닥 H(p) = 1.75비트보다 초과한 양은 몇 비트일까요?"
        type="numeric"
        :answer="0.25"
        :tolerance="0.001"
        :hints="['초과분 = H(p,q) − H(p).']"
        explanation="2 − 1.75 = 0.25비트. 이 초과분이 5장의 주인공 KL 발산입니다."
      />
      <Quiz
        difficulty="medium"
        question="모델이 정답 토큰에 확률 0.001 을 준 '확신에 찬 오답'의 크로스 엔트로피 손실은?"
        :choices="['약 10비트로 폭발한다', '약 0.001비트로 미미하다', '정확히 1비트다', '0이다']"
        :answer="0"
        :hints="['−log₂ 0.001 ≈ log₂ 1000.', '2¹⁰ = 1024.']"
        explanation="log₂1000 ≈ 10비트. MSE 라면 최대 1 근처의 미지근한 벌 — 이 폭발력이 CE 를 쓰는 이유입니다."
      />
      <Quiz
        difficulty="medium"
        question="H(p,q) 와 H(q,p) 는 항상 같은 값이다."
        type="truefalse"
        :answer="1"
        :hints="['빈도 담당과 길이 담당이 서로 바뀝니다.']"
        explanation="거짓. 앞자리가 빈도, 뒷자리가 코드 길이를 맡으므로 순서가 바뀌면 값이 달라집니다 — 5장 비대칭성의 뿌리."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="거꾸로 지도의 요금 — 세상 p = (1/2, 1/4, 1/8, 1/8), 지도 q = (1/8, 1/8, 1/4, 1/2) 일 때 H(p,q) 를 항별로 구하세요."
        :steps="[
          { lhs: '\\tfrac{1}{2} \\times \\log_2 8', answer: 1.5 },
          { lhs: '\\tfrac{1}{4} \\times \\log_2 8', answer: 0.75 },
          { lhs: '\\tfrac{1}{8} \\times \\log_2 4', answer: 0.25 },
          { lhs: '\\tfrac{1}{8} \\times \\log_2 2', answer: 0.125 },
          { lhs: '\\text{합계}', answer: 2.625 },
        ]"
        :hints="['각 항 = (실제 빈도 p) × (지도의 코드 길이 log₂(1/q)).', '가장 흔한 맑음이 가장 긴 3비트 코드를 받았어요.']"
        explanation="1.5 + 0.75 + 0.25 + 0.125 = 2.625비트. 바닥보다 0.875비트나 비싼 최악의 지도!"
      />
      <Quiz
        difficulty="hard"
        question="시그모이드 출력층에서 MSE 대신 크로스 엔트로피를 쓰면 좋은 점으로 옳은 것은?"
        :choices="['σ′ 이 소거되어 기울기가 (ŷ−y) 로 단순해지고, 확신 구간에서도 기울기가 살아있다', '손실이 항상 0이 된다', '계산량이 줄어 GPU 가 필요 없다', '정확도가 무조건 100%가 된다']"
        :answer="0"
        :hints="['1부의 받아 적은 선물 σ′ = σ(1−σ) 을 떠올려 보세요.', 'MSE 는 σ′ 이 곱해져 양 끝에서 기울기가 죽어요.']"
        explanation="CE + 시그모이드 조합에서 σ′ 이 정확히 소거되어 기울기 = (ŷ−y). 크게 틀리면 크게 배우는 건강한 학습 — 10장 캡스톤에서 직접 확인합니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch4')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 4 완료. LLM 손실함수의 정체를 알았습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 실험실 게이지의 "초과분"에 이름을 붙입니다 — RLHF 와 증류의 언어, <b>KL 발산</b>.
      </p>
      <RouterLink
        to="/ch/ch5"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — KL 발산 →
      </RouterLink>
    </div>
  </article>
</template>
