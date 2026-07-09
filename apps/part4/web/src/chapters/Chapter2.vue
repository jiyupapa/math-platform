<script setup lang="ts">
// Phase 2 — 토큰화. 파이프라인의 첫 칸: 글을 토큰(조각)으로 쪼개 숫자 ID 로.
import { computed } from 'vue'
import { ConceptCard } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { ChartView } from '@series/ui'
import TokenizerLab from '@/components/TokenizerLab.vue'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import { ReviewFlag } from '@series/ui'
import { tokenize } from '@/utils/tokenizer'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

// "토큰화는 재미있다" 를 세 방식으로 쪼갰을 때 토큰 수 비교 (방식별 트레이드오프 시각화)
const compareSentence = '토큰화는 재미있다'
const counts = computed(() => ({
  word: tokenize(compareSentence, 'word').length,
  subword: tokenize(compareSentence, 'subword').length,
  char: tokenize(compareSentence, 'char').length,
}))
const compareChart = computed(() => ({
  labels: ['단어 단위', '서브워드', '글자 단위'],
  datasets: [
    {
      label: `"${compareSentence}" 의 토큰 수`,
      data: [counts.value.word, counts.value.subword, counts.value.char],
      backgroundColor: ['#f472b6', '#6366f1', '#fbbf24'],
      borderRadius: 6,
    },
  ],
}))

function onSetComplete() {
  progress.markDone('ch2')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 2 · 토큰화</p>
    <h1 class="mb-4 text-3xl font-bold">토큰화 — 글을 조각으로 쪼개기</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      파이프라인의 <b>맨 첫 칸</b>입니다. 컴퓨터는 글자 자체를 다루지 못하고 <b>숫자</b>만 압니다.
      그래서 가장 먼저 글을 <b>토큰(조각)</b>으로 자르고, 각 토큰에 <b>번호(ID)</b>를 붙입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      글이 어떻게 <b>토큰으로 쪼개지고 숫자 ID</b>가 되는지, 그리고 왜 요즘 LLM 은
      <b>단어도 글자도 아닌 "서브워드"</b>로 쪼개는지를 직접 만져보며 이해합니다.
    </ConceptCard>

    <!-- ===== 1. 왜 쪼개나 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      1. 글 → 토큰 → 숫자
      <ReviewFlag id="ch2-s1" chapter="ch2" label="1. 글을 토큰으로" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      LLM 은 결국 숫자를 계산하는 기계라, 글을 그대로 넣을 수 없습니다. 그래서 문장을
      <b>토큰(token)</b>이라는 조각으로 자른 뒤, <b>사전(vocabulary)</b>을 찾아 각 토큰을
      <b>고유 번호(ID)</b>로 바꿉니다. 아래에서 문장과 방식을 바꿔가며 직접 확인해 보세요.
    </p>

    <TokenizerLab />

    <ConceptCard tone="note" title="새 용어 세 개">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>토큰(token)</b> — 글을 쪼갠 <b>한 조각</b>. 단어 하나일 수도, 단어의 일부일 수도 있습니다.</li>
        <li><b>토큰화(tokenization)</b> — 글을 토큰으로 <b>쪼개는 과정</b>.</li>
        <li><b>사전(vocabulary)</b> — 모델이 아는 <b>토큰 전체 목록</b>. 각 토큰에 고유 ID 가 매겨져 있습니다.
          (진짜 LLM 은 보통 <b>약 5만~10만 개</b>)</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="컴퓨터(LLM)는 글자 자체가 아니라 숫자로 계산한다. 그래서 토큰마다 번호(ID)를 붙인다."
      type="truefalse"
      :answer="0"
      explanation="맞아요. 토큰화 → 각 토큰을 사전 ID(숫자)로. 그래야 이후 계산이 가능합니다."
    />

    <!-- ===== 2. 단어 vs 글자 vs 서브워드 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      2. 단어? 글자? 아니면 그 중간(서브워드)?
      <ReviewFlag id="ch2-s2" chapter="ch2" label="2. 서브워드가 필요한 이유" />
    </h2>
    <p class="leading-relaxed text-slate-700">
      쪼개는 단위는 여러 가지입니다. 위 실험실에서 방식을 <b>토큰화는 재미있다</b> 문장으로 바꿔보면
      차이가 확 드러나요:
    </p>
    <ul class="my-3 space-y-1.5 pl-1 text-sm text-slate-700">
      <li>🔸 <b>단어 단위</b> — 사전에 <b>통째로</b> 있어야 함. 없으면 <b class="text-rose-600">[UNK]</b>(모르는 단어)로
        뭉개져 뜻을 잃습니다. 새 단어·오타에 취약해요.</li>
      <li>🔸 <b>글자 단위</b> — [UNK] 는 거의 없지만, 토큰 수가 <b>확 늘어</b>납니다(계산량↑).</li>
      <li>🔸 <b>서브워드</b> — 자주 쓰는 말은 통째로, 드문 말은 <b>조각</b>으로. 두 문제를 절충한
        <b>현대 LLM 의 표준</b>입니다.</li>
    </ul>

    <p class="leading-relaxed text-slate-700">
      같은 문장 <b>"{{ compareSentence }}"</b> 을 세 방식으로 쪼갰을 때 토큰 수를 비교하면:
    </p>
    <ChartView type="bar" :data="compareChart" :height="240" />
    <p class="text-sm text-slate-500">
      단어 단위는 <b>{{ counts.word }}개</b>(둘 다 [UNK]!), 서브워드는 <b>{{ counts.subword }}개</b>,
      글자 단위는 <b>{{ counts.char }}개</b>. 서브워드가 <b>[UNK] 없이</b>도 토큰 수를 적당히 유지합니다.
    </p>

    <ConceptCard tone="note" title="새 기호: [UNK]">
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li><b>이름</b>: 언노운 토큰 (unknown token)</li>
        <li><b>읽는 법</b>: "언노운" 또는 "미상 토큰"</li>
        <li><b>뜻</b>: 사전에 <b>없는 토큰</b>을 대신하는 특별한 자리. 원래 뜻이 사라지므로
          <b>적을수록 좋습니다</b>. 서브워드는 이 [UNK] 를 거의 없애요.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="서브워드(subword) 방식의 가장 큰 장점은?"
      :choices="[
        '토큰 수를 항상 1개로 만든다',
        '사전에 없는 단어도 조각으로 표현해 [UNK] 를 크게 줄인다',
        '한글을 영어로 바꿔준다',
        '계산을 아예 없앤다',
      ]"
      :answer="1"
      :hints="['모르는 단어를 통째로 버리지 않고 어떻게 처리하나요?']"
      explanation="드문 단어도 아는 조각들로 쪼개 표현하니 [UNK] 가 거의 안 생깁니다. 그래서 현대 LLM 의 표준."
    />

    <!-- ===== 3. AI 연결 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">
      3. 🤖 토큰은 LLM 의 "요금 단위"이자 "길이 한도"
      <ReviewFlag id="ch2-s3" chapter="ch2" label="3. AI 연결" />
    </h2>
    <ConceptCard tone="ai" title="토큰 수가 곧 비용이고 한계다">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          진짜 LLM 은 <b>서브워드 토크나이저</b>(BPE 등)로 글을 쪼갭니다. 그래서 새 단어·이모지·다국어도
          조각으로 처리할 수 있어요.
        </li>
        <li>
          API 요금과 <b>입력 길이 한도(컨텍스트 창)</b>는 글자 수가 아니라 <b>토큰 수</b>로 셉니다.
          "토큰이 많다 = 비싸고, 한도에 빨리 찬다."
        </li>
        <li>
          그래서 토큰화는 파이프라인의 <b>맨 앞 칸</b>이면서, 모델의 <b>비용·속도·한계</b>를 좌우하는
          숨은 주인공입니다.
        </li>
      </ul>
      <p class="mt-2 text-sm text-violet-900/80">
        다음 칸(ch3 임베딩)은 이렇게 얻은 <b>토큰 ID</b> 를 <b>의미를 담은 숫자 벡터</b>로 바꿉니다.
      </p>
    </ConceptCard>

    <DetailsCard title="➕ 더 깊이 알아보기 — BPE는 어떻게 조각을 정할까?">
      <p class="mb-2">
        서브워드 사전은 사람이 정하지 않고 <b>데이터에서 학습</b>합니다. 대표 방법이
        <b>BPE(Byte Pair Encoding)</b>예요. 아이디어는 단순합니다:
      </p>
      <ul class="mb-2 list-disc space-y-1 pl-5 text-sm">
        <li>처음엔 모든 걸 <b>낱글자</b>로 시작.</li>
        <li>말뭉치에서 <b>가장 자주 붙어 나오는 두 조각</b>을 찾아 <b>하나로 합친다</b>.</li>
        <li>이걸 원하는 사전 크기가 될 때까지 <b>반복</b>. 자주 나오는 덩어리일수록 하나의 토큰이 됩니다.</li>
      </ul>
      <div class="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">
        🎯 <b>결과</b>: "the", "ing", "은/는" 처럼 <b>자주 나오는 조각</b>은 통째 토큰이 되고,
        드문 단어는 그 조각들로 쪼개집니다 — 흔한 건 짧게, 드문 건 잘게.
      </div>
    </DetailsCard>

    <!-- ===== 4. 문제 세트 ===== -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 토큰 수 세기 문제는 위 실험실에서 직접 세어 봐도 좋아요.
    </p>

    <QuizSet title="토큰화 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="토큰화(tokenization)란 글을 토큰(조각)으로 쪼개는 과정이다."
        type="truefalse"
        :answer="0"
        explanation="맞아요. 그리고 각 토큰은 사전에서 고유 번호(ID)를 받습니다."
      />
      <Quiz
        difficulty="easy"
        question="글을 쪼갠 각 토큰에 붙는 것은 무엇인가요?"
        :choices="['색깔', '고유 번호(ID)', '그림', '소리']"
        :answer="1"
        explanation="사전(vocabulary)에서 각 토큰에 고유 ID(숫자)가 매겨집니다."
      />
      <Quiz
        difficulty="easy"
        question="토큰은 항상 완전한 '단어' 하나다."
        type="truefalse"
        :answer="1"
        :hints="['서브워드를 떠올려 보세요.']"
        explanation="거짓입니다. 토큰은 단어의 일부(조각)일 수도 있어요(서브워드)."
      />
      <Quiz
        difficulty="easy"
        question="모델이 아는 토큰 전체 목록을 무엇이라 하나요?"
        :choices="['사전(vocabulary)', '문법', '주소록', '캐시']"
        :answer="0"
        explanation="사전(vocabulary). 각 토큰과 그 ID 가 담겨 있습니다."
      />

      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="'나는 밥을 먹었다' 를 단어 단위로 토큰화하면 토큰이 몇 개일까요?"
        type="numeric"
        :answer="3"
        :hints="['띄어쓰기로 나눠 세어 보세요.']"
        explanation="[나는][밥을][먹었다] → 3개."
      />
      <Quiz
        difficulty="medium"
        question="같은 문장 '나는 밥을 먹었다' 를 글자 단위로 토큰화하면 몇 개일까요?"
        type="numeric"
        :answer="7"
        :hints="['나·는·밥·을·먹·었·다 — 글자 하나씩.']"
        explanation="나,는,밥,을,먹,었,다 → 7개. 글자 단위는 토큰 수가 많아집니다."
      />
      <Quiz
        difficulty="medium"
        question="사전에 통째로 없는 단어를 '단어 단위'로 토큰화하면 어떻게 되나요?"
        :choices="[
          '자동으로 새 단어가 사전에 추가된다',
          '[UNK](모르는 단어)로 처리되어 뜻을 잃는다',
          '에러가 나서 멈춘다',
          '반으로 잘린다',
        ]"
        :answer="1"
        explanation="단어 단위는 사전에 없으면 [UNK] 로 뭉개집니다. 그래서 서브워드가 유리해요."
      />
      <Quiz
        difficulty="medium"
        question="현대 LLM 이 주로 쓰는 토큰화 방식은?"
        :choices="['단어 단위', '글자 단위', '서브워드', '문장 단위']"
        :answer="2"
        :hints="['[UNK]도 줄이고 토큰 수도 적당한 절충안.']"
        explanation="서브워드(BPE 등). [UNK] 를 줄이면서 토큰 수도 적당히 유지합니다."
      />

      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="위 실험실에서 '토큰화는' 을 '서브워드'로 쪼개면 토큰이 몇 개가 될까요? (직접 세어 보세요)"
        type="numeric"
        :answer="3"
        :hints="['실험실에 문장을 넣고 서브워드 방식을 눌러 보세요.', '아는 조각(토큰/화/는)으로 나뉩니다.']"
        explanation="[토큰][화][는] → 3개. 아는 조각들로 쪼개니 [UNK] 없이 처리됩니다."
      />
      <Quiz
        difficulty="hard"
        question="LLM 사용에서 '토큰 수'가 중요한 이유로 가장 옳은 것은?"
        :choices="[
          '화면 밝기를 정해서',
          'API 요금과 입력 길이 한도(컨텍스트)가 토큰 수로 계산되기 때문',
          '글자 색을 정해서',
          '토큰 수는 아무 상관이 없다',
        ]"
        :answer="1"
        :hints="['비용과 길이 제한의 단위가 무엇일까요?']"
        explanation="요금·컨텍스트 한도는 글자가 아니라 토큰 수로 셉니다. 토큰이 많으면 비싸고 한도에 빨리 찹니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch2')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 2 완료 — 글이 숫자가 됐습니다</p>
      <p class="mt-1 text-sm text-emerald-700">
        이제 토큰 ID 를 얻었으니, 다음 챕터(ch3 임베딩)에서 이 ID 를
        <b>의미를 담은 숫자 벡터</b>로 바꿉니다. 대응 노트북 <code>notebooks/ch02_tokenization.ipynb</code> 도 함께!
      </p>
    </div>
  </article>
</template>
