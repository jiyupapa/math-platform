import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// vite/client 타입 의존 없이 안전하게 env 접근 (@series/tutor·PartLink 와 같은 패턴).
const env = (import.meta as { env?: Record<string, unknown> }).env ?? {}
const SUPABASE_URL = (env.VITE_SUPABASE_URL as string | undefined) ?? ''
const SUPABASE_ANON_KEY = (env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ''

// env(URL·ANON_KEY) 둘 다 있으면 백엔드 활성. 없으면 null → 앱은 localStorage 만 사용(현재 동작 불변).
// VITE_OLLAMA_URL 과 같은 게이팅: 코드 수정 없이 빌드 env 로 local↔backend 전환.
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : null

export const isBackendEnabled = (): boolean => supabase !== null
