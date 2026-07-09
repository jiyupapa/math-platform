import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // @series/ui 는 소스(.vue) 형태의 워크스페이스 패키지 — esbuild 사전번들 대상에서 제외해
  // vue 플러그인이 .vue 를 직접 변환하도록 한다.
  optimizeDeps: {
    exclude: ['@series/ui', '@series/tutor'],
  },
})
