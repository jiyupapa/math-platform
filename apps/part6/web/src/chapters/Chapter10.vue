<script setup lang="ts">
// 10장 — 🎯 캡스톤: 나만의 챗봇 조련. 시리즈 대단원 — 본편은 노트북(전 파이프라인 조립),
// 웹은 여정 정리 + 조련 시뮬레이션 + 졸업 시험.
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import CapstonePipeline from '@/components/CapstonePipeline.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch10')
}

// 여정 회고 — 1장의 지도가 채워진 모습
const JOURNEY = [
  { ch: '0~2', what: '문제 — 이어쓰기 기계는 비서가 아니다', math: 'P(다음 단어|문맥) · 퍼플렉시티' },
  { ch: '3', what: 'SFT — 시범으로 행동 가르치기', math: '크로스 엔트로피 −log q · 마스킹' },
  { ch: '4', what: '보상 모델 — 취향을 숫자로', math: 'Bradley-Terry σ(Δr) · −log 재등장' },
  { ch: '5', what: '강화학습 — 점수로 배우기', math: '기댓값 E[r] · 경사상승' },
  { ch: '6', what: 'RLHF — 조립 + KL 목줄', math: 'r − β·KL(π‖π_ref)' },
  { ch: '7', what: 'DPO — 심판 없는 지름길', math: '숨은 점수 β·log(π/π_ref)' },
  { ch: '8', what: 'LoRA — 살짝만 조련', math: 'rank · ΔW = B·A' },
  { ch: '9', what: '성적표 — 재기와 부작용', math: '신뢰구간 ± · 가설검정' },
]
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">10장 · 약 50분 · 🎯 캡스톤</p>
    <h1 class="mb-4 text-3xl font-bold">🎯 캡스톤 — 나만의 챗봇 조련</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      여기까지 왔습니다. 워밍업에서 "조련 전 모델은 이어쓰기 기계"라는 문제를 받았고,
      이제 그 기계를 비서로 만드는 <b>모든 조각</b>을 손에 들고 있어요.
      마지막 장에서 할 일은 하나 — <b>전부 이어서, 처음부터 끝까지, 직접 조련하는 것</b>입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표 — 시리즈의 목표이기도 합니다">
      조련 파이프라인 전체(사전학습 → SFT → 선호 → DPO)를 한 흐름으로 조립하고,
      시리즈의 마지막 문장을 자기 말로 할 수 있게 됩니다 —
      <b>"GPT가 ChatGPT가 되는 길은, 아는 수학 몇 조각의 재조립이었다."</b>
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 여정 회고 — 1장의 지도가 다 채워졌다</h2>
    <p class="leading-relaxed text-slate-700">
      1장에서 받았던 빈 지도를 기억하나요? 이제 모든 칸이 채워졌습니다.
    </p>
    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[30rem] text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3">장</th>
            <th class="py-2 pr-3">배운 것</th>
            <th class="py-2">쓴 수학</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr v-for="j in JOURNEY" :key="j.ch" class="border-b border-slate-100">
            <td class="py-2 pr-3 font-medium">{{ j.ch }}</td>
            <td class="py-2 pr-3">{{ j.what }}</td>
            <td class="py-2 font-mono text-xs text-slate-500">{{ j.math }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="조련 파이프라인의 순서와 각 단계의 담당을 올바르게 이은 것은?"
      :choices="['사전학습(지식) → SFT(행동) → 선호 학습(취향)', 'SFT(지식) → 사전학습(행동) → 선호 학습(취향)', '선호 학습(지식) → SFT(취향) → 사전학습(행동)', '순서는 자유다']"
      :answer="0"
      explanation="1장의 한 줄 그대로 — 지식은 사전학습이, 행동은 SFT가, 취향은 선호 학습이 만듭니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 졸업 실험 — 처음부터 끝까지, 직접</h2>
    <p class="leading-relaxed text-slate-700">
      아래 시뮬레이션에서 파이프라인을 직접 끝까지 진행해 보세요.
      단계 ③에서 <b>당신의 진짜 취향</b>으로 고르세요 — 그 선택이 최종 챗봇을 결정합니다.
    </p>

    <CapstonePipeline />

    <ConceptCard tone="tip" title="핵심 관찰 — 조련의 끝은 수학이 아니라 선택이다">
      파이프라인의 수학(채점·확률·목줄·경사)은 전부 기계적입니다. 그런데 마지막 입력 —
      <b>"어느 답이 더 나은가"</b> — 는 사람의 선택이었죠. 같은 수학, 다른 선호면 다른 챗봇.
      AI 조련이란 결국 <b>사람의 기준을 수학의 관을 통해 모델에 흘려 넣는 일</b>입니다.
      그래서 "누가, 어떤 기준으로 고르는가"가 기술만큼 중요해요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 본편은 노트북 — 진짜 조립</h2>
    <p class="leading-relaxed text-slate-700">
      이 장의 본편은 노트북입니다. 워밍업의 이어쓰기 기계에서 출발해 —
      SFT(3장의 표 갱신과 마스킹) → 보상 모델(4장의 Bradley-Terry 경사하강) →
      DPO(7장의 숨은 점수) → 평가(9장)까지, <b>전 장의 코드 조각을 하나의 파이프라인으로</b>
      잇습니다. 마지막 셀에서는 명시적 심판(4장)의 점수와 DPO 숨은 점수(7장)가
      <b>같은 방향을 가리키는지</b>도 확인해요 — 두 장이 수학적으로 한 몸이라는 증거죠.
    </p>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">GPT가 ChatGPT가 되는 길은, 아는 수학 몇 조각의 재조립이었다</p>
      <p class="mt-1 text-sm text-indigo-600">크로스 엔트로피가 채점하고 · 시그모이드가 취향을 확률로 바꾸고 · KL이 목줄을 잡고 · 경사하강이 민다</p>
    </div>

    <h2 class="mt-8 mb-2 text-xl font-bold">밖에서 말할 때 — 용어 치환표</h2>
    <p class="leading-relaxed text-slate-700">
      "조련"은 이 과정의 <b>비유어</b>였습니다. 동료·문서·논문 앞에서는 실무 용어로 바꿔 말하세요 —
      비유는 이해를 위한 사다리였고, 이제 진짜 이름으로 대화할 차례입니다.
    </p>
    <div class="my-4 overflow-x-auto">
      <table class="w-full min-w-[26rem] text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-slate-500">
            <th class="py-2 pr-3">이 과정의 말</th>
            <th class="py-2">실무·논문의 말</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">조련 (전체 과정)</td><td class="py-2"><b>사후 학습</b>(post-training) · <b>파인튜닝</b>(fine-tuning) · <b>정렬</b>(alignment)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">시범 보여주기</td><td class="py-2"><b>SFT</b> · 지시 조정(instruction tuning)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">취향 다듬기 (선호 학습)</td><td class="py-2"><b>선호 최적화</b>(preference optimization) — RLHF·DPO 계열</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">심판</td><td class="py-2"><b>보상 모델</b>(reward model)</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">목줄</td><td class="py-2"><b>KL 페널티</b>(KL penalty) · KL 정규화</td></tr>
          <tr class="border-b border-slate-100"><td class="py-2 pr-3">숨은 점수 (7장)</td><td class="py-2"><b>암묵적 보상</b>(implicit reward) — DPO 의 β·log(π/π_ref)</td></tr>
          <tr><td class="py-2 pr-3">살짝만 조련</td><td class="py-2"><b>LoRA</b> — PEFT(파라미터 효율적 파인튜닝)의 대표</td></tr>
        </tbody>
      </table>
    </div>

    <DetailsCard title="➕ 더 깊이: 시리즈 전체를 여섯 줄로">
      <b>1부</b> 단어가 벡터가 되고, 변환이 행렬곱이 된다 ·
      <b>2부</b> 배움이란 기울기를 따라 내려가는 것 ·
      <b>3부</b> AI는 확률로 예측하고 데이터로 배운다 ·
      <b>4부</b> LLM = 다음 단어를 확률로 고르는 기계 ·
      <b>5부</b> 모든 눈금은 놀람 −log p 에서 나온다 ·
      <b>6부</b> 그 기계를 비서로 만드는 것은 사람의 선호 + 아는 수학의 재조립.
      — 이 여섯 줄을 자기 말로 할 수 있다면, 완주입니다.
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 전 시리즈">
      이 장에는 새 수학이 하나도 없습니다 — 그게 이 장의 메시지입니다.
      워밍업에서 예고했던 문장을 이제 증명했어요: <b>6부는 새 수학이 아니라,
      1~5부에서 배운 수학의 총회수였다.</b> 다음에 새로운 조련 기법(새 논문)을 만나도
      두려워 마세요 — 열어 보면 대개 이 조각들의 또 다른 재조립입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 졸업 시험</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      전 장 종합 10문제입니다. <b>모두 맞히면 6부 — 그리고 시리즈 — 완주</b>입니다. 🎓
    </p>

    <QuizSet title="🎓 졸업 시험 — 종합 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="베이스 모델이 지시를 못 따르는 근본 이유는?"
        :choices="['본업이 P(다음 단어|문맥) — 지시 수행이 아니라 이어쓰기라서', '지식이 부족해서', '한국어를 몰라서', 'GPU가 느려서']"
        :answer="0"
        explanation="ch0~2의 출발점. 능력이 아니라 행동 방식의 문제 — 그래서 조련이 필요했죠."
      />
      <Quiz
        difficulty="easy"
        question="−log(정답 확률) 이 손실로 등장한 곳을 모두 담은 것은?"
        :choices="['사전학습·SFT·보상 모델·DPO — 네 곳 전부', 'SFT 한 곳뿐', '보상 모델과 DPO 두 곳', '등장한 적 없다']"
        :answer="0"
        explanation="네 번의 재등장 — 정답이 토큰(사전학습·SFT), 사람의 선택(보상 모델), 선호 마진(DPO)으로 바뀌었을 뿐 뼈대는 하나였습니다."
      />
      <Quiz
        difficulty="easy"
        question="KL 목줄(r − β·KL)의 역할은?"
        :choices="['점수를 쫓되 원본에서 너무 멀어지면 벌점 — 보상 해킹과 말솜씨 붕괴 방지', '점수를 두 배로 증폭', '학습률을 자동 조절', '토큰 수를 제한']"
        :answer="0"
        explanation="6장의 심장. 심판(RM)이 불완전하기에, 그 말을 적당히만 듣게 하는 안전장치입니다."
      />
      <Quiz
        difficulty="easy"
        question="강화학습의 세 단어 중 '정책(π)'의 LLM 매핑은?"
        :choices="['모델 그 자체 — 다음 토큰을 고르는 확률분포', '보상 점수', '훈련 데이터', '평가 셋']"
        :answer="0"
        explanation="5장 — 새 개념이 아니라 4부에서 조립한 그 기계의 새 이름표였죠."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="졸업 3종 계산 — ① SFT: 정답 토큰에 q=1/4을 준 손실(비트) ② BT: 점수가 같을 때 P(A 승)(%) ③ RLHF: r=8, β=2, KL=3일 때 목적함수 값"
        :steps="[
          { lhs: '-\\log_2(1/4)', answer: 2 },
          { lhs: '\\sigma(0) \\times 100', answer: 50 },
          { lhs: '8 - 2 \\times 3', answer: 2 },
        ]"
        :hints="['① 2를 몇 번 곱하면 4가 되나 ② 시그모이드의 정중앙 ③ 점수 − β×거리']"
        explanation="채점(−log)·취향의 확률화(σ)·목줄(−βKL) — 세 계산이 조련 수학의 전부입니다."
      />
      <Quiz
        difficulty="medium"
        question="SFT의 손실 마스킹이 가리는 것과 그 이유는?"
        :choices="['지시 부분 — 배울 행동은 답변이므로 채점을 답변 토큰에만 모은다', '답변 부분 — 답을 외우면 안 되므로', '특수 토큰 — 형식 보호', '아무것도 안 가린다']"
        :answer="0"
        explanation="채점되는 토큰 = 배우는 대상(3장). 신호를 답변에 모으는 장치입니다."
      />
      <Quiz
        difficulty="medium"
        question="DPO가 보상 모델 없이 조련할 수 있는 열쇠는?"
        :choices="['정책 자체가 숨은 보상 모델 — r̂ = β·log(π/π_ref)', '선호 데이터가 필요 없어서', '참조 모델이 점수를 대신 매겨서', 'KL을 버려서']"
        :answer="0"
        explanation="7장 — RLHF 목적함수를 풀면 보상이 정책으로 표현됩니다. 심판이 수식 안으로 접혀 들어간 것."
      />
      <Quiz
        difficulty="medium"
        question="LoRA(ΔW = B·A)가 전체 파인튜닝보다 극적으로 가벼운 이유는?"
        :choices="['조련의 변화가 저rank라서 얇은 두 행렬로 충분 — 학습 파라미터가 수백분의 1', '모델의 절반을 지워서', '토큰을 압축해서', '이유 없이 관례라서']"
        :answer="0"
        explanation="8장 — 변화의 진짜 정보량(rank)이 낮다는 관찰이 근거입니다. r는 그 용량의 다이얼."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="벤치마크에서 우리 조련 모델이 1.5%p 앞섰습니다(300문항). 9장의 눈으로 본 올바른 태도는?"
        :choices="['±가 5%p 안팎이라 우연 범위 — 문항 확대나 다른 자(사람 평가) 교차 확인', '이겼으니 즉시 배포', '벤치마크를 폐기', '점수를 반올림해 2%p로 홍보']"
        :answer="0"
        :hints="['n=300이면 오차범위가 차이보다 클까요, 작을까요?']"
        explanation="점수 옆의 ±를 따지는 습관 — 차이가 ± 안이면 판단 보류가 정답입니다."
      />
      <Quiz
        difficulty="hard"
        question="사내 규정 챗봇을 만들려 합니다. 이 시리즈가 가르친 표준 설계는?"
        :choices="['SFT(사내 Q&A 시범)+LoRA로 조련 → 선호 쌍 모아 DPO → 자체 평가셋+부작용 감시로 검증', '베이스 모델에 프롬프트만 계속 붙인다', '사전학습을 처음부터 다시 한다', '벤치마크 1등 모델을 그대로 쓰면 끝']"
        :answer="0"
        :hints="['3장+8장 조합이 실무 표준이라 했고, 다듬기와 검증은 어느 장이 담당했죠?']"
        explanation="시범(3장)을 가볍게(8장) 새기고, 취향으로 다듬고(4·7장), 내 시험지로 검증(9장) — 파이프라인 전체가 답입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch10')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-2xl font-bold text-emerald-600">🎓</div>
      <p class="text-lg font-bold text-emerald-800">6부 완주 — 그리고 시리즈 완주를 축하합니다!</p>
      <p class="mt-2 text-sm leading-relaxed text-emerald-700">
        수학을 포기했던 자리에서 출발해, ChatGPT가 만들어지는 원리를 수식째로 이해하는 곳까지 —
        전부 당신이 직접 걸어온 길입니다. 이제 새 논문·새 기법을 만나도 두렵지 않을 거예요:
        열어 보면 대개 아는 조각들의 재조립이니까.
      </p>
      <p class="mt-3 text-sm text-emerald-700">
        더 가고 싶다면 — <PartLink :part="1" ch="ch7">1부 후반 심화</PartLink>(고유값·SVD·PCA)와
        <PartLink :part="3" ch="ch8">3부 심화</PartLink>(검정·회귀)가
        "선택"으로 남아 있습니다. 이제 전부 아는 수학의 이웃이에요.
      </p>
      <RouterLink
        to="/"
        class="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        목차로 — 여정 돌아보기
      </RouterLink>
    </div>
  </article>
</template>
