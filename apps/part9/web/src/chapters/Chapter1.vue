<script setup lang="ts">
// ch1 — 큰 그림: 숫자의 몸무게. "모델 = 수십억 개의 실수"에서 출발해
// 파일 크기 = 개수 × 칸 크기 계산법과 9부 전체 여정표를 편다.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ModelWeighLab from '@/components/ModelWeighLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch1')
}

// 9부 여정표 — 저장 → 계산 → 압축 → 졸업
const ITINERARY = [
  { range: '2~5장', theme: '저장 — 칸의 해부', desc: '비트로 수 세기(2) → 고무줄 자의 구조(3) → 반올림 오차(4) → 자의 끝, inf·NaN(5)' },
  { range: '6~7장', theme: '계산 — 사고 없이 쓰기', desc: 'softmax 가 안 터지게: log-sum-exp(6) → 반쪽 자 fp16·bf16 와 혼합 정밀도(7)' },
  { range: '8~10장', theme: '압축 — 칸 줄이기', desc: '정수 자로 갈아타기 int8(8) → 4비트와 GGUF(9) → 얼마나 잃었나 성적표(10)' },
  { range: '11장', theme: '🎯 졸업', desc: '7B는 왜 4GB인가 — 모델 영수증 완독, 내 PC에 맞는 모델 고르기' },
]
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">1장 · 큰 그림</p>
    <h1 class="mb-4 text-3xl font-bold">숫자의 몸무게</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      모델 소개 페이지마다 붙는 <b>7B · 13B · 70B</b> — 대체 뭐가 70억이라는 걸까요?
      이 장에서는 그 숫자를 직접 세어 보고, "숫자 개수 × 칸 크기 = 파일 크기"라는
      9부에서 가장 자주 쓸 계산 하나를 손에 넣습니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      ① "7B"의 정체(파라미터 수)를 부품별로 직접 세어 보고,
      ② <b>파일 크기 = 개수 × 숫자 하나의 칸 크기</b> 계산으로
      "왜 같은 7B인데 13GB짜리와 4GB짜리가 있는지"의 뼈대를 세웁니다.
      마지막으로 9부 전체 여정표를 폅니다 — 저장 → 계산 → 압축 → 졸업.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. "7B"의 B — 뭐가 70억 개라는 걸까</h2>
    <ReviewFlag id="ch1-s1" chapter="ch1" label="1. 「7B」의 B — 뭐가 70억 개라는 걸까" />
    <p class="leading-relaxed text-slate-700">
      <b>4부 10장</b>에서 GPT 를 조립하며 봤듯,
      모델의 실체는 <b>숫자가 가득한 행렬(표)들의 묶음</b>입니다 — 단어장(임베딩 표),
      블록마다 들어 있는 어텐션의 Q·K·V·O 행렬, 그리고 FFN 의 "넓혔다 좁히기" 행렬 두 장.
      그 표들에 든 숫자 하나하나가 <b>파라미터</b>(가중치)이고, 7B는 그 개수가 약 70억이라는
      뜻입니다. 말로만 들으면 신비한데 — 직접 세어 보면 곱셈 몇 번입니다.
    </p>

    <ModelWeighLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 몸무게의 몸통은 d² 행렬들">
      GPT-2 소형 프리셋에서 우리의 세 줄짜리 근사 공식 V·d + L·12d²(V = 어휘 수, d = 차원,
      L = 층 수)이 실제 공개 값
      <b>124M</b>을 오차 1% 미만으로 맞혔습니다 — 스펙표의 숫자는 부품별 곱셈의 합일 뿐이에요.
      그리고 막대가 보여주는 것: 어휘 표(V·d)는 조연이고 <b>몸무게의 몸통은 블록의 d² 행렬들</b>
      — 차원 d 를 2배로 올리면 블록 파라미터는 <b>4배</b>(d²)로 불어납니다. 그래서 "더 똑똑한
      모델"은 급격히 무거워져요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="모델 이름의 '7B'가 뜻하는 것은?"
      :choices="['파라미터(가중치 숫자)가 약 70억 개라는 뜻', '파일 크기가 7GB라는 뜻', '학습에 7억 원이 들었다는 뜻', '토큰을 초당 70억 개 처리한다는 뜻']"
      :answer="0"
      :hints="['실험 ①에서 7B급 프리셋을 눌렀을 때 무엇이 6.57B로 집계됐는지 보세요.']"
      explanation="B = billion(십억) — 모델을 이루는 행렬들에 든 숫자(파라미터)의 총 개수입니다. 파일 크기는 여기에 '칸 크기'를 곱해야 나와요 — 그래서 같은 7B라도 파일 크기는 제각각입니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 오늘의 용어 이름표</h2>
    <ReviewFlag id="ch1-s2" chapter="ch1" label="2. 오늘의 용어 이름표" />

    <ConceptCard tone="note" title="새 용어: 파라미터 / B / 체크포인트">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>파라미터</b> (parameter) — 읽는 법: 파라미터. 뜻: 모델의 행렬들에 든 숫자 하나하나 —
          학습이 조정하는 값이라 <b>가중치</b>(weight)라고도 부릅니다. 8부에서 "모델이 스스로
          배우는 값"이라 부른 바로 그것.
        </li>
        <li>
          <b>B / M</b> (billion / million) — 읽는 법: 빌리언/밀리언. 뜻: 파라미터 개수의 단위 —
          7B ≈ 70억 개, 124M ≈ 1억 2,400만 개. 모델 이름에 붙는 그 접미사입니다.
        </li>
        <li>
          <b>체크포인트</b> (checkpoint) — 읽는 법: 체크포인트. 뜻: 어느 시점의 파라미터 값
          전체를 통째로 저장한 <b>모델 파일</b> — 우리가 내려받는 것의 정체. "몸무게가 기록된
          서류"인 셈이라, 크기가 곧 개수 × 칸 크기입니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="같은 7B 모델인데 어떤 파일은 13GB, 어떤 파일은 4GB입니다. 무엇이 다른 걸까요?"
      :choices="['숫자 하나를 담는 칸의 크기(fp16 2바이트 vs 4비트) — 개수는 같다', '4GB 쪽은 파라미터를 3분의 1만 담았다', '13GB 쪽에 학습 데이터가 함께 들어 있다', '압축 프로그램(zip)을 썼는지의 차이다']"
      :answer="0"
      :hints="['실험 ②에서 같은 7B급에 칸만 바꿔 보셨죠 — fp16 은 13.1GB, int4 는 3.3GB.']"
      explanation="개수(70억)는 그대로 두고 칸 크기만 2바이트 → 0.5바이트로 줄인 것입니다. 숫자를 지운 게 아니라 더 좁은 칸에 반올림해 담은 것 — 워밍업의 반올림 오차가 커지는 대신 파일이 4분의 1이 되는 거래죠(8~10장의 주제)."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 9부 여정표 — 저장 · 계산 · 압축</h2>
    <ReviewFlag id="ch1-s3" chapter="ch1" label="3. 9부 여정표 — 저장 · 계산 · 압축" />
    <p class="mb-3 leading-relaxed text-slate-700">
      오늘 "개수"를 세었으니, 남은 질문은 전부 <b>칸</b> 이야기입니다.
      칸은 어떻게 생겼고(저장), 칸에 담긴 채 계산하면 무슨 사고가 나며(계산),
      칸을 얼마나 줄여도 되는가(압축) — 이 세 묶음이 9부의 지도입니다.
    </p>
    <div class="space-y-2">
      <div v-for="leg in ITINERARY" :key="leg.range" class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <span class="mt-0.5 w-16 shrink-0 rounded-lg bg-indigo-50 px-2 py-1 text-center text-xs font-bold text-indigo-700">{{ leg.range }}</span>
        <span class="min-w-0">
          <span class="block text-sm font-semibold text-slate-700">{{ leg.theme }}</span>
          <span class="block text-xs leading-relaxed text-slate-500">{{ leg.desc }}</span>
        </span>
      </div>
    </div>

    <DetailsCard title="➕ 더 깊이: GB 계산이 파일 관리자와 어긋나는 7%">
      이 장의 GB 는 <b>십진 GB(= 10억 바이트)</b>입니다 — 7B × 2바이트 = 14,000,000,000바이트
      = 14GB. 그런데 파일 관리자는 흔히 <b>GiB(기비바이트, = 2³⁰ ≈ 10.7억 바이트)</b>로 재서
      같은 파일이 <b>13.0GiB</b>로 보여요. 둘 다 맞는 값이고 자(단위)가 다를 뿐 — 약 7% 차이니
      "계산이 틀렸나?" 하고 놀라지 마세요. 참고로 실험 ②의 int4 계산(3.3GB)보다 실제 GGUF
      파일(4GB 안팎)이 조금 더 큰 건 단위 문제가 아니라 <b>숫자 외의 동봉물</b>(블록별 축척
      스티커 등) 때문인데, 그 영수증은 9장에서 한 줄씩 정산합니다.
    </DetailsCard>

    <ReviewFlag id="ch1-ai" chapter="ch1" label="🤖 AI 연결 — 회수하는 수학: 4부 10장 · 6부 8장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 4부 10장 · 6부 8장">
      부품별 저울의 공식은 <b><PartLink :part="4" ch="ch10">4부 10장</PartLink></b>에서 조립한
      구조(임베딩 → 블록 × L → 출력)를 숫자 개수로 다시 읽은 것입니다. 그리고 파라미터 세기는
      사실 두 번째예요 — <b><PartLink :part="6" ch="ch8">6부 8장</PartLink></b>의 LoRA 계산기에서
      "몇 개를 <b>새로 배우나</b>"를 셌다면, 오늘은 같은 숫자들을 "몇 바이트에 <b>담나</b>"로
      셌습니다. 조련(6부)·다이얼(8부)이 훈련의 이야기라면, 9부는 그 결과물을 <b>내 PC 에
      싣는 물류</b>의 이야기입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="숫자의 몸무게 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="모델 파일(체크포인트)의 내용물 대부분은 무엇인가?"
        :choices="['학습이 끝난 파라미터(가중치) 숫자들', '모델을 실행하는 프로그램 코드', '학습에 쓴 문서 원문', '모델의 대화 기록']"
        :answer="0"
        explanation="파일의 몸통은 행렬들에 든 숫자입니다 — 그래서 크기가 개수 × 칸 크기로 계산되죠. 실행 코드는 Ollama 같은 실행기가 따로 갖고 있어요."
      />
      <Quiz
        difficulty="easy"
        question="파라미터(parameter)와 가중치(weight)는 서로 다른 값을 가리킨다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 같은 숫자들을 부르는 두 이름이에요 — 모델의 행렬에 들어 있고 학습이 조정하는 값. 이 과정에서는 섞어 씁니다."
      />
      <Quiz
        difficulty="easy"
        question="모델 파일 크기를 어림하는 기본 공식은?"
        :choices="['파라미터 개수 × 숫자 하나의 칸 크기', '층 수 × 학습 시간', '어휘 수 × 문맥 길이', '파라미터 개수 ÷ GPU 개수']"
        :answer="0"
        explanation="9부에서 가장 자주 쓸 한 줄 — 개수는 모델 설계(부품별 저울)가, 칸 크기는 정밀도·양자화(2~10장)가 정합니다."
      />
      <Quiz
        difficulty="easy"
        question="정확히 70억(7B) 개의 파라미터를 fp16(2바이트) 칸에 담으면 몇 GB인가? (십진 GB, 정수로)"
        type="numeric"
        :answer="14"
        explanation="70억 × 2바이트 = 140억 바이트 = 14GB(십진). 실험 ②의 7B급(6.57B)이 13.1GB였던 것과 같은 계산입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="GPT-2 소형(124M) 실험에서 파라미터가 가장 많이 사는 곳은?"
        :choices="['블록들 — 어텐션·FFN 의 d² 행렬 (약 85M)', '임베딩 표 (약 39M)', '층과 층 사이의 연결선', '출력 화면 버퍼']"
        :answer="0"
        :hints="['실험 ①의 막대 세 개 중 어느 쪽이 길었나요?']"
        explanation="임베딩 표(V·d ≈ 39M)도 크지만 몸통은 블록의 d² 행렬들(L·12d² ≈ 85M)입니다 — 모델이 커질수록 이 쏠림은 더 심해져요(7B급에선 임베딩이 2%)."
      />
      <Quiz
        difficulty="medium"
        question="차원 d 를 2배로 올리면 블록(어텐션·FFN)의 파라미터 수는 대략 어떻게 되나?"
        :choices="['약 4배 — d² 에 비례하므로', '약 2배 — d 에 비례하므로', '변화 없다', '약 8배 — d³ 에 비례하므로']"
        :answer="0"
        explanation="블록의 행렬들은 d×d(또는 d×4d) 꼴이라 파라미터가 d²으로 자랍니다 — 실험 ①에서 d 슬라이더 한 칸의 위력이 컸던 이유."
      />
      <Quiz
        difficulty="medium"
        question="실험 ②에서 같은 7B급의 몸무게가 fp32 → int4 로 갈수록 줄어든 이유는?"
        :choices="['숫자 하나를 담는 칸이 4바이트에서 0.5바이트로 좁아져서 — 개수는 그대로', '파라미터를 8분의 1만 남기고 지워서', '모델의 층 수를 줄여서', '어휘 수를 줄여서']"
        :answer="0"
        explanation="26.3GB → 3.3GB, 정확히 칸 크기 비율(4 → 0.5바이트)입니다. 무엇을 잃는 대가인지 — 워밍업의 반올림 오차가 커집니다 — 는 8~10장에서 측정해요."
      />
      <Quiz
        difficulty="medium"
        question="계산으로는 14GB인 파일이 파일 관리자에 13.0GiB로 보였다. 옳은 해석은?"
        :choices="['둘 다 맞다 — GB(10억 바이트)와 GiB(2³⁰ 바이트)는 눈금이 약 7% 다른 자다', '내려받다가 1GB가 유실됐다', '계산 공식이 틀렸다', '파일 관리자의 버그다']"
        :answer="0"
        explanation="같은 바이트 수를 십진 자(GB)로 재면 14, 이진 자(GiB)로 재면 13.0입니다 — 단위 표기만 다른 같은 값이에요. 모델 카드와 파일 관리자의 숫자가 어긋나 보이는 흔한 이유."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="동료가 '32GB RAM PC를 샀으니 70B 모델(fp16)도 돌릴 수 있겠지?'라고 합니다. 오늘 공식 기준의 정확한 답은?"
        :choices="['70B × 2바이트 = 140GB — 가중치만으로 32GB를 4배 넘겨 불가, 칸을 줄인 양자화판을 찾아야 한다', '32GB면 어떤 모델이든 돌릴 수 있다', 'RAM 이 아니라 CPU 속도만 문제다', '70B는 파일 크기가 70GB로 고정이라 불가능하다']"
        :answer="0"
        :hints="['개수 × 칸 크기부터 계산해 보세요 — 70억이 아니라 700억 개입니다.']"
        explanation="700억 × 2바이트 = 140GB. int4 로 줄여도 35GB라 32GB PC엔 여전히 빠듯하죠. 모델 선택의 첫 계산이 바로 이 한 줄입니다 — 정밀한 판정법(문맥 몫 포함)은 11장 캡스톤에서."
      />
      <Quiz
        difficulty="hard"
        question="우리의 근사 공식(V·d + L·12d²)이 실제 공개 값과 1% 안팎으로만 어긋나는 이유로 가장 알맞은 것은?"
        :choices="['bias·LayerNorm 같은 작은 부품을 생략했지만, 몸무게의 몸통(d² 행렬들)은 전부 담았기 때문', '실제 값이 대외비라 아무 숫자에나 맞춘 것이기 때문', '공식에 우연히 오차가 상쇄되는 마법이 있기 때문', '어긋남이 없어야 정상인데 계산 실수가 있었기 때문']"
        :answer="0"
        :hints="['핵심 관찰 카드 — 무엇이 조연이고 무엇이 몸통이었나요?']"
        explanation="파라미터의 압도적 다수는 d² 급 행렬들이고, 생략한 부품(bias·LayerNorm 등)은 d 급이라 티끌입니다 — 근사가 통하는 이유까지가 오늘의 수학이에요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch1')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">1장 완료!</p>
      <p class="mt-1 text-sm text-emerald-700">
        "개수"는 셌으니 이제 "칸"입니다. 다음은 2장 — 컴퓨터의 손가락,
        스위치(비트) 몇 개로 얼마나 셀 수 있는지부터 차근차근 시작해요.
      </p>
      <RouterLink
        to="/ch/ch2"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        2장 — 컴퓨터의 손가락: 비트와 이진법 →
      </RouterLink>
    </div>
  </article>
</template>
