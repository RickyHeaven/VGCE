<!-- 连线组件 -->
<script lang="ts" setup>
	import { ELineBindAnchors } from '@/components/config/types'
	import type { IDoneJson } from '@/stores/global/types'
	import { EGlobalStoreIntention } from '@/stores/global/types'
	import { createLine, getCoordinateOffset, moveAnchors } from '@/utils'
	import { useGlobalStore } from '@/stores/global'
	import { pinia } from '@/hooks'
	import { useSvgEditLayoutStore } from '@/stores/svg-edit-layout'

	const props = defineProps<{
		itemInfo: IDoneJson
	}>()
	const offset = ref(4)
	const fill = ref('#ab712e')
	const radius = ref(4)
	const outRadius = ref(12)
	const globalStore = useGlobalStore(pinia)
	const svgEditLayoutStore = useSvgEditLayoutStore(pinia)

	const cxT = computed(
		() => props.itemInfo.actual_bound.x + props.itemInfo.actual_bound.width / 2 - offset.value + radius.value
	)

	const cyT = computed(
		() =>
			props.itemInfo.actual_bound.y -
			offset.value -
			getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y) +
			radius.value
	)

	const cxR = computed(
		() =>
			props.itemInfo.actual_bound.x -
			offset.value +
			props.itemInfo.actual_bound.width +
			getCoordinateOffset(props.itemInfo.actual_bound.width, props.itemInfo.scale_x) +
			radius.value
	)

	const cyR = computed(
		() =>
			props.itemInfo.actual_bound.y -
			offset.value +
			(props.itemInfo.actual_bound.height * props.itemInfo.scale_y) / 2 -
			getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y) +
			radius.value
	)

	const cxB = computed(
		() => props.itemInfo.actual_bound.x - offset.value + props.itemInfo.actual_bound.width / 2 + radius.value
	)
	const cyB = computed(
		() =>
			props.itemInfo.actual_bound.y -
			offset.value +
			props.itemInfo.actual_bound.height +
			getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y) +
			radius.value
	)

	const cxL = computed(
		() =>
			props.itemInfo.actual_bound.x -
			offset.value -
			getCoordinateOffset(props.itemInfo.actual_bound.width, props.itemInfo.scale_x) +
			radius.value
	)
	const cyL = computed(
		() =>
			props.itemInfo.actual_bound.y -
			offset.value +
			(props.itemInfo.actual_bound.height * props.itemInfo.scale_y) / 2 -
			getCoordinateOffset(props.itemInfo.actual_bound.height, props.itemInfo.scale_y) +
			radius.value
	)

	const anchorUp = (e: any, type: ELineBindAnchors) => {
		if (globalStore.intention === EGlobalStoreIntention.SetConnectionLineNode) {
			//移动连线首尾节点，绑定锚点
			e.stopPropagation()
			if (globalStore.handle_svg_info?.info.bind_anchors && globalStore.connection_line_node_info) {
				if (globalStore.connection_line_node_info.point_index === 0) {
					globalStore.handle_svg_info.info.bind_anchors.start = {
						type: type,
						target_id: props.itemInfo.id
					}
				} else if (
					globalStore.connection_line_node_info.point_index ===
					globalStore.handle_svg_info.info.props.point_position.val.length - 1
				) {
					globalStore.handle_svg_info.info.bind_anchors.end = {
						type: type,
						target_id: props.itemInfo.id
					}
				}

				globalStore.intention = EGlobalStoreIntention.None
				globalStore.setHandleSvgInfo(null)
				nextTick(function () {
					moveAnchors(props.itemInfo)
				})
			}
		}
	}
	const bindAnchor = (e: any, type: ELineBindAnchors) => {
		if (globalStore.intention === EGlobalStoreIntention.None) {
			createLine(e, type, props.itemInfo)
			if (globalStore.handle_svg_info) {
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
			}
		} else if (globalStore.intention === EGlobalStoreIntention.Connection) {
			//在连线的情况下，点击锚点，结束连线并绑定锚点
			e.stopPropagation()
			if (globalStore.handle_svg_info?.info.bind_anchors) {
				globalStore.handle_svg_info.info.bind_anchors.end = {
					type: type,
					target_id: props.itemInfo.id
				}
				globalStore.intention = EGlobalStoreIntention.None
				globalStore.setHandleSvgInfo(null)
				nextTick(function () {
					moveAnchors(props.itemInfo)
				})
			}
		}
	}
</script>

<template>
	<g
		style="vector-effect: non-scaling-stroke"
		class="connect-points"
		:fill="fill"
		stroke-width="2"
		stroke="rgba(0,0,0,0)"
	>
		<g
			@mousedown="bindAnchor($event, ELineBindAnchors.TopCenter)"
			@mouseup="anchorUp($event, ELineBindAnchors.TopCenter)"
		>
			<circle class="out-circle" :cx="cxT" :cy="cyT" :r="outRadius" fill-opacity=".3" />
			<circle id="connection_tc" :cx="cxT" :cy="cyT" :r="radius" pointer-events="all" />
		</g>
		<g @mousedown="bindAnchor($event, ELineBindAnchors.Right)" @mouseup="anchorUp($event, ELineBindAnchors.Right)">
			<circle class="out-circle" :cx="cxR" :cy="cyR" :r="outRadius" fill-opacity=".3" />
			<circle id="connection_r" :cx="cxR" :cy="cyR" :r="radius" pointer-events="all" />
		</g>
		<g
			@mousedown="bindAnchor($event, ELineBindAnchors.BottomCenter)"
			@mouseup="anchorUp($event, ELineBindAnchors.BottomCenter)"
		>
			<circle class="out-circle" :cx="cxB" :cy="cyB" :r="outRadius" fill-opacity=".3" />
			<circle id="connection_bc" :cx="cxB" :cy="cyB" :r="radius" pointer-events="all" />
		</g>
		<g @mousedown="bindAnchor($event, ELineBindAnchors.Left)" @mouseup="anchorUp($event, ELineBindAnchors.Left)">
			<circle class="out-circle" :cx="cxL" :cy="cyL" :r="outRadius" fill-opacity=".3" />
			<circle id="connection_l" :cx="cxL" :cy="cyL" :r="radius" :style="{ cursor: 'crosshair' }" pointer-events="all" />
		</g>
	</g>
</template>
<style lang="less" scoped>
	.connect-points g {
		cursor: crosshair;

		&:hover {
			.out-circle {
				visibility: visible;
			}
		}

		.out-circle {
			visibility: hidden;
		}
	}
</style>
