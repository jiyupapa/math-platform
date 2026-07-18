<script setup lang="ts">
// ch2 — 컴퓨터의 손가락: 비트와 이진법. 칸의 재료(비트)로 수를 세는 법과
// 음수 표현(2의 보수, int8 −128~127)까지 — 8장 양자화 zero-point 의 직접 선수.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import BitPlaygroundLab from '@/components/BitPlaygroundLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch2')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">2장 · 저장 — 칸의 해부 ①</p>
    <h1 class="mb-4 text-3xl font-bold">컴퓨터의 손가락 — 비트와 이진법</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1장에서 "칸 크기 × 개수 = 파일 크기"를 손에 넣었죠. 이제 그 <b>칸의 재료</b>를 볼
      차례입니다. 컴퓨터의 손에는 손가락이 없어요 — 있는 건 켜짐/꺼짐 <b>스위치</b>뿐.
      스위치 몇 개로 어떻게 42를, 그리고 −1을 세는지 직접 만들어 봅니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      ① 스위치(비트) n개로 <b>2ⁿ 가지</b>를 세는 감각, ② 자리값(1, 2, 4, 8, …)으로 수를
      조립하는 법, ③ 그리고 <b>음수를 담는 약속(2의 보수)</b> — int8 의 범위가 왜 하필
      <b>−128~127</b>인지까지. 이 세 개가 3장(부동소수점)과 8장(양자화)의 주춧돌입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 손가락 10개 vs 스위치 2개</h2>
    <ReviewFlag id="ch2-s1" chapter="ch2" label="1. 손가락 10개 vs 스위치 2개" />
    <p class="leading-relaxed text-slate-700">
      우리가 십진법을 쓰는 건 손가락이 10개라서예요 — 한 자리에 0~9, 열이 차면 윗자리로.
      컴퓨터의 "손가락"은 전기가 흐른다/안 흐른다 <b>두 가지뿐</b>이라, 한 자리에 0과 1만
      쓰는 <b>이진법</b>으로 셉니다. 원리는 십진법과 똑같아요 — 자리가 하나 올라갈 때마다
      값이 10배 대신 <b>2배</b>가 될 뿐. 그래서 자리값이 1, 2, 4, 8, 16, 32, 64, 128… 로
      자랍니다. <b>5부 1장</b>의 스무고개를 기억하세요?
      예/아니오 질문 하나가 1비트 — 질문 n개로 2ⁿ 가지를 구분했죠. 그 비트가 오늘은
      <b>정보의 단위에서 저장의 단위</b>가 됩니다.
    </p>

    <BitPlaygroundLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 두 배의 사다리, 그리고 천장">
      42 = 32 + 8 + 2 — 어떤 수든 <b>자리값(2의 거듭제곱) 몇 개의 합</b>으로 조립됩니다
      (십진법에서 425 = 400 + 20 + 5 인 것과 같은 원리). 그리고 스위치 8개를 모두 켜면
      255 = 2⁸ − 1 — 더 세고 싶으면 스위치를 늘리는 수밖에 없어요. <b>n비트 칸에는 2ⁿ 가지
      천장이 있다</b>, 이 한 줄이 9부 전체를 관통합니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="스위치(비트) 3개로 구분할 수 있는 가짓수는?"
      :choices="['8가지 (2×2×2)', '3가지', '6가지 (2×3)', '9가지 (3×3)']"
      :answer="0"
      :hints="['스위치 하나가 2가지 — 하나 늘 때마다 몇 배가 되나요?']"
      explanation="000, 001, 010, 011, 100, 101, 110, 111 — 2³ = 8가지입니다. 스무고개 질문 3개로 8가지를 구분하는 것과 같은 계산이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 음수는 어떻게 담을까 — 시계 산수의 재주</h2>
    <ReviewFlag id="ch2-s2" chapter="ch2" label="2. 음수는 어떻게 담을까 — 시계 산수의 재주" />
    <p class="leading-relaxed text-slate-700">
      스위치엔 마이너스가 없습니다. 그럼 −1은? 힌트는 <b>시계</b>에 있어요 — 12시간 시계에서
      "3시간 <b>뒤로</b>"와 "9시간 <b>앞으로</b>"는 같은 곳에 도착하죠. 256칸짜리 시계(8비트)에서도
      마찬가지입니다: "1 빼기"와 "255 더하기"가 같은 결과예요. 그래서 컴퓨터는 뒷쪽 절반
      (128~255)을 <b>음수 자리(−128~−1)로 읽기로 약속</b>합니다 — 이 약속의 이름이
      <b>2의 보수</b>이고, 읽는 법은 딱 하나만 바꾸면 됩니다: <b>맨 앞 스위치의 자리값을
      +128 대신 −128 로</b>. 위 실험 ①에서 int8 모드를 켜고 −1 만들기에 도전해 보세요 —
      모두 켜면 −128 + 64 + … + 1 = −1 이 됩니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 이진법 / 바이트 / 2의 보수">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>이진법</b> (binary) — 읽는 법: 바이너리. 뜻: 0과 1 두 글자만으로 수를 적는 법 —
          자리가 오를 때마다 값이 2배(자리값 1, 2, 4, 8, …). 컴퓨터의 모든 칸이 이 방식.
        </li>
        <li>
          <b>바이트</b> (byte) — 읽는 법: 바이트. 뜻: <b>비트 8개 묶음</b> — 저장 용량의 기본
          단위. 1장의 "fp16 = 2바이트"는 스위치 16개짜리 칸이라는 뜻이었어요. 2⁸ = 256가지.
        </li>
        <li>
          <b>2의 보수</b> (two's complement) — 읽는 법: 이의 보수. 뜻: 음수를 담는 표준 약속 —
          맨 앞 비트의 자리값만 음수(−2ⁿ⁻¹)로 읽는다. 8비트면 <b>int8, 범위 −128~127</b>.
          같은 비트라도 "부호 없음"으로 읽으면 0~255 — <b>비트는 그대로, 약속만 다르다.</b>
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="8비트가 전부 켜진 11111111 을 int8(2의 보수)로 읽으면?"
      :choices="['−1 (= −128 + 127)', '255', '−255', '0']"
      :answer="0"
      :hints="['맨 앞 자리값만 −128 — 나머지 일곱 자리(64+32+16+8+4+2+1)는 그대로 더합니다.']"
      explanation="−128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = −1. 같은 비트를 부호 없음으로 읽으면 255 — 시계에서 '1 뒤로'와 '255 앞으로'가 같은 자리인 것과 같은 이치예요."
    />

    <DetailsCard title="➕ 더 깊이: 16진수 — 비트 4개를 한 글자로">
      비트를 길게 쓰면 읽기 힘들어서(11111111…), 개발 현장에서는 <b>비트 4개를 한 글자</b>로
      묶어 적는 16진수를 씁니다 — 0~9 다음에 A~F 를 써서 한 글자가 16가지(= 2⁴).
      웹 색상 <code>#FF0000</code> 이 바로 그것: FF = 11111111 = 255, 즉 "빨강 채널 최대".
      모델 파일을 열어 보면(9장) 이런 16진수 덩어리가 끝없이 이어지는데, 이제 그 정체가
      "비트 4개씩 끊어 읽은 숫자들"임을 아는 거죠.
    </DetailsCard>

    <ReviewFlag id="ch2-ai" chapter="ch2" label="🤖 AI 연결 — 회수하는 수학: 5부 1~2장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 5부 1~2장">
      <b><PartLink :part="5" ch="ch1">5부 1장</PartLink></b>에서 비트는 <b>정보의 단위</b>였고
      (놀람의 크기, 스무고개), <b><PartLink :part="5" ch="ch2">5부 2장</PartLink></b>에서는
      "자주 나오면 짧게"의 압축 화폐였죠 — 오늘 그 비트가 <b>저장의 단위</b>로 재등장했습니다.
      LLM 속 살림도 온통 이 칸들이에요: 어휘 32,000개의 <b>토큰 번호</b>는 15비트면 담기는
      정수고(2¹⁵ = 32,768), 8장의 int8 양자화는 가중치 70억 개를 <b>256눈금짜리 칸</b>에
      옮겨 담는 기술입니다 — 그 준비 운동이 오늘의 −128~127이었어요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="비트와 이진법 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="비트(bit) 하나에 담을 수 있는 것은?"
        :choices="['0 또는 1, 두 가지 중 하나', '0~9 중 하나', '글자 한 개', '소수 한 개']"
        :answer="0"
        explanation="켜짐/꺼짐 스위치 하나 — 그래서 비트가 늘 때마다 가짓수가 2배씩 자랍니다."
      />
      <Quiz
        difficulty="easy"
        question="8비트(1바이트)로는 256가지를 구분할 수 있다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 2⁸ = 256 — 부호 없는 정수라면 0~255, int8 약속이라면 −128~127로 읽는 같은 256가지예요."
      />
      <Quiz
        difficulty="easy"
        question="1바이트는 몇 비트인가? (숫자로)"
        type="numeric"
        :answer="8"
        explanation="비트 8개 묶음이 1바이트 — 1장의 'fp32 = 4바이트'는 스위치 32개짜리 칸이라는 뜻이었습니다."
      />
      <Quiz
        difficulty="easy"
        question="이진수 101 을 십진수로 읽으면? (숫자로)"
        type="numeric"
        :answer="5"
        explanation="자리값 4·2·1 중 켜진 곳은 4와 1 — 4 + 1 = 5입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="42를 8비트 이진수로 조립하면?"
        :choices="['00101010 (= 32 + 8 + 2)', '01000010 (= 64 + 2)', '00101011 (= 32 + 8 + 2 + 1)', '10101010 (= 128 + 32 + 8 + 2)']"
        :answer="0"
        :hints="['42보다 크지 않은 가장 큰 자리값(32)부터 채워 보세요 — 42 = 32 + 10 = 32 + 8 + 2.']"
        explanation="32 + 8 + 2 = 42 — 자리값 32, 8, 2 자리의 스위치만 켜면 00101010입니다. 실험 ①의 도전 과제 그대로죠."
      />
      <Quiz
        difficulty="medium"
        question="n비트 칸에 담을 수 있는 부호 없는 정수의 최대값은?"
        :choices="['2ⁿ − 1 (모든 스위치를 켠 값)', '2ⁿ', 'n²', '2 × n']"
        :answer="0"
        explanation="가짓수는 2ⁿ 인데 0부터 세기 시작하니 최대값은 2ⁿ − 1 — 8비트면 255, 16비트면 65,535입니다."
      />
      <Quiz
        difficulty="medium"
        question="int8(2의 보수)의 표현 범위는?"
        :choices="['−128 ~ 127', '0 ~ 255', '−127 ~ 128', '−256 ~ 255']"
        :answer="0"
        :hints="['맨 앞 자리값이 −128 — 맨 앞만 켜면 최소, 맨 앞만 끄면 최대.']"
        explanation="맨 앞만 켠 10000000 = −128(최소), 맨 앞만 끈 01111111 = 127(최대). 음수 쪽이 하나 더 많은 비대칭 — 8장 양자화에서 다시 만납니다."
      />
      <Quiz
        difficulty="medium"
        question="같은 비트 11111111 이 '부호 없음'으로는 255, int8 로는 −1 로 읽히는 것에 대한 옳은 해석은?"
        :choices="['저장된 비트는 같고, 읽는 약속(해석)만 다르다', '저장할 때 비트 자체가 바뀐다', '컴퓨터가 문맥을 보고 추측한다', '둘 중 하나는 버그다']"
        :answer="0"
        explanation="칸에는 스위치 상태만 있을 뿐, 부호는 약속입니다 — 그래서 같은 파일도 어떤 약속(자료형)으로 읽느냐가 중요해요. 3장의 fp32 도 결국 '32개 스위치를 읽는 또 다른 약속'입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="어휘 32,000개의 토큰 번호(0~31,999)를 정수 칸 하나에 담으려면 최소 몇 비트가 필요한가?"
        :choices="['15비트 (2¹⁵ = 32,768 ≥ 32,000)', '8비트 (2⁸ = 256)', '32,000비트', '10비트 (2¹⁰ = 1,024)']"
        :answer="0"
        :hints="['2를 몇 번 곱해야 32,000을 넘는지 — 실험 ②의 슬라이더로 찾아보세요.']"
        explanation="2¹⁴ = 16,384로는 모자라고 2¹⁵ = 32,768이면 충분 — 15비트입니다. LLM 입력의 첫 관문(토큰 번호)부터가 오늘 배운 정수 칸이에요."
      />
      <Quiz
        difficulty="hard"
        question="시계 비유로 2의 보수가 하는 일을 가장 정확히 말한 것은?"
        :choices="['256칸 시계에서 &quot;1 빼기&quot;를 &quot;255 더하기&quot;로 처리할 수 있어, 뺄셈 회로 없이 덧셈 회로 하나로 음수까지 계산한다', '음수를 저장할 때마다 시계를 거꾸로 돌리는 특수 장치를 쓴다', '음수는 계산할 수 없으니 항상 양수로 바꿔 근사한다', '시계와는 무관하게 음수 전용 비트를 하나 더 추가한다']"
        :answer="0"
        :hints="['12시간 시계에서 3시간 뒤로 = 9시간 앞으로 — 같은 도착지였죠.']"
        explanation="뒤로 감기를 앞으로 감기로 바꾸는 재주 덕에 덧셈 회로 하나로 덧셈·뺄셈이 다 됩니다 — 뒷쪽 절반(128~255)을 −128~−1로 읽는 약속이 그래서 표준이 됐어요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch2')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">2장 완료!</p>
      <p class="mt-1 text-sm text-emerald-700">
        정수는 이제 담을 수 있습니다 — 그런데 0.1은? 아주 큰 수와 아주 작은 수를
        한 칸에? 다음 장에서 드디어 고무줄 자(부동소수점)를 해부합니다.
      </p>
      <RouterLink
        to="/ch/ch3"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        3장 — 고무줄 자: 부동소수점 →
      </RouterLink>
    </div>
  </article>
</template>
