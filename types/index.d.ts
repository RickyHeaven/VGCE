/**
 * @description vgce 声明文件入口
 * @author Ricky email:zhangqingcq@foxmail.com
 * @created 2023.07.10
 */
import { DefineComponent } from 'vue'
import type { IConfig } from '../src/config/types'
import type { IDataModel } from '../src/components/svg-editor/types'

export declare const SvgEditor: DefineComponent<{
	data?: string
	customToolbar?: IConfig
	saveFile?: boolean
	onOnPreview?: (d: IDataModel) => void
	onOnSave?: (d: IDataModel) => void
	onOnReturn?: () => void
}>
export declare const SvgViewer: DefineComponent<{
	data?: IDataModel
	canvasDrag?: boolean
	onOnMessage?: (d: { topics: string, message: string }) => void
}>

export default {
	SvgEditor,
	SvgViewer
}