<script setup lang="ts">
// ch11 — 🎯 캡스톤: 7B는 왜 4GB인가. 워밍업의 질문에 스스로 답하는 졸업 시험 —
// 영수증 완독 + KV 캐시 정산(필수 소주제) + 용어 치환표(비유→실무 총회수).
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { NotebookCard } from '@series/ui'
import CapstoneReceiptLab from '@/components/CapstoneReceiptLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch11')
}

// 비유 → 실무 용어 치환표 (9부 총회수)
const GLOSSARY = [
  { fable: '눈금 있는 자 / 고무줄 자', real: '부동소수점 (floating point)', ch: '0·3장' },
  { fable: '눈금의 촘촘함', real: '정밀도 (precision, 가수 비트)', ch: '3장' },
  { fable: '자의 길이', real: '표현 범위 (dynamic range, 지수 비트)', ch: '3·5장' },
  { fable: '가장 가까운 눈금으로 / 티끌', real: '반올림 오차 (rounding error)', ch: '0·4장' },
  { fable: '삼킴 (큰 수 옆의 작은 수)', real: '흡수 (absorption)', ch: '0·4장' },
  { fable: '자의 끝 / 눈금 사이로 소멸', real: '오버플로 / 언더플로 (overflow / underflow)', ch: '5장' },
  { fable: 'log 세계로 이사', real: 'log 확률·log-sum-exp (max 빼기)', ch: '6장' },
  { fable: '반쪽 자 (촘촘·짧음 vs 성김·긺)', real: 'fp16 / bf16 (half precision)', ch: '7장' },
  { fable: '티끌 저금통 · 누적은 fp32', real: 'Kahan 합산 · 혼합 정밀도 (mixed precision)', ch: '4·7장' },
  { fable: '눈금 갈아타기 + 축척 스티커', real: '양자화 + 스케일 팩터 (quantization·scale)', ch: '8장' },
  { fable: '분단별 채점', real: '블록 양자화 (block-wise quantization)', ch: '9장' },
  { fable: '무릎', real: '스윗 스팟 (양자화 수확 체감점)', ch: '10장' },
  { fable: '숫자의 몸무게', real: '메모리 풋프린트 (memory footprint)', ch: '1·11장' },
  { fable: '대화의 기억 장부', real: 'KV 캐시 (KV cache)', ch: '11장' },
]
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">11장 · 🎯 캡스톤 — 졸업 시험</p>
    <h1 class="mb-4 text-3xl font-bold">7B는 왜 4GB인가</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      워밍업에서 0.1 + 0.2 가 0.3 이 아닌 걸 보고 출발했습니다 — 열한 장을 지나온 지금,
      그 작은 칸의 이야기가 "7B 모델이 왜 4GB 파일이 되고 내 노트북에서 돌아가는가"라는
      큰 질문의 답이 됩니다. 오늘은 새 개념이 없어요 — <b>배운 전부를 모아 영수증을 완독하고,
      내 PC 에 맞는 모델을 스스로 고르는</b> 졸업식입니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표 — 졸업 기준">
      ① 모델 영수증(개수 × 칸 = 파일)을 장 번호까지 짚으며 완독하고,
      ② <b>KV 캐시</b>(문맥이 길수록 자라는 기억 장부)까지 정산해 "파일이 들어간다 ≠
      돌아간다"를 계산으로 판정하고, ③ Ollama 라이브러리에서 <b>내 RAM 의 최선</b>을
      고를 수 있으면 — 졸업입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 영수증 완독 — 그리고 실행의 물류</h2>
    <p class="leading-relaxed text-slate-700">
      계산은 두 단계입니다. <b>파일</b>: 파라미터 수(1장 공식) × 실효 비트(3~9장) ÷ 8.
      <b>실행</b>: 거기에 <b>KV 캐시</b>를 더해야 해요 — 어텐션이 지금까지의 모든 토큰의
      K·V 벡터를 기억해 두는 장부라(4부의 그 K·V!), <b>토큰당 2 × 층수 × 차원 × 2바이트</b>씩,
      대화가 길수록 자랍니다. 직접 정산해 봅시다.
    </p>

    <CapstoneReceiptLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 4GB 의 완전한 답">
      <b>"7B는 왜 4GB인가"</b> — ① 7B = V·d + L·12d² ≈ 6.57B 개의 숫자(1장),
      ② 숫자 하나를 실효 4.85비트 칸에(3장의 구조 → 8장의 축척 → 9장의 블록·믹스),
      ③ 6.57B × 4.85 ÷ 8 = <b>4.0GB</b>, ④ 품질 대가는 퍼플렉시티 +1% 급(10장 무릎 위).
      그리고 <b>돌리려면</b> — 문맥 4K 기준 KV 약 2.1GB 와 고정 몫 1.5GB 를 더해
      총 7.6GB, 8GB PC 에서 <b>아슬하게 가능</b>. 문맥을 32K 로 늘리면 KV 만 17GB —
      <b>긴 문맥이 비싼 이유</b>까지가 오늘의 답입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="'파일이 RAM에 들어간다'와 '모델이 돌아간다'가 다른 이유는?"
      :choices="['실행에는 가중치 외에 문맥이 길수록 자라는 KV 캐시와 OS·실행기 몫이 더 필요하므로', '파일은 압축돼 있다가 실행 시 100배로 커지므로', '다르지 않다 — 파일만 들어가면 항상 돌아간다', 'RAM 이 아니라 하드디스크 용량이 문제라서']"
      :answer="0"
      :hints="['정산기에서 문맥 슬라이더만 움직였을 때 총 필요량이 어떻게 됐나요?']"
      explanation="가중치는 고정이지만 KV 캐시는 토큰당 0.5MB(7B급)씩 자랍니다 — 10장 어림 규칙의 '4GB 여유'가 바로 이 몫이었어요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 용어 치환표 — 비유를 실무 언어로 총회수</h2>
    <p class="mb-3 leading-relaxed text-slate-700">
      9부 내내 쓴 비유들의 실무 이름표를 한 표로 — 이제 모델 카드·기술 문서에서 오른쪽
      용어를 만나면, 왼쪽의 그림이 떠오를 겁니다.
    </p>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs text-slate-600">
        <thead>
          <tr class="border-b border-slate-200 text-slate-400">
            <th class="p-2 font-normal">9부의 비유</th>
            <th class="p-2 font-normal">실무 용어</th>
            <th class="p-2 font-normal">장</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in GLOSSARY" :key="g.fable" class="border-b border-slate-100">
            <td class="p-2 font-medium text-slate-700">{{ g.fable }}</td>
            <td class="p-2">{{ g.real }}</td>
            <td class="p-2 text-slate-400">{{ g.ch }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <DetailsCard title="➕ 더 깊이: GQA — KV 다이어트, 그리고 훈련의 몸무게">
      정산기의 KV 공식은 고전(멀티헤드 그대로) 기준입니다 — 최근 모델들은 <b>GQA</b>(grouped-query
      attention)로 여러 쿼리 헤드가 K·V 를 <b>공유</b>하게 해 KV 캐시를 4~8분의 1로 줄여요
      (같은 8GB 로 훨씬 긴 문맥이 도는 이유). 반대 방향의 몸무게도 이제 읽힙니다 — <b>훈련</b>은
      7장에서 본 대로 파라미터당 ≈16바이트(fp16 사본 + fp32 원본 + Adam 의 m·v + gradient)라
      7B 훈련에 ≈105GB — <b>추론(4GB)의 25배</b>. "파인튜닝은 클라우드, 추론은 내 PC"라는
      실무 구도의 산수가 이것입니다(살짝만 조련하는 LoRA — <PartLink :part="6" ch="ch8">6부
      8장</PartLink> — 가 사랑받는 이유이기도).
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 지금 이 튜터가 오늘의 수학입니다">
      시리즈 내내 오른쪽 아래에서 눌러 온 🤖 버튼 — 그 로컬 튜터의 실체가 정확히 오늘 완독한
      <b>양자화 GGUF 파일</b>입니다(Ollama 로 내려받은 q4 계열). 비용 0·데이터 유출 0 으로
      사내 PC 에서 도는 이유가 9부 전체의 수학이었던 거죠. 이로써 세 부작이 완성됩니다 —
      6부 "무엇을 배우게 할까", <PartLink :part="8" ch="ch11">8부</PartLink> "어떻게 잘 배우게
      할까", 그리고 9부 "<b>무엇으로 담고 계산하나</b>". <PartLink :part="4" ch="ch10">4부
      10장</PartLink>에서 조립한 기계의 설계도·훈련법·물류가 전부 여러분 손에 있습니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 졸업 시험 — 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 9부가 완결됩니다. 전 챕터 종합 — 계산기를 꺼내도 좋아요.
    </p>

    <QuizSet title="🎓 졸업 시험 — 7B는 왜 4GB인가 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="모델 파일 크기의 기본 공식은? (1장)"
        :choices="['파라미터 개수 × 숫자 하나의 실효 비트 ÷ 8', '층 수 × 어휘 수', '문맥 길이 × 2바이트', '훈련 시간 × GPU 수']"
        :answer="0"
        explanation="9부에서 가장 많이 쓴 한 줄 — 개수(1장)와 칸(3~9장)의 곱입니다."
      />
      <Quiz
        difficulty="easy"
        question="같은 7B 모델이라도 F16 파일과 Q4_K_M 파일은 크기가 3배 이상 다르다."
        type="truefalse"
        :answer="0"
        explanation="참입니다 — 13.1GB vs 4.0GB. 개수는 같고 칸(16비트 vs 실효 4.85비트)이 다르죠."
      />
      <Quiz
        difficulty="easy"
        question="q4_K_M 태그를 바르게 읽으면? (9장)"
        :choices="['4비트 양자화 · K-quants 2단 축척 · 중요 텐서 Medium 믹스', '4개의 모델을 합쳤다는 뜻', '한국(K)의 중형(M) 모델', '4GB 메모리 전용']"
        :answer="0"
        explanation="문패 문법 그대로 — Q숫자(비트)·K(축척의 축척)·S/M/L(믹스 정도)."
      />
      <StepQuiz
        difficulty="medium"
        question="우리 미니 모델(층 L = 4, 차원 d = 64, KV는 fp16 = 2바이트)의 KV 캐시를 정산하세요 — 토큰 1개당 몇 바이트?"
        :steps="[
          { lhs: 'K\\text{와 }V\\text{, 두 장부: } 2 \\times L = 2 \\times 4', answer: 8 },
          { lhs: '\\text{차원을 곱해: } 8 \\times 64', answer: 512 },
          { lhs: '\\text{fp16 두 바이트: } 512 \\times 2', answer: 1024 },
        ]"
        :hints="['층마다 K 하나 V 하나', '벡터 하나가 d 개의 숫자', '숫자 하나가 2바이트']"
        explanation="토큰당 1,024바이트 = 1KB — 7B급(L=32, d=4096)이면 같은 계산으로 0.5MB/토큰이 됩니다. 문맥 4K면 2.1GB!"
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="7B·Q4_K_M(4.0GB)을 8GB PC에서 돌리다 문맥을 8K로 늘렸더니 급격히 느려졌다. 정산은?"
        :choices="['가중치 4.0 + KV 8K×0.5MB ≈ 4.3 + 고정 1.5 = 9.8GB > 8GB — KV가 범인', '파일이 저절로 커졌다', '8K 문맥은 CPU를 두 배로 쓴다', '느려질 이유가 없다 — 착각이다']"
        :answer="0"
        :hints="['정산기에서 문맥 8,192로 올렸을 때 KV 줄이 몇 GB였나요?']"
        explanation="가중치는 그대로인데 기억 장부(KV)가 자란 겁니다 — RAM을 넘으면 디스크를 끌어 쓰며 급격히 느려져요."
      />
      <Quiz
        difficulty="medium"
        question="70B 모델을 Q4_K_M(실효 ≈4.85비트)으로 받으면 가중치만 약 몇 GB인가?"
        :choices="['약 42GB — 32GB PC로도 불가', '약 8GB', '약 70GB', '약 4GB — 7B와 같다']"
        :answer="0"
        :hints="['700억 × 4.85 ÷ 8 — 1장 공식에 9장 실효 비트.']"
        explanation="700억 × 4.85bit ÷ 8 ≈ 42.4GB. q4로 줄여도 70B는 서버급입니다 — 내 PC의 현실적 상한이 7B~13B인 이유."
      />
      <Quiz
        difficulty="medium"
        question="훈련이 추론보다 메모리를 훨씬 먹는 이유는? (7장 회수)"
        :choices="['파라미터당 fp16 사본 + fp32 원본 + Adam m·v + gradient ≈ 16바이트 — 추론(예: q4 0.6바이트)의 수십 배', '훈련은 파일을 두 번 내려받아서', '훈련 중엔 어휘가 10배로 늘어서', '차이가 없다']"
        :answer="0"
        explanation="혼합 정밀도의 분업(7장) 때문에 fp32 장부들이 따라붙습니다 — 7B 훈련 ≈105GB vs 추론 ≈4GB. LoRA(6부 8장)가 사랑받는 산수적 이유."
      />
      <Quiz
        difficulty="medium"
        question="Ollama 라이브러리에서 같은 모델의 q4_K_M 과 q8_0 중 고르는 합리적 기준은?"
        :choices="['RAM 여유(가중치+KV+고정 몫)가 되면 q8_0(무손실급), 빠듯하면 무릎 위의 q4_K_M', '무조건 파일이 큰 쪽이 좋다', '무조건 파일이 작은 쪽이 좋다', '알파벳 순서로 고른다']"
        :answer="0"
        explanation="10장 성적표 + 11장 정산의 종합 — 품질은 단조지만 무릎(4비트) 위에선 차이가 작으니, 예산(RAM) 안에서 최고 품질을 고르는 게 정석입니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="회사 노트북(RAM 16GB)으로 문맥 16K짜리 문서 요약봇을 돌리려 한다. 7B·Q4_K_M 기준 정산과 판단은?"
        :choices="['4.0(가중치) + 16K×0.5MB≈8.6(KV) + 1.5(고정) ≈ 14.1GB — 이론상 들어가지만 아슬. GQA 모델·문맥 축소 등을 검토', '어림도 없다 — 최소 128GB 필요', '문맥은 메모리와 무관하니 그냥 된다', '요약봇은 GPU 없이는 불가능하다']"
        :answer="0"
        :hints="['세 줄 정산 — 가중치, KV(16,384 × 0.5MB), 고정 몫.']"
        explanation="14.1GB/16GB — 켜지지만 다른 앱과 함께면 위험한 아슬 구간입니다. 실전에선 GQA 로 KV 가 훨씬 작은 최근 모델을 고르거나 문맥·양자화를 조정하죠 — 이 판단을 숫자로 하는 것이 졸업 실력."
      />
      <Quiz
        difficulty="hard"
        question="9부 전체를 관통한 한 문장으로 가장 알맞은 것은?"
        :choices="['숫자를 담는 자에는 눈금이 있다 — 눈금의 촘촘함이 품질과 몸무게를 정한다', '컴퓨터는 수학을 못 하므로 믿으면 안 된다', '메모리는 많을수록 무조건 좋다', '양자화는 마법이라 설명할 수 없다']"
        :answer="0"
        explanation="워밍업의 0.1 티끌부터 4GB 영수증까지 — 전부 '유한한 눈금'과 '눈금 고르기(비트 배분)'의 이야기였습니다. 핵심 한 줄, 이제 여러분의 것입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch11')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center"
    >
      <div class="mb-2 text-3xl">🎓</div>
      <p class="text-lg font-bold text-emerald-800">9부 수료 — 수치 계산 완주를 축하합니다!</p>
      <p class="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-emerald-700">
        0.1 + 0.2 의 티끌에서 출발해 비트·부동소수점·오차·log 세계·반쪽 자·양자화·GGUF 를 지나
        "7B는 왜 4GB인가"에 스스로 답했습니다. 이제 모델 카드의 fp16, Ollama 태그의 q4_K_M,
        파일 크기와 RAM 요구량이 전부 <b>계산으로 읽히는 눈</b>을 갖게 됐어요 —
        지금 이 페이지의 🤖 튜터가 바로 그 수학 위에서 돌고 있습니다.
      </p>
      <p class="mt-3 text-sm text-emerald-700">
        시리즈의 세 부작 완성 — 6부 "무엇을", 8부 "어떻게", 9부 "무엇으로".
        아직 안 봤다면 <PartLink :part="6" ch="ch1">6부(LLM 조련)</PartLink> 와
        <PartLink :part="8" ch="ch1">8부(최적화)</PartLink> 가 기다립니다.
      </p>
      <RouterLink
        to="/"
        class="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        🏠 목차로 — 완주 확인하기
      </RouterLink>
    </div>
  </article>
</template>
