<script setup lang="ts">
	import { EMouseInfoState, EGlobalStoreIntention } from '@/stores/global/types'
	import type { IDoneJson } from '@/stores/global/types'
	import { positionArrToPath } from '@/utils'
	import { pinia } from '@/hooks'
	import { useGlobalStore } from '@/stores/global'
	import { EConfigAnimationsType } from '@/config/types'
	import { useConfigStore } from '@/stores/config'
	import { useSvgEditLayoutStore } from '@/stores/svg-edit-layout'

	const props = withDefaults(defineProps<{ itemInfo: IDoneJson; pointVisible: boolean }>(), { pointVisible: false })
	const globalStore = useGlobalStore(pinia)
	const configStore = useConfigStore(pinia)
	const svgEditLayoutStore = useSvgEditLayoutStore(pinia)
	const setConnectionLineNode = (point_index: number, e: MouseEvent, x: number, y: number) => {
		if (globalStore.intention === EGlobalStoreIntention.Connection) {
			return
		}
		globalStore.setHandleSvgInfo(props.itemInfo)
		const { clientX, clientY } = e
		e.stopPropagation()
		globalStore.connection_line_node_info = {
			init_pos: {
				x,
				y
			},
			point_index: point_index
		}
		globalStore.intention = EGlobalStoreIntention.SetConnectionLineNode
		globalStore.mouse_info = {
			state: EMouseInfoState.Down,
			position_x: Math.round((clientX - svgEditLayoutStore.canvasInfo.left) / configStore.svg.scale),
			position_y: Math.round((clientY - svgEditLayoutStore.canvasInfo.top) / configStore.svg.scale),
			now_position_x: 0,
			now_position_y: 0,
			new_position_x: 0,
			new_position_y: 0
		}
	}
</script>

<template>
	<g>
		<path
			:id="props.itemInfo.id"
			:d="positionArrToPath(props.itemInfo.props.point_position.val)"
			fill="none"
			:stroke="
				props.itemInfo.animations?.type.val === EConfigAnimationsType.Electricity
					? props.itemInfo.animations.color.val
					: props.itemInfo.props.stroke.val
			"
			:stroke-width="props.itemInfo.props['stroke-width'].val"
			:style="{ cursor: globalStore.intention === EGlobalStoreIntention.Connection ? 'crosshair' : 'move' }"
			stroke-dashoffset="0"
			:stroke-dasharray="
				props.itemInfo.animations?.type.val === EConfigAnimationsType.Electricity
					? props.itemInfo.props['stroke-width'].val * 3
					: 0
			"
		>
			<animate
				v-if="props.itemInfo.animations?.type.val === EConfigAnimationsType.Electricity"
				attributeName="stroke-dashoffset"
				:from="props.itemInfo.animations.reverse.val ? 0 : 1000"
				:to="props.itemInfo.animations.reverse.val ? 1000 : 0"
				:dur="`${props.itemInfo.animations.dur.val}s`"
				:repeatCount="props.itemInfo.animations.repeatCount.val"
			/>
		</path>
		<!-- 水珠 -->
		<path
			v-if="props.itemInfo.animations?.type.val === EConfigAnimationsType.WaterDrop"
			:d="positionArrToPath(props.itemInfo.props.point_position.val)"
			fill="none"
			fill-opacity="0"
			:stroke="props.itemInfo.animations.color.val"
			:stroke-width="props.itemInfo.props['stroke-width'].val"
			:stroke-dasharray="props.itemInfo.props['stroke-width'].val * 3"
			stroke-dashoffset="0"
			stroke-linecap="round"
		>
			<animate
				attributeName="stroke-dashoffset"
				:from="props.itemInfo.animations.reverse.val ? 0 : 1000"
				:to="props.itemInfo.animations.reverse.val ? 1000 : 0"
				:dur="`${props.itemInfo.animations.dur.val}s`"
				:repeatCount="props.itemInfo.animations.repeatCount.val"
				fill="freeze"
			/>
		</path>
		<!-- 轨迹 -->
		<circle
			v-else-if="props.itemInfo.animations?.type.val === EConfigAnimationsType.Track"
			cx="0"
			cy="0"
			:r="props.itemInfo.props['stroke-width'].val * 2"
			:fill="props.itemInfo.animations.color.val"
		>
			<animateMotion
				:path="
					positionArrToPath(
						props.itemInfo.animations.reverse.val
							? [...props.itemInfo.props.point_position.val].reverse()
							: props.itemInfo.props.point_position.val
					)
				"
				:dur="`${props.itemInfo.animations.dur.val}s`"
				:repeatCount="props.itemInfo.animations.repeatCount.val"
			>
			</animateMotion>
		</circle>
		<!-- 更改线段 -->
		<g>
			<circle
				v-for="(item, index) in props.itemInfo.props.point_position.val"
				:key="index"
				:cx="item.x"
				:cy="item.y"
				r="6"
				stroke-width="1"
				:stroke="props.itemInfo.props.stroke.val"
				fill="#fff"
				style="cursor: pointer"
				@mousedown="setConnectionLineNode(index, $event, item.x, item.y)"
			/>
		</g>
	</g>
</template>
