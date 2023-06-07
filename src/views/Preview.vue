<script setup lang="ts">
	import SvgViewer from '@/components/svg-viewer/index.vue'
	import { useStore } from '@/stores/main'

	const store = useStore()
</script>

<template>
	<svg-viewer :dataModel="store.dataModel" />
</template>

<style lang="less" scoped></style>
