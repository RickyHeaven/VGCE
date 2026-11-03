import { EDoneJsonType } from '../../types'
import type { IConfigItem } from '../../types'

const t: IConfigItem = {
	name: 'hamburger',
	title: '汉堡',
	type: EDoneJsonType.File,
	display: true,
	config: {
		can_zoom: true,
		have_anchor: true,
		actual_rect: true
	},
	props: {},
	common_animations: {
		val: '',
		delay: 'delay-0s',
		speed: 'slow',
		repeat: 'infinite'
	},
	events: []
}
export default t