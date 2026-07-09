<script setup lang="ts">
// Phase 8 — 트랜스포머 블록. 어텐션을 잔차연결·층정규화·피드포워드와 묶어 한 블록으로.
import ConceptCard from '@/components/ConceptCard.vue'
import DetailsCard from '@/components/DetailsCard.vue'
import MathBlock from '@/components/MathBlock.vue'
import BlockLab from '@/components/BlockLab.vue'
import Quiz from '@/components/Quiz.vue'
import StepQuiz from '@/components/StepQuiz.vue'
import QuizSet from '@/components/QuizSet.vue'
import NotebookCard from '@/components/NotebookCard.vue'
import ReviewFlag from '@/components/ReviewFlag.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch8')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 8 · 트랜스포머 블록</p>
    <h1 class="mb-4 text-3xl font-bold">트랜스포머 블록 — 조각을 하나로 묶기</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      멀티헤드 어텐션만으로는 <b>깊게 쌓기</b>가 어렵습니다. 여기에 세 부품 —
      <b>잔차연결 · 층정규화 · 피드포워드</b> — 을 더해 하나의 <b>블록</b>을 만들고,
      그 블록을 <b>여러 번 쌓아</b> 트랜스포머를 완성합니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      트랜스포머 블록을 이루는 세 부품이 <b>각각 왜 필요한지</b>를 직관 비유와 실험으로 이해하고,
      블록이 어떻게 <b>조립·반복</b>되는지 그림으로 잡습니다.
    </ConceptCard>

    <!-- ===== 1. 잔차연결 + 층정규화 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      1. 깊게 쌓으려면 — 잔차연결 & 층정규화
      <ReviewFlag id="ch8-s1" chapter="ch8" label="1. 잔차연결·층정규화" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      층을 많이 쌓으면 신호가 <b>사라지거나 폭발</b>해 학습이 안 됩니다. 두 장치가 이를 막아요:
    </p>
    <ul class="my-3 space-y-1.5 pl-1 text-sm text-slate-700">
      <li>🛣️ <b>잔차연결(residual)</b> — 서브층의 <b>입력을 출력에 다시 더함</b>
        (<MathBlock inline expr="\text{출력} = \text{입력} + f(\text{입력})" />). 여기서
        <MathBlock inline expr="f(\text{입력})" /> 은 "입력을 <b>서브층(어텐션·FFN)에 통과시킨 결과</b>"라는 뜻이에요.
        <b>고속도로</b>처럼 원래 정보(신호)가 층을 건너뛰어 곧장 흐릅니다.</li>
      <li>📏 <b>층정규화(layer norm)</b> — 벡터 값의 <b>크기를 일정 범위로 맞춤</b>.
        <b>눈금 맞추기</b>처럼 값이 너무 커지거나 작아지지 않게 안정화합니다.</li>
    </ul>
    <p class="leading-relaxed text-slate-700">
      아래에서 층 수를 늘려 보고, 두 장치를 껐다 켜 보세요. <b>둘 다 끄면 소멸, 잔차만 켜면 폭발,
      층정규화까지 켜면 안정</b>입니다.
    </p>

    <BlockLab />

    <ConceptCard tone="note" title="새 용어 둘">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>잔차연결 / 스킵연결(residual/skip connection)</b> — 입력을 출력에 <b>더해</b> 지름길을 내는 것.</li>
        <li><b>층정규화(layer normalization)</b> — 벡터의 값 분포를 <b>일정하게</b> 맞춰 학습을 안정화하는 것.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="잔차연결(residual)이 하는 일로 옳은 것은?"
      :choices="[
        '서브층의 입력을 출력에 다시 더한다 (지름길)',
        '단어를 반으로 자른다',
        '확률을 계산한다',
        '토큰을 정렬한다',
      ]"
      :answer="0"
      :hints="['고속도로/지름길을 떠올려 보세요.']"
      explanation="출력 = 입력 + f(입력). 원래 정보와 기울기가 곧장 흐르게 해 깊은 학습을 돕습니다."
    />

    <!-- ===== 2. 피드포워드 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      2. 피드포워드 — 단어별로 한 번 더 생각
      <ReviewFlag id="ch8-s2" chapter="ch8" label="2. 피드포워드" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      어텐션이 <b>단어들 사이</b>에 정보를 섞었다면, <b>피드포워드(FFN)</b>는 <b>각 단어를 따로따로</b>
      한 번 더 가공합니다. 작은 신경망(보통 넓혔다 다시 줄이는 2단 구조)을 <b>토큰마다 독립적으로</b> 적용해요.
    </p>
    <ConceptCard tone="tip" title="어텐션 vs 피드포워드">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>어텐션</b> = 단어들 <b>사이</b>의 정보 섞기 (누구를 참고할까).</li>
        <li><b>피드포워드</b> = 각 단어 <b>혼자</b> 재가공 (섞어 받은 정보를 정리·변환).</li>
      </ul>
      <p class="mt-1 text-sm">둘이 번갈아 작동하며 뜻을 점점 정교하게 다듬습니다.</p>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="피드포워드(FFN)는 각 단어(토큰)를 따로따로 처리한다."
      type="truefalse"
      :answer="0"
      explanation="맞아요. 단어 사이를 섞는 건 어텐션, 각 단어를 혼자 재가공하는 건 FFN입니다."
    />

    <!-- ===== 3. 블록 조립 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      3. 블록으로 조립하고, 여러 번 쌓기
      <ReviewFlag id="ch8-s3" chapter="ch8" label="3. 블록 조립" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      세 부품을 이렇게 묶으면 <b>트랜스포머 블록</b> 하나입니다. 각 서브층(어텐션·FFN)은
      <b>잔차연결 + 층정규화</b>로 감싸요(Add &amp; Norm).
    </p>

    <div class="my-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div class="mx-auto flex max-w-xs flex-col items-center gap-1.5 text-center text-sm">
        <div class="text-xs text-slate-400">입력 (뜻 + 위치 벡터)</div>
        <div class="text-slate-300">↓</div>
        <div class="w-full rounded-lg border border-indigo-200 bg-indigo-50 py-2 font-medium text-indigo-800">멀티헤드 어텐션</div>
        <div class="w-full rounded-lg border border-slate-200 bg-white py-1.5 text-xs text-slate-500">＋ Add &amp; Norm (잔차연결 + 층정규화)</div>
        <div class="text-slate-300">↓</div>
        <div class="w-full rounded-lg border border-emerald-200 bg-emerald-50 py-2 font-medium text-emerald-800">피드포워드 (FFN)</div>
        <div class="w-full rounded-lg border border-slate-200 bg-white py-1.5 text-xs text-slate-500">＋ Add &amp; Norm (잔차연결 + 층정규화)</div>
        <div class="text-slate-300">↓</div>
        <div class="text-xs text-slate-400">출력 → 다음 블록으로</div>
      </div>
      <p class="mt-4 text-center text-sm font-medium text-slate-600">
        이 블록을 <b>× N번 반복</b> (GPT는 수십 개!) 쌓으면 트랜스포머 본체가 됩니다.
      </p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="트랜스포머는 이런 블록을 딱 한 번만 쓴다."
      type="truefalse"
      :answer="1"
      :hints="['GPT는 수십 개의 블록을 쌓습니다.']"
      explanation="거짓입니다. 같은 구조의 블록을 여러 층(수십 개) 쌓아 올립니다."
    />

    <DetailsCard title="➕ 더 깊이 알아보기 — FFN이 사실 파라미터의 대부분">
      <p class="mb-2">
        피드포워드는 보통 차원을 <b>4배로 넓혔다가</b>(예: 512 → 2048) 다시 <b>원래로 줄입니다</b>.
        이 넓은 중간층 때문에, 트랜스포머 <b>파라미터의 약 2/3</b> 가 사실 FFN 에 있습니다.
      </p>
      <p class="mb-2">
        넓혔다 줄이는 사이에 <b>비선형 함수</b>(ReLU/GELU)를 끼워, 단순한 직선 변환으로는 못 만드는
        <b>복잡한 패턴</b>을 학습합니다. 어텐션이 "무엇을 볼지"라면, FFN 은 "본 것을 어떻게 해석할지"예요.
      </p>
      <div class="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">
        🎯 그래서 요즘 큰 모델의 "지식"은 상당 부분 <b>FFN 안에</b> 저장돼 있다고들 말합니다.
      </div>
    </DetailsCard>

    <!-- ===== AI 연결 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      4. 🤖 왜 이렇게까지 깊게 쌓나
      <ReviewFlag id="ch8-s4" chapter="ch8" label="4. AI 연결" />
    </h2>
    <ConceptCard tone="ai" title="깊이가 지능을 만든다">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          층을 쌓을수록 <b>단순한 특징 → 복잡한 의미</b>로 표현이 정교해집니다. 앞 층은 단어·구,
          뒤 층은 문장·논리 수준의 관계를 잡는 식이죠.
        </li>
        <li>
          <b>잔차연결</b> 덕분에 수십~수백 층도 <b>학습이 가능</b>해졌습니다 — 트랜스포머 이전엔 이렇게
          깊은 신경망을 안정적으로 훈련하기 어려웠어요.
        </li>
        <li>
          GPT 계열은 이 블록을 <b>수십 개</b> 쌓습니다. "모델을 키운다"는 말은 대개 <b>블록(층)과 차원을
          늘린다</b>는 뜻이에요.
        </li>
      </ul>
      <p class="mt-2 text-sm text-violet-900/80">
        블록을 다 통과한 벡터는 이제 <b>출력층</b>(ch9)으로 가서 <b>다음 단어의 확률</b>이 됩니다.
      </p>
    </ConceptCard>

    <!-- ===== 문제 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700"><b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.</p>

    <QuizSet title="트랜스포머 블록 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="잔차연결(residual)은 서브층의 입력을 출력에 다시 더하는 지름길이다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 출력 = 입력 + f(입력). 정보와 기울기가 곧장 흐릅니다."
      />
      <Quiz
        difficulty="easy"
        question="층정규화(layer norm)가 하는 일로 옳은 것은?"
        :choices="[
          '벡터 값의 크기를 일정 범위로 맞춰 안정화한다',
          '단어를 쪼갠다',
          '토큰을 삭제한다',
          '순서를 뒤집는다',
        ]"
        :answer="0"
        explanation="값이 너무 커지거나 작아지지 않게 눈금을 맞춰 학습을 안정화합니다."
      />
      <Quiz
        difficulty="easy"
        question="피드포워드(FFN)는 각 단어(토큰)를 따로따로 처리한다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 단어 사이 섞기는 어텐션, 각 단어 재가공은 FFN입니다."
      />
      <Quiz
        difficulty="easy"
        question="트랜스포머는 블록을 딱 한 번만 쓰고 쌓지 않는다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 같은 블록을 여러 층(수십 개) 쌓습니다."
      />

      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="잔차연결이 없으면 층을 깊게 쌓을 때 흔히 생기는 문제는?"
        :choices="[
          '신호/기울기가 사라지거나 폭발해 학습이 안 된다',
          '단어 수가 늘어난다',
          '토큰 ID가 바뀐다',
          '확률의 합이 2가 된다',
        ]"
        :answer="0"
        :hints="['실험실에서 잔차/정규화를 껐을 때를 떠올려 보세요.']"
        explanation="깊은 망에서 신호가 소멸/폭발하기 쉬운데, 잔차연결과 정규화가 이를 막아 줍니다."
      />
      <Quiz
        difficulty="medium"
        question="어텐션과 피드포워드의 역할 차이로 옳은 것은?"
        :choices="[
          '어텐션=단어들 사이 정보 섞기 / FFN=각 단어 따로 재가공',
          '둘 다 똑같은 일을 한다',
          '어텐션은 토큰화, FFN은 임베딩',
          'FFN이 단어들을 섞고 어텐션은 각 단어를 따로 본다',
        ]"
        :answer="0"
        explanation="어텐션은 토큰 간 정보 교환, FFN은 토큰별 독립 변환입니다."
      />
      <StepQuiz
        difficulty="medium"
        question="잔차연결: 입력이 (2, 1) 이고 서브층 출력이 (0.5, 0.3) 일 때, 더한 결과(출력 = 입력 + f)를 단계별로 구하세요."
        :steps="[
          { lhs: '2 + 0.5', answer: 2.5, tolerance: 0.001 },
          { lhs: '1 + 0.3', answer: 1.3, tolerance: 0.001 },
        ]"
        :hints="['입력 벡터에 서브층 출력을 성분끼리 더합니다.']"
        explanation="(2+0.5, 1+0.3) = (2.5, 1.3). 입력이 출력에 그대로 더해져 '지름길'이 됩니다."
      />
      <Quiz
        difficulty="medium"
        question="한 트랜스포머 블록 안의 순서로 옳은 것은?"
        :choices="[
          '어텐션 → Add&Norm → 피드포워드 → Add&Norm',
          '피드포워드 → 어텐션 → 토큰화',
          '출력층 → 어텐션 → 임베딩',
          '층정규화만 4번',
        ]"
        :answer="0"
        explanation="어텐션과 FFN 각각을 잔차연결+층정규화(Add&Norm)로 감쌉니다."
      />

      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="잔차연결을 '고속도로'에 비유하는 이유로 가장 옳은 것은?"
        :choices="[
          '원래 정보와 기울기가 층을 건너뛰어 곧장 흐르게 해줘서',
          '자동차가 지나가서',
          '단어를 빠르게 지워서',
          '확률을 높여서',
        ]"
        :answer="0"
        explanation="입력을 더해 주니 신호가 층을 우회해 곧장 전달 → 깊은 망도 학습됩니다."
      />
      <Quiz
        difficulty="hard"
        question="트랜스포머를 '깊게' 쌓는 것이 중요한 이유로 가장 옳은 것은?"
        :choices="[
          '층이 깊을수록 단순한 특징에서 복잡한 의미로 표현이 정교해져서',
          '층이 많으면 토큰이 줄어서',
          '깊이는 아무 상관이 없어서',
          '깊으면 확률이 항상 1이 돼서',
        ]"
        :answer="0"
        explanation="앞 층은 단어·구, 뒤 층은 문장·논리 수준을 잡는 식으로 깊이가 표현력을 키웁니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch8')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 8 완료 — 블록이 완성됐습니다 🧱</p>
      <p class="mt-1 text-sm text-emerald-700">
        어텐션 + 잔차 + 정규화 + FFN = 트랜스포머 블록. 이제 이 블록들을 통과한 벡터를
        <b>다음 단어 확률</b>로 바꿀 차례예요(ch9 출력층). 노트북 <code>notebooks/ch08_transformer_block.ipynb</code> 도 함께!
      </p>
    </div>
  </article>
</template>
