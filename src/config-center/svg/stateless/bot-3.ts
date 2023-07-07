import { EDoneJsonType } from '@/config-center/types'
import type { IConfigItem } from '@/config-center/types'

export const svg_bot_3: IConfigItem = {
	name: 'bot-3',
	title: '3号机',
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