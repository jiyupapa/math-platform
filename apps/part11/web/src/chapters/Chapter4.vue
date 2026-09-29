<script setup lang="ts">
// 4장 — 다시 뽑기: 재시도와 Best-of-N. 곱셈의 저주(워밍업·2장)를 되살리는 첫 번째 길.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import RetryLab from '@/components/RetryLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch4')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">4장 · 되살리는 길 ① · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">다시 뽑기 — 재시도와 Best-of-N</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업의 결론은 우울했습니다. 걸음 90%짜리 일꾼도 10단계 일은 35%. 그런데 사람이 하는
      일을 떠올려 보세요. 한 번에 안 되면? <b>다시 합니다.</b> 이 장은 그 당연한 습관이
      확률적으로 얼마나 강력한지, 그리고 공짜가 아니라는 것까지 계산합니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      곱셈의 저주를 되살리는 첫 번째 길인 <b>"N번 중 한 번이라도" 의 확률 1 − (1 − p)ᴺ</b>을
      직접 조작하고, 첫 성공까지 평균 몇 번 걸리는지(기하분포), 그 대가(뽑기 비용)는 얼마인지까지
      한 세트로 계산합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 실패한 일꾼에게 기회를 한 번 더</h2>
    <ReviewFlag id="ch4-s1" chapter="ch4" label="1. 무대: 실패한 일꾼에게 기회를 한 번 더" />
    <p class="leading-relaxed text-slate-700">
      워밍업의 그 10단계 보고서를 기억하세요? 한 번 시키면 성공률 35%였죠. 팀장님은 포기하는 대신
      이렇게 말합니다. <b>"안 됐으면 다시 시켜."</b> 두 번 시키면? 세 번은? 다섯 번은?
      직관적으로 "언젠간 되겠지" 싶지만, <b>몇 번이면 충분한지</b>는 감이 아니라 계산의
      영역입니다. 실험실에서 직접 돌려 보세요.
    </p>

    <RetryLab />

    <ConceptCard tone="tip" title="핵심 관찰: 실패 쪽에서 세면 곱셈이 우리 편이 된다">
      "N번 중 한 번이라도 성공"을 정면으로 세긴 어렵습니다. 뒤집어서 <b>"N번 전부 실패"</b>를
      세면 그건 워밍업에서 배운 그냥 곱셈이죠: 0.65를 N번 곱한 값. 그래서
      성공률 35%짜리 일도 <b>5번이면 88.4%</b>, <b>10번이면 98.7%</b>가 됩니다.
      워밍업에선 곱셈이 성공률을 깎는 저주였는데, 실패에 적용하면 <b>실패를 깎는 축복</b>이
      돼요. 같은 수학, 반대 방향.
    </ConceptCard>

    <MathBlock expr="P(\text{N번 중 한 번이라도 성공}) \;=\; 1 - \underbrace{(1-p)^N}_{\text{N번 전부 실패할 확률}}" />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="한 번 성공률 35%짜리 일을 5번까지 다시 시키면, 한 번이라도 성공할 확률은?"
      :choices="['약 88% (실패 확률 0.65를 5번 곱한 값을 1에서 뺀다)', '35% × 5 = 175%… 는 말이 안 되니 100%', '35% 그대로', '약 12%']"
      :answer="0"
      :hints="['전부 실패할 확률부터 구해 보세요. 0.65⁵은?']"
      explanation="1 − 0.65⁵ = 1 − 0.116 = 0.884. 확률은 더하면 안 되고(100%를 넘어버리죠), 실패의 곱을 1에서 빼는 게 올바른 계산입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="ch4-s2" chapter="ch4" label="2. 오늘의 발견에 이름표 달기" />

    <ConceptCard tone="note" title="새 용어: 재시도 / Best-of-N / 기하분포">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>재시도</b> (retry). 읽는 법: 리트라이.
          뜻: 실패를 확인하고 <b>같은 일을 다시 시도</b>하는 것. 에이전트 설계의 가장 기본적인
          안전장치입니다.
        </li>
        <li>
          <b>Best-of-N</b> (best-of-N sampling). 읽는 법: 베스트 오브 엔.
          뜻: <b>N개의 답을 한꺼번에 뽑아 놓고 그중 가장 좋은 것을 고르는</b> 전략으로, 이 과정의
          비유로는 <b>제비 다시 뽑기</b>. 재시도가 "순서대로 다시"라면 Best-of-N은 "한꺼번에
          뽑고 고르기"일 뿐, 확률 계산은 1 − (1 − p)ᴺ 으로 같습니다.
        </li>
        <li>
          <b>기하분포</b> (geometric distribution). 뜻: <b>첫 성공이 몇 번째 시도에서 나오는지</b>의 분포. 평균(기대값)은 <b>1/p</b>로,
          p = 35%면 평균 1/0.35 ≈ <b>2.9번째</b>에 첫 성공이 나옵니다. 3부 5장에서 배운
          기대값 계산의 실전 무대예요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인: 직접 계산!</p>
    <StepQuiz
      question="한 번 성공률 p = 35%인 과업을 N = 5번 다시 뽑는다. '한 번이라도 성공'할 확률을 단계별로 구해 보세요."
      :steps="[
        { lhs: '1 - p = ?', answer: 0.65 },
        { lhs: '(1-p)^5 = ?\\ (\\text{소수 셋째 자리 반올림})', answer: 0.116, tolerance: 0.001 },
        { lhs: '1 - (1-p)^5 = ?\\ (\\text{소수 셋째 자리 반올림})', answer: 0.884, tolerance: 0.001 },
      ]"
      explanation="0.65⁵ ≈ 0.116 → 1 − 0.116 = 0.884, 약 88.4%. '전부 실패'의 곱을 1에서 빼는 두 단계예요. 이 계산 하나로 재시도 설계의 절반이 끝납니다."
    />

    <DetailsCard title="➕ 더 깊이: 공짜가 아니다 (수확 체감, 비용, 그리고 대전제)">
      랩의 ③에서 봤듯 이득은 <b>앞쪽에 몰려 있습니다</b>. p = 35%일 때 1→2번은 +22.7%p지만
      5→10번은 다섯 번을 더 뽑고도 +10.3%p뿐(수확 체감). 비용은 정직하게 <b>N에 비례</b>하니
      (10번 뽑기 ≈ 토큰 10,000개) "얼마까지 뽑을까"는 목표 성공률과 예산의 저울질입니다.
      90%가 목표면 N=6, 99%가 목표면 N=11(p=35% 기준). 그리고 정직한 각주 둘. 첫째, 이 공식은
      시도들이 <b>독립</b>일 때 이야기예요. 같은 프롬프트를 그대로 다시 돌리면 같은 실수를
      반복하기 쉽습니다(그래서 실무는 temperature로 답의 다양성을 확보해요. 상관의 수학은
      5장에서). 둘째, 가장 중요한 대전제: <b>성공을 알아볼 수 있어야</b> 합니다. 테스트가 있는
      코딩 과업이 재시도의 모범 무대인 이유죠. 판별이 안 되는 과업은 6장(검수자)의 수학이
      필요합니다.
    </DetailsCard>

    <ReviewFlag id="ch4-ai" chapter="ch4" label="🤖 AI 연결: pass@k라는 이름의 어원이 바로 이 수학" />
    <ConceptCard tone="ai" title="🤖 AI 연결: pass@k라는 이름의 어원이 바로 이 수학">
      코딩 벤치마크 성적표에 적힌 <b>pass@5 = 88%</b> 같은 표기가 정확히 오늘의 공식입니다.
      "5번 뽑으면 한 번이라도 통과할 확률"(정식 정의와 측정법은 11장 성적표에서). 추론 모델이
      어려운 문제에 "여러 번 샘플링"을 쓰는 관행도 같은 뿌리예요. 분포와 기대값의 기초는
      <b><PartLink :part="3" ch="ch5">3부 5장</PartLink></b>에서 쌓은 그대로이고,
      <b><PartLink :part="10" ch="ch6">10부 6장</PartLink></b>의 "반복 측정"과 비교해 보면
      재미있습니다. 거기선 반복의 <b>평균</b>으로 소음을 줄였고, 여기선 반복의
      <b>최선</b>으로 성공을 건집니다. 반복이라는 같은 재료로 다른 요리를 하는 셈이죠.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="다시 뽑기: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="'N번 중 한 번이라도 성공'의 확률을 구하는 올바른 방법은?"
        :choices="['1 − (전부 실패할 확률): 실패의 곱을 1에서 뺀다', '성공률을 N번 더한다', '성공률을 N으로 나눈다', '성공률을 N번 곱한다']"
        :answer="0"
        explanation="성공 쪽은 경우가 많아 세기 어렵지만 '전부 실패'는 곱 하나로 끝납니다. 여사건(반대 사건)으로 뒤집는 확률의 대표 기술이에요."
      />
      <Quiz
        difficulty="easy"
        question="한 번 성공률이 50%인 일을 2번까지 시도하면 한 번이라도 성공할 확률은 몇 %인가? (정수)"
        type="numeric"
        :answer="75"
        :hints="['전부 실패 = 0.5 × 0.5']"
        explanation="1 − 0.5² = 1 − 0.25 = 0.75 → 75%. 50% + 50% = 100%가 아닙니다. 두 번 다 실패하는 경우(25%)가 있으니까요."
      />
      <Quiz
        difficulty="easy"
        question="재시도를 아무리 늘려도 성공률은 100%를 넘을 수 없다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 1 − (1−p)ᴺ 은 N이 커질수록 100%에 다가가기만 할 뿐 넘지 않아요. 확률을 덧셈으로 계산하면 이 상식이 깨지니 곱셈(여사건)으로 계산해야 합니다."
      />
      <Quiz
        difficulty="easy"
        question="기하분포가 답하는 질문은?"
        :choices="['첫 성공이 몇 번째 시도에서 나오나', '한 시도의 성공 확률이 얼마인가', '시도 비용이 얼마인가', 'N개 중 최고 답이 무엇인가']"
        :answer="0"
        explanation="'첫 성공까지의 시도 수'의 분포가 기하분포이고, 평균은 1/p라서 p=35%면 평균 2.9번째에 성공합니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="한 번 성공률 35%인 과업의 첫 성공까지 평균 시도 횟수는 약 몇 회인가?"
        :choices="['약 2.9회 (= 1/0.35)', '약 35회', '정확히 5회', '약 0.35회']"
        :answer="0"
        :hints="['기하분포의 기대값 공식은 1/p.']"
        explanation="1/0.35 ≈ 2.86회. 뒤집으면 예산 감각이 됩니다. 성공 1건을 얻는 데 평균 2.9번 분량의 토큰이 든다는 뜻이죠."
      />
      <Quiz
        difficulty="medium"
        question="p = 35%에서 성공률 90%를 넘기려면 최소 몇 번의 시도가 필요한가? (랩 ④ 참고)"
        type="numeric"
        :answer="6"
        :hints="['N = ⌈log(1−0.9)/log(1−0.35)⌉ (⌈ ⌉는 올림). 로그가 낯설면 본문처럼 0.65를 거듭 곱해 「몇 번째에 10% 아래로 떨어지나」를 세어도 같은 답이 나와요. 랩에서 확인해도 좋아요.']"
        explanation="0.65⁵ = 11.6%라 N=5는 88.4%로 아깝게 모자라고, N=6이 1 − 0.65⁶ = 92.5%로 처음 90%를 넘습니다."
      />
      <Quiz
        difficulty="medium"
        question="Best-of-N과 순차 재시도의 관계로 옳은 것은?"
        :choices="['“한 번이라도 성공” 확률은 1−(1−p)ᴺ으로 같고, 뽑는 방식(한꺼번에 vs 순서대로)이 다르다', 'Best-of-N이 항상 확률이 더 높다', '재시도는 확률이 누적되지 않는다', '둘은 전혀 다른 공식을 쓴다']"
        :answer="0"
        explanation="수학은 같습니다. 실무 차이는 지연(한꺼번에 뽑으면 병렬이라 빠름)과 비용 관리(순차는 성공하면 그만 뽑아 평균 1/p번으로 저렴). 7장(생각의 길이)에서 이 저울질이 다시 나옵니다."
      />
      <Quiz
        difficulty="medium"
        question="같은 프롬프트를 그대로 다시 돌리는 재시도가 공식(1−(1−p)ᴺ)만큼 효과가 안 나는 이유는?"
        :choices="['시도들이 독립이 아니라서(같은 입력은 같은 실수를 반복하기 쉽다)', '공식이 근사라서', '토큰 비용 때문에', 'N이 커서']"
        :answer="0"
        :hints="['공식의 전제가 무엇이었는지 떠올려 보세요.']"
        explanation="독립 가정이 깨지면 곱셈이 무너집니다. 그래서 실무는 temperature를 올리거나 접근을 바꿔 답의 다양성을 확보해요. 상관된 오류의 수학은 5장의 주인공입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="p = 35%에서 N을 1→2로 늘리면 +22.7%p, 5→10으로 늘리면(5번 추가) +10.3%p다. 이 관찰의 이름과 설계 교훈은?"
        :choices="['수확 체감: 이득은 앞쪽 시도에 몰려 있으니, 목표 성공률을 정하고 필요한 N에서 멈추는 것이 예산상 옳다', '수확 체증: N은 클수록 항상 이득이다', '이상 현상: 공식이 틀렸다는 증거다', '우연: 다시 계산하면 달라진다']"
        :answer="0"
        :hints="['남은 실패 확률(0.65ᴺ)이 이미 작아진 뒤에는 깎을 것도 적습니다.']"
        explanation="실패 확률이 지수적으로 줄기 때문에 뒤로 갈수록 깎아낼 실패 자체가 얼마 안 남습니다. '무조건 크게'가 아니라 목표(50/90/99%)를 정해 필요한 N을 역산하는 것, 랩 ④가 그 설계 도구예요."
      />
      <Quiz
        difficulty="hard"
        question="목표는 성공률 99%. 지금 p = 35%라 N = 11(토큰 ≈ 11,000)이 필요하다. 2장에서 배운 병목 개선으로 p를 50%로 올리면?"
        :choices="['N = 7로 줄어 토큰 ≈ 7,000. 걸음(p)을 올리는 투자와 뽑기(N)를 늘리는 비용은 맞바꿀 수 있다', 'N은 그대로 11이다', 'N = 2가 된다', 'p가 올라도 비용은 항상 같다']"
        :answer="0"
        :hints="['0.5를 몇 번 곱해야 0.01 아래로 내려가나요? 0.5⁷ = 0.78%.']"
        explanation="0.5를 거듭 곱하면 7번째에 0.0078로 처음 1% 아래로 내려가요. 로그식 ⌈log 0.01 / log 0.5⌉ = 7 은 그 「몇 번」을 바로 구하는 지름길일 뿐입니다. 같은 99%를 사는 두 가지 방법: 모델·프롬프트를 개선해 p를 올리거나, N을 늘려 뽑거나. 이 교환비를 계산할 수 있는 것이 에이전트 설계의 핵심 감각이고, 캡스톤(12장) 판정서의 단골 항목입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch4')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">4장 완료! 되살리는 길 하나를 손에 넣었습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다시 뽑기는 "성공을 알아볼 수 있다"는 전제가 필요했죠. 다음 5장 '다수결 회의'에서는
        정답을 몰라도 쓸 수 있는 두 번째 길, 여러 답의 투표를 배웁니다.
      </p>
      <RouterLink
        to="/ch/ch5"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        5장: 다수결 회의 →
      </RouterLink>
    </div>
  </article>
</template>
