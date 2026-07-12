<script setup lang="ts">
// ch5 — 자의 끝: 오버플로·언더플로·NaN. 3장에서 비워 둔 특별석(지수 전부 0/전부 1)의
// 입주민들 — 8부 9장 손실 스파이크·NaN 붕괴의 하드웨어 층.
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import RulerEdgeLab from '@/components/RulerEdgeLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch5')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">5장 · 저장 — 칸의 해부 ④</p>
    <h1 class="mb-4 text-3xl font-bold">자의 끝 — 오버플로·언더플로·NaN</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      고무줄 자도 무한하지는 않습니다 — 지수 8비트가 정하는 <b>양쪽 끝</b>이 있어요.
      끝을 넘으면 무슨 일이 생기는지(에러가 아닙니다!), 그리고 3장에서 예고한
      특별석 — 지수 비트 전부 0/전부 1 — 의 입주민들(0·비정규수·<b>inf·NaN</b>)을 만납니다.
      훈련 로그의 공포, <b>loss: nan</b> 의 정체가 오늘 밝혀집니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      자의 끝에서 벌어지는 세 사고를 직접 일으켜 봅니다 — ① 너무 커서 <b>inf 로 포화</b>
      (오버플로), ② 너무 작아서 <b>0 으로 소멸</b>(언더플로), ③ 답이 없는 계산의 표식
      <b>NaN 과 그 전염성</b>. 그리고 exp 가 이 사고의 단골 방아쇠인 이유(x ≈ 89!)까지 —
      다음 장(log-sum-exp)의 동기가 여기서 나옵니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 자의 양쪽 끝 — 얼마나 멀리 있나</h2>
    <p class="leading-relaxed text-slate-700">
      3장 해부에서 지수 8비트는 창문을 2⁻¹²⁶ 부터 2¹²⁷ 까지 옮길 수 있었죠. 그래서 fp32 가
      담는 가장 큰 수는 약 <b>3.4×10³⁸</b>, 가장 작은 정규 수는 약 <b>1.2×10⁻³⁸</b> 입니다.
      10³⁸ 이면 충분히 멀어 보이지만 — <b>×2 를 반복하면 단 128걸음</b>이에요. 그리고
      <b><PartLink :part="2" ch="ch7">2부 7장</PartLink></b>의 지수함수는 그 걸음을 순식간에
      걸어 버립니다. 직접 여행해 봅시다.
    </p>

    <RulerEdgeLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 끝을 넘어도 에러는 없다, 그래서 더 위험하다">
      자의 끝을 넘은 순간 컴퓨터는 멈추지 않습니다 — <b>inf(포화 표식)를 적고 계속 달려요.</b>
      inf 는 이후 계산을 타고 흐르다(inf × 2 = inf) 다른 inf 나 0 을 만나는 순간
      <b>NaN 으로 변이</b>하고(∞−∞, ∞/∞), NaN 은 닿는 모든 것을 NaN 으로 만듭니다(전염).
      즉 "폭발 → 포화 → 변이 → 전염"의 4단계 — 사고 지점과 발견 지점이 멀리 떨어지는 이유라,
      로그에 nan 이 찍혔을 땐 이미 몇 스텝 전의 일인 경우가 많아요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="fp32 계산이 최대값(약 3.4×10³⁸)을 넘으면 어떻게 되나?"
      :choices="['에러 없이 inf(무한대 표식)로 포화되고 계산이 계속된다', '프로그램이 즉시 에러로 멈춘다', '가장 큰 유한값(3.4×10³⁸)에 고정된다', '0으로 되돌아간다']"
      :answer="0"
      :hints="['2배 여행의 128번째 걸음에서 무슨 일이 있었나요 — 멈췄나요?']"
      explanation="조용히 inf 가 되고 여행은 계속됩니다 — 에러가 아니라서 사고가 전파돼요. 이 조용함이 NaN 전염의 출발점입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 사고들에 이름표 달기</h2>

    <ConceptCard tone="note" title="새 용어: 오버플로 / 언더플로 / NaN">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>오버플로</b> (overflow) — 읽는 법: 오버플로. 뜻: 결과가 자의 위쪽 끝(fp32 약
          3.4×10³⁸)을 넘어 <b>inf 로 포화</b>되는 것. 8부 9장의 손실 스파이크가 커지다
          만나는 종착역.
        </li>
        <li>
          <b>언더플로</b> (underflow) — 읽는 법: 언더플로. 뜻: 결과가 너무 작아(정규 하한
          약 1.2×10⁻³⁸ 아래) 정밀도를 잃다가 결국 <b>0 으로 소멸</b>하는 것 — 확률 수백 개를
          곱할 때의 단골 사고(그래서 log 로 피신합니다, 6장).
        </li>
        <li>
          <b>NaN</b> (Not a Number) — 읽는 법: 낸. 뜻: 0/0·∞−∞·√(−1) 처럼 <b>답이 정의되지
          않는 계산의 표식</b>. 전염성(NaN 이 낀 연산은 전부 NaN)과 자기부정(NaN ≠ NaN)이
          특징 — 검사는 반드시 isnan 함수로.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="다음 중 NaN 이 태어나는 계산은?"
      :choices="['∞ − ∞', '1 ÷ 0', '10³⁸ × 10', '0 × 5']"
      :answer="0"
      :hints="['답을 하나로 정할 수 없는 계산이 어느 것인지 — 1÷0 은 뭐가 될까요?']"
      explanation="∞−∞ 는 답이 없어 NaN. 반면 1÷0 은 (양쪽에서 다가가면 한없이 커지므로) inf 로 정의돼 있고, 10³⁸×10 은 오버플로로 inf, 0×5 = 0 입니다 — inf 와 NaN 은 다른 표식이에요."
    />

    <DetailsCard title="➕ 더 깊이: 비정규수 — 낭떠러지 대신 경사로 (그리고 0이 두 개)">
      ÷2 여행에서 2⁻¹²⁶ 아래로 내려가도 곧장 0 이 되지 않았죠 — 지수 비트가 <b>전부 0</b>인
      특별석에서는 <b>숨은 1 을 포기</b>하고(1.m 대신 0.m 로 읽기) 눈금을 점점 성기게 하며
      2⁻¹⁴⁹ ≈ 1.4×10⁻⁴⁵ 까지 버팁니다. 이 구간의 수가 <b>비정규수</b>(subnormal) — 자의 끝을
      낭떠러지가 아닌 경사로로 만들어 "a ≠ b 인데 a − b = 0" 같은 모순을 막아 줘요. 대가는
      정밀도(숨은 1 포기)와, 일부 하드웨어에서의 <b>속도 저하</b>(특별석 처리가 느림).
      트리비아 하나 — 부호 비트 덕에 <b>+0 과 −0 이 따로 존재</b>합니다(비교하면 같다고
      나오지만, 1을 나눠 보면 +inf 와 −inf 로 정체가 드러나죠).
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — loss: nan 사건의 전말 (8부 9장 회수)">
      <b><PartLink :part="8" ch="ch9">8부 9장</PartLink></b>에서 손실 곡선의 스파이크와 NaN 을
      "증상"으로 배웠다면, 오늘은 그 <b>병리</b>입니다 — 학습률 과대(8부 0장의 무모이)로 손실이
      치솟고 → 어텐션 점수·gradient 가 exp 폭발 시계를 타고 자의 끝을 넘어(오버플로)
      → inf 끼리 만나 NaN 변이 → 수 스텝 만에 모델 전체가 오염. 그래서 처방도 이 사슬을
      끊는 것들이에요: gradient clipping(8부 9장 — 폭발 전에 자르기), 학습률 낮추기, 그리고
      fp16처럼 <b>자가 짧은 칸</b>(최대 65,504!)에서는 loss scaling(7장) — 다음 두 장의 예고편입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="자의 끝 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="fp32가 담을 수 있는 가장 큰 수의 크기 급은?"
        :choices="['약 3.4×10³⁸', '약 256', '약 9천조 (2⁵³)', '무한대 — 끝이 없다']"
        :answer="0"
        explanation="지수 8비트의 천장(창문 최대 2¹²⁷)이 정하는 끝입니다. 2⁵³은 fp64의 정수 천장(4장), 256은 8비트 정수의 가짓수(2장) — 헷갈리기 쉬운 삼형제예요."
      />
      <Quiz
        difficulty="easy"
        question="언더플로는 결과가 너무 작아져 0으로 사라지는 현상이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. ÷2 여행의 149번째 걸음 — 정규 하한(1.2×10⁻³⁸)을 지나 비정규 경사로를 내려가다 결국 0이 됐죠."
      />
      <Quiz
        difficulty="easy"
        question="NaN 의 뜻은?"
        :choices="['Not a Number — 답이 정의되지 않는 계산의 표식', 'Negative and Null 의 약자', '아주 큰 수의 별명', '컴퓨터 제조사 이름']"
        :answer="0"
        explanation="0/0, ∞−∞ 처럼 답을 정할 수 없는 계산이 남기는 표식입니다 — 훈련 로그의 loss: nan 이 바로 이것."
      />
      <Quiz
        difficulty="easy"
        question="1에서 출발해 fp32로 ×2를 반복하면 몇 번 만에 inf가 되나? (숫자로)"
        type="numeric"
        :answer="128"
        explanation="2¹²⁸ 이 최대값 3.4×10³⁸ 을 넘는 순간 — 겨우 128걸음입니다. 지수의 위력(2부 7장)이죠."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="fp32에서 exp(x)가 inf로 폭발하는 x의 경계는 대략?"
        :choices="['약 89 (exp(88.7) ≈ 3.4×10³⁸)', '약 709 — 그건 fp64의 경계', '약 3.4×10³⁸', '약 128만']"
        :answer="0"
        :hints="['폭발 시계에서 fp32 쪽이 터진 눈금을 보세요.']"
        explanation="로짓이 89만 돼도 fp32 exp는 즉사합니다 — 훈련이 조금만 불안해도 닿는 크기라, softmax 를 그대로 계산하면 위험해요(구급대는 6장의 max 빼기)."
      />
      <Quiz
        difficulty="medium"
        question="inf 에 대한 설명으로 옳은 것은?"
        :choices="['에러가 아니라 값이다 — 이후 계산에 그대로 참여하며 흐른다 (inf × 2 = inf)', 'inf가 생기면 프로그램이 반드시 멈춘다', 'inf는 가장 큰 유한값과 같은 뜻이다', 'inf끼리는 어떤 연산을 해도 inf다']"
        :answer="0"
        explanation="조용히 흐르는 값이라 사고가 전파됩니다 — 그리고 ∞−∞, ∞/∞ 처럼 inf끼리 만나면 NaN으로 변이해요(마지막 선택지가 함정)."
      />
      <Quiz
        difficulty="medium"
        question="NaN === NaN(자기 자신과의 비교)의 결과와 올바른 NaN 검사법은?"
        :choices="['거짓 — 그래서 isnan 함수로 검사해야 한다', '참 — 같은 값이니까', '거짓 — 그래서 == 0 으로 검사한다', '언어마다 무작위로 다르다']"
        :answer="0"
        explanation="NaN은 자기 자신과도 같지 않은 유일한 값입니다(표준의 약속). x != x 가 참이면 NaN — 이 성질 자체가 검사법으로 쓰이기도 하지만, 정석은 isnan 이에요."
      />
      <Quiz
        difficulty="medium"
        question="작은 확률 300개(각 ≈ 0.01)를 그대로 곱하면 fp32에서 무슨 일이 생기나?"
        :choices="['10⁻⁶⁰⁰ 급이라 자의 아래쪽 끝(10⁻³⁸·비정규 10⁻⁴⁵)을 한참 지나 언더플로 — 0이 된다', '오버플로로 inf가 된다', '아무 문제 없이 정확히 계산된다', 'NaN이 즉시 발생한다']"
        :answer="0"
        :hints="['0.01을 300번 곱하면 10의 몇 제곱쯤일까요? 자의 아래 끝은 10⁻³⁸(비정규 포함 10⁻⁴⁵).']"
        explanation="확률의 연쇄 곱은 언더플로의 단골손님입니다 — LLM이 문장 확률을 다룰 때 log 확률로 피신하는 이유(6장)가 정확히 이것."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="훈련 로그에 loss: nan — 오늘 배운 사고 사슬로 가장 그럴듯한 전말은?"
        :choices="['손실 폭주(스파이크) → 큰 값들이 exp·곱셈을 타고 오버플로(inf) → ∞−∞ 류에서 NaN 변이 → 전염으로 전체 오염', 'NaN이 하늘에서 무작위로 떨어졌다 — 원인 분석 불가', '데이터에 한글이 섞여 있어서다', '손실이 0에 도달해서 나는 정상 신호다']"
        :answer="0"
        :hints="['핵심 관찰 카드의 4단계 — 폭발 → 포화 → 변이 → 전염.']"
        explanation="그래서 처방이 사슬 끊기입니다 — 학습률 낮추기(폭발 방지), gradient clipping(8부 9장 — 포화 전 자르기), fp16이면 loss scaling(7장). nan이 찍힌 시점은 이미 사고 몇 스텝 뒤라는 것도 실전 포인트."
      />
      <Quiz
        difficulty="hard"
        question="fp16의 자는 최대 65,504로 훨씬 짧다. 이것이 fp16 학습에서 의미하는 것은?"
        :choices="['gradient·중간값이 6만만 넘어도 inf — fp32보다 오버플로가 훨씬 잦아 별도 안전장치(loss scaling)가 필요하다', '짧은 자는 정밀도가 높으므로 사고가 줄어든다', '65,504를 넘으면 자동으로 fp32로 승격되므로 문제없다', 'fp16에서는 NaN이 존재하지 않는다']"
        :answer="0"
        :hints="['자가 짧을수록 2배 여행이 몇 걸음 만에 끝날까요? (힌트: 16번)']"
        explanation="fp32의 3.4×10³⁸ 대비 6.5×10⁴ — 2배 여행이 16걸음 만에 끝나는 자입니다. 반쪽 자(7장)의 메모리 절약에는 이 대가가 붙어 있고, loss scaling이 그 보험이에요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch5')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">5장 완료 — 저장 편(2~5장) 끝!</p>
      <p class="mt-1 text-sm text-emerald-700">
        칸의 구조와 사고를 모두 봤습니다. 이제 "계산" 편 — exp 폭발과 확률 언더플로를
        한 번에 피하는 업계 표준 구급법, log-sum-exp 로 갑니다.
      </p>
      <RouterLink
        to="/ch/ch6"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        6장 — 안전한 확률 계산: log-sum-exp →
      </RouterLink>
    </div>
  </article>
</template>
