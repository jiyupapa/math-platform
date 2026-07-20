<script setup lang="ts">
// Phase 5 · KL 발산 (★ 핵심) — 초과 비트와 비대칭성, RLHF·증류의 언어
// 표준 구성: 개념 설명 + 새 기호 설명 + 인터랙티브 시각화 + 미니체크 + 10문제 세트 + 노트북 안내
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import KLVisualizer from '@/components/KLVisualizer.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch5')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 5 · ★ 핵심 챕터</p>
    <h1 class="mb-4 text-3xl font-bold">KL 발산 — 바가지 초과분의 이름</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      4장 실험실 게이지에서 바닥(H(p)) 위로 튀어나온 <b>"초과분"</b>을 기억하나요?
      오늘 그 초과분에 이름을 붙입니다 — <b>KL 발산</b>. RLHF(Reinforcement Learning from
      Human Feedback — 사람 피드백 기반 강화학습, 6부에서 정식으로)의 정렬 페널티,
      모델 증류, 그리고 6장 "AI 학습의 정체"까지, 요즘 AI 문서에서 가장 자주 만나는
      기호가 이겁니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><MathBlock inline expr="D(p \| q) = H(p,q) - H(p)" /> 를 <b>"바가지 초과분"</b>으로 읽는다</li>
        <li>항상 0 이상이고, <b>0이 되는 건 p = q 뿐</b>임을 안다</li>
        <li>두 방향을 직접 재 보며 <b>비대칭</b> D(p‖q) ≠ D(q‖p) 를 체감한다</li>
        <li><b>RLHF 의 KL 페널티</b>와 <b>증류</b>를 이 언어로 읽는다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 정의 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 요금 전체에서 바닥을 빼면 — 초과분</h2>
    <ReviewFlag id="ch5-s1" chapter="ch5" label="1. KL = 초과 비트 정의" />
    <p class="leading-relaxed text-slate-700">
      4장의 요금표를 다시 봅시다. 어떤 지도를 쓰든 바닥 H(p) 는 <b>피할 수 없는 기본요금</b>이에요 —
      세상 자체의 불확실성이니까요. 지도가 틀려서 <b>추가로</b> 낸 돈만 떼어 보면,
      그게 순수하게 "내 지도가 얼마나 틀렸는지"를 잽니다:
    </p>
    <MathBlock expr="D(p \,\|\, q) \;=\; \underbrace{H(p,q)}_{\text{낸 요금 전체}} \;-\; \underbrace{H(p)}_{\text{피할 수 없는 기본요금}} \;=\; \text{바가지 초과분}" />
    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[26rem] text-center text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs text-slate-400">
            <th class="py-1.5 font-medium">지도 (4장 재사용)</th>
            <th class="py-1.5 font-medium">요금 H(p,q)</th>
            <th class="py-1.5 font-medium">기본요금 H(p)</th>
            <th class="py-1.5 font-medium">초과분 D(p‖q)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-slate-100">
            <td class="py-1.5">🎯 세상과 같은 지도</td>
            <td class="py-1.5 tabular-nums">1.75비트</td>
            <td class="py-1.5 tabular-nums text-slate-400">1.75비트</td>
            <td class="py-1.5 font-bold tabular-nums text-emerald-600">0</td>
          </tr>
          <tr class="border-b border-slate-100">
            <td class="py-1.5">⚖️ 균등 지도</td>
            <td class="py-1.5 tabular-nums">2비트</td>
            <td class="py-1.5 tabular-nums text-slate-400">1.75비트</td>
            <td class="py-1.5 font-bold tabular-nums text-amber-600">0.25비트</td>
          </tr>
          <tr>
            <td class="py-1.5">🙃 거꾸로 지도</td>
            <td class="py-1.5 tabular-nums">2.625비트</td>
            <td class="py-1.5 tabular-nums text-slate-400">1.75비트</td>
            <td class="py-1.5 font-bold tabular-nums text-rose-600">0.875비트</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConceptCard tone="note" title="새 기호 — D(p‖q) 와 세로 이중 막대">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>이름</b>: KL 발산 (쿨백–라이블러 발산, Kullback–Leibler divergence) ·
          <b>읽는 법</b>: "디 피 큐" 또는 "p 에서 q 로의 KL" ·
          <b>뜻</b>: 진짜가 p 인데 q 라고 믿을 때 데이터 하나당 추가로 무는 비트
        </li>
        <li>
          <MathBlock inline expr="\|" /> 세로 이중 막대는 그냥 <b>구분자</b>입니다(1부 노름 기호와 무관) —
          쉼표 대신 써서 "앞이 진짜, 뒤가 믿음"이라는 <b>순서</b>를 강조해요
        </li>
        <li>
          빼기를 정리하면 한 줄 공식이 됩니다:
          <MathBlock inline expr="D(p\|q) = \sum p \cdot \log_2 \frac{p}{q}" />
          — "내 지도의 길이(log 1/q)에서 최적 길이(log 1/p)를 뺀 것"의 평균 (로그의 나눗셈 규칙, 2부 7장)
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="warn" title="다시 긋는 경계선 — 크로스 엔트로피 vs KL">
      <b>H(p,q) = 요금 전체</b> (기본요금 포함) · <b>D(p‖q) = 초과분만</b>.
      그래서 둘의 차이는 상수 H(p) 하나 — <b>q 를 움직여서 최소화할 때는 둘이 완전히 같은
      문제</b>입니다(6장의 핵심 포인트). 헷갈리면 언제나 "요금 전체냐, 바가지냐"로 돌아오세요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="4장의 균등 지도는 요금 2비트, 기본요금 1.75비트였습니다. D(p‖균등지도) 는 몇 비트일까요?"
      type="numeric"
      :answer="0.25"
      :tolerance="0.001"
      explanation="2 − 1.75 = 0.25비트. 지도가 틀려서 추가로 문 바가지가 KL 입니다."
    />

    <!-- 2. 성질 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 두 가지 성질 — 공짜 없음, 그리고 방향 있음</h2>
    <ReviewFlag id="ch5-s2" chapter="ch5" label="2. 항상 0 이상 + 비대칭" />
    <p class="leading-relaxed text-slate-700">
      <b>성질 1 — 항상 0 이상.</b> 4장에서 확인했죠: 어떤 지도도 바닥보다 쌀 수 없으니
      (H(p,q) ≥ H(p)), 초과분은 음수가 될 수 없습니다. 그리고 <b>0이 되는 건 완벽히 같은
      분포(q = p)뿐</b>. 그래서 KL 은 "두 분포가 얼마나 다른가"를 재는 자로 쓰입니다.
    </p>
    <p class="mt-3 leading-relaxed text-slate-700">
      <b>성질 2 — 방향이 있다.</b> 그런데 이 자에는 함정이 하나 있어요. 극단적인 예로 봅시다.
      동전의 진실 p = (앞 ½, 뒤 ½) 인데, 누군가 q = (앞 1, 뒤 0) 이라고 믿는다면:
    </p>
    <div class="my-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded-xl border border-rose-200 bg-rose-50 p-4">
        <p class="text-sm font-bold text-rose-900">D(p‖q) = ∞ 💥</p>
        <p class="mt-1 text-sm leading-relaxed text-rose-800">
          진실은 뒷면도 절반인데, 믿음 q 는 뒷면을 <b>불가능 취급</b>(확률 0).
          뒷면이 나오는 순간 지도에 없는 곳 — 비용 무한대.
        </p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm font-bold text-slate-800">D(q‖p) = 1비트</p>
        <p class="mt-1 text-sm leading-relaxed text-slate-700">
          거꾸로 "진실이 q(항상 앞면)인데 p(반반)라고 믿는" 방향은 멀쩡한 유한값 —
          1 × log₂(1/½) = 1비트.
        </p>
      </div>
    </div>
    <p class="leading-relaxed text-slate-700">
      같은 두 분포인데 방향에 따라 <b>∞ 대 1</b>. 그래서 KL 은 거리처럼 쓰이지만
      대칭이 아니라 수학적 "거리"는 아니고, <b>발산(divergence)</b>이라는 별도 이름을 씁니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="D(p‖q) 와 D(q‖p) 는 항상 같은 값이다."
      type="truefalse"
      :answer="1"
      explanation="거짓. 방금 본 극단 예처럼 ∞ 대 1비트까지 벌어질 수 있어요 — KL 은 비대칭입니다."
    />

    <!-- 3. Visualizer -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 비대칭 저울 — 직접 재 보기</h2>
    <ReviewFlag id="ch5-s3" chapter="ch5" label="3. KL 비대칭 저울 (인터랙티브)" />
    <p class="leading-relaxed text-slate-700">
      두 분포를 모두 드래그하면서 두 방향의 KL 을 동시에 관찰해 보세요.
      "q 에 구멍" 프리셋에서 한쪽 게이지만 ∞ 로 터지는 것,
      두 분포를 똑같이 맞추면 둘 다 0이 되는 것을 꼭 확인하세요.
    </p>

    <KLVisualizer />

    <DetailsCard title="➕ 더 깊이: 어느 방향을 최소화하느냐로 성격이 갈린다">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>D(p‖q) 를 최소화하는 q</b> (앞이 진짜): p 가 가능하다는 곳에 q 가 0을 주면 ∞ 라서,
          q 는 <b>p 의 모든 봉우리를 조금씩이라도 덮으려</b> 합니다 — "빠짐없이 커버" 성향.
          증류·최대우도 학습이 이 방향이에요.
        </li>
        <li>
          <b>D(q‖p) 를 최소화하는 q</b> (뒤가 진짜): 반대로 q 가 <b>자기가 확신하는 봉우리
          하나에 집중</b>하는 성향 — p 가 낮은 곳만 피하면 되니까요. RLHF 계열이 주로 이 방향.
        </li>
        <li>같은 "가까워져라"인데 방향에 따라 <b>덮개형 vs 집중형</b>으로 갈리는 것 — 비대칭의 실전 의미입니다.</li>
        <li>
          논문 용어로는 덮개형 = <b>mode-covering</b>(모드 커버링), 집중형 = <b>mode-seeking</b>(모드 시킹)
          이라 하고, 방향 자체도 이름이 있어요 — D(p‖q) 쪽이 <b>forward KL</b>(순방향),
          D(q‖p) 쪽이 <b>reverse KL</b>(역방향). 이 단어들로 검색하면 방금 이야기가 그대로 나옵니다.
        </li>
      </ul>
    </DetailsCard>

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 RLHF 의 목줄, 증류의 교과서</h2>
    <ReviewFlag id="ch5-ai" chapter="ch5" label="🤖 RLHF KL 페널티 · 증류" />
    <p class="leading-relaxed text-slate-700">
      KL 은 "두 분포가 얼마나 다른가"를 재는 자 — AI 에서는 <b>두 모델이 얼마나 다른가</b>를
      재는 데 그대로 쓰입니다. 대표 무대 두 곳:
    </p>

    <ConceptCard tone="ai" title="🤖 AI 연결 — KL 이 일하는 두 현장">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>RLHF 의 KL 페널티 (정렬의 목줄)</b>: 사람 피드백으로 모델을 튜닝하면, 모델이
          보상만 좇다가 <b>이상한 말투로 폭주</b>할 수 있어요(보상 해킹). 그래서 목적함수에
          "원본 모델의 분포에서 너무 멀어지면 벌점" —
          <MathBlock inline expr="\text{보상} - \beta \cdot D(\pi_{\text{new}} \| \pi_{\text{ref}})" /> —
          를 넣습니다. (처음 보는 기호 둘: <MathBlock inline expr="\pi" /> 파이 — 여기서는 원주율이
          아니라 <b>모델이 내놓는 분포</b>를 부르는 관례 기호 "정책", <MathBlock inline expr="\beta" /> 베타 —
          목줄을 얼마나 세게 당길지 정하는 상수입니다.)
          KL 이 <b>원본에 묶어 두는 목줄</b> 역할 — GPT 계열 정렬 논문마다 나오는 그 β·KL 항입니다.
        </li>
        <li>
          <b>증류 (distillation, 선생님 흉내내기)</b>: 큰 선생 모델의 출력 분포 p 를 작은 학생
          모델의 분포 q 가 흉내내도록 <MathBlock inline expr="D(p_{\text{선생}} \| q_{\text{학생}})" /> 을
          최소화합니다. 정답 하나(원핫)가 아니라 <b>선생의 "부드러운 확신 분포" 전체</b>를 배워서,
          작은 모델이 크기 대비 훨씬 똑똑해져요.
        </li>
        <li>
          그리고 다음 장 — <b>사전학습 그 자체</b>가 "데이터 분포와 모델 분포의 KL 최소화"임을
          보입니다. KL 은 조연이 아니라 학습의 정의였던 거예요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="RLHF 에서 KL 페널티 항의 역할은 무엇일까요?"
      :choices="['튜닝된 모델이 원본 모델 분포에서 너무 멀어지지 않게 잡아두는 것', '보상을 더 크게 만드는 것', '토큰 수를 줄여 비용을 아끼는 것', '학습 속도를 높이는 것']"
      :answer="0"
      explanation="보상만 좇는 폭주(보상 해킹)를 막는 목줄입니다 — 원본과의 KL 이 커질수록 벌점."
    />

    <!-- 연습 문제 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="KL 발산 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="KL 발산 D(p‖q) 는 '요금 전체 H(p,q) 에서 기본요금 H(p) 를 뺀 초과분'이다."
        type="truefalse"
        :answer="0"
        explanation="참. 지도가 틀려서 추가로 문 바가지만 떼어낸 것이 KL 입니다."
      />
      <Quiz
        difficulty="easy"
        question="두 분포가 완전히 같을 때(q = p) KL 발산의 값은?"
        type="numeric"
        :answer="0"
        explanation="초과분이 없으니 0. 그리고 0이 되는 유일한 경우가 q = p 입니다."
      />
      <Quiz
        difficulty="easy"
        question="KL 발산에 대한 설명으로 옳은 것은?"
        :choices="['항상 0 이상이다', '음수가 될 수 있다', '항상 1 이하다', '두 분포가 다르면 0이다']"
        :answer="0"
        :hints="['어떤 지도도 바닥 H(p) 보다 쌀 수 없었죠.']"
        explanation="H(p,q) ≥ H(p) 이므로 초과분은 항상 0 이상입니다."
      />
      <Quiz
        difficulty="easy"
        question="D(p‖q) 에서 세로 이중 막대(‖)는 벡터의 길이(노름)를 뜻한다."
        type="truefalse"
        :answer="1"
        explanation="거짓. 여기서는 그냥 '앞이 진짜, 뒤가 믿음'을 구분하는 구분자입니다 — 1부의 노름 기호와 무관해요."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="4장의 거꾸로 지도(요금 2.625비트, 기본요금 1.75비트)의 KL 발산을 단계별로 구하세요."
        :steps="[
          { lhs: 'H(p,q)', answer: 2.625 },
          { lhs: 'H(p)', answer: 1.75 },
          { lhs: 'D(p\\|q) = 2.625 - 1.75', answer: 0.875 },
        ]"
        :hints="['초과분 = 요금 전체 − 기본요금.']"
        explanation="D = 2.625 − 1.75 = 0.875비트. 최악의 지도가 문 바가지."
      />
      <Quiz
        difficulty="medium"
        question="진실 p = (½, ½) 인데 믿음 q = (1, 0) 일 때 D(p‖q) 는?"
        :choices="['무한대', '1비트', '0.5비트', '0']"
        :answer="0"
        :hints="['p 가 가능하다는 뒷면을 q 가 불가능(확률 0) 취급해요.']"
        explanation="일어날 수 있는 일을 불가능 취급하는 믿음의 초과 비용은 무한대입니다."
      />
      <Quiz
        difficulty="medium"
        question="크로스 엔트로피 H(p,q) 와 KL 발산 D(p‖q) 는 q 를 움직여 최소화할 때 같은 문제다."
        type="truefalse"
        :answer="0"
        :hints="['둘의 차이는 q 와 무관한 상수 H(p) 하나뿐.']"
        explanation="참. H(p,q) = H(p) + D(p‖q) 인데 H(p) 는 q 와 무관한 상수 — 그래서 CE 최소화 = KL 최소화 (6장의 열쇠)."
      />
      <Quiz
        difficulty="medium"
        question="KL 발산이 수학적 '거리'가 아닌 이유는?"
        :choices="['대칭이 아니라서 (방향에 따라 값이 다름)', '항상 0이라서', '음수가 나올 수 있어서', '단위가 비트라서']"
        :answer="0"
        explanation="거리는 A→B 와 B→A 가 같아야 하는데 KL 은 D(p‖q) ≠ D(q‖p). 그래서 '발산'이라는 별도 이름을 씁니다."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="진실 q = (1, 0), 믿음 p = (½, ½) 방향의 D(q‖p) 를 구하세요. (확률 0인 항은 관례상 0)"
        :steps="[
          { lhs: '\\text{남는 항의 } q_1', answer: 1 },
          { lhs: '\\log_2(q_1 / p_1) = \\log_2 2', answer: 1 },
          { lhs: 'D(q\\|p) = 1 \\times 1', answer: 1 },
        ]"
        :hints="['q₂ = 0 인 항은 0·log0 = 0 관례로 사라져요.', '남는 건 1 × log₂(1/½) 하나.']"
        explanation="D(q‖p) = 1비트. 반대 방향 D(p‖q) = ∞ 였으니 — ∞ 대 1, 비대칭의 극단입니다."
      />
      <Quiz
        difficulty="hard"
        question="증류(distillation)에서 학생 모델이 배우는 것은?"
        :choices="['선생 모델의 부드러운 확신 분포 전체 (D(선생‖학생) 최소화)', '정답 원핫 라벨만', '선생 모델의 가중치를 그대로 복사', '선생 모델의 토큰 수']"
        :answer="0"
        :hints="['원핫보다 정보가 많은 것을 배워요.']"
        explanation="선생의 출력 분포 p 를 통째로 흉내(KL 최소화) — 정답 외 후보들의 상대적 확신까지 배워서 원핫 학습보다 효율적입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch5')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 5 완료. 분포 사이의 자, KL 을 얻었습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        이제 재료가 다 모였습니다 — 다음 장에서 "AI 가 배운다"를 <b>한 줄로 정의</b>합니다.
      </p>
      <RouterLink
        to="/ch/ch6"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — AI 학습의 정체 →
      </RouterLink>
    </div>
  </article>
</template>
