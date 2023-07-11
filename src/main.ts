import './assets/main.less'

import { createApp } from 'vue'
import { pinia } from '@/hooks'

import App from './App.vue'
import router from './router'

// @ts-ignore
import VGCE from '../dist/vgce'
import '../dist/style.css'

import 'virtual:windi.css'
import 'virtual:svg-icons-register'

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(VGCE)

app.mount('#app')
