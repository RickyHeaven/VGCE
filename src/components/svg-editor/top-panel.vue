<script setup lang="ts">
	import { pinia } from '@/hooks'
	import { useConfigStore } from '@/stores/config'
	import { useGlobalStore } from '@/stores/global'
	import { useEditPrivateStore } from '@/stores/system'
	import { ElIcon, ElDivider, ElDialog, ElScrollbar } from 'element-plus'
	import SvgAnalysis from '../svg-analysis.vue'
	import { useSvgEditLayoutStore } from '@/stores/svg-edit-layout'
	import { EVisibleConfKey } from './types'
	import type { IDataModel } from './types'
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
	<el-dialog v-model="open" title="使用说明" width="60%">
		<el-scrollbar max-height="60vh">
			<div class="font-bold mb-10px text-15px guide-title" style="padding-top: 16px">多选</div>
			<div
				>在画布空白区域按住鼠标左键可以框选（图形坐标在框选区域即判定被选中），也可以按住ctrl+鼠标左键点图形进行多选</div
			>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">拖动画布</div>
			<div>在画布空白区域按住右键可拖动画布，右侧面板‘图纸’栏可微调或重置位置</div>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">画布缩放</div>
			<div
				>在画布中使用鼠标滚轮或者右侧面板‘图纸’栏可控制画布缩放，鼠标滚轮以鼠标位置为缩放中心，图纸栏以图纸原点（默认在左上角）为缩放中心</div
			>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">标尺辅助线</div>
			<div>在标尺区域按住鼠标左键并拖动即可创建标尺辅助线，将标尺辅助线拖动到标尺区域即可删除标尺辅助线</div>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">组件尺寸</div>
			<div
				><p>
					大多数组件可以通过选中组件然后拖动交互点或在右侧‘外观’栏改变外形尺寸，或通过右侧‘数据’栏直接或间接改变外形尺寸；</p
				>
				<p>少数特殊组件仅可通过右侧'数据'栏直接或间接改变外形尺寸</p></div
			>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">连线样式</div>
			<div
				>在右侧‘连线’栏可以统一配置连线样式，配置后先增加的线会应用新样式，之前的线样式不变，如需改变，可选中线手动更改或删除重画
			</div>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">横线和竖线</div>
			<div class="guide-text"
				><p>
					点击编辑器顶部连线按钮会进入连线状态，该状态下在画板点击鼠标左键即可开始画线，移动并再次点击左键创建新的节点，右键结束画线并退出连线状态；</p
				>
				<p>画线的时候按住ctrl即可画竖线，按住shift即可画横线</p></div
			>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">绑定锚点</div>
			<div class="guide-text">
				<p
					>组件在未选中时，鼠标经过组件时会出现锚点，鼠标悬浮在锚点上时，会有交互样式，点击左键即可以锚点为起点创建连线；</p
				>
				<p>同样，在连线时鼠标经过锚点时，会出现锚点交互样式，点击左键即可以锚点为连线终点结束连线；</p>
				<p>这两种情况下的连线会绑定组件上的锚点，如需解绑，参考下面的‘锚点解绑’；</p>
				<p>同样，也可先画线，再选中连线绑定想要绑定的组件锚点（连线只有首尾节点可以绑定锚点）</p>
			</div>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">线段选中</div>
			<div>
				若线段绑定了锚点，移动线段，绑定的锚点不会移动。若是想将线段整体移动，需要先解绑，参考下面的‘锚点解绑’
			</div>
			<div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid"></div>
			<div class="font-bold mb-10px text-15px guide-title">锚点解绑</div>
			<div style="padding-bottom: 14px"> 选中线段，在右侧‘数据’栏里解除绑定；或者鼠标左键拖拽连线上需要解绑的节点</div>
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

	.guide-text {
		p {
			line-height: 1.9;
		}
	}
</style>
