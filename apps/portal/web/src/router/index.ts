import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  // 진단 화면은 다음 단계에서 구현 — 지금은 안내 스텁
  { path: '/diagnose', name: 'diagnose', component: () => import('../views/DiagnoseView.vue') },
  // 학습 구조도 — 스윔레인 보드 (?node= 딥링크)
  { path: '/map', name: 'map', component: () => import('../views/StructureView.vue') },
]

const router = createRouter({
  // BASE_URL 을 따라 배포 base(루트 / 또는 하위 경로)에 맞춰 동작
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
