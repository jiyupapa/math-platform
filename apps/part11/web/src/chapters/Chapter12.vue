<script setup lang="ts">
// 12장 — 🎯 캡스톤: 이 에이전트, 도입해도 되나. 새 개념 없이 워밍업~11장 총조립 — 11부 졸업 시험.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import CapstoneAgentLab from '@/components/CapstoneAgentLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch12')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 12 · 🎯 캡스톤</p>
    <h1 class="mb-4 text-3xl font-bold">이 에이전트, 도입해도 되나</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      졸업 시험입니다 — <b>새 개념은 없습니다.</b> 워밍업의 그 질문("AI에게 일을 맡겨도
      되나")으로 돌아가죠. 이번엔 진짜(같은 가상의) 도입 제안서가 통째로 회의 안건에
      올라왔습니다. 각 단계 정확도, 데모 성공률, pass@5, 자체 검수까지. 11부에서 모은
      도구 전부를 꺼내 이 제안을 <b>감정</b>하고, 도입 여부의 결론을 스스로 내립니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표 — 졸업 기준">
      제안서를 읽고 ① "각 단계 98%"를 <b>사슬 성공률로 환산</b>하고 ② 데모 성공률을
      <b>오차범위</b>로 판정하고 ③ pass@5를 <b>pass@1로 역산</b>하고 ④ "자체 검수"를
      <b>베이즈로 감정</b>해서 — <b>최종 판정서</b>를 쓸 수 있으면 졸업입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 감정 실습 — 검산대 4곳</h2>
    <ReviewFlag id="ch12-s1" chapter="ch12" label="1. 감정 실습 — 검산대 4곳" />
    <p class="leading-relaxed text-slate-700">
      제안서 속 밑줄 친 주장 4개를 각각의 검산대에서 감정합니다. 다이얼을 직접 돌려
      숫자가 어떻게 달라지는지 보세요 — 어느 주장이 통과하고, 어느 주장이 걸릴까요?
    </p>

    <CapstoneAgentLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 제안서는 거짓말 없이도 오해를 판다">
      주목할 점: 이 제안서에 <b>수치 조작은 하나도 없습니다.</b> 걸음 98%도, 데모 18/20도,
      pass@5 97%도 실제 값이에요. 문제는 <b>감춘 것</b> — "어떤 업무든"은 <b>단계 수</b>를,
      "90%"는 <b>표본 크기</b>를, "pass@5 97%"는 <b>한 번에 맞을 확률과 비용</b>을,
      "이중 확인"은 <b>업무 난이도와 검수자 독립성</b>을 감췄죠. 그래서 도입 판단의 질문은
      "숫자가 맞나"가 아니라 <b>"숫자가 그 결론을 지지하나"</b>입니다. 그 차이를 아는 것이
      11부가 기른 눈이에요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <StepQuiz
      question="검산대 ②의 오차범위 검산 — 20건 데모 90%의 냅킨 공식 ± = 98/√20 와 구간 하한을 단계별로."
      :steps="[
        { lhs: '\\sqrt{20} = ?', answer: 4.47, tolerance: 0.02 },
        { lhs: '98 \\div 4.47 = ?', answer: 21.9, tolerance: 0.2 },
        { lhs: '\\text{하한} = 90 - 21.9 = ?\\ \\%', answer: 68.1, tolerance: 0.2 },
      ]"
      explanation="±21.9%p → 하한 68.1%. 90% 데모의 구간 [68.1, 100+]는 70%짜리 에이전트와도 겹칩니다 — 20건으로는 성능을 단정할 수 없어요. 200건이면 ±6.9%p로 좁아집니다(11장)."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 졸업 체크리스트 — 지갑에 넣어 가세요</h2>
    <ReviewFlag id="ch12-s2" chapter="ch12" label="2. 졸업 체크리스트 — 지갑에 넣어 가세요" />

    <ConceptCard tone="note" title="에이전트 도입 감정 카드 (11부 요약)">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li><b>단계 수로 환산</b> — "걸음 정확도"를 업무 성공률로: p^n, 병목 단계 확인 — 워밍업·2장.</li>
        <li><b>되살리는 길이 있나</b> — 재시도(4장)·다수결(5장)·검수(6장)가 붙어 있나, 각각의 전제(성공 판별·독립·상관)는 충족되나.</li>
        <li><b>성적표의 ±</b> — 데모 몇 건인가? 냅킨 98/√n으로 오차범위 → 겹치면 판단 보류 — 11장.</li>
        <li><b>pass@k 해석</b> — pass@1로 역산(한 번에 맞을 확률), 골라낼 수단과 비용(k배)이 있나 — 4·11장.</li>
        <li><b>검수의 실체</b> — "통과"의 신뢰도는 기저율에 달림(베이즈), 검수자는 작성자와 독립인가 — 6·9장.</li>
        <li><b>공통</b> — 생각의 길이·비용(7장), 탐색·컨텍스트 예산(8·10장), "숫자가 결론을 지지하는가"를 물을 것.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="이 제안서의 네 주장 중 '조작'이 있었던 것은?"
      :choices="['없다 — 수치는 전부 진짜이고, 문제는 단계 수·표본·전제를 감춘 해석이다', '① 각 단계 98%', '③ pass@5 97%', '④ 자체 검수']"
      :answer="0"
      explanation="측정값 자체는 진짜였습니다 — 사슬 길이, 표본 크기, pass@1과 비용, 검수 전제를 감춘 것이 문제죠. '숫자가 결론을 지지하나'가 도입 판단의 진짜 질문입니다."
    />

    <DetailsCard title="➕ 더 깊이: 판정서를 실무 언어로 옮기면">
      회의에서 이 감정 결과를 보고한다면 이렇게 됩니다 — <i>"일손 2의 단계 정확도 98%는
      우리 대표 업무(평균 12단계)에서 78.5% 성공률에 해당해, '어떤 업무든'이라는 표현은
      과장입니다. 20건 데모의 90%는 오차범위 ±21.9%p로 70%짜리와 구별되지 않습니다.
      pass@5 97%는 한 번에 맞을 확률이 50%대라는 뜻이고, 이를 활용하려면 성공을 판별할
      수단과 5배 비용이 필요합니다. 자체 검수의 신뢰도는 업무 난이도에 따라 19~95%로
      갈리며 검수자 독립성이 확인되지 않았습니다. 도입 조건: 테스트 가능한 업무부터 200건
      시범, 독립 검수 설계, 단계별 성공률 로깅."</i> — 숫자에 근거해 정중하고 단호한,
      11부가 목표로 한 바로 그 문장들입니다.
    </DetailsCard>

    <ReviewFlag id="ch12-ai" chapter="ch12" label="🤖 AI 연결 — 이 눈은 시리즈 전체의 완성이다" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 이 눈은 시리즈 전체의 완성이다">
      11부의 도입 판정은 시리즈 전체 위에 서 있습니다 — 이 판정은
      <b><PartLink :part="10" ch="ch10">10부 10장</PartLink></b>(AI 뉴스 팩트체크)의
      속편이고, 검수의 베이즈는
      <b><PartLink :part="3" ch="ch4">3부 4장</PartLink></b>(조건부 확률)에서 쌓은 기초
      그대로예요. 그리고 시리즈의 질문 사슬이 여기서 완성됩니다 — 6부 "무엇을 배우게 할까" ·
      8부 "어떻게 잘" · 9부 "무엇으로 담나" · 10부 "얼마나 키우고, 정말 좋아졌나" ·
      <b>11부 "이제 일을 맡겨도 되나"</b>. 이제 에이전트 제품 광고가 떠도 두렵지 않을
      겁니다 — 계산할 수 있으니까요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 졸업 시험 — 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 11부가 완결됩니다. 전 챕터의 도구가 골고루 나옵니다.
    </p>

    <QuizSet title="🎯 캡스톤 — 이 에이전트, 도입해도 되나 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="각 단계 98%인 에이전트에게 12단계 업무를 맡기면 성공률은 약 몇 %인가? (정수)"
        type="numeric"
        :answer="79"
        :hints="['0.98을 12번 곱하면 0.785…']"
        explanation="0.98¹² ≈ 78.5% → 약 79%. 걸음 98%도 12단계면 5건 중 1건 이상 실패 — '어떤 업무든'이 과장인 이유입니다."
      />
      <Quiz
        difficulty="easy"
        question="'각 단계 98%, 어떤 업무든 믿고 맡기세요'가 과장인 근본 이유는?"
        :choices="['단계 수가 늘수록 성공률이 곱으로 깎이는데, 그 단계 수를 감췄다', '98%는 100%가 아니라서', '에이전트는 원래 못 믿어서', '광고는 다 거짓이라서']"
        :answer="0"
        explanation="워밍업·2장의 사슬 곱셈 그대로 — p^n. 걸음 정확도만 보여주고 업무의 단계 수를 감추면, 실제 성공률(12단계 78.5%)이 가려집니다."
      />
      <Quiz
        difficulty="easy"
        question="pass@5 = 97%는 '한 번 시켜서 97% 성공'을 뜻한다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. pass@5는 5번 시도해 한 번이라도 성공할 확률 — 한 번에 맞을 확률(pass@1)로 역산하면 50.4%뿐입니다."
      />
      <Quiz
        difficulty="easy"
        question="20건 데모 90% 성공만으로 성능을 단정할 수 없는 이유는?"
        :choices="['표본이 작아 오차범위가 ±21.9%p로 커서, 70%짜리 에이전트와도 구간이 겹친다', '90%가 낮은 점수라서', '20건이 너무 많아서', '데모는 항상 조작이라서']"
        :answer="0"
        explanation="11장의 냅킨 98/√20 ≈ ±21.9%p — 구간 [68.1, 100+]는 70%와 겹칩니다. 도입 판단엔 최소 200건(±6.9%p)이 필요해요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="pass@5 = 97%(pass@1 ≈ 50%)를 실제 업무에 활용하려면 필요한 두 전제는?"
        :choices="['5개 시도 중 성공을 골라낼 판별 수단(테스트·정답 대조) + 5배의 비용을 감당할 여력', '더 큰 GPU + 더 긴 프롬프트', '검수자를 없애기 + 단계 수 늘리기', '전제 없이 그대로 97%가 나온다']"
        :answer="0"
        explanation="4장의 대전제 그대로 — 다시 뽑기는 성공을 알아볼 수 있을 때만 작동하고(6장 검수), 뽑는 만큼 비용이 곱으로 듭니다(7장). 판별 수단이 없으면 pass@5는 종이 위 숫자예요."
      />
      <Quiz
        difficulty="medium"
        question="'자체 검수 통과' 도장의 신뢰도가 업무마다 19%~95%로 갈리는 이유는?"
        :choices="['통과 시 정답일 확률(사후확률)이 업무의 기저율(난이도)에 달려서 — 6장 베이즈', '검수 AI의 기분에 따라서', '검수 횟수가 달라서', '난이도와 신뢰도는 무관한데 우연히 갈린 것']"
        :answer="0"
        explanation="P(정답|통과) = ps ÷ (ps + (1−p)(1−t)). 쉬운 업무(p=80%)는 94.7%지만 어려운 업무(p=5%)는 19.1% — 같은 검수자라도 바탕이 나쁘면 통과 도장을 못 믿습니다."
      />
      <Quiz
        difficulty="medium"
        question="어려운 업무(기저율 5%)에서 '검수를 통과했으니 안심'이 특히 위험한 이유(기저율의 역설)는?"
        :choices="['통과해도 정답일 확률이 19.1%뿐 — 대부분의 통과가 여전히 오답이다', '검수자가 어려운 업무를 거부해서', '어려운 업무는 검수가 불가능해서', '역설은 이론일 뿐 실제로는 안전해서']"
        :answer="0"
        :hints="['건강검진 위양성과 같은 구조 — 바탕(기저율)이 나쁘면 양성도 못 믿죠.']"
        explanation="바탕이 나쁘면(5%) 검수자가 좋아도 통과 더미의 대부분이 여전히 오답입니다 — 6장에서 본 그 역설. '통과'라는 단어의 안심이 가장 위험한 순간이에요."
      />
      <Quiz
        difficulty="medium"
        question="제안서의 자체 검수 AI가 작성 AI와 '같은 모델'이라면 추가로 생기는 문제는?"
        :choices="['자기 검수의 상관 — 작성자가 몰라서 틀린 것을 검수자도 같은 맹점으로 놓친다', '검수 속도가 느려진다', '비용이 두 배가 된다', '아무 문제 없다']"
        :answer="0"
        explanation="9장·10부 9장의 심판·선수 분리 — 같은 모델은 같은 오개념을 공유해 서로의 오류를 못 거릅니다. 검수는 작성자와 독립일수록 강하고, 제안서엔 그 독립성 언급이 없죠."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="'pass@5 97%'만 보고 별다른 준비 없이 일손 2를 도입한 팀이 실제로 겪을 가능성이 가장 큰 일은?"
        :choices="['한 번에 성공하는 비율은 50% 남짓이라 체감 성능이 광고에 못 미치고, 5배로 돌려 고르려 해도 성공을 판별할 수단이 없어 pass@5의 이득을 실현하지 못한다', '항상 97% 성공해서 만족한다', 'pass@5가 자동으로 pass@1이 된다', '검수 AI가 알아서 5배 비용을 없애 준다']"
        :answer="0"
        :hints="['pass@5와 pass@1의 차이, 그리고 4장의 대전제(성공을 알아볼 수 있어야)를 떠올리세요.']"
        explanation="pass@5는 '5번 굴려 하나 건지면 성공'이라 pass@1이 50%대인 도구는 한 번 쓰면 절반만 맞습니다. 이득을 realize하려면 매번 5회 실행(비용 5배)하고 그중 옳은 것을 골라낼 판별 수단이 있어야 하죠 — 그게 없으면 종이 위 숫자로 끝납니다."
      />
      <Quiz
        difficulty="hard"
        question="도입을 결정하기 전, 이 제안서에 가장 먼저 요구해야 할 추가 자료·조건의 완전한 묶음은?"
        :choices="['성공을 판별할 수 있는(테스트 가능한) 업무 기준 200건 시범 성적 + 독립 검수 설계 + 단계별(병목) 성공률 로깅', '더 화려한 데모 영상', '경쟁 제품과의 가격 비교표', '각 단계 정확도를 99%로 올린 새 버전']"
        :answer="0"
        :hints="['검산대 ②③④의 처방 — 표본·판별·독립·계측을 모으면 됩니다.']"
        explanation="표본 부족 대응(200건), pass@k 전제(판별 가능한 업무), 검수 신뢰(독립 설계), 병목 진단(단계별 로깅 — 2장) — 11부 도구 상자의 총출동입니다. 이 조건표를 스스로 쓸 수 있다면, 졸업입니다. 🎓"
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch12')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-2xl font-bold text-emerald-700">🎓</div>
      <p class="text-lg font-bold text-emerald-800">11부 졸업 — 에이전트와 추론의 수학, 완결!</p>
      <p class="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-emerald-700">
        일의 성공률은 걸음의 곱이고, 되살리는 길은 다시 뽑기·다수결·검수입니다.
        이제 에이전트 제품 광고가 떠도 계산으로 도입 여부를 판정할 수 있어요 — 시리즈의
        마지막 질문에 답했습니다. 질문 사슬의 완성: 무엇을(6부) → 어떻게(8부) →
        무엇으로(9부) → 얼마나·정말로(10부) → <b>이제 일을 맡겨도 되나(11부)</b>.
      </p>
      <a
        href="/"
        class="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        목차로 — 처음으로 →
      </a>
    </div>
  </article>
</template>
