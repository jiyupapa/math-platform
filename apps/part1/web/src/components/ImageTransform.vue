<script setup lang="ts">
// 선형변환을 '진짜 이미지'에 적용 (ch5) — CSS transform: matrix(a,c,b,d,0,0) 가
// 우리가 배운 2×2 행렬과 정확히 같다. 회전·확대·전단·반사가 한눈에.
import { ref, computed, onBeforeUnmount } from 'vue'

const a = ref(1)
const b = ref(0)
const c = ref(0)
const d = ref(1)

const imgUrl = ref<string | null>(null)

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (imgUrl.value) URL.revokeObjectURL(imgUrl.value)
  imgUrl.value = URL.createObjectURL(file)
}
function clearImg() {
  if (imgUrl.value) URL.revokeObjectURL(imgUrl.value)
  imgUrl.value = null
}
onBeforeUnmount(() => {
  if (imgUrl.value) URL.revokeObjectURL(imgUrl.value)
})

// CSS matrix(m11, m12, m21, m22, e, f): x' = m11·x + m21·y, y' = m12·x + m22·y
// 우리의 [[a,b],[c,d]] (x'=ax+by, y'=cx+dy) 와 맞추려면 matrix(a, c, b, d, 0, 0)
const style = computed(() => ({
  transform: `matrix(${a.value}, ${c.value}, ${b.value}, ${d.value}, 0, 0)`,
}))

function preset(na: number, nb: number, nc: number, nd: number) {
  a.value = na
  b.value = nb
  c.value = nc
  d.value = nd
}
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-1 text-sm font-semibold text-slate-700">🖼️ 같은 행렬을 진짜 이미지에</p>
    <p class="mb-3 text-sm text-slate-500">
      CSS의 <code>matrix(a, c, b, d)</code> 는 우리가 배운 <b>2×2 행렬과 똑같아요</b>. 사진 편집·게임·컴퓨터비전이
      바로 이 변환을 씁니다. 슬라이더를 움직이거나 본인 사진을 올려보세요.
    </p>

    <div class="flex flex-col gap-4 lg:flex-row">
      <!-- 변환 무대 -->
      <div
        class="relative mx-auto flex h-[240px] w-[240px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50"
        style="background-image: linear-gradient(#eef2f7 1px, transparent 1px), linear-gradient(90deg, #eef2f7 1px, transparent 1px); background-size: 24px 24px"
      >
        <div class="origin-center transition-transform duration-150" :style="style">
          <!-- 업로드 이미지 -->
          <img v-if="imgUrl" :src="imgUrl" alt="내 이미지" class="block max-h-[150px] max-w-[150px] object-contain" />
          <!-- 기본: 비대칭 글자 R (회전·반사가 한눈에) -->
          <div
            v-else
            class="flex h-[120px] w-[120px] items-center justify-center rounded-md bg-indigo-600 text-7xl font-black text-white"
          >
            R
          </div>
        </div>
      </div>

      <div class="flex-1">
        <div class="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <label class="flex items-center gap-2"><span class="w-5 font-mono">a</span>
            <input v-model.number="a" type="range" min="-2" max="2" step="0.1" class="flex-1" /><span class="w-8 text-right font-mono">{{ a.toFixed(1) }}</span></label>
          <label class="flex items-center gap-2"><span class="w-5 font-mono">b</span>
            <input v-model.number="b" type="range" min="-2" max="2" step="0.1" class="flex-1" /><span class="w-8 text-right font-mono">{{ b.toFixed(1) }}</span></label>
          <label class="flex items-center gap-2"><span class="w-5 font-mono">c</span>
            <input v-model.number="c" type="range" min="-2" max="2" step="0.1" class="flex-1" /><span class="w-8 text-right font-mono">{{ c.toFixed(1) }}</span></label>
          <label class="flex items-center gap-2"><span class="w-5 font-mono">d</span>
            <input v-model.number="d" type="range" min="-2" max="2" step="0.1" class="flex-1" /><span class="w-8 text-right font-mono">{{ d.toFixed(1) }}</span></label>
        </div>

        <p class="mb-3 font-mono text-sm text-slate-700">
          행렬 = [[{{ a.toFixed(1) }}, {{ b.toFixed(1) }}], [{{ c.toFixed(1) }}, {{ d.toFixed(1) }}]]
        </p>

        <div class="mb-3 flex flex-wrap gap-2">
          <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100" @click="preset(1, 0, 0, 1)">초기화</button>
          <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100" @click="preset(1.5, 0, 0, 1.5)">확대</button>
          <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100" @click="preset(0, -1, 1, 0)">회전</button>
          <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100" @click="preset(1, 0.6, 0, 1)">전단</button>
          <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100" @click="preset(-1, 0, 0, 1)">좌우 반사</button>
        </div>

        <div class="flex items-center gap-3 text-sm">
          <label class="cursor-pointer rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700">
            내 사진 올리기
            <input type="file" accept="image/*" class="hidden" @change="onFile" />
          </label>
          <button v-if="imgUrl" class="text-xs text-slate-500 underline" @click="clearImg">기본 이미지로</button>
          <span class="text-xs text-slate-400">사진은 기기 안에서만 처리돼요 (업로드 안 함)</span>
        </div>
      </div>
    </div>
  </div>
</template>
