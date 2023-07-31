import { pinia } from '@/hooks'

import App from './App.vue'
import router from './router'
import 'virtual:windi.css'
import 'virtual:svg-icons-register'
import './assets/main.less'

const app = createApp(App)

app.use(router)
app.use(pinia)

app.mount('#app')
