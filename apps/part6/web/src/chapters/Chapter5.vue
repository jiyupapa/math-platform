<script setup lang="ts">
// 5장 — 보상으로 배우기: 강화학습 최소 직관.
// 다시 쓰는 수학: 2부 9장(경사하강 — 방향만 반대) · 3부 5장(기댓값).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import PolicyGradientLab from '@/components/PolicyGradientLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch5')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">5장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">보상으로 배우기 — 강화학습 최소 직관</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      4장에서 자동 심판(보상 모델)을 얻었습니다. 그런데 문제가 하나 남아요.
      보상 모델은 <b>점수만 줄 뿐 정답을 알려주지 않습니다</b>. "이 답은 3점"이라고만 하지,
      "이렇게 썼어야지"라고는 안 해요. 정답 없이 점수만으로 배우는 법,
      그게 <b>강화학습</b>이고, 필요한 건 세 단어뿐입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>행동·정책·보상</b> 세 단어를 LLM 에 정확히 매핑하고,
      학습 원리를 한 줄로 말할 수 있게 됩니다.
      <b>"잘한 행동은 더 자주, 못한 행동은 덜 자주."</b>
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 시범과 점수는 다르다</h2>
    <ReviewFlag id="ch5-s1" chapter="ch5" label="1. 시범과 점수는 다르다" />
    <p class="leading-relaxed text-slate-700">
      자전거 타기를 배울 때를 떠올려 보세요. SFT 는 <b>아빠가 대신 타는 걸 구경</b>하는 것과
      같습니다(시범 → 흉내). 하지만 결국은 직접 타 봐야 해요. 넘어지면 아프고(낮은 보상),
      균형을 잡으면 신나죠(높은 보상). <b>정답 동작을 아무도 말해 주지 않지만</b>,
      시도와 점수만으로 몸이 배웁니다. 강아지 훈련도 같아요. "앉아"의 정답 근육 움직임을
      설명할 수 없으니, 잘했을 때 <b>간식(보상)</b>을 줄 뿐입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 행동 / 정책 / 보상 (LLM 버전)">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>행동</b> (action). 읽는 법: 액션.
          뜻: 모델이 하는 선택. LLM 에서는 <b>토큰을 골라 답변을 만들어 내는 것</b>.
        </li>
        <li>
          <b>정책</b> (policy, π). 읽는 법: 폴리시, 기호는 파이.
          뜻: 행동을 고르는 <b>확률분포</b>. LLM 에서는… 바로 <b>모델 그 자체</b>입니다!
          4부에서 배운 "다음 토큰의 확률분포"가 곧 정책이에요.
        </li>
        <li>
          <b>보상</b> (reward, r). 읽는 법: 리워드.
          뜻: 행동이 끝난 뒤 받는 점수. LLM 에서는 <b>답변이 완성된 뒤 보상 모델(4장)이 주는 r</b>.
          도중에는 안 나오고 <b>끝나야 나온다</b>는 게 중요한 특징입니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'정책(π)'을 LLM 세계에 매핑하면?"
      :choices="['모델 자체: 다음 토큰을 고르는 확률분포', '보상 모델이 주는 점수', '훈련 데이터의 목록', 'GPU 스케줄러']"
      :answer="0"
      :hints="['4부에서 배운 LLM 의 정체가 무엇이었죠?']"
      explanation="LLM = 다음 토큰의 확률분포 = 행동을 고르는 규칙 = 정책. 새 개념이 아니라 아는 것의 새 이름입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 목표는 기대 보상: 3부의 기댓값이 돌아온다</h2>
    <ReviewFlag id="ch5-s2" chapter="ch5" label="2. 목표는 기대 보상: 3부의 기댓값이 돌아온다" />
    <p class="leading-relaxed text-slate-700">
      정책은 확률분포라서 매번 다른 답이 나옵니다. 그럼 무엇을 높여야 할까요?
      한 번의 점수가 아니라 <b>평균 점수</b>, 곧 3부 5장에서 배운 기댓값입니다:
    </p>
    <MathBlock expr="E[\text{보상}] = \sum_i \pi_i \cdot r_i" />
    <p class="leading-relaxed text-slate-700">
      <MathBlock inline expr="\sum" />(시그마)는 "전부 더하라"는 기호로, 즉
      "각 답변이 나올 확률 × 그 답변의 점수"를 전부 더한 것.
      강화학습의 목표는 이 <b>E[보상]이 커지도록 정책(π)을 움직이는 것</b>입니다.
      아래 실험에서 직접 움직여 보세요.
    </p>

    <PolicyGradientLab />

    <ConceptCard tone="tip" title="핵심 관찰: 나쁜 경험도 배움이 된다">
      실험에서 C(무성의)를 시도해도 E[r]이 <b>올라갔죠</b>. C의 확률이 내려간 만큼
      좋은 답들의 몫이 커졌으니까요. 강화학습에서는 실패도 정보입니다.
      "그쪽은 아니야"를 배우는 거예요. 정답을 몰라도 배울 수 있는 이유가 여기 있습니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 갱신 규칙: 경사하강, 방향만 반대</h2>
    <ReviewFlag id="ch5-s3" chapter="ch5" label="3. 갱신 규칙: 경사하강, 방향만 반대" />
    <p class="leading-relaxed text-slate-700">
      실험의 갱신 규칙은 단순했습니다: <b>시도한 답변의 확률을 보상의 부호·크기만큼
      올리거나 내린다</b>. 이걸 정책 경사(policy gradient)라고 부르는데, 정체는
      2부 9장의 경사 이동 그대로예요. 딱 하나가 달라집니다.
      손실은 <b>내리막</b>으로 걸었지만(경사하강), 보상은 <b>오르막</b>으로 걷습니다(경사상승).
      같은 산, 반대 방향.
    </p>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">잘한 행동은 더 자주, 못한 행동은 덜 자주</p>
      <p class="mt-1 text-sm text-indigo-600">정답이 없어도 점수가 방향이 된다. SFT는 정답을 베끼고, RL은 점수를 쫓는다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="SFT 와 강화학습의 가장 본질적인 차이는?"
      :choices="['SFT는 정답(모범답안)을 베끼고, RL은 정답 없이 점수만 보고 배운다', 'SFT는 수학을 쓰고 RL은 안 쓴다', 'RL은 가중치를 바꾸지 않는다', 'SFT가 항상 더 좋은 방법이다']"
      :answer="0"
      explanation="시범(정답 존재) vs 점수(정답 부재). 보상 모델은 '3점'이라고만 하지 '이렇게 썼어야지'라고 하지 않으니까요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 위험한 조합: 점수만 쫓으면 생기는 일</h2>
    <ReviewFlag id="ch5-s4" chapter="ch5" label="4. 위험한 조합: 점수만 쫓으면 생기는 일" />
    <p class="leading-relaxed text-slate-700">
      여기까지 오면 재료가 다 모였습니다: 정책(조련 중인 LLM) + 보상 모델 + 학습 규칙(점수 쫓기).
      그런데 4장의 경고를 기억하세요. <b>보상 모델도 완벽하지 않아 빈틈이 있습니다</b>.
      점수만 무한정 쫓다 보면, 모델은 "좋은 답"이 아니라 <b>"보상 모델이 좋아하는 답"</b>을 찾아냅니다.
      보상 모델이 장황함에 후하면 끝없이 길어지고, 아부에 후하면 아부꾼이 되죠.
      이걸 <b>보상 해킹(reward hacking, 리워드 해킹)</b>이라고 합니다. 논문·문서에도
      이 영문 이름 그대로 나와요. 폭주를 막을 안전장치가 필요해요.
      그게 다음 장의 <b>KL 목줄</b>입니다.
    </p>

    <DetailsCard title="➕ 더 깊이: 점수보다 '평균 대비'가 진짜 신호예요">
      평균 80점인 시험에서 85점은 잘한 것이고, 평균 90점인 시험에서 85점은 못한 것이죠.
      강화학습도 같아서, 보상 r 자체보다 <b>r − (평균 보상)</b> 을 신호로 쓰면 학습이 훨씬
      안정됩니다. 이 "평균"을 베이스라인(baseline), 뺀 값을 어드밴티지(advantage)라고 불러요.
      최근 추론 모델 훈련에 쓰이는 GRPO 같은 방법도 "같은 질문에 답변 여러 개를 만들어
      <b>그 그룹의 평균과 비교</b>한다"는 이 아이디어의 변형입니다.
    </DetailsCard>

    <ReviewFlag id="ch5-ai" chapter="ch5" label="🤖 AI 연결 · 다시 쓰는 수학: 2부 9장 · 3부 5장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 · 다시 쓰는 수학: 2부 9장 · 3부 5장">
      <b><PartLink :part="3" ch="ch5">3부 5장</PartLink></b>: 기댓값 E를 강화학습의 목표 함수(E[보상])로 다시 씀.
      <b><PartLink :part="2" ch="ch9">2부 9장</PartLink></b>: 경사 이동. 손실 대신 보상을 놓고 방향만 뒤집으면 정책 경사.
      ChatGPT 를 만든 강화학습의 뼈대가, 확률의 평균과 언덕 오르기라는
      두 개의 아는 도구로 만들어져 있었습니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="보상으로 배우기: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="강화학습의 세 단어를 LLM 에 매핑한 것으로 옳은 것은?"
        :choices="['행동=답변 생성, 정책=모델(토큰 확률분포), 보상=RM 점수', '행동=RM 점수, 정책=답변, 보상=모델', '행동=데이터, 정책=GPU, 보상=손실', '전부 새로 등장한 개념이라 매핑 불가']"
        :answer="0"
        explanation="정책 = 모델 그 자체(다음 토큰 분포)라는 게 포인트예요. 4부의 결론에 새 이름표만 붙었습니다."
      />
      <Quiz
        difficulty="easy"
        question="LLM 강화학습에서 보상(r)이 나오는 시점은?"
        :choices="['답변이 완성된 뒤 (보상 모델이 채점)', '토큰 하나 생성할 때마다', '훈련 시작 전에 미리', '사람이 실시간으로 타이핑']"
        :answer="0"
        explanation="보상은 끝나야 나옵니다. 이 '지연된 점수'가 시범(토큰마다 정답 존재)과 다른 RL 의 특징이에요."
      />
      <Quiz
        difficulty="easy"
        question="강화학습에서는 점수가 나쁜 시도(실패)는 학습에 아무 쓸모가 없다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 실패는 '그쪽은 아니야'라는 정보예요. 그 행동의 확률을 내리는 데 쓰입니다. 실험에서 C를 눌러도 E[r]이 올랐던 이유죠."
      />
      <Quiz
        difficulty="easy"
        question="정책 경사의 한 줄 요약으로 알맞은 것은?"
        :choices="['잘한 행동은 더 자주, 못한 행동은 덜 자주', '정답을 그대로 베낀다', '점수가 낮은 행동을 더 자주 시도한다', '확률을 항상 균등하게 유지한다']"
        :answer="0"
        explanation="이 장의 파란 박스입니다. 보상의 부호·크기가 확률 조정의 방향·폭을 정해요."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="정책이 답변 A·B·C를 확률 0.5, 0.3, 0.2로 내고, 보상이 각각 +4, 0, −5입니다. 기대 보상 E[r]을 단계별로 구하세요."
        :steps="[
          { lhs: '0.5 \\times 4', answer: 2 },
          { lhs: '0.3 \\times 0', answer: 0 },
          { lhs: '0.2 \\times (-5)', answer: -1 },
          { lhs: 'E[r] = \\text{합}', answer: 1 },
        ]"
        :hints="['각 확률 × 그 보상, 그리고 전부 더하기. 3부 5장의 기댓값 그대로.', '2 + 0 + (−1)']"
        explanation="E[r] = 2 + 0 − 1 = 1. C의 확률을 낮추면(예: 0.2→0.1) E[r]이 올라가겠죠. 그게 정책 경사가 하는 일입니다."
      />
      <Quiz
        difficulty="medium"
        question="경사하강(2부 9장)과 정책 경사의 관계는?"
        :choices="['같은 경사 이동: 손실은 내리막, 보상은 오르막으로 방향만 반대', '전혀 무관한 별개의 수학', '정책 경사는 미분을 쓰지 않는다', '경사하강은 RL에서 금지된다']"
        :answer="0"
        explanation="같은 산을 걷는 같은 걸음입니다. 손실 최소화 = 내리막, 보상 최대화 = 오르막. 부호 하나 차이."
      />
      <Quiz
        difficulty="medium"
        question="실험에서 C(무성의, 보상 −2)를 시도했더니 E[r]이 올라갔습니다. 이유는?"
        :choices="['C의 확률이 내려간 만큼 점수 높은 답들의 확률 몫이 커져서', 'C의 보상이 +2로 바뀌어서', 'E[r] 계산이 잘못돼서', '우연']"
        :answer="0"
        :hints="['E[r] = Σ π·r. 확률의 합은 항상 1이라는 걸 기억하세요.']"
        explanation="확률은 총합 1의 나눠 갖기입니다. 나쁜 답의 몫이 줄면 좋은 답의 몫이 늘어 평균이 올라가요."
      />
      <Quiz
        difficulty="medium"
        question="SFT 를 이미 마쳤는데도 강화학습 단계가 또 필요한 이유는?"
        :choices="['시범 없는 영역에서 \'더 나음\'의 방향으로 다듬으려면 점수 기반 학습이 필요해서', 'SFT는 가중치를 못 바꿔서', 'RL이 더 저렴해서', 'SFT 데이터를 지우기 위해서']"
        :answer="0"
        explanation="시범은 '이렇게 해'까지만이에요. 미묘한 우열(간결함·말투·안전)의 방향은 점수(선호)로만 표현됩니다. 3~4장의 서사가 여기로 모여요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="평균 보상이 이미 +8인 정책이 +5짜리 답변을 생성했습니다. '평균 대비' 신호(어드밴티지)로 보면 이 경험은?"
        :choices="['평균보다 못했으니 그 행동의 확률을 내리는 신호(−3)', '보상이 양수니 무조건 올리는 신호', '아무 신호도 아니다', '보상 모델을 재훈련하라는 신호']"
        :answer="0"
        :hints="['어드밴티지 = 보상 − 평균 (본문 「더 깊이」 카드에서 소개한 개념). 평균 90점 시험에서 85점을 받았다면?']"
        explanation="어드밴티지 = r − 평균 = 5 − 8 = −3. 절대 점수가 양수라도 평균보다 못하면 약화 신호입니다. 이게 baseline 의 역할."
      />
      <Quiz
        difficulty="hard"
        question="점수만 무한정 쫓는 강화학습이 위험한 근본 이유는?"
        :choices="['보상 모델의 빈틈을 파고든 \'점수만 높은 답\'을 찾아내기 때문 (보상 해킹)', '경사상승은 수학적으로 불안정하기 때문', '기댓값이 정의되지 않기 때문', 'GPU가 과열되기 때문']"
        :answer="0"
        :hints="['4장 마지막 경고: 보상 모델도 결국 무엇이었죠?']"
        explanation="RM은 사람 취향의 근사일 뿐. 최적화 압력이 세지면 모델은 근사의 구멍(장황함·아부 선호 등)을 파고듭니다. 그래서 다음 장의 KL 목줄이 필요해요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch5')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">5장 완료! 정답 없이 배우는 법을 얻었어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 6장, 재료를 전부 조립하는 RLHF. 그리고 폭주를 막는 KL 목줄에서
        5부 5장의 KL 발산이 주인공으로 돌아옵니다.
      </p>
      <RouterLink
        to="/ch/ch6"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        6장: RLHF와 KL 목줄 →
      </RouterLink>
    </div>
  </article>
</template>
