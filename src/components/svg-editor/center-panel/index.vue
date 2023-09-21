<script setup lang="ts">
	import { pinia, useHistoryRecord } from '@/hooks'
	import { useConfigStore } from '@/stores/config'
	import { useGlobalStore } from '@/stores/global'
	import type { IDoneJson } from '@/stores/global/types'
	import { EGlobalStoreIntention, EMouseInfoState, EScaleInfoType } from '@/stores/global/types'
	import { useSvgEditLayoutStore } from '@/stores/svg-edit-layout'
	import {
		createLine,
		getCenterPoint,
		getCommonClass,
		getSvgNowPosition,
		moveAnchors,
		moveHandlePoint,
		objectDeepClone,
		prosToVBind,
		randomString,
		resetHandlePointOld,
		setSvgActualInfo
	} from '@/utils'
	import {
		calculateBottom,
		calculateLeft,
		calculateLeftBottom,
		calculateLeftTop,
		calculateRight,
		calculateRightBottom,
		calculateRightTop,
		calculateTop
	} from '@/utils/scale-core'
	import HandlePanel from '@/components/svg-editor/handle-panel/index.vue'
	import ConnectionPanel from '@/components/svg-editor/connection-panel/index.vue'
	import type { IConfigItem } from '@/config/types'
	import { EDoneJsonType } from '@/config/types'
	import ConnectionLine from '@/components/svg-editor/connection-line/index.vue'
	import type { IVisibleInfo } from './types'
	import { vueComp } from '@/config'
	import { useContextMenuStore, useEditPrivateStore } from '@/stores/system'
	import { EContextMenuInfoType } from '@/stores/system/types'
	import { computed } from 'vue'

	//注册所有组件
	const instance = getCurrentInstance()
	Object.keys(vueComp).forEach((key) => {
		if (!Object.keys(instance?.appContext?.components as any).includes(key)) {
			// @ts-ignore
			instance?.appContext.app.component(key, vueComp[key])
		}
	})
	const globalStore = useGlobalStore(pinia)
	const configStore = useConfigStore(pinia)
	const svgEditLayoutStore = useSvgEditLayoutStore(pinia)
	const editPrivateStore = useEditPrivateStore(pinia)
	const contextMenuStore = useContextMenuStore(pinia)
	const contextMenuRef = ref<HTMLElement>()
	const canvasRef = ref<HTMLElement>()
	const ct: Record<string, any> = {
		MoveCanvas: 'grab',
		Rotate: "url('/src/assets/icons/rotate.svg'), auto",
		Connection: 'crosshair'
	}
	const cursor_style = computed(() => {
		if (Object.keys(ct).indexOf(globalStore.intention) > -1) {
			return ct[globalStore.intention]
		} else {
			return 'default'
		}
	})
	const visible_info: IVisibleInfo = reactive({
		handle_panel: computed(
			() =>
				globalStore.intention === EGlobalStoreIntention.Select ||
				globalStore.intention === EGlobalStoreIntention.Zoom ||
				globalStore.intention === EGlobalStoreIntention.Rotate
		),
		connection_panel: false,
		connection_line: false,
		select_item: {
			info: null,
			index: -1
		}
	})

	const area = ref<Record<string, any>>({
		a: {
			x: 0,
			y: 0
		},
		b: {
			x: 0,
			y: 0
		}
	})
	const selectRect = computed(() => {
		if (globalStore.intention === EGlobalStoreIntention.SelectArea && area.value.b.x && area.value.b.y) {
			return {
				with: Math.abs(area.value.b.x - area.value.a.x),
				height: Math.abs(area.value.b.y - area.value.a.y),
				x: area.value.a.x < area.value.b.x ? area.value.a.x : area.value.b.x,
				y: area.value.a.y < area.value.b.y ? area.value.a.y : area.value.b.y
			}
		}
		return {
			with: 0,
			height: 0,
			x: 0,
			y: 0
		}
	})

	const isGroup = computed(() => {
		let t = 0
		for (let e of globalStore.done_json) {
			if (e.selected) {
				t++
			}
		}
		return t > 0
	})

	let groupMoved = false

	const dropEvent = (e: Record<string, any>) => {
		if (globalStore.intention == EGlobalStoreIntention.None) {
			return
		} else if (globalStore.intention == EGlobalStoreIntention.Create) {
			if (!globalStore.create_svg_info) {
				console.error('要创建的数据获取失败')
				return
			}

			const _x = Math.floor(e.offsetX / configStore.svg.scale - svgEditLayoutStore.center_offset.x)
			const _y = Math.floor(e.offsetY / configStore.svg.scale - svgEditLayoutStore.center_offset.y)

			const done_item_json: IDoneJson = {
				id: randomString(),
				x: _x,
				y: _y,
				client: {
					x: _x,
					y: _y
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
				center_position: {
					x: 0,
					y: 0
				},
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
				selected: false,
				...objectDeepClone<IConfigItem>(globalStore.create_svg_info)
			}
			globalStore.setDoneJson(done_item_json)
			globalStore.setHandleSvgInfo(done_item_json, globalStore.done_json.length)
			globalStore.intention = EGlobalStoreIntention.None
		}
		canvasRef.value?.focus()
	}
	const dragEnterEvent = (e: DragEvent) => {
		//dragenter和dragover一定要阻止浏览器默认行为 不然不会触发drop
		e.preventDefault()
	}
	const dragOverEvent = (e: DragEvent) => {
		//dragenter和dragover一定要阻止浏览器默认行为 不然不会触发drop
		e.preventDefault()
	}
	const onSvgMouseDown = (select_item: IDoneJson, index: number, e: MouseEvent) => {
		canvasRef.value?.focus()
		if (globalStore.intention === EGlobalStoreIntention.Connection) {
			return
		}
		e.preventDefault()
		e.stopPropagation()
		if (e.ctrlKey && e.button === 0) {
			//ctrl+鼠标左键 多选组件
			if (globalStore.handle_svg_info?.index) {
				globalStore.done_json[globalStore.handle_svg_info.index].selected = true
				globalStore.setHandleSvgInfo(null)
				select_item.selected = !select_item.selected
			}
		} else if (isGroup.value) {
			//有框选的组件
			globalStore.intention = EGlobalStoreIntention.GroupMove
			globalStore.mouse_info = {
				state: EMouseInfoState.Down,
				position_x: Math.round((e.clientX - svgEditLayoutStore.canvasInfo.left) / configStore.svg.scale),
				position_y: Math.round((e.clientY - svgEditLayoutStore.canvasInfo.top) / configStore.svg.scale),
				now_position_x: 0,
				now_position_y: 0,
				new_position_x: 0,
				new_position_y: 0
			}
			for (let e of globalStore.done_json) {
				if (e.selected) {
					e.old_position = {
						x: e.x,
						y: e.y
					}
					e.point_coordinate_old = objectDeepClone(e.point_coordinate)
				}
			}
		} else {
			//鼠标在画布上的组件按下,记录选中的组件信息和鼠标位置信息等
			globalStore.intention = EGlobalStoreIntention.Select
			globalStore.setHandleSvgInfo(select_item, index)
			globalStore.mouse_info = {
				state: EMouseInfoState.Down,
				position_x: Math.round((e.clientX - svgEditLayoutStore.canvasInfo.left) / configStore.svg.scale),
				position_y: Math.round((e.clientY - svgEditLayoutStore.canvasInfo.top) / configStore.svg.scale),
				now_position_x: select_item.x,
				now_position_y: select_item.y,
				new_position_x: 0,
				new_position_y: 0
			}
			select_item.point_coordinate_old = objectDeepClone(select_item.point_coordinate)
		}
	}

	const onSvgMouseUp = (select_item: IDoneJson, index: number, e: MouseEvent) => {
		if (
			globalStore.intention === EGlobalStoreIntention.Connection ||
			globalStore.mouse_info.state != EMouseInfoState.Down
		) {
			return
		}
		if (isGroup.value && !groupMoved && ['SelectArea', 'Move', 'Select'].indexOf(globalStore.intention) < 0) {
			//在有框选组件的情况下点击单个组件，鼠标在画布上的组件弹起记录选中的组件信息和鼠标位置信息等
			for (let e of globalStore.done_json) {
				e.selected = false
				e.old_position = {
					x: 0,
					y: 0
				}
				resetHandlePointOld(e)
			}
			globalStore.intention = EGlobalStoreIntention.Select
			globalStore.setHandleSvgInfo(select_item, index)
			globalStore.mouse_info = {
				state: EMouseInfoState.Down,
				position_x: Math.round((e.clientX - svgEditLayoutStore.canvasInfo.left) / configStore.svg.scale),
				position_y: Math.round((e.clientY - svgEditLayoutStore.canvasInfo.top) / configStore.svg.scale),
				now_position_x: select_item.x,
				now_position_y: select_item.y,
				new_position_x: 0,
				new_position_y: 0
			}
		}
	}
	const onSvgMouseEnter = (select_item: IDoneJson, index: number, e: MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		visible_info.connection_panel = true
		visible_info.connection_line = true
		if (
			(globalStore.intention === EGlobalStoreIntention.Connection ||
				globalStore.intention === EGlobalStoreIntention.SetConnectionLineNode) &&
			select_item.type === EDoneJsonType.ConnectionLine
		) {
			return
		}
		visible_info.select_item.info = select_item
		visible_info.select_item.index = index
	}
	const onSvgMouseLeave = (select_item: IDoneJson, index: number, e: MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (
			(globalStore.intention === EGlobalStoreIntention.Connection ||
				globalStore.intention === EGlobalStoreIntention.SetConnectionLineNode) &&
			select_item.type === EDoneJsonType.ConnectionLine
		) {
			return
		}
		visible_info.connection_panel = false
		visible_info.connection_line = false
		visible_info.select_item.info = null
		visible_info.select_item.index = -1
	}
	const onCanvasMouseMove = (e: MouseEvent) => {
		//如果鼠标不是按下状态 连线除外
		if (
			globalStore.mouse_info.state != EMouseInfoState.Down &&
			globalStore.intention !== EGlobalStoreIntention.Connection
		) {
			return
		}
		const { clientX, clientY } = e
		globalStore.mouse_info.new_position_x = Math.round(
			(clientX - svgEditLayoutStore.canvasInfo.left) / configStore.svg.scale
		)
		globalStore.mouse_info.new_position_y = Math.round(
			(clientY - svgEditLayoutStore.canvasInfo.top) / configStore.svg.scale
		)
		const x = Math.round(
			globalStore.mouse_info.new_position_x - globalStore.mouse_info.position_x + globalStore.mouse_info.now_position_x
		)
		const y = Math.round(
			globalStore.mouse_info.new_position_y - globalStore.mouse_info.position_y + globalStore.mouse_info.now_position_y
		)
		if (
			globalStore.handle_svg_info?.info &&
			(globalStore.intention === EGlobalStoreIntention.Select || globalStore.intention === EGlobalStoreIntention.Move)
		) {
			//有选中组件 移动单个组件
			globalStore.handle_svg_info.info.x = x

			globalStore.handle_svg_info.info.y = y

			globalStore.handle_svg_info.info.client = {
				x: x,
				y: y
			}
			globalStore.intention = EGlobalStoreIntention.Move

			moveHandlePoint(globalStore.handle_svg_info.info)
			moveAnchors(globalStore.handle_svg_info.info)
			if (globalStore.handle_svg_info.info.type === EDoneJsonType.ConnectionLine) {
				//移动连线自己绑定过的锚点到绑定位置
				if (globalStore.handle_svg_info.info.bind_anchors?.start) {
					let _done_json: any = null
					for (let t of globalStore.done_json) {
						if (t.id === globalStore.handle_svg_info.info.bind_anchors?.start?.target_id) {
							_done_json = t
						}
					}
					if (_done_json) {
						moveAnchors(_done_json)
					}
				}
				if (globalStore.handle_svg_info.info.bind_anchors?.end) {
					let _done_json: any = null
					for (let t of globalStore.done_json) {
						if (t.id === globalStore.handle_svg_info.info.bind_anchors?.end?.target_id) {
							_done_json = t
						}
					}
					if (_done_json) {
						moveAnchors(_done_json)
					}
				}
			}
		} else if (globalStore.intention === EGlobalStoreIntention.MoveCanvas) {
			//移动画布
			svgEditLayoutStore.center_offset.x = x
			svgEditLayoutStore.center_offset.y = y
		} else if (globalStore.intention === EGlobalStoreIntention.SelectArea) {
			//框选
			area.value.b.x = globalStore.mouse_info.new_position_x - svgEditLayoutStore.center_offset.x
			area.value.b.y = globalStore.mouse_info.new_position_y - svgEditLayoutStore.center_offset.y
		} else if (globalStore.intention === EGlobalStoreIntention.GroupMove) {
			//群组移动
			groupMoved = true
			for (let e of globalStore.done_json) {
				if (e.selected && e.old_position) {
					const tx = Math.round(
						globalStore.mouse_info.new_position_x - globalStore.mouse_info.position_x + e.old_position.x
					)
					const ty = Math.round(
						globalStore.mouse_info.new_position_y - globalStore.mouse_info.position_y + e.old_position.y
					)
					e.x = tx
					e.y = ty
					e.client = {
						x: tx,
						y: ty
					}
					moveHandlePoint(e)
					moveAnchors(e)
					if (e.type === EDoneJsonType.ConnectionLine && e.bind_anchors?.end) {
						//移动连线自己绑定过的锚点到绑定位置
						let _done_json: any = null
						for (let t of globalStore.done_json) {
							if (t.id === e.bind_anchors?.end?.target_id) {
								_done_json = t
							}
						}
						if (_done_json) {
							moveAnchors(_done_json)
						}
					}
				}
			}
		} else if (globalStore.intention === EGlobalStoreIntention.Zoom) {
			//缩放单个组件
			if (!globalStore.handle_svg_info) {
				return
			}
			//当前鼠标在画布中的坐标
			const curPosition = {
				x: globalStore.mouse_info.new_position_x - svgEditLayoutStore.center_offset.x,
				y: globalStore.mouse_info.new_position_y - svgEditLayoutStore.center_offset.y
			}
			let new_length = {
				width: 0,
				height: 0,
				is_old_width: false,
				is_old_height: false
			}
			if (globalStore.scale_info.type === EScaleInfoType.TopLeft) {
				new_length = calculateLeftTop(
					curPosition,
					globalStore.scale_info.symmetric_point,
					globalStore.handle_svg_info.info.rotate
				)
			} else if (globalStore.scale_info.type === EScaleInfoType.TopRight) {
				new_length = calculateRightTop(
					curPosition,
					globalStore.scale_info.symmetric_point,
					globalStore.handle_svg_info.info.rotate
				)
			} else if (globalStore.scale_info.type === EScaleInfoType.BottomRight) {
				new_length = calculateRightBottom(
					curPosition,
					globalStore.scale_info.symmetric_point,
					globalStore.handle_svg_info.info.rotate
				)
			} else if (globalStore.scale_info.type === EScaleInfoType.BottomLeft) {
				new_length = calculateLeftBottom(
					curPosition,
					globalStore.scale_info.symmetric_point,
					globalStore.handle_svg_info.info.rotate
				)
			} else if (globalStore.scale_info.type === EScaleInfoType.TopCenter) {
				new_length = calculateTop(
					curPosition,
					globalStore.scale_info.symmetric_point,
					globalStore.handle_svg_info.info.rotate,
					globalStore.handle_svg_info.info.client
				)
			} else if (globalStore.scale_info.type === EScaleInfoType.Right) {
				new_length = calculateRight(
					curPosition,
					globalStore.scale_info.symmetric_point,
					globalStore.handle_svg_info.info.rotate,
					globalStore.handle_svg_info.info.client
				)
			} else if (globalStore.scale_info.type === EScaleInfoType.BottomCenter) {
				new_length = calculateBottom(
					curPosition,
					globalStore.scale_info.symmetric_point,
					globalStore.handle_svg_info.info.rotate,
					globalStore.handle_svg_info.info.client
				)
			} else if (globalStore.scale_info.type === EScaleInfoType.Left) {
				new_length = calculateLeft(
					curPosition,
					globalStore.scale_info.symmetric_point,
					globalStore.handle_svg_info.info.rotate,
					globalStore.handle_svg_info.info.client
				)
			}

			//算出缩放倍数
			if (globalStore.handle_svg_info && new_length.width > 0 && new_length.height > 0) {
				const scale_x = !new_length.is_old_width
					? parseFloat((new_length.width / globalStore.handle_svg_info.info.actual_bound.width).toFixed(3))
					: 1
				const scale_y = !new_length.is_old_height
					? parseFloat((new_length.height / globalStore.handle_svg_info.info.actual_bound.height).toFixed(3))
					: 1
				const newCenterPoint = getCenterPoint(curPosition, globalStore.scale_info.symmetric_point)
				if (
					scale_x > 0 &&
					globalStore.scale_info.type !== EScaleInfoType.TopCenter &&
					globalStore.scale_info.type !== EScaleInfoType.BottomCenter
				) {
					globalStore.handle_svg_info.info.scale_x = scale_x
					globalStore.handle_svg_info.info.x = Math.round(
						getSvgNowPosition(
							globalStore.handle_svg_info.info.center_position.x,
							newCenterPoint.x,
							globalStore.handle_svg_info.info.client.x
						)
					)
				}
				if (
					scale_y > 0 &&
					globalStore.scale_info.type !== EScaleInfoType.Left &&
					globalStore.scale_info.type !== EScaleInfoType.Right
				) {
					globalStore.handle_svg_info.info.scale_y = scale_y
					globalStore.handle_svg_info.info.y = Math.round(
						getSvgNowPosition(
							globalStore.handle_svg_info.info.center_position.y,
							newCenterPoint.y,
							globalStore.handle_svg_info.info.client.y
						)
					)
				}
			}
		} else if (globalStore.intention === EGlobalStoreIntention.Rotate) {
			if (!globalStore.handle_svg_info) {
				return
			}
			const rotateDegreeBefore =
				Math.atan2(
					globalStore.mouse_info.position_y - globalStore.handle_svg_info.info.y,
					globalStore.mouse_info.position_x - globalStore.handle_svg_info.info.x
				) /
				(Math.PI / 180)
			const rotateDegreeAfter =
				Math.atan2(
					globalStore.mouse_info.new_position_y -
						svgEditLayoutStore.center_offset.y -
						globalStore.handle_svg_info.info.y,
					globalStore.mouse_info.new_position_x -
						svgEditLayoutStore.center_offset.x -
						globalStore.handle_svg_info.info.x
				) /
				(Math.PI / 180)
			globalStore.handle_svg_info.info.rotate = parseFloat(
				(globalStore.rotate_info.angle + rotateDegreeAfter - rotateDegreeBefore).toFixed(2)
			)
		} else if (globalStore.intention === EGlobalStoreIntention.Connection && globalStore.handle_svg_info) {
			//鼠标移动的实时位置（相对于连线起始点，只在创建第一个点时记录了鼠标原始位置）
			const l = globalStore.handle_svg_info?.info.props.point_position.val.length
			const _x =
				globalStore.mouse_info.new_position_x - globalStore.mouse_info.position_x - svgEditLayoutStore.center_offset.x
			const _y =
				globalStore.mouse_info.new_position_y - globalStore.mouse_info.position_y - svgEditLayoutStore.center_offset.y
			const brotherPoint = globalStore.handle_svg_info.info.props.point_position.val[l - 2]
			let ox = brotherPoint.x < _x ? -5 : brotherPoint.x > _x ? 5 : 0
			let oy = brotherPoint.y < _y ? -5 : brotherPoint.y > _y ? 5 : 0
			if (e.ctrlKey) {
				//画竖线
				globalStore.handle_svg_info.info.props.point_position.val[l - 1] = {
					x: brotherPoint.x,
					y: _y + oy
				}
			} else if (e.shiftKey) {
				//画横线
				globalStore.handle_svg_info.info.props.point_position.val[l - 1] = {
					x: _x + ox,
					y: brotherPoint.y
				}
			} else {
				globalStore.handle_svg_info.info.props.point_position.val[l - 1] = {
					x: _x + ox,
					y: _y + oy
				}
			}
		} else if (globalStore.intention === EGlobalStoreIntention.SetConnectionLineNode && globalStore.handle_svg_info) {
			globalStore.handle_svg_info.info.props.point_position.val[globalStore.connection_line_node_info.point_index] = {
				x: getSvgNowPosition(
					globalStore.mouse_info.position_x,
					globalStore.mouse_info.new_position_x,
					globalStore.connection_line_node_info.init_pos.x
				),
				y: getSvgNowPosition(
					globalStore.mouse_info.position_y,
					globalStore.mouse_info.new_position_y,
					globalStore.connection_line_node_info.init_pos.y
				)
			}
		}
	}
	const onCanvasMouseUp = () => {
		//如果鼠标不是按下状态
		if (globalStore.mouse_info.state != EMouseInfoState.Down) {
			return
		}
		if (globalStore.handle_svg_info?.info && globalStore.intention == EGlobalStoreIntention.Move) {
			setSvgActualInfo(globalStore.done_json[globalStore.handle_svg_info.index])
			globalStore.intention = EGlobalStoreIntention.None
			//记录历史记录
			globalStore.setDoneJson(globalStore.done_json)
		} else if (globalStore.intention == EGlobalStoreIntention.GroupMove) {
			if (groupMoved) {
				//群组移动了
				groupMoved = false
				globalStore.intention = EGlobalStoreIntention.None
			}
		} else if (globalStore.handle_svg_info?.info && globalStore.intention == EGlobalStoreIntention.Zoom) {
			//缩放完成后重置中点 新版本中点就是组件坐标
			// const newCenterPoint = getCenterPoint(
			//   { x: e.clientX, y: e.clientY },
			//   globalStore.scale_info.symmetric_point
			// );
			globalStore.handle_svg_info.info.client = {
				x: globalStore.handle_svg_info.info.x,
				y: globalStore.handle_svg_info.info.y
			}
			globalStore.intention = EGlobalStoreIntention.None
			setSvgActualInfo(globalStore.done_json[globalStore.handle_svg_info.index])
			//记录历史记录
			globalStore.setDoneJson(globalStore.done_json)
		} else if (globalStore.intention === EGlobalStoreIntention.Rotate && globalStore.handle_svg_info?.info) {
			setSvgActualInfo(globalStore.done_json[globalStore.handle_svg_info.index])
			//记录历史记录
			globalStore.setDoneJson(globalStore.done_json)
			globalStore.intention = EGlobalStoreIntention.None
		} else if (globalStore.intention === EGlobalStoreIntention.Connection) {
			return
		} else if (globalStore.intention === EGlobalStoreIntention.SelectArea) {
			//框选
			globalStore.setHandleSvgInfo(null)
			for (let e of globalStore.done_json) {
				const t = selectRect.value
				e.selected = e.x > t.x && e.x < t.x + t.with && e.y > t.y && e.y < t.y + t.height
			}
			globalStore.intention = EGlobalStoreIntention.None
		} else if (globalStore.intention != EGlobalStoreIntention.Select) {
			globalStore.intention = EGlobalStoreIntention.None
		}
		globalStore.mouse_info = {
			state: EMouseInfoState.Up,
			position_x: 0,
			position_y: 0,
			now_position_x: 0,
			now_position_y: 0,
			new_position_x: 0,
			new_position_y: 0
		}
		contextMenuStore.display = false
	}
	const onCanvasMouseDown = (e: MouseEvent) => {
		//todo 画横线或垂线
		const { clientX, clientY } = e
		if (globalStore.intention === EGlobalStoreIntention.Connection) {
			if (!globalStore.handle_svg_info) {
				//空白地方画线
				createLine(e)
			}
			if (globalStore.handle_svg_info) {
				if (e.button === 0) {
					//鼠标左键创建新线段
					if (globalStore.handle_svg_info.info.props.point_position.val.length !== 1) {
						//鼠标移动后的实时位置（相对于起始点，只在创建第一个点时记录了鼠标原始位置）
						globalStore.handle_svg_info.info.props.point_position.val.push({
							x:
								globalStore.mouse_info.new_position_x -
								globalStore.mouse_info.position_x -
								svgEditLayoutStore.center_offset.x,
							y:
								globalStore.mouse_info.new_position_y -
								globalStore.mouse_info.position_y -
								svgEditLayoutStore.center_offset.y
						})
					} else {
						//第二个点，在鼠标没有移动的情况下，就是起始点
						globalStore.handle_svg_info.info.props.point_position.val.push({
							x: 0,
							y: 0
						})
					}
				} else if (e.button === 2) {
					//鼠标右键结束线段绘制
					globalStore.intention = EGlobalStoreIntention.None
					setSvgActualInfo(globalStore.done_json[globalStore.handle_svg_info.index])
					globalStore.setHandleSvgInfo(null)
				}
			}
			return
		}
		if (e.button === 0) {
			//左键点击画布 未选中组件 框选
			globalStore.intention = EGlobalStoreIntention.SelectArea

			globalStore.mouse_info = {
				state: EMouseInfoState.Down,
				position_x: Math.round(
					(clientX - svgEditLayoutStore.canvasInfo.left) / configStore.svg.scale - svgEditLayoutStore.center_offset.x
				),
				position_y: Math.round(
					(clientY - svgEditLayoutStore.canvasInfo.top) / configStore.svg.scale - svgEditLayoutStore.center_offset.y
				),
				now_position_x: 0,
				now_position_y: 0,
				new_position_x: 0,
				new_position_y: 0
			}

			area.value = {
				a: {
					x: globalStore.mouse_info.position_x,
					y: globalStore.mouse_info.position_y
				},
				b: {
					x: 0,
					y: 0
				}
			}
		} else if (e.button === 2) {
			//右键点击画布 未选中组件 拖动画布
			globalStore.intention = EGlobalStoreIntention.MoveCanvas

			globalStore.mouse_info = {
				state: EMouseInfoState.Down,
				position_x: Math.round((clientX - svgEditLayoutStore.canvasInfo.left) / configStore.svg.scale),
				position_y: Math.round((clientY - svgEditLayoutStore.canvasInfo.top) / configStore.svg.scale),
				now_position_x: svgEditLayoutStore.center_offset.x,
				now_position_y: svgEditLayoutStore.center_offset.y,
				new_position_x: 0,
				new_position_y: 0
			}
		}
	}

	function onMousewheel(e: any) {
		if (e?.wheelDelta) {
			if (e.wheelDelta > 0) {
				configStore.svg.scale = parseFloat((configStore.svg.scale + 0.1).toFixed(1))
			} else {
				configStore.svg.scale = parseFloat((configStore.svg.scale - 0.1).toFixed(1))
			}
		}
	}

	/**
	 * 鼠标右键事件
	 * @param e
	 * @returns
	 */
	const onCanvasContextMenuEvent = (e: MouseEvent) => {
		e.stopPropagation()
		e.preventDefault() //禁用浏览器右键
	}
	const onSvgContextMenuEvent = (select_item: IDoneJson, index: number, e: MouseEvent) => {
		if (globalStore.intention === EGlobalStoreIntention.Connection) {
			return
		}

		if (contextMenuRef.value) {
			globalStore.intention = EGlobalStoreIntention.ContextMenu
			globalStore.setHandleSvgInfo(select_item, index)
			contextMenuRef.value!.style.left = e.pageX + 'px'
			contextMenuRef.value!.style.top = e.pageY + 'px'
			contextMenuStore.info.MoveUpOneLevel.enable =
				contextMenuStore.info.MoveUpTopLevel.enable =
				contextMenuStore.info.MoveDownOneLevel.enable =
				contextMenuStore.info.MoveDownTopLevel.enable =
					true
			if (index === globalStore.done_json.length - 1) {
				contextMenuStore.info.MoveUpOneLevel.enable = contextMenuStore.info.MoveUpTopLevel.enable = false
			}
			if (index === 0) {
				contextMenuStore.info.MoveDownOneLevel.enable = contextMenuStore.info.MoveDownTopLevel.enable = false
			}
			contextMenuStore.display = true
		}
	}
	const getActualBoundScale = (
		actual_bound: {
			x: number
			y: number
			width: number
			height: number
		},
		scale_x: number,
		scale_y: number
	) => {
		return {
			x: parseFloat((actual_bound.x - (actual_bound.width / 2) * scale_x + actual_bound.width / 2).toFixed(1)),
			y: parseFloat((actual_bound.y - (actual_bound.height / 2) * scale_y + actual_bound.height / 2).toFixed(1)),
			width: parseFloat((actual_bound.width * scale_x).toFixed(1)),
			height: parseFloat((actual_bound.height * scale_y).toFixed(1))
		}
	}
	const onHandleKeyDown = (e: KeyboardEvent) => {
		e.preventDefault()
		let mGroup: number[] = []
		if (!e.ctrlKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) > -1) {
			if (isGroup.value) {
				//群体移动
				mGroup = globalStore.done_json
					.map((e, i) => ({
						selected: e.selected,
						i: i
					}))
					.filter((e) => e.selected)
					.map((e) => e.i)
			} else {
				if (globalStore.handle_svg_info) {
					mGroup.push(globalStore.handle_svg_info.index)
				}
			}
		}
		if (!e.ctrlKey && e.key == 'ArrowUp') {
			for (let i of mGroup) {
				globalStore.done_json[i].y -= 1
				globalStore.done_json[i].client.y -= 1
				moveHandlePoint(globalStore.done_json[i], 0, -1)
				moveAnchors(globalStore.done_json[i])
			}
			useHistoryRecord(globalStore.done_json)
		} else if (!e.ctrlKey && e.key == 'ArrowDown') {
			for (let i of mGroup) {
				globalStore.done_json[i].y += 1
				globalStore.done_json[i].client.y += 1
				moveHandlePoint(globalStore.done_json[i], 0, 1)
				moveAnchors(globalStore.done_json[i])
			}
			useHistoryRecord(globalStore.done_json)
		} else if (!e.ctrlKey && e.key == 'ArrowLeft') {
			for (let i of mGroup) {
				globalStore.done_json[i].x -= 1
				globalStore.done_json[i].client.x -= 1
				moveHandlePoint(globalStore.done_json[i], -1, 0)
				moveAnchors(globalStore.done_json[i])
			}
			useHistoryRecord(globalStore.done_json)
		} else if (!e.ctrlKey && e.key == 'ArrowRight') {
			for (let i of mGroup) {
				globalStore.done_json[i].x += 1
				globalStore.done_json[i].client.x += 1
				moveHandlePoint(globalStore.done_json[i], 1, 0)
				moveAnchors(globalStore.done_json[i])
			}
			useHistoryRecord(globalStore.done_json)
		}
		//ctrl  c
		else if (e.ctrlKey && e.key.toLowerCase() == 'c') {
			contextMenuStore.onContextMenuClick(EContextMenuInfoType.Copy)
		}
		//deleted
		else if (!e.ctrlKey && e.key == 'Delete') {
			if (isGroup.value) {
				//有框选组件,批量删除
				globalStore.setDoneJson(globalStore.done_json.filter((e) => !e.selected))
				globalStore.setHandleSvgInfo(
					globalStore.done_json[globalStore.done_json.length - 1],
					globalStore.done_json.length - 1
				)
			} else {
				contextMenuStore.onContextMenuClick(EContextMenuInfoType.Delete)
			}
		}
		//上移一层
		else if (e.ctrlKey && e.key == 'ArrowUp') {
			contextMenuStore.onContextMenuClick(EContextMenuInfoType.MoveUpOneLevel)
		}
		//下移一层
		else if (e.ctrlKey && e.key == 'ArrowDown') {
			contextMenuStore.onContextMenuClick(EContextMenuInfoType.MoveDownOneLevel)
		}
		//置于底层
		else if (e.ctrlKey && e.key == 'ArrowLeft') {
			contextMenuStore.onContextMenuClick(EContextMenuInfoType.MoveDownTopLevel)
		}
		//置于顶层
		else if (e.ctrlKey && e.key == 'ArrowRight') {
			contextMenuStore.onContextMenuClick(EContextMenuInfoType.MoveUpTopLevel)
		}
		//ctrl+shift+z
		else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() == 'z') {
			editPrivateStore.topRedoBtnClick()
		}
		//ctrl+z
		else if (e.ctrlKey && e.key.toLowerCase() == 'z') {
			editPrivateStore.topUndoBtnClick()
		}
		//ctrl+delete
		else if (e.ctrlKey && e.key.toLowerCase() == 'delete') {
			globalStore.done_json.length <= 0 || globalStore.setDoneJson([])
		}
	}

	const resizeBox = () => {
		setSvgActualInfo(globalStore.done_json[globalStore.handle_svg_info!.index], true)
	}

	onMounted(() => {
		canvasRef.value?.focus()
		nextTick(function () {
			const d = canvasRef.value?.getBoundingClientRect()
			svgEditLayoutStore.canvasInfo = {
				height: d?.height || 0,
				with: d?.width || 0,
				top: d?.top || 0,
				left: d?.left || 0
			}
		})
	})
</script>

<template>
	<div
		class="canvas"
		tabindex="0"
		ref="canvasRef"
		@drop="dropEvent"
		@dragenter="dragEnterEvent"
		@dragover="dragOverEvent"
		@mousedown="onCanvasMouseDown"
		@mousemove="onCanvasMouseMove"
		@mouseup="onCanvasMouseUp"
		@contextmenu="onCanvasContextMenuEvent"
		@keydown="onHandleKeyDown"
		@mousewheel="onMousewheel"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			:style="{ backgroundColor: configStore.svg.background_color }"
			width="100%"
			height="100%"
		>
			<defs>
				<pattern id="pattern_grid" patternUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
					<line x1="0" y1="0" x2="0" y2="20" :stroke="configStore.svg.grid_color" />
					<line x1="10" y1="0" x2="10" y2="20" :stroke="configStore.svg.grid_color" />
					<line x1="0" y1="0" x2="20" y2="0" :stroke="configStore.svg.grid_color" />
					<line x1="0" y1="10" x2="20" y2="10" :stroke="configStore.svg.grid_color" />
				</pattern>
			</defs>
			<rect v-if="configStore.svg.grid" width="100%" height="100%" fill="url(#pattern_grid)" />
			<g
				:transform="`translate(${svgEditLayoutStore.center_offset.x * configStore.svg.scale},${
					svgEditLayoutStore.center_offset.y * configStore.svg.scale
				})rotate(${0})scale(${configStore.svg.scale})`"
			>
				<g
					v-for="(item, index) in globalStore.done_json"
					:key="item.id"
					:transform="`translate(${item.x},${item.y})rotate(0)scale(1)`"
					v-show="item.display"
				>
					<g :class="`${getCommonClass(item)}`">
						<g
							:transform="`translate(${item.actual_bound.x + item.actual_bound.width / 2},${
								item.actual_bound.y + item.actual_bound.height / 2
							})rotate(${item.rotate}) scale(1) translate(${-(item.actual_bound.x + item.actual_bound.width / 2)},${-(
								item.actual_bound.y +
								item.actual_bound.height / 2
							)})`"
							@mousedown="onSvgMouseDown(item, index, $event)"
							@mouseup="onSvgMouseUp(item, index, $event)"
							@mouseenter="onSvgMouseEnter(item, index, $event)"
							@mouseleave="onSvgMouseLeave(item, index, $event)"
							@contextmenu="onSvgContextMenuEvent(item, index, $event)"
						>
							<connection-line
								v-if="item.type === EDoneJsonType.ConnectionLine"
								:item-info="item"
								:point-visible="visible_info.connection_line && visible_info.select_item.info?.id == item.id"
							/>
							<use
								v-else-if="item.type === EDoneJsonType.File"
								:xlink:href="`#svg-${item.name}`"
								v-bind="prosToVBind(item)"
								width="100"
								height="100"
								:id="item.id"
								:transform="`translate(${item.actual_bound.x + item.actual_bound.width / 2},${
									item.actual_bound.y + item.actual_bound.height / 2
								}) scale(${item.scale_x},${item.scale_y}) translate(${-(
									item.actual_bound.x +
									item.actual_bound.width / 2
								)},${-(item.actual_bound.y + item.actual_bound.height / 2)})`"
							/>
							<component
								v-else-if="item.type === EDoneJsonType.CustomSvg"
								:is="item.tag"
								v-bind="prosToVBind(item)"
								width="100"
								height="100"
								:id="item.id"
								@resize="resizeBox"
								:transform="`translate(${item.actual_bound.x + item.actual_bound.width / 2},${
									item.actual_bound.y + item.actual_bound.height / 2
								}) scale(${item.scale_x},${item.scale_y}) translate(${-(
									item.actual_bound.x +
									item.actual_bound.width / 2
								)},${-(item.actual_bound.y + item.actual_bound.height / 2)})`"
							/>
							<foreignObject
								v-else-if="item.type === EDoneJsonType.Vue"
								v-bind="getActualBoundScale(item.actual_bound, item.scale_x, item.scale_y)"
								:id="`foreign-object${item.id}`"
							>
								<component
									:is="item.tag"
									v-bind="prosToVBind(item)"
									:id="item.id"
									:transform="`translate(${item.actual_bound.x + item.actual_bound.width / 2},${
										item.actual_bound.y + item.actual_bound.height / 2
									}) scale(${item.scale_x},${item.scale_y}) translate(${-(
										item.actual_bound.x +
										item.actual_bound.width / 2
									)},${-(item.actual_bound.y + item.actual_bound.height / 2)})`"
									>{{ item.tag_slot }}
								</component>
							</foreignObject>

							<line
								v-else-if="item.type === EDoneJsonType.StraightLine"
								:id="item.id"
								:x1="item.props.start_x.val"
								:y1="item.props.start_y.val"
								:x2="item.props.end_x.val"
								:y2="item.props.end_y.val"
								fill="#FF0000"
								stroke="#FF0000"
								stroke-width="2"
							/>
							<rect
								v-if="item.config.actual_rect"
								:id="`rect${item.id}`"
								fill="black"
								fill-opacity="0"
								v-bind="getActualBoundScale(item.actual_bound, item.scale_x, item.scale_y)"
								style="stroke: none; stroke-width: 2; stroke-miterlimit: 10"
								:class="{
									'svg-item-none':
										!item.selected &&
										(globalStore.intention == EGlobalStoreIntention.None ||
											globalStore.intention == EGlobalStoreIntention.Select),
									'svg-item-move':
										globalStore.intention == EGlobalStoreIntention.Move &&
										globalStore.handle_svg_info?.info.id == item.id,
									'svg-item-select':
										globalStore.intention == EGlobalStoreIntention.Select &&
										globalStore.handle_svg_info?.info.id == item.id,
									'svg-item-in-group': item.selected
								}"
							/>

							<handle-panel
								v-if="
									globalStore.handle_svg_info?.info.id === item.id && visible_info.handle_panel && item.config.can_zoom
								"
								:item-info="item"
							/>
							<connection-panel
								@contextmenu="onCanvasContextMenuEvent"
								v-if="
									!item.selected &&
									visible_info.select_item.info?.id == item.id &&
									visible_info.connection_panel &&
									item.config.have_anchor &&
									globalStore.intention !== EGlobalStoreIntention.SelectArea &&
									(globalStore.intention === EGlobalStoreIntention.Select
										? item.id !== globalStore.handle_svg_info?.info.id
										: true)
								"
								:item-info="item"
							/>
						</g>
					</g>
				</g>
				<!--框选-->
				<rect
					:x="selectRect.x"
					:y="selectRect.y"
					:height="selectRect.height"
					:width="selectRect.with"
					stroke="#107cec"
					fill="#107cec"
					fill-opacity=".2"
				/>
			</g>
		</svg>
	</div>
	<!-- 右键菜单 -->
	<ul ref="contextMenuRef" class="contextMenu" v-show="contextMenuStore.display">
		<li
			v-for="(item, key) in contextMenuStore.info"
			:key="item.title"
			@click="contextMenuStore.onContextMenuClick(key)"
		>
			<p :class="item.enable ? '' : 'disabled'">
				{{ item.title }}
				<span class="shortcut">{{ item.hot_key }}</span>
			</p>
		</li>
	</ul>
</template>

<style lang="less" scoped>
	.canvas {
		width: 100%;
		height: 100%;
		cursor: v-bind('cursor_style');

		&:focus-visible {
			outline: 0;
		}
	}

	.svg-item-none {
		cursor: move;

		&:hover {
			outline: 1px solid #f8d032;
		}
	}

	.svg-item-move {
		cursor: move;
		outline: 1px dashed rgb(222, 123, 23);
	}

	.svg-item-select {
		cursor: move;
		outline: 1px solid rgb(222, 123, 23);
	}

	.svg-item-in-group {
		//outline: 1px solid rgb(222, 123, 23);
		outline: 1px solid rgb(222, 69, 23);
	}

	.contextMenu {
		position: fixed;
		z-index: 99999;
		background: #ffffff;
		padding: 5px 0;
		margin: 0;
		display: block;
		border-radius: 5px;
		box-shadow: 2px 5px 10px rgba(0, 0, 0, 0.3);

		li {
			list-style: none;
			padding: 0;
			margin: 0;
		}

		.shortcut {
			width: 115px;
			text-align: right;
			float: right;
		}

		p {
			text-decoration: none;
			display: block;
			padding: 0 15px 1px 20px;
			margin: 0;
			user-select: none;
			-webkit-user-select: none;
		}

		p:hover {
			background-color: #0cf;
			color: #ffffff;
			cursor: default;
		}

		.disabled {
			color: #999;
		}

		.disabled:hover {
			color: #999;
			background-color: transparent;
		}

		li.separator {
			border-top: solid 1px #e3e3e3;
			padding-top: 5px;
			margin-top: 5px;
		}
	}

	.common-ani {
		transform-box: fill-box;
	}
</style>
