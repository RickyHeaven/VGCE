<script setup lang="ts">
	import { getCurrentInstance, onMounted, onBeforeUnmount, reactive } from 'vue'
	import { pinia } from '@/hooks'
	import { useGlobalStore } from '@/stores/global'
	import { EGlobalStoreIntention, EMouseInfoState } from '@/stores/global/types'
	import type { IDoneJson } from '@/stores/global/types'
	import { getCommonClass, prosToVBind, setArrItemByID, valFormat } from '@/utils'

	import { EDoneJsonType, EEventAction, EEventType } from '@/config/types'
	import ConnectionLine from '@/components/svg-editor/connection-line/index.vue'

	import { vueComp } from '@/config'
	import type { IDataModel } from '@/components/svg-editor/types'
	import 'element-plus/dist/index.css'
	import 'animate.css'

	import { sub, close } from '@/utils/mqtt-net'

	//注册所有组件
	const instance = getCurrentInstance()
	Object.keys(vueComp).forEach((key: string) => {
		if (!Object.keys(instance?.appContext?.components as any).includes(key)) {
			// @ts-ignore
			instance?.appContext.app.component(key, vueComp[key])
		}
	})
	const props = withDefaults(defineProps<{ data?: IDataModel; canvasDrag?: boolean }>(), {
		canvasDrag: true
	})
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
					position_center: {
						x: -333,
						y: -113
					},
					svg_position_center: {
						x: 50,
						y: 50
					}
				},
				net: { mqtt: { url: '', user: '', pwd: '', topics: '' } }
			},
			done_json: []
		}
	)
	const globalStore = useGlobalStore(pinia)

	const onCanvasMouseMove = (e: MouseEvent) => {
		//如果鼠标不是按下状态 连线除外
		if (
			globalStore.mouse_info.state != EMouseInfoState.Down &&
			globalStore.intention !== EGlobalStoreIntention.Connection
		) {
			return
		}
		if (!props.canvasDrag) {
			console.log(props.canvasDrag)
			return
		}
		const { clientX, clientY } = e
		globalStore.mouse_info.new_position_x =
			globalStore.mouse_info.now_position_x + clientX - globalStore.mouse_info.position_x
		globalStore.mouse_info.new_position_y =
			globalStore.mouse_info.now_position_y + clientY - globalStore.mouse_info.position_y
		if (globalStore.intention == EGlobalStoreIntention.MoveCanvas) {
			//移动画布
			preview_data.layout_center.x = globalStore.mouse_info.new_position_x
			preview_data.layout_center.y = globalStore.mouse_info.new_position_y
		}
	}
	const onCanvasMouseUp = () => {
		//如果鼠标不是按下状态
		if (globalStore.mouse_info.state != EMouseInfoState.Down) {
			return
		}
		if (globalStore.intention != EGlobalStoreIntention.Select) {
			globalStore.intention = EGlobalStoreIntention.None
		}
		globalStore.setMouseInfo({
			state: EMouseInfoState.Up,
			position_x: 0,
			position_y: 0,
			now_position_x: 0,
			now_position_y: 0,
			new_position_x: 0,
			new_position_y: 0
		})
	}
	const onCanvasMouseDown = (e: MouseEvent) => {
		console.log('onCanvasMouseDown', e)
		const { clientX, clientY } = e
		//点击画布 未选中组件 拖动画布
		globalStore.intention = EGlobalStoreIntention.MoveCanvas
		globalStore.setMouseInfo({
			state: EMouseInfoState.Down,
			position_x: clientX,
			position_y: clientY,
			now_position_x: preview_data.layout_center.x,
			now_position_y: preview_data.layout_center.y,
			new_position_x: preview_data.layout_center.x,
			new_position_y: preview_data.layout_center.y
		})
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
			x: actual_bound.x - (actual_bound.width / 2) * scale_x + actual_bound.width / 2,
			y: actual_bound.y - (actual_bound.height / 2) * scale_y + actual_bound.height / 2,
			width: actual_bound.width * scale_x,
			height: actual_bound.height * scale_y
		}
	}
	const setNodeAttrByID = (id: string, attr: string, val: any) => {
		return setArrItemByID(id, attr, val, preview_data.done_json)
	}
	const eventHandle = (root: IDoneJson) => {
		if (root.events?.length > 0) {
			for (let e of root.events) {
				if (e.type === EEventType.Click || e.type === EEventType.Change) {
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
								for (let item of globalStore.done_json) {
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
								if (t.state && t.state.hasOwnProperty(a.key)) {
									t.state[a.key].default = valFormat(a.val)
								} else if (t.props.hasOwnProperty(a.key)) {
									t.props[a.key].val = valFormat(a.val)
								}
							}
						}
					} else if (e.action === EEventAction.JavaScript) {
						const t = new Function(e.scripts)
						t()
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

	onMounted(() => {
		connectNet()
	})

	onBeforeUnmount(close)

	const connectNet = () => {
		const m = preview_data.config.net.mqtt
		if (m && m.url && m.user && m.pwd && m.topics) {
			sub(m.url, m.user, m.pwd, m.topics, (topics: string, message: string) => {
				console.log(topics)
				console.log(message.toString())
			})
		}
	}

	defineExpose({
		setNodeAttrByID
	})
</script>

<template>
	<div class="canvas" @mousedown="onCanvasMouseDown" @mousemove="onCanvasMouseMove" @mouseup="onCanvasMouseUp">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			:style="{ backgroundColor: preview_data.config.svg.background_color }"
			width="100%"
			height="100%"
		>
			<g
				:transform="`translate(${preview_data.config.svg.position_center.x + preview_data.layout_center.x},${
					preview_data.config.svg.position_center.y + preview_data.layout_center.y
				})rotate(${0})scale(${preview_data.config.svg.scale})`"
			>
				<g
					v-for="item in preview_data.done_json"
					:key="item.id"
					:transform="`translate(${item.x},${item.y})rotate(0)scale(1)`"
					v-show="item.display"
					@click="eventHandle(item)"
				>
					<g :class="`${getCommonClass(item)}`">
						<g
							:transform="`translate(${item.actual_bound.x + item.actual_bound.width / 2},${
								item.actual_bound.y + item.actual_bound.height / 2
							})rotate(${item.rotate}) scale(1) translate(${-(item.actual_bound.x + item.actual_bound.width / 2)},${-(
								item.actual_bound.y +
								item.actual_bound.height / 2
							)})`"
						>
							<connection-line v-if="item.type === EDoneJsonType.ConnectionLine" :item-info="item" />
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
								@on-change="eventHandle(item)"
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
									@on-change="eventHandle(item)"
									:transform="`translate(${item.actual_bound.x + item.actual_bound.width / 2},${
										item.actual_bound.y + item.actual_bound.height / 2
									}) scale(${item.scale_x},${item.scale_y}) translate(${-(
										item.actual_bound.x +
										item.actual_bound.width / 2
									)},${-(item.actual_bound.y + item.actual_bound.height / 2)})`"
									>{{ item.tag_slot }}
								</component>
							</foreignObject>
						</g>
					</g>
				</g>
			</g>
		</svg>
	</div>
</template>

<style lang="less" scoped>
	.canvas {
		width: 100%;
		height: 100vh;
	}

	.svg-item-none {
		cursor: move;

		&:hover {
			outline: 1px solid #0cf;
		}
	}

	.svg-item-move {
		cursor: move;
		outline: 1px dashed rgb(23, 222, 30);
	}

	.svg-item-select {
		cursor: move;
		outline: 1px solid rgb(23, 222, 30);
	}

	.common-ani {
		transform-box: fill-box;
	}
</style>
