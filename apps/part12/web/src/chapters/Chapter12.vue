<script setup lang="ts">
// 12장 — 🎯 캡스톤: 사내 AI 도입, 모형으로 미리 돌려 보기. Bass 확산 모형(+ 이탈)을 저량-유량도로 읽고
// 홍보(p)·입소문(q)·이탈 방지(L) 다이얼이 각각 무엇을 바꾸는지 시뮬레이션으로 판정한 뒤 도입 전략 판정서를 쓴다.
// 다시 쓰는 수학: 전 12부(2장 저량·유량, 3장 강화, 7장 S자·시그모이드, 8장 평형) + 2부 7장.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import AdoptionLab from '@/components/AdoptionLab.vue'
import DiagramSteps from '@/components/DiagramSteps.vue'
import DiagramLegend from '@/components/DiagramLegend.vue'
import type { SfdAux, SfdFlow, SfdLink, SfdStep, SfdStock } from '@/data/plot'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch12')
}

// 1절 그림 읽기 — 캡스톤 저량-유량도를 한 단계씩(실험실 AdoptionLab 의 좁은 화면 배치와 같은 좌표, 처음 시각의 값)
const P0: SfdStock = { id: 'P', label: '잠재 사용자', x: 62, y: 95, w: 104, h: 58, value: '300명', level: 1 }
const A0: SfdStock = { id: 'A', label: '사용자', x: 258, y: 95, w: 104, h: 58, value: '0명', level: 0 }
const ADOPT_FLOW: SfdFlow = { id: 'in', label: '도입', path: [[115, 95], [205, 95]] }
const CHURN_FLOW: SfdFlow = { id: 'out', label: '이탈', path: [[258, 125], [258, 182], [62, 182], [62, 125]], valve: [160, 182] }
const DIALS: SfdAux[] = [
  { id: 'p', label: '홍보·교육 p', x: 112, y: 30 },
  { id: 'q', label: '입소문 q', x: 208, y: 30 },
  { id: 'L', label: '사용 기간 L', x: 276, y: 222 },
]
const L_P: SfdLink = { from: [118, 38], to: [154, 79], bend: 0.1, sign: '+' }
const L_Q: SfdLink = { from: [202, 38], to: [166, 79], bend: -0.1, sign: '+' }
const L_P_IN: SfdLink = { from: [92, 66], to: [148, 84], bend: 0.35, sign: '+' }
const L_A_IN: SfdLink = { from: [228, 66], to: [172, 84], bend: -0.35, sign: '+' }
const L_A_OUT: SfdLink = { from: [215, 125], to: [166, 166], bend: 0.2, sign: '+' }
const L_L: SfdLink = { from: [270, 214], to: [174, 186], bend: 0.15, sign: '−' }
const ALL_LINKS = [L_P, L_Q, L_P_IN, L_A_IN, L_A_OUT, L_L]
const only = (hit: SfdLink) => ALL_LINKS.map((l) => (l === hit ? { ...l, mark: true } : l))
const adoptSteps: SfdStep[] = [
  { title: '상자 둘', stocks: [{ ...P0, mark: true }, { ...A0, mark: true }] },
  { title: '파이프 둘', stocks: [P0, A0], flows: [{ ...ADOPT_FLOW, mark: true }, { ...CHURN_FLOW, mark: true }] },
  { title: '다이얼 셋', stocks: [P0, A0], flows: [ADOPT_FLOW, CHURN_FLOW], aux: DIALS.map((a) => ({ ...a, mark: true })) },
  { title: '가는 화살표', stocks: [P0, A0], flows: [ADOPT_FLOW, CHURN_FLOW], aux: DIALS, links: ALL_LINKS.map((l) => ({ ...l, mark: true })) },
  { title: '고리 ① 입소문', stocks: [P0, { ...A0, mark: true }], flows: [{ ...ADOPT_FLOW, mark: true }, CHURN_FLOW], aux: DIALS, links: only(L_A_IN) },
  { title: '고리 ② 포화', stocks: [{ ...P0, mark: true }, A0], flows: [{ ...ADOPT_FLOW, mark: true }, CHURN_FLOW], aux: DIALS, links: only(L_P_IN) },
  { title: '고리 ③ 이탈', stocks: [P0, { ...A0, mark: true }], flows: [ADOPT_FLOW, { ...CHURN_FLOW, mark: true }], aux: DIALS, links: only(L_A_OUT) },
]
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">12장 · 약 45분 · 🎯 캡스톤</p>
    <h1 class="mb-4 text-3xl font-bold">🎯 캡스톤 — 사내 AI 도입, 모형으로 미리 돌려 보기</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      마지막 장입니다. 지금까지 모은 부품으로 실제 질문에 답해 봅시다. <b>"우리 회사에 AI 도구를 들이면 언제 절반이 쓰고, 결국 몇 명이 쓰며,
      어디에 투자해야 하나?"</b> 신제품이 퍼지는 과정을 다루는 표준 모형인 Bass 확산 모형을 저량-유량도로 옮기고, 세 개의 다이얼을 돌려
      전략을 판정한 뒤 판정서를 씁니다. 숫자는 모두 가상이지만 구조와 결론의 방향은 실제 도입 계획에 그대로 쓸 수 있어요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"홍보는 시작을, 입소문은 속도와 수준을, 이탈 방지는 최종 수준을 정한다."</b> 이 판정을 시뮬레이션 숫자로 직접 확인하고,
      한정된 예산을 어디에 쓸지 근거를 갖춘 도입 전략 판정서를 완성합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대와 모형: 잠재 사용자에서 사용자로</h2>
    <ReviewFlag id="ch12-s1" chapter="ch12" label="1. 무대와 모형: 잠재 사용자에서 사용자로" />
    <p class="leading-relaxed text-slate-700">
      직원 300명, 우리 회사와 비슷한 규모의 가상 회사입니다. 저량은 둘, <b>잠재 사용자</b>(아직 안 쓰는 직원)와 <b>사용자</b>예요. 잠재 사용자가 사용자가 되는
      이유는 두 가지입니다. 회사의 홍보·교육을 보고 스스로 시작하거나(바깥에서 오는 동기), 이미 쓰는 동료를 보고 따라 하거나(입소문).
      그리고 쓰던 사람 중 일부는 그만두고 다시 잠재 사용자로 돌아갑니다.
    </p>
    <MathBlock expr="\text{도입} = \Big(p + q\,\frac{A}{M}\Big)\,(M - A), \qquad \text{이탈} = \frac{A}{L}, \qquad \frac{dA}{dt} = \text{도입} - \text{이탈}" />
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      <b>A</b>는 사용자 수, <b>M</b>은 전체 직원(잠재시장규모), <b>M − A</b>는 잠재 사용자입니다. <b>p</b>(혁신계수)는 잠재 사용자 한 명이 한 달에
      홍보·교육만 보고 시작할 확률, <b>q</b>(모방계수)는 입소문의 세기로, 동료 중 사용자 비율 A/M을 곱해 그만큼 시작할 확률이 커져요. q·A/M 덕분에
      3장의 강화 루프가, (M − A) 덕분에 7장의 포화하는 균형 루프가 생깁니다. <b>L</b>은 평균 사용 기간이라 이탈은 매달 사용자의 1/L씩(4장의 지수 감쇠)이고, 이 1/L을 월 <b>이탈률</b>(churn rate)이라고 합니다.
    </p>

    <p class="mt-3 leading-relaxed text-slate-700">
      실험실에 들어가기 전에 이 모형의 저량-유량도를 한 단계씩 그려 읽어 봅시다. 실험실 안의 그림과 같은 구조이고,
      기호는 1장 2절에서 익힌 그대로예요.
    </p>

    <DiagramSteps kind="sfd" title="한 단계씩 그려 보기: 사내 AI 도입 모형" :steps="adoptSteps" :width="320" :height="250">
      <template #s1>
        캡스톤의 저량은 둘입니다. 아직 안 쓰는 직원인 <b>잠재 사용자</b>와 쓰고 있는 <b>사용자</b>예요. 1장 그림에서 구름이던 자리에
        이번엔 상자가 들어갔습니다. 직원 300명은 두 상자를 오갈 뿐 바깥으로 나가지 않으니까요(구름이 없는 닫힌 모형).
        처음엔 300명 모두 잠재 사용자이고, 두 상자의 합은 언제나 300명입니다.
      </template>
      <template #s2>
        파이프도 둘입니다. <b>도입</b>은 잠재 사용자 상자에서 빠져나가 사용자 상자로 들어가는 흐름이에요. 파이프 하나가 한쪽 상자에는
        유출, 다른 쪽 상자에는 유입입니다. <b>이탈</b>은 거꾸로 사용자 상자에서 나와 잠재 사용자로 돌아가는 흐름이에요.
        그만둔 사람도 언젠가 다시 시작할 수 있다고 본 것입니다.
      </template>
      <template #s3>
        작은 원 세 개가 실험실의 다이얼입니다. <b>홍보·교육 p</b>(혁신계수)는 잠재 사용자 한 명이 한 달에 홍보·교육만 보고 시작할 확률,
        <b>입소문 q</b>(모방계수)는 쓰는 동료를 보고 따라 시작하는 세기, <b>사용 기간 L</b>은 평균 몇 달 쓰고 그만두는지예요.
        쌓이지 않고 우리가 정해 두는 값이라 작은 원으로 그립니다.
      </template>
      <template #s4>
        가는 화살표는 '무엇을 보고 밸브를 정하나'입니다. 도입 밸브에는 네 개가 들어와요. 다이얼 p와 q, <b>사용자</b>(쓰는 동료가
        많을수록 입소문이 크다), <b>잠재 사용자</b>(시작할 사람이 많이 남아 있을수록 도입이 많다). 이탈 밸브에는 둘이 들어옵니다.
        <b>사용자</b>(쓰는 사람이 많을수록 그만두는 사람도 많다)와 <b>L</b>(오래 쓸수록 한 달에 그만두는 사람은 적다, 그래서 −)이에요.
      </template>
      <template #s5>
        이제 고리를 찾아봅시다. 노란 길을 따라가면 사용자 → (보고) → 도입 → (쌓여서) → 사용자. 사용자가 늘면 입소문 도입이 늘어
        사용자가 더 늘어요. 처음 변화를 키우니 <b>강화 루프(R), 입소문</b>입니다. 3장의 눈덩이 그대로예요.
      </template>
      <template #s6>
        두 번째 고리: 잠재 사용자 → (보고) → 도입 → (빠져나가서) → 잠재 사용자. 잠재 사용자가 많으면 도입이 많고, 그만큼 잠재 사용자
        상자에서 더 많이 빠져나가 잠재 사용자가 줄어요. 처음 상태(많다)를 거스르니 <b>균형 루프(B), 포화</b>입니다. 시작할 사람이
        바닥나면 도입이 멈추는 고리로, 7장의 '남은 여지'가 바로 이 상자예요. 상자를 <b>빠져나가는</b> 파이프는 인과지도로 옮기면
        −(많이 빠질수록 상자는 원래보다 작아진다)가 된다는 것도 눈여겨보세요.
      </template>
      <template #s7>
        세 번째 고리: 사용자 → (보고) → 이탈 → (빠져나가서) → 사용자. 사용자가 늘면 그만두는 사람도 늘어 사용자가 덜 늘어요.
        이것도 <b>균형 루프(B), 이탈</b>입니다. 4장의 '매달 사용자의 일정 비율이 그만둔다'는 지수 감쇠 고리예요. 이 그림에는 R 하나와
        B 둘이 돌고, 어느 고리가 이기느냐가 S자의 모양과 최종 수준을 정합니다. 실험실에서 다이얼을 돌리는 것은 결국 이 고리들의
        세기를 바꾸는 일이에요.
      </template>
    </DiagramSteps>

    <p class="leading-relaxed text-slate-700">그림의 부분마다 식이 하나씩 붙습니다(5장 2절의 규칙).</p>
    <div class="my-4 overflow-x-auto">
      <table class="w-full break-keep text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3 font-medium">그림의 부분</th>
            <th class="py-2 font-medium">식</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">상자 '사용자'(들어오는 도입, 나가는 이탈)</td><td class="py-2">dA/dt = 도입 − 이탈</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">상자 '잠재 사용자'(들어오는 이탈, 나가는 도입)</td><td class="py-2">d(M − A)/dt = 이탈 − 도입</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">밸브 '도입'(p·q·사용자·잠재 사용자에서 화살표)</td><td class="py-2">도입 = (p + q·A/M)·(M − A)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">밸브 '이탈'(사용자·L에서 화살표)</td><td class="py-2">이탈 = A ÷ L</td></tr>
          <tr><td class="py-2 pr-3">작은 원 p·q·L</td><td class="py-2">다이얼 값(기본 p 0.01, q 0.4, 이탈 없음)</td></tr>
        </tbody>
      </table>
    </div>
    <p class="leading-relaxed text-slate-700">
      위의 식이 바로 이 표를 한 줄로 쓴 것이에요. 두 상자의 식을 더하면 0이라 두 상자의 합 M(300명)은 변하지 않습니다.
    </p>

    <DetailsCard title="🔍 그림 기호 다시 보기">
      <p class="text-sm">
        기호를 처음부터 차근차근 보려면 <RouterLink to="/ch/ch1#ch1-sfd" class="font-semibold text-indigo-700 underline">1장 2절(저량-유량도)</RouterLink>로 돌아가세요.
      </p>
      <p class="mt-3 text-sm font-semibold text-slate-700">저량-유량도</p>
      <DiagramLegend kind="sfd" />
    </DetailsCard>

    <AdoptionLab />

    <ConceptCard tone="tip" title="핵심 관찰: 세 다이얼은 서로 다른 것을 바꾼다">
      <b>기본</b>(p 0.01, q 0.4, 이탈 없음)이면 9.1개월에 직원의 절반이 쓰고, 도입 속도는 9.0개월에 월 31.5명으로 가장 빠릅니다.
      <b>홍보 집중</b>(p 0.03)은 절반 도달을 6.4개월로 2.8개월 당기지만, 이탈이 있을 때 최종 수준은 75.8% → 77.2%로 거의 그대로예요.
      <b>입소문 집중</b>(q 0.6)은 절반 도달을 6.8개월로 당기고, 이탈이 있을 때 최종 수준도 83.7%로 끌어올립니다.
      <b>이탈 방지</b>(사용 기간 10 → 20개월)는 시작 속도는 거의 그대로인데 최종 수준을 75.8% → 87.8%로 올려요.
      그리고 도입 속도의 정점(9.0개월)이 절반 도달(9.1개월)과 거의 같은 때라는 것, 7장의 변곡점 그대로입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="이탈이 있을 때(평균 사용 기간 10개월), 최종 활성 비율을 가장 크게 올리는 다이얼은?"
      :choices="['이탈 방지(사용 기간 20개월): 75.8% → 87.8%', '홍보 집중(p 0.03): 75.8% → 77.2%', '아무것도 바뀌지 않는다', '홍보와 입소문은 최종 수준을 떨어뜨린다']"
      :answer="0"
      :hints="['시나리오 비교표의 마지막 열(평형)을 보세요.']"
      explanation="평형은 '들어오는 흐름 = 나가는 흐름'인 곳(8장)이라, 나가는 흐름(이탈)을 줄이면 평형이 크게 올라갑니다. 홍보(p)는 시작을 당길 뿐 평형은 거의 그대로예요. 입소문(q)도 83.7%로 올리지만 이탈 방지만큼은 아닙니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 이름표와 계산</h2>
    <ReviewFlag id="ch12-s2" chapter="ch12" label="2. 이름표와 계산" />
    <ConceptCard tone="note" title="새 용어: Bass 확산 모형 / 혁신계수 / 모방계수 / 잠재시장규모 / 이탈률">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li><b>Bass 확산 모형</b> (Bass diffusion model). 뜻: 새 제품·기술이 '바깥 영향(혁신)'과 '사용자 사이의 영향(모방)'으로 퍼지는 과정을 그린 모형(Bass, 1969). 마케팅에서 신제품 수요 예측의 표준이에요. 정식 모형에는 이탈이 없고, 이 장의 이탈(L)은 사내 도구에 맞춘 확장입니다.</li>
        <li><b>혁신계수</b> (coefficient of innovation, p). 뜻: 남과 상관없이 바깥 정보(홍보·교육·공지)만 보고 시작하는 정도.</li>
        <li><b>모방계수</b> (coefficient of imitation, q). 뜻: 이미 쓰는 사람을 보고 따라 시작하는 정도. 입소문의 세기. 여러 연구를 모은 분석에서는 대개 q가 p보다 열 배쯤 큽니다(예: Sultan·Farley·Lehmann 1990의 평균 p ≈ 0.03, q ≈ 0.38, 연 단위). 확산은 보통 입소문이 끈다는 뜻이에요.</li>
        <li><b>잠재시장규모</b> (market potential, M). 뜻: 결국 쓸 수 있는 최대 인원. 사내 도입이라면 대상 직원 수로, 7장의 수용 한계 K에 해당합니다.</li>
        <li><b>이탈률</b> (churn rate). 뜻: 한 달에 사용자 중 그만두는 비율, 이 모형에서는 1/L. 평균 사용 기간 L = 10개월이면 월 이탈률 10%로, 4장의 '매달 10%가 이탈한다'와 같은 지수 감쇠예요.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습: 이론으로 정점 구하기</p>
    <StepQuiz
      difficulty="hard"
      question="이탈이 없는 Bass 모형에서 도입 속도의 정점 시각은 t* = ln(q/p) ÷ (p + q), 그때의 도입 속도는 M(p + q)² ÷ (4q)다. p = 0.01, q = 0.4, M = 300일 때 구하세요. (ln 40 ≈ 3.689)"
      :steps="[
        { lhs: 't^* = \\ln 40 \\div 0.41 = ?\\,\\text{개월}', answer: 9.0, tolerance: 0.05 },
        { lhs: '300 \\times 0.41^2 \\div 1.6 = ?\\,\\text{명/월}', answer: 31.5, tolerance: 0.05 },
      ]"
      explanation="t* = 3.689 ÷ 0.41 ≈ 9.0개월, 정점 속도 = 300 × 0.1681 ÷ 1.6 ≈ 31.5명/월. 실험의 9.0개월·월 31.5명과 같습니다(실험은 오일러법을 DT = 1/64로 잘게 썰어 이론값에 맞췄어요)."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 도입 전략 판정서</h2>
    <ReviewFlag id="ch12-s3" chapter="ch12" label="3. 도입 전략 판정서" />
    <p class="leading-relaxed text-slate-700">
      이제 실험 결과로 판정서를 씁니다. 세 질문에 답하면서 근거 숫자를 비교표에서 찾아 보세요.
    </p>

    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">📝 판정 ① 시작</p>
    <Quiz
      question="경영진이 '석 달 안에 눈에 띄는 사용자를 보여 달라'고 한다. 어느 다이얼이 가장 직접적인가?"
      :choices="['홍보·교육(p): 첫 사용자를 바깥에서 만들어 시작을 당긴다(절반 도달 9.1 → 6.4개월)', '이탈 방지(L)', '입소문(q)만 올린다', '아무것도 하지 않는다']"
      :answer="0"
      explanation="처음엔 사용자가 없어서 입소문(q·A/M)이 거의 0입니다. 시작을 만드는 건 바깥 영향 p예요. 그래서 초기에는 교육·홍보가 가장 직접적인 다이얼입니다."
    />
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">📝 판정 ② 지속</p>
    <Quiz
      question="도입 1년 뒤 '써 봤다가 그만둔 사람'이 늘고 있다. 최종 수준을 올리려면 무엇에 투자해야 하나?"
      :choices="['이탈 방지(L): 실제 업무에 맞는 활용 사례·지원으로 계속 쓰게 만든다(75.8% → 87.8%)', '홍보를 두 배로 늘린다', '대상 직원을 줄인다', '측정을 멈춘다']"
      :answer="0"
      explanation="최종 수준(평형)은 들어오는 흐름과 나가는 흐름이 같은 곳이라, 나가는 흐름을 줄이는 것이 가장 크게 올립니다. 홍보는 들어오는 쪽만 조금 더할 뿐이에요."
    />
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">📝 판정 ③ 한정된 예산</p>
    <Quiz
      question="이탈이 있는 현실(사용 기간 10개월)에서 예산을 한 곳에만 쓸 수 있다면, 속도와 최종 수준을 함께 올리는 다이얼은?"
      :choices="['입소문(q): 성공 사례 공유·팀 단위 도입으로 절반 도달을 당기고 평형도 83.7%로 올린다', '홍보(p): 평형은 77.2%로 거의 그대로', '아무 다이얼이나 같다', '이탈 방지만으로는 속도가 오른다']"
      :answer="0"
      explanation="q는 사용자가 늘수록 커지는 강화 루프의 세기라 속도(절반 8.1개월)와 평형(83.7%)을 함께 올립니다. 다만 '성공 사례 공유가 q를 얼마나 올리나'는 실제로 재 봐야 하는 값이에요. 모형은 어디를 재고 어디에 투자할지의 방향을 알려 줍니다."
    />

    <ConceptCard tone="goal" title="📋 도입 전략 판정서 (견본)">
      <ul class="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
        <li><b>초기(0~3개월)</b>: 교육·홍보(p)로 첫 사용자를 만든다. 사용자가 없을 땐 입소문이 돌 수 없다.</li>
        <li><b>성장기(3~12개월)</b>: 입소문(q)에 투자한다. 성공 사례 공유, 팀 단위 도입, 사내 커뮤니티. 속도와 최종 수준을 함께 올린다.</li>
        <li><b>정착기(12개월~)</b>: 이탈 방지(L)에 투자한다. 실제 업무 사례, 튜터 품질, 지원 창구. 최종 수준을 정한다.</li>
        <li><b>신호 읽기</b>: 월 신규 가입이 꺾이면(도입 속도 정점) 절반 근처에 왔다는 뜻이지 실패가 아니다. 이때부터 이탈 지표를 본다.</li>
        <li><b>측정할 것</b>: 월 신규 가입(유량), 활성 사용자(저량), 월 이탈(유량). 셋을 같은 대시보드에서 본다(워밍업).</li>
      </ul>
    </ConceptCard>

    <DetailsCard title="➕ 더 깊이: 이 모형을 믿어도 될까">
      "모든 모형은 틀렸지만, 어떤 모형은 쓸모 있다"(통계학자 조지 박스)는 말이 딱 맞는 자리입니다. 이 모형은 가상의 숫자를 썼고,
      그만둔 사람이 곧바로 다시 잠재 사용자가 된다고 단순하게 가정했으며, 부서 간 연결망이나 임계 질량(8장)은 넣지 않았어요.
      실제로 쓰려면 도입 초기 몇 달의 신규 가입 숫자로 p와 q를 추정하는데, 초기 숫자만으로는 추정이 크게 흔들리므로(7장: S자의 앞부분은
      지수와 구별이 어렵다) 추정치에 오차범위를 붙여야 합니다(10부 6장). 그래도 "어느 다이얼이 무엇을 바꾸는가", "신규 가입이 꺾이는 것은
      절반쯤 왔다는 신호다" 같은 구조적 결론은 숫자가 조금 달라도 유지돼요. 그게 시스템 다이내믹스 모형의 쓸모입니다.
    </DetailsCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 밖에서 말할 때: 용어 대조표</h2>
    <ReviewFlag id="ch12-s4" chapter="ch12" label="4. 밖에서 말할 때: 용어 대조표" />
    <p class="leading-relaxed text-slate-700">
      욕조·눈덩이·온도 조절기·샤워기는 이해를 돕기 위해 이 과정에서 쓴 <b>비유</b>였습니다. 동료와 이야기하거나 시스템 다이내믹스
      교재·도구(Vensim·Stella)를 볼 때는 실무 용어로 바꿔 말하세요. 캡스톤의 다이얼에도 마케팅·데이터 분석에서 쓰는 이름이 따로 있습니다.
    </p>
    <div class="my-4 overflow-x-auto">
      <table class="w-full text-sm break-keep">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3">이 과정에서 쓴 말</th>
            <th class="py-2">밖에서 쓰는 말</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">욕조의 물 높이</td><td class="py-2"><b>저량</b>(stock)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">수도꼭지·배수구</td><td class="py-2"><b>유입·유출</b>(inflow·outflow), 둘을 합쳐 <b>유량</b>(flow)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">눈덩이</td><td class="py-2"><b>강화 루프</b>(reinforcing loop, R) · 양의 피드백</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">온도 조절기</td><td class="py-2"><b>균형 루프</b>(balancing loop, B) · 음의 피드백 · 목표 추구</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">샤워기 온도 맞추기</td><td class="py-2"><b>지연</b>(delay)이 만드는 <b>과잉 교정</b>(overshoot)과 <b>출렁임</b>(oscillation)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">시간을 잘게 썰기</td><td class="py-2"><b>오일러법</b>(Euler's method)과 <b>시간 간격</b>(DT, time step)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">홍보·교육 다이얼 p</td><td class="py-2"><b>혁신계수</b>(coefficient of innovation)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">입소문 다이얼 q</td><td class="py-2"><b>모방계수</b>(coefficient of imitation)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">평균 사용 기간 L</td><td class="py-2">1/L = <b>이탈률</b>(churn rate)</td></tr>
          <tr><td class="py-2 pr-3">전체 직원 수 M</td><td class="py-2"><b>잠재시장규모</b>(market potential)</td></tr>
        </tbody>
      </table>
    </div>

    <ReviewFlag id="ch12-ai" chapter="ch12" label="🤖 AI 연결: 12부 전체가 이 한 장에 모였다" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 12부 전체가 이 한 장에 모였다">
      이 캡스톤에는 12부가 다 들어 있습니다. 사용자와 잠재 사용자는 2장의 저량, 도입과 이탈은 유량, 입소문은 3장의 강화 루프, 포화는 7장의
      균형 루프이고, 이탈이 있을 때 멈추는 자리는 8장의 평형이에요. 계산은 5장의 오일러법이고, 도입 속도의 정점이 절반 근처라는 것은 7장의
      변곡점, 곧 <b><PartLink :part="2" ch="ch7">2부 7장</PartLink></b> 시그모이드의 성질입니다. 같은 '도입 판정'을 11부에서는 에이전트 한 대의
      성공률로 했다면(<b><PartLink :part="11" ch="ch12">11부 12장</PartLink></b>), 여기서는 조직 전체의 시간에 따른 움직임으로 했어요. 실제 숫자로
      p·q를 추정할 때는 <b><PartLink :part="10" ch="ch6">10부 6장</PartLink></b>의 오차범위를 잊지 마세요. 그리고 지금 보고 있는 이 학습 사이트의
      포털에도 로그인하면 보이는 '도입 현황' 화면이 있습니다. 거기 나오는 숫자들을 오늘 배운 저량과 유량으로 읽어 보면, 이 시리즈가 사내에서 어떤 S자를
      그리고 있는지 직접 판정할 수 있어요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 12부를 완주합니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="사내 AI 도입 캡스톤: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="이 모형의 두 저량은?"
        :choices="['잠재 사용자와 사용자', '도입과 이탈', '홍보와 입소문', 'p와 q']"
        :answer="0"
        explanation="멈춰 놓고 셀 수 있는 것이 저량입니다. 도입과 이탈은 그 사이를 오가는 유량, p·q·L은 유량을 정하는 다이얼(보조변수·상수)이에요."
      />
      <Quiz
        difficulty="easy"
        question="모방계수 q가 나타내는 것은?"
        :choices="['이미 쓰는 동료를 보고 따라 시작하는 입소문의 세기', '홍보·교육만 보고 시작하는 정도', '평균 사용 기간', '전체 직원 수']"
        :answer="0"
        explanation="q·A/M 꼴이라 사용자가 많을수록 커집니다. 3장의 강화 루프가 이 항에서 나와요."
      />
      <Quiz
        difficulty="easy"
        question="처음에 사용자가 0명이면 입소문(q·A/M)도 0이라, 도입은 홍보·교육(p)으로 시작된다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 시작을 만드는 것은 바깥 영향 p예요. 그래서 도입 초기에는 교육·홍보가 필요합니다."
      />
      <Quiz
        difficulty="easy"
        question="기본 시나리오(p 0.01, q 0.4, 이탈 없음)에서 직원의 절반이 쓰게 되는 때는 약 몇 개월인가? (소수 첫째 자리)"
        type="numeric"
        :answer="9.1"
        :tolerance="0.05"
        :hints="['실험의 지표 카드나 비교표 첫 줄을 보세요.']"
        explanation="약 9.1개월입니다. 도입 속도의 정점(9.0개월)과 거의 같은 때예요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="홍보 집중(p 0.03)은 기본보다 절반 도달을 몇 개월 당기나? (소수 첫째 자리)"
        type="numeric"
        :answer="2.8"
        :tolerance="0.1"
        :hints="['비교표의 절반 도달 두 값을 빼 보세요. 소수 둘째 자리까지 보면 9.13 − 6.36']"
        explanation="9.13 − 6.36 ≈ 2.8개월. 홍보는 시작을 당기는 다이얼입니다. 다만 이탈이 있을 때 최종 수준은 거의 그대로(75.8% → 77.2%)예요."
      />
      <Quiz
        difficulty="medium"
        question="평균 사용 기간 10개월(이탈 있음)일 때 평형 활성 비율은 약 몇 %인가? (소수 첫째 자리)"
        type="numeric"
        :answer="75.8"
        :tolerance="0.05"
        :hints="['비교표의 현실: 이탈 있음 줄을 보세요.']"
        explanation="약 75.8%(약 227명). 들어오는 흐름과 나가는 흐름이 같아지는 평형이에요(8장). 이탈한 사람이 다시 잠재 사용자가 되니 0으로 무너지지는 않습니다."
      />
      <Quiz
        difficulty="medium"
        question="월 신규 가입이 정점을 찍고 줄기 시작했다. 올바른 해석은?"
        :choices="['사용자가 절반쯤 왔다는 신호(변곡점). 사용자는 계속 늘고, 이제 이탈 지표를 봐야 할 때다', '도입이 실패했다', '사용자 수가 줄기 시작한다', '홍보를 중단해야 한다']"
        :answer="0"
        explanation="Bass 모형에서 도입 속도의 정점은 사용자 비율 1/2 − p/(2q), 곧 절반 바로 앞입니다. 워밍업의 '유입 정점 ≠ 저량 정점'이 캡스톤에서 다시 나와요."
      />
      <Quiz
        difficulty="medium"
        question="이탈 방지(사용 기간 10 → 20개월)의 효과로 옳은 것은?"
        :choices="['시작 속도는 거의 그대로, 최종 수준(평형)이 75.8% → 87.8%로 오른다', '절반 도달이 크게 당겨진다', '아무 효과가 없다', '도입 속도의 정점이 두 배가 된다']"
        :answer="0"
        explanation="이탈은 나가는 유량이라, 초기(사용자가 적을 때)에는 영향이 작고 사용자가 많아진 뒤 최종 수준을 정합니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="이탈이 있는 현실에서 입소문(q)을 0.4 → 0.6으로 올리면 평형이 75.8% → 83.7%로 오른다. 홍보(p)를 세 배로 올렸을 때(77.2%)보다 효과가 큰 이유는?"
        :choices="['q는 사용자가 많을수록 커지는 강화 루프라, 사용자가 많은 평형 근처에서도 유입을 크게 늘리기 때문', 'p는 사용자를 줄이기 때문', '우연이다', 'q는 이탈을 없애기 때문']"
        :answer="0"
        explanation="평형 근처에서는 사용자 비율 A/M이 크니 q·A/M 항이 p보다 훨씬 큽니다. 그래서 같은 '들어오는 쪽' 다이얼이라도 q가 평형을 더 끌어올려요. p가 작을 때 평형이 대략 1 − 1/(q·L)(q 0.4면 75%, 0.6이면 83%)이라는 것도 같은 이야기입니다."
      />
      <Quiz
        difficulty="hard"
        question="실제 도입 3개월 차 숫자로 p와 q를 추정해 2년 뒤를 예측하려 한다. 가장 알맞은 태도는?"
        :choices="['초기 숫자만으로는 추정이 크게 흔들리니 오차범위를 붙이고, 숫자가 쌓일 때마다 다시 추정한다. 구조적 결론(어느 다이얼이 무엇을 바꾸나)을 먼저 쓴다', '3개월 숫자로 지수 곡선을 그어 확정한다', '모형은 틀렸으니 쓰지 않는다', '가장 낙관적인 추정치를 고른다']"
        :answer="0"
        explanation="S자의 앞부분은 지수와 구별이 어려워(7장) 초기 추정이 크게 흔들립니다. 10부 6장의 오차범위를 붙이고 계속 갱신하되, 숫자가 달라도 유지되는 구조적 결론을 먼저 씁니다. '모든 모형은 틀렸지만 어떤 모형은 쓸모 있다'."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch12')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-2xl font-bold text-emerald-700">🎓</div>
      <p class="text-lg font-bold text-emerald-800">12부 졸업: 시스템 다이내믹스, 완결!</p>
      <p class="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-emerald-700">
        쌓인 것은 흐름으로만 바뀌고, 흐름은 쌓인 것을 보고 정해집니다. 이제 도입 계획을 숫자 하나가 아니라 저량·유량·고리·지연으로
        그리고, 어디를 건드릴지 판정할 수 있어요. 질문 사슬의 연장: 무엇을(6부) → 어떻게(8부) → 무엇으로(9부) → 얼마나·정말로(10부) →
        이제 일을 맡겨도 되나(11부) → <b>들이고 나면 무슨 일이 벌어지나(12부)</b>.
      </p>
      <a
        href="/"
        class="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        목차로: 처음으로 →
      </a>
    </div>
  </article>
</template>
