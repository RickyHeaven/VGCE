import { EConfigItemPropsType, EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'

const t: IConfigItem = {
	name: 'el-tag',
	tag: 'el-tag',
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
				{ label: '成功', value: 'success' },
				{ label: '警告', value: 'warning' },
				{ label: '危险', value: 'danger' },
				{ label: '信息', value: 'info' }
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
	tag_slot: '标签',
	common_animations: {
		val: '',
		delay: 'delay-0s',
		speed: 'slow',
		repeat: 'infinite'
	},
	events: []
}
export default t
