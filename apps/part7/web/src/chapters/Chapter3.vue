<script setup lang="ts">
// 3장 — 임베딩 공간 탐험: 클러스터, 의미의 방향, 벡터 산수(왕 − 남자 + 여자).
// 회수하는 수학: 1부 2장 벡터 연산(덧셈·뺄셈) · 4부 3장 임베딩.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import EmbeddingSpaceLab from '@/components/EmbeddingSpaceLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch3')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">3장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">임베딩 공간 탐험</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      2장에서 가까움을 재는 자(코사인)를 손에 넣었으니, 이제 그 자를 들고
      임베딩 공간 <b>안</b>을 둘러볼 차례입니다. 이 공간은 단어를 아무렇게나 쌓아 둔
      창고가 아니라 놀랄 만큼 <b>구조적인 지도</b>예요 — 비슷한 것끼리 모여 있고(클러스터),
      심지어 <b>방향에도 뜻이 담겨</b> 있습니다. 그 유명한 "왕 − 남자 + 여자 = ?"를
      직접 계산해 봅니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      임베딩 공간의 두 구조를 눈과 손으로 확인합니다 — ① <b>클러스터</b>: 비슷한 뜻은 모인다,
      ② <b>의미의 방향</b>: 뜻의 변화(남성→여성 같은)는 일정한 방향 이동이다. 그리고 그 결론으로
      1부 2장의 벡터 덧셈·뺄셈이 <b>뜻의 계산</b>이 되는 순간을 목격합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 창고가 아니라 지도 — 클러스터</h2>
    <ReviewFlag id="ch3-s1" chapter="ch3" label="1. 창고가 아니라 지도 — 클러스터" />
    <p class="leading-relaxed text-slate-700">
      워밍업에서 토끼를 동물들 근처에 놓았을 때, 여러분은 이미 이 구조를 만들고 있었습니다 —
      비슷한 뜻의 단어들이 공간에서 <b>무리 지어 모이는 것</b>, 이걸 <b>클러스터</b>라 부릅니다.
      실제 임베딩 공간에는 동물 클러스터, 음식 클러스터, 프로그래밍 용어 클러스터…가
      은하처럼 떠 있어요. 검색이 작동하는 이유가 바로 이것입니다:
      질문을 지도에 올리면 <b>같은 주제 클러스터에 떨어지고</b>, 그 근처가 곧 검색 결과니까요.
    </p>
    <p class="mt-2 leading-relaxed text-slate-700">
      그런데 아래 지도를 관찰하다 보면, 클러스터 <b>안쪽</b>에 더 미세한 구조가 하나 숨어 있습니다.
    </p>

    <EmbeddingSpaceLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 위치만 뜻이 아니다, 방향도 뜻이다">
      화살표 실험에서 남자→여자, 왕자→공주, 왕→여왕이 <b>전부 평행하고 길이가 같았습니다.</b>
      즉 "남성을 여성으로 바꾼다"는 <b>관계</b>가 이 공간에서는 하나의 <b>일정한 방향 벡터</b>로
      존재해요. 워밍업의 "의미는 위치다"가 이렇게 확장됩니다 —
      <b>의미는 위치에, 의미의 변화는 방향에.</b>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="실험 ①에서 세 화살표(남자→여자, 왕자→공주, 왕→여왕)가 평행하고 길이가 같다는 것은 무엇을 뜻하나요?"
      :choices="['\'남성→여성\'이라는 뜻의 변화가 공간에서 일정한 방향 이동으로 표현된다', '세 단어 쌍의 철자가 비슷하다', '지도를 그린 사람의 실수다', '단어들이 모두 같은 뜻이다']"
      :answer="0"
      :hints="['화살표 = 뺄셈 벡터 (여자 − 남자). 세 개가 같다는 건?']"
      explanation="여자−남자, 공주−왕자, 여왕−왕이 모두 같은 벡터 — 성별이라는 관계가 방향 하나에 담겨 있다는 뜻입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 의미의 산수 — 벡터 연산의 재등장</h2>
    <ReviewFlag id="ch3-s2" chapter="ch3" label="2. 의미의 산수 — 벡터 연산의 재등장" />
    <p class="leading-relaxed text-slate-700">
      방향이 뜻을 담는다면, 놀라운 일이 가능해집니다. <b>1부 2장의 벡터 덧셈·뺄셈</b> —
      화살표 이어 붙이기 — 로 <b>뜻을 계산</b>할 수 있어요. "왕"에서 "남자"의 성분을 빼면
      <b>"왕위"라는 뜻만 남고</b>, 거기에 "여자"를 더하면:
    </p>
    <MathBlock expr="\vec{v}_{\text{왕}} - \vec{v}_{\text{남자}} + \vec{v}_{\text{여자}} \;\approx\; \vec{v}_{\text{여왕}}" />
    <p class="leading-relaxed text-slate-700">
      실험 ②에서 직접 확인했듯, 계산 결과 지점의 최근접 이웃이 정말 <b>여왕</b>입니다.
      이 현상을 <b>단어 유추</b>(word analogy)라 부르고, 2013년 <b>word2vec</b>이라는
      단어 임베딩 모델이 이 산수를 해내는 게 알려지면서 임베딩 연구가 폭발했어요.
      사람이 성별 방향을 가르친 적이 없는데, 문맥을 배우다 보니 <b>저절로 생긴 구조</b>라는 게
      핵심입니다(어떻게 배우는지는 9장).
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="벡터 뺄셈 '여자 − 남자'가 담고 있는 것은?"
      :choices="['남성→여성으로 바꾸는 방향 (뜻의 변화)', '두 단어의 글자 수 차이', '두 단어의 사전 순서', '아무 의미 없는 숫자']"
      :answer="0"
      explanation="뺄셈 벡터 = '남자에서 여자로 가는 화살표'. 이 화살표를 왕에 더하면 여왕에 도착하죠 — 방향이 곧 관계입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 현실 체크 — toy 지도와 실전의 거리</h2>
    <ReviewFlag id="ch3-s3" chapter="ch3" label="3. 현실 체크 — toy 지도와 실전의 거리" />
    <ul class="mt-2 list-disc space-y-2 pl-6 leading-relaxed text-slate-700">
      <li>
        <b>차원</b>: 우리 지도는 2차원, 실제는 수백~수천 차원입니다. 구조는 같지만 고차원에는
        직관을 배반하는 성질이 있어요 — 다음 장(4장)의 주제입니다.
      </li>
      <li>
        <b>≈(근사)</b>: 실제 임베딩에서 유추 산수는 정확히 떨어지지 않습니다. 계산 지점에서
        <b>가장 가까운 단어를 찾는 것</b>이고, 자주 맞지만 늘 맞진 않아요 — 지도는 유용하되 완벽하지 않습니다.
      </li>
      <li>
        <b>단어에서 문장으로</b>: 왕·여왕 산수는 <b>단어 임베딩</b>(word2vec) 시절의 이야기이고,
        실무 RAG가 쓰는 것은 <b>문장·문서 임베딩</b>입니다. 하지만 공간의 감각은 똑같아요 —
        비슷한 주제의 문서가 모이고(클러스터), 그래서 검색이 됩니다.
      </li>
    </ul>

    <ConceptCard tone="note" title="새 용어: 클러스터 / 단어 유추 / word2vec">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>클러스터</b> (cluster) — 읽는 법: 클러스터.
          뜻: 임베딩 공간에서 비슷한 뜻의 단어·문서가 <b>모여 있는 군집</b>. 의미 검색이 작동하는 토대.
        </li>
        <li>
          <b>단어 유추</b> (word analogy) — 읽는 법: 워드 애널로지.
          뜻: "왕 − 남자 + 여자 ≈ 여왕"처럼 벡터 덧셈·뺄셈으로 <b>단어 관계를 계산</b>하는 것.
        </li>
        <li>
          <b>word2vec</b> — 읽는 법: 워드투벡.
          뜻: 2013년 구글이 공개한 <b>단어 임베딩 학습법</b>. 주변 단어 맞히기를 배우다 보니
          유추 산수가 되는 공간이 저절로 생겨 임베딩 시대를 연 모델입니다.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">임베딩 공간은 창고가 아니라 지도다 — 뜻은 위치에, 뜻의 변화는 방향에</p>
      <p class="mt-1 text-sm text-indigo-600">그래서 벡터 덧셈·뺄셈(1부 2장)이 뜻의 계산이 됩니다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="실무 RAG 검색이 임베딩하는 대상은 보통 단어 하나가 아니라 문장·문서 전체다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 왕·여왕 산수는 단어 임베딩(word2vec)의 이야기이고, RAG는 문장·문서 임베딩을 씁니다 — 다만 '비슷한 것끼리 모인다'는 공간 감각은 동일해요."
    />

    <DetailsCard title="➕ 더 깊이: 방향은 공짜가 아니다 — 임베딩 편향">
      성별 방향이 생긴 이유는 모델이 <b>훈련 텍스트의 통계</b>를 배웠기 때문입니다. 그런데 텍스트에는
      세상의 편견도 담겨 있어요 — 실제로 초기 word2vec 에서 "의사 − 남자 + 여자"가 <b>간호사</b>를
      내놓는 식의 결과가 보고됐습니다(직업에 성별 고정관념 방향이 학습된 것). 이를
      <b>임베딩 편향</b>(embedding bias)이라 부르고, 채용·검색 시스템에 임베딩을 쓸 때 반드시
      점검하는 실무 항목입니다. 모델은 규범이 아니라 <b>데이터의 패턴</b>을 배운다 — 6부 4장(보상 모델의
      한계)에서 본 교훈이 여기서도 반복되는 거죠.
    </DetailsCard>

    <ReviewFlag id="ch3-ai" chapter="ch3" label="🤖 AI 연결 — 회수하는 수학: 1부 2장 · 4부 3장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 1부 2장 · 4부 3장">
      의미의 산수는 새 수학이 아닙니다 — <b><PartLink :part="1" ch="ch2">1부 2장</PartLink></b>에서
      화살표 이어 붙이기로 배운 <b>벡터 덧셈·뺄셈</b> 그대로예요. 그 연산이 임베딩 공간에서는
      "관계를 옮겨 적용하기"가 됩니다. 그리고 이 공간 자체는
      <b><PartLink :part="4" ch="ch3">4부 3장</PartLink></b>에서 트랜스포머의 입력으로 만났던
      그 임베딩이고요 — LLM이 "왕과 여왕은 성별만 다른 관계"를 아는 듯 답할 수 있는 이유의
      절반이 이 기하 구조입니다. 남은 질문 — <b>이 좋은 지도를 누가 그렸나?</b> — 는 9장(대조 학습)에서.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="임베딩 공간 탐험 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="임베딩 공간에서 클러스터란?"
        :choices="['비슷한 뜻의 단어·문서가 모여 있는 군집', '가장 긴 벡터들의 모임', '좌표가 정수인 단어들', '컴퓨터 부품의 일종']"
        :answer="0"
        explanation="동물끼리, 음식끼리, 같은 주제 문서끼리 모이는 무리 — 의미 검색이 작동하는 토대입니다."
      />
      <Quiz
        difficulty="easy"
        question="왕 − 남자 + 여자 ≈ ?"
        :choices="['여왕', '왕자', '남자', '사과']"
        :answer="0"
        explanation="왕에서 남성 성분을 빼고 여성 성분을 더하면 여왕 — 단어 유추(word analogy)의 대표 예입니다."
      />
      <Quiz
        difficulty="easy"
        question="임베딩 공간에서 '뜻의 변화'(예: 남성→여성)는 일정한 방향 이동으로 나타날 수 있다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 남자→여자, 왕자→공주, 왕→여왕 화살표가 모두 평행했던 것이 그 증거예요."
      />
      <Quiz
        difficulty="easy"
        question="toy 좌표에서 왕 = (2, 6), 남자 = (2, 2), 여자 = (4, 2)일 때, 왕 − 남자 + 여자의 x좌표는?"
        type="numeric"
        :answer="4"
        explanation="2 − 2 + 4 = 4. y좌표는 6 − 2 + 2 = 6 — 그래서 (4, 6), 정확히 여왕의 자리입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="같은 지도에서 여왕 − 여자 + 남자 ≈ ?"
        :choices="['왕', '공주', '여자', '왕자']"
        :answer="0"
        :hints="['여왕에서 여성 성분을 빼고 남성 성분을 더하면?']"
        explanation="성별 방향을 반대로 적용한 것 — 여왕에서 왕으로 돌아갑니다. 방향은 양방향으로 작동해요."
      />
      <Quiz
        difficulty="medium"
        question="유추 산수의 결과에 ≈(근사)를 붙이는 이유는?"
        :choices="['실제 임베딩에선 계산 지점에 단어가 정확히 없어서, 가장 가까운 단어를 찾는 것이기 때문', '컴퓨터가 덧셈을 못 해서', '좌표가 매일 바뀌기 때문', '근사가 아니라 항상 정확하다']"
        :answer="0"
        explanation="계산 지점 근처의 최근접 이웃을 찾는 방식이라 자주 맞지만 늘 맞진 않습니다 — 지도는 유용하되 완벽하지 않아요."
      />
      <Quiz
        difficulty="medium"
        question="왕·여왕 유추 산수와 실무 RAG의 관계로 옳은 것은?"
        :choices="['유추는 단어 임베딩(word2vec)의 현상이고, RAG는 문장·문서 임베딩을 쓴다 — 공간 감각은 같다', 'RAG 검색은 매번 유추 산수를 수행한다', '문장 임베딩에는 클러스터가 없다', '둘은 아무 관련이 없다']"
        :answer="0"
        explanation="RAG가 빌려 쓰는 것은 산수 자체가 아니라 '비슷한 뜻은 모인다'는 공간 구조입니다 — 질문이 같은 주제 클러스터에 떨어지니 검색이 되는 거죠."
      />
      <Quiz
        difficulty="medium"
        question="아무도 '성별 방향'을 가르치지 않았는데 임베딩 공간에 그 방향이 생긴 이유는?"
        :choices="['문맥(주변 단어) 맞히기를 배우다 보니 단어 관계의 통계가 기하 구조로 저절로 새겨져서', '개발자가 좌표를 손으로 배치해서', '사전 순서가 반영돼서', '우연의 일치일 뿐이다']"
        :answer="0"
        :hints="['word2vec이 배운 과제가 무엇이었는지 — 그리고 그 부산물.']"
        explanation="왕과 여왕은 비슷한 문맥에 나오되 성별 단어와의 어울림만 다릅니다. 그 통계 패턴이 방향으로 새겨진 것 — 학습의 원리는 9장에서 열어 봅니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="초기 word2vec에서 '의사 − 남자 + 여자'가 '간호사'를 내놓은 현상의 올바른 진단은?"
        :choices="['훈련 텍스트의 사회적 고정관념이 방향으로 학습된 임베딩 편향 — 모델은 규범이 아니라 데이터 패턴을 배운다', '의사와 간호사가 실제로 같은 직업이라서', '벡터 덧셈에 버그가 있어서', '여자라는 단어의 좌표가 잘못돼서']"
        :answer="0"
        :hints="['더 깊이 카드 — 방향은 공짜가 아니다.']"
        explanation="텍스트 속 편견까지 통계로 배워 방향이 된 것입니다. 채용·검색에 임베딩을 쓸 때 반드시 점검하는 실무 항목이에요 — 6부 4장(보상 모델도 데이터의 취향을 배운다)과 같은 교훈."
      />
      <Quiz
        difficulty="hard"
        question="클러스터 구조가 무너진(모든 주제가 뒤섞인) 임베딩 모델로 RAG를 만들면 어떻게 되나?"
        :choices="['가까움이 비슷함을 뜻하지 않게 되어 엉뚱한 문서가 검색된다 — 임베딩 품질이 곧 검색 품질', '아무 문제 없다 — 검색은 키워드로 하니까', '오히려 검색이 빨라진다', '프롬프트가 길어질 뿐 결과는 같다']"
        :answer="0"
        :hints="['1장의 RAG 5단계에서 검색이 의존하는 가정이 무엇이었죠?']"
        explanation="RAG의 검색은 '가까움 = 비슷함'이라는 지도의 약속 위에 서 있습니다. 지도가 엉키면 그 위의 모든 것이 무너져요 — 그래서 임베딩 모델 선택·평가가 중요합니다(7·9장)."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch3')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">3장 완료 — 지도의 구조를 읽을 수 있게 됐어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 4장 — 핵심 챕터입니다. 이 좋은 지도를 수백 차원으로 올리면 이상한 일이 벌어져요:
        아무 벡터나 뽑으면 거의 직교. 고차원의 저주, 그런데도 임베딩이 작동하는 이유.
      </p>
      <RouterLink
        to="/ch/ch4"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        4장 — 고차원의 저주 →
      </RouterLink>
    </div>
  </article>
</template>
