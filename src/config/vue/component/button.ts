import { EConfigItemPropsType, EDoneJsonType } from '../../types'
import type { IConfigItem } from '../../types'

const t: IConfigItem = {
	name: 'v-button',
	tag: 'v-button',
	title: '按钮',
	type: EDoneJsonType.Vue,
	config: {
		can_zoom: false,
		have_anchor: false,
		actual_rect: true
	},
	display: true,
	props: {
		size: {
			title: '尺寸',
			type: EConfigItemPropsType.Select,
			val: 'default',
			options: [
				{ label: 'Large', value: 'large' },
				{ label: 'Default', value: 'default' },
				{ label: 'Small', value: 'small' }
			]
		},
		type: {
			title: '类型',
			type: EConfigItemPropsType.Select,
			val: 'primary',
			options: [
				{ label: 'Primary', value: 'primary' },
				{ label: 'Success', value: 'success' },
				{ label: 'Warning', value: 'warning' },
				{ label: 'Danger', value: 'danger' },
				{ label: 'Info', value: 'info' }
			]
		},
		plain: {
			title: '朴素按钮',
			type: EConfigItemPropsType.Switch,
			val: false
		},
		text: {
			title: '文字按钮',
			type: EConfigItemPropsType.Switch,
			val: false
		}
	},
	tag_slot: 'Button',
	common_animations: {
		val: '',
		delay: 'delay-0s',
		speed: 'slow',
		repeat: 'infinite'
	},
	events: []
}
export default t