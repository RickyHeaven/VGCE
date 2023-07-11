<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import { VAceEditor } from 'vue3-ace-editor'
	import '@/components/ace-edit'
	import { createPinia } from 'pinia'
	import { useGlobalStore } from '@/stores/global'
	import { useSvgEditLayoutStore } from '@/stores/svg-edit-layout'
	import { useConfigStore } from '@/stores/config'
	import type { IDataModel } from '@/components/svg-editor/types'
	const content = ref('')
	const pinia = createPinia()
	const globalStore = useGlobalStore(pinia)
	const svgEditLayoutStore = useSvgEditLayoutStore(pinia)
	const configStore = useConfigStore(pinia)
	onMounted(() => {
		const export_json: IDataModel = {
			layout_center: svgEditLayoutStore.center_offset,
			config: configStore.$state,
			done_json: globalStore.done_json
		}
		content.value = JSON.stringify(export_json, null, 2)
	})
</script>

<template>
	<v-ace-editor
		v-model:value="content"
		lang="json"
		theme="kr_theme"
		style="height: 400px"
		:options="{
			useWorker: true,
			enableBasicAutocompletion: true,
			enableSnippets: true,
			enableLiveAutocompletion: true
		}"
	/>
</template>
