<script setup lang="ts">
// Phase 0 워밍업 챕터 — 10부 전체가 풀 문제("점수는 실력이 아니라 측정이다")를 몸으로 먼저 느낀다.
// 실제 Phase 1~10 챕터도 이 구조를 그대로 따른다.
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ScoreFlipLab from '@/components/ScoreFlipLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('sample')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">워밍업 · 25분 몸풀기</p>
    <h1 class="mb-4 text-3xl font-bold">2점 차이의 진실</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      본격적인 학습 전 몸풀기입니다. 앞으로 모든 챕터가 이 페이지처럼 진행돼요 —
      설명 카드를 읽고, 실험을 직접 만져 보고, 문제를 풀면 진도가 채워집니다.
      막히면 <b>힌트</b>가 있고, 두 번 틀리면 <b>해설</b>도 열 수 있으니 부담 없이 시작하세요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      실험 하나로 10부 전체의 출발 질문을 얻습니다 —
      <b>"벤치마크 점수는 실력이 아니라 측정이다 — 문항 수가 적으면 순위는 동전 던지기가 된다."</b>
      진짜 실력이 더 높은 모델이 시험에서 지는 순간을 직접 목격합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대 — 회사 단톡방의 그 기사</h2>
    <p class="leading-relaxed text-slate-700">
      단톡방에 기사가 하나 올라옵니다 — <b>"신모델 B, 벤치마크에서 72점… 기존 모델 A(74점)에
      2점 뒤져."</b> 누군가 답합니다. "그럼 B는 볼 것도 없네요." 정말 볼 것도 없을까요?
      이 판단을 하려면 한 가지를 알아야 합니다 — <b>그 2점은 얼마나 믿을 만한 숫자인가.</b>
      마침 우리에겐 신의 시점이 허락된 실험실이 있습니다. 진짜 실력을 <b>미리 정해둔</b>
      두 모델(A 72%, B 70%)에게 문항 수가 다른 시험을 쳐 보게 합시다.
    </p>

    <ScoreFlipLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 점수 = 실력 + 소음">
      진짜 실력은 분명 A(72%) &gt; B(70%)입니다. 그런데 <b>50문항</b> 시험을 20번 내 보면 —
      실력이 낮은 <b>B가 이기는 시험이 10번, 동점이 1번</b>. 순위가 사실상 동전 던지기죠.
      문항을 <b>1,000개</b>로 늘리면 20번 중 <b>0번</b> — 이제야 시험이 실력 순서를 안정적으로
      맞힙니다. 점수는 실력 그 자체가 아니라 <b>실력 + 소음(우연)</b>이고, 소음의 크기는
      <b>문항 수</b>가 정합니다. 이것이 10부 후반(6~9장) 전체를 관통하는 첫 문장입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="진짜 실력은 A(72%) > B(70%)였다. 실험에서 50문항 시험을 20번 냈을 때 결과는?"
      :choices="['실력이 낮은 B가 이긴 시험이 10번(동점 1번) — 순위가 절반쯤 뒤집혔다', 'A가 20번 전부 이겼다', 'B가 20번 전부 이겼다', '전부 동점이 났다']"
      :answer="0"
      :hints="['랩의 ③ 20회 요약에서 50문항을 눌러 보세요 — 빨간 칸(B승)이 몇 개인가요?']"
      explanation="50문항이면 B승 10번 + 동점 1번 — 2%p 실력 차이가 소음에 완전히 묻힙니다. 같은 실험을 누가 언제 돌려도 똑같이 나오는 결정적 시뮬레이션이에요(시드 고정)."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <p class="leading-relaxed text-slate-700">
      방금 목격한 현상들에는 전부 공식 이름이 있습니다. 10부 내내 쓸 첫 이름표 세 개만
      먼저 달아 두죠 — 자세한 수학은 각 장에서 합니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 벤치마크 / 표본 / 오차범위">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>벤치마크</b> (benchmark) — 읽는 법: 벤치마크.
          뜻: 모델의 능력을 재려고 만든 <b>문제 세트 + 채점 기준</b> — 이 과정의 비유로는
          <b>모의고사</b>입니다. 점수는 그 시험에서의 측정값일 뿐, 실력 그 자체가 아니에요.
        </li>
        <li>
          <b>표본</b> (sample) — 읽는 법: 표본.
          뜻: 전체를 다 볼 수 없어 <b>일부만 떠 본 것</b>. 시험 문항 n개는 모델이 풀 수 있는
          무한한 문제 중 n개를 뜬 국자 한 번이고, 국자가 작을수록(문항이 적을수록) 운이 크게 작용합니다.
        </li>
        <li>
          <b>오차범위</b> (margin of error) — 읽는 법: 오차범위.
          뜻: 측정값에 붙는 <b>± 불확실성 폭</b> — 선거철 여론조사의 "±3.1%p"가 바로 이것.
          랩의 ④에서 켜 본 밴드가 이것이고, 정확한 공식(<b>신뢰구간</b>이라는 정식 이름과 함께)은
          6장의 주인공입니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="문항 수를 25개에서 1,000개로 늘리면 점수의 오차범위(± 폭)는 어떻게 되나?"
      :choices="['좁아진다 — 표본이 커질수록 우연의 영향이 줄어든다', '넓어진다', '변하지 않는다', '문항 수와 오차범위는 관련이 없다']"
      :answer="0"
      :hints="['랩에서 ±밴드를 켠 채 문항 수 버튼을 바꿔 보세요.']"
      explanation="국자가 클수록 국 맛을 정확히 압니다. 랩에서 25문항의 밴드는 점수의 절반을 덮을 만큼 넓지만 5,000문항이면 ±1점 근처로 좁아지죠. 얼마나 빨리 좁아지는지(√n)는 6장에서 계산합니다."
    />

    <DetailsCard title="➕ 더 깊이: 소음은 왜 하필 √n 꼴로 줄어들까">
      3부 7장에서 만난 <b>큰 수의 법칙</b>의 재등장입니다 — 동전을 많이 던질수록 앞면 비율이
      50%에 다가가듯, 문항이 많을수록 정답률이 진짜 실력에 다가갑니다. 속도는 <b>√n</b>:
      문항을 <b>4배</b>로 늘려야 오차범위가 <b>절반</b>이 됩니다(100문항 ±9%p → 400문항 ±4.5%p).
      그래서 "±를 10배 좁히려면 문항이 100배" — 벤치마크 만들기가 비싼 이유예요. 그리고 실전
      습관 하나: 리더보드에서 점수를 보면 <b>문항 수부터 확인</b>하세요. 100문항짜리 시험의
      1~2점 차이는 오늘 실험이 보여줬듯 소음일 가능성이 큽니다.
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 리더보드의 순위는 왜 자꾸 출렁일까">
      실제 AI 리더보드에서도 오늘 본 일이 매일 벌어집니다 — 같은 모델인데 벤치마크 버전이나
      채점 방식이 조금 바뀌면 순위가 뒤집히고, 신모델 발표 기사의 "2점 향상"이 몇 주 뒤
      재평가에서 사라지기도 하죠. 이제 여러분은 그 이유를 압니다: <b>점수는 표본 위의
      측정값</b>이니까요. <b><PartLink :part="6" ch="ch9">6부 9장</PartLink></b>에서 "조련이
      잘 됐는지 어떻게 아나"를 배웠다면, 10부는 그 성적표를 <b>얼마나 믿을 수 있는지</b>를
      계산하는 과정입니다 — 전반(1~5장)은 "키우면 얼마나 좋아지나"의 법칙, 후반(6~9장)은
      오늘 만난 소음을 다루는 통계(<b><PartLink :part="3" ch="ch8">3부 8장</PartLink></b>의
      신뢰구간이 드디어 회수됩니다), 그리고 캡스톤에서 AI 뉴스를 통째로 팩트체크합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="2점 차이의 진실 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="이 실험에서 두 모델의 '진짜 실력'은?"
        :choices="['A 72%, B 70% — A가 2%p 높게 미리 정해 두었다', '둘 다 똑같이 70%', 'A 70%, B 72%', '실험마다 무작위로 바뀐다']"
        :answer="0"
        explanation="신의 시점에서 실력을 미리 정해 두고(A 72 > B 70) 시험이 그 순서를 맞히는지 본 것이 이 실험의 설계입니다. 현실에선 이 값을 아무도 모르고, 시험으로 추정할 뿐이죠."
      />
      <Quiz
        difficulty="easy"
        question="벤치마크 점수는 모델의 진짜 실력 그 자체다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 점수 = 실력 + 소음(표본 오차) — 문항이라는 표본 위에서 잰 측정값이에요. 같은 실력이라도 시험마다 점수가 출렁입니다."
      />
      <Quiz
        difficulty="easy"
        question="실험에서 1,000문항 시험을 20번 냈을 때, 실력이 낮은 B가 이긴 횟수는?"
        type="numeric"
        :answer="0"
        explanation="0번 — 문항이 충분하면 소음이 실력 차(2%p)보다 작아져 순위가 안정됩니다. 50문항에선 10번이나 뒤집혔던 것과 대조해 보세요."
      />
      <Quiz
        difficulty="easy"
        question="문항 수가 적은 시험일수록 점수에서 커지는 것은?"
        :choices="['우연(소음)의 영향 — 오차범위', '진짜 실력', '문제의 난이도', '채점 시간']"
        :answer="0"
        explanation="작은 국자일수록 어떤 건더기가 떠지느냐(어떤 문항이 걸리느냐)에 점수가 크게 좌우됩니다 — 그 출렁임의 폭이 오차범위예요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="'점수 = 실력 + ___' — 빈칸에 들어갈 이 챕터의 핵심 단어는?"
        :choices="['소음(표본 오차)', '노력', '운영비', '파라미터 수']"
        :answer="0"
        :hints="['같은 실력인데 시험마다 점수가 달라졌던 이유를 떠올려 보세요.']"
        explanation="점수는 실력에 표본의 우연이 더해진 측정값입니다. 10부 후반은 이 소음의 크기를 계산하고(6장), 소음을 뚫고 진짜 차이를 판정하는(7장) 기술이에요."
      />
      <Quiz
        difficulty="medium"
        question="50문항 시험에서 순위가 절반쯤 뒤집힌 근본 이유는?"
        :choices="['문항 하나하나가 확률적이라, 표본이 작으면 우연의 출렁임(±10%p대)이 실력 차(2%p)를 압도해서', '모델 B가 50문항 시험에만 강해서', '채점이 잘못돼서', '진짜 실력이 시험마다 바뀌어서']"
        :answer="0"
        :hints="['실력 차이는 고작 2%p — 50문항의 오차범위 밴드는 몇 %p였나요?']"
        explanation="50문항의 오차범위는 ±12%p 안팎 — 재려는 차이(2%p)보다 소음이 6배쯤 큽니다. 자의 눈금보다 작은 것을 재려 한 셈이죠."
      />
      <Quiz
        difficulty="medium"
        question="선거철 여론조사의 '±3.1%p'와 벤치마크 점수의 오차범위가 공유하는 원리는?"
        :choices="['둘 다 일부(표본 — 유권자 1,000명 / 문항 n개)만 보고 전체를 추정할 때 생기는 ± 불확실성이다', '둘 다 조사 기관의 실수에서 나온다', '여론조사는 통계지만 벤치마크는 통계가 아니다', '둘 다 표본을 늘려도 줄지 않는다']"
        :answer="0"
        explanation="유권자 전부에게 물을 수 없어 1,000명을 뽑듯, 가능한 모든 문제를 낼 수 없어 n문항을 냅니다 — 같은 표본 추출의 수학이고, 그래서 같은 ± 공식(6장)을 씁니다."
      />
      <Quiz
        difficulty="medium"
        question="랩에서 ±밴드를 켰더니 두 모델의 밴드가 크게 겹쳐 있었다. 올바른 해석은?"
        :choices="['이번 점수 차이는 오차범위 안 — 우연(소음)일 수 있어 이것만으로 우열을 단정할 수 없다', '두 모델의 실력이 정확히 같다는 뜻이다', '점수가 높은 쪽이 무조건 더 강하다는 뜻이다', '밴드가 겹치면 시험이 무효가 된다']"
        :answer="0"
        :hints="['겹침 = 차이가 소음 범위 안일 수 있다는 뜻 — “같다”고 단정하는 것도 아닙니다.']"
        explanation="겹침은 '단정 금지' 신호이지 '같음'의 증명이 아닙니다 — 차이가 진짜인지 가리는 정식 판정법(검정)은 7장에서 배웁니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="20회 요약에서 25문항의 B승은 6번인데 50문항은 10번 — 문항이 늘었는데 뒤집힘이 더 많아졌다. 가장 올바른 해석은?"
        :choices="['“20번 다시 채점” 자체가 작은 표본이라 요약 숫자도 출렁인다 — 큰 흐름(1,000문항부터 0번)이 본질이다', '문항이 늘수록 뒤집힘도 늘어난다는 법칙이 있다', '25문항 시험이 50문항보다 정확하다는 뜻이다', '시뮬레이션에 버그가 있다는 뜻이다']"
        :answer="0"
        :hints="['방금 배운 교훈을 요약 숫자 자체에도 적용해 보세요 — 20회도 결국 표본입니다.']"
        explanation="한 수 위의 관찰입니다 — 뒤집힘 횟수(x/20)도 20회짜리 표본 위의 측정값이라 출렁여요. 이론상 기대 뒤집힘은 25문항 ≈ 44%, 50문항 ≈ 41%로 비슷한 수준이고, 진짜 구조(문항 ↑ → 뒤집힘 ↓)는 250 → 1,000문항에서 뚜렷해집니다."
      />
      <Quiz
        difficulty="hard"
        question="단톡방 시나리오로 돌아가서 — '신모델 B, 벤치마크 2점 열세' 기사만으로 결론 내리기 전에 확인해야 할 것으로 가장 알맞은 것은?"
        :choices="['그 벤치마크의 문항 수(오차범위)와, 그 2점이 오차범위를 넘는 차이인지 — 즉 소음인지 진짜인지', '기사에 실린 모델 이름의 어감', '두 회사의 주가', '점수를 발표한 요일']"
        :answer="0"
        :hints="['오늘 실험에서 2점 차이는 몇 문항부터 믿을 만해졌나요?']"
        explanation="오늘 실험이 그대로 답입니다 — 50문항의 2점은 동전 던지기, 1,000문항의 2점은 유의미했죠. 문항 수를 확인하고 오차범위와 비교하는 것, 그게 10부가 기르려는 눈이고 캡스톤(10장)에서 기사 전체를 이 눈으로 팩트체크합니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('sample')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">워밍업 완료 — 준비 끝!</p>
      <p class="mt-1 text-sm text-emerald-700">
        본 학습도 정확히 이렇게 진행됩니다. 다음은 1장 — 큰 그림,
        "키우면 좋아진다, 그런데 얼마나?"에서 훈련의 3재료(N·D·C) 지도를 폅니다.
      </p>
      <RouterLink
        to="/ch/ch1"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        1장 — 큰 그림 →
      </RouterLink>
    </div>
  </article>
</template>
