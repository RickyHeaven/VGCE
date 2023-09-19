import type { IConfig, IConfigItem } from '@/config/types'
import type { IBindAnchors } from '@/components/config/types'

export interface IGlobalStore {
	config_center: IConfig
	intention: EGlobalStoreIntention
	create_svg_info: IConfigItem | null
	done_json: IDoneJson[]
	mouse_info: IMouseInfo
	handle_svg_info: IHandleSvgInfo | null
	scale_info: IScaleInfo
	rotate_info: IRotateInfo
	connection_line_node_info: IConnectionLineNodeInfo
}

export interface IPointCoordinate {
	tl: ICoordinate
	tc: ICoordinate
	tr: ICoordinate
	l: ICoordinate
	r: ICoordinate
	bl: ICoordinate
	bc: ICoordinate
	br: ICoordinate
}

export interface IDoneJson extends IConfigItem {
	id: string
	x: number
	y: number
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
	point_coordinate: IPointCoordinate
	point_coordinate_old?: IPointCoordinate
	selected?: boolean
	old_position?: { x: number; y: number }
	center_position: { x: number; y: number }
	bind_anchors?: {
		start: IBindAnchors | null
		end: IBindAnchors | null
	}
}

export enum EGlobalStoreIntention {
	None = 'None',
	Create = 'Create',
	Move = 'Move',
	GroupMove = 'GroupMove',
	MoveCanvas = 'MoveCanvas',
	Select = 'Select',
	Zoom = 'Zoom',
	Rotate = 'Rotate',
	Connection = 'Connection',
	SetConnectionLineNode = 'SetConnectionLineNode',
	ContextMenu = 'ContextMenu',
	SelectArea = 'SelectArea'
}

export interface IMouseInfo {
	state: EMouseInfoState
	position_x: number //鼠标指针坐标
	position_y: number
	now_position_x: number //当前目标的坐标
	now_position_y: number
	new_position_x: number //移动之后目标的坐标
	new_position_y: number
}

export enum EMouseInfoState {
	Down = 'Down',
	Up = 'Up'
}

export interface IHandleSvgInfo {
	info: IDoneJson
	index: number
}

/**
 * 缩放信息
 */
export interface IScaleInfo {
	type: EScaleInfoType
	scale_times: {
		//点击缩放时当前组件的缩放倍数
		x: number
		y: number
	}
	scale_item_info: {
		x: number
		y: number
	}
	symmetric_point: {
		//缩放前缩放手柄对应组件中心坐标的对称点坐标
		x: number
		y: number
	}
}

/**
 * 旋转信息
 */
export interface IRotateInfo {
	angle: number
}

export enum EScaleInfoType {
	None = '',
	TopLeft = 'TopLeft',
	TopCenter = 'TopCenter',
	TopRight = 'TopRight',
	Left = 'Left',
	Right = 'Right',
	BottomLeft = 'BottomLeft',
	BottomCenter = 'BottomCenter',
	BottomRight = 'BottomRight'
}

export interface ICoordinate {
	x: number
	y: number
}

export interface IConnectionLineNodeInfo {
	init_pos: {
		x: number
		y: number
	}
	point_index: number
}
