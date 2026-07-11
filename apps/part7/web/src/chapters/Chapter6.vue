<script setup lang="ts">
// 6장 — 이웃 찾기: kNN 전수조사의 비용 → 근사 최근접 이웃(ANN) → 벡터 DB의 정체.
// 새 수학보다 공학의 장 — 밑바닥 수학(내적·클러스터·집중)은 2~4장의 회수.
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import NeighborSearchLab from '@/components/NeighborSearchLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch6')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">6장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">이웃 찾기 — kNN에서 벡터 DB까지</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      자(2장)도 있고 공간의 성질(3~5장)도 알았으니, 이제 실전 질문입니다 —
      <b>수백만 개 문서 중 질문과 가장 가까운 것을 어떻게 순식간에 찾을까?</b>
      "다 재보면 되지"의 비용을 먼저 계산해 보고, 실무의 해법(미리 정리해 두기)과
      그 대가(가끔 놓침)까지 — 벡터 DB라는 이름의 정체를 이 장에서 밝힙니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 개념을 정확히 구분하게 됩니다 — ① <b>kNN</b>(전수조사: 정확하지만 문서 수에 비례하는 비용),
      ② <b>ANN</b>(근사 최근접 이웃: 미리 정리해 두고 일부만 조사 — 빠르지만 가끔 놓침),
      ③ <b>벡터 DB</b>(임베딩 저장소 + ANN 색인 + 필터). 그리고 "우리 회사엔 뭐가 필요한가"를
      스스로 판단할 수 있는 규모 감각까지.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 정직한 방법 — kNN 전수조사</h2>
    <p class="leading-relaxed text-slate-700">
      질문 벡터와 <b>모든</b> 문서 벡터의 유사도(내적)를 재서 가장 가까운 k개를 뽑는 것 —
      <b>k-최근접 이웃</b>(kNN) 검색이라 부릅니다. 항상 진짜 1등을 찾는 완벽히 정확한 방법이고,
      코드도 몇 줄이면 끝나요. 유일한 문제는 <b>비용이 문서 수에 정비례</b>한다는 것.
      그게 어느 규모부터 문제가 되는지, 청구서를 직접 확인해 보세요.
    </p>

    <NeighborSearchLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 규모가 방법을 고른다">
      실험 ①의 교훈: 수천~수십만 건이면 <b>전수조사도 밀리초</b>입니다 — 사내 문서 규모에선
      정직한 kNN이 최선일 때가 많아요. 수백만~수억 건부터 선형 비용이 목을 조입니다.
      그때의 해법이 실험 ②의 <b>미리 정리해 두기</b>: 문서들을 구역(클러스터)으로 나눠 놓고
      질문이 떨어진 구역 근처만 조사 — 비교 횟수가 뚝 떨어지는 대신,
      <b>경계의 질문에서 진짜 1등을 놓칠 수 있습니다.</b> 정확도와 속도의 거래죠.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="kNN 전수조사의 비용이 커지는 방식은?"
      :choices="['문서 수에 정비례 (10배 많으면 10배 느림)', '문서 수와 무관하게 일정', '문서 수의 제곱에 비례', '문서가 많을수록 오히려 빨라짐']"
      :answer="0"
      explanation="질문마다 모든 문서와 비교하니 선형 비용 — 1천 건에선 공짜지만 10억 건에선 재앙이 되는 이유입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 근사의 기술 — ANN</h2>
    <p class="leading-relaxed text-slate-700">
      실험 ②의 구역 나누기가 실제 기술의 축소판입니다. 이렇게 <b>정확함을 조금 양보하고
      속도를 크게 버는</b> 계열을 <b>근사 최근접 이웃</b>(ANN, Approximate Nearest Neighbor)
      검색이라 불러요. 경계에서 놓치는 문제도 봤죠 — 그래서 실전에는 조절 손잡이가 있습니다:
      <b>구역을 몇 개나 살필지</b>(실험 ②의 "구역 2개") 늘리면 정확도가 올라가고 속도가 내려갑니다.
      얼마나 놓치는지 재는 성적표(재현율)는 7장에서 만들어요.
    </p>
    <p class="mt-2 leading-relaxed text-slate-700">
      그런데 근사가 통하는 이유를 우리는 이미 압니다 — 임베딩 공간이 <b>클러스터 구조</b>(3장)라서
      "질문 근처 구역"이 대체로 옳고, 학습된 신호가 무작위 바닥에서 <b>뚜렷이 솟아</b>(4장) 있어서
      진짜 1등 대신 2~3등을 찾아도 대개 충분히 좋은 문서이기 때문입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: kNN / ANN / 벡터 DB">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>kNN</b> (k-Nearest Neighbors, k-최근접 이웃) — 읽는 법: 케이엔엔.
          뜻: 질문과 가장 가까운 <b>k개</b>를 찾는 검색. 전수조사로 하면 정확하지만 비용이 선형.
        </li>
        <li>
          <b>ANN</b> (Approximate Nearest Neighbor, 근사 최근접 이웃) — 읽는 법: 에이엔엔.
          뜻: 미리 만든 <b>색인</b>(구역·그래프)으로 일부만 조사해 <b>거의 맞는</b> 이웃을 빨리 찾는 기술.
          정확도↔속도 조절 손잡이가 있습니다.
        </li>
        <li>
          <b>벡터 DB</b> (vector database) — 읽는 법: 벡터 디비.
          뜻: <b>임베딩 저장 + ANN 색인 + 메타데이터 필터</b>(부서·권한·날짜)를 묶어 파는 데이터베이스.
          유사도 옵션(cosine/dot/L2 — 2장의 그 셋)을 고르는 화면이 여기 있습니다.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">벡터 DB = 임베딩 창고 + 미리 정리해 둔 색인 — 조금 놓치는 대신 훨씬 빨리 찾는다</p>
      <p class="mt-1 text-sm text-indigo-600">그리고 규모가 작으면 색인 없이 전수조사가 답일 수도 있습니다 — 규모가 방법을 고른다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="실험 ②에서 '경계의 질문 + 구역 1개' 조합이 진짜 1등을 놓친 이유는?"
      :choices="['진짜 1등이 조사하지 않은 옆 구역 소속이어서', '컴퓨터가 계산을 틀려서', '진짜 1등이 존재하지 않아서', '질문 벡터가 잘못 만들어져서']"
      :answer="0"
      :hints="['빨간 점선 링이 어디에 있었는지 떠올려 보세요.']"
      explanation="질문이 구역 경계에 있으면 최근접 문서가 옆 구역에 있을 수 있습니다 — 근사의 대가이고, 조사 구역을 늘리면(속도를 내주면) 회복됩니다."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="벡터 DB의 정체를 가장 정확히 요약한 것은?"
      :choices="['임베딩 저장소에 ANN 색인과 메타데이터 필터를 얹은 것', 'LLM의 다른 이름', '문서를 요약해 주는 AI', '엑셀의 고급 버전']"
      :answer="0"
      explanation="저장 + 빨리 찾기(ANN) + 거르기(필터). 검색 수학 자체는 2장의 내적이고, 벡터 DB는 그걸 규모 있게 돌리는 공학입니다."
    />

    <DetailsCard title="➕ 더 깊이: 색인의 두 유파, 제품 지형, 그리고 필터">
      실험 ②의 구역 나누기는 <b>IVF</b>(Inverted File — 구역 색인)라 불리는 방식의 축소판이고,
      실무에서 더 흔한 또 하나의 유파는 <b>HNSW</b>(계층 그래프 — 문서끼리 이웃 그래프를 만들어 두고
      가까운 쪽으로 타고 내려가기)입니다. 살필 구역 수(nprobe)·그래프 폭(ef) 같은 손잡이로
      정확도↔속도를 조절해요. 제품 지형: <b>FAISS</b>(라이브러리), <b>pgvector</b>(PostgreSQL 확장 —
      기존 DB에 얹기), <b>Chroma</b>(가벼운 오픈소스), <b>Pinecone</b>(클라우드 서비스) 등 —
      전부 "ANN 색인 + 저장소"라는 같은 정체입니다. 마지막으로 <b>메타데이터 필터</b>:
      "인사팀 문서만" "이번 달 문서만" 같은 조건을 검색과 결합하는 기능 — 1장에서 말한
      <b>권한 관리</b>(임원 문서는 임원에게만)가 실제로 구현되는 자리입니다.
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 이 장은 공학, 수학은 전부 앞 장의 것">
      벡터 DB 안에서 도는 수학에 새것은 없습니다 — 점수 계산은 <b>내적</b>(2장, 정규화 덕에 한 방),
      구역 나누기는 <b>클러스터</b>(3장), 근사가 통하는 이유는 <b>신호가 바닥에서 솟는 구조</b>(4장).
      RAG 파이프라인(1장)의 3단계 "검색"이 실제 서비스에서 이 층으로 구현되고, 챗봇의 응답
      체감 속도가 대부분 여기서 결정됩니다. 이제 "무엇을 저장하고 몇 개를 꺼낼 것인가"라는
      품질의 문제가 남았어요 — 청킹과 top-k, 7장입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="kNN에서 벡터 DB까지 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="kNN 검색이 하는 일은?"
        :choices="['질문과 가장 가까운 k개의 문서를 찾는다', '문서를 k개의 문단으로 자른다', '질문을 k번 반복한다', 'k개의 모델을 동시에 돌린다']"
        :answer="0"
        explanation="k-최근접 이웃 — RAG의 검색 단계가 결국 이 문제입니다(k개를 뽑아 프롬프트에 넣죠)."
      />
      <Quiz
        difficulty="easy"
        question="ANN의 A(Approximate)가 뜻하는 거래는?"
        :choices="['가끔 진짜 1등을 놓칠 수 있는 대신 훨씬 빠르다', '항상 정확하면서 항상 빠르다', '항상 부정확하지만 공짜다', '느리지만 저장 공간을 아낀다']"
        :answer="0"
        explanation="근사 — 정확함을 조금 양보하고 속도를 크게 버는 기술. 손잡이(구역 수 등)로 거래 비율을 조절합니다."
      />
      <Quiz
        difficulty="easy"
        question="벡터 DB는 임베딩 저장소에 ANN 색인을 얹은 것이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 저장 + 빨리 찾기 + 필터 — 신비한 새 수학이 아니라 잘 포장된 공학이에요."
      />
      <Quiz
        difficulty="easy"
        question="문서 50,000건을 전수조사(kNN)로 검색하면 질문 하나당 유사도 계산은 몇 번?"
        type="numeric"
        :answer="50000"
        explanation="모든 문서와 한 번씩 — 문서 수 그대로 50,000번. 초당 500만 번 기준 10ms, 이 규모에선 전수조사도 쾌적합니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="문서 100만 건, 초당 내적 500만 번인 서버에서 전수조사 검색의 비용을 계산해 봅시다."
        :steps="[
          { lhs: '\\text{질문 1건 (초)} = 10^6 \\div (5 \\times 10^6)', answer: 0.2 },
          { lhs: '\\text{하루 1만 질문 (초)}', answer: 2000 },
        ]"
        :hints="['1,000,000 ÷ 5,000,000', '0.2초 × 10,000건']"
        explanation="질문당 0.2초, 하루 2,000초(33분) — 아직 버티지만, 문서가 10배(1천만)면 질문당 2초로 죽은 제품이 됩니다. ANN이 필요해지는 지점."
      />
      <Quiz
        difficulty="medium"
        question="조사 구역 수(nprobe)를 늘릴 때 생기는 변화는?"
        :choices="['정확도(진짜 1등을 찾을 확률)는 오르고 속도는 내려간다', '정확도와 속도가 함께 오른다', '정확도는 내려가고 속도만 오른다', '아무 변화 없다']"
        :answer="0"
        explanation="더 넓게 살피면 경계의 미스가 줄지만 비교가 늘어요 — 정확도↔속도 손잡이의 본질입니다."
      />
      <Quiz
        difficulty="medium"
        question="ANN의 '가끔 놓침'이 RAG 실무에서 대체로 용인되는 이유는?"
        :choices="['임베딩 유사도 자체가 근사인 데다, top-k로 여러 개를 건네므로 1등 하나에 목맬 필요가 없어서', '놓쳐도 LLM이 없는 문서를 지어내면 되므로', '사용자가 검색 결과를 안 보므로', '용인되지 않는다 — 실무는 전부 전수조사다']"
        :answer="0"
        explanation="2~3등도 대개 충분히 좋은 문서이고(4장의 신호 구조), k개를 뽑아 넣으니 한두 개 순위가 바뀌어도 답변 품질은 유지되는 경우가 많습니다."
      />
      <Quiz
        difficulty="medium"
        question="벡터 DB의 '메타데이터 필터'가 해결하는 대표 문제는?"
        :choices="['부서·권한·날짜 조건을 유사도 검색과 결합하기 (임원 문서는 임원에게만)', '벡터의 차원을 줄이기', 'LLM의 말투 바꾸기', '임베딩 모델을 학습시키기']"
        :answer="0"
        explanation="가까운 문서 중에서도 '볼 자격이 있는 것만' — 1장의 권한 관리가 구현되는 자리입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="문서 300건짜리 팀 FAQ 봇을 만드는데 동료가 '유명한 클라우드 벡터 DB부터 도입하자'고 합니다. 이 장의 규모 감각으로 가장 옳은 판단은?"
        :choices="['300건이면 전수조사가 1ms도 안 걸린다 — 색인·DB 없이 배열 + 내적으로 시작하는 게 합리적', '문서가 1건이라도 있으면 벡터 DB는 필수다', '벡터 DB 없이는 코사인을 계산할 수 없다', '300건은 너무 많아서 검색이 불가능하다']"
        :answer="0"
        :hints="['실험 ①에서 어느 규모부터 빨간불이 켜졌죠?']"
        explanation="규모가 방법을 고릅니다 — 작은 규모에선 정직한 kNN이 더 단순하고 디버깅도 쉬워요. 규모가 커지면 그때 ANN·벡터 DB로."
      />
      <Quiz
        difficulty="hard"
        question="벡터 DB 도입 후, 분명히 존재하는 문서를 검색이 가끔 못 찾는 문제가 보고됩니다. 가장 먼저 의심할 것은?"
        :choices="['ANN 색인의 근사 미스 — 조사 범위 손잡이(nprobe·ef)를 늘리거나 전수조사와 결과를 비교해 확인', '문서가 저절로 삭제됐다', 'LLM이 문서를 싫어한다', '코사인 유사도의 수학적 오류']"
        :answer="0"
        :hints="['실험 ②의 경계의 질문 — 그 현상이 실서비스에서 나타나면?']"
        explanation="ANN 특유의 증상입니다. 전수조사와 결과를 대조하면 색인 문제인지 확인할 수 있고, 손잡이 조정이나 색인 재구축으로 잡습니다 — 재는 법은 7장(재현율)."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch6')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">6장 완료 — 검색의 엔진룸을 봤어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        빨리 찾는 법은 갖췄고, 이제 품질입니다 — 문서를 얼마나 잘게 자를까(청킹),
        몇 개를 꺼낼까(top-k), 잘 찾는지는 어떻게 채점할까(recall@k). 7장에서.
      </p>
      <RouterLink
        to="/ch/ch7"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        7장 — 청킹과 검색 품질 →
      </RouterLink>
    </div>
  </article>
</template>
