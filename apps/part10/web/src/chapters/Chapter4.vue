<script setup lang="ts">
// 4장 — 몸집과 밥의 황금비 (Chinchilla): 예산 고정 배분 곡선의 최저점. 필수 소주제 ②.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import ChinchillaLab from '@/components/ChinchillaLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch4')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">4장 · 성장의 법칙 (핵심)</p>
    <h1 class="mb-4 text-3xl font-bold">몸집과 밥의 황금비 — Chinchilla</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1장이 남긴 질문으로 돌아갑니다. 같은 예산 C로 <b>"크게 잠깐"</b>과 <b>"작게 오래"</b>
      중 뭐가 나을까? 3장에서 잰 스케일링 법칙이 N(몸집) 축에도 똑같이 성립한다는 사실을
      합치면, 이 질문은 감이 아니라 <b>계산</b>이 됩니다. 그리고 그 계산이 2022년, AI 판의
      상식을 뒤집었습니다. "몸집이 깡패"의 시대를 끝낸 <b>친칠라(Chinchilla)</b> 이야기입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      예산 C = 6·N·D 를 고정한 채 배분을 돌려 <b>손실의 U자 곡선과 최저점</b>을 발견하고,
      그 최저점의 어림 규칙인 <b>"파라미터당 약 20토큰"(황금비)</b>을 검산할 수 있게 됩니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 무대: 몸집이 깡패이던 시절</h2>
    <ReviewFlag id="ch4-s1" chapter="ch4" label="1. 무대: 몸집이 깡패이던 시절" />
    <p class="leading-relaxed text-slate-700">
      GPT-3(175B)가 나오던 시절의 공식은 단순했습니다. <b>클수록 좋다.</b> 그래서 다들
      예산이 생기면 몸집(N)부터 키웠죠. 175B 모델에 먹인 데이터는 300B 토큰,
      <b>파라미터당 1.7토큰</b>이었습니다. 그런데 잠깐, 예산은 C ≈ 6·N·D 로 몸집과 밥의
      <b>곱</b>입니다. 몸집을 2배 키우면 같은 돈으로 밥은 절반밖에 못 먹여요. 어느 쪽이
      손해일까요? 다이얼을 돌려 직접 확인해 봅시다.
    </p>

    <ChinchillaLab />

    <ConceptCard tone="tip" title="핵심 관찰: 배분에도 최저점이 있다">
      같은 예산인데 손실이 <b>U자</b>를 그립니다. 왼쪽(몸집 부족)은 담을 그릇이 작아서,
      오른쪽(<b>과체격</b>: 몸집 대비 밥 부족)은 덜 배워서 손해예요. 최저점은 정확히
      <b>몸집 배고픔(A/√N)과 데이터 배고픔(B/√D)이 같아지는 지점</b>이고, 우리 모형에선
      어느 예산에서든 <b>D ≈ 20·N</b>. 역사의 실화가 그대로 재현됩니다: 같은 예산에서
      280B짜리(비율 1.25)는 손실 1.992, <b>4배 작은 70B</b>(비율 20)는 <b>1.932</b>로
      작은 쪽이 이겼습니다. 이게 친칠라가 고퍼(Gopher)를 이긴 방식이에요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="예산 고정 배분 곡선(U자)에서 최저점의 오른쪽, 즉 '과체격' 구간의 뜻은?"
      :choices="['몸집(N)은 큰데 그만큼 먹이지 못해(D 부족) 잠재력을 못 채운 상태', '몸집이 작아 아무리 먹여도 못 담는 상태', '예산을 초과한 상태', '손실이 0이 된 상태']"
      :answer="0"
      :hints="['같은 예산에서 N을 키우면 D는 반대로 줄어듭니다. 곱이 고정이니까요.']"
      explanation="N을 키운 만큼 D가 깎여서(1.25토큰/파라미터처럼) 덜 배운 상태(undertrained). 고퍼 스타일 280B가 정확히 이 구간이었고, 같은 예산의 70B에게 졌습니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 계산으로: 왜 하필 그 지점인가</h2>
    <ReviewFlag id="ch4-s2" chapter="ch4" label="2. 계산으로: 왜 하필 그 지점인가" />
    <p class="leading-relaxed text-slate-700">
      3장의 법칙을 N축과 D축에 하나씩 적으면 손실은 이렇게 생겼습니다
      (친칠라의 관측을 재현하도록 고른 단순화 상수: E=1.69, A=32,000, B=A·√20):
    </p>

    <MathBlock expr="L(N, D) \;=\; E \;+\; \underbrace{\frac{A}{\sqrt{N}}}_{\text{몸집 배고픔}} \;+\; \underbrace{\frac{B}{\sqrt{D}}}_{\text{데이터 배고픔}} \qquad (C = 6\,N\,D \;\text{고정})" />

    <p class="leading-relaxed text-slate-700">
      C가 고정이면 N을 정하는 순간 D = C/6N이 따라옵니다. N이 커지면 첫 항은 줄고 둘째 항은
      늘어나는 <b>줄다리기</b>이고, 최저점은 두 항이 같아지는 곳(2부 9장에서 최저점을 찾던
      감각 그대로)입니다. A/√N = B/√D 로 놓고 <b>양변을 제곱</b>하면 A²/N = B²/D, 즉
      <b>D* = (B/A)²·N* = 20·N*</b>가 나옵니다. 황금비 20의 정체는
      두 배고픔 계수의 비율이었던 거예요. 그리고 예산이 100배가 되면? 최적 N*과 D*가
      <b>각각 10배</b>. 몸집과 밥을 <b>반반으로 나눠 키우는 것</b>이 법칙의 답입니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 컴퓨트 최적 / 과체격(덜 먹인) 모델 / 토큰-파라미터 비율">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>컴퓨트 최적</b> (compute-optimal, Chinchilla optimal). 읽는 법: 컴퓨트 옵티멀.
          비유: <b>몸집과 밥의 황금비</b>. 뜻: 주어진 예산 C에서 손실을 최소로 만드는
          N·D 배분. 우리 모형에선 D ≈ 20N.
        </li>
        <li>
          <b>과체격(덜 먹인) 모델</b> (undertrained model). 읽는 법: 언더트레인드.
          뜻: 황금비보다 몸집 쪽으로 치우친 배분(토큰/파라미터가 20보다 한참 작음).
          같은 예산의 더 작은 모델에게 지는 상태입니다.
        </li>
        <li>
          <b>토큰-파라미터 비율</b> (tokens per parameter). 읽는 법: 토큰 퍼 파라미터.
          뜻: D ÷ N. 모델 발표 스펙에서 이 비율부터 계산하는 게 이 장이 주는 습관입니다.
          1.7(GPT-3) vs 20(친칠라) vs 요즘의 수백~수천(아래 더 깊이).
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="예산이 100배로 늘면 컴퓨트 최적 배분의 N*과 D*는 어떻게 되나? (우리 모형 기준)"
      :choices="['각각 약 10배 (몸집과 밥을 반반으로 나눠 키운다)', 'N*만 100배', 'D*만 100배', '변하지 않는다']"
      :answer="0"
      :hints="['C = 6·N·D 이고 비율 D/N ≈ 20은 유지돼야 합니다. 100배를 곱으로 나누면?']"
      explanation="비율이 고정이니 늘어난 100배는 N과 D에 10배씩 곱으로 갈라집니다(10×10=100). 랩에서 예산 10²²와 10²⁴의 최적점(9.1B·0.18T → 91B·1.8T)을 비교해 보세요."
    />

    <DetailsCard title="➕ 더 깊이: 진짜 논문의 숫자, 그리고 황금비가 깨지는 요즘">
      실제 친칠라 논문(2022)은 세 가지 방법으로 최적 배분을 쟀고 결론은 "N과 D를 거의
      반반으로 키워라, 비율은 파라미터당 <b>약 20토큰</b>"이었고, 그 처방대로 만든 70B·1.4T
      모델이 4배 큰 고퍼(280B)를 이겼습니다. 우리 상수는 이 <b>관측</b>을 재현하도록 고른
      단순화(α=β=0.5, 읽는 법: 알파·베타, 뜻: 두 배고픔이 줄어드는 속도의 지수)이고,
      논문이 적합한 지수는 α≈0.34, β≈0.28로 <b>비대칭</b>입니다
      (게다가 후속 재검증에서 논문 상수의 자체 모순이 지적되는 등, 이 숫자들은 지금도
      다듬어지는 중이니, "정확한 상수"보다 <b>배분이 계산 문제라는 구조</b>가 남는 지식입니다).
      그리고 반전 하나: 요즘 모델들은 일부러 황금비를 <b>훨씬 넘겨</b> 먹입니다(8B에 15T
      토큰 = 파라미터당 1,875개!). 훈련 예산만 보면 손해지만, <b>추론(서빙) 비용</b>은 몸집에
      비례하니까? 수백만 명에게 배포할 모델은 작게 만들어 오래 먹이는 쪽이 총비용에서
      이깁니다. 황금비는 "훈련 예산만 최적화할 때"의 답인 거죠.
    </DetailsCard>

    <ReviewFlag id="ch4-ai" chapter="ch4" label="🤖 AI 연결: 발표 스펙에서 비율부터 계산하는 눈" />
    <ConceptCard tone="ai" title="🤖 AI 연결: 발표 스펙에서 비율부터 계산하는 눈">
      이제 "파라미터 70B, 토큰 2조" 같은 발표를 보면 자동으로 나눗셈이 될 겁니다.
      2T/70B ≈ 29토큰/파라미터, 황금비 근처군. 반대로 비율이 한 자리면 과체격(왜 이렇게
      배분했을까?), 수백이 넘으면 서빙 최적화(작게 만들어 배포하려는 모델)겠구나.
      배분 숫자 하나로 <b>설계 의도</b>까지 읽힙니다. N을 세는 공식은
      <b><PartLink :part="9" ch="ch1">9부 1장</PartLink></b>에서, "두 항의 줄다리기에서
      최저점 찾기"는 <b><PartLink :part="2" ch="ch9">2부 9장</PartLink></b>에서 만든
      감각입니다. 다음 장에서는 이 성장 이야기의 마지막 논쟁인 "능력이 갑자기 튀어나온다"는
      <b>창발</b>을 검증대에 올립니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="몸집과 밥의 황금비: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="컴퓨트 최적(황금비) 배분의 어림 규칙은 파라미터당 약 몇 토큰인가?"
        type="numeric"
        :answer="20"
        explanation="D ≈ 20·N, 친칠라 처방입니다. 70B 모델이면 1.4T 토큰(70B×20)이 황금비죠."
      />
      <Quiz
        difficulty="easy"
        question="같은 예산 C라면 어떤 배분(N↔D)을 고르든 손실은 같다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 랩의 U자 곡선이 증거예요. 같은 예산에서 고퍼 스타일(1.992)과 친칠라 스타일(1.932)의 손실이 갈렸죠."
      />
      <Quiz
        difficulty="easy"
        question="'과체격(덜 먹인) 모델'은 어떤 상태인가?"
        :choices="['몸집(N) 대비 데이터(D)를 황금비보다 한참 적게 먹인 상태', '데이터만 많고 몸집이 작은 상태', '예산을 다 못 쓴 상태', '손실이 바닥에 도달한 상태']"
        :answer="0"
        explanation="토큰/파라미터가 20보다 한참 작은 배분으로, U자 곡선의 오른쪽 구간입니다. GPT-3(1.7)와 고퍼(1.25 배분 기준)가 대표 사례."
      />
      <Quiz
        difficulty="easy"
        question="U자 곡선의 최저점에서 성립하는 것은? (우리 모형)"
        :choices="['몸집 배고픔 A/√N 과 데이터 배고픔 B/√D 가 정확히 같다', '몸집 배고픔이 0이 된다', '데이터 배고픔이 0이 된다', '두 항의 곱이 최대가 된다']"
        :answer="0"
        explanation="랩의 최적점 표시에서 확인했듯 두 항이 같아지는 지점(예: 예산 10²³에서 0.1883 = 0.1883)이 최저입니다. 한쪽 배고픔이 더 크면 그쪽에 예산을 더 줘야 하니까요."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="예산 C = 6×10²² FLOPs 를 황금비(D = 20·N)로 배분하면 N은 약 몇 B인가? 단계별로 계산해 보세요."
        :steps="[
          { lhs: 'C = 6 \\cdot N \\cdot 20N = ?\\,N^2', answer: 120 },
          { lhs: 'N^2 = 6\\times10^{22} / 120 = 5\\times10^{?}', answer: 20 },
          { lhs: 'N = \\sqrt{5\\times10^{20}} \\approx ?\\,\\text{B (일의 자리 반올림)}', answer: 22 },
        ]"
        explanation="√(5×10²⁰) = √5 × 10¹⁰ ≈ 2.24×10¹⁰ ≈ 22B. 밥은 D = 20N ≈ 450B 토큰. 예산 하나로 최적 설계가 통째로 나옵니다."
      />
      <Quiz
        difficulty="medium"
        question="같은 예산 5.9×10²³에서 두 배분(㉮ 280B·350B토큰 / ㉯ 70B·1.4T토큰)의 결과는? (랩 실측)"
        :choices="['㉯가 손실 1.932로 ㉮(1.992)를 이긴다. 4배 작은 모델의 승리', '㉮가 이긴다. 몸집이 깡패다', '정확히 같다', '예산이 달라 비교할 수 없다']"
        :answer="0"
        explanation="친칠라 vs 고퍼의 재현입니다. 몸집 4배는 같은 예산에서 밥 4배 감소를 뜻하고, 그 손해가 더 컸어요. 비율 1.25는 깊은 과체격 구간이니까요."
      />
      <Quiz
        difficulty="medium"
        question="황금비 20은 어디서 나오나? (우리 모형 D* = (B/A)²·N* 에서)"
        :choices="['두 배고픔 계수의 비율 (B/A)²: 데이터 배고픔이 상대적으로 클수록 밥을 많이 줘야 한다', '우연히 정해진 전통', 'GPU 개수', '어휘 크기']"
        :answer="0"
        explanation="B/A = √20이니 (B/A)² = 20. 계수는 시스템(아키텍처·데이터 품질)에 따라 달라질 수 있고, 그러면 황금비도 달라집니다. 20은 법칙이 아니라 측정된 어림이에요."
      />
      <Quiz
        difficulty="medium"
        question="발표 스펙 '몸집 8B · 학습 토큰 15T'의 토큰-파라미터 비율과 그 해석은?"
        :choices="['약 1,875 : 1: 황금비를 일부러 크게 넘긴 서빙(추론 비용) 최적화형 설계', '약 1.9 : 1 (과체격 모델)', '정확히 20 : 1 (컴퓨트 최적)', '비율을 계산할 수 없다']"
        :answer="0"
        :hints="['15T ÷ 8B = ?']"
        explanation="15×10¹² ÷ 8×10⁹ = 1,875. 훈련 예산만 보면 비효율이지만, 작은 몸집은 배포가 싸니까? 수백만 사용자에게 서빙할 모델의 합리적 선택입니다(더 깊이 카드)."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="어떤 팀이 예산을 늘리지 않고 몸집만 2배로 키우기로 했다. 이 장의 모형이 예측하는 결과는?"
        :choices="['밥이 절반이 되어(곱 고정) 황금비에서 멀어지고, 배분이 이미 최적이었다면 손실은 오히려 나빠진다', '무조건 좋아진다. 클수록 좋으니까', '손실이 정확히 절반이 된다', '예산과 배분은 무관하다']"
        :answer="0"
        :hints="['C = 6ND 고정에서 N×2 는 D÷2. U자 곡선 위에서 어느 방향인가요?']"
        explanation="최적점에 있었다면 N×2·D÷2는 U자를 오른쪽으로 타고 올라가는 이동입니다(과체격 방향). '키우면 좋아진다'는 예산이 함께 늘 때 이야기이고, 배분만 바꾸는 건 다른 문제예요."
      />
      <Quiz
        difficulty="hard"
        question="친칠라의 교훈을 평가(10부 2막)와 잇는 가장 올바른 문장은?"
        :choices="['배분·설계 주장은 손실 곡선으로 검증된 계산이지만, 최종 벤치마크 점수 차이는 여전히 오차범위 검증이 필요하다. 두 눈이 다 있어야 발표를 읽는다', '스케일링 법칙만 알면 벤치마크는 볼 필요 없다', '벤치마크만 있으면 배분 계산은 필요 없다', '둘은 서로 모순된다']"
        :answer="0"
        explanation="1막(법칙)은 '왜 이렇게 설계했나'를, 2막(통계)은 '그 결과 점수를 믿을 수 있나'를 담당합니다. 캡스톤(10장)의 팩트체크가 정확히 이 두 눈으로 기사를 읽어요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch4')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">4장 완료! 황금비를 검산했습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음 5장 주제는 '창발일까 착시일까'입니다. "능력이 갑자기 튀어나온다"는 유명한 주장과,
        "지표를 바꾸면 완만해진다"는 반론을 직접 재현해 봅니다. 성장 이야기의 마지막 논쟁.
      </p>
      <RouterLink
        to="/ch/ch5"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        5장: 창발일까 착시일까 →
      </RouterLink>
    </div>
  </article>
</template>
