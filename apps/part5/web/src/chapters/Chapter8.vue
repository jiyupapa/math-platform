<script setup lang="ts">
// Phase 8 · temperature — 창의성 다이얼의 정체 (소프트맥스 온도 = 엔트로피 조절기)
// 표준 구성: 개념 설명 + 인터랙티브 시각화 + 미니체크 + 10문제 세트 + 노트북 안내
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import TemperatureDial from '@/components/TemperatureDial.vue'
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
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 8 · LLM 트랙</p>
    <h1 class="mb-4 text-3xl font-bold">temperature — 창의성 다이얼의 정체</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      LLM API 를 써 봤다면 <code class="rounded bg-slate-100 px-1 text-[14px]">temperature</code>
      파라미터를 만났을 거예요 — 0이면 뻔한 답, 2면 헛소리. "창의성 조절"이라고들 하는데,
      정체가 뭘까요? 답은 3장에 있었습니다: <b>temperature 는 출력 분포의 엔트로피를
      돌리는 다이얼</b>입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>소프트맥스에 T 가 끼어드는 자리 — <MathBlock inline expr="q = \text{softmax}(z / T)" /> — 를 안다</li>
        <li>T 를 돌리면 <b>분포와 엔트로피가 함께 변하는</b> 것을 직접 확인한다</li>
        <li>"창의성"의 실체 = <b>꼬리 토큰에게 기회 주기</b>임을 안다</li>
        <li>4부 12장의 <b>top-k · top-p</b> 를 정보이론 언어로 다시 읽는다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 소프트맥스 복습 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 복습 — 점수를 확률로 바꾸는 소프트맥스</h2>
    <ReviewFlag id="ch8-s1" chapter="ch8" label="1. 소프트맥스 복습 (4부)" />
    <p class="leading-relaxed text-slate-700">
      4부 0장에서 배운 대로, 모델의 마지막 출력은 토큰마다의 <b>점수(로짓 z)</b>입니다.
      이 점수를 확률로 바꾸는 것이 <b>소프트맥스</b>였죠:
    </p>
    <MathBlock expr="q_i = \frac{e^{z_i}}{\sum_j e^{z_j}}" />
    <p class="mt-1 text-sm text-slate-500">
      각 점수에 e^ 를 씌워(전부 양수로) 합이 1이 되게 나눔 — 점수가 높을수록 확률이 크고,
      <b>어떤 토큰도 확률이 정확히 0이 되지는 않는</b> 변환(4장에서 예고한 그 성질!).
      여기서 e ≈ 2.718 은 2부 7장의 <b>자연상수</b> — "2 대신 e 를 거듭제곱의 밑으로 쓴 것"
      정도로만 읽어도 이 챕터를 따라오는 데 충분합니다.
    </p>

    <!-- 2. T 끼우기 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. T 가 끼어드는 자리 — 점수 차이를 나누다</h2>
    <ReviewFlag id="ch8-s2" chapter="ch8" label="2. softmax(z/T) 정의와 양 극단" />
    <p class="leading-relaxed text-slate-700">
      temperature 는 소프트맥스에 들어가기 <b>직전의 로짓을 T 로 나누는</b> 한 줄짜리 수술입니다:
    </p>
    <MathBlock expr="q_i = \frac{e^{z_i / T}}{\sum_j e^{z_j / T}}" />
    <p class="mt-1 leading-relaxed text-slate-700">
      나눗셈의 효과는 <b>점수 차이의 확대/축소</b>예요. 두 토큰의 점수 차가 (z₁−z₂) 라면
      T 로 나눈 뒤의 차는 (z₁−z₂)/T:
    </p>
    <div class="my-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded-xl border border-sky-200 bg-sky-50 p-4">
        <p class="text-sm font-bold text-sky-900">🧊 T → 0 (차이 폭발)</p>
        <p class="mt-1 text-sm leading-relaxed text-sky-800">
          작은 점수 차도 나누면 거대해져 → 1등 토큰에 확률 <b>몰빵</b> →
          <b>H → 0</b>. 매번 같은 답(그리디와 같아짐).
        </p>
      </div>
      <div class="rounded-xl border border-rose-200 bg-rose-50 p-4">
        <p class="text-sm font-bold text-rose-900">🔥 T → ∞ (차이 소멸)</p>
        <p class="mt-1 text-sm leading-relaxed text-rose-800">
          어떤 점수 차든 나누면 0에 가까워져 → 모든 토큰이 비슷한 확률(<b>균등</b>) →
          <b>H → log₂n 최대</b>. 아무 말 대잔치.
        </p>
      </div>
    </div>
    <p class="leading-relaxed text-slate-700">
      3장에서 "몰빵 = H 0, 균등 = H 최대"를 배웠죠. T 는 그 사이를 미끄러지듯 오가는 —
      <b>분포의 엔트로피 조절기</b>입니다. 3장 AI 카드의 예고를 지금 회수한 거예요.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="T 를 0에 가깝게 내리면 출력 분포는 어떻게 될까요?"
      :choices="['1등 토큰에 몰빵되어 엔트로피가 0에 가까워진다', '균등해져 엔트로피가 최대가 된다', '모든 확률이 0이 된다', '로짓 자체가 커진다']"
      :answer="0"
      explanation="점수 차이가 T 로 나뉘며 폭발 → 1등이 전부 가져갑니다. 매번 같은 답이 나오는 이유죠."
    />

    <!-- 3. Dial -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 다이얼을 직접 돌려 보기</h2>
    <ReviewFlag id="ch8-s3" chapter="ch8" label="3. 온도 다이얼 (인터랙티브)" />
    <p class="leading-relaxed text-slate-700">
      로짓은 고정해 두고 T 만 돌려 보세요. 분포 막대와 엔트로피 게이지가 함께 움직입니다.
      그리고 🎲 버튼으로 <b>같은 모델, 같은 문맥에서 T 만 달리해 생성</b>해 보세요 —
      다양성의 차이가 확 느껴질 거예요.
    </p>

    <TemperatureDial />

    <ConceptCard tone="tip" title="관찰 포인트 3가지">
      <ul class="list-disc space-y-1 pl-5">
        <li>T = 1 이 <b>모델이 배운 원본 분포</b> — 다이얼의 기본 위치</li>
        <li>T 를 올려도 <b>순위는 안 바뀐다</b> — 1등은 여전히 1등, 격차만 좁아짐</li>
        <li>🎲 낮은 T = "좋다"만 반복, 높은 T = "감자같다"까지 등장 — 창의성의 실체</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="모든 토큰의 로짓이 똑같은 값이라면, T 를 어떻게 돌려도 분포는 변하지 않는다."
      type="truefalse"
      :answer="0"
      :hints="['T 가 조절하는 건 점수의 차이 — 차이가 없으면?']"
      explanation="참. 차이 0을 무엇으로 나눠도 0 — 이미 균등이고 계속 균등입니다. T 는 차이를 조절할 뿐이에요."
    />

    <!-- 4. 창의성의 실체 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. "창의성"의 실체 — 꼬리에게 기회를</h2>
    <ReviewFlag id="ch8-s4" chapter="ch8" label="4. 창의성 = 꼬리 토큰의 기회" />
    <p class="leading-relaxed text-slate-700">
      T 를 올린다고 모델이 더 똑똑해지거나 새 지식이 생기지 않습니다 — <b>로짓(모델의 판단)은
      그대로</b>니까요. 바뀌는 건 딱 하나: 확률이 낮던 <b>꼬리 토큰들이 뽑힐 기회</b>가
      커지는 것. 뻔하지 않은 단어가 나오니 신선하게 느껴지고(창의성), 동시에 말이 안 되는
      단어가 나올 위험도 커집니다(헛소리·환각).
    </p>

    <ConceptCard tone="warn" title="다이얼의 공짜 없음 법칙">
      <b>다양성과 정확성은 같은 다이얼의 양 끝</b>입니다. T↑ = 엔트로피↑ = 신선함↑ + 오답 위험↑.
      T↓ = 엔트로피↓ = 안정↑ + 반복·뻔함↑. 어느 쪽이 "좋은" 설정인지는 문제가 정합니다 —
      코딩·사실 질문은 낮게, 브레인스토밍·작문은 높게 쓰는 관행이 여기서 나와요.
    </ConceptCard>

    <!-- 5. top-k / top-p -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. top-k · top-p 다시 읽기 — 4부 12장 재해석</h2>
    <ReviewFlag id="ch8-s5" chapter="ch8" label="5. top-k·top-p 재해석" />
    <p class="leading-relaxed text-slate-700">
      4부 12장에서 "그렇다더라"로 배운 샘플링 기법들, 이제 정보이론 언어로 읽힙니다.
      temperature 가 분포의 <b>모양</b>을 바꾸는 다이얼이라면, 이 둘은 <b>꼬리를 자르는 가위</b>예요:
    </p>
    <div class="my-4 space-y-3">
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm font-bold text-slate-800">✂️ top-k — 갈래 수를 직접 제한</p>
        <p class="mt-1 text-sm text-slate-700">
          확률 상위 k개 토큰만 남기고 재정규화. "아무리 헷갈려도 <b>최대 k갈래</b>까지만
          고민해라" — 7장의 갈래 수에 상한을 거는 것.
        </p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm font-bold text-slate-800">✂️ top-p (nucleus) — 확률 질량으로 동적 제한</p>
        <p class="mt-1 text-sm text-slate-700">
          누적 확률이 p(예: 0.9)가 될 때까지의 상위 토큰만 남김. 모델이 확신할 때는 후보
          1~2개, 헷갈릴 때는 수십 개 — <b>상황에 따라 갈래 수가 늘고 주는 똑똑한 가위</b>.
          엔트로피가 높은 순간에만 넓게 여는 셈이죠.
        </p>
      </div>
    </div>
    <p class="leading-relaxed text-slate-700">
      실전에서는 보통 <b>temperature 로 모양을 잡고 top-p 로 위험한 꼬리를 자르는</b>
      조합을 씁니다 — 창의성은 살리고 극단적 헛소리만 막는 이중 장치.
    </p>

    <DetailsCard title="➕ 더 깊이: 왜 하필 이름이 '온도'인가요?">
      물리학의 <b>볼츠만 분포</b>에서 빌려온 이름입니다 — 기체 분자가 에너지 상태에 퍼지는
      정도가 온도에 비례하는 식이 정확히 softmax(−E/T) 꼴이거든요. 온도가 높으면 분자가
      높은 에너지 상태까지 넓게 퍼지듯(엔트로피 증가!), LLM 도 T 가 높으면 낮은 점수
      토큰까지 넓게 퍼집니다. T = 0 표기는 관례상 "argmax(그리디)"를 뜻해요 —
      0으로 나눌 수는 없으니 극한의 이름표입니다.
    </DetailsCard>

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 다이얼을 실전에서 돌리는 법</h2>
    <ReviewFlag id="ch8-ai" chapter="ch8" label="🤖 실전 temperature 세팅" />
    <p class="leading-relaxed text-slate-700">
      이 챕터로 4부의 생성 파이프라인(로짓 → 소프트맥스 → 샘플링)이 정보이론 위에서
      완전히 다시 읽혔습니다. 실전 감각으로 마무리하죠.
    </p>

    <ConceptCard tone="ai" title="🤖 AI 연결 — temperature 실전 가이드">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>낮은 T (0 ~ 0.3)</b>: 코드 생성, 사실 질문, 형식 변환 — 정답이 정해진 일.
          엔트로피를 죽여 재현성과 정확성을 얻습니다.
        </li>
        <li>
          <b>중간 T (0.7 ~ 1)</b>: 일반 대화·글쓰기 — 모델이 배운 분포(T=1) 근처가
          가장 "자연스러운" 문장을 냅니다. 너무 낮으면 같은 표현만 반복(루프)하는 부작용도.
        </li>
        <li>
          <b>높은 T (1.2 ~ 2)</b>: 브레인스토밍, 이름 짓기, 시 — 꼬리의 신선함이 필요할 때.
          top-p 와 함께 써서 극단만 잘라내는 게 요령.
        </li>
        <li>
          <b>큰 그림</b>: 학습(6장)은 분포를 <b>만들고</b>, 퍼플렉시티(7장)는 그 분포를
          <b>채점하고</b>, temperature(8장)는 그 분포에서 <b>어떻게 뽑을지</b>를 정합니다 —
          전부 같은 분포 하나를 둘러싼 이야기예요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="정확한 SQL 쿼리를 생성해야 하는 작업에 적절한 temperature 설정은?"
      :choices="['낮게 (0 ~ 0.3) — 엔트로피를 죽여 일관된 정답을', '높게 (1.5 이상) — 창의적인 쿼리를', 'temperature 는 결과와 무관', '항상 정확히 1']"
      :answer="0"
      explanation="정답이 정해진 작업은 낮은 T — 1등 토큰만 따라가는 안정 모드가 맞습니다."
    />

    <!-- 연습 문제 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">6. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="temperature — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="temperature 는 로짓을 T 로 나눈 뒤 소프트맥스에 넣는 것으로, 출력 분포의 엔트로피를 조절한다."
        type="truefalse"
        :answer="0"
        explanation="참. q = softmax(z/T) — 점수 차이를 키우거나 줄여 몰빵↔균등 사이를 오갑니다."
      />
      <Quiz
        difficulty="easy"
        question="T 를 아주 크게 올리면 출력 분포는?"
        :choices="['균등에 가까워져 엔트로피가 최대가 된다', '1등에 몰빵된다', '모든 확률이 0이 된다', '로짓이 사라진다']"
        :answer="0"
        explanation="점수 차이가 소멸해 모든 토큰이 비슷한 확률 — H 가 log₂n 을 향해 올라갑니다."
      />
      <Quiz
        difficulty="easy"
        question="T 를 올리면 모델의 지식(로짓)이 더 풍부해진다."
        type="truefalse"
        :answer="1"
        explanation="거짓. 로짓은 그대로 — T 는 이미 계산된 점수의 확률 배분만 바꾸는 후처리입니다."
      />
      <Quiz
        difficulty="easy"
        question="temperature 를 바꿔도 변하지 않는 것은?"
        :choices="['토큰들의 확률 순위 (1등은 여전히 1등)', '각 토큰의 확률 값', '분포의 엔트로피', '샘플링의 다양성']"
        :answer="0"
        explanation="z/T 는 순서를 보존하는 변환 — 격차만 커지거나 줄어들 뿐 순위는 그대로입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="두 토큰의 로짓 차이가 z₁ − z₂ = 4 입니다. T 로 나눈 뒤의 차이를 구하세요."
        :steps="[
          { lhs: 'T = 2: \\; 4 \\div 2', answer: 2 },
          { lhs: 'T = 4: \\; 4 \\div 4', answer: 1 },
        ]"
        :hints="['T 가 클수록 차이가 줄어듭니다.', '차이가 줄면 분포는 균등 쪽으로.']"
        explanation="4 → 2 → 1: T 를 올릴수록 점수 격차가 좁아져 분포가 균등(높은 H) 쪽으로 이동합니다."
      />
      <Quiz
        difficulty="medium"
        question="토큰이 5개일 때, T 를 무한히 올리면 엔트로피는 어디로 갈까요? (비트, 소수 둘째 자리까지)"
        type="numeric"
        :answer="2.32"
        :tolerance="0.01"
        :hints="['균등 분포의 H = log₂n.', 'log₂5 ≈ ?']"
        explanation="log₂5 ≈ 2.32비트 — 다이얼 게이지의 오른쪽 끝이 바로 이 값이었죠."
      />
      <Quiz
        difficulty="medium"
        question="높은 T 에서 헛소리(환각) 위험이 커지는 이유는?"
        :choices="['확률이 낮던 꼬리 토큰이 뽑힐 기회가 커져서', '모델이 지식을 잊어버려서', '로짓이 무작위로 바뀌어서', '토큰 수가 줄어들어서']"
        :answer="0"
        explanation="창의성과 헛소리는 같은 현상의 양면 — 꼬리에게 기회를 주는 것입니다."
      />
      <Quiz
        difficulty="medium"
        question="T = 1 로 설정하면 모델이 학습에서 배운 원본 분포 그대로 샘플링한다."
        type="truefalse"
        :answer="0"
        explanation="참. z/1 = z — T=1 이 다이얼의 기본 위치이자 모델이 배운 그 분포입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="top-p = 0.9 (nucleus 샘플링)에 대한 옳은 설명은?"
        :choices="['누적 확률 90%까지의 상위 토큰만 남기는 동적 후보 제한 — 확신하면 좁게, 헷갈리면 넓게', '로짓에 0.9를 곱하는 것', 'temperature 를 0.9로 두는 것', '상위 90개 토큰을 항상 고정으로 남기는 것']"
        :answer="0"
        :hints="['top-k 와 달리 후보 수가 상황마다 변해요.']"
        explanation="확률 질량 기준의 가위 — 모델의 엔트로피가 높은 순간에만 후보를 넓게 여는 똑똑한 꼬리 자르기입니다."
      />
      <Quiz
        difficulty="hard"
        question="브레인스토밍용 세팅으로 「T = 1.5 + top-p 0.9」 조합을 쓰는 이유로 가장 적절한 것은?"
        :choices="['T 로 엔트로피를 올려 신선함을 얻고, top-p 로 극단적 꼬리만 잘라 헛소리를 막으려고', '둘 다 확률을 0으로 만들려고', 'T 와 top-p 는 같은 기능이라 아무거나 두 개 쓴 것', '계산 속도를 높이려고']"
        :answer="0"
        :hints="['다이얼(모양)과 가위(꼬리)의 분업.']"
        explanation="temperature 는 분포 모양(엔트로피)을 조절하고 top-p 는 위험한 꼬리를 자릅니다 — 창의성은 살리고 극단만 막는 이중 장치."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch8')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 8 완료. LLM 트랙 완주 — 다이얼의 정체를 알았습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 심화 트랙 — 문맥이 불확실성을 줄이는 원리, <b>조건부 엔트로피와 상호정보량</b>입니다.
      </p>
      <RouterLink
        to="/ch/ch9"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 문맥의 가치 →
      </RouterLink>
    </div>
  </article>
</template>
