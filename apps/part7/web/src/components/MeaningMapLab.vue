<script setup lang="ts">
// ch0 인터랙티브 — ① 비슷한 문장 찾기(사람의 의미 판단 vs 글자 겹침의 맹점)
//                 ② 의미 지도(단어를 지도 위 위치로 — "여러분이 방금 임베딩을 했습니다").
// 오프라인·결정적.
import { ref } from 'vue'

// ── ① 비슷한 문장 찾기 ──────────────────────────────────────────
const QUERY = '회식 장소 어디로 정했어?'
const CANDS = [
  {
    key: 'A',
    text: '저녁 모임 위치는 결정됐나요?',
    overlap: 0,
    note: '사람의 정답 — 겹치는 단어가 하나도 없는데 뜻은 같은 질문이죠.',
  },
  {
    key: 'B',
    text: '회식 장소 예약은 제가 할게요.',
    overlap: 2,
    note: '"회식·장소" 두 단어나 겹치지만 — 이건 질문이 아니라 제안. 뜻이 다릅니다.',
  },
  {
    key: 'C',
    text: '주말 날씨가 참 좋네요.',
    overlap: 0,
    note: '완전 무관 — 그런데 글자 겹침 점수로는 정답 A와 동점(0개)입니다!',
  },
]
const picked = ref<number | null>(null)

// ── ② 의미 지도 ─────────────────────────────────────────────────
// 좌표는 % (미리 준비된 2차원 toy 임베딩 — 진짜 임베딩은 수백 차원, 4장에서)
const WORDS = [
  { w: '강아지', x: 18, y: 24 }, { w: '고양이', x: 28, y: 18 }, { w: '햄스터', x: 24, y: 34 },
  { w: '버스', x: 68, y: 70 }, { w: '자동차', x: 78, y: 63 }, { w: '기차', x: 73, y: 79 },
  { w: '사과', x: 74, y: 18 }, { w: '바나나', x: 82, y: 26 },
]
const SPOTS = [
  { key: 'ㄱ', x: 33, y: 27, group: '동물들 근처', good: true },
  { key: 'ㄴ', x: 60, y: 72, group: '탈것들 근처', good: false },
  { key: 'ㄷ', x: 68, y: 30, group: '과일들 근처', good: false },
]
const placed = ref<number | null>(null)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 비슷한 문장 찾기 -->
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 비슷한 문장 찾기: 사람 vs 글자 세기</p>
    <p class="mb-3 text-xs text-slate-400">아래 질문과 뜻이 가장 비슷한 문장을 골라 보세요.</p>

    <div class="mb-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-800">
      <span class="mr-1 text-xs font-semibold text-slate-500">질문</span>{{ QUERY }}
    </div>
    <div class="space-y-2">
      <button
        v-for="(c, i) in CANDS"
        :key="c.key"
        type="button"
        class="block w-full rounded-lg border p-3 text-left text-sm leading-relaxed transition"
        :class="picked === i ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-700 hover:border-slate-300'"
        @click="picked = i"
      >
        <span class="mr-1 text-[11px] font-bold" :class="picked === i ? 'text-indigo-500' : 'text-slate-400'">{{ c.key }}</span>
        {{ c.text }}
      </button>
    </div>

    <div v-if="picked !== null" class="mt-3 space-y-2">
      <p class="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">👀 {{ CANDS[picked].note }}</p>
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="mb-2 text-[11px] font-semibold text-slate-400">🤖 소박한 컴퓨터의 채점 — 질문과 겹치는 단어 수</p>
        <div class="space-y-1.5">
          <div v-for="c in CANDS" :key="c.key" class="flex items-center gap-2 text-sm">
            <span class="w-4 font-bold text-slate-500">{{ c.key }}</span>
            <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div class="h-full rounded-full bg-rose-400" :style="{ width: (c.overlap / 2) * 100 + '%' }" />
            </div>
            <span class="w-10 text-right text-xs text-slate-500">{{ c.overlap }}개</span>
          </div>
        </div>
        <p class="mt-2 text-sm text-rose-700">
          글자만 세면 <b>B가 1등</b>이고, 정답 A는 무관한 C와 <b>동점 꼴찌</b>입니다 —
          이게 키워드 검색의 맹점이에요. 컴퓨터에게 "뜻"을 가르치려면 다른 방법이 필요합니다.
        </p>
      </div>
    </div>

    <!-- ② 의미 지도 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 의미 지도: "토끼"는 어디에 놓을까요?</p>
    <p class="mb-3 text-xs text-slate-400">단어들이 이미 지도 위에 있습니다. 토끼의 자리(ㄱ·ㄴ·ㄷ)를 골라 보세요.</p>

    <div class="relative h-72 w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/40">
      <span
        v-for="p in WORDS"
        :key="p.w"
        class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200"
        :style="{ left: p.x + '%', top: p.y + '%' }"
      >{{ p.w }}</span>
      <template v-for="(s, i) in SPOTS" :key="s.key">
        <button
          v-if="placed === null"
          type="button"
          class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-indigo-400 bg-white/70 px-2.5 py-1 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
          :style="{ left: s.x + '%', top: s.y + '%' }"
          @click="placed = i"
        >{{ s.key }}</button>
        <span
          v-else-if="placed === i"
          class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-xs font-bold text-white shadow"
          :class="s.good ? 'bg-emerald-500' : 'bg-rose-500'"
          :style="{ left: s.x + '%', top: s.y + '%' }"
        >🐰 토끼</span>
      </template>
    </div>

    <p v-if="placed !== null" class="mt-3 rounded-lg p-3 text-sm" :class="SPOTS[placed].good ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'">
      <template v-if="SPOTS[placed].good">
        ✅ <b>{{ SPOTS[placed].group }}</b> — 대부분의 사람이 여기를 고릅니다. 토끼는 강아지·고양이와 "비슷"하니
        지도에서도 <b>가까이</b> 놓이는 게 자연스럽죠. 축하합니다 — <b>여러분이 방금 임베딩을 했습니다.</b>
        "뜻이 비슷하다 = 지도에서 가깝다"로 바꿔 놓은 것, 그게 전부예요.
      </template>
      <template v-else>
        🤔 <b>{{ SPOTS[placed].group }}</b>에 토끼를…? 뜻이 비슷한 것끼리 가까이 두는 게 이 지도의 규칙이에요.
        다시 골라 보세요 — <button type="button" class="font-semibold underline" @click="placed = null">지도 초기화</button>
      </template>
    </p>
  </div>
</template>
