<script lang="ts" setup>
	import { pinia } from '@/hooks'
	import { useSvgEditLayoutStore } from '@/stores/svg-edit-layout'
	import { useConfigStore } from '@/stores/config'
	import { myFixed, preventDefault } from '@/utils'

	const emit = defineEmits(['onLineMouseUp'])
	const props = withDefaults(
		defineProps<{
			visible?: boolean
			stepLength?: number // 步长
		}>(),
		{
			visible: true,
			stepLength: 100
		}
	)

	const svgEditLayoutStore = useSvgEditLayoutStore(pinia)
	const configStore = useConfigStore(pinia)
	/**
	 * @description 绑定事件 on(element, event, handler)
	 */
	const on = (function () {
		return function (element: any, event: any, handler: any) {
			if (element && event && handler) {
				element.addEventListener(event, handler, false)
			}
		}
	})()

	/**
	 * @description 解绑事件 off(element, event, handler)
	 */
	const off = (function () {
		return function (element: any, event: any, handler: any) {
			if (element && event) {
				element.removeEventListener(event, handler, false)
			}
		}
	})()
	let contentPadding = 18 // 内容左上填充
	let windowWidth = ref(0) // 窗口宽度
	let windowHeight = ref(0) // 窗口高度
	let xScale = ref<Array<{ id: number }>>([]) // 水平刻度
	let yScale = ref<Array<{ id: number }>>([]) // 垂直刻度
	const lines = ref<any[]>([])
	let isDrag = ref(false)
	let dragFlag = '' // 拖动开始标记，可能值x(从水平标尺开始拖动);y(从垂直标尺开始拖动)
	let horizontalDottedLeft = ref(-999) // 水平虚线位置
	let verticalDottedTop = ref(-999) // 垂直虚线位置
	let rulerWidth = 18 // 垂直标尺的宽度
	let rulerHeight = 18 // 水平标尺的高度
	let dragLineId = '' // 被移动线的ID
	//ref
	const content = ref(null)
	const el = ref(null)
	const verticalRuler = ref(null)
	const horizontalRuler = ref(null)
	const wrapperStyle: any = computed(() => ({
		width: windowWidth.value + 'px',
		height: windowHeight.value + 'px'
	}))
	const contentStyle = computed(() => ({
		padding: contentPadding + 'px 0px 0px ' + contentPadding + 'px'
	}))
	const lineList = computed(() => {
		let hCount = 0
		let vCount = 0
		return lines.value.map((item: any) => {
			const isH = item.type === 'h'
			return {
				id: `${item.type}_${isH ? hCount++ : vCount++}`,
				type: item.type,
				title: item.site.toFixed(0) + 'px',
				[isH ? 'top' : 'left']:
					item.site * configStore.svg.scale +
					contentPadding +
					svgEditLayoutStore.center_offset[isH ? 'y' : 'x'] * configStore.svg.scale
			}
		})
	})

	svgEditLayoutStore.$subscribe((m: any) => {
		if (m.events?.target?.hasOwnProperty('left_nav') || m.events?.target?.hasOwnProperty('right_nav')) {
			window.setTimeout(init, 420)
		}
	})

	configStore.$subscribe((m: any) => {
		if (m.events?.target?.hasOwnProperty('scale')) {
			scaleCalc()
		}
	})
	onMounted(() => {
		on(document, 'mousemove', mouseMove)
		on(document, 'mouseup', mouseUp)
		init()
		on(window, 'resize', windowResize)
	})
	onBeforeUnmount(() => {
		off(document, 'mousemove', mouseMove)
		off(document, 'mouseup', mouseUp)
		off(window, 'resize', windowResize)
	})
	const init = () => {
		box()
		scaleCalc()
	}

	const windowResize = () => {
		xScale.value = []
		yScale.value = []
		init()
	}
	const getLineStyle = ({ type, top, left }: any) => {
		return type === 'h' ? { top: top + 'px' } : { left: left + 'px' }
	}
	const handleDragLine = ({ type, id }: any) => {
		return type === 'h' ? dragHorizontalLine(id) : dragVerticalLine(id)
	}
	//获取窗口宽与高
	const box = () => {
		const style = window.getComputedStyle((el.value as any).parentNode, null)
		windowWidth.value = parseInt(style.getPropertyValue('width'))
		windowHeight.value = parseInt(style.getPropertyValue('height'))
		rulerWidth = (verticalRuler.value as any).clientWidth
		rulerHeight = (horizontalRuler.value as any).clientHeight
	}
	// 计算刻度
	const scaleCalc = () => {
		getCalc(xScale.value, windowWidth.value, svgEditLayoutStore.center_offset.x)
		getCalc(yScale.value, windowHeight.value, svgEditLayoutStore.center_offset.y)
	}

	//获取刻度
	const getCalc = (
		array: {
			id: number
		}[],
		length: number,
		start: number
	) => {
		if (array.length === 0) {
			for (let i = 0; i < length; i += props.stepLength) {
				if (i % props.stepLength === 0) {
					array.push({ id: myFixed(i / configStore.svg.scale - start, 0) })
				}
			}
		} else {
			array.forEach((e, i) => {
				e.id = myFixed((i * props.stepLength) / configStore.svg.scale - start, 0)
			})
		}
	}

	const mouseMove = (e: any) => {
		//移动画布
		scaleCalc()
		dottedLineMove(e)
	}
	//虚线移动
	const dottedLineMove = ($event: any) => {
		if ($event.layerX === $event.x || $event.layerY === $event.y) {
			return
		}
		switch (dragFlag) {
			case 'x':
				if (isDrag.value) {
					verticalDottedTop.value = $event.layerY
				}
				break
			case 'y':
				if (isDrag.value) {
					horizontalDottedLeft.value = $event.layerX
				}
				break
			case 'h':
				if (isDrag.value) {
					verticalDottedTop.value = $event.layerY
				}
				break
			case 'v':
				if (isDrag.value) {
					horizontalDottedLeft.value = $event.layerX
				}
				break
			default:
				break
		}
	}
	//生成一个参考线
	const newLine = (val: any) => {
		isDrag.value = true
		dragFlag = val
	}
	const mouseUp = (e: any) => {
		dottedLineUp(e)
	}
	//虚线松开
	const dottedLineUp = ($event: any) => {
		if (isDrag.value) {
			isDrag.value = false
			switch (dragFlag) {
				case 'x':
					const x = Math.round(
						($event.layerY - contentPadding) / configStore.svg.scale - svgEditLayoutStore.center_offset.y
					)
					if (x <= 0) {
						verticalDottedTop.value = -999
						return
					}
					lines.value.push({
						type: 'h',
						site: x
					})
					break
				case 'y':
					const y = Math.round(
						($event.layerX - contentPadding) / configStore.svg.scale - svgEditLayoutStore.center_offset.x
					)
					if (y <= 0) {
						horizontalDottedLeft.value = -999
						return
					}
					lines.value.push({
						type: 'v',
						site: y
					})
					break
				case 'h':
					dragCalc(
						lines.value,
						Math.round(($event.layerY - contentPadding) / configStore.svg.scale - svgEditLayoutStore.center_offset.y),
						Math.round(rulerHeight / configStore.svg.scale - svgEditLayoutStore.center_offset.y),
						'h'
					)
					break
				case 'v':
					dragCalc(
						lines.value,
						Math.round(($event.layerX - contentPadding) / configStore.svg.scale - svgEditLayoutStore.center_offset.x),
						Math.round(rulerWidth / configStore.svg.scale - svgEditLayoutStore.center_offset.x),
						'v'
					)
					break
				default:
					break
			}

			verticalDottedTop.value = horizontalDottedLeft.value = -999
		}
	}
	const dragCalc = (list: any, page: any, ruler: any, type: any) => {
		if (page < ruler) {
			let Index
			lineList.value.forEach((item: any, index: any) => {
				if (item.id === dragLineId) {
					Index = index
				}
			})
			list.splice(Index, 1)
		} else {
			let Index
			lineList.value.forEach((item, index) => {
				if (item.id === dragLineId) {
					Index = index
				}
			})
			list.splice(Index, 1, {
				type: type,
				site: page
			})
		}
	}
	//水平标尺按下鼠标
	const horizontalDragRuler = () => {
		newLine('x')
	}
	//垂直标尺按下鼠标
	const verticalDragRuler = () => {
		newLine('y')
	}
	// 水平线处按下鼠标
	const dragHorizontalLine = (id: any) => {
		isDrag.value = true
		dragFlag = 'h'
		dragLineId = id
	}
	// 垂直线处按下鼠标
	const dragVerticalLine = (id: any) => {
		isDrag.value = true
		dragFlag = 'v'
		dragLineId = id
	}

	const lineMouseUp = () => {
		emit('onLineMouseUp')
	}
</script>

<template>
	<div :style="wrapperStyle" class="vue-ruler-wrapper" onselectStart="return false;" ref="el">
		<section v-show="props.visible">
			<div ref="horizontalRuler" class="vue-ruler-h" @mousedown.stop="horizontalDragRuler">
				<span v-for="(item, index) in xScale" :style="{ left: index * stepLength + 'px' }" class="n">{{
					item.id
				}}</span>
			</div>
			<div ref="verticalRuler" class="vue-ruler-v" @mousedown.stop="verticalDragRuler">
				<span v-for="(item, index) in yScale" :style="{ top: index * stepLength + 'px' }" class="n">{{ item.id }}</span>
			</div>
			<div :style="{ top: verticalDottedTop + 'px' }" class="vue-ruler-ref-dot-h"
				><span>{{
					Math.round((verticalDottedTop - rulerHeight) / configStore.svg.scale - svgEditLayoutStore.center_offset.y)
				}}</span></div
			>
			<div :style="{ left: horizontalDottedLeft + 'px' }" class="vue-ruler-ref-dot-v"
				><span>{{
					Math.round((horizontalDottedLeft - rulerWidth) / configStore.svg.scale - svgEditLayoutStore.center_offset.x)
				}}</span></div
			>
			<div
				v-for="item in lineList"
				:title="item.title"
				:style="getLineStyle(item)"
				:key="item.id"
				:class="`vue-ruler-ref-line-${item.type}`"
				@mousedown="handleDragLine(item)"
				@mouseup="lineMouseUp"
				@contextmenu="preventDefault"
			/>
		</section>
		<div ref="content" class="vue-ruler-content" :style="contentStyle">
			<slot />
		</div>
		<div v-show="isDrag" class="vue-ruler-content-mask"></div>
	</div>
</template>

<style lang="less">
	.vue-ruler-wrapper {
		left: 0;
		top: 0;
		z-index: 999;
		user-select: none;
		position: relative;
	}

	.vue-ruler-h,
	.vue-ruler-v,
	.vue-ruler-ref-line-v,
	.vue-ruler-ref-line-h,
	.vue-ruler-ref-dot-h,
	.vue-ruler-ref-dot-v {
		position: absolute;
		left: 0;
		top: 0;
		z-index: 999;
	}

	.vue-ruler-h,
	.vue-ruler-v {
		opacity: 0.6;
		background-color: rgba(0, 0, 0, 0.04);
	}

	.vue-ruler-h {
		width: calc(100% - 18px);
		height: 18px;
		left: 18px;
	}

	.vue-ruler-v {
		width: 18px;
		height: calc(100% - 18px);
		top: 18px;
	}

	.vue-ruler-v .n,
	.vue-ruler-h .n {
		position: absolute;
		font:
			10px/1 Arial,
			sans-serif;
		color: #333;
		cursor: default;
		top: 1px;
		box-sizing: border-box;
	}

	.vue-ruler-h .n {
		border-left: 1px solid #856b01;
		padding-left: 3px;
		height: 100%;
		padding-top: 3px;
	}

	.vue-ruler-v .n {
		width: 100%;
		writing-mode: vertical-rl;
		border-top: 1px solid #856b01;
		padding-top: 3px;
		padding-right: 3px;
	}

	.vue-ruler-ref-line-v,
	.vue-ruler-ref-line-h,
	.vue-ruler-ref-dot-h,
	.vue-ruler-ref-dot-v {
		z-index: 998;
	}

	.vue-ruler-ref-line-h {
		width: 100%;
		height: 4px;
		border-top: 1px solid #ff4101;
		cursor: s-resize;
	}

	.vue-ruler-ref-line-v {
		width: 4px;
		height: 100%;
		border-left: 1px solid #ff4101;
		cursor: w-resize;
	}

	.vue-ruler-ref-dot-h,
	.vue-ruler-ref-dot-v {
		span {
			position: absolute;
			font-size: 12px;
			color: #856b01;
		}
	}

	.vue-ruler-ref-dot-h {
		width: 100%;
		height: 4px;
		cursor: n-resize;
		border-top: 1px dashed #999;

		span {
			left: 30px;
			top: 3px;
		}
	}

	.vue-ruler-ref-dot-v {
		width: 4px;
		height: 100%;
		_height: 9999px;
		cursor: w-resize;
		border-left: 1px dashed #999;

		span {
			top: 30px;
			left: 7px;
		}
	}

	.vue-ruler-content {
		position: absolute;
		z-index: 997;
		width: 100%;
		height: 100%;
	}

	.vue-ruler-content-mask {
		position: absolute;
		width: 100%;
		height: 100%;
		background: transparent;
		z-index: 998;
	}
</style>
