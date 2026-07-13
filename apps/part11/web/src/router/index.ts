import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

// 챕터 본문은 동적 import (코드 스플리팅). 전 13챕터 공개 완료(2026-07-13) —
// catch-all 은 잘못된 주소 안내용으로만 남아 있다.
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
  {
    path: '/ch/ch11',
    name: 'ch11',
    component: () => import('@/chapters/Chapter11.vue'),
  },
  {
    path: '/ch/ch12',
    name: 'ch12',
    component: () => import('@/chapters/Chapter12.vue'),
  },
  // 잘못된/예정 챕터 주소는 안내 페이지로
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
