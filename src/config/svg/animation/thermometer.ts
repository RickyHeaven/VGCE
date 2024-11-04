import { EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'
const t: IConfigItem = {
	name: 'thermometer',
	title: '温度计',
	type: EDoneJsonType.File,
	config: {
		can_zoom: true,
		have_anchor: false,
		actual_rect: true
	},
	display: true,
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
