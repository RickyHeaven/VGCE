<script setup lang="ts">
	import {
		ElCollapse,
		ElCollapseItem,
		ElColorPicker,
		ElForm,
		ElFormItem,
		ElIcon,
		ElInput,
		ElInputNumber,
		ElOption,
		ElSelect,
		ElSwitch,
		ElTabPane,
		ElTabs
	} from 'element-plus'
	import { ref } from 'vue'
	import { pinia } from '@/hooks'
	import { useConfigStore } from '@/stores/config'
	import { useGlobalStore } from '@/stores/global'
	import { numberArray } from '@/utils'
	import { EGlobalStoreIntention } from '@/stores/global/types'
	import type { IDoneJson } from '@/stores/global/types'
	import DynamicElFormItem from './dynamic-el-form-item.vue'
	import CommonAnimate from './common-animate.vue'
	import ComponentTree from '@/components/svg-editor/component-tree/index.vue'
	import SvgAnalysis from '@/components/svg-analysis/index.vue'
	import List from '@/components/svg-editor/right-panel/list.vue'
	import Condition from '@/components/svg-editor/right-panel/condition.vue'
	import { ElButton } from 'element-plus'
	import CodeEditModal from '@/components/svg-editor/right-panel/code-edit-modal.vue'
	import { EConditionType, EEventAction, EEventType } from '@/config/types'
	import type { IEventsItem } from '@/config/types'

	const configStore = useConfigStore(pinia)
	const globalStore = useGlobalStore(pinia)

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
</script>

<template>
	<el-tabs class="mx-2 rightTabs" v-if="globalStore.intention != EGlobalStoreIntention.Select" v-model="activeName">
		<el-tab-pane label="图纸" name="page">
			<el-form label-width="60px" label-position="left">
				<el-form-item label="背景色" size="small">
					<el-color-picker v-model="configStore.svg.background_color" />
				</el-form-item>
				<el-form-item label="x原点" size="small">
					<el-input-number v-model="configStore.svg.position_center.x" />
				</el-form-item>
				<el-form-item label="y原点" size="small">
					<el-input-number v-model="configStore.svg.position_center.y" />
				</el-form-item>
				<el-form-item label="网格" size="small">
					<el-switch v-model="configStore.svg.grid" />
				</el-form-item>
				<el-form-item label="标尺" size="small">
					<el-switch v-model="configStore.svg.ruler" />
				</el-form-item>
				<el-form-item label="缩放" size="small">
					<el-input-number v-model="configStore.svg.scale" :step="0.1" step-strictly />
				</el-form-item>
			</el-form>
		</el-tab-pane>
		<el-tab-pane label="通信" name="net">
			<el-collapse v-model="netActive">
				<el-collapse-item name="MQTT">
					<template #title>
						<span style="font-weight: bold">MQTT</span>
					</template>
					<el-form label-width="60px" label-position="left">
						<el-form-item label="URL" size="small">
							<el-input v-model="configStore.net.mqtt.url" placeholder="如 ws://127.0.0.1:4500" />
						</el-form-item>
						<el-form-item label="用户名" size="small">
							<el-input v-model="configStore.net.mqtt.user" placeholder="username" />
						</el-form-item>
						<el-form-item label="密码" size="small">
							<el-input v-model="configStore.net.mqtt.pwd" placeholder="password" />
						</el-form-item>
						<el-form-item label="Topics" size="small">
							<el-input v-model="configStore.net.mqtt.topics" placeholder="topics" />
						</el-form-item>
					</el-form>
				</el-collapse-item>
			</el-collapse>
		</el-tab-pane>
		<el-tab-pane label="连线" name="line">
			<el-form label-width="60px" label-position="left" v-if="configStore.connection_line.props">
				<dynamic-el-form-item :obj-info="configStore.connection_line.props" :hide="['point_position']" />
			</el-form>
			<el-form label-width="60px" label-position="left" v-if="configStore.connection_line.animations">
				<dynamic-el-form-item :obj-info="configStore.connection_line.animations" />
			</el-form>
		</el-tab-pane>
		<el-tab-pane label="结构" name="tree">
			<component-tree />
		</el-tab-pane>
	</el-tabs>
	<el-tabs
		class="mx-2 rightTabs"
		v-else-if="globalStore.intention == EGlobalStoreIntention.Select && globalStore.handle_svg_info"
		v-model="activeNameB"
	>
		<el-tab-pane label="外观" name="style">
			<el-form label-width="60px" label-position="left">
				<el-form-item label="标题" size="small">
					<el-input v-model="globalStore.handle_svg_info!.info.title" />
				</el-form-item>
				<el-form-item label="x坐标" size="small">
					<el-input-number v-model="globalStore.handle_svg_info!.info.x" />
				</el-form-item>
				<el-form-item label="y坐标" size="small">
					<el-input-number v-model="globalStore.handle_svg_info!.info.y" />
				</el-form-item>
				<el-form-item label="显示" size="small">
					<el-switch v-model="globalStore.handle_svg_info!.info.display" />
				</el-form-item>
			</el-form>
		</el-tab-pane>
		<el-tab-pane label="事件" name="event">
			<el-button type="primary" style="width: 100%" @click="addEvent">添加事件</el-button>
			<el-collapse v-model="eventsActive">
				<el-collapse-item :name="i" v-for="(item, i) in globalStore.handle_svg_info!.info!.events" :key="'event' + i">
					<template #title>
						<div class="events-title">
							<span>事件{{ i + 1 }}</span>
							<el-icon :size="16" class="bt-Icon" @click.stop="deleteE(i)">
								<svg-analysis name="delete" />
							</el-icon>
						</div>
					</template>
					<el-form label-width="90px" label-position="left">
						<el-form-item label="类型" size="small">
							<el-select v-model="item.type">
								<el-option value="Click" label="点击" />
								<el-option value="Change" label="值改变" />
							</el-select>
						</el-form-item>
						<el-form-item label="行为" size="small">
							<el-select v-model="item.action" @change="addEventList($event, item)">
								<el-option value="ChangeAttr" label="改变属性" />
								<el-option value="JavaScript" label="执行JavaScript" />
							</el-select>
						</el-form-item>

						<el-form-item label="目标" size="small" v-if="item.action === 'ChangeAttr'">
							<el-input v-model="item.target" placeholder="默认自身" />
						</el-form-item>
						<list v-if="item.action === 'ChangeAttr'" v-model="item.attrs" />

						<el-form-item label="JavaScript" size="small" v-if="item.action === 'JavaScript'">
							<code-edit-modal v-model="item.scripts" lang="javascript" />
						</el-form-item>
						<condition v-model="item.condition" />
					</el-form>
				</el-collapse-item>
			</el-collapse>
		</el-tab-pane>
		<el-tab-pane label="动效" name="animation">
			<el-form label-width="60px" label-position="left" v-if="globalStore.handle_svg_info?.info.animations">
				<dynamic-el-form-item :obj-info="globalStore.handle_svg_info!.info.animations"></dynamic-el-form-item>
			</el-form>
			<el-form label-width="60px" label-position="left" v-else-if="globalStore.handle_svg_info!.info.common_animations">
				<el-form-item label="动画效果" size="small">
					<common-animate
						@update-common-ani-val="(val: string) => updateCommonAniVal(globalStore.handle_svg_info?.info, val)"
						:val="globalStore.handle_svg_info!.info.common_animations.val"
					></common-animate>
				</el-form-item>
				<el-form-item label="延迟" size="small">
					<el-select v-model="globalStore.handle_svg_info!.info.common_animations.delay">
						<el-option value="delay-0s" label="无" />
						<el-option value="delay-1s" label="1秒" />
						<el-option value="delay-2s" label="2秒" />
						<el-option value="delay-3s" label="3秒" />
						<el-option value="delay-4s" label="4秒" />
						<el-option value="delay-5s" label="5秒" />
					</el-select>
				</el-form-item>
				<el-form-item label="动画速度" size="small">
					<el-select v-model="globalStore.handle_svg_info!.info.common_animations.speed">
						<el-option value="slow" label="慢" />
						<el-option value="slower" label="最慢" />
						<el-option value="fast" label="快" />
						<el-option value="faster" label="最快" />
					</el-select>
				</el-form-item>
				<el-form-item label="循环次数" size="small">
					<el-select v-model="globalStore.handle_svg_info!.info.common_animations.repeat">
						<el-option value="repeat-1" label="一次" />
						<el-option value="repeat-2" label="两次" />
						<el-option value="repeat-3" label="三次" />
						<el-option value="infinite" label="无限次" />
					</el-select>
				</el-form-item>
			</el-form>
		</el-tab-pane>
		<el-tab-pane label="数据" name="data">
			<el-form label-width="90px" label-position="left">
				<el-form-item label="ID" size="small">
					<el-input v-model="globalStore.handle_svg_info!.info.id" />
				</el-form-item>
				<div
					v-for="(e, k) in globalStore.handle_svg_info!.info.state"
					:key="'state' + k"
					v-if="globalStore.handle_svg_info!.info.state"
				>
					<el-form-item class="props-row" :label="String(k)" size="small"> {{ e?.default }}</el-form-item>

					<el-form-item
						v-if="k === 'OnOff'"
						:label="globalStore.handle_svg_info!.info.state?.OnOff!.title"
						size="small"
					>
						<el-switch v-model="globalStore.handle_svg_info!.info.state!.OnOff!.default"></el-switch>
					</el-form-item>
				</div>

				<div v-if="globalStore.handle_svg_info!.info?.hasOwnProperty('tag_slot')">
					<el-form-item class="props-row" label="tag_slot" size="small">
						{{ globalStore.handle_svg_info!.info.tag_slot }}
					</el-form-item>
					<el-form-item label="文字插槽" size="small">
						<el-input v-model="globalStore.handle_svg_info!.info.tag_slot" />
					</el-form-item>
				</div>
				<dynamic-el-form-item :obj-info="globalStore.handle_svg_info!.info.props" code />
			</el-form>
		</el-tab-pane>
		<el-tab-pane label="结构" name="tree">
			<component-tree />
		</el-tab-pane>
	</el-tabs>
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
		.el-tabs__item {
			padding: 0 10px;
		}
	}
</style>
