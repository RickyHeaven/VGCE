import type { IConfigComponentGroup } from '../types'
import { components } from './component'
import { echarts_group } from './echarts'

export const vue_config_center: IConfigComponentGroup[] = Object.seal([
  components,
	echarts_group
])
