<script setup lang="ts">
// 5장 — 지도 그리기: 차원 축소. PCA 재회(1부 8장) + t-SNE·UMAP 지도 읽는 법(왜곡).
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import DimReduceLab from '@/components/DimReduceLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch5')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">5장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">지도 그리기 — 차원 축소</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      4장에서 임베딩의 진짜 무대가 수백 차원임을 봤습니다. 문제는 — 사람 눈은
      2~3차원까지만 볼 수 있다는 것. 그런데 인터넷에서 본 "임베딩 지도" 그림들은 다
      평면이었죠? 누군가 수백 차원을 <b>2차원으로 눌러 그린 것</b>입니다. 이번 장은
      그 누르는 법(<b>차원 축소</b>)과, 눌린 지도를 <b>속지 않고 읽는 법</b>을 다룹니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      두 가지를 가져갑니다 — ① <b>PCA</b>(1부 8장 재회): "가장 넓게 퍼진 방향을 축으로"라는
      원리를 손으로 재발견, ② 2D 임베딩 지도의 <b>왜곡 읽는 법</b>: 이웃(클러스터 안)은 믿되,
      클러스터 사이 거리·크기·모양은 믿지 않기.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 요약의 기술 — 무엇을 버릴 것인가</h2>
    <p class="leading-relaxed text-slate-700">
      512차원을 2차원으로 줄이는 건 512쪽짜리 보고서를 두 줄로 요약하는 일입니다 —
      <b>무언가는 반드시 버려집니다.</b> 4장에서 봤듯 고차원의 용량은 2차원과 비교가 안 되니까요.
      그래서 차원 축소의 진짜 질문은 "어떻게 안 잃을까"가 아니라 <b>"무엇을 남길까"</b>입니다.
      가장 고전적인 답이 PCA예요 — <b>데이터가 가장 넓게 퍼진 방향을 남기자.</b>
      아래에서 직접 PCA가 되어 보세요.
    </p>

    <DimReduceLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 투영은 내적, 좋은 축은 분산 최대">
      축을 돌릴 때 계산된 "그림자 좌표"는 <b>점과 축 방향 벡터의 내적</b>입니다(또 내적이죠 — 2장).
      그리고 그림자가 가장 넓게 퍼지는 축이 정보를 제일 덜 잃는 축 — 그 방향을 찾는 것이
      <b>PCA</b>(주성분 분석)입니다. 1부 8장에서 "데이터 구름의 주성분 찾기"로 만났던
      바로 그 도구예요. 수백 차원 임베딩의 2D 지도 중 가장 기본형이 PCA 투영입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="PCA가 첫 번째 축으로 고르는 방향은?"
      :choices="['데이터가 가장 넓게 퍼진(분산 최대) 방향', '항상 x축', '데이터가 가장 좁게 모인 방향', '무작위 방향']"
      :answer="0"
      :hints="['실험 ①에서 그림자 분산이 최대가 되던 각도.']"
      explanation="분산 최대 방향 = 정보를 제일 덜 잃는 요약 축. 두 번째 축은 그다음으로 퍼진 (첫 축과 직교인) 방향입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 이웃을 지키는 지도 — t-SNE와 UMAP</h2>
    <p class="leading-relaxed text-slate-700">
      PCA는 <b>전역의 퍼짐</b>을 지키는 선형 투영이라, 수백 차원의 꼬불꼬불한 클러스터 구조가
      뭉개져 보일 때가 있습니다. 그래서 시각화 실무에서는 다른 전략의 지도가 인기예요 —
      "<b>멀리는 틀려도 좋으니, 각 점의 이웃만은 지키자</b>". 이 전략의 대표가
      <b>t-SNE</b>와 <b>UMAP</b>입니다. 클러스터를 또렷하게 보여 주는 대신,
      대가를 치릅니다: <b>클러스터 사이의 거리·크기·모양이 왜곡</b>돼요.
      실험 ②에서 그 거짓말을 직접 목격했죠 — 지도에서 제일 멀어 보이던 A-C가
      실제로는 A-B보다 가까웠습니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 차원 축소 / PCA / t-SNE · UMAP">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>차원 축소</b> (dimensionality reduction) — 읽는 법: 디멘셔널리티 리덕션.
          뜻: 고차원 데이터를 낮은 차원으로 요약하는 것. 무엇을 남기고 무엇을 버릴지가 방법마다 다릅니다.
        </li>
        <li>
          <b>PCA</b> (Principal Component Analysis, 주성분 분석) — 읽는 법: 피시에이.
          뜻: <b>분산 최대 방향</b>들을 축으로 고르는 선형 차원 축소. 결정적(돌릴 때마다 같음)이고
          빠르며, 전역 구조를 대체로 보존. 1부 8장의 재회.
        </li>
        <li>
          <b>t-SNE / UMAP</b> — 읽는 법: 티스니 / 유맵.
          뜻: <b>이웃 관계 보존</b>에 집중하는 비선형 지도. 클러스터가 또렷하게 보이는 대신
          클러스터 간 거리·크기·모양은 왜곡되고, 설정값에 따라 모양이 크게 달라집니다.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">2D 지도는 요약이다 — 이웃은 믿되, 클러스터 사이 거리와 모양은 믿지 마라</p>
      <p class="mt-1 text-sm text-indigo-600">그리고 검색은 지도(2D)가 아니라 원래 공간(수백 차원)에서 — 지도는 관찰용입니다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="t-SNE로 그린 임베딩 지도에서 비교적 믿어도 되는 정보는?"
      :choices="['어떤 점들이 같은 무리(이웃)로 묶이는가', '클러스터 사이의 거리', '클러스터의 크기와 모양', '축의 눈금 값']"
      :answer="0"
      explanation="t-SNE·UMAP은 이웃 보존이 목표라 무리 짓기는 믿을 만하지만, 무리 사이 거리·크기·모양·축 값은 왜곡됩니다 — 실험 ②의 A-C 반전이 그 예."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="수백 차원 임베딩을 2차원으로 줄여도 정보 손실 없이 완벽하게 보존할 수 있다."
      type="truefalse"
      :answer="1"
      explanation="거짓입니다. 4장에서 본 용량 차이 때문에 불가능해요 — 그래서 '무엇을 남길까'(분산? 이웃?)가 방법을 가르고, 어떤 지도든 왜곡을 동반합니다."
    />

    <DetailsCard title="➕ 더 깊이: 같은 데이터, 다른 지도 — 그리고 실무 도구">
      t-SNE에는 perplexity, UMAP에는 n_neighbors 같은 설정값이 있는데, 이 값에 따라
      <b>같은 데이터가 전혀 다른 모양의 지도</b>가 됩니다. 지도 한 장으로 결론 내리지 말고
      설정을 바꿔 여러 장을 보는 게 정석이에요. 실무에서는 TensorFlow의 <b>Embedding Projector</b>
      같은 도구에 임베딩을 올려 PCA·t-SNE·UMAP을 바꿔 가며 봅니다. RAG 개발에서의 쓸모:
      사내 문서 임베딩을 지도로 그려 <b>중복 문서 뭉치</b>(같은 자리에 겹친 점들), <b>엉뚱한 데 섞인
      문서</b>(잘못된 파싱·언어 혼입)를 눈으로 잡아내는 <b>디버깅용</b>입니다 — 검색 자체는 늘
      원 공간에서 하고요(6장).
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 1부 8장">
      이 장의 심장은 <b><PartLink :part="1" ch="ch8">1부 8장</PartLink></b>의 PCA입니다 —
      "데이터 구름에서 주성분(가장 퍼진 방향) 찾기"가 임베딩 공간을 종이에 펴는 기본 도구가
      됐어요. 그림자 좌표가 내적이었다는 점에서 1부 2장도 조용히 일하고 있고요.
      이제 지도 보는 법까지 갖췄으니, 다음 질문은 실전입니다 —
      <b>수만 개 문서 중 질문과 가장 가까운 것을 어떻게 순식간에 찾는가?</b>
      kNN에서 벡터 DB까지, 6장에서 검색의 엔진룸을 엽니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="차원 축소 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="차원 축소가 필요한 가장 기본적인 이유는?"
        :choices="['사람 눈은 2~3차원까지만 볼 수 있는데 임베딩은 수백 차원이라서', '고차원 벡터는 저장이 불가능해서', '2차원이 항상 검색이 더 정확해서', '차원이 높으면 코사인을 못 구해서']"
        :answer="0"
        explanation="시각화(관찰·디버깅)를 위해 수백 차원을 평면에 요약하는 것 — 검색은 여전히 원 공간에서 합니다."
      />
      <Quiz
        difficulty="easy"
        question="PCA가 축을 고르는 기준은?"
        :choices="['그림자(투영)의 분산이 최대가 되는 방향', '알파벳 순서', '점이 가장 적은 방향', '무작위 추첨']"
        :answer="0"
        explanation="분산 최대 = 정보를 제일 덜 잃는 요약 — 실험 ①에서 축을 돌리며 확인한 그 원리입니다."
      />
      <Quiz
        difficulty="easy"
        question="t-SNE 지도에서 클러스터 사이의 거리는 실제 고차원 거리를 정확히 반영한다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. t-SNE는 이웃 보존이 목표라 클러스터 간 거리·크기·모양은 왜곡돼요 — A-C 반전 실험이 그 증거."
      />
      <Quiz
        difficulty="easy"
        question="점 (3, 4)를 x축 방향 단위 벡터 (1, 0)에 투영한 그림자 좌표는?"
        type="numeric"
        :answer="3"
        explanation="투영 = 내적: 3×1 + 4×0 = 3. y 성분(4)은 버려집니다 — 이것이 '요약'의 수학적 실체예요."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="점 (3, 4)를 단위 축 (0.6, 0.8)에 투영한 그림자 좌표를 내적으로 구하세요."
        :steps="[
          { lhs: '3 \\times 0.6', answer: 1.8 },
          { lhs: '4 \\times 0.8', answer: 3.2 },
          { lhs: '\\text{합}', answer: 5 },
        ]"
        :hints="['투영 좌표 = 점 · 축 (성분끼리 곱해 더하기).']"
        explanation="1.8 + 3.2 = 5.0 — 이 점은 (0.6, 0.8) 방향 축 위에서 5.0 위치에 그림자를 드리웁니다. 투영은 내적, 2장의 그 연산입니다."
      />
      <Quiz
        difficulty="medium"
        question="PCA와 t-SNE의 성격을 옳게 비교한 것은?"
        :choices="['PCA는 선형·결정적·전역 퍼짐 보존, t-SNE는 비선형·설정 민감·이웃 보존', 'PCA는 이웃 보존, t-SNE는 분산 보존', '둘 다 완전히 같은 결과를 낸다', 't-SNE가 항상 모든 면에서 우월하다']"
        :answer="0"
        explanation="남기는 것이 다릅니다 — PCA는 전역 퍼짐, t-SNE·UMAP은 이웃. 그래서 용도(대략 구조 vs 클러스터 관찰)에 따라 골라 씁니다."
      />
      <Quiz
        difficulty="medium"
        question="실험 ②에서 지도상 제일 멀어 보이던 A-C가 실제로는 A-B보다 가까웠습니다. 이 사건의 올바른 교훈은?"
        :choices="['클러스터 사이 거리는 지도에서 왜곡될 수 있으니 원 공간에서 확인해야 한다', '지도가 항상 옳고 실제 거리가 틀렸다', 'A와 C는 같은 문서다', '거리는 원래 잴 수 없는 것이다']"
        :answer="0"
        explanation="이웃 보존형 지도의 대가 — 무리 짓기는 맞지만 무리 사이 배치는 그리기 편의상의 결과일 수 있습니다."
      />
      <Quiz
        difficulty="medium"
        question="RAG 검색을 할 때 문서 벡터로 2D 축소 좌표가 아니라 원래 수백 차원 벡터를 쓰는 이유는?"
        :choices="['축소는 정보를 버리는 요약이라 유사도 순위가 뒤틀릴 수 있어서', '2D 좌표는 파일 크기가 더 커서', '수백 차원이 계산이 더 빨라서', '이유 없음 — 2D로 검색해도 똑같다']"
        :answer="0"
        :hints="['512쪽 보고서의 두 줄 요약으로 정밀한 판단을 할 수 있을까요?']"
        explanation="지도는 관찰용, 검색은 원 공간에서 — 축소 과정에서 버린 정보가 순위를 바꿀 수 있기 때문입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="동료가 UMAP 지도 한 장을 보며 '인사 문서 클러스터가 보안 문서보다 경비 문서에 두 배 가까우니, 인사-경비가 더 관련 깊은 주제'라고 결론 내립니다. 가장 정확한 지적은?"
        :choices="['이웃 보존형 지도의 클러스터 간 거리는 왜곡될 수 있으니, 원 공간 코사인으로 확인해야 한다', 'UMAP 대신 t-SNE였다면 그 결론이 맞다', '두 배가 아니라 세 배 가까우면 믿어도 된다', '지도의 축 눈금을 읽으면 해결된다']"
        :answer="0"
        :hints="['핵심 한 줄 — 무엇은 믿고 무엇은 믿지 않기로 했죠?']"
        explanation="t-SNE든 UMAP이든 클러스터 간 거리·비율은 신뢰 대상이 아닙니다. 주제 간 관련도는 원 공간 유사도로 재야 해요."
      />
      <Quiz
        difficulty="hard"
        question="t-SNE 지도를 설정값(perplexity)을 바꿔 다시 그렸더니 클러스터 배치가 완전히 달라졌습니다. 올바른 해석은?"
        :choices="['정상이다 — 이런 지도는 설정 민감하므로 여러 장을 보고 이웃 관계 위주로 읽어야 한다', '데이터가 오염됐다는 뜻이다', '첫 번째 지도만 진짜다', 't-SNE에 버그가 있다는 뜻이다']"
        :answer="0"
        explanation="같은 데이터, 다른 지도 — 비선형 축소의 본성입니다. 설정을 바꿔도 유지되는 구조(무리 짓기)만 결론으로 삼는 게 정석이에요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch5')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">5장 완료 — 지도를 그리고, 속지 않고 읽을 수 있어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        공간 이야기(3~5장)가 끝났습니다. 다음은 시스템 이야기 — 수만 개 문서 중
        1등을 순식간에 찾는 법, kNN에서 근사 최근접 이웃(ANN)과 벡터 DB까지.
      </p>
      <RouterLink
        to="/ch/ch6"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        6장 — 이웃 찾기, kNN에서 벡터 DB까지 →
      </RouterLink>
    </div>
  </article>
</template>
