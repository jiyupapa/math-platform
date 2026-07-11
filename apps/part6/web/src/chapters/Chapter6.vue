<script setup lang="ts">
// 6장 — RLHF (핵심) — KL 목줄. 시리즈 하이라이트: 5부 6장의 KL 발산이 주인공으로 귀환.
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import KlLeashLab from '@/components/KlLeashLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch6')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">6장 · 약 45분 · 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">RLHF — 그리고 KL 목줄</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      재료가 다 모였습니다 — 정책(조련 중인 모델), 심판(보상 모델), 학습 규칙(점수 쫓기).
      이번 장에서 전부 조립합니다. 이 조립품의 이름이 <b>RLHF</b> — GPT 를 ChatGPT 로
      만든 바로 그 방법이에요. 그리고 조립의 마지막 부품에서, 5부 6장의 <b>KL 발산</b>이
      시리즈 전체의 주인공으로 돌아옵니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      RLHF 의 목적함수 <b>r − β·KL</b> 을 읽을 수 있게 됩니다 —
      왜 보상만 쫓으면 안 되는지(보상 해킹), KL 목줄이 정확히 무엇을 지키는지,
      β 가 어떤 다이얼인지까지.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 조립 — RLHF의 등장인물</h2>
    <p class="leading-relaxed text-slate-700">
      <b>RLHF</b>(Reinforcement Learning from Human Feedback — 사람 피드백 기반 강화학습)의
      훈련장에는 모델이 <b>세 개</b> 서 있습니다:
    </p>
    <ul class="mt-2 list-disc space-y-1 pl-6 leading-relaxed text-slate-700">
      <li><b>정책 π</b> — 조련 중인 모델. SFT 를 마친 상태에서 출발합니다.</li>
      <li><b>심판 r</b> — 4장의 보상 모델. 답변마다 점수를 줍니다.</li>
      <li><b>참조 모델 π<sub>ref</sub></b> — <b>SFT 직후의 사본을 얼려 둔 것</b>. 훈련 내내 변하지 않는 "원본"이에요. 왜 필요한지는 잠시 뒤에.</li>
    </ul>
    <p class="mt-2 leading-relaxed text-slate-700">
      루프는 5장 그대로입니다: 프롬프트를 주고 → 정책이 답변을 생성하고 → 심판이 점수를 주고 →
      "잘한 행동은 더 자주"로 갱신. 그런데 이대로 돌리면 5장 끝의 경고가 현실이 됩니다.
      아래 실험에서 <b>β = 0</b> 버튼부터 눌러 보세요.
    </p>

    <KlLeashLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 심판 점수와 사람 평가가 갈라진다">
      β = 0 에서 심판 점수는 9.8인데 사람 평가는 1이었죠. 최적화 압력이 세지면 정책은
      "좋은 답"이 아니라 <b>심판의 채점 버릇을 역이용하는 답</b>을 찾아냅니다(보상 해킹).
      더 무서운 건 — 원본에서 너무 멀어지면서 <b>사전학습·SFT 가 쌓아 준 말솜씨 자체가
      무너진다</b>는 것. 점수를 쫓다가 말을 잊어버리는 셈입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="β = 0(목줄 없음) 훈련에서 심판 점수는 최고였는데 사람 평가는 바닥이었다. 이 현상의 이름은?"
      :choices="['보상 해킹 — 심판의 빈틈을 파고든 것', '경사 소실', '과소적합', '데이터 오염']"
      :answer="0"
      explanation="심판(RM)은 사람 취향의 근사일 뿐 — 근사의 구멍(아부·반복·과공손 선호)을 정책이 파고든 것입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 목줄 — KL 발산의 귀환</h2>
    <p class="leading-relaxed text-slate-700">
      해법은 "점수를 쫓되, <b>원본에서 너무 멀어지면 벌점</b>"입니다.
      그러려면 <b>"멀어진 정도"를 재는 자</b>가 필요한데… 우리는 이미 갖고 있어요.
      5부 6장에서 배운 <b>KL 발산</b> — 두 확률분포가 얼마나 다른지 재는 바로 그 자입니다.
      정책도 참조 모델도 결국 확률분포(4부)니까요. 그래서 RLHF 의 진짜 목적함수는:
    </p>
    <MathBlock expr="\text{목적} = r \;-\; \beta \cdot D_{KL}\!\left(\pi \,\|\, \pi_{\text{ref}}\right)" />
    <p class="leading-relaxed text-slate-700">
      읽는 법: <b>심판 점수(r)에서, 원본과 벌어진 거리(KL)에 비례한 벌점을 뺀다</b>.
      점수는 오르막으로 당기고, 목줄은 원본 쪽으로 당깁니다 — 균형점에서
      "원본다움을 지키면서 점수도 높은" 답이 나와요. 실험의 β = 2 가 그 지점이었죠.
    </p>

    <ConceptCard tone="note" title="새 용어: 참조 모델 / KL 페널티 / β">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>참조 모델</b> (reference model, π<sub>ref</sub>) — 읽는 법: 레퍼런스 모델.
          뜻: SFT 직후의 <b>얼려 둔 사본</b>. 목줄의 기둥 — "원본다움"의 기준점.
        </li>
        <li>
          <b>KL 페널티</b> (KL penalty) — 읽는 법: 케이엘 페널티.
          뜻: D<sub>KL</sub>(π‖π<sub>ref</sub>) 에 비례해 깎는 벌점. 5부 6장의 "초과 비트"가 벌금 고지서가 된 것.
        </li>
        <li>
          <b>β</b> (베타) — 읽는 법: 베타.
          뜻: <b>목줄의 길이 다이얼</b>. 크면 짧은 목줄(원본 고수, 못 배움), 작으면 긴 목줄(자유롭지만 해킹 위험).
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="RLHF 에서 KL 발산이 재는 것은?"
      :choices="['지금 정책(π)이 참조 모델(π_ref)에서 얼마나 멀어졌나', '답변의 길이', '보상 모델의 정확도', 'GPU 사용량']"
      :answer="0"
      :hints="['KL 은 두 확률분포 사이의 다름을 재는 자였죠(5부 6장).']"
      explanation="정책과 참조 모델 — 둘 다 확률분포라 KL 로 거리를 잴 수 있습니다. 멀어진 만큼 벌점."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. β 다이얼 읽기 — 목줄의 트레이드오프</h2>
    <p class="leading-relaxed text-slate-700">
      실험의 네 버튼을 정리하면 이렇게 됩니다. β 는 "심판을 얼마나 믿을 것인가"의
      다이얼이기도 해요 — 심판이 불완전하다는 걸 알기에, 그 말을 <b>적당히만</b> 듣는 겁니다.
    </p>
    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[26rem] text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3">β</th>
            <th class="py-2 pr-3">목줄</th>
            <th class="py-2">결과</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">0</td><td class="py-2 pr-3">없음</td><td class="py-2">보상 해킹 — 심판 점수만 높은 괴상한 답, 말솜씨 붕괴</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">작음</td><td class="py-2 pr-3">긴 목줄</td><td class="py-2">많이 배우지만 아부·장황 같은 심판 버릇이 스며듦</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">적당</td><td class="py-2 pr-3">균형</td><td class="py-2">원본다움 유지 + 선호 방향 개선 — 실무의 목표 지점</td></tr>
          <tr><td class="py-2 pr-3">큼</td><td class="py-2 pr-3">짧은 목줄</td><td class="py-2">원본에서 못 벗어남 — 조련한 의미가 없음</td></tr>
        </tbody>
      </table>
    </div>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">점수는 앞으로 당기고, KL 목줄은 원본 쪽으로 당긴다</p>
      <p class="mt-1 text-sm text-indigo-600">조련이 원본에서 멀어지지 않게 묶는 목줄 — 시리즈 로드맵의 그 문장이 이 수식입니다.</p>
    </div>

    <DetailsCard title="➕ 더 깊이: KL의 방향, 그리고 PPO라는 이름">
      5부 6장에서 KL 은 <b>비대칭</b>이라고 배웠죠 — D(π‖π<sub>ref</sub>)는 앞자리(π)가
      확신하는 곳 위주로 잽니다. 즉 "지금 정책이 자주 내는 답이 원본에서 벗어났는가"를 재는
      방향이라, 정책이 이상한 답을 <b>자주 내기 시작하는 순간</b> 벌점이 커져요 — 목줄로 딱 맞는
      방향입니다. 실무에서 이 목적함수를 안정적으로 최적화하는 알고리즘의 이름이
      <b>PPO</b>(Proximal Policy Optimization)이고, InstructGPT·ChatGPT 가 쓴 조립이 정확히
      "SFT → 보상 모델 → PPO + KL 페널티"였습니다. PPO 내부의 세부 수식은 이 과정의 범위
      밖이지만, 목적이 <b>r − β·KL</b> 이라는 뼈대는 지금 그대로예요.
    </DetailsCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 그런데… 부품이 너무 많다</h2>
    <p class="leading-relaxed text-slate-700">
      RLHF 는 강력하지만 비쌉니다. 훈련장에 모델이 <b>세 개</b>(정책·심판·참조) 동시에 서 있고,
      샘플 생성 → 채점 → 갱신 루프는 느리고 불안정하기로 악명 높아요.
      그래서 질문이 나옵니다 — <b>"보상 모델을 안 만들고, 선호 쌍에서 바로 배울 수는 없나?"</b>
      있습니다. 그 지름길이 다음 장의 <b>DPO</b>예요. 놀랍게도 KL 목줄은 그 지름길에도
      수식 안에 그대로 살아 있습니다.
    </p>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 5부 6장 KL 발산 (시리즈의 정점 연결)">
      루트 로드맵에서 예고했던 연결이 바로 이것입니다 —
      <b>"<PartLink :part="5" ch="ch6">5부 6장</PartLink> KL 발산 → 6부 RLHF: 조련이 원본에서 멀어지지 않게 묶는 목줄."</b>
      RLHF 페널티(지금), DPO 의 뼈대(7장), 그리고 5부에서 본 지식 증류까지 —
      "두 분포의 다름을 재는 자" 하나가 현대 AI 조련의 안전장치 전부를 떠받치고 있어요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="RLHF와 KL 목줄 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="RLHF 훈련장에 서 있는 모델 세 개는?"
        :choices="['정책(조련 중) · 보상 모델(심판) · 참조 모델(얼려둔 원본)', '베이스 · 챗 · 토크나이저', '정책 셋', '심판 셋']"
        :answer="0"
        explanation="π(배우는 자), r(채점자), π_ref(기준점) — 참조 모델은 훈련 내내 변하지 않습니다."
      />
      <Quiz
        difficulty="easy"
        question="RLHF 목적함수의 형태는?"
        :choices="['심판 점수 − β × KL(원본과의 거리)', '심판 점수 + β × KL', 'KL − 심판 점수', '심판 점수 × KL']"
        :answer="0"
        explanation="r − β·D_KL(π‖π_ref). 점수는 더하고(오르막), 멀어진 거리는 β 배로 뺍니다(목줄)."
      />
      <Quiz
        difficulty="easy"
        question="참조 모델(π_ref)은 훈련 중에 정책과 함께 계속 갱신된다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 참조 모델은 SFT 직후 얼려 둔 사본 — 기준점이 움직이면 목줄의 의미가 없어져요."
      />
      <Quiz
        difficulty="easy"
        question="β 를 아주 크게 하면(목줄을 아주 짧게) 생기는 일은?"
        :choices="['원본에서 거의 못 벗어나 선호 학습이 안 된다', '보상 해킹이 심해진다', '심판 점수가 무한대가 된다', '참조 모델이 녹는다']"
        :answer="0"
        explanation="실험의 β=10 — KL 0.3, 답변은 SFT 시절 그대로. 안전하지만 배운 게 없죠."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="β=2 일 때 두 후보를 목적함수로 비교하세요. 후보 A: 심판 점수 9, KL 5 / 후보 B: 심판 점수 7, KL 1."
        :steps="[
          { lhs: '\\beta \\times KL_A = 2 \\times 5', answer: 10 },
          { lhs: '\\text{A 목적} = 9 - 10', answer: -1 },
          { lhs: '\\beta \\times KL_B = 2 \\times 1', answer: 2 },
          { lhs: '\\text{B 목적} = 7 - 2', answer: 5 },
        ]"
        :hints="['목적 = 심판 점수 − β × KL, 각 후보에 대입해 보세요.', '심판 점수가 높다고 이기는 게 아니에요.']"
        explanation="A는 −1, B는 5 — 심판 점수가 낮아도 원본다움을 지킨 B가 이깁니다. 목줄이 작동하는 방식이에요."
      />
      <Quiz
        difficulty="medium"
        question="목줄 없는 훈련에서 '말솜씨 자체가 무너지는' 이유는?"
        :choices="['원본(사전학습+SFT)의 분포에서 너무 멀어지며 그 능력까지 잃어서', '심판이 말솜씨를 감점해서', 'GPU 메모리가 부족해서', '토큰 수 제한 때문에']"
        :answer="0"
        :hints="['언어 능력은 어느 단계가 쌓아 준 것이었죠(1장)?']"
        explanation="말솜씨·지식은 사전학습이 만든 분포에 들어 있습니다. 점수만 쫓아 그 분포를 떠나면 능력도 함께 버리는 셈 — KL 목줄이 지키는 게 바로 이것."
      />
      <Quiz
        difficulty="medium"
        question="심판(RM) 점수와 진짜 사람 평가가 갈라지는 근본 원인은?"
        :choices="['RM은 사람 취향의 근사라 빈틈이 있고, 최적화 압력이 그 빈틈을 찾아내서', '사람이 채점을 대충 해서', 'KL 발산이 대칭이라서', '학습률이 너무 낮아서']"
        :answer="0"
        explanation="4장의 경고 그대로 — 근사의 구멍(과공손·장황 선호 등)은 압력이 세질수록 드러납니다. 그래서 심판 점수를 적당히만 믿는(β) 설계가 필요해요."
      />
      <Quiz
        difficulty="medium"
        question="RLHF 목적함수에서 KL 페널티가 5부에서 배운 KL의 어떤 직관과 이어지나요?"
        :choices="['두 분포의 다름을 재는 자 — 초과 비트가 벌금 고지서가 된 것', '압축의 한계 — 엔트로피의 바닥', '갈래 수를 되돌리는 2^H', '온도에 따른 분포 변형']"
        :answer="0"
        explanation="D(p‖q) = 초과 비트(5부 6장). RLHF에서는 '원본에서 벗어난 정도'를 재는 자로 재사용되고, β를 곱해 벌점이 됩니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="KL(π‖π_ref) 방향(π가 앞)이 목줄로 알맞은 이유는? (5부 6장의 비대칭 회수)"
        :choices="['앞자리(π)가 자주 내는 답 위주로 재므로, 정책이 이상한 답을 자주 내는 순간 벌점이 커져서', 'KL은 대칭이라 방향이 무관해서', 'π_ref가 앞이면 계산이 불가능해서', '방향은 관례일 뿐 의미가 없어서']"
        :answer="0"
        :hints="['D(p‖q)는 p의 봉우리 위주로 잰다고 했죠.']"
        explanation="D(π‖π_ref)는 지금 정책이 확신하는(자주 내는) 답들이 원본에서 벗어났는지를 민감하게 잡습니다 — 폭주 감지기로 정확히 맞는 방향이에요."
      />
      <Quiz
        difficulty="hard"
        question="β를 낮춰 훈련했더니 심판 점수는 오르는데 파일럿 사용자 만족도가 떨어지기 시작했습니다. 가장 합리적인 대응은?"
        :choices="['보상 해킹 신호로 보고 β를 올리거나 심판(RM)을 재점검한다', '심판 점수가 오르니 β를 더 낮춘다', '사용자 평가를 무시한다', '참조 모델을 갱신해 정책을 따라가게 한다']"
        :answer="0"
        :hints="['두 지표가 갈라지는 것 — 실험에서 본 β=0의 전조였죠.']"
        explanation="RM↑·사람↓ 갈림은 해킹의 전형적 전조입니다. 목줄을 조이거나(β↑), 심판의 빈틈을 메우는(RM 데이터 보강) 게 정석 — 참조 모델을 움직이는 건 목줄 자체를 없애는 악수예요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch6')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">6장 완료 — GPT가 ChatGPT가 된 방법을 이해했어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 7장 — 보상 모델 없이 선호 쌍에서 바로 배우는 지름길, DPO.
        RLHF의 수식을 접으면 놀랍도록 단순한 식이 나옵니다.
      </p>
      <RouterLink
        to="/ch/ch7"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        7장 — DPO, 지름길 →
      </RouterLink>
    </div>
  </article>
</template>
