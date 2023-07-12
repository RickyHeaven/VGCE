import type { IConfigComponentGroup } from '@/config/types'
import { alternator_svg_file } from './alternator'
import { traction_transformer_svg_file } from './traction-transformer'
import { svg_house } from './house'
import { svg_car } from './car'
import { svg_hospital } from './hospital'
import { svg_package } from './package'
import { svg_bot_2 } from './bot-2'
import { svg_bot_3 } from './bot-3'
import { svg_bot_7 } from './bot-7'
import { svg_bot_9 } from './bot-9'
import { svg_bot_12 } from './bot-12'

export const stateless_group: IConfigComponentGroup = {
	groupType: 'stateless',
	title: '静态图标',
	list: [
		alternator_svg_file,
		traction_transformer_svg_file,
		svg_house,
		svg_car,
		svg_hospital,
		svg_package,
		svg_bot_2,
		svg_bot_3,
		svg_bot_7,
		svg_bot_9,
		svg_bot_12
	]
}
