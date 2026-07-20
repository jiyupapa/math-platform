<script setup lang="ts">
// Phase 0 · 샘플 챕터 — 동전 던지기 맛보기 (학습 패턴 검증용)
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import CoinFlipSim from '@/components/CoinFlipSim.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('sample')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 0 · 워밍업</p>
    <h1 class="mb-4 text-3xl font-bold">샘플 챕터 — 동전 던지기 맛보기 🪙</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      3부 <b>확률과 통계</b>에 오신 걸 환영합니다! 이 챕터는 본 학습 전에 "이 앱은 이렇게
      공부하는구나"를 체험하는 워밍업이에요. 수학 얘기는 딱 하나만 합니다 —
      <b>"확률이란 대체 뭘까?"</b> 동전 하나면 충분해요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>확률이 <b>0과 1 사이의 숫자</b>이고, <b>"오래 반복했을 때의 비율"</b>이라는 감을 잡는다</li>
        <li>동전을 직접(시뮬레이터로) 던져서 비율이 <b>0.5 에 다가가는 것</b>을 눈으로 본다</li>
        <li>설명 카드 → 인터랙티브 → 미니체크 → 10문제 세트로 이어지는 <b>학습 패턴</b>을 익힌다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 확률이란 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 확률은 0과 1 사이의 숫자</h2>
    <ReviewFlag id="sample-s1" chapter="sample" label="1. 확률은 0과 1 사이의 숫자" />
    <p class="leading-relaxed text-slate-700">
      "내일 비 올 확률 30%", "동전 앞면이 나올 확률 2분의 1" — 일상에서 늘 쓰는 말이죠.
      수학에서는 이걸 <b>0과 1 사이의 숫자</b>로 씁니다. 0 이면 "절대 안 일어남",
      1 이면 "반드시 일어남", 0.5 면 "반반"이에요. 동전이라면:
    </p>
    <MathBlock expr="P(\text{앞면}) = \dfrac{1}{2} = 0.5" />

    <ConceptCard tone="note" title="새 기호 — P( )">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <MathBlock inline expr="P(A)" /> &nbsp;<b>읽는 법</b>: "피 에이" ·
          <b>뜻</b>: 사건 <MathBlock inline expr="A" /> 가 일어날 <b>확률(Probability)</b>.
          괄호 안에 궁금한 사건을 넣습니다 — <MathBlock inline expr="P(\text{앞면})" />,
          <MathBlock inline expr="P(\text{비})" /> 처럼요.
        </li>
        <li>확률은 항상 <b>0 ≤ P(A) ≤ 1</b>. 퍼센트(%)는 이 숫자에 100을 곱해 읽는 것뿐이에요 (0.3 = 30%).</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="어떤 사건의 확률이 1.2 가 될 수 있다."
      type="truefalse"
      :answer="1"
      :hints="['확률은 0(절대 안 일어남)부터 1(반드시 일어남) 사이입니다.']"
      explanation="거짓입니다. 확률은 반드시 0과 1 사이 — 1을 넘는 확률은 없어요."
    />

    <!-- 2. 던져보기 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 그런데 0.5 라는 게 무슨 뜻일까? (직접 던져보기)</h2>
    <ReviewFlag id="sample-s2" chapter="sample" label="2. 직접 던져보기 — 0.5의 뜻" />
    <p class="leading-relaxed text-slate-700">
      "앞면 확률이 0.5"라고 해서 <b>두 번 던지면 꼭 한 번 앞면</b>이 나오는 건 아니에요.
      10번 던져 앞면이 3번, 7번 나오는 일도 흔합니다. 확률 0.5 의 진짜 뜻은
      <b>"던지는 횟수를 늘릴수록 앞면의 비율이 0.5 에 다가간다"</b>는 것.
      아래 시뮬레이터로 직접 확인해 보세요 — 10번일 때와 1000번일 때 비율이 어떻게 다른가요?
    </p>

    <CoinFlipSim />

    <ConceptCard tone="tip" title="방금 본 것의 이름 — 큰 수의 법칙 (7장 예고)">
      던질수록 비율이 이론값(0.5)에 다가가는 현상을 <b>큰 수의 법칙</b>이라고 부릅니다.
      카지노와 보험회사가 돈을 버는 원리이자, AI 가 "데이터가 많을수록 좋다"고 말하는 이유 —
      7장에서 제대로 다룹니다. 지금은 "오래 반복하면 비율이 안정된다" 감만 가져가면 충분해요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="공정한 동전을 10번 던지면 앞면은 반드시 정확히 5번 나온다."
      type="truefalse"
      :answer="1"
      :hints="['시뮬레이터에서 10번 던지기를 몇 번 눌러 보세요. 매번 5번이 나오던가요?']"
      explanation="거짓입니다. 적은 횟수에서는 3번, 7번도 흔해요. 확률 0.5 는 '오래 반복했을 때의 비율'에 대한 약속입니다."
    />

    <!-- 3. 계산 맛보기 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 계산도 해보기 — 주사위 확률</h2>
    <ReviewFlag id="sample-s3" chapter="sample" label="3. 계산 맛보기 — 주사위 확률" />
    <p class="leading-relaxed text-slate-700">
      동전처럼 <b>모든 결과가 똑같이 나올 법한</b> 경우, 확률은 "경우의 수 세기"로 계산합니다
      (자세한 건 3장에서). 주사위 눈은 1~6 의 <b>6가지</b>이고 모두 공평하죠. 그중
      3의 배수는 3과 6, <b>2가지</b>입니다:
    </p>
    <MathBlock expr="P(\text{3의 배수}) = \dfrac{\text{3의 배수인 경우의 수}}{\text{전체 경우의 수}} = \dfrac{2}{6} = \dfrac{1}{3}" />
    <p class="leading-relaxed text-slate-700">
      이런 계산 문제는 아래처럼 <b>중간 단계를 하나씩 직접 입력</b>하며 풉니다.
      한 칸씩 채우고 "채점하기"를 눌러 보세요 — 이 앱의 계산 문제는 전부 이 방식이에요.
    </p>

    <StepQuiz
      difficulty="easy"
      question="주사위 한 번을 던질 때 '4 이상'이 나올 확률을 단계별로 구하세요."
      :steps="[
        { lhs: '\\text{4 이상인 경우의 수 (4, 5, 6)}', answer: 3 },
        { lhs: '\\text{전체 경우의 수}', answer: 6 },
        { lhs: '\\text{확률} = 3 \\div 6', answer: 0.5 },
      ]"
      :hints="['4 이상인 눈을 하나씩 세어 보세요: 4, 5, 6.', '확률 = (해당 경우의 수) ÷ (전체 경우의 수).']"
      explanation="3 ÷ 6 = 0.5. 절반의 확률이니 동전 던지기와 같은 셈이네요!"
    />

    <!-- 4. 학습 방식 안내 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 이 앱은 이렇게 공부합니다</h2>
    <ReviewFlag id="sample-s4" chapter="sample" label="4. 이 앱의 학습 방식" />
    <ConceptCard tone="note" title="학습 패턴 한눈에">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>📘 설명 카드</b> — 새 용어·기호가 나오면 즉시 "이름 + 읽는 법 + 뜻"으로 풀어드려요.</li>
        <li><b>🎛️ 인터랙티브</b> — 공식보다 먼저, 직접 만지며 "감"을 잡습니다.</li>
        <li><b>🔎 미니체크</b> — 본문 중간중간 가볍게 확인. 틀려도 부담 없어요.</li>
        <li><b>💡 힌트 · 해설</b> — 문제마다 단계별 힌트가 있고, 맞히면 해설이 나옵니다.</li>
        <li><b>🧮 계산기 OK</b> — 복잡한 나눗셈·소수 계산은 계산기를 써도 됩니다. 중요한 건 계산 속도가 아니라 <b>개념</b>이에요.</li>
        <li><b>📝 10문제 세트</b> — 챕터 끝 난이도별 문제를 모두 맞히면 <b>진도 완료</b>(왼쪽 사이드바에 ✓).</li>
        <li><b>☆ 복습에 추가</b> — 섹션 제목 옆 버튼을 누르면 '복습 목록'에 모여요.</li>
        <li><b>🤖 AI 튜터</b> — 오른쪽 아래 버튼. 막히면 무엇이든 질문하세요 (로컬 AI, 선택 사항).</li>
        <li><b>🐍 노트북</b> — 챕터마다 짝 Python 노트북이 있어요 (이것도 선택 사항).</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="이 과정(3부)의 최종 목표로 가장 알맞은 것은?"
      :choices="[
        '확률 문제를 암산으로 푸는 속도 기르기',
        '확률·통계로 AI 기반지식(확률로 예측하고 데이터로 배우는 원리) 갖추기',
        '통계학과 대학원 진학 준비',
        '엑셀 함수 마스터하기',
      ]"
      :answer="1"
      :hints="['홈 화면의 소개 문구를 떠올려 보세요.']"
      explanation="맞아요. 모든 챕터 끝에는 그 개념이 AI 에서 어떻게 쓰이는지 보여주는 🤖 섹션이 있습니다."
    />

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 AI 는 확률로 말한다</h2>
    <ReviewFlag id="sample-ai" chapter="sample" label="🤖 AI 는 확률로 말한다" />
    <p class="leading-relaxed text-slate-700">
      ChatGPT 같은 AI 가 문장을 만드는 방법이 바로 <b>확률</b>입니다. "오늘 날씨가" 다음에 올
      단어를 AI 는 이렇게 봅니다 — <b>좋다 45%</b>, 흐리다 20%, 춥다 12%, 이상하다 3%, …
      모든 후보 단어에 확률을 매기고 그중에서 골라요. 즉 <b>AI 의 출력은 확률분포</b>이고,
      확률을 모르면 AI 가 무슨 말을 하는지 절반은 놓치는 셈이에요.
    </p>

    <ConceptCard tone="ai" title="확률·통계 → AI 로 가는 길">
      <ul class="list-disc space-y-2 pl-5">
        <li><b>확률</b>(3~6장) → AI 의 출력·예측이 전부 확률분포 (소프트맥스, 다음 단어 확률)</li>
        <li><b>통계</b>(1~2장, 7~9장) → AI 는 데이터(표본)로 배우고, 성능도 통계로 검증</li>
        <li><b>회귀</b>(10장) → 가장 작은 머신러닝 모델을 직접 만나며 1부(선형대수)·2부(미분)와 합류</li>
      </ul>
    </ConceptCard>

    <!-- 연습 문제 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산이 섞인 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
      막히면 힌트부터 눌러 보세요.
    </p>

    <QuizSet title="동전 던지기 맛보기 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="확률은 0과 1 사이의 숫자다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 0 = 절대 안 일어남, 1 = 반드시 일어남, 그 사이가 '어느 정도 일어날 법함'이에요."
      />
      <Quiz
        difficulty="easy"
        question="공정한 동전에서 앞면이 나올 확률은? (소수로 입력)"
        type="numeric"
        :answer="0.5"
        :hints="['앞면과 뒷면, 두 경우가 공평하게 나올 법합니다.']"
        explanation="1 ÷ 2 = 0.5 입니다."
      />
      <Quiz
        difficulty="easy"
        question="P(A) = 0.9 의 뜻으로 가장 알맞은 것은?"
        :choices="[
          'A 는 절대 일어나지 않는다',
          '오래 반복하면 A 는 10번 중 9번꼴로 일어난다',
          'A 는 이미 일어난 사건이다',
          'A 는 정확히 9번 일어난다',
        ]"
        :answer="1"
        :hints="['확률 = 오래 반복했을 때의 비율.']"
        explanation="확률 0.9 = 반복을 많이 하면 90% 비율로 일어난다는 뜻입니다."
      />
      <Quiz
        difficulty="easy"
        question="공정한 동전을 1000번 던지면 앞면의 비율은 대체로 0.5 근처가 된다."
        type="truefalse"
        :answer="0"
        :hints="['시뮬레이터에서 1000번 던지기를 눌렀을 때를 떠올려 보세요.']"
        explanation="참입니다. 던질수록 비율이 0.5 에 다가갑니다 — 큰 수의 법칙(7장)이에요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="주사위 한 번을 던질 때 짝수가 나올 확률은? (소수로 입력)"
        type="numeric"
        :answer="0.5"
        :hints="['짝수인 눈: 2, 4, 6 → 3가지.', '3 ÷ 6 = ?']"
        explanation="짝수는 2, 4, 6 의 3가지. 3 ÷ 6 = 0.5 입니다."
      />
      <StepQuiz
        difficulty="medium"
        question="주사위 한 번을 던질 때 '5 이상'이 나올 확률을 단계별로 구하세요."
        :steps="[
          { lhs: '\\text{5 이상인 경우의 수 (5, 6)}', answer: 2 },
          { lhs: '\\text{전체 경우의 수}', answer: 6 },
          { lhs: '\\text{확률} = 2 \\div 6 \\;\\text{(소수 셋째 자리 반올림)}', answer: 0.333, tolerance: 0.001 },
        ]"
        :hints="['5 이상인 눈은 5와 6 뿐입니다.', '2 ÷ 6 = 0.3333… → 셋째 자리에서 반올림하면 0.333.']"
        explanation="2 ÷ 6 = 1/3 ≈ 0.333. 경우의 수만 세면 확률이 나옵니다 — 3장에서 본격적으로!"
      />
      <Quiz
        difficulty="medium"
        question="동전을 10번 던졌더니 앞면이 7번 나왔다. 가장 올바른 해석은?"
        :choices="[
          '동전이 고장 났다',
          '적은 횟수에서는 이 정도 들쭉날쭉이 흔한 일이다',
          '다음 판에는 뒷면이 더 잘 나온다',
          '앞면의 확률이 0.7 로 변했다',
        ]"
        :answer="1"
        :hints="['확률 0.5 는 「오래 반복했을 때」의 약속이었죠.']"
        explanation="10번 정도로는 7:3 도 흔합니다. 그리고 동전은 지난 결과를 기억하지 못해요 — 다음 판도 여전히 반반입니다."
      />
      <Quiz
        difficulty="medium"
        question="P(A) = 0 이면, 이 상황에서 사건 A 는 일어나지 않는다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 확률 0 = 절대 안 일어남, 확률 1 = 반드시 일어남으로 약속합니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="동전을 200번 던져 앞면이 88번 나왔다. 실제로 나온 앞면의 비율은? (소수로 입력)"
        type="numeric"
        :answer="0.44"
        :tolerance="0.001"
        :hints="['비율 = 앞면 횟수 ÷ 전체 횟수.', '88 ÷ 200 = ?']"
        explanation="88 ÷ 200 = 0.44. 이론값 0.5 와 다르죠? 200번으로는 이 정도 차이가 흔하고, 더 던질수록 0.5 에 가까워집니다. 이런 '실제로 해 본 비율'을 3장에서 경험적 확률이라는 이름으로 다시 만나요."
      />
      <Quiz
        difficulty="hard"
        question="'앞면이 나올 확률이 1/2 이다'의 가장 정확한 뜻은?"
        :choices="[
          '두 번 던지면 반드시 한 번은 앞면이 나온다',
          '던지는 횟수를 늘릴수록 앞면의 비율이 1/2 에 다가간다',
          '앞면과 뒷면이 번갈아 나온다',
          '첫 번째는 반드시 앞면이다',
        ]"
        :answer="1"
        :hints="['이 챕터의 핵심 문장입니다. 시뮬레이터에서 본 것을 떠올리세요.']"
        explanation="확률은 「오래 반복했을 때 다가가는 비율」입니다. 이 감각 하나면 이 챕터는 성공이에요."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch00_sample.ipynb</code> 에서 동전 2000번 던지기를 코드 한 줄로 시뮬레이션하고,
      비율이 0.5 로 수렴하는 그래프를 직접 그려볼 수 있어요. (노트북은 선택 사항입니다)
    </ConceptCard>

    <div
      v-if="progress.isDone('sample')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">워밍업 완료! 이 패턴 그대로 끝까지 갑니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 확률보다 먼저, 눈앞의 데이터를 요약하는 법 — <b>평균·중앙값·최빈값</b>입니다.
      </p>
      <RouterLink
        to="/ch/ch1"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 데이터를 한눈에 →
      </RouterLink>
    </div>
  </article>
</template>
