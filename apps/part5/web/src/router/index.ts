import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

// 챕터 본문은 동적 import (코드 스플리팅). 새 챕터를 추가하면 여기에 라우트를 더한다.
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
  {
    path: '/ch/ch8',
    name: 'ch8',
    component: () => import('@/chapters/Chapter8.vue'),
  },
  {
    path: '/ch/ch9',
    name: 'ch9',
    component: () => import('@/chapters/Chapter9.vue'),
  },
  {
    path: '/ch/ch10',
    name: 'ch10',
    component: () => import('@/chapters/Chapter10.vue'),
  },
  // 예정 챕터(comingSoon)는 안내 페이지로 모음
  {
    path: '/ch/:slug',
    name: 'chapter',
    component: () => import('@/views/ComingSoonView.vue'),
  },
  // 알 수 없는 경로는 홈으로 (SPA 폴백은 index.html 을 주지만 라우터엔 매치가 없어 빈 화면이 된다)
  { path: '/:pathMatch(.*)*', redirect: '/' },
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
