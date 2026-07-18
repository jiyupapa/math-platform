<script setup lang="ts">
// 3장 — 도구를 드는 손: 도구 호출. "언제 도구를 쓰나"가 분류 결정임을 목격하고,
// 신뢰도 점수·임계값·놓침/헛발의 저울질과 교정(calibration)의 맛을 본다.
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ToolRouteLab from '@/components/ToolRouteLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch3')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">3장 · 35분</p>
    <h1 class="mb-4 text-3xl font-bold">도구를 드는 손 — 도구 호출</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      에이전트의 걸음(2장) 중에는 특별한 걸음이 있습니다 — <b>도구를 집어 드는 순간</b>이죠.
      계산기·검색·사내 API… 쓸지 말지를 <b>맞게 결정하는 것</b>부터가 하나의 확률 문제입니다.
      이 장에서는 그 결정의 해부도(신뢰도 점수 → 임계값 → 호출)를 직접 조작합니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      도구 호출이 <b>분류 결정</b>임을 이해하고, 임계값을 움직이면
      <b>놓침(필요한데 안 씀)과 헛발(불필요한데 씀)이 맞바꿔진다</b>는 것,
      그리고 완벽한 임계값은 없어서 <b>업무의 오류 비용</b>이 선택을 정한다는 것까지 —
      "도구를 잘 드는 손"의 수학을 갖춥니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대 — 도구함 앞에서 머뭇거리는 일꾼</h2>
    <p class="leading-relaxed text-slate-700">
      AI 일꾼에게 계산기를 쥐여 줬습니다. 그런데 새로운 고민이 생깁니다 —
      <b>"이 질문, 계산기를 써야 하나?"</b> "1,247 × 38"은 당연히 계산기감이지만,
      "퍼센트포인트가 뭐야?"는 계산 <i>용어</i>일 뿐 계산이 아니고, "최신 환율이 얼마야?"는
      숫자 냄새가 나지만 사실 <i>검색</i>감이죠. 라우터(안내 데스크)는 질문마다
      <b>"계산 도구가 필요할 확신"을 0~1 점수</b>로 매기고, 점수가 <b>임계값</b>을 넘으면
      도구를 호출합니다. 오늘 들어온 질문 20개로 그 저울질을 직접 해 봅시다.
    </p>

    <ToolRouteLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 완벽한 임계값은 없다, 저울질이 있을 뿐">
      기본 임계값 <b>0.50</b>에서는 20개 중 16개를 맞히고 <b>놓침 2 + 헛발 2</b>.
      임계값을 <b>0.40</b>으로 내리면 놓침 0·헛발 2, <b>0.58</b>로 올리면 놓침 2·헛발 0 —
      둘 다 18개 정답으로 <b>정확도는 같지만 오류의 종류가 다릅니다</b>. 이 데이터에선 어떤
      임계값도 20/20을 만들 수 없어요(0.42~0.55 사이에 계산 문제와 아닌 것이 섞여 있으니까요).
      그래서 질문은 "몇 점이 최적인가"가 아니라 <b>"우리 업무엔 어느 오류가 더 아픈가"</b>가 됩니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="기본 임계값 0.50에서 라우터의 성적은?"
      :choices="['정답 16/20 — 놓침 2개, 헛발 2개', '정답 20/20 — 완벽', '정답 8/20 — 전부 헛발', '집계할 수 없다']"
      :answer="0"
      :hints="['랩의 ③ 혼동 행렬에서 빨간 칸(놓침)과 노란 칸(헛발)을 보세요.']"
      explanation="16/20 — '이 숫자들 합계가 맞는지 봐줘'(0.48)와 '23명을 3개 조로'(0.42)를 놓치고, '최신 환율'(0.55)과 '이직률 통계'(0.52)에 헛발을 짚었습니다. 애매한 경계 사례가 문제죠."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>

    <ConceptCard tone="note" title="새 용어: 라우팅 / 신뢰도 / 임계값 / 놓침·헛발의 정식 이름">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>라우팅</b> (routing) — 읽는 법: 라우팅.
          뜻: 들어온 질문을 <b>알맞은 도구(또는 그냥 답변)로 보내는 결정</b> — 안내 데스크가
          방문객을 부서로 안내하듯. 도구가 여럿이면 도구 수만큼의 분류 문제가 됩니다.
        </li>
        <li>
          <b>신뢰도</b> (confidence) — 읽는 법: 컨피던스.
          뜻: 모델이 자기 판단에 매긴 <b>확신 점수(0~1)</b>. 확률처럼 <i>읽고 싶지만</i>,
          실제 확률과 얼마나 맞는지는 검증(교정)해 봐야 압니다 — 3절의 주제.
        </li>
        <li>
          <b>임계값</b> (threshold) — 읽는 법: 스레숄드(문턱값).
          뜻: <b>"이 점수부터는 호출한다"</b>는 문턱. 내리면 헛발이 늘고 올리면 놓침이 늡니다 —
          공짜로 좋아지는 방향은 없어요.
        </li>
        <li>
          <b>놓침·헛발의 정식 이름</b> — 통계·ML 에서는 놓침(필요한데 안 씀)을
          <b>거짓 음성(false negative)</b>, 헛발(불필요한데 씀)을 <b>거짓 양성(false positive)</b>
          이라고 부릅니다. 랩 ③처럼 네 칸으로 집계한 표의 이름이 <b>혼동 행렬(confusion matrix)</b> —
          논문·문서에는 전부 이 이름으로 나와요. 이 과정에서는 계속 놓침·헛발이라 부를게요.
        </li>
      </ul>
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 점수를 확률처럼 읽어도 될까 — 교정</h2>
    <p class="leading-relaxed text-slate-700">
      랩의 ④를 켜 보세요. 점수 구간별로 <b>실제 계산 문제의 비율</b>을 세어 보면 —
      0.2 미만 구간은 0/8(0%), <b>0.4~0.6 구간은 2/4(50%)</b>, 0.8 이상은 4/4(100%).
      "점수 0.5 근처 = 실제로 반반"이니 이 라우터의 점수는 확률처럼 읽어도 크게 억울하지
      않은 상태입니다. 이렇게 <b>"점수가 s일 때 실제로 맞을 확률"</b> — 기호로는 조건부 확률
      P(계산 문제 | 점수 구간) — 을 재서 점수와 비교하는 것을 <b>교정</b>(calibration, 읽는 법:
      캘리브레이션)이라고 해요. 조건부 확률의 문법은 3부 4장에서 배운 그대로입니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="점수 0.8 이상 구간의 질문 중 실제 계산 문제의 비율은 몇 %였나? (정수)"
      type="numeric"
      :answer="100"
      :hints="['랩 ④의 마지막 줄 — 4개 중 몇 개였나요?']"
      explanation="4/4 = 100%. 높은 점수 구간일수록 실제 비율도 높아지는 — 점수가 확률 구실을 하는 — 상태가 '교정이 잘 된' 라우터입니다."
    />

    <DetailsCard title="➕ 더 깊이: 과신하는 라우터 — 점수는 보증이 아니다">
      실제 LLM이 매기는 확신 점수는 오늘 랩처럼 얌전하지 않을 때가 많습니다 — 0.9라고
      말하면서 실제로는 70%만 맞는 <b>과신</b>(overconfidence)이 흔하죠. 그래서 실무에선
      오늘 ④에서 만든 표를 정식으로 그린 <b>교정 곡선</b>(reliability diagram)으로 점수의
      정직성부터 검사하고, 어긋나 있으면 점수를 보정해서 씁니다. 기억할 문장:
      <b>"점수는 주장이고, 교정은 검증이다."</b> 그리고 교정이 잘 된 점수여야 다음 장들의
      무기 — 재시도를 언제 멈출지(4장), 검수를 언제 붙일지(6장) — 가 제대로 작동합니다.
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 함수 호출(function calling)의 정체">
      실무 API에서 도구 사용은 이렇게 생겼습니다 — 개발자가 도구 목록(이름·설명·인자 스키마)을
      주면, 모델이 <b>"이 도구를 이 인자로 불러 달라"는 JSON</b>을 출력하고(함수 호출·tool use),
      시스템이 실행 결과를 다시 모델에게 돌려줍니다. 오늘 배운 눈으로 보면 그 첫 줄 —
      <b>어떤 도구를 고르나 — 가 바로 라우팅 분류</b>이고, 잘못 고르면 2장의 사슬에서 그 걸음의
      p를 깎아 먹습니다(도구 호출도 사슬의 한 걸음!). "점수가 s일 때 실제로 맞을 확률"의 문법은
      <b><PartLink :part="3" ch="ch4">3부 4장</PartLink></b>(조건부 확률)에서, 질문과 도구
      설명의 <b>의미가 가까운가</b>로 라우팅하는 시맨틱 라우팅은
      <b><PartLink :part="7" ch="ch2">7부 2장</PartLink></b>(코사인 유사도)에서 쌓은 기초
      그대로예요. 다음 장부터는 걸음이 틀렸을 때의 회복술 — 다시 뽑기입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="도구를 드는 손 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="'라우팅'의 뜻으로 가장 알맞은 것은?"
        :choices="['들어온 질문을 알맞은 도구(또는 그냥 답변)로 보내는 결정', '도구를 빠르게 실행하는 기술', '질문을 여러 개로 쪼개는 것', '답변을 예쁘게 정리하는 것']"
        :answer="0"
        explanation="안내 데스크의 일과 같습니다 — 방문객(질문)을 맞는 부서(도구)로 보내는 분류 결정이에요."
      />
      <Quiz
        difficulty="easy"
        question="신뢰도 점수가 높으면 그 판단은 항상 맞는다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 점수는 모델의 '주장'이고, 실제 확률과 맞는지는 교정으로 검증해야 합니다 — 과신하는 모델도 흔해요."
      />
      <Quiz
        difficulty="easy"
        question="임계값 0.50에서 라우터가 올바르게 판정한 질문은 20개 중 몇 개였나?"
        type="numeric"
        :answer="16"
        explanation="16개 — 놓침 2(합계 확인 0.48, 조 나누기 0.42) + 헛발 2(환율 0.55, 통계 0.52)를 뺀 수입니다."
      />
      <Quiz
        difficulty="easy"
        question="'계산 도구가 필요한 질문인데 호출하지 않은 것'을 이 장에서 부르는 이름은?"
        :choices="['놓침', '헛발', '교정', '라우팅']"
        :answer="0"
        explanation="놓침(필요한데 안 씀) ↔ 헛발(불필요한데 씀) — 임계값은 이 둘을 맞바꾸는 다이얼입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="임계값을 내리면(예: 0.50 → 0.30) 일어나는 일은?"
        :choices="['호출이 후해져 놓침은 줄고 헛발은 늘어난다', '호출이 짜져 놓침이 늘어난다', '두 오류가 함께 줄어든다', '아무 변화 없다']"
        :answer="0"
        :hints="['문턱이 낮아지면 문을 넘는 질문이 많아집니다.']"
        explanation="문턱을 내리면 더 많은 질문이 도구로 갑니다 — 필요한 걸 놓칠 일은 줄지만 불필요한 호출(헛발)이 늘어요. 공짜 방향은 없습니다."
      />
      <Quiz
        difficulty="medium"
        question="임계값 0.40과 0.58은 둘 다 18/20으로 정확도가 같았다. 무엇이 달랐나?"
        :choices="['오류의 종류 — 0.40은 놓침 0·헛발 2, 0.58은 놓침 2·헛발 0', '판정 속도', '점수의 교정 상태', '아무것도 다르지 않다']"
        :answer="0"
        :hints="['랩에서 0.40 로 / 0.58 로 버튼을 눌러 혼동 행렬을 비교해 보세요.']"
        explanation="같은 정확도라도 오류의 구성이 다릅니다 — 그래서 임계값 선택은 정확도가 아니라 '어느 오류가 더 아픈가'로 정해요."
      />
      <Quiz
        difficulty="medium"
        question="점수 0.4~0.6 구간 질문 중 실제 계산 문제의 비율은 몇 %였나? (정수)"
        type="numeric"
        :answer="50"
        :hints="['랩 ④에서 그 구간은 2/4 였습니다.']"
        explanation="2/4 = 50% — '점수 0.5 근처는 실제로 반반'이라는 뜻이고, 이 대응이 잘 맞을 때 교정이 잘 됐다고 합니다."
      />
      <Quiz
        difficulty="medium"
        question="도구 호출을 2장의 사슬 관점에서 보면?"
        :choices="['사슬의 한 걸음 — 잘못된 도구 선택도 그 단계의 성공 확률을 깎는다', '사슬과 무관한 별도 과정', '사슬을 항상 짧게 만든다', '사슬의 마지막에만 온다']"
        :answer="0"
        explanation="검색해야 할 걸 암산하거나 계산기를 헛돌리면 그 걸음이 틀어집니다 — 라우팅 정확도는 곱셈 사슬의 p_i 중 하나예요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="재무 수치 검증 업무 — 계산이 필요한 질문을 놓치면 틀린 숫자가 보고서에 실린다. 임계값을 어느 쪽으로 옮기는 게 합리적인가?"
        :choices="['내린다 — 헛발(불필요한 호출)의 비용을 감수하고 놓침을 최소화한다', '올린다 — 호출 횟수를 아끼는 게 우선이다', '0.5가 항상 최적이므로 그대로 둔다', '임계값과 무관하게 결과는 같다']"
        :answer="0"
        :hints="['이 업무에서 더 아픈 오류는 놓침인가 헛발인가?']"
        explanation="놓침의 비용(틀린 보고서)이 헛발의 비용(계산기 몇 번 더)보다 크므로 문턱을 내려 놓침 0 쪽(랩의 0.40 지점)으로 갑니다 — 오류 비용이 임계값을 정한다는 원칙입니다."
      />
      <Quiz
        difficulty="hard"
        question="호출 1건에 과금되는 비싼 외부 API + 어차피 암산으로도 거의 맞는 쉬운 질문들 — 이 상황의 임계값 설계로 가장 알맞은 것은?"
        :choices="['올린다 — 헛발이 곧 돈이므로 확신이 높을 때만 호출하고, 교정 표로 그 점수대의 실제 적중률을 확인해 둔다', '내린다 — 도구는 많이 쓸수록 좋다', '임계값 대신 동전을 던진다', '교정 표는 비용과 무관하니 볼 필요 없다']"
        :answer="0"
        :hints="['이번엔 헛발이 더 아픈 업무입니다 — 그리고 “확신이 높다”를 믿으려면 무엇이 검증돼야 했죠?']"
        explanation="헛발의 비용이 크면 문턱을 올려(랩의 0.58 지점) 놓침을 감수합니다 — 단, 그 판단의 근거인 점수가 정직한지(교정)를 먼저 확인해야 해요. 오류 비용 + 교정 상태, 두 가지가 임계값 설계의 전부입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch3')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">3장 완료 — 도구를 드는 손이 생겼습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        걸음(2장)과 도구(3장)를 갖췄으니, 이제 틀린 걸음을 되살리는 첫 번째 무기 —
        다시 뽑기(재시도와 Best-of-N)로 갑니다.
      </p>
      <RouterLink
        to="/ch/ch4"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        4장 — 다시 뽑기 →
      </RouterLink>
    </div>
  </article>
</template>
