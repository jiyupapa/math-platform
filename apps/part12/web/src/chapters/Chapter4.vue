<script setup lang="ts">
// 4장 — 온도 조절기: 균형 루프와 목표 추구. 교정 유량 = 격차 ÷ 조정 시간 → 지수 감쇠, τ 뒤 63%.
// 경사하강 = 최저점을 쫓는 균형 루프(매 걸음 격차 × (1 − ηλ)).
// 다시 쓰는 수학: 2부 9장(경사하강), 2부 7장(지수 감쇠), 8부 2장(수축 인자).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import BalancingLab from '@/components/BalancingLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch4')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">4장 · 약 35분</p>
    <h1 class="mb-4 text-3xl font-bold">온도 조절기 — 균형 루프와 목표 추구</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      강화 루프는 차이를 키웠습니다. 이번엔 반대쪽 고리, <b>차이를 줄이는</b> 균형 루프입니다. 회의실을 목표 온도로 데우는
      난방기, 재고를 목표 수준으로 채우는 주문, 그리고 손실을 최저점으로 낮추는 경사하강까지. 겉모습은 달라도 속은
      같은 고리라는 것을 이 장에서 확인합니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"교정 유량 = 격차 ÷ 조정 시간."</b> 이렇게 움직이면 격차는 같은 시간마다 같은 비율로 줄어들고(지수 감쇠),
      조정 시간 τ가 지나면 처음 격차의 63%가 메워집니다. 그리고 경사하강이 정확히 이 고리라는 것을 식으로 확인해요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 회의실 온도 맞추기</h2>
    <ReviewFlag id="ch4-s1" chapter="ch4" label="1. 무대: 회의실 온도 맞추기" />
    <p class="leading-relaxed text-slate-700">
      아침 회의실이 12°C입니다. 목표는 22°C. 똑똑한 난방기는 목표와 차이가 클 때 세게, 작을 때 약하게 데웁니다.
      데우는 속도 = (목표 − 지금 온도) ÷ τ. 여기서 <b>τ</b>(타우)는 "격차를 얼마나 느긋하게 메울지" 정하는 시간이에요.
      인과지도로 그리면 온도가 오르면 격차가 줄고(−), 격차가 크면 데우는 속도가 크고(+), 데우면 온도가 오릅니다(+).
      − 하나가 낀 고리, <b>균형 루프(B)</b>입니다.
    </p>

    <BalancingLab />

    <ConceptCard tone="tip" title="핵심 관찰: 남은 격차의 같은 비율을 메운다">
      τ = 10분이면 10분 뒤 18.3°C(처음 격차 10°C 중 63%), 20분 뒤 20.6°C(86%), 30분 뒤 21.5°C(95%)입니다.
      τ마다 <b>남은 격차</b>의 63%를 메우니, 목표에 가까울수록 움직임이 느려져요. 강화 루프가 같은 배수로 <b>커졌다면</b>
      균형 루프는 격차가 같은 배수로 <b>줄어듭니다</b>. 경사하강 탭에서도 똑같은 모양이 나오죠. 곡률 2, 학습률 0.1이면
      매 걸음 격차가 0.8배가 되어 약 3.1걸음마다 절반이 됩니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="조정 시간 τ가 10분이면, 10분 뒤 처음 격차의 약 몇 %가 메워지나? (정수)"
      type="numeric"
      :answer="63"
      :tolerance="1"
      :hints="['실험 아래 설명의 첫 숫자를 보세요.']"
      explanation="약 63%. τ가 몇 분이든 'τ만큼 지나면 63%'는 같습니다. 그래서 τ를 이 고리의 시간 상수라고 불러요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="ch4-s2" chapter="ch4" label="2. 오늘의 발견에 이름표 달기" />
    <p class="leading-relaxed text-slate-700">2장의 언어로 쓰면 이 고리는 한 줄입니다.</p>
    <MathBlock expr="\frac{dS}{dt} = \frac{G - S}{\tau} \quad\Longrightarrow\quad G - S(t) = \big(G - S(0)\big)\, e^{-t/\tau}" />
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      <b>S</b>는 저량(온도), <b>G</b>는 목표(goal), <b>G − S</b>는 격차, <b>τ</b>는 조정 시간입니다. 왼쪽 식은
      "저량의 변화율 = 격차 ÷ τ", 오른쪽은 그 답으로 "격차는 e<sup>−t/τ</sup>배로 줄어든다"는 뜻이에요. e는 2부 7장의
      자연상수(약 2.718)이고, t = τ일 때 e<sup>−1</sup> ≈ 0.37이 남으니 1 − 0.37 = 0.63, 곧 63%가 메워집니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 목표 / 격차 / 조정 시간·시간 상수 / 지수 감쇠 / 반감기">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li><b>목표</b> (goal)와 <b>격차</b> (gap, discrepancy). 균형 루프가 쫓는 값과, 지금 저량과의 차이. 비유로는 온도 조절기의 설정 온도와 남은 온도 차.</li>
        <li><b>조정 시간</b> (adjustment time, τ 타우). 격차를 얼마나 느긋하게 메울지 정하는 시간. 교정 유량 = 격차 ÷ τ. 같은 τ를 <b>시간 상수</b>(time constant)라고도 부릅니다. 이 고리의 시간 척도라는 뜻이고, τ만큼 지날 때마다 남은 격차의 63%가 메워집니다.</li>
        <li><b>지수 감쇠</b> (exponential decay). 같은 시간마다 같은 비율로 줄어드는 움직임. 3장 지수 성장의 거울상이에요.</li>
        <li><b>반감기</b> (half-life). 격차가 절반이 되는 시간 = τ × ln 2 ≈ 0.69τ. τ = 10분이면 약 6.9분마다 절반.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="조정 시간 τ를 두 배로 늘리면, 같은 비율(예: 63%)을 메우는 데 걸리는 시간도 두 배가 된다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 교정 유량 = 격차 ÷ τ 라서 τ가 두 배면 매 순간 절반 속도로 메웁니다. 그래서 63%를 메우는 시간도 τ, 곧 두 배예요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 목표가 0인 균형 루프</h2>
    <ReviewFlag id="ch4-s3" chapter="ch4" label="3. 목표가 0인 균형 루프" />
    <p class="leading-relaxed text-slate-700">
      균형 루프의 목표가 꼭 위에 있을 필요는 없습니다. <b>목표가 0</b>인 균형 루프도 흔해요. 다른 유입 없이 "매달 사용자의
      10%가 이탈한다"면 이탈(유출)이 사용자 수에 비례하니, 사용자 수 →(+) 이탈 →(−) 사용자 수, − 하나가 낀 균형 루프입니다.
      사용자 수는 0을 향해 지수 감쇠해요. 3장의 "매달 같은 비율로 줄어드는" 것은 강화 루프(악순환)가 아니라 이쪽입니다.
      악순환은 줄어들수록 <b>더 빠른 비율로</b> 줄어드는 고리이고, 지수 감쇠는 <b>같은 비율로</b> 줄어드는 고리예요.
      몸속 약물 농도, 방사성 물질, 식어 가는 커피도 모두 목표가 0(또는 실온)인 균형 루프입니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습: 매주 격차의 1/4씩</p>
    <StepQuiz
      difficulty="medium"
      question="재고 목표는 100개, 지금 40개. 매주 격차의 1/4만큼 주문해 채운다. 1주 뒤와 2주 뒤 재고를 구하세요."
      :steps="[
        { lhs: '\\text{1주: } 40 + (100 - 40) \\div 4 = ?', answer: 55 },
        { lhs: '\\text{2주: } 55 + (100 - 55) \\div 4 = ?', answer: 66.25, tolerance: 0.01 },
      ]"
      explanation="40 → 55 → 66.25개. 격차가 60 → 45 → 33.75로 매주 3/4배씩 줄어듭니다. 걸음 단위 균형 루프는 '매번 격차 × (1 − 1/τ)'이고, 경사하강의 '매 걸음 격차 × (1 − ηλ)'와 같은 모양이에요."
    />

    <DetailsCard title="➕ 더 깊이: 왜 하필 63%인가">
      격차를 τ분 동안 매 순간 조금씩 메우는 것을, τ번에 나눠 매번 1/τ씩 메우는 것과 비교해 봅시다. 나눠 메우면
      남는 격차는 (1 − 1/τ)<sup>τ</sup>배입니다. τ = 4면 0.75⁴ ≈ 0.32, τ = 10이면 0.9¹⁰ ≈ 0.35, 더 잘게 나눌수록
      e<sup>−1</sup> ≈ 0.368에 다가가요. 3장에서 (1 + r/m)<sup>m</sup>이 e<sup>r</sup>로 다가간 것과 같은 이야기입니다.
      그래서 매 순간 메우는 연속 고리에서는 τ 뒤 정확히 1 − e<sup>−1</sup> ≈ 63.2%가 메워지고, 걸음 단위로 메우면
      그보다 조금 더(τ = 4면 68%) 메워집니다. 걸음 단위와 연속의 차이는 5장의 주제예요.
    </DetailsCard>

    <ReviewFlag id="ch4-ai" chapter="ch4" label="🤖 AI 연결: 경사하강은 최저점을 쫓는 균형 루프" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 경사하강은 최저점을 쫓는 균형 루프">
      손실 곡선이 L(θ) = (λ/2)(θ − θ*)² 모양일 때 기울기는 λ(θ − θ*)이고, 경사하강 한 걸음을 정리하면
      <b>θ* − θ(다음) = (1 − ηλ) × (θ* − θ(지금))</b>, 곧 "매 걸음 격차의 ηλ만큼을 메운다"가 됩니다.
      온도 조절기의 1/τ 자리에 <b>학습률 × 곡률</b>이 들어간 균형 루프예요.
      <b><PartLink :part="2" ch="ch9">2부 9장</PartLink></b>의 경사하강을 시스템 다이내믹스로 읽으면 이렇게 되고,
      <b><PartLink :part="8" ch="ch2">8부 2장</PartLink></b>의 '수축 인자 |1 − 보폭×곡률|'가 바로 이 (1 − ηλ)입니다.
      학습률 × 곡률이 정확히 1이면 한 걸음에 최저점에 도착하죠. 그런데 1을 넘으면? 격차를 메우다 못해 <b>목표를 지나칩니다</b>.
      실험의 학습률을 0.5 아래로 묶어 둔 이유이고, 그 너머의 이야기(출렁임과 발산)가 다음 5장입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="균형 루프와 목표 추구: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="균형 루프가 하는 일은?"
        :choices="['목표·한계와의 차이를 줄인다', '변화를 키운다', '저량을 0으로 만든다', '아무 일도 하지 않는다']"
        :answer="0"
        explanation="균형 루프는 격차를 줄이는 쪽으로 유량을 정합니다. 목표가 위에 있으면 채우고, 아래(0 포함)에 있으면 줄여요."
      />
      <Quiz
        difficulty="easy"
        question="온도 조절기는 균형 루프의 예다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 목표보다 추우면 데우고 더우면 덜 데워 차이를 줄이는 대표적인 균형 루프예요."
      />
      <Quiz
        difficulty="easy"
        question="교정 유량 = 격차 ÷ 조정 시간일 때, 격차가 클수록?"
        :choices="['교정 유량이 커서 빨리 움직인다', '교정 유량이 작아진다', '교정 유량은 격차와 상관없다', '저량이 줄어든다']"
        :answer="0"
        explanation="격차에 비례해 움직이니 멀수록 빠르고, 가까울수록 느립니다. 그래서 목표에 점점 느리게 다가가는 곡선이 나와요."
      />
      <Quiz
        difficulty="easy"
        question="조정 시간 τ만큼 지나면 처음 격차의 약 몇 %가 메워지나? (정수)"
        type="numeric"
        :answer="63"
        :tolerance="1"
        explanation="1 − e⁻¹ ≈ 0.632, 약 63%입니다. 2τ면 86%, 3τ면 95%예요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="12°C 회의실을 목표 22°C, τ = 10분으로 데운다. 10분 뒤 온도는? (소수 첫째 자리)"
        type="numeric"
        :answer="18.3"
        :tolerance="0.05"
        :hints="['격차 10°C 중 63%가 메워진다', '22 − 10 × e⁻¹ = 22 − 10 × 0.368']"
        explanation="22 − 10 × 0.368 = 18.3°C. 처음 격차 10°C 가운데 6.3°C가 메워졌습니다."
      />
      <Quiz
        difficulty="medium"
        question="조정 시간 τ를 10분에서 20분으로 늘리면?"
        :choices="['같은 비율을 메우는 데 두 배 시간이 걸린다(느긋해진다)', '목표 온도가 바뀐다', '목표를 지나쳐 출렁인다', '아무 변화 없다']"
        :answer="0"
        explanation="교정 유량이 격차 ÷ 20으로 절반이 되니 같은 63%를 메우는 데 20분이 걸립니다. 목표 자체는 그대로예요."
      />
      <Quiz
        difficulty="medium"
        question="다른 유입 없이 '매달 사용자의 10%가 이탈한다'. 이것은 어떤 고리인가?"
        :choices="['0을 목표로 하는 균형 루프(지수 감쇠)', '강화 루프(악순환)', '지연', '고리가 없다']"
        :answer="0"
        :hints="['사용자 수 →(+) 이탈 →(−) 사용자 수. − 가 몇 개인가요?']"
        explanation="− 하나가 낀 고리라 균형 루프이고, 목표는 0입니다. 같은 비율(10%)로 줄어드는 지수 감쇠예요. 줄어들수록 더 빠른 비율로 줄어드는 악순환(강화 루프)과는 다릅니다."
      />
      <Quiz
        difficulty="medium"
        question="곡률 λ = 2, 학습률 η = 0.1로 경사하강하면 매 걸음 최저점과의 격차는 몇 배가 되나?"
        :choices="['0.8배', '0.1배', '2배', '1.2배']"
        :answer="0"
        :hints="['격차 × (1 − ηλ)']"
        explanation="1 − 0.1 × 2 = 0.8. 매 걸음 격차의 20%를 메웁니다. 학습률 × 곡률이 균형 루프의 '1/조정 시간' 자리예요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="격차가 절반이 되는 시간(반감기)은 조정 시간 τ의 약 몇 배인가? (소수 둘째 자리)"
        type="numeric"
        :answer="0.69"
        :tolerance="0.005"
        :hints="['e^(−t/τ) = 0.5 를 풀면 t = τ × ln 2', 'ln 2 ≈ 0.693']"
        explanation="t = τ × ln 2 ≈ 0.69τ. τ = 10분이면 약 6.9분마다 격차가 절반이 됩니다. 70의 법칙의 69.3과 같은 ln 2가 여기서도 나오죠."
      />
      <Quiz
        difficulty="hard"
        question="경사하강에서 학습률 × 곡률(ηλ)이 정확히 1이면 무슨 일이 일어나나?"
        :choices="['한 걸음에 격차 × 0, 곧 최저점에 바로 도착한다', '격차가 그대로 남는다', '격차가 두 배가 된다', '출렁이며 발산한다']"
        :answer="0"
        :hints="['격차 × (1 − ηλ) 에 ηλ = 1을 넣어 보세요.']"
        explanation="1 − 1 = 0이라 한 걸음에 격차가 사라집니다(8부 2장의 '한 방 도착'). 그런데 실전에서는 곡률을 모르니 정확히 1을 맞추기 어렵고, 1을 넘기면 목표를 지나치기 시작해요. 그 이야기가 5장입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch4')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">4장 완료! 두 번째 고리를 손에 넣었습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        균형 루프 = 격차의 같은 비율을 메우기, 경사하강도 그 고리. 다음은 5장입니다.
        컴퓨터가 이런 고리의 미래를 계산하는 법(오일러법)과, 계산 간격이 너무 크면 생기는 가짜 출렁임을 봅니다.
      </p>
      <RouterLink
        to="/ch/ch5"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        5장: 시간을 잘게 썰기 →
      </RouterLink>
    </div>
  </article>
</template>
