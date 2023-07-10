import './assets/main.less'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'virtual:windi.css'
import 'virtual:svg-icons-register'

const app = createApp(App)

app.use(router)
app.use(createPinia())

app.mount('#app')
