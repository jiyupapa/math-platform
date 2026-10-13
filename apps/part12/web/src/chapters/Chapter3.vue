<script setup lang="ts">
// 3장 — 눈덩이: 강화 루프와 지수 성장. 유량이 저량에 비례하면 같은 배수로 커진다.
// 두 배 시간·70의 법칙·로그 눈금. 다시 쓰는 수학: 2부 7장(지수·로그), 10부 2장(로그 눈금).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ReinforcingLab from '@/components/ReinforcingLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch3')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">3장 · 약 35분</p>
    <h1 class="mb-4 text-3xl font-bold">눈덩이 — 강화 루프와 지수 성장</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1장에서 강화 루프만 켰더니 사용자 수가 그래프를 뚫고 나갔습니다. 50명이 3년 만에 1,294만 명이었죠.
      무엇이 그렇게 만들었을까요? 답은 단순합니다. <b>유량이 저량에 비례</b>하기 때문이에요. 이 장에서는 그 고리,
      강화 루프가 만드는 지수 성장의 수학과 우리 직관이 자주 빠지는 함정을 봅니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"유량이 저량에 비례하면, 저량은 매번 같은 배수로 커진다."</b> 두 배가 되는 데 걸리는 시간은 늘 같고
      (두 배 시간), 70 ÷ 성장률(%)로 어림할 수 있으며, 로그 눈금에서는 직선이 된다는 것을 직접 확인합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 사용자가 사용자를 데려온다</h2>
    <ReviewFlag id="ch3-s1" chapter="ch3" label="1. 무대: 사용자가 사용자를 데려온다" />
    <p class="leading-relaxed text-slate-700">
      사내 AI 도구를 쓰는 100명이 매달 동료 10명꼴(지금 사용자의 10%)을 새로 데려온다고 합시다. 사용자가 늘면 데려오는
      사람도 늘어요. 그래서 첫 달은 +10명이지만 둘째 달은 +11명, 셋째 달은 +12.1명… 늘어나는 양 자체가 늘어납니다.
      인과지도로 그리면 사용자 수와 입소문 가입이 서로를 키우는 <b>강화 루프(R)</b> 하나예요. 화살표의 +는
      "원인이 늘면 결과도 는다"는 뜻입니다.
    </p>

    <ReinforcingLab />

    <ConceptCard tone="tip" title="핵심 관찰: 같은 '양'이 아니라 같은 '배수'로 큰다">
      성장률 10%면 매달 ×1.1, 두 배가 되는 데 <b>약 7.3개월</b>이 걸리고, 그다음 두 배(×4)도 또 7.3개월이 걸립니다.
      두 배 시간이 늘 같은 것이 지수 성장의 지문이에요. 24개월 뒤에는 <b>약 985명</b>으로, 같은 출발(매달 +10명)의
      선형 성장 340명의 세 배 가까이 됩니다. 처음 몇 달은 두 곡선이 거의 붙어 있어서 차이를 못 느끼다가 어느 순간부터
      벌어지죠. 로그 눈금을 켜면 지수 성장은 <b>직선</b>이 됩니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="성장률이 매달 10%면, 사용자 수가 두 배가 되는 데 70의 법칙으로 약 몇 달이 걸리나? (정수)"
      type="numeric"
      :answer="7"
      :hints="['70 ÷ 성장률(%)']"
      explanation="70 ÷ 10 = 7개월(정확히는 7.27개월). 성장률이 클수록 두 배 시간이 반비례로 짧아집니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="ch3-s2" chapter="ch3" label="2. 오늘의 발견에 이름표 달기" />
    <p class="leading-relaxed text-slate-700">
      매달 (1 + r)을 곱하니 n개월 뒤에는 n번 곱한 값이 됩니다.
    </p>
    <MathBlock expr="S_n = S_0 \times (1 + r)^n" />
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      <b>S₀</b>(에스 영)은 처음 사용자 수, <b>r</b>은 월 성장률(10%면 0.1), <b>n</b>은 지난 개월 수, 위첨자 n은 "n번 곱하라"는 거듭제곱이에요.
      두 배가 되는 n은 (1 + r)ⁿ = 2 를 풀면 되고, "몇 번 곱해야 2가 되나"를 세는 도구가 바로 2부 7장의 로그입니다.
    </p>
    <MathBlock expr="n_{\times 2} = \frac{\log 2}{\log(1 + r)} \approx \frac{0.693}{r} \approx \frac{70}{r(\%)}" />
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      r이 작으면 log(1 + r)이 거의 r과 같아서(자연로그 기준) 0.693/r로 어림되고, 계산하기 편하게 69.3을 70으로 올린 것이
      70의 법칙입니다. 성장률이 클수록 어림이 조금씩 짧게 나와요(30%면 2.6개월 대신 2.3개월).
    </p>

    <ConceptCard tone="note" title="새 용어: 지수 성장 / 성장률 / 두 배 시간 / 70의 법칙 / 로그 눈금">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li><b>지수 성장</b> (exponential growth). 뜻: 같은 시간마다 같은 <b>배수</b>로 커지는 성장. 유량이 저량에 비례할 때 생깁니다. 비유로는 <b>눈덩이</b>.</li>
        <li><b>성장률</b> (growth rate, r). 뜻: 한 기간 동안 늘어나는 양 ÷ 지금 양. 10%면 100명당 10명.</li>
        <li><b>두 배 시간</b> (doubling time). 뜻: 저량이 두 배가 되는 데 걸리는 시간. 지수 성장에서는 언제 재도 같습니다.</li>
        <li><b>70의 법칙</b> (rule of 70). 뜻: 두 배 시간 ≈ 70 ÷ 성장률(%). 연 7% 성장하는 투자는 약 10년에 두 배.</li>
        <li><b>로그 눈금</b> (log scale). 뜻: 10, 100, 1,000처럼 같은 <b>배수</b>를 같은 간격으로 그리는 눈금. 지수 성장이 직선으로 보입니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="세로축을 로그 눈금으로 그리면 지수 성장은 직선이 된다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 같은 배수(×1.1)가 로그 눈금에서는 같은 간격이라, 매달 같은 만큼 올라가는 직선이 돼요. 직선의 기울기가 성장률을 알려 줍니다."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습: 두 배 시간</p>
    <StepQuiz
      difficulty="medium"
      question="사용자가 매달 7%씩 늘어난다. 70의 법칙으로 두 배 시간을 어림하고, 그만큼 지난 뒤 100명이 몇 명이 되는지 구하세요."
      :steps="[
        { lhs: 'n_{\\times 2} \\approx 70 \\div 7 = ?\\,\\text{개월}', answer: 10 },
        { lhs: '\\text{두 배 시간을 두 번 지나면 } 100 \\times 2 \\times 2 = ?', answer: 400 },
      ]"
      explanation="약 10개월에 두 배(정확히는 10.24개월), 20개월이면 네 배인 400명입니다. 지수 성장에서는 같은 시간마다 같은 배수가 곱해져요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 지수 성장의 네 가지 함정</h2>
    <ReviewFlag id="ch3-s3" chapter="ch3" label="3. 지수 성장의 네 가지 함정" />
    <ul class="list-disc space-y-2 pl-5 leading-relaxed text-slate-700">
      <li>
        <b>처음엔 얌전하다</b>: 성장률 10%도 처음 몇 달은 선형 성장과 거의 같아 보입니다. 그래서 "아직 별거 아니다"라고 판단하기 쉬워요.
      </li>
      <li>
        <b>마지막 두 배가 전부다</b>: 연못의 수련이 매일 두 배로 늘어 30일째에 연못을 다 덮는다면, 연못의 절반을 덮은 날은
        언제일까요? 15일이 아니라 <b>29일</b>입니다. 지수 성장에서는 마지막 한 번의 두 배가 그전까지의 전부와 같아요.
      </li>
      <li>
        <b>영원한 지수 성장은 없다</b>: 사람·돈·서버·데이터 어딘가에서 반드시 한계를 만납니다. 한계가 균형 루프로 끼어들면
        S자로 휘어요(7장).
      </li>
      <li>
        <b>악순환도 강화 루프다</b>: 사용자가 줄면 커뮤니티 활동이 줄고, 그래서 더 많이 떠나는 고리는 줄어드는 쪽으로
        스스로를 키웁니다. 강화 루프는 방향을 가리지 않아요.
      </li>
    </ul>

    <DetailsCard title="➕ 더 깊이: 매달 한 번 곱하기와 매 순간 자라기(e)">
      실험은 한 달에 한 번 ×(1 + r)을 곱했습니다. 그런데 입소문은 월말에 한꺼번에가 아니라 매 순간 일어나죠.
      순간마다 자라는 성장을 식으로 쓰면 2장의 언어로 "저량의 변화율 = r × 저량", 곧 dS/dt = r·S 이고, 답은
      S(t) = S₀·eʳᵗ 입니다(e ≈ 2.718, 2부 7장의 자연상수). 한 달을 m조각으로 썰어 (1 + r/m)을 m번 곱하면, m을 키울수록
      eʳ에 다가가요. r = 10%로 12개월이면 매달 곱하기는 1.1¹² ≈ 3.14배, 매 순간 자라기는 e¹·² ≈ 3.32배로 조금 더 큽니다.
      칸을 잘게 썰수록 연속에 가까워지는 이 이야기는 5장(오일러법)에서 정식으로 다룹니다.
    </DetailsCard>

    <ReviewFlag id="ch3-ai" chapter="ch3" label="🤖 AI 연결: 데이터 플라이휠과 '조용한 지수'" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 데이터 플라이휠과 '조용한 지수'">
      AI 서비스에서 말하는 <b>데이터 플라이휠</b>(data flywheel)은 강화 루프입니다. 사용자가 늘면 데이터가 늘고, 모델이
      좋아지고, 그래서 사용자가 또 늘죠. 사내 AI 도입 초기에도 같은 함정이 있어요. 몇 달 동안 숫자가 작아 "조용한" 사이
      지수 성장이 진행되다가, 어느 날 서버·교육·지원이 감당 못 할 만큼 커집니다. 지수와 로그는
      <b><PartLink :part="2" ch="ch7">2부 7장</PartLink></b>에서 배운 그대로이고, 로그 눈금은
      <b><PartLink :part="10" ch="ch2">10부 2장</PartLink></b>에서 스케일링 법칙을 읽을 때 쓴 도구입니다. 한 가지 구별:
      세로축만 로그일 때 직선이면 지수 성장(같은 시간마다 같은 배수), 가로·세로 둘 다 로그일 때 직선이면 멱법칙
      (10부의 스케일링 법칙)이에요. 플라이휠도 영원히 돌지는 않습니다. 데이터의 품질, 비용, 남은 사용자라는 균형 루프를 만나
      꺾이는 이야기가 7장과 11장에서 이어집니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="강화 루프와 지수 성장: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="강화 루프에서 유량이 저량에 비례하면(유량 = r × 저량) 저량은 어떻게 자라나?"
        :choices="['지수 성장: 같은 시간마다 같은 배수로 커진다', '선형 성장: 매달 같은 양만큼', 'S자로 멈춘다', '줄어든다']"
        :answer="0"
        explanation="늘어나는 양이 저량에 비례하니, 저량이 클수록 더 많이 늘어납니다. 그래서 매번 같은 배수(1 + r)가 곱해져요."
      />
      <Quiz
        difficulty="easy"
        question="지수 성장은 매달 같은 '양'만큼 늘어난다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 같은 '양'은 선형 성장이고, 지수 성장은 같은 '비율'(배수)만큼 늘어요. 그래서 늘어나는 양 자체가 계속 커집니다."
      />
      <Quiz
        difficulty="easy"
        question="100명이 매달 10%씩 늘면 2개월 뒤는 몇 명인가? (정수)"
        type="numeric"
        :answer="121"
        :hints="['100 × 1.1 × 1.1']"
        explanation="100 → 110 → 121명. 둘째 달에는 110명의 10%인 11명이 늘어서 첫 달보다 1명 더 늘었어요."
      />
      <Quiz
        difficulty="easy"
        question="70의 법칙으로 어림한, 월 성장률 10%의 두 배 시간은?"
        :choices="['약 7개월', '약 10개월', '약 70개월', '약 1개월']"
        :answer="0"
        explanation="70 ÷ 10 = 7개월. 실험의 정확한 값은 7.27개월이었어요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="월 성장률 5%의 두 배 시간을 70의 법칙으로 어림하면 약 몇 개월인가? (정수)"
        type="numeric"
        :answer="14"
        :hints="['70 ÷ 5']"
        explanation="70 ÷ 5 = 14개월(정확히는 14.21개월). 성장률이 절반이면 두 배 시간은 두 배가 됩니다."
      />
      <Quiz
        difficulty="medium"
        question="로그 눈금에서 지수 성장이 직선이 되는 이유는?"
        :choices="['같은 배수가 같은 간격으로 그려지기 때문', '로그가 모든 곡선을 직선으로 만들기 때문', '세로축을 잘라냈기 때문', '지수 성장은 원래 직선이기 때문']"
        :answer="0"
        explanation="로그 눈금에서는 ×10이 늘 같은 간격입니다. 매달 같은 배수(×1.1)가 곱해지는 지수 성장은 매달 같은 간격씩 올라가니 직선이에요. 기울기가 곧 성장률입니다."
      />
      <Quiz
        difficulty="medium"
        question="100명에서 시작한 두 회사: A는 매달 10% 지수 성장, B는 매달 +10명 선형 성장. 24개월 뒤 사용자 수에 가장 가까운 것은?"
        :choices="['A 약 985명, B 340명', 'A 340명, B 985명', '둘 다 340명', '둘 다 약 985명']"
        :answer="0"
        :hints="['실험에서 선형 성장과 비교를 켜고 24개월 값을 보세요.']"
        explanation="A는 100 × 1.1²⁴ ≈ 985명, B는 100 + 10 × 24 = 340명. 첫 달은 둘 다 +10명으로 같았지만 2년 뒤엔 세 배 가까이 벌어집니다."
      />
      <Quiz
        difficulty="medium"
        question="연못의 수련이 매일 두 배로 늘어 30일째에 연못을 다 덮는다. 연못의 절반을 덮은 날은?"
        :choices="['29일째', '15일째', '20일째', '1일째']"
        :answer="0"
        explanation="하루에 두 배이니, 다 덮기 하루 전이 절반입니다. 지수 성장에서는 마지막 한 번의 두 배가 그전까지 쌓인 전부와 같아요. 그래서 '아직 절반밖에 안 됐다'는 안심이 위험합니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="'사용자가 줄수록 커뮤니티 활동이 줄고, 그래서 더 많이 떠난다.' 이 악순환도 강화 루프인 이유는?"
        :choices="['고리를 한 바퀴 돌면 처음 변화(감소)가 같은 방향으로 더 커지기 때문', '사용자 수가 늘기 때문', '균형 루프는 늘 감소만 만들기 때문', '지연이 있기 때문']"
        :answer="0"
        :hints="['강화 루프의 정의는 방향이 아니라 ‘변화를 키우는가’입니다.']"
        explanation="강화 루프는 변화를 키우는 고리입니다. 늘어나면 더 늘고, 줄어들면 더 줄죠. 화살표로 따지면 루프 안의 − 표시가 짝수 개(0개 포함)라 한 바퀴 돌았을 때 원래 방향이 유지돼요. 이 판별법은 9장에서 정식으로 다룹니다."
      />
      <Quiz
        difficulty="hard"
        question="사내 AI 도구 사용자 100명이 매달 15%씩 늘고 있다. 경영진이 '1.15²⁴이면 2년 뒤 약 2,860명, 직원 3,000명 거의 전원'이라고 보고했다. 가장 알맞은 지적은?"
        :choices="['지수 성장이 끝까지 간다고 가정했다. 아직 안 쓰는 직원이 줄수록 입소문 가입도 줄어 S자로 휜다', '계산이 틀렸다. 1.15²⁴는 2,860이 아니다', '선형 성장으로 다시 계산해야 한다', '지적할 것이 없다']"
        :answer="0"
        :hints="['3,000명에 가까워질수록 데려올 동료가 남아 있나요?']"
        explanation="계산(100 × 1.15²⁴ ≈ 2,863명) 자체는 맞지만, 강화 루프만 있다고 가정한 것이 문제입니다. 남은 직원이라는 한계가 균형 루프로 끼어들면 성장은 S자로 꺾여요. 7장에서 이 S자를, 캡스톤에서 사내 도입 모형 전체를 계산합니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch3')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">3장 완료! 눈덩이의 수학을 손에 넣었습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        강화 루프 = 같은 배수의 성장, 두 배 시간 ≈ 70 ÷ 성장률. 다음은 4장입니다.
        반대쪽 고리, 목표와의 차이를 줄이는 균형 루프와 그것이 경사하강과 같은 수학이라는 사실을 봅니다.
      </p>
      <RouterLink
        to="/ch/ch4"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        4장: 온도 조절기 →
      </RouterLink>
    </div>
  </article>
</template>
