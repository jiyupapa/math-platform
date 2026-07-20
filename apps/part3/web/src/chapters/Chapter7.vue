<script setup lang="ts">
// Phase 7 · 큰 수의 법칙과 중심극한정리 (왜 표본으로 전체를 알 수 있나)
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import CLTSimulator from '@/components/CLTSimulator.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch7')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 7</p>
    <h1 class="mb-4 text-3xl font-bold">큰 수의 법칙과 중심극한정리 🔔</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업 챕터에서 동전을 던질수록 앞면 비율이 0.5 에 다가가는 걸 봤죠. 이번 챕터는 그 현상의
      <b>정식 이름</b>과, 통계학에서 가장 신기한 정리 — <b>"무엇이든 많이 모아 평균 내면 종 모양이
      된다"</b> — 를 배웁니다. 6장에서 "정규분포가 왜 어디에나 나타나나?"라고 했던 질문의 답이
      여기 있어요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>큰 수의 법칙</b> — 시행이 많아질수록 표본평균이 참 평균에 다가감을 이해한다</li>
        <li><b>중심극한정리</b> — 원래 분포가 무엇이든 <b>표본평균의 분포</b>는 종 모양이 됨을 눈으로 확인한다</li>
        <li><b>표준오차</b> <MathBlock inline expr="\sigma/\sqrt{n}" /> — 표본평균이 흔들리는 정도를 계산한다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 큰 수의 법칙 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 그때 그 현상의 이름 — 큰 수의 법칙</h2>
    <ReviewFlag id="ch7-s1" chapter="ch7" label="1. 큰 수의 법칙" />
    <p class="leading-relaxed text-slate-700">
      동전을 10번 던지면 앞면이 3번(30%)이 나오기도, 7번(70%)이 나오기도 합니다. 하지만 1,000번,
      10,000번 던지면? 비율은 거의 어김없이 <b>0.5 근처</b>로 옵니다. 적을 때는 우연이 크게 보이지만,
      많아지면 우연들이 서로 상쇄되면서 <b>참 확률</b>이 드러나는 거예요.
    </p>

    <ConceptCard tone="note" title="새 용어 — 큰 수의 법칙 (Law of Large Numbers)">
      <b>시행 횟수를 늘릴수록, 결과의 평균(표본평균)은 참 평균(기댓값)에 한없이 가까워진다.</b>
      워밍업에서 동전(비율 → 0.5)으로 이미 본 그 현상입니다. 주사위도 마찬가지 —
      많이 굴릴수록 눈의 평균은 5장에서 배운 기댓값 3.5 에 다가갑니다.
      "결국은 실력(참 확률)대로 간다"는 수학의 약속이에요.
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      이 법칙으로 먹고사는 산업이 있습니다. <b>카지노</b>는 손님 한 명에게는 질 수 있지만, 십만 판이
      쌓이면 수익률이 기댓값(카지노가 조금 유리하게 설계된 값)대로 수렴하니 <b>반드시</b> 돈을 법니다.
      <b>보험사</b>도 마찬가지 — 개인의 사고는 예측 불가지만, 가입자 백만 명의 사고율은 거의 정확히
      예측됩니다. <b>한 판은 우연, 십만 판은 필연.</b>
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="동전을 100번 던지면 앞면은 반드시 정확히 50번 나온다."
      type="truefalse"
      :answer="1"
      :hints="['큰 수의 법칙은 「비율이 가까워진다」는 것이지 「딱 맞는다」는 게 아니에요.']"
      explanation="거짓입니다. 47번, 53번처럼 흔들리는 게 정상이에요. 다만 던질수록 '비율'이 0.5 에 가까워질 뿐, 정확히 50번을 보장하지는 않습니다."
    />

    <!-- 2. 표본평균 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 표본평균 — 몇 개 뽑아서 평균 내기</h2>
    <ReviewFlag id="ch7-s2" chapter="ch7" label="2. 표본평균" />
    <p class="leading-relaxed text-slate-700">
      이제 다음 챕터(추정·신뢰구간)까지 이어질 핵심 도구를 정의합니다. 전체 데이터(모집단)에서
      <MathBlock inline expr="n" /> 개를 뽑은 것을 <b>표본</b>, 그 평균을 <b>표본평균</b>이라 해요:
    </p>
    <MathBlock expr="\bar{x} = \dfrac{x_1 + x_2 + \cdots + x_n}{n}" />

    <ConceptCard tone="note" title="새 기호 — 표본평균 x̄">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <MathBlock inline expr="\bar{x}" /> &nbsp;<b>읽는 법</b>: "엑스 바(x-bar)" ·
          <b>뜻</b>: 뽑은 표본 <MathBlock inline expr="n" /> 개의 평균 (1장의 평균과 같은 계산).
        </li>
        <li>
          중요한 관찰: <b>표본평균도 뽑을 때마다 달라집니다.</b> 주사위 5개를 굴려 평균 내면
          어떨 땐 2.8, 어떨 땐 4.2… 즉 <b>표본평균 자체가 우연에 따라 흔들리는 값</b>이에요.
        </li>
      </ul>
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      "표본평균이 흔들린다"는 걸 받아들이면 자연스러운 질문이 나옵니다 —
      <b>그럼 표본평균은 어떤 모양으로 흔들리나?</b> 표본평균을 수천 번 뽑아 히스토그램으로 쌓으면
      그 답이 보입니다. 그리고 그 답이 통계학을 지탱하는 기둥이에요.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="표본 [2, 4, 6, 8] 의 표본평균 x̄ 는?"
      type="numeric"
      :answer="5"
      :hints="['(2 + 4 + 6 + 8) ÷ 4.']"
      explanation="20 ÷ 4 = 5. 계산은 1장의 평균과 똑같아요 — '뽑은 일부'로 계산했다는 점만 다릅니다."
    />

    <!-- 3. 중심극한정리 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 중심극한정리 — 무엇이든 종 모양으로</h2>
    <ReviewFlag id="ch7-s3" chapter="ch7" label="3. 중심극한정리" />
    <p class="leading-relaxed text-slate-700">
      6장의 갈톤 보드를 기억하세요? 공이 핀에 부딪히는 <b>작은 우연들이 여러 번 쌓이니</b> 종 모양이
      나왔죠. 표본평균도 똑같습니다 — 표본 <MathBlock inline expr="n" /> 개를 더해 평균 내는 것 자체가
      "우연을 <MathBlock inline expr="n" /> 번 쌓는 일"이거든요. 그래서 놀라운 일이 벌어집니다:
    </p>

    <ConceptCard tone="note" title="새 용어 — 중심극한정리 (Central Limit Theorem, CLT)">
      원래 데이터의 분포가 <b>무슨 모양이든</b> — 주사위처럼 평평하든, 한쪽으로 찌그러졌든, 봉우리가
      둘이든 — <b>표본평균 <MathBlock inline expr="\bar{x}" /> 의 분포</b>는 표본 크기
      <MathBlock inline expr="n" /> 이 커질수록 <b>정규분포(종 모양)</b>에 가까워진다.
      <p class="mt-2">
        키·측정오차처럼 "작은 우연이 많이 합쳐진 값"이 죄다 종 모양인 이유,
        즉 <b>정규분포가 어디에나 나타나는 이유</b>가 바로 이 정리입니다.
      </p>
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      말로만 들으면 믿기 어려우니 직접 실험해 봅시다. 아래에서 모집단 모양을 골라
      (일부러 종 모양과 거리가 먼 것들만 준비했어요) <b>표본 1000개 뽑기</b>를 눌러 보세요.
      그리고 <MathBlock inline expr="n" /> 을 1 → 5 → 30 으로 키우며 비교해 보세요.
    </p>

    <CLTSimulator />

    <ConceptCard tone="tip" title="관찰 포인트 3가지">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>n = 1</b>: 표본평균 = 데이터 하나. 히스토그램이 모집단 모양을 그대로 닮습니다.</li>
        <li><b>n 을 키우면</b>: 봉우리 둘이던 분포조차 <b>하나의 종 모양</b>으로 모입니다 (빨간 이론 곡선과 비교).</li>
        <li><b>폭</b>: n 이 클수록 히스토그램이 <b>좁아집니다</b> — 표본평균이 덜 흔들린다는 뜻. 다음 절에서 정확히 계산해요.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="중심극한정리에 대한 설명으로 가장 알맞은 것은?"
      :choices="[
        '원래 분포가 정규분포일 때만 표본평균이 종 모양이 된다',
        '원래 분포가 무엇이든, n 이 커지면 표본평균의 분포가 종 모양에 가까워진다',
        '데이터를 많이 모으면 데이터 하나하나가 정규분포로 변한다',
        '표본평균은 항상 모평균과 정확히 같다',
      ]"
      :answer="1"
      :hints="['시뮬레이터에서 봉우리 둘짜리 모집단을 골랐을 때도 종 모양이 나왔죠.']"
      explanation="원래 모양과 상관없이 '표본평균의 분포'가 종 모양이 되는 것이 핵심입니다. 데이터 자체가 변하는 게 아니에요."
    />

    <!-- 4. 표준오차 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 표준오차 — 표본평균은 얼마나 흔들리나</h2>
    <ReviewFlag id="ch7-s4" chapter="ch7" label="4. 표준오차 σ/√n" />
    <p class="leading-relaxed text-slate-700">
      시뮬레이터에서 <MathBlock inline expr="n" /> 이 클수록 히스토그램 폭이 좁아졌죠. 그 폭 —
      표본평균의 표준편차 — 에는 따로 이름이 있고, 공식도 아주 짧습니다:
    </p>
    <MathBlock expr="SE = \dfrac{\sigma}{\sqrt{n}}" />

    <ConceptCard tone="note" title="새 용어 — 표준오차 (Standard Error, SE)">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <b>이름</b>: 표준오차 · <b>읽는 법</b>: "시그마 나누기 루트 엔" ·
          <b>뜻</b>: <b>표본평균 <MathBlock inline expr="\bar{x}" /> 가 흔들리는 정도</b>
          (데이터 하나하나의 표준편차 <MathBlock inline expr="\sigma" /> 와 구분!).
        </li>
        <li>
          분모가 <MathBlock inline expr="\sqrt{n}" /> 인 게 포인트 —
          <b>n 을 4배</b>로 늘리면 <MathBlock inline expr="\sqrt{4}=2" /> 라서 오차는 <b>절반</b>,
          n 을 100배로 늘려도 오차는 1/10 밖에 안 줄어요. "데이터를 늘릴수록 정확해지지만,
          효과는 점점 완만해진다"는 뜻입니다.
        </li>
      </ul>
    </ConceptCard>

    <StepQuiz
      difficulty="medium"
      question="σ=10 인 모집단이 있습니다. ① n=25 일 때 표본평균의 표준오차, ② n=100 으로 늘렸을 때의 표준오차를 단계별로 구하세요."
      :steps="[
        { lhs: '\\sqrt{25}', answer: 5 },
        { lhs: '10 \\div 5', answer: 2 },
        { lhs: '\\sqrt{100}', answer: 10 },
        { lhs: '10 \\div 10', answer: 1 },
      ]"
      :hints="['SE = σ ÷ √n. 먼저 √n 부터 구하세요.', 'n 이 25 → 100 으로 4배가 되면 SE 는 절반이 됩니다.']"
      explanation="n=25 이면 SE=2, n=100 이면 SE=1. 표본을 4배로 늘렸더니 흔들림이 딱 절반이 됐죠 — √n 의 효과입니다."
    />

    <!-- 5. 혼동 주의 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 헷갈리기 쉬운 두 분포</h2>
    <ReviewFlag id="ch7-s5" chapter="ch7" label="5. 데이터의 분포 vs 표본평균의 분포" />

    <ConceptCard tone="warn" title="'데이터의 분포'와 '표본평균의 분포'는 다릅니다">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>데이터 하나하나의 분포</b>: 원래 모양 그대로. 아무리 많이 모아도 주사위는 평평하고,
          연봉 분포는 여전히 오른쪽 꼬리입니다. <b>CLT 가 데이터를 종 모양으로 바꿔주는 게 아니에요.</b>
        </li>
        <li>
          <b>표본평균의 분포</b>: 평균이라는 '요약값'을 여러 번 뽑았을 때의 분포.
          <b>이것만</b> n 이 커지면 종 모양이 됩니다 (중심은 모평균, 폭은 <MathBlock inline expr="\sigma/\sqrt{n}" />).
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="주사위 눈금 데이터를 100만 개 모으면, 눈금(1~6) 자체의 히스토그램이 종 모양이 된다."
      type="truefalse"
      :answer="1"
      :hints="['종 모양이 되는 건 「표본평균」의 분포예요.']"
      explanation="거짓입니다. 데이터 자체는 여전히 1~6 이 균등하게(평평하게) 나와요. 종 모양이 되는 것은 '여러 개 뽑아 평균 낸 값'들의 분포입니다."
    />

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 미니배치 — AI 학습이 '일부만 보고도' 되는 이유</h2>
    <ReviewFlag id="ch7-ai" chapter="ch7" label="🤖 미니배치 SGD 와 큰 수의 법칙" />
    <p class="leading-relaxed text-slate-700">
      2부(미분)에서 경사하강법은 <b>손실의 기울기</b>를 따라 내려간다고 배웠습니다. 그런데 정확한
      기울기를 구하려면 <b>전체 데이터</b>(수억 장의 이미지, 수조 개의 문장)의 평균 기울기가 필요해요.
      매 걸음마다 그걸 다 계산하는 건 불가능합니다. 실제 AI 는 어떻게 할까요?
    </p>

    <ConceptCard tone="ai" title="확률적 경사하강법(SGD) = 표본평균으로 대신하기">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          전체 대신 <b>미니배치</b>(예: 무작위 32개)만 뽑아 기울기의 <b>표본평균</b>을 계산합니다 —
          미니배치가 곧 이 챕터의 <b>표본</b>이에요.
        </li>
        <li>
          <b>큰 수의 법칙</b> 덕분에 배치 평균 기울기는 전체 평균 기울기에 충분히 가깝고(다만 정확히
          같지는 않아 조금씩 흔들리며 내려갑니다), 흔들리는 정도가 대략
          <MathBlock inline expr="\sigma/\sqrt{n}" /> 이라 <b>배치를 키우면 더 안정</b>됩니다.
        </li>
        <li>
          "데이터가 많을수록 AI 가 좋아진다"의 통계적 근거도 같은 원리 — 표본이 클수록
          추정(학습)의 오차가 <MathBlock inline expr="1/\sqrt{n}" /> 꼴로 줄어듭니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="SGD 에서 미니배치의 평균 기울기를 쓰는 것이 통하는 이유와 가장 관련 깊은 것은?"
      :choices="['피타고라스 정리', '큰 수의 법칙 (표본평균이 참 평균을 근사)', '원주율의 무리수성', '미분의 연쇄법칙']"
      :answer="1"
      :hints="['배치 = 표본, 배치 평균 기울기 = 표본평균.']"
      explanation="무작위로 뽑은 배치의 평균 기울기는 전체 평균 기울기의 표본평균이라서, 큰 수의 법칙 덕에 좋은 근사가 됩니다."
    />

    <!-- 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">6. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="큰 수의 법칙과 중심극한정리 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="동전을 던지는 횟수를 늘릴수록 앞면의 '비율'은 1/2 에 가까워지는 경향이 있다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 이것이 큰 수의 법칙이에요. (정확히 절반이 '보장'되는 건 아니고, 비율이 가까워집니다.)"
      />
      <Quiz
        difficulty="easy"
        question="큰 수의 법칙(LLN)의 내용으로 가장 알맞은 것은?"
        :choices="[
          '시행을 많이 할수록 표본평균이 참 평균(기댓값)에 다가간다',
          '시행을 많이 하면 반드시 이득을 본다',
          '표본이 크면 원래 데이터가 정규분포로 변한다',
          '큰 수는 작은 수보다 자주 나온다',
        ]"
        :answer="0"
        :hints="['동전 비율 → 0.5, 주사위 평균 → 3.5.']"
        explanation="시행(표본)이 많아질수록 평균이 기댓값으로 수렴한다는 법칙입니다."
      />
      <Quiz
        difficulty="easy"
        question="σ=6 인 모집단에서 n=9 표본평균의 표준오차 σ/√n 은?"
        type="numeric"
        :answer="2"
        :hints="['√9 = 3.', '6 ÷ 3.']"
        explanation="SE = 6 ÷ √9 = 6 ÷ 3 = 2."
      />
      <Quiz
        difficulty="easy"
        question="중심극한정리는 원래 분포가 종 모양(정규분포)일 때만 성립한다."
        type="truefalse"
        :answer="1"
        :hints="['시뮬레이터에서 평평한 주사위, 봉우리 둘 분포로도 실험해 봤죠.']"
        explanation="거짓입니다. 원래 분포가 '무엇이든' 표본평균의 분포는 종 모양에 가까워지는 것이 CLT 의 놀라운 점이에요."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="σ=12 인 모집단에서 n=16 일 때와 n=36 일 때, 표본평균의 표준오차를 각각 단계별로 구하세요."
        :steps="[
          { lhs: '\\sqrt{16}', answer: 4 },
          { lhs: '12 \\div 4', answer: 3 },
          { lhs: '\\sqrt{36}', answer: 6 },
          { lhs: '12 \\div 6', answer: 2 },
        ]"
        :hints="['SE = σ ÷ √n.', '√16 = 4, √36 = 6.']"
        explanation="n=16 → SE=3, n=36 → SE=2. n 이 커질수록 표본평균의 흔들림이 줄어듭니다."
      />
      <Quiz
        difficulty="medium"
        question="표본 크기 n 을 4배로 늘리면 표준오차는 어떻게 되나요?"
        :choices="['4배가 된다', '절반이 된다', '1/4 이 된다', '변하지 않는다']"
        :answer="1"
        :hints="['분모가 √n 이에요. √4 = 2.']"
        explanation="SE = σ/√n 에서 n 이 4배면 분모가 2배 → SE 는 절반. 오차를 절반으로 줄이려면 데이터가 4배 필요하다는 뜻이기도 해요."
      />
      <Quiz
        difficulty="medium"
        question="주사위 한 개의 기댓값은 3.5 입니다. 주사위를 수만 번 굴려 나온 눈들의 평균은 대략 어떤 값에 가까워질까요?"
        type="numeric"
        :answer="3.5"
        :tolerance="0.01"
        :hints="['큰 수의 법칙: 표본평균 → 기댓값.']"
        explanation="큰 수의 법칙에 따라 3.5 에 수렴합니다."
      />
      <Quiz
        difficulty="medium"
        question="'원래 분포가 무엇이든, 표본평균의 분포는 n 이 커지면 종 모양에 가까워진다' — 이 정리의 이름은?"
        :choices="['큰 수의 법칙', '중심극한정리', '베이즈 정리', '최소제곱법']"
        :answer="1"
        :hints="['Central Limit Theorem, 줄여서 CLT.']"
        explanation="중심극한정리(CLT)입니다. 큰 수의 법칙은 '평균이 어디로 가나'(위치), CLT 는 '평균이 어떤 모양으로 흔들리나'(분포)를 알려줘요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="σ=8, n=16 이면 표준오차는 2 입니다. 표준오차를 1 로 줄이려면 n 을 얼마로 늘려야 할까요?"
        type="numeric"
        :answer="64"
        :hints="['오차를 절반으로 → n 은 4배.', '16 × 4.']"
        explanation="SE 를 절반(2→1)으로 만들려면 √n 이 2배가 되어야 하므로 n 은 4배인 64. 8 ÷ √64 = 8 ÷ 8 = 1 로 확인됩니다."
      />
      <Quiz
        difficulty="hard"
        question="SGD 에서 미니배치의 평균 기울기는 전체 데이터의 평균 기울기와 항상 정확히 일치한다."
        type="truefalse"
        :answer="1"
        :hints="['표본평균은 뽑을 때마다 흔들리는 값이었죠.']"
        explanation="거짓입니다. 배치 평균은 표본평균이라 조금씩 흔들려요(그래서 '확률적' 경사하강법). 다만 큰 수의 법칙 덕에 충분히 가까워서 학습이 됩니다."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch07_lln_clt.ipynb</code> 에서 동전 10,000번의 수렴 그래프를 직접 그리고,
      주사위·찌그러진 분포의 표본평균 히스토그램이 n=1 → 30 으로 갈수록 종 모양이 되는 것,
      그리고 실측 표준오차가 이론값 σ/√n 과 일치하는 것을 확인할 수 있어요.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch7')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">
        Phase 7 완료. '왜 일부만 보고도 전체를 알 수 있는지'의 수학적 근거를 손에 넣었습니다.
      </p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 이 도구로 실제 추측을 하는 <b>추정과 신뢰구간</b>입니다 — 여론조사의 ±3.1%p 가 여기서 나와요.
      </p>
      <RouterLink
        to="/ch/ch8"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 표본으로 전체 알기: 추정과 신뢰구간 →
      </RouterLink>
    </div>
  </article>
</template>
