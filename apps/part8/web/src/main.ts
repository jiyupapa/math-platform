import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { storagePrefixKey, reviewApiKey, notebookResolverKey, searchIndexKey, partNumberKey, initTheme } from '@series/ui'
import { initAuth } from '@series/store'
import { useReviewStore } from '@/stores/review'
import { chapters } from '@/data/chapters'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia).use(router)

// 공용 컴포넌트(@series/ui)가 inject 로 받는 앱별 구현을 주입.
// 접두사 'opt' = 이 부(최적화)의 localStorage 네임스페이스 — 바꾸면 진도 저장이 끊긴다.
const review = useReviewStore(pinia)
app.provide(storagePrefixKey, 'opt')
app.provide(reviewApiKey, {
  isFlagged: (id: string) => review.isFlagged(id),
  toggle: (item: { id: string; chapter: string; label: string }) => review.toggle(item),
})
app.provide(notebookResolverKey, (slug: string | null) =>
  slug ? (chapters.find((c) => c.slug === slug)?.notebook ?? null) : null,
)
// 통합검색 인덱스 URL — 자기 BASE_URL 기준(=자기 public). SearchPalette 가 fetch.
app.provide(searchIndexKey, import.meta.env.BASE_URL + 'search-index.json')
// 부 번호 = 협업 주석(메모·질문) 게이트 — 이 주입이 있는 부에서만 💬 마커가 렌더된다.
// 값은 Supabase annotations.part 와 같아야 한다(부가 섞이면 남의 부 메모가 보인다).
app.provide(partNumberKey, 8)

// Supabase 세션 복원 (env 미설정 시 no-op — 로그인 시 진도 동기화)
void initAuth()
// 테마(시스템/라이트/다크) — 색은 CSS 가 처리하고, 여기선 저장된 선택을 싣고 OS 변경을 감지한다.
initTheme()

app.mount('#app')
