<script setup lang="ts">
	import SvgEditor from '@/components/svg-editor/index.vue'
	import { useStore } from '@/stores/main'
	import type { IDataModel } from '@/components/svg-editor/types'

	const router = useRouter()
	const store = useStore()

	function preview(d: IDataModel) {
		store.data = d
		router.push('/Preview')
	}
</script>

<template>
	<SvgEditor :data="(store.data && JSON.stringify(store.data)) || ''" @onPreview="preview" saveFile />
</template>
