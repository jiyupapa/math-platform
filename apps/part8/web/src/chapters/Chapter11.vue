<script setup lang="ts">
// 11장 — 🎯 캡스톤: 파인튜닝 설정 완독. 미니 조련 튜너(12조합 그리드) + 진짜 config 한 줄씩 완독 → 졸업.
// 다시 쓰는 수학: 8부 전체 + 6부 3장(SFT 설정 직결) — 전 시리즈의 종착역.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import CapstoneLab from '@/components/CapstoneLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch11')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">11장 · 약 50분 · 🎯 캡스톤</p>
    <h1 class="mb-4 text-3xl font-bold">캡스톤 — 파인튜닝 설정 완독</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업에서 이 여정은 하나의 질문으로 시작했습니다. <b>"수학(기울기)은 완벽히 같은데,
      왜 운명이 갈리나?"</b> 열한 장을 지나온 지금, 답은 손에 있어요: 운명은 다이얼이 정하고,
      다이얼 하나하나가 전부 수학이었습니다. 졸업 시험은 둘입니다. ① 다이얼을 직접 조합해 훈련을
      성공시키기, ② 진짜 설정 파일을 <b>한 줄도 남김없이</b> 읽어 내기.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표 (졸업 요건)">
      세 가지를 해냅니다. ① <b>미션 완수</b>: 12조합 그리드에서 eval 0.15 이하 정착 조합을
      찾는다(실패의 진단까지), ② <b>기본값의 이해</b>: 왜 실전 기본 조합(적당 lr + 워밍업·코사인 +
      weight decay)이 유일한 합격인지, 곧 각 다이얼이 서로 다른 실패를 막는다는 것, ③ <b>설정 파일
      끝까지 읽기</b>: 12줄 전부에서 "이 줄은 몇 장의 수학"이 말해지게.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 졸업 시험 ①: 미니 조련 튜너</h2>
    <ReviewFlag id="ch11-s1" chapter="ch11" label="1. 졸업 시험 ①: 미니 조련 튜너" />
    <p class="leading-relaxed text-slate-700">
      무대는 7~8장의 그 문제 그대로입니다. 노이즈 낀 기울기(3장), 암기 가능한 용량(7장),
      3,000스텝. 다이얼 세 개가 주어집니다: <b>보폭</b>(2장), <b>일정표</b>(6장),
      <b>목줄</b>(8장). 조합은 3 × 2 × 2 = 12가지. 이렇게 조합을 전부 훑는 걸 실무에선
      <b>그리드 서치</b>라 불러요. 미션에 성공해 보세요. 실패해도 좋습니다. <b>모든 실패에
      진단이 붙으니까요</b>(9장에서 배운 그 기술).
    </p>

    <CapstoneLab />

    <ConceptCard tone="tip" title="핵심 관찰: 왜 합격 조합이 하나뿐인가">
      12조합의 성적표가 곧 8부 요약입니다. <b>거인 걸음(2.0)</b>은 일정표·목줄을 바꿔도 전부
      발산: 경계(2장) 밖 보폭은 다른 다이얼로 못 구합니다(그래서 <b>lr 자릿수부터</b>).
      <b>잔걸음(0.0003)</b>은 전부 미도달. 안전하지만 하세월(소심이). <b>성큼(0.05)</b>은
      보폭이 맞아도: 고정이면 서성이고(6장), 목줄이 없으면 암기가 벌어집니다(7장). 결국
      <b>세 다이얼이 서로 다른 실패를 하나씩 막아야</b> 완주합니다. 실전 기본값(adamw + cosine +
      warmup + weight_decay)이 괜히 기본값이 아닌 이유예요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="합격 조합의 세 다이얼이 각각 막은 실패를 옳게 짝지은 것은?"
      :choices="['적당한 lr → 발산·미도달(2장), 코사인 감쇠 → 후반 서성임(6장), weight decay → 암기의 벌어짐(7·8장)', '셋 다 같은 실패(발산)를 막는다', 'lr → 암기, 감쇠 → 발산, 목줄 → 서성임', '다이얼은 성능과 무관하다']"
      :answer="0"
      :hints="['실패한 11개 조합의 진단문을 다시 읽어 보세요. 각각 어느 장의 병이었나요?']"
      explanation="다이얼마다 담당하는 병이 다릅니다. 그래서 하나만 잘 골라서는 안 되고, 하나만 빠져도 안 돼요."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="batch_size를 16에서 32로 키우면 나침반의 흔들림은?"
      :choices="['1/√2로 줄어든다 (σ/√B, 3장). 그리고 lr도 함께 키우는 관행(linear scaling)이 있다', '절반으로 줄어든다', '변하지 않는다', '2배로 커진다']"
      :answer="0"
      :hints="['흔들림은 √B에 반비례. B가 2배면?']"
      explanation="σ/√16 → σ/√32: √2분의 1. 시리즈에 네 번 나온 그 1/√n이 설정 파일의 batch_size 뒤에 있습니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 졸업 시험 ②: 설정 파일 완독</h2>
    <ReviewFlag id="ch11-s2" chapter="ch11" label="2. 졸업 시험 ②: 설정 파일 완독" />
    <p class="leading-relaxed text-slate-700">
      6부 3장에서 SFT를 배울 때 설정 파일을 스쳐 지나가며 약속했었죠. 언젠가 전부 읽히게
      될 거라고. 그날이 오늘입니다. 위 실험 ②의 12줄을 전부 클릭해 완독하세요. 참고로 훈련의
      규모 계산도 이제 한 줄이에요:
    </p>
    <MathBlock expr="\text{총 스텝 수} \;=\; \frac{\text{데이터 수}}{\text{batch\_size}} \times \text{num\_epochs} \;=\; \frac{1200}{16} \times 3 \;=\; 225" />

    <ConceptCard tone="note" title="새 용어: 그리드 서치 / 하이퍼파라미터 튜닝 / 체크포인트">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>그리드 서치</b> (grid search). 뜻: 다이얼 후보들의 <b>모든 조합을 전수 실험</b>하는 탐색. 실험 ①이 한 일.
          조합이 많으면 무작위 표본으로 훑는 랜덤 서치(random search)도 씁니다.
        </li>
        <li>
          <b>하이퍼파라미터 튜닝</b> (hyperparameter tuning). 뜻: 다이얼 값을 골라 가는 과정의 총칭. 스위프(2장)·그리드·랜덤 서치가 도구,
          판독(9장)이 나침반, 검증 데이터(7장)가 심판.
        </li>
        <li>
          <b>체크포인트</b> (checkpoint). 뜻: 훈련 중간의 모델 저장본. NaN 사고(9장) 때 돌아갈 지점이자, 조기 종료(8장)가
          돌려주는 "최저점 모델"의 실체.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">설정 파일의 모든 줄은 시리즈 어딘가의 수학이다. 다이얼을 읽고, 곡선을 진단하고, 처방을 내리면 졸업이다</p>
      <p class="mt-1 text-sm text-indigo-600">보폭·나침반·관성·축별 자·일정표·시험·목줄·계기판·지형, 열한 장이 설정 파일 12줄로 접혔습니다.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="eval_steps(주기적 검증)가 없으면 과적합의 벌어짐을 볼 방법이 없다."
      type="truefalse"
      :answer="0"
      explanation="참입니다. 훈련 손실만으로는 학습과 암기가 구분되지 않습니다(7장). eval_loss 곡선이 있어야 9장의 판독이 가능해요."
    />

    <DetailsCard title="➕ 더 깊이: 실전 튜닝 관행, LoRA와의 연결, 여기 안 담긴 것들">
      실전 관행: 튜닝은 <b>lr 자릿수부터</b>(로그 스케일 스위프, 2장), 나머지는 기본값(adamw ·
      cosine · warmup · weight_decay 0.01)에서 출발해 <b>한 번에 하나씩</b>(9장) 조정합니다.
      수많은 사람의 수많은 실패가 이미 기본값에 접혀 있어요. <b>LoRA와의 연결</b>(6부 8장):
      5장에서 본 옵티마이저 청구서(m·v = 모델 무게 2배)가 파인튜닝 메모리의 주범이라, 전체
      80억 개 대신 <b>작은 어댑터만 훈련</b>하는 LoRA가 실무 표준이 됐습니다. 다이얼의 수학은
      그대로 적용돼요. <b>여기 안 담긴 것들</b>(이름만): 분산 훈련(GPU 여러 장의 협주),
      혼합 정밀도(fp16·bf16, 숫자를 반쪽 정밀도로), 그리고 스케일링 법칙(모델·데이터를
      키우는 제3의 다이얼). 다음 여정의 재료입니다.
    </DetailsCard>

    <ReviewFlag id="ch11-ai" chapter="ch11" label="🤖 AI 연결 · 다시 쓰는 수학: 6부 3장, 그리고 시리즈 전체" />
    <ConceptCard tone="ai" title="🤖 AI 연결 · 다시 쓰는 수학: 6부 3장, 그리고 시리즈 전체">
      <b><PartLink :part="6" ch="ch3">6부 3장</PartLink></b>의 SFT 설정 파일을 떠올려 보세요. 그때는 lr 한 줄도
      낯설었지만 이제 12줄 전부가 말을 겁니다: 보폭(2장), 나침반(3장), 관성과 축별 자(4·5장),
      일정표(6장), 봉인된 시험(7장), 목줄(8장), 안전핀과 일지(9장)까지. 그리고 그 모든 걸
      담는 지형의 그림(1·10장). <b>6부가 "무엇을 배우게 할까"였다면 8부는 "어떻게 잘 배우게
      할까"</b>입니다. 조련사의 두 손이 다 갖춰졌습니다. 이 시리즈의 이론 심화 트랙, 여기서 졸업입니다. 🎓
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기: 졸업 시험</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 8부가 완결됩니다.
    </p>

    <QuizSet title="캡스톤: 종합 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="learning_rate: 2e-5처럼 실전 파인튜닝의 lr이 작은 이유는?"
        :choices="['수십억 차원 지형의 발산 경계(2/c)가 예민해서(어느 방향인가는 곡률이 크기 마련)', 'GPU가 느려지는 것을 막으려고', '작을수록 항상 좋아서', '관습일 뿐 이유가 없다']"
        :answer="0"
        explanation="2장의 경계가 이 한 줄에 접혀 있습니다. 그리고 튜너에서 봤듯, 자릿수가 틀리면 다른 다이얼로 못 구해요."
      />
      <Quiz
        difficulty="easy"
        question="optimizer: adamw의 두 부품은?"
        :choices="['Adam(모멘텀 β₁ + RMS β₂, 축마다 다른 보폭) + 분리된 weight decay(W)', '아담과 이브', 'SGD와 GD', '워밍업과 코사인']"
        :answer="0"
        explanation="4·5장의 Adam에 8장의 목줄을 분리 방식으로 결합한 것으로, 현대 훈련의 기본값입니다."
      />
      <Quiz
        difficulty="easy"
        question="max_grad_norm: 1.0이 하는 일은?"
        :choices="['기울기 노름이 1.0을 넘으면 방향은 유지하고 크기만 절단(클리핑): 스파이크·발산 보험', '기울기를 항상 1.0으로 만든다', '손실을 1.0 이하로 제한한다', '보폭을 1.0으로 고정한다']"
        :answer="0"
        explanation="9장의 안전핀: g × (한계/‖g‖). 이상치 배치의 사고를 원천 차단합니다."
      />
      <Quiz
        difficulty="easy"
        question="warmup_steps: 100이 보호하는 것은?"
        :choices="['출발 직후의 취약 구간: Adam의 자(v̂) 예열(5장)과 낯선 초기 지형(2장)', '훈련 마지막 100스텝', 'GPU 온도', '데이터 로딩 속도']"
        :answer="0"
        explanation="6장의 워밍업. 초반 한정 위험엔 초반 한정 장치. 초반 스파이크(9장)의 처방이기도 합니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="dataset 1,200개, batch_size 16, num_epochs 3일 때 한 에포크의 스텝 수와 총 스텝 수를 구하세요."
        :steps="[
          { lhs: '1200 \\div 16', answer: 75 },
          { lhs: '75 \\times 3', answer: 225 },
        ]"
        :hints="['한 에포크 = 전체 데이터 한 바퀴 = 데이터 수 ÷ 배치 크기 (3장).', '에포크 수를 곱하면 총 스텝.']"
        explanation="75스텝 × 3에포크 = 225스텝. warmup_steps: 100이 총 스텝의 절반 가까이라면 너무 길다는 판단도 이제 할 수 있어요."
      />
      <Quiz
        difficulty="medium"
        question="튜너에서 lr 2.0은 일정표·목줄을 어떻게 바꿔도 전부 발산했습니다. 교훈은?"
        :choices="['경계 밖 보폭은 다른 다이얼로 못 구한다. 튜닝은 lr 자릿수부터(다이얼에도 우선순위가 있다)', '일정표와 목줄은 쓸모없는 다이얼이다', '발산은 운이 나빴을 뿐이다', '스텝 수를 늘리면 해결된다']"
        :answer="0"
        explanation="2장 경계(2/c)의 위력이에요. 그래서 실전 튜닝 관행이 'lr 로그 스케일 스위프 먼저'입니다."
      />
      <Quiz
        difficulty="medium"
        question="고정 보폭 + 목줄(λ=0.03) 조합이 0.176으로 아깝게 떨어진 이유는?"
        :choices="['암기(벌어짐)는 목줄이 막았지만, 고정 큰 보폭의 서성임(노이즈 × 보폭) 때문에 바닥에 정착하지 못해서', '목줄이 너무 강해서 과소적합', '발산해서', '데이터가 부족해서']"
        :answer="0"
        :hints="['6장: 정착에는 후반 잔걸음이 필요합니다.']"
        explanation="병은 하나가 아닙니다. 암기는 8장이, 서성임은 6장이 담당. 그래서 코사인 감쇠까지 채워야 합격이었어요."
      />
      <Quiz
        difficulty="medium"
        question="워밍업+코사인인데 목줄이 없는 조합(0.556)이 떨어진 이유는?"
        :choices="['감쇠가 보폭을 얼리기 전에 이미 암기가 진행돼(벌어짐), 그 상태로 굳어 버려서', '코사인이 발산을 일으켜서', '워밍업이 너무 짧아서', '검증 데이터가 어려워서']"
        :answer="0"
        explanation="일정표는 서성임(6장)의 처방이지 암기(7장)의 처방이 아닙니다. 벌어짐엔 목줄·조기 종료(8장)."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="eval_loss가 2에포크쯤 최저를 찍고 상승, train_loss는 순조롭습니다. 설정 파일에서 만질 후보 줄들은?"
        :choices="['num_epochs(줄이기) · early_stopping_patience(조기 종료) · weight_decay(올리기): 과적합 처방 3종', 'learning_rate를 10배 올린다', 'max_grad_norm을 없앤다', 'warmup_steps를 늘린다']"
        :answer="0"
        :hints="['벌어짐(7장)의 처방전: 멈추기·목줄·(가능하면) 데이터.']"
        explanation="증상(벌어짐) → 병(과적합) → 처방(멈춤·목줄·데이터)이 설정 파일의 구체적 줄로 이어집니다. 8부의 전 과정을 한 문제로."
      />
      <Quiz
        difficulty="hard"
        question="이 시리즈 전체를 관통한 6부와 8부의 관계로 옳은 것은?"
        :choices="['6부는 무엇을 배우게 할까(데이터·손실·보상), 8부는 어떻게 잘 배우게 할까(다이얼), 조련사의 두 손', '6부와 8부는 서로 무관하다', '8부는 6부의 요약본이다', '6부는 이론, 8부는 역사를 다룬다']"
        :answer="0"
        :hints="['같은 설정 파일을 두 부가 나눠 읽었습니다. dataset 줄과 lr 줄.']"
        explanation="dataset·reward가 6부의 줄이라면 lr·schedule·decay는 8부의 줄. 한 설정 파일에서 두 부가 만납니다. 졸업 축하합니다! 🎓"
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch11')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-2xl">🎓</div>
      <p class="text-lg font-bold text-emerald-800">8부 완결: 최적화 트랙 졸업!</p>
      <p class="mt-2 text-sm leading-relaxed text-emerald-700">
        워밍업의 세 러너에서 시작해 보폭의 과학, 흔들리는 나침반, 관성, 축별 자, 여행 일정표,
        봉인된 시험, 원점 목줄, 훈련 일지 판독, 말안장의 반전을 지나 설정 파일을 끝까지 읽어 내기까지.
        이제 훈련 로그 앞에서 곡선이 말을 걸고, 설정 파일에 모르는 줄이 없습니다.
        6부(조련)와 함께, LLM을 만드는 두 손이 모두 갖춰졌어요.
      </p>
      <RouterLink
        to="/"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        홈에서 여정 돌아보기 →
      </RouterLink>
    </div>
  </article>
</template>
