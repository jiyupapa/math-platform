<script setup lang="ts">
// 11장 — 에이전트의 성적표. pass@k 정식 정의(비편향 추정)·성적표의 오차범위·궤적 평가·다중 비교.
// 핵심 수치(전부 해석적 검증): pass@5(n=10,c=4)=97.6% / pass@1=40% / 소박 92.2% / 20건 90% ±21.9%p
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ScorecardLab from '@/components/ScorecardLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch11')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 11 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">에이전트의 성적표</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1막에서 사슬을 되살리고(다시 뽑기·다수결·검수), 2막에서 자원을 배분했습니다(생각의 길이·탐색·협업·기억).
      이제 마지막 3막 — <b>판정</b>입니다. 에이전트가 정말 쓸 만한지 어떻게 채점할까요?
      제품 광고의 <b>“성공률 97%”</b>가 무슨 뜻인지, 데모 몇 건으로 잰 점수를 얼마나 믿어도
      되는지 — 이 장에서 성적표를 읽는 눈을 답니다.
    </p>

    <ConceptCard tone="goal" title="이 장의 목표">
      에이전트 채점의 두 함정을 계산으로 무장합니다 — <b>pass@k</b>(k번 안에 한 번 맞히기)가
      정확히 무엇을 재는지, 그리고 <b>과업 수가 적은 성적표의 오차범위</b>가 왜 두 에이전트를
      구별 못 하게 만드는지. 10부의 평가 통계가 에이전트 무대로 돌아옵니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대 — “성공률 97%”의 정체</h2>
    <ReviewFlag id="ch11-s1" chapter="ch11" label="1. 무대 — 「성공률 97%」의 정체" />
    <p class="leading-relaxed text-slate-700">
      어느 코딩 에이전트 제품 소개에 큼직하게 적혀 있습니다 — <b>“pass@5 = 97%”</b>.
      대단해 보이죠. 그런데 두 가지를 물어야 합니다. 첫째, pass@5의 <b>5</b>는 무슨 뜻일까요?
      한 문제를 <b>다섯 번</b> 시도해서 그중 한 번이라도 성공하면 통과로 친다는 뜻입니다 —
      그렇다면 <b>한 번</b>에 맞힐 확률(pass@1)은 훨씬 낮을 수 있어요. 둘째, 그 97%는
      과업 <b>몇 개</b>로 잰 걸까요? 20개짜리 데모라면 오차범위가 점수를 삼킬 만큼 큽니다.
      계산기로 직접 확인해 봅시다.
    </p>

    <ScorecardLab />

    <ConceptCard tone="tip" title="핵심 관찰 — pass@5의 화려함과 pass@1의 민낯">
      관측이 <b>10번 시도 중 4번 성공</b>(n=10, c=4)이라면 pass@1 = 4/10 = <b>40%</b>입니다.
      그런데 pass@5는 <b>97.6%</b>로 뛰어요 — 다섯 번 뽑으면 그중 하나는 성공일 가능성이 크니까요.
      광고가 pass@5를 앞세우는 이유죠. 함정은 둘 — ① 다섯 번 뽑아 <b>고르려면</b> 성공을 알아볼
      검수 수단이 있어야 하고(6장) 비용도 5배(7장), ② 성적표를 <b>소박한 공식</b>
      1−(1−0.4)⁵ = 92.2%로 계산하면 참값(97.6%)을 빗나갑니다 — 표본이 작을 땐 <b>비편향 추정</b>이
      필요해요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="pass@1 = 40%인 에이전트의 pass@5가 97.6%까지 오르는 이유는?"
      :choices="['다섯 번 시도하면 그중 한 번이라도 성공할 가능성이 커져서 — 4장 다시 뽑기의 수학', '에이전트가 5번째에 학습해서', '40%가 5배로 커져서 200%가 되니까', 'pass@5는 pass@1보다 항상 정확한 측정이라서']"
      :answer="0"
      :hints="['pass@k는 4장에서 배운 “N번 중 한 번이라도 성공”의 이름표입니다.']"
      explanation="pass@k는 1−(전부 실패)의 그 수학입니다 — k를 늘리면 오르는 게 당연해요. 그래서 pass@5 하나만 보면 실력이 부풀려 보이고, pass@1을 함께 봐야 민낯이 드러납니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. pass@k를 정확히 세는 법 — 비편향 추정</h2>
    <ReviewFlag id="ch11-s2" chapter="ch11" label="2. pass@k를 정확히 세는 법 — 비편향 추정" />
    <p class="leading-relaxed text-slate-700">
      한 문제를 <b>n번</b> 시도해 <b>c번</b> 성공했다고 합시다. 여기서 <b>k개를 뽑아</b>
      한 번이라도 성공할 확률(pass@k)을 어떻게 셀까요? 소박하게는 pass@1 = c/n으로 실력을
      추정한 뒤 4장 공식 1−(1−c/n)ᵏ에 넣습니다. 하지만 이건 표본이 작을 때 <b>편향</b>돼요 —
      실제로는 n개 중 k개를 <b>중복 없이</b> 뽑는 것이라, 실패 c'=n−c개에서 k개가 전부
      뽑힐 확률을 1에서 빼는 것이 정확합니다:
    </p>
    <MathBlock expr="\text{pass@}k = 1 - \frac{\binom{n-c}{k}}{\binom{n}{k}}" />
    <p class="leading-relaxed text-slate-700">
      n=10, c=4, k=5를 넣으면 실패 6개 중 5개가 모두 뽑힐 확률 C(6,5)/C(10,5) = 6/252 =
      0.024, 그 여사건이 <b>97.6%</b>입니다. 소박한 공식(92.2%)보다 5.4%p 높죠 — 실패 더미가
      뽑을수록 줄어드는 것을 소박한 공식은 놓칩니다. 이것이 실제 코딩 벤치마크가 쓰는
      <b>비편향 pass@k 추정량</b>입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: pass@k / 비편향 추정 / 궤적 평가">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>pass@k</b> — 읽는 법: 패스 앳 케이.
          뜻: 한 과업을 <b>k번 시도해 한 번이라도 성공</b>하면 통과로 치는 지표 — 비유로는
          <b>“k번 안에 한 번”</b>. pass@1은 한 방 실력, pass@k(k&gt;1)는 재시도·다시 뽑기를
          허용한 실력입니다.
        </li>
        <li>
          <b>비편향 추정</b> (unbiased estimator) — 읽는 법: 비편향 추정.
          뜻: 작은 표본에서도 <b>치우치지 않게</b> 참값을 세는 계산법 — pass@k는 조합
          C(n−c,k)/C(n,k)로 정확히 세고, c/n을 거듭제곱하는 소박한 방식의 편향을 피합니다.
        </li>
        <li>
          <b>궤적 평가</b> (trajectory evaluation) — 읽는 법: 궤적 평가.
          뜻: <b>최종 성공/실패만</b> 보는 게 아니라 <b>일이 지나간 단계들(궤적)</b>을 채점하는 것 —
          어느 단계에서 미끄러졌는지(2장 병목 계측), 도구를 옳게 골랐는지까지 본다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습 — pass@5를 단계별로</p>
    <StepQuiz
      difficulty="medium"
      question="한 문제를 10번 시도해 4번 성공했다(n=10, c=4). 5개를 뽑아 한 번이라도 성공할 확률 pass@5를 비편향 공식으로 계산해 보세요."
      :steps="[
        { lhs: '\\binom{6}{5} = ?', answer: 6, tolerance: 0.5 },
        { lhs: '\\binom{10}{5} = ?', answer: 252, tolerance: 0.5 },
        { lhs: '\\tfrac{6}{252} = ?', answer: 0.0238, tolerance: 0.001 },
        { lhs: '1 - 0.0238 = ?\\;(\\%)', answer: 97.6, tolerance: 0.1 },
      ]"
      :hints="['실패는 n−c = 6개. 그 6개 중 5개가 전부 뽑힐 확률을 1에서 빼면 됩니다.']"
      explanation="C(6,5)=6, C(10,5)=252 → 6/252≈0.0238 → 1−0.0238≈0.976 → 97.6%. 실패 6개 중 5개가 몽땅 뽑혀야만 pass@5가 실패하니, 그 확률이 낮아 pass@5가 높게 나옵니다."
    />

    <ConceptCard tone="note" title="성적표의 ± — 냅킨 공식 98/√n">
      점수 옆에 붙는 오차범위(±)는 암산용 <b>냅킨 공식</b>으로 어림합니다:
      <MathBlock expr="\pm \approx \frac{98}{\sqrt{n}}\ \%p \qquad (n = \text{과업 수})" />
      <p class="mt-2">
        98의 출처 — 10부 6장의 오차범위 1.96 × √(p(1−p)/n) × 100%p 에서, 흔들림이 가장 큰
        p = 50%를 넣으면 √(p(1−p)) = 0.5 라서 1.96 × 0.5 × 100 = <b>98</b>. 즉 "최악의 경우
        오차"의 어림값이에요. 과업 20개면 98/√20 ≈ <b>±21.9%p</b> — "90%"라는 점수의 구간이
        [68.1, 100]까지 벌어진다는 뜻입니다(계산상 상한 111.9는 확률이라 <b>100%에서 잘라</b>
        읽어요). 200개면 ±6.9%p로 좁아지죠. 성적표에선 <b>점수보다 먼저 과업 수 n</b>을 확인하세요.
      </p>
    </ConceptCard>

    <DetailsCard title="➕ 더 깊이: 궤적 평가와 다중 비교의 함정">
      성적표는 <b>결과만</b> 볼 수도, <b>과정도</b> 볼 수도 있습니다. 결과 평가는 최종 성공/실패만
      세고, <b>궤적 평가</b>는 12단계 중 어디서 틀렸는지(2장 병목), 도구를 옳게 골랐는지(3장),
      불필요하게 오래 돌지 않았는지(7장)까지 채점합니다 — LLM 심판(10부 9장)에게 궤적을
      읽혀 채점하는 관행이 여기서 나오고, 그 심판의 편향도 10부 9장 그대로 따라옵니다.
      또 하나의 함정은 <b>다중 비교</b>예요 — 벤치마크를 열 개 돌려서 <b>가장 좋게 나온 하나만</b>
      발표하면, 우연만으로도 좋은 점수가 하나쯤 나옵니다(10부 7장의 그 경고). 성적표를 볼 땐
      “몇 개 중 고른 결과인가”를 물어야 합니다.
    </DetailsCard>

    <ReviewFlag id="ch11-ai" chapter="ch11" label="🤖 AI 연결 — 데모 영상과 성적표는 다른 것" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 데모 영상과 성적표는 다른 것">
      코딩 에이전트 벤치마크가 <b>pass@1과 pass@5를 나란히</b> 싣는 건 오늘 배운 이유 때문입니다 —
      pass@1은 한 방 실력, pass@k는 다시 뽑기를 허용한 실력이라 둘 다 봐야 정직하죠. 그리고
      화려한 <b>데모 영상</b>(성공 사례 몇 개)과 <b>성적표</b>(전 과업 통계)는 전혀 다른 것입니다 —
      데모는 잘된 궤적만 고른 것이라 다중 비교의 함정 그 자체예요. 성적표의 ±는
      <b><PartLink :part="10" ch="ch6">10부 6장</PartLink></b>(오차범위)에서, 두 에이전트를
      가르는 판정과 다중 비교 경고는 <b><PartLink :part="10" ch="ch7">10부 7장</PartLink></b>에서,
      표본으로 실력을 추정하는 문법은 <b><PartLink :part="3" ch="ch8">3부 8장</PartLink></b>에서
      쌓은 기초 그대로입니다. 다음은 마지막 장 — 이 무기들을 전부 들고 가상 에이전트 제품의
      <b>도입 여부를 판정</b>합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="에이전트의 성적표 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="pass@k에서 k가 뜻하는 것은?"
        :choices="['한 과업을 시도하는 횟수 — k번 안에 한 번이라도 성공하면 통과', '과업의 개수', '에이전트의 개수', '통과 기준 점수']"
        :answer="0"
        explanation="pass@k는 “k번 시도해 한 번이라도 성공”입니다 — 4장 다시 뽑기의 1−(1−p)^k에 붙은 정식 이름표죠. k가 클수록 통과율은 오릅니다."
      />
      <Quiz
        difficulty="easy"
        question="pass@1이 pass@5보다 항상 크거나 같다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 시도를 더 허용할수록(k가 클수록) 통과 확률은 오르거나 같습니다 — pass@1 ≤ pass@5. 그래서 광고는 큰 k를 앞세워요."
      />
      <Quiz
        difficulty="easy"
        question="10번 시도해 4번 성공한 에이전트의 pass@1은?"
        type="numeric"
        :answer="40"
        :hints="['pass@1 = c/n을 %로.']"
        explanation="4/10 = 0.4 → 40%. pass@1은 한 번에 맞힐 실력의 가장 정직한 지표입니다."
      />
      <Quiz
        difficulty="easy"
        question="과업 20개로 잰 성적표와 200개로 잰 성적표 중, 오차범위(±)가 더 좁은 쪽은?"
        :choices="['200개 — 표본이 클수록 ±가 좁아진다(±6.9%p vs ±21.9%p)', '20개', '둘이 같다', '과업 수는 오차범위와 무관하다']"
        :answer="0"
        explanation="냅킨 공식 98/√n — n이 커지면 ±가 좁아집니다. 20개는 ±21.9%p, 200개는 ±6.9%p. 성적표를 보면 과업 수부터 확인하세요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="소박한 공식 1−(1−c/n)^k 대신 비편향 추정 1−C(n−c,k)/C(n,k)을 써야 하는 이유는?"
        :choices="['n개에서 k개를 중복 없이 뽑는 실제 상황을 반영 — 실패 더미가 뽑을수록 줄어드는 것을 소박한 공식은 놓친다', '비편향 공식이 항상 더 큰 값을 주니까', '소박한 공식은 k=1에서도 틀려서', 'C(n,k)가 계산하기 더 쉬워서']"
        :answer="0"
        :hints="['뽑기가 “복원 추출”인지 “비복원 추출”인지 생각해 보세요.']"
        explanation="pass@k는 n개 샘플에서 k개를 비복원으로 뽑는 문제입니다 — 조합으로 정확히 세야 편향이 없어요. 소박한 공식은 매번 c/n로 복원 추출한다 가정해 참값을 빗나갑니다(작은 n에서 특히)."
      />
      <Quiz
        difficulty="medium"
        question="n=10, c=4에서 pass@5 = 97.6%, 소박한 공식은 92.2%. 이 5.4%p 차이가 주는 교훈은?"
        :choices="['표본이 작을 땐 추정 방법이 성적표를 바꿀 수 있다 — 어떻게 셌는지를 물어야 한다', '두 공식은 늘 5.4%p 차이가 난다', '소박한 공식이 항상 옳다', '차이가 있으니 pass@k는 못 믿는다']"
        :answer="0"
        explanation="같은 데이터(4/10)라도 세는 법에 따라 92.2%와 97.6%로 갈립니다 — 성적표의 숫자는 “무엇을, 어떻게 셌나”와 한 몸이에요. 이것이 3부 8장 추정의 실전 복귀입니다."
      />
      <Quiz
        difficulty="medium"
        question="어느 벤치마크 결과: 에이전트 A가 20개 과업에서 90% 성공. 경쟁 B는 같은 20개에서 78%. ‘A가 더 낫다’는 결론이 성급한 이유는?"
        :choices="['20개의 오차범위가 ±21.9%p라 두 구간이 크게 겹친다 — 이 표본으론 우열 단정 불가', 'A가 90%면 무조건 옳다', '78%는 낙제라 비교가 무의미', '과업 수가 같으니 비교가 항상 유효']"
        :answer="0"
        :hints="['90 ± 21.9 → 구간 [68.1, 100] (상한은 확률이라 100에서 잘라 읽음). 78%가 이 안에 들어가나요?']"
        explanation="A의 구간 [68.1, 100](90 ± 21.9%p — 계산상 상한 111.9는 확률이라 100에서 잘라 읽음)이 B(78%)를 덮습니다 — 12%p 차이가 소음일 수 있어요. 정식 판정은 10부 7장 쌍대 비교(같은 과업 문항별 대조)로 표본을 아껴야 합니다."
      />
      <Quiz
        difficulty="medium"
        question="궤적 평가(과정 채점)가 결과 평가(성공/실패만)보다 더 알려주는 것은?"
        :choices="['어느 단계에서 왜 실패했는지 — 병목·잘못된 도구 선택·과잉 반복 같은 원인', '최종 성공률만 더 정확하게', '에이전트의 실행 속도만', '아무 추가 정보도 없다']"
        :answer="0"
        explanation="궤적을 보면 2장의 병목, 3장의 도구 오선택, 7장의 과잉 생각을 짚을 수 있습니다 — 고칠 지점이 보이죠. 대신 궤적을 LLM 심판에게 채점시키면 10부 9장의 심판 편향이 따라옵니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="제품이 ‘pass@5 = 97%’만 크게 광고하고 pass@1은 40%로 작게 적어 두었다. 이 에이전트를 실전 도입하려는 팀이 반드시 확인할 것은?"
        :choices="['5번 뽑은 것 중 정답을 골라낼 검수 수단이 우리 업무에 있는지, 그리고 5배 비용을 감당할지 — 없으면 체감 성능은 pass@1(40%)에 가깝다', '광고 글꼴 크기', 'pass@10을 추가로 요구', '97%면 검수는 불필요하다']"
        :answer="0"
        :hints="['pass@5의 대전제는 4장에서 배운 “성공을 알아볼 수 있어야”입니다.']"
        explanation="pass@5의 97%는 다섯 답 중 정답을 고를 수 있을 때만 실현됩니다 — 테스트·정답 대조가 되는 업무여야 하고 비용도 5배(7장). 그게 안 되면 한 번 받은 답을 그냥 쓰는 셈이라 체감은 pass@1(40%)이에요. 그래서 pass@1과 검수 가능성이 도입 판단의 핵심입니다."
      />
      <Quiz
        difficulty="hard"
        question="한 회사가 벤치마크 12종을 돌려 그중 가장 높게 나온 1종의 점수만 발표했다. 이 성적표의 문제는?"
        :choices="['다중 비교 — 여러 번 재서 최고만 고르면 우연히 좋은 점수가 하나쯤 나온다, 12종 전체 결과와 선택 기준을 요구해야 한다', '벤치마크는 12종이나 되면 무효', '가장 높은 점수가 항상 진짜 실력', '문제 없다 — 최고 점수가 대표값이다']"
        :answer="0"
        :hints="['10부 7장의 다중 비교 경고 — 여러 시험 중 골라 보여주기.']"
        explanation="12번 재서 최고만 보여주는 건 골라 보여주기입니다 — 우연만으로도 상위값이 나오죠. 전체 결과·선택 기준을 요구하고, 사전에 정한 대표 벤치마크로 평가해야 정직합니다(10부 7장)."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch11')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">11장 완료 — 판정의 무기가 모두 모였습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        pass@k의 비편향 추정, 성적표의 오차범위, 궤적 평가와 다중 비교까지 — 이제 성적표를 보면
        무엇을 물어야 할지 압니다. 다음은 마지막 장, 캡스톤 — 가상 에이전트 제품 자료를 통째로
        팩트체크하며 11부를 졸업합니다.
      </p>
      <RouterLink
        to="/ch/ch12"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        12장 — 🎯 캡스톤: 이 에이전트, 도입해도 되나 →
      </RouterLink>
    </div>
  </article>
</template>
