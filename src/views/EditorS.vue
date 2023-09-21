<script setup lang="ts">
	import SvgEditor from '@/components/svg-editor/index.vue'
	import { useStore } from '@/stores/main'
	import type { IDataModel } from '@/components/svg-editor/types'
	import Preview from './Preview.vue'

	const store = useStore()

	const previewShow = ref(false)
	function previewHandle(d: IDataModel) {
		store.data = d
		nextTick(function () {
			previewShow.value = true
		})
	}
</script>

<template>
	<SvgEditor :data="(store.data && JSON.stringify(store.data)) || ''" @onPreview="previewHandle" saveFile />
	<Preview v-if="previewShow" @back="previewShow = false" />
</template>
