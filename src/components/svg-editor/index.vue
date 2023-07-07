<script setup lang="ts">
	import { onMounted, reactive, ref, getCurrentInstance } from 'vue'
	import {
		ElContainer,
		ElHeader,
		ElAside,
		ElMain,
		ElScrollbar,
		ElDialog,
		ElButton,
		ElUpload,
		ElMessage
	} from 'element-plus'
	import 'element-plus/dist/index.css'
	import 'animate.css'
	import TopPanel from '@/components/svg-editor/top-panel/index.vue'
	import LeftPanel from '@/components/svg-editor/left-panel/index.vue'
	import CenterPanel from '@/components/svg-editor/center-panel/index.vue'
	import RightPanel from '@/components/svg-editor/right-panel/index.vue'
	import ExportJson from '@/components/svg-editor/export-json/index.vue'
	import ImportJson from '@/components/svg-editor/import-json/index.vue'
	import Vue3RulerTool from '@/components/vue3-ruler-tool/index.vue'
	import { EVisibleConfKey } from '@/components/svg-editor/types'
	import type { IVisibleConf, IDataModel } from '@/components/svg-editor/types'
	import type { IConfigCenter } from '@/config-center/types'
	import { EGlobalStoreIntention } from '@/stores/global/types'
	import type { IDoneJson } from '@/stores/global/types'
	import { useSvgEditLayoutStore } from '@/stores/svg-edit-layout'
	import { useImportDataModel } from '@/hooks'
	import { useGlobalStore } from '@/stores/global'
	import { useConfigStore } from '@/stores/config'
	import { fileRead } from '@/utils/file-read-write'

	const { appContext } = getCurrentInstance()!
	const props = defineProps<{ customToolBar: IConfigCenter; dataModel: string }>()
	const presetLine = ref([])
	const input = (list: any) => {
		presetLine.value = list
	}
	const globalStore = useGlobalStore()
	const svgEditLayoutStore = useSvgEditLayoutStore()
	const configStore = useConfigStore()
	const importJsonRef = ref<InstanceType<typeof ImportJson>>()
	const visible_conf: IVisibleConf = reactive({
		[EVisibleConfKey.ExportJson]: false,
		[EVisibleConfKey.ImportJson]: false,
		[EVisibleConfKey.ImportFile]: false
	})
	const emits = defineEmits(['onReturn', 'onPreview', 'onSave'])
	const changeVisible = (key: EVisibleConfKey, val: boolean) => {
		visible_conf[key] = val
	}

	const onImportJson = ref()
	onImportJson.value = () => {
		importJsonRef.value!.onImportJson()
		changeVisible(EVisibleConfKey.ImportJson, false)
	}

	const onImportFile = (f: File) => {
		if (['text/plain', 'application/json'].indexOf(f.type) < 0) {
			ElMessage.error('仅支持的格式：txt、json')
			return false
		}
		fileRead(f).then((r) => {
			importJsonRef.value!.setVal(r)
			ElMessage.success('文件读取成功！')
		})
		return false
	}
	const setGraphNodeJson = (done_json: IDoneJson[]) => {
		globalStore.setDoneJson(done_json)
	}
	onMounted(() => {
		if (props.dataModel) {
			useImportDataModel(props.dataModel)
		} else {
			globalStore.setDoneJson([])
		}
		globalStore.intention = EGlobalStoreIntention.None
	})
	defineExpose({
		setGraphNodeJson
	})
</script>
<template>
	<div>
		<el-container>
			<el-header class="top-el-header">
				<top-panel
					@change-visible="changeVisible"
					@on-return="emits('onReturn')"
					@on-preview="(val: IDataModel) => emits('onPreview', val)"
					@on-save="(val: IDataModel) => emits('onSave', val)"
				></top-panel>
			</el-header>
			<el-container class="middle">
				<el-aside class="side-nav" :class="svgEditLayoutStore.left_nav ? 'show-nav' : 'hide-nav'">
					<el-scrollbar class="el-scroll-pc">
						<left-panel class="content-left" :custom-tool-bar="props.customToolBar"></left-panel>
					</el-scrollbar>
				</el-aside>
				<el-main class="middle main">
					<div class="canvas-main-pc">
						<Vue3RulerTool
							class="canvas-main-pc"
							:value="presetLine"
							:step-length="50"
							:parent="true"
							:is-scale-revise="false"
							v-model:visible="configStore.svg.ruler"
							@input="input"
						>
							<center-panel></center-panel>
						</Vue3RulerTool>
					</div>
				</el-main>
				<el-aside class="side-nav" :class="svgEditLayoutStore.right_nav ? 'show-nav' : 'hide-nav'">
					<el-scrollbar class="el-scroll-pc">
						<right-panel></right-panel>
					</el-scrollbar>
				</el-aside>
			</el-container>
		</el-container>
		<el-dialog class="modal-full" v-model="visible_conf.ImportJson" title="导入数据" width="60%" destroy-on-close>
			<import-json ref="importJsonRef"></import-json>
			<template #footer>
				<el-upload
					:beforeUpload="onImportFile"
					style="display: inline-flex; margin-right: 12px"
					:multiple="false"
					:show-file-list="false"
					:limit="1"
				>
					<el-button @click="changeVisible(EVisibleConfKey.ImportFile, true)">读取文件</el-button>
				</el-upload>
				<el-button type="primary" @click="onImportJson">导入数据</el-button>
			</template>
		</el-dialog>
		<el-dialog class="modal-full" v-model="visible_conf.ExportJson" title="导出" width="60%" destroy-on-close>
			<export-json></export-json>
		</el-dialog>
	</div>
</template>
<style scoped lang="less">
	@headerHeight: 45px;
	.el-scroll-pc {
		height: calc(100vh - @headerHeight - 1px);
	}

	.canvas-main-pc {
		width: 100%;
		height: 100%;
		margin: 0 auto;
	}

	.middle {
		height: calc(100vh - @headerHeight - 1px);

		&.main {
			margin: 0 5px;
			background-color: #ffffff;
			padding: 0 2px;
		}

		.side-nav {
			@showLeftNavWidth: 260px;
			@hideLeftNavWidth: 0;
			position: relative;
			overflow: inherit;
			transition: all 0.5s;
			// background-color: rgb(250, 251, 253);
			box-shadow: 0 0 2px #dfcfcf;

			.content-left {
				overflow: hidden;
				margin: 0 1vh;
			}

			&.show-nav {
				flex: 0 0 @showLeftNavWidth;
				min-width: @showLeftNavWidth;
				max-width: @showLeftNavWidth;
			}

			&.hide-nav {
				flex: 0 0 @hideLeftNavWidth;
				min-width: @hideLeftNavWidth;
				max-width: @hideLeftNavWidth;
			}
		}
	}

	.top-el-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		box-shadow: 0 0 2px #dfcfcf;
		margin-bottom: 1px;
		height: @headerHeight;
	}

	.bottom-el-footer {
		box-shadow: 0 -1px 0 0 #dfcfcf;
		margin-top: 10px;
	}

	.contextMenu {
		position: absolute;
		z-index: 99999;
		background: #ffffff;
		padding: 5px 0;
		margin: 0;
		display: block;
		border-radius: 5px;
		box-shadow: 2px 5px 10px rgba(0, 0, 0, 0.3);

		li {
			list-style: none;
			padding: 0;
			margin: 0;
		}

		.shortcut {
			width: 115px;
			text-align: right;
			float: right;
		}

		p {
			text-decoration: none;
			display: block;
			padding: 0 15px 1px 20px;
			margin: 0;
			user-select: none;
			-webkit-user-select: none;
		}

		p:hover {
			background-color: #0cf;
			color: #ffffff;
			cursor: default;
		}

		.disabled {
			color: #999;
		}

		.disabled:hover {
			color: #999;
			background-color: transparent;
		}

		li.separator {
			border-top: solid 1px #e3e3e3;
			padding-top: 5px;
			margin-top: 5px;
		}
	}
</style>