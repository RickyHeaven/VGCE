import type {IComponentImport, IConfigCenter} from './types'
import {svg_config_center} from './svg'
import {vue_config_center} from './vue'

// @ts-ignore
import {ElButton, ElTag} from 'element-plus'
import SwitchA from '@/config-center/files/switch-a.vue'
import SvgText from '@/config-center/files/svg-text.vue'
import CommonTable from '@/config-center/files/common-table.vue'
import NowTime from '@/config-center/files/now-time.vue'
import PieCharts from '@/config-center/files/pie-charts.vue'


export const ComponentImport: IComponentImport = {
  'svg-text': SvgText,
  'el-button': ElButton,
  'el-tag': ElTag,
  'common-table': CommonTable,
  'pie-charts': PieCharts,
  'switch-demo': SwitchA,
  'now-time': NowTime
}


export const configCenter: IConfigCenter = [...svg_config_center, ...vue_config_center]
