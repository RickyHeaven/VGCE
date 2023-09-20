import { EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'

export const sheet_border: IConfigItem = {
	name: 'sheet-border',
	title: '田字格',
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