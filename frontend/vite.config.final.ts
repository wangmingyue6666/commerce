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
    // 自定义中间件来处理SPA fallback
    middlewareMode: false,
  },
  // 明确指定为SPA
  appType: 'spa',
  // 确保base路径正确
  base: './',
})