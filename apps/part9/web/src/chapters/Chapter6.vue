<script setup lang="ts">
// ch6 — 안전한 확률 계산: log-sum-exp. 5장의 두 사고(exp 폭발·확률 언더플로)가
// LLM 의 심장(softmax·확률 연쇄)에서 일어나는 것을 막는 업계 표준 구급법.
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import SafeSoftmaxLab from '@/components/SafeSoftmaxLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch6')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">6장 · 계산 — 사고 없이 쓰기 ①</p>
    <h1 class="mb-4 text-3xl font-bold">안전한 확률 계산 — log-sum-exp</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      5장의 두 사고 — exp 폭발(x ≈ 89)과 확률 언더플로 — 는 하필 LLM 이 매 토큰마다 도는
      회로, <b>softmax 와 확률 연쇄</b>에서 일어납니다. 오늘은 업계가 수십 년 쓰고 있는
      구급법 두 가지를 배웁니다 — <b>max 빼기</b>와 <b>log 확률로 일하기</b>.
      트릭이 아니라, 답을 한 자리도 안 바꾸는 <b>공짜 안전장치</b>라는 게 백미예요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      ① <b><PartLink :part="4" ch="ch9">4부 9장</PartLink></b>의 softmax 를 그대로 계산하면
      왜 터지는지, ② 답을 바꾸지 않고 살리는 <b>max 빼기</b>(이동 불변성)의 원리,
      ③ 그리고 확률의 곱을 log 의 합으로 바꾸는 <b>log-sum-exp</b> — LLM 이 훈련·평가 내내
      확률이 아닌 <b>log 확률</b>로 일하는 이유를 손에 넣습니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 환자 — softmax, LLM 의 심장</h2>
    <p class="leading-relaxed text-slate-700">
      4부 9장에서 배운 출력층의 공식 — 로짓(점수) z 를 확률로 바꾸는 softmax 입니다:
    </p>
    <MathBlock expr="\mathrm{softmax}(z)_i = \frac{e^{z_i}}{\sum_j e^{z_j}}" />
    <p class="leading-relaxed text-slate-700">
      분자·분모의 <b>exp 가 5장의 폭발 시계</b>를 그대로 답니다 — 로짓이 89를 넘으면 fp32 에서
      inf, inf/inf 는 NaN(변이), 그리고 전염. 훈련이 조금만 불안해도 로짓은 그 크기에
      닿습니다. 응급실로 가 봅시다.
    </p>

    <SafeSoftmaxLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 이동 불변성: softmax 는 차이만 본다">
      실험 ①에서 x 를 어디로 옮겨도 확률이 같았죠. 이유는 한 줄 계산입니다 —
      로짓 전체에서 상수 c 를 빼면 <b>exp(z−c) = exp(z)·e⁻ᶜ</b>, 분자와 분모에 같은 e⁻ᶜ 가
      곱해져 <b>약분으로 사라집니다.</b> 그래서 c = max(z) 로 잡으면: 답은 그대로인데
      가장 큰 로짓이 0 이 되어 <b>모든 exp 가 1 이하</b> — 폭발이 원천 봉쇄돼요.
      근사가 아니라 항등식이라는 것, 그게 이 장치의 품격입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="max 빼기가 softmax 의 답(확률)을 바꾸지 않는 이유는?"
      :choices="['exp(z−c) = exp(z)·e⁻ᶜ 라서 분자·분모의 e⁻ᶜ 가 약분되기 때문 (이동 불변성)', '빼는 값이 아주 작아서 무시할 수 있기 때문', '컴퓨터가 자동으로 보정해 주기 때문', '사실 답이 조금 바뀌지만 허용 오차 안이기 때문']"
      :answer="0"
      :hints="['지수 법칙(2부 7장): e^(a−b) = e^a ÷ e^b — 분모에도 같은 일이 일어나면?']"
      explanation="근사가 아니라 항등식입니다 — 실험 ①에서 x = 10 이든 120 이든 확률이 정확히 같았던 이유. 답을 바꾸지 않으면서 계산 경로만 안전한 쪽으로 바꾸는 거예요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. log 세계로 이사 — log-sum-exp</h2>
    <p class="leading-relaxed text-slate-700">
      실험 ②의 교훈 — 확률은 곱할수록 언더플로를 향해 갑니다. 해법은 5부에서부터 쓰던 그것,
      <b>log 세계로 이사</b>: 곱은 합이 되고(log(ab) = log a + log b), 10⁻⁶⁰⁰ 같은 극소
      확률도 log 로는 −600 이라는 평범한 수가 되죠. 이때 softmax 의 분모를 log 세계에서
      부르는 이름이 <b>log-sum-exp</b> 이고, 안정판은 max 빼기와 한 몸입니다:
    </p>
    <MathBlock expr="\mathrm{LSE}(z) = \log \sum_j e^{z_j} = m + \log \sum_j e^{z_j - m} \quad (m = \max_j z_j)" />
    <p class="leading-relaxed text-slate-700">
      그리고 log 확률은 <b>log softmax(z)ᵢ = zᵢ − LSE(z)</b> — 뺄셈 한 번이면 확률을
      거치지 않고 <b>log 세계 안에서 직행</b>합니다.
    </p>

    <ConceptCard tone="note" title="새 용어: max 빼기 / log-sum-exp / log 확률">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>max 빼기</b> (max trick) — 읽는 법: 맥스 트릭. 뜻: exp 앞에서 로짓 전체에서
          최대값을 빼는 안정화 — 이동 불변성 덕에 답 불변, 최대 로짓이 0 이라 폭발 불가.
        </li>
        <li>
          <b>log-sum-exp</b> (LSE) — 읽는 법: 로그섬엑스프. 뜻: log Σ exp(zⱼ) — softmax 분모의
          log. 안정판 m + log Σ exp(z−m) 로 구현하며, 수치 라이브러리의 단골 함수
          (<code>logsumexp</code>)입니다.
        </li>
        <li>
          <b>log 확률</b> (log-probability) — 읽는 법: 로그 프로버빌리티. 뜻: 확률 대신 그
          log 를 갖고 다니는 것 — 곱셈이 덧셈이 되고 언더플로가 사라집니다. 훈련 loss(−log p,
          <b><PartLink :part="5" ch="ch4">5부 4장</PartLink></b>)가 애초에 이 세계의 값.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="확률 300개(각 0.01)의 곱을 안전하게 계산하는 방법은?"
      :choices="['log(0.01) 을 300번 더한다 — log 확률 −600 (밑 10 기준)으로 표현', 'fp32 로 그대로 300번 곱한다', '100개씩 나눠 곱한 뒤 세 결과를 곱한다', '확률을 전부 반올림해 0.1 로 만들어 곱한다']"
      :answer="0"
      :hints="['실험 ②의 log 파 — 곱이 무엇으로 바뀌었죠?']"
      explanation="곱하기파는 10⁻⁶⁰⁰ 근처에서 한참 전에 언더플로(fp32 하한 10⁻⁴⁵)로 전사합니다. 나눠 곱해도 중간 결과가 죽는 건 마찬가지 — log 세계에서는 −600 이 그냥 평범한 수예요."
    />

    <DetailsCard title="➕ 더 깊이: log(softmax(z)) 를 그대로 찍으면 안 되는 이유">
      "확률을 만들고 나서 log 를 씌우면 되지 않나?" — 함정이 있습니다. 로짓 차이가 크면
      작은 쪽 softmax 확률이 <b>언더플로로 0</b> 이 되고, log(0) = <b>−inf</b> — 5장의 사고가
      한 다리 건너 재발해요. 그래서 실전 구현은 확률을 거치지 않고 <b>log softmax = z − LSE(z)</b>
      로 직행합니다(z = −200 이어도 답은 그냥 −200 근처의 유한한 수). PyTorch 의
      <code>cross_entropy</code> 가 내부에서 <code>log_softmax</code> 를 먼저 하는 이유,
      훈련 코드에 "확률" 변수가 거의 안 보이고 <b>로짓과 log 확률만 흐르는</b> 이유가
      전부 이것입니다.
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 4부 9장 · 5부 4장">
      <b><PartLink :part="4" ch="ch9">4부 9장</PartLink></b>의 softmax 공식은 이론편이었고,
      오늘 본 max 빼기 + z − LSE 가 그 공식의 <b>실전 구현체</b>입니다 — GPT 가 매 토큰
      확률을 계산할 때마다 도는 코드예요. 그리고 <b><PartLink :part="5" ch="ch4">5부
      4장</PartLink></b>의 크로스 엔트로피(−log p), 5부 7장의 퍼플렉시티, 6부 3장의 −log₂ q
      채점판 — 전부 <b>처음부터 log 확률 세계의 값</b>이었죠. 훈련 로그의 loss 숫자는
      "모델이 정답에 준 log 확률의 평균 × (−1)" — 여러분은 이미 오래전부터 log 세계의
      주민이었던 겁니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="log-sum-exp — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="softmax 를 순진하게(exp 그대로) 계산할 때 로짓 89 이상에서 벌어지는 일은?"
        :choices="['exp 가 inf 로 폭발하고 inf/inf = NaN 으로 붕괴한다', '확률이 정확히 1이 된다', '계산이 조금 느려질 뿐 결과는 정상이다', '자동으로 fp64 로 전환된다']"
        :answer="0"
        explanation="5장의 폭발 시계(fp32 exp 한계 x ≈ 88.7) + NaN 변이가 그대로 재현됩니다 — 실험 ①의 💀."
      />
      <Quiz
        difficulty="easy"
        question="로짓 전체에서 max 를 빼면 softmax 확률이 미세하게 달라진다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 이동 불변성(분자·분모 약분)으로 답은 정확히 같아요 — 근사가 아니라 항등식입니다."
      />
      <Quiz
        difficulty="easy"
        question="LLM 이 확률 대신 log 확률로 일하는 가장 큰 이유는?"
        :choices="['작은 확률들의 곱이 언더플로로 0 이 되기 때문 — log 세계에선 곱이 합이 된다', 'log 가 더 멋있어 보여서', '확률은 저작권 문제가 있어서', 'log 확률이 항상 양수라 다루기 쉬워서']"
        :answer="0"
        explanation="실험 ②에서 p = 0.1 은 46토큰 만에 전사했죠. log 확률은 음수라는 점(마지막 선택지 함정)도 기억 — 확률 ≤ 1 이니 log ≤ 0 입니다."
      />
      <Quiz
        difficulty="easy"
        question="max 빼기 후 가장 큰 로짓의 값은? (숫자로)"
        type="numeric"
        :answer="0"
        explanation="자기 자신을 뺐으니 0 — 그래서 모든 exp 가 1 이하가 되어 폭발이 원천 봉쇄됩니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="안정판 log-sum-exp 공식은?"
        :choices="['m + log Σ exp(zⱼ − m), m = max(z)', 'log Σ zⱼ', 'max(z) × log Σ exp(zⱼ)', 'Σ log exp(zⱼ) − m']"
        :answer="0"
        :hints="['max 를 밖으로 꺼내 두고, 안에서는 max 를 뺀 안전한 exp 만 남깁니다.']"
        explanation="exp 안은 전부 0 이하라 폭발 불가, 꺼내 둔 m 이 크기를 보존합니다 — max 빼기와 LSE 는 한 몸이에요."
      />
      <Quiz
        difficulty="medium"
        question="log 세계에서 확률의 곱 p₁ × p₂ × p₃ 은 무엇이 되나?"
        :choices="['log p₁ + log p₂ + log p₃ (합)', 'log p₁ × log p₂ × log p₃ (곱)', '(log p₁)³', 'log(p₁ + p₂ + p₃)']"
        :answer="0"
        explanation="2부 7장의 log 법칙 — 곱을 합으로. 문장 확률(토큰 확률의 연쇄 곱)이 log 확률의 합이 되는 이유입니다."
      />
      <Quiz
        difficulty="medium"
        question="확률을 먼저 만들고 log 를 씌우는 log(softmax(z)) 가 위험한 이유는?"
        :choices="['로짓 차이가 크면 작은 쪽 확률이 언더플로로 0 → log(0) = −inf 가 튀어나온다', 'log 함수가 fp32 에 구현돼 있지 않아서', 'softmax 를 두 번 계산하게 돼 느려서', '위험하지 않다 — 완전히 같은 방법이다']"
        :answer="0"
        :hints="['z = [0, −200] 이면 작은 쪽 softmax 확률은 얼마쯤? 그 log 는?']"
        explanation="그래서 실전은 확률을 거치지 않고 log softmax = z − LSE(z) 로 직행합니다 — z = −200 이어도 답은 유한한 −200 근처예요."
      />
      <Quiz
        difficulty="medium"
        question="훈련 로그에 찍히는 loss(크로스 엔트로피) 값의 정체는?"
        :choices="['모델이 정답 토큰에 준 log 확률의 평균에 −1 을 곱한 것', '모델이 틀린 토큰의 개수', '확률 그 자체의 평균', 'GPU 온도의 함수']"
        :answer="0"
        explanation="5부 4장의 −log p 채점이 배치 평균으로 찍히는 것 — loss 2.3 은 평균적으로 정답에 e^−2.3 ≈ 10% 확률을 줬다는 뜻입니다. 훈련 내내 log 세계인 거죠."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="max 빼기 후에도 남는 (무해한) 수치 현상은?"
        :choices="['차이가 아주 큰 로짓의 exp(z−m) 이 언더플로로 0 이 되지만, 그 확률은 실제로도 0 에 가까워 합계·답에 영향이 없다', '최대 로짓의 exp 가 여전히 폭발할 수 있다', '분모가 0 이 되어 나눗셈이 불가능해진다', '남는 현상은 전혀 없다 — 수학적으로 완벽하다']"
        :answer="0"
        :hints="['z − m = −5000 이면 exp 는? 그 토큰의 확률은 원래 얼마쯤이어야 했을까요?']"
        explanation="exp(−5000)은 언더플로로 0 이지만 참값도 10⁻²¹⁷² 급 — 0 으로 담는 게 오히려 정확합니다. 분모는 최대 로짓의 exp(0) = 1 이 버텨 줘서 0 이 될 수 없어요(세 번째 선택지 함정)."
      />
      <Quiz
        difficulty="hard"
        question="동료가 '문장 A 의 확률이 0 으로 나왔으니 모델이 A 를 불가능하다고 본다'고 합니다. 오늘 기준의 정확한 답은?"
        :choices="['fp 칸의 언더플로일 가능성부터 의심 — log 확률로 다시 재면 −600 같은 유한한 값일 수 있다', '맞다 — 0 은 언제나 수학적 불가능을 뜻한다', '확률이 0 이면 NaN 과 같은 뜻이다', '문장이 길수록 확률이 커지므로 계산 실수다']"
        :answer="0"
        :hints="['실험 ②의 곱하기파가 0 을 찍었을 때, log 파는 뭐라고 했나요?']"
        explanation="긴 문장의 확률은 정상적으로도 10⁻⁴⁵ 아래로 내려갑니다 — 칸이 못 담을 뿐이죠. 실전 도구들이 문장 점수를 log 확률(또는 토큰당 평균 log 확률)로 보고하는 이유입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch6')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">6장 완료!</p>
      <p class="mt-1 text-sm text-emerald-700">
        계산을 안전하게 만드는 법을 배웠으니, 이제 칸 자체를 반으로 줄일 차례 —
        메모리 절반의 유혹, fp16 과 bf16 의 갈림길로 갑니다.
      </p>
      <RouterLink
        to="/ch/ch7"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        7장 — 반쪽 자: fp16·bf16과 혼합 정밀도 →
      </RouterLink>
    </div>
  </article>
</template>
