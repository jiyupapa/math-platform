<script setup lang="ts">
// 인터랙티브 멀티헤드 어텐션 실험실.
// 같은 문장을 여러 '헤드'가 각자 다른 관점으로 본다: 헤드1은 주어에, 헤드2는 목적어에 집중.
// 각 헤드는 ch6처럼 자기만의 Q·K·V 로 집중도를 계산한다(여기선 결과만 보여줌).
// 두 헤드의 출력을 이어붙이면(concat) 더 풍부한 문맥 벡터가 된다.
import { ref, computed } from 'vue'

const WORDS = ['강아지', '공', '물었다']
const VALUE: [number, number][] = [
  [1.0, 0.0],
  [0.0, 1.0],
  [0.5, 0.5],
]

// 각 헤드의 집중도 행렬 (행=질문 단어, 열=참고 단어). 이미 소프트맥스된 값.
const HEADS = [
  {
    name: '헤드 1',
    focus: '주어에 민감',
    color: 'var(--c-indigo-500)',
    attn: [
      [0.6, 0.2, 0.2],
      [0.2, 0.6, 0.2],
      [0.65, 0.15, 0.2], // 물었다 → 강아지(주어)
    ],
  },
  {
    name: '헤드 2',
    focus: '목적어에 민감',
    color: 'var(--c-emerald-500)',
    attn: [
      [0.6, 0.2, 0.2],
      [0.2, 0.6, 0.2],
      [0.15, 0.65, 0.2], // 물었다 → 공(목적어)
    ],
  },
]

const queryIdx = ref(2) // 기본: 물었다

function headOutput(attnRow: number[]): [number, number] {
  const o: [number, number] = [0, 0]
  attnRow.forEach((w, i) => {
    o[0] += w * VALUE[i][0]
    o[1] += w * VALUE[i][1]
  })
  return o
}

const results = computed(() =>
  HEADS.map((h) => {
    const row = h.attn[queryIdx.value]
    return { ...h, row, out: headOutput(row), top: row.indexOf(Math.max(...row)) }
  }),
)

const concat = computed<number[]>(() => results.value.flatMap((r) => r.out))
const pct = (w: number) => (w * 100).toFixed(0)
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- 질문 단어 -->
    <p class="mb-2 text-sm font-semibold text-slate-500">① 질문 단어 선택</p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="(w, i) in WORDS"
        :key="w"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
        :class="queryIdx === i ? 'border-indigo-400 bg-indigo-50 text-indigo-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="queryIdx = i"
      >
        {{ w }}
      </button>
    </div>

    <!-- 두 헤드 나란히 -->
    <p class="mt-4 mb-2 text-sm font-semibold text-slate-500">
      ② 각 헤드가 "<b>{{ WORDS[queryIdx] }}</b>"의 눈으로 보는 집중도
    </p>
    <div class="grid gap-4 sm:grid-cols-2">
      <div v-for="r in results" :key="r.name" class="rounded-lg border border-slate-200 p-3">
        <div class="mb-2 flex items-center gap-2">
          <span class="inline-block h-3 w-3 rounded-full" :style="{ backgroundColor: r.color }" />
          <span class="text-sm font-semibold text-slate-700">{{ r.name }}</span>
          <span class="text-xs text-slate-500">({{ r.focus }})</span>
        </div>
        <div class="space-y-1.5">
          <div v-for="(w, i) in WORDS" :key="w" class="flex items-center gap-2">
            <span class="w-14 shrink-0 text-right text-xs" :class="i === r.top ? 'font-bold text-slate-800' : 'text-slate-500'">{{ w }}</span>
            <div class="h-4 flex-1 overflow-hidden rounded bg-slate-100">
              <div class="h-full rounded" :style="{ width: Math.max(r.row[i] * 100, 2) + '%', backgroundColor: r.color, opacity: i === r.top ? 1 : 0.5 }" />
            </div>
            <span class="w-8 shrink-0 text-right font-mono text-xs tabular-nums text-slate-500">{{ pct(r.row[i]) }}%</span>
          </div>
        </div>
        <p class="mt-2 text-xs text-slate-500">
          출력 = <span class="font-mono">({{ r.out[0].toFixed(2) }}, {{ r.out[1].toFixed(2) }})</span>
        </p>
      </div>
    </div>

    <!-- concat -->
    <p class="mt-4 mb-2 text-sm font-semibold text-slate-500">③ 이어붙이기 (concat)</p>
    <div class="rounded-lg bg-violet-50 px-4 py-3 text-sm text-violet-900">
      두 헤드의 출력을 <b>나란히 이어붙이면</b>:
      <div class="mt-1 font-mono">
        [{{ results[0].out[0].toFixed(2) }}, {{ results[0].out[1].toFixed(2) }}]
        ⊕ [{{ results[1].out[0].toFixed(2) }}, {{ results[1].out[1].toFixed(2) }}]
        = <b>[{{ concat.map((n) => n.toFixed(2)).join(', ') }}]</b>
      </div>
      <p class="mt-1 text-violet-700">
        숫자 {{ concat.length }}개짜리 벡터로, 여러 관점이 <b>한 벡터에 모였습니다</b>.
        (실제로는 이 뒤에 한 번 더 섞어 주는 선형층이 붙어요.)
      </p>
    </div>
  </div>
</template>
