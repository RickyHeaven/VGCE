<script setup lang="ts">
	import { toRaw } from 'vue'
	import { pinia } from '@/hooks'
	import VgceIcon from '@/components/vgce-icon.vue'
	import { resolveCanvasComp, stopWheelZoomTags } from '@/config'
	import { configLocaleKey } from '@/config/i18n'
	import { Aim } from '@element-plus/icons-vue'
	import { useGlobalStore } from '@/stores/global'
	import { EGlobalStoreIntention, EMouseInfoState } from '@/stores/global/types'
	import type { IDoneJson } from '@/stores/global/types'
	import {
		componentsRegister,
		getCommonClass,
		getZoomPosition,
		myFixed,
		preventDefault,
		prosToVBind,
		setArrItemByID,
		setEditorLoadTime,
		stopEvent,
		valFormat
	} from '@/utils'

	import { EDoneJsonType, EEventAction, EEventType } from '@/config/types'
	import ConnectionLine from '@/components/svg-editor/connection-line.vue'
	import {
		clipByViewport,
		EPreviewPerfLevel,
		perfClass,
		rafThrottle,
		resolvePerfOptions,
		type IPreviewPerfOptions
	} from '@/utils/perf'

	import type { IDataModel } from '@/components/svg-editor/types'
	import 'element-plus/dist/index.css'
	import 'animate.css'

	import Link from '@/utils/mqtt-net'
	import { setLocale, translate, useVgceLocale } from '@/i18n'
	import type { VgceLocale } from '@/i18n'

	setEditorLoadTime()

	const emit = defineEmits(['onMessage', 'onEvent'])
	const props = withDefaults(
		defineProps<{
			vueComp?: Record<string, any>
			data?: IDataModel
			canvasDrag?: boolean
			canvasZoom?: boolean
			showCanvasInfo?: boolean
			previewPerf?: IPreviewPerfOptions
			forceLevel?: EPreviewPerfLevel
			locale?: VgceLocale
		}>(),
		{
			canvasDrag: true,
			canvasZoom: true,
			showCanvasInfo: true
		}
	)

	watchEffect(() => {
		if (props.locale) {
			setLocale(props.locale)
		}
	})

	const perf = computed(() => {
		const base = resolvePerfOptions(props.previewPerf)
		return props.forceLevel && props.forceLevel !== base.level
			? { ...resolvePerfOptions({ ...props.previewPerf, level: props.forceLevel }), level: props.forceLevel }
			: base
	})
	provide('previewPerf', perf)
	// 调试：输出预览器性能分级结果
	watchEffect(() => {
		console.log(
			'[VGCE] SvgViewer perf:',
			`auto=${perf.value.level}`,
			props.forceLevel ? `force=${props.forceLevel}` : '',
			perf.value
		)
	})
	provide(configLocaleKey, useVgceLocale())

	let link: any = Link()
	const globalStore = useGlobalStore(pinia)
	componentsRegister(props.vueComp)
	const preview_data = reactive(
		props.data ?? {
			layout_center: {
				x: 0,
				y: 0
			},
			config: {
				svg: {
					background_color: '#fff',
					scale: 1,
					grid_color: '#ebebeb'
				},
				net: {
					mqtt: {
						useGlobalMqtt: false,
						url: '',
						user: '',
						pwd: '',
						topics: '',
						global: {
							url: '',
							user: '',
							pwd: '',
							topics: ''
						}
					}
				}
			},
			done_json: []
		}
	)

	const cursor_style = computed(() => (globalStore.intention == EGlobalStoreIntention.MoveCanvas ? 'grab' : 'default'))

	/**
	 * 画布整体的平移+缩放transform
	 * 画布拖拽/缩放只改变这一个transform属性，不涉及任何元素的width/height/top/left，
	 * 因此不会触发重排，仅产生合成层位移
	 */
	const viewportTransform = computed(() => {
		const scale = preview_data.config.svg.scale
		const x = preview_data.layout_center.x * scale
		const y = preview_data.layout_center.y * scale
		return `translate(${x},${y}) scale(${scale})`
	})

	/**
	 * 低性能模式：拖拽/缩放过程中冻结视觉transform，交互结束时一次性跳到最终位置。
	 * 这样在整个拖拽/缩放期间SVG不产生任何UpdateLayoutTree事件，
	 * 仅在最开始（冻结快照）和最后（跳到终点）各触发一次。
	 */
	const isLowPerf = computed(() => perf.value.level === 'low')
	const isMovementFrozen = ref(false)
	const frozenTransform = ref('')
	const ZOOM_UNFREEZE_DELAY = 200 // 滚轮停止200ms后解冻
	let zoomUnfreezeTimer: ReturnType<typeof setTimeout> | null = null
	const visualTransform = computed(() => {
		if (isMovementFrozen.value) {
			return frozenTransform.value
		}
		return viewportTransform.value
	})

	const freezeVisual = () => {
		if (!isLowPerf.value || isMovementFrozen.value) return
		frozenTransform.value = viewportTransform.value
		isMovementFrozen.value = true
	}

	const unfreezeVisual = () => {
		if (zoomUnfreezeTimer) {
			clearTimeout(zoomUnfreezeTimer)
			zoomUnfreezeTimer = null
		}
		isMovementFrozen.value = false
	}

	/**
	 * 裁剪重算的触发锚点（世界坐标下的视口左上角）
	 * 画布平移/缩放不会立即重算裁剪结果，只有锚点位移超过阈值时才更新，
	 * 从而避免拖动画布时每帧都对全部节点做filter并替换整个v-for列表
	 */
	const clipAnchor = reactive({ left: 0, top: 0, scale: 1 })
	const CLIP_RECALC_RATIO = 0.5
	//裁剪缓冲区（世界坐标），与 clipByViewport 的 buffer 保持一致
	const CLIP_BUFFER = 300
	//重算滞后必须小于缓冲区，否则平移时可视区会超出已裁剪范围，出现组件缺失的空白带
	const CLIP_MAX_LAG = CLIP_BUFFER / 2

	/**
	 * 节流后的画布位置显示值
	 * canvasInfoTxt 文本更新每帧触发 UpdateLayoutTree + Paint，
	 * 拖拽时按间隔更新显示即可，避免文本更新成为新的性能瓶颈
	 */
	const displayPos = reactive({ x: 0, y: 0, scale: 1 })
	let displayPosTimer = 0 as unknown as ReturnType<typeof setTimeout>
	const DISPLAY_POS_INTERVAL = 300
	const flushDisplayPos = () => {
		displayPos.x = preview_data.layout_center.x
		displayPos.y = preview_data.layout_center.y
		displayPos.scale = preview_data.config.svg.scale
	}
	flushDisplayPos()
	watch(
		() => [preview_data.layout_center.x, preview_data.layout_center.y, preview_data.config.svg.scale],
		() => {
			clearTimeout(displayPosTimer)
			displayPosTimer = setTimeout(flushDisplayPos, DISPLAY_POS_INTERVAL)
		}
	)

	/**
	 * 当前视口在世界坐标下的范围左上角
	 * 画布变换为 translate(layout_center * scale) scale(scale)，即 屏幕坐标 = (世界坐标 + layout_center) * scale
	 * layout_center 本身就是世界坐标单位（与编辑器 center_offset 同一语义），因此左上角世界坐标就是 -layout_center，
	 * 不能再除以 scale，否则放大后裁剪范围会偏离真实视口，导致本该显示的组件被裁掉
	 */
	const currentView = () => {
		const scale = preview_data.config.svg.scale || 1
		return {
			scale,
			left: -preview_data.layout_center.x,
			top: -preview_data.layout_center.y
		}
	}

	const syncClipAnchor = () => {
		const v = currentView()
		clipAnchor.left = v.left
		clipAnchor.top = v.top
		clipAnchor.scale = v.scale
	}

	const maybeRecalcClip = () => {
		const p = perf.value
		if (!p.nodeVirtual) {
			return
		}
		const v = currentView()
		//缩放变化必须重算，否则裁剪范围与视觉不符
		if (v.scale !== clipAnchor.scale) {
			clipAnchor.left = v.left
			clipAnchor.top = v.top
			clipAnchor.scale = v.scale
			return
		}
		const limitX = Math.min((viewport.width / v.scale) * CLIP_RECALC_RATIO, CLIP_MAX_LAG)
		const limitY = Math.min((viewport.height / v.scale) * CLIP_RECALC_RATIO, CLIP_MAX_LAG)
		if (Math.abs(v.left - clipAnchor.left) > limitX || Math.abs(v.top - clipAnchor.top) > limitY) {
			clipAnchor.left = v.left
			clipAnchor.top = v.top
		}
	}

	//外部直接修改缩放或画布位置（如通过接口修改数据模型）时，同步裁剪锚点
	watch(
		() => [preview_data.layout_center.x, preview_data.layout_center.y, preview_data.config.svg.scale],
		() => {
			maybeRecalcClip()
		}
	)

	//输入帧缓冲：输入阶段只记录指针坐标，渲染阶段统一做计算与提交
	const pendingPointer = { x: 0, y: 0, pending: false }

	const renderInputFrame = () => {
		if (!pendingPointer.pending) {
			return
		}
		pendingPointer.pending = false
		commitPointer()
	}

	const commitPointer = () => {
		//如果鼠标不是按下状态 连线除外
		if (
			globalStore.mouse_info.state != EMouseInfoState.Down &&
			globalStore.intention !== EGlobalStoreIntention.Connection
		) {
			return
		}
		if (!props.canvasDrag) {
			return
		}
		globalStore.mouse_info.new_position_x = pendingPointer.x
		globalStore.mouse_info.new_position_y = pendingPointer.y
		const x = Math.round(
			globalStore.mouse_info.new_position_x - globalStore.mouse_info.position_x + globalStore.mouse_info.now_position_x
		)
		const y = Math.round(
			globalStore.mouse_info.new_position_y - globalStore.mouse_info.position_y + globalStore.mouse_info.now_position_y
		)
		if (globalStore.intention == EGlobalStoreIntention.MoveCanvas) {
			//移动画布
			preview_data.layout_center.x = x
			preview_data.layout_center.y = y
			//仅在位移超过阈值时重算裁剪，避免每帧替换整个节点列表
			maybeRecalcClip()
		}
	}

	const onCanvasMouseMoveOrigin = (e: MouseEvent) => {
		//拖拽过程中若在浏览器窗口外松开鼠标，浏览器不会派发mouseup，
		//此处用buttons判断按键是否已释放，主动结束拖拽，避免画布继续跟随光标
		if (globalStore.mouse_info.state === EMouseInfoState.Down && e.buttons === 0) {
			onCanvasMouseUp()
			return
		}
		//输入侧只记录指针坐标，不写响应式状态，也不做几何计算
		pendingPointer.x = Math.round(e.clientX / preview_data.config.svg.scale)
		pendingPointer.y = Math.round(e.clientY / preview_data.config.svg.scale)
		pendingPointer.pending = true
		//交给rAF合并，同一帧内的多次mousemove只提交一次
		onCanvasMouseMove()
	}

	const onCanvasMouseMove = rafThrottle(renderInputFrame, perf.value.fpsLimit)

	/**
	 * 在rAF之外提交帧缓冲（如mouseup时）
	 * 只提交已缓存的指针数据，不丢弃挂起的rAF任务
	 */
	const flushInputFrame = () => {
		renderInputFrame()
	}

	const onCanvasMouseUp = () => {
		//先提交帧缓冲中尚未渲染的指针位置，确保松开鼠标时使用最新坐标
		flushInputFrame()
		//无论是否处于拖拽状态都移除window上的兜底监听，避免残留
		detachDragListeners()
		//低性能模式：拖拽结束，解冻视觉，一次性跳到最终位置（仅触发一次UpdateLayoutTree）
		unfreezeVisual()
		//拖拽结束后立即刷新显示坐标
		clearTimeout(displayPosTimer)
		flushDisplayPos()
		//如果鼠标不是按下状态
		if (globalStore.mouse_info.state != EMouseInfoState.Down) {
			return
		}
		if (globalStore.intention != EGlobalStoreIntention.Select) {
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
	}
	const onCanvasMouseDown = (e: MouseEvent) => {
		const { clientX, clientY } = e
		//点击画布 未选中组件 拖动画布
		globalStore.intention = EGlobalStoreIntention.MoveCanvas
		globalStore.mouse_info = {
			state: EMouseInfoState.Down,
			position_x: Math.round(clientX / preview_data.config.svg.scale),
			position_y: Math.round(clientY / preview_data.config.svg.scale),
			now_position_x: preview_data.layout_center.x,
			now_position_y: preview_data.layout_center.y,
			new_position_x: 0,
			new_position_y: 0
		}
		//低性能模式：拖拽开始时冻结视觉，后续mousemove中的layout_center变更不触发SVG重布局
		freezeVisual()
		//开始拖拽，在window上补充监听
		attachDragListeners()
	}

	/**
	 * 拖拽期间在window捕获阶段监听鼠标事件
	 * 组件节点上绑定了stopPropagation（用于阻止点击组件时拖动画布），
	 * 指针移到组件上方后mouseup无法冒泡到画布，会导致拖拽状态一直保持（画布粘住光标）。
	 * 捕获阶段在window上监听会先于组件上的处理函数执行，且不受stopPropagation影响。
	 */
	let dragListenerAttached = false

	const onWindowMouseMove = (e: MouseEvent) => {
		onCanvasMouseMoveOrigin(e)
	}

	const onWindowMouseUp = () => {
		onCanvasMouseUp()
	}

	const onWindowBlur = () => {
		//拖拽中窗口失焦（如切换到其他程序）时浏览器不再派发mouseup，需主动结束拖拽
		onCanvasMouseUp()
	}

	const attachDragListeners = () => {
		if (dragListenerAttached) {
			return
		}
		dragListenerAttached = true
		window.addEventListener('mousemove', onWindowMouseMove, true)
		window.addEventListener('mouseup', onWindowMouseUp, true)
		window.addEventListener('blur', onWindowBlur)
	}

	const detachDragListeners = () => {
		if (!dragListenerAttached) {
			return
		}
		dragListenerAttached = false
		window.removeEventListener('mousemove', onWindowMouseMove, true)
		window.removeEventListener('mouseup', onWindowMouseUp, true)
		window.removeEventListener('blur', onWindowBlur)
	}

	/**
	 * 滚轮是否落在声明了 stop_wheel_zoom 的组件内部
	 * 组件节点上以 data-no-zoom 标记，从事件源向上查找即可，
	 * 这样组件内部有滚动条（overflow: scroll）时滚轮只滚动组件内容，不缩放画布
	 */
	const isWheelInsideNoZoomComp = (target: EventTarget | null) => {
		const el = target as Element | null
		return Boolean(el?.closest?.('[data-no-zoom]'))
	}

	const onMousewheel = rafThrottle((e: any) => {
		if (!props.canvasZoom) {
			return
		}
		if (isWheelInsideNoZoomComp(e?.target)) {
			return
		}
		if (e?.wheelDelta) {
			if (e.wheelDelta > 0) {
				preview_data.config.svg.scale = myFixed(preview_data.config.svg.scale + 0.1, 1)
				getZoomPosition(e, preview_data.config.svg.scale, preview_data.layout_center, true)
			} else if (preview_data.config.svg.scale > 0.1) {
				preview_data.config.svg.scale = myFixed(preview_data.config.svg.scale - 0.1, 1)
				getZoomPosition(e, preview_data.config.svg.scale, preview_data.layout_center, false)
			}
			//低性能模式：缩放开始时冻结视觉，停止滚动后一次性跳到最终位置
			if (isLowPerf.value) {
				freezeVisual()
				if (zoomUnfreezeTimer) clearTimeout(zoomUnfreezeTimer)
				zoomUnfreezeTimer = setTimeout(unfreezeVisual, ZOOM_UNFREEZE_DELAY)
			}
			//缩放后视口范围变化，需同步裁剪锚点
			maybeRecalcClip()
		}
	}, perf.value.fpsLimit)

	/**
	 * 获取foreignObject的几何属性
	 * 注意：这里只返回原始尺寸，不乘缩放倍数。缩放统一由外层transform完成，
	 * 从而使width/height在预览生命周期内保持恒定，缩放过程中不触发重排
	 */
	const getForeignObjectBound = (actual_bound: {
		x: number
		y: number
		width: number
		height: number
	}) => {
		return {
			x: actual_bound.x,
			y: actual_bound.y,
			width: actual_bound.width,
			height: actual_bound.height
		}
	}

	/**
	 * 生成组件的"旋转+缩放"transform字符串
	 * 关键点：旋转与缩放合并到同一个transform上，且以组件包围盒中心为原点，
	 * 这样组件几何（x/y/width/height）完全不需要变化，缩放过程零重排
	 */
	const transformCache = new WeakMap<IDoneJson, { signature: string; value: string }>()
	const getRotateAndScaleTransform = (item: IDoneJson) => {
		const b = item.actual_bound
		const rotate = item.rotate || 0
		const scaleX = item.scale_x ?? 1
		const scaleY = item.scale_y ?? 1
		const signature = `${b.x}|${b.y}|${b.width}|${b.height}|${rotate}|${scaleX}|${scaleY}`
		const cached = transformCache.get(item)
		if (cached && cached.signature === signature) {
			return cached.value
		}
		const cx = b.x + b.width / 2
		const cy = b.y + b.height / 2
		const value = `translate(${cx},${cy}) rotate(${rotate}) scale(${scaleX},${scaleY}) translate(${-cx},${-cy})`
		transformCache.set(item, { signature, value })
		return value
	}

	const styleCache = new WeakMap<IDoneJson, any>()
	const getStyle = (root: IDoneJson) => {
		const cached = styleCache.get(root)
		if (cached) {
			return cached
		}
		let t = false
		if (root.events?.length > 0) {
			for (let e of root.events) {
				if (e.type === EEventType.Click) {
					t = true
					break
				}
			}
		}
		const style = { cursor: t ? 'pointer' : 'default' }
		styleCache.set(root, style)
		return style
	}

	/**
	 * 该组件是否阻止画布滚轮缩放
	 * 优先取数据模型里的配置，旧数据模型没有该字段时按组件内置配置兜底
	 */
	const isStopWheelZoomItem = (item: IDoneJson) => {
		const flag = item.config?.stop_wheel_zoom
		if (typeof flag === 'boolean') {
			return flag
		}
		return stopWheelZoomTags.has(item.tag)
	}

	const canvasRef = ref<HTMLElement>()
	const viewport = reactive({ width: 0, height: 0 })

	const updateViewport = () => {
		const el = canvasRef.value
		if (!el) {
			return
		}
		viewport.width = el.clientWidth
		viewport.height = el.clientHeight
	}

	const onViewportResize = () => {
		updateViewport()
	}

	//保存节流实例引用，便于组件卸载时取消挂起的requestAnimationFrame任务
	//视口尺寸变化本身频率很低，无需限频，每帧一次即可，避免裁剪范围滞后
	const throttledViewportResize = rafThrottle(onViewportResize, 0)

	let resizeObserver: ResizeObserver | null = null

	/**
	 * 收集所有组件的可见性签名
	 * 只有display变化时才需要重新裁剪，避免WS改组件属性（如文字、数值）时触发全量重算
	 */
	const displaySignature = computed(() => {
		let s = ''
		for (const item of preview_data.done_json) {
			s += item.display ? '1' : '0'
		}
		return s
	})

	/**
	 * 视口虚拟渲染：组件数量超过阈值时，只渲染可视区域（含缓冲区）内的组件
	 * 依赖 clipAnchor 而非 layout_center，画布平移在阈值内不会触发重算
	 */
	const visibleJson = computed(() => {
		const list = preview_data.done_json
		const p = perf.value
		//订阅display签名，保证可见性变化时重算
		void displaySignature.value
		if (!p.nodeVirtual || list.length <= p.nodeVirtualThreshold || !viewport.width || !viewport.height) {
			return list
		}
		const scale = clipAnchor.scale || 1
		const left = clipAnchor.left
		const top = clipAnchor.top
		const view = {
			left,
			top,
			right: left + viewport.width / scale,
			bottom: top + viewport.height / scale
		}
		//几何信息通过原始对象读取，不进入computed依赖，
		//这样WS只改组件属性时不会触发整个列表重算
		const rawList = toRaw(list) as any[]
		const shownIDs = new Set(
			clipByViewport(
				rawList.filter((item) => item.display),
				view,
				p.nodeVirtualThreshold,
				CLIP_BUFFER
			).map((item) => item.id)
		)
		//必须返回响应式代理对象，否则通过MQTT/事件修改组件属性后视图不会更新
		return list.filter((item) => item.display && shownIDs.has(item.id))
	})

	const renderJson = visibleJson
	const eventHandle = (root: IDoneJson, type: EEventType) => {
		if (root.events?.length > 0) {
			for (let e of root.events) {
				if (e.type === type) {
					if (e.condition && e.condition.type !== 'None') {
						if (e.condition.type === 'Relation' && e.condition.Relation && e.condition.Relation.relation) {
							const k = e.condition.Relation.key
							const r = e.condition.Relation.relation
							const v = valFormat(e.condition.Relation.val)
							const v2 = valFormat(e.condition.Relation.val2)

							if (root.props.hasOwnProperty(k)) {
								const p = root.props[k].val
								if (!relationEval(p, r, v, v2)) {
									continue
								}
							}
						}
					}
					if (e.action === EEventAction.ChangeAttr) {
						if (e.attrs && e.attrs.length > 0) {
							let t
							if (e.target) {
								for (let item of preview_data.done_json) {
									if (item.id === e.target) {
										t = item
										break
									}
								}
							} else {
								t = root
							}

							if (!t) {
								continue
							}

							for (let a of e.attrs) {
								if (a.key === 'state') {
									t.defaultState = valFormat(a.val)
								} else if (a.key === 'display') {
									t.display = valFormat(a.val)
								} else if (t.props.hasOwnProperty(a.key)) {
									t.props[a.key].val = valFormat(a.val)
								}
							}
						}
					} else if (e.action === EEventAction.JavaScript) {
						const t = new Function(e.scripts)
						t()
					} else if (e.action === EEventAction.Emit) {
						const _k: Array<keyof IDoneJson> = [
							'id',
							'name',
							'common_animations',
							'display',
							'props',
							'title',
							'type',
							'x',
							'y'
						]
						const _r: Record<string, any> = {}
						_k.forEach((x) => {
							if (root?.hasOwnProperty?.(x)) {
								_r[x] = root[x]
							}
						})
						emit('onEvent', {
							event: e,
							target: _r
						})
					}
				}
			}
		}
	}
	const relationEval = (a: any, r: string, b: any, c: any) => {
		switch (r) {
			case '>':
				return a > b
			case '>=':
				return a >= b
			case '<':
				return a < b
			case '<=':
				return a <= b
			case '==':
				return a == b
			case '!=':
				return a != b
			case '>=,=<':
				return a >= b && a <= c
			case '<,>':
				return a < b || a > c
		}
	}

	const resetCanvas = () => {
		unfreezeVisual()
		preview_data.layout_center = {
			x: 0,
			y: 0
		}
		//重置位置是跳变，不经过拖拽流程，需立即同步裁剪锚点，避免大场景下出现空白
		syncClipAnchor()
		//立即刷新位置显示
		clearTimeout(displayPosTimer)
		flushDisplayPos()
	}

	const connectNet = () => {
		let m
		if (preview_data.config.net.mqtt.useGlobalMqtt) {
			m = preview_data.config.net.mqtt.global
		} else {
			m = preview_data.config.net.mqtt
		}
		if (m && m.url && m.user && m.pwd && m.topics) {
			link.sub(m.url, m.user, m.pwd, m.topics, (topics: string, message: string) => {
				// console.log(topics)
				// console.log(message.toString())
				//暴露给外部，让用户自己处理消息，message可以用JSON.parse解析成对象（后端推给前端的MQTT消息内容需要是JSON格式）
				//用户拿到消息后可以配合setNodeAttrByID方法更新界面
				//setNodeAttrByID的参数id可以在传给本组件的props.data（用户传进来的，自然知道值是多少）里done_json找到
				/*如何找到指定组件的两种方案：
				 1.用你的项目里前后端约定的svg组件唯一标识符替换掉编辑器生成的id（必须保证唯一），然后调用setNodeAttrByID改变组件属性。
				 2.如果不想改动id（避免因不能保证手动改过的id唯一性导致编辑器功能异常），可以在config里给想要改变的组件的配置文件的props里增加一个字段，
				 如deviceCode(svg-text的配置文件里有被注释的例子)，然后在编辑组态时，给对应组件填上对应的deviceCode（这样deviceCode就和组件id实现
				 了映射关系），并保存，后台给前台推MQTT消息时带上指定的deviceCode，前台预览时，在收到MQTT消息后，凭借消息里的deviceCode在done_json
				 找到组件的id（可以用vue的computed计算一份deviceCode和id的映射关系存到一个对象里，这样在需要id时可直接在计算出的对象凭借deviceCode
				 直接取到），即可用setNodeAttrByID改变组件属性*/
				emit('onMessage', {
					topics,
					message
				})
			})
		}
	}

	/**
	 * 根据组件id设置相应属性
	 * @param id done_json里元素的id
	 * @param attr 属性，如svg-text的文字内容是：props.text.val
	 * @param val 需要设置的值
	 * @example setNodeAttrByID('Q5cZBSDXTP','props.text.val','新的文字内容')
	 */
	const setNodeAttrByID = (id: string, attr: string, val: any) => {
		return setArrItemByID(id, attr, val, preview_data.done_json)
	}

	onMounted(() => {
		connectNet()
		updateViewport()
		syncClipAnchor()
		if (typeof ResizeObserver !== 'undefined' && canvasRef.value) {
			resizeObserver = new ResizeObserver(throttledViewportResize)
			resizeObserver.observe(canvasRef.value)
		} else {
			window.addEventListener('resize', onViewportResize)
		}
	})

	onBeforeUnmount(() => {
		//清理可能挂起的requestAnimationFrame任务
		onCanvasMouseMove.cancel()
		onMousewheel.cancel()
		throttledViewportResize.cancel()
		//清空输入帧缓冲，避免卸载后残留引用
		pendingPointer.pending = false
		//移除拖拽期间挂在window上的监听
		detachDragListeners()
		resizeObserver?.disconnect()
		resizeObserver = null
		//清理缩放解冻定时器
		if (zoomUnfreezeTimer) {
			clearTimeout(zoomUnfreezeTimer)
			zoomUnfreezeTimer = null
		}
		//解冻视觉，避免卸载后残留冻结状态
		unfreezeVisual()
		window.removeEventListener('resize', onViewportResize)
		//关闭并销毁MQTT连接，移除全部事件监听
		link.close(() => {
			link.destroy()
			link = null
		})
	})

	watch(
		() => preview_data.done_json.length,
		() => {
			nextTick(updateViewport)
		}
	)

	defineExpose({
		setNodeAttrByID,
		getPerfLevel: () => perf.value.level
	})
</script>

<template>
	<div
		ref="canvasRef"
		class="canvas"
		:class="perfClass(perf.level)"
		:style="{ backgroundColor: preview_data.config.svg.background_color, position: 'relative' }"
		@mousedown="onCanvasMouseDown"
		@mousemove="onCanvasMouseMoveOrigin"
		@mouseup="onCanvasMouseUp"
		@mousewheel="onMousewheel"
		@contextmenu="preventDefault"
	>
		<slot name="background" />
		<div class="coverLayer">
			<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
				<g class="viewport-layer" :transform="visualTransform">
					<g
						v-for="item in renderJson"
						:key="item.id"
						:transform="`translate(${item.x},${item.y})`"
						v-show="item.display"
						:style="getStyle(item)"
						:data-no-zoom="isStopWheelZoomItem(item) ? 'true' : undefined"
						@click="eventHandle(item, EEventType.Click)"
						@mousedown="stopEvent"
						@mousemove="stopEvent"
						@mouseup="stopEvent"
					>
						<g :class="getCommonClass(item)">
							<g :transform="getRotateAndScaleTransform(item)">
								<connection-line v-if="item.type === EDoneJsonType.ConnectionLine" :item-info="item" />
								<use
									v-else-if="item.type === EDoneJsonType.File"
									:xlink:href="`#svg-${item.name}`"
									v-bind="prosToVBind(item, ['height', 'width'])"
									:width="item.props?.width?.val ?? 100"
									:height="item.props?.height?.val ?? 100"
									:id="item.id"
								/>
								<component
									v-else-if="item.type === EDoneJsonType.CustomSvg"
									:is="resolveCanvasComp(item.tag, props.vueComp)"
									v-bind="prosToVBind(item, ['height', 'width'])"
									:width="item.props?.width?.val ?? 100"
									:height="item.props?.height?.val ?? 100"
									:id="item.id"
									@on-change="eventHandle(item, EEventType.Change)"
								/>
								<foreignObject
									v-else-if="item.type === EDoneJsonType.Vue"
									v-bind="getForeignObjectBound(item.actual_bound)"
									:id="`foreign-object${item.id}`"
									class="foreignObject"
								>
									<component
										:is="resolveCanvasComp(item.tag, props.vueComp)"
										v-bind="prosToVBind(item)"
										:id="item.id"
										@on-change="eventHandle(item, EEventType.Change)"
										>{{ item.tag_slot }}
									</component>
								</foreignObject>
							</g>
						</g>
					</g>
				</g>
			</svg>
		</div>

		<div class="can-not-select canvasInfoTxt" v-show="showCanvasInfo"
			>{{ translate('缩放倍数') }}: {{ displayPos.scale }}{{ translate('倍') }}, {{ translate('画布位置') }}:
			{{ myFixed(displayPos.x, 2) }}, {{ myFixed(displayPos.y, 2) }}
			<vgce-icon class="icoP" :size="14" @click="resetCanvas" :title="translate('重置位置')">
				<Aim />
			</vgce-icon>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.canvas {
		width: 100%;
		height: 100vh;
		cursor: v-bind('cursor_style');
		/* 禁止文本选中：拖动画布或组件时避免触发浏览器的选择文字行为 */
		user-select: none;
		-webkit-user-select: none;
	}

	.common-ani {
		transform-box: fill-box;
	}

	.coverLayer {
		contain: paint;
	}
</style>