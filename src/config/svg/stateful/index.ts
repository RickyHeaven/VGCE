import type { IConfigComponentGroup } from '../../types'
import { circuit_breaker_svg_file } from './circuit-breaker'

export const stateful_group: IConfigComponentGroup = {
	groupType: 'stateful',
	title: '状态SVG',
	list: [circuit_breaker_svg_file]
}
