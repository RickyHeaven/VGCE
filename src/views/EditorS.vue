<script setup lang="ts">
	import SvgEditor from '@/components/svg-editor/index.vue'
	import { useStore } from '@/stores/main'
	import { useRouter } from 'vue-router'
	import { configCenter } from '@/config-center'
	import { fileWrite } from '@/utils/file-read-write'
	import { ElMessageBox } from 'element-plus'
	import { getCurrentInstance } from 'vue'

	const { appContext } = getCurrentInstance()!
	const router = useRouter()
	const store = useStore()

	function preview(d) {
		store.dataModel = d
		router.push('/Preview')
	}

	function save(d) {
		ElMessageBox.prompt('请输入文件名', '保存', {}, appContext)
			.then((r) => {
				fileWrite(d, r.value.trim())
			})
			.catch((e) => {
				console.log(e)
			})
	}
</script>

<template>
	<SvgEditor
		:dataModel="(store.dataModel && JSON.stringify(store.dataModel)) || ''"
		:customToolBar="configCenter"
		@onPreview="preview"
		@onSave="save"
	/>
</template>
