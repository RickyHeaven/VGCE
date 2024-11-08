import { objectDeepClone } from '@/utils'
import { connection_line_system } from '@/components/config'

let l = localStorage.getItem('svg-editor-config')
let s: any
let t: any

if (l) {
	let b = JSON.parse(l)
	t = b.connection_line
	s = b.svg
} else {
	t = objectDeepClone(connection_line_system)
	s = {
		background_color: '#fff',
		scale: 1,
		grid: true,
		grid_color: '#ebebeb',
		ruler: true
	}
}

/**
 * 配置文件
 */
export const useConfigStore = defineStore('config-store', {
	state: () => {
		return {
			svg: s,
			connection_line: t,
			net: {
				mqtt: {
					useGlobalMqtt: false,
					url: '',
					user: '',
					pwd: '',
					topics: '',
					global: { url: '', user: '', pwd: '', topics: '' }
				}
			}
		}
	},
	getters: {},
	actions: {}
})
