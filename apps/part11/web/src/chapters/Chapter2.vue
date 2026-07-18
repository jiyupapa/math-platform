<script setup lang="ts">
// 2장 — 징검다리: 사슬의 수학 (핵심). 워밍업의 p^n 을 "단계마다 다른 정확도"로 일반화하고
// 병목·로그 변환을 배운다. 회수: 3부 3장(독립 곱)·2부 7장(로그).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ChainMathLab from '@/components/ChainMathLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch2')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 2 · 약 40분 · ⭐ 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">징검다리 — 사슬의 수학</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업에서는 모든 걸음이 90%로 똑같았습니다. 현실의 일은 그렇지 않죠 —
      쉬운 단계와 어려운 단계가 섞여 있습니다. 이 장에서는 <b>단계마다 정확도가 다른 사슬</b>의
      수학을 완성하고, 에이전트 개선의 제1원칙 — <b>"병목부터"</b> — 를 숫자로 확인합니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"일의 성공률 = 각 단계 확률의 곱, 그리고 그 곱은 병목이 지배한다."</b>
      같은 노력을 어느 단계에 쓰느냐에 따라 +16.7%p 가 되기도, +0.5%p 가 되기도 하는 것을
      직접 실험하고, 곱의 세계를 합의 세계로 바꾸는 로그 안경을 씁니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대 — 다섯 단계, 다섯 개의 확률</h2>
    <ReviewFlag id="ch2-s1" chapter="ch2" label="1. 무대 — 다섯 단계, 다섯 개의 확률" />
    <p class="leading-relaxed text-slate-700">
      AI 일꾼에게 맡긴 "주간 보고서"를 뜯어 보니 다섯 단계였습니다 — 자료 검색(99%),
      수치 추출(95%), 표 만들기(90%), 요약(99%), 그리고 회사 양식에 맞추는
      <b>형식 맞추기(70%)</b>. 워밍업에서 배운 대로, 각 단계가 독립이라면 일 전체의 성공률은
      전부 <b>곱한 값</b>입니다:
    </p>

    <MathBlock expr="P(\text{일 성공}) = p_1 \times p_2 \times \cdots \times p_n = \prod_{i=1}^{n} p_i" />
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      기호 하나만 짚고 갑시다 — <b>Π</b>(파이, product 의 P)는 "뒤에 오는 것을 <b>전부 곱하라</b>"는
      기호입니다. 3부에서 만난 Σ(시그마 — 전부 더하라)의 곱셈 버전이에요.
    </p>

    <ChainMathLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 사슬은 가장 약한 고리가 지배한다">
      기본 사슬의 성공률은 0.99 × 0.95 × 0.90 × 0.99 × 0.70 = <b>58.7%</b>. 범인은 명백히
      <b>형식 맞추기(70%)</b> 하나입니다. 실험 버튼이 보여준 대비 — 병목을 0.70 → 0.90 으로
      고치면 <b>75.4% (+16.7%p)</b>, 이미 훌륭한 자료 검색을 0.99 → 0.999 로 갈고닦으면
      <b>59.2% (+0.5%p)</b>. 같은 "한 단계 개선"인데 효과는 <b>33배</b> 차이입니다.
      개선은 병목부터 — 이것이 사슬 수학의 첫 실전 규칙이에요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="기본 사슬(58.7%)의 성공률을 가장 크게 갉아먹는 단계는?"
      :choices="['형식 맞추기(70%) — 나머지 네 단계는 모두 90% 이상인데 혼자 낮다', '자료 검색(99%)', '요약(99%)', '다섯 단계가 똑같이 갉아먹는다']"
      :answer="0"
      :hints="['랩에서 🔗 병목 표시가 붙은 단계를 보세요.']"
      explanation="정확도가 가장 낮은 단계 = 병목입니다. 로그 보기를 켜면 형식 맞추기의 막대(감쇠 기여)가 다른 단계의 30배 이상인 것도 확인할 수 있어요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="ch2-s2" chapter="ch2" label="2. 오늘의 발견에 이름표 달기" />

    <ConceptCard tone="note" title="새 용어: 병목 / 곱셈 규칙 일반형 / 로그 변환">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>병목</b> (bottleneck) — 읽는 법: 병목.
          뜻: 사슬에서 <b>정확도가 가장 낮은 단계</b> — 병의 목이 좁으면 물이 그만큼만 나오듯,
          전체 성공률의 <b>상한</b>을 정합니다. 다른 단계가 전부 100%여도 전체는 병목의 p 를 못 넘어요.
        </li>
        <li>
          <b>곱셈 규칙 일반형</b> (multiplication rule) — 읽는 법: 파이 피 아이(Π pᵢ).
          뜻: 독립인 단계들을 전부 성공할 확률은 <b>각 확률의 곱</b> —
          워밍업의 p × p × ⋯ 가 단계마다 다른 p₁ × p₂ × ⋯ 로 일반화된 것.
          3부 3장의 곱셈 규칙 그대로입니다.
        </li>
        <li>
          <b>로그 변환</b> (log transform) — 읽는 법: 로그 변환.
          뜻: 양변에 로그를 씌워 <b>곱을 합으로</b> 바꾸는 기술 — 2부 7장에서 배운
          log(a×b) = log a + log b 성질 덕분입니다. 합이 되면 "누가 얼마나 갉아먹는지"를
          막대처럼 쌓아 비교할 수 있어요.
        </li>
      </ul>
    </ConceptCard>

    <MathBlock expr="\log P = \log p_1 + \log p_2 + \cdots + \log p_n" />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="log(a × b) = log a + log b — 로그는 곱을 합으로 바꾼다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 2부 7장의 그 성질이 여기서 실전 도구가 돼요 — 확률의 곱 사슬을 로그 막대의 합으로 펴서, 단계별 기여를 눈으로 비교합니다."
    />

    <DetailsCard title="➕ 더 깊이: 실무는 왜 전부 로그로 계산할까">
      이유는 두 가지입니다. 첫째, <b>비교</b> — 방금 랩에서 봤듯 −log 막대는 "감쇠 기여"를
      한눈에 보여줍니다(0.70 의 막대는 0.99 의 약 35배). 둘째, <b>컴퓨터의 한계</b> —
      확률을 수백 개 곱하면 값이 10⁻³⁰⁰ 같은 극소수가 되어 부동소수점이 0으로 뭉개 버립니다
      (9부 5장에서 본 언더플로 사고). 그래서 LLM 내부도, 에이전트 평가 코드도 확률 대신
      <b>로그 확률(log-prob)</b>을 더하며 계산해요. 덤 하나 — 균일 사슬로 돌아가면
      "성공률 절반이 되는 단계 수"를 로그로 바로 구할 수 있습니다: 90%짜리 걸음은 7단계,
      <b>99%짜리 걸음도 69단계면 절반 아래</b>로 떨어져요. 사슬이 충분히 길면 어떤 일꾼도
      되살리기(4~6장) 없이는 버티지 못합니다.
    </DetailsCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습 — 단계별로 곱해 보세요</p>
    <StepQuiz
      difficulty="medium"
      question="3단계 사슬 — 계획(90%) → 실행(80%) → 보고(95%). 일 전체의 성공률을 단계별로 계산해 보세요."
      :steps="[
        { lhs: '0.9 \\times 0.8 = ?', answer: 0.72, tolerance: 0.001 },
        { lhs: '0.72 \\times 0.95 = ?', answer: 0.684, tolerance: 0.001 },
        { lhs: '\\text{성공률} = ?\\, \\%', answer: 68.4, tolerance: 0.05 },
      ]"
      explanation="0.9×0.8 = 0.72, 0.72×0.95 = 0.684 → 68.4%. 앞에서부터 하나씩 곱해 나가면 어떤 길이의 사슬도 계산할 수 있습니다 — 그리고 곱할 때마다 값이 줄어드는 것도 느껴 보세요."
    />

    <ReviewFlag id="ch2-ai" chapter="ch2" label="🤖 AI 연결 — 에이전트 팀의 제1원칙, 병목부터 계측하라" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 에이전트 팀의 제1원칙, 병목부터 계측하라">
      실무 에이전트 개발팀은 배포 전에 반드시 <b>단계별 성공률 로깅</b>부터 붙입니다 —
      전체 성공률(58.7%)만 봐서는 어디를 고칠지 알 수 없지만, 단계별로 쪼개면 병목이
      바로 드러나니까요. 오늘 실험이 보여준 대로 개선 효과는 병목에서 33배 크고,
      로그 막대(−log 기여)가 그 우선순위표가 됩니다. 확률의 곱 자체는
      <b><PartLink :part="3" ch="ch3">3부 3장</PartLink></b>(독립 사건의 곱)에서,
      곱을 합으로 펴는 로그의 성질은 <b><PartLink :part="2" ch="ch7">2부 7장</PartLink></b>
      (지수·로그)에서 쌓은 기초 그대로예요. 다음 장부터는 이 사슬을 <b>되살리는</b> 기술로
      들어갑니다 — 그 첫 번째가 도구 호출(3장), 그리고 다시 뽑기(4장)입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="사슬의 수학 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="단계마다 정확도가 다른 사슬에서, 일 전체의 성공률을 구하는 방법은?"
        :choices="['각 단계의 확률을 전부 곱한다 (독립일 때)', '각 단계의 확률을 평균 낸다', '가장 높은 단계의 확률을 쓴다', '단계 수로 나눈다']"
        :answer="0"
        explanation="전부 성공해야 일이 성공하므로 곱셈 규칙 — P = p₁×p₂×⋯×pₙ 입니다. 평균을 쓰면 병목이 숨어 버려요."
      />
      <Quiz
        difficulty="easy"
        question="5단계 중 4단계가 99%라면, 전체 성공률도 99%에 가깝다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 나머지 한 단계가 70%면 전체는 58.7% — 병목 하나가 전체를 끌어내립니다. 사슬은 가장 약한 고리만큼만 강해요."
      />
      <Quiz
        difficulty="easy"
        question="2단계 사슬 — 80% × 50%. 일 전체의 성공률은 몇 %인가? (정수)"
        type="numeric"
        :answer="40"
        :hints="['0.8 × 0.5 를 계산해 보세요.']"
        explanation="0.8 × 0.5 = 0.4 → 40%. 반반짜리 단계가 하나만 있어도 전체가 절반 아래로 떨어집니다."
      />
      <Quiz
        difficulty="easy"
        question="'병목'의 뜻으로 가장 알맞은 것은?"
        :choices="['사슬에서 정확도가 가장 낮은 단계 — 전체 성공률의 상한을 정한다', '가장 시간이 오래 걸리는 단계', '가장 마지막 단계', '가장 자주 실행되는 단계']"
        :answer="0"
        explanation="다른 단계가 전부 100%여도 전체는 병목의 p 를 넘지 못합니다 — 병의 목이 좁으면 물이 그만큼만 나오는 것과 같아요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="기본 사슬(58.7%)에서 같은 '한 단계 개선'의 효과 비교 — 옳은 것은?"
        :choices="['병목 0.70→0.90 은 +16.7%p, 우등생 0.99→0.999 는 +0.5%p — 병목 개선이 33배 크다', '어느 단계를 개선해도 효과는 같다', '우등생 단계를 개선하는 쪽이 더 크다', '개선 효과는 단계 순서에 달려 있다']"
        :answer="0"
        :hints="['랩의 개선 실험 버튼 두 개의 결과를 비교해 보세요.']"
        explanation="58.7→75.4% vs 58.7→59.2% — 개선 노력은 병목에 쓸 때 가장 큰 이자가 붙습니다. 에이전트 튜닝의 제1원칙이에요."
      />
      <Quiz
        difficulty="medium"
        question="확률의 곱 사슬에 로그를 씌우는(log P = Σ log pᵢ) 실전 이유로 가장 알맞은 것은?"
        :choices="['곱이 합이 되어 단계별 기여를 막대처럼 쌓아 비교할 수 있고, 극소수 곱셈의 언더플로도 피한다', '로그를 쓰면 성공률 자체가 올라간다', '계산기가 곱셈을 못 해서', '로그는 항상 정수가 되기 때문']"
        :answer="0"
        explanation="비교(감쇠 기여의 가시화)와 안전(부동소수점 언더플로 회피) — 두 이유 모두입니다. LLM 내부가 로그 확률로 계산하는 이유이기도 해요."
      />
      <Quiz
        difficulty="medium"
        question="기호 Π (파이)의 뜻은?"
        :choices="['뒤에 오는 항을 전부 곱하라 — Σ(전부 더하라)의 곱셈 버전', '원주율 3.14159…', '뒤에 오는 항을 전부 더하라', '최댓값을 고르라']"
        :answer="0"
        explanation="Π는 product 의 머리글자 P 에 해당하는 그리스 문자입니다. P = Πpᵢ 라고 쓰면 '모든 단계의 확률을 곱하라'는 뜻이에요. (원주율 π는 소문자 — 다른 기호입니다.)"
      />
      <Quiz
        difficulty="medium"
        question="병목 단계의 정확도가 0.70일 때, 나머지 단계를 전부 100%로 만들면 전체 성공률은?"
        :choices="['정확히 70% — 병목이 상한이다', '100%가 된다', '85%쯤 된다', '병목과 무관하게 정해진다']"
        :answer="0"
        :hints="['1 × 1 × 1 × 1 × 0.7 = ?']"
        explanation="1을 아무리 곱해도 0.7은 그대로 — 전체 성공률은 병목의 p 를 절대 넘지 못합니다. 그래서 '상한'이라고 불러요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="형식 맞추기(0.70) 단계를 다루는 두 전략 — ㉮ 정확도를 0.90으로 개선(75.4%) ㉯ 자동화 도구로 대체해 단계 자체를 없앰(4단계 사슬). 옳은 비교는?"
        :choices="['㉯가 더 낫다 — 0.99×0.95×0.90×0.99 = 83.8%로, 개선(75.4%)보다 높다. 안 곱하는 것이 최고의 개선이다', '㉮가 항상 더 낫다', '둘 다 58.7%로 같다', '단계를 없애면 성공률이 내려간다']"
        :answer="0"
        :hints="['단계를 없애는 것 = 그 자리에 1.0 을 곱하는 것과 같습니다.']"
        explanation="제거는 p를 1.0으로 만드는 궁극의 개선입니다 — 83.8% > 75.4%. 실무에서도 '이 단계가 꼭 필요한가'가 '더 잘하게 만들 수 있나'보다 먼저 묻는 질문이에요."
      />
      <Quiz
        difficulty="hard"
        question="로그 보기에서 형식 맞추기(0.70)의 −log₁₀ 막대는 0.155, 자료 검색(0.99)은 0.0044다. 올바른 해석은?"
        :choices="['형식 맞추기의 감쇠 기여가 약 35배 — 전체 성공률 손실의 대부분이 이 한 단계에서 나온다', '0.155는 0.0044보다 작으므로 자료 검색이 병목이다', '막대 길이는 성공률과 무관하다', '두 단계의 기여는 비슷하다']"
        :answer="0"
        :hints="['−log 막대가 길수록 그 단계가 성공률을 많이 깎습니다 — 0.155 ÷ 0.0044 ≈ ?']"
        explanation="0.155 / 0.0044 ≈ 35배. 로그 막대는 '어디부터 고칠까'의 우선순위표가 됩니다 — 실무 에이전트 대시보드가 단계별 로그 기여를 그리는 이유예요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch2')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">2장 완료 — 사슬의 수학이 손에 잡혔습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        성공률은 곱이고, 곱은 병목이 지배하고, 로그가 그것을 보여줍니다. 다음은 3장 —
        AI 일꾼이 언제 검색·계산기를 집어 드는지, 도구 호출의 수학입니다.
      </p>
      <RouterLink
        to="/ch/ch3"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        3장 — 도구를 드는 손 →
      </RouterLink>
    </div>
  </article>
</template>
