// 테마 상태 — 12개 앱 공용.
//
// 색 자체는 CSS 가 전부 처리한다(dark.css 가 팔레트 변수를 다시 정의). 이 모듈이 하는 일은 두 가지뿐:
//   ① 사용자의 선택(시스템/라이트/다크)을 <html data-theme> 과 localStorage 에 반영
//   ② CSS 변수를 **못 읽는** 것들에게 "테마가 바뀌었다"를 알림 — 지금은 Chart.js(<canvas>)가 유일하다.
//
// 첫 페인트 깜빡임은 각 index.html 의 인라인 스크립트가 막는다(이 모듈은 번들 로드 후에 돈다).
import { ref } from 'vue'

export type ThemeMode = 'system' | 'light' | 'dark'

const KEY = 'series-theme-v1'
const mq = () => window.matchMedia('(prefers-color-scheme: dark)')

export const themeMode = ref<ThemeMode>('system')

/** 테마가 바뀔 때마다 증가. canvas 처럼 CSS 변수를 못 읽는 것들이 이 값을 구독해 다시 그린다. */
export const themeVersion = ref(0)

function apply(m: ThemeMode) {
  const root = document.documentElement
  // 'system' 은 속성을 지워서 @media (prefers-color-scheme) 에 맡긴다
  if (m === 'system') delete root.dataset.theme
  else root.dataset.theme = m
  themeVersion.value++
}

export function setTheme(m: ThemeMode) {
  themeMode.value = m
  try {
    localStorage.setItem(KEY, m)
  } catch {
    // 사생활 보호 모드 등 — 저장만 실패하고 적용은 계속한다
  }
  apply(m)
}

export function initTheme() {
  let saved: ThemeMode = 'system'
  try {
    const s = localStorage.getItem(KEY)
    if (s === 'light' || s === 'dark' || s === 'system') saved = s
  } catch {
    // 무시
  }
  themeMode.value = saved
  apply(saved)
  // 시스템 모드에서 OS 설정이 바뀌면 CSS 는 알아서 따라가지만 canvas 는 못 따라간다
  mq().addEventListener('change', () => {
    if (themeMode.value === 'system') themeVersion.value++
  })
}

/** 지금 실제로 어두운 상태인가 (시스템 모드면 OS 설정을 따른다) */
export function isDark(): boolean {
  return themeMode.value === 'dark' || (themeMode.value === 'system' && mq().matches)
}

/** CSS 변수 값을 실제 색 문자열로 — canvas 에 넘길 때 쓴다 */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
