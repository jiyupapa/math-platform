<script setup lang="ts">
// ch3 인터랙티브 — ① 의미 지도에서 클러스터와 "성별 방향"(평행 화살표) 관찰
//                 ② 의미의 산수: 왕 − 남자 + 여자 ≈ 여왕 (toy 2D 임베딩, 오프라인·결정적).
import { computed, ref } from 'vue'

// 미리 준비한 2D toy 임베딩 (성별 방향 = (+2, 0) 으로 설계)
const WORDS: Record<string, { x: number; y: number; group: 'people' | 'animal' | 'fruit' }> = {
  남자: { x: 2, y: 2, group: 'people' },
  여자: { x: 4, y: 2, group: 'people' },
  왕자: { x: 2, y: 4, group: 'people' },
  공주: { x: 4, y: 4, group: 'people' },
  왕: { x: 2, y: 6, group: 'people' },
  여왕: { x: 4, y: 6, group: 'people' },
  강아지: { x: 7.5, y: 1.2, group: 'animal' },
  고양이: { x: 8.3, y: 1.8, group: 'animal' },
  토끼: { x: 7.9, y: 0.6, group: 'animal' },
  사과: { x: 8.8, y: 6.2, group: 'fruit' },
  바나나: { x: 9.4, y: 5.6, group: 'fruit' },
  포도: { x: 9.1, y: 6.8, group: 'fruit' },
}
const GROUP_COLOR = { people: '#4f46e5', animal: '#d97706', fruit: '#059669' }

// SVG 좌표 변환 (원점 좌하단)
const px = (p: { x: number; y: number }) => ({ x: 22 + p.x * 26, y: 192 - p.y * 24 })

// ── ① 성별 방향 화살표 ──
const showArrows = ref(false)
const PAIRS: Array<[string, string]> = [
  ['남자', '여자'],
  ['왕자', '공주'],
  ['왕', '여왕'],
]

// ── ② 의미의 산수 ──
interface Preset {
  label: string
  a: string
  b: string
  c: string
  expect: string
}
const PRESETS: Preset[] = [
  { label: '왕 − 남자 + 여자', a: '왕', b: '남자', c: '여자', expect: '여왕' },
  { label: '왕자 − 남자 + 여자', a: '왕자', b: '남자', c: '여자', expect: '공주' },
  { label: '여왕 − 여자 + 남자', a: '여왕', b: '여자', c: '남자', expect: '왕' },
]
const picked = ref<number | null>(null)
const revealed = ref(false)

const calc = computed(() => {
  if (picked.value === null) return null
  const p = PRESETS[picked.value]
  const A = WORDS[p.a]
  const B = WORDS[p.b]
  const C = WORDS[p.c]
  const res = { x: A.x - B.x + C.x, y: A.y - B.y + C.y }
  // 입력 세 단어를 뺀 나머지 중 최근접 이웃 (실제 단어 유추의 관례)
  const nearest = Object.keys(WORDS)
    .filter((w) => w !== p.a && w !== p.b && w !== p.c)
    .sort((u, v) => Math.hypot(WORDS[u].x - res.x, WORDS[u].y - res.y) - Math.hypot(WORDS[v].x - res.x, WORDS[v].y - res.y))[0]
  return { ...p, A, B, C, res, nearest }
})

function pick(i: number) {
  picked.value = i
  revealed.value = false
}
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ① — 의미 지도 관찰: 클러스터, 그리고 숨은 방향</p>
    <p class="mb-3 text-xs text-slate-400">
      미리 준비한 toy 임베딩 12단어입니다. 먼저 <b>모여 있는 무리</b>(클러스터)를 눈으로 확인하고, 버튼을 눌러 보세요.
    </p>

    <svg viewBox="0 0 300 210" class="w-full rounded-lg bg-slate-50 ring-1 ring-slate-100">
      <defs>
        <marker id="arr-dir" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0 L6,3.5 L0,7 z" fill="#e11d48" />
        </marker>
      </defs>
      <!-- 성별 방향 화살표 -->
      <template v-if="showArrows">
        <line
          v-for="[from, to] in PAIRS"
          :key="from"
          :x1="px(WORDS[from]).x + 14"
          :y1="px(WORDS[from]).y - 4"
          :x2="px(WORDS[to]).x - 16"
          :y2="px(WORDS[to]).y - 4"
          stroke="#e11d48"
          stroke-width="2.5"
          marker-end="url(#arr-dir)"
        />
      </template>
      <!-- 산수 결과 ? 마커 -->
      <template v-if="calc">
        <circle :cx="px(calc.res).x" :cy="px(calc.res).y" r="11" fill="none" stroke="#e11d48" stroke-width="2" stroke-dasharray="3 2" />
        <text v-if="!revealed" :x="px(calc.res).x" :y="px(calc.res).y + 4" text-anchor="middle" font-size="12" font-weight="bold" fill="#e11d48">?</text>
      </template>
      <!-- 단어 점 + 라벨 -->
      <template v-for="(p, w) in WORDS" :key="w">
        <circle :cx="px(p).x" :cy="px(p).y" r="3" :fill="GROUP_COLOR[p.group]" />
        <text
          :x="px(p).x"
          :y="px(p).y + 13"
          text-anchor="middle"
          font-size="10"
          :font-weight="revealed && calc && w === calc.nearest ? 'bold' : 'normal'"
          :fill="revealed && calc && w === calc.nearest ? '#e11d48' : '#475569'"
        >{{ w }}</text>
      </template>
    </svg>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="showArrows ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        @click="showArrows = !showArrows"
      >
        {{ showArrows ? '화살표 숨기기' : '💡 남성→여성 화살표 그리기' }}
      </button>
      <span class="text-[11px] text-slate-400">● 사람·왕족(남색) ● 동물(주황) ● 과일(초록)</span>
    </div>

    <p v-if="showArrows" class="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
      👀 세 화살표(남자→여자, 왕자→공주, 왕→여왕)가 <b>모두 같은 방향, 같은 길이</b>입니다.
      "남성을 여성으로 바꾼다"는 <b>뜻의 변화</b>가 이 공간에서는 <b>일정한 방향 이동</b>이에요 —
      위치만 뜻을 담는 게 아니라, <b>방향도 뜻을 담습니다.</b>
    </p>

    <!-- ② 의미의 산수 -->
    <hr class="my-5 border-slate-100" />
    <p class="mb-1 text-sm font-semibold text-slate-700">🧪 실험 ② — 의미의 산수: 화살표로 계산하는 뜻</p>
    <p class="mb-3 text-xs text-slate-400">
      방향이 뜻을 담는다면 — 벡터 덧셈·뺄셈(1부 2장)으로 뜻을 <b>계산</b>할 수 있을 겁니다. 골라 보세요.
    </p>

    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="(p, i) in PRESETS"
        :key="p.label"
        type="button"
        class="rounded-lg border px-3 py-2 text-xs font-semibold transition"
        :class="picked === i ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
        @click="pick(i)"
      >
        {{ p.label }} = ?
      </button>
    </div>

    <div v-if="calc" class="rounded-lg bg-slate-50 p-4">
      <p class="font-mono text-sm text-slate-700">
        ({{ calc.A.x }}, {{ calc.A.y }}) − ({{ calc.B.x }}, {{ calc.B.y }}) + ({{ calc.C.x }}, {{ calc.C.y }})
        = <b>({{ calc.res.x }}, {{ calc.res.y }})</b>
      </p>
      <p class="mt-1 text-xs text-slate-400">지도 위 점선 동그라미가 그 지점입니다 — 거기 뭐가 있죠?</p>
      <button
        v-if="!revealed"
        type="button"
        class="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        @click="revealed = true"
      >
        가장 가까운 단어 찾기
      </button>
      <p v-else class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
        ✅ 최근접 단어: <b>{{ calc.nearest }}</b>{{ calc.nearest === calc.expect ? ' — 산수가 뜻을 맞혔습니다!' : '' }}
        "{{ calc.a }}에서 {{ calc.b }}의 성분을 빼고 {{ calc.c }}의 성분을 더하면 {{ calc.nearest }}" —
        벡터 뺄셈 <b>{{ calc.c }} − {{ calc.b }}</b>가 담고 있던 방향이 {{ calc.a }}에게 그대로 적용된 거예요.
      </p>
    </div>
  </div>
</template>
