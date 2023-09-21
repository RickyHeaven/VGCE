<script setup lang="ts">
	import { pinia } from '@/hooks'
	import { useConfigStore } from '@/stores/config'
	import { useGlobalStore } from '@/stores/global'
	import { useEditPrivateStore } from '@/stores/system'
	import { ElIcon, ElDivider, ElDialog, ElScrollbar } from 'element-plus'
	import SvgAnalysis from '../../svg-analysis/index.vue'
	import { useSvgEditLayoutStore } from '@/stores/svg-edit-layout'
	import { EVisibleConfKey } from '../types'
	import type { IDataModel } from '../types'
	import { EGlobalStoreIntention } from '@/stores/global/types'

	const svgEditLayoutStore = useSvgEditLayoutStore(pinia)
	const globalStore = useGlobalStore(pinia)
	const editPrivateStore = useEditPrivateStore(pinia)
	const configStore = useConfigStore(pinia)
	const emits = defineEmits(['changeVisible', 'onReturn', 'onPreview', 'onSave'])
	const onDeleteBtnClick = () => {
		globalStore.done_json.length <= 0 || globalStore.setDoneJson([])
		globalStore.intention = EGlobalStoreIntention.None
	}

	const dataBtnClick = (d: 'onReturn' | 'onPreview' | 'onSave') => {
		const data_model: IDataModel = {
			layout_center: svgEditLayoutStore.center_offset,
			config: configStore.$state,
			done_json: globalStore.done_json
		}
		emits(d, data_model)
	}

	const open = ref(false)

	const connection_line = computed({
		get: () => globalStore.intention === EGlobalStoreIntention.Connection,
		set(v: any) {
			globalStore.intention = v ? EGlobalStoreIntention.Connection : EGlobalStoreIntention.None
			if (v) {
				globalStore.setHandleSvgInfo(null)
			}
		}
	})
</script>

<template>
	<div class="flex justify-between" style="width: 100%">
		<div class="flex items-center justify-between" style="width: 250px">
			<div class="flex items-center"><span class="logo-title">Svg Editor</span></div>
			<el-icon
				:size="24"
				class="bt-Icon"
				@click="svgEditLayoutStore.left_nav = !svgEditLayoutStore.left_nav"
				:title="svgEditLayoutStore.left_nav ? '隐藏左侧菜单' : '显示左侧菜单'"
			>
				<svg-analysis v-if="svgEditLayoutStore.left_nav" name="menu-unfold" />
				<svg-analysis v-else name="menu-fold" />
			</el-icon>
		</div>
		<div class="flex justify-between" style="width: calc(100% - 440px)">
			<div class="flex items-center">
				<el-icon
					title="撤销 ctrl+z"
					:size="24"
					:class="`${editPrivateStore.getTopBtnUndoStatus ? 'bt-Icon' : 'icon-disable'} ml-20px`"
					@click="() => editPrivateStore.topUndoBtnClick()"
				>
					<svg-analysis :name="editPrivateStore.getTopBtnUndoStatus ? 'undo' : 'undo-gray'" />
				</el-icon>
				<el-icon
					title="重做 ctrl+shift+z"
					:class="`${editPrivateStore.getTopBtnRedoStatus ? 'bt-Icon' : 'icon-disable'} ml-5px`"
					:size="24"
					@click="() => editPrivateStore.topRedoBtnClick()"
				>
					<svg-analysis :name="editPrivateStore.getTopBtnRedoStatus ? 'redo' : 'redo-gray'" />
				</el-icon>
				<el-divider direction="vertical"></el-divider>
				<el-icon
					title="清空 ctrl+delete"
					:class="globalStore.done_json.length > 0 ? 'bt-Icon' : 'icon-disable'"
					:size="24"
					@click="onDeleteBtnClick"
				>
					<svg-analysis :name="globalStore.done_json.length > 0 ? 'delete' : 'delete-gray'" />
				</el-icon>
				<el-divider direction="vertical" />
				<el-icon
					title="导入数据模型"
					class="bt-Icon"
					:size="24"
					@click="emits('changeVisible', EVisibleConfKey.ImportJson, true)"
				>
					<svg-analysis name="import" />
				</el-icon>
				<el-icon
					title="导出数据模型"
					:size="24"
					class="bt-Icon ml-5px"
					@click="emits('changeVisible', EVisibleConfKey.ExportJson, true)"
				>
					<svg-analysis name="export" />
				</el-icon>
				<el-divider direction="vertical" />
				<el-icon
					title="创建连线"
					class="bt-Icon"
					:class="{ active: connection_line }"
					:size="24"
					@click="connection_line = !connection_line"
				>
					<svg-analysis :name="connection_line ? 'line-active' : 'line'" />
				</el-icon>
				<el-divider direction="vertical" />
				<el-icon title="说明" class="bt-Icon" :size="24" @click="open = !open">
					<svg-analysis name="question" />
				</el-icon>
				<!-- <el-divider direction="vertical"></el-divider>
        <el-icon title="组合" class="bt-Icon" :size="24">
          <svg-analysis name="group"/>
        </el-icon>
        <el-divider direction="vertical"></el-divider>
        <el-icon title="取消组合" class="bt-Icon" :size="24">
          <svg-analysis name="ungroup"/>
        </el-icon>
        <el-divider direction="vertical"></el-divider>
        <el-icon title="锁定" class="bt-Icon" :size="24">
          <svg-analysis name="lock"/>
        </el-icon> -->
			</div>
			<div class="flex items-center mr-20px">
				<el-icon title="返回" class="bt-Icon" :size="24" @click="dataBtnClick('onReturn')">
					<svg-analysis name="return" />
				</el-icon>
				<el-divider direction="vertical"></el-divider>
				<el-icon title="保存" class="bt-Icon" :size="24" @click="dataBtnClick('onSave')">
					<svg-analysis name="save" />
				</el-icon>
				<el-divider direction="vertical"></el-divider>
				<el-icon title="预览" class="bt-Icon" :size="22" @click="dataBtnClick('onPreview')">
					<svg-analysis name="preview" />
				</el-icon>
			</div>
		</div>
		<div class="flex items-center" style="width: 250px">
			<el-icon
				:size="24"
				class="bt-Icon"
				@click="svgEditLayoutStore.right_nav = !svgEditLayoutStore.right_nav"
				:title="svgEditLayoutStore.right_nav ? '隐藏右侧菜单' : '显示右侧菜单'"
			>
				<svg-analysis v-if="svgEditLayoutStore.right_nav" name="menu-fold" />
				<svg-analysis v-else name="menu-unfold" />
			</el-icon>
		</div>
	</div>
	<el-dialog v-model="open" title="使用说明" width="60%" class="guide-dialog">
		<el-scrollbar max-height="60vh">
			<div class="font-bold mb-10px text-15px guide-title" style="padding-top: 16px">多选</div>
			<div>鼠标按住左键可以框选，也可以按住ctrl+鼠标左键点图形进行多选</div>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">拖动画布</div>
			<div>右键画布然后拖动即可，右侧面板‘图纸’栏可微调或重置位置</div>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">画布缩放</div>
			<div>使用鼠标滚轮或者右侧面板‘图纸’栏可控制画布缩放</div>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">标尺辅助线</div>
			<div>在标尺区域按住鼠标左键并拖动即可创建标尺辅助线，将标尺辅助线拖动到标尺区域即可删除标尺辅助线</div>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">连线样式</div>
			<div
				>在右侧‘连线’栏可以统一配置连线样式，配置后先增加的线会应用新样式，之前的线样式不变，如需改变，可选中线手动更改或删除重画
			</div>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">横线和竖线</div>
			<div>画线的时候按住ctrl即可画竖线，按住shift即可画横线</div>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">线段选中</div>
			<div style="padding-bottom: 14px">
				若线段绑定了锚点，移动线段，绑定的锚点不会移动。若是想将线段整体移动，需要先选中线段，在右侧‘数据’栏里解除绑定
			</div>
		</el-scrollbar>
	</el-dialog>
</template>

<style scoped lang="less">
	.logo-title {
		font-size: 16px;
		color: #555;
		font-weight: 500;
	}

	.guide-title {
		color: #99a;
	}

	.el-divider {
		border-color: #f1f1f5;
	}
</style>
<style lang="less">
	.guide-dialog {
		.el-dialog__header {
			background-color: #f1f1f5;
			margin-right: 0;
			padding-right: 16px;
		}

		.el-dialog__body {
			padding-top: 0;
			padding-bottom: 8px;
			padding-right: 8px;
		}
	}
</style>
