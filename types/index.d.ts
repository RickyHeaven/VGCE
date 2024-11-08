/**
 * @description vgce 声明文件入口
 * @author Ricky email:zhangqingcq@foxmail.com
 * @created 2023.07.10
 */
import { DefineComponent } from 'vue'

export declare const SvgEditor: DefineComponent<{
	data?: string
	customToolbar?: any[]
	vueComp?: Record<string, any>
	saveFile?: boolean
	onOnPreview?: (d: Record<string, any>) => void
	onOnSave?: (d: Record<string, any>) => void
	onOnReturn?: (d: Record<string, any>) => void
}>
export declare const SvgViewer: DefineComponent<{
	data?: Record<string, any>
	vueComp?: Record<string, any>
	canvasDrag?: boolean
	showCanvasInfo?: boolean
	onOnMessage?: (d: { topics: string; message: string }) => void
	onOnEvent?: (d: { event: Record<string, any>; target: Record<string, any> }) => void
}>

export default {
	SvgEditor,
	SvgViewer
}
