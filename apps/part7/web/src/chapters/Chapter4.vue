<script setup lang="ts">
// 4장 — 고차원의 저주 (핵심): 무작위는 거의 직교, 그런데도 임베딩이 작동하는 이유.
// 회수하는 수학: 3부 7장 큰 수의 법칙(집중) · 3부 5장 기댓값·분포 · 1부 9장 차원(용량).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import HighDimLab from '@/components/HighDimLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch4')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">4장 · 약 45분 · ⭐ 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">고차원의 저주 — 그런데도 임베딩이 작동하는 이유</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      3장까지의 지도는 전부 2차원이었습니다. 실제 임베딩은 수백~수천 차원이죠.
      "차원만 늘어난 거니까 감각도 그대로겠지"라고 생각하기 쉽지만 — 고차원은
      우리의 공간 직관을 <b>배반하는 이상한 나라</b>입니다. 이번 장에서 그 이상함의 정체를
      직접 확인하고, 이상함이 <b>저주가 아니라 오히려 검색을 가능하게 하는 축복</b>임을 봅니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      두 가지를 체득합니다 — ① 고차원에서 <b>무작위 벡터 쌍은 거의 직교</b>(cos ≈ 0 ± 1/√d)라는
      집중 현상, ② 그런데도 임베딩 검색이 되는 이유: <b>임베딩은 무작위가 아니라 학습된 벡터</b>라서,
      무작위 바닥(0) 위로 신호가 뚜렷이 솟는다는 것. 이 "바닥"의 실무 이름은
      <b>무작위 기준선(random baseline)</b> — 평가 문서에서 "베이스라인 대비"라고 할 때의 그 말이에요.
      덤으로 "cos 0.3이 큰 점수"인 실무 감각까지.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 이상한 나라의 첫 관문 — 아무 벡터나 두 개 뽑으면</h2>
    <ReviewFlag id="ch4-s1" chapter="ch4" label="1. 이상한 나라의 첫 관문 — 아무 벡터나 두 개 뽑으면" />
    <p class="leading-relaxed text-slate-700">
      2차원에서 무작위로 화살표 두 개를 던지면 사잇각은 아무거나 나옵니다 — 0°도, 90°도, 180°도요.
      그런데 차원을 올리면 이상한 일이 벌어집니다. 아래에서 차원 버튼을 눌러 가며
      분포가 어떻게 변하는지 직접 보세요.
    </p>

    <HighDimLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 집중: 0 ± 1/√d">
      차원이 오를수록 무작위 쌍의 코사인이 <b>0(직교) 주위로 조여들었습니다.</b> 이유는 3부에서 배운
      그대로인데, 아직 안 봤어도 괜찮아요(아래 카드) — 코사인은 성분 곱 d개를 <b>더한 평균 꼴</b>이라,
      큰 수의 법칙(3부 7장)처럼 항이 많을수록 우연들이 서로 상쇄됩니다. 표본 평균의 오차가 1/√n으로
      줄던 그 공식이, 여기선 차원 d에 붙어요:
    </ConceptCard>
    <MathBlock expr="\text{무작위 쌍의 } \cos\theta \;\approx\; 0 \,\pm\, \tfrac{1}{\sqrt{d}} \qquad (d = 512 \;\Rightarrow\; \pm\, 0.044)" />

    <ConceptCard tone="note" title="3부를 아직 안 봤어도 괜찮아요 — 최소 직관 세 가지">
      <ul class="list-disc space-y-1 pl-5 text-sm leading-relaxed">
        <li>
          <b>큰 수의 법칙</b> — 동전을 많이 던질수록 앞면 비율이 50%에 <b>조여드는</b> 그 법칙입니다.
          "우연을 많이 더하면(평균 내면) 서로 상쇄된다" — 정식 소개는 3부 7장.
        </li>
        <li>
          <b>1/√n 규칙</b> — 조여드는 <b>폭</b>은 더한 개수 n의 <b>제곱근에 반비례</b>합니다.
          n이 100배가 되면 폭은 10분의 1. 위 공식은 그 n 자리에 차원 d가 들어간 것뿐이에요
          (d = 512 → 폭 ≈ 1/√512 ≈ 0.044).
        </li>
        <li>
          <b>σ(시그마, 표준편차)</b> — "흩어짐의 폭"을 재는 자입니다. 뒤 문제의 "몇 σ짜리
          신호인가"는 "우연의 흩어짐 폭의 <b>몇 배</b>나 되는 큰 값인가"라는 뜻이에요
          (정식 소개는 3부 2장).
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="차원 d가 커질수록 무작위 벡터 쌍의 코사인 분포는 어떻게 되나요?"
      :choices="['0(직교) 주위로 좁게 집중된다 — 폭이 약 1/√d', '−1과 +1 양끝으로 몰린다', '변화 없이 항상 골고루 퍼진다', '전부 정확히 1이 된다']"
      :answer="0"
      :hints="['실험 ①에서 512차원의 히스토그램 모양을 떠올려 보세요.']"
      explanation="성분 곱 d개가 더해지며 우연이 상쇄되는 집중 현상 — 3부 7장의 큰 수의 법칙과 같은 원리입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 왜 "저주"라 부르나 — 모두가 엇비슷하게 멀다</h2>
    <ReviewFlag id="ch4-s2" chapter="ch4" label="2. 왜 「저주」라 부르나 — 모두가 엇비슷하게 멀다" />
    <p class="leading-relaxed text-slate-700">
      같은 집중 현상이 거리에도 일어납니다. 고차원에서 무작위 점들을 뿌리면 <b>서로 간의 거리가
      다 엇비슷</b>해져요 — 가장 가까운 점과 가장 먼 점의 차이가 미미해집니다. "최근접 이웃"이라는
      개념 자체가 흐릿해지는 거죠. 데이터 분석에서 이 현상이 알고리즘을 괴롭혀 온 역사가 길어서
      <b>고차원의 저주</b>(curse of dimensionality)라는 살벌한 이름이 붙었습니다.
      "그럼 수백 차원에서 최근접 문서를 찾는 임베딩 검색은 애초에 글렀잖아?" — 좋은 질문입니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="고차원의 저주가 검색에 던지는 걱정거리는?"
      :choices="['무작위 점들끼리는 거리가 다 엇비슷해져 \'가장 가까움\'이 무의미해질 수 있다', '고차원에선 벡터를 저장할 수 없다', '코사인 계산이 불가능해진다', '차원이 높으면 항상 검색이 빨라진다']"
      :answer="0"
      explanation="거리 집중 — 최근접과 최원접의 차이가 사라지는 현상. 임베딩이 이를 어떻게 피하는지가 이 장의 반전입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 반전 — 임베딩은 무작위가 아니다</h2>
    <ReviewFlag id="ch4-s3" chapter="ch4" label="3. 반전 — 임베딩은 무작위가 아니다" />
    <p class="leading-relaxed text-slate-700">
      저주의 전제를 다시 보세요 — 전부 "<b>무작위</b> 벡터"였습니다. 그런데 임베딩은 무작위가
      아니에요. 9장에서 배울 학습이 <b>관련된 것들은 같은 방향으로, 무관한 것들은 제멋대로</b> 되도록
      벡터를 정렬해 놓습니다. 그 결과 실험 ②에서 본 그림이 만들어져요:
      무관한 문서들은 저주 덕분에 <b>0 근처 바닥에 깔리고</b>, 학습으로 관련지어진 문서만
      그 위로 <b>우뚝 솟습니다.</b> 저주가 잡음을 눌러 주는 바닥이 되는 겁니다.
    </p>
    <p class="mt-2 leading-relaxed text-slate-700">
      용량 관점에서도 축복입니다. 1부 9장에서 차원 = <b>독립인 방향의 수</b>였죠.
      "정확히 직교"는 d개뿐이지만, "<b>거의 직교</b>(cos ≈ 0)"까지 허용하면 고차원에는
      그런 방향이 <b>천문학적으로 많습니다.</b> 수백만 개의 개념을 서로 간섭 없이
      담을 수 있는, 어마어마하게 넓은 도서관인 셈이에요.
    </p>

    <ConceptCard tone="note" title="새 용어: 고차원의 저주 / 거의 직교 / 집중 현상">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>고차원의 저주</b> (curse of dimensionality) — 읽는 법: 고차원의 저주.
          뜻: 차원이 높아지면 저차원 직관(거리·부피·이웃)이 무너지는 현상의 총칭.
          무작위 점들은 서로 엇비슷하게 멀어지고, 각도는 직교로 몰립니다.
        </li>
        <li>
          <b>거의 직교</b> (near-orthogonal) — 읽는 법: 니어 오소고널.
          뜻: cos θ ≈ 0인 상태. 고차원에는 거의 직교인 방향이 지수적으로 많아
          <b>개념을 담는 용량</b>이 됩니다.
        </li>
        <li>
          <b>집중 현상</b> (concentration) — 읽는 법: 컨센트레이션.
          뜻: 많은 항의 합·평균이 기댓값 근처로 조여드는 현상(폭 ~ 1/√d).
          3부 7장 큰 수의 법칙의 고차원 버전입니다.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">고차원에서 무작위는 0(직교)의 바닥에 깔리고, 학습된 관계만 그 위로 솟는다</p>
      <p class="mt-1 text-sm text-indigo-600">저주는 잡음을 눌러 주는 바닥 — 그래서 임베딩 검색이 작동합니다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="512차원 문장 임베딩 검색에서 cos 0.3은 '낮은 점수'로 보이지만 실제로는 의미 있는 신호일 수 있다. 왜일까?"
      :choices="['무작위(무관) 쌍의 바닥이 0 ± 0.044 수준이라, 0.3은 바닥의 7배쯤 되는 뚜렷한 신호라서', '0.3은 어떤 경우에도 높은 점수라서', '코사인은 원래 0.5를 넘을 수 없어서', '착시일 뿐 실제로는 의미 없다']"
      :answer="0"
      explanation="점수의 크기는 바닥(무작위 기준선) 대비로 읽어야 합니다 — 고차원 임베딩에서 0.3은 우연으로 나오기 매우 어려운 값이에요."
    />

    <DetailsCard title="➕ 더 깊이: 그럼 차원은 높을수록 좋은가?">
      용량만 보면 그렇지만, 공짜가 아닙니다 — 차원만큼 <b>저장·계산 비용</b>이 늘고(수백만 문서 × 수천
      차원이면 메모리가 진짜 돈이 됩니다), 데이터가 그 넓은 공간을 채우지 못하면 학습이 어려워져요.
      그래서 실무 임베딩은 수백~수천 차원 사이의 <b>절충점</b>에 모여 있습니다. 또 하나 —
      거리 집중 때문에 고차원에서는 점수의 <b>절대값보다 순위</b>가 믿을 만합니다.
      "cos 0.5 이상만 채택" 같은 임계값 규칙이 왜 조심스러운 문제인지는 7장(검색 품질)에서 다뤄요.
    </DetailsCard>

    <ReviewFlag id="ch4-ai" chapter="ch4" label="🤖 AI 연결 — 회수하는 수학: 3부 7장 · 1부 9장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 3부 7장 · 1부 9장">
      집중 현상의 뿌리는 <b><PartLink :part="3" ch="ch7">3부 7장</PartLink></b>입니다 — 표본이 많을수록
      평균이 참값으로 조여들던 큰 수의 법칙, 그 1/√n이 여기선 차원 d에 붙어 무작위 코사인을
      0으로 눌러요. 그리고 <b><PartLink :part="1" ch="ch9">1부 9장</PartLink></b>의 차원(독립 방향의 수)은
      "거의 직교까지 허용하면 방향이 지수적으로 많다"로 확장되며 임베딩의 <b>용량</b>이 됩니다.
      남은 불편함 하나 — 수백 차원은 눈에 안 보인다는 것. 그 지도를 종이에 펴는 법(차원 축소)이
      다음 장입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="고차원의 저주 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="고차원에서 무작위로 뽑은 두 벡터의 관계는 대개?"
        :choices="['거의 직교 (cos ≈ 0)', '거의 같은 방향 (cos ≈ 1)', '거의 반대 방향 (cos ≈ −1)', '항상 정확히 45°']"
        :answer="0"
        explanation="집중 현상 — 512차원이면 무작위 쌍의 코사인이 0 ± 0.044 안에 대부분 들어옵니다."
      />
      <Quiz
        difficulty="easy"
        question="차원이 높아질수록 무작위 쌍의 코사인 분포 폭은 넓어진다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 폭은 1/√d로 좁아져요 — 차원이 높을수록 0으로 조여듭니다."
      />
      <Quiz
        difficulty="easy"
        question="d = 100일 때 무작위 쌍 코사인의 표준편차는 대략? (1/√d)"
        type="numeric"
        :answer="0.1"
        explanation="1/√100 = 0.1. 100차원에서 무작위 쌍은 대부분 cos ∈ (−0.2, 0.2)에 들어옵니다."
      />
      <Quiz
        difficulty="easy"
        question="'고차원의 저주'가 가리키는 것은?"
        :choices="['차원이 높아지면 거리·이웃 같은 저차원 직관이 무너지는 현상', '차원이 높으면 컴퓨터가 저주에 걸리는 것', '벡터가 저장되지 않는 현상', 'GPU가 뜨거워지는 현상']"
        :answer="0"
        explanation="무작위 점들이 엇비슷하게 멀어지고(거리 집중) 각도는 직교로 몰리는 — 직관 배반 현상의 총칭입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="400차원 임베딩에서 질문과 어떤 문서의 코사인이 0.6이 나왔습니다. 무작위였다면 코사인은 0 근처에 폭 σ(시그마=표준편차)로 흩어지죠 — 이 신호가 몇 σ짜리인지 재 봅시다."
        :steps="[
          { lhs: '\\sqrt{400}', answer: 20 },
          { lhs: '\\sigma = 1/\\sqrt{400}', answer: 0.05 },
          { lhs: '0.6 \\div \\sigma', answer: 12 },
        ]"
        :hints="['무작위 바닥의 폭 σ = 1/√d 부터.', '신호 ÷ 바닥 폭 = 몇 σ짜리 사건인지.']"
        explanation="0.6은 무작위 바닥의 12σ — 우연으로는 사실상 불가능한, 학습이 만든 신호입니다."
      />
      <Quiz
        difficulty="medium"
        question="거리 집중(모두 엇비슷하게 멀다)이 고차원 검색 실무에 주는 교훈은?"
        :choices="['점수의 절대값보다 순위(top-k)를 믿는 편이 안전하다', '거리를 두 번 계산해야 한다', '검색을 포기해야 한다', '저차원으로만 검색해야 한다']"
        :answer="0"
        :hints="['더 깊이 카드 — 임계값 규칙이 조심스러운 이유.']"
        explanation="절대 점수는 집중 때문에 다닥다닥 붙지만 순위는 살아 있습니다 — top-k 채택이 기본기가 되는 이유(7장)."
      />
      <Quiz
        difficulty="medium"
        question="저주에도 불구하고 임베딩 검색이 작동하는 핵심 이유는?"
        :choices="['임베딩은 무작위가 아니라, 관련된 것끼리 정렬되도록 학습된 벡터라서', '고차원에서는 모든 벡터가 자동으로 비슷해져서', '검색 엔진이 저주를 무시하도록 설정돼 있어서', '작동하지 않는다 — 저주 때문에 검색은 불가능하다']"
        :answer="0"
        explanation="무관한 쌍은 저주 덕에 0 바닥에 깔리고, 학습된 관련 쌍만 그 위로 솟습니다 — 저주가 잡음 제거기 역할을 해요."
      />
      <Quiz
        difficulty="medium"
        question="'거의 직교(cos ≈ 0)인 방향이 고차원에 지수적으로 많다'는 사실이 임베딩에 주는 이점은?"
        :choices="['수많은 개념을 서로 간섭 없이 담을 수 있는 용량이 생긴다', '계산이 공짜가 된다', '차원을 2개로 줄일 수 있다', '이점이 없다 — 단점일 뿐이다']"
        :answer="0"
        :hints="['1부 9장 — 차원은 독립 방향의 수. 거의 직교까지 허용하면?']"
        explanation="정확한 직교는 d개뿐이지만 거의 직교는 천문학적으로 많습니다 — 수백만 개념을 담는 넓은 도서관의 비밀."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="동료가 '우리 검색 임계값을 cos 0.5로 잡자. 0.35짜리는 관련 없는 문서다'라고 합니다. 이 장의 관점에서 가장 정확한 반론은?"
        :choices="['고차원 바닥은 0 ± 1/√d 수준이라 0.35도 강한 신호일 수 있다 — 절대 임계값보다 순위·데이터 검증이 먼저다', '0.5보다 0.9가 더 안전한 임계값이다', '코사인 대신 글자 수를 세는 게 낫다', '임계값은 항상 0이 정답이다']"
        :answer="0"
        :hints="['미니체크 — 0.3이 바닥의 몇 배였죠?']"
        explanation="점수는 바닥 대비로 읽어야 합니다. 임베딩 모델·도메인마다 점수 분포가 달라서, 임계값은 실제 데이터로 검증해 정하는 것(7장 recall@k)이 실무 정석이에요."
      />
      <Quiz
        difficulty="hard"
        question="'차원을 10만으로 올리면 검색 품질이 무조건 좋아질 것'이라는 주장의 문제점은?"
        :choices="['저장·계산 비용이 차원에 비례해 늘고, 데이터가 공간을 못 채우면 학습도 어려워진다 — 용량과 비용의 절충 문제', '10만 차원에서는 코사인이 정의되지 않는다', '차원은 법으로 1,024까지 제한된다', '문제없다 — 항상 높을수록 좋다']"
        :answer="0"
        explanation="용량은 늘지만 공짜가 아닙니다 — 실무 임베딩이 수백~수천 차원의 절충점에 모여 있는 이유예요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch4')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">4장 완료 — 고차원이 더 이상 무섭지 않아요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 5장 — 눈에 안 보이는 수백 차원 지도를 종이(2D)에 펴는 법, 차원 축소입니다.
        1부 8장의 PCA와 재회하고, t-SNE·UMAP 지도의 왜곡을 읽는 법을 배워요.
      </p>
      <RouterLink
        to="/ch/ch5"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        5장 — 지도 그리기, 차원 축소 →
      </RouterLink>
    </div>
  </article>
</template>
