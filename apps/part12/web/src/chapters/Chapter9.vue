<script setup lang="ts">
// 9장 — 그림만 보면 틀린다: 인과지도의 규칙과 함정. 화살표 극성("다른 조건이 같다면"),
// 루프 판별(− 개수 홀짝), 저량 누락·같은 그림 다른 행동·상관 ≠ 인과·변수 이름 짓기.
// 다시 쓰는 수학: 3부 10장(상관 ≠ 인과), 7부 8장(지식 그래프), 11부 6장(검수자).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import CldLab from '@/components/CldLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch9')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">9장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">그림만 보면 틀린다 — 인과지도의 규칙과 함정</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1장 3절에서 인과지도 읽는 법을 익히고, 3장부터 계속 그려 왔습니다. 이제 규칙을 정식으로 세울 차례예요. 화살표의 +와 −가 정확히 무슨 뜻인지,
      고리가 강화인지 균형인지 어떻게 판별하는지, 그리고 인과지도<b>만</b> 보고 결론을 내릴 때 어떤 함정에 빠지는지 봅니다.
      인과지도는 생각을 정리하는 훌륭한 스케치지만, 계산은 아니라는 것이 이 장의 핵심입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>"+는 '원인이 늘면 결과가 원래보다 커진다', −는 '원래보다 작아진다'. 루프 안의 −가 짝수 개면 강화, 홀수 개면 균형."</b>
      이 규칙으로 인과지도를 직접 그리고 판정한 뒤, 같은 그림도 숫자에 따라 전혀 다르게 움직인다는 것을 확인합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 사내 AI 튜터 도입의 인과지도</h2>
    <ReviewFlag id="ch9-s1" chapter="ch9" label="1. 무대: 사내 AI 튜터 도입의 인과지도" />
    <p class="leading-relaxed text-slate-700">
      사내 AI 튜터를 도입하면 무슨 일이 생길까요? 쓰는 사람이 늘면 성공 사례가 공유되고, 그걸 보고 새로 가입합니다. 한편 쓰는 사람이 늘면
      서버가 붐벼 응답이 느려지고, 그러면 만족도가 떨어져 가입이 줄어요. 이 두 이야기를 화살표 일곱 개로 그린 것이 아래 인과지도입니다.
      화살표마다 +인지 −인지 직접 정해 보세요.
    </p>

    <CldLab />

    <ConceptCard tone="tip" title="핵심 관찰: − 의 개수가 루프의 성격을 정하고, 숫자가 행동을 정한다">
      입소문 고리(사용자 수 → 성공 사례 공유 → 신규 가입 → 사용자 수)에는 −가 없어 <b>강화 루프</b>, 속도 저하 고리에는
      −가 하나(응답 지연 → 만족도)라 <b>균형 루프</b>입니다. 한 바퀴 돌았을 때 −를 짝수 번 지나면 처음 방향이 그대로 돌아오고(강화),
      홀수 번 지나면 뒤집혀 돌아오기(균형) 때문이에요. 그런데 실험 ②가 보여 주듯, 고리의 종류를 다 알아도 <b>그 시스템이 S자로 갈지
      크게 출렁일지는 그림만으로 알 수 없습니다</b>. 지연의 길이 같은 숫자가 행동을 가르니까요(최고 1,000명 · 1,228명 · 2,030명).
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="화살표 다섯 개짜리 루프에 − 가 세 개 있다. 이 루프는?"
      :choices="['균형 루프(− 가 홀수 개)', '강화 루프', '판별할 수 없다', '지연 루프']"
      :answer="0"
      :hints="['− 를 지날 때마다 방향이 뒤집힙니다. 세 번 뒤집히면?']"
      explanation="세 번 뒤집히면 한 번 뒤집힌 것과 같아서, 처음 변화가 반대로 돌아옵니다. 그래서 균형 루프예요. − 가 0개나 2개면 강화 루프입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 발견에 이름표 달기</h2>
    <ReviewFlag id="ch9-s2" chapter="ch9" label="2. 오늘의 발견에 이름표 달기" />
    <ConceptCard tone="note" title="새 용어: 링크 극성 / 루프 극성 / 다른 조건이 같다면">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li><b>인과지도</b> 다시 보기 (causal loop diagram, CLD, 인과순환지도라고도 함, 1장 3절). 변수를 화살표로 이어 피드백 루프를 찾는 그림. 쌓이는 것과 흐르는 것을 구별하지 않는 '스케치'입니다.</li>
        <li><b>링크 극성</b> (link polarity). 뜻: 화살표의 +/−. <b>+</b>: 원인이 늘면 결과가 (다른 조건이 같을 때) 원래보다 커짐. <b>−</b>: 원래보다 작아짐.</li>
        <li><b>루프 극성</b> (loop polarity). 뜻: 루프가 강화(R)인지 균형(B)인지. 루프 안 − 의 개수가 짝수면 R, 홀수면 B.</li>
        <li><b>다른 조건이 같다면</b> (ceteris paribus, 케테리스 파리부스). 뜻: 화살표 하나를 읽을 때는 그 원인 하나만 바뀌고 나머지는 그대로라고 생각한다는 약속. 실제로는 여러 원인이 동시에 바뀌므로 결과는 계산해 봐야 압니다.</li>
      </ul>
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 그림만 보고 판단할 때의 네 가지 함정</h2>
    <ReviewFlag id="ch9-s3" chapter="ch9" label="3. 그림만 보고 판단할 때의 네 가지 함정" />
    <ul class="list-disc space-y-3 pl-5 leading-relaxed text-slate-700">
      <li>
        <b>저량을 빠뜨리면 워밍업의 함정에 빠진다.</b> "신규 가입 →(+) 사용자 수"를 "가입이 줄면 사용자도 준다"로 읽기 쉽습니다.
        하지만 사용자 수는 저량이에요. 가입이 줄어도 +인 동안은 계속 늘죠. 유량에서 저량으로 가는 +는 "유량이 클수록 저량이 원래보다
        커진다(더 많이 쌓인다)"는 뜻이지 "저량이 늘어난다"는 뜻이 아닙니다. 그래서 인과지도에서도 저량은 상자로 표시하는 습관을 들이세요.
      </li>
      <li>
        <b>같은 그림, 다른 행동.</b> 실험 ②처럼 고리 모양이 같아도 지연·성장률 같은 숫자가 S자와 출렁임을 가릅니다.
        인과지도에서 결론을 내기 전에 저량-유량도로 옮겨 계산해 봐야 해요.
      </li>
      <li>
        <b>상관을 인과로 그리는 실수.</b> "AI 도구를 쓰는 팀일수록 성과가 높다"는 관찰만으로 "AI 도구 →(+) 성과"를 그리면 안 됩니다.
        성과가 좋은 팀이 새 도구를 먼저 써 봤을 수도(거꾸로 된 화살표), 좋은 관리자가 둘 다를 만들었을 수도(숨은 원인) 있어요.
      </li>
      <li>
        <b>변수 이름은 늘거나 줄 수 있는 양으로.</b> '도입', '만족', '교육 실시' 같은 사건이나 행동이 아니라 '사용자 수', '만족도',
        '교육받은 직원 수'처럼 더 많아지거나 적어질 수 있는 명사로 지어야 +/−가 뜻을 가집니다.
      </li>
    </ul>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="인과지도에 '신규 가입 →(+) 사용자 수'가 있다. 가입이 지난달보다 줄었다면 사용자 수는?"
      :choices="['가입이 아직 이탈보다 많다면 계속 는다. +는 원래보다 더 쌓인다는 뜻이지 늘어난다는 뜻이 아니다', '반드시 줄어든다', '반드시 그대로다', '+ 이므로 가입과 똑같이 줄어든다']"
      :answer="0"
      :hints="['사용자 수는 저량입니다. 워밍업을 떠올려 보세요.']"
      explanation="유량 → 저량의 +는 '유량이 클수록 저량이 원래보다 많이 쌓인다'는 뜻입니다. 가입이 줄어도 이탈보다 많으면 사용자는 늘어요. 저량을 빠뜨린 채 화살표만 보면 워밍업과 같은 오보를 냅니다."
    />

    <DetailsCard title="➕ 더 깊이: 시스템 다이내믹스 학계가 오래 경고해 온 것">
      인과지도는 1970년대부터 널리 쓰였지만, 시스템 다이내믹스 연구자들은 그 한계를 일찍부터 지적했습니다.
      리처드슨(Richardson, 1986)은 인과지도가 저량과 유량을 구별하지 못해 극성을 잘못 읽게 만드는 문제를 정리했고,
      스터먼(Sterman, 2000)의 교재 『Business Dynamics』도 인과지도만으로는 행동을 추론할 수 없으니 시뮬레이션하라는 점을 거듭 강조합니다.
      그래서 실무의 순서는 늘 같아요. 인과지도로 고리를 찾고(생각 정리, 소통) → 저량-유량도로 옮기고 → 숫자를 넣어 시뮬레이션하고 →
      DT를 줄여 확인한다(5장). 인과지도를 버리라는 말이 아니라, 거기서 멈추지 말라는 말입니다.
    </DetailsCard>

    <ReviewFlag id="ch9-ai" chapter="ch9" label="🤖 AI 연결: LLM이 그린 인과지도, 지식 그래프와의 차이" />
    <ConceptCard tone="ai" title="🤖 AI 연결: LLM이 그린 인과지도, 지식 그래프와의 차이">
      요즘은 LLM에게 "이 상황의 인과지도를 그려 줘"라고 시키기도 합니다. 그럴듯한 그림이 나오지만, 오늘 본 대로
      <b>극성 하나만 틀려도 루프의 종류가 뒤집힙니다</b>. 화살표마다 "원인이 늘면 결과가 원래보다 커지나?"를 사람이 확인해야 하는 이유예요.
      <b><PartLink :part="11" ch="ch6">11부 6장</PartLink></b>의 검수자처럼, 그럴듯함과 정확함은 다릅니다. 또 하나 구별할 것:
      <b><PartLink :part="7" ch="ch8">7부 8장</PartLink></b>의 지식 그래프도 화살표 그림이지만, 지식 그래프는 "A는 B의 선수 개념이다"처럼
      <b>관계의 이름</b>을 담고, 인과지도는 "A가 늘면 B가 는다/준다"처럼 <b>영향의 방향과 부호</b>를 담아요. 이 사이트의 개념 지도는
      지식 그래프입니다. 그리고 화살표를 긋기 전에 상관과 인과를 구별하는 눈은
      <b><PartLink :part="3" ch="ch10">3부 10장</PartLink></b>에서 배운 그대로예요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="인과지도의 규칙과 함정: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="인과지도의 화살표 'A →(+) B'의 뜻은?"
        :choices="['다른 조건이 같다면, A가 늘면 B가 원래보다 커진다', 'A와 B는 늘 같은 값이다', 'B가 A를 만든다', 'A와 B는 관계가 없다']"
        :answer="0"
        explanation="+는 같은 방향의 영향입니다. '원래보다'와 '다른 조건이 같다면'이 중요한 단서예요. 실제로는 여러 원인이 함께 움직이니까요."
      />
      <Quiz
        difficulty="easy"
        question="루프 안에 − 화살표가 홀수 개면 균형 루프다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. − 를 지날 때마다 방향이 뒤집히니, 홀수 번이면 처음 변화가 반대로 돌아와 차이를 줄입니다."
      />
      <Quiz
        difficulty="easy"
        question="− 화살표가 하나도 없는 루프는?"
        :choices="['강화 루프', '균형 루프', '판별할 수 없다', '루프가 아니다']"
        :answer="0"
        explanation="0은 짝수입니다. 한 바퀴 돌아도 방향이 그대로라 변화가 커져요(입소문 고리)."
      />
      <Quiz
        difficulty="easy"
        question="인과지도의 변수 이름으로 가장 알맞은 것은?"
        :choices="['만족도', '만족시키기', '도입하다', '교육 실시']"
        :answer="0"
        explanation="변수는 늘거나 줄 수 있는 양(명사)이어야 +/−가 뜻을 가집니다. '만족도가 높아진다/낮아진다'는 말이 되지만 '도입하다가 높아진다'는 말이 안 되죠."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="'사용자 수 →(+) 서버 부하 →(+) 응답 지연 →(−) 만족도 →(+) 신규 가입 →(+) 사용자 수'는 어떤 루프인가?"
        :choices="['균형 루프(− 가 하나)', '강화 루프', '지연 루프', '판별할 수 없다']"
        :answer="0"
        explanation="− 가 하나(응답 지연 → 만족도)라 홀수, 균형 루프입니다. 사용자가 늘면 결국 가입이 줄어드는 쪽으로 돌아오죠."
      />
      <Quiz
        difficulty="medium"
        question="'신규 가입 →(+) 사용자 수'를 보고 '가입이 줄면 사용자도 준다'고 읽는 것의 문제는?"
        :choices="['사용자 수는 저량이라, 가입이 줄어도 +인 동안은 계속 쌓인다. +는 원래보다 더 쌓인다는 뜻이다', '문제가 없다', '화살표 방향이 거꾸로다', '−로 그렸어야 한다']"
        :answer="0"
        explanation="리처드슨이 지적한 인과지도의 대표적 함정입니다. 유량 → 저량 화살표는 '쌓인다'로 읽어야 해요. 워밍업의 오보가 바로 이 실수였습니다."
      />
      <Quiz
        difficulty="medium"
        question="같은 인과지도(강화 + 균형 + 지연)가 S자일 수도, 크게 출렁일 수도 있는 이유는?"
        :choices="['지연의 길이·성장률 같은 숫자가 행동을 정하기 때문. 그래서 시뮬레이션이 필요하다', '인과지도를 잘못 그렸기 때문', '컴퓨터 오류 때문', '루프의 종류가 바뀌기 때문']"
        :answer="0"
        explanation="실험 ②에서 지연만 0.5 → 3 → 8개월로 바꾸자 최고 1,000 → 1,228 → 2,030명이 됐습니다. 고리 모양은 그대로였어요."
      />
      <Quiz
        difficulty="medium"
        question="'AI 도구를 쓰는 팀일수록 성과가 높다'는 관찰로 'AI 도구 사용 →(+) 성과'를 그리기 전에 확인할 것은?"
        :choices="['성과 좋은 팀이 먼저 도입했을 가능성(거꾸로 된 화살표)과 둘 다를 만든 숨은 원인', '팀의 이름', '도구의 가격만', '확인할 것이 없다']"
        :answer="0"
        explanation="상관은 인과가 아닙니다(3부 10장). 화살표 하나가 고리 전체의 성격을 바꿀 수 있으니, 그리기 전에 방향과 숨은 원인을 따져 봐야 해요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="화살표 다섯 개, − 가 두 개인 강화 루프에서 − 하나를 실수로 +로 그렸다. 결과는?"
        :choices="['− 가 하나(홀수)가 되어 균형 루프로 잘못 판정된다', '여전히 강화 루프다', '루프가 사라진다', '지연 루프가 된다']"
        :hints="['홀짝이 어떻게 바뀌나요?']"
        :answer="0"
        explanation="극성 하나가 홀짝을 바꿔 루프의 종류가 뒤집힙니다. 그림 전체의 결론(폭주할까, 안정될까)이 화살표 하나에 달려 있다는 뜻이라, LLM이나 사람이 그린 인과지도는 화살표마다 검수해야 해요."
      />
      <Quiz
        difficulty="hard"
        question="인과지도와 저량-유량도의 역할을 가장 잘 구별한 것은?"
        :choices="['인과지도는 고리를 찾고 생각을 나누는 스케치, 저량-유량도는 쌓이는 것과 흐르는 것을 구별해 계산할 수 있게 만든 설계도', '둘은 같은 그림이다', '인과지도가 더 정확한 계산 도구다', '저량-유량도는 소통용, 인과지도는 계산용이다']"
        :answer="0"
        explanation="실무 순서는 인과지도로 고리 찾기 → 저량-유량도로 옮기기 → 숫자 넣어 시뮬레이션 → DT 줄여 확인. 인과지도에서 멈추면 같은 그림 다른 행동의 함정에 빠집니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch9')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">9장 완료! 그림을 제대로 그리고 의심하는 법을 익혔습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        극성은 '원래보다', 루프는 − 의 홀짝, 결론은 시뮬레이션으로. 다음은 10장입니다.
        조직과 사회에서 되풀이되는 판박이 구조, 시스템 원형을 모아 봅니다.
      </p>
      <RouterLink
        to="/ch/ch10"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        10장: 되풀이되는 이야기 →
      </RouterLink>
    </div>
  </article>
</template>
