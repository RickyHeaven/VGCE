import { EConfigItemPropsType, EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'

export const svg_bot_2: IConfigItem = {
	name: 'bot-2',
	title: '2号机',
	type: EDoneJsonType.File,
	display: true,
	config: {
		can_zoom: true,
		have_anchor: true,
		actual_rect: true
	},
	props: {
		height: {
			title: '高度',
			type: EConfigItemPropsType.InputNumber,
			val: 150
		},
		width: {
			title: '宽度',
			type: EConfigItemPropsType.InputNumber,
			val: 120
		}
	},
	common_animations: {
		val: '',
		delay: 'delay-0s',
		speed: 'slow',
		repeat: 'infinite'
	},
	events: []
}
