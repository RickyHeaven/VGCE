import type { IDataModel } from '@/components/svg-editor/types'
import { useConfigStore } from '@/stores/config'
import { useGlobalStore } from '@/stores/global'
import type { IDoneJson } from '@/stores/global/types'
import { useSvgEditLayoutStore } from '@/stores/svg-edit-layout'
import { useEditPrivateStore } from '@/stores/system'

import { ElMessage } from 'element-plus'

export const pinia = createPinia()

export const useHistoryRecord = (done_json: IDoneJson[]) => {
	const edit_private_store = useEditPrivateStore()
	if (edit_private_store.is_record_history) {
		if (edit_private_store.history_now_index + 1 < edit_private_store.history_doneComponent.length) {
			edit_private_store.history_doneComponent.splice(edit_private_store.history_now_index + 1)
		}
		edit_private_store.history_doneComponent.push(done_json)
		edit_private_store.history_now_index = edit_private_store.history_doneComponent.length - 1
		if (edit_private_store.history_doneComponent.length > edit_private_store.max_record_times) {
			edit_private_store.history_doneComponent.shift()
			edit_private_store.history_now_index = edit_private_store.history_doneComponent.length - 1
		}
	}
	edit_private_store.is_record_history = true
}
export const useImportDataModel = (model_str: string) => {
	try {
		const json: IDataModel = JSON.parse(model_str)
		if (!json.config || !json.layout_center || !json.done_json) {
			ElMessage.error('请导入正确的数据模型！')
			return false
		}
		const globalStore = useGlobalStore(pinia)
		const svgEditLayoutStore = useSvgEditLayoutStore(pinia)
		const configStore = useConfigStore(pinia)
		configStore.$state = json.config
		svgEditLayoutStore.center_offset = json.layout_center
		globalStore.setDoneJson(json.done_json)
		return true
	} catch (error) {
		ElMessage.error('请导入正确的数据模型！')
		console.error(error)
		return false
	}
}
