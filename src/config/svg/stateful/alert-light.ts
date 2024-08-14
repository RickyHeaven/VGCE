import { EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'

const t: IConfigItem = {
	name: 'alert-light',
	title: '警示灯',
	type: EDoneJsonType.File,
	config: {
		can_zoom: true,
		have_anchor: true,
		actual_rect: true
	},
	display: true,
	props: {},
	defaultState: 'white',
	state: {
		green: {
			label: '正常',
			fill: '#00ff00',
			fillOpacity: '1'
		},
		yellow: { label: '请注意', fill: '#ffff00', fillOpacity: '1' },
		red: { label: '报警', fill: '#ff0000', fillOpacity: '1' },
		white: { label: '关闭', fill: '#ffffff', fillOpacity: '0' }
	},
	common_animations: {
		val: '',
		delay: 'delay-0s',
		speed: 'slow',
		repeat: 'infinite'
	},
	events: []
}
export default t
