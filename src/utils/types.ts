import type { VNode } from 'vue'
export interface IScalePoint {
	x: number
	y: number
}

export type RichTxt = string | VNode | HTMLElement

export interface PlainObject extends Object {
	[k: keyof any]: any
}

export type Collection = PlainObject | PlainObject[]
