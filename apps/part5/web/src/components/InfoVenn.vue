<script setup lang="ts">
// 정보 벤다이어그램 — 실제 날씨 X 와 일기예보 Y 의 연관도(같은 값일 확률 s)를 조절하면
// 결합분포 표와 벤다이어그램(두 원의 겹침 = 상호정보량 I)이 함께 변한다.
// H(X)=H(Y)=1비트로 고정하고, H(X|Y)=h(s), I=1−h(s) 를 실시간으로 보여 준다.
// s=0(항상 반대)에서도 I=1 이 되는 반전 포인트까지 체감시킨다.
import { ref, computed } from 'vue'

// s = X 와 Y 가 같은 값일 확률. 주변분포는 각각 반반으로 고정.
const s = ref(0.9)

// 이진 엔트로피 h(s) — 3장의 역U 곡선
function binH(p: number): number {
  if (p <= 0 || p >= 1) return 0
  return p * Math.log2(1 / p) + (1 - p) * Math.log2(1 / (1 - p))
}
const H_X = 1 // 주변분포 반반 → 1비트 (고정)
const condH = computed(() => binH(s.value)) // H(X|Y) = h(s)
const I = computed(() => H_X - condH.value) // I(X;Y) = 1 − h(s)

// 2×2 결합분포: p(같음)=s 를 두 칸에 반씩, p(다름)=1−s 를 두 칸에 반씩
const joint = computed(() => ({
  rainRain: s.value / 2, // X=비, Y=비 예보
  rainSun: (1 - s.value) / 2,
  sunRain: (1 - s.value) / 2,
  sunSun: s.value / 2,
}))

// ── 벤다이어그램: 두 원의 중심 거리로 겹침(I)을 표현 ──────────
const W = 340
const HEIGHT = 170
const R = 62
const CY = 82
const MID = W / 2
// I=0 이면 두 원이 딱 접하고(offset=R), I=1 이면 완전히 포개진다(offset=0)
const offset = computed(() => R * (1 - I.value))
const cx1 = computed(() => MID - offset.value)
const cx2 = computed(() => MID + offset.value)

const presets = [
  { label: '🎲 독립 (s=0.5)', v: 0.5 },
  { label: '🌤️ 조금 연관 (0.75)', v: 0.75 },
  { label: '🎯 강한 연관 (0.9)', v: 0.9 },
  { label: '🔗 완전 동기 (1.0)', v: 1 },
  { label: '🙃 완전 반대 (0.0)', v: 0 },
]
</script>

<template>
  <div class="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p class="mb-3 text-sm font-semibold text-slate-700">
      🔵 정보 벤다이어그램: 예보와 날씨의 연관도를 조절해 보세요
    </p>

    <!-- 프리셋 + 슬라이더 -->
    <div class="mb-2 flex flex-wrap gap-1.5">
      <button
        v-for="pr in presets"
        :key="pr.label"
        class="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="
          Math.abs(s - pr.v) < 0.005
            ? 'border-indigo-400 bg-indigo-100 text-indigo-800'
            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
        "
        @click="s = pr.v"
      >
        {{ pr.label }}
      </button>
    </div>
    <div class="mb-3 flex items-center gap-3">
      <span class="w-44 shrink-0 text-right text-sm text-slate-600">
        예보가 맞을 확률 s = <b class="tabular-nums text-slate-800">{{ (s * 100).toFixed(0) }}%</b>
      </span>
      <input
        v-model.number="s"
        type="range"
        min="0"
        max="1"
        step="0.01"
        class="flex-1 accent-indigo-600"
        aria-label="예보가 맞을 확률"
      />
    </div>

    <div class="flex flex-wrap items-start gap-4">
      <!-- 결합분포 표 -->
      <div class="min-w-0">
        <p class="mb-1 text-xs font-semibold text-slate-500">결합분포 p(X, Y)</p>
        <table class="text-center text-sm">
          <thead>
            <tr class="text-xs text-slate-500">
              <th class="px-2 py-1"></th>
              <th class="px-2 py-1">예보: 비</th>
              <th class="px-2 py-1">예보: 맑음</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="px-2 py-1 text-xs text-slate-500">실제: 비</td>
              <td class="rounded bg-indigo-50 px-3 py-1.5 font-medium tabular-nums text-indigo-800">
                {{ joint.rainRain.toFixed(2) }}
              </td>
              <td class="rounded bg-slate-50 px-3 py-1.5 tabular-nums text-slate-600">
                {{ joint.rainSun.toFixed(2) }}
              </td>
            </tr>
            <tr>
              <td class="px-2 py-1 text-xs text-slate-500">실제: 맑음</td>
              <td class="rounded bg-slate-50 px-3 py-1.5 tabular-nums text-slate-600">
                {{ joint.sunRain.toFixed(2) }}
              </td>
              <td class="rounded bg-indigo-50 px-3 py-1.5 font-medium tabular-nums text-indigo-800">
                {{ joint.sunSun.toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
        <p class="mt-1 max-w-[13rem] text-xs leading-relaxed text-slate-500">
          대각선(예보 적중)에 확률이 몰릴수록 두 변수가 강하게 얽힙니다.
        </p>
      </div>

      <!-- 벤다이어그램 -->
      <svg :viewBox="`0 0 ${W} ${HEIGHT}`" class="min-w-0 max-w-sm flex-1 select-none">
        <circle :cx="cx1" :cy="CY" :r="R" fill="var(--c-emerald-500)" fill-opacity="0.35" stroke="var(--c-emerald-600)" stroke-width="1.5" />
        <circle :cx="cx2" :cy="CY" :r="R" fill="var(--c-indigo-500)" fill-opacity="0.35" stroke="var(--c-indigo-600)" stroke-width="1.5" />
        <!-- 원 이름 -->
        <text :x="cx1 - R * 0.45" :y="CY - R - 8" text-anchor="middle" font-size="11" fill="var(--c-emerald-600)" font-weight="bold">
          H(X) 실제 날씨 = 1비트
        </text>
        <text :x="cx2 + R * 0.45" :y="CY + R + 16" text-anchor="middle" font-size="11" fill="var(--c-indigo-600)" font-weight="bold">
          H(Y) 예보 = 1비트
        </text>
        <!-- 영역 라벨 -->
        <text v-if="I < 0.97" :x="cx1 - R * 0.55" :y="CY + 4" text-anchor="middle" font-size="10" fill="var(--c-emerald-700)">
          H(X|Y)
        </text>
        <text v-if="I < 0.97" :x="cx1 - R * 0.55" :y="CY + 17" text-anchor="middle" font-size="10" fill="var(--c-emerald-700)">
          {{ condH.toFixed(2) }}
        </text>
        <text v-if="I > 0.03" :x="MID" :y="CY + 4" text-anchor="middle" font-size="10" font-weight="bold" fill="var(--c-violet-600)">
          I(X;Y)
        </text>
        <text v-if="I > 0.03" :x="MID" :y="CY + 17" text-anchor="middle" font-size="10" font-weight="bold" fill="var(--c-violet-600)">
          {{ I.toFixed(2) }}
        </text>
        <text v-if="I < 0.97" :x="cx2 + R * 0.55" :y="CY + 4" text-anchor="middle" font-size="10" fill="var(--c-indigo-700)">
          H(Y|X)
        </text>
        <text v-if="I < 0.97" :x="cx2 + R * 0.55" :y="CY + 17" text-anchor="middle" font-size="10" fill="var(--c-indigo-700)">
          {{ condH.toFixed(2) }}
        </text>
      </svg>
    </div>

    <!-- 수치 요약 -->
    <div class="mt-3 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-lg bg-emerald-50 p-2">
        <p class="text-lg font-bold tabular-nums text-emerald-700">1.000</p>
        <p class="text-xs text-emerald-700">H(X): 예보 없이 남는 불확실성</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-2">
        <p class="text-lg font-bold tabular-nums text-slate-700">{{ condH.toFixed(3) }}</p>
        <p class="text-xs text-slate-500">H(X|Y): 예보를 본 뒤 남는 것</p>
      </div>
      <div class="rounded-lg bg-violet-50 p-2">
        <p class="text-lg font-bold tabular-nums text-violet-700">{{ I.toFixed(3) }}</p>
        <p class="text-xs text-violet-600">I(X;Y): 예보가 준 정보 (겹침)</p>
      </div>
    </div>

    <p class="mt-2 text-xs" :class="s <= 0.02 ? 'font-semibold text-violet-600' : 'text-slate-500'">
      <template v-if="s <= 0.02">
        🙃 항상 반대로 말하는 예보. 그런데 I = 1비트 만점! 틀리는 걸 알면 뒤집어 들으면
        되니까요. 상호정보량은 "맞느냐"가 아니라 <b>"얽혀 있느냐"</b>를 잽니다.
      </template>
      <template v-else-if="s >= 0.98">
        🔗 완벽한 예보: 겹침이 원 전체(I = 1비트), 예보만 보면 날씨를 다 압니다 (H(X|Y) = 0).
      </template>
      <template v-else-if="Math.abs(s - 0.5) < 0.02">
        🎲 동전 던지기 예보: 두 원이 떨어져 있어요(I = 0). 봐도 아무것도 안 줄어듭니다.
      </template>
      <template v-else>
        겹침(보라) = 예보가 대신 알려주는 부분 · 초승달(초록) = 예보를 봐도 남는 불확실성.
      </template>
    </p>
  </div>
</template>
