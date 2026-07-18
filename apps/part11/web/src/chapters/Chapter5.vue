<script setup lang="ts">
// 5장 — 다수결 회의: self-consistency. 되살리는 두 번째 길 — 이항 다수결의 힘과
// 두 가지 전제(p>50%, 표의 독립)를 해석적 계산기로 확인한다.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import VoteLab from '@/components/VoteLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch5')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">5장 · 35분</p>
    <h1 class="mb-4 text-3xl font-bold">다수결 회의 — self-consistency</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      4장의 다시 뽑기에는 전제가 하나 숨어 있었죠 — <b>어느 뽑기가 성공인지 알아볼 수 있어야</b>
      한다는 것. 그런데 답을 알아볼 수 없다면? 답들끼리 <b>투표</b>를 시키면 됩니다.
      이번 장은 되살리는 두 번째 길, 다수결의 수학입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"70%짜리 풀이 다섯을 모으면 84%가 된다 — 단, 표가 과반을 넘고(50%↑) 서로
      독립일 때만."</b> 다수결의 힘과 두 가지 전제 조건을 계산으로 확인합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대 — 답이 3:2로 갈렸다</h2>
    <ReviewFlag id="ch5-s1" chapter="ch5" label="1. 무대 — 답이 3:2로 갈렸다" />
    <p class="leading-relaxed text-slate-700">
      에이전트에게 수학 문제를 하나 맡기고, 같은 문제를 <b>다섯 번</b> 풀게 했습니다.
      답이 갈립니다 — 세 번은 <b>42</b>, 두 번은 <b>38</b>. 어느 쪽을 믿어야 할까요?
      직감은 "많이 나온 42"라고 말합니다. 그 직감이 수학적으로 얼마나 옳은지,
      그리고 <b>언제 배신하는지</b>를 실험으로 확인해 봅시다.
    </p>

    <VoteLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 다수결은 확률을 증폭하는 회의다">
      한 표가 <b>70%</b>일 때 — 5표 다수결은 <b>83.7%</b>, 9표는 <b>90.1%</b>, 15표는
      <b>95.0%</b>. 표가 늘수록 과반이 정답에 모일 확률이 커집니다(<b>큰 수의 법칙</b>의
      투표 버전). 그런데 두 가지 배신이 있었죠 — ① 한 표가 <b>50% 미만</b>이면 다수결은
      틀린 답으로 수렴하고(40% → 5표 <b>31.7%</b>), ② 표끼리 <b>닮으면</b>(상관) 이득이
      깎입니다(ρ=0.5면 83.7% → <b>76.8%</b>). 회의는 머릿수가 아니라 <b>독립적인 과반</b>이
      만드는 겁니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="한 표의 정답률이 70%일 때, 5표 다수결의 정답률은 약 몇 %였나?"
      :choices="['약 84% — 한 표(70%)보다 14%p 가까이 높아진다', '70% 그대로', '약 50%', '100%']"
      :answer="0"
      :hints="['랩의 ② 에서 5표를 눌러 보세요.']"
      explanation="83.7% — 다섯 중 셋 이상이 정답일 확률(이항 합)입니다. 개별 풀이보다 다수결이 눈에 띄게 강해지죠."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 다수결의 수학 — 이항분포의 재등장</h2>
    <ReviewFlag id="ch5-s2" chapter="ch5" label="2. 다수결의 수학 — 이항분포의 재등장" />
    <p class="leading-relaxed text-slate-700">
      표 k개 중 <b>과반(⌈k/2⌉ 이상)</b>이 정답일 확률은, 3부 5장에서 만난
      <b>이항분포</b>의 합입니다:
    </p>
    <MathBlock expr="P(\text{다수결 정답}) = \sum_{i=\lceil k/2 \rceil}^{k} \binom{k}{i} p^i (1-p)^{k-i}" />
    <p class="leading-relaxed text-slate-700">
      기호를 풀면 — <b>⌈k/2⌉</b>(읽는 법: k/2의 올림)는 과반이 되는 최소 표 수,
      <b>C(k, i)</b>(읽는 법: k 콤비네이션 i)는 k표 중 i표를 고르는 경우의 수,
      <b>pⁱ(1−p)ᵏ⁻ⁱ</b>는 정확히 i표가 정답일 확률입니다. 5표에서 정답이 3표·4표·5표인
      경우를 전부 더하면 83.7%가 나오죠. 표는 <b>홀수</b>로 뽑습니다 — 짝수면 동수(3:3)가
      나서 다수결이 결정을 못 내리거든요.
    </p>

    <ConceptCard tone="note" title="새 용어: 자기 일관성 / 이항 다수결 / 상관된 오류">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>자기 일관성</b> (self-consistency) — 읽는 법: 셀프 컨시스턴시.
          뜻: 같은 문제를 여러 번 풀게 해(풀이 경로를 다르게) <b>가장 많이 나온 답을
          채택</b>하는 기법 — 이 과정의 비유로는 <b>다수결 회의</b>. 실무 논문 용어
          그대로예요.
        </li>
        <li>
          <b>이항 다수결</b> (binomial majority) — 읽는 법: 이항 다수결.
          뜻: 독립인 표 k개 중 과반이 정답일 확률 — 위 공식. 3부 5장의 이항분포가
          에이전트 무대로 돌아온 것.
        </li>
        <li>
          <b>상관된 오류</b> (correlated errors) — 읽는 법: 상관된 오류.
          뜻: 같은 원인 때문에 <b>같이 틀리는</b> 오류. 같은 신문만 읽은 아홉 명의 회의는
          아홉 표가 아니라 사실상 한 표입니다 — 같은 모델이 뽑은 답들도 마찬가지예요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="랩의 ③에서 상관 다이얼 ρ를 올리면 다수결 정답률은 어떻게 되나?"
      :choices="['한 표의 정답률 쪽으로 깎여 내려간다 — ρ=1이면 회의가 그냥 한 표와 같다', '더 올라간다', '변하지 않는다', '0%가 된다']"
      :answer="0"
      :hints="['전원이 한 표를 복사한다면 그 회의의 정답률은 누구의 정답률일까요?']"
      explanation="표끼리 닮을수록 '독립적인 과반'이라는 다수결의 엔진이 꺼집니다 — ρ=1이면 다섯 표가 사실상 한 표(70%)예요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 손으로 한 번 — 3표 다수결 계산</h2>
    <ReviewFlag id="ch5-s3" chapter="ch5" label="3. 손으로 한 번 — 3표 다수결 계산" />
    <p class="mb-2 leading-relaxed text-slate-700">
      70%짜리 표 <b>3개</b>의 다수결(2표 이상 정답)을 직접 계산해 봅시다.
    </p>
    <StepQuiz
      question="정답률 70%짜리 표 3개의 다수결(2표 이상 정답)이 정답일 확률은? (소수로)"
      difficulty="medium"
      :steps="[
        { lhs: 'P(\\text{정확히 2표}) = 3 \\times 0.7^2 \\times 0.3', answer: 0.441, tolerance: 0.001 },
        { lhs: 'P(\\text{3표 전부}) = 0.7^3', answer: 0.343, tolerance: 0.001 },
        { lhs: 'P(\\text{다수결 정답}) = 0.441 + 0.343', answer: 0.784, tolerance: 0.001 },
      ]"
      :hints="['2표 정답인 경우는 (○○✗)(○✗○)(✗○○) 세 가지 — 그래서 3을 곱합니다.']"
      explanation="0.784 → 78.4% — 한 표(70%)보다 8.4%p 상승. 표를 5개로 늘리면 83.7%, 15개면 95.0%까지 올라갑니다(단, 독립일 때)."
    />

    <DetailsCard title="➕ 더 깊이: 250년 된 정리와 두 가지 배신">
      "과반보다 나은 개인이 모이면 집단은 개인보다 낫다" — 1785년 콩도르세(Condorcet)의
      <b>배심원 정리</b>가 이 장의 수학적 원형입니다. 정리가 약속하는 것: p &gt; 0.5이고
      표가 독립이면, 표 수가 늘수록 다수결 정답률은 <b>1로 수렴</b>합니다. 그리고 정리가
      경고하는 것도 똑같이 중요해요 — ① p &lt; 0.5면 정확히 반대로 <b>0으로 수렴</b>합니다
      (못하는 일꾼 15명의 다수결은 5명보다 나쁩니다 — 랩에서 확인해 보세요).
      ② 독립이 깨지면 표 수를 아무리 늘려도 <b>유효 표 수</b>는 제자리입니다.
      마지막 하나 — 다수결은 <b>답이 하나로 수렴하는 문제</b>(수학·객관식·코드 테스트 통과)
      에서만 강력합니다. 열린 글쓰기처럼 "가장 많이 나온 답"이 정의되지 않는 일엔
      쓸 수 없어요 — 그런 일은 6장의 검수자가 맡습니다.
    </DetailsCard>

    <ReviewFlag id="ch5-ai" chapter="ch5" label="🤖 AI 연결 — 수학 벤치마크 점수를 끌어올린 그 기법" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 수학 벤치마크 점수를 끌어올린 그 기법">
      self-consistency는 실무에서 가장 값싸게 성능을 올리는 손잡이 중 하나입니다 —
      추론 모델에게 같은 수학 문제를 수십 번 풀게 하고 다수결을 시키면 벤치마크 점수가
      몇 %p씩 오르는 것이 표준 관행이 됐죠(논문들이 "maj@k"라고 표기하는 그것).
      공짜는 아닙니다 — 표 하나가 <b>풀이 전체의 토큰 비용</b>이라, 15표 다수결은 비용도
      15배입니다("더 많이 생각"의 값어치는 7장에서 저울에 답니다). 수학의 뿌리는
      <b><PartLink :part="3" ch="ch5">3부 5장</PartLink></b>(이항분포)과
      <b><PartLink :part="3" ch="ch7">3부 7장</PartLink></b>(큰 수의 법칙 — 표가 많을수록
      과반이 안정)이고, "닮은 표는 한 표"라는 경고는 10부 9장의 <b>일치하는 오심</b>과
      같은 철학입니다 — 9장(멀티에이전트)에서 팀 단위로 다시 만나요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="다수결 회의 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="self-consistency(다수결 회의)의 방법으로 알맞은 것은?"
        :choices="['같은 문제를 여러 번 풀게 하고 가장 많이 나온 답을 채택한다', '가장 긴 답을 채택한다', '첫 번째 답을 무조건 믿는다', '모든 답을 이어 붙인다']"
        :answer="0"
        explanation="풀이 경로가 달라도 정답은 한 곳으로 모이는 경향을 이용해, 답들끼리 투표를 시키는 기법입니다."
      />
      <Quiz
        difficulty="easy"
        question="한 표의 정답률이 50%보다 낮아도, 표를 많이 모으면 다수결은 항상 좋아진다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. p<0.5면 과반은 틀린 답에 모입니다 — 40%짜리 표 5개의 다수결은 31.7%로 오히려 나빠져요."
      />
      <Quiz
        difficulty="easy"
        question="한 표 70%일 때 5표 다수결의 정답률은 약 몇 %인가? (정수로 반올림)"
        type="numeric"
        :answer="84"
        :hints="['랩에서 확인한 값 — 83.7%를 반올림하세요.']"
        explanation="83.7% ≈ 84%. 3표 이상이 정답일 확률을 이항분포로 더한 값입니다."
      />
      <Quiz
        difficulty="easy"
        question="투표자 수를 3, 5, 9처럼 홀수로 하는 이유는?"
        :choices="['짝수면 동수(예: 3:3)가 나서 다수결이 결정을 못 내릴 수 있어서', '홀수가 계산이 빨라서', '홀수 표가 항상 더 정확해서', '전통이라서']"
        :answer="0"
        explanation="동수 회피용입니다 — 실무 구현도 표 수를 홀수로 두거나 동수일 때의 규칙을 따로 정해요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="다수결이 특히 강력한 과업 유형은?"
        :choices="['수학·객관식·코드처럼 답이 하나로 수렴하고 같은 답인지 비교할 수 있는 일', '열린 에세이 쓰기', '브레인스토밍', '그림 그리기']"
        :answer="0"
        :hints="['“가장 많이 나온 답”이 정의되려면 무엇이 필요할까요?']"
        explanation="답들을 같다/다르다로 묶을 수 있어야 투표가 성립합니다. 답이 수렴하지 않는 열린 과업은 6장의 검수자(품질 판정)가 맡아요."
      />
      <Quiz
        difficulty="medium"
        question="p=0.7에서 표를 5개 → 15개로 늘리면 다수결 정답률은?"
        :choices="['83.7% → 95.0% — 오르지만 표 하나당 이득은 점점 줄어든다(수확 체감)', '83.7%에서 변하지 않는다', '100%가 된다', '오히려 떨어진다']"
        :answer="0"
        explanation="큰 수의 법칙처럼 표가 많을수록 과반이 안정되지만, 상승 폭은 체감합니다 — 그리고 표 하나가 풀이 하나의 토큰 비용이라는 걸 잊지 마세요."
      />
      <Quiz
        difficulty="medium"
        question="상관 모형(ρ=0.5, p=0.7, 5표)에서 다수결 정답률이 83.7%가 아니라 76.8%였던 이유는?"
        :choices="['절반의 확률로 전원이 한 표를 복사해 — 그만큼은 사실상 1표 회의(70%)라서', '표가 홀수라서', '이항분포 공식이 근사라서', '70%가 50%보다 작아서']"
        :answer="0"
        :hints="['ρ·(한 표) + (1−ρ)·(독립 다수결) — 복사가 섞이면 어느 쪽으로 끌려갈까요?']"
        explanation="0.5×70% + 0.5×83.7% = 76.8%. 닮은 표는 머릿수를 늘려도 유효 표 수를 늘리지 못합니다."
      />
      <Quiz
        difficulty="medium"
        question="같은 문제를 5번 풀렸더니 답이 42(3표) vs 38(2표)로 갈렸다. 다수결 관점의 올바른 해석은?"
        :choices="['42를 채택하되, 3:2는 아슬아슬한 과반이므로 확신이 필요하면 표를 더 뽑는다', '갈렸으니 둘 다 버린다', '나중에 나온 38이 더 최신이라 옳다', '평균인 40을 답한다']"
        :answer="0"
        explanation="다수결의 답은 42지만, 5표 중 3표는 안정적 과반이 아닙니다 — 표를 9·15개로 늘려 과반이 굳는지 보는 것이 정석이에요(평균 40은 '수렴하는 답' 구조를 버리는 오답)."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="같은 모델에서 temperature만 바꿔 15표를 뽑았다. 이 다수결의 함정은?"
        :choices="['같은 모델의 표는 같은 맹점을 공유해(상관된 오류) 유효 표 수가 15보다 훨씬 작다 — 이론값 95%를 믿으면 안 된다', 'temperature를 바꾸면 정답률이 0이 된다', '15가 홀수가 아니라서 무효다', '함정이 없다 — 항상 이론값이 나온다']"
        :answer="0"
        :hints="['같은 신문만 읽은 15명의 회의를 떠올려 보세요 — 10부 9장의 “일치하는 오심”과 같은 구조입니다.']"
        explanation="모델이 공유하는 오개념은 온도를 바꿔도 반복됩니다 — 일치가 정답의 증거가 아닐 수 있어요. 상관을 낮추려면 프롬프트·접근법·모델을 다양화합니다(9장 멀티에이전트의 출발점)."
      />
      <Quiz
        difficulty="hard"
        question="정답률 45%짜리 단계가 낀 과업에 '15표 다수결'을 도입하자는 제안이 나왔다. 올바른 판단은?"
        :choices="['그 단계는 p<0.5라 다수결이 틀린 답으로 수렴한다(45%→5표 40.7%) — 먼저 걸음 정확도를 50% 위로 끌어올리거나 검수자(6장)를 설계해야 한다', '표가 많으니 무조건 좋아진다', '45%면 충분히 높다', '다수결 대신 동전을 던진다']"
        :answer="0"
        :hints="['콩도르세 정리의 경고 — p<0.5면 표가 늘수록 어디로 수렴하나요?']"
        explanation="p<0.5에서 다수결은 증폭기가 아니라 확정기입니다 — 틀린 쪽을 확정해요. 45%·5표는 40.7%, 15표는 더 나쁩니다. 이럴 땐 개별 정확도 개선이나 검수자 결합(6장)이 먼저입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch5')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">5장 완료 — 되살리는 두 번째 길을 얻었습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다시 뽑기(4장) → 다수결(5장) — 다음은 세 번째이자 가장 강력한 길,
        6장 검수자: "검수를 통과한 답은 얼마나 믿을 수 있나"를 베이즈로 계산합니다.
      </p>
      <RouterLink
        to="/ch/ch6"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        6장 — 검수자 →
      </RouterLink>
    </div>
  </article>
</template>
