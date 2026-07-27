<script setup lang="ts">
// 🎯 캡스톤 실험실 — AI 뉴스 팩트체크: 가상 발표문(테라-1)을 검산대 4곳에서 감정한다.
// 새 개념 없음 — 1~9장의 도구 총조립. 전 수치 사전 검증(결정적):
//   C=6·40e9·1.2e12=2.88e23, GPU 21,368일→4,000장 5.3일, 비율 30:1,
//   ±(n=2,000)≈2.0%p(0.8점 차 겹침), 변형판 낙차 27점, 대전 55%±6.9%p(z=1.41).
import { ref, computed } from 'vue'

const revealed = ref<Record<string, boolean>>({ s1: false, s2: false, s3: false, s4: false })
const variantShown = ref(false)
const allDone = computed(() => Object.values(revealed.value).every(Boolean))

function reveal(id: 's1' | 's2' | 's3' | 's4') {
  revealed.value[id] = true
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- 발표문 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">📰 감정 대상 — 가상 보도자료 (오늘 아침 단톡방에 올라온 그 기사)</p>
    <div class="mb-4 rounded-xl bg-slate-900 p-4 text-sm leading-relaxed text-slate-200">
      <p class="mb-1 text-base font-bold text-white">가온AI, 신모델 '테라-1' 공개 — "국내 1위 등극"</p>
      <p>
        가온AI는 파라미터 <b class="text-amber-300">40B</b>, 학습 토큰
        <b class="text-amber-300">1.2조 개</b>의 신모델 테라-1을 공개했다. 회사 측은 "A100
        <b class="text-amber-300">4,000장으로 약 5일</b> 만에 훈련을 마쳤다"고 밝혔다.
        <span class="text-indigo-300">[주장 ①]</span>
      </p>
      <p class="mt-1.5">
        테라-1은 종합 벤치마크 가온-종합(<b class="text-amber-300">2,000문항</b>)에서
        <b class="text-amber-300">71.2점</b>을 기록, 현 1위 누리-7(70.4점)을
        <b class="text-amber-300">0.8점 앞서며 1위에 올랐다</b>. <span class="text-indigo-300">[주장 ②]</span>
        특히 3년 전 공개된 수학 벤치마크 수리-500에서는 <b class="text-amber-300">91점</b>(전 세대
        58점, 정답 전부 일치만 인정)을 받아 "수학 능력이 <b class="text-amber-300">창발</b>했다"고
        강조했다. <span class="text-indigo-300">[주장 ③]</span>
      </p>
      <p class="mt-1.5">
        자체 모델 대전(총 <b class="text-amber-300">200판</b>, 자사 심판 모델 '가온-저지' 채점)
        에서는 누리-7 상대 <b class="text-amber-300">승률 55%</b>를 기록했다.
        <span class="text-indigo-300">[주장 ④]</span>
      </p>
    </div>

    <p class="mb-2 text-sm font-semibold text-slate-500">🔍 검산대 4곳 — 버튼을 눌러 하나씩 감정하세요</p>
    <div class="space-y-3">
      <!-- 검산대 1 -->
      <div class="rounded-lg border border-slate-200 p-3.5">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-bold text-slate-700">검산대 ① 예산·배분 — 스펙이 말이 되나 (1·4장)</p>
          <button v-if="!revealed.s1" type="button" class="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500" @click="reveal('s1')">검산하기</button>
          <span v-else class="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">✓ 통과</span>
        </div>
        <div v-if="revealed.s1" class="mt-2 space-y-1 text-sm text-slate-600">
          <p>· 예산 C = 6 × 40B × 1.2T = <b class="font-mono">2.88×10²³ FLOPs</b></p>
          <p>· GPU-일 = 2.88×10²³ ÷ (A100 실효 1.56×10¹⁴/초) ÷ 86,400 ≈ <b class="font-mono">21,368일</b> → 4,000장이면 <b class="font-mono">5.3일</b> — "약 5일" 주장과 <b class="text-emerald-700">일치 ✓</b></p>
          <p>· 토큰/파라미터 = 1.2T ÷ 40B = <b class="font-mono">30 : 1</b> — 황금비(20) 근처, 서빙을 약간 고려한 합리적 배분 <b class="text-emerald-700">✓</b></p>
        </div>
      </div>

      <!-- 검산대 2 -->
      <div class="rounded-lg border border-slate-200 p-3.5">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-bold text-slate-700">검산대 ② "0.8점 차 1위" — 오차범위 안인가 (6·7장)</p>
          <button v-if="!revealed.s2" type="button" class="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500" @click="reveal('s2')">검산하기</button>
          <span v-else class="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">⚠ 판정 보류</span>
        </div>
        <div v-if="revealed.s2" class="mt-2 space-y-1 text-sm text-slate-600">
          <p>· n=2,000 → ± = 1.96×√(0.712×0.288/2000) ≈ <b class="font-mono">±2.0%p</b></p>
          <p>· 테라-1 <b class="font-mono">[69.2, 73.2]</b> vs 누리-7 <b class="font-mono">[68.4, 72.4]</b> — <b class="text-amber-700">구간이 크게 겹침</b></p>
          <p>· 0.8점 차이로 "1위 등극"은 <b>단정 불가</b> — 같은 문항 쌍대 비교와 p값을 요구해야 (발표에 없음)</p>
        </div>
      </div>

      <!-- 검산대 3 -->
      <div class="rounded-lg border border-slate-200 p-3.5">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-bold text-slate-700">검산대 ③ "수학 창발 +33점" — 지표와 오염 (5·8장)</p>
          <button v-if="!revealed.s3" type="button" class="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500" @click="reveal('s3')">검산하기</button>
          <span v-else class="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">✗ 강한 의심</span>
        </div>
        <div v-if="revealed.s3" class="mt-2 space-y-1.5 text-sm text-slate-600">
          <p>· 의심 신호 ①: 다른 벤치는 +0.8점인데 수리-500만 +33점 — <b>불균형 급등</b></p>
          <p>· 의심 신호 ②: "정답 전부 일치만 인정" — <b>전부-정답형 지표</b>(5장의 계단 제조기)</p>
          <p>· 의심 신호 ③: 3년 전 공개된 벤치마크 — <b>오염 노출 기간 김</b>(8장)</p>
          <button v-if="!variantShown" type="button" class="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700" @click="variantShown = true">
            🕵️ 변형판(숫자·표현 교체) 점수 요청하기
          </button>
          <p v-else class="rounded-md bg-rose-50 px-3 py-2 text-rose-800">
            변형판 점수: <b class="font-mono">64점</b> — 낙차 <b class="font-mono">27점</b>!
            8장의 어림으로 문항 상당수가 유출된 강한 오염 신호. 정직한 수학 실력 추정은
            <b>64점대</b>(전 세대 58점 대비 +6점 — "창발"이 아니라 착실한 개선).
          </p>
        </div>
      </div>

      <!-- 검산대 4 -->
      <div class="rounded-lg border border-slate-200 p-3.5">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-bold text-slate-700">검산대 ④ "대전 승률 55%" — 표본과 심판 (6·9장)</p>
          <button v-if="!revealed.s4" type="button" class="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500" @click="reveal('s4')">검산하기</button>
          <span v-else class="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">⚠ 판정 보류</span>
        </div>
        <div v-if="revealed.s4" class="mt-2 space-y-1 text-sm text-slate-600">
          <p>· 200판 → ± ≈ 98/√200 = <b class="font-mono">±6.9%p</b> → 구간 <b class="font-mono">[48.1, 61.9]</b> — <b class="text-amber-700">50%(반반)를 포함</b> (z=1.41, p≈0.16)</p>
          <p>· 심판이 자사 모델 '가온-저지' — <b>자기 선호 의심</b>(9장), 위치 무작위화·사람 일치율 언급 없음</p>
          <p>· 판 수 부족 + 심판 미감정 — <b>이중 보류</b></p>
        </div>
      </div>
    </div>

    <!-- 최종 판정서 -->
    <div v-if="allDone" class="mt-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/60 p-4">
      <p class="mb-2 text-sm font-bold text-indigo-900">📋 최종 판정서 — 테라-1 발표 감정 결과</p>
      <table class="w-full text-xs">
        <tbody class="divide-y divide-indigo-100">
          <tr><td class="py-1.5 pr-2 font-medium text-slate-700">① 예산·배분 (C=6ND · 30:1)</td><td class="py-1.5 font-bold text-emerald-700">검산 일치 — 신뢰</td></tr>
          <tr><td class="py-1.5 pr-2 font-medium text-slate-700">② 종합 1위 (0.8점 차)</td><td class="py-1.5 font-bold text-amber-800">오차범위 안 — 쌍대·p값 요구</td></tr>
          <tr><td class="py-1.5 pr-2 font-medium text-slate-700">③ 수학 창발 (+33점)</td><td class="py-1.5 font-bold text-rose-700">오염 강한 의심 — 정직 추정 64점대</td></tr>
          <tr><td class="py-1.5 pr-2 font-medium text-slate-700">④ 대전 승률 55%</td><td class="py-1.5 font-bold text-amber-800">표본 부족 + 심판 미감정 — 보류</td></tr>
        </tbody>
      </table>
      <p class="mt-2 rounded-md bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 ring-1 ring-indigo-100">
        <b>도입 판단:</b> "누리-7보다 낫다"는 근거는 현재 자료로 성립하지 않음. 재평가 요구 —
        신선한 홀드아웃 채점, 같은 문항 쌍대 비교(p값 공개), 독립 심판 + 사람 일치율,
        전체 벤치마크 결과 공개. <b>배분·예산 주장만은 검산과 일치.</b> 🎓
        이 판정서를 스스로 쓸 수 있다면 — 10부 졸업입니다.
      </p>
    </div>
    <p v-else class="mt-3 text-center text-xs text-slate-500">검산대 4곳을 모두 감정하면 최종 판정서가 열립니다.</p>
  </div>
</template>
