import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// 简化配置
export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    port: 8080,
    host: '127.0.0.1',
    open: true,
  },
  appType: 'spa', // 明确指定为SPA应用
})