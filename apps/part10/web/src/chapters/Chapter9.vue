<script setup lang="ts">
// 9장 — AI 채점관의 성적표: LLM 심판의 편향 3종과 감정법. 필수 소주제 ⑤, 3부 10장 회수.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import JudgeLab from '@/components/JudgeLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch9')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 9 · 시험의 통계</p>
    <h1 class="mb-4 text-3xl font-bold">AI 채점관의 성적표 — LLM 심판</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      객관식은 채점기가 채점하면 되죠. 그런데 요즘 평가의 주전장은 서술형입니다 —
      "이메일을 써 줘", "코드를 고쳐 줘" 같은 답변 수만 개를 사람이 다 읽을 수는 없어요.
      그래서 등장한 것이 <b>AI 채점관(LLM 심판)</b>: 모델의 답변을 다른 모델이 평가합니다.
      효율은 훌륭한데, 문제가 하나 — <b>심판도 모델이라 편향이 있습니다.</b>
      측정 도구 자체를 감정해야 하는 장입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      심판 편향 3종 — <b>위치·길이·자기 선호</b> — 를 직접 심어 왜곡을 측정하고,
      완화책(<b>순서 뒤집어 두 번 채점</b>, 심판 교체)과 감정 지표(<b>사람 채점과의
      일치율</b> — 3부 10장 상관의 실전판)를 가져갑니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 실험 — 심판에게 편향을 심어 보자</h2>
    <ReviewFlag id="ch9-s1" chapter="ch9" label="1. 실험 — 심판에게 편향을 심어 보자" />
    <p class="leading-relaxed text-slate-700">
      신의 시점 설계입니다. 두 모델 A·B의 200판 대결에서 <b>진짜 품질 차이를 우리가 정해</b>
      두었습니다(A가 근소 우위 — 진짜 승률 54.5%). 심판은 품질 차이에 <b>편향 항</b>을 더해
      판정해요: 먼저 보인 답에 가산점(위치), 긴 답에 가산점(길이), 그리고 심판이 B와 같은
      회사의 형제 모델이라 B에 가산점(자기 선호). 토글을 켜고 끄면서 — 심판의 성적표가
      진실에서 얼마나 멀어지는지 재 봅시다.
    </p>

    <JudgeLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 편향마다 지문이 다르다">
      <b>위치만</b> 켜도 A 승률이 67%로 <b>+12.5%p</b> 부풀었습니다(A를 항상 먼저 보여줬으니).
      <b>자기 선호만</b> 켜면 47.5% — 사실은 A가 나은데 <b>지는 것처럼</b> 보이죠.
      가장 교묘한 건 <b>길이</b>: 집계 승률은 54.5%로 진짜와 똑같은데, 사람과의 일치율이
      95%로 떨어졌습니다 — <b>개별 판정 10판이 조용히 뒤집힌 것.</b> 집계가 맞다고 채점이
      옳은 게 아닙니다. 그리고 <b>교차 채점</b>의 발견: 판정 불가가 ~30% — 판정의 3할이
      내용이 아니라 <b>순서</b>에 좌우되고 있었다는 자백입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="실험에서 위치 편향만 켰을 때(A를 항상 먼저) 관측된 A 승률은? (진짜 54.5%)"
      :choices="['67.0% — 약 +12.5%p 부풀림', '54.5% 그대로', '47.5%로 하락', '100%']"
      :answer="0"
      :hints="['먼저 보인 답에 +0.3 가산점 — A가 항상 먼저였죠.']"
      explanation="위치 하나로 12.5%p가 움직였습니다 — 실제 LLM 심판 연구들에서도 첫 번째 답 선호는 가장 크고 일관되게 보고되는 편향이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 완화책과 감정법 — 심판을 심판하기</h2>
    <ReviewFlag id="ch9-s2" chapter="ch9" label="2. 완화책과 감정법 — 심판을 심판하기" />
    <p class="leading-relaxed text-slate-700">
      각 편향에는 짝이 되는 대책이 있습니다. <b>위치</b>는 순서를 뒤집어 두 번 채점하거나
      무작위화 — 7장 쌍대 비교와 같은 철학입니다(같은 판을 조건만 바꿔 두 번 재서 조건
      요인을 소거). <b>자기 선호</b>는 순서 뒤집기로 못 지웁니다 — 실험에서 교차 후에도
      45%로 어긋났죠. 대책은 구조적: <b>심판과 선수를 분리</b>(평가 대상과 무관한 모델·
      여러 심판 합의). <b>길이</b>는 채점 기준(루브릭)에 "간결성"을 명시하고 길이를 통제한
      비교로 다스립니다. 그리고 이 모든 것의 최종 감정 지표 — <b>사람 채점 표본과의
      일치율</b>. 두 채점 열이 같이 움직이는 정도를 재는 것, 3부 10장에서 배운 <b>상관</b>의
      실전판입니다(이진 판정이라 일치율로, 점수 채점이면 상관계수로).
    </p>

    <ConceptCard tone="note" title="새 용어: LLM 심판 / 위치 편향 / 자기 선호 편향">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>LLM 심판</b> (LLM-as-judge) — 읽는 법: 엘엘엠 애즈 저지. 비유: <b>AI 채점관</b>.
          뜻: 모델의 답변을 다른 LLM이 채점·비교하는 평가 방식 — 서술형 평가의 규모 문제를
          풀지만, 심판 자신이 측정 도구로서 감정 대상이 됩니다.
        </li>
        <li>
          <b>위치 편향</b> (position bias) — 읽는 법: 포지션 바이어스.
          뜻: 내용과 무관하게 <b>먼저(또는 특정 위치에) 보인 답</b>을 선호하는 성향 —
          대책은 순서 무작위화·교차 채점.
        </li>
        <li>
          <b>자기 선호 편향</b> (self-preference bias) — 읽는 법: 셀프 프레퍼런스.
          뜻: 심판이 <b>자기(또는 가족 모델)의 답변 스타일</b>을 후하게 주는 성향 —
          순서 뒤집기로는 안 지워지고, 심판·선수 분리로 대응합니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="교차 채점(순서 뒤집어 두 번)으로 지워지는 편향과 남는 편향의 짝으로 옳은 것은?"
      :choices="['지워짐: 위치 / 남음: 자기 선호(심판 교체 필요)·길이(루브릭 필요)', '전부 지워진다', '전부 남는다', '지워짐: 자기 선호 / 남음: 위치']"
      :answer="0"
      :hints="['실험에서 교차 후에도 45%로 어긋나게 만든 범인은?']"
      explanation="순서 뒤집기는 순서에 붙은 편향만 소거합니다 — 자기 선호는 어느 순서에서든 B를 밀어주니까요. 편향마다 대책이 다른 이유입니다."
    />

    <DetailsCard title="➕ 더 깊이: 심판 간 일치의 함정, 그리고 심판 점수도 결국 '측정'">
      실험의 마지막 수치 하나 — 편향이 서로 다른 두 AI 심판(J1·J2)의 <b>심판 간 일치율은
      77%</b>인데, 사람과의 일치율은 각각 93%·83%였습니다. 뒤집어 생각하면: <b>심판끼리
      일치한다고 옳은 게 아닙니다</b> — 같은 편향(예: 같은 계열 모델의 같은 스타일 선호)을
      공유하면 "일치하는 오심"이 나거든요. 그래서 감정의 기준은 어디까지나 <b>사람 채점
      표본</b>입니다(전수는 못 해도 표본 검증은 해야). 마지막으로 잊지 말 것 — 심판의 승률
      집계도 결국 <b>n판 위의 측정</b>이라 6장의 오차범위가 그대로 적용됩니다(200판이면
      ±7%p — 아레나 순위가 출렁이는 이유 하나 추가).
    </DetailsCard>

    <ReviewFlag id="ch9-ai" chapter="ch9" label="🤖 AI 연결 — 아레나 순위표를 읽는 눈 (캡스톤 체크리스트 4호)" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 아레나 순위표를 읽는 눈 (캡스톤 체크리스트 4호)">
      모델 대전 아레나·자동 평가 파이프라인의 순위는 대부분 LLM 심판 위에 서 있습니다.
      이제 그 순위표에 물을 질문들: <b>심판이 누구인가</b>(선수와 가족인가)?
      <b>위치 무작위화·교차 채점을 했는가? 사람 채점과의 일치율을 보고했는가?</b>
      판 수는 몇이라 오차범위는 얼마인가? — 채점 열끼리의 관계를 재는 눈은
      <b><PartLink :part="3" ch="ch10">3부 10장</PartLink></b>(상관 — 드디어 회수)에서,
      평가 설계의 뼈대는 <b><PartLink :part="6" ch="ch9">6부 9장</PartLink></b>에서 쌓은
      그대로입니다. 이로써 2막의 무기가 모두 모였습니다 — 다음은 캡스톤,
      <b>AI 뉴스 팩트체크</b>로 졸업합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="AI 채점관의 성적표 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="LLM 심판(AI 채점관)을 쓰는 이유는?"
        :choices="['서술형 답변 수만 개를 사람이 다 채점할 수 없어서 — 규모 문제의 해법', '사람보다 항상 공정해서', '점수를 후하게 줘서', '법으로 정해져 있어서']"
        :answer="0"
        explanation="효율(규모)이 이유이지 무오류여서가 아닙니다 — 그래서 심판 자체의 감정이 이 장의 주제가 되죠."
      />
      <Quiz
        difficulty="easy"
        question="AI 심판은 모델이 아니라 도구이므로 편향이 없다."
        type="truefalse"
        :answer="1"
        explanation="거짓 — 심판도 LLM이라 위치·길이·자기 선호 같은 체계적 성향을 가집니다. 측정 도구부터 감정해야 해요."
      />
      <Quiz
        difficulty="easy"
        question="다음 중 '자기 선호 편향'의 예는?"
        :choices="['심판 모델이 같은 회사 형제 모델의 답변 스타일에 후한 점수를 주는 것', '먼저 보인 답을 선호하는 것', '긴 답을 선호하는 것', '수학 문제를 싫어하는 것']"
        :answer="0"
        explanation="자기(가족)의 스타일을 알아보고 후해지는 성향 — 실험에선 B에 +0.15로 심었고, A의 진짜 우위(54.5%)를 47.5% 열세로 둔갑시켰습니다."
      />
      <Quiz
        difficulty="easy"
        question="교차 채점에서 '판정 불가'(순서를 바꾸니 판정이 뒤집힘)가 30%나 나왔다는 것의 의미는?"
        :choices="['판정의 3할이 내용이 아니라 순서에 좌우되고 있었다는 위치 편향의 자백', '문제가 30% 부족하다', '모델 실력이 30%라는 뜻', '아무 의미 없다']"
        :answer="0"
        explanation="불일치율 자체가 편향 측정기입니다 — 위치 편향이 클수록 순서 뒤집기에 판정이 많이 뒤집혀요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="길이 편향만 켰을 때 집계 승률은 진짜와 같은 54.5%였지만 사람 일치율은 95%로 떨어졌다. 올바른 해석은?"
        :choices="['개별 판정 10판이 양방향으로 뒤집혀 집계에선 상쇄 — 집계가 맞아도 채점이 옳은 건 아니다', '길이 편향은 무해하다는 증거', '일치율 계산이 잘못됐다', '집계와 일치율은 같은 지표다']"
        :answer="0"
        :hints="['뒤집힌 판이 A쪽 5판, B쪽 5판이면 집계는?']"
        explanation="대칭적 편향은 집계에 숨습니다 — 하지만 문항 수준에선 오심이 쌓여요. 일치율(상관)이 집계보다 예민한 감정 지표인 이유입니다."
      />
      <Quiz
        difficulty="medium"
        question="교차 채점(순서 뒤집어 두 번)의 원리와 같은 철학을 쓴 이 부의 도구는?"
        :choices="['7장의 쌍대 비교 — 같은 대상을 조건만 바꿔 재서 공통(조건) 요인을 소거', '2장의 로그-로그 종이', '4장의 황금비', '5장의 지표 교체']"
        :answer="0"
        explanation="같은 판을 두 순서로 재면 순서 요인이 빠집니다 — 같은 문항으로 두 모델을 재면 난이도 요인이 빠지듯이. '통제해서 소거한다'는 실험 설계의 기본기예요."
      />
      <Quiz
        difficulty="medium"
        question="사람 채점과의 '일치율'과 3부 10장 '상관'의 관계는?"
        :choices="['둘 다 두 채점 열이 같이 움직이는 정도를 재는 것 — 이진 판정은 일치율, 점수 채점은 상관계수', '전혀 무관한 개념', '일치율은 항상 상관보다 크다', '상관은 AI 평가에 쓸 수 없다']"
        :answer="0"
        explanation="3부 10장의 상관이 실전 감정 지표로 회수되는 지점입니다 — 심판 점수와 사람 점수를 나란히 놓고 같이 움직이는지를 재는 것."
      />
      <Quiz
        difficulty="medium"
        question="자기 선호 편향의 올바른 대책은?"
        :choices="['심판과 선수를 분리 — 평가 대상과 무관한(가족이 아닌) 심판 또는 여러 심판의 합의', '순서를 뒤집어 두 번 채점', '문항 수를 늘린다', '답변을 더 길게 쓰게 한다']"
        :answer="0"
        explanation="자기 선호는 어느 순서에서든 작동해서 교차로 안 지워집니다(실험: 교차 후에도 45%). 구조적 분리가 답이에요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="두 AI 심판(J1·J2)의 심판 간 일치율이 77%, 사람과는 각각 93%·83%였다. 만약 심판 간 일치율이 99%로 아주 높다면 안심해도 되나?"
        :choices="['아니오 — 같은 편향(같은 계열·스타일 선호)을 공유하면 “일치하는 오심”이 가능. 기준은 어디까지나 사람 채점 표본', '예 — 심판끼리 일치하면 항상 옳다', '심판이 둘이면 무조건 정확하다', '일치율은 감정과 무관하다']"
        :answer="0"
        :hints="['둘 다 긴 답을 좋아하는 심판이라면?']"
        explanation="일치는 필요조건도 충분조건도 아닙니다 — 독립적이지 않은 심판들의 합의는 편향의 메아리일 수 있어요. 그래서 사람 표본 검증이 감정의 최종 기준입니다."
      />
      <Quiz
        difficulty="hard"
        question="어느 아레나 순위표: 'AI 심판 채점, 총 200판, A 승률 55%로 1위'. 이 장(+6장)의 눈으로 확인할 것을 모두 갖춘 것은?"
        :choices="['심판의 정체(선수와 가족?)·위치 무작위화 여부·사람 일치율 보고, 그리고 200판의 오차범위(±7%p — 55%는 50%와 겹침)', '1위라는 사실만 확인', '심판이 AI면 무조건 무효', '판 수는 상관없다']"
        :answer="0"
        :hints="['98/√200 ≈ 6.9 — 6장의 냅킨 공식.']"
        explanation="편향 점검(이 장) + 소음 점검(6장) 둘 다입니다 — 55%±7%p면 구간이 반반(50%)을 포함하죠. 캡스톤 체크리스트 4호가 완성됐습니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch9')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">9장 완료 — 2막의 무기가 모두 모였습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        오차범위(6장) → 쌍대·p값(7장) → 오염(8장) → 심판 감정(9장). 다음은 캡스톤 —
        가상의 신모델 발표를 통째로 팩트체크하며 10부를 졸업합니다.
      </p>
      <RouterLink
        to="/ch/ch10"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        10장 — 🎯 캡스톤: AI 뉴스 팩트체크 →
      </RouterLink>
    </div>
  </article>
</template>
