import { EConfigItemPropsType, EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'

export const light_a: IConfigItem = {
	name: 'light',
	tag: 'light-a',
	title: '灯',
	type: EDoneJsonType.CustomSvg,
	config: {
		can_zoom: true,
		have_anchor: true,
		actual_rect: true
	},
	display: true,
	props: {
		height: {
			title: '高度',
			type: EConfigItemPropsType.InputNumber,
			val: 60
		},
		width: {
			title: '宽度',
			type: EConfigItemPropsType.InputNumber,
			val: 50
		},
		isOpen: {
			title: '开关',
			type: EConfigItemPropsType.Switch,
			val: false
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
