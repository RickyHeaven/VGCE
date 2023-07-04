import { EConfigItemPropsType, EDoneJsonType } from '@/config-center/types'
import type { IConfigItem } from '@/config-center/types'

export const now_time: IConfigItem = {
	name: 'now-time',
	title: '当前时间',
	tag: 'now-time',
	type: EDoneJsonType.Vue,
	config: {
		can_zoom: true,
		have_anchor: false,
		actual_rect: true
	},
	display: true,
	props: {
		fontColor: {
			title: '文字颜色',
			type: EConfigItemPropsType.Color,
			val: '#000000'
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
