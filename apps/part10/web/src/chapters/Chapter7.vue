<script setup lang="ts">
// 7장 — 차이가 진짜일까: 쌍대 비교와 p값의 실전 복귀(3부 9장 회수). 필수 소주제 ④.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import PairedLab from '@/components/PairedLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch7')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 7 · 시험의 통계</p>
    <h1 class="mb-4 text-3xl font-bold">차이가 진짜일까 — 두 모델 비교</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      6장의 숙제가 남아 있습니다 — 구간이 겹친 두 모델, 그럼 <b>영영 못 가리나요?</b>
      가릴 수 있습니다. 열쇠는 채점 방식에 있어요: 점수 두 개를 <b>따로</b> 볼 게 아니라,
      <b>같은 문항에서 승부가 갈린 것만</b> 세는 겁니다. 그리고 이 판정에서 3부 9장의
      p값이 드디어 실전으로 돌아옵니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <b>쌍대(paired) 비교</b>가 필요 문항 수를 몇 배로 줄이는지 실측하고(같은 데이터에서
      판정이 갈리는 순간 목격), 불일치 문항의 <b>부호 검정 z = (x−y)/√(x+y)</b> 와
      <b>p값</b>으로 "차이가 진짜인지"를 판정할 수 있게 됩니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 발상 — 회색 문항은 증거가 아니다</h2>
    <ReviewFlag id="ch7-s1" chapter="ch7" label="1. 발상 — 회색 문항은 증거가 아니다" />
    <p class="leading-relaxed text-slate-700">
      같은 시험지로 두 모델을 채점하면 문항은 넷으로 갈립니다 — 둘 다 맞음 / <b>A만 맞음</b> /
      <b>B만 맞음</b> / 둘 다 틀림. 곰곰이 보면 "둘 다" 문항은 우열에 대해 아무 말도 하지
      않아요(쉬워서 둘 다 맞았거나 어려워서 둘 다 틀린 것 — 문항 난이도 이야기일 뿐).
      <b>승부의 증거는 불일치 문항뿐입니다.</b> 그리고 만약 두 실력이 같다면, 불일치는
      50:50 동전 던지기여야 하죠 — 거기서 얼마나 쏠렸는지가 판정의 전부입니다.
      직접 확인해 봅시다. 선수는 워밍업의 그 둘 — 진짜 실력 A 72% vs B 70%.
    </p>

    <PairedLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 같은 데이터, 갈리는 판정">
      1,000문항에서 벌어진 일이 이 장의 전부입니다 — <b>따로 보기: p = 0.324 (판정 불가)</b>,
      <b>쌍대 보기: p = 0.039 (유의!)</b>. 같은 시험 결과인데 채점 방식만으로 판정이
      갈렸어요. 이유: 따로 보기의 소음에는 "이번 시험이 우연히 쉬웠나/어려웠나"라는
      <b>문항 난이도 운</b>이 통째로 들어가는데, 같은 문항으로 비교하면 그 운이 두 모델에
      <b>똑같이</b> 작용해서 <b>빼기에서 소거</b>됩니다. 그 결과 2%p 차이를 가리는 데
      따로는 ≈3,953문항, 쌍대는 <b>≈957문항</b> — 4.1배 절약.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="쌍대 비교에서 우열의 증거가 되는 문항은?"
      :choices="['불일치 문항(A만 맞음 / B만 맞음)뿐 — 둘 다 맞거나 둘 다 틀린 문항은 정보 0', '둘 다 맞은 문항', '둘 다 틀린 문항', '모든 문항이 똑같이 증거다']"
      :answer="0"
      :hints="['랩의 4분류 막대에서 회색 칸이 말해주는 것은 난이도지 우열이 아니었죠.']"
      explanation="둘 다 맞음/틀림은 문항이 쉬웠냐 어려웠냐의 이야기입니다. 실력이 같다는 가정(귀무가설) 아래 불일치는 50:50이어야 하고, 그 쏠림만이 우열의 증거예요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 판정 공식 — 동전에서 얼마나 멀어졌나</h2>
    <ReviewFlag id="ch7-s2" chapter="ch7" label="2. 판정 공식 — 동전에서 얼마나 멀어졌나" />
    <p class="leading-relaxed text-slate-700">
      불일치가 m = x + y개이고 그중 A가 x번 이겼다면, "실력이 같다"는 가정에서 x는 동전
      m번의 앞면 수입니다. 동전의 출렁임 한 단위(표준오차)는 √m/2 — 그래서 쏠림을
      출렁임으로 나눈 z가 판정 기준이 됩니다:
    </p>

    <MathBlock expr="z \;=\; \frac{x - y}{\sqrt{x + y}} \qquad\rightarrow\qquad p\text{값} = 2\,(1 - \Phi(|z|))" />

    <p class="leading-relaxed text-slate-700">
      z가 1.96을 넘으면 p &lt; 0.05 — "실력이 같다면 이 정도 쏠림이 우연히 나올 확률이
      5% 미만"이라는 뜻입니다(3부 9장의 그 p값!). 1,000문항 실험에서 A만 57 vs B만 37:
      z = 20/√94 = 2.06, p = 0.039 — 유의. 이 판정법의 정식 이름은 <b>맥니마 검정</b>
      (부호 검정의 쌍대 버전)입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 쌍대 비교 / 불일치 문항 / p값(재회)">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>쌍대 비교</b> (paired comparison) — 읽는 법: 페어드. 비유: <b>같은 시험지로
          맞대결</b>. 뜻: 두 모델을 같은 문항에 붙여 문항별 승패로 비교하는 설계 —
          공통 소음(난이도 운)이 소거되어 표본 효율이 몇 배로 뜁니다.
        </li>
        <li>
          <b>불일치 문항</b> (discordant pair) — 읽는 법: 디스코던트.
          뜻: 한 모델만 맞힌 문항 — 승부가 갈린 문항. 쌍대 판정은 이것만 셉니다
          (맥니마 검정 z = (x−y)/√(x+y)).
        </li>
        <li>
          <b>p값</b> (p-value) — 읽는 법: 피값. 뜻: <b>"차이가 없다고 가정할 때, 이만큼
          (또는 더 극단적인) 쏠림이 우연히 나올 확률"</b> — 3부 9장에서 배운 그 정의
          그대로, 여기선 모델 비교의 판정 도구로 복귀. 관례상 0.05 미만이면 "유의".
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <StepQuiz
      question="불일치 100문항 중 A가 60번 이겼다(B는 40번). 부호 검정 z를 단계별로 계산해 보세요."
      :steps="[
        { lhs: 'x - y = ?', answer: 20 },
        { lhs: '\\sqrt{x + y} = \\sqrt{100} = ?', answer: 10 },
        { lhs: 'z = 20/10 = ?', answer: 2 },
      ]"
      explanation="z = 2 > 1.96 → p ≈ 0.046 < 0.05, 유의합니다. '동전이라면 60:40 쏠림은 우연히 5%도 안 나온다'는 판정이에요."
    />

    <DetailsCard title="➕ 더 깊이: 두 궁수의 비유, 절약 배율, 그리고 주의 두 가지">
      <b>왜 소거되나</b> — 두 궁수의 실력을 비교하는데 한 명은 바람 부는 날, 한 명은 맑은 날
      쏘게 하면 바람 운이 소음에 섞입니다. <b>같은 날 나란히</b> 쏘게 하면 바람은 둘에게
      똑같이 불고, 점수 차이에서 지워지죠 — 문항 난이도가 바로 그 바람입니다.
      <b>절약 배율</b>은 두 모델이 비슷할수록(일치율이 높을수록) 커집니다 — 우리 세계는
      불일치 10%로 4.1배였지만, 최신 모델들처럼 95% 이상 일치하면 10배를 넘기도 해요.
      <b>주의 ①</b>: p &lt; 0.05는 "차이가 0이 아니다"는 뜻이지 "차이가 크다"가 아닙니다 —
      2%p라는 <b>효과 크기</b>는 별도로 보고해야 해요. <b>주의 ②</b>: 벤치마크 여러 개를
      돌리고 유의한 것만 골라 발표하면(다중 비교) 5%짜리 우연이 반드시 걸려듭니다 —
      8장(오염)과 함께 캡스톤 체크리스트에 들어갈 함정입니다.
    </DetailsCard>

    <ReviewFlag id="ch7-ai" chapter="ch7" label="🤖 AI 연결 — 모델 대전이 전부 '쌍대'인 이유" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 모델 대전이 전부 '쌍대'인 이유">
      실전 평가가 이 구조를 씁니다 — 두 모델에게 <b>같은 프롬프트</b>를 주고 답변을 나란히
      비교하는 모델 대전(pairwise battle)이 대표적이고, 논문의 모델 비교 표도 같은 문항
      세트 위에서 유의성을 보고할 때 신뢰를 얻습니다. 이제 여러분은 "A가 B를 이겼다"는
      주장에 두 가지를 물을 수 있어요 — <b>같은 문항이었나? p값은?</b> 판정의 뿌리는
      <b><PartLink :part="3" ch="ch9">3부 9장</PartLink></b>(가설검정과 p값 — 드디어 회수)
      이고, 평가 설계의 큰 틀은 <b><PartLink :part="6" ch="ch9">6부 9장</PartLink></b>의
      심화입니다. 다음 장은 시험 자체가 썩는 경우 — <b>오염</b>입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="차이가 진짜일까 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="쌍대 비교의 뜻은?"
        :choices="['두 모델을 같은 문항에 붙여 문항별 승패로 비교하는 것', '두 모델을 서로 다른 시험으로 비교하는 것', '점수를 두 배로 계산하는 것', '두 번 시험 봐서 평균 내는 것']"
        :answer="0"
        explanation="같은 시험지로 맞대결 — 문항 난이도라는 공통 소음이 소거되는 설계입니다."
      />
      <Quiz
        difficulty="easy"
        question="실력이 같은 두 모델이라면, 불일치 문항의 승패는 어떻게 나와야 하나?"
        :choices="['약 50:50 — 동전 던지기', '항상 100:0', '불일치가 아예 없어야 한다', '항상 A가 이긴다']"
        :answer="0"
        explanation="귀무가설('차이 없음')의 모습이 50:50입니다 — 판정은 실제 데이터가 이 동전에서 얼마나 멀어졌는지를 재는 것."
      />
      <Quiz
        difficulty="easy"
        question="둘 다 맞힌 문항이 많을수록 A가 더 강하다는 증거가 쌓인다."
        type="truefalse"
        :answer="1"
        explanation="거짓 — 둘 다 맞음/틀림은 우열 정보가 0입니다(문항 난이도 이야기일 뿐). 증거는 불일치에만 있어요."
      />
      <Quiz
        difficulty="easy"
        question="p값 0.039의 올바른 읽기는?"
        :choices="['실력이 같다고 가정하면 이 정도(또는 더 극단적) 쏠림이 우연히 나올 확률이 3.9%', 'A가 이길 확률이 3.9%', 'B의 점수가 3.9점', '오차범위가 3.9%p']"
        :answer="0"
        explanation="3부 9장의 정의 그대로입니다 — '우연이라기엔 드문 일'의 정도를 재는 수. 0.05 미만이면 관례상 유의."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="1,000문항 실험에서 따로 보기(p=0.324)와 쌍대 보기(p=0.039)의 판정이 갈린 이유는?"
        :choices="['같은 문항 비교가 문항 난이도 운(공통 소음)을 소거해 같은 데이터에서 더 많은 신호를 꺼내서', '쌍대 보기가 점수를 부풀려서', '따로 보기가 계산 실수를 해서', '우연이다']"
        :answer="0"
        explanation="바람 부는 날 나란히 쏜 두 궁수 — 바람(난이도)이 빼기에서 지워집니다. 소음이 줄면 같은 차이도 또렷해져요."
      />
      <Quiz
        difficulty="medium"
        question="2%p 차이를 가리는 데 따로 보기는 ≈3,953문항, 쌍대 보기는 ≈957문항이었다. 절약 배율이 더 커지는 조건은?"
        :choices="['두 모델의 답이 비슷할수록(일치율이 높아 불일치가 적을수록)', '두 모델이 완전히 다를수록', '문항이 어려울수록', '점수가 낮을수록']"
        :answer="0"
        explanation="공통 부분이 클수록 소거되는 소음도 큽니다 — 최신 모델들처럼 95%+ 일치하면 10배 이상 절약되기도. 비슷한 것들의 비교일수록 쌍대가 필수예요."
      />
      <Quiz
        difficulty="medium"
        question="불일치 50문항 중 A가 30번 이겼다. z = (30−20)/√50 ≈ 1.41 — 판정은?"
        :choices="['p ≈ 0.16 — 유의하지 않음, 이 데이터로는 우열 단정 불가', 'z가 1을 넘었으니 A 승리 확정', 'B가 더 강하다', '불일치가 50개면 무조건 유의하다']"
        :answer="0"
        :hints="['기준선은 z = 1.96입니다.']"
        explanation="1.41 < 1.96 → p ≈ 0.16. 30:20 쏠림은 동전으로도 6~7판에 한 번쯤 나오는 일 — 증거 부족입니다(문항을 더 모아야)."
      />
      <Quiz
        difficulty="medium"
        question="n=500 구간에서 불일치가 정확히 26:26 동점이 나왔다(z=0, p=1). 올바른 해석은?"
        :choices="['이 표본에는 우열의 증거가 전혀 없다 — 실력이 같다는 증명이 아니라 증거 부족', '두 모델의 실력이 정확히 같다는 증명', '시뮬레이션 오류', 'A가 이기고 있다는 뜻']"
        :answer="0"
        explanation="p=1은 '차이 없음과 완벽히 부합'이지 '차이 없음의 증명'이 아닙니다 — 진짜 실력은 2%p 차이(신의 시점)였는데도요. 표본이 작으면 이런 판이 나옵니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="p = 0.03으로 'A 승리'가 유의했다. 그런데 실제 점수 차이는 0.4%p였다. 가장 올바른 보고는?"
        :choices="['차이는 통계적으로 유의하나 크기(효과 크기)는 0.4%p로 작다 — 실무 가치는 별도로 판단', 'p<0.05니까 A가 압도적으로 우수하다', '유의하므로 크기는 볼 필요 없다', '0.4%p면 p값이 잘못된 것']"
        :answer="0"
        :hints="['유의성은 “0이 아니다”, 크기는 “얼마나”입니다 — 다른 질문.']"
        explanation="문항이 아주 많으면 미세한 차이도 유의해집니다. '진짜 차이인가(p값)'와 '의미 있는 차이인가(효과 크기)'를 분리해 보고하는 것이 정직한 평가예요."
      />
      <Quiz
        difficulty="hard"
        question="어느 발표: '벤치마크 12개 중 유의한(p<0.05) 3개에서 저희가 앞섭니다.' 이 장의 눈으로 가장 먼저 지적할 것은?"
        :choices="['다중 비교 — 12번 검정하면 우연만으로도 평균 0.6개가 유의해진다. 나머지 9개 결과와 사전 등록 여부를 함께 봐야', '3개면 충분한 증거다', 'p값은 벤치마크 수와 무관하다', '벤치마크가 12개라 신뢰도가 12배다']"
        :answer="0"
        :hints="['5% 우연 적중을 12번 반복하면?']"
        explanation="검정을 반복하면 5%짜리 우연이 누적됩니다(12번이면 하나쯤은 공짜로 유의). 골라서 보여주는 발표는 그 자체가 신호 — 캡스톤 체크리스트에 '전체 결과를 보여달라'가 들어가는 이유입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch7')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">7장 완료 — 3부 9장 p값이 실전 복귀했습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 8장 — 기출 유출. 판정 도구가 아무리 좋아도 시험 자체가 썩으면 소용없죠 —
        훈련 데이터에 시험 문제가 섞이는 오염(contamination)과 점수 급등의 의심 목록입니다.
      </p>
      <RouterLink
        to="/ch/ch8"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        8장 — 기출 유출 →
      </RouterLink>
    </div>
  </article>
</template>
