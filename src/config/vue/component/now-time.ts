import { EConfigItemPropsType, EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'

export const now_time: IConfigItem = {
	name: 'now-time',
	title: '当前时间',
	tag: 'now-time',
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
			val: 150
		},
		fontFamily: {
			title: '字体',
			type: EConfigItemPropsType.Select,
			val: 'Microsoft YaHei',
			options: [
				{
					value: 'Microsoft YaHei',
					label: '微软雅黑'
				},
				{
					value: 'NSimSun',
					label: '新宋体'
				},
				{
					value: 'KaiTi',
					label: '楷体'
				}
			]
		},
		fontSize: {
			title: '文字大小',
			type: EConfigItemPropsType.InputNumber,
			val: 18
		},
		color: {
			title: '文字颜色',
			type: EConfigItemPropsType.Color,
			val: '#000000'
		},
		bold: {
			title: '文字加粗',
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
