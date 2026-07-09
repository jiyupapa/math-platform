<script setup lang="ts">
// Phase 12 (심화·마지막) — 샘플링. 학습된 모델이 확률에서 다음 단어를 실제로 고르는 방법.
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import SamplingLab from '@/components/SamplingLab.vue'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { RouterLink } from 'vue-router'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch12')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 12 · 샘플링 (심화 · 마지막)</p>
    <h1 class="mb-4 text-3xl font-bold">샘플링 — 다음 단어를 고르는 법</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      출력층(ch9)이 다음 단어의 <b>확률 분포</b>를 줬습니다. 그런데 <b>실제로 어떤 단어를 고를까요?</b>
      늘 1등만 고르면 답이 뻔해지고, 마구잡이면 엉뚱해져요. 이 <b>고르는 방법</b>이 샘플링입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>greedy vs 샘플링</b>, 그리고 분포 모양을 바꾸는 <b>temperature</b>와 후보를 잘라내는
      <b>top-k · top-p</b>를 직접 조절하며, LLM의 답이 <b>딱딱해지거나 창의적</b>이 되는 이유를 이해합니다.
    </ConceptCard>

    <!-- ===== 1. greedy vs 샘플링 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      1. 1등만? 아니면 확률대로?
      <ReviewFlag id="ch12-s1" chapter="ch12" label="1. greedy vs 샘플링" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      가장 간단한 방법은 <b>greedy(탐욕적)</b> — 늘 <b>확률 1등</b> 단어를 고르는 것. 확실하지만
      <b>매번 똑같고 뻔한</b> 답이 나오죠. 대신 <b>확률에 따라 무작위로</b> 고르면(샘플링) 답이
      다양해집니다. 아래에서 <b>🎲 뽑기</b>를 여러 번 눌러 보세요.
    </p>

    <SamplingLab />

    <ConceptCard tone="note" title="새 용어: greedy · 샘플링">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>greedy(탐욕적) 디코딩</b> — 매 스텝 <b>확률이 가장 높은</b> 단어만 고르기. 결정적(항상 같은 답).</li>
        <li><b>샘플링(sampling)</b> — 확률 분포에 따라 <b>무작위로</b> 단어 고르기. 같은 질문에도 답이 달라집니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="확률에 따라 무작위로 단어를 고르면(샘플링), 같은 질문에도 답이 다양해질 수 있다."
      type="truefalse"
      :answer="0"
      explanation="맞아요. 그래서 LLM이 매번 조금씩 다른 답을 내놓기도 합니다."
    />

    <!-- ===== 2. temperature ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      2. temperature — 분포를 뾰족하게? 평평하게?
      <ReviewFlag id="ch12-s2" chapter="ch12" label="2. temperature" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      <b>temperature(온도)</b>는 소프트맥스 전에 점수를 <b>T로 나눠</b> 분포 모양을 바꿉니다
      (<MathBlock inline expr="\text{softmax}(z / T)" />). 왜 나누면 평평해질까요? —
      <b>큰 수로 나누면 점수들 사이의 차이가 줄어들기</b> 때문이에요. 차이가 줄면 확률도 고만고만해져 평평해집니다.
      ('온도'라 부르는 건, 온도가 높으면 입자가 활발히 움직이듯 <b>단어 선택도 활발(무작위)해진다</b>는 비유예요.)
    </p>
    <ul class="my-3 space-y-1.5 pl-1 text-sm text-slate-700">
      <li>🔹 <b>T &lt; 1 (낮음)</b> — 분포가 <b>뾰족</b>해짐. 1등에 더 쏠려 <b>안전·일관</b>되지만 뻔함. (T→0이면 greedy)</li>
      <li>🔹 <b>T = 1</b> — 원래 분포 그대로.</li>
      <li>🔹 <b>T &gt; 1 (높음)</b> — 분포가 <b>평평</b>해짐. 낮은 확률 단어도 잘 뽑혀 <b>다양·창의적</b>이지만 위험.</li>
    </ul>
    <p class="text-sm text-slate-500">위 실험실의 temperature 슬라이더를 좌우로 움직이며 막대 모양 변화를 확인하세요.</p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="temperature를 높이면(예: 1.5) 확률 분포는 어떻게 될까요?"
      :choices="[
        '더 평평해져 다양한 단어가 뽑힌다',
        '더 뾰족해져 1등만 뽑힌다',
        '항상 0이 된다',
        '아무 변화 없다',
      ]"
      :answer="0"
      :hints="['점수를 큰 수로 나누면 차이가 줄어듭니다.']"
      explanation="T를 높이면 분포가 평평해져 다양성이 커집니다(창의적이지만 엉뚱할 위험도)."
    />

    <!-- ===== 3. top-k / top-p ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      3. top-k · top-p — 엉뚱한 후보 잘라내기
      <ReviewFlag id="ch12-s3" chapter="ch12" label="3. top-k·top-p" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      temperature를 높이면 <b>말도 안 되는 단어</b>까지 뽑힐 수 있어요. 그래서 <b>후보를 미리 잘라</b>냅니다:
    </p>
    <ul class="my-3 space-y-1.5 pl-1 text-sm text-slate-700">
      <li>🔸 <b>top-k</b> — 확률 <b>상위 k개</b> 단어만 남기고 나머지는 버린 뒤, 그중에서 고름. (고정 개수)</li>
      <li>🔸 <b>top-p (뉴클리어스)</b> — 확률 높은 순으로 더해 <b>누적이 p(예: 0.9)</b>가 될 때까지의 단어만 후보로.
        (상황에 따라 <b>개수가 유동적</b>)</li>
    </ul>
    <p class="text-sm text-slate-500">
      위 실험실에서 <b>top-k ↔ top-p</b> 버튼을 눌러 방식을 바꿔 보세요. <b>top-k</b>의 k를 줄이거나
      <b>top-p</b>의 p를 줄이면 하위 단어들이 <b>잘림</b>으로 표시되며 후보에서 빠집니다. top-p는 옆에
      "지금 몇 개"가 함께 떠서, 분포에 따라 <b>후보 수가 달라지는</b> 걸 눈으로 볼 수 있어요.
    </p>

    <DetailsCard title="➕ 더 깊이 알아보기 — top-p 자세히 & 실전 팁">
      <p class="mb-1 font-semibold text-slate-800">top-k 와 top-p 의 차이</p>
      <p class="mb-2">
        <b>top-k</b>는 언제나 <b>정확히 k개</b>를 남깁니다. 그런데 모델이 아주 확신할 땐 1개면 충분하고,
        애매할 땐 여러 개가 필요하죠. <b>top-p</b>는 <b>누적 확률</b>로 자르기 때문에 이 상황에 맞춰
        <b>후보 수가 자동으로 늘었다 줄었다</b> 합니다. 그래서 실전에서 많이 씁니다.
      </p>
      <p class="mb-1 font-semibold text-slate-800">실전 팁 (T 대략)</p>
      <ul class="mb-2 list-disc space-y-1 pl-5 text-sm">
        <li><b>사실·코드·번역</b>: 낮은 T(≈0.0~0.3). 정확하고 일관되게.</li>
        <li><b>일반 대화</b>: 중간 T(≈0.7~1.0). 자연스럽고 적당히 다양하게.</li>
        <li><b>브레인스토밍·창작</b>: 높은 T(≈1.0~1.3) + top-p. 참신하게(가끔 엉뚱).</li>
      </ul>
      <div class="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">
        🎯 보통 <b>temperature + top-p</b>를 함께 씁니다: 온도로 다양성을 정하고, top-p로 헛소리를 걸러내요.
      </div>
    </DetailsCard>

    <!-- ===== 4. AI 연결 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      4. 🤖 그래서 같은 질문에도 답이 달라진다
      <ReviewFlag id="ch12-s4" chapter="ch12" label="4. AI 연결" />
    </h2>
    <ConceptCard tone="ai" title="설정 하나로 성격이 바뀐다">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          ChatGPT에 같은 질문을 해도 답이 <b>매번 조금씩 다른</b> 이유가 바로 이 <b>샘플링</b>입니다.
          temperature를 0으로 두면 거의 항상 같은 답이 나와요.
        </li>
        <li>
          "정확해야 하나, 창의적이어야 하나"에 따라 <b>temperature·top-p를 조절</b>합니다.
          같은 모델이라도 설정으로 <b>성격</b>이 달라지는 셈이죠.
        </li>
        <li>
          단, 확률이 그럴듯해 보여도 <b>사실이 아닐 수</b> 있습니다(환각). 샘플링은 "그럴듯함"을 고를 뿐,
          "진실"을 보장하진 않아요.
        </li>
      </ul>
    </ConceptCard>

    <!-- ===== 문제 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700"><b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.</p>

    <QuizSet title="샘플링 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="greedy(탐욕적) 디코딩은 매 스텝 확률이 가장 높은 단어를 고른다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 확실하지만 매번 같은(뻔한) 답이 나옵니다."
      />
      <Quiz
        difficulty="easy"
        question="확률에 따라 무작위로 단어를 고르는 방식을 무엇이라 하나요?"
        :choices="['샘플링(sampling)', '토큰화', '정규화', '역전파']"
        :answer="0"
        explanation="샘플링입니다. 같은 질문에도 답이 다양해집니다."
      />
      <Quiz
        difficulty="easy"
        question="temperature를 아주 낮추면(0에 가깝게) 사실상 greedy처럼 된다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 분포가 극단적으로 뾰족해져 거의 1등만 뽑힙니다."
      />
      <Quiz
        difficulty="easy"
        question="temperature를 '높이면' 분포는 어떻게 되나요?"
        :choices="['더 평평해진다(다양)', '더 뾰족해진다(1등만)', '사라진다', '음수가 된다']"
        :answer="0"
        explanation="평평해져 다양한 단어가 뽑힙니다. 창의적이지만 엉뚱할 위험도 커져요."
      />

      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="temperature 공식은 무엇을 하나요?"
        :choices="[
          '소프트맥스 전에 점수(logits)를 T로 나눈다',
          '점수에 T를 더한다',
          '단어를 T개로 쪼갠다',
          '확률을 T로 만든다',
        ]"
        :answer="0"
        :hints="['softmax(z / T).']"
        explanation="점수를 T로 나눕니다. T가 크면 차이가 줄어(평평), 작으면 차이가 커집니다(뾰족)."
      />
      <Quiz
        difficulty="medium"
        question="top-k 샘플링을 옳게 설명한 것은?"
        :choices="[
          '확률 상위 k개 단어만 남기고 그중에서 고른다',
          '확률 하위 k개만 고른다',
          '모든 단어를 똑같이 고른다',
          'k번째 단어만 고른다',
        ]"
        :answer="0"
        explanation="상위 k개만 후보로 남겨 엉뚱한 하위 단어를 걸러냅니다."
      />
      <Quiz
        difficulty="medium"
        question="top-p(뉴클리어스) 샘플링의 기준은?"
        :choices="[
          '누적 확률이 p가 될 때까지의 단어들만 후보로',
          '항상 정확히 p개 단어',
          '가장 긴 단어 p개',
          '무작위 p개',
        ]"
        :answer="0"
        :hints="['개수가 아니라 누적 확률 기준.']"
        explanation="누적 확률 p까지의 단어만 남깁니다. 상황에 따라 후보 수가 유동적이에요."
      />
      <Quiz
        difficulty="medium"
        question="정확한 사실이나 코드가 필요할 때 temperature 설정으로 더 나은 쪽은?"
        :choices="['낮게(예: 0~0.3)', '아주 높게(예: 2)', '항상 1.5', 'temperature는 상관없다']"
        :answer="0"
        :hints="['일관되고 안전한 답이 필요하죠.']"
        explanation="낮은 temperature가 일관되고 정확한 답에 유리합니다. 창작은 높게."
      />

      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="top-k 와 top-p 의 핵심 차이는?"
        :choices="[
          'top-k는 고정 개수, top-p는 누적확률 기준의 유동적 개수',
          '둘은 완전히 같다',
          'top-k는 확률을 더하고 top-p는 뺀다',
          'top-p는 항상 1개만 남긴다',
        ]"
        :answer="0"
        explanation="top-k=언제나 k개, top-p=누적확률 p까지라 개수가 상황에 맞춰 변합니다."
      />
      <Quiz
        difficulty="hard"
        question="샘플링(및 temperature)에 대한 설명으로 옳은 것은?"
        :choices="[
          '그럴듯한 단어를 고를 뿐, 사실(진실)을 보장하진 않는다',
          '항상 100% 정확한 답을 만든다',
          '확률을 무시한다',
          '학습을 다시 한다',
        ]"
        :answer="0"
        :hints="['환각(그럴듯한 거짓)을 떠올려 보세요.']"
        explanation="샘플링은 '그럴듯함'을 고르는 것이라, 그럴듯해도 틀릴 수 있습니다(환각)."
      />
    </QuizSet>

    <NotebookCard />

    <!-- ===== 시리즈 마무리 ===== -->
    <div
      v-if="progress.isDone('ch12')"
      class="mt-8 rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-6 text-center"
    >
      <div class="mb-2 text-4xl">🎉🎓🏁</div>
      <p class="text-lg font-bold text-indigo-800">전 과정 완주 — 트랜스포머 정복!</p>
      <p class="mx-auto mt-2 max-w-xl text-sm text-indigo-900/80">
        소프트맥스 한 조각에서 시작해, 토큰화·임베딩·위치·어텐션·블록·출력층을 거쳐, 학습과 샘플링까지 —
        <b>LLM의 처음부터 끝까지</b>를 손으로 만지며 이해했습니다. 이제 여러분은
        <b>"ChatGPT가 어떻게 돌아가는지"</b>를 스스로 설명할 수 있어요.
      </p>
      <p class="mt-3 text-sm font-medium text-indigo-800">
        🎯 궁극 목표 달성 — LLM은 "다음 단어를 확률로 고르는 기계", 그 핵심 부품이 트랜스포머.
      </p>
      <RouterLink to="/" class="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        처음으로 — 전체 여정 돌아보기
      </RouterLink>
    </div>

    <div v-else class="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
      위 10문제를 모두 풀면 <b>전 과정(Phase 0~12)</b>이 완료됩니다. 대응 노트북
      <code>notebooks/ch12_sampling.ipynb</code>에서 temperature·top-k·top-p를 직접 돌려 보세요!
    </div>
  </article>
</template>
