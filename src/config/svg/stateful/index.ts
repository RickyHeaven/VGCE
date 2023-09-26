import type { IConfigComponentGroup } from '../../types'
import { svg_alert_light } from './alert-light'

export const stateful_group: IConfigComponentGroup = {
	groupType: 'stateful',
	title: '状态SVG',
	list: [svg_alert_light]
}
