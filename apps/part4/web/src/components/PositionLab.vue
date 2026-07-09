<script setup lang="ts">
// 인터랙티브 위치 인코딩 실험실.
// 같은 단어들("나 너 좋아해")이라도 순서를 바꾸면 뜻이 달라진다.
// '위치 정보 더하기'를 켜고 끄며, 각 슬롯의 최종 벡터 = 단어벡터 + 위치벡터 를 확인한다.
// 위치를 끄면 두 순서가 '같은 벡터 뭉치'라 구분 불가 → 왜 위치가 필요한지 보인다.
import { ref, computed } from 'vue'

// 아주 단순한 2D 단어 임베딩 (교육용)
const WORD_EMB: Record<string, [number, number]> = {
  나: [1.0, 0.0],
  너: [0.0, 1.0],
  좋아해: [0.5, 0.5],
}
// 슬롯(1·2·3번째)마다 고유한 위치 벡터 (실제로는 사인·코사인으로 만듦 — 심화 참고)
const POS: [number, number][] = [
  [0.0, 0.1],
  [0.5, 0.6],
  [1.0, 0.2],
]

const ORDERS: { key: string; words: string[]; meaning: string }[] = [
  { key: 'A', words: ['나', '너', '좋아해'], meaning: '내가 너를 좋아해' },
  { key: 'B', words: ['너', '나', '좋아해'], meaning: '네가 나를 좋아해' },
]

const orderKey = ref('A')
const posOn = ref(true)

const order = computed(() => ORDERS.find((o) => o.key === orderKey.value)!)

const rows = computed(() =>
  order.value.words.map((w, i) => {
    const word = WORD_EMB[w]
    const pos: [number, number] = posOn.value ? POS[i] : [0, 0]
    const final: [number, number] = [word[0] + pos[0], word[1] + pos[1]]
    return { slot: i + 1, w, word, pos, final }
  }),
)

const fmt = (v: [number, number]) => `(${v[0].toFixed(1)}, ${v[1].toFixed(1)})`
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- 순서 선택 -->
    <p class="mb-2 text-sm font-semibold text-slate-500">① 같은 단어, 다른 순서 — 골라 보세요</p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="o in ORDERS"
        :key="o.key"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
        :class="orderKey === o.key ? 'border-indigo-400 bg-indigo-50 text-indigo-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="orderKey = o.key"
      >
        {{ o.words.join(' ') }}
      </button>
    </div>
    <p class="mt-1.5 text-xs text-slate-500">
      뜻: <b>{{ order.meaning }}</b> — 단어는 똑같은데 순서만 바꿔도 뜻이 정반대죠.
    </p>

    <!-- 위치 토글 -->
    <label class="mt-4 flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
      <input type="checkbox" v-model="posOn" class="h-4 w-4 accent-indigo-500" />
      ② 위치 정보 더하기 {{ posOn ? '(켜짐)' : '(꺼짐)' }}
    </label>

    <!-- 계산 표 -->
    <div class="mt-3 overflow-x-auto">
      <table class="w-full min-w-[420px] text-center text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs text-slate-500">
            <th class="px-2 py-1.5 font-medium">슬롯</th>
            <th class="px-2 py-1.5 font-medium">단어</th>
            <th class="px-2 py-1.5 font-medium">단어 벡터</th>
            <th class="px-2 py-1.5 font-medium">＋ 위치 벡터</th>
            <th class="px-2 py-1.5 font-medium">＝ 최종 벡터</th>
          </tr>
        </thead>
        <tbody class="font-mono tabular-nums">
          <tr v-for="r in rows" :key="r.slot" class="border-b border-slate-100">
            <td class="px-2 py-1.5 text-slate-400">{{ r.slot }}</td>
            <td class="px-2 py-1.5 font-sans font-semibold text-slate-700">{{ r.w }}</td>
            <td class="px-2 py-1.5 text-slate-600">{{ fmt(r.word) }}</td>
            <td class="px-2 py-1.5" :class="posOn ? 'text-indigo-600' : 'text-slate-300'">{{ fmt(r.pos) }}</td>
            <td class="px-2 py-1.5 font-semibold text-slate-800">{{ fmt(r.final) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 해설 -->
    <div
      v-if="posOn"
      class="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      ✅ 위치를 더하니 <b>슬롯마다 최종 벡터가 달라</b>집니다. 그래서 "나"가 <b>1번째</b>인지
      <b>2번째</b>인지 모델이 구분할 수 있어요 — 순서가 살아납니다.
    </div>
    <div
      v-else
      class="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      ⚠️ 위치 정보가 없으면, 두 순서(A·B)는 <b>똑같은 벡터 뭉치</b>를 순서만 바꿔 놓은 것뿐입니다.
      모델은 "나 너 좋아해"와 "너 나 좋아해"를 <b>구분하지 못해요</b>. (위 체크박스를 켜 보세요)
    </div>
  </div>
</template>
