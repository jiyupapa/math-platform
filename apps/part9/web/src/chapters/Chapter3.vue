<script setup lang="ts">
// ch3 — 고무줄 자: 부동소수점 (핵심). fp32 를 부호·지수·가수로 해부해
// 워밍업의 모든 미스터리(0.1 티끌·1 삼키기 경계·늘어나는 눈금)를 회수한다.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import FloatAnatomyLab from '@/components/FloatAnatomyLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch3')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">3장 · 저장: 칸의 해부 ② <span class="ml-1 rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">핵심</span></p>
    <h1 class="mb-4 text-3xl font-bold">고무줄 자 — 부동소수점</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      2장의 정수 자에는 두 가지가 안 담깁니다. <b>0.1</b>(눈금 사이) 그리고 <b>10³⁸</b>(자 밖).
      크고 작은 수를 한 칸에 담으려는 재주가 바로 부동소수점이에요. 워밍업부터 별명으로 불러온
      <b>고무줄 자</b>의 정식 해부가 오늘의 목표입니다. 9부에서 가장 중요한 장이에요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      fp32 의 세 부품(<b>부호 1 · 지수 8 · 가수 23 비트</b>)을 직접 열어 보고,
      워밍업의 세 수수께끼를 모두 풉니다: ① 0.1 티끌의 진범(가수 23비트 반올림),
      ② 1 삼키기 경계의 정체(가수가 정하는 정수 천장 2²⁴·2⁵³),
      ③ 눈금이 벌어지는 구조(지수가 옮기는 창문).
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 아이디어: 과학자들의 숫자 적기</h2>
    <ReviewFlag id="ch3-s1" chapter="ch3" label="1. 아이디어: 과학자들의 숫자 적기" />
    <p class="leading-relaxed text-slate-700">
      아보가드로 수 602,214,076,000,000,000,000,000 을 그대로 적는 과학자는 없죠.
      <b>6.02 × 10²³</b> 처럼 "유효숫자 × 10의 몇 제곱"으로 적습니다
      (<b>2부 7장</b>의 지수가 여기서 일해요).
      부동소수점은 이 <b>과학적 표기법의 2진판</b>입니다:
    </p>
    <MathBlock expr="x = (-1)^{s} \times 1.m \times 2^{\,e-127}" />
    <p class="leading-relaxed text-slate-700">
      읽어 볼까요. <b>s</b>(부호): 플러스냐 마이너스냐. <b>m</b>(가수): "1.몇몇몇"의 소수부,
      눈금 위 좌표. <b>e</b>(지수): 2를 몇 제곱할지, 즉 <b>소수점을 어디로 띄울지</b>.
      소수점이 지수를 따라 둥둥 떠다닌다(浮動)고 해서 부동소수점입니다. 이 세 부품을
      스위치 32개에 나눠 담은 약속이 <b>fp32</b>입니다. 직접 열어 봅시다.
    </p>

    <FloatAnatomyLab />

    <ConceptCard tone="tip" title="핵심 관찰: 지수는 창문을 옮기고, 가수는 창문 안을 나눈다">
      해부기에서 본 구조를 한 문장으로: <b>지수가 [2ᵉ, 2ᵉ⁺¹) 구간(창문)을 고르고, 가수 23비트가
      그 창문을 2²³ = 약 839만 칸으로 균등하게 나눕니다.</b> 창문이 두 배로 커질 때마다 칸 수는
      그대로이니 눈금 간격도 두 배, 고무줄이 늘어나는 이유죠. 그래서 어느 크기에서든
      <b>상대 오차</b>(값 대비 티끌의 비율)는 약 2⁻²⁴, 십진으로 <b>유효숫자 약 7자리</b>가
      일정하게 보장됩니다. "절대 정밀도"가 아니라 <b>"상대 정밀도"의 자</b>인 거예요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="0.1을 fp32에 담으면 0.100000001490… 이 되는 근본 이유는?"
      :choices="['0.1은 2진으로 무한 반복 소수라 가수 23비트에서 끊고 반올림하기 때문', '지수 비트가 부족해서', '부호 비트가 잘못 계산돼서', '컴퓨터마다 다른 임의 오차 때문']"
      :answer="0"
      :hints="['해부기의 가수 비트가 0011 0011… 로 반복되다 끝에서 어떻게 되는지 보세요.']"
      explanation="가수 비트가 00110011… 무한 반복인데 23비트에서 끊고 마지막을 반올림합니다. 워밍업 티끌의 진범이 가수부였어요. 지수·부호는 멀쩡합니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 부품에 이름표 달기</h2>
    <ReviewFlag id="ch3-s2" chapter="ch3" label="2. 부품에 이름표 달기" />

    <ConceptCard tone="note" title="새 용어: 지수부 / 가수부 / 정규화(숨은 1)">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>지수부</b> (exponent). 읽는 법: 엑스포넌트. 뜻: 2를 몇 제곱할지 담는 8비트로,
          <b>자의 길이(표현 범위)</b> 담당. fp32 는 대략 ±3.4×10³⁸ 까지. 저장은 e − 127 약속
          (bias, 아래 더 깊이 카드).
        </li>
        <li>
          <b>가수부</b> (mantissa / significand). 읽는 법: 맨티사. 뜻: "1.몇몇몇"의 소수부
          23비트로, <b>눈금의 촘촘함(정밀도)</b> 담당. 십진 유효숫자 약 7자리의 근원.
        </li>
        <li>
          <b>정규화</b> (normalization). 읽는 법: 노멀라이제이션. 뜻: 소수점을 옮겨 항상
          "1.○○○ × 2ᵉ" 꼴로 맞추는 것. 맨 앞이 늘 1이니 <b>안 적어도 되는 숨은 1</b>이고,
          공짜로 24비트째 정밀도를 법니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="fp32에서 '자의 길이(범위)'와 '눈금 촘촘함(정밀도)'을 각각 담당하는 부품은?"
      :choices="['범위 = 지수부(8비트), 정밀도 = 가수부(23비트)', '범위 = 가수부, 정밀도 = 지수부', '둘 다 부호 비트가 담당', '둘 다 지수부가 담당']"
      :answer="0"
      explanation="지수는 창문(구간)을 어디까지 옮길 수 있느냐(범위), 가수는 창문 안을 몇 칸으로 나누느냐(정밀도)입니다. 7장에서 fp16과 bf16이 갈리는 지점이 정확히 이 배분이에요."
    />

    <DetailsCard title="➕ 더 깊이: bias 127, 지수를 담는 '2의 보수 아닌' 약속">
      지수도 음수가 필요하죠(0.1 ≈ 1.6 × 2⁻⁴). 그런데 fp32 지수부는 2장의 2의 보수 대신
      <b>"127을 더해 저장하고, 읽을 때 127을 빼는"</b> bias 약속을 씁니다. 0.1의 지수부가
      01111011(=123)이고 123 − 127 = −4 였던 게 그것. 왜 이렇게? 이렇게 담으면 <b>비트열을
      부호 없는 정수처럼 그냥 비교해도 크기 순서가 맞아서</b>, 회로가 두 수의 대소를 빠르게
      가릴 수 있거든요. 그리고 지수 비트가 <b>전부 0</b>이거나 <b>전부 1</b>인 칸은 특별석으로
      비워 뒀습니다. 0과 비정규수, 그리고 ∞·NaN 의 자리. 5장(자의 끝)에서 입주민들을 만나요.
    </DetailsCard>

    <ReviewFlag id="ch3-ai" chapter="ch3" label="🤖 AI 연결 · 다시 쓰는 수학: 2부 7장 · 5부 1장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 · 다시 쓰는 수학: 2부 7장 · 5부 1장">
      <b><PartLink :part="2" ch="ch7">2부 7장</PartLink></b>의 지수함수가 자의 길이를,
      <b><PartLink :part="5" ch="ch1">5부 1장</PartLink></b>의 log₂ 감각("몇 비트가 필요한가")이
      가수의 정밀도를 읽는 언어였습니다. 그리고 fp32 는 <b>딥러닝 학습의 기본 칸</b>이에요.
      GPU 스펙표의 "FP32 성능", 파인튜닝 로그의 dtype=float32 가 오늘 해부한 이 32개 스위치입니다.
      7장에서 만날 fp16·bf16 은 새 발명품이 아니라 <b>같은 세 부품의 비트 재배분</b>
      (지수 5+가수 10 vs 지수 8+가수 7)이고, 어느 쪽을 아끼느냐가 학습 사고의 양상을 가릅니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="고무줄 자: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="fp32의 32비트를 이루는 세 부품은?"
        :choices="['부호 1 + 지수 8 + 가수 23', '부호 8 + 지수 8 + 가수 16', '정수부 16 + 소수부 16', '부호 1 + 자리값 31']"
        :answer="0"
        explanation="1 + 8 + 23 = 32. 부호는 ±, 지수는 창문 위치, 가수는 창문 안 좌표입니다."
      />
      <Quiz
        difficulty="easy"
        question="0.1은 fp32 눈금 위에 정확히 있어서 오차 없이 저장된다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 2진 무한 반복이라 가수 23비트에서 끊고 반올림해서 저장값은 0.100000001490… 이에요. 눈금 위의 수(0.5, 0.25 등)만 정확히 담깁니다."
      />
      <Quiz
        difficulty="easy"
        question="부동소수점(floating point)이라는 이름의 유래는?"
        :choices="['지수에 따라 소수점 위치가 떠다니듯 움직여서', '물 위에 떠 있는 컴퓨터에서 개발돼서', '소수점이 없어서', '발명자의 이름이 플로트여서']"
        :answer="0"
        explanation="1.6 × 2⁻⁴ 처럼 지수가 소수점을 옮겨 다니게 합니다. 고정소수점(fixed point)과 대비되는 이름이에요."
      />
      <Quiz
        difficulty="easy"
        question="fp32 지수부가 01111011(=123)일 때 실제 지수는? (bias 127, 숫자로)"
        type="numeric"
        :answer="-4"
        explanation="123 − 127 = −4 → ×2⁻⁴. 해부기에서 0.1을 넣었을 때 본 그 값입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="'숨은 1'(정규화)이 공짜 정밀도를 주는 이유는?"
        :choices="['정규화하면 맨 앞자리가 항상 1이라 저장하지 않아도 되므로, 23비트로 24비트치 정보를 담는다', '1은 저장 공간을 차지하지 않는 특수 비트라서', '가수의 첫 비트는 항상 0이라서', '숨은 1은 정밀도와 무관하고 부호를 담는다']"
        :answer="0"
        :hints="['과학적 표기법에서 6.02×10²³ 의 맨 앞자리가 0일 수 있나요? 2진이라면?']"
        explanation="2진 과학 표기법의 맨 앞자리는 0이 아닌 유일한 숫자, 즉 항상 1이니 적으나 마나라 생략합니다. 그래서 fp32의 실질 정밀도는 24비트, 정수 천장이 2²⁴인 이유예요."
      />
      <Quiz
        difficulty="medium"
        question="fp32의 십진 유효숫자는 약 몇 자리인가?"
        :choices="['약 7자리 (2⁻²⁴ 상대 오차)', '약 16자리', '32자리', '약 2자리']"
        :answer="0"
        explanation="가수 24비트(숨은 1 포함) → 상대 오차 약 2⁻²⁴ ≈ 6×10⁻⁸ → 십진 약 7자리. 워밍업의 fp64(가수 53비트)가 약 16자리였던 것과 같은 계산입니다."
      />
      <Quiz
        difficulty="medium"
        question="fp32에서 '+1 삼키기'(정수 천장)가 시작되는 경계는?"
        :choices="['2²⁴ = 16,777,216 (가수 23비트 + 숨은 1)', '2⁵³ ≈ 9천조 (그건 fp64의 경계)', '2⁸ = 256', '2³² ≈ 43억']"
        :answer="0"
        :hints="['눈금 간격 관찰기에서 fp32 간격이 1을 넘는 지점을 찾아보세요.']"
        explanation="가수가 만드는 창문 분할이 2²⁴ 부터 간격 2가 됩니다. 1,677만이면 사진 픽셀 수 정도라 의외로 금방이에요. 워밍업의 9천조는 fp64(가수 53비트)의 경계였죠."
      />
      <Quiz
        difficulty="medium"
        question="해부기에서 12345678.9가 12345679로 저장된 것과 같은 원리의 현상은?"
        :choices="['10¹⁶ + 1 − 10¹⁶ = 0 (워밍업의 1 삼키기)', '0.5 + 0.25 = 0.75 (정확한 계산)', '255가 int8로 −1로 읽히는 것', '2⁸ = 256']"
        :answer="0"
        explanation="둘 다 '그 크기 구간의 눈금 간격보다 작은 변화가 반올림으로 사라지는' 현상입니다. fp32는 1,200만 구간에서 간격 1이라 0.9가, fp64는 10¹⁶ 구간에서 간격 2라 1이 사라졌어요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="fp32가 '절대 정밀도'가 아니라 '상대 정밀도'의 자라는 말의 뜻은?"
        :choices="['티끌의 절대 크기는 수의 크기에 비례해 커지지만, 값 대비 비율(약 2⁻²⁴)은 어느 크기에서나 일정하다', '오차가 어떤 크기에서든 절대값으로 똑같다', '작은 수일수록 상대 오차가 커진다', '큰 수는 오차가 없어진다']"
        :answer="0"
        :hints="['핵심 관찰 카드: 창문이 2배로 커질 때 칸 수는 그대로였죠.']"
        explanation="1 근처 티끌은 10⁻⁷쯤, 100만 근처 티끌은 0.06쯤. 절대 크기는 다르지만 값 대비 비율은 둘 다 약 2⁻²⁴로 같습니다. '유효숫자 7자리'가 바로 상대 정밀도의 표현이에요."
      />
      <Quiz
        difficulty="hard"
        question="동료가 '학습 코드의 손실값이 소수 12자리까지 찍히니 fp32로 12자리 정밀도가 있는 것'이라고 합니다. 정확한 답은?"
        :choices="['찍히는 자릿수와 믿을 수 있는 자릿수는 다르다. fp32의 유효숫자는 약 7자리라 그 아래는 반올림 잔재다', '맞다, 출력된 자릿수만큼 정밀하다', 'fp32는 소수를 아예 못 담으니 전부 무의미하다', '12자리가 필요하면 화면을 더 크게 하면 된다']"
        :answer="0"
        :hints="['워밍업 돋보기에서 0.1을 20자리로 펼쳤을 때, 그 뒷자리들이 진짜 정보였나요?']"
        explanation="출력 함수는 얼마든지 길게 펼쳐 주지만, 신뢰 구간은 유효숫자 약 7자리까지입니다. 훈련 로그의 loss = 2.30258509299… 에서 뒤쪽 자리는 장식이에요. 로그 판독(8부 9장)에서도 중요한 감각."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch3')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">3장 완료! 첫 핵심 통과!</p>
      <p class="mt-1 text-sm text-emerald-700">
        칸의 구조를 열어 봤으니, 이제 그 칸으로 계산할 때 티끌이 어떻게 쌓이는지,
        더하는 순서만 바꿔도 답이 달라지는 세계로 갑니다.
      </p>
      <RouterLink
        to="/ch/ch4"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        4장: 눈금 사이의 오차: 반올림과 누적 →
      </RouterLink>
    </div>
  </article>
</template>
