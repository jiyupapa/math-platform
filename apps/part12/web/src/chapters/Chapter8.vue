<script setup lang="ts">
// 8장 — 공은 어디서 멈출까: 평형과 안정성. 평형 = 순유량 0, 기울기 부호로 안정·불안정 판정(위상선),
// 임계 질량(문턱), 저량 두 개의 나선(모멘텀)과 고유값(선택).
// 다시 쓰는 수학: 2부 3장(도함수 부호), 8부 10장(안장점), 8부 4장(모멘텀), 1부 7장(고유값, 선택).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import PhaseLab from '@/components/PhaseLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch8')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">8장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">공은 어디서 멈출까 — 평형과 안정성</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      저량은 언제 멈출까요? 유입과 유출이 같아 순유량이 0이 될 때입니다. 그런데 멈춘 자리가 골짜기 바닥에 멈춘 공인지,
      언덕 꼭대기에 아슬아슬하게 선 공인지는 전혀 다른 이야기예요. 바닥의 공은 살짝 밀어도 돌아오지만 꼭대기의 공은 굴러떨어지죠.
      이 장에서는 멈추는 자리(평형)를 찾고, 그 자리가 버티는지(안정성)를 그래프 한 장으로 판정합니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"평형은 순유량이 0인 곳, 그 근처에서 순유량이 기울어진 방향이 안정성을 정한다."</b> 사내 도입에 '임계 질량'이 있으면
      출발점에 따라 사라지거나 끝까지 자란다는 것, 그리고 저량이 두 개면 나선을 그리며 출렁일 수 있다는 것까지 봅니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 순유량 그래프에서 평형 찾기</h2>
    <ReviewFlag id="ch8-s1" chapter="ch8" label="1. 무대: 순유량 그래프에서 평형 찾기" />
    <p class="leading-relaxed text-slate-700">
      지금까지는 가로축이 늘 시간이었습니다. 이번엔 가로축에 <b>저량</b>을, 세로축에 <b>그 저량일 때의 순유량</b>을 놓아 봅시다.
      7장의 로지스틱이라면 가입 속도 r·S·(1 − S/K)가 S = 0과 S = K에서 0이 되는 언덕 모양이에요. 이 그림 한 장이면 미분방정식을
      풀지 않고도 어디서 멈추고 어디로 가는지 다 보입니다. 실험 ①의 '임계 질량이 있는 도입' 보기는 사용자가 너무 적으면 커뮤니티가 굴러가지
      않아 오히려 줄어드는 경우예요(실무에서 '임계 질량'이라고 부르는 현상).
    </p>

    <PhaseLab />

    <ConceptCard tone="tip" title="핵심 관찰: 평형 근처의 기울기가 안정성을 정한다">
      순유량 그래프가 0을 위에서 아래로 지나가는 평형(K = 1,000명)은 <b>안정</b>합니다. 조금 넘치면 순유량이 −라 돌아오고,
      조금 모자라면 +라 채워지니까요. 아래에서 위로 지나가는 평형은 <b>불안정</b>합니다. 임계 질량이 있는 도입에서 200명이 바로
      그런 문턱이에요. 처음 150명으로 시작하면 0으로 사라지고, 250명으로 시작하면 1,000명까지 갑니다. 그래서 도입 캠페인의
      첫 목표는 "많이"가 아니라 <b>"문턱 넘기"</b>입니다. 실험 ②에서는 저량이 둘(위치·속도)이면 β가 클 때 최저점을 지나쳐
      나선을 그리며 출렁이는 것을 봤어요(β = 0.9면 반대편으로 4.83까지 넘어감).
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="임계 질량이 200명인 도입에서 처음 사용자가 150명이면 어떻게 되나?"
      :choices="['0명으로 사라진다(문턱 아래에서 시작)', '1,000명까지 자란다', '150명에 그대로 머문다', '200명에서 멈춘다']"
      :answer="0"
      :hints="['실험 ①에서 임계 질량 보기로 바꾸고 출발점을 150에 놓아 보세요.']"
      explanation="0과 200 사이에서는 순유량이 −라서 사용자가 계속 줄어 0(안정 평형)으로 갑니다. 200명은 불안정 평형, 곧 넘으면 자라고 못 넘으면 사라지는 문턱이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="ch8-s2" chapter="ch8" label="2. 오늘의 발견에 이름표 달기" />
    <p class="leading-relaxed text-slate-700">
      평형 S* 바로 근처만 보면 순유량 곡선은 직선처럼 보입니다(2부 3장의 접선). 그 직선의 기울기 f′(S*)가 모든 것을 정해요.
    </p>
    <MathBlock expr="f(S^*) = 0, \qquad \frac{d(S - S^*)}{dt} \approx f'(S^*)\,(S - S^*) \quad\Rightarrow\quad \begin{cases} f'(S^*) \lt 0 & \text{안정 (균형 루프처럼 돌아옴)} \\ f'(S^*) \gt 0 & \text{불안정 (강화 루프처럼 벗어남)} \end{cases}" />
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      <b>S*</b>(에스 스타)는 평형, <b>f′(S*)</b>(에프 프라임)는 평형에서 순유량 곡선의 기울기(2부 3장의 도함수)입니다.
      평형에서 벗어난 양 (S − S*)에 대해 4장의 균형 루프나 3장의 강화 루프와 똑같은 식이 되는 거예요. 안정할 때 돌아오는 시간 상수는 1/|f′(S*)|입니다.
      로지스틱(r = 0.5)이라면 f′(0) = +0.5(불안정), f′(K) = −0.5(안정, 시간 상수 2개월)예요.
    </p>

    <ConceptCard tone="note" title="새 용어: 평형 / 안정·불안정 평형 / 위상선 / 임계 질량 / 선형화">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li><b>평형</b> (equilibrium). 뜻: 순유량이 0이라 저량이 움직이지 않는 상태. 정상 상태(steady state)라고도 해요. '균형 루프'와 헷갈리지 않게 이 과정에서는 평형으로 부릅니다.</li>
        <li><b>안정 평형·불안정 평형</b> (stable·unstable equilibrium). 뜻: 살짝 밀렸을 때 돌아오면 안정(골짜기 바닥의 공), 더 멀어지면 불안정(언덕 꼭대기의 공).</li>
        <li><b>위상선</b> (phase line). 뜻: 저량 축 위에 평형과 움직이는 방향을 표시한 그림. 이 과정에서는 가로축에 저량, 세로축에 순유량을 그린 그래프에서 읽습니다. 순유량이 0인 곳이 평형, 부호가 움직이는 방향입니다.</li>
        <li><b>임계 질량</b> (critical mass). 뜻: 넘으면 스스로 자라고 못 넘으면 사라지는 문턱, 곧 불안정 평형. 티핑 포인트(tipping point)라고도 불러요.</li>
        <li><b>선형화</b> (linearization). 뜻: 평형 근처에서 곡선을 접선(직선)으로 바꿔 보는 것. 그러면 3·4장의 고리 식으로 안정성을 읽을 수 있습니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습: 기울기로 안정성 판정</p>
    <StepQuiz
      difficulty="medium"
      question="로지스틱 f(S) = 0.5·S·(1 − S/1000). 기울기 f′(S) = 0.5·(1 − 2S/1000)이다. 두 평형에서 기울기를 구하고, 안정 평형으로 돌아오는 시간 상수를 구하세요."
      :steps="[
        { lhs: 'f\'(0) = 0.5 \\times (1 - 0) = ?', answer: 0.5 },
        { lhs: 'f\'(1000) = 0.5 \\times (1 - 2) = ?', answer: -0.5 },
        { lhs: '\\tau = 1 \\div |f\'(1000)| = ?\\,\\text{개월}', answer: 2 },
      ]"
      explanation="f′(0) = +0.5 → 0은 불안정(사용자가 몇 명만 생겨도 자라남), f′(1000) = −0.5 → 1,000은 안정. K 근처에서 벗어난 양은 시간 상수 2개월로 돌아옵니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 저량이 둘이면: 나선과 고유값</h2>
    <ReviewFlag id="ch8-s3" chapter="ch8" label="3. 저량이 둘이면: 나선과 고유값" />
    <p class="leading-relaxed text-slate-700">
      저량이 하나뿐이면 평형으로 곧장 가거나 곧장 멀어질 뿐, 출렁이지는 못합니다(지연이 없다면). 지나치려면 "가던 기세"를
      담아 둘 두 번째 저량이 필요해요. 모멘텀이 그렇습니다. 속도가 위치를 바꾸고(위치 ← 위치 + 속도), 위치가 기울기를 통해
      속도를 바꾸죠(속도 ← β × 속도 − 학습률 × 기울기). 두 저량이 서로를 바꾸는 이 구조에서, 가던 기세를 많이 남길수록(β가 클수록)
      최저점을 지나쳐 반대편으로 넘어갔다 돌아오는 <b>나선</b>이 생깁니다. 실험 ②의 위상 평면(가로 위치, 세로 속도)에서 궤적이 원점을
      감아 도는 모양이 그거예요.
    </p>

    <DetailsCard title="➕ 더 깊이(선택): 나선인지 아닌지, 고유값이 정한다">
      모멘텀 한 걸음은 (위치, 속도)라는 벡터에 행렬 하나를 곱하는 일입니다. 곡률 2·학습률 0.05(곱해서 0.1)라면
      [[0.9, β], [−0.1, β]]를 곱해요. 1부 7장에서 배운 대로, 같은 행렬을 거듭 곱하면 어디로 가는지는 <b>고유값</b>이 정합니다.
      고유값이 실수면 곧장 다가가고, <b>복소수</b>(a ± bi 꼴)면 매번 조금씩 회전하며 다가가는 나선이 되며, 고유값의 크기가 1보다
      작아야 결국 멈춥니다. 이 행렬의 고유값은 β가 약 0.468을 넘으면 복소수가 되고, 그때 크기는 √β예요. β = 0.9면 크기 0.949라서
      한 걸음마다 5%씩만 줄어드니 오래 출렁입니다. 2차원 이상의 시스템 다이내믹스 모형에서 "출렁일까?"라는 질문의 정식 답이
      평형점의 고유값이에요. 1부 7장을 건너뛰었다면 "곱할 때마다 회전과 늘림·줄임의 정도를 알려 주는 수" 정도로 읽어도 충분합니다.
    </DetailsCard>

    <ReviewFlag id="ch8-ai" chapter="ch8" label="🤖 AI 연결: 학습이 멈추는 곳도 평형, 안장점은 반쪽짜리 평형" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 학습이 멈추는 곳도 평형, 안장점은 반쪽짜리 평형">
      경사하강에서 가중치가 멈추는 곳은 기울기가 0인 곳, 곧 학습의 <b>평형</b>입니다. 최저점은 안정 평형(살짝 밀어도 돌아옴),
      꼭대기는 불안정 평형이에요. <b><PartLink :part="8" ch="ch10">8부 10장</PartLink></b>의 <b>안장점</b>은 그 중간입니다.
      어떤 방향으로는 안정(골짜기), 다른 방향으로는 불안정(능선)한 평형이라, 그 방향으로 살짝만 밀려도 빠져나갈 수 있어요.
      고차원에서 안장점이 흔한데도 SGD가 통하는 이유와 이어집니다. 모멘텀이 최저점 주변을 맴도는 것은 오늘 본 두 저량의 나선이고
      (<b><PartLink :part="8" ch="ch4">8부 4장</PartLink></b>), 그 판정은 <b><PartLink :part="1" ch="ch7">1부 7장</PartLink></b>의
      고유값으로 합니다. 사내 도입에서는 '임계 질량'이 실전 문제예요. 처음 쓰는 사람이 문턱보다 적으면 아무리 좋은 도구도
      사라질 수 있고, 캡스톤에서 이 문턱을 넘기는 전략을 모형으로 봅니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="평형과 안정성: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="저량이 평형에 있다는 것은?"
        :choices="['순유량이 0이라(유입 = 유출) 저량이 움직이지 않는다', '저량이 0이다', '유입이 0이다', '저량이 가장 크다']"
        :answer="0"
        explanation="유입과 유출이 같으면 쌓이지도 빠지지도 않습니다. 저량이 0이 아니어도 평형일 수 있어요(예: K = 1,000명)."
      />
      <Quiz
        difficulty="easy"
        question="평형이라고 해서 모두 안정한 것은 아니다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 언덕 꼭대기의 공처럼 살짝만 밀려도 멀어지는 불안정 평형이 있어요. 임계 질량(문턱)이 대표적입니다."
      />
      <Quiz
        difficulty="easy"
        question="7장 로지스틱 성장의 평형 두 개는?"
        :choices="['0명과 수용 한계 K', '0명과 K/2', 'K/2와 K', 'K 하나뿐']"
        :answer="0"
        explanation="r·S·(1 − S/K) = 0이 되는 곳은 S = 0과 S = K입니다. K/2는 가입 속도가 가장 빠른 변곡점이지 평형이 아니에요."
      />
      <Quiz
        difficulty="easy"
        question="안정 평형의 뜻은?"
        :choices="['살짝 밀려나도 다시 돌아오는 평형', '절대 움직이지 않는 평형', '처음 위치', '가장 높은 곳']"
        :answer="0"
        explanation="골짜기 바닥의 공처럼 벗어나면 되돌리는 힘(순유량)이 생기는 평형입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="위상선(가로 저량, 세로 순유량)에서 순유량이 +인 구간에 있는 저량은?"
        :choices="['오른쪽(늘어나는 쪽)으로 움직인다', '왼쪽으로 움직인다', '그 자리에 멈춘다', '0으로 뛴다']"
        :answer="0"
        explanation="순유량이 +면 저량이 늘어나니 가로축에서 오른쪽으로 갑니다. 0인 곳(평형)에 닿을 때까지요."
      />
      <Quiz
        difficulty="medium"
        question="평형 S*에서 순유량 곡선의 기울기 f′(S*)가 음수면?"
        :choices="['안정: 벗어나면 균형 루프처럼 돌아온다', '불안정: 강화 루프처럼 멀어진다', '판정할 수 없다', '저량이 0이 된다']"
        :answer="0"
        explanation="평형보다 크면 순유량이 −, 작으면 +가 되니 늘 평형 쪽으로 밀립니다. 4장의 균형 루프와 같은 식(시간 상수 1/|f′|)이에요."
      />
      <Quiz
        difficulty="medium"
        question="로지스틱(r = 0.5)에서 K 근처로 돌아오는 시간 상수는 몇 개월인가? (정수)"
        type="numeric"
        :answer="2"
        :hints="['f′(K) = −r', '시간 상수 = 1 ÷ |f′(K)|']"
        explanation="f′(K) = −0.5이므로 시간 상수는 1 ÷ 0.5 = 2개월. K에서 조금 벗어나도 2개월마다 벗어난 양의 63%를 되돌립니다."
      />
      <Quiz
        difficulty="medium"
        question="임계 질량이 200명인 도입에서 처음 사용자가 250명이면?"
        :choices="['1,000명까지 자란다(문턱을 넘음)', '0명으로 사라진다', '250명에 머문다', '200명으로 내려와 멈춘다']"
        :answer="0"
        explanation="200과 1,000 사이는 순유량이 +라서 계속 자라 안정 평형 1,000명에 닿습니다. 문턱(불안정 평형)을 넘는 것이 승부예요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="모멘텀(β = 0.9)이 최저점 주변을 나선으로 출렁이는 이유로 가장 알맞은 것은?"
        :choices="['위치와 속도라는 두 저량이 서로를 바꾸는 구조이고, 반복 행렬의 고유값이 복소수이기 때문', '학습률이 너무 작아서', '최저점이 불안정 평형이라서', '저량이 하나뿐이라서']"
        :answer="0"
        :hints="['저량이 하나면 지연 없이는 출렁일 수 없습니다.']"
        explanation="속도라는 두 번째 저량이 '가던 기세'를 담아 최저점을 지나치게 합니다. 행렬 [[0.9, β], [−0.1, β]]의 고유값이 β > 약 0.468에서 복소수가 되어 나선이 돼요(크기 √β = 0.949라 천천히 가라앉음)."
      />
      <Quiz
        difficulty="hard"
        question="8부 10장의 안장점을 평형의 언어로 옮기면?"
        :choices="['기울기가 0인 평형이지만, 어떤 방향으로는 안정하고 다른 방향으로는 불안정한 반쪽짜리 평형', '가장 낮은 안정 평형', '평형이 아닌 점', '모든 방향으로 불안정한 꼭대기']"
        :answer="0"
        explanation="말안장처럼 앞뒤로는 골짜기, 좌우로는 능선입니다. 불안정한 방향으로 살짝만 밀려도 빠져나갈 수 있어서, 기울기가 0이어도 학습이 영원히 갇히지는 않아요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch8')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">8장 완료! 멈추는 자리와 버티는 자리를 구별하게 됐습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        평형 = 순유량 0, 기울기 부호 = 안정성, 저량 둘 = 나선. 다음은 9장입니다.
        지금까지 써 온 인과지도를 제대로 그리는 규칙과, 그림만 보고 판단하면 틀리는 함정을 봅니다.
      </p>
      <RouterLink
        to="/ch/ch9"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        9장: 그림만 보면 틀린다 →
      </RouterLink>
    </div>
  </article>
</template>
