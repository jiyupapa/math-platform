<script setup lang="ts">
// Phase 3 · 확률의 기초 (경우의 수 → 확률의 정의 → 확률의 법칙)
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import DiceSim from '@/components/DiceSim.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch3')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">3장</p>
    <h1 class="mb-4 text-3xl font-bold">확률의 기초 🎲</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1~2장에서는 이미 모아 놓은 <b>데이터</b>를 요약했습니다. 이제 방향을 바꿔서
      "아직 일어나지 않은 일"을 다루는 도구, <b>확률</b>을 배웁니다. 어렵게 들리지만
      출발점은 딱 하나예요. <b>경우의 수를 세는 것</b>. 세는 것만 할 줄 알면
      확률의 절반은 끝난 겁니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>시행·표본공간·사건: 확률의 <b>말하는 방식</b>에 익숙해진다</li>
        <li>확률 = <b>경우의 수의 비율</b>로 직접 계산한다</li>
        <li>여사건·덧셈법칙·곱셈법칙으로 <b>복잡한 확률을 쪼개서</b> 구한다</li>
        <li>AI 언어모델이 왜 "확률로 말하는 기계"인지 이해한다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 시행·표본공간·사건 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 확률의 언어: 시행, 표본공간, 사건</h2>
    <ReviewFlag id="ch3-s1" chapter="ch3" label="1. 확률의 언어: 시행, 표본공간, 사건" />
    <p class="leading-relaxed text-slate-700">
      확률 이야기를 하려면 먼저 단어 세 개만 알면 됩니다. 주사위 한 개를 던지는 상황으로 볼게요.
    </p>

    <ConceptCard tone="note" title="새 용어: 시행 / 표본공간 / 사건">
      <ul class="list-disc space-y-2 pl-5 text-sm">
        <li>
          <b>시행(trial)</b>: 같은 조건에서 반복할 수 있는 실험이나 관찰.
          예: "주사위를 한 번 던진다", "동전을 한 번 던진다".
        </li>
        <li>
          <b>표본공간(sample space)</b>: 그 시행에서 <b>나올 수 있는 모든 결과</b>의 모음.
          주사위라면 {1, 2, 3, 4, 5, 6}, 총 6가지. 기호로는 <MathBlock inline expr="S" /> 라고 씁니다.
        </li>
        <li>
          <b>사건(event)</b>: 표본공간 중에서 <b>관심 있는 결과들</b>만 모은 부분.
          예: "짝수가 나온다" = {2, 4, 6}. 기호로는 <MathBlock inline expr="A" />,
          <MathBlock inline expr="B" /> 같은 대문자를 씁니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      정리하면, <b>시행</b>을 하면 <b>표본공간</b>의 결과 중 하나가 나오고, 그 결과가
      정해 둔 <b>사건</b>에 속하는지를 따지는 게 확률입니다. 이 세 단어만 알면
      확률 문장은 전부 읽을 수 있어요.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="주사위 1개를 던지는 시행에서 표본공간의 결과는 모두 몇 가지인가요?"
      type="numeric"
      :answer="6"
      :hints="['나올 수 있는 눈을 전부 세어 보세요.', '{1, 2, 3, 4, 5, 6}']"
      explanation="표본공간 S = {1, 2, 3, 4, 5, 6}, 총 6가지입니다."
    />

    <!-- 2. 수학적 확률 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 확률 = 경우의 수의 비율</h2>
    <ReviewFlag id="ch3-s2" chapter="ch3" label="2. 확률 = 경우의 수의 비율" />
    <p class="leading-relaxed text-slate-700">
      모든 결과가 <b>똑같이 나올 법하다면</b>(주사위의 각 눈, 동전의 앞뒤처럼),
      사건 <MathBlock inline expr="A" /> 의 확률은 그냥 <b>비율</b>입니다:
    </p>
    <MathBlock expr="P(A) = \dfrac{\,A\,\text{가 일어나는 경우의 수}\,}{\text{전체 경우의 수}}" />
    <p class="leading-relaxed text-slate-700">
      예를 들어 주사위에서 "짝수" 사건은 {2, 4, 6} 으로 3가지, 전체는 6가지이므로
      <MathBlock inline expr="P(\text{짝수}) = \tfrac{3}{6} = \tfrac{1}{2} = 0.5" /> 입니다.
    </p>

    <ConceptCard tone="note" title="새 기호: P( ) 와 확률의 성질">
      <ul class="list-disc space-y-2 pl-5 text-sm">
        <li>
          <MathBlock inline expr="P(A)" /> &nbsp; <b>읽는 법</b>: "피 에이" ·
          <b>뜻</b>: 사건 <MathBlock inline expr="A" /> 가 일어날 확률. P 는 Probability(확률)의 머리글자.
        </li>
        <li>
          확률은 항상 <MathBlock inline expr="0 \le P(A) \le 1" /> 입니다.
          0 = 절대 안 일어남, 1 = 반드시 일어남, 0.5 = 반반.
        </li>
        <li>표본공간의 모든 결과 확률을 다 더하면 정확히 <b>1</b> 입니다 (뭐라도 하나는 나오니까).</li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="warn" title="전제 조건 주의: '똑같이 나올 법할 때'만">
      경우의 수 나누기 공식은 모든 결과가 <b>등확률</b>일 때만 씁니다. 찌그러진 주사위나
      "내일 비가 온다/안 온다"(반반이 아니죠!)에는 그대로 쓰면 안 돼요. 그런 경우는
      아래의 <b>경험적 확률</b>로 접근합니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="주사위 1개에서 3의 배수(3 또는 6)가 나오는 경우의 수는 몇 가지인가요?"
      type="numeric"
      :answer="2"
      :hints="['1~6 중 3의 배수를 골라 보세요.']"
      explanation="{3, 6} 으로 2가지. 따라서 확률은 2/6 = 1/3 ≈ 0.33 입니다."
    />

    <!-- 3. 경험적 확률 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 세지 못하면 던져 본다: 경험적 확률</h2>
    <ReviewFlag id="ch3-s3" chapter="ch3" label="3. 경험적 확률" />
    <p class="leading-relaxed text-slate-700">
      워밍업 챕터에서 동전을 1000번 던지면 앞면 비율이 0.5 에 다가가는 걸 봤죠?
      이렇게 <b>실제로 반복해 본 비율</b>을 <b>경험적 확률</b>이라고 합니다.
      경우의 수를 셀 수 없는 상황(불량률, 클릭률, 비 올 확률)에서는 이 방법을 씁니다.
      시행을 많이 할수록 경험적 확률은 진짜 확률에 가까워지는데, 이 성질의 정식 이름이
      <b>큰 수의 법칙</b>이고, 7장에서 제대로 다룹니다.
    </p>

    <!-- 4. 주사위 2개 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 주사위 2개: 합마다 확률이 다르다</h2>
    <ReviewFlag id="ch3-s4" chapter="ch3" label="4. 주사위 2개: 합의 분포" />
    <p class="leading-relaxed text-slate-700">
      주사위 <b>2개</b>를 던져 눈의 <b>합</b>을 보면 재미있는 일이 생깁니다. 전체 경우의 수는
      6 × 6 = <b>36가지</b>인데, 합이 2가 되는 방법은 (1,1) 하나뿐이지만 합이 7이 되는 방법은
      (1,6) (2,5) (3,4) (4,3) (5,2) (6,1), 모두 <b>6가지</b>나 됩니다. 표로 전부 확인해 보세요
      (파란 칸이 합 7):
    </p>

    <div class="my-5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
      <table class="mx-auto text-center text-sm">
        <thead>
          <tr class="text-slate-500">
            <th class="px-2 py-1 font-medium">＋</th>
            <th v-for="c in 6" :key="'h' + c" class="px-2 py-1 font-medium">{{ c }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in 6" :key="'r' + r" class="border-t border-slate-100">
            <td class="px-2 py-1 font-medium text-slate-500">{{ r }}</td>
            <td
              v-for="c in 6"
              :key="'c' + c"
              class="px-2 py-1"
              :class="r + c === 7 ? 'bg-indigo-100 font-bold text-indigo-700' : 'text-slate-600'"
            >
              {{ r + c }}
            </td>
          </tr>
        </tbody>
      </table>
      <p class="mt-2 text-center text-xs text-slate-500">
        가로·세로 = 각 주사위의 눈, 칸 = 두 눈의 합. 합 7 이 대각선으로 6칸이라 가장 많습니다.
      </p>
    </div>

    <p class="leading-relaxed text-slate-700">
      그래서 <MathBlock inline expr="P(\text{합}=7) = \tfrac{6}{36} = \tfrac{1}{6}" /> 이고,
      <MathBlock inline expr="P(\text{합}=2) = \tfrac{1}{36}" /> 입니다. 정말 그런지
      직접 굴려서 확인해 보세요:
    </p>

    <DiceSim />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="주사위 2개의 합 중에서 가장 잘 나오는 값은 7이다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 합 7은 경우의 수가 6가지(6/36)로 가장 많아요. 시뮬레이터의 삼각형 모양이 그 증거입니다."
    />

    <!-- 5. 여사건 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 여사건: "아닐 확률"은 1에서 빼면 끝</h2>
    <ReviewFlag id="ch3-s5" chapter="ch3" label="5. 여사건" />
    <p class="leading-relaxed text-slate-700">
      "짝수가 나온다"의 반대는 "짝수가 <b>안</b> 나온다"죠. 이렇게 사건
      <MathBlock inline expr="A" /> 가 <b>일어나지 않는</b> 사건을 <b>여사건</b>이라 부르고
      <MathBlock inline expr="A^c" /> 라고 씁니다. 전체 확률이 1이니까, 둘의 관계는 아주 간단해요:
    </p>
    <MathBlock expr="P(A^c) = 1 - P(A)" />

    <ConceptCard tone="note" title="새 기호: 여사건 Aᶜ">
      <MathBlock inline expr="A^c" /> &nbsp; <b>읽는 법</b>: "에이 컴플리먼트(여사건)" ·
      <b>뜻</b>: A 가 일어나지 않는 사건. 위 첨자 c 는 complement(보완)의 머리글자입니다.
      예: 주사위에서 A = 6이 나옴(1/6)이면 <MathBlock inline expr="P(A^c) = 1 - \tfrac{1}{6} = \tfrac{5}{6}" />.
    </ConceptCard>

    <!-- 6. 덧셈법칙 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">6. 덧셈법칙: "또는" 은 더한다</h2>
    <ReviewFlag id="ch3-s6" chapter="ch3" label="6. 덧셈법칙 (또는)" />
    <p class="leading-relaxed text-slate-700">
      "1이 나오거나 <b>또는</b> 2가 나올 확률"처럼 두 사건 중 <b>하나라도</b> 일어날 확률은,
      두 사건이 <b>동시에 일어날 수 없다면</b>(이걸 <b>배반사건</b>이라 합니다. 주사위가
      1이면서 동시에 2일 수는 없죠) 그냥 더하면 됩니다:
    </p>
    <MathBlock expr="P(A \cup B) = P(A) + P(B) \quad (A, B \text{ 가 배반일 때})" />

    <ConceptCard tone="note" title="새 기호: ∪ (합집합, '또는')">
      <MathBlock inline expr="A \cup B" /> &nbsp; <b>읽는 법</b>: "에이 합집합 비" 또는 "A 또는 B" ·
      <b>뜻</b>: A 와 B 중 <b>적어도 하나</b>가 일어나는 사건. 컵 모양(∪)이라 "컵 기호"라고
      기억해도 좋아요. 예: <MathBlock inline expr="P(1 \cup 2) = \tfrac{1}{6} + \tfrac{1}{6} = \tfrac{2}{6} = \tfrac{1}{3}" />.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="주사위 1개를 던져 '5 또는 6'이 나올 확률은? (소수 셋째 자리 반올림)"
      type="numeric"
      :answer="0.333"
      :tolerance="0.005"
      :hints="['5와 6은 동시에 나올 수 없는 배반사건이니 「또는」은 덧셈법칙!', '1/6 + 1/6 = 2/6 ≈ ?']"
      explanation="배반사건이므로 그냥 더합니다: 1/6 + 1/6 = 2/6 = 1/3 ≈ 0.333."
    />

    <!-- 7. 곱셈법칙 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">7. 곱셈법칙: "그리고" 는 곱한다</h2>
    <ReviewFlag id="ch3-s7" chapter="ch3" label="7. 곱셈법칙 (그리고)" />
    <p class="leading-relaxed text-slate-700">
      이번엔 동전을 <b>두 번</b> 던져 "첫 번째도 앞면 <b>그리고</b> 두 번째도 앞면"일 확률.
      첫 번째 결과가 두 번째에 아무 영향을 주지 않을 때(이걸 <b>독립</b>이라 합니다),
      두 확률을 곱하면 됩니다:
    </p>
    <MathBlock expr="P(A \cap B) = P(A) \times P(B) \quad (A, B \text{ 가 독립일 때})" />

    <ConceptCard tone="note" title="새 용어·기호: ∩ (교집합, '그리고') / 독립">
      <ul class="list-disc space-y-2 pl-5 text-sm">
        <li>
          <MathBlock inline expr="A \cap B" /> &nbsp; <b>읽는 법</b>: "에이 교집합 비" 또는 "A 그리고 B" ·
          <b>뜻</b>: A 와 B 가 <b>둘 다</b> 일어나는 사건. 모자 모양(∩)이니 "모자 기호"로 기억하세요.
        </li>
        <li>
          <b>독립(independent)</b>: 한 사건의 결과가 다른 사건의 확률을 <b>바꾸지 않는 것</b>.
          동전 1번째와 2번째 던지기, 서로 다른 주사위끼리가 대표적. 예: 앞면 두 번 연속 =
          <MathBlock inline expr="\tfrac{1}{2} \times \tfrac{1}{2} = \tfrac{1}{4}" />.
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="tip" title="한 줄 정리: 또는 → +, 그리고 → ×">
      배반인 사건들의 "<b>또는</b>"은 <b>덧셈</b>, 독립인 사건들의 "<b>그리고</b>"는 <b>곱셈</b>.
      문장 속 "또는/그리고"만 찾아도 어떤 법칙을 쓸지 정해집니다.
    </ConceptCard>

    <!-- 8. 적어도 하나 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">8. 필살기: "적어도 하나"는 여사건으로</h2>
    <ReviewFlag id="ch3-s8" chapter="ch3" label="8. 적어도 하나 (여사건 트릭)" />
    <p class="leading-relaxed text-slate-700">
      "주사위를 2번 던져 <b>적어도 한 번</b> 6이 나올 확률"을 정면으로 구하려면
      경우가 복잡합니다(첫 번째만 6, 두 번째만 6, 둘 다 6…). 이럴 땐 뒤집으세요.
      "적어도 한 번"의 반대는 <b>"한 번도 안 나옴"</b> 딱 하나뿐이거든요:
    </p>
    <MathBlock expr="P(\text{적어도 한 번 } 6) = 1 - P(\text{한 번도 } 6 \text{ 없음}) = 1 - \left(\tfrac{5}{6}\right)^2 = \tfrac{11}{36} \approx 0.306" />

    <StepQuiz
      difficulty="medium"
      question="주사위를 2번 던져 '적어도 한 번 6'이 나올 확률을 단계별로 구하세요. (각 단계는 소수 셋째 자리 반올림)"
      :steps="[
        { lhs: '5 \\div 6', answer: 0.833, tolerance: 0.005 },
        { lhs: '(5/6)^2 = 0.833^2', answer: 0.694, tolerance: 0.005 },
        { lhs: '1 - 0.694', answer: 0.306, tolerance: 0.005 },
      ]"
      :hints="[
        '1단계: 한 번 던져서 6이 안 나올 확률부터.',
        '2단계: 두 번 모두 6이 안 나올 확률. 독립이니 곱셈법칙!',
        '3단계: 여사건 공식 1 − P(전부 아님).',
      ]"
      explanation="6이 안 나올 확률 5/6 을 두 번 곱해 25/36 ≈ 0.694, 이걸 1에서 빼면 11/36 ≈ 0.306. '적어도 하나' 문제는 늘 이 3단계 패턴입니다."
    />

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 AI는 확률로 말하는 기계</h2>
    <ReviewFlag id="ch3-ai" chapter="ch3" label="🤖 AI는 확률로 말하는 기계" />
    <p class="leading-relaxed text-slate-700">
      ChatGPT 같은 언어모델이 하는 일의 정체는 놀랄 만큼 단순합니다.
      <b>"다음 단어로 뭐가 올지, 모든 후보의 확률을 매기는 것"</b>. 예를 들어
      "오늘 날씨가 정말" 다음에는:
    </p>

    <div class="my-5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
      <table class="mx-auto text-center text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500">
            <th class="px-4 py-2 font-medium">다음 단어 후보</th>
            <th class="px-4 py-2 font-medium">확률</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-slate-100"><td class="py-1.5">좋다</td><td class="font-mono text-indigo-700">0.45</td></tr>
          <tr class="border-b border-slate-100"><td class="py-1.5">덥다</td><td class="font-mono text-indigo-700">0.30</td></tr>
          <tr class="border-b border-slate-100"><td class="py-1.5">춥다</td><td class="font-mono text-indigo-700">0.20</td></tr>
          <tr><td class="py-1.5">바나나</td><td class="font-mono text-indigo-700">0.05</td></tr>
        </tbody>
      </table>
      <p class="mt-2 text-center text-xs text-slate-500">전부 더하면 정확히 1. 표본공간의 확률 합 = 1, 방금 배운 그 성질입니다.</p>
    </div>

    <ConceptCard tone="ai" title="확률분포 → 소프트맥스 → 다음 단어">
      <ul class="list-disc space-y-2 pl-5">
        <li>언어모델의 출력 = 다음 단어 후보 전체에 대한 <b>확률분포</b> (5장에서 정식으로 배웁니다).</li>
        <li>모델 내부의 점수를 "합이 1인 확률"로 바꿔 주는 장치가 <b>소프트맥스(softmax)</b>입니다.</li>
        <li>확률이 높은 단어를 고르면 무난한 답, 가끔 낮은 단어도 뽑으면 창의적(?)인 답이 나와요. AI 의 말투 조절이 곧 확률 조절이에요.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="언어모델이 내놓는 '다음 단어' 후보들의 확률을 모두 더하면 1이다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 후보 전체가 표본공간이므로 확률의 합은 1이에요. 이걸 보장해 주는 장치가 소프트맥스입니다."
    />

    <!-- 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">9. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="확률의 기초: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="확률은 항상 0과 1 사이의 값이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 0 = 절대 안 일어남, 1 = 반드시 일어남. 1.2 나 −0.3 같은 확률은 없어요."
      />
      <Quiz
        difficulty="easy"
        question="표본공간(sample space)이란 무엇인가요?"
        :choices="[
          '시행에서 나올 수 있는 모든 결과의 모음',
          '관심 있는 결과만 모은 것',
          '시행을 반복한 횟수',
          '확률이 가장 큰 결과',
        ]"
        :answer="0"
        :hints="['주사위라면 {1,2,3,4,5,6} 전체.']"
        explanation="표본공간 = 나올 수 있는 모든 결과의 모음. 그중 관심 있는 부분이 '사건'입니다."
      />
      <Quiz
        difficulty="easy"
        question="동전 1개를 던져 앞면이 나올 확률은? (소수로 입력)"
        type="numeric"
        :answer="0.5"
        :hints="['경우의 수: 앞면 1가지 ÷ 전체 2가지.']"
        explanation="1/2 = 0.5. 앞·뒤가 똑같이 나올 법하다는 전제에서요."
      />
      <Quiz
        difficulty="easy"
        question="주사위에서 '6이 나옴'의 여사건 확률 P(6이 아님)은? (소수 셋째 자리 반올림)"
        type="numeric"
        :answer="0.833"
        :tolerance="0.005"
        :hints="['P(여사건) = 1 − P(사건).', '1 − 1/6 = 5/6.']"
        explanation="1 − 1/6 = 5/6 ≈ 0.833. '아닐 확률'은 1에서 빼면 끝!"
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="주사위 2개를 던질 때 합이 7이 되는 경우의 수는 몇 가지인가요?"
        type="numeric"
        :answer="6"
        :hints="['(1,6)부터 차례로 세어 보세요.', '(1,6)(2,5)(3,4)(4,3)(5,2)(6,1).']"
        explanation="6가지. 그래서 P(합=7) = 6/36 = 1/6 로 모든 합 중 가장 높습니다."
      />
      <Quiz
        difficulty="medium"
        question="P(A)=0.3, P(B)=0.2 이고 A, B 가 배반사건(동시에 일어날 수 없음)일 때, P(A 또는 B)는?"
        type="numeric"
        :answer="0.5"
        :tolerance="0.001"
        :hints="['배반사건의 「또는」은 덧셈법칙.']"
        explanation="0.3 + 0.2 = 0.5. 겹치는 부분이 없으니 그냥 더합니다."
      />
      <Quiz
        difficulty="medium"
        question="동전 2개를 던져 둘 다 앞면일 확률은? (소수로 입력)"
        type="numeric"
        :answer="0.25"
        :hints="['두 동전은 독립이니 「그리고」는 곱셈법칙.', '0.5 × 0.5.']"
        explanation="독립이므로 1/2 × 1/2 = 1/4 = 0.25."
      />
      <StepQuiz
        difficulty="medium"
        question="동전을 3번 던져 '적어도 한 번 앞면'이 나올 확률을 단계별로 구하세요."
        :steps="[
          { lhs: '(1/2)^3', answer: 0.125, tolerance: 0.001 },
          { lhs: '1 - 0.125', answer: 0.875, tolerance: 0.001 },
        ]"
        :hints="[
          '「적어도 한 번」의 반대 = 세 번 모두 뒷면.',
          '모두 뒷면일 확률을 1에서 빼세요.',
        ]"
        explanation="모두 뒷면 = (1/2)³ = 0.125. 따라서 적어도 한 번 앞면 = 1 − 0.125 = 0.875. 여사건 트릭이 여기서도 통합니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="'적어도 하나' 확률을 구할 때 여사건(1 − 전부 아님)을 쓰는 가장 큰 이유는?"
        :choices="[
          '반대쪽(한 번도 안 일어남)은 경우가 딱 하나라 계산이 훨씬 간단해서',
          '여사건을 쓰면 확률이 더 정확해져서',
          '덧셈법칙을 쓸 수 없어서',
          '확률이 1을 넘지 않게 하려고',
        ]"
        :answer="0"
        :hints="['「적어도 하나」를 정면으로 세면 경우가 여러 갈래로 갈라집니다.']"
        explanation="정면으로 세면 (하나만, 둘만, 셋 다…) 경우가 많지만, 반대쪽은 '전부 아님' 단 하나. 그래서 1에서 빼는 쪽이 압도적으로 쉽습니다."
      />
      <Quiz
        difficulty="hard"
        question="주사위 2개를 던져 합이 12일 확률은? (소수 셋째 자리 반올림)"
        type="numeric"
        :answer="0.028"
        :tolerance="0.005"
        :hints="['합이 12가 되는 경우는 (6,6) 하나뿐.', '1 ÷ 36 을 계산하세요.']"
        explanation="(6,6) 한 가지뿐이므로 1/36 ≈ 0.028. 합 7(6/36)과 비교하면 6배 차이입니다."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch03_probability_basics.ipynb</code> 에서 주사위 2개를 10만 번 굴려
      합의 분포가 이론값(삼각형)과 겹치는 것을 확인하고, "적어도 한 번 6" 확률 11/36 을
      시뮬레이션으로 검증해 볼 수 있어요.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch3')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">3장 완료. 경우의 수로 확률을 계산하는 힘이 생겼습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 확률이 <b>정보에 따라 변하는</b> 이야기로, 이 과정의 첫 핵심 챕터입니다.
      </p>
      <RouterLink
        to="/ch/ch4"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터: 조건부 확률과 베이즈 정리 →
      </RouterLink>
    </div>
  </article>
</template>
