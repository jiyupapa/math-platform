import { createApp } from 'vue'
import { storagePrefixKey, searchIndexKey, initTheme } from '@series/ui'
import { initAuth } from '@series/store'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
app.use(router)
// 포털 자체 저장(진단 결과·북마크) 접두사 예약 — 각 부(la-/tf- …)와 구분되는 hub-*
app.provide(storagePrefixKey, 'hub')
// 통합검색 인덱스 URL — 자기 BASE_URL 기준(=자기 public). SearchPalette 가 fetch.
app.provide(searchIndexKey, import.meta.env.BASE_URL + 'search-index.json')
// Supabase 세션 복원 (env 미설정 시 no-op — 앱은 localStorage 만 사용, 현재 동작 불변)
void initAuth()
// 테마(시스템/라이트/다크) — 색은 CSS 가 처리하고, 여기선 저장된 선택을 싣고 OS 변경을 감지한다.
initTheme()

app.mount('#app')
