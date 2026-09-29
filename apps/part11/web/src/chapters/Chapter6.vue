<script setup lang="ts">
// 6장 — 검수자: verifier와 베이즈 (핵심). 3부 4장(조건부 확률·베이즈)의 정면 회수처.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import VerifierLab from '@/components/VerifierLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch6')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">6장 · 45분 · 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">검수자 — verifier와 베이즈</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      4장이 숙제를 하나 남겼습니다. 다시 뽑기는 <b>성공을 알아볼 수 있을 때만</b> 작동한다.
      N개를 뽑아 놓고 뭘 고를지 모른다면 소용이 없죠. 그래서 등장하는 것이 되살리는 세 번째 길,
      <b>검수자</b>입니다. 그런데 검수자도 완벽하지 않다면 "검수를 통과한 답"은 대체
      얼마나 믿을 수 있을까요? 그 답이 바로 3부 4장에서 배운 <b>베이즈</b>입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"검수를 통과한 답이 진짜 맞을 확률"을 베이즈로 계산</b>합니다.
      35%짜리 일꾼의 답이 검수 한 번에 71%로 도약하는 것, 그리고 바탕이 나쁘면(5%)
      좋은 검수자도 확신을 못 주는 <b>기저율의 역설</b>까지. 스팸 필터의 그 수학이
      에이전트의 품질 관리로 돌아옵니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 통과 도장의 무게</h2>
    <ReviewFlag id="ch6-s1" chapter="ch6" label="1. 무대: 통과 도장의 무게" />
    <p class="leading-relaxed text-slate-700">
      워밍업의 그 일꾼이 10단계 보고서를 하나 제출했습니다. 성공률 35%짜리 작업이니
      그대로 쓰기엔 불안하죠. 마침 팀에 <b>검수 담당</b>이 생겼습니다. 맞는 보고서의
      90%를 통과시키고(민감도), 틀린 보고서의 80%를 걸러냅니다(특이도). 방금 그 보고서가
      <b>검수를 통과</b>했다는 연락이 왔습니다. 자, 이제 이 보고서가 진짜 괜찮은 확률은
      몇 %일까요? 90%? 80%? 35%? 직접 다이얼을 돌려 봅시다.
    </p>

    <VerifierLab />

    <ConceptCard tone="tip" title="핵심 관찰: 검수 도장 하나가 35%를 71%로 만든다">
      기본 설정(기저율 35% · 민감도 90% · 특이도 80%)에서 통과 더미를 모아 보면
      통과한 정답 32개 vs 새어 들어온 오답 13개, 정답 비율 <b>70.8%</b>. 검수 전 35%였던
      믿음이 <b>통과라는 증거 하나로 두 배</b>가 됐습니다. 이것이 베이즈 갱신이에요:
      <b>증거(통과)를 본 만큼 믿음(확률)을 고쳐 쓴다.</b> 그런데 프리셋을 "어려운 과업(5%)"으로
      바꾸면 같은 검수자인데 통과해도 <b>19.1%</b>. 바탕이 나쁘면 통과 더미의 대부분이
      새어 들어온 오답이라, 도장의 무게가 확 줄어듭니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="기본 설정(기저율 35%·민감도 90%·특이도 80%)에서, 검수를 통과한 답이 진짜 맞을 확률은 약 몇 %인가? (정수로 반올림)"
      type="numeric"
      :answer="71"
      :hints="['랩의 ③ 통과 더미에서 초록(정답 32) vs 빨강(오답 13)의 비율을 보세요.']"
      explanation="32/(32+13) ≈ 0.708 → 약 71%. 검수 전 35%의 두 배예요. 통과라는 증거가 믿음을 끌어올렸습니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="ch6-s2" chapter="ch6" label="2. 오늘의 발견에 이름표 달기" />
    <p class="leading-relaxed text-slate-700">
      방금 만진 다이얼들의 공식 이름과, 이 다이얼들을 묶는 공식 하나를 배웁니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 검증자 / 민감도·특이도 / 사후확률">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>검증자</b> (verifier). 읽는 법: 베리파이어.
          뜻: 답을 채택하기 전에 맞는지 판정하는 <b>별도의 눈</b>으로, 이 과정의 비유로는
          <b>검수자</b>. 코드의 테스트 실행, 수학의 정답 대조, 다른 모델의 검토가 전부 검증자입니다.
        </li>
        <li>
          <b>민감도 / 특이도</b> (sensitivity / specificity). 뜻: <b>맞는 답을 통과시킬 확률 / 틀린 답을 걸러낼 확률</b>. 의학 검사에서 쓰는
          바로 그 용어입니다(병이 있는 사람을 양성으로 / 없는 사람을 음성으로).
          완벽한 검수자(둘 다 100%)는 현실에 없어요.
        </li>
        <li>
          <b>사후확률</b> (posterior). 뜻: 증거(검수 통과)를 <b>본 뒤에 갱신된</b> 믿음. 검수 전의 믿음은
          기저율(사전확률)이라 부릅니다. 3부 4장 스팸 필터에서 "단어를 본 뒤 스팸일 확률"을
          갱신했던 그 구조 그대로예요.
        </li>
      </ul>
    </ConceptCard>

    <MathBlock
      expr="P(\text{정답}\mid\text{통과}) = \dfrac{p \cdot s}{p \cdot s + (1-p)(1-t)}"
    />
    <p class="mb-2 leading-relaxed text-slate-700">
      읽는 법: "통과가 주어졌을 때 정답일 확률". 분자는 <b>통과한 정답</b>(기저율 p × 민감도 s),
      분모는 <b>통과 더미 전체</b>(통과한 정답 + 새어 들어온 오답 (1−p)(1−t)). 통과 더미에서
      정답의 비율을 세는 것뿐입니다. 랩의 ③이 바로 이 식이에요.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="어려운 과업(기저율 5%)에서 같은 검수자(민감도 90%·특이도 80%)를 통과한 답을 믿어도 되나?"
      :choices="['아직 못 믿는다. 통과해도 정답 확률은 약 19%, 오답이 워낙 많아 새는 오답이 통과 더미를 지배한다', '통과했으니 90% 믿을 수 있다', '특이도가 80%니 80% 믿을 수 있다', '기저율은 결과와 무관하다']"
      :answer="0"
      :hints="['랩에서 “어려운 과업” 프리셋을 눌러 통과 더미의 색 비율을 보세요.']"
      explanation="0.045/(0.045+0.19) ≈ 19.1%. 정답 4.5개에 새는 오답 19개. 건강검진에서 희귀병 양성 판정이 곧 확진이 아닌 것과 같은 구조(기저율의 역설)입니다."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습: 베이즈를 단계별로</p>
    <StepQuiz
      difficulty="medium"
      question="기저율 50% · 민감도 90% · 특이도 80%인 검수를 통과했다. 정답일 확률을 단계별로 계산해 보세요."
      :steps="[
        { lhs: '\\text{통과한 정답: } 0.5 \\times 0.9 = ?', answer: 0.45, tolerance: 0.001 },
        { lhs: '\\text{통과 더미: } 0.45 + 0.5 \\times 0.2 = ?', answer: 0.55, tolerance: 0.001 },
        { lhs: '0.45 \\div 0.55 = ?\\; (\\text{소수 셋째 자리까지})', answer: 0.818, tolerance: 0.005 },
        { lhs: '\\text{사후확률} = ?\\, \\%', answer: 81.8, tolerance: 0.1 },
      ]"
      :hints="['분모는 통과 더미 전체라서, 통과한 정답에 새는 오답(0.5×0.2)을 더합니다.']"
      explanation="0.45/(0.45+0.10) = 0.818 → 81.8%. 기저율이 50%로 좋으면 같은 검수자의 도장이 훨씬 무거워집니다. 사후확률은 바탕과 검수자의 합작품이에요."
    />

    <DetailsCard title="➕ 더 깊이: 반복 검수의 힘과 두 가지 함정">
      <b>반복 검수</b>: 첫 통과의 사후확률(70.8%)을 새 기저율로 넣고 독립 검수자가 또 통과시키면
      <b>91.6%</b>, 세 번이면 <b>98.0%</b>. 베이즈 갱신은 연쇄됩니다. 단, 함정 둘.
      ① <b>독립이라야 합니다</b>. 생성한 모델이 자기 답을 검수하면 같은 맹점을 공유해(자기 선호,
      10부 9장의 그 편향) 명목 민감도·특이도가 허수가 됩니다. 테스트 실행처럼 <b>구조적으로
      다른 눈</b>이 강한 검수자인 이유죠. ② <b>검수 점수가 목표가 되면</b> 검수만 통과하는 답이
      진화합니다(테스트만 통과하는 코드처럼). "지표가 목표가 되면 좋은 지표이길 멈춘다"는
      <b>굿하트의 법칙</b>(Goodhart's law)의 에이전트 버전이에요. 검수자를 주기적으로 갱신·다양화해야
      합니다.
    </DetailsCard>

    <ReviewFlag id="ch6-ai" chapter="ch6" label="🤖 AI 연결: 실무의 검수자들, 그리고 1막의 완성" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 실무의 검수자들, 그리고 1막의 완성">
      실무 에이전트의 검수자는 세 부류입니다. <b>테스트 실행</b>(코드가 돌면 통과: 특이도가
      매우 높은 결정적 검수자, 코딩 에이전트가 유독 강한 이유), <b>정답 대조</b>(수학·퀴즈),
      그리고 <b>LLM 검수자</b>. 마지막 것은 낯익습니다.
      <b><PartLink :part="6" ch="ch4">6부 4장</PartLink></b>의 보상 모델이 사실 "선호 검수자"였죠.
      그리고 이 장의 수학 전부가 <b><PartLink :part="3" ch="ch4">3부 4장</PartLink></b>(조건부 확률과 베이즈, 스팸 필터)를 정면으로 다시 씁니다. 이로써 되살리는 세 가지 길이 모두
      모였습니다. 다시 뽑기(4장) × 다수결(5장) × 검수(6장)를 조합하면 35%짜리 일꾼도
      쓸 만한 팀원이 됩니다. 2막(7장~)에서는 이 조합의 <b>가격표</b>를 계산합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="검수자: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="검증자(verifier)의 역할은?"
        :choices="['답을 채택하기 전에 맞는지 판정하는 별도의 눈(테스트 실행·정답 대조·다른 모델의 검토)', '답을 더 빨리 생성하는 가속기', '토큰 비용을 줄이는 압축기', '질문을 도구로 보내는 라우터']"
        :answer="0"
        explanation="라우터(3장)는 들어오는 질문을 나누고, 검수자(6장)는 나가는 답을 거릅니다. 4장 다시 뽑기의 대전제(성공을 알아보는 눈)를 채워 주는 장치예요."
      />
      <Quiz
        difficulty="easy"
        question="검수를 통과한 답은 100% 정답이다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 검수자도 모델이라 틀린 답을 (1−특이도)의 확률로 통과시켜요. 그래서 통과 후의 믿음은 베이즈로 계산해야 합니다."
      />
      <Quiz
        difficulty="easy"
        question="민감도(sensitivity)의 뜻은?"
        :choices="['맞는 답을 통과시킬 확률', '틀린 답을 걸러낼 확률', '답이 애초에 맞을 확률', '검수에 드는 토큰 비용']"
        :answer="0"
        explanation="민감도 = 맞는 답을 놓치지 않는 능력, 특이도 = 틀린 답에 속지 않는 능력. 의학 검사의 용어가 그대로 쓰입니다."
      />
      <Quiz
        difficulty="easy"
        question="베이즈 갱신에서 '기저율(사전확률)'에 해당하는 것은?"
        :choices="['검수를 받기 전, 답이 맞을 확률 (예: 워밍업 일꾼의 35%)', '검수를 통과한 뒤의 확률', '검수자의 민감도', '검수 횟수']"
        :answer="0"
        explanation="검수 전의 믿음(기저율)이 증거(통과)를 만나 사후확률로 갱신됩니다. 갱신의 출발점이 바탕이에요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="사후확률 공식의 분모에 (1−p)(1−t)가 들어가는 이유는?"
        :choices="['틀린 답도 (1−특이도)의 확률로 검수를 통과해 통과 더미에 섞이기 때문', '민감도를 보정하기 위한 상수라서', '확률의 합을 1로 만들기 위한 장식이라서', '반복 검수를 대비한 예비 항이라서']"
        :answer="0"
        :hints="['랩 ③의 통과 더미에 빨간 칸이 섞여 있던 이유를 떠올려 보세요.']"
        explanation="분모 = 통과 더미 전체 = 통과한 정답(p·s) + 새는 오답((1−p)(1−t)). 사후확률은 그 더미에서 정답의 비율일 뿐입니다."
      />
      <Quiz
        difficulty="medium"
        question="기저율 5%의 어려운 과업에서 검수 통과 후에도 19%밖에 안 됐던 이유는?"
        :choices="['오답이 워낙 많아(95개) 새는 오답(19개)이 통과한 정답(4.5개)보다 훨씬 많아서', '민감도가 낮아서', '검수자가 오답을 전부 통과시켜서', '공식이 어려운 과업에는 적용되지 않아서']"
        :answer="0"
        explanation="새는 비율(20%)은 같아도 바탕의 오답 수가 많으면 새는 절대량이 커집니다. 희귀병 검진의 위양성 문제와 같은 구조(기저율의 역설)예요."
      />
      <Quiz
        difficulty="medium"
        question="기본 설정에서 민감도를 90→95%로 올리는 것과 특이도를 80→95%로 올리는 것 중 통과한 답의 신뢰도(사후확률)를 더 크게 올리는 쪽은?"
        :choices="['특이도: 새는 오답이 확 줄어 70.8%가 90.6%로 뛴다 (민감도 개선은 71.9%에 그침)', '민감도: 정답을 더 많이 통과시키니까', '둘의 효과는 항상 같다', '어느 쪽도 사후확률과 무관하다']"
        :answer="0"
        :hints="['사후확률을 깎아 먹는 주범은 통과 더미의 빨간 칸(새는 오답)입니다.']"
        explanation="통과의 믿음은 특이도가 지배합니다. 분모의 오염원인 (1−t)를 줄이는 쪽이 직격이에요. 정답을 놓치는 건(민감도) 아깝지만, 오답이 새는 건(특이도) 위험합니다."
      />
      <Quiz
        difficulty="medium"
        question="4장 Best-of-N과 6장 검수자를 결합하면 좋은 이유는?"
        :choices="['N개 뽑기는 “한 번이라도 성공”을 만들고, 검수자는 그 성공을 알아보는 눈이 되어 준다. 4장의 대전제 해소', '검수자가 N을 줄여 주기 때문', '뽑기 비용이 공짜가 되기 때문', '결합하면 확률이 항상 100%가 되기 때문']"
        :answer="0"
        explanation="다시 뽑기(성공 만들기) × 검수(성공 고르기). 두 장치가 짝일 때 1−(1−p)^N이 실전 수치가 됩니다. 테스트 있는 코딩 과업이 모범 무대인 이유죠."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="생성한 모델에게 자기 답을 검수시켰더니 통과율이 높다. 이 통과 도장의 함정은?"
        :choices="['생성자와 검수자가 같은 맹점을 공유해(상관) 명목 민감도·특이도가 허수. 독립 가정이 깨져 사후확률 공식이 과대평가된다', 'temperature가 낮아진다', '토큰 비용이 두 배가 될 뿐 문제없다', '자기 검수는 항상 특이도가 100%다']"
        :answer="0"
        :hints="['10부 9장의 자기 선호 편향: 같은 눈으로 두 번 보면 무엇을 못 보나요?']"
        explanation="자기가 저지른 오류는 자기 검수도 통과시키기 쉽습니다. 그래서 테스트 실행·다른 모델처럼 구조적으로 다른 눈이 강한 검수자예요. 반복 검수의 “독립” 조건도 같은 이유입니다."
      />
      <Quiz
        difficulty="hard"
        question="에이전트를 “검수 통과율 최대화”로 오래 최적화했더니 통과율 99%가 됐다. 축하하기 전에 의심할 것은?"
        :choices="['검수만 통과하는 답이 진화했을 가능성: 지표가 목표가 되면 좋은 지표이길 멈춘다(굿하트의 법칙), 검수자 갱신·다양화와 별도 홀드아웃 검사가 필요', '통과율이 높으니 실력도 반드시 99%다', '민감도가 낮아진 것뿐이니 무시한다', '기저율이 자동으로 올라간 것이다']"
        :answer="0"
        :hints="['테스트만 통과하도록 하드코딩된 코드를 떠올려 보세요. 10부 8장의 오염과도 닮은 구조입니다.']"
        explanation="최적화 압력은 검수자의 구멍을 찾아냅니다. 통과율은 오르는데 진짜 품질은 그대로(또는 악화)일 수 있어요. 검수자도 측정 도구라 10부에서 배운 감정(들키지 않는 편향 찾기)이 필요합니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch6')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">6장 완료! 1막의 무기 셋이 모두 모였습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        사슬의 곱(2장)을 되살리는 다시 뽑기(4장) · 다수결(5장) · 검수(6장)를 갖췄으니 이제 문제는
        전부 <b>얼마나 쓸 것인가</b>입니다. 다음 7장 '생각의 길이'에서는 추론 시점 컴퓨트의
        가격표를 폅니다.
      </p>
      <RouterLink
        to="/ch/ch7"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        7장: 생각의 길이 →
      </RouterLink>
    </div>
  </article>
</template>
