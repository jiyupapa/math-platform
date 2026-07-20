<script setup lang="ts">
// 9장 — 임베딩은 어떻게 배우나: 대조 학습 ("짝은 가깝게, 남은 멀게" + 또 −log).
// 회수하는 수학: 5부 4장 크로스 엔트로피 · 6부 4장 보상 모델(쌍 학습) · 2부 9장 경사하강.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ContrastiveLab from '@/components/ContrastiveLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch9')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">9장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">임베딩은 어떻게 배우나 — 대조 학습</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업부터 미뤄 온 마지막 퍼즐입니다 — <b>이 좋은 지도는 누가 그렸나?</b>
      토끼를 동물 옆에 놓은 건 여러분이었지만, 실제 임베딩의 수백 차원 좌표는
      사람이 배치할 수 없죠. 답은 놀랄 만큼 단순한 규칙 하나입니다 —
      <b>"짝은 가깝게, 남은 멀게."</b> 그리고 그 규칙을 손실로 바꾸는 순간,
      이 시리즈에서 세 번째로 그 얼굴을 만나게 됩니다: <b>−log.</b>
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지를 가져갑니다 — ① <b>대조 학습</b>의 목표(짝은 끌고 남은 밀기)와 훈련 데이터(양성/음성 쌍),
      ② 그 목표를 담는 손실(<b>softmax + −log</b> — 5부·6부의 그 가족), ③ 3장에서 본
      클러스터·방향 구조가 <b>이 학습의 부산물</b>로 태어나는 현장.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 목표 선언 — 좋은 지도의 조건은 하나</h2>
    <ReviewFlag id="ch9-s1" chapter="ch9" label="1. 목표 선언 — 좋은 지도의 조건은 하나" />
    <p class="leading-relaxed text-slate-700">
      7부 내내 지도에 요구한 것은 단 하나였습니다 — <b>가까움 = 비슷함</b>. 이걸 학습 목표로
      뒤집으면: <b>관련 있는 쌍은 가깝게, 무관한 쌍은 멀게</b> 좌표를 옮겨라.
      관련 있는 쌍(<b>양성 쌍</b>)은 세상에 널려 있어요 — 검색 로그의 (질문, 클릭된 문서),
      같은 문서의 이웃 문단, (제목, 본문), 번역문 쌍…. 무관한 쌍(<b>음성 쌍</b>)은 더 쉽습니다:
      <b>같은 훈련 묶음(배치) 안의 다른 문서들</b>이 공짜 음성이 되거든요.
      이 데이터로 좌표를 조금씩 옮기는 것 — 그게 전부입니다. 직접 옮겨 보세요.
    </p>

    <ContrastiveLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 구조는 부산물이다">
      실험 ①에서 아무도 "클러스터를 만들어라"라고 지시하지 않았습니다. <b>짝은 끌고 남은 민다</b>는
      국소 규칙만 반복했는데 지도가 스스로 정리됐죠. 실제 임베딩 공간의 클러스터(3장),
      의미의 방향(왕−남자+여자), 심지어 편향(3장 더 깊이)까지 — 전부 이 학습의
      <b>부산물</b>입니다. word2vec의 "저절로 생긴 구조"의 정체가 이것이었어요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="대조 학습에서 음성 쌍(무관한 쌍)은 보통 어디서 구하나요?"
      :choices="['같은 훈련 배치 안의 다른 문서들 — 별도 제작 없이 공짜', '사람이 일일이 무관한 문서를 골라 라벨링한다', '음성 쌍은 필요 없다', 'LLM에게 무관한 문서를 생성시킨다']"
      :answer="0"
      :hints="['실험 ①에서 D2·D3가 Q1에게 무엇이었는지 — 따로 만든 게 아니죠.']"
      explanation="배치 안 이웃이 서로의 음성이 됩니다(in-batch negatives) — 양성 쌍만 모으면 음성은 공짜라는 것이 대조 학습의 실용적 매력이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 목표를 손실로 — 또 너였구나, −log</h2>
    <ReviewFlag id="ch9-s2" chapter="ch9" label="2. 목표를 손실로 — 또 너였구나, −log" />
    <p class="leading-relaxed text-slate-700">
      "짝은 가깝게"를 미분 가능한 숫자로 바꿔야 경사하강(2부 9장 — 손실이 줄어드는 방향으로
      파라미터를 조금씩 미는 학습 절차)이 밀 수 있습니다.
      만드는 법은 6부에서 본 요리 그대로인데, 못 봤어도 괜찮아요(아래 카드) — 질문과 후보 문서들의
      유사도를 <b>소프트맥스</b>로 확률로 바꾸고, <b>정답 문서에 준 확률에 −log</b>를 씌웁니다:
    </p>
    <MathBlock expr="\text{손실} = -\log \frac{e^{s_+/\tau}}{e^{s_+/\tau} + \sum_{\text{오답}} e^{s_-/\tau}}" />
    <p class="leading-relaxed text-slate-700">
      읽는 법: "정답 유사도 s₊가 오답 유사도 s₋들을 제치고 뽑힐 확률에 −log".
      τ(타우)는 온도 — 4부 12장의 그 온도와 같은 역할로, 차이를 얼마나 날카롭게 반영할지
      정합니다. 실험 ②에서 만졌듯 <b>절대 점수가 아니라 정답과 오답의 간격</b>이 손실을
      결정하고, 손실을 낮추는 유일한 길은 <b>짝 유사도는 올리고 남 유사도는 내리는 것</b> —
      목표 선언이 그대로 수식이 된 겁니다. 이 손실의 이름은 <b>InfoNCE</b>라 불립니다.
    </p>

    <ConceptCard tone="note" title="처음이어도 괜찮아요 — 이 수식의 부품 사전">
      <ul class="list-disc space-y-1 pl-5 text-sm leading-relaxed">
        <li>
          <b>소프트맥스(softmax)</b> — 읽는 법: 소프트맥스. 뜻: 점수 목록을 <b>합이 1인 확률</b>로
          바꾸는 변환. 각 점수 s 에 <MathBlock inline expr="e^{s}" /> 를 취해(e ≈ 2.718 — 어떤 점수든
          <b>양수</b>가 되게 하는 거듭제곱) 전체 합으로 나눕니다 — 큰 점수일수록 큰 확률을 받아요.
        </li>
        <li>
          <b>Σ(시그마)</b> — 뜻: "오답 후보들 것을 <b>전부 더하라</b>"는 합 기호. 분모가 "정답 +
          오답 전부"라서 확률의 합이 1이 됩니다.
        </li>
        <li>
          <b>−log</b> — 뜻: 정답에 준 확률이 1에 가까우면 손실 ≈ 0, 작을수록 손실이 치솟는
          <b>벌점 변환</b>. τ(타우)는 위에서 말한 온도 다이얼입니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="후보 4개(정답 1 + 오답 3)에서 모델이 정답·오답을 전혀 구분하지 못하면 손실은?"
      :choices="['P = 1/4이므로 −log₂(1/4) = 2비트', '0비트 — 구분 못 하면 손실이 없다', '무한대', '−2비트']"
      :answer="0"
      :hints="['실험 ②에서 s₊ = s₋로 맞췄을 때.']"
      explanation="4지선다 찍기 확률 1/4 → 2비트. 여기서 손실을 줄이는 유일한 방법이 간격 벌리기 — 그래서 학습이 '짝은 끌고 남은 밀게' 됩니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 세 번째 재회 — 이 가족의 계보</h2>
    <ReviewFlag id="ch9-s3" chapter="ch9" label="3. 세 번째 재회 — 이 가족의 계보" />
    <p class="leading-relaxed text-slate-700">
      이 시리즈에서 −log 손실을 만난 곳을 세어 보면 — <b>5부 4장</b>(다음 토큰의 크로스 엔트로피),
      <b>6부 4장</b>(보상 모델: 선호 쌍 비교), 그리고 오늘(임베딩: 문서 고르기).
      셋 다 구조가 같습니다: <b>여럿 중 하나를 고르는 확률을 만들고, 정답에 준 확률을 벌점으로.</b>
      LLM의 말하기도, 취향도, 지도 그리기도 결국 같은 수학 위에 서 있어요 —
      "확신하고 맞히면 벌점 0, 헷갈리면 폭발"이라는 하나의 채점 철학입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 대조 학습 / 양성·음성 쌍 / InfoNCE">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>대조 학습</b> (contrastive learning) — 읽는 법: 컨트라스티브 러닝.
          뜻: 짝(관련 쌍)은 가깝게, 남(무관 쌍)은 멀게 좌표를 옮기는 임베딩 학습법.
          현대 문장 임베딩 모델의 표준 훈련법입니다.
        </li>
        <li>
          <b>양성 쌍 / 음성 쌍</b> (positive / negative pair) — 읽는 법: 파지티브/네거티브 페어.
          뜻: 가까워져야 할 쌍(질문-정답 문서 등) / 멀어져야 할 쌍(대개 배치 안 다른 문서 — 공짜).
        </li>
        <li>
          <b>InfoNCE</b> — 읽는 법: 인포엔시이.
          뜻: 대조 학습의 표준 손실 — 유사도들을 소프트맥스로 확률화하고 정답에 −log.
          온도 τ로 날카로움을 조절합니다.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">짝은 가깝게, 남은 멀게 — 이 목표를 −log에 담아 경사하강으로 밀면, 의미의 지도가 스스로 그려진다</p>
      <p class="mt-1 text-sm text-indigo-600">클러스터도, 의미의 방향도, 검색의 성패도 — 전부 이 학습의 부산물.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="3장의 클러스터·의미의 방향 구조는 개발자가 좌표를 손으로 설계해서 생긴 것이다."
      type="truefalse"
      :answer="1"
      explanation="거짓입니다. '짝은 끌고 남은 민다'는 학습 규칙의 부산물 — 실험 ①에서 그 탄생을 직접 봤죠."
    />

    <DetailsCard title="➕ 더 깊이: 좋은 오답이 좋은 선생 — 하드 네거티브와 도메인 파인튜닝">
      실무 디테일 셋. ① <b>하드 네거티브</b>(hard negative): 이미 멀리 있는 쉬운 오답은
      밀어 봐야 배울 게 없습니다 — <b>정답과 헷갈리게 비슷한 오답</b>(예: "연차 신청" 질문에
      "연차 수당 정산" 문서)을 일부러 섞어 줘야 경계가 날카로워져요. 6부 4장에서 비슷한 답변 쌍이
      보상 모델을 단련시키던 것과 같은 이치. ② <b>도메인 파인튜닝</b>: 기성 임베딩 모델이 사내
      용어(제품 코드명·부서 약칭)에 약하면, 자사 질문-문서 쌍(검색 로그!)으로 대조 학습을
      이어서 시킬 수 있습니다 — 조련(6부)의 임베딩판인 셈이죠. ③ 실무에서 만날 이름들:
      sentence-transformers(라이브러리), E5·BGE(공개 임베딩 모델 계열) — 전부 이 장의
      대조 학습으로 훈련된 기성품입니다.
    </DetailsCard>

    <ReviewFlag id="ch9-ai" chapter="ch9" label="🤖 AI 연결 — 회수하는 수학: 5부 4장 · 6부 4장 · 2부 9장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 5부 4장 · 6부 4장 · 2부 9장">
      이 장은 시리즈 수학의 삼중 회수입니다 — 손실의 얼굴은
      <b><PartLink :part="5" ch="ch4">5부 4장</PartLink></b>(크로스 엔트로피: 정답에 준 확률에 −log)이고,
      "쌍을 비교해 배운다"는 틀은 <b><PartLink :part="6" ch="ch4">6부 4장</PartLink></b>(보상 모델:
      선호 쌍)과 형제이며, 좌표를 실제로 옮기는 손은
      <b><PartLink :part="2" ch="ch9">2부 9장</PartLink></b>(경사하강)입니다.
      RAG 파이프라인(8장)의 인덱싱 단계에 서 있는 임베딩 모델이 바로 이렇게 태어난 기성품이에요.
      이제 정말 전부 모였습니다 — 마지막 장에서 사내 FAQ 검색봇을 처음부터 끝까지 조립합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="대조 학습 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="대조 학습의 목표를 한 줄로 옮기면?"
        :choices="['관련 쌍은 가깝게, 무관 쌍은 멀게 좌표를 옮긴다', '모든 벡터를 원점에 모은다', '벡터 길이를 최대한 늘린다', '좌표를 무작위로 섞는다']"
        :answer="0"
        explanation="짝은 끌고 남은 밀기 — 좋은 지도의 조건(가까움 = 비슷함)을 그대로 학습 목표로 만든 것입니다."
      />
      <Quiz
        difficulty="easy"
        question="양성 쌍(positive pair)의 예로 알맞은 것은?"
        :choices="['(질문, 그 질문에 클릭된 정답 문서)', '(아무 문서, 아무 문서)', '(문서, 그 문서와 무관한 광고)', '(질문, 오답 문서)']"
        :answer="0"
        explanation="가까워져야 할 쌍 — 검색 로그·이웃 문단·제목-본문 쌍 등 세상에 널려 있는 게 대조 학습의 힘이에요."
      />
      <Quiz
        difficulty="easy"
        question="임베딩 공간의 좌표는 개발자가 단어마다 손으로 입력한 값이다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 대조 학습(짝은 끌고 남은 밀고)이 경사하강으로 스스로 배치한 값이에요."
      />
      <Quiz
        difficulty="easy"
        question="후보 8개(정답 1 + 오답 7)를 전혀 구분 못 하는 모델의 손실은 몇 비트? (−log₂(1/8))"
        type="numeric"
        :answer="3"
        explanation="P = 1/8 → 3비트. 5부 1장의 스무고개 감각 그대로입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="학습 전 모델은 정답 문서를 고를 확률이 1/4이었는데, 학습 후 1/2로 개선됐습니다. 손실(비트)의 변화를 구하세요."
        :steps="[
          { lhs: '\\text{학습 전 } -\\log_2(1/4)', answer: 2 },
          { lhs: '\\text{학습 후 } -\\log_2(1/2)', answer: 1 },
          { lhs: '\\text{줄어든 손실}', answer: 1 },
        ]"
        :hints="['−log₂(1/N) = 2를 몇 번 곱하면 N — 5부 1장의 감각.', '2 − 1']"
        explanation="2비트 → 1비트, 1비트 개선. 손실이 줄어드는 방향 = 짝 유사도는 오르고 남 유사도는 내려가는 방향입니다."
      />
      <Quiz
        difficulty="medium"
        question="InfoNCE 손실을 낮추기 위해 모델이 할 수 있는 일은?"
        :choices="['정답 쌍의 유사도는 올리고 오답들의 유사도는 내린다 (간격 벌리기)', '모든 유사도를 똑같이 올린다', '모든 유사도를 똑같이 내린다', '유사도와 무관하게 손실은 고정이다']"
        :answer="0"
        :hints="['실험 ② — 절대값이 아니라 무엇이 전부라고 했죠?']"
        explanation="softmax는 상대 비교라 다 같이 오르면 P가 안 변합니다 — 간격만이 손실을 움직여요. 그래서 '짝은 끌고 남은 밀기'가 강제됩니다."
      />
      <Quiz
        difficulty="medium"
        question="3장에서 본 '의미의 방향'(왕−남자+여자)이 생긴 이유를 이 장의 언어로 옮기면?"
        :choices="['비슷한 문맥의 쌍들을 끌어당기다 보니 관계의 규칙성이 기하 구조로 새겨진 부산물', '개발자가 성별 방향을 프로그래밍해서', '왕과 여왕의 철자가 비슷해서', '우연히 한 번 관측된 현상일 뿐']"
        :answer="0"
        explanation="목표는 짝 끌기뿐이었지만, 언어의 통계적 규칙성이 좌표에 새겨지며 방향 구조가 태어납니다 — 구조는 부산물."
      />
      <Quiz
        difficulty="medium"
        question="−log 손실 가족이 이 시리즈에서 등장한 세 곳을 옳게 묶은 것은?"
        :choices="['5부 4장(다음 토큰) · 6부 4장(보상 모델) · 7부 9장(임베딩)', '1부 2장 · 2부 3장 · 3부 4장', '워밍업 · 1장 · 2장', '−log는 이 장에서 처음 나왔다']"
        :answer="0"
        explanation="말하기·취향·지도 그리기 — 셋 다 '고르는 확률 + 정답에 −log'라는 같은 채점 철학 위에 있습니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="하드 네거티브(정답과 헷갈리게 비슷한 오답)를 훈련에 일부러 섞는 이유는?"
        :choices="['이미 먼 쉬운 오답은 밀어도 배울 게 없고, 헷갈리는 오답이어야 경계가 날카로워지므로', '훈련 데이터 양을 줄이려고', '손실을 0으로 고정하려고', '모델을 일부러 혼란시켜 겸손하게 만들려고']"
        :answer="0"
        :hints="['\'연차 신청\' 질문의 좋은 선생은 \'회의실 예약\'일까, \'연차 수당 정산\'일까?']"
        explanation="기울기는 헷갈리는 지점에서 큽니다 — 6부 4장에서 비슷한 답변 쌍이 보상 모델을 단련시키던 것과 같은 이치예요."
      />
      <Quiz
        difficulty="hard"
        question="사내 제품 코드명 검색이 기성 임베딩 모델에서 계속 부정확합니다. 이 장이 주는 근본 처방은?"
        :choices="['자사 질문-문서 쌍(검색 로그)으로 임베딩 모델을 대조 학습으로 추가 훈련한다 (+당장은 하이브리드 검색 보완)', '코드명을 전부 영어로 바꾼다', 'LLM 프롬프트를 길게 쓴다', 'k를 100으로 올린다']"
        :answer="0"
        :hints="['기성 지도에 없는 동네는 — 지도를 다시 그려야죠. 무엇으로?']"
        explanation="기성 모델의 훈련 데이터에 없던 도메인 어휘는 좌표가 엉성합니다. 자사 쌍 데이터로 도메인 파인튜닝(임베딩판 조련)이 근본 처방 — 당장은 키워드 병용(1장)으로 버팁니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch9')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">9장 완료 — 지도를 그리는 손까지 이해했어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        이론은 끝났습니다. 마지막 장 — 🎯 캡스톤. 임베딩 → 코사인 → top-k → 그라운딩 —
        배운 전부로 사내 FAQ 검색봇을 처음부터 끝까지 조립합니다.
      </p>
      <RouterLink
        to="/ch/ch10"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        10장 — 🎯 캡스톤, 사내 FAQ 검색봇 →
      </RouterLink>
    </div>
  </article>
</template>
