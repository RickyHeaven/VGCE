/**
 * @description vgce 声明文件入口
 * @author Ricky email:zhangqingcq@foxmail.com
 * @created 2023.07.10
 */
import { DefineComponent, Ref } from 'vue'

/**
 * @description 预览性能档位
 * high: 全部效果开启（动画、图表实时刷新等），适合高性能PC
 * medium: 保留结构动画，关闭高开销效果，适合中端PC
 * low: 关闭大部分动画与高开销效果，适合低性能PC或工控机
 */
export declare enum EPreviewPerfLevel {
	High = 'high',
	Medium = 'medium',
	Low = 'low'
}

/**
 * @description 预览性能优化选项，未指定的字段会按档位预设补齐
 */
export interface IPreviewPerfOptions {
	level?: EPreviewPerfLevel | 'auto'
	animations?: boolean
	chartAutoResize?: boolean
	minChartInterval?: number
	fpsLimit?: number
	nodeVirtual?: boolean
	nodeVirtualThreshold?: number
}

/**
 * @description 根据浏览器环境粗略评估设备性能档位
 */
export declare function detectPerfLevel(): EPreviewPerfLevel

/**
 * @description 界面语言，仅支持中文与英文
 */
export type VgceLocale = 'zh-CN' | 'en-US'

/**
 * @description 默认语言
 */
export declare const DEFAULT_LOCALE: VgceLocale

/**
 * @description 将任意语言标识归一化为受支持的语言，无法识别时回退到默认语言
 */
export declare function normalizeLocale(value?: string | null): VgceLocale

/**
 * @description 全局切换界面语言
 */
export declare function setLocale(value?: string | null): void

/**
 * @description 获取当前界面语言
 */
export declare function getLocale(): VgceLocale

/**
 * @description 以只读响应式引用形式获取当前界面语言
 */
export declare function useVgceLocale(): Readonly<Ref<VgceLocale>>

/**
 * @description 按中文原文取对应语言的文案，缺失时回退为原文
 */
export declare function translate(key?: string, params?: Record<string, string | number>): string

/**
 * @description translate 的别名
 */
export declare const t: typeof translate

/**
 * @description 注册额外的词条，默认合并进英文词条表，用于组件配置数据等自定义文案的国际化
 */
export declare function registerMessages(extra?: Record<string, string>, target?: VgceLocale): void

/**
 * @description 组件类型
 */
export declare enum EDoneJsonType {
	File = 'File',
	StraightLine = 'StraightLine',
	ConnectionLine = 'ConnectionLine',
	CustomSvg = 'CustomSvg',
	Vue = 'Vue'
}

/**
 * @description 画布坐标
 */
export interface ICoordinate {
	x: number
	y: number
}

/**
 * @description 数据模型中的SVG配置
 */
export interface IDataModelSvg {
	background_color: string
	scale: number
	grid: boolean
	ruler: boolean
}

/**
 * @description 数据模型中的网络配置
 */
export interface IDataModelNet {
	mqtt: {
		useGlobalMqtt: boolean
		url: string
		user: string
		pwd: string
		topics: string
		global: {
			url: string
			user: string
			pwd: string
			topics: string
		}
	}
}

/**
 * @description 数据模型中的配置中心
 */
export interface IDataModelConfig {
	svg: IDataModelSvg
	connection_line: Record<string, any>
	net: IDataModelNet
	[key: string]: any
}

/**
 * @description 数据模型中的组件节点，仅声明稳定存在的基础几何与身份字段，
 * 其余由组件类型决定的属性通过索引签名保留
 */
export interface IDoneJsonItem {
	id: string
	x: number
	y: number
	name?: string
	title?: string
	display?: boolean
	type: EDoneJsonType | string
	client: ICoordinate
	scale_x: number
	scale_y: number
	rotate: number
	actual_bound: {
		x: number
		y: number
		width: number
		height: number
	}
	center_position: ICoordinate
	point_coordinate: Record<string, ICoordinate>
	selected?: boolean
	props?: Record<string, any>
	config?: Record<string, any>
	events?: any[]
	bind_anchors?: {
		start: { type: string; target_id: string } | null
		end: { type: string; target_id: string } | null
	}
	[key: string]: any
}

/**
 * @description 编辑器与预览器共用的数据模型
 * 编辑器通过字符串接收（内部JSON.parse），预览器直接接收对象
 */
export interface IDataModel {
	layout_center: ICoordinate
	config: IDataModelConfig
	done_json: IDoneJsonItem[]
}

/**
 * @description 编辑器返回事件(onReturn)的负载
 */
export interface IEditorReturnPayload {
	data: IDataModel
	isChange: boolean
}

export declare const SvgEditor: DefineComponent<{
	data?: string
	customToolbar?: any[]
	configMessages?: Record<string, string>
	vueComp?: Record<string, any>
	saveFile?: boolean
	mqtt?: { cover: boolean; url: string; user: string; pwd: string; topics: string }
	slotBackground?: boolean
	locale?: VgceLocale
	onOnPreview?: (d: IDataModel) => void
	onOnSave?: (d: IDataModel) => void
	onOnReturn?: (d: IEditorReturnPayload) => void
}>
/**
 * @description 预览器事件绑定回调(onEvent)的负载
 * event 为触发的原生事件，target 为组件上与事件脚本相关的属性集合
 */
export interface IViewerEventPayload {
	event: Event
	target: Record<string, any>
}

export declare const SvgViewer: DefineComponent<{
	data?: IDataModel
	vueComp?: Record<string, any>
	canvasDrag?: boolean
	canvasZoom?: boolean
	showCanvasInfo?: boolean
	previewPerf?: IPreviewPerfOptions
	forceLevel?: EPreviewPerfLevel
	locale?: VgceLocale
	onOnMessage?: (d: { topics: string; message: string }) => void
	onOnEvent?: (d: IViewerEventPayload) => void
}>

declare const _default: {
	SvgEditor: typeof SvgEditor
	SvgViewer: typeof SvgViewer
}
export default _default