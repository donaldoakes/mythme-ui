import { createApp } from 'vue'
import router from './route'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './css/site.css'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
