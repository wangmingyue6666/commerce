import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
app.use(ElementPlus);
app.mount('#app');
app.config.errorHandler = (err, instance, info) => {
    console.error('Vue error:', err);
    console.error('Component:', instance);
    console.error('Info:', info);
};
app.config.globalProperties.$filters = {
    formatPrice(price) {
        return `¥${price.toFixed(2)}`;
    },
    formatDate(date) {
        return new Date(date).toLocaleDateString('zh-CN');
    },
    truncate(text, length = 50) {
        if (text.length <= length)
            return text;
        return text.substring(0, length) + '...';
    }
};
//# sourceMappingURL=main.js.map