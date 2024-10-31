<script setup lang="ts">
	import { pinia } from '@/hooks'
	import { ElIcon } from 'element-plus'
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

	import type { IDataModel } from '@/components/svg-editor/types'
	import 'element-plus/dist/index.css'
	import 'animate.css'

	import Link from '@/utils/mqtt-net'

	setEditorLoadTime()

	const emit = defineEmits(['onMessage', 'onEvent'])
	const props = withDefaults(
		defineProps<{ vueComp?: Record<string, any>; data?: IDataModel; canvasDrag?: boolean; showCanvasInfo?: boolean }>(),
		{
			canvasDrag: true,
			showCanvasInfo: true
		}
	)

	const link = Link()
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
						url: '',
						user: '',
						pwd: '',
						topics: ''
					}
				}
			},
			done_json: []
		}
	)

	const cursor_style = computed(() => (globalStore.intention == EGlobalStoreIntention.MoveCanvas ? 'grab' : 'default'))
	const onCanvasMouseMove = (e: MouseEvent) => {
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
		const { clientX, clientY } = e
		globalStore.mouse_info.new_position_x = Math.round(clientX / preview_data.config.svg.scale)
		globalStore.mouse_info.new_position_y = Math.round(clientY / preview_data.config.svg.scale)
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
	}

	function onMousewheel(e: any) {
		if (e?.wheelDelta) {
			if (e.wheelDelta > 0) {
				preview_data.config.svg.scale = myFixed(preview_data.config.svg.scale + 0.1, 1)
				getZoomPosition(e, preview_data.config.svg.scale, preview_data.layout_center, true)
			} else {
				preview_data.config.svg.scale = myFixed(preview_data.config.svg.scale - 0.1, 1)
				getZoomPosition(e, preview_data.config.svg.scale, preview_data.layout_center, false)
			}
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
			x: actual_bound.x - (actual_bound.width / 2) * scale_x + actual_bound.width / 2,
			y: actual_bound.y - (actual_bound.height / 2) * scale_y + actual_bound.height / 2,
			width: actual_bound.width * scale_x,
			height: actual_bound.height * scale_y
		}
	}

	const getStyle = (root: IDoneJson) => {
		let t = false
		if (root.events?.length > 0) {
			for (let e of root.events) {
				if (e.type === EEventType.Click) {
					t = true
					break
				}
			}
		}
		return { cursor: t ? 'pointer' : 'default' }
	}
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
		preview_data.layout_center = {
			x: 0,
			y: 0
		}
	}

	const connectNet = () => {
		const m = preview_data.config.net.mqtt
		if (m && m.url && m.user && m.pwd && m.topics) {
			link.sub(m.url, m.user, m.pwd, m.topics, (topics: string, message: string) => {
				console.log(topics)
				console.log(message.toString())
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
	})

	onBeforeUnmount(() => {
		link.close(link.destroy)
	})

	defineExpose({
		setNodeAttrByID
	})
</script>

<template>
	<div
		class="canvas"
		:style="{ backgroundColor: preview_data.config.svg.background_color, position: 'relative' }"
		@mousedown="onCanvasMouseDown"
		@mousemove="onCanvasMouseMove"
		@mouseup="onCanvasMouseUp"
		@mousewheel="onMousewheel"
		@contextmenu="preventDefault"
	>
		<slot name="background" />
		<div class="coverLayer">
			<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
				<g
					:transform="`translate(${preview_data.layout_center.x * preview_data.config.svg.scale},${
						preview_data.layout_center.y * preview_data.config.svg.scale
					})rotate(${0})scale(${preview_data.config.svg.scale})`"
				>
					<g
						v-for="item in preview_data.done_json"
						:key="item.id"
						:transform="`translate(${item.x},${item.y})rotate(0)scale(1)`"
						v-show="item.display"
						:style="getStyle(item)"
						@click="eventHandle(item, EEventType.Click)"
						@mousedown="stopEvent"
						@mousemove="stopEvent"
						@mouseup="stopEvent"
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
									:is="item.tag"
									v-bind="prosToVBind(item, ['height', 'width'])"
									:width="item.props?.width?.val ?? 100"
									:height="item.props?.height?.val ?? 100"
									:id="item.id"
									@on-change="eventHandle(item, EEventType.Change)"
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
										:is="item.tag"
										v-bind="prosToVBind(item)"
										:id="item.id"
										@on-change="eventHandle(item, EEventType.Change)"
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

		<div class="can-not-select canvasInfoTxt" v-show="showCanvasInfo"
			>缩放倍数：{{ preview_data.config.svg.scale }}倍，画布位置：{{ myFixed(preview_data.layout_center.x, 2) }}，{{
				myFixed(preview_data.layout_center.y, 2)
			}}
			<el-icon class="icoP" :size="14" @click="resetCanvas" title="重置位置">
				<Aim />
			</el-icon>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.canvas {
		width: 100%;
		height: 100vh;
		cursor: v-bind('cursor_style');
	}

	.common-ani {
		transform-box: fill-box;
	}
</style>
