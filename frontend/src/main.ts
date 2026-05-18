import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'

// 创建应用
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用Element Plus
app.use(ElementPlus)

// 挂载应用
app.mount('#app')

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
}

// 全局属性
app.config.globalProperties.$filters = {
  formatPrice(price: number): string {
    return `¥${price.toFixed(2)}`
  },
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('zh-CN')
  },
  truncate(text: string, length: number = 50): string {
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
  }
}