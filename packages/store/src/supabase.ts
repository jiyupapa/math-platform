import type { SupabaseClient } from '@supabase/supabase-js'

// vite/client 타입 의존 없이 안전하게 env 접근 (@series/tutor·PartLink 와 같은 패턴).
const env = (import.meta as { env?: Record<string, unknown> }).env ?? {}
const SUPABASE_URL = (env.VITE_SUPABASE_URL as string | undefined) ?? ''
const SUPABASE_ANON_KEY = (env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ''

// env(URL·ANON_KEY) 둘 다 있으면 백엔드 활성 — 동기 판단(로그인 버튼 표시 등). 클라이언트 로드와 무관.
export function isBackendEnabled(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
}

// 로그인 세션 토큰(sb-<ref>-auth-token)이 localStorage 에 이미 있는지 동기로 엿본다.
// 있으면 앱 시작 시 클라이언트를 즉시 로드(세션 복원), 없으면(비로그인) 로그인 클릭까지 미룬다.
export function hasStoredSession(): boolean {
  if (!isBackendEnabled()) return false
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) return true
    }
  } catch {
    /* localStorage 불가 무시 */
  }
  return false
}

// supabase-js 를 동적 import 로 1회만 로드하고 클라이언트를 캐시한다(lazy-load).
// 이 함수가 처음 불릴 때만 import() 실행 → 비로그인·미설정은 supabase-js(gzip ~50KB)를 안 받는다.
let clientPromise: Promise<SupabaseClient | null> | null = null
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isBackendEnabled()) return Promise.resolve(null)
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true },
      }),
    )
  }
  return clientPromise
}
