import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { storagePrefixKey, reviewApiKey } from '@series/ui'
import { useReviewStore } from '@/stores/review'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia).use(router)

// 공용 컴포넌트(@series/ui)가 inject 로 받는 앱별 구현을 주입.
// 접두사 'diff' = 이 부(미분)의 localStorage 네임스페이스 — 바꾸면 진도 저장이 끊긴다.
const review = useReviewStore(pinia)
app.provide(storagePrefixKey, 'diff')
app.provide(reviewApiKey, {
  isFlagged: (id: string) => review.isFlagged(id),
  toggle: (item: { id: string; chapter: string; label: string }) => review.toggle(item),
})

app.mount('#app')
