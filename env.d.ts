/// <reference types="vite/client" />

declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<{}, {}, any>

	export default component
}

declare module 'mqtt/dist/mqtt' {
	export * from 'mqtt'
	const mqtt: typeof import('mqtt')
	export default mqtt
}

declare module 'virtual:svg-icons-register' {
	const component: any
	export default component
}

declare module 'virtual:svg-icons-names' {
	const iconsNames: string[]
	export default iconsNames
}