<!-- 连线组件 -->
<script lang="ts" setup>
	import { ELineBindAnchors } from '@/components/config/types'
	import type { IDoneJson } from '@/stores/global/types'
	import { getCoordinateOffset, createLine } from '@/utils'

	const props = defineProps<{
		itemInfo: IDoneJson
	}>()
	const offset = ref(4)
	const fill = ref('#ab712e')
	const radius = ref(4)
	const outRadius = ref(12)

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
</script>

<template>
	<g
		style="vector-effect: non-scaling-stroke"
		class="connect-points"
		:fill="fill"
		stroke-width="2"
		stroke="rgba(0,0,0,0)"
	>
		<g @mousedown="createLine($event, ELineBindAnchors.TopCenter, itemInfo)">
			<circle class="out-circle" :cx="cxT" :cy="cyT" :r="outRadius" fill-opacity=".3" />
			<circle id="connection_tc" :cx="cxT" :cy="cyT" :r="radius" pointer-events="all" />
		</g>
		<g @mousedown="createLine($event, ELineBindAnchors.Left, itemInfo)">
			<circle class="out-circle" :cx="cxL" :cy="cyL" :r="outRadius" fill-opacity=".3" />
			<circle id="connection_l" :cx="cxL" :cy="cyL" :r="radius" :style="{ cursor: 'crosshair' }" pointer-events="all" />
		</g>
		<g @mousedown="createLine($event, ELineBindAnchors.Right, itemInfo)">
			<circle class="out-circle" :cx="cxR" :cy="cyR" :r="outRadius" fill-opacity=".3" />
			<circle id="connection_r" :cx="cxR" :cy="cyR" :r="radius" pointer-events="all" />
		</g>
		<g @mousedown="createLine($event, ELineBindAnchors.BottomCenter, itemInfo)">
			<circle class="out-circle" :cx="cxB" :cy="cyB" :r="outRadius" fill-opacity=".3" />
			<circle id="connection_bc" :cx="cxB" :cy="cyB" :r="radius" pointer-events="all" />
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
