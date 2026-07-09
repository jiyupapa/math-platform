<script setup lang="ts">
// PCA 시각화 (ch8) — 데이터 구름에서 가장 넓게 퍼진 방향(주성분 PC1)을 찾고,
// 그 축으로 투영해 2D→1D 차원축소를 보여준다. 주성분 = 공분산행렬의 고유벡터.
import { ref, computed } from 'vue'

// 우상향으로 길쭉하게 퍼진 데이터 구름 (고정)
const pts: [number, number][] = [
  [-3, -1.5], [-2.4, -1.4], [-2, -0.7], [-1.4, -1], [-1, -0.2], [-0.6, -0.6],
  [0, 0.1], [0.4, -0.2], [0.8, 0.5], [1.2, 0.4], [1.6, 1.1], [2, 0.8],
  [2.4, 1.5], [3, 1.3], [-1.8, -0.4], [1, 0.9],
]
const n = pts.length

const VS = 320
const cc = VS / 2
const scale = 42

function toScreen(x: number, y: number) {
  return { X: cc + x * scale, Y: cc - y * scale }
}

const mean = computed(() => {
  let mx = 0, my = 0
  for (const [x, y] of pts) { mx += x; my += y }
  return { x: mx / n, y: my / n }
})
const cov = computed(() => {
  let sxx = 0, syy = 0, sxy = 0
  for (const [x, y] of pts) {
    const dx = x - mean.value.x
    const dy = y - mean.value.y
    sxx += dx * dx; syy += dy * dy; sxy += dx * dy
  }
  return { sxx: sxx / n, syy: syy / n, sxy: sxy / n }
})
// 2×2 대칭 공분산의 고유분해 (닫힌 공식)
const pca = computed(() => {
  const { sxx, syy, sxy } = cov.value
  const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy)
  const half = Math.sqrt(((sxx - syy) / 2) ** 2 + sxy * sxy)
  const l1 = (sxx + syy) / 2 + half // 큰 고유값 (PC1)
  const l2 = (sxx + syy) / 2 - half
  return { angle, l1, l2 }
})
const pc1 = computed(() => ({ x: Math.cos(pca.value.angle), y: Math.sin(pca.value.angle) }))
const pc2 = computed(() => ({ x: -Math.sin(pca.value.angle), y: Math.cos(pca.value.angle) }))
const ratio = computed(() => Math.round((pca.value.l1 / (pca.value.l1 + pca.value.l2)) * 100))

const m = computed(() => toScreen(mean.value.x, mean.value.y))
const pc1Tip = computed(() => {
  const len = 2.4 * Math.sqrt(pca.value.l1)
  return toScreen(mean.value.x + pc1.value.x * len, mean.value.y + pc1.value.y * len)
})
const pc2Tip = computed(() => {
  const len = 2.4 * Math.sqrt(pca.value.l2)
  return toScreen(mean.value.x + pc2.value.x * len, mean.value.y + pc2.value.y * len)
})

const project = ref(false)
// 각 점을 PC1 직선에 투영한 위치
const projected = computed(() =>
  pts.map(([x, y]) => {
    const dx = x - mean.value.x
    const dy = y - mean.value.y
    const t = dx * pc1.value.x + dy * pc1.value.y
    const px = mean.value.x + t * pc1.value.x
    const py = mean.value.y + t * pc1.value.y
    return { orig: toScreen(x, y), proj: toScreen(px, py) }
  }),
)
// PC1 직선 (화면 가로지르게)
const pc1Line = computed(() => ({
  a: toScreen(mean.value.x - pc1.value.x * 6, mean.value.y - pc1.value.y * 6),
  b: toScreen(mean.value.x + pc1.value.x * 6, mean.value.y + pc1.value.y * 6),
}))
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-3 text-sm text-slate-600">
      데이터 구름에서 <b style="color:#6366f1">PC1</b>(가장 넓게 퍼진 방향)과 <b style="color:#ec4899">PC2</b>(그다음)를
      찾았어요. 이게 <b>공분산행렬의 고유벡터</b>입니다. 아래 체크로 차원축소를 보세요.
    </p>

    <div class="flex flex-col gap-4 lg:flex-row">
      <svg :width="VS" :height="VS" :viewBox="`0 0 ${VS} ${VS}`" class="mx-auto shrink-0 rounded-lg bg-slate-50">
        <defs>
          <marker id="pca-1" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" /></marker>
          <marker id="pca-2" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#ec4899" /></marker>
        </defs>
        <line x1="0" :y1="cc" :x2="VS" :y2="cc" stroke="#eef2f7" stroke-width="1" />
        <line :x1="cc" y1="0" :x2="cc" :y2="VS" stroke="#eef2f7" stroke-width="1" />

        <!-- PC1 직선 (투영 모드) -->
        <line v-if="project" :x1="pc1Line.a.X" :y1="pc1Line.a.Y" :x2="pc1Line.b.X" :y2="pc1Line.b.Y" stroke="#c7d2fe" stroke-width="6" stroke-linecap="round" />

        <!-- 투영선 + 투영점 -->
        <template v-if="project">
          <line v-for="(p, i) in projected" :key="'pl' + i" :x1="p.orig.X" :y1="p.orig.Y" :x2="p.proj.X" :y2="p.proj.Y" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3 3" />
          <circle v-for="(p, i) in projected" :key="'pp' + i" :cx="p.proj.X" :cy="p.proj.Y" r="4" fill="#6366f1" />
        </template>

        <!-- 원본 점 -->
        <circle v-for="(p, i) in projected" :key="'o' + i" :cx="p.orig.X" :cy="p.orig.Y" r="4" :fill="project ? '#cbd5e1' : '#475569'" />

        <!-- 주성분 축 -->
        <line :x1="m.X" :y1="m.Y" :x2="pc1Tip.X" :y2="pc1Tip.Y" stroke="#6366f1" stroke-width="3" marker-end="url(#pca-1)" />
        <line :x1="m.X" :y1="m.Y" :x2="pc2Tip.X" :y2="pc2Tip.Y" stroke="#ec4899" stroke-width="3" marker-end="url(#pca-2)" />
        <circle :cx="m.X" :cy="m.Y" r="3" fill="#334155" />
      </svg>

      <div class="flex-1">
        <div class="rounded-lg bg-slate-50 p-3 text-sm">
          <p><b style="color:#6366f1">PC1</b> 방향이 담은 정보 비율 ≈ <b>{{ ratio }}%</b></p>
          <p class="mt-1 text-slate-600">
            → 2D를 PC1 하나(1D)로 줄여도 정보의 <b>{{ ratio }}%</b>가 남아요. (PC2의 {{ 100 - ratio }}%만 버림)
          </p>
        </div>

        <label class="mt-3 flex cursor-pointer items-center gap-2 text-sm">
          <input v-model="project" type="checkbox" class="h-4 w-4" />
          <span>PC1으로 투영 (2D → 1D 차원축소)</span>
        </label>
        <p class="mt-2 text-xs text-slate-400">
          체크하면 모든 점이 PC1 직선 위로 모여요 = 축 하나로 데이터를 요약(압축).
        </p>
      </div>
    </div>
  </div>
</template>
