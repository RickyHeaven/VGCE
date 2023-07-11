<!--左侧工具栏-->
<script lang="ts" setup>
	import { ref } from 'vue'
	import { ElCollapse, ElCollapseItem, ElIcon, ElMessage } from 'element-plus'
	import type { IConfigCenter, IConfigItem } from '@/config-center/types'
	import { pinia } from '@/hooks'
	import { useGlobalStore } from '@/stores/global'
	import SvgAnalysis from '@/components/svg-analysis/index.vue'
	import { EGlobalStoreIntention } from '@/stores/global/types'
	import { prosToVBind } from '@/utils'

	const globalStore = useGlobalStore(pinia)
	const props = defineProps<{ customToolBar: IConfigCenter | undefined }>()
	const left_tool_bar = ref(
		props.customToolBar && Object.keys(props.customToolBar).length > 0 ? props.customToolBar : globalStore.config_center
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
		globalStore.setCreateInfo(svg_item)
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
		<el-collapse v-model="activeNames">
			<el-collapse-item :name="item.groupType" v-for="item of left_tool_bar" :key="item.title">
				<template #title>
					<div style="font-weight: bold">{{ item.title }}</div>
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
							<svg-analysis :name="svg_item.name" :props="prosToVBind(svg_item)" />
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
