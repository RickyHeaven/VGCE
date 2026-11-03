<script setup lang="ts">
	import {
		ElCollapse,
		ElCollapseItem,
		ElForm,
		ElInput,
		ElInputNumber,
		ElSelect,
		ElSwitch
	} from 'element-plus'
	import { Aim } from '@element-plus/icons-vue'
	import VgceIcon from '@/components/vgce-icon.vue'
	import VgceFormItem from '@/components/vgce-form-item.vue'
	import VgceOption from '@/components/vgce-option.vue'
	import VgceColorPicker from '@/components/vgce-color-picker.vue'
	import VgceTabs from '@/components/vgce-tabs.vue'
	import VgceTabPane from '@/components/vgce-tab-pane.vue'
	import { pinia } from '@/hooks'
	import { useConfigStore } from '@/stores/config'
	import { useGlobalStore } from '@/stores/global'
	import { moveAnchors, numberArray, setSvgActualInfo } from '@/utils'
	import type { IDoneJson } from '@/stores/global/types'
	import { EGlobalStoreIntention } from '@/stores/global/types'
	import DynamicElFormItem from './right-panel/dynamic-el-form-item.vue'
	import CommonAnimate from './right-panel/common-animate.vue'
	import ComponentTree from '@/components/svg-editor/component-tree.vue'
	import SvgAnalysis from '@/components/svg-analysis.vue'
	import List from '@/components/svg-editor/right-panel/list.vue'
	import Condition from '@/components/svg-editor/right-panel/condition.vue'
	import CodeEditModal from '@/components/svg-editor/right-panel/code-edit-modal.vue'
	import type { IEventsItem } from '@/config/types'
	import { EConditionType, EDoneJsonType, EEventAction, EEventType } from '@/config/types'
	import { useSvgEditLayoutStore } from '@/stores/svg-edit-layout'
	import BindAnchor from '@/components/svg-editor/right-panel/bind-anchor.vue'
	import { translate } from '@/i18n'

	const configStore = useConfigStore(pinia)
	const globalStore = useGlobalStore(pinia)
	const svgEditLayoutStore = useSvgEditLayoutStore(pinia)

	const props = defineProps<{ slotBackground: boolean }>()
	const activeName = ref('page')
	const activeNameB = ref('style')

	const updateCommonAniVal = (item: IDoneJson | undefined, val: string) => {
		if (item?.common_animations) {
			item.common_animations.val = val
		}
	}

	configStore.$subscribe((mutation, state) => {
		if (mutation.storeId === 'config-store') {
			localStorage.setItem('svg-editor-config', JSON.stringify(state))
		}
	})

	const eventsActive = ref(numberArray(20))
	const netActive = ref(['MQTT'])
	const addEvent = ref()
	addEvent.value = () => {
		let a: IEventsItem = {
			type: EEventType.Null,
			action: EEventAction.Null,
			target: '',
			scripts: '',
			condition: { type: EConditionType.None }
		}

		globalStore.handle_svg_info?.info?.events!.push(a)
	}

	const addEventList = (e: string, item: IEventsItem) => {
		if (e === 'ChangeAttr') {
			item.attrs = [
				{
					key: '',
					val: ''
				}
			]
		} else {
			delete item.attrs
		}
	}

	const deleteE = (i: number) => {
		globalStore.handle_svg_info?.info?.events!.splice(i, 1)
	}

	const resetCanvas = () => {
		svgEditLayoutStore.center_offset = {
			x: 0,
			y: 0
		}
	}

	/**
	 * 右侧属性更改，改变画布中对应组件
	 * @param cur 当前值
	 * @param pre 之前的值
	 * @param resize 是否重新获取边框大小
	 */
	const changHandle = (cur: any, pre: any, resize?: boolean) => {
		nextTick(function () {
			if (globalStore.handle_svg_info) {
				const done_json = globalStore.done_json[globalStore.handle_svg_info.index]
				if (resize) {
					setSvgActualInfo(done_json, resize)
				} else {
					setSvgActualInfo(done_json)
				}
				moveAnchors(done_json)
			}
		})
	}
</script>

<template>
	<vgce-tabs class="mx-2 rightTabs" v-if="globalStore.intention != EGlobalStoreIntention.Select" v-model="activeName">
		<vgce-tab-pane :label="translate('图纸')" name="page">
			<el-form label-width="auto" label-position="left">
				<vgce-form-item :label="translate('背景色')" size="small" v-if="!props.slotBackground">
					<vgce-color-picker v-model="configStore.svg.background_color" />
				</vgce-form-item>
				<vgce-form-item :label="translate('画布')" size="small">
					<button type="button" class="vgce-btn vgce-btn--sm" @click="resetCanvas"
						><vgce-icon><Aim /></vgce-icon>{{ translate('重置位置') }}</button
					>
				</vgce-form-item>
				<vgce-form-item :label="translate('X轴偏移')" size="small">
					<el-input-number v-model="svgEditLayoutStore.center_offset.x" />
				</vgce-form-item>
				<vgce-form-item :label="translate('Y轴偏移')" size="small">
					<el-input-number v-model="svgEditLayoutStore.center_offset.y" />
				</vgce-form-item>
				<vgce-form-item :label="translate('缩放')" size="small">
					<el-input-number v-model="configStore.svg.scale" :step="0.1" step-strictly />
				</vgce-form-item>
				<vgce-form-item :label="translate('标尺')" size="small">
					<el-switch v-model="configStore.svg.ruler" />
				</vgce-form-item>
				<vgce-form-item :label="translate('网格')" size="small">
					<el-switch v-model="configStore.svg.grid" />
				</vgce-form-item>
				<vgce-form-item :label="translate('网格颜色')" size="small" v-if="configStore.svg.grid">
					<vgce-color-picker v-model="configStore.svg.grid_color" />
				</vgce-form-item>
			</el-form>
		</vgce-tab-pane>
		<vgce-tab-pane :label="translate('连线')" name="line">
			<el-form label-width="auto" label-position="left" v-if="configStore.connection_line.props">
				<dynamic-el-form-item :obj-info="configStore.connection_line.props" :hide="['point_position']" />
			</el-form>
			<el-form label-width="auto" label-position="left" v-if="configStore.connection_line.animations">
				<vgce-form-item :label="translate(configStore.connection_line.animations.type.title)" size="small">
					<el-select v-model="configStore.connection_line.animations.type.val" placeholder="Select" size="small">
						<vgce-option
							v-for="item in configStore.connection_line.animations.type.options"
							:key="item.value"
							:label="translate(item.label)"
							:value="item.value"
						/>
					</el-select>
				</vgce-form-item>

				<dynamic-el-form-item
					:obj-info="configStore.connection_line.animations"
					v-if="configStore.connection_line.animations.type.val !== 'None'"
					:hide="['type', 'repeatCount']"
				/>
			</el-form>
		</vgce-tab-pane>
		<vgce-tab-pane :label="translate('通信')" name="net">
			<el-collapse v-model="netActive">
				<el-collapse-item name="MQTT">
					<template #title>
						<span style="font-weight: bold">MQTT</span>
					</template>
					<el-form label-width="auto" label-position="left">
						<vgce-form-item :label="translate('外部配置')" size="small">
							<el-switch v-model="configStore.net.mqtt.useGlobalMqtt" /><span style="color: #999"
								>{{ translate('（开启后这里无需配置）') }}</span
							>
						</vgce-form-item>
						<vgce-form-item label="URL" size="small" v-if="!configStore.net.mqtt.useGlobalMqtt">
							<el-input v-model="configStore.net.mqtt.url" :placeholder="translate('如 ws://127.0.0.1:4500')" />
						</vgce-form-item>
						<vgce-form-item :label="translate('用户名')" size="small" v-if="!configStore.net.mqtt.useGlobalMqtt">
							<el-input v-model="configStore.net.mqtt.user" placeholder="username" />
						</vgce-form-item>
						<vgce-form-item :label="translate('密码')" size="small" v-if="!configStore.net.mqtt.useGlobalMqtt">
							<el-input v-model="configStore.net.mqtt.pwd" placeholder="password" />
						</vgce-form-item>
						<vgce-form-item label="Topics" size="small" v-if="!configStore.net.mqtt.useGlobalMqtt">
							<el-input v-model="configStore.net.mqtt.topics" placeholder="topics" />
						</vgce-form-item>
					</el-form>
				</el-collapse-item>
			</el-collapse>
		</vgce-tab-pane>
		<vgce-tab-pane :label="translate('结构')" name="tree">
			<component-tree />
		</vgce-tab-pane>
	</vgce-tabs>
	<vgce-tabs
		class="mx-2 rightTabs"
		v-else-if="globalStore.intention == EGlobalStoreIntention.Select && globalStore.handle_svg_info"
		v-model="activeNameB"
	>
		<vgce-tab-pane :label="translate('外观')" name="style">
			<el-form label-width="auto" label-position="left">
				<vgce-form-item :label="translate('标题')" size="small">
					<el-input v-model="globalStore.handle_svg_info!.info.title" />
				</vgce-form-item>
				<vgce-form-item :label="translate('X坐标')" size="small">
					<el-input-number v-model="globalStore.handle_svg_info!.info.x" @change="changHandle" />
				</vgce-form-item>
				<vgce-form-item :label="translate('Y坐标')" size="small">
					<el-input-number v-model="globalStore.handle_svg_info!.info.y" @change="changHandle" />
				</vgce-form-item>
				<vgce-form-item :label="translate('X缩放')" size="small" v-show="globalStore.handle_svg_info?.info?.config.can_zoom">
					<el-input-number v-model="globalStore.handle_svg_info!.info.scale_x" @change="changHandle" />
				</vgce-form-item>
				<vgce-form-item :label="translate('Y缩放')" size="small" v-show="globalStore.handle_svg_info?.info?.config.can_zoom">
					<el-input-number v-model="globalStore.handle_svg_info!.info.scale_y" @change="changHandle" />
				</vgce-form-item>
				<vgce-form-item :label="translate('旋转')" size="small">
					<el-input-number v-model="globalStore.handle_svg_info!.info.rotate" @change="changHandle" />
				</vgce-form-item>
				<vgce-form-item :label="translate('显示')" size="small">
					<el-switch v-model="globalStore.handle_svg_info!.info.display" />
				</vgce-form-item>
			</el-form>
		</vgce-tab-pane>
		<vgce-tab-pane :label="translate('数据')" name="data">
			<el-form label-width="auto" label-position="left">
				<!--ID-->
				<vgce-form-item label="ID" size="small">
					<el-input v-model="globalStore.handle_svg_info!.info.id" />
				</vgce-form-item>
				<!--state-->
				<vgce-form-item class="props-row" label="state" size="small" v-if="globalStore.handle_svg_info?.info?.state">
					{{ globalStore.handle_svg_info!.info!.defaultState }}
				</vgce-form-item>
				<vgce-form-item v-if="globalStore.handle_svg_info?.info?.state" :label="translate('状态')" size="small">
					<el-select v-model="globalStore.handle_svg_info!.info!.defaultState" placeholder="Select" size="small">
						<vgce-option
							v-for="(e, k) of globalStore.handle_svg_info!.info.state"
							:key="'state' + String(k)"
							:label="translate(e.label)"
							:value="k"
						/>
					</el-select>
				</vgce-form-item>
				<!--文字插槽-->
				<div v-if="globalStore.handle_svg_info!.info?.hasOwnProperty('tag_slot')">
					<vgce-form-item class="props-row" label="tag_slot" size="small">
						{{ globalStore.handle_svg_info!.info.tag_slot }}
					</vgce-form-item>
					<vgce-form-item :label="translate('文字插槽')" size="small">
						<el-input v-model="globalStore.handle_svg_info!.info.tag_slot" @input="changHandle($event, null, true)" />
					</vgce-form-item>
				</div>
				<!--props-->
				<dynamic-el-form-item
					:obj-info="globalStore.handle_svg_info!.info.props"
					code
					@change="changHandle($event, null, true)"
				/>
				<!--连线动画效果-->
				<vgce-form-item
					:label="translate(globalStore.handle_svg_info!.info.animations.type.title)"
					size="small"
					v-if="globalStore.handle_svg_info!.info.animations"
				>
					<el-select v-model="globalStore.handle_svg_info!.info.animations.type.val" placeholder="Select" size="small">
						<vgce-option
							v-for="item in globalStore.handle_svg_info!.info.animations.type.options"
							:key="item.value"
							:label="translate(item.label)"
							:value="item.value"
						/>
					</el-select>
				</vgce-form-item>

				<dynamic-el-form-item
					:obj-info="globalStore.handle_svg_info!.info.animations"
					v-if="globalStore.handle_svg_info!.info.animations?.type?.val !== 'None'"
					:hide="['type', 'repeatCount']"
				/>
				<bind-anchor
					v-if="globalStore.handle_svg_info?.info.type === EDoneJsonType.ConnectionLine"
					v-model="globalStore.handle_svg_info!.info!.bind_anchors!.start"
					:title="translate('绑定起点')"
				/>
				<bind-anchor
					v-if="globalStore.handle_svg_info?.info.type === EDoneJsonType.ConnectionLine"
					v-model="globalStore.handle_svg_info!.info!.bind_anchors!.end"
					:title="translate('绑定终点')"
				/>
			</el-form>
		</vgce-tab-pane>
		<vgce-tab-pane :label="translate('事件')" name="event">
			<button type="button" class="vgce-btn vgce-btn--primary" style="width: 100%" @click="addEvent">{{ translate('添加事件') }}</button>
			<el-collapse v-model="eventsActive">
				<el-collapse-item :name="i" v-for="(item, i) in globalStore.handle_svg_info!.info!.events" :key="'event' + i">
					<template #title>
						<div class="events-title">
							<span>{{ translate('事件') }}{{ i + 1 }}</span>
							<vgce-icon :size="16" class="bt-Icon" @click.stop="deleteE(i)">
								<svg-analysis name="delete" />
							</vgce-icon>
						</div>
					</template>
					<el-form label-width="auto" label-position="left">
						<vgce-form-item :label="translate('类型')" size="small">
							<el-select v-model="item.type">
								<vgce-option value="Click" :label="translate('点击')" />
								<vgce-option value="Change" :label="translate('值改变')" />
							</el-select>
						</vgce-form-item>
						<vgce-form-item :label="translate('行为')" size="small">
							<el-select v-model="item.action" @change="addEventList($event, item)">
								<vgce-option value="ChangeAttr" :label="translate('改变属性')" />
								<vgce-option value="JavaScript" :label="translate('执行 JavaScript')" />
								<vgce-option value="Emit" :label="translate('emit 事件')" />
							</el-select>
						</vgce-form-item>

						<vgce-form-item :label="translate('目标')" size="small" v-if="item.action === 'ChangeAttr'">
							<el-input v-model="item.target" :placeholder="translate('默认自身')" />
						</vgce-form-item>
						<list v-if="item.action === 'ChangeAttr'" v-model="item.attrs" />

						<vgce-form-item label="JavaScript" size="small" v-if="item.action === 'JavaScript'">
							<code-edit-modal v-model="item.scripts" lang="text" />
						</vgce-form-item>
						<condition v-model="item.condition" />
					</el-form>
				</el-collapse-item>
			</el-collapse>
		</vgce-tab-pane>
		<vgce-tab-pane :label="translate('动效')" name="animation">
			<el-form label-width="auto" label-position="left" v-if="globalStore.handle_svg_info?.info.animations">
				<dynamic-el-form-item :obj-info="globalStore.handle_svg_info!.info.animations"></dynamic-el-form-item>
			</el-form>
			<el-form label-width="auto" label-position="left" v-else-if="globalStore.handle_svg_info!.info.common_animations">
				<vgce-form-item :label="translate('动画效果')" size="small">
					<common-animate
						@update-common-ani-val="(val: string) => updateCommonAniVal(globalStore.handle_svg_info?.info, val)"
						:val="globalStore.handle_svg_info!.info.common_animations.val"
					></common-animate>
				</vgce-form-item>
				<vgce-form-item :label="translate('延迟')" size="small">
					<el-select v-model="globalStore.handle_svg_info!.info.common_animations.delay">
						<vgce-option value="delay-0s" :label="translate('无')" />
						<vgce-option value="delay-1s" :label="translate('1秒')" />
						<vgce-option value="delay-2s" :label="translate('2秒')" />
						<vgce-option value="delay-3s" :label="translate('3秒')" />
						<vgce-option value="delay-4s" :label="translate('4秒')" />
						<vgce-option value="delay-5s" :label="translate('5秒')" />
					</el-select>
				</vgce-form-item>
				<vgce-form-item :label="translate('动画速度')" size="small">
					<el-select v-model="globalStore.handle_svg_info!.info.common_animations.speed">
						<vgce-option value="slow" :label="translate('慢')" />
						<vgce-option value="slower" :label="translate('最慢')" />
						<vgce-option value="fast" :label="translate('快')" />
						<vgce-option value="faster" :label="translate('最快')" />
					</el-select>
				</vgce-form-item>
				<vgce-form-item :label="translate('循环次数')" size="small">
					<el-select v-model="globalStore.handle_svg_info!.info.common_animations.repeat">
						<vgce-option value="repeat-1" :label="translate('一次')" />
						<vgce-option value="repeat-2" :label="translate('两次')" />
						<vgce-option value="repeat-3" :label="translate('三次')" />
						<vgce-option value="infinite" :label="translate('无限次')" />
					</el-select>
				</vgce-form-item>
			</el-form>
		</vgce-tab-pane>
		<vgce-tab-pane :label="translate('结构')" name="tree">
			<component-tree />
		</vgce-tab-pane>
	</vgce-tabs>
</template>

<style scoped lang="less">
	.events-title {
		width: calc(~'100% - 28px');
		display: flex;
		align-items: center;

		> span {
			font-weight: bold;
		}

		> i {
			margin-left: 15px;
		}
	}
</style>

<style lang="less">
	.rightTabs {
		.vgce-tabs__nav {
			flex-wrap: wrap;
		}

		.vgce-tabs__nav .vgce-tabs__item {
			padding: 0 10px;
			white-space: nowrap;
		}

		.vgce-tabs__content {
			padding-top: 12px;
		}

		.el-form-item__label {
			flex-shrink: 0;
			white-space: nowrap;
		}

		.el-form-item__content {
			min-width: 0;
		}

		.el-input-number {
			width: 100%;
			max-width: 150px;
		}
	}
</style>