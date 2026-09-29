<script setup lang="ts">
// 워밍업 챕터 — 7부 전체가 풀 문제("컴퓨터에게 '비슷함'을 가르치기")를 몸으로 먼저 느낀다.
// 실제 1~10장 챕터도 이 구조를 그대로 따른다.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import MeaningMapLab from '@/components/MeaningMapLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('sample')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">워밍업 · 10분 몸풀기</p>
    <h1 class="mb-4 text-3xl font-bold">비슷한 문장 찾기</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      본격적인 학습 전 몸풀기입니다. 앞으로 모든 챕터가 이 페이지처럼 진행돼요.
      설명 카드를 읽고, 실험을 직접 만져 보고, 문제를 풀면 진도가 채워집니다.
      막히면 <b>힌트</b>가 있고, 두 번 틀리면 <b>해설</b>도 열 수 있으니 부담 없이 시작하세요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      실험 두 개로 7부 전체의 핵심 문장을 얻습니다.
      <b>"의미는 위치다: 비슷함은 가까움으로 잴 수 있다."</b>
      그리고 글자만 세는 컴퓨터가 왜 "뜻"을 놓치는지 직접 목격합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 사람은 쉽게 하는데, 컴퓨터는 왜 못할까</h2>
    <ReviewFlag id="sample-s1" chapter="sample" label="1. 사람은 쉽게 하는데, 컴퓨터는 왜 못할까" />
    <p class="leading-relaxed text-slate-700">
      "회식 장소 어디로 정했어?"와 "저녁 모임 위치는 결정됐나요?", 여러분은 두 문장이
      같은 뜻임을 <b>즉시</b> 압니다. 겹치는 단어가 하나도 없는데도요.
      그런데 컴퓨터의 가장 소박한 방법(글자 겹침 세기)으로 재면 어떻게 될까요?
      아래에서 직접 확인해 보세요.
    </p>

    <MeaningMapLab />

    <ConceptCard tone="tip" title="핵심 관찰: 문제는 '뜻'을 숫자로 바꾸는 것">
      실험 ①에서 글자 겹침은 <b>단어가 같은 것</b>과 <b>뜻이 같은 것</b>을 구분하지 못했습니다.
      실험 ②에서 여러분이 찾은 해법은 <b>뜻이 비슷한 것끼리 지도에서 가까이 두기</b>였어요.
      뜻을 위치(좌표)로 바꾸면, "비슷한가?"라는 어려운 질문이
      <b>"가까운가?"라는 계산 가능한 질문</b>이 됩니다. 이 전환이 7부의 전부예요.
    </ConceptCard>

    <!-- 본문 중간 미니체크 (문제 세트와 별개, 진도에 미포함) -->
    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="글자 겹침(공통 단어 수)으로 유사도를 재는 방법의 맹점은?"
      :choices="['단어가 같아도 뜻이 다르고, 뜻이 같아도 단어가 다를 수 있다', '계산이 너무 오래 걸린다', '한국어에는 적용할 수 없다', '맹점이 없다. 충분한 방법이다']"
      :answer="0"
      :hints="['실험 ①에서 B(단어 겹침 1등)와 A(정답인데 겹침 0)를 떠올려 보세요.']"
      explanation="'회식 장소 예약은 제가 할게요'는 단어가 겹치지만 뜻이 다르고, '저녁 모임 위치는 결정됐나요?'는 단어가 안 겹치지만 뜻이 같았죠. 글자와 뜻은 다른 층위입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 뜻을 좌표로: 임베딩의 재등장</h2>
    <ReviewFlag id="sample-s2" chapter="sample" label="2. 뜻을 좌표로: 임베딩의 재등장" />
    <p class="leading-relaxed text-slate-700">
      실험 ②의 지도에는 이름이 있습니다. 사실 여러분은 이미 만난 적이 있어요.
      4부 3장에서 "단어를 벡터로 바꾸는 것"을
      <b>임베딩</b>이라 불렀죠. 4부에서는 임베딩을 <b>트랜스포머의 입력</b>으로 썼다면,
      7부에서는 그 벡터들이 모여 사는 <b>공간 자체</b>를 탐험합니다.
      거기서 "가까움"을 재는 법(2장), 공간의 이상한 성질(4장), 그리고 그 위에 세우는
      검색 시스템(6~8장)까지.
    </p>

    <ConceptCard tone="note" title="새 용어: 임베딩 / 유사도">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>임베딩</b> (embedding). 뜻: 단어·문장·문서의 <b>뜻을 좌표(벡터)로 바꾼 것</b>. 실험 ②에서 여러분이 손으로 한 일을,
          실제로는 모델이 수백~수천 차원에서 합니다(어떻게 배우는지는 9장).
        </li>
        <li>
          <b>유사도</b> (similarity). 뜻: 두 대상이 얼마나 비슷한가를 나타내는 <b>숫자</b>. 임베딩 덕분에
          "비슷한가?"가 "지도에서 가까운가?"라는 계산 문제가 됩니다. 재는 자는 2장에서.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'의미는 위치다'라는 이 과정의 핵심 문장이 뜻하는 것은?"
      :choices="['뜻을 좌표로 바꾸면 비슷함을 가까움(거리)으로 계산할 수 있다', '단어의 사전 순서가 중요하다', '문장이 길수록 뜻이 많다', '지도 앱으로 공부하라는 뜻']"
      :answer="0"
      explanation="어려운 질문(비슷한가?)을 계산 가능한 질문(가까운가?)으로 바꾸는 전환이에요. 실험 ②에서 토끼를 동물들 근처에 놓은 그 감각입니다."
    />

    <DetailsCard title="➕ 더 깊이: 이 지도로 무엇을 만들 수 있길래?">
      "AI가 우리 회사 문서를 아는 것처럼 답한다." 요즘 가장 흔한 사내 AI 기능의 핵심이
      바로 이 지도입니다. 회사 문서를 전부 지도에 올려 두고(임베딩), 질문이 들어오면
      질문도 지도에 올린 뒤 <b>가장 가까운 문서를 찾아</b> AI에게 건네주는 것.
      이 파이프라인의 이름이 <b>RAG</b>(검색 증강 생성, Retrieval-Augmented Generation)이고,
      1장에서 전체 지도를 그린 뒤 10장에서 직접 조립합니다.
      (6부를 봤다면, 조련 없이 문맥으로 지식을 넣는 길을 다룬 6부 2장의 이야기가 여기서 이어집니다.)
    </DetailsCard>

    <ReviewFlag id="sample-ai" chapter="sample" label="🤖 AI 연결 · 다시 쓰는 수학: 1부 1장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 · 다시 쓰는 수학: 1부 1장">
      실험 ②의 지도는 <PartLink :part="1" ch="ch1">1부 1장</PartLink>에서 배운
      <b>좌표평면</b> 그대로입니다. 점의 위치를 숫자 두 개로 적던 그 평면에
      "단어의 뜻"을 올렸을 뿐이에요. 7부 내내 쓸 도구도 1부의 것들입니다:
      좌표(1장), 그리고 다음 장부터 본격 등장할 <b>내적(2장)</b>.
      수학이 새로 필요한 게 아니라, 아는 수학의 새 무대입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="비슷한 문장 찾기: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="임베딩이 하는 일을 한 줄로 고르면?"
        :choices="['단어·문장의 뜻을 좌표(벡터)로 바꾼다', '문장의 맞춤법을 고친다', '글자 수를 센다', '문서를 압축해 저장한다']"
        :answer="0"
        explanation="뜻 → 위치. 실험 ②에서 토끼에게 자리를 찾아준 일이 바로 임베딩입니다."
      />
      <Quiz
        difficulty="easy"
        question="의미 지도에서 '비슷한 뜻'은 무엇으로 나타나나요?"
        :choices="['가까운 거리', '같은 글자 수', '같은 색깔', '빠른 속도']"
        :answer="0"
        explanation="비슷함 = 가까움. 이 대응이 7부 전체를 지탱하는 한 줄입니다."
      />
      <Quiz
        difficulty="easy"
        question="겹치는 단어가 하나도 없는 두 문장은 뜻이 같을 수 없다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. '회식 장소 어디로 정했어?'와 '저녁 모임 위치는 결정됐나요?'가 그 반례였죠."
      />
      <Quiz
        difficulty="easy"
        question="실험 ①에서 질문과 B('회식 장소 예약은 제가 할게요')의 겹치는 단어는 몇 개였나요?"
        type="numeric"
        :answer="2"
        explanation="'회식'과 '장소' 2개예요. 그래서 글자 겹침 채점에선 1등이었지만, 뜻은 질문이 아니라 제안이었습니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="'비슷한가?'라는 질문을 임베딩이 어떤 질문으로 바꿔 주나요?"
        :choices="['지도에서 가까운가? 계산 가능한 거리 문제', '누가 먼저 말했나? 순서 문제', '몇 글자인가? 길이 문제', '어느 나라 말인가? 언어 문제']"
        :answer="0"
        :hints="['핵심 문장: 의미는 OO다.']"
        explanation="뜻을 좌표로 바꾸는 순간, 애매한 판단이 거리 계산이 됩니다. 컴퓨터가 잘하는 일로요."
      />
      <Quiz
        difficulty="medium"
        question="실험 ②의 2차원 지도와 실제 임베딩의 차이로 옳은 것은?"
        :choices="['실제는 수백~수천 차원이고, 좌표를 사람이 아니라 모델이 배운다', '실제도 항상 2차원이다', '실제는 좌표를 쓰지 않는다', '차이가 없다']"
        :answer="0"
        explanation="원리는 같고 규모가 다릅니다. 고차원의 이상한 성질은 4장에서, 모델이 좌표를 배우는 법은 9장에서 만나요."
      />
      <Quiz
        difficulty="medium"
        question="4부 3장의 임베딩과 7부의 관점 차이로 알맞은 것은?"
        :choices="['4부는 트랜스포머의 입력으로 썼고, 7부는 벡터들이 사는 공간 자체를 탐험한다', '4부와 7부의 임베딩은 완전히 다른 개념이다', '7부에서는 임베딩을 쓰지 않는다', '4부가 7부보다 어려운 내용이다']"
        :answer="0"
        explanation="같은 임베딩이 4부에선 입력 재료, 7부에선 검색의 무대입니다."
      />
      <Quiz
        difficulty="medium"
        question="키워드(글자 겹침) 검색이 잘 통하는 경우와 무너지는 경우를 옳게 짝지은 것은?"
        :choices="['고유명사·정확한 용어 검색엔 강하고, 같은 뜻을 다른 말로 물으면 무너진다', '항상 통한다', '항상 무너진다', '짧은 문장엔 통하고 긴 문장엔 무너진다']"
        :answer="0"
        :hints="['\'결재선 변경\'을 정확히 치면 잘 찾지만, \'승인자 바꾸는 법\'이라고 물으면?']"
        explanation="글자가 곧 뜻인 경우(고유명사·코드·용어)엔 키워드가 강합니다. 표현이 다양해지는 순간 의미 검색이 필요해져요. 그래서 실무는 둘을 함께 씁니다(1장)."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="'AI가 회사 문서를 아는 것처럼 답한다'(RAG)의 뼈대를 이 챕터의 언어로 옮기면?"
        :choices="['문서들을 의미 지도에 올려 두고, 질문도 지도에 올려 가장 가까운 문서를 찾아 AI에게 건넨다', 'AI를 회사 문서로 재훈련한다', '문서를 전부 프롬프트에 붙여 넣는다', '문서를 요약해 암기시킨다']"
        :answer="0"
        :hints="['더 깊이 카드: 지도(임베딩) + 가까움(검색) + 건네주기.']"
        explanation="임베딩(지도) → 유사도 검색(가까운 문서) → 문맥으로 전달. 재훈련(조련)이 아니라 검색이라는 게 포인트예요. 6부와의 대비는 1·8장에서 깊게 다룹니다."
      />
      <Quiz
        difficulty="hard"
        question="의미 지도를 만들 때 '토끼'를 동물 근처에 놓는 게 자연스러운 근본 이유는?"
        :choices="['지도의 존재 목적이 \'가까움으로 비슷함을 재는 것\'이라서, 배치 규칙이 곧 쓸모를 결정한다', '토끼가 귀여워서', '동물 단어가 먼저 등장했기 때문에', '알파벳 순서상 그 위치라서']"
        :answer="0"
        :hints="['지도가 무엇을 위해 존재하는지 생각해 보세요. 나중에 이 지도로 무엇을 계산하나요?']"
        explanation="지도는 장식이 아니라 계산 도구입니다. '가까움 = 비슷함'이 지켜져야 검색·추천·분류가 전부 거리 계산으로 풀려요. 모델이 임베딩을 배울 때의 목표(9장)도 정확히 이것입니다."
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
        본 학습도 정확히 이렇게 진행됩니다. 다음 1장에서는 검색의 진화와 RAG를 보며,
        이 지도로 무엇을 만들 수 있는지 전체 그림을 폅니다.
      </p>
      <RouterLink
        to="/ch/ch1"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        1장: 검색의 진화와 RAG →
      </RouterLink>
    </div>
  </article>
</template>
