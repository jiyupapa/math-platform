<script setup lang="ts">
// 1장 전용 인터랙티브 — 히스토그램 만들기.
// 계급(구간) 폭 슬라이더를 움직이면 같은 데이터가 다르게 뭉쳐 보이는 것을 확인한다.
// 평균(빨강 점선)·중앙값(파랑 점선) 위치도 함께 표시.
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 히스토그램으로 묶을 원본 데이터 (기본: 학생 40명의 키 cm) */
    data?: number[]
    label?: string
  }>(),
  {
    data: () => [
      152, 155, 158, 159, 160, 161, 162, 163, 163, 164,
      165, 165, 166, 166, 167, 167, 168, 168, 168, 169,
      169, 170, 170, 170, 171, 171, 172, 172, 173, 173,
      174, 175, 175, 176, 177, 178, 180, 182, 185, 188,
    ],
    label: '학생 40명의 키 (cm)',
  },
)

const binWidth = ref(5)

const W = 440
const H = 220
const PAD_L = 30
const PAD_B = 30
const PAD_T = 14

const stats = computed(() => {
  const s = [...props.data].sort((a, b) => a - b)
  const mean = s.reduce((a, b) => a + b, 0) / s.length
  const m = Math.floor(s.length / 2)
  const median = s.length % 2 === 1 ? s[m] : (s[m - 1] + s[m]) / 2
  return { min: s[0], max: s[s.length - 1], mean, median }
})

interface Bin {
  start: number
  end: number
  count: number
}

const bins = computed<Bin[]>(() => {
  const w = binWidth.value
  const start = Math.floor(stats.value.min / w) * w
  const end = Math.floor(stats.value.max / w) * w + w
  const out: Bin[] = []
  for (let b = start; b < end; b += w) out.push({ start: b, end: b + w, count: 0 })
  for (const v of props.data) {
    const idx = Math.min(out.length - 1, Math.floor((v - start) / w))
    out[idx].count++
  }
  return out
})

const maxCount = computed(() => Math.max(...bins.value.map((b) => b.count), 1))
const domain = computed(() => ({
  lo: bins.value[0].start,
  hi: bins.value[bins.value.length - 1].end,
}))

const sx = (v: number) =>
  PAD_L + ((v - domain.value.lo) / (domain.value.hi - domain.value.lo)) * (W - PAD_L - 10)
const sy = (c: number) => H - PAD_B - (c / maxCount.value) * (H - PAD_B - PAD_T)

const fmt = (n: number) => Number(n.toFixed(1)).toString()
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-2 text-sm font-medium text-slate-600">{{ label }}</p>

    <div class="flex justify-center">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        :width="W"
        :height="H"
        class="max-w-full rounded-lg border border-slate-100 bg-slate-50"
      >
        <!-- 막대 -->
        <g v-for="(b, i) in bins" :key="i">
          <rect
            :x="sx(b.start) + 1"
            :y="sy(b.count)"
            :width="Math.max(1, sx(b.end) - sx(b.start) - 2)"
            :height="H - PAD_B - sy(b.count)"
            fill="#818cf8"
            stroke="#6366f1"
            stroke-width="1"
            rx="2"
          />
          <text
            v-if="b.count > 0"
            :x="(sx(b.start) + sx(b.end)) / 2"
            :y="sy(b.count) - 4"
            text-anchor="middle"
            fill="#64748b"
            class="text-[9px]"
          >
            {{ b.count }}
          </text>
        </g>

        <!-- x축 + 눈금 -->
        <line :x1="PAD_L" :y1="H - PAD_B" :x2="W - 10" :y2="H - PAD_B" stroke="#94a3b8" stroke-width="1.5" />
        <g v-for="(b, i) in bins" :key="'t' + i">
          <text :x="sx(b.start)" :y="H - PAD_B + 14" text-anchor="middle" fill="#94a3b8" class="text-[9px]">
            {{ b.start }}
          </text>
        </g>
        <text :x="sx(domain.hi)" :y="H - PAD_B + 14" text-anchor="middle" fill="#94a3b8" class="text-[9px]">
          {{ domain.hi }}
        </text>

        <!-- 평균/중앙값 세로선 -->
        <line
          :x1="sx(stats.mean)"
          :y1="PAD_T"
          :x2="sx(stats.mean)"
          :y2="H - PAD_B"
          stroke="#ef4444"
          stroke-width="1.5"
          stroke-dasharray="5 4"
        />
        <text :x="sx(stats.mean) + 4" :y="PAD_T + 8" fill="#ef4444" class="text-[9px] font-bold">
          평균 {{ fmt(stats.mean) }}
        </text>
        <line
          :x1="sx(stats.median)"
          :y1="PAD_T + 14"
          :x2="sx(stats.median)"
          :y2="H - PAD_B"
          stroke="#3b82f6"
          stroke-width="1.5"
          stroke-dasharray="5 4"
        />
        <text :x="sx(stats.median) + 4" :y="PAD_T + 26" fill="#3b82f6" class="text-[9px] font-bold">
          중앙값 {{ fmt(stats.median) }}
        </text>
      </svg>
    </div>

    <!-- 계급 폭 슬라이더 -->
    <div class="mt-3 px-1">
      <label class="flex items-center gap-3 text-sm">
        <span class="w-32 shrink-0 text-slate-500">
          계급 폭 = <b class="text-slate-800">{{ binWidth }}cm</b>
        </span>
        <input v-model.number="binWidth" type="range" min="2" max="20" step="1" class="flex-1 accent-indigo-500" />
      </label>
    </div>

    <!-- 상태 칩 -->
    <div class="mt-3 flex flex-wrap gap-2 text-sm">
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">데이터 = <b>{{ data.length }}명</b></span>
      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">계급 수 = <b>{{ bins.length }}</b></span>
      <span class="rounded-lg bg-rose-50 px-3 py-1.5 text-rose-700">평균 = <b>{{ fmt(stats.mean) }}</b></span>
      <span class="rounded-lg bg-blue-50 px-3 py-1.5 text-blue-700">중앙값 = <b>{{ fmt(stats.median) }}</b></span>
    </div>

    <p class="mt-2 px-1 text-xs leading-relaxed text-slate-500">
      계급 폭을 움직여 보세요. <b>너무 좁으면</b> 들쭉날쭉해서 모양이 안 보이고,
      <b>너무 넓으면</b> 뭉개져서 정보가 사라집니다. 적당한 폭에서 "가운데가 볼록한" 분포 모양이 드러나요.
    </p>
  </div>
</template>
