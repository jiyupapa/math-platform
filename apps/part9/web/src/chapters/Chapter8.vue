<script setup lang="ts">
// ch8 — 눈금 갈아타기: 양자화 (핵심). 실수 자를 버리고 int8 정수 자 + 축척 스티커로 —
// 그리고 "왜 추론은 반올림을 버티나"(상쇄·argmax 둔감·종모양 분포).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import QuantizeLab from '@/components/QuantizeLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch8')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">8장 · 압축: 칸 줄이기 ① <span class="ml-1 rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">핵심</span></p>
    <h1 class="mb-4 text-3xl font-bold">눈금 갈아타기 — 양자화</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      반쪽 자(7장)로 13GB까지 왔습니다. 더 내려가려면 발상을 바꿔야 합니다. 부동소수점 자를 아예 버리고,
      2장에서 만든 <b>int8 정수 자(눈금 256개)</b>로 갈아타는 것. "실수 가중치를 어떻게 정수
      눈금에?"의 답이 <b>축척 스티커</b> 하나이고, 이 기술의 이름이 <b>양자화</b>로, 4GB 파일
      비밀의 첫 페이지입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      ① 실수 자 → 정수 자 + 축척(scale)의 원리(<b>q = round(w/s), 복원 = q×s</b>)를 기계로
      직접 돌려 보고, ② 눈금 256개(오차 한도 s/2)로도 <b>왜 추론이 멀쩡한지</b>, 곧 상쇄(4장 √n)·
      argmax 둔감·종모양 분포(3부 5장)를 박빙의 다음 토큰 대결로 확인합니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 아이디어: 지도의 축척</h2>
    <ReviewFlag id="ch8-s1" chapter="ch8" label="1. 아이디어: 지도의 축척" />
    <p class="leading-relaxed text-slate-700">
      지도는 대한민국을 A4 에 담습니다. 비결은 구석의 축척 표시("1cm = 10km") 하나죠.
      양자화도 똑같습니다. 가중치 한 묶음(행)의 최대 크기를 재서 <b>"정수 1칸 = 실수 s"</b> 라는
      스티커를 붙이면, 실수들이 −127~127 정수로 이사할 수 있어요:
    </p>
    <MathBlock expr="s = \frac{\max|w|}{127}, \qquad q = \mathrm{round}\!\left(\frac{w}{s}\right), \qquad \hat{w} = q \times s" />
    <p class="leading-relaxed text-slate-700">
      저장은 <b>1바이트짜리 q 들 + 묶음당 s 하나</b>. 4바이트가 1바이트가 됩니다(7B: 26GB → 6.6GB).
      대가는 늘 그것, 반올림: 오차는 눈금 절반(s/2)을 넘지 않아요. 기계를 직접 돌려 봅시다.
    </p>

    <QuantizeLab />

    <ConceptCard tone="tip" title="핵심 관찰: 왜 추론은 반올림을 버티나 (세 겹의 보험)">
      ① <b>오차가 원래 작다</b>: 눈금 절반(s/2) 이하, int8 이면 최대값의 0.4% 급.
      ② <b>내적에서 상쇄된다</b>: 수천 개 곱을 더할 때 ± 티끌이 4장의 랜덤워크처럼 서로
      지워져, 로짓 오차는 최악의 경우보다 √차원 배 작아요.
      ③ <b>결정은 순위(argmax)다</b>: 로짓이 조금 흔들려도 마진 안이면 다음 토큰은 그대로.
      실험 ②의 박빙 승부(마진 0.005!)조차 int8(오차 0.001)·int4(0.004)는 지켰고,
      int3(0.03)부터 뒤집혔죠. 실전 마진은 대부분 훨씬 큽니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="양자화가 파일을 줄이는 방식으로 정확한 것은?"
      :choices="['파라미터 개수는 그대로 두고, 숫자 하나의 칸을 정수 1바이트(+ 묶음당 축척 하나)로 줄인다', '중요하지 않은 파라미터를 삭제해 개수를 줄인다', 'zip 같은 무손실 압축을 적용한다', '모델의 층 수를 줄인다']"
      :answer="0"
      :hints="['1장의 몸무게 공식: 개수 × 칸 크기. 양자화가 바꾸는 건 어느 쪽?']"
      explanation="개수(70억)는 그대로, 칸이 4바이트 → 1바이트. 1장 공식 그대로입니다. 반올림 오차를 감수하는 손실 압축이라는 점이 zip(무손실)과의 차이예요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 용어 이름표, 그리고 분포의 축복</h2>
    <ReviewFlag id="ch8-s2" chapter="ch8" label="2. 용어 이름표, 그리고 분포의 축복" />
    <p class="leading-relaxed text-slate-700">
      축척이 작을수록 눈금이 촘촘하고 오차가 작습니다. 그런데 s = max|w|/127 이니
      <b>가중치의 최대 크기가 작아야</b> 유리하죠. 여기서 3부 5장의 지식이 축복이 됩니다:
      학습된 가중치는 대부분 <b>0 을 중심으로 한 종 모양 분포</b>라서 큰 값이 드물어 축척이
      작게 잡히고, 256개 눈금이 알짜 구간에 집중돼요. (이 축복이 깨지는 날이 있는데,
      그 범인인 <b>아웃라이어</b>는 다음 장의 주인공입니다.)
    </p>

    <ConceptCard tone="note" title="새 용어: 양자화 / 스케일 / 영점">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>양자화</b> (quantization). 읽는 법: 퀀타이제이션. 뜻: 연속(실수) 값을 유한한
          눈금(정수)으로 옮겨 담는 것. "눈금 갈아타기 + 축척 스티커". 개수 불변·칸 축소의
          <b>손실 압축</b>입니다.
        </li>
        <li>
          <b>스케일</b> (scale factor, s). 뜻: "정수 1칸 = 실수 s" 축척.
          보통 행·묶음 단위로 하나씩 두고, 대칭 양자화에선 s = max|w|/127.
        </li>
        <li>
          <b>영점</b> (zero-point, z). 읽는 법: 제로 포인트. 뜻: 분포가 0 중심이 아닐 때
          자를 옆으로 미는 값. 복원이 (q − z)×s 가 됩니다. 가중치(0 중심)는 보통 생략,
          한쪽으로 쏠린 활성값에서 등장(아래 더 깊이).
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="int8 대칭 양자화에서 복원값의 오차가 절대 넘지 않는 한계는?"
      :choices="['축척의 절반 (s/2): 가장 가까운 눈금으로 반올림하므로', '축척의 127배', '한계가 없다. 운에 달렸다', '정확히 0 (무손실이므로)']"
      :answer="0"
      :hints="['워밍업부터 반복된 그 법칙. 눈금 사이의 수는 어디로 가나요?']"
      explanation="반올림의 보장입니다. 눈금 간격 s 의 절반이 최악의 경우예요. 그래서 s 를 작게(= 분포의 최대값이 작게) 만드는 것이 양자화 품질의 핵심이 됩니다."
    />

    <DetailsCard title="➕ 더 깊이: 비대칭 양자화와 zero-point, 그리고 W8A16 읽는 법">
      ReLU 를 지난 활성값처럼 <b>0 이상으로만 쏠린 분포</b>에 대칭 자(−127~127)를 쓰면 절반의
      눈금이 낭비됩니다. 그래서 자를 옆으로 밀어 분포에 딱 맞추는 <b>비대칭 양자화</b>를 쓰고,
      "실수 0 이 정수 어디에 앉는지"를 기록한 것이 zero-point예요. 2장에서 본 int8 의 비대칭
      (−128 이 하나 더)도 여기서 요긴하죠. 참고로 스펙 표기 <b>W8A16</b> 은 "가중치(W)는
      8비트, 활성값(A)은 16비트"라는 뜻이에요. 저장 몸무게는 가중치가 지배하니 가중치만 줄이는
      구성이 흔합니다. 훈련까지 눈금을 의식하며 하는 <b>QAT</b>(quantization-aware training)도
      있지만, 오늘 한 것처럼 다 배운 모델을 나중에 옮기는 <b>PTQ</b>(post-training)가 기본값이에요.
    </DetailsCard>

    <ReviewFlag id="ch8-ai" chapter="ch8" label="🤖 AI 연결 · 다시 쓰는 수학: 1부 2장 · 3부 5장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 · 다시 쓰는 수학: 1부 2장 · 3부 5장">
      상쇄의 무대는 <b><PartLink :part="1" ch="ch2">1부 2장</PartLink></b>의 내적입니다.
      추론의 몸통이 "곱해서 더하기"라서, 반올림 티끌이 4장의 √n 통계로 서로 지워지는 거예요.
      축척을 작게 잡아 주는 종 모양 가중치 분포는 <b><PartLink :part="3" ch="ch5">3부
      5장</PartLink></b>의 그 분포이고요. 그리고 Ollama 태그가 하나 읽히게 됐습니다.
      <b>q8_0</b> = 오늘의 int8 양자화(7B ≈ 6.6GB). 4GB 의 주인공 q4 는 눈금이 15개뿐이라
      한 겹의 보험이 더 필요한데, 블록과 아웃라이어의 이야기는 다음 장입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="양자화: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="int8 양자화에서 실제로 저장되는 것은?"
        :choices="['1바이트 정수 q 들 + 묶음(행)마다 축척 s 하나', '실수 가중치 전부와 정수 사본', '축척 s 만', '가중치의 평균값 하나']"
        :answer="0"
        explanation="가중치 본체는 정수로, 실수 정보는 축척 스티커에 압축. 지도(정수)와 축척 표시(s)의 관계입니다."
      />
      <Quiz
        difficulty="easy"
        question="양자화는 반올림 오차를 감수하는 손실 압축이다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. zip(무손실)과 달리 복원값이 원본과 미세하게 달라요. 그 대가로 4분의 1(int8)~8분의 1(int4) 몸무게를 얻습니다."
      />
      <Quiz
        difficulty="easy"
        question="대칭 int8 양자화의 축척 공식은?"
        :choices="['s = max|w| ÷ 127', 's = 평균(w) ÷ 256', 's = 127 ÷ max|w|', 's = min|w| × 127']"
        :answer="0"
        explanation="가장 큰 가중치가 정수 자의 끝(±127)에 닿도록 축척을 맞추는 것이에요. 그래서 최대값이 작은 분포일수록 눈금이 촘촘해집니다."
      />
      <Quiz
        difficulty="easy"
        question="70억 파라미터를 int8(1바이트)로 담으면 가중치 메모리는 약 몇 GB? (십진, 정수로)"
        type="numeric"
        :answer="7"
        explanation="70억 × 1바이트 = 7GB(축척들은 티끌). fp32 의 4분의 1, fp16 의 절반입니다. Ollama 의 q8_0 이 이 급이에요."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="실험 ②에서 마진 0.005 의 박빙 승부를 int8 이 지킨 이유는?"
        :choices="['int8 의 로짓 오차(≈0.001)가 마진보다 작았기 때문', 'int8 은 오차가 정확히 0이기 때문', '고양이가 항상 이기도록 프로그램돼 있기 때문', '우연이며 다시 하면 결과가 다르다']"
        :answer="0"
        :hints="['순위가 바뀌려면 오차가 무엇보다 커야 하나요?']"
        explanation="argmax 는 로짓 오차 < 마진인 한 흔들리지 않습니다. int3 부터 뒤집힌 것도 오차(0.03)가 마진(0.005)을 넘었기 때문이에요. 전부 결정적 계산이라 다시 해도 똑같아요."
      />
      <Quiz
        difficulty="medium"
        question="가중치 분포가 0 중심 종 모양(3부 5장)인 것이 양자화에 유리한 이유는?"
        :choices="['최대값이 작아 축척 s 가 작게 잡히고, 눈금이 값들이 몰린 구간에 촘촘해지므로', '종 모양이면 반올림이 일어나지 않으므로', '0 이 많으면 저장을 생략할 수 있으므로', '유리하지 않다. 분포는 무관하다']"
        :answer="0"
        explanation="s = max|w|/127이고, 분모는 고정이니 분자(최대값)가 작을수록 촘촘한 자입니다. 이 축복을 깨는 게 다음 장의 아웃라이어예요."
      />
      <Quiz
        difficulty="medium"
        question="내적(1부 2장)이 양자화 티끌에 강한 이유는?"
        :choices="['수천 개 곱의 합에서 ± 오차가 랜덤워크처럼 상쇄돼, 최악의 경우보다 √차원 배 작아지므로 (4장)', '내적은 곱셈을 쓰지 않으므로', '내적 결과는 항상 정수이므로', '내적 전에 오차가 자동 제거되므로']"
        :answer="0"
        explanation="4장의 √n 이 세 번째로 일하는 순간입니다. 차원 4,096 이면 상쇄 이득이 64배 급. 개별 가중치보다 로짓이 훨씬 정확한 이유예요."
      />
      <Quiz
        difficulty="medium"
        question="zero-point(영점)가 필요해지는 대표 상황은?"
        :choices="['ReLU 출력처럼 0 이상으로 쏠린 활성값: 대칭 자로는 음수 쪽 눈금 절반이 낭비되므로', '가중치가 정확히 0 중심 대칭일 때', '모델이 너무 클 때', '축척 s 를 계산할 수 없을 때']"
        :answer="0"
        explanation="분포에 자를 맞추는 이사 비용입니다. 복원식이 (q − z)×s 로 바뀌죠. 0 중심인 가중치는 보통 대칭(z 생략)으로 충분합니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="양자화 모델이 원본과 답이 가끔 다른 현상의 올바른 해석은?"
        :choices="['로짓 티끌이 박빙(마진 < 오차)인 토큰의 순위만 뒤집는다. 마진이 큰 대부분의 결정은 동일하다', '양자화 모델은 무작위로 답한다', '전체 답변이 항상 완전히 달라진다', '다른 현상은 불가능하다. 항상 동일하다']"
        :answer="0"
        :hints="['4장의 GPU 재현성 이야기와 같은 무늬예요. 어떤 결정이 흔들렸었죠?']"
        explanation="실험 ②의 구도 그대로입니다. 확신에 찬(마진 큰) 예측은 int4 에도 끄떡없고, 박빙 지점만 갈립니다. '얼마나 잃었나'를 숫자로 재는 법이 10장의 퍼플렉시티예요."
      />
      <Quiz
        difficulty="hard"
        question="같은 int8 인데 축척을 '층 전체에 하나' 대신 '행마다 하나'로 두는 이유는?"
        :choices="['행마다 최대값이 달라서, 각자 자기 분포에 맞는 촘촘한 축척을 가지면 오차가 줄어든다 (눈금 낭비 방지)', '축척이 많을수록 파일이 커져서 좋기 때문', '행마다 두면 계산이 불가능해지기 때문', '이유 없다. 관례일 뿐이다']"
        :answer="0"
        :hints="['축척은 그 묶음의 max|w| 로 정해집니다. 큰 행과 작은 행이 축척을 공유하면?']"
        explanation="작은 행이 큰 행의 축척을 억지로 쓰면 눈금 대부분이 빈 공간에 낭비됩니다. 이 아이디어를 극단까지 밀어 '몇십 개 값마다 축척 하나'로 만든 것이 다음 장의 블록 양자화이고, q4_K_M 의 핵심이에요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch8')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">8장 완료! 압축의 문이 열렸다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        int8 로 6.6GB까지 왔습니다. 그런데 Ollama 국민 태그는 q4(3.3GB)죠. 눈금 15개로 버티는 비결,
        블록 양자화와 아웃라이어의 전쟁으로 갑니다.
      </p>
      <RouterLink
        to="/ch/ch9"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        9장: 4비트까지: 블록 양자화와 GGUF →
      </RouterLink>
    </div>
  </article>
</template>
