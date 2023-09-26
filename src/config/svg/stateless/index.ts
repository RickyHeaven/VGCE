import type { IConfigComponentGroup } from '@/config/types'
import { svg_bot_2 } from './bot-2'
import { svg_bot_9 } from './bot-9'
import { svg_hotpot } from './hotpot'
import { svg_hamburger } from './hamburger'

export const stateless_group: IConfigComponentGroup = {
	groupType: 'stateless',
	title: '静态SVG',
	list: [svg_hamburger, svg_hotpot, svg_bot_2, svg_bot_9]
}
