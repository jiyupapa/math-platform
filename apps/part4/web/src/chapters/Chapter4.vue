<script setup lang="ts">
// Phase 4 — 위치 인코딩. 임베딩에 "몇 번째 단어인지" 순서 정보를 더한다.
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { ChartView } from '@series/ui'
import PositionLab from '@/components/PositionLab.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 심화: 사인·코사인 위치 인코딩 — 위치(0~15)에 따라 파형이 어떻게 변하는지
const positions = Array.from({ length: 16 }, (_, p) => p)
const sinCosChart = {
  labels: positions.map((p) => String(p)),
  datasets: [
    {
      label: '차원0: sin(pos)',
      data: positions.map((p) => Math.sin(p)),
      borderColor: 'var(--c-indigo-500)',
      pointRadius: 2,
      tension: 0.3,
    },
    {
      label: '차원1: cos(pos)',
      data: positions.map((p) => Math.cos(p)),
      borderColor: 'var(--c-emerald-500)',
      pointRadius: 2,
      tension: 0.3,
    },
    {
      label: '차원2: sin(pos/4), 느린 파동',
      data: positions.map((p) => Math.sin(p / 4)),
      borderColor: 'var(--c-amber-500)',
      pointRadius: 2,
      tension: 0.3,
    },
  ],
}

function onSetComplete() {
  progress.markDone('ch4')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">4장 · 위치 인코딩</p>
    <h1 class="mb-4 text-3xl font-bold">위치 인코딩 — "몇 번째"인지 알려주기</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      임베딩으로 각 단어는 <b>뜻(의미 벡터)</b>을 얻었습니다. 그런데 아직 빠진 게 있어요.
      <b>순서</b>입니다. "나 너 좋아해"와 "너 나 좋아해"는 단어가 똑같은데 뜻은 정반대죠.
      위치 인코딩은 각 토큰에 <b>"몇 번째 자리인지"</b>를 심어 줍니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      트랜스포머가 왜 <b>순서 정보를 따로 넣어야</b> 하는지, 그리고 그걸 어떻게
      <b>위치 벡터를 더해서</b> 해결하는지 직접 켜고 끄며 이해합니다.
    </ConceptCard>

    <!-- ===== 1. 순서가 뜻을 바꾼다 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      1. 순서가 없으면 뜻을 잃는다
      <ReviewFlag id="ch4-s1" chapter="ch4" label="1. 순서의 중요성" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      놀랍게도 트랜스포머의 핵심(어텐션)은 단어들을 <b>순서 없는 한 뭉치</b>로 봅니다.
      여러 단어를 <b>동시에(병렬로)</b> 처리하기 때문이에요. 그래서 순서를 <b>따로 알려주지 않으면</b>
      "나 너 좋아해"와 "너 나 좋아해"를 구분하지 못합니다. 아래에서 <b>위치 정보를 껐다 켜보세요</b>.
    </p>

    <PositionLab />

    <ConceptCard tone="note" title="새 용어: 위치 인코딩 (positional encoding)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>이름</b>: 위치 인코딩 (positional encoding)</li>
        <li><b>읽는 법</b>: "포지셔널 인코딩" / "위치 인코딩"</li>
        <li><b>뜻</b>: 각 토큰이 <b>몇 번째 자리에 있는지</b>를 나타내는 <b>위치 벡터</b>를 만들어
          임베딩에 <b>더해</b> 주는 것. 순서 정보를 모델에 심는 장치입니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="단어가 완전히 같아도, 순서가 다르면 문장의 뜻이 달라질 수 있다."
      type="truefalse"
      :answer="0"
      explanation="맞아요. '나 너 좋아해'와 '너 나 좋아해'가 대표적. 그래서 순서 정보가 꼭 필요합니다."
    />

    <!-- ===== 2. 어떻게: 더하기 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      2. 어떻게? 위치 벡터를 "더한다"
      <ReviewFlag id="ch4-s2" chapter="ch4" label="2. 위치 벡터 더하기" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      방법은 의외로 단순합니다. 자리(슬롯)마다 <b>고유한 위치 벡터</b>를 하나씩 준비해 두고,
      그 자리에 온 단어의 임베딩에 <b>그대로 더합니다</b>. 더하기라서 <b>차원(숫자 개수)은 그대로</b> 유지돼요.
    </p>
    <MathBlock expr="\text{최종 벡터} = \text{단어 임베딩} + \text{위치 벡터}" />
    <p class="mt-1 text-sm text-slate-500">
      벡터끼리 더할 땐 <b>같은 자리 숫자끼리</b> 더합니다. 첫째는 첫째끼리, 둘째는 둘째끼리.
      예: <MathBlock inline expr="(2,\ 1) + (0.5,\ 0.3) = (2.5,\ 1.3)" />.
      같은 단어라도 <b>1번째 자리</b>와 <b>2번째 자리</b>에선 더해지는 위치 벡터가 달라, 최종 벡터가 달라집니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="위치 인코딩은 임베딩에 위치 정보를 어떻게 합칠까요?"
      :choices="[
        '위치 벡터를 더한다 (차원은 그대로)',
        '임베딩을 지우고 위치만 남긴다',
        '단어를 알파벳 순으로 정렬한다',
        '토큰을 반으로 자른다',
      ]"
      :answer="0"
      :hints="['실험실 표의 가운데 열(＋ 위치 벡터)을 떠올려 보세요.']"
      explanation="자리마다 고유한 위치 벡터를 임베딩에 '더합니다'. 더하기라 차원은 유지돼요."
    />

    <!-- ===== 심화: 사인·코사인 ===== -->
    <DetailsCard title="➕ 더 깊이 알아보기: 왜 사인·코사인일까?">
      <p class="mb-2">
        실험실에선 위치 벡터를 아무 값으로 넣었지만, 원래 트랜스포머 논문은 이걸
        <b>사인(sin)·코사인(cos) 함수</b>로 만듭니다. 차원마다 <b>파동의 속도(주기)</b>를 다르게 해서요.
      </p>
      <MathBlock expr="PE(\text{pos}) = \big[\ \sin(\text{pos}),\ \cos(\text{pos}),\ \sin(\tfrac{\text{pos}}{4}),\ \dots\ \big]" />
      <p class="mb-2 text-sm text-slate-500">
        <b>사인(sin)·코사인(cos)</b> 은 각도를 넣으면 <b>−1 ~ 1 사이로 규칙적으로 출렁이는</b> 값이에요
        (파도처럼요). 자세히 몰라도 "위치마다 다른 물결값을 준다" 정도로 충분합니다.
      </p>
      <p class="mb-3">
        아래는 위치(0~15)에 따라 세 차원의 값이 어떻게 출렁이는지 그린 것입니다. 빠른 파동과 느린 파동을
        <b>섞으면</b>, 위치마다 <b>겹치지 않는 고유한 조합</b>이 만들어져요. 마치 <b>시계의 시침·분침·초침</b>
        위치를 함께 보면 시각이 딱 하나로 정해지는 것과 비슷해요.
      </p>
      <ChartView type="line" :data="sinCosChart" :height="240" />
      <div class="mt-3 rounded-lg bg-white px-4 py-3 text-sm text-slate-600">
        🎯 <b>사인·코사인의 장점</b>: ① 위치마다 값이 고유하고, ② 학습 때 못 본 <b>더 긴 문장</b>의 위치도
        같은 공식으로 자연스럽게 만들 수 있습니다. (요즘은 <b>학습되는 위치 임베딩</b>을 쓰기도 해요.)
      </div>
    </DetailsCard>

    <!-- ===== 3. AI 연결 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      3. 🤖 병렬 처리의 대가로 치르는 비용
      <ReviewFlag id="ch4-s3" chapter="ch4" label="3. AI 연결" />
    </h2>
    <ConceptCard tone="ai" title="트랜스포머가 위치 인코딩을 꼭 넣는 이유">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          옛 모델(RNN)은 단어를 <b>앞에서부터 하나씩 순서대로</b> 읽어서 순서를 <b>저절로</b> 알았습니다.
          대신 느렸죠.
        </li>
        <li>
          트랜스포머는 모든 단어를 <b>한꺼번에(병렬로)</b> 처리해 훨씬 빠르지만, 그 대가로 순서를
          <b>스스로 알지 못합니다</b>. 그래서 위치 인코딩으로 순서를 <b>따로 주입</b>해야 해요.
        </li>
        <li>
          방식은 두 가지: <b>고정된 사인·코사인</b>, 또는 <b>학습되는 위치 임베딩</b>.
        </li>
      </ul>
      <p class="mt-2 text-sm text-violet-900/80">
        이제 각 토큰 벡터에 <b>뜻 + 위치</b>가 모두 담겼습니다. 다음 칸(ch5 어텐션)에서 드디어
        단어들이 <b>서로를 참고</b>하기 시작합니다.
      </p>
    </ConceptCard>

    <!-- ===== 4. 문제 세트 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="위치 인코딩: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="단어가 같아도 순서가 다르면 문장의 뜻이 달라질 수 있다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 그래서 순서 정보(위치 인코딩)가 필요합니다."
      />
      <Quiz
        difficulty="easy"
        question="위치 인코딩(positional encoding)이 하는 일은?"
        :choices="[
          '각 토큰에 몇 번째 자리인지 순서 정보를 더한다',
          '단어의 뜻을 지운다',
          '토큰을 더 잘게 쪼갠다',
          '확률을 계산한다',
        ]"
        :answer="0"
        explanation="자리(위치) 정보를 벡터로 만들어 임베딩에 더해 줍니다."
      />
      <Quiz
        difficulty="easy"
        question="임베딩만으로도 단어의 '순서' 정보가 이미 들어 있다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 임베딩은 '뜻'만 담습니다. 순서는 위치 인코딩이 따로 넣어요."
      />
      <Quiz
        difficulty="easy"
        question="위치 정보는 임베딩과 어떻게 합쳐지나요?"
        :choices="['더한다', '뺀다', '알파벳순 정렬', '무작위로 섞는다']"
        :answer="0"
        explanation="위치 벡터를 임베딩에 더합니다(차원은 그대로 유지)."
      />

      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="위치 인코딩이 전혀 없다면, 트랜스포머는 '나 너 좋아해'와 '너 나 좋아해'를?"
        :choices="[
          '완벽히 구분한다',
          '구분하지 못한다 (같은 단어 뭉치로 봄)',
          '항상 첫 문장만 안다',
          '에러가 난다',
        ]"
        :answer="1"
        :hints="['어텐션은 단어들을 순서 없는 뭉치로 봅니다.']"
        explanation="순서 정보가 없으면 두 문장이 같은 벡터 뭉치라 구분 불가. 그래서 위치 인코딩이 필수."
      />
      <StepQuiz
        difficulty="medium"
        question="단어 임베딩이 (2, 1) 이고 그 자리의 위치 벡터가 (0.5, 0.3) 일 때, 최종 벡터를 단계별로 구하세요."
        :steps="[
          { lhs: '2 + 0.5', answer: 2.5, tolerance: 0.001 },
          { lhs: '1 + 0.3', answer: 1.3, tolerance: 0.001 },
        ]"
        :hints="['최종 벡터 = 단어 임베딩 + 위치 벡터 (성분끼리 더하기).']"
        explanation="(2+0.5, 1+0.3) = (2.5, 1.3). 자리마다 위치 벡터가 달라 최종 벡터가 달라집니다."
      />
      <Quiz
        difficulty="medium"
        question="위치 벡터를 더해도 최종 벡터의 차원(숫자 개수)은 변하지 않는다."
        type="truefalse"
        :answer="0"
        :hints="['같은 차원끼리 더하니까요.']"
        explanation="참입니다. 같은 차원의 벡터를 더하므로 차원은 그대로 유지됩니다."
      />
      <Quiz
        difficulty="medium"
        question="원래 트랜스포머 논문의 위치 인코딩은 주로 무엇으로 만드나요?"
        :choices="['사인·코사인 함수', '주사위', '알파벳 순서', '난수만']"
        :answer="0"
        :hints="['서로 다른 주기의 파동을 섞습니다.']"
        explanation="사인(sin)·코사인(cos) 함수로 만듭니다. 위치마다 고유한 조합이 생겨요."
      />

      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="트랜스포머가 (옛 RNN과 달리) 위치 인코딩을 꼭 넣어야 하는 근본 이유는?"
        :choices="[
          '단어를 순서대로가 아니라 한꺼번에(병렬로) 처리해서 순서를 스스로 모르기 때문',
          '단어 수가 너무 많아서',
          '한글만 지원해서',
          '위치 인코딩이 확률을 높여서',
        ]"
        :answer="0"
        :hints="['병렬 처리의 대가.']"
        explanation="병렬 처리를 하느라 순서를 저절로 알 수 없습니다. 그래서 위치를 따로 주입해야 해요."
      />
      <Quiz
        difficulty="hard"
        question="위치 인코딩을 만드는 대표적인 두 방식은?"
        :choices="[
          '고정된 사인·코사인 / 학습되는 위치 임베딩',
          '덧셈 / 뺄셈',
          '한글 / 영어',
          '큰 글씨 / 작은 글씨',
        ]"
        :answer="0"
        explanation="① 고정 사인·코사인, ② 데이터로 학습되는 위치 임베딩. 둘 다 순서를 심어 줍니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch4')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">4장 완료! 뜻 + 위치가 모두 담겼습니다</p>
      <p class="mt-1 text-sm text-emerald-700">
        입력 준비가 끝났어요(토큰화 → 임베딩 → 위치). 다음 챕터(ch5 어텐션의 직관)부터
        드디어 <b>트랜스포머의 심장</b>으로 들어갑니다. 노트북 <code>notebooks/ch04_positional.ipynb</code> 도 함께!
      </p>
    </div>
  </article>
</template>
