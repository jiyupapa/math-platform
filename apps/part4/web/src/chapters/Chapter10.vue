<script setup lang="ts">
// Phase 10 — 🎯 전체 조립 (궁극 목표). ch2~9의 모든 조각을 한 흐름으로 잇고, 반복으로 문장을 생성한다.
import { ref } from 'vue'
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import PipelineLab from '@/components/PipelineLab.vue'
import NextWordGame from '@/components/NextWordGame.vue'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { RouterLink } from 'vue-router'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()
const sentence = ref<string[]>(['나는'])

// 전체 여정 요약
const journey = [
  { ch: 'ch2', name: '토큰화', role: '글을 토큰(조각)으로 쪼개 숫자 ID로' },
  { ch: 'ch3', name: '임베딩', role: '토큰을 의미 담은 벡터(좌표)로' },
  { ch: 'ch4', name: '위치 인코딩', role: '순서 정보를 더함' },
  { ch: 'ch5', name: '어텐션 직관', role: '집중도로 문맥을 가중 평균' },
  { ch: 'ch6', name: 'Q·K·V', role: '점수 = Query·Key 내적으로 자동 계산' },
  { ch: 'ch7', name: '멀티헤드', role: '여러 관점으로 동시에' },
  { ch: 'ch8', name: '블록', role: '잔차·정규화·FFN으로 묶고 ×N 쌓기' },
  { ch: 'ch9', name: '출력층', role: 'logits → 소프트맥스 → 다음 단어 확률' },
]

function onSetComplete() {
  progress.markDone('ch10')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">10장 · 🎯 전체 조립 (궁극 목표)</p>
    <h1 class="mb-4 text-3xl font-bold">GPT가 문장을 쓰는 법 — 전부 이어보기</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      드디어 <b>궁극 목표</b>에 도착했습니다. 지금까지 만든 조각들(토큰화·임베딩·위치·어텐션·블록·출력층)을
      <b>한 흐름</b>으로 잇고, 그걸 <b>반복</b>하면 LLM이 글을 씁니다. 처음의 그 한 문장,
      <b>"LLM은 다음 단어를 확률로 고르는 기계"</b>가 이제 온전히 이해될 거예요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      입력 글이 <b>다음 단어</b>가 되기까지의 전 과정을 <b>한 눈에 조립</b>하고, 그 반복(자기회귀)으로
      문장이 생성되는 걸 확인합니다. <b>이 학습의 도착점</b>입니다.
    </ConceptCard>

    <!-- ===== 1. 파이프라인 한 번 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      1. 입력 글 → 다음 단어, 한 단계씩
      <ReviewFlag id="ch10-s1" chapter="ch10" label="1. 전체 파이프라인" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      아래 <b>"다음 단계 →"</b>를 눌러, "오늘 날씨가 정말"이 각 부품을 통과해 <b>다음 단어</b>가
      나오기까지를 하나씩 따라가 보세요. 각 단계는 앞에서 배운 챕터 그대로입니다.
    </p>

    <PipelineLab />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="입력 글이 다음 단어가 되기까지의 순서로 옳은 것은?"
      :choices="[
        '토큰화 → 임베딩 → 위치 → 어텐션·블록 → 출력층',
        '임베딩 → 토큰화 → 출력층 → 어텐션',
        '출력층 → 블록 → 임베딩 → 토큰화',
        '어텐션 → 토큰화 → 위치 → 임베딩',
      ]"
      :answer="0"
      :hints="['글을 먼저 쪼개야(토큰화) 숫자로 바꿀(임베딩) 수 있습니다.']"
      explanation="토큰화 → 임베딩 → 위치 → 어텐션·블록(×N) → 출력층 → 다음 단어 확률."
    />

    <!-- ===== 2. 반복 = 생성 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      2. 반복하면 문장이 된다 (자기회귀)
      <ReviewFlag id="ch10-s2" chapter="ch10" label="2. 자기회귀 생성" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      다음 단어 하나를 골랐으면, 그걸 문장에 붙이고 <b>위 파이프라인을 처음부터 다시</b> 돌립니다.
      마침표가 나올 때까지 반복하면 문장이 완성돼요. 아래에서 직접 이어 보세요
      (<RouterLink to="/ch/ch1" class="text-indigo-600 underline">ch1</RouterLink>의 그 게임이,
      이제 <b>속을 다 아는 상태</b>로 다시 보입니다).
    </p>

    <NextWordGame v-model="sentence" />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="다음 단어를 고른 뒤 문장에 붙이고, 파이프라인을 처음부터 다시 돌리는 방식을 무엇이라 하나요?"
      :choices="['자기회귀 생성', '토큰화', '정규화', '멀티헤드']"
      :answer="0"
      explanation="자기회귀(autoregressive) 생성입니다. 이 반복이 LLM이 글을 쓰는 방식이에요."
    />

    <!-- ===== 3. 정리 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      3. 🤖 그래서, LLM이란 무엇인가
      <ReviewFlag id="ch10-s3" chapter="ch10" label="3. LLM 총정리" />
    </h2>
    <ConceptCard tone="ai" title="한 문장으로">
      <p class="text-base">
        <b>LLM = "지금까지의 글을 보고, 다음 단어를 확률로 골라 이어붙이길 반복하는 기계"</b>,
        그리고 그 <b>다음 단어 확률을 계산하는 핵심 부품이 트랜스포머</b>입니다.
      </p>
      <p class="mt-2 text-sm text-violet-900/80">
        ChatGPT의 술술 나오는 답변도, 사실은 이 과정을 <b>수백~수천 번</b> 반복한 결과예요.
        거대해 보였던 AI가 사실은 하나씩 만져본 조각들의 <b>조립</b>이었던 겁니다.
      </p>
    </ConceptCard>

    <!-- 전체 여정 요약 -->
    <div class="my-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <p class="mb-3 text-sm font-semibold text-slate-600">📚 지금까지 지나온 길</p>
      <ol class="space-y-1.5">
        <li v-for="(j, i) in journey" :key="j.ch" class="flex items-start gap-2 text-sm">
          <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-100 text-xs font-bold text-indigo-700">{{ i + 1 }}</span>
          <span>
            <RouterLink :to="`/ch/${j.ch}`" class="font-medium text-indigo-700 hover:underline">{{ j.name }}</RouterLink>
            <span class="text-slate-500"> ({{ j.role }})</span>
          </span>
        </li>
      </ol>
      <p class="mt-3 text-sm font-medium text-slate-600">
        이 모두가 모여 → <b>다음 단어 예측</b> → 반복 → <b>문장 생성</b>. 🎉
      </p>
    </div>

    <DetailsCard title="➕ 더 깊이 알아보기: 여기서 더 나아가면">
      <ul class="mb-2 list-disc space-y-1.5 pl-5 text-sm">
        <li><b>GPT는 '디코더-only' 트랜스포머</b>입니다. 앞 단어만 보고 다음을 예측하도록
          뒤를 가리는(마스킹) 방식이라, 지금까지 배운 흐름이 곧 GPT의 뼈대예요.</li>
        <li><b>학습(ch11 예정)</b>: 이 모든 가중치(임베딩·Q·K·V·FFN…)는 처음엔 무작위입니다.
          엄청난 양의 글로 "다음 단어 맞히기"를 연습하며 <b>손실을 줄이는 방향</b>으로 조금씩 조정돼요.</li>
        <li><b>샘플링(ch12 예정)</b>: 확률에서 <b>어떻게 고르느냐</b>(temperature·top-k·top-p)에 따라
          답이 딱딱해지거나 창의적이 됩니다.</li>
      </ul>
      <div class="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">
        🎯 핵심 뼈대(추론)는 이 챕터로 <b>완성</b>. 심화(학습·샘플링)는 이 뼈대 위에 얹는 이야기예요.
      </div>
    </DetailsCard>

    <!-- ===== 종합 문제 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 종합 문제: 전체 복습</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      전 과정을 아우르는 <b>종합 10문제</b>입니다. 모두 맞히면 <b>궁극 목표 달성</b>! 🏁
    </p>

    <QuizSet title="전체 조립: 종합 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="LLM을 한 문장으로 요약하면 '다음 단어를 확률로 골라 이어붙이길 반복하는 기계'다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 그 다음 단어 확률을 계산하는 핵심 부품이 트랜스포머입니다."
      />
      <Quiz
        difficulty="easy"
        question="파이프라인에서 가장 먼저 하는 일은?"
        :choices="['토큰화', '출력층', '어텐션', '샘플링']"
        :answer="0"
        explanation="글을 토큰으로 쪼개는 토큰화가 첫 단계입니다."
      />
      <Quiz
        difficulty="easy"
        question="다음 단어를 고른 뒤, 그걸 붙여 처음부터 다시 예측하는 것을 자기회귀 생성이라 한다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 이 반복이 문장을 만들어 냅니다."
      />
      <Quiz
        difficulty="easy"
        question="점수(logits)를 다음 단어 확률로 바꾸는 장치는?"
        :choices="['소프트맥스', '토큰화', '잔차연결', '멀티헤드']"
        :answer="0"
        explanation="소프트맥스. 파이프라인 맨 끝 출력층에서 씁니다."
      />

      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="'임베딩'과 '위치 인코딩'의 역할을 옳게 짝지은 것은?"
        :choices="[
          '임베딩=뜻을 벡터로 / 위치 인코딩=순서 정보를 더함',
          '임베딩=순서 / 위치 인코딩=뜻',
          '둘 다 토큰을 쪼갠다',
          '둘 다 확률을 만든다',
        ]"
        :answer="0"
        explanation="임베딩은 의미, 위치 인코딩은 순서를 담당합니다."
      />
      <Quiz
        difficulty="medium"
        question="어텐션(ch5·6)의 핵심을 한 줄로 옳게 말한 것은?"
        :choices="[
          '집중도(Q·K로 계산, 합 1)로 다른 단어들의 Value를 가중 평균',
          '단어를 알파벳순 정렬',
          '토큰 수를 줄이기',
          '확률을 2로 만들기',
        ]"
        :answer="0"
        explanation="Query·Key로 점수 → 소프트맥스 집중도 → Value 가중합. 트랜스포머의 심장."
      />
      <Quiz
        difficulty="medium"
        question="잔차연결·층정규화가 하는 근본적 역할은?"
        :choices="[
          '깊게 쌓아도 신호가 소멸/폭발하지 않게 해 학습을 가능하게 함',
          '단어를 번역함',
          '토큰 ID를 매김',
          '확률의 합을 0으로 만듦',
        ]"
        :answer="0"
        explanation="깊은 트랜스포머를 안정적으로 학습하게 해 주는 장치들입니다."
      />
      <Quiz
        difficulty="medium"
        question="멀티헤드 어텐션이 여러 헤드를 쓰는 이유는?"
        :choices="[
          '한 번에 여러 종류의 관계(관점)를 잡으려고',
          '토큰을 쪼개려고',
          '확률을 없애려고',
          '순서를 무시하려고',
        ]"
        :answer="0"
        explanation="헤드마다 다른 관계에 특화돼, 다양한 문맥을 동시에 포착합니다."
      />

      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="다음 중 '트랜스포머 블록 하나'의 구성으로 옳은 것은?"
        :choices="[
          '(멀티헤드 어텐션 + Add&Norm) + (피드포워드 + Add&Norm)',
          '토큰화 + 임베딩',
          '소프트맥스 + 출력층만',
          '위치 인코딩 4번',
        ]"
        :answer="0"
        explanation="어텐션과 FFN 각각을 잔차연결+층정규화로 감싼 것이 블록 하나입니다."
      />
      <Quiz
        difficulty="hard"
        question="워밍업에서 배운 '소프트맥스'는 트랜스포머의 어디에서 쓰이나요?"
        :choices="[
          '어텐션의 집중도 만들기 + 출력층의 다음 단어 확률',
          '토큰화에서만',
          '위치 인코딩에서만',
          '어디에도 안 쓰인다',
        ]"
        :answer="0"
        :hints="['입구(어텐션)와 출구(출력층) 양쪽.']"
        explanation="소프트맥스는 어텐션 집중도와 출력층 확률, 두 곳에서 핵심으로 쓰입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch10')"
      class="mt-8 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-6 text-center"
    >
      <div class="mb-2 text-4xl">🎓🏁</div>
      <p class="text-lg font-bold text-emerald-800">궁극 목표 달성: 트랜스포머를 이해했습니다!</p>
      <p class="mx-auto mt-2 max-w-lg text-sm text-emerald-700">
        토큰 하나가 벡터가 되고, 서로를 참고하고, 블록을 지나, 다음 단어의 확률이 되기까지,
        <b>LLM의 속을 처음부터 끝까지</b> 따라왔습니다. 이제 ChatGPT를 봐도 "아, 저건 다음 단어를
        확률로 고르는 거지"라고 말할 수 있어요.
      </p>
      <p class="mt-3 text-sm text-emerald-700">
        더 나아가고 싶다면 → <b>ch11 학습</b>(모델은 어떻게 똑똑해지나) ·
        <b>ch12 샘플링</b>(다음 단어를 고르는 여러 방법). 노트북
        <code>notebooks/ch10_full_assembly.ipynb</code>에서 <b>미니 트랜스포머</b>를 직접 돌려 보세요!
      </p>
    </div>
  </article>
</template>
