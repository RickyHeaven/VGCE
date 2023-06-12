import type { IConfigComponentGroup } from '../../types'
import { svg_text } from './svg-text'
import { switch_a } from './switch-a'

export const custom_svg_group: IConfigComponentGroup = {
	groupType: 'custom_svg_group',
	title: 'SVG组件',
	list: [svg_text, switch_a]
}
