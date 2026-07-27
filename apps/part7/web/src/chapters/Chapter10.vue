<script setup lang="ts">
// 10장 — 🎯 캡스톤: 사내 FAQ 검색봇 전체 조립. 7부의 완결 장 — 전 시리즈 회수.
// 비유어 치환표(의미 지도→임베딩 공간 등)로 실무 용어 앵커를 총회수한다 (CLAUDE.md 규칙 2).
import { ConceptCard, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import FaqBotLab from '@/components/FaqBotLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch10')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">10장 · 약 50분 · 🎯 캡스톤</p>
    <h1 class="mb-4 text-3xl font-bold">캡스톤 — 사내 FAQ 검색봇</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업에서 던진 약속 — "AI가 회사 문서를 아는 것처럼 답하는 기능을 직접 조립한다" —
      을 지킬 시간입니다. 새로 배울 것은 없어요. 열 개 장에서 모은 부품을 순서대로
      끼우고, 시운전하고, 성적표까지 뽑습니다. 그리고 마지막으로 —
      이 과정에서 쓴 비유어들을 <b>실무 용어로 총정리</b>해서, 여러분이 내일부터
      동료·문서·논문과 대화할 수 있게 합니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      ① 사내 FAQ 검색봇을 <b>처음부터 끝까지</b> 조립·시운전·채점하고,
      ② 7부의 비유어 ↔ 실무 용어 <b>치환표</b>를 손에 넣고,
      ③ toy에서 실전으로 넘어가는 <b>다음 걸음</b>(진짜 임베딩 모델·벡터 DB·평가 세트)을 챙깁니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 부품 목록 — 열 개 장이 한 상자에</h2>
    <ReviewFlag id="ch10-s1" chapter="ch10" label="1. 부품 목록 — 열 개 장이 한 상자에" />
    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[26rem] text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3">부품</th><th class="py-2 pr-3">역할</th><th class="py-2">배운 곳</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">조항 청킹 + 제목 붙이기</td><td class="py-2 pr-3">문서를 뜻이 완결되는 조각으로</td><td class="py-2"><b>7장</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">임베딩 (정규화)</td><td class="py-2 pr-3">뜻을 좌표로 — 대조 학습된 기성품</td><td class="py-2">워밍업 · <b>9장</b> (공간: 3~5장)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">코사인 top-k 검색</td><td class="py-2 pr-3">가까움 = 내적 한 방, 상위 k개</td><td class="py-2"><b>2 · 6 · 7장</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">바닥 점검</td><td class="py-2 pr-3">점수가 바닥 수준이면 정직한 모름</td><td class="py-2"><b>4 · 8장</b></td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">그라운딩 프롬프트</td><td class="py-2 pr-3">근거해서만 · 없으면 없다고 · 출처</td><td class="py-2"><b>8장</b></td></tr>
          <tr><td class="py-2 pr-3">생성 LLM</td><td class="py-2 pr-3">조련된 비서가 문맥을 읽고 답변</td><td class="py-2"><b>4부 · 6부</b></td></tr>
        </tbody>
      </table>
    </div>

    <FaqBotLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 전부 아는 것들이었다">
      시운전에서 특별한 마법은 없었습니다 — 겹치는 단어가 0개인 질문("쉬는 날…")이 연차 규정을
      찾은 것은 워밍업의 의미 지도이고, 점수 0.99와 0.20을 가른 것은 2장의 코사인이며,
      워크숍 질문에 지어내지 않은 것은 4장의 바닥과 8장의 그라운딩입니다.
      <b>RAG는 신기술이 아니라, 이 시리즈에서 배운 수학의 조립품</b>이에요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="시운전에서 '겨울 워크숍' 질문에 봇이 지어내지 않고 모른다고 답할 수 있었던 두 장치는?"
      :choices="['1위 점수가 바닥 수준임을 점검(4장) + 없으면 없다고 답하라는 그라운딩(8장)', 'LLM의 양심 + 운', '질문 길이 제한 + 대문자 변환', '무조건 모른다고 답하도록 고정']"
      :answer="0"
      explanation="바닥(무작위 수준) 점수는 재료가 없다는 신호 — 그때 그라운딩 지시가 환각 대신 정직한 모름을 만듭니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 용어 치환표 — 내일부터 쓰는 말로</h2>
    <ReviewFlag id="ch10-s2" chapter="ch10" label="2. 용어 치환표 — 내일부터 쓰는 말로" />
    <p class="leading-relaxed text-slate-700">
      이 과정의 비유어들은 학습용 발판이었습니다. 이제 실무·문서·논문의 언어로 바꿔 끼우세요 —
      괄호 안이 동료와 대화할 때 쓰는 이름입니다.
    </p>
    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[28rem] text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3">이 과정의 비유</th><th class="py-2">실무 용어</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">의미 지도 / 뜻을 좌표로</td><td class="py-2"><b>임베딩 공간</b> (embedding space) / <b>임베딩</b> (embedding)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">가까움 재는 자</td><td class="py-2"><b>코사인 유사도</b> (cosine similarity) — 정규화 시 내적(dot product)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">문서 조각 / 칼질</td><td class="py-2"><b>청크</b> (chunk) / <b>청킹</b> (chunking)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">창고 + 미리 정리해 둔 색인</td><td class="py-2"><b>벡터 DB</b> (vector database) + <b>ANN 인덱스</b> (IVF·HNSW)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">검색 성적표</td><td class="py-2"><b>recall@k</b> (재현율)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">(무작위) 바닥</td><td class="py-2"><b>무작위 기준선</b> (random baseline) — 이겨야 할 최저선</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">답을 문서에 묶어 두기</td><td class="py-2"><b>그라운딩</b> (grounding) — 억제 대상은 <b>환각</b> (hallucination)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">짝은 가깝게, 남은 멀게</td><td class="py-2"><b>대조 학습</b> (contrastive learning) — 손실은 <b>InfoNCE</b></td></tr>
          <tr><td class="py-2 pr-3">지식 주입의 두 길 (조련 vs 지도)</td><td class="py-2"><b>파인튜닝</b> (fine-tuning, 6부) vs <b>RAG</b> (검색 증강 생성, Retrieval-Augmented Generation)</td></tr>
        </tbody>
      </table>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="동료에게 '우리 봇의 의미 지도가 사내 용어에 약하다'를 실무 용어로 옮기면?"
      :choices="['임베딩 모델이 도메인 어휘에 약하다 — 도메인 파인튜닝이나 하이브리드 검색을 검토하자', '지도 앱을 업데이트하자', 'GPU가 부족하다', '프롬프트가 너무 짧다']"
      :answer="0"
      explanation="의미 지도 = 임베딩 (공간), 지도가 약하다 = 임베딩 품질 문제. 처방은 9장의 도메인 파인튜닝 + 1장의 하이브리드였죠."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 다음 걸음 — toy에서 실전으로</h2>
    <ReviewFlag id="ch10-s3" chapter="ch10" label="3. 다음 걸음 — toy에서 실전으로" />
    <p class="leading-relaxed text-slate-700">
      오늘 만든 봇과 실전 봇의 차이는 부품의 <b>등급</b>뿐, 구조는 같습니다. 바꿔 끼울 것들:
    </p>
    <ul class="mt-2 list-disc space-y-1 pl-6 leading-relaxed text-slate-700">
      <li><b>toy 임베딩 → 진짜 임베딩 모델</b>: sentence-transformers·E5·BGE 같은 공개 모델, 또는 Ollama의 임베딩 API(노트북에서 연결해 봅니다).</li>
      <li><b>배열 → 벡터 DB</b>: 문서 수만 건까지는 배열+내적로 충분(6장), 커지면 pgvector·Chroma부터.</li>
      <li><b>프리셋 질문 → 자유 입력</b>: 질문도 임베딩 모델에 통과시키면 끝 — 구조는 그대로.</li>
      <li><b>답변 흉내 → 진짜 LLM</b>: 그라운딩 프롬프트를 조련된 모델(6부)에 — 사내라면 로컬 Ollama로 보안 걱정 없이.</li>
      <li><b>그리고 반드시 — 평가 세트</b>: 실사용 질문 로그로 수십 문항부터(7장). 만들고 → 재고 → 다듬는 반복이 곧 RAG 개발입니다.</li>
    </ul>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="오늘의 toy 봇을 실전으로 옮길 때, 시스템의 전체 구조(인덱싱 → 검색 → 그라운딩 → 생성)도 새로 설계해야 한다."
      type="truefalse"
      :answer="1"
      explanation="거짓입니다. 구조는 그대로, 부품의 등급만 바꿉니다 — toy 임베딩을 진짜 모델로, 배열을 벡터 DB로. 그게 이 과정이 구조를 가르친 이유예요."
    />

    <DetailsCard title="➕ 더 깊이: 사내 도입 체크리스트">
      실제 사내 서비스로 갈 때 기술 밖에서 챙길 것들 — ① <b>권한</b>: 문서별 접근 권한을 검색
      필터에 연결(6장 메타데이터 필터) — 임원 문서가 신입에게 검색되면 사고입니다.
      ② <b>문서 신선도</b>: 규정 개정 시 재인덱싱 파이프라인(8장 인덱싱은 배치 작업) — 낡은 답변의
      주범은 낡은 색인. ③ <b>피드백 루프</b>: 답변에 👍👎 버튼 — 그 로그가 평가 세트(7장)와
      하드 네거티브(9장)의 재료가 됩니다. ④ <b>기대 관리</b>: "문서에 없는 건 모른다"는 봇의
      정직함을 기능으로 소개하세요 — 지어내는 봇보다 신뢰가 오래갑니다.
    </DetailsCard>

    <ReviewFlag id="ch10-ai" chapter="ch10" label="🤖 AI 연결 — 회수하는 수학: 전 시리즈" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 전 시리즈">
      이 봇 한 대에 시리즈 전체가 들어 있습니다 — 좌표와 내적(<b>1부</b>), 좌표를 움직인
      경사하강(<b>2부</b>), 바닥의 집중과 성적표의 신뢰구간(<b>3부</b>), 임베딩과 어텐션과 온도(<b>4부</b>),
      −log 손실(<b>5부</b>), 조련된 생성 모델과 평가의 정신(<b>6부</b>). 수포자로 출발해
      여기까지 — 이제 여러분은 "AI가 회사 문서를 아는 것처럼 답한다"는 문장을
      <b>수학으로 설명하고, 직접 조립하고, 고장까지 진단할 수 있는</b> 사람입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기 — 7부 종합</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 7부가 완결됩니다. 전 장을 훑는 종합 문제예요.
    </p>

    <QuizSet title="캡스톤 — 종합 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="RAG 질의 파이프라인의 올바른 순서는?"
        :choices="['질문 임베딩 → 검색(top-k) → 그라운딩 프롬프트 조립 → 생성', '생성 → 검색 → 임베딩 → 조립', '검색 → 생성 → 임베딩 → 조립', '조립 → 질문 → 생성 → 검색']"
        :answer="0"
        explanation="1장에서 그린 지도 그대로 — 캡스톤 시운전의 ①~④ 단계였습니다."
      />
      <Quiz
        difficulty="easy"
        question="코사인 유사도의 정체는?"
        :choices="['내적 ÷ 두 길이의 곱 — 방향(주제)만 보는 자', '두 벡터의 길이 차이', '글자 겹침 개수', '문서의 페이지 수']"
        :answer="0"
        explanation="2장 — 정규화해 두면 내적 한 방이 되는, 검색 점수의 정체입니다."
      />
      <Quiz
        difficulty="easy"
        question="벡터 DB는 임베딩 저장소 + ANN 색인 + 메타데이터 필터다."
        type="truefalse"
        :answer="0"
        explanation="참 — 6장. 그리고 규모가 작으면 색인 없는 배열+내적으로 충분하다는 것까지."
      />
      <Quiz
        difficulty="easy"
        question="평가 질문 5개 중 4개에서 정답 조각이 top-3 안에 들었다면 recall@3은? (소수로)"
        type="numeric"
        :answer="0.8"
        explanation="4 ÷ 5 = 0.8 — 7장의 검색 성적표입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="'쉬는 날 미리 쓰려면 어디서 해요?'가 겹치는 단어 없이도 연차 규정을 찾아낸 원리는?"
        :choices="['질문과 문서의 뜻이 임베딩 공간에서 가까워서 — 의미 검색', '봇이 모든 질문에 연차를 답하도록 고정되어서', '\'쉬는\'이라는 단어가 규정에 있어서', '우연']"
        :answer="0"
        explanation="워밍업의 약속이 캡스톤에서 실현된 순간 — 의미는 위치다, 비슷함은 가까움으로."
      />
      <Quiz
        difficulty="medium"
        question="봇이 문서에 없는 질문에 '문서에서 찾지 못했습니다'라고 답하게 만든 조합은?"
        :choices="['1위 점수의 바닥 점검 + 그라운딩 지시', '답변 길이 제한 + 이모지 금지', '검색 생략 + 무조건 사과', 'LLM 교체']"
        :answer="0"
        explanation="4장(바닥 = 무작위 수준 신호)과 8장(없으면 없다고)의 합작 — 환각을 정직한 모름으로 바꿉니다."
      />
      <Quiz
        difficulty="medium"
        question="치환표에서 '짝은 가깝게, 남은 멀게'의 실무 이름은?"
        :choices="['대조 학습 (contrastive learning) — 손실은 InfoNCE', '경사 하강 (gradient descent)', '재랭킹 (reranking)', '청킹 (chunking)']"
        :answer="0"
        explanation="9장 — 임베딩 모델(지도 그리는 손)의 표준 훈련법입니다."
      />
      <Quiz
        difficulty="medium"
        question="캡스톤 봇의 답이 자주 틀릴 때, 이 과정이 가르친 진단 1순위는?"
        :choices="['검색 로그부터 — 정답 조각이 top-k에 온전히 왔는지 확인', 'LLM을 무조건 더 큰 것으로', '사용자에게 질문을 더 잘 하라고 공지', '봇을 재부팅']"
        :answer="0"
        explanation="8장 진료실 — RAG는 대개 검색에서 죽고, 범인은 로그가 가려 줍니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="이 봇을 실전 배포할 때 '조련(파인튜닝)'이 추가로 필요해지는 요구는?"
        :choices="['답변을 항상 회사 공문 형식·존칭 체계로 쓰게 하기', '어제 개정된 규정을 반영하기', '답변에 출처 링크 달기', '문서 1만 건으로 늘리기']"
        :answer="0"
        :hints="['갈림길 기준 — 지식인가, 행동인가?']"
        explanation="말투·형식은 행동 양식이라 조련(6부)의 영역 — 나머지 셋은 전부 RAG(문서 갱신·그라운딩·인덱싱)로 해결됩니다. 병행 구도(8장)죠."
      />
      <Quiz
        difficulty="hard"
        question="봇 도입 후 개선 사이클로 가장 올바른 것은?"
        :choices="['실사용 질문 로그로 평가 세트를 키우고 → recall@k로 재고 → 낮은 문항의 범인(청킹·임베딩·k·그라운딩)을 고치는 반복', '만점이 나올 때까지 데모 질문만 반복 시연', '점수 없이 느낌으로 매주 설정을 바꾼다', '문제가 생기면 봇을 폐기하고 새로 만든다']"
        :answer="0"
        :hints="['7장의 정신 + 8장의 진료실 + 더 깊이의 피드백 루프.']"
        explanation="만들고 → 재고 → 다듬는 반복이 곧 RAG 개발 — 측정 없는 개선은 없다(6부 9장부터 이어진 시리즈의 결론)입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch10')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center"
    >
      <div class="mb-1 text-2xl font-bold text-emerald-700">🎉</div>
      <p class="text-lg font-bold text-emerald-800">7부 완주 — 임베딩 기하학, 완결!</p>
      <p class="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-emerald-700">
        "의미는 위치다"라는 한 문장에서 출발해 — 코사인, 고차원, 벡터 DB, recall@k, 대조 학습을
        지나 — 사내 FAQ 검색봇을 직접 조립했습니다. 이해의 여정(1~6부)에 이어 첫 실용 트랙까지
        완주하셨어요. 이제 배운 것을 <b>회사의 진짜 문서</b>로 옮겨 볼 차례입니다.
        노트북의 Ollama 연결 실험이 그 첫걸음이 되어 줄 거예요.
      </p>
      <RouterLink
        to="/"
        class="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        🗺️ 목차로 — 여정 돌아보기
      </RouterLink>
    </div>
  </article>
</template>
