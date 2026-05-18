import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 最小配置
export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    port: 8080,
    host: '127.0.0.1',
  },
})