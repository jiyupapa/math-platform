<script setup lang="ts">
// 워밍업 챕터 — 12부 전체가 풀 문제("쌓인 것은 흐름으로만 바뀐다")를 욕조 문제로 먼저 느낀다.
// 실제 1~12장 챕터도 이 구조를 그대로 따른다.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import BathtubLab from '@/components/BathtubLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('sample')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">워밍업 · 25분 몸풀기</p>
    <h1 class="mb-4 text-3xl font-bold">들어오는 게 줄었는데 왜 계속 늘까</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      본격적인 학습 전 몸풀기입니다. 앞으로 모든 챕터가 이 페이지처럼 진행돼요.
      설명 카드를 읽고, 실험을 직접 만져 보고, 문제를 풀면 진도가 채워집니다.
      막히면 <b>힌트</b>가 있고, 두 번 틀리면 <b>해설</b>도 열 수 있으니 부담 없이 시작하세요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      실험 하나로 12부 전체의 출발 질문을 얻습니다.
      <b>"신규 가입이 줄기 시작했는데, 사용자 수는 왜 아직 늘고 있을까."</b>
      그래프 두 줄만 보고 답을 맞혀 보면, 쌓이는 양과 흐르는 양을 구별하는 눈이 왜 필요한지
      몸으로 알게 됩니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 사내 AI 도구의 첫 1년</h2>
    <ReviewFlag id="sample-s1" chapter="sample" label="1. 무대: 사내 AI 도구의 첫 1년" />
    <p class="leading-relaxed text-slate-700">
      회사에 AI 도구를 들였습니다. 처음엔 반응이 뜨거워서 신규 가입이 매달 늘다가 5월에 160명으로
      정점을 찍었고, 6월부터는 줄기 시작했습니다. 6월 회의에서 누군가 이렇게 보고합니다.
      <b>"가입이 꺾였습니다. 이제 사용자도 줄어들 겁니다."</b> 정말 그럴까요? 쓰다가 그만두는 사람(이탈)도
      있으니 사용자 수는 가입과 이탈 두 흐름이 함께 정합니다. 아래 그래프 두 줄만 보고,
      사용자 수가 가장 많았던 달을 먼저 맞혀 보세요.
    </p>

    <BathtubLab />

    <ConceptCard tone="tip" title="핵심 관찰: 사용자 수는 '가입 − 이탈'이 쌓인 것">
      사용자 수는 매달 <b>가입 − 이탈</b>만큼 바뀝니다. 5월 뒤로 가입은 줄었지만 8월까지는 여전히
      이탈보다 많았기 때문에(8월: 90 − 70 = +20명) 사용자 수는 계속 늘었고, 가입이 처음으로 이탈보다
      적어진 9월(60 − 75 = −15명)에야 줄기 시작했습니다. 그래서 정점은 <b>가입 곡선과 이탈 곡선이 만나는
      곳</b>에 생깁니다. 가입의 정점(5월)과 사용자 수의 정점(8월)은 석 달이나 떨어져 있어요.
      "가입이 꺾였으니 사용자도 준다"는 보고는 틀린 보고였습니다.
    </ConceptCard>

    <MathBlock expr="\text{이번 달 말 사용자 수} = \text{지난달 말 사용자 수} + \text{가입} - \text{이탈}" />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="이 회사의 사내 AI 도구, 사용자 수가 가장 많았던 달은?"
      :choices="['8월: 가입이 이탈보다 많았던 마지막 달', '5월: 가입이 가장 많았던 달', '12월: 가장 오래 쌓인 달', '9월: 이탈이 가장 많았던 달']"
      :answer="0"
      :hints="['실험 ②의 초록 곡선이 가장 높은 곳을 보세요.', '사용자 수는 가입이 이탈보다 많은 동안 계속 늘어납니다.']"
      explanation="8월 말 600명이 정점입니다. 8월까지는 가입이 이탈보다 많아 계속 쌓였고, 9월부터 가입(60)이 이탈(75)보다 적어져 줄기 시작했어요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="sample-s2" chapter="sample" label="2. 오늘의 발견에 이름표 달기" />
    <p class="leading-relaxed text-slate-700">
      방금 쓴 생각법에는 공식 이름이 있습니다. 12부 내내 쓸 첫 이름표만 먼저 달아 두죠.
      자세한 수학은 2장(욕조의 수학)에서 합니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 저량 / 유량 / 유입·유출과 순유량">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>저량</b> (stock, 스톡). 한자로 쌓을 저(貯)에 헤아릴 량(量), '쌓여 있는 양'이라는 뜻입니다.
          시간을 멈추고 세어 볼 수 있는 양으로, 이 과정의 비유로는 <b>욕조의 물 높이</b>예요.
          사용자 수, 재고, 통장 잔고, 서버 대기열의 길이가 모두 저량입니다.
        </li>
        <li>
          <b>유량</b> (flow, 플로). 흐를 류(流)에 헤아릴 량(量). 저량을 늘리거나 줄이는 <b>흐름의 빠르기</b>로,
          단위에 '/월', '/초'처럼 시간이 붙습니다. 비유로는 <b>수도꼭지와 배수구</b>. 신규 가입(명/월)과
          이탈(명/월)이 유량이에요.
        </li>
        <li>
          <b>유입·유출</b> (inflow·outflow)과 <b>순유량</b> (net flow). 저량으로 들어오는 흐름이 유입,
          나가는 흐름이 유출이고, 순유량 = 유입 − 유출입니다. 순유량이 +면 저량이 늘고, −면 줄어요.
          저량이 오르다 멈추는 순간은 <b>유입 = 유출</b>일 때입니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="신규 가입이 줄고 있으면 사용자 수도 반드시 줄고 있다."
      type="truefalse"
      :answer="1"
      :hints="['6~8월에 가입은 줄었는데 사용자 수는 어땠나요?']"
      explanation="거짓입니다. 가입이 줄어도 이탈보다 많기만 하면 사용자 수는 늘어납니다. 사용자 수(저량)의 방향을 정하는 것은 가입(유입)의 오르내림이 아니라 가입과 이탈의 차이(순유량)예요."
    />

    <DetailsCard title="➕ 더 깊이: 이 문제는 왜 똑똑한 사람도 틀릴까">
      방금 같은 '욕조 문제'를 MIT 경영대학원생들에게 낸 연구가 있습니다(Booth Sweeney &amp; Sterman, 2000).
      그래프 두 줄을 보고 쌓인 양의 모양을 그리는 간단한 과제였는데, 상당수가 틀렸어요.
      후속 연구(Cronin, Gonzalez &amp; Sterman, 2009)는 가장 흔한 실수를 이렇게 정리했습니다.
      <b>쌓인 양의 곡선을 들어오는 흐름의 곡선 모양 그대로 따라 그리는 것</b>, 곧 "가입이 꺾이면 사용자도 꺾인다"고
      보는 착각이에요. 수학 실력이 아니라 <b>쌓이는 것과 흐르는 것을 구별하는 습관</b>의 문제라서,
      학력과 상관없이 누구나 연습이 필요합니다. 12부는 이 습관을 처음부터 길러 갑니다.
    </DetailsCard>

    <ReviewFlag id="sample-ai" chapter="sample" label="🤖 AI 연결: 대시보드의 두 숫자, 유량과 저량" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 대시보드의 두 숫자, 유량과 저량">
      AI 서비스 대시보드에는 두 종류의 숫자가 섞여 있습니다. '일일 신규 가입', '초당 요청 수'는
      <b>유량</b>이고, '누적 사용자', 'GPU 대기열 길이'는 <b>저량</b>이에요. 둘을 헷갈리면 오늘 같은
      오보가 나옵니다. 예를 들어 LLM 서버에 들어오는 요청이 지난주부터 줄고 있어도, 들어오는 요청이
      처리하는 속도보다 많은 동안은 <b>대기열이 계속 길어집니다</b>. 모순이 아니라 욕조의 수학이죠.
      저량 곡선의 기울기가 곧 순유량이라는 점은
      <b><PartLink :part="2" ch="ch2">2부 2장</PartLink></b>(변화율)에서 배운 "순간 변화율"을 거꾸로 읽은
      것이고, 2장에서 정식으로 다룹니다. 12부는 이렇게 이어집니다. 1장에서 시간의 모양을 만드는 네 부품,
      2~8장에서 쌓임·고리·지연·S자·평형의 수학, 9~11장에서 그림 그리는 법과 AI가 만드는 고리,
      그리고 캡스톤에서 사내 AI 도입을 모형으로 미리 돌려 봅니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="들어오는 게 줄었는데 왜 계속 늘까: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="이 실험의 '사용자 수'는 저량인가, 유량인가?"
        :choices="['저량: 어느 순간 멈추고 세어 볼 수 있는 쌓인 양', '유량: 한 달 동안의 흐름', '둘 다 아니다', '둘 다이다']"
        :answer="0"
        explanation="사용자 수는 '지금 몇 명'처럼 시간을 멈추고 셀 수 있는 쌓인 양이라 저량입니다. 가입과 이탈은 '한 달에 몇 명'처럼 시간이 붙는 흐름이라 유량이에요."
      />
      <Quiz
        difficulty="easy"
        question="가입이 정점을 지나면 사용자 수도 그 달에 정점을 찍는다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 가입 정점은 5월, 사용자 정점은 8월이었어요. 가입이 줄어도 이탈보다 많은 동안은 사용자가 계속 늘어납니다."
      />
      <Quiz
        difficulty="easy"
        question="8월의 순유량(가입 90명 − 이탈 70명)은 몇 명인가? (정수)"
        type="numeric"
        :answer="20"
        :hints="['순유량 = 유입 − 유출']"
        explanation="90 − 70 = +20명. 순유량이 +라서 8월에도 사용자 수는 20명 늘었습니다."
      />
      <Quiz
        difficulty="easy"
        question="오르던 저량이 멈추고 꺾이는 순간의 조건은?"
        :choices="['유입과 유출이 같아지는 순간', '유입이 가장 큰 순간', '유출이 0이 되는 순간', '저량이 1,000을 넘는 순간']"
        :answer="0"
        explanation="유입 = 유출이면 순유량이 0이라 저량이 늘지도 줄지도 않습니다. 그 직전까지는 늘고, 그 직후부터는 줄어요. 그래서 정점은 두 곡선이 만나는 곳에 생깁니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="9월에 사용자 수가 처음으로 줄어든 이유는?"
        :choices="['가입(60명)이 이탈(75명)보다 적어져 순유량이 −15명이 됐다', '가입이 5월보다 줄었다', '이탈이 처음 생겼다', '사용자 수가 600명을 넘어서']"
        :answer="0"
        explanation="저량의 방향은 순유량의 부호가 정합니다. 9월에 처음으로 유입 < 유출이 되어 −15명, 사용자 수가 585명으로 줄었어요."
      />
      <Quiz
        difficulty="medium"
        question="1~3월 가입은 20, 60, 100명, 이탈은 0, 5, 10명이다. 처음 사용자가 0명이면 3월 말 사용자 수는? (정수)"
        type="numeric"
        :answer="165"
        :hints="['한 달씩 쌓아 보세요: 0 + (20−0) = 20, 20 + (60−5) = 75, …']"
        explanation="20 → 75 → 165명. 가입 합 180명에서 이탈 합 15명을 뺀 것과 같습니다. 저량은 순유량을 차곡차곡 쌓은 값이에요."
      />
      <Quiz
        difficulty="medium"
        question="단위에 '/월'처럼 시간이 붙는 것은?"
        :choices="['신규 가입자 수(명/월): 유량', '전체 사용자 수(명): 저량', '대기열 길이(건): 저량', '통장 잔고(원): 저량']"
        :answer="0"
        explanation="유량은 '얼마나 빨리 흐르는가'라서 단위에 시간이 붙습니다. 저량은 '지금 얼마나 쌓였는가'라서 시간이 붙지 않아요. 단위만 봐도 둘을 구별할 수 있습니다."
      />
      <Quiz
        difficulty="medium"
        question="가입 정점(5월)과 사용자 정점(8월) 사이 석 달 동안 일어난 일로 옳은 것은?"
        :choices="['가입은 줄었지만 여전히 이탈보다 많아, 사용자 수는 계속 늘었다', '가입과 사용자 수가 함께 줄었다', '이탈이 0이었다', '사용자 수가 그대로 멈춰 있었다']"
        :answer="0"
        explanation="6월 +105, 7월 +60, 8월 +20명. 늘어나는 폭은 줄었지만 방향은 여전히 '증가'였어요. 줄어드는 것은 증가 속도이지 사용자 수가 아닙니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="AI 서비스 운영 회의: '초당 요청 수가 지난주부터 줄고 있는데, GPU 대기열은 오히려 길어졌다'. 가장 알맞은 해석은?"
        :choices="['모순이 아니다. 요청이 줄어도 도착(유입)이 처리(유출)보다 많은 동안은 대기열(저량)이 계속 길어진다', '측정 오류다', '대기열은 요청 수와 같은 곡선을 그려야 한다', 'GPU가 고장 났다는 증거다']"
        :answer="0"
        :hints="['대기열 = 저량, 도착 = 유입, 처리 = 유출로 바꿔 보세요.']"
        explanation="오늘의 욕조 문제와 똑같은 구조입니다. 대기열이 줄기 시작하는 때는 요청이 꺾일 때가 아니라 도착이 처리 속도 아래로 내려갈 때예요. 처리 속도를 올리거나 도착을 더 줄여야 대기열이 줄어듭니다."
      />
      <Quiz
        difficulty="hard"
        question="12월 말 사용자는 465명이고 12월 가입은 20명, 이탈은 65명이었다. 이 값이 그대로 계속된다고 가정하면 몇 달 뒤 사용자가 0이 되나? (소수 첫째 자리)"
        type="numeric"
        :answer="10.3"
        :tolerance="0.05"
        :hints="['매달 순유량은 20 − 65 = −45명', '465 ÷ 45 = ?']"
        explanation="465 ÷ 45 ≈ 10.3개월. 하지만 실제로는 사용자가 줄면 이탈하는 사람 수도 함께 줄어듭니다. 이탈은 '지금 사용자 중 일부'라서 사용자 수를 보고 정해지니까요. 이렇게 저량이 다시 유량을 정하는 고리가 피드백 루프이고, 1장부터 본격적으로 다룹니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('sample')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">워밍업 완료! 준비 끝!</p>
      <p class="mt-1 text-sm text-emerald-700">
        본 학습도 정확히 이렇게 진행됩니다. 다음은 1장, 큰 그림입니다.
        시간의 모양을 만드는 네 부품(저량·유량·피드백 루프·지연)을 하나씩 켜고 끄며 곡선이 어떻게 바뀌는지 봅니다.
      </p>
      <RouterLink
        to="/ch/ch1"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        1장: 큰 그림 →
      </RouterLink>
    </div>
  </article>
</template>
