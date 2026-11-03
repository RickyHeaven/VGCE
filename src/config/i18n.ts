export const configMessages: Record<string, string> = {
	'静态SVG': 'Static SVG',
	'状态SVG': 'Stateful SVG',
	'动画SVG': 'Animated SVG',
	'SVG组件': 'SVG components',
	'VUE组件': 'Vue components',
	'图表': 'Charts',
	'火锅': 'Hot pot',
	'汉堡': 'Hamburger',
	'9号机': 'Bot No. 9',
	'2号机': 'Bot No. 2',
	'警示灯': 'Warning light',
	'开关': 'Switch',
	'文字': 'Text',
	'灯': 'Light',
	'时钟': 'Clock',
	'温度计': 'Thermometer',
	'按钮': 'Button',
	'进度条': 'Progress bar',
	'当前时间': 'Current time',
	'通用表格': 'Table',
	'标签': 'Tag',
	'文字背景框': 'Text box',
	'饼图': 'Pie chart',
	'尺寸': 'Size',
	'类型': 'Type',
	'宽度': 'Width',
	'高度': 'Height',
	'最大高度': 'Max height',
	'字体': 'Font',
	'文字大小': 'Font size',
	'文字颜色': 'Text color',
	'文字加粗': 'Bold',
	'朴素按钮': 'Plain',
	'文字按钮': 'Text button',
	'列配置': 'Columns',
	'表格数据': 'Table data',
	'斑马纹': 'Striped',
	'纵向边框': 'Vertical border',
	'列宽自撑开': 'Fit columns',
	'可关闭': 'Closable',
	'渐变': 'Gradient',
	'背景颜色': 'Background color',
	'背景透明度(%)': 'Bg opacity (%)',
	'边框颜色': 'Border color',
	'边框宽度': 'Border width',
	'边框圆角': 'Border radius',
	'边框透明度(%)': 'Border opacity',
	'进度': 'Progress',
	'标题': 'Title',
	'详情': 'Details',
	'文字内容': 'Text content',
	'文字朝向': 'Text dir',
	'针顶颜色': 'Pin cap color',
	'秒针颜色': 'Second hand color',
	'针圈颜色': 'Pin ring color',
	'分针颜色': 'Minute hand color',
	'时针颜色': 'Hour hand color',
	'刻度颜色': 'Tick color',
	'表盘颜色': 'Dial color',
	'表框颜色': 'Frame color'
}

export type ConfigLocale = 'zh-CN' | 'en-US'

export const configLocaleKey = 'vgceLocale'

export interface IConfigLocaleText {
	weekday: string[]
	month: string[]
	dateFormat: string
}

export const configLocaleText: Record<ConfigLocale, IConfigLocaleText> = {
	'zh-CN': {
		weekday: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
		month: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
		dateFormat: '{year}年{month}{day}日'
	},
	'en-US': {
		weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		dateFormat: '{month} {day}, {year}'
	}
}

const getLocaleText = (locale?: string) => configLocaleText[locale as ConfigLocale] ?? configLocaleText['zh-CN']

export const formatConfigDate = (date: Date, locale?: string) => {
	const text = getLocaleText(locale)
	return text.dateFormat
		.replace('{year}', String(date.getFullYear()))
		.replace('{month}', text.month[date.getMonth()])
		.replace('{day}', String(date.getDate()))
}

export const getConfigWeekday = (date: Date, locale?: string) => {
	return getLocaleText(locale).weekday[date.getDay()]
}