import type { IConfigComponentGroup } from '../../types'
import svg_text from './svg-text'
import switch_r from './switch-r'
import light_a from '@/config/svg/custom/light'
import clock_a from '@/config/svg/custom/clock-a'

const t: IConfigComponentGroup = {
	groupType: 'custom_svg_group',
	title: 'SVG组件',
	list: [svg_text, switch_r, light_a, clock_a]
}
export default t
