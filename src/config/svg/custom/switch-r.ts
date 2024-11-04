import { EConfigItemPropsType, EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'

const t: IConfigItem = {
	name: 'switch-r',
	title: '开关',
	tag: 'switch-r',
	type: EDoneJsonType.CustomSvg,
	display: true,
	config: {
		can_zoom: true,
		have_anchor: false,
		actual_rect: true
	},
	props: {
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
export default t
