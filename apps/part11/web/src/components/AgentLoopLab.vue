<script setup lang="ts">
// 1장 실험실 — 같은 요청("다음 주 화요일 회의실 예약")을 챗봇 모드와 에이전트 모드로
// 나란히 처리해 보며 "에이전트 = 관찰→생각→행동 루프 + 도구"를 해부한다.
// 난수 없음 — 완전 결정적 스크립트 트레이스(노트북 ch01_bigpicture.ipynb 와 동일한 5단계).
import { ref, computed } from 'vue'

const REQUEST = '"다음 주 화요일에 팀 회의실 좀 예약해 줘"'

// 에이전트 루프 5단계 — 각 스텝: 생각(왜) → 행동(도구) → 관찰(결과) → 상태(지금 아는 것)
const STEPS = [
  {
    think: '언제, 몇 명인지부터 확인해야겠다',
    action: '📅 캘린더 조회 도구(팀 일정)',
    obs: '다음 주 화요일 15시, 팀원 4명 전원 비어 있음',
    state: '시간 확정: 화요일 15시 · 참석 4명',
  },
  {
    think: '그 시간에 빈 회의실을 찾자',
    action: '🔍 회의실 검색 도구(화 15시)',
    obs: 'B동 3호가 15~16시 비어 있음',
    state: '+ 장소 후보: B동 3호',
  },
  {
    think: '방을 잡는다',
    action: '🗓️ 예약 도구(B동 3호, 화 15시)',
    obs: '예약 확정: 번호 R-1027',
    state: '+ 예약 번호 R-1027',
  },
  {
    think: '참석자들에게 알린다',
    action: '✉️ 초대 발송 도구(팀원 4명)',
    obs: '4명 모두에게 초대장 발송됨',
    state: '+ 초대 발송 완료',
  },
  {
    think: '정말 잡혔는지 마지막 확인',
    action: '✅ 예약 확인 조회(R-1027)',
    obs: '상태: 확정. 이제 보고만 남았다',
    state: '완료: 화 15시 · B동 3호 · R-1027 · 4명 초대',
  },
]

const asked = ref(false) // 챗봇 모드
const idx = ref(0) // 에이전트 모드 — 진행한 스텝 수

const done = computed(() => idx.value >= STEPS.length)

function next() {
  if (!done.value) idx.value++
}
function reset() {
  idx.value = 0
  asked.value = false
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-500">같은 부탁, 두 가지 처리 방식. 요청: <b class="text-slate-700">{{ REQUEST }}</b></p>

    <div class="mt-3 grid gap-4 md:grid-cols-2">
      <!-- ① 챗봇 모드 -->
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p class="mb-2 text-sm font-bold text-slate-700">💬 챗봇 모드: 한 턴에 답한다</p>
        <button
          v-if="!asked"
          type="button"
          class="rounded-lg bg-slate-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-500"
          @click="asked = true"
        >
          물어보기
        </button>
        <template v-else>
          <p class="rounded-md bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
            "네! 다음 주 화요일 오후에 회의실을 예약해 드렸습니다 😊 좋은 회의 되세요!"
          </p>
          <p class="mt-2 rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            ⚠️ 실제로 예약된 것은 없습니다. 캘린더를 <b>본 적조차 없어요</b>.
            글로만 배운 지식으로 <b>그럴듯한 문장</b>을 생성했을 뿐입니다.
          </p>
        </template>
      </div>

      <!-- ② 에이전트 모드 -->
      <div class="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
        <div class="mb-2 flex items-center justify-between">
          <p class="text-sm font-bold text-indigo-800">🤖 에이전트 모드: 루프를 돈다</p>
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
            :class="done ? 'cursor-default bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'"
            @click="next"
          >
            {{ done ? '🎉 완료' : `▶ 다음 단계 (${idx}/${STEPS.length})` }}
          </button>
        </div>

        <p v-if="idx === 0" class="rounded-md bg-white/70 px-3 py-2 text-xs text-slate-500">
          버튼을 눌러 루프를 한 스텝씩 진행해 보세요. 스텝마다 <b>생각 → 행동(도구) → 관찰</b>이 한 바퀴입니다.
        </p>

        <ol class="space-y-2">
          <li
            v-for="(s, i) in STEPS.slice(0, idx)"
            :key="i"
            class="rounded-md bg-white px-3 py-2 text-xs ring-1 ring-indigo-100"
          >
            <p class="font-bold text-indigo-700">스텝 {{ i + 1 }}</p>
            <p class="mt-0.5 text-slate-600">💭 생각: {{ s.think }}</p>
            <p class="text-slate-600">🛠️ 행동: {{ s.action }}</p>
            <p class="text-slate-600">👀 관찰: {{ s.obs }}</p>
            <p class="mt-0.5 border-t border-slate-100 pt-0.5 text-slate-500">🧠 상태: {{ s.state }}</p>
          </li>
        </ol>

        <p v-if="done" class="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          "화요일 15시 <b>B동 3호</b> 예약 완료(R-1027), 4명에게 초대장을 보냈고 확정 상태까지 확인했습니다."
          모든 문장이 <b>도구로 확인한 사실</b>입니다.
        </p>
      </div>
    </div>

    <!-- 단계 수 세기 — 워밍업과 연결 -->
    <div v-if="done" class="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
      ✏️ <b>단계 수를 세어 보세요. 5단계.</b> 방금 이 예약 일도 다섯 걸음짜리
      <b>사슬</b>이었습니다. 워밍업의 곱셈을 적용하면: 걸음 정확도 90%일 때 이 일의 성공률은
      0.9⁵ ≈ <b>59%</b>. 유능해 보이는 루프가 왜 가끔 일을 망치는지, 수학은 이미 알고 있죠.
    </div>

    <button
      v-if="asked || idx > 0"
      type="button"
      class="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
      @click="reset"
    >
      ↺ 처음부터 다시
    </button>
  </div>
</template>
