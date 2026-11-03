import { EDoneJsonType } from '../../types'
import type { IConfigItem } from '../../types'

const t: IConfigItem = {
	name: 'alert-light',
	title: '警示灯',
	type: EDoneJsonType.File,
	config: {
		can_zoom: true,
		have_anchor: false,
		actual_rect: true
	},
	display: true,
	props: {},
	defaultState: 'white',
	state: {
		green: {
			label: 'Normal',
			fill: '#00ff00',
			fillOpacity: '1'
		},
		yellow: { label: 'Caution', fill: '#ffff00', fillOpacity: '1' },
		red: { label: 'Alarm', fill: '#ff0000', fillOpacity: '1' },
		white: { label: 'Off', fill: '#ffffff', fillOpacity: '0' }
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