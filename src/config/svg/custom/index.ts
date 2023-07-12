import type { IConfigComponentGroup } from '../../types'
import { svg_text } from './svg-text'
import { switch_a } from './switch-a'
import { light_a } from '@/config/svg/custom/light'
import { clock_a } from '@/config/svg/custom/clock-a'

export const custom_svg_group: IConfigComponentGroup = {
	groupType: 'custom_svg_group',
	title: 'SVG组件',
	list: [svg_text, switch_a, light_a, clock_a]
}
