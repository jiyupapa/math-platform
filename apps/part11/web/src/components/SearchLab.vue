<script setup lang="ts">
// 8장 실험실 — 갈림길 지도(탐색 트리)에서 좋은 길 찾기. 완전 결정적(난수 없음).
// 3단계 선택 · 분기 3 = 3^3 = 27 경로. 노드값은 하드코딩(함정 내장):
// 레벨1 최고점 A(그리디 미끼)는 나쁜 총점으로 이어지고, 진짜 보물은 레벨1 최저점 C 아래 숨어 있다.
// 전략별 총점·방문 노드 수는 노트북(ch08_search.ipynb)과 비트 단위로 일치(assert).
import { ref, computed } from 'vue'

// 레벨1 노드값 (가지 A·B·C)
const L1 = [10, 8, 6]
const L1_NAME = ['A', 'B', 'C']
// 레벨2 노드값 (가지별 3자식)
const L2 = [
  [3, 2, 1], // A
  [4, 3, 2], // B
  [3, 5, 1], // C
]
// 레벨3 리프값 (가지·중간노드별 3자식)
const L3 = [
  [[2, 1, 1], [1, 1, 6], [1, 1, 1]], // A
  [[3, 15, 2], [2, 2, 1], [1, 1, 1]], // B
  [[1, 1, 1], [2, 1, 1], [30, 1, 1]], // C
]

interface Result {
  path: [number, number, number] // [L1, L2, L3] 인덱스
  total: number
  visited: Set<string> // "1-0", "2-0-1" 등 방문한 노드 id
}
const nid = (a: number, b?: number, c?: number) =>
  c !== undefined ? `${a}-${b}-${c}` : b !== undefined ? `${a}-${b}` : `${a}`

// 탐욕: 매 레벨에서 노드값 최고만 따라간다
function greedy(): Result {
  const v = new Set<string>()
  let i1 = 0
  for (let i = 0; i < 3; i++) { v.add(nid(i)); if (L1[i] > L1[i1]) i1 = i }
  let i2 = 0
  for (let i = 0; i < 3; i++) { v.add(nid(i1, i)); if (L2[i1][i] > L2[i1][i2]) i2 = i }
  let i3 = 0
  for (let i = 0; i < 3; i++) { v.add(nid(i1, i2, i)); if (L3[i1][i2][i] > L3[i1][i2][i3]) i3 = i }
  return { path: [i1, i2, i3], total: L1[i1] + L2[i1][i2] + L3[i1][i2][i3], visited: v }
}

// 빔 서치: 부분합 기준 상위 k개 부분경로만 유지하며 전진
function beam(k: number): Result {
  const v = new Set<string>()
  // 레벨1
  let cand = L1.map((s, i) => ({ path: [i], sum: s }))
  cand.forEach((c) => v.add(nid(c.path[0])))
  cand = cand.sort((a, b) => b.sum - a.sum).slice(0, k)
  // 레벨2
  let next: { path: number[]; sum: number }[] = []
  for (const c of cand) {
    const i1 = c.path[0]
    for (let i = 0; i < 3; i++) { v.add(nid(i1, i)); next.push({ path: [i1, i], sum: c.sum + L2[i1][i] }) }
  }
  cand = next.sort((a, b) => b.sum - a.sum).slice(0, k)
  // 레벨3
  next = []
  for (const c of cand) {
    const [i1, i2] = c.path
    for (let i = 0; i < 3; i++) { v.add(nid(i1, i2, i)); next.push({ path: [i1, i2, i], sum: c.sum + L3[i1][i2][i] }) }
  }
  const win = next.sort((a, b) => b.sum - a.sum)[0]
  return { path: win.path as [number, number, number], total: win.sum, visited: v }
}

// 전수: 모든 경로 평가
function exhaustive(): Result {
  const v = new Set<string>()
  let best: Result = { path: [0, 0, 0], total: -Infinity, visited: v }
  for (let a = 0; a < 3; a++) {
    v.add(nid(a))
    for (let b = 0; b < 3; b++) {
      v.add(nid(a, b))
      for (let c = 0; c < 3; c++) {
        v.add(nid(a, b, c))
        const t = L1[a] + L2[a][b] + L3[a][b][c]
        if (t > best.total) best = { path: [a, b, c], total: t, visited: v }
      }
    }
  }
  return best
}

const STRATS = [
  { key: 'greedy', label: '탐욕', desc: '매 갈림에서 최고점만', run: greedy },
  { key: 'beam2', label: '빔 k=2', desc: '상위 2길 유지', run: () => beam(2) },
  { key: 'beam3', label: '빔 k=3', desc: '상위 3길 유지', run: () => beam(3) },
  { key: 'full', label: '전수 탐색', desc: '모든 길 확인', run: exhaustive },
] as const

const active = ref<string>('greedy')
const result = computed(() => STRATS.find((s) => s.key === active.value)!.run())
const pathId = computed(() => {
  const [a, b, c] = result.value.path
  return { l1: nid(a), l2: nid(a, b), l3: nid(a, b, c) }
})
const pathLabel = computed(() => {
  const [a, b, c] = result.value.path
  return `${L1_NAME[a]}${b + 1}${c + 1}`
})
// 전수 최적(항상 같은 값) — 비교 기준
const optimum = exhaustive().total

function cellClass(id: string, path: string) {
  if (id === path) return 'bg-indigo-600 text-white ring-2 ring-indigo-700'
  if (result.value.visited.has(id)) return 'bg-amber-100 text-amber-800'
  return 'bg-slate-100 text-slate-600'
}

// 지수 폭발 미니 계산기
const bf = ref(3)
const depth = ref(4)
const paths = computed(() => Math.pow(bf.value, depth.value))
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 전략 고르기 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 길찾기 전략: 3단계 갈림길(가지 3개씩, 총 3³=27 경로)에서 최고 총점을 찾아라</p>
    <div class="mb-3 flex flex-wrap gap-1.5">
      <button
        v-for="s in STRATS"
        :key="s.key"
        type="button"
        class="rounded-lg border px-2.5 py-1 text-sm transition-colors"
        :class="active === s.key ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="active = s.key"
      >
        {{ s.label }} <span class="text-xs text-slate-600">· {{ s.desc }}</span>
      </button>
    </div>

    <!-- ② 트리 -->
    <div class="space-y-2 rounded-lg bg-slate-50 p-3">
      <div class="grid grid-cols-3 gap-2">
        <div v-for="(a) in [0, 1, 2]" :key="a" class="rounded-md bg-white p-2 ring-1 ring-slate-200">
          <!-- 레벨1 -->
          <div
            class="mb-1 flex items-center justify-center rounded py-1 text-sm font-bold transition-colors"
            :class="cellClass(nid(a), pathId.l1)"
          >
            {{ L1_NAME[a] }} · {{ L1[a] }}점
          </div>
          <!-- 레벨2 + 레벨3 -->
          <div class="space-y-1">
            <div v-for="(b) in [0, 1, 2]" :key="b" class="rounded bg-slate-50 p-1">
              <div
                class="mb-0.5 flex items-center justify-center rounded py-0.5 text-xs font-semibold transition-colors"
                :class="cellClass(nid(a, b), pathId.l2)"
              >
                +{{ L2[a][b] }}
              </div>
              <div class="flex gap-0.5">
                <div
                  v-for="(c) in [0, 1, 2]"
                  :key="c"
                  class="flex-1 rounded py-0.5 text-center text-xs font-mono transition-colors"
                  :class="cellClass(nid(a, b, c), pathId.l3)"
                >
                  {{ L3[a][b][c] }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p class="text-xs text-slate-600">
        <span class="rounded bg-indigo-600 px-1 text-white">진함</span> = 고른 길 ·
        <span class="rounded bg-amber-100 px-1 text-amber-800">노랑</span> = 이 전략이 실제로 확인한 노드 ·
        회색 = 안 본 노드(가지치기)
      </p>
    </div>

    <!-- ③ 결과 -->
    <div class="mt-3 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-lg bg-slate-50 p-2">
        <div class="text-xs text-slate-600">찾은 길</div>
        <div class="font-mono text-lg font-bold text-slate-800">{{ pathLabel }}</div>
      </div>
      <div class="rounded-lg p-2" :class="result.total === optimum ? 'bg-emerald-50' : 'bg-rose-50'">
        <div class="text-xs" :class="result.total === optimum ? 'text-emerald-700' : 'text-rose-700'">총점 (최적 {{ optimum }})</div>
        <div class="text-lg font-bold" :class="result.total === optimum ? 'text-emerald-700' : 'text-rose-700'">{{ result.total }}</div>
      </div>
      <div class="rounded-lg bg-indigo-50 p-2">
        <div class="text-xs text-indigo-600">방문 노드</div>
        <div class="text-lg font-bold text-indigo-700">{{ result.visited.size }} / 39</div>
      </div>
    </div>
    <p
      class="mt-2 rounded-md px-3 py-2 text-sm font-medium"
      :class="result.total === optimum ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'"
    >
      <template v-if="active === 'greedy'">
        😱 탐욕은 첫 갈림의 최고점 A(10)만 보고 따라갔다가 총점 15에 갇힙니다. 정작 보물은 최저점 C(6) 아래 숨어 있었죠.
      </template>
      <template v-else-if="active === 'beam2'">
        빔 k=2는 길 2개를 들고 가 18점. 탐욕보다 낫지만 아직 B의 큰 잎(15)도, C의 보물도 못 봤습니다.
      </template>
      <template v-else-if="active === 'beam3'">
        빔 k=3은 27점. B의 큰 잎(15)을 찾았지만, C 아래 최적(37)은 부분합이 낮아 레벨2에서 가지치기됐습니다.
      </template>
      <template v-else>
        🏆 전수 탐색만 진짜 최적 37점을 찾습니다. 대신 노드를 39개 전부 봐야 했죠. 품질의 값은 방문 수입니다.
      </template>
    </p>

    <!-- ④ 지수 폭발 -->
    <div class="mt-4 rounded-lg border border-slate-200 p-3">
      <p class="mb-2 text-sm font-semibold text-slate-500">④ 왜 전수 탐색은 대개 불가능한가: 경우의 수 = 분기^깊이</p>
      <div class="flex flex-wrap items-center gap-4 text-sm">
        <label class="flex items-center gap-2">
          분기 <input v-model.number="bf" type="range" min="2" max="8" class="w-24 accent-indigo-600" /> <b>{{ bf }}</b>
        </label>
        <label class="flex items-center gap-2">
          깊이 <input v-model.number="depth" type="range" min="1" max="15" class="w-24 accent-indigo-600" /> <b>{{ depth }}</b>
        </label>
      </div>
      <p class="mt-2 text-sm text-slate-700">
        경로 수 = <b class="font-mono">{{ bf }}<sup>{{ depth }}</sup> = {{ paths.toLocaleString() }}</b>
        <template v-if="paths > 1e9"> (10억을 넘겨 전수 탐색은 사실상 불가능합니다)</template>
        <template v-else-if="paths > 1e5"> (벌써 십만 단위. 깊이를 몇 칸만 늘려도 폭발합니다)</template>
      </p>
    </div>
  </div>
</template>
