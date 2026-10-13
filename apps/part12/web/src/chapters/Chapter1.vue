<script setup lang="ts">
// 1장 — 큰 그림: 시간의 모양을 만드는 네 부품. 저량·유량·피드백 루프·지연과
// 네 가지 행동 패턴(지수 성장·목표 추구·S자·출렁임)을 짝짓고 12부 여정표를 그린다.
// 다시 쓰는 수학: 11부 1장(에이전트 루프), 2부 9장(경사하강 = 고리).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import BehaviorLab from '@/components/BehaviorLab.vue'
import SfdDiagram from '@/components/SfdDiagram.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch1')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">1장 · 약 30분</p>
    <h1 class="mb-4 text-3xl font-bold">큰 그림 — 시간의 모양을 만드는 네 부품</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업에서는 가입과 이탈이 미리 주어진 숫자였습니다. 현실은 다르죠. 입소문 가입은 이미 쓰는 사람이
      많을수록 많고, 이탈은 지금 쓰는 사람 중 일부에서 나옵니다. <b>쌓인 양(사용자 수)이 다시 흐름(가입·이탈)을
      정하는</b> 거예요. 이 장에서는 이런 고리가 시간에 따른 변화의 모양을 어떻게 만드는지 보고,
      12부 전체의 지도를 그립니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"구조가 행동을 만든다."</b> 네 부품(저량·유량·피드백 루프·지연)을 켜고 끄며
      네 가지 시간의 모양(지수 성장·목표 추구·S자 성장·출렁임)이 어떤 구조에서 나오는지 짝지어 봅니다.
      그래프 모양만 보고 숨은 구조를 짐작하는 눈이 이 장의 목표예요.
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
      아래 그림은 이 부품들을 시스템 다이내믹스의 표준 표기로 그린 것입니다. 상자가 저량, 두 줄 파이프와
      밸브(나비 모양)가 유량, 구름은 "이 모형이 신경 쓰지 않는 바깥", 가는 화살표는 정보의 흐름이에요.
      사용자 수에서 두 밸브로 가는 가는 화살표가 바로 <b>피드백</b>입니다. 쌓인 양을 보고 흐름이 정해지니까요.
    </p>
    <div class="my-4 rounded-xl border border-slate-200 bg-white p-3">
      <SfdDiagram
        :width="440"
        :height="170"
        :stocks="[{ id: 'u', label: '사용자 수', x: 220, y: 104, w: 112, h: 52, value: '저량', level: 0.5 }]"
        :flows="[
          { id: 'in', label: '신규 가입', path: [[26, 104], [163, 104]], fromCloud: true, rate: '유입' },
          { id: 'out', label: '이탈', path: [[277, 104], [414, 104]], toCloud: true, rate: '유출' },
        ]"
        :links="[
          { from: [196, 77], to: [101, 84], bend: 0.35, sign: '+' },
          { from: [244, 77], to: [339, 84], bend: -0.35, sign: '+' },
        ]"
        aria-label="사용자 수 저량에 신규 가입 유입과 이탈 유출이 붙고, 사용자 수가 두 흐름을 다시 정하는 저량-유량도"
      />
    </div>

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 실험: 같은 저량, 다른 구조</h2>
    <ReviewFlag id="ch1-s2" chapter="ch1" label="2. 실험: 같은 저량, 다른 구조" />
    <p class="leading-relaxed text-slate-700">
      이제 신규 가입을 무엇이 정하는지 직접 끼워 봅시다. 강화 루프(입소문), 균형 루프(한계), 지연을 켜고 끌 때마다
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

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="ch1-s3" chapter="ch1" label="3. 오늘의 발견에 이름표 달기" />

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
      explanation="거짓입니다. 강화 루프는 방향과 상관없이 변화를 키웁니다. 좋은 쪽이면 선순환, 나쁜 쪽이면 악순환이에요. '양(+)의 피드백'이라는 옛 이름에 속지 마세요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 12부 여정표</h2>
    <ReviewFlag id="ch1-s4" chapter="ch1" label="4. 12부 여정표" />
    <p class="leading-relaxed text-slate-700">
      시스템 다이내믹스는 늘 같은 순서로 일합니다. <b>그림</b>(인과지도로 고리 찾기) → <b>구조</b>(저량-유량도로
      쌓이는 것과 흐르는 것 나누기) → <b>시뮬레이션</b>(컴퓨터로 미래 계산) → <b>식</b>(미분방정식으로 정확히 쓰기).
      이 시리즈의 설계 철학 "그림 → 조작 → 수식"과 같은 순서예요. 12부는 이렇게 걷습니다.
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
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">계산</td><td class="py-2 pr-3">5장</td><td class="py-2">시간을 잘게 썰어 미래를 계산하는 법(오일러법), 경사하강과의 만남</td></tr>
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

    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
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
