import type { IConfigComponentGroup } from '@/config/types'
import { alternator_svg_file } from './alternator'
import { svg_house } from './house'
import { svg_bot_2 } from './bot-2'

export const stateless_group: IConfigComponentGroup = {
	groupType: 'stateless',
	title: '静态图标',
	list: [alternator_svg_file, svg_house, svg_bot_2]
}
