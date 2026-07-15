import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { storagePrefixKey, reviewApiKey, notebookResolverKey, searchIndexKey } from '@series/ui'
import { useReviewStore } from '@/stores/review'
import { chapters } from '@/data/chapters'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia).use(router)

// 공용 컴포넌트(@series/ui)가 inject 로 받는 앱별 구현을 주입.
// 접두사 'tf' = 이 부(트랜스포머)의 localStorage 네임스페이스 — 바꾸면 진도 저장이 끊긴다.
const review = useReviewStore(pinia)
app.provide(storagePrefixKey, 'tf')
app.provide(reviewApiKey, {
  isFlagged: (id: string) => review.isFlagged(id),
  toggle: (item: { id: string; chapter: string; label: string }) => review.toggle(item),
})
app.provide(notebookResolverKey, (slug: string | null) =>
  slug ? (chapters.find((c) => c.slug === slug)?.notebook ?? null) : null,
)
// 통합검색 인덱스 URL — 자기 BASE_URL 기준(=자기 public). SearchPalette 가 fetch.
app.provide(searchIndexKey, import.meta.env.BASE_URL + 'search-index.json')

app.mount('#app')
