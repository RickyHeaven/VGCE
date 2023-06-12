import { EConfigItemPropsType, EDoneJsonType } from '@/config-center/types'
import type { IConfigItem } from '@/config-center/types'

export const switch_a: IConfigItem = {
	name: 'switch-a',
	title: '开关',
	tag: 'switch-a',
	type: EDoneJsonType.CustomSvg,
	display: true,
	config: {
		can_zoom: true,
		have_anchor: true,
		actual_rect: true
	},
	props: {
		isOpen: {
			title: '开关',
			type: EConfigItemPropsType.Switch,
			val: true
		}
	},
	common_animations: {
		val: '',
		delay: 'delay-0s',
		speed: 'slow',
		repeat: 'infinite'
	}
}
