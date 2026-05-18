import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    port: 8080,
    host: '127.0.0.1',
    open: true,
    // 显式配置history API fallback
    fs: {
      strict: false,
    },
  },
  // 确保正确处理SPA
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
})