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
					value: 1048,
					name: '办公楼A'
				},
				{
					value: 735,
					name: '办公楼B'
				},
				{
					value: 580,
					name: '保安室'
				},
				{
					value: 484,
					name: '地下车库'
				},
				{
					value: 300,
					name: '食堂'
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
