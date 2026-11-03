import { EConfigItemPropsType, EDoneJsonType } from '../../types'
import type { IConfigItem } from '../../types'

const t: IConfigItem = {
	name: 'svg-text',
	title: '文字',
	tag: 'svg-text',
	type: EDoneJsonType.CustomSvg,
	display: true,
	config: {
		can_zoom: true,
		have_anchor: false,
		actual_rect: true
	},
	props: {
		/*deviceCode:{
			title:'设备编码',
			type:EConfigItemPropsType.Input,
			val:''
		},*/
		text: {
			title: '文字内容',
			type: EConfigItemPropsType.Textarea,
			val: 'Text'
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
		fill: {
			title: '文字颜色',
			type: EConfigItemPropsType.Color,
			val: '#000'
		},
		bold: {
			title: '文字加粗',
			type: EConfigItemPropsType.Switch,
			val: false
		},
		writingMode: {
			title: '文字朝向',
			type: EConfigItemPropsType.Select,
			val: 'horizontal-tb',
			options: [
				{
					value: 'horizontal-tb',
					label: 'Horizontal'
				},
				{
					value: 'vertical-rl',
					label: 'Vertical'
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