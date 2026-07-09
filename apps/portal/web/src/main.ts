import { createApp } from 'vue'
import { storagePrefixKey } from '@series/ui'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
app.use(router)
// 포털 자체 저장(진단 결과·북마크) 접두사 예약 — 각 부(la-/tf- …)와 구분되는 hub-*
app.provide(storagePrefixKey, 'hub')
app.mount('#app')
