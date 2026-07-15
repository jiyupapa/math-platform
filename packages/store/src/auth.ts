import { ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

const ALLOWED_DOMAIN = '@solideos.com'

// 클라이언트 사전검증(UX용) — 최종 경계는 서버의 auth.users 도메인 트리거(supabase/schema.sql).
export function isAllowedEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(ALLOWED_DOMAIN)
}

// 현재 로그인 유저(반응형). 백엔드 비활성이면 항상 null.
export const currentUser = ref<User | null>(null)

let initialized = false

// 앱 시작 시 1회 호출 — 세션 복원 + 변화 구독. 백엔드 없으면 no-op(현재 동작 불변).
export async function initAuth(): Promise<void> {
  if (!supabase || initialized) return
  initialized = true
  const { data } = await supabase.auth.getSession()
  currentUser.value = data.session?.user ?? null
  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser.value = session?.user ?? null
  })
}

// 경로 B: 이메일+비밀번호. "Confirm email" OFF 라 가입 즉시 세션이 생긴다.
export async function signUp(email: string, password: string) {
  if (!supabase) throw new Error('백엔드가 설정되지 않았습니다')
  if (!isAllowedEmail(email)) throw new Error(`${ALLOWED_DOMAIN} 계정만 가입할 수 있어요`)
  return supabase.auth.signUp({ email, password })
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('백엔드가 설정되지 않았습니다')
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut()
}
