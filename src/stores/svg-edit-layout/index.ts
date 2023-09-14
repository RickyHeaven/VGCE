import type { ISvgEditLayoutStore } from './types'

/**
 * 编辑器布局状态
 */
export const useSvgEditLayoutStore = defineStore('svg-edit-layout-store', {
	state: (): ISvgEditLayoutStore => {
		return {
			left_nav: true,
			right_nav: true,
			center_offset: {
				x: 0,
				y: 0
			},
			canvasInfo: {
				with: 0,
				height: 0,
				top: 0,
				left: 0
			}
		}
	}
})
