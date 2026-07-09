<script setup lang="ts">
// Phase 3 — 임베딩. 뜻 없는 토큰 ID 를 "의미를 담은 숫자 벡터(좌표)"로 바꾼다.
import ConceptCard from '@/components/ConceptCard.vue'
import DetailsCard from '@/components/DetailsCard.vue'
import MathBlock from '@/components/MathBlock.vue'
import EmbeddingLab from '@/components/EmbeddingLab.vue'
import Quiz from '@/components/Quiz.vue'
import StepQuiz from '@/components/StepQuiz.vue'
import QuizSet from '@/components/QuizSet.vue'
import NotebookCard from '@/components/NotebookCard.vue'
import ReviewFlag from '@/components/ReviewFlag.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch3')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 3 · 임베딩</p>
    <h1 class="mb-4 text-3xl font-bold">임베딩 — 단어를 "의미 좌표"로</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      앞 챕터에서 토큰은 <b>번호(ID)</b>를 받았습니다. 그런데 번호 <b>#1000</b>과 <b>#1001</b>이
      이웃이라고 뜻이 비슷한 건 아니죠. 번호는 그냥 <b>이름표</b>일 뿐입니다.
      임베딩은 각 토큰을 <b>뜻이 담긴 숫자 벡터(좌표)</b>로 바꿉니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      "뜻이 비슷한 단어는 <b>가까운 좌표</b>에 놓인다"는 임베딩의 핵심 아이디어를,
      단어 지도를 직접 눌러보며 이해합니다.
    </ConceptCard>

    <!-- ===== 1. ID는 뜻이 없다 → 임베딩 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      1. 번호표 대신 "의미 좌표"
      <ReviewFlag id="ch3-s1" chapter="ch3" label="1. 의미 좌표" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      임베딩(embedding)은 각 토큰에 <b>숫자 여러 개로 된 좌표</b>를 붙입니다. 이 좌표를
      <b>벡터(vector)</b>라고 불러요. 핵심 규칙은 단 하나 —
      <b>뜻이 비슷하면 좌표도 가깝게</b> 놓습니다. 아래 지도에서 점 두 개를 눌러 거리를 재보세요.
    </p>

    <EmbeddingLab />

    <ConceptCard tone="note" title="새 용어 세 개">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>임베딩(embedding)</b> — 토큰을 <b>의미가 담긴 숫자 벡터(좌표)</b>로 바꾸는 것(또는 그 벡터).</li>
        <li><b>벡터(vector)</b> — <b>숫자 여러 개를 늘어놓은 것</b>. 예: <MathBlock inline expr="(-3.0,\ 2.6)" /> 은
          평면 위 한 점(좌표)입니다.</li>
        <li><b>차원(dimension)</b> — 벡터에 든 <b>숫자의 개수</b>. 위 지도는 숫자 2개라 <b>2차원</b>.
          (진짜 LLM 은 보통 <b>수백~수천 차원</b>)</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="토큰 ID(번호)는 그 자체로 단어의 '뜻'을 담고 있다."
      type="truefalse"
      :answer="1"
      explanation="거짓입니다. 번호는 이름표일 뿐, 뜻이 없어요. 뜻은 임베딩(의미 좌표)이 담습니다."
    />

    <!-- ===== 2. 거리 = 비슷함 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      2. 가까울수록 비슷하다 — 거리로 재기
      <ReviewFlag id="ch3-s2" chapter="ch3" label="2. 거리로 비슷함 재기" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      두 단어가 얼마나 비슷한지는 <b>좌표 사이의 거리</b>로 잽니다. 위 지도에서 봤듯
      <b>고양이–강아지</b>는 가깝고(둘 다 동물), <b>고양이–자동차</b>는 멀죠. 평면(2차원)에서
      거리는 <b>피타고라스 정리</b>로 구합니다:
    </p>
    <MathBlock expr="\text{거리} = \sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}" />
    <p class="mt-1 text-sm text-slate-500">
      두 점의 <b>x 차이</b>와 <b>y 차이</b>를 각각 제곱해 더한 뒤 루트 — 직각삼각형의 빗변 길이와 같아요.
    </p>

    <ConceptCard tone="note" title="새 기호 풀이 — 처음 보는 기호 세 개">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <MathBlock inline expr="\sqrt{\;}" /> &nbsp;
          <b>이름</b>: 제곱근(루트) · <b>읽는 법</b>: "루트" ·
          <b>뜻</b>: 제곱을 <b>되돌리는</b> 연산. 제곱하면 안의 숫자가 되는 값이에요.
          예: <MathBlock inline expr="\sqrt{25}=5" /> (5를 제곱하면 25이므로), <MathBlock inline expr="\sqrt{9}=3" />.
        </li>
        <li>
          <MathBlock inline expr="x^2" /> &nbsp;
          <b>이름</b>: 제곱 · <b>읽는 법</b>: "엑스 제곱" ·
          <b>뜻</b>: 같은 수를 <b>두 번 곱하기</b>. 예: <MathBlock inline expr="3^2 = 3\times3 = 9" />.
        </li>
        <li>
          <MathBlock inline expr="x_1,\ x_2" /> &nbsp;
          <b>이름</b>: 아래첨자 · <b>읽는 법</b>: "엑스 원, 엑스 투" ·
          <b>뜻</b>: 작은 번호는 <b>몇 번째 점인지</b> 번호표. <MathBlock inline expr="x_1" /> 은 첫째 점의 x,
          <MathBlock inline expr="x_2" /> 는 둘째 점의 x 예요.
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="warn" title="2D는 그림용, 진짜는 고차원">
      여기서는 눈으로 보려고 <b>2차원</b>으로 그렸지만, 실제 LLM 임베딩은
      <b>수백~수천 개의 숫자</b>로 된 고차원 벡터입니다. 차원이 많을수록 "색깔, 크기, 감정, 문법 역할…"
      같은 <b>수많은 의미 축</b>을 동시에 담을 수 있어요. 원리(가까움=비슷함)는 똑같습니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="지도에서 '고양이'와 가장 가까운(=가장 비슷한) 단어는?"
      :choices="['강아지', '사과', '자동차', '빨강']"
      :answer="0"
      :hints="['같은 무리(동물)를 찾아보세요.']"
      explanation="강아지입니다. 둘 다 '동물' 무리라 좌표가 가깝게 놓여 있어요."
    />

    <!-- ===== 심화: 임베딩 산수 ===== -->
    <DetailsCard title="➕ 더 깊이 알아보기 — 임베딩의 마법 같은 산수">
      <p class="mb-2">
        임베딩이 뜻을 <b>방향</b>으로도 담는다는 유명한 예가 있습니다:
      </p>
      <MathBlock expr="\text{왕} - \text{남자} + \text{여자} \approx \text{여왕}" />
      <p class="mb-3">
        "왕에서 <b>남자 성분</b>을 빼고 <b>여자 성분</b>을 더하면 여왕에 가까워진다"는 뜻이에요.
        벡터를 <b>더하고 빼는 것만으로</b> 의미가 옮겨갑니다. 아래 그림에서 두 파란 화살표
        (<b>남자→왕</b>, <b>여자→여왕</b>)가 <b>같은 방향·같은 길이</b>인 게 핵심입니다.
      </p>
      <div class="flex justify-center">
        <svg viewBox="0 0 260 180" width="260" height="180" class="rounded-lg border border-slate-100 bg-white">
          <!-- 화살표 머리 -->
          <defs>
            <marker id="ah" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" />
            </marker>
          </defs>
          <!-- 가로 보조선 (성별 방향) -->
          <line x1="55" y1="140" x2="205" y2="140" stroke="#e2e8f0" stroke-dasharray="4 3" />
          <line x1="55" y1="50" x2="205" y2="50" stroke="#e2e8f0" stroke-dasharray="4 3" />
          <!-- 세로 화살표 (왕관 방향): 남자→왕, 여자→여왕 -->
          <line x1="55" y1="140" x2="55" y2="58" stroke="#6366f1" stroke-width="2" marker-end="url(#ah)" />
          <line x1="205" y1="140" x2="205" y2="58" stroke="#6366f1" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#ah)" />
          <!-- 점 -->
          <circle cx="55" cy="140" r="4" fill="#334155" />
          <circle cx="205" cy="140" r="4" fill="#334155" />
          <circle cx="55" cy="50" r="4" fill="#334155" />
          <circle cx="205" cy="50" r="4" fill="#334155" />
          <!-- 라벨 -->
          <text x="55" y="158" text-anchor="middle" font-size="12" fill="#334155">남자</text>
          <text x="205" y="158" text-anchor="middle" font-size="12" fill="#334155">여자</text>
          <text x="55" y="42" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">왕</text>
          <text x="205" y="42" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">여왕</text>
        </svg>
      </div>
      <div class="mt-3 rounded-lg bg-white px-4 py-3 text-sm text-slate-600">
        🎯 <b>뜻</b>: "왕관 성분"(위로 향하는 화살표)이 남자·여자에 <b>똑같이</b> 더해지므로,
        같은 이동을 여자에 적용하면 여왕이 됩니다. 의미의 <b>차이가 방향</b>으로 저장된 거예요.
      </div>
    </DetailsCard>

    <!-- ===== 3. AI 연결 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      3. 🤖 임베딩은 학습되고, 이후 모든 계산의 재료가 된다
      <ReviewFlag id="ch3-s3" chapter="ch3" label="3. AI 연결" />
    </h2>
    <ConceptCard tone="ai" title="숫자가 됐으니 이제 계산할 수 있다">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          임베딩 좌표는 사람이 정하지 않고 <b>데이터에서 학습</b>됩니다. 수많은 문장을 보며
          "비슷한 자리에 쓰이는 단어는 가까이" 놓이도록 저절로 자리잡아요.
        </li>
        <li>
          토큰이 <b>벡터(숫자)</b>가 됐으니, 이제 <b>더하고 비교하는 계산</b>이 가능합니다.
          다음 칸부터의 <b>어텐션</b>(ch5·6)은 바로 이 벡터들로 단어 사이 관계를 계산해요.
        </li>
        <li>
          단어 유사도, 추천, 검색(임베딩 검색)도 모두 "<b>가까운 벡터 찾기</b>"입니다.
        </li>
      </ul>
      <p class="mt-2 text-sm text-violet-900/80">
        다음 칸(ch4 위치 인코딩)은 이 임베딩에 <b>"몇 번째 단어인지"</b> 순서 정보를 더합니다.
      </p>
    </ConceptCard>

    <!-- ===== 4. 문제 세트 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 거리 계산은 위 공식(피타고라스)을 쓰세요.
    </p>

    <QuizSet title="임베딩 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="임베딩(embedding)은 토큰을 '의미가 담긴 숫자 벡터(좌표)'로 바꾸는 것이다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 번호표(ID)와 달리, 임베딩은 뜻을 좌표로 담습니다."
      />
      <Quiz
        difficulty="easy"
        question="임베딩에서 '뜻이 비슷한 단어'는 좌표가 어떻게 놓일까요?"
        :choices="['서로 멀리', '서로 가까이', '항상 원점에', '무작위로']"
        :answer="1"
        explanation="가까이 놓입니다. 가까움 = 비슷함이 임베딩의 핵심 규칙."
      />
      <Quiz
        difficulty="easy"
        question="벡터(vector)란 무엇인가요?"
        :choices="['숫자 여러 개를 늘어놓은 것(좌표)', '한 개의 글자', '색깔 이름', '문장 부호']"
        :answer="0"
        explanation="벡터는 숫자 여러 개의 묶음(좌표)입니다. 예: (-3, 2.6)."
      />
      <Quiz
        difficulty="easy"
        question="토큰 ID 번호가 이웃(#1000, #1001)이면 두 단어의 뜻도 반드시 비슷하다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. ID는 이름표라 번호가 가까워도 뜻과는 무관해요."
      />

      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="벡터에 든 '숫자의 개수'를 무엇이라 하나요?"
        :choices="['차원(dimension)', '거리', '확률', '토큰']"
        :answer="0"
        :hints="['2개면 2차원, 3개면 3차원.']"
        explanation="차원(dimension)입니다. 실제 LLM 임베딩은 수백~수천 차원."
      />
      <StepQuiz
        difficulty="medium"
        question="두 단어의 임베딩이 (0, 0) 과 (3, 4) 일 때, 사이 거리를 단계별로 구하세요."
        :steps="[
          { lhs: '(3-0)^2', answer: 9 },
          { lhs: '(4-0)^2', answer: 16 },
          { lhs: '9 + 16', answer: 25 },
          { lhs: '\\sqrt{25}', answer: 5 },
        ]"
        :hints="['x 차이와 y 차이를 각각 제곱.', '더한 뒤 마지막에 루트.']"
        explanation="√((3-0)²+(4-0)²)=√(9+16)=√25=5. 유명한 3-4-5 직각삼각형!"
      />
      <Quiz
        difficulty="medium"
        question="실제 LLM 의 단어 임베딩은 항상 2차원이다."
        type="truefalse"
        :answer="1"
        :hints="['2D는 그림으로 보여주려는 것뿐.']"
        explanation="거짓입니다. 보통 수백~수천 차원입니다. 2D는 시각화용 단순화."
      />
      <Quiz
        difficulty="medium"
        question="임베딩 좌표(값)는 어떻게 정해질까요?"
        :choices="[
          '사람이 단어마다 손으로 입력한다',
          '수많은 문장 데이터로부터 학습된다',
          '사전 순서대로 자동으로 매겨진다',
          '항상 무작위로 고정된다',
        ]"
        :answer="1"
        explanation="데이터에서 학습됩니다. 비슷한 자리에 쓰이는 단어가 가까워지도록 저절로 자리잡아요."
      />

      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="유명한 임베딩 산수 '왕 - 남자 + 여자' 는 대략 어떤 단어에 가까울까요?"
        :choices="['여왕', '사과', '자동차', '남자']"
        :answer="0"
        :hints="['성별 방향으로 이동시키는 것.']"
        explanation="여왕입니다. 의미의 차이가 벡터의 방향으로 저장돼 있어 덧셈·뺄셈이 통합니다."
      />
      <Quiz
        difficulty="hard"
        question="임베딩이 트랜스포머 파이프라인에서 하는 핵심 역할은?"
        :choices="[
          '토큰을 화면에 그린다',
          '토큰 ID를 의미 벡터로 바꿔, 이후 계산(어텐션 등)의 재료로 만든다',
          '문장을 짧게 줄인다',
          '확률을 1로 만든다',
        ]"
        :answer="1"
        :hints="['숫자(벡터)가 돼야 계산을 할 수 있죠.']"
        explanation="토큰을 의미 벡터로 바꿔 이후 어텐션 등 모든 계산의 재료로 만듭니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch3')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 3 완료 — 단어가 의미 좌표가 됐습니다</p>
      <p class="mt-1 text-sm text-emerald-700">
        이제 각 토큰이 <b>의미 벡터</b>를 가집니다. 다음 챕터(ch4 위치 인코딩)에서
        <b>순서 정보</b>를 더해요. 대응 노트북 <code>notebooks/ch03_embedding.ipynb</code> 도 함께!
      </p>
    </div>
  </article>
</template>
