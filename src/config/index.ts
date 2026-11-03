import type { IConfig } from './types'
import svg_config from './svg'
import vue_config from './vue'

import Button from './files/button.vue'
import Tag from './files/tag.vue'
import Progress from './files/progress.vue'
import SwitchR from './files/switch-r.vue'
import SvgText from './files/svg-text.vue'
import CommonTable from './files/common-table.vue'
import NowTime from './files/now-time.vue'
import PieCharts from './files/pie-charts.vue'
import LightA from './files/light-a.vue'
import ClockA from './files/clock-a.vue'
import TextBox from './files/text-box.vue'

export const vueComp: Record<string, any> = {
	'svg-text': SvgText,
	'v-button': Button,
	'el-button': Button,
	'progress-a': Progress,
	'v-tag': Tag,
	'el-tag': Tag,
	'common-table': CommonTable,
	'pie-charts': PieCharts,
	'switch-r': SwitchR,
	'now-time': NowTime,
	'light-a': LightA,
	'clock-a': ClockA,
	'text-box': TextBox
}

export const config: IConfig = [...svg_config, ...vue_config]

//声明了 stop_wheel_zoom 的组件（如带滚动条的表格），预览时在该组件上阻止画布滚轮缩放
export const stopWheelZoomTags: Set<string> = new Set(
	config.reduce<string[]>((tags, group) => {
		group.list.forEach((item) => {
			if (item.config?.stop_wheel_zoom && item.tag) {
				tags.push(item.tag)
			}
		})
		return tags
	}, [])
)

//画布中必须使用库内置原生实现的组件。
//不注册到全局，避免覆盖宿主应用自己的同名组件
export const canvasComp: Record<string, any> = {
	'v-button': Button,
	'el-button': Button,
	'v-tag': Tag,
	'el-tag': Tag
}

export const resolveCanvasComp = (tag: string, extra?: Record<string, any>) => {
	return extra?.[tag] ?? canvasComp[tag] ?? tag
}