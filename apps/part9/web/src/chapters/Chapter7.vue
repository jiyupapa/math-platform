<script setup lang="ts">
// ch7 — 반쪽 자: fp16·bf16과 혼합 정밀도 (핵심). 16비트를 나누는 두 철학과
// "저장은 반쪽, 누적은 fp32"(필수 소주제), loss scaling 까지.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import HalfRulerLab from '@/components/HalfRulerLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch7')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">7장 · 계산 — 사고 없이 쓰기 ② <span class="ml-1 rounded bg-indigo-100 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-700">핵심</span></p>
    <h1 class="mb-4 text-3xl font-bold">반쪽 자 — fp16·bf16과 혼합 정밀도</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1장의 몸무게 계산을 기억하세요 — 칸을 4바이트에서 2바이트로 줄이면 7B 모델이
      26GB 에서 13GB 가 됩니다(속도도 하드웨어에 따라 두 배급). 유혹적이죠. 문제는
      3장에서 배운 그것 — <b>16개의 스위치를 지수와 가수에 어떻게 나누나?</b>
      그 갈림길에서 fp16 과 bf16 이 태어났고, 오늘 파인튜닝 설정의 <code>bf16: true</code>
      한 줄이 읽히게 됩니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      ① 16비트를 나누는 두 철학 — <b>fp16(눈금 우선)</b> vs <b>bf16(자 길이 우선)</b> —
      을 세 자 대조기로 체감하고, ② 혼합 정밀도의 심장 <b>"저장은 반쪽, 누적은 fp32"</b> 를
      실험으로 확인하고, ③ fp16 시대의 구급차 <b>loss scaling</b> 을 직접 운전해 봅니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 갈림길 — 눈금이냐, 자 길이냐</h2>
    <ReviewFlag id="ch7-s1" chapter="ch7" label="1. 갈림길 — 눈금이냐, 자 길이냐" />
    <p class="leading-relaxed text-slate-700">
      3장의 구조 그대로입니다 — 지수 비트는 <b>자의 길이</b>(범위), 가수 비트는 <b>눈금의
      촘촘함</b>(정밀도). 16비트에서 부호 1을 떼면 15비트가 남는데:
      <b>fp16</b> 은 지수 5 + 가수 10 — 눈금은 fp32 의 1/8토막 수준으로 지키는 대신 자가
      짧아 최대 <b>65,504</b>(5장에서 본 2배 여행 16걸음짜리 자!).
      <b>bf16</b> 은 지수 8 + 가수 7 — <b>fp32 와 자 길이가 똑같은</b>(3.4×10³⁸) 대신 눈금이
      성겨 유효숫자 두세 자리. 어느 쪽이 옳은가는 "어떤 사고가 더 치명적인가"의 문제예요.
    </p>

    <HalfRulerLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 훈련의 기본값이 bf16 이 된 이유">
      대조기에서 봤죠 — fp16 은 70,000 에서 <b>inf(위로 터짐)</b>, 2×10⁻⁸ 에서 <b>0(아래로
      소실)</b>. 둘 다 5장의 사고이고, 특히 오버플로는 NaN 전염으로 <b>훈련을 즉사</b>시킵니다.
      bf16 은 눈금이 성글어 티끌(4장)은 크지만, 티끌은 √n 통계와 fp32 누적기가 받아 주죠.
      요약 — <b>"폭발(5장)은 치명상, 정밀도 손실(4장)은 관리 가능"</b>. 그래서 요즘 LLM
      훈련·파인튜닝의 기본값이 bf16 입니다(설정 파일의 <code>bf16: true</code>).
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="fp16과 bf16의 비트 배분 철학을 바르게 짝지은 것은?"
      :choices="['fp16 = 가수 10(눈금 우선, 자 짧음) · bf16 = 지수 8(자 길이 = fp32, 눈금 성김)', 'fp16 = 지수 8 · bf16 = 가수 10', '둘 다 지수 8 + 가수 7로 같다', 'fp16 은 32비트, bf16 은 16비트다']"
      :answer="0"
      :hints="['대조기에서 70,000을 넣었을 때 어느 쪽이 터졌는지 — 자가 짧은 쪽은?']"
      explanation="같은 16비트, 다른 배분 — fp16(1+5+10)은 눈금을, bf16(1+8+7)은 자 길이를 택했습니다. 3장의 지수=범위, 가수=정밀도 구조가 그대로 적용된 갈림길이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 혼합 정밀도 — 반쪽 자와 fp32 의 분업</h2>
    <ReviewFlag id="ch7-s2" chapter="ch7" label="2. 혼합 정밀도 — 반쪽 자와 fp32 의 분업" />
    <p class="leading-relaxed text-slate-700">
      실험 ②가 보여준 것: 반쪽 자로 <b>쌓는 것</b>은 위험합니다 — fp16 의 1 근처 눈금은
      0.001 급이라, 4장의 흡수가 아주 평범한 크기(0.0001!)에서 일어나요. 그래서 실전은
      <b>분업</b>합니다: 개수가 수십억이라 무거운 것(가중치·활성값 저장, 행렬곱)은 반쪽 자로,
      <b>티끌이 쌓이는 곳 — 누적기, master weights, 옵티마이저 상태 — 는 fp32 로.</b>
      이 분업의 이름이 <b>혼합 정밀도</b>(mixed precision)이고,
      <b>4부 11장</b>의 학습 루프에 겹쳐 그리면:
      forward/backward 는 반쪽 자 구간, 가중치 갱신은 fp32 구간입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: fp16·bf16 / 혼합 정밀도 / loss scaling">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>fp16 / bf16</b> (half / brain float 16) — 읽는 법: 에프피식스틴 / 비에프식스틴.
          뜻: 2바이트 부동소수점 두 표준 — fp16(지수5+가수10, 최대 65,504),
          bf16(지수8+가수7, 범위 = fp32). bf16 의 b 는 Google Brain 의 b.
        </li>
        <li>
          <b>혼합 정밀도</b> (mixed precision) — 읽는 법: 믹스드 프리시전. 뜻: 저장·곱셈은
          반쪽 자, <b>누적·가중치 원본(master weights)·옵티마이저는 fp32</b> 로 나누는 분업 —
          메모리·속도와 안전을 동시에 잡는 표준 훈련법.
        </li>
        <li>
          <b>loss scaling</b> — 읽는 법: 로스 스케일링. 뜻: fp16 훈련에서 작은 gradient 가
          소실되지 않게 <b>loss 를 ×S 확대 → backward → 갱신 직전 ÷S 복원</b>하는 재주.
          S 가 크면 오버플로, 작으면 소실 — 그래서 동적(dynamic) 조절이 표준.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="크기 2×10⁻⁸ 의 gradient 를 fp16 에 그대로 저장하면 벌어지는 일과 그 이름은?"
      :choices="['0 이 되어 학습 신호가 사라진다 — 언더플로 소실 (loss scaling 이 필요한 이유)', 'inf 가 된다 — 오버플로', '정확히 저장된다 — 아무 문제 없음', 'NaN 이 된다 — 계산 불능']"
      :answer="0"
      :hints="['fp16 자의 아래끝은 약 6×10⁻⁸ — 2×10⁻⁸ 은 그보다 위? 아래?']"
      explanation="fp16 이 담을 수 있는 가장 작은 크기(비정규 포함 ≈6×10⁻⁸)보다 작아 0 으로 반올림됩니다 — 기울기가 0 이면 그 파라미터는 학습이 멈추죠. 실험 ③의 ×S 확대가 그 구급법입니다."
    />

    <DetailsCard title="➕ 더 깊이: bf16 변환은 공짜, 그리고 TF32">
      bf16 이 지수 8비트를 고른 데는 실용적 보너스가 있습니다 — <b>fp32 의 위쪽 16비트를
      자르면 그대로 bf16</b> 이라 변환이 사실상 공짜예요(대조기의 bf16 구현이 실제로 그렇게
      돌아갑니다). GPU 에는 형제가 하나 더 있는데, <b>TF32</b> — fp32 의 자 길이에 가수만
      10비트로 줄인 19비트짜리 내부 형식으로, 텐서 코어가 fp32 행렬곱을 몰래 가속할 때
      씁니다. 그리고 1장에서 본 13GB 짜리 7B 파일의 정체가 오늘 확정됩니다 —
      <b>체크포인트 배포의 표준이 fp16/bf16</b>(2바이트)이기 때문. 4GB 짜리의 비밀은
      다음 장(양자화)부터예요.
    </DetailsCard>

    <ReviewFlag id="ch7-ai" chapter="ch7" label="🤖 AI 연결 — 회수하는 수학: 8부 9장 · 4부 11장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 8부 9장 · 4부 11장">
      <b><PartLink :part="8" ch="ch9">8부 9장</PartLink></b>의 훈련 사고 목록에 오늘 지식이
      합류합니다 — 손실 스파이크에 gradient clipping 이 있다면, fp16 오버플로·소실에는
      <b>loss scaling 과 bf16 전환</b>이 처방이에요(스파이크 원인이 학습률이 아니라 <b>칸</b>일
      수도 있다는 것!). <b><PartLink :part="4" ch="ch11">4부 11장</PartLink></b>의 학습 루프로
      보면: forward·backward 는 반쪽 자, 누적·갱신은 fp32 — 그래서 "훈련 메모리는 가중치
      2바이트면 끝"이 아니라 <b>master weights + 옵티마이저 상태(fp32)가 몇 배를 더 먹습니다</b>
      (훈련이 추론보다 훨씬 비싼 이유, 11장 캡스톤에서 정산).
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="반쪽 자 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="fp16의 비트 배분은?"
        :choices="['부호 1 + 지수 5 + 가수 10', '부호 1 + 지수 8 + 가수 7', '부호 1 + 지수 8 + 가수 23', '부호 2 + 지수 7 + 가수 7']"
        :answer="0"
        explanation="눈금(가수 10)을 지키고 자를 줄인 배분 — 두 번째는 bf16, 세 번째는 fp32입니다."
      />
      <Quiz
        difficulty="easy"
        question="bf16은 fp32와 표현 범위(자의 길이)가 같다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 지수 비트가 8개로 동일 — 3.4×10³⁸까지. 그래서 fp32에서 넘어올 때 오버플로 걱정이 없어요."
      />
      <Quiz
        difficulty="easy"
        question="칸을 fp32에서 fp16/bf16으로 바꾸면 7B 모델 가중치 메모리는?"
        :choices="['26GB → 13GB (절반)', '26GB → 26GB (변화 없음)', '26GB → 6.5GB (4분의 1)', '26GB → 52GB (두 배)']"
        :answer="0"
        explanation="개수(70억)는 그대로, 숫자 하나가 4바이트 → 2바이트 — 1장의 몸무게 공식 그대로입니다."
      />
      <Quiz
        difficulty="easy"
        question="fp16이 담을 수 있는 가장 큰 수는? (숫자로)"
        type="numeric"
        :answer="65504"
        explanation="(1 + 1023/1024) × 2¹⁵ = 65,504 — 5장의 2배 여행이 16걸음 만에 끝나는 짧은 자입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="LLM 훈련의 기본값이 fp16이 아닌 bf16으로 옮겨간 핵심 이유는?"
        :choices="['오버플로(NaN 전염 → 훈련 즉사)가 정밀도 손실보다 치명적이라, fp32와 같은 자 길이를 택한 것', 'bf16이 fp16보다 눈금이 촘촘해서', 'bf16이 메모리를 더 적게 써서', '이름이 더 세련돼서']"
        :answer="0"
        :hints="['핵심 관찰 카드 — 어떤 사고가 관리 가능하고 어떤 사고가 치명상이었죠?']"
        explanation="티끌(정밀도)은 √n 통계와 fp32 누적기가 받아 주지만, inf → NaN 전염은 즉사입니다. 메모리는 둘 다 2바이트로 동일해요."
      />
      <Quiz
        difficulty="medium"
        question="실험 ②에서 순수 fp16 누적(1.0에 0.0001을 3000번)이 1.0에 머문 이유는?"
        :choices="['fp16의 1 근처 눈금 간격(≈0.001)의 절반보다 작아 매번 흡수됐기 때문 (4장의 재공연)', '0.0001이 fp16에 저장되지 않는 수라서', '3000번이 너무 적어서', 'fp16은 덧셈을 지원하지 않아서']"
        :answer="0"
        explanation="0.0001 자체는 fp16에 잘 저장됩니다 — 문제는 1.0 옆에서의 흡수예요. 같은 값을 fp32 누적기로 더하면 1.3에 도달하죠. '저장은 반쪽, 누적은 fp32' 분업의 이유."
      />
      <Quiz
        difficulty="medium"
        question="loss scaling의 3단계 절차로 옳은 것은?"
        :choices="['loss에 S를 곱해 gradient를 키움 → fp16으로 backward → 가중치 갱신 직전 ÷S 복원', 'gradient를 무조건 0.5배로 줄인다', 'loss를 로그로 바꿔 저장한다', '가중치를 S배 키운 채 훈련한다']"
        :answer="0"
        explanation="확대 → 반쪽 자 통과 → 복원. backward 전체가 fp16 표현 구간으로 올라가므로 작은 gradient가 소실되지 않습니다 — 복원은 fp32 세계에서."
      />
      <Quiz
        difficulty="medium"
        question="혼합 정밀도 훈련에서 fp32로 유지하는 것들은?"
        :choices="['누적기·master weights·옵티마이저 상태', '모든 활성값', '행렬곱의 입력', '아무것도 없다 — 전부 fp16']"
        :answer="0"
        explanation="티끌이 쌓이는 곳들입니다 — 수십억 파라미터의 저장·곱셈은 반쪽 자로 아끼고, 축적·갱신의 장부는 fp32로 지켜요. 텐서 코어도 내부 누적은 fp32입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="동적(dynamic) loss scaling이 S를 조절하는 방식과 그 이유는?"
        :choices="['inf/NaN이 뜨면 S를 줄이고, 한동안 무사하면 다시 키운다 — S 과대는 오버플로, 과소는 소실이라 최적점이 훈련 중 변하기 때문', 'S를 무조건 최대(65536)로 고정한다 — 클수록 안전하므로', 'S를 무작위로 바꾼다 — 탐험을 위해', '훈련 내내 S=1로 두는 것이 표준이다']"
        :answer="0"
        :hints="['실험 ③에서 gradient 1에 S=65,536을 곱했을 때 무슨 일이?']"
        explanation="실험 ③의 양쪽 실패(소실↔오버플로) 사이를 자동으로 항해하는 것 — gradient 크기가 훈련 단계마다 변하니 S도 다이얼처럼 움직여야 합니다."
      />
      <Quiz
        difficulty="hard"
        question="'가중치가 fp16이면 훈련 메모리도 추론의 2배 정도겠지'가 틀린 이유는?"
        :choices="['혼합 정밀도는 master weights(fp32)·옵티마이저 상태(fp32, Adam은 2벌)·gradient까지 들고 있어 가중치 몫의 몇 배가 더 필요하다', '훈련은 fp64만 쓰기 때문이다', '틀리지 않았다 — 정확히 2배다', '훈련 중엔 가중치가 압축되기 때문이다']"
        :answer="0"
        :hints="['8부에서 본 Adam — 파라미터마다 무엇을 두 벌씩 기억했었죠?']"
        explanation="fp16 가중치(2B) + fp32 원본(4B) + Adam의 m·v(fp32 8B) + gradient(2B)… 파라미터당 16B 안팎 — 추론(2B)의 8배 급입니다. 훈련이 비싼 이유이자, 11장 캡스톤 메모리 정산의 예고편."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch7')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">7장 완료 — 계산 편(6~7장) 끝!</p>
      <p class="mt-1 text-sm text-emerald-700">
        반으로 줄이는 법을 배웠으니 이제 더 과감하게 — 실수 자를 버리고 정수 자로
        갈아타는 양자화, 4GB 파일의 비밀이 시작됩니다.
      </p>
      <RouterLink
        to="/ch/ch8"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        8장 — 눈금 갈아타기: 양자화 →
      </RouterLink>
    </div>
  </article>
</template>
