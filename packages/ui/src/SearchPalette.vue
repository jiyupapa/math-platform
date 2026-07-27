<script setup lang="ts">
// 통합검색 커맨드 팔레트 — ⌘K / Ctrl+K 로 열어 전 부의 장·개념을 가로질러 검색한다.
// 인덱스(search-index.json)는 각 앱 public/ 에 있고 BASE_URL 기준으로 fetch 한다(build-search-index.mjs 생성).
// 결과 클릭 → /partN/ch/<slug> 로 이동. PartLink 와 같은 규약이라 조립 배포본(같은 origin 하위 경로)에서
// 실제 동작하고, dev 단독 실행(부마다 다른 포트=다른 origin)에서는 다른 부로의 이동이 제약된다.
import {
  ref,
  shallowRef,
  computed,
  watch,
  nextTick,
  inject,
  onMounted,
  onBeforeUnmount,
} from 'vue'
import Fuse from 'fuse.js'
import { searchIndexKey } from './injection'

interface SearchEntry {
  id: string
  type: 'chapter' | 'concept'
  part: number
  partTitle: string
  slug: string
  title: string
  summary: string
  keywords: string
  advanced: boolean
  label: string
}

// vite/client 타입 의존 없이 안전하게 BASE_URL 접근 (PartLink 와 같은 패턴)
const envBase =
  ((import.meta as { env?: Record<string, unknown> }).env?.BASE_URL as string | undefined) ?? '/'
const indexUrl = inject(searchIndexKey, envBase + 'search-index.json')

const open = ref(false)
const query = ref('')
const active = ref(0)
const loaded = ref(false)
const loadError = ref(false)
const entries = shallowRef<SearchEntry[]>([])
const fuse = shallowRef<Fuse<SearchEntry> | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

async function ensureIndex() {
  if (loaded.value || loadError.value) return
  try {
    const res = await fetch(indexUrl)
    if (!res.ok) throw new Error(String(res.status))
    const data = (await res.json()) as { entries: SearchEntry[] }
    entries.value = data.entries ?? []
    fuse.value = new Fuse(entries.value, {
      keys: [
        { name: 'title', weight: 3 },
        { name: 'keywords', weight: 2 },
        { name: 'summary', weight: 1 },
        { name: 'partTitle', weight: 0.5 },
      ],
      threshold: 0.4,
      ignoreLocation: true, // 한국어: 위치 무관 부분일치
      minMatchCharLength: 2, // 1글자 노이즈(예: '학'→학습률…) 차단, 2글자+ 부분일치는 유지
    })
    loaded.value = true
  } catch {
    loadError.value = true
  }
}

const results = computed<SearchEntry[]>(() => {
  const q = query.value.trim()
  if (!q || !fuse.value) return []
  return fuse.value.search(q, { limit: 24 }).map((r) => r.item)
})

watch(results, () => {
  active.value = 0
})

async function openPalette() {
  open.value = true
  await ensureIndex()
  await nextTick()
  inputEl.value?.focus()
}
function closePalette() {
  open.value = false
  query.value = ''
}
function toggle() {
  if (open.value) closePalette()
  else openPalette()
}

function go(entry: SearchEntry) {
  window.location.assign(`/part${entry.part}/ch/${entry.slug}`)
}

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault()
    toggle()
    return
  }
  if (!open.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    closePalette()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (results.value.length) active.value = (active.value + 1) % results.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (results.value.length)
      active.value = (active.value - 1 + results.value.length) % results.value.length
  } else if (e.key === 'Enter') {
    const r = results.value[active.value]
    if (r) {
      e.preventDefault()
      go(r)
    }
  }
}

// 앱이 자체 버튼에서 window.dispatchEvent(new Event('open-search')) 로 팔레트를 열 수 있다.
function onExternalOpen() {
  openPalette()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('open-search', onExternalOpen as EventListener)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('open-search', onExternalOpen as EventListener)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/40 px-4 pt-[12vh]"
      @click.self="closePalette"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="통합검색"
        class="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200"
      >
        <div class="flex items-center gap-2 border-b border-slate-100 px-4">
          <span class="text-slate-500" aria-hidden="true">🔎</span>
          <input
            ref="inputEl"
            v-model="query"
            type="text"
            placeholder="장 제목·개념·용어로 검색 (예: 코사인 유사도, KL 발산, 파인튜닝)"
            class="w-full bg-transparent py-3.5 text-slate-800 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd
            class="hidden shrink-0 rounded border border-slate-200 px-1.5 py-0.5 text-xs text-slate-500 sm:inline"
            >Esc</kbd
          >
        </div>

        <div class="max-h-[60vh] overflow-y-auto">
          <p v-if="loadError" class="px-4 py-6 text-center text-sm text-slate-500">
            검색 인덱스를 불러오지 못했어요. 조립 배포본(<code>npm run deploy:build</code>)에서
            동작합니다.
          </p>

          <template v-else-if="query.trim()">
            <ul v-if="results.length">
              <li v-for="(r, i) in results" :key="r.id">
                <button
                  type="button"
                  class="flex w-full items-start gap-3 px-4 py-2.5 text-left"
                  :class="i === active ? 'bg-indigo-50' : 'hover:bg-slate-50'"
                  @mouseenter="active = i"
                  @click="go(r)"
                >
                  <span class="mt-0.5 shrink-0 text-base" aria-hidden="true">{{
                    r.type === 'concept' ? '🔑' : '📖'
                  }}</span>
                  <span class="min-w-0 flex-1">
                    <span class="flex items-center gap-1.5">
                      <span class="truncate font-medium text-slate-800">{{ r.title }}</span>
                      <span
                        v-if="r.advanced"
                        class="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700"
                        >심화</span
                      >
                    </span>
                    <span class="block truncate text-xs text-indigo-600">{{ r.label }}</span>
                    <span v-if="r.summary" class="block truncate text-xs text-slate-600">{{
                      r.summary
                    }}</span>
                  </span>
                </button>
              </li>
            </ul>
            <p v-else class="px-4 py-6 text-center text-sm text-slate-500">
              ‘{{ query }}’ 에 대한 결과가 없어요.
            </p>
          </template>

          <p v-else class="px-4 py-6 text-center text-sm text-slate-500">
            전 부의 장·개념 {{ entries.length }}개에서 검색합니다. ⌘K / Ctrl+K 로 언제든 열려요.
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
