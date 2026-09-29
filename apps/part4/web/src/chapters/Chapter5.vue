<script setup lang="ts">
// Phase 5 — 어텐션의 직관. "어디에 집중할까"를 정해 문맥을 가중 평균으로 섞는다.
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import AttentionLab from '@/components/AttentionLab.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch5')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">5장 · 어텐션의 직관</p>
    <h1 class="mb-4 text-3xl font-bold">어텐션 — "어디에 집중할까"</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      드디어 트랜스포머의 <b>심장</b>입니다. 한 단어의 뜻을 제대로 알려면 <b>문맥</b>이 필요해요.
      "강아지가 공을 물었다"에서 <b>"물었다"</b>가 무슨 상황인지 알려면 <b>누가(강아지)</b>,
      <b>무엇을(공)</b> 봐야 하죠. 어텐션은 각 단어가 <b>어떤 단어를 얼마나 참고할지</b>를 정합니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      어텐션의 핵심 직관인 <b>"집중도(가중치)를 정해 문맥을 가중 평균으로 섞는다"</b>를
      슬라이더로 직접 조절하며 이해합니다. (점수를 정하는 정확한 방법 Q·K·V 는 다음 챕터에서)
    </ConceptCard>

    <!-- ===== 1. 문맥이 필요하다 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      1. 단어는 이웃을 봐야 뜻이 완성된다
      <ReviewFlag id="ch5-s1" chapter="ch5" label="1. 문맥과 집중" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      "그 <b>사과</b>는 빨갛다"의 "그것", "은행에 갔다"의 "은행"(돈? 나무?). 단어 하나만 보면 애매합니다.
      어텐션은 각 단어가 다른 단어들에 <b>집중도(가중치)</b>를 나눠 주고, 그만큼 <b>참고</b>해서 뜻을 정해요.
      아래에서 질문 단어를 고르고 <b>관련성 점수를 드래그</b>해 보세요.
    </p>

    <AttentionLab />

    <ConceptCard tone="note" title="새 용어 세 개">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>어텐션(attention)</b>: 각 단어가 <b>다른 단어들을 얼마나 참고할지</b> 정해서 문맥을 반영하는 장치.</li>
        <li><b>어텐션 가중치 / 집중도(attention weight)</b>: "얼마나 참고할지"의 정도. <b>모두 더하면 1</b>(소프트맥스).</li>
        <li><b>가중 평균(weighted average)</b>: 그냥 평균이 아니라, <b>중요한 것에 더 큰 몫</b>을 줘서 섞은 평균.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="한 단어의 뜻을 제대로 파악하려면 문맥(주변 단어)을 참고해야 할 때가 많다."
      type="truefalse"
      :answer="0"
      explanation="맞아요. 그래서 어텐션이 '어디를 볼지'를 정해 문맥을 반영합니다."
    />

    <!-- ===== 2. 소프트맥스 + 가중 평균 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      2. 집중도(합 1) → 가중 평균으로 섞기
      <ReviewFlag id="ch5-s2" chapter="ch5" label="2. 가중 평균" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      점수(관련성)는 그대로 쓰지 않고, <b>소프트맥스</b>(워밍업!)로 <b>합이 1인 집중도</b>로 바꿉니다.
      그런 다음 각 단어의 벡터를 그 집중도만큼 섞어요. 이게 <b>가중 평균</b>입니다.
    </p>
    <MathBlock expr="\text{문맥} = w_1 v_1 + w_2 v_2 + \dots \quad (\textstyle\sum w_i = 1,\ w = \text{softmax}(\text{점수}))" />
    <p class="mt-1 text-sm text-slate-500">
      <MathBlock inline expr="v_i" /> = <MathBlock inline expr="i" />번째 단어 벡터,
      <MathBlock inline expr="w_i" /> = 그 단어에 주는 집중도. 집중도가 큰 단어일수록 결과에 많이 반영됩니다.
    </p>
    <p class="mt-1 text-sm text-slate-500">
      🔑 <MathBlock inline expr="\textstyle\sum" /> 는 <b>시그마</b>라고 읽고 <b>"전부 더하라"</b>는 기호예요.
      즉 <MathBlock inline expr="\textstyle\sum w_i = 1" /> 은 "집중도를 다 더하면 1(=100%)"이라는 뜻.
      <b>소프트맥스</b>는 (워밍업에서 배웠듯) <b>점수를 합이 1인 비율로 눌러 주는 장치</b>입니다.
    </p>

    <ConceptCard tone="tip" title="이미 배운 소프트맥스가 여기서!">
      워밍업의 소프트맥스가 바로 이 <b>집중도 만들기</b>에 쓰입니다. 점수가 커도 음수여도,
      소프트맥스가 <b>합 1의 집중도</b>로 바꿔 주니 안심하고 섞을 수 있어요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="집중도(어텐션 가중치)를 만들 때 쓰는 장치는 무엇일까요?"
      :choices="['소프트맥스', '토큰화', '위치 인코딩', '난수 생성기']"
      :answer="0"
      :hints="['점수를 합 1의 확률처럼 바꾸는 것.']"
      explanation="소프트맥스입니다. 관련성 점수를 합 1의 집중도로 바꿔 가중 평균에 씁니다."
    />

    <!-- ===== 심화 ===== -->
    <DetailsCard title="➕ 더 깊이 알아보기: 점수는 누가 정하나? (셀프 어텐션 예고)">
      <p class="mb-2">
        실험실에선 관련성 점수를 <b>손으로</b> 정했지만, 실제로는 모델이
        <b>단어 벡터끼리 비교</b>해서 스스로 점수를 매깁니다. 두 단어 벡터가 <b>잘 맞을수록</b> 높은 점수예요.
      </p>
      <p class="mb-2">
        이때 문장이 <b>자기 자신 안에서</b> 서로를 참고하기 때문에 <b>셀프 어텐션(self-attention)</b>이라
        부릅니다. 질문 단어도 <b>자기 자신</b>을 참고 대상에 포함해요(그래서 실험실에서 자기 점수도 있었죠).
      </p>
      <div class="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">
        🎯 "어떻게 비교해서 점수를 내는가?"가 바로 다음 챕터의 <b>Q·K·V</b>(질문·열쇠·값)입니다.
        여기선 <b>"집중도로 가중 평균"</b>이라는 큰 그림만 확실히 잡으면 충분해요.
      </div>
    </DetailsCard>

    <!-- ===== 3. AI 연결 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      3. 🤖 어텐션이 트랜스포머를 특별하게 만든다
      <ReviewFlag id="ch5-s3" chapter="ch5" label="3. AI 연결" />
    </h2>
    <ConceptCard tone="ai" title="멀리 있는 단어도 한 번에 연결">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          어텐션 덕분에 문장 <b>맨 앞 단어와 맨 뒤 단어</b>도 <b>한 번에</b> 서로를 참고할 수 있습니다.
          "그것(it)이 무엇을 가리키나" 같은 <b>먼 거리 관계</b>도 잡아내죠.
        </li>
        <li>
          이 "집중도로 문맥 섞기"를 트랜스포머는 <b>층마다 여러 번</b> 반복하며 뜻을 점점 정교하게 다듬습니다.
        </li>
        <li>
          바로 이 어텐션이 <b>"Attention Is All You Need"</b>라는 논문 제목처럼, 트랜스포머의 <b>핵심</b>입니다.
        </li>
      </ul>
      <p class="mt-2 text-sm text-violet-900/80">
        다음 칸(ch6)에서 "점수를 어떻게 계산하나"를 <b>Q·K·V</b>로 파고듭니다.
      </p>
    </ConceptCard>

    <!-- ===== 4. 문제 세트 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 가중 평균 계산이 나오니 위 공식을 참고하세요.
    </p>

    <QuizSet title="어텐션의 직관: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="어텐션은 각 단어가 '다른 단어들을 얼마나 참고할지'를 정하는 장치다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 그 참고 정도가 '집중도(어텐션 가중치)'입니다."
      />
      <Quiz
        difficulty="easy"
        question="어텐션 가중치(집중도)를 모두 더하면 얼마가 될까요?"
        :choices="['0', '1 (=100%)', '단어 수만큼', '항상 2']"
        :answer="1"
        :hints="['소프트맥스로 만들었죠.']"
        explanation="1(=100%)입니다. 소프트맥스가 합 1로 만들어 줍니다."
      />
      <Quiz
        difficulty="easy"
        question="집중도가 큰 단어일수록 최종 결과(문맥)에 더 많이 반영된다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 그래서 '가중' 평균이에요. 중요한 것에 더 큰 몫을 줍니다."
      />
      <Quiz
        difficulty="easy"
        question="'가중 평균(weighted average)'을 가장 잘 설명한 것은?"
        :choices="[
          '그냥 다 더해 개수로 나눈 것',
          '각 값에 가중치(몫)를 곱해 더한 것, 중요한 것에 더 큰 몫',
          '가장 큰 값만 고른 것',
          '무작위로 하나 고른 것',
        ]"
        :answer="1"
        explanation="가중 평균은 중요도(가중치)만큼 반영해 섞은 평균입니다."
      />

      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="집중도가 [0.5, 0.3, 0.2] 이고 세 단어의 값이 [10, 20, 30] 일 때, 가중 평균을 단계별로 구하세요."
        :steps="[
          { lhs: '0.5 \\times 10', answer: 5, tolerance: 0.001 },
          { lhs: '0.3 \\times 20', answer: 6, tolerance: 0.001 },
          { lhs: '0.2 \\times 30', answer: 6, tolerance: 0.001 },
          { lhs: '5 + 6 + 6', answer: 17 },
        ]"
        :hints="['각 값 × 그 집중도.', '그 결과들을 모두 더하면 가중 평균.']"
        explanation="0.5·10 + 0.3·20 + 0.2·30 = 5+6+6 = 17. 집중도가 큰 쪽으로 값이 끌립니다."
      />
      <Quiz
        difficulty="medium"
        question="관련성 점수가 [높음, 낮음, 낮음] 이면, 섞인 문맥은 대체로 어느 쪽을 닮을까요?"
        :choices="['첫 번째 단어', '두 번째 단어', '세 단어의 정확히 한가운데', '아무 관계 없음']"
        :answer="0"
        :hints="['집중도가 큰 단어가 결과를 끌고 갑니다.']"
        explanation="점수가 높은 첫 단어의 집중도가 커서, 결과가 그 단어 쪽으로 기웁니다."
      />
      <Quiz
        difficulty="medium"
        question="어텐션에서 점수(관련성)를 그대로 쓰지 않고 소프트맥스를 거치는 이유는?"
        :choices="[
          '점수를 합 1의 집중도로 만들어 가중 평균에 쓰려고',
          '점수를 지우려고',
          '단어를 쪼개려고',
          '순서를 바꾸려고',
        ]"
        :answer="0"
        explanation="합 1의 집중도(확률처럼)로 만들어야 안정적으로 가중 평균을 낼 수 있습니다."
      />
      <Quiz
        difficulty="medium"
        question="문장 맨 앞 단어와 맨 뒤 단어는 어텐션으로 서로 직접 참고할 수 없다."
        type="truefalse"
        :answer="1"
        :hints="['어텐션은 모든 단어 쌍을 한 번에 연결합니다.']"
        explanation="거짓입니다. 어텐션은 거리와 상관없이 어떤 두 단어든 직접 연결할 수 있어요."
      />

      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="문장이 '자기 자신 안에서' 단어끼리 서로 참고하는 어텐션을 무엇이라 부를까요?"
        :choices="['셀프 어텐션(self-attention)', '토큰화', '드롭아웃', '풀링']"
        :answer="0"
        :hints="['자기(self) 안에서 참고.']"
        explanation="셀프 어텐션입니다. 다음 챕터의 Q·K·V 로 그 점수를 계산합니다."
      />
      <Quiz
        difficulty="hard"
        question="어텐션이 트랜스포머에서 갖는 위상으로 가장 옳은 것은?"
        :choices="[
          '있으면 좋은 보조 장치일 뿐',
          '문맥을 반영하는 트랜스포머의 핵심 장치',
          '토큰화를 대신한다',
          '확률을 1로 고정한다',
        ]"
        :answer="1"
        explanation="'Attention Is All You Need' 논문 제목처럼, 어텐션은 트랜스포머의 핵심입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch5')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">5장 완료! 어텐션의 직관을 잡았습니다</p>
      <p class="mt-1 text-sm text-emerald-700">
        "집중도로 문맥을 가중 평균"이 핵심이에요. 다음 챕터(ch6)에서 그 집중도를
        <b>Q·K·V</b>로 어떻게 계산하는지 파고듭니다. 노트북 <code>notebooks/ch05_attention_intuition.ipynb</code> 도 함께!
      </p>
    </div>
  </article>
</template>
