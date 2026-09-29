<script setup lang="ts">
// ch10 — 품질 성적표: 양자화는 얼마나 잃나. 5부 7장의 퍼플렉시티가 열화를 재는 자로 —
// 무릎 곡선(열화 = KL ≥ 0)과 성적표 읽기·RAM 추천까지.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { MathBlock } from '@series/ui'
import { Quiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import QualityCurveLab from '@/components/QualityCurveLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch10')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">10장 · 압축: 칸 줄이기 ③</p>
    <h1 class="mb-4 text-3xl font-bold">품질 성적표 — 양자화는 얼마나 잃나</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      9장까지의 질문이 "얼마나 <b>줄일 수 있나</b>"였다면, 오늘은 "얼마나 <b>잃었나</b>"입니다.
      Q4_K_M 을 받을까 Q8_0 을 받을까? 감이 아니라 숫자가 필요하죠. 그 자는 이미 배웠습니다:
      <b>5부 7장의 퍼플렉시티</b>가 양자화의 성적표가 되어 돌아옵니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표">
      ① 미니 언어모델을 직접 양자화하며 <b>무릎 곡선</b>(8~4비트 거의 공짜 → 3비트부터
      오르막 → 2비트 폭등)을 측정하고, ② 그 열화의 정체가 <b>5부의 KL 발산(초과 비트)</b>임을
      확인하고, ③ 실전 성적표를 읽고 <b>내 RAM 의 최선</b>을 고르는 판단력을 얻습니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 다시 꺼낸 자: 퍼플렉시티를 다시 소개합니다</h2>
    <ReviewFlag id="ch10-s1" chapter="ch10" label="1. 다시 꺼낸 자: 퍼플렉시티를 다시 소개합니다" />
    <p class="leading-relaxed text-slate-700">
      5부 7장의 정의 그대로, 퍼플렉시티(PPL)는 <b>"평균 몇 갈래에서 고민하나"</b>,
      2^(평균 −log₂ p) 입니다. 양자화 열화 측정법은 단순해요: <b>같은 기준으로 전과 후를
      잰다.</b> 우리 실험은 원본(fp) 모델의 분포를 기준 진실로 놓고 양자화 모델을 채점하는데,
      이때 아름다운 일이 생깁니다:
    </p>
    <MathBlock expr="H(p_{\mathrm{fp}},\, p_q) \;=\; H(p_{\mathrm{fp}}) \;+\; D_{\mathrm{KL}}(p_{\mathrm{fp}} \,\|\, p_q)" />
    <p class="leading-relaxed text-slate-700">
      <b>5부 4장</b>의 분해식 그대로, 열화분이 정확히 <b>KL 발산(틀린 지도로 부호화한
      초과 비트, 5부 5장)</b>이라서, 열화는 절대 음수가 될 수 없습니다. 5부를 건너뛰었다면
      이렇게만 읽어도 충분해요. <b>H(p_fp, p_q)</b> = "원본 분포의 정답을 <b>양자화 모델의
      지도</b>로 맞히는 데 드는 평균 비용", <b>H(p_fp)</b> = "<b>완벽한 지도</b>를 썼을 때의
      최소 비용", 둘의 차이 <b>D_KL ≥ 0</b> = "지도가 틀린 만큼 매번 더 내는 초과 요금".
      양자화 = "지도를 거칠게 다시 그리기"이니, 초과 비트가 그 비용인 거죠. 직접 재 봅시다.
    </p>

    <QualityCurveLab />

    <ConceptCard tone="tip" title="핵심 관찰: 무릎이 곧 스윗 스팟이다">
      곡선의 모양이 모든 걸 말합니다. <b>16→4비트: 열화 +0.2% 이하(사실상 공짜), 3비트:
      +0.7%, 2비트: +8%.</b> 수확이 급감하는 꺾임점(무릎)이 4비트 근처에 있고, 실전 7B 급
      성적표(실험 ②)도 같은 무늬였죠(Q4_K_M +1.2%, Q2_K +28%). <b>국민 태그 q4_K_M 은
      우연이 아니라 이 무릎 위에 앉아 있는 것</b>. "칸을 반으로 줄일 때마다 품질이 반으로
      줄지는 않는다"는 게 양자화 경제학의 핵심입니다.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="양자화 열화를 재는 업계 표준 방법은?"
      :choices="['같은 평가 기준으로 양자화 전/후의 퍼플렉시티를 재서 비교한다', '파일 크기가 얼마나 줄었는지만 본다', '모델에게 &quot;당신 멍청해졌나요?&quot;라고 물어본다', '가중치 몇 개를 눈으로 훑어본다']"
      :answer="0"
      :hints="['5부 7장의 그 성적표는 무엇을 재는 자였죠?']"
      explanation="같은 자(평가 텍스트·토크나이저)로 전후를 재는 것이 핵심입니다. PPL 5.80 → 5.87 처럼요. 우리 toy 는 fp 분포 기준이라 열화 = KL 로 더 순수하게 떨어집니다."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 성적표의 언어: 용어 이름표</h2>
    <ReviewFlag id="ch10-s2" chapter="ch10" label="2. 성적표의 언어: 용어 이름표" />

    <ConceptCard tone="note" title="새 용어: 열화 / 무릎(스윗 스팟) / 성적표의 전제">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <b>열화</b> (degradation). 뜻: 압축으로 잃은 품질. 퍼플렉시티
          증가분(%)으로 보고합니다. fp 분포 기준으로 재면 그 값이 <b>KL 발산 ≥ 0</b>.
        </li>
        <li>
          <b>무릎</b> (knee). 읽는 법: 니. 뜻: 열화 곡선이 갑자기 가팔라지는 꺾임점.
          비용 대비 수확이 급감하기 직전의 <b>스윗 스팟</b>(sweet spot). 현세대 LLM 은
          4비트 근처(그래서 q4 가 기본값).
        </li>
        <li>
          <b>성적표의 전제</b>. 뜻: PPL 비교는 <b>같은 평가 텍스트·같은 토크나이저</b>일 때만
          성립합니다. 자가 다르면 눈금도 다르니까요. 다른 모델끼리의 PPL 직접 비교가
          위험한 이유이기도 합니다.
        </li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="실험 ①에서 int2 의 퍼플렉시티가 +8% 폭등한 미시적 이유는?"
      :choices="['로짓 눈금이 3개(−s, 0, +s)뿐이라 다음 글자 분포가 뭉개져, 정답에 주던 확률이 깎였기 때문', '2비트에서는 모델이 글자를 아예 못 읽기 때문', '평가 텍스트가 바뀌었기 때문', '퍼플렉시티 계산기에 버그가 있기 때문']"
      :answer="0"
      :hints="['분포 돋보기에서 int2 로 내렸을 때 주황 막대들이 어떻게 됐나요?']"
      explanation="돋보기에서 본 그대로예요. 미세한 확률 차이를 담을 눈금이 없어 분포가 계단처럼 뭉개집니다. 정답 확률 p 가 깎이면 −log₂ p 가 커지고, PPL(2^평균)이 뛰는 거죠."
    />

    <DetailsCard title="➕ 더 깊이: PPL 이 같아도 안심할 수 없는 이유, 그리고 imatrix">
      PPL 은 훌륭한 1차 성적표지만 만능은 아닙니다. ① 평가 텍스트의 <b>도메인</b>을 탑니다
      (일반 텍스트 PPL 은 멀쩡한데 코딩·수학처럼 정밀한 태스크만 무너지는 경우가 실제로
      보고됩니다). ② 작은 차이는 <b>오차범위</b> 문제입니다. 6부 9장에서 배운 그대로, 평가
      텍스트가 짧으면 ±노이즈가 열화보다 클 수 있어요. 그래서 실전은 PPL + 벤치마크 여러 개의
      다각 평가로 봅니다. 참고로 최신 양자화 도구들은 <b>imatrix</b>(importance matrix), 곧
      실제 텍스트를 흘려 보며 <b>어느 가중치가 출력에 민감한지</b> 재서 그쪽에 비트를 더 주는
      기법으로 같은 비트 예산에서 열화를 더 줄입니다. 9장 M 믹스의 정밀 조준판인 셈이죠.
    </DetailsCard>

    <ReviewFlag id="ch10-ai" chapter="ch10" label="🤖 AI 연결 · 다시 쓰는 수학: 5부 7장 · 6부 9장" />
    <ConceptCard tone="ai" title="🤖 AI 연결 · 다시 쓰는 수학: 5부 7장 · 6부 9장">
      <b><PartLink :part="5" ch="ch7">5부 7장</PartLink></b>에서 퍼플렉시티는 "LLM 의
      성적표"였고, 오늘은 <b>압축의 성적표</b>가 됐습니다. 같은 자의 두 번째 직업이에요.
      그리고 성적 읽기의 눈은 <b><PartLink :part="6" ch="ch9">6부 9장</PartLink></b>에서
      배운 그대로: 작은 차이는 오차범위를 의심하고, 한 숫자에 올인하지 않기.
      이제 모델 카드의 양자화 표("Q4_K_M: +0.05 PPL")가 읽히고, <b>내 RAM 에서 무엇을
      받을지</b>를 숫자로 결정할 수 있습니다. 마지막 관문(캡스톤)의 준비 완료.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 이 챕터가 완료됩니다. 난이도 순이니 편하게 시작하세요.
    </p>

    <QuizSet title="품질 성적표: 연습 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="퍼플렉시티(PPL)의 직관적 의미는? (5부 7장 복습)"
        :choices="['다음 토큰을 고를 때 평균 몇 갈래에서 고민하는가', '모델의 파라미터 개수', '초당 생성 토큰 수', '파일 크기의 단위']"
        :answer="0"
        explanation="2^(평균 −log₂ p). 낮을수록 확신 있는 모델입니다. 양자화 후 PPL 이 오르면 그만큼 고민이 늘었다는 뜻."
      />
      <Quiz
        difficulty="easy"
        question="퍼플렉시티는 낮을수록 좋다."
        type="truefalse"
        :answer="0"
        explanation="참입니다. 평균 고민 갈래 수니까요. 열화 보고서의 'PPL +0.07'은 나빠진 쪽입니다."
      />
      <Quiz
        difficulty="easy"
        question="실험 ①의 무릎 곡선에서 열화가 사실상 공짜였던 구간은?"
        :choices="['16 → 4비트 (+0.2% 이하)', '4 → 2비트', '전 구간 공짜다', '공짜 구간은 없다']"
        :answer="0"
        explanation="8~4비트 구간이 평평한 것이 무릎 곡선의 핵심이에요. 3비트부터 오르막, 2비트에서 +8% 폭등이었죠."
      />
      <Quiz
        difficulty="easy"
        question="현세대 LLM 양자화의 무릎(스윗 스팟)이 앉아 있는 비트 수는? (숫자로)"
        type="numeric"
        :answer="4"
        explanation="그래서 국민 태그가 q4_K_M 입니다. 크기는 1/4토막인데 열화는 1% 안팎."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="fp 분포를 기준으로 잰 열화가 절대 음수가 될 수 없는 이유는?"
        :choices="['열화분이 정확히 KL 발산(≥ 0)이기 때문: H(p,q) = H(p) + KL(p‖q)', '컴퓨터가 음수를 못 담기 때문', '반올림으로 우연히 좋아지는 일은 물리적으로 불가능하기 때문', '측정 코드가 음수를 버리기 때문']"
        :answer="0"
        :hints="['5부 4장의 분해식: 틀린 지도로 부호화한 비용은 최소 얼마?']"
        explanation="깁스 부등식이에요. 진짜 분포보다 잘 맞히는 지도는 없습니다. (참고로 코퍼스 텍스트로 다시 채점하면 예시용 모델에선 우연히 좋아 보이는 잔물결이 생길 수 있어요. 그래서 fp 기준 측정이 교육적으로 더 깨끗합니다.)"
      />
      <Quiz
        difficulty="medium"
        question="서로 다른 두 모델(다른 토크나이저)의 PPL 을 직접 비교하면 안 되는 이유는?"
        :choices="['토큰 단위가 다르면 &quot;한 걸음&quot;의 크기가 달라 같은 자로 잰 성적이 아니기 때문', 'PPL 은 모델마다 단위가 원(₩)이라서', '비교해도 되며 아무 문제 없다', '법으로 금지돼 있어서']"
        :answer="0"
        explanation="같은 텍스트라도 토큰 수가 다르면 '평균 고민'의 분모가 다릅니다. PPL 비교의 전제는 같은 평가 텍스트 + 같은 토크나이저. 양자화 전/후 비교가 딱 그 조건이라 유효한 거예요."
      />
      <Quiz
        difficulty="medium"
        question="성적표에서 Q8_0 과 F16 의 PPL 이 5.80 으로 같았다. 올바른 해석은?"
        :choices="['8비트 양자화의 열화는 이 측정의 해상도 아래. 사실상 무손실급이라 RAM 만 되면 이득', 'Q8_0 이 F16 보다 원본에 가깝다는 뜻', '측정 오류다. 양자화는 반드시 눈에 띄게 나빠진다', 'F16 파일이 잘못됐다는 뜻']"
        :answer="0"
        explanation="무릎 곡선의 평평한 구간입니다. 실측에서도 q8 열화는 소수점 둘째 자리 아래가 보통이에요. 그래서 실험 ② RAM 16GB 의 추천이 Q8_0 이었죠."
      />
      <Quiz
        difficulty="medium"
        question="PPL 열화 +0.01 을 보고 &quot;확실히 나빠졌다&quot;고 결론 내리기 전에 확인할 것은? (6부 9장 복습)"
        :choices="['오차범위: 평가 텍스트가 충분히 길었는지, 그 차이가 노이즈 범위 밖인지', '모델의 출시 연도', '파일 이름의 알파벳 순서', 'GPU 브랜드']"
        :answer="0"
        explanation="6부 9장의 교훈 그대로예요. 표본(평가 텍스트)이 짧으면 ±노이즈가 그보다 큽니다. 작은 차이는 판단 보류가 정답이에요."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="일반 텍스트 PPL 은 거의 안 변했는데 코딩 성능만 무너진 양자화 모델에 대한 가능한 설명은?"
        :choices="['PPL 은 평가 도메인을 탄다. 정밀한 태스크가 의존하는 소수 가중치·박빙 결정이 유독 깎였을 수 있어, 다각 평가가 필요하다', '불가능한 상황이다. PPL 이 같으면 모든 능력이 같다', '코드는 텍스트가 아니라서 양자화와 무관하다', 'GPU 가 코딩을 싫어해서다']"
        :answer="0"
        :hints="['더 깊이 카드: PPL 이 같아도 안심할 수 없는 이유 ①.']"
        explanation="한 숫자는 평균일 뿐입니다. 8장에서 본 '박빙 결정만 뒤집힌다'가 특정 태스크에 몰려 있으면 평균 PPL 에 안 드러나요. imatrix 처럼 민감한 가중치에 비트를 더 주는 기법이 나온 배경입니다."
      />
      <Quiz
        difficulty="hard"
        question="RAM 8GB PC 에 Q8_0(7.0GB)을 받았더니 실행이 안 되거나 극도로 느리다. 이유는?"
        :choices="['가중치 파일 외에 문맥(KV 캐시)·OS·실행기 몫이 더 필요한데 여유가 1GB 뿐이라서 어림 규칙(파일 + 4GB 여유)을 어겼다', 'Q8_0 은 8GB RAM 전용이 아니라서', '파일이 손상됐기 때문', 'RAM 이 아니라 모니터 해상도 문제']"
        :answer="0"
        :hints="['실험 ②의 어림 규칙: 왜 한도가 RAM − 4GB 였을까요?']"
        explanation="모델은 가중치만으로 돌지 않습니다. 대화가 길어질수록 자라는 KV 캐시와 OS·실행기 몫이 있어요. 그 정밀 정산이 바로 다음 장, 캡스톤의 첫 코스입니다."
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch10')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-xl font-bold text-emerald-700">✓</div>
      <p class="font-semibold text-emerald-800">10장 완료! 압축 편(8~10장) 끝!</p>
      <p class="mt-1 text-sm text-emerald-700">
        저장·계산·압축을 모두 정복했습니다. 남은 건 하나, 배운 전부를 모아
        "7B는 왜 4GB인가"에 스스로 답하고, 내 PC에 맞는 모델을 고르는 졸업 시험.
      </p>
      <RouterLink
        to="/ch/ch11"
        class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        🎯 11장: 캡스톤: 7B는 왜 4GB인가 →
      </RouterLink>
    </div>
  </article>
</template>
