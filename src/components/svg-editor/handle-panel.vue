<!-- 旋转缩放组件 -->
<script lang="ts" setup>
	import { pinia } from '@/hooks'
	import { useSvgEditLayoutStore } from '@/stores/svg-edit-layout'
	import { useGlobalStore } from '@/stores/global'
	import { EGlobalStoreIntention, EMouseInfoState, EScaleInfoType } from '@/stores/global/types'
	import type { IDoneJson } from '@/stores/global/types'
	import { getCoordinateOffset } from '@/utils'
	import { useConfigStore } from '@/stores/config'

	const props = defineProps<{ itemInfo: IDoneJson }>()
	const globalStore = useGlobalStore(pinia)
	const configStore = useConfigStore(pinia)
	const svgEditLayoutStore = useSvgEditLayoutStore(pinia)
	const offset = ref(4)
	const fill = ref('#ab712e')
	const angle_to_cursor = [
		{
			start: 338,
			end: 23,
			cursor: 'nw',
			type: EScaleInfoType.TopLeft
		},
		{
			start: 23,
			end: 68,
			cursor: 'n',
			type: EScaleInfoType.TopCenter
		},
		{
			start: 68,
			end: 113,
			cursor: 'ne',
			type: EScaleInfoType.TopRight
		},
		{
			start: 293,
			end: 338,
			cursor: 'w',
			type: EScaleInfoType.Left
		},
		{
			start: 113,
			end: 158,
			cursor: 'e',
			type: EScaleInfoType.Right
		},
		{
			start: 248,
			end: 293,
			cursor: 'sw',
			type: EScaleInfoType.BottomLeft
		},
		{
			start: 203,
			end: 248,
			cursor: 's',
			type: EScaleInfoType.BottomCenter
		},
		{
			start: 158,
			end: 203,
			cursor: 'se',
			type: EScaleInfoType.BottomRight
		}
	]

	const canZoom = computed(() => props.itemInfo.config.can_zoom)
	const onHandleMouseDown = (type: EScaleInfoType, e: MouseEvent) => {
		console.log('handMousedown', e)
		const { clientX, clientY } = e
		e.stopPropagation()
		globalStore.intention = EGlobalStoreIntention.Zoom
		const x = Math.round(
			(clientX - svgEditLayoutStore.canvasInfo.left) / configStore.svg.scale - svgEditLayoutStore.center_offset.x
		)
		const y = Math.round(
			(clientY - svgEditLayoutStore.canvasInfo.top) / configStore.svg.scale - svgEditLayoutStore.center_offset.y
		)
		globalStore.mouse_info = {
			state: EMouseInfoState.Down,
			position_x: x,
			position_y: y,
			now_position_x: x,
			now_position_y: y,
			new_position_x: 0,
			new_position_y: 0
		}
		globalStore.scale_info = {
			type: type,
			scale_times: {
				x: props.itemInfo.scale_x,
				y: props.itemInfo.scale_y
			},
			scale_item_info: {
				x: props.itemInfo.x,
				y: props.itemInfo.y
			},
			symmetric_point: {
				x: x + Math.abs(x - props.itemInfo.center_position.x) * 2 * (x > props.itemInfo.center_position.x ? -1 : 1),
				y: y + Math.abs(y - props.itemInfo.center_position.y) * 2 * (y > props.itemInfo.center_position.y ? -1 : 1)
			}
		}
	}
	const onRotateCircleMouseDown = (e: MouseEvent) => {
		const { clientX, clientY } = e
		const x = Math.round(
			(clientX - svgEditLayoutStore.canvasInfo.left) / configStore.svg.scale - svgEditLayoutStore.center_offset.x
		)
		const y = Math.round(
			(clientY - svgEditLayoutStore.canvasInfo.top) / configStore.svg.scale - svgEditLayoutStore.center_offset.y
		)
		e.stopPropagation()
		globalStore.intention = EGlobalStoreIntention.Rotate
		globalStore.rotate_info = {
			angle: props.itemInfo.rotate
		}
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
	/**
	 * 获取旋转之后的光标样式
	 * @param init_angle 初始角度 360/8=45
	 */
	const getCursor = (init_angle: number) => {
		const now_init_angle = (init_angle + props.itemInfo.rotate) % 360
		const find_cursor = angle_to_cursor.find((f) => f.start <= now_init_angle && f.end > now_init_angle)
		if (!find_cursor) {
			return {
				cursor: 'nw-resize',
				type: EScaleInfoType.TopLeft
			}
		}
		return {
			cursor: find_cursor.cursor + '-resize',
			type: find_cursor.type
		}
	}
</script>

<template>
	<g style="vector-effect: non-scaling-stroke">
		<rect
			id="resize_tl"
			width="8"
			height="8"
			:fill="fill"
			:style="{ cursor: getCursor(0).cursor, 'vector-effect': 'non-scaling-stroke' }"
			pointer-events="all"
			v-show="canZoom"
			:x="
				props.itemInfo.actual_bound.x -
				offset -
				getCoordinateOffset(props.itemInfo.actual_bound.width, props.itemInfo.scale_x)
			"
			:y="
				props.itemInfo.actual_bound.y -
				offset -
				getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y)
			"
			stroke="rgba(0,0,0,0)"
			@mousedown="onHandleMouseDown(EScaleInfoType.TopLeft, $event)"
		>
		</rect>
		<circle
			:cx="props.itemInfo.actual_bound.x + props.itemInfo.actual_bound.width / 2"
			:cy="
				props.itemInfo.actual_bound.y -
				offset -
				getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y) -
				24
			"
			:r="4"
			class="rotate-circle"
			@mousedown="onRotateCircleMouseDown"
		/>
		<line
			:x1="props.itemInfo.actual_bound.x + props.itemInfo.actual_bound.width / 2"
			:y1="
				props.itemInfo.actual_bound.y -
				offset -
				getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y)
			"
			:x2="props.itemInfo.actual_bound.x + props.itemInfo.actual_bound.width / 2"
			:y2="
				props.itemInfo.actual_bound.y -
				offset -
				getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y) -
				20
			"
			:style="{ stroke: fill, 'stroke-width': 2 }"
		/>
		<rect
			id="resize_tc"
			width="8"
			height="8"
			:fill="fill"
			:style="{ cursor: getCursor(45).cursor, 'vector-effect': 'non-scaling-stroke' }"
			pointer-events="all"
			v-show="canZoom"
			:x="props.itemInfo.actual_bound.x + props.itemInfo.actual_bound.width / 2 - offset"
			:y="
				props.itemInfo.actual_bound.y -
				offset -
				getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y)
			"
			stroke="rgba(0,0,0,0)"
			@mousedown="onHandleMouseDown(EScaleInfoType.TopCenter, $event)"
		></rect>
		<rect
			id="resize_tr"
			width="8"
			height="8"
			:fill="fill"
			:style="{ cursor: getCursor(90).cursor, 'vector-effect': 'non-scaling-stroke' }"
			pointer-events="all"
			v-show="canZoom"
			:x="
				props.itemInfo.actual_bound.x +
				props.itemInfo.actual_bound.width -
				offset +
				getCoordinateOffset(props.itemInfo.actual_bound.width, props.itemInfo.scale_x)
			"
			:y="
				props.itemInfo.actual_bound.y -
				offset -
				getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y)
			"
			stroke="rgba(0,0,0,0)"
			@mousedown="onHandleMouseDown(EScaleInfoType.TopRight, $event)"
		></rect>
		<rect
			id="resize_l"
			width="8"
			height="8"
			:fill="fill"
			:style="{ cursor: getCursor(315).cursor, 'vector-effect': 'non-scaling-stroke' }"
			pointer-events="all"
			v-show="canZoom"
			:x="
				props.itemInfo.actual_bound.x -
				offset -
				getCoordinateOffset(props.itemInfo.actual_bound.width, props.itemInfo.scale_x)
			"
			:y="
				props.itemInfo.actual_bound.y -
				offset +
				(props.itemInfo.actual_bound.height * props.itemInfo.scale_y) / 2 -
				getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y)
			"
			stroke="rgba(0,0,0,0)"
			@mousedown="onHandleMouseDown(EScaleInfoType.Left, $event)"
		></rect>
		<rect
			id="resize_r"
			width="8"
			height="8"
			:fill="fill"
			:style="{ cursor: getCursor(135).cursor, 'vector-effect': 'non-scaling-stroke' }"
			pointer-events="all"
			v-show="canZoom"
			:x="
				props.itemInfo.actual_bound.x -
				offset +
				props.itemInfo.actual_bound.width +
				getCoordinateOffset(props.itemInfo.actual_bound.width, props.itemInfo.scale_x)
			"
			:y="
				props.itemInfo.actual_bound.y -
				offset +
				(props.itemInfo.actual_bound.height * props.itemInfo.scale_y) / 2 -
				getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y)
			"
			stroke="rgba(0,0,0,0)"
			@mousedown="onHandleMouseDown(EScaleInfoType.Right, $event)"
		></rect>
		<rect
			id="resize_bl"
			width="8"
			height="8"
			:fill="fill"
			:style="{ cursor: getCursor(270).cursor, 'vector-effect': 'non-scaling-stroke' }"
			pointer-events="all"
			v-show="canZoom"
			:x="
				props.itemInfo.actual_bound.x -
				offset -
				getCoordinateOffset(props.itemInfo.actual_bound.width, props.itemInfo.scale_x)
			"
			:y="
				props.itemInfo.actual_bound.y -
				offset +
				props.itemInfo.actual_bound.height * props.itemInfo.scale_y -
				getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y)
			"
			stroke="rgba(0,0,0,0)"
			@mousedown="onHandleMouseDown(EScaleInfoType.BottomLeft, $event)"
		></rect>
		<rect
			id="resize_bc"
			width="8"
			height="8"
			:fill="fill"
			:style="{ cursor: getCursor(225).cursor, 'vector-effect': 'non-scaling-stroke' }"
			pointer-events="all"
			v-show="canZoom"
			:x="props.itemInfo.actual_bound.x - offset + props.itemInfo.actual_bound.width / 2"
			:y="
				props.itemInfo.actual_bound.y -
				offset +
				props.itemInfo.actual_bound.height +
				getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y)
			"
			stroke="rgba(0,0,0,0)"
			@mousedown="onHandleMouseDown(EScaleInfoType.BottomCenter, $event)"
		></rect>
		<rect
			id="resize_br"
			width="8"
			height="8"
			:fill="fill"
			:style="{ cursor: getCursor(180).cursor, 'vector-effect': 'non-scaling-stroke' }"
			pointer-events="all"
			v-show="canZoom"
			:x="
				props.itemInfo.actual_bound.x -
				offset +
				props.itemInfo.actual_bound.width +
				getCoordinateOffset(props.itemInfo.actual_bound.width, props.itemInfo.scale_x)
			"
			:y="
				props.itemInfo.actual_bound.y -
				offset +
				props.itemInfo.actual_bound.height +
				getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y)
			"
			stroke="rgba(0,0,0,0)"
			@mousedown="onHandleMouseDown(EScaleInfoType.BottomRight, $event)"
		></rect>
	</g>
</template>

<style scoped>
	.rotate-circle {
		stroke: v-bind('fill');
		stroke-width: 1;
		fill-opacity: 0;
		cursor:
			url('@/assets/icons/rotate.svg') 12 12,
			auto;
	}
</style>
