import { EConfigItemPropsType, EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'

const t: IConfigItem = {
	name: 'text-box',
	title: '文字背景框',
	tag: 'text-box',
	type: EDoneJsonType.Vue,
	config: {
		can_zoom: false,
		have_anchor: false,
		actual_rect: true
	},
	display: true,
	props: {
		width: {
			title: '宽度',
			type: EConfigItemPropsType.InputNumber,
			val: 250
		},
		height: {
			title: '高度',
			type: EConfigItemPropsType.InputNumber,
			val: 150
		},
		bgColor: {
			title: '背景颜色',
			type: EConfigItemPropsType.Color,
			val: '#000000'
		},
		bgOpacity: {
			title: '背景透明度(%)',
			type: EConfigItemPropsType.InputNumber,
			val: 1
		},
		borderColor: {
			title: '边框颜色',
			type: EConfigItemPropsType.Color,
			val: '#cccccc'
		},
		borderWidth: {
			title: '边框宽度',
			type: EConfigItemPropsType.InputNumber,
			val: 1
		},
		borderRadius: {
			title: '边框圆角',
			type: EConfigItemPropsType.InputNumber,
			val: 5
		},
		borderOpacity: {
			title: '边框透明度(%)',
			type: EConfigItemPropsType.InputNumber,
			val: 100
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
