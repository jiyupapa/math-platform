<script setup lang="ts">
// 10장 — 기억의 경제학: 컨텍스트 예산. 유한한 책상(컨텍스트 윈도) 위 냅색 게임.
// 핵심 수치(ContextLab·노트북 전수 탐색과 일치): 예산 8,000 / 시작 9,600(과적재) / 최적 요약+A+B+E1+E2 = 88점.
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ContextLab from '@/components/ContextLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch10')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 10 · 약 35분</p>
    <h1 class="mb-4 text-3xl font-bold">기억의 경제학 — 컨텍스트 예산</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      9장에서 분업의 숨은 이득이 <b>작은 컨텍스트</b>였죠 — 몫이 작아지면 걸음 정확도 자체가
      오른다고요. 이번 장은 그 "책상 위 서류 더미"를 정면으로 다룹니다. 에이전트의 기억은
      무한하지 않아요. 한 번에 읽을 수 있는 양이 정해져 있고(예산), 긴 일일수록 지금까지의
      작업 기록이 그 예산을 야금야금 먹습니다. <b>무엇을 올려두고 무엇을 내려놓을까</b> —
      이것이 기억의 경제학입니다.
    </p>

    <ConceptCard tone="goal" title="이 장의 목표">
      한정된 <b>컨텍스트 예산</b> 안에서 정보를 골라 담는 문제가 사실은 <b>배낭 문제(knapsack)</b>
      라는 것을 보고, <b>요약 = 손실 압축</b>, <b>필요한 것만 가져오기 = 검색(RAG)</b> 이라는
      두 도구를 손에 넣습니다. 핵심 문장: <b>"다 넣는 것이 최선이 아니다 — 밀도가 답이다."</b>
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대 — 책상이 넘친다</h2>
    <p class="leading-relaxed text-slate-700">
      에이전트에게 사무 업무를 맡겼습니다. 시스템 규칙, 과업 설명, 지금까지의 작업 기록(궤적),
      참고 문서 몇 개, 모범 예시… 도움이 될 것 같아 전부 책상에 올려두는 게 인지상정이죠.
      그런데 책상 크기(예산)는 <b>8,000토큰</b>인데, 다 끌어모으면 <b>9,600토큰</b> — 책상이
      넘쳐서 모델이 아예 읽지를 못합니다. 게다가 자리를 차지하는 것들의 값어치가 제각각이에요.
      아래 실험실에서 무엇을 올리고 내릴지 직접 골라 보세요.
    </p>

    <ContextLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 크기가 아니라 밀도">
      시작 상태(원본 궤적 + 문서 + 잡동사니)는 <b>9,600토큰으로 예산 초과</b> — 점수를 매길
      수조차 없습니다. 여기서 두 가지를 바꾸면 최적에 도달해요. ① <b>원본 궤적(3,600토큰)</b>을
      <b>요약(900토큰)</b>으로 압축 — 점수는 20→14로 6점 잃지만 <b>2,700토큰</b>이 열립니다.
      ② 그 자리에 <b>밀도 높은 항목</b>(핵심 사양서 +16, 예시 +11)을 채우고, <b>잡동사니(−3)</b>는
      내려놓습니다. 결과는 <b>7,300토큰 / 88점</b> — 넘치던 책상이 예산 안에 들어오면서
      점수는 오히려 최고가 됐죠. 크기를 줄이는 게 손해가 아니라, <b>토큰당 값어치(밀도)</b>가
      낮은 것을 밀도 높은 것으로 바꾸는 거래였던 겁니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="시작 상태(9,600토큰)에서 가장 먼저 해야 할 일은?"
      :choices="['예산(8,000)을 넘겼으니 무언가를 내려놓아 먼저 예산 안으로 — 초과하면 점수가 무효다', '문서를 더 추가해 점수를 올린다', '예산을 무시하고 그대로 제출한다', '궤적을 원본 그대로 두고 예시를 뺀다']"
      :answer="0"
      :hints="['랩에서 예산을 초과하면 점수판에 무엇이라고 뜨나요?']"
      explanation="컨텍스트 윈도를 넘으면 모델이 읽을 수 없으니 점수가 무효입니다 — 최적화는 그 다음 문제예요. 잡동사니(−3, 밀도 최저)부터, 그리고 원본 궤적을 요약으로 바꾸는 것이 정석입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 이름표 달기 — 배낭·압축·검색</h2>
    <p class="leading-relaxed text-slate-700">
      방금 푼 문제는 사실 아주 유명한 수학 문제입니다. <b>정해진 크기의 배낭</b>에 <b>값어치가
      다른 물건들</b>을 담아 <b>총 값어치를 최대로</b> 하는 것 — 배낭 문제(knapsack)죠. 그리고
      우리가 쓴 두 도구에도 정식 이름이 있습니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 컨텍스트 윈도 / 손실 압축 / 검색 증강(RAG)">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>컨텍스트 윈도</b> (context window) — 읽는 법: 컨텍스트 윈도.
          뜻: 모델이 <b>한 번에 읽을 수 있는 최대 토큰 수</b> — 이 과정의 비유로는
          <b>책상 위 서류 더미</b>. 책상이 아무리 커져도 유한하고, 채울수록 비용(7장)도 늡니다.
        </li>
        <li>
          <b>손실 압축</b> (lossy compression) — 읽는 법: 손실 압축.
          뜻: 원본을 <b>더 작게 줄이되 일부 정보를 잃는</b> 것 — 요약이 바로 이것입니다
          (궤적 3,600→900토큰, 점수 20→14). 사진을 JPG로 줄이는 것과 같은 수학
          (<b><PartLink :part="5" ch="ch2">5부 2장</PartLink></b> 압축의 그 이야기).
        </li>
        <li>
          <b>검색 증강</b> (RAG, retrieval-augmented generation) — 읽는 법: 래그(검색 증강).
          뜻: 모든 문서를 책상에 쌓지 않고 <b>필요한 것만 서고에서 꺼내</b> 오는 것 —
          문서 C(관련성 낮음, +4)를 애초에 안 담는 판단이 바로 검색의 정신입니다
          (<b><PartLink :part="7" ch="ch8">7부 8장</PartLink></b> RAG).
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'잡동사니(지난 잡담 로그)'의 기여 점수가 −3으로 음수인 것은 무엇을 뜻하나?"
      :choices="['자리만 차지하는 게 아니라 오히려 방해가 된다 — 관련 없는 내용이 모델의 주의를 흩뜨린다', '토큰이 부족하다는 신호다', '점수 계산의 버그다', '언젠가 쓸모 있으니 남겨둬야 한다']"
      :answer="0"
      :hints="['밀도 배지가 유일하게 빨간색인 항목이었죠.']"
      explanation="컨텍스트는 많이 넣을수록 좋은 게 아닙니다 — 무관한 정보는 공간을 먹는 데 그치지 않고 주의를 희석해 성능을 깎아요(음수 기여). '길수록 좋다'는 직관이 틀리는 이유입니다."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습 — 요약이라는 거래</p>
    <StepQuiz
      difficulty="medium"
      question="원본 궤적(3,600토큰·+20점)을 요약(900토큰·+14점)으로 바꾸고, 절약한 토큰에 문서 A(1,500·+16)와 예시(1,200·+11)를 담는다. 이 거래를 단계별로 계산해 보세요."
      :steps="[
        { lhs: '3600 - 900 = ?', answer: 2700, tolerance: 0 },
        { lhs: '1500 + 1200 = ?', answer: 2700, tolerance: 0 },
        { lhs: '(14 - 20) + 16 + 11 = ?', answer: 21, tolerance: 0 },
      ]"
      :hints="['먼저 요약으로 열리는 공간, 다음 그 공간에 딱 들어가는 두 항목, 마지막 순 점수 변화.']"
      explanation="요약은 2,700토큰을 열고(3600−900), 그 자리에 딱 맞는 A+예시(1500+1200=2700)를 담습니다. 순 점수는 요약 손실 −6에 새 항목 +16·+11을 더해 +21 — 압축은 그 자체론 손해지만, 밀도 높은 것으로 자리를 바꾸면 순증입니다."
    />

    <DetailsCard title="➕ 더 깊이: 배낭 문제의 함정과 정직한 각주">
      <b>밀도 높은 것부터 담기(탐욕)</b>는 대체로 잘 통하고, 이번 예제에서도 최적과 일치합니다.
      하지만 칸이 딱 안 맞을 때는 어긋날 수 있어요 — 밀도는 조금 낮아도 크기가 맞아떨어져
      빈틈을 없애는 조합이 이길 때가 있습니다(그래서 배낭 문제는 일반적으로 전수 탐색이나
      동적 계획법이 필요하죠). 정직한 각주 셋: ① 이 장의 기여 점수는 <b>교육용 toy 모형</b>
      입니다 — 실전에서 각 항목의 값어치는 <b>넣고 빼며 재는 실측(ablation)</b>으로 정합니다.
      ② 컨텍스트 윈도가 아무리 커져도 <b>"다 넣기"는 답이 아니에요</b> — 토큰마다 비용이
      붙고(7장), 무관한 내용은 오히려 방해(−3)니까요. ③ <b>요약은 되돌릴 수 없습니다</b> —
      그래서 실무는 원본을 <b>서고(장기 기억)</b>에 남기고 <b>요약을 책상(단기 기억)</b>에
      올린 뒤, 필요하면 서고에서 원본을 다시 검색합니다.
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 단기 기억과 장기 서고">
      실무 에이전트의 메모리는 정확히 이 구조입니다 — <b>단기 기억</b>은 지금 책상에 올린
      컨텍스트 윈도, <b>장기 기억</b>은 벡터 서고에 넣어 두고 필요할 때 꺼내 오는
      <b><PartLink :part="7" ch="ch8">7부 8장</PartLink></b>의 RAG예요. 궤적이 길어지면
      요약해 압축하고(<b><PartLink :part="5" ch="ch2">5부 2장</PartLink></b> 손실 압축),
      원본은 서고로 보냅니다. 재밌게도 지금 여러분과 대화하는 이 시리즈의 AI 튜터도 같은
      설계예요 — 전체 교재를 다 읽는 게 아니라 <b>지금 보는 챕터의 맥락만 골라</b> 책상에
      올려서 답합니다. 다음은 마지막 판정의 장 — 에이전트를 어떻게 채점하는지, 성적표의
      수학입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="기억의 경제학 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="'컨텍스트 윈도'가 뜻하는 것은?"
        :choices="['모델이 한 번에 읽을 수 있는 최대 토큰 수 — 유한한 책상', '모델의 학습 데이터 전체', '인터넷 검색창', '토큰당 가격표']"
        :answer="0"
        explanation="컨텍스트 윈도 = 한 번에 올릴 수 있는 서류 더미의 최대 크기입니다. 유한하기 때문에 무엇을 담을지가 전략이 되죠."
      />
      <Quiz
        difficulty="easy"
        question="긴 컨텍스트에 정보를 많이 넣을수록 에이전트 성능은 항상 좋아진다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 무관한 정보(잡동사니 −3)는 주의를 흩뜨려 오히려 성능을 깎고, 토큰 비용도 늘어요. 크기가 아니라 밀도가 답입니다."
      />
      <Quiz
        difficulty="easy"
        question="원본 궤적(3,600토큰)을 요약(900토큰)으로 바꾸면 열리는 토큰 공간은? (정수)"
        type="numeric"
        :answer="2700"
        :hints="['3600에서 900을 빼세요.']"
        explanation="3,600 − 900 = 2,700토큰. 이 공간에 밀도 높은 항목을 담는 것이 요약이라는 거래의 목적입니다."
      />
      <Quiz
        difficulty="easy"
        question="요약(손실 압축)과 검색(RAG)의 차이로 가장 알맞은 것은?"
        :choices="['요약은 있는 것을 줄이는 것, 검색은 필요한 것만 꺼내 오는 것', '둘은 완전히 같은 기법이다', '요약은 토큰을 늘리고 검색은 줄인다', '검색은 손실이 없고 요약도 손실이 없다']"
        :answer="0"
        explanation="요약은 책상 위 서류를 압축하고, 검색은 서고에서 필요한 파일만 가져옵니다 — 둘 다 유한한 책상을 지키는 도구이지만 방향이 달라요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="이 컨텍스트 최적화 문제의 정식 이름은?"
        :choices="['배낭 문제(knapsack) — 정해진 용량에 값어치 다른 물건을 담아 총 값어치 최대화', '정렬 문제', '최단 경로 문제', '소인수분해']"
        :answer="0"
        :hints="['배낭 크기 = 예산, 물건의 무게 = 토큰, 값어치 = 기여 점수.']"
        explanation="예산(용량) 안에서 토큰(무게)당 기여(값어치)를 최대화하는 것 — 전형적인 배낭 문제입니다. 그래서 밀도(값어치/무게)가 좋은 나침반이 되죠."
      />
      <Quiz
        difficulty="medium"
        question="문서 C(1,500토큰·+4점)를 책상에 올리지 않기로 한 판단의 근거는?"
        :choices="['밀도(토큰당 값어치)가 낮아 같은 공간에 더 값진 것을 담는 게 낫다', '문서 C는 항상 틀린 정보다', '토큰 수가 홀수라서', '문서는 무조건 A만 써야 해서']"
        :answer="0"
        :hints="['C의 밀도(4/1500)를 A의 밀도(16/1500)와 비교해 보세요.']"
        explanation="C의 밀도는 2.7(점/1k토큰)로 A의 10.7에 크게 못 미칩니다 — 관련성 낮은 문서를 애초에 안 담는 것이 곧 검색(RAG)의 정신이에요. 서고에 두고 필요할 때만 꺼내면 됩니다."
      />
      <Quiz
        difficulty="medium"
        question="'요약은 되돌릴 수 없다'는 사실 때문에 실무가 택하는 설계는?"
        :choices="['원본은 서고(장기 기억)에 남기고 요약을 책상(단기 기억)에 올린 뒤, 필요하면 원본을 다시 검색', '요약을 만들면 원본을 즉시 삭제', '요약을 절대 만들지 않는다', '원본과 요약을 둘 다 책상에 올린다']"
        :answer="0"
        explanation="손실 압축은 잃은 정보를 복구할 수 없으니, 원본을 서고에 보존하고 책상에는 요약만 둡니다 — 단기 기억(컨텍스트)과 장기 기억(벡터 서고)을 나누는 이유죠."
      />
      <Quiz
        difficulty="medium"
        question="원본 궤적을 요약으로 바꾸는 거래의 순 점수 변화는? (요약 −6, 새로 담은 A +16·예시 +11)"
        type="numeric"
        :answer="21"
        :hints="['−6 + 16 + 11 을 계산하세요.']"
        explanation="(14−20) + 16 + 11 = +21. 압축 자체는 −6 손해지만, 열린 공간을 밀도 높은 항목으로 채워 순증을 만듭니다 — 요약의 진짜 값어치는 '자리 바꾸기'에 있어요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="한 팀이 '컨텍스트 윈도가 커졌으니 관련 문서를 전부 넣자'고 한다. 이 장의 눈으로 본 문제점은?"
        :choices="['토큰마다 비용이 붙고(7장), 관련 없는 문서는 주의를 흩뜨려 성능을 오히려 깎을 수 있다 — 큰 책상도 밀도가 답이다', '큰 윈도에서는 배낭 문제가 사라진다', '문서를 다 넣으면 요약이 필요 없어 항상 이득이다', '윈도가 커지면 잡동사니의 음수 기여가 양수가 된다']"
        :answer="0"
        :hints="['잡동사니의 −3, 그리고 7장의 비용을 떠올리세요.']"
        explanation="윈도가 커져도 비용은 토큰에 비례하고(7장 생각의 길이), 무관한 내용은 −3처럼 방해가 됩니다. 용량이 늘면 배낭이 커질 뿐 문제 자체는 그대로 — 여전히 밀도로 골라야 해요."
      />
      <Quiz
        difficulty="hard"
        question="'밀도 높은 것부터 담기(탐욕)'가 최적을 놓칠 수 있는 이유로 가장 정확한 것은?"
        :choices="['밀도는 조금 낮아도 크기가 예산에 딱 맞아 빈틈을 없애는 조합이 이길 때가 있다 — 배낭 문제는 일반적으로 전수 탐색·동적 계획법이 필요', '탐욕은 항상 최악의 답을 준다', '밀도 계산이 불가능해서', '음수 항목이 있으면 탐욕이 무한 루프에 빠져서']"
        :answer="0"
        :hints="['이번 예제에선 탐욕이 최적과 일치했지만, 그게 보장은 아니라는 점.']"
        explanation="탐욕은 빠른 나침반이지만, 남는 칸을 못 채워 손해 볼 수 있습니다 — 크기가 맞아떨어지는 조합이 밀도 순서를 뒤집는 경우죠. 그래서 정확한 최적은 전수 탐색(작을 때)이나 동적 계획법으로 확인합니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch10')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">10장 완료 — 기억의 경제학을 손에 넣었습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        예산·밀도·압축·검색까지 — 이제 컨텍스트를 채우는 것도 곱셈과 곱하기(비용) 사이의
        거래로 읽힙니다. 다음은 마지막 판정 — 11장, 에이전트의 성적표(pass@k와 오차범위).
      </p>
      <RouterLink
        to="/ch/ch11"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        11장 — 에이전트의 성적표 →
      </RouterLink>
    </div>
  </article>
</template>
