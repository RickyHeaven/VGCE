<script setup lang="ts">
	// import SvgEditor from '@/components/svg-editor/index.vue'
	import { SvgEditor } from '../../dist/vgce.mjs'
	import '../../dist/style.css'
	import { useStore } from '@/stores/main'
	import { useRouter } from 'vue-router'
	import { fileWrite } from '@/utils/file-read-write'
	import { ElMessageBox } from 'element-plus'
	import { getCurrentInstance } from 'vue'
	import type { IDataModel } from '@/components/svg-editor/types'

	const { appContext } = getCurrentInstance()!
	const router = useRouter()
	const store = useStore()

	function preview(d: IDataModel) {
		store.dataModel = d
		router.push('/Preview')
	}

	function save(d: IDataModel) {
		ElMessageBox.prompt('请输入文件名', '保存', {}, appContext)
			.then((r: any) => {
				fileWrite(d, r.value.trim())
			})
			.catch((e: any) => {
				console.log(e)
			})
	}
</script>

<template>
	<SvgEditor
		:dataModel="(store.dataModel && JSON.stringify(store.dataModel)) || ''"
		@onPreview="preview"
		@onSave="save"
	/>
</template>
