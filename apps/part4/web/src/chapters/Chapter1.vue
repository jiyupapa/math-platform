<script setup lang="ts">
// Phase 1 — 트랜스포머 큰 그림. "LLM은 다음 단어 맞히기 게임"이라는 전체 흐름을 조망한다.
// 세부(토큰화·임베딩·어텐션…)는 ch2~10에서 확대. 여기선 "무엇을 하는지"만 새가 내려다보듯.
import { ref } from 'vue'
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import NextWordGame from '@/components/NextWordGame.vue'
import TransformerMap from '@/components/TransformerMap.vue'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// NextWordGame 과 v-model 로 공유하는 "지금까지 만든 문장"
const sentence = ref<string[]>(['나는'])

function onSetComplete() {
  progress.markDone('ch1')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 1 · 트랜스포머 큰 그림</p>
    <h1 class="mb-4 text-3xl font-bold">LLM은 거대한 "다음 단어 맞히기" 게임</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      트랜스포머 내부를 뜯기 전에, 먼저 <b>새가 하늘에서 내려다보듯</b> 전체 흐름을 봅니다.
      각 부품이 "무엇을 하는지"만 짚고, "어떻게" 하는지는 다음 챕터들에서 하나씩 확대합니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      ChatGPT 같은 <b>LLM</b>이 사실은 <b>"다음에 올 단어를 확률로 골라 이어붙이는 일"</b>을
      반복하는 기계임을 이해합니다. 이 챕터는 <b>큰 그림</b>만 — 세부는 ch2부터.
    </ConceptCard>

    <!-- ===== 1. 직관: 다음 단어 맞히기 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      1. 한 단어씩 이어붙이며 문장이 자란다
      <ReviewFlag id="ch1-s1" chapter="ch1" label="1. 다음 단어 맞히기" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      LLM은 문장을 <b>통째로</b> 뱉지 않습니다. <b>다음에 올 단어 하나</b>를 확률로 고르고,
      그 단어를 문장 뒤에 붙인 다음, <b>늘어난 문장을 다시 처음부터 읽어</b> 그다음 단어를 또 고릅니다.
      이 과정을 <b>마침표(문장 끝 신호)</b>가 나올 때까지 반복하죠.
    </p>
    <p class="mt-2 leading-relaxed text-slate-700">
      아래에서 후보 단어를 눌러 직접 문장을 완성해 보세요. 각 후보 옆의 <b>%</b>는
      (샘플 챕터에서 배운) 소프트맥스가 매긴 확률입니다.
    </p>

    <NextWordGame v-model="sentence" />

    <ConceptCard tone="note" title="새 용어: 자기회귀 (autoregressive)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>이름</b>: 자기회귀 (autoregressive, 오토리그레시브)</li>
        <li><b>읽는 법</b>: "자기회귀" / "오토리그레시브"</li>
        <li><b>뜻</b>: <b>자기가 방금 만든 단어를 다시 입력으로 되먹여</b> 다음 단어를 만드는 방식.
          "자기(auto) + 되돌아감(regressive)". LLM이 글을 쓰는 기본 원리입니다.</li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="tip" title="지금 만든 문장">
      현재 문장은 <b>"{{ sentence.filter((w) => w !== '.').join(' ') }}"</b>
      <span v-if="sentence[sentence.length - 1] === '.'"> — 마침표까지 나와 완성됐어요.</span>
      <span v-else> — 아직 만드는 중입니다.</span>
      단어 <b>{{ sentence.filter((w) => w !== '.').length }}개</b>를 이어붙였네요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="LLM은 문장 전체를 한 번에 통째로 만들어 낸다."
      type="truefalse"
      :answer="1"
      explanation="거짓입니다. 다음 단어 하나를 고르고 → 붙이고 → 다시 예측, 이걸 반복합니다(자기회귀)."
    />

    <!-- ===== 2. 전체 파이프라인 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      2. 그 "다음 단어"는 어떻게 정해질까 — 전체 파이프라인
      <ReviewFlag id="ch1-s2" chapter="ch1" label="2. 전체 파이프라인" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      위 게임에선 확률을 그냥 보여줬지만, 실제로 그 확률이 나오기까지 글은 여러 <b>부품(칸)</b>을
      차례로 통과합니다. 이 흐름 전체를 <b>파이프라인(pipeline)</b>이라고 불러요 —
      <b>공장 컨베이어벨트</b>처럼 재료가 칸을 하나씩 지나며 다듬어지는 것.
    </p>

    <div class="my-5">
      <TransformerMap />
    </div>

    <p class="leading-relaxed text-slate-700">각 칸이 하는 일을 한 줄로 미리 보면(세부는 표시된 챕터에서):</p>
    <ul class="my-3 space-y-1.5 pl-1 text-sm text-slate-700">
      <li>🔹 <b>토큰화</b> — 글을 <b>토큰</b>(단어·글자 조각)으로 쪼갠다. <span class="text-slate-400">(ch2)</span></li>
      <li>🔹 <b>임베딩</b> — 각 토큰을 <b>의미를 담은 숫자 벡터</b>(좌표)로 바꾼다. <span class="text-slate-400">(ch3)</span></li>
      <li>🔹 <b>위치 인코딩</b> — "몇 번째 단어인지" <b>순서 정보</b>를 더한다. <span class="text-slate-400">(ch4)</span></li>
      <li>🔹 <b>어텐션</b> — 단어들이 <b>서로를 얼마나 참고할지</b> 정한다. <span class="text-slate-400">(ch5·6)</span></li>
      <li>🔹 <b>피드포워드</b> — 참고한 정보를 <b>한 번 더 가공</b>한다. <span class="text-slate-400">(ch8)</span></li>
      <li>🔹 <b>출력층</b> — 마지막 점수를 <b>소프트맥스로 확률화</b>해 다음 단어를 고른다. <span class="text-slate-400">(ch9·10)</span></li>
    </ul>

    <ConceptCard tone="note" title="새 용어 세 개">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>토큰(token)</b> — 글을 쪼갠 <b>조각</b>. 단어일 수도, 단어의 일부일 수도. (ch2에서 자세히)</li>
        <li><b>임베딩(embedding)</b> — 토큰을 <b>숫자 벡터</b>로 바꾼 것. 뜻이 비슷하면 좌표도 가깝다. (ch3)</li>
        <li><b>파이프라인(pipeline)</b> — 입력이 여러 단계를 <b>차례로 통과</b>하는 처리 흐름.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="글이 트랜스포머에 들어가 가장 먼저 거치는 단계는 무엇일까요?"
      :choices="['어텐션', '토큰화 (글을 조각으로 쪼개기)', '출력층', '소프트맥스']"
      :answer="1"
      :hints="['컨베이어벨트의 맨 앞을 떠올려 보세요.']"
      explanation="가장 먼저 글을 토큰으로 쪼갭니다. 그다음 임베딩 → … → 출력층 순서로 흐릅니다."
    />

    <!-- ===== 3. AI 연결 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      3. 🤖 이게 바로 ChatGPT가 답을 쓰는 방식
      <ReviewFlag id="ch1-s3" chapter="ch1" label="3. AI 연결" />
    </h2>
    <ConceptCard tone="ai" title="한 단어씩, 끝까지">
      <p>
        ChatGPT가 긴 답변을 술술 써 내려가는 것도, 사실은 방금 게임처럼
        <b>다음 단어 하나를 확률로 고르고 이어붙이길 수백 번 반복</b>하는 것입니다.
        답이 <b>한 글자씩 흘러나오는</b> 것처럼 보이는 이유죠.
      </p>
      <p class="mt-2">
        이때 "가장 확률 높은 단어"만 늘 고르면 답이 <b>뻔하고 단조로워</b>집니다. 그래서 실제로는
        확률에 따라 <b>살짝 무작위로</b> 고르기도 해요 — 같은 질문에 매번 조금씩 다른 답이 나오는 이유입니다.
        (고르는 방법은 Phase 12에서 자세히.)
      </p>
    </ConceptCard>

    <DetailsCard title="➕ 더 깊이 알아보기 — 왜 한 단어씩 만들까?">
      <p class="mb-2">
        문장을 통째로 만들려면 "이 문장 전체가 얼마나 그럴듯한가"를 한 번에 판단해야 하는데,
        가능한 문장의 수가 <b>천문학적</b>이라 사실상 불가능합니다. 반면 <b>다음 단어 하나</b>만
        고르는 문제는 훨씬 다루기 쉽죠(후보는 사전 크기, 예: 5만 개).
      </p>
      <p class="mb-2">
        그래서 트랜스포머는 <b>어려운 문제(문장 생성)를 쉬운 문제(다음 단어 예측)의 반복</b>으로 바꿉니다.
        매 단계 <b>지금까지의 문장 전체</b>를 다시 읽고 다음 한 단어를 고르는데, 이때 "앞 단어들을 얼마나
        참고할지"를 정하는 게 바로 <b>어텐션</b>(ch5·6)입니다.
      </p>
      <div class="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">
        🎯 <b>한 컷 비유</b>: 소설을 통째로 구상하지 않고, <b>바로 다음 단어</b>만 계속 떠올리며 써 내려가는 작가.
      </div>
    </DetailsCard>

    <!-- ===== 4. 문제 세트 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      큰 그림을 잡았는지 확인해 봅시다. <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 막히면 힌트를 누르세요.
    </p>

    <QuizSet title="트랜스포머 큰 그림 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="LLM은 '다음에 올 단어'를 확률로 골라 문장을 만든다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 다음 단어를 확률로 고르는 일의 반복이 LLM의 핵심."
      />
      <Quiz
        difficulty="easy"
        question="LLM이 문장을 만드는 방식으로 옳은 것은?"
        :choices="[
          '문장 전체를 한 번에 완성한다',
          '다음 단어 하나를 고르고, 붙인 뒤 다시 예측하기를 반복한다',
          '단어들을 무작위로 섞는다',
          '미리 저장해 둔 문장을 그대로 꺼낸다',
        ]"
        :answer="1"
        explanation="한 단어 고르기 → 붙이기 → 다시 예측. 이 반복이 자기회귀입니다."
      />
      <Quiz
        difficulty="easy"
        question="트랜스포머는 문장 전체를 한 번에 통째로 뱉는다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 한 단어씩 이어붙입니다."
      />
      <Quiz
        difficulty="easy"
        question="'자기회귀(autoregressive)'의 뜻으로 가장 옳은 것은?"
        :choices="[
          '자기가 방금 낸 단어를 다시 입력으로 넣어 다음 단어를 만드는 것',
          '스스로 전원을 끄는 것',
          '문장을 거꾸로 읽는 것',
          '정답을 미리 아는 것',
        ]"
        :answer="0"
        :hints="['auto(자기) + regressive(되돌아감).']"
        explanation="방금 만든 단어를 되먹여 다음을 만드는 방식이 자기회귀입니다."
      />

      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="글이 트랜스포머에 들어가 가장 먼저 거치는 단계는?"
        :choices="['임베딩', '토큰화', '어텐션', '출력층']"
        :answer="1"
        :hints="['파이프라인(컨베이어벨트)의 맨 앞.']"
        explanation="토큰화(글을 조각으로 쪼개기)가 첫 단계입니다."
      />
      <Quiz
        difficulty="medium"
        question="'임베딩'이 하는 일로 옳은 것은?"
        :choices="[
          '단어를 의미가 담긴 숫자 벡터로 바꾼다',
          '문장을 짧게 요약한다',
          '확률을 계산한다',
          '단어의 순서를 뒤섞는다',
        ]"
        :answer="0"
        :hints="['뜻이 비슷하면 좌표(벡터)도 가까워집니다.']"
        explanation="임베딩은 토큰을 의미 벡터(숫자 좌표)로 바꿉니다. (ch3에서 자세히)"
      />
      <Quiz
        difficulty="medium"
        question="샘플 챕터에서 배운 소프트맥스는, 이 큰 그림에서 어느 칸이 하는 일에 쓰일까요?"
        :choices="['토큰화', '위치 인코딩', '출력층 (점수를 확률로)', '임베딩']"
        :answer="2"
        :hints="['점수를 확률로 바꾸는 곳.']"
        explanation="출력층에서 소프트맥스가 점수(로짓)를 확률로 바꿔 다음 단어를 고릅니다."
      />
      <Quiz
        difficulty="medium"
        question="다음 단어 하나를 고른 직후, 모델이 하는 일은?"
        :choices="[
          '작업을 끝낸다',
          '고른 단어를 문장에 붙이고, 늘어난 문장으로 다시 다음 단어를 예측한다',
          '고른 단어를 지운다',
          '확률을 모두 0으로 만든다',
        ]"
        :answer="1"
        explanation="붙이고 → 다시 예측. 마침표가 나올 때까지 이 반복이 이어집니다."
      />

      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="파이프라인 순서로 올바르게 나열한 것은?"
        :choices="[
          '토큰화 → 임베딩 → 어텐션 → 출력층',
          '임베딩 → 토큰화 → 출력층 → 어텐션',
          '어텐션 → 토큰화 → 임베딩 → 출력층',
          '출력층 → 어텐션 → 임베딩 → 토큰화',
        ]"
        :answer="0"
        :hints="['글을 먼저 쪼개야(토큰화) 숫자로 바꿀(임베딩) 수 있습니다.']"
        explanation="쪼개고(토큰화) → 숫자화(임베딩) → 서로 참고(어텐션) → 확률화(출력층)."
      />
      <Quiz
        difficulty="hard"
        question="LLM에 같은 질문을 해도 매번 답이 조금씩 다를 수 있는 이유로 가장 옳은 것은?"
        :choices="[
          '모델이 매번 새로 학습하기 때문',
          '다음 단어를 확률에 따라 살짝 무작위로 고르기도 하기 때문',
          '인터넷 속도가 달라서',
          '문장을 통째로 외워 두기 때문',
        ]"
        :answer="1"
        :hints="['항상 1등만 고르면 답이 뻔해지겠죠.']"
        explanation="확률 분포에서 살짝 무작위로 고르면 매번 조금씩 다른 답이 나옵니다. (Phase 12에서 자세히)"
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch1')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 1 완료 — 큰 그림을 잡았습니다</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음 챕터(ch2 토큰화)부터 이 파이프라인의 칸을 하나씩 확대합니다.
        대응 노트북 <code>notebooks/ch01_big_picture.ipynb</code> 에서 자기회귀 생성을 직접 돌려보세요.
      </p>
    </div>
  </article>
</template>
