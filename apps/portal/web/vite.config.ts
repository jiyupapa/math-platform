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
  // @series/ui·@series/tutor·@series/store 는 소스 워크스페이스 패키지 — esbuild 사전번들에서 제외.
  optimizeDeps: {
    exclude: ['@series/ui', '@series/tutor', '@series/store'],
  },
})
