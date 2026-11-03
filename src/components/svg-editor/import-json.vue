<script setup lang="ts">
	import { VAceEditor } from 'vue3-ace-editor'
	import '@/components/ace-edit'

	import { useImportDataModel } from '@/hooks'
	import { ElMessage } from 'element-plus'
	import { translate } from '@/i18n'
	const content = ref<string>('')

	const setVal = (d: any) => {
		content.value = d
	}
	const onImportJson = () => {
		if (useImportDataModel(content.value)) {
			ElMessage.success(translate('导入成功'))
		}
	}
	defineExpose({
		setVal,
		onImportJson
	})
</script>

<template>
	<v-ace-editor
		v-model:value="content"
		lang="json"
		theme="kr_theme"
		style="height: 400px"
		:options="{
			useWorker: true
		}"
	/>
</template>