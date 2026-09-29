<script setup lang="ts">
// 8장 — LoRA: 살짝만 조련하기. 다시 쓰는 수학: 1부 9장(rank) · 11장(SVD 감각).
// 1부 후반(심화)을 건너뛴 학습자를 위해 rank 최소 직관을 이 장에 자체 포함한다(로드맵 요구).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import LoraLab from '@/components/LoraLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch8')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">8장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">LoRA — 살짝만 조련하기</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      3~7장의 조련은 전부 "가중치를 바꾸는" 일이었죠. 그런데 7B 모델의 가중치는
      <b>70억 개</b>입니다. 회사 챗봇 하나 만들자고 이걸 통째로 훈련하고,
      용도마다 수십 GB 짜리 사본을 보관해야 할까요?
      이번 장은 그 문제를 푸는 도구인 <b>변화분만 얇게 배우는 LoRA</b>입니다.
      열쇠는 1부에서 스쳐 간 단어, <b>rank</b>예요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      LoRA 를 한 문장으로 말할 수 있게 됩니다.
      <b>"W 는 얼리고, 변화분 ΔW 를 얇은 두 행렬 B·A 로만 배운다."</b>
      그리고 r(rank) 다이얼이 무엇을 조절하는지까지.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 문제: 70억 개를 다 만질 것인가</h2>
    <ReviewFlag id="ch8-s1" chapter="ch8" label="1. 문제: 70억 개를 다 만질 것인가" />
    <p class="leading-relaxed text-slate-700">
      전체 파인튜닝(지금까지 배운 방식 그대로)의 청구서는 셋입니다.
      ① 훈련 중 메모리: 가중치에 더해 기울기·최적화 기록까지 들고 있어야 해서
      모델 크기의 몇 배가 필요하고(7B 모델 훈련에 수십 GB), ② 저장: 조련 결과물이
      <b>모델 통째</b>라 용도 하나당 수십 GB, ③ 위험: 70억 개를 전부 흔들다
      원본의 능력을 다치게 할 수 있죠(6장에서 본 그 걱정).
      그런데 잠깐, 조련이 실제로 바꾸는 건 얼마나 될까요?
    </p>

    <ConceptCard tone="tip" title="통찰: 조련의 변화는 '거대'하지 않다">
      1장에서 봤듯 조련은 지식을 새로 넣는 게 아니라 <b>행동 방식</b>을 바꿉니다.
      "답변체로 말하기", "간결하게", "위험 요청 거절". 이런 변화는 70억 개 가중치가
      제각각 움직이는 게 아니라, <b>소수의 일관된 방향</b>으로 함께 움직이는 것에 가깝습니다.
      변화분(ΔW)의 <b>진짜 정보량이 낮다</b>는 뜻이에요. 이 "진짜 정보량"에 이름이 있습니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">2. rank: 표의 진짜 정보량 (3분 완성)</h2>
    <ReviewFlag id="ch8-s2" chapter="ch8" label="2. rank: 표의 진짜 정보량 (3분 완성)" />
    <p class="leading-relaxed text-slate-700">
      1부 9장을 건너뛰었어도 괜찮습니다. 필요한 직관은 실험 하나면 충분해요.
      아래 표부터 보세요.
    </p>

    <LoraLab />

    <ConceptCard tone="note" title="새 용어: rank / LoRA / 어댑터">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>rank</b> (계수). 읽는 법: 랭크.
          뜻: 행렬(표)이 담은 <b>독립적인 정보 방향의 수</b>. 모든 행이 한 행의 배수면 rank 1이라,
          표가 커도 정보는 얇을 수 있습니다. rank r 짜리 행렬은 <b>얇은 두 행렬의 곱(d×r)·(r×d)</b>으로 만들 수 있어요.
        </li>
        <li>
          <b>LoRA</b> (Low-Rank Adaptation). 읽는 법: 로라, 저랭크 적응.
          뜻: W 를 얼리고 변화분 ΔW = B·A (rank ≤ r)만 학습하는 조련 기법.
        </li>
        <li>
          <b>어댑터</b> (adapter). 뜻: 학습이 끝난 <b>B·A 두 행렬 묶음</b>. 원본과 분리된 작은 파일(수십 MB)로 저장·교체합니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="실험 ①의 표(모든 행이 기준 행의 배수)의 rank 는 얼마였을까요?"
      type="numeric"
      :answer="1"
      :hints="['독립적인 정보 방향이 몇 개였나요? 기준 행 하나에 배수만 달랐죠.']"
      explanation="rank 1. 숫자 16개처럼 보여도 정보의 방향은 하나라서 열 하나 × 행 하나의 곱으로 전부 복원됩니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. LoRA: 변화분만 얇게 배운다</h2>
    <ReviewFlag id="ch8-s3" chapter="ch8" label="3. LoRA: 변화분만 얇게 배운다" />
    <p class="leading-relaxed text-slate-700">
      이제 조립합니다. 조련 전 가중치 행렬을 W 라 하면, 조련은 W 를 W + ΔW 로 바꾸는 일.
      LoRA 의 선언은 <b>"W 는 얼려 두고(🧊), ΔW 를 rank r 짜리로만 배우겠다"</b>입니다.
    </p>
    <MathBlock expr="\text{출력} = W x + \underbrace{B A}_{\Delta W} x \qquad (B: d \times r, \; A: r \times d, \; r \ll d)" />
    <p class="leading-relaxed text-slate-700">
      훈련되는 것은 얇은 B·A 뿐입니다. 실험 ②에서 봤듯 d=4096, r=8 이면
      전체 1,670만 개 대신 <b>6.6만 개</b>, 256분의 1이에요. 조련의 변화가 정말
      저차원이라면(§1의 통찰), 이 얇은 조각으로 충분합니다. r 는 그 가정의 <b>다이얼</b>이라,
      변화가 복잡할수록 r 를 키우면 됩니다.
    </p>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">W 는 얼리고, ΔW = B·A: 변화분만 얇게 배운다</p>
      <p class="mt-1 text-sm text-indigo-600">배를 새로 짓지 않고 방향타만 다는 것. SFT든 DPO든 조련 어느 단계에나 끼울 수 있다.</p>
    </div>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 어댑터의 마법: 갈아끼우기</h2>
    <ReviewFlag id="ch8-s4" chapter="ch8" label="4. 어댑터의 마법: 갈아끼우기" />
    <p class="leading-relaxed text-slate-700">
      LoRA 의 진짜 실무 파괴력은 <b>결과물이 분리돼 있다</b>는 데서 나옵니다.
    </p>
    <ul class="mt-2 list-disc space-y-1 pl-6 leading-relaxed text-slate-700">
      <li><b>가볍다</b>: 어댑터는 수십 MB. 원본(수십 GB)은 하나만 두고, 용도별 어댑터를 여러 개 보관합니다.</li>
      <li><b>갈아끼운다</b>: 고객상담용·사내규정용·번역용 어댑터를 상황 따라 장착/해제. 모델 3벌이 아니라 어댑터 3개.</li>
      <li><b>원본 무손상</b>: W 를 건드리지 않았으니 어댑터를 빼면 정확히 원래 모델. 6장의 "원본다움 보존"이 구조적으로 보장되는 셈이죠.</li>
    </ul>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="LoRA 훈련에서 실제로 값이 바뀌는(학습되는) 것은?"
      :choices="['얇은 두 행렬 B와 A 뿐', '거대 행렬 W 전부', 'W와 B·A 전부', '아무것도 안 바뀐다']"
      :answer="0"
      explanation="W 는 얼음(🧊)이라 기울기도 흐르지 않습니다. B·A 만 배우니 훈련 메모리와 결과물이 극적으로 가벼워져요."
    />

    <DetailsCard title="➕ 더 깊이: QLoRA, 개인 GPU에서 7B를 조련하는 법">
      LoRA 로 훈련 파라미터는 줄였지만, 얼려 둔 W 자체를 메모리에 올리는 부담은 남습니다.
      <b>QLoRA</b> 는 그 W 를 <b>양자화</b>(숫자 정밀도를 4비트로 압축)해서 올리고 LoRA 를 얹는
      조합이에요. 이 덕분에 7B급 모델의 조련이 게이밍 GPU 한 장에서도 가능해졌어요.
      Ollama 생태계에서 만나는 수많은 파인튜닝 변형 모델들이 대부분 이런 길로 만들어집니다.
      "우리 회사 데이터로 챗봇 조련"의 표준 레시피가 <b>SFT(3장) + LoRA(이 장)</b> 조합이에요.
    </DetailsCard>

    <ReviewFlag id="ch8-ai" chapter="ch8" label="🤖 AI 연결 · 다시 쓰는 수학: 1부 9장 rank · 11장 SVD" />
    <ConceptCard tone="ai" title="🤖 AI 연결 · 다시 쓰는 수학: 1부 9장 rank · 11장 SVD">
      <b><PartLink :part="1" ch="ch9">1부 9장</PartLink></b>: rank: "데이터가 진짜 몇 차원어치 정보인가"가 조련 변화분의 성질로 다시 등장.
      <b><PartLink :part="1" ch="ch11">1부 11장</PartLink></b>: SVD: "행렬을 중요한 방향 몇 개로 근사한다"는 감각이 LoRA 의 설계 사상
      그대로입니다(실제 LoRA 논문의 출발점이 ΔW 의 낮은 유효 rank 관찰이었어요).
      1부 후반을 아직 안 봤다면, 이 장을 마친 지금이 가장 잘 읽히는 타이밍입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="LoRA: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="LoRA 를 한 문장으로 요약하면?"
        :choices="['W는 얼리고, 변화분 ΔW를 얇은 두 행렬 B·A로만 배운다', 'W를 두 배로 키워 학습한다', '가중치를 전부 0으로 만든다', '프롬프트에 예시를 붙인다']"
        :answer="0"
        explanation="이 장의 파란 박스입니다. 배를 새로 짓지 않고 방향타만 다는 것."
      />
      <Quiz
        difficulty="easy"
        question="rank 가 뜻하는 것은?"
        :choices="['행렬이 담은 독립적인 정보 방향의 수', '행렬의 가로 길이', '행렬 원소들의 합', '행렬의 저장 위치']"
        :answer="0"
        explanation="표가 아무리 커도 행들이 서로의 배수면 rank 1. 크기와 정보량은 다릅니다(1부 9장)."
      />
      <Quiz
        difficulty="easy"
        question="LoRA 어댑터 파일이 원본 모델보다 훨씬 작은 이유는?"
        :choices="['B·A 두 얇은 행렬만 담고 있어서', '압축 알고리즘이 좋아서', '원본의 절반만 저장해서', '텍스트로 저장해서']"
        :answer="0"
        explanation="어댑터 = B(d×r) + A(r×d). r 이 작으니 수십 GB 모델 대비 수십 MB 수준입니다."
      />
      <Quiz
        difficulty="easy"
        question="LoRA로 조련한 뒤 어댑터를 제거하면 모델은 원래(조련 전) 상태로 돌아온다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. W를 한 번도 건드리지 않았으니까요. 원본 무손상은 LoRA의 구조적 보장입니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="d=1000, r=5 인 층 하나를 비교합니다. 전체 파인튜닝 파라미터 수, B와 A의 파라미터 수, 그리고 절약 배율을 구하세요."
        :steps="[
          { lhs: 'W: 1000 \\times 1000', answer: 1000000 },
          { lhs: 'B: 1000 \\times 5', answer: 5000 },
          { lhs: 'A: 5 \\times 1000', answer: 5000 },
          { lhs: '\\text{절약 배율} = 1000000 \\div 10000', answer: 100 },
        ]"
        :hints="['B와 A의 파라미터를 더한 값으로 나눠 보세요.', '5,000 + 5,000 = 10,000']"
        explanation="100배 절약. d 가 클수록(진짜 모델은 수천~수만) 이 배율은 더 극적으로 커집니다."
      />
      <Quiz
        difficulty="medium"
        question="r(rank) 다이얼의 트레이드오프로 알맞은 것은?"
        :choices="['작으면 가볍지만 담을 수 있는 변화의 방향 수가 적고, 크면 용량은 늘지만 절약이 준다', '작을수록 무조건 좋다', '클수록 무조건 좋다', 'r은 결과에 아무 영향이 없다']"
        :answer="0"
        explanation="r = ΔW 에 허용하는 정보 방향의 수. 조련이 요구하는 변화의 복잡도에 맞춰 고르는 다이얼입니다."
      />
      <Quiz
        difficulty="medium"
        question="LoRA가 통하는 근거(§1의 통찰)는?"
        :choices="['조련의 변화(ΔW)는 소수의 일관된 방향: 진짜 정보량(rank)이 낮다', '가중치는 원래 전부 0이라서', '행렬 곱셈이 불가능해서', '조련은 가중치를 바꾸지 않아서']"
        :answer="0"
        :hints="['조련이 바꾸는 건 지식이 아니라 무엇이었죠(1장)?']"
        explanation="행동 방식의 변화는 70억 개가 제각각이 아니라 소수 방향의 협주예요. 그래서 얇은 B·A로 충분합니다."
      />
      <Quiz
        difficulty="medium"
        question="회사에서 고객상담·사내규정·번역 세 용도의 챗봇이 필요합니다. LoRA 방식의 운영 형태는?"
        :choices="['원본 모델 하나 + 어댑터 3개를 상황 따라 갈아끼움', '수십 GB 모델 3벌을 각각 보관', '모델 하나로 세 용도를 포기', '프롬프트만 3개 만든다']"
        :answer="0"
        explanation="어댑터는 갈아끼울 수 있어요. 저장은 어댑터 3개(각 수십 MB), 서빙도 원본 하나에 장착/해제로 해결됩니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="QLoRA 가 '개인 GPU에서 7B 조련'을 가능하게 만든 조합은?"
        :choices="['얼려 둔 W를 4비트로 양자화해 올리고 + 학습은 LoRA(B·A)만', 'W를 통째로 훈련하되 밤에만 돌림', '모델을 절반으로 잘라냄', '클라우드를 몰래 씀']"
        :answer="0"
        :hints="['LoRA가 남긴 마지막 부담은 얼려 둔 W를 메모리에 올리는 것이었죠.']"
        explanation="훈련 파라미터는 LoRA로, 얼린 몸체는 양자화로. 두 절약의 곱이 게이밍 GPU 한 장을 훈련장으로 만들었습니다."
      />
      <Quiz
        difficulty="hard"
        question="LoRA와 1부 11장 SVD의 사상적 연결로 가장 정확한 것은?"
        :choices="['둘 다 \'행렬의 본질은 중요한 방향 몇 개\': SVD는 그렇게 분해하고, LoRA는 그렇게 배운다', 'LoRA는 SVD의 역연산이다', 'SVD는 LoRA를 느리게 만든 것이다', '연결이 없다. 이름만 비슷하다']"
        :answer="0"
        :hints="['SVD가 하던 일: 거대한 행렬을 무엇 몇 개로 근사했었죠?']"
        explanation="SVD = 이미 있는 행렬을 저rank로 근사(분해), LoRA = 앞으로 배울 변화를 저rank로 제한(학습). 같은 저차원 사상의 분석판과 학습판입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch8')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">8장 완료! 조련의 도구함까지 챙겼어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 9장, 조련이 잘 됐는지 어떻게 아나? 성적표(벤치마크·LLM 심판)와
        과잉 조련의 부작용(아첨·망각)을 봅니다.
      </p>
      <RouterLink
        to="/ch/ch9"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        9장: 조련 성적표 →
      </RouterLink>
    </div>
  </article>
</template>
