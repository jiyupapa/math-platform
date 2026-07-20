<script setup lang="ts">
// 2장 — 가까움의 수학: 코사인 유사도. 7부의 첫 핵심 챕터.
// 회수하는 수학: 1부 2장 내적 (+ 4부 6장 어텐션 점수도 같은 내적임을 회수).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import CosineLab from '@/components/CosineLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch2')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">2장 · 약 45분 · ⭐ 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">가까움의 수학 — 코사인 유사도</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      지금까지 "가까움"을 <b>거리</b>(두 점 사이의 직선 길이)로 쟀습니다. 워밍업에서도, 1장의
      검색에서도요. 그런데 이 자에는 함정이 하나 숨어 있습니다 — <b>문서의 길이</b>가 점수를
      오염시켜요. 이번 장에서 그 함정을 직접 목격하고, 1부 2장의 <b>내적</b>으로 만드는
      더 좋은 자 — <b>코사인 유사도</b> — 를 손에 넣습니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지를 가져갑니다 — ① 거리가 실패하는 지점(<b>길이 오염</b>)을 실험으로 확인,
      ② <b>코사인 유사도 = 내적 ÷ 길이 곱</b>을 계산할 수 있게, ③ 눈금(<b>1 / 0 / −1</b>)과
      실무의 지름길(<b>정규화</b>)까지. RAG 검색 점수의 정체가 이 장에서 확정됩니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 거리의 함정 — 자세히 쓴 죄</h2>
    <ReviewFlag id="ch2-s1" chapter="ch2" label="1. 거리의 함정 — 자세히 쓴 죄" />
    <p class="leading-relaxed text-slate-700">
      문서를 숫자로 바꾸는 가장 소박한 방법부터 — 주제어가 <b>몇 번 나오는지</b> 세는 겁니다
      (단어 빈도 벡터). 그런데 같은 안내문을 3배 자세히 쓰면 무슨 일이 일어날까요?
      모든 단어가 3배씩 나오니 벡터도 3배 길어집니다. <b>방향은 그대로인데 길이만</b> 늘어요.
      이때 거리로 재면 — 아래에서 직접 확인하세요.
    </p>

    <CosineLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 주제는 방향에, 분량은 길이에 담긴다">
      실험 ①의 그림을 다시 보세요. 질문·A·B는 <b>같은 방향</b>(연차:신청 = 1:1 비율)이고
      C만 다른 방향입니다. 문서의 <b>주제</b>는 성분들의 <b>비율 = 방향</b>에 담기고,
      <b>분량</b>은 <b>길이</b>에 담겨요. "비슷한 주제 찾기"가 목적이라면
      길이는 잡음이고 방향이 신호입니다 — 그래서 <b>각도</b>로 재야 합니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="실험 ①에서 문서 B(자세한 판)가 거리 순위에서 꼴찌로 밀린 이유는?"
      :choices="['내용은 같은데 벡터가 같은 방향으로 길어져, 거리가 그 길이 차이를 \'멀다\'로 채점해서', 'B의 주제가 실제로 질문과 달라서', 'B에 오타가 많아서', '거리 계산에 버그가 있어서']"
      :answer="0"
      :hints="['그림에서 질문·A·B 화살표의 방향을 비교해 보세요.']"
      explanation="B는 A와 방향이 같고 길이만 3배 — 주제는 같은데 분량이 다를 뿐입니다. 거리는 이 길이 차이를 그대로 벌점으로 만들어요. 이것이 길이 오염입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 방향으로 재기 — 내적의 재등장</h2>
    <ReviewFlag id="ch2-s2" chapter="ch2" label="2. 방향으로 재기 — 내적의 재등장" />
    <p class="leading-relaxed text-slate-700">
      각도로 재려면 새 도구가 필요할까요? 아니요 — <b>1부 2장에서 배운 내적</b>이 바로 그 도구입니다.
      기억을 되살리면, 내적은 성분끼리 곱해 더하는 연산이고
      (a·b = a₁b₁ + a₂b₂), <b>방향이 비슷하면 크고, 직교하면 0, 반대면 음수</b>가 되는
      "방향 궁합 측정기"였죠. 다만 내적은 실험 ②에서 봤듯 <b>길이에도 반응</b>합니다.
      그래서 길이의 영향을 나눠서 없애 줍니다:
    </p>
    <MathBlock expr="\text{코사인 유사도} \;=\; \cos\theta \;=\; \frac{\vec{a}\cdot\vec{b}}{|\vec{a}|\,|\vec{b}|}" />
    <p class="leading-relaxed text-slate-700">
      읽는 법: "코사인 세타 = a와 b의 내적, 나누기 두 길이의 곱". 분자(내적)가 방향 궁합을 재고,
      분모(길이의 곱)가 길이의 영향을 <b>정확히 상쇄</b>합니다. 남는 것은 순수한 <b>사잇각 θ의 코사인</b> —
      그래서 벡터를 아무리 늘려도 값이 변하지 않았던 거예요.
    </p>

    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[24rem] text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3">사잇각 θ</th><th class="py-2 pr-3">cos θ</th><th class="py-2">뜻</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">0°</td><td class="py-2 pr-3 font-mono text-emerald-600">1</td><td class="py-2">같은 방향 — 주제가 같다</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">90°</td><td class="py-2 pr-3 font-mono text-amber-600">0</td><td class="py-2">직교 — <b>무관</b> (4장에서 이 눈금이 주인공이 됩니다)</td></tr>
          <tr><td class="py-2 pr-3">180°</td><td class="py-2 pr-3 font-mono text-rose-600">−1</td><td class="py-2">반대 방향 — 정반대</td></tr>
        </tbody>
      </table>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="두 문서 벡터의 코사인 유사도가 0에 가깝다면, 두 문서의 관계는?"
      :choices="['서로 무관한 주제 (사잇각이 90°에 가깝다)', '완전히 같은 주제', '정반대 주장을 하는 문서', '한쪽이 다른 쪽보다 세 배 길다']"
      :answer="0"
      explanation="cos 90° = 0 = 직교 = 무관. 반대(180°)는 −1이고, 길이는 코사인에 아예 반영되지 않습니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 손으로 한 번 — 계산 순서 3단계</h2>
    <ReviewFlag id="ch2-s3" chapter="ch2" label="3. 손으로 한 번 — 계산 순서 3단계" />
    <p class="leading-relaxed text-slate-700">
      실험 ①의 질문 q = (1, 1)과 문서 B = (6, 6)으로 직접 계산해 보죠. 순서는 늘 같습니다:
      <b>내적 → 길이 두 개 → 나누기</b>. (√ 는 <b>제곱근·루트</b> — "제곱해서 그 수가 되는 값",
      예: √2 ≈ 1.41. cos 은 각도를 −1~1 사이 숫자로 바꿔 주는 함수인데, 위 눈금표 세 개만
      기억하면 충분해요)
    </p>
    <ul class="mt-2 list-disc space-y-1 pl-6 leading-relaxed text-slate-700">
      <li>내적: 1×6 + 1×6 = <b>12</b></li>
      <li>길이: |q| = √(1²+1²) = √2 ≈ 1.41, |B| = √(6²+6²) = √72 ≈ 8.49 → 곱 ≈ <b>12</b></li>
      <li>나누기: 12 ÷ 12 = <b>1.0</b> — 완벽히 같은 방향! (C = (0,3)으로 하면 3 ÷ (1.41×3) ≈ 0.71)</li>
    </ul>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 실무의 지름길 — 정규화</h2>
    <ReviewFlag id="ch2-s4" chapter="ch2" label="4. 실무의 지름길 — 정규화" />
    <p class="leading-relaxed text-slate-700">
      매번 길이로 나누는 게 번거롭다면, 처음부터 <b>모든 벡터를 길이 1로</b> 만들어 두면 됩니다
      (각 성분을 길이로 나누기). 그러면 분모가 1×1이 되어 — <b>코사인 유사도 = 그냥 내적</b>.
      실제 임베딩 모델 대부분이 출력을 미리 이렇게 만들어 주기 때문에, 실무의 유사도 계산은
      내적 한 방으로 끝납니다. 1부 2장의 연산 하나가 RAG 검색의 심장이 되는 순간이에요.
    </p>

    <ConceptCard tone="note" title="새 용어: 코사인 유사도 / 정규화">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>코사인 유사도</b> (cosine similarity) — 읽는 법: 코사인 유사도.
          뜻: 두 벡터의 <b>사잇각의 코사인</b> = 내적 ÷ 길이 곱. 방향(주제)만 보고 길이(분량)는
          무시하는 유사도의 실무 표준. 눈금: 같은 방향 1, 직교(무관) 0, 반대 −1.
        </li>
        <li>
          <b>정규화</b> (normalization) — 읽는 법: 노멀라이제이션.
          뜻: 벡터를 <b>길이 1로</b> 맞추는 것(성분을 길이로 나눔). 정규화된 벡터를
          <b>단위 벡터</b>(unit vector)라 부르고, 단위 벡터끼리는 <b>내적 = 코사인 유사도</b>가 됩니다.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">주제는 방향에 있다 — 그러니 길이로 나눠라: 코사인 유사도 = 내적 ÷ 길이 곱</p>
      <p class="mt-1 text-sm text-indigo-600">정규화해 두면 이마저 내적 한 번으로 — RAG 검색 점수의 정체.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="벡터 b의 모든 성분을 2배 해도(길이 2배), a와 b의 코사인 유사도는 변하지 않는다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 분자(내적)가 2배가 되지만 분모(|b|)도 2배 — 정확히 상쇄됩니다. 실험 ②에서 길이 슬라이더가 cos θ를 꿈쩍도 못 하게 한 이유예요."
    />

    <DetailsCard title="➕ 더 깊이: 그럼 거리는 버리는 건가요?">
      아닙니다 — 범인은 거리가 아니라 <b>길이 오염</b>이에요. 정규화된(길이 1) 벡터들 사이에서는
      |a−b|² = 2 − 2cosθ 라는 깔끔한 관계가 성립해서, <b>거리 순위와 코사인 순위가 완전히
      일치</b>합니다(코사인이 클수록 거리가 짧음). 그래서 벡터 DB 설정에 나오는 유사도 옵션 —
      <code>cosine</code> / <code>dot</code>(내적) / <code>L2</code>(유클리드 거리) — 는 정규화만 되어 있다면
      셋 다 같은 순위를 내놓아요. 이 옵션 화면은 6장(벡터 DB)에서 다시 만납니다.
    </DetailsCard>

    <ReviewFlag id="ch2-ai" chapter="ch2" label="🤖 AI 연결 — 회수하는 수학: 1부 2장 · 4부 6장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 1부 2장 · 4부 6장">
      이 장의 심장은 <b><PartLink :part="1" ch="ch2">1부 2장</PartLink></b>의 내적입니다 —
      "방향이 비슷하면 크고, 직교면 0"이라던 그 방향 궁합 측정기가 길이 곱으로 나눠지며
      유사도의 실무 표준이 됐어요. 그리고 놀라운 재회 하나 —
      <b><PartLink :part="4" ch="ch6">4부 6장</PartLink></b>의 어텐션 점수(Q·K)도 <b>정확히 같은
      내적</b>이었습니다. 토큰끼리 "서로 관련 있나?"를 묻던 그 연산으로, 이제 질문과 문서가
      "서로 관련 있나?"를 묻는 것 — LLM 안팎에서 <b>관련성 = 내적</b>이라는 같은 수학이 돌고 있어요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 계산 문제는 <b>내적 → 길이 → 나누기</b> 순서만 지키면 돼요.
    </p>

    <QuizSet title="코사인 유사도 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="코사인 유사도가 재는 것은?"
        :choices="['두 벡터의 사잇각(방향 차이) — 길이는 무시', '두 벡터의 길이 차이', '두 벡터의 성분 개수', '두 문서의 글자 수 비율']"
        :answer="0"
        explanation="cos θ — 방향(주제)의 궁합만 봅니다. 길이(분량)는 분모가 정확히 상쇄해요."
      />
      <Quiz
        difficulty="easy"
        question="코사인 유사도의 눈금으로 옳은 짝은?"
        :choices="['같은 방향 1 · 직교 0 · 반대 −1', '같은 방향 0 · 직교 1 · 반대 2', '같은 방향 100 · 직교 50 · 반대 0', '항상 0과 1 사이 값만 나온다']"
        :answer="0"
        explanation="cos 0° = 1, cos 90° = 0(무관), cos 180° = −1. 세 눈금이 코사인 읽기의 전부입니다."
      />
      <Quiz
        difficulty="easy"
        question="문서를 같은 내용으로 3배 자세히 쓰면(단어 빈도 3배), 질문과의 코사인 유사도도 크게 변한다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 벡터 방향이 그대로라 코사인은 변하지 않아요 — 변하는 건 거리(길이 오염)였죠."
      />
      <Quiz
        difficulty="easy"
        question="q = (1, 1), B = (6, 6)일 때 내적 q·B는?"
        type="numeric"
        :answer="12"
        explanation="1×6 + 1×6 = 12. 성분끼리 곱해 더하기 — 1부 2장 그대로입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="a = (3, 4), b = (4, 3)의 코사인 유사도를 단계별로 구하세요."
        :steps="[
          { lhs: 'a\\cdot b', answer: 24 },
          { lhs: '|a|', answer: 5 },
          { lhs: '|b|', answer: 5 },
          { lhs: '\\cos\\theta', answer: 0.96, tolerance: 0.01 },
        ]"
        :hints="['내적 = 3×4 + 4×3. 길이 = √(3²+4²) — 유명한 3·4·5 직각삼각형!', '24 ÷ (5×5)']"
        explanation="내적 24, 길이 5와 5 → 24/25 = 0.96. 거의 같은 방향이지만 완전히 같지는 않은 두 벡터입니다."
      />
      <Quiz
        difficulty="medium"
        question="검색에서 유클리드 거리 대신 코사인 유사도를 쓰는 핵심 이유는?"
        :choices="['문서 분량(벡터 길이) 차이가 점수를 오염시키는 것을 막으려고', '코사인이 계산이 훨씬 오래 걸려서 정확하니까', '거리로는 순위를 매길 수 없어서', '코사인은 음수가 안 나와서']"
        :answer="0"
        :hints="['실험 ①에서 B가 왜 밀려났는지 떠올려 보세요.']"
        explanation="같은 주제라도 긴 문서는 벡터가 길어 거리에서 불리해집니다. 코사인은 방향만 봐서 이 오염이 없어요."
      />
      <Quiz
        difficulty="medium"
        question="정규화(길이 1로 맞춤)된 벡터끼리는 코사인 유사도를 내적만으로 구할 수 있다. 그 이유는?"
        :choices="['분모인 길이의 곱이 1×1 = 1이 되기 때문', '정규화가 내적 값을 두 배로 만들기 때문', '정규화하면 사잇각이 0이 되기 때문', '이유 없이 관례일 뿐이다']"
        :answer="0"
        explanation="cos θ = 내적 ÷ (|a||b|)에서 |a| = |b| = 1이면 나누기가 사라집니다 — 실무 임베딩이 정규화되어 나오는 이유."
      />
      <Quiz
        difficulty="medium"
        question="a = (2, 0), b = (0, 5)의 코사인 유사도는?"
        :choices="['0 — 직교, 무관', '1 — 같은 방향', '−1 — 반대 방향', '10 — 내적 값 그대로']"
        :answer="0"
        :hints="['내적부터 계산해 보세요: 2×0 + 0×5.']"
        explanation="내적이 0이면 나눌 것도 없이 cos θ = 0 — 두 벡터는 직교(90°), 주제가 무관합니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="정규화된 벡터들만 있는 검색 시스템에서, 유사도 옵션을 cosine에서 L2(거리)로 바꾸면 검색 순위는?"
        :choices="['변하지 않는다 — |a−b|² = 2 − 2cosθ 라 순위가 완전히 일치', '완전히 뒤집힌다', '무작위로 섞인다', '항상 절반만 일치한다']"
        :answer="0"
        :hints="['더 깊이 카드 — 길이가 전부 1일 때 거리와 코사인의 관계식.']"
        explanation="길이가 모두 1이면 거리는 코사인의 단조 함수 — 코사인이 클수록 거리가 짧아 순위가 같습니다. 범인은 거리가 아니라 길이 오염이었던 거죠."
      />
      <Quiz
        difficulty="hard"
        question="사내 검색봇이 '한 줄짜리 공지'만 자꾸 1등으로 올리고 자세한 정식 문서를 밀어냅니다. 임베딩이 정규화되지 않았고 L2 거리를 쓴다면, 가장 그럴듯한 진단과 처방은?"
        :choices="['길이 오염 — 긴 문서의 벡터가 길어 거리에서 불리. 정규화하거나 코사인으로 바꾼다', '짧은 공지가 실제로 항상 더 관련성이 높다 — 정상 동작', 'GPU 메모리 부족 — 서버를 증설한다', '거리 계산을 두 번 반복하면 해결된다']"
        :answer="0"
        :hints="['실험 ①의 B(자세한 판)가 당한 일이 그대로 실무에서 벌어진 상황이에요.']"
        explanation="정규화 없는 L2는 분량이 점수에 새어 들어옵니다. 벡터를 정규화하거나 metric을 cosine으로 — 실무에서 실제로 자주 만나는 버그입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch2')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">2장 완료 — 가까움의 자를 손에 넣었어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 3장 — 자를 들고 임베딩 공간을 탐험합니다. 의미에 "방향"이 있다는 것,
        그 유명한 왕 − 남자 + 여자 = 여왕이 기다려요.
      </p>
      <RouterLink
        to="/ch/ch3"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        3장 — 임베딩 공간 탐험 →
      </RouterLink>
    </div>
  </article>
</template>
