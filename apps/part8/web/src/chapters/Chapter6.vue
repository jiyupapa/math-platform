<script setup lang="ts">
// 6장 — 여행 일정표: 학습률 스케줄. 워밍업·코사인 감쇠 — warmup_steps·lr_scheduler의 정체.
// 회수하는 수학: 6부 3장(SFT 설정 직결) · 2·3·5장(감쇠·서성임·Adam 예열의 근거).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import LrScheduleLab from '@/components/LrScheduleLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch6')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">6장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">여행 일정표 — 학습률 스케줄</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      지금까지 보폭은 훈련 내내 <b>하나의 값</b>이었습니다. 그런데 여행의 국면은 셋이에요 —
      낯선 출발 직후, 신나게 내려가는 중반, 바닥에 정확히 앉아야 하는 마지막.
      국면마다 필요한 보폭이 다르다면, 보폭에도 <b>일정표</b>를 줘야죠.
      설정 파일의 <code>warmup_steps</code>와 <code>lr_scheduler</code>가 바로 그 일정표입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지를 가져갑니다 — ① 감쇠의 이유: 바닥 근처에서 <b>서성임 반경이 보폭을 따라간다</b>,
      ② 워밍업의 이유: <b>출발 직후가 취약 구간</b>(Adam의 자 예열 + 낯선 초기 지형),
      ③ 표준 일정표의 모양: <b>워밍업 → 코사인 감쇠</b> — 설정 파일 두 줄이 마저 읽히게.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 마지막 구간의 문제 — 정착</h2>
    <ReviewFlag id="ch6-s1" chapter="ch6" label="1. 마지막 구간의 문제 — 정착" />
    <p class="leading-relaxed text-slate-700">
      3장에서 나침반이 흔들린다는 걸 배웠죠. 그 흔들림은 여행 내내 있지만, <b>바닥 근처에서
      본색을 드러냅니다</b> — 기울기(진짜 신호)는 0에 가까워지는데 노이즈는 그대로라,
      걸음이 온통 노이즈 × 보폭이 돼요. 결과: 바닥에 도착하고도 그 주위를 <b>영원히
      서성입니다</b>. 서성임 반경은 보폭을 줄이면 함께 줄어들고요 — 그렇다면 답은 자명합니다:
      <b>후반으로 갈수록 보폭을 줄여라.</b> 세 가지 일정표를 경주시켜 확인해 보세요.
    </p>

    <LrScheduleLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 고정 보폭으로는 못 얻는 것">
      경주의 결론: <b>큰 고정 보폭은 빠르지만 정착 못 하고, 작은 고정 보폭은 정착하지만
      느립니다.</b> 속도와 정착은 보폭 하나로는 <b>동시에</b> 못 얻는 트레이드오프인데 —
      일정표(초반 성큼, 후반 잔걸음)는 시간축으로 둘을 다 가져요. 실험 ②가 그 밑의 물리학:
      바닥에서의 서성임 반경이 보폭과 함께 줄어드는 것(√보폭 비례), 그게 감쇠의 존재 이유입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="훈련 후반에 학습률을 줄여야 하는 이유는?"
      :choices="['바닥 근처에선 노이즈×보폭이 걸음을 지배해, 보폭을 줄여야 서성임 반경이 줄고 깊이 정착하므로', '후반엔 기울기가 커져서 위험하므로', 'GPU가 뜨거워지는 것을 막으려고', '데이터가 소진되기 때문']"
      :answer="0"
      :hints="['실험 ②에서 슬라이더를 줄일 때 반경이 어떻게 됐죠?']"
      explanation="신호(기울기)는 0에 가까워지는데 노이즈는 남는 구간 — 보폭이 곧 서성임 반경을 정합니다. 감쇠는 사치가 아니라 정착의 조건이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 첫 구간의 문제 — 낯선 출발</h2>
    <ReviewFlag id="ch6-s2" chapter="ch6" label="2. 첫 구간의 문제 — 낯선 출발" />
    <p class="leading-relaxed text-slate-700">
      반대쪽 끝, 출발 직후도 취약 구간입니다. 이유가 둘이에요 — ① 5장에서 봤듯 Adam 의
      <b>자(v̂, 평소 크기 추정)가 아직 서 있지 않아</b> 나누기가 불안정하고, ② 무작위 초기화로
      떨어진 자리는 지형이 낯설고 가팔라 <b>2장의 경계를 어디서 넘을지 모릅니다</b>.
      처방은 소박합니다 — 처음 몇백 스텝은 보폭을 0에서 목표치까지 <b>서서히 올리는 것</b>,
      이름하여 <b>워밍업</b>. 설정 파일의 <code>warmup_steps: 100</code>이 이 구간의 길이입니다.
    </p>
    <p class="mt-2 leading-relaxed text-slate-700">
      워밍업이 끝나면 표준 일정표는 부드러운 하강 곡선을 탑니다 — 가장 흔한 모양이
      코사인 곡선의 반쪽을 닮은 <b>코사인 감쇠</b>예요. (cos 를 안 배웠어도 괜찮습니다 —
      "1에서 −1까지 부드럽게 내려오는 곡선"이고, π 는 그 반 바퀴의 끝 지점이라고만 알면
      아래 식이 읽혀요):
    </p>
    <MathBlock expr="lr(t) \;=\; lr_{max}\cdot\tfrac{1}{2}\Big(1 + \cos\tfrac{\pi\, t}{T}\Big) \qquad (T = \text{전체 스텝 수})" />

    <ConceptCard tone="note" title="새 용어: 워밍업 / 코사인 감쇠 / 스텝 감쇠">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>워밍업</b> (warmup) — 읽는 법: 워밍업.
          뜻: 훈련 시작 후 일정 스텝 동안 lr을 <b>0에서 목표치까지 서서히 올리는</b> 구간 —
          설정의 <code>warmup_steps</code>. Adam 의 자 예열 + 낯선 초기 지형 보호.
        </li>
        <li>
          <b>코사인 감쇠</b> (cosine decay / annealing) — 읽는 법: 코사인 디케이.
          뜻: lr을 코사인 반쪽 곡선으로 <b>부드럽게 0까지</b> 내리는 표준 감쇠 —
          설정의 <code>lr_scheduler: cosine</code>. 중반엔 완만히, 끝에선 잔걸음.
        </li>
        <li>
          <b>스텝 감쇠</b> (step decay) — 읽는 법: 스텝 디케이.
          뜻: 정해진 시점마다 lr을 <b>계단식으로 뚝뚝</b> 내리는 고전 방식 — 손실 곡선에
          특유의 계단 무늬를 남깁니다(9장 판독에서 재회).
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">출발은 조심(워밍업), 중반은 성큼, 도착 전엔 잔걸음(감쇠) — 좋은 여행은 보폭의 일정표를 갖는다</p>
      <p class="mt-1 text-sm text-indigo-600">속도와 정착 — 보폭 하나로는 못 얻는 둘을 시간축이 얻어 줍니다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="워밍업이 보호하는 '출발 직후의 취약함' 두 가지는?"
      :choices="['Adam의 평소 크기 추정(v̂)이 아직 불안정한 것 + 낯선 초기 지형에서 경계를 넘을 위험', '데이터 로딩 속도 + 디스크 용량', '워밍업은 미신이라 보호하는 것이 없다', 'GPU 온도 + 전기 요금']"
      :answer="0"
      :hints="['5장 마지막 hard 문제 — Adam인데도 초반에 폭발하던 이유.']"
      explanation="자(v̂)가 서기 전의 나누기와 낯선 지형 — 두 위험 모두 초반 한정이라, 처음만 잔걸음으로 걷는 워밍업이 정확한 처방입니다."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="코사인 감쇠에서 훈련이 끝나는 시점(t = T)의 학습률은 거의 0이다."
      type="truefalse"
      :answer="0"
      explanation="참입니다 — cos(π) = −1이라 lr(T) = 0. 마지막 걸음일수록 잔걸음이 되어 바닥에 정확히 앉습니다."
    />

    <DetailsCard title="➕ 더 깊이: 감쇠의 계보, 계단 무늬, 그리고 짧은 파인튜닝의 일정표">
      감쇠 곡선의 계보 — 요즘 기본값은 <b>코사인</b>이고, <b>선형 감쇠</b>도 흔하며(둘의 차이는
      크지 않습니다), 고전 <b>스텝 감쇠</b>는 손실 곡선에 <b>계단 무늬</b>(lr이 뚝 떨어지는 순간
      손실도 한 단 내려감)를 남겨서 훈련 일지(9장)에서 바로 알아볼 수 있어요. 이름만 알아 둘 것 —
      <b>코사인 재시작</b>(warm restarts, 감쇠 후 다시 올렸다 내리기 반복). 실전 감각 둘:
      ① 수 에포크짜리 <b>짧은 파인튜닝</b>은 "워밍업 + 상수" 또는 "워밍업 + 선형"처럼 단순한
      일정표로 충분한 경우가 많습니다. ② 3장의 linear scaling(배치 키우면 lr도)과 세트로,
      <b>배치가 클수록 워밍업도 길게</b> 잡는 관행이 있어요 — 큰 보폭일수록 예열이 더 필요하니까요.
    </DetailsCard>

    <ReviewFlag id="ch6-ai" chapter="ch6" label="🤖 AI 연결 — 회수하는 수학: 6부 3장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 6부 3장">
      <b><PartLink :part="6" ch="ch3">6부 3장</PartLink></b>에서 SFT 를 배울 때 설정 파일을 스쳐
      지나갔었죠 — 그때 읽지 못했던 <code>warmup_steps</code>와 <code>lr_scheduler</code> 두 줄이
      오늘 완독됩니다. GPT 급 사전학습 논문의 lr 곡선 그림도 이제 낯익을 거예요 — 예외 없이
      <b>워밍업 후 코사인</b>의 그 모양입니다. 이렇게 속도의 다이얼들(2~6장)이 끝났고,
      다음 질문은 방향을 바꿉니다 — <b>깊이 내려간 그 도착지, 정말 좋은 곳일까?</b>
      통째로 외운 학생의 비극, 과적합(7장)입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="학습률 스케줄 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="학습률 스케줄이란?"
        :choices="['훈련 진행에 따라 학습률을 미리 정한 곡선대로 바꾸는 것', '훈련 시간표를 달력에 적는 것', '데이터를 나누는 순서', 'GPU 사용 시간 예약']"
        :answer="0"
        explanation="보폭의 일정표 — 초반 워밍업, 중반 순항, 후반 감쇠가 표준 모양입니다."
      />
      <Quiz
        difficulty="easy"
        question="워밍업(warmup) 구간에서 학습률은?"
        :choices="['0에서 목표치까지 서서히 올라간다', '목표치에서 0으로 내려간다', '무작위로 요동친다', '변하지 않는다']"
        :answer="0"
        explanation="출발 직후의 취약 구간(자 예열·낯선 지형)을 잔걸음으로 지나는 장치 — warmup_steps가 그 길이입니다."
      />
      <Quiz
        difficulty="easy"
        question="코사인 감쇠에서 훈련 종료 시점(t = T)의 학습률은? (숫자)"
        type="numeric"
        :answer="0"
        explanation="½(1 + cos π) = 0 — 마지막 걸음은 사실상 멈춤에 가까운 잔걸음이라 바닥에 정확히 앉습니다."
      />
      <Quiz
        difficulty="easy"
        question="큰 학습률을 훈련 끝까지 고정하면, 손실이 바닥 근처에서 더 내려가지 못하고 서성인다."
        type="truefalse"
        :answer="0"
        explanation="참입니다 — 실험 ①의 고정 0.3. 노이즈 × 보폭이 정착 반경을 만들기 때문이에요."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="lr_max = 0.2, 전체 T = 1000스텝인 코사인 감쇠에서 t = 500과 t = 1000의 학습률을 구하세요."
        :steps="[
          { lhs: 'lr(500)', answer: 0.1 },
          { lhs: 'lr(1000)', answer: 0 },
        ]"
        :hints="['t = T/2면 cos(π/2) = 0 → ½(1+0) = 절반.', 't = T면 cos(π) = −1.']"
        explanation="중간 지점에서 정확히 절반(0.1), 끝에서 0 — 곡선의 두 이정표만 외우면 코사인 감쇠는 다 읽힌 겁니다."
      />
      <Quiz
        difficulty="medium"
        question="실험 ①에서 코사인 일정표가 고정 0.3과 고정 0.02를 모두 이긴 이유는?"
        :choices="['초반엔 큰 보폭의 속도를, 후반엔 작은 보폭의 정착을 시간축으로 둘 다 가져서', '코사인 함수가 신성해서', '노이즈를 아예 없애 줘서', '스텝 수를 더 많이 써서']"
        :answer="0"
        explanation="속도 vs 정착은 고정 보폭에겐 트레이드오프지만, 일정표는 국면마다 맞는 보폭을 골라 둘 다 얻습니다."
      />
      <Quiz
        difficulty="medium"
        question="손실 곡선에 일정 간격의 '계단 무늬'(뚝, 뚝 내려감)가 보입니다. 어떤 일정표의 흔적일까요?"
        :choices="['스텝 감쇠 — lr이 계단식으로 떨어지는 순간마다 손실도 한 단 내려간다', '코사인 감쇠', '워밍업', '고정 학습률']"
        :answer="0"
        :hints="['이름부터 계단(step)이죠 — 9장 훈련 일지 판독의 단골 무늬.']"
        explanation="lr이 뚝 떨어지면 서성임 반경도 뚝 줄어 손실이 한 단 내려갑니다 — 곡선만 보고 일정표를 역추적할 수 있어요."
      />
      <Quiz
        difficulty="medium"
        question="설정 파일에 warmup_steps: 100, lr_scheduler: cosine이 적혀 있다면 lr 곡선의 모양은?"
        :choices="['100스텝 동안 0→목표로 올라간 뒤, 코사인 곡선으로 0까지 부드럽게 내려온다', '100스텝마다 절반으로 뚝뚝 떨어진다', '내내 일정하다', '코사인처럼 오르내리기를 반복한다']"
        :answer="0"
        explanation="산 하나를 닮은 그 곡선 — GPT급 사전학습 논문의 lr 그림이 예외 없이 이 모양입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="훈련 시작 직후(수십 스텝 안)에만 손실이 튀거나 폭발합니다. 이 장의 처방은?"
        :choices="['워밍업을 넣거나 늘린다 — 초반 취약 구간(자 예열·낯선 지형)을 잔걸음으로 통과', '후반 감쇠를 더 가파르게 한다', '배치 크기를 줄인다', '에포크를 늘린다']"
        :answer="0"
        :hints="['문제가 초반 한정이라면 처방도 초반 한정이어야죠.']"
        explanation="초반 한정 증상엔 초반 한정 처방 — 감쇠(후반 장치)를 만져 봐야 소용없습니다. 증상의 시점이 다이얼을 고릅니다(9장 판독의 핵심 감각)."
      />
      <Quiz
        difficulty="hard"
        question="훈련이 끝났는데 손실이 최저점 근처에서 좁게 진동하며 더 안 내려간 채 종료됐습니다. 일정표 관점의 1순위 용의자는?"
        :choices="['감쇠 없는(또는 덜 내려간) 학습률 — 마지막까지 보폭이 커서 서성이다 끝났다', '워밍업이 너무 길었다', '배치가 너무 컸다', '에포크가 너무 적었다']"
        :answer="0"
        :hints="['마지막 구간의 진동 폭 = 노이즈 × 보폭.']"
        explanation="고정 0.3의 운명 그대로 — 종료 시점 lr이 충분히 작았는지부터 확인합니다. 코사인이라면 자연히 0에 수렴했을 무늬예요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch6')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">6장 완료 — 보폭의 시간축까지 손에 넣었어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        속도의 다이얼(2~6장)이 완성됐습니다. 다음은 방향을 바꾸는 질문 —
        깊이 내려간 그 도착지, 정말 좋은 곳일까? 통째로 외운 학생의 비극, 과적합입니다.
      </p>
      <RouterLink
        to="/ch/ch7"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        7장 — 과적합, 통째로 외운 학생 →
      </RouterLink>
    </div>
  </article>
</template>
