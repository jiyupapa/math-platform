<script setup lang="ts">
// 1장 — 큰 그림: 시간의 모양을 만드는 네 부품. 저량·유량·피드백 루프·지연과
// 네 가지 행동 패턴(지수 성장·목표 추구·S자·출렁임)을 짝짓고 12부 지도를 그린다.
// 다시 쓰는 수학: 11부 1장(에이전트 루프), 2부 9장(경사하강 = 고리).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import BehaviorLab from '@/components/BehaviorLab.vue'
import DiagramSteps from '@/components/DiagramSteps.vue'
import DiagramLegend from '@/components/DiagramLegend.vue'
import type { CldLink, CldLoop, CldNode, CldStep, SfdAux, SfdFlow, SfdLink, SfdStep, SfdStock } from '@/data/plot'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch1')
}

// 2절 그림 읽기 ① — 저량-유량도를 한 단계씩. 새로 그린 부분은 mark(호박색 바탕).
// 가로 360 으로 좁게 잡아 휴대폰에서도 글자가 11px 안팎으로 읽힌다(440 이면 0.7배로 줄어 8px대).
const STOCK: SfdStock = { id: 'u', label: '사용자 수', x: 180, y: 118, w: 104, h: 52, value: '120명', level: 0.5 }
const IN: SfdFlow = { id: 'in', label: '신규 가입', path: [[18, 118], [127, 118]], rate: '20명/월' }
const OUT: SfdFlow = { id: 'out', label: '이탈', path: [[233, 118], [342, 118]], rate: '5명/월' }
const CLOUDS = { in: { ...IN, fromCloud: true }, out: { ...OUT, toCloud: true } }
const INFO: SfdLink[] = [
  { from: [160, 91], to: [79, 98], bend: 0.35, sign: '+' },
  { from: [200, 91], to: [281, 98], bend: -0.35, sign: '+' },
]
const AUX: SfdAux[] = [
  { id: 'k', label: '입소문 세기', x: 40, y: 40 },
  { id: 'L', label: '평균 사용 기간', x: 316, y: 40 },
]
const AUX_INFO: SfdLink[] = [
  { from: [44, 46], to: [68, 97], bend: -0.15, sign: '+' },
  { from: [312, 46], to: [292, 97], bend: 0.15, sign: '−' },
]
const sfdSteps: SfdStep[] = [
  { title: '상자', stocks: [{ ...STOCK, mark: true }] },
  { title: '두 줄 파이프', stocks: [STOCK], flows: [{ ...IN, mark: true }, { ...OUT, mark: true }] },
  { title: '밸브', stocks: [STOCK], flows: [{ ...IN, mark: 'valve' }, { ...OUT, mark: 'valve' }] },
  { title: '구름', stocks: [STOCK], flows: [{ ...CLOUDS.in, mark: 'cloud' }, { ...CLOUDS.out, mark: 'cloud' }] },
  { title: '가는 화살표', stocks: [STOCK], flows: [CLOUDS.in, CLOUDS.out], links: INFO.map((l) => ({ ...l, mark: true })) },
  {
    title: '작은 원',
    stocks: [STOCK],
    flows: [CLOUDS.in, CLOUDS.out],
    aux: AUX.map((a) => ({ ...a, mark: true })),
    links: [...INFO, ...AUX_INFO.map((l) => ({ ...l, mark: true }))],
  },
  {
    title: '고리 찾기',
    stocks: [{ ...STOCK, mark: true }],
    flows: [{ ...CLOUDS.in, mark: true }, CLOUDS.out],
    aux: AUX,
    links: [{ ...INFO[0], mark: true }, INFO[1], ...AUX_INFO],
  },
]

// 3절 그림 읽기 ② — 인과지도를 한 단계씩(4절 실험 BehaviorLab 과 같은 구조·이름, 좌표만 가로 360 으로 좁힘)
const GAIN: CldNode = { id: 'gain', label: '신규 가입', x: 160, y: 36 }
const USERS: CldNode = { id: 'users', label: '사용자 수', x: 160, y: 200, stock: true }
const ROOM: CldNode = { id: 'room', label: '남은 여지', x: 296, y: 118 }
const G2U: CldLink = { from: 'gain', to: 'users', sign: '+' }
const U2G: CldLink = { from: 'users', to: 'gain', sign: '+', bend: -0.6 }
const U2R: CldLink = { from: 'users', to: 'room', sign: '−', bend: 0.15 }
const R2G: CldLink = { from: 'room', to: 'gain', sign: '+', bend: 0.15 }
const LOOP_R: CldLoop = { x: 134, y: 112, type: 'R', label: '입소문' }
const LOOP_B: CldLoop = { x: 217, y: 112, type: 'B', label: '한계' }
const cldSteps: CldStep[] = [
  { title: '낱말', nodes: [{ ...GAIN, mark: true }, { ...USERS, mark: true }], links: [] },
  { title: '화살표', nodes: [GAIN, USERS], links: [{ ...G2U, sign: '?', mark: true }] },
  { title: '+ 부호', nodes: [GAIN, USERS], links: [{ ...G2U, mark: true }] },
  { title: '되돌아오는 화살표', nodes: [GAIN, USERS], links: [G2U, { ...U2G, mark: true }] },
  { title: 'R 표시', nodes: [GAIN, USERS], links: [G2U, U2G], loops: [{ ...LOOP_R, mark: true }] },
  {
    title: '− 와 B 표시',
    nodes: [GAIN, USERS, { ...ROOM, mark: true }],
    links: [G2U, U2G, { ...U2R, mark: true }, { ...R2G, mark: true }],
    loops: [LOOP_R, { ...LOOP_B, mark: true }],
  },
  { title: '∥ 지연', nodes: [GAIN, USERS, ROOM], links: [G2U, U2G, { ...U2R, delay: true, mark: true }, R2G], loops: [LOOP_R, LOOP_B] },
]
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">1장 · 약 45분</p>
    <h1 class="mb-4 text-3xl font-bold">큰 그림 — 시간의 모양을 만드는 네 부품</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업에서는 가입과 이탈이 미리 주어진 숫자였습니다. 현실은 다르죠. 입소문 가입은 이미 쓰는 사람이
      많을수록 많고, 이탈은 지금 쓰는 사람 중 일부에서 나옵니다. <b>쌓인 양(사용자 수)이 다시 흐름(가입·이탈)을
      정하는</b> 거예요. 이 장에서는 이 과정 내내 쓸 그림 두 가지를 읽는 법부터 익히고, 이런 고리가 시간에 따른 변화의 모양을
      어떻게 만드는지 본 뒤 12부 전체의 지도를 그립니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"구조가 행동을 만든다."</b> 네 부품(저량·유량·피드백 루프·지연)을 켜고 끄며
      네 가지 시간의 모양(지수 성장·목표 추구·S자 성장·출렁임)이 어떤 구조에서 나오는지 짝지어 봅니다.
      그래프 모양만 보고 숨은 구조를 짐작하는 눈이 이 장의 목표예요. 그 전에 구조를 그리는 두 그림,
      <b>저량-유량도</b>와 <b>인과지도</b>를 기호 하나하나부터 읽을 수 있게 됩니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 네 부품</h2>
    <ReviewFlag id="ch1-s1" chapter="ch1" label="1. 네 부품" />
    <p class="leading-relaxed text-slate-700">
      시간에 따라 변하는 시스템은 놀랍게도 부품 네 개로 거의 다 설명됩니다. 앞의 둘은 워밍업에서 만났어요.
    </p>
    <ul class="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-slate-700">
      <li><b>저량</b>: 쌓여 있는 양. 욕조의 물 높이. 사용자 수, 재고, 대기열.</li>
      <li><b>유량</b>: 저량을 늘리고 줄이는 흐름. 수도꼭지와 배수구. 가입, 이탈.</li>
      <li><b>피드백 루프</b>: 저량이 다시 유량을 정하는 고리. 사용자 수가 입소문 가입을 늘리는 식.</li>
      <li><b>지연</b>: 원인과 결과 사이의 시간 차. 숫자가 늦게 보이거나 효과가 늦게 나타나는 것.</li>
    </ul>
    <p class="mt-3 leading-relaxed text-slate-700">
      네 부품을 말로만 늘어놓으면 금세 헷갈립니다. 무엇이 쌓이고 무엇이 흐르는지, 무엇이 무엇을 움직이는지 한눈에 보려면
      그림이 필요해요. 2절과 3절에서 이 과정 내내 쓸 그림 두 가지를 기호 하나하나부터 익히고 갑니다.
    </p>

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 그림 읽기 ①: 저량-유량도</h2>
    <ReviewFlag id="ch1-sfd" chapter="ch1" label="2. 그림 읽기 ①: 저량-유량도" />
    <p class="leading-relaxed text-slate-700">
      시스템 다이내믹스에는 전 세계가 같은 기호로 그리는 그림이 두 가지 있습니다. 쌓이는 것과 흐르는 것을 그리는 <b>저량-유량도</b>,
      그리고 무엇이 무엇을 움직이는지 그리는 <b>인과지도</b>예요. 이 과정의 실험실에는 거의 언제나 둘 중 하나가 나옵니다.
      먼저 저량-유량도입니다. 워밍업의 욕조를 그린다고 생각하면 쉬워요. 사내 AI 도구의 사용자 수를 예로 한 단계씩 그려 봅시다.
    </p>

    <DiagramSteps kind="sfd" title="한 단계씩 그려 보기: 사내 AI 도구의 사용자 수" :steps="sfdSteps" :width="360" :height="190">
      <template #s1>
        먼저 <b>상자</b>를 그립니다. 상자는 <b>저량</b>, 곧 '지금 쌓여 있는 양'이에요. 욕조로 치면 욕조에 담긴 물입니다.
        상자 안에는 이름(사용자 수)과 지금 값(120명)을 씁니다. 저량인지 헷갈리면 이렇게 물어보세요.
        <b>시간을 멈추고 사진을 찍어도 셀 수 있는가?</b> 사진 속 사용자 수는 셀 수 있으니 저량입니다. 그래서 저량의 단위(명)에는 시간이 붙지 않아요.
      </template>
      <template #s2>
        상자에 <b>두 줄 파이프</b>를 붙입니다. 파이프는 <b>유량</b>, 곧 저량을 늘리거나 줄이는 흐름이에요. 욕조로 치면 수도꼭지에서
        나오는 물줄기와 배수구로 빠지는 물줄기입니다. 화살촉 쪽으로 흐르니, 상자로 들어오는 신규 가입은 <b>유입</b>,
        상자에서 나가는 이탈은 <b>유출</b>이에요. 유량의 단위에는 늘 시간이 붙습니다(20명/월). 사진 한 장으로는 '한 달에 몇 명'을 알 수 없죠.
        흐름은 동영상으로 봐야 보이는 양입니다.
      </template>
      <template #s3>
        파이프 가운데의 나비 모양이 <b>밸브</b>입니다. 수도꼭지 손잡이처럼, 지금 흐름이 얼마나 센지 정하는 곳이에요.
        그래서 유량의 이름과 값(신규 가입 20명/월)은 밸브 옆에 씁니다. 상자의 양은 이 밸브를 지난 흐름으로만 바뀌어요.
        이대로 한 달이 지나면 사용자 수는 <b>120 + 20 − 5 = 135명</b>이 됩니다.
      </template>
      <template #s4>
        파이프 끝의 <b>구름</b>은 '이 모형이 신경 쓰지 않는 바깥'입니다. 새 사용자가 원래 어디 있던 사람인지, 그만둔 사람이 어디로
        가는지는 지금 질문과 상관없으니 구름으로 비워 둬요. 수도꼭지 그림에 상수원과 하수도까지 그리지 않는 것과 같습니다.
        바깥이 중요해지면 구름 자리에 상자를 그려요. 12장 캡스톤에서는 '아직 안 쓰는 직원'이 중요해서 구름 대신 <b>잠재 사용자</b> 상자가 들어갑니다.
      </template>
      <template #s5>
        이제 <b>가는 화살표</b>를 긋습니다. 가는 화살표는 아무것도 옮기지 않아요. '이 값을 <b>보고</b> 저 밸브를 정한다'는 <b>정보</b>의 길입니다.
        사용자 수에서 신규 가입 밸브로 가는 화살표는 '쓰는 사람이 많을수록 입소문 가입이 많다', 이탈 밸브로 가는 화살표는
        '쓰는 사람이 많을수록 그만두는 사람도 많다'는 뜻이에요. 화살표 끝의 <b>+</b>는 '같은 방향'(이 값이 크면 저 흐름도 커진다)이라는 표시입니다.
        사람이 실제로 옮겨 가는 길은 두 줄 파이프, 보고 정하는 길은 가는 화살표. 이 둘을 섞지 않는 것이 저량-유량도의 핵심이에요.
      </template>
      <template #s6>
        <b>작은 원</b>은 쌓이지 않는 값, <b>보조변수</b>입니다. 미리 정해 두는 숫자(입소문이 얼마나 센지, 평균 몇 달 쓰는지)나
        다른 값으로 그때그때 계산하는 값을 여기에 둬요. 실험실에서 돌리는 다이얼이 대개 이 작은 원입니다.
        평균 사용 기간에서 이탈로 가는 화살표에는 <b>−</b>가 붙었죠. 오래 쓸수록 한 달에 그만두는 사람이 줄어드니 '반대 방향'이에요.
      </template>
      <template #s7>
        완성된 그림을 소리 내어 읽어 봅시다. <b>"신규 가입이 사용자 수에 쌓이고, 이탈이 사용자 수에서 빠져나간다.
        신규 가입의 세기는 사용자 수와 입소문 세기를 보고 정하고, 이탈의 세기는 사용자 수와 평균 사용 기간을 보고 정한다."</b>
        노란 바탕의 길을 따라가 보세요. 사용자 수 → (보고) → 신규 가입 → (쌓여서) → 사용자 수. 쌓인 양이 다시 흐름을 정하는 이 길이
        <b>피드백 루프</b>입니다. 이탈 쪽에도 고리가 하나 더 있어요(사용자 수 → 이탈 → 사용자 수). 이쪽은 사용자가 늘수록 더 많이
        빠져나가 성장을 누르는 고리예요. 고리가 키우는 쪽인지 누르는 쪽인지 가려 이름을 붙이는 법은 3절 인과지도에서 배웁니다.
      </template>
    </DiagramSteps>

    <ConceptCard tone="tip" title="저량-유량도의 약속 세 가지">
      <ol class="list-decimal space-y-1.5 pl-5">
        <li><b>상자의 양은 두 줄 파이프로만 바뀐다.</b> 가는 화살표는 '보고 정한다'는 정보만 전하고 아무것도 옮기지 않는다.</li>
        <li><b>파이프의 단위 = 상자의 단위 ÷ 시간.</b> 사용자 수(명)에 붙는 파이프는 명/월이다. 단위가 안 맞으면 그림이 틀린 것이다.</li>
        <li>
          <b>상자가 변하는 속도 = 들어오는 파이프의 합 − 나가는 파이프의 합.</b> 이 차이가 워밍업의 <b>순유량</b>이다.
          2장에서 이것을 식으로 정확히 쓰고, 5장에서 컴퓨터가 이 약속대로 미래를 계산하는 법을 배운다.
        </li>
      </ol>
    </ConceptCard>

    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">📋 기호 한눈에 보기: 저량-유량도</p>
    <DiagramLegend kind="sfd" />

    <ConceptCard tone="note" title="새 용어: 저량-유량도 / 밸브 / 구름 / 보조변수 / 정보 화살표">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>저량-유량도</b> (stock and flow diagram, SFD). 뜻: 저량은 상자, 유량은 밸브 달린 두 줄 파이프로 그려 쌓이는 것과 흐르는 것을
          구별하는 그림. 그림대로 식을 세워 계산할 수 있어서 시뮬레이션의 설계도가 됩니다.
        </li>
        <li><b>밸브</b> (valve). 뜻: 파이프 위 나비 모양. 그 유량이 지금 얼마나 센지 정하는 자리로, 유량의 이름과 값을 여기에 씁니다.</li>
        <li><b>구름</b> (cloud). 뜻: 모형의 경계 밖. 흐름의 출발지나 도착지를 따지지 않겠다는 표시로, 실무에서는 source(출발)·sink(도착)라고도 부릅니다.</li>
        <li><b>보조변수</b> (auxiliary variable). 뜻: 작은 원으로 그리는, 쌓이지 않는 값. 정해 둔 상수나 다른 값으로 계산하는 값입니다.</li>
        <li><b>정보 화살표</b> (information link). 뜻: 가는 화살표. 값을 보고 다른 값(대개 밸브)을 정한다는 연결로, 양을 옮기지 않습니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="저량-유량도에서 사용자(사람)가 실제로 옮겨 가는 길은?"
      :choices="['두 줄 파이프(유량)', '가는 화살표', '작은 원', '구름과 구름 사이']"
      :answer="0"
      :hints="['가는 화살표는 무엇을 옮기는지 떠올려 보세요.']"
      explanation="사람·물·돈처럼 실제로 쌓이는 것은 두 줄 파이프로만 움직입니다. 가는 화살표는 '보고 정한다'는 정보의 길이라 아무것도 옮기지 않아요."
    />
    <Quiz
      question="사용자 수 120명에 신규 가입 20명/월, 이탈 5명/월이 한 달 동안 그대로 이어진다. 한 달 뒤 사용자 수는? (정수)"
      type="numeric"
      :answer="135"
      :hints="['상자는 들어오는 파이프만큼 늘고 나가는 파이프만큼 줍니다.']"
      explanation="120 + 20 − 5 = 135명. 상자가 변하는 양은 들어오는 흐름에서 나가는 흐름을 뺀 순유량(+15명/월)이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 그림 읽기 ②: 인과지도</h2>
    <ReviewFlag id="ch1-cld" chapter="ch1" label="3. 그림 읽기 ②: 인과지도" />
    <p class="leading-relaxed text-slate-700">
      저량-유량도는 계산까지 할 수 있는 정밀한 설계도입니다. 그런데 회의에서 '이 일이 왜 이렇게 흘러가지?'를 빠르게 그려 보고 싶을 때는
      더 가벼운 그림이 편해요. 그게 <b>인과지도</b>입니다. 상자도 파이프도 없이 <b>낱말과 화살표</b>만으로 무엇이 무엇을 움직이는지 그리고,
      그 안에서 고리를 찾아요. 4절 실험에 나오는 그림을 한 단계씩 만들어 봅시다.
    </p>

    <DiagramSteps kind="cld" title="한 단계씩 그려 보기: 입소문과 한계" :steps="cldSteps" :width="360" :height="236">
      <template #s1>
        인과지도의 낱말은 <b>변수</b>, 곧 늘거나 줄 수 있는 양입니다. 그래서 '신규 가입', '사용자 수', '만족도'처럼
        <b>많아지거나 적어질 수 있는 명사</b>로 이름을 지어요. '도입하다', '교육 실시' 같은 행동이나 사건은 변수가 아닙니다.
        '도입하다가 많아진다'는 말이 어색하죠. 사용자 수를 상자로 두른 것은 '이건 쌓이는 양(저량)'이라는 표시예요.
        인과지도에서는 생략해도 되지만, 표시해 두면 9장에서 볼 함정을 피하기 쉽습니다.
      </template>
      <template #s2>
        화살표는 <b>원인 → 결과</b>입니다. 꼬리 쪽이 원인, 화살촉 쪽이 결과예요. '신규 가입 → 사용자 수'는 '신규 가입이
        사용자 수에 영향을 준다'로 읽습니다. 화살촉 옆 물음표 자리에는 영향의 방향을 나타내는 부호가 들어가요. 그게 다음 단계입니다.
      </template>
      <template #s3>
        <b>+</b>는 '같은 방향'이라는 뜻입니다. 원인이 늘면 결과도 원래보다 커지고, 원인이 줄면 결과도 원래보다 작아져요.
        공부 시간 →(+) 시험 점수처럼요. 여기서는 가입이 많을수록 사용자 수가 더 많이 쌓인다는 뜻입니다.
        한 가지만 조심하세요. 사용자 수 같은 저량으로 가는 +는 '더 많이 쌓인다'는 뜻이지 '늘어난다'는 뜻이 아니에요.
        가입이 줄어도 이탈보다 많으면 사용자 수가 계속 늘었던 워밍업을 떠올려 보세요(9장에서 정확히 다룹니다).
      </template>
      <template #s4>
        이번엔 거꾸로 가는 화살표입니다. '사용자 수 →(+) 신규 가입': 쓰는 사람이 많을수록 입소문으로 들어오는 사람도 많아요.
        이제 화살표를 따라가면 출발점으로 돌아옵니다. 원인과 결과가 꼬리를 물고 한 바퀴 도는 이 길이 <b>고리</b>, 곧
        <b>피드백 루프</b>예요. 2절 저량-유량도의 '사용자 수 → (보고) → 신규 가입 → (쌓여서) → 사용자 수'를 낱말과 화살표만으로 그린 것입니다.
      </template>
      <template #s5>
        고리 가운데의 빙 도는 화살표와 <b>R</b>은 이 고리의 성격 표시입니다. 성격은 <b>한 바퀴 따라 읽기</b>로 알아내요.
        사용자 수가 <b>늘면</b> → (+이니 같은 쪽) 신규 가입이 <b>늘고</b> → (+이니 같은 쪽) 사용자 수가 <b>더 늘어요</b>.
        출발점에 돌아왔을 때 처음 변화(늘었다)가 더 커졌으니 <b>R</b>, <b>강화 루프</b>(reinforcing loop)입니다.
        이 과정의 비유로는 눈덩이예요. 기호 옆에는 고리의 이름(입소문)을 붙입니다.
      </template>
      <template #s6>
        직원 수에는 한계가 있습니다. '남은 여지'(아직 안 쓰는 사람)를 더해 봐요. 사용자가 늘면 남은 여지는 줄어듭니다.
        원인이 늘 때 결과가 원래보다 작아지는 반대 방향이라 <b>−</b>를 붙여요. 남은 여지가 클수록 새로 들어올 사람이 많으니
        '남은 여지 →(+) 신규 가입'. 한 바퀴 따라 읽기: 사용자 수가 <b>늘면</b> → (−이니 반대쪽) 남은 여지가 <b>줄고</b> →
        (+) 신규 가입이 <b>줄고</b> → (+) 사용자 수가 <b>덜 늘어요</b>. 처음 변화를 거슬러 누르니 <b>B</b>, <b>균형 루프</b>(balancing loop)입니다.
        비유로는 온도 조절기예요. 한 그림에 고리가 둘이면, 두 고리가 '신규 가입'을 놓고 줄다리기를 합니다(7장).
      </template>
      <template #s7>
        마지막으로 화살표 위의 <b>두 줄(∥)</b>은 <b>지연</b>입니다. 원인이 바뀌어도 결과가 늦게 따라온다는 표시예요.
        사용자 수가 집계되어 '남은 여지'로 보이기까지 석 달이 걸린다면 이 화살표에 ∥를 긋습니다. 균형 루프에 지연이 끼면
        목표를 지나쳤다 돌아오는 출렁임이 생겨요(6장). 이것이 4절 실험에 나오는 그림 전체입니다.
      </template>
    </DiagramSteps>

    <ConceptCard tone="tip" title="R인지 B인지: 한 바퀴 따라 읽기">
      <ol class="list-decimal space-y-1.5 pl-5">
        <li>고리 위 아무 변수에서나 <b>'이게 늘면'</b>으로 시작한다.</li>
        <li>화살표를 따라가며 <b>+면 같은 쪽</b>(늘면 늘고, 줄면 줄고), <b>−면 반대쪽</b>(늘면 줄고, 줄면 늘고)으로 바꿔 말한다.</li>
        <li>출발점에 돌아왔을 때 처음 변화가 <b>더 커졌으면 R</b>(강화 루프), 처음 변화를 <b>거슬렀으면 B</b>(균형 루프).</li>
      </ol>
      <p class="mt-2">
        지름길도 있어요. − 하나를 지날 때마다 방향이 한 번 뒤집히므로, 고리 안 <b>−가 짝수 개(0개 포함)면 R, 홀수 개면 B</b>입니다.
        이 규칙이 왜 맞는지는 9장에서 정식으로 다룹니다.
      </p>
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      +와 −가 아직 낯설다면 일상의 예로 연습해 보세요. <b>같은 방향(+)</b>: 공부 시간 → 시험 점수, 사용자 수 → 서버 부하.
      <b>반대 방향(−)</b>: 회의 시간 → 집중해서 일하는 시간, 가격 → 판매량. 화살표 하나를 읽을 때는 그 원인 하나만 바뀌고
      나머지는 그대로라고 생각하는 것이 약속입니다.
    </p>

    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">📋 기호 한눈에 보기: 인과지도</p>
    <DiagramLegend kind="cld" />

    <p class="mt-4 leading-relaxed text-slate-700">
      두 그림은 같은 이야기를 다른 해상도로 그린 것입니다. 2절의 저량-유량도와 방금 그린 인과지도를 나란히 놓고 보면 이렇게 대응해요.
    </p>
    <div class="my-4 overflow-x-auto">
      <table class="w-full break-keep text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3 font-medium">저량-유량도(2절)</th>
            <th class="py-2 font-medium">인과지도(3절)</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">상자: 사용자 수</td><td class="py-2">낱말 '사용자 수'(상자로 둘러 저량 표시)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">밸브 달린 파이프: 신규 가입</td><td class="py-2">낱말 '신규 가입'과 화살표 '신규 가입 →(+) 사용자 수'</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">가는 화살표: 사용자 수 → 가입 밸브</td><td class="py-2">화살표 '사용자 수 →(+) 신규 가입'</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">구름(모형 밖)</td><td class="py-2">그리지 않는다</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">쌓이는 것과 흐르는 것을 구별한다</td><td class="py-2">구별하지 않는다(그래서 9장의 함정이 생긴다)</td></tr>
          <tr><td class="py-2 pr-3">쓰임: 숫자를 넣어 계산하기</td><td class="py-2">쓰임: 생각 정리, 고리 찾기, 회의에서 함께 그리기</td></tr>
        </tbody>
      </table>
    </div>
    <p class="leading-relaxed text-slate-700">
      실무에서는 인과지도로 고리를 먼저 찾고, 저량-유량도로 옮겨 숫자를 넣고 계산합니다(6절 12부 지도의 순서).
      Vensim·Stella 같은 시스템 다이내믹스 도구도 두 그림을 다 그려요.
    </p>

    <ConceptCard tone="note" title="새 용어: 인과지도 / 변수 / 극성 / 루프 표시">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>인과지도</b> (causal loop diagram, CLD, 인과순환지도라고도 함). 뜻: 변수를 +/− 화살표로 이어 피드백 루프를 찾는 그림.
          쌓이는 것과 흐르는 것을 구별하지 않는 '스케치'라서, 계산하려면 저량-유량도로 옮겨야 합니다.
        </li>
        <li><b>변수</b> (variable). 뜻: 인과지도의 낱말. 늘거나 줄 수 있는 양을 명사로 씁니다.</li>
        <li><b>극성</b> (polarity). 뜻: 화살표 끝의 +(같은 방향)·−(반대 방향) 표시. 고리 전체의 성격(R/B)도 극성이라고 부르며, 9장에서 정식 규칙을 다룹니다.</li>
        <li><b>루프 표시</b> (loop identifier). 뜻: 고리 가운데 그리는 빙 도는 화살표와 R(강화)·B(균형) 글자, 그리고 고리의 이름.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="인과지도에 'A →(−) B'가 있다. 다른 조건이 같을 때 A가 줄면 B는?"
      :choices="['원래보다 커진다', '원래보다 작아진다', '그대로다', '알 수 없다']"
      :answer="0"
      :hints="['−는 반대 방향입니다. A가 늘면 B는? 그럼 줄면?']"
      explanation="−는 반대 방향이라, A가 늘면 B가 원래보다 작아지고 A가 줄면 B는 원래보다 커집니다. 회의 시간이 줄면 집중해서 일하는 시간이 늘어나는 것처럼요."
    />
    <Quiz
      question="'피곤함 →(+) 마시는 커피 양 →(−) 피곤함' 고리를 한 바퀴 따라 읽으면?"
      :choices="['B(균형 루프): 피곤할수록 커피를 더 마셔 피곤함이 줄어든다', 'R(강화 루프): 피곤할수록 더 피곤해진다', '고리가 아니다', '판별할 수 없다']"
      :answer="0"
      :hints="['피곤함이 늘면 → 커피는? → 그러면 피곤함은?', '고리 안 −의 개수가 짝수인가요, 홀수인가요?']"
      explanation="피곤함이 늘면 → (+) 커피를 더 마시고 → (−) 피곤함이 줄어듭니다. 처음 변화(피곤함이 늘었다)를 거슬러 돌아오니 B, 균형 루프예요. 고리 안 −가 하나(홀수)인 것과도 맞습니다."
    />


    <h2 class="mt-8 mb-2 text-xl font-bold">4. 실험: 같은 저량, 다른 구조</h2>
    <ReviewFlag id="ch1-s2" chapter="ch1" label="4. 실험: 같은 저량, 다른 구조" />
    <p class="leading-relaxed text-slate-700">
      3절에서 그린 인과지도의 고리를 이제 직접 끼웠다 뺐다 해 봅시다. 강화 루프(입소문), 균형 루프(한계), 지연을 켜고 끌 때마다
      컴퓨터가 36개월을 계산해 곡선을 다시 그립니다. 계산하는 방법 자체는 5장에서 배워요. 지금은 모양만 보세요.
    </p>

    <BehaviorLab />

    <ConceptCard tone="tip" title="핵심 관찰: 그래프 모양은 숨은 구조의 지문">
      똑같은 사용자 수인데 끼운 고리에 따라 전혀 다른 시간의 모양이 나왔습니다.
      강화 루프만 있으면 <b>지수 성장</b>(36개월에 약 1,294만 명, 그래프 밖으로), 균형 루프만 있으면 1,000명으로
      다가가는 <b>목표 추구</b>, 둘 다 있으면 처음엔 빠르다 나중엔 멈추는 <b>S자 성장</b>, 균형 루프에 지연을 더하면
      목표를 지나쳤다 돌아오는 <b>출렁임</b>(최고 약 1,180명). 거꾸로 말하면 <b>그래프 모양을 보고 어떤 고리가
      돌고 있는지 짐작할 수 있습니다</b>. 이것이 시스템 다이내믹스의 첫 원리 "구조가 행동을 만든다"예요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="균형 루프에 지연을 더하면 사용자 수는 어떻게 움직이나?"
      :choices="['목표를 지나쳤다가 되돌아오며 출렁인다', '목표에 더 빨리, 매끄럽게 닿는다', '지수적으로 계속 늘어난다', '아무 변화가 없다']"
      :answer="0"
      :hints="['실험에서 균형 루프와 지연만 켜 보세요.']"
      explanation="사용자 수가 늦게 보이니 이미 목표를 넘었는데도 한동안 계속 받아들입니다. 최고 약 1,180명까지 넘쳤다가 되돌아오죠. 지연이 출렁임을 만드는 원리는 6장에서 자세히 다룹니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">5. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="ch1-s3" chapter="ch1" label="5. 오늘의 발견에 이름표 달기" />

    <ConceptCard tone="note" title="새 용어: 피드백 루프 / 강화 루프 / 균형 루프 / 지연 / 시스템 다이내믹스">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>피드백 루프</b> (feedback loop, 되먹임 고리). 뜻: 원인이 결과를 낳고, 그 결과가 돌고 돌아 다시 원인에
          영향을 주는 고리. 이 과정에서는 주로 "저량이 유량을 정하는" 모양으로 나타납니다.
        </li>
        <li>
          <b>강화 루프</b> (reinforcing loop, 기호 <b>R</b>). 뜻: 변화를 <b>키우는</b> 고리. 커질수록 더 빨리 커지고,
          줄면 더 빨리 줄어요. 이 과정의 비유로는 <b>눈덩이</b>. 교과서에 따라 양(+)의 피드백 루프라고도 부르지만,
          '좋다'는 뜻이 아니라 '같은 방향으로 키운다'는 뜻입니다(악순환도 강화 루프예요). 3장의 주제.
        </li>
        <li>
          <b>균형 루프</b> (balancing loop, 기호 <b>B</b>). 뜻: 목표나 한계와의 <b>차이를 줄이는</b> 고리.
          비유로는 <b>온도 조절기</b>. 음(−)의 피드백 루프라고도 불러요. 4장의 주제.
        </li>
        <li>
          <b>지연</b> (delay). 뜻: 원인과 결과 사이의 시간 차. 인과지도에서는 화살표 위에 두 줄(∥)로 표시합니다. 6장의 주제.
        </li>
        <li>
          <b>시스템 다이내믹스</b> (system dynamics, SD). 뜻: 저량·유량·피드백 루프·지연으로 시스템을 그리고,
          컴퓨터로 시간에 따른 변화를 계산해 보는 방법. 1950년대 MIT의 제이 포레스터(Jay Forrester)가 만들었습니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="강화 루프(R)는 늘 좋은 일을 키우는 고리다."
      type="truefalse"
      :answer="1"
      :hints="['사용자가 줄어서 입소문이 줄고, 그래서 더 줄어드는 경우를 떠올려 보세요.']"
      explanation="거짓입니다. 강화 루프는 방향과 상관없이 변화를 키웁니다. 좋은 쪽이면 선순환, 나쁜 쪽이면 악순환이에요. '양(+)의 피드백'이라는 다른 이름에 속지 마세요. '양'은 좋다는 뜻이 아니라 같은 방향으로 키운다는 뜻이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">6. 12부 지도</h2>
    <ReviewFlag id="ch1-s4" chapter="ch1" label="6. 12부 지도" />
    <p class="leading-relaxed text-slate-700">
      시스템 다이내믹스는 늘 같은 순서로 일합니다. <b>그림</b>(인과지도로 고리 찾기, 3절) → <b>구조</b>(저량-유량도로
      쌓이는 것과 흐르는 것 나누기, 2절) → <b>시뮬레이션</b>(컴퓨터로 미래 계산) → <b>식</b>(미분방정식으로 정확히 쓰기).
      이 시리즈의 설계 철학 "그림 → 조작 → 수식"과 같은 순서예요. 12부도 이 순서로 갑니다.
    </p>
    <div class="mt-3 overflow-x-auto">
      <table class="w-full min-w-[30rem] text-left text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500">
            <th class="py-2 pr-3 font-medium">구간</th>
            <th class="py-2 pr-3 font-medium">장</th>
            <th class="py-2 font-medium">무엇을</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">부품</td><td class="py-2 pr-3">2~4장</td><td class="py-2">저량과 유량(욕조의 수학), 강화 루프(눈덩이), 균형 루프(온도 조절기)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">계산</td><td class="py-2 pr-3">5장</td><td class="py-2">시간을 잘게 썰어 미래를 계산하는 법(오일러법), 그리고 경사하강이 같은 식이라는 것</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">모양</td><td class="py-2 pr-3">6~8장</td><td class="py-2">지연과 출렁임, S자 성장, 평형과 안정성</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">그림</td><td class="py-2 pr-3">9~10장</td><td class="py-2">인과지도의 규칙과 함정, 되풀이되는 구조(시스템 원형)</td></tr>
          <tr><td class="py-2 pr-3">AI·실전</td><td class="py-2 pr-3">11~12장</td><td class="py-2">AI가 만드는 고리(모델 붕괴·보상 해킹), 캡스톤: 사내 AI 도입 모형</td></tr>
        </tbody>
      </table>
    </div>

    <DetailsCard title="➕ 더 깊이: 시스템 다이내믹스는 어디서 왔나">
      1950년대 MIT의 제이 포레스터가 공장의 재고·인력이 왜 출렁이는지 연구하다 시작했습니다(『Industrial Dynamics』, 1961).
      경영자가 미분방정식을 풀지 않고도 동역학을 이해하게 하려고 저량·유량 그림과 컴퓨터 시뮬레이션을 붙인 거예요.
      1972년에는 같은 방법으로 세계 인구·자원·오염을 모형화한 『성장의 한계(The Limits to Growth)』가 나와
      널리 알려졌고, 피터 센게의 『제5경영(The Fifth Discipline)』(1990)이 이 생각법을 '시스템 사고'라는 이름으로
      조직 경영에 들여왔습니다. 도넬라 메도즈의 『Thinking in Systems』(2008)는 입문서로 많이 읽혀요.
      실무에서는 Vensim·Stella 같은 전용 도구를 쓰지만, 이 과정은 도구 없이 브라우저와 노트북(numpy)으로
      같은 계산을 직접 해 봅니다. 도구가 속에서 하는 일을 아는 것이 목표니까요.
    </DetailsCard>

    <ReviewFlag id="ch1-ai" chapter="ch1" label="🤖 AI 연결: 학습도, 에이전트도 고리다" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 학습도, 에이전트도 고리다">
      AI 안에도 고리가 돕니다. 모델 학습은 <b>손실 → 기울기 → 가중치 → 다시 손실</b>로 도는 고리예요.
      손실이 크면 크게, 작으면 작게 고치니 "목표(손실 최저점)와의 차이를 줄이는" 균형 루프죠.
      <b><PartLink :part="2" ch="ch9">2부 9장</PartLink></b>의 경사하강이 바로 이 고리이고, 4장에서 같은 수학임을,
      5장에서 학습률이 시뮬레이션의 시간 간격과 같은 식임을 확인합니다. 에이전트도
      <b>관찰 → 행동 → 결과 → 다시 관찰</b>로 도는 고리입니다(<b><PartLink :part="11" ch="ch1">11부 1장</PartLink></b>).
      AI 바깥에도 고리가 있어요. 사용자가 늘면 데이터가 늘고, 모델이 좋아지고, 사용자가 또 느는 '데이터 플라이휠'은
      강화 루프이고, 사용자가 늘수록 서버가 느려져 이탈이 느는 것은 균형 루프입니다. 11장에서 이런 AI의 고리들을 정면으로 다뤄요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">7. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="시간의 모양을 만드는 네 부품: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="시간의 모양을 만드는 네 부품이 아닌 것은?"
        :choices="['평균', '저량', '피드백 루프', '지연']"
        :answer="0"
        explanation="네 부품은 저량·유량·피드백 루프·지연입니다. 평균은 3부에서 배운 요약 통계예요."
      />
      <Quiz
        difficulty="easy"
        question="강화 루프는 변화를 키우는 고리다. 커질수록 더 빨리 커진다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 사용자가 많을수록 입소문 가입이 많아 더 빨리 늘어나죠. 반대로 줄어들 때는 더 빨리 줄어듭니다."
      />
      <Quiz
        difficulty="easy"
        question="균형 루프만 켰을 때 사용자 수가 그리는 모양은?"
        :choices="['목표 추구: 1,000명에 점점 느리게 다가간다', '지수 성장', 'S자 성장', '출렁임']"
        :answer="0"
        explanation="남은 여지가 클수록 빨리, 작을수록 천천히 채우니 목표에 점점 느리게 다가갑니다. 4장에서 이 모양의 수학을 다뤄요."
      />
      <Quiz
        difficulty="easy"
        question="이 과정에서 온도 조절기는 어느 루프의 비유인가?"
        :choices="['균형 루프: 목표 온도와의 차이를 줄이는 쪽으로 움직인다', '강화 루프', '지연', '저량']"
        :answer="0"
        explanation="방이 목표보다 추우면 더 데우고, 더우면 덜 데웁니다. 차이를 줄이는 고리, 균형 루프의 대표 예예요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="강화 루프와 균형 루프를 함께 켜면 S자가 되는 이유는?"
        :choices="['처음엔 입소문(강화)이 이겨 빨라지고, 한계 가까이에선 균형 루프가 이겨 완만해진다', '두 루프가 서로를 지워 직선이 된다', '균형 루프가 처음부터 끝까지 이긴다', '지연이 생기기 때문이다']"
        :answer="0"
        explanation="지금 어느 고리가 더 센지가 바뀝니다. 이를 '지배 루프가 바뀐다'고 하고, 7장에서 정확히 어느 지점에서 바뀌는지 계산해요."
      />
      <Quiz
        difficulty="medium"
        question="실험에서 균형 루프와 지연을 켰을 때, 사용자 수는 최고 약 몇 명까지 넘쳤나?"
        :choices="['약 1,180명', '정확히 1,000명', '약 3,187명', '약 1,294만 명']"
        :answer="0"
        :hints="['실험에서 균형 루프와 지연만 켜고, 아래 설명의 최고값을 보세요.']"
        explanation="약 9개월에 1,180명까지 넘쳤다가 1,000명으로 돌아옵니다. 사용자 수를 3개월 늦게 보니 목표를 넘긴 뒤에도 한동안 계속 받아들인 탓이에요."
      />
      <Quiz
        difficulty="medium"
        question="강화 루프만 켰을 때 12개월 뒤 사용자 수는 약 몇 명인가? (정수, 실험값)"
        type="numeric"
        :answer="3187"
        :tolerance="20"
        :hints="['실험에서 강화 루프만 켜고 설명을 읽어 보세요.']"
        explanation="약 3,187명. 50명에서 시작해 1년 만에 60배가 넘습니다. 36개월이면 약 1,294만 명이 되죠. 지수 성장은 처음엔 얌전하다가 어느 순간 폭발합니다(3장)."
      />
      <Quiz
        difficulty="medium"
        question="지연만 켜고 균형 루프를 끄면 곡선이 바뀌지 않는다. 이유는?"
        :choices="['지연은 균형 루프가 보는 정보에 걸리는데, 늦게 볼 한계(목표)가 없기 때문', '지연은 원래 효과가 없다', '컴퓨터 계산 오류', '강화 루프가 지연을 지우기 때문']"
        :answer="0"
        explanation="이 실험의 지연은 '사용자 수가 늦게 보이는 것'입니다. 그 정보를 써서 가입을 줄이는 균형 루프가 없으면 늦게 보여도 달라질 게 없어요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="어느 사내 서비스의 사용자 수가 빠르게 늘다가 목표치를 넘겨 한동안 출렁였다. 숨은 구조로 가장 그럴듯한 것은?"
        :choices="['입소문(강화) + 목표·한계(균형) + 늦게 집계되는 사용자 수(지연)', '강화 루프 하나뿐', '균형 루프 하나뿐', '고리가 전혀 없다']"
        :answer="0"
        :hints="['빠르게 늘었다 → ?, 목표치 근처 → ?, 넘겨서 출렁였다 → ?']"
        explanation="빠른 증가는 강화 루프, 목표 근처로 모이는 것은 균형 루프, 넘쳤다 출렁이는 것은 지연의 지문입니다. 실험의 세 부품을 다 켠 모양(넘쳤다 출렁이는 S자)이죠."
      />
      <Quiz
        difficulty="hard"
        question="'구조가 행동을 만든다'를 실무에 옮긴 태도로 가장 알맞은 것은?"
        :choices="['문제가 생기면 사람 탓을 하기 전에 어떤 고리와 지연이 그 모양을 만드는지 찾고, 구조를 바꾼다', '그래프는 우연이므로 신경 쓰지 않는다', '숫자가 나쁘면 담당자를 바꾼다', '한 번 정한 목표는 절대 바꾸지 않는다']"
        :answer="0"
        explanation="같은 구조 안에서는 누가 일해도 비슷한 모양이 나옵니다. 출렁임이 문제라면 지연을 줄이고, 폭주가 문제라면 균형 루프를 보태는 식으로 구조에 손을 대는 것이 시스템 다이내믹스의 처방이에요. 10장(시스템 원형)에서 이런 처방을 모아 봅니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch1')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">1장 완료! 12부의 지도가 생겼습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        네 부품이 네 가지 시간의 모양을 만듭니다. 다음은 2장입니다.
        첫 부품인 저량과 유량을 수학으로 정확히 다루고, 미분을 거꾸로 읽는 '쌓기'의 감각을 익힙니다.
      </p>
      <RouterLink
        to="/ch/ch2"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        2장: 욕조의 수학 →
      </RouterLink>
    </div>
  </article>
</template>
