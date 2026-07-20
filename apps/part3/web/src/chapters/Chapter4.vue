<script setup lang="ts">
// Phase 4 · 조건부 확률과 베이즈 정리 (정보가 확률을 바꾼다 — 이 과정의 핵심 1)
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import BayesGrid from '@/components/BayesGrid.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch4')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 4 · 핵심 챕터 ★</p>
    <h1 class="mb-4 text-3xl font-bold">조건부 확률과 베이즈 정리 🩺</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      3장의 확률은 "아무 정보도 없을 때"의 이야기였어요. 그런데 현실에서는 늘
      <b>힌트(정보)</b>가 주어집니다 — "검사 결과가 양성이래", "메일에 '무료'라는 단어가 있어".
      이번 챕터의 주제는 딱 한 문장입니다: <b>정보는 확률을 바꾼다.</b>
      그리고 그 바뀌는 규칙이 스팸 필터부터 의료 AI까지 관통하는 <b>베이즈 정리</b>예요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>조건부 확률 <MathBlock inline expr="P(A \mid B)" /> 를 "좁아진 세계에서 다시 세기"로 이해한다</li>
        <li><MathBlock inline expr="P(A \mid B) \ne P(B \mid A)" /> — 방향을 헷갈리는 함정을 피한다</li>
        <li>베이즈 정리를 <b>자연 빈도(사람 수 세기)</b>로 계산한다 — 질병 검사 역설</li>
        <li>스팸 필터가 단어 하나로 확률을 업데이트하는 원리를 본다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 힌트가 확률을 바꾼다 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 힌트 하나에 확률이 변한다</h2>
    <ReviewFlag id="ch4-s1" chapter="ch4" label="1. 힌트 하나에 확률이 변한다" />
    <p class="leading-relaxed text-slate-700">
      친구가 주사위를 던지고 결과를 가렸습니다. 6이 나왔을 확률은?
      당연히 <MathBlock inline expr="\tfrac{1}{6}" /> 이죠. 그런데 친구가 힌트를 줍니다 —
      <b>"짝수야."</b> 이제 가능한 눈은 {2, 4, 6} 셋뿐. 세계가 좁아졌으니 6일 확률은
      <MathBlock inline expr="\tfrac{1}{3}" /> 로 <b>올라갑니다</b>. 주사위는 그대로인데
      <b>정보</b>가 확률을 바꾼 거예요.
    </p>

    <!-- 2. 조건부 확률 정의 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 조건부 확률 — 좁아진 세계에서 다시 세기</h2>
    <ReviewFlag id="ch4-s2" chapter="ch4" label="2. 조건부 확률의 정의" />
    <p class="leading-relaxed text-slate-700">
      방금 한 일을 기호로 쓰면 <b>조건부 확률</b>입니다. "B 라는 정보가 주어졌을 때 A 의 확률":
    </p>
    <MathBlock expr="P(A \mid B) = \dfrac{P(A \cap B)}{P(B)}" />

    <ConceptCard tone="note" title="새 기호 — P(A|B) 세로선 읽는 법">
      <ul class="list-disc space-y-2 pl-5 text-sm">
        <li>
          <MathBlock inline expr="P(A \mid B)" /> &nbsp; <b>읽는 법</b>: "비가 주어졌을 때 에이의 확률" ·
          <b>뜻</b>: 사건 B 가 일어났다는 걸 <b>알고 있을 때</b> A 가 일어날 확률.
          세로선 | 은 "~라는 조건에서"라는 칸막이입니다.
        </li>
        <li>
          분모가 <MathBlock inline expr="P(B)" /> 인 이유: 전체가 아니라 <b>B 로 좁아진 세계</b>가
          새 기준(분모)이 되기 때문. 그 안에서 A 까지 일어난 부분(<MathBlock inline expr="A \cap B" />)의 비율을 잽니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      주사위 예로 검산: A = "6이 나옴", B = "짝수" 라면
      <MathBlock inline expr="P(A \cap B) = \tfrac{1}{6}" /> (6은 짝수이기도 하니까),
      <MathBlock inline expr="P(B) = \tfrac{3}{6}" /> 이므로
      <MathBlock inline expr="P(A \mid B) = \tfrac{1/6}{3/6} = \tfrac{1}{3}" />.
      아까 직관으로 센 것과 정확히 같죠!
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="주사위를 던져 '짝수'라는 힌트를 들었을 때 6일 확률은? (소수 둘째 자리 반올림)"
      type="numeric"
      :answer="0.33"
      :tolerance="0.005"
      :hints="['좁아진 세계는 {2, 4, 6} 세 가지.', '1 ÷ 3.']"
      explanation="1/3 ≈ 0.33. 힌트가 없을 때(1/6 ≈ 0.17)의 두 배로 올랐습니다."
    />

    <!-- 3. 2x2 표 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 표로 세면 눈에 보인다</h2>
    <ReviewFlag id="ch4-s3" chapter="ch4" label="3. 2×2 표로 조건부 확률 세기" />
    <p class="leading-relaxed text-slate-700">
      조건부 확률은 <b>사람 수를 표로 세는 것</b>이 제일 쉽습니다. 어느 학급 40명을
      성별과 안경 착용으로 나눠 봤어요:
    </p>

    <div class="my-5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
      <table class="mx-auto text-center text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500">
            <th class="px-4 py-2 font-medium"></th>
            <th class="px-4 py-2 font-medium">안경 씀</th>
            <th class="px-4 py-2 font-medium">안 씀</th>
            <th class="px-4 py-2 font-medium text-slate-700">합계</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-slate-100">
            <td class="py-1.5 font-medium text-slate-500">남학생</td>
            <td class="font-mono text-indigo-700">6</td>
            <td class="font-mono">18</td>
            <td class="font-mono font-bold">24</td>
          </tr>
          <tr class="border-b border-slate-100">
            <td class="py-1.5 font-medium text-slate-500">여학생</td>
            <td class="font-mono text-indigo-700">4</td>
            <td class="font-mono">12</td>
            <td class="font-mono font-bold">16</td>
          </tr>
          <tr>
            <td class="py-1.5 font-medium text-slate-700">합계</td>
            <td class="font-mono font-bold text-indigo-700">10</td>
            <td class="font-mono font-bold">30</td>
            <td class="font-mono font-bold">40</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ul class="list-disc space-y-1 pl-5 leading-relaxed text-slate-700">
      <li>
        <b>P(안경 | 남학생)</b> — 남학생 24명으로 세계를 좁히고, 그중 안경 6명:
        <MathBlock inline expr="\tfrac{6}{24} = 0.25" />
      </li>
      <li>
        <b>P(남학생 | 안경)</b> — 이번엔 안경 10명으로 좁히고, 그중 남학생 6명:
        <MathBlock inline expr="\tfrac{6}{10} = 0.6" />
      </li>
    </ul>
    <p class="mt-2 leading-relaxed text-slate-700">
      같은 표, 같은 6명인데 <b>어느 쪽으로 좁히느냐</b>에 따라 0.25와 0.6 — 전혀 다른 값이 나왔습니다.
      이게 다음 함정의 핵심이에요.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="위 표에서 여학생 중 안경을 쓴 학생의 비율 P(안경 | 여학생)은? (소수로 입력)"
      type="numeric"
      :answer="0.25"
      :tolerance="0.001"
      :hints="['여학생 16명으로 세계를 좁히세요.', '4 ÷ 16.']"
      explanation="4/16 = 0.25. 남학생도 6/24 = 0.25 — 이 학급에선 성별과 안경이 서로 영향이 없네요(다음 절의 '독립')."
    />

    <!-- 4. 독립 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 독립 — 정보를 들어도 확률이 안 변하면</h2>
    <ReviewFlag id="ch4-s4" chapter="ch4" label="4. 독립의 진짜 뜻" />
    <p class="leading-relaxed text-slate-700">
      위 표에서 P(안경) = 10/40 = 0.25 인데, P(안경 | 남학생) 도 0.25, P(안경 | 여학생) 도 0.25.
      성별을 <b>들어도 안경 확률이 그대로</b>죠. 이럴 때 두 사건이 <b>독립</b>이라고 합니다 —
      3장에서 "서로 영향 없음"이라고 했던 그 개념의 정확한 정의가 바로 이겁니다:
    </p>
    <MathBlock expr="P(A \mid B) = P(A)" />
    <p class="leading-relaxed text-slate-700">
      즉 <b>A, B 가 독립이라는 말은 위 등식이 성립한다는 뜻</b>입니다 —
      "정보 B 를 들어도 A 의 확률이 안 변한다". 그래서 독립일 때만
      <MathBlock inline expr="P(A \cap B) = P(A)P(B)" /> 곱셈법칙이 성립해요.
    </p>

    <!-- 5. 방향 함정 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 최대 함정 — P(A|B) ≠ P(B|A)</h2>
    <ReviewFlag id="ch4-s5" chapter="ch4" label="5. P(A|B) ≠ P(B|A) 함정" />

    <ConceptCard tone="warn" title="조건의 방향을 뒤집으면 다른 확률이다">
      <ul class="list-disc space-y-2 pl-5 text-sm">
        <li>위 표에서 <b>P(안경|남) = 0.25</b> 이지만 <b>P(남|안경) = 0.6</b> — 전혀 다릅니다.</li>
        <li>
          의료판 버전: "<b>병이 있을 때</b> 검사가 양성일 확률"(민감도 90%)과
          "<b>검사가 양성일 때</b> 병이 있을 확률"은 완전히 다른 질문입니다.
          아래에서 보겠지만 후자는 9%대까지 떨어질 수 있어요.
        </li>
        <li>뉴스·광고가 이 둘을 슬쩍 바꿔치기하는 일이 정말 많습니다. 세로선 | 의 <b>오른쪽(조건)</b>이 무엇인지 항상 확인하세요.</li>
      </ul>
    </ConceptCard>

    <!-- 6. 베이즈 - 자연 빈도 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">6. 질병 검사 역설 — 1000명을 직접 세어 보자</h2>
    <ReviewFlag id="ch4-s6" chapter="ch4" label="6. 질병 검사 역설 (자연 빈도)" />
    <p class="leading-relaxed text-slate-700">
      유병률 1%인 병이 있고, 검사는 꽤 훌륭합니다 — 병자는 90% 잡아내고(민감도),
      건강한 사람이 잘못 양성 나올 확률은 9%(위양성률). 당신이 <b>양성</b>을 받았다면,
      실제로 병일 확률은 얼마일까요? "검사가 90%짜리니까 90%겠지"… 정말 그럴까요?
      공식 없이 <b>1000명을 그냥 세어 봅시다</b>:
    </p>

    <ul class="list-disc space-y-1 pl-5 leading-relaxed text-slate-700">
      <li>1000명 중 병이 있는 사람: 1% → <b>10명</b> (건강한 사람 990명)</li>
      <li>병자 10명 중 검사 양성: 90% → <b>진양성 9명</b> (1명은 놓침)</li>
      <li>건강한 990명 중 잘못 양성: 9% → <b>위양성 89명</b> (정확히는 990 × 0.09 = 89.1명이라 약 89명으로 반올림)</li>
      <li>양성 전체 = 9 + 89 = <b>98명</b>. 그중 진짜 병자는 <b>9명</b>.</li>
    </ul>
    <MathBlock expr="P(\text{병} \mid \text{양성}) = \dfrac{9}{98} \approx 0.092 \;\; (9.2\%)" />
    <p class="leading-relaxed text-slate-700">
      <b>9.2%</b>. 양성을 받아도 실제 병일 확률이 10%도 안 됩니다! 이유는 간단해요 —
      병자(10명)보다 건강한 사람(990명)이 압도적으로 많아서, 9%의 위양성만으로도
      <b>가짜 양성(89명)이 진짜 양성(9명)을 압도</b>하기 때문입니다. 직접 만져 보세요:
    </p>

    <BayesGrid />

    <StepQuiz
      difficulty="medium"
      question="위 상황(1000명, 유병률 1%, 민감도 90%, 건강한 990명 중 89명이 잘못 양성)에서 '양성일 때 실제 병일 확률'을 단계별로 구하세요."
      :steps="[
        { lhs: '1000 \\times 0.01', answer: 10 },
        { lhs: '10 \\times 0.9', answer: 9 },
        { lhs: '9 + 89', answer: 98 },
        { lhs: '9 \\div 98', answer: 0.092, tolerance: 0.005 },
      ]"
      :hints="[
        '1단계: 1000명 중 병이 있는 사람 수.',
        '2단계: 병자 중 검사가 잡아낸 사람(진양성).',
        '마지막: 진양성 ÷ 양성 전체. 소수 셋째 자리 반올림.',
      ]"
      explanation="병자 10명 → 진양성 9명, 양성 전체 98명이므로 9/98 ≈ 0.092. 검사 정확도(90%)와 양성일 때 병일 확률(9.2%)은 완전히 다른 숫자입니다."
    />

    <!-- 7. 베이즈 정리 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">7. 방금 한 것의 이름 — 베이즈 정리</h2>
    <ReviewFlag id="ch4-s7" chapter="ch4" label="7. 베이즈 정리와 믿음 업데이트" />
    <p class="leading-relaxed text-slate-700">
      방금 사람 수로 센 계산을 공식으로 쓰면 <b>베이즈 정리</b>입니다.
      "결과(양성)를 보고 원인(병)의 확률을 거꾸로 구하는" 공식이에요:
    </p>
    <MathBlock expr="P(\text{병} \mid \text{양성}) = \dfrac{P(\text{양성} \mid \text{병}) \, P(\text{병})}{P(\text{양성})}" />

    <ConceptCard tone="note" title="새 용어 — 사전확률 / 사후확률">
      <ul class="list-disc space-y-2 pl-5 text-sm">
        <li><b>사전확률(prior)</b>: 증거를 보기 <b>전</b>의 믿음 — 검사 전 병일 확률 1%.</li>
        <li><b>증거(evidence)</b>: 새로 들어온 정보 — "검사 양성".</li>
        <li><b>사후확률(posterior)</b>: 증거를 반영해 <b>업데이트된</b> 믿음 — 9.2%.</li>
        <li>
          베이즈 정리 = <b>사전확률 → (증거) → 사후확률</b>로 믿음을 갱신하는 규칙.
          공식을 못 외워도, "1000명을 세는" 방법만 기억하면 언제든 다시 만들 수 있어요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="양성 판정을 받았을 때 실제 병일 확률이 9.2%로 낮았던 근본 이유는?"
      :choices="[
        '건강한 사람이 워낙 많아 위양성 수가 진양성 수를 압도해서',
        '검사의 민감도가 너무 낮아서',
        '병자들이 검사를 안 받아서',
        '계산에 반올림 오차가 커서',
      ]"
      :answer="0"
      :hints="['진양성 9명 vs 위양성 89명 — 왜 89명이나 될까요?']"
      explanation="유병률이 1%로 낮아 건강한 사람이 990명. 그 9%(89명)가 병자 10명의 90%(9명)보다 훨씬 많기 때문입니다. 유병률(사전확률)이 낮으면 양성의 의미가 약해져요."
    />

    <!-- 8. 스팸 필터 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">8. 스팸 필터 — 단어 하나가 확률을 바꾼다</h2>
    <ReviewFlag id="ch4-s8" chapter="ch4" label="8. 스팸 필터 미니 계산" />
    <p class="leading-relaxed text-slate-700">
      똑같은 논리로 스팸 필터를 만들 수 있습니다. 받은 메일 100통을 조사했더니:
      스팸이 20통(그중 "무료"라는 단어 포함 12통), 정상이 80통(그중 "무료" 포함 8통).
      새 메일에 <b>"무료"가 있다면</b> 스팸일 확률은?
    </p>
    <ul class="list-disc space-y-1 pl-5 leading-relaxed text-slate-700">
      <li>"무료"가 든 메일 전체 = 12 + 8 = <b>20통</b></li>
      <li>그중 스팸 = <b>12통</b></li>
    </ul>
    <MathBlock expr="P(\text{스팸} \mid \text{무료}) = \dfrac{12}{20} = 0.6" />
    <p class="leading-relaxed text-slate-700">
      "무료"라는 단어를 보기 전에는 스팸 확률이 20%(사전확률)였는데, 단어 하나로
      <b>60%(사후확률)</b>까지 뛰었습니다. 실제 필터는 이런 단어 수십 개의 증거를
      차곡차곡 곱해서 판정해요.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'무료'가 포함됐다는 정보 하나로 스팸 확률이 20%에서 60%로 올랐다 — 이것이 사전확률에서 사후확률로의 업데이트다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 증거(단어)를 반영해 믿음(스팸 확률)을 갱신했죠. 이게 베이즈 정리의 전부입니다."
    />

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 나이브 베이즈 — AI의 첫 번째 분류기</h2>
    <ReviewFlag id="ch4-ai" chapter="ch4" label="🤖 나이브 베이즈와 믿음 업데이트" />
    <p class="leading-relaxed text-slate-700">
      방금 만든 스팸 계산기를 단어 전체로 확장한 것이 <b>나이브 베이즈(Naive Bayes) 분류기</b> —
      초창기 스팸 필터가 실제로 이 방식이었고, 지금도 텍스트 분류의 기본기로 쓰입니다.
      "각 단어가 독립"이라는 순진한(naive) 가정 덕분에 3장의 곱셈법칙으로 증거들을 결합할 수 있어요.
    </p>

    <ConceptCard tone="ai" title="베이즈 관점 = AI 학습의 큰 그림">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>나이브 베이즈</b>: P(스팸|단어들) ∝ P(단어들|스팸) × P(스팸) — 방금 배운 공식 그대로.
          (∝ 는 "~에 비례한다"는 기호예요 — 분모는 생략하고 어느 쪽이 큰지만 비교한다는 뜻)
        </li>
        <li>
          더 크게 보면, AI 학습 자체가 베이즈적입니다 — <b>사전 믿음(초기 모델)</b>이
          <b>증거(데이터)</b>를 만나 <b>사후 믿음(학습된 모델)</b>으로 업데이트되는 과정.
        </li>
        <li>의료 AI가 "양성이지만 유병률이 낮으니 신중히"라고 판단하는 근거도 오늘 배운 사전확률입니다.</li>
      </ul>
    </ConceptCard>

    <!-- 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">9. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="조건부 확률과 베이즈 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="P(A|B)는 'B가 일어났다는 조건에서 A가 일어날 확률'이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 세로선 | 오른쪽이 조건(주어진 정보), 왼쪽이 궁금한 사건이에요."
      />
      <Quiz
        difficulty="easy"
        question="조건부 확률 P(A|B)를 구하는 식으로 알맞은 것은?"
        :choices="[
          'P(A∩B) ÷ P(B)',
          'P(A) × P(B)',
          'P(A∪B) ÷ P(B)',
          'P(B) − P(A)',
        ]"
        :answer="0"
        :hints="['B로 좁아진 세계(분모)에서 A∩B의 비율.']"
        explanation="P(A|B) = P(A∩B)/P(B). 좁아진 세계 B가 새 분모가 됩니다."
      />
      <Quiz
        difficulty="easy"
        question="P(A|B)와 P(B|A)는 항상 같다."
        type="truefalse"
        :answer="1"
        :hints="['P(안경|남학생) = 0.25 였는데 P(남학생|안경) = 0.6 이었죠.']"
        explanation="거짓입니다. 조건의 방향이 다르면 분모(좁히는 세계)가 달라져 전혀 다른 값이 됩니다."
      />
      <Quiz
        difficulty="easy"
        question="검사 전 병일 확률(유병률)처럼, 증거를 보기 전의 믿음을 부르는 이름은?"
        :choices="['사전확률', '사후확률', '위양성률', '민감도']"
        :answer="0"
        explanation="사전확률(prior)입니다. 증거를 반영해 업데이트한 것이 사후확률(posterior)이고요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="학급 표(안경 쓴 학생 10명 중 남학생 6명)에서 P(남학생|안경)은? (소수로 입력)"
        type="numeric"
        :answer="0.6"
        :tolerance="0.001"
        :hints="['안경 쓴 10명으로 세계를 좁힌 뒤 그중 남학생 수.', '6 ÷ 10.']"
        explanation="6/10 = 0.6. P(안경|남학생) = 0.25 와 다르다는 점이 포인트!"
      />
      <Quiz
        difficulty="medium"
        question="두 사건 A, B가 독립이라는 것의 정확한 뜻은?"
        :choices="[
          'B를 알아도 A의 확률이 변하지 않는다: P(A|B) = P(A)',
          'A와 B가 동시에 일어날 수 없다',
          'P(A)와 P(B)가 같다',
          'A가 일어나면 B는 절대 안 일어난다',
        ]"
        :answer="0"
        :hints="['「정보를 들어도 확률이 그대로」가 독립. 「동시에 못 일어남」은 배반사건입니다.']"
        explanation="독립 = 정보가 확률을 안 바꾸는 것(P(A|B)=P(A)). 배반(동시에 불가)과 자주 헷갈리니 주의!"
      />
      <StepQuiz
        difficulty="medium"
        question="유병률 2%인 병, 민감도 90%, 위양성률 9%(건강한 980명 중 88명 잘못 양성)일 때(1000명 기준), 양성일 때 실제 병일 확률을 단계별로 구하세요."
        :steps="[
          { lhs: '1000 \\times 0.02', answer: 20 },
          { lhs: '20 \\times 0.9', answer: 18 },
          { lhs: '18 + 88', answer: 106 },
          { lhs: '18 \\div 106', answer: 0.17, tolerance: 0.005 },
        ]"
        :hints="[
          '병자 수 → 진양성 → 양성 전체 → 나누기 순서.',
          '마지막 단계는 소수 셋째 자리 반올림.',
        ]"
        explanation="병자 20명 중 진양성 18명, 양성 전체 106명 → 18/106 ≈ 0.170. 위양성률(9%)은 그대로 두고 유병률만 1%→2%로 올렸더니 사후확률이 9.2%→17.0%로 올랐죠 — 순수한 사전확률의 힘입니다(검사는 그대로, 사전확률만 두 배)."
      />
      <Quiz
        difficulty="medium"
        question="스팸 예제(스팸 20통 중 '무료' 12통, 정상 80통 중 '무료' 8통)에서 '무료'가 든 메일이 스팸일 확률은? (소수로 입력)"
        type="numeric"
        :answer="0.6"
        :tolerance="0.001"
        :hints="['「무료」가 든 메일 전체 = 12 + 8.', '12 ÷ 20.']"
        explanation="12/(12+8) = 0.6. 단어 하나가 20% → 60% 업데이트를 만들었습니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="유병률이 1%에서 0.1%로 더 낮아지면, 같은 검사(민감도·위양성률 동일)에서 '양성일 때 병일 확률'은 어떻게 되나?"
        :choices="[
          '더 낮아진다 — 위양성이 진양성을 더 크게 압도하므로',
          '더 높아진다 — 병이 희귀할수록 검사가 정확해지므로',
          '변하지 않는다 — 검사 성능이 그대로이므로',
          '정확히 50%가 된다',
        ]"
        :answer="0"
        :hints="['BayesGrid에서 유병률 슬라이더를 왼쪽 끝까지 내려 보세요.', '병자가 1명뿐이면 진양성은 1명도 안 되는데 위양성은 여전히 수십 명.']"
        explanation="사전확률(유병률)이 낮을수록 진양성의 절대 수가 줄어 사후확률은 더 낮아집니다. 검사 성능이 같아도 결과 해석은 유병률에 달려 있어요."
      />
      <Quiz
        difficulty="hard"
        question="본문 검사 예(양성 98명 중 진짜 병자 9명)의 사후확률을 %로 나타내면? (소수 첫째 자리 반올림)"
        type="numeric"
        :answer="9.2"
        :tolerance="0.05"
        :hints="['9 ÷ 98 을 계산한 뒤 100을 곱하세요.']"
        explanation="9/98 = 0.0918... → 9.2%. '90% 정확한 검사'라는 인상과 얼마나 다른지 꼭 기억해 두세요."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch04_bayes.ipynb</code> 에서 1000명 세기를 코드로 재현하고,
      유병률을 바꿔 가며 사후확률 곡선을 그리고, 100만 명 몬테카를로 시뮬레이션으로
      9.2% 를 검증해 볼 수 있어요.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch4')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 4 완료. '정보가 확률을 바꾸는' 규칙을 손에 넣었습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 확률에 <b>숫자를 붙여 계산하는</b> 도구 — 확률변수와 확률분포입니다.
      </p>
      <RouterLink
        to="/ch/ch5"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 확률변수와 확률분포 →
      </RouterLink>
    </div>
  </article>
</template>
