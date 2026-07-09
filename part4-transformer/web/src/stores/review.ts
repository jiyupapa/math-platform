import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 복습 표시 스토어 — '복습 필요'로 체크한 섹션을 localStorage 에 저장한다.
const STORAGE_KEY = 'tf-review-v1'

export interface ReviewItem {
  /** 섹션 고유 id (앵커로도 사용). 예: 'ch2-s4' */
  id: string
  /** 챕터 슬러그. 예: 'ch2' */
  chapter: string
  /** 사람이 읽는 섹션 이름 */
  label: string
}

function load(): ReviewItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ReviewItem[]) : []
  } catch {
    return []
  }
}

export const useReviewStore = defineStore('review', () => {
  const items = ref<ReviewItem[]>(load())

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
    } catch {
      /* localStorage 불가 환경 무시 */
    }
  }

  function isFlagged(id: string): boolean {
    return items.value.some((i) => i.id === id)
  }

  function toggle(item: ReviewItem) {
    const idx = items.value.findIndex((i) => i.id === item.id)
    if (idx >= 0) items.value.splice(idx, 1)
    else items.value.push(item)
    persist()
  }

  function remove(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
    persist()
  }

  function clear() {
    items.value = []
    persist()
  }

  const count = computed(() => items.value.length)

  return { items, isFlagged, toggle, remove, clear, count }
})
