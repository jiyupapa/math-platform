<script setup lang="ts">
// Phase 5 · 선형변환 — 행렬이 공간(격자)을 바꾸는 함수
import { ConceptCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import GridTransform from '@/components/GridTransform.vue'
import ImageTransform from '@/components/ImageTransform.vue'
import Quiz from '@/components/Quiz.vue'
import StepQuiz from '@/components/StepQuiz.vue'
import QuizSet from '@/components/QuizSet.vue'
import NotebookCard from '@/components/NotebookCard.vue'
import ClassifierDemo from '@/components/ClassifierDemo.vue'
import ReviewFlag from '@/components/ReviewFlag.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch5')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 5</p>
    <h1 class="mb-4 text-3xl font-bold">선형변환 — 공간을 바꾸는 함수</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      지금까지 행렬을 "숫자 표"로 봤다면, 이제 <b>행렬 = 공간을 통째로 변형하는 기계</b>로 봅니다.
      이게 선형대수의 진짜 핵심이고, <b>신경망이 데이터를 다루는 방식</b> 그 자체예요.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      <ul class="list-disc space-y-1 pl-5">
        <li>행렬이 <b>격자(공간)를 변형하는 함수</b>임을 눈으로 본다</li>
        <li><b>행렬의 열 = 기저벡터가 가는 곳</b>이라는 핵심을 안다</li>
        <li><b>회전·확대·전단·반사</b> 네 가지 변환을 구분한다</li>
        <li>행렬 × 벡터가 곧 <b>변환을 적용</b>하는 것임을 안다</li>
      </ul>
    </ConceptCard>

    <!-- 1. 선형변환이란 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">1. 행렬은 공간을 바꾸는 함수다</h2>
    <ReviewFlag id="ch5-s1" chapter="ch5" label="1. 행렬은 공간을 바꾸는 함수다" />
    <p class="leading-relaxed text-slate-700">
      함수는 "입력을 넣으면 출력이 나오는 기계"죠. <b>선형변환</b>은 <b>벡터를 넣으면 다른 벡터가 나오는</b> 함수인데,
      그 변환을 <b>행렬 하나</b>가 담당합니다. 평면 전체로 보면 <b>격자가 통째로 기울거나 늘어나는</b> 거예요.
      (단, 직선은 직선으로 남아요 — 구부러지지 않습니다.)
    </p>

    <ConceptCard tone="tip" title="🤔 그런데, 선형변환을 왜 할까?">
      <p class="mb-2">"할 수 있다"보다 <b>"왜 하느냐"</b>가 중요하죠. 크게 네 가지 이유가 있어요.</p>
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>① 모양을 마음대로 바꾸려고</b> — 회전·확대·기울이기·뒤집기. 우리가 화면에서 보는 변형이 다 이거예요.
          <b>사진 편집</b>(회전·확대), <b>게임·3D 그래픽</b>(캐릭터·카메라 돌리기)이 매 순간 하는 게 행렬 곱입니다.
        </li>
        <li>
          <b>② 데이터를 '다루기 쉬운 모양'으로 정렬하려고</b> 🤖 — <b>AI에서 진짜 중요한 이유</b>.
          데이터가 비스듬히·뒤엉켜 흩어져 있으면 분석이 어려워요. 회전·확대로 <b>중요한 방향으로 쫙 펴주면</b> 다루기 쉬워집니다.
          신경망의 각 층(<MathBlock inline expr="W\vec{x}" />, W=가중치 행렬·x=입력 벡터)이 바로 이 정렬을 해요.
          <span class="text-slate-500">(흐트러진 책상을 각 잡아 정리하면 물건 찾기 쉬워지는 것과 같아요.)</span>
        </li>
        <li>
          <b>③ '더 좋은 관점(축)'으로 보려고</b> — 같은 데이터도 <b>어느 축에서 보느냐</b>에 따라 본질이 잘 보이기도, 안 보이기도 해요.
          <b>PCA</b>(뒤 챕터)는 데이터가 가장 넓게 퍼진 방향으로 축을 <b>회전</b>시킨 뒤 덜 중요한 축을 버려 <b>차원을 줄입니다</b>.
          즉 변환 = "데이터를 가장 잘 설명하는 시점으로 카메라를 돌리기".
        </li>
        <li>
          <b>④ 행렬 하나로, 대량으로, 빠르게 되니까</b> — 아무리 복잡한 변환도 회전·확대·전단의 <b>조합</b>이고, 그게 <b>행렬 하나</b>로 표현돼요.
          그래서 점 하나든 <b>수백만 개든</b> 같은 행렬로 한꺼번에 변환 → GPU로 초고속.
        </li>
      </ul>
      <p class="mt-2 text-sm text-slate-600">
        <b>한 줄 요약:</b> 선형변환은 <b>공간·데이터를 원하는 모양으로 바꾸는 도구</b>예요.
        그래픽에선 "회전·확대", AI에선 "데이터를 잘 나뉘게 정렬 + 좋은 축으로 보기" — 그걸 행렬 하나로 대량·고속 처리하려고 씁니다.
      </p>
    </ConceptCard>

    <ConceptCard tone="note" title="새 용어 — 선형변환 & 기저벡터">
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <b>선형변환(linear transformation)</b>: 공간을 변형하되 <b>① 직선은 그대로 직선</b>, <b>② 원점은 제자리</b>,
          <b>③ 격자 간격은 일정</b>하게 유지하는 변환. (휘거나 찢어지지 않음)
        </li>
        <li>
          <b>기저벡터(basis vector)</b>: 공간을 짓는 <b>기준이 되는 두 화살표</b>.
          <MathBlock inline expr="\hat{\imath} = (1, 0)" /> ("이 햇", 가로 방향 한 칸),
          <MathBlock inline expr="\hat{\jmath} = (0, 1)" /> ("제이 햇", 세로 방향 한 칸).
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="tip" title="기저벡터, 좀 더 자세히 — 모든 벡터를 짓는 '레고 블록'">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>이름 뜻</b>: '기저(基底)'는 <b>바탕·토대</b>라는 한자예요. 공간의 모든 벡터를 만들어내는 <b>기본 재료</b>라는 뜻.
        </li>
        <li>
          <b>모자(햇) 기호 <MathBlock inline expr="\hat{\;}" /></b>: 글자 위 작은 <b>^</b> 는 "<b>길이가 딱 1인 기준 벡터</b>(단위벡터)"라는 표시예요.
          그래서 <MathBlock inline expr="\hat{\imath}" /> 는 가로로 1칸, <MathBlock inline expr="\hat{\jmath}" /> 는 세로로 1칸짜리 화살표.
        </li>
        <li>
          <b>모든 벡터 = 이 둘의 조합</b>: 어떤 벡터든 "î 몇 개 + ĵ 몇 개"로 만들 수 있어요. 예를 들어:
          <MathBlock expr="(3, 2) = 3\,\hat{\imath} + 2\,\hat{\jmath}" />
          오른쪽으로 <b>3칸(3î)</b> 간 다음 위로 <b>2칸(2ĵ)</b> 올라간 것. 즉 <b>좌표 (3, 2)의 진짜 뜻</b>이 바로 이거예요.
          일반적으로 <MathBlock inline expr="(x, y) = x\,\hat{\imath} + y\,\hat{\jmath}" />.
        </li>
        <li>
          <b>그래서 변환에서 왜 핵심?</b> 변환이 <b>î, ĵ 를 어디로 보내는지만</b> 정하면, 나머지 모든 벡터는
          "<b>변환된 î 몇 개 + 변환된 ĵ 몇 개</b>"로 자동으로 따라가요. (조합 비율이 그대로 유지되니까)
          그래서 <b>행렬의 두 열(= î, ĵ 의 행선지)만으로 변환 전체가 정해집니다.</b> ← 2번 섹션의 핵심!
        </li>
      </ul>
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      아래에서 행렬 슬라이더를 움직여 보세요. <b>옅은 회색 = 원래 격자</b>, <b>파란 격자 = 변환된 모습</b>,
      <b style="color:#10b981">초록 화살표 î</b> 와 <b style="color:#ec4899">분홍 화살표 ĵ</b> 가 어디로 가는지 보세요.
    </p>

    <GridTransform />

    <ConceptCard tone="note" title="🧩 잠깐 — 격자선이 왜 절대 휘지 않을까? (같은 걸음의 비밀)">
      <p class="mb-2">
        방금 격자를 아무리 움직여도 <b>격자선이 휘지 않고 반듯</b>했죠? 여기가
        <b>'선형(線形 — 선 모양)'</b>이라는 이름의 정체예요. 늘리고 기울여도 <b>직선은 절대 휘지 않는</b> 이유를,
        <b>'걸음'</b>으로 생각하면 한 번에 이해돼요.
      </p>
      <ul class="mb-3 list-disc space-y-2 pl-5">
        <li>
          <b>① 직선 = 같은 걸음의 반복</b>. 직선이란 결국 <b>한 곳에서 출발해 같은 방향·같은 보폭으로 계속 걸어간 발자국</b>이에요.
          발자국 사이 간격(걸음 <MathBlock inline expr="\vec{d}" />)이 처음부터 끝까지 <b>전부 똑같으니까</b> 반듯한 거죠.
        </li>
        <li>
          <b>② 선형변환은 '모든 걸음'을 똑같은 규칙으로 바꾼다</b>. 변환을 거치면 걸음도 바뀌는데,
          <b>어느 걸음이든 똑같은 하나의 규칙</b>으로 바뀌어요. 그래서 바뀐 걸음들도 <b>여전히 전부 똑같습니다</b>.
          보폭이 커지거나(늘어남) 방향이 틀어질 순(기울어짐) 있어도, <b>걸음끼리 서로 달라지진 않아요.</b>
          <span class="text-slate-500">(그 "똑같은 규칙"의 정체는 잠시 뒤 4번 섹션에서 — 걸음에 행렬을 곱하는 거예요!)</span>
        </li>
        <li>
          <b>③ 그래서 여전히 일직선</b>. 걸음이 다 똑같으니 발자국은 다시 반듯하게 늘어섭니다.
          <b>휘어지려면 걸음마다 방향이 조금씩 달라져야</b> 하는데, 선형변환은 그걸 절대 안 하거든요. (그게 '선형'의 약속)
        </li>
      </ul>

      <div class="mb-2 flex flex-wrap items-end justify-center gap-4 overflow-x-auto rounded-lg bg-white/60 p-3">
        <!-- 원래 직선 -->
        <figure class="text-center">
          <svg viewBox="0 0 150 100" width="150" height="100" role="img" aria-label="원래 직선: 같은 간격 점들">
            <polyline points="15,50 135,50" fill="none" stroke="#cbd5e1" stroke-width="2" />
            <g fill="#6366f1">
              <circle cx="15" cy="50" r="4" /><circle cx="45" cy="50" r="4" />
              <circle cx="75" cy="50" r="4" /><circle cx="105" cy="50" r="4" /><circle cx="135" cy="50" r="4" />
            </g>
          </svg>
          <figcaption class="text-xs text-slate-500">원래 직선<br />(같은 간격 발자국)</figcaption>
        </figure>

        <div class="pb-6 text-2xl text-slate-400" aria-hidden="true">→</div>

        <!-- 선형변환 후: 늘고 기울어도 직선 -->
        <figure class="text-center">
          <svg viewBox="0 0 150 100" width="150" height="100" role="img" aria-label="선형변환 후: 늘고 기울어도 여전히 직선">
            <polyline points="15,80 135,25" fill="none" stroke="#10b981" stroke-width="2" />
            <g fill="#059669">
              <circle cx="15" cy="80" r="4" /><circle cx="45" cy="66" r="4" />
              <circle cx="75" cy="52" r="4" /><circle cx="105" cy="39" r="4" /><circle cx="135" cy="25" r="4" />
            </g>
          </svg>
          <figcaption class="text-xs font-semibold text-emerald-700">✅ 선형변환<br />늘고 기울어도 <b>직선</b></figcaption>
        </figure>

        <!-- 금지: 휘어짐 -->
        <figure class="text-center">
          <svg viewBox="0 0 150 100" width="150" height="100" role="img" aria-label="휘어짐: 선형변환이 아님">
            <path d="M15,78 Q75,35 135,72" fill="none" stroke="#fda4af" stroke-width="2" />
            <g fill="#e11d48">
              <circle cx="15" cy="78" r="4" /><circle cx="45" cy="61.5" r="4" />
              <circle cx="75" cy="55" r="4" /><circle cx="105" cy="58.5" r="4" /><circle cx="135" cy="72" r="4" />
            </g>
            <text x="75" y="20" text-anchor="middle" font-size="20" fill="#e11d48">✕</text>
          </svg>
          <figcaption class="text-xs font-semibold text-rose-600">❌ 휘어짐<br />= 선형변환 아님</figcaption>
        </figure>
      </div>

      <p class="text-sm text-slate-600">
        💡 <b>한 줄 요약:</b> 선형변환은 <b>공간의 모든 곳을 똑같은 규칙으로</b> 바꿔요.
        그래서 늘어나거나 기울 순 있어도 — <b>직선이 중간에 휘는 일은 없습니다.</b>
      </p>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="선형변환을 해도 원점 (0,0) 은 항상 제자리에 있다."
      type="truefalse"
      :answer="0"
      explanation="참. 원점 고정은 선형변환의 핵심 성질이에요. (원점까지 옮기는 변환은 '아핀변환'이라는 다른 이름으로 불러요 — 선형변환 + 평행이동. 이름만 알아두면 충분합니다.)"
    />

    <!-- 2. 핵심: 열 = 기저벡터가 가는 곳 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">2. 핵심 — 행렬의 열 = 기저벡터가 가는 곳</h2>
    <ReviewFlag id="ch5-s2" chapter="ch5" label="2. 행렬의 열 = 기저벡터가 가는 곳" />
    <p class="leading-relaxed text-slate-700">
      선형변환의 <b>모든 정보</b>는 "기저벡터 둘이 어디로 가느냐"에 담겨 있어요. 그리고 그게 바로 <b>행렬의 두 열</b>입니다.
    </p>
    <MathBlock
      expr="A = \begin{bmatrix} a & b \\ c & d \end{bmatrix} \quad\Rightarrow\quad \hat{\imath} \to \begin{bmatrix} a \\ c \end{bmatrix},\;\; \hat{\jmath} \to \begin{bmatrix} b \\ d \end{bmatrix}"
    />

    <ConceptCard tone="tip" title="왜 그럴까? — 직접 곱해보면">
      <p class="mb-2 rounded bg-slate-50 p-2 text-sm text-slate-500">
        🔁 잠깐 복습: <b>행렬 × 벡터</b>는 ch3에서 배운 "각 행과 벡터를 짝지어 곱해서 더하기"예요.
      </p>
      <p class="mb-2">
        <MathBlock inline expr="\hat{\imath} = (1, 0)" /> 에 행렬을 곱하면 <b>첫째 열</b>이 그대로 나와요:
      </p>
      <MathBlock
        expr="\begin{bmatrix} a & b \\ c & d \end{bmatrix}\begin{bmatrix} 1 \\ 0 \end{bmatrix} = \begin{bmatrix} a\cdot 1 + b\cdot 0 \\ c\cdot 1 + d\cdot 0 \end{bmatrix} = \begin{bmatrix} a \\ c \end{bmatrix}"
      />
      <p class="mb-2">
        마찬가지로 <MathBlock inline expr="\hat{\jmath} = (0, 1)" /> 을 곱하면 <b>둘째 열</b> <MathBlock inline expr="(b, d)" /> 가 나옵니다.
      </p>
      <p class="mb-2 text-sm">
        🔢 숫자로 보면 더 쉬워요. <MathBlock inline expr="\begin{bmatrix} 2 & 0 \\ 0 & 3 \end{bmatrix}" /> 이면
        <b>î → (2, 0)</b>(첫째 열), <b>ĵ → (0, 3)</b>(둘째 열). 즉 가로 2배·세로 3배 변환!
      </p>
      <p class="text-sm text-slate-500">
        💡 그래서 "행렬을 읽는다" = "기저벡터 î, ĵ 가 각각 어디로 가는지 읽는다" 예요. 위 인터랙티브의 두 화살표가 바로 그거!
      </p>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="행렬 [[2,0],[0,3]] 의 첫째 열 (2,0) 은 무엇을 뜻할까요?"
      :choices="['î=(1,0) 가 (2,0) 으로 간다', 'ĵ=(0,1) 가 (2,0) 으로 간다', '원점이 (2,0) 으로 간다']"
      :answer="0"
      :hints="['첫째 열은 î 가 도착하는 곳입니다.']"
      explanation="첫째 열 = î 의 도착지. (2,0) 이므로 가로 방향이 2배로 늘어납니다."
    />

    <!-- 3. 변환의 종류 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">3. 변환의 네 가지 종류</h2>
    <ReviewFlag id="ch5-s3" chapter="ch5" label="3. 변환의 네 가지 종류" />
    <p class="leading-relaxed text-slate-700">
      위 인터랙티브의 프리셋 버튼으로 하나씩 눌러보며 비교해 보세요.
    </p>
    <ConceptCard tone="note" title="대표 변환들">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>확대/축소(스케일)</b>: <MathBlock inline expr="\begin{bmatrix} 2 & 0 \\ 0 & 2 \end{bmatrix}" />
          — 대각선 숫자가 가로·세로 배율. 2면 2배로 커져요.
        </li>
        <li>
          <b>회전</b>: <MathBlock inline expr="\begin{bmatrix} 0 & -1 \\ 1 & 0 \end{bmatrix}" />
          — 격자를 통째로 돌립니다. (이건 90° 반시계 회전)
        </li>
        <li>
          <b>전단(shear, 밀기)</b>: <MathBlock inline expr="\begin{bmatrix} 1 & 1 \\ 0 & 1 \end{bmatrix}" />
          — 위쪽을 옆으로 밀어 평행사변형으로. (책을 비스듬히 미는 느낌)
        </li>
        <li>
          <b>반사(뒤집기)</b>: <MathBlock inline expr="\begin{bmatrix} -1 & 0 \\ 0 & 1 \end{bmatrix}" />
          — 거울처럼 좌우를 뒤집어요.
        </li>
      </ul>
    </ConceptCard>

    <p class="leading-relaxed text-slate-700">
      방금 본 네 변환을 <b>격자가 아니라 실제 이미지</b>에 걸어보면 더 와닿아요. 사진 편집·게임 화면이 매 순간 하는 일이죠.
    </p>
    <ImageTransform />

    <ConceptCard tone="tip" title="전단(밀기), 좀 더 자세히 — 📚 책 더미 밀기">
      <p class="mb-2">
        전단은 <b>높이에 비례해 한쪽으로 밀어내는</b> 변환이에요. <b>밑은 그대로, 위로 갈수록 더 많이 밀려서</b> 직사각형이 비스듬한 평행사변형이 됩니다.
      </p>
      <ul class="mb-2 list-disc space-y-1 pl-5 text-sm">
        <li>📚 <b>쌓인 책/종이 더미</b>를 위에서 옆으로 슬쩍 밀면, 맨 아래는 그대로인데 위로 갈수록 더 밀려 비스듬해지죠 — 그게 전단이에요.</li>
        <li><b>높이(세로)는 안 변하고, 가로 위치만</b> 높이에 비례해 이동합니다. 넓이도 그대로예요(왜 그런지는 잠시 뒤 '넓이 배율' 카드에서).</li>
      </ul>
      <p class="mb-1 text-sm">
        행렬 <MathBlock inline expr="\begin{bmatrix} 1 & 1 \\ 0 & 1 \end{bmatrix}" /> 은 <MathBlock inline expr="(x, y) \to (x + y,\; y)" /> — y(높이)가 클수록 x가 더 밀려요:
      </p>
      <div class="mb-1 overflow-x-auto">
        <table class="text-sm">
          <thead>
            <tr class="text-slate-500">
              <th class="px-3 py-1 text-left">점</th>
              <th class="px-3 py-1 text-left">변환 후</th>
              <th class="px-3 py-1 text-left">설명</th>
            </tr>
          </thead>
          <tbody class="font-mono">
            <tr><td class="px-3 py-0.5">(1, 0)</td><td class="px-3 py-0.5">(1, 0)</td><td class="px-3 py-0.5">밑변은 안 움직임</td></tr>
            <tr><td class="px-3 py-0.5">(0, 1)</td><td class="px-3 py-0.5 font-semibold text-indigo-600">(1, 1)</td><td class="px-3 py-0.5">높이 1 → 오른쪽 1</td></tr>
            <tr><td class="px-3 py-0.5">(0, 2)</td><td class="px-3 py-0.5 font-semibold text-indigo-600">(2, 2)</td><td class="px-3 py-0.5">높이 2 → 오른쪽 2 (더 많이!)</td></tr>
          </tbody>
        </table>
      </div>
      <p class="text-sm text-slate-500">
        💡 이름 뜻: 전단(剪斷)은 "층이 서로 어긋나 미끄러지는 힘"(공학의 전단력)에서 왔어요. AI에선 글씨 기울이기(이탤릭), 이미지를 살짝 기울여 학습 데이터 늘리기에 씁니다.
      </p>
    </ConceptCard>

    <ConceptCard tone="tip" title="덤 — 넓이 배율(det) 미리보기">
      <p class="mb-2">
        인터랙티브의 <b>파란 평행사변형</b>은 단위 정사각형(넓이 1)이 변환된 모습이에요.
        그 <b>넓이 = 행렬식(det)의 크기</b> (부호를 뗀 값 — <b>|det|</b> 라 씁니다) — 즉 det는 <b>"변환이 넓이를 몇 배로 바꾸는지"</b> 알려주는 숫자입니다.
      </p>
      <div class="mb-2 overflow-x-auto">
        <table class="text-sm">
          <thead>
            <tr class="text-slate-500">
              <th class="px-3 py-1 text-left">det 값</th>
              <th class="px-3 py-1 text-left">넓이 변화</th>
              <th class="px-3 py-1 text-left">예</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="px-3 py-1 font-mono">2</td><td class="px-3 py-1">2배로 커짐</td><td class="px-3 py-1">확대</td></tr>
            <tr><td class="px-3 py-1 font-mono">1</td><td class="px-3 py-1">그대로 (안 변함)</td><td class="px-3 py-1">회전·전단</td></tr>
            <tr><td class="px-3 py-1 font-mono">0.5</td><td class="px-3 py-1">절반으로 줄어듦</td><td class="px-3 py-1">축소</td></tr>
            <tr><td class="px-3 py-1 font-mono text-rose-600">0</td><td class="px-3 py-1 text-rose-600">납작하게 찌부러짐 (직선·점)</td><td class="px-3 py-1">납작</td></tr>
            <tr><td class="px-3 py-1 font-mono">−1</td><td class="px-3 py-1">넓이는 1배인데 뒤집힘</td><td class="px-3 py-1">반사</td></tr>
          </tbody>
        </table>
      </div>
      <p class="mb-2 text-sm">
        🤔 <b>전단이 넓이를 안 바꾸는 이유</b> (전단 카드에서 한 약속): 전단은 도형을 비스듬히 밀 뿐
        <b>밑변도 높이도 그대로</b>예요. 평행사변형 넓이 = 밑변 × 높이 이므로, 모양은 기울어도 넓이는 그대로(det=1)!
      </p>
      <p class="text-sm text-slate-500">
        💡 <b>|det| = 넓이 배율</b>, <b>부호 = 방향(음수면 뒤집힘)</b>. 계산법과 "det=0이면 되돌릴 수 없다(역행렬)"는 <b>다음 챕터(행렬식·역행렬)</b>에서 제대로 다뤄요.
      </p>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="전단(shear) 변환은 직선을 휘어진 곡선으로 바꾼다."
      type="truefalse"
      :answer="1"
      explanation="거짓. 선형변환은 어떤 경우든 직선을 직선으로 유지해요. 전단은 직선을 기울일 뿐입니다."
    />

    <!-- 4. 행렬 × 벡터 = 변환 적용 -->
    <h2 class="mt-8 mb-2 text-xl font-bold">4. 행렬 × 벡터 = 변환을 적용하는 것</h2>
    <ReviewFlag id="ch5-s4" chapter="ch5" label="4. 행렬 × 벡터 = 변환을 적용하는 것" />
    <p class="leading-relaxed text-slate-700">
      어떤 벡터에 변환을 적용하려면, 앞 챕터에서 배운 <b>행렬 × 벡터</b>를 하면 돼요. 결과가 <b>변환된 벡터</b>입니다.
    </p>
    <MathBlock
      expr="\begin{bmatrix} a & b \\ c & d \end{bmatrix}\begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} ax + by \\ cx + dy \end{bmatrix}"
    />
    <p class="leading-relaxed text-slate-700">
      예를 들어 90° 회전 <MathBlock inline expr="\begin{bmatrix} 0 & -1 \\ 1 & 0 \end{bmatrix}" /> 을 점
      <MathBlock inline expr="(1, 0)" /> 에 적용하면 <MathBlock inline expr="(0, 1)" /> 으로 갑니다 — 정말 90° 돌았죠.
    </p>

    <!-- 5. AI 연결 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">🤖 신경망의 한 층 = 선형변환</h2>
    <ReviewFlag id="ch5-ai" chapter="ch5" label="🤖 신경망의 한 층 = 선형변환" />
    <ConceptCard tone="goal" title="AI에서 선형변환이 쓰이는 곳">
      <ul class="list-disc space-y-2 pl-5">
        <li>
          <b>신경망 층 = Wx</b>: 인공신경망에서 데이터가 한 층을 지날 때 하는 핵심 계산이
          <b>가중치 행렬 W로 입력 x를 변환</b>하는 일(<MathBlock inline expr="W\vec{x}" />)이에요. 바로 선형변환!
        </li>
        <li>
          <b>특징 공간 바꾸기</b>: AI는 데이터를 <b>더 잘 구분되는 모양으로 변환</b>합니다.
          뒤엉켜 안 나뉘던 데이터도, 적절히 회전·확대하면 직선 하나로 나뉘게 만들 수 있어요.
        </li>
        <li>
          <b>층을 쌓는다 = 변환을 잇는다</b>: 신경망은 변환(행렬 곱)을 여러 겹 쌓아요.
          딥러닝의 "깊다"가 바로 이 뜻이에요 — 그런데 여기엔 반전이 하나 있습니다. (바로 아래 카드!)
        </li>
      </ul>
    </ConceptCard>

    <ConceptCard tone="tip" title="🤔 반전 — 행렬곱을 아무리 쌓아도 결국 행렬 하나 아닌가요?">
      <p class="mb-2">
        눈치채셨다면 날카로운 겁니다. 그리고 <b>맞아요.</b> ch3의 행렬곱 그대로, 두 층을 연달아 적용하면:
      </p>
      <MathBlock expr="W_2(W_1\vec{x}) = (W_2 W_1)\,\vec{x} = M\vec{x} \qquad (M = W_2 W_1 \text{ — 이것도 그냥 행렬 하나})" />
      <p class="mb-2 text-sm text-slate-500">
        괄호를 옮겨 묶어도 되는 건 숫자 곱셈과 같아요 — (2×3)×4 = 2×(3×4).
        행렬곱은 <b>순서</b>를 바꾸는 건 안 되지만, <b>묶는 위치</b>는 자유입니다.
      </p>
      <p class="mb-2">
        즉 <b>선형변환만으로는 100층을 쌓아도, 곱해서 만든 행렬 하나짜리 1층과 완전히 같습니다.</b>
        직선이 아무리 변환을 거쳐도 직선이듯(이 챕터의 '같은 걸음' 카드!), 선형끼리는 아무리
        겹쳐도 선형 하나일 뿐이에요.
      </p>
      <p class="mb-2">
        그래서 진짜 신경망은 층과 층 <b>사이에 결과를 살짝 '구부리는' 단계</b>를 끼워 넣습니다 —
        이게 <b>비선형 활성화(activation, 액티베이션)</b>의 존재 이유예요. 구부리는 단계가 끼면
        행렬곱이 하나로 접히지 못해서, 층을 쌓을수록 <b>진짜로 표현력이 늘어납니다</b>.
      </p>
      <p class="text-sm text-slate-500">
        💡 정리: <b>선형변환(행렬) = 신경망의 뼈대, 비선형 활성화 = 층 사이의 관절</b>.
        "딥"러닝의 깊이가 의미 있는 건 이 관절 덕분이에요. (활성화 함수의 종류·계산은 이 과정
        밖 — 여기선 '왜 필요한지'만 챙기면 충분합니다)
      </p>
    </ConceptCard>

    <ClassifierDemo />

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="신경망에서 데이터가 한 층을 지날 때의 핵심 계산은 '가중치 행렬로 입력을 변환(Wx)'하는 선형변환이다."
      type="truefalse"
      :answer="0"
      explanation="참. 그래서 행렬·선형변환이 AI의 뼈대예요. (보통 그 뒤에 결과를 살짝 '구부리는' 단계가 하나 따라붙는데, 이걸 비선형 활성화라 불러요 — 지금은 이름만 알아두면 충분합니다)"
    />

    <!-- 5. 연습 -->
    <h2 class="mt-10 mb-2 text-xl font-bold">5. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      객관식 · 참/거짓 · 숫자입력 · 단계별 계산 10문제. <b>모두 맞히면 챕터 완료!</b>
    </p>

    <QuizSet title="선형변환 — 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="선형변환은 원점을 옮기지 않는다."
        type="truefalse"
        :answer="0"
        explanation="참. 원점은 항상 제자리입니다."
      />
      <Quiz
        difficulty="easy"
        question="행렬 [[2,0],[0,2]] 가 하는 일은?"
        :choices="['2배 확대', '90° 회전', '전단(밀기)', '좌우 반사']"
        :answer="0"
        explanation="대각선이 2, 2 이므로 가로·세로 모두 2배로 커집니다."
      />
      <Quiz
        difficulty="easy"
        question="행렬의 첫째 열은 기저벡터 î=(1,0) 이 도착하는 위치다."
        type="truefalse"
        :answer="0"
        explanation="참. 첫째 열 = î 의 행선지, 둘째 열 = ĵ 의 행선지."
      />
      <Quiz
        difficulty="easy"
        question="아무것도 바꾸지 않는 행렬 [[1,0],[0,1]] 을 점 (5, 7) 에 적용하면 x 값은?"
        type="numeric"
        :answer="5"
        :hints="['항등행렬은 아무것도 바꾸지 않아요.']"
        explanation="항등변환이라 (5,7) 그대로. x=5."
      />
      <!-- 보통 -->
      <StepQuiz
        difficulty="medium"
        question="확대 [[2,0],[0,3]] 을 벡터 (1, 1) 에 적용하세요. (행 × 벡터)"
        :steps="[
          { lhs: '2 \\times 1 + 0 \\times 1', answer: 2 },
          { lhs: '0 \\times 1 + 3 \\times 1', answer: 3 },
        ]"
        :hints="['첫째 행 [2 0] 과 (1,1) 의 내적, 그다음 둘째 행 [0 3].']"
        explanation="(2, 3). 가로 2배, 세로 3배."
      />
      <Quiz
        difficulty="medium"
        question="90° 반시계 회전 행렬은 다음 중?"
        :choices="['[[0,-1],[1,0]]', '[[1,0],[0,1]]', '[[2,0],[0,2]]', '[[1,1],[0,1]]']"
        :answer="0"
        :hints="['î=(1,0) 이 (0,1) 로, ĵ=(0,1) 이 (−1,0) 로 가야 합니다.']"
        explanation="[[0,-1],[1,0]] 의 열이 (0,1) 과 (−1,0) → 90° 회전."
      />
      <Quiz
        difficulty="medium"
        question="행렬 [[1,0],[0,1]] (아무것도 안 바꾸는 그 행렬) 의 둘째 열 (0,1) 은 ĵ 의 도착지다."
        type="truefalse"
        :answer="0"
        explanation="참. ĵ 가 그대로 (0,1) 에 머뭅니다."
      />
      <Quiz
        difficulty="medium"
        question="다음 중 '전단(shear)' 변환 행렬은?"
        :choices="['[[1,1],[0,1]]', '[[2,0],[0,2]]', '[[-1,0],[0,1]]', '[[0,-1],[1,0]]']"
        :answer="0"
        :hints="['전단은 한쪽을 옆으로 미는 변환 — 대각선은 1, 한쪽 비대각이 0이 아님.']"
        explanation="[[1,1],[0,1]] 은 위쪽을 오른쪽으로 미는 전단입니다."
      />
      <!-- 어려움 -->
      <StepQuiz
        difficulty="hard"
        question="전단 [[1,1],[0,1]] 을 벡터 (2, 3) 에 적용하세요."
        :steps="[
          { lhs: '1 \\times 2 + 1 \\times 3', answer: 5 },
          { lhs: '0 \\times 2 + 1 \\times 3', answer: 3 },
        ]"
        :hints="['첫째 행 [1 1] 과 (2,3): 1×2+1×3.', '둘째 행 [0 1] 과 (2,3): 0×2+1×3.']"
        explanation="(5, 3). 세로 높이(3)는 그대로, 가로만 밀렸어요."
      />
      <StepQuiz
        difficulty="hard"
        question="90° 회전 [[0,-1],[1,0]] 을 벡터 (1, 0) 에 적용하세요."
        :steps="[
          { lhs: '0 \\times 1 + (-1) \\times 0', answer: 0 },
          { lhs: '1 \\times 1 + 0 \\times 0', answer: 1 },
        ]"
        :hints="['첫째 행 [0 −1] 과 (1,0).', '둘째 행 [1 0] 과 (1,0).']"
        explanation="(0, 1). 오른쪽을 보던 화살표가 위를 보게 — 90° 회전!"
      />
    </QuizSet>

    <NotebookCard />

    <ConceptCard tone="tip" title="🐍 Python으로도 해보기">
      <code>notebooks/ch05_linear_transformations.ipynb</code> 에서 변환 행렬을 격자에 적용해
      회전·확대·전단의 before/after 를 직접 그려봅니다.
    </ConceptCard>

    <div
      v-if="progress.isDone('ch5')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-600">✓</div>
      <p class="font-semibold text-emerald-800">Phase 5 완료. 행렬을 '공간을 바꾸는 함수'로 보게 되었습니다.</p>
      <p class="mt-1 text-sm text-emerald-700">다음은 그 변환이 넓이를 얼마나 바꾸는지 — 행렬식과 역행렬입니다.</p>
      <RouterLink
        to="/ch/ch6"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        다음 챕터 — 행렬식과 역행렬 →
      </RouterLink>
    </div>
  </article>
</template>
