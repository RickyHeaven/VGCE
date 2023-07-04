import { EConfigItemPropsType, EDoneJsonType } from '@/config-center/types'
import type { IConfigItem } from '@/config-center/types'

export const svg_text: IConfigItem = {
	name: 'svg-text',
	title: '文字',
	tag: 'svg-text',
	type: EDoneJsonType.CustomSvg,
	display: true,
	config: {
		can_zoom: true,
		have_anchor: true,
		actual_rect: true
	},
	props: {
		text: {
			title: '文字内容',
			type: EConfigItemPropsType.Input,
			val: '文字'
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
				}
			]
		},
		fontSize: {
			title: '文字大小',
			type: EConfigItemPropsType.InputNumber,
			val: 15
		},
		fill: {
			title: '文字颜色',
			type: EConfigItemPropsType.Color,
			val: '#000'
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
