<script setup lang="ts">
// Phase 9 · 가설검정과 p값 (A/B 테스트 — 우연인가 진짜인가)
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import ABTestSimulator from '@/components/ABTestSimulator.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch9')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 9</p>
    <h1 class="mb-4 text-3xl font-bold">가설검정과 p값 ⚖️</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      쇼핑몰의 구매 버튼 A 를 쓰던 1,000명 중 100명이 구매했고(10%), 새 디자인 B 를 본
      1,000명 중에는 120명이 구매했습니다(12%). B 가 2%p 높네요 — 그런데 이거,
      <b>B 가 진짜 더 좋은 걸까요, 아니면 그냥 운이 좋았던 걸까요?</b>
      "우연인지 진짜인지"를 숫자로 판별하는 도구가 이번 챕터의 <b>가설검정</b>입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>귀무가설·대립가설</b>로 "우연인가 진짜인가" 질문을 검정 문제로 바꾼다</li>
        <li><b>p값</b>이 무엇인지 정확히 이해하고, 유의수준 0.05 와 비교해 결론 내린다</li>
        <li>p값의 <b>3대 오해</b>를 피하고, A/B 테스트를 직접 시뮬레이션해 본다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 문제 제기 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 2%p 차이는 "증거"일까?</h2>
    <ReviewFlag id="ch9-s1" chapter="ch9" label="1. 2%p 차이는 증거일까?" />
    <p class="leading-relaxed text-slate-700">
      7장에서 배웠듯 표본에는 <b>우연한 출렁임</b>이 있습니다. 완전히 똑같은 버튼이라도
      1,000명씩 두 그룹으로 나누면 구매율이 몇 %p 쯤 차이 나는 게 오히려 자연스럽죠.
      그러니 "12% &gt; 10% 니까 B 승리!"라고 바로 외치면 안 됩니다.
      물어야 할 질문은 이것입니다:
    </p>
    <div class="my-4 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
      <table class="w-full text-center text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500">
            <th class="py-2 font-medium">그룹</th>
            <th class="py-2 font-medium">방문자</th>
            <th class="py-2 font-medium">구매</th>
            <th class="py-2 font-medium">구매율</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-slate-100">
            <td class="py-1.5 font-semibold text-slate-600">A (기존)</td>
            <td class="py-1.5">1,000명</td>
            <td class="py-1.5">100명</td>
            <td class="py-1.5 font-mono">10%</td>
          </tr>
          <tr>
            <td class="py-1.5 font-semibold text-indigo-700">B (새 디자인)</td>
            <td class="py-1.5">1,000명</td>
            <td class="py-1.5">120명</td>
            <td class="py-1.5 font-mono text-indigo-700">12%</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="leading-relaxed text-slate-700">
      <b>"만약 두 버튼이 사실 똑같다면, 우연만으로 이 정도 차이가 나올 확률은 얼마나 될까?"</b>
      — 이 확률이 아주 작다면 "우연이라기엔 너무 이상하다 → 진짜 차이가 있나 보다"라고
      결론 내릴 수 있습니다. 이게 가설검정의 전부예요.
    </p>

    <!-- 2. 가설검정의 논리 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 가설검정의 논리 — 일단 "차이 없다"고 치자</h2>
    <ReviewFlag id="ch9-s2" chapter="ch9" label="2. 가설검정의 논리" />
    <p class="leading-relaxed text-slate-700">
      가설검정은 재판과 비슷합니다. 재판은 <b>무죄 추정</b>에서 시작하죠 — 일단 무죄라고
      가정하고, 그 가정으로는 도저히 설명이 안 되는 강력한 증거가 나올 때만 유죄를 선고합니다.
      통계도 똑같이 <b>"차이가 없다"는 가정에서 시작</b>해서, 그 가정 아래에서는 우리 데이터가
      너무나 나오기 힘든 것일 때만 "차이가 있다"고 선언합니다.
    </p>

    <ConceptCard tone="note" title="새 용어 — 귀무가설 H₀ 와 대립가설 H₁">
      <ul class="list-disc space-y-2 pl-5 text-sm">
        <li>
          <b>귀무가설</b> <MathBlock inline expr="H_0" /> &nbsp;<b>읽는 법</b>: "에이치 제로(H-zero)" ·
          <b>뜻</b>: "차이가 없다 · 효과가 없다 · 우연이다"라는 <b>기본 가정</b>.
          (없앨(무·無) 것을 기대하며 세우는(귀·歸) 가설이라 귀무가설)
        </li>
        <li>
          <b>대립가설</b> <MathBlock inline expr="H_1" /> &nbsp;<b>읽는 법</b>: "에이치 원" ·
          <b>뜻</b>: "차이가 있다 · 효과가 있다"라는, 우리가 <b>보여주고 싶은 주장</b>.
        </li>
        <li>
          버튼 예시라면: <MathBlock inline expr="H_0" />: "A 와 B 의 구매율은 같다" vs
          <MathBlock inline expr="H_1" />: "A 와 B 의 구매율은 다르다".
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="가설검정은 '차이가 있다'를 일단 참이라고 가정하고 시작한다."
      type="truefalse"
      :answer="1"
      :hints="['재판의 출발점은 유죄 추정일까요, 무죄 추정일까요?']"
      explanation="거짓입니다. 반대로 '차이가 없다'(귀무가설)를 일단 참이라 가정하고, 그 가정이 데이터와 얼마나 안 맞는지를 봅니다."
    />

    <!-- 3. p값 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. p값 — "우연이라기엔 얼마나 드문 일인가"</h2>
    <ReviewFlag id="ch9-s3" chapter="ch9" label="3. p값이란" />
    <p class="leading-relaxed text-slate-700">
      버튼보다 더 간단한 동전으로 감을 잡아봅시다. 어떤 동전을 100번 던졌더니 앞면이
      <b>60번</b> 나왔습니다. "이 동전, 치우친 거 아니야?"라는 의심이 들죠.
      귀무가설 <MathBlock inline expr="H_0" /> 은 "공정한 동전이다(앞면 확률 0.5)"입니다.
      공정한 동전을 100번 던지는 실험을 컴퓨터로 <b>10만 번</b> 반복해 보면
      (직접 해보는 코드가 짝 노트북에 있어요), 60번 이상 <b>또는</b> 40번 이하로
      치우치는 경우가 약 <b>5,700번 — 즉 약 5.7%</b> 나옵니다.
    </p>
    <MathBlock expr="p \approx 0.057" />

    <ConceptCard tone="note" title="새 용어 — p값 (p-value)">
      <b>p값</b> = <b>귀무가설이 참이라고 가정했을 때</b>, 실제로 관측된 것만큼
      (또는 그보다 더 극단적인) 결과가 나올 확률.
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li>p값이 <b>작다</b> = "우연으로는 설명하기 힘든 데이터" → 귀무가설이 의심스럽다.</li>
        <li>p값이 <b>크다</b> = "우연으로도 얼마든지 나올 데이터" → 귀무가설을 버릴 이유가 없다.</li>
        <li>동전 예시: p ≈ 0.057 — 공정한 동전이라도 100번 중 약 6번꼴로는 이만큼 치우칩니다.</li>
      </ul>
    </ConceptCard>

    <StepQuiz
      difficulty="medium"
      question="위 동전 실험의 숫자를 직접 확인해 봅시다. 관측된 앞면 비율과, 시뮬레이션으로 구한 p값을 계산하세요."
      :steps="[
        { lhs: '\\text{관측 비율} = 60 \\div 100', answer: 0.6, tolerance: 0.0001 },
        { lhs: 'p\\text{값} = 5700 \\div 100000', answer: 0.057, tolerance: 0.0001 },
      ]"
      :hints="['관측 비율은 앞면 횟수 ÷ 전체 횟수.', 'p값은 (극단적 결과가 나온 시뮬레이션 횟수) ÷ (전체 시뮬레이션 횟수).']"
      explanation="p ≈ 0.057 — 공정한 동전에서도 100번 중 5.7번꼴로 나오는 치우침이라는 뜻입니다. 이걸 '드물다'고 볼지가 다음 절의 유의수준 이야기예요."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="동전 실험의 p ≈ 0.057 을 가장 올바르게 해석한 것은?"
      :choices="[
        '공정한 동전이라도 이 정도(또는 더 심한) 치우침은 약 5.7% 확률로 나온다',
        '이 동전이 치우쳤을 확률이 5.7%다',
        '이 동전이 공정할 확률이 5.7%다',
        '앞면이 나올 확률이 5.7%다',
      ]"
      :answer="0"
      :hints="['p값의 가정은 항상 「귀무가설이 참이라면」입니다.', '「동전이 치우쳤을 확률」은 p값이 알려주지 않아요.']"
      explanation="p값은 '귀무가설(공정한 동전)이 참일 때 이런 데이터가 나올 확률'입니다. '동전이 공정할 확률'이 아니에요 — 방향이 반대입니다."
    />

    <!-- 4. 유의수준 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 유의수준 — 어디까지를 "드물다"고 볼까</h2>
    <ReviewFlag id="ch9-s4" chapter="ch9" label="4. 유의수준 0.05" />
    <p class="leading-relaxed text-slate-700">
      p값이 얼마나 작아야 귀무가설을 버릴까요? 그 기준선이 <b>유의수준</b>입니다.
      과학·비즈니스에서는 관례적으로 <b>0.05 (5%)</b> 를 많이 씁니다:
      p &lt; 0.05 면 "<b>통계적으로 유의하다</b>"며 귀무가설을 <b>기각</b>(reject)하고,
      p ≥ 0.05 면 기각하지 못합니다.
    </p>
    <ConceptCard tone="note" title="새 용어 — 유의수준 α 와 기각">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>
          <b>유의수준</b> <MathBlock inline expr="\alpha" /> &nbsp;<b>읽는 법</b>: "알파" ·
          <b>뜻</b>: "이보다 p값이 작으면 우연이 아니라고 판정하겠다"는 <b>미리 정한 기준선</b>. 보통 0.05.
        </li>
        <li><b>기각</b>: 귀무가설을 버리는 것. "차이가 유의하다"는 선언.</li>
        <li>
          뒤집어 말하면 <MathBlock inline expr="\alpha" /> = 0.05 는 <b>참인 귀무가설을 우연 탓에
          잘못 기각하는 실수</b>를 100번 중 5번까지는 감수하겠다는 약속이기도 합니다.
        </li>
        <li>
          동전 예시: p ≈ 0.057 은 0.05 보다 <b>아슬아슬하게 크므로</b> 기각하지 못합니다 —
          "치우쳤다고 말하기엔 증거가 조금 부족하다".
        </li>
      </ul>
    </ConceptCard>
    <ConceptCard tone="tip" title="0.05 는 자연법칙이 아니라 관례">
      0.05 는 실험 전에 미리 약속해 두는 <b>합의된 기준</b>일 뿐, 우주의 상수가 아닙니다.
      신약 승인처럼 실수 비용이 크면 0.01 을 쓰기도 하고, 탐색 단계라면 0.1 을 쓰기도 해요.
      중요한 건 <b>데이터를 보기 전에 기준을 정한다</b>는 원칙입니다.
    </ConceptCard>

    <!-- 5. 시뮬레이터 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. A/B 테스트 직접 돌려보기</h2>
    <ReviewFlag id="ch9-s5" chapter="ch9" label="5. A/B 테스트 시뮬레이터" />
    <p class="leading-relaxed text-slate-700">
      이제 버튼 문제로 돌아옵시다. 아래 시뮬레이터는 <b>"두 버튼이 사실 똑같다"는 세상</b>(귀무가설)
      을 통째로 시뮬레이션합니다. 파란 히스토그램이 우연만으로 생기는 차이들의 분포이고,
      빨간 선이 우리가 관측한 차이예요. 빨간 선보다 극단적인 영역의 비율이 곧 <b>p값</b>입니다.
    </p>
    <p class="leading-relaxed text-slate-700">
      꼭 해볼 것: ① 기본 설정(10% vs 12%, n=1,000)으로 돌려 p값 확인 →
      ② 전환율은 그대로 두고 <b>n 을 5,000 으로</b> 올려 다시 돌리기.
      같은 2%p 차이가 어떻게 달라지나요?
    </p>

    <ABTestSimulator />

    <!-- 6. 계산으로 확인 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">6. 같은 차이, 다른 결론 — 표본 크기의 힘</h2>
    <ReviewFlag id="ch9-s6" chapter="ch9" label="6. 표본 크기의 힘" />
    <p class="leading-relaxed text-slate-700">
      10% vs 12%, 그룹당 1,000명일 때 p값은 약 <b>0.15</b> 입니다 — 두 버튼이 똑같아도
      100번 중 15번은 이만한 차이가 우연히 나온다는 뜻이라, 증거 부족.
      그런데 <b>같은 10% vs 12%</b> 라도 그룹당 5,000명이면 p ≈ <b>0.001</b> — 강력한 증거가 됩니다.
      7장에서 배운 것처럼 표본이 커지면 우연한 출렁임(표준오차)이 <MathBlock inline expr="\sqrt{n}" /> 에
      비례해 줄어들기 때문에, 같은 크기의 차이도 "우연으로 설명하기 힘든 차이"가 되는 거예요.
    </p>

    <StepQuiz
      difficulty="medium"
      question="A(1,000명 중 100명 구매) vs B(1,000명 중 120명 구매). 검정의 재료가 되는 숫자들을 단계별로 구하세요. (합동 비율 = 두 그룹을 하나로 합쳐서 계산한 전체 구매율)"
      :steps="[
        { lhs: '\\text{전체 구매 수} = 100 + 120', answer: 220 },
        { lhs: '\\text{전체 방문자 수} = 1000 + 1000', answer: 2000 },
        { lhs: '\\text{합동 비율} = 220 \\div 2000', answer: 0.11, tolerance: 0.0001 },
        { lhs: '\\text{관측 차이} = 0.12 - 0.10', answer: 0.02, tolerance: 0.0001 },
      ]"
      :hints="[
        '귀무가설 세상에서는 두 그룹이 같은 비율을 공유합니다 — 그래서 둘을 합쳐 하나의 비율을 만듭니다.',
        '합동 비율 = (두 그룹 구매 합계) ÷ (두 그룹 인원 합계).',
      ]"
      explanation="'차이가 없다'는 세상에서는 모두가 같은 구매율 0.11 을 공유합니다. 시뮬레이터는 이 0.11 세상에서 0.02 차이가 얼마나 흔한지(p ≈ 0.15)를 세어본 것이에요."
    />

    <!-- 7. 3대 오해 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">7. p값의 3대 오해 — 여기서 다들 틀립니다</h2>
    <ReviewFlag id="ch9-s7" chapter="ch9" label="7. p값의 3대 오해" />

    <ConceptCard tone="warn" title="오해 ① p값은 '귀무가설이 참일 확률'이 아니다">
      p값은 <b>P(이런 데이터 | H₀ 참)</b> 이지, <b>P(H₀ 참 | 이런 데이터)</b> 가 아닙니다.
      4장에서 봤죠 — <MathBlock inline expr="P(A|B) \ne P(B|A)" />. "검사가 양성일 때 병일 확률"과
      "병일 때 양성일 확률"이 다르듯, p=0.03 은 "귀무가설이 참일 확률 3%"가 <b>아닙니다</b>.
    </ConceptCard>

    <ConceptCard tone="warn" title="오해 ② p ≥ 0.05 는 '차이 없음의 증명'이 아니다">
      기각하지 못했다는 건 <b>증거가 부족하다</b>는 뜻이지, "차이가 없다"가 증명됐다는 뜻이
      아닙니다. 무죄 판결이 "결백 증명"이 아니라 "유죄 증거 불충분"인 것과 같아요.
      표본이 작으면 진짜 차이가 있어도 잡아내지 못하는 일이 흔합니다.
    </ConceptCard>

    <ConceptCard tone="warn" title="오해 ③ 유의함 ≠ 중요함">
      표본이 아주 크면 <b>하찮은 차이도 유의해집니다</b>. 사용자 1억 명이면 구매율 0.01%p
      차이도 p &lt; 0.001 이 나올 수 있어요. "통계적으로 유의하다"는 "우연이 아니다"일 뿐,
      "비즈니스적으로 의미 있다"와는 별개 판단입니다. 차이의 <b>크기</b>도 항상 같이 보세요.
    </ConceptCard>

    <!-- 8. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 AI 모델 비교도 결국 가설검정</h2>
    <ReviewFlag id="ch9-ai" chapter="ch9" label="🤖 AI 모델 비교도 가설검정" />
    <p class="leading-relaxed text-slate-700">
      "새 모델이 벤치마크에서 1%p 더 높다"는 발표를 봤다면 이제 이렇게 물을 수 있어야 합니다 —
      <b>"그 차이, 문제 몇 개짜리 벤치마크에서 나온 건가요?"</b> 문제가 500개뿐이라면 1%p 는
      고작 5문제 차이라 우연일 가능성이 큽니다(8장의 오차범위!). 실제로 AI 연구·서비스 현장에서는:
    </p>
    <ConceptCard tone="ai" title="가설검정이 AI 현장에서 쓰이는 곳">
      <ul class="list-disc space-y-2 pl-5">
        <li><b>모델 비교</b>: 모델 A vs B 의 벤치마크 점수 차이가 유의한지 검정 — 유의하지 않다면 "동급".</li>
        <li><b>배포 결정</b>: 새 추천 모델·새 프롬프트를 일부 사용자에게만 적용하는 <b>A/B 테스트</b>로
          클릭률·구매율 차이를 검정한 뒤 전체 배포.</li>
        <li><b>실험 문화</b>: "그럴듯해 보인다"가 아니라 "p값과 효과 크기를 확인했다"가 의사결정의 언어.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="새 모델이 벤치마크 점수가 조금이라도 높으면, 언제나 더 좋은 모델이라고 결론 내릴 수 있다."
      type="truefalse"
      :answer="1"
      :hints="['벤치마크 점수도 「표본」에서 잰 추정치입니다.']"
      explanation="거짓입니다. 점수 차이가 문제 표본의 우연한 출렁임 범위 안일 수 있어요 — 차이가 유의한지(그리고 실질적으로 의미 있는 크기인지) 확인해야 합니다."
    />

    <!-- 9. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">8. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="가설검정과 p값 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="귀무가설 H₀ 은 보통 '차이가 없다 · 효과가 없다'는 주장이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 검정은 '차이 없음'을 기본 가정으로 놓고 시작합니다 — 재판의 무죄 추정처럼요."
      />
      <Quiz
        difficulty="easy"
        question="p값의 올바른 뜻은?"
        :choices="[
          '귀무가설이 참일 확률',
          '귀무가설이 참이라고 가정할 때, 관측된 것만큼(또는 더 극단적인) 결과가 나올 확률',
          '실험이 성공할 확률',
          '대립가설이 참일 확률',
        ]"
        :answer="1"
        :hints="['p값의 조건(가정)은 항상 「귀무가설이 참이라면」입니다.']"
        explanation="p값 = P(이런 극단적 데이터 | H₀ 참). 가설이 참일 확률이 아니라, 가설을 참이라 칠 때 데이터가 나올 확률입니다."
      />
      <Quiz
        difficulty="easy"
        question="가장 관례적으로 널리 쓰이는 유의수준은? (소수로 입력)"
        type="numeric"
        :answer="0.05"
        :hints="['5%를 소수로 쓰면?']"
        explanation="0.05 (5%)가 가장 흔한 관례적 기준입니다. 상황에 따라 0.01, 0.1 을 쓰기도 해요."
      />
      <Quiz
        difficulty="easy"
        question="p값이 0.03 이고 유의수준이 0.05 라면, 귀무가설을 기각한다."
        type="truefalse"
        :answer="0"
        :hints="['p값이 유의수준보다 작으면?']"
        explanation="참입니다. p = 0.03 < 0.05 이므로 '우연이라기엔 드문 일' → 귀무가설 기각, 차이가 유의합니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="동전 100번 중 앞면 60번, p ≈ 0.057. 유의수준 0.05 에서 올바른 결론은?"
        :choices="[
          '동전이 공정하다는 것이 증명됐다',
          '동전이 치우쳤다고 결론 내린다',
          '기각하지 못한다 — 치우쳤다는 증거가 아직 부족하다',
          '실험 자체가 잘못됐다',
        ]"
        :answer="2"
        :hints="['0.057 과 0.05 중 어느 쪽이 큰가요?', '기각 실패 = 증거 부족이지, 공정함의 증명이 아닙니다.']"
        explanation="p = 0.057 ≥ 0.05 이므로 기각하지 못합니다. 다만 이는 '공정함의 증명'이 아니라 '증거 부족'이에요 — 더 던져보면 결론이 날 수 있습니다."
      />
      <Quiz
        difficulty="medium"
        question="p값이 0.4 로 나오면 '두 그룹에 차이가 없다'는 것이 증명된 것이다."
        type="truefalse"
        :answer="1"
        :hints="['무죄 판결 = 결백 증명일까요?']"
        explanation="거짓입니다. 기각 실패는 '차이 없음의 증명'이 아니라 '차이가 있다는 증거 부족'입니다. 표본이 작으면 진짜 차이도 못 잡아냅니다."
      />
      <StepQuiz
        difficulty="medium"
        question="C(2,000명 중 160명 구매) vs D(2,000명 중 200명 구매)를 검정하려 합니다. 재료 숫자들을 구하세요."
        :steps="[
          { lhs: '\\text{C 구매율} = 160 \\div 2000', answer: 0.08, tolerance: 0.0001 },
          { lhs: '\\text{D 구매율} = 200 \\div 2000', answer: 0.1, tolerance: 0.0001 },
          { lhs: '\\text{합동 비율} = 360 \\div 4000', answer: 0.09, tolerance: 0.0001 },
          { lhs: '\\text{관측 차이} = 0.10 - 0.08', answer: 0.02, tolerance: 0.0001 },
        ]"
        :hints="['합동 비율 = 두 그룹 구매 합계 ÷ 두 그룹 인원 합계.', '(160+200) ÷ (2000+2000).']"
        explanation="귀무가설 세상에서는 모두가 구매율 0.09 를 공유합니다. 이 세상에서 0.02 차이가 얼마나 드문지를 재는 것이 p값입니다."
      />
      <Quiz
        difficulty="medium"
        question="전환율 차이가 그대로일 때, 그룹당 표본 수를 크게 늘리면 p값은 보통 어떻게 되나?"
        :choices="['커진다', '작아진다', '변하지 않는다', '예측할 수 없다']"
        :answer="1"
        :hints="['표본이 커지면 우연한 출렁임(표준오차)은 줄어듭니다.', '출렁임이 줄면 같은 차이도 더 「드문 일」이 됩니다.']"
        explanation="작아집니다. 표준오차가 √n 에 비례해 줄어서, 같은 크기의 차이도 우연으로 설명하기 어려워지기 때문이에요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="사용자 1억 명 A/B 테스트에서 구매율 차이 0.01%p, p = 0.001 이 나왔다. 가장 올바른 해석은?"
        :choices="[
          'p가 매우 작으므로 반드시 새 버전을 배포해야 한다',
          '차이는 우연이 아니지만, 0.01%p 가 비즈니스적으로 의미 있는 크기인지는 따로 판단해야 한다',
          'p가 작으므로 차이도 클 것이다',
          '표본이 너무 커서 검정 자체가 무효다',
        ]"
        :answer="1"
        :hints="['유의함(우연 아님)과 중요함(의미 있는 크기)은 별개입니다.']"
        explanation="유의함 ≠ 중요함. 표본이 아주 크면 하찮은 차이도 유의해집니다. '우연이 아님'이 확인됐어도, 효과의 크기가 실질적 가치가 있는지는 별도의 판단이에요."
      />
      <Quiz
        difficulty="hard"
        question="유의수준 0.05 로 검정하면, 귀무가설이 참이어도 100번의 검정 중 약 5번은 잘못 기각하게 된다."
        type="truefalse"
        :answer="0"
        :hints="['유의수준의 뜻을 다시 떠올려 보세요 — 「우연히 p < 0.05 가 나올 확률」은?']"
        explanation="참입니다. 유의수준 0.05 는 '귀무가설이 참인데도 우연히 기각해 버릴 확률'을 5%까지 허용한다는 약속입니다. 그래서 검정을 수십 번 반복하면 가짜 유의가 섞여 나와요."
      />
    </QuizSet>

    <!-- 노트북 안내 -->
    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch09_hypothesis_test.ipynb</code> 에서 공정한 동전 10만 번 시뮬레이션으로
      p ≈ 0.057 을 직접 재현하고, <code>scipy.stats.binomtest</code> 로 검산합니다.
      A/B 테스트도 n=1,000 과 n=5,000 으로 돌려 표본 크기의 힘을 확인해요.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch9')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 9 완료. "우연인가 진짜인가"를 숫자로 판별할 수 있게 됐습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        마지막 챕터는 데이터에서 관계를 찾아 예측하는 <b>상관관계와 회귀</b> — 그리고 그것이 곧 머신러닝입니다.
      </p>
      <RouterLink
        to="/ch/ch10"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 상관관계와 회귀 (머신러닝의 시작) →
      </RouterLink>
    </div>
  </article>
</template>
