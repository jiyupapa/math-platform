<script setup lang="ts">
// 8장 — RAG 조립 (핵심): 파이프라인 완전판 + 실패 모드 진단 + 조련 vs RAG 선택 기준.
// 규칙 8의 두 번째 지정 장 — 6부와의 구도를 실무 기준으로 완성. 회수: 6부 2~3장.
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import RagDoctorLab from '@/components/RagDoctorLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch8')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">8장 · 약 45분 · ⭐ 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">RAG 조립 — 검색이 프롬프트가 되기까지</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      부품이 다 모였습니다 — 자(2장), 공간(3~5장), 엔진(6장), 품질계(7장).
      이번 장은 그 부품들로 파이프라인을 <b>완전판으로 재조립</b>하고, 실전에서 마주칠
      <b>고장(실패 모드)의 진단법</b>, 그리고 1장에서 예고했던 질문 —
      <b>조련과 RAG, 언제 어느 길인가</b> — 에 실무 기준으로 답합니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지를 가져갑니다 — ① RAG의 <b>두 파이프라인</b>(미리 준비하는 인덱싱 / 실시간 질의)을
      배운 수학과 함께 완전판 지도로, ② 틀린 답의 <b>범인 4종</b>(검색·조각·생성·부재)과
      진단 순서("로그부터"), ③ <b>조련 vs RAG</b> 실무 선택 기준 — 6부와 7부가 여기서 한 몸이 됩니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 완전판 지도 — 두 개의 파이프라인</h2>
    <p class="leading-relaxed text-slate-700">
      1장의 5단계 지도는 사실 반쪽이었습니다. 질문이 들어오기 <b>전에</b> 미리 해 두는 준비 작업이
      따로 있거든요 — 문서를 모으고, 자르고, 좌표를 매겨 창고에 넣는 <b>인덱싱 파이프라인</b>입니다.
      이제 모든 단계에 우리가 배운 것을 배치할 수 있어요:
    </p>
    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[30rem] text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3">파이프라인</th>
            <th class="py-2 pr-3">단계</th>
            <th class="py-2 pr-3">배운 곳</th>
            <th class="py-2">여기 사는 고장</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3 font-medium text-slate-500" rowspan="3">🗂️ 인덱싱<br /><span class="text-[11px] font-normal">(미리, 오프라인)</span></td><td class="py-2 pr-3">문서 수집</td><td class="py-2 pr-3">—</td><td class="py-2">문서 부재·낡은 문서</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">청킹</td><td class="py-2 pr-3"><b>7장</b></td><td class="py-2">희석·찢김</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">임베딩 → 벡터 DB 저장</td><td class="py-2 pr-3"><b>4부 3장 · 6장</b> (학습은 9장)</td><td class="py-2">엉뚱한 좌표(임베딩 품질)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3 font-medium text-slate-500" rowspan="4">⚡ 질의<br /><span class="text-[11px] font-normal">(실시간)</span></td><td class="py-2 pr-3">질문 임베딩</td><td class="py-2 pr-3">2장 · 워밍업</td><td class="py-2">—</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">검색 (ANN) + top-k</td><td class="py-2 pr-3"><b>2 · 6 · 7장</b></td><td class="py-2">검색 실패 (recall)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">프롬프트 조립</td><td class="py-2 pr-3">이 장 §3</td><td class="py-2">그라운딩 부족</td></tr>
          <tr><td class="py-2 pr-3">생성 (LLM)</td><td class="py-2 pr-3"><b>4부 · 6부</b></td><td class="py-2">문맥 무시·환각</td></tr>
        </tbody>
      </table>
    </div>
    <p class="leading-relaxed text-slate-700">
      두 파이프라인의 분리가 실무적으로 중요합니다 — 인덱싱은 <b>느려도 되는 배치 작업</b>(밤새 돌려도 OK),
      질의는 <b>밀리초를 다투는 실시간</b>(6장의 그 속도 이야기). 고장의 절반은 인덱싱 쪽에서 나는데
      증상은 질의 쪽에서 보인다는 게 함정이죠. 그럼 범인을 어떻게 찾을까요 — 그리고 그 전에,
      애초에 어느 길로 가야 했는지부터.
    </p>

    <RagDoctorLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 진단은 로그부터, 갈림길은 지식이냐 행동이냐">
      진료실의 결정적 증거는 늘 <b>검색 로그</b>였습니다 — 정답 조각이 <b>왔는지</b>(안 왔으면
      검색·청킹·부재), <b>온전히 왔는지</b>(찢겼으면 청킹), 왔는데도 <b>무시했는지</b>(생성·그라운딩).
      "LLM이 멍청해서"라는 진단은 로그를 본 다음에나 허용됩니다. 그리고 갈림길 게임의 기준 —
      <b>바뀌는 지식·출처가 필요한 사실 = RAG, 말투·형식·행동의 경계 = 조련.</b>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="RAG 챗봇이 틀린 답을 냈을 때 가장 먼저 확인할 것은?"
      :choices="['검색 로그 — 정답 조각이 top-k 안에 온전히 들어왔는지', 'LLM의 파라미터 수', '서버의 CPU 온도', '질문한 사람의 직급']"
      :answer="0"
      :hints="['진료실 4개 사례에서 범인을 가른 결정적 증거.']"
      explanation="재료가 왔는지부터 — 안 왔으면 검색·청킹·부재의 문제, 왔는데 틀리면 생성·그라운딩의 문제입니다. 진단 순서가 절반이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 지식 주입의 두 길 — 실무 결정 기준</h2>
    <p class="leading-relaxed text-slate-700">
      1장의 비교표를 이제 결정 절차로 바꿀 수 있습니다. 요구사항 앞에서 세 가지만 물으세요:
    </p>
    <ul class="mt-2 list-disc space-y-1 pl-6 leading-relaxed text-slate-700">
      <li><b>자주 바뀌는 지식인가? 출처가 필요한가?</b> → RAG (문서 수정 = 즉시 반영, 링크 가능)</li>
      <li><b>말투·형식·행동의 경계인가?</b> → 조련 (파인튜닝·정렬 — 가중치에 새겨야 몸에 밴다)</li>
      <li><b>둘 다인가?</b> → 병행 — 실무의 흔한 정답입니다. 지식은 RAG로 건네고, "문서를 인용하며 공손하게 답하는 태도"는 조련으로 새기는 식이죠. 실제로 여러분이 쓰는 상용 AI 비서들이 정확히 이 조합입니다.</li>
    </ul>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'매달 갱신되는 복지 규정을 답하되, 항상 우리 회사 공문 말투로'라는 요구의 올바른 설계는?"
      :choices="['병행 — 규정 지식은 RAG로 건네고, 공문 말투는 조련으로 새긴다', '조련만 — 규정을 매달 재훈련한다', 'RAG만 — 말투도 문서를 검색해서 해결한다', '둘 다 불가능한 요구다']"
      :answer="0"
      :hints="['요구를 지식 부분과 행동 부분으로 쪼개 보세요.']"
      explanation="지식(규정)과 행동(말투)이 섞인 요구 — 각각 맞는 길로 보내는 병행이 정답입니다. 매달 재훈련은 비용·지연 모두 최악이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 마지막 부품 — 그라운딩 프롬프트</h2>
    <p class="leading-relaxed text-slate-700">
      사례 3·4의 범인은 프롬프트였습니다. 검색된 조각을 그냥 붙이는 게 아니라, 답을 근거 문서에
      <b>묶어 두는</b>(grounding) 지시가 필요해요. 실무 프롬프트의 뼈대는 세 문장입니다:
    </p>
    <div class="my-3 rounded-xl bg-slate-800 p-4 font-mono text-xs leading-relaxed text-slate-200">
      아래 사내 문서에 <b class="text-amber-300">근거해서만</b> 답하세요.<br />
      문서에 없는 내용은 <b class="text-amber-300">"문서에서 찾지 못했습니다"라고 답하세요</b> (추측 금지).<br />
      답변 끝에 <b class="text-amber-300">참고한 문서 제목을 표기</b>하세요.<br />
      <br />
      [문서 1] 경조사 지원 규정 &gt; 제1조(결혼) — …<br />
      [문서 2] …<br />
      [질문] …
    </div>
    <p class="leading-relaxed text-slate-700">
      첫 줄이 사례 3(문맥 무시)을, 둘째 줄이 사례 4(없는데 지어냄)를 막고, 셋째 줄이 RAG 최대
      강점(출처)을 살립니다. 조각 앞에 문서 제목을 붙이는 것(7장의 요령)도 여기서 힘을 발휘해요.
    </p>

    <ConceptCard tone="note" title="새 용어: 인덱싱 파이프라인 / 그라운딩 / 실패 모드">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>인덱싱 파이프라인</b> (indexing/ingestion pipeline) — 읽는 법: 인덱싱/인제스천.
          뜻: 질문이 오기 전에 미리 하는 준비 — 문서 수집 → 청킹 → 임베딩 → 벡터 DB 저장.
          실시간 <b>질의 파이프라인</b>과 분리해 생각해야 고장을 찾기 쉽습니다.
        </li>
        <li>
          <b>그라운딩</b> (grounding) — 읽는 법: 그라운딩.
          뜻: 답변을 <b>근거 문서에 묶어 두는 것</b> — "근거해서만, 없으면 없다고, 출처 표기"
          지시가 기본형. 환각(1장)을 누르는 핵심 장치입니다.
        </li>
        <li>
          <b>실패 모드</b> (failure mode) — 읽는 법: 페일리어 모드.
          뜻: 시스템이 고장 나는 전형적 유형들. RAG의 4대 실패 모드 — 검색 실패 · 조각 찢김 ·
          생성 실패(문맥 무시) · 문서 부재.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">지식은 RAG로, 행동은 조련으로 — 그리고 틀린 답의 범인은 검색 로그부터 찾는다</p>
      <p class="mt-1 text-sm text-indigo-600">6부(조련)와 7부(RAG)가 실무에서 만나는 지점 — 대부분의 상용 AI 비서가 이 병행 조합입니다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="그라운딩 지시('문서에 없으면 모른다고 답해')는 문서 부재 상황에서 환각을 줄여 준다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 사례 4의 처방 — 지식이 없는데 지어내는 것을 막는 첫 번째 방어선이에요(물론 문서를 채우는 게 근본 해결)."
    />

    <DetailsCard title="➕ 더 깊이: 조립 그다음 — 재랭킹, 질문 재작성, 답변 채점">
      실전 RAG의 흔한 업그레이드 세 가지. ① <b>재랭킹</b>(reranking): 벡터 검색이 뽑은 상위
      20~50개를 더 정밀한(느린) 모델이 다시 정렬해 top-k를 고릅니다 — 1차는 빠르게, 2차는 정확하게.
      ② <b>질문 재작성</b>(query rewriting): 대화 중 "그건 언제까지야?" 같은 질문은 그대로
      임베딩하면 안 됩니다 — 앞 대화를 반영해 "법인카드 정산 마감일은 언제인가"로 고쳐 검색해요.
      ③ <b>답변 채점</b>: 검색은 recall@k(7장)로 재고, 최종 답변은 "근거 문서에 충실했나
      (faithfulness)"를 사람 또는 LLM 심판으로 채점합니다 — 6부 9장의 평가 정신이 끝까지 갑니다.
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 6부 2~3장">
      갈림길 판단의 밑천은 6부에서 왔습니다 — <b><PartLink :part="6" ch="ch2">6부 2장</PartLink></b>에서
      프롬프트(문맥 창)가 <b>그 자리 한정의 지식</b>을 준다는 것을, <b><PartLink :part="6" ch="ch3">6부
      3장</PartLink></b>에서 조련(SFT)이 <b>행동 양식</b>을 새긴다는 것을 배웠기에, "지식은 RAG로 행동은
      조련으로"라는 기준이 성립해요. 그리고 RAG의 마지막 단계(생성)에 서 있는 LLM 자체가
      6부의 조련을 거친 비서입니다 — 두 과정은 경쟁이 아니라 <b>한 시스템의 두 층</b>이에요.
      이제 남은 퍼즐은 하나 — 이 모든 것의 토대인 <b>좌표는 누가 그렸나</b>(9장, 대조 학습).
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="RAG 조립 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="RAG의 두 파이프라인을 옳게 짝지은 것은?"
        :choices="['인덱싱(미리 준비: 청킹→임베딩→저장) / 질의(실시간: 검색→조립→생성)', '훈련(가중치 갱신) / 추론(가중치 고정)', '입력(질문) / 출력(답변)', '프론트엔드 / 백엔드']"
        :answer="0"
        explanation="느려도 되는 오프라인 준비(인덱싱)와 밀리초를 다투는 실시간(질의)의 분리 — 고장 찾기의 첫 프레임입니다."
      />
      <Quiz
        difficulty="easy"
        question="RAG의 4대 실패 모드는 몇 가지였나요?"
        type="numeric"
        :answer="4"
        explanation="검색 실패 · 조각 찢김 · 생성 실패(문맥 무시) · 문서 부재 — 진료실의 범인 4종입니다."
      />
      <Quiz
        difficulty="easy"
        question="그라운딩(grounding)이란 답변을 근거 문서에 묶어 두는 것이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. '근거해서만, 없으면 없다고, 출처 표기' — 세 문장이 기본형이에요."
      />
      <Quiz
        difficulty="easy"
        question="'매주 바뀌는 규정을 답하게 하라'는 요구에 맞는 길은?"
        :choices="['RAG — 문서만 고치면 즉시 반영', '조련 — 매주 재훈련', '둘 다 불가능', '규정을 외우게 한다']"
        :answer="0"
        explanation="자주 갱신되는 지식은 RAG의 홈그라운드 — 갈림길 게임 1번 문제였죠."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="검색 로그에 정답 조각이 1등으로 찍혀 있는데 답변은 일반론입니다(사례 3). 범인과 처방은?"
        :choices="['생성 실패 — 그라운딩 지시(근거해서만 답하라)를 강화한다', '검색 실패 — 임베딩 모델을 바꾼다', '문서 부재 — 문서를 새로 쓴다', '조각 찢김 — 청킹을 다시 한다']"
        :answer="0"
        explanation="재료가 완벽히 왔는데 무시한 것 — 검색이 아니라 프롬프트(그라운딩)의 문제입니다. 로그가 범인을 가려 줬죠."
      />
      <Quiz
        difficulty="medium"
        question="답변에 조건('근속 1년 이상')이 빠져 반쪽짜리 답이 나옵니다(사례 2). 어느 파이프라인의 어느 단계를 고쳐야 하나요?"
        :choices="['인덱싱 파이프라인의 청킹 — 조항 단위 + 겹침으로', '질의 파이프라인의 생성 — LLM을 교체', '인덱싱의 문서 수집 — 문서를 삭제', '아무것도 고칠 필요 없다']"
        :answer="0"
        :hints="['조건 문장이 딴 조각으로 찢어진 사고 — 7장에서 본 그것.']"
        explanation="증상은 질의(답변)에서 보이지만 범인은 인덱싱(청킹)에 있습니다 — 고장의 절반이 이런 원격 범행이에요."
      />
      <Quiz
        difficulty="medium"
        question="그라운딩 프롬프트의 세 지시와 막는 실패를 옳게 짝지은 것은?"
        :choices="['근거해서만 → 문맥 무시 / 없으면 없다고 → 부재 시 환각 / 출처 표기 → 검증 가능성', '근거해서만 → 검색 속도 / 없으면 없다고 → 토큰 비용 / 출처 표기 → 청킹', '세 지시 모두 검색 실패를 막는다', '세 지시는 장식일 뿐이다']"
        :answer="0"
        explanation="각 지시가 각자의 실패 모드를 담당합니다 — 사례 3과 4의 처방이 각각 첫째·둘째 줄이었어요."
      />
      <Quiz
        difficulty="medium"
        question="상용 AI 비서 대부분이 '조련 + RAG 병행'인 이유는?"
        :choices="['행동(비서다움·안전)은 조련으로 새기고, 최신 지식·출처는 RAG로 건네야 둘 다 얻어지므로', '두 회사의 특허를 모두 피하려고', '병행이 항상 더 저렴해서', 'RAG만으로 말투를 바꿀 수 있어서']"
        :answer="0"
        explanation="6부(조련된 비서)가 생성 단계에 서 있고 그 문맥 창에 7부(RAG)가 지식을 실어 줍니다 — 한 시스템의 두 층이에요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="신입 챗봇 프로젝트: 답변이 자꾸 틀립니다. 팀은 'LLM을 더 큰 모델로 교체'를 논의 중입니다. 이 장의 진단 절차로 올바른 반론은?"
        :choices="['검색 로그와 recall@k부터 — 정답 조각이 안 오고 있다면 어떤 LLM도 못 고친다', '큰 모델은 항상 정답이니 바로 교체한다', '틀린 답변은 사용자의 질문이 나쁜 탓이다', '챗봇을 포기한다']"
        :answer="0"
        :hints="['핵심 한 줄 — 범인은 어디서부터 찾는다고 했죠?']"
        explanation="사례 1처럼 검색이 범인이면 모델 교체는 돈만 쓰는 처방입니다. 로그 확인 → recall 측정 → 범인 특정 — 순서가 예산을 지켜요."
      />
      <Quiz
        difficulty="hard"
        question="'그라운딩 지시를 넣었더니 챗봇이 \'문서에서 찾지 못했습니다\'를 너무 자주 답한다'는 불만이 들어왔습니다. 올바른 해석과 대응은?"
        :choices="['환각이 정직한 실패로 바뀐 것 — 이제 그 질문들의 문서를 채우고 검색(recall)을 개선할 차례', '그라운딩 지시를 빼서 다시 그럴듯하게 답하게 한다', 'LLM이 게을러진 것이니 혼내는 프롬프트를 쓴다', '사용자들이 질문을 그만하게 한다']"
        :answer="0"
        :hints="['지어낸 오답과 정직한 \'모름\' — 어느 쪽이 개선의 출발점이 될 수 있죠?']"
        explanation="'모름'은 실패의 가시화입니다 — 어떤 질문이 비는지 로그로 남아 문서 보강·검색 개선의 지도가 돼요. 지시를 빼면 다시 조용한 환각으로 돌아갑니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch8')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">8장 완료 — RAG를 조립하고 고칠 수 있어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        시스템은 완성입니다. 남은 퍼즐은 토대 하나 — 이 좋은 지도(임베딩)는 누가 어떻게
        그렸을까? "짝은 가깝게, 남은 멀게" — 대조 학습, 9장입니다.
      </p>
      <RouterLink
        to="/ch/ch9"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        9장 — 임베딩은 어떻게 배우나 →
      </RouterLink>
    </div>
  </article>
</template>
