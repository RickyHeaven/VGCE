import './assets/main.less'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// @ts-ignore
import VGCE from '../dist/vgce'
import '../dist/style.css'

import 'virtual:windi.css'
import 'virtual:svg-icons-register'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(VGCE)

app.mount('#app')
