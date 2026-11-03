import { EConfigItemPropsType, EDoneJsonType } from '../../types'
import type { IConfigItem } from '../../types'

const t: IConfigItem = {
	name: 'common-table',
	title: '通用表格',
	tag: 'common-table',
	type: EDoneJsonType.Vue,
	config: {
		can_zoom: false,
		have_anchor: false,
		actual_rect: true,
		stop_wheel_zoom: true
	},
	display: true,
	props: {
		'col-config': {
			title: '列配置',
			type: EConfigItemPropsType.JsonEdit,
			val: [
				{
					prop: 'index',
					label: 'No.',
					'min-width': '80',
					fixed: false,
					sortable: false,
					'show-overflow-tooltip': false
				},
				{
					prop: 'name',
					label: 'Name',
					'min-width': '120',
					fixed: false,
					sortable: false,
					'show-overflow-tooltip': false
				},
				{
					prop: 'age',
					label: 'Age',
					'min-width': '80',
					fixed: false,
					sortable: false,
					'show-overflow-tooltip': false
				}
			]
		},
		data: {
			title: '表格数据',
			type: EConfigItemPropsType.JsonEdit,
			val: [
				{
					index: '1',
					name: 'Jack',
					age: '34'
				},
				{
					index: '2',
					name: 'Marry',
					age: '18'
				},
				{
					index: '3',
					name: 'Lee',
					age: '23'
				},
				{
					index: '4',
					name: 'Steve',
					age: '31'
				}
			]
		},
		width: {
			title: '宽度',
			type: EConfigItemPropsType.InputNumber,
			val: 280
		},
		height: {
			title: '高度',
			type: EConfigItemPropsType.InputNumber,
			val: 200
		},
		stripe: {
			title: '斑马纹',
			type: EConfigItemPropsType.Switch,
			val: false
		},
		border: {
			title: '纵向边框',
			type: EConfigItemPropsType.Switch,
			val: false
		},
		size: {
			title: '尺寸',
			type: EConfigItemPropsType.Select,
			val: 'default',
			options: [
				{
					label: 'Large',
					value: 'large'
				},
				{
					label: 'Default',
					value: 'default'
				},
				{
					label: 'Small',
					value: 'small'
				}
			]
		},
		fit: {
			title: '列宽自撑开',
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
export default t
