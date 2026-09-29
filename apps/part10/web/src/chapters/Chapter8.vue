<script setup lang="ts">
// 8장 — 기출 유출: 오염(contamination)과 벤치마크의 수명. 소음(6·7장) 다음의 적 — 편향.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ContaminationLab from '@/components/ContaminationLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch8')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">8장 · 시험의 통계</p>
    <h1 class="mb-4 text-3xl font-bold">기출 유출 — 오염과 벤치마크의 수명</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      6·7장의 도구로 무장했으니 이제 안심일까요? 시나리오 하나. "신모델, 유명 벤치마크에서
      +17점 도약!" 문항 수도 넉넉하고 p값도 좋아서 <b>통계적으로는 흠잡을 데가 없습니다.</b>
      그런데도 이 점수는 가짜일 수 있어요. 수능 전날 기출문제와 답이 학원가에 돌았다면,
      다음 날 만점은 실력일까요? 시험 자체가 새는 문제, <b>오염</b>입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      점수의 공식을 한 번 더 업그레이드합니다. <b>점수 = 실력 + 소음 + 편향(오염)</b>.
      오염이 점수를 부풀리는 구조를 다이얼로 재현하고, <b>변형 시험과의 낙차로 오염률을
      역산</b>하는 탐정의 산수, 그리고 점수 급등의 <b>의심 목록 4종</b>을 가져갑니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 시험 문제가 교과서에 실려 있었다면</h2>
    <ReviewFlag id="ch8-s1" chapter="ch8" label="1. 무대: 시험 문제가 교과서에 실려 있었다면" />
    <p class="leading-relaxed text-slate-700">
      어떻게 유출될까요? 대개 <b>일부러가 아닙니다.</b> 6부 3장에서 봤듯 LLM의 훈련 데이터는
      웹에서 옵니다. 그런데 공개 벤치마크의 문제와 정답, 해설 블로그, 깃허브의 평가 코드가
      전부 웹에 있어요. 크롤러가 그걸 쓸어 담으면 모델은 <b>시험 범위가 아니라 시험지
      자체</b>를 공부한 셈이 됩니다. 신의 시점 실험으로 그 효과를 재 봅시다.
      진짜 실력 60%짜리 모델에게 시험 문항을 조금씩 유출해 보겠습니다.
    </p>

    <ContaminationLab />

    <ConceptCard tone="tip" title="핵심 관찰: 오염은 오차범위에 안 잡힌다">
      오염률 40%면 관측 점수 74점으로, 진짜 실력(60)보다 <b>14점 부풀지만</b>, 변형판과
      신규 문제에선 도로 60점입니다. 여기서 결정적인 사실: 이 부풀림은 <b>소음이 아니라
      편향</b>이에요. 소음(6장)은 문항을 늘리면 √n으로 줄어들지만, <b>편향은 문항을
      100만 개로 늘려도 그대로</b>입니다. 오차범위·p값이 아무리 좋아도 못 걸러내죠.
      대신 지문이 남습니다: <b>변형 시험과의 낙차 Δ = 오염률 × 35%p</b>.
      낙차가 오염률을 자백합니다(Δ 14%p ÷ 35 = 40%).
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="오염으로 부풀려진 점수는 문항 수를 크게 늘리면 정상으로 돌아온다."
      type="truefalse"
      :answer="1"
      :hints="['소음과 편향의 차이: √n이 줄여주는 건 어느 쪽이었나요?']"
      explanation="거짓입니다. 문항을 늘리면 소음(출렁임)만 줄어들 뿐, 유출 문항의 비율 f가 그대로면 부풀림 f×35%p도 그대로입니다. 편향은 오차범위의 사각지대예요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 이름표 달기: 오염의 언어</h2>
    <ReviewFlag id="ch8-s2" chapter="ch8" label="2. 이름표 달기: 오염의 언어" />

    <ConceptCard tone="note" title="새 용어: 오염 / 홀드아웃 / 벤치마크 수명">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>오염</b> (contamination). 읽는 법: 컨태미네이션. 비유: <b>기출 유출</b>.
          뜻: 평가용 문항(또는 그 변형·해설)이 훈련 데이터에 섞여, 점수가 실력이 아니라
          <b>암기</b>를 재게 되는 것. 점수를 위로만 미는 <b>체계적 편향</b>입니다.
        </li>
        <li>
          <b>홀드아웃</b> (held-out set). 읽는 법: 헬드아웃. 비유: <b>비공개 문제 금고</b>.
          뜻: 훈련이 절대 볼 수 없게 따로 잠가 둔 평가 문항. 오염을 원천 차단하는 표준
          장치입니다(8부 7장에서 과적합을 잡던 검증 데이터와 같은 철학).
        </li>
        <li>
          <b>벤치마크 수명</b> (benchmark lifetime). 읽는 법: 벤치마크 라이프타임.
          뜻: 공개된 벤치마크는 <b>공개되는 순간부터</b> 웹에 퍼지며 오염이 누적되고,
          시간이 갈수록 점수가 실력과 무관하게 인플레이션됩니다. 그래서 시험은 늙고,
          갱신이 필요해요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <StepQuiz
      question="오염률 40%일 때 관측 점수를 단계별로 계산해 보세요 (유출 문항 95% 정답, 나머지는 진짜 실력 60%)."
      :steps="[
        { lhs: '0.4 \\times 95 = ?', answer: 38 },
        { lhs: '0.6 \\times 60 = ?', answer: 36 },
        { lhs: '\\text{관측 점수} = 38 + 36 = ?', answer: 74 },
      ]"
      explanation="74점. 진짜 실력보다 14점 부풀었습니다. 거꾸로 변형 시험(60점)과의 낙차 14를 35로 나누면 오염률 40%가 역산되죠."
    />

    <DetailsCard title="➕ 더 깊이: 실무의 탐지 도구와 수명 관리">
      <b>탐지</b>: 실무에선 훈련 데이터와 벤치마크의 <b>겹침을 문자열 수준에서 검사</b>
      (n-gram 중복 검색)하고, 일부 벤치마크는 <b>카나리 문자열</b>(일부러 심어 둔 고유 표식)을
      넣어 모델이 그걸 알고 있으면 오염으로 판정합니다. "문항의 앞부분을 주고 이어 쓰게 했을 때
      <b>정답 보기까지 줄줄 암송</b>하면" 강력한 신호죠. <b>수명 관리</b>: 프라이빗
      홀드아웃(주최 측만 보유), 정기적으로 새 문제를 추가하는 <b>라이브 벤치마크</b>,
      최신 뉴스·문서 기반의 신선한 출제(훈련 컷오프 이후 자료) 같은 장치가 쓰입니다.
      우리 실험의 "역산"도 실제 기법의 축소판이에요. 원본 대비 <b>변형판 점수 낙차</b>로
      암기 의존도를 재는 연구들이 실제로 있습니다(숫자를 바꾼 수학 문제, 이름을 바꾼
      독해 문제에서 점수가 뚝 떨어지는 모델들이 보고됐죠).
    </DetailsCard>

    <ReviewFlag id="ch8-ai" chapter="ch8" label="🤖 AI 연결: 점수 급등의 의심 목록 4종 (캡스톤 체크리스트 3호)" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 점수 급등의 의심 목록 4종 (캡스톤 체크리스트 3호)">
      "점수 도약" 발표를 보면 이 넷을 확인하세요. ① <b>불균형 급등</b>: 특정 벤치마크만
      튀고 유사 과제는 제자리인가? ② <b>변형 취약</b>: 문제를 살짝 바꾼 시험(또는 신선한
      홀드아웃)에서도 유지되는가? ③ <b>시점</b>: 그 벤치마크 공개일이 모델 훈련 데이터
      컷오프보다 앞서는가? ④ <b>암송</b>: 문항을 이어 쓰게 하면 정답까지 외워 나오는가?
      훈련 데이터가 어떻게 만들어지는지는 <b><PartLink :part="6" ch="ch3">6부 3장</PartLink></b>,
      평가 설계의 기본기는 <b><PartLink :part="6" ch="ch9">6부 9장</PartLink></b>에서 쌓은
      그대로입니다. 다음 장은 채점자마저 AI일 때 생기는 편향, <b>LLM 심판</b>입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="기출 유출: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="벤치마크 오염(contamination)의 뜻은?"
        :choices="['평가용 문항이나 그 해설이 훈련 데이터에 섞여 점수가 암기를 재게 되는 것', '시험지가 물리적으로 더러워진 것', '문항 수가 부족한 것', '채점 기준이 엄격한 것']"
        :answer="0"
        explanation="기출 유출이에요. 시험 범위가 아니라 시험지 자체를 공부한 상태입니다. 점수를 위로만 미는 체계적 편향이에요."
      />
      <Quiz
        difficulty="easy"
        question="오염은 대부분 어떻게 일어나나?"
        :choices="['일부러가 아니라, 공개 벤치마크·해설이 웹에 있고, 훈련 데이터가 웹 크롤에서 오기 때문에 섞여 들어간다', '해커가 침입해서', '채점자가 실수해서', '모델이 스스로 시험지를 찾아가서']"
        :answer="0"
        explanation="6부 3장의 훈련 데이터 이야기와 만나는 지점이에요. 웹에 공개된 것은 언젠가 훈련 데이터가 됩니다. 그래서 벤치마크는 공개 순간부터 늙기 시작해요."
      />
      <Quiz
        difficulty="easy"
        question="실험에서 오염률 100%일 때 관측 점수는? (유출 문항 정답률 95%)"
        type="numeric"
        :answer="95"
        explanation="전 문항이 유출이면 점수는 암기 정답률 그대로 95점. 진짜 실력 60%와 35점 차이의 완전한 허수가 됩니다."
      />
      <Quiz
        difficulty="easy"
        question="'홀드아웃'(비공개 문제 금고)의 역할은?"
        :choices="['훈련이 절대 볼 수 없는 평가 문항을 따로 잠가 둬 오염을 원천 차단', '문항을 더 어렵게 만드는 것', '점수를 보정해 주는 공식', '훈련 데이터를 늘리는 방법']"
        :answer="0"
        explanation="8부 7장에서 과적합을 잡던 검증 데이터와 같은 철학이에요. 공부한 적 없는 문제로만 실력을 잰다는 원칙입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="점수의 공식이 '실력 + 소음 + 편향(오염)'으로 업그레이드됐다. 소음과 편향의 결정적 차이는?"
        :choices="['소음은 문항 수를 늘리면 √n으로 줄지만, 편향은 아무리 늘려도 그대로다', '소음이 항상 더 크다', '편향은 좋은 것이고 소음은 나쁜 것', '차이가 없다']"
        :answer="0"
        explanation="오차범위·p값(6·7장)은 소음 전용 도구입니다. 통계적으로 완벽한 점수도 오염이면 가짜일 수 있는 이유예요."
      />
      <Quiz
        difficulty="medium"
        question="기존 벤치마크 81점, 변형판 60점인 모델의 오염률 추정은? (낙차 ÷ 35)"
        :choices="['약 60% (Δ = 21%p ÷ 35)', '약 21%', '약 81%', '추정 불가']"
        :answer="0"
        :hints="['낙차 Δ = 81 − 60 = 21.']"
        explanation="21 ÷ 35 = 0.6, 곧 문항 열에 여섯이 유출됐다는 추정입니다. 낙차가 오염률을 자백하는 탐정의 산수죠."
      />
      <Quiz
        difficulty="medium"
        question="오염을 의심하게 하는 신호가 아닌 것은?"
        :choices="['모든 유사 과제에서 고르게, 신선한 홀드아웃에서도 똑같이 점수가 오른 경우', '특정 벤치마크만 불균형하게 급등', '문제를 살짝 변형하면 점수 급락', '문항 앞부분을 주면 정답까지 암송']"
        :answer="0"
        :hints="['의심 목록 4종의 반대 사례를 찾는 문제입니다.']"
        explanation="신선한 문제에서도 유지되는 고른 향상이야말로 진짜 실력의 모습입니다. 나머지 셋은 전부 암기의 지문이에요."
      />
      <Quiz
        difficulty="medium"
        question="'벤치마크 수명'이라는 말이 성립하는 이유는?"
        :choices="['공개 순간부터 웹에 퍼져 훈련 데이터로 흘러들며 오염이 누적되고, 점수가 실력과 무관하게 인플레이션되므로', '문항 종이가 낡아서', '채점 서버가 오래되면 느려져서', '유행이 지나면 문제가 쉬워져서']"
        :answer="0"
        explanation="그래서 최신 모델들의 옛 벤치마크 고득점은 해석에 주의가 필요하고, 라이브 벤치마크·정기 갱신·프라이빗 홀드아웃 같은 수명 관리 장치가 쓰입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="신모델이 [기존 벤치마크 88점 / 변형판 65점 / 신규 홀드아웃 63점]을 받았다. 가장 정확한 판정은?"
        :choices="['낙차 ~23~25%p: 강한 오염 신호. 진짜 실력은 60대 초중반으로 추정, 88점 홍보는 걸러 들어야', '88점이 최고 기록이니 실력도 88', '세 시험의 평균 72가 실력', '변형판이 잘못 출제된 것']"
        :answer="0"
        :hints="['암기가 통하지 않는 두 시험이 입을 모아 말하는 값은?']"
        explanation="변형판과 홀드아웃이 60대 초중반으로 일치하고, 이 점수가 실력의 정직한 추정치입니다. 낙차 23~25%p는 오염률 65~70% 수준의 강한 지문이에요."
      />
      <Quiz
        difficulty="hard"
        question="6~8장을 종합한 '점수 감정 절차'로 가장 올바른 순서는?"
        :choices="['문항 수로 오차범위 확인(6장) → 같은 문항으로 짝지은 비교·p값으로 차이 판정(7장) → 그래도 남는 급등은 변형·홀드아웃·시점·암송으로 오염 검사(8장)', '점수가 높으면 바로 채택', '오염 검사만 하면 통계는 필요 없다', 'p값만 보면 충분하다']"
        :answer="0"
        explanation="소음 검사(통계)와 편향 검사(오염)는 서로 대체가 아니라 직렬입니다. 둘 다 통과해야 '진짜 향상'. 캡스톤 팩트체크가 정확히 이 순서로 갑니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch8')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">8장 완료! 점수의 공식이 완성됐습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        실력 + 소음 + 편향. 다음은 9장, AI 채점관의 성적표입니다. 채점자마저 AI일 때 생기는
        위치·길이·자기 선호 편향을 직접 심어 보고, 심판을 감정하는 법(3부 10장 상관)을 배웁니다.
      </p>
      <RouterLink
        to="/ch/ch9"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        9장: AI 채점관의 성적표 →
      </RouterLink>
    </div>
  </article>
</template>
