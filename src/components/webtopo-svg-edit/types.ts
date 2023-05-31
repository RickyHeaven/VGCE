import type { IPositionCenterSvg } from '@/stores/config/types'
import type { IDoneJson } from '@/stores/global/types'

export type IVisibleConf = {
	[key in EVisibleConfKey]: boolean
}
export enum EVisibleConfKey {
	ImportJson = 'ImportJson',
	ExportJson = 'ExportJson',
	ComponentTree = 'ComponentTree'
}
export interface IDataModel {
	layout_center: {
		x: number
		y: number
	}
	config: IPositionCenterSvg
	done_json: IDoneJson[]
}
