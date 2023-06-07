import type { IConfigComponentGroup } from '@/config-center/types'
import { pie_charts } from './pie-charts'

export const echarts_group: IConfigComponentGroup = {
	groupType: 'echarts',
	title: '图表',
	list: [pie_charts]
}
