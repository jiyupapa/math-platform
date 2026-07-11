import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

// 챕터 본문은 동적 import (코드 스플리팅). 새 챕터를 추가하면 여기에 라우트를 더한다.
// 지금은 스캐폴드 — 모든 챕터가 예정(comingSoon)이라 안내 페이지로 모은다.
const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/review', name: 'review', component: () => import('@/views/ReviewView.vue') },
  {
    path: '/ch/sample',
    name: 'sample',
    component: () => import('@/chapters/SampleChapter.vue'),
  },
  {
    path: '/ch/ch1',
    name: 'ch1',
    component: () => import('@/chapters/Chapter1.vue'),
  },
  {
    path: '/ch/ch2',
    name: 'ch2',
    component: () => import('@/chapters/Chapter2.vue'),
  },
  {
    path: '/ch/ch3',
    name: 'ch3',
    component: () => import('@/chapters/Chapter3.vue'),
  },
  {
    path: '/ch/ch4',
    name: 'ch4',
    component: () => import('@/chapters/Chapter4.vue'),
  },
  {
    path: '/ch/ch5',
    name: 'ch5',
    component: () => import('@/chapters/Chapter5.vue'),
  },
  {
    path: '/ch/ch6',
    name: 'ch6',
    component: () => import('@/chapters/Chapter6.vue'),
  },
  {
    path: '/ch/ch7',
    name: 'ch7',
    component: () => import('@/chapters/Chapter7.vue'),
  },
  // 예정 챕터(comingSoon)는 안내 페이지로 모음
  {
    path: '/ch/:slug',
    name: 'chapter',
    component: () => import('@/views/ComingSoonView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, top: 80, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
