<!--左侧工具栏-->
<script lang="ts" setup>
	import { isEmpty } from 'lodash-es'
	import { ElCollapse, ElCollapseItem, ElIcon, ElMessage } from 'element-plus'
	import type { IConfig, IConfigItem } from '@/config/types'
	import { pinia } from '@/hooks'
	import { useGlobalStore } from '@/stores/global'
	import SvgAnalysis from '@/components/svg-analysis.vue'
	import { EGlobalStoreIntention } from '@/stores/global/types'
	import { prosToVBind } from '@/utils'

	const globalStore = useGlobalStore(pinia)
	const props = defineProps<{ customToolbar: IConfig | undefined }>()
	const left_tool_bar = ref(
		props.customToolbar && Object.keys(props.customToolbar).length > 0 ? props.customToolbar : globalStore.config_center
	)
	const activeNames = ref([
		'stateful',
		'stateless',
		'have_animation',
		'custom_svg_group',
		'element-ui',
		'custom-vue',
		'echarts'
	])
	const createBegin = (svg_item: IConfigItem) => {
		globalStore.setCreateInfo(sortProps(svg_item))
	}

	const sortProps = (svg_item: IConfigItem): IConfigItem => {
		if (svg_item?.props && !isEmpty(svg_item.props)) {
			Object.keys(svg_item.props).forEach((k, i) => {
				svg_item.props[k].sort = String(i)
			})
		}
		return svg_item
	}
	const dragEndEvent = (e: DragEvent) => {
		//拖动时记录拖动的svg信息
		if (e.dataTransfer?.dropEffect !== 'copy') {
			ElMessage.warning('请将组件拖到画布中!')
			//清空已选择的信息
			globalStore.intention = EGlobalStoreIntention.None
			return
		}
	}
</script>
<template>
	<div>
		<el-collapse v-model="activeNames" style="border-top: none">
			<el-collapse-item :name="item.groupType" v-for="item of left_tool_bar" :key="item.title">
				<template #title>
					<div>{{ item.title }}</div>
				</template>
				<div class="component-group flex flex-wrap">
					<div
						v-for="svg_item in item.list"
						class="ideal"
						:key="svg_item.name"
						draggable="true"
						@dragstart="createBegin(svg_item)"
						@dragend="dragEndEvent"
						:title="svg_item.title"
					>
						<el-icon :size="35" class="flex items-center">
							<svg-analysis :name="svg_item.name" :props="prosToVBind(svg_item, ['width', 'height', 'maxHeight'])" />
						</el-icon>
					</div>
				</div>
			</el-collapse-item>
		</el-collapse>
	</div>
</template>

<style scoped lang="less">
	.component-group {
		.ideal {
			margin: 5px;
			border: 1px solid transparent;
			cursor: pointer;

			&:hover {
				border-color: #f0a0f8;
				opacity: 0.85;
			}

			.items-center {
				font-style: normal;
			}
		}
	}
</style>
