import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  // 루트 .env 하나를 전 앱이 공유 (VITE_SUPABASE_URL·ANON_KEY 등). 각 앱 web/ 이 아닌 저장소 루트에서 로드.
  envDir: fileURLToPath(new URL('../../../', import.meta.url)),
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // @series/ui 는 소스(.vue) 형태의 워크스페이스 패키지 — esbuild 사전번들 대상에서 제외해
  // vue 플러그인이 .vue 를 직접 변환하도록 한다.
  optimizeDeps: {
    exclude: ['@series/ui', '@series/tutor', '@series/store'],
  },
})
