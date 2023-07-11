import type { IConfigCenter } from './types'
import { svg_config_center } from './svg'
import { vue_config_center } from './vue'

import { ElButton, ElTag } from 'element-plus'
import Progress from '@/config-center/files/progress.vue'
import SwitchA from '@/config-center/files/switch-a.vue'
import SvgText from '@/config-center/files/svg-text.vue'
import CommonTable from '@/config-center/files/common-table.vue'
import NowTime from '@/config-center/files/now-time.vue'
import PieCharts from '@/config-center/files/pie-charts.vue'
import LightA from '@/config-center/files/light-a.vue'
import ClockA from '@/config-center/files/clock-a.vue'

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

export const configCenter: IConfigCenter = [...svg_config_center, ...vue_config_center]
