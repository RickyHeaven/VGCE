/**
 * @description 预览性能优化相关工具
 * @author Ricky
 */

/**
 * 性能档位（编辑器与预览器共用）
 * high: 全部效果开启（动画、图表实时刷新等），适合高性能PC
 * medium: 关闭高开销效果，适合中端PC
 * low: 关闭大部分动画与高开销效果，适合低性能PC或工控机
 */
export enum EPreviewPerfLevel {
	High = 'high',
	Medium = 'medium',
	Low = 'low'
}

// === 预览器（SvgViewer）性能配置 ===

export interface IPreviewPerfOptions {
	level?: EPreviewPerfLevel | 'auto'
	animations?: boolean
	chartAutoResize?: boolean
	minChartInterval?: number
	fpsLimit?: number
	nodeVirtual?: boolean
	nodeVirtualThreshold?: number
}

export interface IResolvedPerfOptions {
	level: EPreviewPerfLevel
	animations: boolean
	chartAutoResize: boolean
	minChartInterval: number
	fpsLimit: number
	nodeVirtual: boolean
	nodeVirtualThreshold: number
}

const PREVIEW_LEVEL_PRESET: Record<EPreviewPerfLevel, IResolvedPerfOptions> = {
	[EPreviewPerfLevel.High]: {
		level: EPreviewPerfLevel.High,
		animations: true,
		chartAutoResize: true,
		minChartInterval: 0,
		fpsLimit: 60,
		nodeVirtual: true,
		nodeVirtualThreshold: 400
	},
	[EPreviewPerfLevel.Medium]: {
		level: EPreviewPerfLevel.Medium,
		animations: false,
		chartAutoResize: false,
		minChartInterval: 300,
		fpsLimit: 30,
		nodeVirtual: true,
		nodeVirtualThreshold: 200
	},
	[EPreviewPerfLevel.Low]: {
		level: EPreviewPerfLevel.Low,
		animations: false,
		chartAutoResize: false,
		minChartInterval: 1000,
		fpsLimit: 20,
		nodeVirtual: true,
		nodeVirtualThreshold: 100
	}
}

/**
 * 根据浏览器环境粗略评估设备性能档位
 * 仅使用同步可得的轻量指标，避免阻塞首屏
 */
export const detectPerfLevel = (): EPreviewPerfLevel => {
	if (typeof window === 'undefined' || typeof navigator === 'undefined') {
		return EPreviewPerfLevel.Medium
	}
	const nav = navigator as any
	const cores = nav.hardwareConcurrency || 2
	// deviceMemory 在某些浏览器不可用（如 Firefox），此时不额外降级，避免误判
	const memoryKnown = typeof nav.deviceMemory === 'number'
	const memory = memoryKnown ? nav.deviceMemory : 4
	const dpr = window.devicePixelRatio || 1
	const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent || '')

	// 低配设备判断：核数≤2、内存≤2GB（已知时），或核数≤4且内存≤4（已知时且典型工控机/老旧PC），或低dpr低核数设备
	if (
		cores <= 2 ||
		(memoryKnown && memory <= 2) ||
		(memoryKnown && cores <= 4 && memory <= 4) ||
		(dpr <= 1 && cores <= 4)
	) {
		return EPreviewPerfLevel.Low
	}
	if (cores <= 4 || (memoryKnown && memory <= 4) || isMobile) {
		return EPreviewPerfLevel.Medium
	}
	return EPreviewPerfLevel.High
}

/**
 * 合并用户传入的性能选项与档位预设
 */
export const resolvePerfOptions = (options?: IPreviewPerfOptions): IResolvedPerfOptions => {
	const level =
		!options?.level || options.level === 'auto' ? detectPerfLevel() : (options.level as EPreviewPerfLevel)
	const preset = PREVIEW_LEVEL_PRESET[level] ?? PREVIEW_LEVEL_PRESET[EPreviewPerfLevel.Medium]
	return {
		...preset,
		animations: options?.animations ?? preset.animations,
		chartAutoResize: options?.chartAutoResize ?? preset.chartAutoResize,
		minChartInterval: options?.minChartInterval ?? preset.minChartInterval,
		fpsLimit: options?.fpsLimit ?? preset.fpsLimit,
		nodeVirtual: options?.nodeVirtual ?? preset.nodeVirtual,
		nodeVirtualThreshold: options?.nodeVirtualThreshold ?? preset.nodeVirtualThreshold
	}
}

// === 编辑器（SvgEditor）性能配置 ===

export interface IEditorPerfOptions {
	level?: EPreviewPerfLevel | 'auto'
	animations?: boolean
	fpsLimit?: number
	/** 触发视口裁剪的组件数量阈值，组件数超过此值后只渲染可视区内的节点 */
	clipThreshold?: number
}

export interface IResolvedEditorPerfOptions {
	level: EPreviewPerfLevel
	animations: boolean
	fpsLimit: number
	clipThreshold: number
}

const EDITOR_LEVEL_PRESET: Record<EPreviewPerfLevel, IResolvedEditorPerfOptions> = {
	[EPreviewPerfLevel.High]: {
		level: EPreviewPerfLevel.High,
		animations: true,
		fpsLimit: 60,
		clipThreshold: 400
	},
	[EPreviewPerfLevel.Medium]: {
		level: EPreviewPerfLevel.Medium,
		animations: false,
		fpsLimit: 30,
		clipThreshold: 200
	},
	[EPreviewPerfLevel.Low]: {
		level: EPreviewPerfLevel.Low,
		animations: false,
		fpsLimit: 20,
		clipThreshold: 100
	}
}

export const resolveEditorPerfOptions = (options?: IEditorPerfOptions): IResolvedEditorPerfOptions => {
	const level =
		!options?.level || options.level === 'auto' ? detectPerfLevel() : (options.level as EPreviewPerfLevel)
	const preset = EDITOR_LEVEL_PRESET[level] ?? EDITOR_LEVEL_PRESET[EPreviewPerfLevel.Medium]
	return {
		...preset,
		animations: options?.animations ?? preset.animations,
		fpsLimit: options?.fpsLimit ?? preset.fpsLimit,
		clipThreshold: options?.clipThreshold ?? preset.clipThreshold
	}
}

/**
 * 基于requestAnimationFrame的节流函数
 * @param fn 需要节流的回调
 * @param fpsLimit 帧率上限，<=0 表示不限制（每帧最多执行一次）
 */
export const rafThrottle = <T extends (...args: any[]) => void>(fn: T, fpsLimit: number) => {
	let rafId: number | null = null
	let lastTime = 0
	let lastArgs: any[] | null = null
	const interval = fpsLimit > 0 ? 1000 / fpsLimit : 0
	const invoke = () => {
		rafId = null
		const args = lastArgs
		lastArgs = null
		if (!args) {
			return
		}
		lastTime = performance.now()
		fn(...(args as any[]))
	}
	const run = () => {
		rafId = null
		//达到限频间隔才执行，否则延迟到下一个满足间隔的帧，避免空转
		if (lastArgs && interval > 0 && performance.now() - lastTime < interval) {
			rafId = requestAnimationFrame(run)
			return
		}
		invoke()
	}
	const throttled = ((...args: any[]) => {
		lastArgs = args
		if (rafId !== null) {
			return
		}
		rafId = requestAnimationFrame(run)
	}) as T & { cancel: () => void; flush: () => void }
	throttled.cancel = () => {
		if (rafId !== null) {
			cancelAnimationFrame(rafId)
			rafId = null
		}
		lastArgs = null
	}
	throttled.flush = () => {
		if (rafId !== null) {
			cancelAnimationFrame(rafId)
			rafId = null
		}
		invoke()
	}
	return throttled
}

/**
 * 给元素添加性能档位相关的类名，用于CSS层面降级
 * animate.css 动画在 low 档位会被禁用（见 assets/base.less 中的 .perf-low 规则）
 */
export const perfClass = (level: EPreviewPerfLevel) => `perf-${level}`

export interface IAABB {
	x: number
	y: number
	width: number
	height: number
}

interface IAABBItem {
	x: number
	y: number
	scale_x?: number
	scale_y?: number
	rotate?: number
	actual_bound?: { x: number; y: number; width: number; height: number }
}

const aabbCache = new WeakMap<object, { signature: string; value: IAABB }>()

/**
 * 计算组件在世界坐标下的轴对齐包围盒（AABB）
 * 考虑缩放与旋转：旋转后的AABB按外接矩形计算，避免旋转组件被过早裁剪
 * @param item 组件数据
 */
export const getItemAABB = (item: IAABBItem): IAABB => {
	const b = item.actual_bound
	if (!b || !b.width || !b.height) {
		return { x: item.x, y: item.y, width: 0, height: 0 }
	}
	const scaleX = Math.abs(item.scale_x || 1)
	const scaleY = Math.abs(item.scale_y || 1)
	const rotate = item.rotate || 0
	const signature = `${item.x}|${item.y}|${b.x}|${b.y}|${b.width}|${b.height}|${scaleX}|${scaleY}|${rotate}`
	const hit = aabbCache.get(item)
	if (hit && hit.signature === signature) {
		return hit.value
	}
	//组件以自身包围盒中心为原点进行缩放和旋转
	const originX = b.x + b.width / 2
	const originY = b.y + b.height / 2
	const halfW = (b.width * scaleX) / 2
	const halfH = (b.height * scaleY) / 2
	let width = halfW * 2
	let height = halfH * 2
	if (rotate) {
		const rad = (rotate * Math.PI) / 180
		const cos = Math.abs(Math.cos(rad))
		const sin = Math.abs(Math.sin(rad))
		width = halfW * 2 * cos + halfH * 2 * sin
		height = halfW * 2 * sin + halfH * 2 * cos
	}
	const value: IAABB = {
		x: item.x + originX - width / 2,
		y: item.y + originY - height / 2,
		width,
		height
	}
	aabbCache.set(item, { signature, value })
	return value
}

/**
 * 视口裁剪：从组件列表中筛出与可视区域（含缓冲区）相交的组件
 * @param list 组件列表
 * @param view 可视区域信息，坐标系与组件一致（已按画布缩放换算）
 * @param threshold 触发裁剪的最小组件数量，低于该数量直接返回全量
 * @param buffer 缓冲区大小（世界坐标单位），用于预渲染即将进入视口的组件
 */
export const clipByViewport = <T extends IAABBItem>(
	list: T[],
	view: { left: number; top: number; right: number; bottom: number },
	threshold: number,
	buffer = 300
): T[] => {
	if (list.length <= threshold) {
		return list
	}
	const left = view.left - buffer
	const top = view.top - buffer
	const right = view.right + buffer
	const bottom = view.bottom + buffer
	return list.filter((item) => {
		//没有有效包围盒的组件（如连线、尚未计算尺寸的组件）无法可靠裁剪，直接保留
		if (!item.actual_bound?.width || !item.actual_bound?.height) {
			return true
		}
		const b = getItemAABB(item)
		return b.x < right && b.x + b.width > left && b.y < bottom && b.y + b.height > top
	})
}