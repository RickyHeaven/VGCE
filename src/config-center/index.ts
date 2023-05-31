import { svgfile_config_center } from './svg-file'
import type { IComponentImport, IConfigCenter } from './types'
import customSvgText from '@/components/custom-svg/custom-svg-text/index.vue'
import switchDemo from '@/components/custom-svg/switch-demo/index.vue'
import { vue_config_center } from './vue'
// @ts-ignore
import { ElButton, ElTag } from 'element-plus'
import CommonTable from '@/components/custom-vue/common-table/index.vue'
import NowTime from '@/components/custom-vue/now-time/index.vue'
import PieCharts from '@/components/echarts/pie-charts/index.vue'
export const configCenter: IConfigCenter = {
	svg: svgfile_config_center,
	vue: vue_config_center
}
export const ComponentImport: IComponentImport = {
	'custom-svg-text': customSvgText,
	'el-button': ElButton,
	'el-tag': ElTag,
	'custom-vue-common-table': CommonTable,
	'pie-charts': PieCharts,
	'switch-demo': switchDemo,
	'custom-vue-now-time': NowTime
}
