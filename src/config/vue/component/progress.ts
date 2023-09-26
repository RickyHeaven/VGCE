import { EConfigItemPropsType, EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'

export const progress_a: IConfigItem = {
	name: 'progress-a',
	tag: 'progress-a',
	title: '进度条',
	type: EDoneJsonType.Vue,
	config: {
		can_zoom: false,
		have_anchor: true,
		actual_rect: true
	},
	display: true,
	props: {
		percentage: {
			title: '进度',
			type: EConfigItemPropsType.InputNumber,
			val: 50
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
