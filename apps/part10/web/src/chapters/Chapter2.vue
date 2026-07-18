<script setup lang="ts">
// 2장 — 곱의 세계: 로그 눈금과 멱법칙 (핵심). 10부 1막 전체의 수학 도구.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import GraphPaperLab from '@/components/GraphPaperLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch2')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 2 · 곱의 세계 (핵심)</p>
    <h1 class="mb-4 text-3xl font-bold">로그 눈금과 멱법칙</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1장의 다이얼 눈금은 125M → 70B, 1B → 2T처럼 <b>10배씩</b> 뛰었습니다. 스케일링의
      세계에서는 "얼마를 더했나"가 아니라 <b>"몇 배가 됐나"</b>가 자연스러운 질문이거든요.
      이 장에서는 그런 <b>곱의 세계</b>를 종이에 그리는 법 — 로그 눈금 — 과, 그 위에서
      직선으로 펴지는 법칙 — <b>멱법칙</b> — 을 손에 넣습니다. 10부 1막 전체가 이 도구 위에서 돌아갑니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 곡선(일차·거듭제곱·지수)을 세 종이(보통·반로그·로그-로그)에 갈아끼워 보며
      <b>"멱법칙 = 로그-로그 종이 위의 직선"</b>을 발견하고, 그 직선의 <b>기울기 b</b>를
      "x를 10배 키우면 y는 10ᵇ배"로 읽을 수 있게 됩니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대 — 보통 종이가 망가지는 순간</h2>
    <ReviewFlag id="ch2-s1" chapter="ch2" label="1. 무대 — 보통 종이가 망가지는 순간" />
    <p class="leading-relaxed text-slate-700">
      1장 노트북의 마지막 그림을 기억하시나요 — GPT-2급(9×10¹⁹)과 70B급(8.4×10²³)의 예산을
      보통 막대그래프에 함께 그리면 <b>GPT-2급 막대는 보이지도 않습니다</b>(8,900배 차이).
      10배씩 뛰는 수들을 한 화면에 담으려면 눈금 자체를 바꿔야 합니다 —
      <b>같은 간격이 "같은 덧셈"이 아니라 "같은 곱셈"</b>이 되도록. 2부 7장에서 만든
      로그 감각("몇 배 규모인가를 재는 도구")이 드디어 종이가 되는 순간입니다.
      직접 갈아끼워 보죠.
    </p>

    <GraphPaperLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 종이가 곡선의 정체를 밝힌다">
      같은 곡선도 종이에 따라 휘거나 펴집니다 — 그리고 <b>어느 종이에서 직선이 되는가</b>가
      곧 그 곡선의 정체입니다. 일차는 보통 종이에서(같은 간격만큼 <b>더해짐</b>), 지수는
      반로그에서(같은 간격마다 같은 <b>배수</b>), 그리고 <b>거듭제곱 y = a·xᵇ 는 로그-로그
      에서</b> 직선이 됩니다. 스케일링 법칙 그래프가 전부 로그-로그인 이유 — 그 종이 위에서
      법칙이 직선으로 보이기 때문이에요. 기울기 b의 뜻은 다이얼 실험 그대로:
      <b>x 10배 → y는 10ᵇ배</b> (b=0.5면 3.16배, b=−0.1이면 0.79배 — 21% 감소).
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="실험에서 거듭제곱 곡선 y = x^1.5 이 직선으로 펴진 종이는?"
      :choices="['로그-로그 종이 (x·y 모두 10배 눈금)', '보통 종이', '반로그 종이 (y만 10배 눈금)', '어떤 종이에서도 직선이 안 된다']"
      :answer="0"
      :hints="['랩에서 거듭제곱 곡선을 두고 종이 세 개를 차례로 눌러 보세요.']"
      explanation="거듭제곱(멱법칙)은 로그-로그에서 직선이 됩니다. 참고로 지수 곡선은 반로그에서 펴지죠 — 이 구분(멱 vs 지수)이 헷갈리면 종이를 갈아끼워 보는 게 판별법입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 왜 직선이 되나 — 로그 안경의 수학</h2>
    <ReviewFlag id="ch2-s2" chapter="ch2" label="2. 왜 직선이 되나 — 로그 안경의 수학" />
    <p class="leading-relaxed text-slate-700">
      마법이 아니라 2부 7장의 로그 성질 그대로입니다. 멱법칙 y = a·xᵇ 의 양변에
      로그를 씌우면:
    </p>

    <MathBlock expr="y = a \cdot x^{b} \;\;\xrightarrow{\;\log\;}\;\; \log y = \log a + b \cdot \log x" />

    <p class="leading-relaxed text-slate-700">
      로그 안경을 쓰면 <b>곱셈(a·)은 덧셈(+log a)</b>이 되고 <b>거듭제곱(xᵇ)은 곱셈(b·log x)</b>이
      됩니다. 그런데 로그-로그 종이의 가로축은 log x, 세로축은 log y — 그러니 위 식은
      그 종이 위에서 정확히 <b>"세로 = 절편 + 기울기 × 가로"</b>, 즉 직선의 방정식이죠.
      <b>기울기 = b, 절편 = log a.</b> 직선을 보면 법칙(a, b)을 읽어낼 수 있다는 뜻입니다 —
      3장에서 실제로 해 봅니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 로그 눈금 / 멱법칙 / 기울기 b">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>로그 눈금</b> (log scale) — 읽는 법: 로그 스케일.
          뜻: 같은 간격이 같은 <b>배수</b>(×10)인 눈금. 덧셈의 자 대신 <b>곱셈의 자</b> —
          1장 다이얼과 9부 3장의 "고무줄 자"가 사실 이 눈금이었습니다.
        </li>
        <li>
          <b>멱법칙</b> (power law) — 읽는 법: 멱법칙(멱 = 거듭제곱 冪). 비유:
          <b>곱의 세계의 직선</b>. 뜻: y = a·xᵇ 꼴의 관계 — "x가 10배 되면 y는 언제나
          10ᵇ배"가 <b>규모와 무관하게</b> 성립하는 법칙입니다.
        </li>
        <li>
          <b>기울기 b</b> (exponent, 지수) — 읽는 법: 비.
          뜻: 로그-로그 직선의 기울기이자 멱법칙의 거듭제곱 지수. <b>10배당 10ᵇ배</b>.
          0 &lt; b &lt; 1 이면 성장하되 갈수록 둔해지는 <b>수확 체감</b>, b &lt; 0 이면 감소.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="어떤 멱법칙의 로그-로그 직선 기울기가 b = −0.1 이다. x를 10배 키우면 y는?"
      :choices="['10^(−0.1) ≈ 0.79배 — 약 21% 감소', '10% 증가', '정확히 절반', '변하지 않는다']"
      :answer="0"
      :hints="['랩의 기울기 다이얼을 −0.1에 맞춰 보세요.']"
      explanation="10배당 10ᵇ배 규칙 그대로 — 10^(−0.1) ≈ 0.794배, 즉 21%쯤 줄어듭니다. '10배를 부어야 20% 남짓 내려간다' — 3장에서 만날 손실 곡선의 실제 감각입니다."
    />

    <DetailsCard title="➕ 더 깊이: 멱법칙은 자연과 언어에도 흔하다">
      멱법칙은 AI 발명품이 아닙니다 — <b>규모가 10배 바뀌어도 같은 규칙이 반복되는 시스템</b>
      어디서나 나타나요. 지진(규모가 1 올라가면 에너지 ≈32배), 도시 인구(순위 2배 → 인구
      절반), 그리고 <b>단어 빈도(Zipf의 법칙)</b>: 말뭉치에서 k번째로 흔한 단어의 빈도는
      대략 1/k — 로그-로그에서 기울기 −1의 직선입니다. 4부 2장의 토큰 사전이 "아는 말은
      통째로, 모르는 말은 조각으로"였던 것도 이 빈도 구조 덕분에 효율적이었던 거예요.
      구분 요령 하나 — 반로그에서 직선이면 지수("매번 ×r"), 로그-로그에서 직선이면
      멱("10배당 ×10ᵇ"). 지수가 훨씬 빨리 자랍니다.
    </DetailsCard>

    <ReviewFlag id="ch2-ai" chapter="ch2" label="🤖 AI 연결 — 스케일링 법칙 그래프는 전부 이 종이 위에 있다" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 스케일링 법칙 그래프는 전부 이 종이 위에 있다">
      스케일링 법칙 논문들의 그 유명한 그림 — 가로축 N(또는 D, C), 세로축 손실 — 은
      예외 없이 <b>로그-로그 종이</b>입니다. 법칙이 L ≈ a·N^(−b) 꼴 멱법칙이라 그 종이에서만
      직선으로 보이거든요. 이제 여러분은 그 그래프에서 두 가지를 바로 읽을 수 있습니다:
      직선인지(멱법칙이 성립하는지), 기울기가 얼마인지(10배 키우면 얼마나 좋아지는지).
      로그의 기초 체력은 <b><PartLink :part="2" ch="ch7">2부 7장</PartLink></b>에서, 로그가
      정보의 단위가 되는 이야기는 <b><PartLink :part="5" ch="ch1">5부 1장</PartLink></b>에서
      쌓은 그대로입니다. 다음 장에서 <b>우리 미니 LM의 손실</b>이 정말 이 종이 위에서
      직선이 되는지 — 직접 실측합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="곱의 세계 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="로그 눈금에서 '같은 간격'이 뜻하는 것은?"
        :choices="['같은 배수 (예: ×10)', '같은 덧셈 (예: +10)', '같은 개수', '아무 의미 없다']"
        :answer="0"
        explanation="보통 눈금은 한 칸이 +10 같은 덧셈, 로그 눈금은 한 칸이 ×10 같은 곱셈입니다 — 그래서 '곱의 세계'를 그리는 자예요."
      />
      <Quiz
        difficulty="easy"
        question="멱법칙 y = a·xᵇ 가 직선으로 보이는 종이는?"
        :choices="['로그-로그 (x·y 모두 로그)', '보통 종이', '반로그 (y만 로그)', 'x만 로그인 종이']"
        :answer="0"
        explanation="양변에 로그를 씌우면 log y = log a + b·log x — 가로가 log x, 세로가 log y인 종이에서 정확히 직선 방정식이 됩니다."
      />
      <Quiz
        difficulty="easy"
        question="로그-로그 직선의 기울기가 b일 때, x를 10배 키우면 y는 10ᵇ배가 된다."
        type="truefalse"
        :answer="0"
        explanation="참 — 이 한 줄이 이 장의 전부라 해도 좋습니다. b=0.5면 3.16배, b=1이면 10배, b=−0.1이면 0.79배."
      />
      <Quiz
        difficulty="easy"
        question="실험에서 지수 곡선 y = 2^(x/10) 이 직선으로 펴진 종이는?"
        :choices="['반로그 종이 (y만 로그)', '로그-로그 종이', '보통 종이', '어디서도 안 펴진다']"
        :answer="0"
        explanation="지수는 'x가 +10 될 때마다 y가 ×2' — 덧셈 축(x)과 곱셈 축(y)의 조합, 즉 반로그에서 직선입니다. 멱법칙(로그-로그)과의 구분 포인트!"
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="기울기 b = 0.5 인 멱법칙에서 x를 100배 키우면 y는 몇 배? (10배당 10ᵇ배 규칙으로 단계 계산)"
        :steps="[
          { lhs: '100 = 10^{?}', answer: 2 },
          { lhs: 'b \\times 2 = ?', answer: 1 },
          { lhs: 'y \\text{는 } 10^{1} = ?\\text{배}', answer: 10 },
        ]"
        explanation="100배 = 10배 두 번 → 지수로는 b×2 = 1 → 10¹ = 10배. 로그 안경을 쓰면 곱셈이 이렇게 덧셈·곱셈 한 번씩으로 끝납니다."
      />
      <Quiz
        difficulty="medium"
        question="log y = log a + b·log x 에서 로그-로그 직선의 '절편'(x=1, 즉 log x=0일 때의 높이)은?"
        :choices="['log a — 계수 a의 로그', 'b', 'a·b', '항상 0']"
        :answer="0"
        :hints="['log x = 0을 대입해 보세요.']"
        explanation="log x = 0이면 log y = log a — 직선의 절편이 계수 a를, 기울기가 지수 b를 담습니다. 그래서 직선 하나에서 법칙(a, b)을 전부 읽어낼 수 있어요."
      />
      <Quiz
        difficulty="medium"
        question="0 < b < 1 인 멱법칙(예: b=0.5)의 성장을 가장 잘 묘사한 것은?"
        :choices="['계속 성장하지만 갈수록 둔해진다 — 수확 체감', '갈수록 빨라지는 폭발 성장', '일정한 덧셈 성장', '성장하지 않는다']"
        :answer="0"
        explanation="10배마다 3.16배 — 늘긴 느는데 투입 대비 산출이 점점 야박해집니다. 스케일링 법칙의 '10배 부어야 조금 내려간다'가 정확히 이 구간이에요."
      />
      <Quiz
        difficulty="medium"
        question="반로그 종이에서 직선인 곡선과 로그-로그 종이에서 직선인 곡선의 짝으로 옳은 것은?"
        :choices="['반로그 = 지수(매 칸 ×r), 로그-로그 = 멱법칙(10배당 ×10ᵇ)', '반로그 = 멱법칙, 로그-로그 = 지수', '둘 다 일차함수', '둘 다 지수함수']"
        :answer="0"
        explanation="지수는 x의 덧셈이 y의 곱셈으로(반로그), 멱은 x의 곱셈이 y의 곱셈으로(로그-로그) 이어집니다 — 어떤 종이에서 펴지는지가 둘을 가르는 판별법."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="어떤 벤치마크 성능이 로그-로그 종이에서 기울기 0.3의 직선이라고 하자. 성능을 2배로 올리려면 x(예: 데이터)는 대략 몇 배 필요한가? (참고: 10^0.3 ≈ 2)"
        :choices="['약 10배 — 10배당 10^0.3 ≈ 2배씩 좋아지므로', '약 2배', '약 3배', '약 100배']"
        :answer="0"
        :hints="['10배당 10^0.3 ≈ 2배 — 목표가 정확히 그 한 칸입니다.']"
        explanation="10배당 2배 좋아지는 법칙이니, 2배 좋아지려면 한 칸 = 10배를 부어야 합니다. 멱법칙의 냉정함 — 성능의 곱셈은 재료의 곱셈을 요구해요."
      />
      <Quiz
        difficulty="hard"
        question="어떤 데이터가 로그-로그 종이에서도, 반로그 종이에서도 완만한 곡선(직선 아님)이라면 올바른 결론은?"
        :choices="['멱법칙도 지수법칙도 아닌 다른 형태 — 직선이 되는 종이가 법칙의 꼴을 판별한다', '측정이 잘못된 것이다', '데이터가 무작위라는 뜻이다', '어쨌든 멱법칙이라고 불러도 된다']"
        :answer="0"
        explanation="종이는 판별 도구입니다 — 어느 로그 종이에서도 안 펴지면 그 두 꼴이 아니라는 증거예요. '로그-로그에서 직선처럼 보인다'가 멱법칙 주장의 최소 요건인 이유이고, 5장(창발 논쟁)에서 이 감각이 무기가 됩니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch2')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">2장 완료 — 곱의 세계의 자를 손에 넣었습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 3장 — 손실의 직선. 미니 LM에 데이터를 10배씩 늘려 먹이며 손실을 실측하고,
        방금 배운 로그-로그 종이 위에서 정말 직선이 되는지 — 스케일링 법칙을 직접 목격합니다.
      </p>
      <RouterLink
        to="/ch/ch3"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        3장 — 손실의 직선 →
      </RouterLink>
    </div>
  </article>
</template>
