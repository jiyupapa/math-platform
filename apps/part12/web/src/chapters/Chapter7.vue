<script setup lang="ts">
// 7장 — 커지다 멈추는 성장: S자 곡선과 지배 루프. 강화 + 균형 = 로지스틱, 수용 한계 K,
// 변곡점(K/2)에서 지배 루프가 바뀜, 로지스틱 = 시그모이드.
// 다시 쓰는 수학: 2부 7장(시그모이드), 6부 4장(선호 확률의 시그모이드), 10부 2~3장(멱법칙과 구별).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import LogisticLab from '@/components/LogisticLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch7')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">7장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">커지다 멈추는 성장 — S자 곡선과 지배 루프</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      3장에서 "영원한 지수 성장은 없다"고 했습니다. 직원 1,000명 회사에서 입소문이 퍼지면, 처음엔 눈덩이처럼 불어나다가
      아직 안 쓰는 동료가 줄수록 느려지고, 결국 멈춥니다. 강화 루프와 균형 루프가 한 저량에 함께 걸릴 때 생기는
      이 <b>S자 곡선</b>은 신기술 확산, 서비스 사용자, 전염병, 그리고 AI 도입에서 가장 자주 보는 모양이에요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"처음엔 강화 루프가, 나중엔 균형 루프가 이긴다."</b> 두 고리의 힘이 뒤바뀌는 지점(변곡점)이 수용 한계의 절반이라는 것,
      그리고 이 S자 곡선이 2부에서 배운 시그모이드와 같은 함수라는 것을 확인합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 동료가 동료를 데려오는데, 동료는 1,000명뿐</h2>
    <ReviewFlag id="ch7-s1" chapter="ch7" label="1. 무대: 동료가 동료를 데려오는데, 동료는 1,000명뿐" />
    <p class="leading-relaxed text-slate-700">
      3장의 입소문 식에 한 가지를 곱합니다. <b>(1 − 사용자 수 ÷ K)</b>, 곧 "아직 안 쓰는 사람의 비율"이에요. 사용자가 적을 때는
      이 값이 거의 1이라 3장의 지수 성장과 같고, 사용자가 K에 가까워질수록 0에 가까워져 가입이 멈춥니다.
      인과지도로는 3장의 강화 루프(입소문)에 "사용자 수 →(−) 남은 여지 →(+) 신규 가입"이라는 균형 루프(포화)가 하나 더 붙은 모양이에요.
    </p>

    <LogisticLab />

    <ConceptCard tone="tip" title="핵심 관찰: 변곡점은 수용 한계의 절반, 그 뒤로 균형 루프가 이긴다">
      r = 0.5, K = 1,000이면 <b>약 9.2개월</b>에 사용자가 500명(K의 절반)이 되고, 그때 가입 속도가 최대(월 125명)입니다.
      그 전에는 사용자가 늘수록 가입도 늘어 곡선이 점점 가팔라지고(강화 루프가 이김), 그 뒤로는 남은 여지가 줄어 가입이
      줄어들며 곡선이 완만해집니다(균형 루프가 이김). 가입 속도의 정점(9.2개월)과 사용자 수가 멈추는 때(2년 무렵)가
      크게 다르다는 점도 보세요. 워밍업의 교훈 "유입의 정점은 저량의 정점이 아니다"가 여기서 또 나옵니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="수용 한계가 1,000명인 S자 성장에서 가입 속도가 가장 빠를 때 사용자 수는?"
      :choices="['500명(수용 한계의 절반)', '1,000명', '10명', '100명']"
      :answer="0"
      :hints="['변곡점에서 사용자 수는 K의 몇 분의 몇인가요?']"
      explanation="가입 속도 r·S·(1 − S/K)는 S = K/2일 때 가장 큽니다. 사용자가 너무 적으면 데려올 사람이, 너무 많으면 데려갈 사람이 모자라죠. 딱 절반일 때 둘의 곱이 최대예요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="ch7-s2" chapter="ch7" label="2. 오늘의 발견에 이름표 달기" />
    <MathBlock expr="\frac{dS}{dt} = r\,S\left(1 - \frac{S}{K}\right) \quad\Longrightarrow\quad S(t) = \frac{K}{1 + \frac{K - S_0}{S_0}\, e^{-rt}} = K\,\sigma\big(r\,(t - t^*)\big)" />
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      왼쪽이 로지스틱 성장의 식, 오른쪽이 그 답입니다. <b>σ</b>(시그마)는 2부 7장의 시그모이드 함수 σ(x) = 1/(1 + e<sup>−x</sup>)로,
      어떤 수든 0과 1 사이로 눌러 주는 S자 함수예요. 그러니 S자 성장 곡선은 시그모이드를 세로로 K배, 가로로 1/r배 늘이고
      t*만큼 옮긴 것입니다. <b>t*</b>(티 스타)는 변곡점 시각 ln((K − S₀)/S₀) ÷ r 이고, 이때 S = K/2입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 로지스틱 성장 / 수용 한계 / 변곡점 / 지배 루프 / 성장의 한계">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li><b>로지스틱 성장</b> (logistic growth). 뜻: 강화 루프와 포화하는 균형 루프가 함께 만드는 S자 성장. 처음엔 지수 성장처럼, 끝에선 목표 추구처럼.</li>
        <li><b>수용 한계</b> (carrying capacity, K). 뜻: 저량이 다가갈 수 있는 최대치. 생태학에서는 환경 수용력이라고도 부릅니다. 사내 도입이라면 쓸 수 있는 직원 수.</li>
        <li><b>변곡점</b> (inflection point). 뜻: 곡선이 휘는 방향이 바뀌는 점. 로지스틱 성장에서는 S = K/2, 가입 속도가 가장 빠른 때.</li>
        <li><b>지배 루프</b> (dominant loop). 뜻: 지금 저량의 움직임을 주로 정하는 고리. 변곡점에서 강화 루프에서 균형 루프로 지배가 넘어갑니다.</li>
        <li><b>성장의 한계</b> (limits to growth). 뜻: 성장이 어떤 한계에 걸려 멈추는 구조. 1972년 같은 이름의 책이 세계 인구·자원 문제에 이 구조를 적용했고, 10장에서 '시스템 원형'의 하나로 다시 만납니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습: 변곡점과 최대 가입 속도</p>
    <StepQuiz
      difficulty="medium"
      question="처음 사용자 10명, 수용 한계 1,000명, 성장률 0.5/월. 변곡점 시각과 그때의 가입 속도를 구하세요. (ln 99 ≈ 4.595)"
      :steps="[
        { lhs: 't^* = \\ln 99 \\div 0.5 = ?\\,\\text{개월}', answer: 9.19, tolerance: 0.02 },
        { lhs: '\\text{최대 가입 속도} = r K / 4 = 0.5 \\times 1000 \\div 4 = ?', answer: 125 },
      ]"
      explanation="t* = 4.595 ÷ 0.5 ≈ 9.19개월, 최대 가입 속도 = 0.5 × 1,000 × (1/2) × (1/2) = 125명/월. 변곡점에서 S = K/2라서 r·S·(1 − S/K) = r·(K/2)·(1/2) = rK/4가 됩니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 처음 몇 달로 미래를 재면</h2>
    <ReviewFlag id="ch7-s3" chapter="ch7" label="3. 처음 몇 달로 미래를 재면" />
    <p class="leading-relaxed text-slate-700">
      S자의 앞부분은 지수 성장과 구별이 거의 안 됩니다. 처음 3개월 숫자(10명 → 약 43명)만 보고 "매달 1.63배"라는 지수 곡선을 맞춰
      2년 뒤를 예측하면 <b>약 124만 명</b>이 나와요. 실제는 1,000명에서 멈춥니다. 실험의 '처음 기세대로 지수 성장한다면'을 켜 보세요.
      성장 초기의 숫자로 미래를 그릴 때는 반드시 <b>한계가 어디인가</b>(균형 루프)를 함께 물어야 합니다. 반대로 한계를 알면,
      변곡점(가입 속도가 꺾이기 시작하는 때)을 지난 시점에서 최종 규모를 꽤 일찍 짐작할 수 있어요. 대략 그때의 두 배입니다.
    </p>

    <DetailsCard title="➕ 더 깊이: 넘쳤다 무너지는 성장">
      S자는 한계가 고정돼 있고 소식이 즉시 전해질 때의 모양입니다. 1장에서 강화 + 균형에 지연을 더하자 한계를 넘쳤다 출렁이며
      돌아온 것을 기억하나요? 한계를 늦게 알아채면 넘치고(overshoot), 넘친 상태가 한계 자체를 깎아 먹으면(예: 자원이 고갈되거나
      서비스 품질이 무너지면) 다시 올라오지 못하고 무너질 수도 있습니다(overshoot and collapse). 1972년 『성장의 한계』가 세계 모형에서
      경고한 모양이 이것이에요. 시스템 다이내믹스에서 한계는 숫자 하나가 아니라 또 하나의 저량일 수 있다는 점이 중요합니다.
    </DetailsCard>

    <ReviewFlag id="ch7-ai" chapter="ch7" label="🤖 AI 연결: 시그모이드의 세 얼굴, 그리고 플라이휠의 한계" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 시그모이드의 세 얼굴, 그리고 플라이휠의 한계">
      같은 시그모이드가 시리즈에 세 번 나옵니다. <b><PartLink :part="2" ch="ch7">2부 7장</PartLink></b>에서는 어떤 수든 0~1로 바꾸는
      활성화 함수, <b><PartLink :part="6" ch="ch4">6부 4장</PartLink></b>에서는 두 답의 점수 차를 "A를 더 좋아할 확률"로 바꾸는
      보상 모델의 핵심, 그리고 오늘은 <b>시간에 따른 성장 곡선</b>이에요. 3장의 데이터 플라이휠도 결국 S자입니다. 남은 사용자,
      새로 모을 만한 데이터, 감당할 수 있는 비용이라는 균형 루프가 변곡점 뒤로 이기기 시작하죠. 하나 구별할 것: 10부의 스케일링 법칙
      (<b><PartLink :part="10" ch="ch2">10부 2장</PartLink></b>)은 "키울수록 덜 좋아지지만 멈추지는 않는" 멱법칙이고, S자는
      "한계에서 멈추는" 모양이에요. 그래프의 앞부분만 보고 둘 중 무엇인지 단정하면 위험하다는 것이 이 장의 교훈과 같습니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="S자 곡선과 지배 루프: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="S자 성장 곡선을 만드는 구조는?"
        :choices="['강화 루프와 포화하는 균형 루프가 한 저량에 함께 걸린 구조', '강화 루프 하나', '균형 루프 하나', '지연 하나']"
        :answer="0"
        explanation="처음엔 강화 루프가, 나중엔 균형 루프가 이겨서 빨라지다 멈추는 S자가 됩니다. 1장 실험에서 두 고리를 함께 켰을 때의 모양이에요."
      />
      <Quiz
        difficulty="easy"
        question="S자 곡선의 처음 부분은 지수 성장처럼 보인다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 사용자가 적을 때는 (1 − S/K)가 거의 1이라 3장의 지수 성장과 거의 같아요. 그래서 초기 숫자만으로는 둘을 구별하기 어렵습니다."
      />
      <Quiz
        difficulty="easy"
        question="수용 한계 K의 뜻은?"
        :choices="['저량이 다가갈 수 있는 최대치(예: 쓸 수 있는 직원 수)', '처음 사용자 수', '성장률', '변곡점 시각']"
        :answer="0"
        explanation="S자 곡선이 결국 다가가 멈추는 높이입니다. 생태학에서는 환경 수용력이라고 불러요."
      />
      <Quiz
        difficulty="easy"
        question="로지스틱 성장의 변곡점에서 사용자 수는?"
        :choices="['수용 한계의 절반(K/2)', '수용 한계(K)', '처음 사용자 수', '0']"
        :answer="0"
        explanation="가입 속도 r·S·(1 − S/K)가 S = K/2에서 가장 크고, 그 점에서 곡선이 휘는 방향이 바뀝니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="처음 10명, K = 1,000명, r = 0.5/월일 때 변곡점은 약 몇 개월인가? (소수 첫째 자리)"
        type="numeric"
        :answer="9.2"
        :tolerance="0.05"
        :hints="['t* = ln((K − S₀)/S₀) ÷ r = ln 99 ÷ 0.5', 'ln 99 ≈ 4.595']"
        explanation="4.595 ÷ 0.5 ≈ 9.2개월. 성장률을 두 배로 하면 변곡점은 절반 시각으로 당겨집니다."
      />
      <Quiz
        difficulty="medium"
        question="r = 0.5/월, K = 1,000명일 때 최대 가입 속도는 월 몇 명인가? (정수)"
        type="numeric"
        :answer="125"
        :hints="['최대 가입 속도 = rK/4']"
        explanation="0.5 × 1,000 ÷ 4 = 125명/월. 변곡점에서 S = K/2라 r·(K/2)·(1/2) = rK/4가 됩니다."
      />
      <Quiz
        difficulty="medium"
        question="변곡점을 지난 뒤 사용자 수는?"
        :choices="['여전히 늘지만 증가 속도가 줄어든다(균형 루프가 이김)', '줄어들기 시작한다', '그 자리에 멈춘다', '더 빨리 늘어난다']"
        :answer="0"
        explanation="가입 속도가 줄어들 뿐 여전히 +라서 사용자 수는 계속 늘어 K에 다가갑니다. 2장의 '막대가 +이면 저량은 는다'와 같아요."
      />
      <Quiz
        difficulty="medium"
        question="로지스틱 성장 곡선과 2부 7장 시그모이드의 관계는?"
        :choices="['같은 함수: S(t) = K·σ(r(t − t*)), 세로로 K배, 가로로 1/r배 늘이고 t*만큼 옮긴 것', '전혀 다른 함수', '시그모이드의 역함수', '시그모이드의 미분']"
        :answer="0"
        explanation="로지스틱 미분방정식의 답이 정확히 시그모이드 모양입니다. 2부의 활성화 함수, 6부의 선호 확률과 같은 함수가 여기선 시간에 따른 성장을 그려요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="사내 AI 도구의 월 신규 가입이 지난달 정점을 찍고 줄기 시작했다. 가장 알맞은 해석은?"
        :choices="['변곡점을 지났을 가능성이 크다. 사용자 수는 계속 늘고, 대략 지금의 두 배 근처에서 멈출 것이다', '사용자 수도 지금 정점이다', '곧 사용자가 줄어든다', '측정 오류다']"
        :answer="0"
        :hints="['가입 속도의 정점 = 변곡점 = 사용자 수 K/2']"
        explanation="로지스틱 성장이라면 가입 정점은 사용자 수가 K/2일 때입니다. 사용자는 계속 늘어 약 두 배(K)에서 멈춰요. 워밍업의 '유입 정점 ≠ 저량 정점'과 같은 교훈입니다."
      />
      <Quiz
        difficulty="hard"
        question="도입 초기 3개월 숫자(10명 → 약 43명)로 '매달 1.63배' 지수 곡선을 맞춰 2년 뒤를 예측했다. 결과는?"
        :choices="['약 124만 명으로 크게 과대예측한다. 실제(로지스틱)는 약 1,000명에서 멈춘다', '거의 정확하다', '과소예측한다', '알 수 없다']"
        :answer="0"
        explanation="S자의 앞부분은 지수와 구별이 안 되므로, 한계를 빼고 그린 지수 곡선은 터무니없이 커집니다. 초기 숫자로 미래를 그릴 때는 한계(균형 루프)를 함께 물어야 해요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch7')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">7장 완료! S자 곡선의 속을 들여다봤습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        강화에서 균형으로 지배가 넘어가는 변곡점 K/2, 그리고 시그모이드. 다음은 8장입니다.
        저량이 어디서 멈추는지(평형), 멈춘 자리가 안정적인지를 판정하는 법을 봅니다.
      </p>
      <RouterLink
        to="/ch/ch8"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        8장: 공은 어디서 멈출까 →
      </RouterLink>
    </div>
  </article>
</template>
