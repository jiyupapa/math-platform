<script setup lang="ts">
// 7장 — 생각의 길이: 추론 시점 컴퓨트. 2막(전략과 자원) 개막 —
// 같은 예산을 "길게 하나"와 "짧게 여럿 + 다수결"에 배분하는 수학.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ThinkingLab from '@/components/ThinkingLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch7')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 7 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">생각의 길이 — 추론 시점 컴퓨트</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1막(2~6장)에서 곱셈의 저주와 되살리는 세 가지 길을 배웠습니다. 2막의 첫 질문은
      돈 이야기입니다 — <b>같은 문제에 계산을 더 쓰면 더 맞힌다. 그런데 어떻게 쓰는 게
      제일 이득인가?</b>
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      토큰 예산이라는 자원을 <b>더 오래 생각(직렬)</b>과 <b>더 많이 뽑기(병렬)</b>에
      배분하는 감각을 얻습니다 — 문제 난이도와 예산에 따라 승자가 뒤집히는 것을
      직접 목격하고, "생각의 길이"가 왜 <b>매 요청 지불하는 상품</b>이 됐는지 이해합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대 — 두 상사의 지시</h2>
    <ReviewFlag id="ch7-s1" chapter="ch7" label="1. 무대 — 두 상사의 지시" />
    <p class="leading-relaxed text-slate-700">
      까다로운 문제 하나가 AI 일꾼에게 갑니다. 상사 A는 말합니다 — <b>"시간을 줄 테니
      풀이를 길게, 차근차근 써 가면서 고민해."</b> 상사 B는 다르게 말합니다 —
      <b>"셋에게 각자 빨리 풀게 하고 다수결로 정해"</b>(5장의 그 회의).
      누가 옳을까요? 둘 다 같은 자원 — <b>토큰</b> — 을 씁니다. 풀이를 길게 쓰면 토큰이
      들고, 여러 개 뽑아도 토큰이 들죠. 그러니 이 질문은 정확히 <b>예산 배분 문제</b>입니다.
      실험실에서 같은 예산을 두 방식에 나눠 봅시다.
    </p>

    <ThinkingLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 승자는 난이도와 예산이 정한다">
      <b>쉬운 문제 + 예산 8k</b>: 길게 하나 95.0% vs 셋이 투표 <b>99.2%</b> vs 아홉이 투표
      <b>99.7%</b> — 짧은 생각으로도 각자 잘 풀기 때문에, 나눠 뽑아 투표하는 쪽이 혼자의
      천장(95%)을 뚫습니다. <b>어려운 문제 + 예산 8k</b>는 정반대 — 길게 하나 <b>80.5%</b> vs
      셋이 투표 56.1% vs 아홉이 투표 <b>15.4%</b>. 쪼개진 풀이 하나의 정답률이 과반
      아래(33.9%)로 떨어져 다수결이 <b>독</b>이 됩니다(5장의 역전). 그런데 예산을 32k로
      늘리면? 짧은 풀이도 과반(85.1%)을 넘겨 셋이 투표(94.0%)가 길게 하나(90.0%)를
      추월합니다 — <b>승자는 고정돼 있지 않습니다.</b>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="어려운 문제 + 작은 예산에서 '아홉이 투표'가 최악(예산 1k에서 2.9%)이었던 이유는?"
      :choices="['예산을 9로 쪼개면 풀이 하나가 너무 짧아 정답률이 과반 아래 — 다수결이 틀린 답으로 수렴한다(5장의 역전)', '9가 홀수가 아니라서', '투표는 항상 길게 하나보다 나쁘기 때문', '토큰 단가가 9배 비싸져서']"
      :answer="0"
      :hints="['랩에서 어려움 + 1k를 눌렀을 때 뜨는 빨간 경고를 읽어 보세요.']"
      explanation="다수결의 힘은 표 하나가 과반을 넘을 때만 작동합니다(5장). 예산을 쪼개 표 하나의 질이 50% 아래로 내려가면, 표가 많을수록 오히려 확실하게 틀립니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 이름표 달기 — 생각도 계산이다</h2>
    <ReviewFlag id="ch7-s2" chapter="ch7" label="2. 이름표 달기 — 생각도 계산이다" />

    <ConceptCard tone="note" title="새 용어: 추론 시점 컴퓨트 / 추론 사슬 / 직렬·병렬 스케일링">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>추론 시점 컴퓨트</b> (test-time compute) — 읽는 법: 테스트 타임 컴퓨트.
          뜻: 모델을 <b>훈련할 때</b>가 아니라 <b>답할 때</b> 쓰는 계산량 — 이 과정의 비유로는
          <b>생각의 길이</b>. 10부에서 배운 훈련 컴퓨트가 "한 번 짓는 건축비"라면, 이건
          <b>매 요청마다 내는 사용료</b>입니다.
        </li>
        <li>
          <b>추론 사슬</b> (chain of thought) — 읽는 법: 체인 오브 소트.
          뜻: 풀이 과정을 <b>소리 내어 쓰면서</b> 푸는 것 — 긴 풀이일수록 토큰(=돈·시간)이
          더 들지만, 어려운 문제일수록 정확도가 올라갑니다.
        </li>
        <li>
          <b>직렬 vs 병렬 스케일링</b> (sequential vs parallel scaling) — 뜻: 같은 예산을
          <b>한 풀이를 길게</b>(직렬) 쓸까, <b>여러 풀이를 뽑아 고를까</b>(병렬 — 4장 다시
          뽑기·5장 다수결) 하는 두 갈래. 오늘 실험이 보여줬듯 정답은 문제와 예산에 달렸습니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="훈련 컴퓨트(10부)와 추론 시점 컴퓨트(이 장)의 결정적 차이는?"
      :choices="['훈련은 한 번 지불하는 건축비, 추론은 요청마다 내는 사용료 — 도입 후 운영비를 지배하는 건 후자다', '훈련 컴퓨트가 항상 더 싸다', '추론 컴퓨트는 정확도와 무관하다', '둘은 같은 돈을 두 번 세는 것이다']"
      :answer="0"
      explanation="훈련비는 만든 쪽의 자본 지출이고, 추론비는 쓰는 쪽의 운영 지출입니다 — 사내 도입 판단(12장 캡스톤)에서 '요청당 비용 × 하루 요청 수'로 계산하게 될 항목이 바로 이것이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 손으로 계산 — 예산 10k, 셋이 투표하면</h2>
    <ReviewFlag id="ch7-s3" chapter="ch7" label="3. 손으로 계산 — 예산 10k, 셋이 투표하면" />
    <p class="mb-2 leading-relaxed text-slate-700">
      어려운 문제에 예산 10,000토큰. 셋이 투표하면 풀이 하나는 10,000÷3 ≈ <b>3,333토큰</b>이고,
      이 길이에서 모형의 정답률은 <b>p ≈ 0.60</b>입니다. 다수결(과반 2표 이상)의 정답률을
      5장의 공식으로 직접 완성해 보세요.
    </p>

    <StepQuiz
      difficulty="medium"
      question="풀이 하나의 정답률 p = 0.60, 3표 다수결 — 정확히 2개 맞을 확률, 3개 다 맞을 확률, 그리고 합(다수결 정답률)을 차례로."
      :steps="[
        { lhs: '3 \\times 0.6^2 \\times 0.4 = ?', answer: 0.432, tolerance: 0.001 },
        { lhs: '0.6^3 = ?', answer: 0.216, tolerance: 0.001 },
        { lhs: '\\text{다수결 정답률} = ?', answer: 0.648, tolerance: 0.001 },
      ]"
      :hints="['2개 맞는 경우의 수가 3가지(누가 틀리느냐)라서 3을 곱합니다.']"
      explanation="0.432 + 0.216 = 0.648 → 64.8%. 그런데 같은 10,000토큰을 풀이 하나에 다 쓰면 모형상 84.3% — 어려운 문제에서는 길게 하나가 한참 이깁니다. 공식은 5장 그대로, 새로 온 것은 '예산'이라는 제약이에요."
    />

    <DetailsCard title="➕ 더 깊이: 수확 체감, 과잉 생각, 그리고 이 모형의 정직한 한계">
      셋 다 실무 감각에 중요합니다. ① <b>수확 체감</b> — 예산을 2배로 늘려도 정확도는 2배가
      되지 않습니다. 랩의 표에서 예산 축이 1k→2k→4k처럼 <b>배수</b>로 뛰는데도 정확도가
      완만하게 오르죠 — 10부 2장에서 배운 로그 축의 세계입니다. ② <b>과잉 생각</b>
      (overthinking) — 쉬운 문제에 긴 생각은 낭비이고, 실제 모델은 가끔 다 풀어 놓고 생각을
      이어가다 답을 고쳐 틀리기도 합니다. 그래서 실무는 문제 난이도에 따라 생각 길이를
      조절하는 것을 연구해요. ③ <b>이 장의 곡선은 교육용 toy 모형</b>입니다 — 실제 곡선은
      모델·과업마다 다르고, 관행은 벤치마크로 <b>실측</b>해서 배분을 정합니다(실측 점수를
      읽는 눈은 10부, 에이전트 버전은 11장).
    </DetailsCard>

    <ReviewFlag id="ch7-ai" chapter="ch7" label="🤖 AI 연결 — '생각 시간'이 상품이 된 이유" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — '생각 시간'이 상품이 된 이유">
      요즘 추론 모델(reasoning model)들의 요금표에는 "생각 토큰"이 따로 있습니다 — 오늘
      배운 수학이 그대로 상품이 된 것이죠. 배경에는 10부의 이야기가 있습니다: 훈련 컴퓨트를
      키우는 성장(<b><PartLink :part="10" ch="ch2">10부 2장</PartLink></b>의 로그-로그 직선)이
      비싸질수록, <b>답할 때 더 생각하게 하는</b> 두 번째 다이얼이 매력적이 됐어요.
      같은 예산 배분 문제를 훈련에서 풀면 <b><PartLink :part="10" ch="ch4">10부 4장</PartLink></b>의
      Chinchilla(몸집 vs 밥), 추론에서 풀면 오늘의 직렬 vs 병렬입니다 — 그리고 토큰이 곧
      메모리·시간·전기라는 물리적 감각은 <b><PartLink :part="9" ch="ch1">9부 1장</PartLink></b>에서
      쌓은 그대로예요. 다음 장은 병렬의 똑똑한 진화 — 아무거나 여럿이 아니라 <b>갈림길을
      지도처럼 탐색</b>하는 이야기입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="생각의 길이 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="'추론 시점 컴퓨트'의 뜻은?"
        :choices="['모델이 답할 때 쓰는 계산량 — 풀이를 길게 쓰거나 여러 번 뽑는 데 드는 토큰', '모델을 훈련할 때 쓴 GPU 시간', '모델 파라미터의 개수', '데이터셋의 크기']"
        :answer="0"
        explanation="훈련이 끝난 모델이라도 답할 때 계산을 더 쓰면(길게 생각하거나 여러 번 뽑으면) 더 맞힙니다 — 그 계산량이 추론 시점 컴퓨트예요."
      />
      <Quiz
        difficulty="easy"
        question="같은 토큰 예산이라면 '길게 하나'와 '셋이 투표'의 비용은 같다."
        type="truefalse"
        :answer="0"
        explanation="참입니다 — 이 장의 설계 자체가 '같은 돈, 다른 배분'이에요. 셋이 투표하면 풀이 하나가 1/3 길이로 짧아질 뿐 총 토큰은 같습니다."
      />
      <Quiz
        difficulty="easy"
        question="풀이 과정을 써 가면서 푸는 것(추론 사슬)의 실무 이름은?"
        :choices="['chain of thought', 'dropout', 'RAG', 'LoRA']"
        :answer="0"
        explanation="chain of thought(추론 사슬) — 풀이를 소리 내어 쓰게 하면 어려운 문제의 정답률이 오르는 대신 토큰이 더 듭니다. 그 저울질이 이 장의 주제죠."
      />
      <Quiz
        difficulty="easy"
        question="직렬 스케일링과 병렬 스케일링의 짝으로 옳은 것은?"
        :choices="['직렬 = 한 풀이를 길게, 병렬 = 여러 풀이를 뽑아 고르기(다시 뽑기·다수결)', '직렬 = 여러 모델, 병렬 = 한 모델', '직렬 = 훈련, 병렬 = 추론', '직렬 = 쉬운 문제, 병렬 = 어려운 문제']"
        :answer="0"
        explanation="같은 예산을 시간 방향(길게)으로 쓸까 개수 방향(여럿)으로 쓸까의 두 갈래입니다 — 병렬 쪽은 4장(다시 뽑기)과 5장(다수결)에서 이미 배운 도구예요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="쉬운 문제 + 예산 8k에서 승자와 그 이유는?"
        :choices="['아홉이 투표(99.7%) — 짧은 풀이로도 각자 잘 풀어서(87.4%), 투표가 혼자의 천장(95%)을 뚫는다', '길게 하나 — 생각은 길수록 무조건 좋다', '셋이 투표 — 3이 마법의 숫자라서', '전부 동점이다']"
        :answer="0"
        :hints="['랩에서 쉬움 + 8k를 눌러 보세요 — 혼자 풀기의 천장은 몇 %였나요?']"
        explanation="쉬운 문제는 짧은 생각에 정확도가 포화합니다(95% 천장). 남는 예산을 표 수에 쓰면 다수결이 그 천장을 넘어요 — 단, 표들이 독립이라는 가정 위에서요."
      />
      <Quiz
        difficulty="medium"
        question="어려운 문제 + 예산 8k에서는 '길게 하나(80.5%)'가 압승했다. 핵심 이유는?"
        :choices="['어려운 문제는 긴 생각이 필수라, 예산을 쪼개면 풀이 하나의 질이 급락한다(3개면 54.1%, 9개면 33.9%)', '다수결 공식이 어려운 문제에는 적용되지 않아서', '토큰 단가가 문제 난이도에 비례해서', '80.5%가 우연히 나온 값이라서']"
        :answer="0"
        explanation="a(L) 곡선이 천천히 오르는 문제에서는 길이가 곧 실력입니다. 쪼개서 얻는 표 수보다 표 하나의 질 하락이 훨씬 크죠 — 과반 아래로 떨어지면 다수결은 독이 됩니다."
      />
      <Quiz
        difficulty="medium"
        question="어려운 문제에서 예산을 32k로 늘리자 '셋이 투표(94.0%)'가 '길게 하나(90.0%)'를 추월했다. 무엇이 바뀌었나?"
        :choices="['쪼갠 풀이 하나도 과반을 훌쩍 넘는 질(85.1%)이 되자, 다수결의 증폭이 혼자의 천장(90%)을 넘겼다', '길게 하나의 정확도가 떨어졌다', '토큰 단가가 내려갔다', '32가 3의 배수라서']"
        :answer="0"
        :hints="['다수결이 힘을 쓰는 조건(5장)을 떠올려 보세요 — p가 과반을 넘는가?']"
        explanation="예산이 커지면 '쪼개도 충분히 긴' 구간에 들어섭니다. p=85.1%짜리 표 3장의 다수결은 94.0% — 천장이 있는 직렬보다 높이 오릅니다. 승자는 예산 구간마다 다시 정해져요."
      />
      <Quiz
        difficulty="medium"
        question="'과잉 생각(overthinking)'에 대한 올바른 설명은?"
        :choices="['쉬운 문제에 긴 생각은 토큰 낭비이고, 실제 모델은 생각을 이어가다 맞힌 답을 고쳐 틀리기도 한다', '생각은 길수록 항상 좋다는 뜻이다', '토큰을 아끼면 생기는 현상이다', '훈련 컴퓨트를 너무 쓴 상태를 말한다']"
        :answer="0"
        explanation="생각의 길이는 공짜가 아닙니다 — 난이도에 맞는 길이가 있고, 실무는 문제별로 생각 길이를 조절하는 쪽으로 진화하고 있어요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="이 장의 실험에서 '아홉이 투표'가 쉬운 문제 16k+에서 사실상 100%에 닿는다. 이 수치를 실무에 그대로 믿기 어려운 가장 큰 이유는?"
        :choices="['모형이 표들의 독립을 가정하기 때문 — 같은 모델의 표는 상관돼 있어(5장) 실제 증폭은 이론보다 작다', '100%는 수학적으로 불가능한 값이라서', '쉬운 문제는 벤치마크에 없어서', '토큰 단가가 표마다 달라서']"
        :answer="0"
        :hints="['5장의 두 번째 배신 — 같은 신문만 읽은 회의를 떠올려 보세요.']"
        explanation="이 장의 toy 모형은 독립 가정 위의 상한선입니다. 같은 모델이 공유하는 맹점은 표를 늘려도 사라지지 않아요 — 그래서 실무는 이론값 대신 실측(벤치마크·11장)으로 배분을 정합니다."
      />
      <Quiz
        difficulty="hard"
        question="사내 도입 관점 — 하루 1만 요청이 예상되는 업무에 정확도를 위해 요청당 예산을 8k→32k로 올리려 한다. 올바른 판단 틀은?"
        :choices="['늘어나는 정확도(예: 어려움 기준 80.5→94.0%)가 요청당 비용 4배(₩16→₩64, 하루 ₩64만)의 가치가 있는지 — 오류 1건의 비용과 비교해 정한다', '정확도가 오르면 비용은 고려할 필요 없다', '토큰 예산은 항상 최대로 잡는 것이 안전하다', '요청 수는 비용과 무관하다']"
        :answer="0"
        explanation="추론 컴퓨트는 매 요청 지불하는 운영비입니다 — '정확도 1%p의 가격'을 계산하고 오류 1건의 비용과 비교하는 것이 도입 판단의 틀이에요. 캡스톤(12장)에서 이 계산을 실제로 합니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch7')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">7장 완료 — 2막이 열렸습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        생각의 길이를 배분했으니, 다음은 생각의 <b>방향</b>입니다 — 8장 갈림길 지도에서
        트리 위의 탐색(탐욕·빔·되추적)을 배웁니다.
      </p>
      <RouterLink
        to="/ch/ch8"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        8장 — 갈림길 지도 →
      </RouterLink>
    </div>
  </article>
</template>
