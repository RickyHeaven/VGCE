import { EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'

export const clock_a: IConfigItem = {
	name: 'clock-a',
	title: '时钟',
	tag: 'clock-a',
	type: EDoneJsonType.CustomSvg,
	config: {
		can_zoom: true,
		have_anchor: true,
		actual_rect: true
	},
	display: true,
	props: {},
	common_animations: {
		val: '',
		delay: 'delay-0s',
		speed: 'slow',
		repeat: 'infinite'
	},
	events: []
}
