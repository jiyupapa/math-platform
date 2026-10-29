<script setup lang="ts">
// 12부 공용 — 그림 읽기: 인과지도·저량-유량도를 한 단계씩 쌓아 가며 기호를 익힌다(수포자용 "처음부터").
// 단계마다 그림 데이터를 통째로 받아(steps) 그대로 그리고, 이번 단계에 새로 그린 것은 데이터의 mark 로 호박색 바탕을 깐다.
// 설명은 부모가 이름 붙은 슬롯 #s1, #s2 … 로 넣는다(문장 속 굵은 글씨·기호를 자유롭게 쓰려고).
// 그리기는 CldDiagram·SfdDiagram 이 한다 — 이 부품은 단계 전환만 맡는다.
import { computed, ref } from 'vue'
import CldDiagram from './CldDiagram.vue'
import SfdDiagram from './SfdDiagram.vue'
import type { CldStep, SfdStep } from '@/data/plot'

const props = withDefaults(
  defineProps<{
    kind: 'cld' | 'sfd'
    title: string
    steps: CldStep[] | SfdStep[]
    width?: number
    height?: number
  }>(),
  { width: 440, height: 200 },
)

const i = ref(0)
const step = computed(() => props.steps[i.value])
const cld = computed(() => (props.kind === 'cld' ? (step.value as CldStep) : null))
const sfd = computed(() => (props.kind === 'sfd' ? (step.value as SfdStep) : null))
const kindName = computed(() => (props.kind === 'cld' ? '인과지도' : '저량-유량도'))
</script>

<template>
  <div class="my-5 rounded-xl border border-indigo-100 bg-white p-4">
    <p class="mb-1 text-sm font-semibold text-slate-700">✏️ {{ title }}</p>
    <p class="mb-3 text-xs text-slate-500">
      단계 버튼이나 '다음'을 눌러 {{ kindName }}를 한 부분씩 그려 갑니다. 이번 단계에 새로 그린 부분은 노란 바탕으로 표시돼요.
    </p>

    <div class="flex flex-wrap gap-1.5" role="group" :aria-label="`${kindName} 그리기 단계`">
      <button
        v-for="(s, k) in steps"
        :key="k"
        type="button"
        class="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition"
        :class="k === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
        :aria-pressed="k === i"
        @click="i = k"
      >
        {{ k + 1 }}. {{ s.title }}
      </button>
    </div>

    <div class="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-2">
      <CldDiagram
        v-if="cld"
        :nodes="cld.nodes"
        :links="cld.links"
        :loops="cld.loops ?? []"
        :width="width"
        :height="height"
        :aria-label="`${kindName} ${i + 1}단계: ${step.title}`"
      />
      <SfdDiagram
        v-else-if="sfd"
        :stocks="sfd.stocks"
        :flows="sfd.flows ?? []"
        :aux="sfd.aux ?? []"
        :links="sfd.links ?? []"
        :width="width"
        :height="height"
        :aria-label="`${kindName} ${i + 1}단계: ${step.title}`"
      />
    </div>

    <div class="mt-3 text-sm leading-relaxed text-slate-700" aria-live="polite">
      <p class="mb-1 font-semibold text-indigo-700">{{ i + 1 }}단계 · {{ step.title }}</p>
      <template v-for="(_, k) in steps" :key="k">
        <div v-if="k === i"><slot :name="`s${k + 1}`" /></div>
      </template>
    </div>

    <div class="mt-3 flex items-center justify-between gap-2">
      <button
        type="button"
        class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-40"
        :disabled="i === 0"
        @click="i--"
      >
        ← 이전
      </button>
      <span class="text-xs text-slate-500">{{ i + 1 }} / {{ steps.length }}</span>
      <button
        type="button"
        class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40"
        :disabled="i === steps.length - 1"
        @click="i++"
      >
        다음 →
      </button>
    </div>
  </div>
</template>
