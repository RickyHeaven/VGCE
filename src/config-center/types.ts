/**
 * 组件分组数据格式
 * @property {string} groupType 组件分组类型
 * @property {string} title 组件分组标题
 * @property {Array} list 分组包含的组件项列表
 * @export
 * @interface IConfigComponentGroup
 */
export interface IConfigComponentGroup {
	groupType: string
	title: string
	list: Array<IConfigItem>
}

export type IConfigCenter = IConfigComponentGroup[]

export interface IConfigItem {
	name: string
	title: string
	display: boolean
	props: IConfigItemProps
	type: EDoneJsonType
	config: IDoneJsonConfig
	common_animations?: IConfigItemPropsCommonAnimations
	animations?: IConfigItemProps //自定义动画效果
	tag?: any
	state?: IConfigItemState //通过一个属性去控制多个属性就是有状态组件
	tag_slot?: string
	events?: IEventsItem[]
}

export interface IConfigItemPropsCommonAnimations {
	val: string
	delay: string
	speed: string
	repeat: string
}

export interface IConfigItemProps {
	[key: string]: {
		title: string
		type: EConfigItemPropsType
		val: any
		options?: any
		disabled?: boolean
	}
}

export enum EConfigAnimationsType {
	None = 'None',
	Electricity = 'Electricity', //电流效果
	WaterDrop = 'WaterDrop', //水珠
	Track = 'Track' //轨迹
}

export enum EConfigItemPropsType {
	Input = 'Input',
	Color = 'Color',
	InputNumber = 'InputNumber',
	Switch = 'Switch', //此类型option默认索引0为关闭
	JsonEdit = 'JsonEdit',
	Select = 'Select'
}

export enum EDoneJsonType {
	File = 'File',
	StraightLine = 'StraightLine',
	ConnectionLine = 'ConnectionLine',
	CustomSvg = 'CustomSvg',
	Vue = 'Vue'
}

interface IDoneJsonConfig {
	can_zoom: boolean
	have_anchor: boolean
	actual_rect: boolean
}
export interface IConfigItemState {
	OnOff?: {
		title: string
		default: false
		props: { [key: string]: { openVal: any; closeVal: any } }
	}
}

export enum EEventType {
	Click = 'Click',
	Change = 'Change'
}
export enum EEventAction {
	ChangeAttr = 'ChangeAttr',
	JavaScript = 'JavaScript'
}

export enum EConditionType {
	None = 'None',
	Relation = 'Relation'
}

export interface IAttrItem {
	key: string
	val: string
}

export interface ICondition {
	type: EConditionType
	Relation?: {
		key: string
		relation: string
		val: string
		val2?: string
	}
}

export interface IEventsItem {
	type: EEventType
	action: EEventAction
	target: string
	attrs?: IAttrItem[]
	scripts: string
	condition?: ICondition
}
