import { EConfigItemPropsType, EDoneJsonType } from '../../types'
import type { IConfigItem } from '../../types'

const t: IConfigItem = {
	name: 'v-tag',
	tag: 'v-tag',
	title: '标签',
	type: EDoneJsonType.Vue,
	config: {
		can_zoom: true,
		have_anchor: false,
		actual_rect: true
	},
	display: true,
	props: {
		type: {
			title: '类型',
			type: EConfigItemPropsType.Select,
			val: 'success',
			options: [
				{ label: 'Success', value: 'success' },
				{ label: 'Warning', value: 'warning' },
				{ label: 'Danger', value: 'danger' },
				{ label: 'Info', value: 'info' }
			]
		},
		closable: {
			title: '可关闭',
			type: EConfigItemPropsType.Switch,
			val: true
		},
		'disable-transitions': {
			title: '渐变',
			type: EConfigItemPropsType.Switch,
			val: false
		}
	},
	tag_slot: 'Tag',
	common_animations: {
		val: '',
		delay: 'delay-0s',
		speed: 'slow',
		repeat: 'infinite'
	},
	events: []
}
export default t