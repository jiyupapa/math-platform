import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // @series/ui 는 소스(.vue) 워크스페이스 패키지 — esbuild 사전번들에서 제외.
  optimizeDeps: {
    exclude: ['@series/ui'],
  },
})
