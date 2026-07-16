import { ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { getSupabase, isBackendEnabled, hasStoredSession } from './supabase'

const ALLOWED_DOMAIN = '@solideos.com'

// 클라이언트 사전검증(UX용) — 최종 경계는 서버의 auth.users 도메인 트리거(supabase/schema.sql).
export function isAllowedEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(ALLOWED_DOMAIN)
}

// 현재 로그인 유저(반응형). 백엔드 비활성·비로그인이면 null.
export const currentUser = ref<User | null>(null)

let subscribed = false
// 클라이언트를 확보하고(1회 lazy-load) 세션 복원 + 변화 구독을 한 번만 건다.
async function ensureClient() {
  const sb = await getSupabase()
  if (sb && !subscribed) {
    subscribed = true
    const { data } = await sb.auth.getSession()
    currentUser.value = data.session?.user ?? null
    sb.auth.onAuthStateChange((_event, session) => {
      currentUser.value = session?.user ?? null
    })
  }
  return sb
}

// 앱 시작 시 1회 — 저장된 세션이 있을 때만 클라이언트를 로드(비로그인은 supabase-js 를 안 받는다).
export async function initAuth(): Promise<void> {
  if (hasStoredSession()) await ensureClient()
}

// 경로 B: 이메일+비밀번호. "Confirm email" OFF 라 가입 즉시 세션이 생긴다.
export async function signUp(email: string, password: string) {
  if (!isBackendEnabled()) throw new Error('백엔드가 설정되지 않았습니다')
  if (!isAllowedEmail(email)) throw new Error(`${ALLOWED_DOMAIN} 계정만 가입할 수 있어요`)
  const sb = await ensureClient()
  if (!sb) throw new Error('백엔드가 설정되지 않았습니다')
  return sb.auth.signUp({ email, password })
}

export async function signIn(email: string, password: string) {
  if (!isBackendEnabled()) throw new Error('백엔드가 설정되지 않았습니다')
  const sb = await ensureClient()
  if (!sb) throw new Error('백엔드가 설정되지 않았습니다')
  return sb.auth.signInWithPassword({ email, password })
}

export async function signOut(): Promise<void> {
  const sb = await getSupabase()
  if (sb) await sb.auth.signOut()
}
