<script setup lang="ts">
// 도입 현황 대시보드 (P3) — Supabase 집계 RPC(adoption_stats)로 익명 집계만 읽어
// 부별 진입자·완주율·이탈 지점을 보여준다. 로그인 사용자만. 개인 식별 정보는 없다.
import { ref, computed, onMounted } from 'vue'
import { currentUser, isBackendEnabled, fetchAdoptionStats, type AdoptionStats } from '@series/store'
import { PART_META } from '../data/useProgress'

const loading = ref(true)
const stats = ref<AdoptionStats | null>(null)

onMounted(async () => {
  if (currentUser.value) stats.value = await fetchAdoptionStats()
  loading.value = false
})

const chNum = (slug: string) => (slug === 'sample' ? '0' : slug.replace('ch', ''))

// 부별 파생 지표: 진입자·완료수·완주율(마지막 핵심 장 도달)·챕터별 도달 펀넬
const parts = computed(() => {
  const s = stats.value
  if (!s) return []
  const partUsers = new Map(s.per_part.map((p) => [p.part, p]))
  const chUsers = new Map(s.per_chapter.map((c) => [`${c.part}:${c.slug}`, c.users]))
  return PART_META.map((m) => {
    const pu = partUsers.get(m.part)
    const users = pu?.users ?? 0
    const completions = pu?.completions ?? 0
    const chapters = [...m.essential, ...m.advanced].map((slug) => ({
      slug,
      num: chNum(slug),
      users: chUsers.get(`${m.part}:${slug}`) ?? 0,
    }))
    const lastCore = m.essential[m.essential.length - 1]
    const finishers = chUsers.get(`${m.part}:${lastCore}`) ?? 0
    const rate = users > 0 ? Math.round((finishers / users) * 100) : 0
    const maxCh = Math.max(1, ...chapters.map((c) => c.users))
    return { ...m, users, completions, rate, finishers, chapters, maxCh }
  })
    .filter((p) => p.users > 0)
    .sort((a, b) => b.users - a.users)
})

const activeParts = computed(() => parts.value.length)
</script>

<template>
  <main class="mx-auto w-full max-w-3xl px-5 py-8">
    <h1 class="text-xl font-bold text-slate-800">도입 현황</h1>
    <p class="mt-1 text-sm text-slate-500">
      사내 학습자들의 진도 집계 — 부별 진입·완주·이탈 지점. (익명 집계, 개인 정보 없음)
    </p>

    <!-- 상태 안내 -->
    <p v-if="!isBackendEnabled()" class="mt-8 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      백엔드가 설정되지 않았어요. (VITE_SUPABASE_* 미설정)
    </p>
    <p v-else-if="!currentUser" class="mt-8 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      도입 현황을 보려면 <span class="font-medium text-indigo-600">로그인</span>이 필요해요.
    </p>
    <p v-else-if="loading" class="mt-8 text-center text-sm text-slate-500">불러오는 중…</p>
    <p v-else-if="!stats" class="mt-8 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      집계를 불러오지 못했어요. (adoption_stats 함수가 배포됐는지 확인)
    </p>

    <template v-else>
      <!-- KPI 타일 -->
      <div class="mt-6 grid grid-cols-3 gap-3">
        <div class="rounded-xl border border-slate-200 bg-white px-4 py-4">
          <div class="text-2xl font-bold text-slate-800">{{ stats.total_users }}</div>
          <div class="mt-0.5 text-xs text-slate-500">총 학습자</div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white px-4 py-4">
          <div class="text-2xl font-bold text-slate-800">{{ stats.total_completions }}</div>
          <div class="mt-0.5 text-xs text-slate-500">완료한 챕터(누적)</div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white px-4 py-4">
          <div class="text-2xl font-bold text-slate-800">{{ activeParts }}</div>
          <div class="mt-0.5 text-xs text-slate-500">참여 중인 부</div>
        </div>
      </div>

      <!-- 데이터 없음 -->
      <p v-if="!parts.length" class="mt-8 rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        아직 학습 진도 데이터가 없어요. 동료들이 로그인해 챕터를 완료하면 여기에 쌓입니다.
      </p>

      <!-- 부별 참여 + 이탈 펀넬 -->
      <div v-else class="mt-8 space-y-4">
        <h2 class="text-sm font-semibold text-slate-700">부별 참여와 이탈 지점</h2>
        <div
          v-for="p in parts"
          :key="p.part"
          class="rounded-xl border border-slate-200 bg-white px-4 py-4"
        >
          <div class="flex items-baseline justify-between">
            <span class="font-medium text-slate-800">{{ p.label }}</span>
            <span class="text-xs text-slate-500">
              진입 <b class="text-slate-700">{{ p.users }}</b>명 · 완주율
              <b class="text-emerald-600">{{ p.rate }}%</b>
            </span>
          </div>

          <!-- 완주율 바 (마지막 핵심 장 도달 기준) -->
          <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div class="h-full rounded-full bg-emerald-500 transition-all" :style="{ width: p.rate + '%' }" />
          </div>

          <!-- 이탈 펀넬 — 챕터별 도달 인원 (막대 높이 ∝ 인원) -->
          <div class="mt-4 flex items-end gap-[3px]">
            <div
              v-for="c in p.chapters"
              :key="c.slug"
              class="flex min-w-0 flex-1 flex-col items-center"
              :title="`${c.num}장 · ${c.users}명 도달`"
            >
              <div class="flex h-14 w-full items-end">
                <div
                  class="w-full rounded-t bg-indigo-500/85"
                  :style="{ height: (c.users ? Math.max(6, Math.round((c.users / p.maxCh) * 100)) : 0) + '%' }"
                />
              </div>
              <span class="mt-1 text-[9px] leading-none text-slate-500">{{ c.num }}</span>
            </div>
          </div>
          <p class="mt-1 text-[11px] text-slate-500">
            막대 = 각 장을 완료한 인원(왼→오 진행). 오른쪽으로 갈수록 낮아지면 그 지점이 이탈 구간.
          </p>
        </div>
      </div>
    </template>
  </main>
</template>
