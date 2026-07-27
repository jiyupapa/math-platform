<script setup lang="ts">
// 인터랙티브 토큰화 실험실.
// 문장을 입력/선택하고 방식(단어·글자·서브워드)을 바꾸면, 토큰 조각과 사전 ID 가 실시간으로 갱신된다.
// 사전에 없는 토큰은 [UNK] 로 표시돼, "왜 서브워드가 필요한지"를 눈으로 보게 한다.
import { ref, computed } from 'vue'
import { tokenize, type TokenizeMode } from '@/utils/tokenizer'

const EXAMPLES = ['나는 밥을 먹었다', '오늘 날씨가 좋다', '토큰화는 재미있다']

const text = ref(EXAMPLES[0])
const mode = ref<TokenizeMode>('word')

const modes: { key: TokenizeMode; label: string; desc: string }[] = [
  { key: 'word', label: '단어 단위', desc: '띄어쓰기로 나눔 · 사전에 없으면 [UNK]' },
  { key: 'char', label: '글자 단위', desc: '한 글자씩 · [UNK]는 적지만 토큰이 많아짐' },
  { key: 'subword', label: '서브워드', desc: '아는 말은 통째로, 모르는 말은 조각으로 (진짜 LLM 방식)' },
]

const tokens = computed(() => tokenize(text.value, mode.value))
const unkCount = computed(() => tokens.value.filter((t) => t.unknown).length)

// 색상(토큰 구분용, UNK 는 별도)
const palette = ['var(--c-indigo-500)', 'var(--c-emerald-500)', 'var(--c-amber-500)', 'var(--c-pink-500)', 'var(--c-cyan-500)', 'var(--c-violet-500)']
</script>

<template>
  <div class="my-5 rounded-xl border border-slate-200 bg-white p-5">
    <!-- 문장 입력 -->
    <p class="mb-1 text-sm font-semibold text-slate-500">① 문장 — 직접 고치거나 예시를 눌러 보세요</p>
    <input
      v-model="text"
      type="text"
      class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
      placeholder="문장을 입력하세요"
    />
    <div class="mt-2 flex flex-wrap gap-2">
      <button
        v-for="ex in EXAMPLES"
        :key="ex"
        type="button"
        class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
        :class="text === ex ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : ''"
        @click="text = ex"
      >
        {{ ex }}
      </button>
    </div>

    <!-- 방식 선택 -->
    <p class="mt-4 mb-1 text-sm font-semibold text-slate-500">② 쪼개는 방식</p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="m in modes"
        :key="m.key"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
        :class="mode === m.key ? 'border-indigo-400 bg-indigo-50 text-indigo-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="mode = m.key"
      >
        {{ m.label }}
      </button>
    </div>
    <p class="mt-1.5 text-xs text-slate-500">{{ modes.find((m) => m.key === mode)?.desc }}</p>

    <!-- 토큰 결과 -->
    <p class="mt-4 mb-2 text-sm font-semibold text-slate-500">③ 토큰 — 조각 + 사전 ID(번호)</p>
    <div class="flex flex-wrap gap-2">
      <div
        v-for="(t, i) in tokens"
        :key="i"
        class="flex flex-col items-center rounded-lg border px-2.5 py-1.5"
        :class="t.unknown ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'"
      >
        <span class="text-sm font-semibold" :style="{ color: t.unknown ? 'var(--c-rose-600)' : palette[i % palette.length] }">
          {{ t.tok }}
        </span>
        <span class="font-mono text-xs tabular-nums text-slate-600">
          {{ t.unknown ? '[UNK]' : '#' + t.id }}
        </span>
      </div>
    </div>

    <!-- 요약 -->
    <div class="mt-4 rounded-lg bg-slate-50 px-4 py-2.5 text-sm text-slate-600">
      토큰 <b class="text-slate-800">{{ tokens.length }}개</b>
      <span v-if="unkCount > 0"> · 그중 <b class="text-rose-700">[UNK] {{ unkCount }}개</b>(사전에 없는 토큰)</span>
      <span v-else> · [UNK] 없음 👍</span>
    </div>
  </div>
</template>
