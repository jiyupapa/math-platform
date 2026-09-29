<script setup lang="ts">
// Phase 7 · 퍼플렉시티 — LLM 의 성적표 (2^크로스엔트로피 = 평균 몇 갈래 고민)
// 표준 구성: 개념 설명 + 인터랙티브 시각화 + 미니체크 + 10문제 세트 + 노트북 안내
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import PerplexityGauge from '@/components/PerplexityGauge.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch7')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">7장 · LLM 트랙</p>
    <h1 class="mb-4 text-3xl font-bold">퍼플렉시티 — LLM 의 성적표</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      6장에서 훈련 손실의 정체를 알았지만, "loss 3.2비트"라는 성적은 감이 잘 안 오죠.
      이번 챕터는 그 비트를 사람이 읽는 숫자로 <b>되돌리는</b> 이야기입니다.
      GPT 논문·벤치마크마다 나오는 <b>퍼플렉시티(perplexity)</b>. 새 이론은 없어요.
      log 를 <b>거꾸로</b> 돌릴 뿐입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><MathBlock inline expr="\text{PPL} = 2^{\text{크로스 엔트로피(비트)}}" />: 비트를 <b>갈래 수</b>로 되돌린다</li>
        <li>PPL = <b>"평균 몇 갈래의 균등 후보에서 고민하나"</b>로 읽는다</li>
        <li>문장 하나의 PPL 을 토큰별 손실에서 직접 계산한다</li>
        <li>벤치마크 표의 PPL 숫자를 읽고, <b>비교할 때의 함정</b>을 안다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 비트를 갈래로 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. log 를 거꾸로: 비트를 갈래 수로 되돌리기</h2>
    <ReviewFlag id="ch7-s1" chapter="ch7" label="1. 2^비트 = 갈래 수" />
    <p class="leading-relaxed text-slate-700">
      워밍업부터 줄곧 한 방향으로만 걸었어요: 후보 64갈래 → log₂ → 6비트.
      이걸 거꾸로 걸으면? <b>6비트 → 2⁶ → 64갈래</b>. log₂ 의 역연산이 2^ 이니까요(2부 7장).
      손실(크로스 엔트로피)은 비트지만, 2^ 를 씌우면 <b>"몇 갈래에서 고민하는 수준인가"</b>라는
      직관적인 숫자가 됩니다:
    </p>
    <MathBlock expr="\text{PPL} \;=\; 2^{H(p,q)} \qquad (\text{손실이 비트 단위일 때})" />

    <ConceptCard tone="note" title="새 용어: 퍼플렉시티 (perplexity)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>이름</b>: 퍼플렉시티 · <b>읽는 법</b>: "퍼플렉시티", 표기는 PPL</li>
        <li><b>어원</b>: perplexed = 갈피를 못 잡는. 말 그대로 <b>"얼마나 헷갈려하나"</b></li>
        <li>
          <b>뜻</b>: 모델이 다음 토큰을 고를 때, <b>평균적으로 몇 갈래의 균등한 후보</b>에서
          고민하는 것과 같은 수준인가. 단위 없는 "갈래 수"
        </li>
        <li><b>낮을수록 좋은 성적</b>: 덜 헷갈린다는 뜻이니까요</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="손실이 3비트인 모델의 퍼플렉시티는 몇일까요?"
      type="numeric"
      :answer="8"
      :hints="['PPL = 2^손실.', '2³ = ?']"
      explanation="2³ = 8. 매 토큰을 평균 8갈래에서 고민하는 수준입니다."
    />

    <!-- 2. 갈래 수 직관 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 왜 "갈래 수"라고 읽어도 되나</h2>
    <ReviewFlag id="ch7-s2" chapter="ch7" label="2. PPL = 실질 갈래 수" />
    <p class="leading-relaxed text-slate-700">
      정확히 <b>k 갈래를 균등하게</b> 고민하는 모델을 생각해 보세요. 매번 확률 1/k 인 정답을
      만나니 손실은 log₂k 비트, PPL 은 <MathBlock inline expr="2^{\log_2 k} = k" />, 곧
      <b>갈래 수가 그대로 나옵니다</b>. 그래서 PPL 은 어떤 분포든 "이만큼 균등하게 헷갈리는
      것과 같다"는 <b>실질 갈래 수</b>예요.
    </p>
    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[24rem] text-center text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs text-slate-500">
            <th class="py-1.5 font-medium">상황</th>
            <th class="py-1.5 font-medium">H (비트)</th>
            <th class="py-1.5 font-medium">PPL = 2^H</th>
            <th class="py-1.5 font-medium">읽기</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-slate-100">
            <td class="py-1.5">공정한 동전</td>
            <td class="py-1.5 tabular-nums">1</td>
            <td class="py-1.5 font-bold tabular-nums text-indigo-700">2</td>
            <td class="py-1.5 text-xs text-slate-500">딱 2갈래 고민</td>
          </tr>
          <tr class="border-b border-slate-100">
            <td class="py-1.5">주사위</td>
            <td class="py-1.5 tabular-nums">2.585</td>
            <td class="py-1.5 font-bold tabular-nums text-indigo-700">6</td>
            <td class="py-1.5 text-xs text-slate-500">6갈래 고민</td>
          </tr>
          <tr class="border-b border-slate-100">
            <td class="py-1.5">90:10 치우친 동전</td>
            <td class="py-1.5 tabular-nums">0.469</td>
            <td class="py-1.5 font-bold tabular-nums text-indigo-700">1.38</td>
            <td class="py-1.5 text-xs text-slate-500">거의 확정 (1.38갈래)</td>
          </tr>
          <tr>
            <td class="py-1.5">날씨 (½, ¼, ⅛, ⅛)</td>
            <td class="py-1.5 tabular-nums">1.75</td>
            <td class="py-1.5 font-bold tabular-nums text-indigo-700">3.36</td>
            <td class="py-1.5 text-xs text-slate-500">후보 4개지만 실질 3.36갈래</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="leading-relaxed text-slate-700">
      마지막 줄이 재미있죠. 후보는 4개인데 PPL 은 3.36. <b>치우친 분포는 갈래가 줄어든
      효과</b>가 있으니까요(맑음 쪽으로 반쯤 마음이 기울어 있는 상태). PPL 이 1이면 고민이
      아예 없는 것(확신), 후보 수보다 클 수는 없습니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="공정한 주사위(6면 균등)의 결과를 예측하는 모델의 퍼플렉시티는?"
      type="numeric"
      :answer="6"
      :hints="['균등 k갈래의 PPL = k.']"
      explanation="6갈래를 균등하게 고민하니 PPL = 6. H = log₂6 ≈ 2.585비트를 2^ 로 되돌린 값입니다."
    />

    <!-- 3. 문장 PPL + Gauge -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 문장의 성적 매기기: 채점기</h2>
    <ReviewFlag id="ch7-s3" chapter="ch7" label="3. 퍼플렉시티 채점기 (인터랙티브)" />
    <p class="leading-relaxed text-slate-700">
      실제 채점 순서는 4장에서 이미 배웠습니다: ① 토큰마다 정답에 준 확률 q 를 꺼내
      ② 손실 −log₂q 를 재고 ③ 평균낸 뒤 ④ <b>마지막에 2^ 를 씌운다</b>. 끝.
      아래 채점기에서 세 예문의 성적을 비교하고, 슬라이더로 직접 조절해 보세요.
    </p>

    <PerplexityGauge />

    <ConceptCard tone="tip" title="관찰 포인트 3가지">
      <ul class="list-disc space-y-1 pl-5">
        <li>뻔한 문장은 PPL 이 1 근처, 곧 모델이 거의 안 헷갈림</li>
        <li><b>어려운 토큰 하나("국밥", "삶았다")가 성적을 지배</b>: 1장의 "희귀 토큰이 크게 혼난다" 재회</li>
        <li>같은 문장이라도 좋은 모델(q 높음)이면 PPL 이 낮다. 성적표가 모델을 비교하는 이유</li>
      </ul>
    </ConceptCard>

    <DetailsCard title="➕ 더 깊이: 사실 PPL 은 기하평균입니다 (+ nat 단위 주의)">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          2^(log 들의 산술평균) = 원래 값들의 <b>기하평균</b>이라서,
          <MathBlock inline expr="\text{PPL} = \left( \tfrac{1}{q_1} \cdot \tfrac{1}{q_2} \cdots \tfrac{1}{q_N} \right)^{1/N}" />,
          곧 "정답 확률의 역수(그 토큰의 갈래 수)들의 기하평균"입니다. 곱셈으로 쌓이는 값은
          산술평균 대신 기하평균이 공정한 자예요.
        </li>
        <li>
          딥러닝 코드의 loss 는 보통 <b>nat 단위(ln)</b>이고, 그때는
          <MathBlock inline expr="\text{PPL} = e^{\text{loss}}" /> 로 되돌립니다.
          밑만 맞추면 같은 값(1장 bit/nat 카드). loss 2.996 nat → e^2.996 ≈ 20.
        </li>
      </ul>
    </DetailsCard>

    <!-- 4. 성적표 읽는 법 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 벤치마크 표 읽는 법과 함정</h2>
    <ReviewFlag id="ch7-s4" chapter="ch7" label="4. 벤치마크 PPL 읽기와 함정" />
    <p class="leading-relaxed text-slate-700">
      논문의 "WikiText-103 에서 PPL 29 → 20 으로 개선" 같은 문장을 이제 읽을 수 있습니다:
      <b>같은 시험지</b>(고정된 평가 텍스트)에서 다음 토큰을 평균 29갈래 고민하던 모델이
      20갈래 고민으로 줄었다. 성적이 오른 거죠.
    </p>

    <ConceptCard tone="warn" title="비교의 함정: 같은 시험지·같은 답안지 형식일 때만!">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>토크나이저가 다르면 직접 비교 금지</b>: 토큰을 잘게 쪼개는 모델은 토큰당 예측이
          쉬워져 PPL 이 낮게 나옵니다. 2장에서 봤듯 토큰화 자체가 압축이니까요.
        </li>
        <li><b>평가 텍스트가 다르면 비교 금지</b>: 쉬운 텍스트(뻔한 문장들)는 누구에게나 PPL 이 낮아요.</li>
        <li>같은 조건이라면 낮을수록 좋은 모델, 그리고 6장 덕분에 <b>더 좋은 압축기</b>라는 뜻.</li>
      </ul>
    </ConceptCard>

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 성적표 너머: PPL 로 모델 보는 눈</h2>
    <ReviewFlag id="ch7-ai" chapter="ch7" label="🤖 PPL 로 모델 읽기" />
    <p class="leading-relaxed text-slate-700">
      PPL 은 단순 벤치마크 숫자를 넘어, 모델과 데이터를 보는 렌즈로 두루 쓰입니다.
    </p>

    <ConceptCard tone="ai" title="🤖 AI 연결: PPL 이 일하는 현장들">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>사전학습 모니터링</b>: 훈련 로그의 loss 를 PPL 로 환산해 "지금 몇 갈래 고민 수준인지"
          추적해요. 균등 어휘(예: 5만 갈래)에서 출발해 수십 갈래로 내려오는 여정이 학습입니다.
        </li>
        <li>
          <b>데이터 품질 필터</b>: 잘 훈련된 모델로 문서의 PPL 을 재서, 너무 높으면(외계어·깨진 텍스트)
          훈련 데이터에서 걸러냅니다. 모델이 놀라는 문서 = 이상한 문서.
        </li>
        <li>
          <b>퍼플렉시티의 한계</b>: PPL 은 "다음 토큰 맞히기" 성적일 뿐, 추론력·안전성 같은
          능력은 별도 벤치마크가 필요해요. 그래도 <b>같은 계열 모델의 스케일 비교</b>에는 여전히
          가장 깨끗한 자입니다(스케일링 법칙 그래프의 세로축!).
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="같은 평가 텍스트·같은 토크나이저에서 모델 A 는 PPL 35, 모델 B 는 PPL 18 입니다. 옳은 해석은?"
      :choices="['B 가 다음 토큰을 덜 헷갈려하는 더 좋은 모델', 'A 가 더 좋은 모델', 'PPL 로는 아무것도 알 수 없다', 'B 의 어휘 수가 18개라는 뜻']"
      :answer="0"
      explanation="같은 시험지라면 낮을수록 좋은 성적이에요. B 는 평균 18갈래 고민 수준으로 A(35갈래)보다 확신이 큽니다."
    />

    <!-- 연습 문제 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="퍼플렉시티: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="퍼플렉시티는 크로스 엔트로피(비트)에 2^ 를 씌워 '갈래 수'로 되돌린 것이다."
        type="truefalse"
        :answer="0"
        explanation="참. PPL = 2^H(p,q). log 의 역연산으로 비트를 갈래 수로 되돌립니다."
      />
      <Quiz
        difficulty="easy"
        question="손실이 2비트인 모델의 퍼플렉시티는?"
        type="numeric"
        :answer="4"
        explanation="2² = 4. 평균 4갈래에서 고민하는 수준."
      />
      <Quiz
        difficulty="easy"
        question="퍼플렉시티의 가장 좋은 직관적 해석은?"
        :choices="['다음 토큰을 평균 몇 갈래의 균등 후보에서 고민하는 수준인가', '모델의 파라미터 수', '초당 생성 토큰 수', '정답률 퍼센트']"
        :answer="0"
        explanation="PPL = 실질 갈래 수. 균등 k갈래 고민이면 정확히 PPL = k 가 나오죠."
      />
      <Quiz
        difficulty="easy"
        question="퍼플렉시티는 낮을수록 좋은 성적이다."
        type="truefalse"
        :answer="0"
        explanation="참. 덜 헷갈린다 = 다음 토큰을 더 잘 예측한다는 뜻입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="문장 4개 토큰에서 모델이 정답에 준 확률이 (1/2, 1/8, 1/2, 1/8) 이었습니다. 이 문장의 퍼플렉시티를 단계별로 구하세요."
        :steps="[
          { lhs: '\\text{토큰 손실의 합 } 1+3+1+3', answer: 8 },
          { lhs: '\\text{평균 } 8 \\div 4', answer: 2 },
          { lhs: '\\text{PPL} = 2^2', answer: 4 },
        ]"
        :hints="['토큰별 손실 = log₂(1/q) → 1, 3, 1, 3비트.', '평균 낸 뒤 마지막에 2^.']"
        explanation="평균 2비트 → PPL = 4. 채점기에서 본 그 순서: 손실 → 평균 → 2^."
      />
      <Quiz
        difficulty="medium"
        question="8개의 후보를 완전히 균등하게 고민하는 모델의 퍼플렉시티는?"
        type="numeric"
        :answer="8"
        :hints="['균등 k갈래의 PPL = k.']"
        explanation="H = log₂8 = 3비트, PPL = 2³ = 8. 갈래 수 그대로."
      />
      <Quiz
        difficulty="medium"
        question="'WikiText 에서 PPL 20'인 LLM 에 대한 옳은 해석은?"
        :choices="['그 텍스트의 다음 토큰을 평균 20갈래 균등 고민 수준으로 예측한다', '정확도가 20%다', '초당 20토큰을 생성한다', '어휘가 20개뿐이다']"
        :answer="0"
        explanation="PPL 20 = 매 토큰을 평균 20갈래에서 고르는 것과 같은 헷갈림 수준입니다."
      />
      <Quiz
        difficulty="medium"
        question="토크나이저가 서로 다른 두 모델의 퍼플렉시티는 숫자만 보고 직접 비교해도 된다."
        type="truefalse"
        :answer="1"
        :hints="['토큰을 잘게 쪼개면 토큰당 예측이 쉬워져요.']"
        explanation="거짓. 토큰 단위가 다르면 다른 시험지예요. 같은 토크나이저·같은 평가 텍스트일 때만 비교 가능합니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="90:10 으로 치우친 동전을 예측하는 모델(H ≈ 0.469비트)의 퍼플렉시티는 약 얼마일까요?"
        type="numeric"
        :answer="1.38"
        :tolerance="0.05"
        :hints="['PPL = 2^0.469.', '후보는 2개지만 거의 확정이라 2보다 훨씬 작아요.']"
        explanation="2^0.469 ≈ 1.38갈래. 거의 고민하지 않는 수준. 치우친 분포는 실질 갈래가 줄어듭니다."
      />
      <Quiz
        difficulty="hard"
        question="어떤 프레임워크의 훈련 loss 가 nat 단위로 2.996 입니다 (ln 20 ≈ 2.996). 퍼플렉시티는?"
        :choices="['e^2.996 ≈ 20', '2^2.996 ≈ 8', '2.996 그대로', '단위와 무관하게 10']"
        :answer="0"
        :hints="['nat 단위 loss 는 ln 기반이라 되돌리는 밑도 e.']"
        explanation="밑을 맞춰야 합니다: nat 이면 e^loss, 비트면 2^loss. e^2.996 ≈ 20. 같은 모델을 비트로 재면 log₂20 ≈ 4.32비트, 2^4.32 도 똑같이 20."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch7')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">7장 완료. 이제 성적표가 읽힙니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 생성의 다이얼, temperature 가 분포의 엔트로피를 돌리는 원리입니다.
      </p>
      <RouterLink
        to="/ch/ch8"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터: temperature →
      </RouterLink>
    </div>
  </article>
</template>
