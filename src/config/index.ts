import type { IConfig } from './types'
import { svg_config } from './svg'
import { vue_config } from './vue'

import { ElButton, ElTag } from 'element-plus'
import Progress from '@/config/files/progress.vue'
import SwitchA from '@/config/files/switch-a.vue'
import SvgText from '@/config/files/svg-text.vue'
import CommonTable from '@/config/files/common-table.vue'
import NowTime from '@/config/files/now-time.vue'
import PieCharts from '@/config/files/pie-charts.vue'
import LightA from '@/config/files/light-a.vue'
import ClockA from '@/config/files/clock-a.vue'

export const vueComp: Record<string, any> = {
	'svg-text': SvgText,
	'el-button': ElButton,
	'progress-a': Progress,
	'el-tag': ElTag,
	'common-table': CommonTable,
	'pie-charts': PieCharts,
	'switch-a': SwitchA,
	'now-time': NowTime,
	'light-a': LightA,
	'clock-a': ClockA
}

export const config: IConfig = [...svg_config, ...vue_config]
