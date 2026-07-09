<script setup lang="ts">
// Phase 3 · 엔트로피 (★ 핵심) — 평균 놀람, 균등분포가 최대
// 표준 구성: 개념 설명 + 새 기호 설명 + 인터랙티브 시각화 + 차트 + 미니체크 + 10문제 세트 + 노트북 안내
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { ChartView } from '@series/ui'
import EntropyExplorer from '@/components/EntropyExplorer.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 동전 엔트로피 곡선 H(p) — p = 0.5 에서 최대 1비트인 역U 곡선
const ps = Array.from({ length: 21 }, (_, i) => i / 20)
const binH = (p: number) =>
  p <= 0 || p >= 1 ? 0 : p * Math.log2(1 / p) + (1 - p) * Math.log2(1 / (1 - p))
const coinChart = {
  labels: ps.map((p) => p.toFixed(2)),
  datasets: [
    {
      label: '동전의 엔트로피 H (비트)',
      data: ps.map(binH),
      borderColor: '#6366f1',
      backgroundColor: '#6366f1',
      tension: 0.3,
      pointRadius: ps.map((p) => (p === 0.5 ? 5 : 0)),
    },
  ],
}
const coinOptions = {
  scales: {
    x: { title: { display: true, text: '앞면이 나올 확률 p' } },
    y: { title: { display: true, text: 'H (비트)' }, min: 0, max: 1.1 },
  },
}

function onSetComplete() {
  progress.markDone('ch3')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 3 · ★ 핵심 챕터</p>
    <h1 class="mb-4 text-3xl font-bold">엔트로피 — 불확실성을 재는 자</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1장에서 <b>사건 하나</b>의 놀람을 쟀고, 2장에서 "평균 놀람이라는 넘을 수 없는 바닥"을
      만났죠. 오늘 그 바닥에 이름을 붙입니다 — 정보이론에서 가장 유명한 단어,
      <b>엔트로피</b>. 여기서부터 크로스 엔트로피(4장), KL(5장), 퍼플렉시티(7장)가
      전부 이 위에 지어집니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>엔트로피 <MathBlock inline expr="H = \sum p \cdot \log_2 \frac{1}{p}" /> 를 <b>평균 놀람</b>으로 읽는다</li>
        <li>분포를 직접 주무르며 <b>균등일 때 최대, 몰빵일 때 0</b>을 확인한다</li>
        <li>엔트로피의 세 얼굴(평균 놀람 · 압축의 바닥 · 평균 질문 수)을 안다</li>
        <li>모델 예측의 <b>"자신 없음"을 재는 자</b>로 엔트로피를 읽는다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 평균 놀람 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 사건 하나에서 분포 전체로 — 평균 놀람</h2>
    <ReviewFlag id="ch3-s1" chapter="ch3" label="1. 평균 놀람 = 엔트로피 정의" />
    <p class="leading-relaxed text-slate-700">
      1장의 놀람 <MathBlock inline expr="I = \log_2 \frac{1}{p}" /> 은 "로또 당첨"처럼
      <b>이미 일어난 사건 하나</b>를 재는 자였어요. 그런데 이런 질문도 있죠 —
      "내일 날씨"라는 <b>확률 분포 자체</b>는 얼마나 불확실한가?
      답은 간단합니다. 일어날 수 있는 각 경우의 놀람을, <b>일어날 확률만큼 가중치를 줘서
      평균</b>내면 됩니다. 3부에서 배운 기대값 그대로예요.
    </p>
    <MathBlock expr="H = \sum_{x} p(x) \cdot \log_2 \frac{1}{p(x)} = \text{놀람의 기대값 (평균 놀람)}" />

    <ConceptCard tone="note" title="새 기호 — H 와 Σ 읽기">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <MathBlock inline expr="H" /> &nbsp;<b>이름</b>: 엔트로피 · <b>읽는 법</b>: "에이치" ·
          <b>뜻</b>: 분포의 평균 놀람 = 불확실성의 크기. 단위는 1장과 같은 <b>비트</b>
        </li>
        <li>
          <MathBlock inline expr="\textstyle\sum_x" /> &nbsp;<b>이름</b>: 시그마(합) 기호 (3부 재등장) ·
          <b>읽는 법</b>: "모든 x 에 대해 더하라" ·
          <b>뜻</b>: 가능한 모든 경우(동전이면 앞·뒤, 주사위면 1~6)에 대해 뒤의 값을 계산해 전부 더하기
        </li>
        <li>
          한 항 <MathBlock inline expr="p \cdot \log_2 \tfrac{1}{p}" /> = (그 경우가 나올 확률) × (그 경우의 놀람)
          — <b>확률로 가중한 놀람</b>입니다
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-4 leading-relaxed text-slate-700">
      바로 계산해 봅시다. <b>공정한 동전</b>(앞·뒤 각 1/2):
    </p>
    <MathBlock expr="H = \tfrac{1}{2} \cdot \log_2 2 + \tfrac{1}{2} \cdot \log_2 2 = \tfrac{1}{2} + \tfrac{1}{2} = 1 \text{비트}" />
    <p class="mt-1 leading-relaxed text-slate-700">
      동전 던지기 한 번의 불확실성 = <b>딱 1비트</b> = 반반 질문 하나. 자가 잘 맞네요!
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="엔트로피 H 는 각 경우의 놀람을 확률로 가중해서 평균 낸 것, 즉 '평균 놀람'이다."
      type="truefalse"
      :answer="0"
      explanation="참. H = Σ p·log₂(1/p) — 놀람 log₂(1/p) 의 기대값입니다."
    />

    <!-- 2. 치우친 동전 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 치우친 동전 — 확실할수록 H 가 내려간다</h2>
    <ReviewFlag id="ch3-s2" chapter="ch3" label="2. 치우친 동전과 역U 곡선" />
    <p class="leading-relaxed text-slate-700">
      앞면이 90% 나오는 <b>찌그러진 동전</b>은 어떨까요? 놀람 두 개를 가중 평균하면:
    </p>
    <MathBlock expr="H = 0.9 \cdot \log_2 \tfrac{1}{0.9} + 0.1 \cdot \log_2 \tfrac{1}{0.1} \approx 0.9 \times 0.15 + 0.1 \times 3.32 \approx 0.47 \text{비트}" />
    <p class="mt-1 leading-relaxed text-slate-700">
      1비트의 절반도 안 됩니다. 뒷면의 놀람(3.32비트)은 크지만 <b>드물게만 일어나서</b> 기여가
      작고, 대부분의 시간은 안 놀라운 앞면(0.15비트)이니까요. 거의 결과가 정해진 분포 =
      불확실성이 낮은 분포. 앞면 확률 p 를 0에서 1까지 움직이면 이런 곡선이 나옵니다:
    </p>

    <ChartView type="line" :data="coinChart" :options="coinOptions" :height="260" />
    <p class="mt-1 text-sm text-slate-500">
      <b>p = 0.5 (가장 못 맞히는 반반)에서 최대 1비트</b>, 양 끝(확실)에서 0. 이 역U 모양이
      엔트로피의 상징입니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="90:10 으로 치우친 동전의 엔트로피는 공정한(50:50) 동전보다 어떨까요?"
      :choices="['작다 — 결과가 거의 정해져 있으니까', '크다 — 뒷면의 놀람이 크니까', '같다 — 같은 동전이니까', '알 수 없다']"
      :answer="0"
      :hints="['H 는 놀람의 평균 — 큰 놀람도 드물게 일어나면 기여가 작아요.']"
      explanation="작습니다(약 0.47비트 < 1비트). 거의 확실한 분포일수록 평균적으로 덜 놀라죠."
    />

    <!-- 3. EntropyExplorer -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 분포를 직접 주물러 보기</h2>
    <ReviewFlag id="ch3-s3" chapter="ch3" label="3. 엔트로피 탐험대 (인터랙티브)" />
    <p class="leading-relaxed text-slate-700">
      이제 경우가 4개인 분포로 실험합시다. 막대를 드래그해서 분포 모양을 바꾸면
      H 가 실시간으로 계산됩니다. <b>H 를 최대로 만들어 보세요</b> — 어떤 모양에서 최대가 되나요?
    </p>

    <EntropyExplorer />

    <ConceptCard tone="tip" title="관찰 포인트 3가지">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>균등(25%씩)에서 최대 2비트</b> = log₂4 — 아무 정보 없이 4지선다를 찍는 상황</li>
        <li><b>한 글자 몰빵이면 0비트</b> — 결과를 이미 아니 불확실성이 없음</li>
        <li><b>두 글자 반반이면 정확히 1비트</b> — 실질적으로 동전 던지기와 같은 분포</li>
      </ul>
    </ConceptCard>

    <!-- 4. 균등이 최대 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 왜 균등이 최대인가</h2>
    <ReviewFlag id="ch3-s4" chapter="ch3" label="4. 균등분포가 최대인 이유" />
    <p class="leading-relaxed text-slate-700">
      스무고개로 돌아가면 자명해집니다. 불확실성이 가장 큰 상황 = <b>어느 후보도 편들 수 없는
      상황</b> = 모든 후보가 똑같이 유력한 상황이죠. 어느 쪽으로든 치우치는 순간
      "찍을 만한 후보"가 생기고, 평균적으로 질문을 아낄 수 있게 됩니다(2장의 압축!).
      그래서 경우가 n개일 때:
    </p>
    <MathBlock expr="0 \;\le\; H \;\le\; \log_2 n \qquad (\text{왼쪽 등호: 몰빵, 오른쪽 등호: 균등})" />
    <p class="mt-1 leading-relaxed text-slate-700">
      균등 분포의 H 가 <MathBlock inline expr="\log_2 n" /> 인 건 계산으로도 바로 보여요 —
      모든 항의 놀람이 <MathBlock inline expr="\log_2 n" /> 으로 같으니, 평균도 그대로
      <MathBlock inline expr="\log_2 n" />.
    </p>

    <DetailsCard title="➕ 더 깊이: 확률이 0인 칸은 어떻게 하나요? (0·log 0 문제)">
      몰빵 분포 (1, 0, 0, 0) 을 공식에 넣으면 <MathBlock inline expr="0 \cdot \log_2 \tfrac{1}{0}" />
      항이 나옵니다. log₂(1/0) 은 무한대인데 0을 곱하니 얼마죠? 정보이론에서는
      <b>0·log 0 = 0 으로 약속</b>합니다. 직관: 절대 안 일어나는 일은 놀람이 아무리 커도
      <b>평균에 낄 자격이 없다</b>. (수학적으로도 p 를 0으로 보내면 p·log(1/p) 가 0으로
      수렴합니다 — 2부의 극한.) 탐험대 표에서 "0 (관례)"라고 표시된 게 바로 이 약속이에요.
    </DetailsCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="경우가 4개인 분포의 엔트로피가 가장 클 때, 그 값은 몇 비트일까요?"
      type="numeric"
      :answer="2"
      :hints="['최대는 균등 분포일 때 log₂n.', 'log₂4 는?']"
      explanation="균등(25%씩)일 때 log₂4 = 2비트가 최대입니다."
    />

    <!-- 5. 세 얼굴 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 엔트로피의 세 얼굴 — 같은 숫자, 세 가지 읽기</h2>
    <ReviewFlag id="ch3-s5" chapter="ch3" label="5. 엔트로피의 세 얼굴" />
    <p class="leading-relaxed text-slate-700">
      지금까지의 여정이 사실 전부 한 숫자를 세 방향에서 본 것이었습니다:
    </p>
    <div class="my-4 grid gap-3 sm:grid-cols-3">
      <div class="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
        <p class="text-sm font-bold text-indigo-900">😲 평균 놀람</p>
        <p class="mt-1 text-xs leading-relaxed text-indigo-700">
          이 분포에서 결과를 하나 볼 때마다 평균적으로 이만큼 놀란다 (1장 → 3장)
        </p>
      </div>
      <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <p class="text-sm font-bold text-emerald-900">📦 압축의 바닥</p>
        <p class="mt-1 text-xs leading-relaxed text-emerald-700">
          이 분포에서 나온 기호를 부호화하면 글자당 최소 이만큼의 비트가 든다 (2장)
        </p>
      </div>
      <div class="rounded-xl border border-amber-100 bg-amber-50 p-4">
        <p class="text-sm font-bold text-amber-900">🎯 평균 질문 수</p>
        <p class="mt-1 text-xs leading-relaxed text-amber-700">
          결과를 알아내려면 반반 질문이 평균 이만큼 필요하다 (워밍업)
        </p>
      </div>
    </div>
    <p class="leading-relaxed text-slate-700">
      예를 들어 "내일 날씨" 분포가 맑음 50% · 흐림 25% · 비 12.5% · 눈 12.5% 라면
      H = 1.75비트 — 어디서 봤죠? <b>2장에서 계산한 그 1.75비트</b>입니다.
      평균 놀람이자, 최적 일기예보 부호의 평균 길이이자, 날씨를 알아내는 평균 질문 수예요.
    </p>

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 모델의 "자신 없음"을 재는 자</h2>
    <ReviewFlag id="ch3-ai" chapter="ch3" label="🤖 모델 예측의 자신 없음 재기" />
    <p class="leading-relaxed text-slate-700">
      LLM 은 다음 토큰에 대한 <b>확률 분포</b>를 내놓습니다(4부의 소프트맥스 출력).
      그 분포의 엔트로피를 재면, 모델이 지금 얼마나 <b>갈팡질팡하는지</b>가 숫자 하나로 나옵니다.
    </p>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 예측 분포의 엔트로피 읽기">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>"대한민국의 수도는" 다음</b>: "서울"에 확률이 몰빵된 분포 → H ≈ 0.
          모델이 확신에 차 있고, 생성 결과도 뻔합니다.
        </li>
        <li>
          <b>"내가 가장 좋아하는 색은" 다음</b>: 수십 개 색깔에 확률이 퍼진 분포 → H 큼.
          모델이 자신 없다는 뜻이자, 다양한 답이 나올 수 있다는 뜻.
        </li>
        <li>
          8장의 <b>temperature 는 정확히 이 H 를 돌리는 다이얼</b>입니다 — 온도를 올리면 분포가
          균등 쪽으로 퍼져 H 가 커지고(창의적·불안정), 내리면 몰빵 쪽으로 좁아져 H 가 작아져요(안전·뻔함).
        </li>
        <li>
          단, 지금까지는 <b>모델 혼자만의 자신감</b>입니다. "자신 있게 <b>틀리면</b>" 어떡하죠?
          정답 분포와 비교해서 채점하는 자가 필요합니다 — 그게 다음 장의 <b>크로스 엔트로피</b>예요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="다음 토큰 예측 분포의 엔트로피가 0에 가깝다는 것은 무슨 뜻일까요?"
      :choices="['모델이 한 토큰을 거의 확신하고 있다', '모델이 여러 후보 사이에서 갈팡질팡한다', '모델이 틀렸다', '어휘 수가 적다']"
      :answer="0"
      explanation="H ≈ 0 은 확률이 한 곳에 몰빵된 분포 — 확신에 찬 예측입니다. (맞는 확신인지는 별개 — 4장에서!)"
    />

    <!-- 연습 문제 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">6. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="엔트로피 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="엔트로피는 분포의 '평균 놀람'이다."
        type="truefalse"
        :answer="0"
        explanation="참. H = Σ p·log₂(1/p) — 각 경우의 놀람을 확률로 가중 평균한 값입니다."
      />
      <Quiz
        difficulty="easy"
        question="공정한 동전(앞뒤 각 1/2) 던지기 한 번의 엔트로피는 몇 비트일까요?"
        type="numeric"
        :answer="1"
        explanation="½·log₂2 + ½·log₂2 = 1비트. 반반 질문 하나 어치의 불확실성."
      />
      <Quiz
        difficulty="easy"
        question="다음 중 엔트로피가 가장 큰 분포는?"
        :choices="['네 경우가 모두 25%인 균등 분포', '한 경우가 100%인 몰빵 분포', '90:10 으로 치우친 분포', '70:30 으로 치우친 분포']"
        :answer="0"
        explanation="균등이 최대입니다 — 어느 후보도 편들 수 없는, 가장 불확실한 상황이니까요."
      />
      <Quiz
        difficulty="easy"
        question="결과가 확실히 정해진 분포(한 경우의 확률이 1)의 엔트로피는 0이다."
        type="truefalse"
        :answer="0"
        explanation="참. 놀랄 일이 전혀 없으니 평균 놀람도 0입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="4면 주사위(각 면 확률 1/4)의 엔트로피를 단계별로 구하세요."
        :steps="[
          { lhs: '\\text{한 면의 놀람 } \\log_2 4', answer: 2 },
          { lhs: '\\text{한 항의 기여 } \\tfrac{1}{4} \\times 2', answer: 0.5 },
          { lhs: '\\text{네 항의 합 } 0.5 \\times 4', answer: 2 },
        ]"
        :hints="['모든 면의 놀람이 같아요: log₂4.', '같은 기여가 4개 — 곱하면 끝.']"
        explanation="H = 4 × (¼ × 2) = 2비트 = log₂4. 균등 분포의 H 는 항상 log₂n 입니다."
      />
      <Quiz
        difficulty="medium"
        question="8개의 경우가 균등한 분포의 엔트로피는 몇 비트일까요?"
        type="numeric"
        :answer="3"
        :hints="['균등 분포의 H = log₂n.']"
        explanation="log₂8 = 3비트."
      />
      <Quiz
        difficulty="medium"
        question="엔트로피가 높은 분포일수록, 결과를 알아내는 데 필요한 평균 반반 질문 수가 많다."
        type="truefalse"
        :answer="0"
        explanation="참. 엔트로피의 세 얼굴 중 하나 — H 는 최적 전략으로도 필요한 평균 질문 수입니다."
      />
      <Quiz
        difficulty="medium"
        question="어떤 텍스트의 글자 분포 엔트로피가 4.1비트라면, 이 텍스트를 무손실 압축할 때 글자당 평균 비트의 한계는?"
        :choices="['4.1비트 아래로는 불가능', '얼마든지 0에 가깝게 가능', '정확히 8비트', '엔트로피와 무관']"
        :answer="0"
        :hints="['엔트로피의 세 얼굴 중 압축의 바닥.']"
        explanation="H 는 압축의 바닥 — 글자당 평균 4.1비트 아래로는 어떤 무손실 압축도 불가능합니다(2장에서 체험한 그 바닥)."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="분포 p = (1/2, 1/4, 1/8, 1/8) 의 엔트로피를 항별로 구해 더하세요."
        :steps="[
          { lhs: '\\tfrac{1}{2} \\times \\log_2 2', answer: 0.5 },
          { lhs: '\\tfrac{1}{4} \\times \\log_2 4', answer: 0.5 },
          { lhs: '\\tfrac{1}{8} \\times \\log_2 8', answer: 0.375 },
          { lhs: '\\text{합계 } 0.5 + 0.5 + 0.375 + 0.375', answer: 1.75 },
        ]"
        :hints="['각 항 = 확률 × 그 경우의 놀람.', '1/8 항의 놀람은 log₂8 = 3 → 기여는 3/8 = 0.375.']"
        explanation="H = 1.75비트 — 2장에서 최적 코드의 평균 길이로 만났던 바로 그 값! 평균 놀람 = 압축의 바닥."
      />
      <Quiz
        difficulty="hard"
        question="두 모델이 다음 토큰을 예측했습니다. 모델 A 의 분포는 H = 0.3비트, 모델 B 는 H = 5비트. 옳게 해석한 것은?"
        :choices="['A 는 거의 확신, B 는 갈팡질팡하는 중', 'A 가 갈팡질팡, B 는 확신', 'A 가 B 보다 항상 정확하다', '두 모델의 어휘 수가 다르다는 뜻이다']"
        :answer="0"
        :hints="['H 는 자신 없음의 크기 — 낮을수록 몰빵 분포.', '단, 확신이 정답이라는 보장은 없어요(4장).']"
        explanation="H 가 낮으면 확률이 몰빵된 확신 상태, 높으면 퍼진 갈팡질팡 상태. 정확한지는 정답과 비교해야 알아요 — 그게 크로스 엔트로피(4장)."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch3')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 3 완료. 불확실성의 자, 엔트로피를 얻었습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 시리즈의 심장 — 틀린 지도로 세상을 읽는 비용, <b>크로스 엔트로피</b>입니다.
        1부 캡스톤의 복선이 드디어 회수됩니다.
      </p>
      <RouterLink
        to="/ch/ch4"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 크로스 엔트로피 →
      </RouterLink>
    </div>
  </article>
</template>
