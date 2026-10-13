<script setup lang="ts">
// 2장 — 욕조의 수학: 저량과 유량 (핵심). 저량 = 순유량의 누적(면적), 순유량 = 저량의 기울기.
// 적분 기호 읽기와 "2부 미분을 거꾸로". 다시 쓰는 수학: 2부 2~3장(변화율·도함수), 2부 9장, 8부 4장.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import StockFlowLab from '@/components/StockFlowLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch2')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">2장 · 약 40분 · ⭐ 핵심</p>
    <h1 class="mb-4 text-3xl font-bold">욕조의 수학 — 저량과 유량</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업에서 사용자 수가 '가입 − 이탈'을 차곡차곡 쌓은 값이라는 것을 봤습니다. 이 장에서는 그 <b>쌓기</b>를
      수학으로 정확히 다룹니다. 그래프 아래 면적, 단위로 가려내기, 적분 기호 읽기, 그리고 2부에서 배운 미분을
      거꾸로 읽는 법까지요. 12부의 모든 장이 이 장 위에 서 있습니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      두 문장을 손에 쥡니다. <b>① 저량은 순유량을 시간에 따라 쌓은 것(면적)이다. ② 순유량은 저량의 순간 변화율(기울기)이다.</b>
      두 문장이 서로 거꾸로라는 것이 미적분의 핵심 정리이고, 시스템 다이내믹스의 모든 계산이 이 위에서 돕니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 막대를 그리면 곡선이 쌓인다</h2>
    <ReviewFlag id="ch2-s1" chapter="ch2" label="1. 무대: 막대를 그리면 곡선이 쌓인다" />
    <p class="leading-relaxed text-slate-700">
      한 달을 한 칸으로 보고, 그달의 순유량(유입 − 유출)을 막대로 세워 봅시다. 막대가 위로 서면 그달 저량이 늘고,
      아래로 서면 줄어요. 막대의 <b>폭은 1개월, 높이는 '명/월'</b>이니 막대 한 칸의 넓이는
      (명/월) × (월) = <b>명</b>, 곧 그달 저량이 변한 양입니다. 단위가 곱해져서 저량의 단위가 되는 게 보이죠.
      아래 실험에서 보기를 바꾸거나 막대를 직접 끌어 보세요.
    </p>

    <StockFlowLab />

    <ConceptCard tone="tip" title="핵심 관찰: 막대의 높이는 기울기, 막대의 면적은 변화량">
      '늘어나는 유입'과 '줄어드는 유입'은 막대 면적의 합이 +390명으로 같아서 12월 말 저량도 490명으로 같습니다.
      다른 것은 <b>가는 길</b>이에요. 막대가 높은 달에는 저량 곡선이 가파르고, 낮은 달에는 완만합니다.
      <b>막대 한 칸의 높이가 그달 저량 곡선의 기울기</b>이고, <b>막대들의 면적 합이 저량의 변화량</b>입니다.
      '오르내림'에서는 막대가 +에서 −로 바뀌는 4월 말에 저량이 정점(210명)을 찍어요. 워밍업에서 본
      "정점은 유입 = 유출인 곳"과 같은 이야기입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'줄어드는 유입'(60, 55, …, 5명/월)에서 저량은 12개월 동안 어떻게 움직였나?"
      :choices="['계속 늘었지만 점점 느리게 늘었다(막대가 끝까지 +)', '6월부터 줄었다', '처음부터 줄었다', '변하지 않았다']"
      :answer="0"
      :hints="['막대가 0 아래로 내려간 달이 있나요?']"
      explanation="막대가 작아져도 +인 동안 저량은 늘어납니다. 다만 기울기(막대 높이)가 작아지니 곡선이 점점 완만해지죠. 워밍업의 '가입이 꺾여도 사용자는 는다'와 같은 모양이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 쌓기의 기호와 2부 미분 거꾸로 읽기</h2>
    <ReviewFlag id="ch2-s2" chapter="ch2" label="2. 쌓기의 기호와 2부 미분 거꾸로 읽기" />
    <p class="leading-relaxed text-slate-700">
      막대를 한 달이 아니라 아주 얇게 썰어 쌓으면 저량을 순간순간 정확히 쓸 수 있습니다. 이걸 적는 기호가 있어요.
    </p>
    <MathBlock expr="\text{저량}(t) = \text{저량}(0) + \int_0^t \big(\text{유입}(s) - \text{유출}(s)\big)\, ds" />
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      기호를 하나씩 읽어 봅시다. <b>∫</b>(인테그럴)은 S를 길게 늘인 모양으로, 합(Sum)의 S에서 왔습니다. 뜻은
      "아주 얇게 썬 조각을 <b>전부 더하라(쌓아라)</b>". 아래위의 <b>0과 t</b>는 언제부터 언제까지 쌓는지, 끝의 <b>ds</b>(디 에스)는
      아주 짧은 시간 조각의 폭이에요. s는 쌓는 동안 지나가는 시각에 붙인 이름표로, 끝 시각 t와 헷갈리지 않게 다른 글자를 씁니다.
      실험의 막대 그래프는 조각이 한 달이라 ∫ 대신 그냥 더하기(Σ, 시그마)로 쌓았던 거예요.
    </p>
    <p class="leading-relaxed text-slate-700">
      이번엔 거꾸로 읽어 봅시다. 저량 곡선의 <b>기울기</b>는 무엇일까요? 실험에서 본 대로 그 순간의 순유량입니다.
    </p>
    <MathBlock expr="\frac{d\,\text{저량}}{dt} = \text{유입} - \text{유출}" />
    <p class="mb-2 text-sm leading-relaxed text-slate-500">
      <b>d저량/dt</b>(디 저량 디 티)는 2부 3장에서 배운 도함수, 곧 "아주 짧은 순간의 변화율"입니다. 2부에서는 곡선이 주어지면
      기울기를 구했죠(미분). 여기서는 기울기(유량)가 주어지고 곡선(저량)을 쌓아 만듭니다(적분). 같은 길을 반대 방향으로 걷는 거예요.
    </p>

    <ConceptCard tone="note" title="새 용어: 적분 / 순간 변화율 / 미적분의 기본 정리 / 저량-유량도">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>적분</b> (integral, 인테그럴). 뜻: 변화율을 시간에 따라 <b>쌓는 것</b>, 그래프로는 곡선 아래 <b>면적</b>.
          이 과정의 비유로는 욕조에 물을 받는 일. 저량 = 처음 저량 + 순유량의 적분.
        </li>
        <li>
          <b>순간 변화율</b> (instantaneous rate of change). 뜻: 아주 짧은 순간 동안의 변화 속도, 2부의 <b>도함수</b>.
          저량의 순간 변화율 = 순유량.
        </li>
        <li>
          <b>미적분의 기본 정리</b> (fundamental theorem of calculus). 뜻: 쌓기(적분)와 기울기 읽기(미분)는 서로를 되돌린다.
          순유량을 쌓으면 저량이 되고, 저량의 기울기를 읽으면 순유량이 돼요.
        </li>
        <li>
          <b>저량-유량도</b> (stock and flow diagram, SFD). 뜻: 저량은 상자, 유량은 밸브 달린 파이프로 그리는 그림(1장에서 본 표기).
          인과지도(9장)와 달리 쌓이는 것과 흐르는 것을 구별해 그려서, 그대로 계산할 수 있습니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="∫ 기호는 '아주 얇게 썬 조각을 전부 더하라(쌓아라)'는 뜻이다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 합(Sum)의 S를 길게 늘인 기호예요. 막대 그래프에서 막대들을 더한 것을, 조각을 한없이 얇게 썰어 한 것이 적분입니다."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">✏️ 계산 연습: 한 달씩 쌓아 보세요</p>
    <StepQuiz
      difficulty="easy"
      question="처음 저량 100명, 1~3월 순유량이 +20, −10, +30명이다. 달마다 월말 저량을 구하세요."
      :steps="[
        { lhs: '\\text{1월 말} = 100 + 20 = ?', answer: 120 },
        { lhs: '\\text{2월 말} = 120 + (-10) = ?', answer: 110 },
        { lhs: '\\text{3월 말} = 110 + 30 = ?', answer: 140 },
      ]"
      explanation="120 → 110 → 140명. 순유량이 −인 2월에만 줄었어요. 이렇게 한 칸씩 더해 나가는 것이 저량 계산의 전부이고, 5장에서는 이 계산을 컴퓨터가 아주 잘게 반복하는 법(오일러법)을 배웁니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 저량이 하는 세 가지 일</h2>
    <ReviewFlag id="ch2-s3" chapter="ch2" label="3. 저량이 하는 세 가지 일" />
    <ul class="list-disc space-y-2 pl-5 leading-relaxed text-slate-700">
      <li>
        <b>관성</b>: 저량은 유량을 통해서만, 시간을 들여 바뀝니다. 사용자 1,000명은 결심만으로 내일 생기지 않아요.
        숙련도·신뢰·조직 문화 같은 보이지 않는 저량도 마찬가지입니다.
      </li>
      <li>
        <b>완충</b>: 저량이 있으면 유입과 유출이 매 순간 같을 필요가 없습니다. 대기열이 있어서 요청이 잠깐 몰려도
        서버가 버티고, 재고가 있어서 생산과 판매가 날마다 달라도 됩니다.
      </li>
      <li>
        <b>기억</b>: 저량은 지나간 유량의 기록이라 원인이 사라져도 결과가 한동안 남습니다. 가입 캠페인이 끝나도 늘어난
        사용자는 남아 있죠. 이 기억이 6장에서 다룰 지연의 뿌리입니다.
      </li>
    </ul>

    <DetailsCard title="➕ 더 깊이: 더 잘게 썰수록 진짜 면적에 가까워진다">
      유입이 매끄럽게 줄어드는 경우를 봅시다. t개월 시점의 순유량이 60 − 5t(명/월)라면, 진짜로 12개월 동안 쌓이는 양
      (곡선 아래 면적)은 <b>360명</b>입니다. 그런데 실험의 '줄어드는 유입'처럼 한 달을 한 칸으로 보고 매달 첫날의 값
      (60, 55, …, 5)으로 막대를 세우면 <b>390명</b>이 나와요. 각 칸에서 실제보다 조금씩 많이 셌기 때문입니다.
      칸을 반 달로 썰면 375명, 7.5일로 썰면 367.5명으로 오차가 30 → 15 → 7.5, 칸 폭을 반으로 줄일 때마다 반씩 줄어듭니다.
      칸을 한없이 얇게 썬 극한이 적분이에요(2부 2장의 극한). 컴퓨터 시뮬레이션은 칸을 아주 얇게 썰어 이 오차를 작게
      만드는데, 칸 폭을 얼마로 잡을지가 5장(오일러법과 시간 간격)의 주제입니다.
    </DetailsCard>

    <ReviewFlag id="ch2-ai" chapter="ch2" label="🤖 AI 연결: 가중치는 저량, 한 걸음은 유량" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 가중치는 저량, 한 걸음은 유량">
      모델의 가중치는 학습을 시작할 때의 값에 업데이트를 차곡차곡 쌓은 <b>저량</b>이고, 한 걸음의 업데이트
      (−학습률 × 기울기)가 <b>유량</b>입니다. 그래서 가중치는 한 번에 뒤집히지 않고 걸음이 쌓여 바뀌어요(관성).
      경사하강을 "가중치(다음) = 가중치(지금) + 업데이트"로 쓰면 오늘 계산한 "월말 저량 = 지난달 + 순유량"과 똑같은 모양이죠.
      <b><PartLink :part="8" ch="ch4">8부 4장</PartLink></b> 모멘텀의 '속도'도 기울기를 쌓는 저량입니다. 매 걸음 조금씩 새어 나가는
      욕조(β만큼 남기고 나머지는 빠짐)라고 보면 돼요. "저량의 순간 변화율 = 순유량"은
      <b><PartLink :part="2" ch="ch3">2부 3장</PartLink></b>의 도함수를 거꾸로 읽은 것입니다.
      다음 3장부터는 이 유량이 저량을 보고 정해지는 고리, 곧 피드백 루프로 들어갑니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="욕조의 수학: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="저량은 유량을 통해서만 바뀐다(한 번에 건너뛰지 않는다)."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 욕조의 물 높이는 수도꼭지와 배수구를 통해서만 변하죠. 이 성질이 저량의 관성을 만듭니다."
      />
      <Quiz
        difficulty="easy"
        question="사진 시험(시간을 멈추고 사진을 찍으면 보이는가)으로 고른 저량은?"
        :choices="['지금 대기열에 서 있는 요청 수', '한 달 동안 들어온 요청 수', '1초당 처리 속도', '하루 신규 가입 수']"
        :answer="0"
        explanation="대기열에 서 있는 요청은 멈춘 순간에도 셀 수 있으니 저량입니다. 나머지는 '얼마 동안 얼마나'라서 시간 없이는 정의되지 않는 유량이에요."
      />
      <Quiz
        difficulty="easy"
        question="단위가 '건/초'인 것은?"
        :choices="['초당 요청 수: 유량', 'GPU 대기열 길이: 저량', '사용자 수: 저량', '가중치의 값: 저량']"
        :answer="0"
        explanation="단위에 '/시간'이 붙으면 유량입니다. 대기열 길이는 '건', 사용자 수는 '명'이라 저량이에요."
      />
      <Quiz
        difficulty="easy"
        question="처음 저량 100명, 매달 순유량 +20명이 12개월 이어지면 12월 말 저량은? (정수)"
        type="numeric"
        :answer="340"
        :hints="['막대 면적의 합 = 20 × 12']"
        explanation="100 + 20 × 12 = 340명. 실험의 '일정한 유입' 보기입니다. 막대 높이가 일정하니 저량 곡선은 기울기가 일정한 직선이 돼요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="순유량 막대가 아직 +이지만 점점 낮아지고 있다. 저량은?"
        :choices="['계속 늘지만 증가 속도가 느려진다(곡선이 완만해진다)', '줄어들기 시작한다', '그 자리에 멈춘다', '더 빨리 늘어난다']"
        :answer="0"
        explanation="막대 높이는 저량 곡선의 기울기입니다. 기울기가 +이면 늘고, 작아지면 덜 가파르게 늘어요. 줄어들기 시작하는 것은 막대가 0 아래로 내려갈 때입니다."
      />
      <Quiz
        difficulty="medium"
        question="∫₀ᵗ (유입 − 유출) ds 를 말로 옮긴 것은?"
        :choices="['0부터 t까지 순유량을 아주 얇은 조각으로 썰어 전부 쌓은 양', '유입과 유출을 곱한 값', 't 시점의 순유량', '순유량의 평균']"
        :answer="0"
        explanation="∫ 는 쌓기, 0과 t는 구간, ds는 얇은 시간 조각입니다. 그래프로는 순유량 곡선 아래 면적이고, 이 양이 저량의 변화량이에요."
      />
      <Quiz
        difficulty="medium"
        question="d저량/dt = 유입 − 유출 이 말하는 것은?"
        :choices="['저량 곡선의 순간 기울기가 순유량과 같다', '저량은 유입과 유출의 곱이다', '저량은 시간이 지나면 0이 된다', '유입과 유출은 항상 같다']"
        :answer="0"
        explanation="2부 3장의 도함수를 저량에 쓴 것입니다. 쌓기(적분)의 반대 방향, 곧 기울기 읽기(미분)예요. 둘이 서로를 되돌린다는 것이 미적분의 기본 정리입니다."
      />
      <Quiz
        difficulty="medium"
        question="'오르내림' 막대(+40, +40, +20, +10, −10, −30, …)에서 저량이 가장 높은 것은 몇 월 말인가? (정수)"
        type="numeric"
        :answer="4"
        :hints="['막대가 +에서 −로 바뀌는 곳을 찾으세요.']"
        explanation="4월까지는 막대가 +라서 쌓이고, 5월부터 −라서 줄어듭니다. 그래서 4월 말(210명)이 정점이에요. 정점은 순유량이 +에서 −로 바뀌는 곳에 생깁니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="LLM 서버에 요청이 초당 120건 도착하고 100건 처리된다. 10초 동안 대기열은 어떻게 되나?"
        :choices="['200건 늘어난다(순유량 +20건/초 × 10초)', '20건 늘어난다', '그대로다', '120건 늘어난다']"
        :answer="0"
        :hints="['대기열 = 저량, 도착 = 유입, 처리 = 유출', '순유량 × 시간 = 저량의 변화']"
        explanation="순유량 +20건/초를 10초 쌓으면 (건/초) × (초) = 건, 곧 200건입니다. 단위를 곱해 보면 답의 단위가 맞는지 바로 확인할 수 있어요."
      />
      <Quiz
        difficulty="hard"
        question="'늘어나는 유입'과 '줄어드는 유입'은 12월 말 저량이 똑같이 490명이다. 그 이유로 옳은 것은?"
        :choices="['막대 면적의 합(+390명)이 같기 때문. 끝값은 순유량의 모양이 아니라 면적이 정한다', '두 막대 모양이 같기 때문', '우연이다', '처음 저량이 달라서']"
        :answer="0"
        explanation="저량의 변화량은 순유량을 쌓은 면적입니다. 가는 길(곡선이 휘는 방향)은 막대의 순서가 정하지만, 도착점은 면적의 합이 정해요. 같은 예산(면적)을 앞에 쓰느냐 뒤에 쓰느냐에 따라 중간 모양만 달라지는 셈입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch2')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">2장 완료! 욕조의 수학이 손에 잡혔습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        저량은 순유량의 면적, 순유량은 저량의 기울기. 다음은 3장입니다.
        유량이 저량을 보고 정해지는 첫 고리, 커질수록 더 빨리 커지는 강화 루프와 지수 성장을 봅니다.
      </p>
      <RouterLink
        to="/ch/ch3"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        3장: 눈덩이 →
      </RouterLink>
    </div>
  </article>
</template>
