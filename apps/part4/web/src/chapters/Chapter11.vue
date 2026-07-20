<script setup lang="ts">
// Phase 11 (심화) — 학습. 무작위 가중치가 '다음 단어 맞히기'로 똑똑해지는 과정: 손실 + 경사하강.
import { ref, computed } from 'vue'
import { ConceptCard } from '@series/ui'
import { PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import GradientDescentLab from '@/components/GradientDescentLab.vue'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { RouterLink } from 'vue-router'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// 인라인 크로스 엔트로피 데모: 정답 단어에 준 확률 p → 손실 -ln(p)
const p = ref(0.5)
const ceLoss = computed(() => -Math.log(p.value))

function onSetComplete() {
  progress.markDone('ch11')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 11 · 학습 (심화)</p>
    <h1 class="mb-4 text-3xl font-bold">학습 — 무작위 가중치가 똑똑해지기까지</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      ch10의 미니 트랜스포머는 <b>무작위 가중치</b>라 엉터리 단어를 뱉었죠. <b>학습(training)</b>은
      그 무작위 숫자들을 <b>다음 단어 맞히기 연습</b>으로 조금씩 다듬어 똑똑하게 만드는 과정입니다.
    </p>
    <p class="mb-2 leading-relaxed text-slate-600">
      🔑 <b>가중치(weight)</b> = 모델 안에서 <b>학습으로 바뀌는 모든 숫자</b>예요 — 임베딩, Q·K·V,
      FFN 값 전부. 학습이란 결국 <b>이 숫자들을 조금씩 좋게 바꾸는 일</b>입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      "얼마나 틀렸나"를 재는 <b>손실(loss)</b>과, 손실을 줄이는 방향으로 가중치를 조금씩 바꾸는
      <b>경사하강(gradient descent)</b>을 직접 굴려보며 이해합니다.
    </ConceptCard>

    <!-- ===== 1. 손실 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      1. 손실 — 얼마나 틀렸나
      <ReviewFlag id="ch11-s1" chapter="ch11" label="1. 손실" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      학습하려면 먼저 <b>"틀린 정도"</b>를 숫자로 재야 합니다. 다음 단어 예측에서는
      <b>정답 단어에 모델이 준 확률</b>을 봅니다. 정답에 <b>높은 확률</b>을 줬으면 손실이 작고,
      <b>낮은 확률</b>을 줬으면 손실이 큽니다. 공식은 <MathBlock inline expr="\text{손실} = -\ln(p_{\text{정답}})" /> 예요.
    </p>
    <p class="mt-1 text-sm text-slate-500">
      🔑 <MathBlock inline expr="\ln" /> 은 <b>로그</b>라는 함수인데, 지금은 <b>계산법을 몰라도
      됩니다</b>(정식 소개는 2부 7장 — 지수·로그 미분).
      이 <MathBlock inline expr="-\ln(p)" /> 가 하는 일은 딱 하나 — <b>정답 확률 p가 1이면 손실 0, p가 작아질수록
      손실이 확 커지는</b> 변환이에요. 아래 슬라이더를 움직이면 그 모양이 그대로 보입니다.
    </p>

    <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
      <label class="flex flex-wrap items-center gap-3 text-sm">
        <span class="font-medium text-slate-600">정답 단어에 준 확률 p</span>
        <input type="range" min="0.02" max="1" step="0.01" v-model.number="p" class="h-2 w-48 cursor-pointer accent-indigo-500" />
        <span class="w-12 font-mono tabular-nums">{{ (p * 100).toFixed(0) }}%</span>
      </label>
      <div class="mt-3 h-4 w-full overflow-hidden rounded-full bg-slate-100">
        <div class="h-full rounded-full transition-all" :class="ceLoss < 0.5 ? 'bg-emerald-400' : ceLoss < 1.5 ? 'bg-amber-400' : 'bg-rose-400'" :style="{ width: Math.min(ceLoss / 4 * 100, 100) + '%' }" />
      </div>
      <p class="mt-2 text-sm">
        손실 = <b class="font-mono">{{ ceLoss.toFixed(2) }}</b>
        <span v-if="p > 0.9" class="text-emerald-600"> — 정답을 거의 확신! 손실이 0에 가깝습니다. 👍</span>
        <span v-else-if="p < 0.15" class="text-rose-600"> — 정답을 거의 놓침! 손실이 큽니다.</span>
        <span v-else class="text-slate-500"> — 정답 확률을 1(100%)로 올릴수록 손실은 0으로 갑니다.</span>
      </p>
    </div>

    <ConceptCard tone="note" title="새 용어: 손실 · 크로스 엔트로피">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>손실(loss)</b> — 모델 예측이 정답과 <b>얼마나 다른지</b>를 나타내는 숫자. <b>작을수록 좋음</b>.</li>
        <li><b>크로스 엔트로피(cross-entropy)</b> — 다음 단어 예측에 쓰는 손실. <b>정답 단어의 확률이 낮을수록</b>
          손실이 커집니다(<MathBlock inline expr="-\ln p" />).</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="정답 단어에 더 높은 확률을 줄수록 손실(loss)은 작아진다."
      type="truefalse"
      :answer="0"
      explanation="맞아요. 정답을 확신할수록(확률 1에 가까울수록) 손실은 0에 가까워집니다."
    />

    <!-- ===== 2. 경사하강 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      2. 경사하강 — 손실을 줄이는 방향으로
      <ReviewFlag id="ch11-s2" chapter="ch11" label="2. 경사하강" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      손실을 <b>가중치의 언덕</b>이라고 생각해 보세요. 지금 있는 자리에서 <b>기울기(gradient)</b>는
      "손실이 커지는 방향"을 알려줍니다. 그 <b>반대 방향</b>으로 <b>조금씩</b> 걸어 내려가면 손실이 줄어요.
      한 걸음의 크기가 <b>학습률(learning rate)</b>입니다. 아래 공을 굴려 보세요.
    </p>

    <GradientDescentLab />

    <ConceptCard tone="note" title="새 용어 세 개">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>경사하강(gradient descent)</b> — 기울기 반대 방향으로 조금씩 가중치를 바꿔 손실을 줄이는 방법.</li>
        <li><b>기울기(gradient)</b> — 손실이 가장 빠르게 <b>커지는 방향</b>. 그 반대로 가면 가장 빠르게 줄어듭니다.</li>
        <li><b>학습률(learning rate)</b> — 한 걸음의 크기. <b>너무 크면 발산</b>, 너무 작으면 느립니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="학습률(learning rate)이 너무 크면 어떤 일이 생길 수 있나요?"
      :choices="[
        '골짜기(최소)를 지나쳐 튕겨 나가 발산할 수 있다',
        '손실이 항상 0이 된다',
        '토큰이 늘어난다',
        '아무 일도 없다',
      ]"
      :answer="0"
      :hints="['실험실에서 학습률을 1 이상으로 올려 보세요.']"
      explanation="걸음이 너무 크면 최소를 지나쳐 오히려 손실이 커지며 발산할 수 있습니다."
    />

    <DetailsCard title="➕ 더 깊이 알아보기 — 역전파와 사전학습·파인튜닝">
      <p class="mb-1 font-semibold text-slate-800">① 역전파(backpropagation)</p>
      <p class="mb-3">
        트랜스포머엔 가중치가 <b>수억~수천억 개</b>입니다. 각 가중치를 얼마나 바꿀지(=각자의 기울기)를
        <b>연쇄법칙</b>으로 <b>출력에서 입력 방향으로 거슬러</b> 한 번에 계산하는 방법이 <b>역전파</b>예요.
        "경사하강이 어디로 갈지 정한다면, 역전파는 그 방향을 효율적으로 구해 줍니다."
      </p>
      <p class="mb-1 font-semibold text-slate-800">② 사전학습 → 파인튜닝</p>
      <ul class="mb-2 list-disc space-y-1 pl-5 text-sm">
        <li><b>사전학습(pretraining)</b>: 인터넷 규모의 방대한 글로 <b>다음 단어 맞히기</b>를 연습.
          여기서 언어·지식 대부분을 습득합니다.</li>
        <li><b>파인튜닝(fine-tuning)</b>: 그 위에 <b>대화·지시 따르기</b> 등을 추가로 학습해
          "쓸모 있는 도우미"로 다듬습니다(RLHF 등).</li>
      </ul>
      <div class="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">
        🎯 즉 <b>"다음 단어 맞히기"</b> 하나로 지식을 쌓고(사전학습), 그 뒤 사용 목적에 맞게 다듬습니다(파인튜닝).
      </div>
    </DetailsCard>

    <!-- ===== 3. AI 연결 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      3. 🤖 지식은 어디서 오나
      <ReviewFlag id="ch11-s3" chapter="ch11" label="3. AI 연결" />
    </h2>
    <ConceptCard tone="ai" title="다음 단어 맞히기가 지능이 되기까지">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          LLM의 "지식"은 <b>방대한 글로 다음 단어를 맞히는 연습</b>에서 나옵니다. 문법·상식·번역·추론이
          그 과정에서 <b>부수적으로</b> 학습돼요.
        </li>
        <li>
          이 학습을 <b>수조 개 단어</b>에, 가중치 <b>수천억 개</b>로 하면 — 그게 오늘날의 거대 LLM입니다.
          "모델을 키운다"는 건 데이터·가중치·계산을 함께 늘리는 것.
        </li>
        <li>
          그래도 원리는 이 챕터 그대로 — <b>손실을 재고, 경사하강으로 조금씩 줄이기</b>의 반복입니다.
        </li>
      </ul>
      <p class="mt-2 text-sm text-violet-900/80">
        회수하는 수학 — 경사하강은 <b><PartLink :part="2" ch="ch9">2부 9장</PartLink></b>,
        손실 −ln(p) 의 로그는 <b><PartLink :part="2" ch="ch7">2부 7장</PartLink></b>에서 쌓은 그 기초입니다.
      </p>
      <p class="mt-2 text-sm text-violet-900/80">
        학습이 끝나 똑똑해진 모델이, 이제 다음 단어를 <b>어떻게 고를지</b>가 마지막 챕터(ch12 샘플링)입니다.
      </p>
    </ConceptCard>

    <!-- ===== 문제 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700"><b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.</p>

    <QuizSet title="학습 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="학습 전(무작위 가중치) 모델은 다음 단어를 잘 맞히지 못한다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 학습으로 가중치를 다듬어야 잘 맞히게 됩니다."
      />
      <Quiz
        difficulty="easy"
        question="'손실(loss)'을 가장 잘 설명한 것은?"
        :choices="['모델 예측이 정답과 얼마나 다른지(틀린 정도)', '토큰의 개수', '단어의 길이', '층의 수']"
        :answer="0"
        explanation="손실은 틀린 정도를 나타내는 숫자입니다. 작을수록 좋아요."
      />
      <Quiz
        difficulty="easy"
        question="정답 단어에 높은 확률을 줄수록 손실은 작아진다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 크로스 엔트로피 손실 = -ln(정답 확률)."
      />
      <Quiz
        difficulty="easy"
        question="손실을 줄이는 방향으로 가중치를 조금씩 바꾸는 방법의 이름은?"
        :choices="['경사하강(gradient descent)', '토큰화', '소프트맥스', '정규화']"
        :answer="0"
        explanation="경사하강. 기울기 반대 방향으로 조금씩 내려갑니다."
      />

      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="정답 단어에 확률 100%(=1)를 주면, 손실은 어떻게 될까요?"
        :choices="['0이 된다 (완벽)', '1이 된다', '무한대가 된다', '음수가 된다']"
        :answer="0"
        :hints="['위 슬라이더에서 확률을 100%로 밀어 보세요.']"
        explanation="정답을 완벽히 확신하면(p=1) 손실은 0입니다. 반대로 확률이 0에 가까우면 손실은 아주 커져요."
      />
      <Quiz
        difficulty="medium"
        question="기울기(gradient)는 무엇을 알려주나요?"
        :choices="[
          '손실이 커지는 방향 (그 반대로 가면 줄어듦)',
          '단어의 순서',
          '토큰 ID',
          '확률의 합',
        ]"
        :answer="0"
        explanation="기울기는 손실이 가장 빨리 커지는 방향. 학습은 그 반대로 갑니다."
      />
      <Quiz
        difficulty="medium"
        question="학습률(learning rate)이 너무 크면?"
        :choices="['최소를 지나쳐 발산할 수 있다', '항상 더 빨리 정답에 도달한다', '손실이 사라진다', '토큰이 줄어든다']"
        :answer="0"
        :hints="['걸음이 너무 크면 골짜기를 건너뛰겠죠.']"
        explanation="걸음이 크면 최소를 지나쳐 튕겨 나가 발산할 수 있습니다."
      />
      <Quiz
        difficulty="medium"
        question="경사하강을 여러 번 반복하면 손실은 대체로 어떻게 되나요?"
        :choices="['점점 줄어든다', '점점 커진다', '항상 그대로', '항상 1이 된다']"
        :answer="0"
        explanation="기울기 반대로 조금씩 내려가므로 반복할수록 손실이 줄어듭니다."
      />

      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="LLM의 '사전학습(pretraining)'은 본질적으로 무엇을 연습하는 것인가요?"
        :choices="[
          '방대한 글로 다음 단어 맞히기',
          '이미지 분류',
          '토큰을 알파벳순 정렬',
          '확률을 2로 만들기',
        ]"
        :answer="0"
        :hints="['이 시리즈의 큰 그림(ch1).']"
        explanation="다음 단어 맞히기입니다. 그 과정에서 문법·지식·추론이 부수적으로 학습됩니다."
      />
      <Quiz
        difficulty="hard"
        question="수많은 가중치 각각의 기울기를 연쇄법칙으로 효율적으로 계산하는 알고리즘은?"
        :choices="['역전파(backpropagation)', '토큰화', '멀티헤드', '위치 인코딩']"
        :answer="0"
        :hints="['출력에서 입력으로 거슬러 올라갑니다.']"
        explanation="역전파. 경사하강이 갈 방향을, 역전파가 효율적으로 구해 줍니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch11')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 11 완료 — 모델이 똑똑해지는 원리</p>
      <p class="mt-1 text-sm text-emerald-700">
        손실을 재고 경사하강으로 줄이기 — 그게 학습입니다. 마지막 챕터
        <RouterLink to="/ch/ch12" class="text-emerald-800 underline">ch12 샘플링</RouterLink>에서
        똑똑해진 모델이 다음 단어를 <b>어떻게 고르는지</b> 봅니다. 노트북
        <code>notebooks/ch11_training.ipynb</code> 도 함께!
      </p>
    </div>
  </article>
</template>
