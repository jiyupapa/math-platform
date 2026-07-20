<script setup lang="ts">
// Phase 6 — Q·K·V & 셀프 어텐션 (핵심). 어텐션 점수를 Query·Key 내적으로 계산한다.
import { ConceptCard } from '@series/ui'
import { PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import QKVLab from '@/components/QKVLab.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch6')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 6 · Q·K·V & 셀프 어텐션 (핵심)</p>
    <h1 class="mb-4 text-3xl font-bold">Q·K·V — 점수를 스스로 계산하기</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      앞 챕터에서 어텐션의 직관을 잡았지만, <b>관련성 점수를 우리가 손으로</b> 넣었죠.
      실제 모델은 이 점수를 <b>스스로 계산</b>합니다. 그 비결이 각 단어가 만드는 세 벡터 —
      <b>Query(질문) · Key(열쇠) · Value(값)</b> 입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      각 단어에서 뽑은 <b>Q·K·V</b>로 어텐션이 <b>점수 → 집중도 → 출력</b>을 어떻게 자동 계산하는지,
      슬라이더로 Query 를 움직이며 이해합니다. 이게 트랜스포머의 <b>가장 핵심</b>이에요.
    </ConceptCard>

    <!-- ===== 1. Q·K·V 세 벡터 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      1. 도서관 비유 — 질문·열쇠·값
      <ReviewFlag id="ch6-s1" chapter="ch6" label="1. Q·K·V 비유" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      도서관에서 책을 찾는다고 해봐요. 내 <b>검색어</b>가 <b>Query(질문)</b>, 각 책의 <b>제목표(라벨)</b>가
      <b>Key(열쇠)</b>, 책의 <b>실제 내용</b>이 <b>Value(값)</b> 입니다. 검색어와 제목표가 <b>잘 맞을수록</b>
      그 책 내용을 많이 가져오죠. 어텐션도 똑같습니다.
    </p>

    <QKVLab />

    <ConceptCard tone="note" title="새 용어: Query · Key · Value">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>Query(쿼리, 질문)</b> — 이 단어가 <b>찾고 있는 것</b>. "나는 이런 걸 참고하고 싶어."</li>
        <li><b>Key(키, 열쇠)</b> — 각 단어가 <b>내세우는 이름표</b>. Query 와 얼마나 맞는지 비교 대상.</li>
        <li><b>Value(밸류, 값)</b> — 그 단어가 <b>실제로 전달할 내용</b>. 최종적으로 섞이는 재료.</li>
      </ul>
      <p class="mt-2 text-sm text-slate-500">
        세 벡터는 모두 <b>단어 임베딩에서</b> 만들어집니다(자세한 방법은 아래 "더 깊이").
      </p>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="ch5에서 손으로 정하던 '관련성 점수'를, ch6에서는 Query 와 Key 로 자동 계산한다."
      type="truefalse"
      :answer="0"
      explanation="맞아요. 점수 = Query·Key(내적). 손으로 안 넣어도 벡터끼리 비교해 저절로 나옵니다."
    />

    <!-- ===== 2. 점수 = 내적, 전체 공식 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      2. 점수 = Q·K 내적 → 소프트맥스 → Value 가중합
      <ReviewFlag id="ch6-s2" chapter="ch6" label="2. 어텐션 공식" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      점수는 <b>Query 와 Key 의 내적(dot product)</b>으로 냅니다. 내적은
      <b>두 벡터를 성분끼리 곱해서 더한 값</b>이에요. 두 벡터가 <b>비슷한 방향</b>일수록 커집니다
      (= 잘 맞음 = 높은 집중).
    </p>
    <MathBlock expr="Q \cdot K = q_1 k_1 + q_2 k_2 + \dots" />
    <p class="mt-1 text-sm text-slate-500">
      여기서 대문자 <MathBlock inline expr="Q" /> 는 <b>벡터 전체</b>, 소문자 <MathBlock inline expr="q_1" /> 은
      그 벡터의 <b>첫 번째 숫자</b>예요(<MathBlock inline expr="q_2" /> 는 둘째). 같은 자리끼리 곱해 더하는 거죠.
    </p>
    <p class="leading-relaxed text-slate-700">
      이제 문장 전체로 확장할게요 — <b>Q·K·V 각각은 단어 하나의 벡터가 아니라, 문장 속 모든 단어의
      Query·Key·Value 벡터를 세로로 쌓은 묶음(행렬)</b>입니다. 그러면 전체 어텐션이 한 줄로 이렇게 써져요:
    </p>
    <MathBlock expr="\text{Attention}(Q,K,V) = \text{softmax}\!\left(\dfrac{Q K^\top}{\sqrt{d}}\right) V" />
    <ConceptCard tone="note" title="공식 뜯어 읽기 (처음 보는 작은 기호까지)">
      <ul class="list-disc space-y-1.5 pl-5 text-sm">
        <li><MathBlock inline expr="Q K^\top" /> — 모든 Query 와 Key 의 <b>내적(점수)</b> 표.
          작은 <MathBlock inline expr="\top" />(위첨자 T)는 <b>전치</b>라고 읽고, 표의 <b>가로·세로를 뒤집어</b>
          곱셈이 맞아떨어지게 맞춰 주는 표시예요.</li>
        <li><MathBlock inline expr="\div \sqrt{d}" /> — <b>스케일링</b>(점수가 너무 커지지 않게 나눔).
          <MathBlock inline expr="\sqrt{\;}" /> 는 <b>제곱근(루트)</b>, <MathBlock inline expr="d" /> 는
          <b>벡터의 차원(숫자 개수)</b>입니다. (자세한 이유는 아래 "더 깊이")</li>
        <li><MathBlock inline expr="\text{softmax}(\cdots)" /> — 점수를 <b>합 1의 집중도</b>로.</li>
        <li><MathBlock inline expr="\cdots\, V" /> — 그 집중도로 <b>Value 들을 가중합</b> → 출력(새 문맥 벡터).</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="어텐션 점수(관련성)는 무엇으로 계산할까요?"
      :choices="['Query 와 Key 의 내적', '두 단어의 글자 수 차이', 'Value 를 반으로 나눈 값', '토큰 ID의 합']"
      :answer="0"
      :hints="['검색어와 제목표를 맞춰보는 것.']"
      explanation="Query·Key 내적입니다. 크면 잘 맞는 것 → 높은 집중도."
    />

    <!-- ===== 심화 ===== -->
    <DetailsCard title="➕ 더 깊이 알아보기 — Q·K·V는 어디서 오고, 왜 √d로 나눌까?">
      <p class="mb-1 font-semibold text-slate-800">① Q·K·V 의 출생</p>
      <p class="mb-3">
        세 벡터는 <b>단어 임베딩</b>에 <b>학습된 가중치 행렬</b> 세 개(<MathBlock inline expr="W_Q, W_K, W_V" />)를
        각각 곱해서 만듭니다: <MathBlock inline expr="Q = x W_Q,\ K = x W_K,\ V = x W_V" />.
        이 <MathBlock inline expr="W" /> 들이 학습으로 정해지죠. 즉 "무엇을 질문하고, 무엇을 내세우고,
        무엇을 전달할지"를 <b>모델이 배웁니다</b>.
      </p>
      <p class="mb-1 font-semibold text-slate-800">② 왜 <MathBlock inline expr="\sqrt{d}" /> 로 나누나</p>
      <p class="mb-2">
        차원 <MathBlock inline expr="d" /> 가 크면 내적에 더해지는 항이 많아 점수가 <b>아주 커지기</b> 쉽습니다.
        점수가 너무 크면 소프트맥스가 <b>한 곳에만 확 쏠려</b>(거의 0 또는 1) 학습이 불안정해져요.
        그래서 <MathBlock inline expr="\sqrt{d}" /> 로 나눠 <b>점수 크기를 진정</b>시킵니다.
      </p>
      <div class="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">
        🎯 그래서 이름이 <b>"Scaled Dot-Product Attention"</b>(스케일드 닷프로덕트 어텐션) —
        "크기를 조절한 내적 어텐션"이라는 뜻이에요.
      </div>
    </DetailsCard>

    <!-- ===== 3. AI 연결 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      3. 🤖 셀프 어텐션 — 문장이 스스로를 읽는다
      <ReviewFlag id="ch6-s3" chapter="ch6" label="3. AI 연결" />
    </h2>
    <ConceptCard tone="ai" title="모든 단어가 동시에, 서로를 참고">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          같은 문장 안에서 각 단어가 <b>자기 Query</b>로 <b>모두의 Key</b>를 비교해 점수를 내고,
          <b>모두의 Value</b>를 섞어 <b>새 벡터</b>가 됩니다. 이것이 <b>셀프 어텐션(self-attention)</b>이에요.
        </li>
        <li>
          이 계산이 <b>모든 단어에 대해 한꺼번에(병렬로)</b> 일어나, 문장 전체가 <b>한 번에</b> 문맥을 반영합니다.
          (그래서 위치 인코딩이 필요했죠 — ch4)
        </li>
        <li>
          Q·K·V 가 다르기에 "무엇을 <b>묻고</b>, 무엇으로 <b>매칭</b>하고, 무엇을 <b>전달</b>할지"를 유연하게 배웁니다.
        </li>
      </ul>
      <p class="mt-2 text-sm text-violet-900/80">
        회수하는 수학 — 점수의 정체인 내적은 <b><PartLink :part="1" ch="ch2">1부 2장</PartLink></b>,
        Q·K·V 를 만드는 행렬곱은 <b><PartLink :part="1" ch="ch3">1부 3장</PartLink></b>에서 쌓은 그 기초입니다.
      </p>
      <p class="mt-2 text-sm text-violet-900/80">
        다음 칸(ch7)은 이 어텐션을 <b>여러 개 동시에</b> 돌리는 <b>멀티헤드 어텐션</b>입니다.
      </p>
    </ConceptCard>

    <!-- ===== 4. 문제 세트 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 내적 계산이 나오니 위 설명을 참고하세요.
    </p>

    <QuizSet title="Q·K·V & 셀프 어텐션 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="어텐션 점수를 자동으로 계산하려고 각 단어가 만드는 세 벡터의 이름은?"
        :choices="['Query, Key, Value', '입력, 출력, 은닉', '빨강, 초록, 파랑', '주어, 동사, 목적어']"
        :answer="0"
        explanation="Query(질문)·Key(열쇠)·Value(값) 세 벡터입니다."
      />
      <Quiz
        difficulty="easy"
        question="도서관 비유에서 '내 검색어'에 해당하는 것은?"
        :choices="['Query(질문)', 'Key(열쇠)', 'Value(값)', '사서']"
        :answer="0"
        explanation="검색어 = Query. 각 책 제목표 = Key, 책 내용 = Value."
      />
      <Quiz
        difficulty="easy"
        question="Value(값)의 역할로 옳은 것은?"
        :choices="[
          '실제로 전달(섞을)할 내용',
          '점수를 지우는 것',
          '단어를 쪼개는 것',
          '순서를 바꾸는 것',
        ]"
        :answer="0"
        explanation="Value 는 집중도로 가중합되어 출력에 실제로 섞이는 내용입니다."
      />
      <Quiz
        difficulty="easy"
        question="ch5에서 손으로 넣던 관련성 점수를, ch6에서는 Query 와 Key 로 자동 계산한다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 점수 = Query·Key 내적."
      />

      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="어텐션 점수는 Query 와 Key 를 어떻게 결합해 계산하나요?"
        :choices="['내적(dot product)', '뺄셈', '더 큰 값 고르기', '글자 수 비교']"
        :answer="0"
        :hints="['성분끼리 곱해서 더하기.']"
        explanation="내적입니다. 두 벡터가 비슷한 방향일수록 값이 커져 높은 집중이 됩니다."
      />
      <StepQuiz
        difficulty="medium"
        question="Query (1, 2) 와 Key (3, 1) 의 내적(점수)을 단계별로 구하세요."
        :steps="[
          { lhs: '1 \\times 3', answer: 3 },
          { lhs: '2 \\times 1', answer: 2 },
          { lhs: '3 + 2', answer: 5 },
        ]"
        :hints="['성분끼리 곱한 뒤 모두 더합니다.', 'x끼리, y끼리 곱하기.']"
        explanation="1·3 + 2·1 = 3 + 2 = 5. 이게 이 단어 쌍의 어텐션 점수."
      />
      <Quiz
        difficulty="medium"
        question="두 벡터의 내적이 '크다'는 것은 대체로 무엇을 뜻하나요?"
        :choices="[
          '두 벡터가 비슷한 방향이다 (잘 맞는다)',
          '두 벡터가 정반대다',
          '아무 의미 없다',
          '둘 다 0이다',
        ]"
        :answer="0"
        :hints="['잘 맞을수록 높은 집중.']"
        explanation="내적이 크면 방향이 비슷(정렬)해 잘 맞는다는 뜻 → 높은 집중도."
      />
      <Quiz
        difficulty="medium"
        question="Key 와 Value 는 항상 완전히 같은 벡터다."
        type="truefalse"
        :answer="1"
        :hints="['역할이 다릅니다: 매칭용 vs 전달용.']"
        explanation="거짓입니다. Key 는 매칭(비교)용, Value 는 전달용으로 서로 다른 벡터입니다."
      />

      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="공식 softmax(QKᵀ/√d)·V 에서 맨 뒤의 '·V' 가 하는 일은?"
        :choices="[
          '집중도(가중치)로 Value 들을 가중합해 출력을 만든다',
          '점수를 다시 계산한다',
          'Query 를 지운다',
          '토큰을 쪼갠다',
        ]"
        :answer="0"
        explanation="소프트맥스로 얻은 집중도로 Value 들을 가중합 → 그 자리의 새 문맥 벡터(출력)."
      />
      <Quiz
        difficulty="hard"
        question="점수를 √d 로 나누는(스케일링) 이유로 가장 옳은 것은?"
        :choices="[
          '내적이 너무 커져 소프트맥스가 한쪽에 쏠리는 걸 막아 학습을 안정화',
          '계산을 느리게 하려고',
          '단어 수를 줄이려고',
          '확률의 합을 2로 만들려고',
        ]"
        :answer="0"
        :hints="['점수가 너무 크면 소프트맥스가 극단적으로 쏠립니다.']"
        explanation="큰 차원에서 내적이 커지면 소프트맥스가 쏠려 불안정. √d로 나눠 크기를 진정시킵니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch6')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 6 완료 — 트랜스포머의 핵심을 통과했습니다 🎉</p>
      <p class="mt-1 text-sm text-emerald-700">
        Q·K·V 로 어텐션이 스스로 점수를 낸다는 걸 이해했어요. 다음 챕터(ch7)에서 이 어텐션을
        <b>여러 개 동시에</b> 쓰는 멀티헤드로 갑니다. 노트북 <code>notebooks/ch06_qkv_attention.ipynb</code> 도 함께!
      </p>
    </div>
  </article>
</template>
