import type { IConfigComponentGroup } from '../types'
import { stateful_group } from './stateful'
import { stateless_group } from './stateless'
import { animation_group } from './animation'
import { custom_svg_group } from './custom'

export const svg_config_center: IConfigComponentGroup[] = Object.seal([
	stateless_group,
	stateful_group,
	animation_group,
	custom_svg_group
])
