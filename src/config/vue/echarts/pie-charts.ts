import { EConfigItemPropsType, EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'

const t: IConfigItem = {
	name: 'pie-charts',
	tag: 'pie-charts',
	title: '饼图',
	type: EDoneJsonType.Vue,
	config: {
		can_zoom: true,
		have_anchor: false,
		actual_rect: true
	},
	display: true,
	props: {
		title: {
			title: '标题',
			type: EConfigItemPropsType.Input,
			val: '默认标题'
		},
		seriesName: {
			title: '详情',
			type: EConfigItemPropsType.Input,
			val: '详情标题'
		},
		seriesData: {
			title: 'legendData',
			type: EConfigItemPropsType.JsonEdit,
			val: [
				{
					value: 998,
					name: '20岁以下'
				},
				{
					value: 546,
					name: '20-40岁'
				},
				{
					value: 354,
					name: '40-60岁'
				},
				{
					value: 421,
					name: '60-70岁'
				},
				{
					value: 607,
					name: '70岁以上'
				}
			]
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
