import type { IPositionCenterSvg } from '@/stores/config/types'
import type { IDoneJson } from '@/stores/global/types'
import type { ISystemStraightLine } from '@/config-center/system/types'

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
	config: { svg: IPositionCenterSvg; connection_line: ISystemStraightLine }
	done_json: IDoneJson[]
}
