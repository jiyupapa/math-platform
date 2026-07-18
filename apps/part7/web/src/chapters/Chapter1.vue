<script setup lang="ts">
// 1장 — 큰 그림: 검색의 진화와 RAG. 7부 전체의 지도를 그리는 챕터.
// 6부와의 구도(지식 주입의 두 길: 조련 vs RAG)를 처음 명시하는 장 (part7 CLAUDE.md 규칙 8).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import RagPipelineLab from '@/components/RagPipelineLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch1')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">1장 · 약 35분</p>
    <h1 class="mb-4 text-3xl font-bold">큰 그림 — 검색의 진화와 RAG</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업에서 "의미는 위치다"를 얻었죠. 이번 장은 그 지도가 <b>실제로 무엇을 움직이는지</b>
      전체 그림을 그립니다. 새 수식은 없어요 — 앞으로 9개 장에서 한 칸씩 열어 볼
      지도를 먼저 손에 쥐는 게 목표입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      "AI가 회사 문서를 아는 것처럼 답한다"는 기능의 정체 — <b>RAG 파이프라인 5단계</b> — 를
      지도로 갖습니다. 그 앞에 두 가지를 정리합니다: 검색의 두 방식(<b>키워드 vs 의미</b>)은
      각각 어디에 강한가, 그리고 지식을 넣는 두 길(<b>조련 vs RAG</b>)은 어떻게 다른가.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. AI가 모르는 것</h2>
    <ReviewFlag id="ch1-s1" chapter="ch1" label="1. AI가 모르는 것" />
    <p class="leading-relaxed text-slate-700">
      LLM은 훈련 데이터에 있던 것만 압니다. 우리 회사의 경비 규정, 어제 올라온 회의록,
      방금 바뀐 결재선 — 전부 <b>훈련 데이터 밖</b>이에요. 훈련이 끝난 시점 이후의 세상을
      모르는 것을 <b>지식 마감선</b>(knowledge cutoff)이라 부릅니다.
      그런데 6부 2장에서 재미있는 걸 봤었죠 — 모델이 모르는 사실도 <b>프롬프트에 적어 주면
      그 자리에서는 아는 것처럼 답한다</b>는 것(문맥 창). 그렇다면 길은 두 갈래입니다:
    </p>
    <ul class="mt-2 list-disc space-y-1 pl-6 leading-relaxed text-slate-700">
      <li><b>① 가중치에 새긴다</b> — 회사 데이터로 모델을 다시 학습. 6부에서 배운 <b>조련</b>(파인튜닝)의 길.</li>
      <li><b>② 그때그때 건네준다</b> — 질문과 관련된 문서를 <b>찾아서</b> 프롬프트에 붙이는 길. 이 부의 주인공, <b>RAG</b>.</li>
    </ul>
    <p class="mt-2 leading-relaxed text-slate-700">
      ②의 성패는 한 단어에 달렸습니다 — "<b>찾아서</b>". 수만 건의 사내 문서에서 질문과 맞는
      문서를 어떻게 찾을까요? 여기서 검색의 역사가 두 세대로 갈립니다.
    </p>

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 검색의 진화 — 글자에서 뜻으로</h2>
    <ReviewFlag id="ch1-s2" chapter="ch1" label="2. 검색의 진화 — 글자에서 뜻으로" />
    <p class="leading-relaxed text-slate-700">
      1세대는 <b>키워드 검색</b> — 질문의 단어가 문서에 나오는지 세는, 워밍업 실험 ①의 그 방식입니다.
      2세대는 <b>의미 검색</b> — 질문과 문서를 모두 의미 지도에 올리고 <b>가까운 것</b>을 찾는 방식이죠.
      그럼 2세대가 항상 이길까요? 직접 확인해 보세요 — 두 질문의 승자가 다릅니다.
    </p>

    <RagPipelineLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 강점의 지형이 다르다">
      <b>표현이 다양해지는 질문</b>("쉬는 날 쓰려면…")에는 의미 검색이 이기고,
      <b>정확한 용어·코드·고유명사</b>("VPN 403")에는 키워드 검색이 빠르고 확실합니다.
      어느 쪽도 만능이 아니라서 실무 검색 시스템은 대부분 <b>둘을 함께</b> 씁니다(하이브리드).
      7부가 파고드는 것은 이 중 <b>의미 검색의 수학</b> — 지도를 만들고(임베딩) 가까움을 재는(유사도) 쪽입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="의미 검색이 키워드 검색을 확실히 이기는 질문 유형은?"
      :choices="['같은 뜻을 완전히 다른 단어로 묻는 질문', '오류 코드처럼 정확한 문자열이 든 질문', '문서 제목을 그대로 복사한 질문', '이기는 경우가 없다']"
      :answer="0"
      :hints="['실험 ①의 첫 번째 질문 — 겹치는 단어가 0개였는데 정답을 찾았죠.']"
      explanation="'쉬는 날 미리 쓰려면…'처럼 표현이 다른 질문은 키워드가 전멸(전부 0점)하고 의미 검색이 뜻으로 찾아냅니다. 반대로 정확한 코드·용어는 키워드가 강해요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. RAG — 검색이 프롬프트가 되기까지</h2>
    <ReviewFlag id="ch1-s3" chapter="ch1" label="3. RAG — 검색이 프롬프트가 되기까지" />
    <p class="leading-relaxed text-slate-700">
      실험 ②에서 통과한 5단계 — <b>질문 → 임베딩 → 검색 → 프롬프트 조립 → 생성</b> — 가
      RAG의 전부입니다. 포인트는 모델이 한 번도 재학습되지 않았다는 것:
      지식은 가중치가 아니라 <b>프롬프트(문맥)</b>에 실려 들어갑니다.
      그래서 문서를 고치면 답이 즉시 바뀌고, 어떤 문서를 건넸는지 아니까 <b>출처</b>도 달 수 있어요.
    </p>

    <ConceptCard tone="note" title="새 용어: RAG / 의미 검색 / 하이브리드 검색">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>RAG</b> (Retrieval-Augmented Generation) — 읽는 법: 랙, 검색 증강 생성.
          뜻: 질문과 관련된 문서를 <b>검색</b>(Retrieval)해 프롬프트에 <b>보강</b>(Augmented)한 뒤
          답을 <b>생성</b>(Generation)하게 하는 파이프라인. 워밍업의 "더 깊이"에서 예고한 그 이름입니다.
        </li>
        <li>
          <b>의미 검색</b> (semantic search) — 읽는 법: 시맨틱 서치.
          뜻: 글자 겹침이 아니라 <b>임베딩 공간에서의 가까움</b>으로 문서를 찾는 검색. 벡터 검색(vector search)이라고도 합니다.
        </li>
        <li>
          <b>하이브리드 검색</b> (hybrid search) — 읽는 법: 하이브리드 서치.
          뜻: 키워드 검색과 의미 검색의 점수를 <b>합쳐 쓰는</b> 실무 표준 — 두 강점 지형을 모두 커버합니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="RAG에서 회사 지식이 모델에게 전달되는 위치는?"
      :choices="['프롬프트(문맥 창) — 검색된 문서를 질문 앞에 붙인다', '모델의 가중치 — 재훈련으로 새긴다', 'GPU 메모리 설정', '모델 이름표(-instruct)']"
      :answer="0"
      :hints="['실험 ② 4단계에서 문서가 어디로 들어갔는지 떠올려 보세요.']"
      explanation="RAG는 가중치를 건드리지 않습니다. 검색된 문서를 프롬프트에 붙여 문맥 창으로 전달해요 — 6부 2장의 '프롬프트에 넣으면 그 자리에선 안다'를 시스템으로 만든 것입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 지식 주입의 두 길 — 조련 vs RAG</h2>
    <ReviewFlag id="ch1-s4" chapter="ch1" label="4. 지식 주입의 두 길 — 조련 vs RAG" />
    <p class="leading-relaxed text-slate-700">
      6부를 마친 여러분은 이제 지식을 넣는 두 길을 모두 알게 됐습니다. 나란히 놓고 비교해 보죠.
    </p>
    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[30rem] text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3">&nbsp;</th>
            <th class="py-2 pr-3">🐎 조련 (6부) — 파인튜닝</th>
            <th class="py-2">🗺️ RAG (7부) — 검색 증강 생성</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3 font-medium text-slate-500">지식이 사는 곳</td><td class="py-2 pr-3">가중치 (모델 내부)</td><td class="py-2">프롬프트 (문맥 창)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3 font-medium text-slate-500">갱신하려면</td><td class="py-2 pr-3">재훈련 필요 (느리고 비쌈)</td><td class="py-2">문서만 수정 (즉시 반영)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3 font-medium text-slate-500">출처 표시</td><td class="py-2 pr-3">어렵다 — 어디서 배웠는지 흐릿</td><td class="py-2">쉽다 — 건넨 문서를 안다</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3 font-medium text-slate-500">잘하는 것</td><td class="py-2 pr-3">말투·형식·행동 양식 바꾸기</td><td class="py-2">사실·최신 지식 답하기</td></tr>
          <tr><td class="py-2 pr-3 font-medium text-slate-500">이 시리즈에서</td><td class="py-2 pr-3">6부 전체</td><td class="py-2">7부 전체 (조립은 8·10장)</td></tr>
        </tbody>
      </table>
    </div>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">말투를 바꾸려면 조련, 지식을 넣으려면 RAG — 그리고 RAG는 재훈련이 아니라 검색이다</p>
      <p class="mt-1 text-sm text-indigo-600">둘은 경쟁자가 아니라 분업 관계 — 실무 선택 기준은 8장에서 깊게 다룹니다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="사내 규정이 매주 바뀌는 회사라면, 챗봇에 규정 지식을 넣는 방법으로 조련(파인튜닝)이 RAG보다 낫다."
      type="truefalse"
      :answer="1"
      explanation="거짓입니다. 조련은 갱신마다 재훈련이 필요하지만 RAG는 문서만 바꾸면 즉시 반영돼요 — 자주 바뀌는 지식일수록 RAG의 압승입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">5. 이 지도에서 우리의 여정</h2>
    <ReviewFlag id="ch1-s5" chapter="ch1" label="5. 이 지도에서 우리의 여정" />
    <p class="leading-relaxed text-slate-700">
      RAG 5단계의 단계마다 수학 질문이 하나씩 숨어 있고, 그 질문들이 곧 남은 9개 장입니다.
      길을 잃을 때마다 여기로 돌아오세요.
    </p>
    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[28rem] text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3">파이프라인 단계</th>
            <th class="py-2 pr-3">숨은 질문</th>
            <th class="py-2">장</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3" rowspan="2">임베딩 (지도 만들기)</td><td class="py-2 pr-3">그 공간은 어떻게 생겼나 — 수백 차원에서도 통하나</td><td class="py-2"><b>3·4·5장</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">좌표는 누가 정하나</td><td class="py-2"><b>9장</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">검색 (가까움 재기)</td><td class="py-2 pr-3">가까움을 재는 좋은 자는 — 코사인 유사도</td><td class="py-2"><b>2장 (핵심)</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">검색 (빨리 찾기)</td><td class="py-2 pr-3">수만 개 중 1등을 순식간에 — 벡터 DB</td><td class="py-2"><b>6장</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">프롬프트 조립</td><td class="py-2 pr-3">문서를 얼마나 잘게, 몇 개나 — 청킹·top-k</td><td class="py-2"><b>7장</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">전체 조립</td><td class="py-2 pr-3">실패는 어디서 나고, 조련과는 언제 갈라서나</td><td class="py-2"><b>8장 (핵심)</b></td></tr>
          <tr><td class="py-2 pr-3">완성</td><td class="py-2 pr-3">🎯 캡스톤 — 사내 FAQ 검색봇</td><td class="py-2"><b>10장</b></td></tr>
        </tbody>
      </table>
    </div>

    <DetailsCard title="➕ 더 깊이: 다들 왜 이렇게 RAG에 열광할까">
      갱신 속도·출처 말고도 이유가 있습니다. LLM이 근거 없이 그럴듯한 거짓을 지어내는 것을
      <b>환각</b>(hallucination)이라 부르는데, 근거 문서를 함께 건네면 환각이 크게 줄고
      "답은 이 문서에서 왔습니다"라고 <b>검증 가능한 답변</b>이 됩니다. 사내에서는 문서별
      접근 권한을 검색 단계에 걸 수 있다는 것도 큰 장점이에요(임원 문서는 임원에게만).
      참고로 실무 용어 몇 개 — 키워드 검색의 표준 알고리즘은 <b>BM25</b>(비엠25)라 불리고,
      하이브리드 검색은 보통 "BM25 + 벡터 검색"의 조합을 뜻합니다. 의미 지도를 저장·검색하는
      전용 데이터베이스(<b>벡터 DB</b>)의 정체는 6장에서 열어 봅니다.
    </DetailsCard>

    <ReviewFlag id="ch1-ai" chapter="ch1" label="🤖 AI 연결 — 회수하는 수학: 4부 3장 · 6부 2장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 4부 3장 · 6부 2장">
      이 장의 두 기둥은 모두 시리즈에서 이미 만난 것들입니다.
      <b><PartLink :part="4" ch="ch3">4부 3장</PartLink></b>의 임베딩은 거기서 <b>트랜스포머의 입력 재료</b>였는데,
      여기서는 <b>검색의 무대</b>가 됩니다 — 같은 벡터의 두 번째 직업이죠.
      그리고 <b><PartLink :part="6" ch="ch2">6부 2장</PartLink></b>에서 "모델이 모르는 사실도 프롬프트에
      넣으면 답한다"(문맥 창)를 관찰했는데, RAG는 정확히 그 관찰을 <b>자동화한 시스템</b>입니다 —
      사람이 문서를 골라 붙이는 대신, 의미 검색이 골라 붙이는 것. 다음 장부터 그 검색의 수학을 엽니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">6. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="검색의 진화와 RAG — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="RAG의 풀네임과 뜻으로 옳은 것은?"
        :choices="['Retrieval-Augmented Generation — 검색으로 보강해 생성', 'Random Answer Generator — 무작위 답 생성', 'Rapid AI Growth — 빠른 AI 성장', 'Read And Guess — 읽고 추측하기']"
        :answer="0"
        explanation="검색(Retrieval)해서 프롬프트를 보강(Augmented)한 뒤 생성(Generation) — 검색 증강 생성입니다."
      />
      <Quiz
        difficulty="easy"
        question="RAG 파이프라인의 올바른 순서는?"
        :choices="['질문 → 임베딩 → 검색 → 프롬프트 조립 → 생성', '질문 → 생성 → 검색 → 임베딩 → 프롬프트 조립', '검색 → 질문 → 생성 → 임베딩 → 프롬프트 조립', '임베딩 → 생성 → 질문 → 검색 → 프롬프트 조립']"
        :answer="0"
        explanation="실험 ②의 5단계 그대로 — 질문을 좌표로 바꾸고, 가까운 문서를 찾고, 붙여서, 답하게 합니다."
      />
      <Quiz
        difficulty="easy"
        question="RAG는 모델의 가중치를 바꿔서 지식을 넣는 방법이다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. RAG는 재훈련 없이 검색된 문서를 프롬프트(문맥)에 실어 보냅니다 — 가중치를 바꾸는 쪽은 조련(파인튜닝)이에요."
      />
      <Quiz
        difficulty="easy"
        question="실험 ①에서 질문 'VPN 403 이라고 떠요'와 문서 B(VPN 오류 코드 403)의 겹치는 단어는 몇 개였나요?"
        type="numeric"
        :answer="2"
        explanation="'VPN'과 '403', 2개 — 정확한 용어·코드가 꽂히는 질문에는 키워드 검색이 강한 이유였죠."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="키워드 검색과 의미 검색의 강점을 옳게 짝지은 것은?"
        :choices="['키워드 = 정확한 용어·코드, 의미 = 표현이 다른 같은 뜻', '키워드 = 표현이 다른 같은 뜻, 의미 = 정확한 용어·코드', '둘 다 정확한 용어에만 강하다', '둘 다 모든 질문에 똑같이 강하다']"
        :answer="0"
        :hints="['실험 ①에서 두 질문의 승자가 서로 달랐어요.']"
        explanation="강점 지형이 달라서 실무는 하이브리드(BM25 + 벡터 검색)로 둘을 합칩니다."
      />
      <Quiz
        difficulty="medium"
        question="RAG 챗봇이 답변에 출처(어느 문서에서 왔는지)를 달 수 있는 이유는?"
        :choices="['검색 단계에서 어떤 문서를 골라 건넸는지 시스템이 알기 때문', 'LLM이 모든 훈련 데이터를 기억하기 때문', '가중치에 문서 이름이 새겨지기 때문', '출처는 사실 무작위로 다는 것이다']"
        :answer="0"
        explanation="프롬프트에 붙인 문서가 무엇인지 파이프라인이 아니까, 그 문서를 출처로 링크하면 됩니다 — 조련으로 새긴 지식은 이게 안 돼요."
      />
      <Quiz
        difficulty="medium"
        question="'지식이 사는 곳'을 기준으로 조련과 RAG를 옳게 구분한 것은?"
        :choices="['조련 = 가중치, RAG = 프롬프트(문맥 창)', '조련 = 프롬프트, RAG = 가중치', '둘 다 가중치', '둘 다 프롬프트']"
        :answer="0"
        :hints="['비교 표의 첫 줄이에요.']"
        explanation="조련은 모델 내부(가중치)에 새기고, RAG는 매 질문마다 문맥 창에 실어 보냅니다. 그래서 갱신 속도·출처·비용이 전부 갈라져요."
      />
      <Quiz
        difficulty="medium"
        question="실무 검색 시스템이 하이브리드(키워드 + 의미)를 쓰는 이유로 가장 알맞은 것은?"
        :choices="['두 방식의 강점 지형이 달라 서로의 빈틈을 메워 주기 때문', '두 개를 쓰면 무조건 두 배 빨라서', '의미 검색이 아직 존재하지 않아서', '키워드 검색이 항상 더 정확해서']"
        :answer="0"
        explanation="표현이 다른 질문은 의미 검색이, 정확한 코드·용어는 키워드(BM25)가 잡습니다 — 합치면 둘 다 커버돼요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="다음 중 RAG가 아니라 조련(파인튜닝)이 맞는 일은?"
        :choices="['챗봇의 말투를 우리 회사 공문 형식으로 바꾸기', '매주 바뀌는 경비 규정을 답하게 하기', '어제 올라온 회의록 내용을 답하게 하기', '답변에 근거 문서 링크 달기']"
        :answer="0"
        :hints="['비교 표의 \'잘하는 것\' 줄 — 사실·지식 vs 행동 양식.']"
        explanation="말투·형식·행동 양식은 가중치에 새겨야 하는 것 — 조련의 영역입니다(6부 3장 SFT). 최신 사실·출처는 전부 RAG의 영역이에요."
      />
      <Quiz
        difficulty="hard"
        question="'검색하지 말고 사내 문서 전부를 매번 프롬프트에 붙이면 되지 않나?'가 통하지 않는 이유는?"
        :choices="['문맥 창에는 길이 한계가 있고, 길수록 비용이 늘며 관련 없는 내용이 답을 흐리기 때문', '프롬프트에는 문서를 붙이는 것이 기술적으로 불가능해서', '문서가 많을수록 모델 가중치가 손상돼서', '통한다 — 실무에서 그렇게 한다']"
        :answer="0"
        :hints="['6부 2장의 문맥 창 이야기 + 실험 ② 3단계에서 왜 1등 문서만 채택했는지.']"
        explanation="문맥 창은 유한하고(6부 2장) 토큰만큼 돈과 시간이 듭니다. 그래서 관련된 소수의 문서만 골라 넣어야 하고 — 그 '골라내기'가 바로 검색, 7부의 수학입니다(몇 개나 넣을지는 7장 top-k)."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch1')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">1장 완료 — RAG 지도를 손에 넣었어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 2장 — 첫 핵심 챕터입니다. "가까움"을 재는 자에 유클리드 거리 말고 더 좋은 게 있어요:
        1부 2장의 내적이 코사인 유사도로 되살아납니다.
      </p>
      <RouterLink
        to="/ch/ch2"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        2장 — 가까움의 수학, 코사인 유사도 →
      </RouterLink>
    </div>
  </article>
</template>
