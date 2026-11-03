import { EConfigItemPropsType, EDoneJsonType } from '../../types'
import type { IConfigItem } from '../../types'

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
			val: 'Default Title'
		},
		seriesName: {
			title: '详情',
			type: EConfigItemPropsType.Input,
			val: 'Details Title'
		},
		seriesData: {
			title: 'legendData',
			type: EConfigItemPropsType.JsonEdit,
			val: [
				{
					value: 998,
					name: 'Under 20'
				},
				{
					value: 546,
					name: '20-40'
				},
				{
					value: 354,
					name: '40-60'
				},
				{
					value: 421,
					name: '60-70'
				},
				{
					value: 607,
					name: 'Over 70'
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