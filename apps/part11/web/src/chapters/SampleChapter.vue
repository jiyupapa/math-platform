<script setup lang="ts">
// 워밍업 챕터 — 11부 전체가 풀 문제("일의 성공률은 걸음의 곱")를 몸으로 먼저 느낀다.
// 실제 1~12장 챕터도 이 구조를 그대로 따른다.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ChainLab from '@/components/ChainLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('sample')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">워밍업 · 25분 몸풀기</p>
    <h1 class="mb-4 text-3xl font-bold">한 번은 맞히는데 열 번은 못 맞힌다</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      본격적인 학습 전 몸풀기입니다. 앞으로 모든 챕터가 이 페이지처럼 진행돼요.
      설명 카드를 읽고, 실험을 직접 만져 보고, 문제를 풀면 진도가 채워집니다.
      막히면 <b>힌트</b>가 있고, 두 번 틀리면 <b>해설</b>도 열 수 있으니 부담 없이 시작하세요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      실험 하나로 11부 전체의 출발 질문을 얻습니다.
      <b>"한 걸음에 90%짜리 AI가 열 걸음짜리 일은 왜 35%밖에 못 해내나."</b>
      믿음직해 보이던 AI 일꾼이 긴 심부름에서 무너지는 순간을 직접 목격합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 팀에 새로 온 AI 일꾼</h2>
    <ReviewFlag id="sample-s1" chapter="sample" label="1. 무대: 팀에 새로 온 AI 일꾼" />
    <p class="leading-relaxed text-slate-700">
      팀에 AI 비서가 도입됐습니다. 한 가지씩 시켜 보면 정말 잘합니다. 자료 검색도, 표 정리도,
      메일 초안도 열에 아홉은 깔끔하죠. 자신감이 붙은 팀장님이 통째로 맡깁니다.
      <b>"주간 보고서 하나 만들어 줘"</b>. 자료 찾고, 수치 뽑고, 표 만들고, 요약하고… 속으로는
      <b>10단계짜리 일</b>입니다. 결과물은 이상하게 자주 어딘가 틀려 있습니다. 한 단계씩은
      잘하는데 왜 전체는 못 할까요? 마침 우리에겐 신의 시점이 허락된 실험실이 있습니다.
      진짜 값을 미리 알고 시작하는 이런 설정을 실무에서는 <b>참값(ground truth)을 아는
      실험</b>이라고 해요(10부에서도 같은 장치를 썼죠).
      <b>걸음 정확도를 미리 정해둔</b>(90%) AI 일꾼에게 단계 수가 다른 일을 맡겨 봅시다.
    </p>

    <ChainLab />

    <ConceptCard tone="tip" title="핵심 관찰: 일의 성공률은 걸음의 곱">
      한 걸음은 90%로 믿음직합니다(1단계 일은 20번 중 19번 성공). 그런데 <b>10단계</b> 일을
      20번 맡기면 성공은 <b>9번</b>, 절반도 안 됩니다. 이유는 뺄셈이 아니라 <b>곱셈</b>이에요:
      열 걸음을 <b>전부</b> 성공해야 하니 0.9를 열 번 곱한 <b>0.9¹⁰ ≈ 35%</b>가 일의 성공률이
      됩니다. 걸음(90%)은 훌륭한데 일(35%)은 복불복이고, 이 간극이 11부 전체를 관통하는
      첫 문장입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="걸음 정확도 90%인 AI에게 10단계 일을 20번 맡겼다. 실험 결과는?"
      :choices="['성공 9번: 절반도 안 된다 (이론값 약 35%)', '성공 18번: 걸음 정확도와 비슷하다', '20번 전부 성공', '한 번도 성공하지 못했다']"
      :answer="0"
      :hints="['랩의 ③ 20회 요약에서 초록 O 를 세어 보세요.']"
      explanation="9/20. 걸음은 90%인데 일은 절반도 못 넘습니다. 같은 실험을 누가 언제 돌려도 똑같이 나오는 결정적 시뮬레이션이에요(시드 고정)."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="sample-s2" chapter="sample" label="2. 오늘의 발견에 이름표 달기" />
    <p class="leading-relaxed text-slate-700">
      방금 목격한 현상들에는 전부 공식 이름이 있습니다. 11부 내내 쓸 첫 이름표 세 개만
      먼저 달아 두죠. 자세한 수학은 각 장에서 합니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 에이전트 / 과업 사슬 / 확률의 곱">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>에이전트</b> (agent). 뜻: 한 번 묻고 한 번 답하는 챗봇과 달리, 목표를 받아 <b>여러 단계를 스스로 계획하고
          도구를 쓰며 실행</b>하는 AI로, 이 과정의 비유로는 <b>AI 일꾼</b>입니다.
          실무에서 코딩 에이전트·업무 자동화 에이전트라고 부르는 그것이에요.
        </li>
        <li>
          <b>과업 사슬</b> (task chain). 뜻: 일을 이루는 <b>단계들의 연쇄</b>. 비유로는 <b>징검다리</b>. 돌 하나만 미끄러워도
          개울을 못 건너듯, 한 단계의 실수가 일 전체를 실패로 만듭니다.
        </li>
        <li>
          <b>확률의 곱</b> (multiplication rule). 다른 이름: 곱셈 규칙.
          뜻: 각 단계가 서로 <b>독립</b>이면 전부 성공할 확률은 각 확률을 <b>곱한 값</b>:
          0.9 × 0.9 × … (10번) ≈ 0.35. 3부 3장에서 배운 그 규칙이 에이전트의 운명을 정합니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="걸음 정확도 90%인 AI가 2단계짜리 일을 끝까지 해낼 확률은 몇 %인가? (정수)"
      type="numeric"
      :answer="81"
      :hints="['0.9 × 0.9 를 계산해 보세요.']"
      explanation="0.9 × 0.9 = 0.81 → 81%. 두 단계 모두 성공해야 하니 곱셈입니다. 단계가 늘 때마다 0.9가 한 번씩 더 곱해져요."
    />

    <DetailsCard title="➕ 더 깊이: 그래서 포기해야 하나? 되살리는 세 가지 길 예고">
      곱셈의 저주가 결론이라면 11부는 여기서 끝이겠지만, 진짜 이야기는 지금부터입니다.
      실무의 에이전트들은 세 가지 무기로 이 곱을 되살립니다. ① <b>다시 뽑기</b>(실패하면
      다시 시도, 4장) ② <b>다수결</b>(여러 답을 뽑아 투표, 5장) ③ <b>검수자</b>(다른 눈으로
      확인, 6장). 그리고 정직한 각주 하나: 오늘 실험은 각 단계를 <b>독립</b>으로 가정했지만,
      실제 에이전트의 단계들은 앞 결과가 뒤에 영향을 주며 얽혀 있습니다(같은 이유로 다수결의
      효과도 이론만큼 안 나옵니다. 5장에서 정면으로 다룹니다). 독립 가정은 출발점 모형이고,
      그 균열까지 계산에 넣는 것이 11부의 목표예요.
    </DetailsCard>

    <ReviewFlag id="sample-ai" chapter="sample" label="🤖 AI 연결: 에이전트 제품에 '사람 확인' 단계가 있는 이유" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 에이전트 제품에 '사람 확인' 단계가 있는 이유">
      코딩 에이전트가 중요한 파일을 지우기 전에 확인을 구하고, 업무 자동화 도구가 "사람 검토"
      단계를 끼워 넣는 건 겸손이 아니라 <b>오늘 본 곱셈의 수학</b> 때문입니다. 단계가 쌓일수록
      무검수 성공률은 지수적으로 깎이니까요. 확률의 곱 자체는
      <b><PartLink :part="3" ch="ch3">3부 3장</PartLink></b>(독립 사건의 곱)에서 쌓은 기초
      그대로이고, 같은 수학을 <b><PartLink :part="10" ch="ch5">10부 5장</PartLink></b>에서는
      반대 방향으로 만났습니다. 거기선 p⁸이 "능력 착시 계단"을 만들었고, 여기선 p¹⁰이
      "일 못 하는 일꾼"을 만들죠. 11부 전반(1~6장)은 이 곱을 계산하고 되살리는 기술,
      후반(7~11장)은 생각의 길이·탐색·협업·성적표, 그리고 캡스톤에서 가상 에이전트 제품의
      도입 여부를 통째로 판정합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="한 번은 맞히는데 열 번은 못 맞힌다: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="이 실험에서 AI 일꾼의 '걸음 정확도'는?"
        :choices="['90% (신의 시점에서 미리 정해 둔 값)', '35%', '실험마다 무작위로 바뀐다', '측정할 수 없다']"
        :answer="0"
        explanation="한 단계를 맞힐 확률을 90%로 미리 정해 두고(신의 시점), 단계 수에 따라 일 전체의 성공률이 어떻게 변하는지 본 것이 이 실험의 설계입니다. 현실에선 이 값을 측정으로 추정해야 하죠(11장)."
      />
      <Quiz
        difficulty="easy"
        question="한 걸음을 잘하는 AI는 열 걸음짜리 일도 그만큼 잘한다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 열 걸음을 전부 성공해야 하므로 확률이 곱해집니다. 걸음 90%가 일 35%로 깎이는 것을 실험에서 직접 봤죠."
      />
      <Quiz
        difficulty="easy"
        question="걸음 정확도 90%로 10단계 일을 해낼 이론 성공률은 약 몇 %인가? (정수로 반올림)"
        type="numeric"
        :answer="35"
        :hints="['0.9 를 10번 곱하면 0.3487…']"
        explanation="0.9¹⁰ ≈ 0.349 → 약 35%. 걸음과 일 사이의 이 간극이 11부의 출발점입니다."
      />
      <Quiz
        difficulty="easy"
        question="9단계까지 잘 왔는데 10단계에서 틀렸다. 이 일의 결과는?"
        :choices="['실패: 한 단계의 실수가 일 전체를 무너뜨린다 (징검다리)', '90% 성공으로 쳐 준다', '9단계까지는 저장된다', '다시 세면 성공이다']"
        :answer="0"
        explanation="잘못된 수치가 들어간 보고서처럼, 사슬의 한 고리가 끊기면 결과물 전체를 믿을 수 없게 됩니다. 그래서 '전부 성공'의 확률인 곱셈이 적용돼요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="'일의 성공률 = 걸음의 ___'의 빈칸에 들어갈 이 챕터의 핵심 단어는?"
        :choices="['곱', '합', '평균', '최댓값']"
        :answer="0"
        :hints="['2단계 일의 성공률을 어떻게 계산했었나요?']"
        explanation="각 단계가 독립일 때 전부 성공할 확률은 각 확률의 곱이에요. p가 1보다 작으니 곱할수록 작아지기만 합니다. 이 곱을 되살리는 세 가지 길이 4·5·6장의 주인공이에요."
      />
      <Quiz
        difficulty="medium"
        question="걸음 정확도를 90%에서 99%로 올리면 10단계 일의 성공률은 어떻게 되나?"
        :choices="['약 35% → 약 90%: 걸음의 작은 개선이 일에서는 큰 차이가 된다', '9%p 만큼만 오른다', '거의 변하지 않는다', '오히려 낮아진다']"
        :answer="0"
        :hints="['랩에서 정확도 버튼을 99%로 바꿔 보세요.']"
        explanation="0.99¹⁰ ≈ 0.904. 걸음 +9%p가 일에서는 +55%p가 됩니다. 지수의 지렛대는 양방향이라, 걸음 정확도를 올리는 투자가 긴 일일수록 크게 돌아와요."
      />
      <Quiz
        difficulty="medium"
        question="같은 90% 일꾼에게 20단계짜리 일을 맡기면 이론 성공률은?"
        :choices="['약 12% (단계가 2배면 성공률은 곱으로 또 깎인다)', '35%의 절반인 17.5%', '35% 그대로', '70%']"
        :answer="0"
        :hints="['0.9²⁰ = (0.9¹⁰)². 35%를 한 번 더 곱하면?']"
        explanation="0.9²⁰ = 0.35² ≈ 0.12. 단계 수가 더해질 때 성공률은 곱해집니다. 일이 길어질수록 지수적으로 나빠지는 이유예요."
      />
      <Quiz
        difficulty="medium"
        question="이 실험에서 '각 단계가 독립'이라는 가정의 뜻으로 가장 알맞은 것은?"
        :choices="['한 단계의 성공/실패가 다른 단계의 성공 확률에 영향을 주지 않는다', '모든 단계의 난이도가 같다', '단계 순서를 바꿔도 된다', 'AI가 혼자 일한다']"
        :answer="0"
        explanation="독립이라야 확률을 그대로 곱할 수 있습니다. 실제 에이전트는 앞 단계의 결과가 뒤 단계에 영향을 주므로(오류 전파) 이 가정은 출발점 모형이고, 그 균열은 5·9장에서 다룹니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="20회 요약에서 성공이 9번(45%)인데 이론값은 35%다. 가장 올바른 해석은?"
        :choices="['20회짜리 요약 자체가 작은 표본이라 출렁인다. 기대값(20×0.35≈7번) 근처의 우연한 변동이다', '이론 공식이 틀렸다는 증거다', '시뮬레이션에 버그가 있다', 'AI가 학습해서 점점 잘하게 된 것이다']"
        :answer="0"
        :hints="['맡긴 횟수 20번도 결국 표본입니다. 10부 워밍업에서 배운 그 교훈.']"
        explanation="한 수 위의 관찰입니다. 성공 횟수도 표본 위의 측정값이라 이론값 주위에서 출렁여요(기대 7번, 실측 9번). 측정의 ±는 10부 6장의 수학이고, 에이전트 성적표(11장)에서 그대로 다시 쓰여요."
      />
      <Quiz
        difficulty="hard"
        question="어느 에이전트 제품 광고에 '각 단계 정확도 95%!'라고 적혀 있다. 이 제품에 10단계 업무를 맡기기 전에 계산해 봐야 할 것은?"
        :choices="['0.95¹⁰ ≈ 60%: 광고의 걸음 정확도를 업무 성공률로 환산하고, 재시도·검수 같은 되살리기 설계가 있는지 확인한다', '95%가 90%보다 크니 안심하고 맡긴다', '광고 문구의 글꼴', '단계 수는 성공률과 무관하니 확인할 것이 없다']"
        :answer="0"
        :hints="['걸음 정확도 ≠ 일 성공률. 오늘 배운 곱셈을 광고 숫자에 적용해 보세요.']"
        explanation="0.95¹⁰ ≈ 0.599. 광고의 95%는 열 단계 업무에선 60%짜리입니다. 걸음 수치를 일 수치로 환산하는 습관, 그리고 그 곱을 되살리는 설계(4~6장)가 있는지 묻는 것, 그게 11부가 기르려는 눈이고 캡스톤(12장)에서 제품 자료 전체를 이 눈으로 판정합니다."
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
        "챗봇에서 에이전트로"에서 AI 일꾼의 몸(상태·행동·도구·루프)을 해부합니다.
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
