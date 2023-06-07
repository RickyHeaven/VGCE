import { defineStore } from 'pinia'
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
		position_center: {
			x: -333,
			y: -113
		},
		svg_position_center: {
			x: 50,
			y: 50
		},
		grid: true,
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
			connection_line: t
		}
	},
	getters: {},
	actions: {}
})
