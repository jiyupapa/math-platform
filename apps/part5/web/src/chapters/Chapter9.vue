<script setup lang="ts">
// Phase 9 · 문맥의 가치 — 조건부 엔트로피 H(X|Y) 와 상호정보량 I(X;Y)
// 표준 구성: 개념 설명 + 인터랙티브 시각화 + 미니체크 + 10문제 세트 + 노트북 안내
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import InfoVenn from '@/components/InfoVenn.vue'
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
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 9 · 심화 트랙</p>
    <h1 class="mb-4 text-3xl font-bold">문맥의 가치 — 알면 줄어드는 불확실성</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      스무고개에서 "동물이에요"라는 힌트 하나가 후보를 확 줄였죠. LLM 에게는 <b>앞 문맥</b>이
      바로 그 힌트입니다. 이번 챕터는 "힌트 하나의 가치"를 정확히 재는 두 개의 자 —
      <b>조건부 엔트로피</b>와 <b>상호정보량</b> — 를 만들고, 어텐션의 직관까지 연결합니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><MathBlock inline expr="H(X|Y)" /> = <b>Y 를 알고 난 뒤 남은</b> X 의 불확실성을 계산한다</li>
        <li><MathBlock inline expr="I(X;Y) = H(X) - H(X|Y)" /> = <b>줄어든 만큼</b> = 힌트의 가치를 안다</li>
        <li>벤다이어그램으로 두 변수의 정보가 <b>겹치는 그림</b>을 갖는다</li>
        <li>문맥이 다음 단어 예측을 쉽게 만드는 이유 — <b>어텐션의 직관</b>을 보강한다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 힌트의 힘 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 두 변수의 세계 — 힌트가 등장한다</h2>
    <ReviewFlag id="ch9-s1" chapter="ch9" label="1. 두 변수와 결합분포" />
    <p class="leading-relaxed text-slate-700">
      지금까지는 변수 하나(내일 날씨)의 불확실성만 쟀어요. 이제 둘째 변수가 등장합니다 —
      <b>일기예보</b>. 실제 날씨를 X, 예보를 Y 라고 하면, 둘이 함께 움직이는 확률은
      3부에서 배운 <b>결합분포</b> p(X, Y) 표 하나에 담깁니다.
      핵심 질문은 이것: <b>"예보(Y)를 본 것이 날씨(X) 맞히기에 얼마나 도움이 되나?"</b>
    </p>

    <ConceptCard tone="note" title="복습 — 결합분포와 조건부 확률 (3부)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>결합분포 p(x, y)</b>: 두 사건이 동시에 일어날 확률의 표 (예: 실제 비 & 예보 비 = 0.45)</li>
        <li><b>조건부 확률 p(x|y)</b>: y 를 이미 안다는 조건에서 x 의 확률 — "예보가 비였을 때 실제로 비일 확률"</li>
        <li><b>독립</b>: p(x, y) = p(x)·p(y) — 하나를 알아도 다른 쪽에 아무 정보가 없는 관계</li>
      </ul>
    </ConceptCard>

    <!-- 2. 조건부 엔트로피 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 조건부 엔트로피 — 알고 난 뒤 남는 것</h2>
    <ReviewFlag id="ch9-s2" chapter="ch9" label="2. 조건부 엔트로피 H(X|Y)" />
    <p class="leading-relaxed text-slate-700">
      구체적인 숫자로 갑시다. 날씨는 비/맑음 반반(H(X) = 1비트)이고,
      예보는 <b>90% 확률로 적중</b>한다고 해요. 예보가 "비"라고 했다면 —
      실제 비일 확률 90%, 맑을 확률 10%. 이 상황의 남은 불확실성은?
      3장에서 계산했던 <b>90:10 치우친 동전의 H = 0.469비트</b>, 바로 그 값입니다!
      예보가 "맑음"일 때도 마찬가지 0.469비트. 이걸 예보의 확률로 가중 평균한 것이
      조건부 엔트로피예요:
    </p>
    <MathBlock expr="H(X|Y) = \sum_{y} p(y) \cdot H(X \,|\, Y{=}y) \;=\; \text{힌트를 듣고 난 뒤, 평균적으로 남는 불확실성}" />

    <ConceptCard tone="note" title="새 기호 — H(X|Y) 조건부 엔트로피">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>이름</b>: 조건부 엔트로피 · <b>읽는 법</b>: "에이치 엑스 기븐 와이" (| = ~를 안다는 조건에서)</li>
        <li><b>뜻</b>: Y 의 값을 알려준 <b>뒤에도 남아 있는</b> X 의 평균 불확실성 (비트)</li>
        <li>예보 예제: H(X) = 1비트 → 예보를 본 뒤 H(X|Y) = 0.469비트</li>
        <li>
          <b>핵심 부등식</b>: <MathBlock inline expr="H(X|Y) \le H(X)" /> —
          힌트가 (평균적으로) 불확실성을 <b>늘릴 수는 없다</b>. 쓸모없는 최악의 힌트라도 본전(=)
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="예보(Y)가 날씨(X)와 완전히 독립(동전 던지기 예보)이라면, H(X|Y) 는 어떻게 될까요?"
      :choices="['H(X) 그대로 — 봐도 아무것도 안 줄어든다', '0이 된다', 'H(X) 보다 커진다', '음수가 된다']"
      :answer="0"
      explanation="독립이면 힌트가 헛힌트 — 남는 불확실성이 원래 그대로입니다. H(X|Y) = H(X)."
    />

    <!-- 3. 상호정보량 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 상호정보량 — 줄어든 만큼이 힌트의 가치</h2>
    <ReviewFlag id="ch9-s3" chapter="ch9" label="3. 상호정보량 I(X;Y)" />
    <p class="leading-relaxed text-slate-700">
      워밍업의 정의를 기억하나요 — <b>"정보 = 줄어드는 불확실성"</b>.
      드디어 그 문장을 공식 그대로 쓸 수 있습니다. 힌트를 듣기 전 H(X), 듣고 난 뒤 H(X|Y),
      <b>줄어든 만큼</b>이 힌트가 준 정보:
    </p>
    <MathBlock expr="I(X;Y) \;=\; H(X) - H(X|Y) \;=\; \text{Y 가 X 에 대해 알려주는 정보량}" />
    <p class="mt-1 leading-relaxed text-slate-700">
      예보 예제로: I = 1 − 0.469 = <b>0.531비트</b>. "90% 적중 예보 한 번의 가치는
      0.531비트"라고 정확히 말할 수 있게 된 거예요.
    </p>

    <ConceptCard tone="note" title="새 기호 — I(X;Y) 상호정보량">
      <ul class="list-disc space-y-2 pl-5 text-sm">
        <li><b>이름</b>: 상호정보량 (mutual information) · <b>읽는 법</b>: "아이 엑스 와이" (; 는 그냥 구분자)</li>
        <li>
          <b>주의</b>: 1장의 놀람도 기호가 I 였죠 — 같은 글자지만 <b>괄호에 변수 둘(X;Y)이
          들어가면 상호정보량</b>입니다. 관례라 어쩔 수 없어요; 문맥으로 구분!
        </li>
        <li><b>뜻</b>: 한쪽을 알 때 다른 쪽의 불확실성이 줄어드는 양 = 두 변수가 <b>공유하는 정보</b></li>
        <li>
          <b>놀라운 성질 — 대칭!</b> <MathBlock inline expr="I(X;Y) = I(Y;X)" /> —
          "예보가 날씨에 대해 주는 정보"와 "날씨가 예보에 대해 주는 정보"는 언제나 같습니다.
          (KL 은 비대칭이었는데(5장), 상호정보량은 대칭 — 그래서 이름이 '상호'!)
        </li>
        <li>독립이면 I = 0 (겹치는 정보 없음) · 한쪽이 다른 쪽을 완전히 결정하면 I = H(X) 만점</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="X 와 Y 가 완전히 독립이면 상호정보량 I(X;Y) 는 몇일까요?"
      type="numeric"
      :answer="0"
      explanation="독립 = 하나를 알아도 다른 쪽 불확실성이 그대로 = 공유하는 정보 0비트."
    />

    <!-- 4. InfoVenn -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 벤다이어그램 — 정보가 겹치는 그림</h2>
    <ReviewFlag id="ch9-s4" chapter="ch9" label="4. 정보 벤다이어그램 (인터랙티브)" />
    <p class="leading-relaxed text-slate-700">
      이 관계는 그림 하나로 정리됩니다 — 두 원의 <b>겹침이 상호정보량</b>.
      예보의 적중률 슬라이더를 움직이며 원이 붙었다 떨어지는 걸 보세요.
      특히 <b>적중률 0%(항상 반대)</b>로 내려 보세요 — 반전이 기다립니다.
    </p>

    <InfoVenn />

    <ConceptCard tone="tip" title="관찰 포인트 3가지">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>s = 50% 에서 원이 분리</b>(I = 0) — 동전 던지기 예보는 정보가 0</li>
        <li><b>s = 100% 에서 완전히 포개짐</b>(I = 1) — 예보만 보면 날씨 끝</li>
        <li>
          <b>s = 0%(항상 반대)도 I = 1 만점!</b> — 틀리는 걸 알면 뒤집으면 되니까.
          상호정보량은 "맞느냐"가 아니라 <b>"얽혀 있느냐"</b>를 잽니다
        </li>
      </ul>
    </ConceptCard>

    <DetailsCard title="➕ 더 깊이: 상호정보량은 사실 KL 발산입니다">
      <p>
        5장과의 숨은 연결 —
        <MathBlock inline expr="I(X;Y) = D\big(p(x,y) \,\|\, p(x)\,p(y)\big)" />.
        진짜 결합분포와 <b>"둘이 독립이라고 믿는 지도"</b>(주변분포의 곱) 사이의 KL 이
        정확히 상호정보량입니다. "얽힘의 크기 = 독립이라는 착각의 비용(초과 비트)" —
        같은 값을 두 언어로 말한 것뿐이에요. 이 정의로 보면 I ≥ 0 (KL 성질)과
        대칭성도 자연스럽게 따라옵니다.
      </p>
    </DetailsCard>

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 문맥은 왜 예측을 쉽게 만드는가 — 어텐션의 직관</h2>
    <ReviewFlag id="ch9-ai" chapter="ch9" label="🤖 문맥의 가치와 어텐션" />
    <p class="leading-relaxed text-slate-700">
      이제 LLM 으로 번역합시다. X = 다음 토큰, Y = 앞 문맥. 문맥 없이 다음 단어를 맞히는 건
      어휘 전체에서 찍기(H(X) 큼)지만, "나는 아침에 따뜻한 국밥을" 까지 읽었다면
      남은 불확실성 H(X|문맥)은 확 줄어듭니다. <b>그 차이 I(X;문맥)이 문맥의 가치</b> —
      LLM 이 커질수록 커지는 것이 바로 이 값을 뽑아내는 능력이에요.
    </p>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 어텐션은 상호정보량 사냥꾼">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>문맥의 가치를 수식으로</b>: 언어모델의 실력 = H(다음 토큰 | 문맥) 을 얼마나 줄이나.
          6장의 훈련 손실이 정확히 이 조건부 불확실성을 향해 내려갑니다 —
          문맥이 길수록 바닥이 낮아지는 이유(긴 문맥 경쟁의 정체).
        </li>
        <li>
          <b>어텐션의 직관 보강(4부)</b>: 문맥의 모든 단어가 똑같이 유용하진 않아요.
          "그녀는 의사다. 그녀의 직업은 ___" 에서 답과 강하게 얽힌 건 "의사" —
          어텐션은 <b>다음 토큰과 상호정보량이 큰 단어에 가중치를 몰아주도록 학습된 장치</b>라고
          읽을 수 있습니다. (수식이 I 를 직접 계산하는 건 아니지만, 훈련이 그 방향으로 밀어붙여요)
        </li>
        <li>
          <b>특징 선택(feature selection)</b>: "어떤 입력 변수가 정답과 I 가 큰가"는 고전 ML 의
          변수 고르기 기준이기도 — 상호정보량은 AI 전반의 만능 자입니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="문맥 없이 다음 토큰의 불확실성이 13비트, 문맥을 본 뒤 3비트라면 이 문맥의 가치(상호정보량)는 몇 비트일까요?"
      type="numeric"
      :answer="10"
      :hints="['I = 줄어든 만큼 = H(X) − H(X|문맥).']"
      explanation="13 − 3 = 10비트. 갈래로는 8192갈래 고민이 8갈래로 줄어든 것(7장)!"
    />

    <!-- 연습 문제 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="문맥의 가치 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="H(X|Y) 는 Y 를 알고 난 뒤에도 남아 있는 X 의 평균 불확실성이다."
        type="truefalse"
        :answer="0"
        explanation="참. 힌트를 듣고 난 뒤 남는 것 — 그래서 '조건부' 엔트로피입니다."
      />
      <Quiz
        difficulty="easy"
        question="상호정보량 I(X;Y) 를 옳게 나타낸 것은?"
        :choices="['H(X) − H(X|Y)', 'H(X) + H(Y)', 'H(X|Y) − H(X)', 'H(X) × H(Y)']"
        :answer="0"
        explanation="힌트 전 불확실성에서 힌트 후 남은 것을 뺀 — 줄어든 만큼이 정보입니다."
      />
      <Quiz
        difficulty="easy"
        question="힌트(Y)를 알면 X 의 평균 불확실성이 오히려 늘어날 수도 있다."
        type="truefalse"
        :answer="1"
        explanation="거짓. H(X|Y) ≤ H(X) — 최악의 헛힌트라도 본전(그대로)입니다."
      />
      <Quiz
        difficulty="easy"
        question="X 와 Y 가 독립일 때 I(X;Y) 는?"
        type="numeric"
        :answer="0"
        explanation="공유하는 정보가 없으니 0 — 벤다이어그램에서 두 원이 떨어진 상태."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="날씨는 반반(H(X) = 1비트), 예보는 90% 적중(치우친 동전의 H = 0.469비트)입니다. 예보의 가치를 단계별로 구하세요."
        :steps="[
          { lhs: 'H(X)', answer: 1 },
          { lhs: 'H(X|Y)', answer: 0.469, tolerance: 0.001 },
          { lhs: 'I = 1 - 0.469', answer: 0.531, tolerance: 0.001 },
        ]"
        :hints="['예보를 본 뒤 남는 것 = 90:10 동전의 엔트로피 (3장).', 'I = 전 − 후.']"
        explanation="I = 0.531비트 — 90% 적중 예보 한 번의 정확한 가치입니다."
      />
      <Quiz
        difficulty="medium"
        question="Y 가 X 를 완전히 결정한다면(예보 100% 적중) H(X|Y) 는?"
        type="numeric"
        :answer="0"
        :hints="['예보만 보면 날씨를 다 아는 상황.']"
        explanation="남는 불확실성이 없으니 0 — 이때 I(X;Y) = H(X) 만점입니다."
      />
      <Quiz
        difficulty="medium"
        question="항상 반대로 말하는 예보(적중률 0%)의 상호정보량은?"
        :choices="['1비트 만점 — 뒤집어 들으면 완벽하니까', '0 — 틀리니까 쓸모없다', '음수', '0.5비트']"
        :answer="0"
        :hints="['상호정보량은 맞느냐가 아니라 얽혀 있느냐를 잽니다.']"
        explanation="항상 틀리는 것도 완벽한 규칙 — 뒤집으면 100% 적중. I 는 얽힘의 크기라 1비트 만점입니다."
      />
      <Quiz
        difficulty="medium"
        question="I(X;Y) 와 I(Y;X) 는 항상 같다 (상호정보량은 대칭이다)."
        type="truefalse"
        :answer="0"
        explanation="참. KL(5장)은 비대칭이지만 상호정보량은 대칭 — 그래서 이름이 '상호'정보량입니다."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="문맥 없는 다음 토큰의 불확실성이 13비트, 문맥을 본 뒤 3비트입니다. 문맥의 가치와 갈래 수 변화를 구하세요."
        :steps="[
          { lhs: 'I = 13 - 3', answer: 10 },
          { lhs: '\\text{문맥 전 갈래 } 2^{13}', answer: 8192 },
          { lhs: '\\text{문맥 후 갈래 } 2^3', answer: 8 },
        ]"
        :hints="['I = 줄어든 비트.', '갈래 수는 7장의 2^H.']"
        explanation="문맥 하나가 8192갈래 고민을 8갈래로 — 10비트짜리 힌트입니다. LLM 이 문맥을 읽는 이유."
      />
      <Quiz
        difficulty="hard"
        question="어텐션(4부)의 정보이론적 직관으로 가장 적절한 것은?"
        :choices="['다음 토큰과 상호정보량이 큰 문맥 단어에 가중치를 몰아주도록 학습된 장치', '모든 단어에 항상 균등한 가중치를 주는 장치', '문맥의 엔트로피를 최대로 만드는 장치', '토큰 수를 줄이는 압축 장치']"
        :answer="0"
        :hints="['문맥의 모든 단어가 똑같이 유용하지는 않죠.']"
        explanation="답과 강하게 얽힌(I 가 큰) 단어를 골라 집중하는 것 — 어텐션 가중치의 정보이론적 독해입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch9')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 9 완료. 힌트의 가치를 재는 자까지 얻었습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        이제 마지막 — 🎓 캡스톤에서 1부의 신경망과 미니 언어모델로 시리즈 전체를 완성합니다.
      </p>
      <RouterLink
        to="/ch/ch10"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        마지막 챕터 — 🎓 캡스톤 →
      </RouterLink>
    </div>
  </article>
</template>
