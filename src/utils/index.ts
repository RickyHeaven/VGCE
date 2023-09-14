import { ELineBindAnchors } from '@/components/config/types'
import type { ISystemStraightLine } from '@/components/config/types'
import { EDoneJsonType } from '@/config/types'
import type { IConfigItem } from '@/config/types'
import type { IDoneJson } from '@/stores/global/types'
import { straight_line_system } from '@/components/config'
import { EGlobalStoreIntention, EMouseInfoState } from '@/stores/global/types'
import { useGlobalStore } from '@/stores/global'
import { pinia } from '@/hooks'
import { useConfigStore } from '@/stores/config'
import { useSvgEditLayoutStore } from '@/stores/svg-edit-layout'

/**
 * 生成随机字符串
 * @param len 生成个数
 */
export const randomString = (len?: number) => {
	len = len || 10
	const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	const maxPos = str.length
	let random_str = ''
	for (let i = 0; i < len; i++) {
		let t = maxPos
		if (i === 0) {
			t = maxPos - 10
		}
		random_str += str.charAt(Math.floor(Math.random() * t))
	}
	return random_str
}

// 通过泛型定义通用类型保护函数
export const isOfType = <T>(target: unknown, prop: keyof T): target is T => {
	return (target as T)[prop] !== undefined
}
/**
 * 获取坐标偏移量
 * @param length 真实宽/高
 * @param scale 缩放倍数
 * @returns 坐标偏移量
 */
export const getCoordinateOffset = (length: number, scale: number) => {
	return (length / 2) * (scale - 1)
}
// 角度转弧度
// Math.PI = 180 度
export const angleToRadian = (angle: number) => {
	return (angle * Math.PI) / 180
}
/**
 * 计算根据圆心旋转后的点的坐标
 * @param   {Object}  point  旋转前的点坐标
 * @param   {Object}  center 旋转中心
 * @param   {Number}  rotate 旋转的角度
 * @return  {Object}         旋转后的坐标
 * https://www.zhihu.com/question/67425734/answer/252724399 旋转矩阵公式
 */
export const calculateRotatedPointCoordinate = (
	point: { x: number; y: number },
	center: { x: number; y: number },
	rotate: number
) => {
	/**
	 * 旋转公式：
	 *  点a(x, y)
	 *  旋转中心c(x, y)
	 *  旋转后点n(x, y)
	 *  旋转角度θ                tan ??
	 * nx = cosθ * (ax - cx) - sinθ * (ay - cy) + cx
	 * ny = sinθ * (ax - cx) + cosθ * (ay - cy) + cy
	 */

	return {
		x:
			(point.x - center.x) * Math.cos(angleToRadian(rotate)) -
			(point.y - center.y) * Math.sin(angleToRadian(rotate)) +
			center.x,
		y:
			(point.x - center.x) * Math.sin(angleToRadian(rotate)) +
			(point.y - center.y) * Math.cos(angleToRadian(rotate)) +
			center.y
	}
}
// 求两点之间的中点坐标
export const getCenterPoint = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
	return {
		x: p1.x + (p2.x - p1.x) / 2,
		y: p1.y + (p2.y - p1.y) / 2
	}
}
/**
 * 坐标数组转换成path路径
 * @param position_arr
 * @returns
 */
export const positionArrToPath = (position_arr: { x: number; y: number }[]) => {
	let path_str = ''
	for (let index = 0; index < position_arr.length; index++) {
		if (index === 0) {
			path_str += `M ${position_arr[index].x} ${position_arr[index].y}`
		} else {
			path_str += ` L ${position_arr[index].x} ${position_arr[index].y}`
		}
	}
	return path_str
}
/**
 * 获取相对于svg最新的坐标
 * @param init_pos 原中心坐标
 * @param finally_pos 新中心坐标
 * @param svg_init_pos 在画布中的的原坐标
 * @returns svg最新的坐标
 */
export const getSvgNowPosition = (init_pos: number, finally_pos: number, svg_init_pos: number) => {
	return svg_init_pos + (finally_pos - init_pos)
}
/**
 * 对象深拷贝
 * @param object
 * @param default_val
 * @returns
 */
export const objectDeepClone = <T>(object: Record<keyof any, any>, default_val: any = {}) => {
	if (!object) {
		return default_val as T
	}
	return JSON.parse(JSON.stringify(object)) as T
}
/**
 * 设置实际的属性
 * @param done_json
 * @param resize
 */
export const setSvgActualInfo = (done_json: IDoneJson, resize?: boolean) => {
	const queryBbox = document.querySelector(`#${done_json.id}`)
	const rectBBox = document.querySelector(`#rect${done_json.id}`)
	if (queryBbox) {
		let x = 0,
			y = 0,
			width = 0,
			height = 0
		if (done_json.type !== EDoneJsonType.Vue) {
			const BBox = (queryBbox as SVGGraphicsElement).getBBox()
			x = parseFloat(BBox.x.toFixed(0))
			y = parseFloat(BBox.y.toFixed(0))
			width = parseFloat(BBox.width.toFixed(0))
			height = parseFloat(BBox.height.toFixed(0))
		} else {
			width = (queryBbox as HTMLElement).offsetWidth
			height = (queryBbox as HTMLElement).offsetHeight
			width = width === 0 ? 100 : width
			height = height === 0 ? 100 : height
			x = 50 - width / 2
			y = 50 - height / 2
			const foreignObjectBox = document.querySelector(`#foreign-object${done_json.id}`)
			if (
				foreignObjectBox &&
				foreignObjectBox.getAttribute('x') === '0' &&
				foreignObjectBox.getAttribute('y') === '0' &&
				foreignObjectBox.getAttribute('width') === '0' &&
				foreignObjectBox.getAttribute('height') === '0'
			) {
				foreignObjectBox.setAttribute('x', x.toString())
				foreignObjectBox.setAttribute('y', y.toString())
				foreignObjectBox.setAttribute('width', width.toString())
				foreignObjectBox.setAttribute('height', height.toString())
			}
		}
		if (
			rectBBox &&
			rectBBox.getAttribute('x') === '0' &&
			rectBBox.getAttribute('y') === '0' &&
			rectBBox.getAttribute('width') === '0' &&
			rectBBox.getAttribute('height') === '0'
		) {
			rectBBox.setAttribute('x', x.toString())
			rectBBox.setAttribute('y', y.toString())
			rectBBox.setAttribute('width', width.toString())
			rectBBox.setAttribute('height', height.toString())
		}
		//实际大小和坐标理论上不会变 但是如果子组件设置了100% 还是会变 所以要做下判断
		if (
			(done_json.actual_bound.x === 0 &&
				done_json.actual_bound.y === 0 &&
				done_json.actual_bound.width === 0 &&
				done_json.actual_bound.height === 0) ||
			resize
		) {
			done_json.actual_bound = {
				x,
				y,
				width,
				height
			}
		}
		done_json.centerPosition = { x: done_json.x + width / 2, y: done_json.y + height / 2 }
		done_json.point_coordinate.tl = {
			x: done_json.x - (width * done_json.scale_x) / 2,
			y: done_json.y - (height * done_json.scale_y) / 2
		}
		done_json.point_coordinate.tc = {
			x: done_json.x,
			y: done_json.y - (height * done_json.scale_y) / 2
		}
		done_json.point_coordinate.tr = {
			x: done_json.x + (width * done_json.scale_x) / 2,
			y: done_json.y - (height * done_json.scale_y) / 2
		}
		done_json.point_coordinate.l = {
			x: done_json.x - (width * done_json.scale_x) / 2,
			y: done_json.y
		}
		done_json.point_coordinate.r = {
			x: done_json.x + (width * done_json.scale_x) / 2,
			y: done_json.y
		}
		done_json.point_coordinate.bl = {
			x: done_json.x - (width * done_json.scale_x) / 2,
			y: done_json.y + (height * done_json.scale_y) / 2
		}
		done_json.point_coordinate.bc = {
			x: done_json.x,
			y: done_json.y + (height * done_json.scale_y) / 2
		}
		done_json.point_coordinate.br = {
			x: done_json.x + (width * done_json.scale_x) / 2,
			y: done_json.y + (height * done_json.scale_y) / 2
		}
		if (done_json.rotate !== 0) {
			setAfterRotationPointCoordinate(done_json)
		}
	}
}
/**
 * 根据锚点类型获取锚点坐标
 * @param anchor_type
 * @param done_json
 * @returns
 */
export const getAnchorPosByAnchorType = (anchor_type: ELineBindAnchors, done_json: IDoneJson) => {
	if (anchor_type === ELineBindAnchors.BottomCenter) {
		return done_json.point_coordinate.bc
	} else if (anchor_type === ELineBindAnchors.Left) {
		return done_json.point_coordinate.l
	} else if (anchor_type === ELineBindAnchors.Right) {
		return done_json.point_coordinate.r
	} else {
		return done_json.point_coordinate.tc
	}
}
/**
 * 旋转之后重新设置组件八点坐标
 * @param item
 */
export const setAfterRotationPointCoordinate = (item: IDoneJson) => {
	item.point_coordinate = {
		tl: calculateRotatedPointCoordinate(item.point_coordinate.tl, item.centerPosition, item.rotate),
		tc: calculateRotatedPointCoordinate(item.point_coordinate.tc, item.centerPosition, item.rotate),
		tr: calculateRotatedPointCoordinate(item.point_coordinate.tr, item.centerPosition, item.rotate),
		l: calculateRotatedPointCoordinate(item.point_coordinate.l, item.centerPosition, item.rotate),
		r: calculateRotatedPointCoordinate(item.point_coordinate.r, item.centerPosition, item.rotate),
		bl: calculateRotatedPointCoordinate(item.point_coordinate.bl, item.centerPosition, item.rotate),
		bc: calculateRotatedPointCoordinate(item.point_coordinate.bc, item.centerPosition, item.rotate),
		br: calculateRotatedPointCoordinate(item.point_coordinate.br, item.centerPosition, item.rotate)
	}
}

export const prosToVBind = (item: IConfigItem) => {
	let temp = {}
	if (item.state) {
		for (const key in item.state) {
			if (key === 'OnOff') {
				for (const on_off_key in item.state[key]?.props) {
					temp = {
						...temp,
						...{
							[on_off_key]: item.state[key]?.default
								? item.state[key]?.props[on_off_key].openVal
								: item.state[key]?.props[on_off_key].closeVal
						}
					}
				}
			}
		}
	}
	for (const key in item.props) {
		temp = { ...temp, ...{ [key]: item.props[key].val } }
	}
	return temp
}
export const setArrItemByID = (id: string, key: string, val: any, json_arr: IDoneJson[]) => {
	return new Promise((res) => {
		const find_item = json_arr.find((f) => f.id === id)
		if (!find_item) {
			res({
				status: false,
				msg: '要设置的id不存在'
			})
		}
		eval(`find_item.${key} = val;`)
		res({
			status: true,
			msg: '操作成功'
		})
	})
}
export const getCommonClass = (item: IDoneJson) => {
	if (!item.common_animations || !item.common_animations.val) {
		return ``
	}
	return `common-ani animate__animated animate__${item.common_animations.val} animate__${item.common_animations.speed} animate__${item.common_animations.repeat} animate__${item.common_animations.delay}`
}

export const numberArray = (l: number) => {
	let t: number[] = []
	for (let i = 0; i < l; i++) {
		t.push(i)
	}
	return t
}

/*获取字符串width*/
export const getStringWidth = (str: string, fontSize = 12) => {
	if (str.length > 0) {
		let nodesH = document.createElement('span')
		nodesH.style.fontSize = fontSize + 'px'
		nodesH.style.fontFamily = 'inherit'
		nodesH.innerHTML = str
		nodesH.style.opacity = '0'
		nodesH.style.position = 'fixed'
		nodesH.style.top = '3000px'
		document.body.append(nodesH)
		const width = nodesH.clientWidth
		document.body.removeChild(nodesH)
		return width
	}
	return 0
}

export const valFormat = (v: any) => {
	if (/false|true/.test(v)) {
		return v !== 'false'
	}
	if (/^\d+(\.\d+)?$/.test(v)) {
		return Number(v)
	}
	return v
}
/**
 * 创建连线
 * @param bind_anchor_type 绑定锚点类型
 * @param itemInfo 组件（锚点创建线时）
 * @param e
 */
export const createLine = (e: MouseEvent, bind_anchor_type?: ELineBindAnchors, itemInfo?: IDoneJson) => {
	e.preventDefault()

	const globalStore = useGlobalStore(pinia)
	const configStore = useConfigStore(pinia)
	const svgEditLayoutStore = useSvgEditLayoutStore(pinia)

	const { clientX, clientY } = e
	let create_line_info = objectDeepClone<ISystemStraightLine>(configStore.connection_line)
	//以后顶部可以选择连线是哪种 直线先不做
	/*if (false) {
	 create_line_info = straight_line_system
	 }*/
	let x: number = 0
	let y: number = 0
	if (bind_anchor_type && itemInfo) {
		create_line_info.bind_anchors.start = {
			type: bind_anchor_type,
			target_id: itemInfo.id
		}
		let t = getAnchorPosByAnchorType(bind_anchor_type, itemInfo)
		x = t.x
		y = t.y
	} else {
		x = Math.round(
			(clientX - svgEditLayoutStore.canvasInfo.left) / configStore.svg.scale - svgEditLayoutStore.center_offset.x
		)
		y = Math.round(
			(clientY - svgEditLayoutStore.canvasInfo.top) / configStore.svg.scale - svgEditLayoutStore.center_offset.y
		)
	}
	const done_item_json = {
		id: straight_line_system.name + randomString(),
		x: x,
		y: y,
		client: {
			x: x,
			y: y
		},
		scale_x: 1,
		scale_y: 1,
		rotate: 0,
		actual_bound: {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		},
		centerPosition: { x: 0, y: 0 },
		point_coordinate: {
			tl: {
				x: 0,
				y: 0
			},
			tc: {
				x: 0,
				y: 0
			},
			tr: {
				x: 0,
				y: 0
			},
			l: {
				x: 0,
				y: 0
			},
			r: {
				x: 0,
				y: 0
			},
			bl: {
				x: 0,
				y: 0
			},
			bc: {
				x: 0,
				y: 0
			},
			br: {
				x: 0,
				y: 0
			}
		},
		...create_line_info
	}
	done_item_json.props.point_position.val.push({
		x: 50,
		y: 50
	})
	globalStore.setHandleSvgInfo(done_item_json, globalStore.done_json.length)
	globalStore.setDoneJson(done_item_json)

	globalStore.intention = EGlobalStoreIntention.Connection
	globalStore.mouse_info = {
		state: EMouseInfoState.Down,
		position_x: x,
		position_y: y,
		now_position_x: x,
		now_position_y: y,
		new_position_x: 0,
		new_position_y: 0
	}
}
