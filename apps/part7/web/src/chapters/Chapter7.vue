<script setup lang="ts">
// 7장 — 청킹과 검색 품질: 문서 쪼개기 트레이드오프, top-k, recall@k.
// 회수하는 수학: 6부 9장(평가의 정신) · 3부 8장(표본과 신뢰구간 — 평가 세트 크기).
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ChunkLab from '@/components/ChunkLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch7')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">7장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">청킹과 검색 품질</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      빨리 찾는 법(6장)은 갖췄습니다. 그런데 실제 RAG 프로젝트에서 개발자를 밤새우게 하는 건
      속도가 아니라 <b>품질</b>이에요 — "왜 뻔한 질문에 엉뚱한 문서가 나오지?"
      이번 장은 그 품질을 좌우하는 두 가지 결정(<b>문서를 얼마나 잘게 자를까</b>,
      <b>몇 개를 꺼낼까</b>)과, 결정을 감이 아니라 <b>숫자로 내리는 법</b>(recall@k)을 다룹니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지를 가져갑니다 — ① <b>청킹</b>의 트레이드오프: 크면 뭉개지고(희석) 잘면 찢어진다(문맥 상실),
      ② <b>top-k</b>의 트레이드오프: 많이 꺼내면 덜 놓치지만 비용이 는다,
      ③ <b>recall@k</b>: 평가 세트로 검색을 채점하는 법 — "바꿨으면 재라"는 6부 9장의 정신 그대로.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 칼질의 기술 — 청킹</h2>
    <p class="leading-relaxed text-slate-700">
      벡터 DB에 넣는 단위는 문서 전체가 아니라 <b>조각</b>입니다 — 문서를 검색 단위로 자르는 일을
      <b>청킹</b>(chunking)이라 불러요. "그냥 통째로 넣으면 안 되나?" 그게 왜 안 되는지,
      그리고 반대로 너무 잘게 자르면 무슨 일이 나는지 — 같은 문서를 세 가지 칼질로 잘라 비교해 보세요.
    </p>

    <ChunkLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 크면 희석, 잘면 찢김">
      <b>통문서</b>: 여러 주제가 한 벡터에 평균되어 어느 질문과도 뜨뜻미지근합니다 —
      2장의 언어로 말하면, 여러 방향의 혼합이라 <b>어느 방향과도 코사인이 낮아지는 희석</b>이에요.
      <b>문장별</b>: 점수는 높은데 "단, 근속 1년 이상" 같은 조건이 딴 조각으로 찢어져
      <b>반쪽짜리 답</b>의 위험이 생깁니다. 실무의 출발점은 그 사이 —
      <b>조항·문단처럼 뜻이 완결되는 단위</b>로 자르는 것입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="문서를 통째로 임베딩하면 검색 점수가 낮아지는 이유는?"
      :choices="['여러 주제가 한 벡터에 평균되어 어떤 질문 방향과도 안 가까워져서 (희석)', '긴 문서는 임베딩이 안 돼서', '통문서는 저장이 불가능해서', '낮아지지 않는다 — 통문서가 항상 최선이다']"
      :answer="0"
      :hints="['실험 ①의 통문서 점수(0.44)와 조항 점수(0.84)를 비교해 보세요.']"
      explanation="결혼·장례·출산·절차가 섞인 평균 방향은 '결혼' 질문과의 코사인이 낮습니다 — 주제는 방향에 담기는데(2장) 방향이 뭉개진 거죠."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 몇 개를 꺼낼까 — top-k와 임계값</h2>
    <p class="leading-relaxed text-slate-700">
      검색 결과 중 상위 <b>k개</b>를 꺼내 프롬프트에 넣습니다(<b>top-k</b>). k가 크면
      정답을 놓칠 확률은 줄지만, 프롬프트가 길어져 <b>토큰 비용이 늘고 잡음 조각이 답을 흐릴 수</b>
      있어요(1장에서 "왜 문서 전부를 안 넣나"의 축소판). 또 하나의 유혹 — "점수 0.5 미만은
      버리자" 같은 <b>절대 임계값</b>은 4장에서 배웠듯 위험합니다: 점수의 눈금은 모델·도메인마다
      달라서, 임계값은 반드시 <b>데이터로 검증해서</b> 정해야 해요. 그 검증 도구가 다음 절입니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="top-k에서 k를 키울 때 일어나는 일로 옳은 것은?"
      :choices="['정답을 놓칠 확률은 줄지만 토큰 비용과 잡음이 늘어난다', '모든 것이 공짜로 좋아진다', '정답을 더 자주 놓치게 된다', 'k는 항상 1이 최적이다']"
      :answer="0"
      explanation="recall↑ vs 비용·잡음↑ — 실험 ②에서 k=1→3에서 recall이 40%→80%로 뛰지만 프롬프트는 3배가 됐죠."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 감이 아니라 숫자로 — recall@k</h2>
    <p class="leading-relaxed text-slate-700">
      청킹 크기를 바꿨더니 좋아진 것 같은 "느낌" — 6부 9장에서 이 함정을 이미 배웠습니다:
      <b>평가 없이 개선 없다.</b> 검색의 성적표는 이렇게 만듭니다.
      (질문, 정답 문서) 쌍을 모은 <b>평가 세트</b>를 준비하고, 각 질문의 검색 결과
      <b>top-k 안에 정답이 들어온 비율</b>을 잽니다 — 이것이 <b>recall@k</b>(재현율).
      실험 ②의 채점판이 그것이었어요. 청킹을 바꾸든 임베딩 모델을 바꾸든,
      이 숫자가 오르면 개선이고 내리면 후퇴입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 청킹 / top-k / recall@k">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>청킹</b> (chunking) — 읽는 법: 청킹. 뜻: 문서를 검색 단위 조각(<b>chunk</b>)으로
          자르는 것. 크면 희석, 잘면 찢김 — 뜻이 완결되는 단위(조항·문단)가 출발점.
        </li>
        <li>
          <b>top-k</b> — 읽는 법: 탑케이. 뜻: 검색 상위 <b>k개</b>를 채택해 프롬프트에 넣는 규칙.
          k는 recall과 비용·잡음 사이의 손잡이.
        </li>
        <li>
          <b>recall@k</b> (재현율) — 읽는 법: 리콜 앳 케이. 뜻: 평가 세트에서
          <b>top-k 안에 정답 문서가 들어온 질문의 비율</b>. 검색 개선의 공식 성적표.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">RAG의 품질은 대개 생성이 아니라 검색에서 죽는다 — 조각을 잘 만들고, recall@k로 재라</p>
      <p class="mt-1 text-sm text-indigo-600">바꿨으면 잰다 — 6부 9장의 정신이 검색에도 그대로.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'유사도 0.5 미만은 버린다'는 절대 임계값 규칙에 대한 올바른 태도는?"
      :choices="['점수 눈금은 모델·도메인마다 달라서, 평가 세트로 검증한 뒤에 정해야 한다', '0.5는 만국 공통 기준이라 그냥 쓰면 된다', '임계값은 높을수록 무조건 좋다', '임계값은 낮을수록 무조건 좋다']"
      :answer="0"
      :hints="['4장 — 바닥(0 ± 1/√d) 이야기와 절대값의 함정.']"
      explanation="cos 0.35가 강한 신호인 모델도 있습니다(4장). 임계값·k 같은 설정은 recall@k를 재면서 정하는 것이 정석이에요."
    />

    <DetailsCard title="➕ 더 깊이: 겹침 청킹, 제목 붙이기, 그리고 평가 세트는 몇 문항?">
      실무 요령 세 가지. ① <b>겹침</b>(overlap): 조각 경계에서 문맥이 찢기는 사고를 줄이려
      이웃 조각과 일부 문장을 겹쳐 자릅니다(예: 500자 조각 + 100자 겹침). ② <b>제목 붙이기</b>:
      조각만 떼면 "제1조(결혼)…"가 어느 규정인지 모호하죠 — 조각 앞에 문서·상위 제목을 붙여
      임베딩하면 검색이 눈에 띄게 좋아집니다. ③ <b>평가 세트 크기</b>: 5문항의 recall은
      한 문항에 20%p씩 출렁입니다 — 3부 8장의 신뢰구간 감각으로, 비율의 오차는 대략
      1/√n 수준이라 <b>수십~수백 문항</b>은 모아야 개선을 믿을 수 있어요.
      실사용 질문 로그가 최고의 평가 세트 재료입니다.
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 6부 9장 · 3부 8장">
      이 장의 정신은 <b><PartLink :part="6" ch="ch9">6부 9장</PartLink></b>에서 왔습니다 —
      조련의 성적표(평가 세트·벤치마크) 없이 개선을 논하지 말라던 그 원칙이, RAG에서는
      recall@k라는 얼굴로 나타나요. 그리고 평가 세트를 <b>몇 문항</b>으로 만들지는
      <b><PartLink :part="3" ch="ch8">3부 8장</PartLink></b>의 추정 문제입니다 — recall은 표본으로 잰
      비율이라, 문항 수가 적으면 ±수십%p씩 출렁이는 여론조사와 같거든요.
      이제 재료가 다 모였습니다 — 검색이 프롬프트가 되고 답이 되는 전체 조립, 8장(핵심)입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="청킹과 검색 품질 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="청킹(chunking)이란?"
        :choices="['문서를 검색 단위 조각으로 자르는 것', '문서를 암호화하는 것', '문서를 요약하는 것', '문서를 번역하는 것']"
        :answer="0"
        explanation="벡터 DB에 넣는 단위는 조각(chunk) — 어떻게 자르느냐가 검색 품질을 좌우합니다."
      />
      <Quiz
        difficulty="easy"
        question="recall@k가 재는 것은?"
        :choices="['평가 질문들 중 top-k 안에 정답 문서가 들어온 비율', 'LLM 답변의 문법 점수', '검색 속도(ms)', '문서의 총 개수']"
        :answer="0"
        explanation="검색의 공식 성적표 — (질문, 정답 문서) 평가 세트가 있어야 잴 수 있습니다."
      />
      <Quiz
        difficulty="easy"
        question="조각을 너무 잘게(문장 단위로) 자르면 조건·단서가 딴 조각으로 찢어져 반쪽짜리 답이 나올 수 있다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 실험 ①에서 '단, 근속 1년 이상'이 딴 조각으로 분리됐던 그 사고예요."
      />
      <Quiz
        difficulty="easy"
        question="평가 세트 10문항 중 7문항에서 정답 문서가 top-5 안에 들었습니다. recall@5는? (소수로)"
        type="numeric"
        :answer="0.7"
        explanation="7 ÷ 10 = 0.7 — 70%입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="평가 세트 5문항에서 정답 문서의 검색 순위가 각각 1, 3, 2, 6, 1위였습니다. recall@3을 구하세요."
        :steps="[
          { lhs: '\\text{3위 안에 든 문항 수}', answer: 4 },
          { lhs: '\\text{recall@3}', answer: 0.8 },
        ]"
        :hints="['순위 ≤ 3 인 문항을 세어 보세요: 1, 3, 2, 6, 1', '4 ÷ 5']"
        explanation="1·3·2·1위 네 문항이 성공, 6위 한 문항만 실패 — 4/5 = 0.8. k를 5로 늘려도 6위는 못 구하니, 그 문항은 청킹·임베딩 개선의 몫입니다."
      />
      <Quiz
        difficulty="medium"
        question="통문서 임베딩의 '희석'을 2장의 언어로 옳게 설명한 것은?"
        :choices="['여러 주제 방향이 평균되면 어느 한 방향과의 코사인도 낮아진다', '문서가 길수록 벡터가 짧아진다', '통문서는 항상 직교한다', '코사인은 문서 크기를 잴 수 없다']"
        :answer="0"
        explanation="주제는 방향에 담기는데(2장), 네 방향의 평균은 어느 방향과도 어중간해집니다 — 그래서 조각이 필요해요."
      />
      <Quiz
        difficulty="medium"
        question="실험 ②에서 k를 3→5로 늘려도 recall이 80%에 머문 이유와 그 처방은?"
        :choices="['실패 문항의 정답이 6위라 k로는 못 구한다 — 청킹·임베딩 등 검색 앞단을 고쳐야', 'k를 100으로 올리면 해결된다', 'recall은 원래 80%가 최대치다', '평가 세트를 없애면 된다']"
        :answer="0"
        explanation="k는 아깝게 놓친 정답(2~3위)만 구합니다. 순위 자체가 낮은 문항은 조각 품질·임베딩 모델의 문제 — 개선 지점을 recall이 알려주는 셈이죠."
      />
      <Quiz
        difficulty="medium"
        question="조각 앞에 문서 제목·상위 조항명을 붙여서 임베딩하는 실무 요령의 효과는?"
        :choices="['조각만으로 모호했던 문맥이 보강되어 검색이 좋아진다', '토큰 비용이 없어진다', '벡터 차원이 줄어든다', '효과 없음 — 미신이다']"
        :answer="0"
        :hints="['\'제1조(결혼)…\'만 떼어 놓으면 어느 회사 어느 규정인지 알 수 없죠.']"
        explanation="'경조사 지원 규정 > 제1조(결혼)…'처럼 제목을 달아 주면 조각의 뜻이 완전해져 질문과 더 잘 맞습니다 — 싸고 효과 좋은 개선."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="RAG 챗봇의 답변 품질이 나쁩니다. 이 장의 관점에서 가장 올바른 첫 진단 절차는?"
        :choices="['평가 세트로 recall@k부터 잰다 — 검색이 정답 조각을 못 물어오면 LLM은 잘 답할 수 없다', 'LLM을 더 비싼 모델로 바꾼다', '프롬프트에 \'정확히 답해\'라고 세 번 쓴다', '답변 길이를 늘린다']"
        :answer="0"
        :hints="['핵심 한 줄 — RAG는 어디서 죽는다고 했죠?']"
        explanation="생성을 탓하기 전에 검색을 재세요. recall이 낮으면 어떤 LLM도 없는 재료로 요리하는 셈입니다 — 실무에서 가장 흔한 순서 착오예요."
      />
      <Quiz
        difficulty="hard"
        question="5문항짜리 평가 세트에서 recall@3이 60%→80%로 올랐습니다. '개선 확정'이라 말하기 어려운 이유는?"
        :choices="['문항이 5개뿐이라 한 문항 차이(20%p)가 우연일 수 있다 — 3부 8장의 표본 오차 문제', 'recall은 원래 믿을 수 없는 지표라서', '80%는 60%보다 항상 나쁘니까', '평가 세트는 클수록 부정확해서']"
        :answer="0"
        :hints="['여론조사 5명으로 지지율 변화를 단정할 수 있을까요?']"
        explanation="비율의 오차는 대략 1/√n — n=5면 ±20%p 이상 출렁입니다. 수십~수백 문항을 모아야 개선을 신뢰할 수 있어요(실사용 질문 로그가 최고의 재료)."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch7')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">7장 완료 — 검색을 채점할 수 있게 됐어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        재료가 다 모였습니다. 다음은 8장(핵심) — 검색이 프롬프트가 되고 답이 되는 전체 조립,
        실패 모드 진단, 그리고 조련 vs RAG의 실무 선택 기준까지.
      </p>
      <RouterLink
        to="/ch/ch8"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        8장 — RAG 조립 →
      </RouterLink>
    </div>
  </article>
</template>
