<script setup lang="ts">
	import { ElContainer, ElHeader, ElAside, ElMain, ElDialog, ElMessage } from 'element-plus'
	import 'element-plus/dist/index.css'
	import 'animate.css'
	import TopPanel from '@/components/svg-editor/top-panel.vue'
	import LeftPanel from '@/components/svg-editor/left-panel.vue'
	import CenterPanel from '@/components/svg-editor/center-panel.vue'
	import RightPanel from '@/components/svg-editor/right-panel.vue'
	import ExportJson from '@/components/svg-editor/export-json.vue'
	import ImportJson from '@/components/svg-editor/import-json.vue'
	import VgcePrompt from '@/components/vgce-prompt.vue'
	import Vue3RulerTool from '@/components/vue3-ruler-tool.vue'
	import { EVisibleConfKey } from '@/components/svg-editor/types'
	import type { IVisibleConf, IDataModel } from '@/components/svg-editor/types'
	import type { IConfig } from '@/config/types'
	import { EGlobalStoreIntention } from '@/stores/global/types'
	import type { IDoneJson } from '@/stores/global/types'
	import { pinia } from '@/hooks'
	import { useSvgEditLayoutStore } from '@/stores/svg-edit-layout'
	import { useImportDataModel } from '@/hooks'
	import { useGlobalStore } from '@/stores/global'
	import { useConfigStore } from '@/stores/config'
	import { fileRead, fileWrite } from '@/utils/file-read-write'
	import { useEditPrivateStore } from '@/stores/system'
	import { setEditorLoadTime } from '@/utils'
	import { onMounted } from 'vue'
	import { registerMessages, setLocale, translate, useVgceLocale } from '@/i18n'
	import type { VgceLocale } from '@/i18n'

	setEditorLoadTime()

	const emits = defineEmits(['onReturn', 'onPreview', 'onSave'])
	const props = withDefaults(
		defineProps<{
			customToolbar?: IConfig
			configMessages?: Record<string, string>
			vueComp?: Record<string, any>
			data?: string
			saveFile?: boolean
			mqtt?: { cover: boolean; url: string; user: string; pwd: string; topics: string }
			slotBackground?: boolean
			locale?: VgceLocale
		}>(),
		{
			saveFile: false,
			mqtt: () => ({
				cover: false,
				url: '',
				user: '',
				pwd: '',
				topics: ''
			}),
			slotBackground: false
		}
	)
	watchEffect(() => {
		if (props.locale) {
			setLocale(props.locale)
		}
	})
	watchEffect(() => {
		registerMessages(props.configMessages)
	})

	const globalStore = useGlobalStore(pinia)
	const svgEditLayoutStore = useSvgEditLayoutStore(pinia)
	const configStore = useConfigStore(pinia)
	const editPrivateStore = useEditPrivateStore(pinia)
	const vgceLocale = useVgceLocale()
	const isEn = computed(() => vgceLocale.value === 'en-US')
	const centerRef = ref()
	const importJsonRef = ref<InstanceType<typeof ImportJson>>()
	const promptRef = ref<InstanceType<typeof VgcePrompt>>()
	const importFileRef = ref<HTMLInputElement>()
	const visible_conf: IVisibleConf = reactive({
		[EVisibleConfKey.ExportJson]: false,
		[EVisibleConfKey.ImportJson]: false,
		[EVisibleConfKey.ImportFile]: false
	})
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
			ElMessage.error(translate('仅支持的格式：txt、json'))
			return
		}
		fileRead(f).then((r) => {
			importJsonRef.value!.setVal(r)
			ElMessage.success(translate('文件读取成功！'))
		})
	}
	const onImportFileChange = (e: Event) => {
		const input = e.target as HTMLInputElement
		const file = input.files?.[0]
		if (file) {
			onImportFile(file)
		}
		input.value = ''
	}
	const setGraphNodeJson = (done_json: IDoneJson[]) => {
		globalStore.setDoneJson(done_json)
	}
	onMounted(() => {
		//清除历史记录，解决外部传入不同数据，形成历史记录的问题
		editPrivateStore.history_doneComponent = []
		editPrivateStore.history_now_index = 0
		if (props.data) {
			useImportDataModel(props.data)
		} else {
			globalStore.setDoneJson([])
		}
		globalStore.intention = EGlobalStoreIntention.None
	})

	function onReturnClick(d: IDataModel) {
		emits('onReturn', {
			data: d,
			isChange: editPrivateStore.getTopBtnUndoStatus
		})
	}

	function save(d: IDataModel) {
		if (props.saveFile) {
			promptRef.value!.open({
				message: translate('请输入文件名'),
				title: translate('保存'),
				cancelButtonText: translate('取消'),
				confirmButtonText: translate('保存')
			})
				.then((r: { value: string }) => {
					fileWrite(d, r.value.trim())
					emits('onSave', d)
				})
				.catch((e: any) => {
					console.log(e)
				})
		} else {
			emits('onSave', d)
		}
	}

	function onLineMouseUp() {
		centerRef.value.onCanvasMouseUp()
	}

	function onExportSvg() {
		promptRef.value!.open({
			message: translate('请输入文件名'),
			title: translate('保存为SVG文件'),
			cancelButtonText: translate('取消'),
			confirmButtonText: translate('保存'),
			inputValue: 'svg-canvas',
			inputPattern: /^[^\\/:*?"<>|]+$/,
			inputErrorMessage: translate('文件名不能包含 \\ / : * ? " < > |')
		})
			.then((r: { value: string }) => {
				const success = centerRef.value?.exportSvg(r.value.trim())
				if (success) {
					ElMessage.success(translate('SVG文件已保存'))
				}
			})
			.catch((e: any) => {
				console.log(e)
			})
	}

	onMounted(() => {
		configStore.net.mqtt.useGlobalMqtt = Boolean(props.mqtt?.cover)
		if (!configStore.net.mqtt.global) {
			configStore.net.mqtt.global = {
				url: '',
				user: '',
				pwd: '',
				topics: ''
			}
		}
		configStore.net.mqtt.global.url = props.mqtt?.url || ''
		configStore.net.mqtt.global.user = props.mqtt?.user || ''
		configStore.net.mqtt.global.pwd = props.mqtt?.pwd || ''
		configStore.net.mqtt.global.topics = props.mqtt?.topics || ''
	})

	defineExpose({
		setGraphNodeJson
	})
</script>
<template>
	<div :class="{ 'vgce-editor--en': isEn }">
		<el-container>
			<el-header class="top-el-header">
				<top-panel
					@change-visible="changeVisible"
					@on-return="onReturnClick"
					@on-preview="(val: IDataModel) => emits('onPreview', val)"
					@on-save="save"
					@on-export-svg="onExportSvg"
				></top-panel>
			</el-header>
			<el-container class="middle">
				<el-aside
					class="side-nav"
					:class="svgEditLayoutStore.left_nav ? 'show-nav' : 'hide-nav'"
					style="border-right: 1px solid #efefef"
				>
					<div class="vgce-scrollbar el-scroll-pc">
						<left-panel class="content-left" :custom-toolbar="props.customToolbar" />
					</div>
				</el-aside>
				<el-main class="middle main">
					<div class="canvas-main-pc">
						<Vue3RulerTool class="canvas-main-pc" :visible="configStore.svg.ruler" @onLineMouseUp="onLineMouseUp">
							<center-panel ref="centerRef" :vueComp="props.vueComp">
								<template #background>
									<slot name="background" />
								</template>
							</center-panel>
						</Vue3RulerTool>
					</div>
				</el-main>
				<el-aside
					class="side-nav"
					:class="svgEditLayoutStore.right_nav ? 'show-nav' : 'hide-nav'"
					style="border-left: 1px solid #efefef"
				>
					<div class="vgce-scrollbar el-scroll-pc">
						<right-panel :slotBackground="props.slotBackground"></right-panel>
					</div>
				</el-aside>
			</el-container>
		</el-container>
		<el-dialog class="modal-full" v-model="visible_conf.ImportJson" :title="translate('导入数据')" width="60%" destroy-on-close>
			<import-json ref="importJsonRef"></import-json>
			<template #footer>
				<button type="button" class="vgce-btn" style="margin-right: 12px" @click="importFileRef?.click()">
					{{ translate('读取文件') }}
				</button>
				<input
					ref="importFileRef"
					type="file"
					accept=".txt,.json,text/plain,application/json"
					style="display: none"
					@change="onImportFileChange"
				/>
				<button type="button" class="vgce-btn vgce-btn--primary" @click="onImportJson">{{ translate('导入数据') }}</button>
			</template>
		</el-dialog>
		<el-dialog class="modal-full" v-model="visible_conf.ExportJson" :title="translate('导出')" width="60%" destroy-on-close>
			<export-json></export-json>
		</el-dialog>
		<vgce-prompt ref="promptRef"></vgce-prompt>
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
			background-color: #ffffff;
			padding: 0;
			overflow: hidden;
		}

		.side-nav {
			@showLeftNavWidth: 260px;
			@hideLeftNavWidth: 0;
			position: relative;
			overflow: inherit;
			transition: all 0.5s;

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

	.vgce-editor--en .side-nav.show-nav {
		@enNavWidth: 300px;
		flex: 0 0 @enNavWidth;
		min-width: @enNavWidth;
		max-width: @enNavWidth;
	}

	.top-el-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		border-bottom: 1px solid #efefef;
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