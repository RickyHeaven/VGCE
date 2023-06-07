import type { IConfigComponentGroup } from '../../types'
import { reservoir_svg_file } from './reservoir'

export const animation_group: IConfigComponentGroup = {
	groupType: 'have_animation',
	title: '动画图标',
	list: [reservoir_svg_file]
}
