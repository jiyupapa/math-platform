<script setup lang="ts">
// 6장 — 늦게 오는 소식: 지연과 출렁임 (핵심). 균형 루프 + 지연 = 과잉 교정과 출렁임(샤워기).
// 물질 지연·정보 지연, 1차 정보 지연 = 지수 평활 = EMA(β = 1 − DT/τ), 채찍 효과.
// 다시 쓰는 수학: 8부 4장(모멘텀·EMA), 8부 5장(Adam β), 4장(균형 루프).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import DelayLab from '@/components/DelayLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch6')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">6장 · 약 45분 · ⭐ 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">늦게 오는 소식 — 지연과 출렁임</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1장에서 지연 하나를 끼우자 사용자 수가 목표를 넘겼다 돌아왔습니다. 5장에서는 계산이 만든 가짜 출렁임을 봤고요.
      이번엔 진짜 출렁임입니다. 정보나 물건이 <b>늦게 도착하면</b> 균형 루프가 이미 충분히 고친 뒤에도 계속 고치다가
      목표를 지나치게 돼요. 이 장에서는 그 구조를 샤워기로 직접 겪어 보고, 8부에서 만난 EMA가 바로 '지연'의 한 종류라는 것까지 봅니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"균형 루프 + 지연 = 과잉 교정과 출렁임."</b> 지연이 조정 시간에 비해 길수록 출렁임이 커지고, 어느 선을 넘으면
      출렁임이 스스로 커진다는 것을 확인합니다. 그리고 1차 정보 지연이 지수 평활, 곧 8부의 EMA와 같은 식이라는 것을 봅니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 낯선 호텔의 샤워기</h2>
    <ReviewFlag id="ch6-s1" chapter="ch6" label="1. 무대: 낯선 호텔의 샤워기" />
    <p class="leading-relaxed text-slate-700">
      물이 차가워서 손잡이를 뜨거운 쪽으로 돌립니다. 그런데 물이 배관을 지나 머리에 닿기까지 2초가 걸려요. 여전히 차가우니
      더 돌립니다. 그러다 뜨거운 물이 도착하면 이미 너무 많이 돌린 뒤죠. 앗 뜨거워, 이번엔 찬 쪽으로 돌리는데 또 2초 동안은
      뜨거운 물이 계속 나옵니다. 누구나 겪는 이 장면이 균형 루프(4장)에 <b>지연</b>이 낀 구조예요. 인과지도에서는 지연이 있는
      화살표에 두 줄(∥)을 긋습니다.
    </p>

    <DelayLab />

    <ConceptCard tone="tip" title="핵심 관찰: 지연이 조정 시간을 넘보면 과잉 교정이 시작된다">
      배관 지연 2초, 조정 시간 2초(D ÷ τ = 1)이면 목표 38°C인데 머리에 닿는 물이 최고 <b>약 47°C</b>까지 올라갑니다.
      사람이 서툴러서가 아니라 <b>늦게 오는 소식</b>을 보고 고치기 때문이에요. D ÷ τ가 0.25면 넘치지 않고, 0.5면 살짝 넘치고,
      1.5면 60초가 지나도 크게 출렁이며, 약 1.6을 넘으면 출렁임이 커져 손잡이를 끝에서 끝으로 돌리게 됩니다.
      처방은 둘입니다. <b>덜 조급하게</b>(τ를 늘려 천천히 돌리기) 하거나, <b>지연을 줄이기</b>(정보를 빨리 보기)예요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="샤워기 실험에서 출렁임을 줄이는 방법으로 옳은 것은?"
      :choices="['손잡이를 덜 조급하게 돌리거나(τ 늘리기), 배관 지연을 줄인다', '손잡이를 더 빨리 돌린다', '목표 온도를 높인다', '처음 물 온도를 낮춘다']"
      :answer="0"
      :hints="['실험에서 τ를 늘려 보고, D를 줄여 보세요.']"
      explanation="출렁임의 세기는 D ÷ τ가 정합니다. τ를 늘려 천천히 고치거나 D를 줄여 빨리 보면 비율이 작아져 과잉 교정이 줄어요. 더 빨리 돌리면(τ를 줄이면) 오히려 더 크게 출렁입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 지연의 두 종류와 EMA</h2>
    <ReviewFlag id="ch6-s2" chapter="ch6" label="2. 지연의 두 종류와 EMA" />
    <p class="leading-relaxed text-slate-700">
      지연에는 두 종류가 있습니다. 샤워기 배관 속의 물, 배송 중인 주문, 교육 중인 신입 사원처럼 <b>물건이 이동하는 데</b>
      걸리는 물질 지연, 그리고 한 달 늦게 집계되는 지표, 평균을 내서 보는 숫자처럼 <b>소식이 늦게 반영되는</b> 정보 지연이에요.
      정보 지연의 가장 단순한 모양은 4장의 균형 루프와 똑같습니다. "보이는 값"이 "실제 값"을 목표로 쫓아가는 거예요.
    </p>
    <MathBlock expr="\frac{d\,\text{보이는 값}}{dt} = \frac{\text{실제 값} - \text{보이는 값}}{\tau} \quad\xrightarrow{\ \text{오일러법 } (DT = 1)\ }\quad m_k = \beta\, m_{k-1} + (1 - \beta)\, g_k, \quad \beta = 1 - \frac{1}{\tau}" />
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      왼쪽은 1차 정보 지연(시스템 다이내믹스 도구의 SMOOTH 함수), 오른쪽은 5장의 오일러법으로 한 걸음씩 계산한 모양입니다.
      <b>m</b>은 보이는 값, <b>g</b>는 매 걸음 새로 들어온 실제 값, <b>β</b>(베타)는 "이전에 보던 값을 얼마나 남기나"예요.
      8부 4장에서 배운 <b>지수이동평균(EMA)</b>이 바로 이 식이고, 평균 지연은 τ = 1/(1 − β) 걸음입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 물질 지연 / 정보 지연 / 1차 지연·지수 평활 / 과잉 교정 / 출렁임">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li><b>물질 지연</b> (material delay). 물건·사람이 이동하거나 처리되는 데 걸리는 시간. 배관 속 물, 배송 중인 주문, 채용 후 적응 기간.</li>
        <li><b>정보 지연</b> (information delay). 상황이 바뀐 것을 알아채는 데 걸리는 시간. 늦게 집계되는 지표, 평균 내서 보는 숫자.</li>
        <li><b>1차 지연·지수 평활</b> (first-order delay, exponential smoothing). 보이는 값이 실제 값과의 차이를 τ에 걸쳐 메우는 가장 단순한 지연. 걸음 단위로 쓰면 EMA.</li>
        <li><b>과잉 교정</b> (overshoot). 늦게 온 정보를 보고 계속 고치다 목표를 지나치는 것. 비유로는 <b>샤워기 온도 맞추기</b>.</li>
        <li><b>출렁임</b> (oscillation). 목표를 넘었다 모자랐다를 되풀이하는 움직임. 균형 루프에 지연이 끼면 생깁니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습: 손으로 EMA</p>
    <StepQuiz
      difficulty="easy"
      question="β = 0.9, 처음 보이는 값 m₀ = 0. 새 값이 연속 두 번 1로 들어온다(g₁ = g₂ = 1). m₁과 m₂를 구하세요."
      :steps="[
        { lhs: 'm_1 = 0.9 \\times 0 + 0.1 \\times 1 = ?', answer: 0.1, tolerance: 0.001 },
        { lhs: 'm_2 = 0.9 \\times 0.1 + 0.1 \\times 1 = ?', answer: 0.19, tolerance: 0.001 },
      ]"
      explanation="0.1 → 0.19. 실제 값은 이미 1인데 보이는 값은 한참 뒤처져 있습니다. 1 − 0.9ⁿ 꼴로 다가가서, 10걸음 뒤에야 약 65%(1 − 0.9¹⁰)를 따라잡아요. 이게 지연입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 채찍 효과: 지연이 줄줄이 이어지면</h2>
    <ReviewFlag id="ch6-s3" chapter="ch6" label="3. 채찍 효과: 지연이 줄줄이 이어지면" />
    <p class="leading-relaxed text-slate-700">
      소매점 → 도매상 → 공장으로 이어지는 공급망을 생각해 봅시다. 손님 수요가 조금 늘면 소매점은 재고가 줄어든 것을 늦게
      알아채고(정보 지연), 넉넉히 주문합니다. 주문한 물건은 늦게 도착하고(물질 지연), 그사이 또 주문하죠. 도매상은 소매점의
      커진 주문을 보고 더 크게, 공장은 그보다 더 크게 반응합니다. 손님 쪽의 작은 변화가 위로 갈수록 큰 출렁임이 되는 이 현상을
      <b>채찍 효과</b>(bullwhip effect)라고 해요. MIT에서 시스템 다이내믹스를 가르칠 때 쓰는 '맥주 게임'은 이 구조를 직접 겪게 하는
      교육용 게임인데, 참가자 대부분이 같은 출렁임을 만들어 냅니다. 사람이 아니라 구조가 만든다는 1장의 원리 그대로예요.
    </p>

    <DetailsCard title="➕ 더 깊이: 출렁임이 커지기 시작하는 선">
      샤워기 모형은 수학으로 "dV/dt = (목표 − V(t − D))/τ", 곧 D초 전의 값을 보고 고치는 미분방정식입니다(지연 미분방정식).
      이 식에는 깔끔한 경계가 알려져 있어요. D ÷ τ가 1/e ≈ 0.37보다 작으면 넘치지 않고, 0.37과 π/2 ≈ 1.57 사이면 출렁이며
      가라앉고, 1.57을 넘으면 출렁임이 커집니다. 실험에서 0.25는 넘치지 않고, 1.5는 아주 느리게 가라앉고, 1.75부터는 손잡이가
      끝에서 끝으로 돌던 것이 이 경계예요(실험은 손잡이 범위를 10~60°C로 묶어 무한히 커지지는 않게 했습니다).
      한편 저량이 두 개 이어지면 지연이 없어도 출렁일 수 있습니다. 위치와 속도라는 두 저량을 가진 모멘텀이 그래서
      골짜기를 넘나들며 출렁여요. 8장에서 이 이야기를 평형과 안정성의 언어로 정리합니다.
    </DetailsCard>

    <ReviewFlag id="ch6-ai" chapter="ch6" label="🤖 AI 연결: EMA는 1차 정보 지연, β는 지연의 길이" />
    <ConceptCard tone="ai" title="🤖 AI 연결: EMA는 1차 정보 지연, β는 지연의 길이">
      <b><PartLink :part="8" ch="ch4">8부 4장</PartLink></b>의 모멘텀은 기울기의 EMA, 곧 <b>1차 정보 지연</b>입니다.
      흔들리는 기울기를 늦게 보는 대신 덜 흔들리게 보는 장치예요. <b><PartLink :part="8" ch="ch5">8부 5장</PartLink></b> Adam의
      β₁ = 0.9는 평균 지연 약 10걸음, β₂ = 0.999는 약 1,000걸음입니다. 1/(1 − β)로 바로 읽히죠. 실험 ②에서 본 맞바꿈
      (덜 흔들림 ↔ 늦은 반응)이 β를 고르는 이유이고요. 운영 쪽에도 같은 함정이 있습니다. AI 서비스의 사용량 지표가 늦게 집계되면
      GPU를 증설하는 결정이 늘 한발 늦고, 늦은 만큼 크게 증설했다가 남아도는 GPU를 떠안는 출렁임이 생겨요. 처방도 샤워기와 같습니다.
      지표를 빨리 보거나(지연 줄이기), 증설을 조금씩 천천히 하거나(조정 시간 늘리기).
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="지연과 출렁임: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="균형 루프에 지연이 끼면 흔히 무슨 일이 생기나?"
        :choices="['목표를 지나쳤다 돌아오는 과잉 교정과 출렁임', '목표에 더 빨리 매끄럽게 닿는다', '저량이 0이 된다', '아무 변화가 없다']"
        :answer="0"
        explanation="늦게 온 정보를 보고 계속 고치니, 이미 충분히 고친 뒤에도 고치다 목표를 지나칩니다. 샤워기 온도가 출렁이는 이유예요."
      />
      <Quiz
        difficulty="easy"
        question="샤워기 온도가 출렁이는 것은 사람이 서툴러서라기보다 배관 지연이라는 구조 때문이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 같은 지연과 같은 조정 시간이면 누가 해도 비슷하게 출렁여요. 1장의 '구조가 행동을 만든다' 그대로입니다."
      />
      <Quiz
        difficulty="easy"
        question="물질 지연의 예는?"
        :choices="['이미 보냈지만 아직 도착하지 않은 주문', '한 달 늦게 집계되는 지표', '평균 내서 보는 숫자', '어제 본 뉴스']"
        :answer="0"
        explanation="물건이 이동하는 데 걸리는 시간이 물질 지연입니다. 나머지는 소식이 늦게 반영되는 정보 지연이에요."
      />
      <Quiz
        difficulty="easy"
        question="정보 지연의 예는?"
        :choices="['한 달 늦게 집계되는 사용자 지표', '배관 속을 흐르는 물', '배송 중인 택배', '교육 중인 신입 사원']"
        :answer="0"
        explanation="상황은 이미 바뀌었는데 숫자가 늦게 따라오는 것이 정보 지연입니다. 나머지는 물질 지연이에요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="배관 지연 2초, 조정 시간 2초인 샤워기에서 목표는 38°C였다. 최고 온도는 약 몇 °C였나? (정수)"
        type="numeric"
        :answer="47"
        :tolerance="0.5"
        :hints="['실험 ①의 기본값 그대로의 최고 온도를 보세요.']"
        explanation="약 47°C(47.05°C). 목표보다 9°C나 높습니다. D ÷ τ = 1이면 이 정도로 과잉 교정해요."
      />
      <Quiz
        difficulty="medium"
        question="EMA의 β가 0.9면 평균 지연은 약 몇 걸음인가? (정수)"
        type="numeric"
        :answer="10"
        :hints="['평균 지연 = 1 ÷ (1 − β)']"
        explanation="1 ÷ 0.1 = 10걸음. β = 0.99면 100걸음, 0.999면 1,000걸음입니다."
      />
      <Quiz
        difficulty="medium"
        question="1차 정보 지연 'd(보이는 값)/dt = (실제 값 − 보이는 값)/τ'의 구조는?"
        :choices="['보이는 값이 실제 값을 목표로 쫓는 균형 루프', '강화 루프', '고리가 없는 직선', '실제 값이 보이는 값을 쫓는 구조']"
        :answer="0"
        explanation="격차(실제 − 보이는 값)를 τ에 걸쳐 메우니 4장의 균형 루프와 같은 식입니다. 그래서 보이는 값은 실제 값에 지수적으로 다가가요."
      />
      <Quiz
        difficulty="medium"
        question="Adam의 β₂ = 0.999가 뜻하는 것은?"
        :choices="['약 1,000걸음을 평균 내는, 아주 느린 정보 지연', '1,000번째 걸음에만 반영한다', '학습률이 0.999다', '지연이 전혀 없다']"
        :answer="0"
        explanation="1 ÷ (1 − 0.999) = 1,000걸음. 기울기 크기의 추정치를 아주 천천히, 그만큼 안정적으로 바꾼다는 뜻입니다(8부 5장)."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="샤워기 실험에서 D ÷ τ가 약 1.6을 넘으면 어떻게 되나?"
        :choices="['출렁임이 줄지 않고 점점 커져, 손잡이를 끝에서 끝으로 돌리게 된다', '넘치지 않고 매끄럽게 다가간다', '한 번 넘치고 바로 멈춘다', '아무 변화가 없다']"
        :answer="0"
        :hints="['D = 3.5초, τ = 2초로 놓아 보세요.']"
        explanation="지연이 조정 시간보다 너무 길면 고칠수록 더 크게 어긋납니다(경계는 π/2 ≈ 1.57). 실험은 손잡이 범위를 10~60°C로 묶어서 끝에서 끝으로 오가는 모습으로 나타나요."
      />
      <Quiz
        difficulty="hard"
        question="채찍 효과(bullwhip effect)를 가장 잘 설명한 것은?"
        :choices="['공급망의 각 단계가 지연된 정보로 넉넉히 주문하면서, 손님 쪽의 작은 변화가 위로 갈수록 큰 출렁임이 되는 현상', '공장이 가장 먼저 수요를 아는 현상', '주문이 단계마다 줄어드는 현상', '재고가 늘 일정한 현상']"
        :answer="0"
        explanation="정보 지연(늦게 알아챔)과 물질 지연(늦게 도착함)이 단계마다 겹치며 과잉 교정이 증폭됩니다. 맥주 게임 참가자 대부분이 같은 출렁임을 만드는 이유가 구조에 있어요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch6')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">6장 완료! 출렁임의 정체를 알았습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        균형 루프 + 지연 = 과잉 교정, EMA = 1차 정보 지연. 다음은 7장입니다.
        강화 루프와 균형 루프가 만나 S자 곡선이 되는 순간, 지배 루프가 바뀌는 지점을 계산합니다.
      </p>
      <RouterLink
        to="/ch/ch7"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        7장: 커지다 멈추는 성장 →
      </RouterLink>
    </div>
  </article>
</template>
