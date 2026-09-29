<script setup lang="ts">
// 2장 — 이어쓰기 기계의 한계: 조련 없이(퓨샷) 버텨 보고, 무너지는 지점을 정확히 본다.
// 다시 쓰는 수학: 4부 9장(출력층 = 다음 단어 확률분포) · 5부 7장(퍼플렉시티 = 실질 갈래 수).
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import FewShotLab from '@/components/FewShotLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch2')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">2장 · 약 35분</p>
    <h1 class="mb-4 text-3xl font-bold">이어쓰기 기계의 한계</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      "조련하면 된다"는 지도(1장)를 받았지만, 잠깐. 조련은 비쌉니다.
      혹시 <b>조련 없이 프롬프트만 잘 쓰면</b> 되지 않을까요? 이번 장은 그 방법을
      끝까지 밀어붙여 보고, 정확히 어디서 무너지는지 확인합니다.
      무너지는 지점이 곧 <b>"조련이 꼭 필요한 이유"</b>가 돼요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      퓨샷 프롬프트가 <b>왜 작동하는지</b>(조건부 확률, 곧 문맥이 분포를 민다)와
      <b>왜 결국 부족한지</b>(형식 흉내일 뿐이라 자리·불안정·거절 불가)를 모두 설명할 수 있게 됩니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 지시를 못 따르는 이유: 수학 한 줄</h2>
    <ReviewFlag id="ch2-s1" chapter="ch2" label="1. 지시를 못 따르는 이유: 수학 한 줄" />
    <p class="leading-relaxed text-slate-700">
      베이스 모델은 "질문에 답하는 기계"가 아니라 <b>이어질 글을 잇는 기계</b>입니다.
      그 정체를 4부 9장에서 배운 그대로 수식 한 줄로 쓰면 이렇습니다:
    </p>
    <MathBlock expr="P(\text{다음 단어} \mid \text{앞 문맥})" />
    <p class="leading-relaxed text-slate-700">
      <b>앞 문맥이 주어졌을 때 다음 단어의 확률분포</b>. 이게 전부예요.
      "번역해 줘"라는 지시가 들어와도, 모델이 계산하는 건 "인터넷에서 이 문장 뒤에
      뭐가 왔더라?"입니다. 인터넷에는 지시문 뒤에 <b>수행 결과</b>보다
      <b>비슷한 지시문·딴 얘기</b>가 온 경우가 많았을 뿐이죠. 모델은 고장 난 게 아니라
      배운 분포에 충실한 겁니다.
    </p>

    <ConceptCard tone="tip" title="핵심: 그렇다면 문맥을 조작하면 되지 않을까?">
      위 식에서 손댈 수 있는 건 딱 하나, <b>앞 문맥</b>입니다.
      문맥에 "요청 → 답변" 예시를 몇 개 심어 두면, "다음에 올 법한 것"의 분포가
      <b>답변 쪽으로 밀립니다</b>. 이 트릭의 이름이 <b>퓨샷 프롬프트</b>예요. 아래에서 직접 해 보세요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 실험: 예시로 분포 밀어 보기</h2>
    <ReviewFlag id="ch2-s2" chapter="ch2" label="2. 실험: 예시로 분포 밀어 보기" />

    <FewShotLab />

    <p class="mt-4 leading-relaxed text-slate-700">
      예시가 쌓일수록 응답이 안정되는 걸 봤죠. 5부 7장의 언어로 말하면,
      예시가 문맥에 쌓일수록 "다음에 올 것"에 대한 모델의 <b>고민 갈래(퍼플렉시티)가 줄어듭니다</b>.
      예시 0개일 땐 수백 갈래(딴 얘기·다음 문항·이어쓰기…)였다가,
      3개쯤 되면 "답변을 쓴다"는 한 갈래로 좁혀지는 거예요.
    </p>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="퓨샷 프롬프트가 베이스 모델에게 '작동'하는 원리는?"
      :choices="['예시가 문맥에 들어가 다음 단어의 확률분포를 답변 쪽으로 민다', '예시를 보는 순간 모델의 가중치가 바뀐다', '예시가 모델에 새 지식을 저장한다', '우연히 되는 것으로 원리는 없다']"
      :answer="0"
      :hints="['모델의 식 P(다음 단어 | 앞 문맥)에서 손댈 수 있는 건 무엇이었나요?']"
      explanation="퓨샷 = 문맥 조작. 가중치는 1비트도 안 바뀝니다. 분포를 잠깐 밀어 두는 것뿐이라, 문맥이 사라지면 효과도 사라져요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 무너지는 지점: 퓨샷의 4가지 한계</h2>
    <ReviewFlag id="ch2-s3" chapter="ch2" label="3. 무너지는 지점: 퓨샷의 4가지 한계" />
    <p class="leading-relaxed text-slate-700">
      돌발 실험에서 봤듯, 성공은 절반짜리였습니다. 한계를 정리하면:
    </p>
    <div class="my-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="mb-1 text-sm font-bold text-slate-800">① 자리를 차지한다</p>
        <p class="text-sm leading-relaxed text-slate-600">예시는 매 요청마다 함께 보내야 해요. 컨텍스트 윈도우는 유한한데, 예시가 본론의 자리를 갉아먹습니다.</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="mb-1 text-sm font-bold text-slate-800">② 쉽게 무너진다</p>
        <p class="text-sm leading-relaxed text-slate-600">예시와 조금만 다른 유형이 오면 이어쓰기 본능이 새어 나옵니다. 답한 뒤 멈추지 않는 것도 그 증상.</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="mb-1 text-sm font-bold text-slate-800">③ 거절을 못 가르친다</p>
        <p class="text-sm leading-relaxed text-slate-600">"이런 요청엔 응하지 마라" 같은 가치관·안전 기준은 형식 예시 몇 개로 심을 수 없어요. 돌발 실험이 그 증거.</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="mb-1 text-sm font-bold text-slate-800">④ 지워지면 끝</p>
        <p class="text-sm leading-relaxed text-slate-600">가중치가 안 바뀌었으니 문맥이 사라지면 원래 이어쓰기 기계로 돌아갑니다. 배운 게 아니라 흉내였던 거죠.</p>
      </div>
    </div>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">프롬프트는 분포를 잠깐 밀고, 조련은 분포 자체를 바꾼다</p>
      <p class="mt-1 text-sm text-indigo-600">행동을 영구히 바꾸려면 가중치를 바꿔야 하고, 그 첫 방법이 3장의 SFT입니다.</p>
    </div>

    <ConceptCard tone="note" title="새 용어: 제로샷 / 퓨샷 / 컨텍스트 윈도우">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li><b>제로샷</b> (zero-shot). 뜻: 예시 없이 요청만 보내는 것.</li>
        <li><b>퓨샷</b> (few-shot). 뜻: 요청 앞에 <b>예시 몇 개</b>(shot)를 붙여 분포를 미는 기법. 예시 1개면 원샷.</li>
        <li><b>컨텍스트 윈도우</b> (context window). 뜻: 모델이 한 번에 읽을 수 있는 <b>앞 문맥의 최대 길이</b>(토큰 수). 퓨샷 예시도 이 안에서 자리를 차지합니다.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="퓨샷으로 존댓말 변환 예시 3개를 잘 넣어 뒀다. 이 모델은 이제 '기밀 유출 요청을 거절하는 법'도 함께 배운 상태다."
      type="truefalse"
      :answer="1"
      explanation="거짓입니다. 예시는 존댓말 변환이라는 형식만 밀어 줬을 뿐이에요. 거절 같은 가치관은 예시 몇 개로 심어지지 않습니다. 돌발 실험에서 확인한 그대로."
    />

    <DetailsCard title="➕ 더 깊이: '요즘 모델은 프롬프트만으로도 잘되던데요?'">
      좋은 지적이에요. 단, 여러분이 프롬프트를 쓰는 상대는 이미 <b>조련이 끝난 instruct 모델</b>입니다.
      조련된 모델은 "지시를 따른다"는 행동이 가중치에 새겨져 있어서 프롬프트가 잘 먹히는 거예요.
      즉 "프롬프트 엔지니어링이 강력하다"는 사실은 조련의 대체재가 아니라 <b>조련의 결과물</b> 위에서
      성립합니다. 참고로 퓨샷처럼 문맥만으로 새 패턴을 흉내 내는 능력을
      <b>인컨텍스트 러닝</b>(in-context learning)이라고 부릅니다. "러닝"이라는 이름이 붙었지만
      가중치는 변하지 않아요.
    </DetailsCard>

    <ReviewFlag id="ch2-ai" chapter="ch2" label="🤖 AI 연결 · 다시 쓰는 수학: 4부 9장 · 5부 7장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 · 다시 쓰는 수학: 4부 9장 · 5부 7장">
      이 장의 두 기둥이 모두 복습이었습니다.
      <b><PartLink :part="4" ch="ch9">4부 9장</PartLink></b>: 모델의 출력 = 다음 단어의 확률분포. 지시를 못 따르는 이유이자 퓨샷이 먹히는 이유.
      <b><PartLink :part="5" ch="ch7">5부 7장</PartLink></b>: 퍼플렉시티 = 실질 갈래 수. 예시가 쌓일수록 갈래가 좁혀져 형식이 안정되는 원리.
      다음 장부터는 드디어 <b>가중치를 바꾸는</b> 진짜 조련이고, 거기서 5부 4장(크로스 엔트로피)이 돌아옵니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">4. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="이어쓰기 기계의 한계: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="베이스 모델이 계산하는 것을 한 줄로 쓰면?"
        :choices="['P(다음 단어 | 앞 문맥): 문맥이 주어졌을 때 다음 단어의 확률', '지시가 옳은지에 대한 판단', '답변의 친절함 점수', '문장의 문법 오류 개수']"
        :answer="0"
        explanation="4부 9장에서 배운 그대로입니다. 베이스 모델의 전부는 조건부 확률분포예요. 그래서 문맥(조건)을 조작하는 퓨샷이 통합니다."
      />
      <Quiz
        difficulty="easy"
        question="요청 앞에 예시 3개를 붙여 보내는 기법의 이름은?"
        :choices="['퓨샷 프롬프트', '제로샷 프롬프트', 'SFT', 'RLHF']"
        :answer="0"
        explanation="예시(shot) 몇(few) 개, 곧 퓨샷입니다. 예시 없이 보내면 제로샷."
      />
      <Quiz
        difficulty="easy"
        question="퓨샷 예시를 본 베이스 모델은 가중치가 바뀐다."
        type="truefalse"
        :answer="1"
        explanation="거짓입니다. 프롬프트는 가중치를 1비트도 못 바꿔요. 분포를 잠깐 밀 뿐이라, 문맥이 사라지면 원래대로입니다."
      />
      <Quiz
        difficulty="easy"
        question="실험에서 예시 1개(원샷)를 넣었을 때 나타난 증상은?"
        :choices="['답을 한 뒤 멈추지 않고 스스로 다음 문제를 만들어 이어 썼다', '아무 응답도 하지 않았다', '완벽한 답만 정확히 냈다', '예시를 그대로 복사했다']"
        :answer="0"
        explanation="답변 형식을 흉내 내기 시작했지만 본질은 여전히 이어쓰기예요. 그래서 Q/A 패턴을 계속 이어 갔죠."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="예시가 쌓일수록 응답이 안정되는 현상을 5부 7장의 언어로 옮기면?"
        :choices="['문맥이 다음 토큰의 실질 갈래 수(퍼플렉시티)를 줄인다', '모델의 지식이 늘어난다', '토큰 수가 줄어든다', '온도(temperature)가 올라간다']"
        :answer="0"
        :hints="['퍼플렉시티 = 평균 몇 갈래에서 고민하나, 였죠.']"
        explanation="예시가 문맥에 쌓이면 '다음에 올 것'의 후보가 좁혀집니다. 갈래(퍼플렉시티)가 줄어 형식이 안정되는 거예요."
      />
      <Quiz
        difficulty="medium"
        question="퓨샷의 4가지 한계에 해당하지 않는 것은?"
        :choices="['모델의 세상 지식이 사라진다', '예시가 컨텍스트 윈도우 자리를 차지한다', '예시 밖 유형에서 쉽게 무너진다', '거절 같은 가치관을 못 가르친다']"
        :answer="0"
        explanation="지식은 그대로입니다(사전학습 담당, 1장). 나머지 셋 + '문맥이 지워지면 끝'이 퓨샷의 한계였어요."
      />
      <Quiz
        difficulty="medium"
        question="돌발 실험(기밀 문서를 SNS 홍보 글로)에서 모델이 그냥 써 버린 근본 이유는?"
        :choices="['존댓말 예시는 거절이라는 행동을 전혀 담고 있지 않아서', '모델이 기밀의 뜻을 몰라서', '프롬프트가 너무 길어서', '한국어 처리가 안 돼서']"
        :answer="0"
        :hints="['예시가 민 것은 어떤 분포였나요? 형식? 가치관?']"
        explanation="퓨샷이 민 것은 '요청→존댓말 변환'이라는 형식 분포뿐입니다. 무엇을 거절해야 하는지는 예시 어디에도 없었죠."
      />
      <Quiz
        difficulty="medium"
        question="'인컨텍스트 러닝'이라는 이름에 대한 올바른 이해는?"
        :choices="['러닝이라 불리지만 가중치는 변하지 않는 문맥 효과다', '가중치가 실시간으로 바뀌는 학습이다', 'SFT의 다른 이름이다', '사전학습의 다른 이름이다']"
        :answer="0"
        explanation="문맥 안(in-context)에서 패턴을 흉내 내는 능력이에요. 이름과 달리 진짜 학습(가중치 변화)이 아닙니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="'프롬프트 엔지니어링이 잘 먹히니 조련은 불필요하다'는 주장의 허점은?"
        :choices="['프롬프트가 잘 먹히는 모델은 이미 조련된 instruct 모델이라는 점', '프롬프트는 비용이 전혀 들지 않는다는 점', '조련은 지식을 늘리지 못한다는 점', '허점이 없다. 옳은 주장이다']"
        :answer="0"
        :hints="['여러분이 평소 프롬프트를 보내는 모델의 이름표(-instruct)를 떠올려 보세요.']"
        explanation="지시를 따르는 행동 자체가 조련의 산물입니다. 프롬프트 엔지니어링은 조련의 대체재가 아니라 조련 위에서 작동해요."
      />
      <Quiz
        difficulty="hard"
        question="회사 챗봇에 퓨샷만 쓰기로 했다. 요청마다 예시 12개(약 900토큰)를 붙이고, 컨텍스트 윈도우는 4,000토큰이다. 본론(사용자 대화+문서)에 남는 자리는 약 몇 토큰일까요?"
        type="numeric"
        :answer="3100"
        :hints="['컨텍스트 윈도우에서 예시가 차지한 몫을 빼면 됩니다.']"
        explanation="4000 − 900 = 3100토큰. 요청마다 900토큰을 반복 지불하는 셈이고, 한계 ①(자리 차지)의 실감판입니다. SFT로 행동을 가중치에 새기면 이 자리가 통째로 돌아와요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch2')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">2장 완료! 이제 조련이 왜 필요한지 스스로 답할 수 있어요!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다음은 3장, 드디어 가중치를 바꿉니다. 시범(모범 답안)으로 가르치는 SFT,
        그리고 그 정체가 5부에서 배운 크로스 엔트로피 그대로임을 확인해요.
      </p>
      <RouterLink
        to="/ch/ch3"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        3장: SFT, 시범 보여주기 →
      </RouterLink>
    </div>
  </article>
</template>
