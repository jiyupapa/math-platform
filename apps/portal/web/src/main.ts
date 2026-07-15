import { createApp } from 'vue'
import { storagePrefixKey, searchIndexKey } from '@series/ui'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
app.use(router)
// 포털 자체 저장(진단 결과·북마크) 접두사 예약 — 각 부(la-/tf- …)와 구분되는 hub-*
app.provide(storagePrefixKey, 'hub')
// 통합검색 인덱스 URL — 자기 BASE_URL 기준(=자기 public). SearchPalette 가 fetch.
app.provide(searchIndexKey, import.meta.env.BASE_URL + 'search-index.json')
app.mount('#app')
