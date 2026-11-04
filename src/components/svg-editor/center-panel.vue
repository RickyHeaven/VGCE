<script setup lang="ts">
	import type { ComputedRef } from 'vue'
	import { pinia, useHistoryRecord } from '@/hooks'
	import { useConfigStore } from '@/stores/config'
	import { useGlobalStore } from '@/stores/global'
	import type { IDoneJson } from '@/stores/global/types'
	import { EGlobalStoreIntention, EMouseInfoState, EScaleInfoType } from '@/stores/global/types'
	import { useSvgEditLayoutStore } from '@/stores/svg-edit-layout'
	import {
		componentsRegister,
		createLine,
		getCenterPoint,
		getCommonClass,
		getSvgNowPosition,
		getZoomPosition,
		moveAnchors,
		moveHandlePoint,
		myFixed,
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
	import HandlePanel from '@/components/svg-editor/handle-panel.vue'
	import ConnectionPanel from '@/components/svg-editor/connection-panel.vue'
	import { EDoneJsonType, type IConfigItem } from '@/config/types'
	import { resolveCanvasComp } from '@/config'
	import { configLocaleKey } from '@/config/i18n'
	import ConnectionLine from '@/components/svg-editor/connection-line.vue'
	import type { IVisibleInfo } from '../config'
	import { useContextMenuStore, useEditPrivateStore } from '@/stores/system'
	import { EContextMenuInfoType } from '@/stores/system/types'
	import { exportCanvasSvg } from '@/utils/export-svg'
	import { clipByViewport, rafThrottle, EPreviewPerfLevel, type IResolvedEditorPerfOptions } from '@/utils/perf'
	import { translate, useVgceLocale } from '@/i18n'

	const globalStore = useGlobalStore(pinia)
	const configStore = useConfigStore(pinia)
	const svgEditLayoutStore = useSvgEditLayoutStore(pinia)
	const editPrivateStore = useEditPrivateStore(pinia)
	const contextMenuStore = useContextMenuStore(pinia)

	const props = defineProps<{ vueComp?: Record<string, any> }>()

	const editorPerf = inject<ComputedRef<IResolvedEditorPerfOptions>>('editorPerf', computed(() => ({
		level: EPreviewPerfLevel.Medium,
		animations: true,
		fpsLimit: 30,
		clipThreshold: 300
	})))

	/**
	 * 低性能模式：拖拽画布/缩放过程中冻结视觉transform，交互结束时一次性跳到最终位置。
	 * 这样在整个拖拽/缩放期间不产生SVG UpdateLayoutTree，仅在冻结快照和跳转终点时各触发一次。
	 * 注意：仅对右键拖动画布(MoveCanvas)和滚轮缩放生效，左键框选/组件拖拽不能冻结。
	 */
	const isEditorLowPerf = computed(() => editorPerf.value.level === 'low')
	const isEditorMovementFrozen = ref(false)
	const frozenCenterX = ref(0)
	const frozenCenterY = ref(0)
	const frozenScale = ref(1)
	const editorVisualCenterX = computed(() =>
		isEditorMovementFrozen.value ? frozenCenterX.value : svgEditLayoutStore.center_offset.x
	)
	const editorVisualCenterY = computed(() =>
		isEditorMovementFrozen.value ? frozenCenterY.value : svgEditLayoutStore.center_offset.y
	)
	const editorVisualScale = computed(() =>
		isEditorMovementFrozen.value ? frozenScale.value : configStore.svg.scale
	)

	const editorZoomUnfreezeDelay = 200
	let editorZoomUnfreezeTimer: ReturnType<typeof setTimeout> | null = null

	const freezeEditorVisual = () => {
		if (!isEditorLowPerf.value || isEditorMovementFrozen.value) return
		frozenCenterX.value = svgEditLayoutStore.center_offset.x
		frozenCenterY.value = svgEditLayoutStore.center_offset.y
		frozenScale.value = configStore.svg.scale
		isEditorMovementFrozen.value = true
	}

	const unfreezeEditorVisual = () => {
		if (editorZoomUnfreezeTimer) {
			clearTimeout(editorZoomUnfreezeTimer)
			editorZoomUnfreezeTimer = null
		}
		isEditorMovementFrozen.value = false
	}

	componentsRegister(props.vueComp)
	provide(configLocaleKey, useVgceLocale())
	const contextMenuRef = ref<HTMLElement>()
	const canvasRef = ref<HTMLElement>()
	const svgRef = ref<SVGSVGElement>()
	const ct: Record<string, any> = {
		MoveCanvas: 'grab',
		Rotate: "url('/src/assets/icons/rotate.svg'), auto",
		Connection: 'crosshair',
		SetConnectionLineNode: 'crosshair'
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
	let lineNodeMoved = false

	/**
	 * 编辑器裁剪锚点（世界坐标下的视口左上角）
	 * 画布平移不会立即重算裁剪列表，只有锚点位移超过半个视口时才更新，
	 * 避免拖动画布时每帧对全部节点做filter并替换整个v-for列表
	 */
	const editorClipAnchor = reactive({ left: 0, top: 0, scale: 1 })
	const EDITOR_CLIP_RECALC_RATIO = 0.5
	//裁剪缓冲区（世界坐标），与 clipByViewport 的 buffer 保持一致
	const EDITOR_CLIP_BUFFER = 300
	//重算滞后必须小于缓冲区，否则平移时可视区会超出已裁剪范围，出现组件缺失的空白带
	const EDITOR_CLIP_MAX_LAG = EDITOR_CLIP_BUFFER / 2

	const syncEditorClipAnchor = () => {
		const scale = configStore.svg.scale || 1
		editorClipAnchor.scale = scale
		editorClipAnchor.left = -svgEditLayoutStore.center_offset.x
		editorClipAnchor.top = -svgEditLayoutStore.center_offset.y
	}

	const maybeRecalcEditorClip = () => {
		const list = globalStore.done_json
		if (list.length <= editorPerf.value.clipThreshold) {
			return
		}
		const scale = configStore.svg.scale || 1
		const left = -svgEditLayoutStore.center_offset.x
		const top = -svgEditLayoutStore.center_offset.y
		//缩放变化必须重算，否则裁剪范围与视觉不符
		if (scale !== editorClipAnchor.scale) {
			syncEditorClipAnchor()
			return
		}
		const info = svgEditLayoutStore.canvasInfo
		const limitX = Math.min((info.with / scale) * EDITOR_CLIP_RECALC_RATIO, EDITOR_CLIP_MAX_LAG)
		const limitY = Math.min((info.height / scale) * EDITOR_CLIP_RECALC_RATIO, EDITOR_CLIP_MAX_LAG)
		if (Math.abs(left - editorClipAnchor.left) > limitX || Math.abs(top - editorClipAnchor.top) > limitY) {
			editorClipAnchor.left = left
			editorClipAnchor.top = top
		}
	}

	//通过右侧面板直接修改偏移/缩放（如重置位置）时不经过拖拽流程，需单独同步裁剪锚点
	watch(
		() => [svgEditLayoutStore.center_offset.x, svgEditLayoutStore.center_offset.y, configStore.svg.scale],
		() => {
			maybeRecalcEditorClip()
		}
	)

	/**
	 * 编辑器的视口裁剪配置
	 * 选中的组件与被拖拽中的组件始终渲染，避免操作过程中节点被裁掉
	 * 返回值保留组件在done_json中的真实下标，避免渲染下标与真实下标错位
	 */
	const editorViewportClip = computed(() => {
		const threshold = editorPerf.value.clipThreshold
		const list = globalStore.done_json
		const withIndex = list.map((item, index) => ({ item, index }))
		if (list.length <= threshold) {
			return withIndex
		}
		const info = svgEditLayoutStore.canvasInfo
		if (!info.with || !info.height) {
			return withIndex
		}
		//依赖裁剪锚点而非实时偏移，拖动时只在超过阈值后重算
		const scale = editorClipAnchor.scale || configStore.svg.scale || 1
		const left = editorClipAnchor.left
		const top = editorClipAnchor.top
		//几何信息通过原始对象读取，不进入computed依赖：
		//拖动组件只改x/y，若作为依赖会让整个列表每帧重算filter
		//被拖动的组件本身始终保留（见下方holding/selected判断），因此裁剪结果不会失真
		const visibleIDs = new Set(
			clipByViewport(
				toRaw(list) as any[],
				{ left, top, right: left + info.with / scale, bottom: top + info.height / scale },
				threshold,
				EDITOR_CLIP_BUFFER
			).map((item) => item.id)
		)
		const handleID = globalStore.handle_svg_info?.info?.id
		const holding =
			globalStore.intention === EGlobalStoreIntention.Move ||
			globalStore.intention === EGlobalStoreIntention.Rotate ||
			globalStore.intention === EGlobalStoreIntention.Zoom ||
			globalStore.intention === EGlobalStoreIntention.GroupMove ||
			globalStore.intention === EGlobalStoreIntention.SetConnectionLineNode
		return withIndex.filter(({ item }) => {
			//选中/移动/连线中的组件必须保留，否则操作会中断
			if (item.selected) {
				return true
			}
			if (holding && handleID === item.id) {
				return true
			}
			return visibleIDs.has(item.id)
		})
	})

	const dropEvent = (e: Record<string, any>) => {
		if (globalStore.intention == EGlobalStoreIntention.None) {
			return
		} else if (globalStore.intention == EGlobalStoreIntention.Create) {
			if (!globalStore.create_svg_info) {
				console.error(translate('要创建的数据获取失败'))
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
			e.stopPropagation()
			if (!globalStore.handle_svg_info) {
				//空白地方画线
				createLine(e)
			}
			if (globalStore.handle_svg_info) {
				if (e.button === 0) {
					//鼠标左键创建新线段
					const l = globalStore.handle_svg_info.info.props.point_position.val
					if (l.length !== 1 && select_item?.type !== EDoneJsonType.ConnectionLine) {
						//鼠标移动后的实时位置（相对于起始点，只在创建第一个点时记录了鼠标原始位置）
						l.push({
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
		e.preventDefault()
		e.stopPropagation()
		if (e.ctrlKey && e.button === 0) {
			//ctrl+鼠标左键 多选组件
			if (globalStore.handle_svg_info?.index || globalStore.handle_svg_info?.index === 0) {
				globalStore.done_json[globalStore.handle_svg_info.index].selected = true
				globalStore.setHandleSvgInfo(null)
				globalStore.intention = EGlobalStoreIntention.None
			}
			select_item.selected = !select_item.selected
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
	const onCanvasMouseMoveOrigin = (e: MouseEvent) => {
		//如果鼠标不是按下状态 连线除外
		if (
			globalStore.mouse_info.state != EMouseInfoState.Down &&
			globalStore.intention !== EGlobalStoreIntention.Connection
		) {
			return
		}
		const { clientX, clientY } = e
		const nextX = Math.round((clientX - svgEditLayoutStore.canvasInfo.left) / configStore.svg.scale)
		const nextY = Math.round((clientY - svgEditLayoutStore.canvasInfo.top) / configStore.svg.scale)
		//输入侧只记录指针位置与修饰键，具体的几何计算统一交给渲染阶段
		pendingPointer.x = nextX
		pendingPointer.y = nextY
		pendingPointer.ctrl = e.ctrlKey
		pendingPointer.shift = e.shiftKey
		pendingPointer.pending = true
		//交给rAF合并，同一帧内的多次mousemove只做一次几何计算
		onCanvasMouseMove()
	}

	/**
	 * 输入帧缓冲：输入阶段只写入指针原始信息，
	 * 渲染阶段才做坐标还原、几何计算与一次性提交，实现输入与渲染分离
	 */
	const pendingPointer = {
		x: 0,
		y: 0,
		ctrl: false,
		shift: false,
		pending: false
	}

	/**
	 * 连线候选列表缓存：mousemove中需要按id查找被绑定的连线，
	 * 每次全表find会随组件数量线性增长，缓存为Map后降为O(1)
	 */
	let lineCacheSource: IDoneJson[] | null = null
	let lineCacheLength = -1
	let lineCache: { list: IDoneJson[]; byId: Map<string, IDoneJson> } = {
		list: [],
		byId: new Map()
	}
	const getLineCache = () => {
		const list = globalStore.done_json
		if (lineCacheSource === list && lineCacheLength === list.length) {
			return lineCache
		}
		const lines: IDoneJson[] = []
		const byId = new Map<string, IDoneJson>()
		for (const item of list) {
			byId.set(item.id, item)
			if (item.type === EDoneJsonType.ConnectionLine) {
				lines.push(item)
			}
		}
		lineCacheSource = list
		lineCacheLength = list.length
		lineCache = { list: lines, byId }
		return lineCache
	}

	/**
	 * 渲染输入帧：读取帧缓冲中的最新指针，做完整计算，
	 * 然后把结果一次性提交到响应式状态，使同一次交互在一帧内只产生一轮响应式变更
	 */
	const renderInputFrame = () => {
		if (!pendingPointer.pending) {
			return
		}
		pendingPointer.pending = false
		commitPointer()
	}

	/**
	 * 在rAF之外提交帧缓冲（如mouseup时）
	 * 与rafThrottle的flush不同，这里只提交已缓存的指针数据，
	 * 不会丢弃挂起的rAF任务，渲染计算依然发生在下一帧
	 */
	const flushInputFrame = () => {
		renderInputFrame()
	}

	/**
	 * 提交阶段：把帧缓冲里的指针位置写入鼠标状态（单次赋值，避免分散写入），
	 * 随后执行一次拖拽/缩放/连线计算并提交结果
	 */
	const commitPointer = () => {
		const { x: nextX, y: nextY } = pendingPointer
		if (globalStore.mouse_info.new_position_x !== nextX || globalStore.mouse_info.new_position_y !== nextY) {
			globalStore.mouse_info.new_position_x = nextX
			globalStore.mouse_info.new_position_y = nextY
		}
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
			//todo 对齐功能开发
			const info = globalStore.handle_svg_info.info
			info.x = x
			info.y = y
			info.client = {
				x: x,
				y: y
			}
			globalStore.intention = EGlobalStoreIntention.Move
			//几何写入完成后再统一同步手柄与锚点，避免计算与提交交错
			moveHandlePoint(info)
			const { list } = getLineCache()
			moveAnchors(info, list)
			if (info.type === EDoneJsonType.ConnectionLine && info.bind_anchors?.start) {
				//移动连线自己绑定过的锚点到绑定位置
				const target = getLineCache().byId.get(info.bind_anchors.start.target_id)
				if (target) {
					moveAnchors(target, list)
				}
			}
			if (info.type === EDoneJsonType.ConnectionLine && info.bind_anchors?.end) {
				//移动连线自己绑定过的锚点到绑定位置
				const target = getLineCache().byId.get(info.bind_anchors.end.target_id)
				if (target) {
					moveAnchors(target, list)
				}
			}
		} else if (globalStore.intention === EGlobalStoreIntention.MoveCanvas) {
			//移动画布
			svgEditLayoutStore.center_offset.x = x
			svgEditLayoutStore.center_offset.y = y
			//仅在位移超过阈值时重算裁剪，避免每帧替换整个节点列表
			maybeRecalcEditorClip()
		} else if (globalStore.intention === EGlobalStoreIntention.SelectArea) {
			//框选
			area.value.b.x = globalStore.mouse_info.new_position_x - svgEditLayoutStore.center_offset.x
			area.value.b.y = globalStore.mouse_info.new_position_y - svgEditLayoutStore.center_offset.y
		} else if (globalStore.intention === EGlobalStoreIntention.GroupMove) {
			//群组移动
			groupMoved = true
			const { list } = getLineCache()
			const touched: IDoneJson[] = []
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
					//几何写入后再统一同步锚点
					moveAnchors(e, list)
					touched.push(e)
				}
			}
			//连线自身的绑定锚点在所有组件移动完成后统一刷新，避免重复遍历
			for (const e of touched) {
				if (e.type === EDoneJsonType.ConnectionLine && e.bind_anchors?.end) {
					const target = getLineCache().byId.get(e.bind_anchors.end.target_id)
					if (target) {
						moveAnchors(target, list)
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
					? myFixed(new_length.width / globalStore.handle_svg_info.info.actual_bound.width, 3)
					: 1
				const scale_y = !new_length.is_old_height
					? myFixed(new_length.height / globalStore.handle_svg_info.info.actual_bound.height, 3)
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
			globalStore.handle_svg_info.info.rotate = myFixed(
				globalStore.rotate_info.angle + rotateDegreeAfter - rotateDegreeBefore,
				2
			)
		} else if (globalStore.intention === EGlobalStoreIntention.Connection && globalStore.handle_svg_info) {
			//鼠标移动的实时位置（相对于连线起始点，只在创建第一个点时记录了鼠标原始位置）
			const l = globalStore.handle_svg_info?.info.props.point_position.val.length
			const _x =
				globalStore.mouse_info.new_position_x - globalStore.mouse_info.position_x - svgEditLayoutStore.center_offset.x
			const _y =
				globalStore.mouse_info.new_position_y - globalStore.mouse_info.position_y - svgEditLayoutStore.center_offset.y
			const brotherPoint = globalStore.handle_svg_info.info.props.point_position.val[l - 2]
			const pr = globalStore.handle_svg_info?.info.props.point_r?.val + 2 || 4
			let ox = brotherPoint.x < _x ? -pr : brotherPoint.x > _x ? pr : 0
			let oy = brotherPoint.y < _y ? -pr : brotherPoint.y > _y ? pr : 0
			if (pendingPointer.ctrl) {
				//画竖线
				globalStore.handle_svg_info.info.props.point_position.val[l - 1] = {
					x: brotherPoint.x,
					y: _y + oy
				}
			} else if (pendingPointer.shift) {
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
			if (
				!lineNodeMoved &&
				(globalStore.connection_line_node_info.point_index ===
					globalStore.handle_svg_info.info.props.point_position.val.length - 1 ||
					globalStore.connection_line_node_info.point_index === 0)
			) {
				lineNodeMoved = true
			}
			const l = globalStore.handle_svg_info?.info.props.point_position.val.length
			const _x = getSvgNowPosition(
				globalStore.mouse_info.position_x,
				globalStore.mouse_info.new_position_x,
				globalStore.connection_line_node_info.init_pos.x
			)
			const _y = getSvgNowPosition(
				globalStore.mouse_info.position_y,
				globalStore.mouse_info.new_position_y,
				globalStore.connection_line_node_info.init_pos.y
			)
			const brotherPoint = globalStore.handle_svg_info.info.props.point_position.val[l - 2]
			const pr = globalStore.handle_svg_info?.info.props.point_r?.val + 2 || 4
			let ox = brotherPoint.x < _x ? -pr : brotherPoint.x > _x ? pr : 0
			let oy = brotherPoint.y < _y ? -pr : brotherPoint.y > _y ? pr : 0
			globalStore.handle_svg_info.info.props.point_position.val[globalStore.connection_line_node_info.point_index] = {
				x: _x + ox,
				y: _y + oy
			}
		}
	}

	//用requestAnimationFrame合并高频mousemove，每帧最多处理一次拖拽计算
	const onCanvasMouseMove = rafThrottle(renderInputFrame, editorPerf.value.fpsLimit)

	const onCanvasMouseUp = () => {
		//先提交帧缓冲中尚未渲染的指针位置，确保松开鼠标时使用最新坐标
		flushInputFrame()
		//低性能模式：拖拽/缩放结束，解冻视觉，一次性跳到最终位置（仅触发一次UpdateLayoutTree）
		unfreezeEditorVisual()
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
				//群组移动了,从新计算移动过的组件各种坐标信息
				for (let e of globalStore.done_json) {
					if (e.selected) {
						setSvgActualInfo(e)
					}
				}
				groupMoved = false
				globalStore.intention = EGlobalStoreIntention.None
				//记录历史记录
				globalStore.setDoneJson(globalStore.done_json)
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
		} else if (globalStore.intention === EGlobalStoreIntention.SetConnectionLineNode) {
			//解绑锚点
			if (lineNodeMoved && globalStore.handle_svg_info?.info.bind_anchors) {
				if (globalStore.connection_line_node_info.point_index === 0) {
					globalStore.handle_svg_info.info.bind_anchors.start = null
				} else {
					globalStore.handle_svg_info.info.bind_anchors.end = null
				}
			}
			globalStore.intention = EGlobalStoreIntention.None
			lineNodeMoved = false
		} else if (globalStore.intention === EGlobalStoreIntention.SelectArea) {
			//框选
			globalStore.setHandleSvgInfo(null)
			for (let e of globalStore.done_json) {
				const t = selectRect.value
				e.selected =
					e.center_position.x > t.x &&
					e.center_position.x < t.x + t.with &&
					e.center_position.y > t.y &&
					e.center_position.y < t.y + t.height
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
			//低性能模式：开始拖拽画布时冻结视觉，拖拽期间SVG不重布局
			freezeEditorVisual()
		}
	}

	//用requestAnimationFrame合并高频滚轮缩放，每帧最多处理一次
	const onMousewheel = rafThrottle((e: any) => {
		if (e?.wheelDelta) {
			if (e.wheelDelta > 0) {
				configStore.svg.scale = myFixed(configStore.svg.scale + 0.1, 1)
				getZoomPosition(e, configStore.svg.scale, svgEditLayoutStore.center_offset, true)
			} else if (configStore.svg.scale > 0.1) {
				configStore.svg.scale = myFixed(configStore.svg.scale - 0.1, 1)
				getZoomPosition(e, configStore.svg.scale, svgEditLayoutStore.center_offset, false)
			}
			//低性能模式：缩放开始时冻结视觉，停止滚动后一次性跳到最终位置
			if (isEditorLowPerf.value) {
				freezeEditorVisual()
				if (editorZoomUnfreezeTimer) clearTimeout(editorZoomUnfreezeTimer)
				editorZoomUnfreezeTimer = setTimeout(unfreezeEditorVisual, editorZoomUnfreezeDelay)
			}
			//缩放后视口范围变化，需同步裁剪锚点
			maybeRecalcEditorClip()
		}
	}, editorPerf.value.fpsLimit)

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
			x: myFixed(actual_bound.x - (actual_bound.width / 2) * scale_x + actual_bound.width / 2, 1),
			y: myFixed(actual_bound.y - (actual_bound.height / 2) * scale_y + actual_bound.height / 2, 1),
			width: myFixed(actual_bound.width * scale_x, 1),
			height: myFixed(actual_bound.height * scale_y, 1)
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
			e.preventDefault()
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

	const onHandleKeyUp = (e: KeyboardEvent) => {
		const t = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
		if (!e.ctrlKey && t.indexOf(e.key) > -1) {
			//群组移动了,从新计算移动过的组件各种坐标信息
			for (let e of globalStore.done_json) {
				if (e.selected) {
					setSvgActualInfo(e)
				}
			}
		}
	}

	const resizeBox = () => {
		setSvgActualInfo(globalStore.done_json[globalStore.handle_svg_info!.index], true)
	}

	const updateCanvasInfo = () => {
		const d = canvasRef.value?.getBoundingClientRect()
		if (!d) return
		svgEditLayoutStore.canvasInfo = {
			height: d.height,
			with: d.width,
			top: d.top,
			left: d.left
		}
	}

	let canvasResizeObserver: ResizeObserver | null = null

	onMounted(() => {
		canvasRef.value?.focus()
		nextTick(() => {
			updateCanvasInfo()
			//画布尺寸就绪后再初始化裁剪锚点
			syncEditorClipAnchor()
		})
		//使用ResizeObserver监听canvas几何变更（工具栏收展、窗口大小变化等）。
		//比起watch+nextTick+RAF的时序方案，ResizeObserver是浏览器内部事件驱动，
		//只在layout重算后才触发回调，getBoundingClientRect一定能拿到最新值。
		//canvas的width跟随父容器(center-panel) flex伸缩，工具栏收展时必定触发。
		const el = canvasRef.value
		if (el && typeof ResizeObserver !== 'undefined') {
			canvasResizeObserver = new ResizeObserver(() => {
				updateCanvasInfo()
			})
			canvasResizeObserver.observe(el)
		}
	})

	onBeforeUnmount(() => {
		//清理可能挂起的requestAnimationFrame任务
		onCanvasMouseMove.cancel()
		onMousewheel.cancel()
		//清空输入帧缓冲与连线缓存，避免卸载后残留引用
		pendingPointer.pending = false
		lineCacheSource = null
		lineCacheLength = -1
		lineCache = { list: [], byId: new Map() }
		//清理缩放解冻定时器
		if (editorZoomUnfreezeTimer) {
			clearTimeout(editorZoomUnfreezeTimer)
			editorZoomUnfreezeTimer = null
		}
		//解冻视觉，避免卸载后残留冻结状态
		unfreezeEditorVisual()
		//清理ResizeObserver
		if (canvasResizeObserver) {
			canvasResizeObserver.disconnect()
			canvasResizeObserver = null
		}
	})

	const exportSvg = (filename?: string) => {
		if (!svgRef.value) {
			return false
		}
		exportCanvasSvg(svgRef.value, {
			filename,
			background: configStore.svg.background_color
		})
		return true
	}

	defineExpose({ onCanvasMouseUp, exportSvg })
</script>

<template>
	<div
		ref="canvasRef"
		class="canvas"
		:style="{ backgroundColor: configStore.svg.background_color, position: 'relative' }"
		tabindex="0"
		@drop="dropEvent"
		@dragenter="dragEnterEvent"
		@dragover="dragOverEvent"
		@mousedown="onCanvasMouseDown"
		@mousemove="onCanvasMouseMoveOrigin"
		@mouseup="onCanvasMouseUp"
		@contextmenu="onCanvasContextMenuEvent"
		@keydown="onHandleKeyDown"
		@keyup="onHandleKeyUp"
		@mousewheel="onMousewheel"
	>
		<slot name="background" />
		<div class="coverLayer">
			<svg ref="svgRef" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
				<defs>
					<pattern
						id="pattern_grid"
						data-editor-only
						patternUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="20"
						height="20"
					>
						<line x1="0" y1="0" x2="0" y2="20" :stroke="configStore.svg.grid_color" />
						<line x1="10" y1="0" x2="10" y2="20" :stroke="configStore.svg.grid_color" />
						<line x1="0" y1="0" x2="20" y2="0" :stroke="configStore.svg.grid_color" />
						<line x1="0" y1="10" x2="20" y2="10" :stroke="configStore.svg.grid_color" />
					</pattern>
				</defs>
				<rect v-if="configStore.svg.grid" data-editor-only width="100%" height="100%" fill="url(#pattern_grid)" />
				<g
					data-canvas-content
					:transform="`translate(${editorVisualCenterX * editorVisualScale},${
						editorVisualCenterY * editorVisualScale
					})rotate(${0})scale(${editorVisualScale})`"
				>
					<g
						v-for="{ item, index } in editorViewportClip"
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
									v-bind="prosToVBind(item, ['height', 'width'])"
									:width="item.props?.width?.val ?? 100"
									:height="item.props?.height?.val ?? 100"
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
									:is="resolveCanvasComp(item.tag, props.vueComp)"
									v-bind="prosToVBind(item, ['height', 'width'])"
									:width="item.props?.width?.val ?? 100"
									:height="item.props?.height?.val ?? 100"
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
									class="foreignObject"
								>
									<component
										:is="resolveCanvasComp(item.tag, props.vueComp)"
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
									data-editor-only
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
										globalStore.handle_svg_info?.info.id === item.id &&
										visible_info.handle_panel &&
										item.type !== EDoneJsonType.ConnectionLine
									"
									data-editor-only
									:item-info="item"
								/>
								<connection-panel
									@contextmenu="onCanvasContextMenuEvent"
									data-editor-only
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
						data-editor-only
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
	</div>
	<!-- 右键菜单 -->
	<ul ref="contextMenuRef" class="contextMenu" v-show="contextMenuStore.display">
		<li
			v-for="(item, key) in contextMenuStore.info"
			:key="item.title"
			@click="contextMenuStore.onContextMenuClick(key)"
		>
			<p :class="item.enable ? '' : 'disabled'">
				{{ translate(item.title) }}
				<span class="shortcut">{{ item.hot_key }}</span>
			</p>
		</li>
	</ul>
</template>

<style lang="less" scoped>
	@import '@/assets/variables';

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
		outline: 1px solid rgb(222, 69, 23);
	}

	.contextMenu {
		position: fixed;
		z-index: 99999;
		background: rgba(255, 255, 255, 0.75);
		padding: 5px 0;
		margin: 0;
		display: block;
		border-radius: 3px;
		box-shadow: 1px 2px 5px rgba(0, 0, 0, 0.3);

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
			padding: 0 15px 1px 15px;
			margin: 0;
			user-select: none;
			-webkit-user-select: none;
			font-size: 14px;
			color: #09053d;
		}

		p:hover {
			background-color: @listActiveColor;
			color: #ffffff;
			cursor: pointer;
		}

		.disabled {
			color: #999;
		}

		.disabled:hover {
			color: #999;
			background-color: transparent;
			cursor: not-allowed;
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