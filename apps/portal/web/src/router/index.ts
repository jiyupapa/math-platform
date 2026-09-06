import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  // 진단 화면은 다음 단계에서 구현 — 지금은 안내 스텁
  { path: '/diagnose', name: 'diagnose', component: () => import('../views/DiagnoseView.vue') },
  // 학습 구조도 — 스윔레인 보드 (?node= 딥링크)
  { path: '/map', name: 'map', component: () => import('../views/StructureView.vue') },
  // 개념 지도 — 온톨로지(concept-graph.json) 부별 행 + 선수 사슬 (?c= 딥링크, 각 부 ConceptStrip 이 연다)
  { path: '/concepts', name: 'concepts', component: () => import('../views/ConceptsView.vue') },
  // 비유어 사전 — 정본 metaphors 를 부별로 (각 부 캡스톤 치환표의 통합판)
  { path: '/glossary', name: 'glossary', component: () => import('../views/GlossaryView.vue') },
  // 도입 현황 대시보드 (P3) — 로그인 시 헤더에 노출
  { path: '/adoption', name: 'adoption', component: () => import('../views/AdoptionView.vue') },
  // 미해결 질문 큐 (협업 주석 P3) — 관리자(VITE_ADMIN_EMAILS)만 헤더에 노출
  { path: '/qna', name: 'qna', component: () => import('../views/QnaView.vue') },
  // 알 수 없는 경로는 홈으로 (SPA 폴백은 index.html 을 주지만 라우터엔 매치가 없어 빈 화면이 된다)
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  // BASE_URL 을 따라 배포 base(루트 / 또는 하위 경로)에 맞춰 동작
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // 같은 화면에서 쿼리만 바뀌는 경우(구조도 ?node= 선택 등)는 스크롤 위치 유지 —
    // top:0 을 돌려주면 노드를 누를 때마다 화면이 맨 위로 튄다.
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

export default router
