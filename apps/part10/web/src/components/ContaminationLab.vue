<script setup lang="ts">
// 8장 실험실 — 기출 유출(오염) 다이얼: 신의 시점 — 진짜 실력 60%, 유출(암기) 문항 정답률 95%.
//   오염률 f 만큼 벤치마크 문항이 훈련 데이터에 섞이면:
//     기존 벤치마크 점수 = f·95 + (1−f)·60   (인플레)
//     변형판(숫자·표현 바꿈)·신규 비공개 문제 = 60  (암기 무력화)
//   낙차 Δ = 기존 − 변형 = f × 35%p  →  오염률 역산 f̂ = Δ / 35
// 완전 결정적(해석적 — 난수 없음). 노트북(ch08_contamination.ipynb)과 동일 수식.
import { ref, computed } from 'vue'

const TRUE_P = 60 // 진짜 실력 (%)
const MEM_P = 95 // 유출 문항 정답률 (%)

const fPct = ref(40) // 오염률 (%)
const f = computed(() => fPct.value / 100)
const observed = computed(() => f.value * MEM_P + (1 - f.value) * TRUE_P)
const drop = computed(() => observed.value - TRUE_P) // = f × 35
const fHat = computed(() => (drop.value / (MEM_P - TRUE_P)) * 100)

const bars = computed(() => [
  { name: '기존 벤치마크 (공개 3년 차)', v: observed.value, cls: 'bg-rose-400', note: '유출 문항 포함' },
  { name: '변형판 (숫자·표현만 바꿈)', v: TRUE_P, cls: 'bg-indigo-400', note: '암기 무력화' },
  { name: '신규 비공개 문제 (홀드아웃)', v: TRUE_P, cls: 'bg-emerald-400', note: '같은 난이도로 새로 출제' },
])
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- ① 오염 다이얼 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">
      ① 오염 다이얼: 벤치마크 문항 중 몇 %가 훈련 데이터에 새어 들어갔나 (신의 시점: 진짜 실력 60%)
    </p>
    <div class="mb-2 flex items-center gap-3">
      <input v-model.number="fPct" type="range" min="0" max="100" step="5" class="w-full max-w-sm accent-rose-500" />
      <span class="font-mono text-sm font-bold text-rose-700">오염률 {{ fPct }}%</span>
      <span class="text-xs text-slate-500">(유출 문항은 암기로 {{ MEM_P }}% 정답)</span>
    </div>

    <!-- 헤드라인 -->
    <p class="mb-3 rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white">
      📰 "신모델, 벤치마크에서 <b class="text-amber-300">{{ observed.toFixed(1) }}점</b>{{ fPct > 0 ? `, 전 세대(60점) 대비 +${drop.toFixed(1)}점 도약!` : ' 기록' }}"
      <span v-if="fPct > 0" class="ml-2 text-xs text-slate-500">← 진짜 실력은 그대로 60인데요.</span>
    </p>

    <!-- 세 가지 시험 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">② 같은 모델, 세 가지 시험: 낙차가 오염의 지문입니다</p>
    <div class="space-y-2 rounded-lg bg-slate-50 p-4">
      <div v-for="b in bars" :key="b.name" class="flex items-center gap-3">
        <span class="w-56 shrink-0 text-xs font-medium text-slate-600">{{ b.name }}</span>
        <div class="relative h-6 flex-1 overflow-hidden rounded-md bg-white ring-1 ring-slate-200">
          <div class="h-full rounded-md transition-all duration-300" :class="b.cls" :style="{ width: b.v + '%' }" />
          <div class="absolute top-0 h-full border-l-2 border-dashed border-slate-500" :style="{ left: TRUE_P + '%' }" />
        </div>
        <span class="w-14 shrink-0 text-right font-mono text-sm font-bold text-slate-800">{{ b.v.toFixed(1) }}</span>
        <span class="hidden w-24 shrink-0 text-xs text-slate-500 sm:block">{{ b.note }}</span>
      </div>
      <p class="text-xs text-slate-500">점선 = 진짜 실력(60). 오염은 기존 벤치마크 막대만 부풀립니다.</p>
    </div>

    <!-- ③ 낙차 역산 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">③ 낙차로 오염률 역산: 탐정의 산수</p>
    <div class="flex flex-wrap items-center gap-3 rounded-lg p-3" :class="fPct > 0 ? 'bg-amber-50' : 'bg-slate-50'">
      <div class="rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-200">
        낙차 Δ = {{ observed.toFixed(1) }} − {{ TRUE_P }} = <b class="font-mono">{{ drop.toFixed(1) }}%p</b>
      </div>
      <span class="text-slate-500">→</span>
      <div class="rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-200">
        추정 오염률 f̂ = Δ ÷ 35 = <b class="font-mono text-rose-700">{{ fHat.toFixed(0) }}%</b>
      </div>
      <span v-if="Math.round(fHat) === fPct" class="text-sm font-semibold text-emerald-700">✓ 다이얼과 일치: 낙차가 오염률을 자백합니다</span>
    </div>
    <p class="mt-2 rounded-md bg-slate-100 px-3 py-2 text-xs leading-relaxed text-slate-600">
      ⚠️ 핵심: 이 부풀림은 <b>소음이 아니라 편향</b>이라, 문항 수를 아무리 늘려도(6장의 √n)
      사라지지 않습니다. 오차범위 밖의 "유의한 도약"도 오염이면 진짜가 아니에요.
      (35 = 암기 95 − 실력 60, 즉 유출 문항당 부풀림 폭)
    </p>
  </div>
</template>
