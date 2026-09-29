<script setup lang="ts">
// 5장 — 창발일까 착시일까: "능력이 갑자기 튀어나온다"는 주장을 지표 분해로 검증한다.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import EmergenceLab from '@/components/EmergenceLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch5')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">5장 · 성장의 법칙</p>
    <h1 class="mb-4 text-3xl font-bold">창발일까 착시일까</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      성장 이야기(2~4장)는 온통 <b>매끈한 직선</b>이었습니다. 그런데 뉴스는 정반대를
      말하죠. <i>"일정 규모를 넘자 갑자기 산수를 하기 시작했다!"</i> 매끈한 법칙과
      갑작스러운 <b>창발</b>(emergence), 둘 중 하나는 이상합니다. 이 장에서는 그 유명한
      논쟁을 실험대에 올립니다. 스포일러: 범인 후보에 <b>지표</b>가 있습니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      밑바탕 실력이 <b>매끈하게</b> 좋아지는 모델을 두고도, 지표(안경)에 따라 그래프가
      <b>계단(창발처럼) ↔ 완만 ↔ 직선</b>으로 달리 보이는 것을 직접 재현합니다.
      그리고 "급변 주장 검증 3단계" 습관을 가져갑니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 갑자기 산수를 하기 시작했다?</h2>
    <ReviewFlag id="ch5-s1" chapter="ch5" label="1. 무대: 갑자기 산수를 하기 시작했다?" />
    <p class="leading-relaxed text-slate-700">
      실험 설계는 워밍업의 "신의 시점" 그대로입니다. 8자리 덧셈 과제에서, 모델이 답의
      <b>각 자리를 맞힐 확률 p</b>가 모델 크기에 따라 <b>매끈한 멱법칙</b>(자리당 오차가
      3장의 직선, 기울기 −0.3)으로 좋아진다고 <b>우리가 정해 둡니다</b>. 급변은 어디에도
      없어요. 그런데 채점 방식이 하나 얹힙니다: <b>8자리가 전부 맞아야 정답.</b>
      이제 그래프가 어떻게 보이는지 직접 확인해 보세요.
    </p>

    <EmergenceLab />

    <ConceptCard tone="tip" title="핵심 관찰: 지표가 계단을 만들 수 있다">
      전부-정답 지표로는 10⁹까지 15%도 안 되다가 10¹⁰에서 40%, 10¹²에서 80%.
      영락없는 "창발"입니다. 그런데 밑바탕(자리당 정답률)은 15% → 97%로 <b>내내 매끈하게</b>
      좋아지고 있었죠. 수학은 단순합니다: 전부-정답 확률은 <b>p⁸</b>이라, p가 낮을 땐 8제곱이
      바닥에 눌려 있다가(0.57⁸ ≈ 1%), p가 1에 다가서면 급히 풀려납니다(0.89⁸ ≈ 40%).
      <b>같은 모델, 같은 개선, 다른 안경.</b> 이것이 "창발은 지표의 신기루일 수 있다"는
      착시론의 핵심 논증입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="실험에서 전부-정답(exact match) 곡선이 계단처럼 보인 근본 이유는?"
      :choices="['정답 확률이 p⁸이라서, 매끈한 p도 여덟제곱하면 낮은 구간은 눌리고 높은 구간에서 급히 풀려나서', '모델이 10¹⁰에서 실제로 각성해서', '데이터가 부족해서', '그래프를 잘못 그려서']"
      :answer="0"
      :hints="['0.57⁸과 0.89⁸을 비교해 보세요. 밑은 1.6배인데 결과는 몇 배인가요?']"
      explanation="0.57⁸≈1.2%, 0.89⁸≈40%로 33배 차이입니다. 거듭제곱이 완만한 개선을 계단으로 바꿔 놓은 것이지, 밑바탕 p에는 어떤 급변도 없었어요(우리가 매끈하게 정해 뒀으니까요!)."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 이름표 달기: 논쟁의 언어</h2>
    <ReviewFlag id="ch5-s2" chapter="ch5" label="2. 이름표 달기: 논쟁의 언어" />

    <ConceptCard tone="note" title="새 용어: 창발 / 비선형 지표 / 부분 점수">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>창발</b> (emergent abilities). 비유: <b>착시 계단</b>(이 장의
          검증 대상). 뜻: 작은 모델엔 없다가 규모를 넘기면 <b>갑자기</b> 나타나는 것처럼
          보이는 능력. 예측 불가능성 때문에 기대와 공포를 동시에 모은 주장입니다.
        </li>
        <li>
          <b>비선형 지표</b> (nonlinear metric). 뜻: 밑바탕 실력의 개선을 <b>비례로 반영하지 않는</b> 채점 방식(전부-정답(p⁸),
          통과/탈락 같은 것). 매끈한 개선을 계단으로 보이게 만들 수 있는 안경입니다.
        </li>
        <li>
          <b>부분 점수</b> (partial credit). 뜻: 자리당 정답률·편집 거리·로그 확률처럼 개선을 <b>연속적으로</b> 반영하는 지표.
          착시를 걷어내는 두 번째 안경. 5부 7장의 퍼플렉시티가 대표적인 매끈한 자입니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="자리당 정답률 p = 0.9인 모델이 8자리 전부-정답 지표에서 받을 점수는 약 얼마인가? (0.9⁸)"
      type="numeric"
      :answer="0.43"
      :tolerance="0.02"
      :hints="['0.9를 여덟 번 곱합니다. 0.9² = 0.81, 0.81² ≈ 0.656, 0.656² ≈ 0.43.']"
      explanation="0.9⁸ ≈ 0.43, 곧 자리당 90%짜리 실력이 '43점짜리 모델'로 보입니다. 지표가 실력을 얼마나 다르게 비출 수 있는지의 산수예요."
    />

    <DetailsCard title="➕ 더 깊이: 착시론이 창발을 전부 부정하는 건 아니다">
      이 논쟁(2023~)의 정직한 현재 상태: 착시론은 <b>"보고된 창발 다수가 지표를 매끈한
      것으로 바꾸면 사라진다"</b>는 것을 보였고, 이는 강력한 경고입니다. 하지만 <b>모든</b>
      급변이 지표 탓이라는 증명은 아니에요. 매끈한 지표로 다시 재도 꺾임이 남는 사례가
      있는지는 지금도 연구가 이어지는 열린 문제입니다. 그래서 결론은 부정도 맹신도 아닌
      <b>절차</b>입니다: 급변 주장을 보면 ① y축이 전부-정답형(비선형)인지 확인 ② 부분
      점수로 다시 그리기 ③ 로그-로그 오차로 밑바탕 확인. 셋 다 꺾여야 진짜 급변.
      덤 하나: p⁸의 8이 커질수록(답이 길수록) 계단이 <b>더 늦게, 더 가파르게</b> 나타납니다.
      "어려운 과제일수록 창발 시점이 늦다"는 관측과 정확히 맞물리는 예측이죠.
    </DetailsCard>

    <ReviewFlag id="ch5-ai" chapter="ch5" label="🤖 AI 연결: '갑자기 각성했다'는 기사를 읽는 법" />
    <ConceptCard tone="ai" title="🤖 AI 연결: '갑자기 각성했다'는 기사를 읽는 법">
      "규모 X를 넘자 능력이 깨어났다"는 발표는 캡스톤(10장)에서 팩트체크할 단골 문장입니다.
      이제 여러분의 체크리스트: 그 그래프의 y축이 exact match인가? 부분 점수·로그 확률로
      다시 그린 그림도 있는가? 지표 선택이 이야기를 바꾼다는 감각은
      <b><PartLink :part="5" ch="ch7">5부 7장</PartLink></b>(같은 모델도 재는 자에 따라
      다르게 보인다)에서, 확률의 거듭제곱이 만드는 극단은
      <b><PartLink :part="3" ch="ch3">3부 3장</PartLink></b>(독립 사건의 곱)에서 쌓은
      기초 그대로예요. 성장의 법칙 1막은 여기까지입니다. 다음 장부터 2막, <b>시험의 통계</b>로
      넘어가 워밍업의 소음을 정식으로 계산합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="창발일까 착시일까: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="'창발'(emergent abilities) 주장의 뜻은?"
        :choices="['일정 규모를 넘으면 능력이 갑자기 나타나는 것처럼 보인다는 관측', '모델이 클수록 항상 나쁘다', '데이터가 많으면 손실이 0이 된다', '지표는 하나만 쓰면 된다']"
        :answer="0"
        explanation="'갑자기'가 핵심입니다. 매끈한 스케일링 법칙과 충돌하는 것처럼 보여서 논쟁이 됐죠."
      />
      <Quiz
        difficulty="easy"
        question="실험에서 밑바탕 실력(자리당 정답률 p)은 규모에 따라 어떻게 변하도록 설계되어 있었나?"
        :choices="['매끈한 멱법칙으로 꾸준히(15% → 97%), 급변 없음', '10¹⁰에서 갑자기 점프', '변하지 않음', '무작위로 출렁임']"
        :answer="0"
        explanation="신의 시점 설계예요. 자리당 오차가 기울기 −0.3의 매끈한 멱법칙(3장의 직선)이었습니다. 그런데도 전부-정답 지표는 계단을 그렸죠."
      />
      <Quiz
        difficulty="easy"
        question="같은 모델·같은 개선이라도 지표(채점 방식)를 바꾸면 성장 곡선의 모양이 달라질 수 있다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 이 장의 전부예요. 전부-정답은 계단, 자리당 정답률은 완만, 로그-로그 오차는 직선이었어요."
      />
      <Quiz
        difficulty="easy"
        question="8자리 전부-정답 확률을 자리당 정답률 p로 쓰면?"
        :choices="['p⁸ (여덟 자리가 독립이라 가정하면 곱)', '8·p', 'p + 8', 'p ÷ 8']"
        :answer="0"
        explanation="자리마다 독립적으로 맞힌다고 하면 전부 맞을 확률은 p×p×…×p = p⁸. 3부 3장의 독립 사건 곱셈 규칙입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="p가 0.57에서 0.89로 1.6배 좋아질 때 전부-정답 p⁸은 약 1.2% → 40%로 33배 뛰었다. 이 현상의 올바른 이름은?"
        :choices="['비선형 지표의 증폭: 거듭제곱이 완만한 개선을 급변처럼 보이게 한다', '모델의 각성', '측정 오류', '데이터 오염']"
        :answer="0"
        explanation="p⁸은 p에 대해 극도로 비선형입니다. 낮은 p를 바닥에 누르고 높은 p에서 폭발시켜요. 계단의 제조법이죠."
      />
      <Quiz
        difficulty="medium"
        question="착시를 걷어내는 '두 번째 안경'으로 알맞은 지표는?"
        :choices="['부분 점수(자리당 정답률·편집 거리·로그 확률)처럼 개선을 연속적으로 반영하는 지표', '통과/탈락 이진 판정', '전부-정답을 더 엄격하게 만든 지표', '점수를 반올림한 지표']"
        :answer="0"
        explanation="연속(매끈한) 지표는 밑바탕의 개선을 비례로 보여줍니다. 5부 7장의 퍼플렉시티가 대표적인 매끈한 자."
      />
      <Quiz
        difficulty="medium"
        question="답이 8자리가 아니라 16자리인 과제라면(전부-정답 = p¹⁶), 계단은 어떻게 변하나?"
        :choices="['더 늦게(더 큰 규모에서), 더 가파르게 나타난다', '더 일찍, 더 완만하게 나타난다', '변하지 않는다', '계단이 사라진다']"
        :answer="0"
        :hints="['거듭제곱 지수가 클수록 낮은 p는 더 눌리고, 풀려나는 문턱은 더 높아집니다.']"
        explanation="p¹⁶은 p⁸보다 더 오래 바닥에 붙어 있다가 더 급히 풀려납니다. '어려운(긴) 과제일수록 창발이 늦다'는 관측을 지표만으로 설명하는 예측이에요."
      />
      <Quiz
        difficulty="medium"
        question="급변 주장 검증 3단계의 올바른 순서는?"
        :choices="['① y축이 전부-정답형(비선형)인지 확인 → ② 부분 점수로 다시 그리기 → ③ 로그-로그 오차로 밑바탕 확인', '① 기사 제목 확인 → ② 댓글 확인 → ③ 공유', '① 모델 크기 확인 → ② 회사 이름 확인 → ③ 발표일 확인', '순서는 상관없고 하나만 하면 된다']"
        :answer="0"
        explanation="셋 다 꺾여 있어야 진짜 급변입니다. 하나라도 매끈하면 계단은 지표의 작품일 가능성이 커요. 캡스톤 체크리스트에 그대로 들어갑니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="착시론의 결론으로 가장 정직한 것은?"
        :choices="['보고된 창발 다수가 지표 교체로 사라진다는 강력한 경고. 단, 모든 급변이 지표 탓이라는 증명은 아니며 열린 문제로 남아 있다', '창발은 100% 존재하지 않는다', '창발은 100% 존재한다', '지표는 성장 곡선과 무관하다']"
        :answer="0"
        explanation="부정도 맹신도 아닌 절차가 결론입니다. 매끈한 지표로 다시 재도 꺾임이 남는지 확인하는 것. 과학 논쟁의 정직한 현재형이에요."
      />
      <Quiz
        difficulty="hard"
        question="어느 발표: '우리 모델은 10¹¹ 파라미터를 넘는 순간 법률 문서 요약 능력이 창발했다(통과/탈락 채점 기준 3% → 61%)'. 이 장의 눈으로 가장 먼저 물을 것은?"
        :choices="['통과/탈락(비선형 지표) 대신 부분 점수·로그 확률로 다시 그리면 그 구간이 여전히 꺾여 있는가', '법률 문서가 몇 페이지인가', '모델 이름이 멋진가', '발표 자료의 색상이 적절한가']"
        :answer="0"
        :hints="['통과/탈락은 전부-정답의 사촌, 이 장의 계단 제조기입니다.']"
        explanation="통과/탈락은 대표적인 비선형 지표입니다. 매끈한 안경으로 다시 그린 그림을 요구하는 것이 이 장이 준 질문이고, 답이 없다면 창발 주장은 보류입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch5')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">5장 완료! 성장의 법칙 1막이 끝났습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 2막 시험의 통계, 그 첫 장인 6장 시험의 오차범위입니다. 워밍업에서 만난 소음을 드디어
        공식으로 계산합니다(±1.96√(p(1−p)/n), 3부 8장의 신뢰구간을 다시 씁니다).
      </p>
      <RouterLink
        to="/ch/ch6"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        6장: 시험의 오차범위 →
      </RouterLink>
    </div>
  </article>
</template>
