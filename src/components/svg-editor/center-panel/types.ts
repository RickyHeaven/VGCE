import type { IDoneJson } from '@/stores/global/types'

export interface IVisibleInfo {
	handle_panel: boolean
	connection_panel: boolean
	connection_line: boolean
	select_item: {
		info: null | IDoneJson
		index: number
	}
}
