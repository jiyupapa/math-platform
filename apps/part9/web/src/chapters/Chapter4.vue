<script setup lang="ts">
// ch4 — 눈금 사이의 오차: 반올림과 누적. 티끌(반올림 오차)이 계산에서 어떻게 행동하나 —
// 순서 의존성·흡수·뺄셈 재앙, 그리고 GPU 병렬 합산 재현성(필수 소주제).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import RoundingDriftLab from '@/components/RoundingDriftLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch4')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">4장 · 저장 — 칸의 해부 ③</p>
    <h1 class="mb-4 text-3xl font-bold">눈금 사이의 오차 — 반올림과 누적</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      3장에서 티끌의 <b>크기</b>를 쟀습니다(값 대비 약 2⁻²⁴). 티끌 하나는 무해해요 —
      그런데 LLM 은 한 번의 답변에 이런 계산을 <b>수십억 × 수천 번</b> 합니다.
      오늘은 티끌이 계산 속에서 어떻게 <b>행동</b>하는지 — 언제 전멸하고, 언제 쌓이고,
      언제 답의 몸통을 잡아먹는지 봅니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지 사건 현장을 목격합니다 — ① 더하는 <b>순서</b>만 바꿔도 답이 달라진다(결합법칙
      사망), ② 큰 수 옆의 작은 수는 통째로 사라진다(<b>흡수</b>), ③ 가까운 두 수의 차는
      상대 오차가 폭발한다(<b>뺄셈 재앙</b>). 그리고 이것이 "같은 모델이 같은 질문에
      미세하게 다른 답을 내는" 실전 미스터리와 어떻게 이어지는지까지.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대 — 1 근처의 눈금 간격, 머신 엡실론</h2>
    <ReviewFlag id="ch4-s1" chapter="ch4" label="1. 무대 — 1 근처의 눈금 간격, 머신 엡실론" />
    <p class="leading-relaxed text-slate-700">
      3장 관찰기에서 1 근처의 fp32 눈금 간격은 2⁻²³ ≈ 1.19×10⁻⁷ 이었죠. 이 값에는 이름이
      있습니다 — <b>머신 엡실론</b>(machine epsilon), "이 자가 1 근처에서 구분할 수 있는
      가장 작은 차이"예요. 오늘의 모든 사건은 이 간격 하나에서 출발합니다: 간격의 절반
      (약 6×10⁻⁸)보다 작은 변화는 <b>반올림이 도로 제자리로 돌려놓으니까요.</b>
      이제 사건 현장으로 갑시다.
    </p>

    <RoundingDriftLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 계산은 맞고, 반올림 지점이 다르다">
      세 실험의 공통 범인은 하나 — <b>매 연산 뒤의 반올림</b>입니다. 순서를 바꾸면 중간
      결과가 달라지고, 중간 결과가 달라지면 <b>어디서 얼마나 반올림하는지</b>가 달라져요
      (실험 ①의 0 vs 1). 티끌보다 성긴 눈금 위에 앉은 큰 수는 티끌을 흡수하고(실험 ②의 전멸),
      뺄셈은 앞자리를 지워 <b>남아 있던 티끌을 몸통으로 승격</b>시킵니다(실험 ③).
      전부 3장의 "창문과 눈금" 구조에서 필연으로 따라 나오는 행동들이에요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="실험 ①에서 (1 + 10⁸) − 10⁸ 이 0이 된 이유는?"
      :choices="['중간 결과 100,000,001을 담을 눈금이 없어(간격 8) 100,000,000으로 반올림됐기 때문', '뺄셈 연산에 버그가 있어서', '10⁸이 fp32에 저장되지 않는 수라서', '컴퓨터가 결합법칙을 모르기 때문']"
      :answer="0"
      :hints="['영수증의 어느 줄에서 반올림이 일어났는지 보세요.']"
      explanation="1은 10⁸ 옆에서 흡수됐습니다(그 구간 눈금 간격 8 > 1). 반면 순서를 바꾸면 10⁸ − 10⁸ = 0이 먼저 계산돼 1이 무사하죠 — 순서가 반올림 지점을 바꾼 겁니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 사건들에 이름표 달기</h2>
    <ReviewFlag id="ch4-s2" chapter="ch4" label="2. 사건들에 이름표 달기" />

    <ConceptCard tone="note" title="새 용어: 머신 엡실론 / 흡수 / 파국적 상쇄">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>머신 엡실론</b> (machine epsilon, ε) — 읽는 법: 머신 엡실론.
          뜻: 1 근처의 눈금 간격 — fp32 는 2⁻²³ ≈ 1.19×10⁻⁷, fp64 는 2⁻⁵² ≈ 2.2×10⁻¹⁶.
          그 자의 <b>상대 정밀도를 대표하는 한 수</b>입니다.
        </li>
        <li>
          <b>흡수</b> (absorption) — 읽는 법: 앱소션. 뜻: 큰 수에 더해진 작은 수가
          (그 구간 눈금 간격의 절반보다 작아서) <b>반올림으로 통째로 사라지는 것</b> —
          워밍업 "1 삼키기"의 공식 이름. 실험 ②에서 티끌 백만 개가 전멸한 그 사건.
        </li>
        <li>
          <b>파국적 상쇄</b> (catastrophic cancellation) — 읽는 법: 캐터스트로픽 캔슬레이션.
          뜻: 가까운 두 수의 뺄셈에서 앞자리(몸통)가 지워지고 <b>입력의 티끌이 답의 몸통이
          되는 것</b> — 절대 오차는 안 커지는데 <b>상대 오차가 폭발</b>합니다(실험 ③의 19%→100%).
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="fp32에서 1.0 에 더했을 때 흡수되지 않고 살아남는 가장 작은 크기 급은?"
      :choices="['머신 엡실론의 절반(약 6×10⁻⁸)을 넘는 크기', '어떤 크기든 살아남는다', '1보다 큰 수만 살아남는다', '10⁻²⁰ 이상이면 살아남는다']"
      :answer="0"
      :hints="['반올림은 가장 가까운 눈금으로 — 간격의 절반이 분수령입니다.']"
      explanation="1 근처 눈금 간격이 ε ≈ 1.19×10⁻⁷ 이라, 그 절반을 넘어야 이웃 눈금으로 넘어갈 수 있습니다. 실험 ②의 티끌(10⁻⁸)은 그 절반의 6분의 1이라 매번 제자리로 반올림됐어요."
    />

    <ConceptCard tone="note" title="티끌 100만 개는 얼마나 쌓일까 — 또 √n">
      순서를 잘 지켜 흡수를 피해도, 연산마다 ±티끌의 <b>반올림 오차 자체</b>는 남습니다.
      티끌의 부호가 제멋대로(때론 올림, 때론 내림)라면 이 누적은
      <b>3부 7장</b>에서 본 <b>랜덤워크</b> —
      n번 더한 합의 <b>값 대비 오차(상대 오차)</b>가 n이 아니라 <b>대략 √n × ε 으로</b>
      자랍니다. 100만 번을 더해도 상대 오차는 ε의 100만 배가 아니라 √100만 = <b>천 배
      수준</b>(fp32 로 0.01% 안팎) — 그 덕에 fp 계산이 실용이 되는 거예요. 미니배치의
      1/√B(8부 3장), 표본 평균의 1/√n(3부) — 시리즈에서 다섯 번째로 만나는 √n 가족입니다.
      (노트북에서 실측으로 확인!)
    </ConceptCard>

    <DetailsCard title="➕ 더 깊이: 티끌 저금통 — Kahan 합산과 pairwise 합산">
      실험 ②의 교훈("작은 것끼리 먼저")을 알고리즘으로 만든 것들이 있습니다.
      <b>Kahan 합산</b>은 매 덧셈에서 <b>잃어버린 티끌을 따로 장부에 적어 뒀다가</b> 다음
      덧셈에 되돌려주는 5줄짜리 재주 — 순진한 합산보다 오차가 수백 배 작아집니다(노트북에서
      직접 만들어요). NumPy 의 <code>sum</code> 이 쓰는 <b>pairwise 합산</b>은 배열을 반씩
      쪼개 짝끼리 더하는 방식 — 큰 수 하나가 독주하는 상황 자체를 피하죠. 요점: 라이브러리
      제작자들은 이 장의 사건들을 <b>이미 알고 설계에 반영</b>해 뒀다는 것.
    </DetailsCard>

    <ReviewFlag id="ch4-ai" chapter="ch4" label="🤖 AI 연결 — 같은 모델, 미세하게 다른 답의 수치적 범인" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 같은 모델, 미세하게 다른 답의 수치적 범인">
      GPU 는 수천 개의 코어가 합산을 <b>덩어리로 나눠 계산한 뒤 합류</b>시킵니다 — 스케줄에
      따라 실행마다 <b>더하는 순서가 달라질 수 있고</b>, 오늘 실험 ①이 보여줬듯 순서가 다르면
      반올림 지점이 달라져 결과의 끝자리가 흔들려요. 그래서 temperature 를 0으로 둬도
      로그확률의 티끌이 아슬아슬한 1·2위 토큰의 순위를 뒤집어 <b>같은 질문에 다른 답</b>이
      나올 수 있습니다(하드웨어·배치가 바뀌면 더더욱). 완전한 재현이 필요한 실험에서
      결정적(deterministic) 모드를 따로 켜는 이유 — 그 비용은 속도입니다.
      티끌 누적의 통계는 <b><PartLink :part="3" ch="ch7">3부 7장</PartLink></b>의 √n,
      같은 무늬의 노이즈를 <b><PartLink :part="8" ch="ch3">8부 3장</PartLink></b>(미니배치
      1/√B)에서 이미 만났습니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="반올림과 누적 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="fp32의 머신 엡실론(1 근처 눈금 간격)은 대략?"
        :choices="['약 1.2×10⁻⁷ (= 2⁻²³)', '약 2.2×10⁻¹⁶ (= 2⁻⁵²)', '정확히 0', '약 0.001']"
        :answer="0"
        explanation="가수 23비트가 만드는 1 근처 간격 2⁻²³입니다. 2⁻⁵²은 fp64(워밍업의 자)의 엡실론이에요."
      />
      <Quiz
        difficulty="easy"
        question="부동소수점 덧셈에서는 (a + b) + c 와 a + (b + c) 가 항상 같다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 실험 ①에서 0 vs 1 — 순서가 중간 결과를, 중간 결과가 반올림 지점을 바꿉니다. 결합법칙은 fp 세계에서 성립하지 않아요."
      />
      <Quiz
        difficulty="easy"
        question="큰 수에 더한 작은 수가 반올림으로 통째로 사라지는 현상의 이름은?"
        :choices="['흡수 (absorption)', '파국적 상쇄', '오버플로', '정규화']"
        :answer="0"
        explanation="워밍업의 1 삼키기, 실험 ②의 티끌 전멸이 전부 흡수입니다 — 그 구간 눈금 간격의 절반보다 작으면 제자리로 반올림돼요."
      />
      <Quiz
        difficulty="easy"
        question="실험 ①에서 fp32로 계산한 (1 + 10⁸) − 10⁸ 의 값은? (숫자로)"
        type="numeric"
        :answer="0"
        explanation="1이 10⁸ 옆에서 흡수돼 0이 됩니다 — 순서를 바꾸면 1이 나오죠."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="수백만 개의 작은 값들과 큰 값 하나를 모두 더해야 한다. 오차를 줄이는 순서는?"
        :choices="['작은 값들끼리 먼저 더해 몸집을 키운 뒤 마지막에 큰 값과 합친다', '큰 값에서 시작해 작은 값을 하나씩 더한다', '순서는 결과에 아무 영향이 없다', '큰 값을 두 번 더했다 한 번 뺀다']"
        :answer="0"
        :hints="['실험 ②에서 티끌이 전멸한 쪽과 살아남은 쪽의 차이를 떠올리세요.']"
        explanation="작은 값들끼리는 서로 비슷한 크기라 흡수가 없고, 모여서 눈금 간격을 넘는 몸집이 되면 큰 값 옆에서도 살아남습니다 — 실험 ②의 1.0 vs 1.00999."
      />
      <Quiz
        difficulty="medium"
        question="파국적 상쇄(뺄셈 재앙)의 정확한 서술은?"
        :choices="['가까운 두 수의 차에서 앞자리가 지워져, 입력에 있던 작은 반올림 티끌이 답의 상대 오차를 지배하게 된다', '뺄셈을 하면 항상 오버플로가 난다', '뺄셈 연산 자체가 덧셈보다 부정확하게 구현돼 있다', '음수가 나오면 컴퓨터가 절대값을 취해 버린다']"
        :answer="0"
        explanation="뺄셈 연산 자체는 정확합니다 — 문제는 몸통이 상쇄된 뒤 남는 것이 입력의 티끌뿐이라는 것. 절대 오차는 그대로인데 상대 오차가 폭발해요(실험 ③의 19% → 100%)."
      />
      <Quiz
        difficulty="medium"
        question="부호가 제멋대로인 반올림 티끌이 n번 쌓일 때, 합의 값 대비 오차(상대 오차)의 크기 급은?"
        :choices="['대략 √n × ε — 랜덤워크(3부 7장)', '정확히 n × ε', '항상 0 — 티끌은 상쇄된다', '2ⁿ × ε']"
        :answer="0"
        :hints="['앞으로 반, 뒤로 반 걷는 술취한 걸음이 n걸음 뒤 어디쯤에 있었죠?']"
        explanation="랜덤워크의 표준편차가 √n으로 자라는 것과 같은 계산입니다(값 대비·상대 기준). 100만 번을 더해도 상대 오차는 ε의 천 배 수준(fp32로 0.01% 안팎) — fp 계산이 실용이 되는 이유예요."
      />
      <Quiz
        difficulty="medium"
        question="실험 ③에서 d = 10⁻⁸ 일 때 상대 오차가 100%가 된 이유는?"
        :choices="['d가 1 근처 눈금 간격의 절반보다 작아 (1+d)가 1로 저장됐고, 차이가 0이 됐기 때문', '뺄셈 중에 오버플로가 났기 때문', '10⁻⁸이 무리수이기 때문', '상대 오차 계산 공식이 잘못됐기 때문']"
        :answer="0"
        explanation="흡수(사건 ②)가 상쇄(사건 ③)의 극한 사례로 이어진 것 — d의 정보가 저장 단계에서 통째로 사라져 되찾을 방법이 없습니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="temperature 0으로 고정했는데 같은 질문에 가끔 다른 답이 나온다. 오늘 배운 것과 연결되는 수치적 설명은?"
        :choices="['GPU 병렬 합산의 순서가 실행마다 달라져 로그확률에 티끌 차이가 생기고, 1·2위 토큰이 아슬아슬하면 순위가 뒤집힐 수 있다', 'temperature 0은 사실 무작위성을 최대로 하는 설정이다', '모델 가중치가 실행마다 조금씩 바뀌기 때문이다', '수치 계산과는 무관하며 네트워크 지연 때문이다']"
        :answer="0"
        :hints="['실험 ① — 순서가 다르면 무엇이 달라졌나요? GPU는 덧셈을 어떻게 나눠서 하나요?']"
        explanation="가중치는 고정이지만 합산 순서는 고정이 아닙니다 — 순서가 반올림 지점을 바꿔 로그확률 끝자리가 흔들리고, 박빙의 토큰 순위를 뒤집을 수 있어요. 완전 재현이 필요하면 결정적 모드를 켭니다(속도를 지불하고)."
      />
      <Quiz
        difficulty="hard"
        question="Kahan 합산(티끌 저금통)이 오차를 줄이는 핵심 아이디어는?"
        :choices="['덧셈마다 반올림으로 잃어버린 티끌을 별도 변수에 적어 뒀다가 다음 덧셈에 되돌려준다', '모든 수를 두 배로 만들어 더한 뒤 반으로 나눈다', '덧셈을 곱셈으로 바꿔 계산한다', '오차가 날 때마다 계산을 처음부터 다시 한다']"
        :answer="0"
        :hints="['저금통이라는 별명 — 무엇을 모아 두는 걸까요?']"
        explanation="(합 + x) 에서 실제로 반영되지 못한 부분을 c = (합 + x) − 합 − x 꼴로 계산해 장부에 보관, 다음 항에 얹어 줍니다 — 5줄로 오차가 수백 배 줄어요. 노트북에서 직접 만들어 봅니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch4')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">4장 완료!</p>
      <p class="mt-1 text-sm text-emerald-700">
        티끌의 행동까지 읽었습니다. 다음은 자의 양쪽 끝 — 너무 커서 터지고(inf),
        너무 작아서 사라지고(0), 그리고 계산 불능의 표식(NaN)까지.
      </p>
      <RouterLink
        to="/ch/ch5"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        5장 — 자의 끝: 오버플로·언더플로·NaN →
      </RouterLink>
    </div>
  </article>
</template>
