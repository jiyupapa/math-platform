<script setup lang="ts">
// 10장 — 되풀이되는 이야기: 시스템 원형. 성장의 한계·문제 전가·실패하는 처방·목표 침식·공유지의 비극·부익부를
// 구조(인과지도)·행동(시뮬레이션)·처방(레버리지)으로 익힌다. 다시 쓰는 수학: 3·4·6·7장의 루프 조합, 11부 6장(굿하트).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ArchetypeLab from '@/components/ArchetypeLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch10')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">10장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">되풀이되는 이야기 — 시스템 원형</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      강화 루프, 균형 루프, 지연. 이 부품들을 조합한 구조 가운데 조직과 사회에서 판박이처럼 되풀이되는 것들이 있습니다.
      회사도 사람도 다른데 이야기의 줄거리가 늘 같은 거예요. 이런 구조에 붙인 이름이 <b>시스템 원형</b>입니다. 원형을 알아보면
      "아, 이번에도 그 이야기구나" 하고 어디를 고쳐야 할지 빨리 찾을 수 있어요. 이 장에서는 대표적인 여섯 개를 AI 도입 장면으로 만나 봅니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"사례를 보고 원형을 알아보고, 원형을 보고 레버리지를 찾는다."</b> 여섯 원형의 구조(인과지도)와 행동(시뮬레이션)과
      처방(어디를 건드릴지)을 짝지어 익히고, 숫자보다 구조를 바꿔야 효과가 크다는 레버리지 포인트의 교훈을 익힙니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 여섯 개의 판박이 이야기</h2>
    <ReviewFlag id="ch10-s1" chapter="ch10" label="1. 무대: 여섯 개의 판박이 이야기" />
    <p class="leading-relaxed text-slate-700">
      원형마다 실제로 있을 법한 AI 도입 이야기, 그 구조를 그린 인과지도, 두세 가지 정책을 비교한 시뮬레이션, 그리고 처방이 붙어 있습니다.
      인과지도에서 루프의 종류(R/B)와 지연(∥)이 어디 있는지 먼저 찾고, 그래프에서 그 구조가 만드는 모양을 확인해 보세요.
    </p>

    <ArchetypeLab />

    <ConceptCard tone="tip" title="핵심 관찰: 단기에 좋아 보이는 길과 장기에 좋은 길이 다르다">
      여섯 원형의 공통점은 <b>당장 눈에 보이는 결과와 나중에 드러나는 결과가 다르다</b>는 것입니다. 빠른 처방은 석 달 만에 증상을 30 → 18로
      줄였지만 역량을 깎아 27로 되돌아갔고, 실패하는 처방은 6개월 만에 문제를 13.6건으로 줄였다가 4년 뒤 65건(처방 안 할 때 40건)으로 키웠어요.
      대부분 사이에 <b>지연</b>이 끼어 있어서, 좋은 결과가 먼저 오고 나쁜 결과가 늦게 옵니다. 그래서 처방도 구조에 있어요.
      지연을 보이게 하고, 숨은 고리를 끊거나 보태는 것입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'AI가 쓴 보고서 초안을 검토 없이 쓰다 보니 직원들이 직접 다듬는 실력이 줄었고, 그래서 AI에 더 기대게 됐다.' 어떤 원형인가?"
      :choices="['문제 전가(빠른 처방이 근본 역량을 깎음)', '성장의 한계', '공유지의 비극', '부익부']"
      :answer="0"
      :hints="['빠른 처방과 근본 처방, 그리고 빠른 처방의 부작용을 찾아보세요.']"
      explanation="빠른 처방(AI가 대신)이 증상을 덮는 사이 근본 처방의 저량(직원 역량)이 줄어드는 구조, 문제 전가입니다. 의존이라는 강화 루프가 숨어 있어요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="ch10-s2" chapter="ch10" label="2. 오늘의 발견에 이름표 달기" />
    <ConceptCard tone="note" title="새 용어: 시스템 원형 여섯 개 / 레버리지 포인트">
      <p class="mb-2 text-sm leading-relaxed">
        <b>시스템 원형</b> (system archetype). 뜻: 여러 분야에서 되풀이되는 피드백 구조의 표준형. 피터 센게의 『제5경영』(1990)이 널리 알렸습니다.
        국내 표기가 책마다 달라 영어 이름을 함께 기억하는 게 좋아요.
      </p>
      <ul class="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
        <li><b>성장의 한계</b> (Limits to Growth): 강화 루프가 균형 루프(한계)를 만나 멈춤. 7장의 S자.</li>
        <li><b>문제 전가</b> (Shifting the Burden): 빠른 처방이 증상을 덮는 사이 근본 해결 능력이 약해짐.</li>
        <li><b>실패하는 처방</b> (Fixes that Fail): 처방의 부작용이 지연을 두고 돌아와 문제를 키움.</li>
        <li><b>목표 침식</b> (Eroding Goals): 격차를 성과가 아니라 목표를 내려 메움. 목표의 후퇴라고도 해요.</li>
        <li><b>공유지의 비극</b> (Tragedy of the Commons): 각자 합리적인 사용이 공용 자원을 고갈시킴.</li>
        <li><b>부익부</b> (Success to the Successful): 앞선 쪽에 자원이 몰려 작은 차이가 큰 차이가 됨. 성공한 쪽에 몰아주기라고도 해요.</li>
      </ul>
      <p class="mt-2 text-sm leading-relaxed">
        <b>레버리지 포인트</b> (leverage point, 지렛점). 뜻: 작은 힘으로 시스템의 행동을 크게 바꿀 수 있는 자리.
      </p>
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 어디를 건드려야 하나: 숫자보다 구조</h2>
    <ReviewFlag id="ch10-s3" chapter="ch10" label="3. 어디를 건드려야 하나: 숫자보다 구조" />
    <p class="leading-relaxed text-slate-700">
      시스템 사고를 널리 알린 도넬라 메도즈(Donella Meadows)는 시스템에 손을 대는 자리들을 효과 순으로 정리하면서, 사람들이 가장 먼저 손대는
      <b>숫자(매개변수)</b>가 대개 가장 약한 지렛대라고 지적했습니다. 더 센 지렛대는 <b>구조</b> 쪽에 있어요. 고리를 보태거나 끊는 것,
      지연을 줄이는 것, 정보가 누구에게 언제 가는지 바꾸는 것, 규칙과 목표를 바꾸는 것. 실험에서도 그랬습니다.
    </p>
    <ul class="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-slate-700">
      <li>성장의 한계: 성장률을 두 배로(숫자) 해도 천장은 그대로, <b>한계를 넓히자</b>(구조) 결과가 바뀌었다.</li>
      <li>공유지의 비극: 각자 덜 쓰자는 호소보다 <b>총량 규칙</b>과 자원 상태 공개(정보 흐름)가 효과가 있었다.</li>
      <li>목표 침식: 노력을 더 하자는 다짐보다 <b>목표를 바깥 기준에 묶는 것</b>(목표)이 미끄러짐을 막았다.</li>
      <li>부익부: 성과를 더 정확히 재는 것보다 <b>기본 몫 보장</b>(규칙)이 B 팀을 살렸다.</li>
    </ul>

    <DetailsCard title="➕ 더 깊이: 원형은 몇 개일까">
      책마다 원형의 수와 이름이 조금씩 다릅니다. 센게의 책에는 이 여섯 말고도 확전(Escalation, 두 경쟁자가 서로를 보고 계속 판을 키움),
      성장과 투자 부족(Growth and Underinvestment, 한계를 넓힐 투자를 미루다 성장이 꺾임) 등이 있어요. 연구자들은 원형들이 결국 몇 가지 핵심
      구조로 묶인다고 정리하기도 합니다(예: Wolstenholme, 2003). 중요한 것은 목록을 외우는 게 아니라, 강화·균형·지연이라는 부품으로 어떤
      이야기든 그려 보고 "단기와 장기가 어긋나는 곳"을 찾는 습관이에요. 원형은 그 습관을 빨리 시작하게 해 주는 견본입니다.
    </DetailsCard>

    <ReviewFlag id="ch10-ai" chapter="ch10" label="🤖 AI 연결: AI 도입에서 자주 보이는 원형들" />
    <ConceptCard tone="ai" title="🤖 AI 연결: AI 도입에서 자주 보이는 원형들">
      AI 도입은 원형의 보물창고입니다. <b>문제 전가</b>는 업무를 AI에 맡기는 동안 사람의 검토 역량이 줄어드는 위험으로, 자동화에 대한 과신
      (automation complacency)이나 숙련 저하(deskilling)라는 이름으로 연구돼요. <b>목표 침식</b>의 사촌으로는 굿하트의 법칙("지표가 목표가
      되면 좋은 지표이길 멈춘다")이 있습니다. 목표를 내리는 대신, 목표를 재는 지표만 맞추는 쪽으로 미끄러지는 거예요. 검수 점수만 통과하는 답이 진화하는
      <b><PartLink :part="11" ch="ch6">11부 6장</PartLink></b>의 이야기, 벤치마크가 훈련 데이터에 섞여 수명을 다하는
      <b><PartLink :part="10" ch="ch8">10부 8장</PartLink></b>의 오염이 같은 계열이에요. <b>공유지의 비극</b>은 공용 GPU·API 한도에서,
      <b>부익부</b>는 먼저 성과를 낸 팀에 예산이 몰리는 시범 사업에서, <b>성장의 한계</b>는 데이터 플라이휠에서 자주 봅니다(7장).
      다음 11장에서는 AI 모델 자체가 만드는 고리들(모델 붕괴·보상 해킹)을 정면으로 다룹니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="시스템 원형: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="입소문 홍보를 두 배로 늘렸는데 사용자 수가 같은 높이에서 멈췄다. 어떤 원형인가?"
        :choices="['성장의 한계', '부익부', '목표 침식', '실패하는 처방']"
        :answer="0"
        explanation="성장 엔진(강화 루프)을 더 밀어도 한계(균형 루프)가 같으면 같은 천장에 더 빨리 닿을 뿐입니다."
      />
      <Quiz
        difficulty="easy"
        question="빠른 처방이 증상을 덮는 사이 근본 해결 능력이 약해지는 구조는?"
        :choices="['문제 전가', '공유지의 비극', '성장의 한계', '부익부']"
        :answer="0"
        explanation="빠른 처방의 부작용이 근본 처방의 저량(역량)을 깎는 것이 문제 전가의 핵심입니다."
      />
      <Quiz
        difficulty="easy"
        question="시스템 원형은 되풀이되는 구조의 판박이라, 알아보면 처방을 빨리 찾을 수 있다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 등장인물은 달라도 구조가 같으면 행동도 처방도 비슷해요."
      />
      <Quiz
        difficulty="easy"
        question="목표를 못 맞추자 목표를 조금씩 내리는 구조는?"
        :choices="['목표 침식', '성장의 한계', '공유지의 비극', '문제 전가']"
        :answer="0"
        explanation="격차를 성과를 올려서가 아니라 목표를 내려서 메우는 두 번째 균형 루프가 있는 구조입니다. 목표와 성과가 함께 미끄러져요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="두 팀이 공용 GPU 크레딧을 각자 자기 일만 보고 늘려 쓰다 둘 다 못 쓰게 됐다. 어떤 원형인가?"
        :choices="['공유지의 비극', '부익부', '목표 침식', '실패하는 처방']"
        :answer="0"
        explanation="각자의 강화 루프(쓸수록 이익)가 공용 자원이라는 균형 루프를 늦게 보게 되는 구조입니다. 실험에서는 2년 안에 자원이 바닥났어요."
      />
      <Quiz
        difficulty="medium"
        question="'검수 점수가 올라가자 검수만 통과하는 답이 늘었다'를 가장 잘 설명하는 것은?"
        :choices="['굿하트의 법칙: 지표가 목표가 되면 좋은 지표이길 멈춘다(목표 침식의 사촌)', '70의 법칙', '성장의 한계', '부익부']"
        :answer="0"
        explanation="목표 대신 목표를 재는 지표를 맞추는 쪽으로 미끄러지는 구조입니다. 11부 6장의 검수자 이야기, 11장의 보상 해킹과 이어져요."
      />
      <Quiz
        difficulty="medium"
        question="부익부 실험(52:48 출발, 성과대로 몰아주기)에서 1년 뒤 B 팀의 성과는 약 얼마인가? (정수)"
        type="numeric"
        :answer="10"
        :tolerance="1"
        :hints="['실험에서 부익부를 골라 12개월 지점을 보세요.']"
        explanation="약 10(A 약 90). 4점 차이로 출발했는데 1년 만에 80점 차이가 됐습니다. 두 강화 루프가 맞물려 한쪽이 이기면 다른 쪽이 지는 구조예요."
      />
      <Quiz
        difficulty="medium"
        question="실패하는 처방에서 처방을 더 세게 하면?"
        :choices="['당장은 더 좋아 보이지만 지연된 부작용도 커져 장기적으로 더 나빠질 수 있다', '언제나 더 좋아진다', '아무 변화가 없다', '부작용이 사라진다']"
        :answer="0"
        explanation="부작용이 처방의 양에 비례해 늦게 돌아오는 구조라, 처방을 키우면 나중에 돌아올 문제도 커집니다. 실험에서는 4년 뒤 65건으로 처방 안 할 때(40건)보다 나빴어요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="레버리지 포인트의 교훈으로 가장 알맞은 것은?"
        :choices="['숫자를 바꾸기보다 고리·지연·정보 흐름·규칙·목표 같은 구조를 바꾸는 쪽이 대개 효과가 크다', '숫자를 크게 바꿀수록 효과가 크다', '시스템은 바꿀 수 없다', '가장 쉬운 곳부터 건드리는 것이 늘 최선이다']"
        :answer="0"
        explanation="메도즈의 지적처럼 사람들이 가장 먼저 손대는 매개변수는 대개 약한 지렛대입니다. 성장의 한계에서 성장률을 두 배로 해도 천장은 그대로였던 것처럼요."
      />
      <Quiz
        difficulty="hard"
        question="AI 답변 정확도 목표를 해마다 조금씩 내려왔고, 품질도 함께 내려갔다. 가장 알맞은 처방은?"
        :choices="['목표를 바깥 기준(고객 요구·외부 벤치마크)에 묶고, 목표를 바꿀 때는 따로 결정하는 절차를 둔다', '목표를 한 번에 크게 내린다', '노력을 더 하자고 다짐한다', '측정을 그만둔다']"
        :answer="0"
        explanation="목표 침식의 레버리지는 목표 자체를 지키는 구조입니다. 격차가 생길 때 목표가 저절로 내려가는 두 번째 균형 루프를 끊는 거예요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch10')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">10장 완료! 판박이 이야기를 알아보는 눈이 생겼습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        여섯 원형과 숫자보다 구조라는 레버리지. 다음은 11장입니다.
        AI 모델 자체가 만드는 고리, 모델 붕괴·보상 해킹·플라이휠을 수학으로 봅니다.
      </p>
      <RouterLink
        to="/ch/ch11"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        11장: AI가 만드는 고리 →
      </RouterLink>
    </div>
  </article>
</template>
