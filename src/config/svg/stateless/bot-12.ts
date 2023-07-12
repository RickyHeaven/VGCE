import { EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'

export const svg_bot_12: IConfigItem = {
	name: 'bot-12',
	title: '12号机',
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
