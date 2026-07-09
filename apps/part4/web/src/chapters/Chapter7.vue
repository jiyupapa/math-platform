<script setup lang="ts">
// Phase 7 — 멀티헤드 어텐션. 어텐션을 여러 개(헤드) 동시에 = 여러 관점.
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import MultiHeadLab from '@/components/MultiHeadLab.vue'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch7')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 7 · 멀티헤드 어텐션</p>
    <h1 class="mb-4 text-3xl font-bold">멀티헤드 어텐션 — 여러 관점으로 동시에</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      어텐션 하나(<b>헤드 하나</b>)는 보통 <b>한 종류의 관계</b>에 집중합니다. 그런데 언어에는
      "누가–무엇을", "무엇을–꾸미는", "언제" 같은 <b>여러 관계가 동시에</b> 있죠. 그래서 어텐션을
      <b>여러 개 나란히</b> 돌립니다 — 이게 멀티헤드 어텐션입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>여러 헤드가 각기 다른 곳에 집중</b>하고, 그 결과를 <b>이어붙여(concat)</b> 합친다는
      멀티헤드 어텐션의 그림을 직접 보며 이해합니다.
    </ConceptCard>

    <!-- ===== 1. 여러 관점 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      1. 헤드마다 다른 곳을 본다
      <ReviewFlag id="ch7-s1" chapter="ch7" label="1. 여러 관점" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      아래는 같은 문장을 보는 <b>두 헤드</b>입니다. 질문 단어를 <b>"물었다"</b>로 두면,
      <b>헤드 1</b>은 <b>강아지(주어)</b>에, <b>헤드 2</b>는 <b>공(목적어)</b>에 집중해요.
      같은 단어라도 <b>서로 다른 관계</b>를 잡아내는 겁니다.
    </p>

    <MultiHeadLab />

    <ConceptCard tone="note" title="새 용어: 헤드 · 멀티헤드 어텐션">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>헤드(head)</b> — 어텐션 <b>계산 한 벌</b>. 각 헤드는 <b>자기만의 Q·K·V</b>(가중치)를 가져
          서로 다른 관계에 집중합니다.</li>
        <li><b>멀티헤드 어텐션(multi-head attention)</b> — 이런 헤드를 <b>여러 개 동시에</b> 돌리고,
          결과를 합치는 방식.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="여러 헤드는 각자 서로 다른 종류의 관계(관점)에 집중할 수 있다."
      type="truefalse"
      :answer="0"
      explanation="맞아요. 그래서 한 문장에서 주어-동사, 목적어-동사 같은 여러 관계를 동시에 잡습니다."
    />

    <!-- ===== 2. 이어붙이기 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      2. 결과를 이어붙여(concat) 합친다
      <ReviewFlag id="ch7-s2" chapter="ch7" label="2. concat과 혼합" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      각 헤드는 <b>자기 출력 벡터</b>를 냅니다. 이들을 <b>나란히 이어붙인(concat)</b> 뒤,
      <b>마지막 선형층</b>(가중치 <MathBlock inline expr="W_O" />)으로 한 번 더 섞어 최종 출력을 만듭니다.
      (<b>선형층</b> = 숫자들을 <b>곱하고 더해 새 숫자로 섞어 주는</b> 한 단계. 여기선 이어붙인 값들을 버무리는 역할.)
      여러 전문가의 의견을 모아 <b>종합 보고서</b>를 쓰는 셈이에요.
    </p>
    <MathBlock expr="\text{MultiHead} = \text{Concat}(\text{head}_1, \dots, \text{head}_h)\, W_O" />
    <p class="mt-1 text-sm text-slate-500">
      <MathBlock inline expr="\text{Concat}" /> = 이어붙이기, <MathBlock inline expr="\text{head}_i" /> =
      <MathBlock inline expr="i" />번째 헤드의 출력, <MathBlock inline expr="W_O" /> = 마지막에 섞어 주는 학습된 가중치.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="여러 헤드의 출력들은 어떻게 하나로 합쳐질까요?"
      :choices="[
        '이어붙인(concat) 뒤 선형층으로 한 번 더 섞는다',
        '가장 큰 헤드 하나만 남기고 버린다',
        '평균 내서 0으로 만든다',
        '순서를 뒤집는다',
      ]"
      :answer="0"
      :hints="['여러 전문가 의견을 모아 종합하는 것.']"
      explanation="모든 헤드 출력을 이어붙인 뒤 W_O 로 섞어 최종 출력을 만듭니다."
    />

    <!-- ===== 심화 ===== -->
    <DetailsCard title="➕ 더 깊이 알아보기 — 헤드가 많아도 계산량이 폭증하지 않는 이유">
      <p class="mb-2">
        헤드를 8개 쓴다고 계산량이 8배가 되진 않습니다. 비결은 <b>차원을 나눠 갖기</b>예요.
        전체 벡터 차원 <MathBlock inline expr="d" /> 를 헤드 수 <MathBlock inline expr="h" /> 로 나눠,
        각 헤드는 <b>작은 차원</b> <MathBlock inline expr="d/h" /> 만 담당합니다.
      </p>
      <ul class="mb-2 list-disc space-y-1 pl-5 text-sm">
        <li>예: 모델 차원 <b>512</b>, 헤드 <b>8개</b> → 각 헤드는 <b>64</b>차원.</li>
        <li>작은 어텐션 8개의 총합 ≈ 큰 어텐션 1개 수준의 계산량. 대신 <b>관점은 8배 다양</b>해집니다.</li>
      </ul>
      <div class="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">
        🎯 <b>핵심</b>: "하나를 크게"보다 "<b>여러 개를 작게</b>"가 더 똑똑합니다 —
        같은 예산으로 <b>다양한 관계</b>를 동시에 보니까요.
      </div>
    </DetailsCard>

    <!-- ===== 3. AI 연결 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      3. 🤖 헤드마다 전문 분야가 생긴다
      <ReviewFlag id="ch7-s3" chapter="ch7" label="3. AI 연결" />
    </h2>
    <ConceptCard tone="ai" title="실제 모델의 헤드들">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          학습이 끝나면 헤드마다 <b>전문 분야</b>가 생깁니다. 어떤 헤드는 <b>문법 관계</b>(주어–동사),
          어떤 헤드는 <b>대명사가 가리키는 대상</b>, 어떤 헤드는 <b>바로 앞 단어</b>에 집중하는 식이죠.
        </li>
        <li>
          모든 헤드가 <b>병렬로</b> 계산돼 속도 손해가 거의 없고, 표현력은 크게 늘어납니다.
        </li>
        <li>
          GPT 같은 모델은 보통 <b>수십 개의 헤드</b>를, 그것도 <b>여러 층</b>에 걸쳐 사용합니다.
        </li>
      </ul>
      <p class="mt-2 text-sm text-violet-900/80">
        다음 칸(ch8)은 이 어텐션 덩어리를 <b>잔차연결·층정규화·피드포워드</b>와 묶어
        하나의 <b>트랜스포머 블록</b>으로 완성합니다.
      </p>
    </ConceptCard>

    <!-- ===== 4. 문제 세트 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="멀티헤드 어텐션 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="멀티헤드 어텐션은 어텐션(헤드)을 여러 개 동시에 돌리는 방식이다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 여러 헤드가 각기 다른 관점으로 문장을 봅니다."
      />
      <Quiz
        difficulty="easy"
        question="'헤드(head)' 하나는 무엇인가요?"
        :choices="['어텐션 계산 한 벌(자기만의 Q·K·V)', '단어 하나', '토큰 ID', '확률 값']"
        :answer="0"
        explanation="헤드는 자기만의 Q·K·V로 도는 어텐션 한 벌입니다."
      />
      <Quiz
        difficulty="easy"
        question="헤드 하나만으로는 부족할 수 있는 이유로 옳은 것은?"
        :choices="[
          '언어에는 동시에 여러 종류의 관계가 있어서',
          '헤드가 너무 비싸서',
          '단어가 하나뿐이라서',
          '소프트맥스를 못 써서',
        ]"
        :answer="0"
        explanation="한 헤드는 보통 한 관계에 집중. 여러 관계를 동시에 잡으려면 여러 헤드가 필요합니다."
      />
      <Quiz
        difficulty="easy"
        question="여러 헤드의 결과는 하나만 남기고 나머지는 버린다."
        type="truefalse"
        :answer="1"
        :hints="['이어붙인다는 걸 떠올려 보세요.']"
        explanation="거짓입니다. 모든 헤드 출력을 이어붙인(concat) 뒤 섞어서 다 활용합니다."
      />

      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="여러 헤드의 출력을 합치는 방법은?"
        :choices="[
          '이어붙인(concat) 뒤 선형층으로 섞는다',
          '서로 뺀다',
          '가장 작은 것만 고른다',
          '알파벳순 정렬한다',
        ]"
        :answer="0"
        explanation="Concat 후 W_O(선형층)로 섞어 최종 출력을 만듭니다."
      />
      <Quiz
        difficulty="medium"
        question="헤드1 출력이 (0.7, 0.3), 헤드2 출력이 (0.2, 0.8) 일 때, 이어붙이면(concat) 숫자가 총 몇 개인 벡터가 되나요?"
        type="numeric"
        :answer="4"
        :hints="['2개 + 2개.']"
        explanation="[0.7, 0.3, 0.2, 0.8] → 숫자 4개. 이어붙이면 길이가 합쳐집니다."
      />
      <Quiz
        difficulty="medium"
        question="모든 헤드는 완전히 똑같은 Q·K·V(가중치)를 공유한다."
        type="truefalse"
        :answer="1"
        :hints="['달라야 서로 다른 관점을 볼 수 있겠죠.']"
        explanation="거짓입니다. 각 헤드는 자기만의 Q·K·V 가중치를 가져 서로 다른 곳을 봅니다."
      />
      <Quiz
        difficulty="medium"
        question="모델 차원이 512이고 헤드가 8개일 때, 한 헤드가 담당하는 차원은? (512 ÷ 8)"
        type="numeric"
        :answer="64"
        :hints="['전체 차원을 헤드 수로 나눕니다.']"
        explanation="512 ÷ 8 = 64. 각 헤드는 작은 차원(64)을 맡아, 총 계산량이 크게 늘지 않습니다."
      />

      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="멀티헤드가 표현력을 높이는 핵심 이유는?"
        :choices="[
          '서로 다른 종류의 관계를 동시에 포착할 수 있어서',
          '단어를 더 잘게 쪼개서',
          '확률을 항상 1로 만들어서',
          '순서를 무시해서',
        ]"
        :answer="0"
        explanation="헤드마다 다른 관계에 특화돼, 한 번에 여러 관점의 문맥을 잡습니다."
      />
      <Quiz
        difficulty="hard"
        question="헤드 수를 늘려도 총 계산량이 폭증하지 않는 이유로 가장 옳은 것은?"
        :choices="[
          '전체 차원을 헤드 수로 나눠 각 헤드가 작은 차원을 맡기 때문',
          '헤드가 계산을 안 하기 때문',
          '소프트맥스가 계산을 없애서',
          '토큰이 줄어서',
        ]"
        :answer="0"
        :hints="['512 → 64씩 8조각.']"
        explanation="차원을 나눠 갖기 때문에, 작은 어텐션 여럿의 합이 큰 어텐션 하나 수준이 됩니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch7')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 7 완료 — 여러 관점을 한 번에</p>
      <p class="mt-1 text-sm text-emerald-700">
        어텐션 조각은 이제 다 모였어요. 다음 챕터(ch8)에서 <b>잔차연결·층정규화·피드포워드</b>와 묶어
        하나의 <b>트랜스포머 블록</b>을 완성합니다. 노트북 <code>notebooks/ch07_multihead.ipynb</code> 도 함께!
      </p>
    </div>
  </article>
</template>
