export interface ISvgEditLayoutStore {
	left_nav: boolean
	right_nav: boolean
	center_offset: {
		x: number
		y: number
	}
	canvasInfo: { with: number; height: number; top: number; left: number }
}
