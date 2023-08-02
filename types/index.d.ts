/**
 * @description vgce 声明文件入口
 * @author Ricky email:zhangqingcq@foxmail.com
 * @created 2023.07.10
 */
import { DefineComponent } from 'vue'

export declare const SvgEditor: DefineComponent<{
	data?: string
	customToolbar?: any[]
	saveFile?: boolean
	onOnPreview?: (d: Record<string, any>) => void
	onOnSave?: (d: Record<string, any>) => void
	onOnReturn?: () => void
}>
export declare const SvgViewer: DefineComponent<{
	data?: Record<string, any>
	canvasDrag?: boolean
	onOnMessage?: (d: { topics: string, message: string }) => void
}>

export default {
	SvgEditor,
	SvgViewer
}