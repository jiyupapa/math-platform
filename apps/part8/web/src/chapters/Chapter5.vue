<script setup lang="ts">
// 5장 — 축마다 다른 보폭: Adam (핵심). 모멘텀(β₁) + RMS(β₂) 조립, β₁·β₂·ε의 정체.
// 다시 쓰는 수학: 4장 EMA(두 개 돌린다) · 1부 1장 좌표축(축마다 다른 자).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import AdamLab from '@/components/AdamLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch5')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">5장 · 약 45분 · ⭐ 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">축마다 다른 보폭 — Adam</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      2장부터 끌고 온 마지막 숙제는 <b>보폭이 모든 축에 하나</b>라는 것. 관성(4장)으로 진동은
      다듬었지만, 가파른 축이 정한 소심한 보폭을 완만한 축도 같이 쓰는 구조는 그대로였죠.
      이번 장에서 그 구조를 부숩니다. 축마다 기울기의 <b>평소 크기</b>를 기억해 두고,
      그 크기로 <b>나눠서</b> 걷기. 그 기계의 이름이 현대 훈련의 기본값, <b>Adam</b>입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지를 가져갑니다. ① 아이디어: <b>RMS(평소 크기)로 나누면 축마다 보폭이 저절로 달라진다</b>,
      ② 조립: <b>Adam = 모멘텀(β₁) + RMS(β₂)</b>, 설정 파일의 β₁·β₂·ε이 전부 읽히게,
      ③ 결과: 지형 스케일에 둔감해진다. <b>지형이 100배 가파라져도 같은 설정으로 생존</b>.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 아이디어: 평소 크기로 나누기</h2>
    <ReviewFlag id="ch5-s1" chapter="ch5" label="1. 아이디어: 평소 크기로 나누기" />
    <p class="leading-relaxed text-slate-700">
      관찰 하나에서 출발합니다: 가파른 축은 기울기가 <b>늘 큽니다</b>(곡률이 크니까), 완만한 축은
      늘 작아요. 그렇다면 축마다 기울기의 평소 크기를 추적해 두고, 걸을 때 <b>그 크기로 나눠</b>
      버리면? 늘 크던 축은 크게 나눠져 <b>미세 보폭</b>이 되고, 늘 작던 축은 조금만 나눠져
      <b>성큼 보폭</b>이 됩니다. "평소 크기"는 4장에서 배운 기계로 추적합니다.
      <b>g²의 EMA</b>를 돌리고 제곱근을 씌운 것(이름: <b>RMS</b>). 이 아이디어 하나가 얼마나
      강력한지, 경주로 확인하세요. 특히 <b>지형 B</b>를 꼭.
    </p>

    <AdamLab />

    <ConceptCard tone="tip" title="핵심 관찰: 스케일 불변이라는 초능력">
      지형 B(곡률 100배)에서 GD·모멘텀은 같은 설정 그대로 <b>폭발</b>했습니다. 2장의 경계
      2/c 가 100분의 1로 내려왔으니까요. Adam 만 살아남은 이유는 실험 ②가 보여 줍니다:
      RMS 나누기가 기울기의 <b>크기를 지우고 방향만 남겨서</b>, 걸음이 지형의 가파름과 무관하게
      lr 근처로 일정해요. 지형이 어떻게 생겼든 보폭 설정이 크게 어긋나지 않는 것,
      <b>Adam 이 기본값이 된 이유</b>가 이 관대함입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="RMS(평소 크기)로 나누는 것이 '축마다 다른 보폭'이 되는 이유는?"
      :choices="['기울기가 늘 큰(가파른) 축은 크게 나눠져 보폭이 작아지고, 늘 작은(완만한) 축은 보폭이 상대적으로 커져서', '나누기가 기울기의 방향을 바꿔 줘서', '축의 개수가 줄어들어서', 'RMS가 곡률을 직접 측정해서']"
      :answer="0"
      :hints="['유효 보폭 = lr ÷ 평소 크기. 분모가 축마다 다르죠.']"
      explanation="분모(평소 크기)가 축마다 달라서, 하나의 lr로도 축별 맞춤 보폭이 나옵니다. 2장 딜레마의 해법이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 조립: Adam의 세 줄</h2>
    <ReviewFlag id="ch5-s2" chapter="ch5" label="2. 조립: Adam의 세 줄" />
    <p class="leading-relaxed text-slate-700">
      이제 부품 두 개를 한 기계로 조립합니다. 4장의 모멘텀(방향의 EMA)과 오늘의 RMS(크기의 EMA):
    </p>
    <MathBlock expr="m \leftarrow \beta_1 m + (1{-}\beta_1)\, g \qquad v \leftarrow \beta_2 v + (1{-}\beta_2)\, g^2 \qquad w \leftarrow w - lr\cdot\frac{\hat m}{\sqrt{\hat v} + \epsilon}" />
    <p class="leading-relaxed text-slate-700">
      읽는 법: "m(방향 기억, β₁)과 v(크기 기억, β₂)를 각각 EMA로 돌리고, <b>방향을 크기로 나눠</b>
      걷는다". 여기서 m·v 위의 <b>모자 ^</b>(m̂·v̂)는 EMA가 0에서 출발해 <b>초반을 과소평가하는 것을
      바로잡은 값</b>이에요. 첫 걸음부터 제 크기가 나오게 하는 자동 예열입니다(자세한 식은 아래 "더 깊이").
      이름 <b>Adam</b> 은 Adaptive moment estimation 의 줄임이에요. 여기서 <b>moment(모멘트)</b>는 통계의
      <b>평균·제곱의 평균</b>을 뜻해요(m=기울기의 평균, v=기울기²의 평균). "적응형"이 바로 축별
      보폭입니다. 설정 파일의 그 줄들이 이제 전부 읽혀요: <code>β₁ = 0.9</code>(방향 기억
      10걸음, 4장의 그 다이얼), <code>β₂ = 0.999</code>(크기 기억 1000걸음, 보폭의 자는
      천천히 바꿔야 안정), <code>ε = 1e-8</code>(기울기가 거의 0인 축에서 <b>0으로 나누기 방지</b>).
    </p>

    <ConceptCard tone="note" title="새 용어: Adam / RMS / ε(엡실론)">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>Adam</b> (Adaptive moment estimation). 읽는 법: 아담.
          뜻: 모멘텀(β₁) + 축별 적응 보폭(β₂)을 합친 옵티마이저로, 현대 LLM 훈련·파인튜닝의
          사실상 기본값(실무에선 개량형 AdamW, 8장).
        </li>
        <li>
          <b>RMS</b> (root mean square). 읽는 법: 알엠에스.
          뜻: <b>제곱의 평균의 제곱근</b>, 곧 부호를 지운 "평소 크기". Adam 의 √v̂ 가 이것이며,
          이 아이디어만 단독으로 쓴 선배가 RMSProp 입니다.
        </li>
        <li>
          <b>ε</b> (epsilon). 읽는 법: 엡실론.
          뜻: 분모에 더하는 아주 작은 수(보통 1e-8)로, 평소 크기가 0에 가까운 축에서
          나누기가 폭주하는 것을 막는 안전핀.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">Adam = 방향은 모멘텀(β₁), 보폭은 평소 크기로 나눠서(β₂). 그래서 지형 스케일에 둔감하다</p>
      <p class="mt-1 text-sm text-indigo-600">EMA 두 개로 만든, 축마다 다른 자. 이것이 Adam 이 기본값인 이유입니다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="지형 B(곡률 100배)에서 Adam만 폭발하지 않은 이유는?"
      :choices="['기울기를 평소 크기로 나누므로 걸음 크기가 지형의 가파름과 무관하게 lr 근처로 일정해서', 'Adam의 학습률이 훨씬 작아서', 'Adam은 기울기를 쓰지 않아서', '우연: 다시 하면 폭발한다']"
      :answer="0"
      explanation="스케일 불변이에요. 곡률이 100배면 기울기도 100배지만 분모(평소 크기)도 100배라 걸음은 그대로입니다. 결정적 현상이라 몇 번을 돌려도 같아요."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="Adam의 ε(엡실론)은 평소 크기가 0에 가까운 축에서 0으로 나누기가 폭주하는 것을 막는 안전핀이다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 기울기가 거의 없던 축은 √v̂ ≈ 0이라, ε이 없으면 그 축의 보폭이 폭발합니다. 설정 파일의 eps: 1e-8이 이것."
    />

    <DetailsCard title="➕ 더 깊이: 예열 보정, β₂가 유독 큰 이유, 그리고 Adam의 청구서">
      ① 수식의 모자(^) = <b>편향 보정</b>(bias correction): EMA 는 0에서 출발하므로 초반 몇
      걸음은 실제보다 과소평가됩니다. m̂ = m/(1−β₁ᵗ) 로 나눠 주면 첫 걸음부터 제 크기가 나와요.
      일종의 자동 예열이에요. ② <b>β₂ = 0.999</b> 가 β₁(0.9)보다 훨씬 큰 이유: 보폭의 자(평소
      크기)가 출렁이면 걸음 전체가 불안정해지므로, 크기 기억(1000걸음)은 방향 기억(10걸음)보다
      훨씬 길게 잡습니다. ③ <b>청구서</b>: Adam 은 파라미터마다 m·v 두 값을 더 저장합니다.
      7B 모델이면 옵티마이저 상태가 모델 무게의 <b>2배</b>. "파인튜닝은 추론보다 메모리가 훨씬
      필요하다"의 주범이고, 이를 줄인 8-bit Adam 같은 변형이 나온 배경입니다.
      ④ 실무 이름 <b>AdamW</b>: Adam + weight decay 결합 방식의 개선. 자세한 내용은 정규화(8장)에서 다룹니다.
    </DetailsCard>

    <ReviewFlag id="ch5-ai" chapter="ch5" label="🤖 AI 연결 · 다시 쓰는 수학: 4장 EMA × 2 · 1부 1장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 · 다시 쓰는 수학: 4장 EMA × 2 · 1부 1장">
      Adam 에 새 수학은 없습니다. 4장의 <b>EMA 를 두 개</b>(방향 m, 크기 v) 돌리고 나눗셈
      하나를 얹은 조립품이에요. 그리고 "축마다 다른 자"라는 발상은
      <b><PartLink :part="1" ch="ch1">1부 1장</PartLink></b>에서 좌표축을 처음 만났을 때의 그림 그대로,
      각 축이 자기 눈금을 갖는다는 것입니다. GPT 의 사전학습부터 여러분이 만질 파인튜닝까지
      옵티마이저 줄은 거의 언제나 <code>adamw</code>입니다. 이제 그 줄과 β₁·β₂·ε 값이 전부
      읽힙니다. 남은 다이얼은 시간축이에요. 여행 <b>단계마다</b> 보폭을 바꾸는 일정표(6장).
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="Adam: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="Adam의 두 부품을 옳게 짝지은 것은?"
        :choices="['모멘텀(β₁, 방향의 EMA) + RMS(β₂, 크기의 EMA)', '학습률 + 배치 크기', '드롭아웃 + weight decay', '워밍업 + 코사인 감쇠']"
        :answer="0"
        explanation="방향 기억과 크기 기억, 이 EMA 두 개의 조립품이 Adam(Adaptive moment estimation)입니다."
      />
      <Quiz
        difficulty="easy"
        question="RMS로 나눈 뒤의 기울기에 주로 남는 정보는?"
        :choices="['방향(부호): 크기는 1 근처로 표준화된다', '크기: 방향은 사라진다', '곡률의 정확한 값', '아무것도 남지 않는다']"
        :answer="0"
        explanation="실험 ②의 스케일 지우개예요. 5짜리든 0.05짜리든 나누면 ±1 근처. 축마다 자기 자로 정규화되는 것이죠."
      />
      <Quiz
        difficulty="easy"
        question="β₂ = 0.999의 유효 기억 길이는 약 몇 걸음? (1/(1−β₂))"
        type="numeric"
        :answer="1000"
        explanation="1/(1−0.999) = 1000걸음. 보폭의 자는 천천히 바꿔야 안정되기에 방향 기억(10걸음)보다 훨씬 깁니다."
      />
      <Quiz
        difficulty="easy"
        question="Adam은 축마다 유효 보폭이 자동으로 달라진다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 유효 보폭 = lr ÷ 그 축의 평소 크기. 실험 ①에서 가파른 y축은 미세, 완만한 x축은 성큼이었죠."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="lr = 0.3인 Adam에서 축 A의 기울기 평소 크기(√v̂)는 4, 축 B는 0.5입니다. 각 축의 유효 보폭을 구하세요."
        :steps="[
          { lhs: '\\text{축 A: } 0.3 \\div 4', answer: 0.075 },
          { lhs: '\\text{축 B: } 0.3 \\div 0.5', answer: 0.6 },
        ]"
        :hints="['유효 보폭 = lr ÷ 평소 크기.', '가파른 축이 미세 보폭이 됩니다.']"
        explanation="A는 0.075, B는 0.6. 하나의 lr에서 8배 다른 보폭이 저절로 나옵니다. 2장 딜레마(단일 보폭)의 해법이에요."
      />
      <Quiz
        difficulty="medium"
        question="GD·모멘텀이 지형 B(곡률 100배)에서 폭발한 이유를 2장의 공식으로 설명하면?"
        :choices="['발산 경계 2/c가 100분의 1로 내려왔는데 보폭은 그대로라 경계를 한참 넘어서', '기울기의 방향이 반대가 되어서', '스텝 수가 부족해서', '데이터가 바뀌어서']"
        :answer="0"
        explanation="c가 8 → 800이면 경계는 0.25 → 0.0025라서 lr 0.2는 80배 초과입니다. Adam은 나누기로 이 문제 자체를 우회했죠."
      />
      <Quiz
        difficulty="medium"
        question="편향 보정(m̂ = m/(1−β₁ᵗ))이 필요한 이유는?"
        :choices="['EMA가 0에서 출발해 초반 몇 걸음은 실제보다 과소평가되기 때문(보정으로 첫 걸음부터 제 크기)', '기울기가 음수일 수 있어서', 'β₁이 1보다 커질 수 있어서', '보정은 사실 필요 없다']"
        :answer="0"
        :hints="['t=1일 때 m = (1−β₁)g = 0.1g, 실제 기울기의 10분의 1이죠.']"
        explanation="초반 과소평가를 1−β₁ᵗ로 나눠 되살립니다. 자동 예열 장치인 셈이에요."
      />
      <Quiz
        difficulty="medium"
        question="Adam이 '기본값'의 자리를 차지한 실용적 이유로 가장 알맞은 것은?"
        :choices="['지형 스케일에 둔감해 학습률 튜닝이 관대하다. 웬만한 설정으로도 안정적으로 굴러간다', '메모리를 가장 적게 써서', '수학적으로 항상 전역최소를 찾아서', '이름이 외우기 쉬워서']"
        :answer="0"
        explanation="속도가 최고라서가 아니라 실패가 적어서예요. 축별 정규화가 주는 관대함이 실무 기본값의 자격입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="7B(70억) 파라미터 모델을 Adam으로 파인튜닝할 때 옵티마이저 상태의 메모리 대가는?"
        :choices="['파라미터마다 m·v 두 값을 더 저장: 모델 무게의 약 2배가 추가로 필요', '추가 메모리 없음', '파라미터당 1비트', '모델 무게의 절반']"
        :answer="0"
        :hints="['더 깊이 카드: Adam의 청구서.']"
        explanation="m과 v가 파라미터 수만큼 필요해요. 파인튜닝이 추론보다 메모리를 훨씬 먹는 주범이고, 8-bit Adam·LoRA(6부 8장) 같은 절약술의 배경입니다."
      />
      <Quiz
        difficulty="hard"
        question="Adam을 쓰는데도 훈련 초반에 폭발했습니다. 이 장의 관점에서 가장 그럴듯한 원인과 처방은?"
        :choices="['초반엔 v̂(크기 추정)가 아직 불안정한데 lr 자체도 커서: lr을 낮추거나 초반만 조심하는 워밍업(6장)을 쓴다', 'Adam은 절대 폭발하지 않으므로 하드웨어 고장이다', 'β₂를 0으로 낮추면 해결된다', 'ε을 크게 하면 항상 해결된다']"
        :answer="0"
        :hints="['정규화가 완벽해지려면 평소 크기 추정이 먼저 쌓여야 합니다. 초반은?']"
        explanation="스케일 불변도 만능은 아닙니다. 크기 추정이 서기 전의 초반 몇백 스텝이 취약 구간이고, 그래서 실전 설정에 warmup_steps가 있어요(다음 장)."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch5')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">5장 완료! 현대 훈련의 기본기를 조립했어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        설정 파일의 optimizer 줄이 전부 읽힙니다. 다음은 시간축입니다. 여행 단계마다 보폭을
        바꾸는 일정표(워밍업·코사인 감쇠)와 warmup_steps를 봅니다.
      </p>
      <RouterLink
        to="/ch/ch6"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        6장: 여행 일정표, 학습률 스케줄 →
      </RouterLink>
    </div>
  </article>
</template>
