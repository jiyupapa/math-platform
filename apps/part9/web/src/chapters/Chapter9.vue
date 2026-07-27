<script setup lang="ts">
// ch9 — 4비트까지: 블록 양자화와 GGUF. 아웃라이어 전쟁의 해법(분단별 채점)과
// Q4_K_M 문패 완독, "계산 3.3GB vs 실파일 4.1GB" 영수증 정산.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import BlockQuantLab from '@/components/BlockQuantLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch9')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">9장 · 압축 — 칸 줄이기 ②</p>
    <h1 class="mb-4 text-3xl font-bold">4비트까지 — 블록 양자화와 GGUF</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      int8(6.6GB)에서 국민 태그 q4(4GB)로 내려가려면 눈금이 <b>±7, 열다섯 개</b>뿐입니다.
      8장의 세 겹 보험으로도 아슬아슬한데, 노트북에서 예고한 빌런 — <b>아웃라이어</b> — 이
      축척을 망치면 즉사죠. 오늘은 그 전쟁의 해법(블록)과, 여러분이 Ollama 에서 보던
      <b>Q4_K_M 문패의 완독</b>, 그리고 1장부터 끌어온 "3.3GB vs 4.1GB" 수수께끼의 정산입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      ① 아웃라이어 한 개가 통짜 축척을 어떻게 무너뜨리는지, <b>블록(32개마다 축척 하나)</b>이
      피해를 어떻게 국한하는지 실측하고, ② GGUF 태그(Q4·K·M·_0)를 조각조각 해독해
      ③ <b>실효 비트/파라미터</b>로 실제 파일 크기 영수증을 재현합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 빌런의 실체 — 분포의 꼬리</h2>
    <ReviewFlag id="ch9-s1" chapter="ch9" label="1. 빌런의 실체 — 분포의 꼬리" />
    <p class="leading-relaxed text-slate-700">
      8장의 축복은 "가중치가 0 중심 종모양"이었어요. 그런데
      <b>3부 5장</b>에서 배웠듯 분포에는 <b>꼬리</b>가 있습니다 — 드물지만 유난히 큰 값. 실제 LLM 의 가중치·활성값에도 아웃라이어가 실존하고,
      축척이 s = max|w|/7 (int4!) 이니 <b>딱 한 명의 거인이 전체의 눈금을 7배, 10배 성기게</b>
      만들어요. 전교 1등 때문에 반 전체 커브가 무너지는 격이죠. 해법은 채점 단위를 줄이는 것 —
      <b>분단별 채점</b>, 즉 블록 양자화입니다.
    </p>

    <BlockQuantLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 블록의 가격표: 실효 비트">
      블록은 공짜가 아닙니다 — 32개마다 fp16 축척(16비트) 하나면 <b>파라미터당 +0.5비트</b>.
      그래서 "4비트 양자화"의 진짜 몸무게는 4가 아니라 <b>실효 4.5비트</b>(Q4_0), K-quants 의
      2단 축척과 중요 텐서 6비트 믹스(M)까지 얹으면 <b>약 4.85비트</b>(Q4_K_M)예요.
      6.57B × 4.85bit ÷ 8 ≈ <b>4.0GB</b> — 1장에서 "계산은 3.3인데 파일은 4GB 안팎"이라던
      수수께끼의 영수증이 이렇게 맞아떨어집니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="블록 양자화가 아웃라이어 피해를 줄이는 방식은?"
      :choices="['축척을 블록(예: 32개)마다 따로 둬서, 거인의 영향이 자기 블록 안에만 미치게 한다', '아웃라이어를 찾아 삭제한다', '아웃라이어를 0으로 반올림한다', '전체 축척을 두 배로 키운다']"
      :answer="0"
      :hints="['실험 ①의 블록 칩 — 몇 번 블록만 빨갛게 물들었나요?']"
      explanation="값을 건드리지 않고 채점 단위를 줄이는 것 — 나머지 세 블록(96명)은 자기들끼리의 촘촘한 축척을 그대로 씁니다. 실험에서 무고한 127명의 오차가 몇 배 차이 났는지 보세요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 문패 읽는 법 — 용어 이름표</h2>
    <ReviewFlag id="ch9-s2" chapter="ch9" label="2. 문패 읽는 법 — 용어 이름표" />

    <ConceptCard tone="note" title="새 용어: 블록 양자화 / 아웃라이어 / GGUF">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>블록 양자화</b> (block-wise / group-wise quantization) — 읽는 법: 블록 양자화.
          뜻: 가중치를 몇십 개 단위 블록으로 잘라 <b>블록마다 축척(과 영점)을 따로</b> 두는 것 —
          8장 "행마다 축척"의 극단화. 아웃라이어 방어 + 눈금 밀착의 핵심 재주.
        </li>
        <li>
          <b>아웃라이어</b> (outlier) — 읽는 법: 아웃라이어. 뜻: 분포의 꼬리에 사는,
          유난히 큰 소수의 값 — 축척을 부풀려 <b>다수의 정밀도를 희생시키는</b> 양자화의 빌런.
        </li>
        <li>
          <b>GGUF</b> (GGML Universal File) — 읽는 법: 지지유에프. 뜻: llama.cpp 계열(Ollama 포함)의
          <b>모델 파일 컨테이너</b> — 양자화된 가중치 + 축척들 + 어휘·메타데이터를 한 파일에.
          문패 문법: <code>Q4_K_M</code> = 4비트 · K-quants(2단 축척) · Medium 믹스.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="Q4_K_M 에서 K 가 뜻하는 것은?"
      :choices="['K-quants — 블록 위에 상위블록을 얹은 2단 축척 체계', '천(kilo) 단위 블록', '한국(Korea)식 양자화', '커널(kernel) 최적화']"
      :answer="0"
      :hints="['축척이 많아지면 축척 자체도 저장 부담 — 그걸 또 아끼려면?']"
      explanation="블록 축척들이 많아지니 그 축척들을 다시 묶어 압축하는 2단 구조(축척의 축척)가 K-quants 입니다. 뒤의 M 은 중요 텐서를 6비트로 상향하는 믹스 정도(S/M/L)예요."
    />

    <DetailsCard title="➕ 더 깊이: 축척의 축척, 그리고 활성값 아웃라이어">
      K-quants 의 2단 구조를 한 줄로: 블록 8개를 묶은 <b>상위블록(super-block)</b> 이 fp16
      대표 축척을 하나 갖고, 각 블록은 그 대표에 대한 <b>작은 정수 배율</b>만 저장합니다 —
      축척 저장비까지 아끼는 재주죠. 한편 아웃라이어 문제는 가중치보다 <b>활성값</b>에서 더
      사납습니다 — 큰 모델일수록 특정 채널(열)에 아웃라이어가 몰린다는 것이 알려져 있고,
      그래서 유명한 LLM.int8() 은 <b>그 몇 개 채널만 fp16 으로 분리 계산</b>하고 나머지를
      int8 로 처리합니다. "전부 같은 칸"이 아니라 <b>값의 성질에 따라 칸을 섞는 것</b> —
      M 믹스도, 채널 분리도 같은 철학입니다.
    </DetailsCard>

    <ReviewFlag id="ch9-ai" chapter="ch9" label="🤖 AI 연결 — 회수하는 수학: 3부 5장 · 5부 2장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 3부 5장 · 5부 2장">
      아웃라이어의 고향은 <b><PartLink :part="3" ch="ch5">3부 5장</PartLink></b> 분포의
      꼬리이고, "자주 나오는 것에 비트를 아끼고 드문 것에 더 쓴다"는 M 믹스의 철학은
      <b><PartLink :part="5" ch="ch2">5부 2장</PartLink></b> 압축의 원리 그대로입니다 —
      차이라면 zip(무손실)과 달리 양자화는 <b>반올림을 감수하는 손실 압축</b>이라 그 한계
      아래로 내려갈 수 있다는 것. 이제 Ollama 라이브러리의 태그 목록이 전부 읽힙니다 —
      기본값 <b>q4_K_M 이 국민 태그인 이유(크기↔품질의 균형점)</b>까지. 그런데 "품질을
      잃었다"를 감으로 말할 순 없죠 — 숫자로 재는 자(퍼플렉시티)가 다음 장입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="블록 양자화와 GGUF — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="아웃라이어가 양자화를 망치는 경로는?"
        :choices="['축척 s = max|w|/눈금수 의 분자를 키워, 나머지 전원의 눈금을 성기게 만든다', '아웃라이어 자신만 부정확해진다', '파일 크기를 두 배로 만든다', '정수 변환을 불가능하게 만든다']"
        :answer="0"
        explanation="8장 노트북에서 실측한 그대로 — 0.5 하나가 축척을 6배 부풀려 4,095명의 오차를 함께 키웠죠. 피해자는 아웃라이어가 아니라 나머지 전원입니다."
      />
      <Quiz
        difficulty="easy"
        question="블록 양자화는 블록마다 축척을 따로 둔다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 보통 32개(또는 64·128개) 단위 — 아웃라이어의 피해가 자기 블록에 국한되고, 각 블록의 눈금이 자기 분포에 밀착합니다."
      />
      <Quiz
        difficulty="easy"
        question="GGUF 태그 Q4_K_M 의 '4'가 뜻하는 것은?"
        :choices="['가중치 하나를 담는 비트 수(4비트)', '블록의 개수', '모델의 층 수', '버전 번호']"
        :answer="0"
        explanation="Q = 양자화(quantized), 숫자 = 비트 수입니다 — Q8 은 8비트, Q2 는 2~3비트."
      />
      <Quiz
        difficulty="easy"
        question="블록 32개마다 fp16 축척(16비트) 하나를 두면 파라미터당 몇 비트가 추가되나? (소수로)"
        type="numeric"
        :answer="0.5"
        explanation="16비트 ÷ 32개 = 0.5비트/파라미터 — '4비트' 양자화의 실효가 4.5비트인 이유입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="1장의 수수께끼 — int4 계산(3.3GB)보다 실제 Q4_K_M 파일(4GB 안팎)이 큰 이유는?"
        :choices="['실효 비트가 약 4.85 — 블록 축척들 + 중요 텐서 6비트 믹스(M) + 메타데이터·어휘', '다운로드 중 오류로 부풀어서', 'GB 와 GiB 단위 차이 때문 (그것만으로 전부 설명된다)', '광고 데이터가 포함돼서']"
        :answer="0"
        :hints="['태그 해독기에서 Q4_K_M 의 실효 비트가 몇이었나요?']"
        explanation="6.57B × 4.85bit ÷ 8 ≈ 4.0GB — 영수증이 맞아떨어집니다. GiB 표기 차이(1장)는 별개의 ±7% 이야기예요."
      />
      <Quiz
        difficulty="medium"
        question="Q4_K_M 의 M(Medium)이 하는 일은?"
        :choices="['품질에 민감한 중요 텐서들을 6비트 등 더 높은 비트로 섞는 정도를 표시(S/M/L)', '모델(Model)의 약자로 의미 없음', '메모리(Memory)를 두 배로 쓰는 모드', '중간(Middle) 층만 양자화한다는 뜻']"
        :answer="0"
        explanation="전부 같은 칸이 아니라 값의 중요도에 따라 칸을 섞는 믹스 전략입니다 — S(작게)·M(균형)·L(넉넉히). 5부 2장 '드문 것에 비트를 더'의 손실판이죠."
      />
      <Quiz
        difficulty="medium"
        question="같은 4비트인데 Q4_K_M 이 Q4_0 보다 품질이 좋은 이유는?"
        :choices="['2단 축척(K-quants)과 중요 텐서 상향 믹스(M) — 같은 비트 예산을 더 영리하게 배분', 'Q4_K_M 이 파라미터를 더 많이 저장해서', '_0 이 최신 세대라는 뜻이라서 (거꾸로다)', '차이가 없다 — 이름만 다르다']"
        :answer="0"
        explanation="_0 은 구식 단순 블록 세대 표시입니다. 비트 예산이 비슷해도(4.5 vs 4.85) 배분 전략의 세대 차이가 품질을 가릅니다 — 10장에서 퍼플렉시티로 측정해요."
      />
      <Quiz
        difficulty="medium"
        question="GGUF 파일 안에 가중치 말고 함께 들어 있는 것은?"
        :choices="['블록 축척들 + 어휘(토크나이저) + 메타데이터 — 실행에 필요한 것을 한 파일에', '학습에 쓴 원본 문서들', '지난 대화 기록', 'GPU 드라이버']"
        :answer="0"
        explanation="컨테이너 포맷이라 Ollama 가 파일 하나만 받으면 바로 돌 수 있습니다 — 2장 더 깊이에서 본 '16진수 덩어리'의 정체가 이 구성물들이에요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="블록 크기를 32 대신 256으로 키우면 생기는 트레이드오프는?"
        :choices="['축척 오버헤드는 준다(+0.0625비트) — 대신 아웃라이어 피해 범위가 넓어지고 눈금 밀착도가 떨어져 오차가 커진다', '오버헤드도 오차도 함께 줄어든다 — 클수록 무조건 좋다', '오버헤드가 커지고 오차는 준다', '아무 변화 없다']"
        :answer="0"
        :hints="['축척 하나가 책임지는 인원수가 8배 — 거인 한 명의 피해 범위는? 축척 저장비는?']"
        explanation="블록 크기는 다이얼입니다 — 작을수록 정확·비쌈, 클수록 가볍고 거침. 32~128이 실전 균형점이고, K-quants 의 2단 구조는 이 딜레마 자체를 완화하려는 설계예요."
      />
      <Quiz
        difficulty="hard"
        question="활성값 아웃라이어에 대한 LLM.int8() 류의 처방은?"
        :choices="['아웃라이어가 몰린 소수의 채널만 fp16 으로 분리 계산하고 나머지는 int8 로 — 칸을 성질에 따라 섞는다', '아웃라이어 채널을 삭제한다', '활성값 전체를 int4 로 더 줄인다', '모델을 처음부터 다시 훈련한다']"
        :answer="0"
        :hints="['더 깊이 카드 — 큰 모델의 아웃라이어는 어디에 몰려 있다고 했죠?']"
        explanation="큰 모델일수록 특정 채널에 아웃라이어가 집중된다는 관찰 위의 설계입니다 — M 믹스와 같은 철학(전부 같은 칸일 필요가 없다)의 활성값 버전이에요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch9')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">9장 완료 — 4GB 의 비밀 해독!</p>
      <p class="mt-1 text-sm text-emerald-700">
        이제 "얼마나 잃었나"를 감이 아니라 숫자로 잴 차례 — 5부에서 배운 퍼플렉시티가
        양자화의 성적표가 되어 돌아옵니다.
      </p>
      <RouterLink
        to="/ch/ch10"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        10장 — 품질 성적표: 양자화는 얼마나 잃나 →
      </RouterLink>
    </div>
  </article>
</template>
