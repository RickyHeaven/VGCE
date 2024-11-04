import { EConfigItemPropsType, EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'

const t: IConfigItem = {
	name: 'clock-a',
	title: '时钟',
	tag: 'clock-a',
	type: EDoneJsonType.CustomSvg,
	config: {
		can_zoom: true,
		have_anchor: false,
		actual_rect: true
	},
	display: true,
	props: {
		centerColor: {
			title: '针顶颜色',
			type: EConfigItemPropsType.Color,
			val: '#EBF257'
		},
		secondsColor: {
			title: '秒针颜色',
			type: EConfigItemPropsType.Color,
			val: '#E83E24'
		},
		circleColor: {
			title: '针圈颜色',
			type: EConfigItemPropsType.Color,
			val: '#F45AFC'
		},
		minutesColor: {
			title: '分针颜色',
			type: EConfigItemPropsType.Color,
			val: '#50E68E'
		},
		hoursColor: {
			title: '时针颜色',
			type: EConfigItemPropsType.Color,
			val: '#9A36E7'
		},
		scaleColor: {
			title: '刻度颜色',
			type: EConfigItemPropsType.Color,
			val: '#4942CF'
		},
		backgroundColor: {
			title: '表盘颜色',
			type: EConfigItemPropsType.Color,
			val: '#ffffff'
		},
		borderColor: {
			title: '表框颜色',
			type: EConfigItemPropsType.Color,
			val: '#B3A7FF'
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
