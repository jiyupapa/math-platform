<script setup lang="ts">
// Phase 2 · 아껴 쓰는 비트 — 압축의 원리
// 표준 구성: 개념 설명 + 새 기호 설명 + 인터랙티브 시각화 + 미니체크 + 10문제 세트 + 노트북 안내
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import CodeBuilder from '@/components/CodeBuilder.vue'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch2')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 2</p>
    <h1 class="mb-4 text-3xl font-bold">아껴 쓰는 비트 — 압축의 원리</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1장에서 정보를 비트로 재는 자를 만들었죠. 이번엔 그 자로 <b>절약</b>을 해 봅니다 —
      같은 메시지를 더 적은 비트로 보내는 기술, 즉 <b>압축</b>입니다.
      zip 파일과 GPT 토큰화가 같은 원리 위에 있다는 걸 보게 될 거예요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>압축의 제1원리 — <b>자주 나오면 짧게, 드물면 길게</b></li>
        <li>구분자 없이도 해독되는 <b>접두어 코드</b>의 규칙을 안다</li>
        <li>평균 코드 길이를 계산하고, <b>이상적 코드 길이 = 놀람</b>임을 본다</li>
        <li>GPT 의 <b>BPE 토큰화가 곧 압축</b>임을 안다 (4부 2장 재회)</li>
      </ul>
    </ConceptCard>

    <!-- 1. 모스 부호 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 1837년에 이미 알고 있었다 — 모스 부호</h2>
    <ReviewFlag id="ch2-s1" chapter="ch2" label="1. 모스 부호" />
    <p class="leading-relaxed text-slate-700">
      전신 기사들은 글자 하나하나를 짧은 신호(·)와 긴 신호(−)로 보냈습니다.
      한 번 누르는 데 시간이 드니, 신호를 아끼는 게 곧 돈이었죠. 모스의 해법:
      영어에서 <b>가장 자주 나오는 E 는 "·" 딱 하나</b>, 드물게 나오는 <b>Q 는 "− − · −" 네 개</b>.
    </p>
    <div class="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
      <p class="font-bold text-slate-800">압축의 제1원리 — 자주 나오면 짧게, 드물면 길게</p>
      <p class="mt-1 text-sm text-slate-500">이 한 문장이 zip · jpg · mp3 · GPT 토큰화의 공통 조상입니다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="모스 부호에서 E 의 신호가 가장 짧은 이유는?"
      :choices="['영어에서 가장 자주 나오는 글자라서', '알파벳 순서가 빨라서', '발음이 짧아서', '특별한 이유 없음']"
      :answer="0"
      explanation="자주 나오는 글자에 짧은 코드를 줘야 전체 신호가 짧아집니다 — 압축의 제1원리."
    />

    <!-- 2. 고정 길이 코드 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 출발점 — 모두에게 똑같은 길이 주기</h2>
    <ReviewFlag id="ch2-s2" chapter="ch2" label="2. 고정 길이 코드" />
    <p class="leading-relaxed text-slate-700">
      글자 A, B, C, D 네 개만 쓰는 세상을 상상합시다. 0과 1로 보내려면 가장 단순한 방법은
      <b>모두에게 같은 길이</b>를 주는 것:
    </p>
    <div class="my-3 flex flex-wrap justify-center gap-2 text-sm">
      <span class="rounded-lg bg-slate-100 px-3 py-1.5">A = <code class="font-mono font-bold">00</code></span>
      <span class="rounded-lg bg-slate-100 px-3 py-1.5">B = <code class="font-mono font-bold">01</code></span>
      <span class="rounded-lg bg-slate-100 px-3 py-1.5">C = <code class="font-mono font-bold">10</code></span>
      <span class="rounded-lg bg-slate-100 px-3 py-1.5">D = <code class="font-mono font-bold">11</code></span>
    </div>
    <p class="leading-relaxed text-slate-700">
      글자당 정확히 <b>2비트</b>입니다. 왜 2일까요? 1장의 자로 재면 —
      후보 4개를 구분하려면 반반 질문 <MathBlock inline expr="\log_2 4 = 2" /> 번이 필요하니까요.
      글자가 8개면 3비트, 256개면 8비트(그래서 1바이트가 8비트!).
      이 방식을 <b>고정 길이 코드</b>라 합니다. 공평하지만… 아직 아낄 줄을 모릅니다.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="글자 8개를 고정 길이 코드로 구분하려면 글자당 몇 비트가 필요할까요?"
      type="numeric"
      :answer="3"
      :hints="['후보 8개를 구분하는 반반 질문 수 = log₂8.']"
      explanation="log₂8 = 3비트. 000, 001, 010, … 111 로 8가지를 만들 수 있죠."
    />

    <!-- 3. 가변 길이 코드 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 빈도가 치우치면 아낄 수 있다</h2>
    <ReviewFlag id="ch2-s3" chapter="ch2" label="3. 가변 길이 코드와 접두어 규칙" />
    <p class="leading-relaxed text-slate-700">
      그런데 실제 메시지에서 네 글자가 똑같이 나올 리 없죠. A 가 절반, B 가 1/4,
      C 와 D 가 1/8씩 나온다고 해 봅시다. 모스처럼 <b>A 에 짧은 코드</b>를 주면:
    </p>
    <div class="my-3 flex flex-wrap justify-center gap-2 text-sm">
      <span class="rounded-lg bg-indigo-50 px-3 py-1.5">A (1/2) = <code class="font-mono font-bold">0</code></span>
      <span class="rounded-lg bg-indigo-50 px-3 py-1.5">B (1/4) = <code class="font-mono font-bold">10</code></span>
      <span class="rounded-lg bg-indigo-50 px-3 py-1.5">C (1/8) = <code class="font-mono font-bold">110</code></span>
      <span class="rounded-lg bg-indigo-50 px-3 py-1.5">D (1/8) = <code class="font-mono font-bold">111</code></span>
    </div>
    <p class="leading-relaxed text-slate-700">
      평균을 내 봅시다. 3부에서 배운 <b>기대값</b> 그대로 — 각 길이에 확률을 곱해 더합니다:
    </p>
    <MathBlock expr="\text{평균 길이} = \tfrac{1}{2}\!\times\!1 + \tfrac{1}{4}\!\times\!2 + \tfrac{1}{8}\!\times\!3 + \tfrac{1}{8}\!\times\!3 = 1.75 \text{비트}" />
    <p class="mt-1 leading-relaxed text-slate-700">
      고정 2비트에서 <b>1.75비트로, 12.5% 절약</b>! 1000글자면 250비트를 아낍니다.
    </p>

    <ConceptCard tone="note" title="새 용어 — 접두어 코드 (prefix code)">
      <p>
        "코드 길이가 제각각이면 어디서 끊어 읽지?" — 좋은 질문! 위 코드는 구분자 없이
        이어 붙여도 해독이 됩니다. 비결은 <b>어떤 글자의 코드도 다른 글자 코드의
        앞부분(접두어)이 아니게</b> 만든 것.
      </p>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li><b>이름</b>: 접두어 코드 (prefix code) — "앞부분 겹침 금지 코드"</li>
        <li>
          <b>해독 요령</b>: 왼쪽부터 읽다가 아는 코드가 완성되는 순간 끊는다.
          예: <code class="rounded bg-slate-100 px-1 font-mono">0 10 0 111</code> → A B A D
        </li>
        <li>
          A = <code class="font-mono">0</code> 인데 B = <code class="font-mono">01</code> 이면 실격 —
          0을 읽고 "A 인가, B 의 시작인가" 구분이 안 되니까요
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="A=0, B=10, C=110, D=111 코드에서, 비트열 「10」 을 읽으면 어디서 끊어야 할지 헷갈린다."
      type="truefalse"
      :answer="1"
      explanation="거짓. 접두어 코드라 헷갈리지 않아요 — 1을 읽으면 아직 미완성, 0이 오는 순간 「10 = B」로 확정됩니다. 다른 코드 중 10으로 시작하는 것이 없거든요."
    />

    <!-- 4. CodeBuilder -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 코드 공방 — 직접 만들어 보기</h2>
    <ReviewFlag id="ch2-s4" chapter="ch2" label="4. 코드 공방 (허프만 직관)" />
    <p class="leading-relaxed text-slate-700">
      "그럼 어떤 분포든 <b>가장 좋은 코드</b>는 어떻게 찾지?" — 1952년 대학원생 허프만이
      숙제로 풀어낸 문제입니다. 요령은 간단해요: <b>가장 드문 두 글자를 묶어서 긴 코드 쪽으로
      보내는 걸 반복</b>하면 끝. 아래 공방이 그 <b>허프만 코드</b>를 실시간으로 만들어 줍니다.
      슬라이더를 움직이며 관찰해 보세요.
    </p>

    <CodeBuilder />

    <ConceptCard tone="tip" title="관찰 포인트 3가지">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>치우칠수록 절약이 커진다</b> — "극단" 프리셋에서 최대</li>
        <li><b>균등이면 절약 0</b> — 모두 25%면 2비트씩이 이미 최선</li>
        <li><b>코드 길이가 놀람을 따라간다</b> — 확률 낮은 글자일수록 긴 코드 (다음 절!)</li>
      </ul>
    </ConceptCard>

    <!-- 5. 코드 길이 = 놀람 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">5. 우연이 아니다 — 이상적 코드 길이 = 놀람</h2>
    <ReviewFlag id="ch2-s5" chapter="ch2" label="5. 이상적 코드 길이 = 놀람" />
    <p class="leading-relaxed text-slate-700">
      3절의 코드를 다시 보세요. A (확률 1/2) 의 코드 길이는 1비트 = <MathBlock inline expr="\log_2 2" />.
      B (1/4) 는 2비트 = <MathBlock inline expr="\log_2 4" />. C, D (1/8) 는 3비트 =
      <MathBlock inline expr="\log_2 8" />. 전부 <b>1장에서 배운 그 글자의 놀람</b>과 정확히 일치합니다!
    </p>
    <MathBlock expr="\text{글자 } x \text{ 의 이상적 코드 길이} = \log_2 \frac{1}{p(x)} = \text{놀람 } I(x)" />
    <p class="mt-1 leading-relaxed text-slate-700">
      직관은 이렇습니다 — 코드는 사실 <b>스무고개 질문의 기록</b>이에요. "A 인가요?"(반반 질문)에
      예면 <code class="rounded bg-slate-100 px-1 font-mono">0</code>, 아니면 다음 질문으로.
      확률 1/8짜리 글자를 확정하려면 반반 질문 3번이 필요하니 코드도 3비트가 되는 거죠.
    </p>

    <ConceptCard tone="warn" title="압축의 한계 — 공짜 점심은 없다">
      그렇다면 아무리 머리를 굴려도, 글자당 평균 비트를
      <b>평균 놀람</b> <MathBlock inline expr="\textstyle\sum p \cdot \log_2 \frac{1}{p}" /> 아래로는
      줄일 수 없다는 뜻입니다 — 각 글자가 실어 나르는 놀람만큼의 비트는 반드시 필요하니까요.
      섀넌이 증명한 이 <b>넘을 수 없는 바닥</b>에는 이름이 있습니다.
      다음 챕터의 주인공, <b>엔트로피</b>입니다.
    </ConceptCard>

    <DetailsCard title="➕ 더 깊이: 허프만이 그 바닥에 딱 붙지 못할 때도 있다?">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          확률이 1/2, 1/4, 1/8 처럼 <b>2의 거듭제곱의 역수</b>면 허프만 코드가 바닥(평균 놀람)에
          정확히 붙습니다 — 3절 예시의 1.75비트가 그 경우예요.
        </li>
        <li>
          확률이 어중간하면(예: 0.6) 이상적 길이가 log₂(1/0.6) ≈ 0.74비트처럼 <b>소수</b>가 되는데,
          코드 길이는 정수만 가능해서 살짝 손해를 봅니다. 여러 글자를 묶어 부호화하거나
          산술 부호화(arithmetic coding) 같은 기법으로 바닥에 무한히 가까워질 수 있어요 — 이 과정 밖의 이야기!
        </li>
      </ul>
    </DetailsCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="확률 1/8 로 나오는 글자의 이상적 코드 길이는 몇 비트일까요?"
      type="numeric"
      :answer="3"
      :hints="['이상적 코드 길이 = 그 글자의 놀람 log₂(1/p).']"
      explanation="log₂8 = 3비트. 코드 길이와 놀람이 같은 것이 이 챕터의 핵심 연결고리입니다."
    />

    <!-- AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 GPT 의 토큰화는 압축이다</h2>
    <ReviewFlag id="ch2-ai" chapter="ch2" label="🤖 BPE 토큰화 = 압축" />
    <p class="leading-relaxed text-slate-700">
      4부 2장에서 배운 <b>BPE 토큰화</b>를 기억하나요? "자주 붙어 나오는 글자 쌍을 병합해
      토큰 하나로 만든다"를 반복하는 알고리즘이었죠. 이 챕터를 배운 지금 다시 보면 —
      그게 바로 <b>압축의 제1원리</b>입니다.
    </p>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 자주 나오면 짧게, 토큰화 편">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>BPE = 허프만의 사촌</b>: 허프만은 자주 나오는 글자에 짧은 비트를, BPE 는 자주 나오는
          글자 뭉치("the", "ing", "니다")에 <b>토큰 한 칸</b>을 줍니다. 흔한 단어는 토큰 1개,
          희귀한 단어는 여러 토큰으로 쪼개지는 이유예요.
        </li>
        <li>
          <b>토큰 수 = 압축된 길이</b>: 같은 뜻이라도 영어보다 한국어가 토큰이 많이 드는 것,
          API 요금이 토큰 단위인 것 — 전부 "이 텍스트를 몇 칸으로 압축했나"의 이야기입니다.
        </li>
        <li>
          <b>"압축 = 지능" 담론</b>: 잘 압축하려면 무엇이 자주 나올지 <b>잘 예측</b>해야 합니다.
          거꾸로 잘 예측하는 모델은 훌륭한 압축기가 되죠. "LLM 은 인터넷의 압축 파일"이라는
          말이 여기서 나옵니다 — 6장에서 이 연결이 완성돼요.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="BPE 토큰화에서 '자주 나오는 글자 뭉치'는 어떻게 처리될까요?"
      :choices="['토큰 하나로 병합된다 (짧게)', '여러 토큰으로 쪼개진다 (길게)', '무작위로 배정된다', '삭제된다']"
      :answer="0"
      explanation="자주 나오면 짧게! 흔한 뭉치는 토큰 1개로 병합되고, 희귀한 단어일수록 여러 토큰으로 쪼개집니다."
    />

    <!-- 연습 문제 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">6. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 10문제입니다. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="아껴 쓰는 비트 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="압축의 기본 아이디어는 '자주 나오는 것에 짧은 코드를 주는 것'이다."
        type="truefalse"
        :answer="0"
        explanation="참. 모스 부호부터 zip, BPE 토큰화까지 모두 이 원리입니다."
      />
      <Quiz
        difficulty="easy"
        question="글자 4개를 고정 길이 코드로 구분하려면 글자당 몇 비트가 필요할까요?"
        type="numeric"
        :answer="2"
        explanation="log₂4 = 2비트. 00, 01, 10, 11 네 가지."
      />
      <Quiz
        difficulty="easy"
        question="접두어 코드(prefix code)의 규칙으로 옳은 것은?"
        :choices="['어떤 코드도 다른 코드의 앞부분이면 안 된다', '모든 코드의 길이가 같아야 한다', '코드에 0을 쓰면 안 된다', '글자마다 구분자를 넣어야 한다']"
        :answer="0"
        :hints="['구분자 없이 이어 붙여도 해독되게 하는 규칙이에요.']"
        explanation="앞부분(접두어) 겹침 금지 — 그래야 왼쪽부터 읽으며 아는 코드가 완성되는 순간 끊을 수 있습니다."
      />
      <Quiz
        difficulty="easy"
        question="모든 글자가 똑같은 빈도로 나오면, 가변 길이 코드로도 고정 길이보다 아낄 수 없다."
        type="truefalse"
        :answer="0"
        explanation="참. 코드 공방에서 균등 프리셋의 절약이 0%였죠 — 치우침이 없으면 아낄 거리도 없습니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="확률이 A: 1/2, B: 1/4, C: 1/4 이고 코드 길이가 A: 1, B: 2, C: 2 일 때, 평균 코드 길이를 단계별로 구하세요."
        :steps="[
          { lhs: '\\tfrac{1}{2} \\times 1', answer: 0.5 },
          { lhs: '\\tfrac{1}{4} \\times 2', answer: 0.5 },
          { lhs: '\\tfrac{1}{4} \\times 2', answer: 0.5 },
          { lhs: '\\text{합계}', answer: 1.5 },
        ]"
        :hints="['평균 = 각 (확률 × 길이) 를 전부 더한 것 (3부의 기대값).', '0.5 + 0.5 + 0.5.']"
        explanation="평균 길이 = 0.5+0.5+0.5 = 1.5비트. 고정 길이라면 log₂3 때문에 2비트가 필요하니 절약!"
      />
      <Quiz
        difficulty="medium"
        question="A=0, B=10, C=110, D=111 코드로 메시지 「ABAC」 를 보내면 총 몇 비트일까요?"
        type="numeric"
        :answer="7"
        :hints="['A는 1비트, B는 2비트, C는 3비트.', '1 + 2 + 1 + 3.']"
        explanation="A(1비트) + B(2비트) + A(1비트) + C(3비트) = 7비트. 비트열로는 「0 10 0 110」입니다. 고정 길이(2비트씩)라면 8비트가 필요했겠죠."
      />
      <Quiz
        difficulty="medium"
        question="다음 중 가변 길이 코드의 절약 효과가 가장 큰 분포는?"
        :choices="['한 글자가 압도적으로 자주 나오는 분포', '모든 글자가 균등한 분포', '두 글자만 반반씩 나오는 분포', '절약은 분포와 무관하다']"
        :answer="0"
        :hints="['코드 공방의 극단 프리셋을 떠올려 보세요.']"
        explanation="치우칠수록 절약이 큽니다. 압도적으로 자주 나오는 글자에 1비트만 주면 대부분의 글자가 1비트로 끝나니까요."
      />
      <Quiz
        difficulty="medium"
        question="확률 1/4 로 나오는 글자의 이상적 코드 길이는 몇 비트일까요?"
        type="numeric"
        :answer="2"
        :hints="['이상적 길이 = 놀람 = log₂(1/p).']"
        explanation="log₂4 = 2비트입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="확률 1/2, 1/4, 1/8, 1/8 분포에 코드 길이 1, 2, 3, 3 비트를 주면 평균 코드 길이는? (소수로)"
        type="numeric"
        :answer="1.75"
        :tolerance="0.001"
        :hints="['(1/2)×1 + (1/4)×2 + (1/8)×3 + (1/8)×3.', '0.5 + 0.5 + 0.375 + 0.375.']"
        explanation="0.5+0.5+0.375+0.375 = 1.75비트. 이 분포에서는 각 길이가 놀람과 정확히 같아 바닥에 딱 붙은 최적 코드입니다."
      />
      <Quiz
        difficulty="hard"
        question="A=0, B=10, C=110, D=111 코드로 받은 비트열 「0110111」 을 해독하면?"
        :choices="['ACD', 'ABD', 'AAD', 'ADC']"
        :answer="0"
        :hints="['왼쪽부터 읽다가 아는 코드가 완성되면 끊으세요.', '0 | 110 | 111']"
        explanation="0 → A, 110 → C, 111 → D. 접두어 코드라 한 가지로만 읽힙니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch2')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 2 완료. 비트를 아끼는 법을 배웠습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 이 과정의 심장 — 압축의 한계이자 평균 놀람, <b>엔트로피</b>입니다.
      </p>
      <RouterLink
        to="/ch/ch3"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 엔트로피 →
      </RouterLink>
    </div>
  </article>
</template>
