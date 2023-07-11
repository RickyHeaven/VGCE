<script setup lang="ts">
	import { pinia } from '@/hooks'
	import { useConfigStore } from '@/stores/config'
	import { useGlobalStore } from '@/stores/global'
	import { useEditPrivateStore } from '@/stores/system'
	import { ElIcon, ElDivider } from 'element-plus'
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
	const onPreviewClick = () => {
		const data_model: IDataModel = {
			layout_center: svgEditLayoutStore.center_offset,
			config: configStore.$state,
			done_json: globalStore.done_json
		}
		emits('onPreview', data_model)
	}
	const onSaveClick = () => {
		const data_model: IDataModel = {
			layout_center: svgEditLayoutStore.center_offset,
			config: configStore.$state,
			done_json: globalStore.done_json
		}
		emits('onSave', data_model)
	}
</script>

<template>
	<div class="flex justify-between" style="width: 100%">
		<div class="flex items-center justify-between" style="width: 220px">
			<div class="flex items-center"><span class="logo-title">组态编辑器</span></div>
			<el-icon :size="24" class="bt-Icon" @click="svgEditLayoutStore.left_nav = !svgEditLayoutStore.left_nav">
				<svg-analysis v-if="svgEditLayoutStore.left_nav" name="menu-unfold" />
				<svg-analysis v-else name="menu-fold" />
			</el-icon>
		</div>
		<div class="flex justify-between" style="width: calc(100% - 440px)">
			<div class="flex items-center">
				<el-icon
					title="撤销 ctrl+z"
					:size="20"
					:class="`${editPrivateStore.getTopBtnUndoStatus ? 'bt-Icon' : 'icon-disable'} ml-20px`"
					@click="() => editPrivateStore.topUndoBtnClick()"
				>
					<svg-analysis name="undo" />
				</el-icon>
				<el-icon
					title="重做 ctrl+shift+z"
					:class="`${editPrivateStore.getTopBtnRedoStatus ? 'bt-Icon' : 'icon-disable'} ml-5px`"
					:size="20"
					@click="() => editPrivateStore.topRedoBtnClick()"
				>
					<svg-analysis name="redo" />
				</el-icon>
				<el-divider direction="vertical"></el-divider>
				<el-icon
					title="清空 ctrl+delete"
					:class="`${globalStore.done_json.length > 0 ? 'bt-Icon' : 'icon-disable'}`"
					:size="20"
					@click="onDeleteBtnClick"
				>
					<svg-analysis name="delete" />
				</el-icon>
				<el-divider direction="vertical" />
				<el-icon
					title="导入数据模型"
					class="bt-Icon"
					:size="20"
					@click="emits('changeVisible', EVisibleConfKey.ImportJson, true)"
				>
					<svg-analysis name="import" />
				</el-icon>
				<el-icon
					title="导出数据模型"
					:size="20"
					class="bt-Icon ml-5px"
					@click="emits('changeVisible', EVisibleConfKey.ExportJson, true)"
				>
					<svg-analysis name="export" />
				</el-icon>
				<!-- <el-divider direction="vertical"></el-divider>
        <el-icon title="组合" class="bt-Icon" :size="20">
          <svg-analysis name="group"/>
        </el-icon>
        <el-divider direction="vertical"></el-divider>
        <el-icon title="取消组合" class="bt-Icon" :size="20">
          <svg-analysis name="ungroup"/>
        </el-icon>
        <el-divider direction="vertical"></el-divider>
        <el-icon title="锁定" class="bt-Icon" :size="20">
          <svg-analysis name="lock"/>
        </el-icon> -->
			</div>
			<div class="flex items-center mr-20px">
				<el-icon title="返回" class="bt-Icon" :size="20" @click="emits('onReturn')">
					<svg-analysis name="return" />
				</el-icon>
				<el-divider direction="vertical"></el-divider>
				<el-icon title="保存" class="bt-Icon" :size="20" @click="onSaveClick">
					<svg-analysis name="save" />
				</el-icon>
				<el-divider direction="vertical"></el-divider>
				<el-icon title="预览" class="bt-Icon" :size="22" @click="onPreviewClick">
					<svg-analysis name="preview" />
				</el-icon>
			</div>
		</div>
		<div class="flex items-center" style="width: 220px">
			<el-icon :size="24" class="bt-Icon" @click="svgEditLayoutStore.right_nav = !svgEditLayoutStore.right_nav">
				<svg-analysis v-if="svgEditLayoutStore.right_nav" name="menu-fold" />
				<svg-analysis v-else name="menu-unfold" />
			</el-icon>
		</div>
	</div>
</template>

<style scoped lang="less">
	.logo-title {
		font-size: 15px;
		font-weight: 600;
	}

	.icon-disable {
		cursor: not-allowed;
		color: #ccc;
	}
</style>
