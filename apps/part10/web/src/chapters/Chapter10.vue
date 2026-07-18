<script setup lang="ts">
// 10장 — 🎯 캡스톤: AI 뉴스 팩트체크. 새 개념 없이 1~9장 총조립 — 졸업 시험.
import { ConceptCard, PartLink, ReviewFlag } from '@series/ui'
import { DetailsCard } from '@series/ui'
import { Quiz } from '@series/ui'
import { StepQuiz } from '@series/ui'
import { QuizSet } from '@series/ui'
import { NotebookCard } from '@series/ui'
import CapstoneAuditLab from '@/components/CapstoneAuditLab.vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

function onSetComplete() {
  progress.markDone('ch10')
}
</script>

<template>
  <article>
    <p class="mb-1 text-sm font-medium text-indigo-600">Phase 10 · 🎯 캡스톤</p>
    <h1 class="mb-4 text-3xl font-bold">AI 뉴스 팩트체크</h1>
    <p class="mb-2 leading-relaxed text-slate-600">
      졸업 시험입니다 — <b>새 개념은 없습니다.</b> 워밍업의 단톡방으로 돌아가죠.
      이번엔 진짜(같은 가상의) 보도자료가 통째로 올라왔습니다. 스펙, 1위 등극, 수학 창발,
      대전 승률까지. 10부에서 모은 도구 전부를 꺼내 이 발표를 <b>감정</b>하고,
      도입 여부의 결론을 스스로 내립니다.
    </p>

    <ConceptCard tone="goal" title="이 챕터의 목표 — 졸업 기준">
      발표문을 읽고 ① 스케일링 주장을 <b>C≈6ND로 검산</b>하고 ② 점수 차이를 <b>오차범위·
      쌍대·p값</b>으로 판정하고 ③ 급등을 <b>지표·오염</b>으로 감정하고 ④ 심판을 <b>편향
      체크리스트</b>로 감정해서 — <b>최종 판정서</b>를 쓸 수 있으면 졸업입니다.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">1. 감정 실습 — 검산대 4곳</h2>
    <ReviewFlag id="ch10-s1" chapter="ch10" label="1. 감정 실습 — 검산대 4곳" />
    <p class="leading-relaxed text-slate-700">
      기사 속 밑줄 친 주장 4개를 각각의 검산대에서 감정합니다. 힌트 없이 먼저 스스로
      예상해 보세요 — 어느 주장이 통과하고, 어느 주장이 걸릴까요?
    </p>

    <CapstoneAuditLab />

    <ConceptCard tone="tip" title="핵심 관찰 — 발표는 거짓말 없이도 오해를 판다">
      주목할 점: 이 발표에 <b>수치 조작은 하나도 없습니다.</b> 40B·1.2T·5일은 검산과
      일치했고, 71.2점도 91점도 55%도 실제 측정값이에요. 문제는 <b>해석</b> — 오차범위 안의
      0.8점을 "1위 등극"으로, 오염된 시험의 +33점을 "창발"로, 감정 안 된 심판의 55%를
      "승리"로 <b>포장</b>한 것. 그래서 팩트체크의 질문은 "숫자가 맞나"가 아니라
      <b>"숫자가 그 결론을 지지하나"</b>입니다. 그 차이를 아는 것이 10부가 기른 눈이에요.
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <StepQuiz
      question="검산대 ①의 예산 검산 — 테라-1(N=40B, D=1.2T)의 훈련 예산 C ≈ 6·N·D 를 단계별로. (C = 2.88×10²³ 꼴)"
      :steps="[
        { lhs: '6 \\times 40 \\times 1.2 = ?', answer: 288 },
        { lhs: '10^{9} \\times 10^{12} = 10^{?}', answer: 21 },
        { lhs: 'C = 2.88 \\times 10^{?}\\ \\text{FLOPs}', answer: 23 },
      ]"
      explanation="288×10²¹ = 2.88×10²³. 여기서 GPU-일(÷1.56×10¹⁴÷86,400 ≈ 21,368일)로 가면 '4,000장 5일' 주장까지 검산됩니다 — 1장의 도구 그대로."
    />

    <h2 class="mt-8 mb-2 text-xl font-bold">2. 졸업 체크리스트 — 지갑에 넣어 가세요</h2>
    <ReviewFlag id="ch10-s2" chapter="ch10" label="2. 졸업 체크리스트 — 지갑에 넣어 가세요" />

    <ConceptCard tone="note" title="AI 발표 팩트체크 카드 (10부 요약)">
      <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li><b>스펙 검산</b> — C ≈ 6·N·D, GPU-일 환산, 토큰/파라미터 비율(황금비 20 기준 어느 쪽 설계인가) — 1·4장.</li>
        <li><b>점수 차이</b> — 문항 수 → ±(냅킨 98/√n) → 겹치면 쌍대·p값 요구; 유의해도 효과 크기 따로 — 6·7장.</li>
        <li><b>급등 주장</b> — 지표가 전부-정답형인가(5장), 불균형 급등·변형판 낙차·공개일 vs 컷오프·암송(8장).</li>
        <li><b>심판</b> — AI 심판인가? 선수와 가족인가? 위치 무작위화·사람 일치율 보고? 판 수와 ±? — 9장.</li>
        <li><b>공통</b> — 전체 결과 공개 요구(다중 비교), "숫자가 결론을 지지하는가"를 물을 것.</li>
      </ul>
    </ConceptCard>

    <p class="mt-6 mb-1 text-sm font-semibold text-slate-500">🔎 잠깐 확인!</p>
    <Quiz
      question="이 발표에서 유일하게 검산을 통과한 주장은?"
      :choices="['① 예산·배분 — C=2.88×10²³, 4,000장 5.3일, 비율 30:1 전부 일치', '② 0.8점 차 1위', '③ 수학 창발 +33점', '④ 대전 승률 55%']"
      :answer="0"
      explanation="스펙·예산은 산수가 맞았습니다. 나머지 셋은 조작이 아니라 해석의 문제 — 오차범위 안(②), 오염 의심(③), 표본·심판 문제(④)로 각각 걸렸죠."
    />

    <DetailsCard title="➕ 더 깊이: 판정서를 실무 언어로 옮기면">
      회사에서 이 감정 결과를 보고한다면 이렇게 됩니다 — <i>"테라-1의 종합 성능은 현재 자료
      기준 누리-7과 통계적으로 구분되지 않습니다(0.8점 차, 95% 구간 겹침). 수학 +33점은
      3년 된 공개 벤치마크의 변형판 낙차(91→64)로 볼 때 오염 가능성이 높아 실질 개선은
      +6점 수준으로 추정됩니다. 자체 대전 승률 55%는 표본 200판(±6.9%p)과 자사 심판 문제로
      증거력이 없습니다. 도입 재검토 조건: 신선한 홀드아웃 채점, 같은 문항 쌍대 비교(p값),
      독립 심판+사람 일치율, 전체 벤치마크 공개."</i> — 숫자에 근거해 정중하고 단호한,
      10부가 목표로 한 바로 그 문장들입니다.
    </DetailsCard>

    <ReviewFlag id="ch10-ai" chapter="ch10" label="🤖 AI 연결 — 이 눈은 시리즈 전체의 완성이다" />
    <ConceptCard tone="ai" title="🤖 AI 연결 — 이 눈은 시리즈 전체의 완성이다">
      10부의 팩트체크는 시리즈 전체 위에 서 있습니다 — 손실과 훈련은
      <b><PartLink :part="4" ch="ch11">4부 11장</PartLink></b>과 8부가, 평가의 기본기는
      <b><PartLink :part="6" ch="ch9">6부 9장</PartLink></b>이, 모델의 몸무게와 배포는
      9부가, 그리고 "심화"로 미뤄뒀던 3부 후반(신뢰구간·p값·상관)은 이 부에서 전부
      회수됐습니다. 질문 사슬의 완성 — 6부 "무엇을 배우게 할까" · 8부 "어떻게 잘" ·
      9부 "무엇으로 담나" · <b>10부 "얼마나 키우고, 정말 좋아졌나"</b>. 이제 새 모델
      뉴스가 떠도 두렵지 않을 겁니다 — 계산할 수 있으니까요.
    </ConceptCard>

    <h2 class="mt-8 mb-2 text-xl font-bold">3. 졸업 시험 — 직접 풀어보기</h2>
    <p class="mb-2 leading-relaxed text-slate-700">
      <b>10문제를 모두 맞히면</b> 10부가 완결됩니다. 전 챕터의 도구가 골고루 나옵니다.
    </p>

    <QuizSet title="🎯 캡스톤 — AI 뉴스 팩트체크 10문제" @completed="onSetComplete">
      <!-- 쉬움 -->
      <Quiz
        difficulty="easy"
        question="테라-1의 토큰/파라미터 비율(1.2T ÷ 40B)과 그 해석은?"
        :choices="['30:1 — 황금비(20) 근처, 서빙을 약간 고려한 합리적 배분', '3:1 — 심한 과체격', '300:1 — 극단적 서빙 최적화', '계산 불가']"
        :answer="0"
        explanation="1,200÷40 = 30. 4장의 눈 — 비율 하나로 설계 의도(훈련 최적 근처 + 배포 고려)까지 읽힙니다."
      />
      <Quiz
        difficulty="easy"
        question="0.8점 차 '1위 등극' 주장이 걸린 검산은?"
        :choices="['n=2,000의 오차범위 ±2.0%p — 두 구간이 크게 겹쳐 단정 불가', '예산 검산 불일치', '창발 지표 문제', 'GPU 수 거짓말']"
        :answer="0"
        explanation="6장의 냅킨 계산 — 0.8점은 ±2.0의 한참 안입니다. 워밍업의 '2점 차이의 진실'이 졸업 시험에서 그대로 재현됐어요."
      />
      <Quiz
        difficulty="easy"
        question="수학 '창발' 주장을 무너뜨린 결정적 증거는?"
        :choices="['변형판(숫자·표현 교체) 점수 64점 — 원본 91점과 27점 낙차', '점수가 너무 낮아서', 'GPU가 부족해서', '문항 수가 많아서']"
        :answer="0"
        explanation="암기가 통하지 않는 시험에서 27점이 증발 — 8장의 오염 지문입니다. 정직한 실력은 64점대(+6점 개선)로 추정되죠."
      />
      <Quiz
        difficulty="easy"
        question="이 발표의 수치들은 조작이 아니었다. 그런데도 감정이 필요한 이유는?"
        :choices="['문제는 숫자가 아니라 해석 — 숫자가 그 결론(1위·창발·승리)을 지지하는지가 관건이라서', '모든 발표는 거짓이라서', '숫자가 크면 무조건 의심해야 해서', '감정은 형식적 절차라서']"
        :answer="0"
        explanation="측정값 자체는 진짜였습니다 — 오차범위 안의 차이, 오염된 시험, 미감정 심판을 결론으로 포장한 것이 문제죠. '숫자가 결론을 지지하나'가 팩트체크의 진짜 질문입니다."
      />
      <!-- 보통 -->
      <Quiz
        difficulty="medium"
        question="검산대 ①에서 'A100 4,000장 약 5일' 주장을 검증한 계산 사슬은?"
        :choices="['C=6ND=2.88×10²³ → ÷(A100 실효 1.56×10¹⁴/초) → 21,368 GPU-일 → ÷4,000장 ≈ 5.3일 ✓', '40B×5일=200B', '1.2T÷4,000=300M', '검증 불가능한 주장이다']"
        :answer="0"
        explanation="1장의 도구 그대로 — 스펙 세 숫자(N·D·GPU)가 서로 맞물리는지 확인하는 겁니다. 맞물리면 신뢰가 쌓이고, 안 맞으면 그것부터 물어야죠."
      />
      <Quiz
        difficulty="medium"
        question="대전 승률 55%(200판)가 '이중 보류'인 이유 둘은?"
        :choices="['±6.9%p 구간이 반반(50%)을 포함(z=1.41) + 심판이 자사 형제 모델(자기 선호 미감정)', '승률이 낮아서 + 판이 많아서', '심판이 사람이라서 + 문항이 어려워서', '보류가 아니라 확정이다']"
        :answer="0"
        explanation="소음 문제(6장: 98/√200≈6.9)와 편향 문제(9장: 자기 선호·위치 무작위화 미언급)가 겹쳤습니다 — 어느 하나만 해결해도 부족해요."
      />
      <Quiz
        difficulty="medium"
        question="'수리-500, 정답 전부 일치만 인정' — 이 채점 방식이 창발 서사에 기여했을 가능성은? (5장)"
        :choices="['전부-정답형(비선형) 지표는 매끈한 개선도 계단처럼 보이게 한다 — 부분 점수로 다시 그려 봐야', '채점 방식은 곡선 모양과 무관하다', '전부-정답이 가장 공정한 지표다', '지표가 매끈하면 창발이 확정된다']"
        :answer="0"
        explanation="5장의 착시 계단 — 오염(8장)과 별개로, 지표 자체가 급변 서사를 만들 수 있습니다. 두 검산은 서로 보완이에요."
      />
      <Quiz
        difficulty="medium"
        question="변형판 64점을 근거로 한 '정직한 실력 추정'의 논리는?"
        :choices="['변형판은 암기가 통하지 않는 시험이라 실력만 남는다 — 전 세대 58점 대비 +6점의 착실한 개선', '변형판 점수는 항상 틀린 값이다', '원본과 변형판의 평균 77.5가 실력이다', '변형판이 더 어려워서 무의미하다']"
        :answer="0"
        explanation="8장 실험의 논리 그대로 — 변형판·홀드아웃이 입을 모아 말하는 값이 실력의 정직한 추정치입니다(같은 난이도로 출제됐다는 전제 하에)."
      />
      <!-- 어려움 -->
      <Quiz
        difficulty="hard"
        question="가온AI에 요구할 '재평가 조건'으로 완전한 목록은?"
        :choices="['신선한 홀드아웃 채점 + 같은 문항 쌍대 비교(p값 공개) + 독립 심판·사람 일치율 + 전체 벤치마크 결과 공개', '더 큰 GPU 클러스터', '점수를 다시 계산한 보도자료', '경쟁사 모델의 삭제']"
        :answer="0"
        :hints="['검산대 ②③④의 처방 + 7장의 다중 비교 주의를 모으면 됩니다.']"
        explanation="오염 대응(홀드아웃), 소음 대응(쌍대·p값), 심판 감정(독립·일치율), 골라 보여주기 차단(전체 공개) — 10부 도구 상자의 총출동입니다."
      />
      <Quiz
        difficulty="hard"
        question="이 감정 전체에서 '신의 시점' 없이(진짜 실력을 모른 채) 우리가 확신할 수 있는 것과 없는 것의 구분으로 옳은 것은?"
        :choices="['확신 가능: 주장이 자료로 성립하는지(검산·구간·낙차) / 확신 불가: 테라-1의 진짜 실력 값 — 그래서 결론은 “근거 부족·재평가”이지 “나쁜 모델”이 아니다', '팩트체크로 진짜 실력을 정확히 알 수 있다', '아무것도 확신할 수 없으니 감정은 무의미하다', '기사가 틀렸다는 것을 100% 증명했다']"
        :answer="0"
        :hints="['6장의 교훈 — 우리는 절차의 명중률만 보증할 수 있었죠.']"
        explanation="측정의 겸손함이 마지막 교훈입니다 — 팩트체크는 '주장과 근거의 정합성'을 판정하는 것이지 진실 자체를 소유하는 게 아니에요. 그래서 판정서의 언어도 '성립하지 않음·요구'였습니다. 이 구분을 할 수 있다면, 졸업입니다. 🎓"
      />
    </QuizSet>

    <NotebookCard />

    <div
      v-if="progress.isDone('ch10')"
      class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"
    >
      <div class="mb-1 text-2xl font-bold text-emerald-600">🎓</div>
      <p class="text-lg font-bold text-emerald-800">10부 완결 — 스케일링 법칙과 평가의 통계, 졸업!</p>
      <p class="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-emerald-700">
        성장은 로그-로그 위의 직선이고, 점수 차이는 오차범위 안에선 소음입니다.
        이제 AI 뉴스·리더보드·모델 카드가 숫자로 읽히실 거예요 — 그리고 3부에서
        "심화"로 미뤄뒀던 통계(신뢰구간·p값·상관)가 전부 어디에 쓰이는지도 보셨습니다.
        시리즈의 질문 사슬 완성: 무엇을(6부) → 어떻게(8부) → 무엇으로(9부) →
        <b>얼마나, 정말로(10부)</b>.
      </p>
      <a
        href="/"
        class="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        포털로 — 다음 여정 고르기 →
      </a>
    </div>
  </article>
</template>
