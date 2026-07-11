<script setup lang="ts">
// 10장 — 지형의 함정들: 안장점과 평원. 고차원 임계점은 거의 다 안장점 — 그런데도 SGD가 통하는 이유.
// 회수하는 수학: 7부 4장(고차원 직관 뒤집힘) · 7부 5장(2D 슬라이스) · 1부 7장(고유값 = 방향별 곡률) · 3장(노이즈 순기능).
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import SaddleLab from '@/components/SaddleLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch10')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">10장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">지형의 함정들 — 안장점과 평원</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      1장에서 여행자의 공포는 <b>국소최소</b>였습니다 — 얕은 웅덩이에 갇혀 진짜 바닥인 줄 아는 것.
      그런데 수십억 차원의 진짜 산에 올라가 보면 반전이 기다립니다: <b>갇힐 웅덩이는 의외로
      드물고</b>, 대신 지형은 낯선 함정으로 가득해요 — 한쪽으로는 골짜기인데 다른 쪽으로는
      능선인 <b>말안장</b>. 오늘은 이 마지막 미스터리를 풀고, 그런데도 SGD가 통하는 이유까지
      확인합니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지를 가져갑니다 — ① <b>안장점</b>: 기울기 0의 새 얼굴(한 방향 골짜기 + 다른 방향 능선),
      ② <b>동전 논증</b>: 방향이 수십억 개면 임계점은 거의 다 안장점(국소최소는 모든 방향이
      + 여야 하니까), ③ 그런데도 되는 이유: <b>안장점엔 탈출구가 있고, SGD의 노이즈가 그리로
      밀어 준다</b> — 3장 순기능의 재회.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 기울기 0의 세 얼굴 — 임계점</h2>
    <p class="leading-relaxed text-slate-700">
      기울기가 정확히 0인 곳을 <b>임계점</b>이라 부릅니다. 골짜기 바닥(모든 방향이 위로 굽음)일
      수도, 산꼭대기(모든 방향이 아래로)일 수도 있지만 — 제3의 얼굴이 있어요. 말안장을
      떠올려 보세요: 말 등을 따라가는 방향으로는 <b>가장 낮은 점</b>인데, 옆구리 방향으로는
      <b>가장 높은 점</b>입니다. 기울기는 0인데 최소도 최대도 아닌 곳 — <b>안장점</b>이에요.
      여행자에게 왜 위험하냐고요? 발밑 기울기만 보는 여행자(1장)에겐 <b>바닥과 구분이 안
      되니까요.</b> 직접 확인해 보세요.
    </p>

    <SaddleLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 갇힘의 이유, 탈출의 이유">
      GD가 갇힌 건 우연이 아닙니다 — 능선 <b>정중앙</b>에서는 옆으로 미는 기울기 성분이 정확히
      0이라, 걸음(보폭 × 기울기)이 그쪽으로는 영원히 0이에요. 옆에 내리막이 있다는 걸 <b>수학적으로
      알 방법이 없습니다</b>(발밑 정보뿐이니). SGD가 탈출한 것도 우연이 아니에요 — 노이즈가
      능선 밖으로 살짝만 밀어 주면, 음(−)의 곡률 방향은 <b>스스로 굴러 내려가기 시작</b>합니다.
      얕은 웅덩이 탈출(3장)에 이어 노이즈의 순기능 두 번째 — 그리고 GD 곡선의 긴 평평 구간,
      <b>9장 평원 무늬의 정체 하나가 안장점 통과</b>였습니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="안장점이란?"
      :choices="['기울기는 0이지만 한 방향으로는 골짜기(+), 다른 방향으로는 능선(−)인 지점', '모든 방향이 위로 굽은 지점(골짜기 바닥)', '기울기가 가장 큰 지점', '손실이 가장 높은 지점']"
      :answer="0"
      :hints="['말안장 — 등 방향으론 최저, 옆구리 방향으론 최고.']"
      explanation="기울기 0의 제3의 얼굴 — 발밑 정보만 보는 여행자에겐 바닥과 구분되지 않는다는 것이 함정의 본질입니다."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="안장점이 국소최소보다 덜 무서운 이유는?"
      :choices="['내려가는 방향(−곡률)이 존재해서 — 살짝만 밀려나면 탈출이 시작된다 (노이즈·모멘텀이 그 역할)', '안장점은 손실이 항상 낮아서', '안장점에는 기울기가 커서', '덜 무섭지 않다 — 국소최소보다 위험하다']"
      :answer="0"
      :hints="['국소최소엔 탈출구가 없지만 안장점엔…?']"
      explanation="국소최소는 사방이 오르막(탈출 불가)이지만 안장점엔 내리막이 숨어 있습니다 — 갇힘이 아니라 지연의 함정이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 동전 세기 — 왜 고차원엔 안장점 천지인가</h2>
    <p class="leading-relaxed text-slate-700">
      임계점에서 방향마다 <b>위로 굽었나(+) 아래로 굽었나(−)</b>를 따질 수 있습니다 — 2장의
      곡률이 방향마다 하나씩 있는 셈이죠(이 방향별 곡률의 실무 이름이 1부 7장의 <b>고유값</b>입니다).
      국소최소가 되려면 <b>모든 방향이 +</b> 여야 해요. 방향별 부호를 반반 동전이라 치면:
    </p>
    <MathBlock expr="P(\text{모든 방향이 } +) \;=\; \left(\tfrac{1}{2}\right)^{W} \qquad (W = \text{방향 수} — \text{LLM은 수십억})" />
    <p class="mt-2 leading-relaxed text-slate-700">
      W = 2면 4분의 1이지만 W = 30이면 벌써 10억분의 1 — 수십억 차원에서는 <b>사실상 0</b>입니다.
      동전 수십억 개가 전부 앞면이길 바라는 것과 같아요. 7부에서 본 "고차원에서는 직관이
      뒤집힌다"의 최적화 버전: <b>저차원의 공포(웅덩이)는 사라지고, 고차원의 함정(안장)이 그
      자리를 채웁니다.</b> 실험 ②의 슬라이더로 확인해 보세요.
    </p>

    <ConceptCard tone="note" title="새 용어: 임계점 / 안장점 / 고유값">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>임계점</b> (critical point) — 읽는 법: 크리티컬 포인트.
          뜻: 기울기가 0인 모든 곳 — 최소·최대·안장점의 총칭. GD가 멈추는 후보지 전부.
        </li>
        <li>
          <b>안장점</b> (saddle point) — 읽는 법: 새들 포인트.
          뜻: 임계점인데 방향별 곡률 부호가 <b>섞인</b> 곳(+와 − 공존) — 갇힘이 아니라
          <b>지연</b>의 함정. 고차원 임계점의 대다수.
        </li>
        <li>
          <b>고유값</b> (eigenvalue) — 읽는 법: 아이겐밸류.
          뜻: 1부 7장의 그 고유값 — 임계점에서 <b>방향별 곡률</b>의 실무 이름. 이 곡률들을 담는
          행렬이 헤세 행렬(Hessian, 이름만). 전부 + 면 최소, 부호가 섞이면 안장.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">수십억 방향이 전부 골짜기이기는 어렵다 — 고차원의 함정은 갇히는 웅덩이가 아니라 느려지는 안장이고, 노이즈가 그 처방이다</p>
      <p class="mt-1 text-sm text-indigo-600">저차원의 직관(국소최소 공포)이 고차원에서 뒤집힙니다 — 7부 4장의 재회.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="완벽한 GD는 능선 정중앙에서 안장점에 계속 머물 수 있지만, SGD의 노이즈는 능선 밖으로 밀어내 탈출을 시작시킨다."
      type="truefalse"
      :answer="0"
      explanation="참 — 실험 ①에서 목격한 그대로입니다. 옆으로 미는 성분이 0인 GD와 달리, 노이즈는 대칭을 깨 주는 공짜 탈출 티켓이에요."
    />

    <DetailsCard title="➕ 더 깊이: 공평하지 않은 동전, 뉴턴법이 없는 이유, 2D 그림의 한계">
      정직한 주석 셋 — ① 실제 지형의 곡률 부호는 <b>공평한 동전이 아닙니다</b>: 손실이 낮은
      임계점일수록 + 비율이 높아지는 경향이 관찰돼요. 결론이 오히려 좋아집니다 — 깊은 곳에서
      만나는 임계점은 거의 진짜 최소(<b>나쁜 국소최소가 드문 이유</b>의 이론적 그림, 아직 완전한
      증명은 없는 현대 딥러닝의 미스터리). ② 방향별 곡률을 다 아는 <b>뉴턴법</b> 같은 2차
      방법이 LLM에 안 쓰이는 이유: 헤세 행렬이 수십억 × 수십억 — 저장조차 불가능합니다. 그래서
      1차(기울기) + 노이즈·모멘텀이 실전의 답. ③ 논문의 손실 지형 그림은 수십억 차원을 방향
      2개로 자른 <b>2D 슬라이스</b>(1장에서 예고, 7부 5장의 요약 기법) — 안장의 진짜 모습은
      슬라이스 방향에 따라 골짜기처럼 보일 수도 있어요. 그림은 지도이지 영토가 아닙니다.
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 7부 4장">
      <b><PartLink :part="7" ch="ch4">7부 4장</PartLink></b>에서 "고차원에서는 아무 두 벡터나 거의
      직교"라는 직관 뒤집힘을 배웠죠 — 오늘 그 뒤집힘의 최적화 버전을 봤습니다. 이로써 그림이
      완성돼요: <b>수십억 차원의 LLM 훈련이 SGD 따위(?)로 되는 이유</b> — 갇힐 웅덩이는 드물고,
      안장은 노이즈(3장)·모멘텀(4장)이 밀어 주고, 남는 문제(느림·스케일·일정)는 2~6장의 다이얼이
      해결하니까요. 훈련의 수학 전부가 연결됐습니다 — 남은 것은 단 하나, 진짜 설정 파일을 처음부터
      끝까지 읽어 내는 <b>졸업 시험(11장 캡스톤)</b>입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="안장점과 평원 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="임계점(critical point)이란?"
        :choices="['기울기가 0인 모든 곳 — 최소·최대·안장점의 총칭', '손실이 가장 낮은 곳만', '기울기가 가장 가파른 곳', '훈련이 시작되는 곳']"
        :answer="0"
        explanation="GD의 걸음 = 보폭 × 기울기이므로, 기울기 0인 곳은 전부 'GD가 멈출 수 있는 후보지'입니다 — 바닥이 아니어도요."
      />
      <Quiz
        difficulty="easy"
        question="말안장 지형에서 GD가 안장점 근처에서 아주 느려지는 이유는?"
        :choices="['기울기가 0에 가까워 걸음(보폭 × 기울기)이 티끌이 되므로', '보폭이 자동으로 줄어들므로', '노이즈가 커지므로', 'GPU가 느려지므로']"
        :answer="0"
        explanation="지형이 평평하면 걸음이 멈춥니다 — 손실 곡선에는 평원(9장 무늬)으로 찍혀요."
      />
      <Quiz
        difficulty="easy"
        question="임계점이 국소최소가 되기 위한 조건은?"
        :choices="['모든 방향의 곡률이 + (전부 위로 굽음)', '한 방향만 + 면 된다', '기울기가 크면 된다', '손실이 0이면 된다']"
        :answer="0"
        explanation="단 한 방향이라도 − 면 그리로 내려갈 수 있으니 안장점 — 이 '전부'라는 조건이 고차원에서 치명적으로 어려워집니다."
      />
      <Quiz
        difficulty="easy"
        question="안장점에는 내려가는 방향이 숨어 있어, 살짝만 밀려나면 탈출이 시작된다."
        type="truefalse"
        :answer="0"
        explanation="참 — 음(−)의 곡률 방향이 탈출구입니다. 국소최소(사방 오르막)와의 결정적 차이."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="방향별 곡률 부호를 반반 동전이라 할 때, 방향 2개 / 4개가 전부 + 일 확률을 구하세요."
        :steps="[
          { lhs: '(1/2)^{2}', answer: 0.25 },
          { lhs: '(1/2)^{4}', answer: 0.0625 },
        ]"
        :hints="['동전 2개 다 앞면 = 1/4.', '4개면 1/16 = 0.0625.']"
        explanation="방향이 4개만 돼도 16분의 1 — 수십억이면 사실상 0입니다. 고차원 임계점이 거의 전부 안장점인 이유."
      />
      <Quiz
        difficulty="medium"
        question="고차원(수십억 차원)에서 국소최소가 드문 이유는?"
        :choices="['국소최소는 모든 방향이 + 여야 하는데, 수십억 방향 전부 + 일 확률이 사실상 0이라서', '고차원에는 임계점 자체가 없어서', '고차원에서는 기울기가 항상 커서', '데이터가 많아서']"
        :answer="0"
        explanation="동전 논증 — 1장의 공포(웅덩이)가 고차원에서 뒤집히는 이유입니다(7부 4장의 직관 뒤집힘과 같은 계열)."
      />
      <Quiz
        difficulty="medium"
        question="SGD의 노이즈가 안장점 탈출을 돕는 원리는?"
        :choices="['능선 정중앙의 대칭을 깨 − 곡률 방향으로 밀어내면, 그 방향으로는 스스로 굴러 내려가기 시작하므로', '노이즈가 기울기를 크게 만들어서', '노이즈가 지형을 평평하게 만들어서', '노이즈가 보폭을 키워서']"
        :answer="0"
        explanation="3장(얕은 웅덩이 탈출)에 이은 노이즈 순기능 두 번째 — 흔들리는 나침반이 고차원에서 오히려 유리한 이유."
      />
      <Quiz
        difficulty="medium"
        question="임계점에서 '방향별 곡률'의 실무 이름은? (1부 7장 회수)"
        :choices="['헤세 행렬의 고유값 — 전부 + 면 최소, 부호가 섞이면 안장점', '노름', '내적', '행렬식']"
        :answer="0"
        explanation="1부 7장의 고유값이 여기서 회수됩니다 — 방향별 곡률들을 담은 행렬이 헤세(Hessian)이고 그 고유값 부호가 임계점의 얼굴을 정해요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="1장에서 여행자의 공포였던 국소최소 — 10장을 배운 뒤의 재평가로 옳은 것은?"
        :choices="['고차원에서 주 함정은 갇히는 웅덩이가 아니라 느려지는 안장·평원이고, 그마저 노이즈·모멘텀이 처방한다', '국소최소가 여전히 가장 큰 위협이다', '고차원에는 함정이 전혀 없다', '안장점은 탈출이 불가능하므로 국소최소보다 나쁘다']"
        :answer="0"
        :hints="['갇힘 vs 지연 — 어느 쪽이 처방 가능한 함정인가요?']"
        explanation="공포의 대상이 바뀌고(웅덩이 → 안장), 새 공포엔 이미 배운 처방(노이즈·모멘텀)이 듣습니다 — 수십억 차원 훈련이 되는 이유의 그림."
      />
      <Quiz
        difficulty="hard"
        question="논문에서 본 손실 지형 그림(2D)에 대한 올바른 태도는?"
        :choices="['수십억 차원을 방향 2개로 자른 슬라이스라, 안장이 골짜기처럼 보이는 등 왜곡이 가능함을 기억하고 본다', '지형의 완전한 실제 모습이므로 그대로 믿는다', '2D 그림은 전부 조작이므로 무시한다', '지형 그림은 4차원까지 그릴 수 있다']"
        :answer="0"
        :hints="['1장 더 깊이에서 예고 — 7부 5장의 요약 기법.']"
        explanation="그림은 지도이지 영토가 아닙니다 — 슬라이스 방향에 따라 임계점의 얼굴이 다르게 보일 수 있어요."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch10')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">10장 완료 — 지형의 마지막 미스터리까지 풀렸습니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다이얼(2~6장), 안전장치(7~8장), 계기판(9장), 지형(10장) — 훈련의 수학이 전부
        연결됐습니다. 이제 진짜 파인튜닝 설정 파일을 처음부터 끝까지 읽어 내는 졸업 시험만 남았어요.
      </p>
      <RouterLink
        to="/ch/ch11"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        11장 — 🎯 캡스톤, 파인튜닝 설정 완독 →
      </RouterLink>
    </div>
  </article>
</template>
