import { createRouter, createWebHistory } from 'vue-router'
import EditorS from '@/views/EditorS.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			redirect: '/EditorS'
		},
		{
			path: '/EditorS',
			name: 'EditorS',
			component: EditorS
		},
		{
			path: '/Preview',
			name: 'Preview',
			component: () => import('@/views/Preview.vue')
		}
	]
})

export default router
