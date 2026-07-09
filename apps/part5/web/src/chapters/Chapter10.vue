<script setup lang="ts">
// Phase 10 · 🎓 캡스톤 — 손실함수를 갈아 끼우다 (시리즈 대단원)
// 캡스톤 본편은 노트북(ch10_capstone.ipynb) — 웹은 여정 정리 + 실험 안내 + 종합 문제.
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 여정 지도 — 챕터 0~9 한 줄 요약
const journey = [
  { n: '0', title: '스무고개', line: '정보 = 줄어드는 불확실성' },
  { n: '1', title: '놀람', line: 'I = log₂(1/p) — 확률에 눈금 붙이기' },
  { n: '2', title: '압축', line: '자주 나오면 짧게, 바닥은 평균 놀람' },
  { n: '3', title: '엔트로피', line: 'H = 평균 놀람, 균등이 최대' },
  { n: '4', title: '크로스 엔트로피', line: '틀린 지도 요금 — LLM 손실의 정체' },
  { n: '5', title: 'KL 발산', line: '바가지 초과분, 비대칭' },
  { n: '6', title: '학습의 정체', line: '훈련 = KL 최소화 = 흉내내기' },
  { n: '7', title: '퍼플렉시티', line: '2^손실 = 몇 갈래 고민' },
  { n: '8', title: 'temperature', line: 'softmax(z/T) = 엔트로피 다이얼' },
  { n: '9', title: '문맥의 가치', line: 'I(X;Y) = 힌트가 줄인 불확실성' },
]

function onSetComplete() {
  progress.markDone('ch10')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 10 · 시리즈 대단원</p>
    <h1 class="mb-4 text-3xl font-bold">🎓 캡스톤 — 손실함수를 갈아 끼우다</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      마지막 챕터입니다. 새 개념은 없어요 — 지금까지 만든 도구 전부를 들고
      <b>두 개의 실험</b>을 완수합니다. 1부에서 시작된 5부작 시리즈의 복선이
      여기서 전부 회수됩니다.
    </p>

    <ConceptCard tone="goal" title="캡스톤의 두 실험 (본편은 노트북!)">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>실험 A — 손실 교체</b>: 1부 캡스톤의 동심원 분류 신경망을 가져와
          MSE → 크로스 엔트로피로 교체. σ′ 소거를 <b>수치미분으로 검산</b>하고
          두 손실의 학습 곡선을 대결시킵니다.
        </li>
        <li>
          <b>실험 B — 미니 언어모델</b>: 문자 bigram 모델을 numpy 로 만들어
          <b>퍼플렉시티를 재고 temperature 로 문장을 생성</b> — GPT 의 생성 루프를
          초소형으로 재현합니다.
        </li>
      </ul>
    </ConceptCard>

    <!-- 여정 지도 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 여정 지도 — 여기까지 온 길</h2>
    <ReviewFlag id="ch10-s1" chapter="ch10" label="1. 여정 지도" />
    <div class="my-4 grid gap-2 sm:grid-cols-2">
      <div
        v-for="ch in journey"
        :key="ch.n"
        class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
      >
        <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-indigo-100 text-xs font-bold text-indigo-700">
          {{ ch.n }}
        </span>
        <span class="min-w-0 text-sm">
          <b>{{ ch.title }}</b>
          <span class="ml-1 text-slate-500">— {{ ch.line }}</span>
        </span>
      </div>
    </div>
    <p class="leading-relaxed text-slate-700">
      전부 하나의 실로 꿰어져 있습니다: <b>놀람 log₂(1/p) 하나</b>에서 출발해,
      평균 내면 엔트로피, 지도를 바꾸면 크로스 엔트로피, 빼면 KL, 최소화하면 학습,
      2^ 하면 퍼플렉시티, 나누면 temperature, 조건 걸면 문맥의 가치.
    </p>

    <!-- 실험 A 안내 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 실험 A 미리보기 — σ′ 소거의 마법</h2>
    <ReviewFlag id="ch10-s2" chapter="ch10" label="2. 실험 A — 손실 교체" />
    <p class="leading-relaxed text-slate-700">
      1부 캡스톤의 신경망은 시그모이드 출력에 MSE 손실을 썼고, 역전파 출력층에서
      "받아 적은 선물" σ′ = σ(1−σ) 를 곱해야 했습니다. 손실을 크로스 엔트로피로 갈아 끼우면:
    </p>
    <div class="my-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p class="text-sm font-bold text-amber-900">1부 — MSE 의 출력층 델타</p>
        <MathBlock expr="\delta = \tfrac{2}{N}(\hat{y} - y)\cdot \sigma'(z)" />
        <p class="mt-1 text-xs text-amber-800">
          σ′ ≤ 0.25 가 곱해짐 — 확신 구간(ŷ ≈ 0 또는 1)에서 <b>기울기 사망</b>
        </p>
      </div>
      <div class="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <p class="text-sm font-bold text-indigo-900">5부 — 크로스 엔트로피의 출력층 델타</p>
        <MathBlock expr="\delta = \tfrac{1}{N}(\hat{y} - y)" />
        <p class="mt-1 text-xs text-indigo-800">
          −log 의 미분(1/q)이 σ′ 과 <b>정확히 약분</b> — 틀린 만큼 그대로 배움
        </p>
      </div>
    </div>
    <p class="leading-relaxed text-slate-700">
      복잡한 손실로 바꿨는데 기울기는 <b>오히려 단순해지는</b> 반전 — 이것이 4장에서 예고한
      마법이고, 노트북에서 <b>수치미분으로 직접 검산</b>합니다(오차 10⁻¹¹ 수준).
      같은 출발선 대결에서는 크로스 엔트로피 팀이 더 빨리 과녁(99%)에 도달해요.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="시그모이드 출력 + 크로스 엔트로피 조합에서 출력층 델타가 (ŷ−y)/N 로 단순해지는 이유는?"
      :choices="['−log 의 미분이 σ′ 을 정확히 약분(소거)해서', 'σ′ 이 원래 1이라서', '경사하강을 생략해서', '우연히 비슷할 뿐']"
      :answer="0"
      explanation="CE 의 미분에 등장하는 1/q 가 σ′ = σ(1−σ) 와 약분됩니다 — 노트북에서 수치미분으로 검산해 보세요."
    />

    <!-- 실험 B 안내 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 실험 B 미리보기 — 손바닥 위의 GPT</h2>
    <ReviewFlag id="ch10-s3" chapter="ch10" label="3. 실험 B — 미니 언어모델" />
    <p class="leading-relaxed text-slate-700">
      bigram 언어모델은 "앞 글자를 보고 다음 글자의 분포를 내놓는" 가장 작은 언어모델입니다.
      훈련은 글자쌍 <b>세기</b>가 전부(이 경우 최대우도 = 빈도 세기!).
      이 장난감으로 시리즈의 지표들을 전부 실측합니다:
    </p>
    <ul class="my-3 list-disc space-y-1.5 pl-6 leading-relaxed text-slate-700">
      <li>
        <b>퍼플렉시티 사다리</b>: 아무것도 모름(uniform, 27갈래) → 빈도만 앎(unigram, 약 17갈래)
        → 앞 글자를 봄(bigram, 약 7갈래) — 지식과 문맥이 갈래를 깎는 걸 숫자로 확인
      </li>
      <li>
        <b>temperature 생성</b>: 같은 모델로 T = 0.5 / 1 / 2 문장 생성 —
        낮으면 "the, tion" 반복, 높으면 알파벳 잔치
      </li>
      <li>
        <b>스무딩</b>: 못 본 글자쌍에도 작은 확률을 남깁니다 — 4장의 "q = 0 이면 비용 무한대"
        가 실전 코드에 등장하는 순간
      </li>
    </ul>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="bigram 모델의 퍼플렉시티가 unigram 모델보다 낮은 이유는?"
      :choices="['앞 글자라는 문맥이 다음 글자의 불확실성을 줄여서 (I > 0)', '파라미터가 더 적어서', '텍스트가 더 짧아져서', '스무딩 때문에']"
      :answer="0"
      explanation="9장의 문맥의 가치 그대로 — H(다음|앞) < H(다음) 이므로 2^ 를 씌운 PPL 도 낮아집니다."
    />

    <NotebookCard />
    <ConceptCard tone="warn" title="캡스톤 본편은 노트북입니다!">
      위 카드의 <code class="rounded bg-slate-100 px-1 text-[13px]">ch10_capstone.ipynb</code> 를
      꼭 실행해 보세요 — 수치미분 검산, 학습 곡선 대결, 퍼플렉시티 사다리, temperature 생성이
      전부 거기서 벌어집니다. 아래 종합 문제는 노트북과 별개로 풀 수 있어요.
    </ConceptCard>

    <!-- AI 최종 정리 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 최종 목표 달성 확인 — 이제 답할 수 있는 네 가지</h2>
    <ReviewFlag id="ch10-ai" chapter="ch10" label="🤖 최종 목표 네 가지" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 5부의 최종 목표, 회수 완료">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>손실함수(크로스 엔트로피)의 정체</b> — 틀린 지도 요금 H(p,q). 원핫이면 −log q(정답),
          학습은 그 최소화 = KL 최소화 = 세상 흉내내기 (4·6장)
        </li>
        <li>
          <b>성적표(퍼플렉시티)의 정체</b> — 2^손실 = "평균 몇 갈래에서 고민하나" (7장)
        </li>
        <li>
          <b>창의성 다이얼(temperature)의 정체</b> — softmax(z/T), 분포의 엔트로피 조절기 (8장)
        </li>
        <li>
          <b>정렬 페널티(KL)의 정체</b> — 원본 모델에서 멀어진 초과 비트에 대한 벌점, RLHF 의 목줄 (5장)
        </li>
      </ul>
      <p class="mt-2 text-sm">
        시리즈의 한 줄: <b>AI 는 불확실성을 줄이는 기계이고, 배운다는 것은 세상 분포를
        흉내내는 것이며, 그 모든 눈금은 놀람 log₂(1/p) 하나에서 나왔다.</b>
      </p>
    </ConceptCard>

    <!-- 종합 문제 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">4. 졸업 시험 — 전 과정 종합 10문제</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      워밍업부터 캡스톤까지 전 범위입니다. <b>모두 맞히면 5부 완주!</b>
    </p>

    <QuizSet title="캡스톤 — 졸업 시험 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="놀람 I = log₂(1/p) — 확률이 낮은 사건일수록 정보량이 크다."
        type="truefalse"
        :answer="0"
        explanation="1장 — 모든 것의 출발점이었던 눈금입니다."
      />
      <Quiz
        difficulty="easy"
        question="후보 8개가 완전히 균등한 분포의 엔트로피는 몇 비트일까요?"
        type="numeric"
        :answer="3"
        explanation="3장 — 균등 분포의 H = log₂n = log₂8 = 3비트."
      />
      <Quiz
        difficulty="easy"
        question="크로스 엔트로피 H(p,q) 와 KL 발산 D(p‖q) 의 관계로 옳은 것은?"
        :choices="['H(p,q) 는 지도 요금 전체, D 는 그중 바가지 초과분', 'D 가 요금 전체, H(p,q) 가 초과분', '둘은 항상 같다', '둘은 무관하다']"
        :answer="0"
        explanation="4·5장 — H(p,q) = H(p) + D(p‖q). 요금 전체 vs 초과분 비유 하나로 평생 안 헷갈립니다."
      />
      <Quiz
        difficulty="easy"
        question="'AI 가 배운다' = 데이터 분포와 모델 분포의 KL 발산을 최소화하는 것이다."
        type="truefalse"
        :answer="0"
        explanation="6장 — 이 과정의 종착지 문장. 그리고 그것이 곧 크로스 엔트로피 최소화입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="평균 손실이 3비트인 언어모델의 퍼플렉시티는?"
        type="numeric"
        :answer="8"
        :hints="['PPL = 2^손실.']"
        explanation="7장 — 2³ = 8갈래 고민 수준."
      />
      <Quiz
        difficulty="medium"
        question="temperature 를 올리면 출력 분포에 일어나는 일은?"
        :choices="['엔트로피가 커지고 꼬리 토큰의 기회가 늘어난다', '엔트로피가 작아진다', '모델의 지식이 늘어난다', '토큰 순위가 뒤집힌다']"
        :answer="0"
        explanation="8장 — 점수 차이가 T 로 나뉘며 좁아져 분포가 균등 쪽으로. 창의성과 헛소리가 함께 옵니다."
      />
      <StepQuiz
        difficulty="medium"
        question="모델이 정답 토큰에 확률 1/4 을 줬습니다. 이 토큰의 손실과, 그 손실만으로 본 갈래 수를 구하세요."
        :steps="[
          { lhs: '\\text{손실 } \\log_2 4', answer: 2 },
          { lhs: '\\text{갈래 수 } 2^2', answer: 4 },
        ]"
        :hints="['원핫이면 손실 = −log₂ q(정답) (4장).', '갈래 수 = 2^손실 (7장).']"
        explanation="손실 2비트 = 4갈래 고민 어치의 놀람 — 1·4·7장이 한 문제에."
      />
      <Quiz
        difficulty="medium"
        question="시그모이드 출력층에서 MSE 대신 크로스 엔트로피를 쓰면 출력층 기울기가 (ŷ−y) 로 단순해지고, 확신에 찬 오답에서도 기울기가 살아 있다."
        type="truefalse"
        :answer="0"
        explanation="캡스톤 실험 A — σ′ 소거의 마법. 1부의 복선이 회수되는 순간입니다."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="문맥 없이 다음 글자의 불확실성이 5비트, 앞 글자를 본 뒤 2비트입니다. 문맥의 가치와 갈래 수 변화를 구하세요."
        :steps="[
          { lhs: 'I = 5 - 2', answer: 3 },
          { lhs: '\\text{문맥 전 갈래 } 2^5', answer: 32 },
          { lhs: '\\text{문맥 후 갈래 } 2^2', answer: 4 },
        ]"
        :hints="['I = 줄어든 비트 (9장).', '갈래 = 2^H (7장).']"
        explanation="9장 + 7장 — 앞 글자 하나가 32갈래 고민을 4갈래로. bigram 이 unigram 을 이기는 이유입니다."
      />
      <Quiz
        difficulty="hard"
        question="사전학습이 아무리 진행돼도 loss 가 어떤 값 아래로 내려가지 않는 이유는?"
        :choices="['언어 자체의 엔트로피 H(p_data) 가 줄일 수 없는 바닥으로 남아서', '경사하강의 버그', 'GPU 메모리 한계', '토크나이저가 나빠서']"
        :answer="0"
        :hints="['훈련 손실 = 세상의 불확실성 + 내 모델의 모자람 (6장).']"
        explanation="6장 — 배움이 깎는 건 KL(모자람)뿐, 세상의 진짜 불확실성은 신도 못 줄입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch10')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center"
    >
      <div class="mb-2 text-3xl">🎓🎉</div>
      <p class="text-lg font-bold text-emerald-800">5부 완주 — 그리고 시리즈 대단원!</p>
      <p class="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-emerald-700">
        선형대수(1부) → 미분(2부) → 확률통계(3부) → 트랜스포머(4부) → 정보이론(5부).
        이제 AI 의 손실함수·성적표·창의성 다이얼·정렬 페널티가 무엇인지
        <b>수식과 직관 양쪽으로</b> 답할 수 있습니다.
        수포자는 여기 없습니다 — 완주를 축하합니다! 🎉
      </p>
      <RouterLink
        to="/"
        class="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        ← 목차로 (복습은 언제든!)
      </RouterLink>
    </div>
  </article>
</template>
