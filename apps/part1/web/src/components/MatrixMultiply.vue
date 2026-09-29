<script setup lang="ts">
// 행렬 곱 인터랙티브. 결과(C) 칸을 누르면 A의 해당 행과 B의 해당 열을 강조하고,
// 그 칸이 어떻게 나오는지 내적 계산식을 보여준다.
// A: m×n, B: n×p  →  C: m×p (호출 측에서 차원이 맞는다고 가정)
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    a: number[][]
    b: number[][]
    labelA?: string
    labelB?: string
    labelC?: string
  }>(),
  { labelA: 'A', labelB: 'B', labelC: 'C' },
)

// C = A·B 를 명시적 3중 루프로 계산
const result = computed<number[][]>(() => {
  const m = props.a.length
  const n = props.a[0].length
  const p = props.b[0].length
  const out: number[][] = []
  for (let i = 0; i < m; i++) {
    out[i] = []
    for (let j = 0; j < p; j++) {
      let s = 0
      for (let k = 0; k < n; k++) s += props.a[i][k] * props.b[k][j]
      out[i][j] = s
    }
  }
  return out
})

const sel = ref<{ i: number; j: number } | null>(null)

// 선택된 결과 칸의 계산식: a_i0×b_0j + a_i1×b_1j + ...
const terms = computed(() => {
  if (!sel.value) return []
  const { i, j } = sel.value
  return props.a[i].map((_, k) => ({ av: props.a[i][k], bv: props.b[k][j] }))
})
const selValue = computed(() => (sel.value ? result.value[sel.value.i][sel.value.j] : 0))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <div class="flex flex-wrap items-center justify-center gap-3">
      <!-- A -->
      <div>
        <div class="mb-1 text-center text-xs font-semibold text-slate-500">{{ labelA }}</div>
        <table class="border-collapse">
          <tbody>
            <tr v-for="(row, i) in a" :key="i">
              <td
                v-for="(val, k) in row"
                :key="k"
                class="h-10 w-10 border border-slate-200 text-center text-sm transition-colors"
                :class="sel && sel.i === i ? 'bg-indigo-100 font-bold text-indigo-700' : ''"
              >
                {{ val }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <span class="text-lg font-bold text-slate-500">×</span>

      <!-- B -->
      <div>
        <div class="mb-1 text-center text-xs font-semibold text-slate-500">{{ labelB }}</div>
        <table class="border-collapse">
          <tbody>
            <tr v-for="(row, k) in b" :key="k">
              <td
                v-for="(val, j) in row"
                :key="j"
                class="h-10 w-10 border border-slate-200 text-center text-sm transition-colors"
                :class="sel && sel.j === j ? 'bg-pink-100 font-bold text-pink-700' : ''"
              >
                {{ val }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <span class="text-lg font-bold text-slate-500">=</span>

      <!-- C (클릭 가능) -->
      <div>
        <div class="mb-1 text-center text-xs font-semibold text-slate-500">{{ labelC }}</div>
        <table class="border-collapse">
          <tbody>
            <tr v-for="(row, i) in result" :key="i">
              <td
                v-for="(val, j) in row"
                :key="j"
                class="h-10 w-10 cursor-pointer border border-slate-200 text-center text-sm transition-colors hover:bg-emerald-50"
                :class="
                  sel && sel.i === i && sel.j === j
                    ? 'bg-emerald-200 font-bold text-emerald-800'
                    : ''
                "
                @click="sel = { i, j }"
              >
                {{ val }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 계산식 -->
    <div class="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-center text-sm">
      <template v-if="sel">
        <b class="text-emerald-700">{{ labelC }}</b> 의
        <b>{{ sel.i + 1 }}행 {{ sel.j + 1 }}열</b> =
        <span class="text-indigo-700">{{ labelA }}의 {{ sel.i + 1 }}행</span> ·
        <span class="text-pink-700">{{ labelB }}의 {{ sel.j + 1 }}열</span><br />
        =
        <span v-for="(t, idx) in terms" :key="idx">
          <span v-if="idx > 0"> + </span>
          <span class="text-indigo-700">{{ t.av }}</span>×<span class="text-pink-700">{{ t.bv }}</span>
        </span>
        = <b class="text-emerald-700">{{ selValue }}</b>
      </template>
      <template v-else>
        👆 초록색 결과({{ labelC }})의 칸을 눌러보세요. 그 칸이 어떻게 계산되는지 보여줍니다.
      </template>
    </div>
  </div>
</template>
