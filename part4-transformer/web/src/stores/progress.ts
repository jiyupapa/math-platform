import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { availableChapters } from '@/data/chapters'

// 학습 진도 스토어. 완료한 챕터 슬러그를 localStorage 에 저장한다.
const STORAGE_KEY = 'tf-progress-v1'

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    // 손상된 저장값(배열이 아니거나 문자열이 아닌 원소)이 앱을 깨뜨리지 않게 형태 검증
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : []
  } catch {
    return []
  }
}

export const useProgressStore = defineStore('progress', () => {
  const completed = ref<string[]>(load())

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed.value))
    } catch {
      /* localStorage 사용 불가 환경은 무시 */
    }
  }

  function isDone(slug: string): boolean {
    return completed.value.includes(slug)
  }

  function markDone(slug: string) {
    if (!completed.value.includes(slug)) {
      completed.value.push(slug)
      persist()
    }
  }

  function reset(slug: string) {
    completed.value = completed.value.filter((s) => s !== slug)
    persist()
  }

  const completedCount = computed(() => completed.value.length)
  const totalCount = computed(() => availableChapters.length)
  const percent = computed(() =>
    totalCount.value === 0 ? 0 : Math.round((completedCount.value / totalCount.value) * 100),
  )

  return { completed, isDone, markDone, reset, completedCount, totalCount, percent }
})
