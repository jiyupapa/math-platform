<script setup lang="ts">
// 8장 — 갈림길 지도: 탐색과 계획. 트리·분기 계수·지수 폭발, 탐욕 vs 빔 vs 되추적.
// 핵심 수치(SearchLab·노트북과 일치): 탐욕 15 / 빔2 18 / 빔3 27 / 전수 37, 방문 9/15/21/39.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import SearchLab from '@/components/SearchLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch8')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 8 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">갈림길 지도 — 탐색과 계획</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      에이전트가 "계획을 세운다"는 건 결국 <b>갈림길에서 길을 고르는 일</b>입니다. 어느 도구를
      먼저 쓸지, 어떤 순서로 단계를 밟을지 — 매 갈림마다 여러 갈래가 있고, 그 갈래가 또 갈라지죠.
      매번 <b>지금 가장 좋아 보이는 쪽</b>으로만 가면 될까요? 이 장에서 그 직관이 어떻게 함정에
      빠지는지, 그리고 얼마나 많이 "미리 가봐야" 좋은 길을 찾는지를 숫자로 확인합니다.
    </p>

    <ConceptCard tone="goal" title="이 장의 목표">
      계획을 <b>탐색 트리</b>로 보고, 세 가지 길찾기 전략 — <b>탐욕·빔 서치·전수 탐색</b> —
      의 품질과 비용을 비교합니다. <b>"넓게 볼수록 좋은 길을 찾지만, 전부 보는 건 지수적으로
      불가능하다"</b>는 저울을 손에 넣는 것이 목표예요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대 — 좋아 보이는 쪽으로만 가면</h2>
    <ReviewFlag id="ch8-s1" chapter="ch8" label="1. 무대 — 좋아 보이는 쪽으로만 가면" />
    <p class="leading-relaxed text-slate-700">
      에이전트 앞에 갈림길이 있습니다. 세 갈래(A·B·C) 각각에 "지금까지의 점수"가 붙어 있고,
      각 갈래는 또 세 갈래로 갈라져 3단계 깊이까지 이어집니다 — 끝까지 가면 총점이 정해지죠.
      가장 단순한 전략은 <b>탐욕</b>(greedy): 매 갈림에서 점수가 가장 높은 쪽만 따라갑니다.
      빠르고 적게 보지만 — 지금 최고가 끝까지 최고일까요? 아래에서 네 전략을 직접 돌려
      비교해 보세요.
    </p>

    <SearchLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 넓게 볼수록 좋지만, 전부 보는 건 비싸다">
      탐욕은 첫 갈림의 최고점 A(10점)를 덥석 물었다가 <b>총점 15</b>에 갇힙니다. 정작 진짜
      보물(총점 37)은 첫 갈림에서 <b>가장 낮아 보였던</b> C(6점) 아래 숨어 있었어요 — 눈앞의
      점수만 보면 절대 못 갑니다. <b>빔 서치</b>는 길을 여러 개 들고 가며 절충합니다: k=2는 18점,
      k=3은 27점 — 넓게 볼수록 나아지죠. 하지만 진짜 최적을 찾는 건 <b>전수 탐색</b>뿐이고,
      대가는 방문 노드 <b>39개 전부</b>(탐욕은 9개)였습니다. 품질과 비용은 맞바꾸는 관계예요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="탐욕 전략이 총점 15점에 갇힌 근본 이유는?"
      :choices="['눈앞의 최고점만 보고 따라가, 지금은 낮아 보여도 끝이 좋은 길(C 아래 37점)을 안 봐서', '계산 실수를 해서', '트리가 너무 작아서', '점수가 무작위라서']"
      :answer="0"
      :hints="['랩에서 탐욕이 방문한 노란 노드가 몇 개였는지, C 가지를 봤는지 확인해 보세요.']"
      explanation="탐욕은 근시안입니다 — 매 갈림의 국소 최선만 좇죠. 첫 갈림에서 C(6)는 A(10)보다 낮아 보였지만 그 아래 30점짜리 잎이 있었어요. 미리 가보지 않으면 못 찾는 구조입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 세 용어에 이름표 달기</h2>
    <ReviewFlag id="ch8-s2" chapter="ch8" label="2. 세 용어에 이름표 달기" />
    <ConceptCard tone="note" title="새 용어: 탐색 트리 / 분기 계수 / 빔 서치">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>탐색 트리</b> (search tree) — 읽는 법: 서치 트리.
          뜻: 선택마다 갈라지는 <b>가능한 길 전체의 지도</b> — 이 과정의 비유로는 <b>갈림길 지도</b>.
          뿌리(현재 상태)에서 잎(완성된 계획)까지, 각 갈래가 하나의 선택입니다.
        </li>
        <li>
          <b>분기 계수</b> (branching factor) — 읽는 법: 브랜칭 팩터.
          뜻: <b>한 갈림에서 갈라지는 갈래 수</b>. 랩에선 3이었죠. 이게 크면 지도가 순식간에
          넓어집니다 — 아래에서 볼 지수 폭발의 밑(base)이에요.
        </li>
        <li>
          <b>빔 서치</b> (beam search) — 읽는 법: 빔 서치.
          뜻: <b>매 단계에서 유망한 상위 k개 길만 들고 전진</b>하는 절충안. <b>k=1이면 탐욕</b>과
          같고, k를 무한히 키우면 전수 탐색이 됩니다 — 폭 k가 품질과 비용을 정하는 다이얼이에요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="빔 서치에서 빔 폭 k를 1로 두면 어떤 전략과 똑같아지나?"
      :choices="['탐욕 — 매 단계 최고 하나만 들고 가므로', '전수 탐색', '되추적', '무작위 선택']"
      :answer="0"
      explanation="k=1이면 매 단계 상위 1개(=최고 하나)만 유지하니 탐욕과 같습니다. k를 키울수록 더 많은 길을 저울질하다가, k가 전체 경로 수만큼 크면 전수 탐색이 되죠. 빔은 탐욕과 전수 사이의 다이얼이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 왜 전수 탐색은 대개 불가능한가 — 지수 폭발</h2>
    <ReviewFlag id="ch8-s3" chapter="ch8" label="3. 왜 전수 탐색은 대개 불가능한가 — 지수 폭발" />
    <p class="leading-relaxed text-slate-700">
      랩의 트리는 3단계라 경로가 3³ = 27개뿐이었습니다. 그런데 갈림이 <b>깊어지면</b> 경로 수는
      더하기가 아니라 <b>곱하기</b>로 늘어요 — 분기 계수 b, 깊이 d일 때:
    </p>
    <MathBlock expr="\text{경로 수} = b^{d}" />
    <p class="leading-relaxed text-slate-700">
      2부 7장에서 만난 그 <b>지수</b>입니다. 분기 3에 깊이가 4만 돼도 3⁴ = 81, 분기 4·깊이 5면
      4⁵ = 1,024, 조금만 더 깊어지면 수백만·수십억으로 폭발하죠. 그래서 실전에서 "모든 길을 다
      가보는" 전수 탐색은 거의 언제나 불가능하고, 모든 탐색 전략은 결국 <b>"어디를 안 볼
      것인가"</b>의 기술이 됩니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습 — 분기 4, 깊이 5의 경로 수를 단계별로</p>
    <StepQuiz
      difficulty="medium"
      question="분기 계수 4, 깊이 5인 탐색 트리의 전체 경로 수(4⁵)를 계산해 보세요."
      :steps="[
        { lhs: '4^2 = ?', answer: 16 },
        { lhs: '4^4 = 16 \\times 16 = ?', answer: 256 },
        { lhs: '4^5 = 256 \\times 4 = ?', answer: 1024 },
      ]"
      :hints="['제곱을 쌓아 올리면 됩니다 — 4²를 제곱하면 4⁴, 거기에 4를 한 번 더.']"
      explanation="4² = 16, 그 제곱이 4⁴ = 256, 마지막에 4를 곱하면 4⁵ = 1,024. 갈림 다섯 번에 벌써 천 갈래 — 이게 지수 폭발이고, 전수 탐색을 포기하게 만드는 힘입니다."
    />

    <DetailsCard title="➕ 더 깊이: 빔도 완벽하진 않다 · 미리 가보기의 값">
      빔 서치는 탐욕보다 낫지만 <b>최적을 보장하지 않습니다</b> — 랩의 빔 k=3도 최적(37)을
      놓쳤죠. 좋은 길의 <b>중간 점수가 낮으면</b> 끝이 아무리 좋아도 일찍 잘려 나가거든요
      (부분합 기준 가지치기의 한계). 그래서 등장하는 게 <b>되추적</b>(backtracking): 막다른
      길에 몰리면 갈림길로 되돌아와 다른 갈래를 시도합니다. 코딩 에이전트가 "이 접근이 안
      되네, 되돌아가자" 하는 게 바로 이거예요. 한 걸음 더 나아간 <b>미리 가보기</b>(lookahead·
      시뮬레이션)는 몇 수 앞을 실제로 두어 보고 평균 결과로 갈래를 평가합니다 — 바둑·체스
      AI의 수읽기(정식 이름 <b>MCTS</b>, 몬테카를로 트리 탐색)가 그 정점이고요. 공통점은
      분명합니다: <b>b^d를 다 볼 수 없으니, 어디를 얼마나 볼지를 똑똑하게 정하는 것</b>이
      계획의 전부입니다.
    </DetailsCard>

    <ReviewFlag id="ch8-ai" chapter="ch8" label="🤖 AI 연결 — LLM은 매 단어에서 갈림길을 만난다" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — LLM은 매 단어에서 갈림길을 만난다">
      사실 LLM은 <b>단어 하나를 뽑을 때마다</b> 어휘 수만 갈래(5만 개도 넘는)의 갈림길에
      섭니다 — <b><PartLink :part="4" ch="ch12">4부 12장</PartLink></b>의 샘플링(temperature·
      top-k)이 바로 그 갈림에서 다음 걸음을 고르는 방법이었죠. 에이전트의 계획 탐색은 그
      한 걸음을 <b>여러 수 앞까지</b> 넓힌 것입니다. 지수 폭발의 밑이 되는 갈래 수와 깊이는
      <b><PartLink :part="2" ch="ch7">2부 7장</PartLink></b>의 지수 그대로이고요. 실무에서
      코딩 에이전트가 여러 접근을 시도하고 막히면 되돌아가는 것, 추론 모델이 여러 풀이 경로를
      펼쳐 보는 것 — 전부 이 장의 탐색·되추적입니다. 다음 장은 갈림길을 <b>여럿이 나눠</b>
      탐색하는 이야기, 멀티에이전트 협업이에요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="갈림길 지도 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="탐색 트리에서 '분기 계수'(branching factor)는 무엇을 뜻하나?"
        :choices="['한 갈림에서 갈라지는 갈래(선택지)의 수', '트리의 전체 깊이', '최적 경로의 총점', '방문한 노드의 수']"
        :answer="0"
        explanation="분기 계수는 한 갈림의 갈래 수 — 지수 폭발 b^d의 밑(b)입니다. 랩에서는 3이었죠."
      />
      <Quiz
        difficulty="easy"
        question="탐욕 전략은 매 갈림의 최고점만 따라가므로 항상 전체 최적을 찾는다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 지금 낮아 보이는 길이 끝이 더 좋을 수 있어요 — 랩에서 탐욕은 15점, 진짜 최적은 37점이었죠. 근시안이 함정에 빠지는 겁니다."
      />
      <Quiz
        difficulty="easy"
        question="분기 계수 3, 깊이 4인 트리의 전체 경로 수는? (숫자로)"
        type="numeric"
        :answer="81"
        :hints="['3을 네 번 곱하면 됩니다.']"
        explanation="3⁴ = 81. 깊이가 하나 늘 때마다 경로 수가 분기 계수만큼 곱해집니다 — 이게 지수 폭발이에요."
      />
      <Quiz
        difficulty="easy"
        question="빔 서치에서 빔 폭 k를 트리의 전체 경로 수만큼 크게 키우면 어떤 전략이 되나?"
        :choices="['전수 탐색 — 어떤 길도 버리지 않으므로', '탐욕', '되추적', '무작위']"
        :answer="0"
        explanation="k가 충분히 크면 아무 길도 가지치기하지 않아 전수 탐색과 같아집니다. k=1은 탐욕 — 빔은 그 사이를 잇는 다이얼이에요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="랩에서 빔 폭을 k=2에서 k=3으로 늘렸더니 총점이 18 → 27로 올랐다. 대신 치른 대가는?"
        :choices="['방문 노드가 15 → 21개로 늘었다 — 넓게 볼수록 품질은 오르지만 비용도 오른다', '총점이 대신 깎였다', '트리 깊이가 줄었다', '아무 대가도 없었다']"
        :answer="0"
        :hints="['랩의 방문 노드 수 칸을 두 전략에서 비교해 보세요.']"
        explanation="빔 폭 k는 품질↔비용의 다이얼입니다. 넓힐수록 좋은 길을 찾을 확률은 오르지만 봐야 할 노드도 늘죠 — 공짜 점심은 없습니다."
      />
      <Quiz
        difficulty="medium"
        question="실전에서 '모든 길을 다 가보는' 전수 탐색이 거의 불가능한 이유는?"
        :choices="['경로 수가 분기^깊이(b^d)로 지수 폭발해 — 깊이 몇 칸만 늘어도 수십억이 된다', '컴퓨터가 트리를 이해하지 못해서', '점수가 매번 바뀌어서', '전수 탐색은 항상 틀린 답을 주므로']"
        :answer="0"
        explanation="b^d의 지수 성장 때문입니다 — 그래서 모든 실전 탐색은 '어디를 안 볼 것인가'(가지치기)의 기술이 됩니다."
      />
      <Quiz
        difficulty="medium"
        question="빔 서치가 랩에서 최적(37)을 놓친 이유로 가장 알맞은 것은?"
        :choices="['최적 경로의 중간(부분합)이 낮아, 끝이 좋기 전에 상위 k 밖으로 밀려 가지치기됐다', '빔 서치는 원래 아무 답도 못 찾는다', '트리가 너무 얕아서', '분기 계수가 3이라서']"
        :answer="0"
        :hints="['빔은 매 단계 무엇을 기준으로 상위 k개를 고르나요?']"
        explanation="빔은 지금까지의 부분합으로 상위 k개를 고릅니다 — 중간이 시원찮으면 끝이 아무리 좋아도 일찍 잘려요. 그래서 빔은 최적을 보장하지 못합니다."
      />
      <Quiz
        difficulty="medium"
        question="'되추적'(backtracking)이 코딩 에이전트에서 나타나는 모습으로 가장 알맞은 것은?"
        :choices="['한 접근이 막다른 길이면 이전 갈림으로 돌아가 다른 접근을 시도한다', '코드를 무조건 처음부터 다시 쓴다', '더 큰 모델로 교체한다', '사용자에게 답을 떠넘긴다']"
        :answer="0"
        explanation="되추적은 막힌 길에서 갈림으로 되돌아가 다른 갈래를 여는 것 — 에이전트가 '이 방법 안 되네, 다른 걸로' 하는 행동입니다. 탐욕에는 없는, 탐색이 주는 능력이죠."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="랩의 트리에서 최적 경로(37점)는 첫 갈림에서 가장 낮은 C(6점) 아래 있었다. 이 구조가 주는 교훈으로 가장 정확한 것은?"
        :choices="['국소 정보(눈앞 점수)만으로는 전역 최적을 알 수 없다 — 겉보기 나쁜 초반이 최선으로 이어질 수 있어 미리 가봐야 한다', '항상 최저점 가지를 골라야 한다', '첫 점수가 높은 가지는 언제나 함정이다', '트리 탐색은 쓸모가 없다']"
        :answer="0"
        :hints="['교훈은 “C를 고르라”가 아니라 “눈앞 점수로 단정하지 말라”입니다.']"
        explanation="핵심은 특정 가지를 고르라가 아니라, 국소 점수가 전역 결과를 말해 주지 않는다는 것 — 그래서 탐욕은 위험하고, 얼마나 미리 가볼지(빔 폭·되추적)가 계획의 질을 정합니다."
      />
      <Quiz
        difficulty="hard"
        question="어떤 계획 과업의 탐색 트리가 분기 5·깊이 12라 전수 탐색이 불가능하다(5¹²는 약 2억 4천만). 실전 에이전트의 현실적인 선택으로 가장 알맞은 것은?"
        :choices="['빔 폭 k를 비용이 감당되는 선에서 정해 유망한 길만 넓게 보고, 막히면 되추적한다 — 최적 보장을 버리고 비용 대비 품질을 택한다', '2억 4천만 경로를 전부 계산한다', '분기 계수를 1로 강제해 탐욕만 쓴다', '깊이를 0으로 만든다']"
        :answer="0"
        :hints="['전수는 불가능하고 탐욕은 함정 — 그 사이의 다이얼이 무엇이었나요?']"
        explanation="b^d가 폭발하면 전수는 포기해야 하고, 탐욕만 쓰면 함정에 빠집니다. 현실적 답은 그 사이의 빔 폭을 예산에 맞춰 정하고(품질↔비용), 되추적으로 막힌 길을 보완하는 것 — 7장의 '생각의 길이'처럼 계획에도 컴퓨트 예산의 저울질이 들어갑니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch8')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">8장 완료 — 계획의 수학을 손에 넣었습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        탐욕의 함정, 빔 폭의 저울, 지수 폭발까지 — 이제 "미리 얼마나 볼까"가 계산됩니다.
        다음은 9장 — 갈림길을 여럿이 나눠 맡는 이야기, 멀티에이전트 협업입니다.
      </p>
      <RouterLink
        to="/ch/ch9"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        9장 — 여럿이 하기 →
      </RouterLink>
    </div>
  </article>
</template>
