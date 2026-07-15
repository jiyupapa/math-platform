// @series/store — Supabase 백엔드 클라이언트·인증·로컬 우선 저장 (진도 크로스기기 저장).
// env(VITE_SUPABASE_URL·VITE_SUPABASE_ANON_KEY) 미설정 시 전부 no-op → 앱은 localStorage 만 사용(현재 동작).
// 설계: docs/todo_supabase백엔드_260715.md · DB: supabase/schema.sql
export { supabase, isBackendEnabled } from './supabase'
export { currentUser, initAuth, signUp, signIn, signOut, isAllowedEmail } from './auth'
export { SyncedStorage, type SyncedStorageOptions } from './syncedStorage'
