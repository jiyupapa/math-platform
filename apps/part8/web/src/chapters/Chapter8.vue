<script setup lang="ts">
// 8장 — 안전장치들: 정규화. weight decay(원점 목줄)·드롭아웃·조기 종료 — 6부 6장 KL 목줄과 명시 대비.
// 회수하는 수학: 6부 6장(KL 목줄 — "멀리 못 가게 묶는다"의 두 얼굴) · 1부 2장(노름 = 계수 크기).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import RegularizeLab from '@/components/RegularizeLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch8')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">8장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">안전장치들 — 정규화</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      7장에서 과적합의 처방 둘을 배웠죠 — 멈추기, 데이터 늘리기. 오늘은 세 번째이자 가장 우아한
      처방입니다: <b>암기 자체를 어렵게 만드는 것.</b> 열쇠는 7장 실험에서 스쳐 지나간 관찰 하나예요 —
      점 10개를 통째로 외운 그 요동치는 곡선, 사실 <b>계수가 수백까지 폭주</b>해야 만들 수 있는
      곡선이었습니다. 암기에는 큰 다이얼이 필요하다 — 그럼 다이얼 크기에 <b>벌점</b>을 물리면?
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지를 가져갑니다 — ① <b>weight decay의 수학</b>: 손실에 λ‖w‖² 벌점 = 매 스텝 가중치를
      살짝 줄이는 것(이름의 정체), ② 안전장치 3형제의 원리: <b>원점 목줄(weight decay)·무작위
      결근(드롭아웃)·제때 하차(조기 종료)</b> — 전부 "암기를 어렵게"가 본질, ③ 6부 KL 목줄과의
      대구: <b>"멀리 못 가게 묶는다"의 두 얼굴</b> — 설정 파일의 <code>weight_decay</code>·<code>adamw</code>가 마저 읽히게.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 원점 목줄 — weight decay</h2>
    <ReviewFlag id="ch8-s1" chapter="ch8" label="1. 원점 목줄 — weight decay" />
    <p class="leading-relaxed text-slate-700">
      아이디어는 한 줄입니다 — 손실에 <b>계수 크기의 벌점</b>을 더해요. 여기서 ‖w‖는 1부에서 배운
      노름, 즉 모든 가중치를 모은 벡터의 길이이고, λ(읽기: <b>람다</b>)는 그 벌점의 세기를 정하는
      다이얼입니다:
    </p>
    <MathBlock expr="L_{\text{전체}} \;=\; L_{\text{데이터}} \;+\; \lambda\,\lVert w\rVert^2 \qquad (\lambda = \text{목줄의 세기})" />
    <p class="mt-2 leading-relaxed text-slate-700">
      이제 모델은 두 가지를 동시에 흥정해야 합니다 — 데이터를 잘 맞히되, <b>계수를 크게 쓰면
      비싸다.</b> 노이즈까지 외우는 요동 곡선은 큰 계수가 필요하니 수지가 안 맞고, 매끈한 규칙
      곡선만 남습니다. 7장의 암기 곡선에 직접 목줄을 채워 보세요.
    </p>

    <RegularizeLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 이름의 정체: 왜 '감쇠(decay)'인가">
      벌점 λ‖w‖²의 기울기는 2λw — 경사하강 갱신에 넣어 정리하면:
      <MathBlock expr="w \;\leftarrow\; (1 - 2\,lr\,\lambda)\cdot w \;-\; lr\cdot\nabla L_{\text{데이터}}" />
      매 스텝 가중치에 <b>1보다 살짝 작은 수를 곱해 줄인다</b> — 그래서 이름이 weight <b>decay</b>(가중치
      감쇠)입니다. 데이터가 "이 계수는 커야 해"라고 계속 우기지 않는 한, 계수는 원점(0)으로
      끌려가요. 실험 ②가 그 효과의 극적인 버전 — 노이즈 암기용 계수는 데이터가 세게 우기지 못하는
      계수라, 벌점이 계속 깎아내 <b>벌어짐 자체가 생기지 않습니다.</b>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="weight decay가 과적합(암기)을 막는 원리는?"
      :choices="['암기 곡선엔 폭주하는 큰 계수가 필요한데, 계수 크기에 벌점을 물리면 매끈한 규칙 곡선만 수지가 맞으므로', '훈련 데이터를 늘려 주므로', '학습률을 자동으로 조절해 주므로', '노이즈를 데이터에서 제거해 주므로']"
      :answer="0"
      :hints="['실험 ①에서 λ=0일 때 ‖w‖가 몇까지 갔었죠?']"
      explanation="암기에는 큰 다이얼이 필요하다 — 그 비용을 비싸게 만드는 것이 weight decay의 전부입니다."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="목줄 λ가 너무 세면(예: λ=10) 곡선이 짓눌려 규칙까지 못 배우는 과소적합이 된다."
      type="truefalse"
      :answer="0"
      explanation="참 — λ에도 U자가 있습니다(실험 ①의 양 끝). λ 역시 검증 데이터로 골라야 하는 하이퍼파라미터예요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 나머지 두 안전장치 — 그리고 목줄의 두 얼굴</h2>
    <ReviewFlag id="ch8-s2" chapter="ch8" label="2. 나머지 두 안전장치 — 그리고 목줄의 두 얼굴" />
    <p class="leading-relaxed text-slate-700">
      <b>드롭아웃(dropout)</b>은 신경망용 안전장치입니다 — 훈련 중 매 스텝 뉴런의 일부(예 10%)를
      <b>무작위로 꺼</b> 버려요. 특정 뉴런 몇 개가 담합해 훈련 예문을 통째로 외우는 걸 막습니다 —
      매번 다른 팀원이 결근하는 팀은 특정인의 암기에 기댈 수 없고, <b>여럿이 공유하는 튼튼한
      규칙</b>만 살아남아요(시험 볼 땐 전원 출근). <b>조기 종료(early stopping)</b>는 7장 실험 ②의
      "멈출 자리"를 자동화한 것 — 검증 손실이 몇 번 연속 나빠지면(patience) 훈련을 끊고 최저점의
      모델을 돌려줍니다. 세 장치 모두 본질은 하나예요: <b>암기를 어렵게.</b>
    </p>

    <ConceptCard tone="note" title="새 용어: 정규화 / weight decay / 드롭아웃 / 조기 종료">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>정규화</b> (regularization) — 읽는 법: 레귤러라이제이션.
          뜻: 과적합(암기)을 어렵게 만드는 안전장치의 총칭 — 우리의 비유 "안전장치"의 실무 이름.
          (7부의 벡터 정규화 normalization과는 다른 단어이니 주의!)
        </li>
        <li>
          <b>weight decay</b> (가중치 감쇠) — 읽는 법: 웨이트 디케이.
          뜻: 계수 크기 벌점 λ‖w‖² = 매 스텝 가중치를 살짝 줄이기 — 설정 파일의
          <code>weight_decay: 0.01</code>. L2 정규화·릿지(ridge)와 같은 아이디어의 이름들.
        </li>
        <li>
          <b>드롭아웃</b> (dropout) — 읽는 법: 드롭아웃.
          뜻: 훈련 중 뉴런을 무작위로 꺼 담합 암기를 방지 — 추론(시험) 때는 전원 출근.
        </li>
        <li>
          <b>조기 종료</b> (early stopping) — 읽는 법: 얼리 스타핑.
          뜻: 검증 손실이 나빠지기 시작하면 훈련 중단, 최저점 모델 채택 — 벌어짐(7장) 무늬의 공식 처방.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">암기에는 큰 다이얼이 필요하다 — 크기에 벌점을 물리면 노이즈는 못 외우고 규칙만 남는다</p>
      <p class="mt-1 text-sm text-indigo-600">원점 목줄 · 무작위 결근 · 제때 하차 — 안전장치 3형제의 본질은 전부 "암기를 어렵게".</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="6부의 KL 목줄과 오늘의 weight decay, 공통점과 차이점은?"
      :choices="['공통: 벌점으로 멀리 못 가게 묶는다. 차이: KL 목줄은 원본 모델에서, weight decay는 원점(0)에서 멀어지면 벌점', '공통점이 없다 — 완전히 다른 기법', '차이: KL 목줄은 손실을 줄이고 weight decay는 늘린다', '둘 다 데이터를 늘리는 기법']"
      :answer="0"
      :hints="['둘 다 손실 + λ×(거리 벌점) 모양 — 어디서부터의 거리인가만 다릅니다.']"
      explanation="'멀리 못 가게 묶는다'의 두 얼굴 — 기준점이 원본 모델(KL)이냐 원점(decay)이냐. 이 벌점 구조는 딥러닝 도구상자에서 계속 반복됩니다."
    />

    <DetailsCard title="➕ 더 깊이: L1과 희소성, AdamW의 '분리', 실전 조합법">
      이름만 알아 둘 두 가지 — ① <b>L1 정규화(라쏘)</b>: 벌점을 ‖w‖² 대신 |w|의 합으로 주면 계수가
      작아지는 게 아니라 <b>아예 0</b>이 됩니다(희소 sparse — 불필요한 다이얼을 꺼버리는 효과).
      ② <b>AdamW</b>: Adam(5장)에 벌점을 그냥 더하면 적응 보폭(RMS 나누기)이 벌점 기울기까지
      왜곡해요 — 감쇠를 갱신식에서 <b>분리(decoupled)</b>해 적용한 것이 AdamW, 현대 훈련의
      기본값입니다(<code>optimizer: adamw</code>의 그 W). — 실전 조합: 파인튜닝 기본 세팅은
      <code>weight_decay: 0.01</code> + 조기 종료가 표준이고, 드롭아웃은 보통 모델 구조에 이미
      들어 있어 건드릴 일이 적습니다. 그리고 λ도 하이퍼파라미터 — 실험 ①의 λ-U자가 보여 주듯
      <b>검증 데이터로 고릅니다</b>(7장 3분할이 여기서도).
    </DetailsCard>

    <ReviewFlag id="ch8-ai" chapter="ch8" label="🤖 AI 연결 — 회수하는 수학: 6부 6장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 6부 6장">
      <b><PartLink :part="6" ch="ch6">6부 6장</PartLink></b>에서 RLHF의 KL 목줄을 배웠죠 — 보상을
      쫓다 원본 모델에서 너무 멀어지면 벌점. 오늘의 weight decay는 같은 구조의 다른 얼굴입니다 —
      기준점이 원점일 뿐. <b>손실 + λ×(거리 벌점)</b>이라는 틀 하나로 두 장이 묶여요. 설정 파일
      완독 진행: <code>lr</code>·<code>warmup_steps</code>·<code>lr_scheduler</code>·<code>batch_size</code>·<code>num_epochs</code>에
      이어 오늘 <code>weight_decay</code>와 <code>optimizer: adamw</code>까지 읽혔습니다. 다음 장은
      다이얼이 아니라 <b>계기판</b> — 훈련 일지(손실 곡선)의 4대 증상을 진단하고 어느 다이얼을
      돌릴지 판독하는 법입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="정규화 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="정규화(regularization)의 목적은?"
        :choices="['암기(과적합)를 어렵게 만들어 일반화 성능을 지키는 것', '훈련 속도를 높이는 것', '데이터를 정렬하는 것', 'GPU 메모리를 아끼는 것']"
        :answer="0"
        explanation="안전장치 3형제(weight decay·드롭아웃·조기 종료)의 공통 본질 — 암기를 어렵게."
      />
      <Quiz
        difficulty="easy"
        question="weight decay가 벌점을 물리는 대상은?"
        :choices="['가중치(계수)의 크기 — λ‖w‖²', '학습률의 크기', '데이터의 개수', '훈련 스텝 수']"
        :answer="0"
        explanation="암기 곡선엔 큰 계수가 필요하니, 크기 자체를 비싸게 만듭니다 — 1부의 노름이 벌점의 자."
      />
      <Quiz
        difficulty="easy"
        question="조기 종료(early stopping)는 언제 훈련을 멈추나?"
        :choices="['검증 손실이 나빠지기 시작할 때(최저점 근처) — 벌어짐 전에 하차', '훈련 손실이 0이 될 때', '정해진 시간이 다 됐을 때', 'GPU가 뜨거워질 때']"
        :answer="0"
        explanation="7장 실험 ②의 '멈출 자리'를 자동화한 것 — patience만큼 기다렸다가 최저점 모델을 돌려줍니다."
      />
      <Quiz
        difficulty="easy"
        question="weight decay라는 이름은 매 스텝 가중치에 1보다 살짝 작은 수를 곱해 줄이는(감쇠) 데서 왔다."
        type="truefalse"
        :answer="0"
        explanation="참 — 벌점 λ‖w‖²의 기울기를 갱신식에 넣으면 w ← (1−2·lr·λ)·w − lr·∇L. 곱해지는 (1−2·lr·λ)가 감쇠 인자입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="lr = 0.1, λ = 0.05일 때 weight decay의 감쇠를 계산하세요 — 매 스텝 가중치에 곱해지는 인자는?"
        :steps="[
          { lhs: '2 \\cdot lr \\cdot \\lambda', answer: 0.01 },
          { lhs: '1 - 2 \\cdot lr \\cdot \\lambda', answer: 0.99 },
        ]"
        :hints="['2 × 0.1 × 0.05부터.', '감쇠 인자 = 1 − (방금 구한 값).']"
        explanation="매 스텝 0.99를 곱합니다 — 데이터가 계속 우기지 않는 계수는 스르르 0으로 끌려가요. 그것이 '감쇠'."
      />
      <Quiz
        difficulty="medium"
        question="λ를 너무 크게(예: 10) 잡으면 나타나는 증상은?"
        :choices="['곡선이 짓눌려 규칙까지 못 배운다 — 훈련·검증 둘 다 나쁜 과소적합', '완벽 암기가 일어난다', '훈련이 빨라진다', '아무 변화 없다']"
        :answer="0"
        explanation="λ에도 U자가 있습니다 — 너무 느슨하면 암기가 남고, 너무 빡빡하면 규칙까지 짓눌려요. λ도 검증으로 고르는 하이퍼파라미터."
      />
      <Quiz
        difficulty="medium"
        question="드롭아웃(dropout)이 암기를 막는 원리는?"
        :choices="['훈련 중 뉴런을 무작위로 꺼서, 특정 뉴런 조합의 담합 암기 대신 여럿이 공유하는 규칙만 살아남게 한다', '가중치를 전부 0으로 만든다', '데이터 일부를 삭제한다', '학습률을 무작위로 바꾼다']"
        :answer="0"
        explanation="매번 다른 팀원이 결근하는 팀은 특정인의 암기에 기댈 수 없죠 — 추론(시험) 때는 전원 출근합니다."
      />
      <Quiz
        difficulty="medium"
        question="설정 파일의 optimizer: adamw — AdamW의 정체는?"
        :choices="['Adam에 weight decay를 분리(decoupled) 방식으로 결합한 것 — 현대 훈련의 기본값', 'Adam의 워밍업 버전', 'Adam보다 오래된 초기 알고리즘', 'W 모양 손실 지형 전용 옵티마이저']"
        :answer="0"
        explanation="Adam의 적응 보폭이 벌점 기울기까지 왜곡하는 문제를, 감쇠를 갱신식에서 분리해 해결한 것 — 이름의 W가 weight decay입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="6부 6장의 KL 목줄과 weight decay를 한 틀로 묶으면?"
        :choices="['둘 다 손실 + λ×(거리 벌점) — 기준점만 다르다: KL은 원본 모델에서, decay는 원점에서 멀어지면 벌점', '둘 다 학습률을 줄이는 기법이다', 'KL 목줄은 정규화가 아니다', '둘 다 데이터 증강 기법이다']"
        :answer="0"
        :hints="['“멀리 못 가게 묶는다” — 어디로부터?']"
        explanation="'멀리 못 가게 묶는다'의 두 얼굴. 벌점 항 하나로 행동을 제약하는 이 구조는 딥러닝 도구상자의 반복 패턴입니다."
      />
      <Quiz
        difficulty="hard"
        question="실험 ②에서 목줄(λ=0.03)을 채우자 훈련 오차는 나빠졌는데(0.003→0.024) 이것이 '남는 장사'인 이유는?"
        :choices="['잃은 것은 노이즈 암기 점수뿐이고, 검증(진짜 실력)은 벌어짐 없이 최저 수준을 유지했으므로', '훈련 오차는 원래 의미가 없으므로', '검증 오차도 함께 나빠졌지만 티가 안 나므로', '남는 장사가 아니다 — 목줄은 항상 손해다']"
        :answer="0"
        :hints="['7장 핵심 한 줄 — 점수는 어디서 매겨진다고 했죠?']"
        explanation="훈련 오차의 손해분은 정확히 '암기 점수'였습니다 — 일반화(검증)가 진짜 점수라는 7장의 원칙이 목줄의 손익계산서를 읽는 법이에요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch8')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">8장 완료 — 다이얼 상자가 다 찼습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        속도의 다이얼(2~6장)에 안전장치(7~8장)까지 — 이제 남은 건 운전 기술입니다.
        훈련 일지(손실 곡선)의 4대 증상을 진단하고 어느 다이얼을 돌릴지 판독하는 법으로 갑니다.
      </p>
      <RouterLink
        to="/ch/ch9"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        9장 — 훈련 일지 판독법 →
      </RouterLink>
    </div>
  </article>
</template>
