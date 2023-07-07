import type { IPositionCenterSvg, INet } from '@/stores/config/types'
import type { IDoneJson } from '@/stores/global/types'
import type { ISystemStraightLine } from '@/components/config/types'

export type IVisibleConf = {
	[key in EVisibleConfKey]: boolean
}

export enum EVisibleConfKey {
	ImportJson = 'ImportJson',
	ExportJson = 'ExportJson',
	ImportFile = 'ImportFile'
}

export interface IDataModel {
	layout_center: {
		x: number
		y: number
	}
	config: { svg: IPositionCenterSvg; connection_line: ISystemStraightLine; net: INet }
	done_json: IDoneJson[]
}
