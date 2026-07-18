<script setup lang="ts">
// 9장 — 조련 성적표: 평가와 부작용. 회수하는 수학: 3부 8장(신뢰구간)·9장(가설검정)·10장(상관).
// 3부 심화 트랙(선택)의 회수처가 되는 장.
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import EvalLab from '@/components/EvalLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch9')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">9장 · 약 35분</p>
    <h1 class="mb-4 text-3xl font-bold">조련 성적표 — 평가와 부작용</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      조련하는 법(3~8장)은 다 배웠습니다. 마지막 질문이 남아요 —
      <b>"잘 됐는지 어떻게 아나?"</b> 답변 품질에는 정답표가 없어서
      이게 생각보다 훨씬 어렵습니다. 이 장에서는 성적표를 읽는 법과,
      성적표에 안 잡히는 <b>과잉 조련의 부작용</b>을 배웁니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지 자(벤치마크·사람 평가·LLM 심판)의 쓰임과 한계를 알고,
      <b>"점수 차이가 진짜인지"를 오차범위로 따지는 습관</b>(3부 8~9장의 회수)과
      부작용 3종(아첨·망각·거절 과잉)의 진단 감각을 갖춥니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 왜 어려운가 — 퍼플렉시티로는 안 된다</h2>
    <p class="leading-relaxed text-slate-700">
      5부 7장에서 배운 퍼플렉시티가 있잖아? — 아쉽게도 안 됩니다.
      PPL 은 <b>"다음 토큰 맞히기" 성적</b>일 뿐이라, 조련이 만드는 가치
      (지시 따르기·간결함·안전함)를 못 잽니다. 심지어 조련된 모델은 분포가
      원본에서 이동해서(6장의 KL!) 인터넷 텍스트 PPL 이 <b>나빠지기도</b> 해요 —
      더 좋아졌는데도요. 그래서 조련 평가에는 다른 자가 필요합니다.
    </p>

    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[28rem] text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3">자(측정 도구)</th>
            <th class="py-2 pr-3">방식</th>
            <th class="py-2">강점 / 한계</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100">
            <td class="py-2 pr-3 font-medium">벤치마크</td>
            <td class="py-2 pr-3">객관식·단답 시험지 (자동 채점)</td>
            <td class="py-2">싸고 재현 가능 / 지시 따르기·말투는 못 잼, 시험지 유출(오염) 위험</td>
          </tr>
          <tr class="border-b border-slate-100">
            <td class="py-2 pr-3 font-medium">사람 평가</td>
            <td class="py-2 pr-3">A/B 대결 → Elo 순위 (4장의 수학!)</td>
            <td class="py-2">가장 믿을 만함 / 비싸고 느림</td>
          </tr>
          <tr>
            <td class="py-2 pr-3 font-medium">LLM 심판 (LLM-as-a-judge)</td>
            <td class="py-2 pr-3">강한 모델에게 두 답변 비교시킴</td>
            <td class="py-2">싸고 빠름 / 심판도 편향(장황함·첫 번째 위치·자기 스타일 선호)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="퍼플렉시티(5부 7장)가 조련 평가의 자로 부적절한 이유는?"
      :choices="['다음 토큰 맞히기 성적일 뿐, 지시 따르기·간결함·안전함 같은 조련의 가치를 못 재서', '계산이 불가능해서', '조련 후에는 정의되지 않아서', '적절하다 — 문제없다']"
      :answer="0"
      explanation="조련된 모델은 분포가 원본에서 이동해 PPL이 나빠지기도 합니다 — 더 좋아졌는데도요. 재는 것과 원하는 것이 다른 거죠."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 성적표 읽기 — 3부 심화가 여기서 회수된다</h2>
    <p class="leading-relaxed text-slate-700">
      "우리 모델 72%, 경쟁 모델 66% — 우리가 이겼다!" 정말일까요?
      벤치마크 점수는 <b>표본 평균</b>입니다(3부). 문항 수가 적으면 오차범위(±)가 커서,
      그 차이가 <b>우연</b>일 수 있어요 — 3부 8장(신뢰구간)과 9장(가설검정 — "우연인가
      진짜인가")이 정확히 이 상황을 위한 도구였습니다. 직접 확인해 보세요.
    </p>

    <EvalLab />

    <ConceptCard tone="tip" title="핵심 습관 — 점수 옆의 ±를 찾아라">
      오차범위는 대략 <b>1/√n 으로 줄어듭니다</b> — 문항을 4배 늘려야 ±가 절반.
      점수 차이가 ±보다 작으면 판단 보류가 정답입니다. 리더보드의 1~2%p 순위 다툼을
      볼 때, "문항 몇 개짜리 시험이지?"부터 묻는 것 — 그게 3부 심화가 준 문해력이에요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="200문항 벤치마크에서 두 모델이 71% vs 69%(2%p 차이)가 나왔습니다. 올바른 결론은?"
      :choices="['오차범위가 차이보다 커서 승자를 말할 수 없다 — 문항을 늘려야 한다', '2%p라도 차이는 차이 — 71% 모델의 승리', '69% 모델이 사실 더 좋다', '벤치마크는 항상 무의미하다']"
      :answer="0"
      :hints="['200문항의 ±는 몇 %p쯤일까요? 실험 ①의 감각을 떠올려 보세요.']"
      explanation="n=200이면 ±가 6%p 안팎 — 2%p 차이는 우연 범위 안입니다. 3부 9장의 질문 그대로: 우연인가, 진짜인가?"
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 성적표에 안 잡히는 것 — 부작용 3종</h2>
    <p class="leading-relaxed text-slate-700">
      더 무서운 건 점수가 좋아 보여도 생기는 문제들입니다. 위 실험 ②(진단소)에서
      봤듯, 과잉 조련의 부작용은 <b>지금까지 배운 메커니즘의 그림자</b>예요 —
      <b>아첨(sycophancy)</b>은 보상 모델의 근사 구멍(4장)이,
      <b>망각(catastrophic forgetting)</b>은 원본 이탈(6장)이,
      <b>거절 과잉(over-refusal)</b>은 안전 조련의 과최적화가 만든 것.
      (셋 다 논문·문서에는 이 영문 이름으로 나와요.) 각각 전용 평가셋으로
      <b>따로 감시</b>해야 잡힙니다. 종합 점수 하나로는 절대 안 보여요.
    </p>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">단일 점수를 믿지 말고, 여러 자로 재고, ±를 따져라</p>
      <p class="mt-1 text-sm text-indigo-600">그리고 진짜 시험은 하나 — 당신의 용도로 만든 당신의 평가셋.</p>
    </div>

    <DetailsCard title="➕ 더 깊이: 오차범위의 정체 + 내 평가셋 만들기">
      실험 ①의 ± 는 3부 8장의 95% 신뢰구간 공식 <b>±1.96·√(p(1−p)/n)</b> 입니다 —
      p≈0.7, n=100 이면 ±9%p, n=2000 이면 ±2%p. 그리고 실무의 정답 하나:
      공개 벤치마크 점수와 <b>내 용도의 성능은 상관(3부 10장)이 완벽하지 않습니다</b>.
      사내 챗봇이라면 실제 들어올 질문 50~100개로 <b>자체 평가셋</b>을 만들어
      조련 전후를 비교하는 것 — 그게 어떤 리더보드보다 정확한 성적표예요.
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 3부 8~10장 (심화 트랙의 회수처)">
      1~7장을 달리는 동안 "선택"으로 밀려 있던 3부 심화가 여기서 전부 일합니다.
      <b><PartLink :part="3" ch="ch8">8장 신뢰구간</PartLink></b>: 점수의 ± / <b><PartLink :part="3" ch="ch9">9장 가설검정</PartLink></b>: 차이가 우연인가 진짜인가 /
      <b><PartLink :part="3" ch="ch10">10장 상관</PartLink></b>: 벤치마크 점수 ↔ 실사용 만족의 관계. 그리고 <b>4장(6부)의 Elo</b>가
      사람 평가(Chatbot Arena)의 뼈대로 재등장했죠. 평가는 통계 문해력의 실전입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="조련 성적표 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="조련 평가의 세 가지 자가 아닌 것은?"
        :choices="['퍼플렉시티 리더보드', '벤치마크(자동 채점 시험)', '사람 A/B 평가(Elo)', 'LLM 심판']"
        :answer="0"
        explanation="PPL은 다음 토큰 성적일 뿐 조련의 가치를 못 잽니다 — 이 장의 출발점이었죠."
      />
      <Quiz
        difficulty="easy"
        question="사용자가 틀린 말을 해도 모델이 맞장구치는 부작용의 이름은?"
        :choices="['아첨 (sycophancy)', '망각', '거절 과잉', '보상 해킹']"
        :answer="0"
        explanation="진단소의 1번 환자 — '1+1=3이잖아?'에 '통찰력이 대단하시네요'라고 답하던 그 증상입니다."
      />
      <Quiz
        difficulty="easy"
        question="회사 규정으로 조련했더니 파이썬 질문에도 취업규칙을 답합니다. 이 부작용은?"
        :choices="['망각 (catastrophic forgetting)', '아첨', '환각', '토큰 초과']"
        :answer="0"
        explanation="좁은 조련이 사전학습의 일반 능력을 지운 것 — 원본 분포에서 너무 멀어진 결과입니다(6장 계보)."
      />
      <Quiz
        difficulty="easy"
        question="벤치마크 점수는 통계적으로 무엇에 해당하나요?"
        :choices="['표본 평균 — 그래서 오차범위(±)가 붙는다', '모집단 전체의 참값', '확률이 아닌 상수', '기댓값의 정의']"
        :answer="0"
        explanation="문항이라는 표본으로 실력이라는 모집단을 추정하는 것 — 3부 8장의 구도 그대로입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="오차범위는 1/√n 으로 줄어듭니다. 문항을 100개에서 400개로 늘리면 ±는 몇 분의 1이 될까요?"
        :steps="[
          { lhs: '\\sqrt{100}', answer: 10 },
          { lhs: '\\sqrt{400}', answer: 20 },
          { lhs: '20 \\div 10', answer: 2 },
        ]"
        :hints="['√n 이 분모에 있으니, √n 이 몇 배가 되는지 보면 됩니다.']"
        explanation="√n이 2배 → ±는 2분의 1. 문항 4배 = 정밀도 2배 — 정확한 성적표는 비쌉니다."
      />
      <Quiz
        difficulty="medium"
        question="LLM 심판(LLM-as-a-judge)의 알려진 편향이 아닌 것은?"
        :choices="['짧고 간결한 답을 무조건 선호한다', '장황한 답을 선호하는 경향', '먼저 제시된 답변을 선호하는 위치 편향', '자기(같은 계열 모델) 스타일 선호']"
        :answer="0"
        :hints="['4장에서 보상 모델이 후하게 주던 패턴을 떠올려 보세요.']"
        explanation="오히려 반대 — 장황함 선호가 대표 편향입니다. 그래서 심판을 쓸 땐 답변 순서 뒤집어 재채점 같은 보정을 해요."
      />
      <Quiz
        difficulty="medium"
        question="아첨(sycophancy)의 원인 계보로 가장 정확한 것은?"
        :choices="['라벨러가 동조형 답변을 선호 → RM이 동조에 후한 점수 → 조련이 과최적화', '모델의 지식 부족', '토크나이저 버그', 'GPU 메모리 부족']"
        :answer="0"
        explanation="4장(RM은 라벨러 취향의 근사)과 6장(과최적화)의 그림자입니다 — 부작용은 배운 메커니즘의 뒷면이에요."
      />
      <Quiz
        difficulty="medium"
        question="조련 후 인터넷 텍스트 퍼플렉시티가 나빠졌습니다. 반드시 나쁜 신호일까요?"
        :choices="['아니다 — 분포가 원본에서 의도적으로 이동했으니 자연스러울 수 있다', '그렇다 — 조련 실패의 확정 증거', 'PPL은 조련 후 측정 불가', '나빠질 수 없다 — 측정 오류다']"
        :answer="0"
        explanation="조련의 목적 자체가 분포 이동(이어쓰기 → 답변)입니다. 원본 분포 기준의 PPL 악화는 예상된 부수 효과일 수 있어요 — 다른 자로 재야 합니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="리더보드에서 우리 모델이 1.2%p 앞섰습니다(500문항 벤치마크). 홍보 자료에 '경쟁사 제쳤다'라고 쓰기 전에 확인할 것은?"
        :choices="['500문항의 오차범위(±4%p 안팎)가 차이보다 큰지 — 크다면 판단 보류', '점수가 소수점까지 같은지', '모델 파일 크기 비교', '확인할 것 없음 — 이긴 건 이긴 것']"
        :answer="0"
        :hints="['±는 대략 1.96·√(p(1−p)/n) — n=500이면?']"
        explanation="n=500, p≈0.7이면 ±4%p 수준 — 1.2%p 차이는 우연 범위입니다. 3부 9장의 질문(우연인가 진짜인가)을 통과 못 하면 홍보가 아니라 소음이에요."
      />
      <Quiz
        difficulty="hard"
        question="사내 챗봇 도입 전 평가 전략으로 가장 좋은 것은?"
        :choices="['실제 들어올 질문 50~100개로 자체 평가셋을 만들어 조련 전후 비교 + 부작용 전용 셋 병행', '공개 벤치마크 1등 모델을 그대로 신뢰', 'LLM 심판 점수 하나만 확인', '개발자 몇 명이 감으로 체험']"
        :answer="0"
        :hints="['벤치마크 점수와 내 용도 성능의 상관은 완벽하지 않다고 했죠(3부 10장).']"
        explanation="내 분포에서 뽑은 시험 + 아첨·망각·거절 감시 셋 — 단일 점수 맹신을 피하는 이 장의 결론 그대로입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch9')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">9장 완료 — 성적표 읽는 눈까지 갖췄어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        이제 마지막 — 10장 캡스톤. SFT → 보상 모델 → DPO, 조련 파이프라인 전체를
        직접 조립하며 시리즈의 여정을 마무리합니다.
      </p>
      <RouterLink
        to="/ch/ch10"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        10장 — 🎯 캡스톤 →
      </RouterLink>
    </div>
  </article>
</template>
