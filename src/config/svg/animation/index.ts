import type { IConfigComponentGroup } from '../../types'
import { thermometer } from './thermometer'

export const animation_group: IConfigComponentGroup = {
	groupType: 'have_animation',
	title: '动画SVG',
	list: [thermometer]
}
