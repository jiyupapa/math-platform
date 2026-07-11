<script setup lang="ts">
// 9장 — 훈련 일지 판독법: 손실 곡선 읽기. 4대 증상(스파이크·평원·계단·벌어짐) 진단·처방 + gradient clipping.
// 회수하는 수학: 2~8장 전부(증상 → 어느 장의 다이얼) · 6부 9장(조련 성적표의 eval_loss 곡선) · 1부 2장(클리핑의 노름).
import { ConceptCard, PartLink } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import DiagnoseLab from '@/components/DiagnoseLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch9')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">9장 · 약 40분</p>
    <h1 class="mb-4 text-3xl font-bold">훈련 일지 판독법 — 손실 곡선 읽기</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      다이얼 상자(2~8장)가 다 찼습니다. 그런데 실전에서 당신이 보게 될 것은 지형도, 기울기도
      아니에요 — 화면에 그려지는 <b>손실 곡선 하나</b>가 전부입니다. 의사가 심전도를 읽듯,
      이 곡선의 무늬에서 훈련의 속사정을 읽어내는 것 — 그게 오늘 배울 기술입니다. 좋은 소식:
      곡선의 무늬는 몇 가지로 정해져 있고, <b>무늬마다 범인과 처방이 다릅니다.</b>
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      세 가지를 가져갑니다 — ① <b>4대 증상 도감</b>: 스파이크·평원·계단·벌어짐의 모양을 눈에
      새긴다, ② 진단의 규칙: <b>모양이 용의자를, 시점이 다이얼을 지목한다</b> — 각 증상이 앞
      장들의 어느 수학인지 연결, ③ 새 안전핀 <b>그래디언트 클리핑</b> — 설정 파일의 마지막 줄
      <code>max_grad_norm</code>이 읽히게.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 증상 도감 — 네 가지 무늬</h2>
    <p class="leading-relaxed text-slate-700">
      아래 네 곡선은 전부 우리가 앞 장들에서 만든 무대(이차 골짜기 SGD, 차수 9 훈련)에서 실제로
      돌린 훈련입니다. 탭을 넘기며 <b>모양 → 원인 → 처방</b>을 하나씩 확인하세요 — 특히 처방
      토글을 꼭 눌러 볼 것. 진단의 절반은 <b>개입해 보는 것</b>이니까요.
    </p>

    <DiagnoseLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 진단표 한 장">
      <b>⚡ 스파이크</b>: 순간 보폭×기울기가 경계(2장)를 넘음 — 이상치 배치·가파른 구간.
      처방: 클리핑·lr↓, <b>초반에만 몰리면 워밍업(6장)</b>. /
      <b>🏜️ 평원</b>: 보폭 과소(2장) 또는 지형 평원(1장) — lr을 올려 <b>개입해 보면 구분</b>됩니다. /
      <b>🪜 계단</b>: 병 아님 — 스텝 감쇠(6장)의 지문. 서성임 반경 ∝ 보폭. /
      <b>↔️ 벌어짐</b>: 과적합 시작(7장) — 조기 종료·weight decay·데이터(8장).
      결국 규칙은 하나 — <b>모양이 용의자를, 시점이 다이얼을 지목한다.</b>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="손실이 높은 값에서 평평합니다. 원인 후보 둘과 구분법은?"
      :choices="['보폭 과소 vs 지형 평원 — lr을 올려 개입해 보면 반응 여부로 구분된다', '과적합 vs 과소적합 — 검증 곡선으로 구분', '스파이크 vs 계단 — 무늬로 구분', '원인은 항상 데이터 부족 하나뿐']"
      :answer="0"
      :hints="['도감 평원 탭의 처방 토글 — 무엇을 확인했었죠?']"
      explanation="같은 평평함이라도 범인이 다릅니다 — 걸음(보폭×기울기)이 작아진 이유가 보폭인지 기울기인지. 진단의 절반은 개입 실험이에요."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 새 안전핀 — 그래디언트 클리핑</h2>
    <p class="leading-relaxed text-slate-700">
      스파이크의 보험이 <b>그래디언트 클리핑</b>입니다 — 기울기 벡터의 노름(1부의 그 길이!)이
      한계를 넘으면, <b>방향은 그대로 두고 크기만 한계까지 줄입니다</b>:
    </p>
    <MathBlock expr="g \;\leftarrow\; g \cdot \frac{\text{한계}}{\lVert g\rVert} \quad (\lVert g\rVert > \text{한계일 때만}) \qquad \text{설정: } \texttt{max\_grad\_norm}" />
    <p class="mt-2 leading-relaxed text-slate-700">
      이상치 배치가 아무리 사납게 우겨도 걸음의 크기가 잘리니, 골짜기를 건너뛰는 사고(2장 경계
      초과)가 원천 차단돼요. 방향 정보는 살아 있으니 학습은 계속되고요 — 그래서 실전 설정에
      <code>max_grad_norm: 1.0</code>이 거의 기본으로 들어갑니다.
    </p>

    <ConceptCard tone="note" title="새 용어: 손실 스파이크 / 그래디언트 클리핑 / 훈련 일지">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>손실 스파이크</b> (loss spike) — 읽는 법: 로스 스파이크.
          뜻: 손실이 순간 치솟는 봉우리 — 회복하면 경고, NaN으로 이어지면 사고(발산).
        </li>
        <li>
          <b>그래디언트 클리핑</b> (gradient clipping) — 읽는 법: 그래디언트 클리핑.
          뜻: 기울기 노름이 한계 초과 시 <b>방향은 유지, 크기만 절단</b> — 설정 파일의
          <code>max_grad_norm</code>. 스파이크·발산의 보험.
        </li>
        <li>
          <b>훈련 일지</b> (training log) — 읽는 법: 트레이닝 로그.
          뜻: 스텝마다 기록되는 <code>train_loss</code>·<code>eval_loss</code>(주기는
          <code>eval_steps</code>) — 실무 도구로는 wandb·TensorBoard가 이 곡선을 그려 줍니다.
        </li>
      </ul>
    </ConceptCard>

    <div class="my-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
      <p class="text-lg font-bold text-indigo-900">곡선의 모양이 용의자를, 증상의 시점이 다이얼을 지목한다</p>
      <p class="mt-1 text-sm text-indigo-600">스파이크는 보폭 사고, 평원은 굶주린 걸음, 계단은 일정표의 지문, 벌어짐은 암기의 시작.</p>
    </div>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="그래디언트 클리핑은 기울기의 방향을 바꾸지 않고 크기만 한계로 줄인다."
      type="truefalse"
      :answer="0"
      explanation="참 — g에 한계/‖g‖를 곱하는 것이라 방향(벡터의 비율)은 그대로입니다. 정보는 살리고 사고만 막는 안전핀."
    />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="스파이크가 훈련 초반 몇십 스텝에만 몰려 있다면 1순위로 살펴볼 다이얼은?"
      :choices="['워밍업(warmup_steps) — 초반 한정 증상엔 초반 한정 장치(6장의 규칙)', '에포크 수', 'weight decay', '배치 크기만 무조건 키운다']"
      :answer="0"
      :hints="['증상의 시점이 다이얼을 지목한다 — 초반 취약 구간의 보호 장치는?']"
      explanation="자(v̂) 예열 전 + 낯선 초기 지형(6장) — 초반 한정 스파이크의 전형입니다. 내내 나타나면 lr·클리핑 쪽."
    />

    <DetailsCard title="➕ 더 깊이: 로그 눈금, 스파이크의 등급, 판독 순서">
      실전 팁 셋 — ① <b>손실은 로그 눈금으로</b> 보세요: 0.1과 0.01의 차이(10배!)가 선형
      눈금에선 보이지 않습니다(도감의 곡선들도 로그였어요). ② <b>스파이크의 등급</b>: 몇 스텝 만에
      회복하면 관찰(이상치 배치 하나), 반복되면 개입(lr↓·클리핑), <b>NaN·inf가 찍히면 사고</b> —
      이미 발산(워밍업 골짜기의 무모이)한 것이라 되돌릴 수 없고, 체크포인트에서 lr 낮춰 재시작합니다.
      ③ <b>판독 순서</b>: 모양(4대 중 무엇?) → 시점(초반·중반·후반?) → 용의자(어느 장 다이얼?) →
      개입(하나만 바꿔 재실험). 한 번에 다이얼 하나 — 두 개를 같이 바꾸면 무엇이 통했는지 알 수
      없게 됩니다(3부의 통제 실험 감각).
    </DetailsCard>

    <ConceptCard tone="ai" title="🤖 AI 연결 — 회수하는 수학: 6부 9장">
      <b><PartLink :part="6" ch="ch9">6부 9장</PartLink></b>의 조련 성적표에서 eval 점수로 조련의
      성패를 판정했었죠 — 오늘은 그 점수의 <b>시간축 버전</b>(eval_loss 곡선)을 읽었습니다.
      실전 장면: 파인튜닝을 돌려 놓고 wandb 대시보드를 열면 이제 곡선이 <b>말을 겁니다</b> —
      "계단은 스케줄 무늬, 3에포크부터 벌어지니 조기 종료, 스텝 40의 스파이크는 회복했으니 관찰."
      설정 파일도 사실상 완독입니다: <code>max_grad_norm</code>까지 읽혔으니, 남은 것은 지형의
      마지막 미스터리(10장 안장점)와 졸업 시험(11장 캡스톤)뿐이에요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다.
    </p>

    <QuizSet title="훈련 일지 판독 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="손실 곡선에 갑자기 뾰족한 봉우리가 솟았습니다(그 후 회복). 1순위 용의자는?"
        :choices="['이상치 배치 또는 순간적인 경계(2/c) 초과 — 보폭 × 기울기의 사고', '과적합', '데이터 부족', '에포크 과다']"
        :answer="0"
        explanation="스파이크 = 걸음(보폭×기울기)이 순간 폭주한 흔적. 반복되면 lr↓ 또는 클리핑."
      />
      <Quiz
        difficulty="easy"
        question="train_loss는 계속 내려가는데 eval_loss가 중반부터 올라갑니다. 진단은?"
        :choices="['과적합 시작(벌어짐) — 조기 종료·weight decay·데이터 늘리기', '발산 — lr을 올린다', '정상 — 무시한다', '클리핑이 필요하다']"
        :answer="0"
        explanation="7장의 갈라짐 무늬 그대로 — 규칙 학습이 끝나고 암기가 시작된 신호입니다."
      />
      <Quiz
        difficulty="easy"
        question="일정한 간격으로 손실이 뚝, 뚝 내려앉는 계단 무늬 — 이것은?"
        :choices="['병이 아니라 스텝 감쇠 일정표의 정상 지문 — lr이 떨어질 때마다 서성임 반경도 준다', '심각한 버그의 신호', '과적합의 초기 증상', '데이터 오염의 증거']"
        :answer="0"
        explanation="6장에서 예고한 그 무늬 — lr 일정표를 겹쳐 보면 시점이 정확히 일치합니다."
      />
      <Quiz
        difficulty="easy"
        question="그래디언트 클리핑(max_grad_norm)이 하는 일은?"
        :choices="['기울기 노름이 한계를 넘으면 방향은 유지한 채 크기만 한계로 줄인다', '기울기를 0으로 만든다', '기울기의 방향을 반대로 뒤집는다', '학습률을 자동으로 올린다']"
        :answer="0"
        explanation="g × (한계/‖g‖) — 이상치 걸음의 크기만 자르는 안전핀. 정보(방향)는 살아 있습니다."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="기울기 g = (3, 4), max_grad_norm = 1.0입니다. 클리핑을 계산하세요."
        :steps="[
          { lhs: '\\lVert g\\rVert', answer: 5 },
          { lhs: '\\text{곱해질 배율} = 1/\\lVert g\\rVert', answer: 0.2 },
        ]"
        :hints="['1부의 그 노름 — √(3² + 4²).', '한계 1.0을 노름 5로 나눈 값이 배율.']"
        explanation="‖g‖ = 5 > 1.0이므로 배율 0.2를 곱해 (0.6, 0.8) — 노름은 정확히 1.0이 되고 방향(3:4)은 그대로입니다."
      />
      <Quiz
        difficulty="medium"
        question="손실이 높은 값에서 평평할 때, lr을 10배 올려 봤더니 즉시 쭉 내려갑니다. 범인은?"
        :choices="['보폭 과소(2장 소심이) — 기울기는 멀쩡했는데 걸음이 티끌이었다', '지형 평원 — 기울기 자체가 0이었다', '과적합', '이상치 배치']"
        :answer="0"
        explanation="개입에 반응했다 = 기울기는 살아 있었다는 뜻. 반응이 없었다면 지형 평원(10장) 쪽을 의심합니다."
      />
      <Quiz
        difficulty="medium"
        question="손실에 NaN이 찍혔습니다. 올바른 대응은?"
        :choices="['이미 발산한 사고 — 체크포인트에서 lr을 낮추고(+클리핑·워밍업 점검) 재시작한다', '그대로 두면 회복된다', '에포크를 늘린다', '검증 데이터를 늘린다']"
        :answer="0"
        explanation="NaN은 되돌릴 수 없는 폭발(워밍업 골짜기의 무모이)입니다 — 스파이크(회복 가능)와 등급이 달라요."
      />
      <Quiz
        difficulty="medium"
        question="진단 후 개입할 때 다이얼을 한 번에 하나만 바꾸는 이유는?"
        :choices="['두 개를 같이 바꾸면 무엇이 효과를 냈는지 알 수 없으므로 (통제 실험)', '두 개 이상 바꾸면 GPU가 느려지므로', '설정 파일이 한 줄만 수정되므로', '미신이다']"
        :answer="0"
        explanation="3부의 실험 감각이 여기서도 — 원인 규명은 변인 통제에서 나옵니다."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="스파이크가 ① 처음 50스텝에만 몰린 경우와 ② 훈련 내내 산발하는 경우, 처방이 어떻게 다른가?"
        :choices="['① 워밍업 연장(초반 한정 장치), ② lr 인하 또는 클리핑(상시 장치) — 증상의 시점이 다이얼을 고른다', '둘 다 무조건 에포크를 줄인다', '① 클리핑, ② 워밍업 — 시점과 무관하다', '둘 다 데이터를 늘린다']"
        :answer="0"
        :hints="['초반 한정 증상 ↔ 초반 한정 장치 — 6장의 규칙.']"
        explanation="같은 모양이라도 시점이 다르면 다이얼이 다릅니다 — 판독 순서(모양 → 시점 → 용의자 → 개입)의 핵심."
      />
      <Quiz
        difficulty="hard"
        question="wandb에서: train_loss 순조롭게 하강, eval_loss는 2에포크까지 하강 후 상승, 스텝 120에 회복된 스파이크 하나. 종합 진단과 처방은?"
        :choices="['주 진단은 과적합(벌어짐) — 조기 종료·weight decay, 스파이크는 회복했으니 관찰만', '주 진단은 발산 — 즉시 중단', '스파이크가 주 문제 — 클리핑만 넣으면 끝', '모든 다이얼을 동시에 바꾼다']"
        :answer="0"
        :hints="['회복한 스파이크 하나 = 경고 등급, 벌어짐 = 진행 중인 병.']"
        explanation="증상이 여럿이면 등급을 나눕니다 — 진행 중인 병(벌어짐)부터, 회복된 경고(스파이크)는 관찰. 한 번에 다이얼 하나."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch9')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">9장 완료 — 이제 곡선이 말을 겁니다!</p>
      <p class="mt-1 text-sm text-emerald-700">
        다이얼과 계기판을 모두 익혔습니다. 남은 미스터리는 지형 그 자체 —
        수십억 차원의 산에는 왜 갇힐 골짜기보다 안장점이 많은가, 그런데도 SGD는 왜 통하는가.
      </p>
      <RouterLink
        to="/ch/ch10"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        10장 — 지형의 함정들, 안장점과 평원 →
      </RouterLink>
    </div>
  </article>
</template>
