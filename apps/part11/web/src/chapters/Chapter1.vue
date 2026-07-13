<script setup lang="ts">
// 1장 — 큰 그림: 챗봇에서 에이전트로. 상태·행동·도구·루프를 해부하고 11부 여정표를 편다.
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import AgentLoopLab from '@/components/AgentLoopLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch1')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 1 · 약 30분</p>
    <h1 class="mb-4 text-3xl font-bold">큰 그림 — 챗봇에서 에이전트로</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업에서 "일의 성공률은 걸음의 곱"을 목격했습니다. 그런데 그 <b>걸음</b>이란 정확히
      무엇일까요? 이 장은 AI 일꾼의 몸을 해부합니다 — 한 턴에 답하고 끝나는 챗봇과,
      <b>관찰하고 생각하고 행동하는 루프</b>를 도는 에이전트는 무엇이 다른지,
      그리고 11부 전체의 여정표를 폅니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      같은 부탁을 챗봇과 에이전트에게 시켜 보고 —
      <b>"에이전트 = LLM + 도구 + 루프, 그리고 루프의 스텝 하나하나가 워밍업의 '걸음'이다"</b>
      를 눈으로 확인합니다. 이게 보이면 11부의 모든 수학이 어디에 붙는지 보입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대 — 같은 부탁, 두 직원</h2>
    <p class="leading-relaxed text-slate-700">
      두 직원에게 같은 부탁을 합니다 — <b>"다음 주 화요일에 팀 회의실 좀 예약해 줘."</b>
      첫 번째 직원은 그 자리에서 바로 "네, 예약했습니다!"라고 답합니다. 시원시원한데…
      캘린더를 열어 본 적이 없어요. 두 번째 직원은 캘린더를 확인하고, 빈 방을 찾고, 예약하고,
      초대장을 보내고, 정말 잡혔는지 재확인한 뒤에야 보고합니다. 아래 실험실에서 두 방식을
      직접 실행해 보세요.
    </p>

    <AgentLoopLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 챗봇은 함수, 에이전트는 루프">
      챗봇 모드는 <b>입력 → 출력 한 번</b>으로 끝나는 함수였습니다. 훈련 때 본 글로
      그럴듯한 문장은 만들지만, 지금 이 순간의 캘린더는 <b>알 방법이 없죠</b>.
      에이전트 모드는 <b>관찰 → 생각 → 행동</b>을 반복하는 루프였습니다 — 행동(도구 호출)의
      결과를 다시 관찰해 다음 생각에 반영하니, 답의 모든 문장이 <b>확인된 사실</b>이 됩니다.
      대가는 분명합니다: 이 예약 일은 <b>5단계 사슬</b>이 됐고, 걸음 정확도 90%라면
      성공률은 0.9⁵ ≈ <b>59%</b> — 워밍업의 곱셈이 그대로 적용됩니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="실험에서 챗봇 모드의 '예약해 드렸습니다'가 위험했던 이유는?"
      :choices="['캘린더를 본 적 없이 그럴듯한 문장만 생성했다 — 확인된 사실이 아니다', '답변 속도가 느려서', '존댓말을 쓰지 않아서', '예약 도구가 고장 나서']"
      :answer="0"
      :hints="['챗봇 모드가 외부 세계(캘린더)에 접근할 수단이 있었나요?']"
      explanation="챗봇 모드는 입력→출력 한 번의 함수라 지금의 캘린더 상태를 알 수 없습니다. 도구로 세계를 확인하고 행동하는 것 — 그게 에이전트와의 결정적 차이예요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <p class="leading-relaxed text-slate-700">
      방금 본 구조에 공식 이름을 달아 둡시다 — 11부 내내 이 세 단어로 이야기합니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 에이전트 루프 / 도구 / 궤적">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>에이전트 루프</b> (agent loop) — 읽는 법: 에이전트 루프.
          뜻: <b>관찰 → 생각 → 행동</b>을 목표가 끝날 때까지 반복하는 구조.
          실무 논문에서는 이 "생각하고 행동하기" 패턴을 <b>ReAct</b>(Reason + Act)라고도 불러요.
        </li>
        <li>
          <b>도구</b> (tool) — 읽는 법: 도구(툴).
          뜻: LLM이 스스로 할 수 없는 일을 대신해 주는 <b>외부 손</b> — 검색, 계산기, 캘린더,
          코드 실행기. 도구가 있어야 "지금의 세계"를 읽고 바꿀 수 있습니다.
        </li>
        <li>
          <b>궤적</b> (trajectory) — 읽는 법: 궤적(트러젝터리).
          뜻: 일이 지나간 <b>스텝들의 기록</b> — 실험실 오른쪽에 쌓인 스텝 카드 전부.
          나중에 에이전트를 채점할 때(11장 성적표) 최종 답만이 아니라 이 궤적을 봅니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'궤적(trajectory)'의 뜻으로 알맞은 것은?"
      :choices="['에이전트가 일하며 지나간 스텝(생각·행동·관찰)들의 기록', 'AI 모델의 파라미터 수', '회의실 예약 번호', '도구의 가격표']"
      :answer="0"
      explanation="궤적은 일의 발자국 전체입니다. 최종 답이 맞아도 궤적이 엉망이면(위험한 도구 호출 등) 좋은 에이전트가 아니죠 — 그래서 11장 성적표에서 궤적이 채점 대상이 됩니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 11부 여정표 — 세 막짜리 연극</h2>
    <p class="mb-3 leading-relaxed text-slate-700">
      출발 질문은 워밍업 그대로입니다 — <b>"일의 성공률은 걸음의 곱인데, 그럼 어떻게 일을
      맡기나?"</b> 11부는 세 막으로 답합니다.
    </p>
    <div class="space-y-2 text-sm">
      <div class="rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-3">
        <b class="text-indigo-800">1막 (2~6장) — 사슬과 되살리기.</b>
        <span class="text-slate-600"> 사슬의 수학(2장)과 도구 호출(3장)로 걸음을 정확히 세고,
        곱을 되살리는 세 가지 길 — 다시 뽑기(4장)·다수결(5장)·검수자(6장)를 배웁니다.</span>
      </div>
      <div class="rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-3">
        <b class="text-indigo-800">2막 (7~10장) — 전략과 자원.</b>
        <span class="text-slate-600"> 생각의 길이(7장), 갈림길 탐색(8장), 여럿이 하기(9장),
        기억의 예산(10장) — 정확도와 비용의 저울질입니다.</span>
      </div>
      <div class="rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-3">
        <b class="text-indigo-800">3막 (11~12장) — 판정.</b>
        <span class="text-slate-600"> 에이전트의 성적표(pass@k, 11장)를 읽고, 캡스톤(12장)에서
        가상 에이전트 제품의 도입 여부를 계산으로 판정하며 졸업합니다.</span>
      </div>
    </div>

    <DetailsCard title="➕ 더 깊이: LLM은 '행동'을 어떻게 출력할까">
      에이전트의 심장은 여전히 LLM입니다 — 그런데 문장 대신 행동을 어떻게 낼까요? 비밀은
      없습니다: <b>행동도 텍스트로 뽑습니다.</b> "캘린더_조회(다음주_화요일)" 같은 도구 호출
      문구를, 4부 12장에서 배운 <b>다음 단어 뽑기</b>와 똑같은 방식으로 한 조각씩 생성해요.
      그래서 도구 호출에도 확률이 붙고(엉뚱한 도구·잘못된 인자를 뽑을 수 있고 — 3장의 주제),
      temperature 같은 다이얼도 그대로 작동합니다(7장에서 전략이 됩니다). "에이전트라는
      새 생물"이 아니라 <b>같은 확률 기계가 루프 안에 들어간 것</b> — 그래서 지금까지 배운
      수학이 전부 통합니다.
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 루프의 원형과 훈련">
      에이전트 루프는 갑자기 등장한 발명품이 아닙니다.
      <b><PartLink :part="4" ch="ch12">4부 12장</PartLink></b>에서 본 <b>생성 루프</b> —
      한 단어 뽑고, 그걸 입력에 붙이고, 다시 뽑는 반복 — 가 원형이에요. 에이전트는 그 루프의
      한 바퀴를 "한 단어"에서 "생각·도구 호출·관찰"로 키운 것뿐입니다. 그리고 이 루프를
      <b>잘 돌게 만드는 훈련</b>이 <b><PartLink :part="6" ch="ch5">6부 5장</PartLink></b>에서
      배운 강화학습입니다 — 행동하고, 보상을 받고, 잘한 행동의 확률을 올리는 그 구조가
      요즘 추론·에이전트 모델의 사후 훈련에 그대로 쓰여요. 이번 부에서는 훈련이 아니라
      <b>운용의 수학</b> — 주어진 일꾼으로 일을 성사시키는 확률 설계 — 에 집중합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="챗봇에서 에이전트로 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="챗봇과 에이전트의 가장 큰 구조적 차이는?"
        :choices="['에이전트는 관찰→생각→행동 루프를 돌며 도구를 쓴다 — 챗봇은 한 턴에 답하고 끝', '에이전트가 더 큰 모델을 쓴다', '챗봇은 한국어를 못 한다', '에이전트는 인터넷이 필요 없다']"
        :answer="0"
        explanation="핵심은 모델 크기가 아니라 구조입니다 — 같은 LLM이라도 루프와 도구를 붙이면 에이전트가 돼요."
      />
      <Quiz
        difficulty="easy"
        question="실험의 챗봇 모드가 말한 '예약해 드렸습니다'는 실제로 이루어진 예약이다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 챗봇 모드는 캘린더에 접근할 수단(도구)이 없어요 — 훈련 때 본 글로 그럴듯한 답을 지어냈을 뿐입니다."
      />
      <Quiz
        difficulty="easy"
        question="실험에서 에이전트가 회의실 예약을 끝내는 데 쓴 스텝 수는? (숫자)"
        type="numeric"
        :answer="5"
        :hints="['랩의 스텝 카드를 세어 보세요.']"
        explanation="캘린더 조회 → 빈 방 검색 → 예약 → 초대 발송 → 확인, 5단계 — 이 일은 다섯 걸음짜리 사슬입니다."
      />
      <Quiz
        difficulty="easy"
        question="에이전트에게 '도구(tool)'가 필요한 근본 이유는?"
        :choices="['LLM 혼자서는 지금 이 순간의 외부 세계(캘린더·검색 결과)를 읽거나 바꿀 수 없어서', '도구가 있으면 더 예의 바르게 답해서', 'LLM 의 파라미터를 줄이려고', '도구 없이는 한국어를 못 해서']"
        :answer="0"
        explanation="LLM 의 지식은 훈련 시점에 멈춰 있고 세계를 바꿀 손도 없습니다. 검색·계산기·캘린더 같은 도구가 그 손이 되어 주죠."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="에이전트 루프의 한 바퀴를 순서대로 나열하면?"
        :choices="['관찰 → 생각 → 행동, 그리고 행동의 결과를 다시 관찰', '행동 → 관찰 → 삭제', '생각 → 생각 → 생각', '입력 → 출력 (한 번으로 끝)']"
        :answer="0"
        :hints="['실험실 스텝 카드의 세 줄을 떠올려 보세요.']"
        explanation="행동(도구 호출)의 결과가 다음 관찰이 되어 루프가 이어집니다 — 이 되먹임 덕분에 확인된 사실 위에서 일할 수 있어요. 실무 논문의 ReAct 패턴이 바로 이 구조입니다."
      />
      <Quiz
        difficulty="medium"
        question="이 5단계 예약 일을 걸음 정확도 90%짜리 에이전트가 해낼 확률은 약 몇 %인가? (정수로 반올림)"
        type="numeric"
        :answer="59"
        :hints="['워밍업의 곱셈 — 0.9를 5번 곱하세요.']"
        explanation="0.9⁵ ≈ 0.590 → 약 59%. 루프의 스텝 하나하나가 워밍업의 '걸음'이라서, 사슬의 곱셈이 그대로 적용됩니다."
      />
      <Quiz
        difficulty="medium"
        question="에이전트가 답한 문장이 챗봇의 답보다 믿을 만했던 이유는?"
        :choices="['모든 문장이 도구로 확인한 관찰(캘린더·예약 번호·발송 결과)에 근거해서', '문장이 더 길어서', '이모지를 안 써서', '더 비싼 모델이라서']"
        :answer="0"
        explanation="에이전트의 최종 보고는 궤적에 쌓인 관찰들의 요약입니다 — 지어낸 문장이 아니라 확인된 사실이죠. 물론 도구 결과를 잘못 읽을 수도 있으니(3장) 완벽하지는 않습니다."
      />
      <Quiz
        difficulty="medium"
        question="루프 구조의 장점과 대가를 가장 잘 요약한 것은?"
        :choices="['유연하게 긴 일을 해내지만, 스텝이 늘수록 사슬이 길어져 성공률의 곱이 깎인다', '장점만 있고 대가는 없다', '스텝이 늘수록 성공률이 올라간다', '루프는 짧은 일만 할 수 있다']"
        :answer="0"
        :hints="['워밍업에서 단계 수 다이얼을 늘렸을 때 무슨 일이 생겼나요?']"
        explanation="루프는 능력의 원천이자 위험의 원천입니다 — 그래서 11부의 남은 장들이 전부 '긴 사슬을 어떻게 버티게 하나'의 기술이에요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="'루프를 도는 에이전트에 워밍업의 사슬 수학(확률의 곱)이 적용되는 이유'로 가장 정확한 것은?"
        :choices="['루프의 각 스텝(생각·도구 선택·인자 작성·결과 해석)이 저마다 실패할 수 있는 걸음이고, 최종 결과가 옳으려면 그 걸음들이 사실상 전부 성공해야 하므로', '루프는 항상 정확히 10번 돌기 때문에', '도구는 절대 실패하지 않기 때문에', '에이전트는 확률과 무관하게 동작하기 때문에']"
        :answer="0"
        :hints="['스텝 하나에서 엉뚱한 도구를 고르면 최종 보고는 어떻게 될까요?']"
        explanation="스텝마다 잘못될 구멍이 있고(엉뚱한 도구·잘못된 인자·결과 오독), 하나만 틀려도 이후가 오염됩니다 — 그래서 스텝 수 n의 일은 대략 p^n 으로 깎여요. 다만 스스로 실수를 되돌리는 루프(재시도·검증)를 설계하면 이 곱을 되살릴 수 있고, 그게 4~6장의 주제입니다."
      />
      <Quiz
        difficulty="hard"
        question="도구를 많이 연결할수록 에이전트는 무조건 좋아진다 — 이 주장의 함정은?"
        :choices="['도구 호출 자체가 실패 가능한 걸음이다(선택 오류·인자 오류·결과 오독) — 도구가 늘면 능력도 늘지만 고를 갈림길과 사슬 길이도 늘어난다', '도구는 많을수록 무조건 좋다', '도구는 걸음 수에 포함되지 않는다', '도구가 늘면 LLM 파라미터가 줄어든다']"
        :answer="0"
        :hints="['3장의 제목이 왜 “도구를 드는 손”일까요?']"
        explanation="도구는 공짜 능력이 아니라 확률이 붙는 결정입니다 — 어떤 도구를 언제 쓸지 고르는 것부터가 분류 문제(3장)이고, 그 정확도가 사슬의 걸음이 됩니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch1')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">1장 완료 — 지도를 손에 넣었습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        이제 걸음의 정체를 알았으니, 다음은 2장 — 징검다리, 사슬의 수학.
        단계마다 정확도가 다른 진짜 사슬에서 병목을 찾고 곱을 계산합니다.
      </p>
      <RouterLink
        to="/ch/ch2"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        2장 — 징검다리: 사슬의 수학 →
      </RouterLink>
    </div>
  </article>
</template>
