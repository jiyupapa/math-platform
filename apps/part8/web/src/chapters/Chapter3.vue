<script setup lang="ts">
// 3장 — 흔들리는 나침반: 미니배치 SGD. 기울기 = 표본 추정치(σ/√B), 노이즈의 순기능.
// 회수하는 수학: 3부 5장 기댓값 · 3부 7장 큰 수의 법칙 (시리즈 네 번째 1/√n).
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import MiniBatchLab from '@/components/MiniBatchLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch3')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">3장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">흔들리는 나침반 — 미니배치 SGD</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      지금까지 나침반(기울기)이 정확하다고 가정했습니다. 그런데 진짜 기울기는 <b>훈련 데이터
      전체</b>에 대한 평균이에요 — 데이터가 수십억 개라면 한 걸음 방향을 정하려고 매번 전체를
      계산하는 건 미친 짓이죠. 그래서 실전은 <b>일부만 뽑아 물어봅니다</b>. 그 순간 나침반은
      흔들리는 추정치가 되는데 — 놀랍게도 이 흔들림은 비용 절감을 넘어 <b>여행을 구해 주는</b>
      성질까지 갖고 있습니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지를 가져갑니다 — ① 기울기는 <b>표본 추정치</b>이고 흔들림은 <b>σ/√B</b>(또 그 1/√n!),
      ② 배치 크기의 트레이드오프: <b>정확도는 √B, 비용은 B</b> — 그래서 미니배치가 정답,
      ③ 노이즈의 순기능: 흔들림이 <b>얕은 웅덩이 탈출</b>을 공짜로 준다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 나침반의 정체 — 평균, 그리고 표본</h2>
    <p class="leading-relaxed text-slate-700">
      손실은 데이터별 손실의 평균이라, 기울기도 <b>데이터별 기울기의 평균</b>입니다.
      데이터 하나하나는 저마다 조금씩 다른 방향을 가리켜요("이 문장 기준으론 이쪽!") —
      진짜 나침반은 그 수십억 개의 평균이고, 미니배치 B개로 낸 평균은 그 <b>표본 추정</b>입니다.
      3부 5장의 기댓값·표본 평균 이야기 그대로죠. 그리고 표본 평균의 흔들림이라면
      우리는 공식도 압니다:
    </p>
    <MathBlock expr="\text{나침반의 흔들림} \;\approx\; \frac{\sigma}{\sqrt{B}} \qquad (B = \text{배치 크기})" />

    <MiniBatchLab />

    <ConceptCard tone="tip" title="핵심 관찰 — √B의 수확 체감, 그리고 반전">
      실험 ①: 배치를 4배 키우면 흔들림은 <b>절반</b>만 줍니다 — 정확도는 √B로 늘고 비용은 B로
      늘어서, 어느 지점부터는 <b>비싼 정확도</b>가 돼요. 그래서 "적당히 흔들리는 중간 크기
      배치"가 실전의 정답. 그리고 실험 ②의 반전 — 완벽한 나침반(GD)은 얕은 웅덩이에 갇혔지만
      흔들리는 나침반(SGD)은 <b>흔들림 덕분에 언덕을 넘어</b> 더 깊은 골짜기에 도착했습니다.
      1장의 국소최소 문제에 대한 뜻밖의 처방이 이미 노이즈 안에 있었던 거예요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="미니배치로 계산한 기울기가 '추정치'인 이유는?"
      :choices="['진짜 기울기(전체 데이터 평균)를 일부 표본 B개의 평균으로 근사한 것이라서', '컴퓨터의 반올림 오차 때문에', '기울기 공식이 근사식이라서', '추정치가 아니다 — 항상 정확하다']"
      :answer="0"
      explanation="여론조사와 같은 구조입니다 — 전체(모집단)의 평균을 표본으로 추정하는 것. 그래서 3부의 표본 수학이 그대로 적용돼요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 이름표 달기 — SGD와 그 친구들</h2>

    <ConceptCard tone="note" title="새 용어: 미니배치·배치 크기 / SGD / 에포크">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>미니배치 / 배치 크기</b> (mini-batch / batch size, 약자 B) — 읽는 법: 미니배치/배치 사이즈.
          뜻: 한 스텝의 기울기를 계산할 때 쓰는 <b>데이터 묶음 / 그 개수</b>.
          설정 파일의 <code>batch_size</code>가 이것 — 워밍업에서 예고한 두 번째 다이얼입니다.
        </li>
        <li>
          <b>SGD</b> (Stochastic Gradient Descent) — 읽는 법: 에스지디, 확률적 경사하강.
          뜻: 미니배치의 <b>흔들리는(확률적) 기울기</b>로 걷는 경사하강. 현대 훈련의 기본형이며,
          모멘텀·Adam(4~5장)도 전부 이 위에 얹힙니다.
        </li>
        <li>
          <b>에포크</b> (epoch) — 읽는 법: 에포크.
          뜻: 훈련 데이터 <b>전체를 한 바퀴</b> 도는 단위. 데이터 N개·배치 B면 한 에포크 =
          N/B 스텝 — 설정 파일의 <code>num_epochs</code>가 이것입니다.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">나침반은 σ/√B 만큼 흔들린다 — 그리고 그 흔들림이 얕은 웅덩이에서 여행자를 구한다</p>
      <p class="mt-1 text-sm text-indigo-600">정확도는 √B, 비용은 B — 적당히 흔들리는 것이 이득입니다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="배치 크기를 16에서 64로(4배) 키우면 나침반의 흔들림은?"
      :choices="['절반으로 준다 (1/√4 = 1/2)', '4분의 1로 준다', '변화 없다', '4배로 커진다']"
      :answer="0"
      :hints="['흔들림 ∝ 1/√B — √4는?']"
      explanation="√B 스케일링 — 4배 비용을 내고 절반의 개선. 수확 체감이라 무한정 키우는 건 손해입니다."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="기울기의 노이즈는 훈련에 항상 해롭다."
      type="truefalse"
      :answer="1"
      explanation="거짓입니다. 실험 ②의 반전 — 흔들림이 얕은 국소최소를 넘게 해 줬죠. 노이즈는 비용 절감의 부산물이면서 공짜 탈출 장치이기도 합니다."
    />

    <DetailsCard title="➕ 더 깊이: 실전의 배치 크기는 누가 정하나">
      실전에서 <code>batch_size</code>의 첫 상한은 수학이 아니라 <b>GPU 메모리</b>입니다 —
      배치가 클수록 한 번에 올려야 하는 활성값이 커져서, "메모리에 들어가는 최대치 근처"가
      흔한 출발점이에요. 두 번째 고려는 오늘의 수학: 배치를 키워 노이즈가 줄면 <b>더 큰 보폭을
      감당할 수 있어서</b>, 배치를 k배 키우면 학습률도 함께 키우는 관행이 있습니다(이름은
      <b>linear scaling rule</b> — 대규모 훈련 논문들의 단골). 마지막으로 산수 하나 —
      스텝 수 = (N/B) × 에포크 수. 배치를 키우면 한 에포크의 스텝 수가 줄어드는데,
      "스텝이 줄었는데 왜 성능이 떨어지지?"라는 실전 사고의 절반이 이 산수를 놓친 데서 나옵니다.
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 3부 5장 · 3부 7장">
      나침반의 과녁(기댓값)은 <b><PartLink :part="3" ch="ch5">3부 5장</PartLink></b>이고, 흔들림의
      공식 σ/√B는 <b><PartLink :part="3" ch="ch7">3부 7장</PartLink></b> 큰 수의 법칙 — 이 시리즈에서
      1/√n을 만나는 <b>네 번째 자리</b>입니다(표본 평균 → 고차원 코사인의 바닥(7부 4장) →
      평가 세트 오차(7부 7장) → 오늘의 기울기 노이즈). GPT 훈련의 배치는 <b>수백만 토큰</b>
      단위인데도 전체 데이터에 비하면 티끌이라, 그 거대한 훈련조차 흔들리는 나침반으로 걷고
      있어요. 다음 문제는 이 흔들림과 좁은 골짜기가 만났을 때의 <b>지그재그</b> — 관성(모멘텀)이
      등장할 차례입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="미니배치 SGD — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="미니배치란?"
        :choices="['한 스텝의 기울기 계산에 쓰는 데이터 묶음', '작은 모델의 별명', 'GPU의 부품', '훈련 데이터 전체']"
        :answer="0"
        explanation="전체 대신 B개만 뽑아 평균 — 비용을 아끼는 대신 나침반이 흔들리게 됩니다."
      />
      <Quiz
        difficulty="easy"
        question="SGD의 풀네임과 뜻은?"
        :choices="['Stochastic Gradient Descent — 흔들리는(확률적) 기울기로 걷는 경사하강', 'Super Great Descent — 아주 좋은 하강', 'Single GPU Device — GPU 한 장', 'Standard Gradient Data — 표준 기울기 데이터']"
        :answer="0"
        explanation="확률적 경사하강 — 미니배치 노이즈가 이름에 들어 있는(stochastic) 현대 훈련의 기본형입니다."
      />
      <Quiz
        difficulty="easy"
        question="배치 크기를 키우면 기울기 추정의 흔들림은 줄어든다."
        type="truefalse"
        :answer="0"
        explanation="참입니다 — 단, 1/√B 라서 수확 체감이 있고, 비용은 B에 정비례한다는 게 함정이죠."
      />
      <Quiz
        difficulty="easy"
        question="데이터 1,000개를 배치 크기 50으로 훈련하면 한 에포크는 몇 스텝인가요?"
        type="numeric"
        :answer="20"
        explanation="1,000 ÷ 50 = 20스텝 — 에포크 산수는 설정 파일 읽기의 기본기입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="배치 크기를 16에서 256으로 키웠습니다. 흔들림이 몇 분의 1이 되는지 구하세요."
        :steps="[
          { lhs: '\\text{배치 배율 } 256 \\div 16', answer: 16 },
          { lhs: '\\sqrt{16}', answer: 4 },
        ]"
        :hints="['먼저 몇 배 커졌는지.', '흔들림은 √배율 분의 1 — 답은 분모.']"
        explanation="16배 비용을 들여 흔들림은 1/4 — √B 수확 체감의 실감 나는 예입니다."
      />
      <Quiz
        difficulty="medium"
        question="실험 ②에서 완벽한 나침반(GD)이 얕은 웅덩이를 벗어나지 못한 이유는?"
        :choices="['웅덩이 바닥에서 기울기가 0이라 어떤 방향으로도 밀어 주는 힘이 없어서', '학습률이 너무 커서', '데이터가 부족해서', '컴퓨터 버그']"
        :answer="0"
        explanation="1장의 국소최소 조건 그대로 — 결정적 경사하강에게 기울기 0은 종착역입니다. SGD의 노이즈만이 그 자리를 흔들어 줬죠."
      />
      <Quiz
        difficulty="medium"
        question="같은 계산 예산에서 '작은 배치 × 많은 스텝'이 '큰 배치 × 적은 스텝'보다 유리할 수 있는 이유는?"
        :choices="['스텝 수 자체가 많아 지형을 더 여러 번 걷고, 노이즈의 탈출 효과도 얻기 때문', '작은 배치가 기울기를 더 정확히 재기 때문', '큰 배치는 항상 폭발하기 때문', '유리할 수 없다 — 큰 배치가 항상 낫다']"
        :answer="0"
        explanation="정확도는 √B로만 늘어서, 같은 비용이면 걸음 수를 버는 쪽이 이득인 구간이 넓습니다 — 물론 극단은 양쪽 다 손해라 실전은 중간."
      />
      <Quiz
        difficulty="medium"
        question="설정 파일의 num_epochs = 3, 데이터 10만 개, batch_size = 100이면 총 스텝 수는?"
        :choices="['3,000 스텝 (10만/100 × 3)', '300 스텝', '3만 스텝', '100만 스텝']"
        :answer="0"
        :hints="['한 에포크 = N/B 스텝, 그것을 에포크 수만큼.']"
        explanation="1,000스텝 × 3에포크 = 3,000. 배치를 바꾸면 스텝 수가 함께 변한다는 것 — 실전 사고의 단골 원인입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="배치를 256→1024로 키웠더니(다른 설정 그대로) 훈련은 안정됐는데 최종 성능이 떨어졌습니다. 이 장의 관점에서 가능한 원인 짝은?"
        :choices="['노이즈가 줄어 얕은 최소 탈출력이 약해졌고, 에포크당 스텝 수도 1/4로 줄었는데 보정하지 않았다', '큰 배치는 기울기를 틀리게 계산한다', '메모리가 남아돌아서', '성능 하락은 배치와 무관하다']"
        :answer="0"
        :hints="['노이즈의 순기능 + 스텝 산수 — 두 가지가 동시에 움직였습니다.']"
        explanation="흔들림 감소(탈출력↓)와 스텝 수 감소가 겹친 전형적 사례 — 처방은 lr 상향(linear scaling), 에포크 추가, 또는 배치 원복입니다."
      />
      <Quiz
        difficulty="hard"
        question="'노이즈가 좋다면 일부러 더 크게 넣으면 되지 않나?'에 대한 균형 잡힌 답은?"
        :choices="['탈출에는 돕지만 골짜기 바닥 근처에선 정착을 방해한다 — 초반엔 크게, 후반엔 작게가 이상적이고 그 조절이 6장(스케줄)의 주제', '노이즈는 많을수록 무조건 좋다', '노이즈는 어떤 경우에도 해롭다', '노이즈 크기는 조절할 수 없다']"
        :answer="0"
        :hints="['실험 ②의 🟠가 깊은 골짜기에 도착한 뒤에도 계속 들썩이던 것을 떠올려 보세요.']"
        explanation="탐색(초반)에는 흔들림이, 정착(후반)에는 고요함이 필요합니다 — 학습률·배치로 노이즈 세기를 단계별로 조절하는 것이 스케줄(6장)의 한 얼굴이에요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch3')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">3장 완료 — 흔들림의 수학을 손에 넣었어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 4장 — 좁고 긴 골짜기에서 나침반이 벽 사이를 지그재그로 튕기는 문제,
        그리고 그 해법인 관성(모멘텀)입니다. 공을 굴려 봅시다.
      </p>
      <RouterLink
        to="/ch/ch4"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        4장 — 관성으로 달리기, 모멘텀 →
      </RouterLink>
    </div>
  </article>
</template>
