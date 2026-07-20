<script setup lang="ts">
// 7장 — DPO: 보상 모델 없이 조련하기. RLHF 수식을 접으면 나오는 지름길.
// 회수하는 수학: 5부 5장(KL — 수식에 내장) · 2부 7장(시그모이드) · 4장 Bradley-Terry 재사용.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import DpoLab from '@/components/DpoLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch7')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">7장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">DPO — 보상 모델 없이 조련하기</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      RLHF 훈련장에는 모델이 세 개나 서 있었죠(정책·심판·참조). 6장 끝의 질문 —
      "보상 모델을 안 만들고 선호 쌍에서 <b>바로</b> 배울 수는 없나?" —
      에 2023년에 나온 답이 <b>DPO</b>입니다. 새 부품은 없어요.
      4장의 Bradley-Terry 와 6장의 KL 목줄을 <b>접어서 합치면</b> 나옵니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      DPO 의 핵심 발상 — <b>"정책 자체가 숨은 보상 모델이다"</b> — 를 이해하고,
      DPO 손실을 한 문장으로 읽을 수 있게 됩니다:
      <b>"선택된 답은 원본보다 자주, 탈락한 답은 덜 자주 — 그 격차를 벌려라."</b>
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 다리를 건너뛰는 발상</h2>
    <ReviewFlag id="ch7-s1" chapter="ch7" label="1. 다리를 건너뛰는 발상" />
    <p class="leading-relaxed text-slate-700">
      RLHF 의 경로는 이랬습니다: 선호 쌍 → <b>보상 모델 훈련</b> → <b>RL 루프</b>(생성→채점→갱신).
      DPO 의 질문은 단순해요 — 어차피 출발(선호 쌍)과 도착(더 나은 답을 내는 정책)이
      정해져 있는데, <b>중간 정거장 두 개를 꼭 거쳐야 하나?</b>
      놀랍게도 수학이 "아니오"라고 답합니다. 6장의 목적함수(r − β·KL)를 종이 위에서
      끝까지 풀면, 보상 모델이 <b>수식에서 지워지고</b> 정책만 남거든요.
    </p>

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 숨은 점수 — 정책 안에 이미 심판이 있다</h2>
    <ReviewFlag id="ch7-s2" chapter="ch7" label="2. 숨은 점수 — 정책 안에 이미 심판이 있다" />
    <p class="leading-relaxed text-slate-700">
      그 소거의 결과가 이 한 줄입니다. 어떤 답변 y 에 대한 모델의 <b>숨은 점수</b>는:
    </p>
    <MathBlock expr="\hat{r}(y) = \beta \cdot \log \frac{\pi(y)}{\pi_{\text{ref}}(y)}" />
    <p class="leading-relaxed text-slate-700">
      읽는 법: <b>"원본(π<sub>ref</sub>)보다 이 답을 얼마나 더 자주 내는가"의 로그 비율</b>.
      원본보다 2배 자주 내면 양수(그 답을 높게 친다는 뜻), 절반으로 줄였으면 음수.
      즉 정책의 확률 변화 자체가 점수표 역할을 합니다 — <b>별도의 심판이 필요 없던 거예요</b>.
      β 와 π<sub>ref</sub> 가 수식 안에 그대로 있다는 것도 보세요 — KL 목줄이 지름길에도
      살아 있다는 증거입니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="DPO의 '숨은 점수' r̂ = β·log(π/π_ref) 가 뜻하는 것은?"
      :choices="['원본보다 그 답을 얼마나 더(덜) 자주 내는가 — 정책의 확률 변화가 곧 점수', '답변의 글자 수', '보상 모델이 매긴 점수의 사본', 'GPU 온도']"
      :answer="0"
      :hints="['π/π_ref 비율이 2라면? 0.5라면?']"
      explanation="원본 대비 확률 비율의 로그입니다. 정책이 어떤 답의 확률을 올렸다는 것 자체가 '높게 친다'는 표현 — 정책이 곧 심판이에요."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습 — 숨은 점수에 숫자 넣기</p>
    <StepQuiz
      difficulty="medium"
      question="β = 0.1 인 DPO 훈련 중, 모델이 어떤 답변을 π = 0.2 확률로 냅니다. 원본(참조 모델)은 같은 답을 π_ref = 0.1 로 내던 참이었어요. 숨은 점수 r̂ = β·ln(π/π_ref) 를 단계별로 계산하세요. (여기서 로그는 자연로그 ln — 논문 표준. ln 2 ≈ 0.69 로 계산)"
      :steps="[
        { lhs: '\\pi / \\pi_{\\text{ref}} = ?', answer: 2, tolerance: 0.01 },
        { lhs: '\\ln 2 \\approx ?', answer: 0.69, tolerance: 0.02 },
        { lhs: '\\hat{r} = 0.1 \\times 0.69 \\approx ?', answer: 0.069, tolerance: 0.005 },
      ]"
      :hints="['원본의 몇 배로 자주 내는 답인지 비율부터 구하세요. 로그값은 문제에 준 근사(ln 2 ≈ 0.69)를 그대로 쓰면 됩니다.']"
      explanation="비율 2 → ln 2 ≈ 0.69 → r̂ = 0.1 × 0.69 ≈ +0.069. 원본보다 2배 자주 내는 답이라 점수가 양수 — 모델이 그 답을 높게 친다는 뜻입니다. 반대로 π = 0.05(원본의 절반)라면 ln 0.5 ≈ −0.69 라 점수는 음수가 돼요. β 를 키우면 같은 비율 변화에도 점수가 커집니다 — 목줄(6장)의 세기가 점수의 눈금이 되는 거죠."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 해보기 — 심판 없는 훈련</h2>
    <ReviewFlag id="ch7-s3" chapter="ch7" label="3. 직접 해보기 — 심판 없는 훈련" />
    <p class="leading-relaxed text-slate-700">
      이제 4장의 Bradley-Terry 손실에 보상 모델 점수 대신 <b>숨은 점수를 그대로 꽂으면</b>
      DPO 손실이 됩니다:
    </p>
    <MathBlock expr="\text{손실} = -\log \sigma\big(\hat{r}(y_{\text{선택}}) - \hat{r}(y_{\text{탈락}})\big)" />
    <p class="leading-relaxed text-slate-700">
      <b>−log σ(마진)</b> — 4장과 완전히 같은 모양이죠(−log 의 네 번째 재등장!).
      경사하강이 이 손실을 내리누르면: 선택된 답의 숨은 점수는 오르고(= 원본보다 자주),
      탈락한 답은 내려갑니다(= 원본보다 덜 자주). 아래에서 직접 새겨 보세요.
    </p>

    <DpoLab />

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">선택된 답은 원본보다 자주, 탈락한 답은 덜 자주 — 격차를 벌려라</p>
      <p class="mt-1 text-sm text-indigo-600">생성도 채점도 없이, SFT처럼 데이터셋을 도는 지도학습 스타일로 선호가 새겨진다.</p>
    </div>

    <ConceptCard tone="note" title="새 용어: DPO / 암묵적 보상">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>DPO</b> (Direct Preference Optimization) — 읽는 법: 디피오, 직접 선호 최적화.
          뜻: 보상 모델·RL 루프 없이 <b>선호 쌍에서 바로</b> 정책을 조련하는 방법.
          훈련장에 모델 두 개뿐(π + 얼려둔 π<sub>ref</sub>).
        </li>
        <li>
          <b>암묵적 보상</b> (implicit reward) — 읽는 법: 암묵적 보상.
          뜻: β·log(π/π<sub>ref</sub>) — 따로 훈련하지 않았는데 정책 안에 <b>이미 들어 있는</b> 점수.
          <b>2절부터 부르던 "숨은 점수"가 바로 이것</b> — 논문·문서에서는 implicit reward 로 나와요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'DPO는 KL 목줄을 버린 방법이다' — 참일까요?"
      type="truefalse"
      :answer="1"
      explanation="거짓입니다. 숨은 점수 β·log(π/π_ref) 안에 β(목줄 세기)와 π_ref(원본 기준점)가 그대로 들어 있어요 — 목줄이 수식 안으로 접혀 들어간 것이지 사라진 게 아닙니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">4. RLHF vs DPO — 득실 비교</h2>
    <ReviewFlag id="ch7-s4" chapter="ch7" label="4. RLHF vs DPO — 득실 비교" />
    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[28rem] text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3"></th>
            <th class="py-2 pr-3">RLHF (6장)</th>
            <th class="py-2">DPO (이 장)</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3 font-medium">훈련장의 모델</td><td class="py-2 pr-3">3개 (정책·심판·참조)</td><td class="py-2"><b>2개</b> (정책·참조)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3 font-medium">훈련 방식</td><td class="py-2 pr-3">RL 루프 (생성→채점→갱신, 느리고 불안정)</td><td class="py-2"><b>지도학습 스타일</b> (데이터셋 순회, 안정)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3 font-medium">배우는 재료</td><td class="py-2 pr-3">자기가 방금 생성한 답 (온라인 — 탐색 가능)</td><td class="py-2">데이터셋에 있는 답만 (오프라인)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3 font-medium">심판 재사용</td><td class="py-2 pr-3">가능 (새 답변 채점·데이터 필터링 등)</td><td class="py-2">심판이 없음</td></tr>
          <tr><td class="py-2 pr-3 font-medium">비용·난이도</td><td class="py-2 pr-3">높음</td><td class="py-2"><b>낮음</b> — 오픈소스 모델 다수가 채택</td></tr>
        </tbody>
      </table>
    </div>
    <p class="leading-relaxed text-slate-700">
      요약하면 — DPO 는 <b>싸고 안정적인 지름길</b>, RLHF 는 <b>비싸지만 유연한 정공법</b>입니다.
      오픈소스 진영은 DPO 계열을 널리 쓰고, 대형 연구소들은 두 계열을 섞어 씁니다.
      "심판이 있으면 새로 생성한 답도 채점할 수 있다"는 RLHF 의 장점은,
      모델이 스스로 탐색하며 배워야 하는 상황(예: 추론 능력 훈련)에서 특히 빛나요.
    </p>

    <DetailsCard title="➕ 더 깊이: 수식이 접히는 마법의 한 줄">
      6장 목적함수(r − β·KL)를 최대로 만드는 정책을 종이에서 풀면
      <b>π*(y) ∝ π<sub>ref</sub>(y) · e^{r(y)/β}</b> 가 나옵니다 —
      "원본 분포에 점수의 지수를 곱한 것"이 최적. 이 식을 r 에 대해 거꾸로 풀면
      r = β·log(π*/π<sub>ref</sub>) (+ 상수) — 즉 <b>최적 정책을 알면 보상을 역산할 수
      있다</b>는 뜻이죠. DPO 는 이 관계를 Bradley-Terry 에 대입해 보상을 소거한 것입니다
      (상수는 두 답변의 차이에서 사라짐). 유도 자체는 부록 수준이지만, "보상과 정책은
      동전의 양면"이라는 감각만 가져가면 충분해요.
    </DetailsCard>

    <ReviewFlag id="ch7-ai" chapter="ch7" label="🤖 AI 연결 — 회수하는 수학: 5부 5장 · 2부 7장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 5부 5장 · 2부 7장">
      <b><PartLink :part="5" ch="ch5">5부 5장</PartLink></b>: KL 목줄 — 사라진 게 아니라 숨은 점수의 β·log(π/π<sub>ref</sub>) 안으로 접혀 들어감.
      <b><PartLink :part="2" ch="ch7">2부 7장</PartLink></b>: 시그모이드 — 4장 Bradley-Terry 그대로 재사용.
      그리고 <b>−log(정답 확률)</b> 이 사전학습·SFT·보상 모델에 이어 <b>네 번째로 등장</b>했습니다.
      이 시리즈의 결론이 미리 보이죠 — 조련의 수학은 결국 몇 개의 부품이 계속 재조립되는 것.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="DPO — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="DPO가 RLHF에서 없앤 두 가지는?"
        :choices="['보상 모델과 RL 루프(생성→채점)', '선호 데이터와 참조 모델', '경사하강과 손실함수', 'SFT와 사전학습']"
        :answer="0"
        explanation="중간 정거장 두 개(심판 훈련 + RL 루프)를 건너뛰고 선호 쌍에서 바로 배웁니다. 참조 모델과 선호 데이터는 그대로 필요해요."
      />
      <Quiz
        difficulty="easy"
        question="DPO 훈련장에 서 있는 모델은 몇 개일까요?"
        type="numeric"
        :answer="2"
        explanation="정책 π + 얼려둔 참조 모델 π_ref, 2개. RLHF의 3개(+심판)보다 가볍습니다."
      />
      <Quiz
        difficulty="easy"
        question="DPO가 먹는 데이터는?"
        :choices="['4장에서 모은 선호 쌍(질문, 답변 A/B, 사람의 선택) 그대로', '보상 모델의 점수 목록', '라벨 없는 인터넷 텍스트', '모범답안만']"
        :answer="0"
        explanation="데이터는 RLHF와 동일합니다 — 다리(보상 모델)를 건너뛸 뿐, 출발점은 같은 선호 쌍이에요."
      />
      <Quiz
        difficulty="easy"
        question="DPO 훈련 중에도 참조 모델(π_ref)은 고정(얼림) 상태다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 숨은 점수의 분모(기준점)가 움직이면 점수의 의미가 무너져요 — 6장 목줄의 기둥과 같은 이유."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="DPO 손실 −log σ(r̂_선택 − r̂_탈락) 은 어떤 두 부품의 조립인가요?"
        :choices="['4장 Bradley-Terry 손실 + 숨은 점수(β·log π/π_ref)', '엔트로피 + 퍼플렉시티', '경사하강 + 학습률', '토큰화 + 임베딩']"
        :answer="0"
        explanation="BT 손실의 보상 자리에 숨은 점수를 꽂은 것 — 새 부품 없이 아는 것 둘을 접어 만든 지름길입니다."
      />
      <Quiz
        difficulty="medium"
        question="DPO 훈련이 시작될 때(정책 = 참조 모델) 마진과 P(사람 취향 적중)는?"
        :choices="['마진 0, P = 50% — 아직 아무 선호도 안 새겨진 상태', '마진 ∞, P = 100%', '마진 −1, P = 0%', '정의되지 않는다']"
        :answer="0"
        :hints="['π = π_ref 면 log(π/π_ref) 는 얼마일까요?']"
        explanation="숨은 점수가 둘 다 0이니 마진 0, σ(0) = 50%. 실험의 시작점이 정확히 이 상태였죠."
      />
      <Quiz
        difficulty="medium"
        question="DPO가 '지도학습 스타일'이라 불리는 이유는?"
        :choices="['RL 루프(생성→채점) 없이 SFT처럼 데이터셋을 순회하며 손실만 내리면 되어서', '모범답안을 그대로 베끼기 때문에', '사람이 실시간으로 감독해서', '경사하강을 쓰지 않아서']"
        :answer="0"
        explanation="답변을 생성하지도, 채점하지도 않습니다. 선호 쌍마다 손실을 재고 내리는 반복 — 훈련 파이프라인이 SFT만큼 단순해져요."
      />
      <Quiz
        difficulty="medium"
        question="실험에서 '기타 답변들'의 확률이 거의 변하지 않은 것의 의미는?"
        :choices="['선호 쌍과 무관한 원본의 행동은 보존된다 — 목줄 효과', 'DPO가 작동하지 않았다는 증거', '기타 답변이 가장 좋다는 뜻', '버그']"
        :answer="0"
        explanation="DPO는 비교된 두 답의 격차만 벌립니다. 나머지 분포(원본다움)는 π_ref 기준점 덕에 크게 훼손되지 않아요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="이렇게 좋은 DPO를 두고 대형 연구소들이 여전히 RLHF(RL 계열)도 쓰는 이유는?"
        :choices="['온라인 학습(자기 생성 답에서 배움·탐색)과 심판 재사용이 필요한 상황이 있어서', 'DPO는 특허가 있어서', 'DPO는 GPU에서 안 돌아가서', '전통을 지키려고']"
        :answer="0"
        :hints="['DPO는 데이터셋에 있는 답변만 배울 수 있었죠.']"
        explanation="DPO는 오프라인(데이터셋 안의 답만)입니다. 모델이 스스로 답을 만들어 보며 배워야 하는 훈련(탐색·추론 능력)에는 생성→채점 루프와 심판이 필요해요."
      />
      <Quiz
        difficulty="hard"
        question="DPO에서 β를 아주 작게 하면 어떤 위험이 생길까요? (6장의 직관 재사용)"
        :choices="['목줄이 느슨해져 선호 쌍의 격차만 좇다 원본 분포에서 과하게 이탈할 수 있다', '학습이 아예 일어나지 않는다', '참조 모델이 함께 훈련된다', '손실이 음수가 된다']"
        :answer="0"
        :hints="['β는 RLHF에서도 DPO에서도 같은 다이얼입니다.']"
        explanation="β는 DPO 수식 안에서도 목줄 세기입니다. 너무 느슨하면 격차 벌리기에만 몰두해 원본다움(말솜씨·다른 행동)이 훼손될 수 있어요 — 6장 β=0의 교훈 그대로."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch7')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">7장 완료 — 지름길까지 손에 넣었어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 8장 — 거대 모델을 통째로 훈련하지 않고 "살짝만" 조련하는 LoRA.
        1부의 저차원 행렬(rank) 감각이 돌아옵니다.
      </p>
      <RouterLink
        to="/ch/ch8"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        8장 — LoRA, 살짝만 조련하기 →
      </RouterLink>
    </div>
  </article>
</template>
